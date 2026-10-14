/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WINDOW MANAGER (v150)
   Fenster · Drag · Resize · Focus · Maximize
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.WindowManager = (function(){
  "use strict";

  var _windows = {};     /* { appId: HTMLElement } */
  var _zBase = 100;
  var _openCount = 0;

    function _getDesktop(){
    var d = document.getElementById("desktop");
    if(!d){
      console.error("[WindowManager] #desktop fehlt!");
      // Fallback: erstelle einen
      d = document.createElement("div");
      d.id = "desktop";
      document.body.appendChild(d);
    }
    return d;
  }
  function _getApp(appId){ return window.HalDo.Registry ? HalDo.Registry.get(appId) : null; }

  /* ─────────── Fenster erstellen ─────────── */
  function create(appId){
    var desktop = _getDesktop();
    if(!desktop){ console.warn("[WindowManager] #desktop fehlt"); return null; }

    var existing = _windows[appId];
    if(existing){ focus(appId); return existing.querySelector(".wbody"); }

    var app = _getApp(appId);
    if(!app) return null;

    var dRect = desktop.getBoundingClientRect();
    var isMobile = window.innerWidth < 600;
    var ww, wh;
    if(isMobile){ ww = dRect.width - 8; wh = dRect.height - 8; }
    else { ww = Math.min(dRect.width - 40, 700); wh = Math.min(dRect.height - 40, 720); }

    var off = (_openCount % 6) * 22;
    var cx = Math.max(8, (dRect.width - ww) / 2 + off - 40);
    var cy = Math.max(8, (dRect.height - wh) / 2 + off - 40);
    if(cx + ww > dRect.width - 8) cx = dRect.width - ww - 8;
    if(cy + wh > dRect.height - 8) cy = dRect.height - wh - 8;

    var win = document.createElement("div");
    win.className = "window focused";
    win.dataset.app = appId;
    win.style.width = ww + "px";
    win.style.height = wh + "px";
    win.style.left = cx + "px";
    win.style.top = cy + "px";
    win.style.zIndex = ++_zBase;
    _openCount++;

    win.innerHTML =
      '<div class="titlebar">'
      +  '<span class="ico">' + (app.ico || "📦") + '</span>'
      +  '<span class="title">' + _esc(app.name) + '</span>'
      +  '<div class="wbtns">'
      +    '<button class="wbtn voice" data-wbtn="voice" title="Stimme">🔊</button>'
      +    '<button class="wbtn set" data-wbtn="settings" title="Einstellungen">⚙️</button>'
      +    '<button class="wbtn max" data-wbtn="max" title="Maximieren">□</button>'
      +    '<button class="wbtn" data-wbtn="min" title="Minimieren">—</button>'
      +    '<button class="wbtn close" data-wbtn="close" title="Schließen">✕</button>'
      +  '</div>'
      + '</div>'
      + '<div class="wbody"></div>'
      + '<div class="resizer"></div>';

    desktop.appendChild(win);
    _windows[appId] = win;

    var hint = document.getElementById("hint");
    if(hint) hint.classList.add("hide");

    _bindWindow(win);

    return win.querySelector(".wbody");
  }

  /* ─────────── Events binden ─────────── */
  function _bindWindow(win){
    var appId = win.dataset.app;

    win.addEventListener("mousedown", function(){ focus(appId); });
    win.addEventListener("touchstart", function(){ focus(appId); }, {passive:true});

    /* Buttons */
    win.querySelectorAll("[data-wbtn]").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var action = btn.dataset.wbtn;
        if(action === "close") close(appId);
        else if(action === "min") minimize(appId);
        else if(action === "max") maximize(appId);
        else if(action === "settings") {
          if(window.HalDo.Config && HalDo.Config.getApp) {
            var app = _getApp(appId);
            if(app) _openAppSettings(appId, app);
          }
        }
        else if(action === "voice") {
          if(window.HalDo.Voice && HalDo.Voice.openPanel) HalDo.Voice.openPanel();
        }
      });
    });

    /* Drag */
    var titlebar = win.querySelector(".titlebar");
    var drag = false, sx = 0, sy = 0, ox = 0, oy = 0;
    function startDrag(e){
      if(e.target.closest(".wbtn")) return;
      drag = true;
      var p = e.touches ? e.touches[0] : e;
      sx = p.clientX; sy = p.clientY;
      var wr = win.getBoundingClientRect();
      var dr = _getDesktop().getBoundingClientRect();
      ox = wr.left - dr.left;
      oy = wr.top - dr.top;
      win.style.left = ox + "px";
      win.style.top = oy + "px";
      focus(appId);
      e.preventDefault();
    }
    function doDrag(e){
      if(!drag) return;
      var p = e.touches ? e.touches[0] : e;
      var dx = p.clientX - sx, dy = p.clientY - sy;
      var dr = _getDesktop().getBoundingClientRect();
      var ww = win.offsetWidth, wh = win.offsetHeight;
      win.style.left = Math.max(-ww * 0.4, Math.min(dr.width - ww * 0.6, ox + dx)) + "px";
      win.style.top = Math.max(-10, Math.min(dr.height - 50, oy + dy)) + "px";
    }
    function endDrag(){ drag = false; }

    titlebar.addEventListener("mousedown", startDrag);
    titlebar.addEventListener("touchstart", startDrag, {passive:false});
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("touchmove", doDrag, {passive:false});
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);

    /* Resize */
    var resizer = win.querySelector(".resizer");
    if(resizer){
      var rz = false, rsx = 0, rsy = 0, rw = 0, rh = 0;
      function startResize(e){
        rz = true;
        var p = e.touches ? e.touches[0] : e;
        rsx = p.clientX; rsy = p.clientY;
        rw = win.offsetWidth; rh = win.offsetHeight;
        e.preventDefault();
      }
      function doResize(e){
        if(!rz) return;
        var p = e.touches ? e.touches[0] : e;
        var dr = _getDesktop().getBoundingClientRect();
        var wr = win.getBoundingClientRect();
        win.style.width = Math.max(260, Math.min(dr.width - (wr.left - dr.left) + 8, rw + (p.clientX - rsx))) + "px";
        win.style.height = Math.max(200, Math.min(dr.height - (wr.top - dr.top) + 8, rh + (p.clientY - rsy))) + "px";
      }
      function endResize(){ rz = false; }
      resizer.addEventListener("mousedown", startResize);
      resizer.addEventListener("touchstart", startResize, {passive:false});
      document.addEventListener("mousemove", doResize);
      document.addEventListener("touchmove", doResize, {passive:false});
      document.addEventListener("mouseup", endResize);
      document.addEventListener("touchend", endResize);
    }
  }

  /* ─────────── Focus ─────────── */
  function focus(appId){
    Object.keys(_windows).forEach(function(id){
      _windows[id].classList.remove("focused");
    });
    var w = _windows[appId];
    if(w){
      w.classList.add("focused");
      w.classList.remove("minimized");
      w.style.zIndex = ++_zBase;
    }
  }

  /* ─────────── Minimize ─────────── */
  function minimize(appId){
    var w = _windows[appId];
    if(w) w.classList.add("minimized");
  }

  /* ─────────── Maximize ─────────── */
  function maximize(appId){
    var w = _windows[appId];
    if(w) w.classList.toggle("maximized");
  }

  /* ─────────── Close ─────────── */
  function close(appId){
    var w = _windows[appId];
    if(!w) return;
    w.remove();
    delete _windows[appId];

    if(window.HalDo.Runtime && HalDo.Runtime.stop){
      /* Runtime wird informiert (ohne Rekursion) */
    }
    if(Object.keys(_windows).length === 0){
      var hint = document.getElementById("hint");
      if(hint) hint.classList.remove("hide");
    }
    if(window.HalDo.Kernel) HalDo.Kernel.log("⏹ Fenster geschlossen: " + appId);
  }

  /* ─────────── App-Einstellungen Dialog ─────────── */
  function _openAppSettings(appId, app){
    var modal = document.getElementById("appSettings");
    if(!modal) return;
    var ico = document.getElementById("appSetIco");
    var title = document.getElementById("appSetTitle");
    var body = document.getElementById("appSetBody");
    if(ico) ico.textContent = app.ico;
    if(title) title.textContent = app.name + " — Einstellungen";

    var cur = HalDo.Config.getApp(appId, {color:"global", voice:""});
    var colors = [
      {k:"global", n:"Global", g:"linear-gradient(135deg,#00e5ff,#4da8ff)"},
      {k:"cyborg", n:"Cyborg", g:"linear-gradient(135deg,#ff78c8,#b478ff)"},
      {k:"green",  n:"Grün",   g:"linear-gradient(135deg,#22c55e,#10b981)"},
      {k:"orange", n:"Orange", g:"linear-gradient(135deg,#f59e0b,#ef4444)"},
      {k:"purple", n:"Lila",   g:"linear-gradient(135deg,#8b5cf6,#a855f7)"},
      {k:"pink",   n:"Rosa",   g:"linear-gradient(135deg,#ec4899,#f43f5e)"},
      {k:"gold",   n:"Gold",   g:"linear-gradient(135deg,#d8b478,#e8ca9a)"},
      {k:"dark",   n:"Dark",   g:"linear-gradient(135deg,#4a4a4a,#1a1a1a)"}
    ];
    var voices = (window.HalDo.Voice && HalDo.Voice.all) ? HalDo.Voice.all() : [];

    body.innerHTML =
      '<div class="group"><h3>🎨 App-Farbe</h3>'
      + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'
      + colors.map(function(c){
          return '<div data-acolor="'+c.k+'" style="padding:11px 6px;background:rgba(0,0,0,.25);border-radius:10px;border:2px solid '+(cur.color===c.k?"#fff":"transparent")+';cursor:pointer;text-align:center;font-size:10px;font-weight:800">'
            + '<div style="height:22px;border-radius:6px;background:'+c.g+';margin-bottom:5px"></div>'
            + c.n
            + '</div>';
        }).join("")
      + '</div></div>'
      + '<div class="group"><h3>🔊 Stimme für diese App</h3>'
      + '<div class="voice-grid">'
      + voices.map(function(v){
          return '<div class="voice-card'+(cur.voice===v.id?" active":"")+'" data-avoice="'+v.id+'">'
            + '<span class="emoji">'+v.emoji+'</span>'
            + '<div class="n">'+_esc(v.name)+'</div>'
            + '<div class="d">'+_esc(v.desc)+'</div>'
            + '</div>';
        }).join("")
      + '</div></div>'
      + '<button class="btn full" id="asSave">💾 Speichern</button>'
      + '<button class="btn sec full" id="asReset" style="margin-top:6px">🔄 Zurücksetzen</button>';

    body.querySelectorAll("[data-acolor]").forEach(function(el){
      el.addEventListener("click", function(){
        body.querySelectorAll("[data-acolor]").forEach(function(x){ x.style.borderColor = "transparent"; });
        el.style.borderColor = "#fff";
        cur.color = el.dataset.acolor;
      });
    });
    body.querySelectorAll("[data-avoice]").forEach(function(el){
      el.addEventListener("click", function(){
        body.querySelectorAll("[data-avoice]").forEach(function(x){ x.classList.remove("active"); });
        el.classList.add("active");
        cur.voice = el.dataset.avoice;
      });
    });
    document.getElementById("asSave").addEventListener("click", function(){
      HalDo.Config.setApp(appId, cur);
      toast("💾 Gespeichert");
      modal.classList.remove("show");
    });
    document.getElementById("asReset").addEventListener("click", function(){
      HalDo.Config.setApp(appId, {color:"global", voice:""});
      toast("🔄 Zurückgesetzt");
      modal.classList.remove("show");
    });

    modal.classList.add("show");
  }

  /* ─────────── Hilfsfunktionen ─────────── */
  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function toast(msg, type){
    var t = document.getElementById("toast");
    if(!t) return;
    t.textContent = msg;
    t.className = "show" + (type ? " " + type : "");
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.className = ""; }, 2400);
  }

  /* ─────────── Info ─────────── */
  function list(){ return Object.keys(_windows); }
  function isOpen(appId){ return !!_windows[appId]; }
  function count(){ return Object.keys(_windows).length; }
  function closeAll(){
    Object.keys(_windows).forEach(function(id){ close(id); });
  }

  function init(){
    if(window.HalDo.Kernel) HalDo.Kernel.log("Window Manager bereit");
  }

  return {
    init: init,
    create: create,
    focus: focus,
    minimize: minimize,
    maximize: maximize,
    close: close,
    list: list,
    isOpen: isOpen,
    count: count,
    closeAll: closeAll
  };
})();

console.log("🦚 window-manager.js geladen");
