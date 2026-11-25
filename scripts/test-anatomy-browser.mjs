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
  const canvas = page.locator('#viewport canvas');


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
    if (profile.id === 'adult_male' && !infoText.includes('Quelle, Lizenz und klinische Validierung')) {
      throw new Error('adult_male: Quellen- und Klinikhinweis wird nicht angezeigt.');
    }
    if (profile.id !== 'adult_male' && (!infoText.includes('Gelenkpassungen') || !infoText.includes('nicht fachlich oder klinisch validiert'))) {
      throw new Error(profile.id + ': Hinweis auf offene Gelenkvalidierung wird nicht angezeigt.');
    }
    if (profile.id === 'baby' && !infoText.includes('Unterkiefer-Skalierung des Baby-Profils korrigiert')) {
      throw new Error('Baby-Profil: Unterkiefer-Skalierung wurde nicht korrigiert.');
    }
    await page.waitForFunction(() => {
      const overlay = document.querySelector('#loading');
      return overlay?.classList.contains('hidden') && getComputedStyle(overlay).opacity === '0';
    }, null, { timeout: 10000 });

    // Klick-Auswahl auf echte GLB-Meshes prüfen (nicht nur Canvas-Erstellung).
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error(profile.id + ': Canvas besitzt keine messbare Fläche.');
    let selectedName = '';
    const xCandidates = [0.50, 0.48, 0.52];
    const yCandidates = [0.32, 0.36, 0.40, 0.44, 0.48, 0.52, 0.56, 0.60, 0.64, 0.68, 0.72, 0.76];
    for (const y of yCandidates) {
      for (const x of xCandidates) {
        await page.mouse.click(canvasBox.x + canvasBox.width * x, canvasBox.y + canvasBox.height * y);
        if (await page.locator('#info-content .info-card').count()) {
          selectedName = (await page.locator('#info-content .info-card .name').textContent())?.trim() || '';
          if (selectedName) break;
        }
      }
      if (selectedName) break;
    }
    if (!selectedName) throw new Error(profile.id + ': Klick auf Knochen hat keine Detailkarte geöffnet.');
    console.log('PASS', profile.id, 'Klick-Auswahl:', selectedName);

    // Sichtbarkeit umschalten und mit Reset inklusive Kameraansicht zurücksetzen.
    await page.locator('#btn-bones').click();
    const bonesHidden = !(await page.locator('#btn-bones').evaluate(el => el.classList.contains('active')));
    if (!bonesHidden) throw new Error(profile.id + ': Knochen-Schalter hat nicht deaktiviert.');
    await page.locator('#btn-reset').click();
    const bonesRestored = await page.locator('#btn-bones').evaluate(el => el.classList.contains('active'));
    if (!bonesRestored) throw new Error(profile.id + ': Reset hat die Knochenansicht nicht wiederhergestellt.');
    if (await page.locator('#info-content .info-card').count()) {
      throw new Error(profile.id + ': Reset hat die Detailauswahl nicht zurückgesetzt.');
    }

    await page.screenshot({ path: 'artifacts/anatomy/' + profile.id + '.png', fullPage: true });
    console.log('PASS', profile.id, status);
  }

  if (await canvas.count() !== 1) throw new Error('3D-Canvas wurde nicht genau einmal erstellt.');
  const canvasSize = await canvas.evaluate(element => ({ width: element.width, height: element.height }));
  if (canvasSize.width < 100 || canvasSize.height < 100) throw new Error('3D-Canvas hat keine gültige Größe.');

  // Vermisst angrenzende Oberflächen der unteren Extremität in allen Profilen.
  // Diagnostik-only: misst dekodierte Meshes und verändert keine Modell-Transforms.
  const jointDiagnostics = await page.evaluate(async () => {
    const THREE = await import('three');
    const { loadBoneModel } = await import('./models/loader.js');

    function collectWorldVertices(root) {
      root.updateMatrixWorld(true);
      const points = [];
      const temp = new THREE.Vector3();
      root.traverse(node => {
        const position = node.isMesh ? node.geometry?.getAttribute('position') : null;
        if (!position) return;
        for (let i = 0; i < position.count; i++) {
          temp.fromBufferAttribute(position, i).applyMatrix4(node.matrixWorld);
          points.push([temp.x, temp.y, temp.z]);
        }
      });
      return points;
    }

    function closestSurfaceVertices(a, b) {
      let bestSquared = Infinity;
      let bestA = null;
      let bestB = null;
      for (const p of a) {
        for (const q of b) {
          const dx = p[0] - q[0], dy = p[1] - q[1], dz = p[2] - q[2];
          const squared = dx * dx + dy * dy + dz * dz;
          if (squared < bestSquared) {
            bestSquared = squared;
            bestA = p;
            bestB = q;
          }
        }
      }
      return {
        distance_mm: Math.sqrt(bestSquared) * 1000,
        point_a: bestA,
        point_b: bestB
      };
    }

    const profiles = ['adult_male', 'adult_female', 'baby'];
    const pairs = [
      ['hip', 'coxal', 'femur'],
      ['sacroiliac', 'coxal', 'sacrum'],
      ['knee_femur_patella', 'femur', 'patella'],
      ['knee_femur_tibia', 'femur', 'tibia'],
      ['ankle_tibia_talus', 'tibia', 'talus'],
      ['ankle_fibula_talus', 'fibula', 'talus'],
      ['hindfoot_talus_calcaneus', 'talus', 'calcaneus']
    ];
    const report = [];
    for (const profileId of profiles) {
      const models = {};
      for (const boneId of ['coxal', 'sacrum', 'femur', 'patella', 'tibia', 'fibula', 'talus', 'calcaneus']) {
        const assetId = boneId === 'sacrum' ? 'sacrum' : 'left_' + boneId;
        const gltf = await loadBoneModel(THREE, profileId, assetId);
        models[boneId] = collectWorldVertices(gltf.scene);
      }
      const joints = {};
      for (const [name, a, b] of pairs) {
        joints[name] = closestSurfaceVertices(models[a], models[b]);
      }
      report.push({
        profile: profileId,
        vertex_counts: Object.fromEntries(Object.entries(models).map(([id, vertices]) => [id, vertices.length])),
        joints
      });
    }
    return report;
  });
  for (const diagnostic of jointDiagnostics) {
    console.log('LOWER-LIMB-JOINT-DIAGNOSTIC', JSON.stringify(diagnostic));
  }

  // Linke/rechte Hüftsymmetrie wird separat am tatsächlichen Modellbestand geprüft.
  const hipSymmetry = await page.evaluate(async () => {
    const THREE = await import('three');
    const { loadBoneModel } = await import('./models/loader.js');
    function collect(root) {
      root.updateMatrixWorld(true);
      const pts = [], temp = new THREE.Vector3();
      root.traverse(node => {
        const pos = node.isMesh ? node.geometry?.getAttribute('position') : null;
        if (!pos) return;
        for (let i = 0; i < pos.count; i++) {
          temp.fromBufferAttribute(pos, i).applyMatrix4(node.matrixWorld);
          pts.push([temp.x, temp.y, temp.z]);
        }
      });
      return pts;
    }
    function distance(a, b) {
      let min = Infinity;
      for (const p of a) for (const q of b) {
        const x = p[0]-q[0], y = p[1]-q[1], z = p[2]-q[2];
        min = Math.min(min, x*x+y*y+z*z);
      }
      return Math.sqrt(min)*1000;
    }
    const report = [];
    for (const profile of ['adult_male', 'adult_female', 'baby']) {
      const sides = {};
      for (const side of ['left', 'right']) {
        const [pelvis, femur] = await Promise.all([
          loadBoneModel(THREE, profile, side + '_coxal'),
          loadBoneModel(THREE, profile, side + '_femur')
        ]);
        sides[side] = distance(collect(pelvis.scene), collect(femur.scene));
      }
      report.push({profile, ...sides, difference_mm:Math.abs(sides.left-sides.right)});
    }
    return report;
  });
  for (const diagnostic of hipSymmetry) {
    console.log('HIP-SYMMETRY-DIAGNOSTIC', JSON.stringify(diagnostic));
    if (diagnostic.difference_mm > 0.05) {
      throw new Error(diagnostic.profile + ': linke/rechte Hüftgelenk-Messung ist nicht spiegelgleich.');
    }
  }

  // Prüft, ob Anatomie 3D aus dem echten HalDo-App-Launcher als Fenster startet.
  const launcherPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await launcherPage.goto(baseUrl + '/index.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await launcherPage.waitForFunction(
    () => typeof window.HalDo?.Launch === 'function' && typeof window.HalDo?.AppBrowser?.open === 'function',
    null,
    { timeout: 30000 }
  );

  // Das Betriebssystem zeigt beim ersten Start seine globale Begrüßung.
  const systemWelcome = launcherPage.locator('#haldo-v161-welcome');
  await systemWelcome.waitFor({ state: 'visible', timeout: 15000 });
  await systemWelcome.locator('.h161-button').click();
  await systemWelcome.waitFor({ state: 'detached', timeout: 10000 });

  const appRegistered = await launcherPage.evaluate(() =>
    window.HalDo.Registry.getFeatured().some(app => app.id === 'anatomie-3d')
  );
  if (!appRegistered) throw new Error('Anatomie 3D Pro Max fehlt in der HalDo App-Registry.');
  console.log('PASS HalDo App-Registry enthält Anatomie 3D Pro Max');

  // Startet exakt den Launch-Eintrag, den auch die App-Registry aufruft.
  await launcherPage.evaluate(() => {
    const app = window.HalDo.Registry.getFeatured().find(item => item.id === 'anatomie-3d');
    window.HalDo.Launch(app);
  });

  // Für Apps wird zuerst die passende HalDo-Begrüßung mit Startknopf gezeigt.
  const appWelcome = launcherPage.locator('#haldo-v161-welcome');
  await appWelcome.waitFor({ state: 'visible', timeout: 15000 });
  const welcomeText = await appWelcome.textContent();
  if (!welcomeText?.includes('HalDo Anatomie 3D Pro Max')) {
    throw new Error('Die spezielle Begrüßung für Anatomie 3D Pro Max wird nicht angezeigt.');
  }
  if (!welcomeText.includes('Gesundheits- und Organisationsbereich')) {
    throw new Error('Die Anatomie-App erhält nicht die passende Gesundheitsbegrüßung.');
  }
  await appWelcome.locator('.h161-button').click();

  const anatomyFrameElement = launcherPage.locator('#haldo-anatomy-frame');
  await anatomyFrameElement.waitFor({ state: 'attached', timeout: 15000 });
  const embeddedFrame = launcherPage.frames().find(frame => frame.url().includes('/anatomie.html'));
  if (!embeddedFrame) throw new Error('HalDo-Launcher hat keinen Anatomie-iFrame geladen.');
  await embeddedFrame.waitForFunction(
    () => {
      const status = document.querySelector('#profile-status')?.textContent || '';
      return status.includes('179/179 Knochen geladen') || status.includes('Laden fehlgeschlagen');
    },
    null,
    { timeout: 60000 }
  );
  const embeddedStatus = await embeddedFrame.locator('#profile-status').textContent();
  if (!embeddedStatus?.includes('179/179 Knochen geladen')) {
    throw new Error('Anatomie 3D im HalDo-Fenster konnte nicht vollständig laden: ' + embeddedStatus);
  }
  const embeddedBox = await anatomyFrameElement.boundingBox();
  if (!embeddedBox || embeddedBox.width < 500 || embeddedBox.height < 350) {
    throw new Error('Anatomie-iFrame wird im HalDo-Fenster nicht in ausreichender Größe dargestellt.');
  }
  await launcherPage.screenshot({ path: 'artifacts/anatomy/haldo-launcher.png', fullPage: true });
  console.log('PASS HalDo App-Launcher öffnet Anatomie 3D Pro Max im Fenster');

  if (pageErrors.length) throw new Error('Browser-JavaScriptfehler: ' + pageErrors.join(' | '));
  if (failedAssetRequests.length) throw new Error('Fehlgeschlagene Modell-/Decoder-Anfragen: ' + JSON.stringify(failedAssetRequests));

  console.log('ANATOMY BROWSER SMOKE TEST: PASS');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
