/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI AVATAR (v150)
   Lebendiger Avatar mit HUD · Pulse · Reaktion
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.AIAvatar = (function(){
  "use strict";

  var _container = null;
  var _state = "idle";   /* idle | thinking | speaking | listening */
  var _animFrame = null;
  var _t = 0;

  /* ─────────── SVG Avatar (halb Mensch, halb Hologramm) ─────────── */
  function _svg(){
    return ''
    + '<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
    +  '<defs>'
    +    '<radialGradient id="av-glow" cx="50%" cy="50%" r="50%">'
    +      '<stop offset="0%" stop-color="#00e5ff" stop-opacity="0.35"/>'
    +      '<stop offset="60%" stop-color="#4da8ff" stop-opacity="0.12"/>'
    +      '<stop offset="100%" stop-color="#02040a" stop-opacity="0"/>'
    +    '</radialGradient>'
    +    '<radialGradient id="av-face" cx="50%" cy="40%" r="65%">'
    +      '<stop offset="0%" stop-color="#e0f7ff"/>'
    +      '<stop offset="55%" stop-color="#9ec9e8"/>'
    +      '<stop offset="100%" stop-color="#4a6d8a"/>'
    +    '</radialGradient>'
    +    '<linearGradient id="av-hud" x1="0%" y1="0%" x2="100%" y2="100%">'
    +      '<stop offset="0%" stop-color="#00e5ff"/>'
    +      '<stop offset="50%" stop-color="#b478ff"/>'
    +      '<stop offset="100%" stop-color="#00e5ff"/>'
    +    '</linearGradient>'
    +    '<linearGradient id="av-neck" x1="0%" y1="0%" x2="0%" y2="100%">'
    +      '<stop offset="0%" stop-color="#2a4a6a"/>'
    +      '<stop offset="100%" stop-color="#0a1a3a"/>'
    +    '</linearGradient>'
    +    '<filter id="av-blur"><feGaussianBlur stdDeviation="2"/></filter>'
    +  '</defs>'

    /* Hintergrund-Glow */
    +  '<circle cx="160" cy="160" r="155" fill="url(#av-glow)"/>'

    /* Äußere HUD-Ringe (rotieren) */
    +  '<g id="av-rings" transform="translate(160 160)">'
    +    '<circle r="145" fill="none" stroke="url(#av-hud)" stroke-width="1" stroke-dasharray="4 8" opacity="0.5" class="av-ring-1"/>'
    +    '<circle r="130" fill="none" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="20 12" opacity="0.6" class="av-ring-2"/>'
    +    '<circle r="115" fill="none" stroke="#b478ff" stroke-width="1" opacity="0.4" class="av-ring-3"/>'
    +    /* Kleine Datenpunkte */
    +    '<g id="av-dots">'
    +      '<circle r="2" fill="#00e5ff" transform="translate(0 -145)"/>'
    +      '<circle r="2" fill="#00e5ff" transform="translate(100 -100)"/>'
    +      '<circle r="2" fill="#b478ff" transform="translate(145 0)"/>'
    +      '<circle r="2" fill="#4da8ff" transform="translate(100 100)"/>'
    +      '<circle r="2" fill="#00e5ff" transform="translate(0 145)"/>'
    +      '<circle r="2" fill="#b478ff" transform="translate(-100 100)"/>'
    +      '<circle r="2" fill="#4da8ff" transform="translate(-145 0)"/>'
    +      '<circle r="2" fill="#00e5ff" transform="translate(-100 -100)"/>'
    +    '</g>'
    +  '</g>'

    /* Hals / Cyber-Neck */
    +  '<path d="M 130 210 Q 160 230 190 210 L 195 240 Q 160 260 125 240 Z" fill="url(#av-neck)" stroke="#00e5ff" stroke-width="0.8" opacity="0.9"/>'
    +  '<g stroke="#00e5ff" stroke-width="0.6" opacity="0.7">'
    +    '<line x1="140" y1="215" x2="140" y2="240"/>'
    +    '<line x1="160" y1="220" x2="160" y2="250"/>'
    +    '<line x1="180" y1="215" x2="180" y2="240"/>'
    +  '</g>'

    /* Schultern */
    +  '<path d="M 60 285 Q 100 250 130 240 L 190 240 Q 220 250 260 285 Z" fill="url(#av-neck)" stroke="#00e5ff" stroke-width="1" opacity="0.9"/>'
    +  '<line x1="110" y1="258" x2="210" y2="258" stroke="#00e5ff" stroke-width="0.6" opacity="0.5"/>'

    /* Gesicht */
    +  '<ellipse cx="160" cy="130" rx="68" ry="82" fill="url(#av-face)"/>'

    /* Gesicht-Highlights (Hologramm-Effekt) */
    +  '<path d="M 160 48 Q 200 60 210 100" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>'
    +  '<path d="M 160 212 Q 120 200 110 160" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.5"/>'

    /* Hologramm-Scanlinien */
    +  '<g id="av-scan" opacity="0.15">'
    +    '<line x1="92" y1="70" x2="228" y2="70" stroke="#00e5ff" stroke-width="0.5"/>'
    +    '<line x1="92" y1="100" x2="228" y2="100" stroke="#00e5ff" stroke-width="0.5"/>'
    +    '<line x1="92" y1="130" x2="228" y2="130" stroke="#00e5ff" stroke-width="0.5"/>'
    +    '<line x1="92" y1="160" x2="228" y2="160" stroke="#00e5ff" stroke-width="0.5"/>'
    +    '<line x1="92" y1="190" x2="228" y2="190" stroke="#00e5ff" stroke-width="0.5"/>'
    +  '</g>'

    /* Augen */
    +  '<g id="av-eyes">'
    +    '<ellipse cx="135" cy="125" rx="9" ry="7" fill="#0a1a3a"/>'
    +    '<ellipse cx="185" cy="125" rx="9" ry="7" fill="#0a1a3a"/>'
    +    '<circle cx="135" cy="125" r="5" fill="#00e5ff" class="av-eye"/>'
    +    '<circle cx="185" cy="125" r="5" fill="#00e5ff" class="av-eye"/>'
    +    '<circle cx="133" cy="123" r="1.8" fill="#fff"/>'
    +    '<circle cx="183" cy="123" r="1.8" fill="#fff"/>'
    +  '</g>'

    /* Augenbrauen */
    +  '<path d="M 122 108 Q 135 103 148 108" fill="none" stroke="#2a4a6a" stroke-width="2" stroke-linecap="round"/>'
    +  '<path d="M 172 108 Q 185 103 198 108" fill="none" stroke="#2a4a6a" stroke-width="2" stroke-linecap="round"/>'

    /* Nase */
    +  '<path d="M 160 135 Q 158 155 155 165 Q 160 168 165 165 Q 162 155 160 135" fill="none" stroke="#5a7d9a" stroke-width="1.2" opacity="0.6"/>'

    /* Mund */
    +  '<path id="av-mouth" d="M 140 185 Q 160 192 180 185" fill="none" stroke="#8a3a4a" stroke-width="2" stroke-linecap="round"/>'

    /* HUD-Balken oben */
    +  '<g id="av-hud-top" opacity="0.7">'
    +    '<rect x="120" y="22" width="80" height="4" rx="2" fill="#00e5ff" opacity="0.6"/>'
    +    '<rect x="130" y="30" width="60" height="2" rx="1" fill="#4da8ff" opacity="0.5"/>'
    +  '</g>'

    /* Status-Text */
    +  '<text id="av-status" x="160" y="305" text-anchor="middle" fill="#00e5ff" font-family="ui-monospace,monospace" font-size="10" letter-spacing="2" opacity="0.8">READY</text>'
    + '</svg>';
  }

  /* ─────────── Animation ─────────── */
  function _animate(){
    _t += 0.05;

    /* HUD-Ringe rotieren */
    var r1 = document.querySelector(".av-ring-1");
    var r2 = document.querySelector(".av-ring-2");
    var r3 = document.querySelector(".av-ring-3");
    if(r1) r1.style.transform = "rotate(" + (Math.sin(_t * 0.3) * 20) + "deg)";
    if(r2) r2.style.transform = "rotate(" + (Math.cos(_t * 0.2) * 15) + "deg)";
    if(r3) r3.style.transform = "rotate(" + (Math.sin(_t * 0.1) * 10) + "deg)";

    /* Augen pulsieren */
    var eyes = document.querySelectorAll(".av-eye");
    var eyeScale = 1 + Math.sin(_t * 2) * 0.15;
    eyes.forEach(function(e){
      e.setAttribute("r", (5 * eyeScale).toFixed(2));
      e.style.opacity = 0.85 + Math.sin(_t * 2) * 0.15;
    });

    /* Scanlinien bewegen */
    var scan = document.getElementById("av-scan");
    if(scan) scan.setAttribute("transform", "translate(0 " + (Math.sin(_t * 0.8) * 4).toFixed(1) + ")");

    /* Status-Text */
    var st = document.getElementById("av-status");
    if(st){
      var sttext = "READY";
      if(_state === "thinking") sttext = "DENKT…";
      else if(_state === "speaking") sttext = "SPRICHT…";
      else if(_state === "listening") sttext = "HÖRT ZU…";
      st.textContent = sttext;
      st.style.opacity = 0.6 + Math.sin(_t * 3) * 0.3;
    }

    _animFrame = requestAnimationFrame(_animate);
  }

  /* ─────────── State setzen ─────────── */
  function setState(s){
    _state = s;
    if(_container) _container.classList.remove("av-idle", "av-thinking", "av-speaking", "av-listening");
    if(_container) _container.classList.add("av-" + s);
  }

  /* ─────────── Avatar erzeugen ─────────── */
  function create(container){
    if(!container) return null;

    /* Wrapper */
    container.innerHTML = '<div class="ai-avatar-wrap">'
      + '<div class="ai-avatar-hud">' + _svg() + '</div>'
      + '<div class="ai-avatar-ring"></div>'
      + '</div>';

    _container = container.querySelector(".ai-avatar-wrap");
    setState("idle");

    if(!_animFrame) _animate();
    return _container;
  }

  /* ─────────── Zerstören ─────────── */
  function destroy(){
    if(_animFrame){ cancelAnimationFrame(_animFrame); _animFrame = null; }
    _container = null;
  }

  /* ─────────── Öffentliche API ─────────── */
  return {
    create: create,
    destroy: destroy,
    setState: setState,
    state: function(){ return _state; }
  };
})();

