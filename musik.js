/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v700) · STABLE & FEATURE-RICH
   WebAudioFont (Instrumente) · Native TTS (Stimme) · KI
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Sicheres Laden von WebAudioFont
  function loadInstruments() {
    return new Promise((resolve) => {
      if(window.WebAudioFontPlayer) return resolve();
      let s1 = document.createElement('script');
      s1.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
      s1.onload = () => {
        // Piano, Bass, Drums laden
        let s2 = document.createElement('script');
        s2.src = "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js"; // Piano
        s2.onload = () => {
          let s3 = document.createElement('script');
          s3.src = "https://surikov.github.io/webaudiofontdata/sound/0330_SoundBlasterOld_sf2.js"; // Bass
          s3.onload = () => {
            let s4 = document.createElement('script');
            s4.src = "https://surikov.github.io/webaudiofontdata/sound/0120_SoundBlasterOld_sf2.js"; // Strings/Chords
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
        lyrics: "", songDesc: "", lang: "de", voiceURI: "", style: "pop", bpm: 100
      })
    };

    function save(){ store.set("ki", ST.ki); }

    function build(){
      var k = ST.ki;
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "settings" ? " active" : "") + '" data-mtab="settings">⚙️ Einstellungen</button>'
        + '</div>';

      /* ═══ STUDIO ═══ */
      if(tab === "studio"){
        // 1. Songtext & KI
        body += '<div class="card"><h3>📝 Songtext</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Freiheit...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="5" placeholder="Text hier eingeben..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        // 2. Sprache & Stil
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
          + '</div></div>';

        // 3. Stimme (ALLE 346 Stimmen laden!)
        body += '<div class="card"><h3>🎤 Sänger(in) wählen</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Wähle aus allen Stimmen deines Computers:</div>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '</div>';

        // 4. Instrumente (Auswahl)
        var instrs = [
          ["piano", "🎹", "Klavier"], ["bass", "🎸", "Bass"], ["strings", "🎻", "Streicher"]
        ];
        body += '<div class="card"><h3>🎼 Instrumente</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">';
        instrs.forEach(function(it){
          // Alle sind standardmäßig an
          body += '<button type="button" style="padding:10px 3px;background:linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2));border:1px solid var(--p1);border-radius:8px;color:inherit;font-family:inherit;text-align:center;font-size:10px;font-weight:800">'
            + '<div style="font-size:16px;margin-bottom:2px">' + it[1] + '</div>' + it[2] + '</button>';
        });
        body += '</div></div>';

        // 5. Play Button
        body += '<div class="card">'
          + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:16px">▶️ Song produzieren & abspielen</button>'
          + '<button class="btn danger full" id="ki_stop" style="margin-top:8px;font-size:14px;padding:14px">⏹ Stoppen</button>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '</div>';
      }

      /* ═══ SETTINGS ═══ */
      if(tab === "settings"){
        body += '<div class="card"><h3>⚙️ Info</h3>'
          + '<p style="font-size:12px;color:var(--text-dim);line-height:1.6">Dieses Studio nutzt echte Instrumenten-Samples (WebAudioFont) für die Musik und die Browser-Sprachausgabe für den Gesang. Die KI schreibt den Text.</p>'
          + '<button class="btn danger full" id="clear_ai" style="margin-top:10px">🗑️ KI Cache leeren</button>'
          + '</div>';
      }

      container.innerHTML = body;

      /* ═══ EVENTS ═══ */
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.mtab; store.set("tab", tab); build();
        });
      });

      if(tab === "studio"){
        var ki = ST.ki;
        var voiceSelect = container.querySelector("#ki_voice");

        // --- Stimmen laden (asynchron) ---
        function populateVoices() {
          var voices = window.speechSynthesis.getVoices();
          if(voices.length === 0) {
            setTimeout(populateVoices, 500); // Nochmal versuchen
            return;
          }
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

        // Inputs speichern
        container.querySelector("#ki_desc").addEventListener("input", function(){ ki.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ ki.lyrics = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ ki.lang = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ ki.style = this.value; save(); });
        voiceSelect.addEventListener("change", function(){ ki.voiceURI = this.value; save(); });

        // KI Songtext generieren
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ HalDo KI schreibt... (10-30s)";
          this.disabled = true;

          try {
            if(!HalDo.AI) throw new Error("KI nicht geladen");
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch", "ku": "Kurdisch (Kurmanji)" };
            var targetLang = langMap[ki.lang] || "Deutsch";
            
            var text = await HalDo.AI.writeLyrics(ki.songDesc || "Liebe", targetLang, ki.style, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            ki.lyrics = text;
            save();
            stat.textContent = "✅ Text fertig!";
          } catch(e) {
            stat.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });

        // Stimme testen
        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          var voices = window.speechSynthesis.getVoices();
          var selected = voices.find(v => v.voiceURI === ki.voiceURI);
          if(!selected) return alert("Bitte wähle zuerst eine Stimme aus!");
          var u = new SpeechSynthesisUtterance("Hallo, so klinge ich.");
          u.voice = selected;
          window.speechSynthesis.speak(u);
        });

        // Song produzieren
        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!ki.lyrics) return alert("Bitte gib zuerst einen Songtext ein oder generiere einen!");
          
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

            // Arrangement-Parameter
            var bpm = ki.bpm || 100;
            var beatDur = 60 / bpm;
            var startTime = audioCtx.currentTime + 0.5; // Puffer

            // Akkordfolge (C - G - Am - F)
            var chords = [
              [60, 64, 67], // C
              [55, 59, 62], // G
              [57, 60, 64], // Am
              [53, 57, 60]  // F
            ];

            stat.textContent = "🎶 Musik wird arrangiert...";

            // 8 Takte Instrumental spielen
            var totalBeats = 32; 
            for(var i = 0; i < totalBeats; i++) {
              var t = startTime + (i * beatDur);
              var chord = chords[Math.floor(i / 4) % 4]; // Alle 4 Beats neuer Akkord
              
              // Bass (jeden Beat)
              player.queueWaveTable(audioCtx, audioCtx.destination, bass, t, chord[0] - 24, beatDur * 0.9);
              
              // Chords (Beat 1 und 3)
              if(i % 4 === 0 || i % 4 === 2) {
                chord.forEach(n => {
                  player.queueWaveTable(audioCtx, audioCtx.destination, piano, t, n, beatDur * 1.8);
                  player.queueWaveTable(audioCtx, audioCtx.destination, strings, t, n + 12, beatDur * 1.8);
                });
              }
            }

            // Gesang (Text in Wörter zerlegen)
            stat.textContent = "🎤 Stimme wird synchronisiert...";
            
            var words = ki.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            var voices = window.speechSynthesis.getVoices();
            var selectedVoice = voices.find(v => v.voiceURI === ki.voiceURI);

            // Wörter auf die Beats verteilen (max 4 Wörter pro Takt)
            var wordsPerBeat = 2; 
            var wordCount = Math.min(words.length, totalBeats * wordsPerBeat);
            
            for(var w = 0; w < wordCount; w++) {
              var word = words[w];
              var wTime = startTime + (w * (beatDur / wordsPerBeat));
              
              // Timeout nutzen, da SpeechSynthesis nicht direkt an AudioContext gekoppelt ist
              setTimeout(function(wordText) {
                var u = new SpeechSynthesisUtterance(wordText);
                if(selectedVoice) u.voice = selectedVoice;
                
                // Tonhöhe leicht variieren für Melodie-Gefühl
                u.pitch = 1.0 + (Math.random() * 0.3); 
                u.rate = 1.1;
                window.speechSynthesis.speak(u);
              }.bind(null, word), (wTime - audioCtx.currentTime) * 1000);
            }

            stat.textContent = "▶️ Song läuft!";
            
            // Ende erkennen
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

        // Stop
        container.querySelector("#ki_stop").addEventListener("click", function(){
          window.speechSynthesis.cancel();
          if(audioCtx) {
            audioCtx.close();
            audioCtx = null;
          }
          container.querySelector("#play_status").textContent = "⏹ Gestoppt.";
          container.querySelector("#ki_play").disabled = false;
        });
      }

      if(tab === "settings"){
        container.querySelector("#clear_ai").addEventListener("click", function(){
          ST.ki = { lyrics: "", songDesc: "", lang: "de", voiceURI: "", style: "pop", bpm: 100 };
          save(); build();
        });
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v700 geladen — STABLE & FEATURE-RICH");
})();
