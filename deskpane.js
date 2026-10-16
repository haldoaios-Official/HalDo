/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DESKPANE (v160) · Fenster-Manager
   Drag · Resize · Minimize · Maximize · Snap · Multi-Window
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  var windows = {};      /* id -> { el, app, state, z } */
  var zCounter = 100;
  var deskEl = null;

  /* ═══════════════════════════════════════════════════════════
     STYLES
     ═══════════════════════════════════════════════════════════ */
  function injectStyles(){
    if(document.getElementById("haldoDeskpaneStyle")) return;
    var st = document.createElement("style");
    st.id = "haldoDeskpaneStyle";
    st.textContent = `
      #haldo-desk {
        position: fixed;
        top: 56px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 500;
      }
      .haldo-win {
        position: absolute;
        background: var(--bg-2);
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(0,229,255,.08);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
        animation: winOpen .25s cubic-bezier(.34,1.56,.64,1);
        min-width: 280px;
        min-height: 200px;
      }
      .haldo-win.minimized {
        display: none;
      }
      .haldo-win.maximized {
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0;
        border: none;
      }
      @keyframes winOpen {
        from { opacity: 0; transform: scale(.92); }
        to { opacity: 1; transform: scale(1); }
      }
      .haldo-win-titlebar {
        padding: 10px 14px;
        background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
        border-bottom: 1px solid var(--border-soft);
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: move;
        user-select: none;
        flex-shrink: 0;
        min-height: 40px;
      }
      .haldo-win-title {
        font-size: 12.5px;
        font-weight: 900;
        color: var(--p1);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .haldo-win-controls {
        display: flex;
        gap: 6px;
      }
      .haldo-win-btn {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        border: none;
        background: rgba(0,0,0,.3);
        color: var(--text-dim);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: .15s;
        font-family: inherit;
      }
      .haldo-win-btn:hover { background: rgba(255,255,255,.1); color: var(--text); }
      .haldo-win-btn.close:hover { background: #ff4d4d; color: #fff; }
      .haldo-win-body {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        scrollbar-width: thin;
      }
      .haldo-win-body::-webkit-scrollbar { width: 6px; }
      .haldo-win-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }

      /* Resize-Handles */
      .haldo-resize {
        position: absolute;
        z-index: 10;
      }
      .haldo-resize-n  { top: -3px; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
      .haldo-resize-s  { bottom: -3px; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
      .haldo-resize-e  { right: -3px; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
      .haldo-resize-w  { left: -3px; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
      .haldo-resize-ne { top: -3px; right: -3px; width: 12px; height: 12px; cursor: nesw-resize; }
      .haldo-resize-nw { top: -3px; left: -3px; width: 12px; height: 12px; cursor: nwse-resize; }
      .haldo-resize-se { bottom: -3px; right: -3px; width: 12px; height: 12px; cursor: nwse-resize; }
      .haldo-resize-sw { bottom: -3px; left: -3px; width: 12px; height: 12px; cursor: nesw-resize; }

      /* Taskbar */
      #haldo-taskbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 56px;
        background: rgba(10,15,26,.95);
        backdrop-filter: blur(12px);
        border-top: 1px solid var(--border-soft);
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 12px;
        overflow-x: auto;
        z-index: 800;
        scrollbar-width: none;
      }
      #haldo-taskbar::-webkit-scrollbar { display: none; }
      #haldo-taskbar:empty { display: none; }
      .haldo-task-item {
        padding: 8px 14px;
        background: rgba(0,0,0,.3);
        border: 1px solid var(--border-soft);
        border-radius: 10px;
        color: var(--text-dim);
        cursor: pointer;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
        transition: .15s;
        font-family: inherit;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .haldo-task-item:hover { background: rgba(0,229,255,.1); color: var(--p1); }
      .haldo-task-item.active { background: linear-gradient(135deg, var(--p1), var(--p3)); color: #000; }
    `;
    document.head.appendChild(st);
  }

  /* ═══════════════════════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════════════════════ */
  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function isMobile(){ return window.innerWidth < 768; }

  /* ═══════════════════════════════════════════════════════════
     DESK INIT
     ═══════════════════════════════════════════════════════════ */
  function ensureDesk(){
    if(deskEl && document.body.contains(deskEl)) return deskEl;
    injectStyles();
    deskEl = document.getElementById("haldo-desk");
    if(!deskEl){
      deskEl = document.createElement("div");
      deskEl.id = "haldo-desk";
      document.body.appendChild(deskEl);
    }
    /* Taskbar */
    if(!document.getElementById("haldo-taskbar")){
      var tb = document.createElement("div");
      tb.id = "haldo-taskbar";
      document.body.appendChild(tb);
    }
    return deskEl;
  }

  /* ═══════════════════════════════════════════════════════════
     FENSTER ÖFFNEN
     ═══════════════════════════════════════════════════════════ */
  function openWindow(app){
    ensureDesk();

    /* Wenn schon offen → in den Vordergrund */
    if(windows[app.id]){
      bringToFront(app.id);
      if(windows[app.id].state === "minimized"){
        restoreWindow(app.id);
      }
      return;
    }

    /* Größe & Position */
    var w = Math.min(720, window.innerWidth - 40);
    var h = Math.min(600, window.innerHeight - 120);
    var left, top;

    if(isMobile()){
      w = window.innerWidth;
      h = window.innerHeight - 56;
      left = 0;
      top = 0;
    } else {
      /* Leicht versetzt für jedes neue Fenster */
      var count = Object.keys(windows).length;
      left = 40 + (count * 30) % 200;
      top = 30 + (count * 30) % 150;
    }

    var win = document.createElement("div");
    win.className = "haldo-win";
    if(isMobile()) win.classList.add("maximized");
    win.dataset.appId = app.id;
    win.style.left = left + "px";
    win.style.top = top + "px";
    win.style.width = w + "px";
    win.style.height = h + "px";

    win.innerHTML =
      '<div class="haldo-win-titlebar">'
      + '<div class="haldo-win-title">' + _esc(app.icon) + ' ' + _esc(app.name) + '</div>'
      + '<div class="haldo-win-controls">'
      + '<button class="haldo-win-btn" data-action="minimize" title="Minimieren">−</button>'
      + '<button class="haldo-win-btn" data-action="maximize" title="Maximieren">□</button>'
      + '<button class="haldo-win-btn close" data-action="close" title="Schließen">✕</button>'
      + '</div>'
      + '</div>'
      + '<div class="haldo-win-body"></div>'
      + '<div class="haldo-resize haldo-resize-n" data-resize="n"></div>'
      + '<div class="haldo-resize haldo-resize-s" data-resize="s"></div>'
      + '<div class="haldo-resize haldo-resize-e" data-resize="e"></div>'
      + '<div class="haldo-resize haldo-resize-w" data-resize="w"></div>'
      + '<div class="haldo-resize haldo-resize-ne" data-resize="ne"></div>'
      + '<div class="haldo-resize haldo-resize-nw" data-resize="nw"></div>'
      + '<div class="haldo-resize haldo-resize-se" data-resize="se"></div>'
      + '<div class="haldo-resize haldo-resize-sw" data-resize="sw"></div>';

    deskEl.appendChild(win);

    windows[app.id] = {
      el: win,
      app: app,
      state: "open",
      z: ++zCounter,
      prevRect: null
    };

    win.style.zIndex = zCounter;

    /* Content rendern */
    var body = win.querySelector(".haldo-win-body");
    var ctx = {
      store: HalDo.Store.scope(app.id),
      appId: app.id, app: app, HalDo: HalDo
    };

    try {
      app.render(body, ctx);
    } catch(e){
      console.error("Render-Fehler " + app.id + ":", e);
      body.innerHTML = '<div style="padding:14px;color:#ff8080;font-size:12px">'
        + '<b>Fehler:</b> ' + _esc(String(e.message || e)) + '</div>';
    }

    /* Events */
    bindDrag(win, win.querySelector(".haldo-win-titlebar"));
    bindResize(win);
    bindControls(win, app.id);
    win.addEventListener("mousedown", function(){ bringToFront(app.id); });

    updateTaskbar();
    console.log("🪟 Fenster geöffnet: " + app.name);
  }

  /* ═══════════════════════════════════════════════════════════
     DRAG
     ═══════════════════════════════════════════════════════════ */
  function bindDrag(win, handle){
    var startX, startY, startLeft, startTop, dragging = false;

    handle.addEventListener("mousedown", function(e){
      if(e.target.closest(".haldo-win-btn")) return;
      if(win.classList.contains("maximized")) return;
      if(isMobile()) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(win.style.left) || 0;
      startTop = parseInt(win.style.top) || 0;
      e.preventDefault();
    });

    document.addEventListener("mousemove", function(e){
      if(!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newLeft = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx));
      var newTop = Math.max(0, Math.min(window.innerHeight - 100, startTop + dy));
      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
    });

    document.addEventListener("mouseup", function(){
      dragging = false;
    });

    /* Touch-Support */
    handle.addEventListener("touchstart", function(e){
      if(e.touches.length !== 1) return;
      if(win.classList.contains("maximized")) return;
      if(isMobile()) return;
      dragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startLeft = parseInt(win.style.left) || 0;
      startTop = parseInt(win.style.top) || 0;
    }, { passive: true });

    document.addEventListener("touchmove", function(e){
      if(!dragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      win.style.left = Math.max(0, startLeft + dx) + "px";
      win.style.top = Math.max(0, startTop + dy) + "px";
    }, { passive: true });

    document.addEventListener("touchend", function(){
      dragging = false;
    });
  }

  /* ═══════════════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════════════ */
  function bindResize(win){
    win.querySelectorAll("[data-resize]").forEach(function(handle){
      var dir = handle.dataset.resize;

      function onDown(e){
        if(win.classList.contains("maximized")) return;
        if(isMobile()) return;
        e.preventDefault();
        e.stopPropagation();

        var startX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        var startY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
        var rect = {
          left: parseInt(win.style.left) || 0,
          top: parseInt(win.style.top) || 0,
          width: parseInt(win.style.width) || 400,
          height: parseInt(win.style.height) || 300
        };
        var minW = 280, minH = 200;

        function onMove(e2){
          var cx = e2.clientX !== undefined ? e2.clientX : e2.touches[0].clientX;
          var cy = e2.clientY !== undefined ? e2.clientY : e2.touches[0].clientY;
          var dx = cx - startX;
          var dy = cy - startY;

          var newL = rect.left, newT = rect.top, newW = rect.width, newH = rect.height;

          if(dir.indexOf("e") !== -1) newW = Math.max(minW, rect.width + dx);
          if(dir.indexOf("s") !== -1) newH = Math.max(minH, rect.height + dy);
          if(dir.indexOf("w") !== -1){
            newW = Math.max(minW, rect.width - dx);
            newL = rect.left + (rect.width - newW);
          }
          if(dir.indexOf("n") !== -1){
            newH = Math.max(minH, rect.height - dy);
            newT = rect.top + (rect.height - newH);
          }

          win.style.left = newL + "px";
          win.style.top = newT + "px";
          win.style.width = newW + "px";
          win.style.height = newH + "px";
        }

        function onUp(){
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          document.removeEventListener("touchmove", onMove);
          document.removeEventListener("touchend", onUp);
        }

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onUp);
      }

      handle.addEventListener("mousedown", onDown);
      handle.addEventListener("touchstart", onDown, { passive: false });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CONTROLS
     ═══════════════════════════════════════════════════════════ */
  function bindControls(win, appId){
    win.querySelectorAll(".haldo-win-btn").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var action = btn.dataset.action;
        if(action === "close") closeWindow(appId);
        else if(action === "minimize") minimizeWindow(appId);
        else if(action === "maximize") toggleMaximize(appId);
      });
    });
  }

  function bringToFront(appId){
    var w = windows[appId];
    if(!w) return;
    w.z = ++zCounter;
    w.el.style.zIndex = w.z;
    updateTaskbar();
  }

  function closeWindow(appId){
    var w = windows[appId];
    if(!w) return;
    w.el.style.animation = "winOpen .15s reverse";
    setTimeout(function(){
      if(w.el.parentNode) w.el.parentNode.removeChild(w.el);
    }, 140);
    delete windows[appId];
    updateTaskbar();
  }

  function minimizeWindow(appId){
    var w = windows[appId];
    if(!w) return;
    w.state = "minimized";
    w.el.classList.add("minimized");
    updateTaskbar();
  }

  function restoreWindow(appId){
    var w = windows[appId];
    if(!w) return;
    w.state = "open";
    w.el.classList.remove("minimized");
    bringToFront(appId);
  }

  function toggleMaximize(appId){
    var w = windows[appId];
    if(!w) return;
    if(w.el.classList.contains("maximized")){
      /* Restore */
      w.el.classList.remove("maximized");
      if(w.prevRect){
        w.el.style.left = w.prevRect.left;
        w.el.style.top = w.prevRect.top;
        w.el.style.width = w.prevRect.width;
        w.el.style.height = w.prevRect.height;
      }
    } else {
      /* Save */
      w.prevRect = {
        left: w.el.style.left,
        top: w.el.style.top,
        width: w.el.style.width,
        height: w.el.style.height
      };
      w.el.classList.add("maximized");
    }
  }

  /* ═══════════════════════════════════════════════════════════
     TASKBAR
     ═══════════════════════════════════════════════════════════ */
  function updateTaskbar(){
    var tb = document.getElementById("haldo-taskbar");
    if(!tb) return;
    var ids = Object.keys(windows);
    if(!ids.length){
      tb.innerHTML = "";
      return;
    }
    var topZ = 0, topId = null;
    ids.forEach(function(id){
      if(windows[id].z > topZ){ topZ = windows[id].z; topId = id; }
    });
    var html = "";
    ids.forEach(function(id){
      var w = windows[id];
      var isActive = id === topId && w.state !== "minimized";
      html += '<button class="haldo-task-item' + (isActive ? " active" : "") + '" data-task="' + id + '">'
        + _esc(w.app.icon) + ' ' + _esc(w.app.name)
        + '</button>';
    });
    tb.innerHTML = html;
    tb.querySelectorAll("[data-task]").forEach(function(el){
      el.addEventListener("click", function(){
        var id = el.dataset.task;
        var w = windows[id];
        if(!w) return;
        if(w.state === "minimized" || w.z !== topZ){
          restoreWindow(id);
        } else {
          minimizeWindow(id);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.Deskpane = {
    open: openWindow,
    close: closeWindow,
    minimize: minimizeWindow,
    maximize: toggleMaximize,
    restore: restoreWindow,
    list: function(){ return Object.keys(windows); },
    windows: windows,
    closeAll: function(){
      Object.keys(windows).forEach(closeWindow);
    }
  };

  /* Shortcut */
  window.HalDoDeskpane = HalDo.Deskpane;

  /* Init wenn DOM steht */
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ensureDesk);
  } else {
    ensureDesk();
  }

  console.log("🦚 deskpane.js v160 geladen — Fenster-Manager aktiv");
})();
