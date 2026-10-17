/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v300) · FULL KI-STUDIO
   KI Songtexte · WebAudioFont Instrumente · Gesang
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Lade WebAudioFont dynamisch, falls noch nicht da
  function loadWebAudioFont(){
    return new Promise((resolve) => {
      if(window.WebAudioFontPlayer) return resolve();
      let s1 = document.createElement('script');
      s1.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js";
      s1.onload = () => {
        let s2 = document.createElement('script');
        s2.src = "https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js";
        s2.onload = resolve;
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
  }

  var audioCtx = null;

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "ki");

    var ST = {
      playlist: store.get("playlist", []),
      current: store.get("current", -1),
      ki: store.get("ki", {
        songDesc: "", lyrics: "", lang: "Kurdisch (Kurmanji)", style: "Pop",
        mood: "fröhlich", voiceType: "female",
        instruments: ["piano", "guitar", "bass", "drums"]
      })
    };

    function save(){ store.set("playlist", ST.playlist); store.set("ki", ST.ki); }

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "ki" ? " active" : "") + '" data-mtab="ki">🤖 KI-Studio</button>'
        + '<button class="tab' + (tab === "player" ? " active" : "") + '" data-mtab="player">▶️ Player</button>'
        + '<button class="tab' + (tab === "settings" ? " active" : "") + '" data-mtab="settings">⚙️</button>'
        + '</div>';

      /* ═══ KI-STUDIO ═══ */
      if(tab === "ki"){
        var k = ST.ki;

        // KI Songtext
        body += '<div class="card"><h3>📝 Song-Beschreibung</h3>'
          + '<textarea id="ki_desc" rows="2" placeholder="Beschreibe deinen Song (z.B. Liebe, Heimweh)..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.songDesc) + '</textarea>'
          + '<button class="btn full" id="ki_genLyrics" style="margin-top:8px;font-size:11px">✨ KI Songtext generieren</button>'
          + '<div id="ki_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.08);border-radius:8px;font-size:11px;color:var(--text-dim)"></div>'
          + '</div>';

        // Songtext Editor
        body += '<div class="card"><h3>📄 Songtext</h3>'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Text hier..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '</div>';

        // Einstellungen
        body += '<div class="card"><h3>🌍 Sprache & Stil</h3>'
          + selectField("ki_lang", k.lang, [
            ["Kurdisch (Kurmanji)", "🦚 Kurmanji"], ["Kurdisch (Sorani)", "🦚 Sorani"], ["Ezidi (Êzidî)", "🦚 Ezidi"],
            ["Türkisch", "🇹🇷 Türkisch"], ["Arabisch", "🇸🇦 Arabisch"], ["Deutsch", "🇩🇪 Deutsch"],
            ["Englisch", "🇬🇧 Englisch"], ["Spanisch", "🇪🇸 Spanisch"], ["Französisch", "🇫🇷 Französisch"]
          ])
          + selectField("ki_style", k.style, [
            ["Pop", "Pop"], ["Rock", "Rock"], ["Stran", "🦚 Stran"], ["Dengbêj", "🦚 Dengbêj"],
            ["Arabesk", "🇹🇷 Arabesk"], ["EDM", "EDM"], ["Rap", "Rap"], ["Ballade", "Ballade"], ["Lo-Fi", "Lo-Fi"]
          ])
          + '</div>';

        // Stimme
        body += '<div class="card"><h3>🎤 Stimme (Gesang)</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">';
        [["female", "👩", "Frau"], ["male", "👨", "Mann"], ["robot", "🤖", "Roboter"], ["deep", "🐻", "Tief"]].forEach(function(v){
          var sel = k.voiceType === v[0];
          body += '<button type="button" data-voice="' + v[0] + '" style="padding:10px 4px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;font-size:10px;font-weight:800">'
            + '<div style="font-size:16px">' + v[1] + '</div>' + v[2] + '</button>';
        });
        body += '</div></div>';

        // Instrumente
        var instrs = [
          ["piano", "🎹", "Klavier"], ["guitar", "🎸", "Gitarre"], ["bass", "🎸", "Bass"], ["drums", "🥁", "Drums"],
          ["baglama", "🪕", "Bağlama"], ["duduk", "🎺", "Duduk"], ["darbuka", "🥁", "Darbuka"], ["strings", "🎻", "Streicher"]
        ];
        body += '<div class="card"><h3>🎼 Instrumente</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">';
        instrs.forEach(function(it){
          var sel = k.instruments.indexOf(it[0]) !== -1;
          body += '<button type="button" data-instr="' + it[0] + '" style="padding:8px 3px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:9px;font-weight:700">'
            + '<div style="font-size:14px;margin-bottom:2px">' + it[1] + '</div>' + it[2] + '</button>';
        });
        body += '</div></div>';

        // Play Button
        body += '<button class="btn full" id="ki_create" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:15px;padding:16px;margin-top:8px">🎵 Song singen & abspielen</button>';
      }

      /* ═══ PLAYER ═══ */
      if(tab === "player"){
        var cur = ST.playlist[ST.current];
        body += '<div class="card">'
          + '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:12px;text-align:center;border:1.5px solid var(--p1);margin-bottom:12px">'
          + '<div style="font-size:56px">🎵</div>'
          + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:8px">' + (cur ? _esc(cur.name) : "Kein Track") + '</div>'
          + '</div></div>';

        body += '<div class="card"><h3>📋 Playlist (' + ST.playlist.length + ')</h3>';
        if(!ST.playlist.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:11.5px">Noch keine Tracks generiert</div>';
        } else {
          ST.playlist.forEach(function(t, i){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between">'
              + '<div style="font-size:12px;font-weight:800">' + _esc(t.name) + '</div>'
              + '<button data-del="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      /* ═══ SETTINGS ═══ */
      if(tab === "settings"){
        body += '<div class="card"><h3>⚙️ Info</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.6">'
          + '🎼 <b>HalDo Musik Studio</b><br>'
          + 'Dieses Studio nutzt echte Instrumenten-Samples (WebAudioFont) und die Browser-Sprachausgabe für den Gesang. Die Songtexte werden von der lokalen KI (HalDo AI) generiert.'
          + '</div></div></div>';
      }

      container.innerHTML = body;

      /* ═══ EVENTS ═══ */
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.mtab; store.set("tab", tab); build();
        });
      });

      if(tab === "ki"){
        var ki = ST.ki;
        container.querySelector("#ki_desc").addEventListener("input", function(){ ki.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ ki.lyrics = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ ki.lang = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ ki.style = this.value; save(); });

        container.querySelectorAll("[data-voice]").forEach(function(b){
          b.addEventListener("click", function(){ ki.voiceType = b.dataset.voice; save(); build(); });
        });

        container.querySelectorAll("[data-instr]").forEach(function(b){
          b.addEventListener("click", function(){
            var id = b.dataset.instr;
            var idx = ki.instruments.indexOf(id);
            if(idx === -1) ki.instruments.push(id);
            else ki.instruments.splice(idx, 1);
            save(); build();
          });
        });

        // KI Songtext generieren
        container.querySelector("#ki_genLyrics").addEventListener("click", async function(){
          var stat = container.querySelector("#ki_status");
          var btn = this;
          stat.style.display = "block";
          stat.textContent = "⏳ KI schreibt Songtext...";
          btn.disabled = true;

          try {
            if(!HalDo.AI) throw new Error("KI nicht geladen");
            var text = await HalDo.AI.writeLyrics(ki.songDesc || "Liebe", ki.lang, ki.style, ki.mood);
            container.querySelector("#ki_lyrics").value = text;
            ki.lyrics = text;
            save();
            stat.textContent = "✅ Songtext fertig!";
          } catch(e) {
            stat.textContent = "❌ " + e.message;
          }
          btn.disabled = false;
        });

        // Song generieren und singen
        container.querySelector("#ki_create").addEventListener("click", async function(){
          var btn = this;
          if(!ki.lyrics) return alert("Bitte erst einen Songtext eingeben oder generieren!");
          
          btn.disabled = true;
          btn.textContent = "⏳ Generiere...";
          
          try {
            await loadWebAudioFont();
            if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(audioCtx.state === "suspended") await audioCtx.resume();

            var player = new WebAudioFontPlayer();
            var instrument = _tone_0250_SoundBlasterOld_sf2;
            player.loader.decodeAfterLoading(audioCtx, '_tone_0250_SoundBlasterOld_sf2');

            // 1. Einfache Melodie generieren (C-Dur Skala)
            var scale = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 bis C5
            var melody = [];
            
            // Wörter aus dem Text extrahieren (max 16 Wörter für den Test)
            var words = ki.lyrics.replace(/\[.*?\]/g, '').trim().split(/\s+/).filter(w => w.length > 0).slice(0, 16);
            
            // Zufällige Noten für die Wörter generieren
            words.forEach((word, i) => {
              var note = scale[Math.floor(Math.random() * scale.length)];
              melody.push({ word: word, note: note, time: i * 0.6 }); // Alle 0.6s ein Wort
            });

            // 2. Instrumental spielen
            melody.forEach(n => {
              player.queueWaveTable(audioCtx, audioCtx.destination, instrument, n.time, n.note, 0.5);
              // Bass/Tiefer im Hintergrund
              player.queueWaveTable(audioCtx, audioCtx.destination, instrument, n.time, n.note - 12, 0.5);
            });

            // 3. Gesang (SpeechSynthesis) synchronisieren
            var voicePitchBase = 1.0;
            if(ki.voiceType === "male") voicePitchBase = 0.6;
            if(ki.voiceType === "deep") voicePitchBase = 0.4;
            if(ki.voiceType === "robot") voicePitchBase = 1.8;
            if(ki.voiceType === "female") voicePitchBase = 1.2;

            melody.forEach(n => {
              setTimeout(() => {
                var u = new SpeechSynthesisUtterance(n.word);
                u.lang = "de-DE"; // Kann später an ki.lang angepasst werden
                // Tonhöhe anhand der Note anpassen (MIDI 60 = 1.0)
                u.pitch = voicePitchBase + ((n.note - 60) * 0.05); 
                u.rate = 1.0;
                speechSynthesis.speak(u);
              }, n.time * 1000);
            });

            // In Playlist speichern (simuliert)
            ST.playlist.push({
              name: "🎵 " + (ki.songDesc || ki.style) + " (" + ki.voiceType + ")",
              date: new Date().toLocaleString("de-DE")
            });
            save();
            
            setTimeout(() => {
              btn.disabled = false;
              btn.textContent = "🎵 Song singen & abspielen";
              if(HalDo.Notify) HalDo.Notify.success("Song fertig!", { app: "musik" });
            }, melody.length * 600 + 1000);

          } catch(e) {
            alert("Fehler: " + e.message);
            btn.disabled = false;
            btn.textContent = "🎵 Song singen & abspielen";
          }
        });
      }

      if(tab === "player"){
        container.querySelectorAll("[data-del]").forEach(function(el){
          el.addEventListener("click", function(){
            ST.playlist.splice(parseInt(el.dataset.del), 1);
            save(); build();
          });
        });
      }
    }

    function selectField(id, val, opts){
      var h = '<select id="' + id + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:8px">';
      opts.forEach(function(o){
        h += '<option value="' + _esc(o[0]) + '"' + (o[0] === val ? " selected" : "") + '>' + _esc(o[1]) + '</option>';
      });
      return h + '</select>';
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v300 geladen — FULL KI-STUDIO");
})();
