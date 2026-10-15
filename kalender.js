/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KALENDER (v151)
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var cur = store.get("viewMonth", null);
    var now = new Date();
    if(!cur) cur = { y: now.getFullYear(), m: now.getMonth() };
    var selected = store.get("selected", today());

    function today(){ return new Date().toISOString().split("T")[0]; }

    function build(){
      var y = cur.y, m = cur.m;
      var first = new Date(y, m, 1);
      var days = new Date(y, m + 1, 0).getDate();
      var startDay = (first.getDay() + 6) % 7; /* Mo=0 */
      var monthName = first.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

      var events = store.get("events", {});
      var selEvents = events[selected] || [];

      var body = '<div class="card">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
        + '<button class="btn sec" id="calPrev" style="padding:8px 14px">‹</button>'
        + '<div style="font-size:15px;font-weight:900;color:var(--p1);text-transform:capitalize">' + monthName + '</div>'
        + '<button class="btn sec" id="calNext" style="padding:8px 14px">›</button>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">';

      ["Mo","Di","Mi","Do","Fr","Sa","So"].forEach(function(d){
        body += '<div style="text-align:center;font-size:10px;font-weight:800;color:var(--text-mute);padding:6px 0">' + d + '</div>';
      });
      body += '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">';

      /* Leere Zellen vor Monatsanfang */
      for(var i = 0; i < startDay; i++) body += '<div></div>';

      var td = today();
      for(var d = 1; d <= days; d++){
        var dateStr = y + "-" + pad(m + 1) + "-" + pad(d);
        var isToday = dateStr === td;
        var isSelected = dateStr === selected;
        var hasEvent = events[dateStr] && events[dateStr].length > 0;

        var bg = isSelected ? "linear-gradient(135deg,var(--p1),var(--p3))" : isToday ? "rgba(0,229,255,.2)" : "rgba(0,0,0,.2)";
        var col = isSelected ? "#000" : isToday ? "var(--p1)" : "var(--text-dim)";

        body += '<button data-day="' + dateStr + '" style="aspect-ratio:1;background:' + bg + ';border:1px solid ' + (isToday ? "var(--p1)" : "transparent") + ';border-radius:8px;color:' + col + ';font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;position:relative;padding:0">'
          + d
          + (hasEvent ? '<div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:5px;height:5px;background:' + (isSelected ? "#000" : "var(--p3)") + ';border-radius:50%"></div>' : '')
          + '</button>';
      }
      body += '</div></div>';

      /* Termine des gewählten Tages */
      body += '<div class="card"><h3>📌 ' + new Date(selected).toLocaleDateString("de-DE", { weekday:"long", day:"numeric", month:"long" }) + '</h3>'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<input type="text" id="evInp" placeholder="Neuer Termin..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<button class="btn" id="evAdd">+</button>'
        + '</div>';

      if(!selEvents.length){
        body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Keine Termine</div>';
      } else {
        selEvents.forEach(function(ev, i){
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid var(--p3)">'
            + '<div style="font-size:12.5px">🕐 ' + _esc(ev.text) + '</div>'
            + '<button data-evdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>';
        });
      }
      body += '</div>';

      container.innerHTML = body;

      container.querySelector("#calPrev").addEventListener("click", function(){
        var newM = m - 1, newY = y;
        if(newM < 0){ newM = 11; newY--; }
        cur = { y: newY, m: newM };
        store.set("viewMonth", cur);
        build();
      });
      container.querySelector("#calNext").addEventListener("click", function(){
        var newM = m + 1, newY = y;
        if(newM > 11){ newM = 0; newY++; }
        cur = { y: newY, m: newM };
        store.set("viewMonth", cur);
        build();
      });
      container.querySelectorAll("[data-day]").forEach(function(el){
        el.addEventListener("click", function(){
          selected = el.dataset.day;
          store.set("selected", selected);
          build();
        });
      });
      container.querySelector("#evAdd").addEventListener("click", function(){
        var inp = container.querySelector("#evInp");
        var txt = inp.value.trim();
        if(!txt) return;
        if(!events[selected]) events[selected] = [];
        events[selected].push({ text: txt });
        store.set("events", events);
        inp.value = "";
        build();
      });
      container.querySelectorAll("[data-evdel]").forEach(function(el){
        el.addEventListener("click", function(){
          selEvents.splice(parseInt(el.dataset.evdel), 1);
          if(!selEvents.length) delete events[selected];
          store.set("events", events);
          build();
        });
      });
    }

    function pad(n){ return n < 10 ? "0" + n : n; }
    function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

    build();
  }

  HalDoApp("kalender", { name: "Kalender", icon: "📅", render: render, category: "app" });
  console.log("🦚 kalender.js geladen");
})();
