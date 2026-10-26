/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HEATMAP (v1.0)
   GitHub-Style Aktivitäts-Grid · 52 Wochen · Klick-Detail
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmtDate(d){ return d.toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", selDay:null };

    function build(){
      if(view.screen === "day") screenDay();
      else screenList();
    }

    function collectActivity(){
      // Scan all haldo_* localStorage keys for date-stamped data
      var activity = {}; // date -> count
      var sources = {}; // date -> {app: count}
      try {
        for(var i=0;i<localStorage.length;i++){
          var key = localStorage.key(i);
          if(!key || key.indexOf("haldo_") !== 0) continue;
          try {
            var data = JSON.parse(localStorage.getItem(key));
            if(!data || typeof data !== "object") continue;
            var appName = key.replace("haldo_","").replace("_v1","").replace("_data","").replace("_v2","").replace("_v3","");

            // Pattern 1: { log: { "2024-01-01": {...} } }
            if(data.log && typeof data.log === "object"){
              Object.keys(data.log).forEach(function(d){
                if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
                activity[d] = (activity[d]||0) + 1;
                if(!sources[d]) sources[d] = {};
                sources[d][appName] = (sources[d][appName]||0) + 1;
              });
            }
            // Pattern 2: Array with created/doneAt timestamps
            if(Array.isArray(data)){
              data.forEach(function(item){
                if(!item) return;
                var ts = item.created || item.doneAt || item.updated;
                if(typeof ts === "number"){
                  var d = new Date(ts).toISOString().split("T")[0];
                  activity[d] = (activity[d]||0) + 1;
                  if(!sources[d]) sources[d] = {};
                  sources[d][appName] = (sources[d][appName]||0) + 1;
                }
              });
            }
            // Pattern 3: { items: [...] } or { todos: [...] } or { books: [...] }
            ["items","todos","books","memos","notes","files","spots","warnings","history","cities","habits"].forEach(function(k){
              if(Array.isArray(data[k])){
                data[k].forEach(function(item){
                  if(!item) return;
                  var ts = item.created || item.doneAt || item.updated;
                  if(typeof ts === "number"){
                    var d = new Date(ts).toISOString().split("T")[0];
                    activity[d] = (activity[d]||0) + 1;
                    if(!sources[d]) sources[d] = {};
                    sources[d][appName] = (sources[d][appName]||0) + 1;
                  }
                });
              }
            });
          } catch(e){}
        }
      } catch(e){}
      return { activity, sources };
    }

    function screenList(){
      var data = collectActivity();
      var activity = data.activity;
      var sources = data.sources;
      var weeks = 52;
      var days = weeks * 7;
      var today = new Date();
      today.setHours(0,0,0,0);

      // Start from Sunday of the week 52 weeks ago
      var start = new Date(today);
      start.setDate(start.getDate() - (weeks * 7) - start.getDay());

      var total = 0;
      Object.keys(activity).forEach(function(d){ total += activity[d]; });
      var maxDay = 0;
      Object.keys(activity).forEach(function(d){ maxDay = Math.max(maxDay, activity[d]); });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(74,222,128,.15),rgba(77,208,225,.1));border:1px solid rgba(74,222,128,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4ade80">🔥 Aktivität</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+total+' Einträge · letzte 52 Wochen</div></div>'
        + '<div style="text-align:right"><div style="font-size:16px;font-weight:900;color:#4ade80">'+Object.keys(activity).length+'</div><div style="font-size:9px;color:var(--text-mute)">aktive Tage</div></div>'
        + '</div></div>';

      // Heatmap grid
      html += '<div class="card" style="padding:12px;overflow-x:auto">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-bottom:6px">LETZTE 52 WOCHEN</div>'
        + '<div style="display:flex;gap:3px;min-width:fit-content">';

      // Day labels
      html += '<div style="display:flex;flex-direction:column;gap:3px;font-size:8px;color:var(--text-mute);padding-right:4px">';
      ["So","Mo","Di","Mi","Do","Fr","Sa"].forEach(function(d,i){
        html += '<div style="height:11px;line-height:11px;'+(i%2?"visibility:hidden":"")+'">'+d+'</div>';
      });
      html += '</div>';

      for(var w = 0; w < weeks; w++){
        html += '<div style="display:flex;flex-direction:column;gap:3px">';
        for(var d = 0; d < 7; d++){
          var date = new Date(start);
          date.setDate(start.getDate() + w*7 + d);
          if(date > today){
            html += '<div style="width:11px;height:11px;border-radius:2px;background:transparent"></div>';
            continue;
          }
          var key = fmtDate(date);
          var count = activity[key] || 0;
          var color;
          if(count === 0) color = "rgba(255,255,255,.05)";
          else if(count <= maxDay * 0.25) color = "rgba(74,222,128,.3)";
          else if(count <= maxDay * 0.5) color = "rgba(74,222,128,.55)";
          else if(count <= maxDay * 0.75) color = "rgba(74,222,128,.8)";
          else color = "#4ade80";
          var isToday = (key === fmtDate(today));
          html += '<div data-day="'+key+'" title="'+key+': '+count+' Einträge" style="width:11px;height:11px;border-radius:2px;background:'+color+';cursor:pointer;'+(isToday?'box-shadow:0 0 0 1.5px #fff;':'')+'"></div>';
        }
        html += '</div>';
      }

      html += '</div>'
        + '<div style="display:flex;align-items:center;gap:4px;margin-top:10px;font-size:9px;color:var(--text-mute);justify-content:flex-end">'
        + '<span>Weniger</span>'
        + '<div style="width:11px;height:11px;border-radius:2px;background:rgba(255,255,255,.05)"></div>'
        + '<div style="width:11px;height:11px;border-radius:2px;background:rgba(74,222,128,.3)"></div>'
        + '<div style="width:11px;height:11px;border-radius:2px;background:rgba(74,222,128,.55)"></div>'
        + '<div style="width:11px;height:11px;border-radius:2px;background:rgba(74,222,128,.8)"></div>'
        + '<div style="width:11px;height:11px;border-radius:2px;background:#4ade80"></div>'
        + '<span>Mehr</span>'
        + '</div></div>';

      // Top days
      var top = Object.keys(activity).map(function(d){ return { date:d, count:activity[d] }; })
        .sort(function(a,b){ return b.count - a.count; })
        .slice(0, 5);
      if(top.length){
        html += '<div class="card"><h3>🔥 Top-Tage</h3>';
        top.forEach(function(t){
          var source = sources[t.date] || {};
          var apps = Object.keys(source).sort(function(a,b){ return source[b]-source[a]; }).slice(0,3);
          html += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div><div style="font-size:11.5px;font-weight:800">'+new Date(t.date+"T12:00:00").toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"short"})+'</div>'
            + (apps.length ? '<div style="font-size:9.5px;color:var(--text-mute)">'+apps.map(function(a){return _esc(a);}).join(" · ")+'</div>' : '')
            + '</div>'
            + '<div style="font-size:16px;font-weight:900;color:#4ade80">'+t.count+'</div>'
            + '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;

      container.querySelectorAll("[data-day]").forEach(function(el){
        el.addEventListener("click", function(){
          var d = el.dataset.day;
          var count = activity[d] || 0;
          if(count === 0) return;
          view.selDay = d;
          view.screen = "day";
          view.sources = sources[d] || {};
          view.total = count;
          screenDay();
        });
      });
    }

    function screenDay(){
      var d = view.selDay;
      var sources = view.sources || {};
      var total = view.total || 0;
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(74,222,128,.15),rgba(77,208,225,.1))">'
        + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">'+new Date(d+"T12:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+'</div>'
        + '<div style="font-size:42px;font-weight:900;color:#4ade80;line-height:1;margin-top:6px">'+total+'</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">Einträge</div>'
        + '</div>';

      html += '<div class="card"><h3>Aktivität nach App</h3>';
      var keys = Object.keys(sources).sort(function(a,b){ return sources[b] - sources[a]; });
      if(!keys.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:20px;font-size:12px">Keine Details verfügbar</div>';
      } else {
        keys.forEach(function(k){
          var max = sources[keys[0]];
          var pct = sources[k] / max * 100;
          html += '<div style="margin-bottom:8px">'
            + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px"><span style="font-weight:800;text-transform:capitalize">'+_esc(k)+'</span><span style="color:#4ade80;font-weight:900">'+sources[k]+'</span></div>'
            + '<div style="height:6px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#4ade80,#4dd0e1);border-radius:3px"></div></div>'
            + '</div>';
        });
      }
      html += '</div>';

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "list"; build(); });
    }

    build();
  }

  HalDoApp("heatmap", { name: "Aktivität", icon: "🔥", render: render, category: "system" });
  console.log("🦚 heatmap.js v1.0 geladen");
})();
