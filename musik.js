/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v2.0) · PRO MAX FOUNDATION
   Tone.js · SpessaSynth · Vocal-Synth-Engine · KI
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
      // Tone.js
      if (!window.Tone) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      // SpessaSynth (für hochwertige Instrumente)
      if (!window.SpessaSynth) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://cdn.jsdelivr.net/npm/spessasynth_lib@3.26.20/dist/spessasynth_lib.min.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      // Vocal-Synth-Engine (für echten Gesang)
      if (!window.VocalSynthEngine) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.type = 'module';
          s.textContent = `
            import { VocalSynthEngine } from "https://cdn.jsdelivr.net/npm/@mcptoolshop/vocal-synth-engine@1.1.0/+esm";
            window.VocalSynthEngine = VocalSynthEngine;
            window.dispatchEvent(new Event('vocal-ready'));
          `;
          document.head.appendChild(s);
          window.addEventListener('vocal-ready', r, { once: true });
        });
      }
      resolve();
    });
  }

  // --- 2. DATEN (Genres, Stimmungen, Instrumente) ---
  const GENRES = [
    "Pop", "Rock", "EDM", "R&B", "Hip-Hop", "Jazz", "Blues", "Metal", "Punk", "Disco", "Dance",
    "Latin", "Reggae", "Country", "Folk", "Klassik", "Romantik", "Barock", "Oper",
    "Stran", "Helbest", "Dengbêj", "Arabesk", "Türkü", "Halay", "Orientale", "Türk Sanat Müziği", "Türk Halk Müziği"
  ];

  const MOODS = [
    "Happy", "Hype", "Nostalgisch", "Cinematic", "Hard", "Lyrical", "Traurig", "Chill", 
    "Depressiv", "Slow", "Dark", "Episch", "Romantisch", "Melancholisch", "Energiegeladen", "Verträumt"
  ];

  // Eine Auswahl an General MIDI Instrumenten (SpessaSynth nutzt GM-Programme)
  const INSTRUMENTS = {
    piano: { name: "Klavier", program: 0 },
    guitar: { name: "Gitarre", program: 24 },
    bass: { name: "Bass", program: 32 },
    strings: { name: "Streicher", program: 48 },
    flute: { name: "Flöte", program: 73 },
    baglama: { name: "Bağlama", program: 105 }, // Annäherung
    duduk: { name: "Duduk", program: 72 }, // Annäherung
    drums: { name: "Drums", program: 0, isDrum: true }
  };

  // --- 3. HAUPT-RENDER-FUNKTION ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var defaultSet = {
      genre: "Pop", mood: "Happy", bpm: 100, key: "C",
      lyrics: "", songDesc: "",
      voiceType: "female", voiceURI: "", vocalPitch: 1.0, vocalRate: 1.0,
      selectedInstruments: ["piano", "bass", "strings"],
      trackVol: { piano: 0.8, bass: 0.6, strings: 0.5, guitar: 0.5 },
      fxReverb: 0.3, fxDelay: 0.2
    };
    var ST = {
      set: Object.assign({}, defaultSet, store.get("settings", {})),
      isPlaying: false
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

        // Genre & Mood
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

      /* ═══════════ TAB 2: INSTRUMENTE ═══════════ */
      if(tab === "instruments"){
        body += '<div class="card"><h3>🎹 Instrumente auswählen</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
        Object.keys(INSTRUMENTS).forEach(key => {
          let inst = INSTRUMENTS[key];
          let isSelected = s.selectedInstruments.includes(key);
          body += '<button type="button" data-instr="' + key + '" style="padding:12px 4px;background:' + (isSelected ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (isSelected ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:11px;font-weight:800">'
            + '<div style="font-size:20px;margin-bottom:4px">' + (inst.isDrum ? "🥁" : "🎵") + '</div>'
            + inst.name
            + '</button>';
        });
        body += '</div></div>';
      }

      /* ═══════════ TAB 3: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Multi-Track Mixer</h3>';
        s.selectedInstruments.forEach(inst => {
          body += sliderRow("🎹 " + (INSTRUMENTS[inst]?.name || inst), "vol_" + inst, s.trackVol[inst] || 0.5);
        });
        body += '</div>';
      }

      /* ═══════════ TAB 4: EFFEKTE ═══════════ */
      if(tab === "fx"){
        body += '<div class="card"><h3>✨ Raum & Effekte</h3>'
          + sliderRow("🏛️ Hall (Reverb)", "fx_reverb", s.fxReverb)
          + sliderRow("📢 Echo (Delay)", "fx_delay", s.fxDelay)
          + '</div>';
      }

      /* ═══════════ TAB 5: GESANG ═══════════ */
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
            if (ST.isPlaying && window._haldoTracks && window._haldoTracks[inst]) {
              window._haldoTracks[inst].volume.value = Tone.gainToDb(v);
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

    // --- AUDIO ENGINE (Tone.js + SpessaSynth + VocalSynthEngine) ---
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
        window._haldoFX = { reverb, delay };

        // Track Gains
        const trackGains = {};
        ST.set.selectedInstruments.forEach(inst => {
          trackGains[inst] = new Tone.Gain(ST.set.trackVol[inst] || 0.5).connect(reverb).connect(delay);
        });
        window._haldoTracks = trackGains;

        // 1. Instrumente mit SpessaSynth (echte Soundfonts)
        const synth = new SpessaSynth();
        await synth.init(Tone.context);
        
        // 2. Harmonik
        let baseMidi = { "C": 60, "G": 55, "D": 62, "Am": 57, "Em": 52 }[ST.set.key] || 60;
        let isMinor = ST.set.key.includes("m");
        let chords = isMinor ? 
          [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]] : 
          [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];

        let totalBeats = 32; // 8 Takte
        let beatDur = 60 / ST.set.bpm;

        // 3. Noten planen
        for (let i = 0; i < totalBeats; i++) {
          let time = i * beatDur;
          let chordIdx = Math.floor(i / 4) % 4;
          let chordNotes = chords[chordIdx];

          Tone.Transport.schedule((t) => {
            try {
              // Piano / Akkord
              if (ST.set.selectedInstruments.includes("piano") && (i % 4 === 0 || i % 4 === 2)) {
                chordNotes.forEach(n => {
                  synth.noteOn(0, baseMidi + n + 12, 100, t);
                  synth.noteOff(0, baseMidi + n + 12, t + beatDur * 1.8);
                });
              }
              // Bass
              if (ST.set.selectedInstruments.includes("bass")) {
                synth.noteOn(1, baseMidi + chordNotes[0] - 12, 100, t);
                synth.noteOff(1, baseMidi + chordNotes[0] - 12, t + beatDur * 0.9);
              }
              // Streicher
              if (ST.set.selectedInstruments.includes("strings") && i % 4 === 0) {
                chordNotes.forEach(n => {
                  synth.noteOn(2, baseMidi + n, 80, t);
                  synth.noteOff(2, baseMidi + n, t + beatDur * 3.8);
                });
              }
              // Drums (falls ausgewählt)
              if (ST.set.selectedInstruments.includes("drums")) {
                if (i % 4 === 0) synth.noteOn(9, 36, 100, t); // Kick
                if (i % 4 === 2) synth.noteOn(9, 38, 80, t); // Snare
              }
            } catch(e){}
          }, time);
        }

        // 4. Gesang mit VocalSynthEngine (echter Gesang)
        if (window.VocalSynthEngine) {
          let engine = new window.VocalSynthEngine();
          await engine.init(Tone.context);
          
          let words = ST.set.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
          let wordsPerBeat = 2;
          let wordCount = Math.min(words.length, totalBeats * wordsPerBeat);

          for (let w = 0; w < wordCount; w++) {
            let word = words[w];
            let time = w * (beatDur / wordsPerBeat);
            Tone.Transport.schedule((t) => {
              // Die Engine rendert den Gesang asynchron und spielt ihn ab
              engine.sing(word, {
                pitch: ST.set.vocalPitch || 1.0,
                rate: ST.set.vocalRate || 1.0,
                voice: ST.set.voiceType
              }).then(audioBuffer => {
                let source = Tone.context.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(masterGain);
                source.start(t);
              });
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
  console.log("🦚 musik.js v2.0 geladen — PRO MAX FOUNDATION (Tone.js + SpessaSynth + Vocal)");
})();
