import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, '../app-dependency-monitor-pro.js'), 'utf8');
const registry = { featured: [{ id: 'one', n: 'HalDo One' }, { id: 'one', n: 'HalDo Duplicate' }, { id: 'two', n: 'HalDo Two' }, { id: 'route-ok', n: 'HalDo Routed One' }, { id: 'route-ok-two', n: 'HalDo Routed Two' }] };
const H = {
  Registry: registry,
  Master: { getCategoryApps: () => [{ id: 'existing', name: 'Existing' }] },
  SystemV157: {
    routes: () => ['route-ok', 'route-no-module', 'route-no-target'],
    moduleFor: id => ({ 'route-ok': 'Ready', 'route-ok-two': 'Ready', 'route-no-target': 'Missing' }[id] || null)
  },
  Ready: { open() {} }
};
const window = { HalDo: H };
runInNewContext(source, { window, console, Date, String, Array, Object, Promise, URL });
assert.equal(typeof H.AppDependencyMonitor.analyze, 'function');
assert.equal(typeof H.AppDependencyMonitor.scan, 'function');
assert.equal(typeof H.AppDependencyMonitor.open, 'function');
assert.equal(H.AppDependencyMonitor.version, '1.1.0');

const report = H.AppDependencyMonitor.analyze({
  scripts: [
    { src: '/core.js', status: 'loaded', external: false },
    { src: '/core.js?cache=2', status: 'loaded', external: false },
    { src: 'https://cdn.example/lib.js', status: 'external', external: true },
    { src: '/missing.js', status: 'missing', external: false },
    { src: '/offline.js', status: 'unknown', external: false }
  ],
  apps: registry.featured,
  routes: ['route-ok', 'route-no-module', 'route-no-target', 'route-ok-two'],
  moduleFor: H.SystemV157.moduleFor,
  modules: H
});
assert.equal(report.summary.scriptReferences, 5);
assert.equal(report.summary.localScripts, 4);
assert.equal(report.summary.externalScripts, 1);
assert.equal(report.summary.missingLocalScripts, 1);
assert.equal(report.summary.unknownLocalScripts, 1);
assert.equal(report.summary.duplicateScriptReferences, 1, 'Query strings do not hide duplicate script references');
assert.equal(report.summary.duplicateAppIds, 1);
assert.equal(report.summary.unresolvedRoutes, 2);
assert.equal(report.summary.appModuleDependencies, 5);
assert.equal(report.summary.resolvedAppModuleDependencies, 2);
assert.equal(report.summary.unresolvedAppModuleDependencies, 3);
assert.equal(report.summary.sharedModuleTargets, 1);
assert.deepEqual(JSON.parse(JSON.stringify(report.dependencies.sharedModules[0])), { module: 'Ready', appIds: ['route-ok', 'route-ok-two'] });
assert.equal(report.dependencies.appModules.find(item => item.appId === 'route-ok').dependencyType, 'dispatcher-module');
assert.equal(report.dependencies.appModules.find(item => item.appId === 'route-ok').status, 'resolved');
assert.equal(report.dependencies.appModules.find(item => item.appId === 'one').status, 'unresolved');
assert.equal(report.unresolvedRoutes[0].id, 'route-no-module');
assert.equal(report.unresolvedRoutes[1].id, 'route-no-target');
assert.match(report.scope, /interner Quellcode-Imports/);
assert.equal(H.Registry.featured.some(item => item.id === 'app-dependency-monitor'), true);
assert.equal(H.Master.getCategoryApps('S').some(item => item.id === 'app-dependency-monitor'), true);
assert.equal(H.Master.getCategoryApps('A').some(item => item.id === 'app-dependency-monitor'), false);
console.log('App Dependency Monitor contract tests passed: script inventory, duplicate detection, missing/unknown distinction, registry IDs, app-to-module dependency mapping, shared targets, dispatcher resolution and A–Z registration.');

