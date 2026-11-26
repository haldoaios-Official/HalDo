/* ================================================================
   HALDO AI OS PRO MAX — v174 Utility & Habit Apps
   HalDo Einheiten-Umrechner Pro + HalDo Habit Heatmap Pro
   Offline-first, lokale Browserdaten, no remote service dependencies.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo;
  var BUILD = '174.0.0';
  if (!H || !H.Win || !H.Store || H.__haldoV174UtilityApps) {
    if (H && !H.__haldoV174UtilityApps) console.error('[HalDo v174] HalDo Window/Store API is not available.');
    return;
  }
  H.__haldoV174UtilityApps = true;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function openWindow(appId, title, width, height, mount) {
    var id = 'hdv174-' + appId + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    H.Win.open(title, '<div class="hdv174-root" data-hv174-app="' + esc(appId) + '" id="' + esc(id) + '"></div>', { w:width, h:height });
    window.setTimeout(function () {
      var root = document.getElementById(id);
      if (root && root.isConnected) mount(root);
    }, 80);
  }

  var CSS = '<style>' +
    '.hdv174-root{height:100%;overflow:auto;padding:14px;color:var(--text,#eaf6ff);font-family:inherit;box-sizing:border-box}' +
    '.hdv174-root *{box-sizing:border-box}' +
    '.hdv174-hero{padding:15px;border:1px solid var(--border,rgba(0,229,255,.22));border-radius:15px;background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(70,95,180,.08));margin-bottom:12px}' +
    '.hdv174-muted{font-size:12px;line-height:1.5;color:var(--muted,#9fb2c8)}' +
    '.hdv174-card{padding:13px;border:1px solid var(--border,rgba(0,229,255,.2));border-radius:13px;background:rgba(10,25,48,.55);margin-bottom:10px}' +
    '.hdv174-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '.hdv174-field{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border,rgba(0,229,255,.24));border-radius:9px;background:rgba(0,15,32,.65);color:var(--text,#eaf6ff);font:inherit}' +
    '.hdv174-label{display:block;font-size:11px;font-weight:700;letter-spacing:.03em;color:var(--muted,#9fb2c8);margin:0 0 5px}' +
    '.hdv174-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.hdv174-btn{padding:9px 12px;border:1px solid var(--border,rgba(0,229,255,.28));border-radius:9px;color:var(--text,#eaf6ff);background:rgba(0,150,220,.12);font:inherit;font-size:12px;font-weight:700;cursor:pointer}' +
    '.hdv174-btn.primary{background:linear-gradient(135deg,#00d5ed,#62a8ff);border-color:transparent;color:#00121c}' +
    '.hdv174-btn:disabled{opacity:.4;cursor:not-allowed}' +
    '.hdv174-result{padding:15px;border-radius:12px;background:rgba(0,229,255,.09);border:1px solid rgba(0,229,255,.25);min-height:78px}' +
    '.hdv174-result strong{display:block;font-size:clamp(20px,4vw,30px);overflow-wrap:anywhere;color:var(--accent,#00e5ff)}' +
    '.hdv174-history{display:grid;gap:6px;margin-top:8px}' +
    '.hdv174-history-item{padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.04);font-size:12px;overflow-wrap:anywhere}' +
    '.hdv174-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}' +
    '.hdv174-weekday{text-align:center;font-size:10px;color:var(--muted,#9fb2c8);padding:4px 0}' +
    '.hdv174-day{min-width:0;aspect-ratio:1;border:1px solid rgba(130,160,190,.22);border-radius:7px;background:rgba(255,255,255,.035);color:var(--text,#eaf6ff);font:inherit;font-size:11px;cursor:pointer;position:relative}' +
    '.hdv174-day.level-1{background:rgba(0,190,135,.25);border-color:rgba(0,220,150,.4)}' +
    '.hdv174-day.level-2{background:rgba(0,205,135,.45);border-color:rgba(0,230,155,.55)}' +
    '.hdv174-day.level-3{background:rgba(0,220,140,.68);border-color:rgba(0,240,165,.7);color:#001b12}' +
    '.hdv174-day.level-4{background:#00e59b;border-color:#00f0a5;color:#001b12;font-weight:800}' +
    '.hdv174-day:disabled{opacity:.48;cursor:default}' +
    '.hdv174-day.selected{outline:2px solid var(--accent,#00e5ff);outline-offset:1px}' +
    '.hdv174-day.empty{visibility:hidden;pointer-events:none}' +
    '.hdv174-stat{padding:10px;border-radius:10px;background:rgba(255,255,255,.04);min-width:0}' +
    '.hdv174-stat strong{display:block;font-size:22px;color:var(--accent,#00e5ff)}' +
    '.hdv174-stat span{font-size:10px;color:var(--muted,#9fb2c8)}' +
    '@media(max-width:520px){.hdv174-grid{grid-template-columns:1fr}.hdv174-root{padding:9px}.hdv174-calendar{gap:3px}.hdv174-day{font-size:10px}}' +
    '</style>';

  /* --------------------------- UNIT CONVERTER --------------------------- */
  var UNIT_HISTORY_KEY = 'haldo_v174_unit_converter_history';
  var UNIT_CATEGORIES = {
    length: { label:'Länge', units:[
      {id:'mm',label:'Millimeter (mm)',factor:0.001},{id:'cm',label:'Zentimeter (cm)',factor:0.01},
      {id:'m',label:'Meter (m)',factor:1},{id:'km',label:'Kilometer (km)',factor:1000},
      {id:'in',label:'Zoll (in)',factor:0.0254},{id:'ft',label:'Fuß (ft)',factor:0.3048},
      {id:'yd',label:'Yard (yd)',factor:0.9144},{id:'mi',label:'Meile (mi)',factor:1609.344}
    ]},
    mass: { label:'Masse / Gewicht', units:[
      {id:'mg',label:'Milligramm (mg)',factor:0.001},{id:'g',label:'Gramm (g)',factor:1},
      {id:'kg',label:'Kilogramm (kg)',factor:1000},{id:'t',label:'Tonne (t)',factor:1000000},
      {id:'oz',label:'Unze (oz)',factor:28.349523125},{id:'lb',label:'Pfund (lb)',factor:453.59237}
    ]},
    volume: { label:'Volumen', units:[
      {id:'ml',label:'Milliliter (ml)',factor:0.001},{id:'l',label:'Liter (l)',factor:1},
      {id:'m3',label:'Kubikmeter (m³)',factor:1000},{id:'tsp',label:'Teelöffel (US tsp)',factor:0.00492892159375},
      {id:'tbsp',label:'Esslöffel (US tbsp)',factor:0.01478676478125},{id:'gal',label:'US-Gallone (gal)',factor:3.785411784}
    ]},
    area: { label:'Fläche', units:[
      {id:'mm2',label:'Quadratmillimeter (mm²)',factor:0.000001},{id:'cm2',label:'Quadratzentimeter (cm²)',factor:0.0001},
      {id:'m2',label:'Quadratmeter (m²)',factor:1},{id:'ha',label:'Hektar (ha)',factor:10000},
      {id:'km2',label:'Quadratkilometer (km²)',factor:1000000},{id:'ft2',label:'Quadratfuß (ft²)',factor:0.09290304}
    ]},
    speed: { label:'Geschwindigkeit', units:[
      {id:'ms',label:'Meter pro Sekunde (m/s)',factor:1},{id:'kmh',label:'Kilometer pro Stunde (km/h)',factor:1/3.6},
      {id:'mph',label:'Meilen pro Stunde (mph)',factor:0.44704},{id:'knot',label:'Knoten (kn)',factor:0.514444444444}
    ]},
    time: { label:'Zeit', units:[
      {id:'ms',label:'Millisekunde (ms)',factor:0.001},{id:'s',label:'Sekunde (s)',factor:1},
      {id:'min',label:'Minute (min)',factor:60},{id:'h',label:'Stunde (h)',factor:3600},
      {id:'day',label:'Tag (d)',factor:86400},{id:'week',label:'Woche',factor:604800}
    ]},
    temperature: { label:'Temperatur', units:[
      {id:'c',label:'Grad Celsius (°C)',toBase:function(v){return v+273.15;},fromBase:function(v){return v-273.15;}},
      {id:'f',label:'Grad Fahrenheit (°F)',toBase:function(v){return (v+459.67)*5/9;},fromBase:function(v){return v*9/5-459.67;}},
      {id:'k',label:'Kelvin (K)',toBase:function(v){return v;},fromBase:function(v){return v;}}
    ]},
    pressure: { label:'Druck', units:[
      {id:'pa',label:'Pascal (Pa)',factor:1},{id:'kpa',label:'Kilopascal (kPa)',factor:1000},
      {id:'bar',label:'Bar',factor:100000},{id:'mbar',label:'Millibar (mbar)',factor:100},
      {id:'psi',label:'Pound per square inch (psi)',factor:6894.757293168}
    ]},
    digital: { label:'Datenmenge', units:[
      {id:'b',label:'Byte (B)',factor:1},{id:'kb',label:'Kilobyte (KB, 1000 B)',factor:1000},
      {id:'mb',label:'Megabyte (MB, 1000² B)',factor:1000000},{id:'gb',label:'Gigabyte (GB, 1000³ B)',factor:1000000000},
      {id:'kib',label:'Kibibyte (KiB, 1024 B)',factor:1024},{id:'mib',label:'Mebibyte (MiB, 1024² B)',factor:1048576}
    ]}
  };

  function unitById(categoryId, unitId) {
    var category = UNIT_CATEGORIES[categoryId];
    if (!category) return null;
    return category.units.find(function (unit) { return unit.id === unitId; }) || null;
  }

  function toBase(value, unit) {
    return typeof unit.toBase === 'function' ? unit.toBase(value) : value * unit.factor;
  }

  function fromBase(value, unit) {
    return typeof unit.fromBase === 'function' ? unit.fromBase(value) : value / unit.factor;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return '—';
    if (Object.is(value, -0)) value = 0;
    return new Intl.NumberFormat('de-DE', {
      maximumSignificantDigits:12,
      maximumFractionDigits:10
    }).format(value);
  }

  function convertValue(value, categoryId, fromId, toId) {
    if (!Number.isFinite(value)) throw new Error('Bitte eine gültige Zahl eingeben.');
    var source = unitById(categoryId, fromId);
    var target = unitById(categoryId, toId);
    if (!source || !target) throw new Error('Die ausgewählten Einheiten passen nicht zur Kategorie.');
    var baseValue = toBase(value, source);
    if (categoryId === 'temperature' && baseValue < 0) throw new Error('Temperaturen unter dem absoluten Nullpunkt sind nicht zulässig.');
    var result = fromBase(baseValue, target);
    if (!Number.isFinite(result)) throw new Error('Das Ergebnis liegt außerhalb des darstellbaren Zahlenbereichs.');
    return result;
  }

  function openUnitConverter() {
    openWindow('unitconv', '📐 HalDo Einheiten-Umrechner Pro', 720, 700, mountUnitConverter);
  }

  function mountUnitConverter(root) {
    var history = [];
    try {
      var saved = H.Store.get(UNIT_HISTORY_KEY, []);
      if (Array.isArray(saved)) history = saved.slice(0, 20);
    } catch (error) {
      console.warn('[HalDo v174] Unit history could not be read:', error);
    }

    root.innerHTML = CSS +
      '<div class="hdv174-hero"><strong style="font-size:18px">📐 HalDo Einheiten-Umrechner Pro</strong><div class="hdv174-muted">Präzise Umrechnung mit klaren Einheiten · ohne externe Dienste</div></div>' +
      '<div class="hdv174-card">' +
        '<div class="hdv174-grid"><div><label class="hdv174-label" for="hv174-category">Kategorie</label><select class="hdv174-field" id="hv174-category" data-hv174-category>' +
          Object.keys(UNIT_CATEGORIES).map(function (id) { return '<option value="' + esc(id) + '">' + esc(UNIT_CATEGORIES[id].label) + '</option>'; }).join('') +
        '</select></div><div><label class="hdv174-label" for="hv174-value">Ausgangswert</label><input class="hdv174-field" id="hv174-value" data-hv174-value type="number" step="any" value="1" inputmode="decimal"></div></div>' +
        '<div class="hdv174-grid" style="margin-top:10px"><div><label class="hdv174-label" for="hv174-from">Von</label><select class="hdv174-field" id="hv174-from" data-hv174-from></select></div><div><label class="hdv174-label" for="hv174-to">Nach</label><select class="hdv174-field" id="hv174-to" data-hv174-to></select></div></div>' +
        '<div class="hdv174-row" style="margin-top:10px"><button class="hdv174-btn" type="button" data-hv174-swap>⇄ Einheiten tauschen</button><button class="hdv174-btn primary" type="button" data-hv174-save>Im Verlauf speichern</button></div>' +
      '</div>' +
      '<div class="hdv174-result" aria-live="polite"><div class="hdv174-muted">Umrechnungsergebnis</div><strong data-hv174-result>1</strong><div class="hdv174-muted" data-hv174-equation></div><div class="hdv174-muted" data-hv174-status></div></div>' +
      '<div class="hdv174-card" style="margin-top:10px"><div class="hdv174-row" style="justify-content:space-between"><strong>Letzte Umrechnungen</strong><button class="hdv174-btn" type="button" data-hv174-clear-history>Verlauf löschen</button></div><div class="hdv174-history" data-hv174-history></div><p class="hdv174-muted">Der Verlauf wird nur lokal in diesem Browser gespeichert. Keine Umrechnungsdaten werden an HalDo-Server übertragen.</p></div>' +
      '<p class="hdv174-muted">Temperaturen werden über Kelvin umgerechnet. Bei Datenmengen sind dezimale KB/MB (1000er-Schritte) und binäre KiB/MiB (1024er-Schritte) getrennt ausgewiesen.</p>';

    var categorySelect = root.querySelector('[data-hv174-category]');
    var valueInput = root.querySelector('[data-hv174-value]');
    var fromSelect = root.querySelector('[data-hv174-from]');
    var toSelect = root.querySelector('[data-hv174-to]');
    var result = root.querySelector('[data-hv174-result]');
    var equation = root.querySelector('[data-hv174-equation]');
    var status = root.querySelector('[data-hv174-status]');
    var historyRoot = root.querySelector('[data-hv174-history]');
    var currentResult = null;

    function populateUnits(preferredFrom, preferredTo) {
      var category = UNIT_CATEGORIES[categorySelect.value];
      var options = category.units.map(function (unit) {
        return '<option value="' + esc(unit.id) + '">' + esc(unit.label) + '</option>';
      }).join('');
      fromSelect.innerHTML = options;
      toSelect.innerHTML = options;
      fromSelect.value = unitById(categorySelect.value, preferredFrom) ? preferredFrom : category.units[0].id;
      toSelect.value = unitById(categorySelect.value, preferredTo) ? preferredTo : category.units[Math.min(1, category.units.length - 1)].id;
      updateResult();
    }

    function updateResult() {
      var categoryId = categorySelect.value;
      var from = unitById(categoryId, fromSelect.value);
      var to = unitById(categoryId, toSelect.value);
      var value = valueInput.value.trim() === '' ? NaN : Number(valueInput.value);
      currentResult = null;
      if (!Number.isFinite(value)) {
        result.textContent = '—';
        equation.textContent = '';
        status.textContent = 'Bitte eine gültige Zahl eingeben.';
        return;
      }
      try {
        var converted = convertValue(value, categoryId, fromSelect.value, toSelect.value);
        currentResult = {
          category:categoryId,
          categoryLabel:UNIT_CATEGORIES[categoryId].label,
          value:value,
          from:from.id,
          fromLabel:from.label,
          result:converted,
          to:to.id,
          toLabel:to.label
        };
        result.textContent = formatNumber(converted);
        equation.textContent = formatNumber(value) + ' ' + from.id + ' = ' + formatNumber(converted) + ' ' + to.id;
        status.textContent = 'Berechnung abgeschlossen · ' + UNIT_CATEGORIES[categoryId].label;
      } catch (error) {
        result.textContent = '—';
        equation.textContent = '';
        status.textContent = error.message;
      }
    }

    function renderHistory() {
      if (!history.length) {
        historyRoot.textContent = 'Noch keine gespeicherten Umrechnungen.';
        return;
      }
      historyRoot.innerHTML = history.map(function (entry) {
        return '<div class="hdv174-history-item">' +
          '<strong>' + esc(formatNumber(Number(entry.value))) + ' ' + esc(entry.from) + ' → ' + esc(formatNumber(Number(entry.result))) + ' ' + esc(entry.to) + '</strong>' +
          '<div class="hdv174-muted">' + esc(entry.categoryLabel) + ' · ' + esc(new Date(entry.ts).toLocaleString('de-DE')) + '</div>' +
        '</div>';
      }).join('');
    }

    categorySelect.addEventListener('change', function () { populateUnits(); });
    [valueInput, fromSelect, toSelect].forEach(function (control) {
      control.addEventListener('input', updateResult);
      control.addEventListener('change', updateResult);
    });

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-hv174-swap')) {
        var oldFrom = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = oldFrom;
        updateResult();
      } else if (button.hasAttribute('data-hv174-save')) {
        if (!currentResult) { status.textContent = 'Keine gültige Umrechnung zum Speichern vorhanden.'; return; }
        history.unshift(Object.assign({}, currentResult, { ts:Date.now() }));
        history = history.slice(0, 20);
        try { H.Store.set(UNIT_HISTORY_KEY, history); renderHistory(); status.textContent = 'Umrechnung lokal gespeichert.'; }
        catch (error) { status.textContent = 'Verlauf konnte nicht gespeichert werden.'; }
      } else if (button.hasAttribute('data-hv174-clear-history')) {
        history = [];
        try { H.Store.set(UNIT_HISTORY_KEY, history); renderHistory(); status.textContent = 'Verlauf wurde lokal gelöscht.'; }
        catch (error) { status.textContent = 'Verlauf konnte nicht gelöscht werden.'; }
      }
    });

    populateUnits('m', 'km');
    renderHistory();
  }

  /* ----------------------------- HABIT HEATMAP ----------------------------- */
  function pad2(value) { return String(value).padStart(2, '0'); }

  function dateKey(year, monthIndex, day) {
    return String(year) + '-' + pad2(monthIndex + 1) + '-' + pad2(day);
  }

  function parseDateKey(key) {
    var parts = String(key).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function openHabitHeatmap() {
    openWindow('heatmap', '🟩 HalDo Habit Heatmap Pro', 780, 720, mountHabitHeatmap);
  }

  function mountHabitHeatmap(root) {
    if (!H.Habits || typeof H.Habits.all !== 'function' || typeof H.Habits.checkIn !== 'function') {
      root.innerHTML = CSS + '<div class="hdv174-card">HalDo Habits ist derzeit nicht verfügbar. Bitte zuerst den Kern laden.</div>';
      return;
    }

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var selectedHabitId = 'all';

    function allHabits() {
      var items = H.Habits.all();
      return Array.isArray(items) ? items : [];
    }

    function countForDay(habits, key) {
      return habits.reduce(function (count, habit) {
        return count + (habit.checks && habit.checks[key] ? 1 : 0);
      }, 0);
    }

    function monthStats(habits, selectedId, daysInMonth) {
      var selected = selectedId === 'all'
        ? habits
        : habits.filter(function (habit) { return habit.id === selectedId; });
      var today = new Date();
      var lastAvailable = year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : daysInMonth;
      var possible = Math.max(1, lastAvailable) * (selectedId === 'all' ? Math.max(1, selected.length) : 1);
      var total = 0;
      var activeDays = 0;
      for (var day = 1; day <= daysInMonth; day++) {
        var key = dateKey(year, month, day);
        var count = countForDay(selected, key);
        if (selectedId === 'all') total += count;
        else total += count > 0 ? 1 : 0;
        if (count > 0) activeDays += 1;
      }
      return { total:total, activeDays:activeDays, possible:possible, habits:selected };
    }

    function render() {
      var habits = allHabits();
      if (selectedHabitId !== 'all' && !habits.some(function (habit) { return habit.id === selectedHabitId; })) selectedHabitId = 'all';
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
      var monthLabel = new Intl.DateTimeFormat('de-DE', { month:'long', year:'numeric' }).format(new Date(year, month, 1));
      var stats = monthStats(habits, selectedHabitId, daysInMonth);
      var currentHabit = selectedHabitId === 'all' ? null : habits.find(function (habit) { return habit.id === selectedHabitId; });
      var streak = currentHabit && typeof H.Habits.streakOf === 'function' ? H.Habits.streakOf(currentHabit.id) : 0;
      var percent = stats.possible ? Math.round(stats.total / stats.possible * 100) : 0;
      var today = new Date();
      var cells = '';

      for (var empty = 0; empty < firstWeekday; empty++) cells += '<span class="hdv174-day empty" aria-hidden="true"></span>';

      for (var day = 1; day <= daysInMonth; day++) {
        var key = dateKey(year, month, day);
        var completed = selectedHabitId === 'all'
          ? countForDay(habits, key)
          : (currentHabit && currentHabit.checks && currentHabit.checks[key] ? 1 : 0);
        var maxCount = selectedHabitId === 'all' ? Math.max(1, habits.length) : 1;
        var level = completed <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(completed / maxCount * 4)));
        var future = startOfDay(parseDateKey(key)) > startOfDay(today);
        var canToggle = selectedHabitId !== 'all' && !!currentHabit && !future;
        var tooltip = key + ' · ' + completed + (selectedHabitId === 'all' ? ' von ' + habits.length + ' Gewohnheiten' : ' erledigt');
        cells += '<button type="button" class="hdv174-day level-' + level + (canToggle ? '' : ' read-only') + '" data-hv174-day data-hv174-date="' + key + '" title="' + esc(tooltip) + '" aria-label="' + esc(tooltip) + '"' + (canToggle ? '' : ' disabled') + '>' + day + '</button>';
      }

      var weekdays = ['Mo','Di','Mi','Do','Fr','Sa','So'].map(function (dayName) {
        return '<div class="hdv174-weekday">' + dayName + '</div>';
      }).join('');
      var options = '<option value="all">Alle Gewohnheiten · Übersicht</option>' + habits.map(function (habit) {
        return '<option value="' + esc(habit.id) + '">' + esc(habit.icon || '⭐') + ' ' + esc(habit.name) + '</option>';
      }).join('');

      root.innerHTML = CSS +
        '<div class="hdv174-hero"><strong style="font-size:18px">🟩 HalDo Habit Heatmap Pro</strong><div class="hdv174-muted">Deine bestehenden Gewohnheiten als Monatsübersicht · Daten werden aus HalDo Habits übernommen</div></div>' +
        '<div class="hdv174-card"><div class="hdv174-grid"><div><label class="hdv174-label" for="hv174-habit">Gewohnheit</label><select class="hdv174-field" id="hv174-habit" data-hv174-habit>' + options + '</select></div><div><label class="hdv174-label" for="hv174-month">Monat</label><input class="hdv174-field" id="hv174-month" data-hv174-month type="month" value="' + year + '-' + pad2(month + 1) + '"></div></div>' +
          '<div class="hdv174-row" style="margin-top:9px"><button class="hdv174-btn" type="button" data-hv174-prev>← Voriger Monat</button><button class="hdv174-btn" type="button" data-hv174-current>Aktueller Monat</button><button class="hdv174-btn" type="button" data-hv174-next' + (year === now.getFullYear() && month === now.getMonth() ? ' disabled' : '') + '>Nächster Monat →</button></div></div>' +
        '<div class="hdv174-grid"><div class="hdv174-stat"><strong>' + stats.total + '</strong><span>' + (selectedHabitId === 'all' ? 'Check-ins insgesamt' : 'Erledigte Tage') + '</span></div><div class="hdv174-stat"><strong>' + stats.activeDays + '</strong><span>Aktive Tage</span></div><div class="hdv174-stat"><strong>' + percent + '%</strong><span>Erfüllung im Zeitraum</span></div><div class="hdv174-stat"><strong>' + streak + '</strong><span>Aktuelle Serie · Tage</span></div></div>' +
        '<div class="hdv174-card" style="margin-top:10px"><div class="hdv174-row" style="justify-content:space-between;margin-bottom:10px"><strong>' + esc(monthLabel) + '</strong><span class="hdv174-muted">' + (selectedHabitId === 'all' ? 'Gesamtübersicht · nur Anzeige' : 'Einzelne Tage zum Ändern anklicken') + '</span></div>' +
          '<div class="hdv174-calendar">' + weekdays + cells + '</div><div class="hdv174-muted" style="margin-top:10px">Grün = erledigt · Leere Felder = kein Check-in. Zukünftige Tage können nicht abgehakt werden.</div></div>' +
        (habits.length ? '<div class="hdv174-row"><button class="hdv174-btn" type="button" data-hv174-open-habits>Gewohnheiten verwalten</button></div>' :
          '<div class="hdv174-card"><strong>Noch keine Gewohnheiten vorhanden</strong><p class="hdv174-muted">Lege eine Gewohnheit an. Die Heatmap verwendet danach automatisch deren Check-ins.</p><div class="hdv174-row"><input class="hdv174-field" style="flex:1" data-hv174-new-habit placeholder="z. B. Lesen, Spaziergang …"><button class="hdv174-btn primary" type="button" data-hv174-add>Gewohnheit anlegen</button></div></div>') +
        '<p class="hdv174-muted">Die Heatmap legt keine Kopien deiner Gewohnheitsdaten an. Markierungen werden über die bestehende HalDo-Habits-Funktion gespeichert und bleiben dort erhalten.</p>';

      root.querySelector('[data-hv174-habit]').value = selectedHabitId;
      root.querySelector('[data-hv174-habit]').addEventListener('change', function (event) {
        selectedHabitId = event.target.value;
        render();
      });
      root.querySelector('[data-hv174-month]').addEventListener('change', function (event) {
        var value = String(event.target.value || '');
        if (!/^\d{4}-\d{2}$/.test(value)) return;
        var parts = value.split('-').map(Number);
        if (parts[2] === 0 || parts[2] > 12) return;
        year = parts[0]; month = parts[1] - 1;
        render();
      });
      root.querySelector('[data-hv174-prev]').addEventListener('click', function () {
        month -= 1; if (month < 0) { month = 11; year -= 1; } render();
      });
      root.querySelector('[data-hv174-current]').addEventListener('click', function () {
        year = now.getFullYear(); month = now.getMonth(); render();
      });
      var nextButton = root.querySelector('[data-hv174-next]');
      if (nextButton) nextButton.addEventListener('click', function () {
        month += 1; if (month > 11) { month = 0; year += 1; } render();
      });
      root.querySelectorAll('[data-hv174-day]').forEach(function (button) {
        button.addEventListener('click', function () {
          if (!currentHabit || button.disabled) return;
          H.Habits.checkIn(currentHabit.id, button.dataset.hv174Date);
          render();
        });
      });
      var openHabits = root.querySelector('[data-hv174-open-habits]');
      if (openHabits) openHabits.addEventListener('click', function () { H.Habits.open(); });
      var addButton = root.querySelector('[data-hv174-add]');
      if (addButton) addButton.addEventListener('click', function () {
        var input = root.querySelector('[data-hv174-new-habit]');
        var name = input ? input.value.trim() : '';
        if (!name) return;
        var habit = H.Habits.add(name);
        selectedHabitId = habit.id;
        render();
      });
      var newInput = root.querySelector('[data-hv174-new-habit]');
      if (newInput) newInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          root.querySelector('[data-hv174-add]').click();
        }
      });
    }

    render();
  }

  H.unitconv = { open:openUnitConverter, version:BUILD };
  H.heatmap = { open:openHabitHeatmap, version:BUILD };

  H.AppsV174 = {
    version:BUILD,
    appIds:['unitconv','heatmap'],
    status:function () {
      return this.appIds.map(function (id) {
        return { id:id, ready:!!(H[id] && typeof H[id].open === 'function') };
      });
    }
  };

  if (H.AppVoice && typeof H.AppVoice.command === 'function') {
    H.AppVoice.command('haldo-open-unit-converter', ['öffne einheiten umrechner', 'starte einheiten umrechner'], function () {
      H.unitconv.open(); return 'HalDo Einheiten-Umrechner Pro wird geöffnet.';
    });
    H.AppVoice.command('haldo-open-habit-heatmap', ['öffne habit heatmap', 'zeige gewohnheiten heatmap'], function () {
      H.heatmap.open(); return 'HalDo Habit Heatmap Pro wird geöffnet.';
    });
  }

  H.Master = H.Master || {};
  H.Master.version = BUILD;
  console.info('[HalDo v174] Einheiten-Umrechner Pro und Habit Heatmap Pro registriert.');
})();
