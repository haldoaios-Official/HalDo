// ============================================
// HalDo AI-Core v4.0
// Provider: Pollinations (Default), OpenAI, Anthropic, Ollama
// Auto-Reset bei Versions-Update
// ============================================
const HalDoAI = (() => {
  // Alte Configs aufräumen
  const CONFIG_VERSION = '4.0';
  const savedVersion = localStorage.getItem('haldo_ai_version');
  if (savedVersion !== CONFIG_VERSION) {
    // Nur Provider zurücksetzen, Key behalten
    localStorage.setItem('haldo_provider', 'pollinations');
    localStorage.setItem('haldo_ai_version', CONFIG_VERSION);
  }

  const config = {
    provider: localStorage.getItem('haldo_provider') || 'pollinations',
    apiKey: localStorage.getItem('haldo_api_key') || '',
    model: 'openai',
    endpoint: '',
    systemPrompt: `Du bist der Cyborg von HalDo – ein AI-Betriebssystem.
Du sprichst Deutsch, bist direkt, loyal und nennst den User "Bruder".
Du hilfst bei Code, Ideen und dem HalDo-System selbst.
Antworte kurz und präzise, außer der User will Details.`,
    history: [],
    maxHistory: 20
  };

  // System-Prompt aus Storage laden (falls vorhanden)
  const savedPrompt = localStorage.getItem('haldo_system_prompt');
  if (savedPrompt) config.systemPrompt = savedPrompt;

  function setApiKey(key) {
    config.apiKey = key || '';
    localStorage.setItem('haldo_api_key', config.apiKey);
  }
  function loadApiKey() {
    config.apiKey = localStorage.getItem('haldo_api_key') || '';
    return config.apiKey;
  }
  function setProvider(provider, model) {
    config.provider = provider;
    localStorage.setItem('haldo_provider', provider);
    if (provider === 'openai') {
      config.endpoint = 'https://api.openai.com/v1/chat/completions';
      config.model = model || 'gpt-4o-mini';
    } else if (provider === 'anthropic') {
      config.endpoint = 'https://api.anthropic.com/v1/messages';
      config.model = model || 'claude-3-5-sonnet-20241022';
    } else if (provider === 'ollama') {
      config.endpoint = 'http://localhost:11434/api/chat';
      config.model = model || 'llama3';
    } else if (provider === 'pollinations') {
      config.endpoint = 'https://text.pollinations.ai/openai';
      config.model = 'openai';
    }
  }

  // Provider beim Start synchronisieren
  setProvider(config.provider);

  async function send(userMessage) {
    if (!userMessage || userMessage.trim() === '') return null;
    
    config.history.push({ role: 'user', content: userMessage });
    if (config.history.length > config.maxHistory) {
      config.history = config.history.slice(-config.maxHistory);
    }
    
    try {
      let reply = '';
      if (config.provider === 'pollinations') reply = await callPollinations();
      else if (config.provider === 'openai') reply = await callOpenAI();
      else if (config.provider === 'anthropic') reply = await callAnthropic();
      else if (config.provider === 'ollama') reply = await callOllama();
      else reply = 'Unbekannter Provider: ' + config.provider;
      
      config.history.push({ role: 'assistant', content: reply });
      return reply;
    } catch (err) {
      console.error('[HalDoAI]', err);
      return `Fehler: ${err.message}`;
    }
  }

  async function callPollinations() {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: config.systemPrompt },
          ...config.history
        ]
      })
    });
    if (!res.ok) throw new Error(`Pollinations ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  async function callOpenAI() {
    if (!config.apiKey) throw new Error('Kein API-Key gesetzt.');
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          ...config.history
        ],
        temperature: 0.7
      })
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  async function callAnthropic() {
    if (!config.apiKey) throw new Error('Kein API-Key gesetzt (Anthropic braucht einen Key).');
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1024,
        system: config.systemPrompt,
        messages: config.history
      })
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    return data.content[0].text;
  }

  async function callOllama() {
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          ...config.history
        ],
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const data = await res.json();
    return data.message.content;
  }

  function clearHistory() {
    config.history = [];
  }
  
  function setSystemPrompt(prompt) {
    config.systemPrompt = prompt;
    localStorage.setItem('haldo_system_prompt', prompt);
  }
  
  function loadSystemPrompt() {
    const saved = localStorage.getItem('haldo_system_prompt');
    if (saved) config.systemPrompt = saved;
  }

  return {
    send,
    setApiKey,
    loadApiKey,
    setProvider,
    clearHistory,
    setSystemPrompt,
    loadSystemPrompt,
    get history() { return config.history; },
    get provider() { return config.provider; },
    get apiKey() { return config.apiKey; },
    get systemPrompt() { return config.systemPrompt; }
  };
})();