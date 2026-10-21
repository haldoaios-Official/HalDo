/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — STIMMUNG (v300)
   Täglicher Mood-Tracker · Emojis · Verlauf
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var MOODS = [
    { e: "😄", n: "Super", c: "#4ade80" },
    { e: "🙂", n: "Gut", c: "#84cc16" },
    { e: "😐", n: "Okay", c: "#fbbf24" },
    { e: "😔", n: "Schlecht", c: "#fb923c" },
    { e: "😢", n: "Sehr schlecht", c: "#ff8080" }
  ];

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function today(){ return new Date().toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;
    var log = store.get("log", {});

    function build(){
      var body = '';
      var todayLog = log[today()];

      body += '<div class="card"><h3>😊 Wie fühlst du dich heute?</h3>';
      
      if(todayLog) {
        var m = MOODS[todayLog.mood] || MOODS[2];
        body += '<div style="text-align:center;padding:20px;background:rgba(0,0,0,.2);border-radius:12px;margin-bottom:12px;border-left:3px solid '+m.c+'">'
          + '<div style="font-size:64px">'+m.e+'</div>'
          + '<div style="font-size:16px;font-weight:900;color:'+m.c+';margin-top:8px">'+m.n+'</div>'
          + (todayLog.note ? '<div style="font-size:12px;color:var(--text-dim);margin-top:8px;font-style:italic">"'+_esc(todayLog.note)+'"</div>' : '')
          + '</div>'
          + '<button class="btn sec full" id="moodReset">✏️ Ändern</button>';
      } else {
        body += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px">';
        MOODS.forEach((m, i) => {
          body += '<button data-mood="'+i+'" style="padding:12px 4px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;cursor:pointer;text-align:center">'
            + '<div style="font-size:28px">'+m.e+'</div>'
            + '<div style="font-size:9px;color:var(--text-mute);font-weight:800;margin-top:4px">'+m.n+'</div>'
            + '</button>';
        });
        body += '</div>'
          + '<textarea id="moodNote" rows="2" placeholder="Notiz (optional)..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px;font-family:inherit;margin-bottom:10px"></textarea>';
      }
      
      body += '</div>';

      // 7-Tage-Verlauf
      body += '<div class="card"><h3>📈 Verlauf</h3><div style="display:flex;justify-content:space-between">';
      for(let i=6; i>=0; i--) {
        let d = new Date(); d.setDate(d.getDate() - i);
        let key = d.toISOString().split("T")[0];
        let m = log[key];
        body += '<div style="text-align:center;flex:1">'
          + '<div style="font-size:24px">' + (m ? MOODS[m.mood].e : "·") + '</div>'
          + '<div style="font-size:9px;color:var(--text-mute);font-weight:800;margin-top:4px">' + ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()] + '</div>'
          + '</div>';
      }
      body += '</div></div>';

      container.innerHTML = body;

      if(!todayLog) {
        container.querySelectorAll("[data-mood]").forEach(btn => {
          btn.addEventListener("click", function(){
            var note = container.querySelector("#moodNote").value.trim();
            log[today()] = { mood: parseInt(this.dataset.mood), note: note };
            store.set("log", log); build();
            if(HalDo.Notify) HalDo.Notify.success("Stimmung gespeichert!");
          });
        });
      } else {
        container.querySelector("#moodReset").addEventListener("click", function(){
          delete log[today()]; store.set("log", log); build();
        });
      }
    }
    build();
  }

  HalDoApp("stimmung", { name: "Stimmung", icon: "😊", render: render, category: "gesundheit" });
  console.log("🦚 stimmung.js v300 geladen");
})();
