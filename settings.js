/* HalDo Settings v32.0 — ULTIMATE SYSTEM CONTROL + AUDIO ENGINE + ERWEITERTE FEATURES */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // 1. INTEGRIERTE AUDIO ENGINE (Damit Ton zu 100% geht)
  // ═══════════════════════════════════════════════════════
  const HalDoAudio = (function() {
    let ctx = null, masterNode = null, masterVolume = 0.8;
    function init() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        masterNode = ctx.createGain(); masterNode.gain.value = masterVolume;
        masterNode.connect(ctx.destination);
      } catch (e) { console.warn('AudioContext Fehler:', e); }
      return ctx;
    }
    function playSound(soundId) {
      init(); if (!ctx) return;
      const now = ctx.currentTime;
      function playFreq(freq, dur, type, vol) {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = type || 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(g); g.connect(masterNode); osc.start(now); osc.stop(now + dur + 0.05);
      }
      switch(soundId) {
        case 'ping': playFreq(880, 0.15, 'sine', 0.3); break;
        case 'ding': playFreq(1320, 0.20, 'sine', 0.3); break;
        case 'chime': playFreq(659, 0.15, 'sine', 0.3); setTimeout(() => playFreq(988, 0.20, 'sine', 0.3), 150); break;
        case 'bell': playFreq(1046, 0.50, 'sine', 0.3); break;
        case 'marimba': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playFreq(f, 0.25, 'triangle', 0.25), i * 90)); break;
        case 'alarm': [1400, 1400, 1400].forEach((f, i) => setTimeout(() => playFreq(f, 0.15, 'square', 0.4), i * 250)); break;
        case 'success': playFreq(523,0.1,'sine',0.3); setTimeout(()=>playFreq(659,0.1,'sine',0.3),80); setTimeout(()=>playFreq(784,0.15,'sine',0.3),160); break;
        default: playFreq(880, 0.15, 'sine', 0.3);
      }
    }
    return { playSound, setMasterVolume: (v) => { masterVolume = v; if (masterNode) masterNode.gain.value = v; }, listSounds: () => ['ping','ding','chime','bell','marimba','alarm','success'] };
  })();

  // ═══════════════════════════════════════════════════════
  // 2. KONFIGURATION & STATE (Mit WLAN/Hotspot & KI Feldern)
  // ═══════════════════════════════════════════════════════
  const VERSION = '32.0';
  const STORAGE_KEY = 'haldo.settings.v32';

  const DEFAULTS = {
    general: { deviceName: 'HalDo Device', model: 'HalDo X1 Pro', version: VERSION },
    display: { brightness: 100, darkMode: true, accent: '#00d4ff', fontSize: 100, wallpaper: 'gradient-dark', nightLight: false },
    audio: { master: 0.8, ringtone: 'chime', silentMode: false, vibratePattern: 'standard' },
    bluetooth: { 
      wifi: true, bluetooth: false, nfc: false, location: true, airplane: false, 
      hotspot: false, hotspotName: 'HalDo_Hotspot', hotspotPass: '12345678',
      vpn: false, vpnServer: 'vpn.haldo.ai' 
    },
    apps: {},
    accessibility: { screenReader: false, hapticFeedback: true },
    security: { camera: true, mic: true, location: true, lockScreen: false },
    datetime: { format24h: true, dateFormat: 'DD.MM.YYYY', timezone: 'Europe/Berlin' },
    ai: { assistant: 'haldo-ai', ttsRate: 1.0 },
    language: { system: 'de' },
    storage: { total: 100, used: 12.4 },
    keyboard: { de: true, en: true, tr: false, ar: false, ku: false, ezidi: false, aiText: '' },
    update: { currentVersion: VERSION, lastCheck: null },
    battery: { percent: 87, charging: false, saver: false },
    welcome: { enabled: true, duration: 2200 }
  };

  const FALLBACK_APPS = [
    { id: 'chat', name: 'Chat', icon: '💬' }, { id: 'ai', name: 'HalDo KI', icon: '🤖' }, { id: 'email', name: 'E-Mail', icon: '📧' },
    { id: 'posteingang', name: 'Posteingang', icon: '📥' }, { id: 'kontakte', name: 'Kontakte', icon: '👥' }, { id: 'aufnahme', name: 'Aufnahme', icon: '🎙️' },
    { id: 'phone', name: 'Telefon', icon: '📞' }, { id: 'videocall', name: 'Videocall', icon: '📹' }, { id: 'voicememos', name: 'Voicememos', icon: '🎤' },
    { id: 'tasks', name: 'Aufgaben', icon: '✅' }, { id: 'todo', name: 'To-Do', icon: '📋' }, { id: 'notes', name: 'Notizen', icon: '📝' },
    { id: 'kalender', name: 'Kalender', icon: '📅' }, { id: 'projekte', name: 'Projekte', icon: '📊' }, { id: 'arbeitszeit', name: 'Arbeitszeit', icon: '⏱️' },
    { id: 'dokumente', name: 'Dokumente', icon: '📄' }, { id: 'links', name: 'Links', icon: '🔗' }, { id: 'passwort', name: 'Passwort', icon: '🔐' },
    { id: 'clipboard', name: 'Clipboard', icon: '📋' }, { id: 'filemanager', name: 'Dateien', icon: '📁' }, { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'gesundheit', name: 'Gesundheit', icon: '❤️' }, { id: 'stimmung', name: 'Stimmung', icon: '😊' }, { id: 'gewohnheiten', name: 'Gewohnheiten', icon: '🔁' },
    { id: 'schlaf', name: 'Schlaf', icon: '😴' }, { id: 'atem', name: 'Atem', icon: '🫁' }, { id: 'wasser', name: 'Wasser', icon: '💧' },
    { id: 'kueche', name: 'Küche', icon: '🍳' }, { id: 'rezept', name: 'Rezepte', icon: '🍲' }, { id: 'einkauf', name: 'Einkauf', icon: '🛒' },
    { id: 'zuhause', name: 'Zuhause', icon: '🏠' }, { id: 'finanzen', name: 'Finanzen', icon: '💰' }, { id: 'reisen', name: 'Reisen', icon: '✈️' },
    { id: 'auto', name: 'Auto', icon: '🚗' }, { id: 'musik', name: 'Musik', icon: '🎵' }, { id: 'photos', name: 'Photos', icon: '🖼️' },
    { id: 'video', name: 'Video', icon: '🎬' }, { id: 'bild', name: 'Bild', icon: '🖌️' }, { id: 'wetter', name: 'Wetter', icon: '🌤️' },
    { id: 'rechner', name: 'Rechner', icon: '🧮' }, { id: 'timer', name: 'Timer', icon: '⏲️' }, { id: 'pomodoro', name: 'Pomodoro', icon: '🍅' },
    { id: 'uebersetzer', name: 'Übersetzer', icon: '🌐' }, { id: 'notfall', name: 'Notfall', icon: '🚨' }, { id: 'spiele', name: 'Spiele', icon: '🎮' },
    { id: 'blitzer', name: 'Blitzer', icon: '📡' }, { id: 'fahrschule', name: 'Fahrschule', icon: '🚦' }, { id: 'kamera', name: 'Kamera', icon: '📷' }
  ];

  function getAllApps() {
    try {
      if (window.HalDo && window.HalDo.Apps && typeof window.HalDo.Apps.listInstalled === 'function') {
        var list = window.HalDo.Apps.listInstalled();
        if (Array.isArray(list) && list.length > 0) return list.map(a => ({ id: a.id || a.key || 'app', name: a.name || a.title || a.id, icon: a.icon || '📱' }));
      }
    } catch (e) { }
    return FALLBACK_APPS;
  }

  let state = null;
  function mergeDeep(t, d) { const o = Object.assign({}, d); for (const k in t) { if (t[k] && typeof t[k] === 'object' && !Array.isArray(t[k]) && d[k]) o[k] = mergeDeep(t[k], d[k]); else o[k] = t[k]; } return o; }
  function load() { try { const r = localStorage.getItem(STORAGE_KEY); state = r ? mergeDeep(JSON.parse(r), DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS)); } catch (e) { state = JSON.parse(JSON.stringify(DEFAULTS)); } return state; }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }
  function get(p) { const parts = p.split('.'); let c = state; for (const pt of parts) { if (c == null) return undefined; c = c[pt]; } return c; }
  function set(p, v) { const parts = p.split('.'); let c = state; for (let i = 0; i < parts.length - 1; i++) { if (c[parts[i]] == null) c[parts[i]] = {}; c = c[parts[i]]; } c[parts[parts.length - 1]] = v; save(); applySideEffects(p, v); }
  function applySideEffects(p, v) {
    if (p === 'audio.master') HalDoAudio.setMasterVolume(v);
    if (p === 'display.brightness') document.documentElement.style.setProperty('--haldo-brightness', v / 100);
    if (p === 'display.darkMode') document.documentElement.classList.toggle('haldo-dark', v);
    if (p === 'display.nightLight') document.documentElement.style.filter = v ? 'sepia(0.3) hue-rotate(-15deg)' : '';
    if (p === 'welcome.enabled') window.__haldoWelcomeEnabled = !!v;
  }

  function getAppConfig(id) {
    if (!state.apps[id]) { state.apps[id] = { enabled: true, muted: false, volume: 0.7, sound: 'chime', vibration: true, permissions: { camera: false, mic: false, location: false } }; save(); }
    if (!state.apps[id].permissions) state.apps[id].permissions = { camera: false, mic: false, location: false };
    return Object.assign({}, state.apps[id], { permissions: Object.assign({}, state.apps[id].permissions) });
  }
  function setAppConfig(id, patch) {
    const cur = getAppConfig(id);
    if (patch.permissions) state.apps[id] = Object.assign({}, cur, patch, { permissions: Object.assign({}, cur.permissions, patch.permissions) });
    else state.apps[id] = Object.assign({}, cur, patch);
    save();
  }

  function css() {
    return `<style>
      .haldo-settings { font-family: Inter, system-ui, sans-serif; color: #e8e8ec; background: #0a0a0f; display: flex; height: 100%; min-height: 500px; border-radius: 10px; overflow: hidden; }
      .haldo-settings * { box-sizing: border-box; }
      .hs-sidebar { width: 220px; background: #111118; border-right: 1px solid #222; overflow-y: auto; padding: 12px 0; flex-shrink: 0; }
      .hs-sidebar h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #555; padding: 12px 16px 6px; margin: 0; }
      .hs-nav-item { padding: 10px 16px; cursor: pointer; font-size: 13px; border-left: 3px solid transparent; transition: all 0.15s; display: flex; align-items: center; gap: 9px; user-select: none; }
      .hs-nav-item:hover { background: #1a1a24; }
      .hs-nav-item.active { background: #1a1a24; border-left-color: var(--haldo-accent, #00d4ff); color: var(--haldo-accent, #00d4ff); }
      .hs-nav-item .icon { font-size: 15px; width: 18px; text-align: center; }
      .hs-content { flex: 1; overflow-y: auto; padding: 22px 28px; }
      .hs-content h1 { font-size: 21px; margin: 0 0 18px; font-weight: 600; }
      .hs-section { background: #14141c; border: 1px solid #222; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; }
      .hs-section h3 { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
      .hs-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #1e1e28; gap: 12px; }
      .hs-row:last-child { border-bottom: none; }
      .hs-row label { font-size: 13px; color: #c8c8d0; flex: 1; }
      .hs-row .val { font-size: 12px; color: #888; min-width: 48px; text-align: right; font-variant-numeric: tabular-nums; }
      .hs-slider { flex: 1; max-width: 190px; accent-color: var(--haldo-accent, #00d4ff); cursor: pointer; }
      .hs-toggle { position: relative; width: 38px; height: 22px; background: #333; border-radius: 11px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
      .hs-toggle.on { background: var(--haldo-accent, #00d4ff); }
      .hs-toggle::after { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
      .hs-toggle.on::after { transform: translateX(16px); }
      .hs-select, .hs-input, textarea.hs-input { background: #1a1a24; border: 1px solid #2a2a36; color: #e8e8ec; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-family: inherit; outline: none; width: 100%; max-width: 250px; }
      .hs-select:focus, .hs-input:focus { border-color: var(--haldo-accent, #00d4ff); }
      .hs-btn { background: var(--haldo-accent, #00d4ff); color: #000; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: opacity 0.15s; }
      .hs-btn:hover { opacity: 0.82; }
      .hs-btn.ghost { background: transparent; color: #c8c8d0; border: 1px solid #2a2a36; }
      .hs-btn.ghost:hover { background: #1a1a24; }
      .hs-btn.danger { background: #c33; color: #fff; }
      .hs-btn.sm { padding: 4px 9px; font-size: 11px; }
      .hs-app-row { display: grid; grid-template-columns: 30px 1.2fr 100px 90px 60px 90px; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid #1e1e28; }
      .hs-app-row:last-child { border-bottom: none; }
      .hs-app-row .app-icon { font-size: 17px; text-align: center; cursor: pointer; }
      .hs-app-row .app-name { font-size: 13px; color: #e8e8ec; font-weight: 500; cursor: pointer; }
      .hs-app-row .app-name:hover { color: var(--haldo-accent, #00d4ff); }
      .hs-app-row .app-vol { width: 100%; }
      .hs-app-row .app-sound { width: 100%; font-size: 11px; padding: 4px 6px; }
      .hs-badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-align: center; display: inline-block; min-width: 48px; cursor: pointer; }
      .hs-badge.on { background: #0a6; color: #fff; }
      .hs-badge.muted { background: #a33; color: #fff; }
      .hs-badge.off { background: #333; color: #888; }
      .hs-color { width: 44px; height: 28px; border: 1px solid #2a2a36; border-radius: 6px; cursor: pointer; background: none; padding: 2px; }
      .hs-search { width: 100%; padding: 8px 12px; background: #1a1a24; border: 1px solid #2a2a36; border-radius: 6px; color: #e8e8ec; font-size: 13px; margin-bottom: 12px; font-family: inherit; }
      .hs-empty { color: #666; font-size: 13px; text-align: center; padding: 30px 0; }
      .hs-perm-panel { margin: 0; }
      .hs-perm-row { display: flex; gap: 6px; padding: 8px 0; flex-wrap: wrap; }
      .hs-perm-btn { padding: 5px 10px; background: #1a1a24; border: 1px solid #2a2a36; border-radius: 5px; color: #888; cursor: pointer; font-size: 11px; font-family: inherit; }
      .hs-perm-btn.on { background: #0a6; color: #fff; border-color: #0a6; }
      .hs-panel { background: #16161e; border: 1px solid #2a2a36; border-radius: 8px; padding: 12px 14px; margin: 8px 0; }
      .hs-panel h4 { margin: 0 0 8px; font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
      .hs-eq { display: flex; gap: 14px; padding: 10px 0; justify-content: center; }
      .hs-eq-slider { display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .hs-eq-slider label { font-size: 10px; color: #888; text-transform: uppercase; }
      .hs-eq-slider input { writing-mode: vertical-lr; direction: rtl; width: 24px; height: 120px; accent-color: var(--haldo-accent, #00d4ff); }
      .hs-eq-slider .val { font-size: 11px; color: #ccc; font-weight: 600; }
      .hs-wallpaper-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 8px 0; }
      .hs-wallpaper-item { aspect-ratio: 9/16; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; }
      .hs-wallpaper-item:hover { transform: scale(1.03); }
      .hs-wallpaper-item.active { border-color: var(--haldo-accent, #00d4ff); }
      textarea.hs-input { resize: vertical; min-height: 60px; }
    </style>`;
  }

  const CATS = [
    { id: 'general', icon: 'ℹ️', name: 'Allgemein & Info', group: 'A' },
    { id: 'display', icon: '🎨', name: 'Darstellung & Display', group: 'D' },
    { id: 'audio', icon: '🔊', name: 'Audio & Töne', group: 'A' },
    { id: 'apps', icon: '📱', name: 'Apps & Benachrichtigungen', group: 'A' },
    { id: 'welcome', icon: '🦚', name: 'Welcome-Begrüßung', group: 'W' },
    { id: 'bluetooth', icon: '📶', name: 'Bluetooth & Netzwerk', group: 'B' },
    { id: 'keyboard', icon: '⌨️', name: 'Tastatur & KI', group: 'T' },
    { id: 'accessibility', icon: '♿', name: 'Bedienungshilfen', group: 'B' },
    { id: 'security', icon: '🔒', name: 'Datenschutz', group: 'D' },
    { id: 'datetime', icon: '🕐', name: 'Datum & Uhrzeit', group: 'D' },
    { id: 'ai', icon: '🤖', name: 'HalDo KI Stimme', group: 'H' },
    { id: 'language', icon: '🌐', name: 'Sprache & Region', group: 'S' },
    { id: 'storage', icon: '💾', name: 'Speicher', group: 'S' },
    { id: 'update', icon: '🔄', name: 'Software-Update', group: 'S' },
    { id: 'battery', icon: '🔋', name: 'Akku & Energie', group: 'A' }
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rowToggle(label, path, action) { return `<div class="hs-row"><label>${esc(label)}</label><div class="hs-toggle ${!!get(path) ? 'on' : ''}" data-action="${action}"></div></div>`; }
  function rowSlider(label, path, action, min, max, step, unit) { const val = get(path); return `<div class="hs-row"><label>${esc(label)}</label><input class="hs-slider" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-action="${action}"><span class="val">${val}${unit || ''}</span></div>`; }
  function rowSelect(label, path, action, options) { const val = get(path); const opts = options.map(o => `<option value="${esc(o.value)}" ${o.value === val ? 'selected' : ''}>${esc(o.label)}</option>`).join(''); return `<div class="hs-row"><label>${esc(label)}</label><select class="hs-select" data-action="${action}">${opts}</select></div>`; }
  function rowInput(label, path, action, type) { const val = get(path); return `<div class="hs-row"><label>${esc(label)}</label><input class="hs-input" type="${type || 'text'}" value="${esc(val)}" data-action="${action}"></div>`; }
  function rowInfo(label, value) { return `<div class="hs-row"><label>${esc(label)}</label><span class="val">${esc(value)}</span></div>`; }
  function rowButton(label, btnText, action, cls) { return `<div class="hs-row"><label>${esc(label)}</label><button class="hs-btn ${cls || ''}" data-action="${action}">${esc(btnText)}</button></div>`; }

  function renderGeneral() {
    const apps = getAllApps();
    return `<h1>ℹ️ Allgemein & Info</h1><div class="hs-section"><h3>Gerät</h3>${rowInput('Gerätename', 'general.deviceName', 'set:general.deviceName')}${rowInfo('Modell', get('general.model'))}${rowInfo('Systemversion', VERSION)}${rowInfo('Installierte Apps', apps.length + ' Apps')}</div><div class="hs-section"><h3>System</h3>${rowInfo('Laufzeit', 'HalDo AI OS')}${rowButton('Werksreset', 'Zurücksetzen', 'reset-all', 'danger')}</div>`;
  }
  function renderDisplay() {
    const wallpapers = [ { id: 'gradient-dark', style: 'linear-gradient(180deg, #050810 0%, #0a0f1a 100%)' }, { id: 'gradient-blue', style: 'linear-gradient(180deg, #001a4d 0%, #003580 100%)' }, { id: 'gradient-purple', style: 'linear-gradient(180deg, #1a0033 0%, #4d0080 100%)' }, { id: 'gradient-gold', style: 'linear-gradient(180deg, #1a1000 0%, #4d3a00 100%)' } ];
    const current = get('display.wallpaper');
    const wpGrid = wallpapers.map(w => `<div class="hs-wallpaper-item ${w.id === current ? 'active' : ''}" style="background: ${w.style}" data-action="set-wallpaper" data-wallpaper="${w.id}"></div>`).join('');
    return `<h1>🎨 Darstellung & Display</h1><div class="hs-section"><h3>Helligkeit & Modus</h3>${rowSlider('Helligkeit', 'display.brightness', 'set:display.brightness', 10, 100, 1, '%')}${rowToggle('Dark Mode', 'display.darkMode', 'toggle:display.darkMode')}${rowToggle('Nachtlicht', 'display.nightLight', 'toggle:display.nightLight')}</div><div class="hs-section"><h3>Akzentfarbe</h3><div class="hs-row"><label>Akzentfarbe</label><input class="hs-color" type="color" value="${esc(get('display.accent'))}" data-action="set:display.accent"></div></div><div class="hs-section"><h3>Hintergrundbild</h3><div class="hs-wallpaper-grid">${wpGrid}</div></div><div class="hs-section"><h3>Schriftgröße</h3>${rowSlider('Schriftgröße', 'display.fontSize', 'set:display.fontSize', 80, 140, 5, '%')}</div>`;
  }
  function renderAudio() {
    const sounds = HalDoAudio.listSounds().map(s => ({ value: s, label: s }));
    return `<h1>🔊 Audio & Töne</h1><div class="hs-section"><h3>Lautstärke</h3>${rowSlider('Master', 'audio.master', 'set:audio.master', 0, 1, 0.01, '')}${rowToggle('Lautlos-Modus', 'audio.silentMode', 'toggle:audio.silentMode')}</div><div class="hs-section"><h3>Klingelton</h3>${rowSelect('Klingelton', 'audio.ringtone', 'set:audio.ringtone', sounds)}${rowButton('Klingelton testen', '🔊 Test', 'test-ringtone')}</div><div class="hs-section"><h3>Vibration</h3>${rowSelect('Muster', 'audio.vibratePattern', 'set:audio.vibratePattern', [ { value: 'standard', label: 'Standard' }, { value: 'long', label: 'Lang' }, { value: 'short', label: 'Kurz' }, { value: 'heartbeat', label: 'Herzschlag' }, { value: 'none', label: 'Keine' } ])}${rowButton('Vibration testen', '📳 Test', 'test-vibration')}</div><div class="hs-section"><h3>Equalizer</h3><div class="hs-eq"><div class="hs-eq-slider"><label>Bass</label><input type="range" min="-15" max="15" step="1" value="${get('audio.eq.bass')}" data-action="eq-bass"><span class="val">${get('audio.eq.bass')}</span></div><div class="hs-eq-slider"><label>Mid</label><input type="range" min="-15" max="15" step="1" value="${get('audio.eq.mid')}" data-action="eq-mid"><span class="val">${get('audio.eq.mid')}</span></div><div class="hs-eq-slider"><label>Treble</label><input type="range" min="-15" max="15" step="1" value="${get('audio.eq.treble')}" data-action="eq-treble"><span class="val">${get('audio.eq.treble')}</span></div></div>${rowButton('Equalizer testen', '🔊 Test', 'test-eq')}</div>`;
  }
  function renderApps() {
    const apps = getAllApps();
    const rows = apps.map(app => {
      const cfg = getAppConfig(app.id);
      const statusClass = !cfg.enabled ? 'off' : (cfg.muted ? 'muted' : 'on');
      const statusText = !cfg.enabled ? 'Aus' : (cfg.muted ? 'Stumm' : 'An');
      const sounds = HalDoAudio.listSounds();
      const opts = sounds.map(s => `<option value="${s}" ${s === cfg.sound ? 'selected' : ''}>${s}</option>`).join('');
      return `<div class="hs-app-row" data-appid="${esc(app.id)}"><div class="app-icon" data-action="app-expand" data-appid="${esc(app.id)}">${app.icon}</div><div class="app-name" data-action="app-expand" data-appid="${esc(app.id)}">${esc(app.name)}</div><input class="hs-slider app-vol" type="range" min="0" max="1" step="0.05" value="${cfg.volume}" data-action="app-volume" data-appid="${esc(app.id)}"><select class="hs-select app-sound" data-action="app-sound" data-appid="${esc(app.id)}">${opts}</select><span class="hs-badge ${statusClass}" data-action="app-status" data-appid="${esc(app.id)}">${statusText}</span><div style="display:flex; gap:4px;"><button class="hs-btn sm" data-action="app-test" data-appid="${esc(app.id)}">🔊</button><button class="hs-btn sm ghost" data-action="app-toggle-mute" data-appid="${esc(app.id)}">${cfg.muted ? '🔔' : '🔕'}</button><button class="hs-btn sm ghost" data-action="app-toggle-enable" data-appid="${esc(app.id)}">${cfg.enabled ? '⏸️' : '▶️'}</button></div></div><div class="hs-perm-panel" data-permpanel="${esc(app.id)}" style="display:none;"><div class="hs-panel"><h4>Berechtigungen für ${esc(app.name)}</h4><div class="hs-perm-row"><button class="hs-perm-btn ${cfg.permissions.camera ? 'on' : ''}" data-action="app-perm" data-appid="${esc(app.id)}" data-perm="camera">📷 Kamera</button><button class="hs-perm-btn ${cfg.permissions.mic ? 'on' : ''}" data-action="app-perm" data-appid="${esc(app.id)}" data-perm="mic">🎤 Mikrofon</button><button class="hs-perm-btn ${cfg.permissions.location ? 'on' : ''}" data-action="app-perm" data-appid="${esc(app.id)}" data-perm="location">📍 Standort</button></div></div></div>`;
    }).join('');
    return `<h1>📱 Apps & Benachrichtigungen</h1><div class="hs-section" style="padding: 10px 12px; margin-bottom: 8px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:12px; color:#888;">Master:</span><input class="hs-slider" type="range" min="0" max="1" step="0.01" value="${get('audio.master')}" data-action="set:audio.master"><span class="val">${Math.round(get('audio.master') * 100)}%</span></div></div><input class="hs-search" type="text" placeholder="🔍 App suchen..." data-action="app-search"><div class="hs-section" id="hs-apps-list">${rows}</div>`;
  }
  function renderWelcome() {
    return `<h1>🦚 Welcome-Begrüßung</h1><div class="hs-section"><h3>Beim App-Öffnen</h3>${rowToggle('Welcome anzeigen', 'welcome.enabled', 'toggle:welcome.enabled')}${rowSelect('Dauer', 'welcome.duration', 'set:welcome.duration', [ { value: 1000, label: '1 Sekunde' }, { value: 2200, label: '2,2 Sekunden (Standard)' }, { value: 4000, label: '4 Sekunden' } ])}${rowButton('Vorschau testen', '👁️ Vorschau', 'test-welcome')}</div>`;
  }
  function renderBluetooth() {
    const isHotspot = get('bluetooth.hotspot');
    const isVpn = get('bluetooth.vpn');
    return `<h1>📶 Bluetooth & Netzwerk</h1><div class="hs-section"><h3>Verbindungen</h3>${rowToggle('WLAN', 'bluetooth.wifi', 'toggle:bluetooth.wifi')}${rowToggle('Bluetooth', 'bluetooth.bluetooth', 'toggle:bluetooth.bluetooth')}${rowToggle('NFC', 'bluetooth.nfc', 'toggle:bluetooth.nfc')}${rowToggle('Standortdienste', 'bluetooth.location', 'toggle:bluetooth.location')}${rowToggle('Flugmodus', 'bluetooth.airplane', 'toggle:bluetooth.airplane')}</div><div class="hs-section"><h3>Hotspot</h3>${rowToggle('Hotspot aktiv', 'bluetooth.hotspot', 'toggle:bluetooth.hotspot')}${isHotspot ? `<div class="hs-row"><label>Netzwerkname (SSID)</label><input class="hs-input" value="${esc(get('bluetooth.hotspotName'))}" data-action="set:bluetooth.hotspotName"></div><div class="hs-row"><label>WLAN-Passwort</label><input class="hs-input" type="password" value="${esc(get('bluetooth.hotspotPass'))}" data-action="set:bluetooth.hotspotPass"></div>` : ''}</div><div class="hs-section"><h3>VPN</h3>${rowToggle('VPN aktiv', 'bluetooth.vpn', 'toggle:bluetooth.vpn')}${isVpn ? `<div class="hs-row"><label>VPN Server</label><input class="hs-input" value="${esc(get('bluetooth.vpnServer'))}" data-action="set:bluetooth.vpnServer"></div>` : ''}</div><div class="hs-section"><h3>Bluetooth-Geräte</h3>${rowButton('Gerätesuche (Web Bluetooth)', '🔍 Suchen', 'bt-scan')}<div id="hs-bt-results" class="hs-empty">Noch keine Suche gestartet.</div></div>`;
  }
  function renderKeyboard() {
    return `<h1>⌨️ Tastatur & KI</h1><div class="hs-section"><h3>Sprachen</h3>${rowToggle('Deutsch', 'keyboard.de', 'toggle:keyboard.de')}${rowToggle('Englisch', 'keyboard.en', 'toggle:keyboard.en')}${rowToggle('Türkisch', 'keyboard.tr', 'toggle:keyboard.tr')}${rowToggle('Arabisch', 'keyboard.ar', 'toggle:keyboard.ar')}${rowToggle('Kurdisch (Kurmandschi)', 'keyboard.ku', 'toggle:keyboard.ku')}${rowToggle('Ezidi (Alte Schrift)', 'keyboard.ezidi', 'toggle:keyboard.ezidi')}</div><div class="hs-section"><h3>HalDo KI Text-Werkzeuge</h3><textarea class="hs-input" placeholder="Text hier eingeben..." data-action="set:keyboard.aiText" style="width:100%; max-width:100%;">${esc(get('keyboard.aiText'))}</textarea><div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;"><button class="hs-btn sm" data-action="kb-ai-correct">Korrigieren</button><button class="hs-btn sm" data-action="kb-ai-formulate">Formulieren</button><button class="hs-btn sm" data-action="kb-ai-detail">Detailieren</button><button class="hs-btn sm ghost" data-action="kb-ai-doc">Dokument erstellen</button></div></div>`;
  }
  function renderAccessibility() { return `<h1>♿ Bedienungshilfen</h1><div class="hs-section"><h3>Screenreader & Feedback</h3>${rowToggle('Bildschirmleser', 'accessibility.screenReader', 'toggle:accessibility.screenReader')}${rowToggle('Vibration bei Eingabe', 'accessibility.hapticFeedback', 'toggle:accessibility.hapticFeedback')}</div>`; }
  function renderSecurity() { return `<h1>🔒 Datenschutz</h1><div class="hs-section"><h3>Globale Berechtigungen</h3>${rowToggle('Kamera', 'security.camera', 'toggle:security.camera')}${rowToggle('Mikrofon', 'security.mic', 'toggle:security.mic')}${rowToggle('Standort', 'security.location', 'toggle:security.location')}</div><div class="hs-section"><h3>Sperre</h3>${rowToggle('Bildschirmsperre', 'security.lockScreen', 'toggle:security.lockScreen')}</div>`; }
  function renderDatetime() { return `<h1>🕐 Datum & Uhrzeit</h1><div class="hs-section"><h3>Format</h3>${rowToggle('24-Stunden-Format', 'datetime.format24h', 'toggle:datetime.format24h')}${rowSelect('Datumsformat', 'datetime.dateFormat', 'set:datetime.dateFormat', [ { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' } ])}</div>`; }
  function renderAI() { return `<h1>🤖 HalDo KI & Stimme</h1><div class="hs-section"><h3>Assistent</h3>${rowSelect('Assistent', 'ai.assistant', 'set:ai.assistant', [ { value: 'haldo-ai', label: 'HalDo AI' }, { value: 'haldo-ki', label: 'HalDo KI' }, { value: 'cyborg', label: 'Cyborg' } ])}</div><div class="hs-section"><h3>TTS (Text-to-Speech)</h3>${rowSlider('Geschwindigkeit', 'ai.ttsRate', 'set:ai.ttsRate', 0.5, 2, 0.1, 'x')}${rowButton('Stimme testen', '🔊 Test', 'tts-test')}</div>`; }
  function renderLanguage() { return `<h1>🌐 Sprache & Region</h1><div class="hs-section"><h3>Systemsprache</h3>${rowSelect('Sprache', 'language.system', 'set:language.system', [ { value: 'de', label: 'Deutsch' }, { value: 'en', label: 'English' }, { value: 'tr', label: 'Türkçe' }, { value: 'ar', label: 'العربية' }, { value: 'ku', label: 'Kurdî' }, { value: 'ez', label: 'Ezidi' } ])}</div>`; }
  function renderStorage() { const used = get('storage.used'), total = get('storage.total'); const pct = Math.round((used / total) * 100); return `<h1>💾 Speicher</h1><div class="hs-section"><h3>Speicherbelegung</h3>${rowInfo('Gesamt', total + ' GB')}${rowInfo('Belegt', used + ' GB (' + pct + '%)')}${rowInfo('Frei', (total - used).toFixed(1) + ' GB')}<div style="margin: 10px 0;"><div style="height: 8px; background: #222; border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--haldo-accent, #00d4ff), #b478ff);"></div></div></div>${rowButton('Cache leeren', 'Cache leeren', 'clear-cache', 'ghost')}</div>`; }
  function renderUpdate() { return `<h1>🔄 Software-Update</h1><div class="hs-section"><h3>Version</h3>${rowInfo('Aktuell', get('update.currentVersion'))}${rowInfo('Letzte Prüfung', get('update.lastCheck') || 'Nie')}</div><div class="hs-section"><h3>Aktionen</h3>${rowButton('Nach Update suchen', 'Suchen', 'check-update')}${rowButton('Auf Werkseinstellungen', 'Reset', 'reset-all', 'danger')}</div>`; }
  function renderBattery() { const pct = get('battery.percent'); return `<h1>🔋 Akku & Energie</h1><div class="hs-section"><h3>Status</h3>${rowInfo('Akkustand', pct + '%')}${rowInfo('Lädt', get('battery.charging') ? 'Ja ⚡' : 'Nein')}${rowInfo('Energiesparmodus', get('battery.saver') ? 'Aktiv' : 'Inaktiv')}<div style="margin: 10px 0;"><div style="height: 8px; background: #222; border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ${pct}%; background: ${pct > 20 ? '#0a6' : '#c33'};"></div></div></div></div><div class="hs-section"><h3>Energiesparmodus</h3>${rowToggle('Energiesparmodus', 'battery.saver', 'toggle:battery.saver')}</div>`; }

  const RENDERERS = { general: renderGeneral, display: renderDisplay, audio: renderAudio, apps: renderApps, welcome: renderWelcome, bluetooth: renderBluetooth, keyboard: renderKeyboard, accessibility: renderAccessibility, security: renderSecurity, datetime: renderDatetime, ai: renderAI, language: renderLanguage, storage: renderStorage, update: renderUpdate, battery: renderBattery };

  let active = 'general', currentTarget = null;
  function buildSidebar() { const groups = {}; CATS.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); }); return Object.keys(groups).sort().map(g => { const items = groups[g].map(c => `<div class="hs-nav-item ${c.id === active ? 'active' : ''}" data-cat="${c.id}"><span class="icon">${c.icon}</span><span>${esc(c.name)}</span></div>`).join(''); return `<h2>${g}</h2>${items}`; }).join(''); }
  function getHTML() { const renderer = RENDERERS[active] || renderGeneral; return css() + `<div class="haldo-settings"><div class="hs-sidebar">${buildSidebar()}</div><div class="hs-content" id="hs-content">${renderer()}</div></div>`; }
  function refreshContent() { if (!currentTarget) return; const el = currentTarget.querySelector('#hs-content'); if (el) { const renderer = RENDERERS[active] || renderGeneral; el.innerHTML = renderer(); } const sidebar = currentTarget.querySelector('.hs-sidebar'); if (sidebar) sidebar.innerHTML = buildSidebar(); }
  function render(target) { if (target && target.nodeType === 1) currentTarget = target; if (!currentTarget) currentTarget = document.body; currentTarget.innerHTML = getHTML(); if (!currentTarget.__haldoSettingsBound) { currentTarget.addEventListener('click', onClick); currentTarget.addEventListener('input', onInput); currentTarget.addEventListener('change', onChange); currentTarget.__haldoSettingsBound = true; } return currentTarget; }

  function vibratePattern(pattern) { if (!navigator.vibrate) return; switch (pattern) { case 'long': navigator.vibrate([200]); break; case 'short': navigator.vibrate([20]); break; case 'heartbeat': navigator.vibrate([60, 40, 100, 40, 60]); break; case 'none': break; default: navigator.vibrate([40]); } }

  function onClick(e) {
    const nav = e.target.closest('.hs-nav-item');
    if (nav) { active = nav.dataset.cat; refreshContent(); return; }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action, appId = btn.dataset.appid;

    if (action.indexOf('toggle:') === 0) { set(action.slice(7), !get(action.slice(7))); refreshContent(); return; }
    if (action === 'test-ringtone') { HalDoAudio.playSound(get('audio.ringtone') || 'chime'); return; }
    if (action === 'test-vibration') { vibratePattern(get('audio.vibratePattern')); return; }
    if (action === 'test-eq') { HalDoAudio.playSound('marimba'); return; }
    if (action === 'test-welcome') { if (window.HalDoWelcome) window.HalDoWelcome.show('Test App'); return; }
    if (action === 'app-expand') { const panel = currentTarget.querySelector(`[data-permpanel="${appId}"]`); if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; return; }
    if (action === 'app-perm') { const perm = btn.dataset.perm, cfg = getAppConfig(appId), newVal = !cfg.permissions[perm]; setAppConfig(appId, { permissions: {} }); state.apps[appId].permissions[perm] = newVal; save(); btn.classList.toggle('on', newVal); return; }
    if (action === 'app-test') { const c = getAppConfig(appId); if (!c.enabled || c.muted) return; HalDoAudio.playSound(c.sound); if (c.vibration) vibratePattern(get('audio.vibratePattern')); return; }
    if (action === 'app-toggle-mute') { const cm = getAppConfig(appId); setAppConfig(appId, { muted: !cm.muted }); refreshContent(); return; }
    if (action === 'app-toggle-enable') { const ce = getAppConfig(appId); setAppConfig(appId, { enabled: !ce.enabled }); refreshContent(); return; }
    if (action === 'app-status') { const cs = getAppConfig(appId); setAppConfig(appId, { muted: !cs.muted }); refreshContent(); return; }
    if (action === 'set-wallpaper') { set('display.wallpaper', btn.dataset.wallpaper); refreshContent(); return; }
    if (action === 'bt-scan') { doBluetoothScan(); return; }
    if (action === 'tts-test') { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance('HalDo KI ist bereit.'); u.rate = get('ai.ttsRate'); window.speechSynthesis.speak(u); } return; }
    if (action === 'kb-ai-correct' || action === 'kb-ai-formulate' || action === 'kb-ai-detail' || action === 'kb-ai-doc') { alert('HalDo KI analysiert den Text und führt die Aktion aus... (API Call simuliert)'); return; }
    if (action === 'clear-cache') { if (window.caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k))); alert('Cache geleert.'); return; }
    if (action === 'check-update') { set('update.lastCheck', new Date().toLocaleString('de-DE')); refreshContent(); alert('Du bist auf dem neuesten Stand: v' + VERSION); return; }
    if (action === 'reset-all') { if (confirm('Wirklich ALLE Einstellungen zurücksetzen?')) { state = JSON.parse(JSON.stringify(DEFAULTS)); save(); refreshContent(); } return; }
  }

  function onInput(e) {
    const el = e.target, action = el.dataset.action; if (!action) return;
    if (action.indexOf('set:') === 0) {
      const path = action.slice(4), val = el.value; set(path, el.type === 'range' ? parseFloat(val) : val);
      const row = el.closest('.hs-row');
      if (row) { const valEl = row.querySelector('.val'); if (valEl) { const unit = valEl.textContent.replace(/[\d.\-]/g, ''); valEl.textContent = (el.type === 'range' && path.indexOf('audio.') === 0) ? Math.round(val * 100) + '%' : val + unit; } }
      if (path === 'keyboard.aiText') save();
      return;
    }
    if (action === 'eq-bass' || action === 'eq-mid' || action === 'eq-treble') { const key = action.split('-')[1]; set('audio.eq.' + key, parseFloat(el.value)); const valEl = el.parentElement.querySelector('.val'); if (valEl) valEl.textContent = el.value; return; }
    if (action === 'app-volume') { const appId = el.dataset.appid; setAppConfig(appId, { volume: parseFloat(el.value), muted: false }); return; }
    if (action === 'app-search') { const q = el.value.toLowerCase(); currentTarget.querySelectorAll('#hs-apps-list .hs-app-row').forEach(row => { const name = row.querySelector('.app-name').textContent.toLowerCase(), appid = (row.dataset.appid || '').toLowerCase(); row.style.display = (name.indexOf(q) > -1 || appid.indexOf(q) > -1) ? '' : 'none'; }); return; }
  }

  function onChange(e) {
    const el = e.target, action = el.dataset.action; if (!action) return;
    if (action === 'app-sound') { const appId = el.dataset.appid; setAppConfig(appId, { sound: el.value }); HalDoAudio.playSound(el.value); return; }
    if (action.indexOf('set:') === 0) { set(action.slice(4), el.value); }
  }

  function doBluetoothScan() {
    const res = currentTarget ? currentTarget.querySelector('#hs-bt-results') : null; if (!res) return;
    if (!navigator.bluetooth) { res.innerHTML = '<div class="hs-empty">Web Bluetooth nicht verfügbar (HTTPS nötig).</div>'; return; }
    res.innerHTML = '<div class="hs-empty">Suche... Bitte Gerät im Popup wählen.</div>';
    navigator.bluetooth.requestDevice({ acceptAllDevices: true }).then(device => { res.innerHTML = `<div class="hs-row"><label>✅ ${esc(device.name || device.id)}</label><span class="val">verbunden</span></div>`; }).catch(err => { res.innerHTML = `<div class="hs-empty">Suche abgebrochen: ${esc(err.message)}</div>`; });
  }

  function open() {
    if (!state) load();
    const overlay = document.createElement('div'); overlay.className = 'haldo-settings-root';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0f;display:flex;flex-direction:column;';
    const closeBar = document.createElement('div'); closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;">⚙️ Einstellungen v${VERSION}</b><button class="hs-btn ghost" id="hs-close">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    const mount = document.createElement('div'); mount.style.cssText = 'flex:1;overflow:hidden;';
    overlay.appendChild(mount); document.body.appendChild(overlay);
    document.getElementById('hs-close').onclick = () => { const full = document.querySelector('.haldo-settings-root'); if (full) full.remove(); currentTarget = null; };
    render(mount); return mount;
  }

  try {
    load();
    window.HalDoAudio = HalDoAudio; // Export für andere Apps
    window.__haldoWelcomeEnabled = get('welcome.enabled'); window.__haldoWelcomeDuration = get('welcome.duration');
    
    const api = { open, render, getHTML, get, set, getAppConfig, setAppConfig, VERSION, getAllApps, APP_LIST: FALLBACK_APPS };
    window.HalDo = window.HalDo || {}; window.HalDo.settings = api; window.HalDo.Settings = api;
    window.HalDo.getAppConfig = getAppConfig; window.HalDo.setAppConfig = setAppConfig;
    window.HalDoSettings = api; window.Settings = api; window.openSettings = open;
    console.log('⚙️ HalDo Settings v' + VERSION + ' — AUDIO ENGINE INTEGRIERT & READY');
  } catch (initErr) {
    console.error('❌ HalDo Settings Init Fehler:', initErr);
  }
})();
