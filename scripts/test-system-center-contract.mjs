import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, '../system-center-pro.js'), 'utf8');
const index = readFileSync(resolve(here, '../index.html'), 'utf8');
const musicStudio = readFileSync(resolve(here, '../music-studio-pro.js'), 'utf8');
const videoStudio = readFileSync(resolve(here, '../video-studio-pro.js'), 'utf8');
const humanEngine = readFileSync(resolve(here, '../js/haldo-human-3d-engine.js'), 'utf8');
const livingIdentity = readFileSync(resolve(here, '../js/haldo-living-identity.js'), 'utf8');
const aiAvatar = readFileSync(resolve(here, '../ai-avatar.js'), 'utf8');
const avatarWidget = readFileSync(resolve(here, '../avatar.js'), 'utf8');
const humanPage = readFileSync(resolve(here, '../human.html'), 'utf8');
const avatarTestPage = readFileSync(resolve(here, '../avatar-test.html'), 'utf8');

const categories = {
  A: { name: 'HalDo AI', icon: '🤖', count: 10 },
  S: { name: 'HalDo System', icon: '⚙️', count: 12 }
};
let fallbackLaunchCalls = 0;
const H = {
  Launch(app) { fallbackLaunchCalls += 1; const target = this[app.id]; if (target && typeof target.open === 'function') return target.open(); return app.id; },
  Win: { open() {} },
  Registry: {
    featured: [
      { id: 'native-demo', n: 'Native Demo', i: '🧪', purpose:'Demonstrates a native module', description:'A test application with a native runtime module.', features:['Module launch','Runtime inspection'] },
      { id: 'dedicated-demo', n: 'Dedicated Demo', i: '🧰' },
      { id: 'generic-demo', n: 'Generic Demo', i: '📦' },
      { id: 'route-demo', n: 'Route Demo', i: '🛣️' },
      { id: 'route-ready-demo', n: 'Route Ready Demo', i: '🧭' },
      { id: 'unrouted-demo', n: 'Module Unrouted Demo', i: '🧩' },
      { id: 'geo-quiz', n: 'Geo Quiz', i: '🗺️' },
      { id: 'scientific', n: 'Scientific Calculator', i: '🔬' },
      { id: 'breathing', n: 'Breathing Exercise', i: '🫁' },
      { id: 'missing-demo', n: 'Missing Demo', i: '❔' },
      { id: 'dynamic-demo', n: 'Dynamic Category Demo', i: '🧩' },
      { id: 'language-voice', n: 'Language Voice', i: '🗣️' },
      { id: 'ai-voice-core', n: 'AI Voice Core', i: '🎙️' },
      { id: 'system-diagnostics', n: 'System Diagnostics', i: '🛡️' }
    ],
    getCategories: () => categories,
    totalCount: () => 22
  },
  Master: {
    version: '166.0.0',
    getCategoryApps(letter) {
      if (letter === 'A') return [{ id: 'native-demo', name: 'Native Demo' }, { id: 'dynamic-demo', name: 'Dynamic Category Demo' }, { id: 'unrouted-demo', name: 'Module Unrouted Demo' }];
      if (letter === 'S') return [{ id: 'native-demo', name: 'Native Demo' }];
      return [];
    },
    getCategoryCatalogApps(letter) {
      if (letter === 'A') return [
        { id: 'native-demo', name: 'Native Demo', icon: '🧪', registered: true },
        { id: 'planned-demo', name: 'Name noch offen', icon: '📦', registered: false, description:'A catalogue-only test description.' }
      ];
      if (letter === 'S') return [{ id: 'native-demo', name: 'Native Demo', icon: '🧪', registered: true }];
      return [];
    }
  },
  SystemV157: {
    routes: () => ['route-demo', 'route-ready-demo', 'geo-quiz', 'language-voice', 'ai-voice-core', 'system-diagnostics', 'scientific', 'breathing'],
    moduleFor: id => ({'route-ready-demo':'RouteReadyModule','geo-quiz':'GeoQuizModule','language-voice':'LanguageVoiceStudio','ai-voice-core':'VoiceCore','system-diagnostics':'SystemDiagnostics','scientific':'Calc','breathing':'MentalHealth'}[id] || null),
    getVersion: () => '166.0.0'
  },
  MusicStudio: { __nativePro: true },
  VideoStudio: { __nativePro: true }
};
H['native-demo'] = { __nativePro: true, open() { return 'native-demo'; } };
H['dedicated-demo'] = { open() {} };
H['generic-demo'] = { open: function haldo_gen_placeholder() {} };
H.RouteReadyModule = { open() {} };
H.UnroutedDemo = { open() {} };
H.GeoQuizModule = { open() {} };
H.LanguageVoiceStudio = { open() {} };
H.VoiceCore = { open() {} };
H.SystemDiagnostics = { open() {} };
H.Calc = { open() {} };
H.MentalHealth = { open() {} };
H['dynamic-demo'] = { open() {} };
H['geo-quiz'] = { open: function haldo_gen_geo_quiz_placeholder() {} };

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
assert.equal(fallbackLaunchCalls, 2, 'Previous central launcher is preserved for both System Center and other apps');
assert.match(source, /if \(typeof previousLaunch === 'function'\) return previousLaunch\.apply\(this, arguments\);/, 'System Center does not bypass the central launcher or welcome experience');
assert.ok(H.Registry.featured.some(app => app.id === 'system-center'), 'System Center is in the featured registry');
assert.equal(H.Master.getCategoryApps('S').some(app => app.id === 'system-center'), true, 'System Center is assigned to category S');

