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

        pendingModelKey: null,

        modelRequestId: 0,

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

        faceMeshes: [],

        faceExpressionWeights: Object.create(null),

        emotionFaceExpressionNames: [],

        visemeTimeline: null,

        visemeExpressionWeights: Object.create(null),

        visemeExpressionNames: [],

        visemeCurrentTimeMs: null,

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

                function resolveLoader() {
                    if (THREE.GLTFLoader) {
                        resolve(THREE.GLTFLoader);
                        return true;
                    }
                    return false;
                }

                function rejectLoader(message) {
                    reject(new Error(message));
                }

                if (existing) {
                    // Ein vorhandenes Script kann sein load-Event bereits
                    // ausgelöst haben. Zuerst den tatsächlichen Zustand prüfen,
                    // statt ausschließlich auf ein zukünftiges Event zu warten.
                    if (resolveLoader()) {
                        existing.dataset.haldoLoadState = "loaded";
                        return;
                    }

                    if (existing.dataset.haldoLoadState === "failed") {
                        rejectLoader(
                            "GLTFLoader konnte zuvor nicht geladen werden."
                        );
                        return;
                    }

                    if (
                        existing.dataset.haldoLoadState === "loaded" ||
                        existing.readyState === "complete"
                    ) {
                        rejectLoader(
                            "GLTFLoader-Script ist beendet, aber THREE.GLTFLoader fehlt."
                        );
                        return;
                    }

                    existing.addEventListener(
                        "load",
                        function () {
                            existing.dataset.haldoLoadState = "loaded";
                            if (!resolveLoader()) {
                                rejectLoader(
                                    "GLTFLoader wurde geladen, aber nicht registriert."
                                );
                            }
                        },
                        { once: true }
                    );

                    existing.addEventListener(
                        "error",
                        function () {
                            existing.dataset.haldoLoadState = "failed";
                            rejectLoader(
                                "GLTFLoader konnte nicht geladen werden."
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
                script.dataset.haldoLoadState =
                    "loading";

                script.onload = function () {
                    script.dataset.haldoLoadState = "loaded";

                    if (!resolveLoader()) {
                        rejectLoader(
                            "Three.GLTFLoader ist nach dem Laden nicht verfügbar."
                        );
                    }
                };

                script.onerror = function () {
                    script.dataset.haldoLoadState = "failed";

                    rejectLoader(
                        "Der GLTFLoader konnte nicht geladen werden. " +
                        "Bitte Internetverbindung und CDN prüfen."
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

        state.faceMeshes = [];


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
       FACE MORPH TARGETS
    ======================================================== */

    function collectFaceMeshes(model) {

        const meshes = [];

        if (!model || typeof model.traverse !== "function") {
            return meshes;
        }

        model.traverse(function (object) {

            if (
                !object ||
                !object.isMesh ||
                !object.morphTargetDictionary ||
                !Array.isArray(object.morphTargetInfluences)
            ) {
                return;
            }

            meshes.push({
                mesh: object,
                dictionary: object.morphTargetDictionary,
                influences: object.morphTargetInfluences
            });

        });

        return meshes;

    }


    function writeFaceExpression(name, weight, layer) {

        let applied = 0;

        state.faceMeshes.forEach(function (entry) {

            const index = entry.dictionary[name];

            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < entry.influences.length
            ) {

                entry.influences[index] = weight;
                applied += 1;

            }

        });

        if (applied > 0) {

            EVENTS.emit("face-expression-changed", {
                name: name,
                weight: weight,
                layer: layer || "base",
                meshes: applied
            });

        }

        return applied > 0;

    }


    function applyFaceExpression(name, weight) {

        if (
            typeof name !== "string" ||
            !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(name) ||
            !Number.isFinite(weight)
        ) {
            return false;
        }

        const normalizedWeight = Math.max(0, Math.min(1, weight));
        state.faceExpressionWeights[name] = normalizedWeight;

        // A live viseme takes priority over the resting/emotion expression.
        const effectiveWeight = Object.prototype.hasOwnProperty.call(
            state.visemeExpressionWeights,
            name
        )
            ? state.visemeExpressionWeights[name]
            : normalizedWeight;

        return writeFaceExpression(name, effectiveWeight, "base");

    }


    function setFaceExpressions(expressions) {

        if (
            !expressions ||
            typeof expressions !== "object" ||
            Array.isArray(expressions)
        ) {
            return 0;
        }

        let applied = 0;

        Object.keys(expressions).forEach(function (name) {

            if (applyFaceExpression(name, expressions[name])) {
                applied += 1;
            }

        });

        return applied;

    }


    function resetFaceExpressions() {

        let reset = 0;

        Object.keys(state.faceExpressionWeights).forEach(function (name) {

            if (applyFaceExpression(name, 0)) {
                reset += 1;
            }

        });

        state.faceExpressionWeights = Object.create(null);
        state.emotionFaceExpressionNames = [];

        return reset;

    }


    function getFaceExpressions() {

        const expressions = Object.create(null);

        state.faceMeshes.forEach(function (entry) {

            Object.keys(entry.dictionary).forEach(function (name) {

                const index = entry.dictionary[name];

                if (
                    !Object.prototype.hasOwnProperty.call(expressions, name) &&
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < entry.influences.length
                ) {

                    expressions[name] = entry.influences[index] || 0;

                }

            });

        });

        return expressions;

    }


    function applyEmotionFace(emotion) {

        const profiles = {
            friendly: { mouthSmile: 0.14 },
            happy: {
                mouthSmile: 0.58,
                eyeSquintLeft: 0.10,
                eyeSquintRight: 0.10
            },
            thinking: {
                browInnerUp: 0.22,
                mouthPucker: 0.04
            },
            surprised: {
                jawOpen: 0.18,
                eyeWideLeft: 0.62,
                eyeWideRight: 0.62,
                browInnerUp: 0.38
            },
            serious: {
                browDownLeft: 0.20,
                browDownRight: 0.20,
                mouthPress: 0.10
            },
            listening: { browInnerUp: 0.10 },
            // No artificial jaw movement: real speech must be driven by timed visemes.
            speaking: {},
            calm: { mouthSmile: 0.06 }
        };

        const profile = profiles[emotion];
        if (!profile) return 0;

        state.emotionFaceExpressionNames.forEach(function (name) {
            applyFaceExpression(name, 0);
        });

        state.emotionFaceExpressionNames = Object.keys(profile);

        return setFaceExpressions(profile);

    }


    /* ========================================================
       AUDIO-CLOCKED VISEME TIMELINE
       The caller supplies real timestamps from the same audio clock.
    ======================================================== */

    function setVisemeExpression(name, weight) {

        if (
            typeof name !== "string" ||
            !/^(?:jaw|mouth)[A-Za-z0-9_]{0,61}$|^viseme_[A-Za-z0-9_]{1,58}$/.test(name) ||
            !Number.isFinite(weight)
        ) {
            return false;
        }

        const normalizedWeight = Math.max(0, Math.min(1, weight));
        state.visemeExpressionWeights[name] = normalizedWeight;

        return writeFaceExpression(name, normalizedWeight, "viseme");

    }


    function clearVisemeTimeline() {

        const names = state.visemeExpressionNames.slice();

        state.visemeTimeline = null;
        state.visemeExpressionNames = [];
        state.visemeExpressionWeights = Object.create(null);
        state.visemeCurrentTimeMs = null;

        names.forEach(function (name) {

            const baseWeight = Number.isFinite(state.faceExpressionWeights[name])
                ? state.faceExpressionWeights[name]
                : 0;

            writeFaceExpression(name, baseWeight, "base");

        });

        return names.length;

    }


    function setVisemeTimeline(frames) {

        if (!Array.isArray(frames) || frames.length < 2 || frames.length > 12000) {
            return false;
        }

        const normalizedFrames = [];
        const expressionNames = new Set();
        let previousTime = -1;

        for (let i = 0; i < frames.length; i += 1) {

            const frame = frames[i];

            if (
                !frame ||
                typeof frame !== "object" ||
                Array.isArray(frame) ||
                !Number.isFinite(frame.timeMs) ||
                frame.timeMs < 0 ||
                frame.timeMs > 3600000 ||
                frame.timeMs <= previousTime ||
                !frame.expressions ||
                typeof frame.expressions !== "object" ||
                Array.isArray(frame.expressions)
            ) {
                return false;
            }

            const expressions = Object.create(null);
            const names = Object.keys(frame.expressions);

            if (!names.length) return false;

            for (let j = 0; j < names.length; j += 1) {

                const name = names[j];
                const weight = frame.expressions[name];

                if (
                    !/^(?:jaw|mouth)[A-Za-z0-9_]{0,61}$|^viseme_[A-Za-z0-9_]{1,58}$/.test(name) ||
                    !Number.isFinite(weight) ||
                    weight < 0 ||
                    weight > 1
                ) {
                    return false;
                }

                expressions[name] = weight;
                expressionNames.add(name);

            }

            normalizedFrames.push({
                timeMs: frame.timeMs,
                expressions: expressions
            });

            previousTime = frame.timeMs;

        }

        clearVisemeTimeline();

        state.visemeTimeline = normalizedFrames;
        state.visemeExpressionNames = Array.from(expressionNames);
        updateVisemes(normalizedFrames[0].timeMs);

        EVENTS.emit("viseme-timeline-started", {
            frameCount: normalizedFrames.length,
            durationMs: normalizedFrames[normalizedFrames.length - 1].timeMs,
            expressions: state.visemeExpressionNames.slice()
        });

        return true;

    }


    function updateVisemes(audioTimeMs) {

        if (
            !state.visemeTimeline ||
            !Number.isFinite(audioTimeMs) ||
            audioTimeMs < 0
        ) {
            return 0;
        }

        const frames = state.visemeTimeline;
        const lastFrame = frames[frames.length - 1];

        if (audioTimeMs > lastFrame.timeMs) {
            clearVisemeTimeline();
            EVENTS.emit("viseme-timeline-ended", { timeMs: audioTimeMs });
            return 0;
        }

        let leftIndex = 0;
        let rightIndex = frames.length - 1;

        // Binary search for the first frame at or after the audio clock.
        while (leftIndex < rightIndex) {

            const middle = Math.floor((leftIndex + rightIndex) / 2);

            if (frames[middle].timeMs < audioTimeMs) {
                leftIndex = middle + 1;
            } else {
                rightIndex = middle;
            }

        }

        const right = frames[leftIndex];
        const left = leftIndex > 0 ? frames[leftIndex - 1] : right;
        const span = right.timeMs - left.timeMs;
        const amount = span > 0
            ? Math.max(0, Math.min(1, (audioTimeMs - left.timeMs) / span))
            : 0;

        state.visemeExpressionNames.forEach(function (name) {

            const from = Number.isFinite(left.expressions[name])
                ? left.expressions[name]
                : 0;
            const to = Number.isFinite(right.expressions[name])
                ? right.expressions[name]
                : 0;
            const weight = from + (to - from) * amount;

            setVisemeExpression(name, weight);

        });

        state.visemeCurrentTimeMs = audioTimeMs;

        return state.visemeExpressionNames.length;

    }


    function getVisemeStatus() {

        return {
            active: Boolean(state.visemeTimeline),
            frameCount: state.visemeTimeline ? state.visemeTimeline.length : 0,
            durationMs: state.visemeTimeline
                ? state.visemeTimeline[state.visemeTimeline.length - 1].timeMs
                : 0,
            currentTimeMs: state.visemeCurrentTimeMs,
            expressions: state.visemeExpressionNames.slice()
        };

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

        // Latest request wins: an earlier slow network response must not
        // replace a model that the user selected more recently.
        const requestId = ++state.modelRequestId;
        const previousModelRoot = state.modelRoot;
        const previousLoadedState = state.loaded;

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
            if (requestId !== state.modelRequestId) return false;

            const GLTFLoader =
                await loadGLTFLoader();
            if (requestId !== state.modelRequestId) return false;

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

            if (requestId !== state.modelRequestId) return false;

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

            state.faceMeshes = collectFaceMeshes(model);

            state.scene.add(model);

            Object.keys(state.faceExpressionWeights).forEach(function (name) {
                applyFaceExpression(name, state.faceExpressionWeights[name]);
            });

            // Reapply the current audio viseme layer to a newly committed avatar.
            Object.keys(state.visemeExpressionWeights).forEach(function (name) {
                setVisemeExpression(name, state.visemeExpressionWeights[name]);
            });


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

            state.pendingModelKey =
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

            // Ignore failures from requests superseded by a newer selection.
            if (requestId !== state.modelRequestId) return false;

            state.loading = false;

            // Keep the previous avatar usable when a replacement fails before
            // it has been committed to the scene.
            state.loaded = state.modelRoot === previousModelRoot
                ? previousLoadedState
                : false;

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

        const faceExpressionCount = applyEmotionFace(emotion);

        if (state.container) {

            state.container.dataset.emotion =
                emotion;

        }

        EVENTS.emit(
            "emotion-changed",
            {
                emotion: emotion,
                faceExpressionsApplied: faceExpressionCount
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

        const identitySettings =
            HD.LivingIdentity &&
            typeof HD.LivingIdentity.getSettings === "function"
                ? HD.LivingIdentity.getSettings()
                : {};

        const identityModel =
            identitySettings.avatar &&
            CONFIG.models[identitySettings.avatar]
                ? identitySettings.avatar
                : null;

        const selected =
            modelKey ||
            state.pendingModelKey ||
            state.currentModelKey ||
            identityModel ||
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

                const avatarMode =
                    detail.avatarMode ||
                    detail.avatar;

                if (
                    avatarMode &&
                    CONFIG.models[avatarMode]
                ) {

                    state.pendingModelKey = avatarMode;

                    if (state.opened) {
                        setModel(avatarMode);
                    }

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

        setFaceExpression: applyFaceExpression,

        setFaceExpressions: setFaceExpressions,

        getFaceExpressions: getFaceExpressions,

        resetFaceExpressions: resetFaceExpressions,

        setVisemeTimeline: setVisemeTimeline,

        updateVisemes: updateVisemes,

        clearVisemeTimeline: clearVisemeTimeline,

        getVisemeStatus: getVisemeStatus,

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

                selectedModel:
                    state.pendingModelKey ||
                    state.currentModelKey,

                animation:
                    state.currentAnimation,

                emotion:
                    state.currentEmotion,

                activity:
                    state.currentActivity,

                faceMeshCount:
                    state.faceMeshes.length,

                faceExpressionCount:
                    Object.keys(state.faceExpressionWeights).length,

                supportedFaceExpressions:
                    Object.keys(getFaceExpressions()),

                visemeActive:
                    Boolean(state.visemeTimeline),

                visemeExpressionCount:
                    state.visemeExpressionNames.length,

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
