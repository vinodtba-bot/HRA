// Builds the static marketing site into dist/. No dependencies: `node build.mjs`.
//   --out <dir>   write somewhere other than dist/
//   --fragment    write index.html without its document wrapper (for hosts that add their own)
import { mkdir, readdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderPage } from './src/layout.mjs';
import { solutions } from './src/solutions.mjs';
import { solutionPage } from './src/solution-page.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args[outIdx + 1] : join(root, 'dist');
const fragment = args.includes('--fragment');

await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'assets'), { recursive: true });

const pages = [];
for (const file of await readdir(join(root, 'src/pages'))) {
  if (file.endsWith('.mjs')) pages.push(await import(pathToFileURL(join(root, 'src/pages', file)).href));
}
for (const s of solutions) pages.push(solutionPage(s));

for (const page of pages) {
  const html = renderPage({ ...page, fragment: fragment && page.path === 'index.html' });
  await writeFile(join(out, page.path), html);
}
for (const file of await readdir(join(root, 'src/assets'))) {
  await copyFile(join(root, 'src/assets', file), join(out, 'assets', file));
}
console.log(`Built ${pages.length} pages into ${out}`);
