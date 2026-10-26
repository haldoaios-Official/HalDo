/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GERÄTE-INFO (v1.0)
   System · Hardware · Akku · Berechtigungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var state = {
      battery: null,
      storage: null,
      permissions: {}
    };

    function build(){
      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(77,208,225,.1));border:1px solid rgba(180,120,255,.3);text-align:center">'
        + '<div style="font-size:44px">📱</div>'
        + '<div style="font-size:16px;font-weight:900;color:#b478ff;margin-top:6px">Geräte-Info</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+getOS()+'</div>'
        + '</div>';

      // Battery
      html += '<div class="card"><h3>🔋 Akku</h3>';
      if(!state.battery){
        html += '<div style="text-align:center;color:var(--text-mute);padding:14px;font-size:12px">Akku-Info nicht verfügbar<br><span style="font-size:10px;opacity:.7">(Browser unterstützt es nicht)</span></div>';
      } else {
        var b = state.battery;
        var pct = Math.round(b.level * 100);
        var color = b.charging ? "#4ade80" : pct > 20 ? "#4dd0e1" : "#ff5555";
        html += '<div style="text-align:center;padding:10px 0">'
          + '<div style="font-size:42px;font-weight:900;color:'+color+';line-height:1">'+pct+'%</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">'+(b.charging ? "⚡ Wird geladen" : "🔋 Entlädt")+'</div>'
          + (b.chargingTime !== Infinity ? '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">Voll in '+Math.round(b.chargingTime/60)+' Min.</div>' : '')
          + (b.dischargingTime !== Infinity && !b.charging ? '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">Leer in '+Math.round(b.dischargingTime/60)+' Min.</div>' : '')
          + '</div>';
      }
      html += '</div>';

      // Screen
      var scr = window.screen;
      html += '<div class="card"><h3>📺 Bildschirm</h3>'
        + row("Auflösung", scr.width + " × " + scr.height)
        + row("Verfügbar", scr.availWidth + " × " + scr.availHeight)
        + row("Farbtiefe", scr.colorDepth + " bit")
        + row("Pixel Ratio", window.devicePixelRatio.toFixed(2))
        + row("Orientierung", scr.orientation ? scr.orientation.type : "—")
        + '</div>';

      // Hardware
      var cpu = navigator.hardwareConcurrency || "—";
      var mem = navigator.deviceMemory || navigator.deviceMemoryGB || "—";
      html += '<div class="card"><h3>⚙️ Hardware</h3>'
        + row("CPU-Kerne", cpu)
        + row("RAM (geschätzt)", mem !== "—" ? mem + " GB" : "—")
        + row("Touch-Punkte", navigator.maxTouchPoints || 0)
        + row("Plattform", navigator.platform || "—")
        + '</div>';

      // Software
      html += '<div class="card"><h3>💻 Software</h3>'
        + row("Betriebssystem", getOS())
        + row("Browser", getBrowser())
        + row("Sprache", navigator.language || "—")
        + row("Zeitzone", Intl.DateTimeFormat().resolvedOptions().timeZone || "—")
        + row("Cookie", navigator.cookieEnabled ? "Erlaubt" : "Blockiert")
        + row("Online", navigator.onLine ? "Ja" : "Nein")
        + '</div>';

      // Storage
      if(state.storage){
        var s = state.storage;
        var used = s.usage || 0;
        var quota = s.quota || 1;
        var pctUsed = Math.min(100, used / quota * 100);
        html += '<div class="card"><h3>💾 Speicher</h3>'
          + '<div style="margin:10px 0">'
          + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span>Verbraucht</span><span style="font-weight:900;color:#4dd0e1">'+fmtSize(used)+' / '+fmtSize(quota)+'</span></div>'
          + '<div style="height:8px;background:rgba(0,0,0,.3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pctUsed+'%;background:linear-gradient(90deg,#4dd0e1,#b478ff);border-radius:4px"></div></div>'
          + '<div style="text-align:right;font-size:9.5px;color:var(--text-mute);margin-top:2px">'+pctUsed.toFixed(1)+'% belegt</div>'
          + '</div>'
          + '</div>';
      } else {
        html += '<div class="card"><h3>💾 Speicher</h3>'
          + '<button class="btn full" id="di-storage">💾 Speichernutzung prüfen</button></div>';
      }

      // Permissions
      html += '<div class="card"><h3>🔐 Berechtigungen</h3>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Status kann nur nach Nutzung geprüft werden.</div>';
      ["geolocation","notifications","camera","microphone"].forEach(function(name){
        var status = state.permissions[name] || "unknown";
        var icon = status === "granted" ? "✅" : status === "denied" ? "❌" : "❔";
        var color = status === "granted" ? "#4ade80" : status === "denied" ? "#ff8080" : "#7fa5b8";
        var labels = { geolocation:"GPS", notifications:"Benachrichtigungen", camera:"Kamera", microphone:"Mikrofon" };
        html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11.5px"><span>'+labels[name]+'</span><span style="color:'+color+';font-weight:900">'+icon+' '+status+'</span></div>';
      });
      html += '<button class="btn sec full" id="di-perms" style="margin-top:8px">Berechtigungen prüfen</button></div>';

      // Actions
      html += '<div class="card"><h3>🛠️ Aktionen</h3>'
        + '<button class="btn sec full" id="di-copy" style="margin-bottom:6px">📋 System-Info kopieren</button>'
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      var stBtn = container.querySelector("#di-storage");
      if(stBtn) stBtn.addEventListener("click", function(){
        if(navigator.storage && navigator.storage.estimate){
          navigator.storage.estimate().then(function(e){
            state.storage = e; build();
          });
        }
      });

      container.querySelector("#di-perms").addEventListener("click", function(){
        if(!navigator.permissions){ alert("Nicht verfügbar"); return; }
        var names = ["geolocation","notifications","camera","microphone"];
        var promises = names.map(function(n){
          return navigator.permissions.query({ name: n }).then(function(r){
            state.permissions[n] = r.state;
          }).catch(function(){
            state.permissions[n] = "unknown";
          });
        });
        Promise.all(promises).then(function(){ build(); });
      });

      container.querySelector("#di-copy").addEventListener("click", function(){
        var text = "HalDo AI OS — Geräte-Info\n"
          + "OS: " + getOS() + "\n"
          + "Browser: " + getBrowser() + "\n"
          + "Auflösung: " + window.screen.width + "×" + window.screen.height + "\n"
          + "CPU: " + (navigator.hardwareConcurrency || "—") + " Kerne\n"
          + "UA: " + navigator.userAgent;
        navigator.clipboard.writeText(text).then(function(){
          if(HalDo.Notify) HalDo.Notify.success("Kopiert");
        }).catch(function(){});
      });

      // Load battery if not loaded
      if(!state.battery && navigator.getBattery){
        navigator.getBattery().then(function(b){
          state.battery = b;
          build();
        });
      }
    }

    function getOS(){
      var ua = navigator.userAgent;
      if(/iPhone|iPad|iPod/.test(ua)) return "iOS";
      if(/Android/.test(ua)) return "Android";
      if(/Mac/.test(ua)) return "macOS";
      if(/Win/.test(ua)) return "Windows";
      if(/Linux/.test(ua)) return "Linux";
      return "Unbekannt";
    }

    function getBrowser(){
      var ua = navigator.userAgent;
      if(ua.indexOf("Edg") >= 0) return "Edge";
      if(ua.indexOf("Chrome") >= 0) return "Chrome";
      if(ua.indexOf("Safari") >= 0) return "Safari";
      if(ua.indexOf("Firefox") >= 0) return "Firefox";
      return "Unbekannt";
    }

    function fmtSize(n){
      if(!n) return "0 B";
      if(n < 1024) return n + " B";
      if(n < 1048576) return (n/1024).toFixed(1) + " KB";
      if(n < 1073741824) return (n/1048576).toFixed(1) + " MB";
      return (n/1073741824).toFixed(2) + " GB";
    }

    function row(k, v){
      return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11.5px;gap:8px"><span style="color:var(--text-mute);flex-shrink:0">'+k+'</span><span style="font-weight:800;color:var(--p1);text-align:right;word-break:break-word">'+v+'</span></div>';
    }

    build();
    if(navigator.storage && navigator.storage.estimate){
      navigator.storage.estimate().then(function(e){ state.storage = e; build(); });
    }
  }

  HalDoApp("geraete-info", { name: "Gerät", icon: "📱", render: render, category: "system" });
  console.log("🦚 geraete-info.js v1.0 geladen");
})();
