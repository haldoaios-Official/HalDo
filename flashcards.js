/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — FLASHCARDS (v1.0)
   Karteikarten · Leitner-System (5 Boxen) · Wiederholung
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function shuffle(a){ var r = a.slice(); for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i]; r[i]=r[j]; r[j]=t; } return r; }
  function today(){ return new Date().toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list" };

    function getCards(){ return store.get("cards", []); }
    function saveCards(c){ store.set("cards", c); }

    function build(){
      if(view.screen === "edit") screenEdit();
      else if(view.screen === "quiz") screenQuiz();
      else screenList();
    }

    function screenList(){
      var cards = getCards();
      var boxes = [0,0,0,0,0];
      cards.forEach(function(c){ boxes[c.box||0]++; });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(255,213,79,.15),rgba(180,120,255,.1));border:1px solid rgba(255,213,79,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#ffd54f">📇 Karteikarten</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+cards.length+' Karten · Leitner-System</div></div>'
        + '<button class="btn" id="fcAdd" style="padding:10px 14px">➕</button>'
        + '</div></div>';

      // Box stats
      html += '<div class="card"><h3>📦 Boxen (Leitner)</h3>'
        + '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">';
      [1,2,3,4,5].forEach(function(box, i){
        var count = boxes[i];
        html += '<div style="padding:10px 4px;background:rgba(0,0,0,.2);border-radius:8px;text-align:center;border-top:2px solid '+(box<=2?"#ff8080":box===3?"#ffd54f":"#4ade80")+'">'
          + '<div style="font-size:20px;font-weight:900;color:'+(count ? "#4dd0e1" : "var(--text-mute)")+'">'+count+'</div>'
          + '<div style="font-size:9px;color:var(--text-mute)">Box '+box+'</div>'
          + '</div>';
      });
      html += '</div>'
        + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:8px;line-height:1.5">Richtig → nächste Box · Falsch → zurück zu Box 1</div>'
        + '</div>';

      // Due today
      var due = cards.filter(function(c){
        if(!c.due) return true;
        return c.due <= today();
      });

      if(due.length){
        html += '<div class="card" style="text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">'+due.length+' Karten fällig</div>'
          + '<button class="btn full" data-start style="padding:14px;font-size:14px">▶ Heute üben</button>'
          + '</div>';
      }

      // Cards list
      if(cards.length){
        html += '<div class="card"><h3>Alle Karten</h3>';
        cards.forEach(function(c, i){
          html += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid '+(c.box>=4?'#4ade80':c.box>=3?'#ffd54f':'#ff8080')+'">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12px;font-weight:900">'+_esc(c.front)+'</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">→ '+_esc(c.back)+'</div>'
            + '<div style="font-size:9px;color:var(--text-mute);margin-top:2px">Box '+(c.box||0)+' · fällig: '+(c.due||"—")+'</div>'
            + '</div>'
            + '<button data-del="'+i+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:4px 8px;font-size:10px;cursor:pointer;flex-shrink:0">✕</button>'
            + '</div></div>';
        });
        html += '</div>';
      } else {
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📇</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Noch keine Karten</div></div>';
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#fcAdd").addEventListener("click", function(){ view.screen="edit"; view.editId=null; build(); });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Karte löschen?")) return;
          var cards = getCards(); cards.splice(parseInt(el.dataset.del),1); saveCards(cards); screenList();
        });
      });
      var sb = container.querySelector("[data-start]");
      if(sb) sb.addEventListener("click", function(){
        var cards = getCards();
        var due = cards.filter(function(c){ return !c.due || c.due <= today(); });
        if(!due.length) return;
        view.screen = "quiz";
        view.queue = shuffle(due.map(function(c){ return c.id; }));
        view.idx = 0; view.showBack = false;
        screenQuiz();
      });
    }

    function screenEdit(){
      var isEdit = !!view.editId;
      var cards = getCards();
      var card = isEdit ? cards.find(function(c){ return c.id === view.editId; }) : { front:"", back:"" };
      if(!card) return screenList();
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>'+(isEdit?"Karte bearbeiten":"Neue Karte")+'</h3>'
        + '<div class="field"><label>Vorderseite</label><textarea id="fc-front" rows="3" placeholder="Frage..." style="resize:vertical">'+_esc(card.front)+'</textarea></div>'
        + '<div class="field"><label>Rückseite</label><textarea id="fc-back" rows="3" placeholder="Antwort..." style="resize:vertical">'+_esc(card.back)+'</textarea></div>'
        + '<button class="btn full" id="fc-save">💾 Speichern</button></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="list"; build(); });
      container.querySelector("#fc-save").addEventListener("click", function(){
        var front = container.querySelector("#fc-front").value.trim();
        var back = container.querySelector("#fc-back").value.trim();
        if(!front || !back){ alert("Beide Seiten ausfüllen"); return; }
        var list = getCards();
        if(isEdit){
          var ex = list.find(function(c){ return c.id === view.editId; });
          if(ex){ ex.front = front; ex.back = back; }
        } else {
          list.push({ id:"fc"+Date.now(), front:front, back:back, box:0, due:today(), created:Date.now() });
        }
        saveCards(list);
        if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
        view.screen = "list"; build();
      });
    }

    function screenQuiz(){
      if(view.idx >= view.queue.length){ finishQuiz(); return; }
      var cards = getCards();
      var card = cards.find(function(c){ return c.id === view.queue[view.idx]; });
      if(!card){ view.idx++; return screenQuiz(); }

      var html = '<button data-quit style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card" style="background:linear-gradient(135deg,rgba(255,213,79,.1),rgba(180,120,255,.1))">'
        + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-mute)">'
        + '<span>Karte '+(view.idx+1)+' / '+view.queue.length+'</span>'
        + '<span>Box '+(card.box||0)+'</span>'
        + '</div></div>';

      html += '<div class="card" style="text-align:center;padding:30px 14px;min-height:200px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center" data-flip>'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;letter-spacing:1px;margin-bottom:12px">'+(view.showBack?"ANTWORT":"FRAGE")+'</div>'
        + '<div style="font-size:18px;font-weight:900;color:#4dd0e1;line-height:1.4">'+_esc(view.showBack ? card.back : card.front)+'</div>'
        + (view.showBack ? '' : '<div style="font-size:10px;color:var(--text-mute);margin-top:16px">👆 Tippen für Antwort</div>')
        + '</div>';

      if(view.showBack){
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">'
          + '<button class="btn danger" id="fc-wrong" style="padding:14px">❌ Falsch</button>'
          + '<button class="btn" id="fc-right" style="padding:14px">✅ Richtig</button>'
          + '</div>';
      }

      container.innerHTML = html;
      container.querySelector("[data-quit]").addEventListener("click", function(){ view.screen="list"; build(); });
      container.querySelector("[data-flip]").addEventListener("click", function(){ view.showBack = true; screenQuiz(); });
      var wr = container.querySelector("#fc-wrong");
      var ri = container.querySelector("#fc-right");
      if(wr) wr.addEventListener("click", function(){ updateCard(card, false); });
      if(ri) ri.addEventListener("click", function(){ updateCard(card, true); });
    }

    function updateCard(card, correct){
      var cards = getCards();
      var ex = cards.find(function(c){ return c.id === card.id; });
      if(!ex) return;
      var intervals = [1, 2, 4, 8, 16]; // Tage für Box 1-5
      if(correct){
        ex.box = Math.min(5, (ex.box||0) + 1);
      } else {
        ex.box = 1;
      }
      var nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + intervals[(ex.box||1) - 1]);
      ex.due = nextDate.toISOString().split("T")[0];
      saveCards(cards);
      view.idx++;
      view.showBack = false;
      screenQuiz();
    }

    function finishQuiz(){
      view.screen = "list";
      if(HalDo.Notify) HalDo.Notify.success("Runde abgeschlossen! 🎉");
      screenList();
    }

    build();
  }

  HalDoApp("flashcards", { name: "Karteikarten", icon: "📇", render: render, category: "bildung" });
  console.log("🦚 flashcards.js v1.0 geladen");
})();
