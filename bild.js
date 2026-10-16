/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BILD (v155) · Bild-Bearbeitung
   Filter · Crop · Rotate · Text · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "editor");

    function build(){
      var body = "";

      if(tab === "editor"){
        var img = store.get("current", null);
        if(!img){
          body = '<div class="card"><h3>🎨 Bild-Editor</h3>'
            + '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">'
            + 'Lade ein Bild aus der Galerie oder wähle eines aus dem Foto-Tab.'
            + '</div>'
            + '<input type="file" id="bUpload" accept="image/*" style="display:none">'
            + '<button class="btn full" id="bUploadBtn">📷 Bild laden</button>'
            + '</div>';
        } else {
          var brightness = store.get("brightness", 100);
          var contrast = store.get("contrast", 100);
          var saturate = store.get("saturate", 100);
          var blur = store.get("blur", 0);
          var grayscale = store.get("grayscale", 0);
          var hue = store.get("hue", 0);
          var sepia = store.get("sepia", 0);
          var invert = store.get("invert", 0);

          var filter = "brightness(" + brightness + "%) contrast(" + contrast + "%) saturate(" + saturate + "%) blur(" + blur + "px) grayscale(" + grayscale + "%) hue-rotate(" + hue + "deg) sepia(" + sepia + "%) invert(" + invert + "%)";

          body = '<div class="card">'
            + '<div style="border-radius:10px;overflow:hidden;background:#000;text-align:center">'
            + '<img id="bPreview" src="' + _esc(img) + '" style="max-width:100%;max-height:300px;filter:' + filter + ';transition:.2s">'
            + '</div>'
            + '<div style="margin-top:14px">'
            + slider("brightness", "☀️ Helligkeit", brightness, 0, 200, "%")
            + slider("contrast", "🔲 Kontrast", contrast, 0, 200, "%")
            + slider("saturate", "🎨 Sättigung", saturate, 0, 200, "%")
            + slider("hue", "🌈 Farbton", hue, 0, 360, "°")
            + slider("blur", "💨 Unschärfe", blur, 0, 10, "px")
            + slider("grayscale", "⚫ S/W", grayscale, 0, 100, "%")
            + slider("sepia", "🟤 Sepia", sepia, 0, 100, "%")
            + slider("invert", "🔄 Invert", invert, 0, 100, "%")
            + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:12px">'
            + '<button class="btn" id="bSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="bReset" style="flex:1">🔄 Reset</button>'
            + '<button class="btn sec" id="bClose">✕</button>'
            + '</div></div>';
        }
      }

      else if(tab === "galerie"){
        var images = store.get("images", []);
        body = '<div class="card"><h3>🖼️ Meine Bilder (' + images.length + ')</h3>'
          + '<input type="file" id="bUpload2" accept="image/*" multiple style="display:none">'
          + '<button class="btn full" id="bUpload2Btn" style="margin-bottom:10px">📷 Bilder hinzufügen</button>';

        if(!images.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Noch keine Bilder</div>';
        } else {
          body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
          images.forEach(function(im, i){
            body += '<div style="position:relative;aspect-ratio:1;background:rgba(0,0,0,.3);border-radius:10px;overflow:hidden;cursor:pointer;border:1px solid var(--border-soft)">'
              + '<img data-bedit="' + i + '" src="' + _esc(im) + '" style="width:100%;height:100%;object-fit:cover">'
              + '<button data-bdel="' + i + '" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.7);border:none;color:#ff8080;cursor:pointer;border-radius:50%;width:22px;height:22px;font-size:11px">✕</button>'
              + '</div>';
          });
          body += '</div>';
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🖼️ BILDER</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + store.get("images", []).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="bClear" style="margin-top:10px">🗑️ Alle Bilder löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="editor"?" active":"") + '" data-bt2="editor">🎨 Editor</button>'
        + '<button class="tab' + (tab==="galerie"?" active":"") + '" data-bt2="galerie">🖼️ Galerie</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-bt2="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-bt2]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.bt2; store.set("tab", tab); build();
        });
      });

      if(tab === "editor"){
        var up = container.querySelector("#bUpload");
        var upBtn = container.querySelector("#bUploadBtn");
        if(upBtn) upBtn.addEventListener("click", function(){ up.click(); });
        if(up) up.addEventListener("change", function(){
          var f = this.files[0];
          if(!f) return;
          var r = new FileReader();
          r.onload = function(e){
            store.set("current", e.target.result);
            build();
          };
          r.readAsDataURL(f);
        });

        if(img){
          container.querySelectorAll("[data-slider]").forEach(function(el){
            el.addEventListener("input", function(){
              store.set(el.dataset.slider, parseFloat(this.value));
              var b2 = store.get("brightness", 100);
              var c2 = store.get("contrast", 100);
              var s2 = store.get("saturate", 100);
              var h2 = store.get("hue", 0);
              var bl2 = store.get("blur", 0);
              var g2 = store.get("grayscale", 0);
              var se2 = store.get("sepia", 0);
              var iv2 = store.get("invert", 0);
              var preview = container.querySelector("#bPreview");
              if(preview) preview.style.filter = "brightness(" + b2 + "%) contrast(" + c2 + "%) saturate(" + s2 + "%) blur(" + bl2 + "px) grayscale(" + g2 + "%) hue-rotate(" + h2 + "deg) sepia(" + se2 + "%) invert(" + iv2 + "%)";
              var lbl = container.querySelector('[data-lbl="' + el.dataset.slider + '"]');
              if(lbl) lbl.textContent = el.value + el.dataset.unit;
            });
          });

          var saveBtn = container.querySelector("#bSave");
          if(saveBtn) saveBtn.addEventListener("click", function(){
            var images2 = store.get("images", []);
            /* Zusätzliches Speichern mit Filtern als "Ergebnis" */
            var canvas = document.createElement("canvas");
            var im = new Image();
            im.onload = function(){
              canvas.width = im.width;
              canvas.height = im.height;
              var cx = canvas.getContext("2d");
              cx.filter = "brightness(" + store.get("brightness", 100) + "%) contrast(" + store.get("contrast", 100) + "%) saturate(" + store.get("saturate", 100) + "%) blur(" + store.get("blur", 0) + "px) grayscale(" + store.get("grayscale", 0) + "%) hue-rotate(" + store.get("hue", 0) + "deg) sepia(" + store.get("sepia", 0) + "%) invert(" + store.get("invert", 0) + "%)";
              cx.drawImage(im, 0, 0);
              images2.push(canvas.toDataURL("image/jpeg", 0.85));
              store.set("images", images2);
              if(HalDo.Notify) HalDo.Notify.success("Bild gespeichert", { app: "bild" });
              tab = "galerie"; store.set("tab", tab);
              build();
            };
            im.src = store.get("current", "");
          });

          var rst = container.querySelector("#bReset");
          if(rst) rst.addEventListener("click", function(){
            ["brightness","contrast","saturate","blur","grayscale","hue","sepia","invert"].forEach(function(k){ store.set(k, null); });
            store.set("brightness", 100); store.set("contrast", 100); store.set("saturate", 100);
            store.set("blur", 0); store.set("grayscale", 0); store.set("hue", 0);
            store.set("sepia", 0); store.set("invert", 0);
            build();
          });
          var cls = container.querySelector("#bClose");
          if(cls) cls.addEventListener("click", function(){
            store.set("current", null);
            build();
          });
        }
      }

      if(tab === "galerie"){
        var up2 = container.querySelector("#bUpload2");
        var up2Btn = container.querySelector("#bUpload2Btn");
        if(up2Btn) up2Btn.addEventListener("click", function(){ up2.click(); });
        if(up2) up2.addEventListener("change", function(){
          var files = Array.from(this.files || []);
          var images3 = store.get("images", []);
          var pending = files.length;
          if(!pending) return;
          files.forEach(function(f){
            var r = new FileReader();
            r.onload = function(e){
              images3.push(e.target.result);
              pending--;
              if(pending === 0){
                store.set("images", images3);
                if(HalDo.Notify) HalDo.Notify.success(files.length + " Bild(er) hinzugefügt", { app: "bild" });
                build();
              }
            };
            r.readAsDataURL(f);
          });
        });

        container.querySelectorAll("[data-bedit]").forEach(function(el){
          el.addEventListener("click", function(){
            var images4 = store.get("images", []);
            store.set("current", images4[parseInt(el.dataset.bedit)]);
            tab = "editor"; store.set("tab", tab);
            build();
          });
        });
        container.querySelectorAll("[data-bdel]").forEach(function(el){
          el.addEventListener("click", function(e){
            e.stopPropagation();
            if(!confirm("Bild löschen?")) return;
            var images5 = store.get("images", []);
            images5.splice(parseInt(el.dataset.bdel), 1);
            store.set("images", images5);
            build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#bClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Bilder löschen?")) return;
          store.set("images", []);
          build();
        });
      }
    }

    function slider(key, label, val, min, max, unit){
      return '<div style="margin-bottom:8px">'
        + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:800;margin-bottom:3px">'
        + '<span>' + label + '</span><span data-lbl="' + key + '">' + val + unit + '</span>'
        + '</div>'
        + '<input type="range" data-slider="' + key + '" data-unit="' + unit + '" min="' + min + '" max="' + max + '" value="' + val + '" style="width:100%">'
        + '</div>';
    }

    build();
  }

  HalDoApp("bild", { name: "Bild", icon: "🎨", render: render, category: "lifestyle" });
  console.log("🦚 bild.js v155 geladen");
})();
