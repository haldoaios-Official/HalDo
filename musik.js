/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v14.0) · PIANO-ROLL FOUNDATION
   Web Audio API · Piano-Roll Sequencer · Sichere Zeitberechnung
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- SICHERE ZEITBERECHNUNG (Der Fix für den Audio-Fehler) ---
  function safeTime(t) { return Math.max(0, t || 0); }
  function safeDur(d) { return Math.max(0.05, d || 0.05); }

  // --- AUDIO ENGINE (Aus deiner alten Datei) ---
  var NOTE_FREQ = {};
  (function() {
    var names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    for (var o = 0; o <= 8; o++) for (var i = 0; i < 12; i++) NOTE_FREQ[names[i] + o] = 440 * Math.pow(2, (o*12 + i - 57) / 12);
  })();
  function noteFreq(n) { return NOTE_FREQ[n] || 440; }
  function midiToName(m) { var n = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; return n[((m%12)+12)%12] + (Math.floor(m/12) - 1); }

  var SCALES = { major: [0,2,4,5,7,9,11], minor: [0,2,3,5,7,8,10], pentatonic: [0,2,4,7,9] };
  var KEY_ROOT = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "Bb": 10 };
  function getScale(root, mode) { var iv = SCALES[mode] || SCALES.major; return iv.map(function(i) { return root + i; }); }

  function playInstrument(ctx, dest, freq, startTime, dur, amp, type) {
    startTime = safeTime(startTime); dur = safeDur(dur);
    if (amp <= 0.001) return;
    var osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = "lowpass"; filt.Q.value = 1;
    switch(type) {
      case "piano": osc1.type = "triangle"; osc2.type = "sine"; osc2.detune.value = 2; filt.frequency.value = 4000; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.015); g.gain.exponentialRampToValueAtTime(amp * 0.3, startTime + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, startTime + dur); break;
      case "guitar": osc1.type = "sawtooth"; osc2.type = "triangle"; osc2.detune.value = -5; filt.frequency.value = 2500; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.008); g.gain.exponentialRampToValueAtTime(amp * 0.4, startTime + dur * 0.5); g.gain.linearRampToValueAtTime(0.0001, startTime + dur); break;
      case "strings": osc1.type = "sawtooth"; osc2.type = "sawtooth"; osc2.detune.value = 8; filt.frequency.value = 3000; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.35); g.gain.setValueAtTime(amp, startTime + dur - 0.25); g.gain.linearRampToValueAtTime(0.0001, startTime + dur); break;
      case "bass": osc1.type = "triangle"; osc2.type = "sine"; filt.frequency.value = 800; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.02); g.gain.setValueAtTime(amp * 0.9, startTime + dur - 0.1); g.gain.linearRampToValueAtTime(0.0001, startTime + dur); break;
      case "flute": osc1.type = "sine"; osc2.type = "triangle"; osc2.detune.value = 5; filt.frequency.value = 6000; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.08); g.gain.setValueAtTime(amp, startTime + dur - 0.1); g.gain.linearRampToValueAtTime(0.0001, startTime + dur); break;
      case "duduk": osc1.type = "sine"; osc2.type = "sawtooth"; osc2.detune.value = 4; filt.frequency.value = 3500; filt.Q.value = 1.5; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.12); g.gain.setValueAtTime(amp, startTime + dur - 0.15); g.gain.linearRampToValueAtTime(0.0001, startTime + dur); break;
      default: osc1.type = "triangle"; filt.frequency.value = 4000; g.gain.setValueAtTime(0.0001, startTime); g.gain.linearRampToValueAtTime(amp, startTime + 0.02); g.gain.linearRampToValueAtTime(0.0001, startTime + dur);
    }
    osc1.frequency.value = freq; osc2.frequency.value = freq;
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(dest);
    osc1.start(startTime); osc1.stop(startTime + dur + 0.05);
    osc2.start(startTime); osc2.stop(startTime + dur + 0.05);
  }

  function playKick(ctx, dest, t, amp) { t = safeTime(t); var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.13); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.35); }
  function playSnare(ctx, dest, t, amp) { t = safeTime(t); var bs = Math.floor(ctx.sampleRate * 0.2), buf = ctx.createBuffer(1, bs, ctx.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 3); var s = ctx.createBufferSource(); s.buffer = buf; var g = ctx.createGain(); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400; s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + 0.22); }
  function playHat(ctx, dest, t, amp) { t = safeTime(t); var bs = Math.floor(ctx.sampleRate * 0.06), buf = ctx.createBuffer(1, bs, ctx.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 2); var s = ctx.createBufferSource(); s.buffer = buf; var g = ctx.createGain(); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07); var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + 0.1); }

  function audioBufferToWav(buffer) {
    var nCh = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate, bps = 2, ba = nCh*bps, br = sr*ba, ds = len*ba;
    var ab = new ArrayBuffer(44+ds), view = new DataView(ab);
    function wr(off, s) { for (var i = 0; i < s.length; i++) view.setUint8(off+i, s.charCodeAt(i)); }
    wr(0, "RIFF"); view.setUint32(4, 36+ds, true); wr(8, "WAVE"); wr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, nCh, true); view.setUint32(24, sr, true); view.setUint32(28, br, true); view.setUint16(32, ba, true); view.setUint16(34, 16, true); wr(36, "data"); view.setUint32(40, ds, true);
    var chs = []; for (var c = 0; c < nCh; c++) chs.push(buffer.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) for (var c = 0; c < nCh; c++) { var s = Math.max(-1, Math.min(1, chs[c][i])); view.setInt16(off, s < 0 ? s*0x8000 : s*0x7FFF, true); off += 2; }
    return new Blob([ab], { type: "audio/wav" });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      grid: [], // 16 Schritte x 12 Noten (C4 bis B4)
      tempo: 110,
      instrument: "piano",
      audioUrl: null
    };

    // Initialisiere ein leeres Gitter
    for(var r = 0; r < 12; r++) {
        ST.grid[r] = new Array(16).fill(false);
    }

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Piano-Roll</button>'
        + '</div>';

      if(tab === "studio"){
        // Steuerung
        body += '<div class="card"><h3>🎵 Einstellungen</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">INSTRUMENT</label>'
          + '<select id="mInst" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="piano"' + (ST.instrument==="piano"?" selected":"") + '>Klavier</option>'
          + '<option value="guitar"' + (ST.instrument==="guitar"?" selected":"") + '>Gitarre</option>'
          + '<option value="bass"' + (ST.instrument==="bass"?" selected":"") + '>Bass</option>'
          + '<option value="strings"' + (ST.instrument==="strings"?" selected":"") + '>Streicher</option>'
          + '<option value="flute"' + (ST.instrument==="flute"?" selected":"") + '>Flöte</option>'
          + '<option value="duduk"' + (ST.instrument==="duduk"?" selected":"") + '>Duduk</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="mTempo" value="' + ST.tempo + '" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '</div></div>';

        // Piano-Roll Gitter
        body += '<div class="card"><h3>🎹 Piano-Roll (C4 - B4)</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(16, 1fr);gap:3px">';
        
        // Notennamen für die Zeilen (von B4 bis C4)
        var noteNames = ["B","A#","A","G#","G","F#","F","E","D#","D","C#","C"];
        for(var r = 0; r < 12; r++) {
            for(var c = 0; c < 16; c++) {
                var isActive = ST.grid[r][c];
                var noteName = noteNames[r] + "4";
                body += '<button type="button" data-row="' + r + '" data-col="' + c + '" style="aspect-ratio:1;background:' + (isActive ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.2)") + ';border:1px solid var(--border-soft);border-radius:6px;cursor:pointer"></button>';
            }
        }
        body += '</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:8px;text-align:center">Klick auf die Kästchen, um Noten zu setzen.</div>'
          + '</div>';

        // Play & Export
        body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
          + '<button class="btn full" id="mPlay" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">▶️ Sequenz abspielen</button>'
          + '<div id="playerContainer" style="display:none;margin-top:14px;padding:14px;background:var(--bg-3);border-radius:12px;border:1px solid var(--border-soft)">'
          + '<div style="font-size:12px;font-weight:900;color:var(--p1);margin-bottom:8px">🎧 Dein generierter Song</div>'
          + '<audio id="mainAudio" controls style="width:100%;border-radius:8px"></audio>'
          + '<button class="btn sec full" id="downloadWav" style="margin-top:10px;font-size:11px">⬇️ WAV herunterladen</button>'
          + '</div>'
          + '<div id="mStatus" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if (tab === "studio") {
        // Gitter-Klicks
        container.querySelectorAll("[data-row]").forEach(btn => {
            btn.addEventListener("click", function() {
                var r = parseInt(this.dataset.row);
                var c = parseInt(this.dataset.col);
                ST.grid[r][c] = !ST.grid[r][c];
                build(); // UI neu zeichnen
            });
        });

        container.querySelector("#mInst").addEventListener("change", function(){ ST.instrument = this.value; });
        container.querySelector("#mTempo").addEventListener("change", function(){ ST.tempo = Math.max(40, Math.min(200, parseFloat(this.value) || 100)); });

        container.querySelector("#mPlay").addEventListener("click", playSequence);

        container.querySelector("#downloadWav").addEventListener("click", function(){
          if(!ST.audioUrl) return;
          var a = document.createElement("a");
          a.href = ST.audioUrl;
          a.download = "haldo-song-" + Date.now() + ".wav";
          a.click();
        });
      }
    }

    // --- SEQUENZ ABSPIELEN & RENDERN ---
    async function playSequence() {
        var btn = document.querySelector("#mPlay");
        var stat = document.querySelector("#mStatus");
        btn.disabled = true; stat.style.display = "block"; stat.className = "info"; stat.textContent = "⏳ Rendere Audio...";

        try {
            var tempo = ST.tempo;
            var beatDur = 60 / tempo;
            var stepDur = beatDur / 4; // 16tel-Noten
            var totalSteps = 16;
            var totalDur = totalSteps * stepDur + 1.0; // 1 Sekunde Puffer am Ende

            var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            var offCtx = new OAC(2, Math.ceil(totalDur * 44100), 44100);
            
            var masterGain = offCtx.createGain(); masterGain.gain.value = 1.5;
            masterGain.connect(offCtx.destination);

            var noteNames = ["B","A#","A","G#","G","F#","F","E","D#","D","C#","C"];

            for(var step = 0; step < totalSteps; step++) {
                var time = step * stepDur;
                for(var row = 0; row < 12; row++) {
                    if(ST.grid[row][step]) {
                        var noteName = noteNames[row] + "4";
                        playInstrument(offCtx, masterGain, noteFreq(noteName), time, stepDur * 0.9, 0.6, ST.instrument);
                    }
                }
                // Füge einen einfachen Kick-Drum auf jeden 4. Schritt hinzu
                if(step % 4 === 0) {
                    playKick(offCtx, masterGain, time, 0.8);
                }
            }

            var rendered = await offCtx.startRendering();
            var wav = audioBufferToWav(rendered);
            if (ST.audioUrl) URL.revokeObjectURL(ST.audioUrl);
            ST.audioUrl = URL.createObjectURL(wav);
            
            var playerContainer = document.querySelector("#playerContainer");
            var audioPlayer = document.querySelector("#mainAudio");
            playerContainer.style.display = "block";
            audioPlayer.src = ST.audioUrl;
            audioPlayer.play();

            stat.className = "info ok";
            stat.textContent = "✅ Song fertig! (" + Math.round(rendered.duration) + "s)";
            btn.disabled = false;

        } catch(e) {
            console.error(e);
            stat.className = "info err";
            stat.textContent = "❌ Fehler: " + e.message;
            btn.disabled = false;
        }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v14.0 geladen — PIANO-ROLL FOUNDATION");
})();
