/* ================================================================
   HALDO AI OS PRO MAX — v168 Core Apps
   HalDo Weltuhr Pro + HalDo Rezept-Skalierung Pro
   Local persistence · validated input · no third-party services
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var BUILD = '168.0.0';
  var WORLD_KEY = 'haldo_v168_world_clock_zones';
  var RECIPE_KEY = 'haldo_v168_recipes';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function makeId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function storeGet(key, fallback) {
    try {
      var value = H.Store.get(key, fallback);
      return value == null ? fallback : value;
    } catch (error) {
      console.warn('[HalDo v168] Read failed:', key, error);
      return fallback;
    }
  }

  function storeSet(key, value) {
    try {
      H.Store.set(key, value);
      return true;
    } catch (error) {
      console.error('[HalDo v168] Save failed:', key, error);
      return false;
    }
  }

  function installStyles() {
    if (document.getElementById('haldo-v168-core-styles')) return;
    var style = document.createElement('style');
    style.id = 'haldo-v168-core-styles';
    style.textContent = [
      '.hdv168{display:grid;grid-template-columns:250px minmax(0,1fr);gap:12px;color:var(--text,#eaf7ff);font:13px/1.5 system-ui,sans-serif;min-height:500px}',
      '.hdv168 *{box-sizing:border-box}.hdv168-panel{background:rgba(8,24,48,.58);border:1px solid rgba(0,229,255,.18);border-radius:14px;padding:13px;min-width:0}',
      '.hdv168-hero{padding:15px;border:1px solid rgba(0,229,255,.25);border-radius:15px;background:linear-gradient(120deg,rgba(14,165,233,.17),rgba(139,92,246,.16));margin-bottom:12px}',
      '.hdv168-title{font-size:17px;font-weight:800;color:var(--accent,#00e5ff)}.hdv168-muted{opacity:.68;font-size:11px}',
      '.hdv168-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.hdv168-row>*{min-width:0}',
      '.hdv168-field{width:100%;min-width:0;border:1px solid rgba(0,229,255,.22);border-radius:9px;background:rgba(0,8,24,.6);color:inherit;padding:9px;font:inherit}',
      '.hdv168-label{display:block;font-size:11px;opacity:.72;margin:8px 0 4px}',
      '.hdv168-btn{border:1px solid rgba(0,229,255,.28);border-radius:9px;padding:9px 12px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}',
      '.hdv168-btn.primary{background:linear-gradient(110deg,#00d8ef,#5ca8ff);color:#031320;font-weight:800;border:0}',
      '.hdv168-btn.danger{border-color:rgba(255,100,120,.4);color:#ffb6c0;background:rgba(255,70,100,.09)}',
      '.hdv168-btn:disabled{opacity:.4;cursor:not-allowed}',
      '.hdv168-clock-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;margin-top:12px}',
      '.hdv168-clock{border:1px solid rgba(0,229,255,.2);border-radius:13px;background:rgba(0,12,30,.55);padding:12px;min-width:0}',
      '.hdv168-clock-city{font-weight:800;font-size:14px}.hdv168-clock-time{font-size:27px;letter-spacing:1px;font-weight:800;color:var(--accent,#00e5ff);font-variant-numeric:tabular-nums;margin:7px 0}',
      '.hdv168-clock-date{font-size:11px;opacity:.7}.hdv168-clock-zone{font-size:10px;opacity:.55;overflow-wrap:anywhere}',
      '.hdv168-list{display:grid;gap:7px}.hdv168-list-item{display:flex;align-items:center;justify-content:space-between;gap:7px;padding:9px;border:1px solid rgba(0,229,255,.15);border-radius:10px;background:rgba(0,10,25,.35)}',
      '.hdv168-list-item.active{border-color:var(--accent,#00e5ff);background:rgba(0,190,230,.12)}',
      '.hdv168-main{min-width:0}.hdv168-ingredient{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(80px,.65fr) minmax(70px,.5fr) auto;gap:7px;align-items:end;margin:7px 0}',
      '.hdv168-scaled{width:100%;border-collapse:collapse;margin:10px 0}.hdv168-scaled th,.hdv168-scaled td{text-align:left;padding:8px;border-bottom:1px solid rgba(0,229,255,.14)}.hdv168-scaled th{font-size:10px;opacity:.65}',
      '.hdv168-stat{border:1px solid rgba(0,229,255,.2);background:rgba(0,160,220,.07);border-radius:10px;padding:9px;min-width:90px}',
      '.hdv168-status{min-height:18px;margin-top:8px;color:#8fffd0;font-size:11px}.hdv168-status.error{color:#ff9eae}',
      '@media(max-width:680px){.hdv168{grid-template-columns:1fr}.hdv168-ingredient{grid-template-columns:1fr 1fr}.hdv168-ingredient [data-rs-ingredient-name]{grid-column:1/-1}}'
    ].join('');
    document.head.appendChild(style);
  }

  /* --------------------------- WORLD CLOCK --------------------------- */
  var DEFAULT_ZONES = [
    { id: 'berlin', city: 'Berlin', timeZone: 'Europe/Berlin' },
    { id: 'london', city: 'London', timeZone: 'Europe/London' },
    { id: 'new-york', city: 'New York', timeZone: 'America/New_York' },
    { id: 'tokyo', city: 'Tokyo', timeZone: 'Asia/Tokyo' }
  ];

  var ZONE_CHOICES = [
    ['Europe/Berlin', 'Berlin'], ['Europe/London', 'London'], ['Europe/Paris', 'Paris'],
    ['Europe/Madrid', 'Madrid'], ['Europe/Rome', 'Rom'], ['Europe/Istanbul', 'Istanbul'],
    ['America/New_York', 'New York'], ['America/Los_Angeles', 'Los Angeles'],
    ['America/Chicago', 'Chicago'], ['America/Toronto', 'Toronto'],
    ['Asia/Dubai', 'Dubai'], ['Asia/Riyadh', 'Riad'], ['Asia/Jerusalem', 'Jerusalem'],
    ['Asia/Kolkata', 'Kolkata'], ['Asia/Singapore', 'Singapur'], ['Asia/Tokyo', 'Tokio'],
    ['Asia/Seoul', 'Seoul'], ['Asia/Shanghai', 'Shanghai'],
    ['Australia/Sydney', 'Sydney'], ['Pacific/Auckland', 'Auckland'], ['UTC', 'UTC']
  ];

  function isValidTimeZone(timeZone) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timeZone });
      return true;
    } catch (_) {
      return false;
    }
  }

  function readZones() {
    var value = storeGet(WORLD_KEY, null);
    if (!Array.isArray(value)) {
      storeSet(WORLD_KEY, DEFAULT_ZONES);
      return DEFAULT_ZONES.map(function (zone) { return Object.assign({}, zone); });
    }
    return value.filter(function (zone) {
      return zone && typeof zone.id === 'string' &&
        typeof zone.city === 'string' && typeof zone.timeZone === 'string' &&
        isValidTimeZone(zone.timeZone);
    });
  }

  function formatZone(timeZone, date) {
    return {
      time: new Intl.DateTimeFormat('de-DE', {
        timeZone: timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      }).format(date),
      date: new Intl.DateTimeFormat('de-DE', {
        timeZone: timeZone, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      }).format(date)
    };
  }

  function openWorldClock() {
    installStyles();
    var id = makeId('hdv168-world-clock');
    H.Win.open('🌐 HalDo Weltuhr Pro',
      '<div class="hdv168-root" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 780, h: 740 });
    window.setTimeout(function () { mountWorldClock(id); }, 60);
  }

  function mountWorldClock(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var zones = readZones();
    var search = '';

    function setStatus(message, isError) {
      var status = root.querySelector('[data-wc-status]');
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('error', !!isError);
    }

    function render() {
      var choiceHtml = ZONE_CHOICES.map(function (item) {
        var alreadyAdded = zones.some(function (zone) { return zone.timeZone === item[0]; });
        return '<option value="' + esc(item[0]) + '"' + (alreadyAdded ? ' disabled' : '') + '>' +
          esc(item[1]) + ' · ' + esc(item[0]) + (alreadyAdded ? ' (bereits vorhanden)' : '') + '</option>';
      }).join('');

      var cards = zones.map(function (zone) {
        return '<article class="hdv168-clock" data-wc-card="' + esc(zone.id) + '">' +
          '<div class="hdv168-row" style="justify-content:space-between"><div class="hdv168-clock-city">' + esc(zone.city) + '</div>' +
          '<button class="hdv168-btn danger" type="button" data-wc-remove="' + esc(zone.id) + '" aria-label="' + esc(zone.city) + ' entfernen">Entfernen</button></div>' +
          '<div class="hdv168-clock-time" data-wc-time="' + esc(zone.id) + '" aria-live="off">--:--:--</div>' +
          '<div class="hdv168-clock-date" data-wc-date="' + esc(zone.id) + '">Datum wird geladen …</div>' +
          '<div class="hdv168-clock-zone">' + esc(zone.timeZone) + '</div></article>';
      }).join('');

      root.innerHTML =
        '<div class="hdv168">' +
          '<main class="hdv168-main">' +
            '<div class="hdv168-hero"><div class="hdv168-title">🌐 HalDo Weltuhr Pro</div>' +
            '<div class="hdv168-muted">Weltzeiten nach gültigen IANA-Zeitzonen · Sommerzeit wird automatisch vom Browser berücksichtigt</div></div>' +
            '<div class="hdv168-panel">' +
              '<div class="hdv168-title" style="font-size:13px">Zeitzone hinzufügen</div>' +
              '<div class="hdv168-row" style="margin-top:8px">' +
                '<select class="hdv168-field" data-wc-select style="flex:1"><option value="">Zeitzone auswählen …</option>' + choiceHtml + '</select>' +
                '<button class="hdv168-btn primary" type="button" data-wc-add>Hinzufügen</button>' +
              '</div>' +
              '<label class="hdv168-label" for="' + esc(id) + '-custom-zone">Oder IANA-Zeitzone eingeben</label>' +
              '<div class="hdv168-row"><input class="hdv168-field" id="' + esc(id) + '-custom-zone" data-wc-custom placeholder="z. B. America/Vancouver" style="flex:1">' +
                '<input class="hdv168-field" data-wc-city placeholder="Anzeigename" aria-label="Stadtname" style="flex:1">' +
                '<button class="hdv168-btn" type="button" data-wc-add-custom>Eigene Zone</button></div>' +
              '<input class="hdv168-field" data-wc-search placeholder="Städte oder Zeitzonen filtern …" style="margin-top:8px">' +
              '<div class="hdv168-status" data-wc-status aria-live="polite">Alle Uhrzeiten werden lokal im Browser berechnet.</div>' +
            '</div>' +
            '<div class="hdv168-clock-grid" data-wc-grid>' + (cards || '<div class="hdv168-panel hdv168-muted">Noch keine Zeitzonen gespeichert. Füge eine Stadt hinzu.</div>') + '</div>' +
          '</main>' +
        '</div>';

      updateTimes();
      applySearch();
    }

    function updateTimes() {
      var now = new Date();
      zones.forEach(function (zone) {
        var timeElement = root.querySelector('[data-wc-time="' + zone.id + '"]');
        var dateElement = root.querySelector('[data-wc-date="' + zone.id + '"]');
        if (!timeElement || !dateElement) return;
        try {
          var formatted = formatZone(zone.timeZone, now);
          timeElement.textContent = formatted.time;
          dateElement.textContent = formatted.date;
        } catch (_) {
          timeElement.textContent = '--:--:--';
          dateElement.textContent = 'Zeitzone nicht verfügbar';
        }
      });
    }

    function applySearch() {
      var query = search.toLocaleLowerCase('de-DE').trim();
      root.querySelectorAll('[data-wc-card]').forEach(function (card) {
        var zone = zones.find(function (item) { return item.id === card.dataset.wcCard; });
        var haystack = zone ? (zone.city + ' ' + zone.timeZone).toLocaleLowerCase('de-DE') : '';
        card.hidden = !!query && haystack.indexOf(query) === -1;
      });
    }

    function saveAndRender(message) {
      if (!storeSet(WORLD_KEY, zones)) {
        setStatus('Speichern fehlgeschlagen. Prüfe den verfügbaren lokalen Speicher.', true);
        return;
      }
      render();
      setStatus(message || 'Zeitzonen gespeichert.');
    }

    function addZone(timeZone, city) {
      timeZone = String(timeZone || '').trim();
      if (!timeZone || !isValidTimeZone(timeZone)) {
        setStatus('Ungültige Zeitzone. Verwende einen gültigen IANA-Namen, z. B. Europe/Berlin.', true);
        return;
      }
      if (zones.some(function (zone) { return zone.timeZone === timeZone; })) {
        setStatus('Diese Zeitzone ist bereits in deiner Weltuhr vorhanden.', true);
        return;
      }
      var defaultCity = timeZone.split('/').pop().replace(/_/g, ' ');
      zones.push({ id: makeId('zone'), city: String(city || defaultCity).trim() || defaultCity, timeZone: timeZone });
      saveAndRender('Zeitzone hinzugefügt.');
    }

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-wc-add')) {
        var select = root.querySelector('[data-wc-select]');
        if (select && select.value) addZone(select.value, '');
      } else if (button.hasAttribute('data-wc-add-custom')) {
        var zoneInput = root.querySelector('[data-wc-custom]');
        var cityInput = root.querySelector('[data-wc-city]');
        addZone(zoneInput ? zoneInput.value : '', cityInput ? cityInput.value : '');
      } else if (button.dataset.wcRemove) {
        zones = zones.filter(function (zone) { return zone.id !== button.dataset.wcRemove; });
        saveAndRender('Zeitzone entfernt.');
      }
    });

    root.addEventListener('input', function (event) {
      if (event.target.matches('[data-wc-search]')) {
        search = event.target.value;
        applySearch();
      }
    });

    render();
    var timer = window.setInterval(function () {
      if (!root.isConnected) {
        window.clearInterval(timer);
        return;
      }
      updateTimes();
    }, 1000);
  }

  /* ------------------------ RECIPE SCALER --------------------------- */
  function readRecipes() {
    var saved = storeGet(RECIPE_KEY, []);
    if (!Array.isArray(saved)) return [];
    return saved.filter(function (recipe) {
      return recipe && typeof recipe.id === 'string' && typeof recipe.name === 'string' &&
        Number(recipe.baseServings) > 0 && Array.isArray(recipe.ingredients);
    });
  }

  function formatAmount(value) {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value);
  }

  function downloadText(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function openRecipeScaler() {
    installStyles();
    var id = makeId('hdv168-recipe-scaler');
    H.Win.open('🥣 HalDo Rezept-Skalierung Pro',
      '<div class="hdv168-root" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 900, h: 760 });
    window.setTimeout(function () { mountRecipeScaler(id); }, 60);
  }

  function mountRecipeScaler(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var recipes = readRecipes();
    var activeId = recipes.length ? recipes[0].id : null;
    var draft = null;
    var targetServings = null;

    function setStatus(message, isError) {
      var status = root.querySelector('[data-rs-status]');
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('error', !!isError);
    }

    function activeRecipe() {
      return recipes.find(function (recipe) { return recipe.id === activeId; }) || null;
    }

    function renderRecipeList() {
      if (!recipes.length) {
        return '<div class="hdv168-muted">Noch keine Rezepte gespeichert.</div>';
      }
      return recipes.map(function (recipe) {
        return '<button class="hdv168-list-item' + (recipe.id === activeId ? ' active' : '') + '" type="button" data-rs-open="' + esc(recipe.id) + '">' +
          '<span><strong>' + esc(recipe.name) + '</strong><br><small class="hdv168-muted">' + Number(recipe.ingredients.length) + ' Zutaten · ' + Number(recipe.baseServings) + ' Portionen Basis</small></span>' +
          '<span aria-hidden="true">›</span></button>';
      }).join('');
    }

    function renderIngredientsEditor(ingredients) {
      return ingredients.map(function (ingredient, index) {
        return '<div class="hdv168-ingredient" data-rs-ingredient="' + index + '">' +
          '<div><label class="hdv168-label">Zutat</label><input class="hdv168-field" data-rs-ingredient-name value="' + esc(ingredient.name) + '" placeholder="z. B. Mehl"></div>' +
          '<div><label class="hdv168-label">Menge</label><input class="hdv168-field" data-rs-ingredient-amount type="number" min="0" step="any" value="' + esc(ingredient.amount) + '"></div>' +
          '<div><label class="hdv168-label">Einheit</label><input class="hdv168-field" data-rs-ingredient-unit value="' + esc(ingredient.unit) + '" placeholder="g, ml, Stück"></div>' +
          '<button class="hdv168-btn danger" type="button" data-rs-remove-ingredient="' + index + '" aria-label="Zutat entfernen">×</button>' +
        '</div>';
      }).join('');
    }

    function collectDraft() {
      if (!draft) return null;
      var name = root.querySelector('[data-rs-name]');
      var base = root.querySelector('[data-rs-base-servings]');
      var ingredients = [];
      root.querySelectorAll('[data-rs-ingredient]').forEach(function (row) {
        var ingredientName = row.querySelector('[data-rs-ingredient-name]');
        var amount = row.querySelector('[data-rs-ingredient-amount]');
        var unit = row.querySelector('[data-rs-ingredient-unit]');
        ingredients.push({
          id: makeId('ingredient'),
          name: ingredientName ? ingredientName.value.trim() : '',
          amount: amount ? Number(amount.value) : NaN,
          unit: unit ? unit.value.trim() : ''
        });
      });
      return {
        id: draft.id,
        name: name ? name.value.trim() : '',
        baseServings: base ? Number(base.value) : NaN,
        ingredients: ingredients
      };
    }

    function renderScaledIngredients(recipe, servings) {
      var factor = servings / recipe.baseServings;
      return recipe.ingredients.map(function (ingredient) {
        var scaled = Number(ingredient.amount) * factor;
        return '<tr><td>' + esc(ingredient.name) + '</td><td data-rs-scaled-amount>' + esc(formatAmount(scaled)) + '</td><td>' + esc(ingredient.unit || '') + '</td></tr>';
      }).join('');
    }

    function renderMain() {
      if (draft) {
        return '<div class="hdv168-panel">' +
          '<div class="hdv168-title">' + (recipes.some(function (recipe) { return recipe.id === draft.id; }) ? 'Rezept bearbeiten' : 'Neues Rezept') + '</div>' +
          '<label class="hdv168-label">Rezeptname</label><input class="hdv168-field" data-rs-name value="' + esc(draft.name) + '" placeholder="z. B. Pfannkuchen">' +
          '<label class="hdv168-label">Basis-Portionen</label><input class="hdv168-field" data-rs-base-servings type="number" min="1" max="1000" step="1" value="' + esc(draft.baseServings) + '">' +
          '<div class="hdv168-row" style="justify-content:space-between;margin-top:12px"><strong>Zutaten</strong><button class="hdv168-btn" type="button" data-rs-add-ingredient>+ Zutat</button></div>' +
          '<div data-rs-ingredient-list>' + renderIngredientsEditor(draft.ingredients) + '</div>' +
          '<div class="hdv168-row" style="margin-top:14px"><button class="hdv168-btn primary" type="button" data-rs-save>Rezept speichern</button><button class="hdv168-btn" type="button" data-rs-cancel>Abbrechen</button></div>' +
          '<div class="hdv168-status" data-rs-status aria-live="polite"></div></div>';
      }

      var recipe = activeRecipe();
      if (!recipe) {
        return '<div class="hdv168-panel"><div class="hdv168-title">Dein Rezeptbuch</div><p class="hdv168-muted" style="margin:8px 0 16px">Lege ein Rezept mit Basis-Portionen und Zutatenmengen an. HalDo berechnet daraus die neuen Mengen, ohne die Originalwerte zu verändern.</p><button class="hdv168-btn primary" type="button" data-rs-new>+ Erstes Rezept anlegen</button><div class="hdv168-status" data-rs-status aria-live="polite"></div></div>';
      }

      var servings = targetServings || recipe.baseServings;
      var factor = servings / recipe.baseServings;
      return '<div class="hdv168-panel">' +
        '<div class="hdv168-row" style="justify-content:space-between"><div><div class="hdv168-title">' + esc(recipe.name) + '</div><div class="hdv168-muted">Original bleibt unverändert · skalierte Mengen sind berechnet</div></div>' +
        '<div class="hdv168-stat"><small class="hdv168-muted">Skalierungsfaktor</small><div style="font-weight:800;font-size:18px">×' + formatAmount(factor) + '</div></div></div>' +
        '<div class="hdv168-row" style="margin:12px 0"><div class="hdv168-stat"><small class="hdv168-muted">Basis-Portionen</small><div><strong>' + recipe.baseServings + '</strong></div></div>' +
        '<div class="hdv168-stat"><label class="hdv168-label" for="' + esc(id) + '-target">Gewünschte Portionen</label><input class="hdv168-field" id="' + esc(id) + '-target" data-rs-target-servings type="number" min="1" max="1000" step="1" value="' + servings + '"></div></div>' +
        '<table class="hdv168-scaled" data-rs-scaled-table><thead><tr><th>Zutat</th><th>Menge</th><th>Einheit</th></tr></thead><tbody>' + renderScaledIngredients(recipe, servings) + '</tbody></table>' +
        '<div class="hdv168-row"><button class="hdv168-btn" type="button" data-rs-edit>Bearbeiten</button><button class="hdv168-btn" type="button" data-rs-export>Skalierte Einkaufsliste exportieren</button><button class="hdv168-btn danger" type="button" data-rs-delete>Rezept löschen</button></div>' +
        '<div class="hdv168-status" data-rs-status aria-live="polite"></div></div>';
    }

    function render() {
      root.innerHTML = '<div class="hdv168">' +
        '<aside class="hdv168-panel"><div class="hdv168-title">🥣 Rezeptbuch</div>' +
        '<p class="hdv168-muted" style="margin:4px 0 12px">Deine Rezepte bleiben lokal gespeichert.</p>' +
        '<button class="hdv168-btn primary" type="button" data-rs-new style="width:100%;margin-bottom:10px">+ Neues Rezept</button>' +
        '<div class="hdv168-list" data-rs-recipe-list>' + renderRecipeList() + '</div></aside>' +
        '<main class="hdv168-main">' +
        '<div class="hdv168-hero"><div class="hdv168-title">HalDo Rezept-Skalierung Pro</div>' +
        '<div class="hdv168-muted">Mengen nach Portionenzahl berechnen · Originalzutaten bleiben erhalten</div></div>' +
        renderMain() + '</main></div>';
    }

    function saveRecipe() {
      var recipe = collectDraft();
      if (!recipe) return;
      if (!recipe.name) { setStatus('Bitte gib dem Rezept einen Namen.', true); return; }
      if (!Number.isInteger(recipe.baseServings) || recipe.baseServings < 1 || recipe.baseServings > 1000) {
        setStatus('Die Basis-Portionen müssen eine ganze Zahl zwischen 1 und 1000 sein.', true); return;
      }
      recipe.ingredients = recipe.ingredients.filter(function (item) {
        return item.name || Number.isFinite(item.amount) || item.unit;
      });
      if (!recipe.ingredients.length || recipe.ingredients.some(function (item) {
        return !item.name || !Number.isFinite(item.amount) || item.amount < 0;
      })) {
        setStatus('Jede Zutat braucht einen Namen und eine gültige Menge ab 0.', true); return;
      }
      var index = recipes.findIndex(function (item) { return item.id === recipe.id; });
      if (index >= 0) recipes[index] = recipe;
      else recipes.push(recipe);
      if (!storeSet(RECIPE_KEY, recipes)) { setStatus('Das Rezept konnte nicht gespeichert werden.', true); return; }
      activeId = recipe.id;
      targetServings = recipe.baseServings;
      draft = null;
      render();
    }

    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-rs-new')) {
        draft = { id: makeId('recipe'), name: '', baseServings: 2, ingredients: [{ name: '', amount: 1, unit: 'g' }] };
        render();
      } else if (button.hasAttribute('data-rs-add-ingredient')) {
        var current = collectDraft();
        if (current) current.ingredients.push({ name: '', amount: 1, unit: 'g' });
        draft = current;
        render();
      } else if (button.hasAttribute('data-rs-remove-ingredient')) {
        var currentDraft = collectDraft();
        var removeIndex = Number(button.dataset.rsRemoveIngredient);
        if (currentDraft && currentDraft.ingredients[removeIndex]) currentDraft.ingredients.splice(removeIndex, 1);
        draft = currentDraft;
        render();
      } else if (button.hasAttribute('data-rs-save')) {
        saveRecipe();
      } else if (button.hasAttribute('data-rs-cancel')) {
        draft = null;
        render();
      } else if (button.dataset.rsOpen) {
        if (recipes.some(function (recipe) { return recipe.id === button.dataset.rsOpen; })) {
          activeId = button.dataset.rsOpen;
          targetServings = null;
          draft = null;
          render();
        }
      } else if (button.hasAttribute('data-rs-edit')) {
        var recipe = activeRecipe();
        if (recipe) {
          draft = JSON.parse(JSON.stringify(recipe));
          render();
        }
      } else if (button.hasAttribute('data-rs-delete')) {
        recipes = recipes.filter(function (recipe) { return recipe.id !== activeId; });
        if (!storeSet(RECIPE_KEY, recipes)) { setStatus('Das Rezept konnte nicht gelöscht werden.', true); return; }
        activeId = recipes.length ? recipes[0].id : null;
        targetServings = null;
        render();
      } else if (button.hasAttribute('data-rs-export')) {
        var recipe = activeRecipe();
        if (!recipe) return;
        var servings = targetServings || recipe.baseServings;
        var factor = servings / recipe.baseServings;
        var lines = ['Einkaufsliste: ' + recipe.name, 'Portionen: ' + servings, ''];
        recipe.ingredients.forEach(function (item) {
          lines.push(formatAmount(Number(item.amount) * factor) + ' ' + (item.unit || '') + ' ' + item.name);
        });
        downloadText('haldo-einkaufsliste.txt', lines.join('\r\n'), 'text/plain;charset=utf-8');
        setStatus('Skalierte Einkaufsliste wurde exportiert.');
      }
    });

    root.addEventListener('input', function (event) {
      if (!event.target.matches('[data-rs-target-servings]')) return;
      var value = Number(event.target.value);
      if (!Number.isInteger(value) || value < 1 || value > 1000) return;
      targetServings = value;
      var recipe = activeRecipe();
      if (!recipe) return;
      var factor = value / recipe.baseServings;
      var factorNode = root.querySelector('.hdv168-stat div[style*="font-size:18px"]');
      if (factorNode) factorNode.textContent = '×' + formatAmount(factor);
      var tbody = root.querySelector('[data-rs-scaled-table] tbody');
      if (tbody) tbody.innerHTML = renderScaledIngredients(recipe, value);
    });

    render();
  }

  H.worldclock = { open: openWorldClock, version: BUILD };
  H['recipe-scaler'] = { open: openRecipeScaler, version: BUILD };
  H.CoreAppsV168 = { version: BUILD, worldClock: openWorldClock, recipeScaler: openRecipeScaler };
  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.specDate = '2026-11-26';

  try {
    if (H.AppVoice && typeof H.AppVoice.command === 'function') {
      H.AppVoice.command('haldo-open-worldclock', ['öffne weltuhr', 'starte weltuhr pro'], function () {
        openWorldClock();
        return 'HalDo Weltuhr Pro wird geöffnet.';
      });
      H.AppVoice.command('haldo-open-recipe-scaler', ['öffne rezept skalierung', 'starte rezept skalierung pro'], function () {
        openRecipeScaler();
        return 'HalDo Rezept-Skalierung Pro wird geöffnet.';
      });
    }
  } catch (error) {
    console.warn('[HalDo v168] Voice commands:', error);
  }

  console.info('[HalDo v168] Weltuhr Pro und Rezept-Skalierung Pro registriert.');
})();
