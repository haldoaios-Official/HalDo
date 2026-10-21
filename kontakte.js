/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KONTAKTE (v300)
   Liste · Favoriten · Suche · Detail
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "alle");

    function build(){
      var body = '';
      var contacts = store.get("contacts", []);
      var query = store.get("query", "").toLowerCase();
      var isFav = tab === "favoriten";

      var filtered = contacts.filter(c => {
        if(isFav && !c.fav) return false;
        if(!query) return true;
        return (c.name||"").toLowerCase().includes(query) || (c.phone||"").includes(query) || (c.email||"").toLowerCase().includes(query);
      });

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "alle" ? " active" : "") + '" data-ct="alle">👥 Alle</button>'
        + '<button class="tab' + (tab === "favoriten" ? " active" : "") + '" data-ct="favoriten">⭐ Favoriten</button>'
        + '</div>';

      body += '<div class="card">'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<input type="text" id="cSearch" placeholder="🔍 Suchen..." value="' + _esc(store.get("query","")) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<button class="btn" id="cNew" style="padding:0 16px">+</button>'
        + '</div>';

      if(!filtered.length) {
        body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (contacts.length ? "Keine Treffer" : "Keine Kontakte") + '</div>';
      } else {
        filtered.sort((a,b) => (a.name||"").localeCompare(b.name||"")).forEach(c => {
          var ri = contacts.indexOf(c);
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;align-items:center;gap:10px;border-left:3px solid ' + (c.fav ? "#fbbf24" : "var(--p1)") + '">'
            + '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--p1),var(--p3));display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;flex-shrink:0">' + _esc((c.name||"?").charAt(0).toUpperCase()) + '</div>'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:13px;font-weight:900">' + _esc(c.name) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(c.phone || "—") + (c.email ? " · " + _esc(c.email) : "") + '</div>'
            + '</div>'
            + '<div style="display:flex;flex-direction:column;gap:4px">'
            + '<button data-cfav="'+ri+'" style="background:transparent;border:none;cursor:pointer">' + (c.fav ? "⭐" : "☆") + '</button>'
            + '<button data-cdel="'+ri+'" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px">✕</button>'
            + '</div></div>';
        });
      }
      body += '</div>';
      container.innerHTML = body;

      container.querySelectorAll("[data-ct]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.ct; store.set("tab", tab); build(); });
      });

      var sInp = container.querySelector("#cSearch");
      if(sInp) sInp.addEventListener("input", function(){ store.set("query", this.value); build(); });

      container.querySelector("#cNew").addEventListener("click", function(){
        var name = prompt("Name:"); if(!name) return;
        var phone = prompt("Telefonnummer:");
        var email = prompt("E-Mail:");
        var c = store.get("contacts", []);
        c.push({ name: name, phone: phone || "", email: email || "", fav: false });
        store.set("contacts", c); build();
      });

      container.querySelectorAll("[data-cfav]").forEach(el => {
        el.addEventListener("click", function(){
          var c = store.get("contacts", []); var item = c[parseInt(el.dataset.cfav)]; item.fav = !item.fav; store.set("contacts", c); build();
        });
      });
      container.querySelectorAll("[data-cdel]").forEach(el => {
        el.addEventListener("click", function(){
          if(!confirm("Kontakt löschen?")) return;
          var c = store.get("contacts", []); c.splice(parseInt(el.dataset.cdel), 1); store.set("contacts", c); build();
        });
      });
    }
    build();
  }
  HalDoApp("kontakte", { name: "Kontakte", icon: "👥", render: render, category: "kommunikation" });
  console.log("🦚 kontakte.js v300 geladen");
})();
