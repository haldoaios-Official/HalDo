/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — FAHRSCHULE (v1.0 PROFESSIONAL)
   Theorie-Training · Prüfungssimulation · Statistik · Fragen-Editor
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function shuffle(a){
    var r = a.slice();
    for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i]; r[i]=r[j]; r[j]=t; }
    return r;
  }

  var SAMPLE = [
    { cat: "Geschwindigkeit", q: "Wie hoch ist die zulässige Höchstgeschwindigkeit für Pkw außerhalb geschlossener Ortschaften?", a: ["80 km/h","100 km/h","130 km/h"], c: 1 },
    { cat: "Geschwindigkeit", q: "Welche Richtgeschwindigkeit gilt für Pkw auf Autobahnen?", a: ["100 km/h","130 km/h","150 km/h"], c: 1 },
    { cat: "Geschwindigkeit", q: "Wie schnell dürfen Sie in geschlossenen Ortschaften höchstens fahren?", a: ["30 km/h","50 km/h","60 km/h"], c: 1 },
    { cat: "Vorfahrt", q: "Sie nähern sich einem Stoppschild. Wie verhalten Sie sich?", a: ["Nur langsamer fahren","Anhalten und Vorfahrt gewähren","Hupen"], c: 1 },
    { cat: "Vorfahrt", q: "Was gilt an einer Kreuzung ohne Verkehrszeichen?", a: ["Rechts vor links","Links vor rechts","Immer Vorfahrt für geradeaus"], c: 0 },
    { cat: "Alkohol", q: "Ab welcher Blutalkoholkonzentration ist Fahren für Fahranfänger (Probezeit) verboten?", a: ["0,3‰","0,5‰","0,0‰"], c: 2 },
    { cat: "Alkohol", q: "Ab welcher Blutalkoholkonzentration begehen erfahrene Fahrer eine Ordnungswidrigkeit?", a: ["0,3‰","0,5‰","1,0‰"], c: 1 },
    { cat: "Reifen", q: "Wie tief muss das Profil von Pkw-Reifen mindestens sein?", a: ["1,0 mm","1,6 mm","3,0 mm"], c: 1 },
    { cat: "Licht", q: "Wann müssen Sie das Abblendlicht einschalten?", a: ["Nur nachts","Bei Dämmerung, Dunkelheit, Regen oder Nebel","Nur bei Regen"], c: 1 },
    { cat: "Autobahn", q: "Wann dürfen Sie auf der Autobahn rechts schneller fahren als links?", a: ["Immer","Nie","Bei stockendem Verkehr (Stau)"], c: 2 },
    { cat: "Autobahn", q: "Welche Fahrzeuge dürfen auf Autobahnen nicht fahren?", a: ["Motorräder","Pkw","Fahrräder"], c: 2 },
    { cat: "Gurt", q: "Wer muss den Sicherheitsgurt anlegen?", a: ["Nur der Fahrer","Fahrer und alle Insassen","Nur Erwachsene"], c: 1 },
    { cat: "Wild", q: "Wie verhalten Sie sich bei einem Wildwechsel?", a: ["Hupen und ausweichen","Bremsen, nicht ausweichen","Gas geben"], c: 1 },
    { cat: "Bremsen", q: "Wovon hängt der Bremsweg ab?", a: ["Nur von der Geschwindigkeit","Von Geschwindigkeit und Zustand der Reifen","Nur vom Wetter"], c: 1 },
    { cat: "Verkehrszeichen", q: "Ein auf der Spitze stehendes Dreieck bedeutet?", a: ["Vorfahrt gewähren","Vorfahrtstraße","Halteverbot"], c: 0 },
    { cat: "Verkehrszeichen", q: "Ein rundes blaues Schild mit weißem Pfeil bedeutet?", a: ["Verbot der Fahrtrichtung","Vorgeschriebene Fahrtrichtung","Einbahnstraße"], c: 1 },
    { cat: "Müdigkeit", q: "Was tun Sie bei Müdigkeit am Steuer?", a: ["Kaffee trinken und weiterfahren","Anhalten und Pause machen","Lauter Musik hören"], c: 1 },
    { cat: "Überholen", q: "Wann dürfen Sie NICHT überholen?", a: ["Bei unklarer Verkehrslage","Wenn die Sonne scheint","Wenn die Straße trocken ist"], c: 0 },
    { cat: "Parken", q: "Wie viel Abstand müssen Sie beim Parken vor und hinter einem Zebrastreifen lassen?", a: ["3 Meter","5 Meter","10 Meter"], c: 1 },
    { cat: "Notfall", q: "Wie lautet die europaweite Notrufnummer?", a: ["110","112","115"], c: 1 }
  ];

  function render(container, ctx){
    var store = ctx.store;

    var questions = store.get("questions", null);
    if(!questions) {
      questions = SAMPLE.map(function(q, i){ return { id: i+1, cat: q.cat, q: q.q, a: q.a, c: q.c }; });
      store.set("questions", questions);
    }

    var progress = store.get("progress", {});
    var stats = store.get("stats", { totalAnswered: 0, totalCorrect: 0, exams: [] });
    var ui = { screen: "home", practice: null, exam: null, modal: null };

    function saveQuestions(){ store.set("questions", questions); }
    function saveProgress(){ store.set("progress", progress); }
    function saveStats(){ store.set("stats", stats); }

    function recordAnswer(qid, isCorrect){
      if(!progress[qid]) progress[qid] = { correct: 0, wrong: 0 };
      if(isCorrect) progress[qid].correct++; else progress[qid].wrong++;
      progress[qid].last = new Date().toISOString();
      stats.totalAnswered++; if(isCorrect) stats.totalCorrect++;
      saveProgress(); saveStats();
    }

    // ─── Screens ───
    function card(icon, title, sub, screen){
      return '<button data-goto="' + screen + '" style="background:rgba(0,0,0,.25);border:1px solid var(--border-soft);border-radius:12px;padding:16px 10px;cursor:pointer;text-align:center;color:inherit;font-family:inherit">'
        + '<div style="font-size:28px">' + icon + '</div>'
        + '<div style="font-size:13px;font-weight:900;color:var(--p1);margin-top:6px">' + title + '</div>'
        + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(sub) + '</div>'
        + '</button>';
    }
    function backButton(inner){
      return '<button data-back="' + (inner ? 'inner' : '1') + '" style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>';
    }

    function screenHome(){
      var total = questions.length;
      var answered = Object.keys(progress).length;
      return ''
        + '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(200,160,30,.15),rgba(0,120,200,.15));border:1px solid rgba(200,160,30,.3)">'
        + '<div style="font-size:56px">🚗</div>'
        + '<div style="font-size:20px;font-weight:900;color:var(--p1);margin-top:6px">Fahrschule</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Theorie-Training · Klasse B</div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">'
        + card("📖","Üben","Fragen einzeln durchgehen","practice")
        + card("📝","Prüfung","30 Fragen · Simulation","exam")
        + card("📊","Statistik", answered + " / " + total + " Fragen","stats")
        + card("⚙️","Fragen", total + " verfügbar","manage")
        + '</div>'
        + (stats.exams.length ? '<div class="card" style="margin-top:12px"><h3>Letzte Prüfungen</h3>'
            + stats.exams.slice(-3).reverse().map(function(e){
                return '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
                  + '<div style="font-size:11px;color:var(--text-mute)">' + _esc(e.date) + '</div>'
                  + '<div style="font-size:12px;font-weight:900;color:' + (e.passed?"#4ade80":"#ff8080") + '">' + e.score + ' / ' + e.total + (e.passed?' ✅':' ❌') + '</div>'
                  + '</div>';
              }).join('')
            + '</div>' : '');
    }

    function screenPractice(){
      if(!ui.practice) {
        var cats = {};
        questions.forEach(function(q){ cats[q.cat] = (cats[q.cat]||0) + 1; });
        return backButton()
          + '<div class="card"><h3>📖 Kategorie wählen</h3>'
          + '<button data-pcat="__all" style="width:100%;padding:12px;background:rgba(200,160,30,.2);border:1px solid var(--p1);border-radius:10px;margin-bottom:6px;cursor:pointer;color:var(--p1);font-weight:900;font-size:13px">Alle Fragen (' + questions.length + ')</button>'
          + Object.keys(cats).sort().map(function(c){
              return '<button data-pcat="' + _esc(c) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;margin-bottom:4px;cursor:pointer;color:inherit;font-weight:800;font-size:12px;text-align:left">'
                + _esc(c) + ' <span style="float:right;color:var(--text-mute);font-size:10px">' + cats[c] + '</span></button>';
            }).join('')
          + '</div>';
      }
      var p = ui.practice;
      var q = questions.find(function(x){ return x.id === p.qid; });
      if(!q) return '<div class="card">Frage nicht gefunden</div>';
      return backButton(true)
        + '<div style="font-size:10px;color:var(--text-mute);text-align:center;margin-bottom:6px">Frage ' + (p.idx+1) + ' / ' + p.queue.length + ' · ' + _esc(q.cat) + '</div>'
        + '<div class="card">'
        + '<div style="font-size:14px;font-weight:900;margin-bottom:14px;line-height:1.4">' + _esc(q.q) + '</div>'
        + q.a.map(function(ans, i){
            var cls = 'background:rgba(0,0,0,.2);border-color:var(--border-soft)';
            if(p.answered) {
              if(i === q.c) cls = 'background:rgba(74,222,128,.15);border-color:#4ade80;color:#4ade80';
              else if(i === p.selected) cls = 'background:rgba(255,128,128,.15);border-color:#ff8080;color:#ff8080';
              else cls = 'opacity:.4';
            }
            return '<button data-pans="' + i + '" ' + (p.answered?"disabled":"") + ' style="width:100%;padding:12px;' + cls + ';border:1px solid;border-radius:10px;margin-bottom:6px;cursor:pointer;color:inherit;font-family:inherit;font-size:12.5px;text-align:left;font-weight:800">'
              + String.fromCharCode(65+i) + ') ' + _esc(ans) + '</button>';
          }).join('')
        + (p.answered ? '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-top:8px;font-size:12px">'
            + (p.correct ? '✅ <b style="color:#4ade80">Richtig!</b>' : '❌ <b style="color:#ff8080">Leider falsch.</b> Richtige Antwort: <b>' + String.fromCharCode(65+q.c) + '</b>')
            + '</div><button data-pnext style="width:100%;padding:12px;background:var(--p1);color:#000;border:none;border-radius:10px;margin-top:10px;font-weight:900;font-size:13px;cursor:pointer">Weiter →</button>' : '')
        + '</div>';
    }

    function screenExam(){
      if(!ui.exam) {
        return backButton()
          + '<div class="card" style="text-align:center;padding:24px">'
          + '<div style="font-size:48px">📝</div>'
          + '<div style="font-size:16px;font-weight:900;color:var(--p1);margin-top:10px">Prüfungssimulation</div>'
          + '<div style="font-size:12px;color:var(--text-dim);margin:10px 0;line-height:1.5">30 zufällige Fragen.<br>Bestanden mit max. 10 Fehlerpunkten.</div>'
          + '<button data-startexam style="width:100%;padding:14px;background:var(--p1);color:#000;border:none;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer">▶ Prüfung starten</button>'
          + '</div>';
      }
      var e = ui.exam;
      if(e.finished) {
        var passed = e.errors <= 10;
        return backButton(true)
          + '<div class="card" style="text-align:center;padding:30px">'
          + '<div style="font-size:64px">' + (passed?'🎉':'😔') + '</div>'
          + '<div style="font-size:22px;font-weight:900;color:' + (passed?'#4ade80':'#ff8080') + ';margin-top:10px">' + (passed?'Bestanden!':'Nicht bestanden') + '</div>'
          + '<div style="margin-top:16px;font-size:13px;color:var(--text-dim)">'
          + '<div style="margin-bottom:6px">Fehlerpunkte: <b style="color:' + (passed?'#4ade80':'#ff8080') + '">' + e.errors + ' / 10</b></div>'
          + '<div>Richtig: ' + e.correct + ' / ' + e.questions.length + '</div>'
          + '</div>'
          + '<button data-back style="width:100%;padding:12px;background:var(--p1);color:#000;border:none;border-radius:10px;margin-top:16px;font-weight:900;cursor:pointer">Zurück zur Auswahl</button>'
          + '</div>';
      }
      var q = e.questions[e.idx];
      return '<div style="font-size:10px;color:var(--text-mute);text-align:center;margin-bottom:6px">Frage ' + (e.idx+1) + ' / ' + e.questions.length + ' · Fehler: ' + e.errors + '</div>'
        + '<div class="card">'
        + '<div style="font-size:14px;font-weight:900;margin-bottom:14px;line-height:1.4">' + _esc(q.q) + '</div>'
        + q.a.map(function(ans, i){
            return '<button data-eans="' + i + '" style="width:100%;padding:12px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;margin-bottom:6px;cursor:pointer;color:inherit;font-family:inherit;font-size:12.5px;text-align:left;font-weight:800">'
              + String.fromCharCode(65+i) + ') ' + _esc(ans) + '</button>';
          }).join('')
        + '</div>';
    }

    function screenStats(){
      var byCat = {};
      questions.forEach(function(q){
        if(!byCat[q.cat]) byCat[q.cat] = { correct: 0, wrong: 0 };
        var p = progress[q.id];
        if(p){ byCat[q.cat].correct += p.correct; byCat[q.cat].wrong += p.wrong; }
      });
      var ratio = stats.totalAnswered ? Math.round(stats.totalCorrect / stats.totalAnswered * 100) : 0;
      var html = backButton()
        + '<div class="card" style="text-align:center"><h3>📊 Gesamtstatistik</h3>'
        + '<div style="font-size:32px;font-weight:900;color:var(--p1)">' + ratio + '%</div>'
        + '<div style="font-size:11px;color:var(--text-mute)">' + stats.totalCorrect + ' richtig von ' + stats.totalAnswered + ' beantwortet</div>'
        + '</div><div class="card"><h3>Nach Kategorie</h3>';
      Object.keys(byCat).sort().forEach(function(c){
        var d = byCat[c]; var total = d.correct + d.wrong;
        var pct = total ? Math.round(d.correct / total * 100) : 0;
        var color = pct>=80?"#4ade80":pct>=50?"#fbbf24":"#ff8080";
        html += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px">'
          + '<span style="font-weight:800">' + _esc(c) + '</span>'
          + '<span style="color:' + color + ';font-weight:900">' + pct + '%</span></div>'
          + '<div style="height:6px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px"></div></div></div>';
      });
      html += '</div>';
      var wrongQs = questions.filter(function(q){ var p = progress[q.id]; return p && p.wrong > 0; });
      if(wrongQs.length) {
        html += '<div class="card"><h3>❌ Fehlerliste (' + wrongQs.length + ')</h3>';
        wrongQs.forEach(function(q){
          html += '<div style="padding:8px;background:rgba(0,0,0,.2);border-left:3px solid #ff8080;border-radius:6px;margin-bottom:4px;font-size:11px">' + _esc(q.q) + '</div>';
        });
        html += '</div>';
      }
      return html;
    }

    function screenManage(){
      var html = backButton()
        + '<div class="card">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<h3 style="margin:0">⚙️ Fragen (' + questions.length + ')</h3>'
        + '<button data-addq style="padding:8px 12px;background:var(--p1);color:#000;border:none;border-radius:8px;font-weight:900;font-size:11px;cursor:pointer">+ Neu</button>'
        + '</div>';
      if(!questions.length) html += '<div style="text-align:center;color:var(--text-mute);padding:20px">Keine Fragen vorhanden</div>';
      else questions.forEach(function(q){
        html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px">'
          + '<div style="display:flex;justify-content:space-between;gap:8px">'
          + '<div style="flex:1;font-size:11.5px;font-weight:800;line-height:1.3">' + _esc(q.q) + '</div>'
          + '<div style="display:flex;gap:4px">'
          + '<button data-editq="' + q.id + '" style="background:rgba(200,160,30,.2);border:none;color:var(--p1);cursor:pointer;padding:4px 8px;border-radius:6px;font-size:11px">✏️</button>'
          + '<button data-delq="' + q.id + '" style="background:rgba(255,128,128,.2);border:none;color:#ff8080;cursor:pointer;padding:4px 8px;border-radius:6px;font-size:11px">✕</button>'
          + '</div></div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:4px">' + _esc(q.cat) + ' · Antwort: ' + String.fromCharCode(65+q.c) + '</div>'
          + '</div>';
      });
      return html + '</div>';
    }

    function questionForm(q){
      var isEdit = !!q;
      var cat = isEdit ? q.cat : "";
      var question = isEdit ? q.q : "";
      var answers = isEdit ? q.a : ["","",""];
      var correct = isEdit ? q.c : 0;
      var html = '<label style="font-size:11px;font-weight:900;color:var(--text-mute);display:block;margin-bottom:4px">Kategorie</label>'
        + '<input id="qf-cat" value="' + _esc(cat) + '" placeholder="z.B. Vorfahrt" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px;margin-bottom:10px">'
        + '<label style="font-size:11px;font-weight:900;color:var(--text-mute);display:block;margin-bottom:4px">Frage</label>'
        + '<textarea id="qf-q" rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px;margin-bottom:10px;resize:vertical">' + _esc(question) + '</textarea>';
      for(var i=0;i<3;i++){
        var active = (correct === i);
        html += '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
          + '<button data-qcorrect="' + i + '" style="width:28px;height:28px;border-radius:50%;border:2px solid ' + (active?'#4ade80':'var(--text-mute)') + ';background:' + (active?'#4ade80':'transparent') + ';color:' + (active?'#000':'var(--text-mute)') + ';font-size:11px;font-weight:900;cursor:pointer;flex-shrink:0">' + String.fromCharCode(65+i) + '</button>'
          + '<input data-qans="' + i + '" value="' + _esc(answers[i]) + '" placeholder="Antwort ' + String.fromCharCode(65+i) + '" style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;font-size:12px">'
          + '</div>';
      }
      html += '<div style="font-size:10px;color:var(--text-mute);text-align:center;margin-top:6px">Grüner Buchstabe = richtige Antwort</div>'
        + '<button data-qsave style="width:100%;padding:12px;background:var(--p1);color:#000;border:none;border-radius:10px;margin-top:14px;font-weight:900;font-size:13px;cursor:pointer">' + (isEdit?'💾 Speichern':'+ Anlegen') + '</button>';
      return html;
    }

    function bindQuestionForm(editQ){
      var curCorrect = editQ ? editQ.c : 0;
      container.querySelectorAll("[data-qcorrect]").forEach(function(el){
        el.addEventListener("click", function(){
          curCorrect = parseInt(el.dataset.qcorrect);
          container.querySelectorAll("[data-qcorrect]").forEach(function(x, idx){
            var a = (idx === curCorrect);
            x.style.border = '2px solid ' + (a?'#4ade80':'var(--text-mute)');
            x.style.background = a?'#4ade80':'transparent';
            x.style.color = a?'#000':'var(--text-mute)';
          });
        });
      });
      var saveBtn = container.querySelector("[data-qsave]");
      if(saveBtn) saveBtn.addEventListener("click", function(){
        var cat = container.querySelector("#qf-cat").value.trim();
        var qText = container.querySelector("#qf-q").value.trim();
        var ans = [];
        for(var i=0;i<3;i++) ans.push(container.querySelector('[data-qans="' + i + '"]').value.trim());
        if(!qText || !ans.every(function(a){ return a; })) { alert("Bitte Frage und alle 3 Antworten ausfüllen."); return; }
        if(editQ) { editQ.cat = cat||"Allgemein"; editQ.q = qText; editQ.a = ans; editQ.c = curCorrect; }
        else {
          var maxId = questions.reduce(function(m,q){ return Math.max(m,q.id); }, 0);
          questions.push({ id: maxId+1, cat: cat||"Allgemein", q: qText, a: ans, c: curCorrect });
        }
        saveQuestions(); ui.modal = null; build();
      });
    }

    function build(){
      var html = '';
      if(ui.screen === "home") html = screenHome();
      else if(ui.screen === "practice") html = screenPractice();
      else if(ui.screen === "exam") html = screenExam();
      else if(ui.screen === "stats") html = screenStats();
      else if(ui.screen === "manage") html = screenManage();
      if(ui.modal) {
        html += '<div style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px">'
          + '<div style="background:var(--bg);border:1px solid var(--border-soft);border-radius:16px;padding:20px;max-width:420px;width:100%;max-height:85vh;overflow-y:auto">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
          + '<div style="font-size:15px;font-weight:900;color:var(--p1)">' + _esc(ui.modal.title) + '</div>'
          + '<button data-modalclose style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:18px">✕</button>'
          + '</div>' + ui.modal.body + '</div></div>';
      }
      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelectorAll("[data-goto]").forEach(function(el){
        el.addEventListener("click", function(){ ui.screen = el.dataset.goto; build(); });
      });
      container.querySelectorAll("[data-back]").forEach(function(el){
        el.addEventListener("click", function(){
          if(el.dataset.back === "inner") {
            if(ui.screen === "practice") ui.practice = null;
            else if(ui.screen === "exam") ui.exam = null;
          } else { ui.screen = "home"; ui.practice = null; ui.exam = null; }
          build();
        });
      });
      container.querySelectorAll("[data-pcat]").forEach(function(el){
        el.addEventListener("click", function(){
          var cat = el.dataset.pcat;
          var pool = cat === "__all" ? questions.slice() : questions.filter(function(q){ return q.cat === cat; });
          if(!pool.length) return;
          var queue = shuffle(pool);
          ui.practice = { queue: queue.map(function(q){ return q.id; }), idx: 0, qid: queue[0].id, answered: false, correct: false, selected: null };
          build();
        });
      });
      container.querySelectorAll("[data-pans]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!ui.practice || ui.practice.answered) return;
          var i = parseInt(el.dataset.pans);
          var q = questions.find(function(x){ return x.id === ui.practice.qid; });
          ui.practice.selected = i; ui.practice.answered = true; ui.practice.correct = (i === q.c);
          recordAnswer(q.id, ui.practice.correct);
          build();
        });
      });
      var nextBtn = container.querySelector("[data-pnext]");
      if(nextBtn) nextBtn.addEventListener("click", function(){
        var p = ui.practice; p.idx++;
        if(p.idx >= p.queue.length){ ui.practice = null; build(); return; }
        p.qid = p.queue[p.idx]; p.answered = false; p.correct = false; p.selected = null;
        build();
      });
      var startBtn = container.querySelector("[data-startexam]");
      if(startBtn) startBtn.addEventListener("click", function(){
        var pool = shuffle(questions).slice(0, Math.min(30, questions.length));
        ui.exam = { queue: pool.map(function(q){ return q.id; }), questions: pool, idx: 0, correct: 0, errors: 0, finished: false };
        build();
      });
      container.querySelectorAll("[data-eans]").forEach(function(el){
        el.addEventListener("click", function(){
          var e = ui.exam; if(!e || e.finished) return;
          var i = parseInt(el.dataset.eans);
          var q = e.questions[e.idx];
          var ok = (i === q.c);
          if(ok) e.correct++; else e.errors++;
          recordAnswer(q.id, ok);
          e.idx++;
          if(e.idx >= e.questions.length) {
            e.finished = true;
            e.date = new Date().toLocaleString("de-DE");
            e.total = e.questions.length; e.score = e.correct; e.passed = e.errors <= 10;
            stats.exams.push({ date: e.date, score: e.score, total: e.total, passed: e.passed });
            saveStats();
          }
          build();
        });
      });
      var addBtn = container.querySelector("[data-addq]");
      if(addBtn) addBtn.addEventListener("click", function(){
        ui.modal = { title: "Neue Frage", body: questionForm(null) };
        build(); bindQuestionForm(null);
      });
      container.querySelectorAll("[data-editq]").forEach(function(el){
        el.addEventListener("click", function(){
          var id = parseInt(el.dataset.editq);
          var q = questions.find(function(x){ return x.id === id; });
          ui.modal = { title: "Frage bearbeiten", body: questionForm(q) };
          build(); bindQuestionForm(q);
        });
      });
      container.querySelectorAll("[data-delq]").forEach(function(el){
        el.addEventListener("click", function(){
          var id = parseInt(el.dataset.delq);
          if(!confirm("Frage wirklich löschen?")) return;
          questions = questions.filter(function(q){ return q.id !== id; });
          delete progress[id];
          saveQuestions(); saveProgress(); build();
        });
      });
      var mc = container.querySelector("[data-modalclose]");
      if(mc) mc.addEventListener("click", function(){ ui.modal = null; build(); });
    }

    build();
  }

  HalDoApp("fahrschule", { name: "Fahrschule", icon: "🚗", render: render, category: "bildung" });
  console.log("🦚 fahrschule.js v1.0 geladen — Theorie-Training PROFESSIONAL");
})();
