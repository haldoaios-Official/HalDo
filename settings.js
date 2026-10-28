/* HalDo Settings v31.2 — ULTIMATE SYSTEM CONTROL (Event Fix) */
(function () {
  'use strict';

  var VERSION = '31.2';
  var STORAGE_KEY = 'haldo.settings.v31';

  var DEFAULTS = {
    general: { deviceName: 'HalDo Device', model: 'HalDo X1 Pro', serial: 'HD-2026-00001', imei: '357000000000000', version: VERSION, build: '2026.10.28', installedApps: 0 },
    display: { brightness: 100, darkMode: true, accent: '#00d4ff', font: 'Inter', fontSize: 100, wallpaper: 'gradient-dark', nightLight: false, nightLightStart: '22:00', nightLightEnd: '07:00', adaptiveBrightness: true, screenTimeout: 60, doubleTapWake: true },
    audio: { master: 0.8, alarm: 0.9, notification: 0.7, ringtone: 'chime', silentMode: false, vibratePattern: 'standard', eq: { bass: 0, mid: 0, treble: 0 } },
    bluetooth: { wifi: true, bluetooth: false, nfc: false, location: true, airplane: false, hotspot: false, vpn: false },
    apps: {},
    dnd: { enabled: false, start: '22:00', end: '07:00', allowCalls: true, allowAlarms: true },
    accessibility: { screenReader: false, hapticFeedback: true, keyboardLanguages: ['de'], colorBlindMode: 'none' },
    security: { camera: true, mic: true, location: true, lockScreen: false, pin: '', biometrics: false },
    datetime: { format24h: true, dateFormat: 'DD.MM.YYYY', timezone: 'Europe/Berlin' },
    ai: { assistant: 'haldo-ai', ttsRate: 1.0, ttsPitch: 1.0, wakeWord: false },
    language: { system: 'de' },
    storage: { total: 100, used: 12.4 },
    keyboard: { languages: ['de'], ezidi: false, autocorrect: true, gestures: true },
    update: { currentVersion: VERSION, lastCheck: null, autoUpdate: true, betaChannel: false },
    battery: { percent: 87, charging: false, saver: false, saverThreshold: 20 },
    welcome: { enabled: true, duration: 2200, style: 'gold' }
  };

  var FALLBACK_APPS = [
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
        if (Array.isArray(list) && list.length > 0) {
          return list.map(function (a) {
            var id = a.id || a.key || a.slug || 'app';
            return { id: id, name: a.name || a.title || a.label || id, icon: a.icon || a.emoji || '📱' };
          });
        }
      }
    } catch (e) { }
    return FALLBACK_APPS;
  }

  var state = null;

  function mergeDeep(target, defaults) {
    var out = Object.assign({}, defaults);
    for (var k in target) {
      if (target[k] && typeof target[k] === 'object' && !Array.isArray(target[k]) && defaults[k] && typeof defaults[k] === 'object') out[k] = mergeDeep(target[k], defaults[k]);
      else out[k] = target[k];
    }
    return out;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = mergeDeep(JSON.parse(raw), DEFAULTS);
      else {
        var old = localStorage.getItem('haldo.settings.v30');
        if (old) state = mergeDeep(JSON.parse(old), DEFAULTS);
        else state = JSON.parse(JSON.stringify(DEFAULTS));
      }
    } catch (e) { state = JSON.parse(JSON.stringify(DEFAULTS)); }
    return state;
  }

  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

  function get(path) {
    var parts = path.split('.'), cur = state;
    for (var i = 0; i < parts.length; i++) { if (cur == null) return undefined; cur = cur[parts[i]]; }
    return cur;
  }

  function set(path, value) {
    var parts = path.split('.'), cur = state;
    for (var i = 0; i < parts.length - 1; i++) { if (cur[parts[i]] == null) cur[parts[i]] = {}; cur = cur[parts[i]]; }
    cur[parts[parts.length - 1]] = value;
    save(); applySideEffects(path, value);
  }

  function applySideEffects(path, value) {
    try {
      if (path === 'audio.master' && window.HalDoAudio) window.HalDoAudio.setMasterVolume(value);
      if (path === 'audio.silentMode' && window.HalDoAudio) {
        if (value) window.HalDoAudio.setMasterVolume(0);
        else window.HalDoAudio.setMasterVolume(get('audio.master'));
      }
      if (path.indexOf('audio.eq.') === 0 && window.HalDoAudio) window.HalDoAudio.setEQ(get('audio.eq.bass'), get('audio.eq.mid'), get('audio.eq.treble'));
      if (path === 'display.brightness') document.documentElement.style.setProperty('--haldo-brightness', value / 100);
      if (path === 'display.darkMode') document.documentElement.classList.toggle('haldo-dark', value);
      if (path === 'display.accent') document.documentElement.style.setProperty('--haldo-accent', value);
      if (path === 'display.fontSize') document.documentElement.style.fontSize = (value / 100 * 16) + 'px';
      if (path === 'display.nightLight') document.documentElement.style.filter = value ? 'sepia(0.3) hue-rotate(-15deg)' : '';
      if (path.indexOf('apps.') === 0 && window.HalDoAudio) {
        var appId = path.split('.')[1], cfg = state.apps[appId];
        if (cfg) { window.HalDoAudio.setAppVolume(appId, cfg.muted ? 0 : cfg.volume); window.HalDoAudio.setVibrationEnabled(appId, cfg.vibration); }
      }
      if (path === 'welcome.enabled') window.__haldoWelcomeEnabled = !!value;
      if (path === 'welcome.duration') window.__haldoWelcomeDuration = value;
    } catch (e) { }
  }

  function getAppConfig(appId) {
    if (!state.apps[appId]) {
      state.apps[appId] = { enabled: true, muted: false, volume: 0.7, sound: 'chime', vibration: true, permissions: { camera: false, mic: false, location: false } };
      save();
    }
    if (!state.apps[appId].permissions) state.apps[appId].permissions = { camera: false, mic: false, location: false };
    return Object.assign({}, state.apps[appId], { permissions: Object.assign({}, state.apps[appId].permissions) });
  }

  function setAppConfig(appId, patch) {
    var cur = getAppConfig(appId);
    if (patch.permissions) state.apps[appId] = Object.assign({}, cur, patch, { permissions: Object.assign({}, cur.permissions, patch.permissions) });
    else state.apps[appId] = Object.assign({}, cur, patch);
    save();
    var cfg = state.apps[appId];
    if (window.HalDoAudio) { window.HalDoAudio.setAppVolume(appId, cfg.muted ? 0 : cfg.volume); window.HalDoAudio.setVibrationEnabled(appId, cfg.vibration); }
    return cfg;
  }

  function css() {
    return `<style>
      .haldo-settings { font-family: Inter, system-ui, -apple-system, sans-serif; color: #e8e8ec; background: #0a0a0f; display: flex; height: 100%; min-height: 500px; border-radius: 10px; overflow: hidden; }
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
      .hs-select, .hs-input { background: #1a1a24; border: 1px solid #2a2a36; color: #e8e8ec; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-family: inherit; outline: none; }
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
    </style>`;
  }

  var CATS = [
    { id: 'general', icon: 'ℹ️', name: 'Allgemein & Info', group: 'A' },
    { id: 'display', icon: '🎨', name: 'Darstellung & Display', group: 'D' },
    { id: 'audio', icon: '🔊', name: 'Audio & Töne', group: 'A' },
    { id: 'apps', icon: '📱', name: 'Apps & Benachrichtigungen', group: 'A' },
    { id: 'welcome', icon: '🦚', name: 'Welcome-Begrüßung', group: 'W' },
    { id: 'bluetooth', icon: '📶', name: 'Bluetooth & Verbindungen', group: 'B' },
    { id: 'accessibility', icon: '♿', name: 'Bedienungshilfen', group: 'B' },
    { id: 'security', icon: '🔒', name: 'Datenschutz & Sicherheit', group: 'D' },
    { id: 'datetime', icon: '🕐', name: 'Datum & Uhrzeit', group: 'D' },
    { id: 'ai', icon: '🤖', name: 'HalDo KI & Stimme', group: 'H' },
    { id: 'language', icon: '🌐', name: 'Sprache & Region', group: 'S' },
    { id: 'storage', icon: '💾', name: 'Speicher', group: 'S' },
    { id: 'keyboard', icon: '⌨️', name: 'Tastatur', group: 'T' },
    { id: 'update', icon: '🔄', name: 'Software-Update', group: 'S' },
    { id: 'battery', icon: '🔋', name: 'Akku & Energie', group: 'A' },
    { id: 'about', icon: '📊', name: 'Über das Gerät', group: 'U' }
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rowToggle(label, path, action) { return '<div class="hs-row"><label>' + esc(label) + '</label><div class="hs-toggle ' + (!!get(path) ? 'on' : '') + '" data-action="' + action + '"></div></div>'; }
  function rowSlider(label, path, action, min, max, step, unit) { var val = get(path); return '<div class="hs-row"><label>' + esc(label) + '</label><input class="hs-slider" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" data-action="' + action + '"><span class="val">' + val + (unit || '') + '</span></div>'; }
  function rowSelect(label, path, action, options) { var val = get(path); var opts = options.map(function (o) { return '<option value="' + esc(o.value) + '"' + (o.value === val ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join(''); return '<div class="hs-row"><label>' + esc(label) + '</label><select class="hs-select" data-action="' + action + '">' + opts + '</select></div>'; }
  function rowInput(label, path, action, type) { var val = get(path); return '<div class="hs-row"><label>' + esc(label) + '</label><input class="hs-input" type="' + (type || 'text') + '" value="' + esc(val) + '" data-action="' + action + '"></div>'; }
  function rowInfo(label, value) { return '<div class="hs-row"><label>' + esc(label) + '</label><span class="val">' + esc(value) + '</span></div>'; }
  function rowButton(label, btnText, action, cls) { return '<div class="hs-row"><label>' + esc(label) + '</label><button class="hs-btn ' + (cls || '') + '" data-action="' + action + '">' + esc(btnText) + '</button></div>'; }

  function renderGeneral() {
    var apps = getAllApps(); try { state.general.installedApps = apps.length; } catch (e) {}
    return '<h1>ℹ️ Allgemein & Info</h1><div class="hs-section"><h3>Gerät</h3>' + rowInput('Gerätename', 'general.deviceName', 'set:general.deviceName') + rowInfo('Modell', get('general.model')) + rowInfo('Seriennummer', get('general.serial')) + rowInfo('Systemversion', VERSION) + rowInfo('Build', get('general.build')) + rowInfo('Installierte Apps', apps.length + ' Apps') + '</div><div class="hs-section"><h3>System</h3>' + rowInfo('Laufzeit', 'HalDo AI OS') + rowInfo('Theme', 'HalDo Dark') + rowButton('Werksreset (Einstellungen)', 'Zurücksetzen', 'reset-all', 'danger') + '</div>';
  }

  function renderDisplay() {
    var wallpapers = [ { id: 'gradient-dark', label: 'Dunkel', style: 'linear-gradient(180deg, #050810 0%, #0a0f1a 100%)' }, { id: 'gradient-blue', label: 'Blau', style: 'linear-gradient(180deg, #001a4d 0%, #003580 100%)' }, { id: 'gradient-purple', label: 'Lila', style: 'linear-gradient(180deg, #1a0033 0%, #4d0080 100%)' }, { id: 'gradient-gold', label: 'Gold', style: 'linear-gradient(180deg, #1a1000 0%, #4d3a00 100%)' }, { id: 'gradient-teal', label: 'Türkis', style: 'linear-gradient(180deg, #001a1a 0%, #004d4d 100%)' }, { id: 'gradient-red', label: 'Rot', style: 'linear-gradient(180deg, #1a0000 0%, #4d0000 100%)' }, { id: 'solid-black', label: 'Schwarz', style: '#000' }, { id: 'solid-navy', label: 'Navy', style: '#0a1428' } ];
    var current = get('display.wallpaper');
    var wpGrid = wallpapers.map(function (w) { return '<div class="hs-wallpaper-item ' + (w.id === current ? 'active' : '') + '" style="background: ' + w.style + '" data-action="set-wallpaper" data-wallpaper="' + w.id + '" title="' + w.label + '"></div>'; }).join('');
    return '<h1>🎨 Darstellung & Display</h1><div class="hs-section"><h3>Helligkeit & Modus</h3>' + rowSlider('Helligkeit', 'display.brightness', 'set:display.brightness', 10, 100, 1, '%') + rowToggle('Dark Mode', 'display.darkMode', 'toggle:display.darkMode') + rowToggle('Adaptive Helligkeit', 'display.adaptiveBrightness', 'toggle:display.adaptiveBrightness') + rowToggle('Nachtlicht (Blaufilter)', 'display.nightLight', 'toggle:display.nightLight') + '</div><div class="hs-section"><h3>Akzentfarbe</h3><div class="hs-row"><label>Akzentfarbe</label><input class="hs-color" type="color" value="' + esc(get('display.accent')) + '" data-action="set:display.accent"></div></div><div class="hs-section"><h3>Hintergrundbild</h3><div class="hs-wallpaper-grid">' + wpGrid + '</div></div><div class="hs-section"><h3>Schrift</h3>' + rowSelect('Schriftart', 'display.font', 'set:display.font', [ { value: 'Inter', label: 'Inter' }, { value: 'system-ui', label: 'System' }, { value: 'Georgia', label: 'Georgia' }, { value: 'monospace', label: 'Monospace' } ]) + rowSlider('Schriftgröße', 'display.fontSize', 'set:display.fontSize', 80, 140, 5, '%') + '</div><div class="hs-section"><h3>Bildschirm</h3>' + rowSelect('Timeout', 'display.screenTimeout', 'set:display.screenTimeout', [ { value: 15, label: '15 Sekunden' }, { value: 30, label: '30 Sekunden' }, { value: 60, label: '1 Minute' }, { value: 120, label: '2 Minuten' }, { value: 300, label: '5 Minuten' }, { value: 0, label: 'Nie' } ]) + rowToggle('Doppeltippen zum Aufwecken', 'display.doubleTapWake', 'toggle:display.doubleTapWake') + '</div>';
  }

  function renderAudio() {
    var sounds = (window.HalDoAudio && window.HalDoAudio.listSounds) ? window.HalDoAudio.listSounds() : ['ping', 'ding', 'chime', 'bell', 'marimba', 'alarm'];
    var soundOpts = sounds.map(function (s) { return { value: s, label: s }; }); var eq = get('audio.eq') || { bass: 0, mid: 0, treble: 0 };
    return '<h1>🔊 Audio & Töne</h1><div class="hs-section"><h3>Lautstärke</h3>' + rowSlider('Master', 'audio.master', 'set:audio.master', 0, 1, 0.01, '') + rowSlider('Alarm', 'audio.alarm', 'set:audio.alarm', 0, 1, 0.01, '') + rowSlider('Benachrichtigung', 'audio.notification', 'set:audio.notification', 0, 1, 0.01, '') + rowToggle('Lautlos-Modus', 'audio.silentMode', 'toggle:audio.silentMode') + '</div><div class="hs-section"><h3>Klingelton</h3>' + rowSelect('Klingelton', 'audio.ringtone', 'set:audio.ringtone', soundOpts) + rowButton('Klingelton testen', '🔊 Test', 'test-ringtone') + '</div><div class="hs-section"><h3>Vibration</h3>' + rowSelect('Muster', 'audio.vibratePattern', 'set:audio.vibratePattern', [ { value: 'standard', label: 'Standard [40ms]' }, { value: 'long', label: 'Lang [200ms]' }, { value: 'short', label: 'Kurz [20ms]' }, { value: 'heartbeat', label: 'Herzschlag [60-100-60]' }, { value: 'none', label: 'Keine' } ]) + rowButton('Vibration testen', '📳 Test', 'test-vibration') + '</div><div class="hs-section"><h3>Equalizer</h3><div class="hs-eq"><div class="hs-eq-slider"><label>Bass</label><input type="range" min="-15" max="15" step="1" value="' + eq.bass + '" data-action="eq-bass"><span class="val">' + eq.bass + '</span></div><div class="hs-eq-slider"><label>Mid</label><input type="range" min="-15" max="15" step="1" value="' + eq.mid + '" data-action="eq-mid"><span class="val">' + eq.mid + '</span></div><div class="hs-eq-slider"><label>Treble</label><input type="range" min="-15" max="15" step="1" value="' + eq.treble + '" data-action="eq-treble"><span class="val">' + eq.treble + '</span></div></div>' + rowButton('Equalizer testen', '🔊 Test', 'test-eq') + '</div>';
  }

  function renderApps() {
    var apps = getAllApps();
    var rows = apps.map(function (app) {
      var cfg = getAppConfig(app.id);
      var statusClass = !cfg.enabled ? 'off' : (cfg.muted ? 'muted' : 'on');
      var statusText = !cfg.enabled ? 'Aus' : (cfg.muted ? 'Stumm' : 'An');
      var sounds = (window.HalDoAudio && window.HalDoAudio.listSounds) ? window.HalDoAudio.listSounds() : ['ping', 'ding', 'chime', 'bell', 'alarm', 'marimba'];
      var opts = sounds.map(function (s) { return '<option value="' + s + '"' + (s === cfg.sound ? ' selected' : '') + '>' + s + '</option>'; }).join('');
      return '<div class="hs-app-row" data-appid="' + esc(app.id) + '"><div class="app-icon" data-action="app-expand" data-appid="' + esc(app.id) + '">' + app.icon + '</div><div class="app-name" data-action="app-expand" data-appid="' + esc(app.id) + '">' + esc(app.name) + '</div><input class="hs-slider app-vol" type="range" min="0" max="1" step="0.05" value="' + cfg.volume + '" data-action="app-volume" data-appid="' + esc(app.id) + '"><select class="hs-select app-sound" data-action="app-sound" data-appid="' + esc(app.id) + '">' + opts + '</select><span class="hs-badge ' + statusClass + '" data-action="app-status" data-appid="' + esc(app.id) + '">' + statusText + '</span><div style="display:flex; gap:4px;"><button class="hs-btn sm" data-action="app-test" data-appid="' + esc(app.id) + '">🔊</button><button class="hs-btn sm ghost" data-action="app-toggle-mute" data-appid="' + esc(app.id) + '">' + (cfg.muted ? '🔔' : '🔕') + '</button><button class="hs-btn sm ghost" data-action="app-toggle-enable" data-appid="' + esc(app.id) + '">' + (cfg.enabled ? '⏸️' : '▶️') + '</button></div></div><div class="hs-perm-panel" data-permpanel="' + esc(app.id) + '" style="display:none;"><div class="hs-panel"><h4>Berechtigungen für ' + esc(app.name) + '</h4><div class="hs-perm-row"><button class="hs-perm-btn ' + (cfg.permissions.camera ? 'on' : '') + '" data-action="app-perm" data-appid="' + esc(app.id) + '" data-perm="camera">📷 Kamera</button><button class="hs-perm-btn ' + (cfg.permissions.mic ? 'on' : '') + '" data-action="app-perm" data-appid="' + esc(app.id) + '" data-perm="mic">🎤 Mikrofon</button><button class="hs-perm-btn ' + (cfg.permissions.location ? 'on' : '') + '" data-action="app-perm" data-appid="' + esc(app.id) + '" data-perm="location">📍 Standort</button></div></div></div>';
    }).join('');
    return '<h1>📱 Apps & Benachrichtigungen</h1><div class="hs-section" style="padding: 10px 12px; margin-bottom: 8px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:12px; color:#888;">Master:</span><input class="hs-slider" type="range" min="0" max="1" step="0.01" value="' + get('audio.master') + '" data-action="set:audio.master"><span class="val">' + Math.round(get('audio.master') * 100) + '%</span></div></div><div class="hs-section"><h3>Ruhezeiten / Do Not Disturb</h3>' + rowToggle('Aktiv', 'dnd.enabled', 'toggle:dnd.enabled') + rowToggle('Anrufe erlauben', 'dnd.allowCalls', 'toggle:dnd.allowCalls') + rowToggle('Alarme erlauben', 'dnd.allowAlarms', 'toggle:dnd.allowAlarms') + '</div><input class="hs-search" type="text" placeholder="🔍 App suchen..." data-action="app-search"><div class="hs-section" id="hs-apps-list">' + rows + '</div>';
  }

  function renderWelcome() {
    return '<h1>🦚 Welcome-Begrüßung</h1><div class="hs-section"><h3>Beim App-Öffnen</h3>' + rowToggle('Welcome anzeigen', 'welcome.enabled', 'toggle:welcome.enabled') + rowSelect('Dauer', 'welcome.duration', 'set:welcome.duration', [ { value: 1000, label: '1 Sekunde' }, { value: 1500, label: '1,5 Sekunden' }, { value: 2200, label: '2,2 Sekunden (Standard)' }, { value: 3000, label: '3 Sekunden' }, { value: 4000, label: '4 Sekunden' } ]) + rowButton('Vorschau testen', '👁️ Vorschau', 'test-welcome') + '</div><div class="hs-section"><h3>Info</h3><div style="font-size: 12px; color: #888; line-height: 1.6;">Die Willkommens-Begrüßung erscheint jedes Mal, wenn du eine App öffnest.<br>Pfau, Sonne und goldener Schimmer — mit dem App-Namen.<br><br>Klick auf die Begrüßung überspringt sie sofort.</div></div>';
  }

  function renderBluetooth() {
    return '<h1>📶 Bluetooth & Verbindungen</h1><div class="hs-section"><h3>Verbindungen</h3>' + rowToggle('WLAN', 'bluetooth.wifi', 'toggle:bluetooth.wifi') + rowToggle('Bluetooth', 'bluetooth.bluetooth', 'toggle:bluetooth.bluetooth') + rowToggle('NFC', 'bluetooth.nfc', 'toggle:bluetooth.nfc') + rowToggle('Standortdienste', 'bluetooth.location', 'toggle:bluetooth.location') + rowToggle('Flugmodus', 'bluetooth.airplane', 'toggle:bluetooth.airplane') + rowToggle('Hotspot', 'bluetooth.hotspot', 'toggle:bluetooth.hotspot') + rowToggle('VPN', 'bluetooth.vpn', 'toggle:bluetooth.vpn') + '</div><div class="hs-section"><h3>Bluetooth-Geräte</h3>' + rowButton('Gerätesuche (Web Bluetooth)', '🔍 Suchen', 'bt-scan') + '<div id="hs-bt-results" class="hs-empty">Noch keine Suche gestartet.</div></div>';
  }

  function renderAccessibility() {
    return '<h1>♿ Bedienungshilfen</h1><div class="hs-section"><h3>Screenreader & Feedback</h3>' + rowToggle('Bildschirmleser (TalkBack)', 'accessibility.screenReader', 'toggle:accessibility.screenReader') + rowToggle('Vibration bei Eingabe', 'accessibility.hapticFeedback', 'toggle:accessibility.hapticFeedback') + '</div><div class="hs-section"><h3>Farbenblindheit</h3>' + rowSelect('Modus', 'accessibility.colorBlindMode', 'set:accessibility.colorBlindMode', [ { value: 'none', label: 'Keine' }, { value: 'protanopia', label: 'Protanopie (Rot)' }, { value: 'deuteranopia', label: 'Deuteranopie (Grün)' }, { value: 'tritanopia', label: 'Tritanopie (Blau)' } ]) + '</div><div class="hs-section"><h3>Keyboard-Sprachen</h3>' + rowButton('Aktiv: ' + (get('accessibility.keyboardLanguages') || []).join(', '), '+ Sprache', 'kb-lang-add', 'ghost') + '</div>';
  }

  function renderSecurity() {
    return '<h1>🔒 Datenschutz & Sicherheit</h1><div class="hs-section"><h3>Globale Berechtigungen</h3>' + rowToggle('Kamera', 'security.camera', 'toggle:security.camera') + rowToggle('Mikrofon', 'security.mic', 'toggle:security.mic') + rowToggle('Standort', 'security.location', 'toggle:security.location') + '</div><div class="hs-section"><h3>Sperre</h3>' + rowToggle('Bildschirmsperre', 'security.lockScreen', 'toggle:security.lockScreen') + rowToggle('Biometrie (Finger/Face)', 'security.biometrics', 'toggle:security.biometrics') + rowButton('PIN ändern', 'PIN setzen', 'set-pin') + '</div><div class="hs-section"><h3>Privatsphäre</h3>' + rowButton('Diagnosedaten löschen', 'Löschen', 'clear-diagnostics', 'ghost') + '</div>';
  }

  function renderDatetime() {
    return '<h1>🕐 Datum & Uhrzeit</h1><div class="hs-section"><h3>Format</h3>' + rowToggle('24-Stunden-Format', 'datetime.format24h', 'toggle:datetime.format24h') + rowSelect('Datumsformat', 'datetime.dateFormat', 'set:datetime.dateFormat', [ { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' } ]) + '</div><div class="hs-section"><h3>Zeitzone</h3>' + rowSelect('Zeitzone', 'datetime.timezone', 'set:datetime.timezone', [ { value: 'Europe/Berlin', label: 'Berlin (MEZ)' }, { value: 'Europe/Istanbul', label: 'Istanbul' }, { value: 'America/New_York', label: 'New York' }, { value: 'Asia/Tokyo', label: 'Tokyo' } ]) + '</div>';
  }

  function renderAI() {
    return '<h1>🤖 HalDo KI & Stimme</h1><div class="hs-section"><h3>Assistent</h3>' + rowSelect('Assistent', 'ai.assistant', 'set:ai.assistant', [ { value: 'haldo-ai', label: 'HalDo AI' }, { value: 'haldo-ki', label: 'HalDo KI' }, { value: 'cyborg', label: 'Cyborg' }, { value: 'roboter', label: 'Roboter' } ]) + rowToggle('Wake Word ("Hey HalDo")', 'ai.wakeWord', 'toggle:ai.wakeWord') + '</div><div class="hs-section"><h3>TTS (Text-to-Speech)</h3>' + rowSlider('Geschwindigkeit', 'ai.ttsRate', 'set:ai.ttsRate', 0.5, 2, 0.1, 'x') + rowSlider('Tonhöhe', 'ai.ttsPitch', 'set:ai.ttsPitch', 0.5, 2, 0.1, 'x') + rowButton('Stimme testen', '🔊 Test', 'tts-test') + '</div>';
  }

  function renderLanguage() {
    return '<h1>🌐 Sprache & Region</h1><div class="hs-section"><h3>Systemsprache</h3>' + rowSelect('Sprache', 'language.system', 'set:language.system', [ { value: 'de', label: 'Deutsch' }, { value: 'en', label: 'English' }, { value: 'tr', label: 'Türkçe' }, { value: 'ar', label: 'العربية' }, { value: 'ku', label: 'Kurdî' }, { value: 'ez', label: 'Ezidi' } ]) + '</div>';
  }

  function renderStorage() {
    var used = get('storage.used'), total = get('storage.total'), free = (total - used).toFixed(1), pct = Math.round((used / total) * 100);
    return '<h1>💾 Speicher</h1><div class="hs-section"><h3>Speicherbelegung</h3>' + rowInfo('Gesamt', total + ' GB') + rowInfo('Belegt', used + ' GB (' + pct + '%)') + rowInfo('Frei', free + ' GB') + '<div style="margin: 10px 0;"><div style="height: 8px; background: #222; border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ' + pct + '%; background: linear-gradient(90deg, var(--haldo-accent, #00d4ff), #b478ff);"></div></div></div>' + rowButton('Cache leeren', 'Cache leeren', 'clear-cache', 'ghost') + '</div>';
  }

  function renderKeyboard() {
    return '<h1>⌨️ Tastatur</h1><div class="hs-section"><h3>Sprachen</h3>' + rowButton('Aktiv: ' + (get('keyboard.languages') || []).join(', '), '+ Sprache', 'kb-lang-add', 'ghost') + rowToggle('Ezidi (alte Schrift)', 'keyboard.ezidi', 'toggle:keyboard.ezidi') + '</div><div class="hs-section"><h3>Verhalten</h3>' + rowToggle('Autokorrektur', 'keyboard.autocorrect', 'toggle:keyboard.autocorrect') + rowToggle('Gesten (Wischen)', 'keyboard.gestures', 'toggle:keyboard.gestures') + '</div>';
  }

  function renderUpdate() {
    var last = get('update.lastCheck');
    return '<h1>🔄 Software-Update</h1><div class="hs-section"><h3>Version</h3>' + rowInfo('Aktuell', get('update.currentVersion')) + rowInfo('Letzte Prüfung', last || 'Nie') + '</div><div class="hs-section"><h3>Kanäle</h3>' + rowToggle('Automatische Updates', 'update.autoUpdate', 'toggle:update.autoUpdate') + rowToggle('Beta-Kanal', 'update.betaChannel', 'toggle:update.betaChannel') + '</div><div class="hs-section"><h3>Aktionen</h3>' + rowButton('Nach Update suchen', 'Suchen', 'check-update') + rowButton('Auf Werkseinstellungen', 'Reset', 'reset-all', 'danger') + '</div>';
  }

  function renderBattery() {
    var pct = get('battery.percent'), charging = get('battery.charging');
    return '<h1>🔋 Akku & Energie</h1><div class="hs-section"><h3>Status</h3>' + rowInfo('Akkustand', pct + '%') + rowInfo('Lädt', charging ? 'Ja ⚡' : 'Nein') + rowInfo('Energiesparmodus', get('battery.saver') ? 'Aktiv' : 'Inaktiv') + '<div style="margin: 10px 0;"><div style="height: 8px; background: #222; border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ' + pct + '%; background: ' + (pct > 20 ? '#0a6' : '#c33') + ';"></div></div></div></div><div class="hs-section"><h3>Energiesparmodus</h3>' + rowToggle('Energiesparmodus', 'battery.saver', 'toggle:battery.saver') + rowSlider('Schwelle (%)', 'battery.saverThreshold', 'set:battery.saverThreshold', 5, 50, 5, '%') + '</div>';
  }

  function renderAbout() {
    return '<h1>📊 Über das Gerät</h1><div class="hs-section"><h3>Hardware</h3>' + rowInfo('Modell', get('general.model')) + rowInfo('Seriennummer', get('general.serial')) + rowInfo('IMEI', get('general.imei')) + rowInfo('Prozessor', 'HalDo Quantum X1') + rowInfo('RAM', '16 GB') + rowInfo('Speicher', get('storage.total') + ' GB') + '</div><div class="hs-section"><h3>Software</h3>' + rowInfo('Betriebssystem', 'HalDo AI OS') + rowInfo('Version', VERSION) + rowInfo('Build', get('general.build')) + rowInfo('Kernel', 'HalDo Kernel 5.1') + '</div><div class="hs-section"><h3>Entwickler</h3><div style="font-size: 12px; color: #888; line-height: 1.6;"><b>HalDo AI OS</b><br>Erstellt von <b>Halil Donma</b><br>KI-betriebenes Betriebssystem im Browser<br><br>🦚 Vielen Dank für dein Vertrauen!</div></div>';
  }

  var RENDERERS = {
    general: renderGeneral, display: renderDisplay, audio: renderAudio, apps: renderApps, welcome: renderWelcome, bluetooth: renderBluetooth, accessibility: renderAccessibility, security: renderSecurity, datetime: renderDatetime, ai: renderAI, language: renderLanguage, storage: renderStorage, keyboard: renderKeyboard, update: renderUpdate, battery: renderBattery, about: renderAbout
  };

  var active = 'general';
  var currentTarget = null;

  function buildSidebar() {
    var groups = {}; CATS.forEach(function (c) { (groups[c.group] = groups[c.group] || []).push(c); });
    return Object.keys(groups).sort().map(function (g) {
      var items = groups[g].map(function (c) { return '<div class="hs-nav-item ' + (c.id === active ? 'active' : '') + '" data-cat="' + c.id + '"><span class="icon">' + c.icon + '</span><span>' + esc(c.name) + '</span></div>'; }).join('');
      return '<h2>' + g + '</h2>' + items;
    }).join('');
  }

  function getHTML() {
    var renderer = RENDERERS[active] || renderGeneral;
    return css() + '<div class="haldo-settings"><div class="hs-sidebar">' + buildSidebar() + '</div><div class="hs-content" id="hs-content">' + renderer() + '</div></div>';
  }

  function refreshContent() {
    if (!currentTarget) return;
    var el = currentTarget.querySelector('#hs-content');
    if (el) { var renderer = RENDERERS[active] || renderGeneral; el.innerHTML = renderer(); }
    var sidebar = currentTarget.querySelector('.hs-sidebar');
    if (sidebar) sidebar.innerHTML = buildSidebar();
  }

  function render(target) {
    if (target && target.nodeType === 1) currentTarget = target;
    if (!currentTarget) currentTarget = document.body;
    currentTarget.innerHTML = getHTML();
    if (!currentTarget.__haldoSettingsBound) {
      currentTarget.addEventListener('click', onClick);
      currentTarget.addEventListener('input', onInput);
      currentTarget.addEventListener('change', onChange);
      currentTarget.__haldoSettingsBound = true;
    }
    return currentTarget;
  }

  function vibratePattern(pattern) {
    if (!navigator.vibrate) return;
    switch (pattern) {
      case 'long': navigator.vibrate([200]); break;
      case 'short': navigator.vibrate([20]); break;
      case 'heartbeat': navigator.vibrate([60, 40, 100, 40, 60]); break;
      case 'none': break;
      default: navigator.vibrate([40]);
    }
  }

  function onClick(e) {
    var nav = e.target.closest('.hs-nav-item');
    if (nav) { active = nav.dataset.cat; refreshContent(); return; }

    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action, appId = btn.dataset.appid;

    if (action.indexOf('toggle:') === 0) { var path = action.slice(7); set(path, !get(path)); refreshContent(); return; }
    if (action === 'test-ringtone') { if (window.HalDoAudio) window.HalDoAudio.playSound(get('audio.ringtone') || 'chime', 'system'); return; }
    if (action === 'test-vibration') { vibratePattern(get('audio.vibratePattern')); return; }
    if (action === 'test-eq') { if (window.HalDoAudio) window.HalDoAudio.playSound('marimba', 'system'); return; }
    if (action === 'test-welcome') { if (window.HalDoWelcome) window.HalDoWelcome.show('Test App'); else alert('Welcome-System nicht geladen'); return; }
    
    if (action === 'app-expand') {
      var panel = currentTarget.querySelector('[data-permpanel="' + appId + '"]');
      if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; return;
    }
    if (action === 'app-perm') {
      var perm = btn.dataset.perm, cfg = getAppConfig(appId), newVal = !cfg.permissions[perm];
      setAppConfig(appId, { permissions: {} }); state.apps[appId].permissions[perm] = newVal; save(); btn.classList.toggle('on', newVal); return;
    }
    if (action === 'app-test') {
      var c = getAppConfig(appId); if (!c.enabled || c.muted) return;
      if (window.HalDoAudio) window.HalDoAudio.playSound(c.sound, appId);
      if (c.vibration) vibratePattern(get('audio.vibratePattern')); return;
    }
    if (action === 'app-toggle-mute') { var cm = getAppConfig(appId); setAppConfig(appId, { muted: !cm.muted }); refreshContent(); return; }
    if (action === 'app-toggle-enable') { var ce = getAppConfig(appId); setAppConfig(appId, { enabled: !ce.enabled }); refreshContent(); return; }
    
    // NEU: Wenn auf das "An/Aus"-Badge geklickt wird
    if (action === 'app-status') {
      var cs = getAppConfig(appId);
      setAppConfig(appId, { muted: !cs.muted });
      refreshContent();
      return;
    }

    if (action === 'set-wallpaper') { set('display.wallpaper', btn.dataset.wallpaper); refreshContent(); return; }
    if (action === 'bt-scan') { doBluetoothScan(); return; }
    if (action === 'tts-test') { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance('HalDo KI ist bereit.'); u.rate = get('ai.ttsRate'); u.pitch = get('ai.ttsPitch'); window.speechSynthesis.speak(u); } return; }
    if (action === 'clear-cache') { if (window.caches) caches.keys().then(function (keys) { keys.forEach(function (k) { caches.delete(k); }); }); alert('Cache geleert.'); return; }
    if (action === 'clear-diagnostics') { if (confirm('Diagnosedaten löschen?')) alert('Diagnosedaten gelöscht.'); return; }
    if (action === 'check-update') { set('update.lastCheck', new Date().toLocaleString('de-DE')); refreshContent(); alert('Du bist auf dem neuesten Stand: v' + VERSION); return; }
    if (action === 'set-pin') { var pin = prompt('Neue PIN (4-6 Ziffern):'); if (pin && /^\d{4,6}$/.test(pin)) { set('security.pin', pin); alert('PIN gesetzt.'); } else if (pin) { alert('Ungültig. Bitte 4-6 Ziffern.'); } return; }
    if (action === 'reset-all') { if (confirm('Wirklich ALLE Einstellungen zurücksetzen?')) { state = JSON.parse(JSON.stringify(DEFAULTS)); save(); refreshContent(); } return; }
    if (action === 'kb-lang-add') { var lang = prompt('Sprachcode (z.B. de, en, tr, ku, ez):'); if (lang) { var arr = get('keyboard.languages') || []; if (arr.indexOf(lang) === -1) arr.push(lang); set('keyboard.languages', arr); refreshContent(); } return; }
  }

  function onInput(e) {
    var el = e.target, action = el.dataset.action; if (!action) return;
    if (action.indexOf('set:') === 0) {
      var path = action.slice(4), val = el.value; if (el.type === 'range') val = parseFloat(val); set(path, val);
      var row = el.closest('.hs-row');
      if (row) { var valEl = row.querySelector('.val'); if (valEl) { var unit = valEl.textContent.replace(/[\d.\-]/g, ''); valEl.textContent = (el.type === 'range' && path.indexOf('audio.') === 0) ? Math.round(val * 100) + '%' : val + unit; } }
      return;
    }
    if (action === 'eq-bass' || action === 'eq-mid' || action === 'eq-treble') {
      var key = action.split('-')[1]; set('audio.eq.' + key, parseFloat(el.value));
      var valEl = el.parentElement.querySelector('.val'); if (valEl) valEl.textContent = el.value;
      if (window.HalDoAudio) window.HalDoAudio.setEQ(get('audio.eq.bass'), get('audio.eq.mid'), get('audio.eq.treble')); return;
    }
    if (action === 'app-volume') { var appId = el.dataset.appid; setAppConfig(appId, { volume: parseFloat(el.value), muted: false }); return; }
    if (action === 'app-search') {
      var q = el.value.toLowerCase();
      currentTarget.querySelectorAll('#hs-apps-list .hs-app-row').forEach(function (row) {
        var name = row.querySelector('.app-name').textContent.toLowerCase(), appid = (row.dataset.appid || '').toLowerCase();
        row.style.display = (name.indexOf(q) > -1 || appid.indexOf(q) > -1) ? '' : 'none';
      });
      return;
    }
  }

  function onChange(e) {
    var el = e.target, action = el.dataset.action; if (!action) return;
    if (action === 'app-sound') { var appId = el.dataset.appid; setAppConfig(appId, { sound: el.value }); if (window.HalDoAudio) window.HalDoAudio.playSound(el.value, appId); return; }
    if (action.indexOf('set:') === 0) { set(action.slice(4), el.value); }
  }

  function doBluetoothScan() {
    var res = currentTarget ? currentTarget.querySelector('#hs-bt-results') : null; if (!res) return;
    if (!navigator.bluetooth) { res.innerHTML = '<div class="hs-empty">Web Bluetooth nicht verfügbar (HTTPS nötig).</div>'; return; }
    res.innerHTML = '<div class="hs-empty">Suche... Bitte Gerät im Popup wählen.</div>';
    navigator.bluetooth.requestDevice({ acceptAllDevices: true })
      .then(function (device) { res.innerHTML = '<div class="hs-row"><label>✅ ' + esc(device.name || device.id) + '</label><span class="val">verbunden</span></div>'; })
      .catch(function (err) { res.innerHTML = '<div class="hs-empty">Suche abgebrochen: ' + esc(err.message) + '</div>'; });
  }

  function initBatteryAPI() {
    try {
      if (!navigator.getBattery) return;
      navigator.getBattery().then(function (battery) {
        function update() { state.battery.percent = Math.round(battery.level * 100); state.battery.charging = battery.charging; save(); if (active === 'battery') refreshContent(); }
        update(); battery.addEventListener('levelchange', update); battery.addEventListener('chargingchange', update);
      }).catch(function () {});
    } catch (e) {}
  }

  function open() {
    if (!state) load();
    var overlay = document.createElement('div'); overlay.className = 'haldo-settings-root';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0f;display:flex;flex-direction:column;';
    var closeBar = document.createElement('div'); closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = '<b style="color:#e8e8ec;">⚙️ Einstellungen v' + VERSION + '</b><button class="hs-btn ghost" id="hs-close">✕ Schließen</button>';
    overlay.appendChild(closeBar);
    var mount = document.createElement('div'); mount.style.cssText = 'flex:1;overflow:hidden;';
    overlay.appendChild(mount); document.body.appendChild(overlay);
    document.getElementById('hs-close').onclick = close; render(mount); return mount;
  }

  function close() { var full = document.querySelector('.haldo-settings-root'); if (full) full.remove(); currentTarget = null; }

  try {
    load();
    if (window.HalDoAudio) {
      try {
        window.HalDoAudio.setMasterVolume(get('audio.master'));
        window.HalDoAudio.setEQ(get('audio.eq.bass'), get('audio.eq.mid'), get('audio.eq.treble'));
        Object.keys(state.apps).forEach(function (id) {
          var cfg = state.apps[id]; window.HalDoAudio.setAppVolume(id, cfg.muted ? 0 : cfg.volume); window.HalDoAudio.setVibrationEnabled(id, cfg.vibration);
        });
      } catch (e) { }
    }
    window.__haldoWelcomeEnabled = get('welcome.enabled'); window.__haldoWelcomeDuration = get('welcome.duration');
    initBatteryAPI();

    var api = { open: open, close: close, render: render, mount: render, getHTML: getHTML, get: get, set: set, getAppConfig: getAppConfig, setAppConfig: setAppConfig, VERSION: VERSION, getAllApps: getAllApps, APP_LIST: FALLBACK_APPS };
    window.HalDo = window.HalDo || {}; window.HalDo.settings = api; window.HalDo.Settings = api;
    window.HalDo.getAppConfig = getAppConfig; window.HalDo.setAppConfig = setAppConfig;
    window.HalDoSettings = api; window.Settings = api; window.openSettings = open;
    console.log('⚙️ HalDo Settings v' + VERSION + ' — Event Fix aktiv');
  } catch (initErr) {
    console.error('❌ HalDo Settings Init Fehler:', initErr);
    var fallback = { open: function () { var el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#111;color:#fff;padding:20px;font-family:sans-serif;overflow:auto;'; el.innerHTML = '<h1>⚙️ Einstellungen</h1><p style="color:#f80;">Fehler beim Laden: ' + (initErr.message || initErr) + '</p><button onclick="this.parentElement.remove()" style="padding:10px 20px;background:#00d4ff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">Schließen</button>'; document.body.appendChild(el); }, render: function (target) { if (target && target.nodeType === 1) { target.innerHTML = '<div style="color:#f80;padding:20px;">Einstellungen nicht verfügbar: ' + (initErr.message || initErr) + '</div>'; } }, VERSION: 'fallback', getAppConfig: function () { return {}; }, setAppConfig: function () {}, get: function () {}, set: function () {} };
    window.HalDoSettings = fallback; window.HalDo = window.HalDo || {}; window.HalDo.Settings = fallback; window.HalDo.settings = fallback; window.openSettings = fallback.open;
  }
})();
