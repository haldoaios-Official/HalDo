/* HalDo Fahrschule v700.0 — ULTIMATE PRO MAX (Settings, Welcome, 17 Sprachen, KI, TTS) */
(function () {
  'use strict';

  const VERSION = '700.0';
  const STORAGE_KEY = 'haldo.fahrschule.pro.stats.v700';

  const LANG = {
    de: { dashboard: 'Startseite', learn: 'Lernen', exam: 'Prüfung', signs: 'Schilder', videos: 'Videos', theory: 'Theorie', settings: 'Einstellungen', start: 'Starten', questions: 'Fragen', back: 'Zurück', next: 'Weiter', ai_explain: 'KI fragen', pass: 'BESTANDEN', fail: 'DURCHGEFALLEN', select_count: 'Wähle die Anzahl der Fragen', lang: 'Sprache', exam_start: 'Prüfung starten', auto_next: 'Auto-Weiter', auto_next_desc: 'Automatisch zur nächsten Frage', sound_fx: 'Sound-Effekte', sound_fx_desc: 'Töne bei richtig/falsch', reset_stats: 'Statistiken zurücksetzen', reset_stats_desc: 'Löscht alle gespeicherten Fortschritte', about: 'Über die App', version: 'Version' },
    en: { dashboard: 'Dashboard', learn: 'Learn', exam: 'Exam', signs: 'Signs', videos: 'Videos', theory: 'Theory', settings: 'Settings', start: 'Start', questions: 'Questions', back: 'Back', next: 'Next', ai_explain: 'Ask AI', pass: 'PASSED', fail: 'FAILED', select_count: 'Select number of questions', lang: 'Language', exam_start: 'Start Exam', auto_next: 'Auto-Next', auto_next_desc: 'Automatically go to next question', sound_fx: 'Sound Effects', sound_fx_desc: 'Sounds on correct/wrong', reset_stats: 'Reset Statistics', reset_stats_desc: 'Deletes all saved progress', about: 'About App', version: 'Version' },
    tr: { dashboard: 'Panel', learn: 'Öğren', exam: 'Sınav', signs: 'İşaretler', videos: 'Videolar', theory: 'Teori', settings: 'Ayarlar', start: 'Başla', questions: 'Sorular', back: 'Geri', next: 'İleri', ai_explain: 'Yapay Zeka', pass: 'GEÇTİ', fail: 'KALDI', select_count: 'Soru sayısını seçin', lang: 'Dil', exam_start: 'Sınavı Başlat', auto_next: 'Otomatik İleri', auto_next_desc: 'Doğru cevapta otomatik geç', sound_fx: 'Ses Efektleri', sound_fx_desc: 'Doğru/yanlış sesleri', reset_stats: 'İstatistikleri Sıfırla', reset_stats_desc: 'Tüm ilerlemeyi siler', about: 'Uygulama Hakkında', version: 'Sürüm' },
    ku: { dashboard: 'Destpêk', learn: 'Fêr bibe', exam: 'Azmûn', signs: 'Nîşan', videos: 'Vîdyo', theory: 'Teorî', settings: 'Mîheng', start: 'Dest pê bike', questions: 'Pirs', back: 'Veger', next: 'Pêşve', ai_explain: 'Ji AI bipirse', pass: 'DERBAS BÛ', fail: 'DERBAS NE BÛ', select_count: 'Hejmara pirsan hilbijêre', lang: 'Ziman', exam_start: 'Azmûnê dest pê bike', auto_next: 'Xweber Pêşve', auto_next_desc: 'Xweber here pirsa din', sound_fx: 'Deng', sound_fx_desc: 'Dengê rast/çewt', reset_stats: 'Statîstîkan Paqij Bike', reset_stats_desc: 'Hemû pêşkeftinê paqij dike', about: 'Derbarê App', version: 'Guhertî' },
    ckb: { dashboard: 'دەستپێک', learn: 'فێربوون', exam: 'تاقیکردنەوە', signs: 'هێماکان', videos: 'ڤیدیۆکان', theory: 'تیۆری', settings: 'ڕێکخستنەکان', start: 'دەستپێکردن', questions: 'پرسیارەکان', back: 'گەڕانەوە', next: 'دواتر', ai_explain: 'پرسیار لە AI بکە', pass: 'دەرچوو', fail: 'دەرنەچوو', select_count: 'ژمارەی پرسیارەکان هەڵبژێرە', lang: 'زمان', exam_start: 'تاقیکردنەوە دەست پێبکە', auto_next: 'خۆکار دواتر', auto_next_desc: 'خۆکار بچۆ پرسیاری دواتر', sound_fx: 'دەنگەکان', sound_fx_desc: 'دەنگی ڕاست/هەڵە', reset_stats: 'ئامارەکان ڕێست بکە', reset_stats_desc: 'هەموو پێشکەوتنەکان دەسڕێتەوە', about: 'دەربارەی ئەپ', version: 'وەشان' },
    gorani: { dashboard: 'Destpêk', learn: 'Fêr bibe', exam: 'Azmûn', signs: 'Nîşan', videos: 'Vîdyo', theory: 'Teorî', settings: 'Mîheng', start: 'Dest pê bike', questions: 'Pirs', back: 'Veger', next: 'Pêşve', ai_explain: 'Ji AI bipirse', pass: 'DERBAS BÛ', fail: 'DERBAS NE BÛ', select_count: 'Hejmara pirsan hilbijêre', lang: 'Ziman', exam_start: 'Azmûnê dest pê bike', auto_next: 'Xweber Pêşve', auto_next_desc: 'Xweber here pirsa din', sound_fx: 'Deng', sound_fx_desc: 'Dengê rast/çewt', reset_stats: 'Statîstîkan Paqij Bike', reset_stats_desc: 'Hemû pêşkeftinê paqij dike', about: 'Derbarê App', version: 'Guhertî' },
    ez: { dashboard: 'Destpêk', learn: 'Fêr bibe', exam: 'Azmûn', signs: 'Nîşan', videos: 'Vîdyo', theory: 'Teorî', settings: 'Mîheng', start: 'Dest pê bike', questions: 'Pirs', back: 'Veger', next: 'Pêşve', ai_explain: 'Ji AI bipirse', pass: 'DERBAS BÛ', fail: 'DERBAS NE BÛ', select_count: 'Hejmara pirsan hilbijêre', lang: 'Ziman', exam_start: 'Azmûnê dest pê bike', auto_next: 'Xweber Pêşve', auto_next_desc: 'Xweber here pirsa din', sound_fx: 'Deng', sound_fx_desc: 'Dengê rast/çewt', reset_stats: 'Statîstîkan Paqij Bike', reset_stats_desc: 'Hemû pêşkeftinê paqij dike', about: 'Derbarê App', version: 'Guhertî' },
    fr: { dashboard: 'Tableau de bord', learn: 'Apprendre', exam: 'Examen', signs: 'Panneaux', videos: 'Vidéos', theory: 'Théorie', settings: 'Paramètres', start: 'Démarrer', questions: 'Questions', back: 'Retour', next: 'Suivant', ai_explain: 'Demander à l\'IA', pass: 'RÉUSSI', fail: 'ÉCHOUÉ', select_count: 'Sélectionnez le nombre de questions', lang: 'Langue', exam_start: 'Démarrer l\'examen', auto_next: 'Auto-Suivant', auto_next_desc: 'Passer à la question suivante', sound_fx: 'Effets sonores', sound_fx_desc: 'Sons vrai/faux', reset_stats: 'Réinitialiser', reset_stats_desc: 'Efface toute la progression', about: 'À propos', version: 'Version' },
    ar: { dashboard: 'لوحة القيادة', learn: 'تعلم', exam: 'امتحان', signs: 'علامات', videos: 'فيديوهات', theory: 'نظرية', settings: 'إعدادات', start: 'ابدأ', questions: 'أسئلة', back: 'رجوع', next: 'التالي', ai_explain: 'اسأل الذكاء الاصطناعي', pass: 'ناجح', fail: 'راسب', select_count: 'حدد عدد الأسئلة', lang: 'اللغة', exam_start: 'ابدأ الامتحان', auto_next: 'التالي التلقائي', auto_next_desc: 'الانتقال تلقائيا للسؤال التالي', sound_fx: 'المؤثرات الصوتية', sound_fx_desc: 'أصوات صحيحة/خاطئة', reset_stats: 'إعادة تعيين الإحصائيات', reset_stats_desc: 'حذف كل التقدم المحفوظ', about: 'حول التطبيق', version: 'إصدار' },
    es: { dashboard: 'Panel', learn: 'Aprender', exam: 'Examen', signs: 'Señales', videos: 'Videos', theory: 'Teoría', settings: 'Ajustes', start: 'Empezar', questions: 'Preguntas', back: 'Atrás', next: 'Siguiente', ai_explain: 'Preguntar a IA', pass: 'APROBADO', fail: 'SUSPENDIDO', select_count: 'Selecciona el número de preguntas', lang: 'Idioma', exam_start: 'Iniciar Examen', auto_next: 'Auto-Siguiente', auto_next_desc: 'Ir a la siguiente pregunta', sound_fx: 'Efectos de sonido', sound_fx_desc: 'Sonidos correcto/incorrecto', reset_stats: 'Reiniciar Estadísticas', reset_stats_desc: 'Borra todo el progreso', about: 'Acerca de', version: 'Versión' },
    pl: { dashboard: 'Pulpit', learn: 'Ucz się', exam: 'Egzamin', signs: 'Znaki', videos: 'Filmy', theory: 'Teoria', settings: 'Ustawienia', start: 'Start', questions: 'Pytania', back: 'Wstecz', next: 'Dalej', ai_explain: 'Zapytaj AI', pass: 'ZDANE', fail: 'NIEZDANE', select_count: 'Wybierz liczbę pytań', lang: 'Język', exam_start: 'Rozpocznij egzamin', auto_next: 'Auto-Następne', auto_next_desc: 'Automatycznie przejdź dalej', sound_fx: 'Efekty dźwiękowe', sound_fx_desc: 'Dźwięki poprawnie/błędnie', reset_stats: 'Resetuj Statystyki', reset_stats_desc: 'Usuwa cały postęp', about: 'O aplikacji', version: 'Wersja' },
    ru: { dashboard: 'Панель', learn: 'Учиться', exam: 'Экзамен', signs: 'Знаки', videos: 'Видео', theory: 'Теория', settings: 'Настройки', start: 'Начать', questions: 'Вопросы', back: 'Назад', next: 'Далее', ai_explain: 'Спросить ИИ', pass: 'СДАНО', fail: 'НЕ СДАНО', select_count: 'Выберите количество вопросов', lang: 'Язык', exam_start: 'Начать экзамен', auto_next: 'Авто-Далее', auto_next_desc: 'Автоматический переход', sound_fx: 'Звуковые эффекты', sound_fx_desc: 'Звуки верно/неверно', reset_stats: 'Сбросить Статистику', reset_stats_desc: 'Удаляет весь прогресс', about: 'О приложении', version: 'Версия' },
    uz: { dashboard: 'Boshqaruv paneli', learn: "O'rganish", exam: 'Imtihon', signs: 'Belgilar', videos: 'Videolar', theory: 'Nazariya', settings: 'Sozlamalar', start: 'Boshlash', questions: 'Savollar', back: 'Orqaga', next: 'Keyingi', ai_explain: "AI dan so'rash", pass: "O'TDI", fail: 'YIQILDI', select_count: 'Savollar sonini tanlang', lang: 'Til', exam_start: 'Imtihonni boshlash', auto_next: 'Avto-Keyingi', auto_next_desc: 'Avtomatik keyingi savolga', sound_fx: 'Ovoz effektlari', sound_fx_desc: "To'g'ri/xato ovozlari", reset_stats: 'Statistikani Tozalash', reset_stats_desc: 'Barcha taraqqiyotni ochiradi', about: 'Ilova haqida', version: 'Versiya' },
    fa: { dashboard: 'داشبورد', learn: 'یادگیری', exam: 'آزمون', signs: 'علائم', videos: 'ویدیوها', theory: 'تئوری', settings: 'تنظیمات', start: 'شروع', questions: 'سوالات', back: 'بازگشت', next: 'بعدی', ai_explain: 'پرسیدن از هوش مصنوعی', pass: 'قبول', fail: 'رد شد', select_count: 'تعداد سوالات را انتخاب کنید', lang: 'زبان', exam_start: 'شروع آزمون', auto_next: 'بعدی خودکار', auto_next_desc: 'رفتن خودکار به بعدی', sound_fx: 'افکت‌های صوتی', sound_fx_desc: 'صداهای درست/غلط', reset_stats: 'بازنشانی آمار', reset_stats_desc: 'همه پیشرفت‌ها را پاک می‌کند', about: 'درباره برنامه', version: 'نسخه' },
    la: { dashboard: 'Dashboard', learn: 'Discere', exam: 'Examen', signs: 'Signa', videos: 'Videos', theory: 'Theoria', settings: 'Optiones', start: 'Incipere', questions: 'Quaestiones', back: 'Retro', next: 'Porro', ai_explain: 'Interroga AI', pass: 'TRANSIIT', fail: 'CECIDIT', select_count: 'Elige numerum quaestionum', lang: 'Lingua', exam_start: 'Incipere Examen', auto_next: 'Auto-Porro', auto_next_desc: 'Automatice ad sequentem', sound_fx: 'Sonus Effectus', sound_fx_desc: 'Sonus recte/male', reset_stats: 'Resettare Statistica', reset_stats_desc: 'Delet omnem progressum', about: 'De App', version: 'Versio' },
    zh: { dashboard: '仪表盘', learn: '学习', exam: '考试', signs: '标志', videos: '视频', theory: '理论', settings: '设置', start: '开始', questions: '问题', back: '返回', next: '下一个', ai_explain: '问AI', pass: '通过', fail: '失败', select_count: '选择问题数量', lang: '语言', exam_start: '开始考试', auto_next: '自动下一个', auto_next_desc: '答对自动下一题', sound_fx: '音效', sound_fx_desc: '正确/错误音效', reset_stats: '重置统计', reset_stats_desc: '删除所有进度', about: '关于', version: '版本' },
    ja: { dashboard: 'ダッシュボード', learn: '学習', exam: '試験', signs: '標識', videos: '動画', theory: '理論', settings: '設定', start: '開始', questions: '質問', back: '戻る', next: '次へ', ai_explain: 'AIに聞く', pass: '合格', fail: '不合格', select_count: '質問の数を選択', lang: '言語', exam_start: '試験を開始', auto_next: '自動次へ', auto_next_desc: '正解時に自動で次へ', sound_fx: '効果音', sound_fx_desc: '正解/不正解の音', reset_stats: '統計リセット', reset_stats_desc: 'すべての進捗を削除', about: 'アプリについて', version: 'バージョン' }
  };

  const QUESTIONS = [
    { id: 1, cat: 'Gefahrenlehre', q: 'Sie nähern sich einer unübersichtlichen Kurve. Wie verhalten Sie sich?', opts: ['Geschwindigkeit stark reduzieren, bremsbereit sein', 'Hupen und weiterfahren', 'Auf die Gegenfahrbahn ausweichen'], correct: 0, exp: 'In unübersichtlichen Kurven muss die Geschwindigkeit reduziert und bremsbereit gefahren werden.' },
    { id: 2, cat: 'Vorfahrt', q: 'Wer hat an einer Kreuzung ohne Verkehrszeichen Vorfahrt?', opts: ['Das Fahrzeug von links', 'Das Fahrzeug von rechts', 'Wer zuerst ankommt'], correct: 1, exp: 'Die Grundregel lautet: Rechts vor Links.' },
    { id: 3, cat: 'Technik', q: 'Was ist bei einer Reifenpanne zu tun?', opts: ['Warnblinker an, Warndreieck aufstellen, Reifen wechseln', 'Sofort auf die Autobahn wechseln', 'Weiterfahren bis zur nächsten Werkstatt'], correct: 0, exp: 'Zuerst das Fahrzeug sichern, dann den Reifen wechseln.' },
    { id: 4, cat: 'Verkehrszeichen', q: 'Was bedeutet ein rotes Dreieck mit einem Ausrufezeichen?', opts: ['Allgemeine Gefahr', 'Halt, Vorfahrt gewähren', 'Vorfahrtstraße'], correct: 0, exp: 'Das Zeichen warnt vor einer allgemeinen Gefahr.' },
    { id: 5, cat: 'Umweltschutz', q: 'Wie fahren Sie umweltbewusst?', opts: ['Früh hochschalten und niedrige Drehzahlen nutzen', 'Im ersten Gang bis 50 km/h fahren', 'Ständig beschleunigen und bremsen'], correct: 0, exp: 'Frühes Hochschalten spart Kraftstoff.' },
    { id: 6, cat: 'Gefahrenlehre', q: 'Was ist bei Nässe besonders gefährlich?', opts: ['Aquaplaning', 'Bremsen quietschen', 'Der Motor wird heiß'], correct: 0, exp: 'Aquaplaning führt zum Verlust der Bodenhaftung.' },
    { id: 7, cat: 'Vorfahrt', q: 'Sie wollen links abbiegen. Worauf müssen Sie achten?', opts: ['Gegenverkehr durchlassen', 'Sofort abbiegen', 'Rechts blinken'], correct: 0, exp: 'Beim Linksabbiegen muss der Gegenverkehr durchgelassen werden.' },
    { id: 8, cat: 'Technik', q: 'Die Bremsleuchten leuchten dauerhaft. Was tun?', opts: ['Bremslichtschalter überprüfen lassen', 'Weiterfahren', 'Batterie abklemmen'], correct: 0, exp: 'Ein defekter Bremslichtschalter ist ein Sicherheitsrisiko.' },
    { id: 9, cat: 'Verkehrszeichen', q: 'Ein blaues Schild mit weißem Pfeil nach rechts bedeutet?', opts: ['Vorgeschriebene Fahrtrichtung rechts', 'Einbahnstraße', 'Vorfahrtstraße'], correct: 0, exp: 'Dieses Schild schreibt die Fahrtrichtung vor.' },
    { id: 10, cat: 'Gefahrenlehre', q: 'Sie fahren bei Nebel. Welches Licht ist Pflicht?', opts: ['Abblendlicht', 'Fernlicht', 'Standlicht'], correct: 0, exp: 'Bei Nebel ist Abblendlicht Pflicht.' },
    { id: 11, cat: 'Vorfahrt', q: 'Was bedeutet "Vorfahrt gewähren"?', opts: ['Anhalten und warten', 'Geschwindigkeit anpassen, ggf. warten', 'Einfach durchfahren'], correct: 1, exp: 'Man muss nicht zwingend anhalten, aber die Geschwindigkeit anpassen.' },
    { id: 12, cat: 'Technik', q: 'Wie tief sollte das Profil der Reifen mindestens sein?', opts: ['1,6 mm', '0,5 mm', '5 mm'], correct: 0, exp: 'Die gesetzliche Mindestprofiltiefe beträgt 1,6 mm.' },
    { id: 13, cat: 'Verkehrszeichen', q: 'Was bedeutet ein auf dem Kopf stehendes Dreieck?', opts: ['Vorfahrt gewähren', 'Stop', 'Wildwechsel'], correct: 0, exp: 'Spitze unten bedeutet "Vorfahrt gewähren".' },
    { id: 14, cat: 'Gefahrenlehre', q: 'Wie reagieren Sie bei einem Wildwechsel?', opts: ['Abbremsen und hupen', 'Ausweichen', 'Gas geben'], correct: 0, exp: 'Abbremsen und Hupen. Ausweichen kann zu schweren Unfällen führen.' },
    { id: 15, cat: 'Vorfahrt', q: 'Sie fahren auf einer Vorfahrtstraße. Ein Auto kommt von rechts.', opts: ['Ich habe Vorfahrt', 'Ich muss warten', 'Rechts vor Links gilt'], correct: 0, exp: 'Wer auf einer Vorfahrtstraße fährt, hat Vorfahrt.' },
    { id: 16, cat: 'Technik', q: 'Wann sollten Sie die Winterreifen aufziehen?', opts: ['Von Oktober bis Ostern (O bis O)', 'Nur im Dezember', 'Wenn es schneit'], correct: 0, exp: 'Die Faustregel lautet "O bis O" - Oktober bis Ostern.' },
    { id: 17, cat: 'Gefahrenlehre', q: 'Was tun bei einem Stau auf der Autobahn?', opts: ['Rettungsgasse bilden', 'Auf dem Standstreifen fahren', 'Rückwärts fahren'], correct: 0, exp: 'Zwischen linkem und rechtem Fahrstreifen muss eine Rettungsgasse gebildet werden.' },
    { id: 18, cat: 'Vorfahrt', q: 'Ein Polizist hebt den Arm. Was bedeutet das?', opts: ['Alle Fahrzeuge müssen anhalten', 'Nur LKW müssen anhalten', 'Ich darf fahren'], correct: 0, exp: 'Der Arm des Polizisten zeigt in meine Richtung oder er hebt ihn: Ich muss anhalten.' },
    { id: 19, cat: 'Umweltschutz', q: 'Was schont die Umwelt beim Auto?', opts: ['Reifendruck regelmäßig prüfen', 'Klimaanlage immer an', 'Dachgepäckträger leer mitfahren'], correct: 0, exp: 'Der richtige Reifendruck reduziert den Rollwiderstand.' },
    { id: 20, cat: 'Verkehrszeichen', q: 'Was bedeutet ein blaues Schild mit einem Fußgänger?', opts: ['Fußgängerüberweg', 'Spielstraße', 'Fußgänger verboten'], correct: 0, exp: 'Es weist auf einen Fußgängerüberweg hin.' },
    { id: 21, cat: 'Erste Hilfe', q: 'Was ist die erste Maßnahme bei einem Unfall?', opts: ['Unfallstelle absichern (Warnblinker, Warndreieck)', 'Sofort Erste Hilfe leisten', 'Die Polizei rufen'], correct: 0, exp: 'Eigenschutz geht vor! Zuerst die Unfallstelle absichern, dann helfen.' },
    { id: 22, cat: 'Erste Hilfe', q: 'Wie lautet die Notrufnummer?', opts: ['112', '110', '911'], correct: 0, exp: 'Die europaweite Notrufnummer ist die 112.' },
    { id: 23, cat: 'Technik', q: 'Was bedeutet eine rote Kontrollleuchte im Armaturenbrett?', opts: ['Sofort anhalten und prüfen', 'Weiterfahren, es ist nur ein Hinweis', 'Motor abstellen und neu starten'], correct: 0, exp: 'Rote Kontrollleuchten weisen auf eine akute Gefahr hin.' },
    { id: 24, cat: 'Gefahrenlehre', q: 'Sie fahren bei Starkregen. Was tun?', opts: ['Geschwindigkeit reduzieren', 'Fernlicht einschalten', 'Schneller fahren'], correct: 0, exp: 'Bei Starkregen ist die Gefahr von Aquaplaning hoch.' },
    { id: 25, cat: 'Vorfahrt', q: 'Sie wollen in einen Kreisverkehr einfahren. Wer hat Vorfahrt?', opts: ['Die Fahrzeuge im Kreisverkehr', 'Ich, weil ich von rechts komme', 'Wer schneller ist'], correct: 0, exp: 'Im Kreisverkehr hat der Verkehr im Kreis Vorfahrt.' },
    { id: 26, cat: 'Verkehrszeichen', q: 'Was bedeutet das Schild mit dem roten Rand und dem weißen Kreis?', opts: ['Verbot der Einfahrt', 'Geschwindigkeitsbegrenzung', 'Überholverbot'], correct: 0, exp: 'Ein weißer Kreis mit rotem Rand bedeutet: Verbot der Einfahrt.' },
    { id: 27, cat: 'Technik', q: 'Was ist die Aufgabe der Kupplung?', opts: ['Kraftübertragung zwischen Motor und Getriebe', 'Bremsen des Fahrzeugs', 'Kühlen des Motors'], correct: 0, exp: 'Die Kupplung trennt und verbindet den Motor mit dem Getriebe.' },
    { id: 28, cat: 'Umweltschutz', q: 'Was passiert beim "Motorsurfen"?', opts: ['Man rollt im Leerlauf und bremst mit dem Motor', 'Man beschleunigt stark', 'Man schaltet zu früh hoch'], correct: 0, exp: 'Beim Motorsurfen wird der Motor im Schubbetrieb genutzt, um Sprit zu sparen.' },
    { id: 29, cat: 'Gefahrenlehre', q: 'Sie fahren in der Dämmerung. Worauf achten?', opts: ['Wildwechsel möglich, Licht anmachen', 'Schneller fahren', 'Sonnenbrille tragen'], correct: 0, exp: 'In der Dämmerung ist das Wild besonders aktiv. Abblendlicht einschalten!' },
    { id: 30, cat: 'Vorfahrt', q: 'Ein Bus fährt an einer Haltestelle an. Was gilt?', opts: ['Ich muss dem Bus das Ausfahren ermöglichen', 'Ich habe Vorfahrt', 'Der Bus muss warten'], correct: 0, exp: 'Ein Linienbus, der vom Halt anfährt, hat Vorrang.' },
    { id: 31, cat: 'Verkehrszeichen', q: 'Was bedeutet das achteckige rote Schild?', opts: ['STOP - Anhalten und Vorfahrt gewähren', 'Vorfahrtstraße', 'Gefahrenstelle'], correct: 0, exp: 'Das achteckige rote Schild ist das STOP-Zeichen.' },
    { id: 32, cat: 'Erste Hilfe', q: 'Was tun bei einer bewusstlosen Person?', opts: ['Stabile Seitenlage, Atemwege prüfen', 'Sofort Wasser geben', 'Hinsetzen'], correct: 0, exp: 'Die stabile Seitenlage verhindert das Ersticken.' },
    { id: 33, cat: 'Technik', q: 'Was ist ein Reifendruckverlustsystem (RDKS)?', opts: ['Warnt bei zu niedrigem Reifendruck', 'Kühlt die Reifen', 'Erhöht die Geschwindigkeit'], correct: 0, exp: 'Das RDKS überwacht den Reifendruck.' },
    { id: 34, cat: 'Gefahrenlehre', q: 'Sie fahren bei Glatteis. Was ist verboten?', opts: ['Abrupte Lenkbewegungen und starkes Bremsen', 'Langsam fahren', 'Winterreifen nutzen'], correct: 0, exp: 'Auf Glatteis können abrupte Manöver zum Ausbrechen führen.' },
    { id: 35, cat: 'Vorfahrt', q: 'Wer hat Vorrang: Fußgänger oder Auto?', opts: ['Fußgänger am Zebrastreifen', 'Das Auto', 'Wer schneller ist'], correct: 0, exp: 'Am Zebrastreifen haben Fußgänger absoluten Vorrang.' },
    { id: 36, cat: 'Verkehrszeichen', q: 'Ein blaues Schild mit weißem P bedeutet?', opts: ['Parkplatz', 'Verbot für PKW', 'Fußgängerzone'], correct: 0, exp: 'Das weiße P auf blauem Grund ist das Parkplatzschild.' },
    { id: 37, cat: 'Technik', q: 'Was ist die Funktion des ABS?', opts: ['Verhindert das Blockieren der Räder beim Bremsen', 'Erhöht die Motorleistung', 'Reduziert den Benzinverbrauch'], correct: 0, exp: 'ABS verhindert das Blockieren der Räder.' },
    { id: 38, cat: 'Umweltschutz', q: 'Was schadet der Umwelt am meisten?', opts: ['Ständiges Beschleunigen und Bremsen', 'Gleichmäßige Fahrt', 'Frühes Hochschalten'], correct: 0, exp: 'Ständiges Beschleunigen und Bremsen erhöht den Verbrauch.' },
    { id: 39, cat: 'Gefahrenlehre', q: 'Sie sehen Kinder am Straßenrand. Was tun?', opts: ['Geschwindigkeit reduzieren, bremsbereit sein', 'Hupen und weiterfahren', 'Gas geben'], correct: 0, exp: 'Kinder sind unberechenbar. Bremsbereit sein!' },
    { id: 40, cat: 'Erste Hilfe', q: 'Wie viele Atemzüge pro Minute hat ein Erwachsener?', opts: ['12-18', '5-8', '30-40'], correct: 0, exp: 'Ein Erwachsener atmet 12-18 Mal pro Minute.' },
    { id: 41, cat: 'Technik', q: 'Was passiert bei zu niedrigem Reifendruck?', opts: ['Erhöhter Spritverbrauch und Verschleiß', 'Das Auto wird schneller', 'Es hat keine Auswirkungen'], correct: 0, exp: 'Zu niedriger Reifendruck erhöht den Verbrauch.' },
    { id: 42, cat: 'Verkehrszeichen', q: 'Was bedeutet das Schild "Vorfahrtstraße"?', opts: ['Gelbe Raute - Ich habe Vorfahrt', 'Rotes Dreieck - Ich muss warten', 'Blaues Quadrat - Ich darf parken'], correct: 0, exp: 'Die gelbe Raute zeigt eine Vorfahrtstraße an.' },
    { id: 43, cat: 'Gefahrenlehre', q: 'Ein Traktor zieht heraus. Was tun?', opts: ['Bremsen und Geschwindigkeit anpassen', 'Hupen und überholen', 'Weiterfahren'], correct: 0, exp: 'Langsame Fahrzeuge erfordern Bremsbereitschaft.' },
    { id: 44, cat: 'Vorfahrt', q: 'Was bedeutet "Rechts vor Links"?', opts: ['Fahrzeuge von rechts haben Vorfahrt', 'Fahrzeuge von links haben Vorfahrt', 'Ich habe immer Vorfahrt'], correct: 0, exp: 'An Kreuzungen ohne Schilder gilt: Rechts vor Links.' },
    { id: 45, cat: 'Technik', q: 'Wie oft sollte man den Ölstand prüfen?', opts: ['Regelmäßig, z.B. alle 2-4 Wochen', 'Nur einmal im Jahr', 'Nie'], correct: 0, exp: 'Der Ölstand sollte regelmäßig geprüft werden.' },
    { id: 46, cat: 'Erste Hilfe', q: 'Was ist bei einer Verbrennung zu tun?', opts: ['Mit Wasser kühlen', 'Eis drauflegen', 'Salbe auftragen'], correct: 0, exp: 'Verbrennungen sollten sofort mit lauwarmem Wasser gekühlt werden.' },
    { id: 47, cat: 'Gefahrenlehre', q: 'Sie werden überholt. Was tun?', opts: ['Geschwindigkeit beibehalten, rechts fahren', 'Beschleunigen', 'Bremsen'], correct: 0, exp: 'Geschwindigkeit beibehalten und rechts fahren.' },
    { id: 48, cat: 'Verkehrszeichen', q: 'Was bedeutet ein blaues Schild mit einem Fahrrad?', opts: ['Radweg', 'Fahrradverbot', 'Überholverbot'], correct: 0, exp: 'Das blaue Schild mit dem weißen Fahrrad ist ein Radweg.' },
    { id: 49, cat: 'Umweltschutz', q: 'Was ist ein umweltfreundlicher Fahrstil?', opts: ['Vorausschauend fahren, früh schalten', 'Ständig bremsen und beschleunigen', 'Reifen platt lassen'], correct: 0, exp: 'Vorausschauendes Fahren spart Sprit.' },
    { id: 50, cat: 'Vorfahrt', q: 'Wer hat Vorrang beim Ausfahren aus einem Kreisverkehr?', opts: ['Der Verkehr im Kreisverkehr', 'Ich, weil ich ausfahre', 'Der Gegenverkehr'], correct: 0, exp: 'Auch beim Ausfahren muss der Verkehr im Kreis durchgelassen werden.' }
  ];

  const SIGNS = {
    'Gefahrenzeichen': [
      { icon: '⚠️', name: 'Allgemeine Gefahr', desc: 'Gefahr durch ein Hindernis oder eine unübersichtliche Stelle.' },
      { icon: '🚧', name: 'Baustelle', desc: 'Gefahr durch Bauarbeiten auf der Fahrbahn.' },
      { icon: '🦌', name: 'Wildwechsel', desc: 'Gefahr durch Tiere auf der Fahrbahn.' },
      { icon: '🔄', name: 'Kreisverkehr', desc: 'Vorfahrt gewähren im Kreisverkehr.' },
      { icon: '🚦', name: 'Lichtzeichenanlage', desc: 'Ampel oder Verkehrsampel in der Nähe.' },
      { icon: '🚶', name: 'Fußgänger', desc: 'Gefahr durch Fußgänger auf der Straße.' },
      { icon: '❄️', name: 'Glätte', desc: 'Gefahr durch Schnee oder Eis.' },
      { icon: '💧', name: 'Aquaplaning', desc: 'Gefahr durch Wasser auf der Fahrbahn.' },
      { icon: '🚋', name: 'Straßenbahn', desc: 'Vorsicht, Straßenbahn kreuzt die Fahrbahn.' },
      { icon: '✈️', name: 'Flugzeug', desc: 'Tieffliegende Flugzeuge.' }
    ],
    'Vorschriftzeichen': [
      { icon: '🛑', name: 'Halt! Vorfahrt gewähren', desc: 'Anhalten und Vorfahrt gewähren.' },
      { icon: '⬇️', name: 'Vorfahrt gewähren', desc: 'Andere Fahrzeuge durchlassen (Spitze unten).' },
      { icon: '🚫', name: 'Verbot der Einfahrt', desc: 'Keine Einfahrt in diese Straße.' },
      { icon: '⬅️', name: 'Vorgeschriebene Richtung links', desc: 'Man muss links abbiegen.' },
      { icon: '➡️', name: 'Vorgeschriebene Richtung rechts', desc: 'Man muss rechts abbiegen.' },
      { icon: '30', name: 'Tempolimit 30', desc: 'Maximal 30 km/h erlaubt.' },
      { icon: '80', name: 'Tempolimit 80', desc: 'Maximal 80 km/h erlaubt.' },
      { icon: '🚲', name: 'Radweg', desc: 'Nur für Radfahrer (blaues Schild).' },
      { icon: '🚗', name: 'Überholverbot', desc: 'Überholen für Kraftfahrzeuge verboten.' },
      { icon: '🅿️', name: 'Parkverbot', desc: 'Parken verboten (eingeschränktes Halteverbot).' }
    ],
    'Richtzeichen': [
      { icon: '⬆️', name: 'Vorfahrtstraße', desc: 'Die Straße hat Vorfahrt (gelbe Raute).' },
      { icon: '🅿️', name: 'Parkplatz', desc: 'Parken erlaubt.' },
      { icon: '⛽', name: 'Tankstelle', desc: 'Tankstelle in der Nähe.' },
      { icon: '🏥', name: 'Krankenhaus', desc: 'Krankenhaus in der Nähe, ruhig fahren.' },
      { icon: '🚌', name: 'Bushaltestelle', desc: 'Bushaltestelle in der Nähe.' },
      { icon: '🛣️', name: 'Autobahn', desc: 'Beginn der Autobahn.' },
      { icon: '🏙️', name: 'Ortseingang', desc: 'Beginn einer geschlossenen Ortschaft.' },
      { icon: '🚦', name: 'Ampel', desc: 'Lichtzeichenanlage.' },
      { icon: '🛤️', name: 'Autobahnausfahrt', desc: 'Hier verlässt man die Autobahn.' },
      { icon: '🛣️', name: 'Bundesstraße', desc: 'Beginn einer Bundesstraße.' }
    ]
  };

  let state = {
    lang: 'de',
    stats: { examsTaken: 0, examsPassed: 0, questionsAnswered: 0, correctAnswers: 0 },
    currentView: 'dashboard',
    settings: { autoNext: false, soundFx: true },
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

  function css() {
    return `<style>
      .fs-app { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #e8e8ec; background: #0a0a0f; height: 100%; display: flex; flex-direction: row; overflow: hidden; }
      .fs-sidebar { width: 260px; background: rgba(17,17,24,0.95); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
      .fs-logo { font-size: 20px; font-weight: 900; color: #00e5ff; padding: 0 20px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px; }
      .fs-logo span { font-size: 10px; background: rgba(0,229,255,0.1); padding: 3px 6px; border-radius: 4px; color: #00e5ff; }
      .fs-nav-item { padding: 12px 20px; display: flex; align-items: center; gap: 12px; color: #a8b0cc; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; border-left: 3px solid transparent; margin-bottom: 2px; }
      .fs-nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
      .fs-nav-item.active { background: rgba(0,229,255,0.08); color: #00e5ff; border-left-color: #00e5ff; }
      .fs-nav-item .icon { font-size: 18px; width: 24px; text-align: center; }
      .fs-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
      .fs-header { padding: 20px 30px; background: rgba(10,10,15,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; z-index: 10; }
      .fs-header h1 { margin: 0; font-size: 22px; font-weight: 900; color: #fff; }
      .fs-content-area { flex: 1; overflow-y: auto; padding: 30px; }
      .fs-content-inner { max-width: 900px; margin: 0 auto; }
      .fs-card { background: rgba(20, 20, 28, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .fs-card h2 { margin-top: 0; font-size: 20px; color: #fff; margin-bottom: 15px; font-weight: 900; }
      .fs-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; }
      .fs-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .fs-btn.primary { background: linear-gradient(135deg, #00e5ff, #b478ff); color: #000; border: none; font-weight: 900; box-shadow: 0 4px 15px rgba(0,229,255,0.3); }
      .fs-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,229,255,0.5); }
      .fs-btn.danger { background: linear-gradient(135deg, #ff3333, #cc0000); color: #fff; border: none; font-weight: 900; box-shadow: 0 4px 15px rgba(255,51,51,0.4); }
      .fs-opt { display: block; width: 100%; text-align: left; padding: 18px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #ddd; margin-bottom: 12px; cursor: pointer; font-family: inherit; font-size: 15px; transition: all 0.2s; }
      .fs-opt:hover { background: rgba(255,255,255,0.08); border-color: #00e5ff; transform: translateX(5px); }
      .fs-opt.correct { background: rgba(0,255,102,0.15); border-color: #00ff66; color: #00ff66; font-weight: bold; }
      .fs-opt.wrong { background: rgba(255,0,0,0.15); border-color: #ff3333; color: #ff3333; }
      .fs-opt:disabled { cursor: default; opacity: 0.8; transform: none; }
      .fs-exp { background: rgba(0,229,255,0.05); border-left: 4px solid #00e5ff; padding: 15px; border-radius: 0 12px 12px 0; margin-top: 20px; font-size: 14px; line-height: 1.6; color: #a8b0cc; display: none; }
      .fs-signs-cat { margin-bottom: 30px; }
      .fs-signs-cat h3 { color: #00e5ff; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid rgba(0,229,255,0.2); padding-bottom: 10px; }
      .fs-signs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; }
      .fs-sign-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: center; transition: all 0.2s; cursor: pointer; }
      .fs-sign-item:hover { transform: translateY(-5px); border-color: #00e5ff; background: rgba(0,229,255,0.05); }
      .fs-sign-icon { font-size: 50px; margin-bottom: 15px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5)); }
      .fs-sign-name { font-weight: 900; color: #fff; font-size: 15px; margin-bottom: 8px; }
      .fs-sign-desc { font-size: 12px; color: #888; line-height: 1.4; }
      .fs-theory-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .fs-theory-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; }
      .fs-theory-card:hover { border-color: #00e5ff; background: rgba(0,229,255,0.05); }
      .fs-theory-card h4 { margin: 0 0 10px; color: #fff; font-size: 16px; }
      .fs-theory-card p { margin: 0; font-size: 13px; color: #888; line-height: 1.5; }
      .fs-video-card { position: relative; border-radius: 12px; overflow: hidden; background: #000; aspect-ratio: 16/9; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
      .fs-video-card:hover .fs-play-btn { transform: scale(1.1); background: #00e5ff; color: #000; }
      .fs-play-btn { width: 60px; height: 60px; background: rgba(0,229,255,0.2); border: 2px solid #00e5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #00e5ff; transition: all 0.2s; backdrop-filter: blur(5px); }
      .fs-video-title { position: absolute; bottom: 0; left: 0; right: 0; padding: 15px; background: linear-gradient(transparent, rgba(0,0,0,0.9)); color: #fff; font-weight: bold; font-size: 14px; }
      .fs-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .fs-modal-overlay.show { opacity: 1; pointer-events: auto; }
      .fs-modal { background: #14141c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 25px; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; }
      .fs-modal h3 { margin-top: 0; color: #00e5ff; font-size: 22px; display: flex; align-items: center; justify-content: center; gap: 8px; }
      .fs-modal p { color: #ccc; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
      .fs-stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 20px; }
      .fs-stat-box { background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-radius: 12px; padding: 20px; text-align: center; }
      .fs-stat-box .val { font-size: 28px; font-weight: 900; color: #00e5ff; display: block; margin-bottom: 5px; }
      .fs-stat-box .lbl { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
      .fs-timer { font-size: 32px; font-weight: 900; color: #ffaa00; background: rgba(255,170,0,0.1); padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(255,170,0,0.3); box-shadow: 0 0 20px rgba(255,170,0,0.2); }
      .fs-select { background: #1a1a24; color: #fff; border: 1px solid #333; border-radius: 8px; padding: 10px 15px; font-family: inherit; font-size: 14px; outline: none; cursor: pointer; width: 100%; max-width: 300px; }
      .fs-setting-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .fs-setting-row:last-child { border-bottom: none; }
      .fs-setting-info { flex: 1; }
      .fs-setting-info h4 { margin: 0 0 5px; font-size: 15px; color: #fff; }
      .fs-setting-info p { margin: 0; font-size: 12px; color: #888; }
      .fs-toggle { position: relative; width: 50px; height: 28px; background: #333; border-radius: 14px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
      .fs-toggle.on { background: #00e5ff; }
      .fs-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
      .fs-toggle.on::after { transform: translateX(22px); }
    </style>`;
  }

  function t(key) { return (LANG[state.lang] && LANG[state.lang][key]) || LANG['de'][key] || key; }

  function renderDashboard() {
    const pct = state.stats.examsTaken > 0 ? Math.round((state.stats.examsPassed / state.stats.examsTaken) * 100) : 0;
    const totalQ = state.stats.questionsAnswered;
    const accuracy = totalQ > 0 ? Math.round((state.stats.correctAnswers / totalQ) * 100) : 0;

    return `
      <div class="fs-content-inner">
        <div class="fs-card" style="text-align: center; padding: 50px 20px; background: linear-gradient(135deg, rgba(0,229,255,0.05), rgba(180,120,255,0.05)); border-color: rgba(0,229,255,0.2);">
          <div style="font-size: 80px; margin-bottom: 20px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));">🚦</div>
          <h2 style="font-size: 36px; margin-bottom: 10px; background: linear-gradient(90deg, #00e5ff, #b478ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900;">HalDo Fahrschule</h2>
          <p style="color: #a8b0cc; margin-bottom: 30px; font-size: 16px; max-width: 500px; margin-left: auto; margin-right: auto;">Die professionelle Theorie-Lern-App. KI-gestützt, mehrsprachig und zu 100 % auf deine Führerscheinprüfung vorbereitet.</p>
          <button class="fs-btn primary" data-action="view-exam" style="padding: 15px 40px; font-size: 18px; margin: 0 auto;">🏁 ${t('exam_start')}</button>
        </div>
        
        <div class="fs-stats-grid">
          <div class="fs-stat-box"><span class="val">${state.stats.examsTaken}</span><span class="lbl">${t('exam')}</span></div>
          <div class="fs-stat-box"><span class="val" style="color:#00ff66;">${state.stats.examsPassed}</span><span class="lbl">${t('pass')}</span></div>
          <div class="fs-stat-box"><span class="val">${accuracy}%</span><span class="lbl">${t('correct')}</span></div>
        </div>
      </div>
    `;
  }

  function renderLearnSetup() {
    return `
      <div class="fs-content-inner">
        <div class="fs-card">
          <h2>📖 ${t('learn')} - ${t('select_count')}</h2>
          <p style="color: #888; margin-bottom: 20px;">Wähle aus, wie viele Fragen du jetzt üben möchtest. Die Fragen werden zufällig ausgewählt.</p>
          <div style="display: flex; gap: 15px; margin-top: 20px;">
            <button class="fs-btn" data-action="start-learn" data-count="15" style="flex:1; padding:20px;">15 ${t('questions')}</button>
            <button class="fs-btn" data-action="start-learn" data-count="30" style="flex:1; padding:20px;">30 ${t('questions')}</button>
            <button class="fs-btn" data-action="start-learn" data-count="45" style="flex:1; padding:20px;">45 ${t('questions')}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderLearn() {
    if (!state.learnList || state.learnIndex >= state.learnList.length) {
      return `<div class="fs-content-inner"><div class="fs-card" style="text-align:center; padding:50px;"><h2>🎉 Super gemacht!</h2><p style="color:#888;">Du hast alle Fragen in dieser Runde beantwortet.</p><button class="fs-btn primary" data-action="view-learn-setup" style="margin-top:20px;">Nochmal lernen</button></div></div>`;
    }

    const q = state.learnList[state.learnIndex];
    let optHtml = '';
    q.opts.forEach((opt, i) => {
      optHtml += `<button class="fs-opt" data-action="learn-answer" data-idx="${i}">${opt}</button>`;
    });
    
    return `
      <div class="fs-content-inner">
        <div class="fs-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <span style="font-size:12px; font-weight:900; color:#00e5ff; background:rgba(0,229,255,0.1); padding:6px 12px; border-radius:6px; text-transform:uppercase; letter-spacing:1px;">${q.cat}</span>
            <span style="font-size:14px; font-weight:bold; color:#888;">${state.learnIndex + 1} / ${state.learnList.length}</span>
          </div>
          <h2 style="font-size: 24px; line-height: 1.4;">${q.q}</h2>
          <div style="margin-top: 30px;" id="fs-opt-container">${optHtml}</div>
          <div class="fs-exp" id="fs-explain">
            <div style="display:flex; justify-content:space-between; align-items:start; gap:20px;">
              <div>${q.exp}</div>
              <button class="fs-btn" data-action="ask-ai" style="background: rgba(0,229,255,0.1); border-color: #00e5ff; color: #00e5ff; flex-shrink:0;">🤖 ${t('ai_explain')}</button>
            </div>
          </div>
          <div style="margin-top:30px; display:flex; justify-content:space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <button class="fs-btn" data-action="view-dashboard">${t('back')}</button>
            <button class="fs-btn primary" id="fs-next-btn" data-action="learn-next" style="display:none;">${t('next')} ➡️</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderExamSetup() {
    return `
      <div class="fs-content-inner">
        <div class="fs-card">
          <h2>🏁 ${t('exam')} - ${t('select_count')}</h2>
          <p style="color: #888; margin-bottom: 20px;">Die Prüfung simuliert die echte Theorieprüfung. Der Timer läuft mit. Du musst 80% bestehen.</p>
          <div style="display: flex; gap: 15px; margin-top: 20px;">
            <button class="fs-btn" data-action="start-exam" data-count="15" style="flex:1; padding:20px;">15 ${t('questions')}</button>
            <button class="fs-btn" data-action="start-exam" data-count="30" style="flex:1; padding:20px;">30 ${t('questions')}</button>
            <button class="fs-btn" data-action="start-exam" data-count="45" style="flex:1; padding:20px;">45 ${t('questions')}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderExam() {
    if (!state.exam) return '';
    if (state.exam.finished) {
      const passed = state.exam.correct >= Math.ceil(state.exam.total * 0.8);
      return `
        <div class="fs-content-inner">
          <div class="fs-card" style="text-align:center; padding:60px 20px;">
            <div style="font-size:100px; margin-bottom:20px;">${passed ? '🎉' : '😢'}</div>
            <h2 style="font-size:40px; color:${passed ? '#00ff66' : '#ff3333'}; margin-bottom:10px; font-weight:900;">${passed ? t('pass') : t('fail')}</h2>
            <p style="color:#888; font-size:18px; margin:20px 0;">Du hast ${state.exam.correct} von ${state.exam.total} Fragen richtig beantwortet.</p>
            <button class="fs-btn primary" data-action="view-dashboard" style="padding:15px 40px; font-size:18px; margin-top:20px;">${t('dashboard')}</button>
          </div>
        </div>
      `;
    }
    
    const q = state.exam.questions[state.exam.current];
    let optHtml = '';
    q.opts.forEach((opt, i) => {
      optHtml += `<button class="fs-opt" data-action="exam-answer" data-idx="${i}">${opt}</button>`;
    });
    
    return `
      <div class="fs-content-inner">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <span style="font-weight:900; color:#fff; font-size:20px;">${t('questions')} ${state.exam.current + 1} / ${state.exam.total}</span>
          <div class="fs-timer" id="fs-exam-timer">${Math.floor(state.exam.timeLeft / 60)}:${(state.exam.timeLeft % 60).toString().padStart(2, '0')}</div>
        </div>
        <div class="fs-card">
          <span style="font-size:12px; font-weight:900; color:#00e5ff; background:rgba(0,229,255,0.1); padding:6px 12px; border-radius:6px; text-transform:uppercase; letter-spacing:1px;">${q.cat}</span>
          <h2 style="font-size: 24px; line-height: 1.4; margin-top:15px;">${q.q}</h2>
          <div style="margin-top: 30px;" id="fs-exam-opts">${optHtml}</div>
        </div>
      </div>
    `;
  }

  function renderSigns() {
    let html = `<div class="fs-content-inner">`;
    Object.keys(SIGNS).forEach(cat => {
      html += `<div class="fs-signs-cat"><h3>${cat}</h3><div class="fs-signs-grid">`;
      SIGNS[cat].forEach(s => {
        html += `<div class="fs-sign-item" data-action="click-sign" data-name="${s.name}" data-desc="${s.desc}" data-icon="${s.icon}">
          <div class="fs-sign-icon">${s.icon}</div>
          <div class="fs-sign-name">${s.name}</div>
          <div class="fs-sign-desc">${s.desc}</div>
        </div>`;
      });
      html += `</div></div>`;
    });
    html += `</div>`;
    return html;
  }

  function renderVideos() {
    const vids = [
      { title: 'Grundlagen der Vorfahrt', dur: '12:30', cat: 'Grundwissen' },
      { title: 'Autobahn: Auffahrt & Rettungsgasse', dur: '08:45', cat: 'Autobahn' },
      { title: 'Richtig Einparken (Längs & Quer)', dur: '15:20', cat: 'Praktisch' },
      { title: 'Verhalten bei Panne & Unfall', dur: '10:15', cat: 'Grundwissen' }
    ];
    let html = `<div class="fs-content-inner"><div class="fs-card"><h2>🎬 Lernvideos</h2><div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">`;
    vids.forEach(v => {
      html += `<div class="fs-video-card" onclick="alert('Video-Player wird gestartet (Simulation).')">
        <div class="fs-play-btn">▶</div>
        <div class="fs-video-title">${v.title} <br><span style="font-size:12px; color:#00e5ff;">${v.cat}</span><span style="float:right; color:#888; font-weight:normal;">${v.dur}</span></div>
      </div>`;
    });
    html += `</div></div></div>`;
    return html;
  }

  function renderTheory() {
    const theory = [
      { title: 'Erste Hilfe', desc: 'Notruf, Stabile Seitenlage, Wiederbelebung, Verbrennungen. Alles was du wissen musst.' },
      { title: 'Fahrzeugtechnik', desc: 'ABS, ESP, Kupplung, Reifen, Bremsen. So funktioniert dein Auto.' },
      { title: 'Umweltbewusstes Fahren', desc: 'Sprit sparen, Emissionen reduzieren, Reifendruck prüfen.' },
      { title: 'Verhalten im Straßenverkehr', desc: 'Rücksichtnahme, Vorfahrt, defensives Fahren.' }
    ];
    let html = `<div class="fs-content-inner"><div class="fs-card"><h2>📚 Theorie A-Z</h2><div class="fs-theory-grid">`;
    theory.forEach(t => {
      html += `<div class="fs-theory-card" onclick="alert('Lernmodul ${t.title} wird geöffnet (Simulation).')">
        <h4>${t.title}</h4><p>${t.desc}</p>
      </div>`;
    });
    html += `</div></div></div>`;
    return html;
  }

  function renderSettings() {
    return `
      <div class="fs-content-inner">
        <div class="fs-card">
          <h2>⚙️ ${t('settings')}</h2>
          
          <div class="fs-setting-row">
            <div class="fs-setting-info"><h4>${t('lang')}</h4></div>
            <select class="fs-select" data-action="set-lang">
              <option value="de" ${state.lang === 'de' ? 'selected' : ''}>Deutsch</option>
              <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="tr" ${state.lang === 'tr' ? 'selected' : ''}>Türkçe</option>
              <option value="ku" ${state.lang === 'ku' ? 'selected' : ''}>Kurmandschi</option>
              <option value="ckb" ${state.lang === 'ckb' ? 'selected' : ''}>Sorani</option>
              <option value="gorani" ${state.lang === 'gorani' ? 'selected' : ''}>Gorani</option>
              <option value="ez" ${state.lang === 'ez' ? 'selected' : ''}>Ezidi</option>
              <option value="fr" ${state.lang === 'fr' ? 'selected' : ''}>Français</option>
              <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="es" ${state.lang === 'es' ? 'selected' : ''}>Español</option>
              <option value="pl" ${state.lang === 'pl' ? 'selected' : ''}>Polski</option>
              <option value="ru" ${state.lang === 'ru' ? 'selected' : ''}>Русский</option>
              <option value="uz" ${state.lang === 'uz' ? 'selected' : ''}>O'zbekcha</option>
              <option value="fa" ${state.lang === 'fa' ? 'selected' : ''}>فارسی</option>
              <option value="la" ${state.lang === 'la' ? 'selected' : ''}>Lingua Latina</option>
              <option value="zh" ${state.lang === 'zh' ? 'selected' : ''}>中文</option>
              <option value="ja" ${state.lang === 'ja' ? 'selected' : ''}>日本語</option>
            </select>
          </div>

          <div class="fs-setting-row">
            <div class="fs-setting-info"><h4>${t('auto_next')}</h4><p>${t('auto_next_desc')}</p></div>
            <div class="fs-toggle ${state.settings.autoNext ? 'on' : ''}" data-action="toggle-setting" data-key="autoNext"></div>
          </div>

          <div class="fs-setting-row">
            <div class="fs-setting-info"><h4>${t('sound_fx')}</h4><p>${t('sound_fx_desc')}</p></div>
            <div class="fs-toggle ${state.settings.soundFx ? 'on' : ''}" data-action="toggle-setting" data-key="soundFx"></div>
          </div>

          <div class="fs-setting-row">
            <div class="fs-setting-info"><h4>${t('reset_stats')}</h4><p>${t('reset_stats_desc')}</p></div>
            <button class="fs-btn danger" data-action="reset-stats">${t('reset_stats')}</button>
          </div>

          <div class="fs-setting-row" style="border:none; padding-top:30px;">
            <div class="fs-setting-info"><h4>${t('about')}</h4><p>HalDo Fahrschule PRO MAX</p></div>
            <span style="color:#00e5ff; font-weight:bold;">${t('version')} ${VERSION}</span>
          </div>
        </div>
      </div>
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
    else if (state.currentView === 'theory') viewHtml = renderTheory();
    else if (state.currentView === 'settings') viewHtml = renderSettings();

    return css() + `
      <div class="fs-app">
        <div class="fs-sidebar">
          <div class="fs-logo">🚦 HalDo Fahrschule <span>PRO MAX</span></div>
          <div class="fs-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">🏠</span> ${t('dashboard')}</div>
          <div class="fs-nav-item ${state.currentView === 'learn-setup' || state.currentView === 'learn' ? 'active' : ''}" data-action="view-learn-setup"><span class="icon">📖</span> ${t('learn')}</div>
          <div class="fs-nav-item ${state.currentView === 'exam-setup' || state.currentView === 'exam' ? 'active' : ''}" data-action="view-exam"><span class="icon">🏁</span> ${t('exam')}</div>
          <div class="fs-nav-item ${state.currentView === 'signs' ? 'active' : ''}" data-action="view-signs"><span class="icon">🛑</span> ${t('signs')}</div>
          <div class="fs-nav-item ${state.currentView === 'theory' ? 'active' : ''}" data-action="view-theory"><span class="icon">📚</span> ${t('theory')}</div>
          <div class="fs-nav-item ${state.currentView === 'videos' ? 'active' : ''}" data-action="view-videos"><span class="icon">🎬</span> ${t('videos')}</div>
          <div style="flex:1;"></div>
          <div class="fs-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> ${t('settings')}</div>
        </div>
        <div class="fs-main">
          <div class="fs-header">
            <h1>${state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'learn' || state.currentView === 'learn-setup' ? t('learn') : state.currentView === 'exam' || state.currentView === 'exam-setup' ? t('exam') : state.currentView === 'signs' ? t('signs') : state.currentView === 'theory' ? t('theory') : state.currentView === 'videos' ? t('videos') : t('settings')}</h1>
            <div style="font-size:12px; color:#888;">v${VERSION}</div>
          </div>
          <div class="fs-content-area" id="fs-main-content">${viewHtml}</div>
        </div>
      </div>
      
      <div class="fs-modal-overlay" id="fs-sign-modal">
        <div class="fs-modal">
          <div style="font-size:80px; margin-bottom:10px;" id="fs-sign-icon">🛑</div>
          <h3 id="fs-sign-title">Stop</h3>
          <p id="fs-sign-desc">Beschreibung...</p>
          <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
            <button class="fs-btn" id="fs-sign-tts-btn" style="background: rgba(0,229,255,0.1); border-color: #00e5ff; color: #00e5ff;">🔊 ${t('speak')}</button>
            <button class="fs-btn primary" id="fs-sign-ai-btn">🤖 ${t('ai_explain')}</button>
          </div>
          <button class="fs-btn ghost" style="width:100%;" onclick="document.getElementById('fs-sign-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>

      <div class="fs-modal-overlay" id="fs-ai-modal">
        <div class="fs-modal">
          <h3>🤖 HalDo KI Assistent</h3>
          <p id="fs-ai-text">Analysiere...</p>
          <button class="fs-btn primary" style="width:100%;" onclick="document.getElementById('fs-ai-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>
    `;
  }

  function shuffle(array) { return [...array].sort(() => Math.random() - 0.5); }

  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { de: 'de-DE', en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', fa: 'fa-IR', uz: 'uz-UZ', pl: 'pl-PL' };
    u.lang = langMap[state.lang] || 'de-DE';
    window.speechSynthesis.speak(u);
  }

  function playSound(type) {
    if (!state.settings.soundFx) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'correct') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      }
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  function startExam(count) {
    state.exam = {
      questions: shuffle(QUESTIONS).slice(0, count),
      current: 0,
      correct: 0,
      total: count,
      finished: false,
      timeLeft: count * 60
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
        if (state.exam.timeLeft <= 60) timerEl.style.color = '#ff3333';
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

  async function askAI(text) {
    const modal = document.getElementById('fs-ai-modal');
    const textEl = document.getElementById('fs-ai-text');
    if (!modal || !textEl) return;
    
    modal.classList.add('show');
    textEl.innerHTML = '<span style="color:#00e5ff;">Analysiere...</span>';
    
    setTimeout(() => {
      let aiResponse = text;
      if (window.HalDoAI && typeof window.HalDoAI.generate === 'function') {
        try { aiResponse = window.HalDoAI.generate("Erkläre das: " + text); } catch(e) {}
      } else {
        aiResponse = `Stell dir vor, du fährst gerade auf der Straße. ${text} <br><br><b>Tipp von HalDo KI:</b> Achte immer auf die anderen Verkehrsteilnehmer und sei vorausschauend!`;
      }
      textEl.innerHTML = aiResponse;
    }, 1200);
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'view-dashboard') { state.currentView = 'dashboard'; if (timerInterval) clearInterval(timerInterval); updateView(); return; }
    if (action === 'view-learn-setup') { state.currentView = 'learn-setup'; updateView(); return; }
    if (action === 'view-exam') { state.currentView = 'exam-setup'; updateView(); return; }
    if (action === 'view-signs') { state.currentView = 'signs'; updateView(); return; }
    if (action === 'view-videos') { state.currentView = 'videos'; updateView(); return; }
    if (action === 'view-theory') { state.currentView = 'theory'; updateView(); return; }
    if (action === 'view-settings') { state.currentView = 'settings'; updateView(); return; }

    if (action === 'start-exam') { startExam(parseInt(btn.dataset.count)); return; }
    if (action === 'start-learn') { startLearn(parseInt(btn.dataset.count)); return; }

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
      
      playSound(idx === q.correct ? 'correct' : 'wrong');

      state.stats.questionsAnswered++;
      if (idx === q.correct) state.stats.correctAnswers++;
      saveState();

      if (state.settings.autoNext && idx === q.correct) {
        setTimeout(() => { state.learnIndex++; updateView(); }, 1500);
      }
      return;
    }
    if (action === 'learn-next') { state.learnIndex++; updateView(); return; }

    if (action === 'exam-answer' && state.exam && !state.exam.finished) {
      const idx = parseInt(btn.dataset.idx);
      const q = state.exam.questions[state.exam.current];
      
      playSound(idx === q.correct ? 'correct' : 'wrong');

      state.stats.questionsAnswered++;
      if (idx === q.correct) { state.exam.correct++; state.stats.correctAnswers++; }
      saveState();

      state.exam.current++;
      if (state.exam.current >= state.exam.total) finishExam();
      else updateView();
      return;
    }

    if (action === 'ask-ai') {
      const q = state.learnList[state.learnIndex];
      askAI(q.q + " " + q.exp);
      return;
    }

    if (action === 'toggle-setting') {
      const key = btn.dataset.key;
      state.settings[key] = !state.settings[key];
      saveState(); updateView();
      return;
    }

    if (action === 'reset-stats') {
      if (confirm('Wirklich alle Statistiken zurücksetzen?')) {
        state.stats = { examsTaken: 0, examsPassed: 0, questionsAnswered: 0, correctAnswers: 0 };
        saveState(); updateView();
      }
      return;
    }

    if (action === 'click-sign') {
      const name = btn.dataset.name, desc = btn.dataset.desc, icon = btn.dataset.icon;
      document.getElementById('fs-sign-icon').textContent = icon;
      document.getElementById('fs-sign-title').textContent = name;
      document.getElementById('fs-sign-desc').textContent = desc;
      
      document.getElementById('fs-sign-tts-btn').onclick = () => speakText(`${name}. ${desc}`);
      document.getElementById('fs-sign-ai-btn').onclick = () => askAI(`Erkläre das Verkehrszeichen "${name}". ${desc}`);
      document.getElementById('fs-sign-modal').classList.add('show');
      return;
    }
  }

  function handleChange(e) {
    if (e.target.dataset.action === 'set-lang') { state.lang = e.target.value; saveState(); updateView(); }
  }

  function updateView() {
    if (!currentTarget) return;
    const main = currentTarget.querySelector('#fs-main-content');
    const sidebar = currentTarget.querySelector('.fs-sidebar');
    const headerTitle = currentTarget.querySelector('.fs-header h1');
    
    if (main) {
      if (state.currentView === 'dashboard') main.innerHTML = renderDashboard();
      else if (state.currentView === 'learn-setup') main.innerHTML = renderLearnSetup();
      else if (state.currentView === 'learn') main.innerHTML = renderLearn();
      else if (state.currentView === 'exam-setup') main.innerHTML = renderExamSetup();
      else if (state.currentView === 'exam') main.innerHTML = renderExam();
      else if (state.currentView === 'signs') main.innerHTML = renderSigns();
      else if (state.currentView === 'theory') main.innerHTML = renderTheory();
      else if (state.currentView === 'videos') main.innerHTML = renderVideos();
      else if (state.currentView === 'settings') main.innerHTML = renderSettings();
    }
    
    if (sidebar) {
        sidebar.innerHTML = `
          <div class="fs-logo">🚦 HalDo Fahrschule <span>PRO MAX</span></div>
          <div class="fs-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">🏠</span> ${t('dashboard')}</div>
          <div class="fs-nav-item ${state.currentView === 'learn-setup' || state.currentView === 'learn' ? 'active' : ''}" data-action="view-learn-setup"><span class="icon">📖</span> ${t('learn')}</div>
          <div class="fs-nav-item ${state.currentView === 'exam-setup' || state.currentView === 'exam' ? 'active' : ''}" data-action="view-exam"><span class="icon">🏁</span> ${t('exam')}</div>
          <div class="fs-nav-item ${state.currentView === 'signs' ? 'active' : ''}" data-action="view-signs"><span class="icon">🛑</span> ${t('signs')}</div>
          <div class="fs-nav-item ${state.currentView === 'theory' ? 'active' : ''}" data-action="view-theory"><span class="icon">📚</span> ${t('theory')}</div>
          <div class="fs-nav-item ${state.currentView === 'videos' ? 'active' : ''}" data-action="view-videos"><span class="icon">🎬</span> ${t('videos')}</div>
          <div style="flex:1;"></div>
          <div class="fs-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> ${t('settings')}</div>
        `;
    }
    
    if (headerTitle) {
        headerTitle.textContent = state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'learn' || state.currentView === 'learn-setup' ? t('learn') : state.currentView === 'exam' || state.currentView === 'exam-setup' ? t('exam') : state.currentView === 'signs' ? t('signs') : state.currentView === 'theory' ? t('theory') : state.currentView === 'videos' ? t('videos') : t('settings');
    }
  }

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
    if (window.HalDoWelcome) window.HalDoWelcome.show("Fahrschule");

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

  window.HalDoApps = window.HalDoApps || {};
  window.HalDoApps.fahrschule = { mount, version: VERSION, open: openOverlay };
  window.Fahrschule = window.HalDoApps.fahrschule;
  window.apps = window.apps || {};
  window.apps.fahrschule = window.HalDoApps.fahrschule;
  window.renderFahrschule = mount;
  window.openFahrschule = openOverlay;

  console.log('🚦 fahrschule.js v' + VERSION + ' geladen — ULTIMATE PRO MAX (Settings, Welcome, 17 Sprachen, KI, TTS)');

})();
