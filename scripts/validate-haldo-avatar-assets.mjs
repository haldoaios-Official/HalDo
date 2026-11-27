#!/usr/bin/env node
/**
 * HalDo Human3D: local GLB intake validator.
 * Does not download assets. It validates only files already stored in the repository.
 *
 * Usage:
 *   node scripts/validate-haldo-avatar-assets.mjs
 *   node scripts/validate-haldo-avatar-assets.mjs --strict
 *   node scripts/validate-haldo-avatar-assets.mjs --self-test
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DEFAULT_DIR = path.join(ROOT, 'assets', 'avatars');
const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const EXPECTED = Object.freeze([
  { key: 'human', file: 'haldo-human.glb', label: 'HalDo Human' },
  { key: 'cyborg', file: 'haldo-cyborg.glb', label: 'HalDo Cyborg' },
  { key: 'android', file: 'haldo-android.glb', label: 'HalDo Android' },
  { key: 'robot', file: 'haldo-robot.glb', label: 'HalDo Robot' }
]);

function fail(message) {
  throw new Error(message);
}

function toBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  fail('Eingabe muss ein Buffer oder Uint8Array sein.');
}

/**
 * Validates GLB container framing and essential glTF structures. This does not
 * replace visual QA in a 3D viewer or a full Khronos glTF Validator run.
 */
