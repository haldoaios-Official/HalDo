/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LANGUAGE LAYER (v150)
   Sprachen · Übersetzungen · RTL · Locale
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Language = (function(){
  "use strict";

  /* ─────────── Verfügbare Sprachen ─────────── */
  var LANGS = {
    de: { name: "Deutsch",  flag: "🇩🇪", rtl: false, code: "de-DE" },
    ku: { name: "Kurdî",    flag: "🟨", rtl: false, code: "tr-TR" },
    ez: { name: "Êzidî",    flag: "🦚", rtl: false, code: "tr-TR" },
    ar: { name: "العربية",  flag: "🇸🇦", rtl: true,  code: "ar-SA" },
    tr: { name: "Türkçe",   flag: "🇹🇷", rtl: false, code: "tr-TR" },
    en: { name: "English",  flag: "🇬🇧", rtl: false, code: "en-US" },
    fa: { name: "فارسی",    flag: "🇮🇷", rtl: true,  code: "fa-IR" },
    ru: { name: "Русский",  flag: "🇷🇺", rtl: false, code: "ru-RU" },
    fr: { name: "Français", flag: "🇫🇷", rtl: false, code: "fr-FR" },
    es: { name: "Español",  flag: "🇪🇸", rtl: false, code: "es-ES" }
  };

  /* ─────────── Übersetzungs-Wörterbuch ─────────── */
  var STRINGS = {
    de: {
      app: "App", apps: "Apps", settings: "Einstellungen", voice: "Stimme",
      search: "Suchen", save: "Speichern", cancel: "Abbrechen", delete: "Löschen",
      add: "Hinzufügen", close: "Schließen", open: "Öffnen", back: "Zurück",
      loading: "Lädt…", ready: "Bereit", error: "Fehler", welcome: "Willkommen",
      name: "Name", amount: "Betrag", date: "Datum", category: "Kategorie",
      copy: "Kopieren", copied: "Kopiert", yes: "Ja", no: "Nein"
    },
    en: {
      app: "App", apps: "Apps", settings: "Settings", voice: "Voice",
      search: "Search", save: "Save", cancel: "Cancel", delete: "Delete",
      add: "Add", close: "Close", open: "Open", back: "Back",
      loading: "Loading…", ready: "Ready", error: "Error", welcome: "Welcome",
      name: "Name", amount: "Amount", date: "Date", category: "Category",
      copy: "Copy", copied: "Copied", yes: "Yes", no: "No"
    },
    ku: {
      app: "App", apps: "Apps", settings: "Mîheng", voice: "Deng",
      search: "Lêgerîn", save: "Tomarkirin", cancel: "Betal", delete: "Jêbirin",
      add: "Zêdekirin", close: "Girtin", open: "Vekirin", back: "Paşve",
      loading: "Tê barkirin…", ready: "Amade", error: "Şaşî", welcome: "Bi xêr hatî",
      name: "Nav", amount: "Biha", date: "Dîrok", category: "Kategorî",
      copy: "Kopî", copied: "Kopî bû", yes: "Erê", no: "Na"
    },
    ez: {
      app: "App", apps: "Apps", settings: "Mîheng", voice: "Deng",
      search: "Lêgerîn", save: "Tomar", cancel: "Betal", delete: "Jêbirin",
      add: "Zêde", close: "Girtin", open: "Vekirin", back: "Paşve",
      loading: "Tê barkirin…", ready: "Amade", error: "Şaşî", welcome: "Bi xêr hatî",
      name: "Nav", amount: "Biha", date: "Dîrok", category: "Kategorî",
      copy: "Kopî", copied: "Kopî bû", yes: "Erê", no: "Na"
    },
    ar: {
      app: "تطبيق", apps: "تطبيقات", settings: "إعدادات", voice: "صوت",
      search: "بحث", save: "حفظ", cancel: "إلغاء", delete: "حذف",
      add: "إضافة", close: "إغلاق", open: "فتح", back: "رجوع",
      loading: "جاري التحميل…", ready: "جاهز", error: "خطأ", welcome: "مرحبا",
      name: "الاسم", amount: "المبلغ", date: "التاريخ", category: "الفئة",
      copy: "نسخ", copied: "تم النسخ", yes: "نعم", no: "لا"
    },
    tr: {
      app: "Uygulama", apps: "Uygulamalar", settings: "Ayarlar", voice: "Ses",
      search: "Ara", save: "Kaydet", cancel: "İptal", delete: "Sil",
      add: "Ekle", close: "Kapat", open: "Aç", back: "Geri",
      loading: "Yükleniyor…", ready: "Hazır", error: "Hata", welcome: "Hoş geldin",
      name: "İsim", amount: "Miktar", date: "Tarih", category: "Kategori",
      copy: "Kopyala", copied: "Kopyalandı", yes: "Evet", no: "Hayır"
    }
  };

  /* ─────────── Aktueller Zustand ─────────── */
  var _current = "de";

  /* ─────────── Übersetzen ─────────── */
  function t(key, lang){
    var l = lang || _current;
    var pack = STRINGS[l] || STRINGS.de;
    return pack[key] || STRINGS.de[key] || key;
  }

  /* ─────────── Setzen ─────────── */
  function set(lang){
    if(!LANGS[lang]) return false;
    _current = lang;
    window.HalDo.Config.set("lang", lang);
    apply();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Sprache: " + LANGS[lang].name);
    return true;
  }

  function current(){
    return _current;
  }

  /* ─────────── Anwenden ─────────── */
  function apply(){
    var lang = LANGS[_current];
    if(!lang) return;
    document.documentElement.lang = _current;
    document.body.setAttribute("dir", lang.rtl ? "rtl" : "ltr");
    document.body.setAttribute("data-lang", _current);
  }

  function isRTL(){
    return LANGS[_current] ? LANGS[_current].rtl : false;
  }

  function dir(){
    return isRTL() ? "rtl" : "ltr";
  }

  function localeCode(){
    return LANGS[_current] ? LANGS[_current].code : "de-DE";
  }

  /* ─────────── Liste ─────────── */
  function list(){
    return Object.keys(LANGS).map(function(k){
      return { id: k, name: LANGS[k].name, flag: LANGS[k].flag, rtl: LANGS[k].rtl };
    });
  }

  /* ─────────── Panel ─────────── */
  function openPanel(){
    var modal = document.getElementById("settings");
    if(!modal) return;
    /* wird über Settings-Dialog gesteuert */
  }

  /* ─────────── Übersetzer (MyMemory) ─────────── */
  function translate(text, from, to){
    if(!text) return Promise.resolve("");
    var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=" + from + "|" + to;
    return fetch(url).then(function(r){ return r.json(); }).then(function(d){
      if(d.responseData && d.responseData.translatedText){
        return d.responseData.translatedText;
      }
      throw new Error("Keine Übersetzung");
    });
  }

  /* ─────────── Init ─────────── */
  function init(){
    var cfg = window.HalDo.Config.get();
    _current = cfg.lang || "de";
    apply();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Language Layer bereit (" + Object.keys(LANGS).length + " Sprachen)");
  }

  return {
    LANGS: LANGS,
    STRINGS: STRINGS,
    init: init,
    set: set,
    current: current,
    t: t,
    apply: apply,
    isRTL: isRTL,
    dir: dir,
    localeCode: localeCode,
    list: list,
    translate: translate
  };
})();

console.log("🦚 language.js geladen");
