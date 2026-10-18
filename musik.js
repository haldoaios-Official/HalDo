/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v910) · FINAL STABLE
   Auto-Unlock Audio · NaN-Schutz · Multi-Track
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- 1. AUTO-UNLOCK FÜR AUDIO (WICHTIG!) ---
  // Browser blockieren Audio, bis der Nutzer einmal geklickt hat.
  var _audioUnlocked = false;
  function unlockAudio() {
    if (_audioUnlocked) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume().then(function() { _audioUnlocked = true; });
      } else {
        _audioUnlocked = true;
      }
      // Silent Buffer abspielen, um zu entsperren
      var buf = ctx.createBuffer(1, 1, 22050);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch(e) { console.warn("Audio Unlock Fehler:", e); }
  }
  // Bei jedem Klick entsperren
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });


  // --- 2. BIBLIOTHEKEN LADEN ---
  function loadLibraries() {
    return new Promise(async (resolve) => {
      if(!window.WebAudioFontPlayer) {
        await new Promise(r => {
          let s = document.createElement('script');
          s.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
          s.onload = r;
          document.head.appendChild(s);
        });
      }
      const instruments = [
        "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js",
        "https://surikov.github.io/webaudiofontdata/sound/0330_SoundBlasterOld_sf2.js",
        "https://surikov.github.io/webaudiofontdata/sound/0120_SoundBlasterOld_sf2.js"
      ];
      for (const url of instruments) {
        const varName = url.match(/(\d+)_SoundBlasterOld_sf2\.js/)[1];
        if (!window['_tone_' + varName + '_SoundBlasterOld_sf2']) {
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


  // --- 3. HAUPT-RENDER-FUNKTION ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var defaultKi = {
      lyrics: "", songDesc: "", lang: "de", voiceURI: "", style: "pop", bpm: 100,
      volPiano: 0.8, volBass: 0.6, volStrings: 0.4, volDrums: 0.7
    };
    var savedKi = store.get("ki", {});
    var ST = {
      ki: Object.assign({}, defaultKi, savedKi),
      engine: null // Wird beim ersten Play initialisiert
    };

    function save(){ store.set("ki", ST.ki); }

    function initEngine() {
      if (!ST.engine) {
        try {
          ST.engine = {
            ctx: new (window.AudioContext || window.webkitAudioContext)(),
            masterGain: null,
            tracks: {}
          };
          ST.engine.masterGain = ST.engine.ctx.createGain();
          ST.engine.masterGain.connect(ST.engine.ctx.destination);
          
          ["piano", "bass", "strings", "drums"].forEach(t => {
            ST.engine.tracks[t] = { gain: ST.engine.ctx.createGain() };
            ST.engine.tracks[t].gain.connect(ST.engine.masterGain);
            ST.engine.tracks[t].gain.gain.value = ST.ki["vol" + t.charAt(0).toUpperCase() + t.slice(1)] || 0.5;
          });
        } catch(e) {
          console.error("Engine Init Fehler:", e);
          return false;
        }
      }
      // Kontext wieder aufwecken
      if (ST.engine.ctx.state === "suspended") {
        ST.engine.ctx.resume();
      }
      return true;
    }

    function build(){
      var k = ST.ki;
      k.bpm = Math.max(40, Math.min(200, parseFloat(k.bpm) || 100));

      var body = '';

      // TABS
      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '</div>';

      /* ═══ 1. STUDIO ═══ */
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
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="ki_bpm" value="' + k.bpm + '" min="40" max="200" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '</div></div>';

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
        body += '<div class="card"><h3>🎚️ Mixer</h3>';
        ["piano", "bass", "strings", "drums"].forEach(inst => {
          body += sliderRow(
            "🎹 " + inst.charAt(0).toUpperCase() + inst.slice(1),
            "vol_" + inst,
            "v_" + inst,
            k["vol" + inst.charAt(0).toUpperCase() + inst.slice(1)]
          );
        });
        body += '</div>';
      }

      /* ═══ 3. GESANG ═══ */
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

      // Tabs binden
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){ tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      // Studio Events
      if(tab === "studio"){
        container.querySelector("#ki_desc").addEventListener("input", function(){ k.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ k.lyrics = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ k.style = this.value; save(); });
        container.querySelector("#ki_bpm").addEventListener("change", function(){ 
          k.bpm = Math.max(40, Math.min(200, parseFloat(this.value) || 100)); 
          this.value = k.bpm; save(); 
        });

        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block"; stat.textContent = "⏳ HalDo KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch", "ku": "Kurdisch" };
            var text = await HalDo.AI.writeLyrics(k.songDesc || "Liebe", langMap[k.lang] || "Deutsch", k.style, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            k.lyrics = text; save(); stat.textContent = "✅ Text fertig!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        // --- PLAY BUTTON (Der wichtigste Teil) ---
        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!k.lyrics) return alert("Bitte erst einen Songtext eingeben!");
          
          var btn = this;
          var stat = container.querySelector("#play_status");
          btn.disabled = true;
          stat.style.display = "block";
          stat.textContent = "⏳ Initialisiere Audio...";

          try {
            // 1. Audio entsperren (falls noch nicht passiert)
            unlockAudio();

            // 2. Bibliotheken laden
            await loadLibraries();
            
            // 3. Engine starten
            if (!initEngine()) throw new Error("Audio-Engine konnte nicht gestartet werden.");
            
            // 4. Auf Resume warten
            if (ST.engine.ctx.state === "suspended") {
              await ST.engine.ctx.resume();
            }

            // 5. Mixer-Werte anwenden (mit NaN-Schutz)
            ["piano", "bass", "strings", "drums"].forEach(inst => {
              let val = Number(k["vol" + inst.charAt(0).toUpperCase() + inst.slice(1)]);
              if (isNaN(val)) val = 0.5;
              if (ST.engine.tracks[inst]) {
                ST.engine.tracks[inst].gain.gain.value = Math.max(0, Math.min(1, val));
              }
            });

            // 6. Song-Parameter berechnen
            let bpm = parseFloat(k.bpm) || 100;
            let beatDur = 60 / bpm;
            
            // WICHTIG: Startzeitpunkt in der ZUKUNFT (mind. 1 Sekunde Puffer)
            let startTime = ST.engine.ctx.currentTime + 1.0;
            let totalBeats = 32; // 8 Takte
            let chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];

            stat.textContent = "🎶 Musik wird geplant...";

            // 7. Instrumental-Noten planen
            let player = new WebAudioFontPlayer();
            for (let i = 0; i < totalBeats; i++) {
              let noteTime = startTime + (i * beatDur);
              
              // Sicherheitscheck: Nur planen, wenn Zeitpunkt in der Zukunft liegt
              if (noteTime <= ST.engine.ctx.currentTime) continue;

              let chord = chords[Math.floor(i / 4) % 4];

              try {
                // Bass (jeden Beat)
                if (window._tone_0330_SoundBlasterOld_sf2) {
                  player.queueWaveTable(ST.engine.ctx, ST.engine.tracks.bass.gain, 
                    _tone_0330_SoundBlasterOld_sf2, noteTime, chord[0] - 24, beatDur * 0.9, 0.8);
                }
                // Piano & Strings (Beat 1 & 3)
                if (i % 4 === 0 || i % 4 === 2) {
                  chord.forEach(n => {
                    if (window._tone_0250_SoundBlasterOld_sf2) {
                      player.queueWaveTable(ST.engine.ctx, ST.engine.tracks.piano.gain, 
                        _tone_0250_SoundBlasterOld_sf2, noteTime, n, beatDur * 1.8, 0.7);
                    }
                    if (window._tone_0120_SoundBlasterOld_sf2) {
                      player.queueWaveTable(ST.engine.ctx, ST.engine.tracks.strings.gain, 
                        _tone_0120_SoundBlasterOld_sf2, noteTime, n + 12, beatDur * 1.8, 0.5);
                    }
                  });
                }
              } catch(err) {
                console.warn("Fehler beim Planen von Note " + i + ":", err);
              }
            }

            stat.textContent = "🎤 Stimme wird synchronisiert...";

            // 8. Gesang (TTS) planen
            window.speechSynthesis.cancel(); // Alte Utterances löschen
            let words = k.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            let voices = window.speechSynthesis.getVoices();
            let selectedVoice = voices.find(v => v.voiceURI === k.voiceURI);

            let wordsPerBeat = 2;
            let wordCount = Math.min(words.length, totalBeats * wordsPerBeat);

            for (let w = 0; w < wordCount; w++) {
              let word = words[w];
              let wordTime = startTime + (w * (beatDur / wordsPerBeat));
              let delay = Math.max(0, (wordTime - ST.engine.ctx.currentTime) * 1000);

              setTimeout(() => {
                let u = new SpeechSynthesisUtterance(word);
                if (selectedVoice) u.voice = selectedVoice;
                u.pitch = 1.0 + (Math.random() * 0.2);
                u.rate = 1.1;
                window.speechSynthesis.speak(u);
              }, delay);
            }

            stat.textContent = "▶️ Song läuft!";
            setTimeout(() => {
              btn.disabled = false;
              stat.textContent = "✅ Song beendet.";
            }, (totalBeats * beatDur * 1000) + 2000);

          } catch (e) {
            console.error("Play-Fehler:", e);
            btn.disabled = false;
            stat.textContent = "❌ " + e.message;
          }
        });

        container.querySelector("#ki_stop").addEventListener("click", function(){
          window.speechSynthesis.cancel();
          if (ST.engine && ST.engine.ctx) {
            ST.engine.ctx.close();
            ST.engine = null;
          }
          var stat = container.querySelector("#play_status");
          if (stat) stat.textContent = "⏹ Gestoppt.";
          var btn = container.querySelector("#ki_play");
          if (btn) btn.disabled = false;
        });
      }

      // Mixer Events
      if (tab === "mixer") {
        ["piano", "bass", "strings", "drums"].forEach(inst => {
          let slider = container.querySelector("#vol_" + inst);
          let label = container.querySelector("#v_" + inst);
          if (slider) {
            slider.addEventListener("input", function() {
              let val = this.value / 100;
              k["vol" + inst.charAt(0).toUpperCase() + inst.slice(1)] = val;
              label.textContent = this.value + "%";
              if (ST.engine && ST.engine.tracks[inst]) {
                ST.engine.tracks[inst].gain.gain.value = val;
              }
              save();
            });
          }
        });
      }

      // Voice Events
      if(tab === "voice"){
        var voiceSelect = container.querySelector("#ki_voice");
        function populateVoices() {
          var voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) { setTimeout(populateVoices, 500); return; }
          voiceSelect.innerHTML = "";
          voices.forEach(function(v) {
            var opt = document.createElement("option");
            opt.value = v.voiceURI;
            opt.textContent = v.name + " (" + v.lang + ")";
            if (k.voiceURI === v.voiceURI) opt.selected = true;
            voiceSelect.appendChild(opt);
          });
        }
        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;
        voiceSelect.addEventListener("change", function(){ k.voiceURI = this.value; save(); });

        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          var voices = window.speechSynthesis.getVoices();
          var selected = voices.find(v => v.voiceURI === k.voiceURI);
          if (!selected) return alert("Bitte wähle zuerst eine Stimme aus!");
          unlockAudio(); // Auch hier entsperren
          var u = new SpeechSynthesisUtterance("Hallo, so klinge ich.");
          u.voice = selected;
          window.speechSynthesis.speak(u);
        });
      }
    }

    // Hilfsfunktion für Slider
    function sliderRow(label, id, labelId, value) {
      let safeVal = Math.round((Number(value) || 0.5) * 100);
      return '<div style="margin-bottom:12px">'
        + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>' + label + '</span><span id="' + labelId + '">' + safeVal + '%</span></div>'
        + '<input type="range" id="' + id + '" min="0" max="100" value="' + safeVal + '" style="width:100%">'
        + '</div>';
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v910 geladen — FINAL STABLE");
})();
