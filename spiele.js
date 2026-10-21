/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SPIELE (v300)
   Tic-Tac-Toe · Zahlenraten
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "auswahl");

    function build(){
      var body = '';
      body += '<div class="tabs">'
        + '<button class="tab'+(tab==="auswahl"?" active":"")+'" data-gmt="auswahl">🎮 Auswahl</button>'
        + '<button class="tab'+(tab==="ttt"?" active":"")+'" data-gmt="ttt">❌⭕</button>'
        + '<button class="tab'+(tab==="guess"?" active":"")+'" data-gmt="guess">🔢</button>'
        + '</div>';

      if(tab === "auswahl") {
        body += '<div class="card" style="text-align:center;padding:30px">'
          + '<div style="font-size:48px">🎮</div>'
          + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:10px">Wähle ein Spiel oben aus</div>'
          + '</div>';
      }

      if(tab === "ttt") {
        var board = store.get("tttBoard", Array(9).fill(null));
        var turn = store.get("tttTurn", "X");
        var winner = checkWinner(board);

        body += '<div class="card" style="text-align:center">';
        if(winner === "X") body += '<div style="font-size:20px;font-weight:900;color:#4ade80">🎉 Du gewinnst!</div>';
        else if(winner === "O") body += '<div style="font-size:20px;font-weight:900;color:#ff8080">😢 Computer gewinnt</div>';
        else if(winner === "tie") body += '<div style="font-size:20px;font-weight:900;color:var(--text-mute)">🤝 Unentschieden</div>';
        else body += '<div style="font-size:13px;color:var(--text-dim)">Du bist: ' + turn + '</div>';

        body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:300px;margin:16px auto">';
        board.forEach((cell, i) => {
          body += '<button data-ttt="'+i+'" style="aspect-ratio:1;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:10px;font-size:32px;cursor:pointer;color:var(--p1);font-weight:900">' + (cell || "") + '</button>';
        });
        body += '</div>'
          + '<button class="btn full" id="tttReset">🔄 Neu starten</button>'
          + '</div>';
      }

      if(tab === "guess") {
        var target = store.get("guessTarget", null);
        var attempts = store.get("guessAttempts", 0);
        var history = store.get("guessHistory", []);
        var won = store.get("guessWon", false);

        if(target === null) { store.set("guessTarget", Math.floor(Math.random()*100)+1); build(); return; }

        body += '<div class="card" style="text-align:center">'
          + '<div style="font-size:12px;color:var(--text-mute)">Versuche: ' + attempts + '</div>';

        if(won) {
          body += '<div style="font-size:32px;margin-top:10px">🎉</div>'
            + '<div style="font-size:16px;font-weight:900;color:#4ade80">Richtig! Die Zahl war ' + target + '</div>';
        } else {
          body += '<div style="display:flex;gap:6px;margin-top:10px">'
            + '<input type="number" id="guessInp" min="1" max="100" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:#fff;text-align:center;font-size:16px">'
            + '<button class="btn" id="guessBtn">Raten</button></div>';
        }

        if(history.length) {
          body += '<div style="margin-top:14px;max-height:200px;overflow-y:auto">';
          history.slice().reverse().forEach(h => {
            body += '<div style="display:flex;justify-content:space-between;padding:6px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:4px;font-size:12px">'
              + '<span>' + h.value + '</span>'
              + '<span style="color:' + (h.hint==="hoch"?"#ff8080":"#fbbf24") + '">' + (h.hint==="hoch"?"⬆️ Höher":"⬇️ Tiefer") + '</span>'
              + '</div>';
          });
          body += '</div>';
        }
        body += '<button class="btn sec full" id="guessReset" style="margin-top:10px">🔄 Neu starten</button></div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-gmt]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.gmt; store.set("tab", tab); build(); });
      });

      if(tab === "ttt") {
        container.querySelectorAll("[data-ttt]").forEach(el => {
          el.addEventListener("click", function(){
            var i = parseInt(this.dataset.ttt);
            var b = store.get("tttBoard", Array(9).fill(null));
            var t = store.get("tttTurn", "X");
            if(b[i] || checkWinner(b)) return;

            b[i] = t;
            var w = checkWinner(b);
            if(!w) {
              var empty = b.map((c, idx) => c ? null : idx).filter(x => x !== null);
              if(empty.length) b[empty[Math.floor(Math.random()*empty.length)]] = "O";
            }
            store.set("tttBoard", b); store.set("tttTurn", t === "X" ? "O" : "X"); build();
          });
        });
        container.querySelector("#tttReset").addEventListener("click", function(){ store.set("tttBoard", Array(9).fill(null)); store.set("tttTurn", "X"); build(); });
      }

      if(tab === "guess") {
        var btn = container.querySelector("#guessBtn");
        if(btn) btn.addEventListener("click", function(){
          var v = parseInt(container.querySelector("#guessInp").value);
          if(!v || v < 1 || v > 100) return;
          var tgt = store.get("guessTarget", 50);
          var att = store.get("guessAttempts", 0) + 1;
          var hist = store.get("guessHistory", []);
          
          if(v === tgt) { store.set("guessWon", true); }
          else { hist.push({ value: v, hint: v < tgt ? "hoch" : "runter" }); }
          
          store.set("guessAttempts", att); store.set("guessHistory", hist); build();
        });
        container.querySelector("#guessReset").addEventListener("click", function(){ store.set("guessTarget", null); store.set("guessAttempts", 0); store.set("guessHistory", []); store.set("guessWon", false); build(); });
      }
    }

    function checkWinner(b) {
      var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(var i=0;i<lines.length;i++) {
        var l = lines[i];
        if(b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
      }
      return b.every(c => c) ? "tie" : null;
    }

    build();
  }

  HalDoApp("spiele", { name: "Spiele", icon: "🎮", render: render, category: "werkzeuge" });
  console.log("🦚 spiele.js v300 geladen");
})();
