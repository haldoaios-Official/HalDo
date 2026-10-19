/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v3.0) · PRO MAX ULTIMATE
   Tone.js + WebAudioFont · KI-Text-Editor · Voll ausgestattet
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- 1. BIBLIOTHEKEN LADEN (Stabil) ---
  function loadLibraries() {
    return new Promise(async (resolve) => {
      if (!window.Tone) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      if (!window.WebAudioFontPlayer) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      // Eine breite Palette an Instrumenten laden
      const instrumentLibs = [
        "0250_SoundBlasterOld_sf2", // Acoustic Grand Piano
        "0330_SoundBlasterOld_sf2", // Electric Bass (finger)
        "0120_SoundBlasterOld_sf2", // String Ensemble 1
        "0300_SoundBlasterOld_sf2", // Acoustic Guitar (nylon)
        "0050_SoundBlasterOld_sf2", // Flute
        "0400_SoundBlasterOld_sf2", // Brass Section
        "0240_SoundBlasterOld_sf2", // Drawbar Organ
        "0420_SoundBlasterOld_sf2", // Alto Sax
        "0560_SoundBlasterOld_sf2", // Trumpet
        "0730_SoundBlasterOld_sf2", // Piccolo
        "1050_SoundBlasterOld_sf2", // Banjo
        "1090_SoundBlasterOld_sf2", // Bagpipe
        "1150_SoundBlasterOld_sf2", // Steel Drums
        "1190_SoundBlasterOld_sf2", // Melodic Tom
        "1200_SoundBlasterOld_sf2"  // Synth Drum
      ];
      
      for (let name of instrumentLibs) {
        if (!window['_tone_' + name]) {
          await new Promise(r => {
            let s = document.createElement('script');
            s.src = `https://surikov.github.io/webaudiofontdata/sound/${name}.js`;
            s.onload = r;
            s.onerror = r; // Ignorieren, falls eins fehlt
            document.head.appendChild(s);
          });
        }
      }
      resolve();
    });
  }

  // --- 2. DATEN (Riesen-Auswahl) ---
  const GENRES = [
    "Pop", "Rock", "EDM", "R&B", "Hip-Hop", "Jazz", "Blues", "Metal", "Punk", "Disco", "Dance",
    "Latin", "Reggae", "Country", "Folk", "Klassik", "Romantik", "Barock", "Oper",
    "Stran", "Helbest", "Dengbêj", "Arabesk", "Türkü", "Halay", "Orientale", "Türk Sanat Müziği", "Türk Halk Müziği",
    "Cinematic", "Ambient", "Synthwave", "Lo-Fi", "Ezidi", "Kurdisch", "Asiatisch", "Indisch", "Chinesisch", "Japanisch", "Balkan", "Europäisch", "USA"
  ];

  const MOODS = [
    "Happy", "Hype", "Nostalgisch", "Cinematic", "Hard", "Lyrical", "Traurig", "Chill", 
    "Depressiv", "Slow", "Dark", "Episch", "Romantisch", "Melancholisch", "Energiegeladen", "Verträumt",
    "Aggressiv", "Hoffnungsvoll", "Sehnsüchtig", "Feierlich", "Entspannt", "Motivierend", "Geheimnisvoll", "Verspielt"
  ];

  // General MIDI Instrumente mit deutschen Namen
  const INSTRUMENTS = {
    piano: { name: "Klavier", icon: "🎹", varName: "_tone_0250_SoundBlasterOld_sf2" },
    bass: { name: "Bass", icon: "🎸", varName: "_tone_0330_SoundBlasterOld_sf2" },
    strings: { name: "Streicher", icon: "🎻", varName: "_tone_0120_SoundBlasterOld_sf2" },
    guitar: { name: "Gitarre", icon: "🎸", varName: "_tone_0300_SoundBlasterOld_sf2" },
    flute: { name: "Flöte", icon: "🪈", varName: "_tone_0050_SoundBlasterOld_sf2" },
    brass: { name: "Bläser", icon: "🎺", varName: "_tone_0400_SoundBlasterOld_sf2" },
    organ: { name: "Orgel", icon: "🎹", varName: "_tone_0240_SoundBlasterOld_sf2" },
    sax: { name: "Saxophon", icon: "🎷", varName: "_tone_0420_SoundBlasterOld_sf2" },
    trumpet: { name: "Trompete", icon: "🎺", varName: "_tone_0560_SoundBlasterOld_sf2" },
    piccolo: { name: "Piccolo", icon: "🪈", varName: "_tone_0730_SoundBlasterOld_sf2" },
    banjo: { name: "Banjo", icon: "🪕", varName: "_tone_1050_SoundBlasterOld_sf2" },
    bagpipe: { name: "Dudelsack", icon: "🎺", varName: "_tone_1090_SoundBlasterOld_sf2" },
    steelDrums: { name: "Steel Drums", icon: "🥁", varName: "_tone_1150_SoundBlasterOld_sf2" },
    melodicTom: { name: "Melodic Tom", icon: "🥁", varName: "_tone_1190_SoundBlasterOld_sf2" },
    synthDrum: { name: "Synth Drum", icon: "🥁", varName: "_tone_1200_SoundBlasterOld_sf2" }
  };

  // --- 3. HAUPT-RENDER-FUNKTION ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var defaultSet = {
      genre: "Pop", mood: "Happy", bpm: 100, key: "C",
      lyrics: "", songDesc: "",
      voiceType: "female", voiceURI: "", vocalPitch: 1.0, vocalRate: 1.0,
      selectedInstruments: ["piano", "bass", "strings", "drums"],
      trackVol: { piano: 0.8, bass: 0.6, strings: 0.5, guitar: 0.5, flute: 0.5, brass: 0.5, organ: 0.5, sax: 0.5, trumpet: 0.5, piccolo: 0.5, banjo: 0.5, bagpipe: 0.5, steelDrums: 0.5, melodicTom: 0.5, synthDrum: 0.5, drums: 0.7 },
      fxReverb: 0.3, fxDelay: 0.2, fxChorus: 0.0, fxDist: 0.0
    };
    var ST = {
      set: Object.assign({}, defaultSet, store.get("settings", {})),
      isPlaying: false,
      toneStarted: false
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
          
          // KI-Text-Editor Buttons
          + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
          + '<button class="btn" id="ki_gen" style="flex:1;font-size:11px">✨ Generieren</button>'
          + '<button class="btn sec" id="ki_correct" style="flex:1;font-size:11px">✅ Korrigieren</button>'
          + '<button class="btn sec" id="ki_rewrite" style="flex:1;font-size:11px">🔄 Umformulieren</button>'
          + '<button class="btn sec" id="ki_translate" style="flex:1;font-size:11px">🌍 Übersetzen</button>'
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
          + '<option value="D" '+ (s.key==="D"?"selected":"") +'>D-Dur</option>'
          + '<option value="Am" '+ (s.key==="Am"?"selected":"") +'>A-Moll</option>'
          + '<option value="Em" '+ (s.key==="Em"?"selected":"") +'>E-Moll</option>'
          + '<option value="Bm" '+ (s.key==="Bm"?"selected":"") +'>B-Moll</option>'
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
        // Drums als Spezialfall
        let isDrumSelected = s.selectedInstruments.includes("drums");
        body += '<button type="button" data-instr="drums" style="padding:12px 4px;background:' + (isDrumSelected ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (isDrumSelected ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:11px;font-weight:800">'
          + '<div style="font-size:20px;margin-bottom:4px">🥁</div>Drums</button>';

        body += '</div></div>';
      }

      /* ═══════════ TAB 3: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Multi-Track Mixer</h3>';
        s.selectedInstruments.forEach(inst => {
          let name = inst === "drums" ? "Drums" : INSTRUMENTS[inst]?.name || inst;
          body += sliderRow("🎹 " + name, "vol_" + inst, s.trackVol[inst] || 0.5);
        });
        if (s.selectedInstruments.length === 0) {
            body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Wähle zuerst Instrumente aus!</div>';
        }
        body += '</div>';
      }

      /* ═══════════ TAB 4: EFFEKTE ═══════════ */
      if(tab === "fx"){
        body += '<div class="card"><h3>✨ Raum & Effekte</h3>'
          + sliderRow("🏛️ Hall (Reverb)", "fx_reverb", s.fxReverb)
          + sliderRow("📢 Echo (Delay)", "fx_delay", s.fxDelay)
          + sliderRow("🌊 Chorus", "fx_chorus", s.fxChorus)
          + sliderRow("⚡ Distortion", "fx_dist", s.fxDist)
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

        // KI-Text-Editor Funktionen
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

        container.querySelector("#ki_translate").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          var text = container.querySelector("#ki_lyrics").value.trim();
          if (!text) return alert("Kein Text zum Übersetzen!");
          stat.style.display = "block"; stat.textContent = "⏳ KI übersetzt...";
          this.disabled = true;
          try {
            // Beispiel: Übersetzung ins Englische (kann später dynamisch sein)
            var translated = await HalDo.AI.translate(text, "Englisch");
            container.querySelector("#ki_lyrics").value = translated;
            s.lyrics = translated; save(); stat.textContent = "✅ Text übersetzt!";
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
        ["reverb", "delay", "chorus", "dist"].forEach(fx => {
          let slider = container.querySelector("#fx_" + fx);
          if (slider) slider.addEventListener("input", function(){
            s["fx" + fx.charAt(0).toUpperCase() + fx.slice(1)] = this.value / 100;
            container.querySelector("#v_fx_" + fx).textContent = this.value + "%";
            if (window._haldoFX) {
              if (fx === "reverb") window._haldoFX.reverb.wet.value = s.fxReverb;
              if (fx === "delay") window._haldoFX.delay.wet.value = s.fxDelay;
              if (fx === "chorus") window._haldoFX.chorus.wet.value = s.fxChorus;
              if (fx === "dist") window._haldoFX.dist.wet.value = s.fxDist;
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
      if (ST.set.selectedInstruments.length === 0) return alert("Bitte wähle mindestens ein Instrument aus!");
      
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

        // Master & FX Setup (mit Tone.js)
        const masterGain = new Tone.Gain(1).toDestination();
        
        const reverb = new Tone.Reverb({ decay: 2.5, wet: ST.set.fxReverb }).connect(masterGain);
        const delay = new Tone.FeedbackDelay("8n", 0.5).connect(masterGain); delay.wet.value = ST.set.fxDelay;
        const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(masterGain); chorus.wet.value = ST.set.fxChorus;
        const dist = new Tone.Distortion(0.8).connect(masterGain); dist.wet.value = ST.set.fxDist;
        
        window._haldoFX = { reverb, delay, chorus, dist };

        // Track Gains
        const trackGains = {};
        ST.set.selectedInstruments.forEach(inst => {
          trackGains[inst] = new Tone.Gain(ST.set.trackVol[inst] || 0.5).connect(reverb).connect(masterGain);
        });
        window._haldoTracks = trackGains;

        // Player initialisieren
        const player = new WebAudioFontPlayer();

        // Harmonik
        let baseMidi = { "C": 60, "G": 55, "D": 62, "Am": 57, "Em": 52, "Bm": 59 }[ST.set.key] || 60;
        let isMinor = ST.set.key.includes("m");
        let chords = isMinor ? 
          [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]] : 
          [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];

        let totalBeats = 32;
        let beatDur = 60 / ST.set.bpm;

        // Noten planen
        for (let i = 0; i < totalBeats; i++) {
          let time = i * beatDur;
          let chordIdx = Math.floor(i / 4) % 4;
          let chordNotes = chords[chordIdx];

          Tone.Transport.schedule((t) => {
            try {
              // Piano (Akkord)
              if (trackGains.piano && (i % 4 === 0 || i % 4 === 2)) {
                chordNotes.forEach(n => {
                  player.queueWaveTable(Tone.context, trackGains.piano, window._tone_0250_SoundBlasterOld_sf2, t, baseMidi + n + 12, beatDur * 1.8, 0.8);
                });
              }
              // Bass
              if (trackGains.bass) {
                player.queueWaveTable(Tone.context, trackGains.bass, window._tone_0330_SoundBlasterOld_sf2, t, baseMidi + chordNotes[0] - 12, beatDur * 0.9, 0.9);
              }
              // Strings
              if (trackGains.strings && i % 4 === 0) {
                chordNotes.forEach(n => {
                  player.queueWaveTable(Tone.context, trackGains.strings, window._tone_0120_SoundBlasterOld_sf2, t, baseMidi + n, beatDur * 3.8, 0.6);
                });
              }
              // Gitarre
              if (trackGains.guitar && i % 2 === 1) {
                player.queueWaveTable(Tone.context, trackGains.guitar, window._tone_0300_SoundBlasterOld_sf2, t, baseMidi + chordNotes[1] + 12, beatDur * 0.8, 0.7);
              }
              // Flöte
              if (trackGains.flute && i % 4 === 3) {
                player.queueWaveTable(Tone.context, trackGains.flute, window._tone_0050_SoundBlasterOld_sf2, t, baseMidi + chordNotes[2] + 24, beatDur * 0.9, 0.5);
              }
              // Drums (vereinfacht)
              if (trackGains.drums) {
                if (i % 4 === 0) player.queueWaveTable(Tone.context, trackGains.drums, window._tone_0330_SoundBlasterOld_sf2, t, 36, 0.1, 0.8); // Kick
                if (i % 4 === 2) player.queueWaveTable(Tone.context, trackGains.drums, window._tone_0330_SoundBlasterOld_sf2, t, 38, 0.1, 0.6); // Snare
              }
            } catch(e){ console.warn(e); }
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
  console.log("🦚 musik.js v3.0 geladen — PRO MAX ULTIMATE");
})();
