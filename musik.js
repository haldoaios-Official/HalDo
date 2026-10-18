/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v1.0) · PRO MAX FOUNDATION
   Tone.js (Timing/FX) · WebAudioFont (Instrumente) · KI & TTS
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
      // Tone.js laden
      if (!window.Tone) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      // WebAudioFont laden
      if (!window.WebAudioFontPlayer) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      // Instrumente laden (Klavier, Bass, Strings, Gitarre)
      const instruments = [
        "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js",
        "https://surikov.github.io/webaudiofontdata/sound/0330_SoundBlasterOld_sf2.js",
        "https://surikov.github.io/webaudiofontdata/sound/0120_SoundBlasterOld_sf2.js",
        "https://surikov.github.io/webaudiofontdata/sound/0300_SoundBlasterOld_sf2.js"
      ];
      for (let url of instruments) {
        const name = url.match(/(\d+)_SoundBlasterOld_sf2\.js/)[1];
        if (!window['_tone_' + name + '_SoundBlasterOld_sf2']) {
          await new Promise(r => {
            let s = document.createElement('script');
            s.src = url;
            s.onload = r;
            document.head.appendChild(s);
          });
        }
      }
      resolve();
    });
  }

  // --- 2. DATEN (Genres, Stimmungen, Stimmen) ---
  const GENRES = [
    "Pop", "Rock", "EDM", "R&B", "Hip-Hop", "Jazz", "Blues", "Metal", "Punk", "Disco", "Dance",
    "Latin", "Reggae", "Country", "Folk", "Klassik", "Romantik", "Barock", "Oper",
    "Stran", "Helbest", "Dengbêj", "Arabesk", "Türkü", "Halay", "Orientale", "Türk Sanat Müziği", "Türk Halk Müziği"
  ];

  const MOODS = [
    "Happy", "Hype", "Nostalgisch", "Cinematic", "Hard", "Lyrical", "Traurig", "Chill", 
    "Depressiv", "Slow", "Dark", "Episch", "Romantisch", "Melancholisch", "Energiegeladen", "Verträumt"
  ];

  // --- 3. HAUPT-RENDER-FUNKTION ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var defaultSet = {
      genre: "Pop", mood: "Happy", bpm: 100, key: "C",
      lyrics: "", songDesc: "",
      voiceType: "female", voiceURI: "", vocalPitch: 1.0, vocalRate: 1.0,
      trackVol: { piano: 0.8, bass: 0.6, strings: 0.5, guitar: 0.5 },
      fxReverb: 0.3, fxDelay: 0.2, fxChorus: 0.0
    };
    var ST = {
      set: Object.assign({}, defaultSet, store.get("settings", {})),
      isPlaying: false,
      toneStarted: false
    };
    if (!ST.set.trackVol) ST.set.trackVol = defaultSet.trackVol;

    function save() { store.set("settings", ST.set); }

    function build(){
      var s = ST.set;
      var body = '';

      // TABS
      body += '<div class="tabs" style="flex-wrap:wrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "fx" ? " active" : "") + '" data-mtab="fx">✨ Effekte</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '</div>';

      /* ═══════════ TAB 1: STUDIO ═══════════ */
      if(tab === "studio"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Heimweh...)" value="' + _esc(s.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Schreibe hier deinen Text..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(s.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        // Genre & Mood Auswahl
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

        // Play Button (Sticky)
        body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
          + '<button class="btn full" id="play_btn" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">▶️ Song produzieren</button>'
          + '<button class="btn danger full" id="stop_btn" style="margin-top:8px;font-size:14px;padding:12px">⏹ Stoppen</button>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      /* ═══════════ TAB 2: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Multi-Track Mixer</h3>';
        ["piano", "bass", "strings", "guitar"].forEach(t => {
          body += sliderRow("🎹 " + t.charAt(0).toUpperCase() + t.slice(1), "vol_" + t, s.trackVol[t]);
        });
        body += '</div>';
      }

      /* ═══════════ TAB 3: EFFEKTE ═══════════ */
      if(tab === "fx"){
        body += '<div class="card"><h3>✨ Raum & Effekte</h3>'
          + sliderRow("🏛️ Hall (Reverb)", "fx_reverb", s.fxReverb)
          + sliderRow("📢 Echo (Delay)", "fx_delay", s.fxDelay)
          + sliderRow("🌊 Chorus", "fx_chorus", s.fxChorus)
          + '</div>';
      }

      /* ═══════════ TAB 4: GESANG ═══════════ */
      if(tab === "voice"){
        body += '<div class="card"><h3>🎤 Vocal Studio</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">GESCHLECHT / TYP</label>'
          + '<select id="voice_type" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="female" '+ (s.voiceType==="female"?"selected":"") +'>Weiblich (Sopran/Alt)</option>'
          + '<option value="male" '+ (s.voiceType==="male"?"selected":"") +'>Männlich (Tenor/Bass)</option>'
          + '<option value="duet" '+ (s.voiceType==="duet"?"selected":"") +'>Duett (M/W)</option>'
          + '<option value="choir" '+ (s.voiceType==="choir"?"selected":"") +'>Chor</option>'
          + '<option value="own" '+ (s.voiceType==="own"?"selected":"") +'>Meine eigene Stimme (Klon)</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIMME (System)</label>'
          + '<select id="ki_voice" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select></div>'
          + '</div>'
          + sliderRow("🎵 Gesangs-Tonhöhe", "voice_pitch", s.vocalPitch)
          + sliderRow("⏩ Gesangs-Tempo", "voice_rate", s.vocalRate)
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px;margin-top:8px">🔊 Stimme testen</button>'
          + '</div>';
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

        container.querySelector("#play_btn").addEventListener("click", startPlayback);
        container.querySelector("#stop_btn").addEventListener("click", stopPlayback);
      }

      // Mixer Tab
      if (tab === "mixer") {
        ["piano", "bass", "strings", "guitar"].forEach(t => {
          container.querySelector("#vol_" + t).addEventListener("input", function(){
            let v = this.value / 100; s.trackVol[t] = v;
            container.querySelector("#v_vol_" + t).textContent = this.value + "%";
            if (ST.isPlaying && window._haldoTracks && window._haldoTracks[t]) {
              window._haldoTracks[t].volume.value = Tone.gainToDb(v);
            }
            save();
          });
        });
      }

      // FX Tab
      if (tab === "fx") {
        container.querySelector("#fx_reverb").addEventListener("input", function(){
          s.fxReverb = this.value / 100; container.querySelector("#v_fx_reverb").textContent = this.value + "%";
          if (window._haldoFX) window._haldoFX.reverb.wet.value = s.fxReverb;
          save();
        });
        container.querySelector("#fx_delay").addEventListener("input", function(){
          s.fxDelay = this.value / 100; container.querySelector("#v_fx_delay").textContent = this.value + "%";
          if (window._haldoFX) window._haldoFX.delay.wet.value = s.fxDelay;
          save();
        });
        container.querySelector("#fx_chorus").addEventListener("input", function(){
          s.fxChorus = this.value / 100; container.querySelector("#v_fx_chorus").textContent = this.value + "%";
          if (window._haldoFX) window._haldoFX.chorus.wet.value = s.fxChorus;
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
        
        container.querySelector("#voice_type").addEventListener("change", function(){ s.voiceType = this.value; save(); });
        voiceSelect.addEventListener("change", function(){ s.voiceURI = this.value; save(); });
        container.querySelector("#voice_pitch").addEventListener("input", function(){
          s.vocalPitch = this.value / 100; container.querySelector("#v_voice_pitch").textContent = this.value + "%"; save();
        });
        container.querySelector("#voice_rate").addEventListener("input", function(){
          s.vocalRate = this.value / 100; container.querySelector("#v_voice_rate").textContent = this.value + "%"; save();
        });

        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          if(!window.Tone) return alert("Tone.js noch nicht geladen");
          Tone.start();
          let voices = window.speechSynthesis.getVoices();
          let sel = voices.find(v => v.voiceURI === s.voiceURI);
          if (!sel) return alert("Bitte wähle eine Stimme!");
          let u = new SpeechSynthesisUtterance("Hallo, ich bin deine Sängerin.");
          u.voice = sel; u.pitch = s.vocalPitch; u.rate = s.vocalRate;
          window.speechSynthesis.speak(u);
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

    // --- AUDIO ENGINE (Tone.js + WebAudioFont) ---
    async function startPlayback() {
      if (!ST.set.lyrics) return alert("Bitte erst Songtext eingeben!");
      let btn = document.querySelector("#play_btn");
      let stat = document.querySelector("#play_status");
      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Initialisiere Audio...";

      try {
        await loadLibraries();
        await Tone.start();
        
        // Transport zurücksetzen
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.bpm.value = ST.set.bpm;

        // Master & FX Setup
        const masterGain = new Tone.Gain(1).toDestination();
        const reverb = new Tone.Reverb({ decay: 2.5, wet: ST.set.fxReverb }).connect(masterGain);
        const delay = new Tone.FeedbackDelay("8n", 0.5).connect(masterGain);
        delay.wet.value = ST.set.fxDelay;
        const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(masterGain);
        chorus.wet.value = ST.set.fxChorus;

        window._haldoFX = { reverb, delay, chorus };

        // Track Gains
        const trackGains = {
          piano: new Tone.Gain(ST.set.trackVol.piano).connect(reverb).connect(delay),
          bass: new Tone.Gain(ST.set.trackVol.bass).connect(masterGain),
          strings: new Tone.Gain(ST.set.trackVol.strings).connect(reverb),
          guitar: new Tone.Gain(ST.set.trackVol.guitar).connect(chorus)
        };
        window._haldoTracks = trackGains;

        // Instrumente laden
        const player = new WebAudioFontPlayer();
        const instPiano = window._tone_0250_SoundBlasterOld_sf2;
        const instBass = window._tone_0330_SoundBlasterOld_sf2;
        const instStrings = window._tone_0120_SoundBlasterOld_sf2;
        const instGuitar = window._tone_0300_SoundBlasterOld_sf2;

        // Harmonik
        let baseMidi = { "C": 60, "G": 55, "D": 62, "Am": 57, "Em": 52 }[ST.set.key] || 60;
        let isMinor = ST.set.key.includes("m");
        let chords = isMinor ? 
          [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]] : 
          [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];

        // Noten-Sequenz (8 Takte)
        let totalBeats = 32;
        let beatDur = 60 / ST.set.bpm;

        for (let i = 0; i < totalBeats; i++) {
          let time = i * beatDur;
          let chordIdx = Math.floor(i / 4) % 4;
          let chordNotes = chords[chordIdx];

          Tone.Transport.schedule((t) => {
            try {
              // Piano
              if (instPiano && (i % 4 === 0 || i % 4 === 2)) {
                chordNotes.forEach(n => player.queueWaveTable(Tone.context, trackGains.piano, instPiano, t, baseMidi + n + 12, beatDur * 1.8, 0.8));
              }
              // Bass
              if (instBass) {
                player.queueWaveTable(Tone.context, trackGains.bass, instBass, t, baseMidi + chordNotes[0] - 12, beatDur * 0.9, 0.9);
              }
              // Strings
              if (instStrings && i % 4 === 0) {
                chordNotes.forEach(n => player.queueWaveTable(Tone.context, trackGains.strings, instStrings, t, baseMidi + n, beatDur * 3.8, 0.6));
              }
              // Gitarre
              if (instGuitar && i % 2 === 1) {
                player.queueWaveTable(Tone.context, trackGains.guitar, instGuitar, t, baseMidi + chordNotes[1] + 12, beatDur * 0.8, 0.7);
              }
            } catch(e){}
          }, time);
        }

        // Gesang planen
        window.speechSynthesis.cancel();
        if (ST.set.lyrics) {
          let words = ST.set.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
          let voices = window.speechSynthesis.getVoices();
          let selVoice = voices.find(v => v.voiceURI === ST.set.voiceURI);
          let wordsPerBeat = 2;
          let wordCount = Math.min(words.length, totalBeats * wordsPerBeat);

          for (let w = 0; w < wordCount; w++) {
            let word = words[w];
            let time = w * (beatDur / wordsPerBeat);
            Tone.Transport.schedule((t) => {
              let u = new SpeechSynthesisUtterance(word);
              if (selVoice) u.voice = selVoice;
              u.pitch = ST.set.vocalPitch || 1.0;
              u.rate = ST.set.vocalRate || 1.0;
              window.speechSynthesis.speak(u);
            }, time);
          }
        }

        Tone.Transport.start("+0.1");
        ST.isPlaying = true;
        stat.textContent = "🎶 Song läuft...";
        btn.disabled = false;

        Tone.Transport.schedule(() => {
          stat.textContent = "✅ Song beendet.";
          ST.isPlaying = false;
          Tone.Transport.stop();
        }, totalBeats * beatDur);

      } catch(e) {
        btn.disabled = false; stat.textContent = "❌ " + e.message; console.error(e);
      }
    }

    function stopPlayback() {
      if (window.Tone) {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      }
      window.speechSynthesis.cancel();
      ST.isPlaying = false;
      let stat = document.querySelector("#play_status");
      if(stat) stat.textContent = "⏹ Gestoppt.";
      let btn = document.querySelector("#play_btn");
      if(btn) btn.disabled = false;
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v1.0 geladen — PRO MAX FOUNDATION (Tone.js)");
})();
