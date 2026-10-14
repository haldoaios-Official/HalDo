/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — THEME ENGINE (v150)
   5 Themes · Live-Switch · Auto-Save · Custom Akzent
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  /* ═══════════════════════════════════════════════════════════
     THEME DEFINITIONEN
     ═══════════════════════════════════════════════════════════ */
  var THEMES = {
    peacock: {
      name: "🦚 Peacock",
      desc: "Standard · Cyan + Lila",
      colors: {
        "--p1": "#00e5ff",
        "--p2": "#4da8ff",
        "--p3": "#b478ff",
        "--bg": "#050810",
        "--bg-2": "#0a0f1a",
        "--card": "rgba(255,255,255,.03)",
        "--text": "#e8ecff",
        "--text-dim": "#a8b0cc",
        "--text-mute": "#6b7390",
        "--border-soft": "1px solid rgba(255,255,255,.08)",
        "--glow": "0 0 24px rgba(0,229,255,.35)"
      }
    },
    midnight: {
      name: "🌙 Midnight",
      desc: "Dunkel · Blau + Grau",
      colors: {
        "--p1": "#7aa2f7",
        "--p2": "#5c7cfa",
        "--p3": "#9d7cd8",
        "--bg": "#0a0e1a",
        "--bg-2": "#141a2a",
        "--card": "rgba(255,255,255,.02)",
        "--text": "#c8d3f5",
        "--text-dim": "#8a95b8",
        "--text-mute": "#565f7e",
        "--border-soft": "1px solid rgba(122,162,247,.12)",
        "--glow": "0 0 24px rgba(122,162,247,.3)"
      }
    },
    light: {
      name: "☀️ Light",
      desc: "Hell · Sanft & klar",
      colors: {
        "--p1": "#0088cc",
        "--p2": "#0066aa",
        "--p3": "#8855dd",
        "--bg": "#f4f6fb",
        "--bg-2": "#ffffff",
        "--card": "rgba(0,0,0,.03)",
        "--text": "#0a0f1a",
        "--text-dim": "#4a5570",
        "--text-mute": "#8892aa",
        "--border-soft": "1px solid rgba(0,0,0,.1)",
        "--glow": "0 0 20px rgba(0,136,204,.25)"
      }
    },
    sakura: {
      name: "🌸 Sakura",
      desc: "Pink · Weich & warm",
      colors: {
        "--p1": "#ff6eb4",
        "--p2": "#ff8fc7",
        "--p3": "#c478ff",
        "--bg": "#1a0d18",
        "--bg-2": "#251320",
        "--card": "rgba(255,182,218,.05)",
        "--text": "#ffe4f0",
        "--text-dim": "#c9a0b8",
        "--text-mute": "#8a6b7e",
        "--border-soft": "1px solid rgba(255,110,180,.15)",
        "--glow": "0 0 24px rgba(255,110,180,.4)"
      }
    },
    ocean: {
      name: "🌊 Ocean",
      desc: "Tiefsee · Türkis + Grün",
      colors: {
        "--p1": "#2ee6c8",
        "--p2": "#00b8a9",
        "--p3": "#4dd0e1",
        "--bg": "#041418",
        "--bg-2": "#0a2028",
        "--card": "rgba(46,230,200,.05)",
        "--text": "#d4f5ee",
        "--text-dim": "#8ab5aa",
        "--text-mute": "#5a7a72",
        "--border-soft": "1px solid rgba(46,230,200,.12)",
        "--glow": "0 0 24px rgba(46,230,200,.35)"
      }
    },
    forest: {
      name: "🌲 Forest",
      desc: "Wald · Grün + Erde",
      colors: {
        "--p1": "#7ac74f",
        "--p2": "#4caf50",
        "--p3": "#d4a651",
        "--bg": "#0a1410",
        "--bg-2": "#12201a",
        "--card": "rgba(122,199,79,.05)",
        "--text": "#ddf5d4",
        "--text-dim": "#a8c29c",
        "--text-mute": "#5e7a54",
        "--border-soft": "1px solid rgba(122,199,79,.15)",
        "--glow": "0 0 24px rgba(122,199,79,.35)"
      }
    }
  };

  var STORAGE_KEY = "haldo-theme";
  var ACCENT_KEY = "haldo-accent-override";

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* ═══════════════════════════════════════════════════════════
     THEME ANWENDEN
     ═══════════════════════════════════════════════════════════ */
  function apply(themeId, options){
    options = options || {};
    var theme = THEMES[themeId];
    if(!theme) themeId = "peacock", theme = THEMES.peacock;

    var root = document.documentElement;
    Object.keys(theme.colors).forEach(function(k){
      root.style.setProperty(k, theme.colors[k]);
    });

    /* Body-Background explizit */
    document.body.style.background = "linear-gradient(180deg, " + theme.colors["--bg"] + " 0%, " + theme.colors["--bg-2"] + " 100%)";
    document.body.style.color = theme.colors["--text"];
    document.body.style.minHeight = "100vh";

    /* Meta-Theme */
    var meta = document.querySelector('meta[name="theme-color"]');
    if(!meta){
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = theme.colors["--bg"];

    if(!options.silent){
      try { localStorage.setItem(STORAGE_KEY, themeId); } catch(e){}
    }

    /* Event feuern */
    try {
      window.dispatchEvent(new CustomEvent("haldo:themechange", {
        detail: { theme: themeId, colors: theme.colors }
      }));
    } catch(e){}

    return theme;
  }

  function getCurrent(){
    try {
      return localStorage.getItem(STORAGE_KEY) || "peacock";
    } catch(e){
      return "peacock";
    }
  }

  /* ═══════════════════════════════════════════════════════════
     AUTO-LOAD beim Start
     ═══════════════════════════════════════════════════════════ */
  function autoLoad(){
    var saved = getCurrent();
    apply(saved, { silent: true });

    /* Custom Akzent aus Settings prüfen */
    try {
      var customAccent = localStorage.getItem(ACCENT_KEY);
      if(customAccent){
        document.documentElement.style.setProperty("--p1", customAccent);
      }
    } catch(e){}
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", autoLoad);
  } else {
    autoLoad();
  }

  /* ═══════════════════════════════════════════════════════════
     UI PANEL (Modal mit Theme-Auswahl)
     ═══════════════════════════════════════════════════════════ */
  function openPanel(){
    var existing = document.getElementById("haldoThemePanel");
    if(existing){ existing.remove(); return; }

    var current = getCurrent();
    var panel = document.createElement("div");
    panel.id = "haldoThemePanel";
    panel.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:haldoThemeFade .2s ease";

    var html = '<div style="max-width:520px;width:100%;max-height:88vh;overflow-y:auto;background:var(--bg-2);border:1px solid var(--border-soft);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.6)">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">'
      + '<div>'
      + '<div style="font-size:18px;font-weight:900;color:var(--p1)">🎨 Theme wählen</div>'
      + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">' + Object.keys(THEMES).length + ' Themes verfügbar</div>'
      + '</div>'
      + '<button id="haldoThemeClose" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:16px">✕</button>'
      + '</div>';

    /* Theme-Grid */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    Object.keys(THEMES).forEach(function(id){
      var t = THEMES[id];
      var isActive = id === current;
      var c = t.colors;
      html += '<button data-theme="' + id + '" style="'
        + 'padding:0;background:transparent;border:none;cursor:pointer;text-align:left;'
        + (isActive ? '' : 'opacity:.85;')
        + '">'
        + '<div style="padding:14px;background:linear-gradient(135deg,' + c["--bg"] + ',' + c["--bg-2"] + ');border-radius:14px;border:2px solid ' + (isActive ? c["--p1"] : "rgba(255,255,255,.1)") + ';position:relative;overflow:hidden;transition:.2s">'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<div style="width:18px;height:18px;border-radius:50%;background:' + c["--p1"] + ';box-shadow:0 0 12px ' + c["--p1"] + '"></div>'
        + '<div style="width:18px;height:18px;border-radius:50%;background:' + c["--p2"] + '"></div>'
        + '<div style="width:18px;height:18px;border-radius:50%;background:' + c["--p3"] + '"></div>'
        + '</div>'
        + '<div style="font-size:12.5px;font-weight:900;color:' + c["--text"] + '">' + _esc(t.name) + '</div>'
        + '<div style="font-size:10px;color:' + c["--text-mute"] + ';margin-top:2px">' + _esc(t.desc) + '</div>'
        + (isActive ? '<div style="position:absolute;top:10px;right:10px;font-size:16px">✅</div>' : '')
        + '</div>'
        + '</button>';
    });
    html += '</div>';

    /* Custom Akzent */
    html += '<div style="margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)">'
      + '<div style="font-size:12px;font-weight:900;color:var(--text);margin-bottom:8px">🎨 Eigene Akzentfarbe</div>'
      + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Überschreibt die Hauptfarbe (--p1) des Themes</div>'
      + '<div style="display:flex;gap:8px;align-items:center">'
      + '<input type="color" id="haldoAccentPick" value="' + (document.documentElement.style.getPropertyValue("--p1") || "#00e5ff") + '" style="width:60px;height:44px;border:1px solid var(--border-soft);border-radius:10px;background:transparent;cursor:pointer">'
      + '<button id="haldoAccentApply" style="flex:1;padding:12px;background:var(--p1);color:#000;border:none;border-radius:10px;font-weight:900;cursor:pointer;font-size:12px">Akzent anwenden</button>'
      + '<button id="haldoAccentReset" style="padding:12px 16px;background:rgba(0,0,0,.3);color:var(--text-dim);border:none;border-radius:10px;font-weight:800;cursor:pointer;font-size:11px">Reset</button>'
      + '</div>'
      + '</div>';

    /* Info */
    html += '<div style="margin-top:16px;padding:12px;background:rgba(0,229,255,.06);border-radius:10px;border-left:3px solid var(--p1)">'
      + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.6">'
      + '💡 Deine Wahl wird <b>automatisch gespeichert</b> und beim nächsten Start wieder geladen.'
      + '</div>'
      + '</div>';

    html += '</div>';
    panel.innerHTML = html;

    /* Animation-Style */
    if(!document.getElementById("haldoThemeStyle")){
      var st = document.createElement("style");
      st.id = "haldoThemeStyle";
      st.textContent = "@keyframes haldoThemeFade{from{opacity:0}to{opacity:1}}";
      document.head.appendChild(st);
    }

    document.body.appendChild(panel);

    /* Events */
    panel.addEventListener("click", function(e){
      if(e.target === panel){
        panel.remove();
      }
    });

    panel.querySelector("#haldoThemeClose").addEventListener("click", function(){
      panel.remove();
    });

    panel.querySelectorAll("[data-theme]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var id = btn.dataset.theme;
        apply(id);
        if(window.HalDo && HalDo.Voice) HalDo.Voice.speak(THEMES[id].name.replace(/[^\w\sÄÖÜäöü]/g, "").trim() + " aktiviert");
        if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Theme: " + THEMES[id].name, { app: "theme" });
        panel.remove();
      });
    });

    panel.querySelector("#haldoAccentApply").addEventListener("click", function(){
      var col = panel.querySelector("#haldoAccentPick").value;
      document.documentElement.style.setProperty("--p1", col);
      try { localStorage.setItem(ACCENT_KEY, col); } catch(e){}
      if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Akzent gesetzt: " + col, { app: "theme" });
    });

    panel.querySelector("#haldoAccentReset").addEventListener("click", function(){
      try { localStorage.removeItem(ACCENT_KEY); } catch(e){}
      apply(getCurrent());
      if(window.HalDo && HalDo.Notify) HalDo.Notify.info("Akzent zurückgesetzt", { app: "theme" });
      panel.remove();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     FLOATING BUTTON (unten rechts)
     ═══════════════════════════════════════════════════════════ */
  function injectFab(){
    if(document.getElementById("haldoThemeFab")) return;

    var fab = document.createElement("button");
    fab.id = "haldoThemeFab";
    fab.title = "Theme wechseln (Strg+T)";
    fab.innerHTML = "🎨";
    fab.style.cssText = "position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--p1),var(--p3));border:none;color:#000;font-size:22px;cursor:pointer;z-index:9998;box-shadow:var(--glow),0 8px 24px rgba(0,0,0,.4);transition:.2s;display:flex;align-items:center;justify-content:center";

    fab.addEventListener("mouseenter", function(){
      fab.style.transform = "scale(1.1) rotate(15deg)";
    });
    fab.addEventListener("mouseleave", function(){
      fab.style.transform = "";
    });
    fab.addEventListener("click", openPanel);

    document.body.appendChild(fab);
  }

  /* ═══════════════════════════════════════════════════════════
     KEYBOARD SHORTCUT (Strg+T)
     ═══════════════════════════════════════════════════════════ */
  document.addEventListener("keydown", function(e){
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t"){
      e.preventDefault();
      openPanel();
    }
  });

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  window.HalDoTheme = {
    apply: apply,
    get: getCurrent,
    open: openPanel,
    list: function(){ return Object.keys(THEMES); },
    themes: THEMES,
    setAccent: function(color){
      document.documentElement.style.setProperty("--p1", color);
      try { localStorage.setItem(ACCENT_KEY, color); } catch(e){}
    },
    resetAccent: function(){
      try { localStorage.removeItem(ACCENT_KEY); } catch(e){}
      apply(getCurrent());
    }
  };

  /* FAB nach kurzem Delay injizieren (damit DOM steht) */
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){
      setTimeout(injectFab, 800);
    });
  } else {
    setTimeout(injectFab, 800);
  }

  console.log("🎨 theme.js geladen — " + Object.keys(THEMES).length + " Themes verfügbar");
})();
