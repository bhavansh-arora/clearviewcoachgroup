#!/usr/bin/env python3
"""
Static-site builder for the Clearview Coaching Group site.

  _src/pages/*.html     page bodies, starting with  <!--meta {...json...} -->
  _src/partials/*.html  shared pieces, included with {{> name}}

Placeholders:
  {{> partial}}         include _src/partials/partial.html
  {{icon:name}}         inline SVG icon (see ICONS below)
  {{mark}}              the Clearview two-circle mark
  {{page.key}}          a value from the page's meta block
  {{nav:key}}           aria-current="page" when the page's "nav" matches

Run:  python3 _src/build.py      (writes the finished pages next to _src/)
"""
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "_src"
SITE_URL = "https://clearview.codebunny.net"

_S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'

ICONS = {
    "arrow": f'<svg {_S}><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "arrow-ur": f'<svg {_S}><path d="M7 17 17 7M8 7h9v9"/></svg>',
    "arrow-left": f'<svg {_S}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    "arrow-down": f'<svg {_S}><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    "chev": f'<svg {_S}><path d="m6 9 6 6 6-6"/></svg>',
    "plus": f'<svg {_S}><path d="M12 5v14M5 12h14"/></svg>',
    "phone": f'<svg {_S}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    "mail": f'<svg {_S}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
    "pin": f'<svg {_S}><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    "linkedin": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-1.96 1.33-1.96 2.7V21h-4z"/></svg>',
    "instagram": f'<svg {_S}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
    "check": f'<svg {_S}><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    "star": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>',
    "quote": '<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="M20 10C11 13 6 20 6 29v9h14V24h-7c0-5 3-8.5 8-10zM42 10c-9 3-14 10-14 19v9h14V24h-7c0-5 3-8.5 8-10z"/></svg>',
    "clock": f'<svg {_S}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    "lock": f'<svg {_S}><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>',
    "video": f'<svg {_S}><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/></svg>',
    "users": f'<svg {_S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    "briefcase": f'<svg {_S}><rect x="2.5" y="7" width="19" height="13" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2.5 13h19"/></svg>',
    "compass": f'<svg {_S}><circle cx="12" cy="12" r="9.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
    "target": f'<svg {_S}><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    "mic": f'<svg {_S}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></svg>',
    "book": f'<svg {_S}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    "bolt": f'<svg {_S}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    "calendar": f'<svg {_S}><rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/></svg>',
    "gift": f'<svg {_S}><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
    "trend": f'<svg {_S}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>',
    "shield": f'<svg {_S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    "layers": f'<svg {_S}><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>',
    "flag": f'<svg {_S}><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>',
    "spark": '<svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true"><path d="M20 2c1.2 11.6 6.4 16.8 18 18-11.6 1.2-16.8 6.4-18 18-1.2-11.6-6.4-16.8-18-18C13.6 18.8 18.8 13.6 20 2z"/></svg>',
    "copy": f'<svg {_S}><rect x="8" y="8" width="13" height="13" rx="3"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
    "send": f'<svg {_S}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    "globe": f'<svg {_S}><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.5 2.6 3.8 5.8 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-5.8-3.8-9.5S9.5 5.1 12 2.5z"/></svg>',
    "eye": f'<svg {_S}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    "refresh": f'<svg {_S}><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/></svg>',
    "google": '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z"/></svg>',
}

COACHING = {"executive", "career", "interview", "organisations"}

MARK = '<svg class="mark" viewBox="0 0 250 170" aria-hidden="true"><use href="#cv-mark"/></svg>'


def render(text, meta, depth=0):
    if depth > 8:
        raise RuntimeError("include depth exceeded")

    def inc(m):
        name = m.group(1).strip()
        return render((SRC / "partials" / f"{name}.html").read_text(), meta, depth + 1)

    text = re.sub(r"\{\{>\s*([\w-]+)\s*\}\}", inc, text)
    text = re.sub(r"\{\{icon:([\w-]+)\}\}", lambda m: ICONS[m.group(1)], text)
    text = text.replace("{{mark}}", MARK)
    def nav(m):
        key, cur = m.group(1), meta.get("nav")
        hit = cur == key or (key == "coaching" and cur in COACHING)
        return 'aria-current="page"' if hit else ""

    text = re.sub(r"\{\{nav:([\w-]+)\}\}", nav, text)
    text = re.sub(r"\{\{page\.([\w-]+)\}\}", lambda m: str(meta.get(m.group(1), "")), text)
    return text


def bust_cache(html):
    """Append ?v=<content hash> to local CSS/JS so browsers fetch fresh files after each change."""
    def ver(m):
        path = m.group(2)
        f = ROOT / path
        if not f.is_file():
            return m.group(0)
        h = hashlib.md5(f.read_bytes()).hexdigest()[:8]
        return f'{m.group(1)}{path}?v={h}"'

    return re.sub(r'((?:href|src)=")(assets/(?:css|js|vendor)/[\w.-]+\.(?:css|js))"', ver, html)


def build():
    layout = (SRC / "partials" / "layout.html").read_text()
    for page in sorted((SRC / "pages").glob("*.html")):
        raw = page.read_text()
        m = re.match(r"\s*<!--meta\s*(\{.*?\})\s*-->", raw, re.S)
        meta = json.loads(m.group(1)) if m else {}
        body = raw[m.end():] if m else raw
        meta.setdefault("slug", page.name)
        meta["canonical"] = SITE_URL + "/" + ("" if page.name == "index.html" else page.name)
        meta.setdefault("og_image", "assets/img/og-clearview.jpg")
        meta.setdefault("theme", "dark")
        html = render(layout, meta)
        html = html.replace("{{BODY}}", render(body, meta))
        html = bust_cache(html)
        (ROOT / page.name).write_text(html)
        print("built", page.name)


if __name__ == "__main__":
    build()
