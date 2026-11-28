import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const index = readFileSync(resolve(here, '../index.html'), 'utf8');
const match = index.match(/<script id="haldo-v160-system-diagnostics">([\s\S]*?)<\/script>/);
assert.ok(match, 'System Diagnostics script block exists');
const registry = { featured: [
  { id: 'system-diagnostics', n: 'HalDo System Diagnostics Pro' },
  { id: 'route-ok', n: 'HalDo Route OK' },
  { id: 'route-missing', n: 'HalDo Route Missing' }
] };
const localData = new Map();
const localStorage = { setItem(k,v){localData.set(k,String(v));}, getItem(k){return localData.has(k)?localData.get(k):null;}, removeItem(k){localData.delete(k);} };
const H = {
  Master:{version:'161.1.0'}, Registry:registry, Win:{open(){}},
  SystemV157:{routes:()=>['system-diagnostics','route-ok','route-missing'],moduleFor:id=>({'system-diagnostics':'SystemDiagnostics','route-ok':'RouteOk','route-missing':'MissingModule'}[id]||null)},
  UpdateCenter:{open(){}},BackupRecovery:{open(){}},DokumentePro:{open(){}},KontaktePro:{open(){}},SystemCenter:{open(){}},MusicStudio:{open(){}},VideoStudio:{open(){}},RouteOk:{open(){}}
};
const window={HalDo:H,localStorage,indexedDB:{},crypto:{subtle:{}},speechSynthesis:{},MediaRecorder:function(){},setTimeout(){}};
const navigator={mediaDevices:{getUserMedia(){}},serviceWorker:{},onLine:true};
const document={getElementById(){return null;}};
runInNewContext(match[1],{window,navigator,document,console,Date});
assert.equal(typeof H.SystemDiagnostics.collect,'function');
assert.equal(typeof H.SystemDiagnostics.report,'function');
const checks=H.SystemDiagnostics.collect(),byName=Object.fromEntries(checks.map(x=>[x.name,x]));
assert.equal(byName['HalDo-Kern'].ok,true);
assert.equal(byName['Doppelte App-IDs'].ok,true);
assert.equal(byName['Dispatcher-Routen'].ok,true);
assert.equal(byName['Dispatcher-Zielmodule'].ok,false);
assert.match(byName['Dispatcher-Zielmodule'].detail,/route-missing/);
assert.equal(byName['Lokaler Speicher'].ok,true);
assert.equal(localData.size,0,'Temporary storage probe cleans up its key');
assert.equal(byName['System Center'].ok,true);
const report=H.SystemDiagnostics.report();
assert.equal(report.product,'HalDo System Diagnostics Pro');
assert.equal(report.summary.total,checks.length);
assert.equal(report.summary.available,checks.filter(x=>x.ok).length);
assert.match(report.scope,/Keine vollständigen fachlichen App- oder Servertests/);
assert.match(match[1],/data-health-refresh/);
assert.match(match[1],/data-health-export/);
assert.match(match[1],/Keine Daten werden hochgeladen/);
console.log('System Diagnostics contract tests passed: runtime APIs, registry, dispatcher resolution, safe storage probe, report schema and UI actions.');
