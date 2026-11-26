/* ================================================================
   HALDO AI OS PRO MAX — v172 Learning Apps
   HalDo Atemtrainer Pro + HalDo Wissenschaftsrechner Pro
   Local-first, accessible, no remote services, no dynamic code execution.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var BUILD = '172.0.0';
  if (!H.Win || !H.Store || H.__haldoV172Learning) return;
  H.__haldoV172Learning = true;

  var BREATH_HISTORY_KEY = 'haldo_v172_breathing_history';
  var BREATH_PREFS_KEY = 'haldo_v172_breathing_preferences';
  var SCI_HISTORY_KEY = 'haldo_v172_scientific_history';
  var SCI_PREFS_KEY = 'haldo_v172_scientific_preferences';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function makeId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function readStore(key, fallback) {
    try {
      var value = H.Store.get(key, fallback);
      return value == null ? fallback : value;
    } catch (error) {
      console.warn('[HalDo v172] Store read failed:', error);
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      H.Store.set(key, value);
      return true;
    } catch (error) {
      console.error('[HalDo v172] Store write failed:', error);
      return false;
    }
  }

  function openWindow(title, appId, mount) {
    var id = makeId('hdv172-' + appId);
    H.Win.open(title,
      '<div class="hdv172-root" data-hv172-app="' + esc(appId) + '" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 760, h: 740 });
    window.setTimeout(function () { mount(id); }, 70);
  }

  /* ------------------------------ BREATHING ------------------------------ */

  var BREATH_PATTERNS = {
    calm: {
      id: 'calm', name: 'Ruhige Atmung', description: 'Sanft einatmen und ausatmen · 5 Sekunden je Phase',
      phases: [{ id:'inhale', label:'Einatmen', seconds:5 }, { id:'exhale', label:'Ausatmen', seconds:5 }]
    },
    box: {
      id: 'box', name: 'Box-Atmung', description: 'Gleichmäßige vier Phasen · je 4 Sekunden',
      phases: [
        { id:'inhale', label:'Einatmen', seconds:4 },
        { id:'hold', label:'Sanft halten', seconds:4 },
        { id:'exhale', label:'Ausatmen', seconds:4 },
        { id:'hold2', label:'Pause', seconds:4 }
      ]
    },
    fourSevenEight: {
      id: 'fourSevenEight', name: '4-7-8-Rhythmus', description: 'Ein 4 · sanft halten 7 · aus 8 Sekunden',
      phases: [
        { id:'inhale', label:'Einatmen', seconds:4 },
        { id:'hold', label:'Sanft halten', seconds:7 },
        { id:'exhale', label:'Langsam ausatmen', seconds:8 }
      ]
    }
  };

  function openBreathing() {
    openWindow('🌬️ HalDo Atemtrainer Pro', 'breathing', mountBreathing);
  }

  function mountBreathing(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;

    var prefs = readStore(BREATH_PREFS_KEY, { pattern:'calm', cycles:4 });
    if (!BREATH_PATTERNS[prefs.pattern]) prefs.pattern = 'calm';
    var cycles = Number.isInteger(prefs.cycles) && prefs.cycles >= 1 && prefs.cycles <= 12 ? prefs.cycles : 4;
    var patternId = prefs.pattern;
    var history = readStore(BREATH_HISTORY_KEY, []);
    if (!Array.isArray(history)) history = [];
    var timer = null;
    var active = false;
    var paused = false;
    var phaseIndex = 0;
    var cycleIndex = 0;
    var deadline = 0;
    var remainingMs = 0;
    var sessionStarted = 0;
    var elapsedMs = 0;

    root.innerHTML =
      '<style>' +
      '.h172{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.h172 *{box-sizing:border-box}' +
      '.h172-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.h172-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}.h172-muted{font-size:11px;opacity:.7;line-height:1.55}' +
      '.h172-panel{padding:14px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.h172-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.h172-field{width:100%;min-width:0;padding:10px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}.h172-label{display:block;margin:8px 0 4px;font-size:11px;opacity:.75}' +
      '.h172-btn{padding:9px 13px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;font-weight:700;cursor:pointer}.h172-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;border:0}.h172-btn:disabled{opacity:.45;cursor:not-allowed}' +
      '.h172-breath-stage{display:grid;justify-items:center;gap:10px;padding:18px 10px;text-align:center}.h172-orbit{width:178px;height:178px;border-radius:50%;border:1px solid rgba(0,229,255,.28);display:grid;place-items:center;background:radial-gradient(circle,rgba(0,220,255,.12),rgba(0,12,28,.25));box-shadow:0 0 36px rgba(0,190,255,.12)}.h172-breath-circle{width:94px;height:94px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#c9fbff,#20cbe5 55%,#1760a2);box-shadow:0 0 30px rgba(0,220,255,.4);transform:scale(1);transition:transform .4s ease}.h172-breath-circle[data-phase="inhale"]{transform:scale(1.42)}.h172-breath-circle[data-phase="exhale"]{transform:scale(.78)}.h172-breath-phase{font-size:22px;font-weight:850;color:var(--accent,#00e5ff)}.h172-breath-time{font-size:34px;font-weight:900;font-variant-numeric:tabular-nums}.h172-status{min-height:20px;font-size:11px;color:#8fffd0}.h172-history{display:grid;gap:6px;margin:8px 0 0;padding:0;list-style:none}.h172-history li{display:flex;justify-content:space-between;gap:10px;padding:8px;border-radius:8px;background:rgba(0,10,28,.35);font-size:11px}.h172-history strong{color:var(--accent,#00e5ff);text-align:right}' +
      '@media(prefers-reduced-motion:reduce){.h172-breath-circle{transition:none}}' +
      '</style>' +
      '<div class="h172">' +
      '<header class="h172-hero"><div class="h172-title">🌬️ HalDo Atemtrainer Pro</div><div class="h172-muted">Ruhige, selbstbestimmte Atemrhythmen mit sichtbarer Phasenanzeige. Ohne Anmeldung, ohne externe Dienste.</div></header>' +
      '<section class="h172-panel">' +
      '<div class="h172-row"><div style="flex:1;min-width:210px"><label class="h172-label" for="' + id + '-pattern">Atemrhythmus</label><select class="h172-field" id="' + id + '-pattern" data-b172-pattern><option value="calm">Ruhige Atmung · 5 / 5</option><option value="box">Box-Atmung · 4 / 4 / 4 / 4</option><option value="fourSevenEight">4-7-8-Rhythmus</option></select></div>' +
      '<div style="width:145px"><label class="h172-label" for="' + id + '-cycles">Runden</label><select class="h172-field" id="' + id + '-cycles" data-b172-cycles><option value="2">2 Runden</option><option value="4">4 Runden</option><option value="6">6 Runden</option><option value="8">8 Runden</option><option value="12">12 Runden</option></select></div></div>' +
      '<div class="h172-muted" data-b172-description style="margin-top:8px"></div>' +
      '<div class="h172-breath-stage" aria-live="polite"><div class="h172-orbit"><div class="h172-breath-circle" data-b172-circle data-phase="idle"></div></div><div class="h172-breath-phase" data-b172-phase>Bereit</div><div class="h172-breath-time" data-b172-time>–</div><div class="h172-muted" data-b172-progress>0 / ' + cycles + ' Runden</div></div>' +
      '<div class="h172-row" style="justify-content:center"><button type="button" class="h172-btn primary" data-b172-start>▶ Starten</button><button type="button" class="h172-btn" data-b172-pause disabled>⏸ Pause</button><button type="button" class="h172-btn" data-b172-reset>↺ Zurücksetzen</button></div>' +
      '<div class="h172-status" data-b172-status role="status">Wähle einen Rhythmus und starte, sobald du bereit bist.</div></section>' +
      '<section class="h172-panel"><div class="h172-row" style="justify-content:space-between"><strong>Letzte Einheiten</strong><button type="button" class="h172-btn" data-b172-clear>Verlauf löschen</button></div><ul class="h172-history" data-b172-history></ul></section>' +
      '<p class="h172-muted">Wellness-Hinweis: Atme bequem und ohne Zwang. Beende die Übung sofort, wenn dir schwindelig wird, du Atemnot verspürst oder dich unwohl fühlst. Der Atemtrainer ist kein medizinisches Behandlungsangebot.</p>' +
      '</div>';

    var patternSelect = root.querySelector('[data-b172-pattern]');
    var cycleSelect = root.querySelector('[data-b172-cycles]');
    var phaseLabel = root.querySelector('[data-b172-phase]');
    var timeLabel = root.querySelector('[data-b172-time]');
    var progressLabel = root.querySelector('[data-b172-progress]');
    var circle = root.querySelector('[data-b172-circle]');
    var status = root.querySelector('[data-b172-status]');
    var startButton = root.querySelector('[data-b172-start]');
    var pauseButton = root.querySelector('[data-b172-pause]');
    var description = root.querySelector('[data-b172-description]');

    patternSelect.value = patternId;
    cycleSelect.value = String(cycles);

    function getPattern() { return BREATH_PATTERNS[patternId]; }
    function renderHistory() {
      var list = root.querySelector('[data-b172-history]');
      list.replaceChildren();
      if (!history.length) {
        var empty = document.createElement('li');
        empty.textContent = 'Noch keine Einheiten gespeichert.';
        list.appendChild(empty);
        return;
      }
      history.slice(0, 8).forEach(function (item) {
        var li = document.createElement('li');
        var left = document.createElement('span');
        var right = document.createElement('strong');
        left.textContent = item.pattern + ' · ' + item.cycles + ' Runden';
        right.textContent = new Date(item.completedAt).toLocaleDateString('de-DE') + ' · ' + item.minutes + ' Min.';
        li.append(left, right);
        list.appendChild(li);
      });
    }

    function setStatus(message) { status.textContent = message; }
    function setPhaseDisplay() {
      var phase = getPattern().phases[phaseIndex];
      phaseLabel.textContent = phase ? phase.label : 'Fertig';
      timeLabel.textContent = phase ? String(Math.max(1, Math.ceil(remainingMs / 1000))) : '–';
      circle.dataset.phase = phase ? phase.id : 'idle';
      progressLabel.textContent = Math.min(cycleIndex + 1, cycles) + ' / ' + cycles + ' Runden';
    }

    function stopTimer() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function saveCompletedSession() {
      var minutes = Math.max(1, Math.round(elapsedMs / 60000));
      history.unshift({
        id: makeId('breath'),
        pattern: getPattern().name,
        cycles: cycles,
        minutes: minutes,
        completedAt: new Date().toISOString()
      });
      history = history.slice(0, 30);
      if (!writeStore(BREATH_HISTORY_KEY, history)) {
        setStatus('Einheit abgeschlossen. Der Verlauf konnte nicht gespeichert werden.');
      } else {
        setStatus('Einheit abgeschlossen. Gut gemacht – bleib bei deinem Wohlfühltempo.');
      }
      renderHistory();
    }

    function finishSession() {
      elapsedMs = sessionStarted ? Date.now() - sessionStarted : elapsedMs;
      stopTimer();
      active = false;
      paused = false;
      phaseIndex = 0;
      remainingMs = 0;
      setPhaseDisplay();
      phaseLabel.textContent = 'Abgeschlossen';
      timeLabel.textContent = '✓';
      circle.dataset.phase = 'idle';
      startButton.textContent = '↻ Noch einmal';
      startButton.disabled = false;
      pauseButton.disabled = true;
      pauseButton.textContent = '⏸ Pause';
      patternSelect.disabled = false;
      cycleSelect.disabled = false;
      saveCompletedSession();
    }

    function advancePhase(now) {
      phaseIndex += 1;
      if (phaseIndex >= getPattern().phases.length) {
        phaseIndex = 0;
        cycleIndex += 1;
        if (cycleIndex >= cycles) {
          finishSession();
          return false;
        }
      }
      var phase = getPattern().phases[phaseIndex];
      remainingMs = phase.seconds * 1000;
      deadline = now + remainingMs;
      setPhaseDisplay();
      return true;
    }

    function tick() {
      if (!root.isConnected) {
        stopTimer();
        return;
      }
      var now = Date.now();
      remainingMs = Math.max(0, deadline - now);
      setPhaseDisplay();
      if (remainingMs <= 0) {
        var guard = 0;
        while (now >= deadline && active && guard < 20) {
          var oldDeadline = deadline;
          if (!advancePhase(oldDeadline)) return;
          now = Date.now();
          guard += 1;
        }
      }
    }

    function startSession() {
      if (active && !paused) return;
      if (!active && !paused) {
        patternId = patternSelect.value;
        cycles = Number(cycleSelect.value);
        cycleIndex = 0;
        phaseIndex = 0;
        elapsedMs = 0;
        sessionStarted = Date.now();
        remainingMs = getPattern().phases[0].seconds * 1000;
      } else if (paused) {
        sessionStarted = Date.now() - elapsedMs;
      }
      active = true;
      paused = false;
      deadline = Date.now() + remainingMs;
      startButton.textContent = 'Läuft …';
      startButton.disabled = true;
      pauseButton.disabled = false;
      pauseButton.textContent = '⏸ Pause';
      patternSelect.disabled = true;
      cycleSelect.disabled = true;
      setStatus('Ruhig und bequem atmen. Du bestimmst dein Tempo.');
      if (timer === null) timer = window.setInterval(tick, 200);
      tick();
    }

    function pauseSession() {
      if (!active || paused) return;
      remainingMs = Math.max(0, deadline - Date.now());
      elapsedMs = Date.now() - sessionStarted;
      active = false;
      paused = true;
      stopTimer();
      startButton.textContent = '▶ Fortsetzen';
      startButton.disabled = false;
      pauseButton.textContent = '▶ Fortsetzen';
      pauseButton.disabled = true;
      setPhaseDisplay();
      setStatus('Pausiert. Setze nur fort, wenn du dich wohlfühlst.');
    }

    function resetSession() {
      stopTimer();
      active = false;
      paused = false;
      phaseIndex = 0;
      cycleIndex = 0;
      remainingMs = 0;
      elapsedMs = 0;
      patternSelect.disabled = false;
      cycleSelect.disabled = false;
      startButton.textContent = '▶ Starten';
      startButton.disabled = false;
      pauseButton.textContent = '⏸ Pause';
      pauseButton.disabled = true;
      phaseLabel.textContent = 'Bereit';
      timeLabel.textContent = '–';
      progressLabel.textContent = '0 / ' + cycles + ' Runden';
      circle.dataset.phase = 'idle';
      setStatus('Zurückgesetzt. Starte, sobald du bereit bist.');
    }

    function persistPreferences() {
      if (!writeStore(BREATH_PREFS_KEY, { pattern:patternId, cycles:cycles })) {
        setStatus('Einstellungen konnten nicht gespeichert werden.');
      }
    }

    patternSelect.addEventListener('change', function () {
      if (active || paused) return;
      patternId = patternSelect.value;
      description.textContent = getPattern().description;
      persistPreferences();
      resetSession();
    });

    cycleSelect.addEventListener('change', function () {
      if (active || paused) return;
      cycles = Number(cycleSelect.value);
      progressLabel.textContent = '0 / ' + cycles + ' Runden';
      persistPreferences();
    });

    startButton.addEventListener('click', startSession);
    pauseButton.addEventListener('click', function () {
      if (paused) startSession();
      else pauseSession();
    });
    root.querySelector('[data-b172-reset]').addEventListener('click', resetSession);
    root.querySelector('[data-b172-clear]').addEventListener('click', function () {
      history = [];
      if (writeStore(BREATH_HISTORY_KEY, history)) {
        renderHistory();
        setStatus('Verlauf gelöscht.');
      } else {
        setStatus('Der Verlauf konnte nicht gelöscht werden.');
      }
    });

    description.textContent = getPattern().description;
    setPhaseDisplay();
    renderHistory();
    persistPreferences();
  }

  /* --------------------------- SCIENTIFIC CALCULATOR --------------------------- */

  function safeNumber(value) {
    if (!Number.isFinite(value) || Math.abs(value) > 1e300) {
      throw new Error('Das Ergebnis liegt außerhalb des unterstützten Zahlenbereichs.');
    }
    return value;
  }

  function tokenize(expression) {
    var source = String(expression || '').replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, 'pi').replace(/,/g, '.').trim();
    if (!source) throw new Error('Bitte einen Ausdruck eingeben.');
    if (source.length > 180) throw new Error('Der Ausdruck ist zu lang.');
    var tokens = [];
    var index = 0;
    while (index < source.length) {
      var rest = source.slice(index);
      if (/^\s/.test(rest)) { index += 1; continue; }
      var numberMatch = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i.exec(rest);
      if (numberMatch) {
        tokens.push({ type:'number', value:Number(numberMatch[0]) });
        index += numberMatch[0].length;
        continue;
      }
      var nameMatch = /^[a-z]+/i.exec(rest);
      if (nameMatch) {
        tokens.push({ type:'name', value:nameMatch[0].toLowerCase() });
        index += nameMatch[0].length;
        continue;
      }
      var character = source[index];
      if ('+-*/^%!()'.indexOf(character) >= 0) {
        tokens.push({ type:'operator', value:character });
        index += 1;
        continue;
      }
      throw new Error('Nicht unterstütztes Zeichen: ' + character);
    }
    if (!tokens.length) throw new Error('Bitte einen Ausdruck eingeben.');
    return tokens;
  }

  function parseScientific(expression, angleMode, answer) {
    var tokens = tokenize(expression);
    var position = 0;
    var functions = {
      sin:function (x) { return Math.sin(angleMode === 'DEG' ? x * Math.PI / 180 : x); },
      cos:function (x) { return Math.cos(angleMode === 'DEG' ? x * Math.PI / 180 : x); },
      tan:function (x) {
        var radians = angleMode === 'DEG' ? x * Math.PI / 180 : x;
        if (Math.abs(Math.cos(radians)) < 1e-12) throw new Error('Tangens ist an dieser Stelle nicht definiert.');
        return Math.tan(radians);
      },
      asin:function (x) { if (x < -1 || x > 1) throw new Error('Arcussinus erwartet einen Wert von −1 bis 1.'); var a = Math.asin(x); return angleMode === 'DEG' ? a * 180 / Math.PI : a; },
      acos:function (x) { if (x < -1 || x > 1) throw new Error('Arcuscosinus erwartet einen Wert von −1 bis 1.'); var a = Math.acos(x); return angleMode === 'DEG' ? a * 180 / Math.PI : a; },
      atan:function (x) { var a = Math.atan(x); return angleMode === 'DEG' ? a * 180 / Math.PI : a; },
      sqrt:function (x) { if (x < 0) throw new Error('Die Wurzel aus einer negativen Zahl ist hier nicht definiert.'); return Math.sqrt(x); },
      ln:function (x) { if (x <= 0) throw new Error('Der natürliche Logarithmus erwartet einen Wert größer null.'); return Math.log(x); },
      log:function (x) { if (x <= 0) throw new Error('Der Zehnerlogarithmus erwartet einen Wert größer null.'); return Math.log10(x); },
      abs:function (x) { return Math.abs(x); },
      exp:function (x) { return Math.exp(x); }
    };

    function peek(value) { return position < tokens.length && tokens[position].value === value; }
    function take() { return tokens[position++]; }
    function parseExpression() { return parseAddSubtract(); }
    function parseAddSubtract() {
      var value = parseMultiplyDivide();
      while (peek('+') || peek('-')) {
        var operator = take().value;
        var right = parseMultiplyDivide();
        value = safeNumber(operator === '+' ? value + right : value - right);
      }
      return value;
    }
    function parseMultiplyDivide() {
      var value = parseUnary();
      while (peek('*') || peek('/')) {
        var operator = take().value;
        var right = parseUnary();
        if (operator === '/' && right === 0) throw new Error('Division durch null ist nicht möglich.');
        value = safeNumber(operator === '*' ? value * right : value / right);
      }
      return value;
    }
    function parseUnary() {
      if (peek('+')) { take(); return parseUnary(); }
      if (peek('-')) { take(); return safeNumber(-parseUnary()); }
      return parsePower();
    }
    function parsePower() {
      var base = parsePostfix();
      if (peek('^')) {
        take();
        var exponent = parseUnary();
        base = safeNumber(Math.pow(base, exponent));
      }
      return base;
    }
    function parsePostfix() {
      var value = parsePrimary();
      while (peek('!') || peek('%')) {
        var operator = take().value;
        if (operator === '!') {
          if (value < 0 || !Number.isInteger(value) || value > 170) throw new Error('Fakultät ist nur für ganze Zahlen von 0 bis 170 verfügbar.');
          var factorial = 1;
          for (var n = 2; n <= value; n += 1) factorial *= n;
          value = safeNumber(factorial);
        } else {
          value = safeNumber(value / 100);
        }
      }
      return value;
    }
    function parsePrimary() {
      var token = take();
      if (!token) throw new Error('Der Ausdruck ist unvollständig.');
      if (token.type === 'number') return safeNumber(token.value);
      if (token.type === 'operator' && token.value === '(') {
        var inner = parseExpression();
        if (!peek(')')) throw new Error('Eine schließende Klammer fehlt.');
        take();
        return inner;
      }
      if (token.type === 'name') {
        if (token.value === 'pi') return Math.PI;
        if (token.value === 'e') return Math.E;
        if (token.value === 'ans') return safeNumber(answer || 0);
        if (!functions[token.value]) throw new Error('Unbekannte Funktion oder Konstante: ' + token.value);
        var hasParenthesis = peek('(');
        if (hasParenthesis) take();
        var argument = parseExpression();
        if (hasParenthesis) {
          if (!peek(')')) throw new Error('Nach dem Funktionswert fehlt eine schließende Klammer.');
          take();
        }
        return safeNumber(functions[token.value](argument));
      }
      throw new Error('Unerwartetes Zeichen im Ausdruck.');
    }

    var result = parseExpression();
    if (position !== tokens.length) throw new Error('Der Ausdruck enthält zusätzliche oder fehlerhafte Zeichen.');
    return safeNumber(result);
  }

  function formatNumber(value) {
    if (Object.is(value, -0)) value = 0;
    return String(Number(value.toPrecision(12)));
  }

  function openScientific() {
    openWindow('🔬 HalDo Wissenschaftsrechner Pro', 'scientific', mountScientific);
  }

  function mountScientific(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var prefs = readStore(SCI_PREFS_KEY, { angleMode:'DEG' });
    var angleMode = prefs.angleMode === 'RAD' ? 'RAD' : 'DEG';
    var answer = Number(readStore('haldo_v172_scientific_answer', 0));
    if (!Number.isFinite(answer)) answer = 0;
    var history = readStore(SCI_HISTORY_KEY, []);
    if (!Array.isArray(history)) history = [];
    var expressionInput;
    var resultElement;
    var statusElement;

    root.innerHTML =
      '<style>' +
      '.h172{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.h172 *{box-sizing:border-box}' +
      '.h172-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.h172-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}.h172-muted{font-size:11px;opacity:.7;line-height:1.55}' +
      '.h172-panel{padding:14px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.h172-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.h172-field{width:100%;min-width:0;padding:10px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}.h172-label{display:block;margin:8px 0 4px;font-size:11px;opacity:.75}' +
      '.h172-btn{padding:9px 13px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;font-weight:700;cursor:pointer}.h172-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;border:0}.h172-btn:disabled{opacity:.45;cursor:not-allowed}' +
      '.h172-expression{font-size:22px;font-weight:750;text-align:right;font-variant-numeric:tabular-nums}.h172-result{min-height:48px;padding:12px;text-align:right;border:1px solid rgba(0,229,255,.2);border-radius:10px;background:rgba(0,10,28,.42);color:var(--accent,#00e5ff);font-size:25px;font-weight:900;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.h172-keypad{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.h172-key{padding:12px 4px;border:1px solid rgba(0,229,255,.16);border-radius:9px;background:rgba(0,10,28,.42);color:inherit;font:inherit;font-weight:750;cursor:pointer}.h172-key.function{color:#ffdb7d}.h172-key.operator{color:#78e9fa}.h172-status{min-height:20px;font-size:11px;color:#8fffd0}.h172-history{display:grid;gap:5px;margin:8px 0 0;padding:0;list-style:none}.h172-history li{padding:8px;border-radius:8px;background:rgba(0,10,28,.35)}.h172-history button{width:100%;display:flex;justify-content:space-between;gap:8px;border:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.h172-history strong{color:var(--accent,#00e5ff)}' +
      '@media(max-width:520px){.h172-keypad{gap:4px}.h172-key{padding:11px 2px;font-size:11px}}' +
      '</style>' +
      '<div class="h172">' +
      '<header class="h172-hero"><div class="h172-title">🔬 HalDo Wissenschaftsrechner Pro</div><div class="h172-muted">Wissenschaftliche Berechnungen mit sicherem Ausdrucksparser. Keine dynamische Codeausführung und keine externen Dienste.</div></header>' +
      '<section class="h172-panel"><div class="h172-row" style="justify-content:space-between"><strong>Winkelmaß</strong><button type="button" class="h172-btn" data-s172-angle>' + angleMode + '</button></div>' +
      '<label class="h172-label" for="' + id + '-expression">Ausdruck</label><input id="' + id + '-expression" class="h172-field h172-expression" data-s172-expression type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="z. B. sqrt(81)+sin(30)">' +
      '<button type="button" class="h172-btn primary" data-s172-calculate style="width:100%;margin-top:8px">= Berechnen</button>' +
      '<div class="h172-result" data-s172-result aria-live="polite">0</div>' +
      '<div class="h172-status" data-s172-status role="status"></div></section>' +
      '<section class="h172-panel"><div class="h172-keypad" data-s172-keypad>' +
      [['sin(','cos(','tan(','asin(','acos(','atan('],
       ['sqrt(','ln(','log(','abs(','exp(','^'],
       ['7','8','9','÷','(',')'],
       ['4','5','6','×','π','e'],
       ['1','2','3','−','!','%'],
       ['0','.','Ans','+','⌫','AC']].map(function (row) {
         return row.map(function (key) {
           var kind = /^[0-9.]$/.test(key) ? '' : ['+','−','×','÷','^','!','%','='].indexOf(key) >= 0 ? 'operator' : 'function';
           return '<button type="button" class="h172-key ' + kind + '" data-s172-key="' + esc(key) + '">' + esc(key) + '</button>';
         }).join('');
       }).join('') +
      '</div><p class="h172-muted" style="margin-top:8px">Unterstützt Klammern, Potenzen, Fakultät, Prozent, π, e, Ans, trigonometrische Funktionen sowie ln und log. Dezimalpunkt oder Dezimalkomma möglich.</p></section>' +
      '<section class="h172-panel"><div class="h172-row" style="justify-content:space-between"><strong>Letzte Berechnungen</strong><button type="button" class="h172-btn" data-s172-clear-history>Verlauf löschen</button></div><ul class="h172-history" data-s172-history></ul></section>' +
      '</div>';

    expressionInput = root.querySelector('[data-s172-expression]');
    resultElement = root.querySelector('[data-s172-result]');
    statusElement = root.querySelector('[data-s172-status]');

    function setStatus(message, isError) {
      statusElement.textContent = message || '';
      statusElement.style.color = isError ? '#ff9eae' : '#8fffd0';
    }

    function renderHistory() {
      var list = root.querySelector('[data-s172-history]');
      list.replaceChildren();
      if (!history.length) {
        var empty = document.createElement('li');
        empty.textContent = 'Noch keine Berechnungen gespeichert.';
        list.appendChild(empty);
        return;
      }
      history.slice(0, 10).forEach(function (entry) {
        var li = document.createElement('li');
        var button = document.createElement('button');
        var expression = document.createElement('span');
        var result = document.createElement('strong');
        expression.textContent = entry.expression;
        result.textContent = entry.result;
        button.type = 'button';
        button.dataset.s172History = entry.expression;
        button.append(expression, result);
        li.appendChild(button);
        list.appendChild(li);
      });
    }

    function calculate() {
      try {
        var result = parseScientific(expressionInput.value, angleMode, answer);
        var formatted = formatNumber(result);
        answer = result;
        resultElement.textContent = formatted;
        setStatus('Berechnung erfolgreich.');
        history.unshift({ expression:expressionInput.value, result:formatted, at:new Date().toISOString() });
        history = history.slice(0, 40);
        writeStore('haldo_v172_scientific_answer', answer);
        if (!writeStore(SCI_HISTORY_KEY, history)) setStatus('Ergebnis berechnet; der Verlauf konnte nicht gespeichert werden.', true);
        renderHistory();
      } catch (error) {
        resultElement.textContent = '–';
        setStatus(error.message || 'Der Ausdruck konnte nicht berechnet werden.', true);
      }
    }

    root.querySelector('[data-s172-calculate]').addEventListener('click', calculate);
    root.querySelector('[data-s172-angle]').addEventListener('click', function () {
      angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
      this.textContent = angleMode;
      writeStore(SCI_PREFS_KEY, { angleMode:angleMode });
      setStatus('Winkelmaß auf ' + angleMode + ' gestellt.');
    });
    root.querySelector('[data-s172-keypad]').addEventListener('click', function (event) {
      var button = event.target.closest('[data-s172-key]');
      if (!button) return;
      var key = button.dataset.s172Key;
      if (key === 'AC') {
        expressionInput.value = '';
        resultElement.textContent = '0';
        setStatus('Eingabe gelöscht.');
      } else if (key === '⌫') {
        expressionInput.value = expressionInput.value.slice(0, -1);
        expressionInput.focus();
      } else {
        expressionInput.value += key;
        expressionInput.focus();
      }
    });
    expressionInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); calculate(); }
    });
    root.querySelector('[data-s172-history]').addEventListener('click', function (event) {
      var button = event.target.closest('[data-s172-history]');
      if (!button) return;
      expressionInput.value = button.dataset.s172History;
      calculate();
    });
    root.querySelector('[data-s172-clear-history]').addEventListener('click', function () {
      history = [];
      if (writeStore(SCI_HISTORY_KEY, history)) {
        renderHistory();
        setStatus('Berechnungsverlauf gelöscht.');
      } else {
        setStatus('Der Berechnungsverlauf konnte nicht gelöscht werden.', true);
      }
    });
    renderHistory();
  }

  var appDefinitions = [
    { id:'breathing', title:'HalDo Atemtrainer Pro', icon:'🌬️', open:openBreathing },
    { id:'scientific', title:'HalDo Wissenschaftsrechner Pro', icon:'🔬', open:openScientific }
  ];

  appDefinitions.forEach(function (app) {
    H[app.id] = { open:app.open, version:BUILD, isGenericFallback:false, implementationKind:'module' };
    if (H.Registry && Array.isArray(H.Registry.featured)) {
      var existing = H.Registry.featured.find(function (item) { return item && item.id === app.id; });
      if (existing) { existing.n = app.title; existing.i = app.icon; }
      else H.Registry.featured.push({ id:app.id, n:app.title, i:app.icon });
    }
  });

  if (H.Master && typeof H.Master.getCategoryApps === 'function') {
    var previousCategoryApps = H.Master.getCategoryApps.bind(H.Master);
    H.Master.getCategoryApps = function (key) {
      var additions = appDefinitions.filter(function (app) {
        return (app.id === 'breathing' && key === 'Y') ||
          (app.id === 'scientific' && (key === 'I' || key === 'Q'));
      }).map(function (app) { return { id:app.id, name:app.title, icon:app.icon }; });
      var merged = (previousCategoryApps(key) || []).concat(additions);
      return merged.filter(function (item, index) {
        return merged.findIndex(function (other) { return other.id === item.id; }) === index;
      });
    };
  }

  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.namedCoreApps = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured.length : 0;
  H.AppsV172 = {
    version:BUILD,
    apps:appDefinitions.map(function (app) { return { id:app.id, title:app.title }; }),
    status:function () {
      return appDefinitions.map(function (app) {
        return { id:app.id, ready:!!(H[app.id] && typeof H[app.id].open === 'function') };
      });
    }
  };

  console.info('[HalDo v172] Atemtrainer Pro und Wissenschaftsrechner Pro registriert.');
})();
