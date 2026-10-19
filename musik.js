/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v10.0) · PRO MAX FINAL
   Native Audio (Bulletproof) · KI · Synchronisierter Gesang
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- NATIVE AUDIO SYNTHESE (100% Stabil) ---
  var NOTE_FREQ = {};
  (function() {
    var names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    for (var o = 0; o <= 8; o++) for (var i = 0; i < 12; i++) NOTE_FREQ[names[i] + o] = 440 * Math.pow(2, (o*12 + i - 57) / 12);
  })();
  function noteFreq(n) { return NOTE_FREQ[n] || 440; }
  function midiToName(m) { var n = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; return n[((m%12)+12)%12] + (Math.floor(m/12) - 1); }

  var SCALES = {
    major: [0,2,4,5,7,9,11], minor: [0,2,3,5,7,8,10],
    dorian: [0,2,3,5,7,9,10], mixolydian: [0,2,4,5,7,9,10],
    pentatonic: [0,2,4,7,9]
  };
  var KEY_ROOT = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "Bb": 10 };
  function getScale(root, mode) { var iv = SCALES[mode] || SCALES.major; return iv.map(function(i) { return root + i; }); }

  var STYLE_PARAMS = {
    pop:       { chordType: "piano", bassType: "bass", melType: "piano", arpType: "bells", drums: 1.0, reverb: 0.25, notes: 3, prog: "I-V-vi-IV", mode: "major" },
    rock:      { chordType: "guitar", bassType: "bass", melType: "guitar", arpType: "synth", drums: 1.3, reverb: 0.15, notes: 3, prog: "I-IV-V-I", mode: "major" },
    kurdish:   { chordType: "strings", bassType: "bass", melType: "flute", arpType: "bells", drums: 0.7, reverb: 0.3, notes: 3, prog: "i-VI-III-VII", mode: "minor" },
    turkish:   { chordType: "strings", bassType: "bass", melType: "flute", arpType: "bells", drums: 0.9, reverb: 0.3, notes: 3, prog: "i-VI-III-VII", mode: "minor" },
    ezidi:     { chordType: "strings", bassType: "bass", melType: "flute", arpType: "bells", drums: 0.5, reverb: 0.4, notes: 3, prog: "i-VI-III-VII", mode: "minor" },
    lofi:      { chordType: "piano", bassType: "bass", melType: "flute", arpType: "bells", drums: 0.6, reverb: 0.4, notes: 3, prog: "vi-IV-I-V", mode: "minor" },
    epic:      { chordType: "strings", bassType: "bass", melType: "brass", arpType: "strings", drums: 1.2, reverb: 0.4, notes: 3, prog: "i-VI-III-VII", mode: "minor" }
  };
  var PROGRESSIONS = { "I-V-vi-IV": [0,4,5,3], "vi-IV-I-V": [5,3,0,4], "I-IV-V-I": [0,3,4,0], "i-VI-III-VII": [0,5,2,6] };
  var STRUCTURES = { "short": ["intro","verse","chorus","outro"], "full": ["intro","verse","chorus","verse","chorus","outro"], "loop": ["chorus","chorus","chorus","chorus"] };

  function playInstrument(ctx, dest, freq, startTime, dur, amp, type) {
    if (startTime < 0) startTime = 0;
    if (dur <= 0) dur = 0.1;
    
    var osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = "lowpass"; filt.Q.value = 1;
    
    // HELPER: Garantiert positive Zeiten für alle Audio-Parameter
    function t(offset) { return Math.max(0, startTime + offset); }

    switch(type) {
      case "piano": 
        osc1.type = "triangle"; osc2.type = "sine"; osc2.detune.value = 2; filt.frequency.value = 4000; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.015)); 
        g.gain.exponentialRampToValueAtTime(amp * 0.3, t(dur * 0.4)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      case "guitar": 
        osc1.type = "sawtooth"; osc2.type = "triangle"; osc2.detune.value = -5; filt.frequency.value = 2500; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.008)); 
        g.gain.exponentialRampToValueAtTime(amp * 0.4, t(dur * 0.5)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      case "strings": 
        osc1.type = "sawtooth"; osc2.type = "sawtooth"; osc2.detune.value = 8; filt.frequency.value = 3000; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.35)); 
        g.gain.setValueAtTime(amp, t(dur - 0.25)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      case "bass": 
        osc1.type = "triangle"; osc2.type = "sine"; filt.frequency.value = 800; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.02)); 
        g.gain.setValueAtTime(amp * 0.9, t(dur - 0.1)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      case "synth": 
        osc1.type = "square"; osc2.type = "sawtooth"; osc2.detune.value = 12; filt.frequency.value = 3500; filt.Q.value = 4; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.05)); 
        g.gain.setValueAtTime(amp, t(dur - 0.15)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      case "bells": 
        osc1.type = "sine"; osc2.type = "sine"; osc2.detune.value = 1200; filt.frequency.value = 8000; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.005)); 
        g.gain.exponentialRampToValueAtTime(0.0001, t(dur * 1.5)); 
        break;
      case "flute": 
        osc1.type = "sine"; osc2.type = "triangle"; osc2.detune.value = 5; filt.frequency.value = 6000; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.08)); 
        g.gain.setValueAtTime(amp, t(dur - 0.1)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      case "brass": 
        osc1.type = "sawtooth"; osc2.type = "square"; osc2.detune.value = 3; filt.frequency.value = 4500; filt.Q.value = 2; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.06)); 
        g.gain.setValueAtTime(amp, t(dur - 0.1)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur)); 
        break;
      default: 
        osc1.type = "triangle"; filt.frequency.value = 4000; 
        g.gain.setValueAtTime(0.0001, t(0)); 
        g.gain.linearRampToValueAtTime(amp, t(0.02)); 
        g.gain.linearRampToValueAtTime(0.0001, t(dur));
    }
    osc1.frequency.value = freq; osc2.frequency.value = freq;
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(dest);
    osc1.start(t(0)); osc1.stop(t(dur) + 0.05);
    osc2.start(t(0)); osc2.stop(t(dur) + 0.05);
  }

  function playKick(ctx, dest, t, amp) { if (t < 0) t = 0; var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.13); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.35); }
  function playSnare(ctx, dest, t, amp) { if (t < 0) t = 0; var bs = Math.floor(ctx.sampleRate * 0.2), buf = ctx.createBuffer(1, bs, ctx.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 3); var s = ctx.createBufferSource(); s.buffer = buf; var g = ctx.createGain(); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400; s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + 0.22); }
  function playHat(ctx, dest, t, amp) { if (t < 0) t = 0; var bs = Math.floor(ctx.sampleRate * 0.06), buf = ctx.createBuffer(1, bs, ctx.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < bs; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/bs, 2); var s = ctx.createBufferSource(); s.buffer = buf; var g = ctx.createGain(); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07); var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + 0.1); }

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

    var defaultSet = {
      genre: "kurdish", mood: "nostalgisch", bpm: 110, key: "Am",
      lyrics: "", songDesc: "",
      voiceURI: "", vocalPitch: 1.0, vocalRate: 1.0,
      volume: 0.9, reverb: 0.3
    };
    
    var ST = {
      set: Object.assign({}, defaultSet, store.get("settings", {})),
      isPlaying: false,
      audioUrl: null
    };

    function save() { store.set("settings", ST.set); }

    function build(){
      var s = ST.set;
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '</div>';

      if(tab === "studio"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Heimweh...)" value="' + _esc(s.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Schreibe hier deinen Text..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(s.lyrics) + '</textarea>'
          + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
          + '<button class="btn" id="ki_gen" style="flex:1;font-size:11px">✨ KI Songtext</button>'
          + '<button class="btn sec" id="ki_correct" style="flex:1;font-size:11px">✅ Korrigieren</button>'
          + '</div>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        body += '<div class="card"><h3>🎵 Musik-Stil & Stimmung</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIL</label>'
          + '<select id="mStyle" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="pop"' + (s.genre==="pop"?" selected":"") + '>Pop</option>'
          + '<option value="rock"' + (s.genre==="rock"?" selected":"") + '>Rock</option>'
          + '<option value="kurdish"' + (s.genre==="kurdish"?" selected":"") + '>🦚 Kurdisch</option>'
          + '<option value="turkish"' + (s.genre==="turkish"?" selected":"") + '>🇹🇷 Türkisch</option>'
          + '<option value="ezidi"' + (s.genre==="ezidi"?" selected":"") + '>🦚 Ezidi</option>'
          + '<option value="lofi"' + (s.genre==="lofi"?" selected":"") + '>Lo-Fi</option>'
          + '<option value="epic"' + (s.genre==="epic"?" selected":"") + '>Epic</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="mTempo" value="' + s.bpm + '" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '</div></div>';

        body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
          + '<button class="btn full" id="mGenerate" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">🎵 Song generieren & singen</button>'
          + '<div id="mStatus" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      if(tab === "voice"){
        body += '<div class="card"><h3>🎤 Gesangs-Stimme (Browser TTS)</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Wähle die Stimme, die den Text singen/sprechen soll:</div>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:12px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:12px;line-height:1.5">'
          + 'ℹ️ <b>Hinweis:</b> Die Browser-Stimme ist eine Vorlese-Stimme. Sie spricht den Text rhythmisch zur Musik. Für echten, melodiösen Gesang (wie bei Suno) braucht man riesige KI-Server.'
          + '</div></div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if (tab === "studio") {
        container.querySelector("#ki_desc").addEventListener("input", function(){ s.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ s.lyrics = this.value; save(); });
        container.querySelector("#mStyle").addEventListener("change", function(){ s.genre = this.value; save(); });
        container.querySelector("#mTempo").addEventListener("change", function(){ s.bpm = Math.max(40, Math.min(200, parseFloat(this.value) || 100)); save(); });

        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block"; stat.textContent = "⏳ HalDo KI schreibt...";
          this.disabled = true;
          try {
            var prompt = `Schreibe einen Songtext im Genre ${s.genre} mit der Stimmung ${s.mood}. Thema: ${s.songDesc || "Liebe"}.`;
            var text = await HalDo.AI.writeLyrics(prompt, "Deutsch", s.genre, s.mood);
            container.querySelector("#ki_lyrics").value = text;
            s.lyrics = text; save(); stat.textContent = "✅ Text fertig!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        container.querySelector("#ki_correct").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          var text = container.querySelector("#ki_lyrics").value.trim();
          if (!text) return alert("Kein Text zum Korrigieren!");
          stat.style.display = "block"; stat.textContent = "⏳ KI korrigiert...";
          this.disabled = true;
          try {
            var corrected = await HalDo.AI.correct(text);
            container.querySelector("#ki_lyrics").value = corrected;
            s.lyrics = corrected; save(); stat.textContent = "✅ Text korrigiert!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        container.querySelector("#mGenerate").addEventListener("click", generateAndPlaySong);
      }

      if (tab === "voice") {
        var voiceSelect = container.querySelector("#ki_voice");
        function populateVoices() {
          var voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) return setTimeout(populateVoices, 500);
          voiceSelect.innerHTML = "";
          voices.forEach(v => {
            let opt = document.createElement("option");
            opt.value = v.voiceURI; opt.textContent = v.name + " (" + v.lang + ")";
            if (s.voiceURI === v.voiceURI) opt.selected = true;
            voiceSelect.appendChild(opt);
          });
        }
        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;
        
        voiceSelect.addEventListener("change", function(){ s.voiceURI = this.value; save(); });
        
        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          let voices = window.speechSynthesis.getVoices();
          let sel = voices.find(v => v.voiceURI === s.voiceURI);
          if (!sel) return alert("Bitte wähle eine Stimme!");
          let u = new SpeechSynthesisUtterance("Hallo, ich bin deine Sängerin.");
          u.voice = sel; u.pitch = 1.0; u.rate = 1.0;
          window.speechSynthesis.speak(u);
        });
      }
    }

    // --- DIE GENERIERUNGS-MAGIE ---
    async function generateAndPlaySong() {
      var s = ST.set;
      if (!s.lyrics) return alert("Bitte erst Songtext eingeben oder generieren!");

      let btn = document.querySelector("#mGenerate");
      let stat = document.querySelector("#mStatus");
      btn.disabled = true; stat.style.display = "block"; stat.className = "info"; stat.textContent = "⏳ Generiere WAV-Datei (30-60s)...";

      try {
        var style = s.genre, sp = STYLE_PARAMS[style] || STYLE_PARAMS.pop;
        var tempo = s.bpm || 110;
        var structure = STRUCTURES.full;
        var progKey = sp.prog || "I-V-vi-IV";
        var prog = PROGRESSIONS[progKey] || PROGRESSIONS["I-V-vi-IV"];
        var masterVol = 0.9; // Fix für sauberen Sound
        var root = 57; // A-Moll Basis
        var scale = getScale(root, sp.mode || "minor");

        var beatDur = 60 / tempo, barDur = beatDur * 4, totalBars = 0;
        structure.forEach(function(sec) { totalBars += (sec === "intro" || sec === "outro") ? 4 : 8; });
        var totalDur = totalBars * barDur + 2;

        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offCtx = new OAC(2, Math.ceil(totalDur * 44100), 44100);
        
        var masterGain = offCtx.createGain(); masterGain.gain.value = masterVol * 2.5;
        var comp = offCtx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.25;
        masterGain.connect(comp); comp.connect(offCtx.destination);

        var revBuf = offCtx.createBuffer(2, Math.floor(offCtx.sampleRate * 1.8), offCtx.sampleRate);
        for (var c = 0; c < 2; c++) { var d = revBuf.getChannelData(c); for (var i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.2) * (c === 0 ? 1 : 0.95); }
        var reverb = offCtx.createConvolver(); reverb.buffer = revBuf;
        var revGain = offCtx.createGain(); revGain.gain.value = sp.reverb;
        reverb.connect(revGain); revGain.connect(masterGain);
        var dryGain = offCtx.createGain(); dryGain.gain.value = 1 - sp.reverb * 0.35; dryGain.connect(masterGain);

        var t = 0;
        var allNotes = []; // Für Gesang speichern

        structure.forEach(function(section) {
          var bars = (section === "intro" || section === "outro") ? 4 : 8;
          var sAmp = section === "intro" ? 0.7 : section === "outro" ? 0.6 : 1.0;
          var sFil = section === "chorus" ? 1.1 : (section === "intro" || section === "outro") ? 0.65 : 0.9;
          
          for (var bar = 0; bar < bars; bar++) {
            var chordIdx = prog[bar % prog.length], chordNotes = [];
            for (var i = 0; i < sp.notes; i++) chordNotes.push(scale[(chordIdx + i*2) % scale.length] + Math.floor((chordIdx + i*2) / scale.length) * 12);
            var barStart = t;
            
            // Akkorde
            chordNotes.forEach(function(n) { 
              playInstrument(offCtx, dryGain, noteFreq(midiToName(n)), barStart, barDur * 0.95, 0.35 * sFil * sAmp, sp.chordType); 
              playInstrument(offCtx, reverb, noteFreq(midiToName(n)), barStart, barDur * 0.95, 0.18 * sFil * sAmp, sp.chordType); 
            });
            
            // Bass
            var bn = chordNotes[0] - 24; 
            playInstrument(offCtx, dryGain, noteFreq(midiToName(bn)), barStart, barDur * 0.45, 0.55 * sFil * sAmp, "bass"); 
            playInstrument(offCtx, dryGain, noteFreq(midiToName(bn)), barStart + barDur * 0.5, barDur * 0.4, 0.5 * sFil * sAmp, "bass"); 
            
            // Melodie (Speichern für TTS Sync)
            for (var m = 0; m < 8; m++) { 
              var mt = barStart + m * (barDur / 8);
              var idx = (bar + m) % scale.length;
              var mn = scale[idx] + ((bar + m) % 3 === 0 ? 12 : 0);
              var md = (barDur / 8) * (0.5 + ((bar + m) % 3) * 0.15); 
              playInstrument(offCtx, dryGain, noteFreq(midiToName(mn)), mt, md, 0.28 * sFil * sAmp, sp.melType); 
              playInstrument(offCtx, reverb, noteFreq(midiToName(mn)), mt, md, 0.12 * sFil * sAmp, sp.melType); 
              
              allNotes.push({ time: mt, note: mn });
            }

            // Drums
            var dA = sp.drums * sFil * sAmp * 0.7; 
            playKick(offCtx, dryGain, barStart, 0.8 * dA); 
            playKick(offCtx, dryGain, barStart + barDur * 0.5, 0.7 * dA); 
            if (section === "chorus") { 
              playSnare(offCtx, dryGain, barStart + barDur * 0.25, 0.6 * dA); 
              playSnare(offCtx, dryGain, barStart + barDur * 0.75, 0.6 * dA); 
            } 
            for (var h = 0; h < 8; h++) playHat(offCtx, dryGain, barStart + h * (barDur / 8), 0.25 * dA);
          }
          t += bars * barDur;
        });

        stat.textContent = "🎤 Rendering & Gesangs-Sync...";
        var rendered = await offCtx.startRendering();
        var wav = audioBufferToWav(rendered);
        if (ST.audioUrl) URL.revokeObjectURL(ST.audioUrl);
        ST.audioUrl = URL.createObjectURL(wav);
        
        // Audio abspielen
        var audio = new Audio(ST.audioUrl);
        audio.volume = 0.9;
        audio.play();

        // TTS mit Noten synchronisieren
        window.speechSynthesis.cancel();
        var words = s.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
        var voices = window.speechSynthesis.getVoices();
        var selVoice = voices.find(v => v.voiceURI === s.voiceURI);
        
        // Verteile die Wörter auf die generierten Noten
        var wordCount = Math.min(words.length, allNotes.length);
        for (let w = 0; w < wordCount; w++) {
          let word = words[w];
          let noteData = allNotes[w]; // Nutze die Melodie-Noten als Timing
          
          // Berechne Tonhöhe basierend auf der Note (MIDI 60 = 1.0)
          let pitchMod = (noteData.note - 60) * 0.05; 
          let finalPitch = Math.max(0.5, Math.min(2.0, 1.0 + pitchMod));
          
          // WICHTIG: Negative Zeiten abfangen!
          let delay = Math.max(0, (noteData.time - 0.2) * 1000);
          
          setTimeout(() => {
            let u = new SpeechSynthesisUtterance(word);
            if (selVoice) u.voice = selVoice;
            u.pitch = finalPitch;
            u.rate = 1.1; // Etwas schneller für Flow
            window.speechSynthesis.speak(u);
          }, delay);
        }

        stat.className = "info ok";
        stat.textContent = "✅ Song läuft! (" + Math.round(rendered.duration) + "s)";
        setTimeout(() => { btn.disabled = false; }, rendered.duration * 1000);

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
  console.log("🦚 musik.js v10.0 geladen — PRO MAX FINAL");
})();
