/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v400) · PRO MAX
   Echte Instrumente · Echte Stimmen · KI-Texte · Arrangement
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Instrumente laden
  function loadInstruments(){
    return new Promise((resolve) => {
      if(window.WebAudioFontPlayer) return resolve();
      let s1 = document.createElement('script');
      s1.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
      s1.onload = () => {
        // Lade eine Auswahl an Instrumenten (Piano, Bass, Drums, Synth)
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

    // Standard-Einstellungen
    var ST = {
      ki: store.get("ki", {
        songDesc: "", lyrics: "",
        lang: "de", style: "pop", mood: "fröhlich",
        voiceURI: "", tempo: 110
      })
    };

    function save(){ store.set("ki", ST.ki); }

    function build(){
      var k = ST.ki;
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '<button class="tab' + (tab === "settings" ? " active" : "") + '" data-mtab="settings">⚙️</button>'
        + '</div>';

      /* ═══ STUDIO ═══ */
      if(tab === "studio"){
        
        // 1. Songtext & KI
        body += '<div class="card"><h3>📝 Songtext</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Freiheit...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Songtext hier eingeben..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<div style="display:flex;gap:6px;margin-top:8px">'
          + '<button class="btn" id="ki_gen" style="flex:1;font-size:11px">✨ KI Songtext</button>'
          + '<button class="btn sec" id="ki_clear" style="font-size:11px">🗑️</button>'
          + '</div>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        // 2. Sprache & Stil
        body += '<div class="card"><h3>🎵 Sprache & Stil</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
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

        // 3. Stimme (aus dem Browser)
        body += '<div class="card"><h3>🎤 Sänger(in) wählen</h3>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">';
        
        // Stimmen laden
        var voices = window.speechSynthesis.getVoices();
        var currentLangPrefix = k.lang === "ku" ? "tr" : k.lang; // Fallback für Kurdisch
        
        if(voices.length === 0) {
          body += '<option value="">Lade Stimmen...</option>';
        } else {
          var filtered = voices.filter(v => v.lang.startsWith(currentLangPrefix));
          if(filtered.length === 0) filtered = voices; // Fallback auf alle
          
          filtered.forEach(function(v){
            body += '<option value="' + _esc(v.voiceURI) + '"' + (k.voiceURI === v.voiceURI ? " selected" : "") + '>'
              + _esc(v.name) + ' (' + _esc(v.lang) + ')</option>';
          });
        }
        body += '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '</div>';

        // 4. Generieren & Abspielen
        body += '<div class="card">'
          + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:16px">▶️ Song produzieren & abspielen</button>'
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
        // Inputs speichern
        container.querySelector("#ki_desc").addEventListener("input", function(){ k.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ k.lyrics = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ k.lang = this.value; save(); build(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ k.style = this.value; save(); });
        container.querySelector("#ki_voice").addEventListener("change", function(){ k.voiceURI = this.value; save(); });

        // KI Text generieren
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ HalDo KI schreibt... (dauert 10-30s)";
          this.disabled = true;

          try {
            if(!HalDo.AI) throw new Error("KI nicht geladen");
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch", "ku": "Kurdisch (Kurmanji)" };
            var targetLang = langMap[k.lang] || "Deutsch";
            
            var text = await HalDo.AI.writeLyrics(k.songDesc || "Liebe", targetLang, k.style, "emotional");
            container.querySelector("#ki_lyrics").value = text;
            k.lyrics = text;
            save();
            stat.textContent = "✅ Text fertig!";
          } catch(e) {
            stat.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });

        // Stimme testen
        container.querySelector("#ki_testVoice").addEventListener("click", function(){
          var voiceURI = k.voiceURI;
          var u = new SpeechSynthesisUtterance("Hallo, so klinge ich.");
          var voices = window.speechSynthesis.getVoices();
          var selectedVoice = voices.find(v => v.voiceURI === voiceURI);
          if(selectedVoice) u.voice = selectedVoice;
          window.speechSynthesis.speak(u);
        });

        // Song produzieren
        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!k.lyrics) return alert("Bitte gib zuerst einen Songtext ein oder generiere einen!");
          
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
            var bpm = k.style === "edm" ? 128 : 100;
            var beatDur = 60 / bpm;
            var startTime = audioCtx.currentTime + 0.2; // Kleiner Puffer

            // Einfache Akkordfolge (C - G - Am - F)
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
            
            var words = k.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            var voices = window.speechSynthesis.getVoices();
            var selectedVoice = voices.find(v => v.voiceURI === k.voiceURI);

            // Wörter auf die Beats verteilen (max 4 Wörter pro Takt)
            var wordsPerBeat = 2; 
            var wordCount = Math.min(words.length, totalBeats * wordsPerBeat);
            
            for(var w = 0; w < wordCount; w++) {
              var word = words[w];
              var wTime = startTime + (w * (beatDur / wordsPerBeat));
              
              // Timeout nutzen, da SpeechSynthesis nicht direkt an AudioContext gekoppelt ist
              setTimeout(function(wordText, timeOffset) {
                var u = new SpeechSynthesisUtterance(wordText);
                if(selectedVoice) u.voice = selectedVoice;
                
                // Tonhöhe leicht variieren für Melodie-Gefühl
                u.pitch = 1.0 + (Math.sin(timeOffset) * 0.2); 
                u.rate = 1.1;
                window.speechSynthesis.speak(u);
              }.bind(null, word, w), (wTime - audioCtx.currentTime) * 1000);
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
      }

      if(tab === "settings"){
        container.querySelector("#clear_ai").addEventListener("click", function(){
          ST.ki = { songDesc: "", lyrics: "", lang: "de", style: "pop", mood: "fröhlich", voiceURI: "", tempo: 110 };
          save(); build();
        });
      }
    }

    // Stimmen laden triggern (asynchron im Browser)
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = build;
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v400 geladen — PRO MAX Arrangement");
})();
