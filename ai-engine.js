/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI ENGINE (v200) · LOCAL BRAIN
   WebLLM · 100% lokal · Keine API-Keys · WebGPU
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  /* ═══════════════════════════════════════════════════════════
     MODELLE — Auswahl aus 163 vorkompilierten Builds
     ═══════════════════════════════════════════════════════════ */
  var MODELS = {
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": {
      name: "Qwen 2.5 0.5B",
      desc: "Schnellster Einstieg (~350 MB)",
      size: "~350 MB",
      vram: "~500 MB",
      speed: "⚡⚡⚡"
    },
    "Llama-3.2-1B-Instruct-q4f16_1-MLC": {
      name: "Llama 3.2 1B",
      desc: "Beste Balance (~700 MB)",
      size: "~700 MB",
      vram: "~880 MB",
      speed: "⚡⚡"
    },
    "Llama-3.2-3B-Instruct-q4f16_1-MLC": {
      name: "Llama 3.2 3B",
      desc: "Höchste Qualität (~2 GB)",
      size: "~2 GB",
      vram: "~2.5 GB",
      speed: "⚡"
    }
  };

  var engine = null;
  var isInitializing = false;
  var initPromise = null;
  var currentModelId = null;

  /* ═══════════════════════════════════════════════════════════
     WEBGPU CHECK
     ═══════════════════════════════════════════════════════════ */
  function checkWebGPU(){
    if(!navigator.gpu){
      return {
        ok: false,
        reason: "WebGPU nicht verfügbar. Nutze Chrome/Edge 113+ oder Safari 26+"
      };
    }
    return { ok: true };
  }

  /* ═══════════════════════════════════════════════════════════
     CDN-LOADER (dynamisches Import)
     ═══════════════════════════════════════════════════════════ */
  function loadWebLLM(){
    return new Promise(function(resolve, reject){
      if(window.webllm){
        resolve(window.webllm);
        return;
      }

      /* Dynamischer Import via esm.run (funktioniert in modernen Browsern) */
      import("https://esm.run/@mlc-ai/web-llm@0.2.82")
        .then(function(module){
          window.webllm = module;
          console.log("✅ WebLLM-Modul geladen");
          resolve(module);
        })
        .catch(function(err){
          console.error("❌ WebLLM Import fehlgeschlagen:", err);
          reject(new Error("WebLLM konnte nicht geladen werden. Prüfe deine Internetverbindung."));
        });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     ENGINE INITIALISIEREN
     ═══════════════════════════════════════════════════════════ */
  async function initEngine(modelId){
    /* Falls schon initialisiert und gleiches Modell → return */
    if(engine && currentModelId === modelId){
      return engine;
    }

    /* Falls Initialisierung läuft → warte darauf */
    if(isInitializing && initPromise){
      return initPromise;
    }

    isInitializing = true;
    var gpuCheck = checkWebGPU();
    if(!gpuCheck.ok){
      isInitializing = false;
      throw new Error(gpuCheck.reason);
    }

    initPromise = (async function(){
      var model = modelId || HalDo.Store.get("aiModel", "Qwen2.5-0.5B-Instruct-q4f16_1-MLC");

      console.log("🧠 Lade lokales KI-Modell: " + model + " (nur beim ersten Mal)...");
      if(HalDo.Notify){
        HalDo.Notify.info("🧠 KI-Modell wird geladen...", { app: "ai", duration: 5000 });
      }

      try {
        var webllm = await loadWebLLM();

        /* Progress-Callback für UI */
        var progressCallback = function(report){
          var pct = Math.round((report.progress || 0) * 100);
          console.log("🧠 KI: " + pct + "% — " + (report.text || "Lade..."));
          window.dispatchEvent(new CustomEvent("haldo:ai-progress", {
            detail: { progress: pct, text: report.text }
          }));
        };

        /* Engine erstellen */
        engine = await webllm.CreateMLCEngine(model, {
          initProgressCallback: progressCallback
        });

        currentModelId = model;
        HalDo.Store.set("aiModel", model);
        console.log("✅ KI-Modell '" + model + "' geladen und bereit!");
        if(HalDo.Notify){
          HalDo.Notify.success("🧠 KI bereit: " + model, { app: "ai", duration: 3000 });
        }

        isInitializing = false;
        return engine;

      } catch(error){
        console.error("❌ KI-Init Fehler:", error);
        isInitializing = false;
        engine = null;
        if(HalDo.Notify){
          HalDo.Notify.error("KI-Modell konnte nicht geladen werden: " + error.message, { app: "ai" });
        }
        throw error;
      }
    })();

    return initPromise;
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT — Non-Streaming
     ═══════════════════════════════════════════════════════════ */
  async function chat(messages, options){
    if(!engine) await initEngine();
    if(!engine) throw new Error("KI-Engine nicht initialisiert.");

    var opts = options || {};
    var request = {
      messages: messages,
      temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
      max_tokens: opts.maxTokens || 1024,
      stream: false
    };

    var reply = await engine.chat.completions.create(request);
    return {
      content: reply.choices[0].message.content,
      usage: reply.usage || null
    };
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT — Streaming (für Live-Typing im Chat)
     ═══════════════════════════════════════════════════════════ */
  async function chatStream(messages, onChunk, options){
    if(!engine) await initEngine();
    if(!engine) throw new Error("KI-Engine nicht initialisiert.");

    var opts = options || {};
    var request = {
      messages: messages,
      temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
      max_tokens: opts.maxTokens || 1024,
      stream: true
    };

    var chunks = await engine.chat.completions.create(request);
    var fullText = "";

    for await (var chunk of chunks){
      var delta = chunk.choices[0]?.delta?.content || "";
      if(delta){
        fullText += delta;
        if(onChunk) onChunk(delta, fullText);
      }
    }

    return { content: fullText };
  }

  /* ═══════════════════════════════════════════════════════════
     MODELL WECHSELN
     ═══════════════════════════════════════════════════════════ */
  async function switchModel(modelId){
    if(currentModelId === modelId && engine){
      return true;
    }
    engine = null;
    currentModelId = null;
    isInitializing = false;
    initPromise = null;
    await initEngine(modelId);
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
     ENGINE ENTLAden (RAM freigeben)
     ═══════════════════════════════════════════════════════════ */
  async function unload(){
    if(engine && engine.unload){
      try { await engine.unload(); } catch(e){}
    }
    engine = null;
    currentModelId = null;
    isInitializing = false;
    initPromise = null;
    console.log("🧠 KI-Engine entladen (RAM freigegeben)");
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.AIEngine = {
    init: initEngine,
    chat: chat,
    chatStream: chatStream,
    switchModel: switchModel,
    unload: unload,
    models: MODELS,
    isReady: function(){ return !!engine; },
    getEngine: function(){ return engine; },
    getCurrentModel: function(){ return currentModelId; },
    checkWebGPU: checkWebGPU
  };

  /* ═══════════════════════════════════════════════════════════
     AUTO-INIT (deferred — erst beim ersten Chat)
     ═══════════════════════════════════════════════════════════ */
  setTimeout(function(){
    if(HalDo.Store && HalDo.Store.get("aiAutoLoad", false)){
      initEngine().catch(function(e){ console.warn("KI Auto-Load:", e.message); });
    }
  }, 3000);

  console.log("🦚 ai-engine.js v200 geladen — WebLLM bereit (lokal, keine API-Keys)");
})();
