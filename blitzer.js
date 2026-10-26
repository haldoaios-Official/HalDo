/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BLITZER (v1.0)
   Persönliches Blitzer-Notizbuch · Standorte · Tickets
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  var TYPES = [
    { id:"starenkasten", name:"Starenkasten", icon:"📷" },
    { id:"mobile", name:"Mobile Kontrolle", icon:"🚔" },
    { id:"ampel", name:"Ampelblitzer", icon:"🚦" },
    { id:"abstand", name:"Abstandsmessung", icon:"📏" },
    { id:"section", name:"Section Control", icon:"📐" }
  ];

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", editId:null };

    function getList(){ return store.get("spots", []); }
    function saveList(list){ store.set("spots", list); }

    function screenList(){
      var list = getList();
      var stats = store.get("stats", { tickets:0 });
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,183,0,.15),rgba(255,106,0,.1));border:1px solid rgba(255,183,0,.3)">'
        + '<div style="font-size:44px">⚠️</div>'
        + '<div style="font-size:18px;font-weight:900;color:#ffd54f;margin-top:6px">Blitzer-Notizbuch</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Persönliche Sammlung bekannter Standorte</div>'
        + '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
        + '<div class="card" style="text-align:center;margin-bottom:0"><div style="font-size:22px;font-weight:900;color:var(--p1)">'+list.length+'</div><div style="font-size:10px;color:var(--text-mute)">Standorte</div></div>'
        + '<div class="card" style="text-align:center;margin-bottom:0"><div style="font-size:22px;font-weight:900;color:#ff8080">'+stats.tickets+'</div><div style="font-size:10px;color:var(--text-mute)">Tickets</div></div>'
        + '</div>';

      html += '<div class="card">'
        + '<button class="btn full" id="bAdd" style="margin-bottom:10px">+ Neuer Standort</button>';

      if(!list.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:24px;font-size:12px">Noch keine Standorte erfasst.<br><span style="font-size:10.5px;opacity:.7">Tippe auf + um zu starten.</span></div>';
      } else {
        list.slice().reverse().forEach(function(s){
          var t = TYPES.find(function(x){return x.id===s.type;}) || TYPES[0];
          html += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid #ffd54f">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:13px;font-weight:900">'+t.icon+' '+_esc(s.name)+'</div>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">'+_esc(s.location||"")+'</div>'
            + (s.limit ? '<div style="font-size:11px;color:#ffd54f;margin-top:2px">🚦 '+_esc(s.limit)+' km/h</div>' : '')
            + (s.direction ? '<div style="font-size:10.5px;color:var(--text-dim);margin-top:2px">↗ '+_esc(s.direction)+'</div>' : '')
            + '</div>'
            + '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">'
            + '<button data-edit="'+_esc(s.id)+'" style="background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.3);color:var(--p1);border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✏️</button>'
            + '<button data-del="'+_esc(s.id)+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✕</button>'
            + '</div></div></div>';
        });
      }
      html += '</div>';

      html += '<div class="card"><h3>🎫 Ticket-Zähler</h3>'
        + '<div style="display:flex;gap:6px">'
        + '<button class="btn sec" data-ticket="-1" style="flex:1">−1</button>'
        + '<button class="btn sec" data-ticket="1" style="flex:1">+1</button>'
        + '<button class="btn sec" data-ticket="reset" style="flex:1">Reset</button>'
        + '</div></div>';

      container.innerHTML = html;
      bind();
    }

    function screenForm(){
      var list = getList();
      var isEdit = view.editId !== null;
      var s = isEdit ? list.find(function(x){return x.id===view.editId;}) : { name:"", location:"", limit:"", direction:"", type:"starenkasten", notes:"" };
      if(!s) { view.screen = "list"; return screenList(); }

      var html = '<button data-cancel style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>'+(isEdit?"Standort bearbeiten":"Neuer Standort")+'</h3>'
        + '<div class="field"><label>Name</label><input id="f-name" value="'+_esc(s.name)+'" placeholder="z.B. B27 Hauptstraße" maxlength="60"></div>'
        + '<div class="field"><label>Ort / Straße</label><input id="f-loc" value="'+_esc(s.location)+'" placeholder="z.B. Berlin, Alexanderplatz" maxlength="80"></div>'
        + '<div class="field"><label>Typ</label><select id="f-type">'
        + TYPES.map(function(t){return '<option value="'+t.id+'"'+(s.type===t.id?" selected":"")+'>'+t.icon+' '+t.name+'</option>';}).join('')
        + '</select></div>'
        + '<div class="field"><label>Tempolimit (km/h)</label><input id="f-limit" type="number" value="'+_esc(s.limit)+'" placeholder="z.B. 50" min="1" max="200"></div>'
        + '<div class="field"><label>Fahrtrichtung (optional)</label><input id="f-dir" value="'+_esc(s.direction)+'" placeholder="z.B. Richtung Norden" maxlength="50"></div>'
        + '<div class="field"><label>Notiz (optional)</label><textarea id="f-notes" rows="2" maxlength="200">'+_esc(s.notes)+'</textarea></div>'
        + '<button class="btn full" data-save>💾 Speichern</button>'
        + '</div>';

      container.innerHTML = html;
      bindForm(isEdit);
    }

    function bindForm(isEdit){
      container.querySelector("[data-cancel]").addEventListener("click", function(){
        view.screen = "list"; view.editId = null; screenList();
      });
      container.querySelector("[data-save]").addEventListener("click", function(){
        var name = container.querySelector("#f-name").value.trim();
        var loc = container.querySelector("#f-loc").value.trim();
        var type = container.querySelector("#f-type").value;
        var limit = container.querySelector("#f-limit").value.trim();
        var dir = container.querySelector("#f-dir").value.trim();
        var notes = container.querySelector("#f-notes").value.trim();
        if(!name){ alert("Bitte Namen eingeben."); return; }
        var list = getList();
        if(isEdit){
          var s = list.find(function(x){return x.id===view.editId;});
          if(s){ s.name=name; s.location=loc; s.type=type; s.limit=limit; s.direction=dir; s.notes=notes; }
        } else {
          list.push({ id:"b"+Date.now(), name:name, location:loc, type:type, limit:limit, direction:dir, notes:notes, created:Date.now() });
        }
        saveList(list);
        if(HalDo.Notify) HalDo.Notify.success(isEdit?"Aktualisiert":"Gespeichert");
        view.screen = "list"; view.editId = null; screenList();
      });
    }

    function bind(){
      container.querySelector("#bAdd").addEventListener("click", function(){
        view.screen = "form"; view.editId = null; screenForm();
      });
      container.querySelectorAll("[data-edit]").forEach(function(el){
        el.addEventListener("click", function(){
          view.screen = "form"; view.editId = el.dataset.edit; screenForm();
        });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Standort löschen?")) return;
          var list = getList().filter(function(x){return x.id!==el.dataset.del;});
          saveList(list); screenList();
        });
      });
      container.querySelectorAll("[data-ticket]").forEach(function(el){
        el.addEventListener("click", function(){
          var stats = store.get("stats",{tickets:0});
          var v = el.dataset.ticket;
          if(v==="reset") stats.tickets = 0;
          else stats.tickets = Math.max(0, stats.tickets + parseInt(v));
          store.set("stats", stats); screenList();
        });
      });
    }

    if(view.screen === "form") screenForm(); else screenList();
  }

  HalDoApp("blitzer", { name: "Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v1.0 geladen — Blitzer-Notizbuch");
})();
