/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GEO QUIZ (v1.0)
   Hauptstädte · Flaggen · Kontinente · Länder
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var DATA = [
    { cap:"Berlin", country:"Deutschland", continent:"Europa", flag:"🇩🇪" },
    { cap:"Paris", country:"Frankreich", continent:"Europa", flag:"🇫🇷" },
    { cap:"Rom", country:"Italien", continent:"Europa", flag:"🇮🇹" },
    { cap:"Madrid", country:"Spanien", continent:"Europa", flag:"🇪🇸" },
    { cap:"London", country:"Vereinigtes Königreich", continent:"Europa", flag:"🇬🇧" },
    { cap:"Wien", country:"Österreich", continent:"Europa", flag:"🇦🇹" },
    { cap:"Bern", country:"Schweiz", continent:"Europa", flag:"🇨🇭" },
    { cap:"Amsterdam", country:"Niederlande", continent:"Europa", flag:"🇳🇱" },
    { cap:"Brüssel", country:"Belgien", continent:"Europa", flag:"🇧🇪" },
    { cap:"Oslo", country:"Norwegen", continent:"Europa", flag:"🇳🇴" },
    { cap:"Stockholm", country:"Schweden", continent:"Europa", flag:"🇸🇪" },
    { cap:"Helsinki", country:"Finnland", continent:"Europa", flag:"🇫🇮" },
    { cap:"Kopenhagen", country:"Dänemark", continent:"Europa", flag:"🇩🇰" },
    { cap:"Warschau", country:"Polen", continent:"Europa", flag:"🇵🇱" },
    { cap:"Prag", country:"Tschechien", continent:"Europa", flag:"🇨🇿" },
    { cap:"Athen", country:"Griechenland", continent:"Europa", flag:"🇬🇷" },
    { cap:"Lissabon", country:"Portugal", continent:"Europa", flag:"🇵🇹" },
    { cap:"Moskau", country:"Russland", continent:"Europa", flag:"🇷🇺" },
    { cap:"Kiew", country:"Ukraine", continent:"Europa", flag:"🇺🇦" },
    { cap:"Ankara", country:"Türkei", continent:"Asien", flag:"🇹🇷" },
    { cap:"Tokio", country:"Japan", continent:"Asien", flag:"🇯🇵" },
    { cap:"Peking", country:"China", continent:"Asien", flag:"🇨🇳" },
    { cap:"Neu-Delhi", country:"Indien", continent:"Asien", flag:"🇮🇳" },
    { cap:"Seoul", country:"Südkorea", continent:"Asien", flag:"🇰🇷" },
    { cap:"Bangkok", country:"Thailand", continent:"Asien", flag:"🇹🇭" },
    { cap:"Hanoi", country:"Vietnam", continent:"Asien", flag:"🇻🇳" },
    { cap:"Jakarta", country:"Indonesien", continent:"Asien", flag:"🇮🇩" },
    { cap:"Manila", country:"Philippinen", continent:"Asien", flag:"🇵🇭" },
    { cap:"Riad", country:"Saudi-Arabien", continent:"Asien", flag:"🇸🇦" },
    { cap:"Teheran", country:"Iran", continent:"Asien", flag:"🇮🇷" },
    { cap:"Bagdad", country:"Irak", continent:"Asien", flag:"🇮🇶" },
    { cap:"Kairo", country:"Ägypten", continent:"Afrika", flag:"🇪🇬" },
    { cap:"Rabat", country:"Marokko", continent:"Afrika", flag:"🇲🇦" },
    { cap:"Algier", country:"Algerien", continent:"Afrika", flag:"🇩🇿" },
    { cap:"Tunis", country:"Tunesien", continent:"Afrika", flag:"🇹🇳" },
    { cap:"Abuja", country:"Nigeria", continent:"Afrika", flag:"🇳🇬" },
    { cap:"Nairobi", country:"Kenia", continent:"Afrika", flag:"🇰🇪" },
    { cap:"Addis Abeba", country:"Äthiopien", continent:"Afrika", flag:"🇪🇹" },
    { cap:"Kapstadt (leg.)", country:"Südafrika", continent:"Afrika", flag:"🇿🇦" },
    { cap:"Washington D.C.", country:"USA", continent:"Nordamerika", flag:"🇺🇸" },
    { cap:"Ottawa", country:"Kanada", continent:"Nordamerika", flag:"🇨🇦" },
    { cap:"Mexiko-Stadt", country:"Mexiko", continent:"Nordamerika", flag:"🇲🇽" },
    { cap:"Havanna", country:"Kuba", continent:"Nordamerika", flag:"🇨🇺" },
    { cap:"Brasília", country:"Brasilien", continent:"Südamerika", flag:"🇧🇷" },
    { cap:"Buenos Aires", country:"Argentinien", continent:"Südamerika", flag:"🇦🇷" },
    { cap:"Santiago", country:"Chile", continent:"Südamerika", flag:"🇨🇱" },
    { cap:"Lima", country:"Peru", continent:"Südamerika", flag:"🇵🇪" },
    { cap:"Bogotá", country:"Kolumbien", continent:"Südamerika", flag:"🇨🇴" },
    { cap:"Canberra", country:"Australien", continent:"Ozeanien", flag:"🇦🇺" },
    { cap:"Wellington", country:"Neuseeland", continent:"Ozeanien", flag:"🇳🇿" }
  ];

  var MODES = [
    { id:"cap", name:"Hauptstädte", icon:"🏙️", desc:"Welche Stadt ist die Hauptstadt?" },
    { id:"country", name:"Länder", icon:"🌍", desc:"Zu welchem Land gehört die Hauptstadt?" },
    { id:"flag", name:"Flaggen", icon:"🚩", desc:"Welche Flagge gehört zum Land?" }
  ];

  function shuffle(a){ var r = a.slice(); for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i]; r[i]=r[j]; r[j]=t; } return r; }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"menu", mode:"cap", q:null, answered:false, selected:null, correct:false };
    var session = { score:0, asked:0, streak:0, bestStreak:0, total:10 };

    function build(){
      if(view.screen === "quiz") screenQuiz();
      else if(view.screen === "result") screenResult();
      else screenMenu();
    }

    function screenMenu(){
      var stats = store.get("stats", { totalCorrect:0, totalAsked:0, bestStreak:0, sessions:0 });
      var best = store.get("best", { cap:0, country:0, flag:0 });
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(102,204,102,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">🗺️</div>'
        + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:6px">Geo-Quiz</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+DATA.length+' Länder · 3 Modi · 10 Fragen</div>'
        + '</div>';

      html += '<div class="card" style="display:flex;justify-content:space-around;text-align:center">'
        + '<div><div style="font-size:22px;font-weight:900;color:#4dd0e1">'+(stats.totalAsked?Math.round(stats.totalCorrect/stats.totalAsked*100):0)+'%</div><div style="font-size:10px;color:var(--text-mute)">Quote</div></div>'
        + '<div><div style="font-size:22px;font-weight:900;color:#ffd54f">'+stats.totalCorrect+'</div><div style="font-size:10px;color:var(--text-mute)">Richtig</div></div>'
        + '<div><div style="font-size:22px;font-weight:900;color:#ff6b6b">'+stats.bestStreak+'</div><div style="font-size:10px;color:var(--text-mute)">Streak</div></div>'
        + '</div>';

      html += '<div class="card"><h3>Modus wählen</h3>';
      MODES.forEach(function(m){
        html += '<button data-mode="'+m.id+'" style="width:100%;padding:14px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-left:3px solid #4dd0e1;border-radius:10px;margin-bottom:6px;color:inherit;font-family:inherit;cursor:pointer;text-align:left">'
          + '<div style="display:flex;align-items:center;gap:10px">'
          + '<div style="font-size:26px">'+m.icon+'</div>'
          + '<div style="flex:1"><div style="font-size:13px;font-weight:900;color:#4dd0e1">'+m.name+'</div><div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+m.desc+'</div></div>'
          + (best[m.id] ? '<div style="font-size:11px;color:#ffd54f;font-weight:900">Best: '+best[m.id]+'/10</div>' : '')
          + '</div></button>';
      });
      html += '</div>';

      container.innerHTML = html;
      container.querySelectorAll("[data-mode]").forEach(function(el){
        el.addEventListener("click", function(){ startQuiz(el.dataset.mode); });
      });
    }

    function startQuiz(mode){
      view.mode = mode;
      view.screen = "quiz";
      session = { score:0, asked:0, streak:0, bestStreak:0, total:10 };
      nextQuestion();
    }

    function nextQuestion(){
      if(session.asked >= session.total){ finishQuiz(); return; }
      var correct = DATA[Math.floor(Math.random()*DATA.length)];
      var pool = DATA.filter(function(d){ return d.country !== correct.country; });
      var wrong = shuffle(pool).slice(0, 3);
      var answers = shuffle([correct].concat(wrong));
      view.q = { correct:correct, answers:answers };
      view.answered = false;
      view.selected = null;
      view.correct = false;
      session.asked++;
      screenQuiz();
    }

    function screenQuiz(){
      var q = view.q;
      if(!q) return startQuiz("cap");
      var mode = MODES.find(function(m){ return m.id === view.mode; });
      var questionText = "";
      var answerFn = null;

      if(view.mode === "cap"){
        questionText = 'Was ist die Hauptstadt von <b>' + q.correct.flag + ' ' + _esc(q.correct.country) + '</b>?';
        answerFn = function(a){ return _esc(a.cap); };
      } else if(view.mode === "country"){
        questionText = 'Zu welchem Land gehört <b>' + _esc(q.correct.cap) + '</b>?';
        answerFn = function(a){ return a.flag + ' ' + _esc(a.country); };
      } else {
        questionText = 'Welche Flagge gehört zu <b>' + _esc(q.correct.country) + '</b>?';
        answerFn = function(a){ return '<span style="font-size:32px">' + a.flag + '</span>'; };
      }

      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>';

      html += '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.1),rgba(180,120,255,.1))">'
        + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-mute);margin-bottom:8px">'
        + '<span>Frage ' + session.asked + ' / ' + session.total + '</span>'
        + '<span style="color:#ffd54f;font-weight:900">🔥 ' + session.streak + '</span>'
        + '</div>'
        + '<div style="height:4px;background:rgba(0,0,0,.3);border-radius:2px;overflow:hidden"><div style="height:100%;width:' + ((session.asked-1)/session.total*100) + '%;background:linear-gradient(90deg,#4dd0e1,#b478ff);transition:width .3s"></div></div>'
        + '</div>';

      html += '<div class="card">'
        + '<div style="font-size:15px;font-weight:900;line-height:1.5;margin-bottom:16px;text-align:center">' + questionText + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';

      q.answers.forEach(function(a, i){
        var cls = 'background:rgba(0,0,0,.2);border-color:var(--border-soft)';
        if(view.answered){
          if(a.country === q.correct.country) cls = 'background:rgba(74,222,128,.15);border-color:#4ade80;color:#4ade80';
          else if(i === view.selected) cls = 'background:rgba(255,128,128,.15);border-color:#ff8080;color:#ff8080';
          else cls = 'opacity:.4';
        }
        html += '<button data-ans="' + i + '" ' + (view.answered?"disabled":"") + ' style="padding:14px 8px;border:1px solid;' + cls + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;font-size:12px;font-weight:800;text-align:center;min-height:60px;display:flex;align-items:center;justify-content:center">'
          + answerFn(a) + '</button>';
      });

      html += '</div>';

      if(view.answered){
        html += '<div style="margin-top:14px;padding:12px;background:' + (view.correct ? 'rgba(74,222,128,.1)' : 'rgba(255,128,128,.1)') + ';border:1px solid ' + (view.correct ? '#4ade80' : '#ff8080') + ';border-radius:10px;text-align:center">'
          + '<div style="font-size:14px;font-weight:900;color:' + (view.correct ? '#4ade80' : '#ff8080') + '">' + (view.correct ? '✅ Richtig!' : '❌ Leider falsch') + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Richtige Antwort: <b style="color:#4ade80">' + q.correct.flag + ' ' + _esc(q.correct.cap) + ', ' + _esc(q.correct.country) + '</b></div>'
          + '</div>'
          + '<button class="btn full" id="q-next" style="margin-top:10px">' + (session.asked >= session.total ? 'Ergebnis ansehen' : 'Nächste Frage →') + '</button>';
      }

      html += '</div>';

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "menu"; build(); });
      container.querySelectorAll("[data-ans]").forEach(function(el){
        el.addEventListener("click", function(){
          if(view.answered) return;
          var idx = parseInt(el.dataset.ans);
          var a = q.answers[idx];
          view.selected = idx;
          view.correct = (a.country === q.correct.country);
          view.answered = true;
          if(view.correct){ session.score++; session.streak++; session.bestStreak = Math.max(session.bestStreak, session.streak); }
          else session.streak = 0;
          screenQuiz();
        });
      });
      var nb = container.querySelector("#q-next");
      if(nb) nb.addEventListener("click", function(){
        if(session.asked >= session.total){ finishQuiz(); return; }
        nextQuestion();
      });
    }

    function finishQuiz(){
      view.screen = "result";
      var stats = store.get("stats", { totalCorrect:0, totalAsked:0, bestStreak:0, sessions:0 });
      stats.totalCorrect += session.score;
      stats.totalAsked += session.total;
      stats.bestStreak = Math.max(stats.bestStreak, session.bestStreak);
      stats.sessions++;
      store.set("stats", stats);
      var best = store.get("best", { cap:0, country:0, flag:0 });
      if(session.score > (best[view.mode] || 0)){
        best[view.mode] = session.score;
        store.set("best", best);
      }
      screenResult();
    }

    function screenResult(){
      var pct = Math.round(session.score / session.total * 100);
      var color = pct >= 80 ? "#4ade80" : pct >= 50 ? "#ffd54f" : "#ff8080";
      var emoji = pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "💪";
      var html = '<div class="card" style="text-align:center;padding:30px;background:linear-gradient(135deg,rgba(77,208,225,.1),rgba(180,120,255,.1))">'
        + '<div style="font-size:64px">'+emoji+'</div>'
        + '<div style="font-size:48px;font-weight:900;color:'+color+';line-height:1;margin-top:8px">'+pct+'%</div>'
        + '<div style="font-size:14px;font-weight:900;color:'+color+';margin-top:4px">'+session.score+' / '+session.total+' richtig</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:8px">Beste Streak: 🔥 '+session.bestStreak+'</div>'
        + '</div>';

      html += '<div class="card" style="display:flex;gap:6px">'
        + '<button class="btn" id="q-again" style="flex:1">🔄 Nochmal</button>'
        + '<button class="btn sec" id="q-menu" style="flex:1">🏠 Menü</button>'
        + '</div>';

      container.innerHTML = html;
      container.querySelector("#q-again").addEventListener("click", function(){ startQuiz(view.mode); });
      container.querySelector("#q-menu").addEventListener("click", function(){ view.screen = "menu"; build(); });
    }

    function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

    build();
  }

  HalDoApp("geo-quiz", { name: "Geo-Quiz", icon: "🗺️", render: render, category: "bildung" });
  console.log("🦚 geo-quiz.js v1.0 geladen");
})();
