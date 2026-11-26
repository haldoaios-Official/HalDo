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
  if (!(await welcome.count())) return;
  const button = welcome.locator('button.h161-button');
  if (!(await button.count())) return;
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
    while (host.parentElement && host.parentElement !== layer) host = host.parentElement;
    return host.parentElement === layer && host.id ? host.id : null;
  });
  assert.ok(windowId, 'Fenster-ID konnte vor dem Schließen nicht aus #winLayer ermittelt werden.');
  await page.evaluate((id) => {
    if (!window.HalDo || !window.HalDo.Win || typeof window.HalDo.Win.close !== 'function') {
      throw new Error('HalDo.Win.close ist nicht verfügbar.');
    }
    window.HalDo.Win.close(id);
  }, windowId);
  await root.waitFor({ state: 'detached', timeout: 5000 });
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
    page.waitForEvent('download'),
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

  // The OS shell needs its pinned Three.js r128 runtime to initialize the
  // cosmic background and remove the startup loader. Keep unrelated services blocked.
  const requiredExternalAssets = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/',
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
      !!(window.HalDo['laborwerte-pro'] && window.HalDo['medikamentenplan-pro']);
  }, { timeout: 45000 });
  pass('HalDo OS startet auf sicherem Browser-Kontext; beide medizinischen Apps sind registriert');

  // Complete the actual first-run welcome gate before opening app windows.
  const systemWelcome = page.locator('#haldo-v161-welcome');
  await systemWelcome.waitFor({ state: 'visible', timeout: 15000 });
  await systemWelcome.locator('button.h161-button').click();
  await systemWelcome.waitFor({ state: 'detached', timeout: 10000 });
  await page.locator('#loader').waitFor({ state: 'hidden', timeout: 20000 });
  pass('HalDo-Willkommensbildschirm und Three.js-Kosmos: Arbeitsbereich vollständig gestartet');

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

  const relevantErrors = pageErrors.filter((entry) => /haldo-v167|h167|laborwerte-pro|medikamentenplan-pro|arztbuch|gesundheit/i.test(entry));
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
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}

if (process.exitCode === 1) {
  console.error('Prüfungen erreicht: ' + checks.length + ' / geplanter Ablauf');
}
