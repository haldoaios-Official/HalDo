import { baseBones } from './base-bones.js';
import { extendedBones } from './extended-bones.js';
import {
  PROFILE_SHAPES,
  PROCEDURAL_VERSION,
  createProceduralBone,
  isAnatomicalBone
} from './procedural.js';

const GERMAN_FIXED_NAMES = Object.freeze({
  skull: 'Schädel',
  mandible: 'Unterkiefer',
  c1_atlas: 'Atlas (1. Halswirbel)',
  sternum: 'Brustbein',
  sacrum: 'Kreuzbein',
  coccyx: 'Steißbein'
});

const GERMAN_PAIRED_NAMES = Object.freeze({
  clavicle: 'Schlüsselbein',
  humerus: 'Oberarmknochen',
  femur: 'Oberschenkelknochen',
  tibia: 'Schienbein',
  coxal: 'Hüftbein',
  scapula: 'Schulterblatt',
  radius: 'Speiche',
  ulna: 'Elle',
  patella: 'Kniescheibe',
  fibula: 'Wadenbein'
});

const GERMAN_CARPAL_NAMES = Object.freeze({
  scaphoid: 'Kahnbein',
  lunate: 'Mondbein',
  triquetrum: 'Dreiecksbein',
  pisiform: 'Erbsenbein',
  trapezium: 'Großes Vieleckbein',
  trapezoid: 'Kleines Vieleckbein',
  capitate: 'Kopfbein',
  hamate: 'Hakenbein'
});

const GERMAN_TARSAL_NAMES = Object.freeze({
  talus: 'Sprungbein',
  calcaneus: 'Fersenbein',
  navicular: 'Kahnbein des Fußes',
  medial_cuneiform: 'Mediales Keilbein',
  intermediate_cuneiform: 'Mittleres Keilbein',
  lateral_cuneiform: 'Laterales Keilbein',
  cuboid: 'Würfelbein'
});

const GERMAN_FINGER_NAMES = Object.freeze({
  1: 'Daumen',
  2: 'Zeigefinger',
  3: 'Mittelfinger',
  4: 'Ringfinger',
  5: 'Kleiner Finger'
});

const GERMAN_TOE_NAMES = Object.freeze({
  1: 'Großzehe',
  2: 'Zweite Zehe',
  3: 'Dritte Zehe',
  4: 'Vierte Zehe',
  5: 'Kleine Zehe'
});

const GERMAN_REGION_NAMES = Object.freeze({
  'Cráneo': 'Schädel',
  'Columna': 'Wirbelsäule',
  'Tórax': 'Brustkorb',
  'Cintura escapular': 'Schultergürtel',
  Pelvis: 'Becken',
  'Extremidad superior': 'Obere Extremität',
  Manos: 'Hände',
  'Extremidad inferior': 'Untere Extremität',
  Pies: 'Füße'
});

function germanSide(id) {
  if (id.startsWith('left_')) return 'Links';
  if (id.startsWith('right_')) return 'Rechts';
  return '';
}

function germanBoneName(id) {
  if (GERMAN_FIXED_NAMES[id]) return GERMAN_FIXED_NAMES[id];

  let match = id.match(/^c([2-7])$/);
  if (match) return match[1] + '. Halswirbel';
  match = id.match(/^t(\d+)$/);
  if (match) return match[1] + '. Brustwirbel';
  match = id.match(/^l(\d+)$/);
  if (match) return match[1] + '. Lendenwirbel';

  match = id.match(/^(left|right)_rib_(\d+)$/);
  if (match) return match[2] + '. Rippe ' + (match[1] === 'left' ? 'links' : 'rechts');

  const side = germanSide(id);
  const prefix = id.replace(/^(left|right)_/, '');
  if (GERMAN_PAIRED_NAMES[prefix]) {
    return GERMAN_PAIRED_NAMES[prefix] + (side ? ' ' + side.toLowerCase() : '');
  }

  if (GERMAN_CARPAL_NAMES[prefix]) {
    return GERMAN_CARPAL_NAMES[prefix] + (side ? ' ' + side.toLowerCase() : '');
  }
  if (GERMAN_TARSAL_NAMES[prefix]) {
    return GERMAN_TARSAL_NAMES[prefix] + (side ? ' ' + side.toLowerCase() : '');
  }

  match = prefix.match(/^metacarpal_(\d+)$/);
  if (match) return match[1] + '. Mittelhandknochen ' + side.toLowerCase();
  match = prefix.match(/^metatarsal_(\d+)$/);
  if (match) return match[1] + '. Mittelfußknochen ' + side.toLowerCase();

  match = prefix.match(/^digit_(\d+)_(proximal|middle|distal)$/);
  if (match) {
    const finger = GERMAN_FINGER_NAMES[match[1]];
    const part = { proximal: 'Grundglied', middle: 'Mittelglied', distal: 'Endglied' }[match[2]];
    return part + ' des ' + finger + 's ' + side.toLowerCase();
  }

  match = prefix.match(/^toe_(\d+)_(proximal|middle|distal)$/);
  if (match) {
    const toe = GERMAN_TOE_NAMES[match[1]];
    const part = { proximal: 'Grundglied', middle: 'Mittelglied', distal: 'Endglied' }[match[2]];
    return part + ' der ' + toe + ' ' + side.toLowerCase();
  }

  return '';
}

