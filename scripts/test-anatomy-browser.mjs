import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';

const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: process.cwd(),
  stdio: 'ignore'
});
let browser;

async function waitForServer() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl + '/anatomie.html');
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Lokaler HTTP-Testserver wurde nicht rechtzeitig erreichbar.');
}

try {
  await waitForServer();
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist'
    ]
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  const failedAssetRequests = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    const url = request.url();
    if (url.endsWith('.glb') || url.includes('draco') || url.includes('three.module.js')) {
      failedAssetRequests.push({ url, error: request.failure()?.errorText || 'request failed' });
    }
  });

  await page.goto(baseUrl + '/anatomie.html', { waitUntil: 'domcontentloaded', timeout: 60000 });

  await mkdir('artifacts/anatomy', { recursive: true });

  const profiles = [
    { id: 'adult_male', count: 179 },
    { id: 'adult_female', count: 179 },
    { id: 'baby', count: 178 }
  ];

  for (const profile of profiles) {
    if (profile.id !== 'adult_male') {
      await page.locator('#profile-select').selectOption(profile.id);
      await page.locator('#btn-load-profile').click();
    }

    await page.waitForFunction(
      expected => {
        const status = document.querySelector('#profile-status')?.textContent || '';
        return status.includes(expected + '/' + expected + ' Knochen geladen') ||
          status.includes('Laden fehlgeschlagen');
      },
      profile.count,
      { timeout: 240000 }
    );

    const status = await page.locator('#profile-status').textContent();
    if (!status?.includes(profile.count + '/' + profile.count + ' Knochen geladen')) {
      throw new Error(profile.id + ' konnte nicht vollständig geladen werden: ' + status);
    }
    const infoText = await page.locator('#info-content').textContent();
    if (!infoText?.includes('Schädelposition anhand der Halswirbel-Referenz ausgerichtet')) {
      throw new Error(profile.id + ': Schädel wurde nicht anhand der Halswirbel ausgerichtet.');
    }
    if (profile.id === 'baby' && !infoText.includes('Unterkiefer-Skalierung des Baby-Profils korrigiert')) {
      throw new Error('Baby-Profil: Unterkiefer-Skalierung wurde nicht korrigiert.');
    }
    await page.screenshot({ path: 'artifacts/anatomy/' + profile.id + '.png', fullPage: true });
    console.log('PASS', profile.id, status);
  }

  const canvas = page.locator('#viewport canvas');
  if (await canvas.count() !== 1) throw new Error('3D-Canvas wurde nicht genau einmal erstellt.');
  const canvasSize = await canvas.evaluate(element => ({ width: element.width, height: element.height }));
  if (canvasSize.width < 100 || canvasSize.height < 100) throw new Error('3D-Canvas hat keine gültige Größe.');

  if (pageErrors.length) throw new Error('Browser-JavaScriptfehler: ' + pageErrors.join(' | '));
  if (failedAssetRequests.length) throw new Error('Fehlgeschlagene Modell-/Decoder-Anfragen: ' + JSON.stringify(failedAssetRequests));

  console.log('ANATOMY BROWSER SMOKE TEST: PASS');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
