/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v15.0) · PRO MAX DAW
   Sequencer · Mixer · KI-Komponist · Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- 100% CRASH-SICHERE AUDIO-ENGINE ---
  function safeTime(t) { return Math.max(0, t || 0); }
  function safeDur(d) { return Math.max(0.05, d || 0.05); }

  function playNote(ctx, dest, freq, time, dur, vol, type) {
    time = safeTime(time); dur = safeDur(dur); if (vol <= 0.001) return;
    var osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    osc.type = type === "bass" ? "triangle" : (type === "lead" ? "sawtooth" : "sine");
    
    if(type === "piano") { osc.type = "triangle"; filt.frequency.value = 4000; }
    if(type === "strings") { osc.type = "sawtooth"; filt.frequency.value = 2500; }
    
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(vol * 0.4, time + dur * 0.5);
    gain.gain.linearRampToValueAtTime(0.0001, time + dur);

    osc.connect(filt); filt.connect(gain); gain.connect(dest);
    osc.start(time); osc.stop(time + dur + 0.1);
  }

  function playDrum(ctx, dest, time, vol, drumType) {
    time = safeTime(time); if (vol <= 0.001) return;
    if (drumType === "kick") {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(150, time); o.frequency.exponentialRampToValueAtTime(40, time + 0.1);
      g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
      o.connect(g); g.connect(dest); o.start(time); o.stop(time + 0.25);
    } else if (drumType === "snare") {
      var bs = Math.floor(ctx.sampleRate * 0.2), buf = ctx.createBuffer(1, bs, ctx.sampleRate);
      var d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 3);
      var s = ctx.createBufferSource(); s.buffer = buf; var g = ctx.createGain();
      g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
      var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
      s.connect(f); f.connect(g); g.connect(dest); s.start(time); s.stop(time + 0.2);
    } else if (drumType === "hat") {
      var bs2 = Math.floor(ctx.sampleRate * 0.05), buf2 = ctx.createBuffer(1, bs2, ctx.sampleRate);
      var d2 = buf2.getChannelData(0); for (var i = 0; i < bs2; i++) d2[i] = (Math.random()*2-1) * Math.pow(1 - i/bs2, 2);
      var s2 = ctx.createBufferSource(); s2.buffer = buf2; var g2 = ctx.createGain();
      g2.gain.setValueAtTime(vol * 0.6, time); g2.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      var f2 = ctx.createBiquadFilter(); f2.type = "highpass"; f2.frequency.value = 7000;
      s2.connect(f2); f2.connect(g2); g2.connect(dest); s2.start(time); s2.stop(time + 0.06);
    }
  }

  function audioBufferToWav(buffer) {
    var nCh = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate, ba = nCh*2, br = sr*ba, ds = len*ba;
    var ab = new ArrayBuffer(44+ds), view = new DataView(ab);
    function wr(o, s) { for (var i = 0; i < s.length; i++) view.setUint8(o+i, s.charCodeAt(i)); }
    wr(0, "RIFF"); view.setUint32(4, 36+ds, true); wr(8, "WAVE"); wr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, nCh, true); view.setUint32(24, sr, true); view.setUint32(28, br, true); view.setUint16(32, ba, true); view.setUint16(34, 16, true); wr(36, "data"); view.setUint32(40, ds, true);
    var chs = []; for (var c = 0; c < nCh; c++) chs.push(buffer.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) for (var c = 0; c < nCh; c++) { var s = Math.max(-1, Math.min(1, chs[c][i])); view.setInt16(off, s < 0 ? s*0x8000 : s*0x7FFF, true); off += 2; }
    return new Blob([ab], { type: "audio/wav" });
  }

  // --- UI & LOGIK ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    // Der komplette Studio-Zustand
    var ST = {
      bpm: 110,
      grid: {
        drums: Array(16).fill(null).map(() => ({ kick: false, snare: false, hat: false })),
        bass:  Array(16).fill(false),
        chords: Array(16).fill(false),
        lead:  Array(16).fill(false)
      },
      vol: { drums: 0.9, bass: 0.7, chords: 0.5, lead: 0.6 },
      lyrics: "",
      audioUrl: null
    };

    var SCALE = [0, 2, 3, 5, 7, 8, 10, 12]; // A-Moll Pentatonik
    var ROOT = 57; // A3

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Sequencer</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-mtab="ai">🤖 KI & Text</button>'
        + '</div>';

      /* ═══════════ TAB 1: SEQUENCER ═══════════ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:10px; overflow-x:auto">'
          + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">'
          + '<div style="font-size:14px; font-weight:900; color:var(--p1)">🎹 16-Step Sequencer</div>'
          + '<input type="number" id="bpmInp" value="' + ST.bpm + '" style="width:60px; padding:5px; text-align:center; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff">'
          + '</div>';

        // Gitter
        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:4px; min-width:400px">';
        
        // Drums
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px">DRUMS</div>';
        ['kick', 'snare', 'hat'].forEach(d => {
          for(let i=0; i<16; i++) {
            let active = ST.grid.drums[i][d];
            let color = d === 'kick' ? '#ff4d4d' : (d === 'snare' ? '#fbbf24' : '#00e5ff');
            body += '<button data-drum="'+d+'" data-idx="'+i+'" style="height:30px; background:' + (active ? color : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
          }
        });

        // Bass
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px">BASS</div>';
        for(let i=0; i<16; i++) {
          body += '<button data-track="bass" data-idx="'+i+'" style="height:30px; background:' + (ST.grid.bass[i] ? "var(--p2)" : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
        }

        // Chords
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px">CHORDS</div>';
        for(let i=0; i<16; i++) {
          body += '<button data-track="chords" data-idx="'+i+'" style="height:30px; background:' + (ST.grid.chords[i] ? "var(--p3)" : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
        }

        // Lead
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px">LEAD MELODY</div>';
        for(let i=0; i<16; i++) {
          body += '<button data-track="lead" data-idx="'+i+'" style="height:30px; background:' + (ST.grid.lead[i] ? "#4ade80" : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
        }

        body += '</div></div>';

        body += '<div class="card" style="display:flex; gap:10px">'
          + '<button class="btn sec" id="btnClear" style="flex:1">🗑️ Leeren</button>'
          + '<button class="btn" id="btnPlay" style="flex:2; background:linear-gradient(135deg,#4ade80,#00e5ff); color:#000">▶️ Song abspielen</button>'
          + '</div>';
      }

      /* ═══════════ TAB 2: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Lautstärke-Mixer</h3>';
        ['drums', 'bass', 'chords', 'lead'].forEach(t => {
          body += '<div style="margin-bottom:12px">'
            + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>' + t.toUpperCase() + '</span><span id="lbl_'+t+'">' + Math.round(ST.vol[t]*100) + '%</span></div>'
            + '<input type="range" data-vol="'+t+'" min="0" max="100" value="' + (ST.vol[t]*100) + '" style="width:100%">'
            + '</div>';
        });
        body += '</div>';
      }

      /* ═══════════ TAB 3: KI & TEXT ═══════════ */
      if(tab === "ai"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<textarea id="lyricsInp" rows="5" placeholder="Schreibe deinen Text hier..." style="width:100%; padding:10px; background:rgba(0,0,0,.3); border:1px solid var(--border-soft); border-radius:10px; color:#fff">' + _esc(ST.lyrics) + '</textarea>'
          + '<button class="btn full" id="btnGenAI" style="margin-top:8px; background:var(--p1); color:#000">✨ KI generiert Beat & Text</button>'
          + '<button class="btn sec full" id="btnSpeak" style="margin-top:8px">🗣️ Text vorlesen (TTS)</button>'
          + '</div>';
      }

      // Player-Container
      body += '<div id="playerBox" style="display:' + (ST.audioUrl ? 'block' : 'none') + '; margin-top:14px; padding:14px; background:var(--bg-3); border-radius:12px; border:1px solid var(--border-soft)">'
        + '<div style="font-size:12px; font-weight:900; color:var(--p1); margin-bottom:8px">🎧 Dein Song</div>'
        + '<audio id="audioPlayer" controls src="' + (ST.audioUrl || "") + '" style="width:100%; border-radius:8px"></audio>'
        + '<button class="btn sec full" id="btnDownload" style="margin-top:8px; font-size:11px">⬇️ Als WAV herunterladen</button>'
        + '</div>';

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if(tab === "studio"){
        container.querySelector("#bpmInp").addEventListener("change", function(){ ST.bpm = parseFloat(this.value) || 110; });
        container.querySelectorAll("[data-drum]").forEach(btn => {
          btn.addEventListener("click", function() {
            ST.grid.drums[this.dataset.idx][this.dataset.drum] = !ST.grid.drums[this.dataset.idx][this.dataset.drum];
            build();
          });
        });
        container.querySelectorAll("[data-track]").forEach(btn => {
          btn.addEventListener("click", function() {
            var trk = this.dataset.track; var idx = this.dataset.idx;
            ST.grid[trk][idx] = !ST.grid[trk][idx];
            build();
          });
        });
        container.querySelector("#btnClear").addEventListener("click", function(){
          ST.grid.drums.forEach(d => { d.kick = false; d.snare = false; d.hat = false; });
          ST.grid.bass.fill(false); ST.grid.chords.fill(false); ST.grid.lead.fill(false);
          build();
        });
        container.querySelector("#btnPlay").addEventListener("click", playSong);
      }

      if(tab === "mixer"){
        container.querySelectorAll("[data-vol]").forEach(slider => {
          slider.addEventListener("input", function() {
            var t = this.dataset.vol; ST.vol[t] = this.value / 100;
            container.querySelector("#lbl_" + t).textContent = this.value + "%";
          });
        });
      }

      if(tab === "ai"){
        container.querySelector("#lyricsInp").addEventListener("input", function(){ ST.lyrics = this.value; });
        
        container.querySelector("#btnGenAI").addEventListener("click", async function() {
          this.disabled = true; this.textContent = "⏳ KI arbeitet...";
          try {
            // 1. Text generieren (falls leer)
            if(!ST.lyrics) {
              var text = await HalDo.AI.writeLyrics("Ein episches Lied über Hoffnung", "Deutsch", "Pop", "emotional");
              ST.lyrics = text;
            }
            // 2. Beat generieren (Algorithmisch)
            ST.grid.drums.forEach((d, i) => {
              d.kick = (i % 4 === 0);
              d.snare = (i % 8 === 4);
              d.hat = (i % 2 === 0);
            });
            ST.grid.bass = Array(16).fill(false).map((_, i) => i % 4 === 0);
            ST.grid.chords = Array(16).fill(false).map((_, i) => i === 0 || i === 6 || i === 10);
            ST.grid.lead = Array(16).fill(false).map((_, i) => [0, 3, 7, 11, 14].includes(i));
            
            build();
            if(window.HalDo.Notify) HalDo.Notify.success("KI Beat & Text generiert!");
          } catch(e) { alert(e.message); }
          this.disabled = false; this.textContent = "✨ KI generiert Beat & Text";
        });

        container.querySelector("#btnSpeak").addEventListener("click", function() {
          if(!ST.lyrics) return alert("Kein Text vorhanden!");
          window.speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(ST.lyrics);
          u.lang = "de-DE"; u.rate = 1.0; u.pitch = 1.0;
          window.speechSynthesis.speak(u);
        });
      }

      if(ST.audioUrl) {
        container.querySelector("#btnDownload").addEventListener("click", function() {
          var a = document.createElement("a"); a.href = ST.audioUrl; a.download = "haldo-beat.wav"; a.click();
        });
      }
    }

    // --- SONGS RENDERN & ABSPIELEN ---
    async function playSong() {
      var btn = document.querySelector("#btnPlay");
      btn.disabled = true; btn.textContent = "⏳ Rendere...";

      try {
        var tempo = ST.bpm;
        var stepDur = (60 / tempo) / 4; // 16tel
        var totalDur = 16 * stepDur * 2; // 2 Loops

        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offCtx = new OAC(2, Math.ceil(totalDur * 44100), 44100);
        var master = offCtx.createGain(); master.gain.value = 0.8; master.connect(offCtx.destination);
        
        var trackGains = {
          drums: offCtx.createGain(), bass: offCtx.createGain(),
          chords: offCtx.createGain(), lead: offCtx.createGain()
        };
        Object.keys(trackGains).forEach(k => {
          trackGains[k].gain.value = ST.vol[k];
          trackGains[k].connect(master);
        });

        for(var loop = 0; loop < 2; loop++) {
          for(var i = 0; i < 16; i++) {
            var time = (loop * 16 + i) * stepDur;

            // Drums
            if(ST.grid.drums[i].kick) playDrum(offCtx, trackGains.drums, time, 0.8, "kick");
            if(ST.grid.drums[i].snare) playDrum(offCtx, trackGains.drums, time, 0.6, "snare");
            if(ST.grid.drums[i].hat) playDrum(offCtx, trackGains.drums, time, 0.4, "hat");

            // Bass
            if(ST.grid.bass[i]) playNote(offCtx, trackGains.bass, 440 * Math.pow(2, (36 - 69)/12), time, stepDur * 2, 0.8, "bass"); // C2

            // Chords
            if(ST.grid.chords[i]) {
              [57, 60, 64].forEach(n => playNote(offCtx, trackGains.chords, 440 * Math.pow(2, (n - 69)/12), time, stepDur * 4, 0.5, "strings"));
            }

            // Lead
            if(ST.grid.lead[i]) {
              var note = ROOT + SCALE[i % SCALE.length];
              playNote(offCtx, trackGains.lead, 440 * Math.pow(2, (note - 69)/12), time, stepDur * 2, 0.7, "lead");
            }
          }
        }

        var rendered = await offCtx.startRendering();
        var wav = audioBufferToWav(rendered);
        if (ST.audioUrl) URL.revokeObjectURL(ST.audioUrl);
        ST.audioUrl = URL.createObjectURL(wav);
        
        build(); // UI neu laden, um Player anzuzeigen
        document.querySelector("#audioPlayer").play();

      } catch(e) {
        console.error(e); alert("Fehler: " + e.message);
        btn.disabled = false; btn.textContent = "▶️ Song abspielen";
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v15.0 geladen — PRO MAX DAW");
})();
