/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — POMODORO (v1.0)
   25/5 Zyklen · Start/Pause · Statistiken
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var state = { phase:"work", running:false, seconds:0, sessions:0 };
    var timer = null;

    function getSettings(){ return store.get("settings", { work:25, short:5, long:15 }); }
    function getStats(){ return store.get("stats", { sessions:0, totalMin:0, today:{} }); }
    function saveStats(s){ store.set("stats", s); }

    function phaseTime(){
      var s = getSettings();
      return state.phase === "work" ? s.work*60 : state.phase === "short" ? s.short*60 : s.long*60;
    }
    function phaseColor(){ return state.phase === "work" ? "#ff6b6b" : state.phase === "short" ? "#4ade80" : "#4dd0e1"; }
    function phaseName(){ return state.phase === "work" ? "🍅 Arbeit" : state.phase === "short" ? "☕ Kurze Pause" : "🛋️ Lange Pause"; }
    function fmtTime(s){
      var m = Math.floor(s/60), sec = s%60;
      return String(m).padStart(2,"0") + ":" + String(sec).padStart(2,"0");
    }

    function build(){
      var total = phaseTime();
      var remaining = state.seconds || total;
      var pct = ((total - remaining) / total) * 100;
      var stats = getStats();
      var settings = getSettings();

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,107,107,.15),rgba(180,120,255,.1));border:1px solid '+phaseColor()+'44">'
        + '<div style="font-size:13px;font-weight:900;color:'+phaseColor()+'">'+phaseName()+'</div>'
        + '<div style="position:relative;width:220px;height:220px;margin:14px auto">'
        + '<svg viewBox="0 0 100 100" style="position:absolute;inset:0;transform:rotate(-90deg)">'
        + '<circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>'
        + '<circle cx="50" cy="50" r="44" fill="none" stroke="'+phaseColor()+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*44)+'" stroke-dashoffset="'+(2*Math.PI*44*(1-pct/100))+'" style="transition:stroke-dashoffset .5s"/>'
        + '</svg>'
        + '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">'
        + '<div style="font-size:42px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:2px">'+fmtTime(remaining)+'</div>'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-top:2px">'+Math.round(pct)+'%</div>'
        + '</div></div>'
        + '<div style="display:flex;gap:6px;margin-top:8px">'
        + '<button class="btn" id="pMain" style="flex:2;padding:14px">'+(state.running?"⏸ Pause":"▶ Start")+'</button>'
        + '<button class="btn sec" id="pReset" style="flex:1">🔄</button>'
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:6px">'
        + '<button class="btn sec" data-phase="work" style="flex:1;font-size:10.5px;padding:8px;opacity:'+(state.phase==="work"?1:0.6)+'">🍅 Arbeit</button>'
        + '<button class="btn sec" data-phase="short" style="flex:1;font-size:10.5px;padding:8px;opacity:'+(state.phase==="short"?1:0.6)+'">☕ Kurz</button>'
        + '<button class="btn sec" data-phase="long" style="flex:1;font-size:10.5px;padding:8px;opacity:'+(state.phase==="long"?1:0.6)+'">🛋️ Lang</button>'
        + '</div>'
        + '</div>';

      // Stats
      var todayKey = new Date().toISOString().split("T")[0];
      var todaySess = (stats.today && stats.today[todayKey]) || 0;
      html += '<div class="card" style="display:flex;justify-content:space-around;text-align:center">'
        + '<div><div style="font-size:22px;font-weight:900;color:'+phaseColor()+'">'+todaySess+'</div><div style="font-size:10px;color:var(--text-mute)">Heute</div></div>'
        + '<div><div style="font-size:22px;font-weight:900;color:var(--p1)">'+stats.sessions+'</div><div style="font-size:10px;color:var(--text-mute)">Gesamt</div></div>'
        + '<div><div style="font-size:22px;font-weight:900;color:var(--p2)">'+Math.round(stats.totalMin/60)+'h</div><div style="font-size:10px;color:var(--text-mute)">Fokus</div></div>'
        + '</div>';

      // Settings
      html += '<div class="card"><h3>⚙️ Zeiten</h3>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">'
        + '<div><div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-bottom:4px;text-align:center">Arbeit</div><input type="number" data-set="work" value="'+settings.work+'" min="1" max="60" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;text-align:center;font-family:inherit"></div>'
        + '<div><div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-bottom:4px;text-align:center">Kurz</div><input type="number" data-set="short" value="'+settings.short+'" min="1" max="30" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;text-align:center;font-family:inherit"></div>'
        + '<div><div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-bottom:4px;text-align:center">Lang</div><input type="number" data-set="long" value="'+settings.long+'" min="1" max="60" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;text-align:center;font-family:inherit"></div>'
        + '</div>'
        + '<button class="btn full" id="pSaveSet">Speichern</button>'
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#pMain").addEventListener("click", function(){
        state.running = !state.running;
        if(state.seconds === 0) state.seconds = phaseTime();
        if(state.running) startTimer(); else stopTimer();
        build();
      });
      container.querySelector("#pReset").addEventListener("click", function(){
        stopTimer(); state.running = false; state.seconds = 0; build();
      });
      container.querySelectorAll("[data-phase]").forEach(function(el){
        el.addEventListener("click", function(){
          stopTimer(); state.running = false; state.phase = el.dataset.phase; state.seconds = 0; build();
        });
      });
      var sg = container.querySelector("#pSaveSet");
      if(sg) sg.addEventListener("click", function(){
        var w = parseInt(container.querySelector('[data-set="work"]').value) || 25;
        var s = parseInt(container.querySelector('[data-set="short"]').value) || 5;
        var l = parseInt(container.querySelector('[data-set="long"]').value) || 15;
        store.set("settings", { work:w, short:s, long:l });
        build();
      });
    }

    function startTimer(){
      if(timer) clearInterval(timer);
      timer = setInterval(function(){
        if(state.seconds <= 0){
          completePhase(); return;
        }
        state.seconds--;
        if(state.seconds <= 0) completePhase();
        else updateDisplay();
      }, 1000);
    }
    function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } }
    function updateDisplay(){
      var total = phaseTime();
      var remaining = state.seconds;
      var pct = ((total - remaining) / total) * 100;
      var el = container.querySelector('div[style*="font-size:42px"]');
      if(el) el.textContent = fmtTime(remaining);
    }
    function completePhase(){
      stopTimer();
      state.running = false;
      if(state.phase === "work"){
        var st = getStats();
        st.sessions++; st.totalMin += getSettings().work;
        var tk = new Date().toISOString().split("T")[0];
        st.today = st.today || {}; st.today[tk] = (st.today[tk]||0) + 1;
        saveStats(st);
        if(HalDo.Notify) HalDo.Notify.success("🍅 Arbeit fertig! Pause.");
      } else {
        if(HalDo.Notify) HalDo.Notify.info("Pause vorbei!");
      }
      state.seconds = 0;
      build();
    }

    build();
  }

  HalDoApp("pomodoro", { name: "Pomodoro", icon: "🍅", render: render, category: "produktivitaet" });
  console.log("🦚 pomodoro.js v1.0 geladen");
})();
