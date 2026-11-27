/* ============================================================
   HALDO LIVING IDENTITY ENGINE
   Version: 1.0.0
   Project: HalDo AI OS Pro Max
   Author: HalDo AI
   Description:
   - Multiple avatar identities
   - Animated living face
   - Logo animation modes
   - Emotion and activity states
   - Persistent user preferences
   - Independent UI integration
   ============================================================ */

(function (window, document) {
    "use strict";

    if (window.HalDoLivingIdentityLoaded) {
        console.warn("[HalDo Identity] Already loaded.");
        return;
    }

    window.HalDoLivingIdentityLoaded = true;

    window.HalDo = window.HalDo || {};

    const VERSION = "1.0.0";
    const STORAGE_KEY = "haldo_living_identity_v1";

    const DEFAULTS = {
        avatar: "cyborg",
        logo: "energy",
        emotion: "friendly",
        animation: true,
        visible: true,
        logoPath: "logo.png"
    };

    const AVATARS = {
        human: {
            name: "Human",
            icon: "👨",
            description: "Natürliches menschliches Erscheinungsbild",
            face: "human"
        },

        android: {
            name: "Android",
            icon: "🤖",
            description: "Fortschrittlicher humanoider Android",
            face: "android"
        },

        cyborg: {
            name: "Cyborg",
            icon: "🦾",
            description: "Menschliche und technische Identität",
            face: "cyborg"
        },

        robot: {
            name: "Robot",
            icon: "⚙️",
            description: "Technologischer Roboter",
            face: "robot"
        },

        hologram: {
            name: "Hologram",
            icon: "💠",
            description: "Futuristische holografische Erscheinung",
            face: "hologram"
        }
    };

    const LOGOS = {
        original: {
            name: "Original",
            icon: "🦚"
        },

        rotation: {
            name: "Rotation",
            icon: "🔄"
        },

        energy: {
            name: "Energy",
            icon: "⚡"
        },

        hologram: {
            name: "Hologram",
            icon: "💠"
        },

        portal: {
            name: "Portal",
            icon: "🌀"
        },

        cyborg: {
            name: "Cyborg",
            icon: "🦾"
        }
    };

    const EMOTIONS = {
        friendly: {
            name: "Freundlich",
            icon: "😊"
        },

        happy: {
            name: "Glücklich",
            icon: "😄"
        },

        thinking: {
            name: "Nachdenklich",
            icon: "🤔"
        },

        surprised: {
            name: "Überrascht",
            icon: "😮"
        },

        serious: {
            name: "Ernst",
            icon: "😐"
        },

        listening: {
            name: "Zuhören",
            icon: "👂"
        },

        speaking: {
            name: "Sprechen",
            icon: "🗣️"
        }
    };

    let settings = loadSettings();
    let panel = null;
    let avatarElement = null;
    let styleElement = null;
    let observer = null;
    let animationTimer = null;
    let currentEmotion = settings.emotion;

    /* ========================================================
       STORAGE
       ======================================================== */

    function loadSettings() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

            return Object.assign({}, DEFAULTS, saved);
        } catch (error) {
            console.warn("[HalDo Identity] Storage error:", error);
            return Object.assign({}, DEFAULTS);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.warn("[HalDo Identity] Could not save settings:", error);
        }
    }

    /* ========================================================
       CSS ENGINE
       ======================================================== */

    function injectStyles() {
        if (document.getElementById("haldo-living-identity-style")) {
            return;
        }

        styleElement = document.createElement("style");
        styleElement.id = "haldo-living-identity-style";

        styleElement.textContent = `
        #haldo-identity-trigger {
            border: 1px solid rgba(0,220,255,.45);
            background: rgba(0,30,55,.65);
            color: #fff;
            border-radius: 12px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 8px;
            transition: .25s ease;
        }

        #haldo-identity-trigger:hover {
            background: rgba(0,180,255,.25);
            box-shadow: 0 0 18px rgba(0,210,255,.5);
        }

        #haldo-identity-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 18px;
            background: rgba(0,0,12,.82);
            backdrop-filter: blur(14px);
            font-family: Arial, sans-serif;
        }

        #haldo-identity-overlay.active {
            display: flex;
        }

        #haldo-identity-panel {
            width: min(960px, 100%);
            max-height: 92vh;
            overflow-y: auto;
            color: #fff;
            border: 1px solid rgba(0,220,255,.55);
            border-radius: 22px;
            background:
                radial-gradient(
                    circle at 50% 0%,
                    rgba(0,130,220,.22),
                    transparent 55%
                ),
                linear-gradient(145deg,#071326,#020611 75%);
            box-shadow:
                0 0 45px rgba(0,160,255,.18),
                inset 0 0 35px rgba(0,100,255,.07);
            padding: 24px;
            box-sizing: border-box;
        }

        #haldo-identity-panel * {
            box-sizing: border-box;
        }

        .haldo-id-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255,255,255,.12);
            padding-bottom: 15px;
            margin-bottom: 22px;
        }

        .haldo-id-header h2 {
            margin: 0;
            font-size: 22px;
            color: #65eaff;
            letter-spacing: 1px;
        }

        .haldo-id-close {
            border: 1px solid rgba(255,255,255,.2);
            background: rgba(255,255,255,.08);
            color: white;
            width: 38px;
            height: 38px;
            border-radius: 12px;
            font-size: 21px;
            cursor: pointer;
        }

        .haldo-id-content {
            display: grid;
            grid-template-columns: minmax(220px, .9fr) 1.1fr;
            gap: 25px;
        }

        .haldo-id-preview {
            min-height: 340px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            border: 1px solid rgba(0,200,255,.25);
            background:
                radial-gradient(
                    circle,
                    rgba(0,140,255,.18),
                    rgba(0,0,0,.15) 70%
                );
            overflow: hidden;
            position: relative;
        }

        .haldo-id-preview::before {
            content: "";
            position: absolute;
            width: 230px;
            height: 230px;
            border: 1px solid rgba(0,220,255,.25);
            border-radius: 50%;
            animation: haldoOrbit 12s linear infinite;
        }

        .haldo-id-preview::after {
            content: "";
            position: absolute;
            width: 280px;
            height: 280px;
            border: 1px dashed rgba(150,80,255,.3);
            border-radius: 50%;
            animation: haldoOrbit 18s linear infinite reverse;
        }

        .haldo-id-avatar {
            position: relative;
            z-index: 2;
            width: 170px;
            height: 205px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            animation: haldoBreathing 4s ease-in-out infinite;
            filter: drop-shadow(0 0 18px rgba(0,220,255,.35));
        }

        .haldo-id-head {
            width: 130px;
            height: 150px;
            border-radius: 48% 48% 43% 43%;
            position: relative;
            background:
                linear-gradient(135deg,#b5d4e5,#527d9c 48%,#132f4b);
            border: 2px solid rgba(130,225,255,.8);
            box-shadow:
                inset -12px -8px 22px rgba(0,0,0,.45),
                0 0 20px rgba(0,190,255,.3);
            transition: .3s ease;
        }

        .haldo-id-face-human {
            background:
                linear-gradient(135deg,#e8b99e,#c98770 55%,#805347);
        }

        .haldo-id-face-android {
            background:
                linear-gradient(135deg,#e2e8ee,#8298aa 55%,#273b52);
            border-radius: 44% 44% 35% 35%;
        }

        .haldo-id-face-robot {
            background:
                linear-gradient(135deg,#b9c6d0,#53677a 55%,#1c2d40);
            border-radius: 25%;
        }

        .haldo-id-face-hologram {
            background:
                linear-gradient(135deg,rgba(0,240,255,.55),rgba(40,40,255,.2));
            box-shadow:
                0 0 30px #00dfff,
                inset 0 0 25px rgba(255,255,255,.4);
        }

        .haldo-id-eyes {
            position: absolute;
            top: 48px;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 29px;
        }

        .haldo-id-eye {
            width: 17px;
            height: 11px;
            border-radius: 50%;
            background: #00f0ff;
            box-shadow: 0 0 12px #00dfff;
            animation: haldoBlink 5s infinite;
        }

        .haldo-id-face-human .haldo-id-eye {
            background: #253f55;
            box-shadow: none;
        }

        .haldo-id-mouth {
            position: absolute;
            left: 50%;
            bottom: 32px;
            transform: translateX(-50%);
            width: 34px;
            height: 7px;
            border-radius: 0 0 50% 50%;
            border-bottom: 3px solid #00eaff;
        }

        .haldo-id-face-human .haldo-id-mouth {
            border-color: #703b40;
        }

        .haldo-id-face-robot .haldo-id-mouth {
            width: 42px;
            border-bottom: 3px dashed #00eaff;
        }

        .haldo-id-avatar.speaking .haldo-id-mouth {
            animation: haldoTalking .22s ease-in-out infinite alternate;
        }

        .haldo-id-avatar.thinking .haldo-id-eye {
            transform: translateY(-5px);
        }

        .haldo-id-avatar.surprised .haldo-id-eye {
            height: 18px;
        }

        .haldo-id-avatar.serious .haldo-id-mouth {
            border-radius: 0;
            width: 27px;
        }

        .haldo-id-avatar.listening .haldo-id-head {
            filter: brightness(1.15);
        }

        .haldo-id-body {
            width: 108px;
            height: 55px;
            margin-top: -3px;
            border-radius: 35px 35px 12px 12px;
            border: 2px solid rgba(0,220,255,.65);
            background:
                linear-gradient(135deg,#214e70,#091b32);
            box-shadow: 0 0 15px rgba(0,200,255,.3);
        }

        .haldo-id-name {
            position: relative;
            z-index: 3;
            margin-top: 25px;
            font-weight: bold;
            color: #70eaff;
            letter-spacing: 2px;
            text-shadow: 0 0 12px #00bfff;
        }

        .haldo-id-section {
            margin-bottom: 23px;
        }

        .haldo-id-section h3 {
            margin: 0 0 12px;
            color: #80eaff;
            font-size: 15px;
            letter-spacing: .5px;
        }

        .haldo-id-options {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 9px;
        }

        .haldo-id-option {
            text-align: left;
            min-height: 66px;
            padding: 11px;
            border-radius: 13px;
            border: 1px solid rgba(255,255,255,.13);
            background: rgba(255,255,255,.045);
            color: white;
            cursor: pointer;
            transition: .2s ease;
        }

        .haldo-id-option:hover {
            background: rgba(0,170,255,.14);
            border-color: rgba(0,220,255,.6);
        }

        .haldo-id-option.selected {
            border-color: #00dfff;
            background: rgba(0,160,255,.19);
            box-shadow: 0 0 13px rgba(0,200,255,.15);
        }

        .haldo-id-option strong {
            display: block;
            margin-bottom: 4px;
            font-size: 13px;
        }

        .haldo-id-option small {
            color: #a8c4d5;
            font-size: 11px;
        }

        .haldo-id-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,.12);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
        }

        .haldo-id-primary {
            border: 1px solid #00dfff;
            background: linear-gradient(135deg,#087da8,#172c75);
            color: white;
            padding: 11px 20px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: bold;
        }

        .haldo-id-primary:hover {
            box-shadow: 0 0 18px rgba(0,200,255,.4);
        }

        .haldo-id-status {
            color: #8edff5;
            font-size: 12px;
        }

        .haldo-id-logo {
            max-width: 90px;
            max-height: 90px;
            object-fit: contain;
            margin-bottom: 10px;
            animation: haldoLogoEnergy 4s ease-in-out infinite;
        }

        .haldo-id-logo.rotation {
            animation: haldoLogoRotate 8s linear infinite;
        }

        .haldo-id-logo.energy {
            animation: haldoLogoEnergy 2s ease-in-out infinite;
        }

        .haldo-id-logo.hologram {
            animation: haldoLogoHolo 3s ease-in-out infinite;
        }

        .haldo-id-logo.portal {
            animation: haldoLogoPortal 5s linear infinite;
        }

        .haldo-id-logo.cyborg {
            animation: haldoLogoCyborg 3s ease-in-out infinite;
        }

        .haldo-id-no-logo {
            width: 90px;
            height: 90px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 55px;
            margin-bottom: 10px;
        }

        @keyframes haldoOrbit {
            to { transform: rotate(360deg); }
        }

        @keyframes haldoBreathing {
            0%,100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.015); }
        }

        @keyframes haldoBlink {
            0%,45%,49%,100% { transform: scaleY(1); }
            47% { transform: scaleY(.08); }
        }

        @keyframes haldoTalking {
            from { height: 5px; width: 24px; }
            to { height: 19px; width: 32px; }
        }

        @keyframes haldoLogoRotate {
            to { transform: rotateY(360deg); }
        }

        @keyframes haldoLogoEnergy {
            0%,100% {
                filter: drop-shadow(0 0 5px #00dfff);
                transform: scale(1);
            }
            50% {
                filter: drop-shadow(0 0 25px #00dfff);
                transform: scale(1.09);
            }
        }

        @keyframes haldoLogoHolo {
            0%,100% {
                opacity: .65;
                filter: hue-rotate(0deg);
            }
            50% {
                opacity: 1;
                filter: hue-rotate(90deg);
            }
        }

        @keyframes haldoLogoPortal {
            to { transform: rotate(360deg) scale(1.08); }
        }

        @keyframes haldoLogoCyborg {
            0%,100% { filter: drop-shadow(0 0 5px #00eaff); }
            50% { filter: drop-shadow(0 0 22px #b000ff); }
        }

        @media (max-width:650px) {
            #haldo-identity-panel {
                padding: 15px;
            }

            .haldo-id-content {
                grid-template-columns: 1fr;
            }

            .haldo-id-preview {
                min-height: 270px;
            }

            .haldo-id-options {
                grid-template-columns: 1fr 1fr;
            }

            .haldo-id-header h2 {
                font-size: 17px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #haldo-identity-overlay *,
            #haldo-identity-overlay *::before,
            #haldo-identity-overlay *::after {
                animation-duration: .01ms !important;
                animation-iteration-count: 1 !important;
            }
        }

        body.haldo-identity-no-animation #haldo-identity-overlay *,
        body.haldo-identity-no-animation #haldo-identity-overlay *::before,
        body.haldo-identity-no-animation #haldo-identity-overlay *::after {
            animation: none !important;
        }
        `;

        document.head.appendChild(styleElement);
    }

    /* ========================================================
       UI CREATION
       ======================================================== */

    function createPanel() {
        if (panel) return;

        panel = document.createElement("div");
        panel.id = "haldo-identity-overlay";

        panel.innerHTML = `
            <div id="haldo-identity-panel">

                <div class="haldo-id-header">
                    <h2>✨ HALDO LIVING IDENTITY</h2>
                    <button class="haldo-id-close"
                        id="haldo-id-close"
                        aria-label="Schließen">×</button>
                </div>

                <div class="haldo-id-content">

                    <div class="haldo-id-preview">

                        <div id="haldo-id-logo-area"></div>

                        <div class="haldo-id-avatar"
                            id="haldo-id-avatar">

                            <div class="haldo-id-head"
                                id="haldo-id-head">

                                <div class="haldo-id-eyes">
                                    <div class="haldo-id-eye"></div>
                                    <div class="haldo-id-eye"></div>
                                </div>

                                <div class="haldo-id-mouth"
                                    id="haldo-id-mouth"></div>
                            </div>

                            <div class="haldo-id-body"></div>

                        </div>

                        <div class="haldo-id-name">HALDO AI</div>
                    </div>

                    <div class="haldo-id-controls">

                        <div class="haldo-id-section">
                            <h3>🤖 Erscheinungsform</h3>
                            <div class="haldo-id-options"
                                id="haldo-avatar-options"></div>
                        </div>

                        <div class="haldo-id-section">
                            <h3>✨ Logo-Animation</h3>
                            <div class="haldo-id-options"
                                id="haldo-logo-options"></div>
                        </div>

                        <div class="haldo-id-section">
                            <h3>😊 Emotion</h3>
                            <div class="haldo-id-options"
                                id="haldo-emotion-options"></div>
                        </div>

                    </div>
                </div>

                <div class="haldo-id-footer">

                    <span class="haldo-id-status"
                        id="haldo-id-status">
                        HalDo Identity Engine ${VERSION}
                    </span>

                    <button class="haldo-id-primary"
                        id="haldo-id-apply">
                        ✓ Einstellungen übernehmen
                    </button>

                </div>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById("haldo-id-close")
            .addEventListener("click", close);

        document.getElementById("haldo-id-apply")
            .addEventListener("click", function () {
                saveSettings();
                updateStatus("Einstellungen gespeichert ✓");
                applySettings();
            });

        panel.addEventListener("click", function (event) {
            if (event.target === panel) {
                close();
            }
        });

        renderOptions();
        updatePreview();
    }

    /* ========================================================
       OPTIONS
       ======================================================== */

    function createOption(title, icon, description, selected, callback) {
        const button = document.createElement("button");

        button.className =
            "haldo-id-option" + (selected ? " selected" : "");

        button.type = "button";

        const strong = document.createElement("strong");
        strong.textContent = icon + " " + title;

        const small = document.createElement("small");
        small.textContent = description || "";

        button.appendChild(strong);
        button.appendChild(small);

        button.addEventListener("click", callback);

        return button;
    }

    function renderOptions() {
        renderAvatarOptions();
        renderLogoOptions();
        renderEmotionOptions();
    }

    function renderAvatarOptions() {
        const container =
            document.getElementById("haldo-avatar-options");

        if (!container) return;

        container.innerHTML = "";

        Object.keys(AVATARS).forEach(function (key) {
            const item = AVATARS[key];

            container.appendChild(
                createOption(
                    item.name,
                    item.icon,
                    item.description,
                    settings.avatar === key,
                    function () {
                        setAvatarMode(key);
                    }
                )
            );
        });
    }

    function renderLogoOptions() {
        const container =
            document.getElementById("haldo-logo-options");

        if (!container) return;

        container.innerHTML = "";

        Object.keys(LOGOS).forEach(function (key) {
            const item = LOGOS[key];

            container.appendChild(
                createOption(
                    item.name,
                    item.icon,
                    "Logo-Erscheinung",
                    settings.logo === key,
                    function () {
                        setLogoMode(key);
                    }
                )
            );
        });
    }

    function renderEmotionOptions() {
        const container =
            document.getElementById("haldo-emotion-options");

        if (!container) return;

        container.innerHTML = "";

        Object.keys(EMOTIONS).forEach(function (key) {
            const item = EMOTIONS[key];

            container.appendChild(
                createOption(
                    item.name,
                    item.icon,
                    "Gesichtsausdruck",
                    settings.emotion === key,
                    function () {
                        setEmotion(key);
                    }
                )
            );
        });
    }

    /* ========================================================
       PREVIEW
       ======================================================== */

    function updatePreview() {
        const head = document.getElementById("haldo-id-head");
        const avatar = document.getElementById("haldo-id-avatar");
        const logoArea = document.getElementById("haldo-id-logo-area");

        if (!head || !avatar || !logoArea) return;

        head.className = "haldo-id-head haldo-id-face-" +
            settings.avatar;

        avatar.className = "haldo-id-avatar " +
            settings.emotion;

        if (settings.avatar === "cyborg") {
            head.style.boxShadow =
                "inset -12px -8px 22px rgba(0,0,0,.45)," +
                "0 0 25px rgba(0,220,255,.65)";
        } else {
            head.style.boxShadow = "";
        }

        renderLogoPreview(logoArea);

        if (settings.animation) {
            document.body.classList.remove(
                "haldo-identity-no-animation"
            );
        } else {
            document.body.classList.add(
                "haldo-identity-no-animation"
            );
        }
    }

    function renderLogoPreview(container) {
        container.innerHTML = "";

        const image = document.createElement("img");

        image.className = "haldo-id-logo " + settings.logo;
        image.alt = "HalDo Logo";
        image.src = settings.logoPath;

        image.onerror = function () {
            container.innerHTML = "";

            const fallback = document.createElement("div");
            fallback.className = "haldo-id-no-logo";
            fallback.textContent = "🦚";

            container.appendChild(fallback);
        };

        container.appendChild(image);
    }

    /* ========================================================
       PUBLIC API
       ======================================================== */

    function setAvatarMode(mode) {
        if (!AVATARS[mode]) {
            console.warn("[HalDo Identity] Unknown avatar:", mode);
            return false;
        }

        settings.avatar = mode;

        saveSettings();
        renderAvatarOptions();
        applySettings();

        return true;
    }

    function setLogoMode(mode) {
        if (!LOGOS[mode]) {
            console.warn("[HalDo Identity] Unknown logo:", mode);
            return false;
        }

        settings.logo = mode;

        saveSettings();
        updatePreview();
        renderLogoOptions();

        return true;
    }

    function setEmotion(emotion) {
        if (!EMOTIONS[emotion]) {
            console.warn("[HalDo Identity] Unknown emotion:", emotion);
            return false;
        }

        currentEmotion = emotion;
        settings.emotion = emotion;

        saveSettings();
        renderEmotionOptions();
        applySettings();

        return true;
    }

    function setAnimation(enabled) {
        settings.animation = Boolean(enabled);

        saveSettings();
        updatePreview();

        return settings.animation;
    }

    function setLogoPath(path) {
        if (typeof path !== "string" || !path.trim()) {
            return false;
        }

        settings.logoPath = path.trim();

        saveSettings();
        updatePreview();

        return true;
    }

    function setVisible(enabled) {
        settings.visible = Boolean(enabled);

        saveSettings();

        if (avatarElement) {
            avatarElement.style.display =
                settings.visible ? "" : "none";
        }

        return settings.visible;
    }

    function getSettings() {
        return Object.assign({}, settings);
    }

    function getAvatarModes() {
        return Object.assign({}, AVATARS);
    }

    function getLogoModes() {
        return Object.assign({}, LOGOS);
    }

    function getEmotions() {
        return Object.assign({}, EMOTIONS);
    }

    function open() {
        createPanel();

        panel.classList.add("active");

        updatePreview();

        return true;
    }

    function close() {
        if (panel) {
            panel.classList.remove("active");
        }

        return true;
    }

    function toggle() {
        if (!panel || !panel.classList.contains("active")) {
            return open();
        }

        return close();
    }

    function updateStatus(message) {
        const element =
            document.getElementById("haldo-id-status");

        if (element) {
            element.textContent = message;
        }
    }

    /* ========================================================
       TOPBAR INTEGRATION
       ======================================================== */

    function installTrigger() {
        if (document.getElementById("haldo-identity-trigger")) {
            return;
        }

        const actions = document.getElementById("topbar-actions");

        if (!actions) {
            return;
        }

        const button = document.createElement("button");

        button.id = "haldo-identity-trigger";
        button.type = "button";
        button.title = "HalDo Erscheinungsform";
        button.textContent = "🦾 CYBORG";

        button.addEventListener("click", open);

        actions.appendChild(button);
    }

    function installTriggerWhenReady() {
        installTrigger();

        if (document.getElementById("haldo-identity-trigger")) {
            if (observer) {
                observer.disconnect();
                observer = null;
            }

            return;
        }

        if (!observer && document.body) {
            observer = new MutationObserver(function () {
                installTrigger();

                if (document.getElementById("haldo-identity-trigger")) {
                    observer.disconnect();
                    observer = null;
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /* ========================================================
       EXISTING AVATAR COMPATIBILITY
       ======================================================== */

    function connectExistingAvatar() {
        const existing = window.HalDo.Avatar;

        if (!existing || existing.__livingIdentityConnected) {
            return;
        }

        try {
            if (typeof existing.setEmotion === "function") {
                existing.setEmotion(currentEmotion);
            }

            if (typeof existing.setMode === "function") {
                const mode =
                    settings.avatar === "human" ? "human" : "cyborg";

                existing.setMode(mode);
            }

            existing.__livingIdentityConnected = true;

        } catch (error) {
            console.warn(
                "[HalDo Identity] Existing Avatar connection:",
                error
            );
        }
    }

    function applySettings() {
        updatePreview();
        connectExistingAvatar();

        const event = new CustomEvent(
            "haldo:identity:changed",
            {
                detail: getSettings()
            }
        );

        window.dispatchEvent(event);
    }

    /* ========================================================
       SPEECH AND ACTIVITY STATES
       ======================================================== */

    function startSpeaking() {
        setEmotion("speaking");
    }

    function stopSpeaking() {
        setEmotion("friendly");
    }

    function startListening() {
        setEmotion("listening");
    }

    function startThinking() {
        setEmotion("thinking");
    }

    function setActivity(activity) {
        const allowed = [
            "friendly",
            "happy",
            "thinking",
            "surprised",
            "serious",
            "listening",
            "speaking"
        ];

        if (!allowed.includes(activity)) {
            return false;
        }

        return setEmotion(activity);
    }

    /* ========================================================
       INITIALIZATION
       ======================================================== */

    function init() {
        injectStyles();

        installTriggerWhenReady();

        applySettings();

        console.info(
            "[HalDo Living Identity] Version " +
            VERSION +
            " initialized."
        );
    }

    const API = {
        version: VERSION,

        open: open,
        close: close,
        toggle: toggle,

        setAvatarMode: setAvatarMode,
        setLogoMode: setLogoMode,
        setEmotion: setEmotion,
        setAnimation: setAnimation,
        setLogoPath: setLogoPath,
        setVisible: setVisible,

        getSettings: getSettings,
        getAvatarModes: getAvatarModes,
        getLogoModes: getLogoModes,
        getEmotions: getEmotions,

        startSpeaking: startSpeaking,
        stopSpeaking: stopSpeaking,
        startListening: startListening,
        startThinking: startThinking,
        setActivity: setActivity,

        applySettings: applySettings
    };

    window.HalDo.LivingIdentity = API;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }

})(window, document);
