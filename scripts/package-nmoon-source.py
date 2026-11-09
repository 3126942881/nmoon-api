"""Archive distributable source only; never include build caches or user secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import sys

root = Path(__file__).resolve().parent.parent
version = json.loads((root / "package.json").read_text(encoding="utf-8"))["version"]
output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / "release-nmoon" / f"windows-{version}"
output.mkdir(parents=True, exist_ok=True)
archive = output / f"NmoonAPI_{version}_source.zip"
folders = ["src", "src-tauri", "crates", "sidecars", "scripts", "public", "docs", ".github", "Casks", "vendor", "tests"]
files = ["package.json", "package-lock.json", "Cargo.toml", "Cargo.lock", "tsconfig.json", "tsconfig.node.json", "vite.config.ts", "index.html", "announcements.json", "remote-config.json", "README.md", "README.en.md", "README.pt-br.md", "CHANGELOG.md", "CHANGELOG.zh-CN.md", "CONTRIBUTING.md", "SECURITY.md", ".gitignore"]
excluded_dirs = {".git", "node_modules", "target", "bin", ".build", "__pycache__", "arms_cache", "electron"}
excluded_suffixes = {".exe", ".dll", ".pdb", ".log", ".dmg", ".deb", ".AppImage", ".zip", ".pem", ".key"}
paths = [root / name for name in files]
for folder in folders:
    for path in (root / folder).rglob("*"):
        relative = path.relative_to(root)
        if path.is_file() and not excluded_dirs.intersection(relative.parts):
            paths.append(path)
count = 0
with ZipFile(archive, "w", ZIP_DEFLATED, compresslevel=6) as bundle:
    for path in sorted(set(paths)):
        if not path.is_file() or path.suffix in excluded_suffixes or path.name.startswith(".env"):
            continue
        bundle.write(path, path.relative_to(root).as_posix())
        count += 1
with ZipFile(archive) as bundle:
    if bundle.testzip() is not None:
        raise RuntimeError("Source archive failed CRC validation")
print(f"Source archive: {archive} ({count} files)")
