/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — AUFNAHME APP (v150)
   Sprachnotizen · Diktat · Transkription · Aufnahmen
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var mediaRecorder = null;
  var audioChunks = [];
  var isRecording = false;
  var recordStart = 0;
  var timerInterval = null;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmtTime(ms){
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "aufnahme");

    function build(){
      var body = "";

      /* ═══ AUFNAHME ═══ */
      if(tab === "aufnahme"){
        var hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        var hasMR = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

        body = '<div class="card"><h3>🎙️ Sprachnotiz / Diktat</h3>';

        /* Live Status */
        body += '<div id="recStatus" style="padding:24px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p1)">'
          + '<div id="recIcon" style="font-size:52px">🎙️</div>'
          + '<div id="recTime" style="font-size:28px;font-weight:900;color:var(--p1);margin-top:8px">00:00</div>'
          + '<div id="recHint" style="font-size:11px;color:var(--text-dim);margin-top:4px">Bereit zum Aufnehmen</div>'
          + '</div>';

        /* Buttons */
        body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
          + '<button class="btn" id="recAudio" style="' + (!hasMR ? "opacity:.5;cursor:not-allowed" : "") + '">🔴 Aufnahme</button>'
          + '<button class="btn sec" id="recText" style="' + (!hasSR ? "opacity:.5;cursor:not-allowed" : "") + '">📝 Diktat</button>'
          + '</div>';

        if(!hasMR && !hasSR){
          body += '<div style="margin-top:12px;padding:12px;background:rgba(255,128,128,.15);border-radius:10px;font-size:11px;color:#ff8080;text-align:center">⚠️ Dein Browser unterstützt weder Mikrofon noch Spracherkennung.</div>';
        } else if(!hasSR){
          body += '<div style="margin-top:12px;padding:10px;background:rgba(251,191,36,.15);border-radius:10px;font-size:10.5px;color:#fbbf24;text-align:center">ℹ️ Diktat nutzt Chrome/Edge — Audio-Aufnahme funktioniert überall.</div>';
        }

        /* Live-Transkript */
        body += '<div id="liveText" style="display:none;margin-top:14px;padding:14px;background:rgba(0,0,0,.3);border-radius:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-bottom:6px">Live-Transkript</div>'
          + '<div id="liveContent" style="font-size:13px;line-height:1.55;color:var(--text-dim);min-height:40px"></div>'
          + '</div>';

        /* Manuelle Notiz */
        body += '<div style="margin-top:14px">'
          + '<label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;display:block;margin-bottom:6px">✍️ Manuelle Notiz</label>'
          + '<textarea id="manualNote" placeholder="Text eingeben..." rows="4" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical"></textarea>'
          + '<button class="btn full" id="saveNote" style="margin-top:8px">💾 Notiz speichern</button>'
          + '</div>';

        body += '</div>';

      /* ═══ NOTIZEN ═══ */
      } else if(tab === "notizen"){
        var notes = store.get("voiceNotes", []);
        var search = store.get("noteSearch", "");

        body = '<div class="card"><h3>📚 Notizen (' + notes.length + ')</h3>'
          + '<div class="field"><input type="text" id="noteSearch" placeholder="🔍 Suchen..." value="' + _esc(search) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>';

        var filtered = notes.filter(function(n){
          if(!search) return true;
          var s = search.toLowerCase();
          return (n.text || "").toLowerCase().indexOf(s) !== -1
            || (n.title || "").toLowerCase().indexOf(s) !== -1;
        });

        if(!filtered.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:30px">' + (notes.length ? "Keine Treffer" : "Noch keine Notizen") + '</div>';
        } else {
          filtered.slice().reverse().forEach(function(n, idx){
            var ri = notes.indexOf(n);
            var type = n.type || "note";
            var icon = type === "audio" ? "🔴" : type === "dictate" ? "📝" : "✍️";
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid ' + (type === "audio" ? "#ff8080" : type === "dictate" ? "var(--p1)" : "var(--p3)") + '">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
              + '<div style="flex:1">'
              + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;margin-bottom:4px">' + icon + ' ' + _esc(n.date) + (n.duration ? " · ⏱️ " + _esc(n.duration) : "") + '</div>'
              + '<div style="font-size:12.5px;line-height:1.55;color:var(--text-dim);word-break:break-word">' + _esc(n.text || "").substring(0, 300) + ((n.text || "").length > 300 ? "..." : "") + '</div>'
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-ncopy="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:5px 8px;font-size:11px">📋</button>'
              + '<button data-ndel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:5px 8px;font-size:11px">✕</button>'
              + '</div>'
              + '</div>';
            if(type === "audio" && n.audioUrl){
              body += '<audio controls src="' + _esc(n.audioUrl) + '" style="width:100%;margin-top:8px;height:32px"></audio>';
            }
            body += '</div>';
          });
        }

        if(notes.length){
          body += '<button class="btn danger full" id="delAllNotes" style="margin-top:10px">🗑️ Alle löschen</button>';
        }
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="aufnahme"?" active":"") + '" data-at="aufnahme">🎙️ Aufnahme</button>'
        + '<button class="tab' + (tab==="notizen"?" active":"") + '" data-at="notizen">📚 Notizen</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-at]").forEach(function(b){
        b.addEventListener("click", function(){
          if(isRecording) stopRecording();
          tab = b.dataset.at;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Aufnahme ═══ */
      if(tab === "aufnahme"){
        var recAudioBtn = container.querySelector("#recAudio");
        var recTextBtn = container.querySelector("#recText");
        var recTime = container.querySelector("#recTime");
        var recIcon = container.querySelector("#recIcon");
        var recHint = container.querySelector("#recHint");
        var liveText = container.querySelector("#liveText");
        var liveContent = container.querySelector("#liveContent");

        /* AUDIO AUFNAHME */
        if(recAudioBtn && !recAudioBtn.disabled){
          recAudioBtn.addEventListener("click", function(){
            if(!isRecording){
              startAudioRecording();
            } else {
              stopRecording();
            }
          });
        }

        function startAudioRecording(){
          navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = function(e){
              if(e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = function(){
              var blob = new Blob(audioChunks, { type: "audio/webm" });
              var reader = new FileReader();
              reader.onloadend = function(){
                var dataUrl = reader.result;
                var duration = fmtTime(Date.now() - recordStart);
                var notes = store.get("voiceNotes", []);
                notes.push({
                  type: "audio",
                  text: "🎙️ Audio-Aufnahme (" + duration + ")",
                  audioUrl: dataUrl,
                  duration: duration,
                  date: new Date().toLocaleString("de-DE")
                });
                store.set("voiceNotes", notes);
                if(window.HalDo.Notify) HalDo.Notify.info("Aufnahme gespeichert (" + duration + ")", { app: "aufnahme" });
                build();
              };
              reader.readAsDataURL(blob);

              stream.getTracks().forEach(function(t){ t.stop(); });
            };

            mediaRecorder.start();
            isRecording = true;
            recordStart = Date.now();

            recIcon.textContent = "🔴";
            recIcon.style.animation = "pulse 1s infinite";
            recHint.textContent = "Aufnahme läuft... klick zum Stoppen";
            recAudioBtn.textContent = "⏹ Stoppen";
            recAudioBtn.style.background = "#ff8080";

            timerInterval = setInterval(function(){
              recTime.textContent = fmtTime(Date.now() - recordStart);
            }, 200);

          }).catch(function(err){
            alert("Mikrofon-Zugriff verweigert: " + err.message);
          });
        }

        function stopRecording(){
          if(mediaRecorder && mediaRecorder.state !== "inactive"){
            mediaRecorder.stop();
          }
          isRecording = false;
          clearInterval(timerInterval);
          recIcon.textContent = "🎙️";
          recIcon.style.animation = "";
          recTime.textContent = "00:00";
          recHint.textContent = "Bereit zum Aufnehmen";
          if(recAudioBtn){
            recAudioBtn.textContent = "🔴 Aufnahme";
            recAudioBtn.style.background = "";
          }
          if(window.speechRecognition){
            try { window.speechRecognition.stop(); } catch(e){}
          }
          if(liveText) liveText.style.display = "none";
        }

        /* DIKTAT (Speech Recognition) */
        if(recTextBtn && !recTextBtn.disabled){
          recTextBtn.addEventListener("click", function(){
            var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if(!SR) return;

            if(window.speechRecognition && isRecording){
              stopRecording();
              return;
            }

            var recognition = new SR();
            recognition.lang = "de-DE";
            recognition.continuous = true;
            recognition.interimResults = true;

            var finalText = "";

            recognition.onresult = function(e){
              var interim = "";
              for(var i = e.resultIndex; i < e.results.length; i++){
                if(e.results[i].isFinal){
                  finalText += e.results[i][0].transcript + " ";
                } else {
                  interim += e.results[i][0].transcript;
                }
              }
              liveContent.textContent = finalText + interim;
            };

            recognition.onerror = function(e){
              console.warn("Speech error:", e.error);
            };

            recognition.onend = function(){
              if(isRecording){
                /* Auto-Restart wenn noch aktiv */
                try { recognition.start(); } catch(e){}
              } else if(finalText.trim()){
                var notes = store.get("voiceNotes", []);
                notes.push({
                  type: "dictate",
                  text: finalText.trim(),
                  duration: fmtTime(Date.now() - recordStart),
                  date: new Date().toLocaleString("de-DE")
                });
                store.set("voiceNotes", notes);
                if(window.HalDo.Notify) HalDo.Notify.info("Diktat gespeichert", { app: "aufnahme" });
                build();
              }
            };

            recognition.start();
            window.speechRecognition = recognition;
            isRecording = true;
            recordStart = Date.now();

            recIcon.textContent = "📝";
            recIcon.style.animation = "pulse 1s infinite";
            recHint.textContent = "Diktat läuft... sprich jetzt!";
            recTextBtn.textContent = "⏹ Stoppen";
            recTextBtn.style.background = "#ff8080";
            liveText.style.display = "block";
            liveContent.textContent = "";

            timerInterval = setInterval(function(){
              recTime.textContent = fmtTime(Date.now() - recordStart);
            }, 200);
          });
        }

        /* MANUELLE NOTIZ */
        var saveNote = container.querySelector("#saveNote");
        if(saveNote) saveNote.addEventListener("click", function(){
          var txt = container.querySelector("#manualNote").value.trim();
          if(!txt){ alert("Bitte Text eingeben"); return; }
          var notes = store.get("voiceNotes", []);
          notes.push({
            type: "note",
            text: txt,
            date: new Date().toLocaleString("de-DE")
          });
          store.set("voiceNotes", notes);
          container.querySelector("#manualNote").value = "";
          if(window.HalDo.Voice) HalDo.Voice.speak("Notiz gespeichert");
          build();
        });
      }

      /* ═══ Notizen-Tab ═══ */
      if(tab === "notizen"){
        var notes2 = store.get("voiceNotes", []);

        var searchInp = container.querySelector("#noteSearch");
        if(searchInp){
          searchInp.addEventListener("input", function(){
            store.set("noteSearch", this.value);
            build();
          });
        }

        container.querySelectorAll("[data-ncopy]").forEach(function(el){
          el.addEventListener("click", function(){
            var n = notes2[parseInt(el.dataset.ncopy)];
            if(!n) return;
            if(navigator.clipboard){
              navigator.clipboard.writeText(n.text || "").then(function(){
                if(window.HalDo.Notify) HalDo.Notify.info("Kopiert!", { app: "aufnahme" });
              });
            }
          });
        });

        container.querySelectorAll("[data-ndel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Notiz löschen?")) return;
            notes2.splice(parseInt(el.dataset.ndel), 1);
            store.set("voiceNotes", notes2);
            build();
          });
        });

        var delAll = container.querySelector("#delAllNotes");
        if(delAll) delAll.addEventListener("click", function(){
          if(!confirm("ALLE Notizen löschen? Das kann nicht rückgängig gemacht werden!")) return;
          store.set("voiceNotes", []);
          build();
        });
      }
    }

    build();
  }

  /* Pulse Animation injizieren */
  if(!document.getElementById("recPulseStyle")){
    var style = document.createElement("style");
    style.id = "recPulseStyle";
    style.textContent = "@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.15)}}";
    document.head.appendChild(style);
  }

  if(window.HalDoApp) HalDoApp("aufnahme", { render: render });
  else console.warn("aufnahme.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 aufnahme.js geladen");
