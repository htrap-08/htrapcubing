import importlib.util
import json
from pathlib import Path
import unittest
import http.client
import threading
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solver_service', ROOT / 'server.py')
service = importlib.util.module_from_spec(spec)
spec.loader.exec_module(service)


class ValidationTests(unittest.TestCase):
    def test_all_supported_sizes(self):
        for n in range(4, 11):
            state = ''.join(f * n * n for f in 'URFDLB')
            self.assertEqual(service.validate({'n': n, 'state': state}), (n, state))

    def test_rejects_invalid_size_types(self):
        for n in [True, '4', 4.5, 3, 11]:
            with self.assertRaises(ValueError):
                service.validate({'n': n, 'state': 'U' * 96})

    def test_rejects_incomplete_unknown_and_unbalanced_colours(self):
        for state in ['U' * 95, 'X' * 96, 'U' * 96]:
            with self.assertRaises(ValueError):
                service.validate({'n': 4, 'state': state})

    def test_odd_centres_cannot_be_swapped(self):
        for n in [5, 7, 9]:
            state = list(''.join(f * n * n for f in 'URFDLB'))
            a, b = n * n // 2, n * n + n * n // 2
            state[a], state[b] = state[b], state[a]
            with self.assertRaises(ValueError):
                service.validate({'n': n, 'state': ''.join(state)})


class HttpSecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = service.ThreadingHTTPServer(('127.0.0.1', 0), service.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, method, path, body=None, headers=None):
        client = http.client.HTTPConnection(*self.server.server_address, timeout=3)
        client.request(method, path, body=body, headers=headers or {})
        response = client.getresponse()
        status = response.status
        response.read()
        client.close()
        return status

    def test_rejects_browser_post_without_starting_job(self):
        self.assertEqual(self.request('POST', '/api/nxn/solve', '{}', {
            'Origin': 'https://attacker.example', 'Content-Type': 'application/json'}), 403)

    def test_rejects_browser_cancel(self):
        self.assertEqual(self.request('DELETE', '/api/nxn/jobs/' + 'a' * 32, headers={
            'Origin': 'https://attacker.example'}), 403)

    def test_rejects_plain_text_form_post(self):
        self.assertEqual(self.request('POST', '/api/nxn/solve', '{}', {
            'Content-Type': 'text/plain'}), 415)

    def test_server_proxy_request_still_reaches_validation(self):
        state = ''.join(f * 16 for f in 'URFDLB')
        with patch.object(service, 'ready', return_value=False):
            self.assertEqual(self.request('POST', '/api/nxn/solve',
                json.dumps({'n': 4, 'state': state}), {'Content-Type': 'application/json'}), 503)


if __name__ == '__main__':
    unittest.main()
