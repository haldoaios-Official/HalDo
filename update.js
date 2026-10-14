/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — UPDATE MANAGER (v150)
   Version · Changelog · Update-Check
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var CURRENT_VERSION = "v150";
  var BUILD_DATE = "2026-01-15";

  var CHANGELOG = [
    {
      version: "v150",
      date: "2026-01-15",
      changes: [
        "✅ 44 Apps komplett integriert",
        "🎙️ Echte Audio-Aufnahme (MediaRecorder)",
        "📝 Speech Recognition Diktat (deutsch)",
        "🍳 Rezepte mit Auto-Einkaufsliste",
        "💪 Fitness mit 6 Workout-Plänen",
        "🏠 Zuhause mit Habits + Garten",
        "💾 Backup/Restore (JSON Export)",
        "🩺 System-Diagnostics + Recovery"
      ]
    },
    {
      version: "v140",
      date: "2026-01-10",
      changes: [
        "🧠 AI Chat mit Kontext",
        "🎨 Themes + Personalisierung",
        "📊 Erweiterte Statistiken"
      ]
    },
    {
      version: "v130",
      date: "2026-01-05",
      changes: [
        "🦚 Grundgerüst HalDo AI OS",
        "📱 App-Registry aufgebaut",
        "🔊 Voice-Ausgabe integriert"
      ]
    }
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "version");

    function build(){
      var body = "";

      /* ═══ VERSION ═══ */
      if(tab === "version"){
        body = '<div class="card">'
          + '<div style="padding:30px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:14px;text-align:center;border:1.5px solid var(--p1)">'
          + '<div style="font-size:72px">🦚</div>'
          + '<div style="font-size:26px;font-weight:900;color:var(--p1);margin-top:8px">HalDo AI OS</div>'
          + '<div style="font-size:16px;font-weight:800;color:var(--p3);margin-top:4px">' + _esc(CURRENT_VERSION) + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:6px">Build: ' + _esc(BUILD_DATE) + '</div>'
          + '</div>'
          + '<div style="margin-top:14px;padding:14px;background:rgba(74,222,128,.1);border-radius:10px;border-left:3px solid #4ade80;text-align:center">'
          + '<div style="font-size:14px;font-weight:900;color:#4ade80">✅ Aktuellste Version installiert</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">Du bist auf dem neuesten Stand</div>'
          + '</div>'
          + '</div>';

        body += '<div class="card"><h3>🔍 Update-Check</h3>'
          + '<button class="btn full" id="checkUpdate">🔄 Nach Updates suchen</button>'
          + '<div id="updateResult" style="margin-top:12px"></div>'
          + '</div>';

      /* ═══ CHANGELOG ═══ */
      } else if(tab === "changelog"){
        body = '<div class="card"><h3>📝 Changelog</h3>';
        CHANGELOG.forEach(function(rel, i){
          var isLatest = i === 0;
          body += '<div style="padding:14px;background:' + (isLatest ? "linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))" : "rgba(0,0,0,.2)") + ';border-radius:12px;margin-bottom:10px;border-left:3px solid ' + (isLatest ? "var(--p1)" : "var(--text-mute)") + '">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            + '<div style="font-size:15px;font-weight:900;color:' + (isLatest ? "var(--p1)" : "var(--text-dim)") + '">' + _esc(rel.version) + (isLatest ? " 🎉" : "") + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">' + _esc(rel.date) + '</div>'
            + '</div>';
          rel.changes.forEach(function(c){
            body += '<div style="font-size:11.5px;color:var(--text-dim);padding:3px 0;line-height:1.5">' + _esc(c) + '</div>';
          });
          body += '</div>';
        });
        body += '</div>';

      /* ═══ ROADMAP ═══ */
      } else if(tab === "roadmap"){
        var roadmap = [
          { v: "v160", items: ["🌍 Multi-Language (EN, AR, TR)", "☁️ Cloud-Sync (optional)", "📱 PWA Install-Prompt"] },
          { v: "v170", items: ["🤖 Lokales LLM (WebLLM)", "📸 Vision (Kamera-Analyse)", "🎮 Minigames"] },
          { v: "v180", items: ["🏢 Enterprise-Features", "🔐 Verschlüsselung E2E", "🌐 Community-Marketplace"] }
        ];

        body = '<div class="card"><h3>🚀 Roadmap</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:12px">Was geplant ist:</div>';
        roadmap.forEach(function(r){
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px;border-left:3px solid var(--p3)">'
            + '<div style="font-size:13px;font-weight:900;color:var(--p3);margin-bottom:6px">' + _esc(r.v) + '</div>';
          r.items.forEach(function(it){
            body += '<div style="font-size:11.5px;color:var(--text-dim);padding:2px 0">' + _esc(it) + '</div>';
          });
          body += '</div>';
        });
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="version"?" active":"") + '" data-ut="version">🦚 Version</button>'
        + '<button class="tab' + (tab==="changelog"?" active":"") + '" data-ut="changelog">📝 Changelog</button>'
        + '<button class="tab' + (tab==="roadmap"?" active":"") + '" data-ut="roadmap">🚀 Roadmap</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-ut]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.ut;
          store.set("tab", tab);
          build();
        });
      });

      var cu = container.querySelector("#checkUpdate");
      if(cu) cu.addEventListener("click", function(){
        var res = container.querySelector("#updateResult");
        res.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-mute)">🔍 Prüfe...</div>';
        setTimeout(function(){
          res.innerHTML = '<div style="padding:14px;background:rgba(74,222,128,.1);border-radius:10px;border-left:3px solid #4ade80;text-align:center">'
            + '<div style="font-size:14px;font-weight:900;color:#4ade80">✅ Kein Update verfügbar</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">' + _esc(CURRENT_VERSION) + ' ist aktuell</div>'
            + '</div>';
          if(window.HalDo.Notify) HalDo.Notify.info("Update-Check abgeschlossen", { app: "update" });
        }, 1200);
      });
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("update", { render: render });
  else console.warn("update.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 update.js geladen");
