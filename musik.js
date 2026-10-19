/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v5.0) · NATIVE AUDIO STABLE
   Native AudioContext · WebAudioFont · KI-Text-Editor
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- 1. BIBLIOTHEKEN LADEN ---
  function loadLibraries() {
    return new Promise(async (resolve) => {
      if (!window.WebAudioFontPlayer) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      
      const instrumentLibs = [
        "0250_SoundBlasterOld_sf2", // Piano
        "0330_SoundBlasterOld_sf2", // Bass
        "0120_SoundBlasterOld_sf2", // Strings
        "0300_SoundBlasterOld_sf2", // Gitarre
        "0400_SoundBlasterOld_sf2", // Keman (Violine)
        "0730_SoundBlasterOld_sf2", // Ney (Flöte)
        "0680_SoundBlasterOld_sf2", // Duduk (Oboe)
        "1040_SoundBlasterOld_sf2", // Bağlama / Saz (Sitar)
        "0770_SoundBlasterOld_sf2", // Kaval (Shakuhachi)
        "1070_SoundBlasterOld_sf2", // Kanun (Zither)
        "0240_SoundBlasterOld_sf2", // Orgel
        "0560_SoundBlasterOld_sf2"  // Trompete
      ];
      
      for (let name of instrumentLibs) {
        if (!window['_tone_' + name]) {
          await new Promise(r => {
            let s = document.createElement('script');
            s.src = `https://surikov.github.io/webaudiofontdata/sound/${name}.js`;
            s.onload = r;
            s.onerror = r;
            document.head.appendChild(s);
          });
        }
      }
      resolve();
    });
  }

  // --- 2. DATEN ---
  const GENRES = [
    "Pop", "Rock", "EDM", "R&B", "Hip-Hop", "Jazz", "Blues", "Metal", "Punk", "Disco", "Dance",
    "Latin", "Reggae", "Country", "Folk", "Klassik", "Romantik", "Barock", "Oper",
    "Stran", "Helbest", "Dengbêj", "Arabesk", "Türkü", "Halay", "Orientale", "Türk Sanat Müziği", "Türk Halk Müziği",
    "Cinematic", "Ambient", "Synthwave", "Lo-Fi", "Ezidi", "Kurdisch", "Asiatisch", "Indisch", "Balkan", "Europäisch", "USA"
  ];

  const MOODS = [
    "Happy", "Hype", "Nostalgisch", "Cinematic", "Hard", "Lyrical", "Traurig", "Chill", 
    "Depressiv", "Slow", "Dark", "Episch", "Romantisch", "Melancholisch", "Energiegeladen", "Verträumt",
    "Aggressiv", "Hoffnungsvoll", "Sehnsüchtig", "Feierlich", "Entspannt", "Motivierend"
  ];

  const INSTRUMENTS = {
    piano: { name: "Klavier", icon: "🎹", varName: "_tone_0250_SoundBlasterOld_sf2" },
    guitar: { name: "Gitarre", icon: "🎸", varName: "_tone_0300_SoundBlasterOld_sf2" },
    bass: { name: "Bass", icon: "🎸", varName: "_tone_0330_SoundBlasterOld_sf2" },
    strings: { name: "Streicher", icon: "🎻", varName: "_tone_0120_SoundBlasterOld_sf2" },
    keman: { name: "Keman (Geige)", icon: "🎻", varName: "_tone_0400_SoundBlasterOld_sf2" },
    ney: { name: "Ney (Flöte)", icon: "🪈", varName: "_tone_0730_SoundBlasterOld_sf2" },
    duduk: { name: "Duduk", icon: "🎺", varName: "_tone_0680_SoundBlasterOld_sf2" },
    saz: { name: "Bağlama / Saz", icon: "🪕", varName: "_tone_1040_SoundBlasterOld_sf2" },
    kaval: { name: "Kaval", icon: "🪈", varName: "_tone_0770_SoundBlasterOld_sf2" },
    kanun: { name: "Kanun", icon: "🎼", varName: "_tone_1070_SoundBlasterOld_sf2" },
    organ: { name: "Orgel", icon: "🎹", varName: "_tone_0240_SoundBlasterOld_sf2" },
    brass: { name: "Bläser", icon: "🎺", varName: "_tone_0560_SoundBlasterOld_sf2" }
  };

  // --- 3. HAUPT-RENDER-FUNKTION ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var defaultSet = {
      genre: "Pop", mood: "Happy", bpm: 100, key: "C",
      lyrics: "", songDesc: "",
      voiceType: "female", voiceURI: "", vocalPitch: 1.0, vocalRate: 1.0,
      selectedInstruments: ["piano", "bass", "saz", "duduk"],
      trackVol: { piano: 0.8, bass: 0.6, strings: 0.5, guitar: 0.5, keman: 0.5, ney: 0.5, duduk: 0.6, saz: 0.7, kaval: 0.5, kanun: 0.5, organ: 0.5, brass: 0.5 },
      fxReverb: 0.4, fxDelay: 0.2
    };
    var ST = {
      set: Object.assign({}, defaultSet, store.get("settings", {})),
      isPlaying: false,
      audioCtx: null,
      player: null
    };
    if (!ST.set.trackVol) ST.set.trackVol = defaultSet.trackVol;
    if (!ST.set.selectedInstruments) ST.set.selectedInstruments = defaultSet.selectedInstruments;

    function save() { store.set("settings", ST.set); }

    function build(){
      var s = ST.set;
      var body = '';

      // TABS
      body += '<div class="tabs" style="flex-wrap:wrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "instruments" ? " active" : "") + '" data-mtab="instruments">🎹 Instrumente</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '</div>';

      /* ═══════════ TAB 1: STUDIO ═══════════ */
      if(tab === "studio"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Heimweh...)" value="' + _esc(s.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Schreibe hier deinen Text..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(s.lyrics) + '</textarea>'
          + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
          + '<button class="btn" id="ki_gen" style="flex:1;font-size:11px">✨ Generieren</button>'
          + '<button class="btn sec" id="ki_correct" style="flex:1;font-size:11px">✅ Korrigieren</button>'
          + '<button class="btn sec" id="ki_rewrite" style="flex:1;font-size:11px">🔄 Umformulieren</button>'
          + '</div>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        var genreOpts = GENRES.map(g => `<option value="${g}" ${s.genre===g?'selected':''}>${g}</option>`).join("");
        var moodOpts = MOODS.map(m => `<option value="${m}" ${s.mood===m?'selected':''}>${m}</option>`).join("");

        body += '<div class="card"><h3>🎵 Stil & Stimmung</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">GENRE</label>'
          + '<select id="ki_genre" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">' + genreOpts + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIMMUNG</label>'
          + '<select id="ki_mood" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">' + moodOpts + '</select></div>'
          + '</div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="ki_bpm" value="' + s.bpm + '" min="40" max="200" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">TONART</label>'
          + '<select id="ki_key" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="C" '+ (s.key==="C"?"selected":"") +'>C-Dur</option>'
          + '<option value="G" '+ (s.key==="G"?"selected":"") +'>G-Dur</option>'
          + '<option value="Am" '+ (s.key==="Am"?"selected":"") +'>A-Moll</option>'
          + '<option value="Em" '+ (s.key==="Em"?"selected":"") +'>E-Moll</option>'
          + '</select></div>'
          + '</div></div>';

        body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
          + '<button class="btn full" id="play_btn" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">▶️ Song produzieren</button>'
          + '<button class="btn danger full" id="stop_btn" style="margin-top:8px;font-size:14px;padding:12px">⏹ Stoppen</button>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      /* ═══════════ TAB 2: INSTRUMENTE ═══════════ */
      if(tab === "instruments"){
        body += '<div class="card"><h3>🎹 Instrumente auswählen</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
        Object.keys(INSTRUMENTS).forEach(key => {
          let inst = INSTRUMENTS[key];
          let isSelected = s.selectedInstruments.includes(key);
          body += '<button type="button" data-instr="' + key + '" style="padding:12px 4px;background:' + (isSelected ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (isSelected ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:11px;font-weight:800">'
            + '<div style="font-size:20px;margin-bottom:4px">' + inst.icon + '</div>'
            + inst.name
            + '</button>';
        });
        body += '</div></div>';
      }

      /* ═══════════ TAB 3: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Multi-Track Mixer</h3>';
        s.selectedInstruments.forEach(inst => {
          let name = INSTRUMENTS[inst]?.name || inst;
          body += sliderRow("🎵 " + name, "vol_" + inst, s.trackVol[inst] || 0.5);
        });
        if (s.selectedInstruments.length === 0) {
            body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Wähle zuerst Instrumente aus!</div>';
        }
        body += '</div>';
      }

      /* ═══════════ TAB 4: GESANG ═══════════ */
      if(tab === "voice"){
        body += '<div class="card"><h3>🎤 Vocal Studio</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">GESCHLECHT / TYP</label>'
          + '<select id="voice_type" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="female" '+ (s.voiceType==="female"?"selected":"") +'>Weiblich (Sopran/Alt)</option>'
          + '<option value="male" '+ (s.voiceType==="male"?"selected":"") +'>Männlich (Tenor/Bass)</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIMME (System)</label>'
          + '<select id="ki_voice" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select></div>'
          + '</div>'
          + sliderRow("🎵 Gesangs-Tonhöhe", "voice_pitch", s.vocalPitch)
          + sliderRow("⏩ Gesangs-Tempo", "voice_rate", s.vocalRate)
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:10px;line-height:1.5">'
          + 'ℹ️ <b>Hinweis:</b> Die Browser-Stimme spricht den Text rhythmisch zur Musik. Für echten, melodiösen Gesang (wie bei Popstars) braucht man riesige KI-Server (z.B. Suno).'
          + '</div></div>';
      }

      container.innerHTML = body;

      // --- EVENT BINDINGS ---
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      // Studio Tab
      if (tab === "studio") {
        container.querySelector("#ki_desc").addEventListener("input", function(){ s.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ s.lyrics = this.value; save(); });
        container.querySelector("#ki_genre").addEventListener("change", function(){ s.genre = this.value; save(); });
        container.querySelector("#ki_mood").addEventListener("change", function(){ s.mood = this.value; save(); });
        container.querySelector("#ki_key").addEventListener("change", function(){ s.key = this.value; save(); });
        container.querySelector("#ki_bpm").addEventListener("change", function(){ 
          s.bpm = Math.max(40, Math.min(200, parseFloat(this.value) || 100)); 
          this.value = s.bpm; save(); 
        });

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

        container.querySelector("#ki_rewrite").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          var text = container.querySelector("#ki_lyrics").value.trim();
          if (!text) return alert("Kein Text zum Umformulieren!");
          stat.style.display = "block"; stat.textContent = "⏳ KI formuliert um...";
          this.disabled = true;
          try {
            var rewritten = await HalDo.AI.rewrite(text, s.genre);
            container.querySelector("#ki_lyrics").value = rewritten;
            s.lyrics = rewritten; save(); stat.textContent = "✅ Text umformuliert!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        container.querySelector("#play_btn").addEventListener("click", startPlayback);
        container.querySelector("#stop_btn").addEventListener("click", stopPlayback);
      }

      // Instrumente Tab
      if (tab === "instruments") {
        container.querySelectorAll("[data-instr]").forEach(b => {
          b.addEventListener("click", () => {
            let key = b.dataset.instr;
            let idx = s.selectedInstruments.indexOf(key);
            if (idx === -1) s.selectedInstruments.push(key);
            else s.selectedInstruments.splice(idx, 1);
            save(); build();
          });
        });
      }

      // Mixer Tab
      if (tab === "mixer") {
        s.selectedInstruments.forEach(inst => {
          let slider = container.querySelector("#vol_" + inst);
          if (slider) slider.addEventListener("input", function(){
            let v = this.value / 100; s.trackVol[inst] = v;
            container.querySelector("#v_vol_" + inst).textContent = this.value + "%";
            if (ST.isPlaying && ST.trackGains && ST.trackGains[inst]) {
              ST.trackGains[inst].gain.value = v;
            }
            save();
          });
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
        
        container.querySelector("#voice_type").addEventListener("change", function(){ s.voiceType = this.value; save(); });
        voiceSelect.addEventListener("change", function(){ s.voiceURI = this.value; save(); });
        container.querySelector("#voice_pitch").addEventListener("input", function(){
          s.vocalPitch = this.value / 100; container.querySelector("#v_voice_pitch").textContent = this.value + "%"; save();
        });
        container.querySelector("#voice_rate").addEventListener("input", function(){
          s.vocalRate = this.value / 100; container.querySelector("#v_voice_rate").textContent = this.value + "%"; save();
        });
      }
    }

    // --- HELPER ---
    function sliderRow(label, id, value) {
      let safeVal = Math.round((Number(value) || 0) * 100);
      return '<div style="margin-bottom:12px">'
        + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>' + label + '</span><span id="v_' + id + '">' + safeVal + '%</span></div>'
        + '<input type="range" id="' + id + '" min="0" max="100" value="' + safeVal + '" style="width:100%">'
        + '</div>';
    }

    // --- AUDIO ENGINE (Native AudioContext) ---
    async function startPlayback() {
      if (!ST.set.lyrics) return alert("Bitte erst Songtext eingeben!");
      if (ST.set.selectedInstruments.length === 0) return alert("Bitte wähle mindestens ein Instrument aus!");
      
      let btn = document.querySelector("#play_btn");
      let stat = document.querySelector("#play_status");
      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Initialisiere Audio...";

      try {
        await loadLibraries();
        
        // 1. Nativen AudioContext erstellen
        if (!ST.audioCtx) {
          ST.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ST.audioCtx.state === "suspended") {
          await ST.audioCtx.resume();
        }

        // 2. Master & FX Setup (Nativ)
        const masterGain = ST.audioCtx.createGain();
        masterGain.connect(ST.audioCtx.destination);

        // Einfacher Reverb (Convolver)
        const reverb = ST.audioCtx.createConvolver();
        // Einfache Impulsantwort generieren
        const length = ST.audioCtx.sampleRate * 2.0;
        const impulse = ST.audioCtx.createBuffer(2, length, ST.audioCtx.sampleRate);
        for (let i = 0; i < 2; i++) {
          const channel = impulse.getChannelData(i);
          for (let j = 0; j < length; j++) channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2.0);
        }
        reverb.buffer = impulse;
        const reverbGain = ST.audioCtx.createGain();
        reverbGain.gain.value = ST.set.fxReverb;
        reverb.connect(reverbGain);
        reverbGain.connect(masterGain);

        // Delay
        const delay = ST.audioCtx.createDelay(1.0);
        delay.delayTime.value = 0.3;
        const delayGain = ST.audioCtx.createGain();
        delayGain.gain.value = ST.set.fxDelay;
        delay.connect(delayGain);
        delayGain.connect(masterGain);

        // 3. Track Gains erstellen
        ST.trackGains = {};
        ST.set.selectedInstruments.forEach(inst => {
          let gain = ST.audioCtx.createGain();
          gain.gain.value = ST.set.trackVol[inst] || 0.5;
          gain.connect(masterGain);
          gain.connect(reverb);
          ST.trackGains[inst] = gain;
        });

        // 4. Player initialisieren und Instrumente dekodieren
        ST.player = new WebAudioFontPlayer();
        ST.set.selectedInstruments.forEach(inst => {
          let varName = INSTRUMENTS[inst].varName;
          if (window[varName]) {
            ST.player.loader.decodeAfterLoading(ST.audioCtx, varName);
          }
        });

        // 5. Noten planen (mit nativer Zeit)
        let baseMidi = { "C": 60, "G": 55, "D": 62, "Am": 57, "Em": 52 }[ST.set.key] || 60;
        let isMinor = ST.set.key.includes("m");
        let chords = isMinor ? 
          [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]] : 
          [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];

        let totalBeats = 32;
        let beatDur = 60 / ST.set.bpm;
        let startTime = ST.audioCtx.currentTime + 0.5; // Kleiner Puffer

        for (let i = 0; i < totalBeats; i++) {
          let time = startTime + (i * beatDur);
          let chordIdx = Math.floor(i / 4) % 4;
          let chordNotes = chords[chordIdx];

          setTimeout(() => {
            try {
              // Piano
              if (ST.trackGains.piano && (i % 4 === 0 || i % 4 === 2)) {
                chordNotes.forEach(n => {
                  ST.player.queueWaveTable(ST.audioCtx, ST.trackGains.piano, window._tone_0250_SoundBlasterOld_sf2, time, baseMidi + n + 12, beatDur * 1.8, 0.8);
                });
              }
              // Bass
              if (ST.trackGains.bass) {
                ST.player.queueWaveTable(ST.audioCtx, ST.trackGains.bass, window._tone_0330_SoundBlasterOld_sf2, time, baseMidi + chordNotes[0] - 12, beatDur * 0.9, 0.9);
              }
              // Saz / Duduk etc.
              ["saz", "duduk", "keman", "ney", "kaval", "kanun", "guitar", "strings"].forEach(inst => {
                if (ST.trackGains[inst] && i % 2 === 1) {
                  let randomNote = chordNotes[Math.floor(Math.random() * chordNotes.length)];
                  let instVar = INSTRUMENTS[inst].varName;
                  ST.player.queueWaveTable(ST.audioCtx, ST.trackGains[inst], window[instVar], time, baseMidi + randomNote + 12, beatDur * 0.8, 0.6);
                }
              });
            } catch(e){ console.warn("Scheduling Fehler:", e); }
          }, (time - ST.audioCtx.currentTime) * 1000);
        }

        // 6. Gesang planen
        window.speechSynthesis.cancel();
        if (ST.set.lyrics) {
          let words = ST.set.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
          let voices = window.speechSynthesis.getVoices();
          let selVoice = voices.find(v => v.voiceURI === ST.set.voiceURI);
          let wordsPerBeat = 2;
          let wordCount = Math.min(words.length, totalBeats * wordsPerBeat);

          for (let w = 0; w < wordCount; w++) {
            let word = words[w];
            let time = startTime + (w * (beatDur / wordsPerBeat));
            let notePitch = baseMidi + chords[Math.floor(w/4)%4][0] + 12;
            
            setTimeout(() => {
              let u = new SpeechSynthesisUtterance(word);
              if (selVoice) u.voice = selVoice;
              let pitchMod = (notePitch - 60) * 0.05; 
              u.pitch = (ST.set.vocalPitch || 1.0) + pitchMod;
              u.rate = ST.set.vocalRate || 1.0;
              window.speechSynthesis.speak(u);
            }, (time - ST.audioCtx.currentTime) * 1000);
          }
        }

        ST.isPlaying = true;
        stat.textContent = "🎶 Song läuft...";
        btn.disabled = false;

        setTimeout(() => {
          if (ST.isPlaying) {
            stat.textContent = "✅ Song beendet.";
            ST.isPlaying = false;
          }
        }, (totalBeats * beatDur * 1000) + 2000);

      } catch(e) {
        btn.disabled = false; stat.textContent = "❌ " + e.message; console.error(e);
      }
    }

    function stopPlayback() {
      window.speechSynthesis.cancel();
      if (ST.audioCtx) {
        ST.audioCtx.close();
        ST.audioCtx = null;
      }
      ST.isPlaying = false;
      let stat = document.querySelector("#play_status");
      if(stat) stat.textContent = "⏹ Gestoppt.";
      let btn = document.querySelector("#play_btn");
      if(btn) btn.disabled = false;
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v5.0 geladen — NATIVE AUDIO STABLE");
})();
