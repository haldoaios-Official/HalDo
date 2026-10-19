/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v17.0) · PRO MAX FINAL
   Loop-Sequencer · Echte Instrumente · KI · Mixer
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

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
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

  function playNote(freq, dur, vol, type) {
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), filt = audioCtx.createBiquadFilter();
    filt.type = "lowpass";
    if(type === "piano") { osc.type = "triangle"; filt.frequency.value = 4000; }
    else if(type === "strings") { osc.type = "sawtooth"; filt.frequency.value = 2500; }
    else if(type === "bass") { osc.type = "triangle"; filt.frequency.value = 800; }
    else { osc.type = "sine"; filt.frequency.value = 6000; }

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(vol * 0.4, audioCtx.currentTime + dur * 0.5);
    gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + dur);

    osc.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur + 0.1);
  }

  // --- UI & LOGIK ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      bpm: 110,
      grid: {
        kick: Array(16).fill(false), snare: Array(16).fill(false), hat: Array(16).fill(false),
        bass:  Array(16).fill(false), chords: Array(16).fill(false), lead:  Array(16).fill(false)
      },
      vol: { drums: 0.9, bass: 0.7, chords: 0.5, lead: 0.6 },
      lyrics: "",
      instrument: "piano"
    };

    var SCALE = [57, 60, 62, 64, 67, 69, 72, 74]; // A-Moll Pentatonik

    function build(){
      var body = '';

      body += '<div class="tabs" style="overflow-x:auto; flex-wrap:nowrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Sequencer</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-mtab="ai">🤖 KI & Text</button>'
        + '</div>';

      /* ═══════════ TAB 1: SEQUENCER ═══════════ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:10px; overflow-x:auto">'
          + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">'
          + '<div style="font-size:14px; font-weight:900; color:var(--p1)">🎛️ Beat Sequencer</div>'
          + '<input type="number" id="bpmInp" value="' + ST.bpm + '" style="width:60px; padding:5px; text-align:center; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff">'
          + '</div>';

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
      }

      /* ═══════════ TAB 3: KI & TEXT ═══════════ */
      if(tab === "ai"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<textarea id="lyricsInp" rows="5" placeholder="Schreibe deinen Text hier..." style="width:100%; padding:10px; background:rgba(0,0,0,.3); border:1px solid var(--border-soft); border-radius:10px; color:#fff">' + _esc(ST.lyrics) + '</textarea>'
          + '<button class="btn full" id="btnGenAI" style="margin-top:8px; background:var(--p1); color:#000">✨ KI generiert Beat & Text</button>'
          + '</div>';

        body += '<div class="card"><h3>🎤 Gesang (Text-to-Speech)</h3>'
          + '<div style="font-size:11px; color:var(--text-mute); margin-bottom:8px">Die Browser-Stimme liest den Text rhythmisch vor.</div>'
          + '<select id="voiceInp" style="width:100%; padding:10px; background:rgba(0,0,0,.3); border-radius:10px; color:#fff; margin-bottom:10px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn full" id="btnSpeak" style="background:var(--p3); color:#000">🗣️ Gesang starten</button>'
          + '</div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if(tab === "studio"){
        container.querySelector("#bpmInp").addEventListener("change", function(){ ST.bpm = parseFloat(this.value) || 110; });

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

        container.querySelector("#btnSpeak").addEventListener("click", function() {
          if(!ST.lyrics) return alert("Kein Text vorhanden!");
          window.speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(ST.lyrics);
          var sel = window.speechSynthesis.getVoices().find(v => v.voiceURI === voiceSelect.value);
          if (sel) u.voice = sel;
          u.lang = "de-DE"; u.rate = 1.0; u.pitch = 1.0;
          window.speechSynthesis.speak(u);
        });
      }
    }

    // --- LOOP ENGINE ---
    function togglePlay() {
      if (isPlaying) {
        // Stop
        clearInterval(loopInterval);
        isPlaying = false;
        build();
      } else {
        // Start
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
            playNote(440 * Math.pow(2, (note - 69)/12), stepDur * 2, ST.vol.lead, "piano");
          }

          currentStep = (currentStep + 1) % 16;
        }, stepDur * 1000);
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v17.0 geladen — PRO MAX FINAL");
})();
