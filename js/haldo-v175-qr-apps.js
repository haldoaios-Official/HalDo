/* ================================================================
   HALDO AI OS PRO MAX — v175 QR Apps
   HalDo QR Studio Pro + HalDo QR Sticker Pro
   QR payloads are generated in-browser; no QR API upload.
   Pinned renderer: qrcode@1.5.3 from jsDelivr.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo;
  var BUILD = '175.0.0';
  var QR_LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
  if (!H || !H.Win || !H.Store || H.__haldoV175QrApps) {
    if (H && !H.__haldoV175QrApps) console.error('[HalDo v175] HalDo Window/Store API is not available.');
    return;
  }
  H.__haldoV175QrApps = true;

  var qrLibraryPromise = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char];
    });
  }

  function ensureQrLibrary() {
    if (window.QRCode && typeof window.QRCode.toCanvas === 'function') return Promise.resolve(window.QRCode);
    if (qrLibraryPromise) return qrLibraryPromise;
    qrLibraryPromise = new Promise(function (resolve, reject) {
      var existing = document.getElementById('haldo-v175-qrcode-library');
      if (existing) {
        existing.addEventListener('load', function () {
          if (window.QRCode && typeof window.QRCode.toCanvas === 'function') resolve(window.QRCode);
          else reject(new Error('Die QR-Bibliothek wurde geladen, stellt aber keine toCanvas-Funktion bereit.'));
        }, { once:true });
        existing.addEventListener('error', function () { reject(new Error('Die QR-Bibliothek konnte nicht geladen werden.')); }, { once:true });
        return;
      }
      var script = document.createElement('script');
      script.id = 'haldo-v175-qrcode-library';
      script.src = QR_LIBRARY_URL;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = function () {
        if (window.QRCode && typeof window.QRCode.toCanvas === 'function') resolve(window.QRCode);
        else reject(new Error('Die QR-Bibliothek ist nicht verfügbar.'));
      };
      script.onerror = function () { reject(new Error('QR-Renderer konnte nicht geladen werden. Bitte Internetverbindung prüfen.')); };
      document.head.appendChild(script);
    }).catch(function (error) {
      qrLibraryPromise = null;
      throw error;
    });
    return qrLibraryPromise;
  }

  function openWindow(appId, title, width, height, mount) {
    var id = 'hdv175-' + appId + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    H.Win.open(title, '<div class="hdv175-root" data-hv175-app="' + esc(appId) + '" id="' + esc(id) + '"></div>', { w:width, h:height });
    window.setTimeout(function () {
      var root = document.getElementById(id);
      if (root && root.isConnected) mount(root);
    }, 80);
  }

  var CSS = '<style>' +
    '.hdv175-root{height:100%;overflow:auto;padding:14px;color:var(--text,#eaf6ff);font-family:inherit;box-sizing:border-box}' +
    '.hdv175-root *{box-sizing:border-box}' +
    '.hdv175-hero{padding:15px;border:1px solid var(--border,rgba(0,229,255,.22));border-radius:15px;background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(120,85,220,.08));margin-bottom:12px}' +
    '.hdv175-muted{font-size:12px;line-height:1.5;color:var(--muted,#9fb2c8)}' +
    '.hdv175-card{padding:13px;border:1px solid var(--border,rgba(0,229,255,.2));border-radius:13px;background:rgba(10,25,48,.55);margin-bottom:10px}' +
    '.hdv175-field{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border,rgba(0,229,255,.24));border-radius:9px;background:rgba(0,15,32,.65);color:var(--text,#eaf6ff);font:inherit}' +
    '.hdv175-label{display:block;font-size:11px;font-weight:700;color:var(--muted,#9fb2c8);margin:0 0 5px}' +
    '.hdv175-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '.hdv175-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.hdv175-btn{padding:9px 12px;border:1px solid var(--border,rgba(0,229,255,.28));border-radius:9px;color:var(--text,#eaf6ff);background:rgba(0,150,220,.12);font:inherit;font-size:12px;font-weight:700;cursor:pointer}' +
    '.hdv175-btn.primary{background:linear-gradient(135deg,#00d5ed,#62a8ff);border-color:transparent;color:#00121c}' +
    '.hdv175-btn:disabled{opacity:.45;cursor:not-allowed}' +
    '.hdv175-alert{padding:10px;border-radius:9px;border:1px solid rgba(255,185,70,.3);background:rgba(255,185,70,.08);font-size:12px;line-height:1.5}' +
    '.hdv175-result{display:grid;place-items:center;gap:9px;padding:15px;text-align:center}' +
    '.hdv175-canvas-wrap{display:inline-grid;place-items:center;background:#fff;border-radius:12px;padding:12px;max-width:100%}' +
    '.hdv175-canvas-wrap canvas{display:block;max-width:100%;height:auto}' +
    '.hdv175-sticker-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}' +
    '.hdv175-sticker{background:#fff;color:#0c1724;border:1px dashed #6d7e91;border-radius:10px;padding:12px;text-align:center;break-inside:avoid}' +
    '.hdv175-sticker strong{display:block;font-size:13px;margin-bottom:8px;overflow-wrap:anywhere}' +
    '.hdv175-sticker canvas{display:block;width:100%;max-width:220px;height:auto;margin:auto}' +
    '.hdv175-sticker small{display:block;color:#405165;font-size:10px;overflow-wrap:anywhere;margin-top:7px}' +
    '.hdv175-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}' +
    '@media(max-width:520px){.hdv175-grid,.hdv175-sticker-grid{grid-template-columns:1fr}.hdv175-root{padding:9px}}' +
    '@media print{body *{visibility:hidden!important}.hdv175-print-area,.hdv175-print-area *{visibility:visible!important}.hdv175-print-area{position:absolute!important;left:0!important;top:0!important;width:100%!important;padding:8mm!important;background:#fff!important}.hdv175-sticker-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8mm!important}.hdv175-sticker{border:1px dashed #777!important;break-inside:avoid!important}.hdv175-root [data-hv175-hide-print]{display:none!important}}' +
    '</style>';

  function valueOf(root, name) {
    var element = root.querySelector('[data-q175-field="' + name + '"]');
    return element ? String(element.value || '').trim() : '';
  }

  function escapeWifi(value) {
    return String(value).replace(/[\\;,:"]/g, function (char) { return '\\' + char; });
  }

  function escapeVCard(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }

  function buildPayload(type, root) {
    if (type === 'text') {
      var text = valueOf(root, 'text');
      if (!text) throw new Error('Bitte einen Text eingeben.');
      return text;
    }
    if (type === 'url') {
      var urlText = valueOf(root, 'url');
      if (!urlText) throw new Error('Bitte eine URL eingeben.');
      var parsed = new URL(urlText);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Nur HTTP- und HTTPS-Adressen sind erlaubt.');
      return parsed.toString();
    }
    if (type === 'wifi') {
      var ssid = valueOf(root, 'ssid');
      var password = valueOf(root, 'password');
      var encryption = valueOf(root, 'encryption');
      if (!ssid) throw new Error('Bitte den WLAN-Namen (SSID) eingeben.');
      if (encryption !== 'nopass' && !password) throw new Error('Bitte das WLAN-Passwort eingeben oder „Offen“ wählen.');
      return 'WIFI:T:' + encryption + ';S:' + escapeWifi(ssid) + ';P:' + escapeWifi(password) +
        ';H:' + (root.querySelector('[data-q175-field="hidden"]').checked ? 'true' : 'false') + ';;';
    }
    if (type === 'contact') {
      var first = valueOf(root, 'first');
      var last = valueOf(root, 'last');
      var phone = valueOf(root, 'phone');
      var email = valueOf(root, 'email');
      if (!first && !last && !phone && !email) throw new Error('Bitte mindestens Name, Telefon oder E-Mail eingeben.');
      return 'BEGIN:VCARD\r\nVERSION:3.0\r\nN:' + escapeVCard(last) + ';' + escapeVCard(first) +
        '\r\nFN:' + escapeVCard([first,last].filter(Boolean).join(' ')) +
        (phone ? '\r\nTEL;TYPE=CELL:' + escapeVCard(phone) : '') +
        (email ? '\r\nEMAIL:' + escapeVCard(email) : '') +
        '\r\nEND:VCARD';
    }
    if (type === 'email') {
      var mail = valueOf(root, 'email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) throw new Error('Bitte eine gültige Empfänger-Adresse eingeben.');
      var subject = valueOf(root, 'subject');
      var body = valueOf(root, 'body');
      return 'mailto:' + mail + (subject || body ? '?' + [
        subject ? 'subject=' + encodeURIComponent(subject) : '',
        body ? 'body=' + encodeURIComponent(body) : ''
      ].filter(Boolean).join('&') : '');
    }
    if (type === 'sms') {
      var number = valueOf(root, 'phone');
      if (!number) throw new Error('Bitte eine Telefonnummer eingeben.');
      return 'SMSTO:' + number + ':' + valueOf(root, 'body');
    }
    if (type === 'geo') {
      var latitude = valueOf(root, 'latitude');
      var longitude = valueOf(root, 'longitude');
      if (!latitude || !longitude) throw new Error('Bitte Breitengrad und Längengrad eingeben.');
      var lat = Number(latitude);
      var lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Bitte gültige Koordinaten eingeben (Breite −90 bis 90, Länge −180 bis 180).');
      }
      return 'geo:' + lat + ',' + lng;
    }
    throw new Error('Dieser QR-Typ ist nicht verfügbar.');
  }

  function generateCanvas(payload, canvas, width) {
    return ensureQrLibrary().then(function (library) {
      return new Promise(function (resolve, reject) {
        library.toCanvas(canvas, payload, {
          width:width || 280,
          margin:2,
          errorCorrectionLevel:'M',
          color:{ dark:'#07111f', light:'#ffffff' }
        }, function (error) {
          if (error) reject(error);
          else resolve(canvas);
        });
      });
    });
  }

  function downloadCanvas(canvas, filename) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('PNG-Datei konnte nicht erstellt werden.')); return; }
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        window.setTimeout(function () { URL.revokeObjectURL(url); resolve(); }, 1000);
      }, 'image/png');
    });
  }

  /* ------------------------------ QR STUDIO ------------------------------ */
  var QR_TYPES = [
    { id:'text',label:'Text',icon:'📝' },
    { id:'url',label:'Webadresse',icon:'🔗' },
    { id:'wifi',label:'WLAN-Zugang',icon:'📶' },
    { id:'contact',label:'Kontakt (vCard)',icon:'👤' },
    { id:'email',label:'E-Mail',icon:'✉️' },
    { id:'sms',label:'SMS',icon:'💬' },
    { id:'geo',label:'Standort',icon:'📍' }
  ];

  function openQrStudio() {
    openWindow('qr','HalDo QR Studio Pro',720,760,mountQrStudio);
  }

  function mountQrStudio(root) {
    var type = 'url';
    var canvasToken = 0;
    root.innerHTML = CSS +
      '<div class="hdv175-hero"><strong style="font-size:18px">📱 HalDo QR Studio Pro</strong><div class="hdv175-muted">QR-Codes für URLs, WLAN, Kontakte, E-Mail, SMS, Standorte und Text erzeugen.</div></div>' +
      '<div class="hdv175-card"><label class="hdv175-label" for="q175-type">QR-Typ</label><select class="hdv175-field" id="q175-type" data-q175-type>' +
        QR_TYPES.map(function (item) { return '<option value="' + item.id + '">' + item.icon + ' ' + item.label + '</option>'; }).join('') +
      '</select><div data-q175-fields style="margin-top:12px"></div><div class="hdv175-row" style="margin-top:12px"><button type="button" class="hdv175-btn primary" data-q175-generate>QR-Code erstellen</button><button type="button" class="hdv175-btn" data-q175-clear>Leeren</button></div></div>' +
      '<div class="hdv175-card" data-q175-output aria-live="polite"><div class="hdv175-muted">Der QR-Code erscheint nach der Erstellung.</div></div>' +
      '<div class="hdv175-alert">Datenschutz: Der Inhalt wird nur im Browser an den QR-Renderer übergeben. Er wird nicht an einen QR-Erzeugungsdienst hochgeladen. WLAN-Passwörter sind im fertigen QR-Code enthalten – teile solche Codes nur mit den vorgesehenen Personen.</div>';

    var fields = root.querySelector('[data-q175-fields]');
    var output = root.querySelector('[data-q175-output]');

    function renderFields() {
      var fieldMap = {
        text:[['text','Text oder Notiz','textarea']],
        url:[['url','https://example.com','url']],
        wifi:[['ssid','WLAN-Name (SSID)','text'],['password','WLAN-Passwort','password'],['encryption','Verschlüsselung','select'],['hidden','Verstecktes Netzwerk','checkbox']],
        contact:[['first','Vorname','text'],['last','Nachname','text'],['phone','Telefon','tel'],['email','E-Mail','email']],
        email:[['email','Empfänger-Adresse','email'],['subject','Betreff','text'],['body','Nachricht','textarea']],
        sms:[['phone','Telefonnummer','tel'],['body','Nachricht','textarea']],
        geo:[['latitude','Breitengrad','number'],['longitude','Längengrad','number']]
      };
      fields.innerHTML = (fieldMap[type] || []).map(function (field) {
        if (field[2] === 'checkbox') return '<label class="hdv175-row hdv175-muted"><input data-q175-field="' + field[0] + '" type="checkbox"> Verstecktes WLAN</label>';
        if (field[2] === 'select') return '<label class="hdv175-label">Sicherheit<select class="hdv175-field" data-q175-field="' + field[0] + '"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">Offenes Netzwerk</option></select></label>';
        if (field[2] === 'textarea') return '<label class="hdv175-label">' + esc(field[1]) + '<textarea class="hdv175-field" rows="3" data-q175-field="' + field[0] + '" placeholder="' + esc(field[1]) + '"></textarea></label>';
        return '<label class="hdv175-label">' + esc(field[1]) + '<input class="hdv175-field" type="' + esc(field[2]) + '" data-q175-field="' + field[0] + '" placeholder="' + esc(field[1]) + '" step="any"></label>';
      }).join('<div style="height:9px"></div>');
    }

    async function generate() {
      var token = ++canvasToken;
      output.innerHTML = '<div class="hdv175-muted">QR-Code wird erstellt …</div>';
      try {
        var payload = buildPayload(type, root);
        var canvas = document.createElement('canvas');
        await generateCanvas(payload, canvas, 280);
        if (token !== canvasToken || !root.isConnected) return;
        output.innerHTML = '<div class="hdv175-result"><div class="hdv175-canvas-wrap"></div><div class="hdv175-muted" data-q175-preview></div><div class="hdv175-actions"><button class="hdv175-btn primary" type="button" data-q175-download>PNG speichern</button><button class="hdv175-btn" type="button" data-q175-copy>Inhalt kopieren</button></div></div>';
        output.querySelector('.hdv175-canvas-wrap').appendChild(canvas);
        output.querySelector('[data-q175-preview]').textContent =
          type === 'wifi' ? 'WLAN-Zugangsdaten sind codiert.' : payload.length > 140 ? payload.slice(0,137) + '…' : payload;
        output.querySelector('[data-q175-download]').addEventListener('click', function () {
          downloadCanvas(canvas, 'haldo-qr-' + Date.now() + '.png').catch(function (error) { output.querySelector('[data-q175-preview]').textContent = error.message; });
        });
        output.querySelector('[data-q175-copy]').addEventListener('click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(payload).catch(function () {});
          output.querySelector('[data-q175-preview]').textContent = 'QR-Inhalt zum Kopieren übergeben.';
        });
      } catch (error) {
        output.innerHTML = '<div class="hdv175-alert" role="alert">' + esc(error.message || String(error)) + '</div>';
      }
    }

    root.querySelector('[data-q175-type]').addEventListener('change', function (event) {
      type = event.target.value;
      renderFields();
      output.innerHTML = '<div class="hdv175-muted">Felder ausgefüllt und QR-Code erstellen.</div>';
    });
    root.querySelector('[data-q175-generate]').addEventListener('click', generate);
    root.querySelector('[data-q175-clear]').addEventListener('click', function () {
      root.querySelectorAll('[data-q175-field]').forEach(function (field) {
        if (field.type === 'checkbox') field.checked = false;
        else field.value = '';
      });
      output.innerHTML = '<div class="hdv175-muted">Eingaben wurden geleert.</div>';
    });
    renderFields();
  }

  /* ----------------------------- QR STICKERS ----------------------------- */
  function openQrStickers() {
    openWindow('qr-sticker','HalDo QR Sticker Pro',800,760,mountQrStickers);
  }

  function mountQrStickers(root) {
    root.innerHTML = CSS +
      '<div class="hdv175-hero"><strong style="font-size:18px">🏷️ HalDo QR Sticker Pro</strong><div class="hdv175-muted">Eine druckfertige Seite mit mehreren QR-Aufklebern erstellen.</div></div>' +
      '<div class="hdv175-card" data-hv175-hide-print><label class="hdv175-label" for="q175-sticker-input">Ein Aufkleber pro Zeile · Format: Titel | Inhalt</label>' +
        '<textarea class="hdv175-field" id="q175-sticker-input" data-q175-sticker-input rows="7" placeholder="WLAN Gäste | WIFI:T:WPA;S:Gäste;P:Passwort;;&#10;Website | https://example.com&#10;Inventar | HALDO-INV-0001"></textarea>' +
        '<p class="hdv175-muted" style="margin-top:7px">Maximal 12 Aufkleber. Inhalt bleibt lokal im Browser. Jeder Aufkleber erhält einen eigenen QR-Code.</p>' +
        '<div class="hdv175-actions"><button type="button" class="hdv175-btn primary" data-q175-sticker-generate>Sticker erstellen</button><button type="button" class="hdv175-btn" data-q175-sticker-print disabled>Drucken</button></div>' +
        '<div class="hdv175-muted" data-q175-sticker-status aria-live="polite" style="margin-top:8px"></div></div>' +
      '<div class="hdv175-print-area" data-q175-sticker-output><div class="hdv175-muted">Noch keine Sticker erstellt.</div></div>' +
      '<p class="hdv175-muted" data-hv175-hide-print>Der QR-Renderer wird einmalig aus einer fest versionierten Bibliothek geladen. Der QR-Inhalt wird nicht an einen Drittanbieter-QR-Dienst gesendet.</p>';

    var input = root.querySelector('[data-q175-sticker-input]');
    var output = root.querySelector('[data-q175-sticker-output]');
    var status = root.querySelector('[data-q175-sticker-status]');
    var printButton = root.querySelector('[data-q175-sticker-print]');
    var generationToken = 0;

    root.querySelector('[data-q175-sticker-generate]').addEventListener('click', async function () {
      var token = ++generationToken;
      var entries = input.value.split(/\r?\n/).map(function (line) {
        var split = line.indexOf('|');
        if (split < 1) return null;
        return { title:line.slice(0,split).trim(), payload:line.slice(split+1).trim() };
      }).filter(function (entry) { return entry && entry.title && entry.payload; });

      if (!entries.length) {
        status.textContent = 'Bitte mindestens eine Zeile mit „Titel | Inhalt“ eingeben.';
        printButton.disabled = true;
        return;
      }
      if (entries.length > 12) {
        status.textContent = 'Maximal 12 Sticker pro Seite sind erlaubt.';
        printButton.disabled = true;
        return;
      }

      status.textContent = 'Sticker werden erstellt …';
      printButton.disabled = true;
      output.innerHTML = '<div class="hdv175-muted">Sticker werden vorbereitet …</div>';
      try {
        await ensureQrLibrary();
        if (token !== generationToken || !root.isConnected) return;
        output.innerHTML = '<div class="hdv175-sticker-grid" data-q175-sticker-grid></div>';
        var grid = output.querySelector('[data-q175-sticker-grid]');
        for (var index = 0; index < entries.length; index += 1) {
          var entry = entries[index];
          var card = document.createElement('article');
          card.className = 'hdv175-sticker';
          card.setAttribute('data-q175-sticker-card','');
          card.innerHTML = '<strong data-q175-sticker-title></strong><canvas data-q175-sticker-canvas></canvas><small data-q175-sticker-value></small>';
          card.querySelector('[data-q175-sticker-title]').textContent = entry.title;
          card.querySelector('[data-q175-sticker-value]').textContent = entry.payload.length > 110 ? entry.payload.slice(0,107) + '…' : entry.payload;
          grid.appendChild(card);
          await generateCanvas(entry.payload, card.querySelector('canvas'), 220);
          if (token !== generationToken || !root.isConnected) return;
        }
        printButton.disabled = false;
        status.textContent = entries.length + ' Sticker erfolgreich erstellt.';
      } catch (error) {
        output.textContent = error.message || String(error);
        status.textContent = 'Sticker konnten nicht erstellt werden.';
      }
    });

    printButton.addEventListener('click', function () {
      if (!printButton.disabled) window.print();
    });
  }

  H.qr = { open:openQrStudio, version:BUILD };
  H['qr-sticker'] = { open:openQrStickers, version:BUILD };
  H.AppsV175Qr = {
    version:BUILD,
    appIds:['qr','qr-sticker'],
    status:function () {
      return this.appIds.map(function (id) { return { id:id, ready:!!(H[id] && typeof H[id].open === 'function') }; });
    }
  };
  if (H.AppVoice && typeof H.AppVoice.command === 'function') {
    H.AppVoice.command('haldo-open-qr-studio',['öffne qr generator','starte qr studio'],function(){H.qr.open();return 'HalDo QR Studio Pro wird geöffnet.';});
    H.AppVoice.command('haldo-open-qr-sticker',['öffne qr sticker','starte qr sticker'],function(){H['qr-sticker'].open();return 'HalDo QR Sticker Pro wird geöffnet.';});
  }
  H.Master = H.Master || {};
  H.Master.version = BUILD;
  console.info('[HalDo v175] QR Studio Pro und QR Sticker Pro registriert.');
})();
