import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['index.html', 'styles.css', 'app.js', 'lib.js', 'favicon.svg', 'share.png'];
for (const file of files) await stat(path.join(root, file));
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
for (const file of files) await cp(path.join(root, file), path.join(root, 'dist', file));
console.log(`Built ${files.length} static files in dist/`);