const inventory = H.SystemCenter.inventory();
const byId = Object.fromEntries(inventory.map(app => [app.id, app]));
assert.equal(byId['native-demo'].status, 'native');
assert.equal(byId['dedicated-demo'].status, 'dedicated');
assert.equal(byId['generic-demo'].status, 'generic');
assert.equal(byId['route-demo'].status, 'route');
assert.equal(byId['route-ready-demo'].status, 'routeReady', 'A route alias with a real open() target is recognized as ready');
assert.equal(byId['route-ready-demo'].module, 'RouteReadyModule', 'The resolved launcher target is visible in the inventory');
assert.equal(byId['unrouted-demo'].status, 'moduleUnrouted', 'A PascalCase module without a dispatcher route is reported separately');
assert.equal(byId['unrouted-demo'].module, 'UnroutedDemo');
assert.equal(byId['geo-quiz'].status, 'routeReady', 'A real dispatcher target takes precedence over a direct generic fallback');
assert.equal(byId['geo-quiz'].module, 'GeoQuizModule');
for (const [id, moduleName] of [['language-voice','LanguageVoiceStudio'],['ai-voice-core','VoiceCore'],['system-diagnostics','SystemDiagnostics'],['scientific','Calc'],['breathing','MentalHealth']]) {
  assert.equal(byId[id].status, 'routeReady', 'Post-v157 launcher wrapper target is recognized: ' + id);
  assert.equal(byId[id].module, moduleName);
}
assert.deepEqual(Array.from(byId['dynamic-demo'].categories), ['A'], 'Later category extensions are included from getCategoryApps');
assert.equal(byId['missing-demo'].status, 'missing');
assert.deepEqual(Array.from(byId['missing-demo'].categories), [], 'Unassigned registry apps have an explicit empty category list');
assert.ok(byId['planned-demo'], 'Unregistered A–Z catalogue IDs are included in the inventory');
assert.equal(byId['planned-demo'].name, 'Name noch offen', 'Unknown app names are not invented');
assert.equal(byId['planned-demo'].status, 'missing', 'Unregistered catalogue IDs are clearly marked as missing modules');
assert.equal(byId['planned-demo'].catalogOnly, true);
assert.equal(byId['planned-demo'].registration, 'planned-only', 'Catalogue-only apps are distinct from registered apps');
assert.equal(byId['planned-demo'].registrationLabel, 'Nur A–Z-Katalog');
assert.equal(byId['native-demo'].registration, 'registered', 'Registry-backed apps expose their registration state');
assert.equal(byId['native-demo'].registrationLabel, 'In Kern-Registry');
assert.equal(byId['native-demo'].metadataStatus, 'complete', 'Complete app documentation is detected from registry metadata');
assert.equal(byId['native-demo'].purpose, 'Demonstrates a native module');
assert.equal(byId['native-demo'].description, 'A test application with a native runtime module.');
assert.equal(byId['native-demo'].featureSummary, 'Module launch · Runtime inspection');
assert.equal(byId['native-demo'].metadataSource, 'Kern-Registry');
assert.deepEqual(Array.from(byId['native-demo'].metadataMissing), [], 'Complete app records have no missing documentation fields');
assert.equal(byId['planned-demo'].metadataStatus, 'partial', 'A catalogue description without purpose or feature scope remains partial');
assert.equal(byId['planned-demo'].metadataSource, 'A–Z-Katalog');
assert.deepEqual(Array.from(byId['planned-demo'].metadataMissing), ['Zweck','Funktionsumfang']);
assert.equal(byId['missing-demo'].metadataStatus, 'missing', 'Apps without description fields are explicitly marked as undocumented');
assert.match(source, /Noch keine Beschreibung im App-Datensatz gepflegt\./, 'Missing app descriptions are not invented');
assert.match(source, /Funktionsumfang noch nicht im App-Datensatz dokumentiert\./, 'Missing feature scopes are explicitly disclosed');
assert.match(source, /Metadatenquelle/, 'App details disclose the metadata source');
assert.match(source, /App-Profile dokumentiert/, 'Dashboard exposes complete app documentation coverage');
assert.match(source, /Profilstatus/, 'CSV export includes app documentation status');
assert.match(source, /-profile><option value="all">Alle Profilstände<\/option><option value="complete">Profil vollständig<\/option><option value="partial">Profil teilweise<\/option><option value="missing">Profil fehlt<\/option>/, 'System Center exposes all three documentation completeness filters');
assert.match(source, /profileFilter\.value === 'all' \|\| item\.metadataStatus === profileFilter\.value/, 'Profile filter is applied to the live inventory predicate');
assert.match(source, /profileFilter\.addEventListener\('change',render\)/, 'Changing profile completeness re-renders the inventory');
assert.match(source, /profileFilter\.value = 'all'; render\(\)/, 'Reset clears the documentation completeness filter');
assert.match(source, /appMetadata:getAppMetadata/, 'App metadata resolver is exposed for read-only inspection');

