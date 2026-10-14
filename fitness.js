/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — FITNESS APP (v150)
   Training · BMI · Schritte · Wasser · Gewicht · Statistik
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var WORKOUTS = {
    "Ganzkörper": [
      { n:"Liegestütze", s:"3× 15", d:"Brust, Trizeps, Schultern" },
      { n:"Kniebeugen", s:"3× 20", d:"Beine, Po" },
      { n:"Plank", s:"3× 60 sek", d:"Rumpf, Bauch" },
      { n:"Ausfallschritte", s:"3× 12 je Bein", d:"Beine, Gleichgewicht" },
      { n:"Burpees", s:"3× 10", d:"Ganzkörper, Cardio" },
      { n:"Mountain Climbers", s:"3× 30 sek", d:"Bauch, Cardio" }
    ],
    "Bauch": [
      { n:"Crunches", s:"3× 20", d:"Obere Bauchmuskeln" },
      { n:"Beinheben", s:"3× 15", d:"Untere Bauchmuskeln" },
      { n:"Plank", s:"3× 60 sek", d:"Rumpf" },
      { n:"Russian Twist", s:"3× 20", d:"Seitliche Bauchmuskeln" },
      { n:"Bicycle Crunch", s:"3× 20", d:"Schräge Bauchmuskeln" },
      { n:"Leg Raises", s:"3× 15", d:"Unterer Bauch" }
    ],
    "Oberkörper": [
      { n:"Liegestütze", s:"4× 15", d:"Brust, Trizeps" },
      { n:"Dips", s:"4× 12", d:"Trizeps, Brust" },
      { n:"Klimmzüge", s:"4× 8", d:"Rücken, Bizeps" },
      { n:"Schulterdrücken", s:"3× 12", d:"Schultern" },
      { n:"Bizeps-Curls", s:"3× 12", d:"Bizeps" },
      { n:"Trizeps-Extensions", s:"3× 12", d:"Trizeps" }
    ],
    "Beine": [
      { n:"Kniebeugen", s:"4× 20", d:"Quadrizeps, Po" },
      { n:"Ausfallschritte", s:"4× 15 je Bein", d:"Beine" },
      { n:"Wadenheben", s:"4× 25", d:"Waden" },
      { n:"Beinheben liegend", s:"3× 15", d:"Po" },
      { n:"Wall Sit", s:"3× 60 sek", d:"Quadrizeps" },
      { n:"Step-Ups", s:"3× 15 je Bein", d:"Beine, Cardio" }
    ],
    "Cardio": [
      { n:"Jumping Jacks", s:"3× 30 sek", d:"Ganzkörper" },
      { n:"High Knees", s:"3× 30 sek", d:"Beine, Cardio" },
      { n:"Burpees", s:"3× 10", d:"Ganzkörper" },
      { n:"Seilspringen", s:"3× 60 sek", d:"Cardio" },
      { n:"Squat Jumps", s:"3× 15", d:"Beine, Cardio" },
      { n:"Box Jumps", s:"3× 10", d:"Beine, Cardio" }
    ],
    "Yoga": [
      { n:"Herabschauender Hund", s:"5 Atemzüge", d:"Rücken, Beine" },
      { n:"Krieger I", s:"5 Atemzüge je Seite", d:"Beine, Rumpf" },
      { n:"Krieger II", s:"5 Atemzüge je Seite", d:"Beine, Hüfte" },
      { n:"Baum", s:"5 Atemzüge je Seite", d:"Balance" },
      { n:"Kobra", s:"5 Atemzüge", d:"Rücken" },
      { n:"Kamel", s:"5 Atemzüge", d:"Rücken" },
      { n:"Shavasana", s:"5 min", d:"Entspannung" }
    ]
  };

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "training");

    function today(){
      return new Date().toISOString().split("T")[0];
    }

    function build(){
      var body = "";

      /* ═══ TRAINING ═══ */
      if(tab === "training"){
        body = '<div class="card"><h3>💪 Workout-Pläne</h3>';
        Object.keys(WORKOUTS).forEach(function(plan){
          body += '<div style="padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.08),rgba(180,120,255,.08));border-radius:12px;margin-bottom:10px;border-left:3px solid var(--p1);cursor:pointer" data-plan="' + _esc(plan) + '">'
            + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + _esc(plan) + '</div>'
            + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">' + WORKOUTS[plan].length + ' Übungen ›</div>'
            + '</div></div>';
        });
        body += '</div>';
        body += '<div id="planView"></div>';

      /* ═══ BMI ═══ */
      } else if(tab === "bmi"){
        var data = store.get("bmi", { height: 175, weight: 75, age: 25, gender: "m" });
        body = '<div class="card"><h3>⚖️ BMI-Rechner</h3>'
          + '<div class="field"><label>Größe (cm)</label><input type="number" id="bmiH" value="' + data.height + '"></div>'
          + '<div class="field"><label>Gewicht (kg)</label><input type="number" id="bmiW" value="' + data.weight + '" step="0.1"></div>'
          + '<div class="field"><label>Alter</label><input type="number" id="bmiA" value="' + (data.age||25) + '"></div>'
          + '<div class="field"><label>Geschlecht</label><select id="bmiG">'
          + '<option value="m"' + (data.gender==="m"?" selected":"") + '>Männlich</option>'
          + '<option value="w"' + (data.gender==="w"?" selected":"") + '>Weiblich</option>'
          + '</select></div>'
          + '<button class="btn full" id="bmiGo">📊 Berechnen</button>'
          + '<div id="bmiRes" style="margin-top:14px"></div></div>';

      /* ═══ SCHRITTE ═══ */
      } else if(tab === "schritte"){
        var d = today();
        var steps = store.get("steps", {});
        var todaySteps = steps[d] || 0;
        var goal = store.get("stepsGoal", 10000);
        var pct = Math.min(100, Math.round(todaySteps / goal * 100));

        body = '<div class="card"><h3>👟 Schrittzähler</h3>'
          + '<div style="padding:24px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:14px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p1)">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;letter-spacing:2px">HEUTE</div>'
          + '<div style="font-size:52px;font-weight:900;color:var(--p1);margin:6px 0">' + todaySteps.toLocaleString("de-DE") + '</div>'
          + '<div style="font-size:11px;color:var(--text-dim)">Ziel: ' + goal.toLocaleString("de-DE") + ' (' + pct + '%)</div>'
          + '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden;margin-top:12px">'
          + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + pct + '%;transition:.3s"></div>'
          + '</div></div>'
          + '<div class="field"><label>Schritte manuell hinzufügen</label>'
          + '<div style="display:flex;gap:6px">'
          + '<input type="number" id="stepAdd" placeholder="z.B. 500" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="stepAddBtn">+</button>'
          + '</div></div>'
          + '<button class="btn sec full" id="stepReset">🔄 Heute zurücksetzen</button>'
          + '<div style="margin-top:14px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;display:block;margin-bottom:4px">Tagesziel</label>'
          + '<input type="number" id="stepGoal" value="' + goal + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '</div>';

      /* ═══ WASSER ═══ */
      } else if(tab === "wasser"){
        var d2 = today();
        var water = store.get("water", {});
        var todayWater = water[d2] || 0;
        var waterGoal = store.get("waterGoal", 8);
        var wpct = Math.min(100, Math.round(todayWater / waterGoal * 100));

        body = '<div class="card"><h3>💧 Wassertracker</h3>'
          + '<div style="padding:24px;background:linear-gradient(135deg,rgba(74,168,255,.2),rgba(0,229,255,.15));border-radius:14px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p2)">'
          + '<div style="font-size:60px">💧</div>'
          + '<div style="font-size:44px;font-weight:900;color:var(--p2);margin-top:8px">' + todayWater + ' / ' + waterGoal + '</div>'
          + '<div style="font-size:11px;color:var(--text-dim);margin-top:4px">Gläser heute (' + wpct + '%)</div>'
          + '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden;margin-top:12px">'
          + '<div style="background:linear-gradient(90deg,var(--p2),var(--p1));height:100%;width:' + wpct + '%;transition:.3s"></div>'
          + '</div></div>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">'
          + Array.from({length: 8}).map(function(_, i){
              var filled = i < todayWater;
              return '<button data-water="' + i + '" style="aspect-ratio:1;background:' + (filled ? "linear-gradient(135deg,var(--p2),var(--p1))" : "rgba(0,0,0,.3)") + ';border:1px solid var(--border-soft);border-radius:50%;font-size:22px;cursor:pointer">' + (filled ? "💧" : "·") + '</button>';
            }).join("")
          + '</div>'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="waterPlus" style="flex:1">+ 1 Glas</button>'
          + '<button class="btn sec" id="waterMinus" style="flex:1">− 1 Glas</button>'
          + '</div>'
          + '<div style="margin-top:14px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;display:block;margin-bottom:4px">Ziel (Gläser)</label>'
          + '<input type="number" id="waterGoalInp" value="' + waterGoal + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '</div>';

      /* ═══ GEWICHT ═══ */
      } else if(tab === "gewicht"){
        var weightLog = store.get("weightLog", []);
        body = '<div class="card"><h3>⚖️ Gewichtstagebuch</h3>'
          + '<div class="field"><label>Neues Gewicht (kg)</label>'
          + '<div style="display:flex;gap:6px">'
          + '<input type="number" id="wWeight" step="0.1" placeholder="75.5" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="wWeightAdd">+</button>'
          + '</div></div>';

        if(weightLog.length){
          var current = weightLog[weightLog.length - 1].weight;
          var first = weightLog[0].weight;
          var diff = (current - first).toFixed(1);
          var diffCol = diff > 0 ? "#ff8080" : diff < 0 ? "#4ade80" : "var(--text-dim)";
          var diffTxt = diff > 0 ? "+" + diff : diff;

          body += '<div style="padding:16px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;text-align:center;margin-bottom:14px">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">AKTUELL</div>'
            + '<div style="font-size:38px;font-weight:900;color:var(--p1);margin:4px 0">' + current.toFixed(1) + ' kg</div>'
            + '<div style="font-size:11px;color:' + diffCol + '">' + diffTxt + ' kg seit Beginn</div>'
            + '</div>';

          body += '<div style="max-height:300px;overflow-y:auto">';
          weightLog.slice().reverse().forEach(function(w, idx){
            var ri = weightLog.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:11px;color:var(--text-mute)">' + _esc(w.date) + '</div>'
              + '<div style="font-size:15px;font-weight:900;color:var(--p1)">' + w.weight.toFixed(1) + ' kg</div></div>'
              + '<button data-wdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
          body += '</div>';
        } else {
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Einträge</div>';
        }
        body += '</div>';

      /* ═══ STATISTIK ═══ */
      } else if(tab === "stats"){
        var steps2 = store.get("steps", {});
        var water2 = store.get("water", {});
        var weightLog2 = store.get("weightLog", []);
        var stepsGoal = store.get("stepsGoal", 10000);

        /* Letzte 7 Tage */
        var last7 = [];
        for(var i = 6; i >= 0; i--){
          var d3 = new Date();
          d3.setDate(d3.getDate() - i);
          var key = d3.toISOString().split("T")[0];
          last7.push({
            date: key,
            label: ["So","Mo","Di","Mi","Do","Fr","Sa"][d3.getDay()],
            steps: steps2[key] || 0,
            water: water2[key] || 0
          });
        }
        var maxSteps = Math.max.apply(null, last7.map(function(d){ return d.steps; }).concat([stepsGoal]));
        var totalSteps = last7.reduce(function(s, d){ return s + d.steps; }, 0);
        var avgSteps = Math.round(totalSteps / 7);
        var totalWater = last7.reduce(function(s, d){ return s + d.water; }, 0);

        body = '<div class="card"><h3>📊 7-Tage-Statistik</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
          + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">Ø Schritte</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + avgSteps.toLocaleString("de-DE") + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(74,168,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">Wasser Woche</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p2)">' + totalWater + ' 💧</div>'
          + '</div>'
          + '</div>';
        body += '<div style="padding:14px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700;margin-bottom:10px">SCHRITTE PRO TAG</div>';
        last7.forEach(function(d){
          var pct = Math.round(d.steps / maxSteps * 100);
          body += '<div style="margin-bottom:8px">'
            + '<div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:3px">'
            + '<span style="font-weight:800">' + d.label + '</span>'
            + '<span style="color:var(--p1);font-weight:800">' + d.steps.toLocaleString("de-DE") + '</span></div>'
            + '<div style="background:rgba(0,0,0,.4);height:6px;border-radius:3px;overflow:hidden">'
            + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + pct + '%"></div>'
            + '</div></div>';
        });
        body += '</div></div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="training"?" active":"") + '" data-ft="training">💪 Training</button>'
        + '<button class="tab' + (tab==="bmi"?" active":"") + '" data-ft="bmi">⚖️ BMI</button>'
        + '<button class="tab' + (tab==="schritte"?" active":"") + '" data-ft="schritte">👟 Schritte</button>'
        + '<button class="tab' + (tab==="wasser"?" active":"") + '" data-ft="wasser">💧 Wasser</button>'
        + '<button class="tab' + (tab==="gewicht"?" active":"") + '" data-ft="gewicht">⚖️ Gewicht</button>'
        + '<button class="tab' + (tab==="stats"?" active":"") + '" data-ft="stats">📊 Statistik</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-ft]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.ft;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Training-Plan anzeigen ═══ */
      if(tab === "training"){
        container.querySelectorAll("[data-plan]").forEach(function(el){
          el.addEventListener("click", function(){
            var plan = el.dataset.plan;
            var view = container.querySelector("#planView");
            var list = WORKOUTS[plan];
            var h = '<div class="card"><h3>🏋️ ' + _esc(plan) + '</h3>';
            list.forEach(function(w, i){
              h += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
                + '<div><div style="font-size:13px;font-weight:800">' + (i+1) + '. ' + _esc(w.n) + '</div>'
                + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(w.d) + '</div></div>'
                + '<div style="font-size:12px;font-weight:900;color:var(--p1)">' + _esc(w.s) + '</div>'
                + '</div>';
            });
            h += '<button class="btn full" id="startPlan" style="margin-top:12px">▶ Workout starten</button>';
            h += '</div>';
            view.innerHTML = h;
            var sb = view.querySelector("#startPlan");
            if(sb) sb.addEventListener("click", function(){
              if(window.HalDo.Notify) HalDo.Notify.info("Workout gestartet: " + plan, { app: "fitness" });
              if(window.HalDo.Voice) HalDo.Voice.speak("Workout gestartet: " + plan + ". Viel Erfolg, Bruder!");
              view.scrollIntoView({ behavior: "smooth" });
            });
          });
        });
      }

      /* ═══ BMI ═══ */
      if(tab === "bmi"){
        container.querySelector("#bmiGo").addEventListener("click", function(){
          var h = parseFloat(container.querySelector("#bmiH").value);
          var w = parseFloat(container.querySelector("#bmiW").value);
          var a = parseInt(container.querySelector("#bmiA").value) || 25;
          var g = container.querySelector("#bmiG").value;
          if(!h || !w){ alert("Größe und Gewicht eingeben"); return; }
          var bmi = w / ((h/100) * (h/100));
          var cat, col, emoji;
          if(bmi < 18.5){ cat = "Untergewicht"; col = "#4da8ff"; emoji = "🔵"; }
          else if(bmi < 25){ cat = "Normalgewicht"; col = "#4ade80"; emoji = "🟢"; }
          else if(bmi < 30){ cat = "Übergewicht"; col = "#fbbf24"; emoji = "🟡"; }
          else { cat = "Adipositas"; col = "#ff8080"; emoji = "🔴"; }

          /* Idealgewicht */
          var idealMin = 18.5 * (h/100) * (h/100);
          var idealMax = 25 * (h/100) * (h/100);

          container.querySelector("#bmiRes").innerHTML = '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;border:1.5px solid ' + col + '">'
            + '<div style="font-size:60px">' + emoji + '</div>'
            + '<div style="font-size:42px;font-weight:900;color:' + col + ';margin-top:8px">' + bmi.toFixed(1) + '</div>'
            + '<div style="font-size:14px;font-weight:800;color:' + col + ';margin-top:4px">' + cat + '</div>'
            + '<div style="font-size:11px;color:var(--text-dim);margin-top:10px">Idealgewicht: ' + idealMin.toFixed(1) + ' – ' + idealMax.toFixed(1) + ' kg</div>'
            + '</div>';

          store.set("bmi", { height: h, weight: w, age: a, gender: g });
          if(window.HalDo.Voice) HalDo.Voice.speak("Dein BMI ist " + bmi.toFixed(1) + ". " + cat);
        });
      }

      /* ═══ Schritte ═══ */
      if(tab === "schritte"){
        container.querySelector("#stepAddBtn").addEventListener("click", function(){
          var add = parseInt(container.querySelector("#stepAdd").value);
          if(!add || add <= 0) return;
          var d4 = today();
          var steps3 = store.get("steps", {});
          steps3[d4] = (steps3[d4] || 0) + add;
          store.set("steps", steps3);
          build();
        });
        container.querySelector("#stepReset").addEventListener("click", function(){
          if(!confirm("Heute zurücksetzen?")) return;
          var d5 = today();
          var steps4 = store.get("steps", {});
          steps4[d5] = 0;
          store.set("steps", steps4);
          build();
        });
        container.querySelector("#stepGoal").addEventListener("change", function(){
          store.set("stepsGoal", parseInt(this.value) || 10000);
        });
      }

      /* ═══ Wasser ═══ */
      if(tab === "wasser"){
        container.querySelectorAll("[data-water]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.water);
            var d6 = today();
            var water3 = store.get("water", {});
            var cur = water3[d6] || 0;
            water3[d6] = (i < cur) ? i : i + 1;
            store.set("water", water3);
            build();
          });
        });
        container.querySelector("#waterPlus").addEventListener("click", function(){
          var d7 = today();
          var water4 = store.get("water", {});
          water4[d7] = (water4[d7] || 0) + 1;
          store.set("water", water4);
          build();
        });
        container.querySelector("#waterMinus").addEventListener("click", function(){
          var d8 = today();
          var water5 = store.get("water", {});
          water5[d8] = Math.max(0, (water5[d8] || 0) - 1);
          store.set("water", water5);
          build();
        });
        container.querySelector("#waterGoalInp").addEventListener("change", function(){
          store.set("waterGoal", parseInt(this.value) || 8);
        });
      }

      /* ═══ Gewicht ═══ */
      if(tab === "gewicht"){
        container.querySelector("#wWeightAdd").addEventListener("click", function(){
          var w = parseFloat(container.querySelector("#wWeight").value);
          if(!w || w <= 0){ alert("Gewicht eingeben"); return; }
          var log = store.get("weightLog", []);
          log.push({ weight: w, date: new Date().toLocaleDateString("de-DE") });
          store.set("weightLog", log);
          build();
        });
        container.querySelectorAll("[data-wdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var log = store.get("weightLog", []);
            log.splice(parseInt(el.dataset.wdel), 1);
            store.set("weightLog", log);
            build();
          });
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("fitness", { render: render });
  else console.warn("fitness.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 fitness.js geladen");
