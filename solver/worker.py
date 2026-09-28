"""Solve one colour state in an isolated process, then replay to verify it."""
import importlib
import json
import logging
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
ENGINE = ROOT / '.runtime' / 'engine'
sys.path.insert(0, str(ENGINE))
os.environ['PATH'] = str(ROOT / 'bin') + os.pathsep + os.environ.get('PATH', '')
logging.basicConfig(level=logging.INFO, stream=sys.stderr)


def cube_for(n, state):
    suffix = str(n) * 3 if n <= 7 else ('NNNEven' if n % 2 == 0 else 'NNNOdd')
    cls = getattr(importlib.import_module('rubikscubennnsolver.RubiksCube' + suffix), 'RubiksCube' + suffix)
    return cls(state, 'URFDLB')


def solve(n, state):
    cube = cube_for(n, state)
    cube.sanity_check()
    cube.solve()
    moves = [m for m in cube.solution if not m.startswith('COMMENT')]
    check = cube_for(n, state)
    for move in moves:
        check.rotate(move)
    if not check.solved():
        raise ValueError('The calculated solution did not pass verification.')
    return ' '.join(moves)


if __name__ == '__main__':
    request = json.loads(Path(sys.argv[1]).read_text())
    result_file = Path(sys.argv[2])
    try:
        solution = solve(request['n'], request['state'])
        result = {'status': 'complete', 'solution': solution}
    except Exception:
        logging.exception('Cube solve failed')
        result = {'status': 'error', 'error': 'Unable to solve this colour pattern. Check the face orientation and stickers, then try again.'}
    result_file.write_text(json.dumps(result))
