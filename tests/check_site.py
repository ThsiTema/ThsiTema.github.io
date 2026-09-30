"""Dependency-free structural checks for the static portfolio."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

page = Document()
page.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
errors = []
ids = [attrs['id'] for _, attrs in page.elements if 'id' in attrs]
for value, count in Counter(ids).items():
    if count > 1:
        errors.append(f'Duplicate id: {value}')

assert len([tag for tag, _ in page.elements if tag == 'h1']) == 1, 'Use one h1'
assert any(tag == 'html' and attrs.get('lang') for tag, attrs in page.elements), 'Set document language'
assert any(tag == 'meta' and attrs.get('name') == 'viewport' for tag, attrs in page.elements), 'Set mobile viewport'

for tag, attrs in page.elements:
    if tag == 'img' and 'alt' not in attrs:
        errors.append(f'Image needs alt text: {attrs.get("src")}')
    if attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', '').split():
        errors.append(f'New-tab link needs noopener: {attrs.get("href")}')
    for attr in ('href', 'src'):
        value = attrs.get(attr)
        if not value:
            continue
        url = urlsplit(value)
        if url.scheme or url.netloc:
            continue
        if not url.path and url.fragment and url.fragment not in ids:
            errors.append(f'Unknown anchor: {value}')
        if url.path:
            path = ROOT / unquote(url.path)
            if not path.is_file():
                errors.append(f'Missing local asset: {value}')

pdf = ROOT / 'assets/resume/Artem_Kotenko_Flutter_Developer_Resume.pdf'
assert pdf.read_bytes().startswith(b'%PDF-'), 'Resume must be a valid PDF file'
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: HTML landmarks, {len(ids)} unique anchors, local links/assets, alt attributes, safe new-tab links, and resume file')
