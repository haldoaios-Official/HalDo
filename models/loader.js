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
      } catch (error) {
        failures.push({ boneId, message: error?.message || String(error) });
      }
      completed += 1;
      options.onProgress?.({ completed, loaded: scenes.filter(Boolean).length, failed: failures.length, total: ids.length, boneId });
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
  const group = new THREE.Group();
  scenes.filter(Boolean).forEach(root => group.add(root));
  const loaded = scenes.filter(Boolean).length;
  if (!loaded) throw new Error(`Kein einziges GLB-Modell aus ${profileId} konnte geladen werden.`);
  return { group, loaded, failed: failures.length, failures, total: ids.length, profileId };
}
