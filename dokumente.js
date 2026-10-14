/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DOKUMENTE APP (v150)
   Text · Tabellen · PDF-Viewer · Liste
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
    var tab = store.get("tab", "text");
    var docs = store.get("docs", []);

    function build(){
      var body = "";

      if(tab === "text"){
        body = '<div class="card"><h3>📝 Text-Editor</h3>'
          + '<div class="field"><label>Titel</label><input type="text" id="dtT" placeholder="Dokument-Titel"></div>'
          + '<textarea id="dtB" style="width:100%;min-height:280px;padding:12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-family:ui-monospace;font-size:13px;line-height:1.6;resize:vertical" placeholder="Schreibe hier..."></textarea>'
          + '<div style="display:flex;gap:8px;margin-top:8px">'
          + '<button class="btn" id="dtSave" style="flex:1">💾 Speichern</button>'
          + '<button class="btn sec" id="dtExp" style="flex:1">📤 .txt</button>'
          + '<button class="btn sec" id="dtAI" style="flex:1">🦚 AI</button>'
          + '</div></div>';

      } else if(tab === "tabellen"){
        body = '<div class="card"><h3>📊 Tabelle (10×6)</h3>'
          + '<div style="overflow-x:auto;margin-bottom:10px">'
          + '<table style="border-collapse:collapse;width:100%;min-width:500px"><tbody>'
          + '<tr><th style="padding:8px;background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.3);font-size:11px">#</th>'
          + ["A","B","C","D","E","F"].map(function(c){ return '<th style="padding:8px;background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.3);font-size:11px">' + c + '</th>'; }).join("")
          + '</tr>'
          + Array.from({length: 10}).map(function(_, r){
              return '<tr><td style="padding:4px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.15);font-size:10px;text-align:center">' + (r+1) + '</td>'
                + Array.from({length: 6}).map(function(_, c){
                    return '<td style="padding:0;border:1px solid rgba(0,229,255,.15)"><input class="table-cell" data-r="' + r + '" data-c="' + c + '" style="border:none"></td>';
                  }).join("") + '</tr>';
            }).join("")
          + '</tbody></table></div>'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="tbSave" style="flex:1">💾 Speichern</button>'
          + '<button class="btn sec" id="tbExp" style="flex:1">📤 .csv</button>'
          + '</div></div>';

      } else if(tab === "pdf"){
        body = '<div class="card"><h3>📄 PDF-Viewer</h3>'
          + '<div class="field"><label>PDF-URL</label><input type="text" id="pdfU" placeholder="https://example.com/document.pdf"></div>'
          + '<button class="btn full" id="pdfL">📄 Anzeigen</button>'
          + '<div class="badge-info">Nutzt den Browser-PDF-Viewer (iframe).</div>'
          + '<div id="pdfR" style="margin-top:14px"></div>'
          + '</div>';

      } else if(tab === "liste"){
        body = '<div class="card"><h3>📁 Meine Dokumente (' + docs.length + ')</h3>';
        if(docs.length){
          docs.slice().reverse().forEach(function(d, idx){
            var ri = docs.length - 1 - idx;
            body += '<div class="doc-item" data-di="' + ri + '">'
              + '<span class="ico">' + (d.type === "txt" ? "📝" : d.type === "csv" ? "📊" : "📄") + '</span>'
              + '<div class="info"><div class="nm">' + _esc(d.title) + '</div>'
              + '<div class="dt">' + _esc(d.date) + ' · ' + _esc(d.type) + '</div></div>'
              + '<button data-dd="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:14px">✕</button>'
              + '</div>';
          });
        } else {
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Dokumente</div>';
        }
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="text"?" active":"") + '" data-dokt="text">📝 Text</button>'
        + '<button class="tab' + (tab==="tabellen"?" active":"") + '" data-dokt="tabellen">📊 Tabelle</button>'
        + '<button class="tab' + (tab==="pdf"?" active":"") + '" data-dokt="pdf">📄 PDF</button>'
        + '<button class="tab' + (tab==="liste"?" active":"") + '" data-dokt="liste">📁 Liste</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-dokt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.dokt;
          store.set("tab", tab);
          build();
        });
      });

      if(tab === "text"){
        container.querySelector("#dtSave").addEventListener("click", function(){
          var t = container.querySelector("#dtT").value.trim() || "Unbenannt";
          docs.push({
            title: t,
            body: container.querySelector("#dtB").value,
            type: "txt",
            date: new Date().toLocaleDateString("de-DE")
          });
          store.set("docs", docs);
          if(window.HalDo.Voice) HalDo.Voice.speak("Dokument gespeichert");
          build();
        });
        container.querySelector("#dtExp").addEventListener("click", function(){
          var t = container.querySelector("#dtT").value.trim() || "dokument";
          var b = new Blob([container.querySelector("#dtB").value], { type: "text/plain;charset=utf-8" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.download = t + ".txt";
          a.click();
        });
        container.querySelector("#dtAI").addEventListener("click", function(){
          var txt = container.querySelector("#dtB").value.trim();
          if(!txt){ alert("Text eingeben"); return; }
          if(!window.HalDo.AI){ alert("AI nicht verfügbar"); return; }
          if(window.HalDo.Voice) HalDo.Voice.speak("Frage HalDo AI");
          window.HalDo.AI.chat("Analysiere und verbessere diesen Text:\n\n" + txt).then(function(answer){
            container.querySelector("#dtB").value = answer;
            if(window.HalDo.Voice) HalDo.Voice.speak("Text verbessert");
          });
        });
      }

      if(tab === "tabellen"){
        container.querySelector("#tbSave").addEventListener("click", function(){
          var rows = [];
          for(var r = 0; r < 10; r++){
            var row = [];
            for(var c = 0; c < 6; c++){
              var i = container.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
              row.push(i ? i.value : "");
            }
            rows.push(row);
          }
          docs.push({
            title: "Tabelle_" + Date.now(),
            body: JSON.stringify(rows),
            type: "csv",
            date: new Date().toLocaleDateString("de-DE")
          });
          store.set("docs", docs);
          if(window.HalDo.Voice) HalDo.Voice.speak("Tabelle gespeichert");
        });
        container.querySelector("#tbExp").addEventListener("click", function(){
          var csv = [];
          for(var r = 0; r < 10; r++){
            var row = [];
            for(var c = 0; c < 6; c++){
              var i = container.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
              row.push('"' + (i ? i.value.replace(/"/g, '""') : "") + '"');
            }
            csv.push(row.join(","));
          }
          var b = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.download = "tabelle.csv";
          a.click();
        });
      }

      if(tab === "pdf"){
        container.querySelector("#pdfL").addEventListener("click", function(){
          var u = container.querySelector("#pdfU").value.trim();
          if(!u) return;
          container.querySelector("#pdfR").innerHTML = '<iframe src="' + _esc(u) + '" class="pdf-viewer" style="height:400px"></iframe>';
        });
      }

      if(tab === "liste"){
        container.querySelectorAll("[data-di]").forEach(function(el){
          el.addEventListener("click", function(){
            var d = docs[parseInt(el.dataset.di)];
            if(!d) return;
            if(d.type === "txt"){
              tab = "text";
              store.set("tab", tab);
              build();
              container.querySelector("#dtT").value = d.title;
              container.querySelector("#dtB").value = d.body;
            } else if(d.type === "csv"){
              tab = "tabellen";
              store.set("tab", tab);
              build();
              try {
                var rows = JSON.parse(d.body);
                for(var r = 0; r < 10; r++) for(var c = 0; c < 6; c++){
                  var i = container.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
                  if(i && rows[r]) i.value = rows[r][c] || "";
                }
              } catch(e){}
            }
          });
        });
        container.querySelectorAll("[data-dd]").forEach(function(el){
          el.addEventListener("click", function(e){
            e.stopPropagation();
            docs.splice(parseInt(el.dataset.dd), 1);
            store.set("docs", docs);
            build();
          });
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("dokumente", { render: render });
  else console.warn("dokumente.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 dokumente.js geladen");
