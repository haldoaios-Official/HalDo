/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — TEXT-ANALYSE (v1.0)
   Zeichen · Wörter · Sätze · Lesbarkeit · Häufigkeit
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = { text: store.get("lastText","") };

    function build(){
      var text = state.text;
      var stats = analyze(text);

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">✏️</div>'
        + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:6px">Text-Analyse</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">Zeichen · Wörter · Sätze · Lesbarkeit</div>'
        + '</div>';

      html += '<div class="card">'
        + '<div class="field"><label>Text</label><textarea id="ta-text" rows="8" placeholder="Text eingeben oder einfügen..." style="resize:vertical;font-size:12.5px">'+_esc(text)+'</textarea></div>'
        + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'
        + statBox("Zeichen", stats.chars, "#4dd0e1")
        + statBox("Ohne Lehrz.", stats.charsNoSpace, "#4da8ff")
        + statBox("Wörter", stats.words, "#66cc66")
        + statBox("Sätze", stats.sentences, "#ffd54f")
        + '</div></div>';

      if(text.trim().length > 0){
        html += '<div class="card"><h3>📊 Details</h3>'
          + row("Zeilen", stats.lines)
          + row("Absätze", stats.paragraphs)
          + row("Silben (ca.)", stats.syllables)
          + row("Längstes Wort", stats.longest ? _esc(stats.longest) + " (" + stats.longest.length + ")" : "—")
          + row("Ø Wortlänge", stats.avgWordLen.toFixed(1) + " Zeichen")
          + row("Ø Satzlänge", stats.avgSentLen.toFixed(1) + " Wörter")
          + '</div>';

        // Reading time
        var readMin = Math.max(1, Math.round(stats.words / 200));
        var speakMin = Math.max(1, Math.round(stats.words / 150));
        html += '<div class="card" style="display:flex;gap:8px;text-align:center">'
          + '<div style="flex:1;padding:10px;background:rgba(77,208,225,.1);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#4dd0e1">'+readMin+' min</div><div style="font-size:10px;color:var(--text-mute);margin-top:2px">📖 Lesezeit</div></div>'
          + '<div style="flex:1;padding:10px;background:rgba(180,120,255,.1);border-radius:8px"><div style="font-size:20px;font-weight:900;color:#b478ff">'+speakMin+' min</div><div style="font-size:10px;color:var(--text-mute);margin-top:2px">🗣️ Sprechzeit</div></div>'
          + '</div>';

        // Readability
        var fre = readability(stats);
        html += '<div class="card"><h3>📖 Lesbarkeit (Flesch)</h3>'
          + '<div style="padding:14px;background:'+fre.color+'15;border:1px solid '+fre.color+'44;border-radius:10px;text-align:center">'
          + '<div style="font-size:28px;font-weight:900;color:'+fre.color+'">'+Math.round(fre.score)+'</div>'
          + '<div style="font-size:12px;font-weight:900;color:'+fre.color+';margin-top:2px">'+fre.label+'</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:4px">Je höher, desto leichter lesbar (0-100)</div>'
          + '</div></div>';

        // Top words
        if(stats.topWords.length){
          html += '<div class="card"><h3>🔝 Häufigste Wörter</h3>';
          stats.topWords.forEach(function(w){
            var pct = w.count / stats.words * 100;
            html += '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:11px"><span style="font-weight:800">'+_esc(w.word)+'</span><span style="color:var(--p1);font-weight:900">'+w.count+'×</span></div>'
              + '<div style="height:4px;background:rgba(0,0,0,.3);border-radius:2px;margin-top:2px"><div style="height:100%;width:'+Math.min(100,pct*10)+'%;background:linear-gradient(90deg,#4dd0e1,#b478ff);border-radius:2px"></div></div></div>';
          });
          html += '</div>';
        }
      }

      container.innerHTML = html;
      bind();
    }

    function analyze(text){
      var chars = text.length;
      var charsNoSpace = text.replace(/\s/g,"").length;
      var words = text.trim() ? text.trim().split(/\s+/).length : 0;
      var sentences = (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0);
      var lines = text ? text.split("\n").length : 0;
      var paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
      var wordList = text.trim() ? text.trim().split(/\s+/).filter(function(w){ return w.length > 0; }) : [];
      var longest = wordList.reduce(function(a,w){ return w.length > a.length ? w : a; }, "");
      var avgWordLen = wordList.length ? wordList.reduce(function(s,w){ return s+w.length; }, 0) / wordList.length : 0;
      var avgSentLen = sentences ? words / sentences : 0;
      // Silben: grob — Vokalgruppen
      var syllables = wordList.reduce(function(s, w){
        var clean = w.toLowerCase().replace(/[^a-zäöüß]/g, "");
        var matches = clean.match(/[aeiouäöü]+/g);
        return s + (matches ? matches.length : 1);
      }, 0);
      // Top words
      var freq = {};
      var stopWords = ["der","die","das","und","oder","ein","eine","einen","einem","einer","ist","sind","war","waren","hat","haben","hatte","hatten","wird","werden","wurde","wurden","zu","zum","zur","in","im","an","am","auf","mit","von","vom","für","bei","beim","auf","aus","sich","es","sich","ich","du","er","sie","es","wir","ihr","sie","nicht","auch","aber","als","wie","so","wenn","dann","dass","daß","weil","dass"];
      wordList.forEach(function(w){
        var lower = w.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
        if(lower.length < 3) return;
        if(stopWords.indexOf(lower) >= 0) return;
        freq[lower] = (freq[lower] || 0) + 1;
      });
      var topWords = Object.keys(freq).map(function(w){ return { word:w, count:freq[w] }; })
        .sort(function(a,b){ return b.count - a.count; })
        .slice(0, 8);

      return { chars, charsNoSpace, words, sentences, lines, paragraphs, longest, avgWordLen, avgSentLen, syllables, topWords };
    }

    function readability(stats){
      if(stats.words < 5) return { score:0, label:"Text zu kurz", color:"#888" };
      // Flesch für Deutsch (Amstad-Formel)
      var asl = stats.words / Math.max(1, stats.sentences); // avg sentence length
      var asw = stats.syllables / Math.max(1, stats.words); // avg syllables per word
      var score = 180 - asl - (58.5 * asw);
      score = Math.max(0, Math.min(100, score));
      if(score >= 80) return { score:score, label:"Sehr leicht", color:"#4ade80" };
      if(score >= 60) return { score:score, label:"Leicht", color:"#84cc16" };
      if(score >= 50) return { score:score, label:"Mittel", color:"#ffd54f" };
      if(score >= 30) return { score:score, label:"Schwer", color:"#ff8844" };
      return { score:score, label:"Sehr schwer", color:"#ff5555" };
    }

    function statBox(label, value, color){
      return '<div style="padding:10px 4px;background:'+color+'15;border:1px solid '+color+'44;border-radius:8px;text-align:center">'
        + '<div style="font-size:18px;font-weight:900;color:'+color+';line-height:1">'+value+'</div>'
        + '<div style="font-size:9px;color:var(--text-mute);margin-top:3px;font-weight:700">'+label+'</div>'
        + '</div>';
    }

    function row(k, v){
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11.5px"><span style="color:var(--text-mute)">'+k+'</span><span style="font-weight:800;color:var(--p1)">'+v+'</span></div>';
    }

    function bind(){
      var t = container.querySelector("#ta-text");
      t.addEventListener("input", function(){
        state.text = t.value; store.set("lastText", state.text);
        // Re-render stats without losing focus
        var pos = t.selectionStart;
        build();
        var n = container.querySelector("#ta-text");
        if(n){ n.focus(); n.setSelectionRange(pos, pos); }
      });
    }

    build();
  }

  HalDoApp("text-analyse", { name: "Text-Analyse", icon: "✏️", render: render, category: "werkzeuge" });
  console.log("🦚 text-analyse.js v1.0 geladen");
})();
