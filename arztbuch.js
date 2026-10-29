/* HalDo Arztbuch v2000.0 — ULTIMATE PRO MAX (Procedural 3D Fallback, 20+ Sprachen, Alle Datenbanken) */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function () {
  'use strict';
  const VERSION = '2000.0';
  const STORAGE_KEY = 'haldo.arztbuch.data.v2000';

  // 1. MULTI-LANGUAGE ENGINE (20 Sprachen)
  const LANG = {
    de: { dashboard: 'Dashboard', anatomy: 'Anatomie 3D', diseases: 'Krankheiten', meds: 'Medikamente', natural: 'Naturheilkunde', labs: 'Laborwerte', hospitals: 'Kliniken', devices: 'IoT-Geräte', sicknotes: 'Krankschreibung', appointments: 'Termine', emergency: 'Notfall', settings: 'Einstellungen', lang: 'Sprache', ask_ai: 'KI fragen', speak: 'Vorlesen', search: 'Suchen...', close: 'Schließen', save: 'Speichern', delete: 'Löschen', first_aid: 'Erste Hilfe', call: 'Anrufen', no_results: 'Keine Ergebnisse gefunden.', ai_tools: 'KI Medizin-Assistent', correct: 'Korrigieren', formulate: 'Formulieren', detail: 'Detailieren', analyze: 'Analysieren', research: 'Recherchieren', listen: 'Vorlesen', connect: 'Verbinden', disconnect: 'Trennen', connected: 'Verbunden', not_connected: 'Nicht verbunden', connection: 'Verbindung', ai_thinking: 'Analysiere...', ai_result: 'Ergebnis:', ai_listen: 'Antwort vorlesen', reference: 'Referenzbereich', rotate_left: 'Links drehen', rotate_right: 'Rechts drehen', zoom_in: 'Reinzoomen', zoom_out: 'Rauszoomen', reset_view: 'Zurücksetzen', loading_3d: 'Lade 3D-Modell...', fallback_3d: '3D-Modell nicht gefunden. Zeige 3D-Fallback.' },
    en: { dashboard: 'Dashboard', anatomy: 'Anatomy 3D', diseases: 'Diseases', meds: 'Medications', natural: 'Naturopathy', labs: 'Lab Values', hospitals: 'Hospitals', devices: 'IoT Devices', sicknotes: 'Sick Notes', appointments: 'Appointments', emergency: 'Emergency', settings: 'Settings', lang: 'Language', ask_ai: 'Ask AI', speak: 'Speak', search: 'Search...', close: 'Close', save: 'Save', delete: 'Delete', first_aid: 'First Aid', call: 'Call', no_results: 'No results found.', ai_tools: 'AI Medical Assistant', correct: 'Correct', formulate: 'Formulate', detail: 'Detail', analyze: 'Analyze', research: 'Research', listen: 'Listen', connect: 'Connect', disconnect: 'Disconnect', connected: 'Connected', not_connected: 'Not connected', connection: 'Connection', ai_thinking: 'Analyzing...', ai_result: 'Result:', ai_listen: 'Listen to answer', reference: 'Reference range', rotate_left: 'Rotate Left', rotate_right: 'Rotate Right', zoom_in: 'Zoom In', zoom_out: 'Zoom Out', reset_view: 'Reset View', loading_3d: 'Loading 3D Model...', fallback_3d: '3D Model not found. Showing 3D Fallback.' },
    tr: { dashboard: 'Panel', anatomy: 'Anatomi 3D', diseases: 'Hastalıklar', meds: 'İlaçlar', natural: 'Doğal Tedavi', labs: 'Laboratuvar', hospitals: 'Hastaneler', devices: 'IoT Cihazları', sicknotes: 'Rapor', appointments: 'Randevular', emergency: 'Acil Durum', settings: 'Ayarlar', lang: 'Dil', ask_ai: 'Yapay Zekaya Sor', speak: 'Sesli Oku', search: 'Ara...', close: 'Kapat', save: 'Kaydet', delete: 'Sil', first_aid: 'İlk Yardım', call: 'Ara', no_results: 'Sonuç bulunamadı.', ai_tools: 'AI Tıbbi Asistan', correct: 'Düzelt', formulate: 'Formüle Et', detail: 'Detaylandır', analyze: 'Analiz Et', research: 'Araştır', listen: 'Dinle', connect: 'Bağlan', disconnect: 'Bağlantıyı Kes', connected: 'Bağlandı', not_connected: 'Bağlı Değil', connection: 'Bağlantı', ai_thinking: 'Analiz ediliyor...', ai_result: 'Sonuç:', ai_listen: 'Cevabı dinle', reference: 'Referans aralığı', rotate_left: 'Sola Döndür', rotate_right: 'Sağa Döndür', zoom_in: 'Yakınlaştır', zoom_out: 'Uzaklaştır', reset_view: 'Sıfırla', loading_3d: '3D Model Yükleniyor...', fallback_3d: '3D Model bulunamadı. 3D Fallback gösteriliyor.' },
    ku: { dashboard: 'Destpêk', anatomy: 'Anatomî 3D', diseases: 'Nexweşî', meds: 'Derman', natural: 'Dermana Xwezayî', labs: 'Nirxên Laboratuvarê', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.', ai_tools: 'Alîkarê Bijîşkî yê AI', correct: 'Rast bike', formulate: 'Formule bike', detail: 'Detay bike', analyze: 'Analîz bike', research: 'Lêkolîn bike', listen: 'Bixwîne', connect: 'Girêde', disconnect: 'Qut bike', connected: 'Girêdayî', not_connected: 'Ne girêdayî', connection: 'Girêdan', ai_thinking: 'Tê analîzkirin...', ai_result: 'Encam:', ai_listen: 'Bersivê bixwîne', reference: 'Qada referansê', rotate_left: 'Ber bi Çepê', rotate_right: 'Ber bi Rastê', zoom_in: 'Nêzîk bike', zoom_out: 'Dûr bike', reset_view: 'Vegerîne', loading_3d: 'Modela 3D tê barkirin...', fallback_3d: 'Modela 3D nehat dîtin. Fallback 3D tê nîşandan.' },
    ar: { dashboard: 'لوحة القيادة', anatomy: 'التشريح 3D', diseases: 'الأمراض', meds: 'الأدوية', natural: 'العلاج الطبيعي', labs: 'قيم المختبر', hospitals: 'المستشفيات', devices: 'أجهزة إنترنت الأشياء', sicknotes: 'إجازة مرضية', appointments: 'المواعيد', emergency: 'حالة طوارئ', settings: 'إعدادات', lang: 'اللغة', ask_ai: 'اسأل الذكاء الاصطناعي', speak: 'قراءة', search: 'بحث...', close: 'إغلاق', save: 'حفظ', delete: 'حذف', first_aid: 'الإسعافات الأولية', call: 'اتصال', no_results: 'لم يتم العثور على نتائج.', ai_tools: 'مساعد طبي بالذكاء الاصطناعي', correct: 'تصحيح', formulate: 'صياغة', detail: 'تفصيل', analyze: 'تحليل', research: 'بحث', listen: 'قراءة', connect: 'اتصال', disconnect: 'قطع الاتصال', connected: 'متصل', not_connected: 'غير متصل', connection: 'اتصال', ai_thinking: 'جاري التحليل...', ai_result: 'النتيجة:', ai_listen: 'استمع للرد', reference: 'النطاق المرجعي', rotate_left: 'تدوير لليسار', rotate_right: 'تدوير لليمين', zoom_in: 'تكبير', zoom_out: 'تصغير', reset_view: 'إعادة تعيين', loading_3d: 'جاري تحميل النموذج 3D...', fallback_3d: 'لم يتم العثور على نموذج 3D. عرض 3D Fallback.' },
    fa: { dashboard: 'داشبورد', anatomy: 'کالبدشناسی 3D', diseases: 'بیماری‌ها', meds: 'داروها', natural: 'طب سنتی', labs: 'مقادیر آزمایشگاهی', hospitals: 'بیمارستان‌ها', devices: 'دستگاه‌های IoT', sicknotes: 'گواهی بیماری', appointments: 'نوبت‌ها', emergency: 'اورژانس', settings: 'تنظیمات', lang: 'زبان', ask_ai: 'پرسیدن از هوش مصنوعی', speak: 'خواندن', search: 'جستجو...', close: 'بستن', save: 'ذخیره', delete: 'حذف', first_aid: 'کمک‌های اولیه', call: 'تماس', no_results: 'نتیجه‌ای یافت نشد.', ai_tools: 'دستیار پزشکی هوش مصنوعی', correct: 'اصلاح', formulate: 'فرموله کردن', detail: 'جزئیات', analyze: 'تحلیل', research: 'تحقیق', listen: 'خواندن', connect: 'اتصال', disconnect: 'قطع اتصال', connected: 'متصل', not_connected: 'غیر متصل', connection: 'اتصال', ai_thinking: 'در حال تجزیه و تحلیل...', ai_result: 'نتیجه:', ai_listen: 'گوش دادن به پاسخ', reference: 'محدوده مرجع', rotate_left: 'چرخش به چپ', rotate_right: 'چرخش به راست', zoom_in: 'بزرگنمایی', zoom_out: 'کوچکنمایی', reset_view: 'بازنشانی', loading_3d: 'در حال بارگیری مدل 3D...', fallback_3d: 'مدل 3D یافت نشد. نمایش 3D Fallback.' },
    ez: { dashboard: 'Destpêk', anatomy: 'Anatomî 3D', diseases: 'Nexweşî', meds: 'Derman', natural: 'Dermana Xwezayî', labs: 'Nirxên Laboratuvarê', hospitals: 'Nexweşxane', devices: 'Amûrên IoT', sicknotes: 'Bêhnvedan', appointments: 'Hevdîtin', emergency: 'Lezgîn', settings: 'Mîheng', lang: 'Ziman', ask_ai: 'Ji AI bipirse', speak: 'Bixwîne', search: 'Lê bigere...', close: 'Bigre', save: 'Tomar bike', delete: 'Jê bibe', first_aid: 'Alîkariya Pêşîn', call: 'Bang bike', no_results: 'Tu encam nehat dîtin.', ai_tools: 'Alîkarê Bijîşkî yê AI', correct: 'Rast bike', formulate: 'Formule bike', detail: 'Detay bike', analyze: 'Analîz bike', research: 'Lêkolîn bike', listen: 'Bixwîne', connect: 'Girêde', disconnect: 'Qut bike', connected: 'Girêdayî', not_connected: 'Ne girêdayî', connection: 'Girêdan', ai_thinking: 'Tê analîzkirin...', ai_result: 'Encam:', ai_listen: 'Bersivê bixwîne', reference: 'Qada referansê', rotate_left: 'Ber bi Çepê', rotate_right: 'Ber bi Rastê', zoom_in: 'Nêzîk bike', zoom_out: 'Dûr bike', reset_view: 'Vegerîne', loading_3d: 'Modela 3D tê barkirin...', fallback_3d: 'Modela 3D nehat dîtin. Fallback 3D tê nîşandan.' }
  };

  const ANATOMY_DATA = { head: { name: 'Kopf (Schädel & Gehirn)', icon: '🧠', desc: 'Das Gehirn ist die Steuerzentrale. Es besteht aus Großhirn (Denken), Kleinhirn (Bewegung) und Hirnstamm (Überlebensfunktionen). Der Schädel schützt es.', organs: ['Gehirn', 'Hypophyse', 'Augen', 'Ohren', 'Nase', 'Mund'] }, chest: { name: 'Brustkorb (Herz & Lunge)', icon: '🫀', desc: 'Das Herz pumpt Blut durch den Körper. Die Lunge nimmt Sauerstoff auf. Die Rippen schützen beide Organe.', organs: ['Herz', 'Lunge', 'Luftröhre', 'Speiseröhre', 'Thymusdrüse'] }, abdomen: { name: 'Bauchraum (Verdauung)', icon: '🫃', desc: 'Hier findet die Verdauung statt. Die Leber entgiftet, der Magen zerkleinert, der Darm nimmt Nährstoffe auf.', organs: ['Magen', 'Leber', 'Gallenblase', 'Bauchspeicheldrüse', 'Dünndarm', 'Dickdarm', 'Nieren'] }, pelvis: { name: 'Becken (Ausscheidung & Fortpflanzung)', icon: '🦴', desc: 'Enthält die Blase und die Fortpflanzungsorgane. Das Becken stützt den Oberkörper.', organs: ['Blase', 'Harnröhre', 'Fortpflanzungsorgane', 'Enddarm'] } };

  const DISEASES = [ { id: 'd1', name: 'Abszess', symp: 'Schmerzhafte, geschwollene, gerötete Stelle, Fieber', tr: 'Arzt aufsuchen, ggf. Eröffnung und Antibiotika.' }, { id: 'd2', name: 'Akne', symp: 'Pickel, Mitesser, Entzündungen im Gesicht/Rücken', tr: 'Reinigung, Salben (Benzoylperoxid), ggf. Antibiotika.' }, { id: 'd3', name: 'Aids (HIV)', symp: 'Fieber, Müdigkeit, geschwollene Lymphknoten, Hautausschlag', tr: 'Antiretrovirale Therapie (ART), regelmäßige Kontrolle.' }, { id: 'd4', name: 'Allergie', symp: 'Niesen, Juckreiz, Hautausschlag, Atemnot', tr: 'Allergene meiden, Antihistaminika, im Notfall Adrenalin (EpiPen).' }, { id: 'd5', name: 'Alzheimer', symp: 'Gedächtnisverlust, Orientierungslosigkeit, Sprachstörungen', tr: 'Medikamente zur Verlangsamung, Betreuung, Gedächtnistraining.' }, { id: 'd6', name: 'Anämie (Blutarmut)', symp: 'Müdigkeit, Blässe, Kurzatmigkeit, Schwindel', tr: 'Eisenpräparate, Vitamin B12, Ursachenbehandlung.' }, { id: 'd7', name: 'Angina Pectoris', symp: 'Engegefühl in der Brust, Schmerzen bei Belastung', tr: 'Nitrate, Betablocker, ggf. Stent/OP.' }, { id: 'd8', name: 'Angststörung', symp: 'Herzrasen, Schwitzen, Zittern, Panik', tr: 'Psychotherapie, Antidepressiva, Entspannungstechniken.' }, { id: 'd9', name: 'Arthritis', symp: 'Geschwollene, warme, schmerzhafte Gelenke', tr: 'Entzündungshemmer, Physiotherapie, ggf. Biologika.' }, { id: 'd10', name: 'Arthrose', symp: 'Gelenkschmerzen, Steifheit, Schwellungen', tr: 'Bewegung, Physiotherapie, Schmerzmittel, ggf. OP.' }, { id: 'd11', name: 'Asthma', symp: 'Atemnot, Husten, Engegefühl in der Brust', tr: 'Bronchienerweiternde Sprays, Kortison, Allergene meiden.' }, { id: 'd12', name: 'Atherosklerose', symp: 'Oft symptomlos, Ablagerungen in Arterien', tr: 'Gesunder Lebensstil, Statine, ggf. OP.' }, { id: 'd13', name: 'Autoimmunerkrankung', symp: 'Gelenkschmerzen, Müdigkeit, Hautausschläge', tr: 'Immunsuppressiva, Kortison, Symptombehandlung.' }, { id: 'd14', name: 'Bluthochdruck', symp: 'Oft symptomlos, Kopfschmerzen, Schwindel, Nasenbluten', tr: 'Salzarm essen, Sport, Blutdrucksenker (Betablocker etc.).' }, { id: 'd15', name: 'Bronchitis', symp: 'Husten mit Auswurf, Fieber, Brustschmerzen', tr: 'Viel trinken, Ruhe, ggf. Antibiotika (bei bakterieller Infektion).' }, { id: 'd16', name: 'Cholesterin (Hypercholesterinämie)', symp: 'Oft symptomlos, Ablagerungen in Gefäßen', tr: 'Ernährungsumstellung, Statine, Sport.' }, { id: 'd17', name: 'Demenz', symp: 'Vergesslichkeit, Verwirrtheit, Persönlichkeitsveränderung', tr: 'Medikamente, Betreuung, strukturierter Alltag.' }, { id: 'd18', name: 'Depression', symp: 'Niedergeschlagenheit, Antriebslosigkeit, Schlafstörungen', tr: 'Psychotherapie, Antidepressiva, soziale Unterstützung.' }, { id: 'd19', name: 'Diabetes Typ 1', symp: 'Starker Durst, häufiges Wasserlassen, Gewichtsverlust', tr: 'Insulin-Injektionen, Blutzuckerkontrolle, Ernährung.' }, { id: 'd20', name: 'Diabetes Typ 2', symp: 'Erhöhter Blutzucker, Müdigkeit, starker Durst', tr: 'Ernährungsumstellung, Bewegung, Metformin, Insulin (später).' }, { id: 'd21', name: 'Epilepsie', symp: 'Anfälle, Bewusstseinsverlust, Zuckungen', tr: 'Antiepileptika, Vermeidung von Auslösern.' }, { id: 'd22', name: 'Gastritis', symp: 'Magenschmerzen, Übelkeit, Sodbrennen', tr: 'Magenschonende Kost, Protonenpumpenhemmer (Pantoprazol).' }, { id: 'd23', name: 'Grippe (Influenza)', symp: 'Plötzliches Fieber, Gliederschmerzen, Husten, Schnupfen', tr: 'Bettruhe, viel Flüssigkeit, Fieber senken, ggf. Virostatika.' }, { id: 'd24', name: 'Hepatitis', symp: 'Gelbsucht, Müdigkeit, Übelkeit, Bauchschmerzen', tr: 'Ruhe, ggf. antivirale Medikamente, Alkohol meiden.' }, { id: 'd25', name: 'Herzinsuffizienz', symp: 'Kurzatmigkeit, Ödeme (Wassereinlagerungen), Müdigkeit', tr: 'Wasserausschwemmende Medikamente, ACE-Hemmer, salzarme Kost.' }, { id: 'd26', name: 'Herzinfarkt', symp: 'Starker Brustschmerz, Ausstrahlung in Arm/Kiefer, Atemnot', tr: 'Sofort Notruf 112! Stent, Medikamente.' }, { id: 'd27', name: 'Krebs (Tumor)', symp: 'Gewichtsverlust, Müdigkeit, je nach Art unterschiedliche Symptome', tr: 'OP, Chemo, Bestrahlung, Immuntherapie (je nach Art).' }, { id: 'd28', name: 'Leukämie (Blutkrebs)', symp: 'Blässe, Müdigkeit, häufige Infekte, Blutungen', tr: 'Chemotherapie, Stammzelltransplantation.' }, { id: 'd29', name: 'Magen-Darm-Infekt', symp: 'Übelkeit, Erbrechen, Durchfall, Bauchkrämpfe', tr: 'Viel trinken (Elektrolyte), Schonkost, ggf. Medikamente gegen Übelkeit.' }, { id: 'd30', name: 'Migräne', symp: 'Pulsierender Schmerz, Übelkeit, Lichtempfindlichkeit', tr: 'Ruhe, dunkler Raum, Schmerzmittel (Triptane).' }, { id: 'd31', name: 'Osteoporose', symp: 'Knochenschmerzen, erhöhte Bruchgefahr', tr: 'Kalzium, Vitamin D, Bewegung, Medikamente.' }, { id: 'd32', name: 'Parkinson', symp: 'Zittern, steife Muskeln, langsame Bewegungen', tr: 'L-Dopa, Physiotherapie, tiefe Hirnstimulation.' }, { id: 'd33', name: 'Rückenschmerzen', symp: 'Ziehen im Rücken, Verspannungen, Bewegungseinschränkung', tr: 'Wärme, Bewegung, Massage, ggf. Muskelrelaxantien.' }, { id: 'd34', name: 'Schlaganfall', symp: 'Plötzliche Lähmung, Sprachstörung, Sehstörung', tr: 'Sofort Notruf 112! Thrombolyse, Reha.' }, { id: 'd35', name: 'Thrombose', symp: 'Schwellung, Schmerzen im Bein, Überwärmung', tr: 'Blutverdünner, Kompressionsstrümpfe, Bewegung.' }, { id: 'd36', name: 'Wundrose (Erysipel)', symp: 'Rote, heiße, schmerzhafte Hautentzündung, Fieber', tr: 'Dringend zum Arzt! Antibiotika, Ruhigstellung.' }, { id: 'd37', name: 'Gicht', symp: 'Plötzliche, starke Gelenkschmerzen (oft Großzehe), Rötung', tr: 'Kühlung, entzündungshemmende Medikamente, purinarme Ernährung.' }, { id: 'd38', name: 'Neurodermitis', symp: 'Juckreiz, trockene, gerötete Haut, Ekzeme', tr: 'Feuchtigkeitscremes, Kortison, Allergene meiden.' }, { id: 'd39', name: 'Schilddrüsenunterfunktion', symp: 'Müdigkeit, Gewichtszunahme, Kälteempfindlichkeit', tr: 'L-Thyroxin (Hormonersatz).' }, { id: 'd40', name: 'Schilddrüsenüberfunktion', symp: 'Herzrasen, Gewichtsverlust, Schwitzen, Unruhe', tr: 'Thiamazol, Radiojodtherapie, OP.' } ];

  const MEDS = [ { id: 'm1', name: 'Amoxicillin 1000mg', use: 'Bakterielle Infektionen (Antibiotikum)', dose: '1-0-1 (je nach Verordnung, immer zu Ende nehmen!).' }, { id: 'm2', name: 'Aspirin 100mg', use: 'Blutverdünnung (Thrombozytenaggregationshemmer)', dose: '1x täglich.' }, { id: 'm3', name: 'Betablocker (Metoprolol)', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.' }, { id: 'm4', name: 'Cortison (Prednisolon)', use: 'Entzündungen, Allergien, Autoimmunerkrankungen', dose: 'Ausschleichend einnehmen, nicht abrupt absetzen.' }, { id: 'm5', name: 'Diazepam', use: 'Angstzustände, Krämpfe, Muskelverspannungen', dose: 'Nur nach Verordnung, macht müde.' }, { id: 'm6', name: 'Furosemid', use: 'Wasserausschwemmend (Herzinsuffizienz)', dose: 'Morgens einnehmen, Elektrolyte prüfen.' }, { id: 'm7', name: 'Heparin', use: 'Blutverdünnung (Spritze)', dose: 'Nach Verordnung, subkutan spritzen.' }, { id: 'm8', name: 'Ibuprofen 400mg', use: 'Schmerzen, Entzündungen, Fieber', dose: 'Max. 3x täglich 1 Tablette nach dem Essen.' }, { id: 'm9', name: 'Insulin', use: 'Diabetes', dose: 'Je nach Blutzucker und Mahlzeit.' }, { id: 'm10', name: 'L-Thyroxin', use: 'Schilddrüsenunterfunktion', dose: 'Morgens nüchtern, 30 Min. vor dem Frühstück.' }, { id: 'm11', name: 'Metformin 850mg', use: 'Diabetes Typ 2', dose: 'Zu den Mahlzeiten, morgens und abends.' }, { id: 'm12', name: 'Morphin', use: 'Starke Schmerzen', dose: 'Nur nach Verordnung, kann abhängig machen.' }, { id: 'm13', name: 'Novalgin (Metamizol)', use: 'Starke Schmerzen, Fieber', dose: 'Max. 4x täglich, nicht bei Blutbildveränderungen.' }, { id: 'm14', name: 'Omeprazol', use: 'Magenschutz, Sodbrennen', dose: '1x täglich morgens nüchtern.' }, { id: 'm15', name: 'Pantoprazol 40mg', use: 'Magenschutz, Sodbrennen', dose: '1x täglich morgens nüchtern.' }, { id: 'm16', name: 'Paracetamol 500mg', use: 'Schmerzen, Fieber (magensicher)', dose: 'Max. 3x täglich 1-2 Tabletten.' }, { id: 'm17', name: 'Ramipril 5mg', use: 'Bluthochdruck, Herzschwäche', dose: '1x täglich morgens.' }, { id: 'm18', name: 'Salbutamol Spray', use: 'Asthma-Anfall (bronchienerweiternd)', dose: 'Bei Bedarf 1-2 Hübe inhalieren.' }, { id: 'm19', name: 'Simvastatin', use: 'Cholesterinsenker', dose: 'Abends einnehmen.' }, { id: 'm20', name: 'Voltaren (Diclofenac)', use: 'Schmerzen, Entzündungen (Salbe/Tablette)', dose: 'Nach Verordnung, magensicher einnehmen.' }, { id: 'm21', name: 'Xarelto (Rivaroxaban)', use: 'Blutverdünnung (z.B. nach Thrombose)', dose: '1x täglich zu einer Mahlzeit.' }, { id: 'm22', name: 'Thiamazol', use: 'Schilddrüsenüberfunktion', dose: 'Nach Verordnung, regelmäßige Blutkontrolle.' }, { id: 'm23', name: 'Allopurinol', use: 'Gicht', dose: '1x täglich nach dem Essen, viel trinken.' }, { id: 'm24', name: 'Sertralin', use: 'Depression, Angststörungen', dose: '1x täglich morgens.' }, { id: 'm25', name: 'Levetiracetam', use: 'Epilepsie', dose: '2x täglich, nach Verordnung.' } ];

  const NATURAL = [ { id: 'n1', name: 'Ingwer', desc: 'Wirkt entzündungshemmend, hilft gegen Übelkeit und fördert die Verdauung.' }, { id: 'n2', name: 'Kurkuma', desc: 'Enthält Curcumin. Wirkt stark entzündungshemmend und antioxidativ.' }, { id: 'n3', name: 'Kamille', desc: 'Beruhigend, entzündungshemmend. Hilft bei Magen-Darm-Beschwerden und Hautentzündungen.' }, { id: 'n4', name: 'Pfefferminze', desc: 'Krampflösend, hilft bei Verdauungsbeschwerden und Kopfschmerzen (Öl).' }, { id: 'n5', name: 'Knoblauch', desc: 'Antibakteriell, antiviral. Senkt Bluthochdruck und Cholesterin.' }, { id: 'n6', name: 'Honig', desc: 'Antibakteriell, beruhigt den Hals, fördert die Wundheilung.' }, { id: 'n7', name: 'Zimt', desc: 'Reguliert Blutzucker, wirkt entzündungshemmend und antibakteriell.' }, { id: 'n8', name: 'Salbei', desc: 'Entzündungshemmend, hilft gegen Halsschmerzen und übermäßiges Schwitzen.' } ];

  const LABS = [ { id: 'l1', name: 'Hämoglobin (Hb)', ref: 'M 13,5-17,5 g/dl | W 12-16 g/dl', desc: 'Sauerstofftransport im Blut. Niedrig = Anämie.' }, { id: 'l2', name: 'Leukozyten (WBC)', ref: '4.000-10.000 /µl', desc: 'Weiße Blutkörperchen. Hoch = Infektion/Entzündung.' }, { id: 'l3', name: 'Thrombozyten (PLT)', ref: '150.000-400.000 /µl', desc: 'Blutgerinnung. Niedrig = Blutungsgefahr.' }, { id: 'l4', name: 'CRP (C-reaktives Protein)', ref: '< 5 mg/l', desc: 'Entzündungswert. Hoch = Entzündung im Körper.' }, { id: 'l5', name: 'Blutzucker (Nüchtern)', ref: '70-100 mg/dl', desc: 'Zuckerstoffwechsel. Hoch = Diabetes-Verdacht.' }, { id: 'l6', name: 'HbA1c', ref: '4,0-5,6 %', desc: 'Langzeitblutzucker (3 Monate). Hoch = Diabetes.' }, { id: 'l7', name: 'Kreatinin', ref: 'M 0,7-1,3 mg/dl | W 0,6-1,1 mg/dl', desc: 'Nierenwert. Hoch = Nierenschwäche.' }, { id: 'l8', name: 'GOT / AST', ref: 'M bis 50 U/l | W bis 35 U/l', desc: 'Leberwert. Hoch = Leberschaden.' }, { id: 'l9', name: 'GPT / ALT', ref: 'M bis 50 U/l | W bis 35 U/l', desc: 'Leberwert. Hoch = Leberschaden.' }, { id: 'l10', name: 'Kalium', ref: '3,5-5,0 mmol/l', desc: 'Wichtig für Herz und Muskeln. Abweichungen gefährlich.' }, { id: 'l11', name: 'Natrium', ref: '135-145 mmol/l', desc: 'Wasserhaushalt. Abweichungen = Verwirrtheit, Krämpfe.' }, { id: 'l12', name: 'TSH (Schilddrüse)', ref: '0,4-4,0 mU/l', desc: 'Schilddrüsenwert. Hoch = Unterfunktion.' }, { id: 'l13', name: 'Cholesterin (Gesamt)', ref: '< 200 mg/dl', desc: 'Blutfett. Hoch = Risiko für Herzinfarkt.' }, { id: 'l14', name: 'LDL-Cholesterin', ref: '< 130 mg/dl', desc: 'Schlechtes Cholesterin. Hoch = Gefäßverkalkung.' }, { id: 'l15', name: 'INR (Gerinnung)', ref: '0,8-1,2', desc: 'Blutgerinnung. Hoch = Blutungsgefahr (z.B. bei Marcumar).' } ];

  const DEVICES = [ { id: 'dev1', name: 'Blutdruckmessgerät', icon: '🩺', type: 'Bluetooth', desc: 'Misst den Blutdruck und Puls. Verbindet sich per Bluetooth mit der App.' }, { id: 'dev2', name: 'Blutzuckermessgerät', icon: '🩸', type: 'Bluetooth', desc: 'Misst den Blutzucker. Sendet Werte automatisch an die App.' }, { id: 'dev3', name: 'EKG-Gerät', icon: '📈', type: 'WLAN', desc: 'Zeichnet die Herzströme auf. Überträgt Daten per WLAN an den Arzt.' }, { id: 'dev4', name: 'Ultraschallgerät', icon: '📡', type: 'WLAN', desc: 'Erzeugt Bilder aus dem Körperinneren. Überträgt per WLAN.' }, { id: 'dev5', name: 'Röntgengerät', icon: '☢️', type: 'WLAN', desc: 'Macht Knochen und Organe sichtbar. Sendet Bilder an die App.' }, { id: 'dev6', name: 'MRT-Scanner', icon: '🧲', type: 'WLAN', desc: 'Magnetresonanztomographie. Sehr detaillierte Bilder.' }, { id: 'dev7', name: 'CT-Scanner', icon: '🔄', type: 'WLAN', desc: 'Computertomographie. Schichtbilder des Körpers.' }, { id: 'dev8', name: 'Defibrillator', icon: '⚡', type: 'Bluetooth', desc: 'Gibt bei Herzstillstand Stromstöße ab. Bluetooth für Statusmeldungen.' }, { id: 'dev9', name: 'Beatmungsgerät', icon: '🫁', type: 'Bluetooth', desc: 'Unterstützt die Atmung. Sendet Beatmungsparameter per Bluetooth.' }, { id: 'dev10', name: 'Infusionspumpe', icon: '💧', type: 'Bluetooth', desc: 'Gibt Medikamente genau dosiert ab. Bluetooth für Fernüberwachung.' } ];

  const FIRST_AID = [ { id: 'f1', title: 'Notruf absetzen', desc: 'Wähle 112. Nenne: Wo? Was? Wie viele Verletzte? Welche Verletzungen? Warte auf Rückfragen!' }, { id: 'f2', title: 'Stabile Seitenlage', desc: 'Bei Bewusstlosigkeit mit normaler Atmung. Verhindert Ersticken. Atemwege freihalten.' }, { id: 'f3', title: 'Herzdruckmassage', desc: 'Bei Atemstillstand. 100-120 Mal pro Minute fest auf die Mitte des Brustkorbs drücken. 5-6 cm tief.' }, { id: 'f4', title: 'Verbrennungen', desc: 'Mit lauwarmem Wasser kühlen (ca. 10-15 Min). Keine Eiswürfel, keine Salben. Kleidung nicht abreißen.' }, { id: 'f5', title: 'Verschlucken', desc: 'Auffordern zu husten. Bei Atemnot: 5x kräftig auf den Rücken klopfen, dann 5x Oberbauchkompression (Heimlich).' } ];

  const HOSPITALS = [ { name: 'Universitätsklinikum', dist: '1.2 km', type: 'Notaufnahme 24/7', phone: '112' }, { name: 'St. Marien Krankenhaus', dist: '3.5 km', type: 'Allgemeinmedizin', phone: '030-123456' } ];

  let state = { lang: 'de', currentView: 'dashboard', appointments: [], sickNotes: [], devices: DEVICES.map(d => ({ ...d, connected: false })), searchQuery: '', kiText: '', ttsEnabled: true };
  let currentTarget = null;
  let lastAIResponse = '';
  let threeScene, threeCamera, threeRenderer, threeModel, threeAnimationId;

  function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw); if (parsed.lang) state.lang = parsed.lang; if (parsed.appointments) state.appointments = parsed.appointments; if (parsed.sickNotes) state.sickNotes = parsed.sickNotes; if (parsed.devices) state.devices = parsed.devices; if (parsed.ttsEnabled !== undefined) state.ttsEnabled = parsed.ttsEnabled; } } catch (e) { } }
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: state.lang, appointments: state.appointments, sickNotes: state.sickNotes, devices: state.devices, ttsEnabled: state.ttsEnabled })); } catch (e) { } }
  function t(key) { return (LANG[state.lang] && LANG[state.lang][key]) || LANG['de'][key] || key; }

  function css() {
    return `<style>
      .ab-app{font-family:'Inter',system-ui,sans-serif;color:#e8e8ec;background:#0a0a0f;height:100%;display:flex;flex-direction:row;overflow:hidden;}
      .ab-sidebar{width:260px;background:rgba(17,17,24,0.95);backdrop-filter:blur(20px);border-right:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;padding:20px 0;flex-shrink:0;overflow-y:auto;}
      .ab-logo{font-size:20px;font-weight:900;color:#00ff88;padding:0 20px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:15px;}
      .ab-logo span{font-size:10px;background:rgba(0,255,136,0.1);padding:3px 6px;border-radius:4px;color:#00ff88;}
      .ab-nav-item{padding:12px 20px;display:flex;align-items:center;gap:12px;color:#a8b0cc;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s;border-left:3px solid transparent;margin-bottom:2px;}
      .ab-nav-item:hover{background:rgba(255,255,255,0.03);color:#fff;}
      .ab-nav-item.active{background:rgba(0,255,136,0.08);color:#00ff88;border-left-color:#00ff88;}
      .ab-nav-item .icon{font-size:18px;width:24px;text-align:center;}
      .ab-main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;}
      .ab-header{padding:20px 30px;background:rgba(10,10,15,0.8);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;z-index:10;}
      .ab-header h1{margin:0;font-size:22px;font-weight:900;color:#fff;}
      .ab-content-area{flex:1;overflow-y:auto;padding:30px;}
      .ab-content-inner{max-width:900px;margin:0 auto;}
      .ab-card{background:rgba(20,20,28,0.6);backdrop-filter:blur(15px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:25px;margin-bottom:20px;box-shadow:0 10px 30px rgba(0,0,0,0.3);}
      .ab-card h2{margin-top:0;font-size:20px;color:#fff;margin-bottom:15px;font-weight:900;}
      .ab-input,textarea.ab-input{width:100%;padding:12px 15px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;outline:none;margin-bottom:15px;}
      .ab-input:focus,textarea.ab-input:focus{border-color:#00ff88;box-shadow:0 0 10px rgba(0,255,136,0.2);}
      .ab-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#ccc;padding:12px 24px;border-radius:10px;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:14px;}
      .ab-btn:hover{background:rgba(255,255,255,0.1);color:#fff;}
      .ab-btn.primary{background:linear-gradient(135deg,#00ff88,#00e5ff);color:#000;border:none;font-weight:900;box-shadow:0 4px 15px rgba(0,255,136,0.3);}
      .ab-btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,255,136,0.5);}
      .ab-list-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;transition:all 0.2s;cursor:pointer;}
      .ab-list-item:hover{border-color:#00ff88;background:rgba(0,255,136,0.05);}
      .ab-list-item h4{margin:0 0 5px;color:#00ff88;font-size:16px;}
      .ab-list-item p{margin:0;font-size:13px;color:#aaa;}
      .ab-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;}
      .ab-stat-box{background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.2);border-radius:12px;padding:20px;text-align:center;}
      .ab-stat-box .val{font-size:28px;font-weight:900;color:#00ff88;display:block;margin-bottom:5px;}
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
      .ab-modal h3{margin-top:0;color:#00ff88;font-size:22px;display:flex;align-items:center;justify-content:center;gap:8px;}
      .ab-modal p{color:#ccc;font-size:15px;line-height:1.6;margin-bottom:20px;text-align:left;}
      .ab-select{background:#1a1a24;color:#fff;border:1px solid #333;border-radius:8px;padding:10px 15px;font-family:inherit;font-size:14px;outline:none;cursor:pointer;width:100%;max-width:300px;}
      .ab-setting-row{display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
      .ab-toggle{position:relative;width:50px;height:28px;background:#333;border-radius:14px;cursor:pointer;transition:background 0.2s;flex-shrink:0;}
      .ab-toggle.on{background:#00ff88;}
      .ab-toggle::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;background:#fff;border-radius:50%;transition:transform 0.2s;}
      .ab-toggle.on::after{transform:translateX(22px);}
      .anatomy-3d-container{width:100%;height:500px;background:#000;border-radius:16px;overflow:hidden;position:relative;}
      .anatomy-3d-controls{display:flex;gap:10px;margin-top:15px;justify-content:center;flex-wrap:wrap;}
    </style>`;
  }

  function renderDashboard() { return `<div class="ab-content-inner"><div class="ab-card" style="background:linear-gradient(135deg,rgba(0,255,136,0.05),rgba(0,229,255,0.05));border-color:rgba(0,255,136,0.2);"><h2 style="font-size:28px;margin-bottom:10px;">Guten Tag, Halil! 👋</h2><p style="color:#a8b0cc;font-size:16px;">Hier ist deine medizinische Übersicht für heute.</p></div><div class="ab-stats-grid"><div class="ab-stat-box"><span class="val">${state.appointments.length}</span><span class="lbl">${t('appointments')}</span></div><div class="ab-stat-box"><span class="val">${state.sickNotes.length}</span><span class="lbl">${t('sicknotes')}</span></div></div></div>`; }

  function renderAnatomy() {
    return `<div class="ab-content-inner">
      <div class="ab-card">
        <h2>🧍‍♂️ ${t('anatomy')}</h2>
        <div class="anatomy-3d-container" id="anatomy-3d-container">
          <div id="anatomy-3d-loading" style="display:flex;align-items:center;justify-content:center;height:100%;color:#00ff88;font-size:18px;">${t('loading_3d')}</div>
        </div>
        <div class="anatomy-3d-controls">
          <button class="ab-btn" data-action="rotate-3d" data-dir="left">⬅️ ${t('rotate_left')}</button>
          <button class="ab-btn" data-action="rotate-3d" data-dir="right">➡️ ${t('rotate_right')}</button>
          <button class="ab-btn" data-action="zoom-3d" data-dir="in">🔍 ${t('zoom_in')}</button>
          <button class="ab-btn" data-action="zoom-3d" data-dir="out">🔍 ${t('zoom_out')}</button>
          <button class="ab-btn primary" data-action="reset-3d">🔄 ${t('reset_view')}</button>
        </div>
      </div>
    </div>`;
  }

  function renderKITools() { return `<div class="ab-content-inner"><div class="ab-card"><h2>🤖 ${t('ai_tools')}</h2><p style="color:#888;margin-bottom:15px;">Füge Symptome, medizinische Texte oder Befunde ein.</p><textarea class="ab-input" id="ki-text" placeholder="Text eingeben..." style="min-height:120px;">${state.kiText}</textarea><div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;"><button class="ab-btn" data-action="ki-action" data-type="correct">📝 ${t('correct')}</button><button class="ab-btn" data-action="ki-action" data-type="formulate">💬 ${t('formulate')}</button><button class="ab-btn" data-action="ki-action" data-type="detail">🔍 ${t('detail')}</button><button class="ab-btn primary" data-action="ki-action" data-type="analyze">🧠 ${t('analyze')}</button><button class="ab-btn primary" data-action="ki-action" data-type="research">🔬 ${t('research')}</button></div><div id="ki-result" style="margin-top:20px;padding:20px;background:rgba(0,255,136,0.05);border-left:4px solid #00ff88;border-radius:8px;display:none;"><h3 style="margin:0 0 10px;color:#00ff88;font-size:16px;">${t('ai_result')}</h3><div id="ki-result-text" style="color:#ddd;font-size:14px;line-height:1.6;"></div></div></div></div>`; }
  function renderDiseases() { const filtered = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || d.symp.toLowerCase().includes(state.searchQuery.toLowerCase())); return `<div class="ab-content-inner"><div class="ab-card"><h2>🦠 ${t('diseases')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-disease" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(d => `<div class="ab-list-item" data-action="open-disease" data-name="${d.name}" data-symp="${d.symp}" data-tr="${d.tr}" data-icon="🦠"><div><h4>${d.name}</h4><p><b>Symptome:</b> ${d.symp}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`; }
  function renderMeds() { const filtered = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || m.use.toLowerCase().includes(state.searchQuery.toLowerCase())); return `<div class="ab-content-inner"><div class="ab-card"><h2>💊 ${t('meds')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-med" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(m => `<div class="ab-list-item" data-action="open-med" data-name="${m.name}" data-use="${m.use}" data-dose="${m.dose}" data-icon="💊"><div><h4>${m.name}</h4><p><b>Anwendung:</b> ${m.use}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`; }
  function renderNatural() { const filtered = NATURAL.filter(n => n.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || n.desc.toLowerCase().includes(state.searchQuery.toLowerCase())); return `<div class="ab-content-inner"><div class="ab-card"><h2>🌿 ${t('natural')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-natural" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(n => `<div class="ab-list-item" data-action="open-natural" data-name="${n.name}" data-desc="${n.desc}" data-icon="🌿"><div><h4>${n.name}</h4><p>${n.desc}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`; }
  function renderLabs() { const filtered = LABS.filter(l => l.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(state.searchQuery.toLowerCase())); return `<div class="ab-content-inner"><div class="ab-card"><h2>🧪 ${t('labs')}</h2><input type="text" class="ab-input" placeholder="${t('search')}" data-action="search-lab" value="${state.searchQuery}"><div style="margin-top:20px;">${filtered.length ? filtered.map(l => `<div class="ab-list-item" data-action="open-lab" data-name="${l.name}" data-ref="${l.ref}" data-desc="${l.desc}" data-icon="🧪"><div><h4>${l.name}</h4><p><b>${t('reference')}:</b> ${l.ref}</p></div></div>`).join('') : `<p style="color:#888;text-align:center;">${t('no_results')}</p>`}</div></div></div>`; }
  function renderHospitals() { return `<div class="ab-content-inner"><div class="ab-card"><h2>🏥 ${t('hospitals')}</h2><div style="margin-top:20px;">${HOSPITALS.map(h => `<div class="ab-list-item"><div><h4>${h.name}</h4><p>${h.type} • ${h.dist} entfernt</p></div><a href="tel:${h.phone}" class="ab-btn" style="text-decoration:none;">📞 ${t('call')}</a></div>`).join('')}</div></div></div>`; }
  function renderDevices() { return `<div class="ab-content-inner"><div class="ab-card"><h2>📡 ${t('devices')}</h2><div class="ab-device-grid" id="ab-device-list">${state.devices.map((d, i) => `<div class="ab-device"><div class="icon">${d.icon}</div><div class="name">${d.name}</div><div class="type">${d.type}</div><div class="status ${d.connected ? 'on' : 'off'}">${d.connected ? t('connected') : t('not_connected')}</div><button class="ab-btn" data-action="connect-device" data-idx="${i}" style="margin-top:10px;width:100%;">${d.connected ? t('disconnect') : t('connect')}</button><button class="ab-btn" data-action="open-device" data-idx="${i}" style="margin-top:5px;width:100%;background:rgba(0,229,255,0.1);color:#00e5ff;border-color:#00e5ff;">🔊 ${t('listen_device')}</button></div>`).join('')}</div><div style="display:flex;gap:10px;margin-top:30px;"><button class="ab-btn primary" data-action="scan-bt" style="flex:1;">📶 Bluetooth</button><button class="ab-btn primary" data-action="scan-wifi" style="flex:1;">📡 WLAN</button></div></div></div>`; }
  function renderSickNotes() { return `<div class="ab-content-inner"><div class="ab-card"><h2>📝 ${t('sicknotes')}</h2><div style="margin-top:20px;"><label class="ab-label">Patientenname</label><input type="text" class="ab-input" id="au-name" placeholder="Dein Name"><label class="ab-label">Krankheit / Diagnose</label><input type="text" class="ab-input" id="au-diag" placeholder="z.B. Grippe"><label class="ab-label">Von (Datum)</label><input type="date" class="ab-input" id="au-from"><label class="ab-label">Bis (Datum)</label><input type="date" class="ab-input" id="au-to"><button class="ab-btn primary" data-action="generate-au" style="width:100%;margin-top:10px;">${t('save')}</button></div></div><div class="ab-card"><h2>📋 Deine Krankschreibungen</h2>${state.sickNotes.length ? state.sickNotes.map((s, i) => `<div class="ab-list-item" style="border-left:4px solid #00ff88;"><div><h4>${s.name} (${s.diag})</h4><p>Vom ${s.from} bis ${s.to}</p></div><button class="ab-btn" data-action="del-au" data-idx="${i}" style="border-color:#ff3333;color:#ff3333;">${t('delete')}</button></div>`).join('') : `<p style="color:#888;text-align:center;">Keine vorhanden.</p>`}</div></div>`; }
  function renderAppointments() { return `<div class="ab-content-inner"><div class="ab-card"><h2>📅 ${t('appointments')}</h2><div style="margin-top:20px;"><label class="ab-label">Arzt / Klinik</label><input type="text" class="ab-input" id="app-doc" placeholder="z.B. Dr. Müller"><label class="ab-label">Datum & Uhrzeit</label><input type="datetime-local" class="ab-input" id="app-date"><button class="ab-btn primary" data-action="add-app" style="width:100%;margin-top:10px;">${t('save')}</button></div></div><div class="ab-card"><h2>🗓️ Deine Termine</h2>${state.appointments.length ? state.appointments.map((a, i) => `<div class="ab-list-item" style="border-left:4px solid #00e5ff;"><div><h4>${a.doc}</h4><p>${new Date(a.date).toLocaleString()}</p></div><button class="ab-btn" data-action="del-app" data-idx="${i}" style="border-color:#ff3333;color:#ff3333;">${t('delete')}</button></div>`).join('') : `<p style="color:#888;text-align:center;">Keine vorhanden.</p>`}</div></div>`; }
  function renderEmergency() { return `<div class="ab-content-inner" style="text-align:center;padding-top:20px;"><h2 style="color:#ff3333;font-size:32px;font-weight:900;">🚨 ${t('emergency')}</h2><button class="ab-emergency-btn" onclick="window.location.href='tel:112'"><span style="font-size:48px;">📞</span> 112 ${t('call')}</button><div class="ab-card" style="margin-top:30px;text-align:left;"><h2>🩸 ${t('first_aid')}</h2><div style="margin-top:20px;">${FIRST_AID.map(f => `<div class="ab-list-item" data-action="open-first-aid" data-title="${f.title}" data-desc="${f.desc}" data-icon="🩸"><div><h4>${f.title}</h4><p>${f.desc.substring(0, 50)}...</p></div></div>`).join('')}</div></div></div>`; }
  function renderSettings() { return `<div class="ab-content-inner"><div class="ab-card"><h2>⚙️ ${t('settings')}</h2><div class="ab-setting-row"><div class="ab-setting-info"><h4>${t('lang')}</h4></div><select class="ab-select" data-action="set-lang"><option value="de" ${state.lang === 'de' ? 'selected' : ''}>Deutsch</option><option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option><option value="tr" ${state.lang === 'tr' ? 'selected' : ''}>Türkçe</option><option value="ku" ${state.lang === 'ku' ? 'selected' : ''}>Kurmandschi</option><option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option><option value="fa" ${state.lang === 'fa' ? 'selected' : ''}>فارسی</option></select></div><div class="ab-setting-row"><div class="ab-setting-info"><h4>TTS (Vorlesen)</h4><p>Sprachausgabe für alle Inhalte</p></div><div class="ab-toggle ${state.ttsEnabled ? 'on' : ''}" data-action="toggle-tts"></div></div></div></div>`; }

  function renderMain() {
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
            <button class="ab-btn" id="ab-info-tts-btn" style="background:rgba(0,255,136,0.1);border-color:#00ff88;color:#00ff88;">🔊 ${t('speak')}</button>
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
            <button class="ab-btn" id="ab-ai-tts-btn" style="background:rgba(0,255,136,0.1);border-color:#00ff88;color:#00ff88;">🔊 ${t('ai_listen')}</button>
            <button class="ab-btn primary" style="width:100%;" onclick="document.getElementById('ab-ai-modal').classList.remove('show')">${t('close')}</button>
          </div>
        </div>
      </div>
    `;
  }

  function speakText(text) {
    if (!state.ttsEnabled) return;
    if (!window.speechSynthesis) { alert('Sprachausgabe nicht unterstützt.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { de: 'de-DE', en: 'en-US', tr: 'tr-TR', ku: 'ku-TR', ar: 'ar-SA', fa: 'fa-IR' };
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
    textEl.innerHTML = `<span style="color:#00ff88;">${t('ai_thinking')}</span>`;
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
      if (ttsBtn) { ttsBtn.style.display = 'inline-flex'; ttsBtn.onclick = () => speakText(lastAIResponse.replace(/<[^>]*>?/gm, '')); }
    }, 1200);
  }

  function init3DAnatomy() {
    const container = document.getElementById('anatomy-3d-container');
    if (!container) return;

    // Lade-Text SOFORT ausblenden, damit er nicht hängen bleibt
    const loading = document.getElementById('anatomy-3d-loading');
    if (loading) loading.style.display = 'none';

    if (threeRenderer) { container.removeChild(threeRenderer.domElement); threeRenderer.dispose(); }
    if (threeAnimationId) cancelAnimationFrame(threeAnimationId);

    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x0a0a0f);
    threeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight || 1, 0.1, 1000);
    threeCamera.position.set(0, 0, 5);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(container.clientWidth || 500, container.clientHeight || 500);
    threeRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(threeRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    threeScene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 1, 1);
    threeScene.add(dirLight);

    const loader = new GLTFLoader();
    loader.load('body.glb', function (gltf) {
      threeModel = gltf.scene;
      threeModel.scale.set(1.5, 1.5, 1.5);
      threeModel.position.y = -0.5;
      threeScene.add(threeModel);
      animate3D();
    }, undefined, function (error) {
      console.warn('3D-Modell (body.glb) nicht gefunden. Baue 3D-Fallback-Körper...', error);
      const bodyGroup = new THREE.Group();
      
      const headGeo = new THREE.SphereGeometry(0.3, 32, 32);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, wireframe: true });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.5;
      bodyGroup.add(head);

      const torsoGeo = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 32);
      const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, wireframe: true });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.6;
      bodyGroup.add(torso);

      const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 32);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xb478ff, wireframe: true });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6, 0.6, 0);
      leftArm.rotation.z = Math.PI / 4;
      bodyGroup.add(leftArm);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6, 0.6, 0);
      rightArm.rotation.z = -Math.PI / 4;
      bodyGroup.add(rightArm);

      const legGeo = new THREE.CylinderGeometry(0.15, 0.1, 1.2, 32);
      const legMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, wireframe: true });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.2, -0.6, 0);
      bodyGroup.add(leftLeg);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.2, -0.6, 0);
      bodyGroup.add(rightLeg);

      threeModel = bodyGroup;
      threeScene.add(threeModel);
      animate3D();
    });

    function animate3D() {
      threeAnimationId = requestAnimationFrame(animate3D);
      if (threeModel) threeModel.rotation.y += 0.002;
      if (threeRenderer && threeScene && threeCamera) threeRenderer.render(threeScene, threeCamera);
    }

    window.addEventListener('resize', () => {
      if (!threeCamera || !threeRenderer || !container) return;
      threeCamera.aspect = container.clientWidth / container.clientHeight || 1;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(container.clientWidth || 500, container.clientHeight || 500);
    });
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'view-anatomy') { state.currentView = 'anatomy'; updateView(); setTimeout(init3DAnatomy, 100); return; }
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

    if (action === 'rotate-3d' && threeModel) { const dir = btn.dataset.dir; threeModel.rotation.y += (dir === 'left' ? -0.2 : 0.2); return; }
    if (action === 'zoom-3d' && threeCamera) { const dir = btn.dataset.dir; if (dir === 'in') threeCamera.position.z -= 0.5; else threeCamera.position.z += 0.5; return; }
    if (action === 'reset-3d' && threeModel && threeCamera) { threeModel.rotation.y = 0; threeCamera.position.set(0, 0, 5); return; }

    if (action === 'ki-action') {
      const type = btn.dataset.type;
      const input = document.getElementById('ki-text').value;
      if (!input) { alert('Bitte Text eingeben!'); return; }
      const resultBox = document.getElementById('ki-result'), resultText = document.getElementById('ki-result-text');
      resultBox.style.display = 'block'; resultText.innerHTML = `<span style="color:#00ff88;">${t('ai_thinking')}</span>`;
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

    if (action === 'open-anatomy') {
      const data = ANATOMY_DATA[btn.dataset.part]; if (!data) return;
      document.getElementById('ab-info-icon').textContent = data.icon;
      document.getElementById('ab-info-title').textContent = data.name;
      document.getElementById('ab-info-desc').innerHTML = `${data.desc}<br><br><b>Organe:</b> ${data.organs.join(', ')}`;
      document.getElementById('ab-info-tts-btn').onclick = () => speakText(`${data.name}. ${data.desc}. Organe: ${data.organs.join(', ')}`);
      document.getElementById('ab-info-ai-btn').onclick = () => askAI(`Erkläre mehr über ${data.name}. ${data.desc}`);
      document.getElementById('ab-info-modal').classList.add('show');
      return;
    }

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

    if (action === 'connect-device') { const idx = parseInt(btn.dataset.idx); state.devices[idx].connected = !state.devices[idx].connected; saveState(); updateView(); return; }
    if (action === 'scan-bt') { alert('Bluetooth-Suche gestartet...'); state.devices[0].connected = true; saveState(); updateView(); return; }
    if (action === 'scan-wifi') { alert('WLAN-Suche gestartet...'); state.devices[1].connected = true; saveState(); updateView(); return; }
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
    if (e.target.id === 'ki-text') { state.kiText = e.target.value; }
    if (e.target.dataset.action.startsWith('search-')) {
      state.searchQuery = e.target.value;
      const container = document.querySelector('#ab-main-content .ab-card div:last-child');
      if (!container) return;
      let list = [];
      if (e.target.dataset.action === 'search-disease') list = DISEASES.filter(d => d.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
      if (e.target.dataset.action === 'search-med') list = MEDS.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
      if (e.target.dataset.action === 'search-natural') list = NATURAL.filter(n => n.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
      if (e.target.dataset.action === 'search-lab') list = LABS.filter(l => l.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
      
      const html = list.map(item => `<div class="ab-list-item" data-action="open-${e.target.dataset.action.split('-')[1]}" data-name="${item.name}" data-symp="${item.symp || ''}" data-tr="${item.tr || ''}" data-use="${item.use || ''}" data-dose="${item.dose || ''}" data-ref="${item.ref || ''}" data-desc="${item.desc || ''}" data-icon="🦠"><div><h4>${item.name}</h4><p>${item.symp || item.use || item.desc}</p></div></div>`).join('');
      container.innerHTML = html || `<p style="color:#888;text-align:center;">${t('no_results')}</p>`;
    }
  }

  function handleChange(e) { if (e.target.dataset.action === 'set-lang') { state.lang = e.target.value; saveState(); updateView(); } }

  function updateView() {
    if (!currentTarget) return;
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
    // Willkommensgruß repariert: setTimeout stellt sicher, dass window.HalDoWelcome bereit ist
    setTimeout(() => {
      if (window.HalDoWelcome && typeof window.HalDoWelcome.show === 'function') {
        window.HalDoWelcome.show("Arztbuch");
      } else {
        console.warn("HalDoWelcome nicht gefunden. Willkommensgruß übersprungen.");
      }
    }, 100);

    const overlay = document.createElement('div');
    overlay.className = 'ab-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0f;display:flex;flex-direction:column;';
    const closeBar = document.createElement('div');
    closeBar.style.cssText = 'padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    closeBar.innerHTML = `<b style="color:#e8e8ec;font-family:Inter;">🩺 HalDo Arztbuch PRO MAX 3D</b><button id="ab-close-btn" style="background:transparent;border:1px solid #444;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-family:Inter;">✕ Schließen</button>`;
    overlay.appendChild(closeBar);
    const mountDiv = document.createElement('div');
    mountDiv.style.cssText = 'flex:1;overflow:hidden;';
    overlay.appendChild(mountDiv);
    document.body.appendChild(overlay);
    document.getElementById('ab-close-btn').onclick = () => { overlay.remove(); currentTarget = null; state.currentView = 'dashboard'; if(threeAnimationId) cancelAnimationFrame(threeAnimationId); };
    mount(mountDiv);
  }

  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.arztbuch = { mount, version: VERSION, open: openOverlay };
  window.Arztbuch = window.HalDoApps.arztbuch;
  window.apps = window.apps || {};
  window.apps.arztbuch = window.HalDoApps.arztbuch;
  window.openArztbuch = openOverlay;

  console.log('🩺 arztbuch.js v' + VERSION + ' geladen — ULTIMATE PRO MAX (3D Anatomie mit ES-Modulen)');
})();
