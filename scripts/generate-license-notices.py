"""Collect installed production dependency licence texts without modifying them."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
lock = json.loads((ROOT / 'package-lock.json').read_text())
sections = ['Third-party dependency notices\nGenerated from package-lock.json and installed package licence files.\nThis collection may include packages not delivered to browsers.\nRefer to /legal for cubing.js, cubejs, Square-1 and font source/licence information.\n']
missing = []
for relative, entry in sorted(lock['packages'].items()):
    if not relative.startswith('node_modules/') or entry.get('dev'):
        continue
    directory = ROOT / relative
    manifest = directory / 'package.json'
    if not manifest.exists():
        continue
    package = json.loads(manifest.read_text())
    name = package.get('name', relative)
    version = package.get('version', entry.get('version', 'unknown'))
    texts = []
    for file in sorted(directory.iterdir()):
        if file.is_file() and file.name.lower().startswith(('license', 'licence', 'copying', 'notice')):
            try:
                texts.append(f'\n{file.name}\n{file.read_text()}')
            except UnicodeError:
                pass
    extra = ROOT / 'public/licenses/upstream' / (name.replace('@', '').replace('/', '-') + '.txt')
    if extra.exists():
        texts.append('\n' + extra.read_text())
    # Victory ships the relevant vendored licence files below its root.
    if name == 'victory-vendor':
        if not texts:
            missing.append(f'{name}@{version} (root licence provenance; vendored notices included)')
        for file in sorted((directory / 'lib-vendor').glob('*/LICENSE*')):
            texts.append('\n' + str(file.relative_to(directory)) + '\n' + file.read_text())
    if not texts:
        if name == 'cubing':
            texts = ['\nSee /licenses/cubing-MPL-2.0.txt and /legal for exact corresponding source and vendored terms.']
        else:
            missing.append(f'{name}@{version} ({relative})')
            texts = ['\nNo root licence text found; consult the package source for the applicable terms.']
    sections.append('\n' + '=' * 72 + f'\n{name}@{version}\nDeclared licence: {package.get("license", entry.get("license", "not declared"))}\n' + ''.join(texts))
(ROOT / 'public/licenses/runtime-dependencies.txt').write_text('\n'.join(sections))
(ROOT / 'docs/license-follow-up.txt').write_text('Installed production packages lacking a root licence file (manual provenance review required):\n' + '\n'.join(missing) + '\n')
print(f'Collected {len(sections)-1} package notices; {len(missing)} packages need follow-up.')
