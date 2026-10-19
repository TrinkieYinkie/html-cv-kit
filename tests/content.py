"""Source fidelity and neutral-template checks. Python standard library only."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.body = False
        self.skip = 0
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'body': self.body = True
        if tag in ('style', 'script', 'template'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('style', 'script', 'template'): self.skip -= 1
        if tag == 'body': self.body = False
    def handle_data(self, value):
        if self.body and not self.skip and value.strip(): self.parts.append(value.strip())

def visible(path):
    parser = VisibleText()
    parser.feed(path.read_text(encoding='utf-8'))
    return re.sub(r'\s+', ' ', ' '.join(parser.parts)).strip()

source = ROOT / 'Single file example - Alisa Petrova CV/cv.html'
structured = ROOT / 'Structured CV example - Alisa Petrova/exports/mba-classic.html'
assert visible(source) == visible(structured), 'Structured MBA changed the original visible text or its order'
for folder in ['Structured CV example - Alisa Petrova', 'Structured CV template']:
    project = ROOT / folder
    roles = {file.stem: json.loads(file.read_text(encoding='utf-8')) for file in (project / 'content/experience').glob('*.json')}
    for profile_file in (project / 'content/profiles').glob('*.json'):
        profile = json.loads(profile_file.read_text(encoding='utf-8'))
        assert len(profile['pages']) == 2, f'{profile_file}: expected two explicit pages'
        chosen = {}
        for page in profile['pages']:
            for selection in page['experience']:
                role = roles[selection['file']]
                part = selection['part']
                assert part in role['parts'], f'Unknown role part: {selection}'
                parts = chosen.setdefault(selection['file'], {})
                assert part not in parts, f'Repeated role part: {selection}'
                indices = role['variants'][profile_file.stem][part]
                assert indices and all(type(i) is int and 0 <= i < len(role['paragraphs']) for i in indices), f'Invalid paragraph selection: {selection}'
                parts[part] = indices
        for name, parts in chosen.items():
            selected = [i for indices in parts.values() for i in indices]
            assert len(selected) == len(set(selected)), f'{name}/{profile_file.stem}: repeated paragraph across pages'
            assert set(parts) == set(roles[name]['variants'][profile_file.stem]), f'{name}: unused profile part'
    # Alternative commercial wording is intentionally selective. The two legacy
    # profiles must still cover the same facts; exact MBA fidelity is checked above.
    for name, role in roles.items():
        if 'mba' in role['variants']:
            legacy = {key: sorted(i for values in role['variants'][key].values() for i in values) for key in ['mba', 'team-lead']}
            assert legacy['mba'] == legacy['team-lead'], f'{name}: legacy profile facts diverged'
    for export in (ROOT / folder / 'exports').glob('*.html'):
        content = export.read_text(encoding='utf-8')
        assert not re.search(r'<script\b|<link\b|<iframe\b', content, re.I), f'External/active content: {export}'
for folder in ['Structured CV template', 'Single file template - your CV']:
    for file in (ROOT / folder).rglob('*'):
        if file.suffix not in ('.html', '.json', '.md'): continue
        value = (visible(file) if file.suffix == '.html' else file.read_text(encoding='utf-8')).lower()
        for identity in ['alisa', 'petrova', 'arcticbeaver', 'arctic-beaver', 'alfa-bank', 'combined ratio', 'revvy', 'devexpress', 'xcritical', '736-73-80', '1,000,000', '4,000']:
            assert identity not in value, f'Personal example leaked into {file}: {identity}'
print('PASS: exact MBA text/order; valid unique profile selections; matching legacy facts; neutral templates; passive exports')
