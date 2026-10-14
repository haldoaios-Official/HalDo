/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO PROMPT APP (v150)
   Prompt-Bibliothek · Kategorien · Variablen · Favoriten
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var BUILTIN_PROMPTS = [
    {
      id: "b1",
      cat: "✍️ Schreiben",
      title: "Text verbessern",
      prompt: "Verbessere den folgenden Text stilistisch, grammatikalisch und in der Klarheit. Behalte die Bedeutung bei:\n\n{{text}}",
      vars: ["text"]
    },
    {
      id: "b2",
      cat: "✍️ Schreiben",
      title: "Zusammenfassung",
      prompt: "Fasse den folgenden Text in 3-5 Sätzen zusammen. Wichtigste Punkte zuerst:\n\n{{text}}",
      vars: ["text"]
    },
    {
      id: "b3",
      cat: "✍️ Schreiben",
      title: "E-Mail professionell",
      prompt: "Schreibe eine professionelle E-Mail zum Thema '{{thema}}'. Ton: {{ton}} (z.B. freundlich, formell). Empfänger: {{empfänger}}",
      vars: ["thema", "ton", "empfänger"]
    },
    {
      id: "b4",
      cat: "✍️ Schreiben",
      title: "Story-Idee",
      prompt: "Erfinde eine kurze Geschichte zum Thema '{{thema}}' im Genre '{{genre}}'. Hauptfigur: {{figur}}.",
      vars: ["thema", "genre", "figur"]
    },
    {
      id: "b5",
      cat: "💻 Programmieren",
      title: "Code erklären",
      prompt: "Erkläre mir den folgenden Code Schritt für Schritt, in einfachen Worten, mit Beispielen:\n\n```\n{{code}}\n```",
      vars: ["code"]
    },
    {
      id: "b6",
      cat: "💻 Programmieren",
      title: "Bug finden",
      prompt: "Analysiere diesen Code und finde mögliche Fehler oder Bugs. Erkläre, warum und wie man sie behebt:\n\n```\n{{code}}\n```",
      vars: ["code"]
    },
    {
      id: "b7",
      cat: "💻 Programmieren",
      title: "Code schreiben",
      prompt: "Schreibe {{sprache}} Code für folgende Aufgabe: {{aufgabe}}\n\nBeachte: sauber, kommentiert, effizient.",
      vars: ["sprache", "aufgabe"]
    },
    {
      id: "b8",
      cat: "💻 Programmieren",
      title: "Regex bauen",
      prompt: "Erstelle einen Regex für folgendes Muster: {{muster}}\n\nSprache: {{sprache}}. Erkläre den Regex Schritt für Schritt.",
      vars: ["muster", "sprache"]
    },
    {
      id: "b9",
      cat: "🌐 Übersetzen",
      title: "Übersetzen",
      prompt: "Übersetze den folgenden Text von {{von}} nach {{nach}}. Behalte Ton und Nuancen bei:\n\n{{text}}",
      vars: ["von", "nach", "text"]
    },
    {
      id: "b10",
      cat: "🌐 Übersetzen",
      title: "Ezidi lernen",
      prompt: "Erkläre mir die folgenden Ezidi-Wörter auf Deutsch, mit Lautschrift und Beispielsatz:\n\n{{wörter}}",
      vars: ["wörter"]
    },
    {
      id: "b11",
      cat: "🎨 Kreativ",
      title: "Bild beschreiben",
      prompt: "Beschreibe das folgende Bild so detailliert, dass es eine KI zeichnen könnte. Stil: {{stil}}:\n\n{{beschreibung}}",
      vars: ["stil", "beschreibung"]
    },
    {
      id: "b12",
      cat: "🎨 Kreativ",
      title: "Namensgenerator",
      prompt: "Erfinde 10 kreative Namen für {{thema}}. Stil: {{stil}}. Mit kurzer Bedeutung.",
      vars: ["thema", "stil"]
    },
    {
      id: "b13",
      cat: "🎨 Kreativ",
      title: "Gedicht schreiben",
      prompt: "Schreibe ein kurzes Gedicht über {{thema}}. Form: {{form}} (z.B. Haiku, Reim, frei).",
      vars: ["thema", "form"]
    },
    {
      id: "b14",
      cat: "📊 Analyse",
      title: "Pro/Contra",
      prompt: "Liste Pro und Contra zum Thema '{{thema}}' auf. Je 5 Punkte, kurz und klar.",
      vars: ["thema"]
    },
    {
      id: "b15",
      cat: "📊 Analyse",
      title: "Daten analysieren",
      prompt: "Analysiere die folgenden Daten und nenne Trends, Muster und Auffälligkeiten:\n\n{{daten}}",
      vars: ["daten"]
    },
    {
      id: "b16",
      cat: "📊 Analyse",
      title: "Zusammenfassung wissenschaftlich",
      prompt: "Fasse die wichtigsten Erkenntnisse zum Thema '{{thema}}' wissenschaftlich zusammen. 3-5 Kernaussagen.",
      vars: ["thema"]
    },
    {
      id: "b17",
      cat: "🧠 Lernen",
      title: "Thema erklären",
      prompt: "Erkläre mir das Thema '{{thema}}' so, als wäre ich {{alter}} Jahre alt. Mit Beispielen aus dem Alltag.",
      vars: ["thema", "alter"]
    },
    {
      id: "b18",
      cat: "🧠 Lernen",
      title: "Fragen generieren",
      prompt: "Erstelle 10 Lernfragen zum Thema '{{thema}}', von leicht bis schwer, mit Antworten.",
      vars: ["thema"]
    },
    {
      id: "b19",
      cat: "🧠 Lernen",
      title: "Karteikarten",
      prompt: "Erstelle 15 Karteikarten zum Thema '{{thema}}'. Format: Vorderseite | Rückseite",
      vars: ["thema"]
    },
    {
      id: "b20",
      cat: "🦚 Ezidi",
      title: "Ezidi-Geschichte erzählen",
      prompt: "Erzähle mir die Geschichte von {{thema}} im Kontext der Eziden und Mesopotamiens. Ausführlich, historisch korrekt.",
      vars: ["thema"]
    },
    {
      id: "b21",
      cat: "🦚 Ezidi",
      title: "Qewl interpretieren",
      prompt: "Interpretiere den folgenden Qewl / Text aus der ezidischen Tradition:\n\n{{text}}\n\nErkläre Bedeutung, Kontext und Symbolik.",
      vars: ["text"]
    },
    {
      id: "b22",
      cat: "🦚 Ezidi",
      title: "Mushaf Reş verstehen",
      prompt: "Erkläre mir die folgende Passage aus Mushaf Reş in einfachen Worten:\n\n{{passage}}",
      vars: ["passage"]
    },
    {
      id: "b23",
      cat: "💼 Arbeit",
      title: "Meeting-Notizen strukturieren",
      prompt: "Strukturiere die folgenden Meeting-Notizen nach Themen, Aufgaben und Verantwortlichen:\n\n{{notizen}}",
      vars: ["notizen"]
    },
    {
      id: "b24",
      cat: "💼 Arbeit",
      title: "Präsentation erstellen",
      prompt: "Erstelle eine Gliederung für eine Präsentation über '{{thema}}'. Zielgruppe: {{zielgruppe}}. Dauer: {{dauer}} Minuten.",
      vars: ["thema", "zielgruppe", "dauer"]
    },
    {
      id: "b25",
      cat: "💼 Arbeit",
      title: "Brainstorming",
      prompt: "Brainstorme 20 Ideen zum Thema '{{thema}}'. Sei kreativ und unkonventionell.",
      vars: ["thema"]
    }
  ];

  var CATEGORIES = [
    "✍️ Schreiben", "💻 Programmieren", "🌐 Übersetzen",
    "🎨 Kreativ", "📊 Analyse", "🧠 Lernen", "🦚 Ezidi", "💼 Arbeit", "⭐ Favoriten", "📝 Eigene"
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var custom = store.get("custom", []);
    var favs = store.get("favs", []);
    var currentCat = store.get("cat", "alle");
    var searchQ = "";
    var _editing = null;

    function allPrompts(){
      return BUILTIN_PROMPTS.concat(custom);
    }

    function build(){
      var body = "";

      /* Kategorien-Tabs */
      var cats = ["alle"].concat(CATEGORIES);
      body += '<div class="tabs" style="flex-wrap:nowrap;overflow-x:auto">';
      body += '<button class="tab' + (currentCat === "alle" ? " active" : "") + '" data-pcat="alle">🔍 Alle</button>';
      CATEGORIES.forEach(function(c){
        body += '<button class="tab' + (currentCat === c ? " active" : "") + '" data-pcat="' + _esc(c) + '">' + c + '</button>';
      });
      body += '</div>';

      /* Suche */
      body += '<div class="card"><input type="text" id="pSearch" placeholder="🔍 Prompts durchsuchen…" value="' + _esc(searchQ) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>';

      /* Prompts filtern */
      var list = allPrompts();
      if(currentCat === "⭐ Favoriten"){
        list = list.filter(function(p){ return favs.indexOf(p.id) >= 0; });
      } else if(currentCat === "📝 Eigene"){
        list = list.filter(function(p){ return p.id.indexOf("c") === 0; });
      } else if(currentCat !== "alle"){
        list = list.filter(function(p){ return p.cat === currentCat; });
      }
      if(searchQ){
        var q = searchQ.toLowerCase();
        list = list.filter(function(p){
          return p.title.toLowerCase().indexOf(q) >= 0 ||
                 p.prompt.toLowerCase().indexOf(q) >= 0 ||
                 p.cat.toLowerCase().indexOf(q) >= 0;
        });
      }

      /* Sortierung: Favoriten zuerst */
      list.sort(function(a, b){
        var aF = favs.indexOf(a.id) >= 0 ? 0 : 1;
        var bF = favs.indexOf(b.id) >= 0 ? 0 : 1;
        return aF - bF;
      });

      /* Info */
      body += '<div style="font-size:10.5px;color:var(--text-mute);text-align:center;padding:6px">' + list.length + ' Prompts' + (searchQ ? ' (Suche: "' + _esc(searchQ) + '")' : '') + '</div>';

      /* Prompt-Liste */
      if(!list.length){
        body += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:50px">📭</div><div style="color:var(--text-mute);margin-top:10px">Keine Prompts gefunden</div></div>';
      } else {
        list.forEach(function(p){
          var isFav = favs.indexOf(p.id) >= 0;
          var isCustom = p.id.indexOf("c") === 0;
          body += '<div class="card" style="border-left:3px solid var(--p1);padding:14px">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px">' + _esc(p.cat) + '</div>'
            + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:2px">' + _esc(p.title) + '</div>'
            + '</div>'
            + '<button data-pfav="' + p.id + '" style="background:transparent;border:none;font-size:20px;cursor:pointer;padding:0">' + (isFav ? "⭐" : "☆") + '</button>'
            + '</div>'
            + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.55;white-space:pre-wrap;max-height:100px;overflow:hidden;position:relative">' + _esc(p.prompt) + '</div>'
            + (p.vars && p.vars.length ? '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">' + p.vars.map(function(v){ return '<span style="padding:2px 7px;background:rgba(180,120,255,.15);border:1px solid rgba(180,120,255,.3);border-radius:6px;font-size:9.5px;color:var(--p3);font-family:ui-monospace">{{' + _esc(v) + '}}</span>'; }).join("") + '</div>' : '')
            + '<div style="display:flex;gap:6px;margin-top:10px">'
            + '<button class="btn sec" data-puse="' + p.id + '" style="flex:1;padding:8px;font-size:11px">▶ Benutzen</button>'
            + '<button class="btn sec" data-pcopy="' + p.id + '" style="padding:8px 12px;font-size:11px" title="Kopieren">📋</button>'
            + (isCustom ? '<button class="btn danger" data-pdel="' + p.id + '" style="padding:8px 12px;font-size:11px" title="Löschen">✕</button>' : '')
            + '</div>'
            + '</div>';
        });
      }

      /* Neuer Prompt Button */
      body += '<div style="margin-top:14px">'
        + '<button class="btn full" id="pNew" style="padding:14px">➕ Neuen Prompt erstellen</button>'
        + '</div>';

      /* Editor */
      body += '<div id="pEditor" style="display:none">';

      container.innerHTML = body;

      /* Events */
      container.querySelectorAll("[data-pcat]").forEach(function(el){
        el.addEventListener("click", function(){
          currentCat = el.dataset.pcat;
          store.set("cat", currentCat);
          build();
        });
      });

      var s = container.querySelector("#pSearch");
      s.addEventListener("input", function(){
        searchQ = this.value;
        build();
        setTimeout(function(){
          var ns = container.querySelector("#pSearch");
          if(ns){ ns.focus(); ns.setSelectionRange(searchQ.length, searchQ.length); }
        }, 0);
      });

      container.querySelectorAll("[data-pfav]").forEach(function(el){
        el.addEventListener("click", function(){
          var id = el.dataset.pfav;
          var i = favs.indexOf(id);
          if(i >= 0) favs.splice(i, 1); else favs.push(id);
          store.set("favs", favs);
          build();
        });
      });

      container.querySelectorAll("[data-puse]").forEach(function(el){
        el.addEventListener("click", function(){
          var p = allPrompts().find(function(x){ return x.id === el.dataset.puse; });
          if(p) usePrompt(p);
        });
      });

      container.querySelectorAll("[data-pcopy]").forEach(function(el){
        el.addEventListener("click", function(){
          var p = allPrompts().find(function(x){ return x.id === el.dataset.pcopy; });
          if(!p) return;
          if(navigator.clipboard){
            navigator.clipboard.writeText(p.prompt).then(function(){
              _toast("📋 Kopiert!", "ok");
            }).catch(function(){
              _fallbackCopy(p.prompt);
            });
          } else {
            _fallbackCopy(p.prompt);
          }
        });
      });

      container.querySelectorAll("[data-pdel]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Prompt löschen?")) return;
          var id = el.dataset.pdel;
          custom = custom.filter(function(x){ return x.id !== id; });
          store.set("custom", custom);
          build();
        });
      });

      container.querySelector("#pNew").addEventListener("click", function(){
        showEditor(null);
      });
    }

    /* Prompt benutzen (Variablen ausfüllen) */
    function usePrompt(p){
      if(p.vars && p.vars.length){
        showVariableDialog(p);
      } else {
        sendToAI(p.prompt);
      }
    }

    function showVariableDialog(p){
      var html = '<div class="card"><h3>🔧 Variablen ausfüllen</h3>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:12px">' + _esc(p.title) + '</div>';
      p.vars.forEach(function(v){
        html += '<div class="field"><label>' + _esc(v) + '</label><input type="text" data-var="' + _esc(v) + '" placeholder="Wert für ' + _esc(v) + '"></div>';
      });
      html += '<div style="display:flex;gap:8px;margin-top:12px">'
        + '<button class="btn" id="varSend" style="flex:1">▶ An AI senden</button>'
        + '<button class="btn sec" id="varCancel" style="flex:1">Abbrechen</button>'
        + '</div></div>';

      var modal = document.createElement("div");
      modal.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(2,4,10,.9);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px)";
      modal.innerHTML = '<div style="width:100%;max-width:500px">' + html + '</div>';
      document.body.appendChild(modal);

      modal.querySelector("#varSend").addEventListener("click", function(){
        var filled = p.prompt;
        modal.querySelectorAll("[data-var]").forEach(function(inp){
          var val = inp.value || "[" + inp.dataset.var + "]";
          filled = filled.split("{{" + inp.dataset.var + "}}").join(val);
        });
        document.body.removeChild(modal);
        sendToAI(filled);
      });
      modal.querySelector("#varCancel").addEventListener("click", function(){
        document.body.removeChild(modal);
      });
    }

    /* Prompt an AI senden */
    function sendToAI(prompt){
      if(!window.HalDo.AI){
        _toast("❌ AI nicht verfügbar", "err");
        return;
      }
      _toast("⏳ Sende an HalDo AI…", "ok");
      window.HalDo.AI.chat(prompt).then(function(answer){
        /* Ergebnis-Modal */
        var modal = document.createElement("div");
        modal.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(2,4,10,.9);display:flex;align-items:flex-start;justify-content:center;padding:20px;padding-top:60px;backdrop-filter:blur(8px);overflow-y:auto";
        modal.innerHTML = '<div style="width:100%;max-width:600px;background:var(--bg-card);border:1.5px solid var(--p1);border-radius:18px;padding:18px;max-height:80vh;overflow-y:auto">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
          + '<h3 style="color:var(--p1);margin:0;font-size:14px">🦚 HalDo AI Antwort</h3>'
          + '<button id="aiResClose" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.5);color:#ff8080;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:14px">✕</button>'
          + '</div>'
          + '<div style="font-size:13px;line-height:1.7;white-space:pre-wrap;color:var(--text)">' + _esc(answer) + '</div>'
          + '<div style="display:flex;gap:8px;margin-top:14px">'
          + '<button id="aiResSpeak" class="btn sec" style="flex:1;padding:10px">🔊 Vorlesen</button>'
          + '<button id="aiResCopy" class="btn" style="flex:1;padding:10px">📋 Kopieren</button>'
          + '</div>'
          + '</div>';
        document.body.appendChild(modal);
        modal.querySelector("#aiResClose").addEventListener("click", function(){ document.body.removeChild(modal); });
        modal.querySelector("#aiResSpeak").addEventListener("click", function(){
          if(window.HalDo.Voice) HalDo.Voice.speak(answer);
        });
        modal.querySelector("#aiResCopy").addEventListener("click", function(){
          if(navigator.clipboard){
            navigator.clipboard.writeText(answer).then(function(){ _toast("📋 Kopiert!", "ok"); });
          }
        });
      }).catch(function(e){
        _toast("❌ " + e.message, "err");
      });
    }

    /* Editor zum Erstellen */
    function showEditor(existing){
      var modal = document.createElement("div");
      modal.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(2,4,10,.9);display:flex;align-items:flex-start;justify-content:center;padding:20px;padding-top:60px;backdrop-filter:blur(8px);overflow-y:auto";

      var cats = CATEGORIES.filter(function(c){ return c !== "⭐ Favoriten" && c !== "📝 Eigene" && c !== "alle"; });
      var catsHtml = cats.map(function(c){
        return '<option>' + c + '</option>';
      }).join("");

      modal.innerHTML = '<div style="width:100%;max-width:500px;background:var(--bg-card);border:1.5px solid var(--p1);border-radius:18px;padding:18px">'
        + '<h3 style="color:var(--p1);margin:0 0 14px 0;font-size:14px">➕ Neuer Prompt</h3>'
        + '<div class="field"><label>Titel</label><input type="text" id="npTitle" placeholder="z.B. Text verbessern"></div>'
        + '<div class="field"><label>Kategorie</label><select id="npCat">' + catsHtml + '</select></div>'
        + '<div class="field"><label>Prompt</label><textarea id="npPrompt" placeholder="Schreibe deinen Prompt..." style="min-height:160px"></textarea></div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">💡 Variablen: {{variable}} einsetzen — z.B. {{text}}, {{thema}}</div>'
        + '<div class="field"><label>Variablen (Komma-getrennt)</label><input type="text" id="npVars" placeholder="text, thema, stil"></div>'
        + '<div style="display:flex;gap:8px;margin-top:14px">'
        + '<button class="btn" id="npSave" style="flex:1;padding:12px">💾 Speichern</button>'
        + '<button class="btn sec" id="npCancel" style="flex:1;padding:12px">Abbrechen</button>'
        + '</div>'
        + '</div>';
      document.body.appendChild(modal);

      modal.querySelector("#npSave").addEventListener("click", function(){
        var title = modal.querySelector("#npTitle").value.trim();
        var cat = modal.querySelector("#npCat").value;
        var prompt = modal.querySelector("#npPrompt").value.trim();
        var varsStr = modal.querySelector("#npVars").value.trim();
        if(!title || !prompt){ _toast("Titel und Prompt eingeben", "err"); return; }

        /* Variablen aus Prompt extrahieren falls nicht angegeben */
        var vars = varsStr ? varsStr.split(",").map(function(v){ return v.trim(); }).filter(Boolean) : [];
        if(!vars.length){
          var matches = prompt.match(/\{\{(\w+)\}\}/g);
          if(matches){
            vars = matches.map(function(m){ return m.replace(/[{}]/g, ""); });
            vars = vars.filter(function(v, i, a){ return a.indexOf(v) === i; });
          }
        }

        custom.push({
          id: "c" + Date.now(),
          cat: cat,
          title: title,
          prompt: prompt,
          vars: vars
        });
        store.set("custom", custom);
        _toast("✅ Prompt gespeichert", "ok");
        document.body.removeChild(modal);
        build();
      });
      modal.querySelector("#npCancel").addEventListener("click", function(){
        document.body.removeChild(modal);
      });
    }

    function _fallbackCopy(text){
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); _toast("📋 Kopiert!", "ok"); }
      catch(e){ _toast("❌ Kopieren fehlgeschlagen", "err"); }
      document.body.removeChild(ta);
    }

    function _toast(msg, type){
      var t = document.getElementById("toast");
      if(!t) return;
      t.textContent = msg;
      t.className = "show" + (type ? " " + type : "");
      clearTimeout(t._t);
      t._t = setTimeout(function(){ t.className = ""; }, 2400);
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("prompt", { render: render });
  else console.warn("prompt.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 prompt.js geladen");
