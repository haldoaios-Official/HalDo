/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DESKTOP (v150)
   Launcher · Topbar · BottomBar · Sidebar · Hint
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Desktop = (function(){
  "use strict";

  /* ─────────── Topbar-Aktionen ─────────── */
  function initTopbar(){
    var logoBtn = document.getElementById("logoBtn");
    var sidebarBtn = document.getElementById("sidebarBtn");
    var voiceBtn = document.getElementById("voiceBtn");
    var themeToggle = document.getElementById("themeToggle");
    var settingsBtn = document.getElementById("settingsBtn");

    if(logoBtn){
      logoBtn.addEventListener("click", function(){
        if(window.HalDo.Router) HalDo.Router.open("chat");
      });
    }
    if(sidebarBtn){
      sidebarBtn.addEventListener("click", function(){
        if(window.HalDo.Display) HalDo.Display.toggleSidebar();
        renderSidebar();
      });
    }
    if(voiceBtn){
      voiceBtn.addEventListener("click", function(){
        if(window.HalDo.Voice && HalDo.Voice.openPanel) HalDo.Voice.openPanel();
      });
    }
    if(themeToggle){
      themeToggle.addEventListener("click", function(){
        var themes = ["kosmos", "erde", "holo"];
        var cur = (window.HalDo.Display) ? HalDo.Display.current().theme : "kosmos";
        var i = themes.indexOf(cur);
        var next = themes[(i + 1) % themes.length];
        if(window.HalDo.Display) HalDo.Display.applyTheme(next);
        if(window.HalDo.Config) HalDo.Config.set("theme", next);
        _toast("🎨 " + next, "ok");
      });
    }
    if(settingsBtn){
      settingsBtn.addEventListener("click", function(){
        _openSettings();
      });
    }
  }

  /* ─────────── BottomBar ─────────── */
  function initBottomBar(){
    var bbChat = document.getElementById("bbChat");
    var bbVoice = document.getElementById("bbVoice");
    var bbCyborg = document.getElementById("bbCyborg");

    if(bbChat){
      bbChat.addEventListener("click", function(){
        if(window.HalDo.Router) HalDo.Router.open("chat");
      });
    }
    if(bbVoice){
      bbVoice.addEventListener("click", function(){
        if(window.HalDo.Voice && HalDo.Voice.openPanel) HalDo.Voice.openPanel();
      });
    }
    if(bbCyborg){
      bbCyborg.addEventListener("click", function(){
        if(window.HalDo.Display){
          var on = HalDo.Display.toggleCyborg();
          if(window.HalDo.Config) HalDo.Config.set("cyborg", on);
          _toast(on ? "⚡ CYBORG aktiv" : "🎨 Normal", "ok");
        }
      });
    }
  }

  /* ─────────── Sidebar rendern ─────────── */
  function renderSidebar(){
    var sb = document.getElementById("sidebar");
    if(!sb) return;
    if(!window.HalDo.Registry) return;

    var grouped = HalDo.Registry.groupedByCategory();
    var catOrder = HalDo.Registry.categoryList();
    var html = '<div class="group">Hauptmenü</div>'
      + '<button class="item" id="sbSettings"><span class="ico">⚙️</span><span class="lbl">Einstellungen</span></button>'
      + '<button class="item" id="sbVoice"><span class="ico">🔊</span><span class="lbl">HalDoVoice</span></button>'
      + '<button class="item" id="sbAbout"><span class="ico">ℹ️</span><span class="lbl">Über HalDo</span></button>'
      + '<hr class="sep">';

    catOrder.forEach(function(cat){
      var apps = grouped[cat.id] || [];
      if(!apps.length) return;
      html += '<div class="group">' + _esc(cat.label) + '</div>';
      apps.forEach(function(a){
        html += '<button class="item" data-open-app="' + a.id + '">'
          + '<span class="ico">' + a.ico + '</span>'
          + '<span class="lbl">' + _esc(a.name)
          +   '<div class="sub">' + _esc(a.desc) + '</div>'
          + '</span>'
          + '</button>';
      });
    });

    sb.innerHTML = html;

    /* Events */
    sb.querySelectorAll("[data-open-app]").forEach(function(b){
      b.addEventListener("click", function(){
        if(window.HalDo.Router) HalDo.Router.open(b.dataset.openApp);
        if(window.innerWidth < 700 && window.HalDo.Display){
          HalDo.Display.setSidebarOpen(false);
        }
      });
    });

    var sbSet = document.getElementById("sbSettings");
    if(sbSet) sbSet.addEventListener("click", function(){
      _openSettings();
      if(window.HalDo.Display) HalDo.Display.setSidebarOpen(false);
    });
    var sbVoice = document.getElementById("sbVoice");
    if(sbVoice) sbVoice.addEventListener("click", function(){
      if(window.HalDo.Voice && HalDo.Voice.openPanel) HalDo.Voice.openPanel();
      if(window.HalDo.Display) HalDo.Display.setSidebarOpen(false);
    });
    var sbAbout = document.getElementById("sbAbout");
    if(sbAbout) sbAbout.addEventListener("click", function(){
      _toast("🦚 HalDo AI OS v150 — von Bruder für Bruder", "ok");
    });
  }

  /* ─────────── Einstellungen Dialog ─────────── */
  function _openSettings(){
    var modal = document.getElementById("settings");
    var body = document.getElementById("settingsBody");
    if(!modal || !body) return;

    var cfg = window.HalDo.Config.get();

    body.innerHTML =
      '<div class="group"><h3>🌌 Hintergrund</h3>'
      + '<div class="theme-grid">'
      + '<div class="theme-card' + (cfg.theme==="kosmos"?" active":"") + '" data-theme="kosmos"><div class="preview kosmos"></div><div class="name">🌌 Kosmos</div></div>'
      + '<div class="theme-card' + (cfg.theme==="erde"?" active":"") + '" data-theme="erde"><div class="preview erde"></div><div class="name">🌍 Erde</div></div>'
      + '<div class="theme-card' + (cfg.theme==="holo"?" active":"") + '" data-theme="holo"><div class="preview holo"></div><div class="name">🔵 Holo</div></div>'
      + '</div>'
      + '<div class="speed-row"><span>🐌</span><input type="range" id="globalSpeed" min="1" max="10" value="' + (cfg.planetSpeed||5) + '"><span class="sv" id="speedVal">' + (cfg.planetSpeed||5) + '×</span><span>🐇</span></div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:4px;text-align:center">🐌 1 = langsam · 5 = mittel · 🐇 10 = schnell</div>'
      + '<div class="row" style="margin-top:8px"><div class="lbl">🕐 Uhr-Planeten</div><div class="sw' + (cfg.clockOn?" on":"") + '" id="clockSw"></div></div>'
      + '</div>'
      + '<div class="group"><h3>🌐 Sprache</h3><div class="lang-grid" id="langGrid"></div></div>'
      + '<div class="group"><h3>⚡ CYBORG</h3><div class="row"><div class="lbl">Cyborg-Modus <small>Pink / Violett</small></div><div class="sw' + (cfg.cyborg?" on":"") + '" id="cyborgSw"></div></div></div>'
      + '<div class="group"><h3>👤 Profil</h3><div class="row"><div class="lbl">Dein Name</div><input type="text" id="userNameInput" value="' + _esc(cfg.userName||"Bruder") + '"></div></div>'
      + '<div class="group"><h3>💾 Daten</h3>'
      + '<button class="btn sec full" id="expBtn">📤 Backup exportieren</button>'
      + '<button class="btn danger full" id="resetBtn" style="margin-top:8px">🗑️ Alles zurücksetzen</button>'
      + '</div>';

    /* Sprache-Grid mit Fallback */
    var langGrid = document.getElementById("langGrid");
    if(langGrid){
      var LANGS = {
        de:{name:"Deutsch",flag:"🇩🇪"}, ku:{name:"Kurdî",flag:"🟨"}, ez:{name:"Êzidî",flag:"🦚"}, ar:{name:"العربية",flag:"🇸🇦"},
        tr:{name:"Türkçe",flag:"🇹🇷"}, en:{name:"English",flag:"🇬🇧"}, fa:{name:"فارسی",flag:"🇮🇷"}, ru:{name:"Русский",flag:"🇷🇺"},
        fr:{name:"Français",flag:"🇫🇷"}, es:{name:"Español",flag:"🇪🇸"}
      };
      var lhtml = "";
      Object.keys(LANGS).forEach(function(k){
        lhtml += '<div class="lang-card' + (cfg.lang===k?" active":"") + '" data-lang="' + k + '">'
          + '<span class="flag">' + LANGS[k].flag + '</span>'
          + '<div class="name">' + _esc(LANGS[k].name) + '</div>'
          + '</div>';
      });
      langGrid.innerHTML = lhtml;
      langGrid.querySelectorAll("[data-lang]").forEach(function(el){
        el.addEventListener("click", function(){
          HalDo.Config.set("lang", el.dataset.lang);
          langGrid.querySelectorAll("[data-lang]").forEach(function(x){ x.classList.remove("active"); });
          el.classList.add("active");
          _toast("🌐 Sprache geändert", "ok");
        });
      });
    }

    body.querySelectorAll("[data-theme]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Config.set("theme", el.dataset.theme);
        if(window.HalDo.Display) HalDo.Display.applyTheme(el.dataset.theme);
        body.querySelectorAll("[data-theme]").forEach(function(x){ x.classList.remove("active"); });
        el.classList.add("active");
        _toast("🎨 " + el.dataset.theme, "ok");
      });
    });

    var gs = document.getElementById("globalSpeed");
    if(gs) gs.addEventListener("input", function(){
      var v = parseInt(this.value);
      HalDo.Config.set("planetSpeed", v);
      var sv = document.getElementById("speedVal");
      if(sv) sv.textContent = v + "×";
    });

    var csw = document.getElementById("cyborgSw");
    if(csw) csw.addEventListener("click", function(){
      var on = !HalDo.Config.get("cyborg");
      HalDo.Config.set("cyborg", on);
      csw.classList.toggle("on", on);
      if(window.HalDo.Display) HalDo.Display.applyCyborg(on);
    });

    var clk = document.getElementById("clockSw");
    if(clk) clk.addEventListener("click", function(){
      var on = !HalDo.Config.get("clockOn");
      HalDo.Config.set("clockOn", on);
      clk.classList.toggle("on", on);
    });

    var ui = document.getElementById("userNameInput");
    if(ui) ui.addEventListener("input", function(){
      HalDo.Config.set("userName", this.value);
    });

    var exp = document.getElementById("expBtn");
    if(exp) exp.addEventListener("click", function(){
      var data = HalDo.Config.exportAll();
      var blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "haldo_backup.json";
      a.click();
      _toast("📤 Backup exportiert", "ok");
    });

    var rbt = document.getElementById("resetBtn");
    if(rbt) rbt.addEventListener("click", function(){
      if(!confirm("Wirklich ALLES zurücksetzen?")) return;
      HalDo.Config.reset();
      if(window.HalDo.Storage) HalDo.Storage.clearAll();
      location.reload();
    });

    modal.classList.add("show");
  }

  /* ─────────── Modals schließen ─────────── */
  function initModalCloses(){
    var closes = [
      ["settingsClose", "settings"],
      ["appSetClose", "appSettings"],
      ["voicePanelClose", "voicePanel"],
      ["aiWindowClose", "aiWindow"]
    ];
    closes.forEach(function(pair){
      var btn = document.getElementById(pair[0]);
      if(btn){
        btn.addEventListener("click", function(){
          var m = document.getElementById(pair[1]);
          if(m) m.classList.remove("show");
        });
      }
    });
    document.querySelectorAll(".modal").forEach(function(m){
      m.addEventListener("click", function(e){
        if(e.target === m) m.classList.remove("show");
      });
    });
  }

  /* ─────────── Hilfsfunktionen ─────────── */
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

  /* ─────────── Init ─────────── */
  function init(){
    initTopbar();
    initBottomBar();
    initModalCloses();
    renderSidebar();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Desktop bereit");
  }

  return {
    init: init,
    renderSidebar: renderSidebar
  };
})();

console.log("🦚 desktop.js geladen");
