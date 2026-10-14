/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — EZIDI APP (v150)
   Phrasen · Alphabet · Mushaf · Engel · Qewl · Geschichte
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var PHRASES = [
    {cat:"🟢 Gruß",de:"Hallo",ez:"Silav",rom:"si-law"},
    {cat:"🟢 Gruß",de:"Guten Morgen",ez:"Beyanî baş",rom:"be-ja-ni basch"},
    {cat:"🟢 Gruß",de:"Guten Abend",ez:"Êvar baş",rom:"e-war basch"},
    {cat:"🟢 Gruß",de:"Gute Nacht",ez:"Şev baş",rom:"schew basch"},
    {cat:"🟢 Gruß",de:"Danke",ez:"Spas",rom:"spas"},
    {cat:"🟢 Gruß",de:"Willkommen",ez:"Bi xêr hatî",rom:"bi cher ha-ti"},
    {cat:"🟢 Gruß",de:"Ich bin Ezidi",ez:"Ez êzidî me",rom:"es e-si-di me"},
    {cat:"🟢 Gruß",de:"Auf Wiedersehen",ez:"Xatirê te",rom:"cha-ti-re te"},
    {cat:"🟢 Gruß",de:"Ja",ez:"Erê",rom:"e-re"},
    {cat:"🟢 Gruß",de:"Nein",ez:"Na",rom:"na"},
    {cat:"🦚 Religion",de:"Pfauengel",ez:"Tawûsî Melek",rom:"ta-wu-si me-lek"},
    {cat:"🦚 Religion",de:"Gott",ez:"Xwedê",rom:"chwe-de"},
    {cat:"🦚 Religion",de:"Gebet",ez:"Dûʻa",rom:"du-a"},
    {cat:"🦚 Religion",de:"Fasten",ez:"Rojî",rom:"ro-schi"},
    {cat:"🦚 Religion",de:"Wallfahrt",ez:"Ziyaret",rom:"si-ja-ret"},
    {cat:"🦚 Religion",de:"Schwarzes Buch",ez:"Mushaf Reş",rom:"mus-haf resch"},
    {cat:"🦚 Religion",de:"Heiliger Ort",ez:"Laliş",rom:"la-lisch"},
    {cat:"🦚 Religion",de:"Engel",ez:"Melek",rom:"me-lek"},
    {cat:"🟨 Kultur",de:"Familie",ez:"Malbat",rom:"mal-bat"},
    {cat:"🟨 Kultur",de:"Mutter",ez:"Dayik",rom:"da-jik"},
    {cat:"🟨 Kultur",de:"Vater",ez:"Bav",rom:"baw"},
    {cat:"🟨 Kultur",de:"Bruder",ez:"Bira",rom:"bi-ra"},
    {cat:"🟨 Kultur",de:"Freund",ez:"Heval",rom:"he-val"},
    {cat:"🟨 Kultur",de:"Liebe",ez:"Evîn",rom:"e-win"},
    {cat:"🟨 Kultur",de:"Ich liebe dich",ez:"Ez te hez dikim",rom:"es te hes di-kim"},
    {cat:"🌍 Natur",de:"Sonne",ez:"Roj",rom:"rosch"},
    {cat:"🌍 Natur",de:"Mond",ez:"Heyv",rom:"hew"},
    {cat:"🌍 Natur",de:"Wasser",ez:"Av",rom:"aw"},
    {cat:"🌍 Natur",de:"Feuer",ez:"Agir",rom:"a-gir"},
    {cat:"🌍 Natur",de:"Berg",ez:"Çiya",rom:"tschi-ja"},
    {cat:"🔢 Zahlen",de:"eins",ez:"yek",rom:"jek"},
    {cat:"🔢 Zahlen",de:"zwei",ez:"didu",rom:"di-du"},
    {cat:"🔢 Zahlen",de:"drei",ez:"sê",rom:"se"},
    {cat:"🔢 Zahlen",de:"vier",ez:"çar",rom:"tschar"},
    {cat:"🔢 Zahlen",de:"fünf",ez:"pênc",rom:"pendsch"},
    {cat:"🔢 Zahlen",de:"zehn",ez:"deh",rom:"deh"}
  ];

  var ALPHA = ["A","B","C","Ç","D","E","Ê","F","G","H","I","Î","J","K","L","M","N","O","P","Q","R","S","Ş","T","U","Û","V","W","X","Y","Z"];

  var ENGEL = [
    {day:"Sonntag",name:"Anzazîl / Izrâîl",ez:"Tawûsî Melek",task:"Oberster aller Engel. Pfauengel.",emoji:"🦚"},
    {day:"Montag",name:"Dardâel",ez:"Şêx Hesen",task:"Hüter der Kranken.",emoji:"💚"},
    {day:"Dienstag",name:"Israfel",ez:"Şêx Şems",task:"Sonne und Licht.",emoji:"☀️"},
    {day:"Mittwoch",name:"Mîkâîl",ez:"Şêx Abû Bekr",task:"Versorgung, Fülle.",emoji:"🌟"},
    {day:"Donnerstag",name:"Azrâel",ez:"Sajad-ad-Dîn",task:"Seelen.",emoji:"🕊️"},
    {day:"Freitag",name:"Şemnâel",ez:"Nasir-ad-Dîn",task:"Gerechtigkeit.",emoji:"⚖️"},
    {day:"Samstag",name:"Nûrâel",ez:"Yadin",task:"Schuf Mensch und Tier.",emoji:"🌍"}
  ];

  var MUSHAF = [
    {n:"Mushaf Reş",d:"Das Schwarze Buch",desc:"Heilige Schrift. Erschaffung der Weißen Perle, Vogel Angar, 7 Engel."},
    {n:"Kitêba Cilwe",d:"Buch der Offenbarung",desc:"Zweite heilige Schrift. Kosmologische Lehren."},
    {n:"Qewls",d:"Heilige Hymnen",desc:"Über 100 Hymnen. Zentrales Wissen."},
    {n:"Tawûsî Melek",d:"Der Pfauengel",desc:"Oberster von 7 Engeln. NICHT der Teufel."},
    {n:"Laliş",d:"Heiliges Tal",desc:"Hauptheiligtum. Grab von Sheikh Adi († 1162)."},
    {n:"Çarşema Sor",d:"Rotes Mittwochsfest",desc:"Neujahrsfest im April."},
    {n:"72 Genozide",d:"Verfolgung",desc:"72 Verfolgungen. Jüngster 2014 Sindschar."}
  ];

  var QEWLS = [
    {n:"Qewlê Bê Elîf",d:"Hymne von B und A",txt:"Die erste Hymne. Anfang der Schöpfung."},
    {n:"Qewlê Mezin",d:"Große Hymne",txt:"Schöpfungsgeschichte und Wesen Gottes."},
    {n:"Dûʻa Mirazê",d:"Gebet der Wünsche",txt:"Gebet für Bitten an Gott."},
    {n:"Sabah-Gebet",d:"Morgengebet",txt:"Vor Sonnenaufgang, Blick zur Sonne."},
    {n:"Êvar-Gebet",d:"Abendgebet",txt:"Nach Sonnenuntergang."}
  ];

  var HIST = [
    {y:"10000 v. Chr.",n:"Göbekli Tepe",d:"Ältester Tempel der Welt in Anatolien."},
    {y:"4000 v. Chr.",n:"Sumerer",d:"Erfanden Schrift, Rad, erste Städte."},
    {y:"3000 v. Chr.",n:"Elamiter",d:"Altes Volk in Südwest-Iran."},
    {y:"2300 v. Chr.",n:"Akkader",d:"Erstes semitisches Großreich unter Sargon."},
    {y:"1800 v. Chr.",n:"Babylonier",d:"Hammurapi — erste Gesetzessammlung."},
    {y:"1300 v. Chr.",n:"Assyrer",d:"Nordmesopotamien. Ninive."},
    {y:"700 v. Chr.",n:"Meder (Med)",d:"Vorfahren der Kurden und Eziden."},
    {y:"600 v. Chr.",n:"Perser",d:"Achämeniden: Kyros, Dareios."},
    {y:"300 v. Chr.",n:"Arya",d:"Indo-iranisch aus Zentralasien."},
    {y:"1000 n. Chr.",n:"Sheikh Adi",d:"Reformator der ezidischen Religion."},
    {y:"1915-18",n:"Völkermord (72.)",d:"Osmanisches Reich."},
    {y:"2014",n:"Sindschar",d:"ISIS-Genozid an den Eziden."},
    {y:"Heute",n:"Diaspora",d:"Größte in Deutschland (~200.000)."}
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "phrase");
    var searchQ = "";

    function build(){
      var body = "";

      if(tab === "phrase"){
        var f = PHRASES;
        if(searchQ){
          var q = searchQ.toLowerCase();
          f = PHRASES.filter(function(p){
            return p.de.toLowerCase().indexOf(q) >= 0 || p.ez.toLowerCase().indexOf(q) >= 0;
          });
        }
        var cats = {};
        f.forEach(function(p){ (cats[p.cat] = cats[p.cat] || []).push(p); });

        body = '<div class="card"><h3>🔍 Suche</h3>'
          + '<input type="text" id="ezSearch" placeholder="Deutsch oder Ezidi..." value="' + _esc(searchQ) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px;text-align:center">' + f.length + ' von ' + PHRASES.length + '</div>'
          + '</div>';
        Object.keys(cats).forEach(function(cat){
          body += '<div class="card"><h3>' + _esc(cat) + '</h3>';
          cats[cat].forEach(function(p){
            body += '<div data-ez="' + _esc(p.ez) + '" style="padding:10px 12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:5px;border-left:3px solid var(--p1);cursor:pointer">'
              + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">🇩🇪 ' + _esc(p.de) + '</div>'
              + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:3px">🦚 ' + _esc(p.ez) + '</div>'
              + (p.rom ? '<div style="font-size:10px;color:var(--text-dim)">[' + _esc(p.rom) + '] · 🔊</div>' : '')
              + '</div>';
          });
          body += '</div>';
        });
      } else if(tab === "alpha"){
        body = '<div class="card"><h3>🔤 Ezidi Alphabet (31 Buchstaben)</h3>'
          + '<div class="alpha-grid">'
          + ALPHA.map(function(l){
              return '<div class="alpha-cell" data-ez="' + l + '"><div class="ch">' + l + '</div></div>';
            }).join("")
          + '</div></div>';
      } else if(tab === "mushaf"){
        body = '<div class="card"><h3>🦚 Mushaf Reş</h3>'
          + '<div style="font-size:11.5px;line-height:1.7;color:var(--text-dim);padding:10px;background:rgba(216,180,120,.08);border-radius:10px;margin-bottom:12px;border-left:3px solid #d8b478">'
          + '<b style="color:#e8ca9a">Schöpfung:</b> Gott erschuf die <b>Weiße Perle</b>, den Vogel <b>Angar</b>. Nach 40.000 Jahren erschuf er <b>Tawûsî Melek</b>.'
          + '</div>'
          + MUSHAF.map(function(m){
              return '<div class="ez-timeline" style="border-left-color:var(--p3)">'
                + '<div class="n" style="color:var(--p3)">' + _esc(m.n) + '</div>'
                + '<div class="y">' + _esc(m.d) + '</div>'
                + '<div class="d">' + _esc(m.desc) + '</div>'
                + '</div>';
            }).join("")
          + '</div>';
      } else if(tab === "engel"){
        body = '<div class="card"><h3>👼 Die 7 Engel</h3>'
          + ENGEL.map(function(e){
              return '<div class="ez-engel">'
                + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">'
                + '<span style="font-size:28px">' + e.emoji + '</span>'
                + '<div><div class="n">' + _esc(e.ez) + '</div>'
                + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(e.day) + '</div></div></div>'
                + '<div class="sub">📛 ' + _esc(e.name) + '</div>'
                + '<div class="d">' + _esc(e.task) + '</div>'
                + '</div>';
            }).join("")
          + '</div>';
      } else if(tab === "qewl"){
        body = '<div class="card"><h3>🕊️ Qewl & Gebete</h3>'
          + QEWLS.map(function(q){
              return '<div class="ez-qewl">'
                + '<div class="t">' + _esc(q.n) + '</div>'
                + '<div class="tr">' + _esc(q.d) + '</div>'
                + '<div class="txt">' + _esc(q.txt) + '</div>'
                + '</div>';
            }).join("")
          + '</div>';
      } else if(tab === "geschichte"){
        body = '<div class="card"><h3>🏛️ Geschichte</h3>'
          + HIST.map(function(h){
              return '<div class="ez-timeline">'
                + '<div class="y">📅 ' + _esc(h.y) + '</div>'
                + '<div class="n">' + _esc(h.n) + '</div>'
                + '<div class="d">' + _esc(h.d) + '</div>'
                + '</div>';
            }).join("")
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="phrase"?" active":"") + '" data-ezt="phrase">📖 Phrasen</button>'
        + '<button class="tab' + (tab==="alpha"?" active":"") + '" data-ezt="alpha">🔤 Alphabet</button>'
        + '<button class="tab' + (tab==="mushaf"?" active":"") + '" data-ezt="mushaf">🦚 Mushaf</button>'
        + '<button class="tab' + (tab==="engel"?" active":"") + '" data-ezt="engel">👼 Engel</button>'
        + '<button class="tab' + (tab==="qewl"?" active":"") + '" data-ezt="qewl">🕊️ Qewl</button>'
        + '<button class="tab' + (tab==="geschichte"?" active":"") + '" data-ezt="geschichte">🏛️ Geschichte</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-ezt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.ezt;
          store.set("tab", tab);
          build();
        });
      });
      container.querySelectorAll("[data-ez]").forEach(function(b){
        b.addEventListener("click", function(){
          if(window.HalDo.Voice) HalDo.Voice.speak(b.dataset.ez);
        });
      });
      var s = container.querySelector("#ezSearch");
      if(s) s.addEventListener("input", function(){ searchQ = this.value; build(); });
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("ezidi", { render: render });
  else console.warn("ezidi.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 ezidi.js geladen");
