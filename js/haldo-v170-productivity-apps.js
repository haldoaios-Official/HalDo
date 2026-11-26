/* ================================================================
   HALDO AI OS PRO MAX — v170 Productivity Apps
   HalDo Rezepte Pro + HalDo Text Analyzer Pro
   Local-first · validated records · no external services
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var BUILD = '170.0.0';
  if (!H.Win || !H.Store || H.__haldoV170Productivity) return;
  H.__haldoV170Productivity = true;

  var RECIPE_KEY = 'haldo_v170_recipe_book';
  var ANALYSIS_KEY = 'haldo_v170_text_analysis_history';
  var RECIPE_CATEGORIES = ['Frühstück', 'Hauptgericht', 'Beilage', 'Snack', 'Dessert', 'Getränk', 'Sonstiges'];

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
      console.warn('[HalDo v170] Read failed:', key, error);
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      H.Store.set(key, value);
      return true;
    } catch (error) {
      console.error('[HalDo v170] Save failed:', key, error);
      return false;
    }
  }

  function parseNumber(value, label, min, max, optional) {
    var raw = String(value == null ? '' : value).trim();
    if (!raw && optional) return null;
    var number = Number(raw.replace(',', '.'));
    if (!raw || !Number.isFinite(number) || number < min || number > max) {
      throw new Error(label + ': bitte einen Wert zwischen ' + min + ' und ' + max + ' eingeben.');
    }
    return number;
  }

  /* ------------------------------- RECIPE BOOK ------------------------------- */

  function readRecipes() {
    var stored = readStore(RECIPE_KEY, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter(function (recipe) {
      return recipe && typeof recipe.id === 'string' &&
        typeof recipe.name === 'string' && Array.isArray(recipe.ingredients) &&
        Array.isArray(recipe.steps);
    });
  }

  function openRecipeBook() {
    var id = uid('hdv170-recipes');
    H.Win.open('🍲 HalDo Rezepte Pro',
      '<div class="hdv170-root" data-hv170-app="recipes" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 850, h: 790 });
    window.setTimeout(function () { mountRecipeBook(id); }, 70);
  }

  function mountRecipeBook(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;

    var recipes = readRecipes();
    var activeId = recipes.length ? recipes[0].id : null;
    var draft = null;
    var query = '';
    var categoryFilter = '';

    function currentRecipe() {
      return recipes.find(function (recipe) { return recipe.id === activeId; }) || null;
    }

    function setStatus(message, isError) {
      var status = root.querySelector('[data-r170-status]');
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('error', !!isError);
    }

    function filteredRecipes() {
      var normalized = query.toLocaleLowerCase('de-DE').trim();
      return recipes.filter(function (recipe) {
        if (categoryFilter && recipe.category !== categoryFilter) return false;
        if (!normalized) return true;
        var searchable = [
          recipe.name, recipe.category, recipe.notes,
          recipe.ingredients.map(function (ingredient) { return ingredient.name; }).join(' ')
        ].join(' ').toLocaleLowerCase('de-DE');
        return searchable.indexOf(normalized) !== -1;
      }).sort(function (a, b) {
        return Number(!!b.favorite) - Number(!!a.favorite) ||
          String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
    }

    function renderList() {
      var list = root.querySelector('[data-r170-list]');
      if (!list) return;
      var visible = filteredRecipes();
      list.innerHTML = visible.length ? visible.map(function (recipe) {
        return '<button type="button" class="hdv170-recipe-item' + (recipe.id === activeId ? ' active' : '') +
          '" data-r170-open="' + esc(recipe.id) + '">' +
          '<strong>' + (recipe.favorite ? '★ ' : '') + esc(recipe.name) + '</strong>' +
          '<span>' + esc(recipe.category) + ' · ' + Number(recipe.servings) + ' Portionen · ' +
          Number(recipe.ingredients.length) + ' Zutaten</span></button>';
      }).join('') : '<div class="hdv170-empty">Keine passenden Rezepte gefunden.</div>';
      var count = root.querySelector('[data-r170-count]');
      if (count) count.textContent = visible.length + ' von ' + recipes.length;
    }

    function renderIngredientRows() {
      if (!draft) return '';
      return draft.ingredients.map(function (ingredient, index) {
        return '<div class="hdv170-ingredient" data-r170-ingredient="' + index + '">' +
          '<div><label class="hdv170-label">Zutat</label><input class="hdv170-field" data-r170-ingredient-name maxlength="100" value="' + esc(ingredient.name) + '" placeholder="z. B. Tomaten"></div>' +
          '<div><label class="hdv170-label">Menge</label><input class="hdv170-field" data-r170-ingredient-amount type="number" min="0" max="1000000" step="any" value="' + esc(ingredient.amount) + '" placeholder="z. B. 250"></div>' +
          '<div><label class="hdv170-label">Einheit</label><input class="hdv170-field" data-r170-ingredient-unit maxlength="30" value="' + esc(ingredient.unit) + '" placeholder="g, ml, Stück"></div>' +
          '<button type="button" class="hdv170-btn danger" data-r170-remove-ingredient="' + index + '" aria-label="Zutat entfernen">Entfernen</button>' +
          '</div>';
      }).join('');
    }

    function collectDraft() {
      if (!draft) throw new Error('Kein Rezeptentwurf geöffnet.');
      var name = root.querySelector('[data-r170-name]').value.trim();
      var category = root.querySelector('[data-r170-category]').value;
      var servings = parseNumber(root.querySelector('[data-r170-servings]').value, 'Portionen', 1, 1000, false);
      var prepTime = parseNumber(root.querySelector('[data-r170-prep]').value, 'Zubereitungszeit in Minuten', 0, 1440, true);
      var notes = root.querySelector('[data-r170-notes]').value.trim();
      var ingredients = Array.prototype.slice.call(root.querySelectorAll('[data-r170-ingredient]')).map(function (row) {
        var ingredientName = row.querySelector('[data-r170-ingredient-name]').value.trim();
        var amountRaw = row.querySelector('[data-r170-ingredient-amount]').value;
        var unit = row.querySelector('[data-r170-ingredient-unit]').value.trim();
        if (!ingredientName && !String(amountRaw || '').trim() && !unit) return null;
        if (!ingredientName) throw new Error('Jede Zutat benötigt einen Namen.');
        var amount = parseNumber(amountRaw, 'Zutatenmenge für ' + ingredientName, 0, 1000000, false);
        return { name:ingredientName, amount:amount, unit:unit };
      }).filter(Boolean);
      var steps = root.querySelector('[data-r170-steps]').value.split(/\r?\n/).map(function (step) { return step.trim(); }).filter(Boolean);

      if (!name) throw new Error('Bitte einen Rezeptnamen eingeben.');
      if (RECIPE_CATEGORIES.indexOf(category) === -1) throw new Error('Bitte eine gültige Rezeptkategorie auswählen.');
      if (!ingredients.length) throw new Error('Bitte mindestens eine Zutat hinzufügen.');
      if (!steps.length) throw new Error('Bitte mindestens einen Zubereitungsschritt eintragen.');

      return {
        id:draft.id,
        name:name,
        category:category,
        servings:servings,
        prepMinutes:prepTime == null ? 0 : prepTime,
        ingredients:ingredients,
        steps:steps,
        notes:notes,
        favorite:!!draft.favorite,
        createdAt:draft.createdAt || new Date().toISOString(),
        updatedAt:new Date().toISOString()
      };
    }

    function renderForm() {
      if (!draft) return '';
      return '<section class="hdv170-panel">' +
        '<div class="hdv170-row"><h3>' + (draft.id ? 'Rezept bearbeiten' : 'Neues Rezept') + '</h3><button class="hdv170-btn" type="button" data-r170-cancel>Abbrechen</button></div>' +
        '<label class="hdv170-label">Rezeptname</label><input class="hdv170-field" data-r170-name maxlength="120" value="' + esc(draft.name) + '" placeholder="z. B. Linsensuppe">' +
        '<div class="hdv170-grid-3"><div><label class="hdv170-label">Kategorie</label><select class="hdv170-field" data-r170-category>' +
        RECIPE_CATEGORIES.map(function (category) { return '<option value="' + esc(category) + '"' + (category === draft.category ? ' selected' : '') + '>' + esc(category) + '</option>'; }).join('') +
        '</select></div><div><label class="hdv170-label">Portionen</label><input class="hdv170-field" data-r170-servings type="number" min="1" max="1000" step="1" value="' + esc(draft.servings) + '"></div>' +
        '<div><label class="hdv170-label">Zubereitungszeit (Minuten)</label><input class="hdv170-field" data-r170-prep type="number" min="0" max="1440" step="1" value="' + esc(draft.prepMinutes) + '"></div></div>' +
        '<div class="hdv170-row"><h4>Zutaten</h4><button class="hdv170-btn" type="button" data-r170-add-ingredient>+ Zutat</button></div>' +
        '<div data-r170-ingredients>' + renderIngredientRows() + '</div>' +
        '<label class="hdv170-label">Zubereitung – ein Schritt pro Zeile</label><textarea class="hdv170-field" data-r170-steps rows="5" maxlength="10000" placeholder="1. Vorbereiten&#10;2. Kochen&#10;3. Servieren">' + esc(draft.stepsText || draft.steps.join('\n')) + '</textarea>' +
        '<label class="hdv170-label">Notizen / Allergene / Hinweise</label><textarea class="hdv170-field" data-r170-notes rows="2" maxlength="3000">' + esc(draft.notes) + '</textarea>' +
        '<div class="hdv170-row"><button class="hdv170-btn primary" type="button" data-r170-save>Rezept speichern</button><span class="hdv170-muted">Speicherung lokal im Browser.</span></div></section>';
    }

    function renderDetail() {
      if (draft) return renderForm();
      var recipe = currentRecipe();
      if (!recipe) return '<section class="hdv170-panel hdv170-empty">Wähle ein Rezept oder lege ein neues Rezept an.</section>';
      return '<section class="hdv170-panel"><div class="hdv170-row"><div><h3>' + esc(recipe.name) + '</h3><div class="hdv170-muted">' +
        esc(recipe.category) + ' · ' + Number(recipe.servings) + ' Portionen · ' + Number(recipe.prepMinutes || 0) + ' Minuten</div></div>' +
        '<div class="hdv170-row"><button type="button" class="hdv170-btn" data-r170-favorite>' + (recipe.favorite ? '★ Favorit' : '☆ Favorit') + '</button>' +
        '<button type="button" class="hdv170-btn" data-r170-edit>Bearbeiten</button><button type="button" class="hdv170-btn danger" data-r170-delete>Löschen</button></div></div>' +
        '<h4>Zutaten</h4><ul class="hdv170-list">' + recipe.ingredients.map(function (ingredient) {
          return '<li><strong>' + esc(ingredient.name) + '</strong><span>' + esc(ingredient.amount) + (ingredient.unit ? ' ' + esc(ingredient.unit) : '') + '</span></li>';
        }).join('') + '</ul><h4>Zubereitung</h4><ol class="hdv170-list">' + recipe.steps.map(function (step) {
          return '<li>' + esc(step) + '</li>';
        }).join('') + '</ol>' + (recipe.notes ? '<p class="hdv170-notes">' + esc(recipe.notes) + '</p>' : '') + '</section>';
    }

    function render() {
      root.innerHTML = '<style>' +
        '.hdv170{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.hdv170 *{box-sizing:border-box}' +
        '.hdv170-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.hdv170-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}' +
        '.hdv170-muted{font-size:11px;opacity:.68}.hdv170-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.hdv170-grid{display:grid;grid-template-columns:minmax(200px,.8fr) minmax(0,1.5fr);gap:10px}' +
        '.hdv170-panel{padding:13px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.hdv170-field{width:100%;min-width:0;padding:9px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}' +
        '.hdv170-label{display:block;margin:8px 0 4px;font-size:11px;opacity:.74}.hdv170-btn{padding:8px 11px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}.hdv170-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;font-weight:800;border:0}.hdv170-btn.danger{border-color:rgba(255,100,120,.38);color:#ffb6c0}' +
        '.hdv170-recipe-item{display:block;width:100%;padding:10px;margin-top:7px;text-align:left;border:1px solid rgba(0,229,255,.15);border-radius:10px;background:rgba(0,10,28,.35);color:inherit;cursor:pointer}.hdv170-recipe-item.active{border-color:var(--accent,#00e5ff);background:rgba(0,170,210,.12)}.hdv170-recipe-item strong,.hdv170-recipe-item span{display:block}.hdv170-recipe-item span{font-size:10px;opacity:.68;margin-top:3px}' +
        '.hdv170-ingredient{display:grid;grid-template-columns:1.4fr .7fr .8fr auto;gap:7px;align-items:end;margin:8px 0;padding:9px;border:1px solid rgba(0,229,255,.14);border-radius:10px}.hdv170-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hdv170-list{padding-left:20px}.hdv170-list li{margin:7px 0}.hdv170-list span{margin-left:8px;opacity:.75}.hdv170-notes{white-space:pre-wrap}.hdv170-empty{padding:18px;text-align:center;opacity:.7}.hdv170-status{min-height:18px;font-size:11px;color:#8fffd0}.hdv170-status.error{color:#ff9eae}' +
        '@media(max-width:700px){.hdv170-grid{grid-template-columns:1fr}.hdv170-ingredient{grid-template-columns:1fr 1fr}.hdv170-grid-3{grid-template-columns:1fr 1fr}}' +
        '</style><div class="hdv170"><header class="hdv170-hero"><div class="hdv170-title">🍲 HalDo Rezepte Pro</div><div class="hdv170-muted">Dein lokales Rezeptbuch mit Zutaten, Portionen, Zubereitung und Suche. Rezepte werden nicht an externe Dienste übertragen.</div></header>' +
        '<div class="hdv170-row"><input class="hdv170-field" data-r170-search placeholder="Rezept oder Zutat suchen …" value="' + esc(query) + '" style="max-width:340px">' +
        '<select class="hdv170-field" data-r170-filter style="max-width:190px"><option value="">Alle Kategorien</option>' +
        RECIPE_CATEGORIES.map(function (category) { return '<option value="' + esc(category) + '"' + (category === categoryFilter ? ' selected' : '') + '>' + esc(category) + '</option>'; }).join('') +
        '</select><button class="hdv170-btn primary" type="button" data-r170-new>+ Neues Rezept</button></div>' +
        '<div class="hdv170-grid"><aside class="hdv170-panel"><div class="hdv170-row"><strong>Rezeptbuch</strong><span class="hdv170-muted" data-r170-count></span></div><div data-r170-list></div></aside>' +
        '<main>' + renderDetail() + '<div class="hdv170-status" data-r170-status role="status"></div></main></div></div>';
      renderList();
    }

    root.addEventListener('input', function (event) {
      if (event.target.matches('[data-r170-search]')) { query = event.target.value; renderList(); }
    });
    root.addEventListener('change', function (event) {
      if (event.target.matches('[data-r170-filter]')) { categoryFilter = event.target.value; renderList(); }
    });
    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-r170-new')) {
        activeId = null;
        draft = { id:uid('recipe'), name:'', category:'Hauptgericht', servings:2, prepMinutes:30,
          ingredients:[{name:'',amount:'',unit:''}], stepsText:'', steps:[], notes:'', favorite:false, createdAt:new Date().toISOString() };
        render(); return;
      }
      if (button.dataset.r170Open) { activeId = button.dataset.r170Open; draft = null; render(); return; }
      if (button.hasAttribute('data-r170-edit')) {
        var current = currentRecipe();
        if (!current) return;
        draft = JSON.parse(JSON.stringify(current));
        draft.stepsText = draft.steps.join('\n');
        render(); return;
      }
      if (button.hasAttribute('data-r170-add-ingredient')) {
        var editing = collectDraft();
        editing.ingredients.push({name:'',amount:'',unit:''});
        draft = editing; render(); return;
      }
      if (button.dataset.r170RemoveIngredient != null) {
        var updated = collectDraft();
        updated.ingredients.splice(Number(button.dataset.r170RemoveIngredient), 1);
        if (!updated.ingredients.length) updated.ingredients.push({name:'',amount:'',unit:''});
        draft = updated; render(); return;
      }
      if (button.hasAttribute('data-r170-cancel')) { draft = null; render(); return; }
      if (button.hasAttribute('data-r170-save')) {
        try {
          var saved = collectDraft();
          var index = recipes.findIndex(function (recipe) { return recipe.id === saved.id; });
          if (index >= 0) recipes[index] = saved; else recipes.push(saved);
          if (!writeStore(RECIPE_KEY, recipes)) throw new Error('Das Rezept konnte nicht lokal gespeichert werden.');
          activeId = saved.id; draft = null; render(); setStatus('Rezept gespeichert.');
        } catch (error) { setStatus(error.message || 'Rezept konnte nicht gespeichert werden.', true); }
        return;
      }
      if (button.hasAttribute('data-r170-favorite')) {
        var favoriteRecipe = currentRecipe();
        if (!favoriteRecipe) return;
        favoriteRecipe.favorite = !favoriteRecipe.favorite;
        favoriteRecipe.updatedAt = new Date().toISOString();
        if (!writeStore(RECIPE_KEY, recipes)) { setStatus('Favorit konnte nicht gespeichert werden.', true); return; }
        render(); return;
      }
      if (button.hasAttribute('data-r170-delete')) {
        if (!activeId) return;
        recipes = recipes.filter(function (recipe) { return recipe.id !== activeId; });
        if (!writeStore(RECIPE_KEY, recipes)) { setStatus('Rezept konnte nicht gelöscht werden.', true); return; }
        activeId = recipes.length ? recipes[0].id : null;
        render(); setStatus('Rezept gelöscht.');
      }
    });

    render();
  }

  /* ------------------------------- TEXT ANALYZER ------------------------------- */

  function analyzeText(text) {
    var value = String(text == null ? '' : text);
    var trimmed = value.trim();
    var words = trimmed ? (trimmed.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) || []) : [];
    var sentences = trimmed ? trimmed.split(/[.!?]+/u).filter(function (part) { return part.trim().length > 0; }).length : 0;
    var paragraphs = trimmed ? trimmed.split(/\n\s*\n/u).filter(function (part) { return part.trim().length > 0; }).length : 0;
    var lines = value ? value.split(/\r?\n/u).length : 0;
    var characterCount = Array.from(value).length;
    var nonWhitespaceCount = Array.from(value).filter(function (char) { return !/\s/u.test(char); }).length;
    var totalWordLength = words.reduce(function (sum, word) { return sum + Array.from(word).length; }, 0);
    var frequencies = new Map();
    words.forEach(function (word) {
      var normalized = word.toLocaleLowerCase('de-DE');
      frequencies.set(normalized, (frequencies.get(normalized) || 0) + 1);
    });
    var stopWords = new Set(['und','der','die','das','ein','eine','einer','eines','mit','von','für','auf','ist','im','in','am','an','zu','den','dem','des','the','and','or','of','to','a','is']);
    var topWords = Array.from(frequencies.entries()).filter(function (entry) {
      return entry[0].length > 2 && !stopWords.has(entry[0]);
    }).sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0], 'de'); }).slice(0, 8);
    return {
      characters:characterCount,
      charactersNoWhitespace:nonWhitespaceCount,
      words:words.length,
      sentences:sentences,
      paragraphs:paragraphs,
      lines:lines,
      averageWordLength:words.length ? totalWordLength / words.length : 0,
      readingMinutes:words.length ? Math.max(1, Math.ceil(words.length / 200)) : 0,
      topWords:topWords
    };
  }

  function openTextAnalyzer() {
    var id = uid('hdv170-analyzer');
    H.Win.open('📊 HalDo Text Analyzer Pro',
      '<div class="hdv170-root" data-hv170-app="analyzer" id="' + esc(id) + '" style="height:100%;overflow:auto;padding:14px"></div>',
      { w: 820, h: 760 });
    window.setTimeout(function () { mountTextAnalyzer(id); }, 70);
  }

  function mountTextAnalyzer(id) {
    var root = document.getElementById(id);
    if (!root || !root.isConnected) return;
    var history = readStore(ANALYSIS_KEY, []);
    if (!Array.isArray(history)) history = [];
    var lastStats = null;

    function updateResults() {
      var input = root.querySelector('[data-an170-text]');
      var stats = analyzeText(input ? input.value : '');
      lastStats = stats;
      var targets = {
        characters:'[data-an170-characters]',
        charactersNoWhitespace:'[data-an170-no-space]',
        words:'[data-an170-words]',
        sentences:'[data-an170-sentences]',
        paragraphs:'[data-an170-paragraphs]',
        lines:'[data-an170-lines]',
        averageWordLength:'[data-an170-average]',
        readingMinutes:'[data-an170-reading]'
      };
      Object.keys(targets).forEach(function (key) {
        var element = root.querySelector(targets[key]);
        if (element) element.textContent = key === 'averageWordLength' ? stats[key].toFixed(1) : String(stats[key]);
      });
      var top = root.querySelector('[data-an170-top-words]');
      if (top) top.innerHTML = stats.topWords.length ? stats.topWords.map(function (entry) {
        return '<li><span>' + esc(entry[0]) + '</span><strong>' + entry[1] + '×</strong></li>';
      }).join('') : '<li class="hdv170-empty">Noch keine häufigen Wörter.</li>';
      var saveButton = root.querySelector('[data-an170-save]');
      if (saveButton) saveButton.disabled = stats.words === 0;
      return stats;
    }

    function setStatus(message, isError) {
      var status = root.querySelector('[data-an170-status]');
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('error', !!isError);
    }

    function renderHistory() {
      var list = root.querySelector('[data-an170-history]');
      if (!list) return;
      list.innerHTML = history.length ? history.slice(0, 12).map(function (entry) {
        return '<li><strong>' + esc(entry.title) + '</strong><span>' + Number(entry.words) + ' Wörter · ' +
          Number(entry.characters) + ' Zeichen · ' + Number(entry.readingMinutes) + ' Min. Lesezeit</span></li>';
      }).join('') : '<li class="hdv170-empty">Noch keine Analysen gespeichert.</li>';
      var count = root.querySelector('[data-an170-history-count]');
      if (count) count.textContent = history.length + ' gespeichert';
    }

    root.innerHTML = '<style>' +
      '.hdv170{color:var(--text,#eaf5ff);font:13px/1.5 system-ui,sans-serif;display:grid;gap:12px}.hdv170 *{box-sizing:border-box}.hdv170-hero{padding:16px;border:1px solid rgba(0,229,255,.24);border-radius:15px;background:linear-gradient(120deg,rgba(0,160,220,.14),rgba(145,90,220,.12))}.hdv170-title{font-size:19px;font-weight:850;color:var(--accent,#00e5ff)}' +
      '.hdv170-panel{padding:13px;border:1px solid rgba(0,229,255,.18);border-radius:13px;background:rgba(5,20,42,.55);min-width:0}.hdv170-field{width:100%;min-width:0;padding:9px;border:1px solid rgba(0,229,255,.2);border-radius:9px;background:rgba(0,8,24,.65);color:inherit;font:inherit}.hdv170-row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.hdv170-muted{font-size:11px;opacity:.68}' +
      '.hdv170-btn{padding:8px 11px;border:1px solid rgba(0,229,255,.28);border-radius:9px;background:rgba(0,160,220,.12);color:inherit;font:inherit;cursor:pointer}.hdv170-btn.primary{background:linear-gradient(110deg,#00d8ef,#65aaff);color:#031320;font-weight:800;border:0}.hdv170-btn:disabled{opacity:.4;cursor:not-allowed}' +
      '.hdv170-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.hdv170-metric{padding:10px;border:1px solid rgba(0,229,255,.16);border-radius:10px;background:rgba(0,10,28,.35)}.hdv170-metric strong{display:block;font-size:20px;color:var(--accent,#00e5ff)}.hdv170-metric span{font-size:10px;opacity:.72}' +
      '.hdv170-list{padding-left:20px}.hdv170-list li{display:flex;justify-content:space-between;gap:12px;margin:6px 0}.hdv170-status{min-height:18px;font-size:11px;color:#8fffd0}.hdv170-status.error{color:#ff9eae}.hdv170-history{padding-left:20px}.hdv170-history li{margin:7px 0}.hdv170-history span{display:block;font-size:11px;opacity:.7}' +
      '@media(max-width:650px){.hdv170-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '</style><div class="hdv170"><header class="hdv170-hero"><div class="hdv170-title">📊 HalDo Text Analyzer Pro</div>' +
      '<div class="hdv170-muted">Text wird direkt in deinem Browser analysiert. Beim Speichern wird nur die Statistik abgelegt – nicht der eingegebene Originaltext.</div></header>' +
      '<section class="hdv170-panel"><div class="hdv170-row"><strong>Text eingeben</strong><span class="hdv170-muted">Keine automatische Übertragung</span></div>' +
      '<label class="hdv170-muted">Titel für den Analyseverlauf</label><input class="hdv170-field" data-an170-title maxlength="100" placeholder="z. B. Einleitung Kapitel 1">' +
      '<label class="hdv170-muted">Text</label><textarea class="hdv170-field" data-an170-text rows="9" maxlength="200000" placeholder="Text hier einfügen …"></textarea>' +
      '<div class="hdv170-row"><button type="button" class="hdv170-btn" data-an170-clear>Text leeren</button><button type="button" class="hdv170-btn primary" data-an170-save disabled>Analyse speichern</button></div></section>' +
      '<section class="hdv170-panel"><strong>Analyse-Ergebnis</strong><div class="hdv170-metrics">' +
      '<div class="hdv170-metric"><strong data-an170-words>0</strong><span>Wörter</span></div><div class="hdv170-metric"><strong data-an170-characters>0</strong><span>Zeichen</span></div>' +
      '<div class="hdv170-metric"><strong data-an170-no-space>0</strong><span>Ohne Leerzeichen</span></div><div class="hdv170-metric"><strong data-an170-sentences>0</strong><span>Sätze</span></div>' +
      '<div class="hdv170-metric"><strong data-an170-paragraphs>0</strong><span>Absätze</span></div><div class="hdv170-metric"><strong data-an170-lines>0</strong><span>Zeilen</span></div>' +
      '<div class="hdv170-metric"><strong data-an170-average>0.0</strong><span>Ø Wortlänge</span></div><div class="hdv170-metric"><strong data-an170-reading>0</strong><span>Min. Lesezeit (ca.)</span></div>' +
      '</div><h4>Häufige Wörter</h4><ol class="hdv170-list" data-an170-top-words><li class="hdv170-muted">Noch keine Wörter.</li></ol></section>' +
      '<section class="hdv170-panel"><div class="hdv170-row"><strong>Gespeicherte Analyse-Zusammenfassungen</strong><span class="hdv170-muted" data-an170-history-count></span>' +
      '<button class="hdv170-btn" type="button" data-an170-clear-history>Verlauf löschen</button></div><ol class="hdv170-history" data-an170-history></ol></section>' +
      '<div class="hdv170-status" data-an170-status role="status"></div></div>';

    root.addEventListener('input', function (event) {
      if (event.target.matches('[data-an170-text]')) updateResults();
    });
    root.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-an170-clear')) {
        root.querySelector('[data-an170-text]').value = '';
        root.querySelector('[data-an170-title]').value = '';
        updateResults();
        setStatus('Texteingabe geleert.');
        return;
      }
      if (button.hasAttribute('data-an170-save')) {
        var stats = updateResults();
        if (!stats || stats.words === 0) { setStatus('Bitte zuerst einen Text eingeben.', true); return; }
        var title = root.querySelector('[data-an170-title]').value.trim() || 'Textanalyse';
        history.unshift({
          id:uid('analysis'),
          title:title,
          characters:stats.characters,
          words:stats.words,
          sentences:stats.sentences,
          paragraphs:stats.paragraphs,
          readingMinutes:stats.readingMinutes,
          createdAt:new Date().toISOString()
        });
        history = history.slice(0, 50);
        if (!writeStore(ANALYSIS_KEY, history)) { setStatus('Die Analyse-Zusammenfassung konnte nicht gespeichert werden.', true); return; }
        renderHistory();
        setStatus('Statistik gespeichert. Der Originaltext wurde nicht gespeichert.');
        return;
      }
      if (button.hasAttribute('data-an170-clear-history')) {
        history = [];
        if (!writeStore(ANALYSIS_KEY, history)) { setStatus('Der Verlauf konnte nicht gelöscht werden.', true); return; }
        renderHistory();
        setStatus('Gespeicherte Analyse-Zusammenfassungen gelöscht.');
      }
    });

    updateResults();
    renderHistory();
  }

  var appDefinitions = [
    { id:'recipes', title:'HalDo Rezepte Pro', icon:'🍲', open:openRecipeBook },
    { id:'analyzer', title:'HalDo Text Analyzer Pro', icon:'📊', open:openTextAnalyzer }
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
      var additions = appDefinitions.filter(function (app) { return app.id === 'analyzer' && key === 'A'; })
        .map(function (app) { return { id:app.id, name:app.title, icon:app.icon }; });
      var merged = existing.concat(additions);
      return merged.filter(function (item, index) {
        return merged.findIndex(function (other) { return other.id === item.id; }) === index;
      });
    };
  }

  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.namedCoreApps = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured.length : 0;
  H.AppsV170 = {
    version:BUILD,
    apps:appDefinitions.map(function (app) { return { id:app.id, title:app.title }; }),
    status:function () { return appDefinitions.map(function (app) {
      return { id:app.id, ready:!!(H[app.id] && typeof H[app.id].open === 'function') };
    }); }
  };

  console.info('[HalDo v170] Rezepte Pro und Text Analyzer Pro registriert.');
})();
