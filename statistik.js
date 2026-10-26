/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — STATISTIK (v1.0)
   Mittelwert · Median · Modus · Stdabw. · Diagramm
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = { input: store.get("input","") };

    function build(){
      var nums = parseNums(state.input);
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(102,204,102,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">📈</div>'
        + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:6px">Statistik</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">'+nums.length+' Werte erkannt</div>'
        + '</div>';

      html += '<div class="card">'
        + '<div class="field"><label>Zahlen (Komma, Leerzeichen oder Zeilenumbruch getrennt)</label>'
        + '<textarea id="st-input" rows="4" placeholder="z.B. 5, 12, 8, 15, 22, 9" style="font-family:monospace;font-size:13px;resize:vertical">'+_esc(state.input)+'</textarea>'
        + '</div></div>';

      if(nums.length > 0){
        var s = calc(nums);
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          + box("Anzahl (n)", nums.length, "#4dd0e1")
          + box("Mittelwert (Ø)", s.mean.toFixed(2), "#66cc66")
          + box("Median", s.median.toFixed(2), "#ffd54f")
          + box("Modus", s.mode, "#ff8844")
          + box("Minimum", s.min, "#4da8ff")
          + box("Maximum", s.max, "#ff6b6b")
          + box("Spannweite", (s.max - s.min).toFixed(2), "#b478ff")
          + box("Stdabw. (σ)", s.stddev.toFixed(2), "#4dd0e1")
          + '</div>';

        html += '<div class="card"><h3>📊 Verteilung</h3>';
        // Histogram (5 buckets)
        var buckets = makeBuckets(nums, 6);
        var maxCount = Math.max.apply(null, buckets.map(function(b){ return b.count; }));
        buckets.forEach(function(b){
          var h = maxCount ? (b.count / maxCount) * 100 : 0;
          html += '<div style="margin-bottom:6px">'
            + '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px"><span style="color:var(--text-mute)">'+b.from.toFixed(1)+' – '+b.to.toFixed(1)+'</span><span style="color:var(--p1);font-weight:900">'+b.count+'</span></div>'
            + '<div style="height:14px;background:rgba(0,0,0,.3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+h+'%;background:linear-gradient(90deg,#4dd0e1,#b478ff);border-radius:4px;transition:width .3s"></div></div>'
            + '</div>';
        });
        html += '</div>';

        html += '<div class="card"><h3>📋 Alle Werte (sortiert)</h3>'
          + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
          + nums.slice().sort(function(a,b){ return a-b; }).map(function(n){
              return '<span style="padding:4px 8px;background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);border-radius:6px;font-size:11px;font-weight:800;color:var(--p1);font-family:monospace">'+n+'</span>';
            }).join('')
          + '</div></div>';

        html += '<div class="card"><h3>🔢 Weitere Werte</h3>'
          + row("Varianz (σ²)", s.variance.toFixed(4))
          + row("Q1 (25%)", s.q1.toFixed(2))
          + row("Q3 (75%)", s.q3.toFixed(2))
          + row("IQR", (s.q3 - s.q1).toFixed(2))
          + row("Summe", s.sum.toFixed(2))
          + '</div>';
      } else if(state.input.trim()){
        html += '<div class="card" style="text-align:center;color:#ff8080;padding:20px">⚠️ Keine Zahlen erkannt</div>';
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      var t = container.querySelector("#st-input");
      t.addEventListener("input", function(){
        state.input = t.value; store.set("input", state.input);
        var pos = t.selectionStart;
        build();
        var n = container.querySelector("#st-input");
        if(n){ n.focus(); n.setSelectionRange(pos,pos); }
      });
    }

    function parseNums(str){
      if(!str) return [];
      var parts = str.split(/[,\s;]+/);
      return parts.map(function(p){ return parseFloat(p.replace(",",".")); })
        .filter(function(n){ return !isNaN(n); });
    }

    function calc(nums){
      var sorted = nums.slice().sort(function(a,b){ return a-b; });
      var n = nums.length;
      var sum = nums.reduce(function(a,b){ return a+b; }, 0);
      var mean = sum / n;
      var median = n % 2 ? sorted[Math.floor(n/2)] : (sorted[n/2-1] + sorted[n/2]) / 2;
      // Mode
      var freq = {};
      nums.forEach(function(v){ freq[v] = (freq[v]||0) + 1; });
      var maxFreq = 0, modes = [];
      Object.keys(freq).forEach(function(k){
        if(freq[k] > maxFreq){ maxFreq = freq[k]; modes = [k]; }
        else if(freq[k] === maxFreq) modes.push(k);
      });
      var mode = maxFreq > 1 ? modes.join(", ") : "keiner";
      var variance = nums.reduce(function(s,v){ return s + Math.pow(v-mean, 2); }, 0) / n;
      var stddev = Math.sqrt(variance);
      var q1 = quantile(sorted, 0.25);
      var q3 = quantile(sorted, 0.75);
      return { sum, mean, median, mode, min:sorted[0], max:sorted[n-1], variance, stddev, q1, q3 };
    }

    function quantile(sorted, q){
      var pos = (sorted.length - 1) * q;
      var base = Math.floor(pos);
      var rest = pos - base;
      if(sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base+1] - sorted[base]);
      return sorted[base];
    }

    function makeBuckets(nums, count){
      var min = Math.min.apply(null, nums);
      var max = Math.max.apply(null, nums);
      if(min === max) return [{from:min, to:min, count:nums.length}];
      var size = (max - min) / count;
      var buckets = [];
      for(var i=0;i<count;i++){
        buckets.push({ from: min + i*size, to: min + (i+1)*size, count:0 });
      }
      nums.forEach(function(v){
        var idx = Math.min(count-1, Math.floor((v - min) / size));
        buckets[idx].count++;
      });
      return buckets;
    }

    function box(label, value, color){
      return '<div class="card" style="margin-bottom:0;padding:12px;text-align:center;border-left:3px solid '+color+'">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">'+label+'</div>'
        + '<div style="font-size:20px;font-weight:900;color:'+color+';margin-top:2px">'+value+'</div>'
        + '</div>';
    }

    function row(k, v){
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11.5px"><span style="color:var(--text-mute)">'+k+'</span><span style="font-weight:800;color:var(--p1);font-family:monospace">'+v+'</span></div>';
    }

    build();
  }

  HalDoApp("statistik", { name: "Statistik", icon: "📈", render: render, category: "werkzeuge" });
  console.log("🦚 statistik.js v1.0 geladen");
})();
