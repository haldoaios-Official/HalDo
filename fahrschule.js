/* HalDo Fahrschule v1100.0 — ULTIMATE GLOBAL (Alle Klassen, Alle Schilder A-Z, TTS, 20+ Sprachen) */
(function () {
  'use strict';

  const VERSION = '1100.0';
  const STORAGE_KEY = 'haldo.fahrschule.pro.stats.v1100';

  // ═══════════════════════════════════════════════════════
  // 1. MULTI-LANGUAGE ENGINE (20+ Sprachen)
  // ═══════════════════════════════════════════════════════
  const LANG = {
    de: {
      dashboard: 'Startseite', learn: 'Lernen', exam: 'Prüfung', signs: 'Schilder', videos: 'Videos', theory: 'Theorie', settings: 'Einstellungen',
      start: 'Starten', questions: 'Fragen', back: 'Zurück', next: 'Weiter', ai_explain: 'KI fragen', pass: 'BESTANDEN', fail: 'DURCHGEFALLEN',
      select_count: 'Wähle die Anzahl der Fragen', lang: 'Sprache', exam_start: 'Prüfung starten', auto_next: 'Auto-Weiter',
      auto_next_desc: 'Automatisch zur nächsten Frage', sound_fx: 'Sound-Effekte', sound_fx_desc: 'Töne bei richtig/falsch',
      reset_stats: 'Statistiken zurücksetzen', reset_stats_desc: 'Löscht alle gespeicherten Fortschritte', about: 'Über die App',
      version: 'Version', speak: 'Vorlesen', close: 'Schließen', listen_question: 'Frage vorlesen', listen_options: 'Antworten vorlesen',
      listen_explanation: 'Erklärung vorlesen', listen_sign: 'Schild vorlesen', listen_video: 'Video-Info vorlesen',
      select_class: 'Führerscheinklasse wählen', class: 'Klasse', all_signs: 'Alle Verkehrszeichen von A-Z', search_signs: 'Schilder suchen...'
    },
    en: {
      dashboard: 'Dashboard', learn: 'Learn', exam: 'Exam', signs: 'Signs', videos: 'Videos', theory: 'Theory', settings: 'Settings',
      start: 'Start', questions: 'Questions', back: 'Back', next: 'Next', ai_explain: 'Ask AI', pass: 'PASSED', fail: 'FAILED',
      select_count: 'Select number of questions', lang: 'Language', exam_start: 'Start Exam', auto_next: 'Auto-Next',
      auto_next_desc: 'Automatically go to next question', sound_fx: 'Sound Effects', sound_fx_desc: 'Sounds on correct/wrong',
      reset_stats: 'Reset Statistics', reset_stats_desc: 'Deletes all saved progress', about: 'About App',
      version: 'Version', speak: 'Speak', close: 'Close', listen_question: 'Listen to question', listen_options: 'Listen to options',
      listen_explanation: 'Listen to explanation', listen_sign: 'Listen to sign', listen_video: 'Listen to video info',
      select_class: 'Select driving class', class: 'Class', all_signs: 'All traffic signs A-Z', search_signs: 'Search signs...'
    },
    tr: {
      dashboard: 'Panel', learn: 'Öğren', exam: 'Sınav', signs: 'İşaretler', videos: 'Videolar', theory: 'Teori', settings: 'Ayarlar',
      start: 'Başla', questions: 'Sorular', back: 'Geri', next: 'İleri', ai_explain: 'Yapay Zeka', pass: 'GEÇTİ', fail: 'KALDI',
      select_count: 'Soru sayısını seçin', lang: 'Dil', exam_start: 'Sınavı Başlat', auto_next: 'Otomatik İleri',
      auto_next_desc: 'Doğru cevapta otomatik geç', sound_fx: 'Ses Efektleri', sound_fx_desc: 'Doğru/yanlış sesleri',
      reset_stats: 'İstatistikleri Sıfırla', reset_stats_desc: 'Tüm ilerlemeyi siler', about: 'Uygulama Hakkında',
      version: 'Sürüm', speak: 'Sesli Oku', close: 'Kapat', listen_question: 'Soruyu dinle', listen_options: 'Seçenekleri dinle',
      listen_explanation: 'Açıklamayı dinle', listen_sign: 'İşareti dinle', listen_video: 'Video bilgisini dinle',
      select_class: 'Ehliyet sınıfı seç', class: 'Sınıf', all_signs: 'Tüm trafik işaretleri A-Z', search_signs: 'İşaret ara...'
    },
    ku: {
      dashboard: 'Destpêk', learn: 'Fêr bibe', exam: 'Azmûn', signs: 'Nîşan', videos: 'Vîdyo', theory: 'Teorî', settings: 'Mîheng',
      start: 'Dest pê bike', questions: 'Pirs', back: 'Veger', next: 'Pêşve', ai_explain: 'Ji AI bipirse', pass: 'DERBAS BÛ', fail: 'DERBAS NE BÛ',
      select_count: 'Hejmara pirsan hilbijêre', lang: 'Ziman', exam_start: 'Azmûnê dest pê bike', auto_next: 'Xweber Pêşve',
      auto_next_desc: 'Xweber here pirsa din', sound_fx: 'Deng', sound_fx_desc: 'Dengê rast/çewt',
      reset_stats: 'Statîstîkan Paqij Bike', reset_stats_desc: 'Hemû pêşkeftinê paqij dike', about: 'Derbarê App',
      version: 'Guhertî', speak: 'Bixwîne', close: 'Bigre', listen_question: 'Pirsê bixwîne', listen_options: 'Bersivan bixwîne',
      listen_explanation: 'Ravekirinê bixwîne', listen_sign: 'Nîşanê bixwîne', listen_video: 'Agahdariya vîdyoyê bixwîne',
      select_class: 'Çîna ehliyetê hilbijêre', class: 'Çîn', all_signs: 'Hemû nîşanên trafîkê A-Z', search_signs: 'Nîşanan bigere...'
    },
    ckb: {
      dashboard: 'دەستپێک', learn: 'فێربوون', exam: 'تاقیکردنەوە', signs: 'هێماکان', videos: 'ڤیدیۆکان', theory: 'تیۆری', settings: 'ڕێکخستنەکان',
      start: 'دەستپێکردن', questions: 'پرسیارەکان', back: 'گەڕانەوە', next: 'دواتر', ai_explain: 'پرسیار لە AI بکە', pass: 'دەرچوو', fail: 'دەرنەچوو',
      select_count: 'ژمارەی پرسیارەکان هەڵبژێرە', lang: 'زمان', exam_start: 'تاقیکردنەوە دەست پێبکە', auto_next: 'خۆکار دواتر',
      auto_next_desc: 'خۆکار بچۆ پرسیاری دواتر', sound_fx: 'دەنگەکان', sound_fx_desc: 'دەنگی ڕاست/هەڵە',
      reset_stats: 'ئامارەکان ڕێست بکە', reset_stats_desc: 'هەموو پێشکەوتنەکان دەسڕێتەوە', about: 'دەربارەی ئەپ',
      version: 'وەشان', speak: 'بخوێنەرەوە', close: 'داخستن', listen_question: 'پرسیارەکە بخوێنەرەوە', listen_options: 'هەڵبژاردنەکان بخوێنەرەوە',
      listen_explanation: 'ڕوونکردنەوە بخوێنەرەوە', listen_sign: 'هێماکە بخوێنەرەوە', listen_video: 'زانیاری ڤیدیۆ بخوێنەرەوە',
      select_class: 'پۆلی مۆڵەت هەڵبژێرە', class: 'پۆل', all_signs: 'هەموو هێماکانی هاتوچۆ A-Z', search_signs: 'گەڕان بۆ هێماکان...'
    },
    gorani: {
      dashboard: 'Destpêk', learn: 'Fêr bibe', exam: 'Azmûn', signs: 'Nîşan', videos: 'Vîdyo', theory: 'Teorî', settings: 'Mîheng',
      start: 'Dest pê bike', questions: 'Pirs', back: 'Veger', next: 'Pêşve', ai_explain: 'Ji AI bipirse', pass: 'DERBAS BÛ', fail: 'DERBAS NE BÛ',
      select_count: 'Hejmara pirsan hilbijêre', lang: 'Ziman', exam_start: 'Azmûnê dest pê bike', auto_next: 'Xweber Pêşve',
      auto_next_desc: 'Xweber here pirsa din', sound_fx: 'Deng', sound_fx_desc: 'Dengê rast/çewt',
      reset_stats: 'Statîstîkan Paqij Bike', reset_stats_desc: 'Hemû pêşkeftinê paqij dike', about: 'Derbarê App',
      version: 'Guhertî', speak: 'Bixwîne', close: 'Bigre', listen_question: 'Pirsê bixwîne', listen_options: 'Bersivan bixwîne',
      listen_explanation: 'Ravekirinê bixwîne', listen_sign: 'Nîşanê bixwîne', listen_video: 'Agahdariya vîdyoyê bixwîne',
      select_class: 'Çîna ehliyetê hilbijêre', class: 'Çîn', all_signs: 'Hemû nîşanên trafîkê A-Z', search_signs: 'Nîşanan bigere...'
    },
    ez: {
      dashboard: 'Destpêk', learn: 'Fêr bibe', exam: 'Azmûn', signs: 'Nîşan', videos: 'Vîdyo', theory: 'Teorî', settings: 'Mîheng',
      start: 'Dest pê bike', questions: 'Pirs', back: 'Veger', next: 'Pêşve', ai_explain: 'Ji AI bipirse', pass: 'DERBAS BÛ', fail: 'DERBAS NE BÛ',
      select_count: 'Hejmara pirsan hilbijêre', lang: 'Ziman', exam_start: 'Azmûnê dest pê bike', auto_next: 'Xweber Pêşve',
      auto_next_desc: 'Xweber here pirsa din', sound_fx: 'Deng', sound_fx_desc: 'Dengê rast/çewt',
      reset_stats: 'Statîstîkan Paqij Bike', reset_stats_desc: 'Hemû pêşkeftinê paqij dike', about: 'Derbarê App',
      version: 'Guhertî', speak: 'Bixwîne', close: 'Bigre', listen_question: 'Pirsê bixwîne', listen_options: 'Bersivan bixwîne',
      listen_explanation: 'Ravekirinê bixwîne', listen_sign: 'Nîşanê bixwîne', listen_video: 'Agahdariya vîdyoyê bixwîne',
      select_class: 'Çîna ehliyetê hilbijêre', class: 'Çîn', all_signs: 'Hemû nîşanên trafîkê A-Z', search_signs: 'Nîşanan bigere...'
    },
    ar: {
      dashboard: 'لوحة القيادة', learn: 'تعلم', exam: 'امتحان', signs: 'علامات', videos: 'فيديوهات', theory: 'نظرية', settings: 'إعدادات',
      start: 'ابدأ', questions: 'أسئلة', back: 'رجوع', next: 'التالي', ai_explain: 'اسأل الذكاء الاصطناعي', pass: 'ناجح', fail: 'راسب',
      select_count: 'حدد عدد الأسئلة', lang: 'اللغة', exam_start: 'ابدأ الامتحان', auto_next: 'التالي التلقائي',
      auto_next_desc: 'الانتقال تلقائيا للسؤال التالي', sound_fx: 'المؤثرات الصوتية', sound_fx_desc: 'أصوات صحيحة/خاطئة',
      reset_stats: 'إعادة تعيين الإحصائيات', reset_stats_desc: 'حذف كل التقدم المحفوظ', about: 'حول التطبيق',
      version: 'إصدار', speak: 'قراءة', close: 'إغلاق', listen_question: 'استمع للسؤال', listen_options: 'استمع للخيارات',
      listen_explanation: 'استمع للشرح', listen_sign: 'استمع للعلامة', listen_video: 'استمع لمعلومات الفيديو',
      select_class: 'اختر فئة القيادة', class: 'فئة', all_signs: 'جميع علامات المرور A-Z', search_signs: 'ابحث عن العلامات...'
    },
    fa: {
      dashboard: 'داشبورد', learn: 'یادگیری', exam: 'آزمون', signs: 'علائم', videos: 'ویدیوها', theory: 'تئوری', settings: 'تنظیمات',
      start: 'شروع', questions: 'سوالات', back: 'بازگشت', next: 'بعدی', ai_explain: 'پرسیدن از هوش مصنوعی', pass: 'قبول', fail: 'رد شد',
      select_count: 'تعداد سوالات را انتخاب کنید', lang: 'زبان', exam_start: 'شروع آزمون', auto_next: 'بعدی خودکار',
      auto_next_desc: 'رفتن خودکار به بعدی', sound_fx: 'افکت‌های صوتی', sound_fx_desc: 'صداهای درست/غلط',
      reset_stats: 'بازنشانی آمار', reset_stats_desc: 'همه پیشرفت‌ها را پاک می‌کند', about: 'درباره برنامه',
      version: 'نسخه', speak: 'خواندن', close: 'بستن', listen_question: 'گوش دادن به سوال', listen_options: 'گوش دادن به گزینه‌ها',
      listen_explanation: 'گوش دادن به توضیحات', listen_sign: 'گوش دادن به علامت', listen_video: 'گوش دادن به ویدیو',
      select_class: 'کلاس گواهینامه را انتخاب کنید', class: 'کلاس', all_signs: 'همه علائم راهنمایی و رانندگی A-Z', search_signs: 'جستجوی علائم...'
    },
    he: {
      dashboard: 'לוח בקרה', learn: 'ללמוד', exam: 'בחינה', signs: 'שלטים', videos: 'סרטונים', theory: 'תיאוריה', settings: 'הגדרות',
      start: 'התחל', questions: 'שאלות', back: 'חזור', next: 'הבא', ai_explain: 'שאל את ה-AI', pass: 'עבר', fail: 'נכשל',
      select_count: 'בחר את מספר השאלות', lang: 'שפה', exam_start: 'התחל בחינה', auto_next: 'הבא אוטומטי',
      auto_next_desc: 'עבור אוטומטית לשאלה הבאה', sound_fx: 'אפקטי קול', sound_fx_desc: 'צלילים נכון/לא נכון',
      reset_stats: 'אפס סטטיסטיקות', reset_stats_desc: 'מוחק את כל ההתקדמות', about: 'אודות האפליקציה',
      version: 'גרסה', speak: 'הקרא', close: 'סגור', listen_question: 'הקשב לשאלה', listen_options: 'הקשב לאפשרויות',
      listen_explanation: 'הקשב להסבר', listen_sign: 'הקשב לשלט', listen_video: 'הקשב למידע על הסרטון',
      select_class: 'בחר סוג רישיון', class: 'סוג', all_signs: 'כל שלטי התנועה A-Z', search_signs: 'חפש שלטים...'
    },
    la: {
      dashboard: 'Dashboard', learn: 'Discere', exam: 'Examen', signs: 'Signa', videos: 'Videos', theory: 'Theoria', settings: 'Optiones',
      start: 'Incipere', questions: 'Quaestiones', back: 'Retro', next: 'Porro', ai_explain: 'Interroga AI', pass: 'TRANSIIT', fail: 'CECIDIT',
      select_count: 'Elige numerum quaestionum', lang: 'Lingua', exam_start: 'Incipere Examen', auto_next: 'Auto-Porro',
      auto_next_desc: 'Automatice ad sequentem', sound_fx: 'Sonus Effectus', sound_fx_desc: 'Sonus recte/male',
      reset_stats: 'Resettare Statistica', reset_stats_desc: 'Delet omnem progressum', about: 'De App',
      version: 'Versio', speak: 'Legere', close: 'Claudere', listen_question: 'Audire quaestionem', listen_options: 'Audire optiones',
      listen_explanation: 'Audire explicationem', listen_sign: 'Audire signum', listen_video: 'Audire video',
      select_class: 'Elige classemissam', class: 'Classis', all_signs: 'Omnia signa A-Z', search_signs: 'Quaerere signa...'
    },
    uz: {
      dashboard: 'Boshqaruv paneli', learn: "O'rganish", exam: 'Imtihon', signs: 'Belgilar', videos: 'Videolar', theory: 'Nazariya', settings: 'Sozlamalar',
      start: 'Boshlash', questions: 'Savollar', back: 'Orqaga', next: 'Keyingi', ai_explain: "AI dan so'rash", pass: "O'TDI", fail: 'YIQILDI',
      select_count: 'Savollar sonini tanlang', lang: 'Til', exam_start: 'Imtihonni boshlash', auto_next: 'Avto-Keyingi',
      auto_next_desc: 'Avtomatik keyingi savolga', sound_fx: 'Ovoz effektlari', sound_fx_desc: "To'g'ri/xato ovozlari",
      reset_stats: 'Statistikani Tozalash', reset_stats_desc: 'Barcha taraqqiyotni ochiradi', about: 'Ilova haqida',
      version: 'Versiya', speak: "O'qish", close: 'Yopish', listen_question: 'Savolni tinglash', listen_options: 'Variantlarni tinglash',
      listen_explanation: 'Tushuntirishni tinglash', listen_sign: 'Belgini tinglash', listen_video: 'Video maʼlumotlarini tinglash',
      select_class: 'Haydovchilik toifasini tanlang', class: 'Toifa', all_signs: 'Barcha yo\'l belgilari A-Z', search_signs: 'Belgilarni qidirish...'
    },
    ru: {
      dashboard: 'Панель', learn: 'Учиться', exam: 'Экзамен', signs: 'Знаки', videos: 'Видео', theory: 'Теория', settings: 'Настройки',
      start: 'Начать', questions: 'Вопросы', back: 'Назад', next: 'Далее', ai_explain: 'Спросить ИИ', pass: 'СДАНО', fail: 'НЕ СДАНО',
      select_count: 'Выберите количество вопросов', lang: 'Язык', exam_start: 'Начать экзамен', auto_next: 'Авто-Далее',
      auto_next_desc: 'Автоматический переход', sound_fx: 'Звуковые эффекты', sound_fx_desc: 'Звуки верно/неверно',
      reset_stats: 'Сбросить Статистику', reset_stats_desc: 'Удаляет весь прогресс', about: 'О приложении',
      version: 'Версия', speak: 'Читать', close: 'Закрыть', listen_question: 'Слушать вопрос', listen_options: 'Слушать варианты',
      listen_explanation: 'Слушать объяснение', listen_sign: 'Слушать знак', listen_video: 'Слушать видео',
      select_class: 'Выберите класс вождения', class: 'Класс', all_signs: 'Все знаки A-Z', search_signs: 'Поиск знаков...'
    },
    pl: {
      dashboard: 'Pulpit', learn: 'Ucz się', exam: 'Egzamin', signs: 'Znaki', videos: 'Filmy', theory: 'Teoria', settings: 'Ustawienia',
      start: 'Start', questions: 'Pytania', back: 'Wstecz', next: 'Dalej', ai_explain: 'Zapytaj AI', pass: 'ZDANE', fail: 'NIEZDANE',
      select_count: 'Wybierz liczbę pytań', lang: 'Język', exam_start: 'Rozpocznij egzamin', auto_next: 'Auto-Następne',
      auto_next_desc: 'Automatycznie przejdź dalej', sound_fx: 'Efekty dźwiękowe', sound_fx_desc: 'Dźwięki poprawnie/błędnie',
      reset_stats: 'Resetuj Statystyki', reset_stats_desc: 'Usuwa cały postęp', about: 'O aplikacji',
      version: 'Wersja', speak: 'Czytaj', close: 'Zamknij', listen_question: 'Słuchaj pytania', listen_options: 'Słuchaj opcji',
      listen_explanation: 'Słuchaj wyjaśnienia', listen_sign: 'Słuchaj znaku', listen_video: 'Słuchaj wideo',
      select_class: 'Wybierz kategorię prawa jazdy', class: 'Kategoria', all_signs: 'Wszystkie znaki A-Z', search_signs: 'Szukaj znaków...'
    },
    ro: {
      dashboard: 'Panou', learn: 'Învață', exam: 'Examen', signs: 'Indicatoare', videos: 'Videoclipuri', theory: 'Teorie', settings: 'Setări',
      start: 'Start', questions: 'Întrebări', back: 'Înapoi', next: 'Următor', ai_explain: 'Întreabă AI', pass: 'TRECUT', fail: 'PICAT',
      select_count: 'Selectați numărul de întrebări', lang: 'Limbă', exam_start: 'Începe Examenul', auto_next: 'Auto-Următor',
      auto_next_desc: 'Treci automat la următoarea întrebare', sound_fx: 'Efecte sonore', sound_fx_desc: 'Sunete corect/greșit',
      reset_stats: 'Resetează Statisticile', reset_stats_desc: 'Șterge tot progresul salvat', about: 'Despre App',
      version: 'Versiune', speak: 'Citește', close: 'Închide', listen_question: 'Ascultă întrebarea', listen_options: 'Ascultă opțiunile',
      listen_explanation: 'Ascultă explicația', listen_sign: 'Ascultă semnul', listen_video: 'Ascultă video',
      select_class: 'Selectați categoria permisului', class: 'Categorie', all_signs: 'Toate indicatoarele A-Z', search_signs: 'Caută indicatoare...'
    },
    hr: {
      dashboard: 'Nadzorna ploča', learn: 'Uči', exam: 'Ispit', signs: 'Znakovi', videos: 'Videozapisi', theory: 'Teorija', settings: 'Postavke',
      start: 'Početak', questions: 'Pitanja', back: 'Natrag', next: 'Dalje', ai_explain: 'Pitaj AI', pass: 'POLOŽENO', fail: 'PALO',
      select_count: 'Odaberite broj pitanja', lang: 'Jezik', exam_start: 'Započni Ispit', auto_next: 'Auto-Dalje',
      auto_next_desc: 'Automatski prijeđi na sljedeće pitanje', sound_fx: 'Zvučni efekti', sound_fx_desc: 'Zvukovi točno/netočno',
      reset_stats: 'Resetiraj Statistiku', reset_stats_desc: 'Briše sav spremljeni napredak', about: 'O aplikaciji',
      version: 'Verzija', speak: 'Čitaj', close: 'Zatvori', listen_question: 'Slušaj pitanje', listen_options: 'Slušaj opcije',
      listen_explanation: 'Slušaj objašnjenje', listen_sign: 'Slušaj znak', listen_video: 'Slušaj video',
      select_class: 'Odaberite kategoriju vozačke', class: 'Kategorija', all_signs: 'Svi znakovi A-Z', search_signs: 'Pretraži znakove...'
    },
    pt: {
      dashboard: 'Painel', learn: 'Aprender', exam: 'Exame', signs: 'Sinais', videos: 'Vídeos', theory: 'Teoria', settings: 'Configurações',
      start: 'Iniciar', questions: 'Perguntas', back: 'Voltar', next: 'Próximo', ai_explain: 'Perguntar à IA', pass: 'APROVADO', fail: 'REPROVADO',
      select_count: 'Selecione o número de perguntas', lang: 'Idioma', exam_start: 'Iniciar Exame', auto_next: 'Auto-Próximo',
      auto_next_desc: 'Ir automaticamente para a próxima pergunta', sound_fx: 'Efeitos sonoros', sound_fx_desc: 'Sons correto/errado',
      reset_stats: 'Redefinir Estatísticas', reset_stats_desc: 'Apaga todo o progresso salvo', about: 'Sobre o App',
      version: 'Versão', speak: 'Ler', close: 'Fechar', listen_question: 'Ouvir pergunta', listen_options: 'Ouvir opções',
      listen_explanation: 'Ouvir explicação', listen_sign: 'Ouvir sinal', listen_video: 'Ouvir vídeo',
      select_class: 'Selecione a categoria da carta', class: 'Categoria', all_signs: 'Todos os sinais A-Z', search_signs: 'Pesquisar sinais...'
    },
    fr: {
      dashboard: 'Tableau de bord', learn: 'Apprendre', exam: 'Examen', signs: 'Panneaux', videos: 'Vidéos', theory: 'Théorie', settings: 'Paramètres',
      start: 'Démarrer', questions: 'Questions', back: 'Retour', next: 'Suivant', ai_explain: 'Demander à l\'IA', pass: 'RÉUSSI', fail: 'ÉCHOUÉ',
      select_count: 'Sélectionnez le nombre de questions', lang: 'Langue', exam_start: 'Démarrer l\'examen', auto_next: 'Auto-Suivant',
      auto_next_desc: 'Passer à la question suivante', sound_fx: 'Effets sonores', sound_fx_desc: 'Sons vrai/faux',
      reset_stats: 'Réinitialiser', reset_stats_desc: 'Efface toute la progression', about: 'À propos',
      version: 'Version', speak: 'Lire', close: 'Fermer', listen_question: 'Écouter la question', listen_options: 'Écouter les options',
      listen_explanation: 'Écouter l\'explication', listen_sign: 'Écouter le panneau', listen_video: 'Écouter la vidéo',
      select_class: 'Choisir la catégorie de permis', class: 'Catégorie', all_signs: 'Tous les panneaux A-Z', search_signs: 'Rechercher des panneaux...'
    },
    el: {
      dashboard: 'Πίνακας', learn: 'Μάθηση', exam: 'Εξέταση', signs: 'Σήματα', videos: 'Βίντεο', theory: 'Θεωρία', settings: 'Ρυθμίσεις',
      start: 'Έναρξη', questions: 'Ερωτήσεις', back: 'Πίσω', next: 'Επόμενο', ai_explain: 'Ρώτα AI', pass: 'ΠΕΡΑΣΕ', fail: 'ΑΠΕΤΥΧΕ',
      select_count: 'Επιλέξτε αριθμό ερωτήσεων', lang: 'Γλώσσα', exam_start: 'Έναρξη Εξέτασης', auto_next: 'Αυτόματο-Επόμενο',
      auto_next_desc: 'Αυτόματη μετάβαση στην επόμενη ερώτηση', sound_fx: 'Ηχητικά εφέ', sound_fx_desc: 'Ήχοι σωστού/λάθους',
      reset_stats: 'Επαναφορά Στατιστικών', reset_stats_desc: 'Διαγράφει όλη την πρόοδο', about: 'Σχετικά με την Εφαρμογή',
      version: 'Έκδοση', speak: 'Ανάγνωση', close: 'Κλείσιμο', listen_question: 'Άκουσε την ερώτηση', listen_options: 'Άκουσε τις επιλογές',
      listen_explanation: 'Άκουσε την εξήγηση', listen_sign: 'Άκουσε το σήμα', listen_video: 'Άκουσε το βίντεο',
      select_class: 'Επιλέξτε κατηγορία άδειας', class: 'Κατηγορία', all_signs: 'Όλα τα σήματα A-Z', search_signs: 'Αναζήτηση σημάτων...'
    },
    es: {
      dashboard: 'Panel', learn: 'Aprender', exam: 'Examen', signs: 'Señales', videos: 'Videos', theory: 'Teoría', settings: 'Ajustes',
      start: 'Empezar', questions: 'Preguntas', back: 'Atrás', next: 'Siguiente', ai_explain: 'Preguntar a IA', pass: 'APROBADO', fail: 'SUSPENDIDO',
      select_count: 'Selecciona el número de preguntas', lang: 'Idioma', exam_start: 'Iniciar Examen', auto_next: 'Auto-Siguiente',
      auto_next_desc: 'Ir a la siguiente pregunta', sound_fx: 'Efectos de sonido', sound_fx_desc: 'Sonidos correcto/incorrecto',
      reset_stats: 'Reiniciar Estadísticas', reset_stats_desc: 'Borra todo el progreso', about: 'Acerca de',
      version: 'Versión', speak: 'Leer', close: 'Cerrar', listen_question: 'Escuchar pregunta', listen_options: 'Escuchar opciones',
      listen_explanation: 'Escuchar explicación', listen_sign: 'Escuchar señal', listen_video: 'Escuchar video',
      select_class: 'Seleccionar clase de conducir', class: 'Clase', all_signs: 'Todas las señales A-Z', search_signs: 'Buscar señales...'
    },
    it: {
      dashboard: 'Pannello', learn: 'Impara', exam: 'Esame', signs: 'Segnali', videos: 'Video', theory: 'Teoria', settings: 'Impostazioni',
      start: 'Inizia', questions: 'Domande', back: 'Indietro', next: 'Avanti', ai_explain: 'Chiedi all\'IA', pass: 'PASSATO', fail: 'BOCCIATO',
      select_count: 'Seleziona il numero di domande', lang: 'Lingua', exam_start: 'Inizia Esame', auto_next: 'Auto-Avanti',
      auto_next_desc: 'Passa automaticamente alla domanda successiva', sound_fx: 'Effetti sonori', sound_fx_desc: 'Suoni corretto/sbagliato',
      reset_stats: 'Ripristina Statistiche', reset_stats_desc: 'Cancella tutti i progressi salvati', about: 'Informazioni sull\'App',
      version: 'Versione', speak: 'Leggi', close: 'Chiudi', listen_question: 'Ascolta domanda', listen_options: 'Ascolta opzioni',
      listen_explanation: 'Ascolta spiegazione', listen_sign: 'Ascolta segnale', listen_video: 'Ascolta video',
      select_class: 'Seleziona categoria patente', class: 'Categoria', all_signs: 'Tutti i segnali A-Z', search_signs: 'Cerca segnali...'
    }
  };

  const LICENSE_CLASSES = [
    { id: 'AM', name: 'Klasse AM (Moped)' },
    { id: 'A', name: 'Klasse A (Motorrad)' },
    { id: 'B', name: 'Klasse B (PKW)' },
    { id: 'C', name: 'Klasse C (LKW)' },
    { id: 'D', name: 'Klasse D (Bus)' },
    { id: 'L', name: 'Klasse L (Landwirtschaft)' },
    { id: 'T', name: 'Klasse T (Traktor)' }
  ];

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
    { id: 25, cat: 'Vorfahrt', q: 'Sie wollen in einen Kreisverkehr einfahren. Wer hat Vorfahrt?', opts: ['Die Fahrzeuge im Kreisverkehr', 'Ich, weil ich von rechts komme', 'Wer schneller ist'], correct: 0, exp: 'Im Kreisverkehr hat der Verkehr im Kreis Vorfahrt.' }
  ];

  // ═══════════════════════════════════════════════════════
  // 2. MASSIVE VERKEHRSZEICHEN DATENBANK (A-Z)
  // ═══════════════════════════════════════════════════════
  const SIGNS = [
    { cat: 'Gefahrzeichen', icon: '⚠️', nr: '101', name: 'Gefahrstelle', desc: 'Allgemeine Gefahr, Geschwindigkeit anpassen.' },
    { cat: 'Gefahrzeichen', icon: '➕', nr: '102', name: 'Kreuzung oder Einmündung', desc: 'Vorfahrt beachten, bremsbereit sein.' },
    { cat: 'Gefahrzeichen', icon: '↩️', nr: '103', name: 'Kurve', desc: 'Gefährliche Kurve, Geschwindigkeit reduzieren.' },
    { cat: 'Gefahrzeichen', icon: '🔀', nr: '105', name: 'Doppelkurve', desc: 'Zwei Kurven hintereinander, stark abbremsen.' },
    { cat: 'Gefahrzeichen', icon: '⬇️', nr: '108', name: 'Gefälle', desc: 'Starkes Gefälle, Motorbremse nutzen.' },
    { cat: 'Gefahrzeichen', icon: '⬆️', nr: '110', name: 'Steigung', desc: 'Starke Steigung, ggf. zurückschalten.' },
    { cat: 'Gefahrzeichen', icon: '🛣️', nr: '112', name: 'Unebene Fahrbahn', desc: 'Schlaglöcher oder Bodenwellen möglich.' },
    { cat: 'Gefahrzeichen', icon: '💨', nr: '114', name: 'Schleuder- oder Rutschgefahr', desc: 'Bei Nässe besonders gefährlich, langsam fahren.' },
    { cat: 'Gefahrzeichen', icon: '🌬️', nr: '117', name: 'Seitenwind', desc: 'Vorsicht bei Brücken und Waldschneisen.' },
    { cat: 'Gefahrzeichen', icon: '↔️', nr: '120', name: 'Verengte Fahrbahn', desc: 'Beide Seiten verengt, Vorfahrt beachten.' },
    { cat: 'Gefahrzeichen', icon: '➡️', nr: '121', name: 'Einseitig verengte Fahrbahn', desc: 'Nur eine Seite verengt, ggf. Vorfahrt gewähren.' },
    { cat: 'Gefahrzeichen', icon: '🚧', nr: '123', name: 'Arbeitsstelle', desc: 'Baustelle, Geschwindigkeit reduzieren.' },
    { cat: 'Gefahrzeichen', icon: '🚗🚗🚗', nr: '124', name: 'Stau', desc: 'Staugefahr, bremsbereit sein.' },
    { cat: 'Gefahrzeichen', icon: '⬅️➡️', nr: '125', name: 'Gegenverkehr', desc: 'Gegenverkehr auf der eigenen Spur, Vorsicht!' },
    { cat: 'Gefahrzeichen', icon: '🚦', nr: '131', name: 'Lichtzeichenanlage', desc: 'Ampel in der Nähe, bremsbereit sein.' },
    { cat: 'Gefahrzeichen', icon: '🚶', nr: '133', name: 'Fußgänger', desc: 'Fußgänger überqueren die Straße.' },
    { cat: 'Gefahrzeichen', icon: '🧒', nr: '136', name: 'Kinder', desc: 'Kinder auf der Straße, bremsbereit sein!' },
    { cat: 'Gefahrzeichen', icon: '🚲', nr: '138', name: 'Radverkehr', desc: 'Radfahrer auf der Fahrbahn.' },
    { cat: 'Gefahrzeichen', icon: '🦌', nr: '142', name: 'Wildwechsel', desc: 'Tiere könnten die Fahrbahn überqueren.' },
    { cat: 'Gefahrzeichen', icon: '🚂', nr: '151', name: 'Bahnübergang', desc: 'Schienenfahrzeuge haben Vorrang.' },
    { cat: 'Gefahrzeichen', icon: '🚂📏', nr: '156', name: 'Bahnübergang mit dreistreifiger Bake', desc: 'Entfernung zum Bahnübergang: 240m.' },
    { cat: 'Gefahrzeichen', icon: '🚂📏', nr: '159', name: 'Zweistreifige Bake', desc: 'Entfernung zum Bahnübergang: 160m.' },
    { cat: 'Gefahrzeichen', icon: '🚂📏', nr: '162', name: 'Einstreifige Bake', desc: 'Entfernung zum Bahnübergang: 80m.' },

    { cat: 'Vorschriftzeichen', icon: '✖️', nr: '201', name: 'Andreaskreuz', desc: 'Schienenverkehr hat Vorrang! Anhalten und warten.' },
    { cat: 'Vorschriftzeichen', icon: '⬇️', nr: '205', name: 'Vorfahrt gewähren', desc: 'Andere Fahrzeuge durchlassen (Spitze unten).' },
    { cat: 'Vorschriftzeichen', icon: '🛑', nr: '206', name: 'Halt! Vorfahrt gewähren', desc: 'Immer anhalten! Dann Vorfahrt gewähren.' },
    { cat: 'Vorschriftzeichen', icon: '⬆️⬇️', nr: '208', name: 'Vorrang des Gegenverkehrs', desc: 'Gegenverkehr hat Vorrang, warten.' },
    { cat: 'Vorschriftzeichen', icon: '➡️', nr: '209', name: 'Vorgeschriebene Fahrtrichtung rechts', desc: 'Man muss rechts abbiegen.' },
    { cat: 'Vorschriftzeichen', icon: '↪️', nr: '211', name: 'Hier rechts', desc: 'Rechts vorbei fahren.' },
    { cat: 'Vorschriftzeichen', icon: '⬆️➡️', nr: '214', name: 'Geradeaus oder rechts', desc: 'Man darf geradeaus oder rechts fahren.' },
    { cat: 'Vorschriftzeichen', icon: '🔄', nr: '215', name: 'Kreisverkehr', desc: 'Vorgeschriebene Fahrtrichtung im Kreis.' },
    { cat: 'Vorschriftzeichen', icon: '➡️', nr: '220', name: 'Einbahnstraße', desc: 'Fahrt nur in Pfeilrichtung erlaubt.' },
    { cat: 'Vorschriftzeichen', icon: '↔️', nr: '222', name: 'Vorbeifahrt rechts oder links', desc: 'Man kann rechts oder links vorbei.' },
    { cat: 'Vorschriftzeichen', icon: '🚏', nr: '224', name: 'Haltestelle', desc: 'Bushaltestelle, Parken verboten.' },
    { cat: 'Vorschriftzeichen', icon: '🚲', nr: '237', name: 'Radweg', desc: 'Nur für Radfahrer (blaues Schild).' },
    { cat: 'Vorschriftzeichen', icon: '🚶', nr: '239', name: 'Gehweg', desc: 'Nur für Fußgänger.' },
    { cat: 'Vorschriftzeichen', icon: '🚶🚲', nr: '240', name: 'Gemeinsamer Geh- und Radweg', desc: 'Fußgänger und Radfahrer teilen sich den Weg.' },
    { cat: 'Vorschriftzeichen', icon: '🚶|🚲', nr: '241', name: 'Getrennter Geh- und Radweg', desc: 'Getrennte Wege für Fußgänger und Radfahrer.' },
    { cat: 'Vorschriftzeichen', icon: '🚶🚫', nr: '242.1', name: 'Beginn einer Fußgängerzone', desc: 'Nur Fußgänger erlaubt, Lieferverkehr frei.' },
    { cat: 'Vorschriftzeichen', icon: '🚶✅', nr: '242.2', name: 'Ende einer Fußgängerzone', desc: 'Ende der Fußgängerzone.' },
    { cat: 'Vorschriftzeichen', icon: '🚲🚫', nr: '244.1', name: 'Beginn einer Fahrradstraße', desc: 'Radfahrer haben Vorrang.' },
    { cat: 'Vorschriftzeichen', icon: '🚲✅', nr: '244.2', name: 'Ende einer Fahrradstraße', desc: 'Ende der Fahrradstraße.' },
    { cat: 'Vorschriftzeichen', icon: '🚲🚫', nr: '244.3', name: 'Beginn einer Fahrradzone', desc: 'Radfahrer haben Vorrang.' },
    { cat: 'Vorschriftzeichen', icon: '🚗🚫', nr: '250', name: 'Verbot für Fahrzeuge aller Art', desc: 'Durchfahrt für alle Fahrzeuge verboten.' },
    { cat: 'Vorschriftzeichen', icon: '🚗🚫', nr: '251', name: 'Verbot für Kraftwagen', desc: 'Verbot für mehrspurige Kraftfahrzeuge.' },
    { cat: 'Vorschriftzeichen', icon: '🚛🚫', nr: '253', name: 'Verbot für Kraftfahrzeuge über 3,5 t', desc: 'LKW-Verbot (Ausnahmen möglich).' },
    { cat: 'Vorschriftzeichen', icon: '🚲🚫', nr: '254', name: 'Verbot für Radverkehr', desc: 'Radfahrer dürfen nicht durch.' },
    { cat: 'Vorschriftzeichen', icon: '🏍️🚫', nr: '255', name: 'Verbot für Krafträder', desc: 'Motorräder dürfen nicht durch.' },
    { cat: 'Vorschriftzeichen', icon: '🚶🚫', nr: '259', name: 'Verbot für Fußgänger', desc: 'Fußgänger dürfen nicht durch.' },
    { cat: 'Vorschriftzeichen', icon: '🚗🚫', nr: '260', name: 'Verbot für Kraftfahrzeuge', desc: 'Kraftfahrzeuge aller Art verboten.' },
    { cat: 'Vorschriftzeichen', icon: '☢️🚫', nr: '261', name: 'Verbot für Gefahrguttransporte', desc: 'Gefahrguttransporte verboten.' },
    { cat: 'Vorschriftzeichen', icon: '⚖️🚫', nr: '262', name: 'Gewichtsgrenze', desc: 'Tatsächliches Gewicht über der Grenze verboten.' },
    { cat: 'Vorschriftzeichen', icon: '⚖️🚫', nr: '263', name: 'Achslastgrenze', desc: 'Tatsächliche Achslast über der Grenze verboten.' },
    { cat: 'Vorschriftzeichen', icon: '📏🚫', nr: '264', name: 'Breitengrenze', desc: 'Tatsächliche Breite über der Grenze verboten.' },
    { cat: 'Vorschriftzeichen', icon: '📏🚫', nr: '265', name: 'Höhengrenze', desc: 'Tatsächliche Höhe über der Grenze verboten.' },
    { cat: 'Vorschriftzeichen', icon: '📏🚫', nr: '266', name: 'Längengrenze', desc: 'Tatsächliche Länge über der Grenze verboten.' },
    { cat: 'Vorschriftzeichen', icon: '⛔', nr: '267', name: 'Verbot der Einfahrt', desc: 'Keine Einfahrt in diese Straße.' },
    { cat: 'Vorschriftzeichen', icon: '⛓️', nr: '268', name: 'Schneeketten vorgeschrieben', desc: 'Nur mit Schneeketten fahren.' },
    { cat: 'Vorschriftzeichen', icon: '🌍', nr: '270.1', name: 'Umweltzone', desc: 'Nur Fahrzeuge mit Plakette erlaubt.' },
    { cat: 'Vorschriftzeichen', icon: '🌍✅', nr: '270.2', name: 'Ende der Umweltzone', desc: 'Ende der Umweltzone.' },
    { cat: 'Vorschriftzeichen', icon: '🔢', nr: '274', name: 'Zulässige Höchstgeschwindigkeit', desc: 'Maximal angegebene km/h erlaubt.' },
    { cat: 'Vorschriftzeichen', icon: '3️⃣0️⃣', nr: '274.1', name: 'Tempo-30-Zone', desc: 'Beginn einer Tempo-30-Zone.' },
    { cat: 'Vorschriftzeichen', icon: '🔢✅', nr: '278', name: 'Ende der Höchstgeschwindigkeit', desc: 'Geschwindigkeitsbegrenzung endet.' },
    { cat: 'Vorschriftzeichen', icon: '✅', nr: '282', name: 'Ende aller Beschränkungen', desc: 'Geschwindigkeit und Überholverbote enden.' },
    { cat: 'Vorschriftzeichen', icon: '🚫', nr: '283', name: 'Absolutes Haltverbot', desc: 'Halten und Parken verboten.' },
    { cat: 'Vorschriftzeichen', icon: '🚫', nr: '286', name: 'Eingeschränktes Haltverbot', desc: 'Halten erlaubt, Parken verboten.' },
    { cat: 'Vorschriftzeichen', icon: '🚫', nr: '290.1', name: 'Haltverbot Zone', desc: 'Beginn eines Haltverbots für eine Zone.' },
    { cat: 'Vorschriftzeichen', icon: '✅', nr: '290.2', name: 'Ende Haltverbot Zone', desc: 'Ende des Haltverbots.' },
    { cat: 'Vorschriftzeichen', icon: '🚶', nr: '293', name: 'Fußgängerüberweg', desc: 'Zebrastreifen, Fußgänger haben Vorrang.' },
    { cat: 'Vorschriftzeichen', icon: '➖', nr: '294', name: 'Haltlinie', desc: 'Hier anhalten bei Rot oder Stop.' },
    { cat: 'Vorschriftzeichen', icon: '➖', nr: '295', name: 'Fahrbahnbegrenzung', desc: 'Markierung am Fahrbahnrand.' },
    { cat: 'Vorschriftzeichen', icon: '➖', nr: '296', name: 'Einseitige Fahrstreifenbegrenzung', desc: 'Trennlinie für Fahrstreifen.' },
    { cat: 'Vorschriftzeichen', icon: '⬆️', nr: '297', name: 'Pfeilmarkierungen', desc: 'Fahrtrichtungsanzeiger auf der Fahrbahn.' },
    { cat: 'Vorschriftzeichen', icon: '⬆️', nr: '297.1', name: 'Vorankündigungspfeil', desc: 'Kündigt Spurwechsel an.' },
    { cat: 'Vorschriftzeichen', icon: '▨', nr: '298', name: 'Sperrfläche', desc: 'Nicht befahrbarer Bereich.' },
    { cat: 'Vorschriftzeichen', icon: '➖', nr: '299', name: 'Grenzmarkierung', desc: 'Markierung für Halt- und Parkverbote.' },

    { cat: 'Richtzeichen', icon: '⬆️', nr: '301', name: 'Vorfahrt', desc: 'Ich habe an der nächsten Kreuzung Vorfahrt.' },
    { cat: 'Richtzeichen', icon: '⬆️', nr: '306', name: 'Vorfahrtstraße', desc: 'Die Straße hat Vorfahrt (gelbe Raute).' },
    { cat: 'Richtzeichen', icon: '✅', nr: '307', name: 'Ende der Vorfahrtstraße', desc: 'Vorfahrt endet an der nächsten Kreuzung.' },
    { cat: 'Richtzeichen', icon: '⬆️', nr: '308', name: 'Vorrang vor dem Gegenverkehr', desc: 'Ich habe Vorrang in der Engstelle.' },
    { cat: 'Richtzeichen', icon: '🏙️', nr: '310', name: 'Ortseingang', desc: 'Beginn einer geschlossenen Ortschaft.' },
    { cat: 'Richtzeichen', icon: '🏙️✅', nr: '311', name: 'Ortsausgang', desc: 'Ende der geschlossenen Ortschaft.' },
    { cat: 'Richtzeichen', icon: '🅿️', nr: '314', name: 'Parken', desc: 'Parken erlaubt.' },
    { cat: 'Richtzeichen', icon: '🅿️', nr: '314.1', name: 'Parkraumbewirtschaftung', desc: 'Beginn einer kostenpflichtigen Parkzone.' },
    { cat: 'Richtzeichen', icon: '🅿️✅', nr: '314.2', name: 'Ende Parkraumbewirtschaftung', desc: 'Ende der Parkzone.' },
    { cat: 'Richtzeichen', icon: '🅿️🚶', nr: '315', name: 'Parken auf Gehwegen', desc: 'Parken auf dem Gehweg erlaubt.' },
    { cat: 'Richtzeichen', icon: '🅿️🚌', nr: '316', name: 'Parken und Reisen', desc: 'Parkplatz für Pendler.' },
    { cat: 'Richtzeichen', icon: '🅿️🥾', nr: '317', name: 'Wanderparkplatz', desc: 'Parkplatz für Wanderer.' },
    { cat: 'Richtzeichen', icon: '🕐', nr: '318', name: 'Parkscheibe', desc: 'Parkscheibe erforderlich.' },
    { cat: 'Richtzeichen', icon: '🏘️', nr: '325.1', name: 'Verkehrsberuhigter Bereich', desc: 'Spielstraße, Schrittgeschwindigkeit.' },
    { cat: 'Richtzeichen', icon: '🏘️✅', nr: '325.2', name: 'Ende verkehrsberuhigter Bereich', desc: 'Ende der Spielstraße.' },
    { cat: 'Richtzeichen', icon: '🛣️', nr: '330.1', name: 'Autobahn', desc: 'Beginn der Autobahn.' },
    { cat: 'Richtzeichen', icon: '🛣️✅', nr: '330.2', name: 'Ende der Autobahn', desc: 'Ende der Autobahn.' },
    { cat: 'Richtzeichen', icon: '🛣️', nr: '331.1', name: 'Kraftfahrstraße', desc: 'Beginn einer Kraftfahrstraße.' },
    { cat: 'Richtzeichen', icon: '🛣️✅', nr: '331.2', name: 'Ende Kraftfahrstraße', desc: 'Ende der Kraftfahrstraße.' },
    { cat: 'Richtzeichen', icon: '🚪', nr: '333', name: 'Autobahnausfahrt', desc: 'Hier verlässt man die Autobahn.' },
    { cat: 'Richtzeichen', icon: '🚶', nr: '350', name: 'Fußgängerüberweg', desc: 'Hinweis auf Zebrastreifen.' },
    { cat: 'Richtzeichen', icon: '💧', nr: '354', name: 'Wasserschutzgebiet', desc: 'Gewässerschutz beachten.' },
    { cat: 'Richtzeichen', icon: '🚦', nr: '356', name: 'Verkehrshelfer', desc: 'Schulweghelfer oder Lotsen.' },
    { cat: 'Richtzeichen', icon: '🚫', nr: '357', name: 'Sackgasse', desc: 'Keine Durchfahrt, aber Wende möglich.' },
    { cat: 'Richtzeichen', icon: '⛑️', nr: '358', name: 'Erste Hilfe', desc: 'Erste-Hilfe-Station oder Arzt.' },
    { cat: 'Richtzeichen', icon: '👮', nr: '363', name: 'Polizei', desc: 'Polizeidienststelle.' },
    { cat: 'Richtzeichen', icon: '📞', nr: '365', name: 'Fernsprecher', desc: 'Öffentliches Telefon.' },
    { cat: 'Richtzeichen', icon: '🆘', nr: '366', name: 'Notrufsäule', desc: 'Notrufsäule für Pannen und Unfälle.' },
    { cat: 'Richtzeichen', icon: '⛽', nr: '367', name: 'Tankstelle', desc: 'Tankstelle in der Nähe.' },
    { cat: 'Richtzeichen', icon: '🏨', nr: '375', name: 'Autobahnhotel', desc: 'Hotel an der Autobahn.' },
    { cat: 'Richtzeichen', icon: '🍔', nr: '376', name: 'Autobahngasthaus', desc: 'Raststätte an der Autobahn.' },
    { cat: 'Richtzeichen', icon: '130', nr: '380', name: 'Richtgeschwindigkeit', desc: 'Empfohlene Geschwindigkeit (130 km/h).' },
    { cat: 'Richtzeichen', icon: 'ℹ️', nr: '385', name: 'Hinweis', desc: 'Hinweis auf Ziele oder Einrichtungen.' },
    { cat: 'Richtzeichen', icon: '🏛️', nr: '386', name: 'Touristische Hinweise', desc: 'Hinweis auf Sehenswürdigkeiten.' },
    { cat: 'Richtzeichen', icon: '💰', nr: '390', name: 'Mautpflicht', desc: 'Mautpflicht für bestimmte Fahrzeuge.' },
    { cat: 'Richtzeichen', icon: '🛃', nr: '392', name: 'Zollstelle', desc: 'Zollkontrolle.' },
    { cat: 'Richtzeichen', icon: 'ℹ️', nr: '393', name: 'Informationstafel', desc: 'Informationen an Grenzübergängen.' },
    { cat: 'Richtzeichen', icon: 'B', nr: '401', name: 'Bundesstraße', desc: 'Nummer der Bundesstraße.' },
    { cat: 'Richtzeichen', icon: 'A', nr: '405', name: 'Autobahnnummer', desc: 'Nummer der Autobahn.' },
    { cat: 'Richtzeichen', icon: '🔗', nr: '406', name: 'Knotenpunkte', desc: 'Autobahnkreuz oder -dreieck.' },
    { cat: 'Richtzeichen', icon: 'ℹ️', nr: '448', name: 'Ankündigungstafel', desc: 'Informationen auf Autobahnen.' },
    { cat: 'Richtzeichen', icon: '➡️', nr: '448.1', name: 'Ausfahrtstafel', desc: 'Kündigt Ausfahrt an.' },
    { cat: 'Richtzeichen', icon: '🗺️', nr: '449', name: 'Vorwegweiser', desc: 'Zeigt Fahrstreifen und Ziele an.' },
    { cat: 'Richtzeichen', icon: '📍', nr: '450', name: 'Ankündigungsbake', desc: 'Markiert die Ausfahrt.' },
    { cat: 'Richtzeichen', icon: '📏', nr: '453', name: 'Entfernungstafel', desc: 'Zeigt Entfernungen zu Zielen.' },
    { cat: 'Richtzeichen', icon: '↩️', nr: '501', name: 'Überleitung', desc: 'Wechsel auf die Gegenfahrbahn.' },
    { cat: 'Richtzeichen', icon: '↔️', nr: '511', name: 'Verschwenkung', desc: 'Fahrbahn verschiebt sich.' },
    { cat: 'Richtzeichen', icon: '🔀', nr: '531', name: 'Zusammenführung', desc: 'Fahrstreifen werden zusammengeführt.' },
    { cat: 'Richtzeichen', icon: '↩️', nr: '590', name: 'Umlenkungspfeil', desc: 'Richtungsänderung.' },

    { cat: 'Verkehrseinrichtungen', icon: '🚧', nr: '600', name: 'Absperrschranke', desc: 'Absperrung des Verkehrs.' },
    { cat: 'Verkehrseinrichtungen', icon: '⚠️', nr: '605', name: 'Leitbake', desc: 'Markiert den Fahrbahnrand.' },
    { cat: 'Verkehrseinrichtungen', icon: '🔶', nr: '610', name: 'Leitkegel', desc: 'Markiert Baustellenbereiche.' },
    { cat: 'Verkehrseinrichtungen', icon: '🚧', nr: '615', name: 'Fahrbare Absperrtafel', desc: 'Absperrung mit Blinklicht.' },
    { cat: 'Verkehrseinrichtungen', icon: '🚧➡️', nr: '616', name: 'Absperrtafel mit Blinkpfeil', desc: 'Weist auf Spurwechsel hin.' },
    { cat: 'Verkehrseinrichtungen', icon: '📍', nr: '620', name: 'Leitpfosten', desc: 'Markieren den Fahrbahnrand nachts.' },
    { cat: 'Verkehrseinrichtungen', icon: '↪️', nr: '625', name: 'Richtungstafel', desc: 'Zeigt Kurvenverlauf an.' },
    { cat: 'Verkehrseinrichtungen', icon: '📋', nr: '626', name: 'Leittafel', desc: 'Führt den Verkehr.' },
    { cat: 'Verkehrseinrichtungen', icon: '↩️', nr: '627', name: 'Umlenkungspfeile', desc: 'Leiten den Verkehr um.' },
    { cat: 'Verkehrseinrichtungen', icon: '💡', nr: '628', name: 'Warnlichtanlage', desc: 'Blinklicht an Gefahrenstellen.' },
    { cat: 'Verkehrseinrichtungen', icon: '🚧', nr: '629', name: 'Warnbaken', desc: 'Absperreinrichtungen.' },

    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Anlieger frei', desc: 'Nur Anwohner dürfen passieren.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Radfahrer frei', desc: 'Radfahrer dürfen trotz Verbot passieren.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Lieferverkehr frei', desc: 'Lieferanten dürfen passieren.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Bei Nässe', desc: 'Gilt nur bei nasser Fahrbahn.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Zeitliche Beschränkung', desc: 'Gilt nur zu bestimmten Zeiten.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Entfernungsangabe', desc: 'Gilt in X Metern.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Parkscheibe', desc: 'Parkscheibe erforderlich.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Elektrofahrzeuge frei', desc: 'E-Autos dürfen passieren.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Schwerbehinderte', desc: 'Mit Ausweis erlaubt.' },
    { cat: 'Zusatzzeichen', icon: 'ℹ️', nr: '—', name: 'Umleitung', desc: 'Zeigt Umleitungsstrecke an.' }
  ];

  const VIDEOS = [
    { title: 'Grundlagen der Vorfahrt', dur: '12:30', cat: 'Grundwissen', desc: 'In diesem Video lernst du die grundlegenden Vorfahrtregeln: Rechts vor Links, Vorfahrtstraße und wie du dich an Kreuzungen verhältst.' },
    { title: 'Autobahn: Auffahrt & Rettungsgasse', dur: '08:45', cat: 'Autobahn', desc: 'Alles über das sichere Auffahren auf die Autobahn, das Bilden einer Rettungsgasse und das richtige Verhalten bei Stau.' },
    { title: 'Richtig Einparken (Längs & Quer)', dur: '15:20', cat: 'Praktisch', desc: 'Schritt-für-Schritt-Anleitung für das Längs- und Querparken. Mit Tipps für enge Parklücken und das richtige Lenken.' },
    { title: 'Verhalten bei Panne & Unfall', dur: '10:15', cat: 'Grundwissen', desc: 'Was tun, wenn das Auto liegen bleibt? Warnblinker, Warndreieck, Warnweste und der Notruf 112.' },
    { title: 'Kreisverkehr meistern', dur: '05:30', cat: 'Praktisch', desc: 'So fährst du sicher in den Kreisverkehr ein und wieder heraus. Vorfahrt und Blinken richtig gemacht.' },
    { title: 'Erste Hilfe am Unfallort', dur: '18:00', cat: 'Erste Hilfe', desc: 'Die wichtigsten Maßnahmen: Absichern, Notruf, stabile Seitenlage und Herzdruckmassage.' }
  ];

  let state = {
    lang: 'de',
    stats: { examsTaken: 0, examsPassed: 0, questionsAnswered: 0, correctAnswers: 0 },
    currentView: 'dashboard',
    settings: { autoNext: false, soundFx: true, ttsEnabled: true },
    exam: null,
    learnIndex: 0,
    learnList: [],
    selectedClass: 'B',
    signSearchQuery: ''
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
        if (parsed.selectedClass) state.selectedClass = parsed.selectedClass;
      }
    } catch (e) { }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stats: state.stats,
        lang: state.lang,
        settings: state.settings,
        selectedClass: state.selectedClass
      }));
    } catch (e) { }
  }

  function t(key) { return (LANG[state.lang] && LANG[state.lang][key]) || LANG['de'][key] || key; }

  function css() {
    return `<style>
      .fs-app { font-family: 'Inter', system-ui, sans-serif; color: #e8e8ec; background: #0a0a0f; height: 100%; display: flex; flex-direction: row; overflow: hidden; }
      .fs-sidebar { width: 260px; background: rgba(17,17,24,0.95); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; padding: 20px 0; flex-shrink: 0; }
      .fs-logo { font-size: 20px; font-weight: 900; color: #00e5ff; padding: 0 20px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 15px; }
      .fs-logo span { font-size: 10px; background: rgba(0,229,255,0.1); padding: 3px 6px; border-radius: 4px; color: #00e5ff; }
      .fs-nav-item { padding: 12px 20px; display: flex; align-items: center; gap: 12px; color: #a8b0cc; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; border-left: 3px solid transparent; margin-bottom: 2px; }
      .fs-nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
      .fs-nav-item.active { background: rgba(0,229,255,0.08); color: #00e5ff; border-left-color: #00e5ff; }
      .fs-nav-item .icon { font-size: 18px; width: 24px; text-align: center; }
      .fs-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .fs-header { padding: 20px 30px; background: rgba(10,10,15,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; z-index: 10; }
      .fs-header h1 { margin: 0; font-size: 22px; font-weight: 900; color: #fff; }
      .fs-content-area { flex: 1; overflow-y: auto; padding: 30px; }
      .fs-content-inner { max-width: 900px; margin: 0 auto; }
      .fs-card { background: rgba(20, 20, 28, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .fs-card h2 { margin-top: 0; font-size: 20px; color: #fff; margin-bottom: 15px; font-weight: 900; }
      .fs-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; font-family: inherit; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; }
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
      .fs-video-card { position: relative; border-radius: 12px; overflow: hidden; background: #000; aspect-ratio: 16/9; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
      .fs-video-card:hover .fs-play-btn { transform: scale(1.1); background: #00e5ff; color: #000; }
      .fs-play-btn { width: 60px; height: 60px; background: rgba(0,229,255,0.2); border: 2px solid #00e5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #00e5ff; transition: all 0.2s; backdrop-filter: blur(5px); }
      .fs-video-title { position: absolute; bottom: 0; left: 0; right: 0; padding: 15px; background: linear-gradient(transparent, rgba(0,0,0,0.9)); color: #fff; font-weight: bold; font-size: 14px; }
      .fs-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 9999999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
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
          
          <div style="display:flex; justify-content:center; margin-bottom:20px;">
            <select class="fs-select" data-action="set-class" style="text-align:center;">
              ${LICENSE_CLASSES.map(c => `<option value="${c.id}" ${state.selectedClass === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

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
            <div style="display:flex; gap:10px;">
              <button class="fs-btn" data-action="tts-question" style="padding:6px 12px; font-size:12px;">🔊 ${t('listen_question')}</button>
              <button class="fs-btn" data-action="tts-options" style="padding:6px 12px; font-size:12px;">🔊 ${t('listen_options')}</button>
            </div>
          </div>
          <h2 style="font-size: 24px; line-height: 1.4;">${q.q}</h2>
          <div style="margin-top: 30px;" id="fs-opt-container">${optHtml}</div>
          <div class="fs-exp" id="fs-explain">
            <div style="display:flex; justify-content:space-between; align-items:start; gap:20px;">
              <div>${q.exp}</div>
              <button class="fs-btn" data-action="tts-explanation" style="background: rgba(0,229,255,0.1); border-color: #00e5ff; color: #00e5ff; flex-shrink:0;">🔊 ${t('listen_explanation')}</button>
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
    let html = `<div class="fs-content-inner">
      <div class="fs-card" style="padding:15px;">
        <input type="text" class="fs-select" style="max-width:100%;" placeholder="${t('search_signs')}" data-action="search-signs" value="${state.signSearchQuery}">
      </div>`;
      
    const filtered = SIGNS.filter(s => 
      s.name.toLowerCase().includes(state.signSearchQuery.toLowerCase()) || 
      s.nr.toLowerCase().includes(state.signSearchQuery.toLowerCase())
    );

    const categories = {};
    filtered.forEach(s => {
      if (!categories[s.cat]) categories[s.cat] = [];
      categories[s.cat].push(s);
    });

    Object.keys(categories).forEach(cat => {
      html += `<div class="fs-signs-cat"><h3>${cat}</h3><div class="fs-signs-grid">`;
      categories[cat].forEach(s => {
        html += `<div class="fs-sign-item" data-action="click-sign" data-name="${s.name}" data-desc="Nr. ${s.nr}: ${s.desc}" data-icon="${s.icon}">
          <div class="fs-sign-icon">${s.icon}</div>
          <div class="fs-sign-name">${s.nr} ${s.name}</div>
          <div class="fs-sign-desc">${s.desc}</div>
        </div>`;
      });
      html += `</div></div>`;
    });
    
    if (filtered.length === 0) {
      html += `<div style="text-align:center; color:#888; padding:50px;">Keine Schilder gefunden.</div>`;
    }
    
    html += `</div>`;
    return html;
  }

  function renderVideos() {
    let html = `<div class="fs-content-inner"><div class="fs-card"><h2>🎬 Lernvideos</h2><div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">`;
    VIDEOS.forEach((v, i) => {
      html += `<div class="fs-video-card" data-action="play-video" data-idx="${i}">
        <div class="fs-play-btn">▶</div>
        <div class="fs-video-title">${v.title} <br><span style="font-size:12px; color:#00e5ff;">${v.cat}</span><span style="float:right; color:#888; font-weight:normal;">${v.dur}</span></div>
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
              <option value="ar" ${state.lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="fa" ${state.lang === 'fa' ? 'selected' : ''}>فارسی</option>
              <option value="he" ${state.lang === 'he' ? 'selected' : ''}>עברית</option>
              <option value="la" ${state.lang === 'la' ? 'selected' : ''}>Lingua Latina</option>
              <option value="uz" ${state.lang === 'uz' ? 'selected' : ''}>O'zbekcha</option>
              <option value="ru" ${state.lang === 'ru' ? 'selected' : ''}>Русский</option>
              <option value="pl" ${state.lang === 'pl' ? 'selected' : ''}>Polski</option>
              <option value="ro" ${state.lang === 'ro' ? 'selected' : ''}>Română</option>
              <option value="hr" ${state.lang === 'hr' ? 'selected' : ''}>Hrvatski</option>
              <option value="pt" ${state.lang === 'pt' ? 'selected' : ''}>Português</option>
              <option value="fr" ${state.lang === 'fr' ? 'selected' : ''}>Français</option>
              <option value="el" ${state.lang === 'el' ? 'selected' : ''}>Ελληνικά</option>
              <option value="es" ${state.lang === 'es' ? 'selected' : ''}>Español</option>
              <option value="it" ${state.lang === 'it' ? 'selected' : ''}>Italiano</option>
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
            <div class="fs-setting-info"><h4>TTS (Vorlesen)</h4><p>Sprachausgabe für Fragen & Schilder</p></div>
            <div class="fs-toggle ${state.settings.ttsEnabled ? 'on' : ''}" data-action="toggle-setting" data-key="ttsEnabled"></div>
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
    else if (state.currentView === 'settings') viewHtml = renderSettings();

    return css() + `
      <div class="fs-app">
        <div class="fs-sidebar">
          <div class="fs-logo">🚦 HalDo Fahrschule <span>PRO MAX</span></div>
          <div class="fs-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-action="view-dashboard"><span class="icon">🏠</span> ${t('dashboard')}</div>
          <div class="fs-nav-item ${state.currentView === 'learn-setup' || state.currentView === 'learn' ? 'active' : ''}" data-action="view-learn-setup"><span class="icon">📖</span> ${t('learn')}</div>
          <div class="fs-nav-item ${state.currentView === 'exam-setup' || state.currentView === 'exam' ? 'active' : ''}" data-action="view-exam"><span class="icon">🏁</span> ${t('exam')}</div>
          <div class="fs-nav-item ${state.currentView === 'signs' ? 'active' : ''}" data-action="view-signs"><span class="icon">🛑</span> ${t('signs')}</div>
          <div class="fs-nav-item ${state.currentView === 'videos' ? 'active' : ''}" data-action="view-videos"><span class="icon">🎬</span> ${t('videos')}</div>
          <div style="flex:1;"></div>
          <div class="fs-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> ${t('settings')}</div>
        </div>
        <div class="fs-main">
          <div class="fs-header">
            <h1>${state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'learn' || state.currentView === 'learn-setup' ? t('learn') : state.currentView === 'exam' || state.currentView === 'exam-setup' ? t('exam') : state.currentView === 'signs' ? t('signs') : state.currentView === 'videos' ? t('videos') : t('settings')}</h1>
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
            <button class="fs-btn" id="fs-sign-tts-btn" style="background: rgba(0,229,255,0.1); border-color: #00e5ff; color: #00e5ff;">🔊 ${t('listen_sign')}</button>
            <button class="fs-btn primary" id="fs-sign-ai-btn">🤖 ${t('ai_explain')}</button>
          </div>
          <button class="fs-btn ghost" style="width:100%;" onclick="document.getElementById('fs-sign-modal').classList.remove('show')">${t('close')}</button>
        </div>
      </div>

      <div class="fs-modal-overlay" id="fs-video-modal">
        <div class="fs-modal">
          <div style="font-size:60px; margin-bottom:10px;">🎬</div>
          <h3 id="fs-video-title">Video</h3>
          <p id="fs-video-desc">Beschreibung...</p>
          <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
            <button class="fs-btn" id="fs-video-tts-btn" style="background: rgba(0,229,255,0.1); border-color: #00e5ff; color: #00e5ff;">🔊 ${t('listen_video')}</button>
            <button class="fs-btn primary" id="fs-video-play-btn">▶ Video abspielen</button>
          </div>
          <button class="fs-btn ghost" style="width:100%;" onclick="document.getElementById('fs-video-modal').classList.remove('show')">${t('close')}</button>
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
    if (!state.settings.ttsEnabled) return;
    if (!window.speechSynthesis) { alert('Sprachausgabe nicht unterstützt.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { 
      de: 'de-DE', en: 'en-US', tr: 'tr-TR', ku: 'ku-TR', ckb: 'ckb-IQ', gorani: 'ku-TR', ez: 'ku-TR',
      ar: 'ar-SA', fa: 'fa-IR', he: 'he-IL', la: 'la-VA', uz: 'uz-UZ', ru: 'ru-RU', pl: 'pl-PL',
      ro: 'ro-RO', hr: 'hr-HR', pt: 'pt-PT', fr: 'fr-FR', el: 'el-GR', es: 'es-ES', it: 'it-IT'
    };
    u.lang = langMap[state.lang] || 'de-DE';
    u.rate = 0.9;
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
    if (action === 'view-settings') { state.currentView = 'settings'; updateView(); return; }

    if (action === 'start-exam') { startExam(parseInt(btn.dataset.count)); return; }
    if (action === 'start-learn') { startLearn(parseInt(btn.dataset.count)); return; }

    if (action === 'tts-question') { speakText(state.learnList[state.learnIndex].q); return; }
    if (action === 'tts-options') { speakText(state.learnList[state.learnIndex].opts.join('. ')); return; }
    if (action === 'tts-explanation') { speakText(state.learnList[state.learnIndex].exp); return; }

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

    if (action === 'ask-ai') { askAI(state.learnList[state.learnIndex].q + " " + state.learnList[state.learnIndex].exp); return; }
    if (action === 'toggle-setting') { state.settings[btn.dataset.key] = !state.settings[btn.dataset.key]; saveState(); updateView(); return; }
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

    if (action === 'play-video') {
      const idx = parseInt(btn.dataset.idx);
      const v = VIDEOS[idx];
      document.getElementById('fs-video-title').textContent = v.title;
      document.getElementById('fs-video-desc').textContent = v.desc;
      
      document.getElementById('fs-video-tts-btn').onclick = () => speakText(`${v.title}. ${v.desc}`);
      document.getElementById('fs-video-play-btn').onclick = () => alert('Video-Player wird gestartet (Simulation).');
      document.getElementById('fs-video-modal').classList.add('show');
      return;
    }
  }

  function handleChange(e) {
    if (e.target.dataset.action === 'set-lang') { state.lang = e.target.value; saveState(); updateView(); }
    if (e.target.dataset.action === 'set-class') { state.selectedClass = e.target.value; saveState(); }
  }

  function handleInput(e) {
    if (e.target.dataset.action === 'search-signs') {
      state.signSearchQuery = e.target.value;
      const main = currentTarget.querySelector('#fs-main-content');
      if (main) main.innerHTML = renderSigns();
      // Fokus behalten
      const input = main.querySelector('[data-action="search-signs"]');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }
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
          <div class="fs-nav-item ${state.currentView === 'videos' ? 'active' : ''}" data-action="view-videos"><span class="icon">🎬</span> ${t('videos')}</div>
          <div style="flex:1;"></div>
          <div class="fs-nav-item ${state.currentView === 'settings' ? 'active' : ''}" data-action="view-settings"><span class="icon">⚙️</span> ${t('settings')}</div>
        `;
    }
    
    if (headerTitle) {
        headerTitle.textContent = state.currentView === 'dashboard' ? t('dashboard') : state.currentView === 'learn' || state.currentView === 'learn-setup' ? t('learn') : state.currentView === 'exam' || state.currentView === 'exam-setup' ? t('exam') : state.currentView === 'signs' ? t('signs') : state.currentView === 'videos' ? t('videos') : t('settings');
    }
  }

  function mount(target) {
    if (target && target.nodeType === 1) {
      currentTarget = target;
      currentTarget.innerHTML = renderMain();
      currentTarget.addEventListener('click', handleClick);
      currentTarget.addEventListener('change', handleChange);
      currentTarget.addEventListener('input', handleInput);
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

  console.log('🚦 fahrschule.js v' + VERSION + ' geladen — ULTIMATE GLOBAL (Alle Klassen, Alle Schilder A-Z, TTS)');
})();
