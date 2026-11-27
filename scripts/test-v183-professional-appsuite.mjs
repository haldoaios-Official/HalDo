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

  // The production build intentionally opens the global welcome overlay on first load.
  // Dismiss it before interacting with app windows so it cannot intercept Playwright clicks.
  const welcomeButton = page.locator('#haldo-v161-welcome .h161-button');
  await welcomeButton.waitFor({ state:'visible', timeout:10000 });
  await welcomeButton.click();
  await page.locator('#haldo-v161-welcome').waitFor({ state:'detached', timeout:10000 });

  const status = await page.evaluate(() => window.HalDo.ProfessionalSuiteV183.getStatus());
  assert.deepEqual(status.registered.map(x => x.id), ['app-registry','anwaelte-pro','gesetze-pro','logo-patent-pro']);
  assert(status.registered.every(x => x.ready));
  pass('Alle vier Apps sind registriert und besitzen einen open()-Handler.');

  assert(await page.evaluate(() => !!window.HalDo.LivingIdentity), 'LivingIdentity ist nicht verfügbar.');
  await page.addScriptTag({ path:path.join(ROOT, 'js/haldo-human-3d-engine.js') });
  const identityBridge = await page.evaluate(() => {
    const identity = window.HalDo.LivingIdentity;
    identity.setAvatarMode('cyborg');
    const afterAvatar = window.HalDo.Human3D.getStatus();
    identity.setEmotion('thinking');
    const afterEmotion = window.HalDo.Human3D.getStatus();
    return { selectedModel:afterAvatar.selectedModel, emotion:afterEmotion.emotion };
  });
  assert.equal(identityBridge.selectedModel, 'cyborg');
  assert.equal(identityBridge.emotion, 'thinking');
  pass('LivingIdentity übergibt Avatar-Auswahl und Emotion korrekt an Human3D.');

  // Simulate out-of-order GLB responses without requiring real avatar assets or WebGL.
  const avatarLoadSafety = await page.evaluate(async () => {
    const THREE = window.THREE;
    if (!THREE) throw new Error('Three.js r128 ist für den Human3D-Test nicht verfügbar.');
    const NativeRenderer = THREE.WebGLRenderer;
    const NativeLoader = THREE.GLTFLoader;
    const testMorphInfluencesByPath = Object.create(null);
    class TestRenderer {
      constructor() { this.domElement = document.createElement('canvas'); this.shadowMap = {}; }
      setPixelRatio() {}
      setSize() {}
      render() {}
    }
    class TestLoader {
      load(url, onLoad, _onProgress, onError) {
        const delay = url.includes('slow') ? 80 : 5;
        window.setTimeout(() => {
          if (url.includes('fail')) { onError(new Error('synthetic GLB load failure')); return; }
          const scene = new THREE.Group();
          const face = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial());
          // Simulate the morph-target dictionary/influences produced by GLTFLoader.
          face.morphTargetDictionary = {
            jawOpen:0,
            eyeBlinkLeft:1,
            mouthSmile:2,
            browInnerUp:3,
            mouthPucker:4,
            eyeSquintLeft:5,
            eyeSquintRight:6,
            eyeWideLeft:7,
            eyeWideRight:8,
            browDownLeft:9,
            browDownRight:10,
            mouthPress:11
          };
          face.morphTargetInfluences = new Array(12).fill(0);
          testMorphInfluencesByPath[url] = face.morphTargetInfluences;
          scene.add(face);
          onLoad({ scene, animations:[new THREE.AnimationClip('Idle', 1, [])] });
        }, delay);
      }
    }
    try {
      THREE.WebGLRenderer = TestRenderer;
      THREE.GLTFLoader = TestLoader;
      const engine = window.HalDo.Human3D;
      engine.registerModel('e2e-race-slow', { name:'Slow test avatar', path:'e2e-race-slow.glb' });
      engine.registerModel('e2e-race-fast', { name:'Fast test avatar', path:'e2e-race-fast.glb' });
      engine.registerModel('e2e-race-fail', { name:'Failing test avatar', path:'e2e-race-fail.glb' });
      const slow = engine.setModel('e2e-race-slow');
      const fast = engine.setModel('e2e-race-fast');
      const raceResults = await Promise.all([slow, fast]);
      const happyEmotionSet = engine.setEmotion('happy');
      const happyFaceValues = engine.getFaceExpressions();
      const surprisedEmotionSet = engine.setEmotion('surprised');
      const surprisedFaceValues = engine.getFaceExpressions();
      const speakingEmotionSet = engine.setEmotion('speaking');
      const speakingFaceValues = engine.getFaceExpressions();
      const jawApplied = engine.setFaceExpression('jawOpen', 0.7);
      const blinkApplied = engine.setFaceExpression('eyeBlinkLeft', 0.4);
      const batchApplied = engine.setFaceExpressions({ mouthSmile:0.6 });
      const faceValues = testMorphInfluencesByPath['e2e-race-fast.glb'].slice(0, 3);
      const supportedFaceExpressions = Object.keys(engine.getFaceExpressions());
      const faceMeshCount = engine.getStatus().faceMeshCount;
      const resetCount = engine.resetFaceExpressions();
      const resetValues = testMorphInfluencesByPath['e2e-race-fast.glb'].slice(0, 3);
      const invalidVisemeOutsideMouth = engine.setVisemeTimeline([
        { timeMs:0, expressions:{ eyeBlinkLeft:1 } },
        { timeMs:100, expressions:{ eyeBlinkLeft:0 } }
      ]);
      const invalidVisemeWeight = engine.setVisemeTimeline([
        { timeMs:0, expressions:{ jawOpen:0 } },
        { timeMs:100, expressions:{ jawOpen:1.2 } }
      ]);
      const visemeTimelineSet = engine.setVisemeTimeline([
        { timeMs:0, expressions:{ jawOpen:0, mouthPucker:0 } },
        { timeMs:100, expressions:{ jawOpen:1, mouthPucker:0.2 } },
        { timeMs:200, expressions:{ jawOpen:0, mouthPucker:1 } }
      ]);
      const visemeInitialValues = engine.getFaceExpressions();
      const visemeUpdateCount = engine.updateVisemes(150);
      const visemeMidValues = engine.getFaceExpressions();
      const visemeMidStatus = engine.getVisemeStatus();
      const visemeClearCount = engine.clearVisemeTimeline();
      const visemeAfterClear = engine.getFaceExpressions();
      const failedReplacement = await engine.setModel('e2e-race-fail');

      // A completed loader script without THREE.GLTFLoader must fail quickly,
      // not wait forever for a load event that has already happened.
      const staleLoaderScript = document.createElement('script');
      staleLoaderScript.dataset.haldoGltfLoader = 'true';
      staleLoaderScript.dataset.haldoLoadState = 'loaded';
      document.head.appendChild(staleLoaderScript);
      THREE.GLTFLoader = undefined;
      engine.registerModel('e2e-loader-stale', { name:'Stale loader test avatar', path:'e2e-loader-stale.glb' });
      const staleLoaderResult = await engine.setModel('e2e-loader-stale');
      const staleLoaderError = engine.getStatus().error;
      staleLoaderScript.remove();

      const status = engine.getStatus();
      return {
        raceResults,
        happyEmotionSet,
        happyFaceValues,
        surprisedEmotionSet,
        surprisedFaceValues,
        speakingEmotionSet,
        speakingFaceValues,
        jawApplied,
        blinkApplied,
        batchApplied,
        faceValues,
        supportedFaceExpressions,
        faceMeshCount,
        resetCount,
        resetValues,
        invalidVisemeOutsideMouth,
        invalidVisemeWeight,
        visemeTimelineSet,
        visemeInitialValues,
        visemeUpdateCount,
        visemeMidValues,
        visemeMidStatus,
        visemeClearCount,
        visemeAfterClear,
        failedReplacement,
        staleLoaderResult,
        staleLoaderError,
        model:status.model,
        loaded:status.loaded,
        animation:status.animation
      };
    } finally {
      THREE.WebGLRenderer = NativeRenderer;
      THREE.GLTFLoader = NativeLoader;
    }
  });
  assert.deepEqual(avatarLoadSafety.raceResults, [false, true], 'Ein veraltetes GLB-Ergebnis wurde nicht verworfen.');
  assert.equal(avatarLoadSafety.happyEmotionSet, true);
  assert.equal(avatarLoadSafety.happyFaceValues.mouthSmile, 0.58);
  assert.equal(avatarLoadSafety.happyFaceValues.eyeSquintLeft, 0.1);
  assert.equal(avatarLoadSafety.surprisedEmotionSet, true);
  assert.equal(avatarLoadSafety.surprisedFaceValues.mouthSmile, 0, 'Vorige Emotions-Morphs wurden beim Wechsel nicht neutralisiert.');
  assert.equal(avatarLoadSafety.surprisedFaceValues.jawOpen, 0.18);
  assert.equal(avatarLoadSafety.surprisedFaceValues.eyeWideLeft, 0.62);
  assert.equal(avatarLoadSafety.speakingEmotionSet, true);
  assert.equal(avatarLoadSafety.speakingFaceValues.jawOpen, 0, 'Sprechen darf ohne Visem-Daten keine künstliche Mundbewegung auslösen.');
  assert.equal(avatarLoadSafety.jawApplied, true);
  assert.equal(avatarLoadSafety.blinkApplied, true);
  assert.equal(avatarLoadSafety.batchApplied, 1);
  assert.equal(avatarLoadSafety.faceMeshCount, 1);
  assert.ok(avatarLoadSafety.supportedFaceExpressions.includes('mouthSmile'));
  assert.ok(avatarLoadSafety.supportedFaceExpressions.includes('eyeWideLeft'));
  assert.deepEqual(avatarLoadSafety.faceValues, [0.7, 0.4, 0.6]);
  assert.equal(avatarLoadSafety.resetCount, 9);
  assert.deepEqual(avatarLoadSafety.resetValues, [0, 0, 0]);
  assert.equal(avatarLoadSafety.invalidVisemeOutsideMouth, false, 'Viseme dürfen keine Augen-/Emotionskanäle übernehmen.');
  assert.equal(avatarLoadSafety.invalidVisemeWeight, false, 'Viseme-Gewichte außerhalb 0–1 müssen abgewiesen werden.');
  assert.equal(avatarLoadSafety.visemeTimelineSet, true);
  assert.equal(avatarLoadSafety.visemeInitialValues.jawOpen, 0);
  assert.equal(avatarLoadSafety.visemeUpdateCount, 2);
  assert.ok(Math.abs(avatarLoadSafety.visemeMidValues.jawOpen - 0.5) < 1e-9);
  assert.ok(Math.abs(avatarLoadSafety.visemeMidValues.mouthPucker - 0.6) < 1e-9);
  assert.equal(avatarLoadSafety.visemeMidStatus.active, true);
  assert.equal(avatarLoadSafety.visemeMidStatus.currentTimeMs, 150);
  assert.equal(avatarLoadSafety.visemeMidStatus.frameCount, 3);
  assert.equal(avatarLoadSafety.visemeClearCount, 2);
  assert.equal(avatarLoadSafety.visemeAfterClear.jawOpen, 0);
  assert.equal(avatarLoadSafety.visemeAfterClear.mouthPucker, 0);
  assert.equal(avatarLoadSafety.model, 'e2e-race-fast', 'Das zuletzt ausgewählte Avatar-Modell wurde überschrieben.');
  assert.equal(avatarLoadSafety.failedReplacement, false);
  assert.equal(avatarLoadSafety.loaded, true, 'Ein fehlgeschlagener Modellwechsel hat das vorherige Avatar-Modell deaktiviert.');
  assert.equal(avatarLoadSafety.animation, 'Idle');
  assert.equal(avatarLoadSafety.staleLoaderResult, false);
  assert.match(avatarLoadSafety.staleLoaderError, /GLTFLoader-Script ist beendet/);
  assert.equal(avatarLoadSafety.model, 'e2e-race-fast', 'Der defekte Loader-Fall hat das vorherige Modell entfernt.');
  assert.equal(avatarLoadSafety.loaded, true);
  pass('Human3D schützt Modellwechsel, erhält das vorige Modell und erkennt einen bereits beendeten defekten GLTFLoader.');

  const voiceVisemeBridge = await page.evaluate(async () => {
    const H = window.HalDo;
    const engine = H.Human3D;
    if (!H.VoiceCore || !engine) throw new Error('Voice Core oder Human3D fehlt.');
    const originalFetch = window.fetch;
    const NativeAudio = window.Audio;
    const originalRAF = window.requestAnimationFrame;
    const originalCAF = window.cancelAnimationFrame;
    const frames = new Map();
    const audios = [];
    let nextFrame = 0;
    class TestAudio {
      constructor(src) { this.src = src; this.currentTime = 0; this.paused = true; this.ended = false; this.listeners = Object.create(null); audios.push(this); }
      addEventListener(name, fn) { (this.listeners[name] || (this.listeners[name] = new Set())).add(fn); }
      removeEventListener(name, fn) { if (this.listeners[name]) this.listeners[name].delete(fn); }
      dispatch(name) { for (const fn of Array.from(this.listeners[name] || [])) fn({ type:name, target:this }); }
      play() { this.paused = false; this.dispatch('play'); return Promise.resolve(); }
      pause() { if (this.paused) return; this.paused = true; this.dispatch('pause'); }
    }
    window.fetch = async () => ({
      ok:true,
      headers:{ get:()=>'application/json' },
      json:async()=>({
        audioUrl:'https://voice.example.test/haldo-audio.mp3',
        visemeTimeline:[
          { timeMs:0, expressions:{ jawOpen:0, mouthPucker:0 } },
          { timeMs:100, expressions:{ jawOpen:1, mouthPucker:0.2 } },
          { timeMs:200, expressions:{ jawOpen:0, mouthPucker:1 } }
        ]
      })
    });
    window.Audio = TestAudio;
    window.requestAnimationFrame = callback => { const id=++nextFrame; frames.set(id,callback); return id; };
    window.cancelAnimationFrame = id => frames.delete(id);
    try {
      const result = await H.VoiceCore.speak('HalDo Visem-Test',{ endpoint:'https://voice.example.test/tts', language:'de-DE' });
      const audio = audios[0];
      if (!audio) throw new Error('Provider-Audioelement wurde nicht erstellt.');
      const activeAfterPlay = engine.getVisemeStatus().active;
      const voiceStatus = H.VoiceCore.status();
      audio.currentTime = 0.05;
      let next = Array.from(frames.entries()).pop();
      if (!next) throw new Error('Keine Animation-Frame-Aktualisierung registriert.');
      frames.delete(next[0]); next[1](50);
      const jawAt50ms = engine.getFaceExpressions().jawOpen;
      audio.currentTime = 0.15;
      next = Array.from(frames.entries()).pop();
      if (!next) throw new Error('Zweiter Animation-Frame fehlt.');
      frames.delete(next[0]); next[1](150);
      const jawAt150ms = engine.getFaceExpressions().jawOpen;
      audio.currentTime = 0.25;
      next = Array.from(frames.entries()).pop();
      if (!next) throw new Error('Frame zur Prüfung des Timeline-Endes fehlt.');
      frames.delete(next[0]); next[1](250);
      const inactiveAfterTimelineEnd = !engine.getVisemeStatus().active;
      audio.currentTime = 0.1;
      audio.dispatch('seeked');
      const activeAfterSeekBack = engine.getVisemeStatus().active;
      const jawAfterSeekBack = engine.getFaceExpressions().jawOpen;
      const audioBridgeBound = H.VoiceCore.status().visemeAudioBound;
      audio.pause();
      const inactiveAfterPause = !engine.getVisemeStatus().active;
      const jawAfterPause = engine.getFaceExpressions().jawOpen;
      H.VoiceCore.stop();
      return {
        mode:result.mode,
        visemes:result.visemes,
        activeAfterPlay,
        jawAt50ms,
        jawAt150ms,
        inactiveAfterTimelineEnd,
        activeAfterSeekBack,
        jawAfterSeekBack,
        audioBridgeBound,
        inactiveAfterPause,
        jawAfterPause,
        voiceStatus
      };
    } finally {
      try { H.VoiceCore.stop(); } catch (_) {}
      window.fetch = originalFetch;
      window.Audio = NativeAudio;
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCAF;
    }
  });
  assert.equal(voiceVisemeBridge.mode, 'provider');
  assert.equal(voiceVisemeBridge.visemes, true, 'Voice Core hat die Provider-Viseme nicht an Human3D übergeben.');
  assert.equal(voiceVisemeBridge.activeAfterPlay, true);
  assert.ok(Math.abs(voiceVisemeBridge.jawAt50ms - 0.5) < 1e-9);
  assert.ok(Math.abs(voiceVisemeBridge.jawAt150ms - 0.5) < 1e-9);
  assert.equal(voiceVisemeBridge.inactiveAfterTimelineEnd, true, 'Visem-Zeitachse wurde nach ihrem Ende nicht beendet.');
  assert.equal(voiceVisemeBridge.activeAfterSeekBack, true, 'Zurückspulen hat die Visem-Zeitachse nicht erneut aktiviert.');
  assert.equal(voiceVisemeBridge.jawAfterSeekBack, 1, 'Zurückspulen hat den zur neuen Audioposition passenden Morph nicht wiederhergestellt.');
  assert.equal(voiceVisemeBridge.audioBridgeBound, true);
  assert.equal(voiceVisemeBridge.inactiveAfterPause, true, 'Pause hat die laufende Visem-Ebene nicht zurückgesetzt.');
  assert.equal(voiceVisemeBridge.jawAfterPause, 0, 'Pause hat den Kiefer-Morph nicht neutralisiert.');
  assert.equal(voiceVisemeBridge.voiceStatus.visemeAudioBridge, true);
  assert.equal(voiceVisemeBridge.voiceStatus.visemeEngineReady, true);
  pass('HalDo Voice Core synchronisiert Provider-Viseme mit Audio.currentTime und setzt sie bei Pause zurück.');

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
  await lawyer.getByText('Test Mandant v183', { exact:true }).waitFor({ timeout:20000 });
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
  await page.evaluate(() => {
    window.__haldoV183ExportCapture = null;
    const nativeClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download === 'haldo-logo-entwurf.svg') {
        window.__haldoV183ExportCapture = { href: this.href, filename: this.download };
        return;
      }
      return nativeClick.call(this);
    };
  });
  // The desktop shell's fixed bottom bar may overlap the app window in a short
  // headless viewport. This check targets the registered export handler itself;
  // dispatching the click event avoids testing unrelated shell hit-testing.
  const exportButton = brand.locator('[data-brand-export]');
  assert.equal(await exportButton.count(), 1, 'Der SVG-Export-Button fehlt oder ist doppelt.');
  await exportButton.dispatchEvent('click');
  const exported = await page.evaluate(() => window.__haldoV183ExportCapture);
  assert(exported, 'Der Export-Button hat keinen Download-Link ausgelöst.');
  assert.equal(exported.filename, 'haldo-logo-entwurf.svg');
  assert.ok(exported.href.startsWith('data:image/svg+xml;charset=utf-8,'));
  const svgPayload = decodeURIComponent(exported.href.split(',').slice(1).join(','));
  assert.ok(svgPayload.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.match(svgPayload, /viewBox="0 0 100 100"/);
  assert.match(svgPayload, /aria-label="Logo-Entwurf"/);
  pass('Logo-Studio erzeugt einen benannten Download-Link mit gültigem SVG-Inhalt.');

  assert.deepEqual(errors, [], 'Browser-Konsole oder Seite enthält Fehler: ' + errors.join(' | '));
  pass('Keine Browser- oder JavaScript-Konsolenfehler im Testszenario.');
  console.log('v183 professional appsuite: ' + checks.length + '/' + checks.length + ' checks passed.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
