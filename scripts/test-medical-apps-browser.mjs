import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PASS = 'HalDo-E2E-Test!2026';
const WRONG = 'HalDo-Falsches-Passwort!2026';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
    const filePath = path.resolve(ROOT, '.' + pathname);
    if (!filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

let browser;
let page;
const pageErrors = [];
const browserConsoleErrors = [];
const checks = [];

function pass(label) {
  checks.push(label);
  console.log('PASS  ' + label);
}

async function waitForStatus(root, text) {
  const rootId = await root.getAttribute('id');
  await page.waitForFunction(
    ({ id, expected }) => {
      const host = document.getElementById(id);
      const el = host && host.querySelector('#h167-gate-status');
      return !!el && el.textContent.includes(expected);
    },
    { id: rootId, expected: text }
  );
}

async function dismissWelcomeIfPresent() {
  const welcome = page.locator('#haldo-v161-welcome');
  // H.Launch may finish its wrapper chain on the next browser task. Wait for
  // the app-specific welcome instead of checking the DOM only once.
  try {
    await welcome.waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    return;
  }
  const button = welcome.locator('button.h161-button');
  await button.waitFor({ state: 'visible', timeout: 3000 });
  await button.click();
  await welcome.waitFor({ state: 'detached', timeout: 10000 });
}

async function seedLegacyArztbuchVault() {
  await page.evaluate(async (passphrase) => {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const baseKey = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    // Intentionally omit "vitals": this is the v154 vault schema before this upgrade.
    const legacyData = { appointments: [], medications: [], allergies: [], labs: [], notes: [] };
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(legacyData)));
    const toB64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
    localStorage.setItem('haldo_v154_arztbuch_encrypted_vault', JSON.stringify({
      v: 1, algorithm: 'AES-GCM-256', kdf: 'PBKDF2-SHA-256', iterations: 210000,
      salt: toB64(salt), iv: toB64(iv), cipher: toB64(cipher)
    }));
  }, PASS);
}
async function readArztbuchData(passphrase) {
  return page.evaluate(async ({ storageKey, pass }) => {
    const envelope = JSON.parse(localStorage.getItem(storageKey));
    const fromB64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: fromB64(envelope.salt), iterations: envelope.iterations, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(envelope.iv) }, key, fromB64(envelope.cipher));
    return JSON.parse(new TextDecoder().decode(plain));
  }, { storageKey: 'haldo_v154_arztbuch_encrypted_vault', pass: passphrase });
}
async function assertArztbuchEncrypted(plaintexts = []) {
  const raw = await readVault('haldo_v154_arztbuch_encrypted_vault');
  assert.ok(raw, 'Verschlüsselter Arztbuch-Tresor fehlt.');
  const envelope = JSON.parse(raw);
  assert.equal(envelope.algorithm, 'AES-GCM-256');
  assert.equal(envelope.kdf, 'PBKDF2-SHA-256');
  assert.equal(envelope.iterations, 210000);
  for (const value of plaintexts) {
    assert.equal(raw.includes(value), false, 'Klartext im Arztbuch-localStorage entdeckt: ' + value);
  }
  return envelope;
}

async function openArztbuchHub() {
  await page.evaluate(() => {
    if (!window.HalDo || typeof window.HalDo.Launch !== 'function') {
      throw new Error('HalDo.Launch ist nicht verfügbar.');
    }
    window.HalDo.Launch({ id: 'arztbuch', n: 'HalDo Arztbuch Pro' });
  });
  await dismissWelcomeIfPresent();

  // The existing v154 openRoot helper creates .hdp154-root inside the window.
  const hub = page.locator('#winLayer .hdp154-root').last();
  const unlockForm = hub.locator('[data-ab-unlock-form]');
  await unlockForm.waitFor({ state: 'visible', timeout: 20000 });
  await hub.locator('[name="pass"]').fill(PASS);
  const confirm = hub.locator('[name="confirm"]');
  assert.equal(await confirm.count(), 0, 'Der vorbereitete alte Arztbuch-Tresor wurde nicht erkannt; es darf kein neuer Tresor erstellt werden.');
  await unlockForm.locator('button[type="submit"]').click();
  await hub.locator('[data-ab-open-module="laborwerte-pro"]').waitFor({ state: 'visible', timeout: 20000 });
  return hub;
}
async function openMedicalAppFromHub(hub, appId) {
  const launchButton = hub.locator('[data-ab-open-module="' + appId + '"]');
  await launchButton.waitFor({ state: 'visible', timeout: 10000 });
  await launchButton.click();
  await dismissWelcomeIfPresent();
  await page.locator('#h167-unlock-form').last().waitFor({ state: 'visible', timeout: 20000 });
  const root = page.locator('.h167').last();
  await root.waitFor({ state: 'visible', timeout: 5000 });
  return root;
}
async function closeWindow(root) {
  const windowId = await root.evaluate((element) => {
    const layer = element.closest('#winLayer');
    if (!layer) return null;
    let host = element;
    while (host.parentElement && host.parentElement !== layer) {
      host = host.parentElement;
    }
    return host.parentElement === layer && host.id ? host.id : null;
  });
  assert.ok(windowId, 'HalDo-Fenster konnte im #winLayer nicht gefunden werden.');
  await page.evaluate((id) => {
    if (!window.HalDo || !window.HalDo.Win || typeof window.HalDo.Win.close !== 'function') {
      throw new Error('HalDo.Win.close ist nicht verfügbar.');
    }
    window.HalDo.Win.close(id);
  }, windowId);
  await page.locator('#' + windowId).waitFor({ state: 'detached', timeout: 5000 });
}
async function createOrUnlock(root, passphrase) {
  await root.locator('#h167-pass').fill(passphrase);
  await root.locator('#h167-unlock-form button[type="submit"]').click();
  await root.locator('#h167-record-form').waitFor({ timeout: 20000 });
}

async function submitRecord(root, values) {
  for (const [name, value] of Object.entries(values)) {
    await root.locator('[name="' + name + '"]').fill(value);
  }
  await root.locator('#h167-record-form button[type="submit"]').click();
}

async function submitMedicalVaultRecord(root, values) {
  for (const [name, value] of Object.entries(values)) {
    const field = root.locator('[name="' + name + '"]');
    const tagName = await field.evaluate((element) => element.tagName);
    if (tagName === 'SELECT') await field.selectOption(String(value));
    else await field.fill(String(value));
  }
  await root.locator('#h167-record-form button[type="submit"]').click();
}

async function readVault(key) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

async function assertEncrypted(key, plaintexts = []) {
  const raw = await readVault(key);
  assert.ok(raw, 'Verschlüsselter Tresor fehlt in localStorage: ' + key);
  const envelope = JSON.parse(raw);
  assert.equal(envelope.format, 'haldo-aes-gcm-v1');
  assert.equal(envelope.kdf, 'PBKDF2-SHA-256');
  assert.equal(envelope.iterations, 310000);
  for (const value of plaintexts) {
    assert.equal(raw.includes(value), false, 'Klartext im localStorage entdeckt: ' + value);
  }
  return envelope;
}

async function exportBackup(root) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout:20000 }),
    root.locator('#h167-backup').click()
  ]);
  const filePath = await download.path();
  assert.ok(filePath, 'Browser-Download hat keinen Dateipfad geliefert.');
  const raw = await fs.readFile(filePath, 'utf8');
  const envelope = JSON.parse(raw);
  assert.equal(envelope.format, 'haldo-aes-gcm-v1');
  return filePath;
}