const musicProfile = H.SystemCenter.appMetadata({ id: 'music-studio' });
assert.equal(musicProfile.metadataStatus, 'complete', 'Verified Music Studio source metadata is surfaced as a complete profile');
assert.equal(musicProfile.metadataSource, 'Modulcode · music-studio-pro.js');
assert.ok(musicProfile.featureSummary.includes('16-Step-Sequencer'));
assert.ok(musicProfile.featureSummary.includes('WAV- und MIDI-Export'));
const videoProfile = H.SystemCenter.appMetadata({ id: 'video-studio' });
assert.equal(videoProfile.metadataStatus, 'complete');
assert.equal(videoProfile.metadataSource, 'Modulcode · video-studio-pro.js');
assert.ok(videoProfile.featureSummary.includes('WebM-Export'));
assert.ok(videoProfile.featureSummary.includes('Quelldateien müssen danach erneut importiert werden'));
const diagnosticsProfile = H.SystemCenter.appMetadata({ id: 'system-diagnostics' });
assert.equal(diagnosticsProfile.metadataStatus, 'complete');
assert.ok(diagnosticsProfile.featureSummary.includes('Dispatcher-Ziele'));
const errorMonitorProfile = H.SystemCenter.appMetadata({ id: 'runtime-error-monitor' });
assert.equal(errorMonitorProfile.metadataStatus, 'complete');
assert.ok(errorMonitorProfile.featureSummary.includes('maximal 100 Ereignissen'));
assert.ok(errorMonitorProfile.featureSummary.includes('Keine dauerhafte Speicherung'));
const systemCenterProfile = H.SystemCenter.appMetadata({ id: 'system-center' });
assert.equal(systemCenterProfile.metadataStatus, 'complete');
assert.equal(systemCenterProfile.metadataSource, 'Modulcode · system-center-pro.js');
assert.ok(systemCenterProfile.featureSummary.includes('Dokumentationsvollständigkeitsfilter'), 'System Center profile documents the app documentation completeness filter');
assert.match(source, /VERIFIED_MODULE_METADATA/, 'Curated module profiles are kept in an explicit source-linked metadata map');
assert.match(source, /Quelldateien müssen danach erneut importiert werden/, 'Video project metadata explains that media sources must be re-imported');
assert.match(source, /Keine dauerhafte Speicherung; Neuladen der Seite leert die Ereignisliste/, 'Runtime monitor documentation discloses its in-memory-only scope');

const arztbuchProfile = H.SystemCenter.appMetadata({ id: 'arztbuch' });
assert.equal(arztbuchProfile.metadataStatus, 'complete', 'Arztbuch profile is documented from its existing source implementation');
assert.equal(arztbuchProfile.metadataSource, 'Modulcode · index.html / v154 Arztbuch + Anatomy3D');
assert.ok(arztbuchProfile.featureSummary.includes('AES-GCM-256'));
assert.ok(arztbuchProfile.featureSummary.includes('keine Diagnose oder Behandlung'));
const fahrschuleProfile = H.SystemCenter.appMetadata({ id: 'fahrschule' });
assert.equal(fahrschuleProfile.metadataStatus, 'complete');
assert.ok(fahrschuleProfile.featureSummary.includes('10 Fragen'));
assert.ok(fahrschuleProfile.featureSummary.includes('lokal im HalDo-Speicher'));
const emailProfile = H.SystemCenter.appMetadata({ id: 'email' });
assert.equal(emailProfile.metadataStatus, 'complete');
assert.ok(emailProfile.featureSummary.includes('ohne Adapter bleibt die Nachricht ein Entwurf'));
assert.ok(emailProfile.featureSummary.includes('echte Zustellung sind ohne Backend ausdrücklich nicht aktiv'));
const phoneProfile = H.SystemCenter.appMetadata({ id: 'phone' });
assert.equal(phoneProfile.metadataStatus, 'complete');
assert.ok(phoneProfile.featureSummary.includes('keine Notruffunktion'));
assert.ok(phoneProfile.featureSummary.includes('tel:-Übergabe'));
const householdProfile = H.SystemCenter.appMetadata({ id: 'haushalt' });
assert.equal(householdProfile.metadataStatus, 'complete');
assert.ok(householdProfile.featureSummary.includes('Keine Familien-Cloud'));
assert.ok(householdProfile.featureSummary.includes('JSON-Datei exportieren'));
const keyboardProfile = H.SystemCenter.appMetadata({ id: 'keyboard-pro' });
assert.equal(keyboardProfile.metadataStatus, 'complete');
assert.ok(keyboardProfile.featureSummary.includes('Soranî-Eingabe'));
assert.ok(keyboardProfile.featureSummary.includes('ersetzt nicht die systemweite'));
const converterProfile = H.SystemCenter.appMetadata({ id: 'datei-konverter' });
assert.equal(converterProfile.metadataStatus, 'complete');
assert.ok(converterProfile.featureSummary.includes('Keine PDF-, Office- oder Bildkonvertierung'));
assert.ok(converterProfile.featureSummary.includes('CSV-Export maskiert formelartige Textwerte'));

