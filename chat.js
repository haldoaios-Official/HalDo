/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — CHAT APP (v150)
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var _container = null;
  var _context = null;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    _container = container;
    _context = ctx;
    var store = ctx.store;
    var history = store.get("history", []);

    container.innerHTML = ''
      + '<div id="chBody" style="display:flex;flex-direction:column;gap:10px;padding:8px;background:rgba(0,0,0,.15);border-radius:12px;min-height:220px;max-height:calc(100% - 130px);overflow-y:auto"></div>'
      + '<div class="chat-quick">'
      +   '<button data-q="Hallo!">👋 Hallo</button>'
      +   '<button data-q="Erzähl mir über Eziden">🦚 Eziden</button>'
      +   '<button data-q="Die 7 Engel?">👼 Engel</button>'
      +   '<button data-q="Was ist Mushaf Reş?">📖 Mushaf</button>'
      +   '<button data-q="Mesopotamien?">🏛️ Mesopotamien</button>'
      +   '<button data-q="Qewl?">🕊️ Qewl</button>'
      + '</div>'
      + '<div class="chat-input-row">'
      +   '<button class="ibtn" id="chMic">🎤</button>'
      +   '<textarea id="chInput" placeholder="Schreib eine Nachricht…" rows="1"></textarea>'
      +   '<button class="ibtn send" id="chSend">➤</button>'
      + '</div>';

    var body = container.querySelector("#chBody");
    var input = container.querySelector("#chInput");
    var sendBtn = container.querySelector("#chSend");
    var micBtn = container.querySelector("#chMic");

    /* Verlauf darstellen */
    if(history.length === 0){
      pushBot("Silav, " + (window.HalDo.Config.get("userName") || "Bruder") + "! 🦚 Frag mich was über Eziden, Mesopotamien oder die 7 Engel!", false);
    } else {
      history.forEach(function(m){ renderMsg(m.r, m.t); });
    }
    scrollDown();

    function renderMsg(role, text){
      var d = document.createElement("div");
      d.className = "msg " + (role === "user" ? "user" : "bot");
      d.textContent = text;
      body.appendChild(d);
      return d;
    }

    function pushUser(text){
      history.push({ r: "user", t: text });
      store.set("history", history);
      renderMsg("user", text);
      scrollDown();
    }

    function pushBot(text, speak){
      history.push({ r: "bot", t: text });
      store.set("history", history);
      renderMsg("bot", text);
      scrollDown();
      if(speak !== false && window.HalDo.Voice) HalDo.Voice.auto(text);
    }

    function scrollDown(){
      setTimeout(function(){ body.scrollTop = body.scrollHeight; }, 30);
    }

    /* Senden */
    function send(text){
      var t = (text || input.value || "").trim();
      if(!t) return;
      input.value = "";
      input.style.height = "42px";
      pushUser(t);

      var wait = renderMsg("bot", "⏳ Denkt nach…");
      scrollDown();

      if(window.HalDo.AI && HalDo.AI.chat){
        HalDo.AI.chat(t).then(function(answer){
          wait.textContent = answer;
          history.push({ r: "bot", t: answer });
          store.set("history", history);
          scrollDown();
          if(window.HalDo.Voice) HalDo.Voice.auto(answer);
        }).catch(function(err){
          wait.textContent = "❌ " + err.message;
        });
      } else {
        setTimeout(function(){
          var answer = _localAnswer(t);
          wait.textContent = answer;
          history.push({ r: "bot", t: answer });
          store.set("history", history);
          scrollDown();
        }, 400);
      }
    }

    /* Lokale Antworten (Fallback) */
    function _localAnswer(msg){
      var q = msg.toLowerCase();
      var R = {
        "hallo": "Silav, " + (window.HalDo.Config.get("userName") || "Bruder") + "! 🦚 Wie kann ich helfen?",
        "hi": "Silav! 🦚",
        "ezid": "Die Eziden (Êzidî) sind eines der ältesten Völker Mesopotamiens. Zentrum: Laliş. Oberster Engel: Tawûsî Melek. Heilige Schrift: Mushaf Reş. 🦚",
        "mushaf": "Mushaf Reş — Das Schwarze Buch. Heilige Schrift der Eziden. Beschreibt die Schöpfung durch Tawûsî Melek. 🦚",
        "engel": "Die 7 Engel: Tawûsî Melek (So), Şêx Hesen (Mo), Şêx Şems (Di), Şêx Abû Bekr (Mi), Sajad-ad-Dîn (Do), Nasir-ad-Dîn (Fr), Yadin (Sa). 👼",
        "mesopotamien": "Mesopotamien — Wiege der Zivilisation zwischen Euphrat und Tigris. 🏛️",
        "sumerer": "Die Sumerer (ca. 4000 v. Chr.) erfanden die Keilschrift. 📜",
        "qewl": "Qewls sind heilige Hymnen der Eziden. 🕊️",
        "danke": "Spas! 🦚"
      };
      for(var k in R){ if(q.indexOf(k) >= 0) return R[k]; }
      return "Interessant, Bruder! 🦚 Frag mich über Eziden, Mesopotamien oder die 7 Engel.";
    }

    /* Events */
    sendBtn.addEventListener("click", function(){ send(); });
    input.addEventListener("keydown", function(e){
      if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); send(); }
    });
    input.addEventListener("input", function(){
      this.style.height = "42px";
      this.style.height = Math.min(120, this.scrollHeight) + "px";
    });
    container.querySelectorAll("[data-q]").forEach(function(b){
      b.addEventListener("click", function(){ send(b.dataset.q); });
    });
    micBtn.addEventListener("click", function(){
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SR){ return; }
      var rec = new SR();
      rec.lang = window.HalDo.Language ? HalDo.Language.localeCode() : "de-DE";
      var b = this;
      b.style.background = "#ef4444";
      rec.onresult = function(e){ send(e.results[0][0].transcript); };
      rec.onend = function(){ b.style.background = ""; };
      rec.onerror = function(){ b.style.background = ""; };
      rec.start();
    });
  }

  function destroy(){ _container = null; _context = null; }

  if(window.HalDoApp) HalDoApp("chat", { render: render, destroy: destroy });
  else console.warn("chat.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 chat.js geladen");
