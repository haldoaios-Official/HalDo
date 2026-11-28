import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const tags = [...html.matchAll(/<script\\b([^>]*)>/gi)].map(match => match[1]);
const references = [];
for (const attributes of tags) {
  const src = attributes.match(/\\bsrc\\s*=\\s*(["'])(.*?)\\1/i);
  if (!src) continue;
  const raw = src[2].trim();
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\\/\\/)/i.test(raw)) {
    references.push({ raw, kind: 'external' });
    continue;
  }
  const clean = raw.split(/[?#]/, 1)[0];
  let decoded;
  try { decoded = decodeURIComponent(clean); }
  catch { throw new Error('Ungültige URL-Kodierung im Script-Pfad: ' + raw); }
  const relative = decoded.replace(/^\\/+/, '');
  const absolute = resolve(root, relative);
  assert.ok(absolute === root || absolute.startsWith(root + sep), 'Script-Pfad verlässt das Repository: ' + raw);
  references.push({ raw, path: relative, absolute, kind: 'local', ordered: /\\b(?:async|defer)\\b/i.test(attributes) });
}

const local = references.filter(item => item.kind === 'local');
const missing = local.filter(item => !existsSync(item.absolute));
const seen = new Set();
const duplicates = [];
for (const item of local) {
  if (seen.has(item.path)) duplicates.push(item.path);
  seen.add(item.path);
}
assert.deepEqual(missing.map(item => item.path), [], 'Lokale Script-Dateien fehlen: ' + missing.map(item => item.path).join(', '));
assert.deepEqual(duplicates, [], 'Lokale Script-Dateien werden mehrfach eingebunden: ' + duplicates.join(', '));

for (const required of ['js/haldo-living-identity.js', 'js/haldo-identity-bridge.js', 'js/haldo-welcome-motion.js', 'js/haldo-angel-emblem.js', 'music-studio-pro.js', 'video-studio-pro.js', 'system-center-pro.js']) {
  assert.ok(local.some(item => item.path === required), 'Erwartete lokale Kern-Datei ist nicht in index.html eingebunden: ' + required);
}

const deferred = local.filter(item => item.ordered);
console.log('HalDo dependency contract passed: ' + local.length + ' lokale Script-Referenzen vorhanden, keine fehlenden Dateien oder doppelten Einbindungen; ' + references.filter(item => item.kind === 'external').length + ' externe Script-Referenzen separat erfasst.');
if (deferred.length) console.log('Hinweis: async/defer beeinflusst die Ausführungsreihenfolge: ' + deferred.map(item => item.path).join(', '));
