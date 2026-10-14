/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GAMES APP (v150)
   12 Spiele: Snake · TicTacToe · Memory · Quiz · Minesweeper
              2048 · Tetris · Pong · Hangman · Connect4 · Simon · Reaction
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var GAMES = [
    {id:"snake", ico:"🐍", name:"Snake"},
    {id:"tictactoe", ico:"❌", name:"TicTacToe"},
    {id:"memory", ico:"🧩", name:"Memory"},
    {id:"quiz", ico:"🧠", name:"Ezidi-Quiz"},
    {id:"minesweeper", ico:"💣", name:"Minesweeper"},
    {id:"game2048", ico:"🔢", name:"2048"},
    {id:"tetris", ico:"🟦", name:"Tetris"},
    {id:"pong", ico:"🏓", name:"Pong"},
    {id:"hangman", ico:"🔤", name:"Hangman"},
    {id:"connect4", ico:"🔴", name:"4 Gewinnt"},
    {id:"simon", ico:"🎵", name:"Simon"},
    {id:"reaction", ico:"⚡", name:"Reaktion"}
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var stats = store.get("stats", { snakeHigh: 0, g2048Best: 0 });

    function back(){ return '<button class="btn sec" id="gBack" style="margin-bottom:10px">← Menü</button>'; }
    function bindBack(){ var b = container.querySelector("#gBack"); if(b) b.addEventListener("click", menu); }

    function menu(){
      container.innerHTML =
        '<div style="margin-bottom:14px;text-align:center">'
        + '<div style="font-size:20px;font-weight:900;color:var(--p1)">🎮 HalDo Games</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Snake High: ' + stats.snakeHigh + ' · 2048 Best: ' + stats.g2048Best + '</div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">'
        + GAMES.map(function(g){
            return '<button data-g="' + g.id + '" style="padding:16px 10px;background:var(--bg-card);border:var(--border-soft);border-radius:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;font-family:inherit;color:var(--text)">'
              + '<div style="font-size:34px">' + g.ico + '</div>'
              + '<div style="font-size:12px;font-weight:800">' + g.name + '</div>'
              + '</button>';
          }).join("")
        + '</div>';
      container.querySelectorAll("[data-g]").forEach(function(b){
        b.addEventListener("click", function(){ start(b.dataset.g); });
      });
    }

    function start(id){
      if(id === "snake") snake();
      else if(id === "tictactoe") ttt();
      else if(id === "memory") memory();
      else if(id === "quiz") quiz();
      else if(id === "minesweeper") minesweeper();
      else if(id === "game2048") g2048();
      else if(id === "tetris") tetris();
      else if(id === "pong") pong();
      else if(id === "hangman") hangman();
      else if(id === "connect4") connect4();
      else if(id === "simon") simon();
      else if(id === "reaction") reaction();
    }

    /* ═══════ SNAKE ═══════ */
    function snake(){
      container.innerHTML = back() + '<div style="text-align:center"><canvas id="snC" width="300" height="300" style="background:#000;border:1px solid var(--p1);border-radius:10px;max-width:100%;touch-action:none"></canvas><div id="snI" style="font-size:13px;font-weight:800;color:var(--p1);margin-top:8px">Score: 0</div></div>';
      bindBack();
      var c = container.querySelector("#snC"), ctx2 = c.getContext("2d");
      var gs = 15, sz = 300 / gs;
      var sn = [{x:10,y:10}], dir = {x:1,y:0}, food = {x:15,y:10}, sc = 0, dead = false;
      function rf(){ food = {x:Math.floor(Math.random()*gs), y:Math.floor(Math.random()*gs)}; }
      function tick(){
        if(dead) return;
        var h = {x:sn[0].x + dir.x, y:sn[0].y + dir.y};
        if(h.x < 0 || h.y < 0 || h.x >= gs || h.y >= gs || sn.some(function(s){ return s.x === h.x && s.y === h.y; })){
          dead = true;
          if(sc > stats.snakeHigh){ stats.snakeHigh = sc; store.set("stats", stats); }
          var info = container.querySelector("#snI");
          if(info) info.textContent = "💀 Score: " + sc + " · High: " + stats.snakeHigh;
          clearInterval(iv);
          return;
        }
        sn.unshift(h);
        if(h.x === food.x && h.y === food.y){ sc++; rf(); } else sn.pop();
        draw();
      }
      function draw(){
        ctx2.fillStyle = "#000"; ctx2.fillRect(0,0,300,300);
        ctx2.fillStyle = "#ef4444"; ctx2.fillRect(food.x*sz+2, food.y*sz+2, sz-4, sz-4);
        sn.forEach(function(s,i){
          ctx2.fillStyle = i === 0 ? "#00e5ff" : "#4da8ff";
          ctx2.fillRect(s.x*sz+1, s.y*sz+1, sz-2, sz-2);
        });
      }
      rf(); draw();
      var iv = setInterval(tick, 140);
      var kh = function(e){
        if(dead){ document.removeEventListener("keydown", kh); return; }
        if(e.key === "ArrowUp" && dir.y !== 1) dir = {x:0,y:-1};
        else if(e.key === "ArrowDown" && dir.y !== -1) dir = {x:0,y:1};
        else if(e.key === "ArrowLeft" && dir.x !== 1) dir = {x:-1,y:0};
        else if(e.key === "ArrowRight" && dir.x !== -1) dir = {x:1,y:0};
      };
      document.addEventListener("keydown", kh);
      var tx=0, ty=0;
      c.addEventListener("touchstart", function(e){ tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive:true});
      c.addEventListener("touchend", function(e){
        var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
        if(Math.abs(dx) > Math.abs(dy)){ if(dx > 20 && dir.x !== -1) dir = {x:1,y:0}; else if(dx < -20 && dir.x !== 1) dir = {x:-1,y:0}; }
        else { if(dy > 20 && dir.y !== -1) dir = {x:0,y:1}; else if(dy < -20 && dir.y !== 1) dir = {x:0,y:-1}; }
      }, {passive:true});
    }

    /* ═══════ TIC TAC TOE ═══════ */
    function ttt(){
      var b = ["","","","","","","","",""], t = "X", done = false;
      var W = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      function chk(){
        for(var i=0;i<W.length;i++){
          var w = W[i];
          if(b[w[0]] && b[w[0]] === b[w[1]] && b[w[0]] === b[w[2]]) return b[w[0]];
        }
        return b.every(function(x){ return x; }) ? "draw" : null;
      }
      function render2(){
        var r = chk();
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:14px;font-weight:800;color:var(--p1);margin-bottom:10px">'
          + (done ? (r === "draw" ? "Unentschieden!" : r + " gewinnt!") : t + " ist dran")
          + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(3,80px);gap:6px;justify-content:center">'
          + b.map(function(v,i){
              return '<button data-tt="' + i + '" style="width:80px;height:80px;background:rgba(0,0,0,.3);border:2px solid var(--p1);border-radius:12px;font-size:36px;font-weight:900;color:var(--p1);cursor:pointer">' + v + '</button>';
            }).join("")
          + '</div><button class="btn sec" id="ttR" style="margin-top:14px">🔄 Neu</button></div>';
        bindBack();
        container.querySelectorAll("[data-tt]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.tt);
            if(done || b[i]) return;
            b[i] = t;
            var rr = chk();
            if(rr) done = true; else t = t === "X" ? "O" : "X";
            render2();
          });
        });
        container.querySelector("#ttR").addEventListener("click", function(){
          b = ["","","","","","","","",""]; t = "X"; done = false; render2();
        });
      }
      render2();
    }

    /* ═══════ MEMORY ═══════ */
    function memory(){
      var em = ["🦚","🌍","☀️","⚡","🎮","📚","💰","⏱️"];
      var cd = em.concat(em).sort(function(){ return Math.random() - 0.5; });
      var fl = [], mt = 0, lk = false;
      function render2(){
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:13px;font-weight:800;color:var(--p1);margin-bottom:10px">Paare: ' + mt + '/' + em.length + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:340px;margin:0 auto">'
          + cd.map(function(c,i){
              var s = fl.indexOf(i) >= 0 || c === "✓";
              return '<button data-mm="' + i + '" style="aspect-ratio:1;background:' + (s ? "rgba(0,229,255,.15)" : "rgba(0,0,0,.3)") + ';border:2px solid var(--p1);border-radius:10px;font-size:28px;cursor:pointer">' + (s ? c : "❓") + '</button>';
            }).join("")
          + '</div></div>';
        bindBack();
        container.querySelectorAll("[data-mm]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.mm);
            if(lk || fl.indexOf(i) >= 0 || cd[i] === "✓") return;
            fl.push(i);
            render2();
            if(fl.length === 2){
              lk = true;
              setTimeout(function(){
                if(cd[fl[0]] === cd[fl[1]]){ cd[fl[0]] = "✓"; cd[fl[1]] = "✓"; mt++; }
                fl = []; lk = false; render2();
              }, 800);
            }
          });
        });
      }
      render2();
    }

    /* ═══════ QUIZ ═══════ */
    function quiz(){
      var qs = [
        {q:"Wie heißt das heilige Buch?", a:["Mushaf Reş","Koran","Bibel","Tora"], c:0},
        {q:"Wer ist Oberster der 7 Engel?", a:["Şêx Hesen","Tawûsî Melek","Şêx Şems","Nasir"], c:1},
        {q:"Wiege der Zivilisation?", a:["Ägypten","Mesopotamien","Griechenland","China"], c:1},
        {q:"Wer erfand die Schrift?", a:["Perser","Meder","Sumerer","Assyrer"], c:2},
        {q:"Wie viele Genozide laut Tradition?", a:["12","42","72","100"], c:2},
        {q:"Was ist Laliş?", a:["Stadt","Hauptheiligtum","Berg","Fluss"], c:1},
        {q:"Welches Volk sind Vorfahren der Kurden?", a:["Römer","Meder","Griechen","Kelten"], c:1}
      ];
      var idx = 0, sc = 0;
      function render2(){
        if(idx >= qs.length){
          container.innerHTML = back()
            + '<div style="text-align:center;padding:40px 20px">'
            + '<div style="font-size:52px">🎉</div>'
            + '<div style="font-size:20px;font-weight:900;color:var(--p1);margin-top:14px">' + sc + '/' + qs.length + '</div>'
            + '<button class="btn" id="qAgain" style="margin-top:16px">🔄 Nochmal</button></div>';
          bindBack();
          container.querySelector("#qAgain").addEventListener("click", function(){ idx = 0; sc = 0; render2(); });
          return;
        }
        var q = qs[idx];
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">Frage ' + (idx+1) + '/' + qs.length + '</div>'
          + '<div style="font-size:15px;font-weight:900;color:var(--p1);margin:12px 0 18px">' + _esc(q.q) + '</div>'
          + '<div style="display:flex;flex-direction:column;gap:8px;max-width:340px;margin:0 auto">'
          + q.a.map(function(a,i){
              return '<button data-qq="' + i + '" style="padding:14px;background:rgba(0,0,0,.3);border:2px solid var(--border-soft);border-radius:12px;font-size:13px;font-weight:800;color:var(--text);cursor:pointer;font-family:inherit">' + _esc(a) + '</button>';
            }).join("")
          + '</div></div>';
        bindBack();
        container.querySelectorAll("[data-qq]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.qq);
            if(i === q.c){ sc++; el.style.background = "rgba(34,197,94,.3)"; }
            else { el.style.background = "rgba(239,68,68,.3)"; }
            setTimeout(function(){ idx++; render2(); }, 800);
          });
        });
      }
      render2();
    }

    /* ═══════ MINESWEEPER ═══════ */
    function minesweeper(){
      var sz = 8, mn = 10, g = [], op = [], fg = [], done = false, lost = false;
      for(var i = 0; i < sz*sz; i++){ g.push(0); op.push(false); fg.push(false); }
      var pl = 0;
      while(pl < mn){ var p = Math.floor(Math.random()*sz*sz); if(g[p] !== -1){ g[p] = -1; pl++; } }
      for(var i = 0; i < sz*sz; i++){
        if(g[i] === -1) continue;
        var c = 0, x = i%sz, y = Math.floor(i/sz);
        for(var dy = -1; dy <= 1; dy++) for(var dx = -1; dx <= 1; dx++){
          if(dx === 0 && dy === 0) continue;
          var nx = x+dx, ny = y+dy;
          if(nx < 0 || ny < 0 || nx >= sz || ny >= sz) continue;
          if(g[ny*sz+nx] === -1) c++;
        }
        g[i] = c;
      }
      function open(i){
        if(op[i] || fg[i]) return;
        op[i] = true;
        if(g[i] === -1){ lost = true; done = true; return; }
        if(g[i] === 0){
          var x = i%sz, y = Math.floor(i/sz);
          for(var dy = -1; dy <= 1; dy++) for(var dx = -1; dx <= 1; dx++){
            if(dx === 0 && dy === 0) continue;
            var nx = x+dx, ny = y+dy;
            if(nx < 0 || ny < 0 || nx >= sz || ny >= sz) continue;
            open(ny*sz+nx);
          }
        }
      }
      function render2(){
        var win = !lost && op.filter(function(o,i){ return o && g[i] !== -1; }).length === sz*sz - mn;
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:13px;font-weight:800;color:var(--p1);margin-bottom:10px">' + (lost ? "💥 Verloren!" : win ? "🎉 Gewonnen!" : "💣 " + mn + " Minen") + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-width:320px;margin:0 auto">'
          + g.map(function(v,i){
              var sh = op[i] || lost, tx = "", co = "rgba(0,0,0,.3)";
              if(sh){
                if(v === -1){ tx = "💣"; co = "rgba(239,68,68,.3)"; }
                else if(v === 0){ co = "rgba(0,229,255,.08)"; }
                else { tx = v; co = "rgba(0,229,255,.15)"; }
              } else if(fg[i]) tx = "🚩";
              return '<button data-m="' + i + '" style="aspect-ratio:1;background:' + co + ';border:1px solid rgba(0,229,255,.3);border-radius:4px;font-size:14px;font-weight:900;color:var(--p1);cursor:pointer;padding:0">' + tx + '</button>';
            }).join("")
          + '</div><button class="btn sec" id="mReset" style="margin-top:14px">🔄 Neu</button></div>';
        bindBack();
        container.querySelectorAll("[data-m]").forEach(function(el){
          el.addEventListener("click", function(e){
            if(done) return;
            var i = parseInt(el.dataset.m);
            if(e.shiftKey){ if(!op[i]) fg[i] = !fg[i]; render2(); return; }
            open(i);
            if(op.filter(function(o,i){ return o && g[i] !== -1; }).length === sz*sz - mn) done = true;
            render2();
          });
        });
        container.querySelector("#mReset").addEventListener("click", minesweeper);
      }
      render2();
    }

    /* ═══════ 2048 ═══════ */
    function g2048(){
      var g = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], sc = 0;
      function add(){
        var e = [];
        for(var y=0;y<4;y++) for(var x=0;x<4;x++) if(g[y][x] === 0) e.push([x,y]);
        if(!e.length) return;
        var p = e[Math.floor(Math.random()*e.length)];
        g[p[1]][p[0]] = Math.random() < 0.9 ? 2 : 4;
      }
      add(); add();
      function mv(dx,dy){
        var moved = false;
        for(var i=0;i<4;i++){
          var l = [];
          for(var j=0;j<4;j++){
            var x = dx ? i : j, y = dy ? i : j;
            if(dx < 0) x = 3-x;
            if(dy < 0) y = 3-y;
            var v = g[y][x];
            if(v) l.push(v);
          }
          for(var k=0;k<l.length-1;k++){
            if(l[k] === l[k+1]){ l[k] *= 2; sc += l[k]; l.splice(k+1,1); }
          }
          while(l.length < 4) l.push(0);
          for(var j=0;j<4;j++){
            var x = dx ? i : j, y = dy ? i : j;
            if(dx < 0) x = 3-x;
            if(dy < 0) y = 3-y;
            if(g[y][x] !== l[j]) moved = true;
            g[y][x] = l[j];
          }
        }
        if(moved) add();
        return moved;
      }
      function render2(){
        if(sc > stats.g2048Best){ stats.g2048Best = sc; store.set("stats", stats); }
        var co = {0:"rgba(0,0,0,.2)",2:"#eee4da",4:"#ede0c8",8:"#f2b179",16:"#f59563",32:"#f67c5f",64:"#f65e3b",128:"#edcf72",256:"#edcc61",512:"#edc850",1024:"#edc53f",2048:"#edc22e"};
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:13px;font-weight:800;color:var(--p1);margin-bottom:10px">Score: ' + sc + ' · Best: ' + stats.g2048Best + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:0 auto;background:rgba(0,0,0,.3);padding:8px;border-radius:12px">'
          + g.map(function(row){
              return row.map(function(v){
                return '<div style="aspect-ratio:1;background:' + (co[v] || "#3c3a32") + ';border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:' + (v < 100 ? 20 : v < 1000 ? 16 : 13) + 'px;font-weight:900;color:' + (v < 8 ? "#776e65" : "#fff") + '">' + (v || "") + '</div>';
              }).join("");
            }).join("")
          + '</div>'
          + '<div style="margin-top:12px;font-size:11px;color:var(--text-mute)">Pfeiltasten</div></div>';
        bindBack();
      }
      render2();
      var kh = function(e){
        var m = false;
        if(e.key === "ArrowLeft") m = mv(-1,0);
        else if(e.key === "ArrowRight") m = mv(1,0);
        else if(e.key === "ArrowUp") m = mv(0,-1);
        else if(e.key === "ArrowDown") m = mv(0,1);
        if(m) render2();
      };
      document.addEventListener("keydown", kh);
    }

    /* ═══════ TETRIS ═══════ */
    function tetris(){
      var W = 10, H = 20, cell = 20, bd = [];
      for(var y = 0; y < H; y++){ bd.push([]); for(var x = 0; x < W; x++) bd[y].push(0); }
      var shapes = [[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
      var cols = ["#00e5ff","#ffd54f","#b478ff","#4da8ff","#ff78c8","#4ade80","#ff8080"];
      var cur = null, cx = 0, cy = 0, ci = 0, sc = 0, dn = false, iv;
      function np(){
        ci = Math.floor(Math.random()*shapes.length);
        cur = shapes[ci];
        cx = Math.floor((W-cur[0].length)/2);
        cy = 0;
        if(hit(cx,cy,cur)){ dn = true; clearInterval(iv); }
      }
      function hit(nx,ny,sh){
        for(var y = 0; y < sh.length; y++) for(var x = 0; x < sh[y].length; x++){
          if(!sh[y][x]) continue;
          var bx = nx+x, by = ny+y;
          if(bx < 0 || bx >= W || by >= H) return true;
          if(by >= 0 && bd[by][bx]) return true;
        }
        return false;
      }
      function fx(){
        for(var y = 0; y < cur.length; y++) for(var x = 0; x < cur[y].length; x++){
          if(cur[y][x]){
            var by = cy+y;
            if(by < 0) continue;
            bd[by][cx+x] = ci+1;
          }
        }
        for(var y = H-1; y >= 0; y--){
          if(bd[y].every(function(v){ return v; })){
            bd.splice(y,1);
            bd.unshift(bd[0].map(function(){ return 0; }));
            y++; sc += 10;
          }
        }
        np();
      }
      function tick(){
        if(dn) return;
        if(!hit(cx,cy+1,cur)) cy++; else fx();
        render2();
      }
      function render2(){
        var html = '';
        for(var y = 0; y < H; y++) for(var x = 0; x < W; x++){
          var v = bd[y][x];
          var col = v ? cols[v-1] : "rgba(0,0,0,.4)";
          if(cur && y >= cy && y < cy+cur.length && x >= cx && x < cx+cur[0].length && cur[y-cy][x-cx]) col = cols[ci];
          html += '<div style="background:' + col + ';border:1px solid rgba(0,0,0,.3)"></div>';
        }
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:13px;font-weight:800;color:var(--p1);margin-bottom:8px">Score: ' + sc + (dn ? ' · GAME OVER' : '') + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(' + W + ',1fr);width:' + (W*cell) + 'px;margin:0 auto;border:2px solid var(--p1);border-radius:6px;overflow:hidden">' + html + '</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:8px">← → bewegen · ↑ drehen · ↓ fallen</div></div>';
        bindBack();
      }
      np(); render2();
      iv = setInterval(tick, 500);
      var kh = function(e){
        if(dn) return;
        if(e.key === "ArrowLeft" && !hit(cx-1,cy,cur)) cx--;
        else if(e.key === "ArrowRight" && !hit(cx+1,cy,cur)) cx++;
        else if(e.key === "ArrowDown" && !hit(cx,cy+1,cur)) cy++;
        else if(e.key === "ArrowUp"){
          var rot = cur[0].map(function(_,i){ return cur.map(function(r){ return r[i]; }).reverse(); });
          if(!hit(cx,cy,rot)) cur = rot;
        }
        render2();
      };
      document.addEventListener("keydown", kh);
    }

    /* ═══════ PONG ═══════ */
    function pong(){
      var W = 400, H = 280, ph = 60, pw = 10;
      var py1 = H/2-ph/2, py2 = H/2-ph/2;
      var bx = W/2, by = H/2, bdx = 3, bdy = 3, s1 = 0, s2 = 0;
      var cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      cv.style.background = "#000"; cv.style.border = "1px solid var(--p1)";
      cv.style.borderRadius = "10px"; cv.style.maxWidth = "100%";
      container.innerHTML = back() + '<div style="text-align:center"><div id="ps" style="font-size:16px;font-weight:900;color:var(--p1);margin-bottom:8px">0 : 0</div><div id="pc" style="display:inline-block"></div></div>';
      bindBack();
      container.querySelector("#pc").appendChild(cv);
      var c2 = cv.getContext("2d");
      cv.addEventListener("mousemove", function(e){
        var r = cv.getBoundingClientRect();
        py1 = e.clientY - r.top - ph/2;
      });
      cv.addEventListener("touchmove", function(e){
        e.preventDefault();
        var r = cv.getBoundingClientRect();
        py1 = e.touches[0].clientY - r.top - ph/2;
      }, {passive:false});
      function loop(){
        if(!cv.parentNode) return;
        bx += bdx; by += bdy;
        if(by < 0 || by > H) bdy = -bdy;
        py2 += by < py2+ph/2 ? 3 : -3;
        py2 = Math.max(0, Math.min(H-ph, py2));
        if(bx < 20 && by > py1 && by < py1+ph && bdx < 0) bdx = -bdx;
        if(bx > W-20 && by > py2 && by < py2+ph && bdx > 0) bdx = -bdx;
        if(bx < 0){ s2++; bx = W/2; by = H/2; }
        if(bx > W){ s1++; bx = W/2; by = H/2; }
        var psc = container.querySelector("#ps");
        if(psc) psc.textContent = s1 + " : " + s2;
        c2.fillStyle = "#000"; c2.fillRect(0,0,W,H);
        c2.setLineDash([5,5]); c2.strokeStyle = "rgba(255,255,255,.3)";
        c2.beginPath(); c2.moveTo(W/2,0); c2.lineTo(W/2,H); c2.stroke();
        c2.setLineDash([]);
        c2.fillStyle = "#00e5ff"; c2.fillRect(10,py1,pw,ph);
        c2.fillStyle = "#b478ff"; c2.fillRect(W-20,py2,pw,ph);
        c2.fillStyle = "#ffe080";
        c2.beginPath(); c2.arc(bx,by,6,0,Math.PI*2); c2.fill();
        requestAnimationFrame(loop);
      }
      loop();
    }

    /* ═══════ HANGMAN ═══════ */
    function hangman(){
      var words = ["EZIDI","MESOPOTAMIEN","SUMERER","KURDISTAN","LALISH","TAWUSI","MUSHAF","QEWL","AKKADER","ASSYRER"];
      var w = words[Math.floor(Math.random()*words.length)];
      var gd = [], tr = 6;
      function render2(){
        var disp = w.split("").map(function(c){ return gd.indexOf(c) >= 0 ? c : "_"; }).join(" ");
        var won = w.split("").every(function(c){ return gd.indexOf(c) >= 0; });
        var h = back() + '<div style="text-align:center">'
          + '<div style="font-size:60px;margin:10px 0">' + ["😀","🙂","😐","😟","😨","😰","💀"][6-tr] + '</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1);font-family:ui-monospace;letter-spacing:3px;margin:14px 0">' + disp + '</div>'
          + '<div style="font-size:12px;color:var(--text-mute);margin-bottom:14px">Versuche: ' + tr + '</div>';
        if(won) h += '<div style="font-size:16px;color:#4ade80;font-weight:900">🎉 Gewonnen!</div>';
        else if(tr <= 0) h += '<div style="font-size:14px;color:#ff8080">💀 Verloren! Wort: <b>' + w + '</b></div>';
        else {
          h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;max-width:340px;margin:0 auto">';
          for(var i = 65; i <= 90; i++){
            var c = String.fromCharCode(i);
            var u = gd.indexOf(c) >= 0;
            h += '<button data-hm="' + c + '" ' + (u ? "disabled" : "") + ' style="padding:10px;background:' + (u ? "rgba(0,0,0,.2)" : "rgba(0,229,255,.15)") + ';border:var(--border-soft);border-radius:8px;color:' + (u ? "var(--text-mute)" : "var(--p1)") + ';font-size:13px;font-weight:800">' + c + '</button>';
          }
          h += '</div>';
        }
        h += '<button class="btn sec" id="hmR" style="margin-top:14px">🔄 Neu</button></div>';
        container.innerHTML = h;
        bindBack();
        container.querySelectorAll("[data-hm]").forEach(function(el){
          el.addEventListener("click", function(){
            var c = el.dataset.hm;
            gd.push(c);
            if(w.indexOf(c) < 0) tr--;
            render2();
          });
        });
        container.querySelector("#hmR").addEventListener("click", hangman);
      }
      render2();
    }

    /* ═══════ CONNECT 4 ═══════ */
    function connect4(){
      var W = 7, H = 6, bd = [];
      for(var y = 0; y < H; y++){ bd.push([]); for(var x = 0; x < W; x++) bd[y].push(0); }
      var tn = 1, dn = false;
      function dr(c){
        for(var y = H-1; y >= 0; y--){ if(bd[y][c] === 0){ bd[y][c] = tn; return true; } }
        return false;
      }
      function ck(){
        for(var y = 0; y < H; y++) for(var x = 0; x < W; x++){
          var v = bd[y][x];
          if(!v) continue;
          if(x+3 < W && bd[y][x+1] === v && bd[y][x+2] === v && bd[y][x+3] === v) return v;
          if(y+3 < H && bd[y+1][x] === v && bd[y+2][x] === v && bd[y+3][x] === v) return v;
          if(x+3 < W && y+3 < H && bd[y+1][x+1] === v && bd[y+2][x+2] === v && bd[y+3][x+3] === v) return v;
          if(x >= 3 && y+3 < H && bd[y+1][x-1] === v && bd[y+2][x-2] === v && bd[y+3][x-3] === v) return v;
        }
        return null;
      }
      function render2(){
        var w = ck();
        var h = back() + '<div style="text-align:center">'
          + '<div style="font-size:14px;font-weight:800;color:var(--p1);margin-bottom:10px">'
          + (w ? (w === 1 ? "🔴 Rot gewinnt!" : "🟡 Gelb gewinnt!") : "Spieler " + (tn === 1 ? "🔴" : "🟡"))
          + '</div>'
          + '<div style="display:inline-grid;grid-template-columns:repeat(7,1fr);gap:2px;background:#1a3a5a;padding:6px;border-radius:12px;border:2px solid var(--p1)">';
        for(var y = 0; y < H; y++) for(var x = 0; x < W; x++){
          var v = bd[y][x];
          var col = v === 1 ? "#ff4040" : v === 2 ? "#ffd54f" : "rgba(0,0,0,.4)";
          h += '<button data-c4="' + x + '" style="width:36px;height:36px;border-radius:50%;background:' + col + ';border:none;cursor:pointer;padding:0"></button>';
        }
        h += '</div><button class="btn sec" id="c4R" style="margin-top:14px">🔄 Neu</button></div>';
        container.innerHTML = h;
        bindBack();
        container.querySelectorAll("[data-c4]").forEach(function(el){
          el.addEventListener("click", function(){
            if(dn || w) return;
            var c = parseInt(el.dataset.c4);
            if(!dr(c)) return;
            var w2 = ck();
            if(w2) dn = true;
            else if(bd[0].every(function(v){ return v; })) dn = true;
            tn = tn === 1 ? 2 : 1;
            render2();
          });
        });
        container.querySelector("#c4R").addEventListener("click", connect4);
      }
      render2();
    }

    /* ═══════ SIMON ═══════ */
    function simon(){
      var sq = [], us = [], sc = 0, pl = false;
      var cls = ["#00e5ff","#ffd54f","#ff78c8","#4ade80"];
      function nx(){ sq.push(Math.floor(Math.random()*4)); us = []; ps(); }
      function ps(){
        pl = true;
        var i = 0;
        function st(){
          if(i >= sq.length){ pl = false; return; }
          fl(sq[i]); i++;
          setTimeout(st, 600);
        }
        st();
      }
      function fl(c){
        var b = container.querySelector("#sb" + c);
        if(!b) return;
        b.style.transform = "scale(1.15)";
        b.style.filter = "brightness(1.6)";
        setTimeout(function(){ b.style.transform = ""; b.style.filter = ""; }, 300);
      }
      function render2(){
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:16px;font-weight:900;color:var(--p1);margin-bottom:14px">Score: ' + sc + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:280px;margin:0 auto">'
          + cls.map(function(c,i){
              return '<button id="sb' + i + '" data-sm="' + i + '" style="aspect-ratio:1;background:' + c + ';border:none;border-radius:20px;cursor:pointer"></button>';
            }).join("")
          + '</div>'
          + '<button class="btn sec" id="ss" style="margin-top:16px">▶ Start</button></div>';
        bindBack();
        container.querySelectorAll("[data-sm]").forEach(function(el){
          el.addEventListener("click", function(){
            if(pl) return;
            var i = parseInt(el.dataset.sm);
            fl(i);
            us.push(i);
            var ix = us.length - 1;
            if(us[ix] !== sq[ix]){
              _toast("❌ Falsch! Score: " + sc, "err");
              sc = 0; sq = [];
              return;
            }
            if(us.length === sq.length){ sc++; setTimeout(nx, 600); }
          });
        });
        container.querySelector("#ss").addEventListener("click", function(){
          sc = 0; sq = []; us = []; nx();
        });
      }
      render2();
    }

    /* ═══════ REACTION ═══════ */
    function reaction(){
      var t0 = 0, wt = false, rs = null;
      function render2(){
        container.innerHTML = back()
          + '<div style="text-align:center">'
          + '<div style="font-size:60px;margin:20px 0">' + (wt ? "⏳" : rs ? "⚡" : "🎯") + '</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p1);margin:14px 0">' + (rs ? rs + " ms" : wt ? "Warte…" : "Bereit?") + '</div>'
          + '<button class="btn" id="rx" style="padding:30px 60px;font-size:18px;background:' + (wt ? "#ef4444" : "linear-gradient(135deg,var(--p1),var(--p2))") + '">' + (wt ? "STOP" : "KLICK") + '</button>'
          + '</div>';
        bindBack();
        container.querySelector("#rx").addEventListener("click", function(){
          if(!wt && !rs){
            wt = true; rs = null; render2();
            setTimeout(function(){
              wt = false;
              t0 = Date.now();
              var b = container.querySelector("#rx");
              if(!b) return;
              b.style.background = "linear-gradient(135deg,#22c55e,#10b981)";
              b.textContent = "KLICK!";
              b.onclick = function(){ rs = Date.now() - t0; render2(); };
            }, 1000 + Math.random()*3000);
          } else if(rs){ rs = null; render2(); }
        });
      }
      render2();
    }

    function _toast(msg, type){
      var t = document.getElementById("toast");
      if(!t) return;
      t.textContent = msg;
      t.className = "show" + (type ? " " + type : "");
      clearTimeout(t._t);
      t._t = setTimeout(function(){ t.className = ""; }, 2400);
    }

    menu();
  }

  if(window.HalDoApp) HalDoApp("games", { render: render });
  else console.warn("games.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 games.js geladen");
