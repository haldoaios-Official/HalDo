/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SETTINGS v24.0 (PROFESSIONAL PRO MAX)
   Vollständige Systemeinstellungen · Ezidi-Support · App-Verwaltung
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:14px;text-shadow:0 0 10px #ffd700;background:#0a0e2a;padding:4px 8px;border-radius:6px;';
  console.log('%c⚙️ HalDo Settings v24.0 — Professional Pro Max', GOLD_STYLE);

  // --- Standard-Einstellungen ---
  var DEFAULT = {
    deviceName: "HalDo-Gerät",
    systemVersion: "HalDo AI OS 1.0.0 (Build: Ultra)",
    theme: "dark",
    accentColor: "#ffd700",
    brightness: 100,
    fontFamily: "system",
    fontSize: 100,
    language: "de",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "24h",
    assistant: "ai",
    ttsRate: 1.0,
    ttsPitch: 1.0,
    useCustomVoice: false,
    bluetoothDevice: null,
    locationEnabled: true,
    nfcEnabled: false,
    notificationsEnabled: true,
    dndEnabled: false,
    volumeMedia: 80,
    volumeRing: 80,
    volumeAlarm: 100,
    vibrationEnabled: true,
    batterySaver: false,
    screenLock: false,
    permissions: {},
    appNotifications: {}, // Per-App-Einstellungen
    keyboardLanguages: ["de", "en"],
    accessibilityReader: false,
    // Simulierter Speicher (100 GB)
    simulatedStorage: { total: 100 * 1024 * 1024 * 1024, used: 12.5 * 1024 * 1024 * 1024 }
  };

  // --- Hilfsfunktionen ---
  function getSettings(store) {
    var s = store.get("settings", {});
    var m = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(s).forEach(function(k){ m[k] = s[k]; });
    // Standard-Sprachen für Apps setzen
    if (!m.appNotifications || Object.keys(m.appNotifications).length === 0) {
      m.appNotifications = {};
      APP_LIST.forEach(function(app) {
        m.appNotifications[app.id] = { enabled: true, sound: "default", vibrate: true };
      });
    }
    return m;
  }
  function saveSettings(store, s) { store.set("settings", s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function formatBytes(bytes) { if (bytes === 0) return '0 B'; var k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']; var i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; }

  // --- App-Liste (Auszug aus deinen 106 Apps) ---
  var APP_LIST = [
    { id: "blitzer", name: "Blitzer", emoji: "⚠️", category: "werkzeuge" },
    { id: "auto", name: "Auto", emoji: "🚗", category: "werkzeuge" },
    { id: "chat", name: "Chat", emoji: "💬", category: "kommunikation" },
    { id: "email", name: "E-Mail", emoji: "📧", category: "kommunikation" },
    { id: "phone", name: "Phone", emoji: "📞", category: "kommunikation" },
    { id: "notes", name: "Notizen", emoji: "📝", category: "produktivität" },
    { id: "kalender", name: "Kalender", emoji: "📅", category: "produktivität" },
    { id: "musik", name: "Musik", emoji: "🎵", category: "medien" },
    { id: "photos", name: "Fotos", emoji: "📷", category: "medien" },
    { id: "wetter", name: "Wetter", emoji: "🌤️", category: "werkzeuge" },
    { id: "rechner", name: "Rechner", emoji: "🧮", category: "werkzeuge" },
    { id: "timer", name: "Timer", emoji: "⏱️", category: "werkzeuge" },
    { id: "ezidi", name: "Ezidi Zentrum", emoji: "🦚", category: "kultur" }
  ];

  // --- Audio-Engine ---
  var audioCtx = null;
  function playBeep(type) {
    try {
      if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type || "sine"; o.frequency.value = 880;
      o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.3, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      o.start(); o.stop(audioCtx.currentTime + 0.2);
    } catch(e) {}
  }

  // --- Haupt-Render-Funktion ---
  function render(container, ctx) {
    var store = ctx.store;
    var view = { screen: "main" };

    function build() {
      var s = getSettings(store);
      var accent = s.accentColor;
      var isDark = s.theme === 'dark';

      // --- Globales CSS ---
      var css = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Yezidi&display=swap');
        
        .settings-app { font-family: ${s.fontFamily === 'system' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : s.fontFamily + ', sans-serif'}; color: ${isDark ? '#fff' : '#000'}; background: ${isDark ? '#0a0e1a' : '#f5f5f5'}; min-height: 100vh; padding: 16px; font-size: ${s.fontSize}%; }
        .settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .settings-header h1 { font-size: 24px; font-weight: 800; margin: 0; }
        .back-btn { background: transparent; border: none; color: ${accent}; font-size: 14px; font-weight: 700; cursor: pointer; padding: 8px 0; }
        .settings-list { display: grid; gap: 8px; }
        .settings-item { background: ${isDark ? 'rgba(255,255,255,0.05)' : '#fff'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
        .settings-item:hover { border-color: ${accent}; background: ${isDark ? 'rgba(255,215,0,0.05)' : '#fffbe6'}; }
        .settings-item .label { font-weight: 600; font-size: 15px; }
        .settings-item .value { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; }
        .settings-item .icon { font-size: 20px; margin-right: 12px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${isDark ? '#aaa' : '#444'}; }
        .field input[type="range"] { width: 100%; accent-color: ${accent}; }
        .field select, .field input[type="text"] { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid ${isDark ? '#333' : '#ccc'}; background: ${isDark ? '#111' : '#fff'}; color: ${isDark ? '#fff' : '#000'}; font-size: 14px; font-family: inherit; }
        .toggle { display: flex; align-items: center; gap: 8px; }
        .toggle input { width: 18px; height: 18px; accent-color: ${accent}; }
        .btn { padding: 12px 20px; border-radius: 10px; border: none; background: ${accent}; color: #000; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; }
        .btn-secondary { background: ${isDark ? 'rgba(255,255,255,0.1)' : '#eee'}; color: ${isDark ? '#fff' : '#000'}; border: 1px solid ${isDark ? '#333' : '#ccc'}; }
        .color-swatch { width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; display: inline-block; margin: 4px; }
        .color-swatch.active { border-color: #fff; box-shadow: 0 0 12px ${accent}; }
        .storage-bar { height: 8px; background: ${isDark ? '#222' : '#ddd'}; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .storage-bar-fill { height: 100%; background: ${accent}; transition: width 0.3s; }
        .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px; margin-top: 12px; }
        .app-icon { text-align: center; font-size: 11px; cursor: pointer; }
        .app-icon .emoji { font-size: 32px; display: block; margin-bottom: 4px; }
        .info-text { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; line-height: 1.6; }
        .category-title { font-size: 13px; font-weight: 700; color: ${isDark ? '#666' : '#999'}; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }
        .ezidi-text { font-family: 'Noto Serif Yezidi', serif; }
      `;

      var html = `<style>${css}</style><div class="settings-app">`;

      // --- HAUPTMENÜ (16 Kategorien) ---
      if (view.screen === "main") {
        html += `<div class="settings-header"><h1>⚙️ Einstellungen</h1></div><div class="settings-list">`;
        var categories = [
          { id: "general", icon: "📱", label: "Allgemein & Info" },
          { id: "display", icon: "🎨", label: "Darstellung & Display" },
          { id: "language", icon: "🌍", label: "Sprache & Region" },
          { id: "ai", icon: "🤖", label: "HalDo KI & Stimme" },
          { id: "connectivity", icon: "📡", label: "Verbindungen" },
          { id: "apps", icon: "🔔", label: "Apps & Benachrichtigungen" },
          { id: "app_details", icon: "📂", label: "App-Details & Rechte" },
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

      // --- 1. ALLGEMEIN & INFO ---
      else if (view.screen === "general") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📱 Allgemein & Info</h1></div>`;
        html += `<div class="field"><label>Gerätename</label><input type="text" id="deviceName" value="${esc(s.deviceName)}"></div>`;
        html += `<div class="field"><label>Systemversion</label><div class="info-text">${s.systemVersion}</div></div>`;
        html += `<div class="field"><label>Installierte Apps</label><div class="info-text">${APP_LIST.length} Apps erkannt</div></div>`;
        html += `<button class="btn" id="saveGeneral">Speichern</button>`;
        container.innerHTML = html;
        container.querySelector("#saveGeneral").addEventListener("click", function() {
          s.deviceName = container.querySelector("#deviceName").value;
          saveSettings(store, s);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Gespeichert!");
        });
      }

      // --- 2. DARSTELLUNG & DISPLAY ---
      else if (view.screen === "display") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🎨 Darstellung & Display</h1></div>`;
        html += `<div class="field"><label>Helligkeit (${s.brightness}%)</label><input type="range" id="brightness" min="10" max="100" value="${s.brightness}"></div>`;
        html += `<div class="field toggle"><label>Dark Mode</label><input type="checkbox" id="darkMode" ${isDark ? 'checked' : ''}></div>`;
        html += `<div class="field"><label>Akzentfarbe</label><div>`;
        ['#ffd700','#4dd0e1','#ff5555','#4ade80','#b478ff','#ff8844'].forEach(function(c) {
          html += `<span class="color-swatch ${s.accentColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></span>`;
        });
        html += `</div></div>`;
        html += `<div class="field"><label>Schriftart</label><select id="fontFamily">
          <option value="system" ${s.fontFamily === 'system' ? 'selected' : ''}>System Standard</option>
          <option value="sans" ${s.fontFamily === 'sans' ? 'selected' : ''}>Sans Serif</option>
          <option value="serif" ${s.fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
          <option value="mono" ${s.fontFamily === 'mono' ? 'selected' : ''}>Monospace</option>
          <option value="Noto Serif Yezidi" ${s.fontFamily === 'Noto Serif Yezidi' ? 'selected' : ''}>Ezidi (Yezidi)</option>
        </select></div>`;
        html += `<div class="field"><label>Schriftgröße (${s.fontSize}%)</label><input type="range" id="fontSize" min="80" max="120" value="${s.fontSize}"></div>`;
        container.innerHTML = html;
        container.querySelector("#brightness").addEventListener("input", function(e) { s.brightness = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#darkMode").addEventListener("change", function(e) { s.theme = e.target.checked ? 'dark' : 'light'; saveSettings(store, s); build(); });
        container.querySelectorAll(".color-swatch").forEach(function(el) { el.addEventListener("click", function() { s.accentColor = el.dataset.color; saveSettings(store, s); build(); }); });
        container.querySelector("#fontFamily").addEventListener("change", function(e) { s.fontFamily = e.target.value; saveSettings(store, s); build(); });
        container.querySelector("#fontSize").addEventListener("input", function(e) { s.fontSize = parseInt(e.target.value); saveSettings(store, s); });
      }

      // --- 3. SPRACHE & REGION ---
      else if (view.screen === "language") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🌍 Sprache & Region</h1></div>`;
        html += `<div class="field"><label>Systemsprache</label><select id="language">
          <option value="de" ${s.language === 'de' ? 'selected' : ''}>Deutsch</option>
          <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
          <option value="tr" ${s.language === 'tr' ? 'selected' : ''}>Türkçe</option>
          <option value="ar" ${s.language === 'ar' ? 'selected' : ''}>العربية</option>
          <option value="ku" ${s.language === 'ku' ? 'selected' : ''}>Kurdî (Kurmanji)</option>
          <option value="ku-Yezidi" ${s.language === 'ku-Yezidi' ? 'selected' : ''}>Kurdî (Ezidi)</option>
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
        html += `<button class="btn" id="saveLanguage">Speichern</button>`;
        container.innerHTML = html;
        container.querySelector("#language").addEventListener("change", function(e) { s.language = e.target.value; saveSettings(store, s); });
        container.querySelector("#dateFormat").addEventListener("change", function(e) { s.dateFormat = e.target.value; saveSettings(store, s); });
        container.querySelector("#saveLanguage").addEventListener("click", function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Sprache gespeichert!"); });
      }

      // --- 4. HALDO KI & STIMME ---
      else if (view.screen === "ai") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🤖 HalDo KI & Stimme</h1></div>`;
        html += `<div class="field"><label>KI-Assistent</label><select id="assistant">
          <option value="ai" ${s.assistant === 'ai' ? 'selected' : ''}>HalDo AI (Natürlich)</option>
          <option value="ki" ${s.assistant === 'ki' ? 'selected' : ''}>HalDo KI (Neutral)</option>
          <option value="cyborg" ${s.assistant === 'cyborg' ? 'selected' : ''}>HalDo Cyborg (Verzerrt)</option>
          <option value="robot" ${s.assistant === 'robot' ? 'selected' : ''}>HalDo Roboter (Tief)</option>
        </select></div>`;
        html += `<div class="field"><label>TTS-Geschwindigkeit (${s.ttsRate.toFixed(1)})</label><input type="range" id="ttsRate" min="0.5" max="2" step="0.1" value="${s.ttsRate}"></div>`;
        html += `<div class="field"><label>TTS-Tonhöhe (${s.ttsPitch.toFixed(1)})</label><input type="range" id="ttsPitch" min="0.5" max="2" step="0.1" value="${s.ttsPitch}"></div>`;
        html += `<button class="btn btn-secondary" id="testAI">🔊 Stimme testen</button>`;
        container.innerHTML = html;
        container.querySelector("#assistant").addEventListener("change", function(e) { s.assistant = e.target.value; saveSettings(store, s); });
        container.querySelector("#ttsRate").addEventListener("input", function(e) { s.ttsRate = parseFloat(e.target.value); saveSettings(store, s); });
        container.querySelector("#ttsPitch").addEventListener("input", function(e) { s.ttsPitch = parseFloat(e.target.value); saveSettings(store, s); });
        container.querySelector("#testAI").addEventListener("click", function() {
          if(window.speechSynthesis) {
            var u = new SpeechSynthesisUtterance("Hallo, ich bin dein HalDo KI-Assistent.");
            u.lang = "de-DE"; u.rate = s.ttsRate; u.pitch = s.ttsPitch;
            window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
          }
        });
      }

      // --- 5. VERBINDUNGEN ---
      else if (view.screen === "connectivity") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📡 Verbindungen</h1></div>`;
        html += `<div class="settings-item"><span><span class="icon">📶</span>WLAN</span><span class="value">${navigator.onLine ? 'Verbunden' : 'Getrennt'}</span></div>`;
        html += `<div class="settings-item"><span><span class="icon">📡</span>Bluetooth</span><span class="value">${s.bluetoothDevice ? esc(s.bluetoothDevice) : 'Nicht verbunden'}</span></div>`;
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

      // --- 6. APPS & BENACHRICHTIGUNGEN ---
      else if (view.screen === "apps") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔔 Apps & Benachrichtigungen</h1></div>`;
        html += `<div class="field toggle"><label>Globale Benachrichtigungen</label><input type="checkbox" id="notificationsEnabled" ${s.notificationsEnabled ? 'checked' : ''}></div>`;
        html += `<div class="field toggle"><label>"Nicht stören"-Modus</label><input type="checkbox" id="dndEnabled" ${s.dndEnabled ? 'checked' : ''}></div>`;
        html += `<div class="category-title">App-Benachrichtigungen verwalten</div>`;
        html += `<div class="settings-list">`;
        APP_LIST.forEach(function(app) {
          var appS = s.appNotifications[app.id] || { enabled: true };
          html += `<div class="settings-item" data-app="${app.id}" style="padding:12px;">
            <span><span class="icon">${app.emoji}</span><span class="label">${app.name}</span></span>
            <span class="value">${appS.enabled ? 'An' : 'Aus'}</span>
          </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelector("#notificationsEnabled").addEventListener("change", function(e) { s.notificationsEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelector("#dndEnabled").addEventListener("change", function(e) { s.dndEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelectorAll("[data-app]").forEach(function(el) {
          el.addEventListener("click", function() {
            var appId = el.dataset.app;
            // Einfacher Toggle für dieses Beispiel
            s.appNotifications[appId].enabled = !s.appNotifications[appId].enabled;
            saveSettings(store, s);
            build();
          });
        });
      }

      // --- 7. APP-DETAILS & RECHTE (Detaillierte Ansicht) ---
      else if (view.screen === "app_details") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📂 App-Details & Rechte</h1></div>`;
        html += `<div class="info-text">Wähle eine App aus der Liste, um ihre Berechtigungen und Benachrichtigungen im Detail zu verwalten.</div>`;
        html += `<div class="settings-list" style="margin-top:16px;">`;
        APP_LIST.forEach(function(app) {
          html += `<div class="settings-item" data-app-detail="${app.id}">
            <span><span class="icon">${app.emoji}</span><span class="label">${app.name}</span></span>
            <span>›</span>
          </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelectorAll("[data-app-detail]").forEach(function(el) {
          el.addEventListener("click", function() {
            var appId = el.dataset.appDetail;
            var app = APP_LIST.find(function(a) { return a.id === appId; });
            if (!app) return;
            // Detail-Ansicht für diese App
            var appS = s.appNotifications[appId] || { enabled: true, sound: "default", vibrate: true };
            var detailHtml = `<button class="back-btn" data-nav="apps">‹ Zurück zu Apps</button>
              <div class="settings-header"><h1>${app.emoji} ${app.name}</h1></div>
              <div class="field toggle"><label>Benachrichtigungen erlauben</label><input type="checkbox" id="appEnabled" ${appS.enabled ? 'checked' : ''}></div>
              <div class="field"><label>Benachrichtigungston</label><select id="appSound">
                <option value="default" ${appS.sound === 'default' ? 'selected' : ''}>Standard</option>
                <option value="chime" ${appS.sound === 'chime' ? 'selected' : ''}>Glocke</option>
                <option value="siren" ${appS.sound === 'siren' ? 'selected' : ''}>Sirene</option>
                <option value="silent" ${appS.sound === 'silent' ? 'selected' : ''}>Lautlos</option>
              </select></div>
              <div class="field toggle"><label>Vibrieren</label><input type="checkbox" id="appVibrate" ${appS.vibrate ? 'checked' : ''}></div>
              <button class="btn" id="saveAppDetail">Speichern</button>`;
            container.innerHTML = detailHtml;
            container.querySelector("#saveAppDetail").addEventListener("click", function() {
              s.appNotifications[appId] = {
                enabled: container.querySelector("#appEnabled").checked,
                sound: container.querySelector("#appSound").value,
                vibrate: container.querySelector("#appVibrate").checked
              };
              saveSettings(store, s);
              if(window.HalDo && HalDo.Notify) HalDo.Notify.success("App-Einstellungen gespeichert!");
              view.screen = "apps"; build();
            });
          });
        });
      }

      // --- 8. TON & VIBRATION ---
      else if (view.screen === "sound") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔊 Ton & Vibration</h1></div>`;
        html += `<div class="field"><label>Medienlautstärke (${s.volumeMedia}%)</label><input type="range" id="volumeMedia" min="0" max="100" value="${s.volumeMedia}"></div>`;
        html += `<div class="field"><label>Klingelton-Lautstärke (${s.volumeRing}%)</label><input type="range" id="volumeRing" min="0" max="100" value="${s.volumeRing}"></div>`;
        html += `<div class="field"><label>Alarm-Lautstärke (${s.volumeAlarm}%)</label><input type="range" id="volumeAlarm" min="0" max="100" value="${s.volumeAlarm}"></div>`;
        html += `<div class="field toggle"><label>Vibration</label><input type="checkbox" id="vibrationEnabled" ${s.vibrationEnabled ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        container.querySelector("#volumeMedia").addEventListener("input", function(e) { s.volumeMedia = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#volumeRing").addEventListener("input", function(e) { s.volumeRing = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#volumeAlarm").addEventListener("input", function(e) { s.volumeAlarm = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#vibrationEnabled").addEventListener("change", function(e) { s.vibrationEnabled = e.target.checked; saveSettings(store, s); });
      }

      // --- 9. AKKU & ENERGIE ---
      else if (view.screen === "battery") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔋 Akku & Energie</h1></div>`;
        html += `<div class="field"><label>Akkustatus</label><div class="info-text" id="batteryInfo">Lade...</div></div>`;
        html += `<div class="field toggle"><label>Energiesparmodus</label><input type="checkbox" id="batterySaver" ${s.batterySaver ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        if(navigator.getBattery) {
          navigator.getBattery().then(function(battery) {
            var info = container.querySelector("#batteryInfo");
            function update() { info.textContent = "🔋 " + Math.round(battery.level * 100) + "% " + (battery.charging ? "⚡ (Lädt)" : ""); }
            update();
            battery.addEventListener('levelchange', update);
            battery.addEventListener('chargingchange', update);
          });
        }
        container.querySelector("#batterySaver").addEventListener("change", function(e) { s.batterySaver = e.target.checked; saveSettings(store, s); });
      }

      // --- 10. SPEICHER (100 GB Anzeige) ---
      else if (view.screen === "storage") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>💾 Speicher</h1></div>`;
        // Simulierte 100 GB Anzeige (oder echte, falls verfügbar)
        var total = s.simulatedStorage.total;
        var used = s.simulatedStorage.used;
        var percent = Math.min(100, (used / total) * 100);
        html += `<div class="field"><label>Belegter Speicher</label><div class="info-text">${formatBytes(used)} von ${formatBytes(total)} belegt</div><div class="storage-bar"><div class="storage-bar-fill" style="width:${percent}%"></div></div></div>`;
        // Echte Web-Speicher-Schätzung, falls verfügbar
        html += `<div class="field"><label>Browser-Speicher (Echt)</label><div class="info-text" id="realStorageInfo">Wird geladen...</div></div>`;
        html += `<button class="btn btn-secondary" id="clearCache">🗑️ Cache leeren</button>`;
        container.innerHTML = html;
        if(navigator.storage && navigator.storage.estimate) {
          navigator.storage.estimate().then(function(estimate) {
            var info = container.querySelector("#realStorageInfo");
            if(info) {
              var realUsed = estimate.usage || 0;
              var realTotal = estimate.quota || 1;
              info.textContent = formatBytes(realUsed) + " von " + formatBytes(realTotal) + " (Browser-Limit)";
            }
          });
        }
        container.querySelector("#clearCache").addEventListener("click", function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.info("Cache wird geleert..."); });
      }

      // --- 11. SICHERHEIT & DATENSCHUTZ ---
      else if (view.screen === "security") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔐 Sicherheit & Datenschutz</h1></div>`;
        html += `<div class="field"><label>App-Berechtigungen</label><div class="info-text">Kamera: ${s.permissions.camera ? '✅' : '❌'}<br>Mikrofon: ${s.permissions.microphone ? '✅' : '❌'}<br>Standort: ${s.permissions.location ? '✅' : '❌'}</div></div>`;
        html += `<button class="btn btn-secondary" id="requestPermissions">Berechtigungen anfragen</button>`;
        html += `<div class="field toggle" style="margin-top:16px;"><label>Bildschirmsperre</label><input type="checkbox" id="screenLock" ${s.screenLock ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        container.querySelector("#requestPermissions").addEventListener("click", async function() {
          try {
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); s.permissions.camera = true; s.permissions.microphone = true; }
            if(navigator.geolocation) { await new Promise(function(res, rej) { navigator.geolocation.getCurrentPosition(res, rej); }); s.permissions.location = true; }
            saveSettings(store, s);
            if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Berechtigungen erteilt!");
            build();
          } catch(e) { if(window.HalDo && HalDo.Notify) HalDo.Notify.error("Berechtigung verweigert: " + e.message); }
        });
        container.querySelector("#screenLock").addEventListener("change", function(e) { s.screenLock = e.target.checked; saveSettings(store, s); });
      }

      // --- 12. BENUTZER & KONTEN ---
      else if (view.screen === "accounts") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>👤 Benutzer & Konten</h1></div>`;
        html += `<div class="info-text">Aktueller Benutzer: Halil Donma (Admin)</div>`;
        container.innerHTML = html;
      }

      // --- 13. BEDIENUNGSHILFEN (Sprachen & Ezidi) ---
      else if (view.screen === "accessibility") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🦾 Bedienungshilfen</h1></div>`;
        html += `<div class="field"><label>Bildschirmleser (TalkBack)</label><div class="toggle"><input type="checkbox" id="screenReader" ${s.accessibilityReader ? 'checked' : ''}><span>Sprachausgabe aktivieren</span></div></div>`;
        html += `<div class="field"><label>Tastatur-Sprachen</label><div class="info-text">Aktive Sprachen: ${s.keyboardLanguages.join(', ')}</div>
          <select id="addKeyboardLang" style="margin-top:8px;">
            <option value="">Sprache hinzufügen...</option>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
            <option value="ar">العربية</option>
            <option value="ku">Kurdî (Kurmanji)</option>
            <option value="ku-Yezidi">Kurdî (Ezidi) - Alte Schrift</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>`;
        html += `<div class="field"><label>Ezidi Schriftart (Noto Serif Yezidi)</label><div class="info-text ezidi-text">𒀀 𒀁 𒀂 𒀃 (Beispielzeichen)</div></div>`;
        container.innerHTML = html;
        container.querySelector("#screenReader").addEventListener("change", function(e) { s.accessibilityReader = e.target.checked; saveSettings(store, s); });
        container.querySelector("#addKeyboardLang").addEventListener("change", function(e) {
          var lang = e.target.value;
          if(lang && !s.keyboardLanguages.includes(lang)) {
            s.keyboardLanguages.push(lang);
            saveSettings(store, s);
            build();
          }
        });
      }

      // --- 14. DIGITAL WELLBEING ---
      else if (view.screen === "wellbeing") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📅 Digital Wellbeing</h1></div>`;
        html += `<div class="info-text">Bildschirmzeit heute: 2 Std. 15 Min.<br>Entsperrungen: 42</div>`;
        container.innerHTML = html;
      }

      // --- 15. NOTFALL & SICHERHEIT ---
      else if (view.screen === "emergency") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🚨 Notfall & Sicherheit</h1></div>`;
        html += `<div class="field"><label>Notfallkontakte</label><input type="text" placeholder="Name, Telefonnummer" style="width:100%;padding:10px;border-radius:8px;"></div>`;
        container.innerHTML = html;
      }

      // --- 16. SOFTWARE-UPDATE & SYSTEM ---
      else if (view.screen === "system") {
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

      // Globale Navigation
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
  console.log('%c⚙️ HalDo Settings v24.0 — Professional Pro Max bereit', GOLD_STYLE);
})();
