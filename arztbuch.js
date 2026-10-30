/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v10.0 — MODUL 1: DASHBOARD & GRUNDGERÜST
   Extrem modernes UI · Lebendiger AI-Avatar · Dynamisches Dashboard
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const VERSION = '10.0.0-M1';
  const STORAGE_KEY = 'haldo.arztbuch.v10.m1';

  // ═══════════════════════════════════════════════════════
  // 1. STATE & DATEN
  // ═══════════════════════════════════════════════════════
  let state = {
    lang: 'de',
    currentView: 'splash', 
    appointments: [],
    sickNotes: [],
    // Später kommen hier die echten Vitalwerte rein
    vitals: { bloodPressure: '120/80', bloodSugar: '95', weight: '75' },
    ttsEnabled: true
  };

  let currentTarget = null;

  // Dynamische Tages-Tipps (wechseln je nach Wochentag)
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
        if (parsed.appointments) state.appointments = parsed.appointments;
        if (parsed.sickNotes) state.sickNotes = parsed.sickNotes;
        if (parsed.vitals) state.vitals = parsed.vitals;
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { }
  }

  function getDailyTip() {
    const day = new Date().getDay(); // 0 = Sonntag, 1 = Montag, etc.
    return DAILY_TIPS[day];
  }

  // ═══════════════════════════════════════════════════════
  // 3. CSS (Hochmodernes Design & Animationen)
  // ═══════════════════════════════════════════════════════
  function css() {
    return `<style>
      /* App Container - Fängt alles ab, zerstört nicht das OS */
      .haldo-app {
        font-family: 'Inter', -apple-system, system-ui, sans-serif;
        color: #e8e8ec;
        background: radial-gradient(circle at top right, #0a1220 0%, #050810 100%);
        height: 100%;
        width: 100%;
        display: flex;
        position: absolute;
        top: 0; left: 0;
        overflow: hidden;
      }

      /* Sidebar */
      .h-sidebar {
        width: 260px;
        background: rgba(10, 15, 25, 0.6);
        backdrop-filter: blur(24px);
        border-right: 1px solid rgba(255,255,255,0.05);
        display: flex; flex-direction: column;
        padding: 20px 0;
        z-index: 10;
      }
      .h-logo {
        padding: 0 20px 25px;
        font-size: 22px; font-weight: 900;
        color: #00e5ff;
        display: flex; align-items: center; gap: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 15px;
      }
      .h-nav-item {
        padding: 14px 24px;
        display: flex; align-items: center; gap: 14px;
        color: #8a9bb5; font-weight: 600; font-size: 14px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 3px solid transparent;
      }
      .h-nav-item:hover {
        background: rgba(255,255,255,0.02); color: #fff;
      }
      .h-nav-item.active {
        background: linear-gradient(90deg, rgba(0,229,255,0.1) 0%, transparent 100%);
        color: #00e5ff; border-left-color: #00e5ff;
      }
      .h-nav-item .icon { font-size: 20px; width: 24px; text-align: center; }

      /* Main Content Area */
      .h-main {
        flex: 1; display: flex; flex-direction: column;
        overflow: hidden;
      }
      .h-header {
        padding: 25px 40px;
        display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        background: rgba(10, 15, 25, 0.4); backdrop-filter: blur(10px);
      }
      .h-header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
      .h-header .version { font-size: 12px; color: #00e5ff; background: rgba(0,229,255,0.1); padding: 4px 10px; border-radius: 20px; font-weight: bold; }

      .h-content {
        flex: 1; overflow-y: auto; padding: 40px;
        position: relative;
      }

      /* Scrollbar */
      .h-content::-webkit-scrollbar { width: 8px; }
      .h-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

      /* Module Wrapper */
      .h-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

      /* Glass Cards */
      .h-card {
        background: rgba(20, 25, 35, 0.4);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
      }
      .h-card:hover { transform: translateY(-2px); border-color: rgba(0,229,255,0.2); }

      /* Avatar & Greeting Section */
      .h-dashboard-top {
        display: flex; gap: 30px; align-items: stretch;
      }
      .h-greeting-card {
        flex: 1;
        display: flex; flex-direction: column; justify-content: center;
        background: linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(180,120,255,0.05) 100%);
        border: 1px solid rgba(0,229,255,0.15);
      }
      .h-greeting-card h2 { font-size: 32px; margin: 0 0 10px 0; color: #fff; font-weight: 900; }
      .h-greeting-card p { color: #a8b0cc; margin: 0; font-size: 16px; line-height: 1.5; }

      /* Lebendiger AI Avatar */
      .h-ai-avatar-container {
        width: 200px; height: 200px;
        position: relative;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4);
        border-radius: 50%;
        border: 2px solid rgba(0,229,255,0.3);
        box-shadow: 0 0 40px rgba(0,229,255,0.2);
      }
      .h-ai-core {
        width: 100px; height: 100px;
        background: radial-gradient(circle, #00e5ff 0%, #0044aa 100%);
        border-radius: 50%;
        animation: breathe 3s ease-in-out infinite;
        box-shadow: 0 0 50px #00e5ff;
      }
      @keyframes breathe {
        0%, 100% { transform: scale(1); box-shadow: 0 0 30px #00e5ff; }
        50% { transform: scale(1.15); box-shadow: 0 0 70px #00e5ff; }
      }

      /* Daily Tip */
      .h-daily-tip {
        display: flex; align-items: center; gap: 20px;
        border-left: 4px solid #b478ff;
      }
      .h-daily-tip .tip-icon { font-size: 40px; background: rgba(180,120,255,0.1); padding: 15px; border-radius: 16px; }
      .h-daily-tip h3 { margin: 0 0 5px 0; color: #b478ff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      .h-daily-tip p { margin: 0; font-size: 16px; color: #ddd; line-height: 1.5; }

      /* Grids */
      .h-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .h-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }

      /* Stat Boxes */
      .h-stat-box {
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
        border-radius: 16px; padding: 20px;
        display: flex; flex-direction: column; gap: 10px;
      }
      .h-stat-box .title { font-size: 12px; color: #8a9bb5; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
      .h-stat-box .value { font-size: 28px; font-weight: 900; color: #fff; }
      .h-stat-box .unit { font-size: 14px; color: #00e5ff; }

      /* Quick Actions */
      .h-quick-btn {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; padding: 20px;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
        cursor: pointer; transition: all 0.2s;
      }
      .h-quick-btn:hover { background: rgba(0,229,255,0.1); border-color: #00e5ff; transform: translateY(-3px); }
      .h-quick-btn .icon { font-size: 32px; }
      .h-quick-btn .label { font-size: 14px; font-weight: bold; color: #fff; }

      /* Splash Screen (Willkommensgruß) */
      .h-splash {
        position: absolute; inset: 0; z-index: 999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #001a2a 0%, #050810 100%);
        overflow: hidden;
      }
      .h-splash-logo {
        font-size: 60px; font-weight: 900; color: #fff;
        margin-bottom: 10px; text-shadow: 0 0 30px rgba(0,229,255,0.5);
        animation: slideUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      .h-splash-sub {
        font-size: 20px; color: #00e5ff; font-weight: bold; margin-bottom: 40px;
        opacity: 0; animation: fadeIn 1s 0.5s forwards;
      }
      .h-splash-btn {
        padding: 18px 50px; background: linear-gradient(135deg, #00e5ff 0%, #0088ff 100%);
        color: #000; font-size: 18px; font-weight: 900; border: none; border-radius: 30px;
        cursor: pointer; box-shadow: 0 10px 30px rgba(0,229,255,0.4);
        opacity: 0; animation: slideUpBtn 1s 0.8s forwards;
        transition: transform 0.2s;
      }
      .h-splash-btn:hover { transform: scale(1.05); }

      @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUpBtn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 4. RENDER-FUNKTIONEN
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
      
      <!-- Top Row: Greeting & Avatar -->
      <div class="h-dashboard-top">
        <div class="h-card h-greeting-card">
          <h2>Guten Tag, Halil! 👋</h2>
          <p>Bereit, deine Gesundheit in die Hand zu nehmen? Hier ist deine Übersicht für heute.</p>
        </div>
        
        <div class="h-card" style="padding: 10px; display:flex; justify-content:center; align-items:center;">
          <div class="h-ai-avatar-container">
            <div class="h-ai-core"></div>
          </div>
        </div>
      </div>

      <!-- Daily Tip -->
      <div class="h-card h-daily-tip">
        <div class="tip-icon">${tip.icon}</div>
        <div>
          <h3>Tages-Tipp: ${tip.title}</h3>
          <p>${tip.text}</p>
        </div>
      </div>

      <!-- Health Overview (Vitals) -->
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

      <!-- Smart Quick Actions -->
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

  function renderAppShell() {
    // Wenn wir im Splash sind, zeigen wir nur den Splash
    if (state.currentView === 'splash') {
      return css() + renderSplash();
    }

    // Ansonsten das App-Gerüst mit Sidebar
    return css() + `
      <div class="haldo-app">
        <div class="h-sidebar">
          <div class="h-logo">🩺 HalDo <span style="font-size:10px; color:#b478ff; background:rgba(180,120,255,0.1); padding:2px 6px; border-radius:4px;">M1</span></div>
          <div class="h-nav-item active" data-action="view-dashboard"><span class="icon">📊</span> Dashboard</div>
          <div class="h-nav-item" data-action="view-anatomy"><span class="icon">🧍‍♂️</span> Anatomie 3D</div>
          <div class="h-nav-item" data-action="view-ki-tools"><span class="icon">🤖</span> KI Assistent</div>
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
            <h1>${state.currentView === 'dashboard' ? 'Dashboard' : state.currentView}</h1>
            <div class="version">v${VERSION}</div>
          </div>
          <div class="h-content" id="h-view-container">
            ${state.currentView === 'dashboard' ? renderDashboard() : '<div style="color:#fff; padding:40px; text-align:center;">Dieses Modul wird in Kürze freigeschaltet...</div>'}
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
    if (!btn) return;
    const action = btn.dataset.action;

    // SPLASH BUTTON FIX
    if (action === 'enter-app') {
      state.currentView = 'dashboard';
      if (currentTarget) currentTarget.innerHTML = renderAppShell();
      return;
    }

    // Navigation
    if (action.startsWith('view-')) {
      state.currentView = action.replace('view-', '');
      if (currentTarget) {
        currentTarget.innerHTML = renderAppShell();
        // Update Sidebar Active State
        const navItems = currentTarget.querySelectorAll('.h-nav-item');
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
      }
      return;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 6. MOUNT & EXPORT
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      loadState();
      
      // Startet immer mit dem Splash Screen
      state.currentView = 'splash'; 
      currentTarget.innerHTML = renderAppShell();
      
      // Listener einmalig binden
      currentTarget.addEventListener('click', handleClick);
      
      // Willkommensgruß des OS abfangen (falls vorhanden)
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

  // Registrierung beim OS
  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.renderArztbuch = mount;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — Modul 1: Dashboard & Grundgerüst');
})();
