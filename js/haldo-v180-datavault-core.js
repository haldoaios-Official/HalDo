/* ================================================================
   HALDO AI OS PRO MAX — v180 DataVault Core
   Local-only encrypted IndexedDB vault, AES-GCM-256, PBKDF2-SHA-256.
   Passphrases are never persisted; CryptoKeys live in memory only.
   This service does not replace the legacy Arztbuch vault or backup.
   ================================================================ */
(function (window, document) {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var VERSION = '180.0.0';
  var DB_NAME = 'haldo_datavault_v180';
  var DB_VERSION = 1;
  var VAULT_ID = 'primary';
  var CHECK_ID = '__haldo_datavault_key_check__';
  var BACKUP_FORMAT = 'HalDoDataVaultEncryptedBackup';
  var ITERATIONS = 310000;
  var MAX_RECORD_BYTES = 2 * 1024 * 1024;
  var MAX_BACKUP_BYTES = 25 * 1024 * 1024;
  var MAX_RECORDS = 5000;
  var encoder = new TextEncoder();
  var decoder = new TextDecoder('utf-8', { fatal: true });
  var sessionKeys = new Map();
  var dbPromise = null;
  var APP_ID = 'data-vault';
  var ROOT_PREFIX = 'hdv180-';

  function secureCryptoAvailable() {
    return !!(window.isSecureContext && window.crypto && window.crypto.subtle &&
      window.crypto.getRandomValues && window.indexedDB);
  }

  function assertSecureRuntime() {
    if (!secureCryptoAvailable()) {
      throw new Error('HalDo DataVault benötigt HTTPS oder localhost, IndexedDB und Web Crypto.');
    }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function normalizePassphrase(value) {
    if (typeof value !== 'string') throw new TypeError('Bitte eine Passphrase eingeben.');
    var passphrase = value.normalize ? value.normalize('NFKC') : value;
    if (passphrase.length < 12) throw new Error('Die Passphrase muss mindestens 12 Zeichen enthalten.');
    if (passphrase.length > 200) throw new Error('Die Passphrase darf höchstens 200 Zeichen enthalten.');
    return passphrase;
  }

  function base64(bytes) {
    var output = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      output += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.length)));
    }
    return window.btoa(output);
  }

  function unbase64(value, maxBytes) {
    if (typeof value !== 'string' || value.length > Math.ceil((maxBytes || MAX_BACKUP_BYTES) * 4 / 3) + 8) {
      throw new Error('Ungültige verschlüsselte Backup-Daten.');
    }
    var raw;
    try { raw = window.atob(value); } catch (_) { throw new Error('Ungültige Base64-Daten im Backup.'); }
    if (raw.length > (maxBytes || MAX_BACKUP_BYTES)) throw new Error('Backup-Daten überschreiten das Limit.');
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function randomBytes(length) {
    var value = new Uint8Array(length);
    window.crypto.getRandomValues(value);
    return value;
  }

  function randomId() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();
    return Array.prototype.map.call(randomBytes(16), function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
  }

  function validateRecordId(id) {
    if (typeof id !== 'string' || !/^[a-f0-9-]{16,64}$/i.test(id)) {
      throw new Error('Ungültige Datensatzkennung.');
    }
    return id;
  }

  function keyFor(id) {
    return VAULT_ID + ':' + validateRecordId(id);
  }

  function aadFor(recordId) {
    return encoder.encode(DB_NAME + '|1|' + VAULT_ID + '|' + recordId);
  }

  function deriveKey(passphrase, salt) {
    var pass = normalizePassphrase(passphrase);
    return window.crypto.subtle.importKey(
      'raw',
      encoder.encode(pass),
      'PBKDF2',
      false,
      ['deriveKey']
    ).then(function (baseKey) {
      return window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: ITERATIONS, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    });
  }

  function openDb() {
    assertSecureRuntime();
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var request;
      try { request = window.indexedDB.open(DB_NAME, DB_VERSION); }
      catch (error) { reject(error); return; }
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains('vaults')) {
          db.createObjectStore('vaults', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('records')) {
          var store = db.createObjectStore('records', { keyPath: 'key' });
          store.createIndex('vaultId', 'vaultId', { unique: false });
        }
      };
      request.onsuccess = function () {
        var db = request.result;
        db.onversionchange = function () {
          try { db.close(); } catch (_) {}
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = function () {
        dbPromise = null;
        reject(request.error || new Error('IndexedDB konnte nicht geöffnet werden.'));
      };
      request.onblocked = function () {
        dbPromise = null;
        reject(new Error('Eine andere HalDo DataVault-Verbindung blockiert die Datenbankaktualisierung.'));
      };
    });
    return dbPromise;
  }

  function idbGet(storeName, key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction([storeName], 'readonly');
        var request = tx.objectStore(storeName).get(key);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error || new Error('IndexedDB-Lesevorgang fehlgeschlagen.')); };
        tx.onerror = function () { reject(tx.error || new Error('IndexedDB-Lesetransaktion fehlgeschlagen.')); };
      });
    });
  }

  function idbGetAll(storeName) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction([storeName], 'readonly');
        var request = tx.objectStore(storeName).getAll();
        request.onsuccess = function () { resolve(request.result || []); };
        request.onerror = function () { reject(request.error || new Error('IndexedDB-Lesevorgang fehlgeschlagen.')); };
        tx.onerror = function () { reject(tx.error || new Error('IndexedDB-Lesetransaktion fehlgeschlagen.')); };
      });
    });
  }

  function idbCountByVault() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(['records'], 'readonly');
        var request = tx.objectStore('records').index('vaultId').count(VAULT_ID);
        request.onsuccess = function () { resolve(request.result || 0); };
        request.onerror = function () { reject(request.error || new Error('IndexedDB-Zählung fehlgeschlagen.')); };
        tx.onerror = function () { reject(tx.error || new Error('IndexedDB-Zähltransaktion fehlgeschlagen.')); };
      });
    });
  }

  function idbWrite(storeNames, callback) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx;
        try {
          tx = db.transaction(storeNames, 'readwrite');
          callback(tx);
        } catch (error) {
          reject(error);
          return;
        }
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error || new Error('IndexedDB-Schreibvorgang fehlgeschlagen.')); };
        tx.onabort = function () { reject(tx.error || new Error('IndexedDB-Schreibvorgang wurde abgebrochen.')); };
      });
    });
  }

  function emitAudit(action, status, resourceType, count) {
    try {
      if (H.AICore && H.AICore.events && typeof H.AICore.events.emit === 'function') {
        H.AICore.events.emit('datavault:operation', {
          appId: APP_ID,
          action: action,
          status: status,
          resourceType: resourceType,
          source: 'datavault-core',
          count: typeof count === 'number' ? count : 0
        });
      }
    } catch (error) {
      console.warn('[HalDo v180] Audit-Metadaten konnten nicht publiziert werden:', error);
    }
  }

  function getVaultMeta() {
    return idbGet('vaults', VAULT_ID);
  }

  function create(passphrase) {
    assertSecureRuntime();
    var normalized = normalizePassphrase(passphrase);
    return getVaultMeta().then(function (existing) {
      if (existing) throw new Error('Ein HalDo DataVault existiert bereits. Bitte entsperren oder das Backup importieren.');
      var salt = randomBytes(16);
      return deriveKey(normalized, salt).then(function (key) {
        var checkIv = randomBytes(12);
        var checkAad = aadFor(CHECK_ID);
        return window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: checkIv, additionalData: checkAad },
          key,
          encoder.encode('HALDO-DATAVAULT-V180-KEY-CHECK')
        ).then(function (cipher) {
          var meta = {
            id: VAULT_ID,
            version: 1,
            algorithm: 'AES-GCM-256',
            kdf: 'PBKDF2-SHA-256',
            iterations: ITERATIONS,
            salt: base64(salt),
            checkIv: base64(checkIv),
            checkCiphertext: base64(new Uint8Array(cipher)),
            createdAt: new Date().toISOString()
          };
          return idbWrite(['vaults'], function (tx) {
            tx.objectStore('vaults').add(meta);
          }).then(function () {
            sessionKeys.set(VAULT_ID, key);
            emitAudit('vault-create', 'success', 'encrypted-vault', 0);
            return { created: true, unlocked: true };
          });
        });
      });
    });
  }

  function verifyKey(meta, key) {
    return window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: unbase64(meta.checkIv, 12),
        additionalData: aadFor(CHECK_ID)
      },
      key,
      unbase64(meta.checkCiphertext, 128)
    ).then(function (plain) {
      if (decoder.decode(plain) !== 'HALDO-DATAVAULT-V180-KEY-CHECK') {
        throw new Error('Passphrase falsch oder Tresor beschädigt.');
      }
      return true;
    });
  }

  function unlock(passphrase) {
    assertSecureRuntime();
    var normalized = normalizePassphrase(passphrase);
    return getVaultMeta().then(function (meta) {
      if (!meta) throw new Error('Es wurde noch kein HalDo DataVault angelegt.');
      if (meta.version !== 1 || meta.algorithm !== 'AES-GCM-256' ||
          meta.kdf !== 'PBKDF2-SHA-256' || meta.iterations !== ITERATIONS) {
        throw new Error('Das Tresorformat oder die Schlüsselableitung wird nicht unterstützt.');
      }
      return deriveKey(normalized, unbase64(meta.salt, 16)).then(function (key) {
        return verifyKey(meta, key).then(function () {
          sessionKeys.set(VAULT_ID, key);
          emitAudit('vault-unlock', 'success', 'encrypted-vault', 0);
          return { unlocked: true };
        });
      }).catch(function () {
        sessionKeys.delete(VAULT_ID);
        throw new Error('Entsperren fehlgeschlagen. Prüfe die Passphrase oder die Tresordaten.');
      });
    });
  }

  function requireKey() {
    var key = sessionKeys.get(VAULT_ID);
    if (!key) throw new Error('HalDo DataVault ist gesperrt. Bitte zuerst entsperren.');
    return key;
  }

  function isUnlocked() {
    return sessionKeys.has(VAULT_ID);
  }

  function lock() {
    var removed = sessionKeys.delete(VAULT_ID);
    if (removed) emitAudit('vault-lock', 'success', 'encrypted-vault', 0);
    return removed;
  }

  function lockAll() {
    var count = sessionKeys.size;
    sessionKeys.clear();
    if (count) emitAudit('vault-lock-all', 'success', 'encrypted-vault', count);
    return count;
  }

  function normalizePayload(value) {
    var serialized;
    try { serialized = JSON.stringify(value); } catch (_) {
      throw new Error('Der Datensatz enthält nicht serialisierbare Werte.');
    }
    if (typeof serialized !== 'string' || serialized === 'undefined') {
      throw new Error('Der Datensatz muss gültige JSON-Daten enthalten.');
    }
    var bytes = encoder.encode(serialized);
    if (bytes.length > MAX_RECORD_BYTES) throw new Error('Ein Datensatz darf höchstens 2 MB groß sein.');
    return { serialized: serialized, bytes: bytes };
  }

  function put(value, existingId) {
    var key = requireKey();
    var payload = normalizePayload(value);
    var id = existingId ? validateRecordId(existingId) : randomId();
    var storageKey = keyFor(id);
    return idbGet('records', storageKey).then(function (existing) {
      if (existingId && (!existing || existing.vaultId !== VAULT_ID)) {
        throw new Error('Der zu bearbeitende Datensatz wurde nicht gefunden.');
      }
      if (!existingId) {
        return idbCountByVault().then(function (count) {
          if (count >= MAX_RECORDS) throw new Error('Der Tresor ist auf 5.000 Datensätze begrenzt.');
          return null;
        });
      }
      return existing;
    }).then(function (existing) {
      var iv = randomBytes(12);
      return window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv, additionalData: aadFor(id) },
        key,
        payload.bytes
      ).then(function (cipher) {
        var now = new Date().toISOString();
        var item = {
          key: storageKey,
          vaultId: VAULT_ID,
          id: id,
          iv: base64(iv),
          ciphertext: base64(new Uint8Array(cipher)),
          createdAt: existing && existing.createdAt || now,
          updatedAt: now
        };
        return idbWrite(['records'], function (tx) {
          tx.objectStore('records').put(item);
        }).then(function () {
          emitAudit(existing ? 'record-update' : 'record-create', 'success', 'encrypted-record', 1);
          return id;
        });
      });
    });
  }

  function decryptRecord(item, key) {
    return window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: unbase64(item.iv, 12),
        additionalData: aadFor(item.id)
      },
      key,
      unbase64(item.ciphertext, MAX_RECORD_BYTES + 32)
    ).then(function (plain) {
      var text = decoder.decode(plain);
      if (encoder.encode(text).length > MAX_RECORD_BYTES) throw new Error('Datensatz überschreitet das Größenlimit.');
      return JSON.parse(text);
    });
  }

  function get(id) {
    var key = requireKey();
    var storageKey = keyFor(id);
    return idbGet('records', storageKey).then(function (item) {
      if (!item || item.vaultId !== VAULT_ID) return null;
      return decryptRecord(item, key).catch(function () {
        throw new Error('Datensatz konnte nicht authentifiziert oder entschlüsselt werden.');
      });
    });
  }

  function list() {
    requireKey();
    return idbGetAll('records').then(function (items) {
      return items.filter(function (item) { return item.vaultId === VAULT_ID; })
        .map(function (item) {
          return { id: item.id, createdAt: item.createdAt, updatedAt: item.updatedAt };
        }).sort(function (a, b) {
          return String(b.updatedAt).localeCompare(String(a.updatedAt));
        });
    });
  }

  function deleteRecord(id) {
    requireKey();
    var storageKey = keyFor(id);
    return idbGet('records', storageKey).then(function (item) {
      if (!item || item.vaultId !== VAULT_ID) return false;
      return idbWrite(['records'], function (tx) {
        tx.objectStore('records').delete(storageKey);
      }).then(function () {
        emitAudit('record-delete', 'success', 'encrypted-record', 1);
        return true;
      });
    });
  }

  function exportEncryptedBackup() {
    requireKey();
    return Promise.all([getVaultMeta(), idbGetAll('records')]).then(function (results) {
      var meta = results[0];
      if (!meta) throw new Error('Der Tresor wurde nicht gefunden.');
      var records = results[1].filter(function (item) { return item.vaultId === VAULT_ID; });
      var pack = {
        format: BACKUP_FORMAT,
        version: 1,
        encrypted: true,
        algorithm: meta.algorithm,
        kdf: meta.kdf,
        iterations: meta.iterations,
        vault: {
          id: meta.id,
          version: meta.version,
          algorithm: meta.algorithm,
          kdf: meta.kdf,
          iterations: meta.iterations,
          salt: meta.salt,
          checkIv: meta.checkIv,
          checkCiphertext: meta.checkCiphertext,
          createdAt: meta.createdAt
        },
        records: records.map(function (item) {
          return {
            id: item.id,
            iv: item.iv,
            ciphertext: item.ciphertext,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          };
        }),
        exportedAt: new Date().toISOString()
      };
      var serialized = JSON.stringify(pack);
      if (encoder.encode(serialized).length > MAX_BACKUP_BYTES) {
        throw new Error('Das verschlüsselte Backup überschreitet 25 MB.');
      }
      emitAudit('backup-export', 'success', 'encrypted-backup', records.length);
      return pack;
    });
  }

  function validateBackup(input) {
    var pack = input;
    if (typeof input === 'string') {
      if (encoder.encode(input).length > MAX_BACKUP_BYTES) throw new Error('Backup-Datei überschreitet 25 MB.');
      try { pack = JSON.parse(input); } catch (_) { throw new Error('Backup-Datei ist kein gültiges JSON.'); }
    }
    if (!pack || Object.prototype.toString.call(pack) !== '[object Object]' ||
        pack.format !== BACKUP_FORMAT || pack.version !== 1 || pack.encrypted !== true ||
        !pack.vault || pack.vault.id !== VAULT_ID || pack.vault.version !== 1 ||
        pack.algorithm !== 'AES-GCM-256' || pack.kdf !== 'PBKDF2-SHA-256' ||
        pack.iterations !== ITERATIONS || pack.vault.algorithm !== 'AES-GCM-256' ||
        pack.vault.kdf !== 'PBKDF2-SHA-256' || pack.vault.iterations !== ITERATIONS ||
        !Array.isArray(pack.records) || pack.records.length > MAX_RECORDS) {
      throw new Error('Backup-Format oder Verschlüsselungsparameter werden nicht unterstützt.');
    }
    unbase64(pack.vault.salt, 16);
    if (unbase64(pack.vault.salt, 16).length !== 16 ||
        unbase64(pack.vault.checkIv, 12).length !== 12 ||
        unbase64(pack.vault.checkCiphertext, 128).length < 16) {
      throw new Error('Backup-Schlüsselprüfung ist ungültig.');
    }
    var seen = new Set();
    var total = 0;
    var records = pack.records.map(function (item) {
      if (!item || typeof item !== 'object') throw new Error('Backup enthält einen ungültigen Datensatz.');
      var id = validateRecordId(item.id);
      if (seen.has(id)) throw new Error('Backup enthält doppelte Datensatzkennungen.');
      seen.add(id);
      if (unbase64(item.iv, 12).length !== 12) throw new Error('Backup enthält eine ungültige IV.');
      var cipher = unbase64(item.ciphertext, MAX_RECORD_BYTES + 32);
      if (cipher.length < 16) throw new Error('Backup enthält einen unvollständigen Chiffretext.');
      total += cipher.length;
      if (total > MAX_BACKUP_BYTES) throw new Error('Backup-Daten überschreiten das Gesamtlimit.');
      return {
        key: keyFor(id),
        vaultId: VAULT_ID,
        id: id,
        iv: item.iv,
        ciphertext: item.ciphertext,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : ''
      };
    });
    var meta = {
      id: VAULT_ID,
      version: 1,
      algorithm: 'AES-GCM-256',
      kdf: 'PBKDF2-SHA-256',
      iterations: ITERATIONS,
      salt: pack.vault.salt,
      checkIv: pack.vault.checkIv,
      checkCiphertext: pack.vault.checkCiphertext,
      createdAt: typeof pack.vault.createdAt === 'string' ? pack.vault.createdAt : ''
    };
    return { meta: meta, records: records };
  }

  function importEncryptedBackup(input, passphrase) {
    assertSecureRuntime();
    var normalized = normalizePassphrase(passphrase);
    var validated = validateBackup(input);
    return getVaultMeta().then(function (existing) {
      if (existing) throw new Error('Import abgebrochen: In diesem Browser existiert bereits ein DataVault. Zuerst separat sichern und löschen.');
      return deriveKey(normalized, unbase64(validated.meta.salt, 16)).then(function (key) {
        return verifyKey(validated.meta, key).then(function () {
          return validated.records.reduce(function (chain, item) {
            return chain.then(function () {
              return decryptRecord(item, key).then(function (payload) {
                normalizePayload(payload);
              }).catch(function () {
                throw new Error('Backup-Prüfung fehlgeschlagen. Passphrase oder Datensatz ist ungültig.');
              });
            });
          }, Promise.resolve()).then(function () {
            return idbWrite(['vaults', 'records'], function (tx) {
              tx.objectStore('vaults').add(validated.meta);
              var store = tx.objectStore('records');
              validated.records.forEach(function (item) { store.add(item); });
            });
          }).then(function () {
            sessionKeys.set(VAULT_ID, key);
            emitAudit('backup-import', 'success', 'encrypted-backup', validated.records.length);
            return { imported: true, records: validated.records.length, unlocked: true };
          });
        }).catch(function (error) {
          if (error && /Import abgebrochen/.test(error.message || '')) throw error;
          throw new Error('Backup-Import fehlgeschlagen. Prüfe die Passphrase und die Integrität der Datei.');
        });
      });
    });
  }

  function deleteVault() {
    requireKey();
    return idbWrite(['vaults', 'records'], function (tx) {
      tx.objectStore('vaults').delete(VAULT_ID);
      tx.objectStore('records').clear();
    }).then(function () {
      sessionKeys.delete(VAULT_ID);
      emitAudit('vault-delete', 'success', 'encrypted-vault', 0);
      return true;
    });
  }

  function getStatus() {
    if (!secureCryptoAvailable()) {
      return Promise.resolve({
        version: VERSION,
        storage: 'unavailable',
        storageAvailable: false,
        vaultExists: false,
        unlocked: false,
        recordCount: 0,
        keyPersistence: 'memory-only',
        remoteSync: false,
        keyRecovery: false
      });
    }
    return Promise.all([getVaultMeta(), idbCountByVault()]).then(function (results) {
      return {
        version: VERSION,
        storage: 'indexeddb-encrypted',
        storageAvailable: true,
        vaultExists: !!results[0],
        unlocked: isUnlocked(),
        recordCount: results[1],
        algorithm: 'AES-GCM-256',
        kdf: 'PBKDF2-SHA-256',
        iterations: ITERATIONS,
        keyPersistence: 'memory-only',
        passphraseStored: false,
        remoteSync: false,
        keyRecovery: false
      };
    });
  }

  function uid() {
    return ROOT_PREFIX + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function open() {
    var rootId = uid();
    var winId = H.Win.open('🔐 HalDo DataVault Pro', '<div id="' + esc(rootId) + '" class="hdv180-root"></div>', { w: 820, h: 760 });
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root) { lock(); return; }
      var query = '';
      var renderSequence = 0;
      var observer = new MutationObserver(function () {
        if (root.isConnected) return;
        lock();
        observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      function notice(message, type) {
        var host = root.querySelector('[data-vault-notice]');
        if (!host) return;
        host.textContent = message;
        host.style.color = type === 'error' ? '#ff9a9a' : type === 'success' ? '#86efac' : 'var(--text,#eef5ff)';
      }

      function downloadBackup(pack) {
        var blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'haldo-datavault-' + new Date().toISOString().slice(0, 10) + '.hdvault';
        link.click();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      }

      function renderRecords(host, status) {
        var sequence = ++renderSequence;
        host.textContent = 'Verschlüsselte Einträge werden geladen …';
        if (!status.unlocked) return;
        list().then(function (items) {
          var selected = items.slice(0, 50);
          return Promise.all(selected.map(function (item) {
            return get(item.id).then(function (payload) {
              return { meta: item, payload: payload };
            });
          }));
        }).then(function (items) {
          if (!root.isConnected || sequence !== renderSequence) return;
          var visible = items.filter(function (item) {
            var title = item.payload && item.payload.title || '';
            var body = item.payload && item.payload.body || '';
            return (String(title) + ' ' + String(body)).toLowerCase().indexOf(query.toLowerCase()) !== -1;
          });
          host.innerHTML = visible.map(function (item) {
            var payload = item.payload && typeof item.payload === 'object' ? item.payload : {};
            var title = payload.title || 'Unbenannter Eintrag';
            var body = String(payload.body || '').slice(0, 240);
            return '<article class="hdv180-record"><div><strong>' + esc(title) + '</strong><p>' +
              esc(body || 'Kein Zusatztext') + '</p><small>' + esc(item.meta.updatedAt) + '</small></div>' +
              '<button type="button" data-delete-record="' + esc(item.meta.id) + '">Löschen</button></article>';
          }).join('') || '<p class="hdv180-muted">Noch keine passenden Datensätze gespeichert.</p>';
        }).catch(function (error) {
          if (root.isConnected && sequence === renderSequence) host.textContent = error.message || 'Datensätze konnten nicht geladen werden.';
        });
      }

      function render() {
        if (!root.isConnected) return;
        var sequence = ++renderSequence;
        getStatus().then(function (status) {
          if (!root.isConnected || sequence !== renderSequence) return;
          var styles = '<style>' +
            '.hdv180-root{font:14px/1.5 system-ui,sans-serif;color:var(--text,#edf6ff);padding:10px;box-sizing:border-box;height:100%;overflow:auto}' +
            '.hdv180-root *{box-sizing:border-box}.hdv180-hero{padding:18px;border-radius:16px;border:1px solid rgba(56,189,248,.3);background:linear-gradient(120deg,rgba(14,165,233,.17),rgba(124,58,237,.18));margin-bottom:13px}' +
            '.hdv180-root .hdv180-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px}' +
            '.hdv180-root .hdv180-card{padding:12px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:12px;background:rgba(255,255,255,.035);margin:9px 0}' +
            '.hdv180-root input,.hdv180-root textarea{width:100%;padding:10px;border-radius:9px;border:1px solid var(--border,rgba(255,255,255,.2));background:rgba(0,0,0,.2);color:inherit;font:inherit;margin:4px 0}' +
            '.hdv180-root textarea{min-height:92px;resize:vertical}.hdv180-root button{padding:9px 12px;border-radius:9px;border:1px solid rgba(56,189,248,.4);background:rgba(14,165,233,.12);color:inherit;cursor:pointer;margin:3px}' +
            '.hdv180-root button.primary{background:linear-gradient(110deg,#087fae,#6546b8);border:0}.hdv180-root button.danger{border-color:rgba(255,100,120,.45)}' +
            '.hdv180-root .hdv180-muted{opacity:.7;font-size:12px}.hdv180-root .hdv180-record{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px;margin:8px 0;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:11px}' +
            '.hdv180-root .hdv180-record p{margin:4px 0;opacity:.8;overflow-wrap:anywhere}.hdv180-root .hdv180-record small{opacity:.55}@media(max-width:520px){.hdv180-root .hdv180-record{align-items:flex-start;flex-direction:column}}' +
            '</style>';
          var header = '<section class="hdv180-hero"><div style="font-size:30px">🔐</div><h2 style="margin:3px 0 5px;color:var(--accent,#67e8f9)">HalDo DataVault Pro</h2>' +
            '<div class="hdv180-muted">Lokaler verschlüsselter Datentresor · AES-GCM-256 · PBKDF2-SHA-256</div></section>' +
            '<div class="hdv180-grid"><div class="hdv180-card"><strong>' + (status.vaultExists ? 'Tresor angelegt' : 'Noch kein Tresor') + '</strong><div class="hdv180-muted">Tresorstatus</div></div>' +
            '<div class="hdv180-card"><strong>' + (status.unlocked ? 'Entsperrt' : 'Gesperrt') + '</strong><div class="hdv180-muted">Arbeitssitzung</div></div>' +
            '<div class="hdv180-card"><strong>' + status.recordCount + '</strong><div class="hdv180-muted">Verschlüsselte Datensätze</div></div></div>';
          var auth = !status.unlocked ? '<section class="hdv180-card"><h3 style="margin-top:0">' + (status.vaultExists ? 'Tresor entsperren' : 'Neuen Tresor erstellen') + '</h3>' +
            '<form data-vault-auth><label>Passphrase (mindestens 12 Zeichen)</label><input type="password" name="passphrase" autocomplete="new-password" minlength="12" maxlength="200" required>' +
            '<button class="primary" type="submit">' + (status.vaultExists ? '🔓 Entsperren' : '✨ Tresor erstellen') + '</button></form>' +
            '<p class="hdv180-muted">Die Passphrase wird weder gespeichert noch übertragen. Bei Verlust gibt es keine Rücksetzung. Der Arbeitsschlüssel bleibt nur bis zum Sperren, Schließen oder Neuladen im Arbeitsspeicher.</p></section>' : '';
          var importMarkup = !status.vaultExists ? '<section class="hdv180-card"><h3 style="margin-top:0">Verschlüsseltes Backup importieren</h3><label>Datei auswählen</label><input type="file" accept=".hdvault,.json,application/json" data-vault-import-file><button type="button" data-vault-import>Backup prüfen und importieren</button><p class="hdv180-muted">Import ist nur möglich, wenn in diesem Browser noch kein DataVault vorhanden ist.</p></section>' : '';
          var workspace = '';
          if (status.unlocked) {
            workspace = '<section class="hdv180-card"><h3 style="margin-top:0">＋ Verschlüsselten Datensatz speichern</h3><form data-vault-record-form><label>Titel</label><input name="title" maxlength="180" required placeholder="z. B. Persönliche Notiz"><label>Inhalt</label><textarea name="body" maxlength="2000000" placeholder="Inhalt wird vor dem Speichern lokal verschlüsselt."></textarea><button class="primary" type="submit">Verschlüsselt speichern</button></form></section>' +
              '<section class="hdv180-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3 style="margin:0">Tresor-Inhalt</h3><input data-vault-search placeholder="Entschlüsselt suchen …" style="max-width:230px"></div><div data-vault-records></div></section>' +
              '<section class="hdv180-card"><h3 style="margin-top:0">Sicherung und Verwaltung</h3><button type="button" data-vault-export>🔒 Verschlüsseltes Backup exportieren</button><button type="button" data-vault-lock>🔐 Jetzt sperren</button><button type="button" class="danger" data-vault-delete>Gesamten Tresor löschen</button></section>';
          }
          root.innerHTML = styles + header + auth + importMarkup + workspace +
            '<p class="hdv180-muted" data-vault-notice role="status" aria-live="polite"></p>' +
            '<p class="hdv180-muted">Speicherung erfolgt ausschließlich lokal in IndexedDB. Keine Cloud-Synchronisierung, kein Konten- oder Wiederherstellungsdienst und keine automatische Migration aus dem Arztbuch-Tresor. Vor echten Gesundheitsdaten sind zusätzliche Sicherheits- und Datenschutzprüfungen erforderlich.</p>';

          var authForm = root.querySelector('[data-vault-auth]');
          if (authForm) authForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var form = event.currentTarget;
            var pass = form.elements.passphrase.value;
            var action = status.vaultExists ? unlock : create;
            var submit = form.querySelector('button');
            submit.disabled = true;
            action(pass).then(function () {
              form.elements.passphrase.value = '';
              notice(status.vaultExists ? 'DataVault wurde entsperrt.' : 'DataVault wurde erstellt und entsperrt.', 'success');
              render();
            }).catch(function (error) {
              form.elements.passphrase.value = '';
              notice(error.message || 'Vorgang fehlgeschlagen.', 'error');
              submit.disabled = false;
            });
          });

          var importButton = root.querySelector('[data-vault-import]');
          if (importButton) importButton.addEventListener('click', function () {
            var fileInput = root.querySelector('[data-vault-import-file]');
            var file = fileInput && fileInput.files && fileInput.files[0];
            var pass = root.querySelector('[data-vault-auth] input[name="passphrase"]').value;
            if (!file) { notice('Bitte zuerst eine Backup-Datei auswählen.', 'error'); return; }
            if (file.size > MAX_BACKUP_BYTES) { notice('Backup-Datei überschreitet 25 MB.', 'error'); return; }
            file.text().then(function (text) {
              return importEncryptedBackup(text, pass);
            }).then(function (result) {
              root.querySelector('[data-vault-auth] input[name="passphrase"]').value = '';
              notice('Backup importiert: ' + result.records + ' Datensätze.', 'success');
              render();
            }).catch(function (error) {
              notice(error.message || 'Backup-Import fehlgeschlagen.', 'error');
            });
          });

          if (status.unlocked) {
            renderRecords(root.querySelector('[data-vault-records]'), status);
            root.querySelector('[data-vault-record-form]').addEventListener('submit', function (event) {
              event.preventDefault();
              var form = event.currentTarget;
              put({ title: form.elements.title.value.trim(), body: form.elements.body.value }).then(function () {
                form.reset();
                notice('Datensatz verschlüsselt gespeichert.', 'success');
                render();
              }).catch(function (error) { notice(error.message || 'Speichern fehlgeschlagen.', 'error'); });
            });
            var search = root.querySelector('[data-vault-search]');
            search.value = query;
            search.addEventListener('input', function () {
              query = search.value;
              renderRecords(root.querySelector('[data-vault-records]'), status);
            });
            root.querySelector('[data-vault-export]').addEventListener('click', function () {
              exportEncryptedBackup().then(function (pack) {
                downloadBackup(pack);
                notice('Verschlüsseltes Backup exportiert.', 'success');
              }).catch(function (error) { notice(error.message || 'Backup-Export fehlgeschlagen.', 'error'); });
            });
            root.querySelector('[data-vault-lock]').addEventListener('click', function () {
              lock();
              render();
            });
            root.querySelector('[data-vault-delete]').addEventListener('click', function () {
              if (!window.confirm('Den gesamten HalDo DataVault einschließlich aller verschlüsselten Datensätze endgültig löschen?')) return;
              deleteVault().then(function () {
                notice('DataVault wurde gelöscht.', 'success');
                render();
              }).catch(function (error) { notice(error.message || 'Löschen fehlgeschlagen.', 'error'); });
            });
            root.querySelector('[data-vault-records]').addEventListener('click', function (event) {
              var button = event.target.closest('[data-delete-record]');
              if (!button) return;
              var id = button.getAttribute('data-delete-record');
              if (!window.confirm('Diesen verschlüsselten Datensatz löschen?')) return;
              deleteRecord(id).then(function () {
                notice('Datensatz gelöscht.', 'success');
                render();
              }).catch(function (error) { notice(error.message || 'Löschen fehlgeschlagen.', 'error'); });
            });
          }
        }).catch(function (error) {
          if (root.isConnected && sequence === renderSequence) {
            root.textContent = 'HalDo DataVault konnte nicht geladen werden: ' + (error.message || String(error));
          }
        });
      }

      render();
    }, 80);
    return winId;
  }

  var api = {
    version: VERSION,
    storageName: DB_NAME,
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA-256',
    iterations: ITERATIONS,
    limits: Object.freeze({ maxRecordBytes: MAX_RECORD_BYTES, maxRecords: MAX_RECORDS, maxBackupBytes: MAX_BACKUP_BYTES }),
    create: create,
    unlock: unlock,
    lock: lock,
    lockAll: lockAll,
    isUnlocked: isUnlocked,
    put: put,
    get: get,
    list: list,
    deleteRecord: deleteRecord,
    exportEncryptedBackup: exportEncryptedBackup,
    importEncryptedBackup: importEncryptedBackup,
    deleteVault: deleteVault,
    getStatus: getStatus,
    open: open
  };

  H.DataVault = api;
  H[APP_ID] = { open: open, version: VERSION, implementationKind: 'module' };

  if (H.Registry && Array.isArray(H.Registry.featured)) {
    var entry = H.Registry.featured.find(function (app) { return app && app.id === APP_ID; });
    if (entry) {
      entry.n = 'HalDo DataVault Pro';
      entry.i = '🔐';
    } else {
      H.Registry.featured.push({ id: APP_ID, n: 'HalDo DataVault Pro', i: '🔐' });
    }
    if (typeof H.Registry.registerCategoryApp === 'function') H.Registry.registerCategoryApp('D', APP_ID);
  }

  if (H.Master) {
    H.Master.dataVaultVersion = VERSION;
    H.Master.namedCoreApps = H.Registry && H.Registry.featured ? H.Registry.featured.length : H.Master.namedCoreApps;
  }

  if (H.AICore) {
    H.AICore.dataVault = Object.freeze({
      create: create,
      unlock: unlock,
      lock: lock,
      isUnlocked: isUnlocked,
      put: put,
      get: get,
      list: list,
      deleteRecord: deleteRecord,
      exportEncryptedBackup: exportEncryptedBackup,
      importEncryptedBackup: importEncryptedBackup,
      deleteVault: deleteVault,
      getStatus: getStatus,
      hasService: function () { return secureCryptoAvailable(); }
    });
    var previousStatus = H.AICore.getStatus;
    if (typeof previousStatus === 'function' && !previousStatus.__v180Wrapped) {
      var wrappedStatus = function () {
        var status = previousStatus.call(H.AICore);
        status.commonSecureVault = secureCryptoAvailable();
        status.dataVaultVersion = VERSION;
        status.vaultStorage = secureCryptoAvailable() ? 'indexeddb-encrypted' : 'unavailable';
        status.vaultKeyPersistence = 'memory-only';
        status.vaultRemoteSync = false;
        status.vaultKeyRecovery = false;
        return status;
      };
      wrappedStatus.__v180Wrapped = true;
      H.AICore.getStatus = wrappedStatus;
    }
  }

  window.addEventListener('pagehide', lockAll);
  console.info('[HalDo v180] DataVault Core bereit. Lokale Verschlüsselung:', secureCryptoAvailable());
})(window, document);