export function inspectGlb(input, options = {}) {
  const requireMesh = options.requireMesh !== false;
  const requireSkin = options.requireSkin !== false;
  const requireAnimations = options.requireAnimations !== false;
  const maxBytes = options.maxBytes || 250 * 1024 * 1024;
  const data = toBuffer(input);

  if (data.length < 20) fail('Datei ist zu kurz für einen gültigen GLB-Container.');
  if (data.length > maxBytes) fail('Datei überschreitet das erlaubte Größenlimit.');
  if (data.readUInt32LE(0) !== GLB_MAGIC) fail('Ungültige GLB-Magic-Bytes; erwartet wurde glTF.');
  const version = data.readUInt32LE(4);
  if (version !== 2) fail('Nicht unterstützte GLB-Version ' + version + '; erwartet wird glTF 2.0.');
  const declaredLength = data.readUInt32LE(8);
  if (declaredLength !== data.length) fail('GLB-Längenfeld stimmt nicht mit der tatsächlichen Dateigröße überein.');

  let offset = 12;
  let index = 0;
  let document = null;
  let binBytes = 0;

  while (offset < data.length) {
    if (offset + 8 > data.length) fail('Abgeschnittener GLB-Chunk-Header.');
    const length = data.readUInt32LE(offset);
    const type = data.readUInt32LE(offset + 4);
    offset += 8;
    if (length % 4 !== 0) fail('GLB-Chunk ist nicht 4-Byte-ausgerichtet.');
    if (offset + length > data.length) fail('GLB-Chunk reicht über das Dateiende hinaus.');
    if (index === 0 && type !== JSON_CHUNK) fail('Der erste GLB-Chunk muss JSON sein.');

    if (type === JSON_CHUNK) {
      if (document !== null) fail('Mehr als ein JSON-Chunk gefunden.');
      if (length > 64 * 1024 * 1024) fail('JSON-Chunk ist zu groß.');
      try {
        document = JSON.parse(data.subarray(offset, offset + length).toString('utf8').replace(/[\u0000\u0020]+$/g, ''));
      } catch (error) {
        fail('Ungültiger glTF-JSON-Chunk: ' + error.message);
      }
    } else if (type === BIN_CHUNK) {
      if (binBytes) fail('Mehr als ein BIN-Chunk gefunden.');
      binBytes = length;
    }
    offset += length;
    index += 1;
  }

  if (offset !== data.length) fail('GLB-Chunk-Grenzen stimmen nicht mit der Dateilänge überein.');
  if (!document || !document.asset || document.asset.version !== '2.0') fail('glTF-Asset-Metadaten mit Version 2.0 fehlen.');

  const nodes = Array.isArray(document.nodes) ? document.nodes : [];
  const meshes = Array.isArray(document.meshes) ? document.meshes : [];
  const skins = Array.isArray(document.skins) ? document.skins : [];
  const animations = Array.isArray(document.animations) ? document.animations : [];
  const buffers = Array.isArray(document.buffers) ? document.buffers : [];
  const bufferViews = Array.isArray(document.bufferViews) ? document.bufferViews : [];

  if (requireMesh && meshes.length === 0) fail('Kein Mesh gefunden.');
  if (requireSkin && skins.length === 0) fail('Kein Skin/Skelett gefunden; Rigging ist nicht nachgewiesen.');
  if (requireAnimations && animations.length === 0) fail('Keine Animationsclips gefunden.');

  if (buffers.length) {
    const declaredBufferBytes = buffers[0].byteLength;
    if (!Number.isInteger(declaredBufferBytes) || declaredBufferBytes < 0) fail('Ungültige Buffer-Länge.');
    if (!buffers[0].uri && declaredBufferBytes > 0 && binBytes === 0) fail('Interner glTF-Buffer vorhanden, aber BIN-Chunk fehlt.');
    if (!buffers[0].uri && binBytes > 0 && binBytes - declaredBufferBytes > 3) fail('BIN-Chunk-Padding überschreitet drei Bytes.');
  }

  bufferViews.forEach((view, i) => {
    if (!Number.isInteger(view.buffer) || view.buffer < 0 || view.buffer >= buffers.length) fail('bufferView ' + i + ' verweist auf keinen gültigen Buffer.');
    if (!Number.isInteger(view.byteLength) || view.byteLength < 0) fail('bufferView ' + i + ' hat eine ungültige Länge.');
  });

  skins.forEach((skin, skinIndex) => {
    if (!Array.isArray(skin.joints) || skin.joints.length === 0) fail('Skin ' + skinIndex + ' enthält keine Joints.');
    skin.joints.forEach(joint => {
      if (!Number.isInteger(joint) || joint < 0 || joint >= nodes.length) fail('Skin ' + skinIndex + ' enthält einen ungültigen Joint-Verweis.');
    });
    if (skin.skeleton !== undefined && (!Number.isInteger(skin.skeleton) || skin.skeleton < 0 || skin.skeleton >= nodes.length)) {
      fail('Skin ' + skinIndex + ' enthält einen ungültigen Skeleton-Root.');
    }
  });

  animations.forEach((animation, animationIndex) => {
    const samplers = Array.isArray(animation.samplers) ? animation.samplers : [];
    const channels = Array.isArray(animation.channels) ? animation.channels : [];
    if (!samplers.length || !channels.length) fail('Animation ' + animationIndex + ' besitzt keine Sampler/Channels.');
    channels.forEach(channel => {
      if (!Number.isInteger(channel.sampler) || channel.sampler < 0 || channel.sampler >= samplers.length) fail('Animation ' + animationIndex + ' besitzt einen ungültigen Sampler-Verweis.');
      const node = channel.target && channel.target.node;
      if (node !== undefined && (!Number.isInteger(node) || node < 0 || node >= nodes.length)) fail('Animation ' + animationIndex + ' besitzt einen ungültigen Ziel-Node.');
    });
  });

  const morphTargetCount = meshes.reduce((sum, mesh) => {
    const primitives = Array.isArray(mesh.primitives) ? mesh.primitives : [];
    return sum + primitives.reduce((n, primitive) => n + (Array.isArray(primitive.targets) ? primitive.targets.length : 0), 0);
  }, 0);
  const jointNames = skins.flatMap(skin => skin.joints.map(i => String(nodes[i].name || ('node-' + i))));
  const normalized = jointNames.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const animationNames = animations.map((a, i) => String(a.name || ('Animation ' + (i + 1))));
  const hints = {
    hips: normalized.some(n => /hips|pelvis/.test(n)),
    spine: normalized.some(n => /spine/.test(n)),
    neck: normalized.some(n => /neck/.test(n)),
    head: normalized.some(n => /head/.test(n)),
    arms: normalized.some(n => /arm/.test(n)),
    hands: normalized.some(n => /hand/.test(n)),
    legs: normalized.some(n => /thigh|upperleg|upleg/.test(n)),
    feet: normalized.some(n => /foot/.test(n))
  };
  const warnings = [];
  if (!morphTargetCount) warnings.push('Keine Morph Targets; Gesichtsanimation und Lip-Sync sind nicht nachgewiesen.');
  if (!hints.head) warnings.push('Kein Head-Joint anhand des Namens erkannt; Rig visuell prüfen.');
  if (!animationNames.some(n => /idle|stand|rest/i.test(n))) warnings.push('Kein Idle-/Stand-Clip erkannt.');
  if (!animationNames.some(n => /walk/i.test(n))) warnings.push('Kein Walk-Clip erkannt.');
  if (!animationNames.some(n => /run/i.test(n))) warnings.push('Kein Run-Clip erkannt.');

  return {
    validGlb: true,
    assetVersion: document.asset.version,
    fileBytes: data.length,
    nodeCount: nodes.length,
    meshCount: meshes.length,
    skinCount: skins.length,
    jointCount: skins.reduce((sum, skin) => sum + skin.joints.length, 0),
    animationCount: animations.length,
    animationNames,
    morphTargetCount,
    hasMorphTargets: morphTargetCount > 0,
    materialCount: Array.isArray(document.materials) ? document.materials.length : 0,
    textureCount: Array.isArray(document.textures) ? document.textures.length : 0,
    imageCount: Array.isArray(document.images) ? document.images.length : 0,
    jointNames,
    boneHints: hints,
    warnings
  };
}

