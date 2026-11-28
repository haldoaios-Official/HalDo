import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = resolve(projectRoot, relative);
    if (file !== projectRoot && !file.startsWith(projectRoot + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': mime[extname(file).toLowerCase()] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolveListen, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListen);
});

let browser;
try {
  const address = server.address();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });

  // Keep the acceptance test deterministic and independent of optional third-party CDNs.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' && url.port === String(address.port)) return route.continue();
    return route.abort();
  });

  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.HalDo && typeof window.HalDo.Launch === 'function' && window.HalDo.SystemCenter, null, { timeout: 30000 });

  // The global welcome experience opens once automatically during startup.
  const welcomeSelector = '#haldo-v161-welcome';
  const welcome = page.locator(welcomeSelector);
  await welcome.waitFor({ state: 'visible', timeout: 15000 });
  await welcome.locator('button').click({ force: true });
  await welcome.waitFor({ state: 'hidden', timeout: 10000 });

  // Exercise the same public launcher entry point used by the app registry.
  await page.evaluate(() => window.HalDo.Launch({ id: 'system-center', n: 'HalDo System Center Pro' }));
  // App launch is intentionally gated by its own welcome/confirmation screen.
  await welcome.waitFor({ state: 'visible', timeout: 15000 });
  await welcome.locator('button').click({ force: true });
  const root = page.locator('.hdsc-root');
  await root.waitFor({ state: 'visible', timeout: 15000 });

  const search = root.locator('input[placeholder^="App oder App-ID"]');
  const status = root.locator('select').nth(0);
  const category = root.locator('select').nth(1);
  const rows = root.locator('tbody tr');

  assert.ok(await rows.count() > 0, 'The inventory renders app rows');
  assert.equal(await status.locator('option').count(), 8, 'All seven runtime status filters plus All are available');
  assert.ok(await category.locator('option').count() >= 27, 'All 26 A–Z categories plus the two general options are available');

  await search.fill('system-center');
  await page.waitForFunction(() => {
    const root = document.querySelector('.hdsc-root');
    return root && root.querySelectorAll('tbody tr').length === 1;
  });
  assert.match(await rows.first().innerText(), /system-center/i, 'Search filters the inventory by app ID');

  await root.locator('[data-app-details="system-center"]').click();
  const detail = root.locator('.hdsc-detail');
  await detail.waitFor({ state: 'visible' });
  assert.match(await detail.innerText(), /HalDo System Center Pro/);
  assert.match(await detail.innerText(), /Nächste technische Schritte/);
  await detail.locator('[data-close-details]').click();
  await page.waitForFunction(() => {
    const panel = document.querySelector('.hdsc-root .hdsc-detail');
    return panel && panel.hidden;
  });

  await root.locator('button').filter({ hasText: 'Zurücksetzen' }).click();
  await status.selectOption('native');
  await page.waitForTimeout(100);
  assert.ok(await rows.count() > 0, 'The native-module filter returns matching rows');

  await status.selectOption('all');
  await category.selectOption('A');
  await page.waitForTimeout(100);
  assert.ok(await rows.count() > 0, 'The A category filter returns matching rows');

  await category.selectOption('all');
  const downloadPromise = page.waitForEvent('download');
  await root.locator('[data-action="export"]').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'HalDo-Systeminventar.csv');
  assert.equal(await download.failure(), null, 'CSV export completes without a browser download error');

  await page.setViewportSize({ width: 390, height: 844 });
  await search.scrollIntoViewIfNeeded();
  assert.ok(await search.isVisible(), 'Search remains visible in the mobile viewport');
  assert.ok(await root.locator('[data-action="export"]').isVisible(), 'CSV action remains available in the mobile viewport');

  console.log('System Center Chromium acceptance passed: launcher, A–Z inventory, all status options, category filter, search, details, close, CSV download and mobile visibility.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
