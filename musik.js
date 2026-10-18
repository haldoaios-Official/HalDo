/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v810) · ULTIMATE FIXED
   WebAudioFont (Instrumente) · TTS (Stimme) · Zeit-Fix
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function loadInstruments() {
    return new Promise((resolve) => {
      if(window.WebAudioFontPlayer) return resolve();
      let s1 = document.createElement('script');
      s1.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
      s1.onload = () => {
        let s2 = document.createElement('script');
        s2.src = "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js"; // Piano
        s2.onload = () => {
          let s3 = document.createElement('script');
          s3.src = "https://surikov.github.io/webaudiofontdata/sound/0330_SoundBlasterOld_sf2.js"; // Bass
          s3.onload = () => {
            let s4 = document.createElement('script');
            s4.src = "https://surikov.github.io/webaudiofontdata/sound/0120_SoundBlasterOld_sf2.js"; // Strings
            s4.onload = resolve;
            document.head.appendChild(s4);
          };
          document.head.appendChild(s3);
        };
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
  }

  var audioCtx = null;

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      ki: store.get("ki", {
        lyrics: "", songDesc: "", lang: "de", voiceURI: "", style: "pop", bpm: 100,
        volPiano: 0.8, volBass: 0.6, volStrings: 0.4
      })
    };

    function save(){ store.set("ki", ST.ki); }

    function build(){
      var k = ST.ki;
      if(!k.bpm) k.bpm = 100;

      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '</div>';

      /* ═══ STUDIO ═══ */
      if(tab === "studio"){
        // 1. Songtext
        body += '<div class="card"><h3>📝 Songtext</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Freiheit...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Text hier eingeben..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        // 2. Arrangement
        body += '<div class="card"><h3>🎵 Arrangement</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">SPRACHE</label>'
          + '<select id="ki_lang" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="de"' + (k.lang==="de"?" selected":"") + '>🇩🇪 Deutsch</option>'
          + '<option value="en"' + (k.lang==="en"?" selected":"") + '>🇬🇧 English</option>'
          + '<option value="tr"' + (k.lang==="tr"?" selected":"") + '>🇹🇷 Türkçe</option>'
          + '<option value="ar"' + (k.lang==="ar"?" selected":"") + '>🇸🇦 Arabisch</option>'
          + '<option value="ku"' + (k.lang==="ku"?" selected":"") + '>🦚 Kurdisch</option>'
          + '</select></div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIL</label>'
          + '<select id="ki_style" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="pop"' + (k.style==="pop"?" selected":"") + '>Pop</option>'
          + '<option value="rock"' + (k.style==="rock"?" selected":"") + '>Rock</option>'
          + '<option value="stran"' + (k.style==="stran"?" selected":"") + '>🦚 Stran</option>'
          + '<option value="arabesk"' + (k.style==="arabesk"?" selected":"") + '>🇹🇷 Arabesk</option>'
          + '<option value="edm"' + (k.style==="edm"?" selected":"") + '>EDM</option>'
          + '</select></div>'
          + '</div>'
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="ki_bpm" value="' + k.bpm + '" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px;margin-bottom:8px"></div>'
          + '</div>';

        // 3. Stimme
        body += '<div class="card"><h3>🎤 Sänger(in)</h3>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '</div>';

        // 4. Play
        body += '<div class="card">'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:16px">▶️ Song produzieren</button>'
          + '<button class="btn danger full" id="ki_stop" style="font-size:15px;padding:16px">⏹</button>'
          + '</div>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      /* ═══ MIXER ═══ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Mixer</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:12px">Lautstärke der einzelnen Spuren anpassen:</div>'
          
          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>🎹 Klavier</span><span id="v_piano">' + Math.round(k.volPiano*100) + '%</span></div>'
          + '<input type="range" id="vol_piano" min="0" max="100" value="' + (k.volPiano*100) + '" style="width:100%">'
          + '</div>'

          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>🎸 Bass</span><span id="v_bass">' + Math.round(k.volBass*100) + '%</span></div>'
          + '<input type="range" id="vol_bass" min="0" max="100" value="' + (k.volBass*100) + '" style="width:100%">'
          + '</div>'

          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>🎻 Streicher</span><span id="v_strings">' + Math.round(k.volStrings*100) + '%</span></div>'
          + '<input type="range" id="vol_strings" min="0" max="100" value="' + (k.volStrings*100) + '" style="width:100%">'
          + '</div>'

          + '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){ tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if(tab === "studio"){
        var ki = ST.ki;
        var voiceSelect = container.querySelector("#ki_voice");

        function populateVoices() {
          var voices = window.speechSynthesis.getVoices();
          if(voices.length === 0) { setTimeout(populateVoices, 500); return; }
          voiceSelect.innerHTML = "";
          voices.forEach(function(v){
            var opt = document.createElement("option");
            opt.value = v.voiceURI;
            opt.textContent = v.name + " (" + v.lang + ")";
            if(ki.voiceURI === v.voiceURI) opt.selected = true;
            voiceSelect.appendChild(opt);
          });
        }
        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;

        container.querySelector("#ki_desc").addEventListener("input", function(){ ki.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ ki.lyrics = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ ki.lang = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ ki.style = this.value; save(); });
        container.querySelector("#ki_bpm").addEventListener("change", function(){ ki.bpm = parseInt(this.value) || 100; save(); });
        voiceSelect.addEventListener("change", function(){ ki.voiceURI = this.value; save(); });

        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ HalDo KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch", "ku": "Kurdisch (Kurmanji)" };
            var text = await HalDo.AI.writeLyrics(ki.songDesc || "Liebe", langMap[ki.lang] || "Deutsch", ki.style, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            ki.lyrics = text;
            save();
            stat.textContent = "✅ Text fertig!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });

        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          var voices = window.speechSynthesis.getVoices();
          var selected = voices.find(v => v.voiceURI === ki.voiceURI);
          if(!selected) return alert("Bitte wähle zuerst eine Stimme aus!");
          var u = new SpeechSynthesisUtterance("Hallo, so klinge ich.");
          u.voice = selected;
          window.speechSynthesis.speak(u);
        });

        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!ki.lyrics) return alert("Bitte erst einen Songtext eingeben!");
          var btn = this;
          var stat = container.querySelector("#play_status");
          btn.disabled = true;
          stat.style.display = "block";
          stat.textContent = "⏳ Lade Instrumente...";

          try {
            await loadInstruments();
            if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(audioCtx.state === "suspended") await audioCtx.resume();

            var player = new WebAudioFontPlayer();
            var piano = _tone_0250_SoundBlasterOld_sf2;
            var bass = _tone_0330_SoundBlasterOld_sf2;
            var strings = _tone_0120_SoundBlasterOld_sf2;

            player.loader.decodeAfterLoading(audioCtx, '_tone_0250_SoundBlasterOld_sf2');
            player.loader.decodeAfterLoading(audioCtx, '_tone_0330_SoundBlasterOld_sf2');
            player.loader.decodeAfterLoading(audioCtx, '_tone_0120_SoundBlasterOld_sf2');

            // VERZÖGERUNG EINBAUEN, damit AudioContext.currentTime sicher voranschreitet
            await new Promise(r => setTimeout(r, 200));
            
            var bpm = parseFloat(ki.bpm) || 100;
            var beatDur = 60 / bpm;
            
            // FIX: Absolut sicherer Startzeitpunkt (nicht in der Vergangenheit)
            var startTime = audioCtx.currentTime + 1.0; 

            var chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
            stat.textContent = "🎶 Musik läuft...";

            // Gain-Nodes für Mixer
            var gainPiano = audioCtx.createGain(); gainPiano.gain.value = ki.volPiano; gainPiano.connect(audioCtx.destination);
            var gainBass = audioCtx.createGain(); gainBass.gain.value = ki.volBass; gainBass.connect(audioCtx.destination);
            var gainStrings = audioCtx.createGain(); gainStrings.gain.value = ki.volStrings; gainStrings.connect(audioCtx.destination);

            var totalBeats = 32; 
            for(var i = 0; i < totalBeats; i++) {
              var t = startTime + (i * beatDur);
              
              // FIX: Noten nur planen, wenn sie in der Zukunft liegen
              if(t > audioCtx.currentTime) {
                var chord = chords[Math.floor(i / 4) % 4];
                
                try {
                  player.queueWaveTable(audioCtx, gainBass, bass, t, chord[0] - 24, beatDur * 0.9);
                  if(i % 4 === 0 || i % 4 === 2) {
                    chord.forEach(n => {
                      player.queueWaveTable(audioCtx, gainPiano, piano, t, n, beatDur * 1.8);
                      player.queueWaveTable(audioCtx, gainStrings, strings, t, n + 12, beatDur * 1.8);
                    });
                  }
                } catch(err) { console.warn("Audio-Fehler:", err); }
              }
            }

            stat.textContent = "🎤 Stimme wird synchronisiert...";
            var words = ki.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            var voices = window.speechSynthesis.getVoices();
            var selectedVoice = voices.find(v => v.voiceURI === ki.voiceURI);

            var wordsPerBeat = 2; 
            var wordCount = Math.min(words.length, totalBeats * wordsPerBeat);
            
            for(var w = 0; w < wordCount; w++) {
              var word = words[w];
              var wTime = startTime + (w * (beatDur / wordsPerBeat));
              var delay = Math.max(0, (wTime - audioCtx.currentTime) * 1000);
              
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
          if(audioCtx) { audioCtx.close(); audioCtx = null; }
          container.querySelector("#play_status").textContent = "⏹ Gestoppt.";
          container.querySelector("#ki_play").disabled = false;
        });
      }

      if(tab === "mixer"){
        ["piano", "bass", "strings"].forEach(function(inst){
          var slider = container.querySelector("#vol_" + inst);
          var label = container.querySelector("#v_" + inst);
          if(slider) {
            slider.addEventListener("input", function() {
              var val = this.value / 100;
              ki["vol" + inst.charAt(0).toUpperCase() + inst.slice(1)] = val;
              label.textContent = this.value + "%";
              save();
            });
          }
        });
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v810 geladen — ULTIMATE FIXED");
})();
