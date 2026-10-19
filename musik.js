/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v19.0) · PRO MAX ULTIMATE
   Save/Load · Dual Lead · Vocal Synth · Master FX
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- AUDIO ENGINE (Stabil & Erweitert) ---
  var audioCtx = null;
  var isPlaying = false;
  var currentStep = 0;
  var loopInterval = null;
  var ttsWordIndex = 0;
  var ttsActive = false;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  // Master FX Setup (Reverb & Delay)
  var masterGain, masterReverb, masterDelay;

  function initMasterFX() {
    if (!audioCtx) return;
    
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(audioCtx.destination);

    // Reverb
    masterReverb = audioCtx.createConvolver();
    var revBuf = audioCtx.createBuffer(2, Math.floor(audioCtx.sampleRate * 1.5), audioCtx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = revBuf.getChannelData(c);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.0);
    }
    masterReverb.buffer = revBuf;
    var revGain = audioCtx.createGain();
    revGain.gain.value = 0.3; // Standard Hall
    masterReverb.connect(revGain);
    revGain.connect(masterGain);

    // Delay
    masterDelay = audioCtx.createDelay(1.0);
    masterDelay.delayTime.value = 0.25;
    var delayGain = audioCtx.createGain();
    delayGain.gain.value = 0.2; // Standard Echo
    masterDelay.connect(delayGain);
    delayGain.connect(masterGain);
  }

  // Instrumente & Vocal Synth
  function playNote(freq, dur, vol, type) {
    if (!audioCtx || vol <= 0.001) return;
    
    var time = Math.max(0, audioCtx.currentTime);
    var endTime = time + Math.max(0.1, dur);

    if (type === "vocal_a" || type === "vocal_o") {
        // Vocal Synth (Formant Synthesis)
        var osc = audioCtx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        
        var formants = type === "vocal_a" ? [800, 1150, 2900] : [450, 800, 2830];
        var filters = formants.map(f => {
            var biquad = audioCtx.createBiquadFilter();
            biquad.type = "bandpass";
            biquad.frequency.value = f;
            biquad.Q.value = 10;
            return biquad;
        });

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol * 2, time + 0.05); // Vocals brauchen etwas mehr Pegel
        gain.gain.setValueAtTime(vol * 2, endTime - 0.1);
        gain.gain.linearRampToValueAtTime(0, endTime);

        osc.connect(filters[0]);
        osc.connect(filters[1]);
        osc.connect(filters[2]);
        filters.forEach(f => f.connect(gain));
        
        gain.connect(masterGain);
        gain.connect(masterReverb);
        
        osc.start(time);
        osc.stop(endTime);
    } else {
        // Normale Instrumente
        var osc2 = audioCtx.createOscillator(), gain2 = audioCtx.createGain(), filt = audioCtx.createBiquadFilter();
        filt.type = "lowpass";
        
        if(type === "piano") { osc2.type = "triangle"; filt.frequency.value = 4000; }
        else if(type === "saz") { osc2.type = "sawtooth"; filt.frequency.value = 2000; }
        else if(type === "duduk") { osc2.type = "sine"; filt.frequency.value = 3000; }
        else if(type === "keman") { osc2.type = "sawtooth"; filt.frequency.value = 2500; }
        else if(type === "flute") { osc2.type = "sine"; filt.frequency.value = 6000; }
        else { osc2.type = "sawtooth"; filt.frequency.value = 3500; }

        osc2.frequency.value = freq;
        gain2.gain.setValueAtTime(0.0001, time);
        gain2.gain.linearRampToValueAtTime(vol, time + 0.05);
        gain2.gain.exponentialRampToValueAtTime(vol * 0.4, time + dur * 0.5);
        gain2.gain.linearRampToValueAtTime(0.0001, endTime);

        osc2.connect(filt); filt.connect(gain2); 
        gain2.connect(masterGain);
        gain2.connect(masterReverb);
        gain2.connect(masterDelay);
        
        osc2.start(time); osc2.stop(endTime + 0.1);
    }
  }

  // Drums
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
    s.connect(f); f.connect(g); g.connect(masterGain); g.connect(masterReverb); s.start(time); s.stop(time + 0.2);
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

  // --- UI ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    // Standard-Zustand
    var ST = {
      bpm: 110,
      leadInstrument: "vocal_a", // Standardmäßig Vocal
      grid: {
        kick: Array(16).fill(false), snare: Array(16).fill(false), hat: Array(16).fill(false),
        bass:  Array(16).fill(false), chords: Array(16).fill(false), 
        lead:  Array(16).fill(false), lead2: Array(16).fill(false) // NEU: Lead 2
      },
      vol: { drums: 0.9, bass: 0.7, chords: 0.4, lead: 0.6, lead2: 0.5 },
      masterFx: { reverb: 0.3, delay: 0.2 },
      lyrics: ""
    };

    // Lade gespeichertes Projekt falls vorhanden
    var savedProj = store.get("proj", null);
    if (savedProj) {
        ST = Object.assign(ST, savedProj);
    }

    function saveProject() {
        store.set("proj", ST);
        if(window.HalDo.Notify) HalDo.Notify.success("Projekt gespeichert!");
    }

    function loadProject() {
        var proj = store.get("proj", null);
        if(proj) {
            ST = Object.assign(ST, proj);
            build();
            if(window.HalDo.Notify) HalDo.Notify.success("Projekt geladen!");
        } else {
            if(window.HalDo.Notify) HalDo.Notify.warn("Kein gespeichertes Projekt gefunden.");
        }
    }

    var SCALE = [57, 60, 62, 64, 67, 69, 72, 74];

    function build(){
      var body = '';

      body += '<div style="display:flex; justify-content:space-between; margin-bottom:10px">'
        + '<div style="font-size:16px; font-weight:900; color:var(--p1)">🎵 HalDo Studio</div>'
        + '<div style="display:flex; gap:6px">'
        + '<button class="btn sec" id="btnSave" style="padding:6px 10px; font-size:10px">💾 Save</button>'
        + '<button class="btn sec" id="btnLoad" style="padding:6px 10px; font-size:10px">📂 Load</button>'
        + '</div></div>';

      body += '<div class="tabs" style="overflow-x:auto; flex-wrap:nowrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Sequencer</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer & FX</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-mtab="ai">🤖 KI & Text</button>'
        + '</div>';

      /* ═══════════ TAB 1: SEQUENCER ═══════════ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:10px; overflow-x:auto">'
          + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">'
          + '<div style="font-size:14px; font-weight:900; color:var(--p1)">🎛️ Sequencer</div>'
          + '<div style="display:flex; gap:6px">'
          + '<input type="number" id="bpmInp" value="' + ST.bpm + '" style="width:50px; padding:5px; text-align:center; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff">'
          + '<select id="instInp" style="padding:5px; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff; font-size:11px">'
          + '<option value="vocal_a"' + (ST.leadInstrument==="vocal_a"?" selected":"") + '>🎤 Vocal (A)</option>'
          + '<option value="vocal_o"' + (ST.leadInstrument==="vocal_o"?" selected":"") + '>🎤 Vocal (O)</option>'
          + '<option value="saz"' + (ST.leadInstrument==="saz"?" selected":"") + '>Saz</option>'
          + '<option value="duduk"' + (ST.leadInstrument==="duduk"?" selected":"") + '>Duduk</option>'
          + '<option value="keman"' + (ST.leadInstrument==="keman"?" selected":"") + '>Keman</option>'
          + '<option value="flute"' + (ST.leadInstrument==="flute"?" selected":"") + '>Flöte</option>'
          + '<option value="piano"' + (ST.leadInstrument==="piano"?" selected":"") + '>Klavier</option>'
          + '</select>'
          + '</div></div>';

        // Visualizer
        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:2px; margin-bottom:10px">';
        for(let i=0; i<16; i++) {
            let isActive = (currentStep === i && isPlaying);
            body += '<div style="height:6px; background:' + (isActive ? "var(--p1)" : "rgba(255,255,255,.1)") + '; border-radius:3px; transition:0.1s"></div>';
        }
        body += '</div>';

        // Gitter
        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:4px; min-width:450px">';
        
        var renderRow = (label, color, dataArray, trackKey) => {
            let html = '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">' + label + '</div>';
            for(let i=0; i<16; i++) {
                let active = dataArray[i];
                html += '<button data-track="'+trackKey+'" data-idx="'+i+'" style="height:24px; background:' + (active ? color : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
            }
            return html;
        };

        // Drums (Spezialfall)
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
        body += renderRow("LEAD 1 (Melodie)", "#4ade80", ST.grid.lead, "lead");
        body += renderRow("LEAD 2 (Harmonie)", "#f472b6", ST.grid.lead2, "lead2");

        body += '</div></div>';

        body += '<div class="card" style="display:flex; gap:10px">'
          + '<button class="btn sec" id="btnClear" style="flex:1">🗑️ Leeren</button>'
          + '<button class="btn" id="btnPlay" style="flex:2; background:linear-gradient(135deg,#4ade80,#00e5ff); color:#000">' + (isPlaying ? "⏹ Stop" : "▶️ Loop Starten") + '</button>'
          + '</div>';
      }

      /* ═══════════ TAB 2: MIXER & FX ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Track-Mixer</h3>';
        ['drums', 'bass', 'chords', 'lead', 'lead2'].forEach(t => {
          body += '<div style="margin-bottom:10px">'
            + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>' + t.toUpperCase() + '</span><span id="lbl_'+t+'">' + Math.round(ST.vol[t]*100) + '%</span></div>'
            + '<input type="range" data-vol="'+t+'" min="0" max="100" value="' + (ST.vol[t]*100) + '" style="width:100%">'
            + '</div>';
        });
        body += '</div>';

        body += '<div class="card"><h3>✨ Master-Effekte</h3>'
          + '<div style="margin-bottom:10px">'
          + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>🏛️ HALL (REVERB)</span><span id="lbl_rev">' + Math.round(ST.masterFx.reverb*100) + '%</span></div>'
          + '<input type="range" id="revInp" min="0" max="100" value="' + (ST.masterFx.reverb*100) + '" style="width:100%">'
          + '</div>'
          + '<div style="margin-bottom:10px">'
          + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>📢 ECHO (DELAY)</span><span id="lbl_del">' + Math.round(ST.masterFx.delay*100) + '%</span></div>'
          + '<input type="range" id="delInp" min="0" max="100" value="' + (ST.masterFx.delay*100) + '" style="width:100%">'
          + '</div>'
          + '</div>';
      }

      /* ═══════════ TAB 3: KI & TEXT ═══════════ */
      if(tab === "ai"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<textarea id="lyricsInp" rows="4" placeholder="Schreibe deinen Text hier..." style="width:100%; padding:10px; background:rgba(0,0,0,.3); border:1px solid var(--border-soft); border-radius:10px; color:#fff">' + _esc(ST.lyrics) + '</textarea>'
          + '<button class="btn full" id="btnGenAI" style="margin-top:8px; background:var(--p1); color:#000">✨ KI generiert Beat</button>'
          + '</div>';

        body += '<div class="card"><h3>🗣️ TTS Vorlesen</h3>'
          + '<div style="font-size:11px; color:var(--text-mute); margin-bottom:8px">Liest den Text im Takt zum Beat vor.</div>'
          + '<select id="voiceInp" style="width:100%; padding:10px; background:rgba(0,0,0,.3); border-radius:10px; color:#fff; margin-bottom:10px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn full" id="btnTTS" style="background:' + (ttsActive ? "#ff4d4d" : "var(--p3)") + '; color:#000">' + (ttsActive ? "⏹ Vorlesen stoppen" : "🗣️ Vorlesen starten") + '</button>'
          + '</div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      container.querySelector("#btnSave").addEventListener("click", saveProject);
      container.querySelector("#btnLoad").addEventListener("click", loadProject);

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
        container.querySelector("#revInp").addEventListener("input", function(){ 
            ST.masterFx.reverb = this.value/100; 
            container.querySelector("#lbl_rev").textContent = this.value+"%"; 
            if(masterReverb) masterReverb.connect(masterGain); // Just to ensure it's routed
        });
        container.querySelector("#delInp").addEventListener("input", function(){ 
            ST.masterFx.delay = this.value/100; 
            container.querySelector("#lbl_del").textContent = this.value+"%"; 
        });
      }

      if(tab === "ai"){
        container.querySelector("#lyricsInp").addEventListener("input", function(){ ST.lyrics = this.value; });
        
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
            ST.grid.kick.fill(false).forEach((_, i) => ST.grid.kick[i] = (i % 4 === 0));
            ST.grid.snare.fill(false).forEach((_, i) => ST.grid.snare[i] = (i % 8 === 4));
            ST.grid.hat.fill(false).forEach((_, i) => ST.grid.hat[i] = (i % 2 === 0));
            ST.grid.bass.fill(false).forEach((_, i) => ST.grid.bass[i] = (i % 4 === 0));
            ST.grid.chords.fill(false).forEach((_, i) => ST.grid.chords[i] = (i === 0 || i === 6 || i === 10));
            ST.grid.lead.fill(false).forEach((_, i) => ST.grid.lead[i] = [0, 3, 7, 11, 14].includes(i));
            ST.grid.lead2.fill(false).forEach((_, i) => ST.grid.lead2[i] = [5, 9, 13].includes(i));
            
            build();
            if(window.HalDo.Notify) HalDo.Notify.success("KI Beat & Text generiert!");
          } catch(e) { alert(e.message); }
          this.disabled = false; this.textContent = "✨ KI generiert Beat";
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
            if(!isPlaying) togglePlay(); // Startet den Loop automatisch
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
        initMasterFX();
        isPlaying = true;
        currentStep = 0;
        build();

        var stepDur = (60 / ST.bpm) / 4;
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

          // Lead 1 (mit gewähltem Instrument oder Vocal)
          if(ST.grid.lead[currentStep]) {
            var note = SCALE[currentStep % SCALE.length];
            playNote(440 * Math.pow(2, (note - 69)/12), stepDur * 2, ST.vol.lead, ST.leadInstrument);
          }

          // Lead 2 (Harmonie, eine Oktave höher)
          if(ST.grid.lead2[currentStep]) {
            var note2 = SCALE[(currentStep + 2) % SCALE.length] + 12; // Etwas versetzt und höher
            playNote(440 * Math.pow(2, (note2 - 69)/12), stepDur * 1.5, ST.vol.lead2, "piano"); // Lead 2 bleibt Klavier
          }

          // TTS
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

          // UI Visualizer
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

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v19.0 geladen — PRO MAX ULTIMATE (Vocal Synth)");
})();
