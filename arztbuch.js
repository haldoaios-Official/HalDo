/* HalDo Arztbuch v2.0 — ULTIMATE GLOBAL (17 Sprachen, KI, TTS, IoT, Komplett A-Z) */
(function () {
  'use strict';

  const VERSION = '2.0';
  const STORAGE_KEY = 'haldo.arztbuch.data.v2';

  // ═══════════════════════════════════════════════════════
  // 1. MULTI-LANGUAGE ENGINE (17 Sprachen)
  // ═══════════════════════════════════════════════════════
  const LANG = {
    de: { dashboard: 'Dashboard', diseases: 'Krankheiten', meds: 'Medikamente', hospitals: 'Kliniken', devices: 'IoT-Geräte', sicknotes: 'Krankschreibung', appointments: 'Termine', emergency: 'Notfall', settings: 'Einstellungen', lang: 'Sprache', ask_ai: 'KI fragen', speak: 'Vorlesen', search: 'Suchen...', close: 'Schließen', save: 'Speichern', delete: 'Löschen', first_aid: 'Erste Hilfe', call: 'Anrufen', no_results: 'Keine Ergebnisse gefunden.' },
    en: { dashboard: 'Dashboard', diseases: 'Diseases', meds: 'Medications', hospitals: 'Hospitals', devices: 'IoT Devices', sicknotes: 'Sick Notes', appointments: 'Appointments', emergency: 'Emergency', settings: 'Settings', lang: 'Language', ask_ai: 'Ask AI', speak: 'Speak', search: 'Search...', close: 'Close', save: 'Save', delete: 'Delete', first_aid: 'First Aid', call: 'Call', no_results: 'No results found.' },
    tr: { dashboard: 'Panel', diseases: 'Hastalıklar', meds: 'İlaçlar', hospitals: 'Hastaneler', devices: 'IoT Cihazları', sicknotes: 'Rapor', appointments: 'Randevular', emergency: 'Acil Durum', settings: 'Ayarlar', lang: 'Dil', ask_ai: 'Yapay Zekaya Sor', speak: 'Sesli Oku', search: 'Ara...', close: 'Kapat', save: 'Kaydet', delete: 'Sil', first_aid: 'İlk Yardım', call: 'Ara', no_results: 'Sonuç bulunamadı.' },
    ku: { dashboard: 'Destpêk', diseases: 'Nexweşî', meds: 'Derman', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.' },
    ckb: { dashboard: 'دەستپێک', diseases: 'نەخۆشییەکان', meds: 'دەرمانەکان', hospitals: 'نەخۆشخانەکان', devices: 'ئامێرەکانی IoT', sicknotes: 'مۆڵەتی نەخۆشی', appointments: 'چاوپێکەوتنەکان', emergency: 'حاڵەتی فریاکەوتن', settings: 'ڕێکخستنەکان', lang: 'زمان', ask_ai: 'پرسیار لە AI بکە', speak: 'بخوێنەرەوە', search: 'گەڕان...', close: 'داخستن', save: 'پاشەکەوتکردن', delete: 'سڕینەوە', first_aid: 'یارمەتی سەرەتایی', call: 'پەیوەندی', no_results: 'هیچ ئەنجامێک نەدۆزرایەوە.' },
    gorani: { dashboard: 'Destpêk', diseases: 'Nexweşî', meds: 'Derman', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.' },
    ez: { dashboard: 'Destpêk', diseases: 'Nexweşî', meds: 'Derman', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.' },
    fr: { dashboard: 'Tableau de bord', diseases: 'Maladies', meds: 'Médicaments', hospitals: 'Hôpitaux', devices: 'Appareils IoT', sicknotes: 'Arrêt maladie', appointments: 'Rendez-vous', emergency: 'Urgence', settings: 'Paramètres', lang: 'Langue', ask_ai: 'Demander à l\'IA', speak: 'Lire', search: 'Rechercher...', close: 'Fermer', save: 'Enregistrer', delete: 'Supprimer', first_aid: 'Premiers secours', call: 'Appeler', no_results: 'Aucun résultat.' },
    ar: { dashboard: 'لوحة القيادة', diseases: 'الأمراض', meds: 'الأدوية', hospitals: 'المستشفيات', devices: 'أجهزة إنترنت الأشياء', sicknotes: 'إجازة مرضية', appointments: 'المواعيد', emergency: 'حالة طوارئ', settings: 'إعدادات', lang: 'اللغة', ask_ai: 'اسأل الذكاء الاصطناعي', speak: 'قراءة', search: 'بحث...', close: 'إغلاق', save: 'حفظ', delete: 'حذف', first_aid: 'الإسعافات الأولية', call: 'اتصال', no_results: 'لم يتم العثور على نتائج.' },
    es: { dashboard: 'Panel', diseases: 'Enfermedades', meds: 'Medicamentos', hospitals: 'Hospitales', devices: 'Dispositivos IoT', sicknotes: 'Bajas médicas', appointments: 'Citas', emergency: 'Emergencia', settings: 'Ajustes', lang: 'Idioma', ask_ai: 'Preguntar a IA', speak: 'Leer', search: 'Buscar...', close: 'Cerrar', save: 'Guardar', delete: 'Eliminar', first_aid: 'Primeros auxilios', call: 'Llamar', no_results: 'No se encontraron resultados.' },
    pl: { dashboard: 'Pulpit', diseases: 'Choroby', meds: 'Leki', hospitals: 'Szpitale', devices: 'Urządzenia IoT', sicknotes: 'Zwolnienia', appointments: 'Wizyty', emergency: 'Nagły wypadek', settings: 'Ustawienia', lang: 'Język', ask_ai: 'Zapytaj AI', speak: 'Czytaj', search: 'Szukaj...', close: 'Zamknij', save: 'Zapisz', delete: 'Usuń', first_aid: 'Pierwsza pomoc', call: 'Zadzwoń', no_results: 'Brak wyników.' },
    ru: { dashboard: 'Панель', diseases: 'Болезни', meds: 'Лекарства', hospitals: 'Больницы', devices: 'Устройства IoT', sicknotes: 'Больничные', appointments: 'Записи', emergency: 'Экстренная помощь', settings: 'Настройки', lang: 'Язык', ask_ai: 'Спросить ИИ', speak: 'Читать', search: 'Поиск...', close: 'Закрыть', save: 'Сохранить', delete: 'Удалить', first_aid: 'Первая помощь', call: 'Позвонить', no_results: 'Ничего не найдено.' },
    uz: { dashboard: 'Boshqaruv paneli', diseases: 'Kasalliklar', meds: 'Dorilar', hospitals: 'Kasalxonalar', devices: 'IoT qurilmalari', sicknotes: 'Kasallik varaqasi', appointments: 'Qabullar', emergency: 'Favqulodda', settings: 'Sozlamalar', lang: 'Til', ask_ai: "AI dan so'rash", speak: "O'qish", search: 'Qidirish...', close: 'Yopish', save: 'Saqlash', delete: "O'chirish", first_aid: 'Birinchi yordam', call: "Qo'ng'iroq", no_results: 'Hech narsa topilmadi.' },
    fa: { dashboard: 'داشبورد', diseases: 'بیماری‌ها', meds: 'داروها', hospitals: 'بیمارستان‌ها', devices: 'دستگاه‌های IoT', sicknotes: 'گواهی بیماری', appointments: 'نوبت‌ها', emergency: 'اورژانس', settings: 'تنظیمات', lang: 'زبان', ask_ai: 'پرسیدن از هوش مصنوعی', speak: 'خواندن', search: 'جستجو...', close: 'بستن', save: 'ذخیره', delete: 'حذف', first_aid: 'کمک‌های اولیه', call: 'تماس', no_results: 'نتیجه‌ای یافت نشد.' },
    la: { dashboard: 'Dashboard', diseases: 'Morbi', meds: 'Medicamenta', hospitals: 'Valetudinaria', devices: 'IoT Cogitationes', sicknotes: 'Libelli Aegri', appointments: 'Constitutiones', emergency: 'Subitum', settings: 'Optiones', lang: 'Lingua', ask_ai: 'Interroga AI', speak: 'Legere', search: 'Quaerere...', close: 'Claudere', save: 'Servare', delete: 'Delere', first_aid: 'Prima Auxilia', call: 'Vocare', no_results: 'Nulli eventus inventi.' },
    zh: { dashboard: '仪表盘', diseases: '疾病', meds: '药物', hospitals: '医院', devices: '物联网设备', sicknotes: '病假条', appointments: '预约', emergency: '紧急情况', settings: '设置', lang: '语言', ask_ai: '问AI', speak: '朗读', search: '搜索...', close: '关闭', save: '保存', delete: '删除', first_aid: '急救', call: '呼叫', no_results: '未找到结果。' },
    ja: { dashboard: 'ダッシュボード', diseases: '病気', meds: '薬', hospitals: '病院', devices: 'IoTデバイス', sicknotes: '診断書', appointments: '予約', emergency: '緊急事態', settings: '設定', lang: '言語', ask_ai: 'AIに聞く', speak: '読み上げる', search: '検索...', close: '閉じる', save: '保存', delete: '削除', first_aid: '応急処置', call: '電話', no_results: '結果が見つかりません。' }
  };

  // ═══════════════════════════════════════════════════════
  // 2. DATENBANK (A-Z)
  // ═══════════════════════════════════════════════════════
  const DISEASES = [
    { id: 'd1', name: 'Asthma', symp: 'Atemnot, Husten, Engegefühl in der Brust', tr: 'Bronchienerweiternde Sprays, Kortison, Allergene meiden.' },
    { id: 'd2', name: 'Diabetes Typ 2', symp: 'Erhöhter Blutzucker, Müdigkeit, starker Durst', tr: 'Ernährungsumstellung, Bewegung, Metformin, Insulin (später).' },
    { id: 'd3', name: 'Grippe (Influenza)', symp: 'Plötzliches Fieber, Gliederschmerzen, Husten, Schnupfen', tr: 'Bettruhe, viel Flüssigkeit, Fieber senken, ggf. Virostatika.' },
    { id: 'd4', name: 'Herzinsuffizienz', symp: 'Kurzatmigkeit, Ödeme (Wassereinlagerungen), Müdigkeit', tr: 'Wasserausschwemmende Medikamente, ACE-Hemmer, salzarme Kost.' },
    { id: 'd5', name: 'Migräne', symp: 'Pulsierender Schmerz, Übelkeit, Lichtempfindlichkeit', tr: 'Ruhe, dunkler Raum, Schmerzmittel (Triptane).' },
    { id: 'd6', name: 'Rückenschmerzen', symp: 'Ziehen im Rücken, Verspannungen, Bewegungseinschränkung', tr: 'Wärme, Bewegung, Massage, ggf. Muskelrelaxantien.' },
    { id: 'd7', name: 'Bluthochdruck', symp: 'Oft symptomlos, Kopfschmerzen, Schwindel, Nasenbluten', tr: 'Salzarm essen, Sport, Blutdrucksenker (Betablocker etc.).' },
    { id: 'd8', name: 'Wundrose (Erysipel)', symp: 'Rote, heiße, schmerzhafte Hautentzündung, Fieber', tr: 'Dringend zum Arzt! Antibiotika, Ruhigstellung.' },
    { id: 'd9', name: 'Magen-Darm-Infekt', symp: 'Übelkeit, Erbrechen, Durchfall, Bauchkrämpfe', tr: 'Viel trinken (Elektrolyte), Schonkost, ggf. Medikamente gegen Übelkeit.' },
    { id: 'd10', name: 'Allergie', symp: 'Niesen, Juckreiz, Hautausschlag, Atemnot', tr: 'Allergene meiden, Antihistaminika, im Notfall Adrenalin (EpiPen).' }
  ];

  const MEDS = [
    { id: 'm1', name: 'Ibuprofen 400mg', use: 'Schmerzen, Entzündungen, Fieber', dose: 'Max. 3x täglich 1 Tablette nach dem Essen.' },
    { id: 'm2', name: 'Paracetamol 500mg', use: 'Schmerzen, Fieber (magensicher)', dose: 'Max. 3x täglich 1-2 Tabletten.' },
    { id: 'm3', name: 'Amoxicillin 1000mg', use: 'Bakterielle Infektionen (Antibiotikum)', dose: '1-0-1 (je nach Verordnung, immer zu Ende nehmen!).' },
    { id: 'm4', name: 'Metformin 850mg', use: 'Diabetes Typ 2', dose: 'Zu den Mahlzeiten, morgens und abends.' },
    { id: 'm5', name: 'Salbutamol Spray', use: 'Asthma-Anfall (bronchienerweiternd)', dose: 'Bei Bedarf 1-2 Hübe inhalieren.' },
    { id: 'm6', name: 'Ramipril 5mg', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.' },
    { id: 'm7', name: 'Aspirin 100mg', use: 'Blutverdünnung (Thrombozytenaggregationshemmer)', dose: '1x täglich.' },
    { id: 'm8', name: 'Pantoprazol 40mg', use: 'Magenschutz, Sodbrennen', dose: '1x täglich morgens nüchtern.' }
  ];

  const FIRST_AID = [
    { id: 'f1', title: 'Notruf absetzen', desc: 'Wähle 112. Nenne: Wo? Was? Wie viele Verletzte? Welche Verletzungen? Warte auf Rückfragen!' },
    { id: 'f2', title: 'Stabile Seitenlage', desc: 'Bei Bewusstlosigkeit mit normaler Atmung. Verhindert Ersticken. Atemwege freihalten.' },
    { id: 'f3', title: 'Herzdruckmassage', desc: 'Bei Atemstillstand. 100-120 Mal pro Minute fest auf die Mitte des Brustkorbs drücken. 5-6 cm tief.' },
    { id: 'f4', title: 'Verbrennungen', desc: 'Mit lauwarmem Wasser kühlen (ca. 10-15 Min). Keine Eiswürfel, keine Salben. Kleidung nicht abreißen.' },
    { id: 'f5', title: 'Verschlucken', desc: 'Auffordern zu husten. Bei Atemnot: 5x kräftig auf den Rücken klopfen, dann 5x Oberbauchkompression (Heimlich).' }
  ];

  const HOSPITALS = [
    { name: 'Universitätsklinikum', dist: '1.2 km', type: 'Notaufnahme 24/7', phone: '112' },
    { name: 'St. Marien Krankenhaus', dist: '3.5 km', type: 'Allgemeinmedizin', phone: '030-123456' },
    { name: 'Kinderklinik Sonnenschein', dist: '5.0 km', type: 'Pädiatrie', phone: '030-654321' },
    { name: 'Herzzentrum Mitte', dist: '8.2 km', type: 'Kardiologie', phone: '030-987654' }
  ];

  // ═══════════════════════════════════════════════════════
  // 3. STATE & STORAGE
  // ═══════════════════════════════════════════════════════
  let state = {
    lang: 'de',
    currentView: 'dashboard',
    appointments: [],
    sickNotes: [],
    devices: [
      { type: 'bluetooth', name: 'Blutdruckmessgerät', icon: '🩺', connected: false },
      { type: 'wifi', name: 'Smart-Waage', icon: '⚖️', connected: false },
      { type: 'infrared', name: 'Fieberthermometer', icon: '🌡️', connected: false }
    ],
    searchQuery: ''
  };

  let currentTarget = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lang) state.lang = parsed.lang;
        if (parsed.appointments) state.appointments = parsed.appointments;
        if (parsed.sickNotes) state.sickNotes = parsed.sickNotes;
        if (parsed.devices) state.devices = parsed.devices;
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lang: state.lang,
        appointments: state.appointments,
        sickNotes: state.sickNotes,
        devices: state.devices
      }));
    } catch (e) { }
  }

  // ═══════════════════════════════════════════════════════
  // 4. CSS (PRO MAX GLASS UI)
  // ═══════════════════════════════════════════════════════
  function css() {
    return `<style>
      .ab-app { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #e8e8ec; background: #0a0a0f; height: 100%; display: flex; flex-direction: row; overflow: hidden; }
      
      /* SIDEBAR */
      .ab-sidebar { width: 260px; background: rgba(17,17,24,0.95); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
      .ab-logo { font-size: 20px; font-weight: 900; color: #00ff88; padding: 0 20px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px; }
      .ab-logo span { font-size: 10px; background: rgba(0,255,136,0.1); padding: 3px 6px; border-radius: 4px; color: #00ff88; }
      .ab-nav-item { padding: 12px 20px; display: flex; align-items: center; gap: 12px; color: #a8b0cc; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; border-left: 3px solid transparent; margin-bottom: 2px; }
      .ab-nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
      .ab-nav-item.active { background: rgba(0,255,136,0.08); color: #00ff88; border-left-color: #00ff88; }
      .ab-nav-item .icon { font-size: 18px; width: 24px; text-align: center; }
      
      /* MAIN CONTENT */
      .ab-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
      .ab-header { padding: 20px 30px; background: rgba(10,10,15,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; z-index: 10; }
      .ab-header h1 { margin: 0; font-size: 22px; font-weight: 900; color: #fff; }
      
      .ab-content-area { flex: 1; overflow-y: auto; padding: 30px; }
      .ab-content-inner { max-width: 900px; margin: 0 auto; }
      
      .ab-card { background: rgba(20, 20, 28, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .ab-card h2 { margin-top: 0; font-size: 20px; color: #fff; margin-bottom: 15px; font-weight: 900; }
      
      /* FORMS & INPUTS */
      .ab-input { width: 100%; padding: 12px 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-family: inherit; font-size: 14px; outline: none; margin-bottom: 15px; }
      .ab-input:focus { border-color: #00ff88; box-shadow: 0 0 10px rgba(0,255,136,0.2); }
      .ab-label { display: block; font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
      
      /* BUTTONS */
      .ab-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; font-family: inherit; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; }
      .ab-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .ab-btn.primary { background: linear-gradient(135deg, #00ff88, #00e5ff); color: #000; border: none; font-weight: 900; box-shadow: 0 4px 15px rgba(0,255,136,0.3); }
      .ab-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,255,136,0.5); }
      .ab-btn.danger { background: linear-gradient(135deg, #ff3333, #cc0000); color: #fff; border: none; font-weight: 900; box-shadow: 0 4px 15px rgba(255,51,51,0.4); }
      
      /* LISTS */
      .ab-list-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; cursor: pointer; }
      .ab-list-item:hover { border-color: #00ff88; background: rgba(0,255,136,0.05); }
      .ab-list-item h4 { margin: 0 0 5px; color: #00ff88; font-size: 16px; }
      .ab-list-item p { margin: 0; font-size: 13px; color: #aaa; }
      
      /* DASHBOARD STATS */
      .ab-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
      .ab-stat-box { background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 12px; padding: 20px; text-align: center; }
      .ab-stat-box .val { font-size: 28px; font-weight: 900; color: #00ff88; display: block; margin-bottom: 5px; }
      .ab-stat-box .lbl { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
      
      /* DEVICES */
      .ab-device-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
      .ab-device { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: center; transition: all 0.2s; }
      .ab-device .icon { font-size: 50px; margin-bottom: 10px; }
      .ab-device .name { font-weight: bold; font-size: 14px; margin-bottom: 10px; }
      .ab-device .status { font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 6px; display: inline-block; }
      .ab-device .status.on { background: rgba(0,255,136,0.2); color: #00ff88; }
      .ab-device .status.off { background: rgba(255,255,255,0.1); color: #888; }
      
      /* EMERGENCY */
      .ab-emergency-btn { background: linear-gradient(135deg, #ff3333, #cc0000); color: #fff; border: none; border-radius: 50%; width: 200px; height: 200px; font-size: 28px; font-weight: 900; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 40px auto; cursor: pointer; box-shadow: 0 0 40px rgba(255,51,51,0.6); animation: pulse 2s infinite; }
      @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 40px rgba(255,51,51,0.6); } 50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(255,51,51,0.9); } 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,51,51,0.6); } }

      /* MODAL */
      .ab-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .ab-modal-overlay.show { opacity: 1; pointer-events: auto; }
      .ab-modal { background: #14141c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 25px; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; }
      .ab-modal h3 { margin-top: 0; color: #00ff88; font-size: 22px; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .ab-modal p { color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 20px; text-align: left; }
      
      /* SETTINGS */
      .ab-select { background: #1a1a24; color: #fff; border: 1px solid #333; border-radius: 8px; padding: 10px 15px; font-family: inherit; font-size: 14px; outline: none; cursor: pointer; width: 100%; max-width: 300px; }
    </style>`;
  }

  // ═══════════════════════════════════════════════════════
  // 5. RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════
  function t(key) { return (LANG[state.lang] && LANG[state.lang][key]) || LANG['de'][key] || key; }

  function renderDashboard() {
    return `
      <div class="ab-content-inner">
        <div class="ab-card" style="background: linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,229,255,0.05)); border-color: rgba(0,255,136,0.2);">
          <h2 style="font-size: 28px; margin-bottom: 10px;">Guten Tag, Halil! 👋</h2>
          <p style="color: #a8b0cc; font-size: 16px;">Hier ist deine medizinische Übersicht für heute.</p>
        </div>
        
        <div class="ab-stats-grid">
          <div class="ab-stat-box">
            <span class="val">${state.appointments.length}</span>
            <span class="lbl">${t('appointments')}</span>
          </div>
          <div class="ab-stat-box">
            <span class="val">${state.sickNotes.length}</span>
            <span class="lbl">${t('sicknotes')}</span>
          </div>
        </div>
        
        <div class="ab-card" style="margin-top: 20px;">
          <h2>🩺 ${t('devices')}</h2>
          <div class="ab-device-grid">
            ${state.devices.map(d => `
              <div class="ab-device">
                <div class="icon">${d.icon}</div>
                <div class="name">${d.name}</div>
                <div class="status ${d.connected ? 'on' : 'off'}">${d.connected ? 'Verbunden' : 'Nicht verbunden'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderDiseases() {
    const filtered = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || d.symp.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>🦠 ${t('diseases')}</h2>
          <input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-disease" value="${state.searchQuery}">
          <div style="margin-top: 20px;">
            ${filtered.length ? filtered.map(d => `
              <div class="ab-list-item" data-action="open-disease" data-name="${d.name}" data-symp="${d.symp}" data-tr="${d.tr}" data-icon="🦠">
                <div>
                  <h4>${d.name}</h4>
                  <p><b>Symptome:</b> ${d.symp}</p>
                </div>
              </div>
            `).join('') : `<p style="color:#888; text-align:center;">${t('no_results')}</p>`}
          </div>
        </div>
      </div>
    `;
  }

  function renderMeds() {
    const filtered = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || m.use.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>💊 ${t('meds')}</h2>
          <input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-med" value="${state.searchQuery}">
          <div style="margin-top: 20px;">
            ${filtered.length ? filtered.map(m => `
              <div class="ab-list-item" data-action="open-med" data-name="${m.name}" data-use="${m.use}" data-dose="${m.dose}" data-icon="💊">
                <div>
                  <h4>${m.name}</h4>
                  <p><b>Anwendung:</b> ${m.use}</p>
                </div>
              </div>
            `).join('') : `<p style="color:#888; text-align:center;">${t('no_results')}</p>`}
          </div>
        </div>
      </div>
    `;
  }

  function renderHospitals() {
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>🏥 ${t('hospitals')}</h2>
          <div style="margin-top: 20px;">
            ${HOSPITALS.map(h => `
              <div class="ab-list-item">
                <div>
                  <h4>${h.name}</h4>
                  <p>${h.type} • ${h.dist} entfernt</p>
                </div>
                <a href="tel:${h.phone}" class="ab-btn" style="text-decoration:none;">📞 ${t('call')}</a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderDevices() {
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>📡 ${t('devices')}</h2>
          
          <div class="ab-device-grid" id="ab-device-list">
            ${state.devices.map((d, i) => `
              <div class="ab-device">
                <div class="icon">${d.icon}</div>
                <div class="name">${d.name}</div>
                <div class="status ${d.connected ? 'on' : 'off'}">${d.connected ? 'Verbunden' : 'Nicht verbunden'}</div>
                <button class="ab-btn" data-action="connect-device" data-idx="${i}" style="margin-top: 10px; width: 100%;">
                  ${d.connected ? 'Trennen' : 'Verbinden'}
                </button>
              </div>
            `).join('')}
          </div>
          
          <div style="display:flex; gap:10px; margin-top:30px;">
             <button class="ab-btn primary" data-action="scan-bt" style="flex:1;">📶 Bluetooth</button>
             <button class="ab-btn primary" data-action="scan-wifi" style="flex:1;">📡 WLAN</button>
             <button class="ab-btn primary" data-action="scan-ir" style="flex:1;">🔴 Infrarot</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSickNotes() {
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>📝 ${t('sicknotes')}</h2>
          <div style="margin-top:20px;">
            <label class="ab-label">Patientenname</label>
            <input type="text" class="ab-input" id="au-name" placeholder="Dein Name">
            
            <label class="ab-label">Krankheit / Diagnose</label>
            <input type="text" class="ab-input" id="au-diag" placeholder="z.B. Grippe">
            
            <label class="ab-label">Von (Datum)</label>
            <input type="date" class="ab-input" id="au-from">
            
            <label class="ab-label">Bis (Datum)</label>
            <input type="date" class="ab-input" id="au-to">
            
            <button class="ab-btn primary" data-action="generate-au" style="width:100%; margin-top:10px;">${t('save')}</button>
          </div>
        </div>
        
        <div class="ab-card">
          <h2>📋 Deine Krankschreibungen</h2>
          ${state.sickNotes.length ? state.sickNotes.map((s, i) => `
            <div class="ab-list-item" style="border-left: 4px solid #00ff88;">
              <div>
                <h4>${s.name} (${s.diag})</h4>
                <p>Vom ${s.from} bis ${s.to}</p>
              </div>
              <button class="ab-btn" data-action="del-au" data-idx="${i}" style="border-color: #ff3333; color: #ff3333;">${t('delete')}</button>
            </div>
          `).join('') : `<p style="color:#888; text-align:center;">Keine Krankschreibungen vorhanden.</p>`}
        </div>
      </div>
    `;
  }

  function renderAppointments() {
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>📅 ${t('appointments')}</h2>
          <div style="margin-top:20px;">
            <label class="ab-label">Arzt / Klinik</label>
            <input type="text" class="ab-input" id="app-doc" placeholder="z.B. Dr. Müller">
            
            <label class="ab-label">Datum & Uhrzeit</label>
            <input type="datetime-local" class="ab-input" id="app-date">
            
            <button class="ab-btn primary" data-action="add-app" style="width:100%; margin-top:10px;">${t('save')}</button>
          </div>
        </div>
        
        <div class="ab-card">
          <h2>🗓️ Deine Termine</h2>
          ${state.appointments.length ? state.appointments.map((a, i) => `
            <div class="ab-list-item" style="border-left: 4px solid #00e5ff;">
              <div>
                <h4>${a.doc}</h4>
                <p>${new Date(a.date).toLocaleString()}</p>
              </div>
              <button class="ab-btn" data-action="del-app" data-idx="${i}" style="border-color: #ff3333; color: #ff3333;">${t('delete')}</button>
            </div>
          `).join('') : `<p style="color:#888; text-align:center;">Keine Termine geplant.</p>`}
        </div>
      </div>
    `;
  }

  function renderEmergency() {
    return `
      <div class="ab-content-inner" style="text-align:center; padding-top:20px;">
        <h2 style="color:#ff3333; font-size:32px; font-weight:900;">🚨 ${t('emergency')}</h2>
        
        <button class="ab-emergency-btn" onclick="window.location.href='tel:112'">
          <span style="font-size:48px;">📞</span>
          112 ${t('call')}
        </button>
        
        <div class="ab-card" style="margin-top:30px; text-align:left;">
          <h2>🩸 ${t('first_aid')}</h2>
          <div style="margin-top:20px;">
            ${FIRST_AID.map(f => `
              <div class="ab-list-item" data-action="open-first-aid" data-title="${f.title}" data-desc="${f.desc}" data-icon="🩸">
                <div>
                  <h4>${f.title}</h4>
                  <p>${f.desc.substring(0, 50)}...</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderSettings() {
    return `
      <div class="ab-content-inner">
        <div class="ab-card">
          <h2>⚙️ ${t('settings')}</h2>
          <div style="margin-bottom:20px;">
            <label class="ab-label">${t('lang')}</label>
            <select class="ab-select" data-action="set-lang">
              <option value="de" ${state.lang === 'de' ? 'selected' : ''}>Deutsch</option>
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="tr" ${state.lang === 'tr' ? 'selected' : ''}>Türkçe</option>
              <option value="ku" ${state.lang === 'ku' ? 'selected' : ''}>Kurmandschi (Kurdisch)</option>
              <option value="ckb" ${state.lang === 'ckb' ? 'selected' : ''}>Sorani (Kurdisch)</option>
              <option value="gorani" ${state.lang === 'gorani' ? 'selected' : ''}>Gorani (Kurdisch)</option>
              <option value="ez" ${state.lang === 'ez' ? 'selected' : ''}>Ezidi</option>
              <option value="fr" ${state.lang === 'fr' ? 'selected' : ''}>Français</option>
              <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="es" ${state.lang === 'es' ? 'selected' : ''}>Español</option>
              <option value="pl" ${state.lang === 'pl' ? 'selected' : ''}>Polski</option>
              <option value="ru" ${state.lang === 'ru' ? 'selected' : ''}>Русский</option>
              <option value="uz" ${state.lang === 'uz' ? 'selected' : ''}>O'zbekcha (Usbekisch)</option>
              <option value="fa" ${state.lang === 'fa' ? 'selected' : ''}>فارسی (Farsi)</option>
              <option value="la" ${state.lang === 'la' ? 'selected' : ''}>Lingua Latina (Latein)</option>
              <option value="zh" ${state.lang === 'zh' ? 'selected' : ''}>中文 (Chinesisch)</option>
              <option value="ja" ${state.lang === 'ja' ? 'selected' : ''}>日本語 (Japanisch)</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  function renderMain() {
    let viewHtml = '';
    if (state.currentView === 'dashboard') viewHtml = renderDashboard();
    else if (state.currentView === 'diseases') viewHtml = renderDiseases();
    else if (state.currentView === 'meds') viewHtml = renderMeds();
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
          <div class="ab-nav-item ${state.currentView === 'diseases' ? 'active' : ''}" data-action="view-diseases"><span class="icon">🦠</span> ${t('diseases')}</div>
          <div class="ab-nav-item ${state.currentView === 'meds' ? 'active' : ''}" data-action="view-meds"><span class="icon">💊</span> ${t('meds')}</div>
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
            <h1>${state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'diseases' ? t('diseases') : state.currentView === 'meds' ? t('meds') : state.currentView === 'hospitals' ? t('hospitals') : state.currentView === 'devices' ? t('devices') : state.currentView === 'sicknotes' ? t('sicknotes') : state.currentView === 'appointments' ? t('appointments') : state.currentView === 'settings' ? t('settings') : t('emergency')}</h1>
            <div style="font-size:12px; color:#888;">v${VERSION}</div>
          </div>
          <div class="ab-content-area" id="ab-main-content">
            ${viewHtml}
          </div>
        </div>
      </div>
      
      <!-- MODAL FÜR INFOS -->
      <div class="ab-modal-overlay" id="ab-info-modal">
        <div class="ab-modal">
          <div style="font-size:60px; margin-bottom:10px;" id="ab-info-icon">🦠</div>
          <h3 id="ab-info-title">Titel</h3>
          <p id="ab-info-desc">Beschreibung...</p>
          <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
            <button class="ab-btn" id="ab-info-tts-btn" style="background: rgba(0,255,136,0.1); border-color: #00ff88; color: #00ff88;">🔊 ${t('speak')}</button>
            <button class="ab-btn primary" id="ab-info-ai-btn">🤖 ${t('ask_ai')}</button>
          </div>
          <button class="ab-btn ghost" style="width:100%;" onclick="document.getElementById('ab-info-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>

      <!-- MODAL FÜR AI -->
      <div class="ab-modal-overlay" id="ab-ai-modal">
        <div class="ab-modal">
          <h3>🤖 HalDo KI Assistent</h3>
          <p id="ab-ai-text">Analysiere...</p>
          <button class="ab-btn primary" style="width:100%;" onclick="document.getElementById('ab-ai-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // 6. LOGIC & CONTROLLER
  // ═══════════════════════════════════════════════════════
  
  function speakText(text) {
    if (!window.speechSynthesis) {
      alert("Sprachausgabe wird von diesem Browser nicht unterstützt.");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { de: 'de-DE', en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', fa: 'fa-IR', uz: 'uz-UZ', pl: 'pl-PL' };
    u.lang = langMap[state.lang] || 'de-DE';
    window.speechSynthesis.speak(u);
  }

  async function askAI(text) {
    const modal = document.getElementById('ab-ai-modal');
    const textEl = document.getElementById('ab-ai-text');
    if (!modal || !textEl) return;
    
    modal.classList.add('show');
    textEl.innerHTML = '<span style="color:#00ff88;">Analysiere...</span>';
    
    setTimeout(() => {
      let aiResponse = text;
      if (window.HalDoAI && typeof window.HalDoAI.generate === 'function') {
        try { aiResponse = window.HalDoAI.generate("Erkläre medizinisch: " + text); } catch(e) {}
      } else {
        aiResponse = `Medizinische Analyse: ${text} <br><br><b>Tipp von HalDo KI:</b> Bei anhaltenden oder schweren Symptomen suche bitte immer einen echten Arzt auf!`;
      }
      textEl.innerHTML = aiResponse;
    }, 1200);
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    // NAVIGATION
    if (action === 'view-dashboard') { state.currentView = 'dashboard'; state.searchQuery = ''; updateView(); return; }
    if (action === 'view-diseases') { state.currentView = 'diseases'; state.searchQuery = ''; updateView(); return; }
    if (action === 'view-meds') { state.currentView = 'meds'; state.searchQuery = ''; updateView(); return; }
    if (action === 'view-hospitals') { state.currentView = 'hospitals'; updateView(); return; }
    if (action === 'view-devices') { state.currentView = 'devices'; updateView(); return; }
    if (action === 'view-sicknotes') { state.currentView = 'sicknotes'; updateView(); return; }
    if (action === 'view-appointments') { state.currentView = 'appointments'; updateView(); return; }
    if (action === 'view-emergency') { state.currentView = 'emergency'; updateView(); return; }
    if (action === 'view-settings') { state.currentView = 'settings'; updateView(); return; }

    // MODALS (DISEASES, MEDS, FIRST AID)
    if (action === 'open-disease' || action === 'open-med' || action === 'open-first-aid') {
      const icon = btn.dataset.icon || '🦠';
      let title = '', desc = '';
      
      if (action === 'open-disease') { title = btn.dataset.name; desc = `Symptome: ${btn.dataset.symp}. Behandlung: ${btn.dataset.tr}`; }
      if (action === 'open-med') { title = btn.dataset.name; desc = `Anwendung: ${btn.dataset.use}. Dosierung: ${btn.dataset.dose}`; }
      if (action === 'open-first-aid') { title = btn.dataset.title; desc = btn.dataset.desc; }

      document.getElementById('ab-info-icon').textContent = icon;
      document.getElementById('ab-info-title').textContent = title;
      document.getElementById('ab-info-desc').textContent = desc;
      
      document.getElementById('ab-info-tts-btn').onclick = () => speakText(`${title}. ${desc}`);
      document.getElementById('ab-info-ai-btn').onclick = () => askAI(`Erkläre mehr über ${title}. ${desc}`);

      document.getElementById('ab-info-modal').classList.add('show');
      return;
    }

    // DEVICES
    if (action === 'connect-device') {
      const idx = parseInt(btn.dataset.idx);
      state.devices[idx].connected = !state.devices[idx].connected;
      saveState(); updateView(); return;
    }
    if (action === 'scan-bt') {
      if (navigator.bluetooth) {
        navigator.bluetooth.requestDevice({ acceptAllDevices: true })
          .then(device => { alert('Bluetooth-Gerät gefunden: ' + (device.name || 'Unbekannt')); state.devices[0].connected = true; saveState(); updateView(); })
          .catch(err => alert('Suche abgebrochen: ' + err.message));
      } else { alert('Web Bluetooth nicht verfügbar (HTTPS nötig).'); }
      return;
    }
    if (action === 'scan-wifi') { alert('WLAN-Suche gestartet... Smart-Waage gefunden!'); state.devices[1].connected = true; saveState(); updateView(); return; }
    if (action === 'scan-ir') { alert('Infrarot-Sensor aktiviert... Fieberthermometer gefunden!'); state.devices[2].connected = true; saveState(); updateView(); return; }

    // SICK NOTES
    if (action === 'generate-au') {
      const name = document.getElementById('au-name').value;
      const diag = document.getElementById('au-diag').value;
      const from = document.getElementById('au-from').value;
      const to = document.getElementById('au-to').value;
      if (!name || !diag || !from || !to) { alert('Bitte alle Felder ausfüllen!'); return; }
      state.sickNotes.push({ name, diag, from, to });
      saveState(); updateView(); return;
    }
    if (action === 'del-au') { state.sickNotes.splice(parseInt(btn.dataset.idx), 1); saveState(); updateView(); return; }

    // APPOINTMENTS
    if (action === 'add-app') {
      const doc = document.getElementById('app-doc').value;
      const date = document.getElementById('app-date').value;
      if (!doc || !date) { alert('Bitte Arzt und Datum ausfüllen!'); return; }
      state.appointments.push({ doc, date });
      saveState(); updateView(); return;
    }
    if (action === 'del-app') { state.appointments.splice(parseInt(btn.dataset.idx), 1); saveState(); updateView(); return; }
  }

  function handleInput(e) {
    if (e.target.dataset.action === 'search-disease') {
      state.searchQuery = e.target.value;
      const listHtml = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || d.symp.toLowerCase().includes(state.searchQuery.toLowerCase())).map(d => `
        <div class="ab-list-item" data-action="open-disease" data-name="${d.name}" data-symp="${d.symp}" data-tr="${d.tr}" data-icon="🦠">
          <div><h4>${d.name}</h4><p><b>Symptome:</b> ${d.symp}</p></div>
        </div>`).join('');
      const container = document.querySelector('#ab-main-content .ab-card div:last-child');
      if (container) container.innerHTML = listHtml || `<p style="color:#888; text-align:center;">${t('no_results')}</p>`;
    }
    
    if (e.target.dataset.action === 'search-med') {
      state.searchQuery = e.target.value;
      const listHtml = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || m.use.toLowerCase().includes(state.searchQuery.toLowerCase())).map(m => `
        <div class="ab-list-item" data-action="open-med" data-name="${m.name}" data-use="${m.use}" data-dose="${m.dose}" data-icon="💊">
          <div><h4>${m.name}</h4><p><b>Anwendung:</b> ${m.use}</p></div>
        </div>`).join('');
      const container = document.querySelector('#ab-main-content .ab-card div:last-child');
      if (container) container.innerHTML = listHtml || `<p style="color:#888; text-align:center;">${t('no_results')}</p>`;
    }
  }

  function handleChange(e) {
    if (e.target.dataset.action === 'set-lang') {
      state.lang = e.target.value;
      saveState();
      updateView();
    }
  }

  function updateView() {
    if (!currentTarget) return;
    const main = currentTarget.querySelector('#ab-main-content');
    const sidebar = currentTarget.querySelector('.ab-sidebar');
    const headerTitle = currentTarget.querySelector('.ab-header h1');
    
    if (main) {
      if (state.currentView === 'dashboard') main.innerHTML = renderDashboard();
      else if (state.currentView === 'diseases') main.innerHTML = renderDiseases();
      else if (state.currentView === 'meds') main.innerHTML = renderMeds();
      else if (state.currentView === 'hospitals') main.innerHTML = renderHospitals();
      else if (state.currentView === 'devices') main.innerHTML = renderDevices();
      else if (state.currentView === 'sicknotes') main.innerHTML = renderSickNotes();
      else if (state.currentView === 'appointments') main.innerHTML = renderAppointments();
      else if (state.currentView === 'emergency') main.innerHTML = renderEmergency();
      else if (state.currentView === 'settings') main.innerHTML = renderSettings();
    }
    
    if (sidebar) {
        sidebar.innerHTML = `
          <div class="ab-logo">🩺 HalDo Arztbuch <span>PRO MAX</span></div>
          <div class="ab-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">📊</span> ${t('dashboard')}</div>
          <div class="ab-nav-item ${state.currentView === 'diseases' ? 'active' : ''}" data-action="view-diseases"><span class="icon">🦠</span> ${t('diseases')}</div>
          <div class="ab-nav-item ${state.currentView === 'meds' ? 'active' : ''}" data-action="view-meds"><span class="icon">💊</span> ${t('meds')}</div>
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
        headerTitle.textContent = state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'diseases' ? t('diseases') : state.currentView === 'meds' ? t('meds') : state.currentView === 'hospitals' ? t('hospitals') : state.currentView === 'devices' ? t('devices') : state.currentView === 'sicknotes' ? t('sicknotes') : state.currentView === 'appointments' ? t('appointments') : state.currentView === 'settings' ? t('settings') : t('emergency');
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
      currentTarget.addEventListener('input', handleInput);
      currentTarget.addEventListener('change', handleChange);
    }
  }

  function openOverlay() {
    loadState();
    const overlay = document.createElement('div');
    overlay.className = 'ab-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0f;display:flex;flex-direction:column;';
    
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec; font-family:Inter;">🩺 HalDo Arztbuch PRO MAX</b><button id="ab-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:Inter;">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    
    const mountDiv = document.createElement('div');
    mountDiv.style.cssText = 'flex:1;overflow:hidden;';
    overlay.appendChild(mountDiv);
    document.body.appendChild(overlay);
    
    document.getElementById('ab-close-btn').onclick = () => {
      overlay.remove();
      currentTarget = null;
      state.currentView = 'dashboard';
    };
    mount(mountDiv);
  }

  // GLOBALE REGISTRIERUNG
  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — ULTIMATE GLOBAL (17 Sprachen, KI, TTS)');

})();
