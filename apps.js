/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APPS REGISTRY (v152.1)
   Manifest · Registry · Fallback-Kategorie · Custom-Apps
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  if(!window.HalDo) window.HalDo = {};

  var MANIFEST = [
    /* ▸ SYSTEM */
    { id: "home",           name: "Home",           icon: "🏠", desc: "Dashboard mit Widgets", category: "system" },
    { id: "settings",       name: "Einstellungen",  icon: "⚙️", desc: "App-Konfiguration", category: "system" },
    { id: "system-center",  name: "System-Center",  icon: "🖥️", desc: "Systemübersicht", category: "system" },
    { id: "theme",          name: "Theme",          icon: "🎨", desc: "Farben & Themes", category: "system", hidden: true },
    { id: "update",         name: "Update",         icon: "🔄", desc: "Updates prüfen", category: "system" },
    { id: "backup",         name: "Backup",         icon: "💾", desc: "Sichern & Wiederherstellen", category: "system" },
    { id: "recovery",       name: "Recovery",       icon: "🚑", desc: "Notfall-Modus", category: "system" },
    { id: "diagnostics",    name: "Diagnostics",    icon: "🩺", desc: "Systemdiagnose", category: "system" },

    /* ▸ KOMMUNIKATION */
    { id: "chat",           name: "Chat",           icon: "💬", desc: "Nachrichten", category: "kommunikation" },
    { id: "ai",             name: "AI Chat",        icon: "🧠", desc: "KI-Assistent", category: "kommunikation" },
    { id: "posteingang",    name: "Posteingang",    icon: "📬", desc: "E-Mails & Nachrichten", category: "kommunikation" },
    { id: "kontakte",       name: "Kontakte",       icon: "👥", desc: "Adressbuch", category: "kommunikation" },
    { id: "aufnahme",       name: "Aufnahme",       icon: "🎙️", desc: "Sprachnotizen & Diktat", category: "kommunikation" },

    /* ▸ PRODUKTIVITÄT */
    { id: "tasks",          name: "Aufgaben",       icon: "✅", desc: "To-Do Liste", category: "produktivitaet" },
    { id: "notes",          name: "Notizen",        icon: "📝", desc: "Textnotizen", category: "produktivitaet" },
    { id: "kalender",       name: "Kalender",       icon: "📅", desc: "Termine & Events", category: "produktivitaet" },
    { id: "projekte",       name: "Projekte",       icon: "📊", desc: "Projektverwaltung", category: "produktivitaet" },
    { id: "arbeitszeit",    name: "Arbeitszeit",    icon: "⏰", desc: "Zeiterfassung", category: "produktivitaet" },
    { id: "dokumente",      name: "Dokumente",      icon: "📄", desc: "Dateien & Dokumente", category: "produktivitaet" },
    { id: "links",          name: "Links",          icon: "🔗", desc: "Bookmarks", category: "produktivitaet" },
    { id: "passwort",       name: "Passwort",       icon: "🔐", desc: "Passwort-Manager", category: "produktivitaet" },

    /* ▸ GESUNDHEIT & FITNESS */
    { id: "fitness",        name: "Fitness",        icon: "💪", desc: "Training · BMI · Wasser", category: "gesundheit" },
    { id: "gesundheit",     name: "Gesundheit",     icon: "🩺", desc: "Gesundheitstracking", category: "gesundheit" },
    { id: "stimmung",       name: "Stimmung",       icon: "😊", desc: "Mood-Tracker", category: "gesundheit" },
    { id: "gewohnheiten",   name: "Gewohnheiten",   icon: "🔄", desc: "Habit-Tracker", category: "gesundheit" },

    /* ▸ LIFESTYLE */
    { id: "kueche",         name: "Küche",          icon: "🍳", desc: "Rezepte & Einkauf", category: "lifestyle" },
    { id: "zuhause",        name: "Zuhause",        icon: "🏡", desc: "Haushalt & Garten", category: "lifestyle" },
    { id: "finanzen",       name: "Finanzen",       icon: "💰", desc: "Budget & Ausgaben", category: "lifestyle" },
    { id: "reisen",         name: "Reisen",         icon: "✈️", desc: "Reiseplanung", category: "lifestyle" },
    { id: "auto",           name: "Auto",           icon: "🚗", desc: "Fahrzeugverwaltung", category: "lifestyle" },
    { id: "musik",          name: "Musik",          icon: "🎵", desc: "Playlists", category: "lifestyle" },
    { id: "photos",         name: "Fotos",          icon: "📸", desc: "Fotogalerie", category: "lifestyle" },

    /* ▸ WERKZEUGE */
    { id: "wetter",         name: "Wetter",         icon: "🌤️", desc: "Wettervorhersage", category: "werkzeuge" },
    { id: "rechner",        name: "Rechner",        icon: "🧮", desc: "Taschenrechner", category: "werkzeuge" },
    { id: "timer",          name: "Timer",          icon: "⏱️", desc: "Timer & Stoppuhr", category: "werkzeuge" },
    { id: "uebersetzer",    name: "Übersetzer",     icon: "🌐", desc: "Sprachübersetzung", category: "werkzeuge" },
    { id: "woerterbuch",    name: "Wörterbuch",     icon: "📖", desc: "Wörter nachschlagen", category: "werkzeuge" },
    { id: "lerne",          name: "Lernen",         icon: "📚", desc: "Lernkarten & Quiz", category: "werkzeuge" },
    { id: "notfall",        name: "Notfall",        icon: "🚨", desc: "Notfallkontakte", category: "werkzeuge" },
    { id: "bewertung",      name: "Bewertung",      icon: "⭐", desc: "Bewertungen", category: "werkzeuge" },
    { id: "spiele",         name: "Spiele",         icon: "🎮", desc: "Minispiele", category: "werkzeuge" }
  ];

  /* KATEGORIEN — mit "app" als Fallback für unkategorisierte */
  var CATEGORIES = {
    system:          "⚙️ System",
    kommunikation:   "💬 Kommunikation",
    produktivitaet:  "📋 Produktivität",
    gesundheit:      "💪 Gesundheit",
    lifestyle:       "🌟 Lifestyle",
    werkzeuge:       "🛠️ Werkzeuge",
    app:             "📦 Weitere Apps"
  };

  var REGISTRY = {};
  var ORDER = [];

  var MANIFEST_MAP = {};
  MANIFEST.forEach(function(m){ MANIFEST_MAP[m.id] = m; });

  function prettify(id){
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

    var manifest = MANIFEST_MAP[id] || {};
    var icon = config.icon || manifest.icon || "📦";
    var name = config.name || manifest.name || prettify(id);

    /* WICHTIG: Manifest-Kategorie hat Priorität, dann config, dann "app" */
    var cat = manifest.category || config.category || "app";

    /* Falls Kategorie unbekannt → "app" */
    if(!CATEGORIES[cat]) cat = "app";

    var desc = config.desc || manifest.desc || "";

    REGISTRY[id] = {
      id: id,
      name: name,
      icon: icon,
      render: config.render,
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

  /* ═══════════════════════════════════════════════════════════
     LISTEN
     ═══════════════════════════════════════════════════════════ */
  function listInstalled(includeHidden){
    return ORDER.map(function(id){ return REGISTRY[id]; })
      .filter(function(a){ return a && (includeHidden || !a.hidden); });
  }

  /* ALLE Apps (Manifest + Custom-Registered, die nicht im Manifest sind) */
  function listAll(includeHidden){
    var seen = {};
    var result = [];

    /* 1) Alle aus Manifest */
    MANIFEST.forEach(function(m){
      if(m.hidden && !includeHidden) return;
      seen[m.id] = true;
      var installed = !!REGISTRY[m.id];
      result.push({
        id: m.id,
        name: m.name,
        icon: m.icon,
        desc: m.desc,
        category: m.category,
        hidden: !!m.hidden,
        installed: installed,
        render: installed ? REGISTRY[m.id].render : null
      });
    });

    /* 2) Custom-Apps die registriert aber nicht im Manifest sind */
    ORDER.forEach(function(id){
      if(seen[id]) return;
      var a = REGISTRY[id];
      if(a.hidden && !includeHidden) return;
      result.push({
        id: a.id,
        name: a.name,
        icon: a.icon,
        desc: a.desc,
        category: a.category || "app",
        hidden: a.hidden,
        installed: true,
        render: a.render
      });
    });

    return result;
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

  /* ═══════════════════════════════════════════════════════════
     ÖFFNEN
     ═══════════════════════════════════════════════════════════ */
  var currentApp = null;

  function open(id){
    var app = REGISTRY[id];
    if(!app){
      if(MANIFEST_MAP[id]){
        if(HalDo.Notify){
          HalDo.Notify.warn("⏳ " + MANIFEST_MAP[id].name + " ist noch nicht installiert", { app: "system", duration: 4000 });
        }
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
      console.error("Render-Fehler " + id + ":", e);
      content.innerHTML = '<div class="card"><h3>❌ Fehler</h3>'
        + '<div style="font-size:12px;color:#ff8080;word-break:break-word">' + String(e.message || e) + '</div>'
        + '</div>';
    }

    var sb = document.getElementById("haldo-sidebar");
    var ov = document.getElementById("haldo-overlay");
    if(sb) sb.classList.remove("open");
    if(ov) ov.classList.remove("open");
  }

  function current(){ return currentApp; }

  HalDo.Apps = {
    register: register,
    open: open,
    get: get,
    has: has,
    exists: exists,
    current: current,
    list: listInstalled,
    listInstalled: listInstalled,
    listAll: listAll,
    listByCategory: listByCategory,
    manifest: MANIFEST,
    categories: CATEGORIES,
    all: REGISTRY
  };

  window.HalDoApp = register;

  console.log("🦚 apps.js v152.1 geladen — " + MANIFEST.length + " Apps im Manifest");
})();
