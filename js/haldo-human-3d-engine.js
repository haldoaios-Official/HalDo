/* ============================================================
   HALDO HUMAN 3D ENGINE PRO MAX
   Version: 1.0.0
   Projekt: HalDo AI OS Pro Max

   Funktionen:
   - Echtes GLB/GLTF Humanoid-Modell laden
   - Three.js r128 verwenden
   - GLTFLoader automatisch laden
   - Mehrere Avatar-Modelle unterstützen
   - AnimationMixer verwenden
   - Vorhandene Animationen automatisch erkennen
   - Idle / Walk / Wave / Talk usw.
   - Emotionen und Aktivitätszustände
   - Maus- und Touch-Rotation
   - Responsive 3D-Ansicht
   - Integration mit HalDo.LivingIdentity
   - Sichere Fehlerbehandlung
   - Renderer bei Schließen pausieren

   WICHTIG:
   Für einen echten menschlichen Körper wird eine
   rigged GLB-Datei benötigt.
============================================================ */

(function (window, document) {

    "use strict";

    /* ========================================================
       NAMESPACE
    ======================================================== */

    window.HalDo = window.HalDo || {};

    const HD = window.HalDo;

    if (HD.Human3D) {
        console.warn(
            "[HalDo Human3D] Engine ist bereits geladen."
        );
        return;
    }


    /* ========================================================
       KONFIGURATION
    ======================================================== */

    const CONFIG = {

        version: "1.0.0",

        containerId: "haldo-human-3d-root",

        stageId: "haldo-human-3d-stage",

        loaderUrl:
            "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js",

        defaultModel: "human",

        autoRotate: false,

        rotationSpeed: 0.003,

        cameraFov: 35,

        cameraNear: 0.1,

        cameraFar: 1000,

        maxPixelRatio: 2,

        background: 0x050817,

        modelScale: 1,

        models: {

            human: {
                name: "HalDo Human",
                path: "assets/avatars/haldo-human.glb",
                mode: "human"
            },

            cyborg: {
                name: "HalDo Cyborg",
                path: "assets/avatars/haldo-cyborg.glb",
                mode: "cyborg"
            },

            android: {
                name: "HalDo Android",
                path: "assets/avatars/haldo-android.glb",
                mode: "android"
            },

            robot: {
                name: "HalDo Robot",
                path: "assets/avatars/haldo-robot.glb",
                mode: "robot"
            }

        }

    };


    /* ========================================================
       STATUS
    ======================================================== */

    const state = {

        initialized: false,

        opened: false,

        loading: false,

        loaded: false,

        animationRunning: false,

        currentModel: null,

        currentModelKey: null,

        currentAnimation: null,

        currentEmotion: "friendly",

        currentActivity: "idle",

        error: null,

        frameId: null,

        renderer: null,

        scene: null,

        camera: null,

        mixer: null,

        clock: null,

        loader: null,

        modelRoot: null,

        animationActions: {},

        activeAction: null,

        container: null,

        stage: null,

        statusElement: null,

        loadingElement: null,

        resizeObserver: null,

        pointerDown: false,

        pointerX: 0,

        pointerY: 0,

        rotationY: 0,

        rotationX: 0,

        reducedMotion: false

    };


    /* ========================================================
       EVENTS
    ======================================================== */

    const EVENTS = {

        emit: function (name, detail) {

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:human3d:" + name,
                        {
                            detail: detail || {}
                        }
                    )
                );

            } catch (error) {

                console.warn(
                    "[HalDo Human3D] Event error:",
                    error
                );

            }

        }

    };


    /* ========================================================
       HELPERS
    ======================================================== */

    function log() {

        console.log.apply(
            console,
            [
                "[HalDo Human3D]"
            ].concat(
                Array.from(arguments)
            )
        );

    }


    function setStatus(message, type) {

        if (!state.statusElement) {
            return;
        }

        state.statusElement.textContent =
            message || "";

        state.statusElement.dataset.status =
            type || "normal";

    }


    function setLoading(visible, message) {

        if (!state.loadingElement) {
            return;
        }

        state.loadingElement.style.display =
            visible ? "flex" : "none";

        const text =
            state.loadingElement.querySelector(
                ".haldo-human-loading-text"
            );

        if (text && message) {

            text.textContent = message;

        }

    }


    function getModelConfig(modelKey) {

        if (
            CONFIG.models[modelKey]
        ) {

            return CONFIG.models[modelKey];

        }

        return null;

    }


    function isMobile() {

        return (
            window.innerWidth < 700
        );

    }


    /* ========================================================
       CSS
    ======================================================== */

    function installStyles() {

        if (
            document.getElementById(
                "haldo-human-3d-styles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "haldo-human-3d-styles";

        style.textContent = `

        #haldo-human-3d-root {

            position: fixed;

            inset: 0;

            z-index: 99980;

            display: none;

            align-items: center;

            justify-content: center;

            background:
                radial-gradient(
                    circle at center,
                    rgba(20,35,75,.96),
                    rgba(1,3,14,.98)
                );

            backdrop-filter: blur(18px);

            overflow: hidden;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

        }


        #haldo-human-3d-root.haldo-human-open {

            display: flex;

        }


        #haldo-human-3d-window {

            position: relative;

            width: min(1100px, 96vw);

            height: min(850px, 94vh);

            border: 1px solid rgba(0,220,255,.45);

            border-radius: 24px;

            background:
                linear-gradient(
                    145deg,
                    rgba(8,18,42,.95),
                    rgba(2,5,20,.97)
                );

            box-shadow:

                0 0 35px rgba(0,190,255,.18),

                0 0 90px rgba(0,100,255,.12),

                inset 0 0 35px rgba(0,180,255,.06);

            overflow: hidden;

        }


        #haldo-human-3d-header {

            position: absolute;

            top: 0;

            left: 0;

            right: 0;

            height: 64px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 0 20px;

            z-index: 10;

            border-bottom:
                1px solid rgba(0,200,255,.18);

            background:
                rgba(3,10,28,.76);

        }


        .haldo-human-brand {

            color: #ffffff;

            font-size: 17px;

            font-weight: 800;

            letter-spacing: 1.5px;

        }


        .haldo-human-brand span {

            color: #00eaff;

        }


        .haldo-human-close {

            width: 40px;

            height: 40px;

            border-radius: 12px;

            border: 1px solid rgba(255,255,255,.15);

            color: white;

            background: rgba(255,255,255,.07);

            cursor: pointer;

            font-size: 20px;

        }


        #haldo-human-3d-stage {

            position: absolute;

            inset: 64px 0 85px 0;

            overflow: hidden;

            touch-action: none;

        }


        #haldo-human-3d-stage canvas {

            display: block;

            width: 100%;

            height: 100%;

            outline: none;

        }


        #haldo-human-3d-controls {

            position: absolute;

            left: 0;

            right: 0;

            bottom: 0;

            min-height: 85px;

            padding: 12px 16px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 10px;

            flex-wrap: wrap;

            z-index: 10;

            background:
                rgba(2,8,24,.92);

            border-top:
                1px solid rgba(0,200,255,.17);

        }


        .haldo-human-control {

            border: 1px solid rgba(0,220,255,.28);

            border-radius: 12px;

            padding: 10px 15px;

            color: #e9fbff;

            background:
                rgba(0,150,255,.10);

            cursor: pointer;

            font-size: 12px;

            font-weight: 700;

            transition: .2s ease;

        }


        .haldo-human-control:hover {

            background:
                rgba(0,190,255,.24);

            border-color: #00eaff;

            transform: translateY(-2px);

        }


        .haldo-human-control.active {

            background:
                rgba(0,220,255,.28);

            border-color: #00eaff;

        }


        #haldo-human-3d-status {

            position: absolute;

            top: 78px;

            left: 18px;

            z-index: 5;

            color: #8deeff;

            font-size: 11px;

            letter-spacing: 1px;

            pointer-events: none;

        }


        #haldo-human-3d-status[data-status="error"] {

            color: #ff7777;

        }


        #haldo-human-3d-status[data-status="success"] {

            color: #8cffc2;

        }


        #haldo-human-3d-loading {

            position: absolute;

            inset: 0;

            z-index: 8;

            display: none;

            align-items: center;

            justify-content: center;

            flex-direction: column;

            background:
                rgba(1,5,18,.84);

            color: white;

            text-align: center;

            padding: 25px;

        }


        .haldo-human-loader-ring {

            width: 60px;

            height: 60px;

            border: 3px solid rgba(0,220,255,.15);

            border-top-color: #00eaff;

            border-radius: 50%;

            animation:
                haldoHumanSpin 1s linear infinite;

            margin-bottom: 20px;

        }


        .haldo-human-loading-text {

            font-size: 14px;

            color: #b8f5ff;

        }


        @keyframes haldoHumanSpin {

            to {

                transform: rotate(360deg);

            }

        }


        .haldo-human-model-select {

            position: absolute;

            top: 76px;

            right: 16px;

            z-index: 9;

            color: white;

            background: rgba(4,15,35,.9);

            border: 1px solid rgba(0,220,255,.35);

            border-radius: 10px;

            padding: 9px;

            max-width: 155px;

            font-size: 12px;

        }


        @media(max-width:650px) {

            #haldo-human-3d-window {

                width: 100vw;

                height: 100dvh;

                border-radius: 0;

            }

            #haldo-human-3d-stage {

                inset: 64px 0 125px 0;

            }

            #haldo-human-3d-controls {

                min-height: 125px;

                gap: 7px;

            }

            .haldo-human-control {

                padding: 9px 11px;

                font-size: 11px;

            }

        }


        @media(prefers-reduced-motion:reduce) {

            .haldo-human-loader-ring {

                animation: none;

            }

        }

        `;

        document.head.appendChild(style);

    }


    /* ========================================================
       INTERFACE
    ======================================================== */

    function createInterface() {

        if (
            document.getElementById(
                CONFIG.containerId
            )
        ) {

            state.container =
                document.getElementById(
                    CONFIG.containerId
                );

            return;

        }

        installStyles();

        const root =
            document.createElement("div");

        root.id =
            CONFIG.containerId;

        root.innerHTML = `

            <div id="haldo-human-3d-window">

                <header id="haldo-human-3d-header">

                    <div class="haldo-human-brand">

                        HALDO <span>HUMAN 3D</span>

                    </div>

                    <button
                        type="button"
                        class="haldo-human-close"
                        aria-label="3D Avatar schließen"
                    >

                        ✕

                    </button>

                </header>


                <div
                    id="haldo-human-3d-stage"
                ></div>


                <div
                    id="haldo-human-3d-status"
                    data-status="normal"
                >

                    3D ENGINE INITIALISIERT

                </div>


                <select
                    class="haldo-human-model-select"
                    aria-label="Avatar auswählen"
                >

                    <option value="human">
                        Mensch
                    </option>

                    <option value="cyborg">
                        Cyborg
                    </option>

                    <option value="android">
                        Android
                    </option>

                    <option value="robot">
                        Roboter
                    </option>

                </select>


                <div
                    id="haldo-human-3d-loading"
                >

                    <div
                        class="haldo-human-loader-ring"
                    ></div>

                    <div
                        class="haldo-human-loading-text"
                    >

                        HalDo wird geladen ...

                    </div>

                </div>


                <footer
                    id="haldo-human-3d-controls"
                >

                    <button
                        class="haldo-human-control active"
                        data-animation="idle"
                    >
                        🧍 Ruhe
                    </button>

                    <button
                        class="haldo-human-control"
                        data-animation="walk"
                    >
                        🚶 Gehen
                    </button>

                    <button
                        class="haldo-human-control"
                        data-animation="wave"
                    >
                        👋 Winken
                    </button>

                    <button
                        class="haldo-human-control"
                        data-animation="talk"
                    >
                        🗣️ Sprechen
                    </button>

                    <button
                        class="haldo-human-control"
                        data-animation="dance"
                    >
                        💫 Bewegung
                    </button>

                </footer>

            </div>

        `;

        document.body.appendChild(root);

        state.container = root;

        state.stage =
            root.querySelector(
                "#haldo-human-3d-stage"
            );

        state.statusElement =
            root.querySelector(
                "#haldo-human-3d-status"
            );

        state.loadingElement =
            root.querySelector(
                "#haldo-human-3d-loading"
            );

        root.querySelector(
            ".haldo-human-close"
        ).addEventListener(
            "click",
            close
        );

        root.querySelector(
            ".haldo-human-model-select"
        ).addEventListener(
            "change",
            function (event) {

                setModel(event.target.value);

            }
        );

        root.querySelectorAll(
            "[data-animation]"
        ).forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        playAnimation(
                            button.dataset.animation
                        );

                    }
                );

            }
        );

        root.addEventListener(
            "click",
            function (event) {

                if (event.target === root) {
                    close();
                }

            }
        );

    }


    /* ========================================================
       THREE.JS CHECK
    ======================================================== */

    function getThree() {

        if (!window.THREE) {

            throw new Error(
                "Three.js wurde nicht gefunden. " +
                "Bitte Three.js r128 zuerst laden."
            );

        }

        return window.THREE;

    }


    /* ========================================================
       GLTF LOADER
    ======================================================== */

    function loadGLTFLoader() {

        return new Promise(
            function (resolve, reject) {

                const THREE = getThree();

                if (THREE.GLTFLoader) {

                    resolve(THREE.GLTFLoader);

                    return;

                }

                const existing =
                    document.querySelector(
                        'script[data-haldo-gltf-loader="true"]'
                    );

                if (existing) {

                    existing.addEventListener(
                        "load",
                        function () {

                            if (THREE.GLTFLoader) {
                                resolve(THREE.GLTFLoader);
                            } else {
                                reject(
                                    new Error(
                                        "GLTFLoader wurde nicht registriert."
                                    )
                                );
                            }

                        },
                        { once: true }
                    );

                    existing.addEventListener(
                        "error",
                        function () {

                            reject(
                                new Error(
                                    "GLTFLoader konnte nicht geladen werden."
                                )
                            );

                        },
                        { once: true }
                    );

                    return;

                }

                const script =
                    document.createElement("script");

                script.src =
                    CONFIG.loaderUrl;

                script.async = true;

                script.dataset.haldoGltfLoader =
                    "true";

                script.onload = function () {

                    if (THREE.GLTFLoader) {

                        resolve(
                            THREE.GLTFLoader
                        );

                    } else {

                        reject(
                            new Error(
                                "Three.GLTFLoader ist nicht verfügbar."
                            )
                        );

                    }

                };

                script.onerror = function () {

                    reject(
                        new Error(
                            "Der GLTFLoader konnte nicht geladen werden. " +
                            "Bitte Internetverbindung und CDN prüfen."
                        )
                    );

                };

                document.head.appendChild(script);

            }
        );

    }


    /* ========================================================
       THREE SCENE
    ======================================================== */

    async function initializeScene() {

        if (state.initialized) {
            return true;
        }

        const THREE = getThree();

        if (!state.stage) {
            createInterface();
        }

        state.reducedMotion =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        state.scene =
            new THREE.Scene();

        state.scene.background =
            new THREE.Color(
                CONFIG.background
            );

        state.scene.fog =
            new THREE.Fog(
                CONFIG.background,
                12,
                35
            );


        /* Kamera */

        state.camera =
            new THREE.PerspectiveCamera(

                CONFIG.cameraFov,

                1,

                CONFIG.cameraNear,

                CONFIG.cameraFar

            );

        state.camera.position.set(
            0,
            1.5,
            7
        );


        /* Renderer */

        state.renderer =
            new THREE.WebGLRenderer({

                antialias: true,

                alpha: false,

                powerPreference: "high-performance"

            });

        state.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                CONFIG.maxPixelRatio
            )
        );

        state.renderer.outputEncoding =
            THREE.sRGBEncoding;

        state.renderer.shadowMap.enabled =
            true;

        state.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        state.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        state.renderer.toneMappingExposure =
            1.1;

        state.stage.appendChild(
            state.renderer.domElement
        );


        /* Licht */

        const ambient =
            new THREE.HemisphereLight(
                0xc6eaff,
                0x111a36,
                1.35
            );

        state.scene.add(ambient);


        const mainLight =
            new THREE.DirectionalLight(
                0xffffff,
                2.2
            );

        mainLight.position.set(
            4,
            8,
            7
        );

        mainLight.castShadow = true;

        state.scene.add(mainLight);


        const blueLight =
            new THREE.PointLight(
                0x00c8ff,
                2.2,
                15
            );

        blueLight.position.set(
            -4,
            2,
            3
        );

        state.scene.add(blueLight);


        const violetLight =
            new THREE.PointLight(
                0x9c52ff,
                1.5,
                15
            );

        violetLight.position.set(
            4,
            1,
            -3
        );

        state.scene.add(violetLight);


        /* Boden */

        const floorGeometry =
            new THREE.CircleGeometry(
                3,
                64
            );

        const floorMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x07152c,

                metalness: 0.65,

                roughness: 0.35,

                transparent: true,

                opacity: 0.75

            });

        const floor =
            new THREE.Mesh(
                floorGeometry,
                floorMaterial
            );

        floor.rotation.x =
            -Math.PI / 2;

        floor.position.y =
            -0.02;

        floor.receiveShadow = true;

        state.scene.add(floor);


        /* Licht-Ring */

        const ringGeometry =
            new THREE.TorusGeometry(
                1.55,
                0.012,
                8,
                100
            );

        const ringMaterial =
            new THREE.MeshBasicMaterial({

                color: 0x00dfff,

                transparent: true,

                opacity: 0.65

            });

        const ring =
            new THREE.Mesh(
                ringGeometry,
                ringMaterial
            );

        ring.rotation.x =
            Math.PI / 2;

        ring.position.y =
            0.015;

        state.scene.add(ring);


        state.clock =
            new THREE.Clock();

        state.initialized = true;

        installInteraction();

        resize();

        EVENTS.emit(
            "initialized",
            {
                version: CONFIG.version
            }
        );

        log(
            "Three.js Szene initialisiert."
        );

        return true;

    }


    /* ========================================================
       RESIZE
    ======================================================== */

    function resize() {

        if (
            !state.renderer ||
            !state.camera ||
            !state.stage
        ) {
            return;
        }

        const width =
            Math.max(
                1,
                state.stage.clientWidth
            );

        const height =
            Math.max(
                1,
                state.stage.clientHeight
            );

        state.camera.aspect =
            width / height;

        state.camera.updateProjectionMatrix();

        state.renderer.setSize(
            width,
            height,
            false
        );

    }


    /* ========================================================
       INTERACTION
    ======================================================== */

    function installInteraction() {

        if (!state.stage) {
            return;
        }

        const stage = state.stage;


        stage.addEventListener(
            "pointerdown",
            function (event) {

                state.pointerDown = true;

                state.pointerX =
                    event.clientX;

                state.pointerY =
                    event.clientY;

                if (
                    stage.setPointerCapture
                ) {

                    try {

                        stage.setPointerCapture(
                            event.pointerId
                        );

                    } catch (error) {}

                }

            }
        );


        stage.addEventListener(
            "pointermove",
            function (event) {

                if (!state.pointerDown) {
                    return;
                }

                const deltaX =
                    event.clientX -
                    state.pointerX;

                const deltaY =
                    event.clientY -
                    state.pointerY;

                state.pointerX =
                    event.clientX;

                state.pointerY =
                    event.clientY;

                state.rotationY +=
                    deltaX * 0.006;

                state.rotationX +=
                    deltaY * 0.004;

                state.rotationX =
                    Math.max(
                        -0.35,
                        Math.min(
                            0.35,
                            state.rotationX
                        )
                    );

                if (state.modelRoot) {

                    state.modelRoot.rotation.y =
                        state.rotationY;

                    state.modelRoot.rotation.x =
                        state.rotationX;

                }

            }
        );


        function stopPointer() {

            state.pointerDown = false;

        }


        stage.addEventListener(
            "pointerup",
            stopPointer
        );

        stage.addEventListener(
            "pointercancel",
            stopPointer
        );

        stage.addEventListener(
            "lostpointercapture",
            stopPointer
        );


        window.addEventListener(
            "resize",
            resize
        );

        if (
            window.ResizeObserver
        ) {

            state.resizeObserver =
                new ResizeObserver(resize);

            state.resizeObserver.observe(
                stage
            );

        }

    }


    /* ========================================================
       MODEL DISPOSAL
    ======================================================== */

    function disposeModel() {

        if (state.mixer) {

            state.mixer.stopAllAction();

            state.mixer = null;

        }

        state.animationActions = {};

        state.activeAction = null;

        state.currentAnimation = null;


        if (state.modelRoot) {

            state.scene.remove(
                state.modelRoot
            );

            state.modelRoot.traverse(
                function (object) {

                    if (!object.isMesh) {
                        return;
                    }

                    if (object.geometry) {

                        object.geometry.dispose();

                    }

                    if (object.material) {

                        const materials =
                            Array.isArray(
                                object.material
                            )
                                ? object.material
                                : [object.material];

                        materials.forEach(
                            function (material) {

                                material.dispose();

                            }
                        );

                    }

                }
            );

            state.modelRoot = null;

        }

        state.loaded = false;

    }


    /* ========================================================
       MODEL FIT
    ======================================================== */

    function fitModel(object) {

        const THREE = getThree();

        const box =
            new THREE.Box3().setFromObject(
                object
            );

        const size =
            box.getSize(
                new THREE.Vector3()
            );

        const center =
            box.getCenter(
                new THREE.Vector3()
            );

        const maxDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );

        if (
            !Number.isFinite(maxDimension) ||
            maxDimension <= 0
        ) {

            throw new Error(
                "Das geladene Modell hat keine gültigen Abmessungen."
            );

        }

        const targetHeight = 3.4;

        const scale =
            targetHeight /
            maxDimension *
            CONFIG.modelScale;

        object.scale.setScalar(scale);

        object.position.x =
            -center.x * scale;

        object.position.y =
            -box.min.y * scale;

        object.position.z =
            -center.z * scale;


        state.camera.position.set(
            0,
            targetHeight * 0.46,
            6.7
        );

        state.camera.lookAt(
            0,
            targetHeight * 0.48,
            0
        );

    }


    /* ========================================================
       ANIMATION NAME MATCHING
    ======================================================== */

    function findAnimation(name) {

        const search =
            String(name || "")
                .toLowerCase();

        const clips =
            state.modelRoot &&
            state.modelRoot.userData &&
            state.modelRoot.userData.animations
                ? state.modelRoot.userData.animations
                : [];

        const aliases = {

            idle: [
                "idle",
                "stand",
                "standing",
                "breath",
                "rest"
            ],

            walk: [
                "walk",
                "walking",
                "run",
                "running"
            ],

            wave: [
                "wave",
                "waving",
                "hello",
                "greet"
            ],

            talk: [
                "talk",
                "talking",
                "speak",
                "speaking"
            ],

            dance: [
                "dance",
                "dancing",
                "move"
            ],

            think: [
                "think",
                "thinking"
            ]

        };

        const terms =
            aliases[search] || [search];

        for (
            let i = 0;
            i < clips.length;
            i++
        ) {

            const clipName =
                String(
                    clips[i].name || ""
                ).toLowerCase();

            if (
                terms.some(
                    term =>
                        clipName.includes(term)
                )
            ) {

                return clips[i];

            }

        }

        return null;

    }


    /* ========================================================
       LOAD MODEL
    ======================================================== */

    async function setModel(modelKey) {

        const config =
            getModelConfig(modelKey);

        if (!config) {

            setStatus(
                "Unbekanntes Avatar-Modell.",
                "error"
            );

            return false;

        }

        if (state.loading) {

            log(
                "Modellwechsel wird vorbereitet."
            );

        }

        state.loading = true;

        state.error = null;

        setLoading(
            true,
            config.name + " wird geladen ..."
        );

        setStatus(
            "3D-MODELL WIRD GELADEN",
            "normal"
        );

        EVENTS.emit(
            "model-loading",
            {
                key: modelKey,
                config: config
            }
        );

        try {

            await initializeScene();

            const GLTFLoader =
                await loadGLTFLoader();

            const loader =
                new GLTFLoader();

            state.loader = loader;


            const gltf =
                await new Promise(
                    function (resolve, reject) {

                        loader.load(

                            config.path,

                            resolve,

                            function (progress) {

                                if (
                                    progress &&
                                    progress.total > 0
                                ) {

                                    const percent =
                                        Math.round(
                                            progress.loaded /
                                            progress.total *
                                            100
                                        );

                                    setLoading(
                                        true,
                                        config.name +
                                        " wird geladen: " +
                                        percent +
                                        "%"
                                    );

                                }

                            },

                            reject

                        );

                    }
                );


            if (
                !gltf ||
                !gltf.scene
            ) {

                throw new Error(
                    "Die GLB-Datei enthält keine gültige 3D-Szene."
                );

            }


            disposeModel();

            const model =
                gltf.scene;

            model.traverse(
                function (object) {

                    if (object.isMesh) {

                        object.castShadow = true;

                        object.receiveShadow = true;

                        if (
                            object.material
                        ) {

                            const materials =
                                Array.isArray(
                                    object.material
                                )
                                    ? object.material
                                    : [object.material];

                            materials.forEach(
                                function (material) {

                                    material.needsUpdate = true;

                                }
                            );

                        }

                    }

                }
            );


            state.modelRoot = model;

            state.scene.add(model);


            fitModel(model);


            /* Animationen übernehmen */

            const clips =
                gltf.animations || [];

            state.modelRoot.userData.animations =
                clips;

            state.animationActions = {};

            if (clips.length > 0) {

                state.mixer =
                    new THREE.AnimationMixer(
                        model
                    );

                clips.forEach(
                    function (clip) {

                        const action =
                            state.mixer.clipAction(
                                clip
                            );

                        state.animationActions[
                            clip.name
                        ] = action;

                    }
                );

            }


            state.currentModel =
                config;

            state.currentModelKey =
                modelKey;

            state.loaded = true;

            state.loading = false;

            state.rotationX = 0;

            state.rotationY = 0;

            model.rotation.set(0, 0, 0);


            setLoading(false);

            setStatus(
                config.name +
                " ONLINE | " +
                clips.length +
                " Animation(en)",
                "success"
            );


            const select =
                state.container.querySelector(
                    ".haldo-human-model-select"
                );

            if (select) {

                select.value = modelKey;

            }


            EVENTS.emit(
                "model-loaded",
                {
                    key: modelKey,
                    name: config.name,
                    animations: clips.map(
                        clip => clip.name
                    )
                }
            );


            log(
                config.name,
                "erfolgreich geladen.",
                clips.length,
                "Animationen."
            );


            if (clips.length > 0) {

                playAnimation("idle");

            }

            return true;

        } catch (error) {

            state.loading = false;

            state.loaded = false;

            state.error = error;

            setLoading(false);

            setStatus(
                "FEHLER: " + error.message,
                "error"
            );

            EVENTS.emit(
                "model-error",
                {
                    key: modelKey,
                    error: error.message
                }
            );

            console.error(
                "[HalDo Human3D] Modellfehler:",
                error
            );

            return false;

        }

    }


    /* ========================================================
       ANIMATION PLAYBACK
    ======================================================== */

    function playAnimation(name, options) {

        options = options || {};

        if (
            !state.loaded ||
            !state.mixer ||
            !state.modelRoot
        ) {

            setStatus(
                "Keine animierte Modell-Datei geladen.",
                "error"
            );

            return false;

        }

        const clip =
            findAnimation(name);

        if (!clip) {

            setStatus(
                "Animation '" +
                name +
                "' ist im Modell nicht enthalten.",
                "normal"
            );

            EVENTS.emit(
                "animation-missing",
                {
                    requested: name
                }
            );

            return false;

        }


        const nextAction =
            state.mixer.clipAction(clip);

        if (
            state.activeAction === nextAction
        ) {

            return true;

        }


        nextAction.reset();

        nextAction.enabled = true;

        nextAction.setEffectiveWeight(1);

        nextAction.setEffectiveTimeScale(1);

        nextAction.setLoop(
            THREE.LoopRepeat,
            Infinity
        );


        if (state.activeAction) {

            state.activeAction.crossFadeTo(
                nextAction,
                options.fadeDuration || 0.35,
                true
            );

        }

        nextAction.play();

        state.activeAction =
            nextAction;

        state.currentAnimation =
            clip.name;

        state.currentActivity =
            name;

        state.animationRunning = true;


        state.container.querySelectorAll(
            "[data-animation]"
        ).forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.animation === name
                );

            }
        );


        EVENTS.emit(
            "animation-changed",
            {
                requested: name,
                actual: clip.name
            }
        );

        return true;

    }


    /* ========================================================
       EMOTION
    ======================================================== */

    function setEmotion(emotion) {

        const allowed = [

            "friendly",

            "happy",

            "thinking",

            "surprised",

            "serious",

            "listening",

            "speaking",

            "calm"

        ];

        if (
            !allowed.includes(emotion)
        ) {

            return false;

        }

        state.currentEmotion =
            emotion;

        if (state.container) {

            state.container.dataset.emotion =
                emotion;

        }

        EVENTS.emit(
            "emotion-changed",
            {
                emotion: emotion
            }
        );

        return true;

    }


    /* ========================================================
       ACTIVITY STATE
    ======================================================== */

    function setState(activity) {

        const allowed = [

            "idle",

            "listening",

            "thinking",

            "speaking",

            "answering",

            "working"

        ];

        if (
            !allowed.includes(activity)
        ) {

            return false;

        }

        state.currentActivity =
            activity;

        if (activity === "thinking") {

            setEmotion("thinking");

        }

        if (activity === "listening") {

            setEmotion("listening");

        }

        if (activity === "speaking") {

            setEmotion("speaking");

        }

        if (activity === "idle") {

            setEmotion("friendly");

        }

        EVENTS.emit(
            "activity-changed",
            {
                activity: activity
            }
        );

        return true;

    }


    /* ========================================================
       MODEL REGISTRATION
    ======================================================== */

    function registerModel(key, config) {

        if (
            !key ||
            !config ||
            !config.path
        ) {

            return false;

        }

        CONFIG.models[key] = {

            name:
                config.name ||
                key,

            path:
                config.path,

            mode:
                config.mode ||
                key

        };

        EVENTS.emit(
            "model-registered",
            {
                key: key,
                config: CONFIG.models[key]
            }
        );

        return true;

    }


    /* ========================================================
       RENDER LOOP
    ======================================================== */

    function animate() {

        if (
            !state.opened ||
            !state.renderer ||
            !state.scene ||
            !state.camera
        ) {

            state.frameId = null;

            return;

        }

        state.frameId =
            requestAnimationFrame(animate);


        const delta =
            Math.min(
                state.clock.getDelta(),
                0.05
            );


        if (state.mixer) {

            state.mixer.update(delta);

        }


        if (
            CONFIG.autoRotate &&
            !state.pointerDown &&
            state.modelRoot &&
            !state.reducedMotion
        ) {

            state.modelRoot.rotation.y +=
                CONFIG.rotationSpeed;

        }


        state.renderer.render(
            state.scene,
            state.camera
        );

    }


    function startRendering() {

        if (state.frameId !== null) {
            return;
        }

        if (state.clock) {

            state.clock.getDelta();

        }

        animate();

    }


    function stopRendering() {

        if (state.frameId !== null) {

            cancelAnimationFrame(
                state.frameId
            );

            state.frameId = null;

        }

    }


    /* ========================================================
       OPEN
    ======================================================== */

    async function open(modelKey) {

        createInterface();

        state.opened = true;

        state.container.classList.add(
            "haldo-human-open"
        );

        await initializeScene();

        resize();

        startRendering();

        const selected =
            modelKey ||
            state.currentModelKey ||
            CONFIG.defaultModel;

        if (
            !state.loaded ||
            state.currentModelKey !== selected
        ) {

            await setModel(selected);

        }

        EVENTS.emit(
            "opened",
            {
                model: selected
            }
        );

        return true;

    }


    /* ========================================================
       CLOSE
    ======================================================== */

    function close() {

        if (!state.container) {
            return;
        }

        state.opened = false;

        state.container.classList.remove(
            "haldo-human-open"
        );

        stopRendering();

        EVENTS.emit(
            "closed",
            {
                model: state.currentModelKey
            }
        );

    }


    /* ========================================================
       TOGGLE
    ======================================================== */

    function toggle(modelKey) {

        if (state.opened) {

            close();

        } else {

            open(modelKey);

        }

    }


    /* ========================================================
       IDENTITY INTEGRATION
    ======================================================== */

    function connectIdentity() {

        window.addEventListener(
            "haldo:identity:changed",
            function (event) {

                const detail =
                    event.detail || {};

                if (
                    detail.avatarMode &&
                    CONFIG.models[detail.avatarMode]
                ) {

                    setModel(
                        detail.avatarMode
                    );

                }

                if (
                    detail.emotion
                ) {

                    setEmotion(
                        detail.emotion
                    );

                }

            }
        );


        window.addEventListener(
            "haldo:identity:emotion",
            function (event) {

                if (
                    event.detail &&
                    event.detail.emotion
                ) {

                    setEmotion(
                        event.detail.emotion
                    );

                }

            }
        );


        window.addEventListener(
            "haldo:identity:activity",
            function (event) {

                if (
                    event.detail &&
                    event.detail.activity
                ) {

                    setState(
                        event.detail.activity
                    );

                }

            }
        );

    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    const API = {

        version: CONFIG.version,

        config: CONFIG,

        open: open,

        close: close,

        toggle: toggle,

        initialize: initializeScene,

        setModel: setModel,

        registerModel: registerModel,

        playAnimation: playAnimation,

        setEmotion: setEmotion,

        setState: setState,

        resize: resize,

        getStatus: function () {

            return {

                initialized:
                    state.initialized,

                opened:
                    state.opened,

                loading:
                    state.loading,

                loaded:
                    state.loaded,

                model:
                    state.currentModelKey,

                animation:
                    state.currentAnimation,

                emotion:
                    state.currentEmotion,

                activity:
                    state.currentActivity,

                error:
                    state.error
                        ? state.error.message
                        : null

            };

        },

        getModels: function () {

            return Object.assign(
                {},
                CONFIG.models
            );

        },

        getAnimations: function () {

            if (
                !state.modelRoot ||
                !state.modelRoot.userData
            ) {

                return [];

            }

            return (
                state.modelRoot.userData.animations ||
                []
            ).map(
                clip => clip.name
            );

        }

    };


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    connectIdentity();

    HD.Human3D = API;

    log(
        "HalDo Human 3D Engine",
        CONFIG.version,
        "bereit."
    );

    EVENTS.emit(
        "ready",
        {
            version: CONFIG.version
        }
    );


})(window, document);
