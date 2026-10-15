/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — RECHNER (v152)
   Standard · Wissenschaftlich · Verlauf · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "rechner");
    var expr = store.get("expr", "");
    var result = store.get("result", "0");
    var sci = store.get("sci", false);

    function build(){
      var body = "";

      /* ═══ RECHNER ═══ */
      if(tab === "rechner"){
        body = '<div class="card">'
          + '<div style="padding:16px;background:rgba(0,0,0,.3);border-radius:12px;margin-bottom:12px;text-align:right">'
          + '<div style="font-size:12px;color:var(--text-mute);min-height:18px">' + _esc(expr || " ") + '</div>'
          + '<div style="font-size:36px;font-weight:900;color:var(--p1);word-break:break-all">' + _esc(result) + '</div>'
          + '</div>';

        /* Toggle Wissenschaftlich */
        body += '<div style="display:flex;gap:6px;margin-bottom:8px">'
          + '<button class="btn sec" data-toggle-sci style="flex:1;font-size:11px">' + (sci ? "🔽 Standard" : "🔬 Wissenschaftlich") + '</button>'
          + '</div>';

        /* Grid */
        var keys = sci ? [
          "sin","cos","tan","√",
          "x²","x³","π","e",
          "(",")","^","%",
          "7","8","9","÷",
          "4","5","6","×",
          "1","2","3","−",
          "0",".","±","+",
          "C","⌫","=","←"
        ] : [
          "C","⌫","%","÷",
          "7","8","9","×",
          "4","5","6","−",
          "1","2","3","+",
          "0",".","="
        ];

        var cols = sci ? 4 : 4;
        body += '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:6px">';
        keys.forEach(function(k){
          var isOp = ["+","−","×","÷","%","=","←"].indexOf(k) !== -1;
          var isFunc = ["C","⌫"].indexOf(k) !== -1;
          var isSci = ["sin","cos","tan","√","x²","x³","π","e","(",")","^"].indexOf(k) !== -1;
          var bg = k === "=" ? "linear-gradient(135deg,var(--p1),var(--p3))" :
                   isOp ? "rgba(0,229,255,.2)" :
                   isFunc ? "rgba(255,128,128,.2)" :
                   isSci ? "rgba(180,120,255,.2)" :
                   "rgba(0,0,0,.3)";
          var col = k === "=" ? "#000" : "inherit";
          body += '<button data-key="' + _esc(k) + '" style="padding:16px 8px;background:' + bg + ';border:1px solid var(--border-soft);border-radius:10px;color:' + col + ';font-size:15px;font-weight:900;cursor:pointer;font-family:inherit;transition:.1s">' + _esc(k) + '</button>';
        });
        body += '</div>';

        /* Speichern */
        if(result !== "0" && result !== "Fehler"){
          body += '<button class="btn sec full" id="saveCalc" style="margin-top:12px;font-size:11px">💾 Ergebnis in Verlauf speichern</button>';
        }
        body += '</div>';

      /* ═══ VERLAUF ═══ */
      } else if(tab === "verlauf"){
        var hist = store.get("history", []);
        body = '<div class="card"><h3>📜 Verlauf (' + hist.length + ')</h3>';
        if(!hist.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Berechnungen</div>';
        } else {
          hist.slice().reverse().forEach(function(h, idx){
            var ri = hist.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div>'
              + '<div style="font-size:12px;color:var(--text-mute)">' + _esc(h.expr) + '</div>'
              + '<div style="font-size:16px;font-weight:900;color:var(--p1)">' + _esc(h.result) + '</div>'
              + '<div style="font-size:9.5px;color:var(--text-mute)">' + _esc(h.date) + '</div>'
              + '</div>'
              + '<div style="display:flex;gap:4px">'
              + '<button data-huse="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:6px 10px;font-size:11px">↩</button>'
              + '<button data-hdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 10px;font-size:11px">✕</button>'
              + '</div>'
              + '</div>';
          });
          body += '<button class="btn danger full" id="clearHist" style="margin-top:10px">🗑️ Verlauf löschen</button>';
        }
        body += '</div>';

      /* ═══ SETTINGS ═══ */
      } else if(tab === "settings"){
        var decimals = store.get("decimals", 4);
        var angleMode = store.get("angleMode", "deg");
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Dezimalstellen</label>'
          + '<select id="cDec" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + [2,4,6,8,10].map(function(n){ return '<option value="' + n + '"' + (decimals===n?" selected":"") + '>' + n + '</option>'; }).join("")
          + '</select></div>'
          + '<div class="field"><label>Winkelmodus</label>'
          + '<select id="cAngle" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<option value="deg"' + (angleMode==="deg"?" selected":"") + '>Grad (deg)</option>'
          + '<option value="rad"' + (angleMode==="rad"?" selected":"") + '>Bogenmaß (rad)</option>'
          + '</select></div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="rechner"?" active":"") + '" data-rt="rechner">🧮 Rechner</button>'
        + '<button class="tab' + (tab==="verlauf"?" active":"") + '" data-rt="verlauf">📜 Verlauf</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-rt="settings">⚙️ Einstellungen</button>'
        + '</div>' + body;

      /* Tab-Wechsel */
      container.querySelectorAll("[data-rt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.rt;
          store.set("tab", tab);
          build();
        });
      });

      /* Rechner-Events */
      if(tab === "rechner"){
        var sciBtn = container.querySelector("[data-toggle-sci]");
        if(sciBtn) sciBtn.addEventListener("click", function(){
          sci = !sci;
          store.set("sci", sci);
          build();
        });

        container.querySelectorAll("[data-key]").forEach(function(el){
          el.addEventListener("click", function(){
            handleKey(el.dataset.key);
          });
        });

        var saveBtn = container.querySelector("#saveCalc");
        if(saveBtn) saveBtn.addEventListener("click", function(){
          var hist = store.get("history", []);
          hist.push({ expr: expr, result: result, date: new Date().toLocaleString("de-DE") });
          store.set("history", hist);
          if(HalDo.Notify) HalDo.Notify.success("Im Verlauf gespeichert", { app: "rechner" });
          build();
        });
      }

      if(tab === "verlauf"){
        container.querySelectorAll("[data-huse]").forEach(function(el){
          el.addEventListener("click", function(){
            var h = store.get("history", [])[parseInt(el.dataset.huse)];
            if(h){ expr = h.result; result = h.result; store.set("expr", expr); store.set("result", result); tab = "rechner"; store.set("tab", tab); build(); }
          });
        });
        container.querySelectorAll("[data-hdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var hist = store.get("history", []);
            hist.splice(parseInt(el.dataset.hdel), 1);
            store.set("history", hist);
            build();
          });
        });
        var clr = container.querySelector("#clearHist");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Verlauf löschen?")) return;
          store.set("history", []);
          build();
        });
      }

      if(tab === "settings"){
        container.querySelector("#cDec").addEventListener("change", function(){
          store.set("decimals", parseInt(this.value));
          if(HalDo.Notify) HalDo.Notify.success("Dezimalstellen: " + this.value, { app: "rechner" });
        });
        container.querySelector("#cAngle").addEventListener("change", function(){
          store.set("angleMode", this.value);
        });
      }
    }

    function handleKey(k){
      var decimals = store.get("decimals", 4);
      var angleMode = store.get("angleMode", "deg");

      if(k === "C"){ expr = ""; result = "0"; }
      else if(k === "⌫"){ expr = expr.slice(0, -1); }
      else if(k === "←"){ expr = ""; result = "0"; }
      else if(k === "="){
        try {
          var e = expr
            .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
            .replace(/%/g, "/100")
            .replace(/π/g, Math.PI).replace(/e/g, Math.E)
            .replace(/√/g, "Math.sqrt")
            .replace(/sin\(/g, "Math.sin(")
            .replace(/cos\(/g, "Math.cos(")
            .replace(/tan\(/g, "Math.tan(")
            .replace(/x²/g, "**2").replace(/x³/g, "**3")
            .replace(/\^/g, "**");

          /* eslint-disable no-new-func */
          var r = Function('"use strict";return (' + e + ')')();
          result = Number.isFinite(r) ? parseFloat(r.toFixed(decimals)).toString() : "Fehler";
        } catch(err){ result = "Fehler"; }
      }
      else if(k === "±"){ expr = expr.startsWith("-") ? expr.slice(1) : "-" + expr; }
      else if(k === "x²"){ expr += "**2"; }
      else if(k === "x³"){ expr += "**3"; }
      else if(k === "sin" || k === "cos" || k === "tan"){ expr += k + "("; }
      else { expr += k; }

      store.set("expr", expr);
      store.set("result", result);
      build();
    }

    build();
  }

  HalDoApp("rechner", { name: "Rechner", icon: "🧮", render: render, category: "werkzeuge" });
  console.log("🦚 rechner.js geladen");
})();
