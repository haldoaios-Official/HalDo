/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BILD STUDIO (v200)
   Zeichnen · Filter · Text · Formen · Ebenen · Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* ═══════════════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════════════ */
  var ST = {
    canvas: null, ctx: null,
    originalImg: null,
    baseImage: null,
    layers: [],
    activeLayer: 0,
    tool: "brush",
    color: "#00e5ff",
    size: 8,
    opacity: 1,
    isDrawing: false,
    lastX: 0, lastY: 0,
    filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0 },
    history: [],
    historyIdx: -1,
    startPos: null,
    tempShape: null
  };

  function snapshot(){
    if(!ST.canvas) return;
    ST.history = ST.history.slice(0, ST.historyIdx + 1);
    try {
      ST.history.push(ST.canvas.toDataURL("image/jpeg", 0.7));
      if(ST.history.length > 20) ST.history.shift();
      ST.historyIdx = ST.history.length - 1;
    } catch(e){}
  }

  function undo(){
    if(ST.historyIdx <= 0) return;
    ST.historyIdx--;
    loadSnapshot(ST.history[ST.historyIdx]);
  }
  function redo(){
    if(ST.historyIdx >= ST.history.length - 1) return;
    ST.historyIdx++;
    loadSnapshot(ST.history[ST.historyIdx]);
  }
  function loadSnapshot(dataUrl){
    var img = new Image();
    img.onload = function(){
      ST.ctx.clearRect(0, 0, ST.canvas.width, ST.canvas.height);
      ST.ctx.drawImage(img, 0, 0, ST.canvas.width, ST.canvas.height);
    };
    img.src = dataUrl;
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER UI
     ═══════════════════════════════════════════════════════════ */
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    function build(){
      var body = '';

      /* ═══ TABS ═══ */
      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-btab="studio">🎨 Studio</button>'
        + '<button class="tab' + (tab === "filter" ? " active" : "") + '" data-btab="filter">✨ Filter</button>'
        + '<button class="tab' + (tab === "galerie" ? " active" : "") + '" data-btab="galerie">🖼️ Galerie</button>'
        + '<button class="tab' + (tab === "settings" ? " active" : "") + '" data-btab="settings">⚙️</button>'
        + '</div>';

      /* ═══ STUDIO ═══ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:8px">'
          + '<canvas id="bs_canvas" style="width:100%;background:#000;border-radius:10px;display:block;cursor:crosshair;touch-action:none" width="800" height="600"></canvas>'
          + '</div>';

        /* Toolbar */
        body += '<div class="card" style="padding:10px">'
          + '<div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none">'
          + toolBtn("brush", "🖌️", "Pinsel", ST.tool === "brush")
          + toolBtn("eraser", "🧽", "Radierer", ST.tool === "eraser")
          + toolBtn("text", "🔤", "Text", ST.tool === "text")
          + toolBtn("rect", "▭", "Rechteck", ST.tool === "rect")
          + toolBtn("circle", "◯", "Kreis", ST.tool === "circle")
          + toolBtn("line", "╱", "Linie", ST.tool === "line")
          + toolBtn("spray", "💨", "Spray", ST.tool === "spray")
          + toolBtn("picker", "🎯", "Pipette", ST.tool === "picker")
          + '</div>'

          + '<div style="display:flex;gap:8px;align-items:center;margin-top:8px">'
          + '<input type="color" id="bs_color" value="' + ST.color + '" style="width:44px;height:36px;border:1px solid var(--border-soft);border-radius:8px;background:transparent;cursor:pointer">'
          + '<div style="flex:1">'
          + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-mute);font-weight:700"><span>Größe</span><span id="bs_sizeV">' + ST.size + 'px</span></div>'
          + '<input type="range" id="bs_size" min="1" max="100" value="' + ST.size + '" style="width:100%">'
          + '</div>'
          + '<div style="flex:1">'
          + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-mute);font-weight:700"><span>Deckkraft</span><span id="bs_opV">' + Math.round(ST.opacity * 100) + '%</span></div>'
          + '<input type="range" id="bs_opacity" min="1" max="100" value="' + (ST.opacity * 100) + '" style="width:100%">'
          + '</div>'
          + '</div>'

          + '<div style="display:flex;gap:6px;margin-top:10px">'
          + '<button class="btn sec" id="bs_undo" style="flex:1;font-size:11px">↶ Undo</button>'
          + '<button class="btn sec" id="bs_redo" style="flex:1;font-size:11px">↷ Redo</button>'
          + '<button class="btn sec" id="bs_clear" style="flex:1;font-size:11px">🗑️ Leeren</button>'
          + '</div>'
          + '</div>';

        /* Datei-Aktionen */
        body += '<div class="card">'
          + '<h3>📁 Aktionen</h3>'
          + '<input type="file" id="bs_upload" accept="image/*" style="display:none">'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + '<button class="btn" id="bs_uploadBtn" style="font-size:11px">📤 Bild laden</button>'
          + '<button class="btn sec" id="bs_save" style="font-size:11px">💾 Speichern</button>'
          + '<button class="btn sec" id="bs_rotate" style="font-size:11px">🔄 Drehen</button>'
          + '<button class="btn sec" id="bs_flip" style="font-size:11px">↔️ Spiegeln</button>'
          + '</div>'
          + '</div>';
      }

      /* ═══ FILTER ═══ */
      else if(tab === "filter"){
        var f = ST.filters;
        body += '<div class="card">'
          + '<h3>✨ Filter & Anpassungen</h3>'
          + filterSlider("Helligkeit", "brightness", f.brightness, 0, 200, "%")
          + filterSlider("Kontrast", "contrast", f.contrast, 0, 200, "%")
          + filterSlider("Sättigung", "saturate", f.saturate, 0, 300, "%")
          + filterSlider("Unschärfe", "blur", f.blur, 0, 20, "px")
          + filterSlider("S/W", "grayscale", f.grayscale, 0, 100, "%")
          + filterSlider("Sepia", "sepia", f.sepia, 0, 100, "%")
          + filterSlider("Farbton", "hue", f.hue, 0, 360, "°")
          + filterSlider("Invertieren", "invert", f.invert, 0, 100, "%")
          + '</div>';

        /* Presets */
        body += '<div class="card"><h3>🎭 Presets</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + presetBtn("Original", {brightness:100,contrast:100,saturate:100,blur:0,grayscale:0,sepia:0,hue:0,invert:0})
          + presetBtn("Vintage", {brightness:105,contrast:90,saturate:80,blur:0,grayscale:0,sepia:40,hue:0,invert:0})
          + presetBtn("S/W Klassik", {brightness:105,contrast:120,saturate:100,blur:0,grayscale:100,sepia:0,hue:0,invert:0})
          + presetBtn("Cyberpunk", {brightness:110,contrast:130,saturate:180,blur:0,grayscale:0,sepia:0,hue:290,invert:0})
          + presetBtn("Soft Dream", {brightness:110,contrast:80,saturate:120,blur:2,grayscale:0,sepia:0,hue:0,invert:0})
          + presetBtn("Neon", {brightness:115,contrast:150,saturate:200,blur:0,grayscale:0,sepia:0,hue:180,invert:0})
          + presetBtn("Invert", {brightness:100,contrast:100,saturate:100,blur:0,grayscale:0,sepia:0,hue:0,invert:100})
          + presetBtn("Kalt", {brightness:105,contrast:105,saturate:90,blur:0,grayscale:0,sepia:0,hue:200,invert:0})
          + '</div>'
          + '<button class="btn full" id="bs_applyFilter" style="margin-top:10px">✅ Filter anwenden</button>'
          + '</div>';
      }

      /* ═══ GALERIE ═══ */
      else if(tab === "galerie"){
        var imgs = HalDo.Store.get("bilder:items", []);
        body += '<div class="card"><h3>🖼️ Meine Bilder (' + imgs.length + ')</h3>';
        if(!imgs.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Noch keine Bilder gespeichert</div>';
        } else {
          body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
          imgs.forEach(function(url, i){
            body += '<div style="position:relative;aspect-ratio:1;background:rgba(0,0,0,.3);border-radius:10px;overflow:hidden;border:1px solid var(--border-soft)">'
              + '<img data-bload="' + i + '" src="' + _esc(url) + '" style="width:100%;height:100%;object-fit:cover;cursor:pointer">'
              + '<button data-bdel="' + i + '" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.7);border:none;color:#ff8080;cursor:pointer;border-radius:50%;width:22px;height:22px;font-size:11px">✕</button>'
              + '</div>';
          });
          body += '</div>';
        }
        body += '</div>';
      }

      /* ═══ SETTINGS ═══ */
      else if(tab === "settings"){
        var imgs2 = HalDo.Store.get("bilder:items", []);
        body += '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🖼️ GESPEICHERT</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + imgs2.length + ' Bilder</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-top:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.6">'
          + '🎨 <b>Full Canvas Studio:</b> Zeichne, filter, speichere alles lokal.'
          + '</div></div>'
          + '<button class="btn danger full" id="bs_clearAll" style="margin-top:10px">🗑️ Alle Bilder löschen</button>'
          + '</div>';
      }

      container.innerHTML = body;

      /* ═══════════════════════════════════════════════════════
         EVENT-BINDINGS
         ═══════════════════════════════════════════════════════ */

      /* Tabs */
      container.querySelectorAll("[data-btab]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.btab;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ STUDIO ═══ */
      if(tab === "studio"){
        var canvas = container.querySelector("#bs_canvas");
        ST.canvas = canvas;
        ST.ctx = canvas.getContext("2d");

        /* Wenn baseImage vorhanden, lade es */
        if(ST.baseImage){
          ST.ctx.drawImage(ST.baseImage, 0, 0, canvas.width, canvas.height);
        } else {
          /* Startmuster */
          ST.ctx.fillStyle = "#0a0f1a";
          ST.ctx.fillRect(0, 0, canvas.width, canvas.height);
          /* Grid */
          ST.ctx.strokeStyle = "rgba(0,229,255,.15)";
          ST.ctx.lineWidth = 1;
          for(var x = 0; x < canvas.width; x += 40){
            ST.ctx.beginPath(); ST.ctx.moveTo(x, 0); ST.ctx.lineTo(x, canvas.height); ST.ctx.stroke();
          }
          for(var y = 0; y < canvas.height; y += 40){
            ST.ctx.beginPath(); ST.ctx.moveTo(0, y); ST.ctx.lineTo(canvas.width, y); ST.ctx.stroke();
          }
          snapshot();
        }

        /* Tool-Buttons */
        container.querySelectorAll("[data-tool]").forEach(function(b){
          b.addEventListener("click", function(){
            ST.tool = b.dataset.tool;
            build();
          });
        });

        /* Color */
        var colEl = container.querySelector("#bs_color");
        if(colEl) colEl.addEventListener("input", function(){ ST.color = this.value; });

        /* Size */
        var sizeEl = container.querySelector("#bs_size");
        if(sizeEl) sizeEl.addEventListener("input", function(){
          ST.size = parseInt(this.value);
          container.querySelector("#bs_sizeV").textContent = ST.size + "px";
        });

        /* Opacity */
        var opEl = container.querySelector("#bs_opacity");
        if(opEl) opEl.addEventListener("input", function(){
          ST.opacity = this.value / 100;
          container.querySelector("#bs_opV").textContent = this.value + "%";
        });

        /* Drawing-Events */
        bindDrawing(canvas);

        /* Undo/Redo/Clear */
        var ub = container.querySelector("#bs_undo"); if(ub) ub.addEventListener("click", undo);
        var rb = container.querySelector("#bs_redo"); if(rb) rb.addEventListener("click", redo);
        var cb = container.querySelector("#bs_clear"); if(cb) cb.addEventListener("click", function(){
          if(!confirm("Canvas leeren?")) return;
          ST.ctx.fillStyle = "#0a0f1a";
          ST.ctx.fillRect(0, 0, ST.canvas.width, ST.canvas.height);
          snapshot();
        });

        /* Upload */
        var up = container.querySelector("#bs_upload");
        var upBtn = container.querySelector("#bs_uploadBtn");
        if(upBtn) upBtn.addEventListener("click", function(){ up.click(); });
        if(up) up.addEventListener("change", function(){
          var f = this.files[0];
          if(!f) return;
          var r = new FileReader();
          r.onload = function(e){
            var img = new Image();
            img.onload = function(){
              ST.canvas.width = img.width;
              ST.canvas.height = img.height;
              ST.ctx = ST.canvas.getContext("2d");
              ST.ctx.drawImage(img, 0, 0);
              ST.baseImage = img;
              ST.originalImg = img;
              bindDrawing(ST.canvas);
              snapshot();
              if(HalDo.Notify) HalDo.Notify.success("Bild geladen", { app: "bild" });
            };
            img.src = e.target.result;
          };
          r.readAsDataURL(f);
        });

        /* Save */
        var sv = container.querySelector("#bs_save");
        if(sv) sv.addEventListener("click", function(){
          var dataUrl = ST.canvas.toDataURL("image/png");
          var imgs3 = HalDo.Store.get("bilder:items", []);
          imgs3.push(dataUrl);
          if(imgs3.length > 30) imgs3.shift();
          HalDo.Store.set("bilder:items", imgs3);
          /* Auch als Download */
          var a = document.createElement("a");
          a.href = dataUrl;
          a.download = "haldo-bild-" + Date.now() + ".png";
          a.click();
          if(HalDo.Notify) HalDo.Notify.success("Bild gespeichert", { app: "bild" });
        });

        /* Rotate */
        var rot = container.querySelector("#bs_rotate");
        if(rot) rot.addEventListener("click", function(){
          var w = ST.canvas.width, h = ST.canvas.height;
          var tmp = document.createElement("canvas");
          tmp.width = w; tmp.height = h;
          tmp.getContext("2d").drawImage(ST.canvas, 0, 0);
          ST.canvas.width = h;
          ST.canvas.height = w;
          ST.ctx = ST.canvas.getContext("2d");
          ST.ctx.translate(h / 2, w / 2);
          ST.ctx.rotate(Math.PI / 2);
          ST.ctx.drawImage(tmp, -w / 2, -h / 2);
          ST.ctx.setTransform(1, 0, 0, 1, 0, 0);
          bindDrawing(ST.canvas);
          snapshot();
        });

        /* Flip */
        var fl = container.querySelector("#bs_flip");
        if(fl) fl.addEventListener("click", function(){
          var w = ST.canvas.width, h = ST.canvas.height;
          var tmp = document.createElement("canvas");
          tmp.width = w; tmp.height = h;
          tmp.getContext("2d").drawImage(ST.canvas, 0, 0);
          ST.ctx.clearRect(0, 0, w, h);
          ST.ctx.translate(w, 0);
          ST.ctx.scale(-1, 1);
          ST.ctx.drawImage(tmp, 0, 0);
          ST.ctx.setTransform(1, 0, 0, 1, 0, 0);
          snapshot();
        });
      }

      /* ═══ FILTER ═══ */
      if(tab === "filter"){
        container.querySelectorAll("[data-filter]").forEach(function(el){
          el.addEventListener("input", function(){
            var key = this.dataset.filter;
            ST.filters[key] = parseFloat(this.value);
            var lbl = container.querySelector('[data-flabel="' + key + '"]');
            if(lbl) lbl.textContent = this.value + (this.dataset.unit || "");
            /* Live-Vorschau auf Canvas */
            applyFiltersToCanvas();
          });
        });

        container.querySelectorAll("[data-preset]").forEach(function(el){
          el.addEventListener("click", function(){
            var preset = JSON.parse(el.dataset.preset);
            ST.filters = Object.assign({}, preset);
            applyFiltersToCanvas();
            build();
          });
        });

        var af = container.querySelector("#bs_applyFilter");
        if(af) af.addEventListener("click", function(){
          snapshot();
          if(HalDo.Notify) HalDo.Notify.success("Filter angewendet", { app: "bild" });
        });
      }

      /* ═══ GALERIE ═══ */
      if(tab === "galerie"){
        container.querySelectorAll("[data-bload]").forEach(function(el){
          el.addEventListener("click", function(){
            var imgs4 = HalDo.Store.get("bilder:items", []);
            var url = imgs4[parseInt(el.dataset.bload)];
            if(!url) return;
            var img = new Image();
            img.onload = function(){
              ST.canvas.width = img.width;
              ST.canvas.height = img.height;
              ST.ctx = ST.canvas.getContext("2d");
              ST.ctx.drawImage(img, 0, 0);
              ST.baseImage = img;
              tab = "studio"; store.set("tab", "studio");
              build();
            };
            img.src = url;
          });
        });
        container.querySelectorAll("[data-bdel]").forEach(function(el){
          el.addEventListener("click", function(e){
            e.stopPropagation();
            if(!confirm("Bild löschen?")) return;
            var imgs5 = HalDo.Store.get("bilder:items", []);
            imgs5.splice(parseInt(el.dataset.bdel), 1);
            HalDo.Store.set("bilder:items", imgs5);
            build();
          });
        });
      }

      /* ═══ SETTINGS ═══ */
      if(tab === "settings"){
        var clr = container.querySelector("#bs_clearAll");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Bilder löschen?")) return;
          HalDo.Store.set("bilder:items", []);
          build();
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════
       HELPER
       ═══════════════════════════════════════════════════════════ */
    function toolBtn(id, icon, label, active){
      return '<button type="button" data-tool="' + id + '" style="padding:10px 12px;background:' + (active ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (active ? "transparent" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:' + (active ? "#000" : "inherit") + ';font-family:inherit;font-size:11px;font-weight:800;white-space:nowrap;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:60px">'
        + '<span style="font-size:16px">' + icon + '</span>'
        + '<span>' + label + '</span>'
        + '</button>';
    }

    function filterSlider(label, key, val, min, max, unit){
      return '<div style="margin-bottom:10px">'
        + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:700;margin-bottom:3px">'
        + '<span>' + _esc(label) + '</span>'
        + '<span data-flabel="' + key + '" style="color:var(--p1);font-weight:900">' + val + unit + '</span>'
        + '</div>'
        + '<input type="range" data-filter="' + key + '" data-unit="' + unit + '" min="' + min + '" max="' + max + '" value="' + val + '" style="width:100%">'
        + '</div>';
    }

    function presetBtn(name, preset){
      return '<button type="button" data-preset=\'' + JSON.stringify(preset) + '\' style="padding:10px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;font-size:11px;font-weight:800">' + _esc(name) + '</button>';
    }

    /* ═══ DRAWING LOGIC ═══ */
    function bindDrawing(canvas){
      if(!canvas || canvas._bsBound) return;
      canvas._bsBound = true;
      var ctx = canvas.getContext("2d");

      function getPos(e){
        var r = canvas.getBoundingClientRect();
        var scaleX = canvas.width / r.width;
        var scaleY = canvas.height / r.height;
        var cx, cy;
        if(e.touches){
          cx = e.touches[0].clientX;
          cy = e.touches[0].clientY;
        } else {
          cx = e.clientX;
          cy = e.clientY;
        }
        return { x: (cx - r.left) * scaleX, y: (cy - r.top) * scaleY };
      }

      function start(e){
        e.preventDefault();
        ST.isDrawing = true;
        var p = getPos(e);
        ST.lastX = p.x; ST.lastY = p.y;
        ST.startPos = { x: p.x, y: p.y };

        ctx.globalAlpha = ST.opacity;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if(ST.tool === "text"){
          var txt = prompt("Text eingeben:");
          if(txt){
            ctx.fillStyle = ST.color;
            ctx.font = Math.max(14, ST.size * 3) + "px sans-serif";
            ctx.fillText(txt, p.x, p.y);
            ctx.globalAlpha = 1;
            snapshot();
          }
          ST.isDrawing = false;
          return;
        }

        if(ST.tool === "picker"){
          try {
            var px = ctx.getImageData(p.x, p.y, 1, 1).data;
            ST.color = "#" + ("0" + px[0].toString(16)).slice(-2) + ("0" + px[1].toString(16)).slice(-2) + ("0" + px[2].toString(16)).slice(-2);
            var colInp = document.getElementById("bs_color");
            if(colInp) colInp.value = ST.color;
          } catch(err){}
          ST.isDrawing = false;
          return;
        }

        /* Für Formen: Original-Bild speichern */
        if(ST.tool === "rect" || ST.tool === "circle" || ST.tool === "line"){
          ST.tempShape = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }

      function move(e){
        if(!ST.isDrawing) return;
        e.preventDefault();
        var p = getPos(e);

        ctx.strokeStyle = ST.color;
        ctx.fillStyle = ST.color;
        ctx.lineWidth = ST.size;

        if(ST.tool === "brush"){
          ctx.beginPath();
          ctx.moveTo(ST.lastX, ST.lastY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ST.lastX = p.x; ST.lastY = p.y;
        } else if(ST.tool === "eraser"){
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = ST.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(ST.lastX, ST.lastY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.restore();
          ST.lastX = p.x; ST.lastY = p.y;
        } else if(ST.tool === "spray"){
          for(var i = 0; i < 8; i++){
            var angle = Math.random() * Math.PI * 2;
            var rad = Math.random() * ST.size;
            ctx.beginPath();
            ctx.arc(p.x + Math.cos(angle) * rad, p.y + Math.sin(angle) * rad, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if(ST.tool === "rect" || ST.tool === "circle" || ST.tool === "line"){
          if(ST.tempShape) ctx.putImageData(ST.tempShape, 0, 0);
          ctx.beginPath();
          if(ST.tool === "rect"){
            ctx.strokeRect(ST.startPos.x, ST.startPos.y, p.x - ST.startPos.x, p.y - ST.startPos.y);
          } else if(ST.tool === "circle"){
            var rx = (p.x - ST.startPos.x) / 2;
            var ry = (p.y - ST.startPos.y) / 2;
            ctx.ellipse(ST.startPos.x + rx, ST.startPos.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.moveTo(ST.startPos.x, ST.startPos.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      function end(e){
        if(ST.isDrawing && (ST.tool === "brush" || ST.tool === "eraser" || ST.tool === "spray" || ST.tool === "rect" || ST.tool === "circle" || ST.tool === "line")){
          snapshot();
        }
        ST.isDrawing = false;
        ST.tempShape = null;
      }

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("mouseup", end);
      canvas.addEventListener("mouseleave", end);
      canvas.addEventListener("touchstart", start, { passive: false });
      canvas.addEventListener("touchmove", move, { passive: false });
      canvas.addEventListener("touchend", end);
    }

    function applyFiltersToCanvas(){
      if(!ST.canvas) return;
      var f = ST.filters;
      var filterStr = "brightness(" + f.brightness + "%) contrast(" + f.contrast + "%) saturate(" + f.saturate + "%) blur(" + f.blur + "px) grayscale(" + f.grayscale + "%) sepia(" + f.sepia + "%) hue-rotate(" + f.hue + "deg) invert(" + f.invert + "%)";
      ST.canvas.style.filter = filterStr;
    }

    build();
  }

  HalDoApp("bild", { name: "Bild", icon: "🎨", render: render, category: "lifestyle" });
  console.log("🦚 bild.js v200 geladen — FULL IMAGE STUDIO");
})();
