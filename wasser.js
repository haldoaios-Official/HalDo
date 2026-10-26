/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WASSER (v1.0)
   Täglicher Wassertracker · Ziel · Verlauf
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function today(){ return new Date().toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;

    function getGoal(){ return store.get("goal", 2000); }
    function getLog(){ return store.get("log", {}); }
    function saveLog(l){ store.set("log", l); }

    function build(){
      var goal = getGoal();
      var log = getLog();
      var td = today();
      var drank = log[td] || 0;
      var pct = Math.min(100, Math.round(drank / goal * 100));

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(0,150,200,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:56px">💧</div>'
        + '<div style="font-size:32px;font-weight:900;color:#4dd0e1;font-variant-numeric:tabular-nums">'+(drank/1000).toFixed(2)+' L</div>'
        + '<div style="font-size:11px;color:var(--text-mute)">von '+(goal/1000).toFixed(1)+' L Ziel</div>'
        + '<div style="margin-top:10px;height:10px;background:rgba(0,0,0,.3);border-radius:5px;overflow:hidden">'
        + '<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#4dd0e1,#00bcd4);border-radius:5px;transition:width .3s"></div>'
        + '</div>'
        + '<div style="margin-top:6px;font-size:11px;color:#4dd0e1;font-weight:900">'+pct+'%</div>'
        + (drank >= goal ? '<div style="margin-top:8px;font-size:12px;font-weight:900;color:#4ade80">🎉 Ziel erreicht!</div>' : '')
        + '</div>';

      html += '<div class="card"><h3>Schnell hinzufügen</h3>'
        + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">'
        + [200,250,300,500].map(function(ml){
          return '<button data-add="'+ml+'" class="btn sec" style="padding:14px 8px;font-size:14px">+'+ml+' ml</button>';
        }).join('')
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">'
        + '<button data-add="-1" class="btn sec">− Rückgängig</button>'
        + '<button data-custom class="btn">+ Eigene Menge</button>'
        + '</div></div>';

      // 7-Tage Verlauf
      html += '<div class="card"><h3>📊 Letzte 7 Tage</h3><div style="display:flex;justify-content:space-between;gap:4px">';
      for(var i=6;i>=0;i--){
        var d = new Date(); d.setDate(d.getDate()-i);
        var key = d.toISOString().split("T")[0];
        var v = log[key] || 0;
        var h = Math.min(100, (v/goal)*100);
        var dayLbl = ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()];
        var full = v >= goal;
        html += '<div style="flex:1;text-align:center">'
          + '<div style="height:60px;display:flex;align-items:flex-end;justify-content:center">'
          + '<div style="width:100%;max-width:24px;height:'+Math.max(4,h)+'%;background:'+(full?'linear-gradient(180deg,#4ade80,#22c55e)':'linear-gradient(180deg,#4dd0e1,#00bcd4)')+';border-radius:4px 4px 0 0;opacity:'+(v>0?1:.35)+'"></div>'
          + '</div>'
          + '<div style="font-size:9px;color:var(--text-mute);font-weight:800;margin-top:4px">'+dayLbl+'</div>'
          + '<div style="font-size:8px;color:var(--text-mute);margin-top:1px">'+(v?(v/1000).toFixed(1):"")+'</div>'
          + '</div>';
      }
      html += '</div></div>';

      // Ziel
      html += '<div class="card"><h3>🎯 Tagesziel</h3>'
        + '<div style="display:flex;gap:6px">'
        + '<input type="number" id="wGoal" value="'+goal+'" min="500" max="5000" step="100" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-family:inherit;font-size:13px">'
        + '<button class="btn" id="wSaveGoal">Speichern</button>'
        + '</div>'
        + '<div style="font-size:10px;color:var(--text-mute);margin-top:6px">Standard: 2000 ml (2L)</div>'
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelectorAll("[data-add]").forEach(function(el){
        el.addEventListener("click", function(){
          var v = el.dataset.add;
          var log = getLog(); var td = today();
          if(v === "-1"){
            log[td] = Math.max(0, (log[td]||0) - 250);
          } else {
            log[td] = (log[td]||0) + parseInt(v);
          }
          saveLog(log); build();
          if(v !== "-1" && HalDo.Notify) HalDo.Notify.success("+"+v+" ml");
        });
      });
      var custom = container.querySelector("[data-custom]");
      if(custom) custom.addEventListener("click", function(){
        var input = prompt("Wieviel ml?", "250");
        if(!input) return;
        var n = parseInt(input);
        if(!n || n <= 0 || n > 5000) return;
        var log = getLog(); var td = today();
        log[td] = (log[td]||0) + n; saveLog(log); build();
      });
      var sg = container.querySelector("#wSaveGoal");
      if(sg) sg.addEventListener("click", function(){
        var g = parseInt(container.querySelector("#wGoal").value);
        if(!g || g < 500 || g > 5000) return;
        store.set("goal", g); build();
        if(HalDo.Notify) HalDo.Notify.success("Ziel gespeichert");
      });
    }

    build();
  }

  HalDoApp("wasser", { name: "Wasser", icon: "💧", render: render, category: "gesundheit" });
  console.log("🦚 wasser.js v1.0 geladen");
})();
