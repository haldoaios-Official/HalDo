import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function inspectScriptOrder(html) {
  const tags = [...String(html).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  const scripts = tags.map((match, index) => {
    const attributes = match[1] || '';
    const body = match[2] || '';
    const srcMatch = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const idMatch = attributes.match(/\bid\s*=\s*(["'])(.*?)\1/i);
    const typeMatch = attributes.match(/\btype\s*=\s*(["'])(.*?)\1/i);
    const async = /\basync\b/i.test(attributes);
    const defer = /\bdefer\b/i.test(attributes);
    const module = Boolean(typeMatch && typeMatch[2].toLowerCase() === 'module');
    let execution = 'parser-blocking';
    if (async) execution = 'async';
    else if (defer || module) execution = 'defer';
    return {
      index: index + 1,
      id: idMatch ? idMatch[2] : '',
      src: srcMatch ? srcMatch[2].trim() : '',
      inline: !srcMatch && body.trim().length > 0,
      execution
    };
  });
  const constraints = [
    ['three.js', 'OrbitControls.js'],
    ['three.js', 'GLTFLoader.js'],
    ['three.js', 'DRACOLoader.js'],
    ['js/haldo-living-identity.js', 'js/haldo-identity-bridge.js'],
    ['js/haldo-identity-bridge.js', 'js/haldo-welcome-motion.js'],
    ['js/haldo-welcome-motion.js', 'js/haldo-angel-emblem.js']
  ];
  const orderViolations = [];
  for (const [beforeName, afterName] of constraints) {
    const before = scripts.findIndex(item => item.src.includes(beforeName));
    const after = scripts.findIndex(item => item.src.includes(afterName));
    if (before === -1 || after === -1) {
      orderViolations.push({ before: beforeName, after: afterName, reason: 'missing-script' });
    } else if (before >= after) {
      orderViolations.push({ before: beforeName, after: afterName, reason: 'wrong-order' });
    }
  }
  const monitorIndex = scripts.findIndex(item => item.id === 'haldo-v167-runtime-error-monitor');
  const inlineBeforeMonitor = monitorIndex < 0
    ? scripts.filter(item => item.inline).length
    : scripts.slice(0, monitorIndex).filter(item => item.inline).length;
  return {
    scripts,
    orderViolations,
    unorderedScripts: scripts.filter(item => item.execution === 'async' || item.execution === 'defer'),
    runtimeMonitorFound: monitorIndex >= 0,
    inlineBeforeMonitor,
    runtimeMonitorScriptIndex: monitorIndex < 0 ? null : monitorIndex + 1
  };
}

function testFixture() {
  const fixture = `
    <script src="three.js"></script>
    <script src="OrbitControls.js"></script>
    <script async src="analytics.js"></script>
    <script defer src="later.js"></script>
    <script id="haldo-v167-runtime-error-monitor">window.monitor = true;</script>
    <script>window.afterMonitor = true;</script>
  `;
  const report = inspectScriptOrder(fixture);
  assert.equal(report.scripts.length, 6);
  assert.equal(report.scripts[0].execution, 'parser-blocking');
  assert.equal(report.scripts[2].execution, 'async');
  assert.equal(report.scripts[3].execution, 'defer');
  assert.equal(report.inlineBeforeMonitor, 0);
  assert.equal(report.runtimeMonitorFound, true);
  assert.equal(report.orderViolations.length, 0);

  const reversed = inspectScriptOrder('<script src="OrbitControls.js"></script><script src="three.js"></script>');
  assert.ok(reversed.orderViolations.some(item => item.reason === 'wrong-order'));
  const missingMonitor = inspectScriptOrder('<script>boot();</script>');
  assert.equal(missingMonitor.runtimeMonitorFound, false);
  assert.equal(missingMonitor.inlineBeforeMonitor, 1);
}

testFixture();

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const report = inspectScriptOrder(html);
assert.deepEqual(report.orderViolations, [], 'Statische Script-Abhängigkeiten fehlen oder stehen in falscher Reihenfolge: ' + JSON.stringify(report.orderViolations));
assert.ok(report.runtimeMonitorFound, 'Runtime Error Monitor muss im Hauptdokument vorhanden sein');

console.log('HalDo Script Load Order Audit: ' + report.scripts.length + ' Script-Blöcke geprüft.');
console.log('Ausführungsarten: ' + report.scripts.filter(item => item.execution === 'parser-blocking').length + ' parser-blocking, ' + report.scripts.filter(item => item.execution === 'async').length + ' async, ' + report.scripts.filter(item => item.execution === 'defer').length + ' defer/module.');
console.log('Statische Abhängigkeitsreihenfolge: OK; Fixture-Regressionen: OK.');
if (report.unorderedScripts.length) {
  console.log('Hinweis: async/defer-Skripte haben keine einfache Parser-Reihenfolge: ' + report.unorderedScripts.map(item => item.src || item.id || ('inline#' + item.index)).join(', '));
}
if (report.inlineBeforeMonitor) {
  console.log('ABDECKUNGSHINWEIS: ' + report.inlineBeforeMonitor + ' Inline-Skripte stehen vor dem Runtime Error Monitor (Script #' + report.runtimeMonitorScriptIndex + '). Fehler aus diesen frühen Blöcken werden durch diesen Monitor nicht rückwirkend erfasst.');
}
