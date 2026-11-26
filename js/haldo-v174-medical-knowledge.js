/* ================================================================
   HALDO AI OS PRO MAX — v174 Medical Knowledge Catalogues
   HalDo Krankheitslexikon Pro + HalDo Medikamentenlexikon Pro
   Curated educational starter catalogue with official source links.
   Not for diagnosis, self-treatment, prescribing or dosage decisions.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo;
  var BUILD = '174.0.0';
  if (!H || !H.Registry || !Array.isArray(H.Registry.featured) || H.__haldoV174Knowledge) return;
  H.__haldoV174Knowledge = true;

  var REVIEWED = '2026-11-26';
  var diseases = [
    {
      id: 'bluthochdruck',
      title: 'Bluthochdruck (Hypertonie)',
      category: 'Herz und Kreislauf',
      aliases: ['Hypertonie', 'erhöhter Blutdruck'],
      summary: 'Dauerhaft erhöhte Blutdruckwerte können Gefäße und Organe belasten. Bluthochdruck verursacht häufig lange keine spürbaren Beschwerden.',
      signs: [
        'Häufig keine eindeutigen Beschwerden',
        'Einzelne Messwerte können schwanken; die Einordnung erfolgt nicht anhand eines einzelnen App-Eintrags'
      ],
      checks: [
        'Wiederholte Blutdruckmessungen zur Bestätigung',
        'Je nach Situation eine Langzeitmessung über 24 Stunden',
        'Ärztliche Beurteilung weiterer Risikofaktoren und möglicher Organauswirkungen'
      ],
      context: 'Die Behandlung richtet sich nach der individuellen gesundheitlichen Situation und ärztlichen Beurteilung. Lebensstil, Begleiterkrankungen und gegebenenfalls Arzneimittel können berücksichtigt werden. Diese App legt keine persönlichen Zielwerte fest.',
      sources: [
        { name: 'gesund.bund.de – Bluthochdruck', url: 'https://gesund.bund.de/bluthochdruck', publisher: 'Bundesministerium für Gesundheit' }
      ]
    },
    {
      id: 'diabetes-typ-2',
      title: 'Diabetes mellitus Typ 2',
      category: 'Stoffwechsel',
      aliases: ['Typ-2-Diabetes', 'Zuckerkrankheit'],
      summary: 'Bei Typ-2-Diabetes reagieren Körperzellen zunehmend schlechter auf Insulin. Dadurch kann der Blutzucker dauerhaft erhöht sein.',
      signs: [
        'Zu Beginn mitunter keine wahrnehmbaren Beschwerden',
        'Mögliche Beschwerden sind starker Durst, häufiges Wasserlassen, Müdigkeit oder Schwindel'
      ],
      checks: [
        'Ärztliches Gespräch und körperliche Untersuchung',
        'Blutzuckermessungen und Laboruntersuchungen',
        'Der HbA1c-Wert kann den durchschnittlichen Blutzucker der zurückliegenden etwa zwei bis drei Monate abbilden'
      ],
      context: 'Welche Maßnahmen sinnvoll sind, hängt unter anderem von Begleiterkrankungen, Lebenssituation und persönlichen Zielen ab. Änderungen des Lebensstils und gegebenenfalls Medikamente werden individuell mit medizinischem Fachpersonal geplant.',
      sources: [
        { name: 'gesund.bund.de – Diabetes Typ 2', url: 'https://gesund.bund.de/diabetes-typ-2', publisher: 'Bundesministerium für Gesundheit' }
      ]
    },
    {
      id: 'asthma',
      title: 'Asthma',
      category: 'Atemwege',
      aliases: ['Asthma bronchiale'],
      summary: 'Asthma ist eine Erkrankung mit zeitweise oder dauerhaft verengten Atemwegen. Beschwerden können anfallsartig auftreten.',
      signs: [
        'Atemnot oder Kurzatmigkeit',
        'Pfeifende oder brummende Atmung',
        'Husten, Hustenreiz oder Engegefühl in der Brust'
      ],
      checks: [
        'Ausführliches Gespräch zur Krankengeschichte und zu Beschwerden',
        'Körperliche Untersuchung',
        'Lungenfunktionstests, zum Beispiel Spirometrie oder Peak-Flow-Messung',
        'Je nach Befund weitere Atemwegs- oder Allergieuntersuchungen'
      ],
      context: 'Asthma kann unterschiedliche Auslöser und Verläufe haben. Die Behandlung wird individuell festgelegt. Bei schwerer oder plötzlich zunehmender Atemnot ist umgehend medizinische Hilfe erforderlich.',
      sources: [
        { name: 'gesund.bund.de – Asthma', url: 'https://gesund.bund.de/asthma', publisher: 'Bundesministerium für Gesundheit' }
      ]
    },
    {
      id: 'migraene',
      title: 'Migräne',
      category: 'Nervensystem',
      aliases: ['Migräne mit Aura', 'Migräne ohne Aura'],
      summary: 'Migräne kann sich durch wiederkehrende, starke, häufig einseitige und pulsierende Kopfschmerzen äußern. Übelkeit und Licht- oder Geräuschempfindlichkeit können hinzukommen.',
      signs: [
        'Häufig einseitiger, pulsierender oder pochender Kopfschmerz',
        'Übelkeit und gegebenenfalls Erbrechen',
        'Bei manchen Betroffenen vorübergehende Aura-Erscheinungen, zum Beispiel Lichtblitze oder Sehstörungen'
      ],
      checks: [
        'Gezieltes ärztliches Gespräch zu Art, Verlauf und Begleitsymptomen',
        'Körperliche Untersuchung',
        'Weitere Untersuchungen wie eine MRT können bei unklaren Befunden medizinisch erwogen werden'
      ],
      context: 'Migräne ist individuell verschieden. Ein Kopfschmerztagebuch kann helfen, Verlauf und mögliche Auslöser zu dokumentieren. Maßnahmen und mögliche Medikamente zur Akutbehandlung oder Vorbeugung werden ärztlich abgestimmt.',
      sources: [
        { name: 'gesund.bund.de – Migräne', url: 'https://gesund.bund.de/migraene', publisher: 'Bundesministerium für Gesundheit' }
      ]
    }
  ];

  var medications = [
    {
      id: 'ibuprofen',
      title: 'Ibuprofen',
      group: 'Nichtsteroidales Antirheumatikum (NSAR)',
      summary: 'Ibuprofen ist ein schmerzstillender, fiebersenkender und entzündungshemmender Wirkstoff. Verfügbare Präparate und Anwendungsgebiete können sich unterscheiden.',
      notes: [
        'Die offizielle Gebrauchsinformation des konkreten Präparats ist maßgeblich.',
        'BfArM-Informationen weisen unter anderem auf mögliche Magen-Darm-Blutungen hin.',
        'Bei bestimmten Vorerkrankungen, weiteren Arzneimitteln oder Schwangerschaft kann eine vorherige ärztliche oder pharmazeutische Beratung wichtig sein.'
      ],
      safety: 'Keine Dosierung oder Einnahmedauer aus dieser App ableiten. Nicht mehrere Präparate mit demselben Wirkstoff kombinieren, ohne dies mit Arzt oder Apotheke zu klären.',
      sources: [
        { name: 'BfArM – Muster-Gebrauchsinformation Ibuprofen (OTC)', url: 'https://www.bfarm.de/SharedDocs/Downloads/DE/Arzneimittel/Zulassung/amInformationen/Mustertexte/palde_8000198_ibuprofen_div_otc.pdf?__blob=publicationFile', publisher: 'Bundesinstitut für Arzneimittel und Medizinprodukte' },
        { name: 'BfArM – Fachinformation Ibuprofen (OTC)', url: 'https://www.bfarm.de/SharedDocs/Downloads/DE/Arzneimittel/Zulassung/amInformationen/Mustertexte/spcde_8000198_ibuprofen_div_otc.pdf?__blob=publicationFile', publisher: 'Bundesinstitut für Arzneimittel und Medizinprodukte' }
      ]
    },
    {
      id: 'paracetamol',
      title: 'Paracetamol',
      group: 'Schmerzstillender und fiebersenkender Wirkstoff',
      summary: 'Paracetamol wird in Arzneimitteln zur Behandlung von Schmerzen und Fieber eingesetzt. Die konkrete Zulassung und Anwendung richten sich nach dem jeweiligen Präparat.',
      notes: [
        'BfArM-Gebrauchsinformationen nennen besondere Vorsicht unter anderem bei Leberfunktionsstörungen und chronischem Alkoholmissbrauch.',
        'Auch bestimmte Nierenprobleme, Flüssigkeitsmangel, Mangelernährung oder ein Körpergewicht unter 50 kg können für die sichere Anwendung relevant sein.',
        'Die gleichzeitige Einnahme weiterer paracetamolhaltiger Präparate kann zu einer unbeabsichtigten Wirkstoff-Doppelung führen.'
      ],
      safety: 'Eine Überdosierung kann schwere Leberschäden verursachen. Keine persönliche Dosis aus dieser Übersicht ableiten; Gebrauchsinformation des konkreten Produkts beachten und bei Unsicherheit ärztlich oder pharmazeutisch nachfragen.',
      sources: [
        { name: 'BfArM – Muster-Gebrauchsinformation Paracetamol', url: 'https://www.bfarm.de/SharedDocs/Downloads/DE/Arzneimittel/Zulassung/amInformationen/Mustertexte/palde_8000443_paracetamol_div_Stand_2025_01_25.pdf?__blob=publicationFile', publisher: 'Bundesinstitut für Arzneimittel und Medizinprodukte' }
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function openCatalog(config) {
    var rootId = 'hdv174-' + Math.random().toString(36).slice(2, 10);
    H.Win.open(config.title, '<div id="' + rootId + '" class="hdv174-root"></div>', { w:900, h:780 });
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root || !root.isConnected) return;
      mountCatalog(root, config);
    }, 70);
  }

  function mountCatalog(root, config) {
    var search = '';
    var category = 'Alle';
    var selectedId = config.entries[0] ? config.entries[0].id : '';
    var selected = function () { return config.entries.find(function (item) { return item.id === selectedId; }) || null; };
    var categories = ['Alle'].concat([...new Set(config.entries.map(function (item) { return item.category || item.group; }))]);

    root.innerHTML = `
      <style>
        .hdv174-root{color:var(--text,#eaf4ff);font:13px/1.5 system-ui,sans-serif;padding:12px;min-height:100%;overflow:auto}
        .hdv174-head{padding:16px;border:1px solid var(--border,rgba(90,180,255,.2));border-radius:14px;background:linear-gradient(135deg,rgba(0,205,255,.10),rgba(110,90,255,.08));margin-bottom:12px}
        .hdv174-head strong{font-size:18px;letter-spacing:.2px}
        .hdv174-muted{color:var(--muted,#9fb5c9);font-size:11px}
        .hdv174-toolbar{display:grid;grid-template-columns:minmax(190px,1fr) minmax(170px,240px);gap:8px;margin:12px 0}
        .hdv174-root input,.hdv174-root select{background:var(--panel,#0b1730);border:1px solid var(--border,rgba(90,180,255,.25));color:var(--text,#eaf4ff);border-radius:9px;padding:10px;min-width:0}
        .hdv174-layout{display:grid;grid-template-columns:minmax(240px,.85fr) minmax(300px,1.15fr);gap:12px}
        .hdv174-list,.hdv174-detail{border:1px solid var(--border,rgba(90,180,255,.2));border-radius:12px;padding:10px;background:rgba(8,18,38,.5);min-width:0}
        .hdv174-entry{width:100%;text-align:left;display:block;border:1px solid var(--border,rgba(90,180,255,.18));background:rgba(0,155,225,.06);color:inherit;border-radius:10px;padding:11px;margin:0 0 7px;cursor:pointer}
        .hdv174-entry[aria-current="true"]{border-color:var(--accent,#00d8ff);background:rgba(0,210,255,.13)}
        .hdv174-entry strong{display:block;margin-bottom:3px}
        .hdv174-tag{display:inline-block;border:1px solid var(--border,rgba(90,180,255,.3));border-radius:999px;padding:2px 7px;font-size:10px;margin:3px 4px 2px 0}
        .hdv174-section{border-top:1px solid var(--border,rgba(90,180,255,.16));padding-top:9px;margin-top:10px}
        .hdv174-section h4{margin:0 0 5px;color:var(--accent,#00d8ff);font-size:12px}
        .hdv174-section ul{padding-left:20px;margin:4px 0}
        .hdv174-section li{margin:3px 0}
        .hdv174-source{display:block;overflow-wrap:anywhere;margin:6px 0;color:var(--accent,#00d8ff)}
        .hdv174-warning{padding:10px;border-left:3px solid #e2b85f;background:rgba(226,184,95,.08);border-radius:7px;margin:9px 0}
        @media(max-width:720px){.hdv174-toolbar{grid-template-columns:1fr}.hdv174-layout{grid-template-columns:1fr}.hdv174-list{max-height:280px;overflow:auto}}
      </style>
      <div class="hdv174-head">
        <strong>${escapeHtml(config.icon)} ${escapeHtml(config.title)}</strong>
        <div class="hdv174-muted">Quellenbasierter Informationskatalog · geprüft am ${REVIEWED} · ${config.entries.length} Einträge in dieser Startausgabe</div>
      </div>
      <div class="hdv174-warning"><strong>Wichtiger Hinweis:</strong> Nur zur allgemeinen Information und Bildung. Keine Selbstdiagnose, keine individuelle Therapieentscheidung und keine Dosierungsempfehlung. Im Zweifel gelten ärztliche Beratung, Apotheke und die aktuelle Gebrauchsinformation.</div>
      <div class="hdv174-toolbar">
        <input type="search" data-k174-search placeholder="Begriff, Wirkstoff oder Thema suchen …" aria-label="Katalog durchsuchen">
        <select data-k174-category aria-label="Kategorie filtern">${categories.map(function (item) { return '<option value="' + escapeHtml(item) + '">' + escapeHtml(item) + '</option>'; }).join('')}</select>
      </div>
      <div class="hdv174-layout">
        <section class="hdv174-list" aria-label="Katalogeinträge"><div data-k174-list></div></section>
        <section class="hdv174-detail" aria-live="polite" data-k174-detail></section>
      </div>
      <div class="hdv174-muted" style="margin-top:12px">Die Startausgabe ist noch nicht das vollständige A–Z-Lexikon. Jeder zusätzliche Eintrag wird mit Quelle, Anbieter und Prüfdatum ergänzt.</div>
    `;

    function renderList() {
      var matches = config.entries.filter(function (item) {
        var categoryValue = item.category || item.group;
        var haystack = JSON.stringify(item).toLowerCase();
        return (category === 'Alle' || categoryValue === category) &&
          (!search || haystack.indexOf(search.toLowerCase()) !== -1);
      });
      var host = root.querySelector('[data-k174-list]');
      host.innerHTML = matches.length ? matches.map(function (item) {
        return '<button type="button" class="hdv174-entry" data-k174-entry="' + escapeHtml(item.id) + '" aria-current="' + (item.id === selectedId ? 'true' : 'false') + '">' +
          '<strong>' + escapeHtml(item.title) + '</strong><span class="hdv174-muted">' + escapeHtml(item.category || item.group) + '</span>' +
          '<div class="hdv174-muted">' + escapeHtml(item.summary) + '</div></button>';
      }).join('') : '<div class="hdv174-muted" style="padding:16px">Keine Treffer. Suchbegriff oder Filter ändern.</div>';
      if (!matches.some(function (item) { return item.id === selectedId; })) selectedId = matches[0] ? matches[0].id : '';
      renderDetail();
    }

    function listSection(title, entries) {
      if (!entries || !entries.length) return '';
      return '<div class="hdv174-section"><h4>' + escapeHtml(title) + '</h4><ul>' +
        entries.map(function (entry) { return '<li>' + escapeHtml(entry) + '</li>'; }).join('') +
        '</ul></div>';
    }

    function renderDetail() {
      var item = selected();
      var host = root.querySelector('[data-k174-detail]');
      if (!item) {
        host.innerHTML = '<div class="hdv174-muted">Wähle links einen Eintrag aus.</div>';
        return;
      }
      var sources = (item.sources || []).map(function (source) {
        return '<a class="hdv174-source" href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(source.name) + ' · ' + escapeHtml(source.publisher) + '</a>';
      }).join('');
      var body = config.kind === 'disease'
        ? listSection('Typische Hinweise (nicht diagnostisch)', item.signs) +
          listSection('Ärztliche Abklärung – Beispiele', item.checks) +
          '<div class="hdv174-section"><h4>Einordnung</h4><div>' + escapeHtml(item.context) + '</div></div>'
        : listSection('Wichtige Sicherheitshinweise aus offiziellen Informationen', item.notes) +
          '<div class="hdv174-warning">' + escapeHtml(item.safety) + '</div>';
      host.innerHTML = '<h3 style="margin:2px 0 5px">' + escapeHtml(item.title) + '</h3>' +
        '<div class="hdv174-muted">Zuletzt geprüft: ' + REVIEWED + '</div>' +
        '<div class="hdv174-section">' + escapeHtml(item.summary) + '</div>' + body +
        '<div class="hdv174-section"><h4>Offizielle Quellen</h4>' + sources + '</div>';
    }

    root.addEventListener('input', function (event) {
      if (!event.target.matches('[data-k174-search]')) return;
      search = event.target.value;
      renderList();
      var input = root.querySelector('[data-k174-search]');
      input.focus();
      input.setSelectionRange(search.length, search.length);
    });
    root.addEventListener('change', function (event) {
      if (!event.target.matches('[data-k174-category]')) return;
      category = event.target.value;
      renderList();
    });
    root.addEventListener('click', function (event) {
      var button = event.target.closest('[data-k174-entry]');
      if (!button) return;
      selectedId = button.getAttribute('data-k174-entry');
      renderList();
    });
    renderList();
  }

  var configs = [
    { id:'krankheitslexikon-pro', title:'HalDo Krankheitslexikon Pro', icon:'📚', category:'K', kind:'disease', entries:diseases },
    { id:'medikamentenlexikon-pro', title:'HalDo Medikamentenlexikon Pro', icon:'💊', category:'M', kind:'medication', entries:medications }
  ];

  var registered = [];
  configs.forEach(function (config) {
    H[config.id] = {
      version:BUILD,
      isGenericFallback:false,
      implementationKind:'module',
      open:function () { openCatalog(config); }
    };
    if (H.Registry && Array.isArray(H.Registry.featured)) {
      var existing = H.Registry.featured.find(function (app) { return app && app.id === config.id; });
      if (existing) { existing.n = config.title; existing.i = config.icon; }
      else H.Registry.featured.push({ id:config.id, n:config.title, i:config.icon });
    }
    if (H.Registry && typeof H.Registry.registerCategoryApp === 'function') {
      H.Registry.registerCategoryApp(config.category, config.id);
    }
    registered.push({ id:config.id, title:config.title });
  });

  H.AppsV174 = {
    version:BUILD,
    apps:registered.slice(),
    status:function () {
      return configs.map(function (config) {
        return { id:config.id, ready:!!(H[config.id] && typeof H[config.id].open === 'function'), entries:config.entries.length };
      });
    }
  };
  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.namedCoreApps = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured.length : 0;

  console.info('[HalDo v174] Krankheitslexikon und Medikamentenlexikon registriert.');
})();
