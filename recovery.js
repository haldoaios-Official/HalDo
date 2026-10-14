/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — RECOVERY MODE (v150)
   Notfall · Reset · Safe Mode · Reparatur
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;

    function build(){
      var body = '<div class="card"><h3>🚑 Recovery-Modus</h3>'
        + '<div style="padding:14px;background:rgba(255,128,128,.1);border-radius:10px;margin-bottom:14px;border-left:3px solid #ff8080">'
        + '<div style="font-size:12px;font-weight:900;color:#ff8080">⚠️ Notfall-Werkzeuge</div>'
        + '<div style="font-size:11px;color:var(--text-dim);line-height:1.55;margin-top:6px">Diese Funktionen sind für den Fall, dass etwas schiefgelaufen ist. Nutze sie mit Bedacht.</div>'
        + '</div></div>';

      /* Reset-Optionen */
      body += '<div class="card"><h3>🔄 Zurücksetzen</h3>'
        + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px">'
        + '<div style="font-size:12.5px;font-weight:800;margin-bottom:6px">🧹 Cache leeren</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Löscht nur temporäre Daten. Deine Einstellungen bleiben.</div>'
        + '<button class="btn sec full" id="clearCache">Cache leeren</button>'
        + '</div>'

        + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px">'
        + '<div style="font-size:12.5px;font-weight:800;margin-bottom:6px">🔕 Nur Chat-Verlauf löschen</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Alle Chat-Nachrichten entfernen, Apps bleiben.</div>'
        + '<button class="btn sec full" id="clearChats">Chat löschen</button>'
        + '</div>'

        + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px;margin-bottom:8px;border-left:3px solid #fbbf24">'
        + '<div style="font-size:12.5px;font-weight:800;margin-bottom:6px;color:#fbbf24">⚙️ Einstellungen zurücksetzen</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Setzt alle Einstellungen auf Standard. App-Daten bleiben.</div>'
        + '<button class="btn full" id="resetSettings" style="background:#fbbf24">Einstellungen resetten</button>'
        + '</div>'

        + '<div style="padding:12px;background:rgba(255,128,128,.1);border-radius:10px;border-left:3px solid #ff8080">'
        + '<div style="font-size:12.5px;font-weight:800;margin-bottom:6px;color:#ff8080">💥 Kompletter Reset</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Löscht <b>alle</b> HalDo-Daten. Nicht rückgängig machbar!</div>'
        + '<button class="btn danger full" id="fullReset">Alles löschen</button>'
        + '</div>'
        + '</div>';

      /* Safe Mode */
      body += '<div class="card"><h3>🛡️ Safe Mode</h3>'
        + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;border-left:3px solid var(--p1)">'
        + '<div style="font-size:12px;font-weight:800;margin-bottom:6px">Safe Mode aktivieren</div>'
        + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.55;margin-bottom:8px">Startet HalDo mit minimaler Last. Nur die wichtigsten Apps werden geladen. Hilft bei Abstürzen.</div>'
        + '<div id="safeModeHint" style="font-size:10px;color:var(--text-mute);margin-bottom:8px">Status: <b>' + (store.get("safeMode", false) ? "AKTIV" : "inaktiv") + '</b></div>'
        + '<button class="btn full" id="toggleSafe">' + (store.get("safeMode", false) ? "Safe Mode deaktivieren" : "Safe Mode aktivieren") + '</button>'
        + '</div>'
        + '</div>';

      /* Info */
      body += '<div class="card"><h3>ℹ️ Info</h3>'
        + '<div style="font-size:11px;color:var(--text-dim);line-height:1.7">'
        + '<div>💡 <b>Bei Problemen:</b> Erst Cache leeren, dann F5.</div>'
        + '<div>💾 <b>Vor Reset:</b> Backup erstellen (Backup-App)!</div>'
        + '<div>🛟 <b>Safe Mode:</b> Wenn nichts mehr geht.</div>'
        + '</div>'
        + '</div>';

      container.innerHTML = body;

      container.querySelector("#clearCache").addEventListener("click", function(){
        if(!confirm("Cache leeren? (Einstellungen bleiben)")) return;
        if("caches" in window){
          caches.keys().then(function(names){
            names.forEach(function(n){ caches.delete(n); });
          });
        }
        if(window.HalDo.Notify) HalDo.Notify.success("Cache geleert", { app: "recovery" });
      });

      container.querySelector("#clearChats").addEventListener("click", function(){
        if(!confirm("Chat-Verlauf wirklich löschen?")) return;
        var keys = Object.keys(localStorage).filter(function(k){
          return k.toLowerCase().indexOf("chat") !== -1;
        });
        keys.forEach(function(k){ localStorage.removeItem(k); });
        if(window.HalDo.Notify) HalDo.Notify.success("Chat gelöscht (" + keys.length + " Einträge)", { app: "recovery" });
      });

      container.querySelector("#resetSettings").addEventListener("click", function(){
        if(!confirm("Einstellungen zurücksetzen?")) return;
        var settingsKeys = ["haldo-theme", "haldoLang", "haldoVoice", "haldoSettings"];
        settingsKeys.forEach(function(k){ localStorage.removeItem(k); });
        if(window.HalDo.Notify) HalDo.Notify.success("Einstellungen zurückgesetzt", { app: "recovery" });
      });

      container.querySelector("#fullReset").addEventListener("click", function(){
        if(!confirm("⚠️ ALLES löschen? Das kann nicht rückgängig gemacht werden!")) return;
        if(!confirm("⚠️ WIRKLICH ALLES löschen? Letzte Warnung!")) return;

        var keys = Object.keys(localStorage).filter(function(k){
          return k.indexOf("haldo") === 0 || k.indexOf("HalDo") === 0;
        });
        keys.forEach(function(k){ localStorage.removeItem(k); });
        alert("✅ Alle HalDo-Daten gelöscht. Seite wird neu geladen.");
        location.reload();
      });

      container.querySelector("#toggleSafe").addEventListener("click", function(){
        var cur = store.get("safeMode", false);
        store.set("safeMode", !cur);
        if(window.HalDo.Notify) HalDo.Notify.info(!cur ? "Safe Mode aktiviert" : "Safe Mode deaktiviert", { app: "recovery" });
        build();
      });
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("recovery", { render: render });
  else console.warn("recovery.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 recovery.js geladen");
