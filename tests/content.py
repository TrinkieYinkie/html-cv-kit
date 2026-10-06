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
    for role in (ROOT / folder / 'content/experience').glob('*.json'):
        data = json.loads(role.read_text(encoding='utf-8'))
        for profile, parts in data['variants'].items():
            selected = [index for indices in parts.values() for index in indices]
            assert sorted(selected) == list(range(len(data['paragraphs']))), f'{role.name}/{profile}: missing or duplicate paragraphs'
    for export in (ROOT / folder / 'exports').glob('*.html'):
        content = export.read_text(encoding='utf-8')
        assert not re.search(r'<script\b|<link\b|<iframe\b', content, re.I), f'External/active content: {export}'
for folder in ['Structured CV template', 'Single file template - your CV']:
    for file in (ROOT / folder).rglob('*'):
        if file.suffix not in ('.html', '.json', '.md'): continue
        value = (visible(file) if file.suffix == '.html' else file.read_text(encoding='utf-8')).lower()
        for identity in ['alisa', 'petrova', 'arcticbeaver', 'arctic-beaver', 'alfa-bank', 'combined ratio', 'revvy', 'devexpress', 'xcritical', '736-73-80', '1,000,000', '4,000']:
            assert identity not in value, f'Personal example leaked into {file}: {identity}'
print('PASS: exact MBA text/order; complete profile paragraph coverage; neutral templates; passive exports')
