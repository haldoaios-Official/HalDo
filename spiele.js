/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SPIELE (v153)
   Tic-Tac-Toe · Memory · Zahlenraten · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "auswahl");

    function build(){
      var body = "";

      if(tab === "auswahl"){
        var scores = store.get("scores", { ttt: 0, memory: 0, guess: 0 });
        body = '<div class="card"><h3>🎮 Spiele</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px"><div style="font-size:10px;color:var(--text-mute);font-weight:700">🏆 GEWONNEN</div><div style="font-size:20px;font-weight:900;color:var(--p1)">' + (scores.ttt + scores.memory + scores.guess) + '</div></div>'
          + '</div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'
          + gameCard("ttt", "❌⭕", "Tic-Tac-Toe")
          + gameCard("memory", "🧠", "Memory")
          + gameCard("guess", "🔢", "Zahlenraten")
          + '</div></div>';
      }

      else if(tab === "ttt"){
        var board = store.get("tttBoard", Array(9).fill(null));
        var turn = store.get("tttTurn", "X");
        var winner = getTTTWinner(board);

        body = '<div class="card"><h3>❌⭕ Tic-Tac-Toe</h3>';
        if(winner === "X") body += '<div style="text-align:center;padding:12px;color:#4ade80;font-size:16px;font-weight:900">🎉 Du hast gewonnen!</div>';
        else if(winner === "O") body += '<div style="text-align:center;padding:12px;color:#ff8080;font-size:16px;font-weight:900">😢 Computer gewinnt</div>';
        else if(winner === "tie") body += '<div style="text-align:center;padding:12px;color:var(--text-mute);font-size:16px;font-weight:900">🤝 Unentschieden</div>';
        else body += '<div style="text-align:center;padding:8px;color:var(--text-dim);font-size:12px">Du bist ' + turn + '</div>';

        body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:280px;margin:14px auto">';
        board.forEach(function(cell, i){
          body += '<button data-cell="' + i + '" style="aspect-ratio:1;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:10px;font-size:36px;cursor:pointer;color:var(--p1);font-weight:900">' + (cell || "") + '</button>';
        });
        body += '</div>'
          + '<button class="btn full" id="tttReset">🔄 Neu starten</button>'
          + '</div>';
      }

      else if(tab === "memory"){
        var memBoard = store.get("memBoard", []);
        var memFlipped = store.get("memFlipped", []);
        var memMatched = store.get("memMatched", []);
        var memMoves = store.get("memMoves", 0);

        if(!memBoard.length){
          var emojis = ["🦚","🐶","🐱","🐭","🐹","🐰","🦊","🐻"];
          var cards = emojis.concat(emojis).map(function(e, i){ return { id: i, emoji: e }; });
          for(var i = cards.length - 1; i > 0; i--){
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
          }
          store.set("memBoard", cards);
          memBoard = cards;
        }

        body = '<div class="card"><h3>🧠 Memory</h3>'
          + '<div style="text-align:center;font-size:12px;color:var(--text-dim);margin-bottom:10px">Züge: ' + memMoves + ' · Paare: ' + (memMatched.length / 2) + '/8</div>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
        memBoard.forEach(function(c, i){
          var isFlipped = memFlipped.indexOf(i) !== -1 || memMatched.indexOf(i) !== -1;
          body += '<button data-mem="' + i + '" style="aspect-ratio:1;background:' + (isFlipped ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.3)") + ';border:1px solid var(--border-soft);border-radius:10px;font-size:26px;cursor:pointer;color:#000">' + (isFlipped ? c.emoji : "❓") + '</button>';
        });
        body += '</div>'
          + '<button class="btn full" id="memReset" style="margin-top:12px">🔄 Neu starten</button>'
          + '</div>';
      }

      else if(tab === "guess"){
        var target = store.get("guessTarget", null);
        var attempts = store.get("guessAttempts", 0);
        var history = store.get("guessHistory", []);
        var won = store.get("guessWon", false);

        if(target === null){
          var t = Math.floor(Math.random() * 100) + 1;
          store.set("guessTarget", t);
          target = t;
        }

        body = '<div class="card"><h3>🔢 Zahlenraten (1-100)</h3>'
          + '<div style="text-align:center;padding:12px;font-size:12px;color:var(--text-dim)">Versuche: ' + attempts + '</div>';

        if(won){
          body += '<div style="text-align:center;padding:20px;background:rgba(74,222,128,.1);border-radius:12px;margin-bottom:12px">'
            + '<div style="font-size:48px">🎉</div>'
            + '<div style="font-size:16px;font-weight:900;color:#4ade80">Richtig! Die Zahl war ' + target + '</div>'
            + '<div style="font-size:12px;color:var(--text-mute);margin-top:6px">In ' + attempts + ' Versuchen</div>'
            + '</div>';
        } else {
          body += '<div style="display:flex;gap:6px;margin-bottom:12px">'
            + '<input type="number" id="guessInp" min="1" max="100" placeholder="1-100" style="flex:1;padding:12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:16px;text-align:center">'
            + '<button class="btn" id="guessBtn" style="padding:0 20px">Raten</button>'
            + '</div>';
        }

        if(history.length){
          body += '<div style="max-height:200px;overflow-y:auto">';
          history.slice().reverse().forEach(function(h){
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;font-size:12px">'
              + '<span style="font-weight:900">' + h.value + '</span>'
              + '<span style="color:' + (h.hint === "hoch" ? "#ff8080" : "#fbbf24") + '">' + (h.hint === "hoch" ? "⬆️ höher" : "⬇️ niedriger") + '</span>'
              + '</div>';
          });
          body += '</div>';
        }

        body += '<button class="btn sec full" id="guessReset" style="margin-top:12px">🔄 Neu starten</button></div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🎮 SPIELE</div>'
          + '<div style="font-size:14px;color:var(--text-dim)">3 Spiele verfügbar</div>'
          + '</div>'
          + '<button class="btn danger full" id="gClear" style="margin-top:10px">🗑️ Statistiken löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="auswahl"?" active":"") + '" data-gmt="auswahl">🎮 Auswahl</button>'
        + '<button class="tab' + (tab==="ttt"?" active":"") + '" data-gmt="ttt">❌⭕</button>'
        + '<button class="tab' + (tab==="memory"?" active":"") + '" data-gmt="memory">🧠</button>'
        + '<button class="tab' + (tab==="guess"?" active":"") + '" data-gmt="guess">🔢</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-gmt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-gmt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.gmt; store.set("tab", tab); build();
        });
      });

      if(tab === "ttt"){
        container.querySelectorAll("[data-cell]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.cell);
            var board2 = store.get("tttBoard", Array(9).fill(null));
            var turn2 = store.get("tttTurn", "X");
            if(board2[i] || getTTTWinner(board2)) return;
            board2[i] = turn2;
            var winner2 = getTTTWinner(board2);
            if(!winner2){
              /* Computer */
              var empty = board2.map(function(c, idx){ return c ? null : idx; }).filter(function(x){ return x !== null; });
              if(empty.length){
                var move = empty[Math.floor(Math.random() * empty.length)];
                board2[move] = "O";
              }
            }
            store.set("tttBoard", board2);
            store.set("tttTurn", turn2 === "X" ? "O" : "X");
            var w = getTTTWinner(board2);
            if(w === "X"){
              var s = store.get("scores", { ttt: 0 });
              s.ttt = (s.ttt || 0) + 1;
              store.set("scores", s);
            }
            build();
          });
        });
        container.querySelector("#tttReset").addEventListener("click", function(){
          store.set("tttBoard", Array(9).fill(null));
          store.set("tttTurn", "X");
          build();
        });
      }

      if(tab === "memory"){
        container.querySelectorAll("[data-mem]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.mem);
            var flipped = store.get("memFlipped", []);
            var matched = store.get("memMatched", []);
            var board3 = store.get("memBoard", []);
            if(flipped.indexOf(i) !== -1 || matched.indexOf(i) !== -1) return;
            if(flipped.length >= 2) return;

            flipped.push(i);
            store.set("memFlipped", flipped);

            if(flipped.length === 2){
              var moves = store.get("memMoves", 0) + 1;
              store.set("memMoves", moves);
              var a = board3[flipped[0]];
              var b = board3[flipped[1]];
              if(a.emoji === b.emoji){
                matched = matched.concat(flipped);
                store.set("memMatched", matched);
                store.set("memFlipped", []);
                if(matched.length === 16){
                  var s = store.get("scores", {});
                  s.memory = (s.memory || 0) + 1;
                  store.set("scores", s);
                }
                build();
              } else {
                build();
                setTimeout(function(){
                  store.set("memFlipped", []);
                  build();
                }, 800);
              }
            } else {
              build();
            }
          });
        });
        var reset = container.querySelector("#memReset");
        if(reset) reset.addEventListener("click", function(){
          store.set("memBoard", []);
          store.set("memFlipped", []);
          store.set("memMatched", []);
          store.set("memMoves", 0);
          build();
        });
      }

      if(tab === "guess"){
        var guessBtn = container.querySelector("#guessBtn");
        if(guessBtn) guessBtn.addEventListener("click", function(){
          var inp = container.querySelector("#guessInp");
          var v = parseInt(inp.value);
          if(!v || v < 1 || v > 100) return;
          var target2 = store.get("guessTarget", 50);
          var attempts2 = store.get("guessAttempts", 0) + 1;
          var history2 = store.get("guessHistory", []);
          if(v === target2){
            store.set("guessWon", true);
            store.set("guessAttempts", attempts2);
            var s2 = store.get("scores", {});
            s2.guess = (s2.guess || 0) + 1;
            store.set("scores", s2);
            if(HalDo.Notify) HalDo.Notify.success("Richtig! 🎉", { app: "spiele" });
          } else {
            history2.push({ value: v, hint: v < target2 ? "hoch" : "runter" });
            store.set("guessHistory", history2);
            store.set("guessAttempts", attempts2);
          }
          build();
        });
        var reset2 = container.querySelector("#guessReset");
        if(reset2) reset2.addEventListener("click", function(){
          store.set("guessTarget", null);
          store.set("guessAttempts", 0);
          store.set("guessHistory", []);
          store.set("guessWon", false);
          build();
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#gClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Statistiken löschen?")) return;
          store.set("scores", { ttt: 0, memory: 0, guess: 0 });
          build();
        });
      }
    }

    function gameCard(id, emoji, name){
      return '<button data-game="' + id + '" style="padding:20px 10px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border:1.5px solid var(--border-soft);border-radius:12px;cursor:pointer;color:inherit;text-align:center;font-family:inherit">'
        + '<div style="font-size:32px">' + emoji + '</div>'
        + '<div style="font-size:11px;font-weight:900;color:var(--p1);margin-top:6px">' + name + '</div>'
        + '</button>';
    }

    function getTTTWinner(b){
      var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(var i = 0; i < lines.length; i++){
        var l = lines[i];
        if(b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
      }
      if(b.every(function(c){ return c; })) return "tie";
      return null;
    }

    build();
  }

  HalDoApp("spiele", { name: "Spiele", icon: "🎮", render: render, category: "werkzeuge" });
  console.log("🦚 spiele.js geladen");
})();
