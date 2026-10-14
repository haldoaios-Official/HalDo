/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — THEME ENGINE (v151)
   8 Themes · Auto-Switch · App-Themes · Custom Akzent
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  /* ═══════════════════════════════════════════════════════════
     THEME DEFINITIONEN (8 Stück)
     ═══════════════════════════════════════════════════════════ */
  var THEMES = {
    peacock: {
      name: "🦚 Peacock",
      desc: "Standard · Cyan + Lila",
      dark: true,
      colors: {
        "--p1": "#00e5ff", "--p2": "#4da8ff", "--p3": "#b478ff",
        "--bg": "#050810", "--bg-2": "#0a0f1a",
        "--card": "rgba(255,255,255,.03)",
        "--text": "#e8ecff", "--text-dim": "#a8b0cc", "--text-mute": "#6b7390",
        "--border-soft": "1px solid rgba(255,255,255,.08)",
        "--glow": "0 0 24px rgba(0,229,255,.35)"
      }
    },
    midnight: {
      name: "🌙 Midnight",
      desc: "Dunkel · Blau + Grau",
      dark: true,
      colors: {
        "--p1": "#7aa2f7", "--p2": "#5c7cfa", "--p3": "#9d7cd8",
        "--bg": "#0a0e1a", "--bg-2": "#141a2a",
        "--card": "rgba(255,255,255,.02)",
        "--text": "#c8d3f5", "--text-dim": "#8a95b8", "--text-mute": "#565f7e",
        "--border-soft": "1px solid rgba(122,162,247,.12)",
        "--glow": "0 0 24px rgba(122,162,247,.3)"
      }
    },
    light: {
      name: "☀️ Light",
      desc: "Hell · Sanft & klar",
      dark: false,
      colors: {
        "--p1": "#0088cc", "--p2": "#0066aa", "--p3": "#8855dd",
        "--bg": "#f4f6fb", "--bg-2": "#ffffff",
        "--card": "rgba(0,0,0,.03)",
        "--text": "#0a0f1a", "--text-dim": "#4a5570", "--text-mute": "#8892aa",
        "--border-soft": "1px solid rgba(0,0,0,.1)",
        "--glow": "0 0 20px rgba(0,136,204,.25)"
      }
    },
    sakura: {
      name: "🌸 Sakura",
      desc: "Pink · Weich & warm",
      dark: true,
      colors: {
        "--p1": "#ff6eb4", "--p2": "#ff8fc7", "--p3": "#c478ff",
        "--bg": "#1a0d18", "--bg-2": "#251320",
        "--card": "rgba(255,182,218,.05)",
        "--text": "#ffe4f0", "--text-dim": "#c9a0b8", "--text-mute": "#8a6b7e",
        "--border-soft": "1px solid rgba(255,110,180,.15)",
        "--glow": "0 0 24px rgba(255,110,180,.4)"
      }
    },
    ocean: {
      name: "🌊 Ocean",
      desc: "Tiefsee · Türkis + Grün",
      dark: true,
      colors: {
        "--p1": "#2ee6c8", "--p2": "#00b8a9", "--p3": "#4dd0e1",
        "--bg": "#041418", "--bg-2": "#0a2028",
        "--card": "rgba(46,230,200,.05)",
        "--text": "#d4f5ee", "--text-dim": "#8ab5aa", "--text-mute": "#5a7a72",
        "--border-soft": "1px solid rgba(46,230,200,.12)",
        "--glow": "0 0 24px rgba(46,230,200,.35)"
      }
    },
    forest: {
      name: "🌲 Forest",
      desc: "Wald · Grün + Erde",
      dark: true,
      colors: {
        "--p1": "#7ac74f", "--p2": "#4caf50", "--p3": "#d4a651",
        "--bg": "#0a1410", "--bg-2": "#12201a",
        "--card": "rgba(122,199,79,.05)",
        "--text": "#ddf5d4", "--text-dim": "#a8c29c", "--text-mute": "#5e7a54",
        "--border-soft": "1px solid rgba(122,199,79,.15)",
        "--glow": "0 0 24px rgba(122,199,79,.35)"
      }
    },
    /* 🆕 NEU */
    cyberpunk: {
      name: "🤖 Cyberpunk",
      desc: "Neon · Pink + Gelb auf Schwarz",
      dark: true,
      colors: {
        "--p1": "#ff2e97", "--p2": "#f7ff00", "--p3": "#00fff2",
        "--bg": "#050005", "--bg-2": "#0f0010",
        "--card": "rgba(255,46,151,.05)",
        "--text": "#f5f5ff", "--text-dim": "#b8b8c8", "--text-mute": "#666680",
        "--border-soft": "1px solid rgba(255,46,151,.25)",
        "--glow": "0 0 28px rgba(255,46,151,.5)"
      }
    },
    /* 🆕 NEU */
    sunset: {
      name: "🌅 Sunset",
      desc: "Sonnenuntergang · Orange + Rosa",
      dark: true,
      colors: {
        "--p1": "#ff7e5f", "--p2": "#feb47b", "--p3": "#e94e77",
        "--bg": "#1a0a08", "--bg-2": "#2a1410",
        "--card": "rgba(255,126,95,.05)",
        "--text": "#ffe8dc", "--text-dim": "#c8a89c", "--text-mute": "#8a6b5e",
        "--border-soft": "1px solid rgba(255,126,95,.2)",
        "--glow": "0 0 24px rgba(255,126,95,.45)"
      }
    }
  };

  var STORAGE_KEY = "haldo-theme";
  var ACCENT_KEY = "haldo-accent-override";
  var AUTO_KEY = "haldo-theme-auto";
  var APP_THEMES_KEY = "haldo-app-themes";

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
    if(!theme){ themeId = "peacock"; theme = THEMES.peacock; }

    var root = document.documentElement;
    Object.keys(theme.colors).forEach(function(k){
      root.style.setProperty(k, theme.colors[k]);
    });

    document.body.style.background = "linear-gradient(180deg, " + theme.colors["--bg"] + " 0%, " + theme.colors["--bg-2"] + " 100%)";
    document.body.style.color = theme.colors["--text"];
    document.body.style.minHeight = "100vh";
    document.body.style.transition = "background .35s ease, color .35s ease";

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

    /* Custom Akzent anwenden falls vorhanden */
    try {
      var customAccent = localStorage.getItem(ACCENT_KEY);
      if(customAccent){
        root.style.setProperty("--p1", customAccent);
      }
    } catch(e){}

    try {
      window.dispatchEvent(new CustomEvent("haldo:themechange", {
        detail: { theme: themeId, colors: theme.colors }
      }));
    } catch(e){}

    return theme;
  }

  function getCurrent(){
    try { return localStorage.getItem(STORAGE_KEY) || "peacock"; }
    catch(e){ return "peacock"; }
  }

  /* ═══════════════════════════════════════════════════════════
     🆕 AUTO-SWITCH NACH UHRZEIT
     ═══════════════════════════════════════════════════════════ */
  var autoTimer = null;

  function isAutoEnabled(){
    try { return localStorage.getItem(AUTO_KEY) === "1"; }
    catch(e){ return false; }
  }

  function setAuto(enabled){
    try {
      if(enabled) localStorage.setItem(AUTO_KEY, "1");
      else localStorage.removeItem(AUTO_KEY);
    } catch(e){}
    if(enabled) startAuto();
    else stopAuto();
  }

  function startAuto(){
    stopAuto();
    checkAutoNow();
    autoTimer = setInterval(checkAutoNow, 60000); /* jede Minute */
  }

  function stopAuto(){
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
  }

  function checkAutoNow(){
    if(!isAutoEnabled()) return;
    var h = new Date().getHours();
    var target = (h >= 6 && h < 20) ? "light" : "midnight";
    var cur = getCurrent();
    if(cur !== target){
      apply(target, { silent: true });
      try { localStorage.setItem(STORAGE_KEY, target); } catch(e){}
      if(window.HalDo && HalDo.Notify){
        HalDo.Notify.info("Auto-Theme: " + THEMES[target].name, { app: "theme" });
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     🆕 APP-SPEZIFISCHE THEMES
     ═══════════════════════════════════════════════════════════ */
  function getAppThemes(){
    try {
      return JSON.parse(localStorage.getItem(APP_THEMES_KEY) || "{}");
    } catch(e){ return {}; }
  }

  function setAppTheme(appId, themeId){
    var map = getAppThemes();
    if(themeId && THEMES[themeId]){
      map[appId] = themeId;
    } else {
      delete map[appId];
    }
    try { localStorage.setItem(APP_THEMES_KEY, JSON.stringify(map)); } catch(e){}
    try {
      window.dispatchEvent(new CustomEvent("haldo:appthemechange", {
        detail: { app: appId, theme: themeId }
      }));
    } catch(e){}
  }

  function getAppTheme(appId){
    var map = getAppThemes();
    return map[appId] || null;
  }

  function applyForApp(appId){
    var themeId = getAppTheme(appId);
    if(themeId && THEMES[themeId]){
      apply(themeId, { silent: true });
      return true;
    }
    /* zurück zum globalen Theme */
    apply(getCurrent(), { silent: true });
    return false;
  }

  /* ═══════════════════════════════════════════════════════════
     AUTO-LOAD beim Start
     ═══════════════════════════════════════════════════════════ */
  function autoLoad(){
    if(isAutoEnabled()){
      var h = new Date().getHours();
      var target = (h >= 6 && h < 20) ? "light" : "midnight";
      apply(target, { silent: true });
      try { localStorage.setItem(STORAGE_KEY, target); } catch(e){}
      startAuto();
    } else {
      apply(getCurrent(), { silent: true });
    }

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
     UI PANEL
     ═══════════════════════════════════════════════════════════ */
  function openPanel(){
    var existing = document.getElementById("haldoThemePanel");
    if(existing){ existing.remove(); return; }

    var current = getCurrent();
    var panel = document.createElement("div");
    panel.id = "haldoThemePanel";
    panel.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:haldoThemeFade .2s ease";

    var html = '<div style="max-width:560px;width:100%;max-height:88vh;overflow-y:auto;background:var(--bg-2);border:1px solid var(--border-soft);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.6)">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">'
      + '<div>'
      + '<div style="font-size:18px;font-weight:900;color:var(--p1)">🎨 Theme wählen</div>'
      + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">' + Object.keys(THEMES).length + ' Themes verfügbar</div>'
      + '</div>'
      + '<button id="haldoThemeClose" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:16px">✕</button>'
      + '</div>';

    /* Auto-Switch Banner */
    var autoOn = isAutoEnabled();
    html += '<div style="padding:12px;background:' + (autoOn ? "rgba(74,222,128,.1)" : "rgba(0,0,0,.2)") + ';border-radius:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ' + (autoOn ? "#4ade80" : "var(--text-mute)") + '">'
      + '<div>'
      + '<div style="font-size:12px;font-weight:900">🌗 Auto-Switch</div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">Hell (6-20) / Dunkel (20-6)</div>'
      + '</div>'
      + '<button id="haldoAutoToggle" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (autoOn ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (autoOn ? "#000" : "var(--text-dim)") + '">' + (autoOn ? "AN" : "AUS") + '</button>'
      + '</div>';

    /* Theme-Grid */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    Object.keys(THEMES).forEach(function(id){
      var t = THEMES[id];
      var isActive = id === current;
      var c = t.colors;
      html += '<button data-theme="' + id + '" style="padding:0;background:transparent;border:none;cursor:pointer;text-align:left;' + (isActive ? '' : 'opacity:.85;') + '">'
        + '<div style="padding:14px;background:linear-gradient(135deg,' + c["--bg"] + ',' + c["--bg-2"] + ');border-radius:14px;border:2px solid ' + (isActive ? c["--p1"] : "rgba(255,255,255,.1)") + ';position:relative;overflow:hidden;transition:.2s">'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<div style="width:18px;height:18px;border-radius:50%;background:' + c["--p1"] + ';box-shadow:0 0 12px ' + c["--p1"] + '"></div>'
        + '<div style="width:18px;height:18px;border-radius:50%;background:' + c["--p2"] + '"></div>'
        + '<div style="width:18px;height:18px;border-radius:50%;background:' + c["--p3"] + '"></div>'
        + '</div>'
        + '<div style="font-size:12.5px;font-weight:900;color:' + c["--text"] + '">' + _esc(t.name) + '</div>'
        + '<div style="font-size:10px;color:' + c["--text-mute"] + ';margin-top:2px">' + _esc(t.desc) + '</div>'
        + (isActive ? '<div style="position:absolute;top:10px;right:10px;font-size:16px">✅</div>' : '')
        + '</div></button>';
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
      + '</div></div>';

    /* App-Themes Info */
    var appThemeCount = Object.keys(getAppThemes()).length;
    html += '<div style="margin-top:16px;padding:12px;background:rgba(180,120,255,.08);border-radius:10px;border-left:3px solid var(--p3)">'
      + '<div style="font-size:11.5px;font-weight:900;color:var(--p3);margin-bottom:4px">🎭 App-spezifische Themes</div>'
      + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.6">'
      + (appThemeCount > 0
        ? '<b>' + appThemeCount + '</b> App' + (appThemeCount > 1 ? 's' : '') + ' mit eigenem Theme. Konfiguriere in <b>Einstellungen → Theme</b>.'
        : 'Öffne <b>Einstellungen → Theme</b> um Apps eigene Farben zu geben.')
      + '</div></div>';

    html += '<div style="margin-top:14px;padding:12px;background:rgba(0,229,255,.06);border-radius:10px;border-left:3px solid var(--p1)">'
      + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.6">'
      + '💡 Shortcut: <b>Strg + T</b> öffnet dieses Panel · Auto-Save aktiv'
      + '</div></div>';

    html += '</div>';
    panel.innerHTML = html;

    if(!document.getElementById("haldoThemeStyle")){
      var st = document.createElement("style");
      st.id = "haldoThemeStyle";
      st.textContent = "@keyframes haldoThemeFade{from{opacity:0}to{opacity:1}}";
      document.head.appendChild(st);
    }

    document.body.appendChild(panel);

    /* Events */
    panel.addEventListener("click", function(e){
      if(e.target === panel) panel.remove();
    });
    panel.querySelector("#haldoThemeClose").addEventListener("click", function(){ panel.remove(); });

    panel.querySelectorAll("[data-theme]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var id = btn.dataset.theme;
        setAuto(false); /* Auto aus bei manueller Wahl */
        apply(id);
        if(window.HalDo && HalDo.Voice) HalDo.Voice.speak(THEMES[id].name.replace(/[^\w\sÄÖÜäöü]/g, "").trim() + " aktiviert");
        if(window.HalDo && HalDo.Notify) HalDo.Notify.success("Theme: " + THEMES[id].name, { app: "theme" });
        panel.remove();
      });
    });

    panel.querySelector("#haldoAutoToggle").addEventListener("click", function(){
      var newState = !isAutoEnabled();
      setAuto(newState);
      if(window.HalDo && HalDo.Notify) HalDo.Notify.info(newState ? "Auto-Switch AN" : "Auto-Switch AUS", { app: "theme" });
      panel.remove();
      setTimeout(openPanel, 100);
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
     FLOATING BUTTON
     ═══════════════════════════════════════════════════════════ */
  function injectFab(){
    if(document.getElementById("haldoThemeFab")) return;

    var fab = document.createElement("button");
    fab.id = "haldoThemeFab";
    fab.title = "Theme wechseln (Strg+T)";
    fab.innerHTML = "🎨";
    fab.style.cssText = "position:fixed;bottom:80px;right:16px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--p1),var(--p3));border:none;color:#000;font-size:20px;cursor:pointer;z-index:9998;box-shadow:var(--glow),0 8px 24px rgba(0,0,0,.4);transition:.2s;display:flex;align-items:center;justify-content:center";

    fab.addEventListener("mouseenter", function(){ fab.style.transform = "scale(1.1) rotate(15deg)"; });
    fab.addEventListener("mouseleave", function(){ fab.style.transform = ""; });
    fab.addEventListener("click", openPanel);

    document.body.appendChild(fab);
  }

  /* ═══════════════════════════════════════════════════════════
     KEYBOARD SHORTCUT
     ═══════════════════════════════════════════════════════════ */
  document.addEventListener("keydown", function(e){
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t" && !e.shiftKey){
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
    /* Auto-Switch */
    isAuto: isAutoEnabled,
    setAuto: setAuto,
    /* Akzent */
    setAccent: function(color){
      document.documentElement.style.setProperty("--p1", color);
      try { localStorage.setItem(ACCENT_KEY, color); } catch(e){}
    },
    resetAccent: function(){
      try { localStorage.removeItem(ACCENT_KEY); } catch(e){}
      apply(getCurrent());
    },
    /* App-Themes */
    getAppThemes: getAppThemes,
    getAppTheme: getAppTheme,
    setAppTheme: setAppTheme,
    applyForApp: applyForApp
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(injectFab, 800); });
  } else {
    setTimeout(injectFab, 800);
  }

  console.log("🎨 theme.js geladen — " + Object.keys(THEMES).length + " Themes + Auto-Switch + App-Themes");
})();
