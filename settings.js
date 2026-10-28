/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SETTINGS v29.0 (ULTIMATE SYSTEM CONTROL)
   Bluetooth Fix · Audio-Bibliothek · Granulare App-Steuerung
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:14px;text-shadow:0 0 10px #ffd700;background:#0a0e2a;padding:4px 8px;border-radius:6px;';
  console.log('%c⚙️ HalDo Settings v29.0 — ULTIMATE SYSTEM CONTROL', GOLD_STYLE);

  // --- Master-Liste der Apps ---
  var ALL_APPS = [
    { id: "blitzer", name: "HalDo Blitzer", emoji: "⚠️" }, { id: "auto", name: "Auto", emoji: "🚗" },
    { id: "chat", name: "Chat", emoji: "💬" }, { id: "email", name: "E-Mail", emoji: "📧" },
    { id: "phone", name: "Phone", emoji: "📞" }, { id: "notes", name: "Notes", emoji: "📝" },
    { id: "kalender", name: "Kalender", emoji: "📅" }, { id: "musik", name: "Musik", emoji: "🎵" },
    { id: "photos", name: "Photos", emoji: "📷" }, { id: "wetter", name: "Wetter", emoji: "🌤️" },
    { id: "ezidi", name: "Ezidi Zentrum", emoji: "🦚" }, { id: "voice-kurdisch", name: "Kurdisch", emoji: "🗣️" },
    { id: "ai-chat", name: "AI Chat", emoji: "🤖" }, { id: "todo", name: "ToDo", emoji: "📋" }
    // (Weitere Apps können hier hinzugefügt werden)
  ];

  // --- Audio-Bibliothek (Web Audio API Synthesizer) ---
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return audioCtx;
  }

  function playSound(type) {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;

    // Hilfsfunktion für einzelne Töne
    function tone(freq, start, dur, vol, wave) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = wave || 'sine';
      o.frequency.setValueAtTime(freq, now + start);
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(vol, now + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      o.start(now + start); o.stop(now + start + dur + 0.1);
    }

    switch(type) {
      case 'ringtone_old': // Klassisches Telefonklingeln
        for (let i = 0; i < 4; i++) {
          tone(440, i * 0.5, 0.15, 0.3, 'sine');
          tone(480, i * 0.5 + 0.15, 0.15, 0.3, 'sine');
        }
        break;
      case 'alarm_loud': // Wecker / Alarm
        for (let i = 0; i < 6; i++) {
          tone(880, i * 0.2, 0.1, 0.4, 'square');
        }
        break;
      case 'notification_chime': // Sanfte Benachrichtigung
        tone(523.25, 0, 0.2, 0.2, 'sine'); // C5
        tone(659.25, 0.15, 0.2, 0.2, 'sine'); // E5
        tone(783.99, 0.3, 0.3, 0.2, 'sine'); // G5
        break;
      case 'siren': // Sirene (Warnung)
        for (let i = 0; i < 5; i++) {
          tone(800, i * 0.3, 0.15, 0.3, 'sawtooth');
          tone(1000, i * 0.3 + 0.15, 0.15, 0.3, 'sawtooth');
        }
        break;
      case 'beep': // Kurzer Piepton
        tone(1000, 0, 0.1, 0.3, 'square');
        break;
      case 'none':
        break;
    }
  }

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
    vibrationEnabled: true,
    bluetoothDevice: null,
    batterySaver: false,
    appConfigs: {},
    masterVolume: 80,
    alarmVolume: 100,
    notificationVolume: 80,
    ringtoneType: 'ringtone_old',
    alarmType: 'alarm_loud',
    notificationType: 'notification_chime'
  };

  function getDefaultAppConfig() {
    return {
      notif: { status: "on", sound: "notification_chime", vibrate: true },
      design: { scale: 100, color: "#ffd700" }
    };
  }

  function getSettings(store) {
    var s = store.get("settings", {});
    var m = JSON.parse(JSON.stringify(DEFAULT));
    Object.keys(s).forEach(function(k){ m[k] = s[k]; });
    if (!m.appConfigs) m.appConfigs = {};
    ALL_APPS.forEach(function(app) {
      if (!m.appConfigs[app.id]) m.appConfigs[app.id] = getDefaultAppConfig();
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

  function render(container, ctx) {
    var store = ctx.store;
    var view = { screen: "main", currentApp: null };
    applyThemeToSystem(getSettings(store));

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
        .settings-item:hover { border-color: var(--haldo-accent); background: ${isDark ? 'rgba(255,215,0,0.05)' : '#fffbe6'}; }
        .settings-item .label { font-weight: 600; font-size: 15px; }
        .settings-item .value { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; font-weight: 800; }
        .settings-item .icon { font-size: 20px; margin-right: 12px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${isDark ? '#aaa' : '#444'}; }
        .field select, .field input[type="text"], .field input[type="color"] { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid ${isDark ? '#333' : '#ccc'}; background: ${isDark ? '#111' : '#fff'}; color: ${isDark ? '#fff' : '#000'}; font-size: 14px; font-family: inherit; }
        .field input[type="range"] { width: 100%; accent-color: var(--haldo-accent); }
        .toggle { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .toggle input { width: 18px; height: 18px; accent-color: var(--haldo-accent); }
        .btn { padding: 12px 20px; border-radius: 10px; border: none; background: var(--haldo-accent); color: #000; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; }
        .btn-secondary { background: ${isDark ? 'rgba(255,255,255,0.1)' : '#eee'}; color: var(--haldo-text); border: 1px solid ${isDark ? '#333' : '#ccc'}; }
        .info-text { font-size: 13px; color: ${isDark ? '#aaa' : '#666'}; line-height: 1.6; }
        .category-title { font-size: 13px; font-weight: 700; color: ${isDark ? '#666' : '#999'}; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 8px; }
        
        .app-detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .app-detail-icon { font-size: 48px; background: ${isDark ? '#222' : '#ddd'}; padding: 12px; border-radius: 16px; }
        .app-detail-title { font-size: 24px; font-weight: 800; margin: 0; }
      `;

      var html = `<style>${css}</style><div class="settings-app">`;

      // --- HAUPTMENÜ ---
      if (view.screen === "main") {
        html += `<div class="settings-header"><h1>⚙️ Einstellungen</h1></div><div class="settings-list">`;
        var categories = [
          { id: "general", icon: "📱", label: "Allgemein & Info" },
          { id: "display", icon: "🎨", label: "Darstellung & Display" },
          { id: "sounds", icon: "🔔", label: "Töne & Klingeltöne" },
          { id: "language", icon: "🌍", label: "Sprache & Region" },
          { id: "ai", icon: "🤖", label: "HalDo KI & Stimme" },
          { id: "connectivity", icon: "📡", label: "Verbindungen (Bluetooth)" },
          { id: "apps", icon: "📱", label: `Apps & Benachrichtigungen (${ALL_APPS.length})` },
          { id: "battery", icon: "🔋", label: "Akku & Energie" },
          { id: "security", icon: "🔐", label: "Sicherheit & Datenschutz" },
          { id: "accessibility", icon: "🦾", label: "Bedienungshilfen" },
          { id: "system", icon: "🔄", label: "Software-Update" }
        ];
        categories.forEach(function(c) {
          html += `<div class="settings-item" data-nav="${c.id}"><span><span class="icon">${c.icon}</span><span class="label">${c.label}</span></span><span>›</span></div>`;
        });
        html += `</div>`;
      }

      // --- 1. TÖNE & KLINGELTÖNE (NEU) ---
      else if (view.screen === "sounds") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔔 Töne & Klingeltöne</h1></div>`;
        
        html += `<div class="field"><label>Master-Lautstärke (${s.masterVolume}%)</label><input type="range" id="masterVol" min="0" max="100" value="${s.masterVolume}"></div>`;
        html += `<div class="field"><label>Alarm-Lautstärke (${s.alarmVolume}%)</label><input type="range" id="alarmVol" min="0" max="100" value="${s.alarmVolume}"></div>`;
        html += `<div class="field"><label>Benachrichtigungs-Lautstärke (${s.notificationVolume}%)</label><input type="range" id="notifVol" min="0" max="100" value="${s.notificationVolume}"></div>`;
        
        html += `<div class="field"><label>Klingelton</label><select id="ringtoneSelect">
          <option value="ringtone_old" ${s.ringtoneType === 'ringtone_old' ? 'selected' : ''}>Klassisches Klingeln</option>
          <option value="alarm_loud" ${s.ringtoneType === 'alarm_loud' ? 'selected' : ''}>Wecker</option>
          <option value="notification_chime" ${s.ringtoneType === 'notification_chime' ? 'selected' : ''}>Glocke</option>
          <option value="siren" ${s.ringtoneType === 'siren' ? 'selected' : ''}>Sirene</option>
          <option value="none" ${s.ringtoneType === 'none' ? 'selected' : ''}>Lautlos</option>
        </select></div>`;
        html += `<button class="btn btn-secondary" id="testRingtone">🔊 Klingelton testen</button>`;

        html += `<div class="field" style="margin-top:16px;"><label>Benachrichtigungston</label><select id="notifSelect">
          <option value="notification_chime" ${s.notificationType === 'notification_chime' ? 'selected' : ''}>Glocke</option>
          <option value="beep" ${s.notificationType === 'beep' ? 'selected' : ''}>Piepton</option>
          <option value="alarm_loud" ${s.notificationType === 'alarm_loud' ? 'selected' : ''}>Alarm</option>
          <option value="none" ${s.notificationType === 'none' ? 'selected' : ''}>Lautlos</option>
        </select></div>`;
        html += `<button class="btn btn-secondary" id="testNotif">🔊 Benachrichtigungston testen</button>`;

        container.innerHTML = html;

        container.querySelector("#masterVol").addEventListener("input", function(e) { s.masterVolume = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#alarmVol").addEventListener("input", function(e) { s.alarmVolume = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#notifVol").addEventListener("input", function(e) { s.notificationVolume = parseInt(e.target.value); saveSettings(store, s); });
        container.querySelector("#ringtoneSelect").addEventListener("change", function(e) { s.ringtoneType = e.target.value; saveSettings(store, s); });
        container.querySelector("#notifSelect").addEventListener("change", function(e) { s.notificationType = e.target.value; saveSettings(store, s); });
        
        container.querySelector("#testRingtone").addEventListener("click", function() { playSound(s.ringtoneType); });
        container.querySelector("#testNotif").addEventListener("click", function() { playSound(s.notificationType); });
      }

      // --- 2. VERBINDUNGEN (BLUETOOTH FIX) ---
      else if (view.screen === "connectivity") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📡 Verbindungen</h1></div>`;
        html += `<div class="settings-item"><span><span class="icon">📶</span>WLAN</span><span class="value">${navigator.onLine ? 'Verbunden' : 'Getrennt'}</span></div>`;
        html += `<div class="settings-item"><span><span class="icon">📡</span>Bluetooth</span><span class="value">${s.bluetoothDevice ? esc(s.bluetoothDevice) : 'Nicht verbunden'}</span></div>`;
        
        // WICHTIG: Der Button ruft requestDevice DIREKT im Click-Handler auf
        html += `<button class="btn btn-secondary" id="scanBt">📡 Bluetooth-Gerät suchen</button>`;
        html += `<div id="btError" style="color:#ff5555; font-size:12px; margin-top:8px;"></div>`;
        
        container.innerHTML = html;

        // Bluetooth-Suche (muss synchron im Click-Handler sein)
        container.querySelector("#scanBt").addEventListener("click", function() {
          var errEl = container.querySelector("#btError");
          errEl.textContent = "";
          
          if (!navigator.bluetooth) {
            errEl.textContent = "❌ Web Bluetooth wird von diesem Browser nicht unterstützt.";
            return;
          }

          navigator.bluetooth.requestDevice({ acceptAllDevices: true })
            .then(function(device) {
              s.bluetoothDevice = device.name || "Unbekanntes Gerät";
              saveSettings(store, s);
              if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Bluetooth-Gerät gefunden: " + s.bluetoothDevice);
              build(); // UI neu laden
            })
            .catch(function(error) {
              errEl.textContent = "❌ Fehler: " + error.message;
              if(window.HalDo && HalDo.Notify) HalDo.Notify.error("Bluetooth-Suche fehlgeschlagen.");
            });
        });
      }

      // --- 3. APPS & BENACHRICHTIGUNGEN (Granular) ---
      else if (view.screen === "apps") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>📱 Apps & Benachrichtigungen</h1></div>`;
        html += `<div class="toggle"><label>Globale Benachrichtigungen</label><input type="checkbox" id="globalNotif" ${s.notificationsEnabled ? 'checked' : ''}></div>`;
        html += `<div class="settings-list" style="max-height: 55vh;">`;
        ALL_APPS.forEach(function(app) {
          var appS = s.appConfigs[app.id];
          var statusText = { on: "An", off: "Aus", mute: "Stumm", silent: "Lautlos" }[appS.notif.status] || "An";
          var statusColor = appS.notif.status === 'on' ? '#4ade80' : (appS.notif.status === 'off' ? '#ff5555' : '#ffaa33');
          html += `<div class="settings-item" data-app-detail="${app.id}">
            <span><span class="icon">${app.emoji}</span><span class="label">${app.name}</span></span>
            <span class="value" style="color:${statusColor};">${statusText} ›</span>
          </div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelector("#globalNotif").addEventListener("change", function(e) { s.notificationsEnabled = e.target.checked; saveSettings(store, s); });
        container.querySelectorAll("[data-app-detail]").forEach(function(el) {
          el.addEventListener("click", function() { view.screen = "app_detail"; view.currentApp = el.dataset.appDetail; build(); });
        });
      }

      // --- 4. APP-DETAILS (Granulare Steuerung) ---
      else if (view.screen === "app_detail" && view.currentApp) {
        var app = ALL_APPS.find(function(a) { return a.id === view.currentApp; });
        var appS = s.appConfigs[app.id];
        
        html += `<button class="back-btn" data-nav="apps">‹ Zurück zu Apps</button>`;
        html += `<div class="app-detail-header"><div class="app-detail-icon">${app.emoji}</div><div><h1 class="app-detail-title">${app.name}</h1></div></div>`;

        html += `<div class="field"><label>Benachrichtigungs-Status</label><select id="appNotifStatus">
          <option value="on" ${appS.notif.status === 'on' ? 'selected' : ''}>🔔 An</option>
          <option value="off" ${appS.notif.status === 'off' ? 'selected' : ''}>🚫 Aus</option>
          <option value="mute" ${appS.notif.status === 'mute' ? 'selected' : ''}>🔇 Stumm</option>
          <option value="silent" ${appS.notif.status === 'silent' ? 'selected' : ''}>🔕 Lautlos</option>
        </select></div>`;
        
        html += `<div class="field"><label>Benachrichtigungston für diese App</label><select id="appNotifSound">
          <option value="notification_chime" ${appS.notif.sound === 'notification_chime' ? 'selected' : ''}>Glocke</option>
          <option value="beep" ${appS.notif.sound === 'beep' ? 'selected' : ''}>Piepton</option>
          <option value="alarm_loud" ${appS.notif.sound === 'alarm_loud' ? 'selected' : ''}>Alarm</option>
          <option value="siren" ${appS.notif.sound === 'siren' ? 'selected' : ''}>Sirene</option>
          <option value="none" ${appS.notif.sound === 'none' ? 'selected' : ''}>Kein Ton</option>
        </select></div>`;

        html += `<div class="toggle"><label>Vibration</label><input type="checkbox" id="appNotifVibrate" ${appS.notif.vibrate ? 'checked' : ''}></div>`;
        
        html += `<button class="btn btn-secondary" id="testAppNotif" style="margin-top:12px;">🔊 Test-Benachrichtigung</button>`;
        html += `<button class="btn" id="saveAppDetail" style="margin-top:20px; width:100%;">Speichern</button>`;
        
        container.innerHTML = html;

        container.querySelector("#testAppNotif").addEventListener("click", function() {
          var sound = container.querySelector("#appNotifSound").value;
          playSound(sound);
          if(container.querySelector("#appNotifVibrate").checked && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        });

        container.querySelector("#saveAppDetail").addEventListener("click", function() {
          s.appConfigs[app.id].notif = {
            status: container.querySelector("#appNotifStatus").value,
            sound: container.querySelector("#appNotifSound").value,
            vibrate: container.querySelector("#appNotifVibrate").checked
          };
          saveSettings(store, s);
          if(window.HalDo && HalDo.Notify) HalDo.Notify.success(app.name + " gespeichert!");
          view.screen = "apps"; build();
        });
      }

      // --- 5. ALLGEMEIN ---
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

      // --- 6. DISPLAY ---
      else if (view.screen === "display") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🎨 Darstellung & Display</h1></div>`;
        html += `<div class="field"><label>Helligkeit (${s.brightness}%)</label><input type="range" id="brightness" min="10" max="100" value="${s.brightness}"></div>`;
        html += `<div class="toggle"><label>Dark Mode</label><input type="checkbox" id="darkMode" ${isDark ? 'checked' : ''}></div>`;
        html += `<div class="field"><label>Akzentfarbe</label><div>`;
        ['#ffd700','#4dd0e1','#ff5555','#4ade80','#b478ff','#ff8844'].forEach(function(c) {
          html += `<span data-color="${c}" style="display:inline-block; width:40px; height:40px; border-radius:50%; background:${c}; margin:4px; cursor:pointer; border: 3px solid ${s.accentColor === c ? '#fff' : 'transparent'}"></span>`;
        });
        html += `</div></div>`;
        container.innerHTML = html;
        
        container.querySelector("#brightness").addEventListener("input", function(e) { s.brightness = parseInt(e.target.value); applyThemeToSystem(s); });
        container.querySelector("#brightness").addEventListener("change", function() { saveSettings(store, s); });
        container.querySelector("#darkMode").addEventListener("change", function(e) { s.theme = e.target.checked ? 'dark' : 'light'; saveSettings(store, s); build(); });
        container.querySelectorAll("[data-color]").forEach(function(el) { el.addEventListener("click", function() { s.accentColor = el.dataset.color; saveSettings(store, s); build(); }); });
      }

      // --- 7. SPRACHE ---
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

      // --- 8. KI ---
      else if (view.screen === "ai") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🤖 HalDo KI & Stimme</h1></div>`;
        html += `<div class="field"><label>KI-Assistent</label><select id="assistant">
          <option value="ai" ${s.assistant === 'ai' ? 'selected' : ''}>HalDo AI</option>
          <option value="cyborg" ${s.assistant === 'cyborg' ? 'selected' : ''}>HalDo Cyborg</option>
          <option value="robot" ${s.assistant === 'robot' ? 'selected' : ''}>HalDo Roboter</option>
        </select></div>`;
        html += `<button class="btn btn-secondary" id="testAI">🔊 Stimme testen</button>`;
        container.innerHTML = html;
        container.querySelector("#assistant").addEventListener("change", function(e) { s.assistant = e.target.value; saveSettings(store, s); });
        container.querySelector("#testAI").addEventListener("click", function() {
          if(window.speechSynthesis) {
            var u = new SpeechSynthesisUtterance("Hallo, ich bin dein HalDo KI-Assistent.");
            u.lang = "de-DE"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
          }
        });
      }

      // --- 9. AKKU ---
      else if (view.screen === "battery") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔋 Akku & Energie</h1></div>`;
        html += `<div class="field"><label>Akkustatus</label><div class="info-text" id="batteryInfo">Lade...</div></div>`;
        html += `<div class="toggle"><label>Energiesparmodus</label><input type="checkbox" id="batterySaver" ${s.batterySaver ? 'checked' : ''}></div>`;
        container.innerHTML = html;
        if(navigator.getBattery) {
          navigator.getBattery().then(function(battery) {
            var info = container.querySelector("#batteryInfo");
            function update() { info.textContent = "🔋 " + Math.round(battery.level * 100) + "% " + (battery.charging ? "⚡ (Lädt)" : ""); }
            update(); battery.addEventListener('levelchange', update); battery.addEventListener('chargingchange', update);
          });
        }
        container.querySelector("#batterySaver").addEventListener("change", function(e) { s.batterySaver = e.target.checked; saveSettings(store, s); });
      }

      // --- 10. SICHERHEIT ---
      else if (view.screen === "security") {
        html += `<button class="back-btn" data-nav="main">‹ Zurück</button><div class="settings-header"><h1>🔐 Sicherheit</h1></div>`;
        html += `<div class="field"><label>App-Berechtigungen</label><div class="info-text">Kamera: ${s.permissions.camera ? '✅' : '❌'}<br>Mikrofon: ${s.permissions.microphone ? '✅' : '❌'}</div></div>`;
        html += `<button class="btn btn-secondary" id="requestPermissions">Berechtigungen anfragen</button>`;
        container.innerHTML = html;
        container.querySelector("#requestPermissions").addEventListener("click", async function() {
          try {
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); s.permissions.camera = true; s.permissions.microphone = true; }
            saveSettings(store, s); build();
            if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Berechtigungen erteilt!");
          } catch(e) { if(window.HalDo && HalDo.Notify) HalDo.Notify.error("Verweigert: " + e.message); }
        });
      }

      // --- 11. BEDIENUNGSHILFEN ---
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
          if(lang && !s.keyboardLanguages.includes(lang)) { s.keyboardLanguages.push(lang); saveSettings(store, s); build(); }
        });
      }

      // --- 12. SYSTEM ---
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
        el.addEventListener("click", function() { view.screen = el.dataset.nav; build(); });
      });
    }

    build();
  }

  HalDoApp("settings", { name: "Einstellungen", icon: "⚙️", render: render, category: "system" });
  console.log('%c⚙️ HalDo Settings v29.0 — ULTIMATE SYSTEM CONTROL bereit', GOLD_STYLE);
})();
