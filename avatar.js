/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AVATAR WIDGET (v170)
   Draggable · Animiert · 3 Modi · Klickbar → Chat
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var el = null, bubbleEl = null;
  var dragging = false;
  var blinkTimer = null;

  function injectStyles(){
    if(document.getElementById("haldoAvatarStyle")) return;
    var st = document.createElement("style");
    st.id = "haldoAvatarStyle";
    st.textContent = `
      #haldoAvatar {
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 8500;
        cursor: pointer;
        display: none;
        touch-action: none;
        transition: transform .2s;
      }
      #haldoAvatar.show { display: block; }
      #haldoAvatar.floating { animation: avatarFloat 4s ease-in-out infinite; }
      #haldoAvatar:hover { transform: scale(1.1); }
      @keyframes avatarFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      #haldoAvatar .avatar-stage {
        width: 90px;
        height: 90px;
        position: relative;
        filter: drop-shadow(0 8px 24px rgba(0,229,255,.5));
      }
      #haldoAvatar svg { width: 100%; height: 100%; overflow: visible; }
      #haldoAvatar.mode-cyborg .avatar-head { fill: #2a3a54; }
      #haldoAvatar.mode-cyborg .avatar-hair { fill: #1a2338; }
      #haldoAvatar.mode-cyborg .avatar-eye { fill: #00e5ff; }
      #haldoAvatar.mode-cyborg .avatar-pupil { fill: #003a55; }
      #haldoAvatar.mode-human .avatar-head { fill: #f0c8a8; }
      #haldoAvatar.mode-human .avatar-hair { fill: #3a2418; }
      #haldoAvatar.mode-human .avatar-eye { fill: #fff; }
      #haldoAvatar.mode-human .avatar-pupil { fill: #1a1a2e; }
      #haldoAvatar.mode-hologram .avatar-head { fill: rgba(0,229,255,.15); stroke: #00e5ff; stroke-width: 1.5; }
      #haldoAvatar.mode-hologram .avatar-hair { fill: rgba(180,120,255,.3); }
      #haldoAvatar.mode-hologram .avatar-eye { fill: #00e5ff; }
      #haldoAvatar.mode-hologram .avatar-pupil { fill: rgba(0,0,0,.4); }
      #haldoAvatar.blink .avatar-eye-group { animation: avatarBlink .15s ease; }
      @keyframes avatarBlink {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(.05); }
      }
      #haldoAvatar.speaking .avatar-mouth { animation: avatarTalk .35s ease-in-out infinite; }
      @keyframes avatarTalk {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(1.8); }
      }
      #haldoAvatar .bubble {
        position: absolute;
        top: -12px;
        right: -8px;
        background: var(--bg-2);
        border: 1px solid var(--p1);
        color: var(--p1);
        padding: 5px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        opacity: 0;
        transform: scale(.5);
        transition: .3s;
        pointer-events: none;
        z-index: 3;
        box-shadow: 0 4px 16px rgba(0,229,255,.3);
      }
      #haldoAvatar .bubble.show {
        opacity: 1;
        transform: scale(1);
      }
      #haldoAvatar.mode-hologram::before {
        content: "";
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,229,255,.3) 0%, transparent 70%);
        animation: hologramPulse 2s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes hologramPulse {
        0%, 100% { opacity: .3; }
        50% { opacity: .7; }
      }
    `;
    document.head.appendChild(st);
  }

  function buildAvatar(){
    if(el) return;
    injectStyles();

    el = document.createElement("div");
    el.id = "haldoAvatar";
    el.className = "mode-human floating show";

    el.innerHTML = `
      <div class="bubble" id="haldoAvatarBubble"></div>
      <div class="avatar-stage">
        <svg viewBox="0 0 200 200">
          <rect x="85" y="145" width="30" height="25" rx="5" class="avatar-head"/>
          <path d="M 40 200 Q 50 160 85 155 L 115 155 Q 150 160 160 200 Z" class="avatar-head" opacity=".85"/>
          <ellipse cx="100" cy="100" rx="55" ry="60" class="avatar-head"/>
          <path d="M 45 85 Q 50 35 100 30 Q 150 35 155 85 Q 145 65 130 60 Q 120 50 100 48 Q 80 50 70 60 Q 55 65 45 85 Z" class="avatar-hair"/>
          <g class="avatar-eye-group">
            <ellipse cx="80" cy="100" rx="11" ry="13" class="avatar-eye"/>
            <circle cx="80" cy="102" r="6" class="avatar-pupil"/>
          </g>
          <g class="avatar-eye-group">
            <ellipse cx="120" cy="100" rx="11" ry="13" class="avatar-eye"/>
            <circle cx="120" cy="102" r="6" class="avatar-pupil"/>
          </g>
          <path d="M 100 105 L 96 118 Q 100 121 104 118 Z" fill="rgba(0,0,0,.12)"/>
          <ellipse cx="100" cy="135" rx="20" ry="6" class="avatar-mouth" fill="currentColor" opacity=".5"/>
        </svg>
      </div>
    `;

    document.body.appendChild(el);
    bubbleEl = document.getElementById("haldoAvatarBubble");

    /* Klick → Chat öffnen (oder App "ai"/"chat") */
    el.addEventListener("click", function(e){
      if(dragging) return;
      if(window.HalDoDeskpane){
        if(HalDo.Apps && HalDo.Apps.has("ai")) HalDo.Apps.open("ai");
        else if(HalDo.Apps && HalDo.Apps.has("chat")) HalDo.Apps.open("chat");
      }
      showBubble("💬", 1500);
    });

    /* Drag */
    var startX, startY, startLeft, startTop, moved = false;
    el.addEventListener("pointerdown", function(e){
      if(e.button !== 0 && e.pointerType !== "touch") return;
      dragging = false;
      moved = false;
      var r = el.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = r.left;
      startTop = r.top;
      el.setPointerCapture(e.pointerId);
      el._d = { sx: startX, sy: startY, sl: startLeft, st: startTop };
    });
    el.addEventListener("pointermove", function(e){
      if(!el._d) return;
      var dx = e.clientX - el._d.sx;
      var dy = e.clientY - el._d.sy;
      if(Math.abs(dx) > 6 || Math.abs(dy) > 6){
        dragging = true;
        moved = true;
        var x = el._d.sl + dx;
        var y = el._d.st + dy;
        x = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - el.offsetHeight - 60, y));
        el.style.right = "auto";
        el.style.bottom = "auto";
        el.style.left = x + "px";
        el.style.top = y + "px";
      }
    });
    el.addEventListener("pointerup", function(){
      if(el._d && moved){
        try { localStorage.setItem("haldo:avatarPos", JSON.stringify({ x: parseInt(el.style.left), y: parseInt(el.style.top) })); } catch(e){}
      }
      setTimeout(function(){ dragging = false; }, 50);
      el._d = null;
    });

    /* Position aus localStorage */
    try {
      var pos = JSON.parse(localStorage.getItem("haldo:avatarPos") || "null");
      if(pos){
        el.style.right = "auto";
        el.style.bottom = "auto";
        el.style.left = pos.x + "px";
        el.style.top = pos.y + "px";
      }
    } catch(e){}

    /* Blink-Loop */
    startBlinking();

    /* Modus aus Store */
    var mode = HalDo.Store.get("avatarMode", "human");
    var floating = HalDo.Store.get("avatarFloating", true);
    setMode(mode);
    setFloating(floating);

    /* Begrüßung nach kurzer Zeit */
    setTimeout(function(){
      var h = new Date().getHours();
      var greet = h < 11 ? "Guten Morgen" : h < 17 ? "Guten Tag" : h < 22 ? "Guten Abend" : "Gute Nacht";
      showBubble("👋 " + greet, 3000);
    }, 2000);
  }

  function startBlinking(){
    function blink(){
      if(!el) return;
      el.classList.add("blink");
      setTimeout(function(){ el.classList.remove("blink"); }, 160);
      blinkTimer = setTimeout(blink, 2500 + Math.random() * 4000);
    }
    blinkTimer = setTimeout(blink, 2000);
  }

  function showBubble(text, dur){
    if(!bubbleEl) return;
    bubbleEl.textContent = text;
    bubbleEl.classList.add("show");
    clearTimeout(bubbleEl._t);
    bubbleEl._t = setTimeout(function(){
      bubbleEl.classList.remove("show");
    }, dur || 2000);
  }

  function setMode(mode){
    if(!el) return;
    el.classList.remove("mode-human", "mode-cyborg", "mode-hologram");
    el.classList.add("mode-" + (mode || "human"));
    HalDo.Store.set("avatarMode", mode || "human");
  }

  function setFloating(on){
    if(!el) return;
    el.classList.toggle("floating", !!on);
    HalDo.Store.set("avatarFloating", !!on);
  }

  function setVisible(on){
    if(!el) return;
    el.classList.toggle("show", !!on);
    HalDo.Store.set("avatarVisible", !!on);
  }

  function setState(state){
    if(!el) return;
    el.classList.remove("speaking", "thinking", "listening");
    if(state) el.classList.add(state);
  }

  /* Auto-Init wenn DOM steht */
  function init(){
    var visible = HalDo.Store.get("avatarVisible", true);
    if(visible){
      buildAvatar();
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 1500); });
  } else {
    setTimeout(init, 1500);
  }

  /* Global API */
  window.HalDoAvatar = {
    show: function(){ buildAvatar(); setVisible(true); },
    hide: function(){ setVisible(false); },
    setMode: setMode,
    setFloating: setFloating,
    setVisible: setVisible,
    setState: setState,
    showBubble: showBubble,
    getElement: function(){ return el; }
  };

  console.log("🦚 avatar.js v170 geladen — animiert + draggable");
})();
