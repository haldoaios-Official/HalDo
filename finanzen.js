/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — FINANZEN APP (v150)
   Budget · Kategorien · Diagramm · Export
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var KATS = [
    { id:"essen", name:"🍔 Essen", color:"#f59e0b" },
    { id:"wohnen", name:"🏠 Wohnen", color:"#8b5cf6" },
    { id:"auto", name:"🚗 Auto", color:"#4da8ff" },
    { id:"freizeit", name:"🎮 Freizeit", color:"#ec4899" },
    { id:"gesundheit", name:"💊 Gesundheit", color:"#22c55e" },
    { id:"bildung", name:"📚 Bildung", color:"#00e5ff" },
    { id:"kleidung", name:"👕 Kleidung", color:"#fb923c" },
    { id:"sonstiges", name:"💰 Sonstiges", color:"#a855f7" }
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var items = store.get("items", []);
    var filter = store.get("filter", "all");

    function build(){
      var total = items.reduce(function(s,i){ return s + (i.type === "in" ? i.amount : -i.amount); }, 0);
      var income = items.filter(function(i){ return i.type === "in"; }).reduce(function(s,i){ return s + i.amount; }, 0);
      var expense = items.filter(function(i){ return i.type === "out"; }).reduce(function(s,i){ return s + i.amount; }, 0);

      /* Kategorien-Analyse */
      var byKat = {};
      items.filter(function(i){ return i.type === "out" && i.kat; }).forEach(function(i){
        byKat[i.kat] = (byKat[i.kat] || 0) + i.amount;
      });
      var maxKat = Math.max.apply(null, Object.values(byKat).concat([1]));

      var body = '';

      /* Dashboard */
      body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
        + '<div style="padding:14px;background:rgba(34,197,94,.15);border-radius:12px;border:1px solid rgba(34,197,94,.3)">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700;text-transform:uppercase;letter-spacing:1px">Einnahmen</div>'
        + '<div style="font-size:22px;font-weight:900;color:#4ade80;margin-top:4px">+' + income.toFixed(2) + '€</div>'
        + '</div>'
        + '<div style="padding:14px;background:rgba(239,68,68,.15);border-radius:12px;border:1px solid rgba(239,68,68,.3)">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700;text-transform:uppercase;letter-spacing:1px">Ausgaben</div>'
        + '<div style="font-size:22px;font-weight:900;color:#ff8080;margin-top:4px">-' + expense.toFixed(2) + '€</div>'
        + '</div>'
        + '</div>';

      body += '<div style="padding:18px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:14px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p1)">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700;letter-spacing:2px">BILANZ</div>'
        + '<div style="font-size:36px;font-weight:900;color:' + (total >= 0 ? "#4ade80" : "#ff8080") + ';margin-top:6px">'
        + (total >= 0 ? "+" : "") + total.toFixed(2) + '€</div>'
        + '</div>';

      /* Diagramm */
      if(Object.keys(byKat).length){
        body += '<div class="card"><h3>📊 Ausgaben nach Kategorie</h3>';
        Object.keys(byKat).sort(function(a,b){ return byKat[b] - byKat[a]; }).forEach(function(k){
          var kat = KATS.find(function(x){ return x.id === k; }) || { name: k, color: "var(--p1)" };
          var pct = Math.round(byKat[k] / maxKat * 100);
          var totalPct = expense > 0 ? Math.round(byKat[k] / expense * 100) : 0;
          body += '<div style="margin-bottom:10px">'
            + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">'
            + '<span style="font-weight:800">' + _esc(kat.name) + '</span>'
            + '<span style="font-weight:800;color:var(--p1)">' + byKat[k].toFixed(2) + '€ <small style="color:var(--text-mute);font-weight:600">(' + totalPct + '%)</small></span>'
            + '</div>'
            + '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden">'
            + '<div style="background:' + kat.color + ';height:100%;width:' + pct + '%;transition:.3s;border-radius:4px"></div>'
            + '</div></div>';
        });
        body += '</div>';
      }

      /* Neue Buchung */
      body += '<div class="card"><h3>➕ Neue Buchung</h3>'
        + '<div class="field"><label>Beschreibung</label><input type="text" id="fiDesc" placeholder="z.B. Einkauf"></div>'
        + '<div class="field"><label>Betrag (€)</label><input type="number" id="fiAmt" step="0.01" placeholder="0.00"></div>'
        + '<div class="field"><label>Kategorie</label><select id="fiKat">'
        + KATS.map(function(k){ return '<option value="' + k.id + '">' + k.name + '</option>'; }).join("")
        + '</select></div>'
        + '<div style="display:flex;gap:8px">'
        + '<button class="btn" id="fiIn" style="flex:1;background:linear-gradient(135deg,#22c55e,#10b981)">+ Einnahme</button>'
        + '<button class="btn danger" id="fiOut" style="flex:1">− Ausgabe</button>'
        + '</div></div>';

      /* Buchungen */
      body += '<div class="card"><h3>📋 Buchungen (' + items.length + ')</h3>'
        + '<div class="tabs" style="margin-bottom:8px">'
        + '<button class="tab' + (filter==="all"?" active":"") + '" data-ff="all">Alle</button>'
        + '<button class="tab' + (filter==="in"?" active":"") + '" data-ff="in">Einnahmen</button>'
        + '<button class="tab' + (filter==="out"?" active":"") + '" data-ff="out">Ausgaben</button>'
        + '</div>';
      var filtered = items.filter(function(i){
        if(filter === "all") return true;
        return i.type === filter;
      });
      if(filtered.length){
        filtered.slice().reverse().forEach(function(i){
          var origIdx = items.indexOf(i);
          var kat = KATS.find(function(x){ return x.id === i.kat; }) || { name: "", color: "var(--p1)" };
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12px;font-weight:800">' + _esc(i.desc) + '</div>'
            + '<div style="font-size:9px;color:var(--text-mute)">' + _esc(i.date) + (i.kat ? ' · ' + _esc(kat.name) : '') + '</div>'
            + '</div>'
            + '<div style="display:flex;gap:8px;align-items:center">'
            + '<div style="font-size:13px;font-weight:900;color:' + (i.type === "in" ? "#4ade80" : "#ff8080") + '">'
            + (i.type === "in" ? "+" : "−") + i.amount.toFixed(2) + '€</div>'
            + '<button data-fdel="' + origIdx + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:14px">✕</button>'
            + '</div></div>';
        });
      } else {
        body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Keine Buchungen</div>';
      }
      body += '</div>';

      /* Extra-Buttons */
      if(items.length){
        body += '<div style="display:flex;gap:8px;margin-top:10px">'
          + '<button class="btn sec" id="fiExport" style="flex:1">📤 CSV Export</button>'
          + '<button class="btn danger" id="fiClearAll" style="flex:1">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML = body;

      /* Events */
      container.querySelectorAll("[data-ff]").forEach(function(b){
        b.addEventListener("click", function(){
          filter = b.dataset.ff;
          store.set("filter", filter);
          build();
        });
      });
      container.querySelector("#fiIn").addEventListener("click", function(){ add("in"); });
      container.querySelector("#fiOut").addEventListener("click", function(){ add("out"); });
      container.querySelectorAll("[data-fdel]").forEach(function(el){
        el.addEventListener("click", function(){
          items.splice(parseInt(el.dataset.fdel), 1);
          store.set("items", items);
          build();
        });
      });
      var exp = container.querySelector("#fiExport");
      if(exp) exp.addEventListener("click", function(){
        var csv = "Datum,Beschreibung,Kategorie,Typ,Betrag\n";
        items.forEach(function(i){
          var kat = KATS.find(function(x){ return x.id === i.kat; }) || { name: "" };
          csv += '"' + i.date + '","' + i.desc + '","' + kat.name + '","' + i.type + '",' + i.amount + '\n';
        });
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "haldo_finanzen_" + new Date().toISOString().split("T")[0] + ".csv";
        a.click();
      });
      var clr = container.querySelector("#fiClearAll");
      if(clr) clr.addEventListener("click", function(){
        if(!confirm("Wirklich alle Buchungen löschen?")) return;
        items = [];
        store.set("items", items);
        build();
      });
    }

    function add(type){
      var d = container.querySelector("#fiDesc").value.trim() || (type === "in" ? "Einnahme" : "Ausgabe");
      var a = parseFloat(container.querySelector("#fiAmt").value);
      if(isNaN(a) || a <= 0){
        alert("Betrag eingeben");
        return;
      }
      items.push({
        desc: d,
        amount: a,
        type: type,
        kat: container.querySelector("#fiKat").value,
        date: new Date().toLocaleDateString("de-DE")
      });
      store.set("items", items);
      if(window.HalDo.Voice) HalDo.Voice.speak((type === "in" ? "Einnahme: " : "Ausgabe: ") + a.toFixed(2) + " Euro");
      build();
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("finanzen", { render: render });
  else console.warn("finanzen.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 finanzen.js geladen");
