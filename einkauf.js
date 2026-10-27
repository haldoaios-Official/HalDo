/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — EINKAUF (v1.0)
   Einkaufsliste · Kategorien · Häkchen · Preise
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var CATS = [
    { id:"obst", name:"Obst & Gemüse", icon:"🥬", color:"#4ade80" },
    { id:"milch", name:"Milchprodukte", icon:"🥛", color:"#4dd0e1" },
    { id:"fleisch", name:"Fleisch & Fisch", icon:"🥩", color:"#ff5555" },
    { id:"brot", name:"Brot & Backwaren", icon:"🍞", color:"#ffd54f" },
    { id:"getraenke", name:"Getränke", icon:"🥤", color:"#4da8ff" },
    { id:"tiefkuehl", name:"Tiefkühl", icon:"🧊", color:"#b478ff" },
    { id:"haushalt", name:"Haushalt", icon:"🧽", color:"#ff8844" },
    { id:"sonstiges", name:"Sonstiges", icon:"📦", color:"#888" }
  ];

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;

    function getItems(){ return store.get("items", []); }
    function saveItems(i){ store.set("items", i); }

    function build(){
      var items = getItems();
      var open = items.filter(function(x){ return !x.done; });
      var done = items.filter(function(x){ return x.done; });
      var total = items.reduce(function(s,x){ return s + (x.price || 0) * (x.qty || 1); }, 0);

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(74,222,128,.15),rgba(77,208,225,.1));border:1px solid rgba(74,222,128,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4ade80">🛒 Einkaufsliste</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+open.length+' offen · '+done.length+' erledigt'+(total > 0 ? ' · ~'+total.toFixed(2)+' €' : '')+'</div></div>'
        + '<button class="btn" id="ekAdd" style="padding:10px 14px">➕</button>'
        + '</div>'
        + '<div style="display:flex;gap:6px">'
        + '<input id="ekQuick" placeholder="Schnell hinzufügen..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + '<button id="ekQuickAdd" style="padding:10px 14px;background:rgba(74,222,128,.2);border:1px solid rgba(74,222,128,.4);color:#4ade80;border-radius:8px;cursor:pointer;font-weight:900;font-size:14px;font-family:inherit">+</button>'
        + '</div></div>';

      // Open items by category
      var byCat = {};
      open.forEach(function(it){
        if(!byCat[it.cat]) byCat[it.cat] = [];
        byCat[it.cat].push(it);
      });

      if(!open.length && !done.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">🛒</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Liste ist leer</div></div>';
      } else {
        Object.keys(byCat).forEach(function(catId){
          var cat = CATS.find(function(c){ return c.id === catId; }) || CATS[CATS.length-1];
          var arr = byCat[catId];
          html += '<div class="card"><h3 style="color:'+cat.color+'">'+cat.icon+' '+_esc(cat.name)+' <span style="font-size:10px;color:var(--text-mute);font-weight:600">('+arr.length+')</span></h3>';
          arr.forEach(function(it){
            html += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;align-items:center;gap:8px;border-left:3px solid '+cat.color+'">'
              + '<button data-toggle="'+it.id+'" style="width:24px;height:24px;border-radius:50%;border:2px solid '+cat.color+';background:transparent;cursor:pointer;flex-shrink:0"></button>'
              + '<div style="flex:1;min-width:0;font-size:12px;font-weight:800">'+_esc(it.name)+(it.qty > 1 ? ' <span style="color:var(--text-mute)">×'+it.qty+'</span>' : '')+(it.price ? ' <span style="color:#ffd54f">('+it.price.toFixed(2)+'€)</span>' : '')+'</div>'
              + '<button data-del="'+it.id+'" style="background:transparent;border:none;color:#ff8080;font-size:11px;cursor:pointer">✕</button>'
              + '</div>';
          });
          html += '</div>';
        });

        if(done.length){
          html += '<div class="card"><h3 style="color:var(--text-mute)">✓ Erledigt ('+done.length+')</h3>';
          done.forEach(function(it){
            html += '<div style="padding:6px;background:rgba(0,0,0,.15);border-radius:6px;margin-bottom:3px;display:flex;align-items:center;gap:8px;opacity:.6">'
              + '<button data-toggle="'+it.id+'" style="width:20px;height:20px;border-radius:50%;border:none;background:#4ade80;color:#000;cursor:pointer;flex-shrink:0;font-size:11px">✓</button>'
              + '<div style="flex:1;font-size:11px;text-decoration:line-through;color:var(--text-mute)">'+_esc(it.name)+'</div>'
              + '<button data-del="'+it.id+'" style="background:transparent;border:none;color:#ff8080;font-size:10px;cursor:pointer">✕</button>'
              + '</div>';
          });
          html += '<button class="btn sec full" id="ekClearDone" style="margin-top:8px;font-size:11px">🗑️ Erledigte löschen</button></div>';
        }
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#ekAdd").addEventListener("click", function(){
        var name = prompt("Artikel:");
        if(!name) return;
        var cat = prompt("Kategorie (obst, milch, fleisch, brot, getraenke, tiefkuehl, haushalt, sonstiges):", "sonstiges");
        if(!CATS.find(function(c){ return c.id === cat; })) cat = "sonstiges";
        var qty = parseInt(prompt("Menge:", "1")) || 1;
        var items = getItems();
        items.push({ id:"e"+Date.now(), name:name.trim(), cat:cat, qty:qty, done:false, created:Date.now() });
        saveItems(items); build();
      });
      container.querySelector("#ekQuickAdd").addEventListener("click", function(){
        var v = container.querySelector("#ekQuick").value.trim();
        if(!v) return;
        var items = getItems();
        items.push({ id:"e"+Date.now(), name:v, cat:"sonstiges", qty:1, done:false, created:Date.now() });
        saveItems(items); build();
      });
      container.querySelector("#ekQuick").addEventListener("keydown", function(e){
        if(e.key === "Enter") container.querySelector("#ekQuickAdd").click();
      });
      container.querySelectorAll("[data-toggle]").forEach(function(el){
        el.addEventListener("click", function(){
          var items = getItems(); var it = items.find(function(x){ return x.id === el.dataset.toggle; });
          if(it){ it.done = !it.done; saveItems(items); build(); }
        });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          saveItems(getItems().filter(function(x){ return x.id !== el.dataset.del; })); build();
        });
      });
      var cd = container.querySelector("#ekClearDone");
      if(cd) cd.addEventListener("click", function(){
        saveItems(getItems().filter(function(x){ return !x.done; })); build();
      });
    }

    build();
  }

  HalDoApp("einkauf", { name: "Einkauf", icon: "🛒", render: render, category: "lifestyle" });
  console.log("🦚 einkauf.js v1.0 geladen");
})();
