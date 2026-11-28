import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
const ids = new Map();
const inline = [];
for (let index = 0; index < tags.length; index += 1) {
  const attributes = tags[index][1];
  const body = tags[index][2];
  const idMatch = attributes.match(/\bid\s*=\s*(["'])(.*?)\1/i);
  const id = idMatch ? idMatch[2] : null;
  if (id) {
    assert.ok(!ids.has(id), 'Doppelte Script-ID: ' + id + ' (Script ' + ids.get(id) + ' und ' + index + ')');
    ids.set(id, index);
  }
  if (!attributes.match(/\bsrc\s*=/i) && body.trim()) {
    try {
      new vm.Script(body, { filename: 'index.html:inline-script-' + index + (id ? ':' + id : '') });
    } catch (error) {
      throw new Error('Inline-Script ' + index + (id ? ' (' + id + ')' : '') + ' enthält einen Syntaxfehler: ' + error.message);
    }
    inline.push({ index, id, bytes: Buffer.byteLength(body, 'utf8') });
  }
}

const srcOrder = new Map();
for (let index = 0; index < tags.length; index += 1) {
  const match = tags[index][1].match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
  if (match) srcOrder.set(match[2].replace(/^\.\/+/, ''), index);
}
const ordered = [
  'js/haldo-living-identity.js',
  'js/haldo-identity-bridge.js',
  'js/haldo-welcome-motion.js',
  'js/haldo-angel-emblem.js'
];
for (let index = 1; index < ordered.length; index += 1) {
  const before = srcOrder.get(ordered[index - 1]);
  const after = srcOrder.get(ordered[index]);
  assert.ok(before !== undefined && after !== undefined, 'Fehlende Identitäts-Komponente in index.html: ' + ordered[index - 1] + ' / ' + ordered[index]);
  assert.ok(before < after, 'Falsche Script-Reihenfolge: ' + ordered[index - 1] + ' muss vor ' + ordered[index] + ' geladen werden');
}
console.log('HalDo inline runtime integrity passed: ' + inline.length + ' Inline-Scripts syntaktisch geprüft, ' + ids.size + ' eindeutige Script-IDs, Identitäts-Ladereihenfolge korrekt.');
