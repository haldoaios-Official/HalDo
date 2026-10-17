/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AI ENGINE (v202) · WASM/CPU FALLBACK
   WebLLM (GPU) → wllama (CPU) · Automatischer Wechsel
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  /* ═══════════════════════════════════════════════════════════
     MODELL-KONFIGURATION
     ═══════════════════════════════════════════════════════════ */
  var MODELS = {
    /* GPU-Modelle (WebLLM) */
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": {
      name: "Qwen 2.5 0.5B (GPU)",
      desc: "Schnell, aber braucht eine kompatible GPU",
      size: "~278 MB",
      vram: "~945 MB",
      type: "gpu",
      speed: "⚡⚡⚡"
    },
    /* CPU-Modelle (wllama) */
    "Qwen2.5-0.5B-Instruct-GGUF": {
      name: "Qwen 2.5 0.5B (CPU)",
      desc: "Zuverlässig auf jedem Computer, auch ohne GPU",
      size: "~400 MB",
      ram: "~1-2 GB",
      type: "cpu",
      url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf",
      speed: "⚡"
    }
  };

  var engine = null;
  var engineType = null; // "gpu" oder "cpu"
  var isInitializing = false;
  var initPromise = null;
  var currentModelId = null;

  /* ═══════════════════════════════════════════════════════════
     WEBGPU CHECK
     ═══════════════════════════════════════════════════════════ */
  function checkWebGPU(){
    if(!navigator.gpu){ return false; }
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
     WEBLLM (GPU) — LADEN UND INITIALISIEREN
     ═══════════════════════════════════════════════════════════ */
  function loadWebLLM(){
    return new Promise(function(resolve, reject){
      if(window.webllm){ resolve(window.webllm); return; }
      import("https://esm.run/@mlc-ai/web-llm@0.2.82")
        .then(function(module){ window.webllm = module; resolve(module); })
        .catch(reject);
    });
  }

  async function initWebLLM(modelId){
    var webllm = await loadWebLLM();
    var progressCallback = function(report){
      var pct = Math.round((report.progress || 0) * 100);
      window.dispatchEvent(new CustomEvent("haldo:ai-progress", {
        detail: { progress: pct, text: report.text, engine: "gpu" }
      }));
    };
    engine = await webllm.CreateMLCEngine(modelId, { initProgressCallback: progressCallback });
    engineType = "gpu";
    currentModelId = modelId;
    return engine;
  }

  /* ═══════════════════════════════════════════════════════════
     WLLAMA (CPU) — LADEN UND INITIALISIEREN
     ═══════════════════════════════════════════════════════════ */
  function loadWllama(){
    return new Promise(function(resolve, reject){
      if(window.Wllama){ resolve(window.Wllama); return; }
      // Lade wllama über CDN (ESM)
      import("https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.0/esm/index.js")
        .then(function(module){
          window.Wllama = module.Wllama;
          resolve(module.Wllama);
        })
        .catch(reject);
    });
  }

  async function initWllama(modelId){
    var Wllama = await loadWllama();
    var modelInfo = MODELS[modelId];
    if(!modelInfo || !modelInfo.url) throw new Error("Ungültiges CPU-Modell");

    // wllama initialisieren (Single-Thread für maximale Stabilität)
    var wllama = new Wllama({
      "single-thread/wllama.wasm": "https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.0/wasm/single-thread/wllama.wasm"
    });

    // Modell von URL laden
    await wllama.loadModelFromUrl(modelInfo.url, {
      n_ctx: 2048, // Kontextgröße
      progressCallback: function(p){
        var pct = Math.round((p.loaded / p.total) * 100);
        window.dispatchEvent(new CustomEvent("haldo:ai-progress", {
          detail: { progress: pct, text: "Lade Modell...", engine: "cpu" }
        }));
      }
    });

    engine = wllama;
    engineType = "cpu";
    currentModelId = modelId;
    return engine;
  }

  /* ═══════════════════════════════════════════════════════════
     HAUPT-INITIALISIERUNG (mit automatischem Fallback)
     ═══════════════════════════════════════════════════════════ */
  async function initEngine(preferredModel){
    if(engine) return engine;
    if(isInitializing && initPromise) return initPromise;

    isInitializing = true;

    initPromise = (async function(){
      var lastError = null;

      // 1. Versuch: WebGPU (wenn verfügbar und nicht explizit deaktiviert)
      if(checkWebGPU() && !window.HalDo.Store.get("forceWasm", false)){
        try {
          console.log("🧠 Versuche WebGPU (schnell)...");
          await initWebLLM(preferredModel || "Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
          console.log("✅ WebGPU-Modell geladen!");
          if(HalDo.Notify) HalDo.Notify.success("🧠 KI (GPU) bereit!", { app: "ai" });
          isInitializing = false;
          return engine;
        } catch(e) {
          lastError = e;
          console.warn("⚠️ WebGPU fehlgeschlagen:", e.message);
          console.log("🔄 Wechsle zu CPU-Fallback (WASM)...");
          engine = null; engineType = null; currentModelId = null;
        }
      }

      // 2. Versuch: WASM/CPU (wllama)
      try {
        console.log("🧠 Lade CPU-Modell (WASM)... Das kann einen Moment dauern.");
        if(HalDo.Notify) HalDo.Notify.info("🧠 Lade CPU-Modell (kann etwas dauern)...", { app: "ai", duration: 10000 });
        await initWllama("Qwen2.5-0.5B-Instruct-GGUF");
        console.log("✅ CPU-Modell geladen!");
        if(HalDo.Notify) HalDo.Notify.success("🧠 KI (CPU) bereit! (Langsamer, aber stabil)", { app: "ai", duration: 5000 });
        isInitializing = false;
        return engine;
      } catch(e) {
        lastError = e;
        console.error("❌ CPU-Modell fehlgeschlagen:", e.message);
        isInitializing = false;
        engine = null;
        var errMsg = "Kein KI-Modell konnte geladen werden. " + (lastError ? lastError.message : "");
        if(HalDo.Notify) HalDo.Notify.error("❌ " + errMsg, { app: "ai", duration: 8000 });
        throw new Error(errMsg);
      }
    })();

    return initPromise;
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT (funktioniert für beide Engines)
     ═══════════════════════════════════════════════════════════ */
  async function chat(messages, options){
    if(!engine) await initEngine();
    if(!engine) throw new Error("KI-Engine nicht initialisiert.");

    var opts = options || {};

    if(engineType === "gpu"){
      // WebLLM-API
      var reply = await engine.chat.completions.create({
        messages: messages,
        temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
        max_tokens: opts.maxTokens || 1024
      });
      return { content: reply.choices[0].message.content };
    } else {
      // wllama-API
      // Prompt aus Nachrichten bauen (einfaches Format)
      var prompt = messages.map(function(m){
        if(m.role === "system") return "System: " + m.content;
        if(m.role === "user") return "User: " + m.content;
        if(m.role === "assistant") return "Assistant: " + m.content;
        return m.content;
      }).join("\n") + "\nAssistant:";

      var result = await engine.createCompletion(prompt, {
        nPredict: opts.maxTokens || 512,
        temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
        top_k: 40,
        top_p: 0.9,
        repeat_penalty: 1.1
      });
      return { content: result.trim() };
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CHAT-STREAMING (für Live-Anzeige)
     ═══════════════════════════════════════════════════════════ */
  async function chatStream(messages, onChunk, options){
    if(!engine) await initEngine();
    if(!engine) throw new Error("KI-Engine nicht initialisiert.");

    var opts = options || {};

    if(engineType === "gpu"){
      // WebLLM-Streaming
      var chunks = await engine.chat.completions.create({
        messages: messages,
        temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
        max_tokens: opts.maxTokens || 1024,
        stream: true
      });
      var fullText = "";
      for await (var chunk of chunks){
        var delta = chunk.choices[0] && chunk.choices[0].delta ? chunk.choices[0].delta.content || "" : "";
        if(delta){ fullText += delta; if(onChunk) onChunk(delta, fullText); }
      }
      return { content: fullText };
    } else {
      // wllama-Streaming
      var prompt = messages.map(function(m){
        if(m.role === "system") return "System: " + m.content;
        if(m.role === "user") return "User: " + m.content;
        if(m.role === "assistant") return "Assistant: " + m.content;
        return m.content;
      }).join("\n") + "\nAssistant:";

      var fullText2 = "";
      var stream = await engine.createCompletion(prompt, {
        nPredict: opts.maxTokens || 512,
        temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
        onNewToken: function(token, piece){
          fullText2 += piece;
          if(onChunk) onChunk(piece, fullText2);
        }
      });
      return { content: fullText2.trim() };
    }
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.AIEngine = {
    init: initEngine,
    chat: chat,
    chatStream: chatStream,
    models: MODELS,
    isReady: function(){ return !!engine; },
    getEngine: function(){ return engine; },
    getEngineType: function(){ return engineType; },
    getCurrentModel: function(){ return currentModelId; },
    checkWebGPU: checkWebGPU
  };

  console.log("🦚 ai-engine.js v202 geladen — WASM/CPU Fallback aktiv");
})();
