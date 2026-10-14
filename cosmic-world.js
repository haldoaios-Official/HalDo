/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — COSMIC WORLD (v150)
   Sonne · Planeten · Uhr · Sterne · Interaktion
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.CosmicWorld = (function(){
  "use strict";

  var canvas, ctx, w, h;
  var animId = null;
  var theme = "kosmos";
  var speedFactor = 0.25;
  var clockOn = true;
  var t = 0;
  var stars = [];
  var sunR = 90;
  var sunHover = false;
  var sunPulse = 0;
  var sunScreen = {x:0, y:0, r:0};
  var planets = [];
  var angles = [];
  var planetScreen = [];

  /* Uhr-Planeten */
  var clockHands = [
    {type:"second", d:950, size:9,  color:"#ff4040", glow:"rgba(255,64,64,.8)"},
    {type:"minute", d:1010, size:11, color:"#40c4ff", glow:"rgba(64,196,255,.8)"},
    {type:"hour",   d:1070, size:13, color:"#ffd54f", glow:"rgba(255,213,79,.8)"}
  ];

  var GOLD = 2.399963;

  /* ─────────── Planeten aus Registry laden ─────────── */
  function loadPlanetsFromRegistry(){
    planets = [];
    if(!window.HalDo.Registry) return;

    var apps = HalDo.Registry.all().filter(function(a){ return a.planet !== false; });

    /* Abstände + Geschwindigkeiten + Größen realistisch verteilen */
    var dBase = 135;
    var dStep = 60;
    apps.forEach(function(app, i){
      planets.push({
        app: app.id,
        d: dBase + i * dStep,
        speed: Math.max(0.15, 2.2 - i * 0.14),
        size: 10 + Math.min(6, Math.floor(i / 3)),
        color: app.planetColor || "#4da8ff",
        rot: 1.0 + (i % 3) * 0.15,
        rotAngle: Math.random() * 6.28,
        type: ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"][i % 8]
      });
    });

    angles = planets.map(function(_, i){ return (i * GOLD) % (Math.PI * 2) + 0.3; });
  }

  /* ─────────── Sterne ─────────── */
  function initStars(){
    stars = [];
    for(var i = 0; i < 260; i++){
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.8 + 0.3,
        tw: Math.random() * Math.PI * 2
      });
    }
  }

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    w = canvas.width;
    h = canvas.height;
  }

  /* ─────────── Planet zeichnen ─────────── */
  function drawPlanet(x, y, r, pl){
    var glow = pl.color ? hexToRgba(pl.color, 0.45) : null;
    if(glow){
      var g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 3.2);
      g.addColorStop(0, glow);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    var grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
    grad.addColorStop(0, lighten(pl.color, 0.4));
    grad.addColorStop(0.55, pl.color);
    grad.addColorStop(1, darken(pl.color, 0.4));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if(pl.type === "earth"){
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      var rot = pl.rotAngle;
      for(var k = 0; k < 5; k++){
        var off = k * 1.3 + rot;
        var lx = x + Math.cos(off) * r * 0.55;
        var ly = y + Math.sin(k * 1.4) * r * 0.45;
        if(Math.cos(off) < -0.1) continue;
        ctx.fillStyle = k % 2 ? "rgba(72,152,88,.85)" : "rgba(60,120,60,.75)";
        ctx.beginPath();
        ctx.ellipse(lx, ly, r * 0.28, r * 0.22, off * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if(pl.type === "jupiter"){
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(x, y);
      ctx.rotate(pl.rotAngle);
      for(var b = -3; b <= 3; b++){
        ctx.fillStyle = b % 2 ? "rgba(255,255,255,.15)" : "rgba(120,70,40,.3)";
        ctx.fillRect(-r * 1.2, b * r * 0.28, r * 2.4, r * 0.16);
      }
      ctx.restore();
    }

    if(pl.type === "saturn"){
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.4);
      ctx.strokeStyle = hexToRgba(pl.color, 0.65);
      ctx.lineWidth = r * 0.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.85, r * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ─────────── Uhr-Planet ─────────── */
  function drawClockPlanet(cx, cy, scale, hand, now){
    var ang;
    if(hand.type === "second") ang = (now.getSeconds() + now.getMilliseconds() / 1000) / 60 * Math.PI * 2 - Math.PI / 2;
    else if(hand.type === "minute") ang = (now.getMinutes() + now.getSeconds() / 60) / 60 * Math.PI * 2 - Math.PI / 2;
    else ang = ((now.getHours() % 12) + now.getMinutes() / 60) / 12 * Math.PI * 2 - Math.PI / 2;

    var orbitR = hand.d * scale;
    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();

    var px = cx + Math.cos(ang) * orbitR;
    var py = cy + Math.sin(ang) * orbitR;
    var r = hand.size * scale;

    var g = ctx.createRadialGradient(px, py, r * 0.4, px, py, r * 3.5);
    g.addColorStop(0, hand.glow);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    var pg = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r);
    pg.addColorStop(0, "#fff");
    pg.addColorStop(0.4, hand.color);
    pg.addColorStop(1, "#000");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ─────────── Haupt-Zeichnen ─────────── */
  function drawKosmos(){
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, w, h);

    /* Sterne */
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      var a = 0.4 + Math.sin(t * 0.03 + s.tw) * 0.4;
      ctx.fillStyle = "rgba(180,220,255," + a + ")";
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    var cx = w / 2, cy = h / 2;
    var scale = Math.min(1.2, Math.max(0.28, Math.min(w, h) / 1500));

    /* Sonne */
    sunScreen = {x: cx, y: cy, r: sunR * scale};
    var pulse = 1 + Math.sin(sunPulse) * 0.05;
    var sr = sunR * scale * pulse;
    var sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr * 2.4);
    sg.addColorStop(0, "#fffae0");
    sg.addColorStop(0.1, "#ffe080");
    sg.addColorStop(0.3, "#ffb030");
    sg.addColorStop(0.55, "rgba(255,140,40,.4)");
    sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, sr * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe080";
    ctx.beginPath();
    ctx.arc(cx, cy, sr, 0, Math.PI * 2);
    ctx.fill();

    if(sunHover){
      ctx.strokeStyle = "rgba(255,255,255,.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, sr * 1.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    sunPulse += 0.08;

    /* Planeten */
    planetScreen = [];
    for(var p = 0; p < planets.length; p++){
      var pl = planets[p];
      var orbitR = pl.d * scale;
      ctx.strokeStyle = "rgba(0,229,255,.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.stroke();

      var px = cx + Math.cos(angles[p]) * orbitR;
      var py = cy + Math.sin(angles[p]) * orbitR;
      drawPlanet(px, py, pl.size * scale * 0.9, pl);
      planetScreen.push({x: px, y: py, r: pl.size * scale * 0.9 + 8, app: pl.app});
      angles[p] += pl.speed * speedFactor * 0.03;
      pl.rotAngle += pl.rot * speedFactor * 0.035;
    }

    /* Uhr-Planeten */
    if(clockOn){
      var now = new Date();
      for(var ci = 0; ci < clockHands.length; ci++){
        drawClockPlanet(cx, cy, scale, clockHands[ci], now);
      }
    }

    t += 1;
  }

  function drawErde(){
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, w, h);
    /* minimal: nur Sterne */
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      ctx.fillStyle = "rgba(180,220,255,.5)";
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    sunScreen = {x:0, y:0, r:0};
    planetScreen = [];
    t += 1;
  }

  function drawHolo(){
    ctx.clearRect(0, 0, w, h);
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      var a = 0.3 + Math.sin(t * 0.03 + i) * 0.3;
      ctx.fillStyle = "rgba(0,229,255," + a + ")";
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    sunScreen = {x:0, y:0, r:0};
    planetScreen = [];
    t += 1;
  }

  function loop(){
    if(theme === "kosmos") drawKosmos();
    else if(theme === "erde") drawErde();
    else drawHolo();
    animId = requestAnimationFrame(loop);
  }

  /* ─────────── Klick-Handler ─────────── */
  function onClick(e){
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    /* Planeten prüfen */
    for(var i = 0; i < planetScreen.length; i++){
      var p = planetScreen[i];
      var dx = x - p.x, dy = y - p.y;
      if(dx * dx + dy * dy <= p.r * p.r){
        if(p.app && window.HalDo.Router) HalDo.Router.open(p.app);
        return;
      }
    }
    /* Sonne prüfen */
    if(theme === "kosmos"){
      var dx2 = x - sunScreen.x, dy2 = y - sunScreen.y;
      if(dx2 * dx2 + dy2 * dy2 <= (sunScreen.r * 1.7) * (sunScreen.r * 1.7)){
        if(window.HalDo.Router) HalDo.Router.open("haldoai");
        return;
      }
    }
  }

  function onMove(e){
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var hover = false;

    if(theme === "kosmos"){
      var dx2 = x - sunScreen.x, dy2 = y - sunScreen.y;
      if(dx2 * dx2 + dy2 * dy2 <= (sunScreen.r * 1.7) * (sunScreen.r * 1.7)) hover = true;
    }
    for(var i = 0; i < planetScreen.length; i++){
      var p = planetScreen[i];
      var dx = x - p.x, dy = y - p.y;
      if(dx * dx + dy * dy <= p.r * p.r) hover = true;
    }
    sunHover = hover;
    canvas.style.cursor = hover ? "pointer" : "crosshair";
  }

  /* ─────────── Farb-Helfer ─────────── */
  function hexToRgba(hex, a){
    if(!hex) return "rgba(0,229,255," + a + ")";
    if(hex.indexOf("rgb") === 0) return hex;
    hex = hex.replace("#", "");
    if(hex.length === 3) hex = hex.split("").map(function(c){ return c + c; }).join("");
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  function lighten(hex, f){
    return _adjust(hex, f);
  }
  function darken(hex, f){
    return _adjust(hex, -f);
  }
  function _adjust(hex, f){
    if(!hex) return "#4da8ff";
    hex = hex.replace("#", "");
    if(hex.length === 3) hex = hex.split("").map(function(c){ return c + c; }).join("");
    var r = Math.min(255, Math.max(0, parseInt(hex.substring(0,2), 16) + Math.round(255 * f)));
    var g = Math.min(255, Math.max(0, parseInt(hex.substring(2,4), 16) + Math.round(255 * f)));
    var b = Math.min(255, Math.max(0, parseInt(hex.substring(4,6), 16) + Math.round(255 * f)));
    return "#" + r.toString(16).padStart(2,"0") + g.toString(16).padStart(2,"0") + b.toString(16).padStart(2,"0");
  }

  /* ─────────── Setter ─────────── */
  function setTheme(th, spd, ck){
    if(th) theme = th;
    if(typeof spd === "number") speedFactor = spd * 0.05;
    if(typeof ck === "boolean") clockOn = ck;
  }

  function applyConfig(){
    var cfg = window.HalDo.Config.get();
    theme = cfg.theme || "kosmos";
    speedFactor = (cfg.planetSpeed || 5) * 0.05;
    clockOn = cfg.clockOn !== false;
  }

  /* ─────────── Init ─────────── */
  function init(){
    canvas = document.getElementById("bgCanvas");
    if(!canvas){
      if(window.HalDo.Kernel) HalDo.Kernel.log("⚠ bgCanvas nicht gefunden", "warn");
      return;
    }
    ctx = canvas.getContext("2d");
    resize();
    initStars();
    loadPlanetsFromRegistry();
    applyConfig();

    window.addEventListener("resize", resize);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMove);

    if(animId) cancelAnimationFrame(animId);
    loop();

    if(window.HalDo.Kernel) HalDo.Kernel.log("Cosmic World gestartet (" + planets.length + " Planeten)");
  }

  return {
    init: init,
    setTheme: setTheme,
    applyConfig: applyConfig
  };
})();

console.log("🦚 cosmic-world.js geladen");
