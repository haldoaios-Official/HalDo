/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — UMRECHNER (v1.0)
   Einheiten umrechnen · Länge · Gewicht · Volumen · Temp · etc.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var CATS = {
    laenge: {
      name:"📏 Länge", units: { "Meter":1, "Kilometer":1000, "Zentimeter":0.01, "Millimeter":0.001, "Meile":1609.344, "Yard":0.9144, "Fuß":0.3048, "Zoll":0.0254 }
    },
    gewicht: {
      name:"⚖️ Gewicht", units: { "Kilogramm":1, "Gramm":0.001, "Tonne":1000, "Pfund":0.453592, "Unze":0.0283495 }
    },
    volumen: {
      name:"🧴 Volumen", units: { "Liter":1, "Milliliter":0.001, "Kubikmeter":1000, "Gallone (US)":3.78541, "Tasse":0.24 }
    },
    flaeche: {
      name:"⬛ Fläche", units: { "Quadratmeter":1, "Quadratkilometer":1000000, "Hektar":10000, "Quadratfuß":0.092903, "Acre":4046.86 }
    },
    zeit: {
      name:"⏱️ Zeit", units: { "Sekunde":1, "Minute":60, "Stunde":3600, "Tag":86400, "Woche":604800, "Jahr":31536000 }
    },
    geschwindigkeit: {
      name:"🏎️ Geschwindigkeit", units: { "km/h":1, "m/s":3.6, "mph":1.60934, "Knoten":1.852 }
    },
    daten: {
      name:"💾 Daten", units: { "Byte":1, "Kilobyte":1024, "Megabyte":1048576, "Gigabyte":1073741824, "Terabyte":1099511627776 }
    },
    temperatur: {
      name:"🌡️ Temperatur", special: true, units: { "Celsius":"C", "Fahrenheit":"F", "Kelvin":"K" }
    }
  };

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var catId = store.get("lastCat", "laenge");
    var state = { cat: catId, from: null, to: null, value: "" };

    function convert(val, from, to){
      var cat = CATS[state.cat];
      if(cat.special){ // Temperatur
        var n = parseFloat(val); if(isNaN(n)) return "";
        if(from === to) return n.toFixed(2);
        // Umrechnen über Celsius
        var c = from === "C" ? n : from === "F" ? (n-32)*5/9 : from === "K" ? n-273.15 : n;
        if(to === "C") return c.toFixed(2);
        if(to === "F") return (c*9/5+32).toFixed(2);
        if(to === "K") return (c+273.15).toFixed(2);
      }
      var n2 = parseFloat(val); if(isNaN(n2)) return "";
      var factor = cat.units[from] / cat.units[to];
      var result = n2 * factor;
      if(Math.abs(result) >= 1) return result.toFixed(3).replace(/\.?0+$/,"");
      return result.toFixed(6).replace(/\.?0+$/,"");
    }

    function build(){
      var cat = CATS[state.cat];
      var units = Object.keys(cat.units);
      if(!state.from || !units.includes(state.from)) state.from = units[0];
      if(!state.to || !units.includes(state.to)) state.to = units[1] || units[0];

      var result = state.value ? convert(state.value, state.from, state.to) : "";

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(0,229,255,.1));border:1px solid rgba(180,120,255,.3)">'
        + '<div style="font-size:44px">🔄</div>'
        + '<div style="font-size:18px;font-weight:900;color:#b478ff;margin-top:6px">Umrechner</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Einheiten umrechnen</div>'
        + '</div>';

      // Kategorien
      html += '<div class="card"><h3>Kategorie</h3>'
        + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">';
      Object.keys(CATS).forEach(function(c){
        var active = c === state.cat;
        html += '<button data-cat="'+c+'" style="padding:10px;background:'+(active?'rgba(180,120,255,.2)':'rgba(0,0,0,.2)')+';border:1.5px solid '+(active?'#b478ff':'var(--border-soft)')+';border-radius:10px;color:'+(active?'#b478ff':'var(--text-dim)')+';font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit">'+CATS[c].name+'</button>';
      });
      html += '</div></div>';

      // Konverter
      html += '<div class="card"><h3>'+cat.name+'</h3>'
        + '<div class="field"><label>Wert</label>'
        + '<input id="uVal" type="number" inputmode="decimal" value="'+_esc(state.value)+'" placeholder="Zahl eingeben..." style="font-size:22px;text-align:center;font-weight:900;color:var(--p1)">'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center">'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800;display:block;margin-bottom:4px">VON</label>'
        + '<select id="uFrom" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + units.map(function(u){return '<option value="'+u+'"'+(state.from===u?" selected":"")+'>'+u+'</option>';}).join('')
        + '</select></div>'
        + '<button id="uSwap" style="background:rgba(180,120,255,.15);border:1px solid rgba(180,120,255,.4);color:#b478ff;border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:16px;margin-top:20px">⇄</button>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800;display:block;margin-bottom:4px">NACH</label>'
        + '<select id="uTo" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + units.map(function(u){return '<option value="'+u+'"'+(state.to===u?" selected":"")+'>'+u+'</option>';}).join('')
        + '</select></div>'
        + '</div>'
        + (result !== "" ? '<div style="margin-top:16px;padding:16px;background:rgba(180,120,255,.1);border:1px solid rgba(180,120,255,.3);border-radius:12px;text-align:center">'
            + '<div style="font-size:11px;color:var(--text-mute);font-weight:800;margin-bottom:4px">ERGEBNIS</div>'
            + '<div style="font-size:28px;font-weight:900;color:#b478ff;font-variant-numeric:tabular-nums">'+_esc(result)+'</div>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">'+_esc(state.to)+'</div>'
            + '</div>' : '')
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(){
          state.cat = el.dataset.cat; state.from = null; state.to = null;
          store.set("lastCat", state.cat); build();
        });
      });
      var vi = container.querySelector("#uVal");
      vi.addEventListener("input", function(){
        state.value = vi.value;
        var cat = CATS[state.cat];
        var result = state.value ? convert(state.value, state.from, state.to) : "";
        var box = container.querySelector('div[style*="rgba(180,120,255,.1)"]');
        // Re-render nur Ergebnis
        build();
        var newInput = container.querySelector("#uVal");
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      });
      container.querySelector("#uFrom").addEventListener("change", function(e){ state.from = e.target.value; build(); });
      container.querySelector("#uTo").addEventListener("change", function(e){ state.to = e.target.value; build(); });
      container.querySelector("#uSwap").addEventListener("click", function(){
        var t = state.from; state.from = state.to; state.to = t; build();
      });
    }

    build();
  }

  HalDoApp("umrechner", { name: "Umrechner", icon: "🔄", render: render, category: "werkzeuge" });
  console.log("🦚 umrechner.js v1.0 geladen");
})();
