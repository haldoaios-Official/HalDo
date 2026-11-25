import { validateModelManifest, validateModelSourceRegistry } from './package.js';
import { modelPath } from './catalog.js';

export async function loadModelManifest(url = './models/manifest.json') {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Das Modellmanifest konnte nicht geladen werden (${response.status}).`);
  const manifest = await response.json();
  const validation = validateModelManifest(manifest);
  if (!validation.valid) throw new Error(`Ungültiges Modellmanifest: ${validation.errors.join('; ')}`);
  return manifest;
}

export async function loadModelSourceRegistry(manifest, url = './models/sources.json') {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Das Quellenregister konnte nicht geladen werden (${response.status}).`);
  const registry = await response.json();
  const validation = validateModelSourceRegistry(manifest, registry);
  if (!validation.valid) throw new Error(`Ungültiges Quellenregister: ${validation.errors.join('; ')}`);
  return registry;
}

const sharedLoaders = new Map();
async function createSharedLoader(options) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const loader = new GLTFLoader(options.manager);
  const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');
  loader.setMeshoptDecoder(MeshoptDecoder);
  // Der männliche Originalbestand verwendet KHR_draco_mesh_compression.
  // Daher muss der Draco-Decoder auch ohne explizite Aufruferoption gesetzt sein.
  const dracoDecoderPath = options.dracoDecoderPath || 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/';
  const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
  const draco = new DRACOLoader(options.manager);
  draco.setDecoderPath(dracoDecoderPath);
  draco.setWorkerLimit(2);
  loader.setDRACOLoader(draco);
  return loader;
}

export async function loadBoneModel(THREE, profileId, boneId, options = {}) {
  const key = options.manager || options.dracoDecoderPath || 'default';
  if (!sharedLoaders.has(key)) {
    sharedLoaders.set(key, createSharedLoader(options).catch(error => { sharedLoaders.delete(key); throw error; }));
  }
  const loader = await sharedLoaders.get(key);
  const url = options.url || modelPath(profileId, boneId);
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

// Lädt ein Profil begrenzt parallel und erhält die originalen GLB-Transforms.
// Es wird ausdrücklich nichts einzeln zentriert oder skaliert.
export async function loadProfileModels(THREE, manifest, profileId, options = {}) {
  const profile = manifest?.profiles?.[profileId];
  if (!profile || !Array.isArray(profile.asset_ids) || profile.asset_ids.length === 0) {
    throw new Error(`Für das Profil ${profileId} sind keine GLB-Dateien im Manifest eingetragen.`);
  }
  const ids = profile.asset_ids;
  const scenes = new Array(ids.length);
  const scenesByBoneId = new Map();
  const failures = [];
  let cursor = 0;
  let completed = 0;
  const concurrency = Math.max(1, Math.min(6, Number(options.concurrency) || 3));
  const worker = async () => {
    while (cursor < ids.length) {
      const index = cursor++;
      const boneId = ids[index];
      try {
        const gltf = await loadBoneModel(THREE, profileId, boneId, options);
        const root = gltf.scene;
        root.userData = { ...root.userData, profileId, boneId };
        root.traverse(node => {
          if (!node.isMesh) return;
          node.userData = { ...node.userData, profileId, boneId, type: node.userData?.type || 'bone', name: node.userData?.name || boneId };
          node.castShadow = true;
          node.receiveShadow = true;
        });
        scenes[index] = root;
        scenesByBoneId.set(boneId, root);
      } catch (error) {
        failures.push({ boneId, message: error?.message || String(error) });
      }
      completed += 1;
      options.onProgress?.({ completed, loaded: scenes.filter(Boolean).length, failed: failures.length, total: ids.length, boneId });
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));

  // The source skull GLB is exported around its own local origin near y=0,
  // while the cervical vertebrae retain the assembled skeleton coordinates.
  // Align only this known outlier to C1 (or C2 for the baby set); do not
  // recenter or rescale the individual bones.
  const alignmentAdjustments = [];
  const skullRoot = scenesByBoneId.get('skull');

  // One baby mandible export is missing the shared 0.62 age-profile scale
  // used by the other baby bones. Apply it at the GLTF scene root so its
  // existing Blender proportions remain intact.
  const mandibleRoot = scenesByBoneId.get('mandible');
  if (profileId === 'baby' && mandibleRoot) {
    mandibleRoot.scale.multiplyScalar(0.62);
    mandibleRoot.updateMatrixWorld(true);
    alignmentAdjustments.push({ boneId: 'mandible', axis: 'scale', factor: 0.62 });
  }
  const anchorId = scenesByBoneId.has('c1_atlas') ? 'c1_atlas' : 'c2';
  const anchorRoot = scenesByBoneId.get(anchorId);
  if (skullRoot && anchorRoot) {
    const skullBounds = new THREE.Box3().setFromObject(skullRoot);
    const anchorBounds = new THREE.Box3().setFromObject(anchorRoot);
    if (!skullBounds.isEmpty() && !anchorBounds.isEmpty()) {
      const offsetY = anchorBounds.max.y - skullBounds.min.y - 0.015;
      if (Number.isFinite(offsetY) && Math.abs(offsetY) < 2.5) {
        skullRoot.position.y += offsetY;
        skullRoot.updateMatrixWorld(true);
        alignmentAdjustments.push({ boneId: 'skull', anchorId, axis: 'y', offset: offsetY });
      }
    }
  }

  const group = new THREE.Group();
  scenes.filter(Boolean).forEach(root => group.add(root));
  const loaded = scenes.filter(Boolean).length;
  if (!loaded) throw new Error(`Kein einziges GLB-Modell aus ${profileId} konnte geladen werden.`);
  return { group, loaded, failed: failures.length, failures, total: ids.length, profileId, alignmentAdjustments };
}
