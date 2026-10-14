/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KREATIV APP (v150)
   Bild-Editor · Pixel-Art · Farbpalette · Story-Generator
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "bild");

    function build(){
      var body = "";

      /* ═══ BILD-EDITOR ═══ */
      if(tab === "bild"){
        body = '<div class="card"><h3>🎨 Bild-Editor</h3>'
          + '<canvas id="kvC" width="400" height="300" style="width:100%;max-width:400px;border:1px solid var(--p1);border-radius:10px;background:#fff;touch-action:none;display:block;margin:0 auto;cursor:crosshair"></canvas>'
          + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;justify-content:center;align-items:center">'
          + '<input type="color" id="kvColor" value="#00e5ff" style="width:44px;height:44px;border:none;border-radius:8px;cursor:pointer;background:transparent">'
          + '<input type="range" id="kvSize" min="1" max="40" value="5" style="flex:1;min-width:120px;accent-color:var(--p1)">'
          + '<span id="kvSizeVal" style="color:var(--p1);font-weight:800;min-width:30px">5</span>'
          + '</div>'
          + '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">'
          + '<button class="btn sec" id="kvErase" style="flex:1">🧽 Radierer</button>'
          + '<button class="btn sec" id="kvClear" style="flex:1">🗑️ Leeren</button>'
          + '<button class="btn" id="kvSave" style="flex:1">💾 PNG</button>'
          + '</div></div>';

      /* ═══ PIXEL-ART ═══ */
      } else if(tab === "pixel"){
        body = '<div class="card"><h3>🖌️ Pixel-Art (16×16)</h3>'
          + '<div style="background:rgba(0,0,0,.3);padding:8px;border-radius:10px;max-width:380px;margin:0 auto">'
          + '<div id="pxGrid" style="display:grid;grid-template-columns:repeat(16,1fr);gap:1px;aspect-ratio:1"></div>'
          + '</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;justify-content:center;align-items:center">'
          + '<input type="color" id="pxColor" value="#00e5ff" style="width:44px;height:44px;border:none;border-radius:8px;cursor:pointer">'
          + '<button class="btn sec" id="pxErase">🧽</button>'
          + '<button class="btn sec" id="pxClear">🗑️</button>'
          + '<button class="btn" id="pxSave">💾 PNG</button>'
          + '</div></div>';

      /* ═══ FARBEN ═══ */
      } else if(tab === "farben"){
        var colors = ["#00e5ff","#4da8ff","#b478ff","#ff78c8","#ff5cae","#4ade80","#22c55e","#fbbf24","#f59e0b","#ef4444","#dc2626","#a855f7","#8b5cf6","#ec4899","#ffffff","#dff6ff","#7a9bb8","#02040a"];
        body = '<div class="card"><h3>🌈 Farbpalette</h3>'
          + '<div style="text-align:center;margin-bottom:12px">'
          + '<input type="color" id="fcPick" value="#00e5ff" style="width:120px;height:120px;border-radius:16px;border:2px solid var(--p1);cursor:pointer;background:transparent">'
          + '</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px">'
          + colors.map(function(c){
              return '<div data-fc="' + c + '" style="width:38px;height:38px;border-radius:8px;background:' + c + ';cursor:pointer;border:2px solid rgba(255,255,255,.2)"></div>';
            }).join("")
          + '</div>'
          + '<div id="fcInfo" style="padding:14px;background:rgba(0,229,255,.08);border-radius:10px;font-family:ui-monospace;font-size:14px;font-weight:800;text-align:center">#00E5FF</div>'
          + '<div id="fcRGB" style="padding:10px;text-align:center;color:var(--text-dim);font-size:11px;font-family:ui-monospace;margin-top:8px">rgb(0, 229, 255)</div>'
          + '</div>';

      /* ═══ STORY ═══ */
      } else if(tab === "story"){
        body = '<div class="card"><h3>📖 Story-Generator</h3>'
          + '<div class="field"><label>Hauptfigur</label><input type="text" id="stH" value="ein junger Ezidi"></div>'
          + '<div class="field"><label>Ort</label><input type="text" id="stP" value="Berg Laliş"></div>'
          + '<div class="field"><label>Genre</label><select id="stG">'
          + '<option>Abenteuer</option><option>Mystery</option><option>Fantasy</option><option>Sci-Fi</option><option>Historisch</option>'
          + '</select></div>'
          + '<button class="btn full" id="stGo">✨ Story generieren</button>'
          + '<div id="stR" style="margin-top:14px;padding:14px;background:rgba(0,229,255,.08);border-radius:10px;line-height:1.7;font-size:13px;min-height:80px">—</div>'
          + '<button class="btn sec full" id="stSpeak" style="margin-top:10px">🔊 Vorlesen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="bild"?" active":"") + '" data-krt="bild">🎨 Bild</button>'
        + '<button class="tab' + (tab==="pixel"?" active":"") + '" data-krt="pixel">🖌️ Pixel</button>'
        + '<button class="tab' + (tab==="farben"?" active":"") + '" data-krt="farben">🌈 Farben</button>'
        + '<button class="tab' + (tab==="story"?" active":"") + '" data-krt="story">📖 Story</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-krt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.krt;
          store.set("tab", tab);
          build();
        });
      });

      /* Bild-Editor */
      if(tab === "bild"){
        var c = container.querySelector("#kvC");
        var ctx2 = c.getContext("2d");
        ctx2.fillStyle = "#fff";
        ctx2.fillRect(0, 0, c.width, c.height);
        var drawing = false, lx = 0, ly = 0, eraseMode = false;

        function pos(e){
          var r = c.getBoundingClientRect();
          var p = e.touches ? e.touches[0] : e;
          return {
            x: (p.clientX - r.left) * (c.width / r.width),
            y: (p.clientY - r.top) * (c.height / r.height)
          };
        }
        function st(e){ drawing = true; var p = pos(e); lx = p.x; ly = p.y; }
        function mv(e){
          if(!drawing) return;
          e.preventDefault();
          var p = pos(e);
          ctx2.strokeStyle = eraseMode ? "#fff" : container.querySelector("#kvColor").value;
          ctx2.lineWidth = eraseMode ? parseInt(container.querySelector("#kvSize").value) * 2 : parseInt(container.querySelector("#kvSize").value);
          ctx2.lineCap = "round";
          ctx2.beginPath();
          ctx2.moveTo(lx, ly);
          ctx2.lineTo(p.x, p.y);
          ctx2.stroke();
          lx = p.x; ly = p.y;
        }
        function en(){ drawing = false; }
        c.addEventListener("mousedown", st);
        c.addEventListener("mousemove", mv);
        c.addEventListener("mouseup", en);
        c.addEventListener("mouseout", en);
        c.addEventListener("touchstart", st, {passive:true});
        c.addEventListener("touchmove", mv, {passive:false});
        c.addEventListener("touchend", en);

        container.querySelector("#kvSize").addEventListener("input", function(){
          container.querySelector("#kvSizeVal").textContent = this.value;
        });
        container.querySelector("#kvErase").addEventListener("click", function(){
          eraseMode = !eraseMode;
          this.textContent = eraseMode ? "✏️ Zeichnen" : "🧽 Radierer";
          this.className = eraseMode ? "btn" : "btn sec";
        });
        container.querySelector("#kvClear").addEventListener("click", function(){
          ctx2.fillStyle = "#fff";
          ctx2.fillRect(0, 0, c.width, c.height);
        });
        container.querySelector("#kvSave").addEventListener("click", function(){
          var a = document.createElement("a");
          a.href = c.toDataURL("image/png");
          a.download = "haldo_bild_" + Date.now() + ".png";
          a.click();
        });
      }

      /* Pixel-Art */
      if(tab === "pixel"){
        var grid = container.querySelector("#pxGrid");
        for(var i = 0; i < 256; i++){
          var cell = document.createElement("div");
          cell.dataset.pi = i;
          cell.style.cssText = "background:rgba(0,0,0,.4);border-radius:2px;cursor:pointer;aspect-ratio:1";
          grid.appendChild(cell);
        }
        var isDown = false, eraseMode = false;
        grid.addEventListener("mousedown", function(){ isDown = true; });
        grid.addEventListener("mouseup", function(){ isDown = false; });
        grid.addEventListener("mouseleave", function(){ isDown = false; });
        function paint(e){
          var t = e.target;
          if(!t.dataset || !t.dataset.pi) return;
          if(e.type === "mousemove" && !isDown) return;
          t.style.background = eraseMode ? "rgba(0,0,0,.4)" : container.querySelector("#pxColor").value;
        }
        grid.addEventListener("click", paint);
        grid.addEventListener("mousemove", paint);
        grid.addEventListener("touchmove", function(e){
          e.preventDefault();
          var t = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
          if(t && t.dataset && t.dataset.pi){
            t.style.background = eraseMode ? "rgba(0,0,0,.4)" : container.querySelector("#pxColor").value;
          }
        }, {passive:false});
        container.querySelector("#pxErase").addEventListener("click", function(){
          eraseMode = !eraseMode;
          this.textContent = eraseMode ? "✏️" : "🧽";
          this.className = eraseMode ? "btn" : "btn sec";
        });
        container.querySelector("#pxClear").addEventListener("click", function(){
          grid.querySelectorAll("[data-pi]").forEach(function(c){ c.style.background = "rgba(0,0,0,.4)"; });
        });
        container.querySelector("#pxSave").addEventListener("click", function(){
          var cv = document.createElement("canvas");
          cv.width = 16; cv.height = 16;
          var ct = cv.getContext("2d");
          grid.querySelectorAll("[data-pi]").forEach(function(c,i){
            var bg = c.style.background;
            if(bg.indexOf("rgba(0, 0, 0, 0.4)") >= 0 || !bg) return;
            ct.fillStyle = bg;
            ct.fillRect(i % 16, Math.floor(i / 16), 1, 1);
          });
          var a = document.createElement("a");
          a.href = cv.toDataURL("image/png");
          a.download = "haldo_pixel_" + Date.now() + ".png";
          a.click();
        });
      }

      /* Farben */
      if(tab === "farben"){
        function upd(){
          var c = container.querySelector("#fcPick").value;
          container.querySelector("#fcInfo").textContent = c.toUpperCase();
          var r = parseInt(c.substring(1,3), 16);
          var g = parseInt(c.substring(3,5), 16);
          var b = parseInt(c.substring(5,7), 16);
          container.querySelector("#fcRGB").textContent = "rgb(" + r + ", " + g + ", " + b + ")";
        }
        container.querySelector("#fcPick").addEventListener("input", upd);
        upd();
        container.querySelectorAll("[data-fc]").forEach(function(el){
          el.addEventListener("click", function(){
            container.querySelector("#fcPick").value = el.dataset.fc;
            upd();
          });
        });
      }

      /* Story */
      if(tab === "story"){
        var lastStory = "";
        container.querySelector("#stGo").addEventListener("click", function(){
          var h = container.querySelector("#stH").value || "ein junger Ezidi";
          var p = container.querySelector("#stP").value || "Berg Laliş";
          var g = container.querySelector("#stG").value;
          var stories = {
            "Abenteuer": "Es war einmal " + h + ", der/die sich auf eine gefährliche Reise nach " + p + " begab. Nach vielen Prüfungen erreichte " + h + " den Gipfel und fand dort nicht Gold, sondern die Wahrheit über sich selbst. 🦚",
            "Mystery": "In " + p + " verschwanden eines Nachts drei Menschen. " + h + " begann zu ermitteln. Alte Schriften im Mushaf Reş gaben einen Hinweis, der alles veränderte. 🔍",
            "Fantasy": "In einer Welt, in der Tawûsî Melek über die Sterne wachte, lebte " + h + ". Der Pfauengel übergab die Aufgabe, die sieben heiligen Lichter von " + p + " neu zu entzünden. ✨",
            "Sci-Fi": "Im Jahr 2145 entdeckte " + h + " auf " + p + " ein uraltes Artefakt. Eine Botschaft aus Mesopotamien, die die Zukunft der Menschheit verändern sollte. 🚀",
            "Historisch": "Im Schatten der Berge von " + p + ", 1915, lebte " + h + ". Die Flucht, der Verlust, aber auch der unbeugsame Wille zu überleben — eine Geschichte, die nie vergessen werden darf. 🕊️"
          };
          lastStory = stories[g];
          container.querySelector("#stR").textContent = lastStory;
        });
        container.querySelector("#stSpeak").addEventListener("click", function(){
          if(lastStory && window.HalDo.Voice) HalDo.Voice.speak(lastStory);
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("kreativ", { render: render });
  else console.warn("kreativ.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 kreativ.js geladen");
