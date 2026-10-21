import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { injectPrecache } from '../build/sw-precache.js';

const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('PWA', () => {
  it('setzt Dateiliste und Version in den Service Worker ein', () => {
    const out = injectPrecache(sw, ['index.html', 'assets/app-123.js', 'sw.js', 'icons/icon.svg'], 'abc123');
    expect(out).toContain("din5008-trainer-abc123");
    expect(out).toContain('["./","./assets/app-123.js","./icons/icon.svg","./index.html"]');
    expect(out).not.toContain('./sw.js');
    expect(() => injectPrecache('console.log(1)', [], 'x')).toThrow();
  });

  it('Manifest ist installierbar und nutzt relative Pfade', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./');
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    for (const icon of manifest.icons) {
      expect(() => readFileSync(new URL(`../public/${icon.src}`, import.meta.url))).not.toThrow();
    }
  });

  it('index.html sperrt Suchmaschinen aus und enthält den Privat-Hinweis', () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(html).toContain('Private Lern-App zu Übungszwecken (nicht-kommerziell)');
    expect(html).toContain('rel="manifest"');
  });
});
