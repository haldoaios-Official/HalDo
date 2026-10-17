/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NOTES (v300) · MIT LOKALER KI
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

    function build(editId){
      var notes = store.get("items", []);
      var search = store.get("search", "");

      var filtered = notes.filter(function(n){
        if(!search) return true;
        var s = search.toLowerCase();
        return (n.title || "").toLowerCase().indexOf(s) !== -1 || (n.text || "").toLowerCase().indexOf(s) !== -1;
      });

      var body = '<div class="card">'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<input type="text" id="noteSearch" placeholder="🔍 Suchen..." value="' + _esc(search) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<button class="btn" id="noteNew" style="padding:0 16px">+ Neu</button>'
        + '</div>';

      if(editId !== undefined){
        var note = notes[editId] || { title: "", text: "" };
        body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
          + '<input type="text" id="nTitle" placeholder="Titel" value="' + _esc(note.title) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:14px;font-weight:900;margin-bottom:6px">'
          + '<textarea id="nText" placeholder="Inhalt..." rows="6" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(note.text) + '</textarea>'
          
          + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
          + '<button class="btn sec" data-ai-act="rewrite" style="font-size:10.5px;padding:6px 8px">🔄 Verbessern</button>'
          + '<button class="btn sec" data-ai-act="summarize" style="font-size:10.5px;padding:6px 8px">📝 Zusammenfassen</button>'
          + '<button class="btn sec" data-ai-act="translate" style="font-size:10.5px;padding:6px 8px">🌍 Übersetzen</button>'
          + '</div>'
          + '<div id="ai_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:6px;font-size:10.5px;color:var(--text-dim)"></div>'

          + '<div style="display:flex;gap:6px;margin-top:8px">'
          + '<button class="btn" id="nSave" style="flex:1">💾 Speichern</button>'
          + '<button class="btn sec" id="nCancel">Abbrechen</button>'
          + '</div></div>';
      }

      if(!filtered.length && editId === undefined){
        body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (notes.length ? "Keine Treffer" : "Noch keine Notizen") + '</div>';
      } else {
        filtered.slice().reverse().forEach(function(n){
          var ri = notes.indexOf(n);
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;gap:10px;border-left:3px solid var(--p3)">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:13px;font-weight:900;color:var(--p3)">' + _esc(n.title || "Ohne Titel") + '</div>'
            + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:4px;line-height:1.5;word-break:break-word">' + _esc((n.text || "").substring(0, 120)) + ((n.text || "").length > 120 ? "..." : "") + '</div>'
            + '</div>'
            + '<div style="display:flex;flex-direction:column;gap:4px">'
            + '<button data-nedit="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:6px 10px;font-size:11px">✏️</button>'
            + '<button data-ndel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 10px;font-size:11px">✕</button>'
            + '</div></div>';
        });
      }
      body += '</div>';

      container.innerHTML = body;

      var sInp = container.querySelector("#noteSearch");
      if(sInp) sInp.addEventListener("input", function(){ store.set("search", this.value); build(editId); });

      var nb = container.querySelector("#noteNew");
      if(nb) nb.addEventListener("click", function(){ build(-1); });

      if(editId !== undefined){
        var stat = container.querySelector("#ai_status");

        // KI-Funktionen
        container.querySelectorAll("[data-ai-act]").forEach(function(btn){
          btn.addEventListener("click", async function(){
            var act = btn.dataset.aiAct;
            var txt = container.querySelector("#nText").value.trim();
            if(!txt) return alert("Text ist leer!");

            stat.style.display = "block";
            stat.textContent = "⏳ KI arbeitet... (10-30s)";
            btn.disabled = true;

            try {
              if(!HalDo.AI) throw new Error("KI nicht geladen");
              var result = "";
              
              if(act === "rewrite") result = await HalDo.AI.rewrite(txt);
              else if(act === "summarize") result = await HalDo.AI.summarize(txt);
              else if(act === "translate") result = await HalDo.AI.translate(txt, "Englisch");

              container.querySelector("#nText").value = result;
              stat.textContent = "✅ Fertig!";
            } catch(e){
              stat.textContent = "❌ " + e.message;
            }
            btn.disabled = false;
          });
        });

        var save = container.querySelector("#nSave");
        if(save) save.addEventListener("click", function(){
          var t = container.querySelector("#nTitle").value.trim();
          var txt = container.querySelector("#nText").value.trim();
          if(!t && !txt){ alert("Titel oder Inhalt eingeben"); return; }
          var n = { title: t || "Ohne Titel", text: txt, date: new Date().toLocaleString("de-DE") };
          if(editId === -1) notes.push(n);
          else notes[editId] = n;
          store.set("items", notes);
          if(HalDo.Notify) HalDo.Notify.success("Notiz gespeichert", { app: "notes" });
          build();
        });
        var cancel = container.querySelector("#nCancel");
        if(cancel) cancel.addEventListener("click", function(){ build(); });
      }

      container.querySelectorAll("[data-nedit]").forEach(function(el){
        el.addEventListener("click", function(){ build(parseInt(el.dataset.nedit)); });
      });
      container.querySelectorAll("[data-ndel]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Notiz löschen?")) return;
          notes.splice(parseInt(el.dataset.ndel), 1);
          store.set("items", notes);
          build();
        });
      });
    }

    build();
  }

  HalDoApp("notes", { name: "Notizen", icon: "📝", render: render, category: "app" });
  console.log("🦚 notes.js v300 geladen — MIT KI");
})();
