/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v610) · PRO MAX
   smplr (Instrumente) · pocket-tts-js (Stimme) · KI-Texte
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // 1. smplr (Instrumente) laden
  function loadSmplr() {
    return new Promise((resolve) => {
      if (window.smplr) return resolve();
      let s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        import { SplendidGrandPiano, DrumMachine, Soundfont } from "https://unpkg.com/smplr@0.17.1/dist/index.mjs";
        window.smplr = { SplendidGrandPiano, DrumMachine, Soundfont };
        window.dispatchEvent(new Event('smplr-ready'));
      `;
      document.head.appendChild(s);
      window.addEventListener('smplr-ready', resolve, { once: true });
    });
  }

  // 2. pocket-tts-js (Stimme) laden
  function loadTTS() {
    return new Promise((resolve) => {
      if (window.PocketTTS) return resolve();
      let s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        import { PocketTTS, StreamingPlayer } from "https://cdn.jsdelivr.net/npm/pocket-tts-js@0.1.0/dist/index.mjs";
        window.PocketTTS = PocketTTS;
        window.StreamingPlayer = StreamingPlayer;
        window.dispatchEvent(new Event('tts-ready'));
      `;
      document.head.appendChild(s);
      window.addEventListener('tts-ready', resolve, { once: true });
    });
  }

  var audioCtx = null;

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
        // Songtext & KI
        body += '<div class="card"><h3>📝 Songtext</h3>'
          + '<input type="text" id="ki_desc" placeholder="Thema (z.B. Liebe, Freiheit...)" value="' + _esc(k.songDesc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<textarea id="ki_lyrics" rows="5" placeholder="Text hier eingeben..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<button class="btn full" id="ki_gen" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:8px;padding:8px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
          + '</div>';

        // Stimme
        body += '<div class="card"><h3>🎤 Stimme (pocket-tts-js)</h3>'
          + '<select id="ki_voice" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">'
          + '<option value="alba">Alba (Weiblich)</option>'
          + '<option value="sven">Sven (Männlich)</option>'
          + '</select>'
          + '<button class="btn sec full" id="ki_testVoice" style="font-size:11px">🔊 Stimme testen</button>'
          + '</div>';

        // Arrangement
        body += '<div class="card"><h3>🎵 Arrangement</h3>'
          + '<div style="display:flex;gap:8px;margin-bottom:10px">'
          + '<div style="flex:1"><label style="font-size:10px;color:var(--text-mute);font-weight:800">BPM</label>'
          + '<input type="number" id="ki_bpm" value="' + (k.bpm || 100) + '" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px"></div>'
          + '<div style="flex:1"><label style="font-size:10px;color:var(--text-mute);font-weight:800">STIL</label>'
          + '<select id="ki_style" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:inherit;font-size:12px">'
          + '<option value="pop">Pop</option><option value="rock">Rock</option><option value="stran">🦚 Stran</option>'
          + '</select></div>'
          + '</div>'
          + '<button class="btn full" id="ki_play" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:16px">▶️ Song produzieren</button>'
          + '<button class="btn danger full" id="ki_stop" style="margin-top:8px;font-size:14px;padding:14px">⏹ Stoppen</button>'
          + '<div id="play_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px;text-align:center"></div>'
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
        container.querySelector("#ki_bpm").addEventListener("change", function(){ ki.bpm = parseInt(this.value) || 100; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ ki.style = this.value; save(); });
        container.querySelector("#ki_voice").addEventListener("change", function(){ ki.voice = this.value; save(); });

        // KI Songtext
        container.querySelector("#ki_gen").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          stat.style.display = "block";
          stat.textContent = "⏳ KI schreibt...";
          this.disabled = true;
          try {
            var langMap = { "de": "Deutsch", "en": "Englisch", "tr": "Türkisch" };
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

        // Song produzieren
        container.querySelector("#ki_play").addEventListener("click", async function(){
          if(!ki.lyrics) return alert("Bitte erst einen Songtext eingeben!");
          var btn = this;
          var stat = container.querySelector("#play_status");
          btn.disabled = true;
          stat.style.display = "block";
          stat.textContent = "⏳ Lade Profi-Instrumente & Stimme...";

          try {
            await Promise.all([loadSmplr(), loadTTS()]);
            if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(audioCtx.state === "suspended") await audioCtx.resume();

            var { SplendidGrandPiano, DrumMachine } = window.smplr;
            var piano = SplendidGrandPiano(audioCtx);
            var drums = DrumMachine(audioCtx, { instrument: "TR-808" });
            await piano.load;
            stat.textContent = "🎶 Instrumente geladen. Starte Arrangement...";

            // Sequencer (vereinfacht: direktes Timing)
            var bpm = ki.bpm || 100;
            var beatDur = 60 / bpm;
            var startTime = audioCtx.currentTime + 0.5;
            var chords = [["C4", "E4", "G4"], ["G3", "B3", "D4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"]];

            for (var i = 0; i < 16; i++) {
              var t = startTime + (i * beatDur * 2); // Jede 2 Beats ein Akkord
              var chord = chords[i % 4];
              chord.forEach(note => piano.start({ note: note, time: t, duration: beatDur * 1.8 }));
              drums.start({ note: "kick", time: t });
              drums.start({ note: "snare", time: t + beatDur });
            }

            // Gesang (pocket-tts-js)
            stat.textContent = "🎤 Stimme wird initialisiert...";
            var tts = new window.PocketTTS({ language: "german_2026-04", quantized: true, voiceCloning: false });
            await tts.load();
            var player = new window.StreamingPlayer({ sampleRate: tts.sampleRate });
            await player.resume();

            var voice = await tts.loadVoice(ki.voice || "alba");
            var words = ki.lyrics.replace(/\[.*?\]/g, '').replace(/\n/g, ' ').trim().split(/\s+/).filter(w => w.length > 0);

            stat.textContent = "🎤 Stimme singt...";
            for (let w = 0; w < words.length; w++) {
              let word = words[w];
              let wTime = startTime + (w * (beatDur / 2));
              setTimeout(async () => {
                await tts.generate(word, {
                  voice: voice,
                  onChunk: (audio, meta) => player.play(audio, meta)
                });
                player.flush();
              }, (wTime - audioCtx.currentTime) * 1000);
            }

            stat.textContent = "▶️ Song läuft!";
            setTimeout(() => {
              btn.disabled = false;
              stat.textContent = "✅ Song beendet.";
            }, (words.length * (beatDur / 2) * 1000) + 3000);

          } catch(e) {
            console.error(e);
            alert("Fehler: " + e.message);
            btn.disabled = false;
            stat.textContent = "❌ Fehler beim Abspielen";
          }
        });

        // Stop
        container.querySelector("#ki_stop").addEventListener("click", function(){
          if(audioCtx) { audioCtx.close(); audioCtx = null; }
          container.querySelector("#play_status").textContent = "⏹ Gestoppt.";
          container.querySelector("#ki_play").disabled = false;
        });
      }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v610 geladen — PRO MAX (Fixed)");
})();