/* ─────────── CSS für Avatar dynamisch hinzufügen ─────────── */
(function(){
  if(document.getElementById("ai-avatar-styles")) return;
  var s = document.createElement("style");
  s.id = "ai-avatar-styles";
  s.textContent = ''
    + '.ai-avatar-wrap{position:relative;width:100%;max-width:280px;margin:0 auto;aspect-ratio:1;filter:drop-shadow(0 0 30px rgba(0,229,255,.35))}'
    + '.ai-avatar-hud{width:100%;height:100%;transition:filter .4s}'
    + '.ai-avatar-ring{position:absolute;inset:-8%;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,rgba(0,229,255,.4) 90deg,transparent 180deg,rgba(180,120,255,.4) 270deg,transparent 360deg);animation:av-ring-spin 8s linear infinite;pointer-events:none;opacity:.4}'
    + '@keyframes av-ring-spin{to{transform:rotate(360deg)}}'
    + '.ai-avatar-wrap.av-thinking .ai-avatar-hud{filter:drop-shadow(0 0 40px rgba(180,120,255,.7))}'
    + '.ai-avatar-wrap.av-speaking .ai-avatar-hud{filter:drop-shadow(0 0 40px rgba(0,229,255,.9))}'
    + '.ai-avatar-wrap.av-listening .ai-avatar-hud{filter:drop-shadow(0 0 40px rgba(255,120,200,.7))}'
    + '#aiWindowBody{padding-top:10px}';
  document.head.appendChild(s);
})();

console.log("🦚 ai-avatar.js geladen");
