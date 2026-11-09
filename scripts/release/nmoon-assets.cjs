const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function stageRelease({ root, repository, bundleDir, outputDir, now = new Date() }) {
  if (repository !== '3126942881/nmoon-api') throw new Error('Unexpected release repository');
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Use a stable numeric version');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
  if (config.version !== version) throw new Error('Package and Tauri versions differ');
  const candidates = fs.readdirSync(bundleDir).filter(name => name.endsWith('.exe') && name.includes(`_${version}_`) && name.includes('x64'));
  if (candidates.length !== 1) throw new Error(`Expected one ${version} x64 installer; found ${candidates.length}`);
  const source = path.join(bundleDir, candidates[0]);
  const signature = fs.readFileSync(`${source}.sig`, 'utf8').trim();
  if (!signature || !/^[A-Za-z0-9+/=]+$/.test(signature)) throw new Error('Missing or invalid updater signature');
  const filename = `NmoonAPI_${version}_windows-x64-setup.exe`;
  const releaseUrl = `https://github.com/${repository}/releases`;
  const platform = { signature, url: `${releaseUrl}/download/v${version}/${filename}` };
  const notesFile = path.join(root, 'docs/releases', `v${version}.md`);
  if (!fs.existsSync(notesFile)) throw new Error(`Write release notes first: ${notesFile}`);
  const notes = fs.readFileSync(notesFile, 'utf8');
  const manifest = {
    version, notes, pub_date: now.toISOString(), html_url: `${releaseUrl}/tag/v${version}`,
    platforms: { 'windows-x86_64': platform, 'windows-x86_64-nsis': platform },
  };
  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(source, path.join(outputDir, filename));
  fs.writeFileSync(path.join(outputDir, `${filename}.sig`), `${signature}\n`);
  fs.writeFileSync(path.join(outputDir, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  fs.writeFileSync(path.join(outputDir, 'SHA256SUMS.txt'), `${hash}  ${filename}\n`);
  return manifest;
}

if (require.main === module) {
  const root = path.resolve(__dirname, '../..');
  const targetRoot = process.env.CARGO_TARGET_DIR || path.join(root, 'target');
  const manifest = stageRelease({
    root, repository: process.env.GITHUB_REPOSITORY || '3126942881/nmoon-api',
    bundleDir: process.env.NMOON_BUNDLE_DIR || path.join(targetRoot, 'release/bundle/nsis'),
    outputDir: path.join(root, 'release-nmoon'),
  });
  console.log(`Staged Nmoon API ${manifest.version} signed Windows release`);
}
module.exports = { stageRelease };
