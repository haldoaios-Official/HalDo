/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NOTFALL (v300)
   Notrufnummern · Persönliche Kontakte · Erste Hilfe
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  var NUMBERS = [
    { n: "Polizei", num: "110", c: "#4da8ff" },
    { n: "Feuerwehr / Notarzt", num: "112", c: "#ff4d4d" },
    { n: "Giftnotruf", num: "030-19240", c: "#fbbf24" },
    { n: "Telefonseelsorge", num: "0800-1110111", c: "#4ade80" }
  ];

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "numbers");

    function build(){
      var body = '';
      var contacts = store.get("emergencyContacts", []);

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "numbers" ? " active" : "") + '" data-nft="numbers">🚨 Notruf</button>'
        + '<button class="tab' + (tab === "contacts" ? " active" : "") + '" data-nft="contacts">👨‍👩‍👧 Kontakte</button>'
        + '</div>';

      if(tab === "numbers"){
        body += '<div class="card"><h3>🚨 Wichtige Nummern</h3>';
        NUMBERS.forEach(n => {
          body += '<a href="tel:'+n.num+'" style="display:flex;justify-content:space-between;padding:14px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;text-decoration:none;color:inherit;border-left:3px solid '+n.c+'">'
            + '<div style="font-size:13px;font-weight:900">' + _esc(n.n) + '</div>'
            + '<div style="font-size:15px;font-weight:900;color:'+n.c+'">📞 ' + _esc(n.num) + '</div>'
            + '</a>';
        });
        body += '</div>';
      }

      if(tab === "contacts"){
        body += '<div class="card">'
          + '<button class="btn full" id="ecNew" style="margin-bottom:10px">➕ Notfallkontakt hinzufügen</button>';
        
        if(!contacts.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Kontakte</div>';
        else {
          contacts.forEach(function(c, i){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid var(--p1)">'
              + '<div><div style="font-size:13px;font-weight:900">' + _esc(c.name) + '</div>'
              + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(c.relation) + ' · ' + _esc(c.phone) + '</div></div>'
              + '<div style="display:flex;gap:4px">'
              + '<a href="tel:' + _esc(c.phone) + '" style="background:linear-gradient(135deg,#4ade80,#00e5ff);border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 10px;text-decoration:none;font-size:11px;font-weight:900">📞</a>'
              + '<button data-ecdel="'+i+'" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 8px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-nft]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.nft; store.set("tab", tab); build(); });
      });

      if(tab === "contacts"){
        container.querySelector("#ecNew").addEventListener("click", function(){
          var name = prompt("Name:"); if(!name) return;
          var phone = prompt("Telefonnummer:"); if(!phone) return;
          var rel = prompt("Verhältnis (z.B. Vater):", "Kontakt");
          var c = store.get("emergencyContacts", []);
          c.push({ name: name, phone: phone, relation: rel || "Kontakt" });
          store.set("emergencyContacts", c); build();
        });

        container.querySelectorAll("[data-ecdel]").forEach(el => {
          el.addEventListener("click", function(){
            var c = store.get("emergencyContacts", []); c.splice(parseInt(el.dataset.ecdel), 1); store.set("emergencyContacts", c); build();
          });
        });
      }
    }
    build();
  }
  HalDoApp("notfall", { name: "Notfall", icon: "🚨", render: render, category: "werkzeuge" });
  console.log("🦚 notfall.js v300 geladen");
})();
