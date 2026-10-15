/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LERNEN (v153)
   Lernkarten · Quiz · Kategorien · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "karten");

    function build(){
      var body = "";

      if(tab === "karten"){
        var decks = store.get("decks", []);
        body = '<div class="card"><h3>📚 Lernkarten (' + decks.length + ')</h3>'
          + '<button class="btn full" id="newDeck" style="margin-bottom:10px">+ Neues Deck</button>';

        if(!decks.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Decks</div>';
        } else {
          decks.forEach(function(d, i){
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p3)">'
              + '<div style="display:flex;justify-content:space-between;align-items:center">'
              + '<div style="flex:1">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p3)">📚 ' + _esc(d.name) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + (d.cards || []).length + ' Karten</div>'
              + '</div>'
              + '<div style="display:flex;gap:4px">'
              + '<button data-study="' + i + '" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 12px;font-size:11px;font-weight:900">▶ Lernen</button>'
              + '<button data-deld="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "lernen"){
        var currentDeckIdx = store.get("currentDeck", null);
        var decks2 = store.get("decks", []);
        var idx = store.get("cardIdx", 0);
        var flipped = store.get("flipped", false);

        if(currentDeckIdx === null || !decks2[currentDeckIdx]){
          body = '<div class="card"><h3>🎓 Lernen</h3><div style="color:var(--text-mute);text-align:center;padding:20px">Wähle ein Deck</div></div>';
        } else {
          var deck = decks2[currentDeckIdx];
          var cards = deck.cards || [];
          if(!cards.length){
            body = '<div class="card"><h3>📚 ' + _esc(deck.name) + '</h3><div style="color:var(--text-mute);text-align:center;padding:20px">Dieses Deck hat noch keine Karten</div></div>';
          } else {
            if(idx >= cards.length) idx = 0;
            var card = cards[idx];

            body = '<div class="card">'
              + '<div style="font-size:10px;color:var(--text-mute);text-align:center;font-weight:800;margin-bottom:10px">KARTE ' + (idx + 1) + ' / ' + cards.length + '</div>'
              + '<div id="cardBox" style="padding:40px 20px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;cursor:pointer;border:1.5px solid var(--p1);min-height:200px;display:flex;align-items:center;justify-content:center">'
              + '<div style="font-size:18px;font-weight:900;color:var(--p1);line-height:1.5">'
              + _esc(flipped ? card.back : card.front)
              + '</div></div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);text-align:center;margin-top:8px">' + (flipped ? "Antwort" : "Klick zum Umdrehen") + '</div>'
              + '<div style="display:flex;gap:6px;margin-top:14px">'
              + '<button class="btn sec" data-nav="prev" style="flex:1">⏮</button>'
              + '<button class="btn" data-nav="flip" style="flex:2">🔄 Umdrehen</button>'
              + '<button class="btn sec" data-nav="next" style="flex:1">⏭</button>'
              + '</div>'
              + '<button class="btn sec full" id="endStudy" style="margin-top:8px;font-size:11px">✕ Beenden</button>'
              + '</div>';
          }
        }
      }

      else if(tab === "add"){
        var decks3 = store.get("decks", []);
        var selDeck = store.get("selDeck", decks3.length ? 0 : -1);
        body = '<div class="card"><h3>➕ Neue Karte</h3>'
          + '<div class="field"><label>Deck</label>'
          + '<select id="cdDeck" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + decks3.map(function(d, i){ return '<option value="' + i + '"' + (selDeck === i ? " selected" : "") + '>' + _esc(d.name) + '</option>'; }).join("")
          + '</select></div>'
          + '<div class="field"><label>Vorderseite (Frage)</label><textarea id="cdFront" placeholder="Frage / Begriff" rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical"></textarea></div>'
          + '<div class="field"><label>Rückseite (Antwort)</label><textarea id="cdBack" placeholder="Antwort" rows="3" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical"></textarea></div>'
          + '<button class="btn full" id="cdSave">💾 Karte speichern</button>'
          + '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📚 DECKS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p3)">' + store.get("decks", []).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="lClear" style="margin-top:10px">🗑️ Alle Decks löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="karten"?" active":"") + '" data-lnt="karten">📚 Decks</button>'
        + '<button class="tab' + (tab==="lernen"?" active":"") + '" data-lnt="lernen">🎓 Lernen</button>'
        + '<button class="tab' + (tab==="add"?" active":"") + '" data-lnt="add">➕ Karte</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-lnt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-lnt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.lnt; store.set("tab", tab); build();
        });
      });

      if(tab === "karten"){
        var nd = container.querySelector("#newDeck");
        if(nd) nd.addEventListener("click", function(){
          var name = prompt("Deck-Name:");
          if(!name) return;
          var decks4 = store.get("decks", []);
          decks4.push({ name: name, cards: [], date: new Date().toLocaleString("de-DE") });
          store.set("decks", decks4);
          build();
        });
        container.querySelectorAll("[data-study]").forEach(function(el){
          el.addEventListener("click", function(){
            store.set("currentDeck", parseInt(el.dataset.study));
            store.set("cardIdx", 0);
            store.set("flipped", false);
            tab = "lernen"; store.set("tab", tab);
            build();
          });
        });
        container.querySelectorAll("[data-deld]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Deck löschen?")) return;
            var decks5 = store.get("decks", []);
            decks5.splice(parseInt(el.dataset.deld), 1);
            store.set("decks", decks5);
            build();
          });
        });
      }

      if(tab === "lernen"){
        var box = container.querySelector("#cardBox");
        if(box) box.addEventListener("click", function(){
          store.set("flipped", !store.get("flipped", false));
          build();
        });
        container.querySelectorAll("[data-nav]").forEach(function(el){
          el.addEventListener("click", function(){
            var action = el.dataset.nav;
            var currentDeckIdx2 = store.get("currentDeck", 0);
            var decks6 = store.get("decks", []);
            var cards2 = decks6[currentDeckIdx2].cards || [];
            var idx2 = store.get("cardIdx", 0);

            if(action === "next") idx2 = (idx2 + 1) % cards2.length;
            else if(action === "prev") idx2 = (idx2 - 1 + cards2.length) % cards2.length;
            else if(action === "flip") store.set("flipped", !store.get("flipped", false));

            store.set("cardIdx", idx2);
            build();
          });
        });
        var endBtn = container.querySelector("#endStudy");
        if(endBtn) endBtn.addEventListener("click", function(){
          store.set("currentDeck", null);
          tab = "karten"; store.set("tab", tab);
          build();
        });
      }

      if(tab === "add"){
        var saveBtn = container.querySelector("#cdSave");
        if(saveBtn) saveBtn.addEventListener("click", function(){
          var deckIdx = parseInt(container.querySelector("#cdDeck").value);
          var front = container.querySelector("#cdFront").value.trim();
          var back = container.querySelector("#cdBack").value.trim();
          if(!front || !back){ alert("Beide Seiten sind Pflicht"); return; }
          var decks7 = store.get("decks", []);
          if(!decks7[deckIdx]){ alert("Kein Deck vorhanden"); return; }
          decks7[deckIdx].cards.push({ front: front, back: back });
          store.set("decks", decks7);
          if(HalDo.Notify) HalDo.Notify.success("Karte gespeichert", { app: "lerne" });
          container.querySelector("#cdFront").value = "";
          container.querySelector("#cdBack").value = "";
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#lClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Decks löschen?")) return;
          store.set("decks", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("lerne", { name: "Lernen", icon: "📚", render: render, category: "werkzeuge" });
  console.log("🦚 lerne.js geladen");
})();
