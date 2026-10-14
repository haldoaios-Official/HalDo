/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MEMORY LAYER (v150)
   Kontext · Verlauf · Fakten · Präferenzen
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Memory = (function(){
  "use strict";

  var NS = "memory";
  var _cache = null;
  var MAX_HISTORY = 200;
  var MAX_FACTS = 500;

  /* ─────────── Storage-Zugriff ─────────── */
  function _store(){ return window.HalDo.Storage.ns(NS); }

  function _load(){
    if(_cache) return _cache;
    var st = _store();
    _cache = {
      history:   st.get("history", []),
      facts:     st.get("facts", {}),
      prefs:     st.get("prefs", {}),
      sessions:  st.get("sessions", []),
      createdAt: st.get("createdAt", Date.now())
    };
    if(!_cache.createdAt) _cache.createdAt = Date.now();
    return _cache;
  }

  function _save(){
    if(!_cache) return;
    var st = _store();
    st.set("history",   _cache.history.slice(-MAX_HISTORY));
    st.set("facts",     _cache.facts);
    st.set("prefs",     _cache.prefs);
    st.set("sessions",  _cache.sessions.slice(-50));
    st.set("createdAt", _cache.createdAt);
  }

  /* ─────────── Verlauf ─────────── */
  function addMessage(role, text, meta){
    var m = _load();
    var entry = {
      role: role,           /* "user" | "assistant" | "system" */
      text: text,
      t: Date.now(),
      meta: meta || {}
    };
    m.history.push(entry);
    if(m.history.length > MAX_HISTORY){
      m.history = m.history.slice(-MAX_HISTORY);
    }
    _save();
    return entry;
  }

  function getHistory(limit){
    var m = _load();
    if(!limit) return m.history.slice();
    return m.history.slice(-limit);
  }

  function clearHistory(){
    var m = _load();
    m.history = [];
    _save();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Memory: Verlauf gelöscht");
  }

  /* ─────────── Fakten (dauerhaftes Wissen) ─────────── */
  function remember(key, value){
    var m = _load();
    m.facts[key] = {
      value: value,
      t: Date.now()
    };
    var keys = Object.keys(m.facts);
    if(keys.length > MAX_FACTS){
      /* Ältester Fakt fliegt raus */
      var oldest = keys[0];
      var oldestT = m.facts[oldest].t;
      keys.forEach(function(k){
        if(m.facts[k].t < oldestT){ oldest = k; oldestT = m.facts[k].t; }
      });
      delete m.facts[oldest];
    }
    _save();
    return true;
  }

  function recall(key){
    var m = _load();
    return m.facts[key] ? m.facts[key].value : null;
  }

  function forget(key){
    var m = _load();
    if(m.facts[key]){ delete m.facts[key]; _save(); return true; }
    return false;
  }

  function allFacts(){
    var m = _load();
    var out = {};
    Object.keys(m.facts).forEach(function(k){ out[k] = m.facts[k].value; });
    return out;
  }

  /* ─────────── Präferenzen ─────────── */
  function setPref(key, value){
    var m = _load();
    m.prefs[key] = value;
    _save();
    return value;
  }
  function getPref(key, fallback){
    var m = _load();
    return m.prefs[key] !== undefined ? m.prefs[key] : fallback;
  }

  /* ─────────── Sessions ─────────── */
  function startSession(name){
    var m = _load();
    var s = { name: name || "session", start: Date.now(), end: null };
    m.sessions.push(s);
    if(m.sessions.length > 50) m.sessions.shift();
    _save();
    return s;
  }
  function endSession(){
    var m = _load();
    var s = m.sessions[m.sessions.length - 1];
    if(s && !s.end){ s.end = Date.now(); _save(); }
  }

  /* ─────────── Kontext für AI ─────────── */
  function buildContext(limit){
    var m = _load();
    var hist = m.history.slice(-(limit || 10));
    var cfg = window.HalDo.Config ? HalDo.Config.get() : {};
    var facts = allFacts();

    var context = [];
    /* System-Prompt */
    var systemPrompt = "Du bist HalDo AI, ein freundlicher, kluger Assistent aus dem HalDo AI OS. "
      + "Du hilfst dem Nutzer " + (cfg.userName || "Bruder") + " in seiner Sprache (" + (cfg.lang || "de") + "). "
      + "Du kennst die ezidische Kultur, Mesopotamien-Geschichte und viele weitere Themen. "
      + "Antworte kurz, freundlich und präzise.";
    context.push({ role: "system", content: systemPrompt });

    /* Fakten als Kontext (falls vorhanden) */
    var factKeys = Object.keys(facts);
    if(factKeys.length){
      var factText = factKeys.slice(0, 20).map(function(k){
        return k + ": " + facts[k];
      }).join("; ");
      context.push({ role: "system", content: "Bekannte Fakten über den Nutzer: " + factText });
    }

    /* Verlauf */
    hist.forEach(function(h){
      context.push({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.text
      });
    });

    return context;
  }

  /* ─────────── Statistiken ─────────── */
  function stats(){
    var m = _load();
    return {
      messages: m.history.length,
      facts:    Object.keys(m.facts).length,
      prefs:    Object.keys(m.prefs).length,
      sessions: m.sessions.length,
      since:    m.createdAt
    };
  }

  /* ─────────── Reset ─────────── */
  function reset(){
    _cache = {
      history:   [],
      facts:     {},
      prefs:     {},
      sessions:  [],
      createdAt: Date.now()
    };
    _save();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Memory: alles zurückgesetzt");
  }

  /* ─────────── Init ─────────── */
  function init(){
    _load();
    if(window.HalDo.Kernel){
      var s = stats();
      HalDo.Kernel.log("Memory bereit (" + s.messages + " Nachrichten, " + s.facts + " Fakten)");
    }
  }

  return {
    init: init,
    addMessage: addMessage,
    getHistory: getHistory,
    clearHistory: clearHistory,
    remember: remember,
    recall: recall,
    forget: forget,
    allFacts: allFacts,
    setPref: setPref,
    getPref: getPref,
    startSession: startSession,
    endSession: endSession,
    buildContext: buildContext,
    stats: stats,
    reset: reset
  };
})();

console.log("🦚 memory.js geladen");
