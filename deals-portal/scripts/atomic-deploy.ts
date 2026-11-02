import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const releasesDir = '/var/www/promoradar.store/releases';
const currentSymlink = '/var/www/promoradar.store/current';
const distDir = '/var/www/affiliate/deals-portal/dist';

const releaseId = `ui_${Date.now()}`;
const targetDir = path.join(releasesDir, releaseId);

console.log(`🚀 Creating release: ${targetDir}...`);
fs.mkdirSync(targetDir, { recursive: true });

// Copy dist into target release
execSync(`cp -r ${distDir}/* ${targetDir}/`);

// Write verification tokens
fs.writeFileSync(path.join(targetDir, 'dcaf1a95-f2a7-42c8-b67f-4a463294ee43.txt'), 'dcaf1a95-f2a7-42c8-b67f-4a463294ee43\n');
fs.writeFileSync(path.join(targetDir, 'admitad-verification.txt'), 'fa9e3fd878\n');

// Atomic symlink switch
if (fs.existsSync(currentSymlink)) {
  fs.unlinkSync(currentSymlink);
}
fs.symlinkSync(targetDir, currentSymlink);
console.log(`🔗 Symlink switched to: ${targetDir}`);

// Keep last 3 releases
const releases = fs.readdirSync(releasesDir)
  .map(name => ({ name, fullPath: path.join(releasesDir, name), time: fs.statSync(path.join(releasesDir, name)).mtimeMs }))
  .sort((a, b) => b.time - a.time);

if (releases.length > 3) {
  for (const old of releases.slice(3)) {
    console.log(`🗑️ Removing old release: ${old.fullPath}`);
    fs.rmSync(old.fullPath, { recursive: true, force: true });
  }
}

// Reload Nginx
execSync('nginx -t && systemctl reload nginx');
console.log('✅ Nginx reloaded successfully!');

