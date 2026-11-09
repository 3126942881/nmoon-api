const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { stageMac, mergeMac, names } = require('./nmoon-macos.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nmoon-macos-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const version = '1.3.81';
  const commit = 'a'.repeat(40);
  const packagesDir = path.join(root, 'packages');
  fs.mkdirSync(path.join(root, 'src-tauri'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version }));
  fs.writeFileSync(path.join(root, 'src-tauri/tauri.conf.json'), JSON.stringify({ version }));
  for (const arch of ['arm64', 'x64']) {
    const bundleDir = path.join(root, arch);
    for (const folder of ['macos', 'dmg']) fs.mkdirSync(path.join(bundleDir, folder), { recursive: true });
    fs.writeFileSync(path.join(bundleDir, 'dmg', `App_${version}_${arch}.dmg`), `dmg-${arch}`);
    const archive = path.join(bundleDir, 'macos', 'App.app.tar.gz');
    fs.writeFileSync(archive, `archive-${arch}`);
    fs.writeFileSync(`${archive}.sig`, Buffer.from(`synthetic-signature-${arch}`).toString('base64'));
    stageMac({ root, bundleDir, outputDir: packagesDir, arch, commit });
  }
  const existing = { version, notes: 'existing Windows release notes', pub_date: '2026-11-09T00:00:00Z', extra: { keep: true },
    platforms: { 'windows-x86_64-nsis': { url: 'https://example.test/setup.exe', signature: 'existing-windows-signature' } } };
  return { root, packagesDir, version, commit, existing };
}

test('Mac manifests retain all existing Windows fields and route each CPU to its signed app archive', t => {
  const input = fixture(t);
  const original = structuredClone(input.existing);
  const { manifest, files } = mergeMac(input);
  assert.deepEqual(input.existing, original);
  assert.deepEqual(manifest.platforms['windows-x86_64-nsis'], original.platforms['windows-x86_64-nsis']);
  assert.equal(manifest.notes, original.notes);
  assert.equal(manifest.pub_date, original.pub_date);
  assert.deepEqual(manifest.extra, original.extra);
  for (const [arch, key] of [['arm64', 'aarch64'], ['x64', 'x86_64']]) {
    assert.equal(manifest.platforms[`darwin-${key}-app`].url,
      `https://github.com/3126942881/nmoon-api/releases/download/v1.3.81/${names(input.version, arch)[1]}`);
    assert.deepEqual(manifest.platforms[`darwin-${key}`], manifest.platforms[`darwin-${key}-app`]);
  }
  assert.equal(files.length, 6);
  assert.deepEqual(mergeMac({ ...input, existing: manifest }).manifest, manifest);
});

test('tampered archives cannot enter the public update manifest', t => {
  const input = fixture(t);
  fs.appendFileSync(path.join(input.packagesDir, names(input.version, 'arm64')[1]), 'tampered');
  assert.throws(() => mergeMac(input), /Checksum mismatch/);
});

test('mixing versions, commits or architecture metadata is rejected', t => {
  const input = fixture(t);
  assert.throws(() => mergeMac({ ...input, version: '1.3.82' }), /versions differ/);
  assert.throws(() => mergeMac({ ...input, commit: 'b'.repeat(40) }), /provenance/);
  const file = path.join(input.packagesDir, 'macos-x64.json');
  const part = JSON.parse(fs.readFileSync(file, 'utf8'));
  part.arch = 'arm64'; fs.writeFileSync(file, JSON.stringify(part));
  assert.throws(() => mergeMac(input), /provenance/);
});

test('a mismatched published Mac update cannot be overwritten', t => {
  const input = fixture(t);
  input.existing.platforms['darwin-aarch64-app'] = { url: 'https://example.test/previous.tar.gz', signature: 'previous' };
  assert.throws(() => mergeMac(input), /already published/);
});

test('package metadata cannot select unrelated local files', t => {
  const input = fixture(t);
  const file = path.join(input.packagesDir, 'macos-arm64.json');
  const part = JSON.parse(fs.readFileSync(file, 'utf8'));
  part.files[0].name = '../package.json'; fs.writeFileSync(file, JSON.stringify(part));
  assert.throws(() => mergeMac(input), /Unexpected package files/);
});

test('a missing or inconsistent signature is rejected before publication', t => {
  const input = fixture(t);
  const file = path.join(input.packagesDir, 'macos-x64.json');
  const part = JSON.parse(fs.readFileSync(file, 'utf8'));
  part.signature = Buffer.from('wrong-signature').toString('base64');
  fs.writeFileSync(file, JSON.stringify(part));
  assert.throws(() => mergeMac(input), /Signature mismatch/);
});
