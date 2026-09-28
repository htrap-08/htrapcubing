"""Install the pinned MIT-licensed solver and its lookup tables locally."""
import concurrent.futures
import gzip
import json
import os
from pathlib import Path
import shutil
import ssl
import subprocess
import time
import urllib.request

ROOT = Path(__file__).resolve().parent
ENGINE = ROOT / '.runtime' / 'engine'
COMMIT = '6c9663d95bc81aadfdc069397902e0b9a163c705'
CTX = ssl.create_default_context(cafile='/etc/ssl/cert.pem' if Path('/etc/ssl/cert.pem').exists() else None)

def fetch_range(url, archive, start, end):
    piece = archive.with_name(archive.name + f'.range-{start}-{end}')
    if piece.exists() and piece.stat().st_size == end - start + 1:
        return piece
    result = subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error',
        '--retry', '5', '--retry-all-errors', '--connect-timeout', '30',
        '--speed-time', '120', '--speed-limit', '1024', '--range', f'{start}-{end}',
        '--output', str(piece), '--write-out', '%{http_code}', url], check=True, capture_output=True, text=True)
    if result.stdout != '206' or piece.stat().st_size != end - start + 1:
        raise RuntimeError('Incomplete download: ' + piece.name)
    return piece


def download(name):
    target = ENGINE / name
    if target.exists():
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    url = 'https://rubiks-cube-lookup-tables.s3.amazonaws.com/' + target.name + '.gz'
    archive = target.with_name(target.name + '.gz.part')
    partial = target.with_name(target.name + '.part')
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, method='HEAD'), context=CTX, timeout=60) as response:
                length = int(response.headers['Content-Length'])
            break
        except OSError:
            if attempt == 4: raise
            time.sleep(2 ** attempt)
    offset = archive.stat().st_size if archive.exists() else 0
    print('Downloading ' + target.name, flush=True)
    block = 8 * 1024 * 1024
    ranges = [(start, min(start + block, length) - 1) for start in range(offset, length, block)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        pieces = list(pool.map(lambda pair: fetch_range(url, archive, *pair), ranges))
    with archive.open('ab') as out:
        for piece in pieces:
            with piece.open('rb') as source:
                shutil.copyfileobj(source, out)
            piece.unlink()
    with gzip.open(archive, 'rb') as source, partial.open('wb') as out:
        shutil.copyfileobj(source, out)
    partial.replace(target)
    archive.unlink()
    print('Ready ' + target.name, flush=True)

if __name__ == '__main__':
    ENGINE.parent.mkdir(parents=True, exist_ok=True)
    if not ENGINE.exists():
        subprocess.run(['git', 'clone', 'https://github.com/dwalton76/rubiks-cube-NxNxN-solver.git', str(ENGINE)], check=True)
    subprocess.run(['git', '-C', str(ENGINE), 'checkout', '--detach', COMMIT], check=True)
    sources = ['ida_search_core.c', 'rotate_xxx.c', 'ida_search_666.c', 'ida_search_777.c', 'ida_search_via_graph.c']
    subprocess.run(['cc', '-O3', '-o', 'ida_search_via_graph', *['rubikscubennnsolver/' + s for s in sources], '-lm'], cwd=ENGINE, check=True)
    os.chmod(ROOT / 'bin' / 'kociemba', 0o755)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(download, json.loads((ROOT / 'tables.json').read_text())))
    print('Solver ready. Start with: npm run solver', flush=True)
