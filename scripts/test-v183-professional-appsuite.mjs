import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PASS = 'HalDo-v183-Test!2026';
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.glb':'model/gltf-binary' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = path.resolve(ROOT, '.' + pathname);
    if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
    const stat = await fs.stat(file);
    if (!stat.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-store' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});

let browser;
const errors = [];
const checks = [];
function pass(label) { checks.push(label); console.log('PASS ' + label); }

try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  browser = await chromium.launch({ headless:true });
  const page = await browser.newPage({ acceptDownloads:true });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:' + address.port + '/index.html', { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => !!(window.HalDo && window.HalDo.ProfessionalSuiteV183), null, { timeout:20000 });

  const status = await page.evaluate(() => window.HalDo.ProfessionalSuiteV183.getStatus());
  assert.deepEqual(status.registered.map(x => x.id), ['app-registry','anwaelte-pro','gesetze-pro','logo-patent-pro']);
  assert(status.registered.every(x => x.ready));
  pass('Alle vier Apps sind registriert und besitzen einen open()-Handler.');

  await page.evaluate(() => window.HalDo['app-registry'].open());
  const store = page.locator('.hdv183-store');
  await store.waitFor({ state:'visible' });
  await store.locator('[data-store-search]').fill('Anwälte');
  await store.getByText('HalDo Anwälte App Pro').waitFor();
  pass('AppStore-Suche findet die neue HalDo Anwälte App.');

  await page.evaluate(() => window.HalDo['anwaelte-pro'].open());
  const lawyer = page.locator('.hdv183-workspace').last();
  await lawyer.locator('[data-vault-gate]').waitFor();
  await lawyer.locator('#hdv183-pass').fill(PASS);
  await lawyer.locator('[data-vault-gate] button[type="submit"]').click();
  await lawyer.locator('[data-workspace-form]').waitFor({ timeout:20000 });
  await lawyer.locator('[name="client"]').fill('Test Mandant v183');
  await lawyer.locator('[name="matter"]').fill('AZ-183-E2E');
  await lawyer.locator('[name="status"]').fill('Testfall');
  await lawyer.locator('[name="notes"]').fill('Geheime Testnotiz v183');
  await lawyer.locator('[data-workspace-form] button[type="submit"]').click();
  await lawyer.getByText('Test Mandant v183').waitFor({ timeout:20000 });
  const cleartextLeak = await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('haldo_datavault_v180', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const rows = await new Promise((resolve, reject) => {
      const request = db.transaction(['records'], 'readonly').objectStore('records').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return JSON.stringify(rows).includes('Test Mandant v183') || JSON.stringify(rows).includes('Geheime Testnotiz v183');
  });
  assert.equal(cleartextLeak, false);
  pass('Anwälte-Arbeitsbereich speichert über DataVault; Klartext taucht nicht im IndexedDB-Datensatz auf.');

  await page.evaluate(() => window.HalDo['gesetze-pro'].open());
  const laws = page.locator('.hdv183-laws');
  await laws.getByRole('link', { name:/Amtlichen Gesetzestext öffnen/ }).first().waitFor();
  assert.equal(await laws.locator('a[href="https://www.gesetze-im-internet.de/bgb/"]').count(), 1);
  await laws.locator('[data-law-save="BGB"]').click();
  await laws.getByText(/wurde verschlüsselt gemerkt/).waitFor();
  pass('Gesetze-App zeigt amtliche Quellen und speichert gemerkte Gesetze verschlüsselt.');

  await page.evaluate(() => window.HalDo['logo-patent-pro'].open());
  const brand = page.locator('.hdv183-brand');
  await brand.locator('[data-brand-preview] svg').waitFor();
  const downloadPromise = page.waitForEvent('download');
  await brand.locator('[data-brand-export]').click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.svg$/i);
  pass('Logo-Studio erzeugt eine SVG-Datei zum Export.');

  assert.deepEqual(errors, [], 'Browser-Konsole oder Seite enthält Fehler: ' + errors.join(' | '));
  pass('Keine Browser- oder JavaScript-Konsolenfehler im Testszenario.');
  console.log('v183 professional appsuite: ' + checks.length + '/' + checks.length + ' checks passed.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
