/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WELTUHR (v1.0)
   Zeitzonen · Eigene Städte · Live
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  var PRESETS = [
    { city:"Berlin",    tz:"Europe/Berlin",         flag:"🇩🇪" },
    { city:"Istanbul",  tz:"Europe/Istanbul",       flag:"🇹🇷" },
    { city:"London",    tz:"Europe/London",         flag:"🇬🇧" },
    { city:"New York",  tz:"America/New_York",      flag:"🇺🇸" },
    { city:"Los Angeles", tz:"America/Los_Angeles", flag:"🇺🇸" },
    { city:"Tokyo",     tz:"Asia/Tokyo",            flag:"🇯🇵" },
    { city:"Dubai",     tz:"Asia/Dubai",            flag:"🇦🇪" },
    { city:"Sydney",    tz:"Australia/Sydney",      flag:"🇦🇺" },
    { city:"Moskau",    tz:"Europe/Moscow",         flag:"🇷🇺" },
    { city:"Paris",     tz:"Europe/Paris",          flag:"🇫🇷" },
    { city:"Rom",       tz:"Europe/Rome",           flag:"🇮🇹" },
    { city:"Madrid",    tz:"Europe/Madrid",         flag:"🇪🇸" },
    { city:"Erbil",     tz:"Asia/Baghdad",          flag:"🇮🇶" },
    { city:"Teheran",   tz:"Asia/Tehran",           flag:"🇮🇷" },
    { city:"Baku",      tz:"Asia/Baku",             flag:"🇦🇿" },
    { city:"Singapur",  tz:"Asia/Singapore",        flag:"🇸🇬" },
    { city:"São Paulo", tz:"America/Sao_Paulo",     flag:"🇧🇷" },
    { city:"Kapstadt",  tz:"Africa/Johannesburg",   flag:"🇿🇦" }
  ];

  function render(container, ctx){
    var store = ctx.store;
    var timer = null;
    var view = { screen:"list", adding:false };

    function getCities(){
      var saved = store.get("cities", null);
      if(!saved) { saved = [PRESETS[0], PRESETS[1]]; store.set("cities", saved); }
      return saved;
    }
    function saveCities(c){ store.set("cities", c); }

    function fmtTime(tz){
      try {
        return new Date().toLocaleTimeString("de-DE",{ timeZone: tz, hour:"2-digit", minute:"2-digit", second:"2-digit" });
      } catch(e){ return "--:--:--"; }
    }
    function fmtDate(tz){
      try {
        return new Date().toLocaleDateString("de-DE",{ timeZone: tz, weekday:"long", day:"numeric", month:"long" });
      } catch(e){ return ""; }
    }
    function fmtOffset(tz){
      try {
        var local = new Date();
        var here = local.getTime();
        var there = new Date(local.toLocaleString("en-US",{ timeZone: tz })).getTime();
        var diff = Math.round((there - new Date(local.toLocaleString("en-US")).getTime()) / 3600000);
        if(diff === 0) return "Gleiche Zeit";
        return (diff > 0 ? "+" : "") + diff + "h";
      } catch(e){ return ""; }
    }

    function screenList(){
      var cities = getCities();
      var myTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin";
      var now = new Date();
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.1));border:1px solid rgba(0,229,255,.3)">'
        + '<div style="font-size:12px;color:var(--text-mute);font-weight:800;letter-spacing:1px">MEINE ZEIT</div>'
        + '<div style="font-size:42px;font-weight:900;color:var(--p1);letter-spacing:2px;font-variant-numeric:tabular-nums" id="w-local-time">'+fmtTime(myTz)+'</div>'
        + '<div style="font-size:11px;color:var(--text-dim)" id="w-local-date">'+fmtDate(myTz)+'</div>'
        + '</div>';

      html += '<div class="card"><h3>🌍 Meine Städte</h3>';
      if(!cities.length) html += '<div style="text-align:center;color:var(--text-mute);padding:20px">Keine Städte. Tippe auf +.</div>';
      else {
        cities.forEach(function(c, i){
          html += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid var(--p2)">'
            + '<div><div style="font-size:13px;font-weight:900">'+c.flag+' '+_esc(c.city)+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">'+fmtOffset(c.tz)+'</div></div>'
            + '<div style="text-align:right">'
            + '<div style="font-size:20px;font-weight:900;color:var(--p2);font-variant-numeric:tabular-nums" data-time-tz="'+_esc(c.tz)+'">'+fmtTime(c.tz)+'</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute)" data-date-tz="'+_esc(c.tz)+'">'+fmtDate(c.tz)+'</div>'
            + '</div>'
            + '<button data-delcity="'+i+'" style="background:transparent;border:none;color:#ff8080;font-size:14px;cursor:pointer;padding:4px 8px">✕</button>'
            + '</div>';
        });
      }
      html += '<button class="btn full" id="wAdd" style="margin-top:8px">+ Stadt hinzufügen</button></div>';

      container.innerHTML = html;
      bind();
      if(timer) clearInterval(timer);
      timer = setInterval(function(){
        if(!container.querySelector("#w-local-time")){ clearInterval(timer); return; }
        var t = container.querySelector("#w-local-time"); if(t) t.textContent = fmtTime(myTz);
        container.querySelectorAll("[data-time-tz]").forEach(function(el){ el.textContent = fmtTime(el.dataset.timeTz); });
      }, 1000);
    }

    function screenAdd(){
      var avail = PRESETS.filter(function(p){ return !getCities().some(function(c){ return c.tz === p.tz; }); });
      var html = '<button data-cancel style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>Stadt hinzufügen</h3>';
      if(!avail.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:20px">Alle Städte bereits hinzugefügt</div>';
      } else {
        avail.forEach(function(p){
          html += '<button data-addcity=\''+JSON.stringify(p)+'\' style="display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;margin-bottom:6px;color:inherit;font-family:inherit;cursor:pointer">'
            + '<span style="font-size:13px;font-weight:800">'+p.flag+' '+_esc(p.city)+'</span>'
            + '<span style="font-size:11px;color:var(--p2);font-variant-numeric:tabular-nums">'+fmtTime(p.tz)+'</span>'
            + '</button>';
        });
      }
      html += '</div>';
      container.innerHTML = html;
      container.querySelector("[data-cancel]").addEventListener("click", function(){ view.screen="list"; screenList(); });
      container.querySelectorAll("[data-addcity]").forEach(function(el){
        el.addEventListener("click", function(){
          var c = JSON.parse(el.dataset.addcity);
          var cities = getCities(); cities.push(c); saveCities(cities);
          view.screen = "list"; screenList();
          if(HalDo.Notify) HalDo.Notify.success(c.city + " hinzugefügt");
        });
      });
    }

    function bind(){
      var add = container.querySelector("#wAdd");
      if(add) add.addEventListener("click", function(){ view.screen="add"; screenAdd(); });
      container.querySelectorAll("[data-delcity]").forEach(function(el){
        el.addEventListener("click", function(){
          var cities = getCities(); cities.splice(parseInt(el.dataset.delcity),1); saveCities(cities); screenList();
        });
      });
    }

    if(view.screen === "add") screenAdd(); else screenList();
  }

  HalDoApp("weltuhr", { name: "Weltuhr", icon: "🌍", render: render, category: "werkzeuge" });
  console.log("🦚 weltuhr.js v1.0 geladen");
})();
