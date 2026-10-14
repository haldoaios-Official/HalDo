/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WERKZEUGE APP (v150)
   Rechner · Einheiten · QR · Timer · Zufall · Notizen
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "rechner");

    function build(){
      var body = "";

      /* ═══ RECHNER ═══ */
      if(tab === "rechner"){
        body = '<div class="card"><h3>🔢 Taschenrechner</h3>'
          + '<div style="background:rgba(0,0,0,.4);padding:14px;border-radius:10px;font-size:26px;font-weight:900;color:var(--p1);text-align:right;font-family:ui-monospace;min-height:60px;margin-bottom:10px;overflow-x:auto" id="wrDisp">0</div>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'
          + ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+","C","(",")","⌫"].map(function(b){
              return '<button data-wk="' + b + '" style="padding:16px;background:rgba(0,229,255,.1);border:var(--border-soft);border-radius:10px;font-size:17px;font-weight:800;cursor:pointer;color:var(--p1);font-family:inherit">' + b + '</button>';
            }).join("")
          + '</div></div>';

      /* ═══ EINHEITEN ═══ */
      } else if(tab === "einheiten"){
        var UNITS = {
          "📏 Länge": { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, ft:0.3048, inch:0.0254, yd:0.9144 },
          "⚖️ Gewicht": { kg:1, g:0.001, mg:0.000001, t:1000, lb:0.453592, oz:0.0283495 },
          "🌡️ Temperatur": { C:1, F:1, K:1 },
          "⏱️ Zeit": { s:1, min:60, h:3600, day:86400, week:604800, year:31536000 },
          "💾 Daten": { B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 },
          "📐 Fläche": { m2:1, km2:1000000, cm2:0.0001, ha:10000, acre:4046.86 }
        };
        body = '<div class="card"><h3>📐 Einheiten-Umrechner</h3>'
          + '<div class="field"><label>Kategorie</label><select id="uCat">'
          + Object.keys(UNITS).map(function(c){ return '<option>' + c + '</option>'; }).join("")
          + '</select></div>'
          + '<div class="field"><label>Wert</label><input type="number" id="uVal" value="1"></div>'
          + '<div class="unit-row">'
          + '<select id="uFrom"></select>'
          + '<div class="arrow">→</div>'
          + '<select id="uTo"></select>'
          + '</div>'
          + '<div id="uRes" style="margin-top:12px;padding:16px;background:rgba(0,229,255,.1);border-radius:10px;font-size:22px;font-weight:900;color:var(--p1);text-align:center;font-family:ui-monospace;word-break:break-all">—</div>'
          + '</div>';

      /* ═══ QR ═══ */
      } else if(tab === "qr"){
        body = '<div class="card"><h3>📱 QR-Code Generator</h3>'
          + '<div class="field"><label>Text / URL</label><input type="text" id="qrIn" placeholder="https://..." value="https://haldoaios-official.github.io/HalDo/"></div>'
          + '<div class="field"><label>Größe</label><select id="qrSize">'
          + '<option value="150">Klein (150px)</option>'
          + '<option value="220" selected>Mittel (220px)</option>'
          + '<option value="320">Groß (320px)</option>'
          + '</select></div>'
          + '<button class="btn full" id="qrGo">QR generieren</button>'
          + '<div id="qrRes" style="margin-top:14px;text-align:center"></div>'
          + '</div>';

      /* ═══ TIMER ═══ */
      } else if(tab === "timer"){
        body = '<div class="card"><h3>⏱️ Stoppuhr</h3>'
          + '<div id="tmD" style="font-size:52px;font-weight:900;color:var(--p1);text-align:center;font-family:ui-monospace;padding:20px 0">00:00.00</div>'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="tmS" style="flex:1">▶ Start</button>'
          + '<button class="btn sec" id="tmR" style="flex:1">🔄 Reset</button>'
          + '</div></div>'
          + '<div class="card"><h3>⏲ Countdown</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="number" id="cdM" value="5" min="0" placeholder="Min" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:14px;text-align:center">'
          + '<input type="number" id="cdS" value="0" min="0" max="59" placeholder="Sek" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:14px;text-align:center">'
          + '</div>'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="cdG" style="flex:1">▶ Start</button>'
          + '<button class="btn sec" id="cdX" style="flex:1">⏹ Stop</button>'
          + '</div>'
          + '<div id="cdD" style="text-align:center;font-size:40px;font-weight:900;color:var(--p3);margin-top:14px;font-family:ui-monospace">—</div>'
          + '</div>';

      /* ═══ ZUFALL ═══ */
      } else if(tab === "zufall"){
        body = '<div class="card"><h3>🎲 Zufallsgenerator</h3>'
          + '<div class="field"><label>Würfel (1-6)</label><button class="btn full" id="rD">🎲 Würfeln</button></div>'
          + '<div style="text-align:center;font-size:52px;font-weight:900;color:var(--p1);margin:10px 0" id="dR">—</div>'
          + '<div class="field" style="margin-top:14px"><label>Zufallszahl (Bereich)</label><input type="text" id="rR" value="1-100"></div>'
          + '<button class="btn full" id="rN">Zahl ziehen</button>'
          + '<div style="text-align:center;font-size:32px;font-weight:900;color:var(--p3);margin-top:10px" id="nR">—</div>'
          + '<div class="field" style="margin-top:14px"><label>Münze</label><button class="btn full sec" id="rC">🪙 Werfen</button></div>'
          + '<div style="text-align:center;font-size:40px;margin-top:10px" id="cR">—</div>'
          + '<div class="field" style="margin-top:14px"><label>Lotto (6 aus 49)</label><button class="btn full" id="rL">🍀 Zahlen ziehen</button></div>'
          + '<div id="lR" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px"></div>'
          + '</div>';

      /* ═══ NOTIZEN ═══ */
      } else if(tab === "notiz"){
        var n = store.get("notes", "");
        body = '<div class="card"><h3>📝 Schnellnotizen</h3>'
          + '<textarea id="noteI" style="width:100%;min-height:300px;padding:14px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-family:inherit;font-size:13px;line-height:1.6;resize:vertical" placeholder="Schreib hier...">' + _esc(n) + '</textarea>'
          + '<div style="display:flex;gap:8px;margin-top:10px">'
          + '<button class="btn" id="noteS" style="flex:1">💾 Speichern</button>'
          + '<button class="btn sec" id="noteC" style="flex:1">🗑️ Löschen</button>'
          + '</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);text-align:center;margin-top:8px">Zeichen: <span id="noteCount">' + n.length + '</span> · Zeilen: ' + (n ? n.split("\n").length : 0) + '</div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="rechner"?" active":"") + '" data-wkt="rechner">🔢 Rechner</button>'
        + '<button class="tab' + (tab==="einheiten"?" active":"") + '" data-wkt="einheiten">📐 Einheiten</button>'
        + '<button class="tab' + (tab==="qr"?" active":"") + '" data-wkt="qr">📱 QR</button>'
        + '<button class="tab' + (tab==="timer"?" active":"") + '" data-wkt="timer">⏱️ Timer</button>'
        + '<button class="tab' + (tab==="zufall"?" active":"") + '" data-wkt="zufall">🎲 Zufall</button>'
        + '<button class="tab' + (tab==="notiz"?" active":"") + '" data-wkt="notiz">📝 Notiz</button>'
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-wkt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.wkt;
          store.set("tab", tab);
          build();
        });
      });

      /* Rechner */
      if(tab === "rechner"){
        var disp = container.querySelector("#wrDisp");
        var expr = "";
        container.querySelectorAll("[data-wk]").forEach(function(el){
          el.addEventListener("click", function(){
            var v = el.dataset.wk;
            if(v === "C"){ expr = ""; disp.textContent = "0"; }
            else if(v === "="){
              try {
                var r = Function('"use strict";return(' + expr + ')')();
                disp.textContent = r;
                if(window.HalDo.Voice) HalDo.Voice.speak("Ergebnis: " + r);
                expr = String(r);
              } catch(e){ disp.textContent = "❌"; }
            }
            else if(v === "⌫"){ expr = expr.slice(0, -1); disp.textContent = expr || "0"; }
            else { expr += v; disp.textContent = expr; }
          });
        });
      }

      /* Einheiten */
      if(tab === "einheiten"){
        var UNITS = {
          "📏 Länge": { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, ft:0.3048, inch:0.0254, yd:0.9144 },
          "⚖️ Gewicht": { kg:1, g:0.001, mg:0.000001, t:1000, lb:0.453592, oz:0.0283495 },
          "🌡️ Temperatur": { C:1, F:1, K:1 },
          "⏱️ Zeit": { s:1, min:60, h:3600, day:86400, week:604800, year:31536000 },
          "💾 Daten": { B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 },
          "📐 Fläche": { m2:1, km2:1000000, cm2:0.0001, ha:10000, acre:4046.86 }
        };
        var cat = Object.keys(UNITS)[0];

        function fillOpts(){
          var u = UNITS[cat];
          var k = Object.keys(u);
          var from = container.querySelector("#uFrom");
          var to = container.querySelector("#uTo");
          from.innerHTML = k.map(function(x){ return '<option>' + x + '</option>'; }).join("");
          to.innerHTML = k.map(function(x){ return '<option>' + x + '</option>'; }).join("");
          to.selectedIndex = Math.min(1, k.length - 1);
          conv();
        }
        function conv(){
          var u = UNITS[cat];
          var v = parseFloat(container.querySelector("#uVal").value) || 0;
          var f = container.querySelector("#uFrom").value;
          var t = container.querySelector("#uTo").value;
          if(cat === "🌡️ Temperatur"){
            var celsius = v;
            if(f === "F") celsius = (v - 32) * 5/9;
            else if(f === "K") celsius = v - 273.15;
            var out = celsius;
            if(t === "F") out = celsius * 9/5 + 32;
            else if(t === "K") out = celsius + 273.15;
            container.querySelector("#uRes").textContent = out.toFixed(4) + " " + t;
            return;
          }
          container.querySelector("#uRes").textContent = (v * u[f] / u[t]).toFixed(6) + " " + t;
        }
        container.querySelector("#uCat").addEventListener("change", function(){ cat = this.value; fillOpts(); });
        container.querySelector("#uVal").addEventListener("input", conv);
        container.querySelector("#uFrom").addEventListener("change", conv);
        container.querySelector("#uTo").addEventListener("change", conv);
        fillOpts();
      }

      /* QR */
      if(tab === "qr"){
        container.querySelector("#qrGo").addEventListener("click", function(){
          var t = container.querySelector("#qrIn").value;
          if(!t) return;
          var size = container.querySelector("#qrSize").value;
          var u = "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodeURIComponent(t);
          container.querySelector("#qrRes").innerHTML = '<img src="' + u + '" style="border-radius:12px;border:3px solid var(--p1);max-width:100%" alt="QR">';
        });
      }

      /* Timer */
      if(tab === "timer"){
        var t0 = 0, iv = null;
        var dispT = container.querySelector("#tmD");
        function upd(){
          var d = Date.now() - t0;
          var ms = Math.floor(d % 1000 / 10);
          var s = Math.floor(d / 1000) % 60;
          var m = Math.floor(d / 60000);
          dispT.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(ms).padStart(2, "0");
        }
        container.querySelector("#tmS").addEventListener("click", function(){
          if(iv){ clearInterval(iv); iv = null; this.textContent = "▶ Start"; }
          else {
            t0 = Date.now() - t0;
            t0 = Date.now() - (Date.now() - t0);
            t0 = Date.now() - (t0 || 0);
            t0 = Date.now();
            iv = setInterval(upd, 50);
            this.textContent = "⏸ Stop";
          }
        });
        container.querySelector("#tmR").addEventListener("click", function(){
          if(iv){ clearInterval(iv); iv = null; container.querySelector("#tmS").textContent = "▶ Start"; }
          t0 = 0;
          dispT.textContent = "00:00.00";
        });

        var cdIv = null;
        container.querySelector("#cdG").addEventListener("click", function(){
          if(cdIv){ clearInterval(cdIv); cdIv = null; }
          var m = parseInt(container.querySelector("#cdM").value) || 0;
          var s = parseInt(container.querySelector("#cdS").value) || 0;
          var rem = m * 60 + s;
          if(rem <= 0) return;
          function tickCd(){
            if(rem < 0){
              clearInterval(cdIv); cdIv = null;
              container.querySelector("#cdD").textContent = "⏰ Fertig!";
              if(window.HalDo.Voice) HalDo.Voice.speak("Timer abgelaufen, Bruder!");
              if(typeof Beep !== "undefined") Beep.warnung();
              return;
            }
            var mm = Math.floor(rem / 60), ss = rem % 60;
            container.querySelector("#cdD").textContent = String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
            rem--;
          }
          tickCd();
          cdIv = setInterval(tickCd, 1000);
        });
        container.querySelector("#cdX").addEventListener("click", function(){
          if(cdIv){ clearInterval(cdIv); cdIv = null; }
        });
      }

      /* Zufall */
      if(tab === "zufall"){
        container.querySelector("#rD").addEventListener("click", function(){
          var r = Math.floor(Math.random() * 6) + 1;
          container.querySelector("#dR").textContent = r;
          if(window.HalDo.Voice) HalDo.Voice.speak(String(r));
        });
        container.querySelector("#rN").addEventListener("click", function(){
          var p = container.querySelector("#rR").value.split("-");
          var lo = parseInt(p[0]) || 1;
          var hi = parseInt(p[1]) || 100;
          var r = Math.floor(Math.random() * (hi - lo + 1)) + lo;
          container.querySelector("#nR").textContent = r;
          if(window.HalDo.Voice) HalDo.Voice.speak(String(r));
        });
        container.querySelector("#rC").addEventListener("click", function(){
          var r = Math.random() < 0.5 ? "🪙 Kopf" : "🪙 Zahl";
          container.querySelector("#cR").textContent = r;
          if(window.HalDo.Voice) HalDo.Voice.speak(r.indexOf("Kopf") >= 0 ? "Kopf" : "Zahl");
        });
        container.querySelector("#rL").addEventListener("click", function(){
          var nums = [], i = 0;
          while(i < 6){
            var r = Math.floor(Math.random() * 49) + 1;
            if(nums.indexOf(r) < 0){ nums.push(r); i++; }
          }
          nums.sort(function(a,b){ return a - b; });
          container.querySelector("#lR").innerHTML = nums.map(function(n){
            return '<div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--p1),var(--p3));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:#001428">' + n + '</div>';
          }).join("");
        });
      }

      /* Notizen */
      if(tab === "notiz"){
        var ni = container.querySelector("#noteI");
        var nc = container.querySelector("#noteCount");
        ni.addEventListener("input", function(){
          if(nc) nc.textContent = this.value.length;
        });
        container.querySelector("#noteS").addEventListener("click", function(){
          store.set("notes", ni.value);
          if(window.HalDo.Voice) HalDo.Voice.speak("Notiz gespeichert");
        });
        container.querySelector("#noteC").addEventListener("click", function(){
          if(!confirm("Notiz löschen?")) return;
          ni.value = "";
          store.set("notes", "");
          if(nc) nc.textContent = 0;
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("werkzeuge", { render: render });
  else console.warn("werkzeuge.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 werkzeuge.js geladen");
