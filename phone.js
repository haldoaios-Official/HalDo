/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PHONE (v300)
   Keypad · Anrufliste · Favoriten · Kontakte
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "keypad");

    function build(){
      var body = '';
      var num = store.get("num", "");
      var calls = store.get("calls", []);
      var favs = store.get("favs", []);

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "keypad" ? " active" : "") + '" data-pt="keypad">🔢 Keypad</button>'
        + '<button class="tab' + (tab === "calls" ? " active" : "") + '" data-pt="calls">📞 Anrufe</button>'
        + '<button class="tab' + (tab === "favs" ? " active" : "") + '" data-pt="favs">⭐ Favoriten</button>'
        + '</div>';

      if(tab === "keypad"){
        body += '<div class="card">'
          + '<div style="padding:16px;background:rgba(0,0,0,.3);border-radius:12px;margin-bottom:12px;text-align:center;min-height:60px;display:flex;align-items:center;justify-content:center">'
          + '<div style="font-size:28px;font-weight:900;color:var(--p1);word-break:break-all">' + (_esc(num) || "—") + '</div>'
          + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'
          + ["1","2","3","4","5","6","7","8","9","*","0","#"].map(function(d){
              return '<button data-dial="'+d+'" style="padding:18px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:12px;color:inherit;font-size:22px;font-weight:900;cursor:pointer;font-family:inherit">'+d+'</button>';
            }).join("")
          + '</div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">'
          + '<button class="btn sec" id="dialDel" style="font-size:18px">⌫</button>'
          + '<button class="btn" id="dialCall" style="font-size:20px;background:linear-gradient(135deg,#4ade80,#00e5ff)">📞</button>'
          + '<button class="btn sec" id="dialClear" style="font-size:18px">✕</button>'
          + '</div></div>';
      }

      if(tab === "calls"){
        body += '<div class="card"><h3>📞 Anrufliste (' + calls.length + ')</h3>';
        if(!calls.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Anrufe</div>';
        else {
          calls.slice().reverse().forEach(function(c, idx){
            var ri = calls.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:12.5px;font-weight:800">' + (c.type === "out" ? "📤" : "📥") + " " + _esc(c.number) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(c.date) + (c.duration ? " · " + _esc(c.duration) : "") + '</div></div>'
              + '<button data-redial="'+ri+'" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 10px;font-size:11px;font-weight:900">📞</button>'
              + '</div>';
          });
          body += '<button class="btn sec full" id="callClear" style="margin-top:10px">🗑️ Verlauf löschen</button>';
        }
        body += '</div>';
      }

      if(tab === "favs"){
        body += '<div class="card"><h3>⭐ Favoriten (' + favs.length + ')</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px">'
          + '<input type="text" id="favName" placeholder="Name" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
          + '<input type="tel" id="favNum" placeholder="Nummer" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<button class="btn full" id="favAdd">+ Favorit hinzufügen</button>'
          + '</div>';
        
        favs.forEach(function(f, i){
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div><div style="font-size:12.5px;font-weight:800">⭐ ' + _esc(f.name) + '</div>'
            + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(f.number) + '</div></div>'
            + '<div style="display:flex;gap:4px">'
            + '<button data-favcall="'+i+'" style="background:linear-gradient(135deg,#4ade80,#00e5ff);border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 10px;font-size:11px;font-weight:900">📞</button>'
            + '<button data-favdel="'+i+'" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 8px;font-size:11px">✕</button>'
            + '</div></div>';
        });
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-pt]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.pt; store.set("tab", tab); build(); });
      });

      if(tab === "keypad"){
        container.querySelectorAll("[data-dial]").forEach(el => {
          el.addEventListener("click", function(){ store.set("num", store.get("num", "") + el.dataset.dial); build(); });
        });
        var del = container.querySelector("#dialDel");
        if(del) del.addEventListener("click", function(){ store.set("num", store.get("num", "").slice(0, -1)); build(); });
        var clr = container.querySelector("#dialClear");
        if(clr) clr.addEventListener("click", function(){ store.set("num", ""); build(); });
        var call = container.querySelector("#dialCall");
        if(call) call.addEventListener("click", function(){
          var n = store.get("num", ""); if(!n) return alert("Nummer eingeben");
          var c = store.get("calls", []); c.push({ number: n, type: "out", date: new Date().toLocaleString("de-DE"), duration: "0:00" }); store.set("calls", c);
          if(HalDo.Notify) HalDo.Notify.info("📞 Anruf zu " + n + " simuliert"); store.set("num", ""); build();
        });
      }

      if(tab === "calls"){
        container.querySelectorAll("[data-redial]").forEach(el => {
          el.addEventListener("click", function(){
            var c = store.get("calls", [])[parseInt(el.dataset.redial)];
            if(c) { store.set("num", c.number); tab = "keypad"; store.set("tab", tab); build(); }
          });
        });
        var c2 = container.querySelector("#callClear");
        if(c2) c2.addEventListener("click", function(){ if(confirm("Verlauf löschen?")) { store.set("calls", []); build(); } });
      }

      if(tab === "favs"){
        container.querySelector("#favAdd").addEventListener("click", function(){
          var n = container.querySelector("#favName").value.trim(), num = container.querySelector("#favNum").value.trim();
          if(!n || !num) return alert("Name und Nummer eingeben");
          var f = store.get("favs", []); f.push({ name: n, number: num }); store.set("favs", f); build();
        });
        container.querySelectorAll("[data-favcall]").forEach(el => {
          el.addEventListener("click", function(){
            var f = store.get("favs", [])[parseInt(el.dataset.favcall)];
            if(f) { store.set("num", f.number); tab = "keypad"; store.set("tab", tab); build(); }
          });
        });
        container.querySelectorAll("[data-favdel]").forEach(el => {
          el.addEventListener("click", function(){ var f = store.get("favs", []); f.splice(parseInt(el.dataset.favdel), 1); store.set("favs", f); build(); });
        });
      }
    }

    build();
  }

  HalDoApp("phone", { name: "Phone", icon: "📞", render: render, category: "kommunikation" });
  console.log("🦚 phone.js v300 geladen — VOLL FUNKTIONSFÄHIG");
})();