async function closeApp(root) {
  const windowId = await root.evaluate((element) => {
    const layer = element.closest('#winLayer');
    if (!layer) return null;
    let host = element;
    while (host.parentElement && host.parentElement !== layer) {
      host = host.parentElement;
    }
    return host.parentElement === layer && host.id ? host.id : null;
  });
  assert.ok(windowId, 'HalDo-Fenster konnte im #winLayer nicht gefunden werden.');
  await page.evaluate((id) => {
    if (!window.HalDo || !window.HalDo.Win || typeof window.HalDo.Win.close !== 'function') {
      throw new Error('HalDo.Win.close ist nicht verfügbar.');
    }
    window.HalDo.Win.close(id);
  }, windowId);
  await root.waitFor({ state: 'detached', timeout: 5000 });
}
async function run() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const baseUrl = 'http://127.0.0.1:' + address.port;

  browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true
  });
  page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(error.stack || error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserConsoleErrors.push(message.text()); });

  // The OS shell needs its pinned Three.js r128 runtime to initialize the
  // cosmic background and remove the startup loader. Keep unrelated services blocked.
  const requiredExternalAssets = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/',
    'https://unpkg.com/three-globe/example/img/'
  ];
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(baseUrl) || url.startsWith('data:') || url.startsWith('blob:') ||
        requiredExternalAssets.some((prefix) => url.startsWith(prefix))) {
      return route.continue();
    }
    return route.abort();
  });

  await page.goto(baseUrl + '/index.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => {
    return window.isSecureContext &&
      !!(window.crypto && window.crypto.subtle) &&
      !!(window.HalDo && window.HalDo.Win && window.HalDo.Launch) &&
      !!(window.HalDo['laborwerte-pro'] && window.HalDo['medikamentenplan-pro']) &&
      !!(window.HalDo.BrandingV177 && window.HalDo.BrandingV177.ready) &&
      !!(window.HalDo.AICore && window.HalDo.AICore.version === '178.0.0') &&
      !!(window.HalDo.PermissionCore && window.HalDo.PermissionCore.version === '179.0.0') &&
      !!(window.HalDo.DataVault && window.HalDo.DataVault.version === '180.0.0');
  }, { timeout: 45000 });
  pass('HalDo OS startet auf sicherem Browser-Kontext; beide medizinischen Apps sind registriert');
  const brandAudit = await page.evaluate(() => ({
    version: window.HalDo.Master.version,
    featuredCount: window.HalDo.Registry.featured.length,
    unbranded: window.HalDo.Registry.featured.filter((app) => !/^HalDo\b/.test(String(app.n || ''))).map((app) => app.id),
    specialAvatar: window.HalDo.Registry.featured.find((app) => app.id === 'avatar')?.n,
    specialFahrschule: window.HalDo.Registry.featured.find((app) => app.id === 'fahrschule')?.n,
    specialArztbuch: window.HalDo.Registry.featured.find((app) => app.id === 'arztbuch')?.n
  }));
  assert.equal(brandAudit.version, '177.0.0');
  assert.ok(brandAudit.featuredCount >= 70, 'Registry enthält unerwartet wenige Apps.');
  assert.deepEqual(brandAudit.unbranded, [], 'Alle Registry-Apps müssen mit HalDo beginnen.');
  assert.equal(brandAudit.specialAvatar, 'HalDo Cyborg Avatar AI Pro');
  assert.equal(brandAudit.specialFahrschule, 'HalDo Fahrschule AI Pro');
  assert.equal(brandAudit.specialArztbuch, 'HalDo Arztbuch AI Pro Max');
  pass('HalDo v177 Markenstandard: jede Registry-App trägt HalDo; AI/Cyborg-Spezialnamen und 177-Version geprüft');

  const aiCoreAudit = await page.evaluate(() => {
    const H = window.HalDo;
    const core = H.AICore;
    let eventPayload = null;
    const unsubscribe = core.events.on('test:smoke', (payload) => { eventPayload = payload; });
    const emitted = core.events.emit('test:smoke', {
      appId: 'browser-test',
      action: 'smoke',
      status: 'ok',
      count: 1
    });
    unsubscribe();

    core.preferences.set('browser-test', { ready: true, revision: 178 });
    const preference = core.preferences.get('browser-test', null);
    core.preferences.remove('browser-test');
    const preferenceRemoved = core.preferences.get('browser-test', null) === null;

    let sensitivePreferenceRejected = false;
    try { core.preferences.set('medical-records', { note: 'must-not-be-stored' }); }
    catch { sensitivePreferenceRejected = true; }

    let freeTextPreferenceRejected = false;
    try { core.preferences.set('display-note', 'personal free text is not a preference token'); }
    catch { freeTextPreferenceRejected = true; }

    let nestedSensitivePropertyRejected = false;
    try { core.preferences.set('browser-safe', { display: { patientName: 'not-allowed' } }); }
    catch { nestedSensitivePropertyRejected = true; }

    let freeTextEventRejected = false;
    try { core.events.emit('test:free-text', { action: 'patient has a diagnosis' }); }
    catch { freeTextEventRejected = true; }

    let arbitraryEventFieldRejected = false;
    try { core.events.emit('test:unsafe', { patientName: 'not-allowed' }); }
    catch { arbitraryEventFieldRejected = true; }

    const status = core.getStatus();
    const audit = core.getRecentAudit(5);
    return {
      version: core.version,
      platformVersion: H.Master.version,
      aiCoreVersion: H.Master.aiCoreVersion,
      appCount: core.listApps().length,
      arztbuchName: core.getApp('arztbuch')?.name || null,
      status,
      emitted,
      eventPayload,
      preference,
      preferenceRemoved,
      sensitivePreferenceRejected,
      freeTextPreferenceRejected,
      nestedSensitivePropertyRejected,
      freeTextEventRejected,
      arbitraryEventFieldRejected,
      audit
    };
  });
  assert.equal(aiCoreAudit.version, '178.0.0');
  assert.equal(aiCoreAudit.platformVersion, '177.0.0', 'v178 darf die Plattform-Buildversion nicht überschreiben.');
  assert.equal(aiCoreAudit.aiCoreVersion, '178.0.0');
  assert.ok(aiCoreAudit.appCount >= 70, 'AI Core sieht die vorhandene App-Registry nicht vollständig.');
  assert.equal(aiCoreAudit.arztbuchName, 'HalDo Arztbuch AI Pro Max');
  assert.equal(aiCoreAudit.status.localOnly, true);
  assert.equal(aiCoreAudit.status.eventHub, true);
  assert.equal(aiCoreAudit.status.appRegistry, true);
  assert.equal(aiCoreAudit.status.localPreferences, true);
  assert.equal(aiCoreAudit.status.permissionService, true, 'v179 stellt den zustimmungsbasierten Berechtigungsdienst bereit.');
  assert.equal(aiCoreAudit.status.permissionCoreVersion, '179.0.0');
  assert.equal(aiCoreAudit.status.permissionModel, 'explicit-session-consent');
  assert.equal(aiCoreAudit.status.authentication, false);
  assert.equal(aiCoreAudit.status.commonSecureVault, true, 'v180 stellt den verschlüsselten IndexedDB-Datentresor bereit.');
  assert.equal(aiCoreAudit.status.dataVaultVersion, '180.0.0');
  assert.equal(aiCoreAudit.status.vaultStorage, 'indexeddb-encrypted');
  assert.equal(aiCoreAudit.status.vaultKeyPersistence, 'memory-only');
  assert.equal(aiCoreAudit.status.vaultRemoteSync, false);
  assert.equal(aiCoreAudit.status.vaultKeyRecovery, false);
  assert.equal(aiCoreAudit.status.aiInferenceRuntime, false);
  assert.equal(aiCoreAudit.status.agentRuntime, false);
  assert.equal(aiCoreAudit.status.backendConnected, false);
  assert.equal(aiCoreAudit.emitted, true);
  assert.equal(aiCoreAudit.eventPayload.name, 'test:smoke');
  assert.deepEqual(aiCoreAudit.eventPayload.metadata, { appId: 'browser-test', action: 'smoke', status: 'ok', count: 1 });
  assert.deepEqual(aiCoreAudit.preference, { ready: true, revision: 178 });
  assert.equal(aiCoreAudit.preferenceRemoved, true);
  assert.equal(aiCoreAudit.sensitivePreferenceRejected, true);
  assert.equal(aiCoreAudit.freeTextPreferenceRejected, true);
  assert.equal(aiCoreAudit.nestedSensitivePropertyRejected, true);
  assert.equal(aiCoreAudit.freeTextEventRejected, true);
  assert.equal(aiCoreAudit.arbitraryEventFieldRejected, true);
  assert.ok(aiCoreAudit.audit.some((entry) => entry.event === 'haldo:core:test:smoke'));
  assert.equal(aiCoreAudit.audit.some((entry) => JSON.stringify(entry).includes('must-not-be-stored')), false);
  pass('HalDo AI Core v178: VoiceHub, Registry, lokale Präferenzen, Audit-Metadaten und ehrlicher Capability-Status geprüft');

  // Complete the actual first-run welcome gate before opening app windows.
  const systemWelcome = page.locator('#haldo-v161-welcome');
  await systemWelcome.waitFor({ state: 'visible', timeout: 15000 });
  await systemWelcome.locator('button.h161-button').click();
  await systemWelcome.waitFor({ state: 'detached', timeout: 10000 });
  await page.locator('#loader').waitFor({ state: 'hidden', timeout: 20000 });
  pass('HalDo-Willkommensbildschirm und Three.js-Kosmos: Arbeitsbereich vollständig gestartet');

  const permissionCoreAudit = await page.evaluate(async () => {
    const H = window.HalDo;
    const core = H.PermissionCore;
    const platform = H.AICore;
    const app = platform.getApp('avatar');
    core.registerApp('avatar', ['microphone']);
    let undeclaredRejected = false;
    try { await platform.permissions.request('camera', 'avatar'); }
    catch { undeclaredRejected = true; }

    let registrationRejected = false;
    try { core.registerApp('avatar', ['contacts']); }
    catch { registrationRejected = true; }

    const nativeMedia = navigator.mediaDevices;
    const originalGetUserMedia = nativeMedia.getUserMedia;
    window.__haldoV179OriginalGetUserMedia = originalGetUserMedia;
    window.__haldoV179MockStoppedTracks = 0;
    Object.defineProperty(nativeMedia, 'getUserMedia', {
      configurable: true,
      value: async () => ({
        getTracks: () => [{
          stop: () => { window.__haldoV179MockStoppedTracks += 1; }
        }]
      })
    });

    window.__haldoV179DeniedResult = null;
    const deniedPromise = platform.permissions.request('microphone', 'avatar')
      .then(value => { window.__haldoV179DeniedResult = value; return value; });
    return {
      version: core.version,
      appName: app?.name || null,
      status: core.getStatus(),
      manifest: core.listApps(),
      undeclaredRejected,
      registrationRejected,
      originalGetUserMediaType: typeof originalGetUserMedia,
      deniedPromiseStarted: !!deniedPromise
    };
  });
  assert.equal(permissionCoreAudit.version, '179.0.0');
  assert.equal(permissionCoreAudit.appName, 'HalDo Cyborg Avatar AI Pro');
  assert.equal(permissionCoreAudit.status.explicitConsentRequired, true);
  assert.equal(permissionCoreAudit.status.persistentGrants, false);
  assert.equal(permissionCoreAudit.status.sessionGrantCount, 0);
  const avatarManifest = permissionCoreAudit.manifest.find(item => item.id === 'avatar');
  assert.ok(avatarManifest, 'Das Avatar-Manifest fehlt.');
  assert.deepEqual(avatarManifest.permissions.map(item => item.id), ['microphone']);
  assert.equal(permissionCoreAudit.undeclaredRejected, true);
  assert.equal(permissionCoreAudit.registrationRejected, true);
  assert.equal(permissionCoreAudit.originalGetUserMediaType, 'function');
  assert.equal(permissionCoreAudit.deniedPromiseStarted, true);

  const consentRoot = page.locator('#winLayer .hdv179-consent').last();
  await consentRoot.locator('[data-consent-deny]').click();
  await page.waitForFunction(() => window.__haldoV179DeniedResult === false, { timeout: 5000 });
  await consentRoot.waitFor({ state: 'detached', timeout: 5000 });
  const deniedState = await page.evaluate(() => ({
    granted: window.HalDo.PermissionCore.has('microphone', 'avatar'),
    audit: window.HalDo.AICore.getRecentAudit(10).some(entry =>
      entry.event === 'haldo:core:permission:decision' &&
      entry.action === 'microphone' && entry.status === 'denied'
    )
  }));
  assert.equal(deniedState.granted, false);
  assert.equal(deniedState.audit, true);

  await page.evaluate(() => {
    window.__haldoV179GrantedResult = null;
    window.HalDo.AICore.permissions.request('microphone', 'avatar')
      .then(value => { window.__haldoV179GrantedResult = value; });
  });
  const secondConsent = page.locator('#winLayer .hdv179-consent').last();
  await secondConsent.locator('[data-consent-allow]').click();
  await page.waitForFunction(() => window.__haldoV179GrantedResult === true, { timeout: 5000 });
  const grantedState = await page.evaluate(() => ({
    granted: window.HalDo.AICore.permissions.has('microphone', 'avatar'),
    stoppedTracks: window.__haldoV179MockStoppedTracks,
    service: window.HalDo.AICore.getStatus().permissionService
  }));
  assert.equal(grantedState.granted, true);
  assert.equal(grantedState.stoppedTracks, 1, 'Temporäre Medienstreams müssen nach der Browserfreigabe sofort gestoppt werden.');
  assert.equal(grantedState.service, true);
  assert.equal(await page.evaluate(() => window.HalDo.AICore.permissions.revoke('microphone', 'avatar')), true);
  assert.equal(await page.evaluate(() => window.HalDo.AICore.permissions.has('microphone', 'avatar')), false);

  await page.evaluate(() => {
    window.__haldoV179ClosedResult = null;
    window.HalDo.AICore.permissions.request('microphone', 'avatar')
      .then(value => { window.__haldoV179ClosedResult = value; });
  });
  const cancelConsent = page.locator('#winLayer .hdv179-consent').last();
  await cancelConsent.waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#winLayer .win-pro').last().locator('.wc-close').click();
  await page.waitForFunction(() => window.__haldoV179ClosedResult === false, { timeout: 5000 });
  assert.equal(await page.evaluate(() => window.HalDo.PermissionCore.has('microphone', 'avatar')), false);

  await page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: window.__haldoV179OriginalGetUserMedia
    });
  });

  const privacyApp = await page.evaluate(() => ({
    registry: window.HalDo.AICore.getApp('privacy-center'),
    moduleOpen: typeof window.HalDo['privacy-center']?.open,
    manifest: window.HalDo.PermissionCore.listApps().find(app => app.id === 'avatar')
  }));
  assert.equal(privacyApp.registry.name, 'HalDo Privacy & Consent Center Pro');
  assert.equal(privacyApp.moduleOpen, 'function');
  assert.ok(privacyApp.manifest);
  await page.evaluate(() => window.HalDo.Launch({ id: 'privacy-center', n: 'HalDo Privacy & Consent Center Pro' }));
  await dismissWelcomeIfPresent();
  const privacyRoot = page.locator('#winLayer .hdv179-center').last();
  await privacyRoot.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(() => {
    const host = document.querySelector('#winLayer .hdv179-center [data-center-browser]');
    return !!host && host.querySelectorAll('div').length >= 4;
  }, { timeout: 10000 });
  assert.match(await privacyRoot.locator('[data-center-summary]').innerText(), /Aktive HalDo-Sitzungsfreigaben: 0/);
  assert.match(await privacyRoot.locator('[data-center-apps]').innerText(), /HalDo Cyborg Avatar AI Pro/);
  assert.match(await privacyRoot.locator('[data-center-apps]').innerText(), /Mikrofon/);
  assert.match(await privacyRoot.locator('[data-center-browser]').innerText(), /Kamera/);
  await closeWindow(privacyRoot);
  pass('HalDo Privacy & Consent Center Pro: App-Manifeste, Sitzungsfreigaben und getrennte Browserstatus sichtbar');
  // v180: encrypted IndexedDB vault, memory-only key, authenticated backup round-trip.
  const dataVaultAudit = await page.evaluate(async () => {
    const H = window.HalDo;
    const vault = H.DataVault;
    const passphrase = 'HalDo-Test-Passphrase-180';
    const marker = 'HDV180-PLAINTEXT-MUST-NEVER-LEAK-7391';
    await vault.create(passphrase);
    const recordId = await vault.put({ title: 'DataVault Regression', body: marker });
    const statusAfterCreate = await vault.getStatus();
    const storedRows = await new Promise((resolve, reject) => {
      const request = indexedDB.open('haldo_datavault_v180');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['records'], 'readonly');
        const get = tx.objectStore('records').getAll();
        get.onsuccess = () => { resolve(get.result || []); db.close(); };
        get.onerror = () => { db.close(); reject(get.error); };
      };
    });
    const rawIndexedDbText = JSON.stringify(storedRows);
    const backup = await vault.exportEncryptedBackup();
    const backupText = JSON.stringify(backup);
    const browserStorageText = [localStorage, sessionStorage].map(storage => {
      let text = '';
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        text += String(key) + String(storage.getItem(key));
      }
      return text;
    }).join('|');
    const cleartextAbsent = !rawIndexedDbText.includes(marker) &&
      !backupText.includes(marker) && !browserStorageText.includes(marker);
    const passphraseAbsent = !rawIndexedDbText.includes(passphrase) &&
      !backupText.includes(passphrase) && !browserStorageText.includes(passphrase);
    const readBeforeLock = await vault.get(recordId);
    vault.lock();
    let lockedReadRejected = false;
    try { await vault.get(recordId); } catch { lockedReadRejected = true; }
    let wrongPassphraseRejected = false;
    try { await vault.unlock('Wrong-HalDo-Passphrase'); }
    catch { wrongPassphraseRejected = true; }
    const stillLockedAfterWrongPassphrase = !vault.isUnlocked();
    await vault.unlock(passphrase);
    const readAfterUnlock = await vault.get(recordId);
    await vault.deleteVault();
    const imported = await vault.importEncryptedBackup(backupText, passphrase);
    const readAfterImport = await vault.get(recordId);
    const statusAfterImport = await vault.getStatus();
    return {
      version: vault.version,
      storage: statusAfterCreate.storage,
      unlockedAfterCreate: statusAfterCreate.unlocked,
      recordCountAfterCreate: statusAfterCreate.recordCount,
      cleartextAbsent,
      passphraseAbsent,
      readBeforeLock: readBeforeLock.body,
      lockedReadRejected,
      wrongPassphraseRejected,
      stillLockedAfterWrongPassphrase,
      readAfterUnlock: readAfterUnlock.body,
      imported: imported.imported,
      importedRecords: imported.records,
      readAfterImport: readAfterImport.body,
      vaultExistsAfterImport: statusAfterImport.vaultExists,
      unlockedAfterImport: statusAfterImport.unlocked
    };
  });
  assert.equal(dataVaultAudit.version, '180.0.0');
  assert.equal(dataVaultAudit.storage, 'indexeddb-encrypted');
  assert.equal(dataVaultAudit.unlockedAfterCreate, true);
  assert.equal(dataVaultAudit.recordCountAfterCreate, 1);
  assert.equal(dataVaultAudit.cleartextAbsent, true, 'Klartext darf weder in IndexedDB noch im Export oder Browser-Webstorage erscheinen.');
  assert.equal(dataVaultAudit.passphraseAbsent, true, 'Die Passphrase darf nicht persistent gespeichert werden.');
  assert.equal(dataVaultAudit.readBeforeLock, 'HDV180-PLAINTEXT-MUST-NEVER-LEAK-7391');
  assert.equal(dataVaultAudit.lockedReadRejected, true);
  assert.equal(dataVaultAudit.wrongPassphraseRejected, true);
  assert.equal(dataVaultAudit.stillLockedAfterWrongPassphrase, true);
  assert.equal(dataVaultAudit.readAfterUnlock, 'HDV180-PLAINTEXT-MUST-NEVER-LEAK-7391');
  assert.equal(dataVaultAudit.imported, true);
  assert.equal(dataVaultAudit.importedRecords, 1);
  assert.equal(dataVaultAudit.readAfterImport, 'HDV180-PLAINTEXT-MUST-NEVER-LEAK-7391');
  assert.equal(dataVaultAudit.vaultExistsAfterImport, true);
  assert.equal(dataVaultAudit.unlockedAfterImport, true);
  const dataVaultCleanup = await page.evaluate(async () => {
    await window.HalDo.DataVault.deleteVault();
    const status = await window.HalDo.DataVault.getStatus();
    return {
      vaultExists: status.vaultExists,
      unlocked: status.unlocked,
      app: window.HalDo.AICore.getApp('data-vault')
    };
  });
  assert.equal(dataVaultCleanup.vaultExists, false);
  assert.equal(dataVaultCleanup.unlocked, false);
  assert.equal(dataVaultCleanup.app.name, 'HalDo DataVault Pro');
  pass('HalDo DataVault Pro v180: IndexedDB-Verschlüsselung, Sitzungsschlüssel, falsche Passphrase und Backup-Import geprüft');
  const launchChecks = [
    ['avatar', 'Living HalDo AI'],
    ['bibliothek', 'HalDo Bibliothek Pro'],
    ['inventar', 'HalDo Inventar Pro'],
    ['mindmap', 'HalDo Mindmap Pro'],
    ['haushalt', 'HalDo Haushaltsmanager Pro'],
    ['keyboard-pro', 'HalDo Keyboard Studio Pro'],
    ['datei-konverter', 'HalDo Datei-Konverter Pro'],
    ['data-vault', 'HalDo DataVault Pro']
  ];
  for (const [appId, title] of launchChecks) {
    await page.evaluate((id) => window.HalDo.Launch({ id, n: id }), appId);
    await dismissWelcomeIfPresent();
    const openedTitle = page.locator('#winLayer').getByText(title, { exact: false }).last();
    await openedTitle.waitFor({ state: 'visible', timeout: 10000 });
    await closeWindow(openedTitle);
  }
  pass('HalDo Core: Living Avatar und sechs v165/v166-Apps öffnen ihre eigenen Module über den zentralen Launcher');

  // v168: world clock with persistent timezone list.
  const v168Build = await page.evaluate(() => ({
    version: window.HalDo.Master.version,
    worldClock: window.HalDo.AppBrowser.getStatus('worldclock'),
    recipeScaler: window.HalDo.AppBrowser.getStatus('recipe-scaler')
  }));
  assert.equal(v168Build.version, '177.0.0');
  assert.equal(v168Build.worldClock.kind, 'module');
  assert.equal(v168Build.recipeScaler.kind, 'module');
  const v168Runtime = await page.evaluate(() => ({
    worldClockOpen: typeof window.HalDo.worldclock?.open,
    recipeScalerOpen: typeof window.HalDo['recipe-scaler']?.open,
    build: window.HalDo.Master.version,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v168-core-apps.js'))
  }));
  console.log('HALDO V168 RUNTIME ' + JSON.stringify(v168Runtime));
  assert.equal(v168Runtime.worldClockOpen, 'function');
  assert.equal(v168Runtime.recipeScalerOpen, 'function');
  assert.equal(v168Runtime.scriptLoaded, true);
  assert.equal(v168Runtime.build, '177.0.0');
  // Test the World Clock module directly here. The global welcome/launcher flow
  // is covered separately; keeping it out of this module test avoids conflating
  // welcome-overlay timing with the actual window and clock implementation.
  await page.evaluate(() => window.HalDo.worldclock.open());
  const worldClockRoot = page.locator('#winLayer .hdv168-root').last();
  await worldClockRoot.waitFor({ state: 'visible', timeout: 10000 });
  const worldClockCards = worldClockRoot.locator('[data-wc-card]');
  await worldClockCards.first().waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await worldClockCards.count(), 4);
  assert.notEqual(await worldClockRoot.locator('[data-wc-time="berlin"]').innerText(), '--:--:--');
  await worldClockRoot.locator('[data-wc-select]').selectOption('Asia/Dubai');
  await worldClockRoot.locator('[data-wc-add]').click();
  await worldClockRoot.locator('[data-wc-card]').filter({ hasText: 'Dubai' }).waitFor({ state: 'visible' });
  assert.equal(await worldClockCards.count(), 5);
  const savedZones = await page.evaluate(() => window.HalDo.Store.get('haldo_v168_world_clock_zones', []));
  assert.equal(savedZones.length, 5);
  await closeWindow(worldClockRoot);
  await page.evaluate(() => window.HalDo.worldclock.open());
  const reopenedWorldClock = page.locator('#winLayer .hdv168-root').last();
  await reopenedWorldClock.waitFor({ state: 'visible', timeout: 10000 });
  await reopenedWorldClock.locator('[data-wc-card]').first().waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await reopenedWorldClock.locator('[data-wc-card]').count(), 5);
  await reopenedWorldClock.locator('[data-wc-search]').fill('Dubai');
  assert.equal(await reopenedWorldClock.locator('[data-wc-card]:visible').count(), 1);
  await reopenedWorldClock.locator('[data-wc-search]').fill('');
  await reopenedWorldClock.locator('[data-wc-card]').filter({ hasText: 'Dubai' }).locator('[data-wc-remove]').click();
  assert.equal(await reopenedWorldClock.locator('[data-wc-card]').count(), 4);
  const zonesAfterRemoval = await page.evaluate(() => window.HalDo.Store.get('haldo_v168_world_clock_zones', []));
  assert.equal(zonesAfterRemoval.length, 4);
  await closeWindow(reopenedWorldClock);
  pass('HalDo Weltuhr Pro: IANA-Zeitzonen hinzufügen, live anzeigen, speichern, wiederherstellen, filtern und entfernen');

  // v168: recipe authoring and portion scaling preserve base amounts.
  await page.evaluate(() => window.HalDo.Launch({ id: 'recipe-scaler', n: 'HalDo Rezept-Skalierung Pro' }));
  await dismissWelcomeIfPresent();
  const recipeRoot = page.locator('#winLayer .hdv168-root').last();
  await recipeRoot.waitFor({ state: 'visible', timeout: 10000 });
  await recipeRoot.locator('[data-rs-new]').first().click();
  await recipeRoot.locator('[data-rs-name]').fill('E2E Pfannkuchen');
  await recipeRoot.locator('[data-rs-base-servings]').fill('2');
  let ingredientRows = recipeRoot.locator('[data-rs-ingredient]');
  await ingredientRows.nth(0).locator('[data-rs-ingredient-name]').fill('Mehl');
  await ingredientRows.nth(0).locator('[data-rs-ingredient-amount]').fill('200');
  await ingredientRows.nth(0).locator('[data-rs-ingredient-unit]').fill('g');
  await recipeRoot.locator('[data-rs-add-ingredient]').click();
  ingredientRows = recipeRoot.locator('[data-rs-ingredient]');
  assert.equal(await ingredientRows.count(), 2);
  await ingredientRows.nth(1).locator('[data-rs-ingredient-name]').fill('Milch');
  await ingredientRows.nth(1).locator('[data-rs-ingredient-amount]').fill('300');
  await ingredientRows.nth(1).locator('[data-rs-ingredient-unit]').fill('ml');
  await recipeRoot.locator('[data-rs-save]').click();
  await recipeRoot.locator('[data-rs-recipe-list] [data-rs-open]').filter({ hasText: 'E2E Pfannkuchen' }).waitFor({ state: 'visible' });
  assert.deepEqual(await recipeRoot.locator('[data-rs-scaled-amount]').allTextContents(), ['200', '300']);
  await recipeRoot.locator('[data-rs-target-servings]').fill('4');
  assert.deepEqual(await recipeRoot.locator('[data-rs-scaled-amount]').allTextContents(), ['400', '600']);
  const originalRecipe = await page.evaluate(() => window.HalDo.Store.get('haldo_v168_recipes', [])[0]);
  assert.equal(originalRecipe.baseServings, 2);
  assert.equal(originalRecipe.ingredients[0].amount, 200);
  assert.equal(originalRecipe.ingredients[1].amount, 300);
  await recipeRoot.locator('[data-rs-delete]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v168_recipes', []).length), 0);
  assert.equal(await recipeRoot.getByText('Noch keine Rezepte gespeichert.').count(), 1);
  await closeWindow(recipeRoot);
  pass('HalDo Rezept-Skalierung Pro: Rezepte anlegen, Zutaten pflegen, Portionen skalieren, Basisdaten bewahren und löschen');

  // v169: workout planner CRUD, search, and durable local persistence.
  const v169Runtime = await page.evaluate(() => ({
    build: window.HalDo.AppsV169 && window.HalDo.AppsV169.version,
    workout: window.HalDo.AppBrowser.getStatus('workout'),
    utilities: window.HalDo.AppBrowser.getStatus('utilities'),
    workoutOpen: typeof window.HalDo.workout?.open,
    utilitiesOpen: typeof window.HalDo.utilities?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v169-a-z-apps.js'))
  }));
  console.log('HALDO V169 RUNTIME ' + JSON.stringify(v169Runtime));
  assert.equal(v169Runtime.build, '169.0.0');
  assert.equal(v169Runtime.workout.kind, 'module');
  assert.equal(v169Runtime.utilities.kind, 'module');
  assert.equal(v169Runtime.workoutOpen, 'function');
  assert.equal(v169Runtime.utilitiesOpen, 'function');
  assert.equal(v169Runtime.scriptLoaded, true);

  await page.evaluate(() => window.HalDo.Launch({ id: 'workout', n: 'HalDo Workout Planner Pro' }));
  await dismissWelcomeIfPresent();
  const workoutRoot = page.locator('#winLayer .hdv169-root[data-hv169-app="workout"]').last();
  await workoutRoot.waitFor({ state: 'visible', timeout: 10000 });
  await workoutRoot.locator('[data-wk-new]').click();
  await workoutRoot.locator('[data-wk-name]').fill('E2E Ganzkörpertraining');
  await workoutRoot.locator('[data-wk-exercise-name]').first().fill('Kniebeugen');
  await workoutRoot.locator('[data-wk-sets]').first().fill('3');
  await workoutRoot.locator('[data-wk-reps]').first().fill('12');
  await workoutRoot.locator('[data-wk-weight]').first().fill('20');
  await workoutRoot.locator('[data-wk-add-exercise]').click();
  let workoutExercises = workoutRoot.locator('[data-wk-exercise]');
  assert.equal(await workoutExercises.count(), 2);
  await workoutExercises.nth(1).locator('[data-wk-exercise-name]').fill('Rudern');
  await workoutExercises.nth(1).locator('[data-wk-sets]').fill('4');
  await workoutExercises.nth(1).locator('[data-wk-reps]').fill('10');
  await workoutRoot.locator('[data-wk-save]').click();
  await workoutRoot.locator('[data-wk-list] [data-wk-open]').filter({ hasText: 'E2E Ganzkörpertraining' }).waitFor({ state: 'visible' });
  let savedWorkout = await page.evaluate(() => window.HalDo.Store.get('haldo_v169_workout_sessions', [])[0]);
  assert.equal(savedWorkout.name, 'E2E Ganzkörpertraining');
  assert.equal(savedWorkout.exercises.length, 2);
  assert.equal(savedWorkout.exercises[0].reps, 12);
  await workoutRoot.locator('[data-wk-edit]').click();
  await workoutRoot.locator('[data-wk-reps]').first().fill('15');
  await workoutRoot.locator('[data-wk-save]').click();
  savedWorkout = await page.evaluate(() => window.HalDo.Store.get('haldo_v169_workout_sessions', [])[0]);
  assert.equal(savedWorkout.exercises[0].reps, 15);
  await workoutRoot.locator('[data-wk-search]').fill('Kniebeugen');
  assert.equal(await workoutRoot.locator('[data-wk-list] [data-wk-open]').count(), 1);
  await workoutRoot.locator('[data-wk-search]').fill('kein treffer');
  assert.equal(await workoutRoot.locator('[data-wk-list] [data-wk-open]').count(), 0);
  await workoutRoot.locator('[data-wk-search]').fill('');
  await workoutRoot.locator('[data-wk-delete]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v169_workout_sessions', []).length), 0);
  await closeWindow(workoutRoot);
  pass('HalDo Workout Planner Pro: Trainingspläne anlegen, Übungen pflegen, bearbeiten, suchen und löschen');

  await page.evaluate(() => window.HalDo.Launch({ id: 'utilities', n: 'HalDo Werkzeuge Pro' }));
  await dismissWelcomeIfPresent();
  const utilitiesRoot = page.locator('#winLayer .hdv169-root[data-hv169-app="utilities"]').last();
  await utilitiesRoot.waitFor({ state: 'visible', timeout: 10000 });
  await utilitiesRoot.locator('[data-u-category]').selectOption('length');
  await utilitiesRoot.locator('[data-u-value]').fill('2500');
  await utilitiesRoot.locator('[data-u-convert]').click();
  assert.equal(await utilitiesRoot.locator('[data-u-result]').innerText(), '2,5 km');
  let utilityHistory = await page.evaluate(() => window.HalDo.Store.get('haldo_v169_utility_history', []));
  assert.equal(utilityHistory.length, 1);
  await utilitiesRoot.locator('[data-u-tab="percent"]').click();
  await utilitiesRoot.locator('[data-u-percent-base]').fill('200');
  await utilitiesRoot.locator('[data-u-percent-rate]').fill('15');
  await utilitiesRoot.locator('[data-u-percent-calc]').click();
  assert.equal(await utilitiesRoot.locator('[data-u-result]').innerText(), '30');
  await utilitiesRoot.locator('[data-u-tab="dates"]').click();
  await utilitiesRoot.locator('[data-u-date-start]').fill('2026-11-01');
  await utilitiesRoot.locator('[data-u-date-end]').fill('2026-11-26');
  await utilitiesRoot.locator('[data-u-date-calc]').click();
  assert.equal(await utilitiesRoot.locator('[data-u-result]').innerText(), '25 Tage');
  utilityHistory = await page.evaluate(() => window.HalDo.Store.get('haldo_v169_utility_history', []));
  assert.equal(utilityHistory.length, 3);
  await utilitiesRoot.locator('[data-u-clear-history]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v169_utility_history', []).length), 0);
  await closeWindow(utilitiesRoot);
  pass('HalDo Werkzeuge Pro: Einheiten, Prozentwerte und Datumsabstände berechnen und Verlauf verwalten');

  const v170Runtime = await page.evaluate(() => ({
    build: window.HalDo.AppsV170 && window.HalDo.AppsV170.version,
    recipes: window.HalDo.AppBrowser.getStatus('recipes'),
    analyzer: window.HalDo.AppBrowser.getStatus('analyzer'),
    recipesOpen: typeof window.HalDo.recipes?.open,
    analyzerOpen: typeof window.HalDo.analyzer?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v170-productivity-apps.js'))
  }));
  console.log('HALDO V170 RUNTIME ' + JSON.stringify(v170Runtime));
  assert.equal(v170Runtime.build, '170.0.0');
  assert.equal(v170Runtime.recipes.kind, 'module');
  assert.equal(v170Runtime.analyzer.kind, 'module');
  assert.equal(v170Runtime.recipesOpen, 'function');
  assert.equal(v170Runtime.analyzerOpen, 'function');
  assert.equal(v170Runtime.scriptLoaded, true);

  // Recipe book: required fields, ingredient rows, steps, favorite, edit, filter, delete.
  await page.evaluate(() => window.HalDo.Launch({ id: 'recipes', n: 'HalDo Rezepte Pro' }));
  await dismissWelcomeIfPresent();
  const recipesRoot = page.locator('#winLayer .hdv170-root[data-hv170-app="recipes"]').last();
  await recipesRoot.waitFor({ state: 'visible', timeout: 10000 });
  await recipesRoot.locator('[data-r170-new]').click();
  await recipesRoot.locator('[data-r170-save]').click();
  assert.match(await recipesRoot.locator('[data-r170-status]').innerText(), /Rezeptname/);
  await recipesRoot.locator('[data-r170-name]').fill('E2E Linsensuppe');
  await recipesRoot.locator('[data-r170-category]').selectOption('Hauptgericht');
  await recipesRoot.locator('[data-r170-servings]').fill('2');
  await recipesRoot.locator('[data-r170-prep]').fill('30');
  await recipesRoot.locator('[data-r170-ingredient-name]').first().fill('Linsen');
  await recipesRoot.locator('[data-r170-ingredient-amount]').first().fill('200');
  await recipesRoot.locator('[data-r170-ingredient-unit]').first().fill('g');
  await recipesRoot.locator('[data-r170-add-ingredient]').click();
  const recipeIngredients = recipesRoot.locator('[data-r170-ingredient]');
  assert.equal(await recipeIngredients.count(), 2);
  await recipeIngredients.nth(1).locator('[data-r170-ingredient-name]').fill('Wasser');
  await recipeIngredients.nth(1).locator('[data-r170-ingredient-amount]').fill('500');
  await recipeIngredients.nth(1).locator('[data-r170-ingredient-unit]').fill('ml');
  await recipesRoot.locator('[data-r170-steps]').fill('Linsen abspülen.\nMit Wasser weich kochen.');
  await recipesRoot.locator('[data-r170-save]').click();
  await recipesRoot.locator('[data-r170-list] [data-r170-open]').filter({ hasText: 'E2E Linsensuppe' }).waitFor({ state: 'visible' });
  let savedRecipe = await page.evaluate(() => window.HalDo.Store.get('haldo_v170_recipe_book', [])[0]);
  assert.equal(savedRecipe.ingredients.length, 2);
  assert.equal(savedRecipe.steps.length, 2);
  assert.equal(savedRecipe.category, 'Hauptgericht');
  await closeWindow(recipesRoot);
  await page.evaluate(() => window.HalDo.Launch({ id: 'recipes', n: 'HalDo Rezepte Pro' }));
  await dismissWelcomeIfPresent();
  await recipesRoot.waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await recipesRoot.locator('[data-r170-list] [data-r170-open]').count(), 1);
  await recipesRoot.locator('[data-r170-favorite]').click();
  savedRecipe = await page.evaluate(() => window.HalDo.Store.get('haldo_v170_recipe_book', [])[0]);
  assert.equal(savedRecipe.favorite, true);
  await recipesRoot.locator('[data-r170-edit]').click();
  await recipesRoot.locator('[data-r170-prep]').fill('35');
  await recipesRoot.locator('[data-r170-save]').click();
  savedRecipe = await page.evaluate(() => window.HalDo.Store.get('haldo_v170_recipe_book', [])[0]);
  assert.equal(savedRecipe.prepMinutes, 35);
  await recipesRoot.locator('[data-r170-search]').fill('Wasser');
  assert.equal(await recipesRoot.locator('[data-r170-list] [data-r170-open]').count(), 1);
  await recipesRoot.locator('[data-r170-filter]').selectOption('Hauptgericht');
  assert.equal(await recipesRoot.locator('[data-r170-list] [data-r170-open]').count(), 1);
  await recipesRoot.locator('[data-r170-search]').fill('kein Treffer');
  assert.equal(await recipesRoot.locator('[data-r170-list] [data-r170-open]').count(), 0);
  await recipesRoot.locator('[data-r170-search]').fill('');
  await recipesRoot.locator('[data-r170-delete]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v170_recipe_book', []).length), 0);
  await closeWindow(recipesRoot);
  pass('HalDo Rezepte Pro: Rezepte, Kategorien, Zutaten und Schritte anlegen, Favorit setzen, bearbeiten, suchen und löschen');

  // Text analyzer: live metrics and summary-only local history (never raw text).
  await page.evaluate(() => window.HalDo.Launch({ id: 'analyzer', n: 'HalDo Text Analyzer Pro' }));
  await dismissWelcomeIfPresent();
  const analyzerRoot = page.locator('#winLayer .hdv170-root[data-hv170-app="analyzer"]').last();
  await analyzerRoot.waitFor({ state: 'visible', timeout: 10000 });
  await analyzerRoot.locator('[data-an170-title]').fill('E2E Textprobe');
  await analyzerRoot.locator('[data-an170-text]').fill('HalDo baut professionelle Apps. Apps bleiben sicher und lokal.');
  assert.equal(await analyzerRoot.locator('[data-an170-words]').innerText(), '9');
  assert.equal(await analyzerRoot.locator('[data-an170-sentences]').innerText(), '2');
  assert.equal(await analyzerRoot.locator('[data-an170-reading]').innerText(), '1');
  await analyzerRoot.locator('[data-an170-save]').click();
  let analysisHistory = await page.evaluate(() => window.HalDo.Store.get('haldo_v170_text_analysis_history', []));
  assert.equal(analysisHistory.length, 1);
  assert.equal(analysisHistory[0].title, 'E2E Textprobe');
  assert.equal(analysisHistory[0].words, 9);
  assert.equal(Object.prototype.hasOwnProperty.call(analysisHistory[0], 'text'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(analysisHistory[0], 'rawText'), false);
  await closeWindow(analyzerRoot);
  await page.evaluate(() => window.HalDo.Launch({ id: 'analyzer', n: 'HalDo Text Analyzer Pro' }));
  await dismissWelcomeIfPresent();
  const reopenedAnalyzer = page.locator('#winLayer .hdv170-root[data-hv170-app="analyzer"]').last();
  await reopenedAnalyzer.waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await reopenedAnalyzer.locator('[data-an170-history] li').count(), 1);
  await reopenedAnalyzer.locator('[data-an170-clear-history]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v170_text_analysis_history', []).length), 0);
  await closeWindow(reopenedAnalyzer);
  pass('HalDo Text Analyzer Pro: Textkennzahlen live berechnen, nur Statistik lokal speichern und Verlauf wiederherstellen/löschen');

  const v171Runtime = await page.evaluate(() => ({
    build: window.HalDo.AppsV171 && window.HalDo.AppsV171.version,
    datecalc: window.HalDo.AppBrowser.getStatus('datecalc'),
    deviceInfo: window.HalDo.AppBrowser.getStatus('device-info'),
    datecalcOpen: typeof window.HalDo.datecalc?.open,
    deviceInfoOpen: typeof window.HalDo['device-info']?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v171-date-device-apps.js'))
  }));
  console.log('HALDO V171 RUNTIME ' + JSON.stringify(v171Runtime));
  assert.equal(v171Runtime.build, '171.0.0');
  assert.equal(v171Runtime.datecalc.kind, 'module');
  assert.equal(v171Runtime.deviceInfo.kind, 'module');
  assert.equal(v171Runtime.datecalcOpen, 'function');
  assert.equal(v171Runtime.deviceInfoOpen, 'function');
  assert.equal(v171Runtime.scriptLoaded, true);

  // Date Calculator: month-end clamping, working-day count, calendar metadata, history.
  await page.evaluate(() => window.HalDo.Launch({ id: 'datecalc', n: 'HalDo Datumsrechner Pro' }));
  await dismissWelcomeIfPresent();
  const dateRoot = page.locator('#winLayer .hdv171-root[data-hv171-app="datecalc"]').last();
  await dateRoot.waitFor({ state: 'visible', timeout: 10000 });
  await dateRoot.locator('[data-dc-base]').fill('2026-01-31');
  await dateRoot.locator('[data-dc-amount]').fill('1');
  await dateRoot.locator('[data-dc-unit]').selectOption('months');
  await dateRoot.locator('[data-dc-calculate]').click();
  assert.match(await dateRoot.locator('[data-dc-result]').innerText(), /^2026-02-28/);
  await dateRoot.locator('[data-dc-tab="difference"]').click();
  await dateRoot.locator('[data-dc-start]').fill('2026-11-01');
  await dateRoot.locator('[data-dc-end]').fill('2026-11-26');
  await dateRoot.locator('[data-dc-gap-calc]').click();
  assert.equal(await dateRoot.locator('[data-dc-result]').innerText(), '25 Kalendertage · 19 Arbeitstage (Mo–Fr)');
  await dateRoot.locator('[data-dc-tab="calendar"]').click();
  await dateRoot.locator('[data-dc-info-date]').fill('2026-11-26');
  await dateRoot.locator('[data-dc-info-calc]').click();
  assert.match(await dateRoot.locator('[data-dc-result]').innerText(), /Donnerstag · ISO-KW 48 · Kein Schaltjahr · 2026/);
  let dateHistory = await page.evaluate(() => window.HalDo.Store.get('haldo_v171_datecalc_history', []));
  assert.equal(dateHistory.length, 3);
  await dateRoot.locator('[data-dc-clear-history]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v171_datecalc_history', []).length), 0);
  await closeWindow(dateRoot);
  pass('HalDo Datumsrechner Pro: Monatsende korrekt begrenzen, Arbeitstage zählen, ISO-Kalenderdaten berechnen und Verlauf verwalten');

  // Device info: read-only browser snapshot; never request device permissions or expose network identifiers.
  await page.evaluate(() => window.HalDo.Launch({ id: 'device-info', n: 'HalDo Geräte-Info Pro' }));
  await dismissWelcomeIfPresent();
  const deviceRoot = page.locator('#winLayer .hdv171-root[data-hv171-app="device-info"]').last();
  await deviceRoot.waitFor({ state: 'visible', timeout: 10000 });
  await deviceRoot.locator('[data-di-details]').waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await deviceRoot.locator('[data-di-details]').innerText(), /Browserkennung/);
  assert.match(await deviceRoot.locator('[data-di-details]').innerText(), /Zeitzone/);
  assert.match(await deviceRoot.locator('[data-di-details]').innerText(), /Bildschirm/);
  assert.match(await deviceRoot.locator('[data-di-capabilities]').innerText(), /WebGL/);
  assert.match(await deviceRoot.innerText(), /WLAN-SSID, MAC-Adresse, gekoppelte Bluetooth-Geräte/);
  const deviceDetailsText = await deviceRoot.locator('[data-di-details]').innerText();
  assert.equal(deviceDetailsText.includes('MAC-Adresse'), false);
  await deviceRoot.locator('[data-di-refresh]').click();
  assert.match(await deviceRoot.locator('[data-di-status]').innerText(), /aktualisiert/);
  await closeWindow(deviceRoot);
  pass('HalDo Geräte-Info Pro: Browser-/Display-/API-Diagnose lokal anzeigen, aktualisieren und keine Funk-IDs auslesen');

  // v172: two formerly generic scaffolds are replaced by real independent apps.
  const v172Source = await fs.readFile(path.join(ROOT, 'js/haldo-v172-learning-apps.js'), 'utf8');
  assert.equal(/\beval\s*\(/.test(v172Source), false, 'Wissenschaftsrechner darf keine dynamische Auswertung verwenden.');
  assert.equal(/\bnew\s+Function\s*\(/.test(v172Source), false, 'Wissenschaftsrechner darf keine dynamischen Funktionen erzeugen.');
  const v172Runtime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    moduleVersion: window.HalDo.AppsV172.version,
    apps: window.HalDo.AppsV172.apps.map((app) => app.id),
    breathing: window.HalDo.AppBrowser.getStatus('breathing'),
    scientific: window.HalDo.AppBrowser.getStatus('scientific'),
    breathingOpen: typeof window.HalDo.breathing?.open,
    scientificOpen: typeof window.HalDo.scientific?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v172-learning-apps.js'))
  }));
  assert.equal(v172Runtime.build, '177.0.0');
  assert.equal(v172Runtime.moduleVersion, '172.0.0');
  assert.deepEqual(v172Runtime.apps, ['breathing', 'scientific']);
  assert.equal(v172Runtime.breathing.kind, 'module');
  assert.equal(v172Runtime.scientific.kind, 'module');
  assert.equal(v172Runtime.breathingOpen, 'function');
  assert.equal(v172Runtime.scientificOpen, 'function');
  assert.equal(v172Runtime.scriptLoaded, true);
  pass('HalDo v172: Atemtrainer und Wissenschaftsrechner sind als eigene Module registriert');

  await page.evaluate(() => window.HalDo.Launch({ id: 'breathing', n: 'HalDo Atemtrainer Pro' }));
  await page.locator('#haldo-v161-welcome').waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await page.locator('#haldo-v161-welcome .h161-title').innerText(), /HalDo Atemtrainer Pro/);
  await dismissWelcomeIfPresent();
  const breathingRoot = page.locator('#winLayer .hdv172-root[data-hv172-app="breathing"]').last();
  await breathingRoot.waitFor({ state: 'visible', timeout: 10000 });
  await breathingRoot.locator('[data-b172-pattern]').selectOption('box');
  await breathingRoot.locator('[data-b172-cycles]').selectOption('2');
  const breathingPrefs = await page.evaluate(() => window.HalDo.Store.get('haldo_v172_breathing_preferences', {}));
  assert.deepEqual(breathingPrefs, { pattern: 'box', cycles: 2 });
  await breathingRoot.locator('[data-b172-start]').click();
  assert.equal(await breathingRoot.locator('[data-b172-phase]').innerText(), 'Einatmen');
  assert.equal(await breathingRoot.locator('[data-b172-time]').innerText(), '4');
  assert.equal(await breathingRoot.locator('[data-b172-pause]').isDisabled(), false);
  await breathingRoot.locator('[data-b172-pause]').click();
  assert.equal(await breathingRoot.locator('[data-b172-start]').innerText(), '▶ Fortsetzen');
  assert.match(await breathingRoot.locator('[data-b172-status]').innerText(), /Pausiert/);
  const pausedBreathTime = await breathingRoot.locator('[data-b172-time]').innerText();
  await breathingRoot.locator('[data-b172-start]').click();
  assert.equal(await breathingRoot.locator('[data-b172-pause]').isDisabled(), false);
  assert.equal(await breathingRoot.locator('[data-b172-time]').innerText(), pausedBreathTime);
  await breathingRoot.locator('[data-b172-reset]').click();
  assert.match(await breathingRoot.locator('[data-b172-status]').innerText(), /Zurückgesetzt/);
  assert.equal(await breathingRoot.locator('[data-b172-pattern]').isDisabled(), false);
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v172_breathing_history', []).length), 0);
  await closeWindow(breathingRoot);
  pass('HalDo Atemtrainer Pro: Muster auswählen, Runden setzen, starten, pausieren, fortsetzen und sicher zurücksetzen');

  await page.evaluate(() => window.HalDo.Launch({ id: 'scientific', n: 'HalDo Wissenschaftsrechner Pro' }));
  await page.locator('#haldo-v161-welcome').waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await page.locator('#haldo-v161-welcome .h161-title').innerText(), /HalDo Wissenschaftsrechner Pro/);
  await dismissWelcomeIfPresent();
  const scientificRoot = page.locator('#winLayer .hdv172-root[data-hv172-app="scientific"]').last();
  await scientificRoot.waitFor({ state: 'visible', timeout: 10000 });
  const scientificInput = scientificRoot.locator('[data-s172-expression]');
  const scientificResult = scientificRoot.locator('[data-s172-result]');
  await scientificInput.fill('sqrt(81)+sin(30)');
  await scientificRoot.locator('[data-s172-calculate]').click();
  assert.equal(await scientificResult.innerText(), '9.5');
  await scientificInput.fill('2^3^2');
  await scientificRoot.locator('[data-s172-calculate]').click();
  assert.equal(await scientificResult.innerText(), '512');
  await scientificInput.fill('1/0');
  await scientificRoot.locator('[data-s172-calculate]').click();
  assert.match(await scientificRoot.locator('[data-s172-status]').innerText(), /Division durch null/);
  assert.equal(await scientificResult.innerText(), '–');
  await scientificRoot.locator('[data-s172-angle]').click();
  assert.equal(await scientificRoot.locator('[data-s172-angle]').innerText(), 'RAD');
  await scientificInput.fill('sin(pi/2)');
  await scientificRoot.locator('[data-s172-calculate]').click();
  assert.equal(await scientificResult.innerText(), '1');
  await scientificRoot.locator('[data-s172-angle]').click();
  await scientificInput.fill('Ans+1');
  await scientificRoot.locator('[data-s172-calculate]').click();
  assert.equal(await scientificResult.innerText(), '2');
  const scientificHistory = await page.evaluate(() => window.HalDo.Store.get('haldo_v172_scientific_history', []));
  assert.equal(scientificHistory.length, 4);
  await closeWindow(scientificRoot);
  await page.evaluate(() => window.HalDo.Launch({ id: 'scientific', n: 'HalDo Wissenschaftsrechner Pro' }));
  await dismissWelcomeIfPresent();
  const reopenedScientific = page.locator('#winLayer .hdv172-root[data-hv172-app="scientific"]').last();
  await reopenedScientific.waitFor({ state: 'visible', timeout: 10000 });
  await reopenedScientific.locator('ul[data-s172-history]').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(() => {
    const roots = Array.from(document.querySelectorAll('.hdv172-root[data-hv172-app="scientific"]'));
    const root = roots[roots.length - 1];
    return !!root && !!root.querySelector('[data-s172-history] li');
  });
  assert.equal(await reopenedScientific.locator('[data-s172-history] li').count(), 4);
  await reopenedScientific.locator('[data-s172-clear-history]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v172_scientific_history', []).length), 0);
  await closeWindow(reopenedScientific);
  pass('HalDo Wissenschaftsrechner Pro: DEG/RAD, Funktionen, Potenzbindung, Ans, Fehlerbehandlung und Verlauf sicher berechnen');








  const registryHealth = await page.evaluate(() => {
    const H = window.HalDo;
    const apps = H.Registry.featured;
    const categories = H.Registry.getCategories();
    const statuses = apps.map((app) => ({ id: app.id, ...H.AppBrowser.getStatus(app.id) }));
    return {
      appCount: apps.length,
      uniqueIds: new Set(apps.map((app) => app.id)).size,
      categoryCount: Object.keys(categories).length,
      plannedSlots: Object.values(categories).reduce((sum, category) => sum + Number(category.count || 0), 0),
      statusCounts: {
        modules: statuses.filter((item) => item.kind === 'module').length,
        scaffolds: statuses.filter((item) => item.kind === 'scaffold').length,
        routes: statuses.filter((item) => item.kind === 'route').length,
        review: statuses.filter((item) => item.kind === 'review').length
      },
      statusInventory: statuses,
      tasksRoute: H.SystemV157.resolveRoute('tasks'),
      avatarRoute: H.SystemV157.resolveRoute('avatar'),
      avatarStatus: H.AppBrowser.getStatus('avatar'),
      remindersRoute: H.SystemV157.resolveRoute('reminders'),
      reminders: H.AppBrowser.getStatus('reminders'),
      chatPro: H.AppBrowser.getStatus('chat-pro'),
      tasks: H.AppBrowser.getStatus('tasks'),
      languageVoice: H.AppBrowser.getStatus('language-voice'),
      aiVoiceCore: H.AppBrowser.getStatus('ai-voice-core'),
      systemDiagnostics: H.AppBrowser.getStatus('system-diagnostics'),
      workout: H.AppBrowser.getStatus('workout'),
      utilities: H.AppBrowser.getStatus('utilities'),
      recipes: H.AppBrowser.getStatus('recipes'),
      analyzer: H.AppBrowser.getStatus('analyzer'),
      datecalc: H.AppBrowser.getStatus('datecalc'),
      deviceInfo: H.AppBrowser.getStatus('device-info'),
      breathing: H.AppBrowser.getStatus('breathing'),
      scientific: H.AppBrowser.getStatus('scientific'),
      geoQuiz: H.AppBrowser.getStatus('geo-quiz'),
      musicStudio: H.AppBrowser.getStatus('music-studio'),
      careDocumentation: H.AppBrowser.getStatus('pflegeprotokoll-pro'),
      appointments: H.AppBrowser.getStatus('arzttermine-pro'),
      diseaseCatalogue: H.AppBrowser.getStatus('krankheitslexikon-pro'),
      medicationCatalogue: H.AppBrowser.getStatus('medikamentenlexikon-pro'),
      unitConverter: H.AppBrowser.getStatus('unitconv'),
      habitHeatmap: H.AppBrowser.getStatus('heatmap'),
      qrStudio: H.AppBrowser.getStatus('qr'),
      qrStickers: H.AppBrowser.getStatus('qr-sticker'),
      pdfCenter: H.AppBrowser.getStatus('pdf-center'),
      documentScanner: H.AppBrowser.getStatus('document-scanner'),
      scienceLab: H.AppBrowser.getStatus('science-lab'),
      wlanBluetooth: H.AppBrowser.getStatus('wlan-bt'),
      breathingRoute: H.SystemV157.resolveRoute('breathing'),
      scientificRoute: H.SystemV157.resolveRoute('scientific'),
      careDocumentationRoute: H.SystemV157.resolveRoute('pflegeprotokoll-pro'),
      appointmentsRoute: H.SystemV157.resolveRoute('arzttermine-pro'),
      diseaseCatalogueRoute: H.SystemV157.resolveRoute('krankheitslexikon-pro'),
      medicationCatalogueRoute: H.SystemV157.resolveRoute('medikamentenlexikon-pro'),
      privacyCenterRoute: H.SystemV157.resolveRoute('privacy-center'),
      dataVaultRoute: H.SystemV157.resolveRoute('data-vault'),
      privacyCenterCategory: H.Master.getCategoryApps('P').some((app) => app.id === 'privacy-center'),
      dataVaultCategory: H.Master.getCategoryApps('D').some((app) => app.id === 'data-vault')
    };
  });
  assert.equal(registryHealth.categoryCount, 26);
  assert.equal(registryHealth.plannedSlots, 375);
  assert.equal(registryHealth.uniqueIds, registryHealth.appCount);
  assert.ok(registryHealth.appCount >= 71);
  assert.ok(registryHealth.statusCounts.modules > 0);
  assert.equal(registryHealth.statusCounts.scaffolds, 0);
  assert.equal(Object.values(registryHealth.statusCounts).reduce((sum, value) => sum + value, 0), registryHealth.appCount);
  assert.equal(registryHealth.tasksRoute.routeConfigured, true);
  assert.equal(registryHealth.tasksRoute.moduleName, 'Tasks');
  assert.equal(registryHealth.avatarRoute.moduleName, 'LivingAvatar');
  assert.equal(registryHealth.avatarRoute.moduleAvailable, true);
  assert.equal(registryHealth.avatarStatus.kind, 'module');
  assert.equal(registryHealth.tasks.kind, 'module');
  assert.equal(registryHealth.remindersRoute.moduleName, 'Reminders');
  assert.equal(registryHealth.remindersRoute.moduleAvailable, true);
  assert.equal(registryHealth.reminders.kind, 'module');
  assert.equal(registryHealth.chatPro.kind, 'module');
  assert.equal(registryHealth.languageVoice.kind, 'module');
  assert.equal(registryHealth.aiVoiceCore.kind, 'module');
  assert.equal(registryHealth.systemDiagnostics.kind, 'module');
  assert.equal(registryHealth.workout.kind, 'module');
  assert.equal(registryHealth.utilities.kind, 'module');
  assert.equal(registryHealth.recipes.kind, 'module');
  assert.equal(registryHealth.analyzer.kind, 'module');
  assert.equal(registryHealth.statusCounts.modules, 94);
  assert.equal(registryHealth.statusCounts.scaffolds, 0);
  assert.equal(registryHealth.statusCounts.routes, 0);
  assert.equal(registryHealth.breathing.kind, 'module');
  assert.equal(registryHealth.scientific.kind, 'module');
  assert.equal(registryHealth.breathingRoute.routeConfigured, true);
  assert.equal(registryHealth.breathingRoute.moduleName, 'breathing');
  assert.equal(registryHealth.breathingRoute.moduleAvailable, true);
  assert.equal(registryHealth.scientificRoute.routeConfigured, true);
  assert.equal(registryHealth.scientificRoute.moduleName, 'scientific');
  assert.equal(registryHealth.scientificRoute.moduleAvailable, true);
  assert.equal(registryHealth.careDocumentation.kind, 'module');
  assert.equal(registryHealth.appointments.kind, 'module');
  assert.equal(registryHealth.careDocumentationRoute.routeConfigured, true);
  assert.equal(registryHealth.careDocumentationRoute.moduleName, 'pflegeprotokoll-pro');
  assert.equal(registryHealth.careDocumentationRoute.moduleAvailable, true);
  assert.equal(registryHealth.appointmentsRoute.routeConfigured, true);
  assert.equal(registryHealth.appointmentsRoute.moduleName, 'arzttermine-pro');
  assert.equal(registryHealth.appointmentsRoute.moduleAvailable, true);
  assert.equal(registryHealth.diseaseCatalogue.kind, 'module');
  assert.equal(registryHealth.medicationCatalogue.kind, 'module');
  assert.equal(registryHealth.diseaseCatalogueRoute.routeConfigured, true);
  assert.equal(registryHealth.diseaseCatalogueRoute.moduleName, 'krankheitslexikon-pro');
  assert.equal(registryHealth.diseaseCatalogueRoute.moduleAvailable, true);
  assert.equal(registryHealth.medicationCatalogueRoute.routeConfigured, true);
  assert.equal(registryHealth.medicationCatalogueRoute.moduleName, 'medikamentenlexikon-pro');
  assert.equal(registryHealth.medicationCatalogueRoute.moduleAvailable, true);
  assert.equal(registryHealth.privacyCenterRoute.moduleAvailable, true);
  assert.equal(registryHealth.privacyCenterRoute.startReady, true);
  assert.equal(registryHealth.privacyCenterRoute.resolution, 'direct');
  assert.equal(registryHealth.dataVaultRoute.moduleAvailable, true);
  assert.equal(registryHealth.dataVaultRoute.startReady, true);
  assert.equal(registryHealth.dataVaultRoute.resolution, 'direct');
  assert.equal(registryHealth.privacyCenterCategory, true);
  assert.equal(registryHealth.dataVaultCategory, true);
  assert.equal(registryHealth.statusCounts.review, 0);
  assert.equal(registryHealth.geoQuiz.kind, 'module');
  assert.equal(registryHealth.musicStudio.kind, 'module');
  assert.equal(registryHealth.unitConverter.kind, 'module');
  assert.equal(registryHealth.habitHeatmap.kind, 'module');
  assert.equal(registryHealth.qrStudio.kind, 'module');
  assert.equal(registryHealth.qrStickers.kind, 'module');
  assert.equal(registryHealth.pdfCenter.kind, 'module');
  assert.equal(registryHealth.documentScanner.kind, 'module');
  assert.equal(registryHealth.scienceLab.kind, 'module');
  assert.equal(registryHealth.wlanBluetooth.kind, 'module');
  assert.equal(registryHealth.datecalc.kind, 'module');
  assert.equal(registryHealth.deviceInfo.kind, 'module');
  console.log('HALDO APP REGISTRY HEALTH ' + JSON.stringify(registryHealth));
  pass('HalDo Core: 26 Kategorien, 375 Sollplätze, eindeutige App-IDs und Modulstatus geprüft');

  await page.evaluate(() => window.HalDo.AppBrowser.open());
  const appRegistryRoot = page.locator('#winLayer .hdx-root').last();
  await appRegistryRoot.getByText('HalDo App-Registry Pro', { exact: true }).waitFor({ timeout: 10000 });
  assert.match(await appRegistryRoot.innerText(), /375 geplante Plätze/);
  assert.equal(await appRegistryRoot.locator('[data-launch="reminders"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await appRegistryRoot.locator('[data-launch="chat-pro"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  const tasksBadge = await appRegistryRoot.locator('[data-launch="tasks"] [data-implementation-status]').innerText();
  assert.equal(tasksBadge, 'Modul vorhanden');
  assert.match(await appRegistryRoot.innerText(), /Start-Routen/);
  await appRegistryRoot.locator('[data-category="B"]').click();
  const categoryBGrid = appRegistryRoot.locator('[data-category-app-grid="B"]');
  assert.equal(await categoryBGrid.locator('[data-launch="geo-quiz"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="D"]').click();
  const categoryDGrid = appRegistryRoot.locator('[data-category-app-grid="D"]');
  assert.equal(await categoryDGrid.locator('[data-launch="datecalc"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await categoryDGrid.locator('[data-launch="pflegeprotokoll-pro"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await categoryDGrid.locator('[data-launch="arzttermine-pro"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="K"]').click();
  const categoryKGrid = appRegistryRoot.locator('[data-category-app-grid="K"]');
  assert.equal(await categoryKGrid.locator('[data-launch="krankheitslexikon-pro"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="M"]').click();
  const categoryMGrid = appRegistryRoot.locator('[data-category-app-grid="M"]');
  assert.equal(await categoryMGrid.locator('[data-launch="medikamentenlexikon-pro"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="X"]').click();
  const categoryXGrid = appRegistryRoot.locator('[data-category-app-grid="X"]');
  assert.equal(await categoryXGrid.locator('[data-launch="device-info"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="A"]').click();
  const categoryAppGrid = appRegistryRoot.locator('[data-category-app-grid="A"]');
  const categoryLaunchCards = categoryAppGrid.locator('[data-launch]');
  const categoryCardCount = await categoryLaunchCards.count();
  assert.ok(categoryCardCount > 0);
  assert.equal(await categoryLaunchCards.locator('[data-implementation-status]').count(), categoryCardCount);
  assert.equal(await categoryAppGrid.locator('[data-launch="avatar"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await categoryAppGrid.locator('[data-launch="analyzer"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="G"]').click();
  const categoryGGrid = appRegistryRoot.locator('[data-category-app-grid="G"]');
  assert.equal(await categoryGGrid.locator('[data-launch="workout"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await categoryGGrid.locator('[data-launch="recipes"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="U"]').click();
  const categoryUGrid = appRegistryRoot.locator('[data-category-app-grid="U"]');
  assert.equal(await categoryUGrid.locator('[data-launch="utilities"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="Q"]').click();
  const categoryQGrid = appRegistryRoot.locator('[data-category-app-grid="Q"]');
  assert.equal(await categoryQGrid.locator('[data-launch="unitconv"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="Y"]').click();
  const categoryYGrid = appRegistryRoot.locator('[data-category-app-grid="Y"]');
  assert.equal(await categoryYGrid.locator('[data-launch="heatmap"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="P"]').click();
  const categoryPGrid = appRegistryRoot.locator('[data-category-app-grid="P"]');
  assert.equal(await categoryPGrid.locator('[data-launch="qr"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await categoryPGrid.locator('[data-launch="qr-sticker"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="D"]').click();
  const categoryDocumentGrid = appRegistryRoot.locator('[data-category-app-grid="D"]');
  assert.equal(await categoryDocumentGrid.locator('[data-launch="document-scanner"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="S"]').click();
  const categorySGrid = appRegistryRoot.locator('[data-category-app-grid="S"]');
  assert.equal(await categorySGrid.locator('[data-launch="pdf-center"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  assert.equal(await categorySGrid.locator('[data-launch="wlan-bt"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category="I"]').click();
  const categoryIGrid = appRegistryRoot.locator('[data-category-app-grid="I"]');
  assert.equal(await categoryIGrid.locator('[data-launch="science-lab"] [data-implementation-status]').innerText(), 'Modul vorhanden');
  await appRegistryRoot.locator('[data-category=""]').click();

  await closeWindow(appRegistryRoot);
  pass('HalDo App-Registry Pro zeigt Grundgerüste und eigene Module sichtbar getrennt an');


  // v173: encrypted care documentation and appointment/referral coordination apps.
  const v173Source = await fs.readFile(path.join(ROOT, 'js/haldo-v173-care-apps.js'), 'utf8');
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(v173Source), false, 'v173 darf keine externen Netzwerkverbindungen aufbauen.');
  const v173Runtime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    moduleVersion: window.HalDo.AppsV173.version,
    apps: window.HalDo.AppsV173.apps.map((app) => app.id),
    status: window.HalDo.AppsV173.status(),
    errors: window.HalDo.AppsV173.errors,
    care: window.HalDo.AppBrowser.getStatus('pflegeprotokoll-pro'),
    appointments: window.HalDo.AppBrowser.getStatus('arzttermine-pro'),
    careOpen: typeof window.HalDo['pflegeprotokoll-pro']?.open,
    appointmentsOpen: typeof window.HalDo['arzttermine-pro']?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v173-care-apps.js')),
    sharedVaultReady: !!(window.HalDo.MedicalVault && typeof window.HalDo.MedicalVault.registerConfig === 'function')
  }));
  assert.equal(v173Runtime.build, '177.0.0');
  assert.equal(v173Runtime.moduleVersion, '173.0.0');
  assert.deepEqual(v173Runtime.apps, ['pflegeprotokoll-pro', 'arzttermine-pro']);
  assert.deepEqual(v173Runtime.errors, []);
  assert.ok(v173Runtime.status.every((item) => item.ready && item.registered));
  assert.equal(v173Runtime.care.kind, 'module');
  assert.equal(v173Runtime.appointments.kind, 'module');
  assert.equal(v173Runtime.careOpen, 'function');
  assert.equal(v173Runtime.appointmentsOpen, 'function');
  assert.equal(v173Runtime.scriptLoaded, true);
  assert.equal(v173Runtime.sharedVaultReady, true);
  pass('HalDo v173: Pflegeprotokoll und Arzttermine/Überweisungen sind als eigene verschlüsselte Module registriert');

  const careKey = 'haldo_v173_care_documentation_vault';
  await page.evaluate(() => window.HalDo.Launch({ id: 'pflegeprotokoll-pro', n: 'HalDo Pflegeprotokoll Pro' }));
  await page.locator('#haldo-v161-welcome').waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await page.locator('#haldo-v161-welcome .h161-title').innerText(), /HalDo Pflegeprotokoll Pro/);
  await dismissWelcomeIfPresent();
  const care = page.locator('#winLayer .h167').last();
  await care.waitFor({ state: 'visible', timeout: 10000 });
  await createOrUnlock(care, PASS);
  await assertEncrypted(careKey);
  await submitMedicalVaultRecord(care, {
    name: 'Pflegeperson E2E',
    date: '2026-11-26',
    time: '09:15',
    category: 'Mobilität',
    activity: 'Unterstützung beim sicheren Aufstehen E2E',
    result: 'Maßnahme dokumentiert E2E',
    performedBy: 'Pflegekraft Test',
    handover: 'Rückmeldung bei Übergabe E2E',
    note: 'Nur automatischer Browser-Test'
  });
  await care.getByText('Pflegeperson E2E', { exact: true }).waitFor({ timeout: 15000 });
  await care.getByText('Unterstützung beim sicheren Aufstehen E2E', { exact: false }).waitFor({ timeout: 10000 });
  await assertEncrypted(careKey, ['Pflegeperson E2E', 'Unterstützung beim sicheren Aufstehen E2E', 'Nur automatischer Browser-Test']);
  pass('HalDo Pflegeprotokoll Pro: Pflegemaßnahme mit Datum, Bereich, Ergebnis und Übergabe wird verschlüsselt gespeichert');

  await care.locator('#h167-search').fill('Übergabe E2E');
  assert.equal(await care.locator('[data-edit]').count(), 1);
  await care.locator('#h167-search').fill('kein Treffer');
  await care.getByText('Noch keine Einträge oder keine Treffer.', { exact: true }).waitFor();
  await care.locator('#h167-search').fill('');
  await care.locator('[data-edit]').first().click();
  await care.locator('[name="activity"]').fill('Pflegemaßnahme aktualisiert E2E');
  await care.locator('[name="category"]').selectOption('Beobachtung');
  await care.locator('#h167-record-form button[type="submit"]').click();
  await care.getByText('Pflegemaßnahme aktualisiert E2E', { exact: false }).waitFor({ timeout: 15000 });
  await assertEncrypted(careKey, ['Pflegeperson E2E', 'Pflegemaßnahme aktualisiert E2E']);
  pass('HalDo Pflegeprotokoll Pro: Suche, Filter, Bearbeitung und erneute Verschlüsselung funktionieren');

  const careBackup = await exportBackup(care);
  await care.locator('#h167-lock').click();
  await care.locator('#h167-pass').fill(PASS);
  await care.locator('#h167-unlock-form button[type="submit"]').click();
  await care.locator('#h167-record-form').waitFor({ timeout: 15000 });
  await care.getByText('Pflegemaßnahme aktualisiert E2E', { exact: false }).waitFor({ timeout: 10000 });
  await assertEncrypted(careKey, ['Pflegeperson E2E']);
  pass('HalDo Pflegeprotokoll Pro: Tresor sperren/entsperren und verschlüsseltes Backup exportieren');
  page.once('dialog', (dialog) => dialog.accept());
  await care.locator('[data-delete]').first().click();
  await care.getByText('Noch keine Einträge oder keine Treffer.', { exact: true }).waitFor({ timeout: 15000 });
  await assertEncrypted(careKey, ['Pflegeperson E2E']);
  await closeApp(care);
  pass('HalDo Pflegeprotokoll Pro: Löschen und Fenster-Schließen sperren den Tresor');

  const appointmentKey = 'haldo_v173_appointments_referrals_vault';
  await page.evaluate(() => window.HalDo.Launch({ id: 'arzttermine-pro', n: 'HalDo Arzttermine & Überweisungen Pro' }));
  await page.locator('#haldo-v161-welcome').waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await page.locator('#haldo-v161-welcome .h161-title').innerText(), /HalDo Arzttermine & Überweisungen Pro/);
  await dismissWelcomeIfPresent();
  const appointments = page.locator('#winLayer .h167').last();
  await appointments.waitFor({ state: 'visible', timeout: 10000 });
  await createOrUnlock(appointments, PASS);
  await assertEncrypted(appointmentKey);
  await submitMedicalVaultRecord(appointments, {
    name: 'Terminperson E2E',
    type: 'Überweisung',
    date: '2026-12-02',
    time: '10:30',
    provider: 'Testpraxis E2E',
    specialty: 'Kardiologie',
    purpose: 'Terminorganisation E2E',
    status: 'Bestätigt',
    referralStatus: 'Ausgestellt',
    contact: '0511 123456',
    note: 'Testunterlagen mitbringen E2E'
  });
  await appointments.getByText('Terminperson E2E', { exact: true }).waitFor({ timeout: 15000 });
  await appointments.getByText('Testpraxis E2E', { exact: false }).waitFor({ timeout: 10000 });
  await assertEncrypted(appointmentKey, ['Terminperson E2E', 'Testpraxis E2E', 'Testunterlagen mitbringen E2E']);
  pass('HalDo Arzttermine & Überweisungen Pro: Termin und Überweisung mit Praxis, Fachrichtung und Status verschlüsselt gespeichert');

  await appointments.locator('#h167-search').fill('Kardiologie');
  assert.equal(await appointments.locator('[data-edit]').count(), 1);
  await appointments.locator('#h167-search').fill('kein Treffer');
  await appointments.getByText('Noch keine Einträge oder keine Treffer.', { exact: true }).waitFor();
  await appointments.locator('#h167-search').fill('');
  await appointments.locator('[data-edit]').first().click();
  await appointments.locator('[name="status"]').selectOption('Erledigt');
  await appointments.locator('[name="referralStatus"]').selectOption('Eingelöst');
  await appointments.locator('#h167-record-form button[type="submit"]').click();
  await appointments.locator('.card .muted').filter({ hasText: 'Erledigt' }).waitFor({ state: 'visible', timeout: 15000 });
  await assertEncrypted(appointmentKey, ['Terminperson E2E', 'Testpraxis E2E']);
  pass('HalDo Arzttermine & Überweisungen Pro: Suche, Bearbeitung und Statuswechsel bleiben verschlüsselt');

  const appointmentsBackup = await exportBackup(appointments);
  await appointments.locator('#h167-lock').click();
  await appointments.locator('#h167-pass').fill(PASS);
  await appointments.locator('#h167-unlock-form button[type="submit"]').click();
  await appointments.locator('#h167-record-form').waitFor({ timeout: 15000 });
  await appointments.getByText('Terminperson E2E', { exact: true }).waitFor({ timeout: 10000 });
  await assertEncrypted(appointmentKey, ['Terminperson E2E']);
  pass('HalDo Arzttermine & Überweisungen Pro: Tresor sperren/entsperren und Backup exportieren');
  page.once('dialog', (dialog) => dialog.accept());
  await appointments.locator('[data-delete]').first().click();
  await appointments.getByText('Noch keine Einträge oder keine Treffer.', { exact: true }).waitFor({ timeout: 15000 });
  await assertEncrypted(appointmentKey, ['Terminperson E2E']);
  await closeApp(appointments);
  pass('HalDo Arzttermine & Überweisungen Pro: Löschen und Fenster-Schließen sperren den Tresor');


  // v174: source-linked disease and medication reference catalogues.
  const v174Source = await fs.readFile(path.join(ROOT, 'js/haldo-v174-medical-knowledge.js'), 'utf8');
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(v174Source), false, 'v174 muss ohne externe Datenabrufe funktionieren.');
  const v174Runtime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    moduleVersion: window.HalDo.AppsV174.version,
    apps: window.HalDo.AppsV174.apps.map((app) => app.id),
    status: window.HalDo.AppsV174.status(),
    disease: window.HalDo.AppBrowser.getStatus('krankheitslexikon-pro'),
    medication: window.HalDo.AppBrowser.getStatus('medikamentenlexikon-pro'),
    diseaseOpen: typeof window.HalDo['krankheitslexikon-pro']?.open,
    medicationOpen: typeof window.HalDo['medikamentenlexikon-pro']?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v174-medical-knowledge.js')),
    categoryApi: typeof window.HalDo.Registry.registerCategoryApp
  }));
  assert.equal(v174Runtime.build, '177.0.0');
  assert.equal(v174Runtime.moduleVersion, '174.0.0');
  assert.deepEqual(v174Runtime.apps, ['krankheitslexikon-pro', 'medikamentenlexikon-pro']);
  assert.ok(v174Runtime.status.every((item) => item.ready && item.entries > 0));
  assert.equal(v174Runtime.disease.kind, 'module');
  assert.equal(v174Runtime.medication.kind, 'module');
  assert.equal(v174Runtime.diseaseOpen, 'function');
  assert.equal(v174Runtime.medicationOpen, 'function');
  assert.equal(v174Runtime.scriptLoaded, true);
  assert.equal(v174Runtime.categoryApi, 'function');
  pass('HalDo v174: Krankheitslexikon und Medikamentenlexikon sind registriert und in A–Z-Kategorien integriert');

  await page.evaluate(() => window.HalDo.Launch({ id: 'krankheitslexikon-pro', n: 'HalDo Krankheitslexikon Pro' }));
  await page.locator('#haldo-v161-welcome').waitFor({ state: 'visible', timeout: 10000 });
  await dismissWelcomeIfPresent();
  const diseaseCatalogue = page.locator('#winLayer .hdv174-root').last();
  await diseaseCatalogue.waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await diseaseCatalogue.locator('[data-k174-entry]').count(), 4);
  assert.match(await diseaseCatalogue.innerText(), /keine Selbstdiagnose/i);
  await diseaseCatalogue.locator('[data-k174-search]').fill('HbA1c');
  await diseaseCatalogue.locator('[data-k174-detail]').getByText('HbA1c', { exact: false }).waitFor({ timeout: 10000 });
  assert.match(await diseaseCatalogue.locator('[data-k174-detail]').innerText(), /gesund\.bund\.de/);
  assert.equal(await diseaseCatalogue.locator('[data-k174-entry]').count(), 1);
  await diseaseCatalogue.locator('[data-k174-search]').fill('');
  await diseaseCatalogue.locator('[data-k174-category]').selectOption('Atemwege');
  assert.equal(await diseaseCatalogue.locator('[data-k174-entry]').count(), 1);
  await diseaseCatalogue.locator('[data-k174-entry="asthma"]').click();
  assert.match(await diseaseCatalogue.locator('[data-k174-detail]').innerText(), /Spirometrie|Peak-Flow/);
  assert.match(await diseaseCatalogue.locator('[data-k174-detail] a').first().getAttribute('href'), /^https:\/\/gesund\.bund\.de\//);
  await closeWindow(diseaseCatalogue);
  pass('HalDo Krankheitslexikon Pro: Suche, Kategorien, Details und offizielle Gesundheitsquellen funktionieren');

  await page.evaluate(() => window.HalDo.Launch({ id: 'medikamentenlexikon-pro', n: 'HalDo Medikamentenlexikon Pro' }));
  await page.locator('#haldo-v161-welcome').waitFor({ state: 'visible', timeout: 10000 });
  await dismissWelcomeIfPresent();
  const medicationCatalogue = page.locator('#winLayer .hdv174-root').last();
  await medicationCatalogue.waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await medicationCatalogue.locator('[data-k174-entry]').count(), 2);
  await medicationCatalogue.locator('[data-k174-search]').fill('Leber');
  await medicationCatalogue.locator('[data-k174-detail] .hdv174-warning').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await medicationCatalogue.locator('[data-k174-entry]').count(), 1);
  assert.match(await medicationCatalogue.locator('[data-k174-detail]').innerText(), /Überdosierung|Gebrauchsinformation/);
  const medicationSourceLinks = await medicationCatalogue.locator('[data-k174-detail] a').evaluateAll((links) => links.map((link) => link.href));
  assert.ok(medicationSourceLinks.length > 0);
  assert.ok(medicationSourceLinks.every((url) => url.startsWith('https://www.bfarm.de/')));
  await medicationCatalogue.locator('[data-k174-search]').fill('Ibuprofen');
  assert.match(await medicationCatalogue.locator('[data-k174-detail]').innerText(), /Magen-Darm|NSAR/);
  await closeWindow(medicationCatalogue);
  pass('HalDo Medikamentenlexikon Pro: Wirkstoffsuche, Sicherheitshinweise und BfArM-Quellen funktionieren');

  // v174 Utility apps: local unit conversion and a heatmap backed by the existing Habits data.
  const v174UtilitySource = await fs.readFile(path.join(ROOT, 'js/haldo-v174-utility-apps.js'), 'utf8');
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(v174UtilitySource), false, 'v174 Utility-Apps dürfen keine externen Datenabrufe verwenden.');
  const v174UtilityRuntime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    utilityVersion: window.HalDo.AppsV174Utility.version,
    appIds: window.HalDo.AppsV174Utility.appIds,
    status: window.HalDo.AppsV174Utility.status(),
    unitConverter: window.HalDo.AppBrowser.getStatus('unitconv'),
    habitHeatmap: window.HalDo.AppBrowser.getStatus('heatmap'),
    unitOpen: typeof window.HalDo.unitconv?.open,
    heatmapOpen: typeof window.HalDo.heatmap?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v174-utility-apps.js'))
  }));
  assert.equal(v174UtilityRuntime.build, '177.0.0');
  assert.equal(v174UtilityRuntime.utilityVersion, '174.0.0');
  assert.deepEqual(v174UtilityRuntime.appIds, ['unitconv', 'heatmap']);
  assert.ok(v174UtilityRuntime.status.every((item) => item.ready));
  assert.equal(v174UtilityRuntime.unitConverter.kind, 'module');
  assert.equal(v174UtilityRuntime.habitHeatmap.kind, 'module');
  assert.equal(v174UtilityRuntime.unitOpen, 'function');
  assert.equal(v174UtilityRuntime.heatmapOpen, 'function');
  assert.equal(v174UtilityRuntime.scriptLoaded, true);
  pass('HalDo v174 Utility: Einheiten-Umrechner und Habit Heatmap sind ohne externe Dienste registriert');

  await page.evaluate(() => window.HalDo.Launch({ id: 'unitconv', n: 'HalDo Einheiten-Umrechner Pro' }));
  await dismissWelcomeIfPresent();
  const unitConverter = page.locator('#winLayer [data-hv174-app="unitconv"]').last();
  await unitConverter.waitFor({ state: 'visible', timeout: 10000 });
  await unitConverter.locator('[data-hv174-value]').fill('2500');
  await unitConverter.locator('[data-hv174-from]').selectOption('m');
  await unitConverter.locator('[data-hv174-to]').selectOption('km');
  assert.equal((await unitConverter.locator('[data-hv174-result]').textContent()).trim(), '2,5');
  await unitConverter.locator('[data-hv174-category]').selectOption('temperature');
  await unitConverter.locator('[data-hv174-from]').selectOption('f');
  await unitConverter.locator('[data-hv174-to]').selectOption('c');
  await unitConverter.locator('[data-hv174-value]').fill('32');
  assert.equal((await unitConverter.locator('[data-hv174-result]').textContent()).trim(), '0');
  await unitConverter.locator('[data-hv174-from]').selectOption('c');
  await unitConverter.locator('[data-hv174-to]').selectOption('k');
  await unitConverter.locator('[data-hv174-value]').fill('-300');
  assert.match(await unitConverter.locator('[data-hv174-status]').textContent(), /absoluten Nullpunkt/);
  await unitConverter.locator('[data-hv174-category]').selectOption('digital');
  await unitConverter.locator('[data-hv174-from]').selectOption('kib');
  await unitConverter.locator('[data-hv174-to]').selectOption('kb');
  await unitConverter.locator('[data-hv174-value]').fill('1');
  assert.equal((await unitConverter.locator('[data-hv174-result]').textContent()).trim(), '1,024');
  await unitConverter.locator('[data-hv174-save]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v174_unit_converter_history', []).length), 1);
  await unitConverter.locator('[data-hv174-clear-history]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v174_unit_converter_history', []).length), 0);
  await closeWindow(unitConverter);
  pass('HalDo Einheiten-Umrechner Pro: Länge, Temperatur, absoluter Nullpunkt, Datenmenge und lokaler Verlauf geprüft');

  const heatmapHabitId = await page.evaluate(() => window.HalDo.Habits.add('Lesen E2E').id);
  await page.evaluate((id) => {
    window.HalDo.Habits.checkIn(id, '2026-11-24');
    window.HalDo.Habits.checkIn(id, '2026-11-25');
  }, heatmapHabitId);
  await page.evaluate(() => window.HalDo.Launch({ id: 'heatmap', n: 'HalDo Habit Heatmap Pro' }));
  await dismissWelcomeIfPresent();
  const habitHeatmap = page.locator('#winLayer [data-hv174-app="heatmap"]').last();
  await habitHeatmap.waitFor({ state: 'visible', timeout: 10000 });
  await habitHeatmap.locator('[data-hv174-month]').fill('2026-11');
  await habitHeatmap.locator('[data-hv174-habit]').selectOption(heatmapHabitId);
  assert.equal(await habitHeatmap.locator('[data-hv174-day].level-4').count(), 2);
  assert.equal(await habitHeatmap.locator('[data-hv174-date="2026-11-28"]').isDisabled(), true);
  await habitHeatmap.locator('[data-hv174-date="2026-11-26"]').click();
  assert.equal(await habitHeatmap.locator('[data-hv174-day].level-4').count(), 3);
  assert.equal(await page.evaluate((id) => window.HalDo.Habits.all().find((habit) => habit.id === id).checks['2026-11-26'], heatmapHabitId), true);
  await habitHeatmap.locator('[data-hv174-date="2026-11-26"]').click();
  assert.equal(await habitHeatmap.locator('[data-hv174-day].level-4').count(), 2);
  await habitHeatmap.locator('[data-hv174-month]').fill('2026-10');
  assert.equal(await habitHeatmap.locator('[data-hv174-day].level-4').count(), 0);
  await habitHeatmap.locator('[data-hv174-month]').fill('2026-11');
  await habitHeatmap.locator('[data-hv174-habit]').selectOption('all');
  assert.equal(await habitHeatmap.locator('[data-hv174-day].level-4').count(), 2);
  await closeWindow(habitHeatmap);
  pass('HalDo Habit Heatmap Pro: bestehende Habit-Daten, Monatsnavigation, Check-in-Änderung und Zukunftssperre geprüft');

  // v175: two QR applications share a pinned browser renderer; payload data stays local.
  const v175Source = await fs.readFile(path.join(ROOT, 'js/haldo-v175-qr-apps.js'), 'utf8');
  const qrVendorSource = await fs.readFile(path.join(ROOT, 'js/vendor/qrcode-generator.js'), 'utf8');
  assert.match(qrVendorSource, /Kazuhiko Arase/);
  assert.match(qrVendorSource, /stringToBytesFuncs/);
  assert.equal(/cdn\\.jsdelivr\\.net|QR_LIBRARY_URL|script\\.src\\s*=/.test(v175Source), false, 'QR-Erzeugung muss ohne externen CDN-Renderer funktionieren.');
  const qrVendorRuntime = await page.evaluate(() => ({
    loaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/vendor/qrcode-generator.js')),
    generator: typeof window.qrcode,
    utf8: typeof window.qrcode?.stringToBytesFuncs?.['UTF-8']
  }));
  assert.deepEqual(qrVendorRuntime, { loaded:true, generator:'function', utf8:'function' });

  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(v175Source), false, 'QR-Payloads dürfen nicht an externe QR-Endpunkte gesendet werden.');
  const v175Runtime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    moduleVersion: window.HalDo.AppsV175Qr.version,
    appIds: window.HalDo.AppsV175Qr.appIds,
    status: window.HalDo.AppsV175Qr.status(),
    qr: window.HalDo.AppBrowser.getStatus('qr'),
    stickers: window.HalDo.AppBrowser.getStatus('qr-sticker'),
    qrOpen: typeof window.HalDo.qr?.open,
    stickerOpen: typeof window.HalDo['qr-sticker']?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v175-qr-apps.js'))
  }));
  assert.equal(v175Runtime.build, '177.0.0');
  assert.equal(v175Runtime.moduleVersion, '175.0.0');
  assert.deepEqual(v175Runtime.appIds, ['qr', 'qr-sticker']);
  assert.ok(v175Runtime.status.every((item) => item.ready));
  assert.equal(v175Runtime.qr.kind, 'module');
  assert.equal(v175Runtime.stickers.kind, 'module');
  assert.equal(v175Runtime.qrOpen, 'function');
  assert.equal(v175Runtime.stickerOpen, 'function');
  assert.equal(v175Runtime.scriptLoaded, true);
  pass('HalDo v175: QR Studio und QR Sticker sind als eigenständige A–Z-Module registriert');

  await page.evaluate(() => window.HalDo.Launch({ id: 'qr', n: 'HalDo QR Studio Pro' }));
  await dismissWelcomeIfPresent();
  const qrStudio = page.locator('#winLayer [data-hv175-app="qr"]').last();
  await qrStudio.waitFor({ state: 'visible', timeout: 10000 });
  await qrStudio.locator('[data-q175-type]').selectOption('url');
  await qrStudio.locator('[data-q175-field="url"]').fill('https://example.com/haldo');
  await qrStudio.locator('[data-q175-generate]').click();
  await qrStudio.locator('.hdv175-result canvas').waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await qrStudio.locator('.hdv175-result canvas').count(), 1);
  assert.match(await qrStudio.locator('[data-q175-preview]').innerText(), /https:\/\/example\.com\/haldo/);
  await qrStudio.locator('[data-q175-type]').selectOption('wifi');
  await qrStudio.locator('[data-q175-field="ssid"]').fill('HalDo-Gast');
  await qrStudio.locator('[data-q175-field="password"]').fill('WLAN-Test-175');
  await qrStudio.locator('[data-q175-field="encryption"]').selectOption('WPA');
  await qrStudio.locator('[data-q175-generate]').click();
  await qrStudio.locator('.hdv175-result canvas').waitFor({ state: 'visible', timeout: 20000 });
  assert.match(await qrStudio.locator('[data-q175-preview]').innerText(), /WLAN-Zugangsdaten sind codiert/);
  assert.equal(await qrStudio.locator('.hdv175-result canvas').count(), 1);
  await qrStudio.locator('[data-q175-type]').selectOption('email');
  await qrStudio.locator('[data-q175-field="email"]').fill('info@example.com');
  await qrStudio.locator('[data-q175-field="subject"]').fill('HalDo');
  await qrStudio.locator('[data-q175-generate]').click();
  await qrStudio.locator('.hdv175-result canvas').waitFor({ state: 'visible', timeout: 20000 });
  assert.match(await qrStudio.locator('[data-q175-preview]').innerText(), /^mailto:info@example\.com\?subject=HalDo$/);
  await qrStudio.locator('[data-q175-type]').selectOption('geo');
  await qrStudio.locator('[data-q175-generate]').click();
  await qrStudio.locator('.hdv175-alert').filter({ hasText: 'Bitte Breitengrad und Längengrad eingeben' }).waitFor({ state: 'visible', timeout: 5000 });
  await qrStudio.locator('[data-q175-field="latitude"]').fill('52.52');
  await qrStudio.locator('[data-q175-field="longitude"]').fill('13.405');
  await qrStudio.locator('[data-q175-generate]').click();
  await qrStudio.locator('.hdv175-result canvas').waitFor({ state: 'visible', timeout: 20000 });
  assert.equal((await qrStudio.locator('[data-q175-preview]').innerText()).trim(), 'geo:52.52,13.405');
  const [qrDownload] = await Promise.all([
    page.waitForEvent('download', { timeout:20000 }),
    qrStudio.locator('[data-q175-download]').click()
  ]);
  assert.match(qrDownload.suggestedFilename(), /^haldo-qr-\d+\.png$/);
  await closeWindow(qrStudio);
  pass('HalDo QR Studio Pro: URL- und WLAN-QR-Codes erstellen und PNG lokal herunterladen');

  await page.evaluate(() => window.HalDo.Launch({ id: 'qr-sticker', n: 'HalDo QR Sticker Pro' }));
  await dismissWelcomeIfPresent();
  const qrStickers = page.locator('#winLayer [data-hv175-app="qr-sticker"]').last();
  await qrStickers.waitFor({ state: 'visible', timeout: 10000 });
  await qrStickers.locator('[data-q175-sticker-input]').fill(
    'HalDo Website | https://example.com/haldo\nInventar 001 | HALDO-INV-0001'
  );
  await qrStickers.locator('[data-q175-sticker-generate]').click();
  await qrStickers.locator('[data-q175-sticker-card]').nth(1).waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await qrStickers.locator('[data-q175-sticker-card]').count(), 2);
  assert.equal(await qrStickers.locator('[data-q175-sticker-canvas]').count(), 2);
  assert.equal(await qrStickers.locator('[data-q175-sticker-title]').nth(0).innerText(), 'HalDo Website');
  assert.equal(await qrStickers.locator('[data-q175-sticker-title]').nth(1).innerText(), 'Inventar 001');
  assert.equal(await qrStickers.locator('[data-q175-sticker-print]').isDisabled(), false);
  await qrStickers.locator('[data-q175-sticker-input]').fill(
    Array.from({ length:13 }, (_, index) => 'Sticker ' + index + ' | value-' + index).join('\n')
  );
  await qrStickers.locator('[data-q175-sticker-generate]').click();
  assert.match(await qrStickers.locator('[data-q175-sticker-status]').innerText(), /Maximal 12 Sticker/);
  assert.equal(await qrStickers.locator('[data-q175-sticker-print]').isDisabled(), true);
  await closeWindow(qrStickers);
  pass('HalDo QR Sticker Pro: mehrere Druck-Sticker erstellen und Mengenbegrenzung sicher prüfen');

  // The PDF center and scanner keep all selected files in the current browser tab.
  const v175DocumentSource = await fs.readFile(path.join(ROOT, 'js/haldo-v175-document-apps.js'), 'utf8');
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(v175DocumentSource), false, 'Dokumente dürfen nicht zu externen Servern hochgeladen werden.');
  const v175DocumentRuntime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    moduleVersion: window.HalDo.AppsV175Documents.version,
    apps: window.HalDo.AppsV175Documents.apps.map((app) => app.id),
    moduleStatus: window.HalDo.AppsV175Documents.status(),
    pdf: window.HalDo.AppBrowser.getStatus('pdf-center'),
    scanner: window.HalDo.AppBrowser.getStatus('document-scanner'),
    pdfOpen: typeof window.HalDo.PdfCenter?.open,
    scannerOpen: typeof window.HalDo.DocumentScanner?.open,
    scannerStatus: window.HalDo.DocumentScanner.getStatus(),
    textPdfApi: typeof window.HalDo.PdfCenter.createTextPdfBlob,
    imagePdfApi: typeof window.HalDo.DocumentScanner.createPdfBlob,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v175-document-apps.js'))
  }));
  assert.equal(v175DocumentRuntime.build, '177.0.0');
  assert.equal(v175DocumentRuntime.moduleVersion, '175.0.0');
  assert.deepEqual(v175DocumentRuntime.apps, ['pdf-center', 'document-scanner']);
  assert.deepEqual(v175DocumentRuntime.moduleStatus, { registered:2, build:'175.0.0', localOnly:true });
  assert.equal(v175DocumentRuntime.pdf.kind, 'module');
  assert.equal(v175DocumentRuntime.scanner.kind, 'module');
  assert.equal(v175DocumentRuntime.pdfOpen, 'function');
  assert.equal(v175DocumentRuntime.scannerOpen, 'function');
  assert.equal(v175DocumentRuntime.textPdfApi, 'function');
  assert.equal(v175DocumentRuntime.imagePdfApi, 'function');
  assert.deepEqual(v175DocumentRuntime.scannerStatus, { version:'175.0.0', maximumPages:30, localOnly:true, persistentStorage:false, ocr:false, automaticCrop:false });
  assert.equal(v175DocumentRuntime.scriptLoaded, true);
  pass('HalDo v175 Dokumente: PDF-Center und Scanner sind als lokale Module registriert');

  await page.evaluate(() => window.HalDo.Launch({ id: 'pdf-center', n: 'HalDo PDF- & Druck-Center Pro' }));
  await dismissWelcomeIfPresent();
  const pdfCenter = page.locator('#winLayer [data-hdv175-app="pdf-center"]').last();
  await pdfCenter.waitFor({ state: 'visible', timeout: 10000 });
  await pdfCenter.locator('input[id$="-title"]').fill('HalDo Testdokument');
  await pdfCenter.locator('textarea[id$="-text"]').fill('Hallo HalDo. Lokaler PDF-Test mit Umlauten äöü.');
  const [textPdfDownload] = await Promise.all([
    page.waitForEvent('download', { timeout:20000 }),
    pdfCenter.locator('[data-v175-pdf-create]').click()
  ]);
  assert.match(textPdfDownload.suggestedFilename(), /\.pdf$/i);
  const textPdfPath = await textPdfDownload.path();
  const textPdfBytes = await fs.readFile(textPdfPath);
  assert.ok(textPdfBytes.toString('latin1').startsWith('%PDF-1.4'));
  assert.ok(textPdfBytes.toString('latin1').includes('48616C6C6F2048616C446F'));
  assert.equal(await pdfCenter.locator('[data-v175-pdf-print]').isDisabled(), false);
  await closeWindow(pdfCenter);
  pass('HalDo PDF- & Druck-Center Pro: echtes lokales PDF aus Text erzeugt, heruntergeladen und PDF-Struktur geprüft');

  const scannerPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/J4sAAAAASUVORK5CYII=';
  await page.evaluate(() => window.HalDo.Launch({ id: 'document-scanner', n: 'HalDo Dokumenten-Scanner Pro' }));
  await dismissWelcomeIfPresent();
  const documentScanner = page.locator('#winLayer [data-hdv175-app="document-scanner"]').last();
  await documentScanner.waitFor({ state: 'visible', timeout: 10000 });
  await documentScanner.locator('[data-v175-scan-file]').setInputFiles({
    name:'haldo-scan-test.png',
    mimeType:'image/png',
    buffer:Buffer.from(scannerPngBase64, 'base64')
  });
  await documentScanner.locator('[data-v175-add-page]:not(:disabled)').waitFor({ state:'visible', timeout:10000 });
  await documentScanner.locator('[data-v175-add-page]').click();
  await page.waitForFunction(() => {
    const count = document.querySelector('#winLayer [data-hdv175-app="document-scanner"] [data-v175-page-count]');
    return count && count.textContent === '1';
  }, { timeout:10000 });
  await documentScanner.locator('[data-v175-add-page]').click();
  await page.waitForFunction(() => {
    const count = document.querySelector('#winLayer [data-hdv175-app="document-scanner"] [data-v175-page-count]');
    return count && count.textContent === '2';
  }, { timeout:10000 });
  assert.equal(await documentScanner.locator('[data-v175-pages] .hdv175-page').count(), 2);
  const [scanPdfDownload] = await Promise.all([
    page.waitForEvent('download', { timeout:20000 }),
    documentScanner.locator('[data-v175-export]').click()
  ]);
  assert.match(scanPdfDownload.suggestedFilename(), /\.pdf$/i);
  const scanPdfBytes = await fs.readFile(await scanPdfDownload.path());
  const scanPdfText = scanPdfBytes.toString('latin1');
  assert.ok(scanPdfText.startsWith('%PDF-1.4'));
  assert.ok(scanPdfText.includes('/Count 2'));
  await documentScanner.locator('[data-v175-clear-pages]').click();
  assert.equal(await documentScanner.locator('[data-v175-page-count]').innerText(), '0');
  assert.equal(await documentScanner.locator('[data-v175-export]').isDisabled(), true);
  await closeWindow(documentScanner);
  pass('HalDo Dokumenten-Scanner Pro: lokales Bild, zwei PDF-Seiten, Export und Löschen geprüft');

  // v176: science formulas and browser-permission-aware WLAN/Bluetooth manager.
  const v176Source = await fs.readFile(path.join(ROOT, 'js/haldo-v176-science-iot-apps.js'), 'utf8');
  assert.equal(/\beval\s*\(|\bnew\s+Function\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(v176Source), false, 'v176 darf weder dynamische Codeausführung noch externe Netzwerkdienste verwenden.');
  const v176Runtime = await page.evaluate(() => ({
    build: window.HalDo.Master.version,
    moduleVersion: window.HalDo.AppsV176.version,
    apps: window.HalDo.AppsV176.apps,
    status: window.HalDo.AppsV176.status(),
    science: window.HalDo.AppBrowser.getStatus('science-lab'),
    wlan: window.HalDo.AppBrowser.getStatus('wlan-bt'),
    scienceOpen: typeof window.HalDo['science-lab']?.open,
    wlanOpen: typeof window.HalDo['wlan-bt']?.open,
    scriptLoaded: performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/js/haldo-v176-science-iot-apps.js'))
  }));
  assert.equal(v176Runtime.build, '177.0.0');
  // The platform branding layer is v177; this independently versioned app module remains v176.
  assert.equal(v176Runtime.moduleVersion, '176.0.0');
  assert.deepEqual(v176Runtime.apps, ['science-lab', 'wlan-bt']);
  assert.ok(v176Runtime.status.every((item) => item.ready));
  assert.equal(v176Runtime.science.kind, 'module');
  assert.equal(v176Runtime.wlan.kind, 'module');
  assert.equal(v176Runtime.scienceOpen, 'function');
  assert.equal(v176Runtime.wlanOpen, 'function');
  assert.equal(v176Runtime.scriptLoaded, true);
  pass('HalDo v176: Wissenschaftslabor und WLAN/Bluetooth-Manager sind als eigene Module registriert');

  await page.evaluate(() => window.HalDo.Launch({ id: 'science-lab', n: 'HalDo Wissenschaftslabor Pro' }));
  await dismissWelcomeIfPresent();
  const scienceLab = page.locator('#winLayer [data-hv176-app="science-lab"]').last();
  await scienceLab.waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await scienceLab.innerText(), /24 Formeln/);
  await scienceLab.locator('[data-hv176-search]').fill('Geschwindigkeit');
  await scienceLab.locator('[data-hv176-formula="speed"]').click();
  await scienceLab.locator('[data-hv176-field="s"]').fill('100');
  await scienceLab.locator('[data-hv176-field="t"]').fill('20');
  await scienceLab.locator('[data-hv176-calculate]').click();
  assert.equal((await scienceLab.locator('[data-hv176-result] strong').innerText()).trim(), '5 m/s');
  await scienceLab.locator('[data-hv176-save]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v176_science_history', []).length), 1);
  await scienceLab.locator('[data-hv176-back]').click();
  await scienceLab.locator('[data-hv176-search]').fill('Kraft');
  await scienceLab.locator('[data-hv176-formula="force"]').click();
  await scienceLab.locator('[data-hv176-field="m"]').fill('10');
  await scienceLab.locator('[data-hv176-field="a"]').fill('9.81');
  await scienceLab.locator('[data-hv176-calculate]').click();
  assert.equal((await scienceLab.locator('[data-hv176-result] strong').innerText()).trim(), '98,1 N');
  await scienceLab.locator('[data-hv176-back]').click();
  await scienceLab.locator('[data-hv176-clear-history]').click();
  assert.equal(await page.evaluate(() => window.HalDo.Store.get('haldo_v176_science_history', []).length), 0);
  await scienceLab.locator('[data-hv176-search]').fill('Frequenz');
  await scienceLab.locator('[data-hv176-formula="frequency"]').click();
  await scienceLab.locator('[data-hv176-field="T"]').fill('0');
  await scienceLab.locator('[data-hv176-calculate]').click();
  assert.match(await scienceLab.locator('[data-hv176-status]').innerText(), /Periodendauer muss größer als 0/);
  assert.equal(await scienceLab.locator('[data-hv176-save]').isDisabled(), true);

  await scienceLab.locator('[data-hv176-back]').click();
  await scienceLab.locator('[data-hv176-search]').fill('Kreisfläche');
  await scienceLab.locator('[data-hv176-formula="circle-area"]').click();
  await scienceLab.locator('[data-hv176-field="r"]').fill('-1');
  await scienceLab.locator('[data-hv176-calculate]').click();
  assert.match(await scienceLab.locator('[data-hv176-status]').innerText(), /Radius darf nicht negativ sein/);
  assert.equal(await scienceLab.locator('[data-hv176-save]').isDisabled(), true);

  await scienceLab.locator('[data-hv176-back]').click();
  await scienceLab.locator('[data-hv176-search]').fill('Kraft');
  await scienceLab.locator('[data-hv176-formula="force"]').click();
  await scienceLab.locator('[data-hv176-field="m"]').fill('1e101');
  await scienceLab.locator('[data-hv176-field="a"]').fill('1');
  await scienceLab.locator('[data-hv176-calculate]').click();
  assert.match(await scienceLab.locator('[data-hv176-status]').innerText(), /außerhalb des unterstützten Zahlenbereichs/);
  assert.equal(await scienceLab.locator('[data-hv176-save]').isDisabled(), true);
  await closeWindow(scienceLab);
  pass('HalDo Wissenschaftslabor Pro: 24 Formeln, Suche, Berechnung, Verlauf, Nenner-, Radius- und Ergebnisbereichsvalidierung geprüft');

  // Mock Web Bluetooth to exercise explicit chooser/GATT operations deterministically.
  await page.evaluate(() => {
    const characteristic = {
      readValue: async () => new DataView(Uint8Array.from([0x2a, 0x17]).buffer),
      writeValueWithResponse: async (bytes) => { window.__haldoV176Written = Array.from(bytes); }
    };
    const service = { getCharacteristic: async (uuid) => { window.__haldoV176Characteristic = uuid; return characteristic; } };
    const device = {
      name:'HalDo Test Sensor',
      addEventListener(name, callback) { if (name === 'gattserverdisconnected') this.__disconnect = callback; },
      removeEventListener(name) { if (name === 'gattserverdisconnected') this.__disconnect = null; },
      gatt:{
        connected:false,
        async connect() { this.connected = true; return this; },
        disconnect() { this.connected = false; window.__haldoV176DisconnectCount = (window.__haldoV176DisconnectCount || 0) + 1; if (device.__disconnect) device.__disconnect(); },
        async getPrimaryService(uuid) { window.__haldoV176Service = uuid; return service; }
      }
    };
    window.__haldoV176Device = device;
    window.__haldoV176ChooserOptions = null;
    Object.defineProperty(navigator, 'bluetooth', { configurable:true, value:{ requestDevice:async (options) => { window.__haldoV176ChooserOptions = options; return device; } } });
  });
  await page.evaluate(() => window.HalDo.Launch({ id: 'wlan-bt', n: 'HalDo WLAN- & Bluetooth-Manager Pro' }));
  await dismissWelcomeIfPresent();
  const wlanManager = page.locator('#winLayer [data-hv176-app="wlan-bt"]').last();
  await wlanManager.waitFor({ state: 'visible', timeout: 10000 });
  assert.match(await wlanManager.innerText(), /SSID.*nicht|SSID|Browser/);
  await wlanManager.locator('[data-hv176-connect]').click();
  await wlanManager.locator('[data-hv176-disconnect]:not(:disabled)').waitFor({ state:'visible', timeout:10000 });
  assert.match(await wlanManager.locator('[data-hv176-ble-message]').innerText(), /Verbunden mit HalDo Test Sensor/);
  assert.equal(await page.evaluate(() => window.__haldoV176ChooserOptions.acceptAllDevices), true);
  assert.deepEqual(await page.evaluate(() => window.__haldoV176ChooserOptions.optionalServices), ['battery_service']);
  await wlanManager.locator('[data-hv176-read]').click();
  assert.equal((await wlanManager.locator('[data-hv176-read-result] strong').innerText()).trim(), '2A 17');
  await wlanManager.locator('[data-hv176-write-value]').fill('01 02');
  await wlanManager.locator('[data-hv176-write]').click();
  assert.match(await wlanManager.locator('[data-hv176-ble-message]').innerText(), /ausdrücklich bestätigen/);
  await wlanManager.locator('[data-hv176-write-confirm]').check();
  await wlanManager.locator('[data-hv176-write]').click();
  assert.deepEqual(await page.evaluate(() => window.__haldoV176Written), [1, 2]);
  await wlanManager.locator('[data-hv176-disconnect]').click();
  assert.equal(await wlanManager.locator('[data-hv176-disconnect]').isDisabled(), true);
  assert.match(await wlanManager.locator('[data-hv176-ble-message]').innerText(), /getrennt/);
  await wlanManager.locator('[data-hv176-connect]').click();
  await wlanManager.locator('[data-hv176-disconnect]:not(:disabled)').waitFor({ state:'visible', timeout:10000 });
  assert.equal(await page.evaluate(() => window.__haldoV176Device.gatt.connected), true);
  const disconnectsBeforeClose = await page.evaluate(() => window.__haldoV176DisconnectCount || 0);
  await closeWindow(wlanManager);
  await page.waitForFunction(() => window.__haldoV176Device.gatt.connected === false);
  assert.equal(await page.evaluate(() => window.__haldoV176DisconnectCount), disconnectsBeforeClose + 1);
  pass('HalDo WLAN/Bluetooth-Manager Pro: Netzwerkgrenzen, expliziter Gerätewähler, GATT-Lesen, bestätigtes Schreiben, manuelles Trennen und automatisches Trennen beim Fensterschließen geprüft');

  // Music Studio: launch the native window, edit a sequencer step, play/stop,
  // persist mixer FX settings, and validate an actual exported PCM WAV file.
  const musicStudioRuntime = await page.evaluate(() => ({
    moduleOpen: typeof window.HalDo.MusicStudio?.open,
    route: window.HalDo.AppBrowser.getStatus('music-studio')
  }));
  assert.equal(musicStudioRuntime.moduleOpen, 'function');
  assert.equal(musicStudioRuntime.route.kind, 'module');
  await page.evaluate(() => window.HalDo.MusicStudio.open());
  const musicStudio = page.locator('[id^="haldo-music-studio-"]').last();
  await musicStudio.locator('#btnPlay').waitFor({ state:'visible', timeout:10000 });
  assert.equal(await musicStudio.locator('[data-trk="kick"][data-idx="0"]').count(), 1);
  await musicStudio.locator('[data-trk="kick"][data-idx="0"]').click();
  assert.notEqual(await musicStudio.locator('[data-trk="kick"][data-idx="0"]').getAttribute('style'), null);
  await musicStudio.locator('#btnPlay').click();
  await musicStudio.getByRole('button', { name:/Stop/ }).waitFor({ state:'visible', timeout:5000 });
  await musicStudio.locator('#btnPlay').click();
  await musicStudio.getByRole('button', { name:/Play/ }).waitFor({ state:'visible', timeout:5000 });
  await musicStudio.locator('[data-mtab="mixer"]').click();
  await musicStudio.locator('#revInp').evaluate((el) => { el.value='45'; el.dispatchEvent(new Event('input', { bubbles:true })); });
  await musicStudio.locator('#delInp').evaluate((el) => { el.value='35'; el.dispatchEvent(new Event('input', { bubbles:true })); });
  await musicStudio.locator('#btnSave').click();
  const musicStored = await page.evaluate(() => window.HalDo.Store.get('music-studio:proj_v22', null));
  assert.equal(musicStored.masterRev, 0.45);
  assert.equal(musicStored.masterDel, 0.35);
  const [musicWavDownload] = await Promise.all([
    page.waitForEvent('download', { timeout:20000 }),
    musicStudio.locator('#btnExport').click()
  ]);
  assert.match(musicWavDownload.suggestedFilename(), /\.wav$/i);
  const musicWav = await fs.readFile(await musicWavDownload.path());
  assert.equal(musicWav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(musicWav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(musicWav.toString('ascii', 12, 16), 'fmt ');
  assert.equal(musicWav.readUInt16LE(20), 1, 'WAV muss PCM enthalten.');
  assert.equal(musicWav.readUInt16LE(22), 2, 'WAV muss Stereo enthalten.');
  await closeWindow(musicStudio);
  pass('HalDo Music Studio: natives Fenster, Sequencer-Schritt, Play/Stop, gespeicherte Master-FX und echter Stereo-PCM-WAV-Export geprüft');

  const anatomyCatalogCheck = await page.evaluate(async () => {
    const [catalog, loader] = await Promise.all([
      import('/models/catalog.js'),
      import('/models/loader.js')
    ]);
    const paths = [
      catalog.modelPath('adult_male', 'skull'),
      catalog.modelPath('adult_female', 'skull'),
      catalog.modelPath('infant', 'c2')
    ];
    const responses = await Promise.all(paths.map(async (url) => {
      const response = await fetch(url, { method: 'HEAD' });
      return { url, status: response.status };
    }));
    const unavailableError = await loader.loadBoneModel(
      window.THREE, 'neonate', 'skull'
    ).then(() => '', (error) => error.message);
    return {
      counts: {
        adultMale: catalog.PROFILE_CATALOG.adult_male.asset_count,
        adultFemale: catalog.PROFILE_CATALOG.adult_female.asset_count,
        infant: catalog.PROFILE_CATALOG.infant.asset_count
      },
      paths,
      responses,
      infantAtlas: catalog.modelPath('infant', 'c1_atlas'),
      neonate: catalog.modelPath('neonate', 'skull'),
      unknown: catalog.modelPath('adult_male', 'not_a_real_bone'),
      unavailableError
    };
  });
  assert.deepEqual(anatomyCatalogCheck.counts, { adultMale: 179, adultFemale: 179, infant: 178 });
  assert.deepEqual(anatomyCatalogCheck.responses.map((entry) => entry.status), [200, 200, 200]);
  assert.equal(anatomyCatalogCheck.infantAtlas, null);
  assert.equal(anatomyCatalogCheck.neonate, null);
  assert.equal(anatomyCatalogCheck.unknown, null);
  assert.match(anatomyCatalogCheck.unavailableError, /No verified GLB asset/);
  pass('Anatomie 3D: 179/179/178 echte Modellpfade und nicht verfügbare Profile werden sicher erkannt');
  const glbMetadata = await page.evaluate(async () => {
    async function inspect(path) {
      const response = await fetch(path);
      if (!response.ok) throw new Error(path + ' returned HTTP ' + response.status);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const view = new DataView(buffer);
      const magic = new TextDecoder().decode(bytes.slice(0, 4));
      const version = view.getUint32(4, true);
      const declaredLength = view.getUint32(8, true);
      const jsonLength = view.getUint32(12, true);
      const jsonType = new TextDecoder().decode(bytes.slice(16, 20));
      if (magic !== 'glTF' || version !== 2 || declaredLength !== buffer.byteLength || jsonType !== 'JSON') {
        throw new Error(path + ' is not a valid GLB 2.0 container');
      }
      const json = JSON.parse(new TextDecoder().decode(bytes.slice(20, 20 + jsonLength)));
      return {
        path,
        bytes: buffer.byteLength,
        nodes: (json.nodes || []).length,
        meshes: (json.meshes || []).length,
        skins: (json.skins || []).length,
        animations: (json.animations || []).length,
        nodeNames: (json.nodes || []).map((node) => node.name).filter(Boolean).slice(0, 8)
      };
    }
    return {
      baseMesh: await inspect('/female-base-mesh-base_female.glb'),
      individualBone: await inspect('/models/adult_male/adult_female/c1_atlas.glb')
    };
  });
  assert.ok(glbMetadata.baseMesh.nodes > 0 && glbMetadata.baseMesh.meshes > 0);
  assert.ok(glbMetadata.individualBone.nodes > 0 && glbMetadata.individualBone.meshes > 0);
  console.log('ANATOMY GLB METADATA ' + JSON.stringify(glbMetadata));
  pass('Anatomie 3D: GLB-2.0-Struktur von Basis-Mesh und Einzelknochen wird geprüft');
  const schematicSkeleton = await page.evaluate(async () => {
    const [base, extended, procedural, catalog] = await Promise.all([
      import('/models/base-bones.js'),
      import('/models/extended-bones.js'),
      import('/models/procedural.js'),
      import('/models/catalog.js')
    ]);
    const definitions = [...base.baseBones, ...extended.extendedBones];
    const anatomical = definitions.filter(procedural.isAnatomicalBone);
    const ids = anatomical.map((bone) => bone.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    const assetIds = new Set(catalog.PROFILE_CATALOG.adult_male.asset_ids);
    const missingAssets = ids.filter((id) => !assetIds.has(id));
    const group = new window.THREE.Group();
    group.name = 'HalDo-Schematic-Skeleton-Test';
    anatomical.forEach((bone) => {
      group.add(procedural.createProceduralBone(window.THREE, bone, 'adult_male'));
    });
    group.updateMatrixWorld(true);
    const bounds = new window.THREE.Box3().setFromObject(group);
    const size = bounds.getSize(new window.THREE.Vector3());
    let meshCount = 0;
    group.traverse((node) => { if (node.isMesh) meshCount += 1; });
    const result = {
      definitionCount: definitions.length,
      anatomicalCount: anatomical.length,
      uniqueCount: new Set(ids).size,
      duplicateIds,
      missingAssets,
      meshCount,
      bounds: [size.x, size.y, size.z]
    };
    group.traverse((node) => {
      if (node.isMesh) {
        node.geometry?.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material?.dispose());
      }
    });
    return result;
  });
  assert.equal(schematicSkeleton.duplicateIds.length, 0);
  assert.equal(schematicSkeleton.anatomicalCount, schematicSkeleton.uniqueCount);
  assert.ok(schematicSkeleton.meshCount > 100);
  assert.ok(schematicSkeleton.bounds.every((value) => Number.isFinite(value) && value > 0));
  console.log('ANATOMY SCHEMATIC SKELETON ' + JSON.stringify(schematicSkeleton));
  pass('Anatomie 3D: vollständiges schematisches Skelett lässt sich aus den vorhandenen Knochenmodulen aufbauen');
  const skeletonModuleCheck = await page.evaluate(async () => {
    const skeletonApi = await import('/models/skeleton.js');
    const profiles = ['adult_male', 'adult_female', 'infant', 'neonate'];
    const results = [];
    for (const profileId of profiles) {
      const skeleton = skeletonApi.createSchematicSkeleton(window.THREE, profileId);
      skeleton.group.updateMatrixWorld(true);
      const bounds = new window.THREE.Box3().setFromObject(skeleton.group);
      const size = bounds.getSize(new window.THREE.Vector3());
      results.push({
        profileId,
        boneCount: skeleton.bones.length,
        groupChildren: skeleton.group.children.length,
        hasSkull: skeleton.byId.has('skull'),
        units: skeleton.units,
        clinicalUse: skeleton.group.userData.clinicalUse,
        bounds: [size.x, size.y, size.z]
      });
      skeletonApi.disposeSchematicSkeleton(skeleton);
    }
    let invalidProfileRejected = false;
    try {
      skeletonApi.createSchematicSkeleton(window.THREE, 'not-a-profile');
    } catch {
      invalidProfileRejected = true;
    }
    return { results, invalidProfileRejected, definitionCount: skeletonApi.getSchematicBoneDefinitions().length };
  });
  assert.deepEqual(skeletonModuleCheck.results.map((item) => item.profileId), ['adult_male', 'adult_female', 'infant', 'neonate']);
  assert.ok(skeletonModuleCheck.results.every((item) =>
    item.boneCount === 179 &&
    item.groupChildren === 179 &&
    item.hasSkull &&
    item.units === 'arbitrary' &&
    item.clinicalUse === false &&
    item.bounds.every((value) => Number.isFinite(value) && value > 0)
  ));
  assert.equal(skeletonModuleCheck.definitionCount, 179);
  assert.equal(skeletonModuleCheck.invalidProfileRejected, true);
  console.log('ANATOMY SKELETON MODULE ' + JSON.stringify(skeletonModuleCheck));
  pass('Anatomie 3D Pro: wiederverwendbarer Skelett-Baukasten unterstützt vier Profile und Ressourcenfreigabe');
  const germanAnatomyCatalog = await page.evaluate(async () => {
    const api = await import('/models/skeleton.js');
    const definitions = api.getSchematicBoneDefinitions();
    const byId = new Map(definitions.map((bone) => [bone.id, bone]));
    return {
      count: definitions.length,
      missingGerman: definitions.filter((bone) => !bone.de || !bone.regionDe).map((bone) => bone.id),
      names: {
        skull: byId.get('skull')?.de,
        c2: byId.get('c2')?.de,
        leftRib1: byId.get('left_rib_1')?.de,
        rightFemur: byId.get('right_femur')?.de,
        leftIndexMiddlePhalanx: byId.get('left_digit_2_middle')?.de,
        rightLittleToeDistalPhalanx: byId.get('right_toe_5_distal')?.de
      },
      regions: [...new Set(definitions.map((bone) => bone.regionDe))]
    };
  });
  assert.equal(germanAnatomyCatalog.count, 179);
  assert.deepEqual(germanAnatomyCatalog.missingGerman, []);
  assert.equal(germanAnatomyCatalog.names.skull, 'Schädel');
  assert.equal(germanAnatomyCatalog.names.c2, '2. Halswirbel');
  assert.equal(germanAnatomyCatalog.names.leftRib1, '1. Rippe links');
  assert.equal(germanAnatomyCatalog.names.rightFemur, 'Oberschenkelknochen rechts');
  assert.equal(germanAnatomyCatalog.names.leftIndexMiddlePhalanx, 'Mittelglied des Zeigefingers links');
  assert.equal(germanAnatomyCatalog.names.rightLittleToeDistalPhalanx, 'Endglied der kleinen Zehe rechts');
  assert.ok(germanAnatomyCatalog.regions.includes('Wirbelsäule'));
  console.log('GERMAN ANATOMY TERMS ' + JSON.stringify(germanAnatomyCatalog));
  pass('Anatomie 3D: alle 179 Knochen-Definitionen besitzen deutsche Namen und Körperregionen');

  // Record which version of the duplicate Anatomy3D assignment is active at runtime.
  const activeAnatomyRuntime = await page.evaluate(() => ({
    stabilization151: !!window.HalDo.__stabilization151,
    openSource: String(window.HalDo.Anatomy3D?.open || '').slice(0, 500),
    build: window.HalDo.Master?.version || null
  }));
  console.log('ACTIVE ANATOMY RUNTIME ' + JSON.stringify(activeAnatomyRuntime));
  const anatomyRuntimeContract = await page.evaluate(() => ({
    version: window.HalDo.Anatomy3D?.version || null,
    features: window.HalDo.Anatomy3D?.features || null
  }));
  assert.equal(activeAnatomyRuntime.stabilization151, true);
  assert.equal(anatomyRuntimeContract.version, 'pro-max-v2');
  assert.equal(anatomyRuntimeContract.features?.boneCatalog, true);
  assert.equal(anatomyRuntimeContract.features?.profiles, true);
  assert.equal(anatomyRuntimeContract.features?.raycast, true);
  assert.equal(anatomyRuntimeContract.features?.resourceCleanup, true);
  pass('Anatomie 3D Pro: v151-Stabilisierung lädt ohne Syntaxfehler und bewahrt den vollständigen Pro-Max-Viewer');


  // Exercise the actual Arztbuch anatomy window, its profile selector and WebGL viewer.
  await page.evaluate(() => window.HalDo.Anatomy3D.open());
  await dismissWelcomeIfPresent();
  // Several HalDo apps share the .hdx-root class; scope to this window by its title.
  const anatomyWindow = page.locator('#winLayer .win-pro').filter({ hasText: 'HalDo Arztbuch Pro Max' }).last();
  await anatomyWindow.waitFor({ state: 'visible', timeout: 10000 });
  const anatomyAppRoot = anatomyWindow.locator('.win-body-pro > .hdx-root').first();
  await anatomyAppRoot.waitFor({ state: 'visible', timeout: 10000 });
  await anatomyAppRoot.locator('button[data-arzt-tab="anatomy"]').last().click();
  await anatomyAppRoot.locator('[data-model-schematic]').waitFor({ state: 'visible', timeout: 10000 });
  await anatomyAppRoot.locator('[data-model-load]').click();
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('#winLayer .hdx-root [data-anatomy-status]'))
      .some((element) => {
        const message = element.textContent || '';
        return message.includes('3D-Modell sichtbar und interaktiv geladen') ||
          message.includes('3D-Modell geladen:');
      });
  }, { timeout: 30000 });
  const singleBoneStatus = await anatomyAppRoot.locator('[data-anatomy-status]').innerText();
  console.log('SINGLE BONE GLB LOAD STATUS ' + singleBoneStatus);
  assert.equal(await anatomyAppRoot.locator('.hdx-anatomy-view canvas').count(), 1);
  pass('Anatomie 3D Pro: einzelnes vorhandenes GLB-Knochenmodell wird im aktiven Viewer geladen');
  await page.evaluate(() => {
    const originalRevoke = URL.revokeObjectURL.bind(URL);
    window.__haldoRevokedBlobUrls = [];
    URL.revokeObjectURL = (url) => {
      if (typeof url === 'string' && url.startsWith('blob:')) window.__haldoRevokedBlobUrls.push(url);
      return originalRevoke(url);
    };
  });
  await anatomyAppRoot.locator('[data-model-file]').setInputFiles(
    path.join(ROOT, 'models/adult_male/adult_female/c1_atlas.glb')
  );
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('#winLayer .hdx-root [data-anatomy-status]'))
      .some((element) => {
        const message = element.textContent || '';
        return message.includes('3D-Modell geladen: blob:') ||
          message.includes('3D-Modell sichtbar und interaktiv geladen');
      });
  }, { timeout: 30000 });
  const localGlbStatus = await anatomyAppRoot.locator('[data-anatomy-status]').innerText();
  console.log('LOCAL GLB IMPORT STATUS ' + localGlbStatus);
  assert.match(localGlbStatus, /3D-Modell/);
  const localBlobUrl = (localGlbStatus.match(/blob:[^\\s]+/) || [])[0];
  assert.ok(localBlobUrl, 'Der lokale GLB-Import muss über eine temporäre Blob-URL laufen.');
  pass('Anatomie 3D Pro: lokale GLB-Datei wird ohne externen Modellserver importiert');
  await anatomyAppRoot.locator('[data-model-file]').setInputFiles({
    name: 'external-references.gltf',
    mimeType: 'model/gltf+json',
    buffer: Buffer.from('{"asset":{"version":"2.0"}}', 'utf8')
  });
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('#winLayer .hdx-root [data-anatomy-status]'))
      .some((element) => element.textContent.includes('Nur eigenständige GLB-Dateien'));
  }, { timeout: 10000 });
  assert.equal(await anatomyAppRoot.locator('.hdx-anatomy-view canvas').count(), 1);
  pass('Anatomie 3D Pro: externe GLTF-Datei wird abgewiesen, das geladene Modell bleibt erhalten');
  await anatomyAppRoot.locator('[data-model-schematic]').click();
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('#winLayer .hdx-root [data-anatomy-status]'))
      .some((element) => element.textContent.includes('Schematisches Skelett geladen: 179 Knochen'));
  }, { timeout: 30000 });
  const revokedBlobUrls = await page.evaluate(() => window.__haldoRevokedBlobUrls || []);
  assert.ok(revokedBlobUrls.includes(localBlobUrl), 'Beim Modellwechsel muss die lokale Blob-URL freigegeben werden.');
  pass('Anatomie 3D Pro: lokale Blob-URL wird beim Austausch des Modells wieder freigegeben');
  assert.equal(await anatomyAppRoot.locator('.hdx-anatomy-view canvas').count(), 1);
  assert.match(await anatomyAppRoot.locator('[data-bone-info]').innerText(), /179 Knochen/);
  pass('Anatomie 3D Pro: Arztbuch-Viewer rendert das vollständige schematische Erwachsenenskelett');
  const boneSelection = await anatomyAppRoot.locator('.hdx-anatomy-view canvas').evaluate((canvas) => {
    const info = canvas.closest('.hdx-root')?.querySelector('[data-bone-info]');
    if (!info) return null;
    const initial = info.textContent;
    const rect = canvas.getBoundingClientRect();
    const fractions = [0.15, 0.25, 0.35, 0.45, 0.5, 0.55, 0.65, 0.75, 0.85];
    for (const y of fractions) {
      for (const x of fractions) {
        canvas.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          clientX: rect.left + rect.width * x,
          clientY: rect.top + rect.height * y
        }));
        if (info.textContent !== initial && info.textContent.includes('Schematisches Lehrmodell')) {
          return info.textContent;
        }
      }
    }
    return null;
  });
  assert.ok(boneSelection, 'Kein sichtbarer schematischer Knochen konnte im Viewer ausgewählt werden.');
  assert.match(boneSelection, /Deutsch:/);
  assert.match(boneSelection, /Latein:/);
  assert.match(boneSelection, /Körperregion:/);
  pass('Anatomie 3D Pro: Knochen sind per Mausklick auswählbar und zeigen deutsche, englische und lateinische Angaben');
  const boneSearch = anatomyAppRoot.locator('[data-bone-search]');
  const boneRegion = anatomyAppRoot.locator('[data-bone-region]');
  const boneResults = anatomyAppRoot.locator('[data-bone-results]');
  await boneSearch.fill('schadel');
  assert.equal(await boneResults.getAttribute('data-result-count'), '2', 'Die Suche soll Umlaute auch ohne Akzent finden.');
  await boneSearch.fill('Oberschenkelknochen links');
  assert.equal(await boneResults.getAttribute('data-result-count'), '1');
  await boneResults.locator('[data-bone-select="left_femur"]').click();
  assert.match(await anatomyAppRoot.locator('[data-bone-info]').innerText(), /Deutsch: Oberschenkelknochen links/);
  assert.equal(await boneResults.locator('[data-bone-select="left_femur"]').getAttribute('aria-pressed'), 'true');
  assert.match(await anatomyAppRoot.locator('[data-anatomy-status]').innerText(), /Kamera fokussiert: Oberschenkelknochen links/);

  await boneRegion.selectOption('Schädel');
  await boneSearch.fill('');
  assert.equal(await boneResults.getAttribute('data-result-count'), '2');
  assert.equal(await boneResults.getAttribute('data-visible-count'), '2');
  await anatomyAppRoot.locator('[data-bone-clear]').click();
  assert.equal(await boneSearch.inputValue(), '');
  assert.equal(await boneRegion.inputValue(), '');
  assert.equal(await boneResults.getAttribute('data-result-count'), '179');
  assert.equal(await boneResults.getAttribute('data-visible-count'), '179');
  assert.match(await anatomyAppRoot.locator('[data-anatomy-status]').innerText(), /Kamera zurückgesetzt/);

  pass('Anatomie 3D Pro: Knochenkatalog unterstützt Umlaute-Suche, Namenssuche, Regionenfilter und 3D-Sichtbarkeitsfilter');



  await anatomyAppRoot.locator('[data-anatomy-profile]').selectOption('infant');
  await anatomyAppRoot.locator('[data-model-schematic]').click();
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('#winLayer .hdx-root [data-anatomy-status]'))
      .some((element) => element.textContent.includes('Profil infant'));
  }, { timeout: 30000 });
  assert.equal(await anatomyAppRoot.locator('.hdx-anatomy-view canvas').count(), 1);
  pass('Anatomie 3D Pro: Profilwechsel auf Säugling erzeugt das passende schematische Skelett');

  await anatomyAppRoot.locator('button[data-arzt-tab="systems"]').last().click();
  assert.equal(await anatomyAppRoot.locator('.hdx-anatomy-view canvas').count(), 0);
  await anatomyAppRoot.locator('button[data-arzt-tab="anatomy"]').last().click();
  await anatomyAppRoot.locator('[data-anatomy-profile]').selectOption('adult_female');
  await anatomyAppRoot.locator('[data-model-schematic]').click();
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('#winLayer .hdx-root [data-anatomy-status]'))
      .some((element) => element.textContent.includes('Profil adult_female'));
  }, { timeout: 30000 });
  assert.equal(await anatomyAppRoot.locator('.hdx-anatomy-view canvas').count(), 1);
  await closeWindow(anatomyAppRoot);
  pass('Anatomie 3D Pro: Profilwechsel, Viewer-Neuaufbau und Fenster-Schließen geben Ressourcen frei');







  // Seed an older encrypted v154 record without a vitals array to verify backward compatibility.
  await seedLegacyArztbuchVault();
  // Open the real Arztbuch hub first. Both encrypted modules must be reachable from its tiles.
  const hub = await openArztbuchHub();
  const legacyBeforeVitals = await readArztbuchData(PASS);
  assert.equal(Object.prototype.hasOwnProperty.call(legacyBeforeVitals, 'vitals'), false);
  pass('HalDo Arztbuch Pro entsperrt einen älteren verschlüsselten Tresor ohne Vitalwerte-Feld');

  // Existing v154 vaults receive an in-memory empty array and persist it on the first edit.
  await hub.locator('.hdp154-tabs [data-ab-tab=vitals]').click();
  await hub.locator('[data-ab-form]').waitFor({ state: 'visible', timeout: 10000 });
  await hub.getByText('Noch keine Einträge in diesem Bereich.', { exact: true }).waitFor();
  pass('Arztbuch: Vitalwerte-Bereich wird bei älteren Tresoren kompatibel ergänzt');
  await hub.locator('[name="title"]').fill('Entwurf E2E');
  await hub.locator('[name="result"]').fill('88');
  await hub.locator('[data-ab-vital-search]').fill('keine-treffer');
  assert.equal(await hub.locator('[name="title"]').inputValue(), 'Entwurf E2E');
  assert.equal(await hub.locator('[name="result"]').inputValue(), '88');
  await hub.locator('[data-ab-vital-search]').fill('');
  pass('Arztbuch: Unfertige Vitalwert-Eingaben bleiben beim Filtern erhalten');


  await hub.locator('[name="title"]').fill('Blutdruck E2E');
  await hub.locator('[name="result"]').fill('120/80');
  await hub.locator('[name="unit"]').fill('mmHg');
  await hub.locator('[name="date"]').fill('2026-11-26');
  await hub.locator('[name="source"]').selectOption('Eigene Eingabe');
  await hub.locator('[name="details"]').fill('Nur automatischer Browser-Test');
  await hub.locator('[data-ab-form] button[type="submit"]').click();
  await hub.getByText('Blutdruck E2E', { exact: true }).waitFor({ timeout: 10000 });
  await assertArztbuchEncrypted(['Blutdruck E2E', 'Nur automatischer Browser-Test']);
  let vitalData = await readArztbuchData(PASS);
  assert.equal(vitalData.vitals.length, 1);
  assert.equal(vitalData.vitals[0].result, '120/80');
  pass('Arztbuch: Vitalwert angelegt, im bestehenden Tresor verschlüsselt gespeichert und strukturell geprüft');

  const timelineSearch = hub.locator('[data-ab-vital-search]');
  await timelineSearch.fill('Blutdruck E2E');
  assert.equal(await hub.locator('.hdp154-record').count(), 1);
  await timelineSearch.fill('no-match');
  await hub.getByText('Keine Vitalwerte für diese Suche oder diesen Zeitraum.', { exact: true }).waitFor();
  await timelineSearch.fill('');
  pass('Arztbuch: Vitalwerte-Verlauf unterstützt die Textsuche');
  const fromDate = hub.locator('[data-ab-vital-from]');
  await fromDate.fill('2026-11-27');
  await fromDate.dispatchEvent('change');
  assert.equal(await hub.locator('.hdp154-record').count(), 0);
  const fromDateReset = hub.locator('[data-ab-vital-from]');
  await fromDateReset.fill('2026-11-26');
  await fromDateReset.dispatchEvent('change');
  assert.equal(await hub.locator('.hdp154-record').count(), 1);
  pass('Arztbuch: Vitalwerte-Verlauf prüft die Von-Datumsgrenze');
  const toDate = hub.locator('[data-ab-vital-to]');
  await toDate.fill('2026-11-25');
  await toDate.dispatchEvent('change');
  assert.equal(await hub.locator('.hdp154-record').count(), 0);
  const toDateReset = hub.locator('[data-ab-vital-to]');
  await toDateReset.fill('2026-11-26');
  await toDateReset.dispatchEvent('change');
  assert.equal(await hub.locator('.hdp154-record').count(), 1);
  pass('Arztbuch: Vitalwerte-Verlauf prüft die Bis-Datumsgrenze');
  const clearFromDate = hub.locator('[data-ab-vital-from]');
  await clearFromDate.fill('');
  await clearFromDate.dispatchEvent('change');
  const clearToDate = hub.locator('[data-ab-vital-to]');
  await clearToDate.fill('');
  await clearToDate.dispatchEvent('change');

  await hub.locator('[data-ab-edit-vital]').click();
  await hub.locator('[name="result"]').fill('118/76');
  await hub.locator('[data-ab-form] button[type="submit"]').click();
  await hub.getByText('118/76', { exact: false }).waitFor({ timeout: 10000 });
  await assertArztbuchEncrypted(['Blutdruck E2E', '118/76']);
  vitalData = await readArztbuchData(PASS);
  assert.equal(vitalData.vitals[0].result, '118/76');
  pass('Arztbuch: Vitalwert kann bearbeitet und erneut verschlüsselt gespeichert werden');

  page.once('dialog', (dialog) => dialog.accept());
  await hub.locator('[data-ab-delete][data-ab-type="vitals"]').click();
  await hub.locator('.hdp154-empty').getByText('Noch keine Einträge in diesem Bereich.', { exact: true }).waitFor();
  await assertArztbuchEncrypted(['Blutdruck E2E', 'Nur automatischer Browser-Test']);
  vitalData = await readArztbuchData(PASS);
  assert.equal(vitalData.vitals.length, 0);
  pass('Arztbuch: Vitalwert kann gelöscht werden; der verschlüsselte Tresor bleibt gültig');

  await hub.locator('[name="title"]').fill('Puls E2E');
  await hub.locator('[name="result"]').fill('72');
  await hub.locator('[name="unit"]').fill('bpm');
  await hub.locator('[name="date"]').fill('2026-11-25');
  await hub.locator('[data-ab-form] button[type="submit"]').click();
  await hub.getByText('Puls E2E', { exact: true }).waitFor({ timeout: 10000 });
  assert.equal(await hub.locator('[data-ab-vital-chart]').count(), 0);
  await hub.locator('[name="title"]').fill('Puls E2E');
  await hub.locator('[name="result"]').fill('75');
  await hub.locator('[name="unit"]').fill('bpm');
  await hub.locator('[name="date"]').fill('2026-11-26');
  await hub.locator('[name="details"]').fill('=1+1; "morgens"');
  await hub.locator('[data-ab-form] button[type="submit"]').click();
  await hub.locator('[data-ab-vital-chart]').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await hub.locator('[data-ab-vital-chart] circle').count(), 2);
  pass('Arztbuch: Zwei numerische Messungen derselben Messgröße werden als Verlauf dargestellt');
  assert.equal(await hub.locator('[data-ab-vital-summary-row]').count(), 1);
  assert.equal(await hub.locator('[data-ab-vital-summary-row] td').first().textContent(), '11/2026');
  await hub.locator('[data-ab-vital-summary-mode]').selectOption('year');
  assert.equal(await hub.locator('[data-ab-vital-summary-row] td').first().textContent(), '2026');
  await hub.locator('[data-ab-vital-summary-mode]').selectOption('month');
  pass('Arztbuch: Monats- und Jahresübersicht wechseln den Zeitraum korrekt');
  assert.equal(await hub.locator('[data-ab-vital-export]').isVisible(), true);
  pass('Arztbuch: CSV-Export-Schaltfläche ist im Vitalwerte-Verlauf sichtbar');

  const csvDownloadPromise = page.waitForEvent('download');
  await hub.locator('[data-ab-vital-export]').click();
  const csvDownload = await csvDownloadPromise;
  assert.equal(csvDownload.suggestedFilename(), 'haldo-vitalwerte.csv');
  const csvPath = await csvDownload.path();
  assert.ok(csvPath, 'CSV-Download hat keinen Dateipfad geliefert.');
  const csvText = await fs.readFile(csvPath, 'utf8');
  assert.equal(csvText.charCodeAt(0), 0xFEFF, 'CSV-Datei besitzt keine UTF-8-BOM.');
  assert.ok(csvText.includes('"Messgröße";"Messwert";"Einheit";"Messdatum";"Quelle";"Notiz"'));
  assert.equal((csvText.match(/"Puls E2E"/g) || []).length, 2, 'CSV enthält nicht beide Vitalwert-Messungen.');
  assert.ok(csvText.includes('"' + "'=1+1; " + '""morgens"""'), 'CSV hat Formelinjection-Präfix oder CSV-Quoting nicht korrekt angewendet.');
  pass('Arztbuch: CSV wird tatsächlich heruntergeladen; UTF-8, Spalten, beide Datensätze und sichere Zell-Escapes geprüft');






  await hub.locator('[data-ab-tab="overview"]').click();
  await hub.locator('[data-ab-open-module="laborwerte-pro"]').waitFor({ state: 'visible' });

  // Laborwerte: empty-vault persistence, CRUD, ciphertext, backup restore and password rejection.
  const labKey = 'haldo_v167_laborwerte_vault';
  const lab = await openMedicalAppFromHub(hub, 'laborwerte-pro');
  pass('Arztbuch-Kommandozentrale öffnet HalDo Laborwerte Pro direkt');
  await createOrUnlock(lab, PASS);
  await assertEncrypted(labKey);
  pass('Laborwerte: neu angelegter leerer Tresor wird sofort verschlüsselt gespeichert');

  await submitRecord(lab, {
    name: 'Kalium-E2E',
    value: '4.1',
    unit: 'mmol/L',
    reference: '3.5–5.1',
    date: '2026-11-26',
    source: 'HalDo E2E Labor',
    note: 'Nur automatischer Browser-Test'
  });
  await lab.getByText('Kalium-E2E', { exact: true }).waitFor({ timeout: 15000 });
  await assertEncrypted(labKey, ['Kalium-E2E', 'Nur automatischer Browser-Test']);
  pass('Laborwerte: Eintrag angelegt und nicht als Klartext gespeichert');

  await lab.locator('[data-edit]').first().click();
  await lab.locator('[name="value"]').fill('4.2');
  await lab.locator('#h167-record-form button[type="submit"]').click();
  await lab.getByText('4.2', { exact: false }).first().waitFor({ timeout: 15000 });
  await assertEncrypted(labKey, ['Kalium-E2E', 'Nur automatischer Browser-Test']);
  pass('Laborwerte: Eintrag bearbeitet und erneut verschlüsselt gespeichert');

  const labBackup = await exportBackup(lab);
  pass('Laborwerte: verschlüsseltes Backup exportiert und JSON-Envelope geprüft');

  await lab.locator('#h167-lock').click();
  await lab.locator('#h167-pass').fill(WRONG);
  await lab.locator('#h167-unlock-form button[type="submit"]').click();
  await waitForStatus(lab, 'Passphrase falsch oder Backup beschädigt.');
  await assertEncrypted(labKey, ['Kalium-E2E']);
  pass('Laborwerte: falsche Passphrase wird abgewiesen; gespeicherter Tresor bleibt erhalten');

  await lab.locator('#h167-pass').fill(PASS);
  await lab.locator('#h167-unlock-form button[type="submit"]').click();
  await lab.locator('#h167-record-form').waitFor({ timeout: 15000 });

  await lab.locator('#h167-lock').click();
  await page.evaluate((key) => localStorage.removeItem(key), labKey);
  await lab.locator('#h167-pass').fill(WRONG);
  await lab.locator('#h167-import-file').setInputFiles(labBackup);
  await waitForStatus(lab, 'Passphrase falsch oder Backup beschädigt.');
  assert.equal(await readVault(labKey), null, 'Falsches Backup-Passwort hat Daten geschrieben.');
  pass('Laborwerte: falsches Backup-Passwort importiert keine Daten');

  await lab.locator('#h167-pass').fill(PASS);
  page.once('dialog', (dialog) => dialog.accept());
  await lab.locator('#h167-import-file').setInputFiles(labBackup);
  await lab.locator('#h167-record-form').waitFor({ timeout: 20000 });
  await lab.getByText('Kalium-E2E', { exact: true }).waitFor({ timeout: 15000 });
  await assertEncrypted(labKey, ['Kalium-E2E']);
  pass('Laborwerte: korrektes verschlüsseltes Backup wiederhergestellt');

  page.once('dialog', (dialog) => dialog.accept());
  await lab.locator('[data-delete]').first().click();
  await lab.getByText('Noch keine Einträge oder keine Treffer.').waitFor({ timeout: 15000 });
  await assertEncrypted(labKey, ['Kalium-E2E']);
  pass('Laborwerte: Löschen funktioniert und wird verschlüsselt persistiert');

  await closeApp(lab);
  pass('Laborwerte: Fenster lässt sich regulär schließen');

  // Medication plan: required fields, edit/save path, ciphertext, backup import/export.
  const medicationKey = 'haldo_v167_medication_vault';
  const medication = await openMedicalAppFromHub(hub, 'medikamentenplan-pro');
  pass('Arztbuch-Kommandozentrale öffnet HalDo Medikamentenplan Pro direkt');
  await createOrUnlock(medication, PASS);
  await assertEncrypted(medicationKey);
  pass('Medikamentenplan: leerer Tresor wird sofort verschlüsselt gespeichert');

  await submitRecord(medication, {
    name: 'Testmedikament-E2E',
    ingredient: 'Testwirkstoff',
    dose: 'Laut Testverordnung: 1 Tablette',
    route: 'oral',
    times: '08:00',
    start: '2026-11-26',
    end: '2026-12-01',
    prescriber: 'Testpraxis',
    note: 'Keine echte Verordnung'
  });
  await medication.getByText('Testmedikament-E2E', { exact: true }).waitFor({ timeout: 15000 });
  await assertEncrypted(medicationKey, ['Testmedikament-E2E', 'Keine echte Verordnung']);
  pass('Medikamentenplan: Eintrag gespeichert; Klartext bleibt aus localStorage heraus');

  await medication.locator('[data-edit]').first().click();
  await medication.locator('[name="dose"]').fill('Laut Testverordnung: 2 Tabletten');
  await medication.locator('#h167-record-form button[type="submit"]').click();
  await medication.getByText('2 Tabletten', { exact: false }).first().waitFor({ timeout: 15000 });
  await assertEncrypted(medicationKey, ['Testmedikament-E2E']);
  pass('Medikamentenplan: Bearbeiten und erneutes Speichern funktionieren');

  const medicationBackup = await exportBackup(medication);
  await medication.locator('#h167-lock').click();
  await medication.locator('#h167-pass').fill(WRONG);
  await medication.locator('#h167-unlock-form button[type="submit"]').click();
  await waitForStatus(medication, 'Passphrase falsch oder Backup beschädigt.');
  await medication.locator('#h167-pass').fill(PASS);
  await medication.locator('#h167-unlock-form button[type="submit"]').click();
  await medication.locator('#h167-record-form').waitFor({ timeout: 15000 });

  await medication.locator('#h167-lock').click();
  await page.evaluate((key) => localStorage.removeItem(key), medicationKey);
  await medication.locator('#h167-pass').fill(PASS);
  page.once('dialog', (dialog) => dialog.accept());
  await medication.locator('#h167-import-file').setInputFiles(medicationBackup);
  await medication.locator('#h167-record-form').waitFor({ timeout: 20000 });
  await medication.getByText('Testmedikament-E2E', { exact: true }).waitFor({ timeout: 15000 });
  await assertEncrypted(medicationKey, ['Testmedikament-E2E', 'Testwirkstoff']);
  pass('Medikamentenplan: verschlüsseltes Backup exportiert und erfolgreich wiederhergestellt');

  page.once('dialog', (dialog) => dialog.accept());
  await medication.locator('[data-delete]').first().click();
  await medication.getByText('Noch keine Einträge oder keine Treffer.').waitFor({ timeout: 15000 });
  await assertEncrypted(medicationKey, ['Testmedikament-E2E']);
  pass('Medikamentenplan: Löschen funktioniert und wird verschlüsselt persistiert');

  await closeApp(medication);
  pass('Medikamentenplan: Fenster lässt sich regulär schließen');

  await closeWindow(hub);
  pass('Arztbuch Pro: Kommandozentrale lässt sich regulär schließen');

  const relevantErrors = pageErrors.filter((entry) => /haldo-v167|h167|laborwerte-pro|medikamentenplan-pro|arztbuch|gesundheit|musik\.js|music-studio/i.test(entry));
  assert.deepEqual(relevantErrors, [], 'JavaScript-Fehler im v167-Modul: ' + relevantErrors.join('\n'));
  console.log('\nBrowser-Test abgeschlossen: ' + checks.length + ' Prüfungen erfolgreich.');
  await context.close();
}

try {
  await run();
} catch (error) {
  if (page) {
    try {
      await fs.mkdir(path.join(ROOT, 'artifacts'), { recursive: true });
      await page.screenshot({ path: path.join(ROOT, 'artifacts', 'medical-apps-browser-failure.png'), fullPage: true });
    } catch {}
  }
  console.error('\nBROWSER-TEST FEHLGESCHLAGEN');
  console.error(error?.stack || error);
  if (pageErrors.length) console.error('BROWSER PAGE ERRORS ' + pageErrors.join('\n---\n'));
  if (browserConsoleErrors.length) console.error('BROWSER CONSOLE ERRORS ' + browserConsoleErrors.join('\n---\n'));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}

if (process.exitCode === 1) {
  console.error('Prüfungen erreicht: ' + checks.length + ' / geplanter Ablauf');
}
