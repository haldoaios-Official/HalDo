/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DESKTOP (v150d)
   Menü-Button FIX · Sidebar ohne Drag-Konflikt
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Desktop = (function(){
  "use strict";

  var _sidebarBound = false;

  function initTopbar(){
    var logoBtn = document.getElementById("logoBtn");
    var sidebarBtn = document.getElementById("sidebarBtn");
    var voiceBtn = document.getElementById("voiceBtn");
    var themeToggle = document.getElementById("themeToggle");
    var settingsBtn = document.getElementById("settingsBtn");

    if(logoBtn) logoBtn.addEventListener("click", function(){
      if(window.HalDo.Router) HalDo.Router.open("chat");
    });

    /* ═══ MENÜ-BUTTON — Klarer Klick-Handler ═══ */
    if(sidebarBtn){
      sidebarBtn.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();
        var sb = document.getElementById("sidebar");
        if(!sb) return;
        var isOpen = sb.classList.contains("open");
        if(!isOpen){
          /* Beim Öffnen Sidebar neu rendern */
          renderSidebar();
          sb.classList.add("open");
        } else {
          sb.classList.remove("open");
        }
      };
    }

    if(voiceBtn) voiceBtn.addEventListener("click", function(){
      if(window.HalDo.Voice && HalDo.Voice.openPanel) HalDo.Voice.openPanel();
    });
    if(themeToggle) themeToggle.addEventListener("click", function(){
      var themes = ["kosmos", "erde", "holo"];
      var cur = (window.HalDo.Display) ? HalDo.Display.current().theme : "kosmos";
      var i = themes.indexOf(cur);
      var next = themes[(i + 1) % themes.length];
      if(window.HalDo.Display) HalDo.Display.applyTheme(next);
      if(window.HalDo.Config) HalDo.Config.set("theme", next);
      _toast("🎨 " + next, "ok");
    });
    if(settingsBtn) settingsBtn.addEventListener("click", function(){ _openSettings(); });
  }

  function initBottomBar(){
    var bbChat = document.getElementById("bbChat");
    var bbVoice = document.getElementById("bbVoice");
    var bbCyborg = document.getElementById("bbCyborg");

    if(bbChat) bbChat.addEventListener("click", function(){
      if(window.HalDo.Router) HalDo.Router.open("chat");
    });
    if(bbVoice) bbVoice.addEventListener("click", function(){
      if(window.HalDo.Voice && HalDo.Voice.openPanel) HalDo.Voice.openPanel();
    });
    if(bbCyborg) bbCyborg.addEventListener("click", function(){
      if(window.HalDo.Display){
        var on = HalDo.Display.toggleCyborg();
        if(window.HalDo.Config) HalDo.Config.set("cyborg", on);
        _toast(on ? "⚡ CYBORG aktiv" : "🎨 Normal", "ok");
      }
    });
  }

  function renderSidebar(){
    var sb = document.getElementById("sidebar");
    if(!sb) return;
    if(!window.HalDo.Registry) return;

    var allApps = HalDo.Registry.all().slice().sort(function(a, b){
      return a.name.localeCompare(b.name, "de");
    });

    /* Notify-Master-Status */
    var notifyOff = window.HalDo.Notify && !HalDo.Notify.get().master;

    var html = '<div class="group">⚙️ System-Menü</div>';
    html += '<button class="item" data-sys="chat"><span class="ico">💬</span><span class="lbl">Chat öffnen</span></button>';
    html += '<button class="item" data-sys="haldoai"><span class="ico">🦚</span><span class="lbl">HalDo AI</span></button>';
    html += '<button class="item" data-sys="settings"><span class="ico">⚙️</span><span class="lbl">Einstellungen</span></button>';
    html += '<button class="item" data-sys="voice"><span class="ico">🔊</span><span class="lbl">HalDoVoice</span></button>';
    html += '<button class="item" data-sys="notify"><span class="ico">🔔</span><span class="lbl">Benachrichtigungen <div class="sub">' + (notifyOff ? "⏸ deaktiviert" : "✅ aktiv") + '</div></span></button>';
    html += '<button class="item" data-sys="backup"><span class="ico">💾</span><span class="lbl">Backup</span></button>';
    html += '<button class="item" data-sys="about"><span class="ico">ℹ️</span><span class="lbl">Über HalDo</span></button>';
    html += '<hr class="sep">';
    html += '<div class="group">📱 Apps A–Z (' + allApps.length + ')</div>';

    allApps.forEach(function(a){
      html += '<button class="item" data-open-app="' + a.id + '">'
        + '<span class="ico">' + a.ico + '</span>'
        + '<span class="lbl">' + _esc(a.name)
        + '<div class="sub">' + _esc(a.desc) + '</div>'
        + '</span></button>';
    });

    sb.innerHTML = html;

    /* ═══ App-Buttons — einfacher Klick ohne Drag-Konflikt ═══ */
    sb.querySelectorAll("[data-open-app]").forEach(function(b){
      b.addEventListener("click", function(e){
        e.preventDefault();
        var appId = b.dataset.openApp;
        /* Sidebar schließen */
        sb.classList.remove("open");
        /* App öffnen */
        setTimeout(function(){
          if(window.HalDo.Router){
            HalDo.Router.open(appId).catch(function(err){
              console.error("[Sidebar] App-Fehler:", err);
            });
          }
        }, 100);
      });
    });

    /* ═══ System-Buttons ═══ */
    sb.querySelectorAll("[data-sys]").forEach(function(b){
      b.addEventListener("click", function(e){
        e.preventDefault();
        var sys = b.dataset.sys;
        sb.classList.remove("open");
        setTimeout(function(){
          if(sys === "chat" && window.HalDo.Router) HalDo.Router.open("chat");
          else if(sys === "haldoai" && window.HalDo.Router) HalDo.Router.open("haldoai");
          else if(sys === "settings") _openSettings();
          else if(sys === "voice" && window.HalDo.Voice) HalDo.Voice.openPanel();
          else if(sys === "notify") _openNotifySettings();
          else if(sys === "backup") _doBackup();
          else if(sys === "about") _toast("🦚 HalDo AI OS v150 — von Bruder für Bruder", "ok");
        }, 100);
      });
    });
  }

  /* ═══ Notify-Settings Dialog ═══ */
  function _openNotifySettings(){
    if(!window.HalDo.Notify){ _toast("Notify nicht verfügbar", "err"); return; }
    var n = HalDo.Notify.get();
    var modal = document.getElementById("settings");
    var body = document.getElementById("settingsBody");
    var head = modal.querySelector("h2");
    if(head) head.textContent = "🔔 Benachrichtigungen";
    var catNames = { blitzer:"📷 Blitzer", stau:"🚗 Stau", unfall:"🚨 Unfall", baustelle:"👷 Baustelle", sperrung:"🚧 Sperrung", warnung:"⚠️ Warnung", info:"ℹ️ Info" };
    var html = '<div class="group"><h3>Global</h3>'
      + '<div class="row"><div class="lbl">Haupt-Schalter</div><div class="sw' + (n.master?" on":"") + '" data-nset="master"></div></div>'
      + '<div class="row"><div class="lbl">🔊 Piepton</div><div class="sw' + (n.beep?" on":"") + '" data-nset="beep"></div></div>'
      + '<div class="row"><div class="lbl">🎙️ Sprachansage</div><div class="sw' + (n.voice?" on":"") + '" data-nset="voice"></div></div>'
      + '<div class="row"><div class="lbl">💬 System-Popup <small>Auch außerhalb der App</small></div><div class="sw' + (n.system?" on":"") + '" data-nset="system"></div></div>'
      + '<div class="row"><div class="lbl">📳 Vibration</div><div class="sw' + (n.vibrate?" on":"") + '" data-nset="vibrate"></div></div>'
      + '<button class="btn sec full" id="nPerm" style="margin-top:10px">🔔 System-Popup erlauben</button>'
      + '<button class="btn full" id="nTest" style="margin-top:6px">🎵 Alle Beeps testen</button>'
      + '</div>';
    html += '<div class="group"><h3>Kategorien</h3>';
    Object.keys(catNames).forEach(function(k){
      var c = n.cats[k] || {};
      html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px">'
        + '<div style="font-size:12px;font-weight:900;color:var(--p1);margin-bottom:6px">' + catNames[k] + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'
        + '<div style="text-align:center"><div style="font-size:9px;color:var(--text-mute);margin-bottom:4px">🔊</div><div class="sw' + (c.beep?" on":"") + '" data-ncat="' + k + '" data-nkey="beep" style="margin:0 auto"></div></div>'
        + '<div style="text-align:center"><div style="font-size:9px;color:var(--text-mute);margin-bottom:4px">🎙️</div><div class="sw' + (c.voice?" on":"") + '" data-ncat="' + k + '" data-nkey="voice" style="margin:0 auto"></div></div>'
        + '<div style="text-align:center"><div style="font-size:9px;color:var(--text-mute);margin-bottom:4px">💬</div><div class="sw' + (c.system?" on":"") + '" data-ncat="' + k + '" data-nkey="system" style="margin:0 auto"></div></div>'
        + '</div></div>';
    });
    html += '</div>';
    body.innerHTML = html;

    body.querySelectorAll("[data-nset]").forEach(function(el){
      el.addEventListener("click", function(){
        var k = el.dataset.nset;
        var n2 = HalDo.Notify.get();
        HalDo.Notify.set(k, !n2[k]);
        el.classList.toggle("on");
      });
    });
    body.querySelectorAll("[data-ncat]").forEach(function(el){
      el.addEventListener("click", function(){
        var c = el.dataset.ncat, k = el.dataset.nkey;
        var n2 = HalDo.Notify.get();
        var v = !(n2.cats[c] && n2.cats[c][k]);
        HalDo.Notify.setCat(c, k, v);
        el.classList.toggle("on", v);
      });
    });
    var np = body.querySelector("#nPerm");
    if(np) np.addEventListener("click", function(){
      HalDo.Notify.requestPermission().then(function(p){ alert("Ergebnis: " + p); });
    });
    var nt = body.querySelector("#nTest");
    if(nt) nt.addEventListener("click", function(){ HalDo.Notify.testAll(); });

    modal.classList.add("show");
  }

  function _doBackup(){
    try {
      var data = HalDo.Config.exportAll();
      if(window.HalDo.Storage){
        data._storage = {};
        HalDo.Storage.namespaces().forEach(function(ns){
          data._storage[ns] = HalDo.Storage.exportNamespace(ns);
        });
      }
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "haldo_backup_" + new Date().toISOString().split("T")[0] + ".json";
      a.click();
      _toast("💾 Backup erstellt", "ok");
    } catch(e){
      _toast("❌ Backup fehlgeschlagen", "err");
    }
  }

  function _openSettings(){
    var modal = document.getElementById("settings");
    var body = document.getElementById("settingsBody");
    if(!modal || !body) return;
    var head = modal.querySelector("h2");
    if(head) head.textContent = "Allgemeine Einstellungen";
    var cfg = window.HalDo.Config.get();
    var LANG_LIST = (window.HalDo.Language) ? HalDo.Language.list() : [];
    var langHTML = LANG_LIST.map(function(l){
      return '<div class="lang-card' + (cfg.lang===l.id?" active":"") + '" data-lang="' + l.id + '"><span class="flag">' + l.flag + '</span><div class="name">' + _esc(l.name) + '</div></div>';
    }).join("");

    body.innerHTML = '<div class="group"><h3>🌌 Hintergrund</h3><div class="theme-grid">'
      + '<div class="theme-card' + (cfg.theme==="kosmos"?" active":"") + '" data-theme="kosmos"><div class="preview kosmos"></div><div class="name">🌌 Kosmos</div></div>'
      + '<div class="theme-card' + (cfg.theme==="erde"?" active":"") + '" data-theme="erde"><div class="preview erde"></div><div class="name">🌍 Erde</div></div>'
      + '<div class="theme-card' + (cfg.theme==="holo"?" active":"") + '" data-theme="holo"><div class="preview holo"></div><div class="name">🔵 Holo</div></div></div>'
      + '<div class="speed-row"><span>🐌</span><input type="range" id="globalSpeed" min="1" max="10" value="' + (cfg.planetSpeed||5) + '"><span class="sv" id="speedVal">' + (cfg.planetSpeed||5) + '×</span><span>🐇</span></div>'
      + '<div class="row" style="margin-top:8px"><div class="lbl">🕐 Uhr-Planeten</div><div class="sw' + (cfg.clockOn?" on":"") + '" id="clockSw"></div></div></div>'
      + '<div class="group"><h3>🌐 Sprache (' + LANG_LIST.length + ')</h3><div class="lang-grid">' + langHTML + '</div></div>'
      + '<div class="group"><h3>⚡ CYBORG</h3><div class="row"><div class="lbl">Cyborg-Modus</div><div class="sw' + (cfg.cyborg?" on":"") + '" id="cyborgSw"></div></div></div>'
      + '<div class="group"><h3>👤 Profil</h3><div class="row"><div class="lbl">Dein Name</div><input type="text" id="userNameInput" value="' + _esc(cfg.userName||"Bruder") + '"></div></div>'
      + '<div class="group"><h3>🔔 Benachrichtigungen</h3><button class="btn full" id="openNotify">🔔 Benachrichtigungen verwalten</button></div>'
      + '<div class="group"><h3>🎙️ HalDoVoice</h3><button class="btn full" id="openVoicePanel">🔊 HalDoVoice öffnen</button></div>'
      + '<div class="group"><h3>🚦 API-Keys</h3>'
      + '<div class="field"><label>OpenRouteService</label><input type="password" id="orsInput" placeholder="Key" value="' + _esc(HalDo.Config.get("orsKey","")) + '" autocomplete="new-password" name="ors"></div>'
      + '<div class="field"><label>Tankerkönig</label><input type="password" id="tankerInput" placeholder="Key" value="' + _esc(HalDo.Config.get("tankerKey","")) + '" autocomplete="new-password" name="tanker"></div>'
      + '<button class="btn sec full" id="vkSave">💾 Keys speichern</button></div>'
      + '<div class="group"><h3>💾 Daten</h3><button class="btn sec full" id="expBtn">📤 Backup</button><button class="btn danger full" id="resetBtn" style="margin-top:8px">🗑️ Alles zurücksetzen</button></div>';

    body.querySelectorAll("[data-theme]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Config.set("theme", el.dataset.theme);
        if(window.HalDo.Display) HalDo.Display.applyTheme(el.dataset.theme);
        if(window.HalDo.CosmicWorld) HalDo.CosmicWorld.setTheme(el.dataset.theme);
        body.querySelectorAll("[data-theme]").forEach(function(x){ x.classList.remove("active"); });
        el.classList.add("active");
      });
    });
    body.querySelectorAll("[data-lang]").forEach(function(el){
      el.addEventListener("click", function(){
        if(window.HalDo.Language){
          HalDo.Language.set(el.dataset.lang);
          body.querySelectorAll("[data-lang]").forEach(function(x){ x.classList.remove("active"); });
          el.classList.add("active");
          _toast("🌐 " + HalDo.Language.LANGS[el.dataset.lang].name, "ok");
        }
      });
    });
    var gs = document.getElementById("globalSpeed");
    if(gs) gs.addEventListener("input", function(){
      var v = parseInt(this.value);
      HalDo.Config.set("planetSpeed", v);
      var sv = document.getElementById("speedVal"); if(sv) sv.textContent = v + "×";
      if(window.HalDo.CosmicWorld) HalDo.CosmicWorld.setTheme(null, v, null);
    });
    var cs = document.getElementById("cyborgSw");
    if(cs) cs.addEventListener("click", function(){
      var on = !HalDo.Config.get("cyborg");
      HalDo.Config.set("cyborg", on);
      cs.classList.toggle("on", on);
      if(window.HalDo.Display) HalDo.Display.applyCyborg(on);
    });
    var clk = document.getElementById("clockSw");
    if(clk) clk.addEventListener("click", function(){
      var on = !HalDo.Config.get("clockOn");
      HalDo.Config.set("clockOn", on);
      clk.classList.toggle("on", on);
      if(window.HalDo.CosmicWorld) HalDo.CosmicWorld.setTheme(null, null, on);
    });
    var ui = document.getElementById("userNameInput");
    if(ui) ui.addEventListener("input", function(){ HalDo.Config.set("userName", this.value); });
    var on = document.getElementById("openNotify");
    if(on) on.addEventListener("click", function(){ _openNotifySettings(); });
    var ov = document.getElementById("openVoicePanel");
    if(ov) ov.addEventListener("click", function(){
      modal.classList.remove("show");
      if(window.HalDo.Voice) HalDo.Voice.openPanel();
    });
    var vk = document.getElementById("vkSave");
    if(vk) vk.addEventListener("click", function(){
      HalDo.Config.set("orsKey", document.getElementById("orsInput").value.trim());
      HalDo.Config.set("tankerKey", document.getElementById("tankerInput").value.trim());
      _toast("💾 Keys gespeichert", "ok");
    });
    var eb = document.getElementById("expBtn");
    if(eb) eb.addEventListener("click", _doBackup);
    var rb = document.getElementById("resetBtn");
    if(rb) rb.addEventListener("click", function(){
      if(!confirm("Wirklich ALLES zurücksetzen?")) return;
      HalDo.Config.reset();
      if(window.HalDo.Storage) HalDo.Storage.clearAll();
      location.reload();
    });

    modal.classList.add("show");
  }

  function initModalCloses(){
    var pairs = [
      ["settingsClose", "settings"],
      ["appSetClose", "appSettings"],
      ["voicePanelClose", "voicePanel"]
    ];
    pairs.forEach(function(p){
      var btn = document.getElementById(p[0]);
      if(btn) btn.addEventListener("click", function(){
        var m = document.getElementById(p[1]);
        if(m) m.classList.remove("show");
      });
    });
    document.querySelectorAll(".modal").forEach(function(m){
      m.addEventListener("click", function(e){ if(e.target === m) m.classList.remove("show"); });
    });
  }

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function _toast(msg, type){
    var t = document.getElementById("toast");
    if(!t) return;
    t.textContent = msg;
    t.className = "show" + (type ? " " + type : "");
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.className = ""; }, 2400);
  }

  function init(){
    initTopbar();
    initBottomBar();
    initModalCloses();
    renderSidebar();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Desktop bereit (Sidebar: " + HalDo.Registry.count() + " Apps)");
  }

  return { init: init, renderSidebar: renderSidebar };
})();

console.log("🦚 desktop.js geladen (v150d Sidebar-Fix)");
