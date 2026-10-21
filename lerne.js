/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LERNEN (v300)
   Lernkarten · Quiz
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "decks");

    function build(){
      var body = '';
      body += '<div class="tabs">'
        + '<button class="tab'+(tab==="decks"?" active":"")+'" data-lt="decks">📚 Decks</button>'
        + '<button class="tab'+(tab==="study"?" active":"")+'" data-lt="study">🎓 Lernen</button>'
        + '</div>';

      if(tab === "decks") {
        var decks = store.get("decks", []);
        body += '<div class="card">'
          + '<button class="btn full" id="dAdd" style="margin-bottom:10px">+ Deck erstellen</button>';
        decks.forEach((d, i) => {
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p3)">'
            + '<div style="display:flex;justify-content:space-between">'
            + '<div style="font-size:13px;font-weight:900;color:var(--p3)">📚 ' + _esc(d.name) + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">' + (d.cards||[]).length + ' Karten</div>'
            + '</div>'
            + '<button data-study="'+i+'" style="width:100%;margin-top:8px;padding:6px;background:var(--p1);color:#000;border:none;border-radius:6px;font-weight:900;cursor:pointer">▶ Lernen</button>'
            + '</div>';
        });
        body += '</div>';
      }

      if(tab === "study") {
        var curIdx = store.get("currentDeck", null);
        var decks = store.get("decks", []);
        if(curIdx === null || !decks[curIdx]) {
          body += '<div class="card"><div style="text-align:center;padding:20px;color:var(--text-mute)">Wähle ein Deck im Tab "Decks"</div></div>';
        } else {
          var deck = decks[curIdx];
          var cards = deck.cards || [];
          if(!cards.length) {
            body += '<div class="card"><div style="text-align:center;padding:20px;color:var(--text-mute)">Dieses Deck hat keine Karten</div></div>';
          } else {
            var cIdx = store.get("cardIdx", 0) % cards.length;
            var flipped = store.get("flipped", false);
            var card = cards[cIdx];

            body += '<div class="card">'
              + '<div style="font-size:10px;text-align:center;color:var(--text-mute);margin-bottom:10px">Karte ' + (cIdx+1) + ' / ' + cards.length + '</div>'
              + '<div id="studyCard" style="padding:40px 20px;background:rgba(0,0,0,.3);border-radius:12px;text-align:center;cursor:pointer;min-height:150px;display:flex;align-items:center;justify-content:center">'
              + '<div style="font-size:18px;font-weight:900;color:var(--p1)">' + _esc(flipped ? card.back : card.front) + '</div>'
              + '</div>'
              + '<div style="display:flex;gap:6px;margin-top:12px">'
              + '<button class="btn sec" data-nav="prev" style="flex:1">⏮</button>'
              + '<button class="btn" data-nav="flip" style="flex:2">🔄 Umdrehen</button>'
              + '<button class="btn sec" data-nav="next" style="flex:1">⏭</button>'
              + '</div></div>';
          }
        }
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-lt]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.lt; store.set("tab", tab); build(); });
      });

      if(tab === "decks") {
        container.querySelector("#dAdd").addEventListener("click", function(){
          var name = prompt("Name des Decks:"); if(!name) return;
          var d = store.get("decks", []); d.push({ name: name, cards: [] }); store.set("decks", d); build();
        });
        container.querySelectorAll("[data-study]").forEach(el => {
          el.addEventListener("click", function(){
            store.set("currentDeck", parseInt(el.dataset.study)); store.set("cardIdx", 0); store.set("flipped", false); tab = "study"; store.set("tab", tab); build();
          });
        });
      }

      if(tab === "study") {
        var cardEl = container.querySelector("#studyCard");
        if(cardEl) cardEl.addEventListener("click", function(){ store.set("flipped", !store.get("flipped",false)); build(); });
        
        container.querySelectorAll("[data-nav]").forEach(el => {
          el.addEventListener("click", function(){
            var action = el.dataset.nav;
            var curIdx2 = store.get("currentDeck", 0);
            var cards2 = store.get("decks", [])[curIdx2].cards || [];
            var cIdx2 = store.get("cardIdx", 0);
            
            if(action === "next") cIdx2 = (cIdx2 + 1) % cards2.length;
            if(action === "prev") cIdx2 = (cIdx2 - 1 + cards2.length) % cards2.length;
            if(action === "flip") store.set("flipped", !store.get("flipped",false));
            
            store.set("cardIdx", cIdx2); build();
          });
        });
      }
    }
    build();
  }

  HalDoApp("lerne", { name: "Lernen", icon: "📚", render: render, category: "werkzeuge" });
  console.log("🦚 lerne.js v300 geladen");
})();
