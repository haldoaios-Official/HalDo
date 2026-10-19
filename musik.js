/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v20.0) · FULL DAW EXPERIENCE
   Real-time Visualizer · Master FX · Auto-Save · Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- AUDIO ENGINE SETUP ---
  var audioCtx = null;
  var masterGain = null;
  var analyser = null;
  var isPlaying = false;
  var currentStep = 0;
  var loopInterval = null;
  var vizAnimId = null;
  
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master Gain
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.8;
      
      // Analyser für den Visualizer
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      
      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  // --- INSTRUMENTE ---
  function playKick(vol) {
    if (!audioCtx || vol <= 0.001) return;
    var time = Math.max(0, audioCtx.currentTime);
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(150, time); o.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    o.connect(g); g.connect(masterGain); o.start(time); o.stop(time + 0.25);
  }

  function playSnare(vol) {
    if (!audioCtx || vol <= 0.001) return;
    var time = Math.max(0, audioCtx.currentTime);
    var bs = Math.floor(audioCtx.sampleRate * 0.2), buf = audioCtx.createBuffer(1, bs, audioCtx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 3);
    var s = audioCtx.createBufferSource(); s.buffer = buf; var g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    var f = audioCtx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
    s.connect(f); f.connect(g); g.connect(masterGain); s.start(time); s.stop(time + 0.2);
  }

  function playHat(vol) {
    if (!audioCtx || vol <= 0.001) return;
    var time = Math.max(0, audioCtx.currentTime);
    var bs = Math.floor(audioCtx.sampleRate * 0.05), buf = audioCtx.createBuffer(1, bs, audioCtx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 2);
    var s = audioCtx.createBufferSource(); s.buffer = buf; var g = audioCtx.createGain();
    g.gain.setValueAtTime(vol * 0.6, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    var f = audioCtx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
    s.connect(f); f.connect(g); g.connect(masterGain); s.start(time); s.stop(time + 0.06);
  }

  function playNote(freq, dur, vol, type) {
    if (!audioCtx || vol <= 0.001) return;
    var time = Math.max(0, audioCtx.currentTime);
    var endTime = time + Math.max(0.1, dur);

    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), filt = audioCtx.createBiquadFilter();
    filt.type = "lowpass";
    
    if(type === "vocal_a" || type === "vocal_o") {
        // Formant Vocal Synth
        osc.type = "sawtooth"; filt.frequency.value = 6000;
        var formants = type === "vocal_a" ? [800, 1150, 2900] : [450, 800, 2830];
        var fFilters = formants.map(f => {
            var b = audioCtx.createBiquadFilter(); b.type = "bandpass"; b.frequency.value = f; b.Q.value = 8; return b;
        });
        osc.connect(fFilters[0]); osc.connect(fFilters[1]); osc.connect(fFilters[2]);
        fFilters.forEach(f => f.connect(gain));
        gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(vol * 1.5, time + 0.1);
        gain.gain.setValueAtTime(vol * 1.5, endTime - 0.1); gain.gain.linearRampToValueAtTime(0, endTime);
    } else {
        // Standard Instrumente
        if(type === "piano") { osc.type = "triangle"; filt.frequency.value = 4000; }
        else if(type === "saz") { osc.type = "sawtooth"; filt.frequency.value = 2000; }
        else if(type === "duduk") { osc.type = "sine"; filt.frequency.value = 3000; }
        else { osc.type = "sawtooth"; filt.frequency.value = 3500; }
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(vol * 0.4, time + dur * 0.5);
        gain.gain.linearRampToValueAtTime(0.0001, endTime);
        osc.connect(filt); filt.connect(gain);
    }
    
    gain.connect(masterGain);
    osc.start(time); osc.stop(endTime + 0.1);
  }

  // --- OFFLINE RENDER (Export) ---
  function offlinePlayNote(ctx, dest, freq, time, dur, vol, type) {
    if (vol <= 0.001) return;
    var t = Math.max(0, time);
    var endT = Math.max(0.1, t + dur);
    var osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    if(type === "piano") { osc.type = "triangle"; filt.frequency.value = 4000; }
    else if(type === "saz") { osc.type = "sawtooth"; filt.frequency.value = 2000; }
    else if(type === "duduk") { osc.type = "sine"; filt.frequency.value = 3000; }
    else { osc.type = "sawtooth"; filt.frequency.value = 3500; }
    
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(vol * 0.4, t + dur * 0.5);
    gain.gain.linearRampToValueAtTime(0.0001, endT);
    osc.connect(filt); filt.connect(gain); gain.connect(dest);
    osc.start(t); osc.stop(endT + 0.1);
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

  // --- UI RENDER ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      bpm: 110,
      leadInstrument: "vocal_a",
      grid: {
        kick: Array(16).fill(false), snare: Array(16).fill(false), hat: Array(16).fill(false),
        bass:  Array(16).fill(false), chords: Array(16).fill(false), 
        lead:  Array(16).fill(false), lead2: Array(16).fill(false)
      },
      vol: { drums: 0.9, bass: 0.7, chords: 0.4, lead: 0.6, lead2: 0.5 },
      lyrics: ""
    };

    // Auto-Load
    var savedProj = store.get("proj", null);
    if (savedProj) ST = Object.assign(ST, savedProj);

    // Auto-Save Funktion
    function saveState() { store.set("proj", ST); }

    var SCALE = [57, 60, 62, 64, 67, 69, 72, 74];

    function build(){
      var body = '';

      body += '<div style="display:flex; justify-content:space-between; margin-bottom:10px">'
        + '<div style="font-size:16px; font-weight:900; color:var(--p1)">🎹 HalDo Studio Pro</div>'
        + '<button class="btn sec" id="btnSave" style="padding:6px 10px; font-size:10px">💾 Save</button>'
        + '</div>';

      body += '<div class="tabs" style="overflow-x:auto; flex-wrap:nowrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Sequencer</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-mtab="ai">🤖 KI & Text</button>'
        + '</div>';

      /* ═══════════ TAB 1: SEQUENCER ═══════════ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:10px; overflow-x:auto">'
          + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">'
          + '<div style="font-size:14px; font-weight:900; color:var(--p1)">🎛️ Beat Grid</div>'
          + '<div style="display:flex; gap:6px">'
          + '<input type="number" id="bpmInp" value="' + ST.bpm + '" style="width:50px; padding:5px; text-align:center; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff">'
          + '<select id="instInp" style="padding:5px; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff; font-size:11px">'
          + '<option value="vocal_a"' + (ST.leadInstrument==="vocal_a"?" selected":"") + '>Vocal (A)</option>'
          + '<option value="vocal_o"' + (ST.leadInstrument==="vocal_o"?" selected":"") + '>Vocal (O)</option>'
          + '<option value="saz"' + (ST.leadInstrument==="saz"?" selected":"") + '>Saz</option>'
          + '<option value="duduk"' + (ST.leadInstrument==="duduk"?" selected":"") + '>Duduk</option>'
          + '<option value="piano"' + (ST.leadInstrument==="piano"?" selected":"") + '>Klavier</option>'
          + '</select>'
          + '</div></div>';

        // Canvas Visualizer
        body += '<canvas id="vizCanvas" width="400" height="60" style="width:100%; height:60px; background:rgba(0,0,0,.3); border-radius:8px; margin-bottom:10px"></canvas>';

        // Grid
        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:4px; min-width:450px">';
        
        var renderRow = (label, color, dataArray, trackKey) => {
            let html = '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">' + label + '</div>';
            for(let i=0; i<16; i++) {
                let active = dataArray[i];
                html += '<button data-track="'+trackKey+'" data-idx="'+i+'" style="height:24px; background:' + (active ? color : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
            }
            return html;
        };

        // Drums
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">DRUMS</div>';
        ['kick', 'snare', 'hat'].forEach(d => {
          for(let i=0; i<16; i++) {
            let active = ST.grid[d][i];
            let color = d === 'kick' ? '#ff4d4d' : (d === 'snare' ? '#fbbf24' : '#00e5ff');
            body += '<button data-drum="'+d+'" data-idx="'+i+'" style="height:24px; background:' + (active ? color : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
          }
        });

        body += renderRow("BASS", "var(--p2)", ST.grid.bass, "bass");
        body += renderRow("CHORDS", "var(--p3)", ST.grid.chords, "chords");
        body += renderRow("LEAD (Melodie)", "#4ade80", ST.grid.lead, "lead");
        body += renderRow("LEAD 2 (Harmonie)", "#f472b6", ST.grid.lead2, "lead2");

        body += '</div></div>';

        body += '<div class="card" style="display:flex; gap:10px">'
          + '<button class="btn sec" id="btnClear" style="flex:1">🗑️ Leeren</button>'
          + '<button class="btn" id="btnPlay" style="flex:2; background:linear-gradient(135deg,#4ade80,#00e5ff); color:#000">' + (isPlaying ? "⏹ Stop" : "▶️ Loop Starten") + '</button>'
          + '</div>';
      }

      /* ═══════════ TAB 2: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Track-Mixer</h3>';
        ['drums', 'bass', 'chords', 'lead', 'lead2'].forEach(t => {
          body += '<div style="margin-bottom:10px">'
            + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>' + t.toUpperCase() + '</span><span id="lbl_'+t+'">' + Math.round(ST.vol[t]*100) + '%</span></div>'
            + '<input type="range" data-vol="'+t+'" min="0" max="100" value="' + (ST.vol[t]*100) + '" style="width:100%">'
            + '</div>';
        });
        body += '</div>';

        body += '<div class="card"><h3>💾 Export</h3>'
          + '<div style="font-size:11px; color:var(--text-mute); margin-bottom:8px">Rendert deinen Loop als WAV-Datei.</div>'
          + '<button class="btn full" id="btnExport" style="background:linear-gradient(135deg,#b478ff,#ff4d4d); color:#fff">⬇️ WAV Exportieren</button>'
          + '<div id="exportStatus" style="display:none; margin-top:8px; font-size:11px; text-align:center"></div>'
          + '</div>';
      }

      /* ═══════════ TAB 3: KI & TEXT ═══════════ */
      if(tab === "ai"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<textarea id="lyricsInp" rows="4" placeholder="Schreibe deinen Text hier..." style="width:100%; padding:10px; background:rgba(0,0,0,.3); border:1px solid var(--border-soft); border-radius:10px; color:#fff">' + _esc(ST.lyrics) + '</textarea>'
          + '<button class="btn full" id="btnGenAI" style="margin-top:8px; background:var(--p1); color:#000">✨ KI Beat Generator</button>'
          + '</div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      container.querySelector("#btnSave").addEventListener("click", function(){
          saveState();
          if(window.HalDo.Notify) HalDo.Notify.success("Projekt gespeichert!");
      });

      if(tab === "studio"){
        var canvas = container.querySelector("#vizCanvas");
        var canvasCtx = canvas.getContext("2d");
        var vizBars = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

        function drawViz() {
            if(!canvas || !canvasCtx) return;
            vizAnimId = requestAnimationFrame(drawViz);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            if(analyser && isPlaying) {
                analyser.getByteFrequencyData(vizBars);
                var barWidth = (canvas.width / vizBars.length) * 2;
                var x = 0;
                for(var i = 0; i < vizBars.length; i++) {
                    var h = (vizBars[i] / 255) * canvas.height;
                    canvasCtx.fillStyle = "var(--p1)";
                    canvasCtx.fillRect(x, canvas.height - h, barWidth / 1.5, h);
                    x += barWidth;
                }
            }
        }
        drawViz();

        container.querySelector("#bpmInp").addEventListener("change", function(){ ST.bpm = parseFloat(this.value) || 110; saveState(); });
        container.querySelector("#instInp").addEventListener("change", function(){ ST.leadInstrument = this.value; saveState(); });

        container.querySelectorAll("[data-drum]").forEach(btn => {
          btn.addEventListener("click", function() {
            ST.grid[this.dataset.drum][this.dataset.idx] = !ST.grid[this.dataset.drum][this.dataset.idx];
            saveState(); build();
          });
        });
        container.querySelectorAll("[data-track]").forEach(btn => {
          btn.addEventListener("click", function() {
            var trk = this.dataset.track; var idx = this.dataset.idx;
            ST.grid[trk][idx] = !ST.grid[trk][idx];
            saveState(); build();
          });
        });
        container.querySelector("#btnClear").addEventListener("click", function(){
          Object.keys(ST.grid).forEach(k => ST.grid[k].fill(false));
          saveState(); build();
        });
        container.querySelector("#btnPlay").addEventListener("click", togglePlay);
      }

      if(tab === "mixer"){
        container.querySelectorAll("[data-vol]").forEach(slider => {
          slider.addEventListener("input", function() {
            var t = this.dataset.vol; ST.vol[t] = this.value / 100;
            container.querySelector("#lbl_" + t).textContent = this.value + "%";
            saveState();
          });
        });

        container.querySelector("#btnExport").addEventListener("click", exportWav);
      }

      if(tab === "ai"){
        container.querySelector("#lyricsInp").addEventListener("input", function(){ ST.lyrics = this.value; saveState(); });
        
        container.querySelector("#btnGenAI").addEventListener("click", async function() {
          this.disabled = true; this.textContent = "⏳ KI arbeitet...";
          try {
            if(!ST.lyrics) {
              var text = await HalDo.AI.writeLyrics("Ein episches Lied über Hoffnung", "Deutsch", "Pop", "emotional");
              ST.lyrics = text;
            }
            ST.grid.kick.fill(false).forEach((_, i) => ST.grid.kick[i] = (i % 4 === 0));
            ST.grid.snare.fill(false).forEach((_, i) => ST.grid.snare[i] = (i % 8 === 4));
            ST.grid.hat.fill(false).forEach((_, i) => ST.grid.hat[i] = (i % 2 === 0));
            ST.grid.bass.fill(false).forEach((_, i) => ST.grid.bass[i] = (i % 4 === 0));
            ST.grid.chords.fill(false).forEach((_, i) => ST.grid.chords[i] = (i === 0 || i === 6 || i === 10));
            ST.grid.lead.fill(false).forEach((_, i) => ST.grid.lead[i] = [0, 3, 7, 11, 14].includes(i));
            ST.grid.lead2.fill(false).forEach((_, i) => ST.grid.lead2[i] = [5, 9, 13].includes(i));
            
            saveState(); build();
            if(window.HalDo.Notify) HalDo.Notify.success("KI Beat & Text generiert!");
          } catch(e) { alert(e.message); }
          this.disabled = false; this.textContent = "✨ KI Beat Generator";
        });
      }
    }

    // --- LOOP ENGINE ---
    function togglePlay() {
      if (isPlaying) {
        clearInterval(loopInterval);
        isPlaying = false;
        build();
      } else {
        initAudio();
        isPlaying = true;
        currentStep = 0;
        build();

        var stepDur = (60 / ST.bpm) / 4;
        loopInterval = setInterval(() => {
          if(ST.grid.kick[currentStep]) playKick(ST.vol.drums);
          if(ST.grid.snare[currentStep]) playSnare(ST.vol.drums);
          if(ST.grid.hat[currentStep]) playHat(ST.vol.drums);

          if(ST.grid.bass[currentStep]) playNote(440 * Math.pow(2, (45 - 69)/12), stepDur * 2, ST.vol.bass, "bass");

          if(ST.grid.chords[currentStep]) {
            [57, 60, 64].forEach(n => playNote(440 * Math.pow(2, (n - 69)/12), stepDur * 4, ST.vol.chords, "strings"));
          }

          if(ST.grid.lead[currentStep]) {
            var note = SCALE[currentStep % SCALE.length];
            playNote(440 * Math.pow(2, (note - 69)/12), stepDur * 2, ST.vol.lead, ST.leadInstrument);
          }

          if(ST.grid.lead2[currentStep]) {
            var note2 = SCALE[(currentStep + 2) % SCALE.length] + 12;
            playNote(440 * Math.pow(2, (note2 - 69)/12), stepDur * 1.5, ST.vol.lead2, "piano");
          }

          currentStep = (currentStep + 1) % 16;
        }, stepDur * 1000);
      }
    }

    // --- EXPORT (Offline Render) ---
    async function exportWav() {
      var btn = document.querySelector("#btnExport");
      var stat = document.querySelector("#exportStatus");
      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Rendere Audio...";

      try {
        var tempo = ST.bpm;
        var stepDur = (60 / tempo) / 4;
        var totalDur = 16 * stepDur;

        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offCtx = new OAC(2, Math.ceil(totalDur * 44100), 44100);
        var master = offCtx.createGain(); master.gain.value = 0.8; master.connect(offCtx.destination);

        for(var i = 0; i < 16; i++) {
          var time = i * stepDur;
          
          if(ST.grid.kick[i]) { 
             var o = offCtx.createOscillator(), g = offCtx.createGain();
             o.type = "sine"; o.frequency.setValueAtTime(150, time); o.frequency.exponentialRampToValueAtTime(40, time + 0.1);
             g.gain.setValueAtTime(ST.vol.drums, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
             o.connect(g); g.connect(master); o.start(time); o.stop(time + 0.25);
          }
          if(ST.grid.snare[i]) { 
             var bs = Math.floor(offCtx.sampleRate * 0.2), buf = offCtx.createBuffer(1, bs, offCtx.sampleRate);
             var d = buf.getChannelData(0); for (var j = 0; j < bs; j++) d[j] = (Math.random()*2-1) * Math.pow(1 - j/bs, 3);
             var s = offCtx.createBufferSource(); s.buffer = buf; var g = offCtx.createGain();
             g.gain.setValueAtTime(ST.vol.drums, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
             s.connect(g); g.connect(master); s.start(time); s.stop(time + 0.2);
          }
          if(ST.grid.hat[i]) { 
             var bs2 = Math.floor(offCtx.sampleRate * 0.05), buf2 = offCtx.createBuffer(1, bs2, offCtx.sampleRate);
             var d2 = buf2.getChannelData(0); for (var j = 0; j < bs2; j++) d2[j] = (Math.random()*2-1) * Math.pow(1 - j/bs2, 2);
             var s2 = offCtx.createBufferSource(); s2.buffer = buf2; var g2 = offCtx.createGain();
             g2.gain.setValueAtTime(ST.vol.drums*0.6, time); g2.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
             s2.connect(g2); g2.connect(master); s2.start(time); s2.stop(time + 0.06);
          }
          
          if(ST.grid.bass[i]) offlinePlayNote(offCtx, master, 440 * Math.pow(2, (45 - 69)/12), time, stepDur * 2, ST.vol.bass, "bass");
          if(ST.grid.chords[i]) {
              [57, 60, 64].forEach(n => offlinePlayNote(offCtx, master, 440 * Math.pow(2, (n - 69)/12), time, stepDur * 4, ST.vol.chords, "strings"));
          }
          if(ST.grid.lead[i]) {
              var note = SCALE[i % SCALE.length];
              offlinePlayNote(offCtx, master, 440 * Math.pow(2, (note - 69)/12), time, stepDur * 2, ST.vol.lead, ST.leadInstrument);
          }
          if(ST.grid.lead2[i]) {
              var note2 = SCALE[(i + 2) % SCALE.length] + 12;
              offlinePlayNote(offCtx, master, 440 * Math.pow(2, (note2 - 69)/12), time, stepDur * 1.5, ST.vol.lead2, "piano");
          }
        }

        var rendered = await offCtx.startRendering();
        var wav = audioBufferToWav(rendered);
        var url = URL.createObjectURL(wav);
        var a = document.createElement("a"); a.href = url; a.download = "haldo-studio-loop.wav"; a.click();

        stat.textContent = "✅ WAV heruntergeladen!";
        btn.disabled = false;
      } catch(e) {
        stat.textContent = "❌ " + e.message;
        btn.disabled = false;
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v20.0 geladen — FULL DAW EXPERIENCE");
})();
