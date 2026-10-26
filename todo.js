/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — TODO PRO (v1.0)
   Kategorien · Prioritäten · Subtasks · Fälligkeit · Filter
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var PRIORITIES = [
    { id:"low",    name:"Niedrig",  icon:"🟢", color:"#4ade80", order:3 },
    { id:"mid",    name:"Mittel",   icon:"🟡", color:"#ffd54f", order:2 },
    { id:"high",   name:"Hoch",     icon:"🟠", color:"#ff9800", order:1 },
    { id:"urgent", name:"Dringend", icon:"🔴", color:"#ff5555", order:0 }
  ];
  var DEFAULT_CATS = [
    { id:"privat",   name:"Privat",   icon:"🏠", color:"#4dd0e1" },
    { id:"arbeit",   name:"Arbeit",   icon:"💼", color:"#b478ff" },
    { id:"einkauf",  name:"Einkauf",  icon:"🛒", color:"#66bb6a" },
    { id:"gesundheit", name:"Gesundheit", icon:"💊", color:"#ff6b6b" }
  ];

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", editId:null, filterCat:"all", filterPrio:"all", showDone:false };

    function getCats(){ var c = store.get("cats", null); if(!c){ c = JSON.parse(JSON.stringify(DEFAULT_CATS)); store.set("cats", c); } return c; }
    function getTodos(){ return store.get("todos", []); }
    function saveTodos(t){ store.set("todos", t); }

    function sortTodos(list){
      return list.sort(function(a,b){
        if(a.done !== b.done) return a.done ? 1 : -1;
        var pa = (PRIORITIES.find(function(p){return p.id===a.prio;})||{order:3}).order;
        var pb = (PRIORITIES.find(function(p){return p.id===b.prio;})||{order:3}).order;
        if(pa !== pb) return pa - pb;
        if(a.due && b.due) return a.due.localeCompare(b.due);
        if(a.due) return -1;
        if(b.due) return 1;
        return (b.created||0) - (a.created||0);
      });
    }

    function screenList(){
      var todos = getTodos();
      var cats = getCats();
      var filtered = todos.filter(function(t){
        if(!view.showDone && t.done) return false;
        if(view.filterCat !== "all" && t.cat !== view.filterCat) return false;
        if(view.filterPrio !== "all" && t.prio !== view.filterPrio) return false;
        return true;
      });
      sortTodos(filtered);
      var open = todos.filter(function(t){return !t.done;}).length;
      var done = todos.filter(function(t){return t.done;}).length;
      var overdue = todos.filter(function(t){ return !t.done && t.due && t.due < new Date().toISOString().split("T")[0]; }).length;

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:18px;font-weight:900;color:#4dd0e1">📝 Aufgaben</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+open+' offen · '+done+' erledigt'+(overdue?' · <span style="color:#ff8080">'+overdue+' überfällig</span>':'')+'</div></div>'
        + '<button class="btn" id="tdAdd" style="padding:10px 16px;font-size:12px">➕</button>'
        + '</div></div>';

      // Filter
      html += '<div class="card" style="padding:10px">';
      html += '<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:4px;margin-bottom:6px">';
      html += '<button data-fcat="all" style="padding:6px 10px;background:'+(view.filterCat==="all"?'rgba(77,208,225,.25)':'rgba(0,0,0,.2)')+';border:1px solid '+(view.filterCat==="all"?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;color:'+(view.filterCat==="all"?'#4dd0e1':'var(--text-mute)')+';font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">Alle</button>';
      cats.forEach(function(c){
        var active = view.filterCat === c.id;
        html += '<button data-fcat="'+c.id+'" style="padding:6px 10px;background:'+(active?c.color+'25':'rgba(0,0,0,.2)')+';border:1px solid '+(active?c.color:'var(--border-soft)')+';border-radius:8px;color:'+(active?c.color:'var(--text-mute)')+';font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">'+c.icon+' '+_esc(c.name)+'</button>';
      });
      html += '</div>';
      html += '<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">';
      html += '<button data-fprio="all" style="padding:5px 9px;background:'+(view.filterPrio==="all"?'rgba(255,213,79,.2)':'rgba(0,0,0,.2)')+';border:1px solid '+(view.filterPrio==="all"?'#ffd54f':'var(--border-soft)')+';border-radius:8px;color:'+(view.filterPrio==="all"?'#ffd54f':'var(--text-mute)')+';font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">Prio: Alle</button>';
      PRIORITIES.forEach(function(p){
        var active = view.filterPrio === p.id;
        html += '<button data-fprio="'+p.id+'" style="padding:5px 9px;background:'+(active?p.color+'25':'rgba(0,0,0,.2)')+';border:1px solid '+(active?p.color:'var(--border-soft)')+';border-radius:8px;color:'+(active?p.color:'var(--text-mute)')+';font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">'+p.icon+' '+p.name+'</button>';
      });
      html += '</div>';
      html += '<button data-toggledone style="margin-top:8px;padding:6px 10px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:8px;color:var(--text-mute);font-size:10.5px;font-weight:800;cursor:pointer;font-family:inherit">'+(view.showDone?'✓ Erledigte ausblenden':'👁 Erledigte anzeigen')+'</button>';
      html += '</div>';

      // List
      if(!filtered.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">✨</div><div style="font-size:13px;color:var(--text-mute);margin-top:10px">'+(todos.length?'Keine Aufgaben mit diesem Filter':'Noch keine Aufgaben')+'</div></div>';
      } else {
        html += '<div class="card">';
        filtered.forEach(function(t){
          var cat = cats.find(function(c){return c.id===t.cat;}) || cats[0];
          var prio = PRIORITIES.find(function(p){return p.id===t.prio;}) || PRIORITIES[1];
          var subDone = (t.sub||[]).filter(function(s){return s.done;}).length;
          var subTotal = (t.sub||[]).length;
          var isOverdue = t.due && t.due < new Date().toISOString().split("T")[0] && !t.done;
          var dueLabel = "";
          if(t.due){
            var d = new Date(t.due + "T12:00:00");
            var today = new Date(); today.setHours(0,0,0,0);
            var diff = Math.round((d - today) / 86400000);
            if(diff === 0) dueLabel = "Heute";
            else if(diff === 1) dueLabel = "Morgen";
            else if(diff === -1) dueLabel = "Gestern";
            else if(diff < 0) dueLabel = diff*-1 + " Tage her";
            else if(diff < 7) dueLabel = "in " + diff + " Tagen";
            else dueLabel = d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
          }
          html += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid '+prio.color+';'+(t.done?'opacity:.55':'')+'">'
            + '<div style="display:flex;gap:10px;align-items:flex-start">'
            + '<button data-toggle="'+t.id+'" style="width:26px;height:26px;border-radius:50%;border:2px solid '+(t.done?'#4ade80':prio.color)+';background:'+(t.done?'#4ade80':'transparent')+';cursor:pointer;flex-shrink:0;color:'+(t.done?'#000':'transparent')+';font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center">✓</button>'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:13px;font-weight:900;line-height:1.3;'+(t.done?'text-decoration:line-through;color:var(--text-mute)':'')+'">'+_esc(t.text)+'</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-size:10px">'
            + '<span style="background:'+cat.color+'22;color:'+cat.color+';padding:2px 6px;border-radius:6px;font-weight:800">'+cat.icon+' '+_esc(cat.name)+'</span>'
            + '<span style="color:'+prio.color+';font-weight:800">'+prio.icon+' '+prio.name+'</span>'
            + (dueLabel ? '<span style="color:'+(isOverdue?'#ff8080':'var(--text-mute)')+';font-weight:700">📅 '+dueLabel+'</span>' : '')
            + (subTotal ? '<span style="color:var(--text-mute)">☑ '+subDone+'/'+subTotal+'</span>' : '')
            + '</div></div>'
            + '<div style="display:flex;flex-direction:column;gap:3px">'
            + '<button data-edit="'+t.id+'" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;padding:4px 8px;font-size:10px;cursor:pointer">✏️</button>'
            + '<button data-del="'+t.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:4px 8px;font-size:10px;cursor:pointer">✕</button>'
            + '</div></div></div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
      bindList();
    }

    function bindList(){
      container.querySelectorAll("[data-fcat]").forEach(function(el){
        el.addEventListener("click", function(){ view.filterCat = el.dataset.fcat; screenList(); });
      });
      container.querySelectorAll("[data-fprio]").forEach(function(el){
        el.addEventListener("click", function(){ view.filterPrio = el.dataset.fprio; screenList(); });
      });
      var td = container.querySelector("[data-toggledone]");
      if(td) td.addEventListener("click", function(){ view.showDone = !view.showDone; screenList(); });

      container.querySelector("#tdAdd").addEventListener("click", function(){ view.screen="edit"; view.editId=null; screenEdit(); });
      container.querySelectorAll("[data-toggle]").forEach(function(el){
        el.addEventListener("click", function(){
          var list = getTodos();
          var t = list.find(function(x){return x.id===el.dataset.toggle;});
          if(t){ t.done = !t.done; t.doneAt = t.done ? Date.now() : null; saveTodos(list); screenList(); }
        });
      });
      container.querySelectorAll("[data-edit]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen="edit"; view.editId=el.dataset.edit; screenEdit(); });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Aufgabe löschen?")) return;
          saveTodos(getTodos().filter(function(t){return t.id!==el.dataset.del;})); screenList();
        });
      });
    }

    function screenEdit(){
      var list = getTodos();
      var cats = getCats();
      var isEdit = view.editId !== null;
      var t = isEdit ? list.find(function(x){return x.id===view.editId;}) : { text:"", cat:"privat", prio:"mid", due:"", notes:"", sub:[] };
      if(!t) { view.screen="list"; return screenList(); }
      var tempSub = (t.sub || []).slice();

      function renderForm(){
        var html = '<button data-cancel style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
          + '<div class="card"><h3>'+(isEdit?"Aufgabe bearbeiten":"Neue Aufgabe")+'</h3>'
          + '<div class="field"><label>Was zu tun?</label><input id="td-text" value="'+_esc(t.text)+'" placeholder="z.B. Einkaufen gehen" maxlength="120"></div>'
          + '<div class="field"><label>Kategorie</label><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">'
          + cats.map(function(c){
              var active = t.cat === c.id;
              return '<button data-setcat="'+c.id+'" style="padding:8px;background:'+(active?c.color+'25':'rgba(0,0,0,.2)')+';border:1.5px solid '+(active?c.color:'var(--border-soft)')+';border-radius:8px;color:'+(active?c.color:'var(--text-dim)')+';font-size:11px;font-weight:800;cursor:pointer;font-family:inherit">'+c.icon+' '+_esc(c.name)+'</button>';
            }).join('')
          + '</div></div>'
          + '<div class="field"><label>Priorität</label><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">'
          + PRIORITIES.map(function(p){
              var active = t.prio === p.id;
              return '<button data-setprio="'+p.id+'" style="padding:8px 4px;background:'+(active?p.color+'25':'rgba(0,0,0,.2)')+';border:1.5px solid '+(active?p.color:'var(--border-soft)')+';border-radius:8px;color:'+(active?p.color:'var(--text-dim)')+';font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;text-align:center"><div style="font-size:16px">'+p.icon+'</div>'+p.name+'</button>';
            }).join('')
          + '</div></div>'
          + '<div class="field"><label>Fällig am (optional)</label><input type="date" id="td-due" value="'+_esc(t.due)+'"></div>'
          + '<div class="field"><label>Subtasks</label>'
          + '<div id="subList">'
          + tempSub.map(function(s, i){
              return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">'
                + '<input type="checkbox" data-subchk="'+i+'" '+(s.done?"checked":"")+' style="width:18px;height:18px;accent-color:var(--p1)">'
                + '<span style="flex:1;font-size:12px;'+(s.done?'text-decoration:line-through;color:var(--text-mute)':'')+'">'+_esc(s.text)+'</span>'
                + '<button data-subdel="'+i+'" style="background:transparent;border:none;color:#ff8080;font-size:12px;cursor:pointer">✕</button>'
                + '</div>';
            }).join('')
          + '</div>'
          + '<div style="display:flex;gap:6px;margin-top:6px"><input id="td-subInput" placeholder="Subtask..." style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;font-size:11px"><button id="td-subAdd" style="padding:8px 12px;background:rgba(77,208,225,.2);border:1px solid rgba(77,208,225,.4);color:#4dd0e1;border-radius:6px;cursor:pointer;font-size:11px;font-weight:800;font-family:inherit">+</button></div>'
          + '</div>'
          + '<button class="btn full" id="tdSave" style="margin-top:8px">💾 Speichern</button>'
          + '</div>';
        container.innerHTML = html;
        bindForm();
      }

      function bindForm(){
        container.querySelector("[data-cancel]").addEventListener("click", function(){ view.screen="list"; screenList(); });
        container.querySelectorAll("[data-setcat]").forEach(function(el){
          el.addEventListener("click", function(){ t.cat = el.dataset.setcat; renderForm(); });
        });
        container.querySelectorAll("[data-setprio]").forEach(function(el){
          el.addEventListener("click", function(){ t.prio = el.dataset.setprio; renderForm(); });
        });
        container.querySelectorAll("[data-subchk]").forEach(function(el){
          el.addEventListener("change", function(){ tempSub[parseInt(el.dataset.subchk)].done = !tempSub[parseInt(el.dataset.subchk)].done; renderForm(); });
        });
        container.querySelectorAll("[data-subdel]").forEach(function(el){
          el.addEventListener("click", function(){ tempSub.splice(parseInt(el.dataset.subdel),1); renderForm(); });
        });
        container.querySelector("#td-subAdd").addEventListener("click", function(){
          var v = container.querySelector("#td-subInput").value.trim();
          if(!v) return;
          tempSub.push({ text:v, done:false }); renderForm();
        });
        container.querySelector("#td-subInput").addEventListener("keydown", function(e){
          if(e.key === "Enter"){
            var v = this.value.trim(); if(!v) return;
            tempSub.push({ text:v, done:false }); renderForm();
          }
        });
        container.querySelector("#tdSave").addEventListener("click", function(){
          var text = container.querySelector("#td-text").value.trim();
          if(!text){ alert("Bitte Aufgabe eingeben."); return; }
          var due = container.querySelector("#td-due").value;
          var list = getTodos();
          if(isEdit){
            var t2 = list.find(function(x){return x.id===view.editId;});
            if(t2){ t2.text=text; t2.cat=t.cat; t2.prio=t.prio; t2.due=due; t2.sub=tempSub; }
          } else {
            list.push({ id:"t"+Date.now(), text:text, cat:t.cat, prio:t.prio, due:due, sub:tempSub, done:false, created:Date.now() });
          }
          saveTodos(list);
          if(HalDo.Notify) HalDo.Notify.success(isEdit?"Aktualisiert":"Aufgabe angelegt");
          view.screen="list"; view.editId=null; screenList();
        });
      }
      renderForm();
    }

    if(view.screen === "edit") screenEdit(); else screenList();
  }

  HalDoApp("todo", { name: "Aufgaben", icon: "📝", render: render, category: "produktivitaet" });
  console.log("🦚 todo.js v1.0 geladen");
})();
