import { baseBones } from './base-bones.js';
import { extendedBones } from './extended-bones.js';
import {
  PROFILE_SHAPES,
  PROCEDURAL_VERSION,
  createProceduralBone,
  isAnatomicalBone
} from './procedural.js';

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
        region: definition.region || '',
        side: definition.side || '',
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
