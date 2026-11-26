/* ================================================================
   HALDO AI OS PRO MAX — v171 Date & Device Apps
   HalDo Datumsrechner Pro + HalDo Geräte-Info Pro
   Local-only browser calculations and read-only capabilities
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var BUILD = '171.0.0';
  if (!H.Win || !H.Store || H.__haldoV171DateDevice) return;
  H.__haldoV171DateDevice = true;

  var HISTORY_KEY = 'haldo_v171_datecalc_history';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function localDateValue(date) {
    var d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function parseDate(value, label) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) throw new Error(label + ': bitte ein gültiges Datum auswählen.');
    var year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    var date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error(label + ': das Datum ist ungültig.');
    }
    return date;
  }

  function dateString(date) {
    return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
  }

  function addMonthsClamped(date, months) {
    var originalDay = date.getUTCDate();
    var first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
    var lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(originalDay, lastDay)));
  }

  function addYearsClamped(date, years) {
    return addMonthsClamped(date, years * 12);
  }

  function addDateUnits(date, amount, unit, direction) {
    var signed = amount * (direction === 'subtract' ? -1 : 1);
    var result = new Date(date.getTime());
    if (unit === 'days') result.setUTCDate(result.getUTCDate() + signed);
    else if (unit === 'weeks') result.setUTCDate(result.getUTCDate() + signed * 7);
    else if (unit === 'months') result = addMonthsClamped(result, signed);
    else if (unit === 'years') result = addYearsClamped(result, signed);
    else throw new Error('Bitte eine gültige Zeiteinheit auswählen.');
    return result;
  }

  function weekdayName(date) {
    return new Intl.DateTimeFormat('de-DE', { weekday:'long', timeZone:'UTC' }).format(date);
  }

  function isoWeek(date) {
    var target = new Date(date.getTime());
    target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  }

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function countWorkingDays(start, end) {
    var first = new Date(start.getTime()), last = new Date(end.getTime());
    if (first > last) { var temp = first; first = last; last = temp; }
    var count = 0;
    for (var cursor = new Date(first.getTime() + 86400000); cursor <= last; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      var day = cursor.getUTCDay();
      if (day !== 0 && day !== 6) count += 1;
    }
    return count;
  }

  function readHistory() {
    try {
      var list = H.Store.get(HISTORY_KEY, []);
      return Array.isArray(list) ? list.filter(function (item) { return item && typeof item.label === 'string'; }) : [];
    } catch (_) { return []; }
  }

  function writeHistory(list) {
    try { H.Store.set(HISTORY_KEY, list); return true; }
    catch (error) { console.error('[HalDo v171] History save failed:', error); return false; }
  }

  /* ------------------------------ DATE CALCULATOR ------------------------------ */

  function openDateCalculator() {
    var id = uid('hdv171-datecalc');
    H.Win.open('📅 HalDo Datumsrechner Pro',
      '<div class="hdv171-root" data-hv171-app="datecalc" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 760, h: 740 });
    window.setTimeout(function () { mountDateCalculator(id); }, 70);
  }

  function mountDateCalculator(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var history = readHistory();
    var activeTab = 'add';

    function setStatus(message, isError) {
      var element = root.querySelector('[data-dc-status]');
      if (!element) return;
      element.textContent = message || '';
      element.classList.toggle('error', !!isError);
    }

    function addHistory(label, result) {
      history.unshift({ id:uid('date'), label:label, result:result, at:new Date().toISOString() });
      history = history.slice(0, 20);
      if (!writeHistory(history)) { setStatus('Berechnung wurde angezeigt, der Verlauf konnte aber nicht gespeichert werden.', true); return; }
      renderHistory();
    }

    function renderHistory() {
      var list = root.querySelector('[data-dc-history]');
      if (!list) return;
      list.innerHTML = history.length ? history.slice(0, 10).map(function (item) {
        return '<li><span>' + esc(item.label) + '</span><strong>' + esc(item.result) + '</strong></li>';
      }).join('') : '<li class="hdv171-empty">Noch keine Berechnungen gespeichert.</li>';
      var count = root.querySelector('[data-dc-history-count]');
      if (count) count.textContent = history.length + ' gespeichert';
    }

    function renderTool() {
      if (activeTab === 'add') {
        return '<section class="hdv171-panel"><h3>Datum addieren oder abziehen</h3>' +
          '<label class="hdv171-label">Ausgangsdatum</label><input class="hdv171-field" type="date" data-dc-base value="' + localDateValue() + '">' +
          '<div class="hdv171-grid"><div><label class="hdv171-label">Anzahl</label><input class="hdv171-field" type="number" min="0" max="100000" step="1" value="1" data-dc-amount></div>' +
          '<div><label class="hdv171-label">Einheit</label><select class="hdv171-field" data-dc-unit><option value="days">Tage</option><option value="weeks">Wochen</option><option value="months">Monate</option><option value="years">Jahre</option></select></div>' +
          '<div><label class="hdv171-label">Richtung</label><select class="hdv171-field" data-dc-direction><option value="add">Hinzufügen</option><option value="subtract">Abziehen</option></select></div></div>' +
          '<button type="button" class="hdv171-btn primary" data-dc-calculate>Berechnen</button>' +
          '<div class="hdv171-result" data-dc-result role="status">Wähle Datum und Zeitraum.</div>' +
          '<p class="hdv171-muted">Bei Monats- und Jahreswechseln wird der Kalendertag auf den letzten gültigen Tag des Zielmonats begrenzt.</p></section>';
      }
      if (activeTab === 'difference') {
        return '<section class="hdv171-panel"><h3>Datumsabstand und Arbeitstage</h3>' +
          '<label class="hdv171-label">Startdatum</label><input class="hdv171-field" type="date" data-dc-start value="' + localDateValue() + '">' +
          '<label class="hdv171-label">Enddatum</label><input class="hdv171-field" type="date" data-dc-end value="' + localDateValue() + '">' +
          '<button type="button" class="hdv171-btn primary" data-dc-gap-calc>Abstand berechnen</button>' +
          '<div class="hdv171-result" data-dc-result role="status">Wähle beide Daten.</div>' +
          '<p class="hdv171-muted">Arbeitstage zählen Montag bis Freitag nach dem Startdatum; gesetzliche Feiertage und regionale Sondertage sind nicht abgezogen.</p></section>';
      }
      return '<section class="hdv171-panel"><h3>Kalenderinformationen</h3>' +
        '<label class="hdv171-label">Datum</label><input class="hdv171-field" type="date" data-dc-info-date value="' + localDateValue() + '">' +
        '<button type="button" class="hdv171-btn primary" data-dc-info-calc>Kalenderdaten anzeigen</button>' +
        '<div class="hdv171-result" data-dc-result role="status">Wähle ein Datum.</div></section>';
    }

    function render() {
      root.innerHTML = '<style>' +
        '.hdv171{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.hdv171 *{box-sizing:border-box}' +
        '.hdv171-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.hdv171-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}' +
        '.hdv171-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.hdv171-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hdv171-panel{padding:14px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}' +
        '.hdv171-field{width:100%;min-width:0;padding:9px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}.hdv171-label{display:block;margin:8px 0 4px;font-size:11px;opacity:.74}' +
        '.hdv171-btn{padding:8px 11px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}.hdv171-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;font-weight:800;border:0}' +
        '.hdv171-result{padding:14px;margin-top:12px;border:1px solid rgba(0,229,255,.22);border-radius:11px;background:rgba(0,150,210,.08);font-size:18px;font-weight:800;color:var(--accent,#00e5ff);overflow-wrap:anywhere}.hdv171-muted{font-size:11px;opacity:.68}.hdv171-history{padding-left:20px}.hdv171-history li{margin:7px 0}.hdv171-history li strong{display:block;color:var(--accent,#00e5ff)}.hdv171-status{min-height:18px;font-size:11px;color:#8fffd0}.hdv171-status.error{color:#ff9eae}.hdv171-empty{padding:8px;opacity:.65}' +
        '@media(max-width:580px){.hdv171-grid{grid-template-columns:1fr}}' +
        '</style><div class="hdv171"><header class="hdv171-hero"><div class="hdv171-title">📅 HalDo Datumsrechner Pro</div><div class="hdv171-muted">Kalenderarithmetik, Datumsabstände und Kalenderdaten – lokal und ohne externe Dienste.</div></header>' +
        '<nav class="hdv171-row"><button type="button" class="hdv171-btn' + (activeTab === 'add' ? ' primary' : '') + '" data-dc-tab="add">Datum verschieben</button>' +
        '<button type="button" class="hdv171-btn' + (activeTab === 'difference' ? ' primary' : '') + '" data-dc-tab="difference">Abstand</button>' +
        '<button type="button" class="hdv171-btn' + (activeTab === 'calendar' ? ' primary' : '') + '" data-dc-tab="calendar">Kalenderdaten</button></nav>' +
        renderTool() +
        '<section class="hdv171-panel"><div class="hdv171-row"><strong>Letzte Berechnungen</strong><span class="hdv171-muted" data-dc-history-count></span><button type="button" class="hdv171-btn" data-dc-clear-history>Verlauf löschen</button></div><ol class="hdv171-history" data-dc-history></ol></section>' +
        '<div class="hdv171-status" data-dc-status role="status"></div></div>';
      renderHistory();
    }

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.dcTab) { activeTab = button.dataset.dcTab; render(); return; }
      if (button.hasAttribute('data-dc-calculate')) {
        try {
          var base = parseDate(root.querySelector('[data-dc-base]').value, 'Ausgangsdatum');
          var amount = Number(root.querySelector('[data-dc-amount]').value);
          var unit = root.querySelector('[data-dc-unit]').value;
          var direction = root.querySelector('[data-dc-direction]').value;
          if (!Number.isInteger(amount) || amount < 0 || amount > 100000) throw new Error('Bitte eine ganze Anzahl zwischen 0 und 100.000 eingeben.');
          var resultDate = addDateUnits(base, amount, unit, direction);
          var result = dateString(resultDate) + ' (' + weekdayName(resultDate) + ')';
          root.querySelector('[data-dc-result]').textContent = result;
          addHistory(dateString(base) + ' · ' + (direction === 'add' ? '+' : '−') + amount + ' ' + unit, result);
          setStatus('Datum erfolgreich berechnet.');
        } catch (error) { setStatus(error.message, true); }
        return;
      }
      if (button.hasAttribute('data-dc-gap-calc')) {
        try {
          var start = parseDate(root.querySelector('[data-dc-start]').value, 'Startdatum');
          var end = parseDate(root.querySelector('[data-dc-end]').value, 'Enddatum');
          var rawDays = Math.abs(Math.round((end.getTime() - start.getTime()) / 86400000));
          var workingDays = countWorkingDays(start, end);
          var resultText = rawDays + ' Kalendertage · ' + workingDays + ' Arbeitstage (Mo–Fr)';
          root.querySelector('[data-dc-result]').textContent = resultText;
          addHistory(dateString(start) + ' → ' + dateString(end), resultText);
          setStatus('Datumsabstand berechnet.');
        } catch (error) { setStatus(error.message, true); }
        return;
      }
      if (button.hasAttribute('data-dc-info-calc')) {
        try {
          var date = parseDate(root.querySelector('[data-dc-info-date]').value, 'Datum');
          var year = date.getUTCFullYear();
          var resultInfo = weekdayName(date) + ' · ISO-KW ' + isoWeek(date) + ' · ' +
            (isLeapYear(year) ? 'Schaltjahr' : 'Kein Schaltjahr') + ' · ' + year;
          root.querySelector('[data-dc-result]').textContent = resultInfo;
          addHistory(dateString(date), resultInfo);
          setStatus('Kalenderinformationen berechnet.');
        } catch (error) { setStatus(error.message, true); }
        return;
      }
      if (button.hasAttribute('data-dc-clear-history')) {
        history = [];
        if (!writeHistory(history)) { setStatus('Der Verlauf konnte nicht gelöscht werden.', true); return; }
        renderHistory();
        setStatus('Berechnungsverlauf gelöscht.');
      }
    });

    render();
  }

  /* ------------------------------- DEVICE INFO ------------------------------- */

  function readDeviceSnapshot() {
    var nav = window.navigator || {};
    var screenInfo = window.screen || {};
    var connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
    var storageInfo = nav.storage || null;
    var gl = null;
    try {
      var canvas = document.createElement('canvas');
      gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (_) { gl = null; }

    var capabilities = {
      serviceWorker:!!(nav.serviceWorker),
      webGL:!!gl,
      camera:!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      microphone:!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      bluetoothApi:!!nav.bluetooth,
      geolocationApi:!!nav.geolocation,
      clipboardApi:!!(navigator.clipboard && navigator.clipboard.writeText),
      storageApi:!!(storageInfo && storageInfo.estimate)
    };

    return {
      capturedAt:new Date().toISOString(),
      browser:nav.userAgent || 'Nicht verfügbar',
      platform:nav.userAgentData && nav.userAgentData.platform ? nav.userAgentData.platform : (nav.platform || 'Nicht verfügbar'),
      language:nav.language || 'Nicht verfügbar',
      languages:Array.isArray(nav.languages) ? nav.languages.join(', ') : (nav.language || 'Nicht verfügbar'),
      timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || 'Nicht verfügbar',
      online:typeof nav.onLine === 'boolean' ? nav.onLine : null,
      cookiesEnabled:typeof nav.cookieEnabled === 'boolean' ? nav.cookieEnabled : null,
      cores:Number.isFinite(nav.hardwareConcurrency) ? nav.hardwareConcurrency : null,
      memoryGb:Number.isFinite(nav.deviceMemory) ? nav.deviceMemory : null,
      touchPoints:Number.isFinite(nav.maxTouchPoints) ? nav.maxTouchPoints : 0,
      screen:{ width:screenInfo.width || 0, height:screenInfo.height || 0, availWidth:screenInfo.availWidth || 0, availHeight:screenInfo.availHeight || 0, pixelRatio:window.devicePixelRatio || 1 },
      viewport:{ width:window.innerWidth || 0, height:window.innerHeight || 0 },
      connection:connection ? {
        effectiveType:connection.effectiveType || 'Nicht verfügbar',
        downlink:Number.isFinite(connection.downlink) ? connection.downlink : null,
        rtt:Number.isFinite(connection.rtt) ? connection.rtt : null,
        saveData:typeof connection.saveData === 'boolean' ? connection.saveData : null
      } : null,
      capabilities:capabilities
    };
  }

  function formatBoolean(value) {
    return value === true ? 'Ja' : value === false ? 'Nein' : 'Nicht verfügbar';
  }

  function openDeviceInfo() {
    var id = uid('hdv171-device');
    H.Win.open('📱 HalDo Geräte-Info Pro',
      '<div class="hdv171-root" data-hv171-app="device-info" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 780, h: 760 });
    window.setTimeout(function () { mountDeviceInfo(id); }, 70);
  }

  function mountDeviceInfo(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var snapshot = null;

    function renderSnapshot() {
      if (!snapshot) return;
      var connection = snapshot.connection || {};
      var rows = [
        ['Browserkennung',snapshot.browser],['Plattform',snapshot.platform],['Sprache',snapshot.languages],
        ['Zeitzone',snapshot.timezone],['Online-Verbindung',formatBoolean(snapshot.online)],
        ['Cookies aktiviert',formatBoolean(snapshot.cookiesEnabled)],['CPU-Kerne',snapshot.cores == null ? 'Nicht verfügbar' : snapshot.cores],
        ['Gerätespeicher (GiB, grob)',snapshot.memoryGb == null ? 'Nicht verfügbar' : snapshot.memoryGb],
        ['Touch-Punkte',snapshot.touchPoints],['Bildschirm',snapshot.screen.width + ' × ' + snapshot.screen.height],
        ['Nutzbarer Bildschirm',snapshot.screen.availWidth + ' × ' + snapshot.screen.availHeight],
        ['Fenstergröße',snapshot.viewport.width + ' × ' + snapshot.viewport.height],
        ['Pixelverhältnis',snapshot.screen.pixelRatio],
        ['Verbindungstyp',connection.effectiveType || 'Nicht verfügbar'],
        ['Geschätzter Downlink',connection.downlink == null ? 'Nicht verfügbar' : connection.downlink + ' Mbit/s'],
        ['Geschätzte RTT',connection.rtt == null ? 'Nicht verfügbar' : connection.rtt + ' ms']
      ];
      root.querySelector('[data-di-details]').innerHTML = rows.map(function (row) {
        return '<div class="hdv171-device-row"><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
      }).join('');
      var features = Object.keys(snapshot.capabilities).map(function (key) {
        var labels = {
          serviceWorker:'Service Worker',webGL:'WebGL',camera:'Kamera-API',microphone:'Mikrofon-API',
          bluetoothApi:'Bluetooth-API',geolocationApi:'Standort-API',clipboardApi:'Zwischenablage-API',storageApi:'Speicher-API'
        };
        return '<div class="hdv171-capability"><span>' + esc(labels[key] || key) + '</span><strong>' + (snapshot.capabilities[key] ? 'Verfügbar' : 'Nicht verfügbar') + '</strong></div>';
      }).join('');
      root.querySelector('[data-di-capabilities]').innerHTML = features;
      var captured = root.querySelector('[data-di-captured]');
      if (captured) captured.textContent = new Date(snapshot.capturedAt).toLocaleString('de-DE');
      var storageStatus = root.querySelector('[data-di-storage]');
      if (storageStatus && !snapshot.storage) storageStatus.textContent = 'Speicherbelegung wird vom Browser nicht freigegeben.';
      if (storageStatus && snapshot.storage) storageStatus.textContent =
        'Verwendet ca. ' + (snapshot.storage.usage / 1048576).toFixed(1) + ' MB von ca. ' +
        (snapshot.storage.quota / 1048576).toFixed(1) + ' MB (Browser-Schätzung).';
    }

    async function refresh() {
      snapshot = readDeviceSnapshot();
      snapshot.storage = null;
      renderSnapshot();
      var status = root.querySelector('[data-di-status]');
      if (status) status.textContent = 'Geräteinformationen lokal aktualisiert.';
      try {
        if (navigator.storage && typeof navigator.storage.estimate === 'function') {
          var estimate = await navigator.storage.estimate();
          if (estimate && Number.isFinite(estimate.usage) && Number.isFinite(estimate.quota)) {
            snapshot.storage = { usage:estimate.usage, quota:estimate.quota };
            renderSnapshot();
          }
        }
      } catch (error) {
        if (status) status.textContent = 'Basisinformationen verfügbar; Speicherbelegung nicht freigegeben.';
      }
    }

    root.innerHTML = '<style>' +
      '.hdv171{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.hdv171 *{box-sizing:border-box}.hdv171-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.hdv171-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}' +
      '.hdv171-panel{padding:13px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.hdv171-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.hdv171-muted{font-size:11px;opacity:.68}' +
      '.hdv171-btn{padding:8px 11px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}.hdv171-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;font-weight:800;border:0}' +
      '.hdv171-device-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.hdv171-device-row,.hdv171-capability{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:9px;border:1px solid rgba(0,229,255,.12);border-radius:9px;background:rgba(0,10,28,.3);min-width:0}.hdv171-device-row span,.hdv171-capability span{font-size:11px;opacity:.72;flex:0 0 42%}.hdv171-device-row strong,.hdv171-capability strong{font-size:11px;text-align:right;overflow-wrap:anywhere;min-width:0}.hdv171-status{min-height:18px;font-size:11px;color:#8fffd0}.hdv171-note{font-size:11px;line-height:1.5;opacity:.72}' +
      '@media(max-width:600px){.hdv171-device-grid{grid-template-columns:1fr}}' +
      '</style><div class="hdv171"><header class="hdv171-hero"><div class="hdv171-title">📱 HalDo Geräte-Info Pro</div>' +
      '<div class="hdv171-muted">Lesende Diagnose der Informationen, die dieser Browser freiwillig bereitstellt. Keine Geräte-ID, keine versteckte Abfrage und keine Datenübertragung.</div></header>' +
      '<div class="hdv171-row"><div><strong>Geräteübersicht</strong><div class="hdv171-muted">Erfasst: <span data-di-captured>–</span></div></div><button type="button" class="hdv171-btn primary" data-di-refresh>Aktualisieren</button></div>' +
      '<section class="hdv171-panel"><h3>Browser und Gerät</h3><div class="hdv171-device-grid" data-di-details></div></section>' +
      '<section class="hdv171-panel"><h3>Browser-Funktionen</h3><div class="hdv171-device-grid" data-di-capabilities></div><p class="hdv171-note">„Verfügbar“ bedeutet nur, dass die Browser-API existiert. Kamera, Mikrofon, Bluetooth oder Standort werden hier nicht gestartet und benötigen für eine Nutzung eine separate Nutzeraktion und ggf. Berechtigung.</p>' +
      '<p class="hdv171-note">WLAN-SSID, MAC-Adresse, gekoppelte Bluetooth-Geräte und direkte Funksteuerung werden von einer normalen Webseite nicht ausgelesen oder geschaltet.</p></section>' +
      '<section class="hdv171-panel"><h3>Browser-Speicher</h3><p class="hdv171-note" data-di-storage>Wird geprüft …</p></section>' +
      '<div class="hdv171-status" data-di-status role="status"></div></div>';

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (button && button.hasAttribute('data-di-refresh')) refresh();
    });
    refresh();
  }

  var appDefinitions = [
    { id:'datecalc', title:'HalDo Datumsrechner Pro', icon:'📅', open:openDateCalculator },
    { id:'device-info', title:'HalDo Geräte-Info Pro', icon:'📱', open:openDeviceInfo }
  ];

  appDefinitions.forEach(function (app) {
    H[app.id] = { open:app.open, version:BUILD, isGenericFallback:false };
    if (H.Registry && Array.isArray(H.Registry.featured)) {
      var existing = H.Registry.featured.find(function (item) { return item && item.id === app.id; });
      if (existing) { existing.n = app.title; existing.i = app.icon; }
      else H.Registry.featured.push({ id:app.id, n:app.title, i:app.icon });
    }
  });

  if (H.Master && typeof H.Master.getCategoryApps === 'function') {
    var previousCategoryApps = H.Master.getCategoryApps.bind(H.Master);
    H.Master.getCategoryApps = function (key) {
      var existing = previousCategoryApps(key) || [];
      var additions = appDefinitions.filter(function (app) {
        return (app.id === 'datecalc' && key === 'D') || (app.id === 'device-info' && key === 'X');
      }).map(function (app) { return { id:app.id, name:app.title, icon:app.icon }; });
      var merged = existing.concat(additions);
      return merged.filter(function (item, index) {
        return merged.findIndex(function (other) { return other.id === item.id; }) === index;
      });
    };
  }

  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.namedCoreApps = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured.length : 0;
  H.AppsV171 = {
    version:BUILD,
    apps:appDefinitions.map(function (app) { return { id:app.id, title:app.title }; }),
    status:function () { return appDefinitions.map(function (app) {
      return { id:app.id, ready:!!(H[app.id] && typeof H[app.id].open === 'function') };
    }); }
  };

  console.info('[HalDo v171] Datumsrechner Pro und Geräte-Info Pro registriert.');
})();
