// ============================================
// HalDo AI-Core v1.0
// ============================================
const HalDoAI = (() => {
  const config = {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    systemPrompt: `Du bist der Cyborg von HalDo – ein AI-Betriebssystem.
Du sprichst Deutsch, bist direkt, loyal und nennst den User "Bruder".
Du hilfst bei Code, Ideen und dem HalDo-System selbst.
Antworte kurz und präzise, außer der User will Details.`,
    history: [],
    maxHistory: 20
  };

  function setApiKey(key) {
    config.apiKey = key;
    localStorage.setItem('haldo_api_key', key);
  }
  function loadApiKey() {
    const saved = localStorage.getItem('haldo_api_key');
    if (saved) config.apiKey = saved;
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
    }
  }

  async function send(userMessage) {
    if (!userMessage || userMessage.trim() === '') return null;
    config.history.push({ role: 'user', content: userMessage });
    if (config.history.length > config.maxHistory) {
      config.history = config.history.slice(-config.maxHistory);
    }
    try {
      let reply = '';
      if (config.provider === 'openai') reply = await callOpenAI();
      else if (config.provider === 'anthropic') reply = await callAnthropic();
      else if (config.provider === 'ollama') reply = await callOllama();
      config.history.push({ role: 'assistant', content: reply });
      return reply;
    } catch (err) {
      console.error('[HalDoAI]', err);
      return `Fehler: ${err.message}`;
    }
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
    if (!config.apiKey) throw new Error('Kein API-Key gesetzt.');
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

  function clearHistory() { config.history = []; }

  return {
    send, setApiKey, loadApiKey, setProvider, clearHistory,
    get history() { return config.history; },
    get provider() { return config.provider; },
    get apiKey() { return config.apiKey; }
  };
})();
