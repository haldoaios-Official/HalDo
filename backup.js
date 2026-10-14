/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BACKUP MANAGER (v150)
   Export · Import · Auto-Backup · Snapshot
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmtBytes(b){
    if(b < 1024) return b + " B";
    if(b < 1024*1024) return (b/1024).toFixed(1) + " KB";
    return (b/1024/1024).toFixed(2) + " MB";
  }

  function collectAll(){
    var data = {};
    var keys = Object.keys(localStorage).filter(function(k){
      return k.indexOf("haldo") === 0 || k.indexOf("HalDo") === 0;
    });
    keys.forEach(function(k){
      data[k] = localStorage.getItem(k);
    });
    return data;
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "export");

    function build(){
      var body = "";

      /* ═══ EXPORT ═══ */
      if(tab === "export"){
        var data = collectAll();
        var keys = Object.keys(data);
        var size = JSON.stringify(data).length;

        body = '<div class="card"><h3>📤 Backup erstellen</h3>'
          + '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p1)">'
          + '<div style="font-size:52px">💾</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p1);margin-top:8px">' + keys.length + ' Einträge</div>'
          + '<div style="font-size:12px;color:var(--text-dim);margin-top:4px">Gesamt: ' + fmtBytes(size) + '</div>'
          + '</div>'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.6;margin-bottom:14px">'
          + 'Alle HalDo-Daten werden als <b>JSON-Datei</b> exportiert. Damit kannst du dein System sichern und später wiederherstellen.'
          + '</div>'
          + '<button class="btn full" id="doExport">📥 Als JSON herunterladen</button>'
          + '<button class="btn sec full" id="doExportClip" style="margin-top:8px">📋 In Zwischenablage kopieren</button>'
          + '</div>';

        /* Auto-Backup Status */
        var autoBackup = store.get("autoBackup", false);
        var lastBackup = store.get("lastBackup", null);

        body += '<div class="card"><h3>⏰ Auto-Backup</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:10px">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<div><div style="font-size:12px;font-weight:800">Automatisches Backup</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">Erinnerung alle 7 Tage</div></div>'
          + '<button id="toggleAuto" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;background:' + (autoBackup ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (autoBackup ? "#000" : "var(--text-dim)") + '">'
          + (autoBackup ? "AN" : "AUS")
          + '</button>'
          + '</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:10px">Letztes Backup: ' + (lastBackup ? _esc(lastBackup) : "nie") + '</div>'
          + '</div>'
          + '</div>';

      /* ═══ IMPORT ═══ */
      } else if(tab === "import"){
        body = '<div class="card"><h3>📥 Backup importieren</h3>'
          + '<div style="padding:14px;background:rgba(255,128,128,.1);border-radius:10px;margin-bottom:14px;border-left:3px solid #ff8080">'
          + '<div style="font-size:12px;font-weight:900;color:#ff8080;margin-bottom:4px">⚠️ Achtung!</div>'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.55">Beim Import werden bestehende Daten <b>überschrieben</b>. Erstelle zuerst ein Backup!</div>'
          + '</div>'
          + '<div class="field"><label>JSON-Datei wählen</label>'
          + '<input type="file" id="importFile" accept=".json,application/json" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px">'
          + '</div>'
          + '<div class="field" style="margin-top:10px"><label>Oder JSON einfügen</label>'
          + '<textarea id="importText" placeholder=\'{"haldo...":"..."}\' rows="5" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:11px;font-family:monospace"></textarea>'
          + '</div>'
          + '<button class="btn full" id="doImport" style="margin-top:12px">📤 Backup einspielen</button>'
          + '<div id="importResult" style="margin-top:12px"></div>'
          + '</div>';

      /* ═══ SNAPSHOTS ═══ */
      } else if(tab === "snapshots"){
        var snaps = store.get("snapshots", []);
        body = '<div class="card"><h3>📸 Snapshots (' + snaps.length + ')</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Schnelle lokale Sicherungen (max. 3)</div>'
          + '<button class="btn full" id="newSnap">📸 Neuen Snapshot erstellen</button>';

        if(snaps.length){
          body += '<div style="margin-top:14px">';
          snaps.slice().reverse().forEach(function(s, idx){
            var ri = snaps.length - 1 - idx;
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
              + '<div>'
              + '<div style="font-size:11.5px;font-weight:800;color:var(--p1)">📸 Snapshot #' + (ri + 1) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(s.date) + ' · ' + s.keys + ' Einträge</div>'
              + '</div>'
              + '<div style="display:flex;gap:4px">'
              + '<button data-snaprestore="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:6px 10px;font-size:11px;font-weight:800">↺</button>'
              + '<button data-snapdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 10px;font-size:11px">✕</button>'
              + '</div>'
              + '</div>';
          });
          body += '</div>';
        }
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="export"?" active":"") + '" data-bt="export">📤 Export</button>'
        + '<button class="tab' + (tab==="import"?" active":"") + '" data-bt="import">📥 Import</button>'
        + '<button class="tab' + (tab==="snapshots"?" active":"") + '" data-bt="snapshots">📸 Snapshots</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-bt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.bt;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Export ═══ */
      if(tab === "export"){
        container.querySelector("#doExport").addEventListener("click", function(){
          var data = collectAll();
          var json = JSON.stringify(data, null, 2);
          var blob = new Blob([json], { type: "application/json" });
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          var ts = new Date().toISOString().split("T")[0];
          a.href = url;
          a.download = "haldo-backup-" + ts + ".json";
          a.click();
          URL.revokeObjectURL(url);
          store.set("lastBackup", new Date().toLocaleString("de-DE"));
          if(window.HalDo.Notify) HalDo.Notify.success("Backup heruntergeladen", { app: "backup" });
          build();
        });

        container.querySelector("#doExportClip").addEventListener("click", function(){
          var data = collectAll();
          var json = JSON.stringify(data);
          if(navigator.clipboard){
            navigator.clipboard.writeText(json).then(function(){
              if(window.HalDo.Notify) HalDo.Notify.info("Backup kopiert", { app: "backup" });
            });
          } else {
            alert("Zwischenablage nicht verfügbar");
          }
        });

        var toggle = container.querySelector("#toggleAuto");
        if(toggle) toggle.addEventListener("click", function(){
          var cur = store.get("autoBackup", false);
          store.set("autoBackup", !cur);
          build();
        });
      }

      /* ═══ Import ═══ */
      if(tab === "import"){
        var fileInp = container.querySelector("#importFile");
        var textInp = container.querySelector("#importText");
        var result = container.querySelector("#importResult");

        fileInp.addEventListener("change", function(){
          var f = fileInp.files[0];
          if(!f) return;
          var reader = new FileReader();
          reader.onload = function(e){
            textInp.value = e.target.result;
          };
          reader.readAsText(f);
        });

        container.querySelector("#doImport").addEventListener("click", function(){
          var txt = textInp.value.trim();
          if(!txt){ result.innerHTML = '<div style="color:#ff8080;font-size:12px">⚠️ Keine Daten</div>'; return; }

          try {
            var data = JSON.parse(txt);
            if(typeof data !== "object" || Array.isArray(data)) throw new Error("Ungültiges Format");

            /* Auto-Snapshot vor Import */
            var snaps = store.get("snapshots", []);
            snaps.push({ date: new Date().toLocaleString("de-DE"), keys: Object.keys(collectAll()).length, data: collectAll() });
            if(snaps.length > 3) snaps.shift();
            store.set("snapshots", snaps);

            /* Import */
            var count = 0;
            Object.keys(data).forEach(function(k){
              try {
                localStorage.setItem(k, data[k]);
                count++;
              } catch(e){}
            });

            result.innerHTML = '<div style="padding:14px;background:rgba(74,222,128,.1);border-radius:10px;border-left:3px solid #4ade80">'
              + '<div style="font-size:13px;font-weight:900;color:#4ade80">✅ ' + count + ' Einträge importiert</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">Auto-Snapshot wurde erstellt.</div>'
              + '</div>';
            if(window.HalDo.Notify) HalDo.Notify.success("Backup importiert", { app: "backup" });
            if(window.HalDo.Voice) HalDo.Voice.speak("Backup erfolgreich eingespielt");
          } catch(e){
            result.innerHTML = '<div style="padding:14px;background:rgba(255,128,128,.1);border-radius:10px;border-left:3px solid #ff8080">'
              + '<div style="font-size:13px;font-weight:900;color:#ff8080">❌ Fehler: ' + _esc(e.message) + '</div>'
              + '</div>';
          }
        });
      }

      /* ═══ Snapshots ═══ */
      if(tab === "snapshots"){
        var snaps2 = store.get("snapshots", []);

        container.querySelector("#newSnap").addEventListener("click", function(){
          var all = collectAll();
          snaps2.push({
            date: new Date().toLocaleString("de-DE"),
            keys: Object.keys(all).length,
            data: all
          });
          if(snaps2.length > 3) snaps2.shift();
          store.set("snapshots", snaps2);
          if(window.HalDo.Notify) HalDo.Notify.info("Snapshot erstellt", { app: "backup" });
          build();
        });

        container.querySelectorAll("[data-snapdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Snapshot löschen?")) return;
            snaps2.splice(parseInt(el.dataset.snapdel), 1);
            store.set("snapshots", snaps2);
            build();
          });
        });

        container.querySelectorAll("[data-snaprestore]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Diesen Snapshot wiederherstellen? Aktuelle Daten werden überschrieben!")) return;
            var s = snaps2[parseInt(el.dataset.snaprestore)];
            if(!s || !s.data) return;
            Object.keys(s.data).forEach(function(k){
              try { localStorage.setItem(k, s.data[k]); } catch(e){}
            });
            if(window.HalDo.Notify) HalDo.Notify.success("Snapshot wiederhergestellt", { app: "backup" });
            alert("✅ Snapshot wiederhergestellt. Seite neu laden (F5).");
          });
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("backup", { render: render });
  else console.warn("backup.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 backup.js geladen");
