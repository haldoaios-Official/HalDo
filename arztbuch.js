/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v10.5.0-MASTER
   Alle Module vereint: Dashboard, KI, 3D, Datenbanken, IoT, Settings
   ═══════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  const VERSION = '10.5.0-MASTER';
  const STORAGE_KEY = 'haldo.arztbuch.v10.5';

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
    soundEnabled: true,
    hotspot: { ssid: 'HalDo_Med_Network', pass: '12345678', active: false },
    anatomyMode: 'organs'
  };

  let currentTarget = null;
  let audioCtx = null;
  let threeScene, threeCamera, threeRenderer, threeControls, threeAnimationId;
  let heartMesh, lungLeft, lungRight, brainMesh, skeletonGroup, musclesGroup, organsGroup, skinGroup;

  const SPLASH_THEMES = {
    cyan: { primary: '#00e5ff', secondary: '#0088ff', bg1: '#001a2a', bg2: '#050810', glow: 'rgba(0,229,255,0.5)' },
    purple: { primary: '#b478ff', secondary: '#7a3aff', bg1: '#1a0a2a', bg2: '#080510', glow: 'rgba(180,120,255,0.5)' },
    emerald: { primary: '#4ade80', secondary: '#22c55e', bg1: '#0a2a1a', bg2: '#05100a', glow: 'rgba(74,222,128,0.5)' },
    gold: { primary: '#ffd700', secondary: '#ff9800', bg1: '#1a1a0a', bg2: '#0a0500', glow: 'rgba(255,215,0,0.5)' }
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
    // Erweiterung gemäß Plan:
    { name: 'Schwangerschaft', symp: 'Ausbleiben der Periode, Übelkeit, Müdigkeit', tr: 'Arzt aufsuchen, Folsäure einnehmen, gesunde Ernährung.' },
    { name: 'Geschlechtskrankheiten', symp: 'Ausfluss, Schmerzen beim Wasserlassen, Hautveränderungen', tr: 'Dringend zum Arzt! Antibiotika oder antivirale Therapie.' },
    { name: 'Geschlechtsumwandlung', symp: 'Psychische Belastung durch Geschlechtsdysphorie', tr: 'Psychotherapie, Endokrinologie, ggf. chirurgische Maßnahmen.' }
  ];

  const MEDS = [
    { name: 'Amoxicillin', use: 'Bakterielle Infektionen', dose: '1-0-1 (immer zu Ende nehmen!).', info: 'Verschreibungspflichtig.' },
    { name: 'Aspirin 100mg', use: 'Blutverdünnung', dose: '1x täglich.', info: 'Magenschutz beachten.' },
    { name: 'Metoprolol', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.', info: 'Puls regelmäßig prüfen.' },
    { name: 'Prednisolon', use: 'Entzündungen, Allergien', dose: 'Ausschleichend einnehmen.', info: 'Nicht abrupt absetzen.' },
    { name: 'Ibuprofen', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich nach dem Essen.', info: 'Magenschutz empfohlen.' },
    { name: 'Insulin', use: 'Diabetes', dose: 'Je nach Blutzucker.', info: 'Kühl lagern.' },
    { name: 'L-Thyroxin', use: 'Schilddrüsenunterfunktion', dose: 'Morgens nüchtern.', info: '30 Min. vor dem Frühstück.' },
    { name: 'Metformin', use: 'Diabetes Typ 2', dose: 'Zu den Mahlzeiten.', info: 'Nierenwerte prüfen.' },
    { name: 'Paracetamol', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich.', info: 'Leberschäden bei Überdosis.' },
    { name: 'Voltaren', use: 'Schmerzen, Entzündungen', dose: 'Magensicher einnehmen.', info: 'Nicht auf offene Wunden.' }
  ];

  const LABS = [
    { name: 'Blutzucker', ref: '70-100 mg/dl', desc: 'Nüchternwert. Hoch = Diabetes.' },
    { name: 'Cholesterin', ref: '< 200 mg/dl', desc: 'Gesamtcholesterin.' },
    { name: 'CRP', ref: '< 5 mg/l', desc: 'Entzündungswert.' },
    { name: 'Hämoglobin', ref: '12-17 g/dl', desc: 'Sauerstofftransport.' },
    { name: 'HbA1c', ref: '4,0-5,6 %', desc: 'Langzeitblutzucker.' },
    { name: 'Kalium', ref: '3,5-5,0 mmol/l', desc: 'Wichtig fürs Herz.' },
    { name: 'Kreatinin', ref: '0,6-1,3 mg/dl', desc: 'Nierenwert.' },
    { name: 'Leukozyten', ref: '4.000-10.000', desc: 'Weiße Blutkörperchen.' },
    { name: 'TSH', ref: '0,4-4,0 mU/l', desc: 'Schilddrüse.' }
  ];

  // ═══════════════════════════════════════════════════════
  // 2. LOGIK & SOUND
  // ═══════════════════════════════════════════════════════
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(state, parsed);
      }
    } catch (e) { }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { }
  }

  function speakText(text) {
    if (!state.ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, ''));
    u.lang = state.lang === 'de' ? 'de-DE' : 'en-US';
    u.rate = 1.0;
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
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 3.0);
    } catch (e) { }
  }

  // ═══════════════════════════════════════════════════════
  // 3. CSS (Das komplette Design-System)
  // ═══════════════════════════════════════════════════════
  function css() {
    const theme = SPLASH_THEMES[state.splashTheme];
    return `<style>
      :root {
        --splash-primary: ${theme.primary}; --splash-secondary: ${theme.secondary};
        --splash-bg1: ${theme.bg1}; --splash-bg2: ${theme.bg2}; --splash-glow: ${theme.glow};
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

      /* Generic List Items */
      .h-list-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; }
      .h-list-item:hover { border-color: #00e5ff; background: rgba(0,229,255,0.05); }
      .h-input { width: 100%; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 15px; margin-bottom: 20px; outline: none; }
      .h-input:focus { border-color: #00e5ff; }

      /* KI Chat */
      .h-chat-container { display: flex; flex-direction: column; height: calc(100vh - 200px); background: rgba(20, 25, 35, 0.4); border-radius: 20px; overflow: hidden; }
      .h-chat-history { flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
      .h-msg { display: flex; gap: 15px; max-width: 80%; }
      .h-msg.user { align-self: flex-end; flex-direction: row-reverse; }
      .h-msg.ai { align-self: flex-start; }
      .h-msg-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(0,229,255,0.2); border: 1px solid #00e5ff; }
      .h-msg-bubble { padding: 15px 20px; border-radius: 16px; font-size: 15px; line-height: 1.6; }
      .h-msg.ai .h-msg-bubble { background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-top-left-radius: 4px; }
      .h-msg.user .h-msg-bubble { background: linear-gradient(135deg, #00e5ff, #0088ff); color: #000; border-top-right-radius: 4px; }
      .h-chat-input-area { padding: 20px 30px; background: rgba(10, 15, 25, 0.8); display: flex; gap: 15px; }
      .h-chat-input { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; color: #fff; font-size: 15px; outline: none; }
      .h-chat-send { background: linear-gradient(135deg, #00e5ff, #0088ff); border: none; border-radius: 12px; width: 50px; height: 50px; cursor: pointer; font-size: 20px; color: #000; }

      /* 3D Anatomie */
      .h-anatomy-container { width: 100%; height: calc(100vh - 250px); background: radial-gradient(circle at center, #111a2a 0%, #050810 100%); border-radius: 20px; overflow: hidden; position: relative; border: 1px solid rgba(0,229,255,0.2); }
      .h-anatomy-controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 12px; backdrop-filter: blur(10px); }
      .h-anatomy-btn { padding: 8px 16px; background: transparent; border: 1px solid #555; color: #aaa; border-radius: 8px; cursor: pointer; font-weight: bold; }
      .h-anatomy-btn.active { background: rgba(0,229,255,0.2); border-color: #00e5ff; color: #00e5ff; }

      /* Splash */
      .h-splash { position: absolute; inset: 0; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, var(--splash-bg1) 0%, var(--splash-bg2) 100%); overflow: hidden; }
      .h-splash-logo-wrapper { margin-bottom: 20px; animation: floatLogo 4s ease-in-out infinite; }
      .h-splash-logo-img { width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 0 30px var(--splash-primary)); }
      @keyframes floatLogo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
      .h-splash-text-top { font-size: 20px; font-weight: 600; color: #ddd; margin-bottom: 5px; letter-spacing: 2px; text-transform: uppercase; }
      .h-splash-title { font-size: 52px; font-weight: 900; color: #ffd700; margin-bottom: 15px; text-align: center; text-shadow: 0 0 10px #ffd700, 0 0 20px #ff9800, 0 0 40px #ff6f00; animation: pulseGold 3s infinite alternate; }
      @keyframes pulseGold { 0% { text-shadow: 0 0 10px #ffd700, 0 0 20px #ff9800; } 100% { text-shadow: 0 0 15px #ffd700, 0 0 30px #ff9800, 0 0 50px #ff6f00; } }
      .h-splash-author { font-size: 18px; font-weight: 500; color: #e8e8ec; margin-bottom: 40px; font-style: italic; }
      .h-splash-subtitle { position: absolute; bottom: 100px; font-size: 12px; font-weight: 800; color: #ffd700; letter-spacing: 4px; text-transform: uppercase; opacity: 0.8; }
      .h-splash-btn { padding: 18px 60px; background: linear-gradient(135deg, var(--splash-primary) 0%, var(--splash-secondary) 100%); color: #000; font-size: 18px; font-weight: 900; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 10px 30px var(--splash-glow); }
      .h-color-bands { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; background: rgba(0,0,0,0.4); padding: 10px 20px; border-radius: 30px; align-items: center; }
      .h-color-band { width: 25px; height: 25px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
      .h-color-band.active { border-color: #fff; transform: scale(1.1); }
      .band-cyan { background: #00e5ff; } .band-purple { background: #b478ff; } .band-emerald { background: #4ade80; } .band-gold { background: #ffd700; }
      .h-sound-toggle { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 10px; }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 4. RENDER FUNKTIONEN
  // ═══════════════════════════════════════════════════════
  function renderSplash() {
    return `
      <div class="h-splash">
        <div class="h-splash-logo-wrapper">
          <img src="logo.png" class="h-splash-logo-img" onerror="this.style.display='none';">
        </div>
        <div class="h-splash-text-top">Willkommen bei</div>
        <div class="h-splash-title">HalDo Arztbuch App</div>
        <div class="h-splash-author">von Halil Donma</div>
        <div class="h-splash-subtitle">Professionale App</div>
        <button class="h-splash-btn" data-action="enter-app">Los geht's →</button>
        <div class="h-color-bands">
          ${Object.keys(SPLASH_THEMES).map(key => `
            <div class="h-color-band band-${key} ${state.splashTheme === key ? 'active' : ''}" data-theme="${key}"></div>
          `).join('')}
          <div class="h-sound-toggle" data-action="toggle-sound">${state.soundEnabled ? '🔊' : '🔇'}</div>
        </div>
      </div>
    `;
  }

  function renderDashboard() {
    const tip = DAILY_TIPS[new Date().getDay()];
    return `<div class="h-inner">
      <div class="h-dashboard-top">
        <div class="h-card h-greeting-card">
          <h2>Guten Tag, Halil! 👋</h2>
          <p>Bereit, deine Gesundheit in die Hand zu nehmen? Hier ist deine Übersicht für heute.</p>
        </div>
        <div class="h-card" style="padding: 10px;">
          <div class="h-ai-avatar-container" data-action="view-ki"><div class="h-ai-core"></div></div>
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
        <div class="h-stat-box"><div class="title">Termine</div><div class="value">${state.appointments.length} <span class="unit">Anstehend</span></div></div>
      </div>
      <div>
        <h3 style="color:#fff; margin: 10px 0 15px 0;">Schnellzugriff</h3>
        <div class="h-grid-4">
          <div class="h-quick-btn" data-action="view-emergency" style="border-color:#ff5555;"><div class="icon">🚨</div><div class="label" style="color:#ff5555;">Notfall</div></div>
          <div class="h-quick-btn" data-action="view-ki"><div class="icon">🤖</div><div class="label">KI Check</div></div>
          <div class="h-quick-btn" data-action="view-meds"><div class="icon">💊</div><div class="label">Medikamente</div></div>
          <div class="h-quick-btn" data-action="view-anatomy"><div class="icon">🧍‍♂️</div><div class="label">Anatomie 3D</div></div>
        </div>
      </div>
    </div>`;
  }

  function renderKITools() {
    let chatHtml = state.chatHistory.length === 0 ? `<div class="h-msg ai"><div class="h-msg-avatar">🤖</div><div class="h-msg-bubble">Hallo! Ich bin dein HalDo KI-Assistent. Was kann ich für dich tun?</div></div>` 
    : state.chatHistory.map(m => m.role === 'user' ? `<div class="h-msg user"><div class="h-msg-bubble">${m.text}</div></div>` : `<div class="h-msg ai"><div class="h-msg-avatar">🤖</div><div class="h-msg-bubble">${m.text}</div></div>`).join('');

    return `<div class="h-inner"><div class="h-chat-container"><div class="h-chat-history" id="chat-hist">${chatHtml}</div>
      <div class="h-chat-input-area">
        <input type="text" class="h-chat-input" id="chat-in" placeholder="Stelle deine Frage..." onkeypress="if(event.key === 'Enter') document.dispatchEvent(new CustomEvent('send-chat'))">
        <button class="h-chat-send" onclick="document.dispatchEvent(new CustomEvent('send-chat'))">➤</button>
      </div>
    </div></div>`;
  }

  function renderAnatomy() {
    return `<div class="h-inner"><div class="h-card" style="padding: 15px;">
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
    return `<div class="h-inner"><div class="h-card">
      <h2>${title}</h2>
      <input type="text" class="h-input" placeholder="Suchen..." data-search="${type}">
      <div id="list-container">
        ${data.map(item => `
          <div class="h-list-item" data-info="${item.symp || item.use || item.desc}" data-title="${item.name}">
            <div><b>${item.name}</b><br><span style="font-size:12px;color:#8a9bb5">${item.symp || item.use || item.ref}</span></div>
          </div>
        `).join('')}
      </div>
    </div></div>`;
  }

  function renderDevices() {
    return `<div class="h-inner">
      <div class="h-card" style="border-color:#ffd700;">
        <h2>📶 Hotspot Manager</h2>
        <div style="margin-top:15px; display:flex; flex-direction:column; gap:15px;">
          <div style="display:flex; justify-content:space-between;">
            <b>Status:</b> <span style="color:${state.hotspot.active ? '#00ff88' : '#ff5555'}">${state.hotspot.active ? 'Aktiv' : 'Inaktiv'}</span>
          </div>
          <div><b>SSID:</b> ${state.hotspot.ssid}</div>
          <div><b>Passwort:</b> <input type="text" id="hotspot-pass" value="${state.hotspot.pass}" style="background:transparent; border:1px solid #444; color:#fff; padding:5px; border-radius:5px;"></div>
          <div style="display:flex; gap:10px;">
            <button class="h-btn primary" data-action="save-hotspot" style="padding:10px; border:none; border-radius:8px; background:#00e5ff; font-weight:bold; cursor:pointer;">Passwort speichern</button>
            <button class="h-btn" data-action="toggle-hotspot" style="padding:10px; border:1px solid #00e5ff; color:#00e5ff; border-radius:8px; background:transparent; font-weight:bold; cursor:pointer;">Ein/Aus</button>
          </div>
        </div>
      </div>
      <div class="h-card">
        <h2>📡 Verbundene Geräte</h2>
        <p>Blutdruck, Blutzucker, Waage, Smartwatch (Simulation)</p>
      </div>
    </div>`;
  }

  function renderEmergency() {
    return `<div class="h-inner" style="text-align:center;">
      <div class="h-card" style="background:rgba(255,0,0,0.1); border-color:#ff3333;">
        <h2 style="color:#ff3333; font-size:32px;">🚨 NOTFALL</h2>
        <p style="margin-bottom:20px;">Wähle den Notruf oder lies die Erste-Hilfe-Anleitung.</p>
        <button onclick="window.location.href='tel:112'" style="background:#ff3333; color:#fff; border:none; padding:20px 40px; font-size:24px; font-weight:900; border-radius:50px; cursor:pointer; box-shadow:0 0 30px rgba(255,0,0,0.5);">📞 112 Anrufen</button>
        <div style="text-align:left; margin-top:30px; background:rgba(0,0,0,0.3); padding:20px; border-radius:12px;">
          <h3>Herzdruckmassage</h3>
          <p style="color:#ccc;">100-120x pro Minute, 5-6 cm tief drücken. <br>Timer: <span id="cpr-timer">0</span> Sekunden</p>
          <button onclick="document.getElementById('cpr-timer').innerText=0; let i=setInterval(()=>document.getElementById('cpr-timer').innerText++, 1000); setTimeout(()=>clearInterval(i), 30000)" style="background:#00e5ff; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">Timer starten</button>
        </div>
      </div>
    </div>`;
  }

  function renderSettings() {
    return `<div class="h-inner"><div class="h-card">
      <h2>⚙️ Einstellungen</h2>
      <div style="margin-top:20px;">
        <label>Sprache</label>
        <select class="h-input" data-action="set-lang">
          <option value="de" ${state.lang==='de'?'selected':''}>Deutsch</option>
          <option value="en" ${state.lang==='en'?'selected':''}>English</option>
          <option value="tr" ${state.lang==='tr'?'selected':''}>Türkçe</option>
          <option value="ku" ${state.lang==='ku'?'selected':''}>Kurdisch</option>
        </select>
      </div>
      <div style="margin-top:20px;">
        <label>System</label>
        <button class="h-btn" style="padding:15px; width:100%; border:1px solid #ff5555; background:transparent; color:#ff5555; border-radius:12px; cursor:pointer; margin-top:10px;" onclick="localStorage.clear(); location.reload();">Daten zurücksetzen (App neu starten)</button>
      </div>
    </div></div>`;
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
      case 'emergency': content = renderEmergency(); break;
      case 'settings': content = renderSettings(); break;
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
          <div style="flex:1;"></div>
          <div class="h-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> Einstellungen</div>
          <div class="h-nav-item ${state.currentView === 'emergency' ? 'active' : ''}" data-action="view-emergency" style="color:#ff5555;"><span class="icon">🚨</span> Notfall</div>
        </div>
        <div class="h-main">
          <div class="h-header">
            <h1>${state.currentView.toUpperCase()}</h1>
            <div style="font-size:12px; color:#00e5ff;">v${VERSION}</div>
          </div>
          <div class="h-content" id="h-view">${content}</div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 5. 3D LOGIK (Der echte Anatomie-Baukasten)
  // ═══════════════════════════════════════════════════════
  function init3DAnatomy() {
    const container = document.getElementById('anatomy-3d-container');
    if (!container) return;

    if (threeRenderer) { threeRenderer.dispose(); }
    if (threeAnimationId) { cancelAnimationFrame(threeAnimationId); }

    const w = container.clientWidth;
    const h = container.clientHeight;

    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    threeCamera.position.set(0, 0.5, 5);

    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(w, h);
    container.appendChild(threeRenderer.domElement);

    threeControls = new OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.autoRotate = true;

    threeScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(2, 3, 2); threeScene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.6);
    rimLight.position.set(-2, -1, -2); threeScene.add(rimLight);

    buildAnatomyModel(threeScene);
    updateAnatomyVisibility(state.anatomyMode);

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
    if (skinGroup.visible && mode !== 'skin') skinGroup.children.forEach(c => { if(c.material) c.material.opacity = 0.1; });
    else if (skinGroup.visible) skinGroup.children.forEach(c => { if(c.material) c.material.opacity = 0.8; });
  }

  function buildAnatomyModel(scene) {
    skinGroup = new THREE.Group(); musclesGroup = new THREE.Group(); skeletonGroup = new THREE.Group(); organsGroup = new THREE.Group();
    scene.add(skinGroup, musclesGroup, skeletonGroup, organsGroup);

    const skinMat = new THREE.MeshPhysicalMaterial({ color: 0x66ccff, transparent: true, opacity: 0.15, roughness: 0.2, transmission: 0.5, side: THREE.DoubleSide });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), skinMat); head.position.y = 1.8; skinGroup.add(head);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 16, 32), skinMat); torso.position.y = 0.8; skinGroup.add(torso);
    [-1, 1].forEach(side => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.8, 8, 16), skinMat); arm.position.set(side * 0.5, 0.8, 0); arm.rotation.z = side * Math.PI / 8; skinGroup.add(arm);
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.9, 8, 16), skinMat); leg.position.set(side * 0.18, -0.5, 0); skinGroup.add(leg);
    });

    const boneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), boneMat); skull.position.y = 1.85; skeletonGroup.add(skull);
    for(let i=0; i<15; i++) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), boneMat); v.position.set(0, 1.5 - i*0.1, -0.15); skeletonGroup.add(v); }
    for(let i=0; i<6; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i*0.02, 0.02, 8, 32, Math.PI), boneMat); rib.position.set(0, 1.3 - i*0.1, -0.05); rib.rotation.x = Math.PI/2; rib.rotation.y = Math.PI/2; skeletonGroup.add(rib); }

    const muscleMat = new THREE.MeshStandardMaterial({ color: 0xaa3333, roughness: 0.6 });
    const muscleTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.6, 16, 32), muscleMat); muscleTorso.position.y = 0.9; musclesGroup.add(muscleTorso);

    function addOrgan(mesh, name, desc, icon) { mesh.userData = { name, desc, icon }; organsGroup.add(mesh); }
    brainMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffb3c8 })); brainMesh.position.y = 1.9; addOrgan(brainMesh, 'Gehirn', 'Zentrale des Nervensystems.', '🧠');
    heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), new THREE.MeshStandardMaterial({ color: 0xdd0000, roughness: 0.3 })); heartMesh.scale.set(1, 1.2, 0.9); heartMesh.position.set(-0.05, 1.0, 0.15); addOrgan(heartMesh, 'Herz', 'Muskelpumpe für den Blutkreislauf.', '🫀');
    const lungMat = new THREE.MeshStandardMaterial({ color: 0xff8888, transparent: true, opacity: 0.9 });
    lungLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.4, 8, 16), lungMat); lungLeft.position.set(-0.15, 1.2, 0.05); addOrgan(lungLeft, 'Lunge (links)', 'Atmungsorgan.', '🫁');
    lungRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.4, 8, 16), lungMat); lungRight.position.set(0.15, 1.2, 0.05); addOrgan(lungRight, 'Lunge (rechts)', 'Atmungsorgan.', '🫁');
    const liver = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), new THREE.MeshStandardMaterial({ color: 0x8b3a1a })); liver.scale.set(1.5, 0.6, 0.9); liver.position.set(0.15, 0.75, 0.1); addOrgan(liver, 'Leber', 'Entgiftung und Galle.', '🟤');
  }

  // ═══════════════════════════════════════════════════════
  // 6. EVENT HANDLERS
  // ═══════════════════════════════════════════════════════
  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    const themeBtn = e.target.closest('[data-theme]');
    const anatBtn = e.target.closest('[data-anatomy-mode]');
    const infoItem = e.target.closest('[data-title]');

    if (themeBtn) { state.splashTheme = themeBtn.dataset.theme; saveState(); currentTarget.innerHTML = renderAppShell(); return; }
    if (anatBtn) { state.anatomyMode = anatBtn.dataset.anatomyMode; document.querySelectorAll('.h-anatomy-btn').forEach(b => b.classList.remove('active')); anatBtn.classList.add('active'); updateAnatomyVisibility(state.anatomyMode); return; }
    
    if (infoItem) {
      alert(`${infoItem.dataset.title}\n\n${infoItem.dataset.info}`);
      speakText(infoItem.dataset.title + '. ' + infoItem.dataset.info);
      return;
    }

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

  document.addEventListener('send-chat', () => {
    const input = document.getElementById('chat-in');
    if (!input || !input.value.trim()) return;
    const txt = input.value.trim();
    state.chatHistory.push({ role: 'user', text: txt });
    let res = txt.toLowerCase().includes('kopf') ? "Bei Kopfschmerzen: Ruhe, Wasser und frische Luft." : `Ich habe verstanden: "${txt}". Wie kann ich helfen?`;
    state.chatHistory.push({ role: 'ai', text: res });
    saveState();
    currentTarget.innerHTML = renderAppShell();
    setTimeout(() => { const h = document.getElementById('chat-hist'); if(h) h.scrollTop = h.scrollHeight; }, 50);
  });

  // ═══════════════════════════════════════════════════════
  // 7. MOUNT & EXPORT
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      loadState();
      state.currentView = 'splash'; 
      currentTarget.innerHTML = renderAppShell();
      if (!currentTarget.dataset.hasListener) {
        currentTarget.addEventListener('click', handleClick);
        currentTarget.dataset.hasListener = "true";
      }
      if (state.soundEnabled) playStartupSound();
      setTimeout(() => { if (window.HalDoWelcome) window.HalDoWelcome.show("Arztbuch"); }, 200);
    }
  }

  function openOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;flex-direction:column;';
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;font-family:Inter;">🩺 HalDo Arztbuch MASTER</b><button id="h-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;">✕ Schließen</button>`;
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
})();
