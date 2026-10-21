/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ÜBERSETZER (v400)
   18 Sprachen · KI-Übersetzung · Verlauf · TTS
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  var LANGS = {
    de: "🇩🇪 Deutsch", en: "🇬🇧 English", tr: "🇹🇷 Türkçe", ar: "🇸🇦 العربية",
    fa: "🇮🇷 فارسی", ku: "🦚 Kurdisch (Kurmanji)", ckb: "🦚 Kurdisch (Sorani)", yaz: "🦚 Ezidi",
    ru: "🇷🇺 Русский", fr: "🇫🇷 Français", es: "🇪🇸 Español", it: "🇮🇹 Italiano",
    el: "🇬🇷 Griechisch", hi: "🇮🇳 Hindi", zh: "🇨🇳 Chinesisch", ja: "🇯🇵 Japanisch", ko: "🇰🇷 Koreanisch"
  };

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "uebersetzen");

    function build(){
      var body = '';
      var src = store.get("srcLang", "de");
      var tgt = store.get("tgtLang", "ku");
      var input = store.get("input", "");
      var output = store.get("output", "");
      var history = store.get("history", []);

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "uebersetzen" ? " active" : "") + '" data-ut="uebersetzen">🌍 Übersetzen</button>'
        + '<button class="tab' + (tab === "verlauf" ? " active" : "") + '" data-ut="verlauf">📜 Verlauf</button>'
        + '</div>';

      if(tab === "uebersetzen"){
        body += '<div class="card">'
          + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:12px">'
          + '<select id="uSrc" style="padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:11px">';
        Object.keys(LANGS).forEach(k => body += '<option value="'+k+'"'+(src===k?' selected':'')+'>'+LANGS[k]+'</option>');
        body += '</select>'
          + '<button id="uSwap" style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:8px;color:var(--p1);cursor:pointer;padding:8px 10px">⇄</button>'
          + '<select id="uTgt" style="padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:11px">';
        Object.keys(LANGS).forEach(k => body += '<option value="'+k+'"'+(tgt===k?' selected':'')+'>'+LANGS[k]+'</option>');
        body += '</select></div>';

        body += '<textarea id="uInput" rows="4" placeholder="Text eingeben..." style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:8px">' + _esc(input) + '</textarea>';

        body += '<button class="btn full" id="uGo" style="background:var(--p1);color:#000">🌐 Übersetzen (KI)</button>'
          + '<div id="uStatus" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>';

        if(output){
          body += '<div style="margin-top:14px;padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;border-left:3px solid var(--p1)">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-bottom:6px">Ergebnis</div>'
            + '<div style="font-size:15px;line-height:1.5;word-break:break-word;white-space:pre-wrap">' + _esc(output) + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:10px">'
            + '<button class="btn sec" id="uCopy" style="flex:1;font-size:11px">📋 Kopieren</button>'
            + '<button class="btn sec" id="uSpeak" style="flex:1;font-size:11px">🔊 Vorlesen</button>'
            + '</div></div>';
        }
        body += '</div>';
      }

      if(tab === "verlauf"){
        body += '<div class="card"><h3>📜 Verlauf (' + history.length + ')</h3>';
        if(!history.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Übersetzungen</div>';
        else {
          history.slice().reverse().forEach(function(h, idx){
            var ri = history.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:6px;border-left:3px solid var(--p3)">'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(h.src) + ' → ' + _esc(h.tgt) + '</div>'
              + '<div style="font-size:12px;color:var(--text-dim);margin-top:4px">' + _esc(h.in) + '</div>'
              + '<div style="font-size:13px;font-weight:900;color:var(--p1);margin-top:2px">' + _esc(h.out) + '</div>'
              + '<div style="display:flex;justify-content:space-between;margin-top:6px">'
              + '<div style="font-size:9.5px;color:var(--text-mute)">' + _esc(h.date) + '</div>'
              + '<button data-hdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:11px">✕</button>'
              + '</div></div>';
          });
          body += '<button class="btn danger full" id="uClear" style="margin-top:10px">🗑️ Verlauf löschen</button>';
        }
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-ut]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.ut; store.set("tab", tab); build(); });
      });

      if(tab === "uebersetzen"){
        container.querySelector("#uInput").addEventListener("input", function(){ store.set("input", this.value); });
        container.querySelector("#uSwap").addEventListener("click", function(){
          var s = store.get("srcLang", "de"); store.set("srcLang", store.get("tgtLang", "ku")); store.set("tgtLang", s); build();
        });
        
        container.querySelector("#uGo").addEventListener("click", async function(){
          var txt = container.querySelector("#uInput").value.trim();
          if(!txt) return alert("Bitte Text eingeben!");
          var stat = container.querySelector("#uStatus");
          stat.style.display = "block"; stat.textContent = "⏳ KI übersetzt...";
          this.disabled = true;
          try {
            var langName = LANGS[container.querySelector("#uTgt").value].split(" ")[1];
            var result = await HalDo.AI.translate(txt, langName);
            store.set("output", result);
            if(store.get("history", []).length >= 0) {
                var hist = store.get("history", []);
                hist.push({ in: txt, out: result, src: LANGS[container.querySelector("#uSrc").value], tgt: LANGS[container.querySelector("#uTgt").value], date: new Date().toLocaleString("de-DE") });
                store.set("history", hist);
            }
            build();
          } catch(e) {
            stat.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });

        var cpy = container.querySelector("#uCopy");
        if(cpy) cpy.addEventListener("click", function(){ if(navigator.clipboard) navigator.clipboard.writeText(store.get("output","")); if(HalDo.Notify) HalDo.Notify.success("Kopiert!"); });
        var spk = container.querySelector("#uSpeak");
        if(spk) spk.addEventListener("click", function(){ if(HalDo.Voice) HalDo.Voice.speak(store.get("output","")); });
      }

      if(tab === "verlauf"){
        container.querySelectorAll("[data-hdel]").forEach(el => {
          el.addEventListener("click", function(){
            var hist = store.get("history", []); hist.splice(parseInt(el.dataset.hdel), 1); store.set("history", hist); build();
          });
        });
        var clr = container.querySelector("#uClear");
        if(clr) clr.addEventListener("click", function(){ if(confirm("Verlauf löschen?")) { store.set("history", []); build(); } });
      }
    }

    build();
  }

  HalDoApp("uebersetzer", { name: "Übersetzer", icon: "🌐", render: render, category: "werkzeuge" });
  console.log("🦚 uebersetzer.js v400 geladen — MIT KI");
})();
