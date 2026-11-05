// Writes a brotli copy (file.br) next to every text file in the client build, so
// the Lighthouse preview server (sirv, which sends .br files when it finds them)
// transfers the same bytes as production on Vercel. CI only; the deploy does not use it.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, constants } from "node:zlib";

const ROOT = "build/client";
const TEXT = /\.(html|js|css|json|svg|txt|xml|webmanifest)$/i;

let count = 0;
for (const entry of await readdir(ROOT, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !TEXT.test(entry.name)) continue;
  const file = path.join(entry.parentPath, entry.name);
  const data = await readFile(file);
  await writeFile(`${file}.br`, brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }));
  count++;
}
console.log(`precompress: ${count} files`);
