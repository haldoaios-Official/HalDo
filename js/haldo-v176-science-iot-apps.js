/* ================================================================
   HALDO AI OS PRO MAX — v176 Science Lab + WLAN/Bluetooth
   Safe browser APIs only. No hidden scan, no Wi-Fi credential access.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo;
  var BUILD = '176.0.0';
  if (!H || !H.Win || !H.Store || H.__haldoV176ScienceIot) {
    if (H && !H.__haldoV176ScienceIot) console.error('[HalDo v176] HalDo Window/Store API not available.');
    return;
  }
  H.__haldoV176ScienceIot = true;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character];
    });
  }
  function formatNumber(value) {
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('de-DE', { maximumSignificantDigits:11, maximumFractionDigits:8 }).format(Object.is(value, -0) ? 0 : value);
  }
  function openWindow(id, title, width, height, mount) {
    var rootId = 'hdv176-' + id + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    H.Win.open(title, '<div class="hdv176-root" id="' + rootId + '" data-hv176-app="' + esc(id) + '"></div>', { w:width, h:height });
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (root && root.isConnected) mount(root);
    }, 80);
  }
  var CSS = '<style>' +
    '.hdv176-root{height:100%;overflow:auto;padding:14px;color:var(--text,#eaf6ff);font-family:inherit;box-sizing:border-box}' +
    '.hdv176-root *{box-sizing:border-box}' +
    '.hdv176-hero{padding:15px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(135deg,rgba(0,229,255,.11),rgba(125,75,205,.08));margin-bottom:12px}' +
    '.hdv176-muted{font-size:12px;line-height:1.5;color:var(--muted,#9fb2c8)}' +
    '.hdv176-card{padding:13px;border:1px solid var(--border,rgba(0,229,255,.2));border-radius:13px;background:rgba(10,25,48,.55);margin-bottom:10px}' +
    '.hdv176-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}' +
    '.hdv176-field{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border,rgba(0,229,255,.24));border-radius:9px;background:rgba(0,15,32,.65);color:var(--text,#eaf6ff);font:inherit}' +
    '.hdv176-label{display:block;font-size:11px;font-weight:700;color:var(--muted,#9fb2c8);margin:0 0 5px}' +
    '.hdv176-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.hdv176-btn{padding:9px 12px;border:1px solid var(--border,rgba(0,229,255,.28));border-radius:9px;color:var(--text,#eaf6ff);background:rgba(0,150,220,.12);font:inherit;font-size:12px;font-weight:700;cursor:pointer}' +
    '.hdv176-btn.primary{background:linear-gradient(135deg,#00d5ed,#62a8ff);border-color:transparent;color:#00121c}' +
    '.hdv176-btn:disabled{opacity:.42;cursor:not-allowed}' +
    '.hdv176-result{padding:15px;border-radius:12px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.25)}' +
    '.hdv176-result strong{display:block;font-size:28px;color:var(--accent,#00e5ff);overflow-wrap:anywhere}' +
    '.hdv176-warning{padding:10px;border-radius:9px;border:1px solid rgba(255,185,70,.3);background:rgba(255,185,70,.08);font-size:12px;line-height:1.5}' +
    '.hdv176-list{display:grid;gap:6px}.hdv176-item{padding:9px 10px;border-radius:9px;background:rgba(255,255,255,.035);border:1px solid rgba(140,190,230,.13);text-align:left;color:inherit;width:100%;cursor:pointer}' +
    '.hdv176-item strong{display:block;font-size:12px}.hdv176-item small{display:block;color:var(--muted,#9fb2c8);margin-top:3px}' +
    '.hdv176-pill{display:inline-flex;padding:4px 8px;border:1px solid rgba(0,229,255,.25);border-radius:99px;font-size:10px;color:var(--accent,#00e5ff)}' +
    '.hdv176-status{min-height:38px;padding:10px;border-radius:9px;background:rgba(0,229,255,.08);font-size:12px;line-height:1.5;color:#a9f1ff}' +
    '.hdv176-history{display:grid;gap:6px;margin-top:8px}.hdv176-history div{padding:8px;border-radius:8px;background:rgba(255,255,255,.035);font-size:11px;overflow-wrap:anywhere}' +
    '@media(max-width:520px){.hdv176-grid{grid-template-columns:1fr}.hdv176-root{padding:9px}}' +
    '</style>';

  /* ----------------------- SCIENCE LAB FORMULAS ----------------------- */
  var HISTORY_KEY = 'haldo_v176_science_history';
  var FORMULAS = [
    {cat:'⚙️ Mechanik',id:'speed',name:'Geschwindigkeit',equation:'v = s / t',unit:'m/s',fields:[['s','Strecke (m)'],['t','Zeit (s)']],validate:function(p){if(p.s<0||p.t<=0)throw new Error('Strecke muss ≥ 0 und Zeit > 0 sein.');},calc:function(p){return p.s/p.t;}},
    {cat:'⚙️ Mechanik',id:'acceleration',name:'Beschleunigung',equation:'a = Δv / t',unit:'m/s²',fields:[['dv','Geschwindigkeitsänderung (m/s)'],['t','Zeit (s)']],validate:function(p){if(p.t<=0)throw new Error('Zeit muss größer als 0 sein.');},calc:function(p){return p.dv/p.t;}},
    {cat:'⚙️ Mechanik',id:'force',name:'Kraft (2. Newton)',equation:'F = m × a',unit:'N',fields:[['m','Masse (kg)'],['a','Beschleunigung (m/s²)']],validate:function(p){if(p.m<0)throw new Error('Masse darf nicht negativ sein.');},calc:function(p){return p.m*p.a;}},
    {cat:'⚙️ Mechanik',id:'work',name:'Mechanische Arbeit',equation:'W = F × s',unit:'J',fields:[['F','Kraft (N)'],['s','Weg (m)']],calc:function(p){return p.F*p.s;}},
    {cat:'⚙️ Mechanik',id:'power',name:'Leistung',equation:'P = W / t',unit:'W',fields:[['W','Arbeit (J)'],['t','Zeit (s)']],validate:function(p){if(p.t<=0)throw new Error('Zeit muss größer als 0 sein.');},calc:function(p){return p.W/p.t;}},
    {cat:'⚙️ Mechanik',id:'kinetic',name:'Kinetische Energie',equation:'E = ½ m v²',unit:'J',fields:[['m','Masse (kg)'],['v','Geschwindigkeit (m/s)']],validate:function(p){if(p.m<0)throw new Error('Masse darf nicht negativ sein.');},calc:function(p){return .5*p.m*p.v*p.v;}},
    {cat:'⚙️ Mechanik',id:'potential',name:'Potenzielle Energie',equation:'E = m × g × h',unit:'J',fields:[['m','Masse (kg)'],['h','Höhe (m)']],validate:function(p){if(p.m<0)throw new Error('Masse darf nicht negativ sein.');},calc:function(p){return p.m*9.80665*p.h;}},
    {cat:'⚙️ Mechanik',id:'momentum',name:'Impuls',equation:'p = m × v',unit:'kg·m/s',fields:[['m','Masse (kg)'],['v','Geschwindigkeit (m/s)']],validate:function(p){if(p.m<0)throw new Error('Masse darf nicht negativ sein.');},calc:function(p){return p.m*p.v;}},
    {cat:'💧 Stoffwerte',id:'density',name:'Dichte',equation:'ρ = m / V',unit:'kg/m³',fields:[['m','Masse (kg)'],['V','Volumen (m³)']],validate:function(p){if(p.m<0||p.V<=0)throw new Error('Masse muss ≥ 0 und Volumen > 0 sein.');},calc:function(p){return p.m/p.V;}},
    {cat:'💧 Stoffwerte',id:'pressure',name:'Druck',equation:'p = F / A',unit:'Pa',fields:[['F','Kraft (N)'],['A','Fläche (m²)']],validate:function(p){if(p.A<=0)throw new Error('Fläche muss größer als 0 sein.');},calc:function(p){return p.F/p.A;}},
    {cat:'🌡️ Wärme',id:'heat-water',name:'Wärmeenergie (Wasser)',equation:'Q = m × c × ΔT',unit:'J',fields:[['m','Wassermasse (kg)'],['dT','Temperaturänderung (K)']],validate:function(p){if(p.m<0)throw new Error('Masse darf nicht negativ sein.');},calc:function(p){return p.m*4186*p.dT;}},
    {cat:'⚡ Elektrizität',id:'ohm',name:'Ohmsches Gesetz',equation:'U = R × I',unit:'V',fields:[['R','Widerstand (Ω)'],['I','Strom (A)']],validate:function(p){if(p.R<0)throw new Error('Widerstand darf nicht negativ sein.');},calc:function(p){return p.R*p.I;}},
    {cat:'⚡ Elektrizität',id:'electric-power',name:'Elektrische Leistung',equation:'P = U × I',unit:'W',fields:[['U','Spannung (V)'],['I','Strom (A)']],calc:function(p){return p.U*p.I;}},
    {cat:'⚡ Elektrizität',id:'charge',name:'Elektrische Ladung',equation:'Q = I × t',unit:'C',fields:[['I','Strom (A)'],['t','Zeit (s)']],validate:function(p){if(p.t<0)throw new Error('Zeit darf nicht negativ sein.');},calc:function(p){return p.I*p.t;}},
    {cat:'〰️ Wellen',id:'frequency',name:'Frequenz',equation:'f = 1 / T',unit:'Hz',fields:[['T','Periodendauer (s)']],validate:function(p){if(p.T<=0)throw new Error('Periodendauer muss größer als 0 sein.');},calc:function(p){return 1/p.T;}},
    {cat:'〰️ Wellen',id:'wavelength',name:'Wellenlänge',equation:'λ = c / f',unit:'m',fields:[['c','Ausbreitungsgeschwindigkeit (m/s)'],['f','Frequenz (Hz)']],validate:function(p){if(p.f<=0)throw new Error('Frequenz muss größer als 0 sein.');},calc:function(p){return p.c/p.f;}},
    {cat:'🔆 Optik',id:'light-speed',name:'Lichtgeschwindigkeit im Vakuum',equation:'c = 299 792 458 m/s',unit:'m/s',fields:[],calc:function(){return 299792458;}},
    {cat:'🔆 Optik',id:'light-time',name:'Lichtlaufzeit',equation:'t = s / c',unit:'s',fields:[['s','Strecke (m)']],validate:function(p){if(p.s<0)throw new Error('Strecke darf nicht negativ sein.');},calc:function(p){return p.s/299792458;}},
    {cat:'📐 Geometrie',id:'circle-circumference',name:'Kreisumfang',equation:'U = 2 π r',unit:'m',fields:[['r','Radius (m)']],validate:function(p){if(p.r<0)throw new Error('Radius darf nicht negativ sein.');},calc:function(p){return 2*Math.PI*p.r;}},
    {cat:'📐 Geometrie',id:'circle-area',name:'Kreisfläche',equation:'A = π r²',unit:'m²',fields:[['r','Radius (m)']],validate:function(p){if(p.r<0)throw new Error('Radius darf nicht negativ sein.');},calc:function(p){return Math.PI*p.r*p.r;}},
    {cat:'📐 Geometrie',id:'sphere-volume',name:'Kugelvolumen',equation:'V = ⁴⁄₃ π r³',unit:'m³',fields:[['r','Radius (m)']],validate:function(p){if(p.r<0)throw new Error('Radius darf nicht negativ sein.');},calc:function(p){return 4/3*Math.PI*Math.pow(p.r,3);}},
    {cat:'📐 Geometrie',id:'pythagoras',name:'Satz des Pythagoras',equation:'c = √(a² + b²)',unit:'m',fields:[['a','Kathete a (m)'],['b','Kathete b (m)']],calc:function(p){return Math.hypot(p.a,p.b);}},
    {cat:'📐 Mathematik',id:'percentage',name:'Prozentwert',equation:'W = G × p / 100',unit:'',fields:[['G','Grundwert'],['p','Prozent (%)']],calc:function(p){return p.G*p.p/100;}},
    {cat:'🌌 Thermodynamik',id:'ideal-gas',name:'Ideales Gas (Stoffmenge)',equation:'n = pV / (RT)',unit:'mol',fields:[['p','Druck (Pa)'],['V','Volumen (m³)'],['T','Temperatur (K)']],validate:function(p){if(p.p<0||p.V<0||p.T<=0)throw new Error('Druck und Volumen müssen ≥ 0, Temperatur > 0 K sein.');},calc:function(p){return p.p*p.V/(8.314462618*p.T);}}
  ];

  function getFormula(id) { return FORMULAS.find(function (formula) { return formula.id === id; }) || null; }

  function openScienceLab() {
    openWindow('science-lab', '🧪 HalDo Wissenschaftslabor Pro', 780, 760, mountScienceLab);
  }

  function mountScienceLab(root) {
    var query = '';
    var selectedId = null;
    var history = [];
    try {
      var saved = H.Store.get(HISTORY_KEY, []);
      if (Array.isArray(saved)) history = saved.slice(0, 30);
    } catch (error) { console.warn('[HalDo v176] History read failed:', error); }
    var lastResult = null;

    function renderList() {
      var filtered = FORMULAS.filter(function (formula) {
        var haystack = [formula.cat, formula.name, formula.equation, formula.unit, formula.id].join(' ').toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
      var groups = {};
      filtered.forEach(function (formula) {
        if (!groups[formula.cat]) groups[formula.cat] = [];
        groups[formula.cat].push(formula);
      });
      root.innerHTML = CSS +
        '<div class="hdv176-hero"><strong style="font-size:18px">🧪 HalDo Wissenschaftslabor Pro</strong><div class="hdv176-muted">Physik, Elektrizität, Wärme, Wellen, Optik, Geometrie und Mathematik · Berechnung mit klaren Einheiten</div></div>' +
        '<div class="hdv176-card"><label class="hdv176-label" for="hv176-search">Formel suchen</label><input class="hdv176-field" id="hv176-search" data-hv176-search placeholder="z. B. Kraft, Ohm, Dichte …" value="' + esc(query) + '"><div class="hdv176-muted" style="margin-top:7px">' + filtered.length + ' von ' + FORMULAS.length + ' Formeln</div></div>' +
        '<div class="hdv176-list" data-hv176-formulas>' +
          Object.keys(groups).map(function (category) {
            return '<section class="hdv176-card"><strong>' + esc(category) + '</strong>' +
              groups[category].map(function (formula) {
                return '<button type="button" class="hdv176-item" data-hv176-formula="' + esc(formula.id) + '"><strong>' +
                  esc(formula.name) + '</strong><small>' + esc(formula.equation) + (formula.unit ? ' · ' + esc(formula.unit) : '') + '</small></button>';
              }).join('') + '</section>';
          }).join('') +
        '</div>' +
        '<section class="hdv176-card"><div class="hdv176-row" style="justify-content:space-between"><strong>Letzte Berechnungen</strong><button type="button" class="hdv176-btn" data-hv176-clear-history>Verlauf löschen</button></div><div class="hdv176-history" data-hv176-history></div><p class="hdv176-muted">Es werden nur Formel, Eingabewerte, Ergebnis und Zeitpunkt lokal gespeichert.</p></section>' +
        '<p class="hdv176-warning">Hinweis: Diese Formeln dienen dem Lernen und allgemeinen Rechnen. Ergebnisse hängen von den eingegebenen Größen, Einheiten und Modellannahmen ab; sie sind keine Messung oder technische Sicherheitsfreigabe.</p>';

      var search = root.querySelector('[data-hv176-search]');
      search.addEventListener('input', function (event) {
        query = event.target.value;
        var cursor = event.target.selectionStart;
        renderList();
        var next = root.querySelector('[data-hv176-search]');
        next.focus();
        next.setSelectionRange(cursor, cursor);
      });
      root.querySelectorAll('[data-hv176-formula]').forEach(function (button) {
        button.addEventListener('click', function () {
          selectedId = button.dataset.hv176Formula;
          renderFormula();
        });
      });
      renderHistory();
      root.querySelector('[data-hv176-clear-history]').addEventListener('click', function () {
        history = [];
        try { H.Store.set(HISTORY_KEY, history); } catch (error) {}
        renderHistory();
      });
    }

    function renderHistory() {
      var host = root.querySelector('[data-hv176-history]');
      if (!host) return;
      host.innerHTML = history.length ? history.map(function (entry) {
        return '<div><strong>' + esc(entry.name) + '</strong><br>' + esc(entry.inputs) + ' = ' +
          esc(formatNumber(entry.result)) + (entry.unit ? ' ' + esc(entry.unit) : '') +
          '<small class="hdv176-muted">' + esc(new Date(entry.ts).toLocaleString('de-DE')) + '</small></div>';
      }).join('') : '<div class="hdv176-muted">Noch keine Berechnungen gespeichert.</div>';
    }

    function renderFormula() {
      var formula = getFormula(selectedId);
      if (!formula) { renderList(); return; }
      root.innerHTML = CSS +
        '<div class="hdv176-hero"><div class="hdv176-row"><button type="button" class="hdv176-btn" data-hv176-back>← Zurück zu den Formeln</button><span class="hdv176-pill">' + esc(formula.cat) + '</span></div><h3 style="margin:10px 0 4px">' + esc(formula.name) + '</h3><strong style="font-size:20px;color:var(--accent,#00e5ff)">' + esc(formula.equation) + '</strong></div>' +
        '<div class="hdv176-card"><div class="hdv176-grid">' +
          formula.fields.map(function (field) {
            return '<div><label class="hdv176-label" for="hv176-' + esc(field[0]) + '">' + esc(field[1]) + '</label><input class="hdv176-field" id="hv176-' + esc(field[0]) + '" data-hv176-field="' + esc(field[0]) + '" type="number" step="any" inputmode="decimal"></div>';
          }).join('') + '</div>' +
          '<div class="hdv176-row" style="margin-top:12px"><button type="button" class="hdv176-btn primary" data-hv176-calculate>Berechnen</button><button type="button" class="hdv176-btn" data-hv176-reset>Zurücksetzen</button></div>' +
          '<div class="hdv176-status" data-hv176-status role="status" aria-live="polite">Gib die Werte mit den angezeigten Einheiten ein.</div>' +
          '<div class="hdv176-result" data-hv176-result style="margin-top:10px"><span class="hdv176-muted">Ergebnis</span><strong>—</strong></div>' +
          '<div class="hdv176-row" style="margin-top:10px"><button type="button" class="hdv176-btn" data-hv176-save disabled>Ergebnis im Verlauf speichern</button></div></div>' +
          '<p class="hdv176-muted">Die angezeigte Einheit ergibt sich aus den Einheiten der Eingabefelder. Bitte keine Werte mit unterschiedlichen Einheiten vermischen.</p>';

      root.querySelector('[data-hv176-back]').addEventListener('click', function () { selectedId = null; renderList(); });
      root.querySelector('[data-hv176-reset]').addEventListener('click', function () {
        root.querySelectorAll('[data-hv176-field]').forEach(function (input) { input.value = ''; });
        root.querySelector('[data-hv176-status]').textContent = 'Eingaben zurückgesetzt.';
        root.querySelector('[data-hv176-result]').innerHTML = '<span class="hdv176-muted">Ergebnis</span><strong>—</strong>';
        root.querySelector('[data-hv176-save]').disabled = true;
        lastResult = null;
      });
      root.querySelector('[data-hv176-calculate]').addEventListener('click', function () {
        var params = {};
        var labels = [];
        for (var i = 0; i < formula.fields.length; i += 1) {
          var field = formula.fields[i];
          var text = root.querySelector('[data-hv176-field="' + field[0] + '"]').value.trim();
          if (!text) {
            root.querySelector('[data-hv176-status]').textContent = 'Bitte alle Eingabefelder ausfüllen.';
            root.querySelector('[data-hv176-save]').disabled = true;
            lastResult = null;
            return;
          }
          var number = Number(text);
          if (!Number.isFinite(number)) {
            root.querySelector('[data-hv176-status]').textContent = 'Bitte nur endliche Zahlen eingeben.';
            root.querySelector('[data-hv176-save]').disabled = true;
            lastResult = null;
            return;
          }
          params[field[0]] = number;
          labels.push(field[0] + '=' + formatNumber(number));
        }
        try {
          if (formula.validate) formula.validate(params);
          var result = Number(formula.calc(params));
          if (!Number.isFinite(result)) throw new Error('Ergebnis ist nicht endlich. Prüfe Eingabewerte und Nenner.');
          if (Math.abs(result) > 1e100) throw new Error('Ergebnis ist außerhalb des unterstützten Zahlenbereichs.');
          lastResult = {
            id:formula.id,
            name:formula.name,
            inputs:labels.join('; '),
            result:result,
            unit:formula.unit,
            ts:Date.now()
          };
          root.querySelector('[data-hv176-result]').innerHTML = '<span class="hdv176-muted">Ergebnis</span><strong>' +
            esc(formatNumber(result)) + (formula.unit ? ' ' + esc(formula.unit) : '') + '</strong>';
          root.querySelector('[data-hv176-status]').textContent = 'Berechnung erfolgreich.';
          root.querySelector('[data-hv176-save]').disabled = false;
        } catch (error) {
          lastResult = null;
          root.querySelector('[data-hv176-status]').textContent = error.message || 'Berechnung fehlgeschlagen.';
          root.querySelector('[data-hv176-save]').disabled = true;
        }
      });
      root.querySelector('[data-hv176-save]').addEventListener('click', function () {
        if (!lastResult) return;
        history.unshift(Object.assign({}, lastResult));
        history = history.slice(0, 30);
        try {
          H.Store.set(HISTORY_KEY, history);
          root.querySelector('[data-hv176-status]').textContent = 'Berechnung lokal gespeichert.';
        } catch (error) {
          root.querySelector('[data-hv176-status]').textContent = 'Verlauf konnte nicht gespeichert werden.';
        }
      });
    }

    renderList();
  }

  /* ------------------------- WLAN / BLUETOOTH ------------------------- */
  function openWlanBluetooth() {
    openWindow('wlan-bt', '📶 HalDo WLAN- & Bluetooth-Manager Pro', 780, 760, mountWlanBluetooth);
  }

  function mountWlanBluetooth(root) {
    var device = null;
    var server = null;
    var service = null;
    var characteristic = null;
    var cleanupObserver = null;

    root.innerHTML = CSS +
      '<div class="hdv176-hero"><strong style="font-size:18px">📶 HalDo WLAN- & Bluetooth-Manager Pro</strong><div class="hdv176-muted">Lokale Netzwerkdiagnose und ausdrücklich freigegebene Bluetooth-GATT-Verbindung</div></div>' +
      '<section class="hdv176-card"><div class="hdv176-row" style="justify-content:space-between"><strong>WLAN / Netzwerk</strong><span class="hdv176-pill" data-hv176-online>Prüfe Verbindung …</span></div>' +
        '<div class="hdv176-grid" style="margin-top:10px">' +
          '<div><span class="hdv176-label">Online-Status</span><strong data-hv176-online-value>—</strong></div>' +
          '<div><span class="hdv176-label">Verbindungstyp</span><strong data-hv176-connection>Vom Browser nicht gemeldet</strong></div>' +
          '<div><span class="hdv176-label">Geschätzte RTT</span><strong data-hv176-rtt>—</strong></div>' +
          '<div><span class="hdv176-label">Downlink-Schätzung</span><strong data-hv176-downlink>—</strong></div>' +
        '</div>' +
        '<p class="hdv176-warning" style="margin-top:10px">Browser-Sicherheitsgrenze: Webseiten erhalten normalerweise keinen Zugriff auf WLAN-SSID, WLAN-Passwort, MAC-Adresse, Hotspot-Schalter oder eine Liste benachbarter Funkgeräte. Diese App liest solche Daten nicht aus und schaltet den WLAN-Hotspot nicht heimlich um. Verwende die WLAN-/Hotspot-Einstellungen deines Betriebssystems. Zum Teilen eines Gastzugangs kannst du einen QR-Code erzeugen.</p>' +
        '<div class="hdv176-row" style="margin-top:9px"><button type="button" class="hdv176-btn" data-hv176-open-qr>WLAN-QR-Code erstellen</button></div></section>' +
      '<section class="hdv176-card"><div class="hdv176-row" style="justify-content:space-between"><strong>Bluetooth Low Energy (BLE)</strong><span class="hdv176-pill" data-hv176-ble-status>Prüfe Unterstützung …</span></div>' +
        '<p class="hdv176-muted" style="margin:7px 0">Ein Gerät wird erst nach Klick auf „Gerät auswählen“ im Browserdialog gesucht und nach deiner Auswahl verbunden. Es findet kein Hintergrund-Scan statt.</p>' +
        '<div class="hdv176-grid">' +
          '<div><label class="hdv176-label" for="hv176-service">GATT-Service-UUID</label><input class="hdv176-field" id="hv176-service" data-hv176-service value="battery_service" placeholder="z. B. battery_service oder UUID"></div>' +
          '<div><label class="hdv176-label" for="hv176-characteristic">Merkmal-UUID</label><input class="hdv176-field" id="hv176-characteristic" data-hv176-characteristic value="battery_level" placeholder="z. B. battery_level oder UUID"></div>' +
        '</div>' +
        '<div class="hdv176-row" style="margin-top:10px"><button type="button" class="hdv176-btn primary" data-hv176-connect>Bluetooth-Gerät auswählen</button><button type="button" class="hdv176-btn" data-hv176-disconnect disabled>Trennen</button></div>' +
        '<div class="hdv176-status" data-hv176-ble-message role="status" aria-live="polite" style="margin-top:10px">Noch kein Gerät ausgewählt.</div>' +
        '<div class="hdv176-row" style="margin-top:10px"><button type="button" class="hdv176-btn" data-hv176-read disabled>Merkmal lesen</button><input class="hdv176-field" style="flex:1" data-hv176-write-value placeholder="Hex-Bytes, z. B. 01 02" disabled><button type="button" class="hdv176-btn" data-hv176-write disabled>Bytes senden</button></div>' +
        '<label class="hdv176-row hdv176-muted" style="margin-top:8px"><input type="checkbox" data-hv176-write-confirm disabled> Ich habe das ausgewählte Gerät und die manuell eingegebenen Bytes geprüft und bestätige das Senden.</label>' +
        '<div class="hdv176-result" data-hv176-read-result style="margin-top:9px"><span class="hdv176-muted">Ausgelesene Bytes</span><strong>—</strong></div>' +
        '<p class="hdv176-warning" style="margin-top:10px">Sicherheitsregel: Es werden keine Schreibbefehle automatisch ausgeführt. Sende nur bekannte, vom Gerätehersteller dokumentierte Werte. Unbekannte GATT-Befehle können Gerätefunktionen verändern.</p></section>' +
      '<p class="hdv176-muted">Bluetooth benötigt einen unterstützten Browser, HTTPS bzw. einen sicheren Kontext und deine explizite Auswahl/Freigabe. iOS-/Browser-Unterstützung kann eingeschränkt sein.</p>';

    function say(message, bad) {
      var status = root.querySelector('[data-hv176-ble-message]');
      if (!status) return;
      status.textContent = message;
      status.style.color = bad ? '#ff9baa' : '#a9f1ff';
    }
    function renderNetwork() {
      var online = navigator.onLine === true;
      var info = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
      root.querySelector('[data-hv176-online]').textContent = online ? 'Online' : 'Offline';
      root.querySelector('[data-hv176-online-value]').textContent = online ? 'Ja' : 'Nein';
      root.querySelector('[data-hv176-connection]').textContent = info && info.effectiveType ? info.effectiveType : 'Vom Browser nicht gemeldet';
      root.querySelector('[data-hv176-rtt]').textContent = info && Number.isFinite(info.rtt) ? formatNumber(info.rtt) + ' ms' : 'Nicht verfügbar';
      root.querySelector('[data-hv176-downlink]').textContent = info && Number.isFinite(info.downlink) ? formatNumber(info.downlink) + ' Mbit/s' : 'Nicht verfügbar';
    }
    function setConnected(connected) {
      root.querySelector('[data-hv176-connect]').disabled = connected;
      root.querySelector('[data-hv176-disconnect]').disabled = !connected;
      root.querySelector('[data-hv176-read]').disabled = !connected;
      root.querySelector('[data-hv176-write-value]').disabled = !connected;
      root.querySelector('[data-hv176-write]').disabled = !connected;
      root.querySelector('[data-hv176-write-confirm]').disabled = !connected;
    }
    function disconnect() {
      if (server && server.connected && typeof server.disconnect === 'function') {
        try { server.disconnect(); } catch (error) {}
      }
      server = null;
      service = null;
      characteristic = null;
      if (device) {
        try { device.removeEventListener('gattserverdisconnected', handleDisconnected); } catch (error) {}
      }
      device = null;
      setConnected(false);
      say('Bluetooth-Verbindung getrennt.');
    }
    function handleDisconnected() {
      server = null;
      service = null;
      characteristic = null;
      device = null;
      setConnected(false);
      say('Das Bluetooth-Gerät hat die Verbindung getrennt.');
    }
    function bytesToHex(view) {
      var out = [];
      for (var i = 0; i < view.byteLength; i += 1) out.push(view.getUint8(i).toString(16).padStart(2, '0').toUpperCase());
      return out.join(' ');
    }
    function parseHex(value) {
      var clean = String(value || '').trim();
      if (!clean || !/^(?:[0-9a-fA-F]{2})(?:[\s,:-]+[0-9a-fA-F]{2})*$/.test(clean)) {
        throw new Error('Bitte Hex-Bytes paarweise eingeben, z. B. 01 02 A0.');
      }
      var bytes = clean.split(/[\s,:-]+/).map(function (part) { return parseInt(part, 16); });
      if (bytes.length > 20) throw new Error('Maximal 20 Bytes pro manueller Übertragung erlaubt.');
      return new Uint8Array(bytes);
    }

    var bluetooth = navigator.bluetooth;
    var secure = window.isSecureContext === true;
    root.querySelector('[data-hv176-ble-status]').textContent = !secure ? 'Sicherer Kontext erforderlich' :
      (bluetooth && typeof bluetooth.requestDevice === 'function' ? 'BLE-API verfügbar' : 'BLE-API nicht verfügbar');
    if (!secure || !bluetooth || typeof bluetooth.requestDevice !== 'function') {
      root.querySelector('[data-hv176-connect]').disabled = true;
      say(!secure ? 'Bluetooth ist nur in einem sicheren Browser-Kontext (HTTPS/localhost) verfügbar.' :
        'Dieser Browser stellt Web Bluetooth nicht bereit. Verwende einen unterstützten Desktop-Browser oder die native Geräte-App.', true);
    }

    root.querySelector('[data-hv176-connect]').addEventListener('click', async function () {
      if (!secure || !bluetooth || typeof bluetooth.requestDevice !== 'function') {
        say('Web Bluetooth ist nicht verfügbar.', true);
        return;
      }
      var serviceId = root.querySelector('[data-hv176-service]').value.trim();
      if (!serviceId) { say('Bitte eine Service-UUID eingeben, die dein Gerät dokumentiert.', true); return; }
      try {
        say('Warte auf deine Geräteauswahl im Browserdialog …');
        var selected = await bluetooth.requestDevice({ acceptAllDevices:true, optionalServices:[serviceId] });
        if (!selected || !selected.gatt) throw new Error('Das ausgewählte Gerät unterstützt keine GATT-Verbindung.');
        if (!root.isConnected) return;
        device = selected;
        device.addEventListener('gattserverdisconnected', handleDisconnected);
        server = await device.gatt.connect();
        if (!root.isConnected) { disconnect(); return; }
        setConnected(true);
        say('Verbunden mit ' + (device.name || 'Bluetooth-Gerät') + '. Lies nur dokumentierte Merkmale aus.');
      } catch (error) {
        disconnect();
        say(error && error.message ? error.message : 'Bluetooth-Verbindung abgebrochen.', true);
      }
    });
    root.querySelector('[data-hv176-disconnect]').addEventListener('click', disconnect);
    root.querySelector('[data-hv176-read]').addEventListener('click', async function () {
      if (!server || !server.connected) { say('Bitte zuerst ein Gerät verbinden.', true); return; }
      var serviceId = root.querySelector('[data-hv176-service]').value.trim();
      var characteristicId = root.querySelector('[data-hv176-characteristic]').value.trim();
      if (!characteristicId) { say('Bitte eine dokumentierte Merkmals-UUID eingeben.', true); return; }
      try {
        service = await server.getPrimaryService(serviceId);
        characteristic = await service.getCharacteristic(characteristicId);
        var value = await characteristic.readValue();
        root.querySelector('[data-hv176-read-result]').innerHTML = '<span class="hdv176-muted">Gelesene Bytes</span><strong>' + esc(bytesToHex(value) || '(leer)') + '</strong>';
        say('Merkmal wurde gelesen.');
      } catch (error) {
        say('Lesen fehlgeschlagen: ' + (error.message || error), true);
      }
    });
    root.querySelector('[data-hv176-write]').addEventListener('click', async function () {
      if (!characteristic) { say('Bitte zuerst das ausgewählte Merkmal lesen bzw. öffnen.', true); return; }
      if (!root.querySelector('[data-hv176-write-confirm]').checked) { say('Bitte die manuelle Übertragung ausdrücklich bestätigen.', true); return; }
      try {
        var payload = parseHex(root.querySelector('[data-hv176-write-value]').value);
        var write = characteristic.writeValueWithResponse || characteristic.writeValue;
        if (typeof write !== 'function') throw new Error('Dieses Merkmal unterstützt kein Schreiben.');
        await write.call(characteristic, payload);
        say('Die bestätigten Bytes wurden an das ausgewählte Merkmal gesendet.');
      } catch (error) {
        say('Übertragung nicht ausgeführt: ' + (error.message || error), true);
      }
    });
    root.querySelector('[data-hv176-open-qr]').addEventListener('click', function () {
      if (H.qr && typeof H.qr.open === 'function') H.qr.open();
      else say('QR Studio ist nicht verfügbar. Bitte QR-Modul laden.', true);
    });

    renderNetwork();
    window.addEventListener('online', renderNetwork);
    window.addEventListener('offline', renderNetwork);
    if (navigator.connection && navigator.connection.addEventListener) navigator.connection.addEventListener('change', renderNetwork);
    cleanupObserver = new MutationObserver(function () {
      if (root.isConnected) return;
      cleanupObserver.disconnect();
      window.removeEventListener('online', renderNetwork);
      window.removeEventListener('offline', renderNetwork);
      if (navigator.connection && navigator.connection.removeEventListener) navigator.connection.removeEventListener('change', renderNetwork);
      disconnect();
    });
    cleanupObserver.observe(document.body, { childList:true, subtree:true });
  }

  H['science-lab'] = { open:openScienceLab, version:BUILD };
  H['wlan-bt'] = { open:openWlanBluetooth, version:BUILD };
  H.AppsV176 = {
    version:BUILD,
    apps:['science-lab','wlan-bt'],
    status:function () { return this.apps.map(function (id) { return { id:id, ready:!!(H[id] && typeof H[id].open === 'function') }; }); }
  };
  H.Master = H.Master || {};
  H.Master.version = BUILD;
  console.info('[HalDo v176] Wissenschaftslabor and WLAN/Bluetooth modules registered.');
})();
