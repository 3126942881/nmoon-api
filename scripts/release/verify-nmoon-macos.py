"""Verify the actual app, updater archive and mounted DMG on a macOS builder."""
from pathlib import Path
import hashlib
import json
import os
import plistlib
import re
import subprocess
import sys
import tempfile
import time

root = Path(__file__).resolve().parents[2]
arch = sys.argv[1]
target, machine = {'arm64': ('aarch64-apple-darwin', 'arm64'), 'x64': ('x86_64-apple-darwin', 'x86_64')}[arch]
version = json.loads((root / 'package.json').read_text())['version']
bundle = root / 'target' / target / 'release' / 'bundle'
app = bundle / 'macos' / '小月神api.app'

def run(*args):
    return subprocess.check_output(list(map(str, args)), text=True, stderr=subprocess.STDOUT)

def verify_app(directory):
    with (directory / 'Contents/Info.plist').open('rb') as stream:
        info = plistlib.load(stream)
    assert info['CFBundleShortVersionString'] == version, info
    assert info['CFBundleDisplayName'] == '小月神api', info
    assert info['CFBundleIdentifier'] == 'com.jlcodes.cockpit-tools', info
    assert info['LSMinimumSystemVersion'] == '12.0', info
    executable = directory / 'Contents/MacOS' / info['CFBundleExecutable']
    assert run('lipo', '-archs', executable).strip() == machine
    load_commands = run('otool', '-l', executable)
    minimum = re.search(r'\bminos\s+(\S+)', load_commands)
    assert minimum
    min_parts = tuple(map(int, minimum[1].split('.')))
    assert (min_parts + (0, 0, 0))[:3] <= (12, 0, 0), load_commands
    run('codesign', '--verify', '--deep', '--strict', directory)
    signing = run('codesign', '-dv', '--verbose=4', directory)
    assert 'Signature=adhoc' in signing, signing
    # Check that every embedded Mach-O has the requested architecture.
    for file in directory.rglob('*'):
        if not file.is_file() or file.is_symlink():
            continue
        with file.open('rb') as stream:
            magic = stream.read(4)
        if magic in [b'\xcf\xfa\xed\xfe', b'\xce\xfa\xed\xfe', b'\xca\xfe\xba\xbe', b'\xbe\xba\xfe\xca']:
            assert machine in run('lipo', '-archs', file).split(), file
    return hashlib.sha256(executable.read_bytes()).hexdigest()

expected = verify_app(app)
with (app / 'Contents/Info.plist').open('rb') as stream:
    executable_name = plistlib.load(stream)['CFBundleExecutable']
with tempfile.TemporaryFile(mode='w+b') as startup_log:
    process = subprocess.Popen([str(app / 'Contents/MacOS' / executable_name)], stdout=startup_log, stderr=subprocess.STDOUT)
    try:
        time.sleep(12)
        if process.poll() is not None:
            startup_log.seek(0)
            raise RuntimeError('Mac startup smoke test exited early: ' + startup_log.read().decode('utf-8', errors='replace')[-4000:])
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=10)
archives = list((bundle / 'macos').glob('*.app.tar.gz'))
dmgs = list((bundle / 'dmg').glob(f'*_{version}_*.dmg'))
assert len(archives) == 1 and len(dmgs) == 1
archive, dmg = archives[0], dmgs[0]
with tempfile.TemporaryDirectory(prefix='nmoon-mac-verify-') as directory:
    temp = Path(directory)
    extracted = temp / 'archive'
    extracted.mkdir()
    run('tar', '-xzf', archive, '-C', extracted)
    assert verify_app(extracted / app.name) == expected
    run('hdiutil', 'verify', dmg)
    mount = temp / 'mounted'
    mount.mkdir()
    run('hdiutil', 'attach', '-readonly', '-nobrowse', '-mountpoint', mount, dmg)
    try:
        assert verify_app(mount / app.name) == expected
        assert (mount / 'Applications').is_symlink()
        assert os.readlink(mount / 'Applications') == '/Applications'
    finally:
        run('hdiutil', 'detach', mount)
    pubkey = temp / 'updater.pub'
    pubkey.write_text(json.loads((root / 'src-tauri/tauri.conf.json').read_text())['plugins']['updater']['pubkey'])
    print(run('cargo', 'run', '--locked', '--manifest-path', root / 'scripts/release/signature-check/Cargo.toml',
              '--', pubkey, str(archive) + '.sig', archive))
print(json.dumps({'version': version, 'arch': arch, 'minimumSystemVersion': '12.0',
                  'codeSigning': 'ad-hoc', 'appleNotarized': False,
                  'dmgVerified': True, 'updaterSignatureVerified': True, 'startupSmokeTestPassed': True}))
