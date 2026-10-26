/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BARCODE (v1.0)
   EAN · Code128 · Code39 · UPC · SVG-Rendering
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var TYPES = [
    { id:"CODE128", name:"Code 128", desc:"Universal (Buchstaben + Zahlen)", color:"#4dd0e1" },
    { id:"EAN13",   name:"EAN-13",   desc:"Produkt-Barcode (13 Ziffern)",   color:"#4da8ff" },
    { id:"EAN8",    name:"EAN-8",    desc:"Kurzversion (8 Ziffern)",        color:"#66cc66" },
    { id:"CODE39",  name:"Code 39",  desc:"Logistik/Industrie",              color:"#ffd54f" },
    { id:"UPC",     name:"UPC-A",    desc:"USA (12 Ziffern)",                color:"#ff8844" }
  ];

  function loadLib(cb){
    if(window.JsBarcode) return cb();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    s.onload = function(){ cb(); };
    s.onerror = function(){ cb(new Error("Lib konnte nicht geladen werden")); };
    document.head.appendChild(s);
  }

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = { type: store.get("type","CODE128"), value: store.get("value","1234567890") };

    function build(){
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(255,213,79,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">📊</div>'
        + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:6px">Barcode-Generator</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">5 Formate · Sofort-Download</div>'
        + '</div>';

      html += '<div class="card"><h3>Format</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
      TYPES.forEach(function(t){
        var active = state.type === t.id;
        html += '<button data-type="'+t.id+'" style="padding:10px;background:'+(active?t.color+'25':'rgba(0,0,0,.2)')+';border:1.5px solid '+(active?t.color:'var(--border-soft)')+';border-radius:8px;color:'+(active?t.color:'var(--text-dim)')+';cursor:pointer;font-family:inherit;text-align:left">'
          + '<div style="font-size:11.5px;font-weight:900">'+t.name+'</div>'
          + '<div style="font-size:9px;color:var(--text-mute);margin-top:2px">'+t.desc+'</div>'
          + '</button>';
      });
      html += '</div></div>';

      html += '<div class="card"><h3>Inhalt</h3>'
        + '<div class="field"><input id="bcInput" value="'+_esc(state.value)+'" placeholder="Wert eingeben..." style="font-family:monospace;font-size:14px;text-align:center"></div>'
        + '<button class="btn full" id="bcGen">📊 Barcode generieren</button>'
        + '</div>';

      html += '<div id="bcOutput"></div>';

      container.innerHTML = html;
      bind();
      generate();
    }

    function bind(){
      container.querySelectorAll("[data-type]").forEach(function(el){
        el.addEventListener("click", function(){ state.type = el.dataset.type; store.set("type", state.type); build(); });
      });
      container.querySelector("#bcInput").addEventListener("input", function(e){
        state.value = e.target.value; store.set("value", state.value);
      });
      container.querySelector("#bcGen").addEventListener("click", generate);
    }

    function generate(){
      var out = container.querySelector("#bcOutput");
      if(!out) return;
      if(!state.value.trim()){ out.innerHTML = ''; return; }
      out.innerHTML = '<div class="card" style="text-align:center;padding:20px;color:var(--text-mute)">⏳ Lade Barcode...</div>';
      loadLib(function(err){
        if(err || !window.JsBarcode){
          out.innerHTML = '<div class="card" style="text-align:center;color:#ff8080">⚠️ Bibliothek konnte nicht geladen werden. Internet prüfen.</div>';
          return;
        }
        try {
          var canvas = document.createElement("canvas");
          JsBarcode(canvas, state.value, {
            format: state.type,
            width: 2,
            height: 100,
            displayValue: true,
            background: "#ffffff",
            lineColor: "#000000",
            fontSize: 14,
            margin: 10
          });
          var dataUrl = canvas.toDataURL("image/png");
          out.innerHTML = '<div class="card" style="text-align:center">'
            + '<div style="background:#fff;padding:12px;border-radius:10px;display:inline-block;max-width:100%">'
            + '<img src="'+dataUrl+'" style="max-width:100%;height:auto;display:block">'
            + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute);margin-top:8px">'+state.type+' · '+_esc(state.value)+'</div>'
            + '<div style="display:flex;gap:6px;margin-top:10px">'
            + '<button class="btn" id="bcSave" style="flex:1">💾 Speichern</button>'
            + '</div></div>';
          container.querySelector("#bcSave").addEventListener("click", function(){
            var a = document.createElement("a");
            a.href = dataUrl; a.download = "barcode-"+state.type+"-"+Date.now()+".png"; a.click();
          });
        } catch(e){
          out.innerHTML = '<div class="card" style="text-align:center;color:#ff8080;font-size:12px">⚠️ Fehler: '+_esc(e.message)+'<br><span style="font-size:10px;color:var(--text-mute);margin-top:6px;display:inline-block">Tipp: EAN-13 braucht genau 12-13 Ziffern, Code39 keine Kleinbuchstaben.</span></div>';
        }
      });
    }

    build();
  }

  HalDoApp("barcode", { name: "Barcode", icon: "📊", render: render, category: "werkzeuge" });
  console.log("🦚 barcode.js v1.0 geladen");
})();
