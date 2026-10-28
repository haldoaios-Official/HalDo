/* HalDo Fahrschule v300.1 — Theorie-Training PROFESSIONAL (Global API Fix) */
(function () {
  'use strict';

  const VERSION = '300.1';
  const STORAGE_KEY = 'haldo.fahrschule.stats';

  // ═══════════════════════════════════════════════════════
  // 1. DATENBANK (Fragen, Schilder, Kategorien)
  // ═══════════════════════════════════════════════════════
  const QUESTIONS = [
    { id: 1, cat: 'Gefahrenlehre', q: 'Sie nähern sich einer unübersichtlichen Kurve. Wie verhalten Sie sich?', opts: ['Geschwindigkeit stark reduzieren, bremsbereit sein', 'Hupen und weiterfahren', 'Auf die Gegenfahrbahn ausweichen'], correct: 0, exp: 'In unübersichtlichen Kurven muss die Geschwindigkeit reduziert und bremsbereit gefahren werden, um auf plötzliche Hindernisse reagieren zu können.' },
    { id: 2, cat: 'Vorfahrt', q: 'Wer hat an einer Kreuzung ohne Verkehrszeichen Vorfahrt?', opts: ['Das Fahrzeug von links', 'Das Fahrzeug von rechts', 'Wer zuerst ankommt'], correct: 1, exp: 'Die Grundregel lautet: Rechts vor Links. Das Fahrzeug von rechts hat Vorfahrt.' },
    { id: 3, cat: 'Technik', q: 'Was ist bei einer Reifenpanne zu tun?', opts: ['Warnblinker an, Warndreieck aufstellen, Reifen wechseln', 'Sofort auf die Autobahn wechseln', 'Weiterfahren bis zur nächsten Werkstatt'], correct: 0, exp: 'Zuerst das Fahrzeug sichern (Warnblinker, Warndreieck), dann den Reifen wechseln.' },
    { id: 4, cat: 'Verkehrszeichen', q: 'Was bedeutet ein rotes Dreieck mit einem Ausrufezeichen?', opts: ['Allgemeine Gefahr', 'Halt, Vorfahrt gewähren', 'Vorfahrtstraße'], correct: 0, exp: 'Das Zeichen warnt vor einer allgemeinen Gefahr. Die Geschwindigkeit sollte reduziert werden.' },
    { id: 5, cat: 'Umweltschutz', q: 'Wie fahren Sie umweltbewusst?', opts: ['Früh hochschalten und niedrige Drehzahlen nutzen', 'Im ersten Gang bis 50 km/h fahren', 'Ständig beschleunigen und bremsen'], correct: 0, exp: 'Frühes Hochschalten und niedrige Drehzahlen sparen Kraftstoff und reduzieren den Schadstoffausstoß.' },
    { id: 6, cat: 'Gefahrenlehre', q: 'Was ist bei Nässe besonders gefährlich?', opts: ['Aquaplaning', 'Bremsen quietschen', 'Der Motor wird heiß'], correct: 0, exp: 'Aquaplaning führt zum Verlust der Bodenhaftung. Geschwindigkeit reduzieren!' },
    { id: 7, cat: 'Vorfahrt', q: 'Sie wollen links abbiegen. Worauf müssen Sie achten?', opts: ['Gegenverkehr durchlassen', 'Sofort abbiegen', 'Rechts blinken'], correct: 0, exp: 'Beim Linksabbiegen muss der Gegenverkehr durchgelassen werden.' },
    { id: 8, cat: 'Technik', q: 'Die Bremsleuchten leuchten dauerhaft. Was tun?', opts: ['Bremslichtschalter überprüfen lassen', 'Weiterfahren', 'Batterie abklemmen'], correct: 0, exp: 'Ein defekter Bremslichtschalter kann die Batterie entladen und ist ein Sicherheitsrisiko.' },
    { id: 9, cat: 'Verkehrszeichen', q: 'Ein blaues Schild mit weißem Pfeil nach rechts bedeutet?', opts: ['Vorgeschriebene Fahrtrichtung rechts', 'Einbahnstraße', 'Vorfahrtstraße'], correct: 0, exp: 'Dieses Schild schreibt die Fahrtrichtung vor.' },
    { id: 10, cat: 'Gefahrenlehre', q: 'Sie fahren bei Nebel. Welches Licht ist Pflicht?', opts: ['Abblendlicht', 'Fernlicht', 'Standlicht'], correct: 0, exp: 'Bei Nebel ist Abblendlicht Pflicht. Fernlicht wird vom Nebel reflektiert und blendet.' },
    { id: 11, cat: 'Vorfahrt', q: 'Was bedeutet "Vorfahrt gewähren"?', opts: ['Anhalten und warten', 'Geschwindigkeit anpassen, ggf. warten', 'Einfach durchfahren'], correct: 1, exp: 'Man muss nicht zwingend anhalten, aber die Geschwindigkeit anpassen und bei Bedarf warten.' },
    { id: 12, cat: 'Technik', q: 'Wie tief sollte das Profil der Reifen mindestens sein?', opts: ['1,6 mm', '0,5 mm', '5 mm'], correct: 0, exp: 'Die gesetzliche Mindestprofiltiefe beträgt 1,6 mm. Empfohlen sind jedoch mehr.' },
    { id: 13, cat: 'Verkehrszeichen', q: 'Was bedeutet ein auf dem Kopf stehendes Dreieck?', opts: ['Vorfahrt gewähren', 'Stop', 'Wildwechsel'], correct: 0, exp: 'Das auf dem Kopf stehende Dreieck (Spitze unten) bedeutet "Vorfahrt gewähren".' },
    { id: 14, cat: 'Gefahrenlehre', q: 'Wie reagieren Sie bei einem Wildwechsel?', opts: ['Abbremsen und hupen', 'Ausweichen', 'Gas geben'], correct: 0, exp: 'Abbremsen und Hupen. Ausweichen kann zu schweren Unfällen führen.' },
    { id: 15, cat: 'Vorfahrt', q: 'Sie fahren auf einer Vorfahrtstraße. Ein Auto kommt von rechts.', opts: ['Ich habe Vorfahrt', 'Ich muss warten', 'Rechts vor Links gilt'], correct: 0, exp: 'Wer auf einer Vorfahrtstraße fährt, hat Vorfahrt.' }
  ];

  const SIGNS = [
    { icon: '🛑', name: 'Stop', desc: 'Anhalten, Vorfahrt gewähren.' },
    { icon: '⚠️', name: 'Gefahrenstelle', desc: 'Allgemeine Gefahr, Geschwindigkeit anpassen.' },
    { icon: '⬇️', name: 'Vorfahrt gewähren', desc: 'Spitze unten. Andere Fahrzeuge durchlassen.' },
    { icon: '⬆️', name: 'Vorfahrtstraße', desc: 'Gelbe Raute. Ich habe Vorfahrt.' },
    { icon: '🚫', name: 'Verbot der Einfahrt', desc: 'Rotes Schild mit weißem Strich. Einfahrt verboten.' },
    { icon: '➡️', name: 'Vorgeschriebene Richtung', desc: 'Blaues Schild mit Pfeil. Man muss rechts abbiegen.' },
    { icon: '🚶', name: 'Fußgängerüberweg', desc: 'Blaues Schild. Fußgänger haben Vorrang.' },
    { icon: '🚲', name: 'Radweg', desc: 'Blaues Schild mit Fahrrad. Nur für Radfahrer.' }
  ];

  const CATS = ['Gefahrenlehre', 'Vorfahrt', 'Technik', 'Verkehrszeichen', 'Umweltschutz'];

  // ═══════════════════════════════════════════════════════
  // 2. STATE & STORAGE
  // ═══════════════════════════════════════════════════════
  let stats = { examsTaken: 0, examsPassed: 0, questionsAnswered: 0, correctAnswers: 0 };
  let currentView = 'home';
  let currentLearnIndex = 0;
  let examState = null;
  let examTimer = null;

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stats = JSON.parse(raw);
    } catch (e) { }
  }

  function saveStats() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch (e) { }
  }

  // ═══════════════════════════════════════════════════════
  // 3. CSS STYLING
  // ═══════════════════════════════════════════════════════
  function css() {
    return `<style>
      .fs-app { font-family: Inter, system-ui, sans-serif; color: #e8e8ec; background: #0a0a0f; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
      .fs-header { padding: 15px 20px; background: #111118; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
      .fs-header h1 { margin: 0; font-size: 18px; color: #00e5ff; display: flex; gap: 10px; align-items: center; }
      .fs-nav { display: flex; gap: 8px; }
      .fs-btn { background: #1a1a24; border: 1px solid #2a2a36; color: #ccc; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 6px; font-size: 13px; }
      .fs-btn:hover { background: #252535; color: #fff; }
      .fs-btn.active { background: #00e5ff; color: #000; border-color: #00e5ff; box-shadow: 0 0 15px rgba(0,229,255,0.4); }
      .fs-btn.primary { background: linear-gradient(135deg, #00e5ff, #b478ff); color: #000; border: none; }
      .fs-content { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; }
      
      .fs-card { background: #14141c; border: 1px solid #222; border-radius: 12px; padding: 20px; margin-bottom: 15px; }
      .fs-card h2 { margin-top: 0; font-size: 16px; color: #fff; margin-bottom: 15px; }
      
      .fs-opt { display: block; width: 100%; text-align: left; padding: 12px 16px; background: #1a1a24; border: 1px solid #2a2a36; border-radius: 8px; color: #ddd; margin-bottom: 10px; cursor: pointer; font-family: inherit; font-size: 14px; transition: all 0.2s; }
      .fs-opt:hover { background: #252535; border-color: #00e5ff; }
      .fs-opt.correct { background: rgba(0,255,102,0.1); border-color: #00ff66; color: #00ff66; }
      .fs-opt.wrong { background: rgba(255,0,0,0.1); border-color: #ff3333; color: #ff3333; }
      
      .fs-exp { background: #1a1a24; border-left: 4px solid #00e5ff; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 15px; font-size: 13px; line-height: 1.6; color: #a8b0cc; display: none; }
      
      .fs-signs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
      .fs-sign-item { background: #1a1a24; border: 1px solid #2a2a36; border-radius: 10px; padding: 15px; text-align: center; transition: transform 0.2s; }
      .fs-sign-item:hover { transform: translateY(-2px); border-color: #00e5ff; }
      .fs-sign-icon { font-size: 40px; margin-bottom: 10px; }
      .fs-sign-name { font-weight: bold; color: #fff; font-size: 13px; margin-bottom: 4px; }
      .fs-sign-desc { font-size: 11px; color: #888; }
      
      .fs-stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; font-size: 14px; }
      .fs-stat-row:last-child { border-bottom: none; }
      .fs-stat-val { font-weight: bold; color: #00e5ff; }
      
      .fs-timer { font-size: 24px; font-weight: 900; color: #ffaa00; background: rgba(255,170,0,0.1); padding: 5px 15px; border-radius: 8px; border: 1px solid rgba(255,170,0,0.3); }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 4. RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════
  function renderHome() {
    const pct = stats.examsTaken > 0 ? Math.round((stats.examsPassed / stats.examsTaken) * 100) : 0;
    return `
      <div class="fs-card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 60px; margin-bottom: 15px;">🚦</div>
        <h2 style="font-size: 24px; margin-bottom: 10px;">HalDo Fahrschule</h2>
        <p style="color: #888; margin-bottom: 25px;">Bereit für die Theorie-Prüfung? Trainiere jetzt!</p>
        <button class="fs-btn primary" data-action="start-exam" style="padding: 12px 30px; font-size: 16px; margin: 0 auto;">🏁 Prüfung starten</button>
      </div>
      <div class="fs-card">
        <h2>📊 Dein Fortschritt</h2>
        <div class="fs-stat-row"><span>Prüfungen absolviert</span><span class="fs-stat-val">${stats.examsTaken}</span></div>
        <div class="fs-stat-row"><span>Prüfungen bestanden</span><span class="fs-stat-val" style="color:#00ff66;">${stats.examsPassed}</span></div>
        <div class="fs-stat-row"><span>Fragen beantwortet</span><span class="fs-stat-val">${stats.questionsAnswered}</span></div>
        <div class="fs-stat-row"><span>Erfolgsquote</span><span class="fs-stat-val">${pct}%</span></div>
      </div>
    `;
  }

  function renderLearn() {
    const q = QUESTIONS[currentLearnIndex];
    let optHtml = '';
    q.opts.forEach((opt, i) => {
      optHtml += `<button class="fs-opt" data-action="learn-answer" data-idx="${i}">${opt}</button>`;
    });
    
    return `
      <div class="fs-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <span style="font-size:12px; font-weight:bold; color:#00e5ff; background:rgba(0,229,255,0.1); padding:4px 8px; border-radius:4px;">${q.cat}</span>
          <span style="font-size:12px; color:#888;">Frage ${currentLearnIndex + 1} von ${QUESTIONS.length}</span>
        </div>
        <h2 style="font-size: 18px; line-height: 1.5;">${q.q}</h2>
        <div style="margin-top: 20px;" id="fs-opt-container">${optHtml}</div>
        <div class="fs-exp" id="fs-explain">${q.exp}</div>
        <div style="margin-top:20px; display:flex; gap:10px;">
          <button class="fs-btn" data-action="learn-prev" ${currentLearnIndex === 0 ? 'disabled style="opacity:0.5"' : ''}>⬅️ Zurück</button>
          <button class="fs-btn" data-action="learn-next" ${currentLearnIndex === QUESTIONS.length - 1 ? 'disabled style="opacity:0.5"' : ''}>Weiter ➡️</button>
        </div>
      </div>
    `;
  }

  function renderSigns() {
    let html = '<div class="fs-card"><h2>🛑 Verkehrszeichen</h2><div class="fs-signs-grid">';
    SIGNS.forEach(s => {
      html += `<div class="fs-sign-item"><div class="fs-sign-icon">${s.icon}</div><div class="fs-sign-name">${s.name}</div><div class="fs-sign-desc">${s.desc}</div></div>`;
    });
    html += '</div></div>';
    return html;
  }

  function renderExam() {
    if (!examState) return '';
    if (examState.finished) {
      const passed = examState.correct >= 10;
      return `
        <div class="fs-card" style="text-align:center; padding:40px;">
          <div style="font-size:60px; margin-bottom:15px;">${passed ? '🎉' : '😢'}</div>
          <h2 style="font-size:24px; color:${passed ? '#00ff66' : '#ff3333'};">${passed ? 'BESTANDEN!' : 'DURCHGEFALLEN'}</h2>
          <p style="color:#888; font-size:16px; margin:15px 0;">Du hast ${examState.correct} von ${examState.total} Fragen richtig beantwortet.</p>
          <button class="fs-btn primary" data-action="exam-back" style="padding:12px 30px; font-size:16px; margin-top:20px;">Zurück zum Menü</button>
        </div>
      `;
    }
    
    const q = examState.questions[examState.current];
    let optHtml = '';
    q.opts.forEach((opt, i) => {
      optHtml += `<button class="fs-opt" data-action="exam-answer" data-idx="${i}">${opt}</button>`;
    });
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <span style="font-weight:bold; color:#fff;">Frage ${examState.current + 1} / ${examState.total}</span>
        <div class="fs-timer" id="fs-exam-timer">${Math.floor(examState.timeLeft / 60)}:${(examState.timeLeft % 60).toString().padStart(2, '0')}</div>
      </div>
      <div class="fs-card">
        <h2 style="font-size: 18px; line-height: 1.5; margin-bottom: 20px;">${q.q}</h2>
        <div id="fs-exam-opts">${optHtml}</div>
      </div>
    `;
  }

  function renderStats() {
    const accuracy = stats.questionsAnswered > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;
    const passRate = stats.examsTaken > 0 ? Math.round((stats.examsPassed / stats.examsTaken) * 100) : 0;
    
    return `
      <div class="fs-card">
        <h2>📈 Detaillierte Statistiken</h2>
        <div class="fs-stat-row"><span>Fragen richtig beantwortet</span><span class="fs-stat-val">${stats.correctAnswers}</span></div>
        <div class="fs-stat-row"><span>Fragen falsch beantwortet</span><span class="fs-stat-val" style="color:#ff3333;">${stats.questionsAnswered - stats.correctAnswers}</span></div>
        <div class="fs-stat-row"><span>Trefferquote (Fragen)</span><span class="fs-stat-val">${accuracy}%</span></div>
        <div class="fs-stat-row"><span>Prüfungs-Bestehensquote</span><span class="fs-stat-val">${passRate}%</span></div>
      </div>
      <div class="fs-card" style="text-align:center;">
        <button class="fs-btn" data-action="reset-stats" style="color:#ff3333; border-color:#ff3333;">🗑️ Statistiken zurücksetzen</button>
      </div>
    `;
  }

  function renderMain() {
    let viewHtml = '';
    if (currentView === 'home') viewHtml = renderHome();
    else if (currentView === 'learn') viewHtml = renderLearn();
    else if (currentView === 'signs') viewHtml = renderSigns();
    else if (currentView === 'exam') viewHtml = renderExam();
    else if (currentView === 'stats') viewHtml = renderStats();

    let examBtn = currentView === 'exam' ? `<button class="fs-btn active" data-view="exam">🏁 Prüfung</button>` : `<button class="fs-btn" data-action="start-exam">🏁 Prüfung</button>`;

    return css() + `
      <div class="fs-app">
        <div class="fs-header">
          <h1>🚦 HalDo Fahrschule <span style="font-size:10px; color:#666; margin-left:5px;">v${VERSION}</span></h1>
          <div class="fs-nav">
            <button class="fs-btn ${currentView === 'home' ? 'active' : ''}" data-view="home">🏠 Start</button>
            <button class="fs-btn ${currentView === 'learn' ? 'active' : ''}" data-view="learn">📖 Lernen</button>
            <button class="fs-btn ${currentView === 'signs' ? 'active' : ''}" data-view="signs">🛑 Schilder</button>
            <button class="fs-btn ${currentView === 'stats' ? 'active' : ''}" data-view="stats">📊 Statistik</button>
            ${examBtn}
          </div>
        </div>
        <div class="fs-content" id="fs-main-content">
          ${viewHtml}
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 5. LOGIC & INTERACTION
  // ═══════════════════════════════════════════════════════
  function startExam() {
    currentView = 'exam';
    examState = {
      questions: [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 15),
      current: 0,
      correct: 0,
      total: 15,
      finished: false,
      timeLeft: 900
    };
    stats.examsTaken++;
    saveStats();
    
    if (examTimer) clearInterval(examTimer);
    examTimer = setInterval(() => {
      if (!examState || examState.finished) { clearInterval(examTimer); return; }
      examState.timeLeft--;
      const timerEl = document.getElementById('fs-exam-timer');
      if (timerEl) {
        timerEl.textContent = `${Math.floor(examState.timeLeft / 60)}:${(examState.timeLeft % 60).toString().padStart(2, '0')}`;
      }
      if (examState.timeLeft <= 0) {
        finishExam();
      }
    }, 1000);

    updateView();
  }

  function finishExam() {
    if (examTimer) clearInterval(examTimer);
    examState.finished = true;
    if (examState.correct >= 10) stats.examsPassed++;
    saveStats();
    updateView();
  }

  function handleClick(e) {
    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) {
      currentView = viewBtn.dataset.view;
      if (currentView !== 'exam' && examTimer) clearInterval(examTimer);
      updateView();
      return;
    }

    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    if (action === 'start-exam') { startExam(); return; }
    if (action === 'exam-back') { currentView = 'home'; examState = null; updateView(); return; }
    if (action === 'reset-stats') {
      if (confirm('Statistiken wirklich zurücksetzen?')) {
        stats = { examsTaken: 0, examsPassed: 0, questionsAnswered: 0, correctAnswers: 0 };
        saveStats(); updateView();
      }
      return;
    }

    if (action === 'learn-prev') { if (currentLearnIndex > 0) currentLearnIndex--; updateView(); return; }
    if (action === 'learn-next') { if (currentLearnIndex < QUESTIONS.length - 1) currentLearnIndex++; updateView(); return; }
    if (action === 'learn-answer') {
      const idx = parseInt(actionBtn.dataset.idx);
      const q = QUESTIONS[currentLearnIndex];
      const opts = document.querySelectorAll('#fs-opt-container .fs-opt');
      const exp = document.getElementById('fs-explain');
      
      opts.forEach((el, i) => {
        if (i === q.correct) el.classList.add('correct');
        else if (i === idx && idx !== q.correct) el.classList.add('wrong');
        el.disabled = true;
      });
      exp.style.display = 'block';
      
      stats.questionsAnswered++;
      if (idx === q.correct) stats.correctAnswers++;
      saveStats();
      return;
    }

    if (action === 'exam-answer' && examState && !examState.finished) {
      const idx = parseInt(actionBtn.dataset.idx);
      const q = examState.questions[examState.current];
      
      stats.questionsAnswered++;
      if (idx === q.correct) { examState.correct++; stats.correctAnswers++; }
      saveStats();

      examState.current++;
      if (examState.current >= examState.total) {
        finishExam();
      } else {
        updateView();
      }
      return;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 6. INIT & GLOBAL API
  // ═══════════════════════════════════════════════════════
  let currentTarget = null;

  function updateView() {
    if (!currentTarget) return;
    const main = currentTarget.querySelector('#fs-main-content');
    if (main) {
      if (currentView === 'home') main.innerHTML = renderHome();
      else if (currentView === 'learn') main.innerHTML = renderLearn();
      else if (currentView === 'signs') main.innerHTML = renderSigns();
      else if (currentView === 'exam') main.innerHTML = renderExam();
      else if (currentView === 'stats') main.innerHTML = renderStats();
    }
  }

  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      currentTarget.innerHTML = renderMain();
      currentTarget.addEventListener('click', handleClick);
    }
  }

  loadStats();

  // GLOBALE REGISTRIERUNG (Damit es JEDES System findet)
  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.fahrschule = { mount, version: VERSION, getStats: () => stats };
  window.Fahrschule = window.HalDoApps.fahrschule;
  window.apps = window.apps || {};
  window.apps.fahrschule = window.HalDoApps.fahrschule;
  window.renderFahrschule = mount;

  console.log('🚦 fahrschule.js v' + VERSION + ' geladen — Theorie-Training PROFESSIONAL (Global API Fix)');

})();
