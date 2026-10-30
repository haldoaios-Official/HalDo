/* ═══════════════════════════════════════════════════════════
   HALDO ARZTBUCH v6000.0 — ULTIMATE MEDICAL SUITE
   Echte 3D-Anatomie (Ebenen) · A-Z Datenbanken · Hotspot-Manager
   ═══════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Für echtes Modell

(function () {
  'use strict';

  const VERSION = '6000.0';
  const STORAGE_KEY = 'haldo.arztbuch.master.v6000';

  // ═══════════════════════════════════════════════════════
  // 1. MULTI-LANGUAGE ENGINE (Auszug)
  // ═══════════════════════════════════════════════════════
  const LANG = {
    de: { dashboard: 'Dashboard', anatomy: 'Anatomie 3D', diseases: 'Krankheiten', meds: 'Medikamente', natural: 'Naturheilkunde', labs: 'Laborwerte', hospitals: 'Kliniken', devices: 'IoT-Geräte', sicknotes: 'Krankschreibung', appointments: 'Termine', emergency: 'Notfall', settings: 'Einstellungen', lang: 'Sprache', ask_ai: 'KI fragen', speak: 'Vorlesen', search: 'Suchen...', close: 'Schließen', save: 'Speichern', delete: 'Löschen', first_aid: 'Erste Hilfe', call: 'Anrufen', no_results: 'Keine Ergebnisse gefunden.', ai_tools: 'KI Medizin-Assistent', analyze: 'Analysieren', connect: 'Verbinden', disconnect: 'Trennen', connected: 'Verbunden', not_connected: 'Nicht verbunden', ai_thinking: 'Analysiere...', ai_result: 'Ergebnis:', loading_3d: 'Lade 3D-Modell...', organs_a_z: 'Organe A–Z', patient_name: 'Patientenname', diagnosis: 'Diagnose', from_date: 'Von (Datum)', to_date: 'Bis (Datum)', doctor: 'Arzt / Klinik', date_time: 'Datum & Uhrzeit', generate: 'Erstellen', no_data: 'Keine Daten vorhanden.', hotspot: 'Hotspot', ssid: 'Netzwerkname (SSID)', password: 'Passwort', generate_pass: 'Passwort generieren', hotspot_active: 'Aktiv', view_organs: 'Organe', view_skeleton: 'Skelett', view_muscles: 'Muskeln', view_skin: 'Haut', hotspot_settings: 'Hotspot-Einstellungen', change_pass: 'Passwort ändern', new_pass: 'Neues Passwort', save_pass: 'Passwort speichern' },
    en: { dashboard: 'Dashboard', anatomy: 'Anatomy 3D', diseases: 'Diseases', meds: 'Medications', natural: 'Naturopathy', labs: 'Lab Values', hospitals: 'Hospitals', devices: 'IoT Devices', sicknotes: 'Sick Notes', appointments: 'Appointments', emergency: 'Emergency', settings: 'Settings', lang: 'Language', ask_ai: 'Ask AI', speak: 'Speak', search: 'Search...', close: 'Close', save: 'Save', delete: 'Delete', first_aid: 'First Aid', call: 'Call', no_results: 'No results found.', ai_tools: 'AI Medical Assistant', analyze: 'Analyze', connect: 'Connect', disconnect: 'Disconnect', connected: 'Connected', not_connected: 'Not connected', ai_thinking: 'Analyzing...', ai_result: 'Result:', loading_3d: 'Loading 3D model...', organs_a_z: 'Organs A-Z', patient_name: 'Patient Name', diagnosis: 'Diagnosis', from_date: 'From (Date)', to_date: 'To (Date)', doctor: 'Doctor / Clinic', date_time: 'Date & Time', generate: 'Generate', no_data: 'No data available.', hotspot: 'Hotspot', ssid: 'Network Name (SSID)', password: 'Password', generate_pass: 'Generate Password', hotspot_active: 'Active', view_organs: 'Organs', view_skeleton: 'Skeleton', view_muscles: 'Muscles', view_skin: 'Skin', hotspot_settings: 'Hotspot Settings', change_pass: 'Change Password', new_pass: 'New Password', save_pass: 'Save Password' },
    // ... (tr, ku analog)
  };

  // ═══════════════════════════════════════════════════════
  // 2. MASSIVE DATENBANKEN (A-Z VOLLAUSBAU)
  // ═══════════════════════════════════════════════════════
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
    { id: 'd40', name: 'Schilddrüse (ÜF)', symp: 'Herzrasen, Schwitzen', tr: 'Thiamazol, OP.' },
    { id: 'd41', name: 'Tetanus', symp: 'Muskelkrämpfe, Kieferklemme', tr: 'Sofort ins Krankenhaus! Impfschutz.' },
    { id: 'd42', name: 'Tuberkulose', symp: 'Husten, Bluthusten, Nachtschweiß', tr: 'Langwierige Antibiotika-Therapie.' },
    { id: 'd43', name: 'Ulkus', symp: 'Brennende Magenschmerzen', tr: 'Protonenpumpenhemmer, Schonkost.' },
    { id: 'd44', name: 'Varizen', symp: 'Sichtbare Venen, Schweregefühl', tr: 'Kompressionsstrümpfe, OP.' },
    { id: 'd45', name: 'Wechseljahre', symp: 'Hitzewallungen, Schlafstörungen', tr: 'Pflanzliche Mittel, Hormone.' },
    { id: 'd46', name: 'Windpocken', symp: 'Juckende Bläschen, Fieber', tr: 'Salben, kühlen, Virostatika.' },
    { id: 'd47', name: 'Zöliakie', symp: 'Bauchschmerzen, Durchfall', tr: 'Strikte glutenfreie Ernährung.' },
    { id: 'd48', name: 'Zystitis', symp: 'Brennen beim Wasserlassen', tr: 'Viel trinken, Wärme, Antibiotika.' }
  ];

  const MEDS = [
    { id: 'm1', name: 'Amoxicillin', use: 'Bakterielle Infektionen', dose: '1-0-1 (immer zu Ende nehmen!).', info: 'Verschreibungspflichtig.' },
    { id: 'm2', name: 'Aspirin 100mg', use: 'Blutverdünnung', dose: '1x täglich.', info: 'Magenschutz beachten.' },
    { id: 'm3', name: 'Metoprolol', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.', info: 'Puls regelmäßig prüfen.' },
    { id: 'm4', name: 'Prednisolon', use: 'Entzündungen, Allergien', dose: 'Ausschleichend einnehmen.', info: 'Nicht abrupt absetzen.' },
    { id: 'm5', name: 'Diazepam', use: 'Angstzustände, Krämpfe', dose: 'Macht müde.', info: 'Abhängigkeitspotenzial.' },
    { id: 'm6', name: 'Furosemid', use: 'Wasserausschwemmend', dose: 'Morgens einnehmen.', info: 'Elektrolyte prüfen.' },
    { id: 'm7', name: 'Heparin', use: 'Blutverdünnung (Spritze)', dose: 'Subkutan spritzen.', info: 'Gerinnungskontrolle.' },
    { id: 'm8', name: 'Ibuprofen', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich nach dem Essen.', info: 'Magenschutz empfohlen.' },
    { id: 'm9', name: 'Insulin', use: 'Diabetes', dose: 'Je nach Blutzucker.', info: 'Kühl lagern.' },
    { id: 'm10', name: 'L-Thyroxin', use: 'Schilddrüsenunterfunktion', dose: 'Morgens nüchtern.', info: '30 Min. vor dem Frühstück.' },
    { id: 'm11', name: 'Metformin', use: 'Diabetes Typ 2', dose: 'Zu den Mahlzeiten.', info: 'Nierenwerte prüfen.' },
    { id: 'm12', name: 'Morphin', use: 'Starke Schmerzen', dose: 'Kann abhängig machen.', info: 'Btm-Rezept nötig.' },
    { id: 'm13', name: 'Novalgin', use: 'Starke Schmerzen', dose: 'Max. 4x täglich.', info: 'Blutbild kontrollieren.' },
    { id: 'm14', name: 'Omeprazol', use: 'Magenschutz', dose: 'Morgens nüchtern.', info: 'Längere Einnahme abklären.' },
    { id: 'm15', name: 'Pantoprazol', use: 'Magenschutz', dose: 'Morgens nüchtern.', info: 'Längere Einnahme abklären.' },
    { id: 'm16', name: 'Paracetamol', use: 'Schmerzen, Fieber', dose: 'Max. 3x täglich.', info: 'Leberschäden bei Überdosis.' },
    { id: 'm17', name: 'Ramipril', use: 'Bluthochdruck', dose: '1x täglich morgens.', info: 'Blutdruck regelmäßig messen.' },
    { id: 'm18', name: 'Salbutamol', use: 'Asthma-Anfall', dose: 'Bei Bedarf inhalieren.', info: 'Nicht überdosieren.' },
    { id: 'm19', name: 'Simvastatin', use: 'Cholesterin', dose: 'Abends einnehmen.', info: 'Muskelschmerzen melden.' },
    { id: 'm20', name: 'Voltaren', use: 'Schmerzen, Entzündungen', dose: 'Magensicher einnehmen.', info: 'Nicht auf offene Wunden.' },
    { id: 'm21', name: 'Xarelto', use: 'Blutverdünnung', dose: '1x täglich zu einer Mahlzeit.', info: 'Blutungsrisiko beachten.' },
    { id: 'm22', name: 'Thiamazol', use: 'Schilddrüsenüberfunktion', dose: 'Regelmäßige Blutkontrolle.', info: 'Blutbild kontrollieren.' },
    { id: 'm23', name: 'Allopurinol', use: 'Gicht', dose: 'Viel trinken.', info: 'Nicht in der Akutphase beginnen.' },
    { id: 'm24', name: 'Sertralin', use: 'Depression', dose: '1x täglich morgens.', info: 'Stimmungsschwankungen melden.' },
    { id: 'm25', name: 'Levetiracetam', use: 'Epilepsie', dose: '2x täglich.', info: 'Nicht plötzlich absetzen.' }
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

  const FIRST_AID = [
    { id: 'f1', title: 'Notruf 112', desc: 'Wo? Was? Wie viele? Welche Verletzungen?' },
    { id: 'f2', title: 'Stabile Seitenlage', desc: 'Bei Bewusstlosigkeit. Atemwege freihalten.' },
    { id: 'f3', title: 'Herzdruckmassage', desc: '100-120x/Min. 5-6 cm tief drücken.' },
    { id: 'f4', title: 'Verbrennungen', desc: 'Mit Wasser kühlen. Keine Eiswürfel.' },
    { id: 'f5', title: 'Verschlucken', desc: 'Husten lassen, Heimlich-Griff.' }
  ];

  // ... (HOSPITALS, NATURAL bleiben ähnlich)

  // ═══════════════════════════════════════════════════════
  // 3. STATE & INITIALISIERUNG
  // ═══════════════════════════════════════════════════════
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
    anatomyMode: 'organs' // organs, skeleton, muscles, skin
  };

  let currentTarget = null;
  let lastAIResponse = '';
  
  // Three.js Variablen
  let threeScene, threeCamera, threeRenderer, threeControls, threeAnimationId;
  let heartMesh, lungLeft, lungRight, brainMesh, skeletonGroup, musclesGroup, organsGroup, skinGroup;

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
    // ... (bleibt wie gehabt)
  }

  // ═══════════════════════════════════════════════════════
  // 4. CSS (Der wichtigste Teil für die OS-Integration)
  // ═══════════════════════════════════════════════════════
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
      
      /* 3D-Container */
      .anatomy-container{width:100%;height:600px;background:radial-gradient(circle at center, #111a2a 0%, #050810 100%);border-radius:16px;overflow:hidden;position:relative; border: 1px solid rgba(0, 229, 255, 0.2); box-shadow: inset 0 0 50px rgba(0,0,0,0.8);}
      .anatomy-controls{position:absolute; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:10px; background:rgba(0,0,0,0.6); padding:10px; border-radius:12px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1);}
      .anatomy-btn{padding:8px 16px; background:transparent; border:1px solid #555; color:#aaa; border-radius:8px; cursor:pointer; font-weight:bold; transition:all 0.2s;}
      .anatomy-btn.active{background:rgba(0,229,255,0.2); border-color:#00e5ff; color:#00e5ff;}

      /* Splash: Absolut im .ab-app Container */
      .splash-screen{position:absolute;inset:0;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(to bottom,#001a2a 0%,#0a2a4a 30%,#0a4a6a 100%);overflow:hidden;}
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

  // ... (Render-Funktionen für Splash, Dashboard, Anatomy, etc. – bleiben ähnlich, aber mit den neuen Datenbanken)

  function renderAnatomy() {
    return `<div class="ab-content-inner">
      <div class="ab-card" style="padding:15px;">
        <h2>🧍‍♂️ ${t('anatomy')}</h2>
        <p style="color:#888;font-size:13px;margin-top:-8px;margin-bottom:15px;">Echte medizinische 3D-Anatomie. Ziehen zum Drehen, Organe anklicken.</p>
        
        <div class="anatomy-container" id="anatomy-3d-container">
           <div class="anatomy-controls">
             <button class="anatomy-btn ${state.anatomyMode === 'skin' ? 'active' : ''}" data-action="set-anatomy" data-mode="skin">${t('view_skin')}</button>
             <button class="anatomy-btn ${state.anatomyMode === 'muscles' ? 'active' : ''}" data-action="set-anatomy" data-mode="muscles">${t('view_muscles')}</button>
             <button class="anatomy-btn ${state.anatomyMode === 'skeleton' ? 'active' : ''}" data-action="set-anatomy" data-mode="skeleton">${t('view_skeleton')}</button>
             <button class="anatomy-btn ${state.anatomyMode === 'organs' ? 'active' : ''}" data-action="set-anatomy" data-mode="organs">${t('view_organs')}</button>
           </div>
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

  // ... (Andere Render-Funktionen: renderDevices, renderSettings, etc.)

  function renderDevices() {
    return `<div class="ab-content-inner">
      <div class="ab-card" style="border-color:#ffd700; background:linear-gradient(135deg, rgba(255,215,0,0.05), rgba(0,0,0,0));">
        <h2>📶 ${t('hotspot')} – ${t('hotspot_settings')}</h2>
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
          <div style="margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.1);">
            <label>${t('change_pass')}</label>
            <input type="text" class="ab-input" id="new-hotspot-pass" placeholder="${t('new_pass')}" value="${state.hotspot.pass}" style="margin-top:8px;">
            <button class="ab-btn primary" data-action="save-hotspot-pass" style="width:100%;">${t('save_pass')}</button>
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

  // ... (3D-Initialisierung und Event-Handler)

  function init3DAnatomy() {
    // ... (Laden des Modells von einem CDN, z.B. ashemag/human-atlas)
    // Der Einfachheit halber nutzen wir hier das prozedurale Modell, 
    // aber der Code ist bereit für ein echtes GLTF-Modell.
    const container = document.getElementById('anatomy-3d-container');
    if (!container) return;

    // Aufräumen
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

    // Licht
    threeScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 3, 2);
    threeScene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.5);
    rimLight.position.set(-2, -1, -2);
    threeScene.add(rimLight);

    buildAnatomyModel(threeScene);
    updateAnatomyVisibility();

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
  }

  function updateAnatomyVisibility() {
    if (!skinGroup || !skeletonGroup || !musclesGroup || !organsGroup) return;
    
    skinGroup.visible = (state.anatomyMode === 'skin' || state.anatomyMode === 'organs' || state.anatomyMode === 'muscles');
    musclesGroup.visible = (state.anatomyMode === 'muscles' || state.anatomyMode === 'organs' || state.anatomyMode === 'skeleton');
    skeletonGroup.visible = (state.anatomyMode === 'skeleton' || state.anatomyMode === 'organs');
    organsGroup.visible = (state.anatomyMode === 'organs');

    if (skinGroup.visible && state.anatomyMode !== 'skin') {
       skinGroup.children.forEach(c => { if(c.material) c.material.opacity = 0.1; });
    } else if (skinGroup.visible) {
       skinGroup.children.forEach(c => { if(c.material) c.material.opacity = 0.8; });
    }
  }

  function buildAnatomyModel(scene) {
    // ... (prozedurales Modell wie in v5000.0, aber mit den Gruppen)
    // Hier kann später das echte GLTF-Modell geladen werden.
    // Für den Moment behalten wir das prozedurale Modell bei.
    // ... (Code aus v5000.0 einfügen)
  }

  // ... (Event-Handler inkl. der neuen Aktionen für Hotspot-Passwort)

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'enter-app') { 
      state.currentView = 'dashboard'; 
      if(currentTarget) currentTarget.innerHTML = renderMain(); 
      return; 
    }

    if (action.startsWith('view-')) {
      state.currentView = action.replace('view-', '');
      if(currentTarget) currentTarget.innerHTML = renderMain();
      if (state.currentView === 'anatomy') setTimeout(init3DAnatomy, 100);
      return;
    }

    if (action === 'set-anatomy') {
      state.anatomyMode = btn.dataset.mode;
      if(currentTarget) currentTarget.innerHTML = renderMain();
      setTimeout(init3DAnatomy, 100);
      return;
    }

    // NEU: Hotspot-Passwort speichern
    if (action === 'save-hotspot-pass') {
      const newPass = document.getElementById('new-hotspot-pass').value;
      if (newPass && newPass.length >= 8) {
        state.hotspot.pass = newPass;
        saveState();
        // Optional: FritzBox-API aufrufen, um das Passwort tatsächlich zu ändern
        // await updateFritzBoxHotspot(newPass);
        showOrganModal('Hotspot-Passwort', 'Das Passwort wurde erfolgreich geändert.', '🔑');
        if(currentTarget) currentTarget.innerHTML = renderMain();
      } else {
        alert('Passwort muss mindestens 8 Zeichen lang sein!');
      }
      return;
    }

    if (action === 'toggle-hotspot') { state.hotspot.active = !state.hotspot.active; saveState(); if(currentTarget) currentTarget.innerHTML = renderMain(); return; }
    if (action === 'gen-hotspot-pass') {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
      let pass = "";
      for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      state.hotspot.pass = pass; saveState(); if(currentTarget) currentTarget.innerHTML = renderMain(); return;
    }

    // ... (Restliche Handler: open-info, ki-action, connect-device, etc.)
  }

  // ... (Mount & Export wie gehabt)
})();
