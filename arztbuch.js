/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v10.1 — MODUL 1 & 2
   Dashboard · KI-Assistent (Chat, TTS, Analysieren, Formulieren)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const VERSION = '10.1.0-M2';
  const STORAGE_KEY = 'haldo.arztbuch.v10';

  // ═══════════════════════════════════════════════════════
  // 1. STATE & DATEN
  // ═══════════════════════════════════════════════════════
  let state = {
    lang: 'de',
    currentView: 'splash', 
    appointments: [],
    sickNotes: [],
    vitals: { bloodPressure: '120/80', bloodSugar: '95', weight: '75' },
    ttsEnabled: true,
    chatHistory: [] // NEU: Speichert den Chat-Verlauf
  };

  let currentTarget = null;

  const DAILY_TIPS = [
    { icon: '💧', title: 'Hydration', text: 'Trinke heute mindestens 2 Liter Wasser. Das hält deine Nieren fit und dein Gehirn leistungsfähig.' },
    { icon: '🏃', title: 'Bewegung', text: 'Schon 30 Minuten Spaziergang am Tag senken dein Risiko für Herz-Kreislauf-Erkrankungen um bis zu 20%.' },
    { icon: '🥦', title: 'Ernährung', text: 'Iss heute eine extra Portion Gemüse. Ballaststoffe sind wahre Wunderwaffen für deine Darmflora.' },
    { icon: '😴', title: 'Schlaf', text: 'Achte auf 7-8 Stunden Schlaf. Im Schlaf repariert sich dein Körper und das Immunsystem wird gestärkt.' },
    { icon: '🧘', title: 'Mental Health', text: 'Nimm dir 5 Minuten für tiefe Bauchatmung. Das senkt den Cortisolspiegel (Stresshormon) sofort.' },
    { icon: '☀️', title: 'Vitamine', text: 'Verbringe 15 Minuten im Tageslicht. Dein Körper bildet so wichtiges Vitamin D für die Knochen.' },
    { icon: '🫀', title: 'Herzgesundheit', text: 'Reduziere heute Salz in deinem Essen. Das entlastet dein Herz und reguliert den Blutdruck.' }
  ];

  // ═══════════════════════════════════════════════════════
  // 2. LOGIK
  // ═══════════════════════════════════════════════════════
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lang) state.lang = parsed.lang;
        if (parsed.vitals) state.vitals = parsed.vitals;
        if (parsed.chatHistory) state.chatHistory = parsed.chatHistory;
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { }
  }

  function getDailyTip() {
    return DAILY_TIPS[new Date().getDay()];
  }

  function speakText(text) {
    if (!state.ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, ''));
    u.lang = 'de-DE';
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  }

  // Simulierte KI-Antwort (Später via HalDoAI API)
  function getAIResponse(text, mode) {
    const lower = text.toLowerCase();
    let response = "";

    if (mode === 'formulate') {
      response = `Hier ist ein formulierter Textvorschlag für dein Anliegen:\n\nSehr geehrte Damen und Herren,\n\nbezüglich "${text}" möchte ich folgendes mitteilen...\n\nMit freundlichen Grüßen,\nHalil Donma`;
    } else if (mode === 'analyze') {
      response = `Medizinische Analyse für: "${text}"\n\nBasierend auf deinen Angaben könnten folgende Punkte relevant sein:\n1. Mögliche Ursachen: Stress, Dehydrierung oder eine leichte Infektion.\n2. Empfehlung: Ruhe dich aus, trinke ausreichend Wasser und beobachte die Symptome.\n\n⚠️ WICHTIG: Dies ist keine echte Diagnose. Bei anhaltenden Beschwerden suche bitte einen Arzt auf!`;
    } else {
      if (lower.includes('kopfschmerz') || lower.includes('kopf')) {
        response = "Bei Kopfschmerzen können verschiedene Faktoren eine Rolle spielen. Oft liegt es an Flüssigkeitsmangel, Stress oder Schlafmangel. Trinke ein Glas Wasser, mache eine kurze Pause und atme tief durch. Wenn der Schmerz stark bleibt, nimm ein leichtes Schmerzmittel (z.B. Ibuprofen) oder konsultiere einen Arzt.";
      } else if (lower.includes('hallo') || lower.includes('hi')) {
        response = "Hallo Halil! Ich bin dein HalDo KI-Assistent. Wie kann ich dir heute mit deiner Gesundheit helfen?";
      } else {
        response = `Ich habe deine Nachricht erhalten: "${text}".\n\nAls KI-Assistent kann ich dir helfen, Symptome zu verstehen, Texte zu formulieren oder medizinische Informationen zu erklären. Was genau möchtest du wissen?`;
      }
    }
    return response;
  }

  // ═══════════════════════════════════════════════════════
  // 3. CSS (Hochmodernes Design)
  // ═══════════════════════════════════════════════════════
  function css() {
    return `<style>
      /* App Container */
      .haldo-app {
        font-family: 'Inter', -apple-system, system-ui, sans-serif;
        color: #e8e8ec;
        background: radial-gradient(circle at top right, #0a1220 0%, #050810 100%);
        height: 100%; width: 100%;
        display: flex; position: absolute; top: 0; left: 0; overflow: hidden;
      }

      /* Sidebar */
      .h-sidebar {
        width: 260px; background: rgba(10, 15, 25, 0.6);
        backdrop-filter: blur(24px);
        border-right: 1px solid rgba(255,255,255,0.05);
        display: flex; flex-direction: column; padding: 20px 0; z-index: 10;
      }
      .h-logo {
        padding: 0 20px 25px; font-size: 22px; font-weight: 900; color: #00e5ff;
        display: flex; align-items: center; gap: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px;
      }
      .h-nav-item {
        padding: 14px 24px; display: flex; align-items: center; gap: 14px;
        color: #8a9bb5; font-weight: 600; font-size: 14px; cursor: pointer;
        transition: all 0.25s ease; border-left: 3px solid transparent;
      }
      .h-nav-item:hover { background: rgba(255,255,255,0.02); color: #fff; }
      .h-nav-item.active {
        background: linear-gradient(90deg, rgba(0,229,255,0.1) 0%, transparent 100%);
        color: #00e5ff; border-left-color: #00e5ff;
      }
      .h-nav-item .icon { font-size: 20px; width: 24px; text-align: center; }

      /* Main Content */
      .h-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .h-header {
        padding: 25px 40px; display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        background: rgba(10, 15, 25, 0.4); backdrop-filter: blur(10px);
      }
      .h-header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #fff; }
      .h-header .version { font-size: 12px; color: #00e5ff; background: rgba(0,229,255,0.1); padding: 4px 10px; border-radius: 20px; font-weight: bold; }
      
      .h-content { flex: 1; overflow-y: auto; padding: 40px; position: relative; }
      .h-content::-webkit-scrollbar { width: 8px; }
      .h-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

      /* Cards & Layouts */
      .h-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
      .h-card {
        background: rgba(20, 25, 35, 0.4); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
        padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
      }
      .h-card:hover { transform: translateY(-2px); border-color: rgba(0,229,255,0.2); }

      /* Dashboard Specific */
      .h-dashboard-top { display: flex; gap: 30px; align-items: stretch; }
      .h-greeting-card {
        flex: 1; display: flex; flex-direction: column; justify-content: center;
        background: linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(180,120,255,0.05) 100%);
        border: 1px solid rgba(0,229,255,0.15);
      }
      .h-greeting-card h2 { font-size: 32px; margin: 0 0 10px 0; color: #fff; font-weight: 900; }
      .h-greeting-card p { color: #a8b0cc; margin: 0; font-size: 16px; line-height: 1.5; }

      /* AI Avatar (Klickbar) */
      .h-ai-avatar-container {
        width: 200px; height: 200px; position: relative;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); border-radius: 50%;
        border: 2px solid rgba(0,229,255,0.3); box-shadow: 0 0 40px rgba(0,229,255,0.2);
        cursor: pointer; transition: all 0.3s;
      }
      .h-ai-avatar-container:hover { box-shadow: 0 0 60px rgba(0,229,255,0.5); transform: scale(1.05); }
      .h-ai-core {
        width: 100px; height: 100px;
        background: radial-gradient(circle, #00e5ff 0%, #0044aa 100%);
        border-radius: 50%; animation: breathe 3s ease-in-out infinite;
        box-shadow: 0 0 50px #00e5ff;
      }
      @keyframes breathe {
        0%, 100% { transform: scale(1); box-shadow: 0 0 30px #00e5ff; }
        50% { transform: scale(1.15); box-shadow: 0 0 70px #00e5ff; }
      }

      .h-daily-tip { display: flex; align-items: center; gap: 20px; border-left: 4px solid #b478ff; }
      .h-daily-tip .tip-icon { font-size: 40px; background: rgba(180,120,255,0.1); padding: 15px; border-radius: 16px; }
      .h-daily-tip h3 { margin: 0 0 5px 0; color: #b478ff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      .h-daily-tip p { margin: 0; font-size: 16px; color: #ddd; line-height: 1.5; }

      .h-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
      .h-stat-box {
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
        border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px;
      }
      .h-stat-box .title { font-size: 12px; color: #8a9bb5; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
      .h-stat-box .value { font-size: 28px; font-weight: 900; color: #fff; }
      .h-stat-box .unit { font-size: 14px; color: #00e5ff; }

      .h-quick-btn {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;
        cursor: pointer; transition: all 0.2s;
      }
      .h-quick-btn:hover { background: rgba(0,229,255,0.1); border-color: #00e5ff; transform: translateY(-3px); }
      .h-quick-btn .icon { font-size: 32px; }
      .h-quick-btn .label { font-size: 14px; font-weight: bold; color: #fff; }

      /* ═══════════════════════════════════════════════════════
         MODUL 2: KI CHAT UI
         ═══════════════════════════════════════════════════════ */
      .h-chat-container {
        display: flex; flex-direction: column; height: calc(100vh - 150px);
        background: rgba(20, 25, 35, 0.4); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden;
      }
      .h-chat-history {
        flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 20px;
      }
      .h-chat-history::-webkit-scrollbar { width: 6px; }
      .h-chat-history::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

      .h-msg { display: flex; gap: 15px; max-width: 80%; }
      .h-msg.user { align-self: flex-end; flex-direction: row-reverse; }
      .h-msg.ai { align-self: flex-start; }
      
      .h-msg-avatar {
        width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
      }
      .h-msg.ai .h-msg-avatar { background: rgba(0,229,255,0.2); border: 1px solid #00e5ff; }
      .h-msg.user .h-msg-avatar { background: rgba(255,255,255,0.1); }
      
      .h-msg-bubble {
        padding: 15px 20px; border-radius: 16px; font-size: 15px; line-height: 1.6;
      }
      .h-msg.ai .h-msg-bubble { background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-top-left-radius: 4px; color: #ddd; }
      .h-msg.user .h-msg-bubble { background: linear-gradient(135deg, #00e5ff, #0088ff); color: #000; font-weight: 500; border-top-right-radius: 4px; }

      .h-msg-bubble .tts-btn {
        background: transparent; border: none; color: #00e5ff; cursor: pointer; font-size: 16px; margin-top: 8px; display: block;
      }

      .h-chat-input-area {
        padding: 20px 30px; background: rgba(10, 15, 25, 0.8); border-top: 1px solid rgba(255,255,255,0.05);
        display: flex; flex-direction: column; gap: 15px;
      }
      .h-chat-tools { display: flex; gap: 10px; flex-wrap: wrap; }
      .h-chat-tool-btn {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        color: #aaa; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s;
      }
      .h-chat-tool-btn:hover { background: rgba(0,229,255,0.1); color: #00e5ff; border-color: #00e5ff; }

      .h-chat-input-wrapper {
        display: flex; gap: 15px;
      }
      .h-chat-input {
        flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        padding: 15px 20px; color: #fff; font-size: 15px; outline: none; font-family: inherit; resize: none; height: 50px;
      }
      .h-chat-input:focus { border-color: #00e5ff; box-shadow: 0 0 10px rgba(0,229,255,0.2); }
      .h-chat-send {
        background: linear-gradient(135deg, #00e5ff, #0088ff); border: none; border-radius: 12px;
        width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 20px; color: #000; transition: transform 0.2s;
      }
      .h-chat-send:hover { transform: scale(1.05); }

      /* Splash */
      .h-splash {
        position: absolute; inset: 0; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #001a2a 0%, #050810 100%); overflow: hidden;
      }
      .h-splash-logo { font-size: 60px; font-weight: 900; color: #fff; margin-bottom: 10px; text-shadow: 0 0 30px rgba(0,229,255,0.5); animation: slideUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      .h-splash-sub { font-size: 20px; color: #00e5ff; font-weight: bold; margin-bottom: 40px; opacity: 0; animation: fadeIn 1s 0.5s forwards; }
      .h-splash-btn {
        padding: 18px 50px; background: linear-gradient(135deg, #00e5ff 0%, #0088ff 100%);
        color: #000; font-size: 18px; font-weight: 900; border: none; border-radius: 30px; cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,229,255,0.4); opacity: 0; animation: slideUpBtn 1s 0.8s forwards; transition: transform 0.2s;
      }
      .h-splash-btn:hover { transform: scale(1.05); }
      @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUpBtn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 4. RENDER FUNKTIONEN
  // ═══════════════════════════════════════════════════════
  function renderSplash() {
    return `
      <div class="h-splash">
        <div class="h-splash-logo">HalDo Arztbuch</div>
        <div class="h-splash-sub">Deine Gesundheit. Professionell. Intelligent.</div>
        <button class="h-splash-btn" data-action="enter-app">Los geht's →</button>
      </div>
    `;
  }

  function renderDashboard() {
    const tip = getDailyTip();
    
    return `<div class="h-inner">
      <div class="h-dashboard-top">
        <div class="h-card h-greeting-card">
          <h2>Guten Tag, Halil! 👋</h2>
          <p>Bereit, deine Gesundheit in die Hand zu nehmen? Hier ist deine Übersicht für heute.</p>
        </div>
        
        <!-- Klickbarer Avatar führt zum Chat -->
        <div class="h-card" style="padding: 10px; display:flex; justify-content:center; align-items:center;">
          <div class="h-ai-avatar-container" data-action="view-ki-tools">
            <div class="h-ai-core"></div>
          </div>
        </div>
      </div>

      <div class="h-card h-daily-tip">
        <div class="tip-icon">${tip.icon}</div>
        <div>
          <h3>Tages-Tipp: ${tip.title}</h3>
          <p>${tip.text}</p>
        </div>
      </div>

      <div class="h-grid-4">
        <div class="h-stat-box">
          <div class="title">Blutdruck</div>
          <div class="value">${state.vitals.bloodPressure} <span class="unit">mmHg</span></div>
        </div>
        <div class="h-stat-box">
          <div class="title">Blutzucker</div>
          <div class="value">${state.vitals.bloodSugar} <span class="unit">mg/dl</span></div>
        </div>
        <div class="h-stat-box">
          <div class="title">Gewicht</div>
          <div class="value">${state.vitals.weight} <span class="unit">kg</span></div>
        </div>
        <div class="h-stat-box" style="border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.05);">
          <div class="title">Termine</div>
          <div class="value">${state.appointments.length} <span class="unit">Anstehend</span></div>
        </div>
      </div>

      <div>
        <h3 style="color:#fff; margin: 10px 0 15px 0; font-size:18px;">Schnellzugriff</h3>
        <div class="h-grid-4">
          <div class="h-quick-btn" data-action="view-emergency" style="border-color: rgba(255,51,51,0.3);">
            <div class="icon">🚨</div><div class="label" style="color:#ff5555;">Notfall (112)</div>
          </div>
          <div class="h-quick-btn" data-action="view-ki-tools">
            <div class="icon">🤖</div><div class="label">KI Symptom-Check</div>
          </div>
          <div class="h-quick-btn" data-action="view-meds">
            <div class="icon">💊</div><div class="label">Medikament eintragen</div>
          </div>
          <div class="h-quick-btn" data-action="view-anatomy">
            <div class="icon">🧍‍♂️</div><div class="label">Anatomie 3D</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // MODUL 2: KI CHAT INTERFACE
  function renderKITools() {
    // Baue den Chat-Verlauf auf
    let chatHtml = '';
    
    // Standard-Begrüßung, wenn noch kein Chat da ist
    if (state.chatHistory.length === 0) {
      chatHtml = `
        <div class="h-msg ai">
          <div class="h-msg-avatar">🤖</div>
          <div class="h-msg-bubble">
            Hallo Halil! Ich bin dein HalDo KI-Assistent. Ich kann dir helfen, Symptome zu verstehen, medizinische Texte zu analysieren oder Fragen zu beantworten. Was kann ich für dich tun?
            <button class="tts-btn" onclick="document.dispatchEvent(new CustomEvent('speak-ai', {detail: 'Hallo Halil! Ich bin dein HalDo KI Assistent.'}))">🔊 Vorlesen</button>
          </div>
        </div>
      `;
    } else {
      state.chatHistory.forEach(msg => {
        if (msg.role === 'user') {
          chatHtml += `
            <div class="h-msg user">
              <div class="h-msg-avatar">👤</div>
              <div class="h-msg-bubble">${msg.text}</div>
            </div>
          `;
        } else {
          chatHtml += `
            <div class="h-msg ai">
              <div class="h-msg-avatar">🤖</div>
              <div class="h-msg-bubble">
                ${msg.text.replace(/\n/g, '<br>')}
                <button class="tts-btn" onclick="document.dispatchEvent(new CustomEvent('speak-ai', {detail: '${msg.text.replace(/'/g, "\\'")}'}))">🔊 Vorlesen</button>
              </div>
            </div>
          `;
        }
      });
    }

    return `<div class="h-inner">
      <div class="h-chat-container">
        <div class="h-chat-history" id="h-chat-history">
          ${chatHtml}
        </div>
        
        <div class="h-chat-input-area">
          <div class="h-chat-tools">
            <button class="h-chat-tool-btn" data-tool="analyze">🧠 Analysieren</button>
            <button class="h-chat-tool-btn" data-tool="formulate">📝 Formulieren</button>
            <button class="h-chat-tool-btn" data-tool="detail">🔍 Detaillieren</button>
            <button class="h-chat-tool-btn" data-tool="reset" style="color:#ff5555; border-color:rgba(255,85,85,0.3);">🗑️ Chat leeren</button>
          </div>
          <div class="h-chat-input-wrapper">
            <input type="text" class="h-chat-input" id="h-chat-input" placeholder="Stelle deine Frage (z.B. Ich habe Kopfschmerzen...)" onkeypress="if(event.key === 'Enter') document.dispatchEvent(new CustomEvent('send-chat'))">
            <button class="h-chat-send" onclick="document.dispatchEvent(new CustomEvent('send-chat'))">➤</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderAppShell() {
    if (state.currentView === 'splash') return css() + renderSplash();

    let viewContent = '';
    if (state.currentView === 'dashboard') viewContent = renderDashboard();
    else if (state.currentView === 'ki-tools') viewContent = renderKITools();
    else viewContent = '<div style="color:#fff; padding:40px; text-align:center;">Dieses Modul wird in Kürze freigeschaltet...</div>';

    return css() + `
      <div class="haldo-app">
        <div class="h-sidebar">
          <div class="h-logo">🩺 HalDo <span style="font-size:10px; color:#b478ff; background:rgba(180,120,255,0.1); padding:2px 6px; border-radius:4px;">M2</span></div>
          <div class="h-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">📊</span> Dashboard</div>
          <div class="h-nav-item" data-action="view-anatomy"><span class="icon">🧍‍♂️</span> Anatomie 3D</div>
          <div class="h-nav-item ${state.currentView === 'ki-tools' ? 'active' : ''}" data-action="view-ki-tools"><span class="icon">🤖</span> KI Assistent</div>
          <div class="h-nav-item" data-action="view-diseases"><span class="icon">🦠</span> Krankheiten</div>
          <div class="h-nav-item" data-action="view-meds"><span class="icon">💊</span> Medikamente</div>
          <div class="h-nav-item" data-action="view-labs"><span class="icon">🧪</span> Laborwerte</div>
          <div class="h-nav-item" data-action="view-devices"><span class="icon">📡</span> IoT & Hotspot</div>
          
          <div style="flex:1;"></div>
          
          <div class="h-nav-item" data-action="view-settings"><span class="icon">⚙️</span> Einstellungen</div>
          <div class="h-nav-item" data-action="view-emergency" style="color:#ff5555;"><span class="icon">🚨</span> Notfall</div>
        </div>

        <div class="h-main">
          <div class="h-header">
            <h1>${state.currentView === 'dashboard' ? 'Dashboard' : state.currentView === 'ki-tools' ? 'HalDo KI Assistent' : state.currentView}</h1>
            <div class="version">v${VERSION}</div>
          </div>
          <div class="h-content" id="h-view-container">
            ${viewContent}
          </div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 5. EVENT HANDLERS
  // ═══════════════════════════════════════════════════════
  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    const toolBtn = e.target.closest('[data-tool]');
    
    if (toolBtn) {
      const tool = toolBtn.dataset.tool;
      if (tool === 'reset') {
        state.chatHistory = [];
        saveState();
        if (currentTarget) currentTarget.innerHTML = renderAppShell();
      }
      return;
    }

    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'enter-app') {
      state.currentView = 'dashboard';
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      return;
    }

    if (action.startsWith('view-')) {
      state.currentView = action.replace('view-', '');
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      return;
    }
  }

  // Chat Logik
  document.addEventListener('send-chat', () => {
    const input = document.getElementById('h-chat-input');
    if (!input || !input.value.trim()) return;
    
    const text = input.value.trim();
    input.value = '';
    
    // User Nachricht speichern
    state.chatHistory.push({ role: 'user', text: text });
    
    // KI Antwort simulieren
    const aiResponse = getAIResponse(text, 'chat');
    state.chatHistory.push({ role: 'ai', text: aiResponse });
    
    saveState();
    if (currentTarget) currentTarget.innerHTML = renderAppShell();
    
    // Automatisch nach unten scrollen
    setTimeout(() => {
      const history = document.getElementById('h-chat-history');
      if (history) history.scrollTop = history.scrollHeight;
    }, 50);
  });

  // TTS Event
  document.addEventListener('speak-ai', (e) => {
    speakText(e.detail);
  });

  // ═══════════════════════════════════════════════════════
  // 6. MOUNT & EXPORT
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      loadState();
      state.currentView = 'splash'; 
      currentTarget.innerHTML = renderAppShell();
      currentTarget.addEventListener('click', handleClick);
      
      setTimeout(() => {
        if (window.HalDoWelcome && typeof window.HalDoWelcome.show === 'function') {
          window.HalDoWelcome.show("Arztbuch");
        }
      }, 200);
    }
  }

  function openOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;flex-direction:column;';
    
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;font-family:Inter;">🩺 HalDo Arztbuch ULTIMATE</b><button id="h-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:Inter;">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    
    const mountDiv = document.createElement('div');
    mountDiv.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    overlay.appendChild(mountDiv);
    document.body.appendChild(overlay);
    
    document.getElementById('h-close-btn').onclick = () => { overlay.remove(); currentTarget = null; };
    mount(mountDiv);
  }

  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.renderArztbuch = mount;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — Modul 1 & 2');
})();
