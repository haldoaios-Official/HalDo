/* ================================================================
   HALDO AI OS PRO MAX — v169 A–Z Apps
   HalDo Workout Planner Pro + HalDo Werkzeuge Pro
   Local-first storage · input validation · no external services
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var BUILD = '169.0.0';
  if (!H.Win || !H.Store || H.__haldoV169AtoZ) return;
  H.__haldoV169AtoZ = true;

  var WORKOUT_KEY = 'haldo_v169_workout_sessions';
  var UTILITY_HISTORY_KEY = 'haldo_v169_utility_history';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function readStore(key, fallback) {
    try {
      var value = H.Store.get(key, fallback);
      return value == null ? fallback : value;
    } catch (error) {
      console.warn('[HalDo v169] Read failed:', key, error);
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      H.Store.set(key, value);
      return true;
    } catch (error) {
      console.error('[HalDo v169] Save failed:', key, error);
      return false;
    }
  }

  function localDateValue(date) {
    var value = date || new Date();
    return value.getFullYear() + '-' +
      String(value.getMonth() + 1).padStart(2, '0') + '-' +
      String(value.getDate()).padStart(2, '0');
  }

  function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
    var parts = value.split('-').map(Number);
    var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.getUTCFullYear() === parts[0] &&
      date.getUTCMonth() === parts[1] - 1 &&
      date.getUTCDate() === parts[2];
  }

  function parsePositive(value, label, min, max, allowEmpty) {
    var raw = String(value == null ? '' : value).trim();
    if (!raw && allowEmpty) return null;
    var normalized = raw.replace(',', '.');
    var number = Number(normalized);
    if (!raw || !Number.isFinite(number) || number < min || number > max) {
      throw new Error(label + ': bitte einen Wert zwischen ' + min + ' und ' + max + ' eingeben.');
    }
    return number;
  }

  /* --------------------------- WORKOUT PLANNER --------------------------- */

  function readWorkoutSessions() {
    var stored = readStore(WORKOUT_KEY, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter(function (session) {
      return session && typeof session.id === 'string' &&
        typeof session.name === 'string' && isValidDate(session.date) &&
        Array.isArray(session.exercises);
    });
  }

  function openWorkoutPlanner() {
    var id = uid('hdv169-workout');
    H.Win.open('💪 HalDo Workout Planner Pro',
      '<div class="hdv169-root" data-hv169-app="workout" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 820, h: 780 });
    window.setTimeout(function () { mountWorkoutPlanner(id); }, 70);
  }

  function mountWorkoutPlanner(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;

    var sessions = readWorkoutSessions();
    var activeId = sessions.length ? sessions[0].id : null;
    var draft = null;
    var query = '';

    function currentSession() {
      return sessions.find(function (session) { return session.id === activeId; }) || null;
    }

    function totalMinutes() {
      return sessions.reduce(function (sum, session) { return sum + Number(session.duration || 0); }, 0);
    }

    function weekCount() {
      var now = new Date();
      var weekday = (now.getDay() + 6) % 7;
      var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday);
      start.setHours(0, 0, 0, 0);
      return sessions.filter(function (session) {
        var date = new Date(session.date + 'T00:00:00');
        return date >= start && date <= now;
      }).length;
    }

    function setStatus(message, isError) {
      var element = root.querySelector('[data-wk-status]');
      if (!element) return;
      element.textContent = message || '';
      element.classList.toggle('error', !!isError);
    }

    function filteredSessions() {
      var normalized = query.toLocaleLowerCase('de-DE').trim();
      return sessions.filter(function (session) {
        if (!normalized) return true;
        var searchText = [
          session.name, session.date, session.notes,
          (session.exercises || []).map(function (exercise) { return exercise.name; }).join(' ')
        ].join(' ').toLocaleLowerCase('de-DE');
        return searchText.indexOf(normalized) !== -1;
      }).sort(function (a, b) {
        return b.date.localeCompare(a.date) || String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
    }

    function renderList() {
      var list = root.querySelector('[data-wk-list]');
      if (!list) return;
      var visible = filteredSessions();
      list.innerHTML = visible.length ? visible.map(function (session) {
        return '<button type="button" class="hdv169-session' + (session.id === activeId ? ' active' : '') +
          '" data-wk-open="' + esc(session.id) + '">' +
          '<strong>' + esc(session.name) + '</strong>' +
          '<span>' + esc(session.date) + ' · ' + Number(session.exercises.length) + ' Übungen · ' +
          Number(session.duration || 0) + ' min</span></button>';
      }).join('') : '<div class="hdv169-empty">Keine Trainingseinheiten gefunden.</div>';
      var count = root.querySelector('[data-wk-count]');
      if (count) count.textContent = visible.length + ' von ' + sessions.length + ' Einheiten';
    }

    function renderExercises() {
      if (!draft) return '';
      return draft.exercises.map(function (exercise, index) {
        return '<div class="hdv169-exercise" data-wk-exercise="' + index + '">' +
          '<label class="hdv169-label">Übung</label>' +
          '<input class="hdv169-field" data-wk-exercise-name maxlength="100" value="' + esc(exercise.name) + '" placeholder="z. B. Kniebeugen">' +
          '<div class="hdv169-exercise-grid">' +
          '<div><label class="hdv169-label">Sätze</label><input class="hdv169-field" data-wk-sets type="number" min="1" max="60" step="1" value="' + esc(exercise.sets) + '"></div>' +
          '<div><label class="hdv169-label">Wiederholungen</label><input class="hdv169-field" data-wk-reps type="number" min="1" max="1000" step="1" value="' + esc(exercise.reps) + '"></div>' +
          '<div><label class="hdv169-label">Gewicht (kg)</label><input class="hdv169-field" data-wk-weight type="number" min="0" max="2000" step="0.1" value="' + esc(exercise.weight == null ? '' : exercise.weight) + '" placeholder="optional"></div>' +
          '<button type="button" class="hdv169-btn danger" data-wk-remove-exercise="' + index + '" aria-label="Übung entfernen">Entfernen</button>' +
          '</div></div>';
      }).join('');
    }

    function collectDraft() {
      if (!draft) throw new Error('Kein Trainingsentwurf geöffnet.');
      var name = root.querySelector('[data-wk-name]').value.trim();
      var date = root.querySelector('[data-wk-date]').value;
      var durationRaw = root.querySelector('[data-wk-duration]').value;
      var notes = root.querySelector('[data-wk-notes]').value.trim();
      var duration = parsePositive(durationRaw, 'Dauer in Minuten', 0, 1440, true);
      var exercises = Array.prototype.slice.call(root.querySelectorAll('[data-wk-exercise]')).map(function (row) {
        return {
          name: row.querySelector('[data-wk-exercise-name]').value.trim(),
          sets: parsePositive(row.querySelector('[data-wk-sets]').value, 'Sätze', 1, 60, false),
          reps: parsePositive(row.querySelector('[data-wk-reps]').value, 'Wiederholungen', 1, 1000, false),
          weight: parsePositive(row.querySelector('[data-wk-weight]').value, 'Gewicht in kg', 0, 2000, true)
        };
      }).filter(function (exercise) { return exercise.name; });

      if (!name) throw new Error('Bitte einen Namen für die Trainingseinheit eingeben.');
      if (!isValidDate(date)) throw new Error('Bitte ein gültiges Trainingsdatum auswählen.');
      if (!exercises.length) throw new Error('Bitte mindestens eine Übung mit Namen hinzufügen.');
      return {
        id: draft.id,
        name: name,
        date: date,
        duration: duration == null ? 0 : duration,
        notes: notes,
        exercises: exercises,
        createdAt: draft.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    function renderForm() {
      if (!draft) return '';
      return '<section class="hdv169-panel">' +
        '<div class="hdv169-row"><h3>' + (draft.id ? 'Training bearbeiten' : 'Neue Trainingseinheit') + '</h3>' +
        '<button type="button" class="hdv169-btn" data-wk-cancel>Abbrechen</button></div>' +
        '<label class="hdv169-label">Name der Trainingseinheit</label>' +
        '<input class="hdv169-field" data-wk-name maxlength="120" value="' + esc(draft.name) + '" placeholder="z. B. Ganzkörpertraining">' +
        '<div class="hdv169-exercise-grid">' +
        '<div><label class="hdv169-label">Datum</label><input class="hdv169-field" data-wk-date type="date" value="' + esc(draft.date) + '"></div>' +
        '<div><label class="hdv169-label">Dauer (Minuten)</label><input class="hdv169-field" data-wk-duration type="number" min="0" max="1440" step="1" value="' + esc(draft.duration) + '"></div>' +
        '</div><div class="hdv169-row"><h4>Übungen</h4><button type="button" class="hdv169-btn" data-wk-add-exercise>+ Übung</button></div>' +
        '<div data-wk-exercises>' + renderExercises() + '</div>' +
        '<label class="hdv169-label">Notizen</label><textarea class="hdv169-field" data-wk-notes maxlength="2000" rows="3" placeholder="Optionale Notizen zum Training">' + esc(draft.notes) + '</textarea>' +
        '<div class="hdv169-row"><button type="button" class="hdv169-btn primary" data-wk-save>Training speichern</button>' +
        '<span class="hdv169-muted">Alle Angaben bleiben lokal in diesem Browser.</span></div></section>';
    }

    function renderDetail() {
      if (draft) return renderForm();
      var session = currentSession();
      if (!session) return '<section class="hdv169-panel hdv169-empty">Wähle eine gespeicherte Trainingseinheit oder erstelle ein neues Training.</section>';
      return '<section class="hdv169-panel"><div class="hdv169-row"><div><h3>' + esc(session.name) + '</h3>' +
        '<div class="hdv169-muted">' + esc(session.date) + ' · ' + Number(session.duration || 0) + ' Minuten</div></div>' +
        '<div class="hdv169-row"><button type="button" class="hdv169-btn" data-wk-edit>Bearbeiten</button>' +
        '<button type="button" class="hdv169-btn danger" data-wk-delete>Entfernen</button></div></div>' +
        '<ul class="hdv169-exercise-list">' + session.exercises.map(function (exercise) {
          return '<li><strong>' + esc(exercise.name) + '</strong><span>' + Number(exercise.sets) + ' Sätze × ' +
            Number(exercise.reps) + ' Wdh.' + (exercise.weight == null ? '' : ' · ' + Number(exercise.weight) + ' kg') + '</span></li>';
        }).join('') + '</ul>' +
        (session.notes ? '<p class="hdv169-notes">' + esc(session.notes) + '</p>' : '') + '</section>';
    }

    function render() {
      var week = weekCount();
      root.innerHTML = '<style>' +
        '.hdv169{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}' +
        '.hdv169 *{box-sizing:border-box}.hdv169-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}' +
        '.hdv169-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}.hdv169-muted{font-size:11px;opacity:.68}' +
        '.hdv169-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.hdv169-stat{padding:10px;border:1px solid rgba(0,229,255,.16);border-radius:11px;background:rgba(0,15,35,.35)}' +
        '.hdv169-stat strong{display:block;font-size:19px;color:var(--accent,#00e5ff)}.hdv169-layout{display:grid;grid-template-columns:minmax(180px,.75fr) minmax(0,1.5fr);gap:10px}' +
        '.hdv169-panel{padding:13px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.hdv169-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}' +
        '.hdv169-field{width:100%;min-width:0;padding:9px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}.hdv169-label{display:block;margin:8px 0 4px;font-size:11px;opacity:.74}' +
        '.hdv169-btn{padding:8px 11px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}.hdv169-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;font-weight:800;border:0}.hdv169-btn.danger{border-color:rgba(255,100,120,.38);color:#ffb6c0}' +
        '.hdv169-session{display:block;width:100%;padding:10px;margin-top:7px;text-align:left;border:1px solid rgba(0,229,255,.15);border-radius:10px;background:rgba(0,10,28,.35);color:inherit;cursor:pointer}.hdv169-session.active{border-color:var(--accent,#00e5ff);background:rgba(0,170,210,.12)}.hdv169-session strong,.hdv169-session span{display:block}.hdv169-session span{font-size:10px;opacity:.68;margin-top:3px}' +
        '.hdv169-exercise{padding:10px;margin:8px 0;border:1px solid rgba(0,229,255,.14);border-radius:10px}.hdv169-exercise-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;align-items:end}.hdv169-exercise-list{padding-left:20px}.hdv169-exercise-list li{margin:8px 0}.hdv169-exercise-list span{display:block;font-size:11px;opacity:.7}.hdv169-notes{white-space:pre-wrap;overflow-wrap:anywhere}.hdv169-empty{padding:18px;text-align:center;opacity:.7}.hdv169-status{min-height:18px;color:#8fffd0;font-size:11px}.hdv169-status.error{color:#ff9eae}' +
        '@media(max-width:650px){.hdv169-layout{grid-template-columns:1fr}.hdv169-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.hdv169-exercise-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
        '</style><div class="hdv169"><header class="hdv169-hero"><div class="hdv169-title">💪 HalDo Workout Planner Pro</div>' +
        '<div class="hdv169-muted">Trainingseinheiten, Übungen und persönliche Trainingsverläufe lokal dokumentieren. Keine medizinische Trainings- oder Therapieempfehlung.</div>' +
        '<div class="hdv169-stats"><div class="hdv169-stat"><strong>' + sessions.length + '</strong><span>Einheiten gesamt</span></div>' +
        '<div class="hdv169-stat"><strong>' + week + '</strong><span>Diese Woche</span></div>' +
        '<div class="hdv169-stat"><strong>' + totalMinutes() + '</strong><span>Minuten gesamt</span></div></div></header>' +
        '<div class="hdv169-row"><input class="hdv169-field" data-wk-search placeholder="Training oder Übung suchen …" style="max-width:360px" value="' + esc(query) + '">' +
        '<button class="hdv169-btn primary" data-wk-new>+ Neues Training</button></div>' +
        '<div class="hdv169-layout"><aside class="hdv169-panel"><div class="hdv169-row"><strong>Trainingsverlauf</strong><span class="hdv169-muted" data-wk-count></span></div><div data-wk-list></div></aside>' +
        '<main>' + renderDetail() + '<div class="hdv169-status" data-wk-status role="status"></div></main></div></div>';
      renderList();
    }

    root.addEventListener('input', function (event) {
      if (event.target.matches('[data-wk-search]')) {
        query = event.target.value;
        renderList();
      }
    });

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;

      if (button.hasAttribute('data-wk-new')) {
        activeId = null;
        draft = { id: uid('workout'), name: '', date: localDateValue(), duration: 30, notes: '', exercises: [{ name: '', sets: 3, reps: 10, weight: '' }], createdAt: new Date().toISOString() };
        render();
        return;
      }
      if (button.dataset.wkOpen) {
        activeId = button.dataset.wkOpen;
        draft = null;
        render();
        return;
      }
      if (button.hasAttribute('data-wk-edit')) {
        var selected = currentSession();
        if (!selected) return;
        draft = JSON.parse(JSON.stringify(selected));
        render();
        return;
      }
      if (button.hasAttribute('data-wk-add-exercise')) {
        var existingDraft = collectDraft();
        existingDraft.exercises.push({ name: '', sets: 3, reps: 10, weight: '' });
        draft = existingDraft;
        render();
        return;
      }
      if (button.dataset.wkRemoveExercise != null) {
        var edited = collectDraft();
        edited.exercises.splice(Number(button.dataset.wkRemoveExercise), 1);
        draft = edited;
        render();
        return;
      }
      if (button.hasAttribute('data-wk-cancel')) {
        draft = null;
        render();
        return;
      }
      if (button.hasAttribute('data-wk-save')) {
        try {
          var saved = collectDraft();
          var index = sessions.findIndex(function (session) { return session.id === saved.id; });
          if (index >= 0) sessions[index] = saved;
          else sessions.push(saved);
          if (!writeStore(WORKOUT_KEY, sessions)) throw new Error('Der lokale Trainingsplan konnte nicht gespeichert werden.');
          activeId = saved.id;
          draft = null;
          render();
          setStatus('Trainingseinheit gespeichert.');
        } catch (error) {
          setStatus(error.message || 'Training konnte nicht gespeichert werden.', true);
        }
        return;
      }
      if (button.hasAttribute('data-wk-delete')) {
        if (!activeId) return;
        sessions = sessions.filter(function (session) { return session.id !== activeId; });
        if (!writeStore(WORKOUT_KEY, sessions)) {
          setStatus('Die Trainingseinheit konnte nicht entfernt werden.', true);
          return;
        }
        activeId = sessions.length ? sessions[0].id : null;
        render();
        setStatus('Trainingseinheit entfernt.');
      }
    });

    render();
  }

  /* ------------------------------- UTILITIES ------------------------------- */

  var UNIT_GROUPS = {
    length: {
      label: 'Länge',
      units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048 },
      defaults: ['m', 'km']
    },
    mass: {
      label: 'Masse',
      units: { mg: 0.001, g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 },
      defaults: ['g', 'kg']
    },
    volume: {
      label: 'Volumen',
      units: { ml: 1, l: 1000, m3: 1000000, gal: 3785.411784 },
      defaults: ['ml', 'l']
    },
    area: {
      label: 'Fläche',
      units: { 'cm²': 0.0001, 'm²': 1, 'km²': 1000000, 'ft²': 0.09290304 },
      defaults: ['m²', 'cm²']
    },
    speed: {
      label: 'Geschwindigkeit',
      units: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704 },
      defaults: ['km/h', 'm/s']
    },
    temperature: {
      label: 'Temperatur',
      units: { '°C': 'c', '°F': 'f', 'K': 'k' },
      defaults: ['°C', '°F']
    }
  };

  function formatNumber(value) {
    if (!Number.isFinite(value)) return '—';
    var rounded = Number(value.toPrecision(9));
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 6 }).format(rounded);
  }

  function convertUnit(category, from, to, value) {
    var group = UNIT_GROUPS[category];
    if (!group || !Object.prototype.hasOwnProperty.call(group.units, from) ||
        !Object.prototype.hasOwnProperty.call(group.units, to)) {
      throw new Error('Bitte eine gültige Kategorie und Einheit auswählen.');
    }
    if (category === 'temperature') {
      var kelvin = from === '°C' ? value + 273.15 : from === '°F' ? (value - 32) * 5 / 9 + 273.15 : value;
      if (kelvin < 0) throw new Error('Temperaturen unter dem absoluten Nullpunkt sind nicht möglich.');
      return to === '°C' ? kelvin - 273.15 : to === '°F' ? (kelvin - 273.15) * 9 / 5 + 32 : kelvin;
    }
    return value * group.units[from] / group.units[to];
  }

  function openUtilities() {
    var id = uid('hdv169-utilities');
    H.Win.open('🧰 HalDo Werkzeuge Pro',
      '<div class="hdv169-root" data-hv169-app="utilities" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 760, h: 720 });
    window.setTimeout(function () { mountUtilities(id); }, 70);
  }

  function mountUtilities(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var activeTab = 'convert';
    var history = readStore(UTILITY_HISTORY_KEY, []);
    if (!Array.isArray(history)) history = [];

    function addHistory(entry) {
      history.unshift(Object.assign({ id: uid('utility'), at: new Date().toISOString() }, entry));
      history = history.slice(0, 20);
      writeStore(UTILITY_HISTORY_KEY, history);
      renderHistory();
    }

    function setStatus(message, isError) {
      var status = root.querySelector('[data-u-status]');
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('error', !!isError);
    }

    function renderHistory() {
      var list = root.querySelector('[data-u-history]');
      if (!list) return;
      list.innerHTML = history.length ? history.slice(0, 10).map(function (entry) {
        return '<li><span>' + esc(entry.label) + '</span><strong>' + esc(entry.result) + '</strong></li>';
      }).join('') : '<li class="hdv169-empty">Noch keine Berechnungen gespeichert.</li>';
      var count = root.querySelector('[data-u-history-count]');
      if (count) count.textContent = history.length + ' gespeichert';
    }

    function unitOptions(category, selected) {
      var group = UNIT_GROUPS[category];
      return Object.keys(group.units).map(function (unit) {
        return '<option value="' + esc(unit) + '"' + (unit === selected ? ' selected' : '') + '>' + esc(unit) + '</option>';
      }).join('');
    }

    function renderTool() {
      if (activeTab === 'convert') {
        return '<section class="hdv169-panel"><h3>Einheiten umrechnen</h3>' +
          '<label class="hdv169-label">Kategorie</label><select class="hdv169-field" data-u-category>' +
          Object.keys(UNIT_GROUPS).map(function (key) { return '<option value="' + key + '">' + esc(UNIT_GROUPS[key].label) + '</option>'; }).join('') +
          '</select><div class="hdv169-exercise-grid"><div><label class="hdv169-label">Wert</label><input class="hdv169-field" data-u-value type="number" step="any" value="2500"></div>' +
          '<div><label class="hdv169-label">Von</label><select class="hdv169-field" data-u-from></select></div>' +
          '<div><label class="hdv169-label">Nach</label><select class="hdv169-field" data-u-to></select></div></div>' +
          '<button class="hdv169-btn primary" data-u-convert>Umrechnen</button><div class="hdv169-result" data-u-result role="status">Wert und Einheiten auswählen.</div></section>';
      }
      if (activeTab === 'percent') {
        return '<section class="hdv169-panel"><h3>Prozent-Rechner</h3>' +
          '<label class="hdv169-label">Ausgangswert</label><input class="hdv169-field" data-u-percent-base type="number" step="any" value="200">' +
          '<label class="hdv169-label">Prozent (%)</label><input class="hdv169-field" data-u-percent-rate type="number" step="any" value="15">' +
          '<button class="hdv169-btn primary" data-u-percent-calc>Prozent berechnen</button><div class="hdv169-result" data-u-result role="status">Berechne den Prozentwert.</div></section>';
      }
      return '<section class="hdv169-panel"><h3>Datums-Abstand</h3>' +
        '<label class="hdv169-label">Startdatum</label><input class="hdv169-field" data-u-date-start type="date" value="' + localDateValue(new Date(2026, 10, 1)) + '">' +
        '<label class="hdv169-label">Enddatum</label><input class="hdv169-field" data-u-date-end type="date" value="' + localDateValue(new Date(2026, 10, 26)) + '">' +
        '<button class="hdv169-btn primary" data-u-date-calc>Tage berechnen</button><div class="hdv169-result" data-u-result role="status">Berechne den Kalendertag-Abstand.</div>' +
        '<p class="hdv169-muted">Gezählt wird der Abstand zwischen den beiden Kalendertagen, ohne den Starttag zusätzlich einzuschließen.</p></section>';
    }

    function populateUnits() {
      var category = root.querySelector('[data-u-category]');
      var from = root.querySelector('[data-u-from]');
      var to = root.querySelector('[data-u-to]');
      if (!category || !from || !to) return;
      var defaults = UNIT_GROUPS[category.value].defaults;
      from.innerHTML = unitOptions(category.value, defaults[0]);
      to.innerHTML = unitOptions(category.value, defaults[1]);
    }

    function render() {
      root.innerHTML = '<style>' +
        '.hdv169{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.hdv169 *{box-sizing:border-box}' +
        '.hdv169-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.hdv169-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}' +
        '.hdv169-panel{padding:14px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.hdv169-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
        '.hdv169-field{width:100%;min-width:0;padding:9px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}.hdv169-label{display:block;margin:8px 0 4px;font-size:11px;opacity:.74}' +
        '.hdv169-btn{padding:8px 11px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}.hdv169-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;font-weight:800;border:0}' +
        '.hdv169-exercise-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hdv169-result{padding:14px;margin-top:12px;border:1px solid rgba(0,229,255,.22);border-radius:11px;background:rgba(0,150,210,.08);font-size:18px;font-weight:800;color:var(--accent,#00e5ff);overflow-wrap:anywhere}' +
        '.hdv169-muted{font-size:11px;opacity:.68}.hdv169-history{padding-left:20px}.hdv169-history li{margin:7px 0}.hdv169-history li strong{display:block;color:var(--accent,#00e5ff)}.hdv169-status{min-height:18px;font-size:11px;color:#8fffd0}.hdv169-status.error{color:#ff9eae}' +
        '@media(max-width:600px){.hdv169-exercise-grid{grid-template-columns:1fr 1fr}}' +
        '</style><div class="hdv169"><header class="hdv169-hero"><div class="hdv169-title">🧰 HalDo Werkzeuge Pro</div>' +
        '<div class="hdv169-muted">Einheiten, Prozentwerte und Datumsabstände berechnen – lokal, nachvollziehbar und ohne externe Dienste.</div></header>' +
        '<nav class="hdv169-row"><button class="hdv169-btn' + (activeTab === 'convert' ? ' primary' : '') + '" data-u-tab="convert">Einheiten</button>' +
        '<button class="hdv169-btn' + (activeTab === 'percent' ? ' primary' : '') + '" data-u-tab="percent">Prozent</button>' +
        '<button class="hdv169-btn' + (activeTab === 'dates' ? ' primary' : '') + '" data-u-tab="dates">Datums-Abstand</button></nav>' +
        renderTool() +
        '<section class="hdv169-panel"><div class="hdv169-row"><strong>Letzte Berechnungen</strong><span class="hdv169-muted" data-u-history-count></span>' +
        '<button class="hdv169-btn" data-u-clear-history>Verlauf löschen</button></div><ol class="hdv169-history" data-u-history></ol></section>' +
        '<div class="hdv169-status" data-u-status role="status"></div></div>';
      populateUnits();
      renderHistory();
    }

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.uTab) {
        activeTab = button.dataset.uTab;
        render();
        return;
      }
      if (button.hasAttribute('data-u-convert')) {
        try {
          var category = root.querySelector('[data-u-category]').value;
          var from = root.querySelector('[data-u-from]').value;
          var to = root.querySelector('[data-u-to]').value;
          var raw = root.querySelector('[data-u-value]').value;
          var value = parsePositive(raw, 'Wert', -1e12, 1e12, false);
          var converted = convertUnit(category, from, to, value);
          if (!Number.isFinite(converted)) throw new Error('Das Ergebnis ist nicht darstellbar.');
          var result = formatNumber(converted) + ' ' + to;
          root.querySelector('[data-u-result]').textContent = result;
          addHistory({ kind:'Einheiten', label:formatNumber(value) + ' ' + from + ' → ' + to, result:result });
          setStatus('Umrechnung erfolgreich.');
        } catch (error) { setStatus(error.message, true); }
        return;
      }
      if (button.hasAttribute('data-u-percent-calc')) {
        try {
          var base = parsePositive(root.querySelector('[data-u-percent-base]').value, 'Ausgangswert', -1e12, 1e12, false);
          var percent = parsePositive(root.querySelector('[data-u-percent-rate]').value, 'Prozent', -1e6, 1e6, false);
          var amount = base * percent / 100;
          if (!Number.isFinite(amount)) throw new Error('Das Ergebnis ist nicht darstellbar.');
          var percentResult = formatNumber(amount);
          root.querySelector('[data-u-result]').textContent = percentResult;
          addHistory({ kind:'Prozent', label:formatNumber(percent) + ' % von ' + formatNumber(base), result:percentResult });
          setStatus('Prozentwert berechnet.');
        } catch (error) { setStatus(error.message, true); }
        return;
      }
      if (button.hasAttribute('data-u-date-calc')) {
        try {
          var start = root.querySelector('[data-u-date-start]').value;
          var end = root.querySelector('[data-u-date-end]').value;
          if (!isValidDate(start) || !isValidDate(end)) throw new Error('Bitte zwei gültige Kalenderdaten eingeben.');
          var first = start.split('-').map(Number);
          var second = end.split('-').map(Number);
          var firstUtc = Date.UTC(first[0], first[1] - 1, first[2]);
          var secondUtc = Date.UTC(second[0], second[1] - 1, second[2]);
          var days = Math.abs(Math.round((secondUtc - firstUtc) / 86400000));
          var dateResult = days + (days === 1 ? ' Tag' : ' Tage');
          root.querySelector('[data-u-result]').textContent = dateResult;
          addHistory({ kind:'Datums-Abstand', label:start + ' → ' + end, result:dateResult });
          setStatus('Datumsabstand berechnet.');
        } catch (error) { setStatus(error.message, true); }
        return;
      }
      if (button.hasAttribute('data-u-clear-history')) {
        history = [];
        if (!writeStore(UTILITY_HISTORY_KEY, history)) {
          setStatus('Der Verlauf konnte nicht gelöscht werden.', true);
          return;
        }
        renderHistory();
        setStatus('Berechnungsverlauf gelöscht.');
      }
    });

    root.addEventListener('change', function (event) {
      if (event.target.matches('[data-u-category]')) populateUnits();
    });

    render();
  }

  var appDefinitions = [
    { id:'workout', title:'HalDo Workout Planner Pro', icon:'💪', open:openWorkoutPlanner },
    { id:'utilities', title:'HalDo Werkzeuge Pro', icon:'🧰', open:openUtilities }
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
        return (app.id === 'workout' && key === 'G') || (app.id === 'utilities' && key === 'U');
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
  H.AppsV169 = {
    version:BUILD,
    apps:appDefinitions.map(function (app) { return { id:app.id, title:app.title }; }),
    status:function () { return appDefinitions.map(function (app) {
      return { id:app.id, ready:!!(H[app.id] && typeof H[app.id].open === 'function') };
    }); }
  };

  console.info('[HalDo v169] Workout Planner Pro und Werkzeuge Pro registriert.');
})();
