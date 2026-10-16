/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VIDEO STUDIO (v200)
   Player · Trim · Cut · Filter · Speed · Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmtTime(s){
    if(!s || !isFinite(s)) return "0:00";
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  var VS = {
    video: null,
    currentFile: null,
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
    speed: 1,
    volume: 1,
    filters: { brightness: 100, contrast: 100, saturate: 100, hue: 0, blur: 0 },
    clips: []
  };

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "player");

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "player" ? " active" : "") + '" data-vtab="player">▶️ Player</button>'
        + '<button class="tab' + (tab === "trim" ? " active" : "") + '" data-vtab="trim">✂️ Trim</button>'
        + '<button class="tab' + (tab === "filter" ? " active" : "") + '" data-vtab="filter">✨ Filter</button>'
        + '<button class="tab' + (tab === "bibliothek" ? " active" : "") + '" data-vtab="bibliothek">📚 Bibliothek</button>'
        + '<button class="tab' + (tab === "settings" ? " active" : "") + '" data-vtab="settings">⚙️</button>'
        + '</div>';

      /* ═══ PLAYER ═══ */
      if(tab === "player"){
        body += '<div class="card" style="padding:8px">'
          + '<video id="vs_video" controls playsinline style="width:100%;border-radius:10px;background:#000;display:block;max-height:400px">'
          + '</video>'
          + '</div>';

        body += '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="file" id="vs_upload" accept="video/*" style="display:none">'
          + '<button class="btn" id="vs_uploadBtn" style="flex:1;font-size:12px">📤 Video laden</button>'
          + '<button class="btn sec" id="vs_fromUrl" style="font-size:12px">🔗 URL</button>'
          + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);text-align:center" id="vs_info">'
          + (VS.currentFile ? '✅ ' + _esc(VS.currentFile.name || "Video geladen") + ' · ' + fmtTime(VS.duration) : 'Kein Video geladen')
          + '</div>'
          + '</div>';

        /* Steuerung */
        if(VS.currentFile){
          body += '<div class="card">'
            + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">'
            + '<span style="font-size:11px;color:var(--text-mute);min-width:60px">🎚️ Speed</span>'
            + '<input type="range" id="vs_speed" min="25" max="400" value="' + (VS.speed * 100) + '" style="flex:1">'
            + '<span id="vs_speedV" style="font-size:11px;color:var(--p1);font-weight:900;min-width:50px;text-align:right">' + VS.speed.toFixed(2) + 'x</span>'
            + '</div>'
            + '<div style="display:flex;gap:8px;align-items:center">'
            + '<span style="font-size:11px;color:var(--text-mute);min-width:60px">🔊 Laut</span>'
            + '<input type="range" id="vs_vol" min="0" max="100" value="' + (VS.volume * 100) + '" style="flex:1">'
            + '<span id="vs_volV" style="font-size:11px;color:var(--p1);font-weight:900;min-width:50px;text-align:right">' + Math.round(VS.volume * 100) + '%</span>'
            + '</div>'
            + '</div>';
        }
      }

      /* ═══ TRIM ═══ */
      else if(tab === "trim"){
        if(!VS.currentFile){
          body += '<div class="card"><h3>✂️ Trim</h3><div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Lade erst ein Video im Player</div></div>';
        } else {
          body += '<div class="card"><h3>✂️ Trim & Cut</h3>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">Start und Ende festlegen:</div>'
            + '<div style="margin-bottom:10px">'
            + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:700;margin-bottom:4px">'
            + '<span>Start</span>'
            + '<span id="vs_startV" style="color:var(--p1);font-weight:900">' + fmtTime(VS.trimStart) + '</span>'
            + '</div>'
            + '<input type="range" id="vs_start" min="0" max="' + (VS.duration * 10) + '" value="' + (VS.trimStart * 10) + '" style="width:100%">'
            + '</div>'
            + '<div style="margin-bottom:10px">'
            + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:700;margin-bottom:4px">'
            + '<span>Ende</span>'
            + '<span id="vs_endV" style="color:var(--p1);font-weight:900">' + fmtTime(VS.trimEnd) + '</span>'
            + '</div>'
            + '<input type="range" id="vs_end" min="0" max="' + (VS.duration * 10) + '" value="' + (VS.trimEnd * 10) + '" style="width:100%">'
            + '</div>'
            + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;text-align:center">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">LÄNGE</div>'
            + '<div style="font-size:20px;font-weight:900;color:var(--p1)" id="vs_length">' + fmtTime(VS.trimEnd - VS.trimStart) + '</div>'
            + '</div>'
            + '<button class="btn full" id="vs_preview" style="margin-top:10px">▶️ Vorschau abspielen</button>'
            + '<button class="btn sec full" id="vs_export" style="margin-top:8px">📤 Export (WebM)</button>'
            + '<div id="vs_exportStatus" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
            + '</div>';
        }
      }

      /* ═══ FILTER ═══ */
      else if(tab === "filter"){
        if(!VS.currentFile){
          body += '<div class="card"><h3>✨ Filter</h3><div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Lade erst ein Video</div></div>';
        } else {
          var f = VS.filters;
          body += '<div class="card"><h3>✨ Video-Filter</h3>'
            + slider("Helligkeit", "brightness", f.brightness, 0, 200, "%")
            + slider("Kontrast", "contrast", f.contrast, 0, 200, "%")
            + slider("Sättigung", "saturate", f.saturate, 0, 300, "%")
            + slider("Farbton", "hue", f.hue, 0, 360, "°")
            + slider("Unschärfe", "blur", f.blur, 0, 20, "px")
            + '</div>';

          body += '<div class="card"><h3>🎭 Video-Presets</h3>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
            + presetBtn("Original", {brightness:100,contrast:100,saturate:100,hue:0,blur:0})
            + presetBtn("Vintage", {brightness:105,contrast:90,saturate:80,hue:30,blur:0})
            + presetBtn("S/W", {brightness:105,contrast:120,saturate:0,hue:0,blur:0})
            + presetBtn("Cyberpunk", {brightness:110,contrast:130,saturate:180,hue:290,blur:0})
            + presetBtn("Dream", {brightness:110,contrast:85,saturate:130,hue:10,blur:1})
            + presetBtn("Neon", {brightness:115,contrast:150,saturate:200,hue:180,blur:0})
            + '</div></div>';
        }
      }

      /* ═══ BIBLIOTHEK ═══ */
      else if(tab === "bibliothek"){
        var vids = HalDo.Store.get("video:items", []);
        body += '<div class="card"><h3>📚 Bibliothek (' + vids.length + ')</h3>';
        if(!vids.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Keine Videos gespeichert</div>';
        } else {
          vids.forEach(function(v, i){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
              + '<div style="font-size:12px;font-weight:800">🎬 ' + _esc(v.name) + '</div>'
              + '<button data-vdel="' + i + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:5px 10px;font-size:11px">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      /* ═══ SETTINGS ═══ */
      else if(tab === "settings"){
        body += '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🎬 VIDEOS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p3)">' + HalDo.Store.get("video:items", []).length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-top:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.6">'
          + '🎬 <b>Video Studio v200:</b> Player, Trim, Filter, Export — alles lokal.'
          + '</div></div>'
          + '<button class="btn danger full" id="vs_clearAll" style="margin-top:10px">🗑️ Alle Videos löschen</button>'
          + '</div>';
      }

      container.innerHTML = body;

      /* ═══ EVENTS ═══ */
      container.querySelectorAll("[data-vtab]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.vtab;
          store.set("tab", tab);
          build();
        });
      });

      /* Player */
      if(tab === "player"){
        var video = container.querySelector("#vs_video");
        VS.video = video;

        if(VS.currentFile && VS.currentFile.url){
          video.src = VS.currentFile.url;
          video.playbackRate = VS.speed;
          video.volume = VS.volume;
          video.onloadedmetadata = function(){
            VS.duration = video.duration;
            if(VS.trimEnd === 0) VS.trimEnd = VS.duration;
          };
          applyVideoFilters(video);
        }

        var up = container.querySelector("#vs_upload");
        var upBtn = container.querySelector("#vs_uploadBtn");
        if(upBtn) upBtn.addEventListener("click", function(){ up.click(); });
        if(up) up.addEventListener("change", function(){
          var f = this.files[0];
          if(!f) return;
          var url = URL.createObjectURL(f);
          VS.currentFile = { name: f.name, url: url };
          build();
          if(HalDo.Notify) HalDo.Notify.success("Video geladen", { app: "video" });
        });

        var fromUrl = container.querySelector("#vs_fromUrl");
        if(fromUrl) fromUrl.addEventListener("click", function(){
          var u = prompt("Video-URL eingeben (mp4, webm):");
          if(!u) return;
          VS.currentFile = { name: "URL-Video", url: u };
          build();
        });

        var sp = container.querySelector("#vs_speed");
        if(sp) sp.addEventListener("input", function(){
          VS.speed = this.value / 100;
          container.querySelector("#vs_speedV").textContent = VS.speed.toFixed(2) + "x";
          if(video) video.playbackRate = VS.speed;
        });

        var vol = container.querySelector("#vs_vol");
        if(vol) vol.addEventListener("input", function(){
          VS.volume = this.value / 100;
          container.querySelector("#vs_volV").textContent = this.value + "%";
          if(video) video.volume = VS.volume;
        });
      }

      /* Trim */
      if(tab === "trim"){
        var startEl = container.querySelector("#vs_start");
        var endEl = container.querySelector("#vs_end");
        if(startEl) startEl.addEventListener("input", function(){
          VS.trimStart = parseFloat(this.value) / 10;
          if(VS.trimStart >= VS.trimEnd) VS.trimStart = Math.max(0, VS.trimEnd - 0.5);
          container.querySelector("#vs_startV").textContent = fmtTime(VS.trimStart);
          container.querySelector("#vs_length").textContent = fmtTime(VS.trimEnd - VS.trimStart);
        });
        if(endEl) endEl.addEventListener("input", function(){
          VS.trimEnd = parseFloat(this.value) / 10;
          if(VS.trimEnd <= VS.trimStart) VS.trimEnd = Math.min(VS.duration, VS.trimStart + 0.5);
          container.querySelector("#vs_endV").textContent = fmtTime(VS.trimEnd);
          container.querySelector("#vs_length").textContent = fmtTime(VS.trimEnd - VS.trimStart);
        });

        var prev = container.querySelector("#vs_preview");
        if(prev) prev.addEventListener("click", function(){
          if(!VS.video) return;
          VS.video.currentTime = VS.trimStart;
          VS.video.play();
          var checkEnd = setInterval(function(){
            if(VS.video.currentTime >= VS.trimEnd){
              VS.video.pause();
              clearInterval(checkEnd);
            }
          }, 100);
        });

        var exp = container.querySelector("#vs_export");
        if(exp) exp.addEventListener("click", async function(){
          var stat = container.querySelector("#vs_exportStatus");
          stat.style.display = "block";
          stat.textContent = "⏳ Exportiere...";
          try {
            await exportVideo();
            stat.textContent = "✅ Video heruntergeladen!";
          } catch(e){
            stat.textContent = "❌ " + e.message;
          }
        });
      }

      /* Filter */
      if(tab === "filter"){
        container.querySelectorAll("[data-vfilter]").forEach(function(el){
          el.addEventListener("input", function(){
            VS.filters[this.dataset.vfilter] = parseFloat(this.value);
            var lbl = container.querySelector('[data-vflabel="' + this.dataset.vfilter + '"]');
            if(lbl) lbl.textContent = this.value + (this.dataset.unit || "");
            if(VS.video) applyVideoFilters(VS.video);
          });
        });

        container.querySelectorAll("[data-vpreset]").forEach(function(el){
          el.addEventListener("click", function(){
            VS.filters = JSON.parse(el.dataset.vpreset);
            if(VS.video) applyVideoFilters(VS.video);
            build();
          });
        });
      }

      /* Bibliothek */
      if(tab === "bibliothek"){
        container.querySelectorAll("[data-vdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var v = HalDo.Store.get("video:items", []);
            v.splice(parseInt(el.dataset.vdel), 1);
            HalDo.Store.set("video:items", v);
            build();
          });
        });
      }

      /* Settings */
      if(tab === "settings"){
        var clr = container.querySelector("#vs_clearAll");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Videos löschen?")) return;
          HalDo.Store.set("video:items", []);
          build();
        });
      }
    }

    function slider(label, key, val, min, max, unit){
      return '<div style="margin-bottom:10px">'
        + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-mute);font-weight:700;margin-bottom:3px">'
        + '<span>' + _esc(label) + '</span>'
        + '<span data-vflabel="' + key + '" style="color:var(--p1);font-weight:900">' + val + unit + '</span>'
        + '</div>'
        + '<input type="range" data-vfilter="' + key + '" data-unit="' + unit + '" min="' + min + '" max="' + max + '" value="' + val + '" style="width:100%">'
        + '</div>';
    }

    function presetBtn(name, preset){
      return '<button type="button" data-vpreset=\'' + JSON.stringify(preset) + '\' style="padding:10px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;font-size:11px;font-weight:800">' + _esc(name) + '</button>';
    }

    function applyVideoFilters(video){
      var f = VS.filters;
      video.style.filter = "brightness(" + f.brightness + "%) contrast(" + f.contrast + "%) saturate(" + f.saturate + "%) hue-rotate(" + f.hue + "deg) blur(" + f.blur + "px)";
    }

    /* ═══ EXPORT via MediaRecorder + Canvas-Capture ═══ */
    async function exportVideo(){
      return new Promise(function(resolve, reject){
        if(!VS.currentFile || !VS.currentFile.url){
          reject(new Error("Kein Video geladen"));
          return;
        }

        try {
          var video = document.createElement("video");
          video.src = VS.currentFile.url;
          video.muted = false;
          video.playsInline = true;

          video.onloadedmetadata = async function(){
            var canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            var ctx = canvas.getContext("2d");

            var stream = canvas.captureStream(30);

            /* Audio hinzufügen (falls vorhanden) */
            try {
              var audioCtx = new AudioContext();
              var src = audioCtx.createMediaElementSource(video);
              var dest = audioCtx.createMediaStreamDestination();
              src.connect(dest);
              dest.stream.getAudioTracks().forEach(function(t){
                stream.addTrack(t);
              });
            } catch(e){}

            var recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
            var chunks = [];

            recorder.ondataavailable = function(e){
              if(e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = function(){
              var blob = new Blob(chunks, { type: "video/webm" });
              var url = URL.createObjectURL(blob);

              /* Zum Download */
              var a = document.createElement("a");
              a.href = url;
              a.download = "haldo-video-" + Date.now() + ".webm";
              a.click();

              /* In Bibliothek */
              var items = HalDo.Store.get("video:items", []);
              items.push({ name: "Export " + new Date().toLocaleString("de-DE"), size: blob.size, date: Date.now() });
              HalDo.Store.set("video:items", items);

              resolve();
            };

            /* Video trimmen und abspielen */
            video.currentTime = VS.trimStart;
            video.playbackRate = VS.speed;

            recorder.start();

            var drawFrame = function(){
              if(video.paused || video.ended || video.currentTime >= VS.trimEnd){
                recorder.stop();
                video.pause();
                return;
              }
              var f = VS.filters;
              ctx.filter = "brightness(" + f.brightness + "%) contrast(" + f.contrast + "%) saturate(" + f.saturate + "%) hue-rotate(" + f.hue + "deg) blur(" + f.blur + "px)";
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            };

            video.play().then(function(){
              drawFrame();
            }).catch(reject);
          };

          video.onerror = function(){
            reject(new Error("Video konnte nicht geladen werden"));
          };

        } catch(e){
          reject(e);
        }
      });
    }

    build();
  }

  HalDoApp("video", { name: "Video", icon: "🎬", render: render, category: "lifestyle" });
  console.log("🦚 video.js v200 geladen — VIDEO EDITOR");
})();
