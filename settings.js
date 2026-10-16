/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — EINSTELLUNGEN (v171)
   Alle Sektionen · Home-Stil · Avatar · Stimme · etc.
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  var VOICE_PRESETS = [
    { id: "mann",     name: "👨 Mann",         desc: "Tief, männlich",     rate: 0.9, pitch: 0.8 },
    { id: "frau",     name: "👩 Frau",         desc: "Klar, weiblich",     rate: 1.0, pitch: 1.2 },
    { id: "kind",     name: "🧒 Kind",         desc: "Jung, hoch",         rate: 1.1, pitch: 1.5 },
    { id: "senior",   name: "👴 Senior",       desc: "Älter, langsam",     rate: 0.8, pitch: 0.7 },
    { id: "ai",       name: "🤖 AI",           desc: "Neutral, digital",   rate: 1.0, pitch: 1.0 },
    { id: "ki",       name: "🧠 KI",           desc: "Klar, intelligent",  rate: 1.05, pitch: 1.1 },
    { id: "roboter",  name: "🦾 Roboter",      desc: "Metallisch, tief",   rate: 0.95, pitch: 0.6 },
    { id: "cyborg",   name: "⚡ Cyborg",       desc: "Sci-Fi Mix",         rate: 1.0, pitch: 1.3 },
    { id: "haldo",    name: "🦚 HalDo Voice",  desc: "Original HalDo",     rate: 1.0, pitch: 1.0 },
    { id: "eigene",   name: "🎙️ Eigene Stimme", desc: "Klon (demnächst)",   rate: 1.0, pitch: 1.0 }
  ];

  function render(container, ctx){
    var store = ctx.store;

    function build(){
      var allApps = HalDo.Apps.listInstalled();
      var allAppsAll = HalDo.Apps.listAll();
      var userName = HalDo.Store.get("userName", "Bruder");
      var userEmail = HalDo.Store.get("userEmail", "Halil@haldo.ai");
      var theme = window.HalDoTheme ? HalDoTheme.get() : "peacock";
      var lang = HalDo.Store.get("lang", "de");
      var voiceEnabled = HalDo.Store.get("voiceEnabled", true);
      var voicePreset = HalDo.Store.get("voicePreset", "haldo");
      var voiceRate = HalDo.Store.get("voiceRate", 1);
      var voicePitch = HalDo.Store.get("voicePitch", 1);
      var voiceVolume = HalDo.Store.get("voiceVolume", 1);
      var notifyEnabled = HalDo.Store.get("notifyEnabled", true);
      var soundEnabled = HalDo.Store.get("soundEnabled", true);
      var vibrateEnabled = HalDo.Store.get("vibrateEnabled", false);
      var brightness = HalDo.Store.get("displayBrightness", 100);
      var autoBright = HalDo.Store.get("autoBrightness", true);
      var wifi = HalDo.Store.get("wifi", true);
      var bluetooth = HalDo.Store.get("bluetooth", false);
      var carMode = HalDo.Store.get("carMode", false);
      var carplayMode = HalDo.Store.get("carplayMode", false);
      var privacyLevel = HalDo.Store.get("privacyLevel", "mittel");

      /* 🆕 HOME-STYLE + AVATAR */
      var homeStyle = HalDo.Store.get("homeStyle", "solar");
      var avatarVisible = HalDo.Store.get("avatarVisible", true);
      var avatarFloating = HalDo.Store.get("avatarFloating", true);
      var avatarMode = HalDo.Store.get("avatarMode", "human");

      var body = '';

      /* ═══════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
        + '<div style="font-size:22px;font-weight:900;color:var(--p1)">⚙️ Einstellungen</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
        + '<b>' + allApps.length + '</b> Apps installiert · v171'
        + '</div></div>';

      /* ═══════════════════════════════════════════════════════
         🆕 HOMESCREEN-STIL
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🏠 Homescreen-Stil</h3>'
        + '<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;line-height:1.6">'
        + 'Wähle, wie der Startbildschirm aussehen soll.'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
        + homeStyleCard("solar", "🌌", "Sonnensystem", "Planeten kreisen um Sonne", homeStyle)
        + homeStyleCard("dashboard", "📊", "Dashboard", "Klassisches Karten-Layout", homeStyle)
        + homeStyleCard("combined", "🎨", "Kombi", "Sonne oben + Dashboard", homeStyle)
        + homeStyleCard("grid", "📱", "Kacheln", "Einfache App-Kacheln", homeStyle)
        + '</div></div>';

      /* ═══════════════════════════════════════════════════════
         🆕 AVATAR-WIDGET
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🦚 Avatar-Widget</h3>'
        + toggleRow("Avatar anzeigen", "avatarVisibleSet", avatarVisible)
        + toggleRow("Schweben (Animation)", "avatarFloatingSet", avatarFloating)
        + '<div class="field" style="margin-top:10px"><label>Avatar-Modus</label>'
        + '<select id="avatarModeSel" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<option value="human"' + (avatarMode === "human" ? " selected" : "") + '>🧑 Human</option>'
        + '<option value="cyborg"' + (avatarMode === "cyborg" ? " selected" : "") + '>🤖 Cyborg</option>'
        + '<option value="hologram"' + (avatarMode === "hologram" ? " selected" : "") + '>✨ Hologram</option>'
        + '</select></div></div>';

      /* ═══════════════════════════════════════════════════════
         ACCOUNT
         ═══════════════════════════════════════════════════════ */
      body += section("👤 Account", [
        row("Name", userName, "text", "userName"),
        row("E-Mail", userEmail, "email", "userEmail")
      ]);

      /* ═══════════════════════════════════════════════════════
         ALLGEMEIN
         ═══════════════════════════════════════════════════════ */
      body += section("⚙️ Allgemein", [
        selectRow("🌍 Sprache", "lang", lang, [
          { v: "de", n: "🇩🇪 Deutsch" },
          { v: "en", n: "🇬🇧 English" },
          { v: "ku", n: "🦚 Kurdisch (Kurmanci)" },
          { v: "ckb", n: "🦚 Kurdisch (Sorani)" },
          { v: "ar", n: "🇸🇦 العربية" },
          { v: "tr", n: "🇹🇷 Türkçe" }
        ])
      ]);

      /* ═══════════════════════════════════════════════════════
         DISPLAY & HELLIGKEIT
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>☀️ Anzeige und Helligkeit</h3>'
        + sliderRow("Helligkeit", "displayBrightness", brightness, 20, 100, "%")
        + toggleRow("Automatische Helligkeit", "autoBrightness", autoBright)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         THEME
         ═══════════════════════════════════════════════════════ */
      var themeList = window.HalDoTheme ? HalDoTheme.list() : [];
      var themeGrid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
      themeList.forEach(function(tid){
        var t = HalDoTheme.themes[tid];
        var isAct = tid === theme;
        themeGrid += '<button type="button" data-set-theme="' + tid + '" style="padding:0;background:transparent;border:none;cursor:pointer;text-align:left">'
          + '<div style="padding:10px;background:linear-gradient(135deg,' + t.colors["--bg"] + ',' + t.colors["--bg-2"] + ');border-radius:12px;border:2px solid ' + (isAct ? t.colors["--p1"] : "rgba(255,255,255,.1)") + ';position:relative">'
          + '<div style="display:flex;gap:4px;margin-bottom:8px">'
          + '<div style="width:14px;height:14px;border-radius:50%;background:' + t.colors["--p1"] + '"></div>'
          + '<div style="width:14px;height:14px;border-radius:50%;background:' + t.colors["--p2"] + '"></div>'
          + '<div style="width:14px;height:14px;border-radius:50%;background:' + t.colors["--p3"] + '"></div>'
          + '</div>'
          + '<div style="font-size:11px;font-weight:900;color:' + t.colors["--text"] + '">' + _esc(t.name) + '</div>'
          + (isAct ? '<div style="position:absolute;top:6px;right:6px;font-size:12px">✅</div>' : '')
          + '</div></button>';
      });
      themeGrid += '</div>';

      body += '<div class="card"><h3>🎨 Theme</h3>'
        + '<div style="font-size:11px;color:var(--text-dim);margin-bottom:10px">Wähle dein Farbschema:</div>'
        + themeGrid
        + '<button class="btn sec full" id="openThemePanel" style="font-size:11px">🎨 Erweiterte Theme-Optionen</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         STIMME
         ═══════════════════════════════════════════════════════ */
      var voiceGrid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">';
      VOICE_PRESETS.forEach(function(v){
        var isAct = v.id === voicePreset;
        voiceGrid += '<button type="button" data-voice-preset="' + v.id + '" style="padding:10px;background:' + (isAct ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (isAct ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:left">'
          + '<div style="font-size:12px;font-weight:900;color:' + (isAct ? "var(--p1)" : "var(--text)") + '">' + v.name + '</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + v.desc + '</div>'
          + '</button>';
      });
      voiceGrid += '</div>';

      body += '<div class="card"><h3>🔊 Stimme</h3>'
        + toggleRow("Sprachausgabe aktiv", "voiceEnabled", voiceEnabled)
        + '<div style="font-size:11px;color:var(--text-dim);margin:14px 0 8px;font-weight:800">STIMMEN-PRESETS</div>'
        + voiceGrid
        + sliderRow("Geschwindigkeit", "voiceRate", voiceRate, 0.5, 2, "x", 0.1)
        + sliderRow("Tonhöhe", "voicePitch", voicePitch, 0.5, 2, "", 0.1)
        + sliderRow("Lautstärke", "voiceVolume", voiceVolume, 0, 1, "", 0.1)
        + '<button class="btn full" id="testVoice" style="margin-top:10px">🔊 Stimme testen</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         MITTEILUNGEN
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔔 Mitteilungen</h3>'
        + toggleRow("Benachrichtigungen", "notifyEnabled", notifyEnabled)
        + toggleRow("Mit Sound", "soundEnabled", soundEnabled)
        + toggleRow("Vibration (mobil)", "vibrateEnabled", vibrateEnabled)
        + '<button class="btn sec full" id="testNotify" style="margin-top:10px">🧪 Test-Benachrichtigung</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         WLAN
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>📶 WLAN</h3>'
        + toggleRow("WLAN aktiv", "wifi", wifi)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         BLUETOOTH
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔵 Bluetooth</h3>'
        + toggleRow("Bluetooth aktiv", "bluetooth", bluetooth)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         HALDO CAR / CARPLAY
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🚗 HalDo Car</h3>'
        + toggleRow("🚗 HalDo Car Modus", "carMode", carMode)
        + toggleRow("🍎 HalDo CarPlay", "carplayMode", carplayMode)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         SPEICHER
         ═══════════════════════════════════════════════════════ */
      var totalStorage = 0;
      var keys = Object.keys(localStorage).filter(function(k){
        return k.indexOf("haldo:") === 0;
      });
      keys.forEach(function(k){
        totalStorage += (localStorage.getItem(k) || "").length;
      });
      var sizeStr = totalStorage > 1024*1024
        ? (totalStorage/1024/1024).toFixed(2) + " MB"
        : (totalStorage/1024).toFixed(1) + " KB";

      body += '<div class="card"><h3>💾 Speicher</h3>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
        + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">EINTRÄGE</div>'
        + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + keys.length + '</div>'
        + '</div>'
        + '<div style="padding:12px;background:rgba(180,120,255,.1);border-radius:10px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">GRÖSSE</div>'
        + '<div style="font-size:20px;font-weight:900;color:var(--p3)">' + sizeStr + '</div>'
        + '</div></div>'
        + '<button class="btn full" id="exportData" style="margin-bottom:6px">📤 Daten exportieren (JSON)</button>'
        + '<button class="btn sec full" id="clearCache" style="margin-bottom:6px">🧹 Cache leeren</button>'
        + '<button class="btn danger full" id="clearAllData">🗑️ Alle Daten löschen</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         DATENSCHUTZ
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔒 Datenschutz</h3>'
        + selectRow("Datenschutz-Level", "privacyLevel", privacyLevel, [
          { v: "offen", n: "🟢 Offen (viele Features)" },
          { v: "mittel", n: "🟡 Mittel (Standard)" },
          { v: "streng", n: "🔴 Streng (nur nötigste)" }
        ])
        + toggleRow("Analytics aktiv", "analyticsEnabled", HalDo.Store.get("analyticsEnabled", true))
        + toggleRow("Standort teilen", "locationShare", HalDo.Store.get("locationShare", false))
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         BEDINGUNGEN
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>📋 Bedingungen & Lizenzen</h3>'
        + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.7">'
        + '<div style="padding:8px 0"><b>HalDo AI OS</b> — Version 171</div>'
        + '<div style="padding:8px 0">Lizenz: Persönliche Nutzung</div>'
        + '<div style="padding:8px 0">© 2026 HalDo AI</div>'
        + '</div></div>';

      /* ═══════════════════════════════════════════════════════
         HILFE
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>❓ Hilfe</h3>'
        + '<button class="btn sec full" style="margin-bottom:6px">📖 Benutzerhandbuch</button>'
        + '<button class="btn sec full" style="margin-bottom:6px">🎓 Tutorial starten</button>'
        + '<button class="btn sec full" style="margin-bottom:6px">💬 Feedback senden</button>'
        + '<button class="btn sec full">📧 Kontakt: support@haldo.ai</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         APP-VERWALTUNG
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>📱 App-Verwaltung (' + allApps.length + ')</h3>'
        + '<div style="max-height:300px;overflow-y:auto;padding-right:4px">';
      allApps.forEach(function(a){
        body += '<div style="padding:8px 10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
          + '<div style="font-size:12px;font-weight:800">' + _esc(a.icon) + ' ' + _esc(a.name) + '</div>'
          + '<div style="font-size:10px;color:#4ade80">✅ v171</div>'
          + '</div>';
      });
      body += '</div></div>';

      /* ═══════════════════════════════════════════════════════
         ÜBER
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card">'
        + '<div style="padding:24px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;border:1.5px solid var(--p1)">'
        + '<div style="font-size:64px">🦚</div>'
        + '<div style="font-size:22px;font-weight:900;color:var(--p1);margin-top:8px">HalDo AI OS</div>'
        + '<div style="font-size:14px;font-weight:800;color:var(--p3);margin-top:4px">v171</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px">Musik-Studio · Avatar · Homescreen</div>'
        + '</div></div>';

      container.innerHTML = body;

      /* ═══════════════════════════════════════════════════════
         EVENT-BINDINGS
         ═══════════════════════════════════════════════════════ */

      /* 🆕 Homescreen-Stil */
      container.querySelectorAll("[data-homestyle]").forEach(function(el){
        el.addEventListener("click", function(){
          var id = el.getAttribute("data-homestyle");
          HalDo.Store.set("homeStyle", id);
          if(HalDo.Notify) HalDo.Notify.success("Homescreen: " + id, { app: "settings" });
          build();
        });
      });

      /* 🆕 Avatar */
      var avVis = container.querySelector('[data-toggle="avatarVisibleSet"]');
      if(avVis) avVis.addEventListener("click", function(e){
        e.preventDefault();
        var cur = HalDo.Store.get("avatarVisible", true);
        HalDo.Store.set("avatarVisible", !cur);
        if(window.HalDoAvatar){
          if(!cur) HalDoAvatar.show();
          else HalDoAvatar.hide();
        }
        build();
      });

      var avFloat = container.querySelector('[data-toggle="avatarFloatingSet"]');
      if(avFloat) avFloat.addEventListener("click", function(e){
        e.preventDefault();
        var cur = HalDo.Store.get("avatarFloating", true);
        HalDo.Store.set("avatarFloating", !cur);
        if(window.HalDoAvatar) HalDoAvatar.setFloating(!cur);
        build();
      });

      var avMode = container.querySelector("#avatarModeSel");
      if(avMode) avMode.addEventListener("change", function(){
        if(window.HalDoAvatar) HalDoAvatar.setMode(this.value);
        if(HalDo.Notify) HalDo.Notify.success("Avatar: " + this.value, { app: "settings" });
      });

      /* Standard-Toggles */
      container.querySelectorAll("[data-toggle]").forEach(function(el){
        el.addEventListener("click", function(e){
          e.preventDefault();
          var key = el.getAttribute("data-toggle");
          /* Home + Avatar sind schon abgedeckt, skip */
          if(key === "avatarVisibleSet" || key === "avatarFloatingSet") return;
          var cur = HalDo.Store.get(key, false);
          HalDo.Store.set(key, !cur);
          build();
        });
      });

      /* Inputs */
      container.querySelectorAll("[data-input]").forEach(function(el){
        el.addEventListener("change", function(){
          var key = el.getAttribute("data-input");
          HalDo.Store.set(key, el.value);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert", { app: "settings" });
        });
      });

      /* Selects */
      container.querySelectorAll("[data-select]").forEach(function(el){
        el.addEventListener("change", function(){
          var key = el.getAttribute("data-select");
          HalDo.Store.set(key, el.value);
          if(key === "lang" && window.HalDo.i18n){
            HalDo.i18n.setLang(el.value);
          }
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert: " + el.value, { app: "settings" });
        });
      });

      /* Slider */
      container.querySelectorAll("[data-slider]").forEach(function(el){
        el.addEventListener("input", function(){
          var key = el.getAttribute("data-slider");
          var val = parseFloat(el.value);
          HalDo.Store.set(key, val);
          var lbl = container.querySelector('[data-slider-label="' + key + '"]');
          if(lbl) lbl.textContent = val + (el.getAttribute("data-unit") || "");
        });
      });

      /* Theme */
      container.querySelectorAll("[data-set-theme]").forEach(function(el){
        el.addEventListener("click", function(e){
          e.preventDefault();
          var tid = el.getAttribute("data-set-theme");
          if(window.HalDoTheme){
            HalDoTheme.setAuto(false);
            HalDoTheme.apply(tid);
            if(HalDo.Notify) HalDo.Notify.success("Theme: " + tid, { app: "settings" });
            build();
          }
        });
      });

      /* Stimmen-Presets */
      container.querySelectorAll("[data-voice-preset]").forEach(function(el){
        el.addEventListener("click", function(){
          var vid = el.getAttribute("data-voice-preset");
          HalDo.Store.set("voicePreset", vid);
          var preset = VOICE_PRESETS.find(function(v){ return v.id === vid; });
          if(preset){
            HalDo.Store.set("voiceRate", preset.rate);
            HalDo.Store.set("voicePitch", preset.pitch);
          }
          if(HalDo.Notify) HalDo.Notify.success("Stimme: " + (preset ? preset.name : vid), { app: "settings" });
          build();
        });
      });

      /* Test-Stimme */
      var tv = container.querySelector("#testVoice");
      if(tv) tv.addEventListener("click", function(){
        if(HalDo.Voice){
          var preset = VOICE_PRESETS.find(function(v){ return v.id === voicePreset; }) || VOICE_PRESETS[0];
          HalDo.Voice.speak("Hallo Bruder! Ich bin " + preset.name + ". So klinge ich.");
        }
      });

      /* Test-Notify */
      var tn = container.querySelector("#testNotify");
      if(tn) tn.addEventListener("click", function(){
        if(HalDo.Notify) HalDo.Notify.info("Test-Benachrichtigung ✅", { app: "settings" });
        if(HalDo.Store.get("vibrateEnabled", false) && navigator.vibrate) navigator.vibrate(200);
      });

      /* Export */
      var exp = container.querySelector("#exportData");
      if(exp) exp.addEventListener("click", function(){
        var data = {};
        Object.keys(localStorage).forEach(function(k){
          if(k.indexOf("haldo:") === 0) data[k] = localStorage.getItem(k);
        });
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "haldo-backup-" + new Date().toISOString().split("T")[0] + ".json";
        a.click();
        if(HalDo.Notify) HalDo.Notify.success("Backup erstellt", { app: "settings" });
      });

      /* Cache */
      var cc = container.querySelector("#clearCache");
      if(cc) cc.addEventListener("click", function(){
        if(!confirm("Cache leeren?")) return;
        if("caches" in window){
          caches.keys().then(function(names){
            names.forEach(function(n){ caches.delete(n); });
          });
        }
        if(HalDo.Notify) HalDo.Notify.success("Cache geleert", { app: "settings" });
      });

      /* Clear All */
      var ca = container.querySelector("#clearAllData");
      if(ca) ca.addEventListener("click", function(){
        if(!confirm("ALLE Daten löschen? Nicht rückgängig machbar!")) return;
        if(!confirm("WIRKLICH ALLES löschen?")) return;
        var keys2 = Object.keys(localStorage).filter(function(k){
          return k.indexOf("haldo:") === 0;
        });
        keys2.forEach(function(k){ localStorage.removeItem(k); });
        alert("Alle Daten gelöscht. Seite neu laden (F5).");
      });

      /* Theme-Panel */
      var tp = container.querySelector("#openThemePanel");
      if(tp) tp.addEventListener("click", function(){
        if(window.HalDoTheme) HalDoTheme.open();
      });
    }

    /* ═══════════════════════════════════════════════════════════
       HELPER
       ═══════════════════════════════════════════════════════════ */
    function section(title, rows){
      return '<div class="card"><h3>' + _esc(title) + '</h3>' + rows.join("") + '</div>';
    }

    function row(label, value, type, key){
      return '<div class="field">'
        + '<label>' + _esc(label) + '</label>'
        + '<input type="' + type + '" value="' + _esc(value) + '" data-input="' + _esc(key) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '</div>';
    }

    function toggleRow(label, key, on){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:12.5px;font-weight:800">' + _esc(label) + '</div>'
        + '<button type="button" data-toggle="' + _esc(key) + '" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (on ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (on ? "#000" : "var(--text-dim)") + '">' + (on ? "AN" : "AUS") + '</button>'
        + '</div>';
    }

    function selectRow(label, key, value, options){
      var opts = options.map(function(o){
        return '<option value="' + _esc(o.v) + '"' + (o.v === value ? " selected" : "") + '>' + _esc(o.n) + '</option>';
      }).join("");
      return '<div class="field">'
        + '<label>' + _esc(label) + '</label>'
        + '<select data-select="' + _esc(key) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">' + opts + '</select>'
        + '</div>';
    }

    function sliderRow(label, key, value, min, max, unit, step){
      return '<div class="field">'
        + '<label style="display:flex;justify-content:space-between">'
        + '<span>' + _esc(label) + '</span>'
        + '<span data-slider-label="' + _esc(key) + '" style="color:var(--p1);font-weight:900">' + value + (unit || "") + '</span>'
        + '</label>'
        + '<input type="range" data-slider="' + _esc(key) + '" data-unit="' + (unit || "") + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" value="' + value + '" style="width:100%">'
        + '</div>';
    }

    function homeStyleCard(id, icon, title, desc, current){
      var sel = current === id;
      return '<button type="button" data-homestyle="' + id + '" style="padding:12px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:12px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;position:relative">'
        + '<div style="font-size:26px;margin-bottom:4px">' + icon + '</div>'
        + '<div style="font-size:12px;font-weight:900;color:' + (sel ? "var(--p1)" : "var(--text)") + '">' + title + '</div>'
        + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + desc + '</div>'
        + (sel ? '<div style="position:absolute;top:8px;right:8px;font-size:11px">✅</div>' : '')
        + '</button>';
    }

    build();
  }

  HalDoApp("settings", { name: "Einstellungen", icon: "⚙️", render: render, category: "system" });
  console.log("🦚 settings.js v171 geladen — Homescreen + Avatar");
})();
