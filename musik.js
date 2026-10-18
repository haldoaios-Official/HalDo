/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v820) · ULTIMATE PRO
   WebAudioFont (Instrumente) · TTS (Stimme) · Mixer · KI
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
    var tab = store.get("tab", "ki");

    // SICHERER DEFAULT-STATE (verhindert NaN und undefined Fehler)
    var defaultKi = {
      lyrics: "", songDesc: "", lang: "de", voiceURI: "", style: "pop", bpm: 100,
      volPiano: 0.8, volBass: 0.6, volStrings: 0.4
    };
    var savedKi = store.get("ki", {});
    var ST = {
      ki: Object.assign({}, defaultKi, savedKi)
    };

    function save(){ store.set("ki", ST.ki); }

    function build(){
      var k = ST.ki;
      // Sicherheits-Check für BPM
      k.bpm = Math.max(40, Math.min(200, parseFloat(k.bpm) || 100));

      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "ki" ? " active" : "") + '" data-mtab="ki">🤖 KI & Text</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "voice" ? " active" : "") + '" data-mtab="voice">🎤 Gesang</button>'
        + '</div>';

      /* ═══ 1. KI & TEXT ═══ */
      if(tab === "ki"){
        body += '<div class="card"><h3>📝 Songtext</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Heimweh...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Schreibe hier deinen Text oder nutze die KI..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        body += '<div class="card"><h3>🌍 Sprache & Stil</h3>'
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
          + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">GESCHWINDIGKEIT (BPM)</label>'
          + '<input type="number" id="ki_bpm" value="' + k.bpm + '" min="40" max="200" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '</div>';
      }

      /* ═══ 2. MIXER ═══ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Instrumenten-Mixer</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:12px">Regle die Lautstärke der einzelnen Spuren:</div>'
          
          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>🎹 Klavier / Melodie</span><span id="v_piano">' + Math.round(k.volPiano*100) + '%</span></div>'
          + '<input type="range" id="vol_piano" min="0" max="100" value="' + Math.round(k.volPiano*100) + '" style="width:100%">'
          + '</div>'

          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>🎸 Bass</span><span id="v_bass">' + Math.round(k.volBass*100) + '%</span></div>'
          + '<input type="range" id="vol_bass" min="0" max="100" value="' + Math.round(k.volBass*100) + '" style="width:100%">'
          + '</div>'

          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px"><span>🎻 Streicher / Fläche</span><span id="v_strings">' + Math.round(k.volStrings*100) + '%</span></div>'
          + '<input type="range" id="vol_strings" min="0" max="100" value="' + Math.round(k.volStrings*100) + '" style="width:100%">'
          + '</div>'
          + '</div>';
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

      /* ═══ PLAY BUTTON (Immer sichtbar) ═══ */
      body += '<div class="card" style="position:sticky;bottom:0;background:var(--bg-2);z-index:10;border-top:1px solid var(--border-soft);margin-bottom:0">'
        + '<div style="display:flex;gap:8px">'
        + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:14px">▶️ Song produzieren</button>'
        + '<button class="btn danger full" id="ki_stop" style="font-size:15px;padding:14px;width:80px">⏹</button>'
        + '</div>'
        + '<div id="play_status" style="display:none;margin-top:10px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
        + '</div>';

      container.innerHTML = body;

      /* ═══ EVENTS ═══ */
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){ tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      // KI Tab Events
      if(tab === "ki"){
        container.querySelector("#ki_desc").addEventListener("input", function(){ k.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ k.lyrics = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ k.lang = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ k.style = this.value; save(); });
        container.querySelector("#ki_bpm").addEventListener("change", function(){ 
          k.bpm = Math.max(40, Math.min(200, parseFloat(this.value) || 100)); 
          this.value = k.bpm;
          save(); 
        });

        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ HalDo KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch", "ku": "Kurdisch" };
            var text = await HalDo.AI.writeLyrics(k.songDesc || "Liebe", langMap[k.lang] || "Deutsch", k.style, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            k.lyrics = text;
            save();
            stat.textContent = "✅ Text fertig!";
          } catch(e) { stat.textContent = "❌ " + e.message; }
          this.disabled = false;
        });
      }

      // Mixer Tab Events
      if(tab === "mixer"){
        ["piano", "bass", "strings"].forEach(function(inst){
          var slider = container.querySelector("#vol_" + inst);
          var label = container.querySelector("#v_" + inst);
          if(slider) {
            slider.addEventListener("input", function() {
              var val = this.value / 100;
              k["vol" + inst.charAt(0).toUpperCase() + inst.slice(1)] = val;
              label.textContent = this.value + "%";
              save();
            });
          }
        });
      }

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

      // Play Button
      container.querySelector("#ki_play").addEventListener("click", async function(){
        if(!k.lyrics) { tab = "ki"; build(); return alert("Bitte erst einen Songtext eingeben!"); }
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

          await new Promise(r => setTimeout(r, 200));
          
          var bpm = k.bpm || 100;
          var beatDur = 60 / bpm;
          var startTime = audioCtx.currentTime + 1.0; 

          // SICHERE GAIN-NODES (verhindert NaN Fehler)
          var gainPiano = audioCtx.createGain(); gainPiano.gain.value = Number(k.volPiano) || 0.8; gainPiano.connect(audioCtx.destination);
          var gainBass = audioCtx.createGain(); gainBass.gain.value = Number(k.volBass) || 0.6; gainBass.connect(audioCtx.destination);
          var gainStrings = audioCtx.createGain(); gainStrings.gain.value = Number(k.volStrings) || 0.4; gainStrings.connect(audioCtx.destination);

          var chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
          stat.textContent = "🎶 Musik läuft...";

          var totalBeats = 32; 
          for(var i = 0; i < totalBeats; i++) {
            var t = startTime + (i * beatDur);
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
          var words = k.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
          var voices = window.speechSynthesis.getVoices();
          var selectedVoice = voices.find(v => v.voiceURI === k.voiceURI);

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
        var stat = container.querySelector("#play_status");
        if(stat) stat.textContent = "⏹ Gestoppt.";
        var btn = container.querySelector("#ki_play");
        if(btn) btn.disabled = false;
      });
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v820 geladen — ULTIMATE PRO");
})();
