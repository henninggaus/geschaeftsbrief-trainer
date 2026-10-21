import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP = new Set(['sw.js']);

/** Ersetzt die Platzhalter im Service Worker durch Dateiliste und Cache-Version. */
export function injectPrecache(source, files, version) {
  if (!source.includes('self.__PRECACHE_MANIFEST__') || !source.includes('__CACHE_VERSION__')) {
    throw new Error('sw.js enthält die Precache-Platzhalter nicht.');
  }
  const urls = ['./', ...files.filter((f) => !SKIP.has(f)).map((f) => `./${f}`)];
  return source
    .replace('self.__PRECACHE_MANIFEST__', JSON.stringify([...new Set(urls)].sort()))
    .replace('__CACHE_VERSION__', version);
}

export function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

/** Vite-Plugin: schreibt nach dem Build alle Dateien aus dist/ in den Precache. */
export function swPrecache() {
  let outDir;
  return {
    name: 'sw-precache',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir.startsWith('/') ? config.build.outDir : join(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = listFiles(outDir).map((f) => relative(outDir, f).split(sep).join('/'));
      const hash = createHash('sha256');
      files.filter((f) => !SKIP.has(f)).sort().forEach((f) => hash.update(f).update(readFileSync(join(outDir, f))));
      const swPath = join(outDir, 'sw.js');
      const source = readFileSync(swPath, 'utf8');
      writeFileSync(swPath, injectPrecache(source, files, hash.digest('hex').slice(0, 12)));
    },
  };
}
