/* ============================================================
   HALDO WELCOME MOTION — v163
   Ergänzt das bestehende v161-Welcome:
   - lebendige goldene Sonne und Lichtkranz
   - sanft driftende Sternen-/Lichtpartikel
   - dynamische Flügelbewegung
   - respektiert prefers-reduced-motion
   - verändert oder ersetzt logo.png NICHT
   ============================================================ */
(function(window,document){
  "use strict";
  if(window.HalDoWelcomeMotionLoaded) return;
  window.HalDoWelcomeMotionLoaded=true;

  var STYLE_ID="haldo-v163-welcome-motion-style";
  var OVERLAY_ID="haldo-v161-welcome";
  var active=null;

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${OVERLAY_ID} .h161-stage{isolation:isolate}
      #${OVERLAY_ID} .h163-stars{
        position:absolute;inset:-5% -3%;width:106%;height:110%;
        z-index:0;pointer-events:none;opacity:.95
      }
      #${OVERLAY_ID} .h163-sun{
        position:absolute;z-index:1;left:50%;top:50%;
        width:clamp(170px,23vw,260px);aspect-ratio:1;
        transform:translate(-50%,-50%);border-radius:50%;
        background:radial-gradient(circle at 48% 45%,
          #fffde8 0%,#fff0ad 12%,#ffd56e 27%,
          rgba(255,166,56,.72) 43%,rgba(255,130,35,.22) 61%,transparent 72%);
        filter:drop-shadow(0 0 22px rgba(255,211,112,.7))
               drop-shadow(0 0 55px rgba(255,151,53,.38));
        animation:h163-sun-pulse 4.8s ease-in-out infinite;
        pointer-events:none
      }
      #${OVERLAY_ID} .h163-sun:before{
        content:"";position:absolute;inset:-20%;border-radius:50%;
        background:repeating-conic-gradient(from 0deg,
          rgba(255,229,160,0) 0deg 7deg,
          rgba(255,220,140,.22) 8deg 9deg,
          rgba(255,229,160,0) 10deg 15deg);
        -webkit-mask:radial-gradient(circle,transparent 43%,#000 55%,transparent 76%);
        mask:radial-gradient(circle,transparent 43%,#000 55%,transparent 76%);
        animation:h163-rays 42s linear infinite
      }
      #${OVERLAY_ID} .h163-sun:after{
        content:"";position:absolute;inset:12%;border-radius:50%;
        border:1px solid rgba(255,246,205,.52);
        box-shadow:0 0 24px rgba(255,220,145,.34),inset 0 0 24px rgba(255,246,205,.18)
      }
      #${OVERLAY_ID} .h161-wings{
        z-index:2;transform-origin:50% 58%;
        filter:drop-shadow(0 0 17px rgba(255,205,112,.48));
        animation:h163-wings-alive 5.4s ease-in-out infinite!important
      }
      #${OVERLAY_ID} .h161-halo{z-index:1}
      #${OVERLAY_ID} .h161-portrait{z-index:3;animation:h163-portrait-float 5s ease-in-out infinite}
      #${OVERLAY_ID} .h161-title{position:relative;animation:h163-title-arrive 1.25s cubic-bezier(.2,.8,.2,1) both}
      #${OVERLAY_ID} .h161-copy{animation:h163-copy-arrive 1.5s .18s both}
      @keyframes h163-sun-pulse{
        0%,100%{filter:brightness(.96) drop-shadow(0 0 22px rgba(255,211,112,.62)) drop-shadow(0 0 48px rgba(255,151,53,.32));}
        50%{filter:brightness(1.13) drop-shadow(0 0 34px rgba(255,232,160,.86)) drop-shadow(0 0 76px rgba(255,151,53,.5));}
      }
      @keyframes h163-rays{to{transform:rotate(360deg)}}
      @keyframes h163-wings-alive{
        0%,100%{transform:translateY(3px) scaleY(.96) scaleX(.985)}
        25%{transform:translateY(-5px) scaleY(1.035) scaleX(1.015)}
        52%{transform:translateY(-1px) scaleY(1.01) scaleX(1)}
        76%{transform:translateY(2px) scaleY(.985) scaleX(.99)}
      }
      @keyframes h163-portrait-float{
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-5px)}
      }
      @keyframes h163-title-arrive{
        from{opacity:0;transform:translateY(18px);filter:blur(5px)}
        to{opacity:1;transform:translateY(0);filter:blur(0)}
      }
      @keyframes h163-copy-arrive{
        from{opacity:0;transform:translateY(12px)}
        to{opacity:1;transform:translateY(0)}
      }
      @media(max-width:620px){
        #${OVERLAY_ID} .h163-sun{width:clamp(150px,48vw,210px)}
      }
      @media(prefers-reduced-motion:reduce){
        #${OVERLAY_ID} .h163-sun,
        #${OVERLAY_ID} .h163-sun:before,
        #${OVERLAY_ID} .h161-wings,
        #${OVERLAY_ID} .h161-portrait,
        #${OVERLAY_ID} .h161-title,
        #${OVERLAY_ID} .h161-copy{animation:none!important}
        #${OVERLAY_ID} .h163-stars{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function decorate(root){
    if(!root||root.dataset.h163Decorated==="1") return;
    var stage=root.querySelector(".h161-stage");
    if(!stage) return;
    root.dataset.h163Decorated="1";
    addStyles();

    var sun=document.createElement("div");
    sun.className="h163-sun";
    sun.setAttribute("aria-hidden","true");
    stage.insertBefore(sun,stage.firstChild);

    var canvas=document.createElement("canvas");
    canvas.className="h163-stars";
    canvas.setAttribute("aria-hidden","true");
    stage.insertBefore(canvas,stage.firstChild);

    var ctx=canvas.getContext&&canvas.getContext("2d");
    if(!ctx||window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var rect,ratio= Math.min(window.devicePixelRatio||1,2),particles=[],frame=0,stopped=false;
    function resize(){
      rect=stage.getBoundingClientRect();
      canvas.width=Math.max(1,Math.floor(rect.width*ratio));
      canvas.height=Math.max(1,Math.floor(rect.height*ratio));
      canvas.style.width=rect.width+"px";
      canvas.style.height=rect.height+"px";
      ctx.setTransform(ratio,0,0,ratio,0,0);
      var count=Math.max(34,Math.min(88,Math.round(rect.width/8)));
      particles=Array.from({length:count},function(){
        return {x:Math.random()*rect.width,y:Math.random()*rect.height,
          r:.45+Math.random()*1.55,a:.18+Math.random()*.65,
          v:.08+Math.random()*.32,phase:Math.random()*Math.PI*2,
          gold:Math.random()>.42};
      });
    }
    function draw(){
      if(stopped||!root.isConnected){stopped=true;cancelAnimationFrame(frame);window.removeEventListener("resize",resize);return;}
      var w=rect.width,h=rect.height;
      ctx.clearRect(0,0,w,h);
      var t=performance.now()/1000;
      particles.forEach(function(p){
        p.y-=p.v;
        p.x+=Math.sin(t*.45+p.phase)*.12;
        if(p.y<-4){p.y=h+4;p.x=Math.random()*w;}
        var alpha=p.a*(.55+.45*Math.sin(t*1.8+p.phase));
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.gold?"rgba(255,220,145,"+alpha+")":"rgba(205,225,255,"+alpha+")";
        ctx.shadowBlur=p.r*5;
        ctx.shadowColor=p.gold?"rgba(255,198,90,.75)":"rgba(170,210,255,.7)";
        ctx.fill();
      });
      ctx.shadowBlur=0;
      frame=requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize",resize,{passive:true});
    active={root:root,stop:function(){stopped=true;cancelAnimationFrame(frame);window.removeEventListener("resize",resize);}};
    frame=requestAnimationFrame(draw);
  }

  function scan(){
    var root=document.getElementById(OVERLAY_ID);
    if(root) decorate(root);
  }
  if(document.body){
    var observer=new MutationObserver(scan);
    observer.observe(document.body,{childList:true,subtree:true});
    scan();
  }else{
    document.addEventListener("DOMContentLoaded",function(){
      var observer=new MutationObserver(scan);
      observer.observe(document.body,{childList:true,subtree:true});
      scan();
    },{once:true});
  }
  console.info("[HalDo v163] Welcome Motion bereit; Original logo.png bleibt erhalten.");
})(window,document);
