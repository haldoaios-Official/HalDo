/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APPS REGISTRY (v151)
   App-Registry · HalDoApp() · Icons · Navigation
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  if(!window.HalDo) window.HalDo = {};

  var REGISTRY = {};   /* id -> { id, name, icon, render, config } */
  var ORDER = [];      /* Reihenfolge der Registrierung */

  /* Icon-Mapping für bekannte Apps */
  var DEFAULT_ICONS = {
    "home": "🏠",
    "chat": "💬",
    "ai": "🧠",
    "notes": "📝",
    "notizen": "📝",
    "tasks": "✅",
    "kalender": "📅",
    "fitness": "💪",
    "kueche": "🍳",
    "zuhause": "🏠",
    "aufnahme": "🎙️",
    "kontakte": "👥",
    "finanzen": "💰",
    "wetter": "🌤️",
    "rechner": "🧮",
    "timer": "⏱️",
    "uebersetzer": "🌐",
    "woerterbuch": "📖",
    "musik": "🎵",
    "photos": "📸",
    "lerne": "📚",
    "gesundheit": "🩺",
    "reisen": "✈️",
    "auto": "🚗",
    "arbeitszeit": "⏰",
    "posteingang": "📬",
    "dokumente": "📄",
    "passwort": "🔐",
    "notfall": "🚨",
    "stimmung": "😊",
    "bewertung": "⭐",
    "projekte": "📊",
    "gewohnheiten": "🔄",
    "links": "🔗",
    "spiele": "🎮",
    "settings": "⚙️",
    "system-center": "🖥️",
    "update": "🔄",
    "backup": "💾",
    "recovery": "🚑",
    "diagnostics": "🩺",
    "theme": "🎨"
  };

  /* Automatisch hübsche Namen aus IDs ableiten */
  function prettify(id){
    var map = {
      "system-center": "System-Center",
      "aufnahme": "Aufnahme"
    };
    if(map[id]) return map[id];
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  /* ═══════════════════════════════════════════════════════════
     REGISTRIERUNG
     ═══════════════════════════════════════════════════════════ */
  function register(id, config){
    if(!id || !config || typeof config.render !== "function"){
      console.warn("HalDoApp: ungültige Registrierung", id);
      return;
    }

    var icon = config.icon || DEFAULT_ICONS[id] || "📦";
    var name = config.name || prettify(id);

    REGISTRY[id] = {
      id: id,
      name: name,
      icon: icon,
      render: config.render,
      desc: config.desc || "",
      hidden: !!config.hidden,
      category: config.category || "app"
    };

    if(ORDER.indexOf(id) === -1) ORDER.push(id);
  }

  /* ═══════════════════════════════════════════════════════════
     ÖFFNEN
     ═══════════════════════════════════════════════════════════ */
  var currentApp = null;

  function open(id){
    var app = REGISTRY[id];
    if(!app){
      console.warn("App nicht gefunden:", id);
      if(HalDo.Notify) HalDo.Notify.error("App nicht gefunden: " + id, { app: "system" });
      return;
    }

    var content = document.getElementById("haldo-content");
    if(!content){
      console.warn("Kein #haldo-content Container");
      return;
    }

    /* App-Theme aktivieren falls konfiguriert */
    if(window.HalDoTheme && HalDoTheme.applyForApp){
      HalDoTheme.applyForApp(id);
    }

    /* Container leeren */
    content.innerHTML = "";
    content.scrollTop = 0;

    /* Title setzen */
    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = app.icon + " " + app.name;

    /* Ctx bauen */
    var ctx = {
      store: HalDo.Store.scope(id),
      appId: id,
      app: app,
      HalDo: HalDo
    };

    try {
      app.render(content, ctx);
      currentApp = id;
      try { localStorage.setItem("haldo:lastApp", id); } catch(e){}
      window.dispatchEvent(new CustomEvent("haldo:appopen", { detail: { id: id } }));
    } catch(e){
      console.error("Fehler beim Rendern von " + id + ":", e);
      content.innerHTML = '<div class="card"><h3>❌ Fehler</h3>'
        + '<div style="font-size:12px;color:#ff8080;word-break:break-word">' + String(e.message || e) + '</div>'
        + '</div>';
    }

    /* Sidebar schließen */
    var sb = document.getElementById("haldo-sidebar");
    var ov = document.getElementById("haldo-overlay");
    if(sb) sb.classList.remove("open");
    if(ov) ov.classList.remove("open");
  }

  /* ═══════════════════════════════════════════════════════════
     HILFSFUNKTIONEN
     ═══════════════════════════════════════════════════════════ */
  function list(includeHidden){
    return ORDER.map(function(id){ return REGISTRY[id]; })
      .filter(function(a){ return a && (includeHidden || !a.hidden); });
  }

  function get(id){ return REGISTRY[id] || null; }

  function has(id){ return !!REGISTRY[id]; }

  function current(){ return currentApp; }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.Apps = {
    register: register,
    open: open,
    list: list,
    get: get,
    has: has,
    current: current,
    all: REGISTRY
  };

  /* Globale HalDoApp Funktion für App-Dateien */
  window.HalDoApp = register;

  console.log("🦚 apps.js geladen");
})();
