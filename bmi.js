/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BMI & GESUNDHEIT (v1.0)
   BMI · Idealgewicht · Kalorienbedarf · Wasserbedarf
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var view = store.get("view", "bmi");

    function build(){
      if(view === "bmi") screenBmi();
      else if(view === "kalorien") screenKalorien();
    }

    function tabs(){
      return '<div class="tabs">'
        + '<button class="tab'+(view==="bmi"?" active":"")+'" data-tab="bmi">⚖️ BMI</button>'
        + '<button class="tab'+(view==="kalorien"?" active":"")+'" data-tab="kalorien">🔥 Kalorien</button>'
        + '</div>';
    }

    function bindTabs(){
      container.querySelectorAll("[data-tab]").forEach(function(el){
        el.addEventListener("click", function(){ view = el.dataset.tab; store.set("view", view); build(); });
      });
    }

    function screenBmi(){
      var saved = store.get("lastData", { height:175, weight:75, age:30, gender:"m" });
      var html = tabs()
        + '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(102,204,102,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">⚖️</div>'
        + '<div style="font-size:18px;font-weight:900;color:#4dd0e1;margin-top:6px">BMI-Rechner</div>'
        + '</div>';

      html += '<div class="card">'
        + '<div class="field"><label>Geschlecht</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
        + '<button data-gender="m" style="padding:10px;background:'+(saved.gender==="m"?'rgba(77,208,225,.2)':'rgba(0,0,0,.2)')+';border:1.5px solid '+(saved.gender==="m"?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;color:inherit;font-family:inherit;cursor:pointer;font-weight:800">👨 Männlich</button>'
        + '<button data-gender="w" style="padding:10px;background:'+(saved.gender==="w"?'rgba(255,107,107,.2)':'rgba(0,0,0,.2)')+';border:1.5px solid '+(saved.gender==="w"?'#ff6b6b':'var(--border-soft)')+';border-radius:8px;color:inherit;font-family:inherit;cursor:pointer;font-weight:800">👩 Weiblich</button>'
        + '</div></div>'
        + '<div class="field"><label>Größe (cm)</label><input id="bmi-h" type="number" value="'+saved.height+'" min="100" max="250" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Gewicht (kg)</label><input id="bmi-w" type="number" value="'+saved.weight+'" min="20" max="300" step="0.1" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Alter</label><input id="bmi-a" type="number" value="'+saved.age+'" min="10" max="120" style="font-size:16px;text-align:center"></div>'
        + '<button class="btn full" id="bmi-calc">= Berechnen</button>'
        + '<div id="bmi-out"></div></div>';

      container.innerHTML = html;
      bindTabs();
      var gender = saved.gender;
      container.querySelectorAll("[data-gender]").forEach(function(el){
        el.addEventListener("click", function(){ gender = el.dataset.gender; screenBmi(); });
      });
      container.querySelector("#bmi-calc").addEventListener("click", function(){
        var h = parseFloat(container.querySelector("#bmi-h").value);
        var w = parseFloat(container.querySelector("#bmi-w").value);
        var a = parseInt(container.querySelector("#bmi-a").value);
        if(!h || !w || !a) return;
        store.set("lastData", { height:h, weight:w, age:a, gender:gender });
        var bmi = w / ((h/100)*(h/100));
        var cat, color;
        if(bmi < 18.5){ cat = "Untergewicht"; color = "#4da8ff"; }
        else if(bmi < 25){ cat = "Normalgewicht"; color = "#4ade80"; }
        else if(bmi < 30){ cat = "Übergewicht"; color = "#ffd54f"; }
        else if(bmi < 35){ cat = "Adipositas I"; color = "#ff8844"; }
        else if(bmi < 40){ cat = "Adipositas II"; color = "#ff5555"; }
        else { cat = "Adipositas III"; color = "#ff3333"; }
        var idealMin = 18.5 * ((h/100)*(h/100));
        var idealMax = 24.9 * ((h/100)*(h/100));

        var out = container.querySelector("#bmi-out");
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:'+color+'15;border:1px solid '+color+'66;border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">DEIN BMI</div>'
          + '<div style="font-size:42px;font-weight:900;color:'+color+';line-height:1">'+bmi.toFixed(1)+'</div>'
          + '<div style="font-size:14px;font-weight:900;color:'+color+';margin-top:4px">'+cat+'</div>'
          + '<div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">IDEALGEWICHT (BMI 18.5-24.9)</div>'
          + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:4px">'+idealMin.toFixed(1)+' – '+idealMax.toFixed(1)+' kg</div>'
          + (w > idealMax ? '<div style="font-size:11px;color:#ff8844;margin-top:6px">−'+(w-idealMax).toFixed(1)+' kg bis Idealbereich</div>' : '')
          + (w < idealMin ? '<div style="font-size:11px;color:#4da8ff;margin-top:6px">+'+(idealMin-w).toFixed(1)+' kg bis Idealbereich</div>' : '')
          + '</div>'
          + '<div style="margin-top:12px;font-size:10px;color:var(--text-mute);font-style:italic">BMI ist ein grober Indikator. Muskelmasse nicht berücksichtigt.</div>'
          + '</div>';
      });
    }

    function screenKalorien(){
      var saved = store.get("lastData", { height:175, weight:75, age:30, gender:"m" });
      var activity = store.get("activity", "1.55");
      var goal = store.get("goal", "maintain");
      var html = tabs()
        + '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,107,107,.15),rgba(255,213,79,.1));border:1px solid rgba(255,107,107,.3)">'
        + '<div style="font-size:44px">🔥</div>'
        + '<div style="font-size:18px;font-weight:900;color:#ff6b6b;margin-top:6px">Kalorien & Wasser</div>'
        + '</div>';

      html += '<div class="card">'
        + '<div class="field"><label>Größe (cm)</label><input id="k-h" type="number" value="'+saved.height+'" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Gewicht (kg)</label><input id="k-w" type="number" value="'+saved.weight+'" step="0.1" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Alter</label><input id="k-a" type="number" value="'+saved.age+'" style="font-size:16px;text-align:center"></div>'
        + '<div class="field"><label>Geschlecht</label><select id="k-g"><option value="m"'+(saved.gender==="m"?" selected":"")+'>Männlich</option><option value="w"'+(saved.gender==="w"?" selected":"")+'>Weiblich</option></select></div>'
        + '<div class="field"><label>Aktivität</label><select id="k-act">'
        + '<option value="1.2"'+(activity==="1.2"?" selected":"")+'>Sitzend (wenig Bewegung)</option>'
        + '<option value="1.375"'+(activity==="1.375"?" selected":"")+'>Leicht (1-3x Sport/Woche)</option>'
        + '<option value="1.55"'+(activity==="1.55"?" selected":"")+'>Mittel (3-5x Sport/Woche)</option>'
        + '<option value="1.725"'+(activity==="1.725"?" selected":"")+'>Hoch (6-7x Sport/Woche)</option>'
        + '<option value="1.9"'+(activity==="1.9"?" selected":"")+'>Extrem (Athlet)</option>'
        + '</select></div>'
        + '<button class="btn full" id="k-calc">= Berechnen</button>'
        + '<div id="k-out"></div></div>';

      container.innerHTML = html;
      bindTabs();
      container.querySelector("#k-calc").addEventListener("click", function(){
        var h = parseFloat(container.querySelector("#k-h").value);
        var w = parseFloat(container.querySelector("#k-w").value);
        var a = parseInt(container.querySelector("#k-a").value);
        var g = container.querySelector("#k-g").value;
        var act = parseFloat(container.querySelector("#k-act").value);
        if(!h || !w || !a) return;
        store.set("lastData", { height:h, weight:w, age:a, gender:g });
        store.set("activity", String(act));
        // Mifflin-St Jeor
        var bmr = g === "m" ? (10*w + 6.25*h - 5*a + 5) : (10*w + 6.25*h - 5*a - 161);
        var tdee = bmr * act;
        var out = container.querySelector("#k-out");
        out.innerHTML = '<div style="margin-top:14px">'
          + '<div style="padding:14px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);border-radius:12px;text-align:center;margin-bottom:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">GRUNDUMSATZ (BMR)</div>'
          + '<div style="font-size:28px;font-weight:900;color:#ff6b6b;margin-top:2px">'+Math.round(bmr)+' kcal</div>'
          + '<div style="font-size:10px;color:var(--text-mute)">Nur im Ruhezustand</div>'
          + '</div>'
          + '<div style="padding:14px;background:rgba(255,213,79,.1);border:1px solid rgba(255,213,79,.3);border-radius:12px;text-align:center;margin-bottom:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">GESAMTUMSATZ (TDEE)</div>'
          + '<div style="font-size:28px;font-weight:900;color:#ffd54f;margin-top:2px">'+Math.round(tdee)+' kcal</div>'
          + '<div style="font-size:10px;color:var(--text-mute)">Täglicher Bedarf bei deiner Aktivität</div>'
          + '</div>'
          + '<div style="padding:14px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">💧 WASSERBEDARF</div>'
          + '<div style="font-size:22px;font-weight:900;color:#4dd0e1;margin-top:2px">'+(w*35/1000).toFixed(1)+' L</div>'
          + '<div style="font-size:10px;color:var(--text-mute)">Faustregel: 35ml/kg</div>'
          + '</div>'
          + '</div>';
      });
    }

    build();
  }

  HalDoApp("bmi", { name: "BMI", icon: "⚖️", render: render, category: "gesundheit" });
  console.log("🦚 bmi.js v1.0 geladen");
})();
