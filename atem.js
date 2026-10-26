/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ATEM (v1.0)
   Atemübungen · 4-7-8 · Box · Relax
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var PATTERNS = [
    { id:"478", name:"4-7-8 (Entspannung)", desc:"Einatmen 4s · Halten 7s · Ausatmen 8s", inhale:4, hold:7, exhale:8, cycles:4 },
    { id:"box", name:"Box-Atmung", desc:"Ein 4s · Halten 4s · Aus 4s · Halten 4s", inhale:4, hold:4, exhale:4, hold2:4, cycles:4 },
    { id:"calm", name:"Ruhige Atmung", desc:"Ein 5s · Aus 5s", inhale:5, hold:0, exhale:5, cycles:6 },
    { id:"deep", name:"Tiefe Atmung", desc:"Ein 4s · Halten 2s · Aus 6s", inhale:4, hold:2, exhale:6, cycles:5 }
  ];

  function render(container, ctx){
    var store = ctx.store;
    var timer = null;
    var state = { active:false, pattern:null, phase:"idle", phaseTime:0, totalTime:0, cycle:0, elapsed:0 };

    function build(){
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(120,200,120,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">🌬️</div>'
        + '<div style="font-size:18px;font-weight:900;color:#4dd0e1;margin-top:6px">Atemübungen</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Stress abbauen · Fokus · Ruhe</div>'
        + '</div>';

      if(state.active){
        // Active session view
        var p = state.pattern;
        var phaseLabel = state.phase === "inhale" ? "Einatmen" : state.phase === "hold" ? "Halten" : state.phase === "hold2" ? "Halten" : state.phase === "exhale" ? "Ausatmen" : "Fertig";
        var phaseColor = state.phase === "inhale" ? "#4ade80" : state.phase === "exhale" ? "#4da8ff" : "#ffd54f";
        var scale = state.phase === "inhale" ? 1.4 : state.phase === "exhale" ? 0.7 : 1.0;
        var remaining = Math.max(0, state.phaseTime);
        var totalSession = p.cycles * (p.inhale + p.hold + p.exhale + (p.hold2||0));

        html += '<div class="card" style="text-align:center">'
          + '<div style="font-size:12px;color:var(--text-mute);font-weight:800;margin-bottom:14px">ZYKLUS '+Math.min(state.cycle+1,p.cycles)+' / '+p.cycles+'</div>'
          + '<div style="position:relative;width:180px;height:180px;margin:0 auto">'
          + '<div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(77,208,225,.3)"></div>'
          + '<div id="atmCircle" style="position:absolute;inset:20px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(77,208,225,.7),rgba(0,150,200,.4));box-shadow:0 0 40px rgba(77,208,225,.6);transition:transform '+(state.phase==="inhale"?p.inhale:state.phase==="exhale"?p.exhale:0.3)+'s ease-in-out;transform:scale('+scale+')"></div>'
          + '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">'
          + '<div style="font-size:16px;font-weight:900;color:'+phaseColor+'">'+phaseLabel+'</div>'
          + '<div style="font-size:32px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums">'+Math.ceil(remaining)+'</div>'
          + '</div></div>'
          + '<div style="margin-top:16px;font-size:11px;color:var(--text-mute)">Fortschritt: '+Math.floor(state.elapsed)+'s / '+totalSession+'s</div>'
          + '<button class="btn danger full" id="atmStop" style="margin-top:12px">⏹ Beenden</button>'
          + '</div>';
      } else {
        // Pattern selection
        html += '<div class="card"><h3>Wähle eine Übung</h3>';
        PATTERNS.forEach(function(p){
          html += '<button data-pat="'+p.id+'" style="width:100%;padding:14px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;margin-bottom:6px;color:inherit;font-family:inherit;text-align:left;cursor:pointer">'
            + '<div style="font-size:13px;font-weight:900;color:#4dd0e1">'+p.name+'</div>'
            + '<div style="font-size:11px;color:var(--text-dim);margin-top:3px">'+p.desc+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute);margin-top:3px">'+p.cycles+' Zyklen · ~'+Math.round(p.cycles*(p.inhale+p.hold+p.exhale+(p.hold2||0)))+'s</div>'
            + '</button>';
        });
        html += '</div>';

        // Stats
        var stats = store.get("stats", { sessions:0, minutes:0 });
        html += '<div class="card" style="display:flex;justify-content:space-around;text-align:center">'
          + '<div><div style="font-size:20px;font-weight:900;color:#4dd0e1">'+stats.sessions+'</div><div style="font-size:10px;color:var(--text-mute)">Sessions</div></div>'
          + '<div><div style="font-size:20px;font-weight:900;color:#4dd0e1">'+stats.minutes+'</div><div style="font-size:10px;color:var(--text-mute)">Minuten</div></div>'
          + '</div>';
      }

      container.innerHTML = html;
      bind();
    }

    function start(p){
      state.active = true; state.pattern = p; state.cycle = 0; state.elapsed = 0;
      nextPhase("inhale"); build(); tick();
    }

    function nextPhase(phase){
      var p = state.pattern;
      state.phase = phase;
      if(phase === "inhale") state.phaseTime = p.inhale;
      else if(phase === "hold") state.phaseTime = p.hold;
      else if(phase === "hold2") state.phaseTime = p.hold2 || 0;
      else if(phase === "exhale") state.phaseTime = p.exhale;
    }

    function tick(){
      if(timer) clearInterval(timer);
      timer = setInterval(function(){
        if(!state.active){ clearInterval(timer); return; }
        state.phaseTime -= 1;
        state.elapsed += 1;
        if(state.phaseTime <= 0){
          var p = state.pattern;
          if(state.phase === "inhale"){
            nextPhase(p.hold > 0 ? "hold" : "exhale");
          } else if(state.phase === "hold"){
            nextPhase("exhale");
          } else if(state.phase === "exhale"){
            if(p.hold2){
              nextPhase("hold2");
            } else {
              state.cycle++;
              if(state.cycle >= p.cycles){ finish(); return; }
              nextPhase("inhale");
            }
          } else if(state.phase === "hold2"){
            state.cycle++;
            if(state.cycle >= p.cycles){ finish(); return; }
            nextPhase("inhale");
          }
        }
        updateUI();
      }, 1000);
    }

    function updateUI(){
      if(!state.active) return;
      var lbl = container.querySelector("#atmCircle") && container.querySelector("#atmCircle").parentElement.querySelector("div[style*='font-size:16px']");
      // Simple re-render
      build();
    }

    function finish(){
      if(timer) clearInterval(timer);
      var p = state.pattern;
      var dur = (p.cycles * (p.inhale + p.hold + p.exhale + (p.hold2||0))) / 60;
      var stats = store.get("stats", { sessions:0, minutes:0 });
      stats.sessions++; stats.minutes = Math.round(stats.minutes + dur);
      store.set("stats", stats);
      state.active = false;
      build();
      if(HalDo.Notify) HalDo.Notify.success("Übung abgeschlossen! 🎉");
    }

    function bind(){
      container.querySelectorAll("[data-pat]").forEach(function(el){
        el.addEventListener("click", function(){
          var p = PATTERNS.find(function(x){return x.id===el.dataset.pat;});
          if(p) start(p);
        });
      });
      var stop = container.querySelector("#atmStop");
      if(stop) stop.addEventListener("click", function(){
        if(timer) clearInterval(timer);
        state.active = false; build();
      });
    }

    build();
  }

  HalDoApp("atem", { name: "Atem", icon: "🌬️", render: render, category: "gesundheit" });
  console.log("🦚 atem.js v1.0 geladen");
})();
