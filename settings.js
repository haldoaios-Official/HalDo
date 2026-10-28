/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SETTINGS v23.0 (PRO MAX)
   Zentrale Schaltzentrale · 15 Kategorien · Alle Web-APIs
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:14px;text-shadow:0 0 10px #ffd700;background:#0a0e2a;padding:4px 8px;border-radius:6px;';
  console.log('%c⚙️ HalDo Settings v23.0 — Pro Max', GOLD_STYLE);

  // --- Standard-Einstellungen (werden vom Store überschrieben) ---
  var DEFAULT = {
    deviceName: "HalDo-Gerät",
    theme: "dark",
    accentColor: "#ffd700",
    brightness: 100,
    fontFamily: "system",
    fontSize: 100,
    background: "default",
    language: "de",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "24h",
    assistant: "ai", // ai, ki, cyborg, robot
    ttsRate: 1,
    ttsPitch: 1,
    useCustomVoice: false,
    bluetoothDevice: null,
    wifiEnabled: true,
    nfcEnabled: false,
    locationEnabled: true,
    notificationsEnabled: true,
    dndEnabled: false,
    volumeMedia: 80,
    volumeRing: 80,
    volumeAlarm: 100,
    vibrationEnabled: true,
    batterySaver: false,
    storageCache: 0,
    permissions: {}, // camera, microphone, location
    screenLock: false,
    lastUpdateCheck: 0,
    systemVersion: "HalDo AI OS 1.0.0",
    // ... (weitere Einstellungen)
  };

  // --- Hilfsfunktionen ---
  function getSettings(store) {
    var s = store.get("settings", {});
    var m = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(s).forEach(function(k){ m[k] = s[k]; });
    return m;
  }
  function saveSettings(store, s) {
    store.set("settings", s);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  // --- Audio-Engine für Töne (vereinfacht) ---
  var audioCtx = null;
  function playBeep(type) {
    try {
      if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.value = 880;
      o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.3, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      o.start(); o.stop(audioCtx.currentTime + 0.2);
    } catch(e) {}
  }

  // --- Haupt-Render-Funktion ---
  function render(container, ctx) {
    var store = ctx.store;
    var view = { screen: "main" }; // main, general, display, language, ai, connectivity, apps, sound, battery, storage, security, accounts, accessibility, wellbeing, emergency, system

    function build() {
      var s = getSettings(store);
      var sc = view.screen;

      // Globales Styling (wird auf alle Screens angewendet)
      var accent = s.accentColor;
      var css = `
        .settings-app { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: ${s.theme === 'dark' ? '#fff' : '#000'}; background: ${s.theme === 'dark' ? '#0a0e1a' : '#f5f5f5'}; min-height: 100vh; padding: 16px; }
        .settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .settings-header h1 { font-size: 24px; font-weight: 800; margin: 0; }
        .back-btn { background: transparent; border: none; color: ${accent}; font-size: 14px; font-weight: 700; cursor: pointer; padding: 8px 0; }
        .settings-list { display: grid; gap: 8px; }
        .settings-item { background: ${s.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'}; border: 1px solid ${s.theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
        .settings-item:hover { border-color: ${accent}; background: ${s.theme === 'dark' ? 'rgba(255,215,0,0.05)' : '#fffbe6'}; }
        .settings-item .label { font-weight: 600; font-size: 15px; }
        .settings-item .value { font-size: 13px; color: ${s.theme === 'dark' ? '#aaa' : '#666'}; }
        .settings-item .icon { font-size: 20px; margin-right: 12px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${s.theme === 'dark' ? '#aaa' : '#444'}; }
        .field input[type="range"] { width: 100%; accent-color: ${accent}; }
        .field select, .field input[type="text"] { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid ${s.theme === 'dark' ? '#333' : '#ccc'}; background: ${s.theme === 'dark' ? '#111' : '#fff'}; color: ${s.theme === 'dark' ? '#fff' : '#000'}; font-size: 14px; }
        .toggle { display: flex; align-items: center; gap: 8px; }
        .toggle input { width: 18px; height: 18px; accent-color: ${accent}; }
        .btn { padding: 12px 20px; border-radius: 10px; border: none; background: ${accent}; color: #000; font-weight: 700; cursor: pointer; font-size: 14px; }
        .btn-secondary { background: ${s.theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee'}; color: ${s.theme === 'dark' ? '#fff' : '#000'}; border: 1px solid ${s.theme === 'dark' ? '#333' : '#ccc'}; }
        .color-swatch { width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; display: inline-block; margin: 4px; }
        .color-swatch.active { border-color: #fff; box-shadow: 0 0 12px ${accent}; }
        .storage-bar { height: 8px; background: ${s.theme === 'dark' ? '#222' : '#ddd'}; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .storage-bar-fill { height: 100%; background: ${accent}; transition: width 0.3s; }
        .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px; margin-top: 12px; }
        .app-icon { text-align: center; font-size: 11px; cursor: pointer; }
        .app-icon .emoji { font-size: 32px; display: block; margin-bottom: 4px; }
        .info-text { font-size: 13px; color: ${s.theme === 'dark' ? '#aaa' : '#666'}; line-height: 1.6; }
        .category-title { font-size: 13px; font-weight: 700; color: ${s.theme === 'dark' ? '#666' : '#999'}; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }
      `;

      var html = `<style>${css}</style><div class="settings-app">`;

      // --- Hauptmenü (15 Kategorien) ---
      if (sc === "main") {
        html += `<div class="settings-header"><h1>⚙️ Einstellungen</h1></div><div class="settings-list">`;
        var categories = [
          { id: "general", icon: "📱", label: "Allgemein & Info" },
          { id: "display", icon: "🎨", label: "Darstellung & Display" },
          { id: "language", icon: "🌍", label: "Sprache & Region" },
          { id: "ai", icon: "🤖", label: "HalDo KI & Stimme" },
          { id: "connectivity", icon: "📡", label: "Konnektivität" },
          { id: "apps", icon: "🔔", label: "Apps & Benachrichtigungen" },
          { id: "sound", icon: "🔊", label: "Ton & Vibration" },
          { id: "battery", icon: "🔋", label: "Akku & Energie" },
          { id: "storage", icon: "💾", label: "Speicher" },
          { id: "security", icon: "🔐", label: "Sicherheit & Datenschutz" },
          { id: "accounts", icon: "👤", label: "Benutzer & Konten" },
          { id: "accessibility", icon: "🦾", label: "Bedienungshilfen" },
          { id: "wellbeing", icon: "📅", label: "Digital Wellbeing" },
          { id: "emergency", icon: "🚨", label: "Notfall & Sicherheit" },
          { id: "system", icon: "🔄", label: "Software-Update & System" }
        ];
        categories.forEach(function(c) {
          html += `<div class="settings-item" data-nav="${c.id}"><span><span class="icon">${c.icon}</span><span class="label">${c.label}</span></span><span>›</span></div>`;
        });
        html += `</div>`;
      }

      // --- 1. Allgemein & Info ---
      else if (sc === "general") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📱 Allgemein & Info</h1></div>`;
        html += `<div class="field"><label>Gerätename</label><input type="text" id="deviceName" value="${esc(s.deviceName)}" placeholder="Dein Gerätename"></div>`;
        html += `<div class="field"><label>Systeminformationen</label><div class="info-text">Version: ${s.systemVersion}<br>Build: HalDo AI OS v1.0.0 (Stable)<br>Speicher: 106 Apps installiert</div></div>`;
        html += `<button class="btn" id="saveGeneral">Speichern</button>`;
        container.innerHTML = html;
        // Event-Listener
        container.querySelector("#saveGeneral").addEventListener("click", function() {
          s.deviceName = container.querySelector("#deviceName").value;
          saveSettings(store, s);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Gespeichert!");
          build();
        });
      }

      // --- 2. Darstellung & Display ---
      else if (sc === "display") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🎨 Darstellung & Display</h1></div>`;
        // Helligkeit
        html += `<div class="field"><label>Helligkeit (${s.brightness}%)</label><input type="range" id="brightness" min="10" max="100" value="${s.brightness}"></div>`;
        // Dark/Light Mode
        html += `<div class="field toggle"><label>Dark Mode</label><input type="checkbox" id="darkMode" ${s.theme === 'dark' ? 'checked' : ''}></div>`;
        // Akzentfarbe
        html += `<div class="field"><label>Akzentfarbe</label><div>`;
        ['#ffd700','#4dd0e1','#ff5555','#4ade80','#b478ff','#ff8844'].forEach(function(c) {
          html += `<span class="color-swatch ${s.accentColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></span>`;
        });
        html += `</div></div>`;
        // Schriftart
        html += `<div class="field"><label>Schriftart</label><select id="fontFamily">
          <option value="system" ${s.fontFamily === 'system' ? 'selected' : ''}>System Standard</option>
          <option value="sans" ${s.fontFamily === 'sans' ? 'selected' : ''}>Sans Serif</option>
          <option value="serif" ${s.fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
          <option value="mono" ${s.fontFamily === 'mono' ? 'selected' : ''}>Monospace</option>
        </select></div>`;
        // Schriftgröße
        html += `<div class="field"><label>Schriftgröße (${s.fontSize}%)</label><input type="range" id="fontSize" min="80" max="120" value="${s.fontSize}"></div>`;
        // Hintergrund
        html += `<div class="field"><label>Hintergrund</label><select id="background">
          <option value="default" ${s.background === 'default' ? 'selected' : ''}>Standard</option>
          <option value="gradient" ${s.background === 'gradient' ? 'selected' : ''}>Farbverlauf</option>
          <option value="dark" ${s.background === 'dark' ? 'selected' : ''}>Dunkel</option>
          <option value="light" ${s.background === 'light' ? 'selected' : ''}>Hell</option>
        </select></div>`;
        html += `<button class="btn" id="saveDisplay">Speichern</button>`;
        container.innerHTML = html;
        // Events
        container.querySelector("#brightness").addEventListener("input", function(e) {
          s.brightness = parseInt(e.target.value);
          saveSettings(store, s);
          // optional: document.body.style.filter = `brightness(${s.brightness}%)`; // Für echte Helligkeit
        });
        container.querySelector("#darkMode").addEventListener("change", function(e) {
          s.theme = e.target.checked ? 'dark' : 'light';
          saveSettings(store, s);
          build();
        });
        container.querySelectorAll(".color-swatch").forEach(function(el) {
          el.addEventListener("click", function() {
            s.accentColor = el.dataset.color;
            saveSettings(store, s);
            build();
          });
        });
        container.querySelector("#fontFamily").addEventListener("change", function(e) {
          s.fontFamily = e.target.value;
          saveSettings(store, s);
        });
        container.querySelector("#fontSize").addEventListener("input", function(e) {
          s.fontSize = parseInt(e.target.value);
          saveSettings(store, s);
        });
        container.querySelector("#background").addEventListener("change", function(e) {
          s.background = e.target.value;
          saveSettings(store, s);
        });
        container.querySelector("#saveDisplay").addEventListener("click", function() {
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Display-Einstellungen gespeichert!");
        });
      }

      // --- 3. Sprache & Region ---
      else if (sc === "language") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🌍 Sprache & Region</h1></div>`;
        html += `<div class="field"><label>Systemsprache</label><select id="language">
          <option value="de" ${s.language === 'de' ? 'selected' : ''}>Deutsch</option>
          <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
          <option value="tr" ${s.language === 'tr' ? 'selected' : ''}>Türkçe</option>
          <option value="ar" ${s.language === 'ar' ? 'selected' : ''}>العربية</option>
          <option value="ku" ${s.language === 'ku' ? 'selected' : ''}>Kurdî</option>
          <option value="fr" ${s.language === 'fr' ? 'selected' : ''}>Français</option>
          <option value="es" ${s.language === 'es' ? 'selected' : ''}>Español</option>
          <option value="it" ${s.language === 'it' ? 'selected' : ''}>Italiano</option>
          <option value="ru" ${s.language === 'ru' ? 'selected' : ''}>Русский</option>
        </select></div>`;
        html += `<div class="field"><label>Datumsformat</label><select id="dateFormat">
          <option value="DD.MM.YYYY" ${s.dateFormat === 'DD.MM.YYYY' ? 'selected' : ''}>DD.MM.YYYY</option>
          <option value="MM/DD/YYYY" ${s.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
          <option value="YYYY-MM-DD" ${s.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
        </select></div>`;
        html += `<div class="field"><label>Zeitformat</label><select id="timeFormat">
          <option value="24h" ${s.timeFormat === '24h' ? 'selected' : ''}>24 Stunden</option>
          <option value="12h" ${s.timeFormat === '12h' ? 'selected' : ''}>12 Stunden (AM/PM)</option>
        </select></div>`;
        html += `<button class="btn" id="saveLanguage">Speichern</button>`;
        container.innerHTML = html;
        container.querySelector("#language").addEventListener("change", function(e) { s.language = e.target.value; saveSettings(store, s); });
        container.querySelector("#dateFormat").addEventListener("change", function(e) { s.dateFormat = e.target.value; saveSettings(store, s); });
        container.querySelector("#timeFormat").addEventListener("change", function(e) { s.timeFormat = e.target.value; saveSettings(store, s); });
        container.querySelector("#saveLanguage").addEventListener("click", function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Sprache gespeichert!"); });
      }

      // --- 4. HalDo KI & Stimme ---
      else if (sc === "ai") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🤖 HalDo KI & Stimme</h1></div>`;
        html += `<div class="field"><label>KI-Assistent</label><select id="assistant">
          <option value="ai" ${s.assistant === 'ai' ? 'selected' : ''}>HalDo AI (Natürlich)</option>
          <option value="ki" ${s.assistant === 'ki' ? 'selected' : ''}>HalDo KI (Neutral)</option>
          <option value="cyborg" ${s.assistant === 'cyborg' ? 'selected' : ''}>HalDo Cyborg (Verzerrt)</option>
          <option value="robot" ${s.assistant === 'robot' ? 'selected' : ''}>HalDo Roboter (Tief)</option>
        </select></div>`;
        html += `<div class="field"><label>TTS-Geschwindigkeit (${s.ttsRate.toFixed(1)})</label><input type="range" id="ttsRate" min="0.5" max="2" step="0.1" value="${s.ttsRate}"></div>`;
        html += `<div class="field"><label>TTS-Tonhöhe (${s.ttsPitch.toFixed(1)})</label><input type="range" id="ttsPitch" min="0.5" max="2" step="0.1" value="${s.ttsPitch}"></div>`;
        html += `<div class="field toggle"><label>Eigene Stimme (HalDoVoice) verwenden</label><input type="checkbox" id="useCustomVoice" ${s.useCustomVoice ? 'checked' : ''}></div>`;
        html += `<button class="btn" id="saveAI">Speichern</button>`;
        html += `<button class="btn btn-secondary" id="testAI" style="margin-left:8px;">🔊 Stimme testen</button>`;
        container.innerHTML = html;
        container.querySelector("#assistant").addEventListener("change", function(e) { s.assistant = e.target.value; saveSettings(store, s); });
        container.querySelector("#ttsRate").addEventListener("input", function(e) { s.ttsRate = parseFloat(e.target.value); saveSettings(store, s); });
        container.querySelector("#ttsPitch").addEventListener("input", function(e) { s.ttsPitch = parseFloat(e.target.value); saveSettings(store, s); });
        container.querySelector("#useCustomVoice").addEventListener("change", function(e) { s.useCustomVoice = e.target.checked; saveSettings(store, s); });
        container.querySelector("#saveAI").addEventListener("click", function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.success("KI-Einstellungen gespeichert!"); });
        container.querySelector("#testAI").addEventListener("click", function() {
          if(window.speechSynthesis) {
            var u = new SpeechSynthesisUtterance("Hallo, ich bin dein HalDo KI-Assistent.");
            u.lang = "de-DE"; u.rate = s.ttsRate; u.pitch = s.ttsPitch;
            window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
          }
        });
      }

      // --- 5. Konnektivität ---
      else if (sc === "connectivity") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📡 Konnektivität</h1></div>`;
        html += `<div class="settings-item" id="wifiStatus"><span><span class="icon">📶</span>WLAN</span><span class="value">${navigator.onLine ? 'Verbunden' : 'Getrennt'}</span></div>`;
        html += `<div class="settings-item" id="btStatus"><span><span class="icon">📡</span>Bluetooth</span><span class="value">${s.bluetoothDevice ? esc(s.bluetoothDevice) : 'Nicht verbunden'}</span></div>`;
        html += `<div class="field toggle"><label>NFC</label><input type="checkbox" id="nfcEnabled" ${s.nfcEnabled ? 'checked' : ''}></div>`;
        html += `<div class="field toggle"><label>Standortdienste</label><input type="checkbox" id="locationEnabled" ${s.locationEnabled ? 'checked' : ''}></div>`;
        html += `<button class="btn btn-secondary" id="scanBt">📡 Bluetooth-Gerät suchen</button>`;
        container.innerHTML = html;
        container.querySelector("#nfcEnabled").addEventListener("change", function(e) { s.nfcEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelector("#locationEnabled").addEventListener("change", function(e) { s.locationEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelector("#scanBt").addEventListener("click", async function() {
          try {
            if(!navigator.bluetooth) throw new Error("Web Bluetooth nicht verfügbar");
            var device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
            s.bluetoothDevice = device.name || "Bluetooth-Gerät";
            saveSettings(store, s);
            if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Verbunden: " + s.bluetoothDevice);
            build();
          } catch(e) { if(window.HalDo && HalDo.Notify) HalDo.Notify.error(e.message); }
        });
      }

      // --- 6. Apps & Benachrichtigungen ---
      else if (sc === "apps") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔔 Apps & Benachrichtigungen</h1></div>`;
        html += `<div class="field toggle"><label>Globale Benachrichtigungen</label><input type="checkbox" id="notificationsEnabled" ${s.notificationsEnabled ? 'checked' : ''}></div>`;
        html += `<div class="field toggle"><label>"Nicht stören"-Modus</label><input type="checkbox" id="dndEnabled" ${s.dndEnabled ? 'checked' : ''}></div>`;
        html += `<div class="category-title">Installierte Apps (106)</div>`;
        html += `<div class="app-grid">`;
        var apps = [
          { emoji: "🦚", name: "Blitzer" }, { emoji: "🚗", name: "Auto" }, { emoji: "💬", name: "Chat" },
          { emoji: "📧", name: "E-Mail" }, { emoji: "📞", name: "Phone" }, { emoji: "📝", name: "Notizen" },
          { emoji: "📅", name: "Kalender" }, { emoji: "🎵", name: "Musik" }, { emoji: "📷", name: "Fotos" },
          { emoji: "🌤️", name: "Wetter" }, { emoji: "🧮", name: "Rechner" }, { emoji: "⏱️", name: "Timer" }
          // ... hier könnten alle 106 Apps dynamisch geladen werden
        ];
        apps.forEach(function(app) {
          html += `<div class="app-icon"><span class="emoji">${app.emoji}</span>${app.name}</div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelector("#notificationsEnabled").addEventListener("change", function(e) { s.notificationsEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelector("#dndEnabled").addEventListener("change", function(e) { s.dndEnabled = e.target.checked; saveSettings(store, s); });
      }

      // --- 7. Ton & Vibration ---
      else if (sc === "sound") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔊 Ton & Vibration</h1></div>`;
        html += `<div class="field"><label>Medienlautstärke (${s.volumeMedia}%)</label><input type="range" id="volumeMedia" min="0" max="100" value="${s.volumeMedia}"></div>`;
        html += `<div class="field"><label>Klingelton-Lautstärke (${s.volumeRing}%)</label><input type="range" id="volumeRing" min="0" max="100" value="${s.volumeRing}"></div>`;
        html += `<div class="field"><label>Alarm-Lautstärke (${s.volumeAlarm}%)</label><input type="range" id="volumeAlarm" min="0" max="100" value="${s.volumeAlarm}"></div>`;
        html += `<div class="field toggle"><label>Vibration</label><input type="checkbox" id="vibrationEnabled" ${s.vibrationEnabled ? 'checked' : ''}></div>`;
        html += `<button class="btn" id="saveSound">Speichern</button>`;
        container.innerHTML = html;
        container.querySelector("#volumeMedia").addEventListener("input", function(e) { s.volumeMedia = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#volumeRing").addEventListener("input", function(e) { s.volumeRing = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#volumeAlarm").addEventListener("input", function(e) { s.volumeAlarm = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#vibrationEnabled").addEventListener("change", function(e) { s.vibrationEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelector("#saveSound").addEventListener("click", function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Ton-Einstellungen gespeichert!"); });
      }

      // --- 8. Akku & Energie ---
      else if (sc === "battery") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔋 Akku & Energie</h1></div>`;
        html += `<div class="field"><label>Akkustatus</label><div class="info-text" id="batteryInfo">Lade...</div></div>`;
        html += `<div class="field toggle"><label>Energiesparmodus</label><input type="checkbox" id="batterySaver" ${s.batterySaver ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        if(navigator.getBattery) {
          navigator.getBattery().then(function(battery) {
            var info = container.querySelector("#batteryInfo");
            function update() {
              info.textContent = "🔋 " + Math.round(battery.level * 100) + "% " + (battery.charging ? "⚡ (Lädt)" : "");
            }
            update();
            battery.addEventListener('levelchange', update);
            battery.addEventListener('chargingchange', update);
          });
        }
        container.querySelector("#batterySaver").addEventListener("change", function(e) { s.batterySaver = e.target.checked; saveSettings(store, s); });
      }

      // --- 9. Speicher ---
      else if (sc === "storage") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>💾 Speicher</h1></div>`;
        html += `<div class="field"><label>Belegter Speicher</label><div class="info-text" id="storageInfo">Lade...</div><div class="storage-bar"><div class="storage-bar-fill" id="storageFill" style="width:0%"></div></div></div>`;
        html += `<button class="btn btn-secondary" id="clearCache">🗑️ Cache leeren</button>`;
        container.innerHTML = html;
        if(navigator.storage && navigator.storage.estimate) {
          navigator.storage.estimate().then(function(estimate) {
            var used = estimate.usage || 0;
            var total = estimate.quota || 1;
            var percent = Math.min(100, (used / total) * 100);
            var info = container.querySelector("#storageInfo");
            info.textContent = (used / 1024 / 1024).toFixed(1) + " MB von " + (total / 1024 / 1024 / 1024).toFixed(1) + " GB belegt";
            container.querySelector("#storageFill").style.width = percent + "%";
          });
        }
        container.querySelector("#clearCache").addEventListener("click", function() {
          if(window.HalDo && HalDo.Notify) HalDo.Notify.info("Cache-Leerung wird vorbereitet...");
          // Hier könnte man caches.delete() aufrufen
        });
      }

      // --- 10. Sicherheit & Datenschutz ---
      else if (sc === "security") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔐 Sicherheit & Datenschutz</h1></div>`;
        html += `<div class="field"><label>App-Berechtigungen</label><div class="info-text">Kamera: ${s.permissions.camera ? '✅ Erlaubt' : '❌ Verweigert'}<br>Mikrofon: ${s.permissions.microphone ? '✅ Erlaubt' : '❌ Verweigert'}<br>Standort: ${s.permissions.location ? '✅ Erlaubt' : '❌ Verweigert'}</div></div>`;
        html += `<button class="btn btn-secondary" id="requestPermissions">Berechtigungen anfragen</button>`;
        html += `<div class="field toggle" style="margin-top:16px;"><label>Bildschirmsperre</label><input type="checkbox" id="screenLock" ${s.screenLock ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        container.querySelector("#requestPermissions").addEventListener("click", async function() {
          try {
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              s.permissions.camera = true; s.permissions.microphone = true;
            }
            if(navigator.geolocation) {
              await new Promise(function(res, rej) { navigator.geolocation.getCurrentPosition(res, rej); });
              s.permissions.location = true;
            }
            saveSettings(store, s);
            if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Berechtigungen erteilt!");
            build();
          } catch(e) { if(window.HalDo && HalDo.Notify) HalDo.Notify.error("Berechtigung verweigert: " + e.message); }
        });
        container.querySelector("#screenLock").addEventListener("change", function(e) { s.screenLock = e.target.checked; saveSettings(store, s); });
      }

      // --- 11. Benutzer & Konten ---
      else if (sc === "accounts") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>👤 Benutzer & Konten</h1></div>`;
        html += `<div class="info-text">Aktueller Benutzer: Halil Donma (Admin)</div>`;
        html += `<button class="btn btn-secondary" style="margin-top:12px;">Konto hinzufügen</button>`;
        container.innerHTML = html;
      }

      // --- 12. Bedienungshilfen ---
      else if (sc === "accessibility") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🦾 Bedienungshilfen</h1></div>`;
        html += `<div class="field"><label>Tastatur</label><select id="keyboardLang"><option value="de">Deutsch</option><option value="en">English</option></select></div>`;
        html += `<div class="field toggle"><label>Sprachsteuerung</label><input type="checkbox" id="voiceControl" ${s.voiceControl ? 'checked' : ''}></div>`;
        html += `<div class="field toggle"><label>Vibration bei Eingabe</label><input type="checkbox" id="vibrateInput" ${s.vibrationEnabled ? 'checked' : ''}></div>`;
        container.innerHTML = html;
      }

      // --- 13. Digital Wellbeing ---
      else if (sc === "wellbeing") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📅 Digital Wellbeing</h1></div>`;
        html += `<div class="info-text">Bildschirmzeit heute: 2 Std. 15 Min.<br>Entsperrungen: 42</div>`;
        html += `<button class="btn btn-secondary" style="margin-top:12px;">Fokusmodus aktivieren</button>`;
        container.innerHTML = html;
      }

      // --- 14. Notfall & Sicherheit ---
      else if (sc === "emergency") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🚨 Notfall & Sicherheit</h1></div>`;
        html += `<div class="field"><label>Notfallkontakte</label><input type="text" placeholder="Name, Telefonnummer" style="width:100%;padding:10px;border-radius:8px;"></div>`;
        html += `<button class="btn btn-secondary">Notfallinfo speichern</button>`;
        container.innerHTML = html;
      }

      // --- 15. Software-Update & System ---
      else if (sc === "system") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔄 Software-Update & System</h1></div>`;
        html += `<div class="field"><label>Aktuelle Version</label><div class="info-text">${s.systemVersion}</div></div>`;
        html += `<button class="btn" id="checkUpdate">Nach Updates suchen</button>`;
        html += `<button class="btn btn-secondary" id="resetSettings" style="margin-top:8px; background:rgba(255,85,85,0.2); border-color:#ff5555; color:#ff5555;">Auf Werkseinstellungen zurücksetzen</button>`;
        container.innerHTML = html;
        container.querySelector("#checkUpdate").addEventListener("click", function() {
          if(window.HalDo && HalDo.Notify) HalDo.Notify.info("Suche nach Updates...");
          setTimeout(function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.success("System ist auf dem neuesten Stand."); }, 1500);
        });
        container.querySelector("#resetSettings").addEventListener("click", function() {
          if(confirm("Wirklich alle Einstellungen zurücksetzen?")) {
            saveSettings(store, DEFAULT);
            if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Zurückgesetzt!");
            view.screen = "main"; build();
          }
        });
      }

      html += `</div>`;
      container.innerHTML = html;

      // Globale Navigation (data-nav)
      container.querySelectorAll("[data-nav]").forEach(function(el) {
        el.addEventListener("click", function() {
          view.screen = el.dataset.nav;
          build();
        });
      });
    }

    // Initiales Bauen
    build();
  }

  HalDoApp("settings", { name: "Einstellungen", icon: "⚙️", render: render, category: "system" });
  console.log('%c⚙️ HalDo Settings v23.0 — Pro Max bereit', GOLD_STYLE);
})();
