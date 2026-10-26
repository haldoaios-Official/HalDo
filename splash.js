/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SPLASH (v1.0)
   Pfau fliegt ein · Sonne scheint · Flügel öffnen · Willkommen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(document.getElementById("haldoSplashRoot")) return;
  if(window.__haldoSplashDone) return;
  window.__haldoSplashDone = true;

  // Google Fonts (fallback: serif)
  if(!document.getElementById("haldoSplashFonts")){
    var l = document.createElement("link");
    l.id = "haldoSplashFonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;1,600&display=swap";
    document.head.appendChild(l);
  }

  // Styles
  var st = document.createElement("style");
  st.id = "haldoSplashStyle";
  st.textContent = `
    #haldoSplashRoot{
      position:fixed;inset:0;z-index:99999;
      background:radial-gradient(ellipse at 50% 100%, #1a0f2e 0%, #0a0f1a 40%, #050810 75%, #000 100%);
      overflow:hidden;
      display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,"Segoe UI",Roboto,sans-serif;
      transition:opacity .8s;
    }
    #haldoSplashRoot *{box-sizing:border-box}
    .hs-stars{position:absolute;inset:0;pointer-events:none}
    .hs-star{position:absolute;background:#fff;border-radius:50%;animation:hsTwinkle 3s infinite ease-in-out}
    @keyframes hsTwinkle{0%,100%{opacity:.2}50%{opacity:.9}}

    .hs-stage{
      position:absolute;left:50%;top:50%;transform:translate(-50%,-55%);
      width:min(90vw,500px);height:min(90vw,500px);
      pointer-events:none;
    }

    /* Peacock wrapper flies in */
    .hs-peacock{
      position:absolute;inset:0;
      transform:translate(-50%,-100vh) scale(0.15);
      opacity:0;
      animation:hsFlyIn 2.2s cubic-bezier(.25,.46,.45,.94) .4s forwards;
      left:50%;top:0;
    }
    @keyframes hsFlyIn{
      0%{transform:translate(-50%,-100vh) scale(0.15);opacity:0}
      15%{opacity:1}
      100%{transform:translate(-50%,0) scale(1);opacity:1}
    }

    .hs-peacock svg{width:100%;height:100%;overflow:visible}

    .hs-feather{
      transform-origin:0 0;
      transform:rotate(0deg);
      opacity:0;
      animation:hsOpenFeather 1.3s cubic-bezier(.34,1.56,.64,1) forwards;
      animation-delay:calc(2.4s + var(--d,0s));
    }
    @keyframes hsOpenFeather{
      0%{transform:rotate(0deg);opacity:0}
      40%{opacity:1}
      100%{transform:rotate(var(--a,0deg));opacity:1}
    }

    .hs-sun{
      transform-origin:200px 260px;
      transform:scale(0.2);
      opacity:0;
      animation:hsSunRise 1.4s ease-out .15s forwards;
    }
    @keyframes hsSunRise{
      0%{transform:scale(0.2);opacity:0}
      70%{opacity:1}
      100%{transform:scale(1);opacity:1}
    }

    .hs-sunCore{
      filter:drop-shadow(0 0 20px #ffd54f) drop-shadow(0 0 45px #ff9800) drop-shadow(0 0 90px #d84315);
      animation:hsSunGlow 3s ease-in-out infinite alternate;
    }
    @keyframes hsSunGlow{
      from{filter:drop-shadow(0 0 20px #ffd54f) drop-shadow(0 0 45px #ff9800) drop-shadow(0 0 90px #d84315)}
      to{filter:drop-shadow(0 0 40px #ffd54f) drop-shadow(0 0 90px #ff9800) drop-shadow(0 0 180px #d84315)}
    }

    /* Text block at bottom */
    .hs-text{
      position:absolute;left:0;right:0;bottom:max(40px,env(safe-area-inset-bottom,0px) + 40px);
      text-align:center;z-index:5;pointer-events:none;
    }
    .hs-welcome{
      font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:600;
      font-size:clamp(16px,3.4vw,22px);color:#c8e6f0;letter-spacing:.15em;
      opacity:0;transform:translateY(20px);
      animation:hsTextIn 1.1s ease-out 3.4s forwards;
      text-shadow:0 2px 12px rgba(0,0,0,.6);
    }
    .hs-title{
      font-family:'Cinzel Decorative',serif;font-weight:900;
      font-size:clamp(44px,11vw,86px);
      background:linear-gradient(135deg,#ffe082 0%,#ffd54f 30%,#4dd0e1 70%,#00bcd4 100%);
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;color:transparent;
      letter-spacing:.03em;line-height:1;margin:6px 0;
      filter:drop-shadow(0 4px 16px rgba(255,183,0,.4));
      opacity:0;transform:translateY(20px);
      animation:hsTextIn 1.1s ease-out 3.9s forwards;
    }
    .hs-app{
      font-family:'Great Vibes',cursive;
      font-size:clamp(22px,5vw,32px);color:#ffd54f;
      letter-spacing:.05em;margin-top:4px;
      text-shadow:0 0 20px rgba(255,183,0,.6),0 2px 8px rgba(0,0,0,.7);
      opacity:0;transform:translateY(20px);
      animation:hsTextIn 1.1s ease-out 4.4s forwards;
    }
    @keyframes hsTextIn{
      to{opacity:1;transform:translateY(0)}
    }

    .hs-skip{
      position:absolute;bottom:max(12px,env(safe-area-inset-bottom,0px) + 12px);right:16px;
      font-size:11px;font-weight:700;color:rgba(255,255,255,.4);
      background:transparent;border:none;cursor:pointer;
      padding:8px 14px;border-radius:8px;z-index:10;font-family:inherit;
      animation:hsTextIn .6s ease-out 1.2s forwards;opacity:0;
    }
    .hs-skip:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.06)}
  `;
  document.head.appendChild(st);

  // Stars
  var starsHtml = "";
  for(var i=0;i<120;i++){
    var s = (Math.random()*2+1).toFixed(1);
    var x = (Math.random()*100).toFixed(2);
    var y = (Math.random()*100).toFixed(2);
    var d = (Math.random()*3).toFixed(2);
    starsHtml += '<div class="hs-star" style="width:'+s+'px;height:'+s+'px;left:'+x+'%;top:'+y+'%;animation-delay:'+d+'s"></div>';
  }

  // Feathers
  function genFeathers(){
    var total = 15;
    var out = "";
    for(var i=0;i<total;i++){
      var angle = -80 + (i * 160 / (total-1));
      var delay = (i*0.035).toFixed(3);
      out += '<g class="hs-feather" style="--a:'+angle+'deg;--d:'+delay+'s">'
        + '<ellipse cx="0" cy="-100" rx="16" ry="46" fill="url(#hsFG)" opacity="0.95"/>'
        + '<ellipse cx="0" cy="-93" rx="12" ry="36" fill="#0a2942"/>'
        + '<ellipse cx="0" cy="-90" rx="10" ry="29" fill="#00bcd4"/>'
        + '<ellipse cx="0" cy="-86" rx="7" ry="21" fill="#0a2942"/>'
        + '<ellipse cx="0" cy="-82" rx="5" ry="14" fill="#ffc107"/>'
        + '<ellipse cx="0" cy="-79" rx="3" ry="9" fill="#0a2942"/>'
        + '</g>';
    }
    return out;
  }

  // Root
  var root = document.createElement("div");
  root.id = "haldoSplashRoot";
  root.innerHTML = ''
    + '<div class="hs-stars">' + starsHtml + '</div>'
    + '<div class="hs-stage">'
    + '<div class="hs-peacock">'
    + '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">'
    +   '<defs>'
    +     '<radialGradient id="hsSun" cx="40%" cy="40%">'
    +       '<stop offset="0%" stop-color="#fffbe6"/>'
    +       '<stop offset="30%" stop-color="#ffd54f"/>'
    +       '<stop offset="65%" stop-color="#ff9800"/>'
    +       '<stop offset="100%" stop-color="#c53000"/>'
    +     '</radialGradient>'
    +     '<linearGradient id="hsFG" x1="0" y1="0" x2="0" y2="1">'
    +       '<stop offset="0%" stop-color="#4dd0e1"/>'
    +       '<stop offset="50%" stop-color="#00bcd4"/>'
    +       '<stop offset="100%" stop-color="#0d47a1"/>'
    +     '</linearGradient>'
    +     '<linearGradient id="hsBodyG" x1="0" y1="0" x2="0" y2="1">'
    +       '<stop offset="0%" stop-color="#1976d2"/>'
    +       '<stop offset="100%" stop-color="#0a2942"/>'
    +     '</linearGradient>'
    +   '</defs>'
    +   /* SUN (behind) */
    +   '<g class="hs-sun">'
    +     '<circle cx="200" cy="260" r="100" fill="url(#hsSun)" class="hs-sunCore"/>'
    +     '<circle cx="200" cy="260" r="100" fill="none" stroke="#ffd54f" stroke-width="2" opacity=".5"/>'
    +   '</g>'
    /* FEATHERS (fan) */
    +   '<g transform="translate(200,290)">' + genFeathers() + '</g>'
    /* BODY (front) */
    +   '<g>'
    +     '<ellipse cx="200" cy="280" rx="32" ry="58" fill="url(#hsBodyG)"/>'
    +     '<ellipse cx="200" cy="280" rx="20" ry="44" fill="#1565c0" opacity=".5"/>'
    +     '<circle cx="200" cy="212" r="20" fill="#1976d2"/>'
    +     '<circle cx="200" cy="212" r="20" fill="#1565c0" opacity=".4"/>'
    /* Crest */
    +     '<line x1="200" y1="196" x2="200" y2="176" stroke="#0d47a1" stroke-width="2.2"/>'
    +     '<circle cx="200" cy="172" r="3.5" fill="#00bcd4"/>'
    +     '<circle cx="200" cy="172" r="1.6" fill="#0a2942"/>'
    +     '<line x1="192" y1="198" x2="184" y2="180" stroke="#0d47a1" stroke-width="2"/>'
    +     '<circle cx="182" cy="176" r="3" fill="#00bcd4"/>'
    +     '<circle cx="182" cy="176" r="1.4" fill="#0a2942"/>'
    +     '<line x1="208" y1="198" x2="216" y2="180" stroke="#0d47a1" stroke-width="2"/>'
    +     '<circle cx="218" cy="176" r="3" fill="#00bcd4"/>'
    +     '<circle cx="218" cy="176" r="1.4" fill="#0a2942"/>'
    /* Eye */
    +     '<circle cx="207" cy="210" r="3" fill="#0a0a0a"/>'
    +     '<circle cx="208" cy="209" r="1.2" fill="#fff"/>'
    /* Beak */
    +     '<polygon points="215,214 228,216 215,219" fill="#ffa726"/>'
    +   '</g>'
    + '</svg>'
    + '</div>'
    + '</div>'
    + '<div class="hs-text">'
    +   '<div class="hs-welcome">Willkommen</div>'
    +   '<div class="hs-title">HalDo</div>'
    +   '<div class="hs-app">Halil Donma App</div>'
    + '</div>'
    + '<button class="hs-skip" id="hsSkip">Überspringen →</button>';

  // Append when body ready
  function attach(){
    document.body.appendChild(root);
    var skip = document.getElementById("hsSkip");
    var fade = function(){
      root.style.opacity = "0";
      setTimeout(function(){ if(root.parentNode) root.parentNode.removeChild(root); }, 850);
    };
    if(skip) skip.addEventListener("click", function(e){ e.stopPropagation(); fade(); });
    // Auto fade at 6.8s
    setTimeout(fade, 6800);
  }
  if(document.body) attach();
  else document.addEventListener("DOMContentLoaded", attach);
})();
