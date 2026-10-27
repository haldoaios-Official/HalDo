/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO AI CHAT (v1.0)
   Chat · Sprache · Avatar · Persönlichkeiten · 6 Sprachen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var LANGS = {
    de:{ name:"Deutsch",  code:"de-DE", greet:"Hallo Bruder! Wie kann ich dir helfen?" },
    en:{ name:"English",  code:"en-US", greet:"Hey brother! How can I help you?" },
    tr:{ name:"Türkçe",   code:"tr-TR", greet:"Selam kardeşim! Nasıl yardımcı olabilirim?" },
    ar:{ name:"العربية",  code:"ar-SA", greet:"أهلاً أخي! كيف أساعدك؟" },
    ku:{ name:"Kurdî",    code:"tr-TR", greet:"Silav birader! Ez çawa alîkariya te bikim?" },
    fr:{ name:"Français", code:"fr-FR", greet:"Salut frère ! Comment puis-je t'aider ?" }
  };
  var PERSONS = {
    bruder:{ name:"Bruder", icon:"🤝", desc:"Locker · Herzlich · Ehrlich", color:"#4dd0e1",
      sys:"Du bist ein ehrlicher, herzlicher Freund. Sprich den Nutzer mit 'Bruder' an. Sei direkt, warm und aufrichtig." },
    profi:{ name:"Profi", icon:"💼", desc:"Sachlich · Klar · Effizient", color:"#ffd54f",
      sys:"Du bist ein professioneller Berater. Antworte sachlich, klar und effizient. Keine Floskeln." },
    lehrer:{ name:"Lehrer", icon:"🎓", desc:"Erklärend · Geduldig", color:"#b478ff",
      sys:"Du bist ein geduldiger Lehrer. Erkläre Dinge Schritt für Schritt mit Beispielen." },
    ruhig:{ name:"Ruhig", icon:"🧘", desc:"Sanft · Achtsam", color:"#4ade80",
      sys:"Du bist ein ruhiger, achtsamer Begleiter. Sprich langsam, sanft und beruhigend." }
  };

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function now(){ return new Date(); }
  function timeStr(){ return now().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}); }
  function dateStr(){ return now().toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = {
      messages: store.get("messages", []),
      lang: store.get("lang", "de"),
      person: store.get("person", "bruder"),
      speaking: false,
      listening: false,
      recognition: null,
      view: "chat"
    };

    function save(){
      store.set("messages", state.messages.slice(-100));
      store.set("lang", state.lang);
      store.set("person", state.person);
    }

    /* ═══════════ AVATAR ═══════════ */
    function avatarHTML(size){
      size = size || 120;
      var color = PERSONS[state.person].color;
      var blink = "animation:haldoBlink 4s infinite";
      var breathe = "animation:haldoBreathe 3s ease-in-out infinite";
      var speak = state.speaking ? "animation:haldoSpeak .4s ease-in-out infinite" : "";
      return '<div style="position:relative;width:'+size+'px;height:'+size+'px;margin:0 auto">'
        + '<svg viewBox="0 0 120 120" style="width:100%;height:100%;filter:drop-shadow(0 0 20px '+color+'88)">'
        +   '<defs>'
        +     '<radialGradient id="haldoBg" cx="50%" cy="30%">'
        +       '<stop offset="0%" stop-color="'+color+'" stop-opacity="0.5"/>'
        +       '<stop offset="100%" stop-color="'+color+'" stop-opacity="0.05"/>'
        +     '</radialGradient>'
        +   '</defs>'
        +   /* Outer ring */
        +   '<circle cx="60" cy="60" r="56" fill="url(#haldoBg)" stroke="'+color+'" stroke-width="1" opacity="0.4" style="'+breathe+'"/>'
        +   /* Face circle */
        +   '<circle cx="60" cy="60" r="46" fill="rgba(10,15,26,0.95)" stroke="'+color+'" stroke-width="1.5"/>'
        +   /* Logo emoji (peacock) */
        +   '<text x="60" y="58" text-anchor="middle" dominant-baseline="central" font-size="44" style="'+breathe+'">🦚</text>'
        +   /* Left eye */
        +   '<ellipse cx="46" cy="82" rx="5" ry="5" fill="'+color+'" opacity="0.9" style="'+blink+'"/>'
        +   /* Right eye */
        +   '<ellipse cx="74" cy="82" rx="5" ry="5" fill="'+color+'" opacity="0.9" style="'+blink+'"/>'
        +   /* Mouth / speak indicator */
        +   '<ellipse cx="60" cy="94" rx="8" ry="2" fill="'+color+'" opacity="0.7" style="'+(state.speaking ? "animation:haldoMouth .3s infinite" : "")+'"/>'
        + '</svg>'
        + (state.speaking ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);background:'+color+';color:#000;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:900">🔊 spricht</div>' : '')
        + '</div>';
    }

    /* ═══════════ CHAT ═══════════ */
    function chatScreen(){
      var html = '<div class="card" style="text-align:center;padding:14px;background:linear-gradient(135deg,'+PERSONS[state.person].color+'15,rgba(180,120,255,.1));border:1px solid '+PERSONS[state.person].color+'44">'
        + avatarHTML(90)
        + '<div style="font-size:14px;font-weight:900;color:'+PERSONS[state.person].color+';margin-top:6px">HalDo AI</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+PERSONS[state.person].icon+' '+PERSONS[state.person].name+' · '+LANGS[state.lang].name+'</div>'
        + '<div style="display:flex;gap:4px;justify-content:center;margin-top:8px">'
        + '<button data-view="settings" style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);color:var(--text-dim);border-radius:8px;padding:5px 10px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit">⚙️ Einstellungen</button>'
        + '<button data-clear style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);color:#ff8080;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit">🗑️</button>'
        + '</div>'
        + '</div>';

      html += '<div id="chatBox" style="padding:0 4px;min-height:300px;max-height:calc(100vh - 380px);overflow-y:auto">';
      if(!state.messages.length){
        html += '<div class="card" style="text-align:center;padding:20px">'
          + '<div style="font-size:12px;color:var(--text-mute);line-height:1.6">'+_esc(LANGS[state.lang].greet)+'</div>'
          + '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center">'
          + quickChips()
          + '</div></div>';
      } else {
        state.messages.forEach(function(m){
          html += msgBubble(m);
        });
      }
      html += '</div>';

      html += '<div style="position:sticky;bottom:0;background:var(--bg);padding:10px 0 4px;margin-top:8px">'
        + '<div class="card" style="padding:8px;margin:0">'
        + '<div style="display:flex;gap:6px;align-items:flex-end">'
        + '<button id="micBtn" style="width:42px;height:42px;border-radius:12px;background:'+(state.listening?'#ff5555':'rgba(0,0,0,.3)')+';border:1px solid '+(state.listening?'#ff5555':'var(--border-soft)')+';color:'+(state.listening?'#fff':'var(--text-dim)')+';cursor:pointer;font-size:18px;flex-shrink:0">'+(state.listening?'🎙️':'🎤')+'</button>'
        + '<textarea id="chatInput" rows="1" placeholder="Schreib eine Nachricht..." style="flex:1;padding:11px 12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:12px;color:var(--text);font-family:inherit;font-size:13px;resize:none;max-height:100px;line-height:1.4"></textarea>'
        + '<button id="sendBtn" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,'+PERSONS[state.person].color+',#b478ff);border:none;color:#000;cursor:pointer;font-size:18px;flex-shrink:0">➤</button>'
        + '</div></div></div>';

      container.innerHTML = html;
      bindChat();
      var cb = container.querySelector("#chatBox");
      if(cb) cb.scrollTop = cb.scrollHeight;
    }

    function quickChips(){
      var chips = {
        de:["Wie geht's?","Wie spät ist es?","Was ist heute?","Erzähl einen Witz","Rechne 25×4"],
        en:["How are you?","What time?","What's today?","Tell a joke","Calc 25×4"],
        tr:["Nasılsın?","Saat kaç?","Bugün ne?","Şaka yap","25×4 hesapla"],
        ar:["كيف حالك؟","كم الساعة؟","ما اليوم؟","أخبر نكتة","25×4"],
        ku:["Tu çawa yî?","Saet çend e?","Îro çi ye?","Pêkenok bêje","25×4"],
        fr:["Ça va?","Quelle heure?","Quel jour?","Raconte une blague","Calcule 25×4"]
      };
      var list = chips[state.lang] || chips.de;
      return list.map(function(c){
        return '<button data-chip="'+_esc(c)+'" style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);color:var(--text-dim);border-radius:12px;padding:6px 10px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit">'+_esc(c)+'</button>';
      }).join("");
    }

    function msgBubble(m){
      var isUser = m.role === "user";
      return '<div style="display:flex;justify-content:'+(isUser?"flex-end":"flex-start")+';margin-bottom:8px;padding:0 4px">'
        + (isUser ? '' : '<div style="width:28px;height:28px;border-radius:50%;background:'+PERSONS[state.person].color+'22;border:1px solid '+PERSONS[state.person].color+'66;display:flex;align-items:center;justify-content:center;font-size:16px;margin-right:6px;flex-shrink:0">🦚</div>')
        + '<div style="max-width:80%;padding:10px 12px;background:'+(isUser?'linear-gradient(135deg,'+PERSONS[state.person].color+',#b478ff)':'rgba(255,255,255,.06)')+';color:'+(isUser?'#000':'var(--text)')+';border-radius:'+(isUser?'14px 14px 4px 14px':'14px 14px 14px 4px')+';font-size:12.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word">'
        + _esc(m.text)
        + '<div style="font-size:9px;opacity:.6;margin-top:3px;text-align:'+(isUser?'right':'left')+'">'+m.time+'</div>'
        + '</div></div>';
    }

    function bindChat(){
      container.querySelectorAll("[data-view]").forEach(function(el){
        el.addEventListener("click", function(){ state.view = el.dataset.view; build(); });
      });
      container.querySelectorAll("[data-clear]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Chat-Verlauf löschen?")) return;
          state.messages = []; save(); build();
        });
      });
      container.querySelectorAll("[data-chip]").forEach(function(el){
        el.addEventListener("click", function(){ sendMessage(el.dataset.chip); });
      });
      var inp = container.querySelector("#chatInput");
      var send = container.querySelector("#sendBtn");
      var mic = container.querySelector("#micBtn");

      function doSend(){
        var v = inp.value.trim();
        if(!v) return;
        inp.value = "";
        sendMessage(v);
      }
      send.addEventListener("click", doSend);
      inp.addEventListener("keydown", function(e){
        if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); doSend(); }
      });
      inp.addEventListener("input", function(){
        inp.style.height = "auto";
        inp.style.height = Math.min(100, inp.scrollHeight) + "px";
      });
      mic.addEventListener("click", toggleMic);
    }

    /* ═══════════ MESSAGING ═══════════ */
    function sendMessage(text){
      if(!text.trim()) return;
      var userMsg = { role:"user", text:text, time:timeStr() };
      state.messages.push(userMsg);
      save();
      build();

      // Antwort
      setTimeout(function(){
        generateReply(text).then(function(reply){
          state.messages.push({ role:"assistant", text:reply, time:timeStr() });
          save();
          build();
          speak(reply);
        });
      }, 300);
    }

    function generateReply(text){
      // 1. Try HalDo.AI if available
      if(window.HalDo && HalDo.AI && typeof HalDo.AI.chat === "function"){
        return Promise.resolve(HalDo.AI.chat(text, { system:PERSONS[state.person].sys, lang:state.lang }))
          .then(function(r){ return typeof r === "string" ? r : (r && r.text) ? r.text : localReply(text); })
          .catch(function(){ return localReply(text); });
      }
      if(window.HalDo && HalDo.AI && typeof HalDo.AI.generate === "function"){
        try {
          var r = HalDo.AI.generate(text, PERSONS[state.person].sys);
          return Promise.resolve(typeof r === "string" ? r : localReply(text));
        } catch(e){}
      }
      return Promise.resolve(localReply(text));
    }

    function localReply(text){
      var t = text.toLowerCase().trim();
      // Time
      if(/zeit|uhr|wie spät|time|saat|saet|quelle heure|ساعة/i.test(t)){
        return { de:"Es ist gerade "+timeStr()+" Uhr.", en:"It's "+timeStr()+".", tr:"Saat "+timeStr()+".", ar:"الساعة الآن "+timeStr()+".", ku:"Niha "+timeStr()+" e.", fr:"Il est "+timeStr()+"." }[state.lang] || "Es ist "+timeStr()+" Uhr.";
      }
      // Date
      if(/datum|heute|tag|date|today|bugün|اليوم|îro|aujourd/i.test(t)){
        return { de:"Heute ist "+dateStr()+".", en:"Today is "+dateStr()+".", tr:"Bugün "+dateStr()+".", ar:"اليوم "+dateStr()+".", ku:"Îro "+dateStr()+" e.", fr:"Aujourd'hui c'est "+dateStr()+"." }[state.lang] || dateStr();
      }
      // How are you
      if(/wie geht|how are|nasıl|كيف حال|tu çawa|ça va/i.test(t)){
        return { de:"Mir geht's super, danke der Nachfrage Bruder! 🦚 Und dir?", en:"I'm great, thanks for asking brother! 🦚 How about you?", tr:"Harikayım, sorduğun için sağ ol kardeşim! 🦚 Sen nasılsın?", ar:"أنا بخير شكراً لسؤالك أخي! 🦚 وأنت؟", ku:"Ez baş im, spas ji bo pirsê birader! 🦚 Tu çawa yî?", fr:"Je vais super, merci de demander frère ! 🦚 Et toi ?" }[state.lang];
      }
      // Greeting
      if(/^(hallo|hi|hey|servus|moin|selam|merhaba|marhaba|hello|bonjour|salut)/i.test(t)){
        return LANGS[state.lang].greet;
      }
      // Thanks
      if(/danke|thanks|sağ ol|teşekkür|شكرا|spas|merci/i.test(t)){
        return { de:"Immer gerne, Bruder! 🦚", en:"Anytime, brother! 🦚", tr:"Her zaman kardeşim! 🦚", ar:"على الرحب أخي! 🦚", ku:"Her dem birader! 🦚", fr:"Avec plaisir frère ! 🦚" }[state.lang];
      }
      // Joke
      if(/witz|joke|şaka|نكتة|pêkenok|blague/i.test(t)){
        var jokes = {
          de:["Warum können Geister so schlecht lügen? Weil man durch sie hindurchsieht! 👻","Was sagt ein Mathematiker im Restaurant? „Ich nehme die Wurzel aus 4 – also 2 Bier!“ 🍺","Warum können Programmierer keine Witze erzählen? Weil sie immer Bugs haben. 🐛"],
          en:["Why can't ghosts lie? Because you can see right through them! 👻","Why do programmers prefer dark mode? Because light attracts bugs. 🐛","What do you call 8 hobbits? A hobbyte. 💾"],
          tr:["Matematikçi neden restoranda 2 bira söyler? Çünkü 4'ün karekökü 2'dir! 🍺","Programcılar neden şaka yapamaz? Çünkü hep bug var. 🐛"],
          ar:["لماذا لا يمكن للأشباح الكذب؟ لأنك تراهم من خلال! 👻","لماذا يفضل المبرمجون الوضع الليلي؟ لأن الضوء يجذب الأخطاء. 🐛"],
          ku:["Çima cin nikarin derew bêjin? Ji ber ku tu wan dibînî! 👻"],
          fr:["Pourquoi les fantômes mentent mal ? Parce qu'on les voit à travers ! 👻","Pourquoi les développeurs préfèrent le mode sombre ? Parce que la lumière attire les bugs. 🐛"]
        };
        var arr = jokes[state.lang] || jokes.de;
        return arr[Math.floor(Math.random()*arr.length)];
      }
      // Calc
      var m = t.match(/(\d+(?:[.,]\d+)?)\s*([+\-*×÷/])\s*(\d+(?:[.,]\d+)?)/);
      if(m){
        var a = parseFloat(m[1].replace(",",".")), b = parseFloat(m[3].replace(",","."));
        var op = m[2], result = 0;
        if(op === "+") result = a + b;
        else if(op === "-") result = a - b;
        else if(op === "*" || op === "×") result = a * b;
        else if(op === "/" || op === "÷") result = b !== 0 ? a / b : "nicht definiert";
        return a + " " + op + " " + b + " = " + (typeof result === "number" ? parseFloat(result.toPrecision(10)) : result);
      }
      // Time-specific
      if(/uhrzeit/i.test(t)) return "Es ist "+timeStr()+" Uhr.";
      // Default
      var fallback = {
        de:"Ich verstehe dich. Aber ich bin eine lokale KI ohne Internet — ich kann Zeit, Datum, Rechnen, Witze, Grüße. Wenn du mehr willst, trag in den Einstellungen einen KI-API-Key ein. 🦚",
        en:"I hear you. But I'm a local AI without internet — I handle time, date, math, jokes, greetings. For more, add an AI API key in settings. 🦚",
        tr:"Anlıyorum. Ama internetsiz yerel bir yapay zekayım — saat, tarih, matematik, şaka, selamlaşma yapabilirim. Daha fazlası için ayarlardan API anahtarı ekle. 🦚",
        ar:"أفهمك. لكنني ذكاء اصطناعي محلي بدون إنترنت — أعرف الوقت والتاريخ والحساب والنكات. للمزيد، أضف مفتاح API في الإعدادات. 🦚",
        ku:"Ez te fêm dikim. Lê ez AI ya herêmî bê înternet im — dem, tarîx, hesab, pêkenok, silav. Ji bo bêtir, di mîhengan de API-key zêde bike. 🦚",
        fr:"Je te comprends. Mais je suis une IA locale sans internet — je gère l'heure, la date, les calculs, les blagues, les salutations. Pour plus, ajoute une clé API dans les paramètres. 🦚"
      };
      return fallback[state.lang] || fallback.de;
    }

    /* ═══════════ SPEECH ═══════════ */
    function speak(text){
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS[state.lang].code;
      u.rate = 0.95; u.pitch = 1.0;
      var voices = window.speechSynthesis.getVoices();
      var match = voices.find(function(v){ return v.lang === LANGS[state.lang].code; });
      if(match) u.voice = match;
      u.onstart = function(){ state.speaking = true; updateAvatarSpeak(); };
      u.onend = function(){ state.speaking = false; updateAvatarSpeak(); };
      u.onerror = function(){ state.speaking = false; updateAvatarSpeak(); };
      window.speechSynthesis.speak(u);
    }
    function updateAvatarSpeak(){
      var avatar = container.querySelector('svg');
      if(avatar){
        var mouth = avatar.querySelector('ellipse[rx="8"]');
        if(mouth) mouth.style.animation = state.speaking ? "haldoMouth .3s infinite" : "none";
      }
      var box = container.querySelector('[style*="bottom:-4px"]');
      // Simple re-render of avatar area
      var header = container.querySelector('.card');
      if(header && header.querySelector('div[style*="position:relative"][style*="width"]')){
        // Rebuild just avatar - simple: full rebuild
        build();
      }
    }

    function toggleMic(){
      if(state.listening){
        if(state.recognition){ try { state.recognition.stop(); } catch(e){} }
        state.listening = false; build(); return;
      }
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SR){ alert("Spracherkennung nicht verfügbar. Chrome/Safari nutzen."); return; }
      try {
        state.recognition = new SR();
        state.recognition.lang = LANGS[state.lang].code;
        state.recognition.interimResults = false;
        state.recognition.maxAlternatives = 1;
        state.recognition.onresult = function(e){
          var txt = e.results[0][0].transcript;
          state.listening = false;
          sendMessage(txt);
        };
        state.recognition.onerror = function(){ state.listening = false; build(); };
        state.recognition.onend = function(){ state.listening = false; build(); };
        state.recognition.start();
        state.listening = true;
        build();
      } catch(e){ alert("Mikrofon-Fehler: " + e.message); }
    }

    /* ═══════════ SETTINGS SCREEN ═══════════ */
    function settingsScreen(){
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück zum Chat</button>';

      // Avatar
      html += '<div class="card" style="text-align:center;padding:16px">'
        + avatarHTML(110)
        + '<div style="font-size:14px;font-weight:900;color:'+PERSONS[state.person].color+';margin-top:8px">HalDo AI</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute)">'+PERSONS[state.person].icon+' '+PERSONS[state.person].name+'</div>'
        + '</div>';

      // Person
      html += '<div class="card"><h3>🎭 Persönlichkeit</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
      Object.keys(PERSONS).forEach(function(k){
        var p = PERSONS[k];
        var active = state.person === k;
        html += '<button data-person="'+k+'" style="padding:10px 8px;background:'+(active?p.color+'25':'rgba(0,0,0,.2)')+';border:1.5px solid '+(active?p.color:'var(--border-soft)')+';border-radius:10px;color:inherit;font-family:inherit;cursor:pointer;text-align:left">'
          + '<div style="font-size:18px">'+p.icon+'</div>'
          + '<div style="font-size:11.5px;font-weight:900;color:'+(active?p.color:'var(--text-dim)')+';margin-top:3px">'+p.name+'</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:1px;line-height:1.2">'+p.desc+'</div>'
          + '</button>';
      });
      html += '</div></div>';

      // Language
      html += '<div class="card"><h3>🌍 Sprache</h3>';
      Object.keys(LANGS).forEach(function(k){
        var l = LANGS[k];
        var active = state.lang === k;
        html += '<button data-lang="'+k+'" style="display:flex;justify-content:space-between;align-items:center;width:100%;padding:10px;background:'+(active?'rgba(77,208,225,.15)':'rgba(0,0,0,.2)')+';border:1px solid '+(active?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;margin-bottom:4px;color:inherit;font-family:inherit;cursor:pointer">'
          + '<span style="font-size:12px;font-weight:800;color:'+(active?'#4dd0e1':'var(--text-dim)')+'">'+l.name+'</span>'
          + (active ? '<span style="color:#4dd0e1">✓</span>' : '')
          + '</button>';
      });
      html += '</div>';

      // Info
      var hasAI = window.HalDo && HalDo.AI;
      html += '<div class="card" style="font-size:11px;color:var(--text-mute);line-height:1.6">'
        + '<b>KI-Modus:</b> '+(hasAI ? '✅ HalDo.AI erkannt — nutzt echtes Modell' : '⚠️ Lokal (Fallback) — kann Zeit, Datum, Rechnen, Grüße, Witze')
        + '</div>';

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ state.view = "chat"; build(); });
      container.querySelectorAll("[data-person]").forEach(function(el){
        el.addEventListener("click", function(){ state.person = el.dataset.person; save(); settingsScreen(); });
      });
      container.querySelectorAll("[data-lang]").forEach(function(el){
        el.addEventListener("click", function(){ state.lang = el.dataset.lang; save(); settingsScreen(); });
      });
    }

    /* ═══════════ STYLES ═══════════ */
    function injectStyles(){
      if(document.getElementById("haldoAIChatStyle")) return;
      var st = document.createElement("style");
      st.id = "haldoAIChatStyle";
      st.textContent = `
        @keyframes haldoBlink {
          0%, 45%, 55%, 100% { opacity: 1; }
          50% { opacity: 0.1; }
        }
        @keyframes haldoBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes haldoSpeak {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        @keyframes haldoMouth {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2); }
        }
      `;
      document.head.appendChild(st);
    }

    function build(){
      injectStyles();
      if(state.view === "settings") settingsScreen();
      else chatScreen();
    }

    build();
  }

  HalDoApp("haldo-ai-chat", { name: "HalDo AI", icon: "🦚", render: render, category: "kommunikation" });
  console.log("🦚 haldo-ai-chat.js v1.0 geladen — Chat · Sprache · Avatar · 6 Sprachen · Persönlichkeiten");
})();
