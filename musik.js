/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v18.0) · PRO MAX EXTREME
   Live-Loop · Saz/Duduk · TTS-Gesang · Visualizer · Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- 100% STABILE AUDIO-ENGINE ---
  var audioCtx = null;
  var isPlaying = false;
  var currentStep = 0;
  var loopInterval = null;
  var ttsWordIndex = 0;
  var ttsActive = false;

  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  // --- INSTRUMENTE ---
  function playNote(freq, dur, vol, type) {
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), filt = audioCtx.createBiquadFilter();
    filt.type = "lowpass";
    
    if(type === "piano") { osc.type = "triangle"; filt.frequency.value = 4000; }
    else if(type === "saz") { osc.type = "sawtooth"; filt.frequency.value = 2000; } // Orientalisch
    else if(type === "duduk") { osc.type = "sine"; filt.frequency.value = 3000; } // Weich
    else if(type === "keman") { osc.type = "sawtooth"; filt.frequency.value = 2500; } // Streicher
    else if(type === "flute") { osc.type = "sine"; filt.frequency.value = 6000; }
    else { osc.type = "sawtooth"; filt.frequency.value = 3500; }

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(vol * 0.4, audioCtx.currentTime + dur * 0.5);
    gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + dur);

    osc.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur + 0.1);
  }

  function playKick(vol) {
    if (!audioCtx) return;
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(150, audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    g.gain.setValueAtTime(vol, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.25);
  }

  function playSnare(vol) {
    if (!audioCtx) return;
    var bs = Math.floor(audioCtx.sampleRate * 0.2), buf = audioCtx.createBuffer(1, bs, audioCtx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 3);
    var s = audioCtx.createBufferSource(); s.buffer = buf; var g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
    var f = audioCtx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
    s.connect(f); f.connect(g); g.connect(audioCtx.destination); s.start(); s.stop(audioCtx.currentTime + 0.2);
  }

  function playHat(vol) {
    if (!audioCtx) return;
    var bs = Math.floor(audioCtx.sampleRate * 0.05), buf = audioCtx.createBuffer(1, bs, audioCtx.sampleRate);
    var d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 2);
    var s = audioCtx.createBufferSource(); s.buffer = buf; var g = audioCtx.createGain();
    g.gain.setValueAtTime(vol * 0.6, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
    var f = audioCtx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
    s.connect(f); f.connect(g); g.connect(audioCtx.destination); s.start(); s.stop(audioCtx.currentTime + 0.06);
  }

  // --- OFFLINE EXPORT ---
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

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      bpm: 110,
      leadInstrument: "saz", // Standard: Saz
      grid: {
        kick: Array(16).fill(false), snare: Array(16).fill(false), hat: Array(16).fill(false),
        bass:  Array(16).fill(false), chords: Array(16).fill(false), lead:  Array(16).fill(false)
      },
      vol: { drums: 0.9, bass: 0.7, chords: 0.5, lead: 0.6 },
      lyrics: "",
      audioUrl: null
    };

    var SCALE = [57, 60, 62, 64, 67, 69, 72, 74]; // A-Moll Pentatonik

    function build(){
      var body = '';

      body += '<div class="tabs" style="overflow-x:auto; flex-wrap:nowrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Sequencer</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-mtab="ai">🤖 KI & Gesang</button>'
        + '</div>';

      /* ═══════════ TAB 1: SEQUENCER ═══════════ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:10px; overflow-x:auto">'
          + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">'
          + '<div style="font-size:14px; font-weight:900; color:var(--p1)">🎛️ Beat Sequencer</div>'
          + '<div style="display:flex; gap:6px">'
          + '<input type="number" id="bpmInp" value="' + ST.bpm + '" style="width:50px; padding:5px; text-align:center; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff">'
          + '<select id="instInp" style="padding:5px; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff; font-size:11px">'
          + '<option value="saz"' + (ST.leadInstrument==="saz"?" selected":"") + '>Saz</option>'
          + '<option value="duduk"' + (ST.leadInstrument==="duduk"?" selected":"") + '>Duduk</option>'
          + '<option value="keman"' + (ST.leadInstrument==="keman"?" selected":"") + '>Keman</option>'
          + '<option value="flute"' + (ST.leadInstrument==="flute"?" selected":"") + '>Flöte</option>'
          + '<option value="piano"' + (ST.leadInstrument==="piano"?" selected":"") + '>Klavier</option>'
          + '</select>'
          + '</div></div>';

        // Visualizer (Aktueller Step)
        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:2px; margin-bottom:10px">';
        for(let i=0; i<16; i++) {
            let isActive = (currentStep === i && isPlaying);
            body += '<div style="height:6px; background:' + (isActive ? "var(--p1)" : "rgba(255,255,255,.1)") + '; border-radius:3px; transition:0.1s"></div>';
        }
        body += '</div>';

        // Gitter
        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:4px; min-width:400px">';
        
        // Drums
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">DRUMS</div>';
        ['kick', 'snare', 'hat'].forEach(d => {
          for(let i=0; i<16; i++) {
            let active = ST.grid[d][i];
            let color = d === 'kick' ? '#ff4d4d' : (d === 'snare' ? '#fbbf24' : '#00e5ff');
            body += '<button data-drum="'+d+'" data-idx="'+i+'" style="height:30px; background:' + (active ? color : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
          }
        });

        // Bass
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">BASS</div>';
        for(let i=0; i<16; i++) {
          body += '<button data-track="bass" data-idx="'+i+'" style="height:30px; background:' + (ST.grid.bass[i] ? "var(--p2)" : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
        }

        // Chords
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">CHORDS</div>';
        for(let i=0; i<16; i++) {
          body += '<button data-track="chords" data-idx="'+i+'" style="height:30px; background:' + (ST.grid.chords[i] ? "var(--p3)" : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
        }

        // Lead
        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">LEAD MELODY</div>';
        for(let i=0; i<16; i++) {
          body += '<button data-track="lead" data-idx="'+i+'" style="height:30px; background:' + (ST.grid.lead[i] ? "#4ade80" : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
        }

        body += '</div></div>';

        body += '<div class="card" style="display:flex; gap:10px">'
          + '<button class="btn sec" id="btnClear" style="flex:1">🗑️ Leeren</button>'
          + '<button class="btn" id="btnPlay" style="flex:2; background:linear-gradient(135deg,#4ade80,#00e5ff); color:#000">' + (isPlaying ? "⏹ Stop" : "▶️ Loop Starten") + '</button>'
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

        body += '<div class="card"><h3>💾 Export</h3>'
          + '<div style="font-size:11px; color:var(--text-mute); margin-bottom:8px">Erstelle eine WAV-Datei deines aktuellen Beats (1 Loop).</div>'
          + '<button class="btn full" id="btnExport" style="background:linear-gradient(135deg,#b478ff,#ff4d4d); color:#fff">⬇️ Als WAV exportieren</button>'
          + '<div id="exportStatus" style="display:none; margin-top:8px; font-size:11px; text-align:center"></div>'
          + '</div>';
      }

      /* ═══════════ TAB 3: KI & TEXT ═══════════ */
      if(tab === "ai"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<textarea id="lyricsInp" rows="5" placeholder="Schreibe deinen Text hier..." style="width:100%; padding:10px; background:rgba(0,0,0,.3); border:1px solid var(--border-soft); border-radius:10px; color:#fff">' + _esc(ST.lyrics) + '</textarea>'
          + '<button class="btn full" id="btnGenAI" style="margin-top:8px; background:var(--p1); color:#000">✨ KI generiert Beat & Text</button>'
          + '</div>';

        body += '<div class="card"><h3>🎤 Gesang im Loop</h3>'
          + '<div style="font-size:11px; color:var(--text-mute); margin-bottom:8px">Die Stimme liest den Text rhythmisch zum Beat vor.</div>'
          + '<select id="voiceInp" style="width:100%; padding:10px; background:rgba(0,0,0,.3); border-radius:10px; color:#fff; margin-bottom:10px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn full" id="btnTTS" style="background:' + (ttsActive ? "#ff4d4d" : "var(--p3)") + '; color:#000">' + (ttsActive ? "⏹ Gesang stoppen" : "🗣️ Gesang starten") + '</button>'
          + '</div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if(tab === "studio"){
        container.querySelector("#bpmInp").addEventListener("change", function(){ ST.bpm = parseFloat(this.value) || 110; });
        container.querySelector("#instInp").addEventListener("change", function(){ ST.leadInstrument = this.value; });

        container.querySelectorAll("[data-drum]").forEach(btn => {
          btn.addEventListener("click", function() {
            ST.grid[this.dataset.drum][this.dataset.idx] = !ST.grid[this.dataset.drum][this.dataset.idx];
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
          Object.keys(ST.grid).forEach(k => ST.grid[k].fill(false));
          build();
        });
        container.querySelector("#btnPlay").addEventListener("click", togglePlay);
      }

      if(tab === "mixer"){
        container.querySelectorAll("[data-vol]").forEach(slider => {
          slider.addEventListener("input", function() {
            var t = this.dataset.vol; ST.vol[t] = this.value / 100;
            container.querySelector("#lbl_" + t).textContent = this.value + "%";
          });
        });

        container.querySelector("#btnExport").addEventListener("click", exportWav);
      }

      if(tab === "ai"){
        container.querySelector("#lyricsInp").addEventListener("input", function(){ ST.lyrics = this.value; });
        
        // Voice Select füllen
        var voiceSelect = container.querySelector("#voiceInp");
        function populateVoices() {
          var voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) return setTimeout(populateVoices, 500);
          voiceSelect.innerHTML = "";
          voices.forEach(v => {
            let opt = document.createElement("option");
            opt.value = v.voiceURI; opt.textContent = v.name + " (" + v.lang + ")";
            voiceSelect.appendChild(opt);
          });
        }
        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;

        container.querySelector("#btnGenAI").addEventListener("click", async function() {
          this.disabled = true; this.textContent = "⏳ KI arbeitet...";
          try {
            if(!ST.lyrics) {
              var text = await HalDo.AI.writeLyrics("Ein episches Lied über Hoffnung", "Deutsch", "Pop", "emotional");
              ST.lyrics = text;
            }
            // Kreativer Beat
            ST.grid.kick.fill(false).forEach((_, i) => ST.grid.kick[i] = (i % 4 === 0));
            ST.grid.snare.fill(false).forEach((_, i) => ST.grid.snare[i] = (i % 8 === 4));
            ST.grid.hat.fill(false).forEach((_, i) => ST.grid.hat[i] = (i % 2 === 0));
            ST.grid.bass.fill(false).forEach((_, i) => ST.grid.bass[i] = (i % 4 === 0));
            ST.grid.chords.fill(false).forEach((_, i) => ST.grid.chords[i] = (i === 0 || i === 6 || i === 10));
            ST.grid.lead.fill(false).forEach((_, i) => ST.grid.lead[i] = [0, 3, 7, 11, 14].includes(i));
            
            build();
            if(window.HalDo.Notify) HalDo.Notify.success("KI Beat & Text generiert!");
          } catch(e) { alert(e.message); }
          this.disabled = false; this.textContent = "✨ KI generiert Beat & Text";
        });

        container.querySelector("#btnTTS").addEventListener("click", function() {
          if(!ST.lyrics) return alert("Kein Text vorhanden!");
          if(ttsActive) {
            ttsActive = false;
            window.speechSynthesis.cancel();
            build();
          } else {
            ttsActive = true;
            ttsWordIndex = 0;
            build();
          }
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

        var stepDur = (60 / ST.bpm) / 4; // 16tel
        loopInterval = setInterval(() => {
          // Drums
          if(ST.grid.kick[currentStep]) playKick(ST.vol.drums);
          if(ST.grid.snare[currentStep]) playSnare(ST.vol.drums);
          if(ST.grid.hat[currentStep]) playHat(ST.vol.drums);

          // Bass
          if(ST.grid.bass[currentStep]) playNote(440 * Math.pow(2, (45 - 69)/12), stepDur * 2, ST.vol.bass, "bass");

          // Chords
          if(ST.grid.chords[currentStep]) {
            [57, 60, 64].forEach(n => playNote(440 * Math.pow(2, (n - 69)/12), stepDur * 4, ST.vol.chords, "strings"));
          }

          // Lead
          if(ST.grid.lead[currentStep]) {
            var note = SCALE[currentStep % SCALE.length];
            playNote(440 * Math.pow(2, (note - 69)/12), stepDur * 2, ST.vol.lead, ST.leadInstrument);
          }

          // TTS Synchronisation (Jedes 4. Kästchen = Ein Wort)
          if (ttsActive && ST.lyrics && currentStep % 4 === 0) {
            var words = ST.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 0) {
              var word = words[ttsWordIndex % words.length];
              var u = new SpeechSynthesisUtterance(word);
              var selVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === document.querySelector("#voiceInp")?.value);
              if(selVoice) u.voice = selVoice;
              u.pitch = 1.0; u.rate = 1.0;
              window.speechSynthesis.speak(u);
              ttsWordIndex++;
            }
          }

          // UI Visualizer updaten
          var visBars = document.querySelectorAll(".card div[style*='height:6px']");
          if(visBars.length === 16) {
            visBars.forEach((bar, i) => {
              bar.style.background = (i === currentStep) ? "var(--p1)" : "rgba(255,255,255,.1)";
            });
          }

          currentStep = (currentStep + 1) % 16;
        }, stepDur * 1000);
      }
    }

    // --- EXPORT (1 Loop als WAV) ---
    async function exportWav() {
      var btn = document.querySelector("#btnExport");
      var stat = document.querySelector("#exportStatus");
      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Rendere Audio...";

      try {
        var tempo = ST.bpm;
        var stepDur = (60 / tempo) / 4;
        var totalDur = 16 * stepDur; // 1 Loop

        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offCtx = new OAC(2, Math.ceil(totalDur * 44100), 44100);
        var master = offCtx.createGain(); master.gain.value = 0.8; master.connect(offCtx.destination);

        // Hier simulieren wir die Audio-Ausgabe für die WAV-Datei
        // (Wir nutzen die gleiche Logik wie im Live-Loop, aber offline)
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
          
          if(ST.grid.bass[i]) {
              var osc = offCtx.createOscillator(), gain = offCtx.createGain(), filt = offCtx.createBiquadFilter();
              osc.type = "triangle"; filt.type = "lowpass"; filt.frequency.value = 800;
              osc.frequency.value = 440 * Math.pow(2, (45 - 69)/12);
              gain.gain.setValueAtTime(0.0001, time); gain.gain.linearRampToValueAtTime(ST.vol.bass, time + 0.02); gain.gain.linearRampToValueAtTime(0.0001, time + stepDur * 2);
              osc.connect(filt); filt.connect(gain); gain.connect(master); osc.start(time); osc.stop(time + stepDur * 2 + 0.1);
          }
          if(ST.grid.chords[i]) {
              [57, 60, 64].forEach(n => {
                  var osc2 = offCtx.createOscillator(), gain2 = offCtx.createGain(), filt2 = offCtx.createBiquadFilter();
                  osc2.type = "sawtooth"; filt2.type = "lowpass"; filt2.frequency.value = 2500;
                  osc2.frequency.value = 440 * Math.pow(2, (n - 69)/12);
                  gain2.gain.setValueAtTime(0.0001, time); gain2.gain.linearRampToValueAtTime(ST.vol.chords, time + 0.05); gain2.gain.linearRampToValueAtTime(0.0001, time + stepDur * 4);
                  osc2.connect(filt2); filt2.connect(gain2); gain2.connect(master); osc2.start(time); osc2.stop(time + stepDur * 4 + 0.1);
              });
          }
          if(ST.grid.lead[i]) {
              var note = SCALE[i % SCALE.length];
              var osc3 = offCtx.createOscillator(), gain3 = offCtx.createGain(), filt3 = offCtx.createBiquadFilter();
              osc3.type = "sawtooth"; filt3.type = "lowpass"; filt3.frequency.value = 2000;
              osc3.frequency.value = 440 * Math.pow(2, (note - 69)/12);
              gain3.gain.setValueAtTime(0.0001, time); gain3.gain.linearRampToValueAtTime(ST.vol.lead, time + 0.05); gain3.gain.linearRampToValueAtTime(0.0001, time + stepDur * 2);
              osc3.connect(filt3); filt3.connect(gain3); gain3.connect(master); osc3.start(time); osc3.stop(time + stepDur * 2 + 0.1);
          }
        }

        var rendered = await offCtx.startRendering();
        var wav = audioBufferToWav(rendered);
        var url = URL.createObjectURL(wav);
        var a = document.createElement("a"); a.href = url; a.download = "haldo-loop.wav"; a.click();

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
  console.log("🦚 musik.js v18.0 geladen — PRO MAX EXTREME");
})();
