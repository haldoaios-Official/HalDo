/* HALDO v164 — Living Angel Emblem
   Enhances the original logo.png in the existing welcome stage.
   Keeps the user's source image untouched; adds an animated golden aura,
   orbiting light and subtle feather opening movement to the existing wings. */
(function(w,d){
"use strict";
if(w.HalDoAngelEmblemLoaded)return;
w.HalDoAngelEmblemLoaded=true;
var ID="haldo-v164-angel-emblem-style",OVERLAY="haldo-v161-welcome";
function install(){
 if(d.getElementById(ID))return;
 var s=d.createElement("style");s.id=ID;
 s.textContent=`
 #${OVERLAY} .h161-stage{perspective:900px}
 #${OVERLAY} .h161-wings{z-index:2;overflow:visible}
 #${OVERLAY} .h161-wings g:first-of-type path{
   transform-box:fill-box;will-change:transform,filter;
   filter:drop-shadow(0 0 5px rgba(255,222,151,.38))
 }
 #${OVERLAY} .h161-wings g:first-of-type path:first-child{
   transform-origin:100% 82%;animation:h164-left-wing 6.2s ease-in-out infinite
 }
 #${OVERLAY} .h161-wings g:first-of-type path:last-child{
   transform-origin:0% 82%;animation:h164-right-wing 6.2s ease-in-out infinite
 }
 #${OVERLAY} .h164-emblem{
   position:relative;z-index:4;width:clamp(140px,18vw,202px);
   aspect-ratio:1;display:grid;place-items:center;isolation:isolate;
   transform:translateZ(22px);animation:h164-emblem-float 5.2s ease-in-out infinite
 }
 #${OVERLAY} .h164-emblem:before{
   content:"";position:absolute;inset:-17%;border-radius:50%;z-index:-2;
   background:conic-gradient(from 0deg,transparent 0 8%,rgba(255,225,151,.78) 12%,transparent 17% 38%,rgba(255,242,198,.68) 43%,transparent 48% 70%,rgba(255,201,105,.76) 76%,transparent 82%);
   filter:blur(8px);opacity:.72;animation:h164-aura-spin 24s linear infinite
 }
 #${OVERLAY} .h164-emblem:after{
   content:"";position:absolute;inset:-7%;border-radius:50%;z-index:-1;
   border:1px solid rgba(255,225,160,.8);
   box-shadow:0 0 10px rgba(255,219,139,.72),0 0 28px rgba(255,177,70,.42),inset 0 0 18px rgba(255,231,170,.22);
   animation:h164-ring-breathe 3.8s ease-in-out infinite
 }
 #${OVERLAY} .h164-emblem .h161-portrait{
   display:block;width:100%;height:100%;border-radius:50%;
   border:3px solid #ffe5a6;object-fit:cover;object-position:50% 24%;
   box-shadow:0 0 0 5px rgba(255,224,157,.15),0 0 24px rgba(255,199,99,.65),
     0 0 58px rgba(255,174,65,.34),0 16px 36px rgba(0,0,0,.42);
   animation:h164-portrait-light 4.6s ease-in-out infinite;
   backface-visibility:hidden
 }
 #${OVERLAY} .h164-emblem .h164-glint{
   position:absolute;inset:0;border-radius:50%;pointer-events:none;overflow:hidden
 }
 #${OVERLAY} .h164-emblem .h164-glint:after{
   content:"";position:absolute;top:-35%;left:-80%;width:48%;height:170%;
   transform:rotate(24deg);
   background:linear-gradient(90deg,transparent,rgba(255,250,222,.7),transparent);
   filter:blur(5px);animation:h164-glint-pass 5.8s ease-in-out infinite
 }
 #${OVERLAY} .h164-emblem .h164-star{
   position:absolute;width:7px;height:7px;border-radius:50%;
   background:#fff3c9;box-shadow:0 0 8px 3px rgba(255,210,117,.8);
   pointer-events:none
 }
 #${OVERLAY} .h164-emblem .h164-star.one{top:3%;right:13%;animation:h164-star-one 3.6s ease-in-out infinite}
 #${OVERLAY} .h164-emblem .h164-star.two{bottom:12%;left:1%;width:5px;height:5px;animation:h164-star-two 4.2s ease-in-out infinite}
 #${OVERLAY} .h161-halo{z-index:1}
 @keyframes h164-left-wing{0%,100%{transform:rotate(-1deg) scaleX(.99)}48%{transform:rotate(-4deg) scaleX(1.035)}}
 @keyframes h164-right-wing{0%,100%{transform:rotate(1deg) scaleX(.99)}48%{transform:rotate(4deg) scaleX(1.035)}}
 @keyframes h164-emblem-float{0%,100%{transform:translateY(1px) translateZ(22px)}50%{transform:translateY(-7px) translateZ(22px)}}
 @keyframes h164-aura-spin{to{transform:rotate(360deg)}}
 @keyframes h164-ring-breathe{0%,100%{transform:scale(.97);opacity:.72}50%{transform:scale(1.055);opacity:1}}
 @keyframes h164-portrait-light{0%,100%{filter:brightness(1) saturate(1.04)}50%{filter:brightness(1.09) saturate(1.16)}}
 @keyframes h164-glint-pass{0%,18%{left:-80%;opacity:0}32%{opacity:.9}58%,100%{left:145%;opacity:0}}
 @keyframes h164-star-one{0%,100%{transform:scale(.55);opacity:.45}50%{transform:scale(1.35);opacity:1}}
 @keyframes h164-star-two{0%,100%{transform:translate(0,0) scale(.65);opacity:.35}50%{transform:translate(5px,-8px) scale(1.2);opacity:1}}
 @media(max-width:620px){#${OVERLAY} .h164-emblem{width:clamp(126px,39vw,160px)}}
 @media(prefers-reduced-motion:reduce){
  #${OVERLAY} .h164-emblem,#${OVERLAY} .h164-emblem:before,
  #${OVERLAY} .h164-emblem:after,#${OVERLAY} .h164-emblem *,
  #${OVERLAY} .h161-wings g:first-of-type path{animation:none!important}
 }
 `;
 d.head.appendChild(s);
}
function decorate(){
 var root=d.getElementById(OVERLAY),stage=root&&root.querySelector(".h161-stage");
 if(!stage||stage.dataset.h164Emblem==="1")return;
 var portrait=stage.querySelector(".h161-portrait");
 if(!portrait)return;
 install();
 var wrap=d.createElement("div");wrap.className="h164-emblem";
 portrait.parentNode.insertBefore(wrap,portrait);
 wrap.appendChild(portrait);
 var glint=d.createElement("span");glint.className="h164-glint";glint.setAttribute("aria-hidden","true");wrap.appendChild(glint);
 ["one","two"].forEach(function(n){var star=d.createElement("i");star.className="h164-star "+n;star.setAttribute("aria-hidden","true");wrap.appendChild(star);});
 stage.dataset.h164Emblem="1";
}
function scan(){decorate();}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",function(){scan();new MutationObserver(scan).observe(d.body,{childList:true,subtree:true});},{once:true});
else{scan();new MutationObserver(scan).observe(d.body,{childList:true,subtree:true});}
console.info("[HalDo v164] Original logo.png now appears as a living golden angel emblem.");
})(window,document);
