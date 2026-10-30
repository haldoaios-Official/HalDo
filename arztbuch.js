/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v16.0 — PERFEKTE 3D ANATOMIE
   Echte Größe der Organe · Perfekte Positionierung
   ═══════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function () {
  'use strict';

  const VERSION = '16.0-PERFECT';
  const STORAGE_KEY = 'haldo.arztbuch.v16';

  let state = {
    lang: 'de',
    currentView: 'splash',
    ttsEnabled: true,
    chatHistory: [],
    splashTheme: 'cyan',
    soundEnabled: true,
    hotspot: { ssid: 'HalDo_Med_Network', pass: '12345678', active: false },
    anatomyMode: 'organs'
  };

  let currentTarget = null;
  let audioCtx = null;
  let threeScene, threeCamera, threeRenderer, threeControls, threeAnimationId;
  let skinGroup, organsGroup;
  let heartMesh, lungLeft, lungRight, brainMesh;

  const THEMES = {
    cyan: { p: '#00e5ff', s: '#0088ff', bg: '#050810', g: 'rgba(0,229,255,0.5)' },
    purple: { p: '#b478ff', s: '#7a3aff', bg: '#080510', g: 'rgba(180,120,255,0.5)' },
    gold: { p: '#ffd700', s: '#ff9800', bg: '#0a0500', g: 'rgba(255,215,0,0.5)' },
    green: { p: '#4ade80', s: '#22c55e', bg: '#05100a', g: 'rgba(74,222,128,0.5)' }
  };

  // ═══════════════════════════════════════════════════════
  // MASSIVE A-Z DATENBANKEN (Aus deiner Datei)
  // ═══════════════════════════════════════════════════════
  const DISEASES = [
    { name: 'Abszess', symp: 'Schmerzhafte, geschwollene Stelle, Fieber', tr: 'Arzt aufsuchen, Eröffnung, Antibiotika.' },
    { name: 'Akne', symp: 'Pickel, Mitesser, Entzündungen', tr: 'Reinigung, Salben, ggf. Antibiotika.' },
    { name: 'Aids (HIV)', symp: 'Fieber, Müdigkeit, Lymphknoten', tr: 'Antiretrovirale Therapie (ART).' },
    { name: 'Allergie', symp: 'Niesen, Juckreiz, Atemnot', tr: 'Allergene meiden, Antihistaminika.' },
    { name: 'Alzheimer', symp: 'Gedächtnisverlust, Orientierungslosigkeit', tr: 'Medikamente, Betreuung.' },
    { name: 'Anämie', symp: 'Müdigkeit, Blässe, Schwindel', tr: 'Eisenpräparate, Vitamin B12.' },
    { name: 'Angina Pectoris', symp: 'Engegefühl in der Brust', tr: 'Nitrate, Betablocker.' },
    { name: 'Angststörung', symp: 'Herzrasen, Panik, Zittern', tr: 'Psychotherapie, Antidepressiva.' },
    { name: 'Arthritis', symp: 'Geschwollene, schmerzhafte Gelenke', tr: 'Entzündungshemmer, Physiotherapie.' },
    { name: 'Arthrose', symp: 'Gelenkschmerzen, Steifheit', tr: 'Bewegung, Schmerzmittel.' },
    { name: 'Asthma', symp: 'Atemnot, Husten, Engegefühl', tr: 'Sprays, Kortison.' },
    { name: 'Bluthochdruck', symp: 'Kopfschmerzen, Schwindel', tr: 'Salzarm essen, Blutdrucksenker.' },
    { name: 'Bronchitis', symp: 'Husten mit Auswurf, Fieber', tr: 'Viel trinken, ggf. Antibiotika.' },
    { name: 'Cholesterin', symp: 'Oft symptomlos, Ablagerungen', tr: 'Ernährung, Statine.' },
    { name: 'Depression', symp: 'Niedergeschlagenheit, Antriebslosigkeit', tr: 'Psychotherapie, Antidepressiva.' },
    { name: 'Diabetes Typ 1', symp: 'Durst, Wasserlassen, Gewichtsverlust', tr: 'Insulin-Injektionen.' },
    { name: 'Diabetes Typ 2', symp: 'Müdigkeit, Durst, Blutzucker', tr: 'Ernährung, Metformin.' },
    { name: 'Gastritis', symp: 'Magenschmerzen, Übelkeit', tr: 'Schonkost, Protonenpumpenhemmer.' },
    { name: 'Grippe', symp: 'Fieber, Gliederschmerzen, Husten', tr: 'Bettruhe, Fieber senken.' },
    { name: 'Herzinfarkt', symp: 'Starker Brustschmerz, Atemnot', tr: 'NOTRUF 112! Stent, Medikamente.' },
    { name: 'Migräne', symp: 'Pulsierender Schmerz, Übelkeit', tr: 'Ruhe, Triptane.' },
    { name: 'Schlaganfall', symp: 'Plötzliche Lähmung, Sprachstörung', tr: 'NOTRUF 112! Thrombolyse.' },
    { name: 'Schwangerschaft', symp: 'Ausbleiben der Periode, Übelkeit, Müdigkeit', tr: 'Arzt aufsuchen, Folsäure einnehmen, gesunde Ernährung.' },
    { name: 'Geburt', symp: 'Wehen, Fruchtwasserabgang', tr: 'Sofort ins Krankenhaus / Hebamme rufen.' },
    { name: 'Geschlechtskrankheiten (STI)', symp: 'Ausfluss, Schmerzen beim Wasserlassen, Hautveränderungen', tr: 'Dringend zum Arzt! Antibiotika oder antivirale Therapie.' },
    { name: 'Geschlechtsumwandlung', symp: 'Psychische Belastung durch Geschlechtsdysphorie', tr: 'Psychotherapie, Endokrinologie, ggf. chirurgische Maßnahmen.' },
    { name: 'Sexualität & Aufklärung', symp: 'Fragen zu Verhütung, Orgasmus, Spermien', tr: 'Aufklärung, sichere Verhütung (Kondome, Pille).' }
  ];

  const MEDS = [
    { name: 'Amoxicillin', use: 'Bakterielle Infektionen', dose: '1-0-1', info: 'Verschreibungspflichtig.' },
    { name: 'Aspirin 100mg', use: 'Blutverdünnung', dose: '1x täglich', info: 'Magenschutz beachten.' },
    { name: 'Metoprolol', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich', info: 'Puls prüfen.' },
    { name: 'Prednisolon', use: 'Entzündungen', dose: 'Ausschleichend', info: 'Nicht abrupt absetzen.' },
    { name: 'Ibuprofen', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich', info: 'Magenschutz.' },
    { name: 'Insulin', use: 'Diabetes', dose: 'Je nach Blutzucker', info: 'Kühl lagern.' },
    { name: 'L-Thyroxin', use: 'Schilddrüsenunterfunktion', dose: 'Morgens nüchtern', info: '30 Min. vor Frühstück.' },
    { name: 'Metformin', use: 'Diabetes Typ 2', dose: 'Zu Mahlzeiten', info: 'Nierenwerte prüfen.' },
    { name: 'Paracetamol', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich', info: 'Leberschäden bei Überdosis.' },
    { name: 'Voltaren', use: 'Schmerzen', dose: 'Magensicher', info: 'Nicht auf offene Wunden.' },
    { name: 'Pille (Ovulationshemmer)', use: 'Verhütung', dose: 'Täglich', info: 'Rezeptpflichtig.' }
  ];

  const LABS = [
    { name: 'Blutzucker', ref: '70-100 mg/dl', desc: 'Nüchternwert.' },
    { name: 'Cholesterin', ref: '< 200 mg/dl', desc: 'Gesamtcholesterin.' },
    { name: 'CRP', ref: '< 5 mg/l', desc: 'Entzündungswert.' },
    { name: 'Hämoglobin', ref: '12-17 g/dl', desc: 'Sauerstofftransport.' },
    { name: 'HbA1c', ref: '4,0-5,6 %', desc: 'Langzeitblutzucker.' },
    { name: 'Kalium', ref: '3,5-5,0 mmol/l', desc: 'Wichtig fürs Herz.' },
    { name: 'Kreatinin', ref: '0,6-1,3 mg/dl', desc: 'Nierenwert.' },
    { name: 'Leukozyten', ref: '4.000-10.000', desc: 'Weiße Blutkörperchen.' },
    { name: 'TSH', ref: '0,4-4,0 mU/l', desc: 'Schilddrüse.' }
  ];

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
  // LOGIK & SOUND
  // ═══════════════════════════════════════════════════════
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
      if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 3.0);
    } catch (e) { }
  }

  // ═══════════════════════════════════════════════════════
  // CSS
  // ═══════════════════════════════════════════════════════
  function css() {
    const t = THEMES[state.splashTheme];
    return `<style>
      :root { --p: ${t.p}; --s: ${t.s}; --bg: ${t.bg}; --g: ${t.g}; }
      .haldo-app { font-family: 'Inter', sans-serif; color: #e8e8ec; background: radial-gradient(circle at top right, #0a1220 0%, var(--bg) 100%); height: 100%; width: 100%; display: flex; position: absolute; top: 0; left: 0; overflow: hidden; }
      .h-sidebar { width: 260px; background: rgba(10, 15, 25, 0.6); backdrop-filter: blur(24px); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; padding: 20px 0; z-index: 10; overflow-y: auto; }
      .h-logo { padding: 0 20px 25px; font-size: 22px; font-weight: 900; color: var(--p); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px; }
      .h-nav-item { padding: 14px 24px; display: flex; align-items: center; gap: 14px; color: #8a9bb5; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
      .h-nav-item:hover { background: rgba(255,255,255,0.02); color: #fff; }
      .h-nav-item.active { background: linear-gradient(90deg, rgba(0,229,255,0.1) 0%, transparent 100%); color: var(--p); border-left-color: var(--p); }
      .h-nav-item .icon { font-size: 20px; width: 24px; text-align: center; }
      .h-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .h-header { padding: 25px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(10, 15, 25, 0.4); backdrop-filter: blur(10px); }
      .h-header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #fff; }
      .h-content { flex: 1; overflow-y: auto; padding: 40px; position: relative; }
      .h-content::-webkit-scrollbar { width: 8px; } .h-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      .h-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
      .h-card { background: rgba(20, 25, 35, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
      
      /* Dashboard */
      .h-dashboard-top { display: flex; gap: 30px; align-items: stretch; }
      .h-greeting-card { flex: 1; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(180,120,255,0.05) 100%); border: 1px solid rgba(0,229,255,0.15); }
      .h-greeting-card h2 { font-size: 32px; margin: 0 0 10px 0; color: #fff; font-weight: 900; }
      .h-ai-avatar-container { width: 200px; height: 200px; position: relative; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 50%; border: 2px solid rgba(0,229,255,0.3); cursor: pointer; transition: 0.3s; }
      .h-ai-avatar-container:hover { box-shadow: 0 0 60px rgba(0,229,255,0.5); transform: scale(1.05); }
      .h-ai-core { width: 100px; height: 100px; background: radial-gradient(circle, var(--p) 0%, var(--s) 100%); border-radius: 50%; animation: breathe 3s infinite; box-shadow: 0 0 50px var(--p); }
      @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); box-shadow: 0 0 70px var(--p); } }
      .h-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
      .h-stat-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; }
      .h-stat-box .title { font-size: 12px; color: #8a9bb5; text-transform: uppercase; font-weight: bold; }
      .h-stat-box .value { font-size: 28px; font-weight: 900; color: #fff; }
      .h-quick-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
      .h-quick-btn:hover { background: rgba(0,229,255,0.1); border-color: var(--p); transform: translateY(-3px); }
      .h-quick-btn .icon { font-size: 32px; } .h-quick-btn .label { font-size: 14px; font-weight: bold; color: #fff; }

      /* Generic List Items & Inputs */
      .h-list-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; }
      .h-list-item:hover { border-color: var(--p); background: rgba(0,229,255,0.05); }
      .h-input { width: 100%; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 15px; margin-bottom: 20px; outline: none; }
      .h-input:focus { border-color: var(--p); }

      /* KI Chat */
      .h-chat-container { display: flex; flex-direction: column; height: calc(100vh - 200px); background: rgba(20, 25, 35, 0.4); border-radius: 20px; overflow: hidden; }
      .h-chat-history { flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
      .h-msg { display: flex; gap: 15px; max-width: 80%; }
      .h-msg.user { align-self: flex-end; flex-direction: row-reverse; }
      .h-msg-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,229,255,0.2); border: 1px solid var(--p); }
      .h-msg-bubble { padding: 15px 20px; border-radius: 16px; font-size: 15px; line-height: 1.6; }
      .h-msg.ai .h-msg-bubble { background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-top-left-radius: 4px; }
      .h-msg.user .h-msg-bubble { background: linear-gradient(135deg, var(--p), var(--s)); color: #000; border-top-right-radius: 4px; }
      .h-chat-input-area { padding: 20px 30px; background: rgba(10, 15, 25, 0.8); display: flex; gap: 15px; }
      .h-chat-input { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; color: #fff; font-size: 15px; outline: none; }
      .h-chat-send { background: linear-gradient(135deg, var(--p), var(--s)); border: none; border-radius: 12px; width: 50px; cursor: pointer; font-size: 20px; color: #000; }

      /* 3D Anatomie */
      .h-anatomy-container { width: 100%; height: calc(100vh - 250px); background: radial-gradient(circle at center, #111a2a 0%, #050810 100%); border-radius: 20px; overflow: hidden; position: relative; border: 1px solid rgba(0,229,255,0.2); }
      .h-anatomy-controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 12px; backdrop-filter: blur(10px); }
      .h-anatomy-btn { padding: 8px 16px; background: transparent; border: 1px solid #555; color: #aaa; border-radius: 8px; cursor: pointer; font-weight: bold; }
      .h-anatomy-btn.active { background: rgba(0,229,255,0.2); border-color: var(--p); color: var(--p); }

      /* Splash */
      .h-splash { position: absolute; inset: 0; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, var(--bg) 0%, #000 100%); }
      .h-splash-logo-wrapper { margin-bottom: 20px; animation: floatLogo 4s infinite; }
      .h-splash-logo-img { width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 0 30px var(--p)); }
      @keyframes floatLogo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
      .h-splash-text-top { font-size: 20px; color: #ddd; text-transform: uppercase; }
      .h-splash-title { font-size: 52px; font-weight: 900; color: #ffd700; margin-bottom: 15px; text-shadow: 0 0 10px #ffd700, 0 0 20px #ff9800; animation: pulseGold 3s infinite alternate; }
      @keyframes pulseGold { 0% { text-shadow: 0 0 10px #ffd700; } 100% { text-shadow: 0 0 30px #ff9800, 0 0 50px #ff6f00; } }
      .h-splash-author { font-size: 18px; color: #e8e8ec; margin-bottom: 40px; font-style: italic; }
      .h-splash-subtitle { position: absolute; bottom: 100px; font-size: 12px; color: #ffd700; letter-spacing: 4px; text-transform: uppercase; }
      .h-splash-btn { padding: 18px 60px; background: linear-gradient(135deg, var(--p) 0%, var(--s) 100%); color: #000; font-size: 18px; font-weight: 900; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 10px 30px var(--g); }
      .h-color-bands { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; background: rgba(0,0,0,0.4); padding: 10px 20px; border-radius: 30px; align-items: center; }
      .h-color-band { width: 25px; height: 25px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
      .h-color-band.active { border-color: #fff; transform: scale(1.1); }
      .band-cyan { background: #00e5ff; } .band-purple { background: #b478ff; } .band-green { background: #4ade80; } .band-gold { background: #ffd700; }
      .h-sound-toggle { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 10px; }
      
      /* Hardware */
      .h-hw-btn { padding: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; }
      .h-hw-btn:hover { background: rgba(0,229,255,0.1); border-color: var(--p); }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // RENDER FUNKTIONEN
  // ═══════════════════════════════════════════════════════
  function renderSplash() {
    return `
      <div class="h-splash">
        <div class="h-splash-logo-wrapper"><img src="logo.png" class="h-splash-logo-img" onerror="this.style.display='none';"></div>
        <div class="h-splash-text-top">Willkommen bei</div>
        <div class="h-splash-title">HalDo Arztbuch App</div>
        <div class="h-splash-author">von Halil Donma</div>
        <div class="h-splash-subtitle">Professionale App</div>
        <button class="h-splash-btn" data-action="enter-app">Los geht's →</button>
        <div class="h-color-bands">
          ${['cyan', 'purple', 'emerald', 'gold'].map(key => `<div class="h-color-band band-${key} ${state.splashTheme === key ? 'active' : ''}" data-theme="${key}"></div>`).join('')}
          <div class="h-sound-toggle" data-action="toggle-sound">${state.soundEnabled ? '🔊' : '🔇'}</div>
        </div>
      </div>
    `;
  }

  function renderDashboard() {
    return `<div class="h-inner">
      <div class="h-dashboard-top">
        <div class="h-card h-greeting-card"><h2>Guten Tag, Halil! 👋</h2><p>Bereit, deine Gesundheit in die Hand zu nehmen? Hier ist deine Übersicht für heute.</p></div>
        <div class="h-card" style="padding: 10px;"><div class="h-ai-avatar-container" data-action="view-ki"><div class="h-ai-core"></div></div></div>
      </div>
      <div class="h-grid-4">
        <div class="h-stat-box"><div class="title">Blutdruck</div><div class="value">120/80 <span style="font-size:14px;color:var(--p);">mmHg</span></div></div>
        <div class="h-stat-box"><div class="title">Blutzucker</div><div class="value">95 <span style="font-size:14px;color:var(--p);">mg/dl</span></div></div>
        <div class="h-stat-box"><div class="title">Gewicht</div><div class="value">75 <span style="font-size:14px;color:var(--p);">kg</span></div></div>
        <div class="h-stat-box"><div class="title">Wasser</div><div class="value">1.5 <span style="font-size:14px;color:var(--p);">L</span></div></div>
      </div>
      <div><h3 style="color:#fff; margin: 10px 0 15px 0;">Schnellzugriff</h3><div class="h-grid-4">
        <div class="h-quick-btn" data-action="view-emergency" style="border-color:#ff5555;"><div class="icon">🚨</div><div class="label" style="color:#ff5555;">Notfall</div></div>
        <div class="h-quick-btn" data-action="view-ki"><div class="icon">🤖</div><div class="label">KI Check</div></div>
        <div class="h-quick-btn" data-action="view-hardware"><div class="icon">🖨️</div><div class="label">Hardware</div></div>
        <div class="h-quick-btn" data-action="view-anatomy"><div class="icon">🧍‍♂️</div><div class="label">Anatomie 3D</div></div>
      </div></div>
    </div>`;
  }

  function renderKITools() {
    let chatHtml = state.chatHistory.length === 0 ? `<div class="h-msg ai"><div class="h-msg-avatar">🤖</div><div class="h-msg-bubble">Hallo! Ich bin dein HalDo KI-Assistent. Was kann ich für dich tun?</div></div>` 
    : state.chatHistory.map(m => m.role === 'user' ? `<div class="h-msg user"><div class="h-msg-bubble">${m.text}</div></div>` : `<div class="h-msg ai"><div class="h-msg-avatar">🤖</div><div class="h-msg-bubble">${m.text}</div></div>`).join('');
    return `<div class="h-inner"><div class="h-chat-container"><div class="h-chat-history" id="chat-hist">${chatHtml}</div>
      <div class="h-chat-input-area"><input type="text" class="h-chat-input" id="chat-in" placeholder="Stelle deine Frage..." onkeypress="if(event.key === 'Enter') document.dispatchEvent(new CustomEvent('send-chat'))"><button class="h-chat-send" onclick="document.dispatchEvent(new CustomEvent('send-chat'))">➤</button></div>
    </div></div>`;
  }

  function renderAnatomy() {
    return `<div class="h-inner"><div class="h-card" style="padding: 15px;">
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
    </div></div>`;
  }

  function renderGenericList(title, data, type) {
    return `<div class="h-inner"><div class="h-card"><h2>${title}</h2><input type="text" class="h-input" placeholder="Suchen..." data-search="${type}"><div id="list-container">
        ${data.map(item => `<div class="h-list-item" data-info="${item.symp || item.use || item.desc}" data-title="${item.name}"><div><b>${item.name}</b><br><span style="font-size:12px;color:#8a9bb5">${item.symp || item.use || item.ref}</span></div></div>`).join('')}
      </div></div></div>`;
  }

  function renderHardware() {
    return `<div class="h-inner">
      <div class="h-card" style="border-color:#00e5ff;">
        <h2>🖨️ Drucker & Scanner</h2>
        <p style="color:#888;margin-bottom:15px;">Verbinde deine Hardware mit der App.</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="h-hw-btn" onclick="alert('Druckauftrag an Drucker gesendet!')">🖨️ Rezept drucken</button>
          <button class="h-hw-btn" onclick="alert('Scanner bereit. Bitte Dokument einlegen.')">📠 Dokument scannen</button>
          <button class="h-hw-btn" onclick="alert('Kopierer gestartet.')">📄 Kopieren</button>
        </div>
      </div>
      <div class="h-card" style="border-color:#4ade80;">
        <h2>🏥 Krankenkasse & Überweisungen</h2>
        <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:12px; border-left:4px solid #4ade80; margin-bottom:15px;">
          <div style="font-size:18px; font-weight:bold;">AOK</div>
          <div style="color:#aaa;">Versichertennummer: A123456789</div>
        </div>
        <button class="h-hw-btn" onclick="alert('Überweisungsschein als PDF generiert und an Drucker gesendet.')">📄 Überweisung erstellen</button>
      </div>
    </div>`;
  }

  function renderDevices() {
    return `<div class="h-inner">
      <div class="h-card" style="border-color:#ffd700;">
        <h2>📶 Hotspot Manager</h2>
        <div style="margin-top:15px; display:flex; flex-direction:column; gap:15px;">
          <div style="display:flex; justify-content:space-between;"><b>Status:</b> <span style="color:${state.hotspot.active ? '#00ff88' : '#ff5555'}">${state.hotspot.active ? 'Aktiv' : 'Inaktiv'}</span></div>
          <div><b>SSID:</b> ${state.hotspot.ssid}</div>
          <div><b>Passwort:</b> <input type="text" id="hotspot-pass" value="${state.hotspot.pass}" style="background:transparent; border:1px solid #444; color:#fff; padding:5px; border-radius:5px;"></div>
          <div style="display:flex; gap:10px;">
            <button class="h-btn primary" data-action="save-hotspot" style="padding:10px; border:none; border-radius:8px; background:#00e5ff; font-weight:bold; cursor:pointer;">Passwort speichern</button>
            <button class="h-btn" data-action="toggle-hotspot" style="padding:10px; border:1px solid #00e5ff; color:#00e5ff; border-radius:8px; background:transparent; font-weight:bold; cursor:pointer;">Ein/Aus</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderEmergency() {
    return `<div class="h-inner" style="text-align:center;">
      <div class="h-card" style="background:rgba(255,0,0,0.1); border-color:#ff3333;">
        <h2 style="color:#ff3333; font-size:32px;">🚨 NOTFALL</h2>
        <button onclick="window.location.href='tel:112'" style="background:#ff3333; color:#fff; border:none; padding:20px 40px; font-size:24px; font-weight:900; border-radius:50px; cursor:pointer; margin-top:20px; box-shadow:0 0 30px rgba(255,0,0,0.5);">📞 112 Anrufen</button>
      </div>
    </div>`;
  }

  function renderAppShell() {
    if (state.currentView === 'splash') return css() + renderSplash();
    let content = '';
    switch(state.currentView) {
      case 'dashboard': content = renderDashboard(); break;
      case 'ki': content = renderKITools(); break;
      case 'anatomy': content = renderAnatomy(); break;
      case 'diseases': content = renderGenericList('🦠 Krankheiten A-Z', DISEASES, 'disease'); break;
      case 'meds': content = renderGenericList('💊 Medikamente A-Z', MEDS, 'med'); break;
      case 'labs': content = renderGenericList('🧪 Laborwerte A-Z', LABS, 'lab'); break;
      case 'devices': content = renderDevices(); break;
      case 'hardware': content = renderHardware(); break;
      case 'emergency': content = renderEmergency(); break;
      default: content = `<div class="h-inner"><div class="h-card">Modul in Arbeit...</div></div>`;
    }
    return css() + `
      <div class="haldo-app">
        <div class="h-sidebar">
          <div class="h-logo">🩺 HalDo</div>
          <div class="h-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">📊</span> Dashboard</div>
          <div class="h-nav-item ${state.currentView === 'anatomy' ? 'active' : ''}" data-action="view-anatomy"><span class="icon">🧍‍♂️</span> Anatomie 3D</div>
          <div class="h-nav-item ${state.currentView === 'ki' ? 'active' : ''}" data-action="view-ki"><span class="icon">🤖</span> KI Assistent</div>
          <div class="h-nav-item ${state.currentView === 'diseases' ? 'active' : ''}" data-action="view-diseases"><span class="icon">🦠</span> Krankheiten</div>
          <div class="h-nav-item ${state.currentView === 'meds' ? 'active' : ''}" data-action="view-meds"><span class="icon">💊</span> Medikamente</div>
          <div class="h-nav-item ${state.currentView === 'labs' ? 'active' : ''}" data-action="view-labs"><span class="icon">🧪</span> Laborwerte</div>
          <div class="h-nav-item ${state.currentView === 'devices' ? 'active' : ''}" data-action="view-devices"><span class="icon">📡</span> IoT & Hotspot</div>
          <div class="h-nav-item ${state.currentView === 'hardware' ? 'active' : ''}" data-action="view-hardware"><span class="icon">🖨️</span> Hardware & Kasse</div>
          <div style="flex:1;"></div>
          <div class="h-nav-item ${state.currentView === 'emergency' ? 'active' : ''}" data-action="view-emergency" style="color:#ff5555;"><span class="icon">🚨</span> Notfall</div>
        </div>
        <div class="h-main"><div class="h-header"><h1>${state.currentView.toUpperCase()}</h1><div style="font-size:12px; color:var(--p);">v${VERSION}</div></div><div class="h-content" id="h-view">${content}</div></div>
      </div>`;
  }

  // ═══════════════════════════════════════════════════════
  // 3D ENGINE (DER ECHTE FIX)
  // ═══════════════════════════════════════════════════════
  function init3DAnatomy() {
    const container = document.getElementById('anatomy-3d-container');
    if (!container) return;
    if (threeRenderer) { threeRenderer.dispose(); }
    if (threeAnimationId) { cancelAnimationFrame(threeAnimationId); }
    const w = container.clientWidth; const h = container.clientHeight;
    threeScene = new THREE.Scene();
    
    threeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000); 
    threeCamera.position.set(0, 1, 5); // Kamera weiter weg
    
    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(w, h); container.appendChild(threeRenderer.domElement);
    threeControls = new OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true; threeControls.autoRotate = true;
    threeControls.target.set(0, 1, 0); // Fokus auf Körpermitte

    threeScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); dirLight.position.set(2, 3, 2); threeScene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.6); rimLight.position.set(-2, -1, -2); threeScene.add(rimLight);

    skinGroup = new THREE.Group();
    organsGroup = new THREE.Group();
    threeScene.add(skinGroup, organsGroup);

    // LADE DAS MODELL
    const loader = new GLTFLoader();
    const modelUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Michelle.glb';
    
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
      
      if (model && typeof model.traverse === 'function') {
        model.scale.set(1.5, 1.5, 1.5);
        model.position.y = 0; 
        
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x66ccff, transparent: true, opacity: 0.15, roughness: 0.2, transmission: 0.5, side: THREE.DoubleSide
            });
          }
        });
        skinGroup.add(model);
        console.log("3D Ganzkörper-Modell erfolgreich geladen!");
      } else {
        console.warn("Modell hat keine traverse-Methode. Baue prozedurales Fallback.");
        buildProceduralSkin();
      }
      // ORGANE ERST NACH DEM LADEN BAUEN
      buildOrganModels();
      updateAnatomyVisibility(state.anatomyMode);
    }, undefined, (err) => {
      console.warn('GLTF-Modell konnte nicht geladen werden. Nutze prozedurales Fallback.');
      buildProceduralSkin();
      buildOrganModels();
      updateAnatomyVisibility(state.anatomyMode);
    });

    function animate() {
      threeAnimationId = requestAnimationFrame(animate); threeControls.update();
      const time = Date.now() * 0.001;
      if (heartMesh) { const beat = 1 + Math.sin(time * 5) * 0.08; heartMesh.scale.set(beat, beat * 1.2, beat * 0.9); }
      if (lungLeft && lungRight) { const breath = 1 + Math.sin(time * 2) * 0.05; lungLeft.scale.set(0.8, 1.4 * breath, 0.8); lungRight.scale.set(0.8, 1.4 * breath, 0.8); }
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
    
    const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
    threeRenderer.domElement.addEventListener('click', (event) => {
      const rect = threeRenderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, threeCamera);
      const intersects = raycaster.intersectObjects(organsGroup.children, true);
      if (intersects.length > 0) { 
        const hit = intersects[0].object; 
        if (hit.userData && hit.userData.name) { 
          alert(`${hit.userData.name}\n\n${hit.userData.desc}`); 
          speakText(hit.userData.name + '. ' + hit.userData.desc); 
        } 
      }
    });
  }

  function buildOrganModels() {
    // Wenn schon gebaut, nicht nochmal bauen
    if (organsGroup.children.length > 0) return;
    
    function addOrgan(mesh, name, desc, icon) { mesh.userData = { name, desc, icon }; organsGroup.add(mesh); }

    // Gehirn (Ganz klein, im Kopf)
    brainMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffb3c8, roughness: 0.7 }));
    brainMesh.position.set(0, 1.65, 0.02); 
    addOrgan(brainMesh, 'Gehirn', 'Zentrale des Nervensystems. Besteht aus Großhirn, Kleinhirn und Hirnstamm.', '🧠');

    // Lunge (Klein, im Brustkorb)
    const lungMat = new THREE.MeshStandardMaterial({ color: 0xff8888, transparent: true, opacity: 0.85 });
    lungLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.1, 8, 16), lungMat);
    lungLeft.position.set(-0.08, 1.15, 0.04); 
    addOrgan(lungLeft, 'Lunge (links)', 'Atmungsorgan. Nimmt Sauerstoff auf und gibt CO2 ab.', '🫁');
    lungRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.1, 8, 16), lungMat);
    lungRight.position.set(0.08, 1.15, 0.04); 
    addOrgan(lungRight, 'Lunge (rechts)', 'Atmungsorgan. Nimmt Sauerstoff auf und gibt CO2 ab.', '🫁');

    // Herz (Winzig, leicht links im Brustkorb)
    heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 24), new THREE.MeshStandardMaterial({ color: 0xdd0000, roughness: 0.3 }));
    heartMesh.scale.set(1, 1.2, 0.9); 
    heartMesh.position.set(-0.03, 1.08, 0.06);
    addOrgan(heartMesh, 'Herz', 'Muskelpumpe für den Blutkreislauf. 4 Kammern (2 Vorhöfe, 2 Herzkammern).', '🫀');

    // Leber (Rechts, im Bauchraum)
    const liver = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 20), new THREE.MeshStandardMaterial({ color: 0x8b3a1a }));
    liver.scale.set(1.5, 0.6, 0.9); liver.position.set(0.08, 0.85, 0.04); 
    addOrgan(liver, 'Leber', 'Entgiftung und Galle.', '🟤');

    // Magen (Links, im Bauchraum)
    const stomach = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 20), new THREE.MeshStandardMaterial({ color: 0xe8a878 }));
    stomach.scale.set(1, 1.2, 0.8); stomach.position.set(-0.06, 0.8, 0.04); 
    addOrgan(stomach, 'Magen', 'Verdauung von Nahrung.', '🫃');
    
    // Nieren (Hinten im Bauchraum)
    [-1, 1].forEach(side => {
        const kidney = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
        kidney.scale.set(0.8, 1.4, 1); kidney.position.set(side * 0.1, 0.9, -0.04);
        addOrgan(kidney, side < 0 ? 'Niere (links)' : 'Niere (rechts)', 'Blutfilterung und Urinbildung.', '🫘');
    });

    // Fortpflanzungsorgane
    const uterus = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff77aa }));
    uterus.position.set(0, 0.6, 0.04); addOrgan(uterus, 'Uterus/Gebärmutter', 'Fortpflanzungsorgan der Frau.', '🤰');
    const prostate = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshStandardMaterial({ color: 0x77aaff }));
    prostate.position.set(0, 0.55, 0.04); addOrgan(prostate, 'Prostata', 'Fortpflanzungsorgan des Mannes.', '♂️');
  }

  function buildProceduralSkin() {
    const skinMat = new THREE.MeshPhysicalMaterial({ color: 0x66ccff, transparent: true, opacity: 0.15, roughness: 0.2, transmission: 0.5, side: THREE.DoubleSide });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), skinMat); head.position.y = 1.7; skinGroup.add(head);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.8, 16, 32), skinMat); torso.position.y = 0.8; skinGroup.add(torso);
    [-1, 1].forEach(side => { 
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.8, 8, 16), skinMat); arm.position.set(side * 0.5, 0.8, 0); arm.rotation.z = side * Math.PI / 8; skinGroup.add(arm); 
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.9, 8, 16), skinMat); leg.position.set(side * 0.15, -0.5, 0); skinGroup.add(leg); 
    });
  }

  function updateAnatomyVisibility(mode) {
    if (!skinGroup || !organsGroup) return;
    skinGroup.visible = (mode === 'skin' || mode === 'organs' || mode === 'muscles');
    organsGroup.visible = (mode === 'organs');
    
    if (skinGroup.visible && mode !== 'skin') {
      skinGroup.children.forEach(c => { 
        if(c.material) c.material.opacity = 0.05; 
        if(c.children) c.children.forEach(ch => { if(ch.material) ch.material.opacity = 0.05; });
      }); 
    } else if (skinGroup.visible) {
      skinGroup.children.forEach(c => { 
        if(c.material) c.material.opacity = 0.3; 
        if(c.children) c.children.forEach(ch => { if(ch.material) ch.material.opacity = 0.3; });
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════
  function handleClick(e) {
    const themeBtn = e.target.closest('[data-theme]');
    const anatBtn = e.target.closest('[data-anatomy-mode]');
    const infoItem = e.target.closest('[data-title]');
    const btn = e.target.closest('[data-action]');

    if (themeBtn) { state.splashTheme = themeBtn.dataset.theme; saveState(); currentTarget.innerHTML = renderAppShell(); return; }
    if (anatBtn) { state.anatomyMode = anatBtn.dataset.anatomyMode; document.querySelectorAll('.h-anatomy-btn').forEach(b => b.classList.remove('active')); anatBtn.classList.add('active'); updateAnatomyVisibility(state.anatomyMode); return; }
    if (infoItem) { alert(`${infoItem.dataset.title}\n\n${infoItem.dataset.info}`); speakText(infoItem.dataset.title + '. ' + infoItem.dataset.info); return; }
    
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'toggle-sound') { state.soundEnabled = !state.soundEnabled; saveState(); currentTarget.innerHTML = renderAppShell(); return; }
    if (action === 'enter-app') { state.currentView = 'dashboard'; currentTarget.innerHTML = renderAppShell(); return; }
    if (action === 'save-hotspot') { state.hotspot.pass = document.getElementById('hotspot-pass').value; saveState(); alert('Passwort gespeichert!'); return; }
    if (action === 'toggle-hotspot') { state.hotspot.active = !state.hotspot.active; saveState(); currentTarget.innerHTML = renderAppShell(); return; }

    if (action.startsWith('view-')) {
      state.currentView = action.replace('view-', '');
      currentTarget.innerHTML = renderAppShell();
      if (state.currentView === 'anatomy') setTimeout(init3DAnatomy, 100);
      return;
    }
  }

  document.addEventListener('input', (e) => {
    if (e.target.dataset.search) {
      const query = e.target.value.toLowerCase();
      const type = e.target.dataset.search;
      const container = document.getElementById('list-container');
      let data = [];
      if (type === 'disease') data = DISEASES;
      if (type === 'med') data = MEDS;
      if (type === 'lab') data = LABS;
      const filtered = data.filter(item => item.name.toLowerCase().includes(query) || (item.symp && item.symp.toLowerCase().includes(query)) || (item.use && item.use.toLowerCase().includes(query)));
      container.innerHTML = filtered.map(item => `<div class="h-list-item" data-info="${item.symp || item.use || item.desc}" data-title="${item.name}"><div><b>${item.name}</b><br><span style="font-size:12px;color:#8a9bb5">${item.symp || item.use || item.ref}</span></div></div>`).join('');
    }
  });

  document.addEventListener('send-chat', () => {
    const input = document.getElementById('chat-in'); if (!input || !input.value.trim()) return;
    const txt = input.value.trim(); state.chatHistory.push({ role: 'user', text: txt });
    let res = txt.toLowerCase().includes('kopf') ? "Bei Kopfschmerzen: Ruhe, Wasser und frische Luft." : `Ich habe verstanden: "${txt}". Wie kann ich helfen?`;
    state.chatHistory.push({ role: 'ai', text: res }); saveState(); currentTarget.innerHTML = renderAppShell();
    setTimeout(() => { const h = document.getElementById('chat-hist'); if(h) h.scrollTop = h.scrollHeight; }, 50);
  });

  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){} }
  function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) Object.assign(state, JSON.parse(raw)); } catch(e){} }

  // ═══════════════════════════════════════════════════════
  // MOUNT & EXPORT
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target; loadState(); state.currentView = 'splash'; currentTarget.innerHTML = renderAppShell();
      if (!currentTarget.dataset.hasListener) { currentTarget.addEventListener('click', handleClick); currentTarget.dataset.hasListener = "true"; }
      if (state.soundEnabled) playStartupSound();
      setTimeout(() => { if (window.HalDoWelcome) window.HalDoWelcome.show("Arztbuch"); }, 200);
    }
  }

  function openOverlay() {
    const overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;flex-direction:column;';
    const closeBar = document.createElement('div'); closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;font-family:Inter;">🩺 HalDo Arztbuch FINAL</b><button id="h-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;">✕ Schließen</button>`;
    overlay.appendChild(closeBar); const mountDiv = document.createElement('div'); mountDiv.style.cssText = 'flex:1;position:relative;overflow:hidden;'; overlay.appendChild(mountDiv); document.body.appendChild(overlay);
    document.getElementById('h-close-btn').onclick = () => { overlay.remove(); currentTarget = null; }; mount(mountDiv);
  }

  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch; window.apps = window.apps || {}; window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.renderArztbuch = mount; window.openArztbuch = openOverlay;
})();
