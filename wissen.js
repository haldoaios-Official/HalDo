/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WISSEN APP (v150)
   13 Themen mit Suchfunktion + Kategorien
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var THEMEN = {
    physik: { icon:"⚛️", name:"Physik", color:"#4da8ff", items:[
      {t:"Newtonsche Gesetze", d:"1. Trägheit: Ein Körper bleibt in Ruhe oder gleichförmiger Bewegung, wenn keine Kraft wirkt. 2. F = m · a. 3. Actio = Reactio."},
      {t:"Relativitätstheorie", d:"Einstein: E = mc². Raum und Zeit sind relativ. Lichtgeschwindigkeit ist konstant (~300.000 km/s)."},
      {t:"Quantenmechanik", d:"Teilchen haben Welleneigenschaften. Heisenbergsche Unschärferelation. Schrödingers Katze."},
      {t:"Thermodynamik", d:"Energie wird nicht erzeugt/vernichtet, nur umgewandelt. Entropie nimmt zu."},
      {t:"Elektromagnetismus", d:"Maxwell-Gleichungen. Licht ist elektromagnetische Welle."},
      {t:"Gravitation", d:"Massen ziehen sich an: F = G · m₁ · m₂ / r². G = 6,67·10⁻¹¹ m³/(kg·s²)."},
      {t:"Schwarze Löcher", d:"Masse kollabiert zu einem Punkt. Nichts entkommt, nicht mal Licht."},
      {t:"Lichtgeschwindigkeit", d:"c ≈ 299.792.458 m/s. Höchstgeschwindigkeit im Universum."}
    ]},
    chemie: { icon:"🧪", name:"Chemie", color:"#4ade80", items:[
      {t:"Periodensystem", d:"118 Elemente. Geordnet nach Ordnungszahl und Eigenschaften. Gruppen und Perioden."},
      {t:"Atomaufbau", d:"Kern (Protonen + Neutronen) + Elektronen in Schalen. Atomradius ~10⁻¹⁰ m."},
      {t:"Chemische Bindung", d:"Ionen-, kovalente und metallische Bindungen. Atomare Anziehungskräfte."},
      {t:"Säuren & Basen", d:"pH-Skala 0-14. Sauer: H⁺-Ionen. Basisch: OH⁻-Ionen. Neutral: pH 7."},
      {t:"Organische Chemie", d:"Kohlenstoffverbindungen. Kohlenwasserstoffe, Alkohole, Fette, Proteine, DNA."},
      {t:"Redoxreaktionen", d:"Elektronenübertragung. Oxidation = Abgabe. Reduktion = Aufnahme."},
      {t:"Katalysatoren", d:"Beschleunigen Reaktionen, ohne verbraucht zu werden. Wichtig in Industrie."}
    ]},
    bio: { icon:"🧬", name:"Biologie", color:"#22c55e", items:[
      {t:"Zelle", d:"Grundbaustein des Lebens. Zellkern, Mitochondrien, Ribosomen, Zellmembran."},
      {t:"DNA", d:"Doppelhelix. 4 Basen: A-T, G-C. Erbinformation aller Lebewesen."},
      {t:"Evolution", d:"Darwin: natürliche Selektion. Anpassung an Umwelt über Generationen."},
      {t:"Photosynthese", d:"Pflanzen: Licht + CO₂ + H₂O → Zucker + O₂. In Chloroplasten."},
      {t:"Ökosysteme", d:"Wechselwirkung zwischen Lebewesen und Umwelt. Nahrungsketten, Nischen."},
      {t:"Menschlicher Körper", d:"11 Organsysteme. Herz, Lunge, Gehirn, Leber, Nieren, Haut."},
      {t:"Immunsystem", d:"Abwehr gegen Krankheitserreger. Antikörper, T-Zellen, B-Zellen."}
    ]},
    geschichte: { icon:"🏛️", name:"Geschichte", color:"#a855f7", items:[
      {t:"Antike", d:"Ägypten, Griechenland, Rom. Erste Hochkulturen, Demokratie, Rechtsordnungen."},
      {t:"Mittelalter", d:"Feudalismus, Kreuzzüge, Pest 1347, Städtegründungen, Hanse."},
      {t:"Renaissance", d:"Wiedergeburt der Antike. Leonardo da Vinci, Michelangelo, Galilei."},
      {t:"Industrielle Revolution", d:"18./19. Jh. Dampfmaschine, Fabriken, Eisenbahn, Urbanisierung."},
      {t:"Weltkriege", d:"1914-18 & 1939-45. Millionen Tote. Holocaust. Atombombe."},
      {t:"Kalter Krieg", d:"1945-91. USA vs UdSSR. Mauerfall 1989. Deutsche Wiedervereinigung."},
      {t:"Mesopotamien", d:"Sumerer, Akkader, Assyrer, Babylonier. Erste Hochkultur der Menschheit."}
    ]},
    geo: { icon:"🌍", name:"Geografie", color:"#4a8fd8", items:[
      {t:"Kontinente", d:"7: Afrika, Asien, Europa, Nord-/Südamerika, Antarktis, Australien."},
      {t:"Klimazonen", d:"Tropen, Subtropen, gemäßigt, polar. Abhängig von Breitengrad."},
      {t:"Erdplatten", d:"Tektonische Platten. Erdbeben, Vulkane, Gebirge entstehen an Grenzen."},
      {t:"Ozeane", d:"5: Pazifik (größter), Atlantik, Indischer, Arktis, Antarktis."},
      {t:"Flüsse", d:"Nil (6650 km), Amazonas (6400 km), Jangtse (6300 km), Mississippi."},
      {t:"Wüsten", d:"Sahara (größte heiße), Antarktis (größte kalte), Gobi, Atacama."},
      {t:"Hauptstädte", d:"Berlin, Paris, London, Rom, Moskau, Peking, Tokio, Washington."}
    ]},
    astro: { icon:"🔭", name:"Astronomie", color:"#b478ff", items:[
      {t:"Sonnensystem", d:"Sonne + 8 Planeten: Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun."},
      {t:"Sterne", d:"Riesige Gaskugeln. Kernfusion. Lebensdauer Mio–Mrd Jahre."},
      {t:"Galaxien", d:"Milchstraße: ~200 Mrd Sterne. Andromeda: nächste große Galaxie."},
      {t:"Urknall", d:"Vor ~13,8 Mrd Jahren entstand das Universum aus einem heißen Punkt."},
      {t:"Schwarze Löcher", d:"Extrem starke Gravitation. Ereignishorizont. Nichts entkommt."},
      {t:"Exoplaneten", d:"Über 5000 bekannte Planeten um andere Sterne. Suche nach Leben."},
      {t:"Raumfahrt", d:"Sputnik 1957, Gagarin 1961, Apollo 11 1969, ISS seit 1998."}
    ]},
    technik: { icon:"💻", name:"Technik", color:"#00e5ff", items:[
      {t:"Computer", d:"CPU, RAM, Festplatte, GPU. Binärsystem 0/1. Moore's Law."},
      {t:"Internet", d:"TCP/IP, DNS, HTTP. WWW 1989 von Tim Berners-Lee erfunden."},
      {t:"Programmierung", d:"Sprachen: Python, JavaScript, C++, Java, Rust. Algorithmen, Datenstrukturen."},
      {t:"Künstliche Intelligenz", d:"Machine Learning, Neuronale Netze, Deep Learning, LLMs."},
      {t:"Blockchain", d:"Dezentrales Kassenbuch. Bitcoin 2009 von Satoshi Nakamoto."},
      {t:"Robotik", d:"Sensoren, Aktoren, Steuerung. Industrie 4.0, autonome Fahrzeuge."},
      {t:"Erneuerbare Energien", d:"Solar, Wind, Wasser, Geothermie, Biomasse."}
    ]},
    medizin: { icon:"🩺", name:"Medizin", color:"#ef4444", items:[
      {t:"Herz-Kreislauf", d:"Herz pumpt Blut durch Arterien und Venen. ~100.000 Schläge/Tag."},
      {t:"Immunsystem", d:"Weiße Blutkörperchen, Antikörper. Impfungen trainieren das System."},
      {t:"Ernährung", d:"Kohlenhydrate, Proteine, Fette, Vitamine, Mineralstoffe. Ausgewogen wichtig."},
      {t:"Krankheiten", d:"Infektionen, Krebs, Diabetes, Herzinfarkt, Schlaganfall. Früherkennung."},
      {t:"Erste Hilfe", d:"Stabile Seitenlage, Herzdruckmassage, 112 anrufen. Nichts falsch machen."},
      {t:"Medikamente", d:"Antibiotika, Schmerzmittel, Impfstoffe, Antidepressiva. Nur mit Arzt."},
      {t:"Vorsorge", d:"Bewegung, gesunde Ernährung, nicht rauchen, wenig Alkohol, Schlaf."}
    ]},
    psy: { icon:"🧠", name:"Psychologie", color:"#ec4899", items:[
      {t:"Persönlichkeit", d:"Big Five: Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus."},
      {t:"Lernen", d:"Klassisch (Pawlow), operant (Skinner), sozial (Bandura). Wiederholung."},
      {t:"Gedächtnis", d:"Kurzzeit- und Langzeitgedächtnis. Wiederholung stärkt Verbindungen."},
      {t:"Emotionen", d:"Basisemotionen: Freude, Trauer, Angst, Wut, Überraschung, Ekel."},
      {t:"Kognitive Verzerrungen", d:"Bestätigungsfehler, Ankereffekt, Verfügbarkeitsheuristik."},
      {t:"Motivation", d:"Intrinsisch (von innen) vs extrinsisch (Belohnung von außen)."},
      {t:"Schlaf", d:"7-9 Stunden. REM-Phase wichtig für Gedächtnis und Emotionen."}
    ]},
    phil: { icon:"💭", name:"Philosophie", color:"#d8b478", items:[
      {t:"Sokrates", d:"'Ich weiß, dass ich nichts weiß.' Fragen statt Antworten. Maieutik."},
      {t:"Platon", d:"Ideenlehre. Höhlengleichnis. Seele unsterblich."},
      {t:"Aristoteles", d:"Logik, Ethik, Metaphysik. Tugend als Mitte. Lehrer Alexanders."},
      {t:"Descartes", d:"'Cogito ergo sum' — Ich denke, also bin ich. Zweifel als Methode."},
      {t:"Kant", d:"Kategorischer Imperativ. Handle so, dass dein Handeln allgemein gelten könnte."},
      {t:"Nietzsche", d:"'Gott ist tot.' Übermensch. Wille zur Macht. Nihilismus."},
      {t:"Existenzialismus", d:"Sartre, Camus: Der Mensch ist zur Freiheit verurteilt. Verantwortung."}
    ]},
    wirtschaft: { icon:"📈", name:"Wirtschaft", color:"#f59e0b", items:[
      {t:"Angebot & Nachfrage", d:"Preis bildet sich am Markt. Knappheit erhöht Preis."},
      {t:"Inflation", d:"Geldwertverlust. Ziel der EZB: 2% pro Jahr."},
      {t:"BIP", d:"Bruttoinlandsprodukt. Wert aller Güter/Dienstleistungen eines Landes."},
      {t:"Aktien", d:"Anteil an Firma. Börse: DAX, S&P 500, Nikkei."},
      {t:"Steuern", d:"Einkommen-, Mehrwert-, Gewerbe-, Körperschaftsteuer."},
      {t:"Zinsen", d:"Preis für geliehenes Geld. Leitzins der Zentralbank."},
      {t:"Wirtschaftssysteme", d:"Kapitalismus, Sozialismus, soziale Marktwirtschaft."}
    ]},
    kunst: { icon:"🎨", name:"Kunst", color:"#fb923c", items:[
      {t:"Antike", d:"Griechische Statuen, römische Mosaike. Ideal der Schönheit."},
      {t:"Renaissance", d:"Leonardo, Michelangelo, Raffael. Perspektive, Realismus."},
      {t:"Barock", d:"Rembrandt, Rubens. Dramatisches Licht, Bewegung, Emotion."},
      {t:"Impressionismus", d:"Monet, Renoir. Lichteinfall, flüchtige Momente."},
      {t:"Moderne", d:"Picasso (Kubismus), Kandinsky (Abstrakt), Dalí (Surrealismus)."},
      {t:"Pop Art", d:"Warhol, Lichtenstein. Massenkultur als Kunst."},
      {t:"Zeitgenössisch", d:"Banksy, Installationen, Digitale Kunst, NFTs."}
    ]},
    musik: { icon:"🎵", name:"Musik", color:"#c084fc", items:[
      {t:"Noten", d:"7 Töne: C-D-E-F-G-A-H. Oktaven verdoppeln Frequenz."},
      {t:"Instrumente", d:"Saiten, Bläser, Tasten, Schlagzeug, Elektronisch."},
      {t:"Klassik", d:"Bach, Mozart, Beethoven, Brahms. 1600-1900."},
      {t:"Jazz", d:"Louis Armstrong, Miles Davis. Improvisation, Swing."},
      {t:"Rock", d:"Elvis, Beatles, Rolling Stones, Queen. Ab 1950er."},
      {t:"Elektronisch", d:"Kraftwerk, Daft Punk, Techno. Synthesizer, Drumcomputer."},
      {t:"Weltmusik", d:"Kurdisch, Arabisch, Indisch, Afrikanisch. Unterschiedliche Skalen."}
    ]}
  };

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "physik");
    var searchQ = store.get("search", "");

    function build(){
      var body = "";

      if(searchQ){
        /* Globale Suche über alle Themen */
        var q = searchQ.toLowerCase();
        var allResults = [];
        Object.keys(THEMEN).forEach(function(key){
          var th = THEMEN[key];
          th.items.forEach(function(item){
            if(item.t.toLowerCase().indexOf(q) >= 0 || item.d.toLowerCase().indexOf(q) >= 0){
              allResults.push({ thema: th.name, icon: th.icon, color: th.color, t: item.t, d: item.d });
            }
          });
        });

        body = '<div class="card"><h3>🔍 Suche</h3>'
          + '<input type="text" id="wSearch" placeholder="Thema suchen…" value="' + _esc(searchQ) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px;text-align:center">' + allResults.length + ' Treffer</div>'
          + '</div>';

        if(!allResults.length){
          body += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:50px">🔍</div><div style="color:var(--text-mute);margin-top:10px">Keine Treffer</div></div>';
        } else {
          allResults.forEach(function(r){
            body += '<div class="card" style="border-left:3px solid ' + r.color + '">'
              + '<h3 style="color:' + r.color + '">' + r.icon + ' ' + _esc(r.thema) + '</h3>'
              + '<div class="ez-timeline" style="border-left-color:' + r.color + '">'
              + '<div class="n" style="color:' + r.color + '">' + _esc(r.t) + '</div>'
              + '<div class="d">' + _esc(r.d) + '</div>'
              + '</div></div>';
          });
        }

      } else {
        var th = THEMEN[tab];
        if(!th){ tab = "physik"; th = THEMEN[tab]; }

        body = '<div class="card"><h3>🔍 Suche</h3>'
          + '<input type="text" id="wSearch" placeholder="Thema suchen…" value="">'
          + '</div>';

        body += '<div class="card" style="border-left:4px solid ' + th.color + '">'
          + '<h3 style="color:' + th.color + '">' + th.icon + ' ' + _esc(th.name) + '</h3>';

        th.items.forEach(function(item){
          body += '<div class="ez-timeline" style="border-left-color:' + th.color + '">'
            + '<div class="n" style="color:' + th.color + '">' + _esc(item.t) + '</div>'
            + '<div class="d">' + _esc(item.d) + '</div>'
            + '</div>';
        });

        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + Object.keys(THEMEN).map(function(k){
            var t = THEMEN[k];
            return '<button class="tab' + (tab===k && !searchQ ? " active" : "") + '" data-wst="' + k + '" style="' + (tab===k && !searchQ ? "border-color:" + t.color + ";" : "") + '">'
              + t.icon + ' ' + _esc(t.name)
              + '</button>';
          }).join("")
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-wst]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.wst;
          searchQ = "";
          store.set("tab", tab);
          store.set("search", "");
          build();
        });
      });

      var s = container.querySelector("#wSearch");
      if(s){
        s.addEventListener("input", function(){
          searchQ = this.value;
          store.set("search", searchQ);
          build();
          /* Cursor im Suchfeld halten */
          setTimeout(function(){
            var ns = container.querySelector("#wSearch");
            if(ns){
              ns.focus();
              ns.setSelectionRange(searchQ.length, searchQ.length);
            }
          }, 0);
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("wissen", { render: render });
  else console.warn("wissen.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 wissen.js geladen");
