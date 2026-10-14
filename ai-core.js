/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI CORE (v150b)
   Gemini · OpenAI · Claude · Als App registriert
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.AI = (function(){
  "use strict";

  var PROVIDERS = {
    gemini: { name: "Gemini", emoji: "🦚", defaultModel: "gemini-2.0-flash", keyField: "aiKeyGemini", modelField: "aiModelGemini", helpUrl: "https://aistudio.google.com/app/apikey" },
    openai: { name: "OpenAI", emoji: "🤖", defaultModel: "gpt-4o-mini", keyField: "aiKeyOpenai", modelField: "aiModelOpenai", helpUrl: "https://platform.openai.com/api-keys" },
    claude: { name: "Claude", emoji: "📖", defaultModel: "claude-3-5-haiku-20241022", keyField: "aiKeyClaude", modelField: "aiModelClaude", helpUrl: "https://console.anthropic.com" }
  };

  function currentProvider(){ return window.HalDo.Config.get("aiProvider", "gemini"); }
  function setProvider(id){
    if(!PROVIDERS[id]) return false;
    window.HalDo.Config.set("aiProvider", id);
    return true;
  }
  function hasKey(providerId){
    var p = providerId || currentProvider();
    var info = PROVIDERS[p];
    if(!info) return false;
    var k = window.HalDo.Config.get(info.keyField, "");
    return k && k.length > 10;
  }
  function getKey(providerId){
    var p = providerId || currentProvider();
    var info = PROVIDERS[p];
    return info ? (window.HalDo.Config.get(info.keyField, "") || "") : "";
  }
  function getModel(providerId){
    var p = providerId || currentProvider();
    var info = PROVIDERS[p];
    if(!info) return "";
    return window.HalDo.Config.get(info.modelField, info.defaultModel) || info.defaultModel;
  }

  function _callGemini(messages, key, model){
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
    var systemParts = messages.filter(function(m){ return m.role === "system"; });
    var convoParts = messages.filter(function(m){ return m.role !== "system"; });
    var body = {
      contents: convoParts.map(function(m){
        return { role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] };
      })
    };
    if(systemParts.length){
      body.systemInstruction = { parts: [{ text: systemParts.map(function(s){ return s.content; }).join("\n") }] };
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function(r){ return r.json(); }).then(function(d){
      if(d.error) throw new Error(d.error.message || "Gemini Fehler");
      if(!d.candidates || !d.candidates[0]) throw new Error("Keine Antwort");
      var c = d.candidates[0];
      if(c.content && c.content.parts && c.content.parts[0]) return c.content.parts[0].text;
      throw new Error("Leere Antwort");
    });
  }

  function _callOpenAI(messages, key, model){
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        messages: messages.map(function(m){ return { role: m.role, content: m.content }; }),
        temperature: 0.7
      })
    }).then(function(r){ return r.json(); }).then(function(d){
      if(d.error) throw new Error(d.error.message || "OpenAI Fehler");
      if(!d.choices || !d.choices[0]) throw new Error("Keine Antwort");
      return d.choices[0].message.content;
    });
  }

  function _callClaude(messages, key, model){
    var systemParts = messages.filter(function(m){ return m.role === "system"; });
    var convoParts = messages.filter(function(m){ return m.role !== "system"; });
    var body = {
      model: model,
      max_tokens: 2048,
      messages: convoParts.map(function(m){ return { role: m.role === "assistant" ? "assistant" : "user", content: m.content }; })
    };
    if(systemParts.length) body.system = systemParts.map(function(s){ return s.content; }).join("\n");
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }).then(function(r){ return r.json(); }).then(function(d){
      if(d.error) throw new Error(d.error.message || "Claude Fehler");
      if(!d.content || !d.content[0]) throw new Error("Keine Antwort");
      return d.content[0].text;
    });
  }

  function _localResponse(prompt){
    var q = String(prompt || "").toLowerCase().trim();
    var responses = {
      "hallo": "Silav Bruder! 🦚 Ich bin HalDo AI. Ohne API-Key funktioniere ich im Offline-Modus. Wie kann ich dir helfen?",
      "hi": "Silav! 🦚 Ich bin im Offline-Modus. Für echte KI-Antworten trage bitte einen API-Key in den Einstellungen ein.",
      "wie geht": "Mir geht's super, Bruder! 😊 Ohne Key kann ich nur einfache Antworten geben.",
      "ezid": "Die Eziden (Êzidî) sind eines der ältesten Völker Mesopotamiens. Zentrum ist Laliş, oberster Engel ist Tawûsî Melek, heilige Schrift ist Mushaf Reş. 🦚",
      "mushaf": "Mushaf Reş ist das Schwarze Buch — heilige Schrift der Eziden. Beschreibt die Schöpfung durch Tawûsî Melek. 🦚",
      "mesopotamien": "Mesopotamien ist die Wiege der Zivilisation zwischen Euphrat und Tigris. 🏛️",
      "sumerer": "Die Sumerer erfanden um 4000 v. Chr. die Keilschrift und die ersten Städte. 📜",
      "danke": "Spas, Bruder! 🦚",
      "was kannst": "Im Offline-Modus kenne ich: Ezidi-Kultur, Mesopotamien, alle 7 Engel, Mushaf Reş. Für mehr → API-Key eintragen! 💪"
    };
    for(var k in responses){ if(q.indexOf(k) >= 0) return responses[k]; }
    return "Ich verstehe dich, Bruder. 🦚 Für echte KI-Antworten brauchst du einen API-Key (Gemini ist kostenlos!). Öffne Einstellungen → AI & Memory → API Key.";
  }

  function chat(userMessage, options){
    options = options || {};
    var provider = options.provider || currentProvider();
    var key = options.key || getKey(provider);
    var model = options.model || getModel(provider);

    if(window.HalDo.Memory) HalDo.Memory.addMessage("user", userMessage, { source: "chat" });

    if(!key || key.length < 10){
      return new Promise(function(resolve){
        var answer = _localResponse(userMessage);
        if(window.HalDo.Memory) HalDo.Memory.addMessage("assistant", answer, { source: "local" });
        resolve(answer);
      });
    }

    var context = [];
    if(window.HalDo.Memory && typeof HalDo.Memory.buildContext === "function") context = HalDo.Memory.buildContext(10);
    if(!context.length || context[context.length - 1].content !== userMessage){
      context.push({ role: "user", content: userMessage });
    }

    var call;
    if(provider === "gemini") call = _callGemini(context, key, model);
    else if(provider === "openai") call = _callOpenAI(context, key, model);
    else if(provider === "claude") call = _callClaude(context, key, model);
    else return Promise.reject(new Error("Unbekannter Provider: " + provider));

    return call.then(function(answer){
      if(window.HalDo.Memory) HalDo.Memory.addMessage("assistant", answer, { source: provider });
      return answer;
    }).catch(function(err){
      var fallback = _localResponse(userMessage) + "\n\n⚠️ (Provider-Fehler: " + err.message + ")";
      if(window.HalDo.Memory) HalDo.Memory.addMessage("assistant", fallback, { source: "fallback" });
      return fallback;
    });
  }

  function render(container, ctx){
    var hist = window.HalDo.Memory ? HalDo.Memory.getHistory(50) : [];
    container.innerHTML = ''
      + '<div id="aiChatBody" style="display:flex;flex-direction:column;gap:10px;min-height:200px;max-height:calc(100% - 120px);overflow-y:auto;padding:6px;margin-bottom:10px;border:1px solid var(--border-soft);border-radius:12px;background:rgba(0,0,0,.15)">'
      + (hist.length ? hist.map(function(m){
          return '<div class="msg ' + (m.role === "user" ? "user" : "bot") + '">' + _esc(m.text) + '</div>';
        }).join("") : '<div style="text-align:center;color:var(--text-mute);padding:30px 10px;font-size:12px">🦚 Frag mich was, Bruder!<br><br>Ich kenne Ezidi, Mesopotamien, alle 7 Engel und vieles mehr.</div>')
      + '</div>'
      + '<div class="chat-quick">'
      +   '<button data-quick="Hallo!">👋 Hallo</button>'
      +   '<button data-quick="Erzähl mir über Eziden">🦚 Eziden</button>'
      +   '<button data-quick="Die 7 Engel?">👼 Engel</button>'
      +   '<button data-quick="Was ist Mushaf Reş?">📖 Mushaf</button>'
      + '</div>'
      + '<div class="chat-input-row">'
      +   '<button class="ibtn" id="aiMic">🎤</button>'
      +   '<textarea id="aiInput" placeholder="Frag HalDo AI…" rows="1"></textarea>'
      +   '<button class="ibtn send" id="aiSend">➤</button>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      +   '<button class="btn sec" id="aiSettingsBtn" style="flex:1">⚙️ API-Key</button>'
      + '</div>';

    var input = container.querySelector("#aiInput");
    var sendBtn = container.querySelector("#aiSend");
    var cb = container.querySelector("#aiChatBody");

    function scrollDown(){ setTimeout(function(){ if(cb) cb.scrollTop = cb.scrollHeight; }, 30); }

    function doSend(){
      var t = input.value.trim();
      if(!t) return;
      input.value = "";
      input.style.height = "42px";
      sendMessage(t);
    }

    function sendMessage(text){
      var userDiv = document.createElement("div");
      userDiv.className = "msg user";
      userDiv.textContent = text;
      cb.appendChild(userDiv);

      var waitDiv = document.createElement("div");
      waitDiv.className = "msg bot";
      waitDiv.textContent = "⏳ Denkt nach…";
      cb.appendChild(waitDiv);
      scrollDown();

      chat(text).then(function(answer){
        waitDiv.textContent = answer;
        scrollDown();
        if(window.HalDo.Voice) HalDo.Voice.auto(answer);
      }).catch(function(err){
        waitDiv.textContent = "❌ Fehler: " + err.message;
      });
    }

    sendBtn.addEventListener("click", doSend);
    input.addEventListener("keydown", function(e){
      if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); doSend(); }
    });
    input.addEventListener("input", function(){
      this.style.height = "42px";
      this.style.height = Math.min(120, this.scrollHeight) + "px";
    });
    container.querySelectorAll("[data-quick]").forEach(function(b){
      b.addEventListener("click", function(){ sendMessage(b.dataset.quick); });
    });
    var mic = container.querySelector("#aiMic");
    if(mic) mic.addEventListener("click", function(){
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SR){ return; }
      var rec = new SR();
      rec.lang = "de-DE";
      var btn = this;
      btn.style.background = "#ef4444";
      rec.onresult = function(e){ sendMessage(e.results[0][0].transcript); };
      rec.onend = function(){ btn.style.background = ""; };
      rec.onerror = function(){ btn.style.background = ""; };
      rec.start();
    });
    var setBtn = container.querySelector("#aiSettingsBtn");
    if(setBtn) setBtn.addEventListener("click", function(){
      var s = document.getElementById("settingsBtn");
      if(s) s.click();
    });

    scrollDown();
  }

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function init(){
    if(window.HalDo.Kernel) HalDo.Kernel.log("AI Core bereit (" + Object.keys(PROVIDERS).length + " Provider)");
  }

  var API = {
    PROVIDERS: PROVIDERS,
    init: init,
    chat: chat,
    currentProvider: currentProvider,
    setProvider: setProvider,
    hasKey: hasKey,
    getKey: getKey,
    getModel: getModel
  };

  /* Als App registrieren */
  if(window.HalDoApp){
    HalDoApp("haldoai", { render: render });
  } else {
    console.warn("ai-core.js: HalDoApp nicht verfügbar — Sonne funktioniert nicht");
  }

  return API;
})();

console.log("🦚 ai-core.js geladen (haldoai-App registriert)");
