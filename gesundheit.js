/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GESUNDHEIT (v300)
   Symptome · Medikamente · Arzttermine
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "symptoms");

    function build(){
      var body = '';
      body += '<div class="tabs">'
        + '<button class="tab'+(tab==="symptoms"?" active":"")+'" data-gt="symptoms">🤒 Symptome</button>'
        + '<button class="tab'+(tab==="meds"?" active":"")+'" data-gt="meds">💊 Medikamente</button>'
        + '</div>';

      if(tab === "symptoms") {
        var symptoms = store.get("symptoms", []);
        body += '<div class="card">'
          + '<button class="btn full" id="sAdd" style="margin-bottom:10px">+ Symptom erfassen</button>';
        if(!symptoms.length) body += '<div style="text-align:center;color:var(--text-mute);padding:20px">Keine Symptome</div>';
        else {
          symptoms.forEach((s, i) => {
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid var(--p2)">'
              + '<div style="display:flex;justify-content:space-between">'
              + '<div style="font-size:12.5px;font-weight:900">' + _esc(s.name) + '</div>'
              + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(s.severity) + '</div>'
              + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(s.date) + '</div>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      if(tab === "meds") {
        var meds = store.get("meds", []);
        body += '<div class="card">'
          + '<button class="btn full" id="mAdd" style="margin-bottom:10px">+ Medikament hinzufügen</button>';
        if(!meds.length) body += '<div style="text-align:center;color:var(--text-mute);padding:20px">Keine Medikamente</div>';
        else {
          meds.forEach((m, i) => {
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid var(--p3)">'
              + '<div style="font-size:12.5px;font-weight:900">💊 ' + _esc(m.name) + '</div>'
              + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(m.dose) + ' · ' + _esc(m.freq) + '</div>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-gt]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.gt; store.set("tab", tab); build(); });
      });

      if(tab === "symptoms") {
        container.querySelector("#sAdd").addEventListener("click", function(){
          var n = prompt("Symptom:"); if(!n) return;
          var sev = prompt("Stärke (leicht, mittel, stark):", "mittel");
          var s = store.get("symptoms", []);
          s.push({ name: n, severity: sev, date: new Date().toLocaleString("de-DE") });
          store.set("symptoms", s); build();
        });
      }

      if(tab === "meds") {
        container.querySelector("#mAdd").addEventListener("click", function(){
          var n = prompt("Medikament:"); if(!n) return;
          var d = prompt("Dosis (z.B. 500mg):");
          var f = prompt("Häufigkeit (z.B. 2x täglich):");
          var m = store.get("meds", []);
          m.push({ name: n, dose: d, freq: f });
          store.set("meds", m); build();
        });
      }
    }
    build();
  }

  HalDoApp("gesundheit", { name: "Gesundheit", icon: "🩺", render: render, category: "gesundheit" });
  console.log("🦚 gesundheit.js v300 geladen");
})();
