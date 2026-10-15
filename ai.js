/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI CHAT (v152) · Lokaler Regel-Chat
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;

    function answer(q){
      var s = q.toLowerCase();
      if(/hallo|hi|hey|servus/.test(s)) return "Hallo Bruder! 🦚 Wie kann ich helfen?";
      if(/wie geht|wie läuft/.test(s)) return "Mir geht es super! Ich bin bereit für dich. 💙";
      if(/wetter/.test(s)) return "Öffne die Wetter-App für Details. ☀️";
      if(/zeit|uhr/.test(s)) return "Es ist " + new Date().toLocaleTimeString("de-DE");
      if(/datum|tag/.test(s)) return "Heute ist " + new Date().toLocaleDateString("de-DE", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
      if(/hilfe|help/.test(s)) return "Ich kann: Zeit, Datum, Wetter, Aufgaben, Notizen, Fitness-Tipps, Rezepte, Motivation!";
      if(/motivation|motivier/.test(s)) return "Du schaffst das, Bruder! 🦚 Ein Schritt nach dem anderen.";
      if(/danke/.test(s)) return "Immer gerne! 💙";
      if(/wer bist|name/.test(s)) return "Ich bin HalDo AI OS — dein persönlicher Assistent! 🦚";
      if(/rezept|kochen|essen/.test(s)) return "Öffne die Küche-App für 10 Rezepte — inkl. Kutilk & Dolma! 🍳";
      if(/sport|fitness|workout/.test(s)) return "💪 Tipp: 3× pro Woche Ganzkörper-Training reicht für Anfänger!";
      if(/wasser|trinken/.test(s)) return "💧 Ziel: 8 Gläser Wasser am Tag!";
      if(/schlaf|müde/.test(s)) return "😴 7-8 Stunden Schlaf sind optimal für Regeneration.";
      if(/task|aufgabe/.test(s)) return "Öffne die Aufgaben-App — dort kannst du Tasks erstellen!";
      if(/notiz/.test(s)) return "Öffne die Notizen-App zum Schreiben!";
      return "Interessant! 🤔 Ich bin ein einfacher Chat ohne KI-Backend. Für echte KI: später mit WebLLM möglich!";
    }

    function build(){
      var history = store.get("history", [
        { role: "ai", text: "Hallo Bruder! 🦚 Ich bin HalDo. Frag mich was!" }
      ]);

      var body = '<div class="card" style="max-height:calc(100vh - 260px);overflow-y:auto;padding:14px" id="chatBox">';
      history.forEach(function(m){
        var isUser = m.role === "user";
        body += '<div style="margin-bottom:10px;display:flex;justify-content:' + (isUser ? "flex-end" : "flex-start") + '">'
          + '<div style="max-width:82%;padding:10px 14px;background:' + (isUser ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.3)") + ';color:' + (isUser ? "#000" : "var(--text)") + ';border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word">'
          + _esc(m.text)
          + '</div></div>';
      });
      body += '</div>';

      body += '<div class="card" style="padding:10px">'
        + '<div style="display:flex;gap:6px">'
        + '<input type="text" id="chatInp" placeholder="Nachricht..." autocomplete="off" style="flex:1;padding:11px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<button class="btn" id="chatSend" style="padding:0 16px">➤</button>'
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:8px;overflow-x:auto">'
        + '<button class="btn sec" data-quick="Wie geht es dir?" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">Wie geht es dir?</button>'
        + '<button class="btn sec" data-quick="Motivation bitte" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">Motivation</button>'
        + '<button class="btn sec" data-quick="Wie viel Wasser?" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">Wasser</button>'
        + '<button class="btn sec" data-quick="Sport Tipp" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">Sport</button>'
        + '</div>'
        + '<button class="btn sec full" id="chatClear" style="margin-top:8px;font-size:11px">🗑️ Verlauf löschen</button>'
        + '</div>';

      container.innerHTML = body;

      var box = container.querySelector("#chatBox");
      if(box) box.scrollTop = box.scrollHeight;

      function send(){
        var inp = container.querySelector("#chatInp");
        var txt = inp.value.trim();
        if(!txt) return;
        history.push({ role: "user", text: txt });
        store.set("history", history);
        inp.value = "";

        var reply = answer(txt);
        setTimeout(function(){
          history.push({ role: "ai", text: reply });
          store.set("history", history);
          build();
          if(HalDo.Voice && HalDo.Store.get("voiceEnabled", true)) HalDo.Voice.speak(reply);
        }, 350);
        build();
      }

      container.querySelector("#chatSend").addEventListener("click", send);
      container.querySelector("#chatInp").addEventListener("keydown", function(e){
        if(e.key === "Enter") send();
      });
      container.querySelectorAll("[data-quick]").forEach(function(el){
        el.addEventListener("click", function(){
          container.querySelector("#chatInp").value = el.dataset.quick;
          send();
        });
      });
      container.querySelector("#chatClear").addEventListener("click", function(){
        if(!confirm("Verlauf löschen?")) return;
        store.set("history", [{ role: "ai", text: "Verlauf geleert! 🦚" }]);
        build();
      });
    }

    function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

    build();
  }

  HalDoApp("ai", { name: "AI Chat", icon: "🧠", render: render, category: "kommunikation" });
  console.log("🦚 ai.js geladen");
})();
