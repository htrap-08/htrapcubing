"""Local job service. Bind only to loopback; the website proxies requests here."""
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from uuid import uuid4

ROOT = Path(__file__).resolve().parent
ENGINE = ROOT / '.runtime' / 'engine'
TABLES = json.loads((ROOT / 'tables.json').read_text())
JOBS = {}
LOCK = threading.Lock()
TIMEOUT = 600


def ready():
    return (ENGINE / 'ida_search_via_graph').is_file() and all((ENGINE / f).is_file() for f in TABLES)


def validate(data):
    n, state = data.get('n'), data.get('state')
    if type(n) is not int or not 4 <= n <= 10:
        raise ValueError('Choose a cube size from 4×4 to 10×10.')
    if not isinstance(state, str) or len(state) != 6 * n * n or set(state) - set('URFDLB'):
        raise ValueError('Enter a colour for every sticker.')
    if any(state.count(face) != n * n for face in 'URFDLB'):
        raise ValueError(f'Each colour must appear exactly {n*n} times.')
    if n % 2 and any(state[i*n*n+n*n//2] != face for i, face in enumerate('URFDLB')):
        raise ValueError('Fixed centre colours do not match the selected orientation.')
    return n, state


def stop(process):
    if process and process.poll() is None:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass


def run_job(job_id, n, state):
    with tempfile.TemporaryDirectory(prefix='axiom-solve-') as directory:
        folder = Path(directory)
        (folder / 'lookup-tables').symlink_to(ENGINE / 'lookup-tables', target_is_directory=True)
        (folder / 'ida_search_via_graph').symlink_to(ENGINE / 'ida_search_via_graph')
        request, result = folder / 'request.json', folder / 'result.json'
        request.write_text(json.dumps({'n': n, 'state': state}))
        process = None
        try:
            with (folder / 'solve.log').open('w') as log:
                with LOCK:
                    if JOBS[job_id]['status'] == 'cancelled':
                        return
                    process = subprocess.Popen([sys.executable, str(ROOT / 'worker.py'), str(request), str(result)], cwd=folder, stdout=log, stderr=log, start_new_session=True)
                    JOBS[job_id]['process'] = process
                process.wait(timeout=TIMEOUT)
            output = json.loads(result.read_text()) if result.exists() else {'status': 'error', 'error': 'The solver stopped unexpectedly. Please try again.'}
            if output['status'] == 'error':
                print((folder / 'solve.log').read_text()[-4000:], file=sys.stderr, flush=True)
        except subprocess.TimeoutExpired:
            stop(process)
            output = {'status': 'error', 'error': 'This solve exceeded 10 minutes. Check the colours and try again.'}
        except Exception as exc:
            stop(process)
            print(str(exc), file=sys.stderr, flush=True)
            output = {'status': 'error', 'error': 'The solver could not finish. Please try again.'}
        with LOCK:
            if JOBS[job_id]['status'] != 'cancelled':
                JOBS[job_id].update(output)
            JOBS[job_id].pop('process', None)


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/nxn/health':
            return self.send_json(200, {'ready': ready()})
        job_id = self.path.removeprefix('/api/nxn/jobs/')
        with LOCK:
            job = JOBS.get(job_id)
            response = {k: v for k, v in job.items() if k not in ('process', 'created')} if job else None
        self.send_json(200 if response else 404, response or {'error': 'Solve not found. Please try again.'})

    def do_POST(self):
        if self.path != '/api/nxn/solve':
            return self.send_json(404, {'error': 'Not found.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 4096:
                raise ValueError('Invalid request size.')
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('Invalid request.')
            n, state = validate(data)
        except (ValueError, TypeError):
            return self.send_json(400, {'error': 'Invalid cube colours or size. Check that every colour occurs the correct number of times.'})
        if not ready():
            return self.send_json(503, {'error': 'The larger-cube solver is still being set up. Please try again later.'})
        with LOCK:
            for key in list(JOBS):
                if time.time() - JOBS[key]['created'] > 1200 and JOBS[key]['status'] != 'solving':
                    del JOBS[key]
            if any(j['status'] == 'solving' for j in JOBS.values()):
                return self.send_json(409, {'error': 'The solver is working on another cube. Please try again shortly.'})
            job_id = uuid4().hex
            JOBS[job_id] = {'id': job_id, 'status': 'solving', 'created': time.time()}
        threading.Thread(target=run_job, args=(job_id, n, state), daemon=True).start()
        self.send_json(202, {'id': job_id, 'status': 'solving'})

    def do_DELETE(self):
        job_id = self.path.removeprefix('/api/nxn/jobs/')
        with LOCK:
            job = JOBS.get(job_id)
            if job and job['status'] == 'solving':
                job['status'] = 'cancelled'
                stop(job.get('process'))
        self.send_json(200, {'status': 'cancelled'})


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 5174), Handler)
    print('Cube solver listening on http://127.0.0.1:5174', flush=True)
    try:
        server.serve_forever()
    finally:
        with LOCK:
            for job in JOBS.values():
                stop(job.get('process'))
        server.server_close()
