/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — TIMER (v152)
   Timer · Stoppuhr · Presets · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var interval = null;
  var endTime = 0;
  var swStart = 0;
  var swElapsed = 0;
  var swRunning = false;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function fmt(sec){ var h = Math.floor(sec/3600); var m = Math.floor((sec%3600)/60); var s = sec%60; return (h?h+":":"") + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0"); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "timer");

    function build(){
      var body = "";

      /* ═══ TIMER ═══ */
      if(tab === "timer"){
        var totalSec = store.get("totalSec", 300);
        var remaining = store.get("remaining", totalSec);
        var running = store.get("running", false);
        var presets = store.get("presets", [60, 300, 600, 1800]);

        body = '<div class="card">'
          + '<div style="text-align:center;padding:24px">'
          + '<div style="font-size:64px;font-weight:900;color:var(--p1);font-variant-numeric:tabular-nums">' + fmt(remaining) + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:8px">von ' + fmt(totalSec) + '</div>'
          + '</div>';

        /* Fortschritt */
        var pct = totalSec > 0 ? ((totalSec - remaining) / totalSec * 100) : 0;
        body += '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden;margin-bottom:14px">'
          + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + pct + '%;transition:.3s"></div>'
          + '</div>';

        /* Steuerung */
        body += '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="tStart" style="flex:1">' + (running ? "⏸ Pause" : "▶ Start") + '</button>'
          + '<button class="btn sec" id="tReset" style="flex:1">🔄 Reset</button>'
          + '</div>';

        /* +1 Min / -1 Min */
        body += '<div style="display:flex;gap:8px;margin-top:8px">'
          + '<button class="btn sec" data-add="-60" style="flex:1">− 1 Min</button>'
          + '<button class="btn sec" data-add="60" style="flex:1">+ 1 Min</button>'
          + '</div>';

        /* Presets */
        body += '<div style="margin-top:14px"><div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-bottom:6px;text-transform:uppercase">Schnellwahl</div>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
        presets.forEach(function(p){
          body += '<button data-preset="' + p + '" style="padding:10px;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:10px;color:inherit;cursor:pointer;font-family:inherit;font-size:11px;font-weight:900">' + fmt(p) + '</button>';
        });
        body += '</div></div></div>';

      /* ═══ STOPPUHR ═══ */
      } else if(tab === "stoppuhr"){
        var elapsed = swElapsed + (swRunning ? Math.floor((Date.now() - swStart) / 1000) : 0);
        var laps = store.get("laps", []);

        body = '<div class="card">'
          + '<div style="text-align:center;padding:24px">'
          + '<div id="swDisplay" style="font-size:56px;font-weight:900;color:var(--p1);font-variant-numeric:tabular-nums">' + fmt(elapsed) + '</div>'
          + '</div>'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="swToggle" style="flex:2">' + (swRunning ? "⏸ Stop" : "▶ Start") + '</button>'
          + '<button class="btn sec" id="swLap" style="flex:1">📍 Runde</button>'
          + '<button class="btn sec" id="swReset" style="flex:1">🔄 Reset</button>'
          + '</div>';

        if(laps.length){
          body += '<div style="margin-top:14px;max-height:220px;overflow-y:auto">';
          laps.slice().reverse().forEach(function(l, idx){
            var ri = laps.length - 1 - idx;
            body += '<div style="padding:8px 10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;font-size:12px">'
              + '<span style="color:var(--text-mute);font-weight:800">#' + (ri + 1) + '</span>'
              + '<span style="font-weight:900;color:var(--p1)">' + fmt(l) + '</span>'
              + '</div>';
          });
          body += '</div>';
        }
        body += '</div>';

      /* ═══ SETTINGS ═══ */
      } else if(tab === "settings"){
        var soundEnabled = store.get("soundEnabled", true);
        var notifyEnabled = store.get("notifyEnabled", true);
        var presets2 = store.get("presets", []);

        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + toggleRow("soundEnabled", "🔊 Sound beim Ablauf", soundEnabled)
          + toggleRow("notifyEnabled", "🔔 Benachrichtigung", notifyEnabled)
          + '<div style="margin-top:14px"><div style="font-size:11px;font-weight:900;color:var(--text-mute);text-transform:uppercase;margin-bottom:8px">Presets</div>';
        presets2.forEach(function(p, i){
          body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div style="font-size:12px;font-weight:800">' + fmt(p) + '</div>'
            + '<button data-delPreset="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>';
        });
        body += '<div style="display:flex;gap:6px;margin-top:8px">'
          + '<input type="number" id="newPreset" placeholder="Sekunden" style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '<button class="btn" id="addPreset" style="padding:8px 14px">+</button>'
          + '</div></div></div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="timer"?" active":"") + '" data-tt="timer">⏱️ Timer</button>'
        + '<button class="tab' + (tab==="stoppuhr"?" active":"") + '" data-tt="stoppuhr">⏲️ Stoppuhr</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-tt="settings">⚙️ Einstellungen</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-tt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.tt;
          store.set("tab", tab);
          build();
        });
      });

      /* Timer-Events */
      if(tab === "timer"){
        var startBtn = container.querySelector("#tStart");
        if(startBtn) startBtn.addEventListener("click", toggleTimer);

        container.querySelector("#tReset").addEventListener("click", function(){
          stopTimer();
          store.set("remaining", store.get("totalSec", 300));
          store.set("running", false);
          build();
        });

        container.querySelectorAll("[data-add]").forEach(function(el){
          el.addEventListener("click", function(){
            var delta = parseInt(el.dataset.add);
            var rem = store.get("remaining", 300) + delta;
            if(rem < 0) rem = 0;
            store.set("remaining", rem);
            if(rem > 0) store.set("totalSec", Math.max(store.get("totalSec", 300), rem));
            build();
          });
        });

        container.querySelectorAll("[data-preset]").forEach(function(el){
          el.addEventListener("click", function(){
            stopTimer();
            var p = parseInt(el.dataset.preset);
            store.set("totalSec", p);
            store.set("remaining", p);
            store.set("running", false);
            build();
          });
        });

        /* Auto-resume falls running */
        if(store.get("running", false) && !interval){
          startTimer();
        }
      }

      /* Stoppuhr-Events */
      if(tab === "stoppuhr"){
        container.querySelector("#swToggle").addEventListener("click", function(){
          if(swRunning){
            swElapsed += Math.floor((Date.now() - swStart) / 1000);
            swRunning = false;
          } else {
            swStart = Date.now();
            swRunning = true;
            if(!interval) interval = setInterval(tickStopwatch, 200);
          }
          build();
        });

        container.querySelector("#swLap").addEventListener("click", function(){
          var elapsed = swElapsed + (swRunning ? Math.floor((Date.now() - swStart) / 1000) : 0);
          var laps = store.get("laps", []);
          laps.push(elapsed);
          store.set("laps", laps);
          build();
        });

        container.querySelector("#swReset").addEventListener("click", function(){
          swElapsed = 0; swStart = 0; swRunning = false;
          store.set("laps", []);
          if(interval){ clearInterval(interval); interval = null; }
          build();
        });

        if(swRunning && !interval){
          interval = setInterval(tickStopwatch, 200);
        }
      }

      /* Settings-Events */
      if(tab === "settings"){
        ["soundEnabled", "notifyEnabled"].forEach(function(key){
          var el = container.querySelector('[data-toggle="' + key + '"]');
          if(el) el.addEventListener("click", function(){
            store.set(key, !store.get(key, true));
            build();
          });
        });
        container.querySelectorAll("[data-delPreset]").forEach(function(el){
          el.addEventListener("click", function(){
            var p = store.get("presets", []);
            p.splice(parseInt(el.dataset.delPreset), 1);
            store.set("presets", p);
            build();
          });
        });
        container.querySelector("#addPreset").addEventListener("click", function(){
          var v = parseInt(container.querySelector("#newPreset").value);
          if(!v || v <= 0) return;
          var p = store.get("presets", []);
          p.push(v);
          store.set("presets", p);
          build();
        });
      }
    }

    function toggleRow(key, label, on){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:12.5px;font-weight:800">' + _esc(label) + '</div>'
        + '<button data-toggle="' + key + '" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (on ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (on ? "#000" : "var(--text-dim)") + '">' + (on ? "AN" : "AUS") + '</button>'
        + '</div>';
    }

    function startTimer(){
      endTime = Date.now() + store.get("remaining", 300) * 1000;
      interval = setInterval(function(){
        var rem = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        store.set("remaining", rem);
        var el = document.querySelector("#haldo-content [data-tt]");
        if(el){
          var disp = document.querySelector("#haldo-content .card div[style*='font-size:64px']");
          if(disp) disp.textContent = fmt(rem);
        }
        if(rem <= 0){
          stopTimer();
          store.set("running", false);
          if(HalDo.Notify) HalDo.Notify.success("⏱️ Timer abgelaufen!", { app: "timer", duration: 8000 });
          if(HalDo.Voice) HalDo.Voice.speak("Timer abgelaufen!");
          if(store.get("soundEnabled", true)){
            try {
              var ctx2 = window._haldoAudioCtx || (window._haldoAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
              var o = ctx2.createOscillator(); var g = ctx2.createGain();
              o.connect(g); g.connect(ctx2.destination);
              o.frequency.value = 880; g.gain.value = 0.15;
              o.start(); setTimeout(function(){ o.stop(); }, 800);
            } catch(e){}
          }
          build();
        }
      }, 200);
      store.set("running", true);
    }

    function stopTimer(){
      if(interval){ clearInterval(interval); interval = null; }
    }

    function toggleTimer(){
      var running = store.get("running", false);
      if(running){
        stopTimer();
        store.set("running", false);
      } else {
        if(store.get("remaining", 0) <= 0) store.set("remaining", store.get("totalSec", 300));
        startTimer();
      }
      build();
    }

    function tickStopwatch(){
      var el = document.getElementById("swDisplay");
      if(!el) return;
      var elapsed = swElapsed + (swRunning ? Math.floor((Date.now() - swStart) / 1000) : 0);
      el.textContent = fmt(elapsed);
    }

    build();
  }

  HalDoApp("timer", { name: "Timer", icon: "⏱️", render: render, category: "werkzeuge" });
  console.log("🦚 timer.js geladen");
})();
