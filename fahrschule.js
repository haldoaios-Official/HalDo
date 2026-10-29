/* HalDo Fahrschule v400.0 — PRO MAX PROFESSIONAL (KI, Multi-Lang, Videos, Echte Fragen) */
(function () {
  'use strict';

  const VERSION = '400.0';
  const STORAGE_KEY = 'haldo.fahrschule.pro.stats';

  // ═══════════════════════════════════════════════════════
  // 1. ÜBERSETZUNGEN (Multi-Language Support)
  // ═══════════════════════════════════════════════════════
  const LANG = {
    de: {
      dashboard: 'Dashboard', learn: 'Lernen', exam: 'Prüfung', signs: 'Schilder', videos: 'Videos', stats: 'Statistiken',
      start: 'Starten', practice: 'Üben', questions: 'Fragen', correct: 'Richtig', wrong: 'Falsch', time: 'Zeit',
      back: 'Zurück', next: 'Weiter', finish: 'Beenden', ai_explain: 'KI fragen', explanation: 'Erklärung',
      pass: 'BESTANDEN', fail: 'DURCHGEFALLEN', select_count: 'Anzahl der Fragen wählen', settings: 'Einstellungen',
      lang: 'Sprache', score: 'Punkte', exam_start: 'Prüfung starten', learn_start: 'Lernen starten'
    },
    en: {
      dashboard: 'Dashboard', learn: 'Learn', exam: 'Exam', signs: 'Signs', videos: 'Videos', stats: 'Stats',
      start: 'Start', practice: 'Practice', questions: 'Questions', correct: 'Correct', wrong: 'Wrong', time: 'Time',
      back: 'Back', next: 'Next', finish: 'Finish', ai_explain: 'Ask AI', explanation: 'Explanation',
      pass: 'PASSED', fail: 'FAILED', select_count: 'Select number of questions', settings: 'Settings',
      lang: 'Language', score: 'Score', exam_start: 'Start Exam', learn_start: 'Start Learning'
    },
    tr: {
      dashboard: 'Panel', learn: 'Öğren', exam: 'Sınav', signs: 'İşaretler', videos: 'Videolar', stats: 'İstatistikler',
      start: 'Başla', practice: 'Pratik', questions: 'Sorular', correct: 'Doğru', wrong: 'Yanlış', time: 'Zaman',
      back: 'Geri', next: 'İleri', finish: 'Bitir', ai_explain: 'Yapay Zeka', explanation: 'Açıklama',
      pass: 'GEÇTİ', fail: 'KALDI', select_count: 'Soru sayısını seçin', settings: 'Ayarlar',
      lang: 'Dil', score: 'Puan', exam_start: 'Sınavı Başlat', learn_start: 'Öğrenmeye Başla'
    }
  };

  // ═══════════════════════════════════════════════════════
  // 2. FRAGEN-KATALOG (Echte Fahrschul-Fragen)
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
    { id: 15, cat: 'Vorfahrt', q: 'Sie fahren auf einer Vorfahrtstraße. Ein Auto kommt von rechts.', opts: ['Ich habe Vorfahrt', 'Ich muss warten', 'Rechts vor Links gilt'], correct: 0, exp: 'Wer auf einer Vorfahrtstraße fährt, hat Vorfahrt.' },
    { id: 16, cat: 'Technik', q: 'Wann sollten Sie die Winterreifen aufziehen?', opts: ['Von Oktober bis Ostern (O bis O)', 'Nur im Dezember', 'Wenn es schneit'], correct: 0, exp: 'Die Faustregel lautet "O bis O" - Oktober bis Ostern.' },
    { id: 17, cat: 'Gefahrenlehre', q: 'Was tun bei einem Stau auf der Autobahn?', opts: ['Rettungsgasse bilden', 'Auf dem Standstreifen fahren', 'Rückwärts fahren'], correct: 0, exp: 'Zwischen linkem und rechtem Fahrstreifen muss eine Rettungsgasse gebildet werden.' },
    { id: 18, cat: 'Vorfahrt', q: 'Ein Polizist hebt den Arm. Was bedeutet das?', opts: ['Alle Fahrzeuge müssen anhalten', 'Nur LKW müssen anhalten', 'Ich darf fahren'], correct: 0, exp: 'Der Arm des Polizisten zeigt in meine Richtung oder er hebt ihn: Ich muss anhalten.' },
    { id: 19, cat: 'Umweltschutz', q: 'Was schont die Umwelt beim Auto?', opts: ['Reifendruck regelmäßig prüfen', 'Klimaanlage immer an', 'Dachgepäckträger leer mitfahren'], correct: 0, exp: 'Der richtige Reifendruck reduziert den Rollwiderstand und spart Sprit.' },
    { id: 20, cat: 'Verkehrszeichen', q: 'Was bedeutet ein blaues Schild mit einem Fußgänger?', opts: ['Fußgängerüberweg', 'Spielstraße', 'Fußgänger verboten'], correct: 0, exp: 'Es weist auf einen Fußgängerüberweg hin. Fußgänger haben Vorrang.' }
  ];

  const SIGNS = [
    { icon: '🛑', name: 'Stop', desc: 'Anhalten, Vorfahrt gewähren.' },
    { icon: '⚠️', name: 'Gefahrenstelle', desc: 'Allgemeine Gefahr, Geschwindigkeit anpassen.' },
    { icon: '⬇️', name: 'Vorfahrt gewähren', desc: 'Spitze unten. Andere Fahrzeuge durchlassen.' },
    { icon: '⬆️', name: 'Vorfahrtstraße', desc: 'Gelbe Raute. Ich habe Vorfahrt.' },
    { icon: '🚫', name: 'Verbot der Einfahrt', desc: 'Rotes Schild mit weißem Strich. Einfahrt verboten.' },
    { icon: '➡️', name: 'Vorgeschriebene Richtung', desc: 'Blaues Schild mit Pfeil. Man muss rechts abbiegen.' },
    { icon: '🚶', name: 'Fußgängerüberweg', desc: 'Blaues Schild. Fußgänger haben Vorrang.' },
    { icon: '🚲', name: 'Radweg', desc: 'Blaues Schild mit Fahrrad. Nur für Radfahrer.' },
    { icon: '🅿️', name: 'Parken', desc: 'Blaues Schild mit P. Hier ist Parken erlaubt.' },
    { icon: '🚦', name: 'Ampel', desc: 'Lichtzeichenanlage. Rot, Gelb, Grün beachten.' }
  ];

  // ═══════════════════════════════════════════════════════
  // 3. STATE & STORAGE
  // ═══════════════════════════════════════════════════════
  let state = {
    lang: 'de',
    stats: { examsTaken: 0, examsPassed: 0, questionsAnswered: 0, correctAnswers: 0 },
    currentView: 'dashboard',
    settings: { questionCount: 15 },
    exam: null,
    learnIndex: 0,
    learnList: []
  };

  let timerInterval = null;
  let currentTarget = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.stats) state.stats = parsed.stats;
        if (parsed.lang) state.lang = parsed.lang;
        if (parsed.settings) state.settings = parsed.settings;
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stats: state.stats,
        lang: state.lang,
        settings: state.settings
      }));
    } catch (e) { }
  }

  // ═══════════════════════════════════════════════════════
  // 4. CSS (PRO MAX DESIGN)
  // ═══════════════════════════════════════════════════════
  function css() {
    return `<style>
      .fs-app { font-family: Inter, system-ui, -apple-system, sans-serif; color: #e8e8ec; background: #0a0a0f; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
      .fs-header { padding: 15px 20px; background: rgba(17, 17, 24, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
      .fs-header h1 { margin: 0; font-size: 18px; color: #00e5ff; display: flex; gap: 10px; align-items: center; font-weight: 900; }
      .fs-nav { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; }
      .fs-nav::-webkit-scrollbar { display: none; }
      .fs-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 6px; font-size: 13px; white-space: nowrap; }
      .fs-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .fs-btn.active { background: #00e5ff; color: #000; border-color: #00e5ff; box-shadow: 0 0 15px rgba(0,229,255,0.4); }
      .fs-btn.primary { background: linear-gradient(135deg, #00e5ff, #b478ff); color: #000; border: none; font-weight: 900; }
      .fs-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,229,255,0.5); }
      
      .fs-content { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }
      .fs-content-inner { width: 100%; max-width: 800px; }
      
      .fs-card { background: rgba(20, 20, 28, 0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .fs-card h2 { margin-top: 0; font-size: 20px; color: #fff; margin-bottom: 15px; font-weight: 900; }
      
      .fs-opt { display: block; width: 100%; text-align: left; padding: 15px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #ddd; margin-bottom: 12px; cursor: pointer; font-family: inherit; font-size: 15px; transition: all 0.2s; }
      .fs-opt:hover { background: rgba(255,255,255,0.08); border-color: #00e5ff; transform: translateX(5px); }
      .fs-opt.correct { background: rgba(0,255,102,0.15); border-color: #00ff66; color: #00ff66; font-weight: bold; }
      .fs-opt.wrong { background: rgba(255,0,0,0.15); border-color: #ff3333; color: #ff3333; }
      .fs-opt:disabled { cursor: default; opacity: 0.8; transform: none; }
      
      .fs-exp { background: rgba(0,229,255,0.05); border-left: 4px solid #00e5ff; padding: 15px; border-radius: 0 10px 10px 0; margin-top: 15px; font-size: 14px; line-height: 1.6; color: #a8b0cc; display: none; }
      
      .fs-signs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; }
      .fs-sign-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 15px; text-align: center; transition: all 0.2s; cursor: pointer; }
      .fs-sign-item:hover { transform: translateY(-5px); border-color: #00e5ff; background: rgba(0,229,255,0.05); }
      .fs-sign-icon { font-size: 50px; margin-bottom: 15px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5)); }
      .fs-sign-name { font-weight: 900; color: #fff; font-size: 14px; margin-bottom: 6px; }
      .fs-sign-desc { font-size: 12px; color: #888; line-height: 1.4; }
      
      .fs-stat-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 15px; }
      .fs-stat-row:last-child { border-bottom: none; }
      .fs-stat-val { font-weight: 900; color: #00e5ff; }
      
      .fs-timer { font-size: 28px; font-weight: 900; color: #ffaa00; background: rgba(255,170,0,0.1); padding: 8px 20px; border-radius: 12px; border: 1px solid rgba(255,170,0,0.3); box-shadow: 0 0 20px rgba(255,170,0,0.2); }
      
      .fs-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .fs-modal-overlay.show { opacity: 1; pointer-events: auto; }
      .fs-modal { background: #14141c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 25px; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
      .fs-modal h3 { margin-top: 0; color: #00e5ff; font-size: 18px; display: flex; align-items: center; gap: 8px; }
      .fs-modal p { color: #ccc; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
      
      .fs-count-btn { background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); color: #fff; padding: 15px; border-radius: 12px; font-size: 18px; font-weight: 900; cursor: pointer; transition: all 0.2s; flex: 1; margin: 0 5px; }
      .fs-count-btn:hover, .fs-count-btn.active { border-color: #00e5ff; background: rgba(0,229,255,0.1); color: #00e5ff; }
      
      .fs-video-card { position: relative; border-radius: 12px; overflow: hidden; background: #000; aspect-ratio: 16/9; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
      .fs-video-card:hover .fs-play-btn { transform: scale(1.1); }
      .fs-play-btn { width: 60px; height: 60px; background: rgba(0,229,255,0.2); border: 2px solid #00e5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #00e5ff; transition: transform 0.2s; backdrop-filter: blur(5px); }
      .fs-video-title { position: absolute; bottom: 0; left: 0; right: 0; padding: 15px; background: linear-gradient(transparent, rgba(0,0,0,0.9)); color: #fff; font-weight: bold; font-size: 14px; }
      
      .fs-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
      .fs-badge.cat { background: rgba(0,229,255,0.15); color: #00e5ff; margin-bottom: 15px; }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 5. RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════
  function t(key) { return LANG[state.lang][key] || key; }

  function renderDashboard() {
    const pct = state.stats.examsTaken > 0 ? Math.round((state.stats.examsPassed / state.stats.examsTaken) * 100) : 0;
    return `
      <div class="fs-content"><div class="fs-content-inner">
        <div class="fs-card" style="text-align: center; padding: 50px 20px; background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(180,120,255,0.1));">
          <div style="font-size: 80px; margin-bottom: 20px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));">🚦</div>
          <h2 style="font-size: 32px; margin-bottom: 10px; background: linear-gradient(90deg, #00e5ff, #b478ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">HalDo Fahrschule</h2>
          <p style="color: #a8b0cc; margin-bottom: 30px; font-size: 16px;">Deine KI-gestützte Theorie-Prüfung. Lerne smart, fahre sicher.</p>
          <button class="fs-btn primary" data-action="view-exam" style="padding: 15px 40px; font-size: 18px; margin: 0 auto;">🏁 ${t('exam_start')}</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="fs-card">
            <h2 style="font-size: 16px; color: #888;">📊 ${t('stats')}</h2>
            <div class="fs-stat-row"><span>${t('exam')} (Total)</span><span class="fs-stat-val">${state.stats.examsTaken}</span></div>
            <div class="fs-stat-row"><span>${t('exam')} (Bestanden)</span><span class="fs-stat-val" style="color:#00ff66;">${state.stats.examsPassed}</span></div>
            <div class="fs-stat-row"><span>Erfolgsquote</span><span class="fs-stat-val">${pct}%</span></div>
          </div>
          <div class="fs-card">
            <h2 style="font-size: 16px; color: #888;">🧠 ${t('questions')}</h2>
            <div class="fs-stat-row"><span>${t('correct')}</span><span class="fs-stat-val">${state.stats.correctAnswers}</span></div>
            <div class="fs-stat-row"><span>${t('wrong')}</span><span class="fs-stat-val" style="color:#ff3333;">${state.stats.questionsAnswered - state.stats.correctAnswers}</span></div>
            <div class="fs-stat-row"><span>Insgesamt</span><span class="fs-stat-val">${state.stats.questionsAnswered}</span></div>
          </div>
        </div>
      </div></div>
    `;
  }

  function renderLearnSetup() {
    return `
      <div class="fs-content"><div class="fs-content-inner">
        <div class="fs-card">
          <h2>📖 ${t('learn')} - ${t('select_count')}</h2>
          <p style="color: #888; margin-bottom: 20px;">Wähle aus, wie viele Fragen du jetzt üben möchtest. Die Fragen werden zufällig ausgewählt.</p>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="fs-count-btn" data-action="start-learn" data-count="15">15 ${t('questions')}</button>
            <button class="fs-count-btn" data-action="start-learn" data-count="30">30 ${t('questions')}</button>
            <button class="fs-count-btn" data-action="start-learn" data-count="45">45 ${t('questions')}</button>
          </div>
        </div>
      </div></div>
    `;
  }

  function renderLearn() {
    if (!state.learnList || state.learnIndex >= state.learnList.length) {
      return `<div class="fs-content"><div class="fs-content-inner"><div class="fs-card" style="text-align:center;"><h2>🎉 Super gemacht!</h2><p style="color:#888;">Du hast alle Fragen in dieser Runde beantwortet.</p><button class="fs-btn primary" data-action="view-learn-setup" style="margin-top:20px;">Nochmal lernen</button></div></div></div>`;
    }

    const q = state.learnList[state.learnIndex];
    let optHtml = '';
    q.opts.forEach((opt, i) => {
      optHtml += `<button class="fs-opt" data-action="learn-answer" data-idx="${i}">${opt}</button>`;
    });
    
    return `
      <div class="fs-content"><div class="fs-content-inner">
        <div class="fs-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <span class="fs-badge cat">${q.cat}</span>
            <span style="font-size:14px; font-weight:bold; color:#888;">${state.learnIndex + 1} / ${state.learnList.length}</span>
          </div>
          <h2 style="font-size: 22px; line-height: 1.4;">${q.q}</h2>
          <div style="margin-top: 25px;" id="fs-opt-container">${optHtml}</div>
          <div class="fs-exp" id="fs-explain">
            <div style="display:flex; justify-content:space-between; align-items:start; gap:15px;">
              <div>${q.exp}</div>
              <button class="fs-btn" data-action="ask-ai" style="background: rgba(0,229,255,0.1); border-color: #00e5ff; color: #00e5ff; flex-shrink:0;">🤖 ${t('ai_explain')}</button>
            </div>
          </div>
          <div style="margin-top:25px; display:flex; justify-content:space-between;">
            <button class="fs-btn" data-action="view-dashboard">${t('back')}</button>
            <button class="fs-btn primary" id="fs-next-btn" data-action="learn-next" style="display:none;">${t('next')} ➡️</button>
          </div>
        </div>
      </div></div>
    `;
  }

  function renderExamSetup() {
    return `
      <div class="fs-content"><div class="fs-content-inner">
        <div class="fs-card">
          <h2>🏁 ${t('exam')} - ${t('select_count')}</h2>
          <p style="color: #888; margin-bottom: 20px;">Die Prüfung simuliert die echte Theorieprüfung. Der Timer läuft mit. Du musst 80% bestehen.</p>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="fs-count-btn" data-action="start-exam" data-count="15">15 ${t('questions')}</button>
            <button class="fs-count-btn" data-action="start-exam" data-count="30">30 ${t('questions')}</button>
            <button class="fs-count-btn" data-action="start-exam" data-count="45">45 ${t('questions')}</button>
          </div>
        </div>
      </div></div>
    `;
  }

  function renderExam() {
    if (!state.exam) return '';
    if (state.exam.finished) {
      const passed = state.exam.correct >= Math.ceil(state.exam.total * 0.8);
      return `
        <div class="fs-content"><div class="fs-content-inner">
          <div class="fs-card" style="text-align:center; padding:50px;">
            <div style="font-size:80px; margin-bottom:20px;">${passed ? '🎉' : '😢'}</div>
            <h2 style="font-size:32px; color:${passed ? '#00ff66' : '#ff3333'}; margin-bottom:10px;">${passed ? t('pass') : t('fail')}</h2>
            <p style="color:#888; font-size:18px; margin:20px 0;">Du hast ${state.exam.correct} von ${state.exam.total} Fragen richtig beantwortet.</p>
            <button class="fs-btn primary" data-action="view-dashboard" style="padding:15px 40px; font-size:18px; margin-top:20px;">${t('dashboard')}</button>
          </div>
        </div></div>
      `;
    }
    
    const q = state.exam.questions[state.exam.current];
    let optHtml = '';
    q.opts.forEach((opt, i) => {
      optHtml += `<button class="fs-opt" data-action="exam-answer" data-idx="${i}">${opt}</button>`;
    });
    
    return `
      <div class="fs-content"><div class="fs-content-inner">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <span style="font-weight:900; color:#fff; font-size:18px;">${t('questions')} ${state.exam.current + 1} / ${state.exam.total}</span>
          <div class="fs-timer" id="fs-exam-timer">${Math.floor(state.exam.timeLeft / 60)}:${(state.exam.timeLeft % 60).toString().padStart(2, '0')}</div>
        </div>
        <div class="fs-card">
          <span class="fs-badge cat">${q.cat}</span>
          <h2 style="font-size: 22px; line-height: 1.4; margin-top:10px;">${q.q}</h2>
          <div style="margin-top: 25px;" id="fs-exam-opts">${optHtml}</div>
        </div>
      </div></div>
    `;
  }

  function renderSigns() {
    let html = `<div class="fs-content"><div class="fs-content-inner"><div class="fs-card"><h2>🛑 Verkehrszeichen Lexikon</h2><div class="fs-signs-grid">`;
    SIGNS.forEach(s => {
      html += `<div class="fs-sign-item"><div class="fs-sign-icon">${s.icon}</div><div class="fs-sign-name">${s.name}</div><div class="fs-sign-desc">${s.desc}</div></div>`;
    });
    html += `</div></div></div></div>`;
    return html;
  }

  function renderVideos() {
    const vids = [
      { title: 'Grundlagen der Vorfahrt', dur: '12:30' },
      { title: 'Autobahn Auffahrt & Rettungsgasse', dur: '08:45' },
      { title: 'Richtig Einparken (Längs & Quer)', dur: '15:20' },
      { title: 'Verhalten bei Panne & Unfall', dur: '10:15' }
    ];
    let html = `<div class="fs-content"><div class="fs-content-inner"><div class="fs-card"><h2>🎬 Lernvideos (Simuliert)</h2><div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">`;
    vids.forEach(v => {
      html += `<div class="fs-video-card" onclick="alert('Video-Player wird in einer echten Umgebung gestartet!')">
        <div class="fs-play-btn">▶</div>
        <div class="fs-video-title">${v.title} <span style="float:right; color:#888;">${v.dur}</span></div>
      </div>`;
    });
    html += `</div></div></div></div>`;
    return html;
  }

  function renderSettings() {
    return `
      <div class="fs-content"><div class="fs-content-inner">
        <div class="fs-card">
          <h2>⚙️ ${t('settings')}</h2>
          <div class="fs-stat-row" style="align-items:center;">
            <span>${t('lang')}</span>
            <select data-action="set-lang" style="padding:8px 12px; background:#1a1a24; color:#fff; border:1px solid #333; border-radius:8px; outline:none; font-family:inherit;">
              <option value="de" ${state.lang === 'de' ? 'selected' : ''}>Deutsch</option>
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="tr" ${state.lang === 'tr' ? 'selected' : ''}>Türkçe</option>
            </select>
          </div>
        </div>
      </div></div>
    `;
  }

  function renderMain() {
    let viewHtml = '';
    if (state.currentView === 'dashboard') viewHtml = renderDashboard();
    else if (state.currentView === 'learn-setup') viewHtml = renderLearnSetup();
    else if (state.currentView === 'learn') viewHtml = renderLearn();
    else if (state.currentView === 'exam-setup') viewHtml = renderExamSetup();
    else if (state.currentView === 'exam') viewHtml = renderExam();
    else if (state.currentView === 'signs') viewHtml = renderSigns();
    else if (state.currentView === 'videos') viewHtml = renderVideos();
    else if (state.currentView === 'settings') viewHtml = renderSettings();

    let examBtn = (state.currentView === 'exam' || state.currentView === 'exam-setup') ? `<button class="fs-btn active" data-action="view-exam">🏁 ${t('exam')}</button>` : `<button class="fs-btn" data-action="view-exam">🏁 ${t('exam')}</button>`;

    return css() + `
      <div class="fs-app">
        <div class="fs-header">
          <h1>🚦 HalDo Fahrschule <span style="font-size:10px; color:#666; margin-left:5px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">PRO MAX v${VERSION}</span></h1>
          <div class="fs-nav">
            <button class="fs-btn ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard">🏠 ${t('dashboard')}</button>
            <button class="fs-btn ${state.currentView === 'learn-setup' || state.currentView === 'learn' ? 'active' : ''}" data-action="view-learn-setup">📖 ${t('learn')}</button>
            <button class="fs-btn ${state.currentView === 'signs' ? 'active' : ''}" data-action="view-signs">🛑 ${t('signs')}</button>
            <button class="fs-btn ${state.currentView === 'videos' ? 'active' : ''}" data-action="view-videos">🎬 ${t('videos')}</button>
            ${examBtn}
            <button class="fs-btn ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings">⚙️</button>
          </div>
        </div>
        <div id="fs-main-content" style="flex:1; overflow-y:auto;">
          ${viewHtml}
        </div>
      </div>
      <!-- AI Modal -->
      <div class="fs-modal-overlay" id="fs-ai-modal">
        <div class="fs-modal">
          <h3>🤖 HalDo KI Assistent</h3>
          <p id="fs-ai-text">Analysiere Frage...</p>
          <button class="fs-btn primary" style="width:100%;" onclick="document.getElementById('fs-ai-modal').classList.remove('show')">Verstanden</button>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 6. LOGIC & CONTROLLER
  // ═══════════════════════════════════════════════════════
  
  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function startExam(count) {
    state.exam = {
      questions: shuffle(QUESTIONS).slice(0, count),
      current: 0,
      correct: 0,
      total: count,
      finished: false,
      timeLeft: count * 60 // 1 Minute pro Frage
    };
    state.stats.examsTaken++;
    saveState();
    state.currentView = 'exam';
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!state.exam || state.exam.finished) { clearInterval(timerInterval); return; }
      state.exam.timeLeft--;
      
      const timerEl = document.getElementById('fs-exam-timer');
      if (timerEl) {
        timerEl.textContent = `${Math.floor(state.exam.timeLeft / 60)}:${(state.exam.timeLeft % 60).toString().padStart(2, '0')}`;
        if (state.exam.timeLeft <= 60) timerEl.style.color = '#ff3333'; // Warnung bei 1 Min
      }
      
      if (state.exam.timeLeft <= 0) finishExam();
    }, 1000);

    updateView();
  }

  function finishExam() {
    if (timerInterval) clearInterval(timerInterval);
    state.exam.finished = true;
    const passed = state.exam.correct >= Math.ceil(state.exam.total * 0.8);
    if (passed) state.stats.examsPassed++;
    saveState();
    updateView();
  }

  function startLearn(count) {
    state.learnList = shuffle(QUESTIONS).slice(0, count);
    state.learnIndex = 0;
    state.currentView = 'learn';
    updateView();
  }

  async function askAI(questionText, explanation) {
    const modal = document.getElementById('fs-ai-modal');
    const textEl = document.getElementById('fs-ai-text');
    if (!modal || !textEl) return;
    
    modal.classList.add('show');
    textEl.innerHTML = '<span style="color:#00e5ff;">Analysiere...</span>';
    
    // Simuliere KI-Antwort (oder rufe echte HalDo KI auf, falls vorhanden)
    setTimeout(() => {
      let aiResponse = explanation; // Fallback
      
      if (window.HalDoAI && typeof window.HalDoAI.generate === 'function') {
        try {
          // Wenn dein System eine echte KI hat, nutze sie!
          aiResponse = window.HalDoAI.generate("Erkläre diese Fahrschul-Frage einfach: " + questionText);
        } catch(e) {}
      } else {
        // Schlaue simulierte Antwort
        aiResponse = `Stell dir vor, du fährst gerade auf der Straße. ${explanation} <br><br><b>Tipp von HalDo KI:</b> Achte immer auf die anderen Verkehrsteilnehmer und sei vorausschauend!`;
      }
      
      textEl.innerHTML = aiResponse;
    }, 1200);
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    // Navigation
    if (action === 'view-dashboard') { state.currentView = 'dashboard'; if (timerInterval) clearInterval(timerInterval); updateView(); return; }
    if (action === 'view-learn-setup') { state.currentView = 'learn-setup'; updateView(); return; }
    if (action === 'view-exam') { state.currentView = 'exam-setup'; updateView(); return; }
    if (action === 'view-signs') { state.currentView = 'signs'; updateView(); return; }
    if (action === 'view-videos') { state.currentView = 'videos'; updateView(); return; }
    if (action === 'view-settings') { state.currentView = 'settings'; updateView(); return; }

    // Start
    if (action === 'start-exam') { startExam(parseInt(btn.dataset.count)); return; }
    if (action === 'start-learn') { startLearn(parseInt(btn.dataset.count)); return; }

    // Learn Mode
    if (action === 'learn-answer') {
      const idx = parseInt(btn.dataset.idx);
      const q = state.learnList[state.learnIndex];
      const opts = document.querySelectorAll('#fs-opt-container .fs-opt');
      const exp = document.getElementById('fs-explain');
      const nextBtn = document.getElementById('fs-next-btn');
      
      opts.forEach((el, i) => {
        if (i === q.correct) el.classList.add('correct');
        else if (i === idx && idx !== q.correct) el.classList.add('wrong');
        el.disabled = true;
      });
      exp.style.display = 'block';
      nextBtn.style.display = 'block';
      
      state.stats.questionsAnswered++;
      if (idx === q.correct) state.stats.correctAnswers++;
      saveState();
      return;
    }
    if (action === 'learn-next') {
      state.learnIndex++;
      updateView();
      return;
    }

    // Exam Mode
    if (action === 'exam-answer' && state.exam && !state.exam.finished) {
      const idx = parseInt(btn.dataset.idx);
      const q = state.exam.questions[state.exam.current];
      
      state.stats.questionsAnswered++;
      if (idx === q.correct) { state.exam.correct++; state.stats.correctAnswers++; }
      saveState();

      state.exam.current++;
      if (state.exam.current >= state.exam.total) {
        finishExam();
      } else {
        updateView();
      }
      return;
    }

    // AI
    if (action === 'ask-ai') {
      const q = state.learnList[state.learnIndex];
      askAI(q.q, q.exp);
      return;
    }
  }

  function handleChange(e) {
    const el = e.target;
    if (el.dataset.action === 'set-lang') {
      state.lang = el.value;
      saveState();
      updateView();
    }
  }

  function updateView() {
    if (!currentTarget) return;
    const main = currentTarget.querySelector('#fs-main-content');
    if (main) {
      // Re-render nur den Hauptinhalt, um Scroll-Verlust zu vermeiden
      if (state.currentView === 'dashboard') main.innerHTML = renderDashboard();
      else if (state.currentView === 'learn-setup') main.innerHTML = renderLearnSetup();
      else if (state.currentView === 'learn') main.innerHTML = renderLearn();
      else if (state.currentView === 'exam-setup') main.innerHTML = renderExamSetup();
      else if (state.currentView === 'exam') main.innerHTML = renderExam();
      else if (state.currentView === 'signs') main.innerHTML = renderSigns();
      else if (state.currentView === 'videos') main.innerHTML = renderVideos();
      else if (state.currentView === 'settings') main.innerHTML = renderSettings();
    }
    
    // Header-Buttons aktualisieren
    const header = currentTarget.querySelector('.fs-nav');
    if (header) {
       let examBtn = (state.currentView === 'exam' || state.currentView === 'exam-setup') ? `<button class="fs-btn active" data-action="view-exam">🏁 ${t('exam')}</button>` : `<button class="fs-btn" data-action="view-exam">🏁 ${t('exam')}</button>`;
       header.innerHTML = `
            <button class="fs-btn ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard">🏠 ${t('dashboard')}</button>
            <button class="fs-btn ${state.currentView === 'learn-setup' || state.currentView === 'learn' ? 'active' : ''}" data-action="view-learn-setup">📖 ${t('learn')}</button>
            <button class="fs-btn ${state.currentView === 'signs' ? 'active' : ''}" data-action="view-signs">🛑 ${t('signs')}</button>
            <button class="fs-btn ${state.currentView === 'videos' ? 'active' : ''}" data-action="view-videos">🎬 ${t('videos')}</button>
            ${examBtn}
            <button class="fs-btn ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings">⚙️</button>
       `;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 7. MOUNT & OPEN
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      currentTarget.innerHTML = renderMain();
      currentTarget.addEventListener('click', handleClick);
      currentTarget.addEventListener('change', handleChange);
    }
  }

  function openOverlay() {
    loadState();
    const overlay = document.createElement('div');
    overlay.className = 'fs-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0f;display:flex;flex-direction:column;';
    
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec; font-family:Inter;">🚦 HalDo Fahrschule PRO MAX</b><button id="fs-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:Inter;">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    
    const mountDiv = document.createElement('div');
    mountDiv.style.cssText = 'flex:1;overflow:hidden;';
    overlay.appendChild(mountDiv);
    document.body.appendChild(overlay);
    
    document.getElementById('fs-close-btn').onclick = () => {
      if (timerInterval) clearInterval(timerInterval);
      overlay.remove();
      currentTarget = null;
      state.currentView = 'dashboard';
    };
    mount(mountDiv);
  }

  // GLOBALE REGISTRIERUNG
  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.fahrschule = { mount, version: VERSION, open: openOverlay };
  window.Fahrschule = window.HalDoApps.fahrschule;
  window.apps = window.apps || {};
  window.apps.fahrschule = window.HalDoApps.fahrschule;
  window.renderFahrschule = mount;
  window.openFahrschule = openOverlay;

  console.log('🚦 fahrschule.js v' + VERSION + ' geladen — PRO MAX (KI, Multi-Lang, Pro UI)');

})();
