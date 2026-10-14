/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MEDIEN APP (v150)
   Radio · Podcast · Galerie · Kamera
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var RADIOS = [
    { n:"1LIVE", g:"Pop NRW", e:"🎵", u:"https://wdrhf.akamaized.net/hls/live/2027955/1live/192/seglist.m3u8" },
    { n:"WDR 2", g:"Pop", e:"🎤", u:"https://wdrhf.akamaized.net/hls/live/2027970/wdr2rheinruhr/192/seglist.m3u8" },
    { n:"WDR 3", g:"Klassik", e:"🎻", u:"https://wdrhf.akamaized.net/hls/live/2027994/wdr3/192/seglist.m3u8" },
    { n:"WDR 4", g:"Schlager", e:"🎶", u:"https://wdrhf.akamaized.net/hls/live/2027995/wdr4/192/seglist.m3u8" },
    { n:"COSMO", g:"Weltmusik", e:"🌍", u:"https://wdrhf.akamaized.net/hls/live/2027997/cosmo/192/seglist.m3u8" },
    { n:"1LIVE diGGi", g:"Diggi", e:"🎧", u:"https://wdrhf.akamaized.net/hls/live/2027963/1livediggi/192/seglist.m3u8" }
  ];

  var _audio = null, _cur = -1;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "radio");

    function build(){
      var body = "";

      if(tab === "radio"){
        body = '<div class="card"><h3>📻 Radio (Live-Streams)</h3>'
          + '<div id="radioNow" style="padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;margin-bottom:12px;text-align:center">'
          + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + (_cur >= 0 ? RADIOS[_cur].n : "— Kein Sender —") + '</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:4px" id="radioStatus">Bereit</div>'
          + '</div>'
          + RADIOS.map(function(r, i){
              return '<div class="radio-item' + (_cur === i ? " active" : "") + '" data-radio="' + i + '">'
                + '<div class="logo" style="background:linear-gradient(135deg,var(--p1),var(--p3));color:#001428">' + r.e + '</div>'
                + '<div class="info"><div class="nm">' + _esc(r.n) + '</div><div class="gn">' + _esc(r.g) + '</div></div>'
                + '<div style="font-size:18px;color:var(--p1)">' + (_cur === i ? "🔊" : "▶") + '</div>'
                + '</div>';
            }).join("")
          + '<button class="btn sec full" id="radioStop" style="margin-top:10px">⏹ Stop</button>'
          + '</div>';

      } else if(tab === "podcast"){
        body = '<div class="card"><h3>🎧 Podcast (ARD Audiothek)</h3>'
          + '<div class="field"><label>ARD-Audiothek URL</label><input type="text" id="podU" placeholder="https://www.ardaudiothek.de/sendung/..."></div>'
          + '<button class="btn full" id="podL">🎧 Anzeigen</button>'
          + '<div class="badge-info">Kostenlos via ard2rss.mauamy.de</div>'
          + '<div id="podR" style="margin-top:14px"></div>'
          + '</div>';

      } else if(tab === "galerie"){
        var g = store.get("gallery", []);
        body = '<div class="card"><h3>🖼️ Galerie (' + g.length + ')</h3>'
          + '<input type="file" id="gu" accept="image/*" multiple style="display:none">'
          + '<button class="btn full" id="guB">📷 Bilder hochladen</button>'
          + '<div class="gallery-grid" style="margin-top:12px">'
          + g.map(function(x, i){
              return '<div class="gallery-item" data-galidx="' + i + '"><img src="' + x.data + '"></div>';
            }).join("")
          + '</div>'
          + (g.length ? '<button class="btn danger full" id="galClear" style="margin-top:10px">🗑️ Alle löschen</button>' : '')
          + '</div>';

      } else if(tab === "kamera"){
        body = '<div class="card"><h3>📷 Kamera</h3>'
          + '<video id="cv" class="camera-video" autoplay playsinline style="display:block;margin:0 auto"></video>'
          + '<div style="display:flex;gap:8px;margin-top:10px">'
          + '<button class="btn" id="cs" style="flex:1">📷 Start</button>'
          + '<button class="btn sec" id="cx" style="flex:1">⏹ Stop</button>'
          + '</div>'
          + '<button class="btn full" id="cS" style="margin-top:8px">📸 Foto aufnehmen</button>'
          + '<canvas id="cc" style="display:none"></canvas>'
          + '<div id="cr" style="margin-top:12px"></div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="radio"?" active":"") + '" data-met="radio">📻 Radio</button>'
        + '<button class="tab' + (tab==="podcast"?" active":"") + '" data-met="podcast">🎧 Podcast</button>'
        + '<button class="tab' + (tab==="galerie"?" active":"") + '" data-met="galerie">🖼️ Galerie</button>'
        + '<button class="tab' + (tab==="kamera"?" active":"") + '" data-met="kamera">📷 Kamera</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-met]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.met;
          store.set("tab", tab);
          build();
        });
      });

      if(tab === "radio"){
        container.querySelectorAll("[data-radio]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.radio);
            var r = RADIOS[i];
            if(_audio){ try { _audio.pause(); } catch(e){} _audio = null; }
            if(_cur === i){ _cur = -1; build(); return; }
            _cur = i;
            _audio = new Audio(r.u);
            var st = container.querySelector("#radioStatus");
            if(st) st.textContent = "⏳ Lade…";
            _audio.play().then(function(){
              if(st) st.textContent = "🔴 Live";
            }).catch(function(e){
              if(st) st.textContent = "❌ " + e.message;
            });
            build();
          });
        });
        var stopBtn = container.querySelector("#radioStop");
        if(stopBtn) stopBtn.addEventListener("click", function(){
          if(_audio){ try { _audio.pause(); _audio = null; } catch(e){} }
          _cur = -1;
          build();
        });
      }

      if(tab === "podcast"){
        container.querySelector("#podL").addEventListener("click", function(){
          var u = container.querySelector("#podU").value.trim();
          if(!u) return;
          var rss = u.replace("www.ardaudiothek.de", "ard2rss.mauamy.de");
          container.querySelector("#podR").innerHTML = '<div style="text-align:center;padding:14px">⏳ Lade…</div>';
          fetch(rss).then(function(r){ return r.text(); }).then(function(x){
            var p = new DOMParser();
            var d = p.parseFromString(x, "text/xml");
            var items = d.querySelectorAll("item");
            if(!items.length){
              container.querySelector("#podR").innerHTML = '<div style="color:var(--text-mute);padding:14px">Keine Episoden</div>';
              return;
            }
            var h = '<div class="card"><h3>🎧 ' + items.length + ' Episoden</h3>';
            for(var i = 0; i < Math.min(items.length, 15); i++){
              var it = items[i];
              var t = it.querySelector("title") ? it.querySelector("title").textContent : "?";
              var e = it.querySelector("enclosure");
              var url = e ? e.getAttribute("url") : "";
              h += '<div class="doc-item" data-pu="' + _esc(url) + '"><span class="ico">🎧</span><div class="info"><div class="nm">' + _esc(t) + '</div></div><div style="color:var(--p1)">▶</div></div>';
            }
            h += '</div>';
            container.querySelector("#podR").innerHTML = h;
            container.querySelectorAll("[data-pu]").forEach(function(b){
              b.addEventListener("click", function(){
                var u = b.dataset.pu;
                if(!u) return;
                if(_audio){ try { _audio.pause(); } catch(e){} }
                _audio = new Audio(u);
                _audio.play();
                if(window.HalDo.Voice) HalDo.Voice.speak("Podcast läuft");
              });
            });
          }).catch(function(e){
            container.querySelector("#podR").innerHTML = '<div style="color:#ff8080;padding:14px">❌ ' + _esc(e.message) + '</div>';
          });
        });
      }

      if(tab === "galerie"){
        container.querySelector("#guB").addEventListener("click", function(){ container.querySelector("#gu").click(); });
        container.querySelector("#gu").addEventListener("change", function(e){
          var files = e.target.files;
          if(!files.length) return;
          var g = store.get("gallery", []);
          Array.from(files).slice(0, 5).forEach(function(f){
            var r = new FileReader();
            r.onload = function(ev){
              if(ev.target.result.length > 1500000){ alert("Bild zu groß (max 1.5 MB)"); return; }
              g.push({ data: ev.target.result, name: f.name });
              store.set("gallery", g);
              build();
            };
            r.readAsDataURL(f);
          });
        });
        var clr = container.querySelector("#galClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Alle Bilder löschen?")) return;
          store.set("gallery", []);
          build();
        });
      }

      if(tab === "kamera"){
        var stream = null;
        container.querySelector("#cs").addEventListener("click", function(){
          navigator.mediaDevices.getUserMedia({ video: true }).then(function(s){
            stream = s;
            container.querySelector("#cv").srcObject = s;
            if(window.HalDo.Voice) HalDo.Voice.speak("Kamera aktiv");
          }).catch(function(e){
            alert("Kamera-Fehler: " + e.message);
          });
        });
        container.querySelector("#cx").addEventListener("click", function(){
          if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; }
          container.querySelector("#cv").srcObject = null;
        });
        container.querySelector("#cS").addEventListener("click", function(){
          var v = container.querySelector("#cv"), c = container.querySelector("#cc");
          if(!v.srcObject){ alert("Kamera nicht aktiv"); return; }
          c.width = v.videoWidth;
          c.height = v.videoHeight;
          c.getContext("2d").drawImage(v, 0, 0);
          var data = c.toDataURL("image/jpeg", 0.7);
          var g = store.get("gallery", []);
          g.push({ data: data, name: "foto_" + Date.now() });
          store.set("gallery", g);
          container.querySelector("#cr").innerHTML = '<img src="' + data + '" style="max-width:100%;border-radius:10px;border:2px solid var(--p1)">';
          if(window.HalDo.Voice) HalDo.Voice.speak("Foto gespeichert");
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("medien", { render: render });
  else console.warn("medien.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 medien.js geladen");
