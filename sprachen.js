/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SPRACHEN (v156)
   Sprachauswahl · Kurdisch (Kurmanci, Sorani) · Ezidi · Arabisch
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var SPRACHEN = {
    de: { name: "🇩🇪 Deutsch", flag: "🇩🇪", code: "de-DE", rtl: false },
    en: { name: "🇬🇧 English", flag: "🇬🇧", code: "en-US", rtl: false },
    ku: { name: "🦚 Kurdisch (Kurmanci)", flag: "🦚", code: "ku", rtl: false, note: "Kurmanci" },
    ckb: { name: "🦚 Kurdisch (Sorani)", flag: "🦚", code: "ckb", rtl: true, note: "Sorani" },
    ar: { name: "🇸🇦 العربية", flag: "🇸🇦", code: "ar-SA", rtl: true },
    tr: { name: "🇹🇷 Türkçe", flag: "🇹🇷", code: "tr-TR", rtl: false },
    fa: { name: "🇮🇷 فارسی", flag: "🇮🇷", code: "fa-IR", rtl: true },
    fr: { name: "🇫🇷 Français", flag: "🇫🇷", code: "fr-FR", rtl: false },
    es: { name: "🇪🇸 Español", flag: "🇪🇸", code: "es-ES", rtl: false },
    ru: { name: "🇷🇺 Русский", flag: "🇷🇺", code: "ru-RU", rtl: false }
  };

  var EZIDI_WORDS = {
    "hallo": "Silav",
    "danke": "Sipas",
    "bitte": "Ji kerema xwe",
    "ja": "Erê",
    "nein": "Na",
    "wasser": "Av",
    "brot": "Nan",
    "haus": "Mal",
    "freund": "Heval",
    "liebe": "Evîn",
    "tag": "Roj",
    "nacht": "Şev",
    "gut": "Baş",
    "wie geht es dir": "Tu çawa yî?",
    "mir geht es gut": "Ez baş im"
  };

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "auswahl");

    function build(){
      var body = "";

      if(tab === "auswahl"){
        var current = store.get("current", "de");

        body = '<div class="card">'
          + '<div style="padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:12px;margin-bottom:14px;border:1.5px solid var(--p1);text-align:center">'
          + '<div style="font-size:40px">🌍</div>'
          + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:6px">Sprache wählen</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">Aktuell: ' + _esc(SPRACHEN[current] ? SPRACHEN[current].name : "Deutsch") + '</div>'
          + '</div>';

        Object.keys(SPRACHEN).forEach(function(key){
          var s = SPRACHEN[key];
          var active = key === current;
          body += '<button data-lang="' + key + '" style="width:100%;padding:12px;background:' + (active ? "rgba(0,229,255,.12)" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (active ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;text-align:left;font-family:inherit;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
            + '<div>'
            + '<div style="font-size:13px;font-weight:900;color:' + (active ? "var(--p1)" : "var(--text)") + '">' + s.name + '</div>'
            + (s.note ? '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(s.note) + ' · ' + _esc(s.code) + '</div>' : '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(s.code) + (s.rtl ? " · RTL" : "") + '</div>')
            + '</div>'
            + (active ? '<span style="font-size:14px;color:var(--p1)">✓</span>' : '')
            + '</button>';
        });
        body += '</div>';

        body += '<div class="card" style="background:rgba(251,191,36,.08);border-left:3px solid #fbbf24">'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.6">'
          + '💡 <b>Hinweis:</b> Kurdisch (Kurmanci/Sorani) und Ezidi sind <b>nicht</b> im Browser-Spracherkennungssystem. Die UI wird übersetzt, aber Voice-Erkennung bleibt auf DE/EN/TR/AR begrenzt.'
          + '</div></div>';

      } else if(tab === "ezidi"){
        body = '<div class="card"><h3>🦚 Ezidi Wörterbuch</h3>'
          + '<div style="font-size:11.5px;color:var(--text-dim);margin-bottom:12px;line-height:1.5">'
          + 'Grundlegende Ezidi/Kurmanci-Wörter:'
          + '</div>';

        Object.keys(EZIDI_WORDS).forEach(function(de){
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div style="font-size:12px;color:var(--text-mute)">🇩🇪 ' + _esc(de) + '</div>'
            + '<div style="font-size:13px;font-weight:900;color:var(--p1)">🦚 ' + _esc(EZIDI_WORDS[de]) + '</div>'
            + '</div>';
        });
        body += '</div>';

      } else if(tab === "settings"){
        var current2 = store.get("current", "de");
        var voiceLang = HalDo.Store ? HalDo.Store.get("voiceLang", "de-DE") : "de-DE";
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Aktuelle Sprache</label>'
          + '<select id="langCurrent" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + Object.keys(SPRACHEN).map(function(k){
              return '<option value="' + k + '"' + (current2===k?" selected":"") + '>' + SPRACHEN[k].name + '</option>';
            }).join("")
          + '</select></div>'
          + '<div class="field"><label>Sprachausgabe (Voice)</label>'
          + '<select id="langVoice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<option value="de-DE"' + (voiceLang==="de-DE"?" selected":"") + '>🇩🇪 Deutsch</option>'
          + '<option value="en-US"' + (voiceLang==="en-US"?" selected":"") + '>🇬🇧 English (US)</option>'
          + '<option value="tr-TR"' + (voiceLang==="tr-TR"?" selected":"") + '>🇹🇷 Türkçe</option>'
          + '<option value="ar-SA"' + (voiceLang==="ar-SA"?" selected":"") + '>🇸🇦 العربية</option>'
          + '</select></div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-top:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.5">'
          + '🌍 <b>Sprachen:</b> ' + Object.keys(SPRACHEN).length + ' verfügbar'
          + '</div></div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="auswahl"?" active":"") + '" data-sprt="auswahl">🌍 Sprachen</button>'
        + '<button class="tab' + (tab==="ezidi"?" active":"") + '" data-sprt="ezidi">🦚 Ezidi</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-sprt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-sprt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.sprt; store.set("tab", tab); build();
        });
      });

      if(tab === "auswahl"){
        container.querySelectorAll("[data-lang]").forEach(function(el){
          el.addEventListener("click", function(){
            var key = el.dataset.lang;
            store.set("current", key);
            var s = SPRACHEN[key];
            if(window.HalDo && HalDo.Voice){
              HalDo.Voice.speak("Sprache auf " + (key === "de" ? "Deutsch" : key === "en" ? "English" : "Kurdisch") + " gesetzt");
            }
            if(HalDo.Notify) HalDo.Notify.success("Sprache: " + s.name, { app: "sprachen" });
            build();
          });
        });
      }

      if(tab === "settings"){
        var cur = container.querySelector("#langCurrent");
        if(cur) cur.addEventListener("change", function(){
          store.set("current", this.value);
          if(HalDo.Notify) HalDo.Notify.success("Sprache gespeichert", { app: "sprachen" });
        });
        var vc = container.querySelector("#langVoice");
        if(vc) vc.addEventListener("change", function(){
          if(HalDo.Store) HalDo.Store.set("voiceLang", this.value);
          if(HalDo.Notify) HalDo.Notify.success("Voice-Sprache: " + this.value, { app: "sprachen" });
        });
      }
    }

    build();
  }

  HalDoApp("sprachen", { name: "Sprachen", icon: "🌍", render: render, category: "werkzeuge" });
  console.log("🦚 sprachen.js v156 geladen");
})();
