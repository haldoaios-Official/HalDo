/* ================================================================
   HALDO v175 — PDF / PRINT CENTER + DOCUMENT SCANNER
   Local-only document workflow. No upload, no document persistence.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo;
  var BUILD = '175.0.0';
  if (!H || !H.Win || !H.Registry || H.__haldoV175DocumentApps) return;
  H.__haldoV175DocumentApps = true;

  var encoder = new TextEncoder();
  var esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var uid = function (prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 10);
  };
  var toBytes = function (part) {
    if (part instanceof Uint8Array) return part;
    if (part instanceof ArrayBuffer) return new Uint8Array(part);
    return encoder.encode(String(part == null ? '' : part));
  };
  var joinBytes = function (parts) {
    var chunks = parts.map(toBytes);
    var size = chunks.reduce(function (sum, chunk) { return sum + chunk.length; }, 0);
    var result = new Uint8Array(size);
    var offset = 0;
    chunks.forEach(function (chunk) {
      result.set(chunk, offset);
      offset += chunk.length;
    });
    return result;
  };
  var buildPdf = function (objects) {
    if (!Array.isArray(objects) || !objects.length) throw new Error('PDF enthält keine Objekte.');
    var chunks = [encoder.encode('%PDF-1.4\n%HALDO\n')];
    var total = chunks[0].length;
    var offsets = [0];
    objects.forEach(function (body, index) {
      offsets.push(total);
      var head = encoder.encode((index + 1) + ' 0 obj\n');
      var payload = joinBytes(Array.isArray(body) ? body : [body]);
      var tail = encoder.encode('\nendobj\n');
      chunks.push(head, payload, tail);
      total += head.length + payload.length + tail.length;
    });
    var xrefOffset = total;
    var xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    offsets.slice(1).forEach(function (offset) {
      xref += String(offset).padStart(10, '0') + ' 00000 n \n';
    });
    var trailer = 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' +
      xrefOffset + '\n%%EOF\n';
    chunks.push(encoder.encode(xref + trailer));
    return new Blob(chunks, { type: 'application/pdf' });
  };
  var WIN_ANSI = {
    0x20AC:0x80, 0x201A:0x82, 0x0192:0x83, 0x201E:0x84, 0x2026:0x85,
    0x2020:0x86, 0x2021:0x87, 0x02C6:0x88, 0x2030:0x89, 0x0160:0x8A,
    0x2039:0x8B, 0x0152:0x8C, 0x017D:0x8E, 0x2018:0x91, 0x2019:0x92,
    0x201C:0x93, 0x201D:0x94, 0x2022:0x95, 0x2013:0x96, 0x2014:0x97,
    0x02DC:0x98, 0x2122:0x99, 0x0161:0x9A, 0x203A:0x9B, 0x0153:0x9C,
    0x017E:0x9E, 0x0178:0x9F
  };
  var winAnsiHex = function (value) {
    return Array.from(String(value == null ? '' : value)).map(function (character) {
      var code = character.codePointAt(0);
      var byte = WIN_ANSI[code];
      if (byte == null && code >= 0x20 && code <= 0xFF) byte = code;
      if (byte == null) byte = 0x3F;
      return byte.toString(16).padStart(2, '0').toUpperCase();
    }).join('');
  };
  var wrapText = function (value, width) {
    var result = [];
    String(value == null ? '' : value).replace(/\r\n?/g, '\n').split('\n').forEach(function (line) {
      if (!line) { result.push(''); return; }
      var words = line.split(/\s+/);
      var current = '';
      words.forEach(function (word) {
        if (word.length > width) {
          if (current) { result.push(current); current = ''; }
          while (word.length > width) {
            result.push(word.slice(0, width));
            word = word.slice(width);
          }
        }
        if (!word) return;
        if (!current) current = word;
        else if ((current + ' ' + word).length <= width) current += ' ' + word;
        else { result.push(current); current = word; }
      });
      if (current) result.push(current);
    });
    return result;
  };

  function createTextPdfBlob(title, text) {
    var safeTitle = String(title || 'HalDo Dokument').trim().slice(0, 160) || 'HalDo Dokument';
    var bodyLines = wrapText(text, 92);
    var pages = [];
    while (bodyLines.length) pages.push(bodyLines.splice(0, 48));
    if (!pages.length) pages.push([]);
    var fontId = 3 + pages.length * 2;
    var objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [' + pages.map(function (_, index) {
        return (3 + index * 2) + ' 0 R';
      }).join(' ') + '] /Count ' + pages.length + ' >>'
    ];
    pages.forEach(function (pageLines, pageIndex) {
      var pageId = 3 + pageIndex * 2;
      var contentId = pageId + 1;
      var commands = ['BT', '/F1 16 Tf', '54 790 Td', '<' + winAnsiHex(safeTitle) + '> Tj', '/F1 10 Tf', '0 -30 Td'];
      pageLines.forEach(function (line) {
        commands.push('<' + winAnsiHex(line) + '> Tj', '0 -14 Td');
      });
      commands.push('ET');
      var stream = commands.join('\n');
      objects.push(
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ' +
        fontId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>'
      );
      objects.push('<< /Length ' + encoder.encode(stream).length + ' >>\nstream\n' + stream + '\nendstream');
    });
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    return buildPdf(objects);
  }

  async function createImagePdfBlob(pages) {
    if (!Array.isArray(pages) || !pages.length) throw new Error('Bitte zuerst mindestens eine Scan-Seite hinzufügen.');
    if (pages.length > 30) throw new Error('Maximal 30 Seiten pro PDF sind erlaubt.');
    var totalBytes = 0;
    var pageData = [];
    for (var index = 0; index < pages.length; index += 1) {
      var entry = pages[index];
      if (!entry || !entry.blob || typeof entry.blob.arrayBuffer !== 'function') throw new Error('Eine Scan-Seite ist ungültig.');
      if (entry.blob.type !== 'image/jpeg') throw new Error('Scan-Seiten müssen als JPEG vorliegen.');
      var data = new Uint8Array(await entry.blob.arrayBuffer());
      totalBytes += data.byteLength;
      if (data.byteLength === 0 || totalBytes > 80 * 1024 * 1024) throw new Error('Die Scan-Datei ist leer oder überschreitet 80 MB.');
      var width = Number(entry.width), height = Number(entry.height);
      if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) throw new Error('Bildabmessungen sind ungültig.');
      pageData.push({ data:data, width:width, height:height });
    }
    var kids = [];
    var objects = ['<< /Type /Catalog /Pages 2 0 R >>', ''];
    pageData.forEach(function (page, index) {
      var pageId = 3 + index * 3;
      var imageId = pageId + 1;
      var contentId = pageId + 2;
      kids.push(pageId + ' 0 R');
      var maxWidth = 523, maxHeight = 770;
      var scale = Math.min(maxWidth / page.width, maxHeight / page.height);
      var drawWidth = page.width * scale;
      var drawHeight = page.height * scale;
      var x = (595 - drawWidth) / 2;
      var y = (842 - drawHeight) / 2;
      var stream = 'q\n' + drawWidth.toFixed(3) + ' 0 0 ' + drawHeight.toFixed(3) + ' ' +
        x.toFixed(3) + ' ' + y.toFixed(3) + ' cm\n/Im0 Do\nQ';
      objects.push(
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
        '/Resources << /XObject << /Im0 ' + imageId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>'
      );
      objects.push([
        '<< /Type /XObject /Subtype /Image /Width ' + page.width + ' /Height ' + page.height +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + page.data.length + ' >>\nstream\n',
        page.data,
        '\nendstream'
      ]);
      objects.push('<< /Length ' + encoder.encode(stream).length + ' >>\nstream\n' + stream + '\nendstream');
    });
    objects[1] = '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + pageData.length + ' >>';
    return buildPdf(objects);
  }

  function installStyles() {
    if (document.getElementById('hdv175-styles')) return;
    var style = document.createElement('style');
    style.id = 'hdv175-styles';
    style.textContent = [
      '.hdv175-root{box-sizing:border-box;height:100%;overflow:auto;padding:14px;color:var(--text,#eef5ff);font:13px system-ui,sans-serif;background:var(--surface,transparent)}',
      '.hdv175-root *{box-sizing:border-box}.hdv175-hero{padding:16px;border:1px solid rgba(0,229,255,.28);border-radius:16px;background:linear-gradient(135deg,rgba(0,229,255,.11),rgba(77,168,255,.06));margin-bottom:12px}',
      '.hdv175-title{font-size:18px;font-weight:800;color:var(--accent,#00e5ff)}.hdv175-muted{color:var(--muted,#9bb1c9);font-size:12px;line-height:1.5;margin-top:5px}',
      '.hdv175-card{padding:13px;border:1px solid var(--border,rgba(140,190,230,.2));border-radius:13px;background:rgba(10,25,45,.52);margin:10px 0}',
      '.hdv175-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.hdv175-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}',
      '.hdv175-root label{display:block;font-size:12px;font-weight:700;margin:8px 0 5px}.hdv175-root input[type=text],.hdv175-root textarea,.hdv175-root select{width:100%;min-width:0;padding:10px;border-radius:9px;border:1px solid var(--border,rgba(140,190,230,.25));background:rgba(2,12,28,.78);color:var(--text,#eef5ff);font:inherit}',
      '.hdv175-root textarea{min-height:130px;resize:vertical;line-height:1.55}.hdv175-root input[type=file]{max-width:100%;color:var(--muted,#9bb1c9);font-size:12px}',
      '.hdv175-btn{border:1px solid rgba(0,229,255,.35);border-radius:10px;padding:9px 13px;background:rgba(0,130,190,.15);color:var(--text,#eef5ff);font-weight:700;cursor:pointer}.hdv175-btn.primary{background:linear-gradient(135deg,#00cfe8,#4da8ff);color:#04111d;border:0}.hdv175-btn:disabled{opacity:.4;cursor:not-allowed}',
      '.hdv175-status{padding:9px 11px;border-radius:9px;background:rgba(0,229,255,.08);color:#9cefff;min-height:34px;line-height:1.4;margin-top:9px}.hdv175-preview{width:100%;height:390px;border:1px solid var(--border,rgba(140,190,230,.2));border-radius:10px;background:#fff}.hdv175-warning{font-size:11px;line-height:1.5;color:#ffd88a;margin-top:8px}',
      '.hdv175-camera{width:100%;max-height:300px;object-fit:contain;background:#020817;border-radius:12px}.hdv175-canvas{width:100%;max-height:390px;object-fit:contain;background:#081421;border:1px solid var(--border,rgba(140,190,230,.2));border-radius:10px}',
      '.hdv175-pages{display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:9px}.hdv175-page{padding:7px;border:1px solid var(--border,rgba(140,190,230,.2));border-radius:10px;background:rgba(8,20,38,.8);min-width:0}.hdv175-page img{width:100%;height:95px;object-fit:contain;background:#07101c;border-radius:6px}.hdv175-page small{display:block;overflow-wrap:anywhere;color:var(--muted,#9bb1c9);margin:5px 0}.hdv175-page .hdv175-row{gap:4px}.hdv175-page .hdv175-btn{padding:5px 7px;font-size:11px}',
      '@media(max-width:560px){.hdv175-root{padding:9px}.hdv175-preview{height:310px}.hdv175-camera{max-height:220px}.hdv175-grid{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  function observeCleanup(root, cleanup) {
    var observer = new MutationObserver(function () {
      if (root.isConnected) return;
      observer.disconnect();
      try { cleanup(); } catch (error) { console.warn('[HalDo v175] Cleanup:', error); }
    });
    observer.observe(document.body, { childList:true, subtree:true });
    return observer;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2500);
  }

  function openPdfCenter() {
    installStyles();
    var id = uid('hdv175-pdf');
    H.Win.open('📄 HalDo PDF- & Druck-Center Pro',
      '<div class="hdv175-root" id="' + id + '" data-hdv175-app="pdf-center"></div>', { w:900, h:820 });
    window.setTimeout(function () {
      var root = document.getElementById(id);
      if (!root) return;
      var currentUrl = null;
      var currentFile = null;
      root.innerHTML =
        '<div class="hdv175-hero"><div class="hdv175-title">📄 HalDo PDF- & Druck-Center Pro</div>' +
        '<div class="hdv175-muted">PDF aus Text erstellen, lokale PDFs/Bilder ansehen und über den Browser drucken.</div></div>' +
        '<div class="hdv175-grid"><section class="hdv175-card"><b>Neues PDF erstellen</b>' +
        '<label for="' + id + '-title">Dokumenttitel</label><input type="text" id="' + id + '-title" maxlength="160" value="HalDo Dokument">' +
        '<label for="' + id + '-text">Textinhalt</label><textarea id="' + id + '-text" placeholder="Schreibe hier deinen Dokumenttext …"></textarea>' +
        '<div class="hdv175-row"><button class="hdv175-btn primary" type="button" data-v175-pdf-create>PDF erstellen und speichern</button></div></section>' +
        '<section class="hdv175-card"><b>Lokale Datei ansehen</b><label for="' + id + '-file">PDF oder Bild auswählen</label>' +
        '<input id="' + id + '-file" data-v175-pdf-file type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg">' +
        '<div class="hdv175-row"><button class="hdv175-btn" type="button" data-v175-pdf-open disabled>In neuem Tab öffnen</button>' +
        '<button class="hdv175-btn" type="button" data-v175-pdf-print disabled>Drucken</button>' +
        '<button class="hdv175-btn" type="button" data-v175-pdf-clear disabled>Auswahl löschen</button></div>' +
        '<div class="hdv175-muted" data-v175-pdf-file-info>Noch keine Datei ausgewählt.</div></section></div>' +
        '<div class="hdv175-card"><b>Dokumentvorschau</b><iframe class="hdv175-preview" data-v175-pdf-preview title="Lokale PDF- oder Bildvorschau"></iframe>' +
        '<div class="hdv175-status" data-v175-pdf-status role="status" aria-live="polite">Bereit. Dateien werden nur in diesem Browser-Tab verarbeitet.</div></div>' +
        '<p class="hdv175-warning">Datenschutz: Ausgewählte Dateien werden nicht hochgeladen und nicht dauerhaft in HalDo gespeichert. Beim Schließen dieses Fensters werden lokale Vorschau-Adressen freigegeben. Browser-Druckdialog, Druckertreiber und „Als PDF speichern“ werden vom Betriebssystem/Browser bereitgestellt.</p>';
      var fileInput = root.querySelector('[data-v175-pdf-file]');
      var preview = root.querySelector('[data-v175-pdf-preview]');
      var fileInfo = root.querySelector('[data-v175-pdf-file-info]');
      var status = root.querySelector('[data-v175-pdf-status]');
      var openButton = root.querySelector('[data-v175-pdf-open]');
      var printButton = root.querySelector('[data-v175-pdf-print]');
      var clearButton = root.querySelector('[data-v175-pdf-clear]');
      function say(message, bad) {
        status.textContent = message;
        status.style.color = bad ? '#ff9baa' : '#9cefff';
      }
      function clearCurrent() {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = null;
        currentFile = null;
        preview.removeAttribute('src');
        fileInfo.textContent = 'Noch keine Datei ausgewählt.';
        openButton.disabled = true;
        printButton.disabled = true;
        clearButton.disabled = true;
      }
      function setDocument(blob, filename) {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = URL.createObjectURL(blob);
        currentFile = { name:filename, type:blob.type, size:blob.size };
        preview.src = currentUrl;
        fileInfo.textContent = filename + ' · ' + (blob.type || 'Datei') + ' · ' + Math.max(1, Math.round(blob.size / 1024)) + ' KB';
        openButton.disabled = false;
        printButton.disabled = false;
        clearButton.disabled = false;
      }
      root.querySelector('[data-v175-pdf-create]').addEventListener('click', function () {
        try {
          var title = root.querySelector('#' + id + '-title').value;
          var text = root.querySelector('#' + id + '-text').value;
          if (!String(title || '').trim() && !String(text || '').trim()) {
            say('Bitte zuerst einen Titel oder Text eingeben.', true);
            return;
          }
          var blob = createTextPdfBlob(title, text);
          var filename = (String(title || 'haldo-dokument').trim().replace(/[^a-z0-9äöüß_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'haldo-dokument') + '.pdf';
          setDocument(blob, filename);
          downloadBlob(blob, filename);
          say('PDF wurde erstellt. Der Browser hat den Speicherdialog/Download gestartet.');
        } catch (error) {
          say('PDF konnte nicht erstellt werden: ' + error.message, true);
        }
      });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
          say('Die Datei überschreitet das lokale Limit von 50 MB.', true);
          fileInput.value = '';
          return;
        }
        if (!(file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg' ||
              /\.(pdf|png|jpe?g)$/i.test(file.name))) {
          say('Dieses Format wird nicht unterstützt. Bitte PDF, PNG oder JPEG wählen.', true);
          fileInput.value = '';
          return;
        }
        setDocument(file, file.name);
        say('Lokale Datei geladen. Sie bleibt im aktuellen Browser-Tab.');
      });
      openButton.addEventListener('click', function () {
        if (!currentUrl) return;
        var opened = window.open(currentUrl, '_blank', 'noopener,noreferrer');
        if (!opened) say('Der Browser hat den neuen Tab möglicherweise blockiert. Pop-ups für HalDo erlauben oder die Vorschau verwenden.', true);
        else say('Dokument in einem neuen Browser-Tab geöffnet. Dort kannst du den Druckdialog aufrufen.');
      });
      printButton.addEventListener('click', function () {
        if (!currentUrl) return;
        try {
          preview.contentWindow.focus();
          preview.contentWindow.print();
          say('Druckdialog angefordert. Der Browser/Viewer entscheidet über den tatsächlichen Druck.');
        } catch (error) {
          say('Direkter Druck ist in diesem PDF-Viewer nicht verfügbar. Öffne das Dokument in einem neuen Tab und nutze dort Drucken.', true);
        }
      });
      clearButton.addEventListener('click', function () {
        clearCurrent();
        fileInput.value = '';
        say('Lokale Dateiauswahl wurde gelöscht.');
      });
      observeCleanup(root, clearCurrent);
    }, 80);
  }

  function openDocumentScanner() {
    installStyles();
    var id = uid('hdv175-scan');
    H.Win.open('📷 HalDo Dokumenten-Scanner Pro',
      '<div class="hdv175-root" id="' + id + '" data-hdv175-app="document-scanner"></div>', { w:920, h:860 });
    window.setTimeout(function () {
      var root = document.getElementById(id);
      if (!root) return;
      var stream = null;
      var source = null;
      var sourceUrl = null;
      var rotation = 0;
      var pages = [];
      var pageSequence = 0;
      var video = null;
      var canvas = null;
      var status = null;
      var pagesHost = null;
      root.innerHTML =
        '<div class="hdv175-hero"><div class="hdv175-title">📷 HalDo Dokumenten-Scanner Pro</div>' +
        '<div class="hdv175-muted">Mehrseitige Dokumente lokal erfassen, drehen, lesbarer machen und als PDF speichern.</div></div>' +
        '<div class="hdv175-grid"><section class="hdv175-card"><b>Dokument erfassen</b>' +
        '<div class="hdv175-row"><button type="button" class="hdv175-btn primary" data-v175-camera-start>Kamera starten</button>' +
        '<button type="button" class="hdv175-btn" data-v175-camera-capture disabled>Foto aufnehmen</button>' +
        '<button type="button" class="hdv175-btn" data-v175-camera-stop disabled>Kamera stoppen</button></div>' +
        '<video class="hdv175-camera" data-v175-camera-preview playsinline autoplay muted hidden></video>' +
        '<label for="' + id + '-file">Bilddatei / Handy-Kamera verwenden</label>' +
        '<input id="' + id + '-file" data-v175-scan-file type="file" accept="image/*" capture="environment">' +
        '<div class="hdv175-muted">Die Kamera benötigt eine sichere HTTPS-Verbindung und deine ausdrückliche Browserfreigabe. Alternativ kannst du eine vorhandene Foto-/Scan-Datei auswählen.</div></section>' +
        '<section class="hdv175-card"><b>Bild verbessern</b>' +
        '<label for="' + id + '-contrast">Kontrast <span data-v175-contrast-label>125%</span></label>' +
        '<input id="' + id + '-contrast" data-v175-contrast type="range" min="80" max="180" value="125">' +
        '<label for="' + id + '-brightness">Helligkeit <span data-v175-brightness-label>105%</span></label>' +
        '<input id="' + id + '-brightness" data-v175-brightness type="range" min="70" max="140" value="105">' +
        '<label><input type="checkbox" data-v175-grayscale> Graustufen / Dokumentmodus</label>' +
        '<div class="hdv175-row"><button type="button" class="hdv175-btn" data-v175-rotate-left disabled>↶ 90°</button>' +
        '<button type="button" class="hdv175-btn" data-v175-rotate-right disabled>↷ 90°</button>' +
        '<button type="button" class="hdv175-btn primary" data-v175-add-page disabled>Seite zur PDF hinzufügen</button></div></section></div>' +
        '<div class="hdv175-card"><b>Vorschau der aktuellen Seite</b><canvas class="hdv175-canvas" data-v175-scan-canvas></canvas>' +
        '<div class="hdv175-status" data-v175-scan-status role="status" aria-live="polite">Noch kein Dokument erfasst. Wähle eine Bilddatei oder starte die Kamera.</div></div>' +
        '<div class="hdv175-card"><div class="hdv175-row" style="justify-content:space-between"><b>PDF-Seiten (<span data-v175-page-count>0</span>/30)</b>' +
        '<div class="hdv175-row"><button type="button" class="hdv175-btn primary" data-v175-export disabled>Mehrseitiges PDF erstellen</button>' +
        '<button type="button" class="hdv175-btn" data-v175-clear-pages disabled>Alle Seiten löschen</button></div></div>' +
        '<div class="hdv175-pages" data-v175-pages></div></div>' +
        '<p class="hdv175-warning">Datenschutz: Bilder und fertige Seiten werden nur im Arbeitsspeicher dieses Tabs gehalten. Es findet kein Upload und keine dauerhafte HalDo-Speicherung statt. Diese Version bietet manuelle Aufnahme, Drehung und Bildanpassung; automatische Kantenerkennung, perspektivische Entzerrung und OCR sind noch nicht enthalten. Die Bildqualität hängt von Kamera und Licht ab.</p>';
      video = root.querySelector('[data-v175-camera-preview]');
      canvas = root.querySelector('[data-v175-scan-canvas]');
      status = root.querySelector('[data-v175-scan-status]');
      pagesHost = root.querySelector('[data-v175-pages]');
      var startButton = root.querySelector('[data-v175-camera-start]');
      var captureButton = root.querySelector('[data-v175-camera-capture]');
      var stopButton = root.querySelector('[data-v175-camera-stop]');
      var addButton = root.querySelector('[data-v175-add-page]');
      var exportButton = root.querySelector('[data-v175-export]');
      var clearButton = root.querySelector('[data-v175-clear-pages]');
      var contrastInput = root.querySelector('[data-v175-contrast]');
      var brightnessInput = root.querySelector('[data-v175-brightness]');
      var grayscaleInput = root.querySelector('[data-v175-grayscale]');
      function say(message, bad) {
        status.textContent = message;
        status.style.color = bad ? '#ff9baa' : '#9cefff';
      }
      function updateControls() {
        var hasSource = !!source;
        root.querySelector('[data-v175-rotate-left]').disabled = !hasSource;
        root.querySelector('[data-v175-rotate-right]').disabled = !hasSource;
        addButton.disabled = !hasSource || pages.length >= 30;
        exportButton.disabled = pages.length === 0;
        clearButton.disabled = pages.length === 0;
      }
      function stopCamera() {
        if (stream) {
          stream.getTracks().forEach(function (track) { try { track.stop(); } catch (_) {} });
          stream = null;
        }
        if (video) {
          try { video.pause(); } catch (_) {}
          video.srcObject = null;
          video.hidden = true;
        }
        startButton.disabled = false;
        captureButton.disabled = true;
        stopButton.disabled = true;
      }
      function renderSource() {
        if (!source || !source.element) { updateControls(); return; }
        var element = source.element;
        var sourceWidth = source.type === 'video' ? element.videoWidth : (element.naturalWidth || element.width);
        var sourceHeight = source.type === 'video' ? element.videoHeight : (element.naturalHeight || element.height);
        if (!sourceWidth || !sourceHeight) { say('Das Bild ist noch nicht vollständig geladen.', true); return; }
        var ratio = Math.min(1, 2400 / Math.max(sourceWidth, sourceHeight));
        var width = Math.max(1, Math.round(sourceWidth * ratio));
        var height = Math.max(1, Math.round(sourceHeight * ratio));
        var rotated = Math.abs(rotation % 180) === 90;
        canvas.width = rotated ? height : width;
        canvas.height = rotated ? width : height;
        var context = canvas.getContext('2d', { alpha:false });
        if (!context) { say('Canvas-Verarbeitung ist in diesem Browser nicht verfügbar.', true); return; }
        var contrast = Number(contrastInput.value) / 100;
        var brightness = Number(brightnessInput.value) / 100;
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotation * Math.PI / 180);
        context.filter = 'grayscale(' + (grayscaleInput.checked ? '1' : '0') + ') contrast(' +
          contrast + ') brightness(' + brightness + ')';
        context.drawImage(element, -width / 2, -height / 2, width, height);
        context.restore();
        root.querySelector('[data-v175-contrast-label]').textContent = contrastInput.value + '%';
        root.querySelector('[data-v175-brightness-label]').textContent = brightnessInput.value + '%';
        updateControls();
      }
      function setImage(file) {
        if (!file || !String(file.type || '').startsWith('image/')) {
          say('Bitte eine Bilddatei auswählen.', true);
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          say('Die Bilddatei überschreitet das Limit von 25 MB.', true);
          return;
        }
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
        sourceUrl = URL.createObjectURL(file);
        var image = new Image();
        image.onload = function () {
          if (!root.isConnected) return;
          source = { type:'image', element:image };
          rotation = 0;
          renderSource();
          say('Bild geladen: ' + file.name + '. Passe es an und füge es als PDF-Seite hinzu.');
        };
        image.onerror = function () {
          if (sourceUrl) URL.revokeObjectURL(sourceUrl);
          sourceUrl = null;
          source = null;
          updateControls();
          say('Das Bild konnte nicht gelesen werden.', true);
        };
        image.src = sourceUrl;
      }
      function renderPages() {
        pagesHost.replaceChildren();
        root.querySelector('[data-v175-page-count]').textContent = String(pages.length);
        pages.forEach(function (page, index) {
          var card = document.createElement('div');
          card.className = 'hdv175-page';
          var image = document.createElement('img');
          image.src = page.url;
          image.alt = 'Vorschau Seite ' + (index + 1);
          var label = document.createElement('small');
          label.textContent = 'Seite ' + (index + 1) + ' · ' + page.width + ' × ' + page.height;
          var controls = document.createElement('div');
          controls.className = 'hdv175-row';
          [
            { label:'↑', action:'up', disabled:index===0, title:'Nach oben' },
            { label:'↓', action:'down', disabled:index===pages.length-1, title:'Nach unten' },
            { label:'✕', action:'remove', disabled:false, title:'Seite entfernen' }
          ].forEach(function (item) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'hdv175-btn';
            button.textContent = item.label;
            button.title = item.title;
            button.disabled = item.disabled;
            button.dataset.v175PageAction = item.action;
            button.dataset.v175PageId = page.id;
            controls.appendChild(button);
          });
          card.appendChild(image);
          card.appendChild(label);
          card.appendChild(controls);
          pagesHost.appendChild(card);
        });
        updateControls();
      }
      function addPage() {
        if (!source || !canvas.width || !canvas.height) return;
        if (pages.length >= 30) { say('Maximal 30 Seiten pro Scan-PDF.', true); return; }
        canvas.toBlob(function (blob) {
          if (!root.isConnected) return;
          if (!blob) { say('Die Seite konnte nicht in JPEG umgewandelt werden.', true); return; }
          pageSequence += 1;
          pages.push({
            id:'scan-page-' + pageSequence,
            blob:blob,
            width:canvas.width,
            height:canvas.height,
            url:URL.createObjectURL(blob)
          });
          renderPages();
          say('Seite ' + pages.length + ' zum Dokument hinzugefügt. Du kannst weitere Seiten aufnehmen.');
        }, 'image/jpeg', 0.9);
      }
      startButton.addEventListener('click', async function () {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
          say('Kamerazugriff ist hier nicht verfügbar. Bitte eine Bilddatei auswählen.', true);
          return;
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' } }, audio:false });
          if (!root.isConnected) { stopCamera(); return; }
          video.srcObject = stream;
          video.hidden = false;
          await video.play();
          startButton.disabled = true;
          captureButton.disabled = false;
          stopButton.disabled = false;
          say('Kamera aktiv. Richte das Dokument aus und nimm ein Foto auf.');
        } catch (error) {
          stopCamera();
          say('Kamera konnte nicht gestartet werden: ' + (error && error.message ? error.message : 'Berechtigung fehlt') +
            '. Du kannst alternativ eine Bilddatei wählen.', true);
        }
      });
      captureButton.addEventListener('click', function () {
        if (!stream || !video.videoWidth || !video.videoHeight) {
          say('Die Kamera liefert noch kein Bild.', true);
          return;
        }
        var snapshot = document.createElement('canvas');
        snapshot.width = video.videoWidth;
        snapshot.height = video.videoHeight;
        snapshot.getContext('2d').drawImage(video, 0, 0, snapshot.width, snapshot.height);
        stopCamera();
        source = { type:'canvas', element:snapshot };
        rotation = 0;
        renderSource();
        say('Foto aufgenommen. Du kannst das Bild anpassen oder als Seite hinzufügen.');
      });
      stopButton.addEventListener('click', function () {
        stopCamera();
        say('Kamera wurde gestoppt.');
      });
      root.querySelector('[data-v175-scan-file]').addEventListener('change', function (event) {
        var file = event.target.files && event.target.files[0];
        if (file) setImage(file);
      });
      contrastInput.addEventListener('input', renderSource);
      brightnessInput.addEventListener('input', renderSource);
      grayscaleInput.addEventListener('change', renderSource);
      root.querySelector('[data-v175-rotate-left]').addEventListener('click', function () {
        rotation = (rotation + 270) % 360;
        renderSource();
      });
      root.querySelector('[data-v175-rotate-right]').addEventListener('click', function () {
        rotation = (rotation + 90) % 360;
        renderSource();
      });
      addButton.addEventListener('click', addPage);
      pagesHost.addEventListener('click', function (event) {
        var button = event.target.closest('[data-v175-page-action]');
        if (!button) return;
        var index = pages.findIndex(function (page) { return page.id === button.dataset.v175PageId; });
        if (index < 0) return;
        var action = button.dataset.v175PageAction;
        if (action === 'remove') {
          URL.revokeObjectURL(pages[index].url);
          pages.splice(index, 1);
        } else if (action === 'up' && index > 0) {
          var previous = pages[index - 1];
          pages[index - 1] = pages[index];
          pages[index] = previous;
        } else if (action === 'down' && index < pages.length - 1) {
          var next = pages[index + 1];
          pages[index + 1] = pages[index];
          pages[index] = next;
        }
        renderPages();
        say('Seitenreihenfolge aktualisiert. Aktuell: ' + pages.length + ' Seiten.');
      });
      exportButton.addEventListener('click', async function () {
        if (!pages.length) return;
        exportButton.disabled = true;
        say('Erstelle mehrseitiges PDF aus ' + pages.length + ' Seiten …');
        try {
          var blob = await createImagePdfBlob(pages);
          if (!root.isConnected) return;
          downloadBlob(blob, 'haldo-scan-' + new Date().toISOString().slice(0, 10) + '.pdf');
          say('PDF mit ' + pages.length + ' Seiten erstellt. Der Browser hat den Download gestartet.');
        } catch (error) {
          say('PDF konnte nicht erstellt werden: ' + error.message, true);
        } finally {
          updateControls();
        }
      });
      clearButton.addEventListener('click', function () {
        pages.forEach(function (page) { URL.revokeObjectURL(page.url); });
        pages = [];
        renderPages();
        say('Alle hinzugefügten Seiten wurden aus dem Arbeitsspeicher entfernt.');
      });
      observeCleanup(root, function () {
        stopCamera();
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
        pages.forEach(function (page) { URL.revokeObjectURL(page.url); });
        pages = [];
        source = null;
      });
      renderPages();
      updateControls();
    }, 80);
  }

  var definitions = [
    { id:'pdf-center', title:'HalDo PDF- & Druck-Center Pro', icon:'📄', category:'S', open:openPdfCenter },
    { id:'document-scanner', title:'HalDo Dokumenten-Scanner Pro', icon:'📷', category:'D', open:openDocumentScanner }
  ];
  definitions.forEach(function (app) {
    H[app.id] = { open:app.open, version:BUILD };
    if (!H.Registry.featured.some(function (item) { return item && item.id === app.id; })) {
      H.Registry.featured.push({ id:app.id, n:app.title, i:app.icon });
    }
    if (typeof H.Registry.registerCategoryApp === 'function') H.Registry.registerCategoryApp(app.category, app.id);
  });

  H.PdfCenter = {
    version:BUILD,
    open:openPdfCenter,
    createTextPdfBlob:createTextPdfBlob,
    createImagePdfBlob:createImagePdfBlob
  };
  H.DocumentScanner = {
    version:BUILD,
    open:openDocumentScanner,
    createPdfBlob:createImagePdfBlob,
    getStatus:function () { return { version:BUILD, maximumPages:30, localOnly:true, persistentStorage:false, ocr:false, automaticCrop:false }; }
  };
  H.AppsV175Documents = {
    version:BUILD,
    apps:definitions.map(function (app) { return { id:app.id, title:app.title, category:app.category }; }),
    status:function () { return { registered:definitions.length, build:BUILD, localOnly:true }; }
  };
  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.namedCoreApps = H.Registry.featured.length;
  console.info('HalDo v175 Document Apps bereit:', definitions.map(function (app) { return app.id; }).join(', '));
})();
