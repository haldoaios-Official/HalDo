/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VERKEHR APP (v150b)
   Mit Notify Manager Integration
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var FS = [
    {f:"Wie verhalten Sie sich bei einer roten Ampel?", a:["Anhalten","Weiterfahren","Hupen","Beschleunigen"], c:0},
    {f:"Was bedeutet ein Stoppschild?", a:["Vorfahrt gewähren","Anhalten","Weiterfahren","Warnen"], c:1},
    {f:"Wie viele Promille sind erlaubt?", a:["0,0","0,5","0,8","1,0"], c:0},
    {f:"Was bedeutet eine durchgezogene Linie?", a:["Überholverbot","Parkverbot","Halteverbot","Tempolimit"], c:0},
    {f:"Wie verhalten Sie sich bei Nebel?", a:["Langsamer fahren","Schneller fahren","Lichthupe","Hupen"], c:0},
    {f:"Was ist bei Schnee zu tun?", a:["Winterreifen","Sommerreifen","Keine Reifen","Ganzjahresreifen"], c:0},
    {f:"Was bedeutet ein Blinklicht links?", a:["Abbiegen links","Rechts abbiegen","Bremsen","Warnen"], c:0},
    {f:"Wie lange darf man parken?", a:["Unbegrenzt","5 min","10 min","30 min"], c:0},
    {f:"Was ist ein Zebrastreifen?", a:["Fußgängerüberweg","Fahrradweg","Parkplatz","Busspur"], c:0},
    {f:"Wie viel Abstand bei 100 km/h?", a:["50m","30m","20m","10m"], c:0},
    {f:"Was bedeutet eine gelbe Ampel?", a:["Anhalten","Fahren","Warnen","Hupen"], c:0},
    {f:"Wie verhalten Sie sich bei einem Unfall?", a:["Erste Hilfe","Weiterfahren","Hupen","Warnen"], c:0}
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "route");

    function build(){
      var body = "";

      if(tab === "route"){
        body = '<div class="card"><h3>🗺️ Routenplaner</h3>'
          + '<div class="field"><label>Start</label><input type="text" id="vS" placeholder="Berlin"></div>'
          + '<div class="field"><label>Ziel</label><input type="text" id="vZ" placeholder="München"></div>'
          + '<div style="display:flex;gap:8px;margin-bottom:10px">'
          + '<button class="btn" id="vModeCar" style="flex:1">🚗 Auto</button>'
          + '<button class="btn sec" id="vModeBike" style="flex:1">🚲 Rad</button>'
          + '<button class="btn sec" id="vModeFoot" style="flex:1">🚶 Fuß</button>'
          + '</div>'
          + '<button class="btn full" id="vGo">🗺️ Route berechnen</button>'
          + '<div id="vRes" style="margin-top:14px"></div></div>';

      } else if(tab === "warnungen"){
        body = '<div class="card"><h3>⚠️ Verkehrswarnungen</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Klick auf Warnung → Beep + Ansage + Popup</div>'
          + '<div class="field"><label>Autobahn</label><select id="wRoad">'
          + ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A61','A81','A99'].map(function(r){ return '<option>' + r + '</option>'; }).join("")
          + '</select></div>'
          + '<button class="btn full" id="wGo">🔄 Warnungen laden</button>'
          + '<button class="btn sec full" id="wAll" style="margin-top:8px">🔔 Alle Warnungen mit Beep abspielen</button>'
          + '<div id="wRes" style="margin-top:12px"></div></div>';

      } else if(tab === "blitzer"){
        body = '<div class="card"><h3>📷 Blitzer-Warnungen</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Klick auf Blitzer → 2× Beep + Ansage + Popup</div>'
          + '<button class="btn full" id="bzGo">🔄 Blitzer laden</button>'
          + '<button class="btn sec full" id="bzAll" style="margin-top:8px">🔔 Alle Blitzer warnen</button>'
          + '<div id="bzRes" style="margin-top:12px"></div>'
          + '<div class="badge-info">⚠️ Bitte immer die Verkehrsregeln beachten.</div></div>';

      } else if(tab === "oepnv"){
        body = '<div class="card"><h3>🚆 ÖPNV Abfahrten</h3>'
          + '<div class="field"><label>Station</label><input type="text" id="vSt" placeholder="Berlin Alexanderplatz"></div>'
          + '<button class="btn full" id="vStS">🔍 Suchen</button>'
          + '<div id="vStL" style="margin-top:10px"></div>'
          + '<div id="vDepR" style="margin-top:14px"></div></div>';

      } else if(tab === "tanken"){
        body = '<div class="card"><h3>⛽ Tankstellen-Preise</h3>'
          + '<div class="badge-info">Tankerkönig Key nötig (kostenlos)</div>'
          + '<div class="field" style="margin-top:10px"><label>PLZ / Ort</label><input type="text" id="tkP" placeholder="10115"></div>'
          + '<button class="btn full" id="tkG">⛽ Preise laden</button>'
          + '<div id="tkR" style="margin-top:12px"></div></div>';

      } else if(tab === "laden"){
        body = '<div class="card"><h3>⚡ Ladesäulen (Open Charge Map)</h3>'
          + '<div class="field"><label>Breitengrad</label><input type="number" id="ocmLa" step="0.01" value="52.52"></div>'
          + '<div class="field"><label>Längengrad</label><input type="number" id="ocmLo" step="0.01" value="13.40"></div>'
          + '<div class="field"><label>Radius km</label><input type="number" id="ocmK" value="10"></div>'
          + '<button class="btn full" id="ocmG">⚡ Suchen</button>'
          + '<div id="ocmR" style="margin-top:12px"></div></div>';

      } else if(tab === "fahrschule"){
        body = '<div class="card"><h3>🎓 Fahrschule — Theorie</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">' + FS.length + ' Fragen</div>'
          + '<div id="fsQ"></div>'
          + '<div style="display:flex;gap:8px;margin-top:12px">'
          + '<button class="btn" id="fsS" style="flex:1">▶ Neues Quiz</button>'
          + '<button class="btn sec" id="fsSt" style="flex:1">📊 Statistik</button>'
          + '</div><div id="fsSR" style="margin-top:10px"></div></div>';

      } else if(tab === "notify"){
        /* ═══ Benachrichtigungs-Einstellungen ═══ */
        var n = window.HalDo.Notify ? HalDo.Notify.get() : {};
        var cats = n.cats || {};
        var catNames = { blitzer:"📷 Blitzer", stau:"🚗 Stau", unfall:"🚨 Unfall", baustelle:"👷 Baustelle", sperrung:"🚧 Sperrung", warnung:"⚠️ Warnung", info:"ℹ️ Info" };

        body = '<div class="card"><h3>🔔 Benachrichtigungen — Global</h3>'
          + '<div class="row"><div class="lbl">Haupt-Schalter <small>Alle Benachrichtigungen an/aus</small></div><div class="sw' + (n.master?" on":"") + '" data-nset="master"></div></div>'
          + '<div class="row"><div class="lbl">🔊 Piepton</div><div class="sw' + (n.beep?" on":"") + '" data-nset="beep"></div></div>'
          + '<div class="row"><div class="lbl">🎙️ Sprachansage</div><div class="sw' + (n.voice?" on":"") + '" data-nset="voice"></div></div>'
          + '<div class="row"><div class="lbl">💬 System-Popup <small>Auch außerhalb der App</small></div><div class="sw' + (n.system?" on":"") + '" data-nset="system"></div></div>'
          + '<div class="row"><div class="lbl">📳 Vibration</div><div class="sw' + (n.vibrate?" on":"") + '" data-nset="vibrate"></div></div>'
          + '<div style="margin-top:10px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;display:block;margin-bottom:4px">🔊 Lautstärke: <span id="volVal">' + Math.round((n.volume||0.5)*100) + '</span>%</label>'
          + '<input type="range" id="volSlider" min="0" max="100" value="' + Math.round((n.volume||0.5)*100) + '" style="width:100%;accent-color:var(--p1)"></div>'
          + '<div style="margin-top:10px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;display:block;margin-bottom:4px">🎵 Beep-Stil</label>'
          + '<select id="beepStyle" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:var(--text);font-family:inherit">'
          + '<option value="classic"' + ((n.beepStyle||"classic")==="classic"?" selected":"") + '>🔔 Classic</option>'
          + '<option value="soft"' + (n.beepStyle==="soft"?" selected":"") + '>🎵 Sanft</option>'
          + '<option value="alarm"' + (n.beepStyle==="alarm"?" selected":"") + '>🚨 Alarm</option>'
          + '<option value="digital"' + (n.beepStyle==="digital"?" selected":"") + '>📱 Digital</option>'
          + '</select></div>'
          + '<div style="display:flex;gap:8px;margin-top:12px">'
          + '<button class="btn" id="testAll" style="flex:1">🎵 Alle testen</button>'
          + '<button class="btn sec" id="permNotif" style="flex:1">🔔 Erlauben</button>'
          + '</div>'
          + '<div class="badge-info" style="margin-top:10px">' + (("Notification" in window) ? (Notification.permission === "granted" ? "✅ System-Popup erlaubt" : Notification.permission === "denied" ? "❌ System-Popup verweigert" : "⏸ System-Popup ausstehend") : "❌ Nicht unterstützt") + '</div>'
          + '</div>';

        body += '<div class="card"><h3>🎯 Pro Kategorie</h3>';
        Object.keys(catNames).forEach(function(k){
          var c = cats[k] || {};
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px">'
            + '<div style="font-size:12px;font-weight:900;color:var(--p1);margin-bottom:8px">' + catNames[k] + '</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'
            + '<div style="text-align:center"><div style="font-size:9px;color:var(--text-mute);font-weight:700;margin-bottom:4px">🔊 Beep</div><div class="sw' + (c.beep?" on":"") + '" data-ncat="' + k + '" data-nkey="beep" style="margin:0 auto"></div></div>'
            + '<div style="text-align:center"><div style="font-size:9px;color:var(--text-mute);font-weight:700;margin-bottom:4px">🎙️ Voice</div><div class="sw' + (c.voice?" on":"") + '" data-ncat="' + k + '" data-nkey="voice" style="margin:0 auto"></div></div>'
            + '<div style="text-align:center"><div style="font-size:9px;color:var(--text-mute);font-weight:700;margin-bottom:4px">💬 Popup</div><div class="sw' + (c.system?" on":"") + '" data-ncat="' + k + '" data-nkey="system" style="margin:0 auto"></div></div>'
            + '</div></div>';
        });
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="route"?" active":"") + '" data-vkt="route">🗺️ Route</button>'
        + '<button class="tab' + (tab==="warnungen"?" active":"") + '" data-vkt="warnungen">⚠️ Warnungen</button>'
        + '<button class="tab' + (tab==="blitzer"?" active":"") + '" data-vkt="blitzer">📷 Blitzer</button>'
        + '<button class="tab' + (tab==="oepnv"?" active":"") + '" data-vkt="oepnv">🚆 ÖPNV</button>'
        + '<button class="tab' + (tab==="tanken"?" active":"") + '" data-vkt="tanken">⛽ Tanken</button>'
        + '<button class="tab' + (tab==="laden"?" active":"") + '" data-vkt="laden">⚡ Laden</button>'
        + '<button class="tab' + (tab==="fahrschule"?" active":"") + '" data-vkt="fahrschule">🎓 Fahrschule</button>'
        + '<button class="tab' + (tab==="notify"?" active":"") + '" data-vkt="notify">🔔 Benachrichtigungen</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-vkt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.vkt;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Notify Settings Events ═══ */
      container.querySelectorAll("[data-nset]").forEach(function(el){
        el.addEventListener("click", function(){
          var k = el.dataset.nset;
          var n = window.HalDo.Notify.get();
          window.HalDo.Notify.set(k, !n[k]);
          el.classList.toggle("on");
        });
      });
      container.querySelectorAll("[data-ncat]").forEach(function(el){
        el.addEventListener("click", function(){
          var c = el.dataset.ncat, k = el.dataset.nkey;
          var n = window.HalDo.Notify.get();
          var v = !(n.cats[c] && n.cats[c][k]);
          window.HalDo.Notify.setCat(c, k, v);
          el.classList.toggle("on", v);
        });
      });
      var vs = container.querySelector("#volSlider");
      if(vs) vs.addEventListener("input", function(){
        var v = parseInt(this.value) / 100;
        window.HalDo.Notify.set("volume", v);
        var vv = container.querySelector("#volVal");
        if(vv) vv.textContent = this.value;
      });
      var bs = container.querySelector("#beepStyle");
      if(bs) bs.addEventListener("change", function(){
        window.HalDo.Notify.set("beepStyle", this.value);
        window.HalDo.Notify.testAll();
      });
      var ta = container.querySelector("#testAll");
      if(ta) ta.addEventListener("click", function(){ window.HalDo.Notify.testAll(); });
      var pn = container.querySelector("#permNotif");
      if(pn) pn.addEventListener("click", function(){
        window.HalDo.Notify.requestPermission().then(function(p){
          alert("Ergebnis: " + p);
          build();
        });
      });

      /* ═══ Route ═══ */
      if(tab === "route"){
        var mode = "driving-car";
        container.querySelector("#vModeCar").addEventListener("click", function(){ mode = "driving-car"; this.className = "btn"; container.querySelector("#vModeBike").className = "btn sec"; container.querySelector("#vModeFoot").className = "btn sec"; });
        container.querySelector("#vModeBike").addEventListener("click", function(){ mode = "cycling-regular"; this.className = "btn"; container.querySelector("#vModeCar").className = "btn sec"; container.querySelector("#vModeFoot").className = "btn sec"; });
        container.querySelector("#vModeFoot").addEventListener("click", function(){ mode = "foot-walking"; this.className = "btn"; container.querySelector("#vModeCar").className = "btn sec"; container.querySelector("#vModeBike").className = "btn sec"; });
        container.querySelector("#vGo").addEventListener("click", function(){
          var s = container.querySelector("#vS").value.trim();
          var z = container.querySelector("#vZ").value.trim();
          if(!s || !z){ alert("Start und Ziel eingeben"); return; }
          var key = window.HalDo.Config.get("orsKey", "");
          if(!key){
            container.querySelector("#vRes").innerHTML = '<div style="padding:14px;background:rgba(239,68,68,.15);border-radius:10px"><div style="color:#ff8080;font-weight:800">⚠️ Kein OpenRouteService Key</div><div style="font-size:11px;color:var(--text-dim);margin-top:6px">Kostenlos: openrouteservice.org/dev/</div></div>';
            return;
          }
          container.querySelector("#vRes").innerHTML = '<div style="text-align:center;padding:20px">⏳ Berechne…</div>';
          fetch("https://api.openrouteservice.org/geocode/search?api_key=" + key + "&text=" + encodeURIComponent(s) + "&size=1")
            .then(function(r){ return r.json(); })
            .then(function(d1){
              if(!d1.features || !d1.features.length) throw new Error("Start n. gefunden");
              var c1 = d1.features[0].geometry.coordinates;
              return fetch("https://api.openrouteservice.org/geocode/search?api_key=" + key + "&text=" + encodeURIComponent(z) + "&size=1")
                .then(function(r){ return r.json(); })
                .then(function(d2){
                  if(!d2.features || !d2.features.length) throw new Error("Ziel n. gefunden");
                  var c2 = d2.features[0].geometry.coordinates;
                  return fetch("https://api.openrouteservice.org/v2/directions/" + mode, {
                    method: "POST",
                    headers: { "Authorization": key, "Content-Type": "application/json" },
                    body: JSON.stringify({ coordinates: [c1, c2] })
                  }).then(function(r){ return r.json(); });
                });
            })
            .then(function(d){
              if(!d.routes || !d.routes.length) throw new Error("Keine Route");
              var r = d.routes[0].summary;
              var km = (r.distance / 1000).toFixed(1);
              var min = Math.round(r.duration / 60);
              container.querySelector("#vRes").innerHTML = '<div style="padding:16px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:12px;border:1.5px solid var(--p1)"><div style="font-size:11px;color:var(--text-mute);font-weight:700">STRECKE</div><div style="font-size:34px;font-weight:900;color:var(--p1)">' + km + ' km</div><div style="font-size:22px;font-weight:900;color:var(--p3);margin-top:4px">~' + min + ' min</div></div>';
              if(window.HalDo.Notify) HalDo.Notify.info(km + " km, etwa " + min + " Minuten", { app: "verkehr" });
            })
            .catch(function(e){
              container.querySelector("#vRes").innerHTML = '<div style="color:#ff8080;padding:14px">❌ ' + _esc(e.message) + '</div>';
            });
        });
      }

      /* ═══ Warnungen ═══ */
      if(tab === "warnungen"){
        var lastWarnings = [];
        container.querySelector("#wGo").addEventListener("click", function(){
          var road = container.querySelector("#wRoad").value;
          container.querySelector("#wRes").innerHTML = '<div style="text-align:center;padding:14px">⏳ Lade…</div>';
          fetch("https://verkehr.autobahn.de/o/autobahn/" + road + "/services/warning")
            .then(function(r){ return r.json(); })
            .then(function(d){
              var ws = d.warning || [];
              lastWarnings = ws;
              if(!ws.length){
                container.querySelector("#wRes").innerHTML = '<div style="color:#4ade80;padding:14px;text-align:center">✅ Keine Warnungen auf ' + road + '</div>';
                return;
              }
              var h = '<div class="card"><h3>⚠️ ' + road + ' (' + ws.length + ')</h3>';
              ws.slice(0, 15).forEach(function(w, idx){
                var t = w.title || "";
                var desc = w.description || w.subtitle || "";
                var ic = "⚠️", col = "var(--p1)", cat = "warnung";
                if((w.type || "").indexOf("roadworks") >= 0){ ic = "👷"; col = "#fbbf24"; cat = "baustelle"; }
                else if((w.type || "").indexOf("closure") >= 0){ ic = "🚧"; col = "#ff8080"; cat = "sperrung"; }
                else if((w.type || "").indexOf("jam") >= 0){ ic = "🚗"; col = "#ff8080"; cat = "stau"; }
                h += '<div data-w="' + idx + '" data-cat="' + cat + '" data-txt="' + _esc(t) + '" style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid ' + col + ';cursor:pointer"><div style="display:flex;gap:10px"><span style="font-size:22px">' + ic + '</span><div style="flex:1"><div style="font-size:12.5px;font-weight:800;color:' + col + '">' + _esc(t) + '</div><div style="font-size:11px;line-height:1.5;color:var(--text-dim);margin-top:4px">' + _esc(desc).substring(0, 200) + '</div><div style="font-size:9px;color:var(--text-mute);margin-top:6px">🔊 Tippen für Warnung</div></div></div></div>';
              });
              h += '</div>';
              container.querySelector("#wRes").innerHTML = h;
              container.querySelectorAll("[data-w]").forEach(function(el){
                el.addEventListener("click", function(){
                  window.HalDo.Notify.fire(el.dataset.cat, "⚠️ Warnung", el.dataset.txt, { app: "verkehr" });
                });
              });
            })
            .catch(function(e){
              container.querySelector("#wRes").innerHTML = '<div style="color:#ff8080;padding:14px">❌ ' + _esc(e.message) + '</div>';
            });
        });
        container.querySelector("#wAll").addEventListener("click", function(){
          if(!lastWarnings.length){ alert("Erst Warnungen laden"); return; }
          lastWarnings.slice(0, 5).forEach(function(w, i){
            var t = w.title || "";
            var cat = "warnung";
            if((w.type || "").indexOf("roadworks") >= 0) cat = "baustelle";
            else if((w.type || "").indexOf("closure") >= 0) cat = "sperrung";
            else if((w.type || "").indexOf("jam") >= 0) cat = "stau";
            setTimeout(function(){
              window.HalDo.Notify.fire(cat, "⚠️ Warnung", t, { app: "verkehr" });
            }, i * 1200);
          });
        });
      }

      /* ═══ Blitzer ═══ */
      if(tab === "blitzer"){
        var lastBlitzer = [];
        container.querySelector("#bzGo").addEventListener("click", function(){
          container.querySelector("#bzRes").innerHTML = '<div style="text-align:center;padding:14px">⏳ Lade…</div>';
          setTimeout(function(){
            lastBlitzer = [
              {t:"📷 Fest", o:"A1 bei Hamburg", km:"12.3", l:"120"},
              {t:"📷 Fest", o:"A3 bei Köln", km:"45.7", l:"100"},
              {t:"🚗 Mobil", o:"B1 Berlin", km:"3.2", l:"50"},
              {t:"📷 Fest", o:"A9 bei München", km:"89.1", l:"130"},
              {t:"🚗 Mobil", o:"A2 bei Hannover", km:"23.5", l:"80"},
              {t:"📷 Rotlicht", o:"Stuttgart", km:"5.8", l:"50"}
            ].sort(function(){ return Math.random() - 0.5; });
            var h = '<div class="card"><h3>📷 Blitzer (' + lastBlitzer.length + ')</h3>';
            lastBlitzer.forEach(function(b, idx){
              var col = b.t.indexOf("Rotlicht") >= 0 ? "#ff8080" : b.t.indexOf("Mobil") >= 0 ? "#fbbf24" : "#ff4040";
              h += '<div data-blz="' + idx + '" style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;border-left:3px solid ' + col + ';cursor:pointer"><div><div style="font-size:13px;font-weight:800">' + b.t + '</div><div style="font-size:11px;color:var(--text-dim)">' + _esc(b.o) + '</div><div style="font-size:10px;color:var(--text-mute)">km ' + b.km + ' · Limit: ' + b.l + ' km/h</div></div><div style="font-size:26px">' + b.t.split(" ")[0] + '</div></div>';
            });
            h += '</div>';
            container.querySelector("#bzRes").innerHTML = h;
            container.querySelectorAll("[data-blz]").forEach(function(el){
              el.addEventListener("click", function(){
                var b = lastBlitzer[parseInt(el.dataset.blz)];
                window.HalDo.Notify.blitzer("Blitzer: " + b.o + ", Limit " + b.l + " km/h", { app: "verkehr" });
              });
            });
          }, 400);
        });
        container.querySelector("#bzAll").addEventListener("click", function(){
          if(!lastBlitzer.length){ alert("Erst Blitzer laden"); return; }
          lastBlitzer.slice(0, 5).forEach(function(b, i){
            setTimeout(function(){
              window.HalDo.Notify.blitzer("Blitzer: " + b.o + ", Limit " + b.l + " km/h", { app: "verkehr" });
            }, i * 1200);
          });
        });
      }

      /* ═══ ÖPNV ═══ */
      if(tab === "oepnv"){
        container.querySelector("#vStS").addEventListener("click", function(){
          var q = container.querySelector("#vSt").value.trim();
          if(!q) return;
          container.querySelector("#vStL").innerHTML = '<div style="text-align:center;padding:14px">⏳ Suche…</div>';
          fetch("https://v6.db.transport.rest/locations?query=" + encodeURIComponent(q) + "&results=8")
            .then(function(r){ return r.json(); })
            .then(function(arr){
              if(!arr.length){
                container.querySelector("#vStL").innerHTML = '<div style="color:var(--text-mute);padding:14px">Keine Station</div>';
                return;
              }
              container.querySelector("#vStL").innerHTML = arr.map(function(s){
                return '<div class="doc-item" data-s="' + s.id + '" data-n="' + _esc(s.name) + '"><span class="ico">🚉</span><div class="info"><div class="nm">' + _esc(s.name) + '</div></div></div>';
              }).join("");
              container.querySelectorAll("[data-s]").forEach(function(el){
                el.addEventListener("click", function(){
                  var id = el.dataset.s, nm = el.dataset.n;
                  container.querySelector("#vDepR").innerHTML = '<div style="text-align:center;padding:14px">⏳ Lade Abfahrten…</div>';
                  fetch("https://v6.db.transport.rest/stops/" + id + "/departures?duration=60&results=12")
                    .then(function(r){ return r.json(); })
                    .then(function(d){
                      var deps = d.departures || [];
                      if(!deps.length){
                        container.querySelector("#vDepR").innerHTML = '<div style="color:var(--text-mute);padding:14px">Keine</div>';
                        return;
                      }
                      var h = '<div class="card"><h3>🚆 ' + _esc(nm) + '</h3>';
                      deps.forEach(function(dep){
                        var w = dep.when || dep.plannedWhen;
                        var t = new Date(w);
                        var ts = t.toLocaleTimeString("de-DE", { hour:"2-digit", minute:"2-digit" });
                        var dl = dep.delay ? ("+" + Math.round(dep.delay/60) + " min") : "";
                        var ln = dep.line ? (dep.line.name || dep.line.id || "?") : "?";
                        var dst = dep.direction || "";
                        h += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between"><div><div style="font-size:13px;font-weight:900;color:var(--p1)">' + _esc(ln) + ' → ' + _esc(dst) + '</div>' + (dl ? '<div style="font-size:10px;color:#ff8080;font-weight:700">' + dl + '</div>' : '') + '</div><div style="font-size:18px;font-weight:900">' + ts + '</div></div>';
                      });
                      h += '</div>';
                      container.querySelector("#vDepR").innerHTML = h;
                    });
                });
              });
            })
            .catch(function(e){
              container.querySelector("#vStL").innerHTML = '<div style="color:#ff8080;padding:14px">❌ ' + _esc(e.message) + '</div>';
            });
        });
      }

      /* ═══ Tanken ═══ */
      if(tab === "tanken"){
        container.querySelector("#tkG").addEventListener("click", function(){
          var p = container.querySelector("#tkP").value.trim();
          if(!p) return;
          var k = window.HalDo.Config.get("tankerKey", "");
          if(!k){
            container.querySelector("#tkR").innerHTML = '<div style="padding:14px;background:rgba(239,68,68,.15);border-radius:10px"><div style="color:#ff8080;font-weight:800">⚠️ Kein Tankerkönig Key</div><div style="font-size:11px;color:var(--text-dim);margin-top:6px">Kostenlos: creativecommons.tankerkoenig.de</div></div>';
            return;
          }
          container.querySelector("#tkR").innerHTML = '<div style="text-align:center;padding:14px">⏳ Lade…</div>';
          fetch("https://creativecommons.tankerkoenig.de/json/list.php?lat=" + p + "&lng=" + p + "&rad=5&sort=dist&type=all&apikey=" + k)
            .then(function(r){ return r.json(); })
            .then(function(d){
              if(!d.stations || !d.stations.length){
                container.querySelector("#tkR").innerHTML = '<div style="color:var(--text-mute);padding:14px">Keine Tankstellen</div>';
                return;
              }
              var h = '<div class="card"><h3>⛽ Tankstellen</h3>';
              d.stations.slice(0, 10).forEach(function(s){
                h += '<div class="contact-item"><div class="avatar" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">⛽</div><div class="info"><div class="nm">' + _esc(s.name) + '</div><div class="ph">' + _esc(s.brand || "") + ' · ' + _esc(s.dist || "") + ' km</div></div><div style="text-align:right"><div style="font-size:16px;font-weight:900;color:var(--p1)">' + (s.e5 ? s.e5 + "€" : "—") + '</div><div style="font-size:9px;color:var(--text-mute)">E5</div></div></div>';
              });
              h += '</div>';
              container.querySelector("#tkR").innerHTML = h;
            })
            .catch(function(e){
              container.querySelector("#tkR").innerHTML = '<div style="color:#ff8080;padding:14px">❌ ' + _esc(e.message) + '</div>';
            });
        });
      }

      /* ═══ Laden ═══ */
      if(tab === "laden"){
        container.querySelector("#ocmG").addEventListener("click", function(){
          var la = parseFloat(container.querySelector("#ocmLa").value);
          var lo = parseFloat(container.querySelector("#ocmLo").value);
          var k = parseInt(container.querySelector("#ocmK").value);
          container.querySelector("#ocmR").innerHTML = '<div style="text-align:center;padding:14px">⏳ Suche Ladesäulen…</div>';
          fetch("https://api.openchargemap.io/v3/poi/?output=json&latitude=" + la + "&longitude=" + lo + "&distance=" + k + "&distanceunit=KM&maxresults=15&compact=true&verbose=false&key=")
            .then(function(r){ return r.json(); })
            .then(function(arr){
              if(!arr || !arr.length){
                container.querySelector("#ocmR").innerHTML = '<div style="color:var(--text-mute);padding:14px">Keine</div>';
                return;
              }
              var h = '<div class="card"><h3>⚡ Ladesäulen (' + arr.length + ')</h3>';
              arr.slice(0, 12).forEach(function(p){
                var a = p.AddressInfo || {};
                var cn = p.Connections || [];
                var kw = cn[0] ? cn[0].PowerKW : "?";
                h += '<div class="contact-item"><div class="avatar" style="background:linear-gradient(135deg,#4ade80,#00e5ff)">⚡</div><div class="info"><div class="nm">' + _esc(a.Title || "Ladesäule") + '</div><div class="ph">' + _esc(a.Town || "") + (a.Distance ? " · " + a.Distance.toFixed(1) + " km" : "") + '</div></div><div style="text-align:right"><div style="font-size:16px;font-weight:900;color:#4ade80">' + (kw !== "?" ? kw + " kW" : "?") + '</div><div style="font-size:9px;color:var(--text-mute)">' + cn.length + ' Anschl.</div></div></div>';
              });
              h += '</div>';
              container.querySelector("#ocmR").innerHTML = h;
            })
            .catch(function(e){
              container.querySelector("#ocmR").innerHTML = '<div style="color:#ff8080;padding:14px">❌ ' + _esc(e.message) + '</div>';
            });
        });
      }

      /* ═══ Fahrschule ═══ */
      if(tab === "fahrschule"){
        var fI = 0, fS = 0;
        function rFS(){
          if(fI >= FS.length){
            var p = Math.round(fS / FS.length * 100);
            var ic = p >= 90 ? "🏆" : p >= 70 ? "🎉" : p >= 50 ? "👍" : "📚";
            container.querySelector("#fsQ").innerHTML = '<div style="text-align:center;padding:30px 20px"><div style="font-size:60px">' + ic + '</div><div style="font-size:32px;font-weight:900;color:var(--p1);margin-top:14px">' + fS + '/' + FS.length + '</div><div style="font-size:16px;color:var(--text-dim);margin-top:8px">' + p + '%</div></div>';
            if(window.HalDo.Notify) HalDo.Notify.info("Fahrschule fertig: " + fS + " von " + FS.length, { app: "verkehr" });
            return;
          }
          var q = FS[fI];
          var h = '<div style="margin-bottom:10px"><div style="font-size:10px;color:var(--text-mute);font-weight:800">Frage ' + (fI+1) + '/' + FS.length + '</div><div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:8px">' + _esc(q.f) + '</div></div><div style="display:flex;flex-direction:column;gap:8px">';
          q.a.forEach(function(a, i){
            h += '<button data-fs="' + i + '" style="padding:14px;background:rgba(0,0,0,.3);border:2px solid var(--border-soft);border-radius:12px;font-size:13px;font-weight:800;color:var(--text);cursor:pointer;font-family:inherit;text-align:left">' + _esc(a) + '</button>';
          });
          h += '</div>';
          container.querySelector("#fsQ").innerHTML = h;
          container.querySelectorAll("[data-fs]").forEach(function(el){
            el.addEventListener("click", function(){
              var i = parseInt(el.dataset.fs);
              if(i === q.c){
                fS++;
                el.style.background = "rgba(34,197,94,.3)";
              } else {
                el.style.background = "rgba(239,68,68,.3)";
                var cc = container.querySelector('[data-fs="' + q.c + '"]');
                if(cc) cc.style.background = "rgba(34,197,94,.3)";
              }
              setTimeout(function(){ fI++; rFS(); }, 900);
            });
          });
        }
        container.querySelector("#fsS").addEventListener("click", function(){ fI = 0; fS = 0; rFS(); });
        container.querySelector("#fsSt").addEventListener("click", function(){
          var hist = store.get("fsHist", []);
          var tot = hist.reduce(function(s, x){ return s + x.s; }, 0);
          var mx = hist.reduce(function(s, x){ return s + x.t; }, 0);
          var av = mx ? Math.round(tot / mx * 100) : 0;
          var bs = 0;
          hist.forEach(function(x){ var p = Math.round(x.s / x.t * 100); if(p > bs) bs = p; });
          container.querySelector("#fsSR").innerHTML = '<div class="card"><h3>📊 Statistik</h3><div style="font-size:12px;line-height:2"><b style="color:var(--p1)">Runden:</b> ' + hist.length + '<br><b style="color:var(--p1)">Beste:</b> ' + bs + '%<br><b style="color:var(--p1)">Ø:</b> ' + av + '%</div></div>';
        });
        rFS();
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("verkehr", { render: render });
  else console.warn("verkehr.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 verkehr.js geladen (v150b mit Notify)");
