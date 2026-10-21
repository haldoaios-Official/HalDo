/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AUTO (v300)
   Fahrzeuge · Tanken · Service
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "cars");

    function build(){
      var body = '';
      body += '<div class="tabs">'
        + '<button class="tab'+(tab==="cars"?" active":"")+'" data-at="cars">🚗 Autos</button>'
        + '<button class="tab'+(tab==="fuel"?" active":"")+'" data-at="fuel">⛽ Tanken</button>'
        + '</div>';

      if(tab === "cars") {
        var cars = store.get("cars", []);
        body += '<div class="card">'
          + '<button class="btn full" id="cAdd" style="margin-bottom:10px">+ Fahrzeug</button>';
        cars.forEach((c, i) => {
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p3)">'
            + '<div style="font-size:13px;font-weight:900;color:var(--p3)">🚗 ' + _esc(c.name) + '</div>'
            + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(c.plate) + ' · ' + _esc(c.km) + ' km</div>'
            + '</div>';
        });
        body += '</div>';
      }

      if(tab === "fuel") {
        var fuel = store.get("fuel", []);
        body += '<div class="card">'
          + '<button class="btn full" id="fAdd" style="margin-bottom:10px">+ Tanken</button>';
        fuel.slice().reverse().forEach((f, i) => {
          body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between">'
            + '<div><div style="font-size:12px;font-weight:800">' + _esc(f.liters) + 'L · ' + _esc(f.cost) + '€</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute)">' + _esc(f.date) + '</div></div>'
            + '</div>';
        });
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-at]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.at; store.set("tab", tab); build(); });
      });

      if(tab === "cars") {
        container.querySelector("#cAdd").addEventListener("click", function(){
          var n = prompt("Auto (z.B. VW Golf):"); if(!n) return;
          var p = prompt("Kennzeichen:");
          var k = prompt("Kilometerstand:");
          var c = store.get("cars", []); c.push({ name: n, plate: p, km: k }); store.set("cars", c); build();
        });
      }

      if(tab === "fuel") {
        container.querySelector("#fAdd").addEventListener("click", function(){
          var l = prompt("Liter:"); if(!l) return;
          var c = prompt("Kosten (€):");
          var f = store.get("fuel", []); f.push({ liters: l, cost: c, date: new Date().toLocaleDateString("de-DE") }); store.set("fuel", f); build();
        });
      }
    }
    build();
  }

  HalDoApp("auto", { name: "Auto", icon: "🚗", render: render, category: "lifestyle" });
  console.log("🦚 auto.js v300 geladen");
})();
