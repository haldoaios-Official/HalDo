/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ÜBERSETZER (v300) · MIT LOKALER KI
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
    var tab = store.get("tab", "uebersetzen");

    var LANGS = {
      de: "🇩🇪 Deutsch", en: "🇬🇧 English", tr: "🇹🇷 Türkçe",
      ar: "🇸🇦 العربية", fr: "🇫🇷 Français", es: "🇪🇸 Español"
    };

    function build(){
      var body = '';

      if(tab === "uebersetzen"){
        var srcLang = store.get("srcLang", "de");
        var tgtLang = store.get("tgtLang", "en");
        var input = store.get("input", "");
        var output = store.get("output", "");

        body = '<div class="card">'
          + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:12px">'
          + '<select id="uSrc" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px">';
        Object.keys(LANGS).forEach(function(k){ body += '<option value="' + k + '"' + (srcLang===k?" selected":"") + '>' + LANGS[k] + '</option>'; });
        body += '</select>'
          + '<button id="uSwap" style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:10px;color:var(--p1);cursor:pointer;padding:10px 12px;font-size:14px">⇄</button>'
          + '<select id="uTgt" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px">';
        Object.keys(LANGS).forEach(function(k){ body += '<option value="' + k + '"' + (tgtLang===k?" selected":"") + '>' + LANGS[k] + '</option>'; });
        body += '</select></div>';

        body += '<textarea id="uInput" placeholder="Text eingeben..." rows="4" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:8px">' + _esc(input) + '</textarea>';

        body += '<div style="display:flex;gap:6px;margin-bottom:12px">'
          + '<button class="btn" id="uTranslate" style="flex:1">🌐 Mit KI Übersetzen</button>'
          + '<button class="btn sec" id="uClear">✕</button>'
          + '</div>'
          + '<div id="u_status" style="display:none;margin-bottom:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>';

        if(output){
          body += '<div style="padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;border-left:3px solid var(--p1)">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-bottom:6px">Übersetzung</div>'
            + '<div style="font-size:15px;line-height:1.5;word-break:break-word;white-space:pre-wrap">' + _esc(output) + '</div>'
            + '</div>';
        }
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab active" data-ut="uebersetzen">🌐 Übersetzen</button>'
        + '</div>' + body;

      if(tab === "uebersetzen"){
        var status = container.querySelector("#u_status");

        container.querySelector("#uTranslate").addEventListener("click", async function(){
          var txt = container.querySelector("#uInput").value.trim();
          if(!txt) return;
          
          var src = container.querySelector("#uSrc").value;
          var tgt = container.querySelector("#uTgt").value;
          
          status.style.display = "block";
          status.textContent = "⏳ KI übersetzt... (10-30s)";
          this.disabled = true;

          try {
            if(!HalDo.AI) throw new Error("KI nicht geladen");
            var langMap = { de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", fr: "Französisch", es: "Spanisch" };
            var result = await HalDo.AI.translate(txt, langMap[tgt] || "Englisch");
            
            store.set("output", result);
            status.style.display = "none";
            build();
          } catch(e) {
            status.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });

        container.querySelector("#uSwap").addEventListener("click", function(){
          var s = store.get("srcLang", "de");
          store.set("srcLang", store.get("tgtLang", "en"));
          store.set("tgtLang", s);
          build();
        });
        container.querySelector("#uClear").addEventListener("click", function(){
          store.set("input", ""); store.set("output", "");
          build();
        });
      }
    }

    build();
  }

  HalDoApp("uebersetzer", { name: "Übersetzer", icon: "🌐", render: render, category: "werkzeuge" });
  console.log("🦚 uebersetzer.js v300 geladen — MIT KI");
})();
