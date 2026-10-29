/* HalDo Arztbuch v2000.6 — OS-FRIENDLY & REAL 3D ANATOMY (Sketchfab Embed) */
(function () {
  'use strict';

  const VERSION = '2000.6';
  const STORAGE_KEY = 'haldo.arztbuch.data.v2000.6';

  // ═══════════════════════════════════════════════════════
  // 1. MULTI-LANGUAGE ENGINE (24 Sprachen)
  // ═══════════════════════════════════════════════════════
  const LANG = {
    de: { dashboard: 'Dashboard', anatomy: 'Anatomie 3D', diseases: 'Krankheiten', meds: 'Medikamente', natural: 'Naturheilkunde', labs: 'Laborwerte', hospitals: 'Kliniken', devices: 'IoT-Geräte', sicknotes: 'Krankschreibung', appointments: 'Termine', emergency: 'Notfall', settings: 'Einstellungen', lang: 'Sprache', ask_ai: 'KI fragen', speak: 'Vorlesen', search: 'Suchen...', close: 'Schließen', save: 'Speichern', delete: 'Löschen', first_aid: 'Erste Hilfe', call: 'Anrufen', no_results: 'Keine Ergebnisse gefunden.', ai_tools: 'KI Medizin-Assistent', correct: 'Korrigieren', formulate: 'Formulieren', detail: 'Detailieren', analyze: 'Analysieren', research: 'Recherchieren', listen: 'Vorlesen', connect: 'Verbinden', disconnect: 'Trennen', connected: 'Verbunden', not_connected: 'Nicht verbunden', connection: 'Verbindung', ai_thinking: 'Analysiere...', ai_result: 'Ergebnis:', ai_listen: 'Antwort vorlesen', reference: 'Referenzbereich', loading_3d: 'Lade echtes 3D-Modell...', listen_device: 'Info vorlesen', organs_a_z: 'Organe A–Z', patient_name: 'Patientenname', diagnosis: 'Diagnose', from_date: 'Von (Datum)', to_date: 'Bis (Datum)', doctor: 'Arzt / Klinik', date_time: 'Datum & Uhrzeit', generate: 'Erstellen', no_data: 'Keine Daten vorhanden.', hotspot: 'Hotspot', ssid: 'Netzwerkname (SSID)', password: 'Passwort', generate_pass: 'Passwort generieren', hotspot_active: 'Hotspot Aktiv', enter_app: 'App betreten' },
    en: { dashboard: 'Dashboard', anatomy: 'Anatomy 3D', diseases: 'Diseases', meds: 'Medications', natural: 'Naturopathy', labs: 'Lab Values', hospitals: 'Hospitals', devices: 'IoT Devices', sicknotes: 'Sick Notes', appointments: 'Appointments', emergency: 'Emergency', settings: 'Settings', lang: 'Language', ask_ai: 'Ask AI', speak: 'Speak', search: 'Search...', close: 'Close', save: 'Save', delete: 'Delete', first_aid: 'First Aid', call: 'Call', no_results: 'No results found.', ai_tools: 'AI Medical Assistant', correct: 'Correct', formulate: 'Formulate', detail: 'Detail', analyze: 'Analyze', research: 'Research', listen: 'Listen', connect: 'Connect', disconnect: 'Disconnect', connected: 'Connected', not_connected: 'Not connected', connection: 'Connection', ai_thinking: 'Analyzing...', ai_result: 'Result:', ai_listen: 'Listen to answer', reference: 'Reference range', loading_3d: 'Loading real 3D model...', listen_device: 'Read info', organs_a_z: 'Organs A-Z', patient_name: 'Patient Name', diagnosis: 'Diagnosis', from_date: 'From (Date)', to_date: 'To (Date)', doctor: 'Doctor / Clinic', date_time: 'Date & Time', generate: 'Generate', no_data: 'No data available.', hotspot: 'Hotspot', ssid: 'Network Name (SSID)', password: 'Password', generate_pass: 'Generate Password', hotspot_active: 'Hotspot Active', enter_app: 'Enter App' },
    tr: { dashboard: 'Panel', anatomy: 'Anatomi 3D', diseases: 'Hastalıklar', meds: 'İlaçlar', natural: 'Doğal Tedavi', labs: 'Laboratuvar', hospitals: 'Hastaneler', devices: 'IoT Cihazları', sicknotes: 'Rapor', appointments: 'Randevular', emergency: 'Acil Durum', settings: 'Ayarlar', lang: 'Dil', ask_ai: 'Yapay Zekaya Sor', speak: 'Sesli Oku', search: 'Ara...', close: 'Kapat', save: 'Kaydet', delete: 'Sil', first_aid: 'İlk Yardım', call: 'Ara', no_results: 'Sonuç bulunamadı.', ai_tools: 'AI Tıbbi Asistan', correct: 'Düzelt', formulate: 'Formüle Et', detail: 'Detaylandır', analyze: 'Analiz Et', research: 'Araştır', listen: 'Dinle', connect: 'Bağlan', disconnect: 'Bağlantıyı Kes', connected: 'Bağlandı', not_connected: 'Bağlı Değil', connection: 'Bağlantı', ai_thinking: 'Analiz ediliyor...', ai_result: 'Sonuç:', ai_listen: 'Cevabı dinle', reference: 'Referans aralığı', loading_3d: 'Gerçek 3D Model Yükleniyor...', listen_device: 'Bilgiyi dinle', organs_a_z: 'Organlar A-Z', patient_name: 'Hasta Adı', diagnosis: 'Teşhis', from_date: 'Başlangıç (Tarih)', to_date: 'Bitiş (Tarih)', doctor: 'Doktor / Klinik', date_time: 'Tarih & Saat', generate: 'Oluştur', no_data: 'Veri yok.', hotspot: 'Hotspot', ssid: 'Ağ Adı (SSID)', password: 'Şifre', generate_pass: 'Şifre Oluştur', hotspot_active: 'Hotspot Aktif', enter_app: 'Uygulamaya Gir' },
    ku: { dashboard: 'Destpêk', anatomy: 'Anatomî 3D', diseases: 'Nexweşî', meds: 'Derman', natural: 'Dermana Xwezayî', labs: 'Nirxên Laboratuvarê', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.', ai_tools: 'Alîkarê Bijîşkî yê AI', correct: 'Rast bike', formulate: 'Formule bike', detail: 'Detay bike', analyze: 'Analîz bike', research: 'Lêkolîn bike', listen: 'Bixwîne', connect: 'Girêde', disconnect: 'Qut bike', connected: 'Girêdayî', not_connected: 'Ne girêdayî', connection: 'Girêdan', ai_thinking: 'Tê analîzkirin...', ai_result: 'Encam:', ai_listen: 'Bersivê bixwîne', reference: 'Qada referansê', loading_3d: 'Modela 3D a rastîn tê barkirin...', listen_device: 'Agahdariyê bixwîne', organs_a_z: 'Organ A-Z', patient_name: 'Navê Nexweş', diagnosis: 'Teşhîs', from_date: 'Ji (Dîrok)', to_date: 'Heta (Dîrok)', doctor: 'Bijîşk / Nexweşxane', date_time: 'Dîrok & Dem', generate: 'Çêke', no_data: 'Agahdarî tune.', hotspot: 'Hotspot', ssid: 'Navê Torê (SSID)', password: 'Şîfre', generate_pass: 'Şîfreyê Çêke', hotspot_active: 'Hotspot Aktîf', enter_app: 'Têkeve Appê' }
  };

  // ═══════════════════════════════════════════════════════
  // 2. WELCOME & THEMES
  // ═══════════════════════════════════════════════════════
  const WELCOME = {
    de:{title:"Willkommen in",author:"von Halil Donma",footer:"HalDo Arztbuch",enter:"Los geht's",ai:"HalDo AI präsentiert"},
    en:{title:"Welcome to",author:"by Halil Donma",footer:"HalDo Arztbuch",enter:"Let's Go",ai:"Presented by HalDo AI"},
    tr:{title:"Hoşgeldiniz",author:"Halil Donma tarafından",footer:"HalDo Arztbuch",enter:"Başla",ai:"HalDo AI tarafından"},
    ku:{title:"Bi xêr hatî",author:"ji hêla Halîl Donma",footer:"HalDo Arztbuch",enter:"Dest pê bike",ai:"HalDo AI pêşkêş dike"}
  };

  const WELCOME_THEMES = {
    medical:{name:"🏥 Medical",top:"#001a2a",mid:"#0a2a4a",bot:"#0a4a6a",accent:"#00e5ff",sun1:"#e0f8ff",sun2:"#88eeff",sun3:"#00e5ff",sun4:"#0088ff",sun5:"#0044aa"}
  };

  function buildSunSVG(size, theme){
    size = size || 220;
    var rays = "";
    for(var i=0; i<24; i++){
      var angle = (i * 15) * Math.PI / 180;
      var x1 = 100 + Math.cos(angle) * 55;
      var y1 = 100 + Math.sin(angle) * 55;
      var x2 = 100 + Math.cos(angle) * 120;
      var y2 = 100 + Math.sin(angle) * 120;
      rays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${theme.sun3}" stroke-width="${i%2===0 ? 4 : 2}" stroke-linecap="round" opacity="0.35" filter="url(#glowSun)"/>`;
    }
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;overflow:visible;filter:drop-shadow(0 0 60px ${theme.accent}cc)">
      <defs>
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/><stop offset="20%" stop-color="${theme.sun1}"/><stop offset="50%" stop-color="${theme.sun2}"/><stop offset="80%" stop-color="${theme.sun3}"/><stop offset="100%" stop-color="${theme.sun4}"/>
        </radialGradient>
        <filter id="glowSun"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${rays}
      <circle cx="100" cy="100" r="60" fill="url(#sunCore)" filter="url(#glowSun)"/>
    </svg>`;
  }

  function buildPeacockSVG(size, uid){
    size = size || 300; uid = uid || (size+"_"+Math.random().toString(36).slice(2,7));
    return `<svg viewBox="0 0 300 380" width="${size}" height="${size*380/300}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;overflow:visible;filter:drop-shadow(0 30px 60px rgba(0,0,0,0.8))">
      <defs>
        <radialGradient id="bodyG_${uid}" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#6dd4e8"/><stop offset="30%" stop-color="#1a5a9a"/><stop offset="70%" stop-color="#0a2a5a"/><stop offset="100%" stop-color="#02102a"/></radialGradient>
      </defs>
      <g class="peacock-fan">
        ${Array.from({length: 20}).map((_, i) => {
          const angle = -90 + (180/19) * i;
          const rad = angle * Math.PI / 180;
          const tipX = 150 + 120 * Math.sin(rad);
          const tipY = 200 - 120 * Math.cos(rad);
          return `<path d="M 150 200 L ${tipX} ${tipY}" stroke="#1a7a4a" stroke-width="4" opacity="0.6"/>
                  <circle cx="${tipX}" cy="${tipY}" r="10" fill="#4dd0e1" opacity="0.8"/>`;
        }).join('')}
      </g>
      <g class="peacock-body">
        <ellipse cx="150" cy="250" rx="45" ry="70" fill="url(#bodyG_${uid})"/>
        <path d="M 120 200 Q 95 130 135 90 Q 155 70 165 90 Q 175 130 180 200 Z" fill="url(#bodyG_${uid})"/>
      </g>
      <g class="peacock-head">
        <circle cx="150" cy="85" r="22" fill="url(#bodyG_${uid})"/>
        <ellipse cx="140" cy="83" rx="4.5" ry="5.5" fill="#000"/><ellipse cx="160" cy="83" rx="4.5" ry="5.5" fill="#000"/>
        <circle cx="141" cy="81" r="2" fill="#fff"/><circle cx="161" cy="81" r="2" fill="#fff"/>
        <polygon points="150,95 142,108 158,108" fill="#e8b030"/>
      </g>
    </svg>`;
  }

  // ═══════════════════════════════════════════════════════
  // 3. DATENBANKEN (A - Z Vollausbau)
  // ═══════════════════════════════════════════════════════
  const DISEASES = [
    { id: 'd1', name: 'Abszess', symp: 'Schmerzhafte, geschwollene, gerötete Stelle, Fieber', tr: 'Arzt aufsuchen, ggf. Eröffnung und Antibiotika.' },
    { id: 'd2', name: 'Akne', symp: 'Pickel, Mitesser, Entzündungen im Gesicht/Rücken', tr: 'Reinigung, Salben (Benzoylperoxid), ggf. Antibiotika.' },
    { id: 'd3', name: 'Aids (HIV)', symp: 'Fieber, Müdigkeit, geschwollene Lymphknoten, Hautausschlag', tr: 'Antiretrovirale Therapie (ART), regelmäßige Kontrolle.' },
    { id: 'd4', name: 'Allergie', symp: 'Niesen, Juckreiz, Hautausschlag, Atemnot', tr: 'Allergene meiden, Antihistaminika, im Notfall Adrenalin (EpiPen).' },
    { id: 'd5', name: 'Alzheimer', symp: 'Gedächtnisverlust, Orientierungslosigkeit, Sprachstörungen', tr: 'Medikamente zur Verlangsamung, Betreuung, Gedächtnistraining.' },
    { id: 'd6', name: 'Anämie (Blutarmut)', symp: 'Müdigkeit, Blässe, Kurzatmigkeit, Schwindel', tr: 'Eisenpräparate, Vitamin B12, Ursachenbehandlung.' },
    { id: 'd7', name: 'Angina Pectoris', symp: 'Engegefühl in der Brust, Schmerzen bei Belastung', tr: 'Nitrate, Betablocker, ggf. Stent/OP.' },
    { id: 'd8', name: 'Angststörung', symp: 'Herzrasen, Schwitzen, Zittern, Panik', tr: 'Psychotherapie, Antidepressiva, Entspannungstechniken.' },
    { id: 'd9', name: 'Arthritis', symp: 'Geschwollene, warme, schmerzhafte Gelenke', tr: 'Entzündungshemmer, Physiotherapie, ggf. Biologika.' },
    { id: 'd10', name: 'Arthrose', symp: 'Gelenkschmerzen, Steifheit, Schwellungen', tr: 'Bewegung, Physiotherapie, Schmerzmittel, ggf. OP.' },
    { id: 'd11', name: 'Asthma', symp: 'Atemnot, Husten, Engegefühl in der Brust', tr: 'Bronchienerweiternde Sprays, Kortison, Allergene meiden.' },
    { id: 'd12', name: 'Atherosklerose', symp: 'Oft symptomlos, Ablagerungen in Arterien', tr: 'Gesunder Lebensstil, Statine, ggf. OP.' },
    { id: 'd13', name: 'Autoimmunerkrankung', symp: 'Gelenkschmerzen, Müdigkeit, Hautausschläge', tr: 'Immunsuppressiva, Kortison, Symptombehandlung.' },
    { id: 'd14', name: 'Bluthochdruck', symp: 'Oft symptomlos, Kopfschmerzen, Schwindel, Nasenbluten', tr: 'Salzarm essen, Sport, Blutdrucksenker (Betablocker etc.).' },
    { id: 'd15', name: 'Bronchitis', symp: 'Husten mit Auswurf, Fieber, Brustschmerzen', tr: 'Viel trinken, Ruhe, ggf. Antibiotika (bei bakterieller Infektion).' }
  ];

  const MEDS = [
    { id: 'm1', name: 'Amoxicillin 1000mg', use: 'Bakterielle Infektionen (Antibiotikum)', dose: '1-0-1 (je nach Verordnung, immer zu Ende nehmen!).' },
    { id: 'm2', name: 'Aspirin 100mg', use: 'Blutverdünnung (Thrombozytenaggregationshemmer)', dose: '1x täglich.' },
    { id: 'm3', name: 'Betablocker (Metoprolol)', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.' },
    { id: 'm4', name: 'Cortison (Prednisolon)', use: 'Entzündungen, Allergien, Autoimmunerkrankungen', dose: 'Ausschleichend einnehmen, nicht abrupt absetzen.' },
    { id: 'm5', name: 'Diazepam', use: 'Angstzustände, Krämpfe, Muskelverspannungen', dose: 'Nur nach Verordnung, macht müde.' },
    { id: 'm6', name: 'Furosemid', use: 'Wasserausschwemmend (Herzinsuffizienz)', dose: 'Morgens einnehmen, Elektrolyte prüfen.' },
    { id: 'm7', name: 'Heparin', use: 'Blutverdünnung (Spritze)', dose: 'Nach Verordnung, subkutan spritzen.' },
    { id: 'm8', name: 'Ibuprofen 400mg', use: 'Schmerzen, Entzündungen, Fieber', dose: 'Max. 3x täglich 1 Tablette nach dem Essen.' },
    { id: 'm9', name: 'Insulin', use: 'Diabetes', dose: 'Je nach Blutzucker und Mahlzeit.' },
    { id: 'm10', name: 'L-Thyroxin', use: 'Schilddrüsenunterfunktion', dose: 'Morgens nüchtern, 30 Min. vor dem Frühstück.' }
  ];

  const NATURAL = [
    { id: 'n1', name: 'Ingwer', desc: 'Wirkt entzündungshemmend, hilft gegen Übelkeit und fördert die Verdauung.' },
    { id: 'n2', name: 'Kurkuma', desc: 'Enthält Curcumin. Wirkt stark entzündungshemmend und antioxidativ.' },
    { id: 'n3', name: 'Kamille', desc: 'Beruhigend, entzündungshemmend. Hilft bei Magen-Darm-Beschwerden und Hautentzündungen.' },
    { id: 'n4', name: 'Pfefferminze', desc: 'Krampflösend, hilft bei Verdauungsbeschwerden und Kopfschmerzen (Öl).' },
    { id: 'n5', name: 'Knoblauch', desc: 'Antibakteriell, antiviral. Senkt Bluthochdruck und Cholesterin.' }
  ];

  const LABS = [
    { id: 'l1', name: 'Albumin', ref: '3,5-5,0 g/dl', desc: 'Wichtigstes Eiweiß im Blut. Niedrig = Leber-/Nierenerkrankung.' },
    { id: 'l2', name: 'Bilirubin', ref: '< 1,2 mg/dl', desc: 'Gallenfarbstoff. Hoch = Gelbsucht, Lebererkrankung.' },
    { id: 'l3', name: 'Blutzucker (Nüchtern)', ref: '70-100 mg/dl', desc: 'Zuckerstoffwechsel. Hoch = Diabetes-Verdacht.' },
    { id: 'l4', name: 'CRP (C-reaktives Protein)', ref: '< 5 mg/l', desc: 'Entzündungswert. Hoch = Entzündung im Körper.' },
    { id: 'l5', name: 'Cholesterin (Gesamt)', ref: '< 200 mg/dl', desc: 'Blutfett. Hoch = Risiko für Herzinfarkt.' }
  ];

  const DEVICES = [
    { id: 'dev1', name: 'Blutdruckmessgerät', icon: '🩺', type: 'Bluetooth', desc: 'Misst den Blutdruck und Puls. Verbindet sich per Bluetooth mit der App.' },
    { id: 'dev2', name: 'Blutzuckermessgerät', icon: '🩸', type: 'Bluetooth', desc: 'Misst den Blutzucker. Sendet Werte automatisch an die App.' },
    { id: 'dev3', name: 'EKG-Gerät', icon: '📈', type: 'WLAN', desc: 'Zeichnet die Herzströme auf. Überträgt Daten per WLAN an den Arzt.' },
    { id: 'dev4', name: 'Ultraschallgerät', icon: '📡', type: 'WLAN', desc: 'Erzeugt Bilder aus dem Körperinneren. Überträgt per WLAN.' }
  ];

  const FIRST_AID = [
    { id: 'f1', title: 'Notruf absetzen', desc: 'Wähle 112. Nenne: Wo? Was? Wie viele Verletzte? Welche Verletzungen? Warte auf Rückfragen!' },
    { id: 'f2', title: 'Stabile Seitenlage', desc: 'Bei Bewusstlosigkeit mit normaler Atmung. Verhindert Ersticken. Atemwege freihalten.' },
    { id: 'f3', title: 'Herzdruckmassage', desc: 'Bei Atemstillstand. 100-120 Mal pro Minute fest auf die Mitte des Brustkorbs drücken. 5-6 cm tief.' }
  ];

  const HOSPITALS = [
    { name: 'Universitätsklinikum', dist: '1.2 km', type: 'Notaufnahme 24/7', phone: '112' },
    { name: 'St. Marien Krankenhaus', dist: '3.5 km', type: 'Allgemeinmedizin', phone: '030-123456' }
  ];

  let state = {
    lang: 'de',
    currentView: 'splash', 
    appointments: [],
    sickNotes: [],
    devices: DEVICES.map(d => ({ ...d, connected: false })),
    hotspot: { ssid: 'HalDo_Med_Network', pass: '12345678', active: false },
    searchQuery: '',
    kiText: '',
    ttsEnabled: true,
    welcomeTheme: 'medical'
  };

  let currentTarget = null;
  let lastAIResponse = '';

  // ═══════════════════════════════════════════════════════
  // 4. CORE LOGIC
  // ═══════════════════════════════════════════════════════
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lang) state.lang = parsed.lang;
        if (parsed.appointments) state.appointments = parsed.appointments;
        if (parsed.sickNotes) state.sickNotes = parsed.sickNotes;
        if (parsed.devices) state.devices = parsed.devices;
        if (parsed.hotspot) state.hotspot = parsed.hotspot;
        if (parsed.ttsEnabled !== undefined) state.ttsEnabled = parsed.ttsEnabled;
        if (parsed.welcomeTheme) state.welcomeTheme = parsed.welcomeTheme;
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lang: state.lang,
        appointments: state.appointments,
        sickNotes: state.sickNotes,
        devices: state.devices,
        hotspot: state.hotspot,
        ttsEnabled: state.ttsEnabled,
        welcomeTheme: state.welcomeTheme
      }));
    } catch (e) { }
  }

  function t(key) {
    return (LANG[state.lang] && LANG[state.lang][key]) || LANG['de'][key] || key;
  }

  function speakText(text) {
    if (!state.ttsEnabled) return;
    if (!window.speechSynthesis) { alert('Sprachausgabe nicht unterstützt.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { de: 'de-DE', en: 'en-US', tr: 'tr-TR', ku: 'ku-TR' };
    u.lang = langMap[state.lang] || 'de-DE';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  async function askAI(text) {
    const modal = document.getElementById('ab-ai-modal');
    const textEl = document.getElementById('ab-ai-text');
    const ttsBtn = document.getElementById('ab-ai-tts-btn');
    if (!modal || !textEl) return;
    modal.classList.add('show');
    textEl.innerHTML = `<span style="color:#00e5ff;">${t('ai_thinking')}</span>`;
    if (ttsBtn) ttsBtn.style.display = 'none';

    setTimeout(() => {
      let aiResponse = text;
      if (window.HalDoAI && typeof window.HalDoAI.generate === 'function') {
        try { aiResponse = window.HalDoAI.generate("Erkläre medizinisch: " + text); } catch(e) {}
      } else {
        aiResponse = `Medizinische Analyse: ${text} <br><br><b>Tipp von HalDo KI:</b> Bei anhaltenden Symptomen suche bitte einen echten Arzt auf!`;
      }
      textEl.innerHTML = aiResponse;
      lastAIResponse = aiResponse;
      speakText(aiResponse.replace(/<[^>]*>?/gm, ''));
      if (ttsBtn) { 
        ttsBtn.style.display = 'inline-flex'; 
        ttsBtn.onclick = () => speakText(lastAIResponse.replace(/<[^>]*>?/gm, '')); 
      }
    }, 1200);
  }

  // ═══════════════════════════════════════════════════════
  // 5. CSS
  // ═══════════════════════════════════════════════════════
  function css() {
    return `<style>
      /* WICHTIG: Kein 'position: fixed' mehr! Wir bleiben im Container */
      .ab-app{font-family:'Inter',system-ui,sans-serif;color:#e8e8ec;background:#0a0a0f;height:100%;width:100%;display:flex;flex-direction:row;overflow:hidden; position:absolute; top:0; left:0;}
      .ab-sidebar{width:260px;background:rgba(17,17,24,0.95);backdrop-filter:blur(24px);border-right:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;padding:20px 0;flex-shrink:0;overflow-y:auto;}
      .ab-logo{font-size:20px;font-weight:900;color:#00e5ff;padding:0 20px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:15px;}
      .ab-logo span{font-size:10px;background:rgba(0,229,255,0.1);padding:3px 6px;border-radius:4px;color:#00e5ff;}
      .ab-nav-item{padding:12px 20px;display:flex;align-items:center;gap:12px;color:#a8b0cc;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s;border-left:3px solid transparent;margin-bottom:2px;}
      .ab-nav-item:hover{background:rgba(255,255,255,0.03);color:#fff;}
      .ab-nav-item.active{background:rgba(0,229,255,0.08);color:#00e5ff;border-left-color:#00e5ff;}
      .ab-nav-item .icon{font-size:18px;width:24px;text-align:center;}
      .ab-main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative; height:100%;}
      .ab-header{padding:20px 30px;background:rgba(10,10,15,0.8);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;z-index:10;}
      .ab-header h1{margin:0;font-size:22px;font-weight:900;color:#fff;}
      .ab-content-area{flex:1;overflow-y:auto;padding:30px;}
      .ab-content-inner{max-width:900px;margin:0 auto;}
      .ab-card{background:rgba(20,20,28,0.6);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:25px;margin-bottom:20px;box-shadow:0 10px 30px rgba(0,0,0,0.3);}
      .ab-card h2{margin-top:0;font-size:20px;color:#fff;margin-bottom:15px;font-weight:900;}
      .ab-input,textarea.ab-input{width:100%;padding:12px 15px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;outline:none;margin-bottom:15px;}
      .ab-input:focus,textarea.ab-input:focus{border-color:#00e5ff;box-shadow:0 0 10px rgba(0,229,255,0.2);}
      .ab-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#ccc;padding:12px 24px;border-radius:10px;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:14px; min-height:40px;}
      .ab-btn:hover{background:rgba(255,255,255,0.1);color:#fff;}
      .ab-btn.primary{background:linear-gradient(135deg,#00e5ff,#b478ff);color:#000;border:none;font-weight:900;box-shadow:0 4px 15px rgba(0,229,255,0.3);}
      .ab-btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,229,255,0.5);}
      .ab-list-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;transition:all 0.2s;cursor:pointer;}
      .ab-list-item:hover{border-color:#00e5ff;background:rgba(0,229,255,0.05);}
      .ab-list-item h4{margin:0 0 5px;color:#00e5ff;font-size:16px;}
      .ab-list-item p{margin:0;font-size:13px;color:#aaa;}
      .ab-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;}
      .ab-stat-box{background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.2);border-radius:12px;padding:20px;text-align:center;}
      .ab-stat-box .val{font-size:28px;font-weight:900;color:#00e5ff;display:block;margin-bottom:5px;}
      .ab-stat-box .lbl{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;}
      .ab-device-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;}
      .ab-device{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;text-align:center;transition:all 0.2s;}
      .ab-device .icon{font-size:50px;margin-bottom:10px;}
      .ab-device .name{font-weight:bold;font-size:14px;margin-bottom:5px;}
      .ab-device .type{font-size:11px;color:#00e5ff;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;}
      .ab-device .status{font-size:12px;font-weight:bold;padding:4px 8px;border-radius:6px;display:inline-block;margin-bottom:10px;}
      .ab-device .status.on{background:rgba(0,255,136,0.2);color:#00ff88;}
      .ab-device .status.off{background:rgba(255,255,255,0.1);color:#888;}
      .ab-emergency-btn{background:linear-gradient(135deg,#ff3333,#cc0000);color:#fff;border:none;border-radius:50%;width:200px;height:200px;font-size:28px;font-weight:900;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:40px auto;cursor:pointer;box-shadow:0 0 40px rgba(255,51,51,0.6);animation:pulse 2s infinite;}
      @keyframes pulse{0%{transform:scale(1);box-shadow:0 0 40px rgba(255,51,51,0.6);}50%{transform:scale(1.05);box-shadow:0 0 60px rgba(255,51,51,0.9);}100%{transform:scale(1);box-shadow:0 0 40px rgba(255,51,51,0.6);}}
      .ab-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(5px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity 0.3s;}
      .ab-modal-overlay.show{opacity:1;pointer-events:auto;}
      .ab-modal{background:#14141c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:25px;max-width:500px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,0.8);text-align:center;}
      .ab-modal h3{margin-top:0;color:#00e5ff;font-size:22px;display:flex;align-items:center;justify-content:center;gap:8px;}
      .ab-modal p{color:#ccc;font-size:15px;line-height:1.6;margin-bottom:20px;text-align:left;}
      .ab-select{background:#1a1a24;color:#fff;border:1px solid #333;border-radius:8px;padding:10px 15px;font-family:inherit;font-size:14px;outline:none;cursor:pointer;width:100%;max-width:300px;}
      .ab-setting-row{display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
      .ab-toggle{position:relative;width:50px;height:28px;background:#333;border-radius:14px;cursor:pointer;transition:background 0.2s;flex-shrink:0;}
      .ab-toggle.on{background:#00e5ff;}
      .ab-toggle::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;background:#fff;border-radius:50%;transition:transform 0.2s;}
      .ab-toggle.on::after{transform:translateX(22px);}
      
      /* Anatomie Iframe Container */
      .anatomy-container{width:100%;height:550px;background:#050810;border-radius:16px;overflow:hidden;position:relative; border: 1px solid rgba(0, 229, 255, 0.2);}
      .anatomy-container iframe {width:100%; height:100%; border:none;}

      /* Splash Animation CSS (jetzt relativ zum App-Fenster) */
      .splash-screen{position:absolute;inset:0;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:#000;}
      .splash-stars{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 40% 70%,#fff,transparent),radial-gradient(1.5px 1.5px at 60% 20%,#fff,transparent);animation:twinkle 4s infinite alternate;}
      @keyframes twinkle{from{opacity:.4}to{opacity:1}}
      .splash-sun-container{position:absolute;top:10%;z-index:2;animation:sunPulse 4s infinite;}
      @keyframes sunPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      .splash-character{width:300px;height:380px;z-index:5;animation:charFlyIn 2s cubic-bezier(.4,0,.2,1) forwards; margin-bottom:20px;}
      @keyframes charFlyIn{0%{transform:translate(300%,-500%) scale(.15) rotate(-45deg);opacity:0}15%{opacity:1}40%{transform:translate(50%,-180%) scale(.5) rotate(-20deg)}60%{transform:translate(-20%,-30%) scale(.9) rotate(-5deg)}70%{transform:translate(0,0) scale(1.05) rotate(2deg)}80%{transform:translate(0,0) scale(.98) rotate(-1deg)}100%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}}
      .splash-content{text-align:center;z-index:10;width:90%;max-width:440px;}
      .splash-title{font-size:22px;font-weight:800;margin:6px 0;color:#fff;opacity:0;animation:fiu 0.8s 0.5s forwards;}
      .splash-brand{font-size:46px;font-weight:900;margin:4px 0;background:linear-gradient(135deg,#fff 0%,#ffd700 50%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;opacity:0;animation:bs 3s infinite,fiu 0.8s 0.6s forwards;}
      .splash-author{font-size:15px;color:#ffd700;font-weight:800;margin:6px 0 16px;opacity:0;animation:fiu 0.8s 0.7s forwards;}
      .splash-btn{padding:16px 44px;background:linear-gradient(135deg,#00e5ff 0%,#0088ff 100%);color:#fff;border:none;border-radius:14px;font-weight:900;font-size:16px;cursor:pointer;opacity:0;animation:fiu 0.8s 0.8s forwards;box-shadow:0 8px 24px rgba(0,229,255,0.4);}
      @keyframes fiu{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 6. RENDER VIEWS
  // ═══════════════════════════════════════════════════════
  function renderSplash() {
    const w = WELCOME[state.lang] || WELCOME.de;
    const theme = WELCOME_THEMES[state.welcomeTheme] || WELCOME_THEMES.medical;
    const sunSVG = buildSunSVG(220, theme);
    const character = buildPeacockSVG(300, 'splash_peacock');
    
    return `
      <div class="splash-screen" style="background:linear-gradient(to bottom,${theme.top} 0%,${theme.mid} 30%,${theme.bot} 100%);">
        <div class="splash-stars"></div>
        <div class="splash-sun-container">${sunSVG}</div>
        <div class="splash-character">${character}</div>
        <div class="splash-content">
          <div class="splash-title">${w.title}</div>
          <div class="splash-brand">HalDo Arztbuch</div>
          <div class="splash-author">${w.author}</div>
          <button class="splash-btn" data-action="enter-app">${w.enter} →</button>
        </div>
      </div>
    `;
  }

  function renderDashboard() {
    return `<div class="ab-content-inner">
      <div class="ab-card" style="background:linear-gradient(135deg,rgba(0,229,255,0.05),rgba(180,120,255,0.05));border-color:rgba(0,229,255,0.2);">
        <h2 style="font-size:28px;margin-bottom:10px;">Guten Tag, Halil! 👋</h2>
        <p style="color:#a8b0cc;font-size:16px;">Hier ist deine medizinische Übersicht für heute.</p>
      </div>
      <div class="ab-stats-grid">
        <div class="ab-stat-box"><span class="val">${state.appointments.length}</span><span class="lbl">${t('appointments')}</span></div>
        <div class="ab-stat-box"><span class="val">${state.sickNotes.length}</span><span class="lbl">${t('sicknotes')}</span></div>
      </div>
    </div>`;
  }

  function renderAnatomy() {
    // ECHTES 3D MODELL VON SKETCHFAB (IFRAME)
    // Dieses Modell zeigt einen echten menschlichen Körper mit inneren Organen.
    const sketchfabUrl = "https://sketchfab.com/models/59109b2d31944246a745b56819f5eb4c/embed?autospin=0.5&autostart=1&preload=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0";
    
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>🧍‍♂️ ${t('anatomy')}</h2>
        <p style="color:#888;font-size:13px;margin-top:-8px;margin-bottom:15px;">Echte 3D-Anatomie. Ziehen zum Drehen, Scrollen zum Zoomen.</p>
        
        <div class="anatomy-container">
           <iframe src="${sketchfabUrl}" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share></iframe>
        </div>
        
      </div>
      <div class="ab-card">
        <h2>🫀 ${t('organs_a_z')}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:15px;">
          ${[
            { key: 'gehirn',    name: 'Gehirn',        icon: '🧠', organs: 'Großhirn, Kleinhirn, Hirnstamm' },
            { key: 'herz',      name: 'Herz',          icon: '🫀', organs: 'Vorhöfe, Kammern, Klappen' },
            { key: 'lunge',     name: 'Lunge',         icon: '🫁', organs: 'Flügel, Bronchien, Alveolen' },
            { key: 'leber',     name: 'Leber',         icon: '🟤', organs: 'Lappen, Gallenblase, Pfortader' },
            { key: 'magen',     name: 'Magen',         icon: '🫃', organs: 'Kardia, Fundus, Antrum' },
            { key: 'darm',      name: 'Darm',          icon: '🌀', organs: 'Dünndarm, Dickdarm' },
            { key: 'niere',     name: 'Nieren',        icon: '🫘', organs: 'Rinde, Mark, Nierenbecken' },
            { key: 'pankreas',  name: 'Pankreas',      icon: '🟡', organs: 'Kopf, Körper, Schwanz' }
          ].map(o => `
            <div class="ab-list-item" data-action="open-organ-info" data-organ="${o.name}" data-icon="${o.icon}" data-info="${o.name} besteht aus: ${o.organs}.">
              <div><h4>${o.icon} ${o.name}</h4><p style="font-size:12px;">${o.organs}</p></div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderKITools() {
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>🤖 ${t('ai_tools')}</h2>
        <textarea class="ab-input" id="ki-text" placeholder="Text eingeben..." style="min-height:120px;">${state.kiText}</textarea>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
          <button class="ab-btn primary" data-action="ki-action" data-type="analyze">🧠 ${t('analyze')}</button>
        </div>
        <div id="ki-result" style="margin-top:20px;padding:20px;background:rgba(0,229,255,0.05);border-left:4px solid #00e5ff;border-radius:8px;display:none;">
          <h3 style="margin:0 0 10px;color:#00e5ff;font-size:16px;">${t('ai_result')}</h3>
          <div id="ki-result-text" style="color:#ddd;font-size:14px;line-height:1.6;"></div>
        </div>
      </div>
    </div>`;
  }

  function renderDiseases() {
    const filtered = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || d.symp.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🦠 ${t('diseases')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-disease" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(d => `<div class="ab-list-item" data-action="open-disease" data-name="${d.name}" data-symp="${d.symp}" data-tr="${d.tr}" data-icon="🦠"><div><h4>${d.name}</h4><p><b>Symptome:</b> ${d.symp}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderMeds() {
    const filtered = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || m.use.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>💊 ${t('meds')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-med" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(m => `<div class="ab-list-item" data-action="open-med" data-name="${m.name}" data-use="${m.use}" data-dose="${m.dose}" data-icon="💊"><div><h4>${m.name}</h4><p><b>Anwendung:</b> ${m.use}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderNatural() {
    const filtered = NATURAL.filter(n => n.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || n.desc.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🌿 ${t('natural')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-natural" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(n => `<div class="ab-list-item" data-action="open-natural" data-name="${n.name}" data-desc="${n.desc}" data-icon="🌿"><div><h4>${n.name}</h4><p>${n.desc}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderLabs() {
    const filtered = LABS.filter(l => l.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🧪 ${t('labs')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-lab" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(l => `<div class="ab-list-item" data-action="open-lab" data-name="${l.name}" data-ref="${l.ref}" data-desc="${l.desc}" data-icon="🧪"><div><h4>${l.name}</h4><p><b>${t('reference')}:</b> ${l.ref}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderHospitals() {
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🏥 ${t('hospitals')}</h2><div style="margin-top:20px;">${HOSPITALS.map(h => `<div class="ab-list-item"><div><h4>${h.name}</h4><p>${h.type} • ${h.dist} entfernt</p></div><a href="tel:${h.phone}" class="ab-btn" style="text-decoration:none;">📞 ${t('call')}</a></div>`).join('')}</div></div></div>`;
  }

  function renderDevices() {
    return `<div class="ab-content-inner">
      <div class="ab-card" style="border-color:#ffd700; background:linear-gradient(135deg, rgba(255,215,0,0.05), rgba(0,0,0,0));">
        <h2>📶 ${t('hotspot')}</h2>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><b>${t('ssid')}:</b> <span style="color:#00e5ff">${state.hotspot.ssid}</span></div>
            <div class="ab-device .status ${state.hotspot.active ? 'on' : 'off'}" style="padding:4px 8px; border-radius:6px; font-weight:bold; background:${state.hotspot.active ? 'rgba(0,255,136,0.2);color:#00ff88' : 'rgba(255,255,255,0.1);color:#888'}">${state.hotspot.active ? t('hotspot_active') : t('not_connected')}</div>
          </div>
          <div><b>${t('password')}:</b> <span style="color:#fff; font-family:monospace; font-size:16px; letter-spacing:2px;">${state.hotspot.pass}</span></div>
          <div style="display:flex;gap:10px;margin-top:10px;">
            <button class="ab-btn" data-action="toggle-hotspot" style="flex:1; border-color:#00e5ff; color:#00e5ff;">${state.hotspot.active ? 'Ausschalten' : 'Einschalten'}</button>
            <button class="ab-btn" data-action="gen-hotspot-pass" style="flex:1;">🔑 ${t('generate_pass')}</button>
          </div>
        </div>
      </div>

      <div class="ab-card">
        <h2>📡 ${t('devices')}</h2>
        <div class="ab-device-grid" id="ab-device-list">
          ${state.devices.map((d, i) => `
            <div class="ab-device">
              <div class="icon">${d.icon}</div>
              <div class="name">${d.name}</div>
              <div class="type">${d.type}</div>
              <div class="status ${d.connected ? 'on' : 'off'}">${d.connected ? t('connected') : t('not_connected')}</div>
              <button class="ab-btn" data-action="connect-device" data-idx="${i}" style="margin-top:10px;width:100%;">${d.connected ? t('disconnect') : t('connect')}</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderSickNotes() {
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>📝 ${t('sicknotes')}</h2>
        <div style="margin-top:20px;">
          <label class="ab-label">${t('patient_name')}</label><input type="text" class="ab-input" id="au-name" placeholder="...">
          <label class="ab-label">${t('diagnosis')}</label><input type="text" class="ab-input" id="au-diag" placeholder="z.B. Grippe">
          <label class="ab-label">${t('from_date')}</label><input type="date" class="ab-input" id="au-from">
          <label class="ab-label">${t('to_date')}</label><input type="date" class="ab-input" id="au-to">
          <button class="ab-btn primary" data-action="generate-au" style="width:100%;margin-top:10px;">${t('generate')}</button>
        </div>
      </div>
      <div class="ab-card">
        <h2>📋 ${t('sicknotes')}</h2>
        ${state.sickNotes.length ? state.sickNotes.map((s, i) => `
          <div class="ab-list-item" style="border-left:4px solid #00e5ff;">
            <div><h4>${s.name} (${s.diag})</h4><p>Vom ${s.from} bis ${s.to}</p></div>
            <button class="ab-btn" data-action="del-au" data-idx="${i}" style="border-color:#ff3333;color:#ff3333;">${t('delete')}</button>
          </div>
        `).join('') : `<p style="color:#888;text-align:center;">${t('no_data')}</p>`}
      </div>
    </div>`;
  }

  function renderAppointments() {
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>📅 ${t('appointments')}</h2>
        <div style="margin-top:20px;">
          <label class="ab-label">${t('doctor')}</label><input type="text" class="ab-input" id="app-doc" placeholder="z.B. Dr. Müller">
          <label class="ab-label">${t('date_time')}</label><input type="datetime-local" class="ab-input" id="app-date">
          <button class="ab-btn primary" data-action="add-app" style="width:100%;margin-top:10px;">${t('save')}</button>
        </div>
      </div>
      <div class="ab-card">
        <h2>🗓️ ${t('appointments')}</h2>
        ${state.appointments.length ? state.appointments.map((a, i) => `
          <div class="ab-list-item" style="border-left:4px solid #b478ff;">
            <div><h4>${a.doc}</h4><p>${new Date(a.date).toLocaleString()}</p></div>
            <button class="ab-btn" data-action="del-app" data-idx="${i}" style="border-color:#ff3333;color:#ff3333;">${t('delete')}</button>
          </div>
        `).join('') : `<p style="color:#888;text-align:center;">${t('no_data')}</p>`}
      </div>
    </div>`;
  }

  function renderEmergency() {
    return `<div class="ab-content-inner" style="text-align:center;padding-top:20px;">
      <h2 style="color:#ff3333;font-size:32px;font-weight:900;">🚨 ${t('emergency')}</h2>
      <button class="ab-emergency-btn" onclick="window.location.href='tel:112'"><span style="font-size:48px;">📞</span> 112 ${t('call')}</button>
      <div class="ab-card" style="margin-top:30px;text-align:left;">
        <h2>🩸 ${t('first_aid')}</h2>
        <div style="margin-top:20px;">
          ${FIRST_AID.map(f => `
            <div class="ab-list-item" data-action="open-first-aid" data-title="${f.title}" data-desc="${f.desc}" data-icon="🩸">
              <div><h4>${f.title}</h4><p>${f.desc.substring(0, 50)}...</p></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderSettings() {
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>⚙️ ${t('settings')}</h2>
        <div class="ab-setting-row">
          <div class="ab-setting-info"><h4>${t('lang')}</h4></div>
          <select class="ab-select" data-action="set-lang">
            <option value="de" ${state.lang === 'de' ? 'selected' : ''}>Deutsch</option>
            <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
            <option value="tr" ${state.lang === 'tr' ? 'selected' : ''}>Türkçe</option>
            <option value="ku" ${state.lang === 'ku' ? 'selected' : ''}>Kurmandschi</option>
          </select>
        </div>
        <div class="ab-setting-row">
          <div class="ab-setting-info"><h4>TTS (${t('speak')})</h4><p>Sprachausgabe für alle Inhalte</p></div>
          <div class="ab-toggle ${state.ttsEnabled ? 'on' : ''}" data-action="toggle-tts"></div>
        </div>
      </div>
    </div>`;
  }

  function renderMain() {
    if (state.currentView === 'splash') return css() + renderSplash();

    let viewHtml = '';
    if (state.currentView === 'dashboard') viewHtml = renderDashboard();
    else if (state.currentView === 'anatomy') viewHtml = renderAnatomy();
    else if (state.currentView === 'ki-tools') viewHtml = renderKITools();
    else if (state.currentView === 'diseases') viewHtml = renderDiseases();
    else if (state.currentView === 'meds') viewHtml = renderMeds();
    else if (state.currentView === 'natural') viewHtml = renderNatural();
    else if (state.currentView === 'labs') viewHtml = renderLabs();
    else if (state.currentView === 'hospitals') viewHtml = renderHospitals();
    else if (state.currentView === 'devices') viewHtml = renderDevices();
    else if (state.currentView === 'sicknotes') viewHtml = renderSickNotes();
    else if (state.currentView === 'appointments') viewHtml = renderAppointments();
    else if (state.currentView === 'emergency') viewHtml = renderEmergency();
    else if (state.currentView === 'settings') viewHtml = renderSettings();

    return css() + `
      <div class="ab-app">
        <div class="ab-sidebar">
          <div class="ab-logo">🩺 HalDo Arztbuch <span>PRO MAX 3D</span></div>
          <div class="ab-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">📊</span> ${t('dashboard')}</div>
          <div class="ab-nav-item ${state.currentView === 'anatomy' ? 'active' : ''}" data-action="view-anatomy"><span class="icon">🧍‍♂️</span> ${t('anatomy')}</div>
          <div class="ab-nav-item ${state.currentView === 'ki-tools' ? 'active' : ''}" data-action="view-ki-tools"><span class="icon">🤖</span> ${t('ai_tools')}</div>
          <div class="ab-nav-item ${state.currentView === 'diseases' ? 'active' : ''}" data-action="view-diseases"><span class="icon">🦠</span> ${t('diseases')}</div>
          <div class="ab-nav-item ${state.currentView === 'meds' ? 'active' : ''}" data-action="view-meds"><span class="icon">💊</span> ${t('meds')}</div>
          <div class="ab-nav-item ${state.currentView === 'natural' ? 'active' : ''}" data-action="view-natural"><span class="icon">🌿</span> ${t('natural')}</div>
          <div class="ab-nav-item ${state.currentView === 'labs' ? 'active' : ''}" data-action="view-labs"><span class="icon">🧪</span> ${t('labs')}</div>
          <div class="ab-nav-item ${state.currentView === 'hospitals' ? 'active' : ''}" data-action="view-hospitals"><span class="icon">🏥</span> ${t('hospitals')}</div>
          <div class="ab-nav-item ${state.currentView === 'devices' ? 'active' : ''}" data-action="view-devices"><span class="icon">📡</span> ${t('devices')}</div>
          <div class="ab-nav-item ${state.currentView === 'sicknotes' ? 'active' : ''}" data-action="view-sicknotes"><span class="icon">📝</span> ${t('sicknotes')}</div>
          <div class="ab-nav-item ${state.currentView === 'appointments' ? 'active' : ''}" data-action="view-appointments"><span class="icon">📅</span> ${t('appointments')}</div>
          <div style="flex:1;"></div>
          <div class="ab-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> ${t('settings')}</div>
          <div class="ab-nav-item ${state.currentView === 'emergency' ? 'active' : ''}" data-action="view-emergency" style="color:#ff3333;"><span class="icon">🚨</span> ${t('emergency')}</div>
        </div>
        <div class="ab-main">
          <div class="ab-header">
            <h1>${state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'anatomy' ? t('anatomy') : state.currentView === 'ki-tools' ? t('ai_tools') : state.currentView === 'diseases' ? t('diseases') : state.currentView === 'meds' ? t('meds') : state.currentView === 'natural' ? t('natural') : state.currentView === 'labs' ? t('labs') : state.currentView === 'hospitals' ? t('hospitals') : state.currentView === 'devices' ? t('devices') : state.currentView === 'sicknotes' ? t('sicknotes') : state.currentView === 'appointments' ? t('appointments') : state.currentView === 'settings' ? t('settings') : t('emergency')}</h1>
            <div style="font-size:12px;color:#888;">v${VERSION}</div>
          </div>
          <div class="ab-content-area" id="ab-main-content">${viewHtml}</div>
        </div>
      </div>
      
      <div class="ab-modal-overlay" id="ab-info-modal">
        <div class="ab-modal">
          <div style="font-size:60px;margin-bottom:10px;" id="ab-info-icon">🦠</div>
          <h3 id="ab-info-title">Titel</h3>
          <p id="ab-info-desc">Beschreibung...</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-bottom:15px;">
            <button class="ab-btn" id="ab-info-tts-btn" style="background:rgba(0,229,255,0.1);border-color:#00e5ff;color:#00e5ff;">🔊 ${t('speak')}</button>
            <button class="ab-btn primary" id="ab-info-ai-btn">🤖 ${t('ask_ai')}</button>
          </div>
          <button class="ab-btn ghost" style="width:100%;" onclick="document.getElementById('ab-info-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>

      <div class="ab-modal-overlay" id="ab-ai-modal">
        <div class="ab-modal">
          <h3>🤖 HalDo KI Assistent</h3>
          <p id="ab-ai-text">Analysiere...</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-bottom:15px;">
            <button class="ab-btn" id="ab-ai-tts-btn" style="background:rgba(0,229,255,0.1);border-color:#00e5ff;color:#00e5ff;">🔊 ${t('ai_listen')}</button>
            <button class="ab-btn primary" style="width:100%;" onclick="document.getElementById('ab-ai-modal').classList.remove('show')">${t('close')}</button>
          </div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 7. UTILS
  // ═══════════════════════════════════════════════════════
  function showOrganModal(organ, info, icon) {
    const modal = document.getElementById('ab-info-modal');
    if (!modal) return;
    document.getElementById('ab-info-icon').textContent = icon || '🫀';
    document.getElementById('ab-info-title').textContent = organ;
    document.getElementById('ab-info-desc').textContent = info;
    document.getElementById('ab-info-tts-btn').onclick = () => speakText(organ + '. ' + info);
    document.getElementById('ab-info-ai-btn').onclick = () => askAI('Erkläre medizinisch: ' + organ + '. ' + info);
    modal.classList.add('show');
  }

  // ═══════════════════════════════════════════════════════
  // 8. EVENT HANDLERS
  // ═══════════════════════════════════════════════════════
  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'enter-app') { state.currentView = 'dashboard'; updateView(); return; }

    if (action === 'view-anatomy') { state.currentView = 'anatomy'; updateView(); return; }
    if (action === 'view-dashboard') { state.currentView = 'dashboard'; updateView(); return; }
    if (action === 'view-ki-tools') { state.currentView = 'ki-tools'; updateView(); return; }
    if (action === 'view-diseases') { state.currentView = 'diseases'; updateView(); return; }
    if (action === 'view-meds') { state.currentView = 'meds'; updateView(); return; }
    if (action === 'view-natural') { state.currentView = 'natural'; updateView(); return; }
    if (action === 'view-labs') { state.currentView = 'labs'; updateView(); return; }
    if (action === 'view-hospitals') { state.currentView = 'hospitals'; updateView(); return; }
    if (action === 'view-devices') { state.currentView = 'devices'; updateView(); return; }
    if (action === 'view-sicknotes') { state.currentView = 'sicknotes'; updateView(); return; }
    if (action === 'view-appointments') { state.currentView = 'appointments'; updateView(); return; }
    if (action === 'view-emergency') { state.currentView = 'emergency'; updateView(); return; }
    if (action === 'view-settings') { state.currentView = 'settings'; updateView(); return; }

    if (action === 'ki-action') {
      const type = btn.dataset.type;
      const input = document.getElementById('ki-text').value;
      if (!input) { alert('Bitte Text eingeben!'); return; }
      const resultBox = document.getElementById('ki-result'), resultText = document.getElementById('ki-result-text');
      resultBox.style.display = 'block'; resultText.innerHTML = `<span style="color:#00e5ff;">${t('ai_thinking')}</span>`;
      setTimeout(() => {
        let res = "";
        if (window.HalDoAI && typeof window.HalDoAI.generate === 'function') {
          res = window.HalDoAI.generate(type + ": " + input);
        } else {
          res = type === 'analyze' ? "🧠 Analyse: Symptome deuten auf leichte Infektion hin." : "✅ Text wurde verarbeitet.";
        }
        resultText.innerHTML = res;
        speakText(res);
      }, 1000);
      return;
    }

    if (action === 'open-organ-info') { showOrganModal(btn.dataset.organ, btn.dataset.info, btn.dataset.icon); return; }

    if (['open-disease', 'open-med', 'open-first-aid', 'open-device', 'open-lab', 'open-natural'].includes(action)) {
      let icon = btn.dataset.icon || '🦠', title = '', desc = '';
      if (action === 'open-disease') { title = btn.dataset.name; desc = `Symptome: ${btn.dataset.symp}. Behandlung: ${btn.dataset.tr}`; }
      if (action === 'open-med') { title = btn.dataset.name; desc = `Anwendung: ${btn.dataset.use}. Dosierung: ${btn.dataset.dose}`; }
      if (action === 'open-first-aid') { title = btn.dataset.title; desc = btn.dataset.desc; }
      if (action === 'open-lab') { title = btn.dataset.name; desc = `${t('reference')}: ${btn.dataset.ref}. ${btn.dataset.desc}`; }
      if (action === 'open-natural') { title = btn.dataset.name; desc = btn.dataset.desc; }
      if (action === 'open-device') { const d = state.devices[parseInt(btn.dataset.idx)]; title = d.name; desc = d.desc; icon = d.icon; }
      
      document.getElementById('ab-info-icon').textContent = icon;
      document.getElementById('ab-info-title').textContent = title;
      document.getElementById('ab-info-desc').textContent = desc;
      document.getElementById('ab-info-tts-btn').onclick = () => speakText(`${title}. ${desc}`);
      document.getElementById('ab-info-ai-btn').onclick = () => askAI(`Erkläre mehr über ${title}. ${desc}`);
      document.getElementById('ab-info-modal').classList.add('show');
      return;
    }

    if (action === 'toggle-hotspot') { state.hotspot.active = !state.hotspot.active; saveState(); updateView(); return; }
    if (action === 'gen-hotspot-pass') {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
      let pass = "";
      for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      state.hotspot.pass = pass;
      saveState(); updateView();
      return;
    }
    if (action === 'connect-device') { const idx = parseInt(btn.dataset.idx); state.devices[idx].connected = !state.devices[idx].connected; saveState(); updateView(); return; }

    if (action === 'generate-au') {
      const name = document.getElementById('au-name').value, diag = document.getElementById('au-diag').value, from = document.getElementById('au-from').value, to = document.getElementById('au-to').value;
      if (!name || !diag || !from || !to) { alert('Bitte alle Felder ausfüllen!'); return; }
      state.sickNotes.push({ name, diag, from, to }); saveState(); updateView(); return;
    }
    if (action === 'del-au') { state.sickNotes.splice(parseInt(btn.dataset.idx), 1); saveState(); updateView(); return; }
    
    if (action === 'add-app') {
      const doc = document.getElementById('app-doc').value, date = document.getElementById('app-date').value;
      if (!doc || !date) { alert('Bitte Arzt und Datum ausfüllen!'); return; }
      state.appointments.push({ doc, date }); saveState(); updateView(); return;
    }
    if (action === 'del-app') { state.appointments.splice(parseInt(btn.dataset.idx), 1); saveState(); updateView(); return; }

    if (action === 'toggle-tts') { state.ttsEnabled = !state.ttsEnabled; saveState(); updateView(); return; }
  }

  function handleInput(e) {
    if (e.target.id === 'ki-text') { state.kiText = e.target.value; return; }
    const act = e.target.dataset.action;
    if (!act || !act.startsWith('search-')) return;

    state.searchQuery = e.target.value;
    const container = document.querySelector('#ab-main-content .ab-card div:last-child');
    if (!container) return;
    let list = [];
    if (act === 'search-disease') list = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    if (act === 'search-med') list = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    if (act === 'search-natural') list = NATURAL.filter(n => n.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    if (act === 'search-lab') list = LABS.filter(l => l.name.toLowerCase().includes(state.searchQuery.toLowerCase()));

    const kind = act.split('-')[1];
    const html = list.map(item => `<div class="ab-list-item" data-action="open-${kind}" data-name="${item.name}" data-symp="${item.symp || ''}" data-tr="${item.tr || ''}" data-use="${item.use || ''}" data-dose="${item.dose || ''}" data-ref="${item.ref || ''}" data-desc="${item.desc || ''}" data-icon="🦠"><div><h4>${item.name}</h4><p>${item.symp || item.use || item.desc}</p></div></div>`).join('');
    container.innerHTML = html || `<p style="color:#888;text-align:center;">${t('no_results')}</p>`;
  }

  function handleChange(e) {
    if (e.target.dataset.action === 'set-lang') { state.lang = e.target.value; saveState(); updateView(); }
  }

  function updateView() {
    if (!currentTarget) return;
    
    if (state.currentView === 'splash') {
       currentTarget.innerHTML = renderMain();
       return;
    }

    const main = currentTarget.querySelector('#ab-main-content'), sidebar = currentTarget.querySelector('.ab-sidebar'), headerTitle = currentTarget.querySelector('.ab-header h1');
    
    if (main) {
      if (state.currentView === 'dashboard') main.innerHTML = renderDashboard();
      else if (state.currentView === 'anatomy') main.innerHTML = renderAnatomy();
      else if (state.currentView === 'ki-tools') main.innerHTML = renderKITools();
      else if (state.currentView === 'diseases') main.innerHTML = renderDiseases();
      else if (state.currentView === 'meds') main.innerHTML = renderMeds();
      else if (state.currentView === 'natural') main.innerHTML = renderNatural();
      else if (state.currentView === 'labs') main.innerHTML = renderLabs();
      else if (state.currentView === 'hospitals') main.innerHTML = renderHospitals();
      else if (state.currentView === 'devices') main.innerHTML = renderDevices();
      else if (state.currentView === 'sicknotes') main.innerHTML = renderSickNotes();
      else if (state.currentView === 'appointments') main.innerHTML = renderAppointments();
      else if (state.currentView === 'emergency') main.innerHTML = renderEmergency();
      else if (state.currentView === 'settings') main.innerHTML = renderSettings();
    }
    
    if (sidebar) {
      sidebar.innerHTML = `
        <div class="ab-logo">🩺 HalDo Arztbuch <span>PRO MAX 3D</span></div>
        <div class="ab-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">📊</span> ${t('dashboard')}</div>
        <div class="ab-nav-item ${state.currentView === 'anatomy' ? 'active' : ''}" data-action="view-anatomy"><span class="icon">🧍‍♂️</span> ${t('anatomy')}</div>
        <div class="ab-nav-item ${state.currentView === 'ki-tools' ? 'active' : ''}" data-action="view-ki-tools"><span class="icon">🤖</span> ${t('ai_tools')}</div>
        <div class="ab-nav-item ${state.currentView === 'diseases' ? 'active' : ''}" data-action="view-diseases"><span class="icon">🦠</span> ${t('diseases')}</div>
        <div class="ab-nav-item ${state.currentView === 'meds' ? 'active' : ''}" data-action="view-meds"><span class="icon">💊</span> ${t('meds')}</div>
        <div class="ab-nav-item ${state.currentView === 'natural' ? 'active' : ''}" data-action="view-natural"><span class="icon">🌿</span> ${t('natural')}</div>
        <div class="ab-nav-item ${state.currentView === 'labs' ? 'active' : ''}" data-action="view-labs"><span class="icon">🧪</span> ${t('labs')}</div>
        <div class="ab-nav-item ${state.currentView === 'hospitals' ? 'active' : ''}" data-action="view-hospitals"><span class="icon">🏥</span> ${t('hospitals')}</div>
        <div class="ab-nav-item ${state.currentView === 'devices' ? 'active' : ''}" data-action="view-devices"><span class="icon">📡</span> ${t('devices')}</div>
        <div class="ab-nav-item ${state.currentView === 'sicknotes' ? 'active' : ''}" data-action="view-sicknotes"><span class="icon">📝</span> ${t('sicknotes')}</div>
        <div class="ab-nav-item ${state.currentView === 'appointments' ? 'active' : ''}" data-action="view-appointments"><span class="icon">📅</span> ${t('appointments')}</div>
        <div style="flex:1;"></div>
        <div class="ab-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> ${t('settings')}</div>
        <div class="ab-nav-item ${state.currentView === 'emergency' ? 'active' : ''}" data-action="view-emergency" style="color:#ff3333;"><span class="icon">🚨</span> ${t('emergency')}</div>
      `;
    }
    
    if (headerTitle) {
      headerTitle.textContent = state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'anatomy' ? t('anatomy') : state.currentView === 'ki-tools' ? t('ai_tools') : state.currentView === 'diseases' ? t('diseases') : state.currentView === 'meds' ? t('meds') : state.currentView === 'natural' ? t('natural') : state.currentView === 'labs' ? t('labs') : state.currentView === 'hospitals' ? t('hospitals') : state.currentView === 'devices' ? t('devices') : state.currentView === 'sicknotes' ? t('sicknotes') : state.currentView === 'appointments' ? t('appointments') : state.currentView === 'settings' ? t('settings') : t('emergency');
    }
  }

  // ═══════════════════════════════════════════════════════
  // 9. MOUNT & EXPORT
  // ═══════════════════════════════════════════════════════
  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      currentTarget.innerHTML = renderMain();
      currentTarget.addEventListener('click', handleClick);
      currentTarget.addEventListener('input', handleInput);
      currentTarget.addEventListener('change', handleChange);
    }
  }

  function openOverlay() {
    loadState();
    
    setTimeout(() => {
      if (window.HalDoWelcome && typeof window.HalDoWelcome.show === 'function') {
        window.HalDoWelcome.show("Arztbuch");
      }
    }, 200);

    const overlay = document.createElement('div');
    // WICHTIG: z-index ist niedriger, damit dein OS-Fenstersystem darüber liegt.
    // Wenn die App im OS geöffnet wird, ist das hier nur der Fallback.
    overlay.className = 'ab-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;flex-direction:column;';
    
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;font-family:Inter;">🩺 HalDo Arztbuch PRO MAX 3D</b><button id="ab-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:Inter;">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    
    const mountDiv = document.createElement('div');
    mountDiv.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    overlay.appendChild(mountDiv);
    document.body.appendChild(overlay);
    
    document.getElementById('ab-close-btn').onclick = () => { 
      overlay.remove(); 
      currentTarget = null; 
    };
    mount(mountDiv);
  }

  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.renderArztbuch = mount;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — OS-FRIENDLY & REAL 3D ANATOMY');
})();
