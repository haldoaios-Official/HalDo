/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APP REGISTRY (v150)
   Zentrale App-Beschreibung · Kategorien · Permissions
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Registry = (function(){
  "use strict";

  /* ─────────── Kategorien ─────────── */
  var CATEGORIES = {
    core:        { label: "Kern",            order: 0 },
    ai:          { label: "KI",              order: 1 },
    knowledge:   { label: "Wissen",          order: 2 },
    learning:    { label: "Lernen",          order: 3 },
    creative:    { label: "Kreativ",         order: 4 },
    productivity:{ label: "Arbeit",          order: 5 },
    life:        { label: "Alltag",          order: 6 },
    mobility:    { label: "Mobilität",       order: 7 },
    communication:{label: "Kommunikation",   order: 8 },
    entertainment:{label:"Unterhaltung",     order: 9 },
    tools:       { label: "Werkzeuge",       order: 10 },
    system:      { label: "System",          order: 11 }
  };

  /* ─────────── Alle Apps ─────────── */
  var APPS = [
    /* ─── KERN ─── */
    {
      id: "chat",
      ico: "💬",
      name: "Chat",
      cat: "core",
      version: "1.0",
      entry: "chat.js",
      desc: "HalDo AI Chat",
      planet: true,
      planetColor: "#4da8ff",
      permissions: ["storage"],
      capabilities: ["voice", "memory"]
    },
    {
      id: "haldoai",
      ico: "🤖",
      name: "HalDo AI",
      cat: "ai",
      version: "1.0",
      entry: "ai-core.js",
      desc: "Gemini · OpenAI · Claude · eigener Avatar",
      planet: true,
      planetColor: "#00e5ff",
      permissions: ["storage", "microphone", "speech"],
      capabilities: ["voice", "memory", "avatar", "ai"]
    },
    {
      id: "ezidi",
      ico: "🦚",
      name: "Êzidî",
      cat: "knowledge",
      version: "1.0",
      entry: "ezidi.js",
      desc: "Völker · Mushaf Reş · Qewl · Engel",
      planet: true,
      planetColor: "#d8b478",
      permissions: ["storage"],
      capabilities: ["voice", "search", "favorites"]
    },

    /* ─── WISSEN & LERNEN ─── */
    {
      id: "welt",
      ico: "🌍",
      name: "Welt",
      cat: "knowledge",
      version: "1.0",
      entry: "welt.js",
      desc: "Länder · Wetter · Weltzeiten",
      planet: true,
      planetColor: "#4a8fd8",
      permissions: ["storage", "network", "location"],
      capabilities: ["voice", "search", "favorites", "api"]
    },
    {
      id: "wissen",
      ico: "🔬",
      name: "Wissen",
      cat: "knowledge",
      version: "1.0",
      entry: "wissen.js",
      desc: "13 Themen · Physik bis Philosophie",
      planet: true,
      planetColor: "#4ade80",
      permissions: ["storage"],
      capabilities: ["voice", "search"]
    },
    {
      id: "lernen",
      ico: "📚",
      name: "Lernen",
      cat: "learning",
      version: "1.0",
      entry: "lernen.js",
      desc: "Vokabeln · Übersetzer · Formeln · Mathe",
      planet: true,
      planetColor: "#c88b4a",
      permissions: ["storage", "network"],
      capabilities: ["voice", "api"]
    },

    /* ─── KREATIV ─── */
    {
      id: "kreativ",
      ico: "🎨",
      name: "Kreativ",
      cat: "creative",
      version: "1.0",
      entry: "kreativ.js",
      desc: "Bild · Pixel · Farben · Story",
      planet: true,
      planetColor: "#fb923c",
      permissions: ["storage", "files"],
      capabilities: ["voice", "export"]
    },
    {
      id: "medien",
      ico: "🎵",
      name: "Medien",
      cat: "entertainment",
      version: "1.0",
      entry: "medien.js",
      desc: "Radio · Podcast · Galerie · Kamera",
      planet: true,
      planetColor: "#ff78c8",
      permissions: ["storage", "network", "camera", "microphone", "audio"],
      capabilities: ["audio", "export"]
    },

    /* ─── SPIELE ─── */
    {
      id: "games",
      ico: "🎮",
      name: "Games",
      cat: "entertainment",
      version: "1.0",
      entry: "games.js",
      desc: "12 Spiele",
      planet: true,
      planetColor: "#c1440e",
      permissions: ["storage"],
      capabilities: ["audio", "highscore"]
    },

    /* ─── ARBEIT ─── */
    {
      id: "produktiv",
      ico: "🎯",
      name: "Produktivität",
      cat: "productivity",
      version: "1.0",
      entry: "produktiv.js",
      desc: "Notizen · Todo · Pomodoro · Projekte",
      planet: true,
      planetColor: "#c084fc",
      permissions: ["storage", "notifications"],
      capabilities: ["voice", "notify", "export"]
    },
    {
      id: "finanzen",
      ico: "💰",
      name: "Finanzen",
      cat: "productivity",
      version: "1.0",
      entry: "finanzen.js",
      desc: "Budget · Kategorien · Diagramm",
      planet: true,
      planetColor: "#78c8d8",
      permissions: ["storage"],
      capabilities: ["chart", "export"]
    },
    {
      id: "dokumente",
      ico: "📄",
      name: "Dokumente",
      cat: "productivity",
      version: "1.0",
      entry: "dokumente.js",
      desc: "Text · Tabellen · PDF · Liste",
      planet: true,
      planetColor: "#a080ff",
      permissions: ["storage", "files"],
      capabilities: ["ai", "export", "import"]
    },

    /* ─── MOBILITÄT ─── */
    {
      id: "verkehr",
      ico: "🚦",
      name: "Verkehr Pro",
      cat: "mobility",
      version: "1.0",
      entry: "verkehr.js",
      desc: "Route · Warnungen · Blitzer · Fahrschule",
      planet: true,
      planetColor: "#4a5cd8",
      permissions: ["storage", "network", "location", "notifications"],
      capabilities: ["voice", "beep", "notify", "api", "settings"]
    },

    /* ─── KOMMUNIKATION ─── */
    {
      id: "comm",
      ico: "📧",
      name: "HalDo Comm",
      cat: "communication",
      version: "1.0",
      entry: "comm.js",
      desc: "Kontakte · Chat · E-Mail · Video",
      planet: true,
      planetColor: "#4a8fd8",
      permissions: ["storage", "camera", "microphone", "contacts"],
      capabilities: ["voice", "video", "export"]
    },

    /* ─── ALLTAG ─── */
    {
      id: "fitness",
      ico: "🏋️",
      name: "Fitness",
      cat: "life",
      version: "1.0",
      entry: "fitness.js",
      desc: "Training · BMI · Schritte · Health",
      planet: true,
      planetColor: "#f59e0b",
      permissions: ["storage", "notifications"],
      capabilities: ["chart", "notify", "voice"]
    },
    {
      id: "kueche",
      ico: "🍳",
      name: "Küche",
      cat: "life",
      version: "1.0",
      entry: "kueche.js",
      desc: "Rezepte · Einkauf · Vorrat · Mahlzeiten",
      planet: true,
      planetColor: "#ef4444",
      permissions: ["storage"],
      capabilities: ["search", "voice", "export"]
    },
    {
      id: "zuhause",
      ico: "🏠",
      name: "Zuhause",
      cat: "life",
      version: "1.0",
      entry: "zuhause.js",
      desc: "Habits · Haushalt · Garten",
      planet: true,
      planetColor: "#22c55e",
      permissions: ["storage", "notifications"],
      capabilities: ["notify", "chart"]
    },
    {
      id: "aufnahme",
      ico: "🎙️",
      name: "Aufnahme",
      cat: "life",
      version: "1.0",
      entry: "aufnahme.js",
      desc: "Sprachnotizen · Diktat",
      planet: true,
      planetColor: "#a855f7",
      permissions: ["storage", "microphone", "audio"],
      capabilities: ["voice", "audio", "export"]
    },

    /* ─── WERKZEUGE ─── */
    {
      id: "werkzeuge",
      ico: "⏱️",
      name: "Werkzeuge",
      cat: "tools",
      version: "1.0",
      entry: "werkzeuge.js",
      desc: "Rechner · Einheiten · QR · Timer",
      planet: true,
      planetColor: "#a87c5a",
      permissions: ["storage"],
      capabilities: ["audio", "export"]
    },

    /* ─── SYSTEM ─── */
    {
      id: "system",
      ico: "⚙️",
      name: "System",
      cat: "system",
      version: "1.0",
      entry: "system-center.js",
      desc: "Info · Backup · Diagnose",
      planet: true,
      planetColor: "#b8b8b8",
      permissions: ["storage"],
      capabilities: ["admin", "export", "import"]
    }
  ];

  /* ─────────── Map für schnellen Zugriff ─────────── */
  var _byId = {};
  APPS.forEach(function(a){ _byId[a.id] = a; });

  /* ─────────── API ─────────── */
  function all(){ return APPS.slice(); }
  function get(id){ return _byId[id] || null; }
  function byCategory(cat){
    return APPS.filter(function(a){ return a.cat === cat; });
  }
  function byCapability(cap){
    return APPS.filter(function(a){
      return a.capabilities && a.capabilities.indexOf(cap) >= 0;
    });
  }
  function categoryList(){
    return Object.keys(CATEGORIES).map(function(k){
      return { id: k, label: CATEGORIES[k].label, order: CATEGORIES[k].order };
    }).sort(function(a,b){ return a.order - b.order; });
  }
  function count(){ return APPS.length; }

  /* Nach Kategorie gruppiert (für Sidebar) */
  function groupedByCategory(){
    var out = {};
    APPS.forEach(function(a){
      if(!out[a.cat]) out[a.cat] = [];
      out[a.cat].push(a);
    });
    return out;
  }

  console.log("🦚 registry.js geladen (" + APPS.length + " Apps registriert)");

  return {
    CATEGORIES: CATEGORIES,
    all: all,
    get: get,
    byCategory: byCategory,
    byCapability: byCapability,
    categoryList: categoryList,
    groupedByCategory: groupedByCategory,
    count: count
  };
})();
