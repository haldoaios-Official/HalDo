/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LERNEN APP (v150)
   Vokabeln · Übersetzer · Formeln · Mathe-Trainer
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var VOCAB = [
    {de:"Hallo", ez:"Silav"}, {de:"Guten Morgen", ez:"Beyanî baş"}, {de:"Guten Abend", ez:"Êvar baş"},
    {de:"Danke", ez:"Spas"}, {de:"Willkommen", ez:"Bi xêr hatî"}, {de:"Auf Wiedersehen", ez:"Xatirê te"},
    {de:"Wasser", ez:"Av"}, {de:"Brot", ez:"Nan"}, {de:"Haus", ez:"Mal"}, {de:"Freund", ez:"Heval"},
    {de:"Liebe", ez:"Evîn"}, {de:"Gott", ez:"Xwedê"}, {de:"Familie", ez:"Malbat"}, {de:"Mutter", ez:"Dayik"},
    {de:"Vater", ez:"Bav"}, {de:"Kind", ez:"Zarok"}, {de:"Sonne", ez:"Roj"}, {de:"Mond", ez:"Heyv"},
    {de:"Stern", ez:"Stêr"}, {de:"Buch", ez:"Pirtûk"}, {de:"Stadt", ez:"Bajar"}, {de:"Land", ez:"Welat"},
    {de:"Berg", ez:"Çiya"}, {de:"Fluss", ez:"Çem"}, {de:"Baum", ez:"Dar"}, {de:"Blume", ez:"Kulîlk"}
  ];

  var FORMULAS = [
    {n:"Kreisfläche", f:"A = π · r²", cat:"Mathe"},
    {n:"Kreisumfang", f:"U = 2 · π · r", cat:"Mathe"},
    {n:"Pythagoras", f:"a² + b² = c²", cat:"Mathe"},
    {n:"Fläche Rechteck", f:"A = a · b", cat:"Mathe"},
    {n:"Fläche Dreieck", f:"A = ½ · g · h", cat:"Mathe"},
    {n:"Kugelvolumen", f:"V = 4/3 · π · r³", cat:"Mathe"},
    {n:"Quadratische Gl.", f:"x = (-b ± √(b²-4ac)) / 2a", cat:"Mathe"},
    {n:"Geschwindigkeit", f:"v = s / t", cat:"Physik"},
    {n:"Kraft", f:"F = m · a", cat:"Physik"},
    {n:"Energie", f:"E = m · c²", cat:"Physik"},
    {n:"Ohm'sches Gesetz", f:"U = R · I", cat:"Physik"},
    {n:"Leistung", f:"P = U · I", cat:"Physik"},
    {n:"Molare Masse", f:"n = m / M", cat:"Chemie"},
    {n:"Ideales Gas", f:"p · V = n · R · T", cat:"Chemie"}
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "vokabeln");

    function build(){
      var body = "";

      /* ═══ VOKABELN ═══ */
      if(tab === "vokabeln"){
        body = '<div class="card"><h3>🦚 Ezidi ↔ Deutsch Vokabeln</h3>';
        VOCAB.forEach(function(v){
          body += '<div data-voc="' + _esc(v.ez) + '" style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:5px;display:flex;justify-content:space-between;cursor:pointer;border-left:3px solid var(--p1)">'
            + '<div><div style="font-size:10px;color:var(--text-mute);font-weight:700">' + _esc(v.de) + '</div>'
            + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + _esc(v.ez) + '</div></div>'
            + '<div style="font-size:18px">🔊</div></div>';
        });
        body += '</div>';

      /* ═══ ÜBERSETZER ═══ */
      } else if(tab === "uebersetzer"){
        body = '<div class="card"><h3>🌐 Übersetzer (MyMemory, kostenlos)</h3>'
          + '<div class="field"><label>Text</label><textarea id="trIn" style="min-height:100px">Hallo, wie geht es dir?</textarea></div>'
          + '<div class="field"><label>Von</label><select id="trFrom">'
          + '<option value="de">🇩🇪 Deutsch</option>'
          + '<option value="en">🇬🇧 Englisch</option>'
          + '<option value="ku">🟨 Kurdisch</option>'
          + '<option value="ar">🇸🇦 Arabisch</option>'
          + '<option value="tr">🇹🇷 Türkisch</option>'
          + '<option value="fa">🇮🇷 Persisch</option>'
          + '<option value="ru">🇷🇺 Russisch</option>'
          + '<option value="fr">🇫🇷 Französisch</option>'
          + '<option value="es">🇪🇸 Spanisch</option>'
          + '<option value="it">🇮🇹 Italienisch</option>'
          + '</select></div>'
          + '<div class="field"><label>Nach</label><select id="trTo">'
          + '<option value="en">🇬🇧 Englisch</option>'
          + '<option value="de">🇩🇪 Deutsch</option>'
          + '<option value="ku">🟨 Kurdisch</option>'
          + '<option value="ar">🇸🇦 Arabisch</option>'
          + '<option value="tr">🇹🇷 Türkisch</option>'
          + '<option value="fa">🇮🇷 Persisch</option>'
          + '<option value="ru">🇷🇺 Russisch</option>'
          + '<option value="fr">🇫🇷 Französisch</option>'
          + '<option value="es">🇪🇸 Spanisch</option>'
          + '<option value="it">🇮🇹 Italienisch</option>'
          + '</select></div>'
          + '<button class="btn full" id="trGo">🌐 Übersetzen</button>'
          + '<button class="btn sec full" id="trSpeak" style="margin-top:6px">🔊 Vorlesen</button>'
          + '<div id="trRes" style="margin-top:14px;padding:14px;background:rgba(0,229,255,.08);border-radius:10px;min-height:60px;font-size:14px;line-height:1.6">—</div>'
          + '</div>';

      /* ═══ FORMELN ═══ */
      } else if(tab === "formeln"){
        var cats = {};
        FORMULAS.forEach(function(f){ (cats[f.cat] = cats[f.cat] || []).push(f); });
        Object.keys(cats).forEach(function(cat){
          body += '<div class="card"><h3>🧮 ' + _esc(cat) + '</h3>';
          cats[cat].forEach(function(f){
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p3)">'
              + '<div style="font-size:10.5px;color:#c084fc;font-weight:700">' + _esc(f.n) + '</div>'
              + '<div style="font-size:15px;font-weight:900;color:var(--p1);font-family:ui-monospace;margin-top:4px">' + _esc(f.f) + '</div>'
              + '</div>';
          });
          body += '</div>';
        });

      /* ═══ MATHE-TRAINER ═══ */
      } else if(tab === "mathe"){
        var stats = store.get("matheStats", {score:0, streak:0, best:0});
        body = '<div class="card"><h3>🧠 Mathe-Trainer</h3>'
          + '<div class="field"><label>Schwierigkeit</label><select id="mDiff">'
          + '<option value="1">Leicht (+/-)</option>'
          + '<option value="2" selected>Mittel (×)</option>'
          + '<option value="3">Schwer (÷ / gemischt)</option>'
          + '</select></div>'
          + '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;min-height:160px">'
          + '<div style="font-size:12px;color:var(--text-mute)">Score: <b id="mScore" style="color:var(--p1)">' + stats.score + '</b> · Streak: <b id="mStreak" style="color:var(--p1)">' + stats.streak + '</b> · Best: <b style="color:var(--p3)">' + stats.best + '</b></div>'
          + '<div id="mQ" style="font-size:40px;font-weight:900;color:var(--p1);margin:20px 0;font-family:ui-monospace">—</div>'
          + '<input type="number" id="mA" placeholder="Antwort" style="padding:14px;font-size:22px;text-align:center;background:rgba(0,0,0,.4);border:2px solid var(--p1);border-radius:12px;color:var(--p1);width:180px;outline:none;font-weight:900">'
          + '<button class="btn" id="mGo" style="margin-left:8px;padding:14px 20px;font-size:16px">OK</button>'
          + '</div>'
          + '<button class="btn sec full" id="mStart" style="margin-top:10px">▶ Neues Spiel</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="vokabeln"?" active":"") + '" data-lt="vokabeln">📖 Vokabeln</button>'
        + '<button class="tab' + (tab==="uebersetzer"?" active":"") + '" data-lt="uebersetzer">🌐 Übersetzer</button>'
        + '<button class="tab' + (tab==="formeln"?" active":"") + '" data-lt="formeln">🧮 Formeln</button>'
        + '<button class="tab' + (tab==="mathe"?" active":"") + '" data-lt="mathe">🧠 Mathe</button>'
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-lt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.lt;
          store.set("tab", tab);
          build();
        });
      });

      /* Vokabeln sprechen */
      container.querySelectorAll("[data-voc]").forEach(function(el){
        el.addEventListener("click", function(){
          if(window.HalDo.Voice) HalDo.Voice.speak(el.dataset.voc);
        });
      });

      /* Übersetzer */
      if(tab === "uebersetzer"){
        var lastTrans = "";
        container.querySelector("#trGo").addEventListener("click", function(){
          var t = container.querySelector("#trIn").value.trim();
          var f = container.querySelector("#trFrom").value;
          var to = container.querySelector("#trTo").value;
          if(!t) return;
          var res = container.querySelector("#trRes");
          res.textContent = "⏳ Übersetze…";
          fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(t) + "&langpair=" + f + "|" + to)
            .then(function(r){ return r.json(); })
            .then(function(d){
              lastTrans = d.responseData.translatedText;
              res.textContent = lastTrans;
            })
            .catch(function(e){ res.textContent = "❌ " + e.message; });
        });
        container.querySelector("#trSpeak").addEventListener("click", function(){
          if(lastTrans && window.HalDo.Voice) HalDo.Voice.speak(lastTrans);
        });
      }

      /* Mathe */
      if(tab === "mathe"){
        var score = stats.score || 0;
        var streak = stats.streak || 0;
        var cur = null;

        function gen(){
          var d = parseInt(container.querySelector("#mDiff").value);
          var a, b, op, r;
          if(d === 1){
            a = Math.floor(Math.random()*50)+1;
            b = Math.floor(Math.random()*50)+1;
            op = Math.random() < 0.5 ? "+" : "-";
            r = op === "+" ? a+b : a-b;
          } else if(d === 2){
            a = Math.floor(Math.random()*12)+2;
            b = Math.floor(Math.random()*12)+2;
            op = "×"; r = a*b;
          } else {
            op = ["÷","×","+"][Math.floor(Math.random()*3)];
            if(op === "÷"){ b = Math.floor(Math.random()*11)+2; r = Math.floor(Math.random()*11)+2; a = b*r; }
            else if(op === "×"){ a = Math.floor(Math.random()*15)+5; b = Math.floor(Math.random()*15)+5; r = a*b; }
            else { a = Math.floor(Math.random()*200)+10; b = Math.floor(Math.random()*200)+10; r = a+b; }
          }
          cur = {q: a + " " + op + " " + b, r: r};
          var qEl = container.querySelector("#mQ");
          if(qEl) qEl.textContent = cur.q;
          var aEl = container.querySelector("#mA");
          if(aEl){ aEl.value = ""; aEl.focus(); }
        }

        function addStats(){
          stats.score = score;
          stats.streak = streak;
          if(score > (stats.best || 0)) stats.best = score;
          store.set("matheStats", stats);
        }

        container.querySelector("#mStart").addEventListener("click", function(){
          score = 0; streak = 0; addStats();
          container.querySelector("#mScore").textContent = 0;
          container.querySelector("#mStreak").textContent = 0;
          gen();
        });
        container.querySelector("#mGo").addEventListener("click", function(){
          if(!cur) return;
          var v = parseInt(container.querySelector("#mA").value);
          var qEl = container.querySelector("#mQ");
          if(v === cur.r){
            score++; streak++;
            container.querySelector("#mScore").textContent = score;
            container.querySelector("#mStreak").textContent = streak;
            if(qEl) qEl.style.color = "#4ade80";
          } else {
            streak = 0;
            container.querySelector("#mStreak").textContent = 0;
            if(qEl) qEl.style.color = "#ff8080";
          }
          addStats();
          setTimeout(function(){
            if(qEl) qEl.style.color = "var(--p1)";
            gen();
          }, 400);
        });
        container.querySelector("#mA").addEventListener("keydown", function(e){
          if(e.key === "Enter") container.querySelector("#mGo").click();
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("lernen", { render: render });
  else console.warn("lernen.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 lernen.js geladen");