function syntheticGlb() {
  const doc = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: 4 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 4 }],
    nodes: [{ name: 'Hips' }, { name: 'Spine' }, { name: 'Head' }],
    meshes: [{ primitives: [{ targets: [{ POSITION: 0 }] }] }],
    skins: [{ skeleton: 0, joints: [0, 1, 2] }],
    animations: [{ name: 'Walk', samplers: [{ input: 0, output: 0 }], channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }] }]
  };
  let json = Buffer.from(JSON.stringify(doc));
  const pad = (4 - json.length % 4) % 4;
  if (pad) json = Buffer.concat([json, Buffer.alloc(pad, 0x20)]);
  const bin = Buffer.alloc(4);
  const total = 12 + 8 + json.length + 8 + bin.length;
  const head = Buffer.alloc(12);
  head.writeUInt32LE(GLB_MAGIC, 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(total, 8);
  const jh = Buffer.alloc(8);
  jh.writeUInt32LE(json.length, 0);
  jh.writeUInt32LE(JSON_CHUNK, 4);
  const bh = Buffer.alloc(8);
  bh.writeUInt32LE(bin.length, 0);
  bh.writeUInt32LE(BIN_CHUNK, 4);
  return Buffer.concat([head, jh, json, bh, bin]);
}

export async function selfTest() {
  const valid = syntheticGlb();
  const result = inspectGlb(valid);
  assert.equal(result.validGlb, true);
  assert.equal(result.skinCount, 1);
  assert.equal(result.animationNames[0], 'Walk');
  assert.equal(result.hasMorphTargets, true);
  assert.equal(result.boneHints.head, true);

  const wrongVersion = Buffer.from(valid);
  wrongVersion.writeUInt32LE(1, 4);
  assert.throws(() => inspectGlb(wrongVersion), /glTF 2\.0/);

  const badMagic = Buffer.from(valid);
  badMagic.writeUInt32LE(0, 0);
  assert.throws(() => inspectGlb(badMagic), /Magic-Bytes/);

  const missingSkinDoc = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: 4 }],
    nodes: [{ name: 'Root' }],
    meshes: [{ primitives: [{}] }],
    animations: [{ name: 'Idle', samplers: [{}], channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }] }]
  };
  let json = Buffer.from(JSON.stringify(missingSkinDoc));
  const pad = (4 - json.length % 4) % 4;
  if (pad) json = Buffer.concat([json, Buffer.alloc(pad, 0x20)]);
  const bin = Buffer.alloc(4);
  const total = 12 + 8 + json.length + 8 + bin.length;
  const head = Buffer.alloc(12);
  head.writeUInt32LE(GLB_MAGIC, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(total, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length, 0); jh.writeUInt32LE(JSON_CHUNK, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(BIN_CHUNK, 4);
  const missingSkin = Buffer.concat([head, jh, json, bh, bin]);
  assert.throws(() => inspectGlb(missingSkin), /Skin\/Skelett/);

  console.log('PASS GLB-Parser prüft Header, glTF-2.0-JSON, BIN-Chunk, Skin, Animationen und Morph Targets.');
  console.log('PASS Ungültige Version, Magic-Bytes und fehlendes Skelett werden abgewiesen.');
}

export async function validateAvatarDirectory(options = {}) {
  const directory = options.directory || DEFAULT_DIR;
  const strict = options.strict === true;
  const results = [];
  for (const avatar of EXPECTED) {
    const target = path.join(directory, avatar.file);
    try {
      const file = await fs.readFile(target);
      const info = inspectGlb(file);
      results.push({ ...avatar, status: 'verified', ...info });
      console.log('PASS ' + avatar.label + ': ' + info.nodeCount + ' Nodes, ' + info.jointCount + ' Joints, ' + info.animationCount + ' Animationen, ' + info.morphTargetCount + ' Morph-Targets.');
      info.warnings.forEach(warning => console.warn('WARN ' + avatar.label + ': ' + warning));
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        results.push({ ...avatar, status: 'missing', reason: 'Datei noch nicht vorhanden.' });
        console.warn('PENDING ' + avatar.label + ': ' + avatar.file + ' fehlt noch.');
      } else {
        results.push({ ...avatar, status: 'invalid', reason: error.message });
        console.error('FAIL ' + avatar.label + ': ' + error.message);
      }
    }
  }
  const missing = results.filter(r => r.status === 'missing').length;
  const invalid = results.filter(r => r.status === 'invalid').length;
  const verified = results.filter(r => r.status === 'verified').length;
  console.log('Avatar-Asset-Status: ' + verified + ' verifiziert, ' + missing + ' fehlen, ' + invalid + ' ungültig.');
  if (invalid > 0 || (strict && missing > 0)) process.exitCode = 1;
  return results;
}

const invoked = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invoked) {
  if (process.argv.includes('--self-test')) await selfTest();
  else await validateAvatarDirectory({ strict: process.argv.includes('--strict') });
}
