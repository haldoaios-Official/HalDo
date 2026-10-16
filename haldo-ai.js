/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO AI SERVICE (v200)
   Zentrale lokale KI-API für ALLE Apps · Keine API-Keys
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo) window.HalDo = {};

  /* ═══════════════════════════════════════════════════════════
     SYSTEM-PROMPT
     ═══════════════════════════════════════════════════════════ */
  var SYSTEM = {
    default: "Du bist HalDo, ein freundlicher, hilfsbereiter KI-Assistent im HalDo AI OS. Antworte präzise und auf Deutsch.",
    lyrics: "Du bist ein Songwriter. Schreibe gefühlvolle, poetische Songtexte. Nutze Songstrukturen wie [Verse 1], [Chorus], [Bridge]. Gib NUR den Songtext zurück.",
    translate: "Du bist ein präziser Übersetzer. Übersetze den Text 1:1 in die Zielsprache. Gib NUR die Übersetzung zurück, ohne Erklärungen.",
    correct: "Du bist ein Lektor. Korrigiere Rechtschreibung, Grammatik und Zeichensetzung. Behalte den Stil bei. Gib NUR den korrigierten Text zurück.",
    rewrite: "Du bist ein Redakteur. Formuliere den Text um, ohne die Bedeutung zu verändern. Gib NUR den neuen Text zurück.",
    summarize: "Du bist ein Zusammenfasser. Fasse den Text in maximal 3 Sätzen zusammen. Gib NUR die Zusammenfassung zurück.",
    explain: "Du bist ein Lehrer. Erkläre einfach und verständlich für Anfänger. Nutze Beispiele.",
    ideas: "Du bist ein Kreativ-Coach. Generiere 5 originelle Ideen zum Thema. Nummeriere sie.",
    code: "Du bist ein erfahrener Programmierer. Schreibe sauberen, kommentierten Code. Erkläre kurz was er macht."
  };

  /* ═══════════════════════════════════════════════════════════
     BASIS-ASK
     ═══════════════════════════════════════════════════════════ */
  async function ask(prompt, options){
    options = options || {};
    if(!HalDo.AIEngine) throw new Error("AI-Engine nicht geladen");
    if(!HalDo.AIEngine.isReady()) await HalDo.AIEngine.init();

    var systemPrompt = options.system || SYSTEM[options.mode] || SYSTEM.default;
    var messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: String(prompt || "") }
    ];

    var result = await HalDo.AIEngine.chat(messages, {
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      maxTokens: options.maxTokens || 800
    });

    return result.content.trim();
  }

  /* ═══════════════════════════════════════════════════════════
     STREAMING-VARIANTE (für Live-Anzeige)
     ═══════════════════════════════════════════════════════════ */
  async function askStream(prompt, onChunk, options){
    options = options || {};
    if(!HalDo.AIEngine) throw new Error("AI-Engine nicht geladen");
    if(!HalDo.AIEngine.isReady()) await HalDo.AIEngine.init();

    var systemPrompt = options.system || SYSTEM[options.mode] || SYSTEM.default;
    var messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: String(prompt || "") }
    ];

    return await HalDo.AIEngine.chatStream(messages, onChunk, {
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      maxTokens: options.maxTokens || 800
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SPEZIALISIERTE HELFER
     ═══════════════════════════════════════════════════════════ */

  /* 🎵 Songtext-Generator */
  async function writeLyrics(theme, lang, style, mood){
    var prompt = "Schreibe einen Songtext auf " + (lang || "Deutsch")
      + " im Stil " + (style || "Pop")
      + ". Stimmung: " + (mood || "nachdenklich")
      + ". Thema: " + (theme || "Liebe")
      + ".\n\nFormat: [Verse 1], [Chorus], [Verse 2], [Bridge], [Chorus]";
    return await ask(prompt, { mode: "lyrics", temperature: 0.9, maxTokens: 1000 });
  }

  /* 🌍 Übersetzen */
  async function translate(text, targetLang){
    var prompt = "Übersetze folgenden Text nach " + (targetLang || "Englisch") + ":\n\n" + text;
    return await ask(prompt, { mode: "translate", temperature: 0.3, maxTokens: 800 });
  }

  /* ✅ Korrigieren */
  async function correct(text){
    return await ask("Korrigiere folgenden Text:\n\n" + text, { mode: "correct", temperature: 0.3 });
  }

  /* 🔄 Umformulieren */
  async function rewrite(text, style){
    var prompt = "Formuliere folgenden Text um" + (style ? " im Stil: " + style : "") + ":\n\n" + text;
    return await ask(prompt, { mode: "rewrite", temperature: 0.7 });
  }

  /* 📝 Zusammenfassen */
  async function summarize(text){
    return await ask("Fasse zusammen:\n\n" + text, { mode: "summarize", temperature: 0.3 });
  }

  /* 📚 Erklären */
  async function explain(topic){
    return await ask("Erkläre: " + topic, { mode: "explain", temperature: 0.7 });
  }

  /* 💡 Ideen generieren */
  async function generateIdeas(topic){
    return await ask("Generiere 5 Ideen zum Thema: " + topic, { mode: "ideas", temperature: 0.9 });
  }

  /* 💻 Code schreiben */
  async function writeCode(description, language){
    var prompt = "Sprache: " + (language || "JavaScript") + "\n\nAufgabe: " + description;
    return await ask(prompt, { mode: "code", temperature: 0.5, maxTokens: 1500 });
  }

  /* 🎨 Bild-Beschreibung für Bildgenerierung */
  async function describeImage(prompt){
    return await ask(
      "Erstelle eine sehr detaillierte Beschreibung (auf Englisch) für folgendes Bild-Konzept. Max 60 Wörter, kommagetrennt:\n\n" + prompt,
      { temperature: 0.8, maxTokens: 200 }
    );
  }

  /* 🎬 Video-Beschreibung / Storyboard */
  async function makeStoryboard(topic){
    return await ask(
      "Erstelle ein Storyboard für ein Video über: " + topic
      + "\n\nFormat: Szene 1, Szene 2, ... — jede Szene mit kurzer Beschreibung.",
      { temperature: 0.8, maxTokens: 800 }
    );
  }

  /* 💬 Chat (mit Verlauf) */
  async function chat(userMsg, history, onChunk){
    if(!HalDo.AIEngine) throw new Error("AI-Engine nicht geladen");
    if(!HalDo.AIEngine.isReady()) await HalDo.AIEngine.init();

    var messages = [{ role: "system", content: SYSTEM.default }];
    (history || []).slice(-10).forEach(function(m){
      if(m.role && m.content) messages.push({ role: m.role, content: m.content });
    });
    messages.push({ role: "user", content: userMsg });

    if(onChunk){
      return await HalDo.AIEngine.chatStream(messages, onChunk);
    } else {
      return await HalDo.AIEngine.chat(messages);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.AI = {
    /* Basis */
    ask: ask,
    askStream: askStream,

    /* Spezialisiert */
    writeLyrics: writeLyrics,
    translate: translate,
    correct: correct,
    rewrite: rewrite,
    summarize: summarize,
    explain: explain,
    generateIdeas: generateIdeas,
    writeCode: writeCode,
    describeImage: describeImage,
    makeStoryboard: makeStoryboard,
    chat: chat,

    /* Status */
    isReady: function(){ return HalDo.AIEngine && HalDo.AIEngine.isReady(); },
    init: function(){ return HalDo.AIEngine.init(); },
    systemPrompts: SYSTEM
  };

  console.log("🦚 haldo-ai.js v200 geladen — zentrale KI-API für alle Apps");
})();
