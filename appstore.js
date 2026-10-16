/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APPSTORE (v155)
   App-Verwaltung · Alle Apps · Statistiken
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "alle");

    function build(){
      var installed = HalDo.Apps.listInstalled();
      var all = HalDo.Apps.listAll();
      var missing = all.filter(function(a){ return !a.installed; });

      var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
        + '<div style="font-size:20px;font-weight:900;color:var(--p1)">🏪 HalDo AppStore</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
        + '<b style="color:#4ade80">' + installed.length + ' installiert</b>'
        + ' · <b>' + all.length + ' gesamt</b>'
        + '</div></div>';

      var filter = store.get("filter", "all");
      body += '<div class="card" style="padding:10px">'
        + '<div style="display:flex;gap:6px">'
        + fbtn("all", "Alle (" + all.length + ")", filter)
        + fbtn("installed", "✅ Installiert (" + installed.length + ")", filter)
        + fbtn("missing", "⏳ Fehlend (" + missing.length + ")", filter)
        + '</div></div>';

      var byCat = HalDo.Apps.listByCategory();
      Object.keys(HalDo.Apps.categories).forEach(function(catKey){
        var cat = HalDo.Apps.categories[catKey];
        var apps = byCat[catKey] || [];
        if(filter === "installed") apps = apps.filter(function(a){ return a.installed; });
        if(filter === "missing") apps = apps.filter(function(a){ return !a.installed; });
        if(!apps.length) return;

        body += '<div class="card"><h3 style="color:' + cat.color + '">' + cat.icon + ' ' + cat.name + ' (' + apps.length + ')</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
        apps.forEach(function(a){
          body += '<button data-appopen="' + _esc(a.id) + '" data-inst="' + (a.installed ? "1" : "0") + '" style="padding:14px 12px;background:' + (a.installed ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.1)") + ';border:1.5px solid ' + (a.installed ? cat.color + "66" : "rgba(255,255,255,.06)") + ';border-radius:12px;cursor:pointer;color:inherit;text-align:left;font-family:inherit;opacity:' + (a.installed ? "1" : ".5") + '">'
            + '<div style="font-size:24px;margin-bottom:4px">' + _esc(a.icon) + '</div>'
            + '<div style="font-size:12px;font-weight:900;color:' + (a.installed ? cat.color : "var(--text-dim)") + '">' + _esc(a.name) + '</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + _esc(a.desc) + '</div>'
            + (a.installed ? '' : '<div style="font-size:9px;color:#fbbf24;font-weight:900;margin-top:4px">⏳ geplant</div>')
            + '</button>';
        });
        body += '</div></div>';
      });

      container.innerHTML = body;

      container.querySelectorAll("[data-filter]").forEach(function(el){
        el.addEventListener("click", function(){
          store.set("filter", el.dataset.filter);
          build();
        });
      });
      container.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){
          if(el.dataset.inst === "1"){
            HalDo.Apps.open(el.dataset.appopen);
          } else {
            if(HalDo.Notify) HalDo.Notify.warn("Diese App ist noch nicht installiert", { app: "appstore" });
          }
        });
      });
    }

    function fbtn(id, label, active){
      return '<button data-filter="' + id + '" style="padding:8px 12px;background:' + (id === active ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.2)") + ';color:' + (id === active ? "#000" : "var(--text-dim)") + ';border:1px solid ' + (id === active ? "transparent" : "var(--border-soft)") + ';border-radius:8px;font-weight:900;font-size:11px;cursor:pointer;font-family:inherit;white-space:nowrap">' + _esc(label) + '</button>';
    }

    build();
  }

  HalDoApp("appstore", { name: "AppStore", icon: "🏪", render: render, category: "system" });
  console.log("🦚 appstore.js v155 geladen");
})();
