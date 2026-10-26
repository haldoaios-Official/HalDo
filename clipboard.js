/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — CLIPBOARD (v1.0)
   Zwischenablage mit History · Suche · Pin · Copy
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", query:"" };

    function getItems(){ return store.get("items", []); }
    function saveItems(i){ store.set("items", i); }

    function screenList(){
      var items = getItems();
      var filtered = items.filter(function(it){
        if(!view.query) return true;
        return (it.text||"").toLowerCase().indexOf(view.query.toLowerCase()) >= 0 || (it.label||"").toLowerCase().indexOf(view.query.toLowerCase()) >= 0;
      });
      filtered.sort(function(a,b){
        if(a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.created||0) - (a.created||0);
      });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1">📋 Zwischenablage</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+items.length+' Einträge · '+items.filter(function(x){return x.pinned;}).length+' angepinnt</div></div>'
        + '<button class="btn" id="cpAdd" style="padding:10px 14px">➕</button>'
        + '</div>'
        + '<input id="cpSearch" placeholder="🔍 Suchen..." value="'+_esc(view.query)+'" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + '</div>';

      if(!filtered.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📋</div><div style="font-size:13px;color:var(--text-mute);margin-top:10px">'+(items.length?'Nichts gefunden':'Noch keine Einträge')+'</div></div>';
      } else {
        html += '<div class="card">';
        filtered.forEach(function(it){
          var preview = (it.text||"").substring(0, 150);
          if((it.text||"").length > 150) preview += "...";
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;border-left:3px solid '+(it.pinned?'#ffd54f':'#4dd0e1')+'">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">'
            + (it.label ? '<div style="font-size:11px;font-weight:900;color:#ffd54f">'+_esc(it.label)+'</div>' : '<div></div>')
            + '<div style="display:flex;gap:3px">'
            + '<button data-pin="'+it.id+'" style="background:'+(it.pinned?'rgba(255,213,79,.2)':'transparent')+';border:none;color:'+(it.pinned?'#ffd54f':'var(--text-mute)')+';padding:4px 8px;border-radius:6px;font-size:12px;cursor:pointer">'+(it.pinned?'📌':'📍')+'</button>'
            + '<button data-copy="'+it.id+'" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer">📋</button>'
            + '<button data-del="'+it.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;padding:3px 8px;border-radius:6px;font-size:10px;cursor:pointer">✕</button>'
            + '</div></div>'
            + '<div style="font-size:11.5px;color:var(--text);white-space:pre-wrap;word-wrap:break-word;font-family:monospace;line-height:1.4;max-height:100px;overflow:hidden">'+_esc(preview)+'</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:6px">'+new Date(it.created).toLocaleString("de-DE")+'</div>'
            + '</div>';
        });
        html += '</div>';
      }
      container.innerHTML = html;
      bind();
    }

    function bind(){
      var s = container.querySelector("#cpSearch");
      s.addEventListener("input", function(){ view.query = s.value; screenList(); setTimeout(function(){ var n = container.querySelector("#cpSearch"); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); } }, 0); });
      container.querySelector("#cpAdd").addEventListener("click", function(){ screenAdd(); });
      container.querySelectorAll("[data-pin]").forEach(function(el){
        el.addEventListener("click", function(){
          var items = getItems(); var it = items.find(function(x){return x.id===el.dataset.pin;});
          if(it){ it.pinned = !it.pinned; saveItems(items); screenList(); }
        });
      });
      container.querySelectorAll("[data-copy]").forEach(function(el){
        el.addEventListener("click", function(){
          var items = getItems(); var it = items.find(function(x){return x.id===el.dataset.copy;});
          if(!it) return;
          copyToClip(it.text);
        });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Eintrag löschen?")) return;
          saveItems(getItems().filter(function(x){return x.id!==el.dataset.del;})); screenList();
        });
      });
    }

    function copyToClip(text){
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          if(HalDo.Notify) HalDo.Notify.success("Kopiert");
        }).catch(function(){ fallbackCopy(text); });
      } else fallbackCopy(text);
    }
    function fallbackCopy(text){
      var t = document.createElement("textarea");
      t.value = text; t.style.position = "fixed"; t.style.left = "-9999px";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); if(HalDo.Notify) HalDo.Notify.success("Kopiert"); } catch(e){}
      document.body.removeChild(t);
    }

    function screenAdd(){
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>Neuer Eintrag</h3>'
        + '<div class="field"><label>Bezeichnung (optional)</label><input id="cpLabel" placeholder="z.B. IBAN" maxlength="40"></div>'
        + '<div class="field"><label>Inhalt</label><textarea id="cpText" rows="6" placeholder="Text einfügen..." style="resize:vertical;font-family:monospace;font-size:12px"></textarea></div>'
        + '<button class="btn sec full" id="cpFromClip" style="margin-bottom:6px">📋 Aus Zwischenablage einfügen</button>'
        + '<button class="btn full" id="cpSave">💾 Speichern</button></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ screenList(); });
      container.querySelector("#cpFromClip").addEventListener("click", function(){
        if(navigator.clipboard && navigator.clipboard.readText){
          navigator.clipboard.readText().then(function(t){
            container.querySelector("#cpText").value = t;
            if(HalDo.Notify) HalDo.Notify.success("Eingefügt");
          }).catch(function(){ alert("Zugriff verweigert. Bitte manuell einfügen."); });
        } else alert("Nicht unterstützt in diesem Browser");
      });
      container.querySelector("#cpSave").addEventListener("click", function(){
        var text = container.querySelector("#cpText").value.trim();
        if(!text){ alert("Inhalt fehlt"); return; }
        var items = getItems();
        items.push({ id:"c"+Date.now(), label:container.querySelector("#cpLabel").value.trim(), text:text, pinned:false, created:Date.now() });
        saveItems(items); screenList();
        if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
      });
    }

    screenList();
  }

  HalDoApp("clipboard", { name: "Zwischenablage", icon: "📋", render: render, category: "produktivitaet" });
  console.log("🦚 clipboard.js v1.0 geladen");
})();