const avatarProfile = H.SystemCenter.appMetadata({ id: 'avatar' });
assert.equal(avatarProfile.metadataStatus, 'complete');
assert.equal(avatarProfile.metadataSource, 'Modulcode · index.html / v151+v154; ai-avatar.js; avatar.js; js/haldo-living-identity.js; human.html; avatar-test.html; js/haldo-human-3d-engine.js');
assert.ok(avatarProfile.description.includes('nicht in index.html eingebunden'));
assert.ok(avatarProfile.featureSummary.includes('Canvas-2D-Foto-Avatare'));
assert.ok(avatarProfile.featureSummary.includes('AnimationMixer-Unterstützung'));
assert.ok(avatarProfile.featureSummary.includes('SkinnedMesh/Skeleton'));
assert.ok(avatarProfile.featureSummary.includes('assets/avatars/haldo-human.glb'));
assert.match(index, /realistic3DModel:false,phonemeLipSync:false/, 'Living Avatar profile limitations are grounded in the existing capability report');
assert.match(index, /H\.LivingAvatar = \(\(\) => \{/, 'Living Avatar profile points to an existing runtime module');

// Avatar implementation audit: distinguish the active 2D UI from the isolated GLB engine.
assert.match(aiAvatar, /<svg viewBox=/, 'AI avatar uses an SVG-based face illustration');
assert.match(avatarWidget, /<svg viewBox=/, 'Floating avatar widget uses SVG graphics');
assert.match(livingIdentity, /haldo-id-mouth/, 'Living Identity renders its face with DOM/CSS elements');
assert.match(humanPage, /getContext\(["']2d["']\)/, 'Human page renders through a 2D canvas context');
assert.match(avatarTestPage, /getContext\(["']2d["']\)/, 'Avatar test page renders through a 2D canvas context');
assert.doesNotMatch(index, /<script[^>]+(?:haldo-human-3d-engine|ai-avatar|avatar\.js)/i, 'Standalone avatar experiments are not silently treated as active index.html modules');
assert.match(humanEngine, /new THREE\.AnimationMixer/, 'Human3D engine can play animations included in loaded GLB files');
assert.match(humanEngine, /const clips\s*=\s*gltf\.animations\s*\|\|\s*\[\]/, 'GLB animation clips are optional rather than guaranteed');
assert.match(humanEngine, /function inspectModelCapabilities\(model, animations\)/, 'Human3D engine exposes explicit model capability inspection');
assert.match(humanEngine, /object\.isSkinnedMesh === true/, 'Human3D capability inspection detects skinned meshes');
assert.match(humanEngine, /object\.skeleton/, 'Human3D capability inspection checks skeleton data');
assert.match(humanEngine, /morphTargetDictionary|morphAttributes/, 'Human3D capability inspection detects morph-target availability');
assert.doesNotMatch(humanEngine, /\.morphTargetInfluences|\.setValueAtTime|lipSync|lip-sync|phonemeToMorph|visemeToMorph/i, 'Capability detection does not pretend to animate facial morphs or perform phoneme lip sync');
for (const modelPath of [
  'assets/avatars/haldo-human.glb',
  'assets/avatars/haldo-cyborg.glb',
  'assets/avatars/haldo-android.glb',
  'assets/avatars/haldo-robot.glb'
]) {
  assert.equal(existsSync(resolve(here, '..', modelPath)), false, 'Configured Human3D model file is still missing: ' + modelPath);
}



assert.equal(byId['native-demo'].implementationLabel, 'Natives HalDo-Modul erkannt');
assert.ok(byId['native-demo'].nextSteps.some(step => step.includes('echten Browser')), 'Native modules expose a concrete manual verification step');
assert.ok(byId['dedicated-demo'].nextSteps.some(step => step.includes('Kernfunktionen')), 'Dedicated modules expose a core workflow test step');
assert.ok(byId['route-ready-demo'].nextSteps.some(step => step.includes('zentralen Launcher')), 'Routed modules expose launcher verification guidance');
assert.ok(byId['generic-demo'].nextSteps.some(step => step.includes('generischen Platzhalter')), 'Generic modules expose replacement guidance');
assert.ok(byId['unrouted-demo'].nextSteps.some(step => step.includes('Dispatcher')), 'Unrouted modules expose route-registration guidance');
assert.ok(byId['route-demo'].nextSteps.some(step => step.includes('open()')), 'Unresolved routes expose target implementation guidance');
assert.ok(byId['missing-demo'].nextSteps.some(step => step.includes('Eigenständiges HalDo-Modul')), 'Missing modules expose implementation guidance');
assert.ok(byId['planned-demo'].nextSteps[0].includes('Katalogeintrag fachlich benennen'), 'Catalogue-only items first require a confirmed purpose and name');
assert.match(byId['native-demo'].verificationNote, /keine vollständige manuelle Funktions- oder Browserabnahme/, 'Runtime detection is not misrepresented as a functional test');
assert.match(source, /data-app-details=/, 'Every inventory row provides a dedicated details action');
assert.match(source, /data-close-details/, 'App details can be closed without leaving the inventory');
assert.match(source, /detailApp\.nextSteps\.map/, 'The detail panel renders the next technical steps for the selected app');
assert.match(source, /Aktueller Befund:/, 'The detail panel explains the observed implementation state');
assert.match(source, /Startbarkeit/, 'The detail panel distinguishes detected launch targets from non-launchable entries');
assert.match(source, /guidance:getAppGuidance/, 'App guidance is exposed through the System Center API');
assert.match(source, /item\.purpose,item\.description,item\.featureSummary/, 'Inventory search includes app purpose and documented feature scope');
assert.match(source, /\['Kategorie\(n\)','App','App-ID','Registrierung','Zweck','Beschreibung','Funktionsumfang','Profilstatus','Metadatenquelle'/, 'CSV export exposes app documentation and metadata provenance');
assert.equal(byId['native-demo'].category, 'A');
assert.deepEqual(Array.from(byId['native-demo'].categories), ['A', 'S'], 'Every category assignment is retained for a multiply assigned app');
assert.match(source, /!item\.catalogOnly && \['native','dedicated','routeReady'\]\.indexOf\(item\.status\) !== -1/, 'Only native or dedicated modules and resolved route targets can be launched');
assert.match(source, /item\.status === 'generic' \? 'Platzhalter' : 'Modul fehlt'/, 'Generic placeholders are visibly labelled and cannot be launched as finished apps');
assert.match(source, /Generischer Platzhalter: noch kein eigenständiges Fachmodul\./, 'Disabled placeholder action explains why the entry cannot be launched');
for (const [status, label] of [
  ['native','Native Module'],
  ['dedicated','Eigenständige Module'],
  ['generic','Generische Platzhalter'],
  ['routeReady','Route mit erkanntem Zielmodul'],
  ['moduleUnrouted','Modul vorhanden · Route fehlt'],
  ['route','Route ohne erkanntes Zielmodul'],
  ['missing','Noch ohne Modul']
]) {
  assert.ok(source.includes("{id:'" + status + "',name:'" + label + "'}"), 'Status filter option exists: ' + status);
}
assert.match(source, /statusFilter === 'all' \|\| item\.status === statusFilter/, 'Selected status filter is applied to inventory rows');
assert.match(source, /moduleUnrouted/, 'Modules without an active dispatcher route have a separate status');
assert.match(source, /Planplätze ohne Katalog-ID/, 'Unassigned plan slots are labelled accurately');
assert.match(source, /Mehrfach-Zuordnungen über Kategorien/, 'Cross-category duplicate assignments are visible in the dashboard');
assert.match(source, /Katalog-IDs ohne App-Namen/, 'Unnamed catalogue IDs are visible instead of being silently treated as named apps');
assert.match(source, /moduleFor\(app\.id\)/, 'Runtime route targets are resolved through the dispatcher API');
assert.match(index, /moduleFor:function\(id\)\{return ROUTES\[String\(id\)\]\|\|null;\}/, 'The central dispatcher exposes its explicit module resolver');
for (const [id, moduleName] of [['email','EmailPro'],['phone','PhonePro'],['videocall','VideoCalls'],['chat-pro','ChatPro'],['geo-quiz','GeoQuiz'],['aktien','Aktien'],['science-lab','ScienceLab'],['backup','BackupRecovery'],['language-voice','LanguageVoiceStudio'],['ai-voice-core','VoiceCore'],['system-diagnostics','SystemDiagnostics']]) {
  assert.match(index, new RegExp("'" + id + "':'" + moduleName + "'"), 'Dispatcher route is wired: ' + id + ' → ' + moduleName);
}
assert.match(source, /Erkanntes Modul/, 'Inventory displays the resolved implementation name');
assert.match(source, /registryWithoutCategory,'Registry-Apps ohne Kategorie'/, 'Registered apps outside the A-Z catalogue are counted');
assert.match(source, /Vollständiges A–Z-App-Inventar/, 'Inventory heading includes planned catalogue entries');
assert.match(source, /\['Kategorie\(n\)','App','App-ID','Registrierung','Zweck','Beschreibung','Funktionsumfang','Profilstatus','Metadatenquelle','Erkanntes Modul','Status','Hinweis'\]/, 'CSV export includes registration, documentation coverage and metadata provenance');
assert.match(source, /registrationLabel/, 'Inventory UI exposes catalogue-only and registry-backed registration labels');
const csvCellMatch = source.match(/function csvCell\(value\) \{[\s\S]*?\n  \}/);
assert.ok(csvCellMatch, 'System Center CSV export uses a dedicated cell sanitizer');
const csvCell = runInNewContext('(' + csvCellMatch[0] + ')');
assert.equal(csvCell('=1+1'), "\"'=1+1\"", 'Formula-like CSV text is prefixed with an apostrophe');
assert.equal(csvCell('  +SUM(A1:A2)'), "\"'  +SUM(A1:A2)\"", 'Formula-like text after leading whitespace is neutralized');
assert.equal(csvCell('\t@cmd'), "\"'\t@cmd\"", 'Formula-like text after control whitespace is neutralized');
assert.equal(csvCell(-5), '"-5"', 'Numeric negative values remain unchanged');
assert.match(source, /row\.map\(csvCell\)/, 'Every exported CSV cell passes through the sanitizer');
assert.match(source, /-category.*Alle A–Z-Kategorien.*Ohne Kategorie/, 'Inventory exposes A-Z and unassigned-category filters');
assert.match(source, /categoryFilter\.addEventListener\('change',render\)/, 'Changing the category filter refreshes the inventory');
assert.match(source, /categoryFilter\.value === 'all' \|\| \(categoryFilter\.value === 'none' \? item\.categories\.length === 0 : item\.categories\.indexOf\(categoryFilter\.value\) !== -1\)/, 'Category filter supports both assigned letters and the unassigned registry list');
assert.match(source, /item\.categories\.join\(' · '\)/, 'Inventory displays all category assignments for each app');
assert.match(source, /function getCategoryEntries\(letter\)/, 'A-Z analysis combines the stable catalogue and later category extensions');
assert.equal(byId['system-center'].category, 'S');
assert.equal(H.SystemCenter.categoryRegisteredCount(H.Master.getCategoryCatalogApps('A')), 1, 'Only registry-backed A category IDs count as registered');
assert.equal(H.SystemCenter.categoryRegisteredCount(H.Master.getCategoryCatalogApps('S')), 1, 'Unregistered category IDs are excluded from registered counts');
const planAudit = H.SystemCenter.plan();
assert.equal(planAudit.planned, 22);
assert.equal(planAudit.catalogAssignments, 6, 'Late category extensions are included and repeated placements are deduplicated per letter');
assert.equal(planAudit.catalogUnique, 5, 'Unique catalogue IDs include late category extensions without double counting');
assert.equal(planAudit.catalogDuplicateAssignments, 1, 'Cross-category duplicate assignments are counted separately from unique IDs');
assert.equal(planAudit.catalogUnnamed, 1, 'Catalogue IDs without a confirmed display name remain explicitly measurable');
assert.equal(planAudit.registeredInCatalog, 4, 'Registry overlap includes later registered category apps');
assert.equal(planAudit.unassignedPlanSlots, 16, 'Unassigned plan slots remain visible as a gap');
assert.equal(H.Registry.totalCount(), 22, 'The planned slot count is preserved');

const aProgress = H.SystemCenter.categoryProgress('A');
assert.equal(aProgress.planned, 10, 'Category progress keeps the planned capacity for the selected letter');
assert.equal(aProgress.catalogIds, 4, 'Category progress counts de-duplicated catalogue IDs from both catalogue sources');
assert.equal(aProgress.namedIds, 3, 'Category progress distinguishes named IDs from unnamed planning entries');
assert.equal(aProgress.registeredIds, 3, 'Category progress counts only IDs actually present in the core registry');
assert.equal(aProgress.readyModules, 2, 'Category progress counts native and dedicated modules as recognized targets');
assert.equal(aProgress.missingModules, 1, 'Category progress separately reports catalogue entries without a module');
assert.equal(aProgress.planSlotsWithoutId, 6, 'Category progress treats unassigned capacity as slots without IDs, not as app records');
assert.equal(aProgress.statusCounts.native, 1);
assert.equal(aProgress.statusCounts.dedicated, 1);
assert.equal(aProgress.statusCounts.moduleUnrouted, 1, 'Per-category audit reports installed modules without a dispatcher route');
assert.equal(aProgress.profilesComplete, 1, 'A-Z progress counts fully documented profiles');
assert.equal(aProgress.profilesPartial, 1, 'A-Z progress counts partially documented profiles');
assert.equal(aProgress.profilesMissing, 2, 'A-Z progress counts missing app documentation without fabricating descriptions');

const sProgress = H.SystemCenter.categoryProgress('S');
assert.equal(sProgress.catalogIds, 2, 'Category progress includes the System Center category extension');
assert.equal(sProgress.registeredIds, 2, 'System Center is counted as registered in its own category');
assert.equal(sProgress.modulesWithoutRoute, 0, 'A direct System Center module is not falsely classified as unrouted');
assert.equal(sProgress.readyModules, 2, 'Native and directly registered System Center modules are recognized');
assert.equal(sProgress.profilesComplete, 2, 'Per-category profile metrics include metadata from the central registry and the documented System Center');
assert.equal(sProgress.planSlotsWithoutId, 10);
const emptyProgress = H.SystemCenter.categoryProgress('Z');
assert.equal(emptyProgress.catalogIds, 0, 'Empty categories do not get invented catalogue entries');
assert.equal(emptyProgress.planSlotsWithoutId, 0, 'An unknown category does not create fictitious planned slots');
assert.match(source, /data-filter-category=/, 'A-Z category cards expose a filter action');
assert.match(source, /categoryFilter\.value = categoryButton\.dataset\.filterCategory/, 'Selecting an A-Z category filters the app inventory');
assert.match(source, /inventorySection\.scrollIntoView/, 'Selecting a category brings its filtered inventory into view');
assert.match(source, /categoryProgress:getCategoryProgress/, 'Per-category audit is available through the System Center runtime API');
assert.match(source, /Module erkannt/, 'A-Z cards show how many implementation targets were recognized');
assert.match(index, /<script src="system-center-pro\.js"><\/script>/, 'System Center script is included in index.html');
assert.ok(index.indexOf('<script src="video-studio-pro.js"></script>') < index.indexOf('<script src="system-center-pro.js"></script>'), 'System Center loads after the studio modules');
assert.ok(index.indexOf('moduleFor:function(id)') < index.indexOf('<script src="system-center-pro.js"></script>'), 'Dispatcher module resolver is available before System Center starts');
const routeTable = index.match(/var ROUTES=\{([\s\S]*?)\n  \};/);
assert.ok(routeTable, 'Central dispatcher route table exists');
const routePairs = [...routeTable[1].matchAll(/'([^']+)':'([^']+)'/g)].map(match => ({ id: match[1], module: match[2] }));
assert.ok(routePairs.length >= 128, 'Central dispatcher exposes the expanded route catalogue, including the verified A-Z aliases');
assert.equal(new Set(routePairs.map(route => route.id)).size, routePairs.length, 'Dispatcher route IDs are unique');
const moduleAssignments = index + '\n' + musicStudio + '\n' + videoStudio;
const declaredModules = new Set([...moduleAssignments.matchAll(/(?:HalDo|H)\.([A-Za-z_$][\w$]*)\s*=/g)].map(match => match[1]));
const unresolvedTargets = routePairs.filter(route => !declaredModules.has(route.module));
assert.deepEqual(unresolvedTargets, [], 'Every dispatcher target is implemented in index.html or an explicitly loaded studio module');
assert.match(musicStudio, /H\.MusicStudio=\{__nativePro:true,open:open\}/, 'Music Studio target is exported by its external module');
assert.match(videoStudio, /H\.VideoStudio = \{__nativePro:true, open:open\}/, 'Video Studio target is exported by its external module');
assert.ok(index.indexOf('<script src="music-studio-pro.js"></script>') < index.indexOf('<script src="system-center-pro.js"></script>'), 'Music Studio loads before System Center');
assert.ok(index.indexOf('<script src="video-studio-pro.js"></script>') < index.indexOf('<script src="system-center-pro.js"></script>'), 'Video Studio loads before System Center');
assert.ok(index.indexOf('haldo-v165-three-apps') < index.indexOf('<script src="system-center-pro.js"></script>'), 'v165 category extensions load before System Center');
assert.ok(index.indexOf('haldo-v166-three-apps') < index.indexOf('<script src="system-center-pro.js"></script>'), 'v166 category extensions load before System Center');
for (const [id, letter] of [['bibliothek','B'],['inventar','I'],['mindmap','M'],['haushalt','G'],['keyboard-pro','K'],['datei-konverter','X']]) {
  assert.ok(index.includes("id:'" + id + "'"), 'Later A-Z app exists: ' + id);
  const categoryAssignment = id.indexOf('-') === -1 ? id + ':' + "'" + letter + "'" : "'" + id + "':'" + letter + "'";
  assert.ok(index.includes(categoryAssignment), 'Later A-Z app is assigned to category ' + letter + ': ' + id);
}
assert.ok(index.indexOf('haldo-v160-system-diagnostics') < index.indexOf('<script src="system-center-pro.js"></script>'), 'Post-v157 route target modules load before System Center');

const keyboardStart = index.indexOf("id:'keyboard-pro'");
const backupStart = index.indexOf('H.BackupRecovery=(function(){');
const safeEntriesStart = index.indexOf('function safeEntries(entries){', backupStart);
const safeEntriesEnd = index.indexOf('function systemInfo()', safeEntriesStart);
assert.ok(backupStart >= 0 && safeEntriesStart > backupStart && safeEntriesEnd > safeEntriesStart, 'Backup key filter is present');
const safeEntries = runInNewContext('(' + index.slice(safeEntriesStart, safeEntriesEnd).trim() + ')');
const filteredBackup = safeEntries([
  ['haldo_profile','{}'],
  ['haldo_apiKey','example-secret'],
  ['haldo_access_token','example-token'],
  ['haldo_user_config','{}']
]);
assert.deepEqual(JSON.parse(JSON.stringify(filteredBackup)), {
  entries:[['haldo_profile','{}']], excluded:3
}, 'Quick backup uses key-name heuristics and reports skipped keys');
assert.ok(index.includes('Er prüft keine Werte und erkennt nicht jedes Geheimnis.'), 'German quick-backup warning explains that key-name filtering is not a guarantee');
assert.ok(index.includes('The quick filter skips storage keys whose names suggest configuration or secrets.'), 'English quick-backup warning describes the heuristic accurately');
assert.ok(index.includes("<span>'+tr('excludedKeys')+'</span>"), 'Skipped-key metric uses a localized, accurate label');

const converterStart = index.indexOf('/* X — lokaler Datei-Konverter');
assert.ok(keyboardStart >= 0 && converterStart > keyboardStart, 'Keyboard module is isolated before the file converter module');
const keyboardModule = index.slice(keyboardStart, converterStart);
assert.match(keyboardModule, /ta\.dir=lang==='Soranî'\?'rtl':'ltr'/, 'Sorani text field switches to right-to-left direction');
assert.match(keyboardModule, /ta\.style\.textAlign=lang==='Soranî'\?'right':'left'/, 'Sorani text field aligns from the right');
assert.match(keyboardModule, /keyGrid\.style\.direction=lang==='Soranî'\?'rtl':'ltr'/, 'Virtual keyboard rows switch to right-to-left layout for Sorani');
assert.match(keyboardModule, /'Deutsch':\['qwertzuiop','asdfghjkl','yxcvbnm','äöüß'\]/, 'German keyboard includes umlaut and sharp-s keys');
assert.match(keyboardModule, /'Kurmancî':\['qwertyuiop','asdfghjkl','zxcvbnm','çêîşû'\]/, 'Kurmanci keyboard includes its five additional Latin letters');
assert.match(keyboardModule, /shift\?ch\.toUpperCase\(\):ch/, 'Shift applies case conversion to special layout characters');

const converterEnd = index.indexOf('var apps=[household,keyboard,converter];', converterStart);
assert.ok(converterStart >= 0 && converterEnd > converterStart, 'File converter module boundaries exist');
const converterSource = index.slice(converterStart, converterEnd);
const parseStart = converterSource.indexOf('function parseCSV(text) {');
const toCSVStart = converterSource.indexOf('function toCSV(arr) {', parseStart);
const converterBindingsEnd = converterSource.indexOf("root.querySelector('#h166-con-run')", toCSVStart);
assert.ok(parseStart >= 0 && toCSVStart > parseStart && converterBindingsEnd > toCSVStart, 'CSV parsing and export functions are present');
const parseCSV = runInNewContext('(' + converterSource.slice(parseStart, toCSVStart).trim() + ')');
const toCSV = runInNewContext('(' + converterSource.slice(toCSVStart, converterBindingsEnd).trim() + ')');
assert.equal(JSON.stringify(parseCSV('name,age\r\n"Alice, Inc.",30')), JSON.stringify([{ name: 'Alice, Inc.', age: '30' }]), 'Quoted commas are parsed as part of a CSV cell');
assert.equal(JSON.stringify(parseCSV('name\r\n"Alice ""A"" Example"')), JSON.stringify([{ name: 'Alice "A" Example' }]), 'Escaped double quotes are decoded');
assert.throws(() => parseCSV('"unfinished'), /nicht geschlossenes Anführungszeichen/, 'Unclosed quoted CSV cells are rejected');
assert.throws(() => parseCSV('bad"name,value'), /müssen am Anfang/, 'Quotes inside unquoted CSV cells are rejected');
assert.throws(() => parseCSV('"value"x,next'), /Unerwartetes Zeichen/, 'Unexpected data after closing quote is rejected');
const safeCsv = toCSV([{ note: '=1+1', amount: -5 }, { note: ' +SUM(A1:A2)', amount: 8 }]);
assert.ok(safeCsv.includes('"\'=1+1"'), 'CSV export prefixes equals-formula text with an apostrophe');
assert.ok(safeCsv.includes('"\' +SUM(A1:A2)"'), 'CSV export neutralizes formula text after leading whitespace');
assert.ok(safeCsv.includes('"-5"'), 'Numeric negative values remain numeric and are not rewritten as text');

console.log('System Center contract tests passed: registration, category, launcher routing, fallback preservation, all direct, routed, generic, unrouted and missing module states, catalogue reconciliation metrics, plan count and script order.');
