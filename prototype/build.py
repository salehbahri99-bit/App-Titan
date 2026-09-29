"""Assemble prototype/index.html (public site) and prototype/admin.html (dashboard) from src/.
CSS, JS and logos are inlined so each page is a single file. Run: python prototype/build.py"""
from pathlib import Path
d = Path(__file__).parent; s = d / "src"
read = lambda *names: "\n".join((s / n).read_text(encoding="utf-8") for n in names)
head = '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
pages = {
    "index.html": ("shell.html", ["tokens.css", "styles.css"], ["shared.js", "cms.js", "app.js"]),
    "admin.html": ("admin/shell.html", ["tokens.css", "admin/admin.css"], ["shared.js", "cms.js", "admin/core.js", "admin/pages.js", "admin/assistant.js"]),
}
for out_name, (shell, css, js) in pages.items():
    page = read(shell)
    for key, val in [("/*CSS*/", read(*css)), ("/*JS*/", read(*js)), ("/*LOGO_L*/", read("logo_light.b64")), ("/*LOGO_D*/", read("logo_dark.b64"))]:
        page = page.replace(key, val)
    out = head + page.replace('<a id="top"></a>', '</head>\n<body>\n<a id="top"></a>', 1) + "\n</body>\n</html>\n"
    (d / out_name).write_text(out, encoding="utf-8")
    print("built", d / out_name, len(out), "chars")
