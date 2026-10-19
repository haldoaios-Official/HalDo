/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BILD STUDIO (v300)
   Zeichnen · Filter · Text · KI-Prompt-Generator
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  var ST = {
    canvas: null, ctx: null,
    baseImage: null,
    tool: "brush",
    color: "#00e5ff",
    size: 8,
    opacity: 1,
    isDrawing: false,
    lastX: 0, lastY: 0,
    filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0 }
  };

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-btab="studio">🎨 Studio</button>'
        + '<button class="tab' + (tab === "filter" ? " active" : "") + '" data-btab="filter">✨ Filter</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-btab="ai">🤖 KI-Prompt</button>'
        + '</div>';

      /* ═══ STUDIO ═══ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:8px">'
          + '<canvas id="bs_canvas" style="width:100%;background:#000;border-radius:10px;display:block;cursor:crosshair;touch-action:none" width="800" height="600"></canvas>'
          + '</div>';

        body += '<div class="card" style="padding:10px">'
          + '<div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px">'
          + toolBtn("brush", "🖌️", "Pinsel", ST.tool === "brush")
          + toolBtn("eraser", "🧽", "Radierer", ST.tool === "eraser")
          + toolBtn("text", "🔤", "Text", ST.tool === "text")
          + toolBtn("rect", "▭", "Rechteck", ST.tool === "rect")
          + toolBtn("circle", "◯", "Kreis", ST.tool === "circle")
          + toolBtn("line", "╱", "Linie", ST.tool === "line")
          + '</div>'
          + '<div style="display:flex;gap:8px;align-items:center;margin-top:8px">'
          + '<input type="color" id="bs_color" value="' + ST.color + '" style="width:44px;height:36px;border:1px solid var(--border-soft);border-radius:8px;background:transparent;cursor:pointer">'
          + '<div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-mute)"><span>Größe</span><span id="bs_sizeV">' + ST.size + 'px</span></div><input type="range" id="bs_size" min="1" max="100" value="' + ST.size + '" style="width:100%"></div>'
          + '</div></div>';

        body += '<div class="card">'
          + '<input type="file" id="bs_upload" accept="image/*" style="display:none">'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + '<button class="btn" id="bs_uploadBtn" style="font-size:11px">📤 Bild laden</button>'
          + '<button class="btn sec" id="bs_save" style="font-size:11px">💾 Speichern</button>'
          + '</div></div>';
      }

      /* ═══ FILTER ═══ */
      else if(tab === "filter"){
        var f = ST.filters;
        body += '<div class="card"><h3>✨ Filter & Anpassungen</h3>'
          + filterSlider("Helligkeit", "brightness", f.brightness, 0, 200, "%")
          + filterSlider("Kontrast", "contrast", f.contrast, 0, 200, "%")
          + filterSlider("Sättigung", "saturate", f.saturate, 0, 300, "%")
          + filterSlider("Unschärfe", "blur", f.blur, 0, 20, "px")
          + filterSlider("S/W", "grayscale", f.grayscale, 0, 100, "%")
          + filterSlider("Sepia", "sepia", f.sepia, 0, 100, "%")
          + '</div>';
      }

      /* ═══ KI-PROMPT ═══ */
      else if(tab === "ai"){
        body += '<div class="card"><h3>🤖 KI Prompt Generator</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);line-height:1.6;margin-bottom:10px">'
          + 'Gib eine Idee auf Deutsch ein. Die KI macht daraus einen professionellen englischen Prompt für Bildgeneratoren (Midjourney, DALL-E, Stable Diffusion).'
          + '</div>'
          + '<textarea id="imgIdea" rows="3" placeholder="z.B. Ein Drache über einem kurdischen Dorf bei Sonnenuntergang" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical"></textarea>'
          + '<button class="btn full" id="btnGenPrompt" style="margin-top:8px;background:var(--p1);color:#000">✨ Prompt generieren</button>'
          + '<div id="promptResult" style="display:none;margin-top:12px;padding:12px;background:rgba(0,0,0,.4);border-radius:10px;font-family:monospace;font-size:11.5px;color:#4ade80;line-height:1.5"></div>'
          + '</div>';
      }

      container.innerHTML = body;

      /* Events */
      container.querySelectorAll("[data-btab]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.btab; store.set("tab", tab); build(); });
      });

      if(tab === "studio"){
        var canvas = container.querySelector("#bs_canvas");
        ST.canvas = canvas;
        ST.ctx = canvas.getContext("2d");

        if(ST.baseImage){
          ST.ctx.drawImage(ST.baseImage, 0, 0, canvas.width, canvas.height);
        } else {
          ST.ctx.fillStyle = "#0a0f1a";
          ST.ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        container.querySelectorAll("[data-tool]").forEach(b => {
          b.addEventListener("click", function(){ ST.tool = b.dataset.tool; build(); });
        });

        var colEl = container.querySelector("#bs_color");
        if(colEl) colEl.addEventListener("input", function(){ ST.color = this.value; });

        var sizeEl = container.querySelector("#bs_size");
        if(sizeEl) sizeEl.addEventListener("input", function(){
          ST.size = parseInt(this.value);
          container.querySelector("#bs_sizeV").textContent = ST.size + "px";
        });

        bindDrawing(canvas);

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
              bindDrawing(ST.canvas);
              if(HalDo.Notify) HalDo.Notify.success("Bild geladen", { app: "bild" });
            };
            img.src = e.target.result;
          };
          r.readAsDataURL(f);
        });

        var sv = container.querySelector("#bs_save");
        if(sv) sv.addEventListener("click", function(){
          var dataUrl = ST.canvas.toDataURL("image/png");
          var a = document.createElement("a");
          a.href = dataUrl;
          a.download = "haldo-bild-" + Date.now() + ".png";
          a.click();
          if(HalDo.Notify) HalDo.Notify.success("Bild gespeichert", { app: "bild" });
        });
      }

      if(tab === "filter"){
        container.querySelectorAll("[data-filter]").forEach(el => {
          el.addEventListener("input", function(){
            ST.filters[this.dataset.filter] = parseFloat(this.value);
            var lbl = container.querySelector('[data-flabel="' + this.dataset.filter + '"]');
            if(lbl) lbl.textContent = this.value + (this.dataset.unit || "");
            applyFiltersToCanvas();
          });
        });
      }

      if(tab === "ai"){
        container.querySelector("#btnGenPrompt").addEventListener("click", async function(){
          var idea = container.querySelector("#imgIdea").value.trim();
          if(!idea) return alert("Bitte gib eine Idee ein!");
          var res = container.querySelector("#promptResult");
          res.style.display = "block";
          res.textContent = "⏳ KI übersetzt...";
          this.disabled = true;
          
          try {
            var prompt = "Du bist ein professioneller Prompt-Engineer für KI-Bildgeneratoren. Übersetze folgende Idee in einen detaillierten englischen Prompt für Stable Diffusion oder Midjourney. Füge beschreibende Wörter hinzu (z.B. 8k, highly detailed, cinematic lighting). Idee: " + idea + ". Gib NUR den englischen Prompt zurück.";
            var result = await HalDo.AI.ask(prompt, { temperature: 0.7, maxTokens: 200 });
            res.textContent = result;
            if(HalDo.Notify) HalDo.Notify.success("Prompt generiert!", { app: "bild" });
          } catch(e) {
            res.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });
      }
    }

    function toolBtn(id, icon, label, active){
      return '<button type="button" data-tool="' + id + '" style="padding:10px 12px;background:' + (active ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (active ? "transparent" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:' + (active ? "#000" : "inherit") + ';font-family:inherit;font-size:11px;font-weight:800;white-space:nowrap;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:60px">'
        + '<span style="font-size:16px">' + icon + '</span><span>' + label + '</span></button>';
    }

    function filterSlider(label, key, val, min, max, unit){
      return '<div style="margin-bottom:10px">'
        + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:700;margin-bottom:3px">'
        + '<span>' + _esc(label) + '</span><span data-flabel="' + key + '" style="color:var(--p1);font-weight:900">' + val + unit + '</span>'
        + '</div><input type="range" data-filter="' + key + '" data-unit="' + unit + '" min="' + min + '" max="' + max + '" value="' + val + '" style="width:100%"></div>';
    }

    function bindDrawing(canvas){
      if(!canvas || canvas._bsBound) return;
      canvas._bsBound = true;
      var ctx = canvas.getContext("2d");

      function getPos(e){
        var r = canvas.getBoundingClientRect();
        var scaleX = canvas.width / r.width;
        var scaleY = canvas.height / r.height;
        var cx = e.touches ? e.touches[0].clientX : e.clientX;
        var cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (cx - r.left) * scaleX, y: (cy - r.top) * scaleY };
      }

      function start(e){
        e.preventDefault();
        ST.isDrawing = true;
        var p = getPos(e);
        ST.lastX = p.x; ST.lastY = p.y;
        
        if(ST.tool === "text"){
          var txt = prompt("Text eingeben:");
          if(txt){
            ctx.fillStyle = ST.color;
            ctx.font = Math.max(14, ST.size * 3) + "px sans-serif";
            ctx.fillText(txt, p.x, p.y);
          }
          ST.isDrawing = false;
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
          ctx.beginPath(); ctx.moveTo(ST.lastX, ST.lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
          ST.lastX = p.x; ST.lastY = p.y;
        } else if(ST.tool === "eraser"){
          ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = ST.size * 1.5;
          ctx.beginPath(); ctx.moveTo(ST.lastX, ST.lastY); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
          ST.lastX = p.x; ST.lastY = p.y;
        } else if(ST.tool === "rect"){
          ctx.strokeRect(ST.lastX, ST.lastY, p.x - ST.lastX, p.y - ST.lastY);
        } else if(ST.tool === "circle"){
          var rx = (p.x - ST.lastX) / 2, ry = (p.y - ST.lastY) / 2;
          ctx.beginPath(); ctx.ellipse(ST.lastX + rx, ST.lastY + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2); ctx.stroke();
        } else if(ST.tool === "line"){
          ctx.beginPath(); ctx.moveTo(ST.lastX, ST.lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      }

      function end(){ ST.isDrawing = false; }

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
      ST.canvas.style.filter = "brightness(" + f.brightness + "%) contrast(" + f.contrast + "%) saturate(" + f.saturate + "%) blur(" + f.blur + "px) grayscale(" + f.grayscale + "%) sepia(" + f.sepia + "%)";
    }

    build();
  }

  HalDoApp("bild", { name: "Bild", icon: "🎨", render: render, category: "lifestyle" });
  console.log("🦚 bild.js v300 geladen — MIT KI-PROMPT");
})();
