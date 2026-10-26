/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DASHBOARD (v1.0)
   Übersicht: Aufgaben · Wasser · Stimmung · Gewohnheiten · etc.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function today(){ return new Date().toISOString().split("T")[0]; }
  function getStore(app){ try { return HalDo.Store.get(app+".data", null); } catch(e){ return null; } }
  function readKey(fullKey, def){
    try {
      var raw = localStorage.getItem(fullKey);
      if(!raw) return def;
      return JSON.parse(raw);
    } catch(e){ return def; }
  }

  function render(container, ctx){
    var store = ctx.store;

    function build(){
      var td = today();
      var now = new Date();
      var hour = now.getHours();
      var greet = hour<6?"Gute Nacht":hour<12?"Guten Morgen":hour<18?"Guten Tag":"Guten Abend";
      var userName = (HalDo.Store && HalDo.Store.get("userName","")) || "Bruder";

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.15));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">📊</div>'
        + '<div style="font-size:18px;font-weight:900;color:#4dd0e1;margin-top:6px">'+greet+', '+_esc(userName)+'!</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">'+now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+'</div>'
        + '</div>';

      // 4 Summary Cards (2x2)
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';

      // Todos
      var todos = readKey("haldo_todo_v1", null) || readKey("haldo_pro_data", null) || { todos: [] };
      var todosList = (todos && todos.todos) || (Array.isArray(todos) ? todos : []);
      var openTodos = todosList.filter(function(t){ return !t.done; }).length;
      var doneToday = todosList.filter(function(t){ return t.done && t.doneAt && new Date(t.doneAt).toISOString().split("T")[0] === td; }).length;
      html += card("📝", "Aufgaben", openTodos + " offen", doneToday ? doneToday + " heute ✓" : "—", "#4dd0e1", "todo");

      // Wasser
      var wasser = readKey("haldo_wasser_v1", {}) || {};
      var drank = (wasser.log && wasser.log[td]) || 0;
      var goal = wasser.goal || 2000;
      var pct = Math.min(100, Math.round(drank / goal * 100));
      html += card("💧", "Wasser", (drank/1000).toFixed(1) + "L", pct + "% von " + (goal/1000).toFixed(1) + "L", "#4dd0e1", "wasser");

      // Stimmung
      var stimmung = readKey("haldo_stimmung_v1", {}) || {};
      var todayMood = (stimmung.log && stimmung.log[td]);
      var MOOD_EMOJIS = ["😄","🙂","😐","😔","😢"];
      var MOOD_NAMES = ["Super","Gut","Okay","Schlecht","Sehr schlecht"];
      html += card("😊", "Stimmung", todayMood !== undefined ? MOOD_EMOJIS[todayMood.mood] : "—", todayMood !== undefined ? MOOD_NAMES[todayMood.mood] : "nicht erfasst", "#ffd54f", "stimmung");

      // Gewohnheiten
      var gewohn = readKey("haldo_gewohnheiten_v1", {}) || {};
      var gewList = gewohn.habits || [
        {id:1,name:"Wasser trinken"},{id:2,name:"Sport"},{id:3,name:"Lesen"}
      ];
      var gewLog = (gewohn.log && gewohn.log[td]) || {};
      var gewDone = gewList.filter(function(h){ return gewLog[h.id]; }).length;
      html += card("🔄", "Gewohnheiten", gewDone + "/" + gewList.length, gewDone === gewList.length && gewList.length ? "Alle ✓" : "—", "#4ade80", "gewohnheiten");
      html += '</div>';

      // Streak / Wochen-Chart
      var streak = 0;
      var d = new Date();
      for(var i=0;i<30;i++){
        var key = d.toISOString().split("T")[0];
        var w = (wasser.log && wasser.log[key]) || 0;
        if(w >= goal) streak++;
        else if(i === 0) streak = 0;
        else break;
        d.setDate(d.getDate()-1);
      }
      if(streak > 0){
        html += '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(74,222,128,.15),rgba(77,208,225,.1));border:1px solid rgba(74,222,128,.3)">'
          + '<div style="font-size:36px">🔥</div>'
          + '<div style="font-size:20px;font-weight:900;color:#4ade80;margin-top:4px">'+streak+' Tage Streak</div>'
          + '<div style="font-size:11px;color:var(--text-mute)">Wasser-Ziel erreicht</div>'
          + '</div>';
      }

      // Wochen-Übersicht Wasser
      html += '<div class="card"><h3>💧 Wasser diese Woche</h3><div style="display:flex;justify-content:space-between;gap:4px">';
      for(var j=6;j>=0;j--){
        var day = new Date(); day.setDate(day.getDate()-j);
        var k = day.toISOString().split("T")[0];
        var v = (wasser.log && wasser.log[k]) || 0;
        var h = Math.min(100, (v/goal)*100);
        var full = v >= goal;
        html += '<div style="flex:1;text-align:center">'
          + '<div style="height:50px;display:flex;align-items:flex-end;justify-content:center">'
          + '<div style="width:100%;max-width:20px;height:'+Math.max(4,h)+'%;background:'+(full?'#4ade80':'#4dd0e1')+';border-radius:4px 4px 0 0;opacity:'+(v>0?1:.3)+'"></div>'
          + '</div>'
          + '<div style="font-size:9px;color:var(--text-mute);font-weight:800;margin-top:3px">'+(k===td?"Heute":["So","Mo","Di","Mi","Do","Fr","Sa"][day.getDay()])+'</div>'
          + '</div>';
      }
      html += '</div></div>';

      // Stimmungs-Trend (7 Tage)
      html += '<div class="card"><h3>😊 Stimmung 7 Tage</h3><div style="display:flex;justify-content:space-between;gap:4px">';
      for(var m=6;m>=0;m--){
        var md = new Date(); md.setDate(md.getDate()-m);
        var mk = md.toISOString().split("T")[0];
        var me = stimmung.log && stimmung.log[mk];
        html += '<div style="flex:1;text-align:center">'
          + '<div style="font-size:22px">'+(me !== undefined ? MOOD_EMOJIS[me.mood] : "·")+'</div>'
          + '<div style="font-size:9px;color:var(--text-mute);font-weight:800;margin-top:2px">'+["So","Mo","Di","Mi","Do","Fr","Sa"][md.getDay()]+'</div>'
          + '</div>';
      }
      html += '</div></div>';

      // Quick Apps
      html += '<div class="card"><h3>⚡ Schnellzugriff</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
      var quick = [
        {id:"todo",icon:"📝",name:"Aufgaben"},
        {id:"wasser",icon:"💧",name:"Wasser"},
        {id:"stimmung",icon:"😊",name:"Stimmung"},
        {id:"pomodoro",icon:"🍅",name:"Pomodoro"}
      ];
      quick.forEach(function(a){
        html += '<button data-open="'+a.id+'" style="padding:12px 4px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;color:inherit;font-family:inherit;cursor:pointer;text-align:center"><div style="font-size:22px">'+a.icon+'</div><div style="font-size:9px;color:var(--text-mute);margin-top:3px;font-weight:800">'+a.name+'</div></button>';
      });
      html += '</div></div>';

      container.innerHTML = html;

      container.querySelectorAll("[data-open]").forEach(function(el){
        el.addEventListener("click", function(){
          if(HalDo.Apps.has(el.dataset.open)) HalDo.Apps.open(el.dataset.open);
        });
      });
      container.querySelectorAll("[data-cardapp]").forEach(function(el){
        el.addEventListener("click", function(){
          if(HalDo.Apps.has(el.dataset.cardapp)) HalDo.Apps.open(el.dataset.cardapp);
        });
      });
    }

    function card(icon, title, big, sub, color, appId){
      return '<button data-cardapp="'+appId+'" class="card" style="margin-bottom:0;padding:12px;text-align:left;color:inherit;font-family:inherit;cursor:pointer;border-left:3px solid '+color+'">'
        + '<div style="font-size:22px">'+icon+'</div>'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-top:4px">'+title+'</div>'
        + '<div style="font-size:18px;font-weight:900;color:'+color+';margin-top:2px">'+big+'</div>'
        + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:1px">'+_esc(sub)+'</div>'
        + '</button>';
    }

    function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

    build();
  }

  HalDoApp("dashboard", { name: "Dashboard", icon: "📊", render: render, category: "system" });
  console.log("🦚 dashboard.js v1.0 geladen");
})();
