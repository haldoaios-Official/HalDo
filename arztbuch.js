/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v10.4 — MODUL 1, 2 & 3
   Echte 3D-Anatomie (Three.js) · KI-Chat · Sound-Settings
   ═══════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  const VERSION = '10.4.0-M3';
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
    chatHistory: [],
    splashTheme: 'cyan',
    soundEnabled: true // NEU: Sound ein/aus
  };

  let currentTarget = null;
  let audioCtx = null;

  // Three.js Variablen für die 3D-Anatomie
  let threeScene, threeCamera, threeRenderer, threeControls, threeAnimationId;
  let heartMesh, lungLeft, lungRight, brainMesh, skeletonGroup, musclesGroup, organsGroup, skinGroup;

  const SPLASH_THEMES = {
    cyan: { name: 'Cyan', primary: '#00e5ff', secondary: '#0088ff', bg1: '#001a2a', bg2: '#050810', glow: 'rgba(0,229,255,0.5)' },
    purple: { name: 'Purple', primary: '#b478ff', secondary: '#7a3aff', bg1: '#1a0a2a', bg2: '#080510', glow: 'rgba(180,120,255,0.5)' },
    emerald: { name: 'Emerald', primary: '#4ade80', secondary: '#22c55e', bg1: '#0a2a1a', bg2: '#05100a', glow: 'rgba(74,222,128,0.5)' }
  };

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
  // 2. LOGIK & SOUND
  // ═══════════════════════════════════════════════════════
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.splashTheme) state.splashTheme = parsed.splashTheme;
        if (parsed.chatHistory) state.chatHistory = parsed.chatHistory;
        if (parsed.soundEnabled !== undefined) state.soundEnabled = parsed.soundEnabled;
      }
    } catch (e) { }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { }
  }

  function getDailyTip() { return DAILY_TIPS[new Date().getDay()]; }

  function speakText(text) {
    if (!state.ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, ''));
    u.lang = 'de-DE'; u.rate = 1.0;
    window.speechSynthesis.speak(u);
  }

  function playStartupSound() {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') { audioCtx.resume(); }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 3.0);
    } catch (e) { }
  }

  function getAIResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('kopf')) return "Bei Kopfschmerzen helfen oft Ruhe, Wasser und frische Luft. Wenn es nicht besser wird, suche einen Arzt auf.";
    if (lower.includes('hallo')) return "Hallo Halil! Wie kann ich dir heute helfen?";
    return `Ich habe deine Nachricht verstanden: "${text}". Wie kann ich dir weiterhelfen?`;
  }

  // ═══════════════════════════════════════════════════════
  // 3. CSS (inkl. 3D Container & Splash)
  // ═══════════════════════════════════════════════════════
  function css() {
    const theme = SPLASH_THEMES[state.splashTheme];
    
    return `<style>
      :root {
        --splash-primary: ${theme.primary};
        --splash-secondary: ${theme.secondary};
        --splash-bg1: ${theme.bg1};
        --splash-bg2: ${theme.bg2};
        --splash-glow: ${theme.glow};
      }

      .haldo-app { font-family: 'Inter', system-ui, sans-serif; color: #e8e8ec; background: radial-gradient(circle at top right, #0a1220 0%, #050810 100%); height: 100%; width: 100%; display: flex; position: absolute; top: 0; left: 0; overflow: hidden; }
      .h-sidebar { width: 260px; background: rgba(10, 15, 25, 0.6); backdrop-filter: blur(24px); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; padding: 20px 0; z-index: 10; }
      .h-logo { padding: 0 20px 25px; font-size: 22px; font-weight: 900; color: #00e5ff; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px; }
      .h-nav-item { padding: 14px 24px; display: flex; align-items: center; gap: 14px; color: #8a9bb5; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.25s ease; border-left: 3px solid transparent; }
      .h-nav-item:hover { background: rgba(255,255,255,0.02); color: #fff; }
      .h-nav-item.active { background: linear-gradient(90deg, rgba(0,229,255,0.1) 0%, transparent 100%); color: #00e5ff; border-left-color: #00e5ff; }
      .h-nav-item .icon { font-size: 20px; width: 24px; text-align: center; }
      .h-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .h-header { padding: 25px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(10, 15, 25, 0.4); backdrop-filter: blur(10px); }
      .h-header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #fff; }
      .h-content { flex: 1; overflow-y: auto; padding: 40px; position: relative; }
      .h-content::-webkit-scrollbar { width: 8px; }
      .h-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      .h-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
      .h-card { background: rgba(20, 25, 35, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); transition: transform 0.3s ease; }
      .h-card:hover { transform: translateY(-2px); border-color: rgba(0,229,255,0.2); }

      /* Dashboard */
      .h-dashboard-top { display: flex; gap: 30px; align-items: stretch; }
      .h-greeting-card { flex: 1; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(180,120,255,0.05) 100%); border: 1px solid rgba(0,229,255,0.15); }
      .h-greeting-card h2 { font-size: 32px; margin: 0 0 10px 0; color: #fff; font-weight: 900; }
      .h-greeting-card p { color: #a8b0cc; margin: 0; font-size: 16px; line-height: 1.5; }
      .h-ai-avatar-container { width: 200px; height: 200px; position: relative; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 50%; border: 2px solid rgba(0,229,255,0.3); box-shadow: 0 0 40px rgba(0,229,255,0.2); cursor: pointer; transition: all 0.3s; }
      .h-ai-avatar-container:hover { box-shadow: 0 0 60px rgba(0,229,255,0.5); transform: scale(1.05); }
      .h-ai-core { width: 100px; height: 100px; background: radial-gradient(circle, #00e5ff 0%, #0044aa 100%); border-radius: 50%; animation: breathe 3s ease-in-out infinite; box-shadow: 0 0 50px #00e5ff; }
      @keyframes breathe { 0%, 100% { transform: scale(1); box-shadow: 0 0 30px #00e5ff; } 50% { transform: scale(1.15); box-shadow: 0 0 70px #00e5ff; } }
      .h-daily-tip { display: flex; align-items: center; gap: 20px; border-left: 4px solid #b478ff; }
      .h-daily-tip .tip-icon { font-size: 40px; background: rgba(180,120,255,0.1); padding: 15px; border-radius: 16px; }
      .h-daily-tip h3 { margin: 0 0 5px 0; color: #b478ff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      .h-daily-tip p { margin: 0; font-size: 16px; color: #ddd; line-height: 1.5; }
      .h-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
      .h-stat-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
      .h-stat-box .title { font-size: 12px; color: #8a9bb5; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
      .h-stat-box .value { font-size: 28px; font-weight: 900; color: #fff; }
      .h-stat-box .unit { font-size: 14px; color: #00e5ff; }
      .h-quick-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
      .h-quick-btn:hover { background: rgba(0,229,255,0.1); border-color: #00e5ff; transform: translateY(-3px); }
      .h-quick-btn .icon { font-size: 32px; }
      .h-quick-btn .label { font-size: 14px; font-weight: bold; color: #fff; }

      /* KI Chat */
      .h-chat-container { display: flex; flex-direction: column; height: calc(100vh - 150px); background: rgba(20, 25, 35, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; }
      .h-chat-history { flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
      .h-chat-history::-webkit-scrollbar { width: 6px; }
      .h-chat-history::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      .h-msg { display: flex; gap: 15px; max-width: 80%; }
      .h-msg.user { align-self: flex-end; flex-direction: row-reverse; }
      .h-msg.ai { align-self: flex-start; }
      .h-msg-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
      .h-msg.ai .h-msg-avatar { background: rgba(0,229,255,0.2); border: 1px solid #00e5ff; }
      .h-msg.user .h-msg-avatar { background: rgba(255,255,255,0.1); }
      .h-msg-bubble { padding: 15px 20px; border-radius: 16px; font-size: 15px; line-height: 1.6; }
      .h-msg.ai .h-msg-bubble { background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-top-left-radius: 4px; color: #ddd; }
      .h-msg.user .h-msg-bubble { background: linear-gradient(135deg, #00e5ff, #0088ff); color: #000; font-weight: 500; border-top-right-radius: 4px; }
      .h-msg-bubble .tts-btn { background: transparent; border: none; color: #00e5ff; cursor: pointer; font-size: 16px; margin-top: 8px; display: block; }
      .h-chat-input-area { padding: 20px 30px; background: rgba(10, 15, 25, 0.8); border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 15px; }
      .h-chat-tools { display: flex; gap: 10px; flex-wrap: wrap; }
      .h-chat-tool-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #aaa; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
      .h-chat-tool-btn:hover { background: rgba(0,229,255,0.1); color: #00e5ff; border-color: #00e5ff; }
      .h-chat-input-wrapper { display: flex; gap: 15px; }
      .h-chat-input { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px 20px; color: #fff; font-size: 15px; outline: none; font-family: inherit; resize: none; height: 50px; }
      .h-chat-input:focus { border-color: #00e5ff; box-shadow: 0 0 10px rgba(0,229,255,0.2); }
      .h-chat-send { background: linear-gradient(135deg, #00e5ff, #0088ff); border: none; border-radius: 12px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: #000; transition: transform 0.2s; }
      .h-chat-send:hover { transform: scale(1.05); }

      /* ═══════════════════════════════════════════════════════
         3D ANATOMIE CONTAINER
         ═══════════════════════════════════════════════════════ */
      .h-anatomy-container {
        width: 100%; height: calc(100vh - 200px);
        background: radial-gradient(circle at center, #111a2a 0%, #050810 100%);
        border-radius: 20px; overflow: hidden; position: relative;
        border: 1px solid rgba(0,229,255,0.2);
        box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
      }
      .h-anatomy-controls {
        position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
        display: flex; gap: 10px; background: rgba(0,0,0,0.6); padding: 10px;
        border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); z-index: 10;
      }
      .h-anatomy-btn {
        padding: 8px 16px; background: transparent; border: 1px solid #555;
        color: #aaa; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;
      }
      .h-anatomy-btn.active { background: rgba(0,229,255,0.2); border-color: #00e5ff; color: #00e5ff; }

      /* Splash */
      .h-splash { position: absolute; inset: 0; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, var(--splash-bg1) 0%, var(--splash-bg2) 100%); overflow: hidden; transition: background 0.5s ease; }
      .h-splash-logo-wrapper { position: relative; margin-bottom: 20px; animation: floatLogo 4s ease-in-out infinite; }
      .h-splash-logo-img { width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 0 30px var(--splash-primary)); transition: filter 0.5s ease; }
      .h-splash-logo-fallback { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--splash-primary), var(--splash-secondary)); display: flex; align-items: center; justify-content: center; font-size: 50px; font-weight: 900; color: #000; box-shadow: 0 0 50px var(--splash-glow); }
      @keyframes floatLogo { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.02); } }
      .h-splash-text-top { font-size: 20px; font-weight: 600; color: #ddd; margin-bottom: 5px; letter-spacing: 2px; text-transform: uppercase; }
      .h-splash-title { font-size: 52px; font-weight: 900; color: #ffd700; margin-bottom: 15px; text-align: center; text-shadow: 0 0 10px #ffd700, 0 0 20px #ff9800, 0 0 40px #ff6f00; animation: pulseGold 3s infinite alternate; }
      @keyframes pulseGold { 0% { text-shadow: 0 0 10px #ffd700, 0 0 20px #ff9800; } 100% { text-shadow: 0 0 15px #ffd700, 0 0 30px #ff9800, 0 0 50px #ff6f00; } }
      .h-splash-author { font-size: 18px; font-weight: 500; color: #e8e8ec; margin-bottom: 40px; font-style: italic; }
      .h-splash-subtitle { position: absolute; bottom: 100px; font-size: 12px; font-weight: 800; color: #ffd700; letter-spacing: 4px; text-transform: uppercase; opacity: 0.8; }
      .h-splash-btn { padding: 18px 60px; background: linear-gradient(135deg, var(--splash-primary) 0%, var(--splash-secondary) 100%); color: #000; font-size: 18px; font-weight: 900; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 10px 30px var(--splash-glow); transition: all 0.3s ease; position: relative; overflow: hidden; }
      .h-splash-btn:hover { transform: scale(1.05); box-shadow: 0 15px 40px var(--splash-glow); }
      .h-color-bands { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; background: rgba(0,0,0,0.4); padding: 10px 20px; border-radius: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); align-items: center; }
      .h-color-band { width: 25px; height: 25px; border-radius: 50%; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 2px solid transparent; }
      .h-color-band:hover { transform: scale(1.2); }
      .h-color-band.active { border-color: #fff; transform: scale(1.1); box-shadow: 0 0 15px rgba(255,255,255,0.5); }
      .band-cyan { background: linear-gradient(135deg, #00e5ff, #0088ff); }
      .band-purple { background: linear-gradient(135deg, #b478ff, #7a3aff); }
      .band-emerald { background: linear-gradient(135deg, #4ade80, #22c55e); }
      
      .h-sound-toggle { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; margin-left: 10px; border: 1px solid rgba(255,255,255,0.2); }
      .h-sound-toggle:hover { background: rgba(255,255,255,0.2); }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 4. RENDER FUNKTIONEN
  // ═══════════════════════════════════════════════════════
  function renderSplash() {
    return `
      <div class="h-splash">
        <div class="h-splash-logo-wrapper">
          <img src="logo.png" class="h-splash-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="h-splash-logo-fallback" style="display:none;">H</div>
        </div>

        <div class="h-splash-text-top">Willkommen bei</div>
        <div class="h-splash-title">HalDo Arztbuch App</div>
        <div class="h-splash-author">von Halil Donma</div>
        <div class="h-splash-subtitle">Professionale App</div>
        
        <button class="h-splash-btn" data-action="enter-app">Los geht's →</button>

        <div class="h-color-bands">
          ${Object.keys(SPLASH_THEMES).map(key => `
            <div class="h-color-band band-${key} ${state.splashTheme === key ? 'active' : ''}" data-theme="${key}" title="${SPLASH_THEMES[key].name}"></div>
          `).join('')}
          <div class="h-sound-toggle" data-action="toggle-sound" title="Sound an/aus">
            ${state.soundEnabled ? '🔊' : '🔇'}
          </div>
        </div>
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
        <div class="h-card" style="padding: 10px; display:flex; justify-content:center; align-items:center;">
          <div class="h-ai-avatar-container" data-action="view-ki-tools"><div class="h-ai-core"></div></div>
        </div>
      </div>
      <div class="h-card h-daily-tip">
        <div class="tip-icon">${tip.icon}</div>
        <div><h3>Tages-Tipp: ${tip.title}</h3><p>${tip.text}</p></div>
      </div>
      <div class="h-grid-4">
        <div class="h-stat-box"><div class="title">Blutdruck</div><div class="value">${state.vitals.bloodPressure} <span class="unit">mmHg</span></div></div>
        <div class="h-stat-box"><div class="title">Blutzucker</div><div class="value">${state.vitals.bloodSugar} <span class="unit">mg/dl</span></div></div>
        <div class="h-stat-box"><div class="title">Gewicht</div><div class="value">${state.vitals.weight} <span class="unit">kg</span></div></div>
        <div class="h-stat-box" style="border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.05);"><div class="title">Termine</div><div class="value">${state.appointments.length} <span class="unit">Anstehend</span></div></div>
      </div>
      <div>
        <h3 style="color:#fff; margin: 10px 0 15px 0; font-size:18px;">Schnellzugriff</h3>
        <div class="h-grid-4">
          <div class="h-quick-btn" data-action="view-emergency" style="border-color: rgba(255,51,51,0.3);"><div class="icon">🚨</div><div class="label" style="color:#ff5555;">Notfall (112)</div></div>
          <div class="h-quick-btn" data-action="view-ki-tools"><div class="icon">🤖</div><div class="label">KI Symptom-Check</div></div>
          <div class="h-quick-btn" data-action="view-meds"><div class="icon">💊</div><div class="label">Medikament eintragen</div></div>
          <div class="h-quick-btn" data-action="view-anatomy"><div class="icon">🧍‍♂️</div><div class="label">Anatomie 3D</div></div>
        </div>
      </div>
    </div>`;
  }

  function renderKITools() {
    let chatHtml = '';
    if (state.chatHistory.length === 0) {
      chatHtml = `<div class="h-msg ai"><div class="h-msg-avatar">🤖</div><div class="h-msg-bubble">Hallo Halil! Ich bin dein HalDo KI-Assistent. Was kann ich für dich tun?<button class="tts-btn" onclick="document.dispatchEvent(new CustomEvent('speak-ai', {detail: 'Hallo Halil!'}))">🔊 Vorlesen</button></div></div>`;
    } else {
      state.chatHistory.forEach(msg => {
        if (msg.role === 'user') {
          chatHtml += `<div class="h-msg user"><div class="h-msg-avatar">👤</div><div class="h-msg-bubble">${msg.text}</div></div>`;
        } else {
          chatHtml += `<div class="h-msg ai"><div class="h-msg-avatar">🤖</div><div class="h-msg-bubble">${msg.text.replace(/\n/g, '<br>')}<button class="tts-btn" onclick="document.dispatchEvent(new CustomEvent('speak-ai', {detail: '${msg.text.replace(/'/g, "\\'")}'}))">🔊 Vorlesen</button></div></div>`;
        }
      });
    }

    return `<div class="h-inner"><div class="h-chat-container"><div class="h-chat-history" id="h-chat-history">${chatHtml}</div>
      <div class="h-chat-input-area">
        <div class="h-chat-tools">
          <button class="h-chat-tool-btn" data-tool="analyze">🧠 Analysieren</button>
          <button class="h-chat-tool-btn" data-tool="formulate">📝 Formulieren</button>
          <button class="h-chat-tool-btn" data-tool="reset" style="color:#ff5555; border-color:rgba(255,85,85,0.3);">🗑️ Chat leeren</button>
        </div>
        <div class="h-chat-input-wrapper">
          <input type="text" class="h-chat-input" id="h-chat-input" placeholder="Stelle deine Frage..." onkeypress="if(event.key === 'Enter') document.dispatchEvent(new CustomEvent('send-chat'))">
          <button class="h-chat-send" onclick="document.dispatchEvent(new CustomEvent('send-chat'))">➤</button>
        </div>
      </div>
    </div></div>`;
  }

  function renderAnatomy() {
    return `<div class="h-inner">
      <div class="h-card" style="padding: 15px;">
        <h2>🧍‍♂️ Anatomie 3D</h2>
        <p style="color:#888;font-size:13px;margin-top:-8px;margin-bottom:15px;">Echte medizinische 3D-Anatomie. Ziehen zum Drehen, Organe anklicken.</p>
        
        <div class="h-anatomy-container" id="anatomy-3d-container">
           <div class="h-anatomy-controls">
             <button class="h-anatomy-btn" data-anatomy-mode="skin">Haut</button>
             <button class="h-anatomy-btn" data-anatomy-mode="muscles">Muskeln</button>
             <button class="h-anatomy-btn" data-anatomy-mode="skeleton">Skelett</button>
             <button class="h-anatomy-btn active" data-anatomy-mode="organs">Organe</button>
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
    else if (state.currentView === 'anatomy') viewContent = renderAnatomy();
    else viewContent = '<div style="color:#fff; padding:40px; text-align:center;">Modul in Arbeit...</div>';

    return css() + `
      <div class="haldo-app">
        <div class="h-sidebar">
          <div class="h-logo">🩺 HalDo <span style="font-size:10px; color:#b478ff; background:rgba(180,120,255,0.1); padding:2px 6px; border-radius:4px;">M3</span></div>
          <div class="h-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">📊</span> Dashboard</div>
          <div class="h-nav-item ${state.currentView === 'anatomy' ? 'active' : ''}" data-action="view-anatomy"><span class="icon">🧍‍♂️</span> Anatomie 3D</div>
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
          <div class="h-header"><h1>${state.currentView === 'dashboard' ? 'Dashboard' : state.currentView === 'ki-tools' ? 'KI Assistent' : state.currentView === 'anatomy' ? 'Anatomie 3D' : state.currentView}</h1><div class="version">v${VERSION}</div></div>
          <div class="h-content" id="h-view-container">${viewContent}</div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 5. 3D LOGIK (Prozedurales Meisterwerk)
  // ═══════════════════════════════════════════════════════
  function init3DAnatomy() {
    const container = document.getElementById('anatomy-3d-container');
    if (!container) return;

    if (threeRenderer) {
      if (threeRenderer.domElement.parentNode) threeRenderer.domElement.parentNode.removeChild(threeRenderer.domElement);
      threeRenderer.dispose();
    }
    if (threeAnimationId) cancelAnimationFrame(threeAnimationId);

    const w = container.clientWidth;
    const h = container.clientHeight;

    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    threeCamera.position.set(0, 0.5, 5);

    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(w, h);
    threeRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(threeRenderer.domElement);

    threeControls = new OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.autoRotate = true;
    threeControls.autoRotateSpeed = 1.0;

    threeScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 3, 2);
    threeScene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.5);
    rimLight.position.set(-2, -1, -2);
    threeScene.add(rimLight);

    buildAnatomyModel(threeScene);
    updateAnatomyVisibility('organs');

    function animate() {
      threeAnimationId = requestAnimationFrame(animate);
      threeControls.update();
      const time = Date.now() * 0.001;
      
      if (heartMesh) {
        const beat = 1 + Math.sin(time * 5) * 0.08;
        heartMesh.scale.set(beat, beat * 1.2, beat * 0.9);
      }
      if (lungLeft && lungRight) {
        const breath = 1 + Math.sin(time * 2) * 0.05;
        lungLeft.scale.set(0.8, 1.4 * breath, 0.8);
        lungRight.scale.set(0.8, 1.4 * breath, 0.8);
      }
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();

    // Raycaster für Klicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    threeRenderer.domElement.addEventListener('click', (event) => {
      const rect = threeRenderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, threeCamera);
      const intersects = raycaster.intersectObjects(organsGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.name) {
          // Zeige Info-Modal (vereinfacht für jetzt)
          alert(`${hit.userData.name}\n\n${hit.userData.desc}`);
          speakText(hit.userData.name + '. ' + hit.userData.desc);
        }
      }
    });
  }

  function updateAnatomyVisibility(mode) {
    if (!skinGroup || !skeletonGroup || !musclesGroup || !organsGroup) return;
    
    skinGroup.visible = (mode === 'skin' || mode === 'organs' || mode === 'muscles');
    musclesGroup.visible = (mode === 'muscles' || mode === 'organs' || mode === 'skeleton');
    skeletonGroup.visible = (mode === 'skeleton' || mode === 'organs');
    organsGroup.visible = (mode === 'organs');

    if (skinGroup.visible && mode !== 'skin') {
       skinGroup.children.forEach(c => { if(c.material) c.material.opacity = 0.1; });
    } else if (skinGroup.visible) {
       skinGroup.children.forEach(c => { if(c.material) c.material.opacity = 0.8; });
    }
  }

  function buildAnatomyModel(scene) {
    skinGroup = new THREE.Group();
    musclesGroup = new THREE.Group();
    skeletonGroup = new THREE.Group();
    organsGroup = new THREE.Group();
    scene.add(skinGroup, musclesGroup, skeletonGroup, organsGroup);

    // 1. Haut (Hologramm)
    const skinMat = new THREE.MeshPhysicalMaterial({ color: 0x66ccff, transparent: true, opacity: 0.15, roughness: 0.2, transmission: 0.5, side: THREE.DoubleSide });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), skinMat); head.position.y = 1.8; skinGroup.add(head);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.3, 16), skinMat); neck.position.y = 1.4; skinGroup.add(neck);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 16, 32), skinMat); torso.position.y = 0.8; skinGroup.add(torso);
    [-1, 1].forEach(side => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.8, 8, 16), skinMat); arm.position.set(side * 0.5, 0.8, 0); arm.rotation.z = side * Math.PI / 8; skinGroup.add(arm);
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.9, 8, 16), skinMat); leg.position.set(side * 0.18, -0.5, 0); skinGroup.add(leg);
    });

    // 2. Skelett
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), boneMat); skull.position.y = 1.85; skeletonGroup.add(skull);
    for(let i=0; i<15; i++) {
        const v = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), boneMat); v.position.set(0, 1.5 - i*0.1, -0.15); skeletonGroup.add(v);
    }
    for(let i=0; i<6; i++) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i*0.02, 0.02, 8, 32, Math.PI), boneMat);
        rib.position.set(0, 1.3 - i*0.1, -0.05); rib.rotation.x = Math.PI/2; rib.rotation.y = Math.PI/2; skeletonGroup.add(rib);
    }
    const pelvis = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 16), boneMat); pelvis.position.set(0, 0.2, 0); pelvis.rotation.x = Math.PI/2; skeletonGroup.add(pelvis);
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), boneMat); arm.position.set(side * 0.5, 0.8, 0); arm.rotation.z = side * Math.PI / 8; skeletonGroup.add(arm);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), boneMat); leg.position.set(side * 0.18, -0.5, 0); skeletonGroup.add(leg);
    });

    // 3. Muskeln
    const muscleMat = new THREE.MeshStandardMaterial({ color: 0xaa3333, roughness: 0.6 });
    const muscleTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.6, 16, 32), muscleMat); muscleTorso.position.y = 0.9; musclesGroup.add(muscleTorso);
    const muscleThighL = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.6, 8, 16), muscleMat); muscleThighL.position.set(-0.18, -0.4, 0); musclesGroup.add(muscleThighL);
    const muscleThighR = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.6, 8, 16), muscleMat); muscleThighR.position.set(0.18, -0.4, 0); musclesGroup.add(muscleThighR);

    // 4. Organe (Klickbar)
    function addOrgan(mesh, name, desc, icon) {
        mesh.userData = { name, desc, icon };
        organsGroup.add(mesh);
    }

    brainMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffb3c8, roughness: 0.7 }));
    brainMesh.position.y = 1.9; addOrgan(brainMesh, 'Gehirn', 'Zentrale des Nervensystems.', '🧠');

    const lungMat = new THREE.MeshStandardMaterial({ color: 0xff8888, roughness: 0.6, transparent: true, opacity: 0.9, emissive: 0x220000 });
    lungLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.4, 8, 16), lungMat);
    lungLeft.position.set(-0.15, 1.2, 0.05); addOrgan(lungLeft, 'Lunge (links)', 'Atmungsorgan.', '🫁');
    lungRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.4, 8, 16), lungMat);
    lungRight.position.set(0.15, 1.2, 0.05); addOrgan(lungRight, 'Lunge (rechts)', 'Atmungsorgan.', '🫁');

    heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), new THREE.MeshStandardMaterial({ color: 0xdd0000, roughness: 0.3, emissive: 0x330000 }));
    heartMesh.scale.set(1, 1.2, 0.9); heartMesh.position.set(-0.05, 1.0, 0.15); addOrgan(heartMesh, 'Herz', 'Muskelpumpe für den Blutkreislauf.', '🫀');

    const liver = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), new THREE.MeshStandardMaterial({ color: 0x8b3a1a, roughness: 0.8 }));
    liver.scale.set(1.5, 0.6, 0.9); liver.position.set(0.15, 0.75, 0.1); addOrgan(liver, 'Leber', 'Entgiftung und Galleproduktion.', '🟤');

    const stomach = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), new THREE.MeshStandardMaterial({ color: 0xe8a878, roughness: 0.7 }));
    stomach.scale.set(1, 1.2, 0.8); stomach.position.set(-0.15, 0.7, 0.1); addOrgan(stomach, 'Magen', 'Verdauung von Nahrung.', '🫃');

    [-1, 1].forEach(side => {
        const kidney = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 }));
        kidney.scale.set(0.8, 1.4, 1); kidney.position.set(side * 0.2, 0.6, -0.1);
        addOrgan(kidney, side < 0 ? 'Niere (links)' : 'Niere (rechts)', 'Blutfilterung und Urinbildung.', '🫘');
    });

    const intestines = new THREE.Mesh(new THREE.TorusKnotGeometry(0.12, 0.04, 64, 8), new THREE.MeshStandardMaterial({ color: 0xf5b8b8, roughness: 0.8 }));
    intestines.position.set(0, 0.35, 0.1); intestines.scale.set(1.2, 0.8, 0.6); addOrgan(intestines, 'Darm', 'Nährstoffaufnahme und Wasserentzug.', '🌀');
  }

  // ═══════════════════════════════════════════════════════
  // 6. EVENT HANDLERS
  // ═══════════════════════════════════════════════════════
  function handleClick(e) {
    const themeBtn = e.target.closest('[data-theme]');
    const toolBtn = e.target.closest('[data-tool]');
    const anatomyBtn = e.target.closest('[data-anatomy-mode]');
    const btn = e.target.closest('[data-action]');

    if (themeBtn) {
      state.splashTheme = themeBtn.dataset.theme;
      saveState();
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      return;
    }

    if (anatomyBtn) {
      const mode = anatomyBtn.dataset.anatomyMode;
      document.querySelectorAll('.h-anatomy-btn').forEach(b => b.classList.remove('active'));
      anatomyBtn.classList.add('active');
      updateAnatomyVisibility(mode);
      return;
    }

    if (toolBtn) {
      const tool = toolBtn.dataset.tool;
      if (tool === 'reset') {
        state.chatHistory = []; saveState();
        if (currentTarget) currentTarget.innerHTML = renderAppShell();
      }
      return;
    }

    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'toggle-sound') {
      state.soundEnabled = !state.soundEnabled;
      saveState();
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      return;
    }

    if (action === 'enter-app') {
      state.currentView = 'dashboard';
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      return;
    }

    if (action.startsWith('view-')) {
      state.currentView = action.replace('view-', '');
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      if (state.currentView === 'anatomy') {
        setTimeout(init3DAnatomy, 100);
      }
      return;
    }
  }

  document.addEventListener('send-chat', () => {
    const input = document.getElementById('h-chat-input');
    if (!input || !input.value.trim()) return;
    
    const text = input.value.trim();
    input.value = '';
    state.chatHistory.push({ role: 'user', text: text });
    
    const aiResponse = getAIResponse(text);
    state.chatHistory.push({ role: 'ai', text: aiResponse });
    saveState();
    
    if (currentTarget) currentTarget.innerHTML = renderAppShell();
    setTimeout(() => {
      const history = document.getElementById('h-chat-history');
      if (history) history.scrollTop = history.scrollHeight;
    }, 50);
  });

  document.addEventListener('speak-ai', (e) => { speakText(e.detail); });

  // ═══════════════════════════════════════════════════════
  // 7. MOUNT & EXPORT
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      loadState();
      state.currentView = 'splash'; 
      currentTarget.innerHTML = renderAppShell();
      currentTarget.addEventListener('click', handleClick);
      
      if (state.soundEnabled) playStartupSound();
      
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

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — Modul 1, 2 & 3');
})();
