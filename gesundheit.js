/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GESUNDHEIT (v152)
   Symptome · Medikamente · Arzttermine · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "symptome");

    function build(){
      var body = "";

      if(tab === "symptome"){
        var symptoms = store.get("symptoms", []);
        body = '<div class="card"><h3>🩺 Symptom-Tagebuch (' + symptoms.length + ')</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px">'
          + '<input type="text" id="symName" placeholder="Symptom (z.B. Kopfschmerzen)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
          + '<select id="symSeverity" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="1">😊 Leicht (1)</option>'
          + '<option value="2">😐 Mittel (2)</option>'
          + '<option value="3">😣 Stark (3)</option>'
          + '<option value="4">😖 Sehr stark (4)</option>'
          + '</select>'
          + '<input type="text" id="symDuration" placeholder="Dauer (z.B. 2h)" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '</div>'
          + '<input type="text" id="symNotes" placeholder="Notizen" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:8px">'
          + '<button class="btn full" id="symAdd">+ Symptom erfassen</button>'
          + '</div>';

        if(!symptoms.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Noch keine Symptome erfasst</div>';
        } else {
          symptoms.slice().reverse().forEach(function(s){
            var ri = symptoms.length - 1 - symptoms.slice().reverse().indexOf(s);
            var emoji = ["", "😊", "😐", "😣", "😖"][s.severity] || "❓";
            var col = ["", "#4ade80", "#fbbf24", "#fb923c", "#ff8080"][s.severity] || "var(--text-mute)";
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid ' + col + '">'
              + '<div style="display:flex;justify-content:space-between">'
              + '<div style="flex:1">'
              + '<div style="font-size:12.5px;font-weight:900">' + emoji + ' ' + _esc(s.name) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + _esc(s.date) + (s.duration ? " · " + _esc(s.duration) : "") + '</div>'
              + (s.notes ? '<div style="font-size:10.5px;color:var(--text-dim);margin-top:2px">' + _esc(s.notes) + '</div>' : '')
              + '</div>'
              + '<button data-symdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "medikamente"){
        var meds = store.get("meds", []);
        body = '<div class="card"><h3>💊 Medikamente (' + meds.length + ')</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px">'
          + '<input type="text" id="medName" placeholder="Name" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
          + '<input type="text" id="medDose" placeholder="Dosis (z.B. 500mg)" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '<input type="text" id="medFreq" placeholder="Häufigkeit" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
          + '</div>'
          + '<input type="text" id="medTime" placeholder="Uhrzeit (z.B. 08:00)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:8px">'
          + '<button class="btn full" id="medAdd">+ Medikament hinzufügen</button>'
          + '</div>';

        if(!meds.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Keine Medikamente</div>';
        } else {
          meds.forEach(function(m, i){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid var(--p2);display:flex;justify-content:space-between;align-items:center">'
              + '<div>'
              + '<div style="font-size:12.5px;font-weight:900;color:var(--p2)">💊 ' + _esc(m.name) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(m.dose || "") + (m.freq ? " · " + _esc(m.freq) : "") + (m.time ? " · " + _esc(m.time) : "") + '</div>'
              + '</div>'
              + '<button data-meddel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "arzttermine"){
        var appts = store.get("appointments", []);
        body = '<div class="card"><h3>👨‍⚕️ Arzttermine (' + appts.length + ')</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px">'
          + '<input type="text" id="appDoctor" placeholder="Arzt / Praxis" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
          + '<input type="text" id="appReason" placeholder="Grund" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:6px">'
          + '<input type="datetime-local" id="appDate" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:8px">'
          + '<button class="btn full" id="appAdd">+ Termin hinzufügen</button>'
          + '</div>';

        if(!appts.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Keine Termine</div>';
        } else {
          appts.slice().sort(function(a, b){ return (a.date || "").localeCompare(b.date || ""); }).forEach(function(a){
            var ri = appts.indexOf(a);
            var isPast = a.date && new Date(a.date) < new Date();
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid ' + (isPast ? "var(--text-mute)" : "var(--p3)") + ';display:flex;justify-content:space-between;align-items:center">'
              + '<div>'
              + '<div style="font-size:12.5px;font-weight:900">👨‍⚕️ ' + _esc(a.doctor) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(a.reason || "") + '</div>'
              + '<div style="font-size:10.5px;color:var(--p1);font-weight:800;margin-top:2px">' + _esc(a.date || "") + '</div>'
              + '</div>'
              + '<button data-appdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        var symptoms2 = store.get("symptoms", []);
        var meds2 = store.get("meds", []);
        var appts2 = store.get("appointments", []);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'
          + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">SYMPTOME</div>'
          + '<div style="font-size:18px;font-weight:900;color:var(--p1)">' + symptoms2.length + '</div>'
          + '</div>'
          + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">MEDIS</div>'
          + '<div style="font-size:18px;font-weight:900;color:var(--p2)">' + meds2.length + '</div>'
          + '</div>'
          + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">TERMINE</div>'
          + '<div style="font-size:18px;font-weight:900;color:var(--p3)">' + appts2.length + '</div>'
          + '</div></div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:14px;line-height:1.5">'
          + '⚠️ Diese App ersetzt <b>keinen Arzt</b>. Nur zur Dokumentation!'
          + '</div>'
          + '<button class="btn danger full" id="gClear" style="margin-top:10px">🗑️ Alle Daten löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="symptome"?" active":"") + '" data-gt="symptome">🩺 Symptome</button>'
        + '<button class="tab' + (tab==="medikamente"?" active":"") + '" data-gt="medikamente">💊 Medikamente</button>'
        + '<button class="tab' + (tab==="arzttermine"?" active":"") + '" data-gt="arzttermine">👨‍⚕️ Termine</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-gt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-gt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.gt; store.set("tab", tab); build();
        });
      });

      if(tab === "symptome"){
        container.querySelector("#symAdd").addEventListener("click", function(){
          var name = container.querySelector("#symName").value.trim();
          if(!name){ alert("Symptom eingeben"); return; }
          var symptoms3 = store.get("symptoms", []);
          symptoms3.push({
            name: name,
            severity: parseInt(container.querySelector("#symSeverity").value) || 1,
            duration: container.querySelector("#symDuration").value.trim(),
            notes: container.querySelector("#symNotes").value.trim(),
            date: new Date().toLocaleString("de-DE")
          });
          store.set("symptoms", symptoms3);
          if(HalDo.Notify) HalDo.Notify.success("Symptom erfasst", { app: "gesundheit" });
          build();
        });
        container.querySelectorAll("[data-symdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var symptoms4 = store.get("symptoms", []);
            symptoms4.splice(parseInt(el.dataset.symdel), 1);
            store.set("symptoms", symptoms4);
            build();
          });
        });
      }

      if(tab === "medikamente"){
        container.querySelector("#medAdd").addEventListener("click", function(){
          var name = container.querySelector("#medName").value.trim();
          if(!name){ alert("Name eingeben"); return; }
          var meds3 = store.get("meds", []);
          meds3.push({
            name: name,
            dose: container.querySelector("#medDose").value.trim(),
            freq: container.querySelector("#medFreq").value.trim(),
            time: container.querySelector("#medTime").value.trim()
          });
          store.set("meds", meds3);
          build();
        });
        container.querySelectorAll("[data-meddel]").forEach(function(el){
          el.addEventListener("click", function(){
            var meds4 = store.get("meds", []);
            meds4.splice(parseInt(el.dataset.meddel), 1);
            store.set("meds", meds4);
            build();
          });
        });
      }

      if(tab === "arzttermine"){
        container.querySelector("#appAdd").addEventListener("click", function(){
          var doctor = container.querySelector("#appDoctor").value.trim();
          if(!doctor){ alert("Arzt eingeben"); return; }
          var appts3 = store.get("appointments", []);
          appts3.push({
            doctor: doctor,
            reason: container.querySelector("#appReason").value.trim(),
            date: container.querySelector("#appDate").value
          });
          store.set("appointments", appts3);
          build();
        });
        container.querySelectorAll("[data-appdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var appts4 = store.get("appointments", []);
            appts4.splice(parseInt(el.dataset.appdel), 1);
            store.set("appointments", appts4);
            build();
          });
        });
      }

      if(tab === "settings"){
        container.querySelector("#gClear").addEventListener("click", function(){
          if(!confirm("ALLE Gesundheitsdaten löschen?")) return;
          store.set("symptoms", []);
          store.set("meds", []);
          store.set("appointments", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("gesundheit", { name: "Gesundheit", icon: "🩺", render: render, category: "gesundheit" });
  console.log("🦚 gesundheit.js geladen");
})();
