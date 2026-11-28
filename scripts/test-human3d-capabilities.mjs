import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const engineSource = readFileSync(resolve(here, '../js/haldo-human-3d-engine.js'), 'utf8');

const emitted = [];
const listeners = [];
class CustomEventStub {
  constructor(type, options) {
    this.type = type;
    this.detail = options && options.detail;
  }
}

const window = {
  HalDo: {},
  addEventListener(type, handler) {
    listeners.push({ type, handler });
  },
  dispatchEvent(event) {
    emitted.push(event);
    return true;
  }
};

runInNewContext(engineSource, {
  window,
  document: {},
  console,
  CustomEvent: CustomEventStub,
  Set,
  Array,
  Object,
  Number,
  String,
  Math
});

const engine = window.HalDo.Human3D;
assert.ok(engine, 'Human3D engine exports its public API');
assert.equal(typeof engine.inspectModelCapabilities, 'function', 'Pure model capability inspector is exposed');
assert.ok(listeners.some(item => item.type === 'haldo:identity:changed'), 'Identity bridge listener is initialized');

const empty = engine.inspectModelCapabilities(null, []);
assert.equal(empty.meshCount, 0);
assert.equal(empty.isRigged, false);
assert.equal(empty.hasAnimations, false);
assert.equal(empty.hasMorphTargets, false);
assert.ok(empty.warnings.some(value => value.includes('Keine durchlaufbare 3D-Szene')));

const rigidScene = {
  traverse(callback) {
    callback({ isMesh: true, geometry: { morphAttributes: {} } });
  }
};
const staticReport = engine.inspectModelCapabilities(rigidScene, []);
assert.equal(staticReport.meshCount, 1);
assert.equal(staticReport.skinnedMeshCount, 0);
assert.equal(staticReport.isRigged, false, 'A static mesh is not misclassified as a rigged avatar');
assert.equal(staticReport.rigAndClipsPresent, false);
assert.ok(staticReport.warnings.some(value => value.includes('Kein SkinnedMesh')));

const skeletonOnlyScene = {
  traverse(callback) {
    callback({
      isMesh: true,
      skeleton: { bones: [{ name: 'Root' }] },
      geometry: { morphAttributes: {} }
    });
  }
};
const skeletonOnlyReport = engine.inspectModelCapabilities(skeletonOnlyScene, [{ name: 'Idle' }]);
assert.equal(skeletonOnlyReport.skinnedMeshCount, 0, 'A skeleton-like property without an actual SkinnedMesh is not sufficient');
assert.equal(skeletonOnlyReport.isRigged, false, 'A non-skinned mesh is not falsely classified as rigged');


const bones = [{ name: 'Hips' }, { name: 'Spine' }, { name: 'Head' }];
const riggedScene = {
  traverse(callback) {
    callback({
      isMesh: true,
      isSkinnedMesh: true,
      skeleton: { bones },
      morphTargetDictionary: {
        jawOpen: 0,
        mouthSmileLeft: 1,
        eyeBlinkLeft: 2,
        cheekSquintLeft: 3
      },
      geometry: {
        morphAttributes: {
          position: [{}, {}, {}, {}],
          normal: [{}, {}, {}, {}]
        }
      }
    });
    callback({
      isMesh: true,
      isSkinnedMesh: true,
      skeleton: { bones },
      geometry: { morphAttributes: {} }
    });
  }
};

const animations = [{ name: 'Idle' }, { name: 'Walk' }, { name: 'Talk' }];
const report = engine.inspectModelCapabilities(riggedScene, animations);
assert.equal(report.meshCount, 2);
assert.equal(report.skinnedMeshCount, 2, 'Only meshes explicitly marked as SkinnedMesh count as skinned');
assert.equal(report.skeletonBoneCount, 3, 'Shared skeleton bones are counted once');
assert.equal(report.morphMeshCount, 1);
assert.equal(report.morphTargetCount, 4, 'Duplicate morph attributes do not double-count the same target set');
assert.deepEqual(Array.from(report.morphTargetNames), ['cheekSquintLeft', 'eyeBlinkLeft', 'jawOpen', 'mouthSmileLeft']);
assert.deepEqual(Array.from(report.facialMorphTargetNames), ['cheekSquintLeft', 'eyeBlinkLeft', 'jawOpen', 'mouthSmileLeft']);
assert.equal(report.animationCount, 3);
assert.deepEqual(Array.from(report.animationNames), ['Idle', 'Walk', 'Talk']);
assert.equal(report.isRigged, true);
assert.equal(report.hasAnimations, true);
assert.equal(report.hasMorphTargets, true);
assert.equal(report.hasFacialMorphTargets, true);
assert.equal(report.rigAndClipsPresent, true, 'The flag reports structural rig plus clip presence, not verified humanoid quality');
assert.deepEqual(Array.from(report.warnings), [], 'A fully populated test model has no capability warnings');

const geometryOnlyMorphScene = {
  traverse(callback) {
    callback({
      isMesh: true,
      geometry: {
        morphAttributes: { position: [{}, {}] }
      }
    });
  }
};
const unnamedMorphs = engine.inspectModelCapabilities(geometryOnlyMorphScene, [{ name: 'Idle' }]);
assert.equal(unnamedMorphs.morphTargetCount, 2);
assert.equal(unnamedMorphs.hasMorphTargets, true);
assert.equal(unnamedMorphs.hasFacialMorphTargets, false, 'Unnamed geometry morph targets are not guessed to be facial controls');
assert.ok(unnamedMorphs.warnings.some(value => value.includes('keine eindeutig benannten Gesichts-Targets')));

const partiallyNamedScene = {
  traverse(callback) {
    callback({
      isMesh: true,
      isSkinnedMesh: true,
      skeleton: { bones: [{ name: 'Root' }] },
      morphTargetDictionary: { blinkLeft: 0 },
      geometry: { morphAttributes: { position: [{}] } }
    });
  }
};
const partial = engine.inspectModelCapabilities(partiallyNamedScene, []);
assert.equal(partial.isRigged, true);
assert.equal(partial.hasAnimations, false);
assert.equal(partial.hasFacialMorphTargets, true);
assert.equal(partial.rigAndClipsPresent, false, 'A rig without animation clips is not reported as ready');
assert.ok(partial.warnings.some(value => value.includes('keine Animationsclips')));

const statusBeforeModel = engine.getStatus();
assert.equal(statusBeforeModel.modelCapabilities, null, 'No model capability report is fabricated before a model is loaded');
assert.equal(emitted.some(event => event.type === 'haldo:human3d:ready'), true, 'Engine readiness event is still emitted');

console.log('Human3D capability tests passed: mesh/skeleton detection, unique bone counting, morph-target inspection, facial target naming, animation clips, warnings and status exposure.');
