"""Real solve smoke tests; requires npm run solver:setup and the running site."""
import argparse
import json
from pathlib import Path
import random
import sys
import time
import urllib.request

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from worker import cube_for

parser = argparse.ArgumentParser()
parser.add_argument('--sizes', nargs='+', type=int, default=list(range(4, 11)))
parser.add_argument('--wait-setup', action='store_true')
parser.add_argument('--url', default='http://127.0.0.1:5173')
args = parser.parse_args()


def api(path, payload=None, method=None):
    request = urllib.request.Request(args.url + '/api/nxn/' + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Content-Type': 'application/json'}, method=method)
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response)


for n in args.sizes:
    if args.wait_setup:
        from server import ready
        deadline = time.monotonic() + 1800
        while not ready(n):
            if time.monotonic() > deadline: raise RuntimeError('Setup did not finish')
            time.sleep(2)
    random.seed(9000 + n)
    original = cube_for(n, ''.join(f*n*n for f in 'URFDLB'))
    last = ''
    for _ in range(30 + n * 4):
        face = random.choice([f for f in 'URFDLB' if f != last])
        depth = random.randint(1, n // 2)
        move = face if depth == 1 else face + 'w' if depth == 2 else str(depth) + face + 'w'
        original.rotate(move + random.choice(['', "'", '2']))
        last = face
    state = original.get_kociemba_string(True)
    started = time.monotonic()
    job = api('solve', {'n': n, 'state': state})
    print(f'{n}×{n}: submitted {job["id"]}', flush=True)
    while job['status'] == 'solving':
        if time.monotonic() - started > 660:
            api('jobs/' + job['id'], method='DELETE')
            raise RuntimeError('Integration test exceeded timeout')
        time.sleep(1)
        job = api('jobs/' + job['id'])
    assert job['status'] == 'complete', job
    check = cube_for(n, state)
    for move in job['solution'].split():
        check.rotate(move)
    assert check.solved(), f'{n}: incorrect solution'
    print(f'{n}×{n}: VERIFIED {len(job["solution"].split())} moves in {time.monotonic()-started:.1f}s', flush=True)
