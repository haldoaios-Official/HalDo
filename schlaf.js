/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SCHLAF (v1.0)
   Schlaf-Tracker · Bettzeit · Aufwachzeit · Qualität
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function today(){ return new Date().toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list" };

    function getLog(){ return store.get("log", {}); }
    function saveLog(l){ store.set("log", l); }

    function calcDuration(bed, wake){
      try {
        var b = bed.split(":").map(Number), w = wake.split(":").map(Number);
        var bh = b[0]*60 + b[1], wh = w[0]*60 + w[1];
        var diff = wh - bh;
        if(diff < 0) diff += 24*60;
        return diff;
      } catch(e){ return 0; }
    }
    function fmtDur(min){
      var h = Math.floor(min/60), m = min%60;
      return h + "h " + m + "m";
    }

    function screenList(){
      var log = getLog();
      var td = today();
      var entry = log[td];
      var entries = Object.keys(log).sort().reverse().slice(0, 7);

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(100,50,200,.15),rgba(50,80,180,.15));border:1px solid rgba(100,80,220,.3)">'
        + '<div style="font-size:44px">😴</div>'
        + '<div style="font-size:18px;font-weight:900;color:#a78bfa;margin-top:6px">Schlaf-Tracker</div>';

      if(entry){
        var dur = calcDuration(entry.bed, entry.wake);
        html += '<div style="font-size:28px;font-weight:900;color:#a78bfa;margin-top:8px">'+fmtDur(dur)+'</div>'
          + '<div style="font-size:11px;color:var(--text-mute)">'+_esc(entry.bed)+' → '+_esc(entry.wake)+'</div>';
        if(entry.quality){
          html += '<div style="font-size:14px;color:#ffd54f;margin-top:4px">'+"⭐".repeat(entry.quality)+"☆".repeat(5-entry.quality)+'</div>';
        }
      } else {
        html += '<div style="font-size:11px;color:var(--text-mute);margin-top:8px">Heute noch nicht erfasst</div>';
      }
      html += '</div>';

      html += '<div class="card">'
        + '<button class="btn full" id="slAdd" style="margin-bottom:8px">'+(entry?"✏️ Heute bearbeiten":"+ Heute erfassen")+'</button>';

      if(entries.length > 1){
        html += '<h3>📊 Letzte Nächte</h3>';
        entries.forEach(function(date){
          if(date === td && !entry) return;
          var e = log[date];
          var d = calcDuration(e.bed, e.wake);
          var dateObj = new Date(date + "T12:00:00");
          var lbl = dateObj.toLocaleDateString("de-DE",{ weekday:"short", day:"2-digit", month:"2-digit" });
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid #a78bfa">'
            + '<div><div style="font-size:12px;font-weight:800">'+lbl+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">'+_esc(e.bed)+' → '+_esc(e.wake)+'</div></div>'
            + '<div style="font-size:14px;font-weight:900;color:#a78bfa">'+fmtDur(d)+'</div>'
            + '</div>';
        });
      }
      html += '</div>';

      container.innerHTML = html;
      container.querySelector("#slAdd").addEventListener("click", function(){ view.screen="form"; screenForm(); });
    }

    function screenForm(){
      var log = getLog(); var td = today();
      var e = log[td] || { bed:"23:00", wake:"07:00", quality:3 };
      var html = '<button data-cancel style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>Schlaf erfassen</h3>'
        + '<div class="field"><label>Bettzeit</label><input type="time" id="sl-bed" value="'+_esc(e.bed)+'"></div>'
        + '<div class="field"><label>Aufwachzeit</label><input type="time" id="sl-wake" value="'+_esc(e.wake)+'"></div>'
        + '<div class="field"><label>Qualität</label>'
        + '<div style="display:flex;gap:6px;margin-top:6px">'
        + [1,2,3,4,5].map(function(n){
            return '<button data-q="'+n+'" style="flex:1;padding:10px;background:rgba(0,0,0,.2);border:1.5px solid '+((e.quality||3)===n?'#ffd54f':'var(--border-soft)')+';border-radius:8px;cursor:pointer;color:'+((e.quality||3)===n?'#ffd54f':'var(--text-mute)')+';font-size:20px">⭐</button>';
          }).join('')
        + '</div></div>'
        + '<button class="btn full" id="slSave" style="margin-top:8px">💾 Speichern</button>'
        + '</div>';
      container.innerHTML = html;
      var quality = e.quality || 3;

      container.querySelectorAll("[data-q]").forEach(function(el){
        el.addEventListener("click", function(){
          quality = parseInt(el.dataset.q);
          container.querySelectorAll("[data-q]").forEach(function(x){
            var n = parseInt(x.dataset.q);
            x.style.borderColor = n===quality ? "#ffd54f" : "var(--border-soft)";
            x.style.color = n===quality ? "#ffd54f" : "var(--text-mute)";
          });
        });
      });
      container.querySelector("[data-cancel]").addEventListener("click", function(){ view.screen="list"; screenList(); });
      container.querySelector("#slSave").addEventListener("click", function(){
        var bed = container.querySelector("#sl-bed").value;
        var wake = container.querySelector("#sl-wake").value;
        if(!bed || !wake){ alert("Bitte Zeiten eingeben."); return; }
        var l = getLog(); l[td] = { bed:bed, wake:wake, quality:quality };
        saveLog(l); view.screen="list"; screenList();
        if(HalDo.Notify) HalDo.Notify.success("Schlaf gespeichert");
      });
    }

    if(view.screen === "form") screenForm(); else screenList();
  }

  HalDoApp("schlaf", { name: "Schlaf", icon: "😴", render: render, category: "gesundheit" });
  console.log("🦚 schlaf.js v1.0 geladen");
})();
