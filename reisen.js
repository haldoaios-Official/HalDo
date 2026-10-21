/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — REISEN (v300)
   Reiseplaner · Packliste
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "trips");

    function build(){
      var body = '';
      body += '<div class="tabs">'
        + '<button class="tab'+(tab==="trips"?" active":"")+'" data-rt="trips">✈️ Reisen</button>'
        + '<button class="tab'+(tab==="pack"?" active":"")+'" data-rt="pack">🎒 Packliste</button>'
        + '</div>';

      if(tab === "trips") {
        var trips = store.get("trips", []);
        body += '<div class="card">'
          + '<button class="btn full" id="tAdd" style="margin-bottom:10px">+ Neue Reise</button>';
        if(!trips.length) body += '<div style="text-align:center;color:var(--text-mute);padding:20px">Keine Reisen geplant</div>';
        else {
          trips.forEach(t => {
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p2)">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p2)">✈️ ' + _esc(t.dest) + '</div>'
              + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">' + _esc(t.date) + '</div>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      if(tab === "pack") {
        var packing = store.get("packing", []);
        body += '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="pInp" placeholder="Item hinzufügen..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit">'
          + '<button class="btn" id="pAdd">+</button></div>';
        
        packing.forEach((p, i) => {
          body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;gap:8px;align-items:center">'
            + '<input type="checkbox" data-pcheck="'+i+'" '+(p.done?"checked":"")+' style="width:18px;height:18px;accent-color:var(--p1)">'
            + '<div style="flex:1;font-size:12px;'+(p.done?"text-decoration:line-through;color:var(--text-mute)":"")+'">'+_esc(p.text)+'</div>'
            + '<button data-pdel="'+i+'" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>';
        });
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-rt]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.rt; store.set("tab", tab); build(); });
      });

      if(tab === "trips") {
        container.querySelector("#tAdd").addEventListener("click", function(){
          var d = prompt("Reiseziel:"); if(!d) return;
          var dt = prompt("Datum (z.B. 12.08.2026):");
          var t = store.get("trips", []);
          t.push({ dest: d, date: dt });
          store.set("trips", t); build();
        });
      }

      if(tab === "pack") {
        var addItem = () => {
          var v = container.querySelector("#pInp").value.trim(); if(!v) return;
          var p = store.get("packing", []);
          p.push({ text: v, done: false });
          store.set("packing", p); build();
        };
        container.querySelector("#pAdd").addEventListener("click", addItem);
        container.querySelector("#pInp").addEventListener("keydown", e => { if(e.key==="Enter") addItem(); });

        container.querySelectorAll("[data-pcheck]").forEach(el => {
          el.addEventListener("change", function(){
            var p = store.get("packing", []); p[parseInt(this.dataset.pcheck)].done = !p[parseInt(this.dataset.pcheck)].done; store.set("packing", p); build();
          });
        });
        container.querySelectorAll("[data-pdel]").forEach(el => {
          el.addEventListener("click", function(){
            var p = store.get("packing", []); p.splice(parseInt(this.dataset.pdel), 1); store.set("packing", p); build();
          });
        });
      }
    }
    build();
  }

  HalDoApp("reisen", { name: "Reisen", icon: "✈️", render: render, category: "lifestyle" });
  console.log("🦚 reisen.js v300 geladen");
})();
