/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — FOTOS (v152)
   Galerie · Kamera · Filter · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "galerie");

    function build(){
      var body = "";

      /* ═══ GALERIE ═══ */
      if(tab === "galerie"){
        var photos = store.get("photos", []);
        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="file" id="photoInp" accept="image/*" multiple style="display:none">'
          + '<button class="btn" id="photoUpload" style="flex:1">📷 Foto hinzufügen</button>'
          + '</div>';

        if(!photos.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:30px">'
            + '<div style="font-size:48px">📸</div>'
            + '<div style="margin-top:8px">Noch keine Fotos</div>'
            + '<div style="font-size:10.5px;margin-top:4px">Füge Bilder hinzu — sie werden lokal gespeichert</div>'
            + '</div>';
        } else {
          body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
          photos.forEach(function(p, i){
            body += '<div style="position:relative;aspect-ratio:1;background:rgba(0,0,0,.3);border-radius:10px;overflow:hidden;cursor:pointer;border:1px solid var(--border-soft)">'
              + '<img data-photo="' + i + '" src="' + _esc(p.data) + '" alt="' + _esc(p.name) + '" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy">'
              + '<button data-photodel="' + i + '" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.7);border:none;color:#ff8080;cursor:pointer;border-radius:50%;width:22px;height:22px;font-size:11px">✕</button>'
              + '</div>';
          });
          body += '</div>';
        }
        body += '</div>';

      /* ═══ KAMERA ═══ */
      } else if(tab === "kamera"){
        body = '<div class="card"><h3>📷 Kamera</h3>'
          + '<div style="padding:20px;background:rgba(0,0,0,.3);border-radius:10px;text-align:center">'
          + '<div style="font-size:48px">📷</div>'
          + '<div style="font-size:12px;color:var(--text-mute);margin-top:8px">Kamera öffnen</div>'
          + '</div>'
          + '<input type="file" id="camCapture" accept="image/*" capture="environment" style="display:none">'
          + '<button class="btn full" id="camOpen" style="margin-top:12px">📸 Kamera öffnen</button>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:10px;line-height:1.5">'
          + 'ℹ️ Auf mobilen Geräten öffnet sich die Kamera. Auf Desktop: Datei-Upload.'
          + '</div>'
          + '</div>';

      /* ═══ BEARBEITEN ═══ */
      } else if(tab === "bearbeiten"){
        var sel = store.get("selectedPhoto", null);
        if(sel === null){
          body = '<div class="card"><h3>🎨 Bild bearbeiten</h3>'
            + '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">'
            + 'Wähle erst ein Bild aus der Galerie.'
            + '</div></div>';
        } else {
          var p = (store.get("photos", []))[sel];
          if(!p){ store.set("selectedPhoto", null); build(); return; }
          var brightness = store.get("brightness", 100);
          var contrast = store.get("contrast", 100);
          var saturate = store.get("saturate", 100);
          var blur = store.get("blur", 0);
          var grayscale = store.get("grayscale", 0);

          body = '<div class="card">'
            + '<img src="' + _esc(p.data) + '" style="width:100%;border-radius:10px;filter:brightness(' + brightness + '%) contrast(' + contrast + '%) saturate(' + saturate + '%) blur(' + blur + 'px) grayscale(' + grayscale + '%);transition:.2s">'
            + '<div style="margin-top:14px">'
            + slider("brightness", "☀️ Helligkeit", brightness, 0, 200, "%")
            + slider("contrast", "🔲 Kontrast", contrast, 0, 200, "%")
            + slider("saturate", "🎨 Sättigung", saturate, 0, 200, "%")
            + slider("blur", "💨 Unschärfe", blur, 0, 10, "px")
            + slider("grayscale", "⚫ S/W", grayscale, 0, 100, "%")
            + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:12px">'
            + '<button class="btn sec" id="bReset" style="flex:1">🔄 Zurücksetzen</button>'
            + '<button class="btn sec" id="bClose" style="flex:1">✕ Schließen</button>'
            + '</div></div>';
        }
      }

      /* ═══ SETTINGS ═══ */
      else if(tab === "settings"){
        var photos2 = store.get("photos", []);
        var quality = store.get("quality", 0.8);
        var totalSize = photos2.reduce(function(s, p){ return s + (p.data ? p.data.length : 0); }, 0);

        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">📸 FOTOS</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + photos2.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">💾 GRÖSSE</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p3)">' + Math.round(totalSize/1024) + 'KB</div>'
          + '</div></div>'
          + '<div class="field" style="margin-top:12px"><label>Speicher-Qualität: ' + Math.round(quality*100) + '%</label>'
          + '<input type="range" id="pQuality" min="0.3" max="1" step="0.1" value="' + quality + '" style="width:100%"></div>'
          + '<button class="btn danger full" id="pClear" style="margin-top:8px">🗑️ Alle Fotos löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="galerie"?" active":"") + '" data-pht="galerie">🖼️ Galerie</button>'
        + '<button class="tab' + (tab==="kamera"?" active":"") + '" data-pht="kamera">📷 Kamera</button>'
        + '<button class="tab' + (tab==="bearbeiten"?" active":"") + '" data-pht="bearbeiten">🎨 Bearbeiten</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-pht="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-pht]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.pht; store.set("tab", tab); build();
        });
      });

      if(tab === "galerie"){
        var fileInp = container.querySelector("#photoInp");
        var upBtn = container.querySelector("#photoUpload");
        if(upBtn) upBtn.addEventListener("click", function(){ fileInp.click(); });
        if(fileInp) fileInp.addEventListener("change", function(){
          var files = Array.from(this.files || []);
          var q = store.get("quality", 0.8);
          var photos3 = store.get("photos", []);
          var pending = files.length;
          if(!pending) return;
          files.forEach(function(f){
            var reader = new FileReader();
            reader.onload = function(e){
              /* Resize für Speicher */
              var img = new Image();
              img.onload = function(){
                var canvas = document.createElement("canvas");
                var maxW = 800;
                var scale = Math.min(1, maxW / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                var c2d = canvas.getContext("2d");
                c2d.drawImage(img, 0, 0, canvas.width, canvas.height);
                var dataUrl = canvas.toDataURL("image/jpeg", q);
                photos3.push({ name: f.name, data: dataUrl, date: new Date().toLocaleString("de-DE") });
                pending--;
                if(pending === 0){
                  store.set("photos", photos3);
                  if(HalDo.Notify) HalDo.Notify.success(files.length + " Foto(s) hinzugefügt", { app: "photos" });
                  build();
                }
              };
              img.src = e.target.result;
            };
            reader.readAsDataURL(f);
          });
        });

        container.querySelectorAll("[data-photo]").forEach(function(el){
          el.addEventListener("click", function(){
            store.set("selectedPhoto", parseInt(el.dataset.photo));
            tab = "bearbeiten"; store.set("tab", tab);
            build();
          });
        });
        container.querySelectorAll("[data-photodel]").forEach(function(el){
          el.addEventListener("click", function(e){
            e.stopPropagation();
            if(!confirm("Foto löschen?")) return;
            var photos4 = store.get("photos", []);
            photos4.splice(parseInt(el.dataset.photodel), 1);
            store.set("photos", photos4);
            build();
          });
        });
      }

      if(tab === "kamera"){
        var cap = container.querySelector("#camCapture");
        var op = container.querySelector("#camOpen");
        if(op) op.addEventListener("click", function(){ cap.click(); });
        if(cap) cap.addEventListener("change", function(){
          var f = this.files[0];
          if(!f) return;
          var reader = new FileReader();
          reader.onload = function(e){
            var photos5 = store.get("photos", []);
            photos5.push({ name: f.name, data: e.target.result, date: new Date().toLocaleString("de-DE") });
            store.set("photos", photos5);
            if(HalDo.Notify) HalDo.Notify.success("Foto aufgenommen!", { app: "photos" });
            tab = "galerie"; store.set("tab", tab);
            build();
          };
          reader.readAsDataURL(f);
        });
      }

      if(tab === "bearbeiten"){
        container.querySelectorAll("[data-slider]").forEach(function(el){
          el.addEventListener("input", function(){
            store.set(el.dataset.slider, parseFloat(this.value));
            /* Live-Update */
            var br = store.get("brightness", 100);
            var co = store.get("contrast", 100);
            var sa = store.get("saturate", 100);
            var bl = store.get("blur", 0);
            var gr = store.get("grayscale", 0);
            var img = container.querySelector("img");
            if(img) img.style.filter = "brightness(" + br + "%) contrast(" + co + "%) saturate(" + sa + "%) blur(" + bl + "px) grayscale(" + gr + "%)";
            var lbl = container.querySelector('[data-lbl="' + el.dataset.slider + '"]');
            if(lbl) lbl.textContent = el.value + el.dataset.unit;
          });
        });

        var rst = container.querySelector("#bReset");
        if(rst) rst.addEventListener("click", function(){
          ["brightness","contrast","saturate","blur","grayscale"].forEach(function(k){ store.set(k, null); });
          store.set("brightness", 100); store.set("contrast", 100); store.set("saturate", 100);
          store.set("blur", 0); store.set("grayscale", 0);
          build();
        });
        var cls = container.querySelector("#bClose");
        if(cls) cls.addEventListener("click", function(){
          store.set("selectedPhoto", null);
          tab = "galerie"; store.set("tab", tab);
          build();
        });
      }

      if(tab === "settings"){
        var q = container.querySelector("#pQuality");
        if(q) q.addEventListener("input", function(){
          store.set("quality", parseFloat(this.value));
          this.previousElementSibling.textContent = "Speicher-Qualität: " + Math.round(this.value*100) + "%";
        });
        var clr = container.querySelector("#pClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Fotos löschen?")) return;
          store.set("photos", []);
          build();
        });
      }
    }

    function slider(key, label, val, min, max, unit){
      return '<div style="margin-bottom:8px">'
        + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:800;margin-bottom:3px">'
        + '<span>' + label + '</span>'
        + '<span data-lbl="' + key + '">' + val + unit + '</span>'
        + '</div>'
        + '<input type="range" data-slider="' + key + '" data-unit="' + unit + '" min="' + min + '" max="' + max + '" value="' + val + '" style="width:100%">'
        + '</div>';
    }

    build();
  }

  HalDoApp("photos", { name: "Fotos", icon: "📸", render: render, category: "lifestyle" });
  console.log("🦚 photos.js geladen");
})();
