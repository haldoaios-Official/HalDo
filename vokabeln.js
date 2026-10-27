/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VOKABELN (v1.0)
   Vokabeltrainer · Decks · Abfrage · Statistik
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function shuffle(a){ var r = a.slice(); for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i]; r[i]=r[j]; r[j]=t; } return r; }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list" };
    var session = null;

    function getDecks(){ return store.get("decks", []); }
    function saveDecks(d){ store.set("decks", d); }
    function getStats(){ return store.get("stats", { correct:0, wrong:0 }); }
    function saveStats(s){ store.set("stats", s); }

    function build(){
      if(view.screen === "edit") screenEdit();
      else if(view.screen === "quiz") screenQuiz();
      else if(view.screen === "result") screenResult();
      else screenList();
    }

    function screenList(){
      var decks = getDecks();
      var stats = getStats();
      var totalVocab = decks.reduce(function(s,d){ return s + (d.words||[]).length; }, 0);

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1">🗣️ Vokabeltrainer</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+decks.length+' Decks · '+totalVocab+' Vokabeln</div></div>'
        + '<button class="btn" id="vAdd" style="padding:10px 14px">➕</button>'
        + '</div></div>';

      if(stats.correct + stats.wrong > 0){
        var pct = Math.round(stats.correct / (stats.correct + stats.wrong) * 100);
        html += '<div class="card" style="display:flex;justify-content:space-around;text-align:center">'
          + '<div><div style="font-size:22px;font-weight:900;color:#4ade80">'+stats.correct+'</div><div style="font-size:10px;color:var(--text-mute)">Richtig</div></div>'
          + '<div><div style="font-size:22px;font-weight:900;color:#ff8080">'+stats.wrong+'</div><div style="font-size:10px;color:var(--text-mute)">Falsch</div></div>'
          + '<div><div style="font-size:22px;font-weight:900;color:#4dd0e1">'+pct+'%</div><div style="font-size:10px;color:var(--text-mute)">Quote</div></div>'
          + '</div>';
      }

      if(!decks.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">🗣️</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Noch keine Decks<br><span style="font-size:10px;opacity:.7">Erstelle dein erstes Deck</span></div></div>';
      } else {
        decks.forEach(function(d){
          var words = d.words || [];
          html += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            + '<div><div style="font-size:14px;font-weight:900;color:#4dd0e1">'+_esc(d.name)+'</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute)">'+words.length+' Vokabeln · '+_esc(d.from||"")+' → '+_esc(d.to||"")+'</div></div>'
            + '<div style="display:flex;gap:4px">'
            + '<button data-edit="'+d.id+'" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✏️</button>'
            + '<button data-del="'+d.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✕</button>'
            + '</div></div>'
            + (words.length ? '<button class="btn full" data-play="'+d.id+'" style="font-size:12px;padding:10px">▶ Üben ('+words.length+' Vokabeln)</button>' : '<div style="text-align:center;color:var(--text-mute);font-size:11px">Deck ist leer</div>')
            + '</div>';
        });
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#vAdd").addEventListener("click", function(){ view.screen="edit"; view.editId=null; build(); });
      container.querySelectorAll("[data-edit]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen="edit"; view.editId=el.dataset.edit; build(); });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Deck löschen?")) return;
          saveDecks(getDecks().filter(function(d){ return d.id !== el.dataset.del; })); screenList();
        });
      });
      container.querySelectorAll("[data-play]").forEach(function(el){
        el.addEventListener("click", function(){
          var d = getDecks().find(function(x){ return x.id === el.dataset.play; });
          if(!d || !d.words || !d.words.length) return;
          session = { deck:d, queue: shuffle(d.words.slice()), idx:0, correct:0, wrong:0, answered:false, selected:null };
          view.screen = "quiz"; build();
        });
      });
    }

    function screenEdit(){
      var isEdit = !!view.editId;
      var d = isEdit ? getDecks().find(function(x){ return x.id === view.editId; }) : { name:"", from:"", to:"", words:[] };
      if(!d) return screenList();
      var words = (d.words||[]).slice();

      function renderForm(){
        var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
          + '<div class="card"><h3>'+(isEdit?"Bearbeiten":"Neues Deck")+'</h3>'
          + '<div class="field"><label>Deck-Name</label><input id="v-name" value="'+_esc(d.name)+'" placeholder="z.B. Spanisch Basics" maxlength="60"></div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + '<div class="field"><label>Von Sprache</label><input id="v-from" value="'+_esc(d.from||"")+'" placeholder="z.B. Spanisch"></div>'
          + '<div class="field"><label>Nach Sprache</label><input id="v-to" value="'+_esc(d.to||"")+'" placeholder="z.B. Deutsch"></div>'
          + '</div>'
          + '<div class="field"><label>Vokabeln ('+words.length+')</label>'
          + '<div style="display:flex;gap:4px;margin-bottom:6px">'
          + '<input id="v-word1" placeholder="Vorderseite" style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;font-size:11.5px">'
          + '<input id="v-word2" placeholder="Rückseite" style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;font-size:11.5px">'
          + '<button id="v-wordAdd" style="padding:8px 12px;background:rgba(77,208,225,.2);border:1px solid rgba(77,208,225,.4);color:#4dd0e1;border-radius:6px;cursor:pointer;font-weight:900;font-size:12px;font-family:inherit">+</button>'
          + '</div>'
          + '<div id="v-list">'
          + words.map(function(w,i){
              return '<div style="display:flex;justify-content:space-between;padding:6px 8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:3px;font-size:11px"><span><b>'+_esc(w.a)+'</b> → '+_esc(w.b)+'</span><button data-delw="'+i+'" style="background:transparent;border:none;color:#ff8080;font-size:11px;cursor:pointer">✕</button></div>';
            }).join('')
          + '</div></div>'
          + '<button class="btn full" id="v-save">💾 Speichern</button></div>';
        container.innerHTML = html;
        bindForm();
      }

      function bindForm(){
        container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="list"; build(); });
        container.querySelectorAll("[data-delw]").forEach(function(el){
          el.addEventListener("click", function(){ words.splice(parseInt(el.dataset.delw),1); renderForm(); });
        });
        container.querySelector("#v-wordAdd").addEventListener("click", function(){
          var a = container.querySelector("#v-word1").value.trim();
          var b = container.querySelector("#v-word2").value.trim();
          if(!a || !b){ alert("Beide Felder ausfüllen"); return; }
          words.push({ a:a, b:b }); renderForm();
        });
        container.querySelector("#v-word2").addEventListener("keydown", function(e){
          if(e.key === "Enter") container.querySelector("#v-wordAdd").click();
        });
        container.querySelector("#v-save").addEventListener("click", function(){
          var name = container.querySelector("#v-name").value.trim();
          if(!name){ alert("Name fehlt"); return; }
          var list = getDecks();
          var data = { name:name, from:container.querySelector("#v-from").value.trim(), to:container.querySelector("#v-to").value.trim(), words:words };
          if(isEdit){
            var ex = list.find(function(x){ return x.id === view.editId; });
            if(ex) Object.assign(ex, data);
          } else {
            data.id = "v"+Date.now(); data.created = Date.now(); list.push(data);
          }
          saveDecks(list);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
          view.screen = "list"; build();
        });
      }
      renderForm();
    }

    function screenQuiz(){
      var s = session;
      if(!s || s.idx >= s.queue.length){ finishQuiz(); return; }
      var w = s.queue[s.idx];
      // Shuffle direction
      var flip = Math.random() < 0.5;
      var qText = flip ? w.b : w.a;
      var aText = flip ? w.a : w.b;
      var deck = s.deck;
      var qLang = flip ? (deck.to || "Rückseite") : (deck.from || "Vorderseite");
      var aLang = flip ? (deck.from || "Vorderseite") : (deck.to || "Rückseite");

      var html = '<button data-quit style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.1),rgba(180,120,255,.1))">'
        + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-mute);margin-bottom:8px">'
        + '<span>Karte '+(s.idx+1)+' / '+s.queue.length+'</span>'
        + '<span>✅ '+s.correct+' · ❌ '+s.wrong+'</span>'
        + '</div>'
        + '<div style="height:4px;background:rgba(0,0,0,.3);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+(s.idx/s.queue.length*100)+'%;background:linear-gradient(90deg,#4dd0e1,#b478ff);transition:width .3s"></div></div>'
        + '</div>';

      html += '<div class="card">'
        + '<div style="text-align:center;padding:24px 14px;min-height:120px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;letter-spacing:1px">'+_esc(qLang)+'</div>'
        + '<div style="font-size:22px;font-weight:900;color:#4dd0e1;margin-top:10px">'+_esc(qText)+'</div>'
        + '</div>';

      if(!s.answered){
        html += '<div class="field"><input id="v-answer" placeholder="Deine Antwort..." style="font-size:14px;padding:12px" autocomplete="off" autocorrect="off" autocapitalize="off"></div>'
          + '<button class="btn full" id="v-check" style="padding:14px">Prüfen</button>';
      } else {
        var correct = s.lastCorrect;
        html += '<div style="padding:14px;background:'+(correct?'rgba(74,222,128,.1)':'rgba(255,128,128,.1)')+';border:1px solid '+(correct?'#4ade80':'#ff8080')+';border-radius:10px;text-align:center">'
          + '<div style="font-size:16px;font-weight:900;color:'+(correct?'#4ade80':'#ff8080')+'">'+(correct?'✅ Richtig!':'❌ Falsch')+'</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">'+_esc(aLang)+'</div>'
          + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:4px">'+_esc(aText)+'</div>'
          + '<button class="btn full" id="v-next" style="margin-top:10px">Weiter →</button>'
          + '</div>';
      }
      html += '</div>';

      container.innerHTML = html;
      container.querySelector("[data-quit]").addEventListener("click", function(){ session=null; view.screen="list"; build(); });
      if(!s.answered){
        var inp = container.querySelector("#v-answer");
        inp.focus();
        container.querySelector("#v-check").addEventListener("click", function(){ checkAnswer(aText); });
        inp.addEventListener("keydown", function(e){ if(e.key === "Enter") checkAnswer(aText); });
      } else {
        container.querySelector("#v-next").addEventListener("click", function(){ s.idx++; s.answered = false; build(); });
      }
    }

    function checkAnswer(correct){
      var inp = container.querySelector("#v-answer");
      var ans = (inp.value||"").trim().toLowerCase();
      var cor = correct.toLowerCase();
      var isCorrect = ans === cor || (ans.length > 2 && (cor.indexOf(ans) >= 0 || ans.indexOf(cor) >= 0));
      if(isCorrect) session.correct++; else session.wrong++;
      session.answered = true;
      session.lastCorrect = isCorrect;
      // Update global stats
      var stats = getStats();
      if(isCorrect) stats.correct++; else stats.wrong++;
      saveStats(stats);
      build();
    }

    function finishQuiz(){
      var pct = Math.round(session.correct / session.queue.length * 100);
      var color = pct >= 80 ? "#4ade80" : pct >= 50 ? "#ffd54f" : "#ff8080";
      var emoji = pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "💪";
      var html = '<div class="card" style="text-align:center;padding:30px;background:linear-gradient(135deg,rgba(77,208,225,.1),rgba(180,120,255,.1))">'
        + '<div style="font-size:64px">'+emoji+'</div>'
        + '<div style="font-size:42px;font-weight:900;color:'+color+';line-height:1;margin-top:6px">'+pct+'%</div>'
        + '<div style="font-size:14px;font-weight:900;color:'+color+';margin-top:4px">'+session.correct+' / '+session.queue.length+' richtig</div>'
        + '</div>'
        + '<div class="card" style="display:flex;gap:6px">'
        + '<button class="btn" id="v-again" style="flex:1">🔄 Nochmal</button>'
        + '<button class="btn sec" id="v-menu" style="flex:1">🏠 Menü</button>'
        + '</div>';
      container.innerHTML = html;
      container.querySelector("#v-again").addEventListener("click", function(){
        session = { deck:session.deck, queue: shuffle(session.deck.words.slice()), idx:0, correct:0, wrong:0, answered:false };
        build();
      });
      container.querySelector("#v-menu").addEventListener("click", function(){ session=null; view.screen="list"; build(); });
      view.screen = "result";
    }

    build();
  }

  HalDoApp("vokabeln", { name: "Vokabeln", icon: "🗣️", render: render, category: "bildung" });
  console.log("🦚 vokabeln.js v1.0 geladen");
})();
