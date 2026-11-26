/* HalDo AI OS Pro Max — v167 medical apps
 * Local encrypted vault (AES-GCM + PBKDF2). No network requests.
 * Clinical safety: records are documentation only, never diagnosis or dosing advice.
 */
(function () {
  'use strict';
  var H = window.HalDo;
  if (!H || !H.Win || !H.Store || H.__v167MedicalApps) return;
  H.__v167MedicalApps = true;

  var BUILD = '167.0.0';
  var encoder = new TextEncoder();
  var decoder = new TextDecoder();
  var vaults = Object.create(null);
  var activeInstances = Object.create(null);
  var configs = [
    {
      id: 'laborwerte-pro',
      title: 'HalDo Laborwerte Pro',
      icon: '🧪',
      key: 'haldo_v167_laborwerte_vault',
      description: 'Laborbefunde strukturiert dokumentieren und Verläufe nachvollziehen.',
      fields: [
        ['name','Laborwert / Parameter','text',true],
        ['value','Gemessener Wert','text',true],
        ['unit','Einheit','text',false],
        ['reference','Referenzbereich laut Laborbefund','text',false],
        ['date','Befunddatum','date',true],
        ['source','Labor / Einrichtung','text',false],
        ['note','Notiz','textarea',false]
      ]
    },
    {
      id: 'medikamentenplan-pro',
      title: 'HalDo Medikamentenplan Pro',
      icon: '💊',
      key: 'haldo_v167_medication_vault',
      description: 'Ärztlich verordnete Medikamente und den dokumentierten Einnahmeplan verwalten.',
      fields: [
        ['name','Medikament / Handelsname','text',true],
        ['ingredient','Wirkstoff (laut Packung / Verordnung)','text',false],
        ['dose','Verordnete Dosierung (genau wie verordnet)','text',true],
        ['route','Anwendung / Darreichungsform','text',false],
        ['times','Verordnete Einnahmezeiten','text',false],
        ['start','Beginn','date',false],
        ['end','Ende / Prüftermin','date',false],
        ['prescriber','Verordnende Praxis / Person','text',false],
        ['note','Hinweise aus der Verordnung','textarea',false]
      ]
    }
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function notify(message, type) {
    try {
      if (H.Toast && typeof H.Toast.show === 'function') H.Toast.show(message, 2800, type || 'info');
      else if (typeof H.Notify === 'function') H.Notify(message, type || 'info');
      else console.info('[HalDo v167]', message);
    } catch (_) { console.info('[HalDo v167]', message); }
  }
  function uid() {
    return 'h167-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }
  function bytesToBase64(bytes) {
    var binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }
  function base64ToBytes(value) {
    if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
      throw new Error('Das Backup enthält ungültige Base64-Daten.');
    }
    var binary = atob(value), bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function validateEnvelope(envelope) {
    if (!envelope || typeof envelope !== 'object' || envelope.format !== 'haldo-aes-gcm-v1' ||
        envelope.kdf !== 'PBKDF2-SHA-256' || envelope.iterations !== 310000) {
      throw new Error('Unbekanntes oder nicht unterstütztes Backup-Format.');
    }
    var salt = base64ToBytes(envelope.salt);
    var iv = base64ToBytes(envelope.iv);
    var data = base64ToBytes(envelope.data);
    if (salt.length !== 16 || iv.length !== 12 || data.length < 16 || data.length > 5 * 1024 * 1024) {
      throw new Error('Die Backup-Größe oder die Verschlüsselungsdaten sind ungültig.');
    }
    return {salt:salt, iv:iv, data:data};
  }
  function decryptEnvelope(envelope, passphrase) {
    var parts = validateEnvelope(envelope);
    return deriveKey(passphrase, parts.salt).then(function (key) {
      return window.crypto.subtle.decrypt({name:'AES-GCM', iv:parts.iv}, key, parts.data)
        .then(function (plain) {
          var records = JSON.parse(decoder.decode(plain));
          if (!Array.isArray(records) || records.length > 50000 ||
              records.some(function (record) {
                return !record || typeof record !== 'object' || Array.isArray(record) ||
                  typeof record.id !== 'string' || record.id.length > 160;
              })) {
            throw new Error('Die entschlüsselten Einträge haben eine ungültige Struktur.');
          }
          return {key:key, salt:parts.salt, records:records, persistedRecords:JSON.parse(JSON.stringify(records)), dirty:false};
        });
    }).catch(function (error) {
      if (error && error.name === 'OperationError') throw new Error('Passphrase falsch oder Backup beschädigt.');
      throw error;
    });
  }
  function cryptoReady() {
    return !!(window.crypto && window.crypto.subtle && window.isSecureContext);
  }
  function deriveKey(passphrase, salt) {
    return window.crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey'])
      .then(function (material) {
        return window.crypto.subtle.deriveKey(
          {name:'PBKDF2', salt:salt, iterations:310000, hash:'SHA-256'},
          material, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']
        );
      });
  }
  function readEnvelope(config) {
    try {
      var raw = localStorage.getItem(config.key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function writeEnvelope(config, envelope) {
    localStorage.setItem(config.key, JSON.stringify(envelope));
  }
  function encryptRecords(config, records, key) {
    var iv = window.crypto.getRandomValues(new Uint8Array(12));
    return window.crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, key, encoder.encode(JSON.stringify(records)))
      .then(function (cipher) {
        // Use the decoded salt held by the unlocked vault. The persisted envelope stores Base64 text.
        var salt = vaults[config.id].salt;
        writeEnvelope(config, {
          format:'haldo-aes-gcm-v1',
          kdf:'PBKDF2-SHA-256',
          iterations:310000,
          salt:bytesToBase64(salt),
          iv:bytesToBase64(iv),
          data:bytesToBase64(new Uint8Array(cipher)),
          updatedAt:new Date().toISOString()
        });
      });
  }
  function unlock(config, passphrase) {
    var envelope = readEnvelope(config);
    if (!envelope) {
      var salt = window.crypto.getRandomValues(new Uint8Array(16));
      return deriveKey(passphrase, salt).then(function (key) {
        var vault = {key:key, salt:salt, records:[], persistedRecords:[], dirty:false};
        vaults[config.id] = vault;
        // Persist an encrypted empty envelope immediately: creating a vault must
        // survive closing the window or reloading before the first record exists.
        return encryptRecords(config, vault.records, key).then(function () {
          return vault;
        }).catch(function (error) {
          lock(config);
          throw new Error('Der verschlüsselte Tresor konnte nicht angelegt werden: ' + error.message);
        });
      });
    }
    return Promise.resolve().then(function () {
      return decryptEnvelope(envelope, passphrase);
    }).then(function (vault) {
      vaults[config.id] = vault;
      return vault;
    });
  }
  function importEncryptedBackup(config, file, passphrase) {
    if (!file || file.size > 5 * 1024 * 1024) return Promise.reject(new Error('Backup-Datei fehlt oder ist größer als 5 MB.'));
    return file.text().then(function (raw) {
      var envelope;
      try { envelope = JSON.parse(raw); }
      catch (_) { throw new Error('Die Backup-Datei ist kein gültiges JSON.'); }
      return decryptEnvelope(envelope, passphrase).then(function (vault) {
        if (!window.confirm('Das vorhandene lokale ' + config.title + '-Tresor-Backup durch dieses geprüfte Backup ersetzen?')) {
          vault.records = [];
          vault.key = null;
          throw new Error('Import abgebrochen. Vorhandene Daten wurden nicht verändert.');
        }
        try {
          writeEnvelope(config, envelope);
        } catch (error) {
          vault.records = [];
          vault.key = null;
          throw new Error('Backup konnte lokal nicht gespeichert werden: ' + error.message);
        }
        vaults[config.id] = vault;
        return vault;
      });
    });
  }
  function save(config) {
    var vault = vaults[config.id];
    if (!vault) return Promise.reject(new Error('Tresor ist gesperrt.'));
    var lastCommitted = Array.isArray(vault.persistedRecords)
      ? vault.persistedRecords
      : [];
    return encryptRecords(config, vault.records, vault.key).then(function () {
      vault.persistedRecords = JSON.parse(JSON.stringify(vault.records));
      vault.dirty = false;
      return true;
    }).catch(function (error) {
      // Keep the in-memory view consistent with the last encrypted local save.
      // A quota/security/storage error must not leave an unsaved edit appearing committed.
      vault.records = JSON.parse(JSON.stringify(lastCommitted));
      vault.dirty = true;
      throw error;
    });
  }
  function lock(config) {
    if (vaults[config.id]) {
      vaults[config.id].records = [];
      vaults[config.id].key = null;
      delete vaults[config.id];
    }
  }
  function downloadEncryptedBackup(config) {
    var envelope = readEnvelope(config);
    if (!envelope) { notify('Noch kein verschlüsseltes Backup vorhanden.', 'warning'); return; }
    var blob = new Blob([JSON.stringify(envelope, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = config.id + '-verschluesseltes-backup.json';
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  }
  var css = '<style id="haldo-v167-medical-css">' +
    '.h167{box-sizing:border-box;padding:15px;color:var(--text,#eaf4ff);font:13px/1.5 system-ui,sans-serif}' +
    '.h167 *{box-sizing:border-box}.h167 .hero{padding:15px;border:1px solid rgba(80,190,255,.28);border-radius:15px;background:linear-gradient(125deg,rgba(0,180,210,.13),rgba(120,80,210,.15));margin-bottom:12px}' +
    '.h167 h2{font-size:18px;margin:0 0 5px}.h167 .muted{font-size:11px;opacity:.7}.h167 .card{padding:12px;border:1px solid rgba(120,190,255,.2);border-radius:12px;background:rgba(255,255,255,.035);margin:9px 0}' +
    '.h167 label{display:block;font-size:11px;font-weight:700;margin:8px 0 4px}.h167 input,.h167 textarea,.h167 select{width:100%;padding:10px;border:1px solid rgba(120,190,255,.25);border-radius:9px;background:rgba(0,0,0,.25);color:inherit;font:inherit}.h167 textarea{min-height:70px;resize:vertical}' +
    '.h167 button{padding:9px 12px;border:1px solid rgba(100,190,255,.35);border-radius:9px;background:rgba(30,130,200,.13);color:inherit;font:inherit;cursor:pointer;margin:3px}.h167 button.primary{background:linear-gradient(120deg,#087fae,#6546b8);border:0}.h167 button.danger{border-color:rgba(255,100,120,.4)}' +
    '.h167 .row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.h167 .row>*{flex:1;min-width:120px}.h167 .record-title{font-weight:800;overflow-wrap:anywhere}.h167 .pill{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(80,190,255,.1);font-size:10px}.h167 .notice{border-left:3px solid #e5b85c;padding:9px 11px;background:rgba(229,184,92,.08);font-size:11px}.h167 .empty{text-align:center;padding:22px;opacity:.65;border:1px dashed rgba(120,190,255,.25);border-radius:11px}' +
    '</style>';

  function openApp(config) {
    if (!cryptoReady()) {
      notify('Für den verschlüsselten Tresor werden HTTPS und Web Crypto benötigt.', 'error');
      return;
    }
    var rootId = uid();
    H.Win.open(config.icon + ' ' + config.title,
      '<div id="' + rootId + '" class="h167" style="height:100%;overflow:auto"></div>', {w:760,h:820});
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root || !root.isConnected) return;
      activeInstances[config.id] = (activeInstances[config.id] || 0) + 1;
      // Remove decrypted records and the CryptoKey when the last window closes.
      var observer = new MutationObserver(function () {
        if (root.isConnected) return;
        observer.disconnect();
        activeInstances[config.id] = Math.max(0, (activeInstances[config.id] || 1) - 1);
        if (activeInstances[config.id] === 0) {
          delete activeInstances[config.id];
          lock(config);
        }
      });
      observer.observe(document.body, {childList:true, subtree:true});
      renderGate(root, config);
    }, 70);
  }
  function renderGate(root, config) {
    var existing = !!readEnvelope(config);
    root.innerHTML = css +
      '<div class="hero"><h2>' + esc(config.icon + ' ' + config.title) + '</h2><div class="muted">' + esc(config.description) + '</div></div>' +
      '<div class="notice"><b>Datenschutz:</b> Einträge werden vor der Speicherung lokal mit AES-256-GCM verschlüsselt. Das Passwort wird nicht gespeichert und kann nicht zurückgesetzt werden. Nutze ein starkes, einzigartiges Passwort und sichere es separat. Ohne Passwort sind die Daten nicht wiederherstellbar.</div>' +
      '<div class="card"><h3>' + (existing ? 'Tresor entsperren' : 'Verschlüsselten Tresor anlegen') + '</h3>' +
      '<p class="muted">' + (existing ? 'Gib deine bisherige Passphrase ein.' : 'Lege eine Passphrase mit mindestens 12 Zeichen fest.') + '</p>' +
      '<form id="h167-unlock-form"><label>Passphrase</label><input id="h167-pass" type="password" minlength="12" autocomplete="current-password" required placeholder="Mindestens 12 Zeichen" />' +
      '<button class="primary" type="submit">' + (existing ? 'Tresor entsperren' : 'Tresor erstellen') + '</button></form><div id="h167-gate-status" class="muted" aria-live="polite"></div>' +
      '<div class="row"><button type="button" id="h167-import">Verschlüsseltes Backup importieren</button><input id="h167-import-file" type="file" accept="application/json,.json" hidden /></div></div>' +
      (existing ? '<button id="h167-backup">Verschlüsseltes Backup herunterladen</button>' : '') +
      '<p class="muted">Diese App sendet keine Einträge an einen Server. Die Verschlüsselung schützt gespeicherte Daten, ersetzt aber keine Gerätesicherung, Zugriffssperre oder Datenschutzprüfung deiner Organisation.</p>';
    root.querySelector('#h167-unlock-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var pass = root.querySelector('#h167-pass').value;
      var status = root.querySelector('#h167-gate-status');
      if (pass.length < 12) { status.textContent = 'Bitte mindestens 12 Zeichen verwenden.'; return; }
      status.textContent = 'Tresor wird geöffnet …';
      unlock(config, pass).then(function () {
        root.querySelector('#h167-pass').value = '';
        renderWorkspace(root, config);
      }).catch(function (error) {
        status.textContent = error.message || 'Entsperren fehlgeschlagen.';
      });
    });
    var backup = root.querySelector('#h167-backup');
    if (backup) backup.addEventListener('click', function () { downloadEncryptedBackup(config); });
    var importButton = root.querySelector('#h167-import');
    var importFile = root.querySelector('#h167-import-file');
    if (importButton && importFile) {
      importButton.addEventListener('click', function () {
        var pass = root.querySelector('#h167-pass').value;
        var status = root.querySelector('#h167-gate-status');
        if (pass.length < 12) {
          status.textContent = 'Bitte zuerst die Passphrase des Backups eingeben (mindestens 12 Zeichen).';
          root.querySelector('#h167-pass').focus();
          return;
        }
        importFile.click();
      });
      importFile.addEventListener('change', function () {
        var file = importFile.files && importFile.files[0];
        var pass = root.querySelector('#h167-pass').value;
        var status = root.querySelector('#h167-gate-status');
        if (!file) return;
        status.textContent = 'Backup wird geprüft und entschlüsselt …';
        importEncryptedBackup(config, file, pass).then(function () {
          root.querySelector('#h167-pass').value = '';
          status.textContent = 'Backup erfolgreich geprüft und importiert.';
          renderWorkspace(root, config);
        }).catch(function (error) {
          status.textContent = error.message || 'Backup-Import fehlgeschlagen.';
        }).finally(function () { importFile.value = ''; });
      });
    }
  }
  function renderWorkspace(root, config) {
    var vault = vaults[config.id];
    if (!vault) return renderGate(root, config);
    var editingId = null, search = '';
    function fieldMarkup(field) {
      var id = field[0], label = field[1], type = field[2], required = field[3];
      if (type === 'textarea') return '<label>' + esc(label) + '</label><textarea name="' + id + '" maxlength="2000"></textarea>';
      return '<label>' + esc(label) + '</label><input name="' + id + '" type="' + type + '" maxlength="240" ' + (required ? 'required' : '') + ' />';
    }
    function render() {
      vault = vaults[config.id];
      if (!vault) return renderGate(root, config);
      var records = vault.records.filter(function (record) {
        return !search || JSON.stringify(record).toLowerCase().indexOf(search.toLowerCase()) !== -1;
      });
      root.innerHTML = css +
        '<div class="hero"><h2>' + esc(config.icon + ' ' + config.title) + '</h2><div class="muted">' + esc(config.description) + '</div><span class="pill">🔒 Entsperrt · lokal verschlüsselt</span></div>' +
        '<div class="notice">Dokumentationshilfe – keine Diagnose, keine Bewertung von Laborwerten und keine Empfehlung oder Änderung von Medikamentendosierungen. Maßgeblich sind Originalbefund und ärztliche Verordnung.</div>' +
        '<form id="h167-record-form" class="card"><h3>' + (editingId ? 'Eintrag bearbeiten' : '＋ Neuer Eintrag') + '</h3>' +
        config.fields.map(fieldMarkup).join('') +
        '<div class="row"><button class="primary" type="submit">' + (editingId ? 'Änderungen verschlüsselt speichern' : 'Eintrag verschlüsselt speichern') + '</button><button type="button" id="h167-cancel">Abbrechen</button></div></form>' +
        '<div class="row"><input id="h167-search" type="search" placeholder="Einträge durchsuchen …" value="' + esc(search) + '"/><button id="h167-backup">Verschlüsseltes Backup</button><button class="danger" id="h167-lock">Tresor sperren</button></div>' +
        '<div class="muted">' + vault.records.length + ' Einträge gespeichert · nur auf diesem Gerät in diesem Browser</div>' +
        (records.length ? records.map(function (record) {
          var title = record.name || record.medication || 'Eintrag';
          var sub = config.id === 'laborwerte-pro'
            ? [record.value, record.unit, record.date, record.reference ? 'Referenz: ' + record.reference : ''].filter(Boolean).join(' · ')
            : [record.dose, record.route, record.times, record.start ? 'Beginn: ' + record.start : ''].filter(Boolean).join(' · ');
          return '<div class="card"><div class="record-title">' + esc(title) + '</div><div class="muted">' + esc(sub) + '</div>' +
            (record.note ? '<p>' + esc(record.note) + '</p>' : '') +
            '<div class="row"><button data-edit="' + esc(record.id) + '">Bearbeiten</button><button class="danger" data-delete="' + esc(record.id) + '">Löschen</button></div></div>';
        }).join('') : '<div class="empty">Noch keine Einträge oder keine Treffer.</div>') +
        '<p class="muted">Vor jedem Eintrag die Angaben mit dem Originaldokument abgleichen. Einheiten, Referenzbereiche und Dosierungen nicht automatisch ergänzen oder umrechnen.</p>';
      root.querySelector('#h167-search').addEventListener('input', function (e) { search = e.target.value; render(); var input = root.querySelector('#h167-search'); input.focus(); input.setSelectionRange(search.length, search.length); });
      root.querySelector('#h167-backup').addEventListener('click', function () { downloadEncryptedBackup(config); });
      root.querySelector('#h167-lock').addEventListener('click', function () { lock(config); renderGate(root, config); });
      root.querySelector('#h167-cancel').addEventListener('click', function () { editingId = null; render(); });
      root.querySelectorAll('[data-edit]').forEach(function (button) {
        button.addEventListener('click', function () {
          var record = vault.records.find(function (x) { return x.id === button.getAttribute('data-edit'); });
          if (!record) return;
          editingId = record.id;
          render();
          var form = root.querySelector('#h167-record-form');
          config.fields.forEach(function (field) {
            var input = form.elements[field[0]];
            if (input) input.value = record[field[0]] || '';
          });
        });
      });
      root.querySelectorAll('[data-delete]').forEach(function (button) {
        button.addEventListener('click', function () {
          if (!window.confirm('Diesen Eintrag endgültig löschen?')) return;
          vault.records = vault.records.filter(function (x) { return x.id !== button.getAttribute('data-delete'); });
          save(config).then(render).catch(function (error) { notify(error.message, 'error'); });
        });
      });
      root.querySelector('#h167-record-form').addEventListener('submit', function (event) {
        event.preventDefault();
        var form = event.currentTarget, data = {};
        config.fields.forEach(function (field) {
          var input = form.elements[field[0]];
          data[field[0]] = String(input && input.value || '').trim();
        });
        if (!data.name || (config.id === 'laborwerte-pro' && !data.value) || (config.id === 'medikamentenplan-pro' && !data.dose)) {
          notify('Bitte die Pflichtfelder ausfüllen.', 'warning'); return;
        }
        if (editingId) {
          var old = vault.records.find(function (x) { return x.id === editingId; });
          if (old) Object.assign(old, data, {updatedAt:new Date().toISOString()});
        } else {
          data.id = uid();
          data.createdAt = new Date().toISOString();
          vault.records.unshift(data);
        }
        editingId = null;
        save(config).then(render).catch(function (error) { notify('Verschlüsseltes Speichern fehlgeschlagen: ' + error.message, 'error'); });
      });
    }
    render();
  }

  configs.forEach(function (config) {
    H[config.id] = {open:function () { openApp(config); }, version:BUILD};
    if (H.Registry && Array.isArray(H.Registry.featured)) {
      var found = H.Registry.featured.find(function (app) { return app && app.id === config.id; });
      if (found) { found.n = config.title; found.i = config.icon; }
      else H.Registry.featured.push({id:config.id,n:config.title,i:config.icon});
    }
  });
  if (H.Master && typeof H.Master.getCategoryApps === 'function') {
    var previousCategoryApps = H.Master.getCategoryApps.bind(H.Master);
    H.Master.getCategoryApps = function (letter) {
      var result = previousCategoryApps(letter) || [];
      var extra = configs.filter(function (config) {
        return (config.id === 'laborwerte-pro' && letter === 'L') ||
          (config.id === 'medikamentenplan-pro' && letter === 'M');
      }).map(function (config) { return {id:config.id,name:config.title,icon:config.icon}; });
      return result.concat(extra.filter(function (item) {
        return !result.some(function (existing) { return existing && existing.id === item.id; });
      }));
    };
  }
  var previousLaunch = H.Launch;
  H.Launch = function (app) {
    if (app && app.id === 'laborwerte-pro') return H['laborwerte-pro'].open();
    if (app && app.id === 'medikamentenplan-pro') return H['medikamentenplan-pro'].open();
    if (typeof previousLaunch === 'function') return previousLaunch.apply(this, arguments);
  };
  try {
    if (H.AppVoice && typeof H.AppVoice.command === 'function') {
      H.AppVoice.command('haldo-open-laborwerte',['öffne haldo laborwerte','starte laborwerte pro'],function () { H['laborwerte-pro'].open(); return 'HalDo Laborwerte Pro wird geöffnet.'; });
      H.AppVoice.command('haldo-open-medication-plan',['öffne haldo medikamentenplan','starte medikamentenplan pro'],function () { H['medikamentenplan-pro'].open(); return 'HalDo Medikamentenplan Pro wird geöffnet.'; });
    }
  } catch (error) { console.warn('[HalDo v167] Sprachbefehle:', error); }
  if (H.Master) H.Master.version = BUILD;
  console.info('HalDo v167: Laborwerte Pro und Medikamentenplan Pro registriert.');
})();