const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const REPOSITORY = '3126942881/nmoon-api';
const TARGETS = { arm64: 'aarch64-apple-darwin', x64: 'x86_64-apple-darwin' };
const KEYS = { arm64: ['darwin-aarch64', 'darwin-aarch64-app'], x64: ['darwin-x86_64', 'darwin-x86_64-app'] };
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const names = (version, arch) => {
  const base = `NmoonAPI_${version}_macos-${arch}`;
  return [`${base}.dmg`, `${base}.app.tar.gz`, `${base}.app.tar.gz.sig`];
};

function stageMac({ root, bundleDir, outputDir, arch, commit }) {
  if (!TARGETS[arch]) throw new Error('Unsupported Mac architecture');
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Missing build commit');
  const version = readJson(path.join(root, 'package.json')).version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid release version');
  if (readJson(path.join(root, 'src-tauri/tauri.conf.json')).version !== version) throw new Error('Version mismatch');
  const one = (folder, predicate) => {
    const matches = fs.readdirSync(path.join(bundleDir, folder)).filter(predicate);
    if (matches.length !== 1) throw new Error(`Expected one ${folder} artifact, got ${matches.length}`);
    return path.join(bundleDir, folder, matches[0]);
  };
  const dmg = one('dmg', name => name.endsWith('.dmg') && name.includes(`_${version}_`));
  const archive = one('macos', name => name.endsWith('.app.tar.gz'));
  const signature = fs.readFileSync(`${archive}.sig`, 'utf8').trim();
  if (!/^[A-Za-z0-9+/=]+$/.test(signature)) throw new Error('Missing update signature');
  fs.mkdirSync(outputDir, { recursive: true });
  const files = [dmg, archive, `${archive}.sig`].map((source, index) => {
    const name = names(version, arch)[index];
    fs.copyFileSync(source, path.join(outputDir, name));
    return { name, sha256: hash(source), size: fs.statSync(source).size };
  });
  const manifest = { version, arch, target: TARGETS[arch], sourceCommit: commit, signature, files };
  writeJson(path.join(outputDir, `macos-${arch}.json`), manifest);
  return manifest;
}

function mergeMac({ existing, packagesDir, version, commit }) {
  if (existing.version !== version) throw new Error('Published and built versions differ');
  if (!existing.platforms || !existing.platforms['windows-x86_64-nsis']) throw new Error('Expected existing Windows updater');
  const result = structuredClone(existing);
  const files = [];
  for (const arch of Object.keys(TARGETS)) {
    const part = readJson(path.join(packagesDir, `macos-${arch}.json`));
    if (part.version !== version || part.arch !== arch || part.target !== TARGETS[arch] || part.sourceCommit !== commit) {
      throw new Error('Mac package provenance mismatch');
    }
    const expected = names(version, arch);
    if (part.files.length !== expected.length || part.files.some((file, i) => file.name !== expected[i])) throw new Error('Unexpected package files');
    for (const file of part.files) {
      const local = path.join(packagesDir, file.name);
      if (fs.statSync(local).size !== file.size || hash(local) !== file.sha256) throw new Error(`Checksum mismatch: ${file.name}`);
      files.push(file);
    }
    const signature = fs.readFileSync(path.join(packagesDir, expected[2]), 'utf8').trim();
    if (signature !== part.signature || !/^[A-Za-z0-9+/=]+$/.test(signature)) throw new Error('Signature mismatch');
    const platform = { signature, url: `https://github.com/${REPOSITORY}/releases/download/v${version}/${expected[1]}` };
    for (const key of KEYS[arch]) {
      if (result.platforms[key] && JSON.stringify(result.platforms[key]) !== JSON.stringify(platform)) {
        throw new Error(`Refusing to replace an already published Mac update: ${key}`);
      }
      result.platforms[key] = platform;
    }
  }
  return { manifest: result, files };
}

