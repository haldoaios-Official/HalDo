/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI CHAT (v200) · LOCAL KI
   WebLLM · Streaming · Kein API-Key · 100% lokal
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  var SYSTEM_PROMPT = "Du bist HalDo, ein freundlicher, hilfsbereiter KI-Assistent. Antworte kurz, präzise und auf Deutsch. Du bist Teil des HalDo AI OS und hilfst dem Nutzer bei allen Aufgaben.";

  function render(container, ctx){
    var store = ctx.store;
    var streaming = false;

    function build(){
      var history = store.get("history", [
        { role: "assistant", content: "Hallo Bruder! 🦚 Ich bin HalDo — deine lokale KI. Frag mich was!" }
      ]);
      var currentModel = HalDo.Store.get("aiModel", "Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
      var aiReady = HalDo.AIEngine && HalDo.AIEngine.isReady();
      var models = HalDo.AIEngine ? HalDo.AIEngine.models : {};

      var body = '';

      /* ═══ STATUS BANNER ═══ */
      if(!aiReady){
        body += '<div class="card" style="background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(0,229,255,.15));border-left:3px solid #fbbf24">'
          + '<div style="font-size:13px;font-weight:900;color:#fbbf24;margin-bottom:6px">🧠 KI noch nicht geladen</div>'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.5;margin-bottom:10px">'
          + 'Beim ersten Mal dauert es ~40 Sekunden. Danach startet die KI in ~5 Sekunden aus dem Cache.'
          + '</div>'
          + '<button class="btn full" id="loadAI" style="font-size:12px">🚀 KI jetzt laden</button>'
          + '<div id="aiProgress" style="display:none;margin-top:12px">'
          + '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden">'
          + '<div id="aiProgressBar" style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:0%;transition:.3s"></div>'
          + '</div>'
          + '<div id="aiProgressText" style="font-size:10.5px;color:var(--text-mute);margin-top:6px;text-align:center">Bereit zum Laden</div>'
          + '</div>'
          + '</div>';
      } else {
        body += '<div class="card" style="background:linear-gradient(135deg,rgba(74,222,128,.1),rgba(0,229,255,.1));border-left:3px solid #4ade80;display:flex;justify-content:space-between;align-items:center">'
          + '<div>'
          + '<div style="font-size:11px;color:#4ade80;font-weight:900">✅ KI LÄUFT LOKAL</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(models[currentModel] ? models[currentModel].name : currentModel) + '</div>'
          + '</div>'
          + '<button class="btn sec" id="btnModel" style="font-size:10px;padding:6px 10px">⚙️</button>'
          + '</div>';
      }

      /* ═══ CHAT ═══ */
      var chatHeight = aiReady ? "calc(100vh - 340px)" : "calc(100vh - 400px)";
      body += '<div class="card" style="padding:0;overflow:hidden">'
        + '<div id="aiBox" style="padding:14px;max-height:' + chatHeight + ';min-height:200px;overflow-y:auto">';

      history.forEach(function(m){
        var isUser = m.role === "user";
        body += '<div style="margin-bottom:10px;display:flex;justify-content:' + (isUser ? "flex-end" : "flex-start") + '">'
          + '<div style="max-width:85%;padding:10px 14px;background:' + (isUser ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.3)") + ';color:' + (isUser ? "#000" : "var(--text)") + ';border-radius:14px;font-size:13px;line-height:1.55;word-break:break-word;white-space:pre-wrap">'
          + _esc(m.content)
          + '</div></div>';
      });

      body += '</div></div>';

      /* ═══ INPUT ═══ */
      body += '<div class="card" style="padding:10px">'
        + '<div style="display:flex;gap:6px">'
        + '<textarea id="aiInp" placeholder="' + (aiReady ? "Nachricht eingeben..." : "KI zuerst laden ↑") + '" rows="1" ' + (aiReady ? "" : "disabled") + ' style="flex:1;padding:10px 12px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:none;max-height:100px"></textarea>'
        + '<button class="btn" id="aiSend" ' + (aiReady ? "" : "disabled") + ' style="padding:0 16px;font-size:16px">➤</button>'
        + '</div>';

      if(aiReady){
        body += '<div style="display:flex;gap:6px;margin-top:8px;overflow-x:auto;scrollbar-width:none">'
          + '<button class="btn sec" data-quick="Erkläre mir kurz was HalDo AI OS ist" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">💡 Was ist HalDo?</button>'
          + '<button class="btn sec" data-quick="Gib mir einen kurzen Witz" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">😄 Witz</button>'
          + '<button class="btn sec" data-quick="Erzähl mir 3 Motivationstipps" style="font-size:10.5px;padding:6px 10px;white-space:nowrap">💪 Motivation</button>'
          + '</div>';
      }

      body += '<div style="display:flex;gap:6px;margin-top:8px">'
        + '<button class="btn sec" id="aiClear" style="flex:1;font-size:10.5px">🗑️ Verlauf löschen</button>'
        + '<button class="btn sec" id="aiSpeak" style="font-size:10.5px;padding:8px 12px">🔊</button>'
        + '</div>'
        + '</div>';

      container.innerHTML = body;

      /* Auto-Scroll */
      var box = container.querySelector("#aiBox");
      if(box) box.scrollTop = box.scrollHeight;

      /* ═══ EVENT: KI LADEN ═══ */
      var loadBtn = container.querySelector("#loadAI");
      if(loadBtn) loadBtn.addEventListener("click", async function(){
        loadBtn.disabled = true;
        loadBtn.textContent = "⏳ Lade...";
        var progWrap = container.querySelector("#aiProgress");
        var progBar = container.querySelector("#aiProgressBar");
        var progText = container.querySelector("#aiProgressText");
        progWrap.style.display = "block";

        /* Progress-Listener */
        var progressHandler = function(e){
          progBar.style.width = e.detail.progress + "%";
          progText.textContent = e.detail.progress + "% — " + (e.detail.text || "").substring(0, 60);
        };
        window.addEventListener("haldo:ai-progress", progressHandler);

        try {
          await HalDo.AIEngine.init();
          window.removeEventListener("haldo:ai-progress", progressHandler);
          if(HalDo.Notify) HalDo.Notify.success("🧠 KI ist bereit!", { app: "ai" });
          build();
        } catch(e){
          window.removeEventListener("haldo:ai-progress", progressHandler);
          progText.textContent = "❌ Fehler: " + e.message;
          progText.style.color = "#ff8080";
          loadBtn.disabled = false;
          loadBtn.textContent = "🔄 Erneut versuchen";
        }
      });

      /* ═══ EVENT: SENDEN ═══ */
      var sendBtn = container.querySelector("#aiSend");
      var inp = container.querySelector("#aiInp");

      async function send(){
        if(streaming) return;
        var txt = inp.value.trim();
        if(!txt) return;

        streaming = true;
        inp.value = "";
        inp.disabled = true;
        sendBtn.disabled = true;

        history.push({ role: "user", content: txt });
        store.set("history", history);

        /* User-Nachricht + leere KI-Blase anzeigen */
        var chatBox = container.querySelector("#aiBox");
        chatBox.innerHTML += '<div style="margin-bottom:10px;display:flex;justify-content:flex-end">'
          + '<div style="max-width:85%;padding:10px 14px;background:linear-gradient(135deg,var(--p1),var(--p3));color:#000;border-radius:14px;font-size:13px;line-height:1.55;word-break:break-word;white-space:pre-wrap">'
          + _esc(txt)
          + '</div></div>';

        var aiBubbleId = "ai_stream_" + Date.now();
        chatBox.innerHTML += '<div style="margin-bottom:10px;display:flex;justify-content:flex-start">'
          + '<div id="' + aiBubbleId + '" style="max-width:85%;padding:10px 14px;background:rgba(0,0,0,.3);border-radius:14px;font-size:13px;line-height:1.55;word-break:break-word;white-space:pre-wrap;color:var(--text)">🧠 Denkt nach...</div>'
          + '</div>';

        chatBox.scrollTop = chatBox.scrollHeight;

        try {
          /* Messages-Array für die Engine */
          var messages = [
            { role: "system", content: SYSTEM_PROMPT }
          ];
          /* Letzte 10 Nachrichten für Kontext */
          history.slice(-10).forEach(function(m){
            messages.push({ role: m.role, content: m.content });
          });

          var bubble = container.querySelector("#" + aiBubbleId);
          var fullText = "";
          var firstChunk = true;

          await HalDo.AIEngine.chatStream(messages, function(delta, full){
            if(firstChunk){
              bubble.textContent = "";
              firstChunk = false;
            }
            fullText = full;
            bubble.textContent = fullText;
            chatBox.scrollTop = chatBox.scrollHeight;
          }, { temperature: 0.7, maxTokens: 800 });

          /* Antwort in History speichern */
          history.push({ role: "assistant", content: fullText });
          store.set("history", history);

        } catch(e){
          var bubble2 = container.querySelector("#" + aiBubbleId);
          if(bubble2) bubble2.textContent = "❌ Fehler: " + e.message;
          if(HalDo.Notify) HalDo.Notify.error("KI-Fehler: " + e.message, { app: "ai" });
        }

        streaming = false;
        inp.disabled = false;
        sendBtn.disabled = false;
        inp.focus();
      }

      if(sendBtn) sendBtn.addEventListener("click", send);
      if(inp){
        inp.addEventListener("keydown", function(e){
          if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            send();
          }
        });
        inp.focus();
      }

      /* ═══ EVENT: QUICK-BUTTONS ═══ */
      container.querySelectorAll("[data-quick]").forEach(function(el){
        el.addEventListener("click", function(){
          inp.value = el.dataset.quick;
          send();
        });
      });

      /* ═══ EVENT: CLEAR ═══ */
      var clr = container.querySelector("#aiClear");
      if(clr) clr.addEventListener("click", function(){
        if(!confirm("Verlauf löschen?")) return;
        store.set("history", [{ role: "assistant", content: "Verlauf geleert! 🦚" }]);
        build();
      });

      /* ═══ EVENT: SPEAK ═══ */
      var spk = container.querySelector("#aiSpeak");
      if(spk) spk.addEventListener("click", function(){
        var last = null;
        for(var i = history.length - 1; i >= 0; i--){
          if(history[i].role === "assistant"){ last = history[i]; break; }
        }
        if(last && HalDo.Voice){
          HalDo.Voice.speak(last.content);
        }
      });

      /* ═══ EVENT: MODEL SWITCH ═══ */
      var mBtn = container.querySelector("#btnModel");
      if(mBtn) mBtn.addEventListener("click", function(){
        var list = Object.keys(models).map(function(k){
          return k + " — " + models[k].name + " " + models[k].size;
        }).join("\n");
        var choice = prompt("Modell wählen (Nummer):\n\n" + list + "\n\nAktuell: " + currentModel + "\n\n1 = Qwen 0.5B (schnell)\n2 = Llama 1B (mittel)\n3 = Llama 3B (beste)");
        if(!choice) return;
        var keys = Object.keys(models);
        var idx = parseInt(choice) - 1;
        if(idx >= 0 && idx < keys.length){
          var newModel = keys[idx];
          if(confirm("Zu '" + newModel + "' wechseln? (~40s Download beim ersten Mal)")){
            HalDo.AIEngine.switchModel(newModel).then(function(){
              if(HalDo.Notify) HalDo.Notify.success("Modell: " + newModel, { app: "ai" });
              build();
            }).catch(function(e){
              if(HalDo.Notify) HalDo.Notify.error(e.message, { app: "ai" });
            });
          }
        }
      });
    }

    build();
  }

  HalDoApp("ai", { name: "AI Chat", icon: "🧠", render: render, category: "kommunikation" });
  console.log("🦚 ai.js v200 geladen — LOCAL KI Chat");
})();
