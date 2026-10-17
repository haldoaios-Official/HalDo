/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v600) · PRO MAX
   smplr (Instrumente) · pocket-tts-js (Gesang) · KI-Texte
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Lade smplr und pocket-tts-js dynamisch
  function loadLibraries() {
    return new Promise((resolve) => {
      let s1 = document.createElement('script');
      s1.type = 'module';
      s1.textContent = `
        import { SplendidGrandPiano, DrumMachine, Sequencer, Reverb, renderOffline } from "https://unpkg.com/smplr/dist/index.mjs";
        window.smplr = { SplendidGrandPiano, DrumMachine, Sequencer, Reverb, renderOffline };
        window.dispatchEvent(new Event('smplr-loaded'));
      `;
      document.head.appendChild(s1);

      window.addEventListener('smplr-loaded', () => {
        let s2 = document.createElement('script');
        s2.type = 'module';
        s2.textContent = `
          import { PocketTTS, StreamingPlayer } from "https://cdn.jsdelivr.net/npm/pocket-tts-js/dist/index.mjs";
          window.PocketTTS = PocketTTS;
          window.StreamingPlayer = StreamingPlayer;
          window.dispatchEvent(new Event('tts-loaded'));
        `;
        document.head.appendChild(s2);
      }, { once: true });

      window.addEventListener('tts-loaded', resolve, { once: true });
    });
  }

  var audioCtx = null;
  var tts = null;
  var player = null;

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      ki: store.get("ki", {
        lyrics: "", songDesc: "", lang: "de", voice: "alba", bpm: 100
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

        // 2. Stimme (pocket-tts-js)
        body += '<div class="card"><h3>🎤 Stimme (pocket-tts-js)</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Wähle eine eingebaute Stimme oder klone deine eigene:</div>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<option value="alba">Alba (Weiblich)</option>'
          + '<option value="sven">Sven (Männlich)</option>'
          + '<option value="klone">Eigene Stimme klonen...</option>'
          + '</select>'
          + '<input type="file" id="voice_clone_file" accept="audio/*" style="display:none">'
          + '<button class="btn sec full" id="ki_clone_voice" style="font-size:11px">📤 Eigene Stimme hochladen (Klonen)</button>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px;margin-top:8px">🔊 Stimme testen</button>'
          + '</div>';

        // 3. Arrangement & Play
        body += '<div class="card"><h3>🎵 Arrangement</h3>'
          + '<div style="display:flex;gap:8px;margin-bottom:10px">'
          + '<div style="flex:1"><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="ki_bpm" value="' + k.bpm + '" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '<div style="flex:1"><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIL</label>'
          + '<select id="ki_style" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="pop">Pop</option><option value="rock">Rock</option><option value="stran">🦚 Stran</option>'
          + '</select></div>'
          + '</div>'
          + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:16px">▶️ Song produzieren</button>'
          + '<button class="btn danger full" id="ki_stop" style="margin-top:8px;font-size:14px;padding:14px">⏹ Stoppen</button>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:10px;line-height:1.5">'
          + 'ℹ️ <b>Hinweis:</b> Dies ist eine Simulation. Die KI spricht den Text, sie singt keine Melodien. Für echten Gesang braucht man riesige KI-Server (wie Suno).'
          + '</div>'
          + '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){ tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });

      if(tab === "studio"){
        var ki = ST.ki;
        
        container.querySelector("#ki_desc").addEventListener("input", function(){ ki.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ ki.lyrics = this.value; save(); });
        container.querySelector("#ki_bpm").addEventListener("change", function(){ ki.bpm = parseInt(this.value); save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ ki.style = this.value; save(); });

        // KI Songtext
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch", "ar": "Arabisch" };
            var text = await HalDo.AI.writeLyrics(ki.songDesc || "Liebe", langMap[ki.lang] || "Deutsch", ki.style || "Pop", "emotional");
            container.querySelector("#ki_lyrics").value = text;
            ki.lyrics = text;
            save();
            stat.textContent = "✅ Text fertig!";
          } catch(e) {
            stat.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });

        // Stimme klonen
        container.querySelector("#ki_clone_voice").addEventListener("click", function(){
          container.querySelector("#voice_clone_file").click();
        });
        container.querySelector("#voice_clone_file").addEventListener("change", async function(){
          var file = this.files[0];
          if(!file) return;
          if(!tts) {
            alert("Bitte zuerst die TTS-Engine laden (Song produzieren klicken).");
            return;
          }
          try {
            var arrayBuffer = await file.arrayBuffer();
            await tts.cloneVoice(arrayBuffer);
            alert("✅ Stimme geklont!");
          } catch(e) {
            alert("Fehler beim Klonen: " + e.message);
          }
        });

        // Song produzieren
        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!ki.lyrics) return alert("Bitte erst einen Songtext eingeben!");
          var btn = this;
          var stat = container.querySelector("#play_status");
          btn.disabled = true;
          stat.style.display = "block";
          stat.textContent = "⏳ Lade Bibliotheken...";

          try {
            await loadLibraries();
            if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(audioCtx.state === "suspended") await audioCtx.resume();

            var { SplendidGrandPiano, DrumMachine, Sequencer, Reverb } = window.smplr;

            // Instrumente laden
            stat.textContent = "⏳ Lade Instrumente...";
            var piano = SplendidGrandPiano(audioCtx);
            var drums = DrumMachine(audioCtx, { instrument: "TR-808" });
            await piano.load;

            // Sequencer erstellen
            var seq = Sequencer(audioCtx, { bpm: ki.bpm, loop: false });

            // Einfaches Arrangement
            var chords = [["C4", "E4", "G4"], ["G3", "B3", "D4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"]];
            var pianoNotes = [];
            var drumNotes = [];
            for(var i = 0; i < 8; i++) {
              var chord = chords[i % 4];
              chord.forEach(note => {
                pianoNotes.push({ note: note, at: (i+1) + ":1", duration: "2n" });
              });
              drumNotes.push({ note: "kick", at: (i+1) + ":1" });
              drumNotes.push({ note: "snare", at: (i+1) + ":3" });
            }

            seq.addTrack(piano, pianoNotes);
            seq.addTrack(drums, drumNotes);
            seq.start();

            // Gesang (pocket-tts-js)
            stat.textContent = "🎤 Stimme wird synchronisiert...";
            if(!tts) {
              tts = new window.PocketTTS({ language: "german_2026-04" });
              await tts.load();
              player = new window.StreamingPlayer({ sampleRate: tts.sampleRate });
              await player.resume();
            }

            var words = ki.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);
            var beatDur = 60 / ki.bpm;
            
            for(var w = 0; w < words.length; w++) {
              var word = words[w];
              var wTime = (w * beatDur) * 1000;
              setTimeout(async function(wordText) {
                var voice = await tts.loadVoice(ki.voice || "alba");
                await tts.generate(wordText, {
                  voice: voice,
                  onChunk: (audio) => player.play(audio)
                });
                player.flush();
              }.bind(null, word), wTime);
            }

            stat.textContent = "▶️ Song läuft!";
            
            setTimeout(function() {
              btn.disabled = false;
              stat.textContent = "✅ Song beendet.";
            }, (words.length * beatDur * 1000) + 2000);

          } catch(e) {
            alert("Fehler: " + e.message);
            btn.disabled = false;
            stat.textContent = "❌ Fehler beim Abspielen";
          }
        });

        // Stop
        container.querySelector("#ki_stop").addEventListener("click", function(){
          if(player) player.stop();
          if(audioCtx) { audioCtx.close(); audioCtx = null; }
          tts = null;
          player = null;
          container.querySelector("#play_status").textContent = "⏹ Gestoppt.";
          container.querySelector("#ki_play").disabled = false;
        });
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v600 geladen — PRO MAX BETA");
})();
