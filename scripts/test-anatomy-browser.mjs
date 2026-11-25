import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
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
    if (profile.id === 'adult_female' && (
      !infoText.includes('Der vollständige Chromium-Vergleich') ||
      !infoText.includes('identische lokale Vertex-Punktwolken') ||
      !infoText.includes('179/179 übereinstimmende Hierarchiepfade') ||
      !infoText.includes('120 von 179 Assets') ||
      !infoText.includes('Scherung') ||
      !infoText.includes('Dreiecks-Konnektivität/Topologie')
    )) {
      throw new Error('adult_female: vollständiger Geometrie- und Transformaudit samt Grenzen wird nicht angezeigt.');
    }
    if (profile.id === 'baby' && (
      !infoText.includes('178 Baby-GLB-Geometrie-Payloads sind byteidentisch') ||
      !infoText.includes('176 von 178 Assets haben das Root-Skalierungsverhältnis 0,62/0,62/0,62') ||
      !infoText.includes('gesonderte Sondertransforms') ||
      !infoText.includes('178/178 übereinstimmende Hierarchiepfade') ||
      !infoText.includes('Bei allen 178 Assets unterscheiden sich die lokalen Transform-Matrizen ausschließlich am Root-Node') ||
      !infoText.includes('Alle 75 geprüften Links-/Rechts-Paare') ||
      !infoText.includes('Laufzeitkorrektur des Unterkiefers') ||
      !infoText.includes('keine eigenständig modellierte oder altersgerechte Neugeborenen-Anatomie')
    )) {
      throw new Error('Baby-Profil: vollständiger Geometrie- und Transformaudit samt Laufzeit-Abgrenzung wird nicht angezeigt.');
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

    function closestVertexPairAcrossCompleteMeshes(a, b) {
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
        nearest_vertex_distance_mm: Math.sqrt(bestSquared) * 1000,
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
        joints[name] = closestVertexPairAcrossCompleteMeshes(models[a], models[b]);
      }
      report.push({
        profile: profileId,
        metric_note: 'Global minimum over all transformed mesh vertices; not joint-local and not a clinical joint-gap measurement.',
        vertex_counts: Object.fromEntries(Object.entries(models).map(([id, vertices]) => [id, vertices.length])),
        global_mesh_nearest_vertex_pairs: joints
      });
    }
    return report;
  });
  for (const diagnostic of jointDiagnostics) {
    console.log('GLOBAL-MESH-NEAREST-VERTEX-DIAGNOSTIC', JSON.stringify(diagnostic));
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

  // Neue, räumlich begrenzte Endbereichs-Diagnostik:
  // Diese Heuristik nutzt die vertikale Y-Achse des zusammengesetzten Modells,
  // ersetzt aber KEINE fachlich markierten Gelenkflächen oder anatomischen Landmarken.
  const regionalAuditData = await page.evaluate(async () => {
    const THREE = await import('three');
    const { loadBoneModel } = await import('./models/loader.js');
    const profileIds = ['adult_male', 'adult_female', 'baby'];
    const boneTypes = ['coxal', 'femur', 'patella', 'tibia', 'fibula', 'talus', 'calcaneus'];
    const END_BAND_FRACTION = 0.18;
    const LOCAL_ROI_RADIUS_MM = 70;
    const MIN_CANDIDATE_VERTEX_COUNT = 20;
    const report = [];
    const hipScaleSensitivityReport = [];

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

    function disposeModel(gltf) {
      if (!gltf?.scene) return;
      gltf.scene.traverse(node => {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) node.material.forEach(material => material?.dispose?.());
        else node.material?.dispose?.();
      });
    }

    function yRange(points) {
      if (!points.length) return null;
      let min = Infinity, max = -Infinity;
      for (const point of points) {
        min = Math.min(min, point[1]);
        max = Math.max(max, point[1]);
      }
      return { min_m: min, max_m: max, span_m: max - min };
    }

    function endBand(points, end, fraction) {
      const range = yRange(points);
      if (!range || range.span_m <= 0) return [];
      const width = range.span_m * fraction;
      const threshold = end === 'cranial'
        ? range.max_m - width
        : range.min_m + width;
      return points.filter(point => end === 'cranial'
        ? point[1] >= threshold
        : point[1] <= threshold);
    }

    function centroid(points) {
      if (!points.length) throw new Error('Leere Punktregion ohne Schwerpunkt.');
      const sum = [0, 0, 0];
      for (const point of points) {
        sum[0] += point[0]; sum[1] += point[1]; sum[2] += point[2];
      }
      return sum.map(value => value / points.length);
    }

    function withinRadius(points, center, radiusMm) {
      const radiusSquared = (radiusMm / 1000) ** 2;
      return points.filter(point => {
        const dx = point[0] - center[0];
        const dy = point[1] - center[1];
        const dz = point[2] - center[2];
        return dx * dx + dy * dy + dz * dz <= radiusSquared;
      });
    }

    function findAssetRootNode(scene, boneId) {
      let match = null;
      scene.traverse(node => {
        if (!match && node.name === boneId) match = node;
      });
      if (!match) throw new Error('GLB-Rootknoten nicht gefunden: ' + boneId);
      return match;
    }

    // Reine Was-wäre-wenn-Analyse: Die Overrides werden ausschließlich auf
    // temporäre Three.js-Kopien angewendet. Originale GLB-Szenen/Transforms
    // und die produktive Ladepipeline bleiben unberührt.
    function simulateHipScaleScenario(femurScene, coxalScene, side, scenario) {
      const femurClone = femurScene.clone(true);
      const coxalClone = coxalScene.clone(true);
      const femurRoot = findAssetRootNode(femurClone, side + '_femur');
      const coxalRoot = findAssetRootNode(coxalClone, side + '_coxal');
      const currentFemurScale = femurRoot.scale.toArray().slice(0, 3);
      const currentCoxalScale = coxalRoot.scale.toArray().slice(0, 3);

      if (scenario.femurScale) femurRoot.scale.set(...scenario.femurScale);
      if (scenario.coxalScale) coxalRoot.scale.set(...scenario.coxalScale);

      const femurPoints = collectWorldVertices(femurClone);
      const coxalPoints = collectWorldVertices(coxalClone);
      const femurBand = endBand(femurPoints, 'cranial', END_BAND_FRACTION);
      const center = centroid(femurBand);
      const coxalCandidates = withinRadius(coxalPoints, center, LOCAL_ROI_RADIUS_MM);
      const nearest = coxalCandidates.length
        ? nearestVertexPair(femurBand, coxalCandidates)
        : null;

      return {
        scenario_id: scenario.id,
        description: scenario.description,
        applied_femur_root_scale_xyz: femurRoot.scale.toArray().slice(0, 3),
        applied_coxal_root_scale_xyz: coxalRoot.scale.toArray().slice(0, 3),
        source_femur_root_scale_xyz: currentFemurScale,
        source_coxal_root_scale_xyz: currentCoxalScale,
        femur_end_band_vertex_count: femurBand.length,
        coxal_roi_radius_mm: LOCAL_ROI_RADIUS_MM,
        coxal_candidate_vertex_count: coxalCandidates.length,
        nearest_vertex_distance_mm: nearest
          ? Number(nearest.nearest_vertex_distance_mm.toFixed(3)) : null,
        point_a_world_m: nearest?.point_a_world_m ?? null,
        point_b_world_m: nearest?.point_b_world_m ?? null,
        diagnostic_only: true,
        no_source_assets_modified: true
      };
    }

    function nearestVertexPair(pointsA, pointsB) {
      if (!pointsA.length || !pointsB.length) {
        throw new Error('Leere Gelenk-Kandidatenregion: A=' + pointsA.length + ', B=' + pointsB.length);
      }
      let bestSquared = Infinity, bestA = null, bestB = null;
      for (const a of pointsA) {
        for (const b of pointsB) {
          const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
          const squared = dx * dx + dy * dy + dz * dz;
          if (squared < bestSquared) {
            bestSquared = squared; bestA = a; bestB = b;
          }
        }
      }
      return {
        nearest_vertex_distance_mm: Math.sqrt(bestSquared) * 1000,
        point_a_world_m: bestA,
        point_b_world_m: bestB
      };
    }

    for (const profileId of profileIds) {
      for (const side of ['left', 'right']) {
        const models = {};
        const modelScenes = {};
        const gltfs = [];
        try {
          for (const boneType of boneTypes) {
            const boneId = side + '_' + boneType;
            const gltf = await loadBoneModel(THREE, profileId, boneId);
            gltfs.push(gltf);
            models[boneType] = collectWorldVertices(gltf.scene);
            modelScenes[boneType] = gltf.scene;
          }

          const femurCranial = endBand(models.femur, 'cranial', END_BAND_FRACTION);
          const femurCaudal = endBand(models.femur, 'caudal', END_BAND_FRACTION);
          const tibiaCranial = endBand(models.tibia, 'cranial', END_BAND_FRACTION);
          const tibiaCaudal = endBand(models.tibia, 'caudal', END_BAND_FRACTION);
          const fibulaCaudal = endBand(models.fibula, 'caudal', END_BAND_FRACTION);
          const talusCranial = endBand(models.talus, 'cranial', END_BAND_FRACTION);
          const talusCaudal = endBand(models.talus, 'caudal', END_BAND_FRACTION);
          const calcaneusCranial = endBand(models.calcaneus, 'cranial', END_BAND_FRACTION);
          const femurProximalCenter = centroid(femurCranial);
          const femurDistalCenter = centroid(femurCaudal);

          // Vergleicht die unveränderten Profiltransforms mit drei rein
          // rechnerischen Harmonisierungsszenarien. Das Ergebnis ist keine
          // Empfehlung für eine Skalierung und wird nicht in die App geladen.
          const femurRoot = findAssetRootNode(modelScenes.femur, side + '_femur');
          const coxalRoot = findAssetRootNode(modelScenes.coxal, side + '_coxal');
          const sourceFemurScale = femurRoot.scale.toArray().slice(0, 3);
          const sourceCoxalScale = coxalRoot.scale.toArray().slice(0, 3);
          const hipScaleScenarios = [
            {
              id: 'source_profile_transforms',
              description: 'Originale GLB-Root-Transforms unverändert'
            },
            {
              id: 'both_roots_identity',
              description: 'Beide Root-Skalierungen hypothetisch auf [1,1,1]'
            },
            {
              id: 'both_roots_match_femur_scale',
              description: 'Becken- und Femur-Root hypothetisch mit Femur-Skalierung'
            },
            {
              id: 'both_roots_match_coxal_scale',
              description: 'Femur- und Becken-Root hypothetisch mit Becken-Skalierung'
            }
          ].map(scenario => ({
            ...scenario,
            femurScale: scenario.id === 'both_roots_identity' ? [1, 1, 1]
              : scenario.id === 'both_roots_match_coxal_scale' ? sourceCoxalScale : null,
            coxalScale: scenario.id === 'both_roots_identity' ? [1, 1, 1]
              : scenario.id === 'both_roots_match_femur_scale' ? sourceFemurScale : null
          }));
          for (const scenario of hipScaleScenarios) {
            hipScaleSensitivityReport.push({
              profile: profileId,
              side,
              source_femur_root_scale_xyz: sourceFemurScale,
              source_coxal_root_scale_xyz: sourceCoxalScale,
              ...simulateHipScaleScenario(modelScenes.femur, modelScenes.coxal, side, scenario)
            });
          }

          // Rein technische Radius-Sensitivitätsanalyse für die Hüft-ROI.
          // Sie zeigt, wie stark die Anzahl der Becken-Vertices von der
          // willkürlichen ROI-Radiuswahl abhängt. Sie identifiziert KEINE
          // Acetabulum- oder Femurkopf-Gelenkfläche und verändert keine Modelle.
          const hipRoiRadiusSweep = [40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250]
            .map(radiusMm => {
              const candidates = withinRadius(models.coxal, femurProximalCenter, radiusMm);
              if (!candidates.length) {
                return {
                  radius_mm: radiusMm,
                  coxal_candidate_vertex_count: 0,
                  coxal_candidate_percent: 0,
                  centroid_offset_from_femur_band_center_mm: null,
                  candidate_bounds_relative_to_femur_center_mm: null
                };
              }
              const candidateCenter = centroid(candidates);
              const bounds = [[Infinity, -Infinity], [Infinity, -Infinity], [Infinity, -Infinity]];
              for (const point of candidates) {
                for (let axis = 0; axis < 3; axis++) {
                  const offsetMm = (point[axis] - femurProximalCenter[axis]) * 1000;
                  bounds[axis][0] = Math.min(bounds[axis][0], offsetMm);
                  bounds[axis][1] = Math.max(bounds[axis][1], offsetMm);
                }
              }
              const nearest = nearestVertexPair(femurCranial, candidates);
              return {
                radius_mm: radiusMm,
                coxal_candidate_vertex_count: candidates.length,
                coxal_candidate_percent: Number((candidates.length / models.coxal.length * 100).toFixed(2)),
                nearest_vertex_distance_mm: Number(nearest.nearest_vertex_distance_mm.toFixed(3)),
                nearest_point_a_world_m: nearest.point_a_world_m,
                nearest_point_b_world_m: nearest.point_b_world_m,
                centroid_offset_from_femur_band_center_mm: candidateCenter.map((value, axis) =>
                  Number(((value - femurProximalCenter[axis]) * 1000).toFixed(2))
                ),
                candidate_bounds_relative_to_femur_center_mm: bounds.map(axisBounds =>
                  axisBounds.map(value => Number(value.toFixed(2)))
                )
              };
            });

          const joints = [
            {
              joint_id: 'hip',
              bone_a: side + '_femur',
              bone_b: side + '_coxal',
              region_a: femurCranial,
              region_b: withinRadius(models.coxal, femurProximalCenter, LOCAL_ROI_RADIUS_MM),
              hip_roi_radius_sweep: hipRoiRadiusSweep,
              roi_definition: 'Femur: craniales 18%-Y-Endband; Becken: 70-mm-Umgebungsradius um den Schwerpunkt des Femur-Endbands.',
              local_roi_radius_mm: LOCAL_ROI_RADIUS_MM
            },
            {
              joint_id: 'knee_femur_tibia',
              bone_a: side + '_femur',
              bone_b: side + '_tibia',
              region_a: femurCaudal,
              region_b: tibiaCranial,
              roi_definition: 'Femur: kaudales 18%-Y-Endband; Tibia: craniales 18%-Y-Endband.'
            },
            {
              joint_id: 'knee_femur_patella',
              bone_a: side + '_femur',
              bone_b: side + '_patella',
              region_a: femurCaudal,
              region_b: withinRadius(models.patella, femurDistalCenter, LOCAL_ROI_RADIUS_MM),
              roi_definition: 'Femur: kaudales 18%-Y-Endband; Patella: 70-mm-Umgebungsradius um den Schwerpunkt des distalen Femur-Endbands.',
              local_roi_radius_mm: LOCAL_ROI_RADIUS_MM
            },
            {
              joint_id: 'ankle_tibia_talus',
              bone_a: side + '_tibia',
              bone_b: side + '_talus',
              region_a: tibiaCaudal,
              region_b: talusCranial,
              roi_definition: 'Tibia: kaudales 18%-Y-Endband; Talus: craniales 18%-Y-Endband.'
            },
            {
              joint_id: 'ankle_fibula_talus',
              bone_a: side + '_fibula',
              bone_b: side + '_talus',
              region_a: fibulaCaudal,
              region_b: talusCranial,
              roi_definition: 'Fibula: kaudales 18%-Y-Endband; Talus: craniales 18%-Y-Endband.'
            },
            {
              joint_id: 'hindfoot_talus_calcaneus',
              bone_a: side + '_talus',
              bone_b: side + '_calcaneus',
              region_a: talusCaudal,
              region_b: calcaneusCranial,
              roi_definition: 'Talus: kaudales 18%-Y-Endband; Calcaneus: craniales 18%-Y-Endband.'
            }
          ];

          for (const joint of joints) {
            const measured = nearestVertexPair(joint.region_a, joint.region_b);
            report.push({
              profile: profileId,
              side,
              joint_id: joint.joint_id,
              bone_a: joint.bone_a,
              bone_b: joint.bone_b,
              method: 'Regionaler Vertex-zu-Vertex-Endbereichsvergleich in Weltkoordinaten nach GLB-Transforms.',
              roi_definition: joint.roi_definition,
              end_band_fraction: END_BAND_FRACTION,
              local_roi_radius_mm: joint.local_roi_radius_mm ?? null,
              candidate_set_status: Math.min(joint.region_a.length, joint.region_b.length) < MIN_CANDIDATE_VERTEX_COUNT
                ? 'sparse_candidate_set' : 'sampled_candidate_set',
              candidate_vertex_count_a: joint.region_a.length,
              candidate_vertex_count_b: joint.region_b.length,
              hip_roi_radius_sweep: joint.hip_roi_radius_sweep ?? null,
              full_mesh_vertex_count_a: models[joint.bone_a.slice(side.length + 1)].length,
              full_mesh_vertex_count_b: models[joint.bone_b.slice(side.length + 1)].length,
              metric_note: 'Nicht klinisch: keine segmentierten Gelenkflächen, keine Dreiecks-Oberflächenabstände, keine Knorpelmodelle und keine validierten anatomischen Landmarken. Nur reproduzierbare regionale Nähe von Mesh-Vertices.',
              ...measured
            });
          }
        } finally {
          gltfs.forEach(disposeModel);
        }
      }
    }
    return {
      regionalJointDiagnostics: report,
      hipScaleSensitivityReport
    };
  });

  const regionalJointDiagnostics = regionalAuditData.regionalJointDiagnostics;
  const hipScaleSensitivityReport = regionalAuditData.hipScaleSensitivityReport;
  if (!Array.isArray(regionalJointDiagnostics) || !Array.isArray(hipScaleSensitivityReport)) {
    throw new Error('Der Browser-Audit hat keine gültigen regionalen bzw. Hip-Scale-Ergebnisse zurückgegeben.');
  }

  if (regionalJointDiagnostics.length !== 36) {
    throw new Error('Regionaler Gelenk-Endbereichsaudit unvollständig: erwartet 36 Seiten-/Profil-Messungen, gefunden ' + regionalJointDiagnostics.length);
  }
  for (const diagnostic of regionalJointDiagnostics) {
    if (!Number.isFinite(diagnostic.nearest_vertex_distance_mm) ||
        diagnostic.nearest_vertex_distance_mm < 0 ||
        diagnostic.candidate_vertex_count_a < 1 ||
        diagnostic.candidate_vertex_count_b < 1 ||
        !['sparse_candidate_set', 'sampled_candidate_set'].includes(diagnostic.candidate_set_status) ||
        (Math.min(diagnostic.candidate_vertex_count_a, diagnostic.candidate_vertex_count_b) < 20) !== (diagnostic.candidate_set_status === 'sparse_candidate_set')) {
      throw new Error('Ungültige regionale Gelenkdiagnostik: ' + JSON.stringify(diagnostic));
    }
    console.log('REGIONAL-JOINT-ENDPOINT-DIAGNOSTIC', JSON.stringify(diagnostic));
  }
  const regionalJointAudit = {
    schema_version: 1,
    generated_by: 'scripts/test-anatomy-browser.mjs',
    profiles: ['adult_male', 'adult_female', 'baby'],
    sides: ['left', 'right'],
    joint_regions_per_side: 6,
    measurement_count: regionalJointDiagnostics.length,
    local_roi_radius_mm_for_hip_and_patella_mm: 70,
    minimum_candidate_vertex_count_for_sampling_flag: 20,
    method: 'Reproduzierbare 18%-Endbänder entlang der globalen Modell-Y-Achse sowie lokal begrenzte 70-mm-Umgebungsradien ausschließlich für Becken- und Patella-ROI; nächstes Paar aus dekodierten Welt-Vertices.',
    sampling_note: 'Weniger als 20 Kandidaten-Vertices auf einer Seite werden als sparse_candidate_set markiert. Das ist eine technische Stichprobenwarnung, keine anatomische Bewertung.',
    limitations: [
      'Nicht klinisch oder anatomisch validiert.',
      'Keine fachlich markierten Gelenkflächen oder anatomischen Landmarken.',
      'Keine Dreiecks-Oberflächenabstände; es werden Mesh-Vertices verglichen.',
      'Keine Knorpelschicht und kein physiologischer Gelenkspalt modelliert.',
      'Die Y-Endband-Heuristik ist eine technische Kandidatenregion und kann fachlich relevante Gelenkflächen verfehlen.',
      'Es werden keine GLB-Dateien, Vertices oder Modell-Transforms verändert.'
    ],
    measurements: regionalJointDiagnostics
  };
  await writeFile(
    'artifacts/anatomy/regional-joint-endpoint-audit.json',
    JSON.stringify(regionalJointAudit, null, 2) + '\n',
    'utf8'
  );
  console.log('REGIONAL-JOINT-ENDPOINT-AUDIT-SUMMARY', JSON.stringify({
    measurement_count: regionalJointAudit.measurement_count,
    profiles: regionalJointAudit.profiles.length,
    sides: regionalJointAudit.sides.length,
    joint_regions_per_side: regionalJointAudit.joint_regions_per_side,
    sparse_candidate_region_count: regionalJointDiagnostics.filter(item => item.candidate_set_status === 'sparse_candidate_set').length,
    sparse_candidate_regions: regionalJointDiagnostics.filter(item => item.candidate_set_status === 'sparse_candidate_set').map(item => ({
      profile: item.profile, side: item.side, joint_id: item.joint_id,
      candidate_vertex_count_a: item.candidate_vertex_count_a,
      candidate_vertex_count_b: item.candidate_vertex_count_b
    })),
    min_candidate_distance_mm: Math.min(...regionalJointDiagnostics.map(item => item.nearest_vertex_distance_mm)),
    max_candidate_distance_mm: Math.max(...regionalJointDiagnostics.map(item => item.nearest_vertex_distance_mm))
  }));
  console.log('REGIONAL-JOINT-ENDPOINT-AUDIT-FILE: artifacts/anatomy/regional-joint-endpoint-audit.json');

  if (hipScaleSensitivityReport.length !== 24) {
    throw new Error('Hüft-Root-Scale-Sensitivity unvollständig: erwartet 24 Szenarien, gefunden ' + hipScaleSensitivityReport.length);
  }
  const hipScaleSensitivityAudit = {
    schema_version: 1,
    generated_by: 'scripts/test-anatomy-browser.mjs',
    profiles: ['adult_male', 'adult_female', 'baby'],
    sides: ['left', 'right'],
    scenarios_per_side: 4,
    measurement_count: hipScaleSensitivityReport.length,
    roi_radius_mm: 70,
    scenario_note: 'Was-wäre-wenn-Analyse auf temporären Three.js-Kopien. Root-Skalierungen werden ausschließlich im Arbeitsspeicher verändert; keine gespeicherte GLB-Datei oder produktive Szene wird verändert.',
    interpretation_limits: [
      'Die Szenarien sind keine anatomisch validierten Ziel-Transforms und keine Korrekturempfehlung.',
      'Die ROI wird heuristisch über ein Femur-Y-Endband und einen 70-mm-Radius am Becken definiert.',
      'Es werden Mesh-Vertices statt segmentierter Gelenkflächen verglichen.',
      'Eine Verringerung des Vertex-Abstands beweist keine korrekte Gelenkposition oder klinische Eignung.',
      'Root-Skalierung um den glTF-Node-Ursprung kann andere Körperbereiche verschieben und Proportionen verändern.'
    ],
    measurements: hipScaleSensitivityReport
  };
  const sourceHipDiagnostics = regionalJointDiagnostics.filter(item => item.joint_id === 'hip');
  for (const item of hipScaleSensitivityAudit.measurements) {
    if (!Number.isFinite(item.applied_femur_root_scale_xyz[0]) ||
        !Number.isFinite(item.applied_coxal_root_scale_xyz[0]) ||
        item.femur_end_band_vertex_count < 1 ||
        item.coxal_candidate_vertex_count < 0 ||
        (item.coxal_candidate_vertex_count > 0) !== Number.isFinite(item.nearest_vertex_distance_mm)) {
      throw new Error('Ungültiges Hüft-Root-Scale-Szenario: ' + JSON.stringify(item));
    }
    if (item.scenario_id === 'source_profile_transforms') {
      const source = sourceHipDiagnostics.find(d => d.profile === item.profile && d.side === item.side);
      if (!source ||
          Math.abs(source.candidate_vertex_count_b - item.coxal_candidate_vertex_count) > 0 ||
          (source.nearest_vertex_distance_mm === null) ||
          Math.abs(source.nearest_vertex_distance_mm - item.nearest_vertex_distance_mm) > 0.02) {
        throw new Error('Original-Transform-Szenario stimmt nicht mit der regionalen Hüftdiagnostik überein: ' + JSON.stringify({ source, item }));
      }
    }
  }
  await writeFile(
    'artifacts/anatomy/hip-root-scale-sensitivity-audit.json',
    JSON.stringify(hipScaleSensitivityAudit, null, 2) + '\n',
    'utf8'
  );
  console.log('HIP-ROOT-SCALE-SENSITIVITY-SUMMARY', JSON.stringify({
    measurement_count: hipScaleSensitivityAudit.measurement_count,
    profiles: hipScaleSensitivityAudit.profiles.length,
    sides: hipScaleSensitivityAudit.sides.length,
    scenario_ids: ['source_profile_transforms', 'both_roots_identity', 'both_roots_match_femur_scale', 'both_roots_match_coxal_scale']
  }));

  // Vergleicht ALLE weiblichen GLB-Mesh-Vertex-Punktwolken mit dem männlichen
  // Ausgangsbestand nach echtem Draco-Decoding. Root-/Node-Transforms und
  // Dreiecks-Konnektivität werden bewusst nicht in diesen lokalen Geometrievergleich eingerechnet.
  const maleFemaleGeometryAudit = await page.evaluate(async () => {
    const THREE = await import('three');
    const { loadBoneModel } = await import('./models/loader.js');
    const response = await fetch('./models/manifest.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Manifest für vollständigen Mesh-Audit konnte nicht geladen werden.');
    const manifest = await response.json();
    const maleIds = manifest?.profiles?.adult_male?.asset_ids || [];
    const femaleIds = manifest?.profiles?.adult_female?.asset_ids || [];
    if (maleIds.length !== 179 || femaleIds.length !== 179 ||
        maleIds.some(id => !femaleIds.includes(id)) ||
        femaleIds.some(id => !maleIds.includes(id))) {
      throw new Error('Männlicher und weiblicher Manifestbestand müssen dieselben 179 Bone-IDs enthalten.');
    }

    function sortedLocalVertexKeys(root) {
      const keys = [];
      root.traverse(node => {
        const position = node.isMesh ? node.geometry?.getAttribute('position') : null;
        if (!position) return;
        for (let i = 0; i < position.count; i++) {
          const x = Math.round(position.getX(i) * 1e6);
          const y = Math.round(position.getY(i) * 1e6);
          const z = Math.round(position.getZ(i) * 1e6);
          keys.push(x + ',' + y + ',' + z);
        }
      });
      keys.sort();
      return keys;
    }

    function disposeModel(gltf) {
      if (!gltf?.scene) return;
      gltf.scene.traverse(node => {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) node.material.forEach(material => material?.dispose?.());
        else node.material?.dispose?.();
      });
    }

    const results = new Array(femaleIds.length);
    const failures = [];
    let cursor = 0;
    const worker = async () => {
      while (cursor < femaleIds.length) {
        const index = cursor++;
        const boneId = femaleIds[index];
        let male = null;
        let female = null;
        try {
          [male, female] = await Promise.all([
            loadBoneModel(THREE, 'adult_male', boneId),
            loadBoneModel(THREE, 'adult_female', boneId)
          ]);
          const maleKeys = sortedLocalVertexKeys(male.scene);
          const femaleKeys = sortedLocalVertexKeys(female.scene);
          let same = maleKeys.length > 0 && maleKeys.length === femaleKeys.length;
          if (same) {
            for (let i = 0; i < maleKeys.length; i++) {
              if (maleKeys[i] !== femaleKeys[i]) {
                same = false;
                break;
              }
            }
          }
          results[index] = {
            bone_id: boneId,
            male_vertices: maleKeys.length,
            female_vertices: femaleKeys.length,
            same_local_vertex_set_within_0_001_mm: same
          };
        } catch (error) {
          failures.push({ bone_id: boneId, message: error?.message || String(error) });
        } finally {
          disposeModel(male);
          disposeModel(female);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, femaleIds.length) }, worker));
    if (failures.length) {
      throw new Error('Vollständiger Männer/Frauen-Mesh-Audit unvollständig: ' + JSON.stringify(failures));
    }
    const mismatches = results.filter(result => !result.same_local_vertex_set_within_0_001_mm);
    return {
      total_pairs: results.length,
      completed_pairs: results.filter(Boolean).length,
      identical_vertex_point_clouds: results.length - mismatches.length,
      different_vertex_point_clouds: mismatches.length,
      mismatch_details: mismatches,
      tolerance_m: 0.000001,
      note: 'Vergleicht sortierte lokale Vertex-Punktwolken nach Decoder; Node-Transforms, Normalen, Materialien und Dreiecks-Konnektivität werden nicht verglichen.'
    };
  });
  console.log('MALE-FEMALE-FULL-GEOMETRY-AUDIT', JSON.stringify(maleFemaleGeometryAudit));
  if (maleFemaleGeometryAudit.completed_pairs !== 179) {
    throw new Error('Nicht alle 179 weiblichen Assets wurden gegen den männlichen Bestand geprüft.');
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

  // Prüft den echten Benutzerweg: App-Registry öffnen, nach der
  // Anatomie-App suchen und genau deren sichtbare Startkarte anklicken.
  await launcherPage.evaluate(() => window.HalDo.AppBrowser.open());
  const registrySearch = launcherPage.locator('input[data-registry-search]');
  await registrySearch.waitFor({ state: 'visible', timeout: 15000 });
  await registrySearch.fill('Anatomie 3D Pro Max');
  const anatomyLaunchCard = launcherPage.locator('button[data-launch="anatomie-3d"]');
  await anatomyLaunchCard.waitFor({ state: 'visible', timeout: 10000 });
  const launchCardText = await anatomyLaunchCard.textContent();
  if (!launchCardText?.includes('Anatomie 3D Pro Max')) {
    throw new Error('Die Anatomie-App wird in der sichtbaren App-Registry-Suche nicht korrekt angezeigt.');
  }
  await anatomyLaunchCard.click();

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
  await launcherPage.waitForFunction(() => {
    const overlay = document.getElementById('haldo-v161-welcome');
    return !overlay || (overlay.classList.contains('h161-leaving') &&
      getComputedStyle(overlay).pointerEvents === 'none');
  }, null, { timeout: 5000 });
  await launcherPage.waitForTimeout(550);

  const launcherDiagnostics = await launcherPage.evaluate(() => ({
    anatomyModule: typeof window.HalDo?.Anatomy3DProMax?.open,
    legacyAnatomyModulePreserved: typeof window.HalDo?.Anatomy3D?.open,
    registeredId: window.HalDo?.Registry?.getFeatured?.().find(app => app.id === 'anatomie-3d')?.id || null,
    dispatcherHasRoute: !!window.HalDo?.SystemV157?.routes?.().includes('anatomie-3d'),
    routeListHasAnatomy: window.HalDo?.SystemV157?.routes?.().filter(id => /anatom/i.test(id)) || [],
    finalLaunch: String(window.HalDo?.Launch || '').slice(0, 500),
    windows: Array.from(document.querySelectorAll('#winLayer .window, #winLayer .win-pro')).map(el => ({
      title: el.querySelector('.win-title, .win-title-pro')?.textContent || '',
      bodyText: (el.querySelector('.win-body, .win-body-pro')?.textContent || '').slice(0, 250),
      frames: el.querySelectorAll('iframe').length
    })),
    notifications: Array.from(document.querySelectorAll('#toasts, .toast, [role="alert"]')).map(el => (el.textContent || '').slice(0, 200)),
    remainingWelcome: !!document.querySelector('#haldo-v161-welcome')
  }));
  console.log('HALDO-LAUNCH-DIAGNOSTIC', JSON.stringify(launcherDiagnostics));
  if (launcherDiagnostics.anatomyModule !== 'function') {
    throw new Error('Der zentrale HalDo Anatomy3D-Launcher wurde nicht registriert.');
  }

  const anatomyFrameElement = launcherPage.locator('iframe[title="HalDo Anatomie 3D Pro Max"]');
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
