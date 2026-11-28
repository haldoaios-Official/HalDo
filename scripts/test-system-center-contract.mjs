import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, '../system-center-pro.js'), 'utf8');
const index = readFileSync(resolve(here, '../index.html'), 'utf8');

const categories = {
  A: { name: 'HalDo AI', icon: '🤖', count: 10 },
  S: { name: 'HalDo System', icon: '⚙️', count: 12 }
};
let fallbackLaunchCalls = 0;
const H = {
  Launch(app) { fallbackLaunchCalls += 1; return app.id; },
  Win: { open() {} },
  Registry: {
    featured: [
      { id: 'native-demo', n: 'Native Demo', i: '🧪' },
      { id: 'dedicated-demo', n: 'Dedicated Demo', i: '🧰' },
      { id: 'generic-demo', n: 'Generic Demo', i: '📦' },
      { id: 'route-demo', n: 'Route Demo', i: '🛣️' },
      { id: 'missing-demo', n: 'Missing Demo', i: '❔' }
    ],
    getCategories: () => categories,
    totalCount: () => 22
  },
  Master: {
    version: '166.0.0',
    getCategoryApps(letter) {
      if (letter === 'A') return [{ id: 'native-demo', name: 'Native Demo' }];
      if (letter === 'S') return [{ id: 'native-demo', name: 'Native Demo' }];
      return [];
    },
    getCategoryCatalogApps(letter) {
      if (letter === 'A') return [
        { id: 'native-demo', name: 'Native Demo', icon: '🧪', registered: true },
        { id: 'planned-demo', name: 'Name noch offen', icon: '📦', registered: false }
      ];
      if (letter === 'S') return [{ id: 'native-demo', name: 'Native Demo', icon: '🧪', registered: true }];
      return [];
    }
  },
  SystemV157: {
    routes: () => ['route-demo'],
    getVersion: () => '166.0.0'
  },
  MusicStudio: { __nativePro: true },
  VideoStudio: { __nativePro: true }
};
H['native-demo'] = { __nativePro: true, open() {} };
H['dedicated-demo'] = { open() {} };
H['generic-demo'] = { open: function haldo_gen_placeholder() {} };

const window = { HalDo: H, setTimeout() {} };
const document = { title: 'HalDo AI OS Pro Max – Master Build v166' };
runInNewContext(source, { window, document, console, URL, Blob, HTMLCanvasElement: function () {} });

assert.equal(typeof H.SystemCenter.open, 'function', 'System Center open() is registered');
assert.equal(H['system-center'], H.SystemCenter, 'App-ID points to the System Center module');
let systemCenterOpenCalls = 0;
H.SystemCenter.open = () => { systemCenterOpenCalls += 1; };
H.Launch({ id: 'system-center', n: 'HalDo System Center Pro' });
assert.equal(systemCenterOpenCalls, 1, 'Launcher opens the real System Center module');
assert.equal(H.Launch({ id: 'native-demo' }), 'native-demo', 'Other app launches preserve the previous launcher');
assert.equal(fallbackLaunchCalls, 1, 'Previous launcher is called for non-System-Center apps');
assert.ok(H.Registry.featured.some(app => app.id === 'system-center'), 'System Center is in the featured registry');
assert.equal(H.Master.getCategoryApps('S').some(app => app.id === 'system-center'), true, 'System Center is assigned to category S');

const inventory = H.SystemCenter.inventory();
const byId = Object.fromEntries(inventory.map(app => [app.id, app]));
assert.equal(byId['native-demo'].status, 'native');
assert.equal(byId['dedicated-demo'].status, 'dedicated');
assert.equal(byId['generic-demo'].status, 'generic');
assert.equal(byId['route-demo'].status, 'route');
assert.equal(byId['missing-demo'].status, 'missing');
assert.deepEqual(Array.from(byId['missing-demo'].categories), [], 'Unassigned registry apps have an explicit empty category list');
assert.ok(byId['planned-demo'], 'Unregistered A–Z catalogue IDs are included in the inventory');
assert.equal(byId['planned-demo'].name, 'Name noch offen', 'Unknown app names are not invented');
assert.equal(byId['planned-demo'].status, 'missing', 'Unregistered catalogue IDs are clearly marked as missing modules');
assert.equal(byId['planned-demo'].catalogOnly, true);
assert.equal(byId['native-demo'].category, 'A');
assert.deepEqual(Array.from(byId['native-demo'].categories), ['A', 'S'], 'Every category assignment is retained for a multiply assigned app');
assert.match(source, /!item\.catalogOnly && item\.status !== 'missing'/, 'Catalogue-only IDs are visible but never offered a fake launch action');
assert.match(source, /Planplätze ohne Katalog-ID/, 'Unassigned plan slots are labelled accurately');
assert.match(source, /registryWithoutCategory,'Registry-Apps ohne Kategorie'/, 'Registered apps outside the A-Z catalogue are counted');
assert.match(source, /Vollständiges A–Z-App-Inventar/, 'Inventory heading includes planned catalogue entries');
assert.match(source, /-category.*Alle A–Z-Kategorien.*Ohne Kategorie/, 'Inventory exposes A-Z and unassigned-category filters');
assert.match(source, /categoryFilter\.addEventListener\('change',render\)/, 'Changing the category filter refreshes the inventory');
assert.match(source, /categoryFilter\.value === 'all' \|\| \(categoryFilter\.value === 'none' \? item\.categories\.length === 0 : item\.categories\.indexOf\(categoryFilter\.value\) !== -1\)/, 'Category filter supports both assigned letters and the unassigned registry list');
assert.match(source, /item\.categories\.join\(' · '\)/, 'Inventory displays all category assignments for each app');
assert.equal(byId['system-center'].category, 'S');
const planAudit = H.SystemCenter.plan();
assert.equal(planAudit.planned, 22);
assert.equal(planAudit.catalogAssignments, 3, 'Category assignment count includes repeated placement across different categories');
assert.equal(planAudit.catalogUnique, 2, 'Unique catalogue IDs are counted without double counting');
assert.equal(planAudit.registeredInCatalog, 1, 'Registry overlap is reported explicitly');
assert.equal(planAudit.unassignedPlanSlots, 19, 'Unassigned plan slots remain visible as a gap');
assert.equal(H.Registry.totalCount(), 22, 'The planned slot count is preserved');
assert.match(index, /<script src="system-center-pro\.js"><\/script>/, 'System Center script is included in index.html');
assert.ok(index.indexOf('<script src="video-studio-pro.js"></script>') < index.indexOf('<script src="system-center-pro.js"></script>'), 'System Center loads after the studio modules');

console.log('System Center contract tests passed: registration, category, launcher routing, fallback preservation, all five inventory states, catalogue reconciliation metrics, plan count and script order.');
