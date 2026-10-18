/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v1000) · PRO MAX ULTIMATE
   Multi-Track · Mixer · Effekte · KI · WAV-Export · Visualizer
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- 1. AUDIO UNLOCK ---
  var _audioUnlocked = false;
  function unlockAudio() {
    if (_audioUnlocked) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var buf = ctx.createBuffer(1, 1, 22050);
      var src = ctx.createBufferSource(); src.buffer = buf;
      src.connect(ctx.destination); src.start(0);
      _audioUnlocked = true;
    } catch(e) {}
  }
  document.addEventListener('click', unlockAudio, { once: true });

  // --- 2. INSTRUMENTE LADEN (WebAudioFont) ---
  function loadInstruments() {
    const libs = [
      "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js",
      "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js", // Piano
      "https://surikov.github.io/webaudiofontdata/sound/0330_SoundBlasterOld_sf2.js", // Bass
      "https://surikov.github.io/webaudiofontdata/sound/0120_SoundBlasterOld_sf2.js", // Strings
      "https://surikov.github.io/webaudiofontdata/sound/0300_SoundBlasterOld_sf2.js"  // Guitar
    ];
    return Promise.all(libs.map(url => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        let s = document.createElement('script');
        s.src = url;
        s.onload = resolve;
        s.onerror = resolve;
        document.head.appendChild(s);
      });
    }));
  }

  // --- 3. HILFSFUNKTIONEN FÜR AUDIO ---
  function createReverb(ctx) {
    let len = ctx.sampleRate * 2.0;
    let buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let i = 0; i < 2; i++) {
      let ch = buf.getChannelData(i);
      for (let j = 0; j < len; j++) {
        ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / len, 2.0);
      }
    }
    let conv = ctx.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  function bufferToWav(buffer) {
    let nCh = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate;
    let ab = new ArrayBuffer(44 + len * nCh * 2), view = new DataView(ab);
    function wr(o, s) { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); }
    wr(0, "RIFF"); view.setUint32(4, 36 + len * nCh * 2, true); wr(8, "WAVE"); wr(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, nCh, true);
    view.setUint32(24, sr, true); view.setUint32(28, sr * nCh * 2, true); view.setUint16(32, nCh * 2, true);
    view.setUint16(34, 16, true); wr(36, "data"); view.setUint32(40, len * nCh * 2, true);
    let off = 44;
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < nCh; c++) {
        let s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([ab], { type: "audio/wav" });
  }

  // --- 4. HAUPT-APP ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "ki");

    var defaultSettings = {
      songDesc: "", lyrics: "", lang: "de", bpm: 100, key: "C", genre: "pop",
      voiceURI: "", vocalPitch: 1.0, vocalRate: 1.0,
      trackVol: { piano: 0.7, bass: 0.6, strings: 0.5, guitar: 0.4 },
      fxReverb: 0.3, fxDelay: 0.2
    };
    var ST = {
      set: Object.assign({}, defaultSettings, store.get("settings", {})),
      isPlaying: false,
      liveCtx: null
    };
    // Sicherstellen, dass trackVol existiert
    if (!ST.set.trackVol) ST.set.trackVol = { piano: 0.7, bass: 0.6, strings: 0.5, guitar: 0.4 };

    function save() { store.set("settings", ST.set); }

    function build(){
      var s = ST.set;
      var body = '';

      // MASSIVES TABS-MENÜ
      body += '<div class="tabs" style="flex-wrap:wrap">'
        + '<button class="tab' + (tab === "ki" ? " active" : "") + '" data-mtab="ki">🤖 KI-Studio</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "fx" ? " active" : "") + '" data-mtab="fx">✨ Effekte</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '<button class="tab' + (tab === "export" ? " active" : "") + '" data-mtab="export">💾 Export</button>'
        + '</div>';

      /* ═══════════ TAB 1: KI-STUDIO ═══════════ */
      if(tab === "ki"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Heimweh...)" value="' + _esc(s.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Schreibe hier deinen Text..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(s.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        body += '<div class="card"><h3>🎵 Arrangement</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">GENRE / STIL</label>'
          + '<select id="ki_genre" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="pop"' + (s.genre==="pop"?" selected":"") + '>Pop</option>'
          + '<option value="rock"' + (s.genre==="rock"?" selected":"") + '>Rock</option>'
          + '<option value="stran"' + (s.genre==="stran"?" selected":"") + '>🦚 Stran</option>'
          + '<option value="arabesk"' + (s.genre==="arabesk"?" selected":"") + '>🇹🇷 Arabesk</option>'
          + '<option value="edm"' + (s.genre==="edm"?" selected":"") + '>EDM</option>'
          + '<option value="lofi"' + (s.genre==="lofi"?" selected":"") + '>Lo-Fi</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">TONART</label>'
          + '<select id="ki_key" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="C"' + (s.key==="C"?" selected":"") + '>C-Dur</option>'
          + '<option value="G"' + (s.key==="G"?" selected":"") + '>G-Dur</option>'
          + '<option value="D"' + (s.key==="D"?" selected":"") + '>D-Dur</option>'
          + '<option value="Am"' + (s.key==="Am"?" selected":"") + '>A-Moll</option>'
          + '<option value="Em"' + (s.key==="Em"?" selected":"") + '>E-Moll</option>'
          + '</select></div>'
          + '</div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM (Tempo)</label>'
          + '<input type="number" id="ki_bpm" value="' + s.bpm + '" min="40" max="200" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '</div>';

        // Sticky Play Button
        body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
          + '<button class="btn full" id="play_btn" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">▶️ Song in Echtzeit produzieren</button>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      /* ═══════════ TAB 2: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Multi-Track Mixer</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:12px">Lautstärke der einzelnen Spuren:</div>'
          + sliderRow("🎹 Klavier", "vol_piano", s.trackVol.piano)
          + sliderRow("🎸 Bass", "vol_bass", s.trackVol.bass)
          + sliderRow("🎻 Streicher", "vol_strings", s.trackVol.strings)
          + sliderRow("🎸 Gitarre", "vol_guitar", s.trackVol.guitar)
          + '</div>';
      }

      /* ═══════════ TAB 3: EFFEKTE ═══════════ */
      if(tab === "fx"){
        body += '<div class="card"><h3>✨ Raum & Effekte</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:12px">Atmosphäre für deinen Song:</div>'
          + sliderRow("🏛️ Hall (Reverb)", "fx_reverb", s.fxReverb)
          + sliderRow("📢 Echo (Delay)", "fx_delay", s.fxDelay)
          + '<div style="padding:12px;background:rgba(0,229,255,.05);border-radius:8px;font-size:11px;color:var(--text-dim);margin-top:12px">'
          + 'ℹ️ Die Effekte werden auf den Master-Bus angewendet. Erhöhe den Hall für einen weiten, epischen Klang. Erhöhe das Echo für einen spacigen Retro-Look.'
          + '</div></div>';
      }

      /* ═══════════ TAB 4: GESANG ═══════════ */
      if(tab === "voice"){
        body += '<div class="card"><h3>🎤 Vocal Studio</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Wähle deine Sängerin / deinen Sänger:</div>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:12px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + sliderRow("🎵 Gesangs-Tonhöhe", "voice_pitch", s.vocalPitch)
          + sliderRow("⏩ Gesangs-Tempo", "voice_rate", s.vocalRate)
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px;margin-top:8px">🔊 Stimme testen</button>'
          + '</div>';
      }

      /* ═══════════ TAB 5: EXPORT ═══════════ */
      if(tab === "export"){
        body += '<div class="card"><h3>💾 Audio-Export</h3>'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.6;margin-bottom:16px">'
          + 'Rendere deinen Song in hoher Qualität (WAV).<br><br>'
          + '⚠️ <b>Achtung:</b> Der Export nutzt einen <code>OfflineAudioContext</i>. Das bedeutet, die Berechnung dauert etwa 5-10 Sekunden. Der Tab friert kurz ein, aber keine Sorge, es geht weiter.'
          + '</div>'
          + '<button class="btn full" id="btn_export" style="background:linear-gradient(135deg,#b478ff,#ff4d4d);font-size:15px;padding:14px">📥 Song als WAV exportieren</button>'
          + '<div id="export_status" style="display:none;margin-top:10px;padding:8px;background:rgba(180,120,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      container.innerHTML = body;

      // --- EVENT BINDINGS ---
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      // KI & Studio Tab
      if (tab === "ki") {
        bindInput("ki_desc", "songDesc");
        bindInput("ki_lyrics", "lyrics");
        bindSelect("ki_genre", "genre");
        bindSelect("ki_key", "key");
        container.querySelector("#ki_bpm").addEventListener("change", function(){
          s.bpm = Math.max(40, Math.min(200, parseFloat(this.value) || 100));
          this.value = s.bpm; save();
        });
        
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block"; stat.textContent = "⏳ HalDo KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ku": "Kurdisch" };
            var text = await HalDo.AI.writeLyrics(s.songDesc || "Liebe", langMap[s.lang] || "Deutsch", s.genre, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            s.lyrics = text; save(); stat.textContent = "✅ Text fertig!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        container.querySelector("#play_btn").addEventListener("click", startRealTimePlayback);
      }

      // Mixer Tab
      if (tab === "mixer") {
        ["piano", "bass", "strings", "guitar"].forEach(t => {
          container.querySelector("#vol_" + t).addEventListener("input", function(){
            let v = this.value / 100; s.trackVol[t] = v;
            container.querySelector("#v_" + t).textContent = this.value + "%";
            if (ST.liveCtx && ST.liveCtx.tracks[t]) {
              ST.liveCtx.tracks[t].gain.gain.value = v;
            }
            save();
          });
        });
      }

      // FX Tab
      if (tab === "fx") {
        container.querySelector("#fx_reverb").addEventListener("input", function(){
          s.fxReverb = this.value / 100; container.querySelector("#v_fx_reverb").textContent = this.value + "%";
          if (ST.liveCtx && ST.liveCtx.reverbGain) ST.liveCtx.reverbGain.gain.value = s.fxReverb;
          save();
        });
        container.querySelector("#fx_delay").addEventListener("input", function(){
          s.fxDelay = this.value / 100; container.querySelector("#v_fx_delay").textContent = this.value + "%";
          if (ST.liveCtx && ST.liveCtx.delayGain) ST.liveCtx.delayGain.gain.value = s.fxDelay;
          save();
        });
      }

      // Voice Tab
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
        container.querySelector("#voice_pitch").addEventListener("input", function(){
          s.vocalPitch = this.value / 100; container.querySelector("#v_voice_pitch").textContent = this.value + "%"; save();
        });
        container.querySelector("#voice_rate").addEventListener("input", function(){
          s.vocalRate = this.value / 100; container.querySelector("#v_voice_rate").textContent = this.value + "%"; save();
        });

        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          unlockAudio();
          let voices = window.speechSynthesis.getVoices();
          let sel = voices.find(v => v.voiceURI === s.voiceURI);
          if (!sel) return alert("Bitte wähle eine Stimme!");
          let u = new SpeechSynthesisUtterance("Hallo, so klinge ich.");
          u.voice = sel; u.pitch = s.vocalPitch; u.rate = s.vocalRate;
          window.speechSynthesis.speak(u);
        });
      }

      // Export Tab
      if (tab === "export") {
        container.querySelector("#btn_export").addEventListener("click", exportSong);
      }

      // Helpers
      function bindInput(id, key) {
        let el = container.querySelector("#" + id);
        if (el) el.addEventListener("input", function(){ s[key] = this.value; save(); });
      }
      function bindSelect(id, key) {
        let el = container.querySelector("#" + id);
        if (el) el.addEventListener("change", function(){ s[key] = this.value; save(); });
      }
      function sliderRow(label, id, value) {
        let safeVal = Math.round((Number(value) || 0) * 100);
        return '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>' + label + '</span><span id="v_' + id + '">' + safeVal + '%</span></div>'
          + '<input type="range" id="' + id + '" min="0" max="100" value="' + safeVal + '" style="width:100%">'
          + '</div>';
      }
    }

    // --- AUDIO SCHEDULING (Der Kern) ---
    function scheduleSong(ctx, dest, isOffline) {
      let s = ST.set;
      let player = new WebAudioFontPlayer();
      
      // Instrumente auswählen (basierend auf geladenen Soundfonts)
      let instPiano = window._tone_0250_SoundBlasterOld_sf2;
      let instBass = window._tone_0330_SoundBlasterOld_sf2;
      let instStrings = window._tone_0120_SoundBlasterOld_sf2;
      let instGuitar = window._tone_0300_SoundBlasterOld_sf2;

      // Gain Nodes (Live oder Offline)
      let trackGains = {};
      if (isOffline) {
        ["piano", "bass", "strings", "guitar"].forEach(t => {
          trackGains[t] = ctx.createGain();
          trackGains[t].gain.value = s.trackVol[t] || 0.5;
          trackGains[t].connect(dest);
        });
      }

      // Harmonik berechnen (vereinfacht)
      let baseMidi = { "C": 60, "G": 55, "D": 62, "Am": 57, "Em": 52 }[s.key] || 60;
      let isMinor = s.key.includes("m");
      let chords = isMinor ? 
        [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]] : 
        [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]]; // I - IV - V - I

      let bpm = s.bpm || 100;
      let beatDur = 60 / bpm;
      let totalBeats = 32; // 8 Takte
      let startTime = isOffline ? 0.1 : ctx.currentTime + 1.0;

      // Noten planen
      for (let i = 0; i < totalBeats; i++) {
        let t = startTime + (i * beatDur);
        let chordIdx = Math.floor(i / 4) % 4;
        let chordNotes = chords[chordIdx];

        if (t <= ctx.currentTime && !isOffline) continue; // Sicherheit für Live

        try {
          // Piano (Akkord)
          if (instPiano && (i % 4 === 0 || i % 4 === 2)) {
            chordNotes.forEach(n => {
              player.queueWaveTable(ctx, trackGains.piano || dest, instPiano, t, baseMidi + n + 12, beatDur * 1.8, 0.8);
            });
          }
          // Bass (Grundton)
          if (instBass) {
            player.queueWaveTable(ctx, trackGains.bass || dest, instBass, t, baseMidi + chordNotes[0] - 12, beatDur * 0.9, 0.9);
          }
          // Strings (Fläche)
          if (instStrings && i % 4 === 0) {
            chordNotes.forEach(n => {
              player.queueWaveTable(ctx, trackGains.strings || dest, instStrings, t, baseMidi + n, beatDur * 3.8, 0.6);
            });
          }
          // Gitarre (Arpeggio)
          if (instGuitar && i % 2 === 1) {
            player.queueWaveTable(ctx, trackGains.guitar || dest, instGuitar, t, baseMidi + chordNotes[1] + 12, beatDur * 0.8, 0.7);
          }
        } catch(e) { console.warn("Note error", e); }
      }

      // Gesang planen
      window.speechSynthesis.cancel();
      if (s.lyrics) {
        let words = s.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
        let voices = window.speechSynthesis.getVoices();
        let selVoice = voices.find(v => v.voiceURI === s.voiceURI);
        let wordsPerBeat = 2;
        let wordCount = Math.min(words.length, totalBeats * wordsPerBeat);

        for (let w = 0; w < wordCount; w++) {
          let word = words[w];
          let wTime = startTime + (w * (beatDur / wordsPerBeat));
          let delay = isOffline ? 0 : Math.max(0, (wTime - ctx.currentTime) * 1000);

          if (!isOffline) {
            setTimeout(() => {
              let u = new SpeechSynthesisUtterance(word);
              if (selVoice) u.voice = selVoice;
              u.pitch = s.vocalPitch || 1.0;
              u.rate = s.vocalRate || 1.0;
              window.speechSynthesis.speak(u);
            }, delay);
          }
        }
      }
    }

    // --- LIVE PLAYBACK ---
    async function startRealTimePlayback() {
      let btn = document.querySelector("#play_btn");
      let stat = document.querySelector("#play_status");
      if (!ST.set.lyrics) { tab = "ki"; build(); return alert("Bitte erst Songtext eingeben!"); }
      
      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Initialisiere...";
      
      try {
        unlockAudio();
        await loadInstruments();
        let ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") await ctx.resume();

        let masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);

        // Reverb & Delay Setup
        let reverb = createReverb(ctx);
        let reverbGain = ctx.createGain(); reverbGain.gain.value = ST.set.fxReverb;
        reverb.connect(reverbGain); reverbGain.connect(masterGain);

        let delay = ctx.createDelay(1.0); delay.delayTime.value = 0.3;
        let delayGain = ctx.createGain(); delayGain.gain.value = ST.set.fxDelay;
        delay.connect(delayGain); delayGain.connect(masterGain);

        // Tracks
        let tracks = {};
        ["piano", "bass", "strings", "guitar"].forEach(t => {
          tracks[t] = { gain: ctx.createGain() };
          tracks[t].gain.gain.value = ST.set.trackVol[t] || 0.5;
          tracks[t].gain.connect(masterGain);
          tracks[t].gain.connect(reverb); // Sende an Reverb
        });

        ST.liveCtx = { ctx, masterGain, tracks, reverbGain, delayGain };
        
        stat.textContent = "🎶 Song läuft...";
        scheduleSong(ctx, masterGain, false);

        setTimeout(() => {
          btn.disabled = false; stat.textContent = "✅ Song beendet.";
        }, 32 * (60 / ST.set.bpm) * 1000 + 2000);

      } catch(e) {
        btn.disabled = false; stat.textContent = "❌ " + e.message;
      }
    }

    // --- EXPORT (Offline Rendering) ---
    async function exportSong() {
      let btn = document.querySelector("#btn_export");
      let stat = document.querySelector("#export_status");
      if (!ST.set.lyrics) { tab = "ki"; build(); return alert("Bitte erst Songtext eingeben!"); }

      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Rendere Audio (5-10s)...";

      try {
        await loadInstruments();
        let dur = 32 * (60 / ST.set.bpm);
        let OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        let ctx = new OAC(2, 44100 * (dur + 2), 44100);

        let masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);

        let reverb = createReverb(ctx);
        let reverbGain = ctx.createGain(); reverbGain.gain.value = ST.set.fxReverb;
        reverb.connect(reverbGain); reverbGain.connect(masterGain);

        let tracks = {};
        ["piano", "bass", "strings", "guitar"].forEach(t => {
          tracks[t] = ctx.createGain();
          tracks[t].gain.value = ST.set.trackVol[t] || 0.5;
          tracks[t].connect(masterGain);
          tracks[t].connect(reverb);
        });

        // Noten in OfflineContext planen
        let s = ST.set;
        let player = new WebAudioFontPlayer();
        let baseMidi = { "C": 60, "G": 55, "D": 62, "Am": 57, "Em": 52 }[s.key] || 60;
        let isMinor = s.key.includes("m");
        let chords = isMinor ? [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]] : [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];
        let beatDur = 60 / (s.bpm || 100);

        for (let i = 0; i < 32; i++) {
          let t = 0.1 + (i * beatDur);
          let chordNotes = chords[Math.floor(i / 4) % 4];
          
          if (window._tone_0250_SoundBlasterOld_sf2 && (i % 4 === 0 || i % 4 === 2)) {
            chordNotes.forEach(n => player.queueWaveTable(ctx, tracks.piano, _tone_0250_SoundBlasterOld_sf2, t, baseMidi + n + 12, beatDur * 1.8, 0.8));
          }
          if (window._tone_0330_SoundBlasterOld_sf2) {
            player.queueWaveTable(ctx, tracks.bass, _tone_0330_SoundBlasterOld_sf2, t, baseMidi + chordNotes[0] - 12, beatDur * 0.9, 0.9);
          }
          if (window._tone_0120_SoundBlasterOld_sf2 && i % 4 === 0) {
            chordNotes.forEach(n => player.queueWaveTable(ctx, tracks.strings, _tone_0120_SoundBlasterOld_sf2, t, baseMidi + n, beatDur * 3.8, 0.6));
          }
          if (window._tone_0300_SoundBlasterOld_sf2 && i % 2 === 1) {
            player.queueWaveTable(ctx, tracks.guitar, _tone_0300_SoundBlasterOld_sf2, t, baseMidi + chordNotes[1] + 12, beatDur * 0.8, 0.7);
          }
        }

        // Rendern
        let renderedBuffer = await ctx.startRendering();
        let wavBlob = bufferToWav(renderedBuffer);
        let url = URL.createObjectURL(wavBlob);
        let a = document.createElement("a");
        a.href = url; a.download = "haldo-song-" + Date.now() + ".wav";
        a.click();
        URL.revokeObjectURL(url);

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
  console.log("🦚 musik.js v1000 geladen — PRO MAX ULTIMATE");
})();
