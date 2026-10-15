/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NOTFALL (v153)
   Notfall-Kontakte · Erste Hilfe · Notrufnummern · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var NUMBERS = [
    { country: "🇩🇪 Deutschland", police: "110", fire: "112", ambulance: "112", poison: "030-19240" },
    { country: "🇦🇹 Österreich", police: "133", fire: "122", ambulance: "144", poison: "01-4064343" },
    { country: "🇨🇭 Schweiz", police: "117", fire: "118", ambulance: "144", poison: "145" },
    { country: "🇹🇷 Türkei", police: "155", fire: "110", ambulance: "112", poison: "114" },
    { country: "🇮🇶 Irak", police: "104", fire: "115", ambulance: "122", poison: "—" }
  ];

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "kontakte");

    function build(){
      var body = "";

      if(tab === "kontakte"){
        var contacts = store.get("contacts", []);
        body = '<div class="card">'
          + '<div style="padding:14px;background:linear-gradient(135deg,rgba(255,128,128,.15),rgba(251,191,36,.15));border-radius:12px;margin-bottom:14px;border:1.5px solid #ff8080;text-align:center">'
          + '<div style="font-size:36px">🚨</div>'
          + '<div style="font-size:14px;font-weight:900;color:#ff8080;margin-top:4px">Notfall-Kontakte</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">Im Notfall: Sofort anrufen!</div>'
          + '</div>';

        if(!contacts.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Noch keine Kontakte hinterlegt</div>';
        } else {
          contacts.forEach(function(c, i){
            body += '<div style="padding:12px;background:rgba(255,128,128,.08);border-radius:10px;margin-bottom:6px;border-left:3px solid #ff8080;display:flex;justify-content:space-between;align-items:center">'
              + '<div style="flex:1">'
              + '<div style="font-size:13px;font-weight:900">' + _esc(c.name) + ' <span style="font-size:10px;color:var(--text-mute)">(' + _esc(c.relation) + ')</span></div>'
              + '<div style="font-size:11.5px;color:var(--p1);font-weight:800;margin-top:2px">📞 ' + _esc(c.phone) + '</div>'
              + '</div>'
              + '<div style="display:flex;gap:6px">'
              + '<a href="tel:' + _esc(c.phone) + '" style="background:linear-gradient(135deg,#4ade80,#00e5ff);border:none;border-radius:8px;color:#000;cursor:pointer;padding:8px 12px;font-size:12px;text-decoration:none;font-weight:900">📞</a>'
              + '<button data-ncdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div></div>';
          });
        }
        body += '<button class="btn full" id="ncAdd" style="margin-top:10px">+ Kontakt hinzufügen</button>'
          + '</div>';
      }

      else if(tab === "nummern"){
        body = '<div class="card"><h3>📞 Wichtige Nummern</h3>';
        NUMBERS.forEach(function(n){
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px">'
            + '<div style="font-size:13px;font-weight:900;margin-bottom:8px">' + n.country + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
            + '<a href="tel:' + n.police + '" style="padding:8px;background:rgba(74,168,255,.15);border-radius:8px;text-decoration:none;color:inherit"><div style="font-size:10px;color:var(--text-mute)">👮 Polizei</div><div style="font-size:14px;font-weight:900;color:var(--p1)">' + n.police + '</div></a>'
            + '<a href="tel:' + n.fire + '" style="padding:8px;background:rgba(255,128,128,.15);border-radius:8px;text-decoration:none;color:inherit"><div style="font-size:10px;color:var(--text-mute)">🔥 Feuer</div><div style="font-size:14px;font-weight:900;color:#ff8080">' + n.fire + '</div></a>'
            + '<a href="tel:' + n.ambulance + '" style="padding:8px;background:rgba(251,191,36,.15);border-radius:8px;text-decoration:none;color:inherit"><div style="font-size:10px;color:var(--text-mute)">🚑 Notarzt</div><div style="font-size:14px;font-weight:900;color:#fbbf24">' + n.ambulance + '</div></a>'
            + '<a href="tel:' + n.poison + '" style="padding:8px;background:rgba(180,120,255,.15);border-radius:8px;text-decoration:none;color:inherit"><div style="font-size:10px;color:var(--text-mute)">☠️ Gift</div><div style="font-size:12px;font-weight:900;color:var(--p3)">' + n.poison + '</div></a>'
            + '</div></div>';
        });
        body += '</div>';
      }

      else if(tab === "erstehilfe"){
        var topics = [
          { icon: "🩸", name: "Blutung", steps: ["Handschuhe anziehen", "Wunde mit sterilem Verband abdecken", "Druck ausüben", "Betroffenen hinlegen", "Notruf 112"] },
          { icon: "🔥", name: "Verbrennung", steps: ["Kühlen mit lauwarmem Wasser (10-15 Min)", "Kleidung nicht abziehen", "Steril abdecken", "Kein Eis verwenden", "Bei großflächig: 112"] },
          { icon: "🫁", name: "Erstickung", steps: ["5 Schläge zwischen Schulterblätter", "5 Bauchkompressionen (Heimlich)", "Abwechseln", "Bei Bewusstlosigkeit: 112"] },
          { icon: "💔", name: "Herzstillstand", steps: ["112 rufen", "Herzdruckmassage: 100-120/Min", "5-6 cm tief drücken", "30x drücken, 2x beatmen", "AED nutzen falls vorhanden"] },
          { icon: "🧠", name: "Schlaganfall", steps: ["FAST-Test: Face, Arms, Speech, Time", "Sofort 112", "Nichts zu trinken geben", "Betroffenen beruhigen", "Zeitpunkt notieren"] }
        ];

        body = '<div class="card"><h3>🚑 Erste Hilfe</h3>';
        topics.forEach(function(t){
          body += '<details style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;cursor:pointer">'
            + '<summary style="font-size:13px;font-weight:900;list-style:none">' + t.icon + ' ' + t.name + '</summary>'
            + '<div style="margin-top:10px;padding-left:8px">';
          t.steps.forEach(function(s, i){
            body += '<div style="font-size:11.5px;color:var(--text-dim);padding:3px 0;line-height:1.5"><b style="color:var(--p1)">' + (i+1) + '.</b> ' + _esc(s) + '</div>';
          });
          body += '</div></details>';
        });
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📞 KONTAKTE</div>'
          + '<div style="font-size:22px;font-weight:900;color:#ff8080">' + store.get("contacts", []).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="nfClear" style="margin-top:10px">🗑️ Alle Kontakte löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="kontakte"?" active":"") + '" data-nft="kontakte">🚨 Kontakte</button>'
        + '<button class="tab' + (tab==="nummern"?" active":"") + '" data-nft="nummern">📞 Nummern</button>'
        + '<button class="tab' + (tab==="erstehilfe"?" active":"") + '" data-nft="erstehilfe">🚑 Erste Hilfe</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-nft="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-nft]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.nft; store.set("tab", tab); build();
        });
      });

      if(tab === "kontakte"){
        var add = container.querySelector("#ncAdd");
        if(add) add.addEventListener("click", function(){
          var name = prompt("Name:");
          if(!name) return;
          var phone = prompt("Telefonnummer:");
          if(!phone) return;
          var relation = prompt("Verhältnis (z.B. Vater, Freund):", "Kontakt") || "Kontakt";
          var contacts2 = store.get("contacts", []);
          contacts2.push({ name: name, phone: phone, relation: relation });
          store.set("contacts", contacts2);
          build();
        });
        container.querySelectorAll("[data-ncdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var contacts3 = store.get("contacts", []);
            contacts3.splice(parseInt(el.dataset.ncdel), 1);
            store.set("contacts", contacts3);
            build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#nfClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Kontakte löschen?")) return;
          store.set("contacts", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("notfall", { name: "Notfall", icon: "🚨", render: render, category: "werkzeuge" });
  console.log("🦚 notfall.js geladen");
})();
