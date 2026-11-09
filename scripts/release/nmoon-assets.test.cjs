const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { stageRelease } = require('./nmoon-assets.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nmoon-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ['src-tauri', 'bundle', 'docs/releases']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version: '1.3.69' }));
  fs.writeFileSync(path.join(root, 'src-tauri/tauri.conf.json'), JSON.stringify({ version: '1.3.69' }));
  fs.writeFileSync(path.join(root, 'docs/releases/v1.3.69.md'), 'Release notes');
  const installer = path.join(root, 'bundle/App_1.3.69_x64-setup.exe');
  fs.writeFileSync(installer, 'installer bytes');
  fs.writeFileSync(`${installer}.sig`, Buffer.from('signature fixture').toString('base64'));
  return { root, installer, repository: '3126942881/nmoon-api', bundleDir: path.join(root, 'bundle'), outputDir: path.join(root, 'out') };
}

test('stages unchanged signed installer with NSIS target and matching checksum', t => {
  const args = fixture(t);
  const manifest = stageRelease(args);
  const name = 'NmoonAPI_1.3.69_windows-x64-setup.exe';
  assert.equal(manifest.platforms['windows-x86_64-nsis'].url, `https://github.com/3126942881/nmoon-api/releases/download/v1.3.69/${name}`);
  assert.deepEqual(manifest.platforms['windows-x86_64'], manifest.platforms['windows-x86_64-nsis']);
  assert.equal(manifest.platforms['windows-x86_64-msi'], undefined);
  const bytes = fs.readFileSync(path.join(args.outputDir, name));
  assert.deepEqual(bytes, fs.readFileSync(args.installer));
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(fs.readFileSync(path.join(args.outputDir, 'SHA256SUMS.txt'), 'utf8'), `${hash}  ${name}\n`);
  assert.equal(manifest.notes, 'Release notes');
});

test('refuses unsigned installers', t => {
  const args = fixture(t);
  fs.unlinkSync(`${args.installer}.sig`);
  assert.throws(() => stageRelease(args));
  assert.equal(fs.existsSync(args.outputDir), false);
});

test('refuses stale installers and mismatched versions', t => {
  const args = fixture(t);
  fs.writeFileSync(path.join(args.root, 'src-tauri/tauri.conf.json'), '{"version":"1.3.68"}');
  assert.throws(() => stageRelease(args), /versions differ/);
  fs.writeFileSync(path.join(args.root, 'src-tauri/tauri.conf.json'), '{"version":"1.3.69"}');
  fs.renameSync(args.installer, args.installer.replace('1.3.69', '1.3.68'));
  assert.throws(() => stageRelease(args), /Expected one/);
});

test('requires release notes and the maintainer repository', t => {
  const args = fixture(t);
  assert.throws(() => stageRelease({ ...args, repository: 'jlcodes99/cockpit-tools' }), /repository/);
  fs.unlinkSync(path.join(args.root, 'docs/releases/v1.3.69.md'));
  assert.throws(() => stageRelease(args), /release notes/);
});
