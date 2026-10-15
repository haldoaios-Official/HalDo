/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AUTO (v153)
   Fahrzeuge · Tanken · Service · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "fahrzeuge");

    function build(editIdx){
      var body = "";

      if(tab === "fahrzeuge"){
        var cars = store.get("cars", []);
        body = '<div class="card">'
          + '<button class="btn full" id="carNew" style="margin-bottom:10px">🚗 Fahrzeug hinzufügen</button>';

        if(editIdx !== undefined){
          var c = cars[editIdx] || { name: "", plate: "", km: 0, year: "" };
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="cName" placeholder="Name (z.B. VW Golf)" value="' + _esc(c.name) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="cPlate" placeholder="Kennzeichen" value="' + _esc(c.plate) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
            + '<input type="number" id="cKm" placeholder="Kilometer" value="' + (c.km || "") + '" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
            + '<input type="number" id="cYear" placeholder="Baujahr" value="' + (c.year || "") + '" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
            + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:8px">'
            + '<button class="btn" id="cSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="cCancel">✕</button>'
            + '</div></div>';
        }

        if(!cars.length && editIdx === undefined){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Noch keine Fahrzeuge</div>';
        } else {
          cars.forEach(function(c2){
            var ri = cars.indexOf(c2);
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p3)">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
              + '<div style="flex:1">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p3)">🚗 ' + _esc(c2.name) + '</div>'
              + '<div style="font-size:11px;color:var(--text-dim);margin-top:2px">🔢 ' + _esc(c2.plate || "—") + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">📅 ' + (c2.year || "?") + ' · 🛣️ ' + (c2.km || 0) + ' km</div>'
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-cedit="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px;font-size:11px">✏️</button>'
              + '<button data-cdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "tanken"){
        var fuel = store.get("fuel", []);
        var totalCost = fuel.reduce(function(s, f){ return s + (f.cost || 0); }, 0);
        var totalLiters = fuel.reduce(function(s, f){ return s + (f.liters || 0); }, 0);

        body = '<div class="card"><h3>⛽ Tankbuch (' + fuel.length + ')</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px"><div style="font-size:10px;color:var(--text-mute);font-weight:700">💶 KOSTEN</div><div style="font-size:20px;font-weight:900;color:#fbbf24">' + totalCost.toFixed(2) + '€</div></div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px"><div style="font-size:10px;color:var(--text-mute);font-weight:700">⛽ LITER</div><div style="font-size:20px;font-weight:900;color:var(--p1)">' + totalLiters.toFixed(1) + '</div></div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px">'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
          + '<input type="number" id="fLiters" placeholder="Liter" step="0.1" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '<input type="number" id="fCost" placeholder="Kosten €" step="0.01" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '</div>'
          + '<input type="number" id="fKm" placeholder="Kilometerstand" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:6px">'
          + '<button class="btn full" id="fAdd">+ Tanken erfasst</button>'
          + '</div>';

        if(!fuel.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Noch keine Einträge</div>';
        } else {
          fuel.slice().reverse().forEach(function(f){
            var ri = fuel.indexOf(f);
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div>'
              + '<div style="font-size:12px;font-weight:800">⛽ ' + f.liters + 'L · ' + f.cost.toFixed(2) + '€</div>'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(f.date) + (f.km ? ' · ' + f.km + ' km' : '') + '</div>'
              + '</div>'
              + '<button data-fdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "service"){
        var services = store.get("services", []);
        body = '<div class="card"><h3>🔧 Service-Termine</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px">'
          + '<input type="text" id="sName" placeholder="Service-Art (z.B. Ölwechsel)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
          + '<input type="date" id="sDate" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:6px">'
          + '<input type="number" id="sKm" placeholder="Kilometer" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:6px">'
          + '<button class="btn full" id="sAdd">+ Service hinzufügen</button>'
          + '</div>';

        if(!services.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Keine Service-Einträge</div>';
        } else {
          services.slice().sort(function(a, b){ return (a.date || "").localeCompare(b.date || ""); }).forEach(function(s){
            var ri = services.indexOf(s);
            var isPast = s.date && new Date(s.date) < new Date();
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid ' + (isPast ? "var(--text-mute)" : "#fbbf24") + ';display:flex;justify-content:space-between;align-items:center">'
              + '<div>'
              + '<div style="font-size:12.5px;font-weight:800">🔧 ' + _esc(s.name) + '</div>'
              + '<div style="font-size:10.5px;color:var(--p1);font-weight:800">' + _esc(s.date || "") + (s.km ? ' · ' + s.km + ' km' : '') + '</div>'
              + '</div>'
              + '<button data-sdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">'
          + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center"><div style="font-size:10px;color:var(--text-mute);font-weight:700">🚗 AUTOS</div><div style="font-size:18px;font-weight:900;color:var(--p3)">' + store.get("cars", []).length + '</div></div>'
          + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center"><div style="font-size:10px;color:var(--text-mute);font-weight:700">⛽ TANKEN</div><div style="font-size:18px;font-weight:900;color:#fbbf24">' + store.get("fuel", []).length + '</div></div>'
          + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center"><div style="font-size:10px;color:var(--text-mute);font-weight:700">🔧 SERVICE</div><div style="font-size:18px;font-weight:900;color:var(--p1)">' + store.get("services", []).length + '</div></div>'
          + '</div>'
          + '<button class="btn danger full" id="autoClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="fahrzeuge"?" active":"") + '" data-att="fahrzeuge">🚗 Fahrzeuge</button>'
        + '<button class="tab' + (tab==="tanken"?" active":"") + '" data-att="tanken">⛽ Tanken</button>'
        + '<button class="tab' + (tab==="service"?" active":"") + '" data-att="service">🔧 Service</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-att="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-att]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.att; store.set("tab", tab); build();
        });
      });

      if(tab === "fahrzeuge"){
        var nb = container.querySelector("#carNew");
        if(nb) nb.addEventListener("click", function(){ build(-1); });

        if(editIdx !== undefined){
          var save = container.querySelector("#cSave");
          if(save) save.addEventListener("click", function(){
            var cars2 = store.get("cars", []);
            var obj = {
              name: container.querySelector("#cName").value.trim() || "Unbenannt",
              plate: container.querySelector("#cPlate").value.trim(),
              km: parseInt(container.querySelector("#cKm").value) || 0,
              year: container.querySelector("#cYear").value.trim()
            };
            if(editIdx === -1) cars2.push(obj);
            else cars2[editIdx] = obj;
            store.set("cars", cars2);
            if(HalDo.Notify) HalDo.Notify.success("Fahrzeug gespeichert", { app: "auto" });
            build();
          });
          var cancel = container.querySelector("#cCancel");
          if(cancel) cancel.addEventListener("click", function(){ build(); });
        }

        container.querySelectorAll("[data-cedit]").forEach(function(el){
          el.addEventListener("click", function(){ build(parseInt(el.dataset.cedit)); });
        });
        container.querySelectorAll("[data-cdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Fahrzeug löschen?")) return;
            var cars3 = store.get("cars", []);
            cars3.splice(parseInt(el.dataset.cdel), 1);
            store.set("cars", cars3);
            build();
          });
        });
      }

      if(tab === "tanken"){
        var addF = container.querySelector("#fAdd");
        if(addF) addF.addEventListener("click", function(){
          var liters = parseFloat(container.querySelector("#fLiters").value);
          var cost = parseFloat(container.querySelector("#fCost").value);
          if(!liters || !cost){ alert("Liter und Kosten eingeben"); return; }
          var fuel2 = store.get("fuel", []);
          fuel2.push({
            liters: liters,
            cost: cost,
            km: parseInt(container.querySelector("#fKm").value) || 0,
            date: new Date().toLocaleString("de-DE")
          });
          store.set("fuel", fuel2);
          build();
        });
        container.querySelectorAll("[data-fdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var fuel3 = store.get("fuel", []);
            fuel3.splice(parseInt(el.dataset.fdel), 1);
            store.set("fuel", fuel3);
            build();
          });
        });
      }

      if(tab === "service"){
        var addS = container.querySelector("#sAdd");
        if(addS) addS.addEventListener("click", function(){
          var name = container.querySelector("#sName").value.trim();
          if(!name){ alert("Service-Art eingeben"); return; }
          var services2 = store.get("services", []);
          services2.push({
            name: name,
            date: container.querySelector("#sDate").value,
            km: parseInt(container.querySelector("#sKm").value) || 0
          });
          store.set("services", services2);
          build();
        });
        container.querySelectorAll("[data-sdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var services3 = store.get("services", []);
            services3.splice(parseInt(el.dataset.sdel), 1);
            store.set("services", services3);
            build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#autoClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Auto-Daten löschen?")) return;
          store.set("cars", []);
          store.set("fuel", []);
          store.set("services", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("auto", { name: "Auto", icon: "🚗", render: render, category: "lifestyle" });
  console.log("🦚 auto.js geladen");
})();
