/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v500) · HONEST & FUNCTIONAL
   Echte Stimmen-Auswahl · Echte Instrumente · KI-Text
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function loadInstruments(){
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
          s3.onload = resolve;
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
        lyrics: "", songDesc: "", lang: "de", voiceURI: ""
      })
    };

    function save(){ store.set("ki", ST.ki); }

    function build(){
      var k = ST.ki;
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎛️ Studio</button>'
        + '</div>';

      if(tab === "studio"){
        // 1. Songtext
        body += '<div class="card"><h3>📝 Songtext (Lokal)</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Freiheit...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="5" placeholder="Text hier eingeben..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        // 2. Stimme (ALLE 346 Stimmen laden!)
        body += '<div class="card"><h3>🎤 Stimme wählen</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Wähle aus <b>allen</b> Stimmen deines Computers:</div>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<option value="">Lade Stimmen...</option>'
          + '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '</div>';

        // 3. Play & Instrumental
        body += '<div class="card">'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="ki_play" style="flex:1;background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:14px;padding:14px">▶️ Song produzieren</button>'
          + '<button class="btn danger" id="ki_stop" style="font-size:14px;padding:14px">⏹</button>'
          + '</div>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:10px;line-height:1.5">'
          + 'ℹ️ <b>Hinweis:</b> Die Browser-Stimme ist eine Vorlese-Stimme (wie ein Navi). Sie spricht den Text im Takt der Musik, kann aber nicht wie ein echter Popstar singen (dafür braucht man riesige KI-Server wie Suno).'
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

        // Stimmen laden (asynchron)
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

        container.querySelector("#ki_desc").addEventListener("input", function(){ ki.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ ki.lyrics = this.value; save(); });
        voiceSelect.addEventListener("change", function(){ ki.voiceURI = this.value; save(); });

        // KI Songtext
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch" };
            var text = await HalDo.AI.writeLyrics(ki.songDesc || "Liebe", langMap[ki.lang] || "Deutsch", "Pop", "emotional");
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
            player.loader.decodeAfterLoading(audioCtx, '_tone_0250_SoundBlasterOld_sf2');
            player.loader.decodeAfterLoading(audioCtx, '_tone_0330_SoundBlasterOld_sf2');

            var bpm = 100;
            var beatDur = 60 / bpm;
            var startTime = audioCtx.currentTime + 0.2;

            // Akkorde: C - G - Am - F
            var chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];

            // 8 Takte spielen
            var totalBeats = 32; 
            for(var i = 0; i < totalBeats; i++) {
              var t = startTime + (i * beatDur);
              var chord = chords[Math.floor(i / 4) % 4]; // Akkord alle 4 Beats wechseln
              
              // Bass (jeden Beat)
              player.queueWaveTable(audioCtx, audioCtx.destination, bass, t, chord[0] - 24, beatDur * 0.9);
              
              // Klavier (Beat 1 und 3)
              if(i % 4 === 0 || i % 4 === 2) {
                chord.forEach(n => {
                  player.queueWaveTable(audioCtx, audioCtx.destination, piano, t, n, beatDur * 1.8);
                });
              }
            }

            // Stimme
            stat.textContent = "🎤 Stimme wird synchronisiert...";
            var words = ki.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            var voices = window.speechSynthesis.getVoices();
            var selectedVoice = voices.find(v => v.voiceURI === ki.voiceURI);

            var wordsPerBeat = 2; 
            var wordCount = Math.min(words.length, totalBeats * wordsPerBeat);
            
            for(var w = 0; w < wordCount; w++) {
              var word = words[w];
              var wTime = startTime + (w * (beatDur / wordsPerBeat));
              
              setTimeout(function(wordText) {
                var u = new SpeechSynthesisUtterance(wordText);
                if(selectedVoice) u.voice = selectedVoice;
                u.pitch = 1.0; // Normale Tonhöhe
                u.rate = 1.2;  // Etwas schneller für Takt-Gefühl
                window.speechSynthesis.speak(u);
              }.bind(null, word), (wTime - audioCtx.currentTime) * 1000);
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

        // Stop Button
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
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v500 geladen — HONEST & FUNCTIONAL");
})();
