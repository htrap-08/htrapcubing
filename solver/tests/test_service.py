import importlib.util
from pathlib import Path
import unittest

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


if __name__ == '__main__':
    unittest.main()
