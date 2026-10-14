/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NOTIFY (v151)
   Toast-Benachrichtigungen · Info · Success · Warn · Error
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  if(!window.HalDo) window.HalDo = {};

  var container = null;

  function ensureContainer(){
    if(container && document.body.contains(container)) return container;

    container = document.createElement("div");
    container.id = "haldoNotifyContainer";
    container.style.cssText = "position:fixed;top:16px;right:16px;left:auto;max-width:340px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none";
    document.body.appendChild(container);

    /* Styles */
    if(!document.getElementById("haldoNotifyStyle")){
      var st = document.createElement("style");
      st.id = "haldoNotifyStyle";
      st.textContent = "@keyframes haldoNotifyIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}"
        + "@keyframes haldoNotifyOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(50px)}}";
      document.head.appendChild(st);
    }
    return container;
  }

  function playSound(type){
    try {
      var s = HalDo.Store && HalDo.Store.get("soundEnabled", true);
      if(!s) return;
      /* Mini-Beep via AudioContext */
      var ctx = window._haldoAudioCtx || (window._haldoAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = type === "error" ? 300 : type === "success" ? 800 : 500;
      gain.gain.value = 0.05;
      osc.start();
      setTimeout(function(){ osc.stop(); }, 100);
    } catch(e){ /* silent */ }
  }

  function show(type, msg, options){
    options = options || {};
    var col = {
      info: "#00e5ff",
      success: "#4ade80",
      warn: "#fbbf24",
      error: "#ff8080"
    }[type] || "#00e5ff";

    var icon = {
      info: "ℹ️",
      success: "✅",
      warn: "⚠️",
      error: "❌"
    }[type] || "ℹ️";

    var appLabel = options.app ? '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px;font-weight:800;text-transform:uppercase;letter-spacing:.5px">' + options.app + '</div>' : "";

    var el = document.createElement("div");
    el.style.cssText = "pointer-events:auto;padding:12px 14px;background:var(--bg-2);border:1px solid " + col + ";border-left:4px solid " + col + ";border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:haldoNotifyIn .25s ease;color:var(--text);display:flex;gap:10px;align-items:flex-start";
    el.innerHTML = '<div style="font-size:18px;flex-shrink:0">' + icon + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:12.5px;font-weight:800;line-height:1.4;word-break:break-word">' + String(msg || "") + '</div>'
      + appLabel
      + '</div>'
      + '<button style="background:transparent;border:none;color:var(--text-mute);cursor:pointer;font-size:14px;padding:0;flex-shrink:0">✕</button>';

    var c = ensureContainer();
    c.appendChild(el);

    var closed = false;
    function close(){
      if(closed) return;
      closed = true;
      el.style.animation = "haldoNotifyOut .25s ease";
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 250);
    }

    el.querySelector("button").addEventListener("click", close);

    var duration = options.duration || 3500;
    setTimeout(close, duration);

    if(HalDo.Store && HalDo.Store.get("soundEnabled", true)) playSound(type);

    /* Vibration */
    if(HalDo.Store && HalDo.Store.get("vibrateEnabled", false) && navigator.vibrate){
      try { navigator.vibrate(type === "error" ? [100,50,100] : 100); } catch(e){}
    }

    return close;
  }

  HalDo.Notify = {
    info: function(msg, opts){ return show("info", msg, opts); },
    success: function(msg, opts){ return show("success", msg, opts); },
    warn: function(msg, opts){ return show("warn", msg, opts); },
    error: function(msg, opts){ return show("error", msg, opts); },
    show: show
  };

  console.log("🦚 notify.js geladen");
})();
