/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MENU SYSTEM (v150)
   Systemmenü · A–Z-Apps · Kontextmenü
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Menu = (function(){
  "use strict";

  /* ─────────── Systemmenü ─────────── */
  var SYSTEM_ITEMS = [
    { id:"home",     ico:"🏠", label:"Startseite",      action:function(){ if(window.HalDo.Router) HalDo.Router.open("chat"); } },
    { id:"files",    ico:"📁", label:"Dateien",         action:function(){ if(window.HalDo.Router) HalDo.Router.open("dokumente"); } },
    { id:"settings", ico:"⚙️", label:"Einstellungen",   action:function(){ var b = document.getElementById("settingsBtn"); if(b) b.click(); } },
    { id:"system",   ico:"💻", label:"System Center",   action:function(){ if(window.HalDo.Router) HalDo.Router.open("system"); } },
    { id:"updates",  ico:"🔄", label:"Updates",         action:function(){ _notReady("Updates"); } },
    { id:"security", ico:"🔒", label:"Sicherheit",      action:function(){ _showSecurity(); } },
    { id:"backup",   ico:"💾", label:"Backup & Recovery", action:function(){ _doBackup(); } },
    { id:"network",  ico:"🌐", label:"Netzwerk",        action:function(){ _showNetwork(); } },
    { id:"help",     ico:"❓", label:"Hilfe",           action:function(){ _showHelp(); } },
    { id:"about",    ico:"ℹ️", label:"Über HalDo AI OS", action:function(){ _showAbout(); } }
  ];

  /* ─────────── A–Z-App-Menü (nutzt Registry) ─────────── */
  function _azApps(){
    if(!window.HalDo.Registry) return [];
    var apps = HalDo.Registry.all();
    return apps.slice().sort(function(a, b){
      return a.name.localeCompare(b.name);
    });
  }

  /* ─────────── Hauptmenü öffnen ─────────── */
  function openSystemMenu(){
    var sb = document.getElementById("sidebar");
    if(!sb) return;

    var html = '<div class="group">🦚 SYSTEM</div>';
    SYSTEM_ITEMS.forEach(function(it){
      html += '<button class="item" data-sys="' + it.id + '">'
        + '<span class="ico">' + it.ico + '</span>'
        + '<span class="lbl">' + _esc(it.label) + '</span>'
        + '</button>';
    });
    html += '<hr class="sep">';
    html += '<div class="group">📱 APPS A–Z</div>';

    _azApps().forEach(function(a){
      var firstLetter = a.name.substring(0, 1).toUpperCase();
      html += '<button class="item" data-open-app="' + a.id + '">'
        + '<span class="ico">' + a.ico + '</span>'
        + '<span class="lbl">' + _esc(a.name)
        +   '<div class="sub">' + firstLetter + ' · ' + _esc(a.desc) + '</div>'
        + '</span>'
        + '</button>';
    });

    sb.innerHTML = html;

    /* Events */
    sb.querySelectorAll("[data-sys]").forEach(function(b){
      b.addEventListener("click", function(){
        var item = SYSTEM_ITEMS.find(function(x){ return x.id === b.dataset.sys; });
        if(item && item.action) item.action();
        if(window.HalDo.Display) HalDo.Display.setSidebarOpen(false);
      });
    });
    sb.querySelectorAll("[data-open-app]").forEach(function(b){
      b.addEventListener("click", function(){
        if(window.HalDo.Router) HalDo.Router.open(b.dataset.openApp);
        if(window.innerWidth < 700 && window.HalDo.Display){
          HalDo.Display.setSidebarOpen(false);
        }
      });
    });
  }

  /* ─────────── Dialoge ─────────── */
  function _notReady(name){
    _toast("📦 " + name + " kommt in einer späteren Runde");
  }

  function _showSecurity(){
    var perms = window.HalDo.Security ? HalDo.Security.status() : {};
    var list = Object.keys(perms).map(function(k){
      var p = perms[k];
      return '<div class="row"><div class="lbl">' + _esc(p.label)
        + '<small>' + _esc(p.desc) + '</small></div>'
        + '<div style="font-size:11px;font-weight:800;color:' + (p.granted ? "#4ade80" : p.available ? "#fbbf24" : "#ff8080") + '">'
        + (p.granted ? "✅ Aktiv" : p.available ? "⏸ Erlaubt?" : "❌ Nicht verfügbar")
        + '</div></div>';
    }).join("");

    _dialog("🔒 Sicherheit & Berechtigungen",
      '<div class="group">' + list + '</div>'
      + '<div class="badge-info">Alle Berechtigungen werden lokal gespeichert. Keine Daten verlassen dein Gerät ohne Erlaubnis.</div>'
    );
  }

  function _showNetwork(){
    var env = window.HalDo.Kernel ? HalDo.Kernel.env() : {};
    _dialog("🌐 Netzwerk & Umgebung",
      '<div class="group"><h3>Status</h3>'
      + _kv("Online", env.online ? "✅ Ja" : "❌ Nein")
      + _kv("Sprache (navigator)", env.language || "—")
      + _kv("Zeitzone", env.timezone || "—")
      + '</div>'
      + '<div class="group"><h3>Hardware</h3>'
      + _kv("CPU-Kerne", env.cores || "—")
      + _kv("Screen", (env.screenW || 0) + "×" + (env.screenH || 0))
      + _kv("DPR", env.dpr || "—")
      + _kv("Touch", env.hasTouch ? "✅" : "—")
      + _kv("Kamera", env.hasCamera ? "✅" : "—")
      + _kv("WebGL", env.hasWebGL ? "✅" : "—")
      + '</div>'
    );
  }

  function _showHelp(){
    _dialog("❓ Hilfe",
      '<div class="group"><h3>Wie benutze ich HalDo AI OS?</h3>'
      + '<div style="font-size:12px;line-height:1.8;color:var(--text-dim)">'
      + '<p>☀️ <b style="color:var(--p1)">Sonne klicken</b> → HalDo AI Chat öffnet sich</p>'
      + '<p>🪐 <b style="color:var(--p1)">Planeten klicken</b> → App öffnet sich</p>'
      + '<p>☰ <b style="color:var(--p1)">Menü-Button</b> → alle Apps A–Z</p>'
      + '<p>🎨 <b style="color:var(--p1)">Theme-Button</b> → Kosmos / Erde / Holo</p>'
      + '<p>⚡ <b style="color:var(--p1)">CYBORG-Button</b> → Pink-Modus</p>'
      + '<p>⚙️ <b style="color:var(--p1)">Einstellungen</b> → alle Optionen</p>'
      + '</div></div>'
      + '<div class="group"><h3>Voice verwenden</h3>'
      + '<div style="font-size:12px;line-height:1.8;color:var(--text-dim)">'
      + '<p>1. Klicke 🔊 (Topbar oder BottomBar)</p>'
      + '<p>2. Wähle eine Stimme (HalDo AI, Cyborg, ... oder ElevenLabs)</p>'
      + '<p>3. Test-Satz sprechen lassen</p>'
      + '<p>4. <b style="color:var(--p1)">ElevenLabs:</b> Key in Einstellungen → Voice-Panel eintragen</p>'
      + '</div></div>'
    );
  }

  function _showAbout(){
    _dialog("🦚 HalDo AI OS",
      '<div class="group"><h3>Version</h3>'
      + _kv("Version", "v150 (Cosmic Edition)")
      + _kv("Apps", (window.HalDo.Registry ? HalDo.Registry.count() : 0) + " registriert")
      + _kv("Sprachen", (window.HalDo.Language ? HalDo.Language.list().length : 0))
      + _kv("Stimmen", (window.HalDo.Voice ? HalDo.Voice.all().length : 0))
      + _kv("Boot-Nr.", (window.HalDo.Config ? HalDo.Config.get("bootCount") : 0))
      + '</div>'
      + '<div class="group"><h3>Über das Projekt</h3>'
      + '<div style="font-size:12px;line-height:1.8;color:var(--text-dim)">'
      + 'HalDo AI OS ist eine universelle KI-Plattform mit Fokus auf <b>Ezidi-Kultur</b>, <b>Mesopotamien-Geschichte</b> und <b>Mehrsprachigkeit</b>.<br><br>'
      + 'Gebaut mit ❤️ von <b style="color:var(--p1)">Bruder für Bruder</b>.<br><br>'
      + '© 2025 HalDo AI OS'
      + '</div></div>'
    );
  }

  /* ─────────── Backup ─────────── */
  function _doBackup(){
    if(!window.HalDo.Config) return;
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

  /* ─────────── Dialog-Helfer ─────────── */
  function _dialog(title, contentHTML){
    var modal = document.getElementById("settings");
    var body = document.getElementById("settingsBody");
    var head = modal ? modal.querySelector("h2") : null;
    if(!modal || !body) return;
    if(head) head.textContent = title;
    body.innerHTML = contentHTML + '<button class="btn full" id="_dlgClose" style="margin-top:10px">Schließen</button>';
    var btn = document.getElementById("_dlgClose");
    if(btn) btn.addEventListener("click", function(){ modal.classList.remove("show"); });
    modal.classList.add("show");
  }

  function _kv(key, val){
    return '<div class="row"><div class="lbl">' + _esc(key) + '</div>'
      + '<div style="font-size:12px;font-weight:800;color:var(--p1)">' + _esc(val) + '</div></div>';
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

  /* ─────────── Init ─────────── */
  function init(){
    /* Menü-Button in Topbar öffnet A–Z-Menü */
    var sbBtn = document.getElementById("sidebarBtn");
    if(sbBtn){
      sbBtn.onclick = function(){
        if(window.HalDo.Display) HalDo.Display.toggleSidebar();
        openSystemMenu();
      };
    }
    if(window.HalDo.Kernel) HalDo.Kernel.log("Menu System bereit (" + SYSTEM_ITEMS.length + " Systempunkte + Apps A–Z)");
  }

  return {
    init: init,
    openSystemMenu: openSystemMenu,
    azApps: _azApps,
    systemItems: function(){ return SYSTEM_ITEMS.slice(); }
  };
})();

console.log("🦚 menu-system.js geladen");