function germanRegionName(region) {
  return GERMAN_REGION_NAMES[region] || '';
}

export function getSchematicBoneDefinitions() {
  const seen = new Set();
  const definitions = [];

  [...baseBones, ...extendedBones].forEach((bone) => {
    if (!isAnatomicalBone(bone)) return;
    if (seen.has(bone.id)) {
      throw new Error(`Duplicate anatomical bone ID: ${bone.id}`);
    }
    seen.add(bone.id);
    definitions.push({
      ...bone,
      de: germanBoneName(bone.id),
      regionDe: germanRegionName(bone.region),
      sideDe: germanSide(bone.id),
      p: Array.isArray(bone.p) ? [...bone.p] : [0, 0, 0],
      e: Array.isArray(bone.e) ? [...bone.e] : [0, 0, 0],
      size: Array.isArray(bone.size) ? [...bone.size] : [1, 1, 1]
    });
  });

  return definitions;
}

export function createSchematicSkeleton(THREE, profileId = 'adult_male', options = {}) {
  if (!THREE || typeof THREE.Group !== 'function' || typeof THREE.MeshStandardMaterial !== 'function') {
    throw new Error('A compatible Three.js runtime is required to build the schematic skeleton.');
  }
  if (!Object.prototype.hasOwnProperty.call(PROFILE_SHAPES, profileId)) {
    throw new Error(`Unsupported schematic anatomy profile: ${profileId}`);
  }

  const definitions = getSchematicBoneDefinitions();
  const group = new THREE.Group();
  group.name = `HalDo-Schematic-Skeleton-${profileId}`;
  group.userData = {
    modelSource: 'procedural',
    schematic: true,
    profileId,
    version: PROCEDURAL_VERSION,
    units: 'arbitrary',
    clinicalUse: false,
    boneCount: definitions.length
  };

  const bones = [];
  const byId = new Map();

  try {
    definitions.forEach((definition) => {
      const object = createProceduralBone(
        THREE,
        definition,
        profileId,
        options.color == null ? 0xc4ad8b : options.color
      );
      object.userData = {
        ...(object.userData || {}),
        boneId: definition.id,
        name_de: definition.de || '',
        name_en: definition.en || '',
        name_la: definition.la || '',
        region: definition.region || '',
        region_de: definition.regionDe || '',
        side: definition.side || '',
        side_de: definition.sideDe || '',
        profileId,
        schematic: true,
        modelSource: 'procedural',
        units: 'arbitrary'
      };
      group.add(object);
      const entry = { id: definition.id, definition, object };
      bones.push(entry);
      byId.set(definition.id, entry);
    });
  } catch (error) {
    disposeSchematicSkeleton(group);
    throw error;
  }

  return {
    group,
    bones,
    byId,
    profileId,
    version: PROCEDURAL_VERSION,
    schematic: true,
    units: 'arbitrary'
  };
}

export function disposeSchematicSkeleton(skeletonOrGroup) {
  const group = skeletonOrGroup && skeletonOrGroup.group
    ? skeletonOrGroup.group
    : skeletonOrGroup;
  if (!group || typeof group.traverse !== 'function') return;

  const geometries = new Set();
  const materials = new Set();

  group.traverse((object) => {
    if (!object.isMesh) return;
    if (object.geometry) geometries.add(object.geometry);
    const assigned = Array.isArray(object.material) ? object.material : [object.material];
    assigned.forEach((material) => {
      if (material) materials.add(material);
    });
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    Object.keys(material).forEach((key) => {
      const value = material[key];
      if (value && value.isTexture && typeof value.dispose === 'function') value.dispose();
    });
    material.dispose();
  });

  if (group.parent) group.parent.remove(group);
}
