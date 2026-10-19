/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VIDEO STUDIO (v300)
   Player · Trim · Filter · KI-Storyboard
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmtTime(s){
    if(!s || !isFinite(s)) return "0:00";
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  var VS = {
    video: null,
    currentFile: null,
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
    speed: 1,
    volume: 1
  };

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "player");

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "player" ? " active" : "") + '" data-vtab="player">▶️ Player</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-vtab="ai">🤖 KI-Storyboard</button>'
        + '</div>';

      /* ═══ PLAYER ═══ */
      if(tab === "player"){
        body += '<div class="card" style="padding:8px">'
          + '<video id="vs_video" controls playsinline style="width:100%;border-radius:10px;background:#000;display:block;max-height:400px"></video>'
          + '</div>';

        body += '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="file" id="vs_upload" accept="video/*" style="display:none">'
          + '<button class="btn" id="vs_uploadBtn" style="flex:1;font-size:12px">📤 Video laden</button>'
          + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);text-align:center" id="vs_info">'
          + (VS.currentFile ? '✅ ' + _esc(VS.currentFile.name || "Video geladen") + ' · ' + fmtTime(VS.duration) : 'Kein Video geladen')
          + '</div></div>';
      }

      /* ═══ KI-STORYBOARD ═══ */
      else if(tab === "ai"){
        body += '<div class="card"><h3>🤖 KI Storyboard Generator</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);line-height:1.6;margin-bottom:10px">'
          + 'Gib ein Thema ein (z.B. "Eine Reise durch Kurdistan"). Die KI schreibt dir ein Storyboard mit 4 Szenen.'
          + '</div>'
          + '<textarea id="vidTopic" rows="2" placeholder="Thema des Videos..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical"></textarea>'
          + '<button class="btn full" id="btnGenStory" style="margin-top:8px;background:var(--p1);color:#000">✨ Storyboard generieren</button>'
          + '<div id="storyResult" style="display:none;margin-top:12px;padding:12px;background:rgba(0,0,0,.4);border-radius:10px;font-size:12px;line-height:1.6;white-space:pre-wrap"></div>'
          + '</div>';
      }

      container.innerHTML = body;

      /* Events */
      container.querySelectorAll("[data-vtab]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.vtab; store.set("tab", tab); build(); });
      });

      if(tab === "player"){
        var video = container.querySelector("#vs_video");
        VS.video = video;

        if(VS.currentFile && VS.currentFile.url){
          video.src = VS.currentFile.url;
          video.playbackRate = VS.speed;
          video.volume = VS.volume;
        }

        var up = container.querySelector("#vs_upload");
        var upBtn = container.querySelector("#vs_uploadBtn");
        if(upBtn) upBtn.addEventListener("click", function(){ up.click(); });
        if(up) up.addEventListener("change", function(){
          var f = this.files[0];
          if(!f) return;
          var url = URL.createObjectURL(f);
          VS.currentFile = { name: f.name, url: url };
          build();
          if(HalDo.Notify) HalDo.Notify.success("Video geladen", { app: "video" });
        });
      }

      if(tab === "ai"){
        container.querySelector("#btnGenStory").addEventListener("click", async function(){
          var topic = container.querySelector("#vidTopic").value.trim();
          if(!topic) return alert("Bitte gib ein Thema ein!");
          var res = container.querySelector("#storyResult");
          res.style.display = "block";
          res.textContent = "⏳ KI schreibt Storyboard...";
          this.disabled = true;
          
          try {
            var prompt = "Du bist ein Regisseur. Erstelle ein Storyboard mit 4 Szenen für ein Video über: " + topic + ". Format: Szene 1: [Beschreibung]. Szene 2: ... Szene 3: ... Szene 4: ...";
            var result = await HalDo.AI.ask(prompt, { temperature: 0.8, maxTokens: 300 });
            res.textContent = result;
            if(HalDo.Notify) HalDo.Notify.success("Storyboard fertig!", { app: "video" });
          } catch(e) {
            res.textContent = "❌ " + e.message;
          }
          this.disabled = false;
        });
      }
    }

    build();
  }

  HalDoApp("video", { name: "Video", icon: "🎬", render: render, category: "lifestyle" });
  console.log("🦚 video.js v300 geladen — MIT KI-STORYBOARD");
})();
