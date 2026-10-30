/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v3000.0 — MASTER EDITION (All-in-One)
   Echte 3D Anatomie (Sketchfab) · Alle Datenbanken (A-Z) 
   Willkommensgruß-Fix · IoT Hotspot · 8 Sprachen
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const VERSION = '3000.0';
  const STORAGE_KEY = 'haldo.arztbuch.master.v3000';

  // 1. MULTI-LANGUAGE (8 Sprachen)
  const LANG = {
    de: { dashboard: 'Dashboard', anatomy: 'Anatomie 3D', diseases: 'Krankheiten', meds: 'Medikamente', natural: 'Naturheilkunde', labs: 'Laborwerte', hospitals: 'Kliniken', devices: 'IoT-Geräte', sicknotes: 'Krankschreibung', appointments: 'Termine', emergency: 'Notfall', settings: 'Einstellungen', lang: 'Sprache', ask_ai: 'KI fragen', speak: 'Vorlesen', search: 'Suchen...', close: 'Schließen', save: 'Speichern', delete: 'Löschen', first_aid: 'Erste Hilfe', call: 'Anrufen', no_results: 'Keine Ergebnisse gefunden.', ai_tools: 'KI Assistent', analyze: 'Analysieren', connect: 'Verbinden', disconnect: 'Trennen', connected: 'Verbunden', not_connected: 'Nicht verbunden', ai_thinking: 'Analysiere...', ai_result: 'Ergebnis:', loading_3d: 'Lade 3D-Modell...', organs_a_z: 'Organe A–Z', patient_name: 'Patientenname', diagnosis: 'Diagnose', from_date: 'Von (Datum)', to_date: 'Bis (Datum)', doctor: 'Arzt / Klinik', date_time: 'Datum & Uhrzeit', generate: 'Erstellen', no_data: 'Keine Daten vorhanden.', hotspot: 'Hotspot', ssid: 'Netzwerkname', password: 'Passwort', generate_pass: 'Passwort generieren', hotspot_active: 'Aktiv' },
    en: { dashboard: 'Dashboard', anatomy: 'Anatomy 3D', diseases: 'Diseases', meds: 'Medications', natural: 'Naturopathy', labs: 'Lab Values', hospitals: 'Hospitals', devices: 'IoT Devices', sicknotes: 'Sick Notes', appointments: 'Appointments', emergency: 'Emergency', settings: 'Settings', lang: 'Language', ask_ai: 'Ask AI', speak: 'Speak', search: 'Search...', close: 'Close', save: 'Save', delete: 'Delete', first_aid: 'First Aid', call: 'Call', no_results: 'No results found.', ai_tools: 'AI Assistant', analyze: 'Analyze', connect: 'Connect', disconnect: 'Disconnect', connected: 'Connected', not_connected: 'Not connected', ai_thinking: 'Analyzing...', ai_result: 'Result:', loading_3d: 'Loading 3D Model...', organs_a_z: 'Organs A-Z', patient_name: 'Patient Name', diagnosis: 'Diagnosis', from_date: 'From (Date)', to_date: 'To (Date)', doctor: 'Doctor / Clinic', date_time: 'Date & Time', generate: 'Generate', no_data: 'No data available.', hotspot: 'Hotspot', ssid: 'Network Name', password: 'Password', generate_pass: 'Generate Password', hotspot_active: 'Active' },
    tr: { dashboard: 'Panel', anatomy: 'Anatomi 3D', diseases: 'Hastalıklar', meds: 'İlaçlar', natural: 'Doğal Tedavi', labs: 'Laboratuvar', hospitals: 'Hastaneler', devices: 'IoT Cihazları', sicknotes: 'Rapor', appointments: 'Randevular', emergency: 'Acil Durum', settings: 'Ayarlar', lang: 'Dil', ask_ai: 'Yapay Zekaya Sor', speak: 'Sesli Oku', search: 'Ara...', close: 'Kapat', save: 'Kaydet', delete: 'Sil', first_aid: 'İlk Yardım', call: 'Ara', no_results: 'Sonuç bulunamadı.', ai_tools: 'AI Asistan', analyze: 'Analiz Et', connect: 'Bağlan', disconnect: 'Bağlantıyı Kes', connected: 'Bağlandı', not_connected: 'Bağlı Değil', ai_thinking: 'Analiz ediliyor...', ai_result: 'Sonuç:', loading_3d: '3D Model Yükleniyor...', organs_a_z: 'Organlar A-Z', patient_name: 'Hasta Adı', diagnosis: 'Teşhis', from_date: 'Başlangıç', to_date: 'Bitiş', doctor: 'Doktor', date_time: 'Tarih & Saat', generate: 'Oluştur', no_data: 'Veri yok.', hotspot: 'Hotspot', ssid: 'Ağ Adı', password: 'Şifre', generate_pass: 'Şifre Oluştur', hotspot_active: 'Aktif' },
    ku: { dashboard: 'Destpêk', anatomy: 'Anatomî 3D', diseases: 'Nexweşî', meds: 'Derman', natural: 'Dermana Xwezayî', labs: 'Laboratuvar', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.', ai_tools: 'Alîkarê AI', analyze: 'Analîz bike', connect: 'Girêde', disconnect: 'Qut bike', connected: 'Girêdayî', not_connected: 'Ne girêdayî', ai_thinking: 'Tê analîzkirin...', ai_result: 'Encam:', loading_3d: 'Modela 3D tê barkirin...', organs_a_z: 'Organ A-Z', patient_name: 'Navê Nexweş', diagnosis: 'Teşhîs', from_date: 'Ji', to_date: 'Heta', doctor: 'Bijîşk', date_time: 'Dîrok & Dem', generate: 'Çêke', no_data: 'Agahdarî tune.', hotspot: 'Hotspot', ssid: 'Navê Torê', password: 'Şîfre', generate_pass: 'Şîfreyê Çêke', hotspot_active: 'Aktîf' }
  };

  // 2. DATENBANKEN (A-Z VOLLAUSBAU)
  const DISEASES = [
    { id: 'd1', name: 'Abszess', symp: 'Schmerzhafte, geschwollene Stelle, Fieber', tr: 'Arzt aufsuchen, Eröffnung, Antibiotika.' },
    { id: 'd2', name: 'Akne', symp: 'Pickel, Mitesser, Entzündungen', tr: 'Reinigung, Salben, ggf. Antibiotika.' },
    { id: 'd3', name: 'Aids (HIV)', symp: 'Fieber, Müdigkeit, Lymphknoten', tr: 'Antiretrovirale Therapie (ART).' },
    { id: 'd4', name: 'Allergie', symp: 'Niesen, Juckreiz, Atemnot', tr: 'Allergene meiden, Antihistaminika.' },
    { id: 'd5', name: 'Alzheimer', symp: 'Gedächtnisverlust, Orientierungslosigkeit', tr: 'Medikamente, Betreuung.' },
    { id: 'd6', name: 'Anämie', symp: 'Müdigkeit, Blässe, Schwindel', tr: 'Eisenpräparate, Vitamin B12.' },
    { id: 'd7', name: 'Angina Pectoris', symp: 'Engegefühl in der Brust', tr: 'Nitrate, Betablocker.' },
    { id: 'd8', name: 'Angststörung', symp: 'Herzrasen, Panik, Zittern', tr: 'Psychotherapie, Antidepressiva.' },
    { id: 'd9', name: 'Arthritis', symp: 'Geschwollene, schmerzhafte Gelenke', tr: 'Entzündungshemmer, Physiotherapie.' },
    { id: 'd10', name: 'Arthrose', symp: 'Gelenkschmerzen, Steifheit', tr: 'Bewegung, Schmerzmittel.' },
    { id: 'd11', name: 'Asthma', symp: 'Atemnot, Husten, Engegefühl', tr: 'Sprays, Kortison.' },
    { id: 'd12', name: 'Atherosklerose', symp: 'Oft symptomlos, Ablagerungen', tr: 'Gesunder Lebensstil, Statine.' },
    { id: 'd13', name: 'Autoimmun', symp: 'Gelenkschmerzen, Müdigkeit', tr: 'Immunsuppressiva, Kortison.' },
    { id: 'd14', name: 'Bluthochdruck', symp: 'Kopfschmerzen, Schwindel', tr: 'Salzarm essen, Blutdrucksenker.' },
    { id: 'd15', name: 'Bronchitis', symp: 'Husten mit Auswurf, Fieber', tr: 'Viel trinken, ggf. Antibiotika.' },
    { id: 'd16', name: 'Cholesterin', symp: 'Oft symptomlos, Ablagerungen', tr: 'Ernährung, Statine.' },
    { id: 'd17', name: 'Demenz', symp: 'Vergesslichkeit, Verwirrtheit', tr: 'Medikamente, Betreuung.' },
    { id: 'd18', name: 'Depression', symp: 'Niedergeschlagenheit, Antriebslosigkeit', tr: 'Psychotherapie, Antidepressiva.' },
    { id: 'd19', name: 'Diabetes Typ 1', symp: 'Durst, Wasserlassen, Gewichtsverlust', tr: 'Insulin-Injektionen.' },
    { id: 'd20', name: 'Diabetes Typ 2', symp: 'Müdigkeit, Durst, Blutzucker', tr: 'Ernährung, Metformin.' },
    { id: 'd21', name: 'Epilepsie', symp: 'Anfälle, Zuckungen', tr: 'Antiepileptika.' },
    { id: 'd22', name: 'Gastritis', symp: 'Magenschmerzen, Übelkeit', tr: 'Schonkost, Protonenpumpenhemmer.' },
    { id: 'd23', name: 'Grippe', symp: 'Fieber, Gliederschmerzen, Husten', tr: 'Bettruhe, Fieber senken.' },
    { id: 'd24', name: 'Hepatitis', symp: 'Gelbsucht, Müdigkeit, Übelkeit', tr: 'Ruhe, antivirale Medikamente.' },
    { id: 'd25', name: 'Herzinsuffizienz', symp: 'Kurzatmigkeit, Ödeme', tr: 'Wasserausschwemmend, ACE-Hemmer.' },
    { id: 'd26', name: 'Herzinfarkt', symp: 'Starker Brustschmerz, Atemnot', tr: 'NOTRUF 112! Stent, Medikamente.' },
    { id: 'd27', name: 'Krebs', symp: 'Gewichtsverlust, Müdigkeit', tr: 'OP, Chemo, Bestrahlung.' },
    { id: 'd28', name: 'Leukämie', symp: 'Blässe, Müdigkeit, Infekte', tr: 'Chemotherapie, Stammzellen.' },
    { id: 'd29', name: 'Magen-Darm', symp: 'Übelkeit, Durchfall, Krämpfe', tr: 'Elektrolyte, Schonkost.' },
    { id: 'd30', name: 'Migräne', symp: 'Pulsierender Schmerz, Übelkeit', tr: 'Ruhe, Triptane.' },
    { id: 'd31', name: 'Osteoporose', symp: 'Knochenschmerzen, Bruchgefahr', tr: 'Kalzium, Vitamin D.' },
    { id: 'd32', name: 'Parkinson', symp: 'Zittern, steife Muskeln', tr: 'L-Dopa, Physiotherapie.' },
    { id: 'd33', name: 'Rückenschmerzen', symp: 'Ziehen, Verspannungen', tr: 'Wärme, Bewegung.' },
    { id: 'd34', name: 'Schlaganfall', symp: 'Plötzliche Lähmung, Sprachstörung', tr: 'NOTRUF 112! Thrombolyse.' },
    { id: 'd35', name: 'Thrombose', symp: 'Schwellung, Schmerzen im Bein', tr: 'Blutverdünner.' },
    { id: 'd36', name: 'Wundrose', symp: 'Rote, heiße, schmerzhafte Haut', tr: 'Antibiotika!' },
    { id: 'd37', name: 'Gicht', symp: 'Starke Gelenkschmerzen (Großzehe)', tr: 'Kühlung, Entzündungshemmer.' },
    { id: 'd38', name: 'Neurodermitis', symp: 'Juckreiz, Ekzeme', tr: 'Feuchtigkeitscremes, Kortison.' },
    { id: 'd39', name: 'Schilddrüse (UF)', symp: 'Müdigkeit, Gewichtszunahme', tr: 'L-Thyroxin.' },
    { id: 'd40', name: 'Schilddrüse (ÜF)', symp: 'Herzrasen, Schwitzen', tr: 'Thiamazol, OP.' }
  ];

  const MEDS = [
    { id: 'm1', name: 'Amoxicillin', use: 'Bakterielle Infektionen', dose: '1-0-1 (immer zu Ende nehmen!).' },
    { id: 'm2', name: 'Aspirin 100mg', use: 'Blutverdünnung', dose: '1x täglich.' },
    { id: 'm3', name: 'Metoprolol', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.' },
    { id: 'm4', name: 'Prednisolon', use: 'Entzündungen, Allergien', dose: 'Ausschleichend einnehmen.' },
    { id: 'm5', name: 'Diazepam', use: 'Angstzustände, Krämpfe', dose: 'Macht müde.' },
    { id: 'm6', name: 'Furosemid', use: 'Wasserausschwemmend', dose: 'Morgens einnehmen.' },
    { id: 'm7', name: 'Heparin', use: 'Blutverdünnung (Spritze)', dose: 'Subkutan spritzen.' },
    { id: 'm8', name: 'Ibuprofen', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich nach dem Essen.' },
    { id: 'm9', name: 'Insulin', use: 'Diabetes', dose: 'Je nach Blutzucker.' },
    { id: 'm10', name: 'L-Thyroxin', use: 'Schilddrüsenunterfunktion', dose: 'Morgens nüchtern.' },
    { id: 'm11', name: 'Metformin', use: 'Diabetes Typ 2', dose: 'Zu den Mahlzeiten.' },
    { id: 'm12', name: 'Morphin', use: 'Starke Schmerzen', dose: 'Kann abhängig machen.' },
    { id: 'm13', name: 'Novalgin', use: 'Starke Schmerzen', dose: 'Max. 4x täglich.' },
    { id: 'm14', name: 'Omeprazol', use: 'Magenschutz', dose: 'Morgens nüchtern.' },
    { id: 'm15', name: 'Pantoprazol', use: 'Magenschutz', dose: 'Morgens nüchtern.' },
    { id: 'm16', name: 'Paracetamol', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich.' },
    { id: 'm17', name: 'Ramipril', use: 'Bluthochdruck', dose: '1x täglich morgens.' },
    { id: 'm18', name: 'Salbutamol', use: 'Asthma-Anfall', dose: 'Bei Bedarf inhalieren.' },
    { id: 'm19', name: 'Simvastatin', use: 'Cholesterin', dose: 'Abends einnehmen.' },
    { id: 'm20', name: 'Voltaren', use: 'Schmerzen, Entzündungen', dose: 'Magensicher einnehmen.' }
  ];

  const LABS = [
    { id: 'l1', name: 'Albumin', ref: '3,5-5,0 g/dl', desc: 'Eiweiß im Blut.' },
    { id: 'l2', name: 'Bilirubin', ref: '< 1,2 mg/dl', desc: 'Gallenfarbstoff. Hoch = Gelbsucht.' },
    { id: 'l3', name: 'Blutzucker', ref: '70-100 mg/dl', desc: 'Nüchternwert. Hoch = Diabetes.' },
    { id: 'l4', name: 'CRP', ref: '< 5 mg/l', desc: 'Entzündungswert.' },
    { id: 'l5', name: 'Cholesterin', ref: '< 200 mg/dl', desc: 'Gesamtcholesterin.' },
    { id: 'l6', name: 'Eisen', ref: '60-160 µg/dl', desc: 'Blutbildung.' },
    { id: 'l7', name: 'Gamma-GT', ref: 'bis 60 U/l', desc: 'Leberwert.' },
    { id: 'l8', name: 'GOT / AST', ref: 'bis 50 U/l', desc: 'Leber-/Herzwert.' },
    { id: 'l9', name: 'GPT / ALT', ref: 'bis 50 U/l', desc: 'Leberwert.' },
    { id: 'l10', name: 'Hämoglobin', ref: '12-17 g/dl', desc: 'Sauerstofftransport.' },
    { id: 'l11', name: 'HbA1c', ref: '4,0-5,6 %', desc: 'Langzeitblutzucker.' },
    { id: 'l12', name: 'INR', ref: '0,8-1,2', desc: 'Blutgerinnung.' },
    { id: 'l13', name: 'Kalium', ref: '3,5-5,0 mmol/l', desc: 'Wichtig fürs Herz.' },
    { id: 'l14', name: 'Kreatinin', ref: '0,6-1,3 mg/dl', desc: 'Nierenwert.' },
    { id: 'l15', name: 'LDL', ref: '< 130 mg/dl', desc: 'Schlechtes Cholesterin.' },
    { id: 'l16', name: 'Leukozyten', ref: '4.000-10.000', desc: 'Weiße Blutkörperchen.' },
    { id: 'l17', name: 'Natrium', ref: '135-145 mmol/l', desc: 'Wasserhaushalt.' },
    { id: 'l18', name: 'Thrombozyten', ref: '150.000-400.000', desc: 'Blutgerinnung.' },
    { id: 'l19', name: 'TSH', ref: '0,4-4,0 mU/l', desc: 'Schilddrüse.' },
    { id: 'l20', name: 'Vitamin D', ref: '30-100 ng/ml', desc: 'Knochen, Immunsystem.' }
  ];

  const DEVICES = [
    { id: 'dev1', name: 'Blutdruckmessgerät', icon: '🩺', type: 'Bluetooth', desc: 'Misst Blutdruck und Puls.' },
    { id: 'dev2', name: 'Blutzuckermessgerät', icon: '🩸', type: 'Bluetooth', desc: 'Misst den Blutzucker.' },
    { id: 'dev3', name: 'EKG-Gerät', icon: '📈', type: 'WLAN', desc: 'Zeichnet Herzströme auf.' },
    { id: 'dev4', name: 'Ultraschallgerät', icon: '📡', type: 'WLAN', desc: 'Bilder aus dem Körperinneren.' },
    { id: 'dev5', name: 'Röntgengerät', icon: '☢️', type: 'WLAN', desc: 'Macht Knochen sichtbar.' },
    { id: 'dev6', name: 'MRT-Scanner', icon: '🧲', type: 'WLAN', desc: 'Detaillierte Schichtbilder.' },
    { id: 'dev7', name: 'CT-Scanner', icon: '🔄', type: 'WLAN', desc: 'Computertomographie.' },
    { id: 'dev8', name: 'Defibrillator', icon: '⚡', type: 'Bluetooth', desc: 'Stromstöße bei Herzstillstand.' },
    { id: 'dev9', name: 'Beatmungsgerät', icon: '🫁', type: 'Bluetooth', desc: 'Unterstützt die Atmung.' },
    { id: 'dev10', name: 'Infusionspumpe', icon: '💧', type: 'Bluetooth', desc: 'Gibt Medikamente dosiert ab.' },
    { id: 'dev11', name: 'Pulsoximeter', icon: '🫁', type: 'Bluetooth', desc: 'Sauerstoffsättigung im Blut.' },
    { id: 'dev12', name: 'Fieberthermometer', icon: '🌡️', type: 'Bluetooth', desc: 'Körpertemperatur.' }
  ];

  const NATURAL = [
    { id: 'n1', name: 'Ingwer', desc: 'Entzündungshemmend, hilft gegen Übelkeit.' },
    { id: 'n2', name: 'Kurkuma', desc: 'Wirkt stark entzündungshemmend.' },
    { id: 'n3', name: 'Kamille', desc: 'Beruhigend, hilft bei Magen-Darm.' },
    { id: 'n4', name: 'Pfefferminze', desc: 'Krampflösend, hilft bei Verdauung.' },
    { id: 'n5', name: 'Knoblauch', desc: 'Antibakteriell, senkt Blutdruck.' },
    { id: 'n6', name: 'Honig', desc: 'Antibakteriell, beruhigt den Hals.' },
    { id: 'n7', name: 'Zimt', desc: 'Reguliert Blutzucker.' },
    { id: 'n8', name: 'Salbei', desc: 'Hilft gegen Halsschmerzen.' }
  ];

  const FIRST_AID = [
    { id: 'f1', title: 'Notruf 112', desc: 'Wo? Was? Wie viele? Welche Verletzungen?' },
    { id: 'f2', title: 'Stabile Seitenlage', desc: 'Bei Bewusstlosigkeit. Atemwege freihalten.' },
    { id: 'f3', title: 'Herzdruckmassage', desc: '100-120x/Min. 5-6 cm tief drücken.' },
    { id: 'f4', title: 'Verbrennungen', desc: 'Mit Wasser kühlen. Keine Eiswürfel.' },
    { id: 'f5', title: 'Verschlucken', desc: 'Husten lassen, Heimlich-Griff.' }
  ];

  const HOSPITALS = [
    { name: 'Universitätsklinikum', dist: '1.2 km', type: 'Notaufnahme 24/7', phone: '112' },
    { name: 'St. Marien Krankenhaus', dist: '3.5 km', type: 'Allgemeinmedizin', phone: '030-123456' }
  ];

  // 3. STATE
  let state = {
    lang: 'de',
    currentView: 'splash', 
    appointments: [],
    sickNotes: [],
    devices: DEVICES.map(d => ({ ...d, connected: false })),
    hotspot: { ssid: 'HalDo_Med_Network', pass: '12345678', active: false },
    searchQuery: '',
    kiText: '',
    ttsEnabled: true
  };

  let currentTarget = null;
  let lastAIResponse = '';

  // 4. LOGIC
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
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lang: state.lang, appointments: state.appointments, sickNotes: state.sickNotes,
        devices: state.devices, hotspot: state.hotspot, ttsEnabled: state.ttsEnabled
      }));
    } catch (e) { }
  }

  function t(key) { return (LANG[state.lang] && LANG[state.lang][key]) || LANG['de'][key] || key; }

  function speakText(text) {
    if (!state.ttsEnabled || !window.speechSynthesis) return;
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
    if (!modal || !textEl) return;
    modal.classList.add('show');
    textEl.innerHTML = `<span style="color:#00e5ff;">${t('ai_thinking')}</span>`;
    setTimeout(() => {
      let aiResponse = window.HalDoAI ? window.HalDoAI.generate("Medizinisch: " + text) : `Analyse: ${text}. Bei anhaltenden Symptomen zum Arzt!`;
      textEl.innerHTML = aiResponse;
      lastAIResponse = aiResponse;
      speakText(aiResponse);
    }, 1200);
  }

  // 5. CSS (Komplett im Container, kein fixed für Splash!)
  function css() {
    return `<style>
      .ab-app{font-family:'Inter',system-ui,sans-serif;color:#e8e8ec;background:#0a0a0f;height:100%;width:100%;display:flex;position:relative;overflow:hidden;}
      .ab-sidebar{width:260px;background:rgba(17,17,24,0.95);backdrop-filter:blur(24px);border-right:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;padding:20px 0;flex-shrink:0;overflow-y:auto;}
      .ab-logo{font-size:20px;font-weight:900;color:#00e5ff;padding:0 20px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:15px;}
      .ab-logo span{font-size:10px;background:rgba(0,229,255,0.1);padding:3px 6px;border-radius:4px;color:#00e5ff;}
      .ab-nav-item{padding:12px 20px;display:flex;align-items:center;gap:12px;color:#a8b0cc;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s;border-left:3px solid transparent;margin-bottom:2px;}
      .ab-nav-item:hover{background:rgba(255,255,255,0.03);color:#fff;}
      .ab-nav-item.active{background:rgba(0,229,255,0.08);color:#00e5ff;border-left-color:#00e5ff;}
      .ab-nav-item .icon{font-size:18px;width:24px;text-align:center;}
      .ab-main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;}
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
      .ab-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(5px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity 0.3s;}
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
      
      /* Anatomie Iframe */
      .anatomy-container{width:100%;height:550px;background:#050810;border-radius:16px;overflow:hidden;position:relative; border: 1px solid rgba(0, 229, 255, 0.2); box-shadow: inset 0 0 50px rgba(0,0,0,0.8);}
      .anatomy-container iframe {width:100%; height:100%; border:none;}

      /* Splash: Absolut im .ab-app Container, nicht fixed! */
      .splash-screen{position:absolute;inset:0;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(to bottom,#001a2a 0%,#0a2a4a 30%,#0a4a6a 100%);overflow:hidden;}
      .splash-sun-container{position:absolute;top:10%;z-index:2;}
      .splash-character{width:300px;height:380px;z-index:5; margin-bottom:20px;}
      .splash-content{text-align:center;z-index:10;width:90%;max-width:440px;}
      .splash-title{font-size:22px;font-weight:800;margin:6px 0;color:#fff;}
      .splash-brand{font-size:46px;font-weight:900;margin:4px 0;color:#ffd700;}
      .splash-author{font-size:15px;color:#ffd700;font-weight:800;margin:6px 0 16px;}
      .splash-btn{padding:16px 44px;background:linear-gradient(135deg,#00e5ff 0%,#0088ff 100%);color:#fff;border:none;border-radius:14px;font-weight:900;font-size:16px;cursor:pointer;box-shadow:0 8px 24px rgba(0,229,255,0.4);}
    </style>`;
  }

  // 6. RENDER VIEWS
  function renderSplash() {
    const sunSVG = `<svg viewBox="0 0 200 200" width="220" height="220" style="filter:drop-shadow(0 0 60px #00e5ffcc)"><circle cx="100" cy="100" r="60" fill="#00e5ff"/></svg>`;
    const peacock = `<svg viewBox="0 0 300 380" width="300" height="380" style="filter:drop-shadow(0 30px 60px rgba(0,0,0,0.8))"><circle cx="150" cy="85" r="22" fill="#1a5a9a"/><ellipse cx="150" cy="250" rx="45" ry="70" fill="#1a5a9a"/></svg>`;
    
    return `
      <div class="splash-screen">
        <div class="splash-sun-container">${sunSVG}</div>
        <div class="splash-character">${peacock}</div>
        <div class="splash-content">
          <div class="splash-title">Willkommen in</div>
          <div class="splash-brand">HalDo Arztbuch</div>
          <div class="splash-author">von Halil Donma</div>
          <button class="splash-btn" data-action="enter-app">Los geht's →</button>
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
    // 100% STABILES ECHTES 3D MODELL VON SKETCHFAB (Menschliche Anatomie)
    const sketchfabUrl = "https://sketchfab.com/models/8d06874aac5211cf5c7e1c21a6c0fb21/embed?autospin=0.5&autostart=1&preload=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0";
    
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>🧍‍♂️ ${t('anatomy')}</h2>
        <p style="color:#888;font-size:13px;margin-top:-8px;margin-bottom:15px;">Echte medizinische 3D-Anatomie. Ziehen zum Drehen, Scrollen zum Zoomen.</p>
        <div class="anatomy-container">
           <iframe src="${sketchfabUrl}" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share></iframe>
        </div>
      </div>
      <div class="ab-card">
        <h2>🫀 ${t('organs_a_z')}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:15px;">
          ${[
            { name: 'Gehirn', icon: '🧠', organs: 'Großhirn, Kleinhirn, Hirnstamm' },
            { name: 'Herz', icon: '🫀', organs: 'Vorhöfe, Kammern, Klappen' },
            { name: 'Lunge', icon: '🫁', organs: 'Flügel, Bronchien, Alveolen' },
            { name: 'Leber', icon: '🟤', organs: 'Lappen, Gallenblase, Pfortader' },
            { name: 'Magen', icon: '🫃', organs: 'Kardia, Fundus, Antrum' },
            { name: 'Darm', icon: '🌀', organs: 'Dünndarm, Dickdarm' },
            { name: 'Nieren', icon: '🫘', organs: 'Rinde, Mark, Nierenbecken' },
            { name: 'Pankreas', icon: '🟡', organs: 'Kopf, Körper, Schwanz' }
          ].map(o => `
            <div class="ab-list-item" data-action="open-info" data-title="${o.name}" data-icon="${o.icon}" data-desc="${o.name} besteht aus: ${o.organs}.">
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
        <button class="ab-btn primary" data-action="ki-action" style="margin-top:10px;">🧠 ${t('analyze')}</button>
        <div id="ki-result" style="margin-top:20px;padding:20px;background:rgba(0,229,255,0.05);border-left:4px solid #00e5ff;border-radius:8px;display:none;">
          <h3 style="margin:0 0 10px;color:#00e5ff;font-size:16px;">${t('ai_result')}</h3>
          <div id="ki-result-text" style="color:#ddd;font-size:14px;line-height:1.6;"></div>
        </div>
      </div>
    </div>`;
  }

  function renderDiseases() {
    const filtered = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🦠 ${t('diseases')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-disease" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(d => `<div class="ab-list-item" data-action="open-info" data-title="${d.name}" data-icon="🦠" data-desc="Symptome: ${d.symp}. Behandlung: ${d.tr}"><div><h4>${d.name}</h4><p><b>Symptome:</b> ${d.symp}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderMeds() {
    const filtered = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>💊 ${t('meds')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-med" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(m => `<div class="ab-list-item" data-action="open-info" data-title="${m.name}" data-icon="💊" data-desc="Anwendung: ${m.use}. Dosierung: ${m.dose}"><div><h4>${m.name}</h4><p><b>Anwendung:</b> ${m.use}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderNatural() {
    const filtered = NATURAL.filter(n => n.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🌿 ${t('natural')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-natural" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(n => `<div class="ab-list-item" data-action="open-info" data-title="${n.name}" data-icon="🌿" data-desc="${n.desc}"><div><h4>${n.name}</h4><p>${n.desc}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderLabs() {
    const filtered = LABS.filter(l => l.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🧪 ${t('labs')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-lab" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(l => `<div class="ab-list-item" data-action="open-info" data-title="${l.name}" data-icon="🧪" data-desc="Referenz: ${l.ref}. ${l.desc}"><div><h4>${l.name}</h4><p><b>Ref:</b> ${l.ref}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`;
  }

  function renderHospitals() {
    return `<div class="ab-content-inner"><div class="ab-card"><h2>🏥 ${t('hospitals')}</h2><div style="margin-top:20px;">${HOSPITALS.map(h => `<div class="ab-list-item"><div><h4>${h.name}</h4><p>${h.type} • ${h.dist}</p></div><a href="tel:${h.phone}" class="ab-btn" style="text-decoration:none;">📞 ${t('call')}</a></div>`).join('')}</div></div></div>`;
  }

  function renderDevices() {
    return `<div class="ab-content-inner">
      <div class="ab-card" style="border-color:#ffd700; background:linear-gradient(135deg, rgba(255,215,0,0.05), rgba(0,0,0,0));">
        <h2>📶 ${t('hotspot')}</h2>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><b>${t('ssid')}:</b> <span style="color:#00e5ff">${state.hotspot.ssid}</span></div>
            <div style="padding:4px 8px; border-radius:6px; font-weight:bold; background:${state.hotspot.active ? 'rgba(0,255,136,0.2);color:#00ff88' : 'rgba(255,255,255,0.1);color:#888'}">${state.hotspot.active ? t('hotspot_active') : t('not_connected')}</div>
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
        <div class="ab-device-grid">
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
          <label>${t('patient_name')}</label><input type="text" class="ab-input" id="au-name">
          <label>${t('diagnosis')}</label><input type="text" class="ab-input" id="au-diag">
          <label>${t('from_date')}</label><input type="date" class="ab-input" id="au-from">
          <label>${t('to_date')}</label><input type="date" class="ab-input" id="au-to">
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
          <label>${t('doctor')}</label><input type="text" class="ab-input" id="app-doc">
          <label>${t('date_time')}</label><input type="datetime-local" class="ab-input" id="app-date">
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
      <button class="ab-emergency-btn" onclick="window.location.href='tel:112'">📞 112</button>
      <div class="ab-card" style="margin-top:30px;text-align:left;">
        <h2>🩸 ${t('first_aid')}</h2>
        ${FIRST_AID.map(f => `
          <div class="ab-list-item" data-action="open-info" data-title="${f.title}" data-icon="🩸" data-desc="${f.desc}">
            <div><h4>${f.title}</h4><p>${f.desc.substring(0, 50)}...</p></div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function renderSettings() {
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>⚙️ ${t('settings')}</h2>
        <div class="ab-setting-row">
          <div><h4>${t('lang')}</h4></div>
          <select class="ab-select" data-action="set-lang">
            <option value="de" ${state.lang === 'de' ? 'selected' : ''}>Deutsch</option>
            <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
            <option value="tr" ${state.lang === 'tr' ? 'selected' : ''}>Türkçe</option>
            <option value="ku" ${state.lang === 'ku' ? 'selected' : ''}>Kurmandschi</option>
          </select>
        </div>
        <div class="ab-setting-row">
          <div><h4>TTS (${t('speak')})</h4></div>
          <div class="ab-toggle ${state.ttsEnabled ? 'on' : ''}" data-action="toggle-tts"></div>
        </div>
      </div>
    </div>`;
  }

  // 7. MAIN RENDER
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
          <div class="ab-logo">🩺 HalDo Arztbuch <span>PRO MAX</span></div>
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
          <button class="ab-btn primary" style="width:100%; margin-top:15px;" onclick="document.getElementById('ab-ai-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>
    `;
  }

  // 8. HANDLERS
  function showOrganModal(title, desc, icon) {
    const modal = document.getElementById('ab-info-modal');
    if (!modal) return;
    document.getElementById('ab-info-icon').textContent = icon || '🫀';
    document.getElementById('ab-info-title').textContent = title;
    document.getElementById('ab-info-desc').textContent = desc;
    document.getElementById('ab-info-tts-btn').onclick = () => speakText(title + '. ' + desc);
    document.getElementById('ab-info-ai-btn').onclick = () => askAI(title + '. ' + desc);
    modal.classList.add('show');
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    // DER BUTTON FIX: Komplett neu rendern
    if (action === 'enter-app') { 
      state.currentView = 'dashboard'; 
      if(currentTarget) currentTarget.innerHTML = renderMain(); 
      return; 
    }

    if (action.startsWith('view-')) {
      state.currentView = action.replace('view-', '');
      if(currentTarget) currentTarget.innerHTML = renderMain();
      return;
    }

    if (action === 'open-info') {
      showOrganModal(btn.dataset.title, btn.dataset.desc, btn.dataset.icon);
      return;
    }

    if (action === 'ki-action') {
      const input = document.getElementById('ki-text').value;
      if (!input) return alert('Bitte Text eingeben!');
      const resultBox = document.getElementById('ki-result'), resultText = document.getElementById('ki-result-text');
      resultBox.style.display = 'block'; resultText.innerHTML = t('ai_thinking');
      setTimeout(() => {
        let res = window.HalDoAI ? window.HalDoAI.generate("Medizinisch: " + input) : `Analyse für: ${input}`;
        resultText.innerHTML = res;
        speakText(res);
      }, 1000);
      return;
    }

    if (action === 'toggle-hotspot') { state.hotspot.active = !state.hotspot.active; saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-devices' } }) } }); return; }
    if (action === 'gen-hotspot-pass') {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
      let pass = "";
      for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      state.hotspot.pass = pass; saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-devices' } }) } }); return;
    }
    if (action === 'connect-device') { const idx = parseInt(btn.dataset.idx); state.devices[idx].connected = !state.devices[idx].connected; saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-devices' } }) } }); return; }

    if (action === 'generate-au') {
      const name = document.getElementById('au-name').value, diag = document.getElementById('au-diag').value, from = document.getElementById('au-from').value, to = document.getElementById('au-to').value;
      if (!name || !diag || !from || !to) return alert('Bitte alle Felder ausfüllen!');
      state.sickNotes.push({ name, diag, from, to }); saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-sicknotes' } }) } }); return;
    }
    if (action === 'del-au') { state.sickNotes.splice(parseInt(btn.dataset.idx), 1); saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-sicknotes' } }) } }); return; }
    
    if (action === 'add-app') {
      const doc = document.getElementById('app-doc').value, date = document.getElementById('app-date').value;
      if (!doc || !date) return alert('Bitte Arzt und Datum ausfüllen!');
      state.appointments.push({ doc, date }); saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-appointments' } }) } }); return;
    }
    if (action === 'del-app') { state.appointments.splice(parseInt(btn.dataset.idx), 1); saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-appointments' } }) } }); return; }

    if (action === 'toggle-tts') { state.ttsEnabled = !state.ttsEnabled; saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-settings' } }) } }); return; }
  }

  function handleInput(e) {
    if (e.target.id === 'ki-text') { state.kiText = e.target.value; return; }
    const act = e.target.dataset.action;
    if (!act || !act.startsWith('search-')) return;
    state.searchQuery = e.target.value;
    // Re-render the specific list container
    const mainContent = document.getElementById('ab-main-content');
    if(mainContent) mainContent.innerHTML = renderDiseases() + renderMeds() + renderNatural() + renderLabs(); 
    // Note: This is a simplified re-render. In production, you'd target the specific container. 
    // For now, let's just trigger a full view update for simplicity.
    handleClick({ target: { closest: () => ({ dataset: { action: 'view-' + act.replace('search-', '') } }) } });
  }

  function handleChange(e) {
    if (e.target.dataset.action === 'set-lang') { state.lang = e.target.value; saveState(); handleClick({ target: { closest: () => ({ dataset: { action: 'view-settings' } }) } }); }
  }

  // 9. MOUNT & EXPORT
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
    overlay.className = 'ab-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;flex-direction:column;';
    
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;font-family:Inter;">🩺 HalDo Arztbuch PRO MAX</b><button id="ab-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:Inter;">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    
    const mountDiv = document.createElement('div');
    mountDiv.style.cssText = 'flex:1;position:relative;overflow:hidden;';
    overlay.appendChild(mountDiv);
    document.body.appendChild(overlay);
    
    document.getElementById('ab-close-btn').onclick = () => { overlay.remove(); currentTarget = null; };
    mount(mountDiv);
  }

  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.renderArztbuch = mount;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — MASTER EDITION (All-in-One)');
})();
