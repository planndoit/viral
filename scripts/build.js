import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['index.html', 'styles.css', 'app.js', 'lib.js', 'favicon.svg', 'share.png'];
for (const file of files) await stat(path.join(root, file));
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
for (const file of files) await cp(path.join(root, file), path.join(root, 'dist', file));
// Vercel supplies the current deployment hostname at build time. Keep the
// generated sharing image on that deployment rather than the old Pages host.
const host = process.env.VERCEL_ENV === 'production'
  ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  : process.env.VERCEL_URL;
if (host) {
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error('Invalid Vercel hostname');
  const htmlPath = path.join(root, 'dist', 'index.html');
  const html = await readFile(htmlPath, 'utf8');
  await writeFile(htmlPath, html.replace(/(<meta property="og:image" content=")[^"]+("\s*\/?>)/, `$1https://${host}/share.png$2`));
}
console.log(`Built ${files.length} static files in dist/`);
