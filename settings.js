/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SETTINGS APP (v151)
   Allgemein · Theme · Stimme · Benachrichtigung · Daten · Über
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "allgemein");

    function build(){
      var body = "";

      /* ═══════════════════════════════════════════════════════
         ALLGEMEIN
         ═══════════════════════════════════════════════════════ */
      if(tab === "allgemein"){
        var name = store.get("userName", "Bruder");
        var lang = store.get("lang", "de");
        var voiceOn = store.get("voiceEnabled", true);
        var notifOn = store.get("notifyEnabled", true);
        var soundOn = store.get("soundEnabled", true);

        body = '<div class="card"><h3>👤 Profil</h3>'
          + '<div class="field"><label>Dein Name</label>'
          + '<input type="text" id="setName" value="' + _esc(name) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '</div></div>';

        body += '<div class="card"><h3>🌍 Sprache</h3>'
          + '<div class="field"><label>Bevorzugte Sprache</label>'
          + '<select id="setLang" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<option value="de"' + (lang==="de"?" selected":"") + '>🇩🇪 Deutsch</option>'
          + '<option value="en"' + (lang==="en"?" selected":"") + '>🇬🇧 English</option>'
          + '<option value="tr"' + (lang==="tr"?" selected":"") + '>🇹🇷 Türkçe</option>'
          + '<option value="ar"' + (lang==="ar"?" selected":"") + '>🇸🇦 العربية</option>'
          + '</select></div></div>';

        body += '<div class="card"><h3>⚡ Schnell-Toggles</h3>'
          + toggleRow("voiceEnabled", "🔊 Sprachausgabe", voiceOn)
          + toggleRow("notifyEnabled", "🔔 Benachrichtigungen", notifOn)
          + toggleRow("soundEnabled", "🎵 Sound-Effekte", soundOn)
          + '</div>';
      }

      /* ═══════════════════════════════════════════════════════
         THEME — VOLL INTEGRIERT
         ═══════════════════════════════════════════════════════ */
      else if(tab === "theme"){
        var themeEngine = window.HalDoTheme;
        var currentTheme = themeEngine ? themeEngine.get() : "peacock";
        var themes = themeEngine ? themeEngine.themes : {};
        var autoOn = themeEngine ? themeEngine.isAuto() : false;

        /* Header */
        body = '<div class="card"><h3>🎨 Theme</h3>'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.6;margin-bottom:14px">'
          + 'Wähle dein bevorzugtes Erscheinungsbild. Änderungen sind sofort sichtbar.'
          + '</div>';

        /* Auto-Switch Block */
        body += '<div style="padding:14px;background:' + (autoOn ? "rgba(74,222,128,.1)" : "rgba(0,0,0,.2)") + ';border-radius:12px;margin-bottom:14px;border-left:3px solid ' + (autoOn ? "#4ade80" : "var(--text-mute)") + '">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<div>'
          + '<div style="font-size:13px;font-weight:900">🌗 Auto-Switch nach Uhrzeit</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:3px">Hell (06-20 Uhr) · Dunkel (20-06 Uhr)</div>'
          + '</div>'
          + '<button id="themeAutoBtn" style="padding:8px 16px;border:none;border-radius:10px;font-weight:900;cursor:pointer;font-size:11px;background:' + (autoOn ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (autoOn ? "#000" : "var(--text-dim)") + '">'
          + (autoOn ? "AN" : "AUS")
          + '</button></div></div>';

        /* Theme-Grid */
        body += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Verfügbare Themes (' + Object.keys(themes).length + ')</div>';
        body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px">';
        Object.keys(themes).forEach(function(id){
          var t = themes[id];
          var isActive = id === currentTheme && !autoOn;
          var c = t.colors;
          body += '<button data-set-theme="' + id + '" style="padding:0;background:transparent;border:none;cursor:pointer;text-align:left">'
            + '<div style="padding:10px;background:linear-gradient(135deg,' + c["--bg"] + ',' + c["--bg-2"] + ');border-radius:12px;border:2px solid ' + (isActive ? c["--p1"] : "rgba(255,255,255,.1)") + ';position:relative">'
            + '<div style="display:flex;gap:4px;margin-bottom:8px">'
            + '<div style="width:14px;height:14px;border-radius:50%;background:' + c["--p1"] + ';box-shadow:0 0 8px ' + c["--p1"] + '"></div>'
            + '<div style="width:14px;height:14px;border-radius:50%;background:' + c["--p2"] + '"></div>'
            + '<div style="width:14px;height:14px;border-radius:50%;background:' + c["--p3"] + '"></div>'
            + '</div>'
            + '<div style="font-size:11px;font-weight:900;color:' + c["--text"] + '">' + _esc(t.name) + '</div>'
            + '<div style="font-size:9px;color:' + c["--text-mute"] + ';margin-top:2px">' + _esc(t.desc) + '</div>'
            + (isActive ? '<div style="position:absolute;top:6px;right:6px;font-size:12px">✅</div>' : '')
            + '</div></button>';
        });
        body += '</div>';

        /* Custom Akzent */
        body += '<div style="padding-top:14px;border-top:1px solid rgba(255,255,255,.08);margin-bottom:14px">'
          + '<div style="font-size:11px;font-weight:900;color:var(--text);margin-bottom:8px">🎨 Eigene Akzentfarbe</div>'
          + '<div style="display:flex;gap:8px">'
          + '<input type="color" id="setAccent" value="' + (document.documentElement.style.getPropertyValue("--p1") || "#00e5ff") + '" style="width:60px;height:44px;border:1px solid var(--border-soft);border-radius:10px;background:transparent;cursor:pointer">'
          + '<button class="btn" id="setAccentBtn" style="flex:1">Akzent anwenden</button>'
          + '<button class="btn sec" id="setAccentReset" style="padding:12px 16px">Reset</button>'
          + '</div></div>';
        body += '</div>';

        /* App-spezifische Themes */
        body += '<div class="card"><h3>🎭 App-spezifische Themes</h3>'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.6;margin-bottom:14px">'
          + 'Gib einzelnen Apps eine eigene Farbe. Beim Öffnen der App wird automatisch gewechselt.'
          + '</div>';

        var apps = (window.HalDo && HalDo.Apps && HalDo.Apps.list) ? HalDo.Apps.list() : [];
        var appThemes = themeEngine ? themeEngine.getAppThemes() : {};

        if(!apps.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:11px">Keine Apps registriert</div>';
        } else {
          apps.forEach(function(app){
            var appId = app.id || app.name;
            var appName = app.name || appId;
            var appIcon = app.icon || "📦";
            var currentAppTheme = appThemes[appId] || "";

            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px">'
              + '<div style="font-size:20px">' + _esc(appIcon) + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12px;font-weight:800;color:var(--p1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(appName) + '</div>'
              + '</div>'
              + '<select data-apptheme="' + _esc(appId) + '" style="padding:6px 8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:11px;cursor:pointer;max-width:130px">'
              + '<option value="">— Standard —</option>';
            Object.keys(themes).forEach(function(tid){
              body += '<option value="' + tid + '"' + (currentAppTheme === tid ? " selected" : "") + '>' + _esc(themes[tid].name) + '</option>';
            });
            body += '</select></div>';
          });
        }
        body += '</div>';
      }

      /* ═══════════════════════════════════════════════════════
         STIMME
         ═══════════════════════════════════════════════════════ */
      else if(tab === "stimme"){
        var voiceRate = store.get("voiceRate", 1);
        var voicePitch = store.get("voicePitch", 1);
        var voiceVolume = store.get("voiceVolume", 1);

        body = '<div class="card"><h3>🔊 Stimme</h3>'
          + '<div class="field"><label>Geschwindigkeit: <b id="rateVal">' + voiceRate + '</b></label>'
          + '<input type="range" id="setRate" min="0.5" max="2" step="0.1" value="' + voiceRate + '" style="width:100%"></div>'
          + '<div class="field"><label>Tonhöhe: <b id="pitchVal">' + voicePitch + '</b></label>'
          + '<input type="range" id="setPitch" min="0.5" max="2" step="0.1" value="' + voicePitch + '" style="width:100%"></div>'
          + '<div class="field"><label>Lautstärke: <b id="volVal">' + voiceVolume + '</b></label>'
          + '<input type="range" id="setVol" min="0" max="1" step="0.1" value="' + voiceVolume + '" style="width:100%"></div>'
          + '<button class="btn full" id="testVoice" style="margin-top:10px">🔊 Test-Stimme</button>'
          + '</div>';
      }

      /* ═══════════════════════════════════════════════════════
         BENACHRICHTIGUNGEN
         ═══════════════════════════════════════════════════════ */
      else if(tab === "notify"){
        var notifOn = store.get("notifyEnabled", true);
        var soundOn = store.get("soundEnabled", true);
        var vibOn = store.get("vibrateEnabled", false);

        body = '<div class="card"><h3>🔔 Benachrichtigungen</h3>'
          + toggleRow("notifyEnabled", "🔔 In-App Benachrichtigungen", notifOn)
          + toggleRow("soundEnabled", "🎵 Mit Sound", soundOn)
          + toggleRow("vibrateEnabled", "📳 Vibration (mobil)", vibOn)
          + '<button class="btn full" id="testNotify" style="margin-top:12px">🧪 Test-Benachrichtigung</button>'
          + '</div>';
      }

      /* ═══════════════════════════════════════════════════════
         DATEN
         ═══════════════════════════════════════════════════════ */
      else if(tab === "daten"){
        var keys = Object.keys(localStorage).filter(function(k){
          return k.indexOf("haldo") === 0 || k.indexOf("HalDo") === 0;
        });
        var size = 0;
        keys.forEach(function(k){ size += (localStorage.getItem(k) || "").length; });

        body = '<div class="card"><h3>💾 Daten</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
          + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">EINTRÄGE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + keys.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(180,120,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">GRÖSSE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p3)">' + (size > 1024 ? (size/1024).toFixed(1) + "KB" : size + "B") + '</div>'
          + '</div></div>'
          + '<div style="display:flex;flex-direction:column;gap:8px">'
          + '<button class="btn full" id="goBackup">💾 Backup öffnen</button>'
          + '<button class="btn sec full" id="goRecovery">🚑 Recovery öffnen</button>'
          + '</div></div>';
      }

      /* ═══════════════════════════════════════════════════════
         ÜBER
         ═══════════════════════════════════════════════════════ */
      else if(tab === "ueber"){
        body = '<div class="card">'
          + '<div style="padding:24px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;border:1.5px solid var(--p1)">'
          + '<div style="font-size:64px">🦚</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p1);margin-top:8px">HalDo AI OS</div>'
          + '<div style="font-size:14px;font-weight:800;color:var(--p3);margin-top:4px">v151</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px">Alles auf einmal · 8 Themes</div>'
          + '</div>'
          + '<button class="btn full" id="openThemePanel" style="margin-top:14px">🎨 Theme-Panel öffnen</button>'
          + '<button class="btn sec full" id="openSystem" style="margin-top:8px">🖥️ System-Center</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="allgemein"?" active":"") + '" data-st="allgemein">⚙️ Allgemein</button>'
        + '<button class="tab' + (tab==="theme"?" active":"") + '" data-st="theme">🎨 Theme</button>'
        + '<button class="tab' + (tab==="stimme"?" active":"") + '" data-st="stimme">🔊 Stimme</button>'
        + '<button class="tab' + (tab==="notify"?" active":"") + '" data-st="notify">🔔 Benachrichtigung</button>'
        + '<button class="tab' + (tab==="daten"?" active":"") + '" data-st="daten">💾 Daten</button>'
        + '<button class="tab' + (tab==="ueber"?" active":"") + '" data-st="ueber">ℹ️ Über</button>'
        + '</div>' + body;

      /* Tab-Wechsel */
      container.querySelectorAll("[data-st]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.st;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ ALLGEMEIN Events ═══ */
      if(tab === "allgemein"){
        var nameInp = container.querySelector("#setName");
        if(nameInp) nameInp.addEventListener("change", function(){
          store.set("userName", this.value.trim() || "Bruder");
          if(window.HalDo.Notify) HalDo.Notify.success("Name gespeichert", { app: "settings" });
        });

        var langSel = container.querySelector("#setLang");
        if(langSel) langSel.addEventListener("change", function(){
          store.set("lang", this.value);
          if(window.HalDo.Notify) HalDo.Notify.success("Sprache: " + this.value, { app: "settings" });
        });

        /* Toggles */
        ["voiceEnabled", "notifyEnabled", "soundEnabled"].forEach(function(key){
          var el = container.querySelector('[data-toggle="' + key + '"]');
          if(!el) return;
          el.addEventListener("click", function(){
            var cur = store.get(key, true);
            store.set(key, !cur);
            build();
          });
        });
      }

      /* ═══ THEME Events ═══ */
      if(tab === "theme"){
        var themeEngine = window.HalDoTheme;

        /* Theme-Auswahl */
        container.querySelectorAll("[data-set-theme]").forEach(function(btn){
          btn.addEventListener("click", function(){
            var id = btn.dataset.setTheme;
            if(themeEngine){
              themeEngine.setAuto(false);
              themeEngine.apply(id);
              if(window.HalDo.Voice) HalDo.Voice.speak(themeEngine.themes[id].name.replace(/[^\w\sÄÖÜäöü]/g, "").trim() + " aktiviert");
              if(window.HalDo.Notify) HalDo.Notify.success("Theme: " + themeEngine.themes[id].name, { app: "settings" });
            }
            build();
          });
        });

        /* Auto-Switch Toggle */
        var autoBtn = container.querySelector("#themeAutoBtn");
        if(autoBtn) autoBtn.addEventListener("click", function(){
          if(!themeEngine) return;
          var newState = !themeEngine.isAuto();
          themeEngine.setAuto(newState);
          if(window.HalDo.Notify) HalDo.Notify.info(newState ? "Auto-Switch AN" : "Auto-Switch AUS", { app: "settings" });
          build();
        });

        /* Custom Akzent */
        var acBtn = container.querySelector("#setAccentBtn");
        if(acBtn) acBtn.addEventListener("click", function(){
          var col = container.querySelector("#setAccent").value;
          if(themeEngine) themeEngine.setAccent(col);
          if(window.HalDo.Notify) HalDo.Notify.success("Akzent: " + col, { app: "settings" });
        });

        var acRst = container.querySelector("#setAccentReset");
        if(acRst) acRst.addEventListener("click", function(){
          if(themeEngine) themeEngine.resetAccent();
          if(window.HalDo.Notify) HalDo.Notify.info("Akzent zurückgesetzt", { app: "settings" });
          build();
        });

        /* App-Themes */
        container.querySelectorAll("[data-apptheme]").forEach(function(sel){
          sel.addEventListener("change", function(){
            var appId = sel.dataset.apptheme;
            var themeId = sel.value || null;
            if(themeEngine) themeEngine.setAppTheme(appId, themeId);
            if(window.HalDo.Notify){
              HalDo.Notify.success(themeId
                ? "Theme für " + appId + ": " + themeEngine.themes[themeId].name
                : "Theme für " + appId + " zurückgesetzt",
                { app: "settings" }
              );
            }
          });
        });
      }

      /* ═══ STIMME Events ═══ */
      if(tab === "stimme"){
        var rate = container.querySelector("#setRate");
        var pitch = container.querySelector("#setPitch");
        var vol = container.querySelector("#setVol");

        if(rate) rate.addEventListener("input", function(){
          store.set("voiceRate", parseFloat(this.value));
          container.querySelector("#rateVal").textContent = this.value;
        });
        if(pitch) pitch.addEventListener("input", function(){
          store.set("voicePitch", parseFloat(this.value));
          container.querySelector("#pitchVal").textContent = this.value;
        });
        if(vol) vol.addEventListener("input", function(){
          store.set("voiceVolume", parseFloat(this.value));
          container.querySelector("#volVal").textContent = this.value;
        });

        var tv = container.querySelector("#testVoice");
        if(tv) tv.addEventListener("click", function(){
          if(window.HalDo.Voice) HalDo.Voice.speak("Hallo Bruder! So klinge ich.");
        });
      }

      /* ═══ NOTIFY Events ═══ */
      if(tab === "notify"){
        ["notifyEnabled", "soundEnabled", "vibrateEnabled"].forEach(function(key){
          var el = container.querySelector('[data-toggle="' + key + '"]');
          if(!el) return;
          el.addEventListener("click", function(){
            var cur = store.get(key, key === "vibrateEnabled" ? false : true);
            store.set(key, !cur);
            build();
          });
        });

        var tn = container.querySelector("#testNotify");
        if(tn) tn.addEventListener("click", function(){
          if(window.HalDo.Notify) HalDo.Notify.info("Test-Benachrichtigung ✓", { app: "settings" });
          if(store.get("vibrateEnabled", false) && navigator.vibrate) navigator.vibrate(200);
        });
      }

      /* ═══ DATEN Events ═══ */
      if(tab === "daten"){
        var gb = container.querySelector("#goBackup");
        if(gb) gb.addEventListener("click", function(){
          if(window.HalDo.Apps && HalDo.Apps.open) HalDo.Apps.open("backup");
        });
        var gr = container.querySelector("#goRecovery");
        if(gr) gr.addEventListener("click", function(){
          if(window.HalDo.Apps && HalDo.Apps.open) HalDo.Apps.open("recovery");
        });
      }

      /* ═══ ÜBER Events ═══ */
      if(tab === "ueber"){
        var tp = container.querySelector("#openThemePanel");
        if(tp) tp.addEventListener("click", function(){
          if(window.HalDoTheme) HalDoTheme.open();
        });
        var sc = container.querySelector("#openSystem");
        if(sc) sc.addEventListener("click", function(){
          if(window.HalDo.Apps && HalDo.Apps.open) HalDo.Apps.open("system-center");
        });
      }
    }

    /* Helper: Toggle-Zeile */
    function toggleRow(key, label, on){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:12.5px;font-weight:800">' + _esc(label) + '</div>'
        + '<button data-toggle="' + key + '" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (on ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (on ? "#000" : "var(--text-dim)") + '">'
        + (on ? "AN" : "AUS") + '</button>'
        + '</div>';
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("settings", { render: render });
  else console.warn("settings.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 settings.js geladen");
