"""Assemble prototype/index.html from src/ (CSS, JS, logos inlined). Run: python prototype/build.py"""
from pathlib import Path
d = Path(__file__).parent; s = d / "src"
page = (s / "shell.html").read_text(encoding="utf-8")
for key, f in [("/*CSS*/", "styles.css"), ("/*JS*/", "app.js"), ("/*LOGO_L*/", "logo_light.b64"), ("/*LOGO_D*/", "logo_dark.b64")]:
    page = page.replace(key, (s / f).read_text(encoding="utf-8"))
head = '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
out = head + page.replace('<a id="top"></a>', '</head>\n<body>\n<a id="top"></a>', 1) + "\n</body>\n</html>\n"
(d / "index.html").write_text(out, encoding="utf-8")
print("built", d / "index.html", len(out), "bytes")
