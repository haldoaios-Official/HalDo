/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ÜBERSETZER (v152)
   Offline-Wörterbuch · Verlauf · Favoriten · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* Mini-Wörterbuch (Offline-Fallback) */
  var DICT = {
    "hallo": { en: "hello", tr: "merhaba", ar: "مرحبا", fr: "bonjour" },
    "danke": { en: "thank you", tr: "teşekkürler", ar: "شكرا", fr: "merci" },
    "bitte": { en: "please", tr: "lütfen", ar: "من فضلك", fr: "s'il vous plaît" },
    "ja": { en: "yes", tr: "evet", ar: "نعم", fr: "oui" },
    "nein": { en: "no", tr: "hayır", ar: "لا", fr: "non" },
    "wasser": { en: "water", tr: "su", ar: "ماء", fr: "eau" },
    "brot": { en: "bread", tr: "ekmek", ar: "خبز", fr: "pain" },
    "haus": { en: "house", tr: "ev", ar: "منزل", fr: "maison" },
    "auto": { en: "car", tr: "araba", ar: "سيارة", fr: "voiture" },
    "buch": { en: "book", tr: "kitap", ar: "كتاب", fr: "livre" },
    "freund": { en: "friend", tr: "arkadaş", ar: "صديق", fr: "ami" },
    "liebe": { en: "love", tr: "aşk", ar: "حب", fr: "amour" },
    "zeit": { en: "time", tr: "zaman", ar: "وقت", fr: "temps" },
    "tag": { en: "day", tr: "gün", ar: "يوم", fr: "jour" },
    "nacht": { en: "night", tr: "gece", ar: "ليل", fr: "nuit" },
    "gut": { en: "good", tr: "iyi", ar: "جيد", fr: "bon" },
    "schlecht": { en: "bad", tr: "kötü", ar: "سيء", fr: "mauvais" },
    "essen": { en: "food", tr: "yemek", ar: "طعام", fr: "nourriture" },
    "trinken": { en: "drink", tr: "içmek", ar: "شرب", fr: "boire" },
    "gehen": { en: "go", tr: "gitmek", ar: "يذهب", fr: "aller" }
  };

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "uebersetzen");

    var LANGS = {
      de: "🇩🇪 Deutsch", en: "🇬🇧 English", tr: "🇹🇷 Türkçe",
      ar: "🇸🇦 العربية", fr: "🇫🇷 Français", es: "🇪🇸 Español", it: "🇮🇹 Italiano"
    };

    function build(){
      var body = "";

      if(tab === "uebersetzen"){
        var srcLang = store.get("srcLang", "de");
        var tgtLang = store.get("tgtLang", "en");
        var input = store.get("input", "");
        var output = store.get("output", "");

        body = '<div class="card">'
          + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:12px">'
          + '<select id="uSrc" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px">';
        Object.keys(LANGS).forEach(function(k){
          body += '<option value="' + k + '"' + (srcLang===k?" selected":"") + '>' + LANGS[k] + '</option>';
        });
        body += '</select>'
          + '<button id="uSwap" style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:10px;color:var(--p1);cursor:pointer;padding:10px 12px;font-size:14px">⇄</button>'
          + '<select id="uTgt" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px">';
        Object.keys(LANGS).forEach(function(k){
          body += '<option value="' + k + '"' + (tgtLang===k?" selected":"") + '>' + LANGS[k] + '</option>';
        });
        body += '</select></div>';

        body += '<textarea id="uInput" placeholder="Text eingeben..." rows="4" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical;margin-bottom:8px">' + _esc(input) + '</textarea>';

        body += '<div style="display:flex;gap:6px;margin-bottom:12px">'
          + '<button class="btn" id="uTranslate" style="flex:1">🌐 Übersetzen</button>'
          + '<button class="btn sec" id="uClear">✕</button>'
          + '</div>';

        if(output){
          body += '<div style="padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;border-left:3px solid var(--p1)">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-bottom:6px">Ergebnis</div>'
            + '<div style="font-size:15px;line-height:1.5;word-break:break-word">' + _esc(output) + '</div>'
            + '<button class="btn sec full" id="uCopy" style="margin-top:10px;font-size:11px">📋 Kopieren</button>'
            + '</div>';
        }
        body += '</div>';

        body += '<div class="card"><h3>💡 Info</h3>'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.6">'
          + 'Dieser Übersetzer funktioniert <b>offline</b> mit einem kleinen Wörterbuch. Für komplexe Sätze: Internet-API später möglich.'
          + '</div></div>';

      } else if(tab === "verlauf"){
        var hist = store.get("history", []);
        body = '<div class="card"><h3>📜 Verlauf (' + hist.length + ')</h3>';
        if(!hist.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Kein Verlauf</div>';
        } else {
          hist.slice().reverse().forEach(function(h, idx){
            var ri = hist.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px">'
              + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(h.src) + ' → ' + _esc(h.tgt) + '</div>'
              + '<div style="font-size:12px">' + _esc(h.in) + '</div>'
              + '<div style="font-size:13px;font-weight:900;color:var(--p1);margin-top:2px">' + _esc(h.out) + '</div>'
              + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">'
              + '<div style="font-size:9.5px;color:var(--text-mute)">' + _esc(h.date) + '</div>'
              + '<button data-hdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:11px">✕</button>'
              + '</div></div>';
          });
          body += '<button class="btn danger full" id="clearHist" style="margin-top:10px">🗑️ Löschen</button>';
        }
        body += '</div>';

      } else if(tab === "settings"){
        var autoCopy = store.get("autoCopy", false);
        var autoSave = store.get("autoSave", true);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + toggleRow("autoCopy", "📋 Auto-Kopieren", autoCopy)
          + toggleRow("autoSave", "💾 Verlauf speichern", autoSave)
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="uebersetzen"?" active":"") + '" data-ut="uebersetzen">🌐 Übersetzen</button>'
        + '<button class="tab' + (tab==="verlauf"?" active":"") + '" data-ut="verlauf">📜 Verlauf</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-ut="settings">⚙️ Einstellungen</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-ut]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.ut;
          store.set("tab", tab);
          build();
        });
      });

      if(tab === "uebersetzen"){
        container.querySelector("#uSrc").addEventListener("change", function(){ store.set("srcLang", this.value); });
        container.querySelector("#uTgt").addEventListener("change", function(){ store.set("tgtLang", this.value); });
        container.querySelector("#uSwap").addEventListener("click", function(){
          var s = store.get("srcLang", "de");
          store.set("srcLang", store.get("tgtLang", "en"));
          store.set("tgtLang", s);
          build();
        });
        container.querySelector("#uInput").addEventListener("input", function(){
          store.set("input", this.value);
        });
        container.querySelector("#uTranslate").addEventListener("click", doTranslate);
        container.querySelector("#uClear").addEventListener("click", function(){
          store.set("input", ""); store.set("output", "");
          build();
        });
        var cpy = container.querySelector("#uCopy");
        if(cpy) cpy.addEventListener("click", function(){
          if(navigator.clipboard) navigator.clipboard.writeText(store.get("output", ""));
          if(HalDo.Notify) HalDo.Notify.success("Kopiert!", { app: "uebersetzer" });
        });
      }

      if(tab === "verlauf"){
        container.querySelectorAll("[data-hdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var h = store.get("history", []);
            h.splice(parseInt(el.dataset.hdel), 1);
            store.set("history", h);
            build();
          });
        });
        var clr = container.querySelector("#clearHist");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Verlauf löschen?")) return;
          store.set("history", []);
          build();
        });
      }

      if(tab === "settings"){
        ["autoCopy", "autoSave"].forEach(function(key){
          var el = container.querySelector('[data-toggle="' + key + '"]');
          if(el) el.addEventListener("click", function(){
            store.set(key, !store.get(key, true));
            build();
          });
        });
      }
    }

    function doTranslate(){
      var input = store.get("input", "").trim();
      if(!input) return;
      var src = store.get("srcLang", "de");
      var tgt = store.get("tgtLang", "en");

      var out = "";
      if(src === "de" && DICT[input.toLowerCase()]){
        out = DICT[input.toLowerCase()][tgt] || "—";
      } else {
        /* Suche in beide Richtungen */
        var found = null;
        Object.keys(DICT).forEach(function(k){
          if(DICT[k][tgt] && DICT[k][tgt].toLowerCase() === input.toLowerCase()) found = k;
        });
        if(found) out = found;
        else out = "⚠️ Nicht im Wörterbuch. Nur einzelne Wörter: " + Object.keys(DICT).slice(0, 8).join(", ") + "...";
      }

      store.set("output", out);

      if(store.get("autoSave", true) && !out.startsWith("⚠️")){
        var hist = store.get("history", []);
        hist.push({ in: input, out: out, src: src, tgt: tgt, date: new Date().toLocaleString("de-DE") });
        store.set("history", hist);
      }

      if(store.get("autoCopy", false) && navigator.clipboard) navigator.clipboard.writeText(out);

      build();
    }

    function toggleRow(key, label, on){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:12.5px;font-weight:800">' + _esc(label) + '</div>'
        + '<button data-toggle="' + key + '" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (on ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (on ? "#000" : "var(--text-dim)") + '">' + (on ? "AN" : "AUS") + '</button>'
        + '</div>';
    }

    build();
  }

  HalDoApp("uebersetzer", { name: "Übersetzer", icon: "🌐", render: render, category: "werkzeuge" });
  console.log("🦚 uebersetzer.js geladen");
})();