function publish(root, packagesDir) {
  if (process.env.GH_REPO !== REPOSITORY) throw new Error('Unexpected repository');
  const version = readJson(path.join(root, 'package.json')).version;
  const commit = process.env.GITHUB_SHA;
  if (!/^\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{40}$/.test(commit || '')) throw new Error('Invalid build identity');
  const tag = `v${version}`;
  const gh = args => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const release = () => JSON.parse(gh(['api', `repos/${REPOSITORY}/releases/tags/${tag}`]));
  let published = release();
  if (published.draft || published.prerelease) throw new Error('Publish the Windows stable release first');
  const scratch = path.join(root, '.tmp', 'macos-publish', version);
  fs.mkdirSync(scratch, { recursive: true });
  const download = (name, dir) => {
    fs.mkdirSync(dir, { recursive: true });
    gh(['release', 'download', tag, '--repo', REPOSITORY, '--pattern', name, '--dir', dir, '--clobber']);
    return path.join(dir, name);
  };
  const oldFile = download('latest.json', path.join(scratch, 'original'));
  const originalHash = hash(oldFile);
  const { manifest, files } = mergeMac({ existing: readJson(oldFile), packagesDir, version, commit });
  const checksums = path.join(packagesDir, 'SHA256SUMS-macos.txt');
  fs.writeFileSync(checksums, files.map(file => `${file.sha256}  ${file.name}\n`).join(''));
  const provenance = path.join(packagesDir, 'MACOS-BUILD.json');
  writeJson(provenance, { version, sourceCommit: commit, sourceUrl: `https://github.com/${REPOSITORY}/tree/${commit}`,
    minimumSystemVersion: '12.0', codeSigning: 'ad-hoc', appleNotarized: false, updaterSignature: 'minisign', files });
  const instructions = path.join(packagesDir, 'MACOS-INSTALL.md');
  fs.copyFileSync(path.join(root, 'docs/NMOON-MACOS.md'), instructions);
  const uploads = [...files.map(file => path.join(packagesDir, file.name)), checksums, provenance, instructions];
  for (const file of uploads) {
    const name = path.basename(file);
    const existing = published.assets.find(asset => asset.name === name);
    if (existing) {
      const remote = download(name, path.join(scratch, 'existing'));
      if (hash(remote) !== hash(file)) throw new Error(`Refusing to overwrite published asset: ${name}`);
    } else {
      gh(['release', 'upload', tag, file, '--repo', REPOSITORY]);
    }
  }
  published = release();
  for (const file of uploads) {
    const asset = published.assets.find(asset => asset.name === path.basename(file));
    if (!asset || asset.state !== 'uploaded' || asset.size !== fs.statSync(file).size) throw new Error('Incomplete Mac asset upload');
    if (asset.digest && asset.digest !== `sha256:${hash(file)}`) throw new Error('Published asset digest mismatch');
  }
  // Re-read before replacing the shared manifest; preserve every Windows entry and field.
  if (hash(download('latest.json', path.join(scratch, 'fresh'))) !== originalHash) throw new Error('Updater manifest changed concurrently');
  const next = path.join(packagesDir, 'latest.json');
  writeJson(next, manifest);
  try {
    gh(['release', 'upload', tag, next, '--repo', REPOSITORY, '--clobber']);
  } catch (error) {
    gh(['release', 'upload', tag, oldFile, '--repo', REPOSITORY, '--clobber']);
    throw error;
  }
  if (hash(download('latest.json', path.join(scratch, 'verified'))) !== hash(next)) throw new Error('Published updater verification failed');
  const marker = '<!-- nmoon-macos -->';
  const body = published.body || '';
  const addition = `${marker}\n\n## macOS 安装包\n\n已补充 Apple 芯片（macos-arm64）和 Intel（macos-x64）的 DMG 安装包，最低系统为 macOS 12。打开 DMG 后将“小月神api”拖入“应用程序”。\n\nMac 包使用 ad-hoc 签名，尚未经过 Apple Developer ID 签名和苹果公证；首次打开可能需要在系统“隐私与安全性”中确认允许。更新归档已使用本项目的更新密钥签名。详见附件 MACOS-INSTALL.md。\n\n[Mac 构建源码](https://github.com/${REPOSITORY}/tree/${commit}) · 校验文件：SHA256SUMS-macos.txt。\n`;
  const notes = path.join(scratch, 'release-notes.md');
  fs.writeFileSync(notes, body.includes(marker) ? body : `${body.trim()}\n\n${addition}`);
  gh(['release', 'edit', tag, '--repo', REPOSITORY, '--notes-file', notes]);
  console.log(`Published both Mac packages and verified the combined ${version} updater manifest.`);
}

if (require.main === module) {
  const root = path.resolve(__dirname, '../..');
  const [mode, value] = process.argv.slice(2);
  if (mode === 'stage' && TARGETS[value]) {
    stageMac({ root, bundleDir: path.join(root, 'target', TARGETS[value], 'release/bundle'),
      outputDir: path.join(root, 'release-nmoon', `macos-${value}`), arch: value, commit: process.env.GITHUB_SHA });
    console.log(`Staged macOS ${value}`);
  } else if (mode === 'publish' && value) publish(root, path.resolve(value));
  else throw new Error('Usage: nmoon-macos.cjs stage <arm64|x64> | publish <packages-dir>');
}
module.exports = { stageMac, mergeMac, names, TARGETS };
