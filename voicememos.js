/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VOICE MEMOS (v1.0)
   Sprachaufnahmen · Liste · Wiedergabe · Löschen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmtDur(s){ var m = Math.floor(s/60); var sec = Math.floor(s%60); return m+":"+String(sec).padStart(2,"0"); }

  function render(container, ctx){
    var store = ctx.store;
    var state = { recording:false, seconds:0, mediaRec:null, stream:null, chunks:[], timer:null, playing:null };

    function getMemos(){ return store.get("memos", []); }
    function saveMemos(m){ store.set("memos", m); }

    function build(){
      var memos = getMemos();
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,107,107,.15),rgba(180,120,255,.1));border:1px solid rgba(255,107,107,.3)">'
        + '<div style="font-size:44px">🎤</div>'
        + '<div style="font-size:16px;font-weight:900;color:#ff6b6b;margin-top:6px">Sprachmemos</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+memos.length+' Aufnahmen</div>';

      if(state.recording){
        html += '<div style="margin:14px 0;padding:14px;background:rgba(255,60,60,.15);border-radius:10px;border:1px solid rgba(255,60,60,.4)">'
          + '<div style="font-size:34px;font-weight:900;color:#ff5555;font-variant-numeric:tabular-nums;animation:pulse 1.5s infinite">'+fmtDur(state.seconds)+'</div>'
          + '<div style="font-size:10px;color:#ff8080;font-weight:800;margin-top:2px">🔴 Aufnahme läuft...</div>'
          + '<style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}</style>'
          + '</div>';
      }

      html += '<button class="btn full" id="vmRec" style="padding:16px;font-size:15px;margin-top:10px;background:'+(state.recording?'linear-gradient(135deg,#ff5555,#ff3333)':'linear-gradient(135deg,#4dd0e1,#b478ff)')+'">'
        + (state.recording?'⏹ Aufnahme stoppen':'🎤 Aufnahme starten')
        + '</button></div>';

      if(!memos.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">🎤</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Noch keine Aufnahmen</div></div>';
      } else {
        html += '<div class="card"><h3>Meine Aufnahmen</h3>';
        memos.slice().reverse().forEach(function(m){
          var playing = state.playing === m.id;
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;border-left:3px solid '+(playing?'#4ade80':'#ff6b6b')+'">'
            + '<div style="display:flex;align-items:center;gap:10px">'
            + '<button data-play="'+m.id+'" style="width:40px;height:40px;border-radius:50%;background:'+(playing?'#4ade80':'rgba(255,107,107,.2)')+';color:'+(playing?'#000':'#ff6b6b')+';border:none;cursor:pointer;font-size:16px;flex-shrink:0">'+(playing?'⏸':'▶')+'</button>'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+_esc(m.name||("Memo "+new Date(m.created).toLocaleDateString("de-DE")))+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">'+fmtDur(m.duration||0)+' · '+new Date(m.created).toLocaleString("de-DE")+'</div>'
            + '</div>'
            + '<button data-dl="'+m.id+'" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;padding:5px 8px;font-size:10px;cursor:pointer">⬇</button>'
            + '<button data-del="'+m.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 8px;font-size:10px;cursor:pointer">✕</button>'
            + '</div></div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#vmRec").addEventListener("click", function(){
        if(state.recording) stopRec(); else startRec();
      });
      container.querySelectorAll("[data-play]").forEach(function(el){
        el.addEventListener("click", function(){
          var memos = getMemos(); var m = memos.find(function(x){return x.id===el.dataset.play;});
          if(!m) return;
          if(state.playing === m.id){ state.playing = null; build(); return; }
          state.playing = m.id; build();
          var audio = new Audio(m.audio);
          audio.play();
          audio.onended = function(){ state.playing = null; build(); };
          audio.onerror = function(){ state.playing = null; build(); alert("Wiedergabe fehlgeschlagen"); };
        });
      });
      container.querySelectorAll("[data-dl]").forEach(function(el){
        el.addEventListener("click", function(){
          var memos = getMemos(); var m = memos.find(function(x){return x.id===el.dataset.dl;});
          if(!m) return;
          var a = document.createElement("a"); a.href = m.audio;
          a.download = "memo-"+(m.name||m.created)+".webm"; a.click();
        });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Aufnahme löschen?")) return;
          saveMemos(getMemos().filter(function(x){return x.id!==el.dataset.del;})); build();
        });
      });
    }

    function startRec(){
      if(!navigator.mediaDevices){ alert("Mikrofon nicht verfügbar"); return; }
      navigator.mediaDevices.getUserMedia({ audio:true }).then(function(stream){
        state.stream = stream;
        state.chunks = [];
        state.seconds = 0;
        try {
          state.mediaRec = new MediaRecorder(stream);
          state.mediaRec.ondataavailable = function(e){ if(e.data.size) state.chunks.push(e.data); };
          state.mediaRec.onstop = function(){
            stream.getTracks().forEach(function(t){ t.stop(); });
            var blob = new Blob(state.chunks, { type:"audio/webm" });
            var reader = new FileReader();
            reader.onload = function(){
              var name = prompt("Name für Aufnahme:", "Memo " + new Date().toLocaleTimeString("de-DE"));
              if(name === null) { state.recording = false; state.seconds = 0; build(); return; }
              var memos = getMemos();
              memos.push({ id:"m"+Date.now(), name:name||"Memo", audio:reader.result, duration:state.seconds, created:Date.now() });
              saveMemos(memos);
              state.recording = false; state.seconds = 0; state.mediaRec = null; state.stream = null;
              if(HalDo.Notify) HalDo.Notify.success("Aufnahme gespeichert");
              build();
            };
            reader.readAsDataURL(blob);
          };
          state.mediaRec.start();
          state.recording = true;
          build();
          state.timer = setInterval(function(){ state.seconds++; updateTimer(); }, 1000);
        } catch(e){ alert("Fehler: " + e.message); }
      }).catch(function(e){ alert("Mikrofon-Zugriff verweigert: " + e.message); });
    }

    function updateTimer(){
      var el = container.querySelector("[style*='font-size:34px']");
      if(el) el.textContent = fmtDur(state.seconds);
    }

    function stopRec(){
      if(state.timer){ clearInterval(state.timer); state.timer = null; }
      if(state.mediaRec && state.mediaRec.state === "recording") state.mediaRec.stop();
    }

    build();
  }

  HalDoApp("voicememos", { name: "Sprachmemos", icon: "🎤", render: render, category: "produktivitaet" });
  console.log("🦚 voicememos.js v1.0 geladen");
})();
