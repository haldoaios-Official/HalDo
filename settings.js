/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SETTINGS v25.0 (FULLY FUNCTIONAL)
   Live-Theme-Injection · App-Individual-Settings · Benachrichtigungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:14px;text-shadow:0 0 10px #ffd700;background:#0a0e2a;padding:4px 8px;border-radius:6px;';
  console.log('%c⚙️ HalDo Settings v25.0 — Fully Functional', GOLD_STYLE);

  // --- Standard-Einstellungen ---
  var DEFAULT = {
    deviceName: "HalDo-Gerät",
    systemVersion: "HalDo AI OS 1.0.0",
    theme: "dark",
    accentColor: "#ffd700",
    brightness: 100,
    fontFamily: "system",
    fontSize: 100,
    language: "de",
    assistant: "ai",
    ttsRate: 1.0,
    ttsPitch: 1.0,
    notificationsEnabled: true,
    dndEnabled: false,
    volumeMedia: 80,
    volumeRing: 80,
    volumeAlarm: 100,
    vibrationEnabled: true,
    batterySaver: false,
    screenLock: false,
    permissions: {},
    appConfigs: {}, // NEU: Speichert Einstellungen für jede App
    keyboardLanguages: ["de", "en"],
    accessibilityReader: false,
    simulatedStorage: { total: 100 * 1024 * 1024 * 1024, used: 12.5 * 1024 * 1024 * 1024 }
  };

  // --- App-Liste (Simulation deiner 106 Apps) ---
  var APP_LIST = [
    { id: "blitzer", name: "Blitzer", emoji: "⚠️" },
    { id: "auto", name: "Auto", emoji: "🚗" },
    { id: "chat", name: "Chat", emoji: "💬" },
    { id: "email", name: "E-Mail", emoji: "📧" },
    { id: "phone", name: "Phone", emoji: "📞" },
    { id: "notes", name: "Notizen", emoji: "📝" },
    { id: "kalender", name: "Kalender", emoji: "📅" },
    { id: "musik", name: "Musik", emoji: "🎵" },
    { id: "photos", name: "Fotos", emoji: "📷" },
    { id: "wetter", name: "Wetter", emoji: "🌤️" },
    { id: "ezidi", name: "Ezidi Zentrum", emoji: "🦚" }
  ];

  // --- Hilfsfunktionen ---
  function getSettings(store) {
    var s = store.get("settings", {});
    var m = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(s).forEach(function(k){ m[k] = s[k]; });
    
    // Initialisiere App-Configs, falls leer
    if (!m.appConfigs || Object.keys(m.appConfigs).length === 0) {
      m.appConfigs = {};
      APP_LIST.forEach(function(app) {
        m.appConfigs[app.id] = { notifMode: "normal", scale: 100, color: m.accentColor };
      });
    }
    return m;
  }
  
  function saveSettings(store, s) {
    store.set("settings", s);
    applyThemeToSystem(s); // Wendet das Theme sofort auf das System an
  }

  function applyThemeToSystem(s) {
    // Setzt globale CSS-Variablen, die das gesamte HalDo OS steuern
    var root = document.documentElement;
    root.style.setProperty('--haldo-accent', s.accentColor);
    root.style.setProperty('--haldo-bg', s.theme === 'dark' ? '#0a0e1a' : '#f5f5f5');
    root.style.setProperty('--haldo-text', s.theme === 'dark' ? '#ffffff' : '#000000');
    root.style.setProperty('--haldo-font-size', s.fontSize + '%');
    root.style.setProperty('--haldo-font-family', s.fontFamily === 'system' ? 'system-ui, sans-serif' : s.fontFamily);
    
    // Falls es ein Shell-Element gibt, passen wir es an
    document.body.style.fontSize = s.fontSize + '%';
    document.body.style.filter = `brightness(${s.brightness}%)`;
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function formatBytes(bytes) { if (bytes === 0) return '0 B'; var k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']; var i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; }

  // --- Haupt-Render-Funktion ---
  function render(container, ctx) {
    var store = ctx.store;
    var view = { screen: "main", currentApp: null };
    
    // Theme beim Start anwenden
    applyThemeToSystem(getSettings(store));

    function build() {
      var s = getSettings(store);
      var accent = s.accentColor;
      var isDark = s.theme === 'dark';

      // --- Globales CSS (nutzt die CSS-Variablen) ---
      var css = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Yezidi&display=swap');
        
        .settings-app { font-family: var(--haldo-font-family); color: var(--haldo-text); background: var(--haldo-bg); min-height: 100vh; padding: 16px; font-size: var(--haldo-font-size); }
        .settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .settings-header h1 { font-size: 24px; font-weight: 800; margin: 0; }
        .back-btn { background: transparent; border: none; color: var(--haldo-accent); font-size: 14px; font-weight: 700; cursor: pointer; padding: 8px 0; }
        .settings-list { display: grid; gap: 8px; }
        .settings-item { background: ${isDark ? 'rgba(255,255,255,0.05)' : '#fff'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
        .settings-item:hover { border-color: var(--haldo-accent); background: ${isDark ? 'rgba(255,255,255,0.1)' : '#fffbe6'}; }
        .settings-item .label { font-weight: 600; font-size: 15px; }
        .settings-item .value { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; }
        .settings-item .icon { font-size: 20px; margin-right: 12px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${isDark ? '#aaa' : '#444'}; }
        .field input[type="range"] { width: 100%; accent-color: var(--haldo-accent); }
        .field select, .field input[type="text"], .field input[type="color"] { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid ${isDark ? '#333' : '#ccc'}; background: ${isDark ? '#111' : '#fff'}; color: ${isDark ? '#fff' : '#000'}; font-size: 14px; font-family: inherit; }
        .toggle { display: flex; align-items: center; gap: 8px; }
        .toggle input { width: 18px; height: 18px; accent-color: var(--haldo-accent); }
        .btn { padding: 12px 20px; border-radius: 10px; border: none; background: var(--haldo-accent); color: #000; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; }
        .btn-secondary { background: ${isDark ? 'rgba(255,255,255,0.1)' : '#eee'}; color: var(--haldo-text); border: 1px solid ${isDark ? '#333' : '#ccc'}; }
        .color-swatch { width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; display: inline-block; margin: 4px; }
        .color-swatch.active { border-color: #fff; box-shadow: 0 0 12px var(--haldo-accent); }
        .storage-bar { height: 8px; background: ${isDark ? '#222' : '#ddd'}; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .storage-bar-fill { height: 100%; background: var(--haldo-accent); transition: width 0.3s; }
        .info-text { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; line-height: 1.6; }
        .category-title { font-size: 13px; font-weight: 700; color: ${isDark ? '#666' : '#999'}; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }
        
        /* App-Preview Box */
        .app-preview-box { background: ${isDark ? '#111' : '#eee'}; border: 2px dashed var(--haldo-accent); border-radius: 12px; padding: 20px; text-align: center; margin-top: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; }
        .app-preview-icon { font-size: 40px; margin-bottom: 8px; }
        .app-preview-title { font-weight: 900; }
      `;

      var html = `<style>${css}</style><div class="settings-app">`;

      // --- HAUPTMENÜ ---
      if (view.screen === "main") {
        html += `<div class="settings-header"><h1>⚙️ Einstellungen</h1></div><div class="settings-list">`;
        var categories = [
          { id: "general", icon: "📱", label: "Allgemein & Info" },
          { id: "display", icon: "🎨", label: "Darstellung & Display" },
          { id: "language", icon: "🌍", label: "Sprache & Region" },
          { id: "ai", icon: "🤖", label: "HalDo KI & Stimme" },
          { id: "apps", icon: "🔔", label: "Apps & Benachrichtigungen" },
          { id: "sound", icon: "🔊", label: "Ton & Vibration" },
          { id: "storage", icon: "💾", label: "Speicher" },
          { id: "security", icon: "🔐", label: "Sicherheit & Datenschutz" },
          { id: "accessibility", icon: "🦾", label: "Bedienungshilfen" },
          { id: "system", icon: "🔄", label: "Software-Update" }
        ];
        categories.forEach(function(c) {
          html += `<div class="settings-item" data-nav="${c.id}"><span><span class="icon">${c.icon}</span><span class="label">${c.label}</span></span><span>›</span></div>`;
        });
        html += `</div>`;
      }

      // --- 1. ALLGEMEIN ---
      else if (view.screen === "general") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📱 Allgemein & Info</h1></div>`;
        html += `<div class="field"><label>Gerätename</label><input type="text" id="deviceName" value="${esc(s.deviceName)}"></div>`;
        html += `<div class="field"><label>Systemversion</label><div class="info-text">${s.systemVersion}</div></div>`;
        html += `<button class="btn" id="saveGeneral">Speichern</button>`;
        container.innerHTML = html;
        container.querySelector("#saveGeneral").addEventListener("click", function() {
          s.deviceName = container.querySelector("#deviceName").value;
          saveSettings(store, s);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Gespeichert!");
        });
      }

      // --- 2. DISPLAY (Live-Update) ---
      else if (view.screen === "display") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🎨 Darstellung & Display</h1></div>`;
        html += `<div class="field"><label>Helligkeit (${s.brightness}%)</label><input type="range" id="brightness" min="10" max="100" value="${s.brightness}"></div>`;
        html += `<div class="field toggle"><label>Dark Mode</label><input type="checkbox" id="darkMode" ${isDark ? 'checked' : ''}></div>`;
        html += `<div class="field"><label>Akzentfarbe</label><div>`;
        ['#ffd700','#4dd0e1','#ff5555','#4ade80','#b478ff','#ff8844','#ff77aa'].forEach(function(c) {
          html += `<span class="color-swatch ${s.accentColor === c ? 'active' : ''}" data-color="${c}" style="background:${c}"></span>`;
        });
        html += `</div></div>`;
        html += `<div class="field"><label>Schriftart</label><select id="fontFamily">
          <option value="system" ${s.fontFamily === 'system' ? 'selected' : ''}>System Standard</option>
          <option value="sans-serif" ${s.fontFamily === 'sans-serif' ? 'selected' : ''}>Sans Serif</option>
          <option value="serif" ${s.fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
          <option value="monospace" ${s.fontFamily === 'monospace' ? 'selected' : ''}>Monospace</option>
          <option value="'Noto Serif Yezidi', serif" ${s.fontFamily === "'Noto Serif Yezidi', serif" ? 'selected' : ''}>Ezidi (Yezidi)</option>
        </select></div>`;
        html += `<div class="field"><label>Schriftgröße (${s.fontSize}%)</label><input type="range" id="fontSize" min="80" max="150" value="${s.fontSize}"></div>`;
        container.innerHTML = html;
        
        // LIVE-UPDATE Events
        container.querySelector("#brightness").addEventListener("input", function(e) { s.brightness = parseInt(e.target.value); applyThemeToSystem(s); });
        container.querySelector("#brightness").addEventListener("change", function() { saveSettings(store, s); });
        
        container.querySelector("#darkMode").addEventListener("change", function(e) { s.theme = e.target.checked ? 'dark' : 'light'; saveSettings(store, s); build(); });
        
        container.querySelectorAll(".color-swatch").forEach(function(el) { 
          el.addEventListener("click", function() { s.accentColor = el.dataset.color; saveSettings(store, s); build(); }); 
        });
        
        container.querySelector("#fontFamily").addEventListener("change", function(e) { s.fontFamily = e.target.value; saveSettings(store, s); build(); });
        
        container.querySelector("#fontSize").addEventListener("input", function(e) { s.fontSize = parseInt(e.target.value); applyThemeToSystem(s); });
        container.querySelector("#fontSize").addEventListener("change", function() { saveSettings(store, s); });
      }

      // --- 3. SPRACHE ---
      else if (view.screen === "language") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🌍 Sprache & Region</h1></div>`;
        html += `<div class="field"><label>Systemsprache</label><select id="language">
          <option value="de" ${s.language === 'de' ? 'selected' : ''}>Deutsch</option>
          <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
          <option value="tr" ${s.language === 'tr' ? 'selected' : ''}>Türkçe</option>
          <option value="ar" ${s.language === 'ar' ? 'selected' : ''}>العربية</option>
          <option value="ku" ${s.language === 'ku' ? 'selected' : ''}>Kurdî (Kurmanji)</option>
          <option value="ku-Yezidi" ${s.language === 'ku-Yezidi' ? 'selected' : ''}>Kurdî (Ezidi)</option>
        </select></div>`;
        container.innerHTML = html;
        container.querySelector("#language").addEventListener("change", function(e) { s.language = e.target.value; saveSettings(store, s); });
      }

      // --- 4. KI ---
      else if (view.screen === "ai") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🤖 HalDo KI & Stimme</h1></div>`;
        html += `<div class="field"><label>KI-Assistent</label><select id="assistant">
          <option value="ai" ${s.assistant === 'ai' ? 'selected' : ''}>HalDo AI</option>
          <option value="cyborg" ${s.assistant === 'cyborg' ? 'selected' : ''}>HalDo Cyborg</option>
          <option value="robot" ${s.assistant === 'robot' ? 'selected' : ''}>HalDo Roboter</option>
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

      // --- 5. APPS & BENACHRICHTIGUNGEN (Übersicht) ---
      else if (view.screen === "apps") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔔 Apps & Benachrichtigungen</h1></div>`;
        html += `<div class="field toggle"><label>Globale Benachrichtigungen</label><input type="checkbox" id="notificationsEnabled" ${s.notificationsEnabled ? 'checked' : ''}></div>`;
        html += `<div class="category-title">Apps verwalten</div>`;
        html += `<div class="settings-list">`;
        APP_LIST.forEach(function(app) {
          var appS = s.appConfigs[app.id] || { notifMode: "normal" };
          var modeText = { loud: "Laut", normal: "Standard", quiet: "Leise", mute: "Stumm", off: "Aus" }[appS.notifMode] || "Standard";
          html += `<div class="settings-item" data-app-detail="${app.id}">
            <span><span class="icon">${app.emoji}</span><span class="label">${app.name}</span></span>
            <span class="value">${modeText} ›</span>
          </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelector("#notificationsEnabled").addEventListener("change", function(e) { s.notificationsEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelectorAll("[data-app-detail]").forEach(function(el) {
          el.addEventListener("click", function() { view.screen = "app_detail"; view.currentApp = el.dataset.appDetail; build(); });
        });
      }

      // --- 5b. APP-DETAILS (Einzelne App konfigurieren) ---
      else if (view.screen === "app_detail" && view.currentApp) {
        var app = APP_LIST.find(function(a) { return a.id === view.currentApp; });
        var appS = s.appConfigs[app.id] || { notifMode: "normal", scale: 100, color: s.accentColor };
        
        html += `<button class="back-btn" data-nav="apps">‹ Zurück zu Apps</button>`;
        html += `<div class="settings-header"><h1>${app.emoji} ${app.name}</h1></div>`;
        
        // Benachrichtigungs-Modus
        html += `<div class="field"><label>Benachrichtigungen</label><select id="appNotifMode">
          <option value="loud" ${appS.notifMode === 'loud' ? 'selected' : ''}>🔊 Laut (Priorität)</option>
          <option value="normal" ${appS.notifMode === 'normal' ? 'selected' : ''}>🔔 Standard</option>
          <option value="quiet" ${appS.notifMode === 'quiet' ? 'selected' : ''}>🔉 Leise</option>
          <option value="mute" ${appS.notifMode === 'mute' ? 'selected' : ''}>🔇 Stumm (Nur Optisch)</option>
          <option value="off" ${appS.notifMode === 'off' ? 'selected' : ''}>🚫 Aus (Keine)</option>
        </select></div>`;
        
        // App-Größe (Skalierung)
        html += `<div class="field"><label>App-Größe (${appS.scale}%)</label><input type="range" id="appScale" min="50" max="150" value="${appS.scale}"></div>`;
        
        // App-Farbe (Eigene Akzentfarbe für diese App)
        html += `<div class="field"><label>Eigene App-Farbe</label><input type="color" id="appColor" value="${appS.color}"></div>`;
        
        // Live-Vorschau
        html += `<div class="field"><label>Live-Vorschau</label>
          <div class="app-preview-box" style="transform: scale(${appS.scale / 100}); border-color: ${appS.color};">
            <div class="app-preview-icon">${app.emoji}</div>
            <div class="app-preview-title" style="color: ${appS.color};">${app.name}</div>
          </div>
        </div>`;

        html += `<button class="btn" id="saveAppDetail">Speichern & Anwenden</button>`;
        
        container.innerHTML = html;
        
        // Live-Vorschau Update
        container.querySelector("#appScale").addEventListener("input", function(e) {
          var scale = e.target.value;
          container.querySelector(".app-preview-box").style.transform = `scale(${scale / 100})`;
        });
        container.querySelector("#appColor").addEventListener("input", function(e) {
          var color = e.target.value;
          container.querySelector(".app-preview-box").style.borderColor = color;
          container.querySelector(".app-preview-title").style.color = color;
        });
        
        // Speichern
        container.querySelector("#saveAppDetail").addEventListener("click", function() {
          s.appConfigs[app.id] = {
            notifMode: container.querySelector("#appNotifMode").value,
            scale: parseInt(container.querySelector("#appScale").value),
            color: container.querySelector("#appColor").value
          };
          saveSettings(store, s);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success(app.name + " angepasst!");
          view.screen = "apps"; build();
        });
      }

      // --- 6. TON ---
      else if (view.screen === "sound") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔊 Ton & Vibration</h1></div>`;
        html += `<div class="field"><label>Medienlautstärke (${s.volumeMedia}%)</label><input type="range" id="volumeMedia" min="0" max="100" value="${s.volumeMedia}"></div>`;
        html += `<div class="field"><label>Alarm-Lautstärke (${s.volumeAlarm}%)</label><input type="range" id="volumeAlarm" min="0" max="100" value="${s.volumeAlarm}"></div>`;
        html += `<div class="field toggle"><label>Vibration</label><input type="checkbox" id="vibrationEnabled" ${s.vibrationEnabled ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        container.querySelector("#volumeMedia").addEventListener("input", function(e) { s.volumeMedia = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#volumeAlarm").addEventListener("input", function(e) { s.volumeAlarm = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#vibrationEnabled").addEventListener("change", function(e) { s.vibrationEnabled = e.target.checked; saveSettings(store, s); });
      }

      // --- 7. SPEICHER ---
      else if (view.screen === "storage") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>💾 Speicher</h1></div>`;
        var total = s.simulatedStorage.total;
        var used = s.simulatedStorage.used;
        var percent = Math.min(100, (used / total) * 100);
        html += `<div class="field"><label>Belegter Speicher</label><div class="info-text">${formatBytes(used)} von ${formatBytes(total)} belegt</div><div class="storage-bar"><div class="storage-bar-fill" style="width:${percent}%"></div></div></div>`;
        html += `<button class="btn btn-secondary" id="clearCache">🗑️ Cache leeren</button>`;
        container.innerHTML = html;
        container.querySelector("#clearCache").addEventListener("click", function() { 
          s.simulatedStorage.used = 2 * 1024 * 1024 * 1024; // Setzt auf 2GB zurück
          saveSettings(store, s); build();
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Cache geleert! 10 GB freigegeben."); 
        });
      }

      // --- 8. SICHERHEIT ---
      else if (view.screen === "security") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔐 Sicherheit</h1></div>`;
        html += `<div class="field"><label>App-Berechtigungen</label><div class="info-text">Kamera: ${s.permissions.camera ? '✅' : '❌'}<br>Mikrofon: ${s.permissions.microphone ? '✅' : '❌'}<br>Standort: ${s.permissions.location ? '✅' : '❌'}</div></div>`;
        html += `<button class="btn btn-secondary" id="requestPermissions">Berechtigungen anfragen</button>`;
        container.innerHTML = html;
        container.querySelector("#requestPermissions").addEventListener("click", async function() {
          try {
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); s.permissions.camera = true; s.permissions.microphone = true; }
            if(navigator.geolocation) { await new Promise(function(res, rej) { navigator.geolocation.getCurrentPosition(res, rej); }); s.permissions.location = true; }
            saveSettings(store, s); build();
            if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Berechtigungen erteilt!");
          } catch(e) { if(window.HalDo && HalDo.Notify) HalDo.Notify.error("Verweigert: " + e.message); }
        });
      }

      // --- 9. BEDIENUNGSHILFEN ---
      else if (view.screen === "accessibility") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🦾 Bedienungshilfen</h1></div>`;
        html += `<div class="field"><label>Tastatur-Sprachen</label><div class="info-text">Aktive Sprachen: ${s.keyboardLanguages.join(', ')}</div>
          <select id="addKeyboardLang" style="margin-top:8px;">
            <option value="">Sprache hinzufügen...</option>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="ku-Yezidi">Kurdî (Ezidi) - Alte Schrift</option>
          </select>
        </div>`;
        container.innerHTML = html;
        container.querySelector("#addKeyboardLang").addEventListener("change", function(e) {
          var lang = e.target.value;
          if(lang && !s.keyboardLanguages.includes(lang)) {
            s.keyboardLanguages.push(lang); saveSettings(store, s); build();
          }
        });
      }

      // --- 10. SYSTEM ---
      else if (view.screen === "system") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔄 Software-Update</h1></div>`;
        html += `<div class="field"><label>Aktuelle Version</label><div class="info-text">${s.systemVersion}</div></div>`;
        html += `<button class="btn" id="checkUpdate">Nach Updates suchen</button>`;
        container.innerHTML = html;
        container.querySelector("#checkUpdate").addEventListener("click", function() {
          if(window.HalDo && HalDo.Notify) HalDo.Notify.info("Suche nach Updates...");
          setTimeout(function() { if(window.HalDo && HalDo.Notify) HalDo.Notify.success("System ist auf dem neuesten Stand."); }, 1500);
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

  // Globaler Helper, damit andere Apps (z.B. Blitzer) ihre Einstellungen abrufen können
  window.HalDo = window.HalDo || {};
  window.HalDo.AppSettings = {
    get: function(appId) {
      var store = window.HalDo.Runtime && window.HalDo.Runtime.store ? window.HalDo.Runtime.store : null;
      // Fallback auf den Store des aktuellen Contexts, falls aufrufbar
      var s = store ? store.get("settings", {}) : {};
      var m = JSON.parse(JSON.stringify(DEFAULT));
      Object.keys(s).forEach(function(k){ m[k] = s[k]; });
      return m.appConfigs && m.appConfigs[appId] ? m.appConfigs[appId] : { notifMode: "normal", scale: 100, color: m.accentColor };
    }
  };

  HalDoApp("settings", { name: "Einstellungen", icon: "⚙️", render: render, category: "system" });
  console.log('%c⚙️ HalDo Settings v25.0 — Fully Functional bereit', GOLD_STYLE);
})();
