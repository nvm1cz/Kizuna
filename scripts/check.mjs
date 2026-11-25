/** Kiểm tra cú pháp mọi file .js và mọi đường dẫn import/href trong public/ đều tồn tại. */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true})
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const publicDir = path.join(root, 'public');
const files = [publicDir, path.join(root, 'scripts'), path.join(root, 'tests')].flatMap(walk).filter(f => /\.m?js$/.test(f));
const missing = [];

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], {stdio: 'inherit'});
  for (const [, target] of fs.readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*\(?['"](\.[^'"]+)['"]/g)) {
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) missing.push(`${path.relative(root, file)} → ${target}`);
  }
}
for (const [, target] of fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8').matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
  if (!fs.existsSync(path.join(publicDir, target))) missing.push(`index.html → ${target}`);
}

if (missing.length) {
  console.error('Đường dẫn không tồn tại:\n' + missing.join('\n'));
  process.exit(1);
}
console.log(`Đã kiểm tra ${files.length} file.`);
