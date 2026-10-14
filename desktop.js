/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DESKTOP (v150c)
   Menü links · Sidebar mit Drag&Drop-Sortierung
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Desktop = (function(){
  "use strict";

  function initTopbar(){
    var logoBtn = document.getElementById("logoBtn");
    var sidebarBtn = document.getElementById("sidebarBtn");
    var voiceBtn = document.getElementById("voiceBtn");
    var themeToggle = document.getElementById("themeToggle");
    var settingsBtn = document.getElementById("settingsBtn");

    if(logoBtn) logoBtn.addEventListener("click", function(){
      if(window.HalDo.Router) HalDo.Router.open("chat");
    });
    if(sidebarBtn) sidebarBtn.addEventListener("click", function(){
      var sb = document.getElementById("sidebar");
      if(!sb) return;
      var willOpen = !sb.classList.contains("open");
      renderSidebar();
      sb.classList.toggle("open", willOpen);
    });
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

  /* ═══ SIDEBAR mit Drag&Drop ═══ */
  function renderSidebar(){
    var sb = document.getElementById("sidebar");
    if(!sb) return;
    if(!window.HalDo.Registry) return;

    var appOrder = HalDo.Config.get("appOrder", null);
    var allApps = HalDo.Registry.all().slice();

    /* Wenn User eine eigene Reihenfolge gespeichert hat, nutze diese */
    if(appOrder && Array.isArray(appOrder)){
      var ordered = [];
      appOrder.forEach(function(id){
        var a = allApps.find(function(x){ return x.id === id; });
        if(a) ordered.push(a);
      });
      allApps.forEach(function(a){
        if(ordered.indexOf(a) < 0) ordered.push(a);
      });
      allApps = ordered;
    } else {
      allApps.sort(function(a, b){ return a.name.localeCompare(b.name, "de"); });
    }

    var html = '<div class="group">⚙️ System-Menü</div>';
    html += '<button class="item" id="sbChat"><span class="ico">💬</span><span class="lbl">Chat öffnen</span></button>';
    html += '<button class="item" id="sbHaldoAI"><span class="ico">🦚</span><span class="lbl">HalDo AI</span></button>';
    html += '<button class="item" id="sbSettings"><span class="ico">⚙️</span><span class="lbl">Einstellungen</span></button>';
    html += '<button class="item" id="sbVoice"><span class="ico">🔊</span><span class="lbl">HalDoVoice</span></button>';
    html += '<button class="item" id="sbBackup"><span class="ico">💾</span><span class="lbl">Backup</span></button>';
    html += '<button class="item" id="sbAbout"><span class="ico">ℹ️</span><span class="lbl">Über HalDo</span></button>';
    html += '<hr class="sep">';
    html += '<div class="group">📱 Apps A–Z (' + allApps.length + ') · ziehen zum Sortieren</div>';

    allApps.forEach(function(a){
      html += '<button class="item" draggable="true" data-app-id="' + a.id + '" data-open-app="' + a.id + '">'
        + '<span class="drag-handle">⋮⋮</span>'
        + '<span class="ico">' + a.ico + '</span>'
        + '<span class="lbl">' + _esc(a.name)
        + '<div class="sub">' + _esc(a.desc) + '</div>'
        + '</span></button>';
    });

    sb.innerHTML = html;

    /* Klick-Events */
    sb.querySelectorAll("[data-open-app]").forEach(function(b){
      b.addEventListener("click", function(e){
        /* Wenn gerade gedraggt wurde, nicht öffnen */
        if(sb._dragging) return;
        if(window.HalDo.Router) HalDo.Router.open(b.dataset.openApp);
        if(window.innerWidth < 700 && window.HalDo.Display){
          HalDo.Display.setSidebarOpen(false);
        }
      });
    });

    /* Drag&Drop für Sortierung */
    _setupDragDrop(sb);

    var sbChat = document.getElementById("sbChat");
    if(sbChat) sbChat.addEventListener("click", function(){
      if(window.HalDo.Router) HalDo.Router.open("chat");
      if(window.HalDo.Display) HalDo.Display.setSidebarOpen(false);
    });
    var sbAI = document.getElementById("sbHaldoAI");
    if(sbAI) sbAI.addEventListener("click", function(){
      if(window.HalDo.Router) HalDo.Router.open("haldoai");
      if(window.HalDo.Display) HalDo.Display.setSidebarOpen(false);
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
    var sbBackup = document.getElementById("sbBackup");
    if(sbBackup) sbBackup.addEventListener("click", function(){
      _doBackup();
      if(window.HalDo.Display) HalDo.Display.setSidebarOpen(false);
    });
    var sbAbout = document.getElementById("sbAbout");
    if(sbAbout) sbAbout.addEventListener("click", function(){
      _toast("🦚 HalDo AI OS v150 — von Bruder für Bruder", "ok");
    });
  }

  /* ═══ Drag&Drop Logik ═══ */
  function _setupDragDrop(sb){
    var dragEl = null;

    sb.querySelectorAll("[data-app-id]").forEach(function(el){
      el.addEventListener("dragstart", function(e){
        dragEl = el;
        sb._dragging = true;
        el.classList.add("dragging");
        try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", el.dataset.appId); } catch(err){}
      });
      el.addEventListener("dragend", function(){
        el.classList.remove("dragging");
        sb.querySelectorAll("[data-app-id]").forEach(function(x){ x.classList.remove("drag-over"); });
        setTimeout(function(){ sb._dragging = false; }, 100);
      });
      el.addEventListener("dragover", function(e){
        if(!dragEl || dragEl === el) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        el.classList.add("drag-over");
      });
      el.addEventListener("dragleave", function(){
        el.classList.remove("drag-over");
      });
      el.addEventListener("drop", function(e){
        e.preventDefault();
        el.classList.remove("drag-over");
        if(!dragEl || dragEl === el) return;
        /* Elemente tauschen */
        var parent = sb;
        var items = Array.from(sb.querySelectorAll("[data-app-id]"));
        var dragIdx = items.indexOf(dragEl);
        var dropIdx = items.indexOf(el);
        if(dragIdx < 0 || dropIdx < 0) return;
        if(dragIdx < dropIdx){
          parent.insertBefore(dragEl, el.nextSibling);
        } else {
          parent.insertBefore(dragEl, el);
        }
        _saveOrder();
      });
    });

    /* Touch-Support für Drag (vereinfacht) */
    sb.querySelectorAll("[data-app-id] .drag-handle").forEach(function(handle){
      handle.addEventListener("touchstart", function(e){
        var el = handle.parentNode;
        el.setAttribute("data-touch-drag", "1");
        el.classList.add("dragging");
        sb._dragging = true;
      }, {passive: true});
    });
  }

  function _saveOrder(){
    var sb = document.getElementById("sidebar");
    if(!sb) return;
    var order = [];
    sb.querySelectorAll("[data-app-id]").forEach(function(el){
      order.push(el.dataset.appId);
    });
    if(window.HalDo.Config) HalDo.Config.set("appOrder", order);
    _toast("✅ Reihenfolge gespeichert", "ok");
  }

  /* ═══ Backup ═══ */
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

  /* ═══ Einstellungen ═══ */
  function _openSettings(){
    var modal = document.getElementById("settings");
    var body = document.getElementById("settingsBody");
    if(!modal || !body) return;
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
      + '<div class="group"><h3>⚡ CYBORG</h3><div class="row"><div class="lbl">Cyborg-Modus <small>Pink / Violett</small></div><div class="sw' + (cfg.cyborg?" on":"") + '" id="cyborgSw"></div></div></div>'
      + '<div class="group"><h3>👤 Profil</h3><div class="row"><div class="lbl">Dein Name</div><input type="text" id="userNameInput" value="' + _esc(cfg.userName||"Bruder") + '"></div></div>'
      + '<div class="group"><h3>🎙️ HalDoVoice</h3><button class="btn full" id="openVoicePanel">🔊 HalDoVoice öffnen</button></div>'
      + '<div class="group"><h3>🚦 API-Keys</h3>'
      + '<div class="field"><label>OpenRouteService Key</label><input type="password" id="orsInput" placeholder="Key" value="' + _esc(HalDo.Config.get("orsKey","")) + '" autocomplete="new-password" name="ors"></div>'
      + '<div class="field"><label>Tankerkönig Key</label><input type="password" id="tankerInput" placeholder="Key" value="' + _esc(HalDo.Config.get("tankerKey","")) + '" autocomplete="new-password" name="tanker"></div>'
      + '<button class="btn sec full" id="vkSave">💾 Keys speichern</button></div>'
      + '<div class="group"><h3>📱 Sidebar</h3><button class="btn sec full" id="resetOrder">🔄 App-Reihenfolge zurücksetzen</button></div>'
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
          _toast("🌐 " + (HalDo.Language.LANGS[el.dataset.lang].name), "ok");
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
    var ro = document.getElementById("resetOrder");
    if(ro) ro.addEventListener("click", function(){
      HalDo.Config.set("appOrder", null);
      _toast("🔄 Reihenfolge zurückgesetzt", "ok");
      renderSidebar();
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

console.log("🦚 desktop.js geladen (v150c mit Drag&Drop-Sidebar)");
