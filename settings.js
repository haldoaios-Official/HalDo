/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SETTINGS v27.0 (THE ULTIMATE OS CONTROL FIXED)
   Über 100 Apps · Detaillierte Benachrichtigungen · Live Design
   Global API für alle Apps · Fehlerfrei
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:14px;text-shadow:0 0 10px #ffd700;background:#0a0e2a;padding:4px 8px;border-radius:6px;';
  console.log('%c⚙️ HalDo Settings v27.0 — Ultimate OS Control', GOLD_STYLE);

  // --- Die Master-Liste deiner 100+ Apps (aus deinem Boot-Report) ---
  var ALL_APPS = [
    { id: "ai-chat", name: "AI Chat", emoji: "🤖" }, { id: "blitzer", name: "HalDo Blitzer", emoji: "⚠️" },
    { id: "auto", name: "Auto", emoji: "🚗" }, { id: "chat", name: "Chat", emoji: "💬" },
    { id: "email", name: "E-Mail", emoji: "📧" }, { id: "posteingang", name: "Posteingang", emoji: "📥" },
    { id: "kontakte", name: "Kontakte", emoji: "👥" }, { id: "phone", name: "Phone", emoji: "📞" },
    { id: "videocall", name: "Videocall", emoji: "📹" }, { id: "aufnahme", name: "Aufnahme", emoji: "🎙️" },
    { id: "voicememos", name: "Voicememos", emoji: "🎤" }, { id: "tasks", name: "Tasks", emoji: "✅" },
    { id: "todo", name: "ToDo", emoji: "📋" }, { id: "notes", name: "Notes", emoji: "📝" },
    { id: "kalender", name: "Kalender", emoji: "📅" }, { id: "projekte", name: "Projekte", emoji: "📊" },
    { id: "arbeitszeit", name: "Arbeitszeit", emoji: "⏱️" }, { id: "dokumente", name: "Dokumente", emoji: "📄" },
    { id: "links", name: "Links", emoji: "🔗" }, { id: "passwort", name: "Passwörter", emoji: "🔐" },
    { id: "clipboard", name: "Clipboard", emoji: "📋" }, { id: "filemanager", name: "Dateien", emoji: "📁" },
    { id: "fitness", name: "Fitness", emoji: "🏋️" }, { id: "gesundheit", name: "Gesundheit", emoji: "🏥" },
    { id: "stimmung", name: "Stimmung", emoji: "😊" }, { id: "gewohnheiten", name: "Gewohnheiten", emoji: "🔄" },
    { id: "schlaf", name: "Schlaf", emoji: "🌙" }, { id: "atem", name: "Atem", emoji: "🫁" },
    { id: "wasser", name: "Wasser", emoji: "💧" }, { id: "kueche", name: "Küche", emoji: "🍳" },
    { id: "rezept", name: "Rezepte", emoji: "🍲" }, { id: "einkauf", name: "Einkauf", emoji: "🛒" },
    { id: "zuhause", name: "Zuhause", emoji: "🏠" }, { id: "finanzen", name: "Finanzen", emoji: "💰" },
    { id: "reisen", name: "Reisen", emoji: "✈️" }, { id: "musik", name: "Musik", emoji: "🎵" },
    { id: "photos", name: "Photos", emoji: "📷" }, { id: "video", name: "Video", emoji: "🎥" },
    { id: "bild", name: "Bild", emoji: "🖼️" }, { id: "wetter", name: "Wetter", emoji: "🌤️" },
    { id: "rechner", name: "Rechner", emoji: "🧮" }, { id: "wissenschaftlich", name: "Wissenschaft", emoji: "🧪" },
    { id: "umrechner", name: "Umrechner", emoji: "📏" }, { id: "waehrung", name: "Währung", emoji: "💱" },
    { id: "timer", name: "Timer", emoji: "⏳" }, { id: "pomodoro", name: "Pomodoro", emoji: "🍅" },
    { id: "uebersetzer", name: "Übersetzer", emoji: "🌐" }, { id: "woerterbuch", name: "Wörterbuch", emoji: "📖" },
    { id: "vokabeln", name: "Vokabeln", emoji: "🅰️" }, { id: "flashcards", name: "Flashcards", emoji: "🎴" },
    { id: "lerne", name: "Lernen", emoji: "🎓" }, { id: "notfall", name: "Notfall", emoji: "🚨" },
    { id: "bewertung", name: "Bewertung", emoji: "⭐" }, { id: "spiele", name: "Spiele", emoji: "🎮" },
    { id: "sprachen", name: "Sprachen", emoji: "🗣️" }, { id: "fahrschule", name: "Fahrschule", emoji: "🚦" },
    { id: "ezidi", name: "Ezidi Zentrum", emoji: "🦚" }, { id: "periodensystem", name: "Periodensystem", emoji: "⚗️" },
    { id: "mathe", name: "Mathe", emoji: "📐" }, { id: "geo-quiz", name: "Geo Quiz", emoji: "🌍" },
    { id: "wissen", name: "Wissen", emoji: "🧠" }, { id: "qr", name: "QR Scanner", emoji: "📱" },
    { id: "barcode", name: "Barcode", emoji: "🏷️" }, { id: "random", name: "Zufall", emoji: "🎲" },
    { id: "text-analyse", name: "Text-Analyse", emoji: "📄" }, { id: "datum-rechner", name: "Datumsrechner", emoji: "📅" },
    { id: "netzwerk-info", name: "Netzwerk", emoji: "📡" }, { id: "geraete-info", name: "Geräte-Info", emoji: "📱" },
    { id: "weltuhr", name: "Weltuhr", emoji: "🕒" }, { id: "kamera", name: "Kamera", emoji: "📸" },
    { id: "spiegel", name: "Spiegel", emoji: "🪞" }, { id: "taschenlampe", name: "Taschenlampe", emoji: "🔦" },
    { id: "lupe", name: "Lupe", emoji: "🔍" }, { id: "kredit", name: "Kredit", emoji: "💳" },
    { id: "bmi", name: "BMI", emoji: "⚖️" }, { id: "statistik", name: "Statistik", emoji: "📈" },
    { id: "labor", name: "Labor", emoji: "🔬" }, { id: "bookmarks", name: "Bookmarks", emoji: "🔖" },
    { id: "leseliste", name: "Leseliste", emoji: "📚" }, { id: "sticky-notes", name: "Sticky Notes", emoji: "📌" },
    { id: "heatmap", name: "Heatmap", emoji: "🗺️" }, { id: "voice-kurdisch", name: "Kurdisch", emoji: "🗣️" }
  ];

  // --- Standard-Einstellungen ---
  var DEFAULT = {
    deviceName: "HalDo-Gerät",
    systemVersion: "HalDo AI OS 1.0.0 (Ultimate)",
    theme: "dark",
    accentColor: "#ffd700",
    brightness: 100,
    fontSize: 100,
    language: "de",
    notificationsEnabled: true,
    dndEnabled: false,
    vibrationEnabled: true,
    simulatedStorage: { total: 100 * 1024 * 1024 * 1024, used: 12.5 * 1024 * 1024 * 1024 },
    appConfigs: {} 
  };

  // --- Funktion zum Erstellen der Standard-Config für eine App ---
  function getDefaultAppConfig() {
    return {
      notif: { status: "on", priority: "normal", sound: "default", vibrate: true, popup: true },
      design: { scale: 100, color: "#ffd700" },
      permissions: { camera: false, mic: false, location: false }
    };
  }

  function getSettings(store) {
    var s = store.get("settings", {});
    var m = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(s).forEach(function(k){ m[k] = s[k]; });
    
    // Initialisiere appConfigs für alle Apps, falls sie fehlen
    if (!m.appConfigs) m.appConfigs = {};
    ALL_APPS.forEach(function(app) {
      if (!m.appConfigs[app.id]) {
        m.appConfigs[app.id] = getDefaultAppConfig();
      }
    });
    return m;
  }
  
  function saveSettings(store, s) {
    store.set("settings", s);
    applyThemeToSystem(s);
  }

  function applyThemeToSystem(s) {
    var root = document.documentElement;
    root.style.setProperty('--haldo-accent', s.accentColor);
    root.style.setProperty('--haldo-bg', s.theme === 'dark' ? '#0a0e1a' : '#f5f5f5');
    root.style.setProperty('--haldo-text', s.theme === 'dark' ? '#ffffff' : '#000000');
    root.style.setProperty('--haldo-font-size', s.fontSize + '%');
    if (document.body) document.body.style.filter = `brightness(${s.brightness}%)`;
  }

  function esc(str) { return String(str).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function formatBytes(bytes) { if (bytes === 0) return '0 B'; var k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']; var i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; }

  var audioCtx = null;
  function playTestTone(type) {
    try {
      if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      if(type === 'none' || type === 'silent') return;
      
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type === 'siren' ? "sawtooth" : "sine";
      o.frequency.value = type === 'siren' ? 800 : 880;
      o.connect(g); g.connect(audioCtx.destination);
      
      var now = audioCtx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.3, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      if (type === 'siren') {
        o.frequency.linearRampToValueAtTime(1200, now + 0.2);
        o.frequency.linearRampToValueAtTime(800, now + 0.4);
      }
      o.start(now); o.stop(now + 0.5);
    } catch(e) {}
  }

  function render(container, ctx) {
    var store = ctx.store;
    var view = { screen: "main", currentApp: null };
    applyThemeToSystem(getSettings(store));

    // --- GLOBALER ZUGRIFF FÜR ALLE ANDEREN APPS (WICHTIG!) ---
    window.HalDo.getAppConfig = function(appId) {
      var currentSettings = getSettings(store);
      return currentSettings.appConfigs[appId] || getDefaultAppConfig();
    };

    function build() {
      var s = getSettings(store);
      var isDark = s.theme === 'dark';

      var css = `
        .settings-app { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--haldo-text); background: var(--haldo-bg); min-height: 100vh; padding: 16px; font-size: var(--haldo-font-size); }
        .settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .settings-header h1 { font-size: 24px; font-weight: 800; margin: 0; }
        .back-btn { background: transparent; border: none; color: var(--haldo-accent); font-size: 14px; font-weight: 700; cursor: pointer; padding: 8px 0; }
        .settings-list { display: grid; gap: 8px; max-height: 65vh; overflow-y: auto; padding-right: 8px; }
        .settings-item { background: ${isDark ? 'rgba(255,255,255,0.05)' : '#fff'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
        .settings-item:hover { border-color: var(--haldo-accent); }
        .settings-item .label { font-weight: 600; font-size: 15px; }
        .settings-item .value { font-size: 13px; font-weight:800; }
        .settings-item .icon { font-size: 20px; margin-right: 12px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${isDark ? '#aaa' : '#444'}; }
        .field select, .field input[type="text"], .field input[type="color"] { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid ${isDark ? '#333' : '#ccc'}; background: ${isDark ? '#111' : '#fff'}; color: ${isDark ? '#fff' : '#000'}; font-size: 14px; font-family: inherit; }
        .toggle { display: flex; align-items: center; gap: 8px; }
        .toggle input { width: 18px; height: 18px; accent-color: var(--haldo-accent); }
        .btn { padding: 12px 20px; border-radius: 10px; border: none; background: var(--haldo-accent); color: #000; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; }
        .btn-secondary { background: ${isDark ? 'rgba(255,255,255,0.1)' : '#eee'}; color: var(--haldo-text); border: 1px solid ${isDark ? '#333' : '#ccc'}; }
        .storage-bar { height: 8px; background: ${isDark ? '#222' : '#ddd'}; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .storage-bar-fill { height: 100%; background: var(--haldo-accent); transition: width 0.3s; }
        .info-text { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; line-height: 1.6; }
        .category-title { font-size: 13px; font-weight: 700; color: ${isDark ? '#666' : '#999'}; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }
        
        .app-detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .app-detail-icon { font-size: 48px; background: ${isDark ? '#222' : '#ddd'}; padding: 12px; border-radius: 16px; }
        .app-detail-title { font-size: 24px; font-weight: 800; margin: 0; }
        .app-detail-tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid ${isDark ? '#333' : '#ccc'}; padding-bottom: 8px; }
        .tab-btn { background: transparent; border: none; color: ${isDark ? '#aaa' : '#666'}; font-weight: 700; font-size: 14px; padding: 8px 16px; cursor: pointer; border-radius: 8px; }
        .tab-btn.active { background: var(--haldo-accent); color: #000; }
        .preview-box { background: ${isDark ? '#111' : '#eee'}; border: 2px dashed var(--haldo-accent); border-radius: 12px; padding: 20px; text-align: center; margin-top: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; }
      `;

      var html = `<style>${css}</style><div class="settings-app">`;

      // --- HAUPTMENÜ ---
      if (view.screen === "main") {
        html += `<div class="settings-header"><h1>⚙️ Einstellungen</h1></div><div class="settings-list">`;
        var categories = [
          { id: "general", icon: "📱", label: "Allgemein & Info" },
          { id: "display", icon: "🎨", label: "Darstellung & Display" },
          { id: "apps", icon: "🔔", label: `Apps & Benachrichtigungen (${ALL_APPS.length})` },
          { id: "storage", icon: "💾", label: "Speicher (100 GB)" }
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

      // --- 2. DISPLAY ---
      else if (view.screen === "display") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🎨 Darstellung & Display</h1></div>`;
        html += `<div class="field"><label>Helligkeit (${s.brightness}%)</label><input type="range" id="brightness" min="10" max="100" value="${s.brightness}"></div>`;
        html += `<div class="field toggle"><label>Dark Mode</label><input type="checkbox" id="darkMode" ${isDark ? 'checked' : ''}></div>`;
        html += `<div class="field"><label>Globale Akzentfarbe</label><div>`;
        ['#ffd700','#4dd0e1','#ff5555','#4ade80','#b478ff','#ff8844','#ff77aa'].forEach(function(c) {
          html += `<span data-color="${c}" style="display:inline-block; width:40px; height:40px; border-radius:50%; background:${c}; margin:4px; cursor:pointer; border: 3px solid ${s.accentColor === c ? '#fff' : 'transparent'}"></span>`;
        });
        html += `</div></div>`;
        container.innerHTML = html;
        
        container.querySelector("#brightness").addEventListener("input", function(e) { s.brightness = parseInt(e.target.value); applyThemeToSystem(s); });
        container.querySelector("#brightness").addEventListener("change", function() { saveSettings(store, s); });
        container.querySelector("#darkMode").addEventListener("change", function(e) { s.theme = e.target.checked ? 'dark' : 'light'; saveSettings(store, s); build(); });
        container.querySelectorAll("[data-color]").forEach(function(el) { el.addEventListener("click", function() { s.accentColor = el.dataset.color; saveSettings(store, s); build(); }); });
      }

      // --- 3. APPS & BENACHRICHTIGUNGEN (Liste) ---
      else if (view.screen === "apps") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔔 Apps & Benachrichtigungen</h1></div>`;
        html += `<div class="field toggle"><label>Globale Benachrichtigungen</label><input type="checkbox" id="notificationsEnabled" ${s.notificationsEnabled ? 'checked' : ''}></div>`;
        html += `<div class="settings-list">`;
        ALL_APPS.forEach(function(app) {
          var appS = s.appConfigs[app.id].notif;
          var statusText = { on: "An", off: "Aus", mute: "Stumm", silent: "Lautlos" }[appS.status] || "An";
          var statusColor = appS.status === 'on' ? '#4ade80' : (appS.status === 'off' ? '#ff5555' : '#ffaa33');
          html += `<div class="settings-item" data-app-detail="${app.id}">
            <span><span class="icon">${app.emoji}</span><span class="label">${app.name}</span></span>
            <span class="value" style="color:${statusColor};">${statusText} ›</span>
          </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelector("#notificationsEnabled").addEventListener("change", function(e) { s.notificationsEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelectorAll("[data-app-detail]").forEach(function(el) {
          el.addEventListener("click", function() { view.screen = "app_detail"; view.currentApp = el.dataset.appDetail; build(); });
        });
      }

      // --- 4. APP-DETAILS (Die Königsklasse) ---
      else if (view.screen === "app_detail" && view.currentApp) {
        var app = ALL_APPS.find(function(a) { return a.id === view.currentApp; });
        var appS = s.appConfigs[app.id];
        
        html += `<button class="back-btn" data-nav="apps">‹ Zurück zu Apps</button>`;
        html += `<div class="app-detail-header">
          <div class="app-detail-icon">${app.emoji}</div>
          <div><h1 class="app-detail-title">${app.name}</h1><div class="info-text">ID: ${app.id}</div></div>
        </div>`;

        html += `<div class="app-detail-tabs">
          <button class="tab-btn active" data-tab="notif">🔔 Benachrichtigungen</button>
          <button class="tab-btn" data-tab="design">🎨 Design</button>
        </div>`;

        // TAB 1: BENACHRICHTIGUNGEN
        html += `<div id="tab-notif" class="tab-content">`;
        html += `<div class="field"><label>Status</label><select id="appNotifStatus">
          <option value="on" ${appS.notif.status === 'on' ? 'selected' : ''}>🔔 An (Normal)</option>
          <option value="off" ${appS.notif.status === 'off' ? 'selected' : ''}>🚫 Aus (Keine)</option>
          <option value="mute" ${appS.notif.status === 'mute' ? 'selected' : ''}>🔇 Stumm (Nur Vibration)</option>
          <option value="silent" ${appS.notif.status === 'silent' ? 'selected' : ''}>🔕 Lautlos (Kein Ton/Vib)</option>
        </select></div>`;
        html += `<div class="field"><label>Benachrichtigungston</label><select id="appNotifSound">
          <option value="default" ${appS.notif.sound === 'default' ? 'selected' : ''}>Standard</option>
          <option value="chime" ${appS.notif.sound === 'chime' ? 'selected' : ''}>🎵 Glocke</option>
          <option value="siren" ${appS.notif.sound === 'siren' ? 'selected' : ''}>🚨 Sirene</option>
          <option value="none" ${appS.notif.sound === 'none' ? 'selected' : ''}>🚫 Kein Ton</option>
        </select></div>`;
        html += `<div class="field toggle"><label>Vibration</label><input type="checkbox" id="appNotifVibrate" ${appS.notif.vibrate ? 'checked' : ''}></div>`;
        html += `<button class="btn btn-secondary" id="testNotif">🔊 Test-Benachrichtigung</button>`;
        html += `</div>`;

        // TAB 2: DESIGN
        html += `<div id="tab-design" class="tab-content" style="display:none;">`;
        html += `<div class="field"><label>App-Größe (${appS.design.scale}%)</label><input type="range" id="appScale" min="50" max="150" value="${appS.design.scale}"></div>`;
        html += `<div class="field"><label>Eigene App-Farbe</label><input type="color" id="appColor" value="${appS.design.color}"></div>`;
        html += `<div class="field"><label>Live-Vorschau</label>
          <div class="preview-box" id="appPreviewBox" style="transform: scale(${appS.design.scale / 100}); border-color: ${appS.design.color};">
            <div style="font-size: 40px; margin-bottom: 8px;">${app.emoji}</div>
            <div style="font-weight: 900; color: ${appS.design.color};">${app.name}</div>
          </div>
        </div>`;
        html += `</div>`;

        html += `<button class="btn" id="saveAppDetail" style="margin-top:20px; width:100%;">Alle Änderungen Speichern</button>`;
        
        container.innerHTML = html;

        // Tab-Logik
        container.querySelectorAll(".tab-btn").forEach(function(btn) {
          btn.addEventListener("click", function() {
            container.querySelectorAll(".tab-btn").forEach(function(b) { b.classList.remove("active"); });
            container.querySelectorAll(".tab-content").forEach(function(c) { c.style.display = "none"; });
            btn.classList.add("active");
            container.querySelector("#tab-" + btn.dataset.tab).style.display = "block";
          });
        });

        // Live-Vorschau Update
        container.querySelector("#appScale").addEventListener("input", function(e) {
          var scale = e.target.value;
          container.querySelector("#appPreviewBox").style.transform = `scale(${scale / 100})`;
          container.querySelector("label[for='appScale']").textContent = `App-Größe (${scale}%)`;
        });
        container.querySelector("#appColor").addEventListener("input", function(e) {
          var color = e.target.value;
          container.querySelector("#appPreviewBox").style.borderColor = color;
          container.querySelector("#appPreviewBox").querySelector("div:last-child").style.color = color;
        });

        // Test-Button
        container.querySelector("#testNotif").addEventListener("click", function() {
          var sound = container.querySelector("#appNotifSound").value;
          var vibrate = container.querySelector("#appNotifVibrate").checked;
          playTestTone(sound);
          if(vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.info("Test für " + app.name + " ausgelöst!");
        });

        // Speichern
        container.querySelector("#saveAppDetail").addEventListener("click", function() {
          s.appConfigs[app.id] = {
            notif: {
              status: container.querySelector("#appNotifStatus").value,
              priority: "normal",
              sound: container.querySelector("#appNotifSound").value,
              vibrate: container.querySelector("#appNotifVibrate").checked,
              popup: true
            },
            design: {
              scale: parseInt(container.querySelector("#appScale").value),
              color: container.querySelector("#appColor").value
            },
            permissions: appS.permissions // Behalte bestehende Rechte bei
          };
          saveSettings(store, s);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success(app.name + " gespeichert!");
          view.screen = "apps"; build();
        });
      }

      // --- 5. SPEICHER ---
      else if (view.screen === "storage") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>💾 Speicher (100 GB)</h1></div>`;
        var total = s.simulatedStorage.total;
        var used = s.simulatedStorage.used;
        var percent = Math.min(100, (used / total) * 100);
        html += `<div class="field"><label>Belegter Speicher</label><div class="info-text">${formatBytes(used)} von ${formatBytes(total)} belegt</div><div class="storage-bar"><div class="storage-bar-fill" style="width:${percent}%"></div></div></div>`;
        html += `<button class="btn btn-secondary" id="clearCache">🗑️ Cache leeren (10 GB freigeben)</button>`;
        container.innerHTML = html;
        container.querySelector("#clearCache").addEventListener("click", function() { 
          s.simulatedStorage.used = 2 * 1024 * 1024 * 1024; 
          saveSettings(store, s); build();
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Cache geleert! 10 GB freigegeben."); 
        });
      }

      html += `</div>`;
      container.innerHTML = html;

      // Globale Navigation
      container.querySelectorAll("[data-nav]").forEach(function(el) {
        el.addEventListener("click", function() { view.screen = el.dataset.nav; build(); });
      });
    }

    build();
  }

  HalDoApp("settings", { name: "Einstellungen", icon: "⚙️", render: render, category: "system" });
  console.log('%c⚙️ HalDo Settings v27.0 — Ultimate OS Control bereit', GOLD_STYLE);
})();
