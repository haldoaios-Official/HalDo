/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI ENGINE (v201) · STABLE LOCAL BRAIN
   WebLLM · Auto-Fallback · Intel iGPU safe · Keine API-Keys
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  /* ═══════════════════════════════════════════════════════════
     MODELLE — Sortiert von KLEIN nach GROSS
     Auto-Fallback: Wenn eins crasht → nächstkleineres
     ═══════════════════════════════════════════════════════════ */
  var MODELS = {
    /* 🟢 TIER 1 — IMMER stabil (auch auf schwachen iGPUs) */
    "SmolLM2-135M-Instruct-q0f16-MLC": {
      name: "SmolLM2 135M",
      desc: "Ultra-klein · läuft überall",
      size: "~271 MB",
      vram: "~300 MB",
      tier: 1,
      speed: "⚡⚡⚡⚡"
    },
    "SmolLM2-360M-Instruct-q4f16_1-MLC": {
      name: "SmolLM2 360M",
      desc: "Sehr klein · schnell",
      size: "~400 MB",
      vram: "~450 MB",
      tier: 1,
      speed: "⚡⚡⚡⚡"
    },
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": {
      name: "Qwen 2.5 0.5B",
      desc: "Beste Balance · Standard",
      size: "~278 MB",
      vram: "~945 MB",
      tier: 1,
      speed: "⚡⚡⚡"
    },

    /* 🟡 TIER 2 — Mittel (braucht ~1-1.5 GB VRAM) */
    "Llama-3.2-1B-Instruct-q4f16_1-MLC": {
      name: "Llama 3.2 1B",
      desc: "Gute Qualität · mittlere Hardware",
      size: "~700 MB",
      vram: "~880 MB",
      tier: 2,
      speed: "⚡⚡"
    },

    /* 🔴 TIER 3 — Groß (NUR für starke GPUs!) */
    "Llama-3.2-3B-Instruct-q4f16_1-MLC": {
      name: "Llama 3.2 3B",
      desc: "Beste Qualität · braucht starke GPU",
      size: "~2 GB",
      vram: "~2.5 GB",
      tier: 3,
      speed: "⚡"
    }
  };

  /* ═══════════════════════════════════════════════════════════
     AUTO-FALLBACK-KETTE (klein → groß)
     ═══════════════════════════════════════════════════════════ */
  var FALLBACK_CHAIN = [
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",       /* Standard */
    "SmolLM2-360M-Instruct-q4f16_1-MLC",       /* Klein */
    "SmolLM2-135M-Instruct-q0f16-MLC"          /* Ultra-klein */
  ];

  var engine = null;
  var isInitializing = false;
  var initPromise = null;
  var currentModelId = null;

  /* ═══════════════════════════════════════════════════════════
     WEBGPU CHECK
     ═══════════════════════════════════════════════════════════ */
  function checkWebGPU(){
    if(!navigator.gpu){
      return { ok: false, reason: "WebGPU nicht verfügbar. Nutze Chrome/Edge 113+ oder Safari 26+" };
    }
    return { ok: true };
  }

  /* ═══════════════════════════════════════════════════════════
     CDN-LOADER
     ═══════════════════════════════════════════════════════════ */
  function loadWebLLM(){
    return new Promise(function(resolve, reject){
      if(window.webllm){ resolve(window.webllm); return; }
      import("https://esm.run/@mlc-ai/web-llm@0.2.82")
        .then(function(module){
          window.webllm = module;
          console.log("✅ WebLLM-Modul geladen");
          resolve(module);
        })
        .catch(function(err){
          console.error("❌ WebLLM Import fehlgeschlagen:", err);
          reject(new Error("WebLLM konnte nicht geladen werden."));
        });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT MIT AUTO-FALLBACK
     ═══════════════════════════════════════════════════════════ */
  async function initEngine(preferredModel){
    /* Wenn schon geladen → return */
    if(engine && currentModelId === preferredModel){
      return engine;
    }

    /* Wenn läuft → warte */
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
      var webllm = await loadWebLLM();

      /* Modell-Reihenfolge bestimmen */
      var tryOrder = [];
      if(preferredModel && MODELS[preferredModel]){
        tryOrder.push(preferredModel);
      }
      /* Restliche Fallbacks hinzufügen (falls nicht schon drin) */
      FALLBACK_CHAIN.forEach(function(m){
        if(tryOrder.indexOf(m) === -1) tryOrder.push(m);
      });

      var lastError = null;

      /* Durch alle Modelle probieren */
      for(var i = 0; i < tryOrder.length; i++){
        var model = tryOrder[i];
        console.log("🧠 Versuche Modell (" + (i + 1) + "/" + tryOrder.length + "): " + model);

        if(HalDo.Notify){
          HalDo.Notify.info("🧠 Lade " + (MODELS[model] ? MODELS[model].name : model) + "...", { app: "ai", duration: 5000 });
        }

        try {
          var progressCallback = function(report){
            var pct = Math.round((report.progress || 0) * 100);
            console.log("🧠 KI: " + pct + "% — " + (report.text || "Lade...").substring(0, 70));
            window.dispatchEvent(new CustomEvent("haldo:ai-progress", {
              detail: { progress: pct, text: report.text, model: model }
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
            HalDo.Notify.success("🧠 KI bereit: " + (MODELS[model] ? MODELS[model].name : model), { app: "ai", duration: 3000 });
          }

          isInitializing = false;
          return engine;

        } catch(error){
          lastError = error;
          console.warn("⚠️ Modell '" + model + "' fehlgeschlagen:", error.message || error);
          console.log("🔄 Fallback auf nächstkleineres Modell...");

          /* Engine zurücksetzen für nächsten Versuch */
          engine = null;
          currentModelId = null;

          /* Kurz warten vor nächstem Versuch */
          await new Promise(function(r){ setTimeout(r, 1000); });
        }
      }

      /* Alle Modelle fehlgeschlagen */
      isInitializing = false;
      engine = null;
      var errMsg = "Alle KI-Modelle fehlgeschlagen. " + (lastError ? lastError.message : "");
      if(HalDo.Notify){
        HalDo.Notify.error("❌ Kein Modell konnte geladen werden. Versuche Chrome zu aktualisieren.", { app: "ai", duration: 8000 });
      }
      throw new Error(errMsg);
    })();

    return initPromise;
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT
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
      var delta = chunk.choices[0] && chunk.choices[0].delta ? chunk.choices[0].delta.content || "" : "";
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
    if(currentModelId === modelId && engine) return true;
    engine = null;
    currentModelId = null;
    isInitializing = false;
    initPromise = null;
    await initEngine(modelId);
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
     UNLOAD
     ═══════════════════════════════════════════════════════════ */
  async function unload(){
    if(engine && engine.unload){ try { await engine.unload(); } catch(e){} }
    engine = null;
    currentModelId = null;
    isInitializing = false;
    initPromise = null;
    console.log("🧠 KI-Engine entladen");
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
    fallbackChain: FALLBACK_CHAIN,
    isReady: function(){ return !!engine; },
    getEngine: function(){ return engine; },
    getCurrentModel: function(){ return currentModelId; },
    checkWebGPU: checkWebGPU
  };

  setTimeout(function(){
    if(HalDo.Store && HalDo.Store.get("aiAutoLoad", false)){
      initEngine().catch(function(e){ console.warn("KI Auto-Load:", e.message); });
    }
  }, 3000);

  console.log("🦚 ai-engine.js v201 geladen — Auto-Fallback aktiv (Intel-safe)");
})();
