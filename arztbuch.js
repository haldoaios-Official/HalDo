/* HalDo Arztbuch v1800.0 — ULTIMATE PRO MAX (Echte 3D-Anatomie mit Three.js ES-Modulen) */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function () {
  'use strict';
  const VERSION = '1800.0';
  const STORAGE_KEY = 'haldo.arztbuch.data.v1800';

  // ... (Der gesamte restliche Code aus der vorherigen Version bleibt hier unverändert,
  //      inklusive LANG, ANATOMY_DATA, DISEASES, MEDS, usw. Um die Antwort nicht
  //      unnötig aufzublähen, habe ich die Datenbanken hier nicht erneut ausgeschrieben.
  //      Du kannst den Code aus der letzten Nachricht (v1700.0) für alles unterhalb
  //      der `const VERSION`-Zeile übernehmen und nur die Import-Zeilen am Anfang
  //      sowie die `init3DAnatomy`-Funktion ersetzen.)

  // ═══════════════════════════════════════════════════════
  // 2. ANATOMIE DATENBANK (Beispiel)
  // ═══════════════════════════════════════════════════════
  const ANATOMY_DATA = {
    head: { name: 'Kopf (Schädel & Gehirn)', icon: '🧠', desc: 'Das Gehirn ist die Steuerzentrale. Es besteht aus Großhirn (Denken), Kleinhirn (Bewegung) und Hirnstamm (Überlebensfunktionen). Der Schädel schützt es.', organs: ['Gehirn', 'Hypophyse', 'Augen', 'Ohren', 'Nase', 'Mund'] },
    chest: { name: 'Brustkorb (Herz & Lunge)', icon: '🫀', desc: 'Das Herz pumpt Blut durch den Körper. Die Lunge nimmt Sauerstoff auf. Die Rippen schützen beide Organe.', organs: ['Herz', 'Lunge', 'Luftröhre', 'Speiseröhre', 'Thymusdrüse'] },
    abdomen: { name: 'Bauchraum (Verdauung)', icon: '🫃', desc: 'Hier findet die Verdauung statt. Die Leber entgiftet, der Magen zerkleinert, der Darm nimmt Nährstoffe auf.', organs: ['Magen', 'Leber', 'Gallenblase', 'Bauchspeicheldrüse', 'Dünndarm', 'Dickdarm', 'Nieren'] },
    pelvis: { name: 'Becken (Ausscheidung & Fortpflanzung)', icon: '🦴', desc: 'Enthält die Blase und die Fortpflanzungsorgane. Das Becken stützt den Oberkörper.', organs: ['Blase', 'Harnröhre', 'Fortpflanzungsorgane', 'Enddarm'] }
  };

  // ... (Alle anderen Datenbanken wie DISEASES, MEDS, LABS, DEVICES, FIRST_AID,
  //      HOSPITALS und der State bleiben unverändert. Füge sie hier wieder ein,
  //      genau wie in der vorherigen Nachricht.)

  // ═══════════════════════════════════════════════════════
  // 3. 3D-ANATOMIE MIT THREE.JS (ES-MODUL)
  // ═══════════════════════════════════════════════════════
  let threeScene, threeCamera, threeRenderer, threeModel, threeAnimationId;

  function init3DAnatomy() {
    const container = document.getElementById('anatomy-3d-container');
    if (!container) return;

    // Falls bereits eine Szene existiert, räumen wir auf.
    if (threeRenderer) {
      container.removeChild(threeRenderer.domElement);
      threeRenderer.dispose();
    }
    if (threeAnimationId) cancelAnimationFrame(threeAnimationId);

    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x0a0a0f);

    threeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    threeCamera.position.set(0, 0, 5);

    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(container.clientWidth, container.clientHeight);
    threeRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(threeRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    threeScene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 1, 1);
    threeScene.add(dirLight);

    // Lade das GLB-Modell. Wenn es fehlschlägt, zeigen wir einen Drahtgitter-Würfel.
    const loader = new GLTFLoader();
    loader.load('body.glb', (gltf) => {
      threeModel = gltf.scene;
      threeModel.scale.set(1.5, 1.5, 1.5);
      threeModel.position.y = -0.5;
      threeScene.add(threeModel);
      animate3D();
    }, undefined, (error) => {
      console.error('Fehler beim Laden des 3D-Modells (body.glb):', error);
      // Fallback: Zeige einen Würfel
      const geometry = new THREE.BoxGeometry(1, 2, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, wireframe: true });
      threeModel = new THREE.Mesh(geometry, material);
      threeScene.add(threeModel);
      animate3D();
    });

    function animate3D() {
      threeAnimationId = requestAnimationFrame(animate3D);
      if (threeModel) threeModel.rotation.y += 0.002;
      threeRenderer.render(threeScene, threeCamera);
    }

    window.addEventListener('resize', () => {
      if (!threeCamera || !threeRenderer || !container) return;
      threeCamera.aspect = container.clientWidth / container.clientHeight;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // ... (Der Rest der Logik: handleClick, updateView, mount, openOverlay usw.
  //      bleibt genauso wie in der vorherigen Version. Achte darauf, dass die
  //      Funktion `init3DAnatomy` jetzt die ES-Modul-Importe nutzt, die oben
  //      in der Datei stehen.)

  // ═══════════════════════════════════════════════════════
  // 4. GLOBALE API & BOOT
  // ═══════════════════════════════════════════════════════
  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — ULTIMATE PRO MAX (3D Anatomie mit ES-Modulen)');
})();
