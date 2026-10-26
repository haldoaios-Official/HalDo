/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WISSENSCHAFTLICH (v1.0)
   Sci-Calc · Verlauf · Trigonometrie · Log · Potenz · Konstanten
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var state = { expr:"", ans:0, deg: store.get("deg", true), history: store.get("history", []) };

    function build(){
      var html = '<div class="card" style="padding:12px">'
        + '<div style="text-align:right;font-size:11px;color:var(--text-mute);min-height:14px;font-variant-numeric:tabular-nums" id="sciAns">Ans = '+state.ans+'</div>'
        + '<div style="text-align:right;font-size:26px;font-weight:900;color:#4dd0e1;padding:8px 0;min-height:48px;word-wrap:break-word;font-variant-numeric:tabular-nums" id="sciExpr">'+(state.expr||"0")+'</div>'
        + '</div>';

      // Mode row
      html += '<div style="display:flex;gap:6px;margin-bottom:8px">'
        + '<button id="sciMode" class="btn sec" style="flex:1;padding:8px;font-size:11px">'+(state.deg?"DEG 📐":"RAD 📐")+'</button>'
        + '<button id="sciBack" class="btn sec" style="flex:1;padding:8px;font-size:14px">⌫</button>'
        + '<button id="sciClear" class="btn sec" style="flex:1;padding:8px;font-size:11px;color:#ff8080">AC</button>'
        + '<button id="sciHistBtn" class="btn sec" style="flex:1;padding:8px;font-size:11px">📜</button>'
        + '</div>';

      // Keys
      var rows = [
        ["sin","cos","tan","(",")","π"],
        ["log","ln","√","^","e","!"],
        ["7","8","9","÷","%","AC"],
        ["4","5","6","×","C","⌫"],
        ["1","2","3","−","Ans","+/-"],
        ["0",".",",","+","="]
      ];
      html += '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px">';
      rows.forEach(function(row, ri){
        row.forEach(function(k){
          var isNum = /^[0-9.]$/.test(k);
          var isOp = ["÷","×","−","+","="].indexOf(k) >= 0;
          var isFn = ["sin","cos","tan","log","ln","√","^","!","%","π","e","Ans","+/-"].indexOf(k) >= 0;
          var span = (ri === rows.length-1 && k === "+") ? 1 : 1;
          var col = isNum ? "var(--text)" : isOp ? "#4dd0e1" : isFn ? "#ffd54f" : "var(--text-mute)";
          var bg = k === "=" ? "linear-gradient(135deg,#4dd0e1,#b478ff)" : isOp ? "rgba(77,208,225,.15)" : "rgba(0,0,0,.25)";
          var fg = k === "=" ? "#000" : col;
          var fw = k === "=" ? 900 : 800;
          html += '<button data-key="'+k+'" style="padding:14px 2px;background:'+bg+';border:1px solid '+(k==="="?"transparent":"var(--border-soft)")+';border-radius:8px;color:'+fg+';font-size:'+(isNum?"16px":"12px")+';font-weight:'+fw+';cursor:pointer;font-family:inherit;'+(k==="="?"grid-column:span 2;":"")+'">'+k+'</button>';
        });
      });
      html += '</div>';

      // History
      if(state.history.length){
        html += '<div class="card" style="margin-top:12px"><h3>Verlauf</h3>';
        state.history.slice(0,5).forEach(function(h){
          html += '<div style="padding:6px 8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:3px;font-size:11px;display:flex;justify-content:space-between;cursor:pointer" data-hist="'+encodeURIComponent(h.expr)+'">'
            + '<span style="color:var(--text-mute);font-family:monospace">'+_esc(h.expr)+'</span>'
            + '<span style="color:#4dd0e1;font-weight:900">= '+_esc(h.result)+'</span>'
            + '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelectorAll("[data-key]").forEach(function(el){
        el.addEventListener("click", function(){ press(el.dataset.key); });
      });
      container.querySelector("#sciMode").addEventListener("click", function(){
        state.deg = !state.deg; store.set("deg", state.deg); build();
      });
      container.querySelector("#sciBack").addEventListener("click", function(){
        state.expr = state.expr.slice(0,-1); build();
      });
      container.querySelector("#sciClear").addEventListener("click", function(){ state.expr = ""; build(); });
      container.querySelector("#sciHistBtn").addEventListener("click", function(){
        if(!state.history.length){ alert("Kein Verlauf"); return; }
        if(confirm("Verlauf löschen?")){ state.history = []; store.set("history", []); build(); }
      });
      container.querySelectorAll("[data-hist]").forEach(function(el){
        el.addEventListener("click", function(){
          state.expr = decodeURIComponent(el.dataset.hist); build();
        });
      });
    }

    function press(k){
      if(k === "="){ calculate(); return; }
      if(k === "AC"){ state.expr = ""; build(); return; }
      if(k === "C"){ state.expr = ""; build(); return; }
      if(k === "⌫"){ state.expr = state.expr.slice(0,-1); build(); return; }
      if(k === "Ans"){ state.expr += state.ans; build(); return; }
      if(k === "+/-"){
        if(state.expr && /^\-?[\d.]+$/.test(state.expr)){
          state.expr = state.expr.startsWith("-") ? state.expr.slice(1) : "-" + state.expr;
        }
        build(); return;
      }
      if(k === "π"){ state.expr += "π"; build(); return; }
      if(k === "e"){ state.expr += "e"; build(); return; }
      if(k === "√"){ state.expr += "√("; build(); return; }
      if(k === "sin" || k === "cos" || k === "tan"){ state.expr += k + "("; build(); return; }
      if(k === "log"){ state.expr += "log("; build(); return; }
      if(k === "ln"){ state.expr += "ln("; build(); return; }
      if(k === "×"){ state.expr += "×"; build(); return; }
      if(k === "÷"){ state.expr += "÷"; build(); return; }
      if(k === "−"){ state.expr += "−"; build(); return; }
      if(k === "+"){ state.expr += "+"; build(); return; }
      if(k === "^"){ state.expr += "^"; build(); return; }
      if(k === "%"){ state.expr += "%"; build(); return; }
      if(k === "!"){ state.expr += "!"; build(); return; }
      if(k === ","){ state.expr += "."; build(); return; }
      state.expr += k;
      build();
    }

    function calculate(){
      if(!state.expr.trim()) return;
      try {
        var result = evalExpr(state.expr);
        if(typeof result !== "number" || !isFinite(result)) throw new Error("Ungültig");
        var r = parseFloat(result.toPrecision(12));
        state.ans = r;
        state.history.unshift({ expr: state.expr, result: r });
        if(state.history.length > 20) state.history = state.history.slice(0,20);
        store.set("history", state.history);
        state.expr = String(r);
        build();
      } catch(e){
        state.expr = "Fehler";
        build();
        setTimeout(function(){ state.expr = ""; build(); }, 1200);
      }
    }

    function evalExpr(expr){
      var s = expr;
      // Replacements — length matters (replace longer first)
      s = s.replace(/π/g, "Math.PI");
      s = s.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, "Math.E");
      s = s.replace(/×/g, "*");
      s = s.replace(/÷/g, "/");
      s = s.replace(/−/g, "-");
      // Trig — DEG or RAD
      var toRad = state.deg ? "*Math.PI/180" : "";
      s = s.replace(/sin\(([^()]*)\)/g, function(m, a){ return "Math.sin((" + a + ")" + toRad + ")"; });
      s = s.replace(/cos\(([^()]*)\)/g, function(m, a){ return "Math.cos((" + a + ")" + toRad + ")"; });
      s = s.replace(/tan\(([^()]*)\)/g, function(m, a){ return "Math.tan((" + a + ")" + toRad + ")"; });
      s = s.replace(/log\(/g, "Math.log10(");
      s = s.replace(/ln\(/g, "Math.log(");
      s = s.replace(/√\(([^()]*)\)/g, "Math.sqrt($1)");
      s = s.replace(/√([0-9.]+)/g, "Math.sqrt($1)");
      s = s.replace(/\^/g, "**");
      // Factorial
      s = s.replace(/(\d+)!/g, function(m, n){ var r=1; for(var i=2;i<=parseInt(n);i++) r*=i; return r; });
      s = s.replace(/%/g, "/100");
      // eslint-disable-next-line
      return Function('"use strict";return (' + s + ')')();
    }

    function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

    build();
  }

  HalDoApp("wissenschaftlich", { name: "Sci-Calc", icon: "🧪", render: render, category: "werkzeuge" });
  console.log("🦚 wissenschaftlich.js v1.0 geladen");
})();
