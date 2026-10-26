/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SCIENCE LAB (v1.0)
   20 Physik-Formeln · Kategorisiert · Live
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var FORMULAS = [
    // Mechanik
    { cat:"⚙️ Mechanik", id:"geschw", name:"Geschwindigkeit", eq:"v = s / t", calc:function(p){ return p.s / p.t; }, fields:[{k:"s",l:"Strecke (m)"},{k:"t",l:"Zeit (s)"}], unit:"m/s" },
    { cat:"⚙️ Mechanik", id:"beschl", name:"Beschleunigung", eq:"a = Δv / t", calc:function(p){ return p.v / p.t; }, fields:[{k:"v",l:"Δv (m/s)"},{k:"t",l:"t (s)"}], unit:"m/s²" },
    { cat:"⚙️ Mechanik", id:"kraft", name:"Kraft (2. Newton)", eq:"F = m × a", calc:function(p){ return p.m * p.a; }, fields:[{k:"m",l:"Masse (kg)"},{k:"a",l:"Beschleunigung (m/s²)"}], unit:"N" },
    { cat:"⚙️ Mechanik", id:"arbeit", name:"Arbeit", eq:"W = F × s", calc:function(p){ return p.F * p.s; }, fields:[{k:"F",l:"Kraft (N)"},{k:"s",l:"Weg (m)"}], unit:"J" },
    { cat:"⚙️ Mechanik", id:"leistung", name:"Leistung", eq:"P = W / t", calc:function(p){ return p.W / p.t; }, fields:[{k:"W",l:"Arbeit (J)"},{k:"t",l:"Zeit (s)"}], unit:"W" },
    { cat:"⚙️ Mechanik", id:"energie", name:"Kinetische Energie", eq:"E = ½ m v²", calc:function(p){ return 0.5 * p.m * p.v * p.v; }, fields:[{k:"m",l:"Masse (kg)"},{k:"v",l:"Geschw. (m/s)"}], unit:"J" },
    // Physik
    { cat:"🌊 Wärme", id:"waerme", name:"Wärmeenergie", eq:"Q = m × c × ΔT", calc:function(p){ return p.m * 4186 * p.dT; }, fields:[{k:"m",l:"Masse Wasser (kg)"},{k:"dT",l:"ΔT (K)"}], unit:"J" },
    { cat:"💧 Dichte", id:"dichte", name:"Dichte", eq:"ρ = m / V", calc:function(p){ return p.m / p.V; }, fields:[{k:"m",l:"Masse (kg)"},{k:"V",l:"Volumen (m³)"}], unit:"kg/m³" },
    { cat:"💧 Dichte", id:"druck", name:"Druck", eq:"p = F / A", calc:function(p){ return p.F / p.A; }, fields:[{k:"F",l:"Kraft (N)"},{k:"A",l:"Fläche (m²)"}], unit:"Pa" },
    // Elektrizität
    { cat:"⚡ Elektro", id:"ohm", name:"Ohmsches Gesetz", eq:"U = R × I", calc:function(p){ return p.R * p.I; }, fields:[{k:"R",l:"Widerstand (Ω)"},{k:"I",l:"Strom (A)"}], unit:"V" },
    { cat:"⚡ Elektro", id:"elpower", name:"Elektrische Leistung", eq:"P = U × I", calc:function(p){ return p.U * p.I; }, fields:[{k:"U",l:"Spannung (V)"},{k:"I",l:"Strom (A)"}], unit:"W" },
    { cat:"⚡ Elektro", id:"elenergie", name:"Elektrische Energie", eq:"E = P × t", calc:function(p){ return p.P * p.t / 1000; }, fields:[{k:"P",l:"Leistung (W)"},{k:"t",l:"Zeit (s)"}], unit:"kJ" },
    // Kreis
    { cat:"⭕ Kreis", id:"kreis_u", name:"Kreisumfang", eq:"U = 2 π r", calc:function(p){ return 2 * Math.PI * p.r; }, fields:[{k:"r",l:"Radius (m)"}], unit:"m" },
    { cat:"⭕ Kreis", id:"kreis_a", name:"Kreisfläche", eq:"A = π r²", calc:function(p){ return Math.PI * p.r * p.r; }, fields:[{k:"r",l:"Radius (m)"}], unit:"m²" },
    { cat:"⭕ Kreis", id:"kugel_v", name:"Kugelvolumen", eq:"V = 4/3 π r³", calc:function(p){ return (4/3) * Math.PI * Math.pow(p.r,3); }, fields:[{k:"r",l:"Radius (m)"}], unit:"m³" },
    // Optik
    { cat:"🔆 Optik", id:"licht", name:"Lichtgeschwindigkeit", eq:"c = 299.792.458 m/s", calc:function(){ return 299792458; }, fields:[], unit:"m/s" },
    { cat:"🔆 Optik", id:"lichtzeit", name:"Zeit für Lichtstrecke", eq:"t = s / c", calc:function(p){ return p.s / 299792458; }, fields:[{k:"s",l:"Strecke (m)"}], unit:"s" },
    // Math
    { cat:"📐 Math", id:"pyth", name:"Pythagoras (c)", eq:"c = √(a² + b²)", calc:function(p){ return Math.sqrt(p.a*p.a + p.b*p.b); }, fields:[{k:"a",l:"Kathete a"},{k:"b",l:"Kathete b"}], unit:"" },
    { cat:"📐 Math", id:"flaeche_r", name:"Rechteck-Fläche", eq:"A = a × b", calc:function(p){ return p.a * p.b; }, fields:[{k:"a",l:"Seite a"},{k:"b",l:"Seite b"}], unit:"m²" },
    { cat:"📐 Math", id:"prozent_p", name:"Prozentwert", eq:"W = G × p/100", calc:function(p){ return p.G * p.p / 100; }, fields:[{k:"G",l:"Grundwert"},{k:"p",l:"Prozent (%)"}], unit:"" }
  ];

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", formula:null };

    function build(){
      if(view.screen === "calc") screenCalc();
      else screenList();
    }

    function screenList(){
      var byCat = {};
      FORMULAS.forEach(function(f){
        if(!byCat[f.cat]) byCat[f.cat] = [];
        byCat[f.cat].push(f);
      });
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(77,208,225,.1));border:1px solid rgba(180,120,255,.3)">'
        + '<div style="font-size:44px">🧪</div>'
        + '<div style="font-size:16px;font-weight:900;color:#b478ff;margin-top:6px">Science Lab</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+FORMULAS.length+' Physik-Formeln</div>'
        + '</div>';

      Object.keys(byCat).forEach(function(cat){
        html += '<div class="card"><h3>'+cat+'</h3>';
        byCat[cat].forEach(function(f){
          html += '<button data-formula="'+f.id+'" style="width:100%;padding:10px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-left:3px solid #b478ff;border-radius:8px;margin-bottom:4px;color:inherit;font-family:inherit;cursor:pointer;text-align:left">'
            + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<div><div style="font-size:12px;font-weight:900">'+f.name+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute);font-family:monospace;margin-top:2px">'+f.eq+'</div></div>'
            + '<div style="color:#b478ff;font-size:16px">→</div>'
            + '</div></button>';
        });
        html += '</div>';
      });
      container.innerHTML = html;
      container.querySelectorAll("[data-formula]").forEach(function(el){
        el.addEventListener("click", function(){
          view.formula = FORMULAS.find(function(f){ return f.id === el.dataset.formula; });
          view.screen = "calc"; screenCalc();
        });
      });
    }

    function screenCalc(){
      var f = view.formula;
      if(!f) return screenList();
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card" style="background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(77,208,225,.1));border:1px solid rgba(180,120,255,.3);text-align:center">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">'+f.cat+'</div>'
        + '<div style="font-size:16px;font-weight:900;color:#b478ff;margin-top:4px">'+f.name+'</div>'
        + '<div style="font-size:18px;font-weight:900;color:var(--p1);font-family:monospace;margin-top:8px;padding:10px;background:rgba(0,0,0,.3);border-radius:8px">'+f.eq+'</div>'
        + '</div>'
        + '<div class="card">';
      if(!f.fields.length){
        html += '<div style="text-align:center;padding:14px;font-size:12px;color:var(--text-mute)">Diese Formel hat keine Eingaben.</div>'
          + '<button class="btn full" id="lb-calc">Berechnen</button>';
      } else {
        f.fields.forEach(function(field){
          html += '<div class="field"><label>'+field.l+'</label><input type="number" inputmode="decimal" step="any" data-field="'+field.k+'" placeholder="'+field.l+'" style="font-size:16px;text-align:center"></div>';
        });
        html += '<button class="btn full" id="lb-calc">= Berechnen</button>';
      }
      html += '<div id="lb-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "list"; screenList(); });
      container.querySelector("#lb-calc").addEventListener("click", function(){
        var params = {};
        var missing = false;
        f.fields.forEach(function(field){
          var el = container.querySelector('[data-field="'+field.k+'"]');
          var val = parseFloat(el.value);
          if(isNaN(val)) missing = true;
          params[field.k] = val;
        });
        var out = container.querySelector("#lb-out");
        if(missing){ out.innerHTML = '<div style="color:#ff8080;text-align:center;padding:10px;font-size:12px">Bitte alle Felder ausfüllen</div>'; return; }
        try {
          var r = f.calc(params);
          if(!isFinite(r)) throw new Error("Ungültig");
          out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(180,120,255,.1);border:1px solid rgba(180,120,255,.3);border-radius:12px;text-align:center">'
            + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">ERGEBNIS</div>'
            + '<div style="font-size:32px;font-weight:900;color:#b478ff;line-height:1;margin-top:4px;font-family:monospace">'+parseFloat(r.toPrecision(10))+'</div>'
            + (f.unit ? '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">'+f.unit+'</div>' : '')
            + '</div>';
        } catch(e){
          out.innerHTML = '<div style="color:#ff8080;text-align:center;padding:10px;font-size:12px">Fehler: '+e.message+'</div>';
        }
      });
    }

    build();
  }

  HalDoApp("labor", { name: "Science Lab", icon: "🧪", render: render, category: "bildung" });
  console.log("🦚 labor.js v1.0 geladen");
})();
