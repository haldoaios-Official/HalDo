/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI ENGINE (v200) · LOCAL BRAIN
   WebLLM · 100% lokal · Keine API-Keys
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  // Modelle, die wir unterstützen. Das erste ist unser Standard.
  var MODELS = {
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": { name: "Qwen 2.5 0.5B (schnell)" },
    "Llama-3.2-1B-Instruct-q4f16_1-MLC": { name: "Llama 3.2 1B (besser)" },
    "Llama-3.2-3B-Instruct-q4f16_1-MLC": { name: "Llama 3.2 3B (beste Qualität)" }
  };

  var engine = null;
  var isInitializing = false;

  /* ═══════════════════════════════════════════════════════════
     INITIALISIERUNG
     ═══════════════════════════════════════════════════════════ */
  async function initEngine(modelId){
    if(engine) return engine;
    if(isInitializing) return;

    isInitializing = true;
    var model = modelId || HalDo.Store.get("aiModel", "Qwen2.5-0.5B-Instruct-q4f16_1-MLC");

    console.log("🧠 Lade lokales KI-Modell: " + model + " (nur beim ersten Mal)...");

    try {
      // WebLLM von CDN laden
      if(!window.webllm){
        var script = document.createElement("script");
        script.type = "module";
        script.textContent = `
          import * as webllm from "https://esm.run/@mlc-ai/web-llm";
          window.webllm = webllm;
          window.dispatchEvent(new Event('webllm-loaded'));
        `;
        document.head.appendChild(script);
        await new Promise(function(resolve){ window.addEventListener('webllm-loaded', resolve, { once: true }); });
      }

      // Engine erstellen
      engine = await window.webllm.CreateMLCEngine(model, {
        initProgressCallback: function(report) {
          // Zeige den Fortschritt in der Konsole an
          console.log("🧠 " + report.text);
          // Optional: Sende den Fortschritt an die UI
          window.dispatchEvent(new CustomEvent("haldo:ai-progress", { detail: report }));
        }
      });

      console.log("✅ KI-Modell '" + model + "' erfolgreich geladen und bereit!");
      HalDo.Store.set("aiModel", model);
      isInitializing = false;
      return engine;

    } catch (error) {
      console.error("❌ Fehler beim Laden des KI-Modells:", error);
      isInitializing = false;
      if(window.HalDo && HalDo.Notify){
        HalDo.Notify.error("KI-Modell konnte nicht geladen werden. Prüfe die Konsole.", { app: "ai" });
      }
      throw error;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT-FUNKTION
     ═══════════════════════════════════════════════════════════ */
  async function chat(messages, options){
    if(!engine) await initEngine();
    if(!engine) throw new Error("KI-Engine nicht initialisiert.");

    var opts = options || {};
    // Standard-Parameter
    var request = {
      messages: messages,
      temperature: opts.temperature || 0.7,
      max_tokens: opts.maxTokens || 1024,
      stream: opts.stream || false,
    };

    // Für Streaming (wird für den Chat benötigt, um Wörter live anzuzeigen)
    if(request.stream){
      return await engine.chat.completions.create(request);
    } else {
      var reply = await engine.chat.completions.create(request);
      return reply.choices[0].message.content;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.AIEngine = {
    init: initEngine,
    chat: chat,
    models: MODELS,
    isReady: function(){ return !!engine; },
    getEngine: function(){ return engine; }
  };

  console.log("🦚 ai-engine.js v200 geladen — bereit für lokale KI (WebLLM).");

})();
