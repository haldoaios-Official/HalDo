/* ============================================================
   HALDO LIVING IDENTITY ENGINE
   Version: 1.0.0
   HUMAN · ANDROID · CYBORG · HYBRID · HOLOGRAM
   Logo Engine + Avatar Selection + Persistent Preferences
   ============================================================ */

(() => {
  'use strict';

  const HalDo = window.HalDo = window.HalDo || {};

  if (HalDo.LivingIdentity) {
    console.warn('[HalDo Identity] Bereits initialisiert.');
    return;
  }

  const STORAGE_KEY = 'haldo_living_identity_v1';

  const MODES = {
    human: {
      id: 'human',
      name: 'HUMAN',
      icon: '👤',
      description: 'Natürliche menschliche Erscheinung',
      accent: '#35d9ff'
    },

    android: {
      id: 'android',
      name: 'ANDROID',
      icon: '🤖',
      description: 'Humanoider Roboter',
      accent: '#8caeff'
    },

    cyborg: {
      id: 'cyborg',
      name: 'CYBORG',
      icon: '⚡',
      description: 'Mensch und Technologie',
      accent: '#ff62d2'
    },

    hybrid: {
      id: 'hybrid',
      name: 'HYBRID',
      icon: '🧬',
      description: 'Mensch, Roboter und Cyborg',
      accent: '#b478ff'
    },

    hologram: {
      id: 'hologram',
      name: 'HOLOGRAM',
      icon: '🌌',
      description: 'Futuristische holografische Präsenz',
      accent: '#00f5ff'
    }
  };

  const LOGO_MODES = {
    original: {
      name: 'Original',
      icon: '🦚',
      animation: 'original'
    },

    portal: {
      name: 'Cosmic Portal',
      icon: '🌌',
      animation: 'portal'
    },

    rotation: {
      name: '3D Rotation',
      icon: '🌀',
      animation: 'rotation'
    },

    cyborg: {
      name: 'Cyborg Glow',
      icon: '⚡',
      animation: 'cyborg'
    },

    energy: {
      name: 'Energy Pulse',
      icon: '✨',
      animation: 'energy'
    },

    hologram: {
      name: 'Hologram',
      icon: '💠',
      animation: 'hologram'
    }
  };

  const DEFAULTS = {
    avatar: 'cyborg',
    logo: 'portal',
    logoVisible: true,
    animations: true,
    sound: true
  };

  let settings = loadSettings();
  let panel = null;
  let initialized = false;

  const listeners = new Set();

  /* ----------------------------------------------------------
     STORAGE
     ---------------------------------------------------------- */

  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return { ...DEFAULTS };
      }

      const parsed = JSON.parse(saved);

      return {
        ...DEFAULTS,
        ...parsed,

        avatar: MODES[parsed.avatar]
          ? parsed.avatar
          : DEFAULTS.avatar,

        logo: LOGO_MODES[parsed.logo]
          ? parsed.logo
          : DEFAULTS.logo
      };

    } catch (error) {
      console.warn('[HalDo Identity] Speicherfehler:', error);
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      return true;

    } catch (error) {
      console.error('[HalDo Identity] Speichern fehlgeschlagen:', error);
      return false;
    }
  }

  /* ----------------------------------------------------------
     EVENTS
     ---------------------------------------------------------- */

  function emit(eventName, detail = {}) {
    const event = new CustomEvent(
      'haldo:identity:' + eventName,
      {
        detail: {
          ...detail,
          settings: getSettings()
        }
      }
    );

    window.dispatchEvent(event);

    listeners.forEach(callback => {
      try {
        callback(eventName, event.detail);
      } catch (error) {
        console.error(error);
      }
    });

    if (HalDo.Bus?.emit) {
      try {
        HalDo.Bus.emit(
          'identity:' + eventName,
          event.detail
        );
      } catch (_) {}
    }
  }

  function subscribe(callback) {
    if (typeof callback !== 'function') {
      return () => {};
    }

    listeners.add(callback);

    return () => listeners.delete(callback);
  }

  /* ----------------------------------------------------------
     AVATAR MODE
     ---------------------------------------------------------- */

  function setAvatarMode(mode) {
    if (!MODES[mode]) {
      console.warn('[HalDo Identity] Unbekannter Avatar:', mode);
      return false;
    }

    settings.avatar = mode;

    saveSettings();
    applyAvatarMode();

    emit('avatar-changed', {
      mode,
      profile: MODES[mode]
    });

    return true;
  }

  function getAvatarMode() {
    return settings.avatar;
  }

  function getAvatarProfile() {
    return { ...MODES[settings.avatar] };
  }

  function applyAvatarMode() {
    document.documentElement.dataset.haldoAvatar =
      settings.avatar;

    document.body.dataset.haldoAvatar =
      settings.avatar;

    const profile = MODES[settings.avatar];

    document.documentElement.style.setProperty(
      '--haldo-identity-accent',
      profile.accent
    );

    /*
      Verbindung zur vorhandenen Avatar-API.

      Die alte Avatar-Implementierung wird nicht ersetzt.
      Wenn sie setMode() unterstützt, wird sie verwendet.
    */

    if (HalDo.Avatar?.setMode) {
      try {
        const legacyMode =
          settings.avatar === 'human'
            ? 'human'
            : 'cyborg';

        HalDo.Avatar.setMode(legacyMode);
      } catch (error) {
        console.warn(
          '[HalDo Identity] Avatar-Kompatibilität:',
          error
        );
      }
    }
  }

  /* ----------------------------------------------------------
     LOGO ENGINE
     ---------------------------------------------------------- */

  function getLogoElement() {
    return document.getElementById('logo-btn');
  }

  function applyLogoMode() {
    const logo = getLogoElement();

    if (!logo) return;

    logo.classList.remove(
      'haldo-logo-original',
      'haldo-logo-portal',
      'haldo-logo-rotation',
      'haldo-logo-cyborg',
      'haldo-logo-energy',
      'haldo-logo-hologram'
    );

    logo.classList.add(
      'haldo-logo-' + settings.logo
    );

    logo.classList.toggle(
      'haldo-logo-no-animation',
      !settings.animations
    );

    logo.setAttribute(
      'aria-label',
      'HalDo Logo – ' + LOGO_MODES[settings.logo].name
    );

    /*
      Das Originalbild wird nicht überschrieben.
      Wenn logo.png existiert, wird es verwendet.
      Andernfalls bleibt das bisherige Logo erhalten.
    */

    let image = logo.querySelector('img');

    if (!image && settings.logoVisible) {
      image = document.createElement('img');

      image.src = 'logo.png';
      image.alt = 'HalDo AI Logo';

      image.onerror = () => {
        image.remove();
        logo.dataset.logoFallback = 'true';
      };

      image.onload = () => {
        logo.dataset.logoFallback = 'false';
      };

      logo.prepend(image);
    }

    if (image) {
      image.style.display =
        settings.logoVisible ? 'block' : 'none';
    }
  }

  function setLogoMode(mode) {
    if (!LOGO_MODES[mode]) {
      return false;
    }

    settings.logo = mode;

    saveSettings();
    applyLogoMode();

    emit('logo-changed', {
      mode,
      profile: LOGO_MODES[mode]
    });

    return true;
  }

  /* ----------------------------------------------------------
     ANIMATION SETTINGS
     ---------------------------------------------------------- */

  function setAnimations(enabled) {
    settings.animations = Boolean(enabled);

    saveSettings();
    applyLogoMode();

    document.body.classList.toggle(
      'haldo-animations-disabled',
      !settings.animations
    );

    emit('animations-changed', {
      enabled: settings.animations
    });
  }

  function setLogoVisible(enabled) {
    settings.logoVisible = Boolean(enabled);

    saveSettings();
    applyLogoMode();

    emit('logo-visibility-changed', {
      enabled: settings.logoVisible
    });
  }

  /* ----------------------------------------------------------
     USER INTERFACE
     ---------------------------------------------------------- */

  function injectStyles() {
    if (document.getElementById('haldo-identity-styles')) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'haldo-identity-styles';

    style.textContent = `
      #logo-btn {
        position:relative;
        overflow:visible;
        isolation:isolate;
      }

      #logo-btn img {
        position:relative;
        z-index:3;
        width:34px;
        height:34px;
        object-fit:contain;
        border-radius:50%;
        pointer-events:none;
      }

      #logo-btn::before,
      #logo-btn::after {
        content:"";
        position:absolute;
        inset:-5px;
        border-radius:50%;
        pointer-events:none;
        z-index:-1;
        opacity:0;
      }

      .haldo-logo-portal::before {
        opacity:1!important;
        border:2px solid #00e5ff;
        box-shadow:
          0 0 12px #00e5ff,
          0 0 30px #b478ff,
          inset 0 0 15px #00e5ff;
        animation:haldoPortal 3s linear infinite;
      }

      .haldo-logo-portal::after {
        opacity:1!important;
        border:1px dashed #ff62d2;
        animation:haldoPortal 6s linear infinite reverse;
      }

      .haldo-logo-rotation img {
        animation:haldoRotation 8s linear infinite;
      }

      .haldo-logo-cyborg {
        box-shadow:
          0 0 12px #ff62d2,
          0 0 30px #b478ff,
          inset 0 0 15px #ff62d2!important;
      }

      .haldo-logo-energy::before {
        opacity:1!important;
        border:2px solid #ffd700;
        animation:haldoEnergy 1.8s ease-in-out infinite;
      }

      .haldo-logo-hologram {
        box-shadow:
          0 0 15px #00f5ff,
          0 0 35px #00aaff!important;
        animation:haldoHologram 2.5s ease-in-out infinite;
      }

      .haldo-logo-original {
        animation:haldoOriginal 3s ease-in-out infinite;
      }

      @keyframes haldoPortal {
        from { transform:rotate(0deg) scale(.96); }
        to   { transform:rotate(360deg) scale(1.04); }
      }

      @keyframes haldoRotation {
        from { transform:rotateY(0deg); }
        to   { transform:rotateY(360deg); }
      }

      @keyframes haldoEnergy {
        0%,100% {
          transform:scale(.95);
          opacity:.5;
        }
        50% {
          transform:scale(1.35);
          opacity:1;
        }
      }

      @keyframes haldoHologram {
        0%,100% {
          opacity:1;
          filter:hue-rotate(0deg);
        }
        50% {
          opacity:.65;
          filter:hue-rotate(90deg);
        }
      }

      @keyframes haldoOriginal {
        0%,100% { transform:scale(1); }
        50% { transform:scale(1.05); }
      }

      .haldo-animations-disabled *,
      .haldo-logo-no-animation {
        animation:none!important;
      }

      #haldo-identity-panel {
        position:fixed;
        inset:0;
        z-index:12000;
        display:none;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(0,0,12,.82);
        backdrop-filter:blur(18px);
      }

      #haldo-identity-panel.open {
        display:flex;
      }

      .haldo-identity-card {
        width:min(680px,100%);
        max-height:90vh;
        overflow:auto;
        padding:22px;
        border-radius:24px;
        border:1px solid rgba(0,229,255,.5);
        background:linear-gradient(
          145deg,
          rgba(4,18,45,.97),
          rgba(30,8,50,.97)
        );
        box-shadow:
          0 0 35px rgba(0,229,255,.2),
          0 0 65px rgba(180,120,255,.15);
      }

      .haldo-identity-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin-bottom:20px;
      }

      .haldo-identity-header h2 {
        color:#00e5ff;
        font-size:21px;
      }

      .haldo-identity-close {
        border:1px solid rgba(0,229,255,.4);
        color:white;
        background:rgba(255,255,255,.08);
        border-radius:12px;
        padding:10px 14px;
        cursor:pointer;
      }

      .haldo-identity-grid {
        display:grid;
        grid-template-columns:repeat(
          auto-fit,
          minmax(145px,1fr)
        );
        gap:12px;
      }

      .haldo-identity-option {
        min-height:120px;
        padding:14px;
        border-radius:16px;
        text-align:center;
        cursor:pointer;
        color:white;
        background:rgba(0,229,255,.07);
        border:1px solid rgba(0,229,255,.25);
        transition:.2s;
      }

      .haldo-identity-option:hover {
        transform:translateY(-3px);
        background:rgba(0,229,255,.17);
      }

      .haldo-identity-option.active {
        border:2px solid #ff62d2;
        box-shadow:0 0 18px rgba(255,98,210,.3);
        background:rgba(255,98,210,.12);
      }

      .haldo-identity-icon {
        display:block;
        font-size:32px;
        margin-bottom:9px;
      }

      .haldo-identity-option strong {
        display:block;
        font-size:12px;
        letter-spacing:1px;
      }

      .haldo-identity-option small {
        display:block;
        opacity:.7;
        font-size:11px;
        margin-top:7px;
        line-height:1.4;
      }

      .haldo-identity-section {
        margin-top:24px;
      }

      .haldo-identity-section h3 {
        color:#b478ff;
        margin-bottom:12px;
        font-size:15px;
      }

      .haldo-identity-switch {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin-top:15px;
        padding:13px;
        border-radius:12px;
        background:rgba(255,255,255,.05);
      }

      .haldo-identity-switch input {
        width:22px;
        height:22px;
        accent-color:#ff62d2;
      }

      @media(max-width:480px) {
        .haldo-identity-card {
          padding:15px;
        }

        .haldo-identity-grid {
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
      }

      @media(prefers-reduced-motion:reduce) {
        .haldo-identity-card *,
        #logo-btn,
        #logo-btn::before,
        #logo-btn::after {
          animation:none!important;
          transition:none!important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createPanel() {
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'haldo-identity-panel';

    panel.innerHTML = `
      <div class="haldo-identity-card">

        <div class="haldo-identity-header">
          <h2>🦚 HALDO LIVING IDENTITY</h2>
          <button class="haldo-identity-close"
                  type="button"
                  data-identity-close>
            ✕
          </button>
        </div>

        <p style="opacity:.75;margin-bottom:16px">
          Wähle die Erscheinungsform deiner HalDo AI.
        </p>

        <div class="haldo-identity-grid"
             id="haldo-avatar-options"></div>

        <div class="haldo-identity-section">
          <h3>✨ LOGO ANIMATION</h3>
          <div class="haldo-identity-grid"
               id="haldo-logo-options"></div>
        </div>

        <div class="haldo-identity-section">
          <h3>⚙️ ANIMATIONSEINSTELLUNGEN</h3>

          <label class="haldo-identity-switch">
            <span>Logo anzeigen</span>
            <input type="checkbox"
                   id="haldo-logo-visible">
          </label>

          <label class="haldo-identity-switch">
            <span>Animationen aktivieren</span>
            <input type="checkbox"
                   id="haldo-animations">
          </label>
        </div>

        <p style="opacity:.55;font-size:11px;margin-top:18px">
          Die Auswahl wird lokal auf diesem Gerät gespeichert.
        </p>

      </div>
    `;

    document.body.appendChild(panel);

    panel.addEventListener('click', event => {
      if (
        event.target === panel ||
        event.target.closest('[data-identity-close]')
      ) {
        close();
      }
    });

    renderOptions();

    return panel;
  }

  function renderOptions() {
    const avatarContainer =
      panel.querySelector('#haldo-avatar-options');

    const logoContainer =
      panel.querySelector('#haldo-logo-options');

    avatarContainer.innerHTML = '';

    Object.values(MODES).forEach(mode => {
      const button = document.createElement('button');

      button.type = 'button';
      button.className =
        'haldo-identity-option' +
        (settings.avatar === mode.id ? ' active' : '');

      button.innerHTML = `
        <span class="haldo-identity-icon">${mode.icon}</span>
        <strong>${mode.name}</strong>
        <small>${mode.description}</small>
      `;

      button.addEventListener('click', () => {
        setAvatarMode(mode.id);
        renderOptions();
      });

      avatarContainer.appendChild(button);
    });

    logoContainer.innerHTML = '';

    Object.entries(LOGO_MODES).forEach(([id, mode]) => {
      const button = document.createElement('button');

      button.type = 'button';

      button.className =
        'haldo-identity-option' +
        (settings.logo === id ? ' active' : '');

      button.innerHTML = `
        <span class="haldo-identity-icon">${mode.icon}</span>
        <strong>${mode.name}</strong>
      `;

      button.addEventListener('click', () => {
        setLogoMode(id);
        renderOptions();
      });

      logoContainer.appendChild(button);
    });

    panel.querySelector('#haldo-logo-visible').checked =
      settings.logoVisible;

    panel.querySelector('#haldo-animations').checked =
      settings.animations;

    panel.querySelector('#haldo-logo-visible')
      .onchange = event => {
        setLogoVisible(event.target.checked);
      };

    panel.querySelector('#haldo-animations')
      .onchange = event => {
        setAnimations(event.target.checked);
      };
  }

  /* ----------------------------------------------------------
     OPEN / CLOSE
     ---------------------------------------------------------- */

  function open() {
    createPanel();
    panel.classList.add('open');
    renderOptions();

    emit('panel-opened');
  }

  function close() {
    if (!panel) return;

    panel.classList.remove('open');

    emit('panel-closed');
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */

  function getSettings() {
    return { ...settings };
  }

  function getModes() {
    return Object.values(MODES).map(mode => ({ ...mode }));
  }

  function getLogoModes() {
    return Object.entries(LOGO_MODES).map(([id, mode]) => ({
      id,
      ...mode
    }));
  }

  function init() {
    if (initialized) return;

    initialized = true;

    injectStyles();

    applyAvatarMode();
    applyLogoMode();

    document.body.classList.toggle(
      'haldo-animations-disabled',
      !settings.animations
    );

    emit('ready');

    console.log(
      '%c🦚 HALDO LIVING IDENTITY ENGINE READY',
      'background:#b478ff;color:#000;padding:7px 12px;border-radius:8px;font-weight:bold'
    );
  }

  HalDo.LivingIdentity = {
    init,
    open,
    close,

    setAvatarMode,
    getAvatarMode,
    getAvatarProfile,
    getModes,

    setLogoMode,
    getLogoModes,

    setAnimations,
    setLogoVisible,

    getSettings,
    subscribe
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }

})();
