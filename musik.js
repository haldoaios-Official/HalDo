/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v900) · PRO MAX ULTIMATE
   Multi-Track · Mixer · Effekte · KI (Magenta) · Gesang
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
      // WebAudioFont (Instrumente)
      if(!window.WebAudioFontPlayer) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      // Instrumenten-Samples laden
      if(!window._tone_0250_SoundBlasterOld_sf2) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      if(!window._tone_0330_SoundBlasterOld_sf2) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofontdata/sound/0330_SoundBlasterOld_sf2.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      if(!window._tone_0120_SoundBlasterOld_sf2) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofontdata/sound/0120_SoundBlasterOld_sf2.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }

      // Magenta.js (KI-Musik) - Optional, falls verfügbar
      if(!window.mm) {
        try {
          await new Promise((r, reject) => {
            let s = document.createElement('script');
            s.src = "https://cdn.jsdelivr.net/npm/@magenta/music@1.23.0/es6/core.js";
            s.onload = () => {
              let s2 = document.createElement('script');
              s2.src = "https://cdn.jsdelivr.net/npm/@magenta/music@1.23.0/es6/music_rnn.js";
              s2.onload = r;
              s2.onerror = reject;
              document.head.appendChild(s2);
            };
            s.onerror = reject;
            document.head.appendChild(s);
          });
        } catch(e) { console.warn("Magenta.js konnte nicht geladen werden (KI-Melodien deaktiviert)."); }
      }

      // Cantor Digitalis (Gesang) - Optional
      if(!window.CantorDigitalis) {
        try {
          await new Promise((r, reject) => {
            let s = document.createElement('script');
            s.type = 'module';
            s.textContent = `
              import { Voice, generateSynthParams } from "https://cdn.jsdelivr.net/npm/cantor-digitalis@0.0.6/+esm";
              window.CantorDigitalis = { Voice, generateSynthParams };
              window.dispatchEvent(new Event('cantor-ready'));
            `;
            document.head.appendChild(s);
            window.addEventListener('cantor-ready', r, { once: true });
          });
        } catch(e) { console.warn("Cantor Digitalis konnte nicht geladen werden (Vokal-Gesang deaktiviert)."); }
      }

      resolve();
    });
  }

  // --- 2. AUDIO ENGINE (Multi-Track Architektur) ---
  class AudioEngine {
    constructor() {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      // Spuren (Tracks) mit eigenen GainNodes für den Mixer
      this.tracks = {
        piano:   { gain: this.ctx.createGain(), instrument: null },
        bass:    { gain: this.ctx.createGain(), instrument: null },
        strings: { gain: this.ctx.createGain(), instrument: null },
        drums:   { gain: this.ctx.createGain(), instrument: null }
      };
      
      for (let t in this.tracks) {
        this.tracks[t].gain.connect(this.masterGain);
        this.tracks[t].gain.gain.value = 0.8; // Standard-Lautstärke
      }

      // Effekte (Reverb, Delay)
      this.reverb = this.ctx.createConvolver();
      this.delay = this.ctx.createDelay(1.0);
      this.delay.delayTime.value = 0.3;
      this.fxGain = this.ctx.createGain();
      this.fxGain.gain.value = 0.3;
      
      // Reverb-Impulsantwort (einfach)
      this.reverb.buffer = this._createImpulseResponse(2.0, 0.5);
      this.reverb.connect(this.fxGain);
      this.delay.connect(this.fxGain);
      this.fxGain.connect(this.masterGain);
    }

    _createImpulseResponse(duration, decay) {
      let rate = this.ctx.sampleRate;
      let length = rate * duration;
      let impulse = this.ctx.createBuffer(2, length, rate);
      for (let i = 0; i < 2; i++) {
        let channel = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
          channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
        }
      }
      return impulse;
    }

    setTrackVolume(track, value) {
      if (this.tracks[track]) {
        this.tracks[track].gain.gain.value = Math.max(0, Math.min(1, value));
      }
    }

    sendToReverb(track, amount) {
      if (this.tracks[track]) {
        let send = this.ctx.createGain();
        send.gain.value = amount;
        this.tracks[track].gain.connect(send);
        send.connect(this.reverb);
      }
    }

    sendToDelay(track, amount) {
      if (this.tracks[track]) {
        let send = this.ctx.createGain();
        send.gain.value = amount;
        this.tracks[track].gain.connect(send);
        send.connect(this.delay);
      }
    }

    playNote(track, midiNote, time, duration, velocity) {
      if (this.tracks[track] && this.tracks[track].instrument) {
        let player = new WebAudioFontPlayer();
        player.queueWaveTable(this.ctx, this.tracks[track].gain, this.tracks[track].instrument, time, midiNote, duration, velocity);
      }
    }
  }

  // --- 3. HAUPT-RENDER-FUNKTION ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      engine: null,
      ki: store.get("ki", {
        lyrics: "", songDesc: "", lang: "de", voiceURI: "", style: "pop", bpm: 100,
        volPiano: 0.8, volBass: 0.6, volStrings: 0.4, volDrums: 0.7,
        reverbAmount: 0.3, delayAmount: 0.2, melodyStyle: "pop"
      })
    };

    function save(){ store.set("ki", ST.ki); }

    function initEngine() {
      if (!ST.engine) {
        ST.engine = new AudioEngine();
        // Instrumente zuweisen
        if (window._tone_0250_SoundBlasterOld_sf2) ST.engine.tracks.piano.instrument = _tone_0250_SoundBlasterOld_sf2;
        if (window._tone_0330_SoundBlasterOld_sf2) ST.engine.tracks.bass.instrument = _tone_0330_SoundBlasterOld_sf2;
        if (window._tone_0120_SoundBlasterOld_sf2) ST.engine.tracks.strings.instrument = _tone_0120_SoundBlasterOld_sf2;
      }
    }

    function build(){
      var k = ST.ki;
      if(!k.bpm) k.bpm = 100;

      var body = '';

      // TABS
      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "effects" ? " active" : "") + '" data-mtab="effects">✨ Effekte</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '</div>';

      /* ═══ 1. STUDIO (KI & Text & Play) ═══ */
      if(tab === "studio"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Heimweh...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="5" placeholder="Schreibe hier deinen Text..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        body += '<div class="card"><h3>🎵 Arrangement</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIL</label>'
          + '<select id="ki_style" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="pop"' + (k.style==="pop"?" selected":"") + '>Pop</option>'
          + '<option value="rock"' + (k.style==="rock"?" selected":"") + '>Rock</option>'
          + '<option value="stran"' + (k.style==="stran"?" selected":"") + '>🦚 Stran</option>'
          + '<option value="arabesk"' + (k.style==="arabesk"?" selected":"") + '>🇹🇷 Arabesk</option>'
          + '<option value="edm"' + (k.style==="edm"?" selected":"") + '>EDM</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="ki_bpm" value="' + k.bpm + '" min="40" max="200" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '</div>'
          + '</div>';

        // Play-Button (sticky)
        body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">▶️ Song produzieren</button>'
          + '<button class="btn danger full" id="ki_stop" style="font-size:15px;padding:14px;width:80px">⏹</button>'
          + '</div>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      /* ═══ 2. MIXER ═══ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Mixer</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:12px">Lautstärke der einzelnen Spuren anpassen:</div>'
          + sliderRow("🎹 Klavier", "vol_piano", "v_piano", k.volPiano)
          + sliderRow("🎸 Bass", "vol_bass", "v_bass", k.volBass)
          + sliderRow("🎻 Streicher", "vol_strings", "v_strings", k.volStrings)
          + sliderRow("🥁 Drums (Synth)", "vol_drums", "v_drums", k.volDrums)
          + '</div>';
      }

      /* ═══ 3. EFFEKTE ═══ */
      if(tab === "effects"){
        body += '<div class="card"><h3>✨ Raum & Effekte</h3>'
          + sliderRow("🏛️ Hall (Reverb)", "fx_reverb", "v_reverb", k.reverbAmount)
          + sliderRow("📢 Echo (Delay)", "fx_delay", "v_delay", k.delayAmount)
          + '</div>';
      }

      /* ═══ 4. GESANG ═══ */
      if(tab === "voice"){
        body += '<div class="card"><h3>🎤 Sänger(in) wählen</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Wähle aus allen Stimmen deines Computers:</div>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:10px;line-height:1.5">'
          + 'ℹ️ <b>Hinweis:</b> Die Browser-Stimme ist eine Vorlese-Stimme. Sie spricht den Text rhythmisch zur Musik, kann aber nicht wie ein Popstar Melodien singen.'
          + '</div></div>';
      }

      container.innerHTML = body;

      // Event-Listener für Tabs
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){ tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      // --- EVENT-BINDINGS ---
      if(tab === "studio"){
        container.querySelector("#ki_desc").addEventListener("input", function(){ k.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ k.lyrics = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ k.style = this.value; save(); });
        container.querySelector("#ki_bpm").addEventListener("change", function(){ 
          k.bpm = Math.max(40, Math.min(200, parseFloat(this.value) || 100)); 
          this.value = k.bpm; save(); 
        });

        // KI Songtext
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ HalDo KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch", "ku": "Kurdisch" };
            var text = await HalDo.AI.writeLyrics(k.songDesc || "Liebe", langMap[k.lang] || "Deutsch", k.style, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            k.lyrics = text; save(); stat.textContent = "✅ Text fertig!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        // Play
        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!k.lyrics) return alert("Bitte erst einen Songtext eingeben!");
          var btn = this;
          var stat = container.querySelector("#play_status");
          btn.disabled = true;
          stat.style.display = "block";
          stat.textContent = "⏳ Lade Instrumente & Engine...";

          try {
            await loadLibraries();
            initEngine();
            if (ST.engine.ctx.state === "suspended") await ST.engine.ctx.resume();

            // Mixer-Werte anwenden
            ST.engine.setTrackVolume("piano", k.volPiano);
            ST.engine.setTrackVolume("bass", k.volBass);
            ST.engine.setTrackVolume("strings", k.volStrings);
            ST.engine.setTrackVolume("drums", k.volDrums);
            
            // Effekte anwenden
            ST.engine.sendToReverb("piano", k.reverbAmount);
            ST.engine.sendToDelay("strings", k.delayAmount);

            var bpm = k.bpm;
            var beatDur = 60 / bpm;
            var startTime = ST.engine.ctx.currentTime + 1.0; 

            var chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
            stat.textContent = "🎶 Musik läuft...";

            var totalBeats = 32; 
            for(var i = 0; i < totalBeats; i++) {
              var t = startTime + (i * beatDur);
              if(t > ST.engine.ctx.currentTime) {
                var chord = chords[Math.floor(i / 4) % 4];
                
                // Bass
                ST.engine.playNote("bass", chord[0] - 24, t, beatDur * 0.9, 0.8);
                
                // Piano & Strings
                if(i % 4 === 0 || i % 4 === 2) {
                  chord.forEach(n => {
                    ST.engine.playNote("piano", n, t, beatDur * 1.8, 0.7);
                    ST.engine.playNote("strings", n + 12, t, beatDur * 1.8, 0.5);
                  });
                }

                // Einfache Drums (Kick & Snare)
                if (i % 4 === 0) ST.engine.playNote("drums", 36, t, 0.1, 0.8); // Kick
                if (i % 4 === 2) ST.engine.playNote("drums", 38, t, 0.1, 0.6); // Snare
              }
            }

            // Gesang (TTS)
            stat.textContent = "🎤 Stimme wird synchronisiert...";
            var words = k.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            var voices = window.speechSynthesis.getVoices();
            var selectedVoice = voices.find(v => v.voiceURI === k.voiceURI);

            var wordsPerBeat = 2; 
            var wordCount = Math.min(words.length, totalBeats * wordsPerBeat);
            
            for(var w = 0; w < wordCount; w++) {
              var word = words[w];
              var wTime = startTime + (w * (beatDur / wordsPerBeat));
              var delay = Math.max(0, (wTime - ST.engine.ctx.currentTime) * 1000);
              
              setTimeout(function(wordText) {
                var u = new SpeechSynthesisUtterance(wordText);
                if(selectedVoice) u.voice = selectedVoice;
                u.pitch = 1.0 + (Math.random() * 0.2); 
                u.rate = 1.1;
                window.speechSynthesis.speak(u);
              }.bind(null, word), delay);
            }

            stat.textContent = "▶️ Song läuft!";
            setTimeout(function() {
              btn.disabled = false;
              stat.textContent = "✅ Song beendet.";
            }, (totalBeats * beatDur * 1000) + 2000);

          } catch(e) {
            alert("Fehler: " + e.message);
            btn.disabled = false;
            stat.textContent = "❌ Fehler beim Abspielen";
          }
        });

        container.querySelector("#ki_stop").addEventListener("click", function(){
          window.speechSynthesis.cancel();
          if(ST.engine && ST.engine.ctx) { ST.engine.ctx.close(); ST.engine = null; }
          var stat = container.querySelector("#play_status");
          if(stat) stat.textContent = "⏹ Gestoppt.";
          var btn = container.querySelector("#ki_play");
          if(btn) btn.disabled = false;
        });
      }

      // Mixer & Effekte Events
      ["piano", "bass", "strings", "drums"].forEach(inst => {
        let slider = container.querySelector("#vol_" + inst);
        let label = container.querySelector("#v_" + inst);
        if(slider) {
          slider.addEventListener("input", function() {
            let val = this.value / 100;
            k["vol" + inst.charAt(0).toUpperCase() + inst.slice(1)] = val;
            label.textContent = this.value + "%";
            if(ST.engine) ST.engine.setTrackVolume(inst, val);
            save();
          });
        }
      });

      ["reverb", "delay"].forEach(fx => {
        let slider = container.querySelector("#fx_" + fx);
        let label = container.querySelector("#v_" + fx);
        if(slider) {
          slider.addEventListener("input", function() {
            let val = this.value / 100;
            k[fx + "Amount"] = val;
            label.textContent = this.value + "%";
            // Effekt-Sends live aktualisieren (falls Engine läuft)
            if(ST.engine) {
              if(fx === "reverb") ST.engine.sendToReverb("piano", val);
              if(fx === "delay") ST.engine.sendToDelay("strings", val);
            }
            save();
          });
        }
      });

      // Voice Tab Events
      if(tab === "voice"){
        var voiceSelect = container.querySelector("#ki_voice");
        function populateVoices() {
          var voices = window.speechSynthesis.getVoices();
          if(voices.length === 0) { setTimeout(populateVoices, 500); return; }
          voiceSelect.innerHTML = "";
          voices.forEach(function(v){
            var opt = document.createElement("option");
            opt.value = v.voiceURI;
            opt.textContent = v.name + " (" + v.lang + ")";
            if(k.voiceURI === v.voiceURI) opt.selected = true;
            voiceSelect.appendChild(opt);
          });
        }
        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;
        voiceSelect.addEventListener("change", function(){ k.voiceURI = this.value; save(); });

        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          var voices = window.speechSynthesis.getVoices();
          var selected = voices.find(v => v.voiceURI === k.voiceURI);
          if(!selected) return alert("Bitte wähle zuerst eine Stimme aus!");
          var u = new SpeechSynthesisUtterance("Hallo, so klinge ich.");
          u.voice = selected;
          window.speechSynthesis.speak(u);
        });
      }
    }

    // Hilfsfunktion für Slider
    function sliderRow(label, id, labelId, value) {
      return '<div style="margin-bottom:12px">'
        + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>' + label + '</span><span id="' + labelId + '">' + Math.round(value*100) + '%</span></div>'
        + '<input type="range" id="' + id + '" min="0" max="100" value="' + Math.round(value*100) + '" style="width:100%">'
        + '</div>';
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v900 geladen — PRO MAX ULTIMATE");
})();
