/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APPS REGISTRY (v155)
   Robuste Registrierung · Fallback wenn HalDo.Apps fehlt
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  var MANIFEST = [
    { id: "home",           name: "Home",           icon: "🏠", desc: "Dashboard", category: "system" },
    { id: "settings",       name: "Einstellungen",  icon: "⚙️", desc: "Konfiguration", category: "system" },
    { id: "system-center",  name: "System-Center",  icon: "🖥️", desc: "Systemübersicht", category: "system" },
    { id: "update",         name: "Update",         icon: "🔄", desc: "Updates prüfen", category: "system" },
    { id: "backup",         name: "Backup",         icon: "💾", desc: "Sichern", category: "system" },
    { id: "recovery",       name: "Recovery",       icon: "🚑", desc: "Notfall-Modus", category: "system" },
    { id: "diagnostics",    name: "Diagnostics",    icon: "🩺", desc: "Diagnose", category: "system" },
    { id: "appstore",       name: "AppStore",       icon: "🏪", desc: "App-Verwaltung", category: "system" },

    { id: "chat",           name: "Chat",           icon: "💬", desc: "Nachrichten", category: "kommunikation" },
    { id: "ai",             name: "AI Chat",        icon: "🧠", desc: "KI-Assistent", category: "kommunikation" },
    { id: "posteingang",    name: "Posteingang",    icon: "📬", desc: "Nachrichten", category: "kommunikation" },
    { id: "kontakte",       name: "Kontakte",       icon: "👥", desc: "Adressbuch", category: "kommunikation" },
    { id: "aufnahme",       name: "Aufnahme",       icon: "🎙️", desc: "Sprachnotizen", category: "kommunikation" },
    { id: "phone",          name: "Phone",          icon: "📞", desc: "Telefon-UI", category: "kommunikation" },
    { id: "videocall",      name: "VideoCall",      icon: "📹", desc: "Videoanrufe", category: "kommunikation" },

    { id: "tasks",          name: "Aufgaben",       icon: "✅", desc: "To-Do Liste", category: "produktivitaet" },
    { id: "notes",          name: "Notizen",        icon: "📝", desc: "Textnotizen", category: "produktivitaet" },
    { id: "kalender",       name: "Kalender",       icon: "📅", desc: "Termine", category: "produktivitaet" },
    { id: "projekte",       name: "Projekte",       icon: "📊", desc: "Projekte", category: "produktivitaet" },
    { id: "arbeitszeit",    name: "Arbeitszeit",    icon: "⏰", desc: "Zeiterfassung", category: "produktivitaet" },
    { id: "dokumente",      name: "Dokumente",      icon: "📄", desc: "Dateien", category: "produktivitaet" },
    { id: "links",          name: "Links",          icon: "🔗", desc: "Bookmarks", category: "produktivitaet" },
    { id: "passwort",       name: "Passwort",       icon: "🔐", desc: "Passwort-Safe", category: "produktivitaet" },

    { id: "fitness",        name: "Fitness",        icon: "💪", desc: "Training", category: "gesundheit" },
    { id: "gesundheit",     name: "Gesundheit",     icon: "🩺", desc: "Gesundheit", category: "gesundheit" },
    { id: "stimmung",       name: "Stimmung",       icon: "😊", desc: "Mood-Tracker", category: "gesundheit" },
    { id: "gewohnheiten",   name: "Gewohnheiten",   icon: "🔄", desc: "Habits", category: "gesundheit" },

    { id: "kueche",         name: "Küche",          icon: "🍳", desc: "Rezepte", category: "lifestyle" },
    { id: "zuhause",        name: "Zuhause",        icon: "🏡", desc: "Haushalt", category: "lifestyle" },
    { id: "finanzen",       name: "Finanzen",       icon: "💰", desc: "Budget", category: "lifestyle" },
    { id: "reisen",         name: "Reisen",         icon: "✈️", desc: "Reisen", category: "lifestyle" },
    { id: "auto",           name: "Auto",           icon: "🚗", desc: "Fahrzeuge", category: "lifestyle" },
    { id: "musik",          name: "Musik",          icon: "🎵", desc: "Musik", category: "lifestyle" },
    { id: "photos",         name: "Fotos",          icon: "📸", desc: "Fotos", category: "lifestyle" },
    { id: "video",          name: "Video",          icon: "🎬", desc: "Videos", category: "lifestyle" },
    { id: "bild",           name: "Bild",           icon: "🎨", desc: "Bild-Bearbeitung", category: "lifestyle" },

    { id: "wetter",         name: "Wetter",         icon: "🌤️", desc: "Wetter", category: "werkzeuge" },
    { id: "rechner",        name: "Rechner",        icon: "🧮", desc: "Rechner", category: "werkzeuge" },
    { id: "timer",          name: "Timer",          icon: "⏱️", desc: "Timer", category: "werkzeuge" },
    { id: "uebersetzer",    name: "Übersetzer",     icon: "🌐", desc: "Übersetzen", category: "werkzeuge" },
    { id: "woerterbuch",    name: "Wörterbuch",     icon: "📖", desc: "Wörter", category: "werkzeuge" },
    { id: "lerne",          name: "Lernen",         icon: "📚", desc: "Lernkarten", category: "werkzeuge" },
    { id: "notfall",        name: "Notfall",        icon: "🚨", desc: "Notfall", category: "werkzeuge" },
    { id: "bewertung",      name: "Bewertung",      icon: "⭐", desc: "Bewertungen", category: "werkzeuge" },
    { id: "spiele",         name: "Spiele",         icon: "🎮", desc: "Spiele", category: "werkzeuge" }
  ];

  var CATEGORIES = {
    system:          { name: "System",          icon: "⚙️", color: "#00e5ff", planet: "#4da8ff", size: 60 },
    kommunikation:   { name: "Kommunikation",   icon: "💬", color: "#fbbf24", planet: "#f59e0b", size: 70 },
    produktivitaet:  { name: "Produktivität",   icon: "📋", color: "#4ade80", planet: "#22c55e", size: 65 },
    gesundheit:      { name: "Gesundheit",      icon: "💪", color: "#ff8080", planet: "#ef4444", size: 55 },
    lifestyle:       { name: "Lifestyle",       icon: "🌟", color: "#b478ff", planet: "#a855f7", size: 75 },
    werkzeuge:       { name: "Werkzeuge",       icon: "🛠️", color: "#2ee6c8", planet: "#14b8a6", size: 68 },
    app:             { name: "Weitere",         icon: "📦", color: "#a8b0cc", planet: "#94a3b8", size: 60 }
  };

  var REGISTRY = {};
  var ORDER = [];
  var MANIFEST_MAP = {};
  MANIFEST.forEach(function(m){ MANIFEST_MAP[m.id] = m; });

  function prettify(id){ return id.charAt(0).toUpperCase() + id.slice(1); }

  function register(id, config){
    if(!id || !config || typeof config.render !== "function"){
      console.warn("HalDoApp: ungültig", id);
      return;
    }
    var manifest = MANIFEST_MAP[id] || {};
    var icon = config.icon || manifest.icon || "📦";
    var name = config.name || manifest.name || prettify(id);
    var cat = manifest.category || config.category || "app";
    if(!CATEGORIES[cat]) cat = "app";
    var desc = config.desc || manifest.desc || "";

    REGISTRY[id] = {
      id: id, name: name, icon: icon, render: config.render,
      desc: desc,
      hidden: config.hidden !== undefined ? config.hidden : !!manifest.hidden,
      category: cat,
      installed: true
    };
    if(ORDER.indexOf(id) === -1) ORDER.push(id);

    if(HalDo.Shell && HalDo.Shell.renderSidebar){
      try { HalDo.Shell.renderSidebar(); } catch(e){}
    }
  }

  function listInstalled(includeHidden){
    return ORDER.map(function(id){ return REGISTRY[id]; })
      .filter(function(a){ return a && (includeHidden || !a.hidden); });
  }

  function listAll(includeHidden){
    var seen = {};
    var out = [];
    MANIFEST.forEach(function(m){
      if(m.hidden && !includeHidden) return;
      seen[m.id] = true;
      out.push({
        id: m.id, name: m.name, icon: m.icon, desc: m.desc,
        category: m.category, hidden: !!m.hidden,
        installed: !!REGISTRY[m.id],
        render: REGISTRY[m.id] ? REGISTRY[m.id].render : null
      });
    });
    ORDER.forEach(function(id){
      if(seen[id]) return;
      var a = REGISTRY[id];
      if(a.hidden && !includeHidden) return;
      out.push({
        id: a.id, name: a.name, icon: a.icon, desc: a.desc,
        category: a.category || "app", hidden: a.hidden,
        installed: true, render: a.render
      });
    });
    return out;
  }

  function listByCategory(includeHidden){
    var all = listAll(includeHidden);
    var groups = {};
    Object.keys(CATEGORIES).forEach(function(cat){ groups[cat] = []; });
    all.forEach(function(a){
      var cat = a.category || "app";
      if(!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    });
    return groups;
  }

  function get(id){ return REGISTRY[id] || null; }
  function has(id){ return !!REGISTRY[id]; }
  function exists(id){ return !!MANIFEST_MAP[id]; }

  var currentApp = null;

  function open(id){
    var app = REGISTRY[id];
    if(!app){
      if(MANIFEST_MAP[id]){
        if(HalDo.Notify) HalDo.Notify.warn("⏳ " + MANIFEST_MAP[id].name + " nicht installiert", { app: "system", duration: 4000 });
      } else {
        if(HalDo.Notify) HalDo.Notify.error("App nicht gefunden: " + id, { app: "system" });
      }
      return;
    }
    var content = document.getElementById("haldo-content");
    if(!content) return;
    if(window.HalDoTheme && HalDoTheme.applyForApp){
      HalDoTheme.applyForApp(id);
    }
    content.innerHTML = "";
    content.scrollTop = 0;
    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = app.icon + " " + app.name;

    var ctx = {
      store: HalDo.Store.scope(id),
      appId: id, app: app, HalDo: HalDo
    };
    try {
      app.render(content, ctx);
      currentApp = id;
      try { localStorage.setItem("haldo:lastApp", id); } catch(e){}
      window.dispatchEvent(new CustomEvent("haldo:appopen", { detail: { id: id } }));
    } catch(e){
      console.error("Render-Fehler " + id + ":", e);
      content.innerHTML = '<div class="card"><h3>❌ Fehler</h3>'
        + '<div style="font-size:12px;color:#ff8080;word-break:break-word">' + String(e.message || e) + '</div></div>';
    }
    var sb = document.getElementById("haldo-sidebar");
    var ov = document.getElementById("haldo-overlay");
    if(sb) sb.classList.remove("open");
    if(ov) ov.classList.remove("open");
  }

  function current(){ return currentApp; }

  HalDo.Apps = {
    register: register, open: open,
    get: get, has: has, exists: exists, current: current,
    list: listInstalled, listInstalled: listInstalled,
    listAll: listAll, listByCategory: listByCategory,
    manifest: MANIFEST, categories: CATEGORIES,
    all: REGISTRY
  };

  window.HalDoApp = register;

  console.log("🦚 apps.js v155 geladen — " + MANIFEST.length + " Apps im Manifest");
})();
