/* HalDo Video Studio Pro — native browser editor for v166 */
(function () {
  'use strict';
  var H = window.HalDo;
  if (!H || !H.Win || !H.Store) return;

  var STORE_KEY = 'haldo_video_studio_pro_v1';
  var MAX_CLIPS = 60;
  var MAX_PROJECT_BYTES = 2 * 1024 * 1024;

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function safeName(v, fallback) {
    return String(v || fallback || 'HalDo-Projekt').replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || (fallback || 'HalDo-Projekt');
  }
  function download(name, blob) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function loadMeta() {
    var saved = H.Store.get(STORE_KEY, null);
    return saved && typeof saved === 'object' ? saved : {};
  }
  function saveMeta(name, title, position) {
    try {
      H.Store.set(STORE_KEY, {
        projectName: String(name || 'Mein Video-Projekt').slice(0, 80),
        title: String(title || '').slice(0, 120),
        titlePosition: position === 'top' || position === 'bottom' ? position : 'center',
        updatedAt: new Date().toISOString()
      });
    } catch (e) {}
  }
  function open() {
    var meta = loadMeta();
    var rootId = 'haldo-video-' + Date.now() + '-root';
    var projectName = String(meta.projectName || 'Mein Video-Projekt').slice(0, 80);
    var overlayTitle = String(meta.title || '').slice(0, 120);
    var titlePosition = meta.titlePosition === 'top' || meta.titlePosition === 'bottom' ? meta.titlePosition : 'center';
    var html = '<div id="' + rootId + '" class="hdvs-root"><style>' +
      '.hdvs-root{height:100%;overflow:auto;box-sizing:border-box;padding:12px;color:var(--text,#eaf4ff);font:13px/1.45 system-ui,sans-serif}.hdvs-root *{box-sizing:border-box}.hdvs-hero{padding:14px;border:1px solid rgba(0,210,240,.25);border-radius:15px;background:linear-gradient(120deg,rgba(0,170,210,.16),rgba(110,75,210,.18));margin-bottom:10px}.hdvs-title{font-size:19px;font-weight:850}.hdvs-sub{font-size:11px;opacity:.72;margin-top:3px}.hdvs-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px}.hdvs-btn{border:1px solid var(--border,rgba(120,180,220,.25));background:rgba(25,55,85,.55);color:inherit;border-radius:9px;padding:8px 11px;cursor:pointer}.hdvs-btn.primary{background:var(--accent,rgba(0,190,220,.22));border-color:var(--accent,#00d5ed)}.hdvs-btn:disabled{opacity:.45;cursor:not-allowed}.hdvs-in{min-width:0;padding:8px 9px;border-radius:8px;border:1px solid var(--border,rgba(120,180,220,.3));background:rgba(0,0,0,.24);color:inherit}.hdvs-project{width:190px}.hdvs-stage{position:relative;background:#05080e;border:1px solid rgba(120,180,220,.2);border-radius:13px;overflow:hidden;min-height:180px;display:grid;place-items:center}.hdvs-stage video{display:block;width:100%;max-height:420px;aspect-ratio:16/9;object-fit:contain;background:#05080e}.hdvs-overlay{position:absolute;left:5%;right:5%;pointer-events:none;text-align:center;color:#fff;font-size:clamp(18px,3vw,34px);font-weight:850;line-height:1.15;text-shadow:0 2px 6px #000,0 0 16px #000;white-space:pre-wrap;overflow-wrap:anywhere}.hdvs-overlay.top{top:8%}.hdvs-overlay.center{top:50%;transform:translateY(-50%)}.hdvs-overlay.bottom{bottom:9%}.hdvs-card{margin-top:10px;padding:12px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:12px;background:rgba(8,28,50,.28)}.hdvs-cardhead{font-weight:800;margin-bottom:8px}.hdvs-muted{font-size:11px;opacity:.68}.hdvs-status{min-height:18px;font-size:11px;opacity:.78;margin-top:8px}.hdvs-clip{display:grid;grid-template-columns:minmax(90px,1.3fr) minmax(140px,2fr) auto;gap:8px;align-items:center;padding:9px;border:1px solid rgba(120,180,220,.16);border-radius:9px;background:rgba(0,0,0,.16);margin:6px 0}.hdvs-clip.selected{border-color:var(--accent,#00d5ed);background:rgba(0,170,210,.1)}.hdvs-clipname{font-weight:750;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hdvs-trim{display:flex;gap:5px;align-items:center;flex-wrap:wrap}.hdvs-trim input{width:68px}.hdvs-mini{padding:5px 8px;font-size:11px}.hdvs-missing{color:#fbbf24;font-size:11px}.hdvs-empty{padding:22px;text-align:center;opacity:.62;border:1px dashed rgba(120,180,220,.25);border-radius:10px}.hdvs-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hdvs-progress{height:6px;background:rgba(255,255,255,.1);border-radius:8px;overflow:hidden;margin-top:7px}.hdvs-progress>div{height:100%;width:0;background:var(--accent,#00d5ed);transition:width .15s}.hdvs-file{display:none}@media(max-width:680px){.hdvs-clip{grid-template-columns:1fr}.hdvs-grid2{grid-template-columns:1fr}.hdvs-root{padding:8px}.hdvs-project{width:145px}}' +
      '</style><div class="hdvs-hero"><div class="hdvs-title">🎥 HalDo Video Studio Pro</div><div class="hdvs-sub">Multi-Clip Timeline · Vorschau · Schnitt/Trim · Titel-Overlay · WebM-Export</div>' +
      '<div class="hdvs-row"><label>Projekt <input class="hdvs-in hdvs-project" id="hdvs-project-name" maxlength="80" value="' + esc(projectName) + '"></label>' +
      '<button class="hdvs-btn primary" id="hdvs-add">＋ Videos importieren</button><input class="hdvs-file" id="hdvs-files" type="file" accept="video/*,.mp4,.webm,.mov,.m4v" multiple>' +
      '<button class="hdvs-btn" id="hdvs-save">⬇ Projektdatei sichern</button><button class="hdvs-btn" id="hdvs-open">⬆ Projektdatei öffnen</button><input class="hdvs-file" id="hdvs-project-file" type="file" accept=".json,application/json"></div>' +
      '<div class="hdvs-muted" style="margin-top:7px">Videodateien werden lokal im Browser verarbeitet. Für ein exportiertes Projekt müssen die Quelldateien beim nächsten Öffnen erneut importiert werden.</div></div>' +
      '<div class="hdvs-stage"><video id="hdvs-preview" controls playsinline preload="metadata"></video><div id="hdvs-overlay" class="hdvs-overlay ' + titlePosition + '">' + esc(overlayTitle) + '</div></div>' +
      '<div class="hdvs-row"><button class="hdvs-btn primary" id="hdvs-play-clip">▶ Clip abspielen</button><button class="hdvs-btn" id="hdvs-play-all">▶ Filmvorschau</button><button class="hdvs-btn" id="hdvs-stop">■ Stop</button><button class="hdvs-btn" id="hdvs-export">🎬 Video exportieren</button></div>' +
      '<div class="hdvs-progress"><div id="hdvs-progress-fill"></div></div><div class="hdvs-status" id="hdvs-status" aria-live="polite">Bereit. Importiere deine Videos, um eine Timeline aufzubauen.</div>' +
      '<div class="hdvs-card"><div class="hdvs-cardhead">🎞 Timeline und Clip-Schnitt</div><div class="hdvs-muted">Clips auswählen, sortieren und Start-/Endzeit festlegen. Der Filmexport setzt die Clips in dieser Reihenfolge zusammen.</div><div id="hdvs-clips"></div></div>' +
      '<div class="hdvs-card"><div class="hdvs-cardhead">✨ Titel und Einblendung</div><div class="hdvs-grid2"><label>Titeltext<input class="hdvs-in" id="hdvs-title-text" maxlength="120" style="width:100%" value="' + esc(overlayTitle) + '" placeholder="Dein Titel…"></label>' +
      '<label>Position<select class="hdvs-in" id="hdvs-title-position" style="width:100%"><option value="top"' + (titlePosition === 'top' ? ' selected' : '') + '>Oben</option><option value="center"' + (titlePosition === 'center' ? ' selected' : '') + '>Mitte</option><option value="bottom"' + (titlePosition === 'bottom' ? ' selected' : '') + '>Unten</option></select></label></div>' +
      '<div class="hdvs-muted" style="margin-top:7px">Der Titel wird während des gesamten Exports eingeblendet. Die Videodateien bleiben auf deinem Gerät; es wird nichts auf einen Server hochgeladen.</div></div></div>';

    H.Win.open('🎥 HalDo Video Studio Pro', html, {w: 1000, h: 800});
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root) return;
      var win = root.closest('.window');
      var video = root.querySelector('#hdvs-preview');
      var overlay = root.querySelector('#hdvs-overlay');
      var status = root.querySelector('#hdvs-status');
      var clipsNode = root.querySelector('#hdvs-clips');
      var progress = root.querySelector('#hdvs-progress-fill');
      var clips = [];
      var selectedId = null;
      var objectUrls = [];
      var playlist = false;
      var playingIndex = -1;
      var advancing = false;
      var exporting = false;
      var closed = false;
      var observer = null;
      var audioContext = null;
      var mediaSource = null;
      var audioDestination = null;
      var recorder = null;
      var exportCanvas = null;
      var exportRaf = 0;

      function say(message) { if (status && !closed) status.textContent = message; }
      function selectedIndex() { return clips.findIndex(function (c) { return c.id === selectedId; }); }
      function selectedClip() { var i = selectedIndex(); return i >= 0 ? clips[i] : null; }
      function updateOverlay() {
        var input = root.querySelector('#hdvs-title-text');
        var pos = root.querySelector('#hdvs-title-position');
        overlay.textContent = input ? input.value : overlayTitle;
        overlay.className = 'hdvs-overlay ' + (pos ? pos.value : titlePosition);
      }
      function persist() {
        var name = root.querySelector('#hdvs-project-name').value;
        var title = root.querySelector('#hdvs-title-text').value;
        var pos = root.querySelector('#hdvs-title-position').value;
        projectName = name; overlayTitle = title; titlePosition = pos;
        saveMeta(name, title, pos);
      }
      function renderClips() {
        if (!clips.length) {
          clipsNode.innerHTML = '<div class="hdvs-empty">Noch keine Clips. Über „Videos importieren“ kannst du MP4-, WebM- und andere Browser-kompatible Videodateien hinzufügen.</div>';
          return;
        }
        var out = '';
        clips.forEach(function (c, i) {
          var active = c.id === selectedId;
          var missing = !!c.missing || !c.url;
          out += '<div class="hdvs-clip' + (active ? ' selected' : '') + '" data-clip-id="' + esc(c.id) + '">' +
            '<div><div class="hdvs-clipname">' + (i + 1) + '. ' + esc(c.name) + '</div><div class="hdvs-muted">' + (missing ? '<span class="hdvs-missing">Quelldatei erneut importieren</span>' : (Number(c.duration || 0).toFixed(2) + ' s')) + '</div></div>' +
            '<div class="hdvs-trim"><label class="hdvs-muted">Start <input class="hdvs-in" data-trim="start" data-id="' + esc(c.id) + '" type="number" min="0" step="0.1" value="' + Number(c.start || 0).toFixed(1) + '"' + (missing ? ' disabled' : '') + '></label>' +
            '<label class="hdvs-muted">Ende <input class="hdvs-in" data-trim="end" data-id="' + esc(c.id) + '" type="number" min="0" step="0.1" value="' + Number(c.end || 0).toFixed(1) + '"' + (missing ? ' disabled' : '') + '></label></div>' +
            '<div class="hdvs-row" style="margin:0;justify-content:flex-end"><button class="hdvs-btn hdvs-mini" data-action="up" data-id="' + esc(c.id) + '"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="hdvs-btn hdvs-mini" data-action="down" data-id="' + esc(c.id) + '"' + (i === clips.length - 1 ? ' disabled' : '') + '>↓</button><button class="hdvs-btn hdvs-mini" data-action="remove" data-id="' + esc(c.id) + '">Entfernen</button></div></div>';
        });
        clipsNode.innerHTML = out;
      }
      function getClipById(id) { return clips.find(function (c) { return c.id === id; }); }
      function probeFile(file, existing) {
        var url = URL.createObjectURL(file);
        objectUrls.push(url);
        var clip = existing || {id:'clip-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), name:file.name, start:0, end:0, duration:0};
        clip.name = file.name; clip.file = file; clip.url = url; clip.missing = false;
        var probe = document.createElement('video');
        probe.preload = 'metadata'; probe.muted = true; probe.src = url;
        probe.onloadedmetadata = function () {
          var duration = Number.isFinite(probe.duration) ? probe.duration : 0;
          clip.duration = duration;
          clip.start = clamp(Number(clip.start) || 0, 0, Math.max(0, duration - 0.1));
          clip.end = clip.end > clip.start ? clamp(Number(clip.end), clip.start + 0.1, duration) : duration;
          probe.src = '';
          renderClips();
          if (!selectedId) selectedId = clip.id;
          say('Video importiert: ' + clip.name);
          persist();
          renderClips();
        };
        probe.onerror = function () {
          clip.missing = true; clip.url = null; probe.src = '';
          say('Die Datei „' + clip.name + '“ kann dieser Browser nicht decodieren.');
          renderClips();
        };
      }
      function importFiles(fileList) {
        var files = Array.prototype.slice.call(fileList || []);
        if (!files.length) return;
        files.forEach(function (file) {
          if (clips.length >= MAX_CLIPS) { say('Maximal ' + MAX_CLIPS + ' Clips pro Projekt.'); return; }
          if (!file.type || file.type.indexOf('video/') !== 0) { say('Übersprungen: ' + file.name + ' ist keine erkannte Videodatei.'); return; }
          var match = clips.find(function (c) { return c.missing && c.name === file.name; });
          if (match) {
            probeFile(file, match);
          } else {
            var clip = {id:'clip-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),name:file.name,start:0,end:0,duration:0};
            clips.push(clip);
            if (!selectedId) selectedId = clip.id;
            probeFile(file, clip);
          }
        });
        renderClips();
      }
      function loadPreviewClip(index) {
        var c = clips[index];
        if (!c || !c.url || c.missing) return Promise.reject(new Error('Quelldatei fehlt.'));
        return new Promise(function (resolve, reject) {
          function ready() { video.onloadedmetadata = null; video.onerror = null; resolve(); }
          if (video.dataset.sourceUrl === c.url && video.readyState >= 1) { resolve(); return; }
          video.pause();
          video.onloadedmetadata = ready;
          video.onerror = function () { video.onloadedmetadata = null; reject(new Error('Video konnte nicht geladen werden: ' + c.name)); };
          video.dataset.sourceUrl = c.url;
          video.src = c.url;
          video.load();
        });
      }
      function seekVideo(seconds) {
        return new Promise(function (resolve) {
          var target = clamp(seconds, 0, Math.max(0, (video.duration || seconds) - 0.05));
          if (Math.abs(video.currentTime - target) < 0.04) { resolve(); return; }
          var done = function () { video.removeEventListener('seeked', done); resolve(); };
          video.addEventListener('seeked', done);
          video.currentTime = target;
          window.setTimeout(done, 1500);
        });
      }
      async function playClip(index, asPlaylist) {
        if (index >= clips.length) { playlist = false; playingIndex = -1; say('Filmvorschau beendet.'); return; }
        var c = clips[index];
        if (!c || !c.url || c.missing) {
          if (asPlaylist) return playClip(index + 1, true);
          say('Bitte zuerst die Quelldatei dieses Clips erneut importieren.');
          return;
        }
        playlist = !!asPlaylist; playingIndex = index; selectedId = c.id; renderClips();
        try {
          await loadPreviewClip(index);
          await seekVideo(c.start);
          video.onended = null;
          video.ontimeupdate = function () {
            if (playingIndex !== index || advancing) return;
            if (video.currentTime >= c.end - 0.04) {
              advancing = true; video.pause();
              if (playlist) {
                window.setTimeout(function () { advancing = false; playClip(index + 1, true); }, 80);
              } else {
                advancing = false; say('Clip-Vorschau beendet: ' + c.name);
              }
            }
          };
          await video.play();
          say((playlist ? 'Filmvorschau' : 'Clip-Vorschau') + ': ' + c.name);
        } catch (e) { playlist = false; say('Wiedergabe nicht möglich: ' + e.message); }
      }
      function stopPreview() {
        playlist = false; advancing = false; playingIndex = -1;
        video.pause(); video.ontimeupdate = null; video.onended = null;
      }
      function ensureAudioGraph() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (audioContext) return audioDestination;
        try {
          audioContext = new AC();
          mediaSource = audioContext.createMediaElementSource(video);
          audioDestination = audioContext.createMediaStreamDestination();
          mediaSource.connect(audioContext.destination);
          mediaSource.connect(audioDestination);
          return audioDestination;
        } catch (e) { return null; }
      }
      function drawFrame(ctx, canvas, clip) {
        var w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#070b13'; ctx.fillRect(0, 0, w, h);
        var vw = video.videoWidth || w, vh = video.videoHeight || h;
        var scale = Math.min(w / vw, h / vh), dw = vw * scale, dh = vh * scale;
        ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
        var title = root.querySelector('#hdvs-title-text').value.trim();
        var pos = root.querySelector('#hdvs-title-position').value;
        if (title) {
          var lines = [], words = title.split(/\s+/), line = '';
          ctx.font = 'bold 52px system-ui, sans-serif';
          words.forEach(function (word) {
            var test = line ? line + ' ' + word : word;
            if (line && ctx.measureText(test).width > w * 0.84) { lines.push(line); line = word; } else line = test;
          });
          if (line) lines.push(line);
          var lineHeight = 62, total = lines.length * lineHeight;
          var y = pos === 'top' ? 100 : (pos === 'bottom' ? h - total - 90 : (h - total) / 2);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          lines.forEach(function (txt, i) {
            var yy = y + i * lineHeight + lineHeight / 2;
            ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,.82)'; ctx.strokeText(txt, w / 2, yy, w * .9);
            ctx.fillStyle = '#ffffff'; ctx.fillText(txt, w / 2, yy, w * .9);
          });
        }
        if (clip && status) {
          var pct = clip.end > clip.start ? clamp((video.currentTime - clip.start) / (clip.end - clip.start), 0, 1) : 0;
          progress.style.width = Math.round(pct * 100) + '%';
        }
      }
      function waitForExportClip(c) {
        return loadPreviewClip(clips.indexOf(c)).then(function () { return seekVideo(c.start); });
      }
      async function renderExportClip(c, ctx, canvas) {
        await waitForExportClip(c);
        await new Promise(function (resolve, reject) {
          function tick() {
            if (closed) { reject(new Error('Studio wurde geschlossen.')); return; }
            drawFrame(ctx, canvas, c);
            if (video.currentTime >= c.end - 0.025 || video.ended) {
              video.pause(); drawFrame(ctx, canvas, c); resolve();
            } else {
              exportRaf = window.requestAnimationFrame(tick);
            }
          }
          var startPromise;
          try { startPromise = video.play(); } catch (e) { reject(e); return; }
          Promise.resolve(startPromise).then(tick).catch(reject);
        });
      }
      async function exportVideo() {
        if (exporting) return;
        var valid = clips.filter(function (c) { return c.url && !c.missing && c.end > c.start; });
        if (!valid.length) { say('Für den Export wird mindestens ein gültiger Clip benötigt.'); return; }
        if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
          say('Dieser Browser unterstützt den WebM-Export über MediaRecorder/Canvas nicht.');
          return;
        }
        exporting = true;
        var button = root.querySelector('#hdvs-export');
        button.disabled = true;
        stopPreview();
        var canvas = document.createElement('canvas');
        canvas.width = 1280; canvas.height = 720;
        var ctx = canvas.getContext('2d');
        drawFrame(ctx, canvas, null);
        var canvasStream = canvas.captureStream(30);
        var audio = ensureAudioGraph();
        if (audioContext) { try { await audioContext.resume(); } catch (e) {} }
        var tracks = canvasStream.getVideoTracks().slice();
        if (audio && audio.stream) tracks = tracks.concat(audio.stream.getAudioTracks());
        var stream = new MediaStream(tracks);
        var mime = '';
        ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].some(function (type) {
          if (MediaRecorder.isTypeSupported(type)) { mime = type; return true; }
          return false;
        });
        var chunks = [];
        try {
          recorder = mime ? new MediaRecorder(stream, {mimeType:mime}) : new MediaRecorder(stream);
          var finished = new Promise(function (resolve, reject) {
            recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
            recorder.onerror = function (e) { reject(e.error || new Error('MediaRecorder-Fehler')); };
            recorder.onstop = resolve;
          });
          recorder.start(500);
          for (var i = 0; i < valid.length; i++) {
            say('Export läuft: Clip ' + (i + 1) + ' von ' + valid.length + ' · ' + valid[i].name);
            await renderExportClip(valid[i], ctx, canvas);
          }
          recorder.stop();
          await finished;
          var blob = new Blob(chunks, {type:mime || 'video/webm'});
          if (!blob.size) throw new Error('Der Browser hat keine Videodaten erstellt.');
          download(safeName(root.querySelector('#hdvs-project-name').value, 'HalDo-Video') + '.webm', blob);
          say('Export abgeschlossen: ' + (blob.size / (1024 * 1024)).toFixed(1) + ' MB · WebM.');
        } catch (e) {
          if (recorder && recorder.state !== 'inactive') { try { recorder.stop(); } catch (ignore) {} }
          say('Videoexport fehlgeschlagen: ' + (e && e.message ? e.message : 'unbekannter Fehler'));
        } finally {
          window.cancelAnimationFrame(exportRaf);
          video.pause(); recorder = null;
          stream.getTracks().forEach(function (t) { t.stop(); });
          canvasStream.getTracks().forEach(function (t) { t.stop(); });
          exporting = false; button.disabled = false;
          progress.style.width = '0%';
        }
      }
      function saveProject() {
        var data = {
          format:'haldo-video-project',
          version:1,
          projectName:root.querySelector('#hdvs-project-name').value,
          title:root.querySelector('#hdvs-title-text').value,
          titlePosition:root.querySelector('#hdvs-title-position').value,
          clips:clips.map(function (c) { return {name:c.name,start:c.start,end:c.end,duration:c.duration}; })
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        download(safeName(data.projectName, 'HalDo-Video-Projekt') + '.haldo-video.json', blob);
        say('Projektdatei gespeichert. Videodateien müssen beim nächsten Öffnen erneut importiert werden.');
      }
      function openProject(file) {
        if (!file || file.size > MAX_PROJECT_BYTES) { say('Projektdatei fehlt oder überschreitet 2 MB.'); return; }
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var data = JSON.parse(String(reader.result || ''));
            if (!data || data.format !== 'haldo-video-project' || data.version !== 1 || !Array.isArray(data.clips) || data.clips.length > MAX_CLIPS) {
              throw new Error('Ungültiges HalDo-Video-Projektformat.');
            }
            stopPreview();
            clips.forEach(function (c) { if (c.url) URL.revokeObjectURL(c.url); });
            objectUrls = []; clips = [];
            projectName = String(data.projectName || 'Mein Video-Projekt').slice(0, 80);
            overlayTitle = String(data.title || '').slice(0, 120);
            titlePosition = data.titlePosition === 'top' || data.titlePosition === 'bottom' ? data.titlePosition : 'center';
            root.querySelector('#hdvs-project-name').value = projectName;
            root.querySelector('#hdvs-title-text').value = overlayTitle;
            root.querySelector('#hdvs-title-position').value = titlePosition;
            updateOverlay();
            data.clips.forEach(function (c) {
              if (!c || typeof c.name !== 'string') return;
              clips.push({
                id:'missing-' + Date.now().toString(36) + '-' + clips.length,
                name:String(c.name).slice(0, 255),
                start:Math.max(0, Number(c.start) || 0),
                end:Math.max(0, Number(c.end) || 0),
                duration:Math.max(0, Number(c.duration) || 0),
                url:null,file:null,missing:true
              });
            });
            selectedId = clips.length ? clips[0].id : null;
            persist(); renderClips();
            say('Projekt geöffnet. Importiere jetzt die Quelldateien erneut; passende Dateinamen werden automatisch zugeordnet.');
          } catch (e) { say('Projekt konnte nicht geöffnet werden: ' + e.message); }
        };
        reader.onerror = function () { say('Projektdatei konnte nicht gelesen werden.'); };
        reader.readAsText(file);
      }

      root.querySelector('#hdvs-add').addEventListener('click', function () { root.querySelector('#hdvs-files').click(); });
      root.querySelector('#hdvs-files').addEventListener('change', function (e) { importFiles(e.target.files); e.target.value = ''; });
      root.querySelector('#hdvs-save').addEventListener('click', saveProject);
      root.querySelector('#hdvs-open').addEventListener('click', function () { root.querySelector('#hdvs-project-file').click(); });
      root.querySelector('#hdvs-project-file').addEventListener('change', function (e) { openProject(e.target.files[0]); e.target.value = ''; });
      root.querySelector('#hdvs-play-clip').addEventListener('click', function () {
        var index = selectedIndex(); if (index < 0) { say('Wähle zuerst einen Clip.'); return; } playClip(index, false);
      });
      root.querySelector('#hdvs-play-all').addEventListener('click', function () { if (!clips.length) { say('Importiere zuerst Videos.'); return; } playClip(0, true); });
      root.querySelector('#hdvs-stop').addEventListener('click', function () { stopPreview(); say('Wiedergabe gestoppt.'); });
      root.querySelector('#hdvs-export').addEventListener('click', exportVideo);
      root.querySelector('#hdvs-project-name').addEventListener('change', persist);
      root.querySelector('#hdvs-title-text').addEventListener('input', function () { updateOverlay(); persist(); });
      root.querySelector('#hdvs-title-position').addEventListener('change', function () { updateOverlay(); persist(); });

      clipsNode.addEventListener('click', function (e) {
        var action = e.target.closest('[data-action]');
        var row = e.target.closest('[data-clip-id]');
        if (action) {
          var id = action.dataset.id, index = clips.findIndex(function (c) { return c.id === id; });
          if (index < 0) return;
          var kind = action.dataset.action;
          if (kind === 'remove') {
            var removed = clips.splice(index, 1)[0];
            if (removed.url) URL.revokeObjectURL(removed.url);
            if (selectedId === id) selectedId = clips.length ? clips[Math.min(index, clips.length - 1)].id : null;
            stopPreview(); renderClips(); persist(); say('Clip entfernt.'); return;
          }
          var next = kind === 'up' ? index - 1 : index + 1;
          if (next >= 0 && next < clips.length) {
            var temp = clips[index]; clips[index] = clips[next]; clips[next] = temp;
            renderClips(); persist();
          }
          return;
        }
        if (row) {
          selectedId = row.dataset.clipId; renderClips();
          var index = selectedIndex();
          if (index >= 0 && clips[index].url) {
            loadPreviewClip(index).then(function () { return seekVideo(clips[index].start); }).catch(function (e) { say(e.message); });
            say('Ausgewählt: ' + clips[index].name);
          }
        }
      });
      clipsNode.addEventListener('change', function (e) {
        var field = e.target.dataset.trim;
        if (!field) return;
        var c = getClipById(e.target.dataset.id);
        if (!c) return;
        var v = Math.max(0, Number(e.target.value) || 0);
        if (field === 'start') c.start = clamp(v, 0, Math.max(0, c.end - 0.1));
        else c.end = clamp(v, c.start + 0.1, c.duration);
        renderClips(); persist(); say('Schnittmarke aktualisiert: ' + c.name);
      });
      video.addEventListener('ended', function () {
        if (playlist && !advancing) { advancing = true; var next = playingIndex + 1; window.setTimeout(function () { advancing = false; playClip(next, true); }, 80); }
      });
      updateOverlay();
      renderClips();
      /* Release playback, recorder, media tracks and Blob URLs when this desktop window closes. */
      if (typeof MutationObserver === 'function' && win) {
        observer = new MutationObserver(function () {
          if (!win.isConnected && !closed) {
            closed = true; stopPreview();
            if (recorder && recorder.state !== 'inactive') { try { recorder.stop(); } catch (e) {} }
            if (exportRaf) window.cancelAnimationFrame(exportRaf);
            if (audioContext) { try { audioContext.close(); } catch (e) {} }
            objectUrls.forEach(function (url) { try { URL.revokeObjectURL(url); } catch (e) {} });
            if (observer) observer.disconnect();
          }
        });
        observer.observe(document.body, {childList:true, subtree:true});
      }
    }, 90);
  }

  H.VideoStudio = {__nativePro:true, open:open};
  H['video-studio'] = H.VideoStudio;
  console.info('HalDo Video Studio Pro: native module registered.');
})();