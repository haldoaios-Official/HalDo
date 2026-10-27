/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — REZEPTE (v1.0)
   Rezepte · Zutaten · Zubereitung · Zeit · Portionen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list" };

    function getRecipes(){ return store.get("recipes", []); }
    function saveRecipes(r){ store.set("recipes", r); }

    function build(){
      if(view.screen === "edit") screenEdit();
      else if(view.screen === "detail") screenDetail();
      else screenList();
    }

    function screenList(){
      var recipes = getRecipes();
      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(255,152,0,.15),rgba(255,107,107,.1));border:1px solid rgba(255,152,0,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#ff9800">🍳 Rezepte</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+recipes.length+' gespeichert</div></div>'
        + '<button class="btn" id="rcAdd" style="padding:10px 14px">➕</button>'
        + '</div></div>';

      if(!recipes.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">🍳</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Noch keine Rezepte</div></div>';
      } else {
        html += '<div class="card">';
        recipes.slice().reverse().forEach(function(r){
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;border-left:3px solid #ff9800;cursor:pointer" data-open="'+r.id+'">'
            + '<div style="font-size:13px;font-weight:900">'+_esc(r.name)+'</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">⏱ '+r.time+' Min · 👥 '+r.servings+' Portionen · '+(r.ingredients||[]).length+' Zutaten</div>'
            + '</div>';
        });
        html += '</div>';
      }
      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#rcAdd").addEventListener("click", function(){ view.screen="edit"; view.editId=null; build(); });
      container.querySelectorAll("[data-open]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen="detail"; view.id=el.dataset.open; build(); });
      });
    }

    function screenDetail(){
      var r = getRecipes().find(function(x){ return x.id === view.id; });
      if(!r) return screenList();
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card" style="background:linear-gradient(135deg,rgba(255,152,0,.15),rgba(255,107,107,.1))">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
        + '<div><div style="font-size:20px;font-weight:900;color:#ff9800">'+_esc(r.name)+'</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">⏱ '+r.time+' Min · 👥 '+r.servings+' Portionen</div></div>'
        + '<button data-edit style="background:rgba(255,213,79,.15);border:1px solid rgba(255,213,79,.3);color:#ffd54f;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer">✏️</button>'
        + '</div></div>';

      if(r.ingredients && r.ingredients.length){
        html += '<div class="card"><h3>🛒 Zutaten</h3>';
        r.ingredients.forEach(function(ing){
          html += '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px">• '+_esc(ing)+'</div>';
        });
        html += '</div>';
      }
      if(r.steps){
        html += '<div class="card"><h3>📝 Zubereitung</h3>'
          + '<div style="font-size:12.5px;line-height:1.6;white-space:pre-wrap">'+_esc(r.steps)+'</div></div>';
      }

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="list"; build(); });
      container.querySelector("[data-edit]").addEventListener("click", function(){ view.screen="edit"; view.editId=view.id; build(); });
    }

    function screenEdit(){
      var isEdit = !!view.editId;
      var r = isEdit ? getRecipes().find(function(x){ return x.id === view.editId; }) : { name:"", time:30, servings:2, ingredients:[], steps:"" };
      if(!r) return screenList();
      var ing = (r.ingredients||[]).slice();

      function renderForm(){
        var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
          + '<div class="card"><h3>'+(isEdit?"Bearbeiten":"Neues Rezept")+'</h3>'
          + '<div class="field"><label>Name</label><input id="rc-name" value="'+_esc(r.name)+'" placeholder="z.B. Spaghetti Carbonara" maxlength="80"></div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + '<div class="field"><label>⏱ Zeit (Min)</label><input id="rc-time" type="number" value="'+r.time+'" min="1" max="600"></div>'
          + '<div class="field"><label>👥 Portionen</label><input id="rc-servings" type="number" value="'+r.servings+'" min="1" max="20"></div>'
          + '</div>'
          + '<div class="field"><label>Zutaten</label><div id="rc-ingList">'
          + ing.map(function(i,idx){
              return '<div style="display:flex;justify-content:space-between;padding:6px 8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:3px;font-size:11.5px"><span>'+_esc(i)+'</span><button data-deling="'+idx+'" style="background:transparent;border:none;color:#ff8080;font-size:11px;cursor:pointer">✕</button></div>';
            }).join('')
          + '</div>'
          + '<div style="display:flex;gap:6px;margin-top:6px"><input id="rc-ingInput" placeholder="Zutat hinzufügen..." style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;font-size:11px"><button id="rc-ingAdd" style="padding:8px 12px;background:rgba(255,152,0,.2);border:1px solid rgba(255,152,0,.4);color:#ff9800;border-radius:6px;cursor:pointer;font-size:11px;font-weight:800;font-family:inherit">+</button></div>'
          + '</div>'
          + '<div class="field"><label>Zubereitung</label><textarea id="rc-steps" rows="8" placeholder="Schritt für Schritt..." style="resize:vertical;font-size:12px">'+_esc(r.steps)+'</textarea></div>'
          + '<button class="btn full" id="rc-save">💾 Speichern</button></div>';
        container.innerHTML = html;
        bindForm();
      }

      function bindForm(){
        container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="list"; build(); });
        container.querySelectorAll("[data-deling]").forEach(function(el){
          el.addEventListener("click", function(){ ing.splice(parseInt(el.dataset.deling),1); renderForm(); });
        });
        container.querySelector("#rc-ingAdd").addEventListener("click", function(){
          var v = container.querySelector("#rc-ingInput").value.trim(); if(!v) return;
          ing.push(v); renderForm();
        });
        container.querySelector("#rc-ingInput").addEventListener("keydown", function(e){
          if(e.key === "Enter"){ var v = this.value.trim(); if(v){ ing.push(v); renderForm(); } }
        });
        container.querySelector("#rc-save").addEventListener("click", function(){
          var name = container.querySelector("#rc-name").value.trim();
          if(!name){ alert("Name fehlt"); return; }
          var data = {
            name: name,
            time: parseInt(container.querySelector("#rc-time").value) || 30,
            servings: parseInt(container.querySelector("#rc-servings").value) || 2,
            ingredients: ing,
            steps: container.querySelector("#rc-steps").value.trim()
          };
          var list = getRecipes();
          if(isEdit){
            var ex = list.find(function(x){ return x.id === view.editId; });
            if(ex) Object.assign(ex, data);
          } else {
            data.id = "r"+Date.now(); data.created = Date.now();
            list.push(data);
          }
          saveRecipes(list);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
          view.screen = "list"; build();
        });
      }
      renderForm();
    }

    build();
  }

  HalDoApp("rezept", { name: "Rezepte", icon: "🍳", render: render, category: "lifestyle" });
  console.log("🦚 rezept.js v1.0 geladen");
})();
