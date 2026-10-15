/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WETTER (v152)
   Aktuell · 7-Tage · Favoriten · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var WMO = {
    0:"☀️ Klar", 1:"🌤️ Überwiegend klar", 2:"⛅ Teils bewölkt", 3:"☁️ Bewölkt",
    45:"🌫️ Nebel", 48:"🌫️ Reifnebel",
    51:"🌦️ Leichter Niesel", 53:"🌦️ Niesel", 55:"🌧️ Starker Niesel",
    61:"🌧️ Leichter Regen", 63:"🌧️ Regen", 65:"🌧️ Starker Regen",
    71:"🌨️ Leichter Schnee", 73:"🌨️ Schnee", 75:"❄️ Starker Schnee",
    80:"🌦️ Leichte Schauer", 81:"🌧️ Schauer", 82:"⛈️ Heftige Schauer",
    95:"⛈️ Gewitter", 96:"⛈️ Gewitter Hagel", 99:"⛈️ Schweres Gewitter"
  };

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "aktuell");

    function build(){
      var body = "";

      /* ═══ AKTUELL ═══ */
      if(tab === "aktuell"){
        var city = store.get("city", "Berlin");
        var favs = store.get("favorites", ["Berlin", "Hamburg", "München"]);
        var cache = store.get("cache", {});

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:12px">'
          + '<input type="text" id="wCity" value="' + _esc(city) + '" placeholder="Stadt..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="wSearch">🔍</button>'
          + '</div>'
          + '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">';
        favs.forEach(function(f){
          body += '<button class="btn sec" data-fav="' + _esc(f) + '" style="font-size:11px;padding:6px 10px">' + _esc(f) + '</button>';
        });
        body += '</div>'
          + '<div id="wResult" style="text-align:center;padding:20px">'
          + '<div style="font-size:48px">🌤️</div>'
          + '<div style="font-size:13px;color:var(--text-mute);margin-top:8px">Stadt eingeben und suchen</div>'
          + '</div>'
          + '</div>';

        body += '<div class="card"><h3>💡 Info</h3>'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.6">'
          + 'Kostenlose Wetterdaten via Open-Meteo.com. Keine API-Key nötig!'
          + '</div></div>';

      /* ═══ FAVORITEN ═══ */
      } else if(tab === "favoriten"){
        var favs2 = store.get("favorites", ["Berlin", "Hamburg", "München"]);
        body = '<div class="card"><h3>⭐ Favoriten (' + favs2.length + ')</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="newFav" placeholder="Neue Stadt..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="addFav">+</button>'
          + '</div>';
        favs2.forEach(function(f, i){
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div style="font-size:13px;font-weight:800">📍 ' + _esc(f) + '</div>'
            + '<button data-delfav="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>';
        });
        body += '</div>';

      /* ═══ SETTINGS ═══ */
      } else if(tab === "settings"){
        var unit = store.get("unit", "c");
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Temperatur-Einheit</label>'
          + '<select id="wUnit" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<option value="c"' + (unit==="c"?" selected":"") + '>°C Celsius</option>'
          + '<option value="f"' + (unit==="f"?" selected":"") + '>°F Fahrenheit</option>'
          + '</select></div>'
          + '<div class="field"><label>Standard-Stadt</label>'
          + '<input type="text" id="wDefault" value="' + _esc(store.get("defaultCity", "Berlin")) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '</div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="aktuell"?" active":"") + '" data-wt="aktuell">🌤️ Wetter</button>'
        + '<button class="tab' + (tab==="favoriten"?" active":"") + '" data-wt="favoriten">⭐ Favoriten</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-wt="settings">⚙️ Einstellungen</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-wt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.wt;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Events ═══ */
      if(tab === "aktuell"){
        var searchBtn = container.querySelector("#wSearch");
        if(searchBtn) searchBtn.addEventListener("click", doSearch);

        var inp = container.querySelector("#wCity");
        if(inp) inp.addEventListener("keydown", function(e){
          if(e.key === "Enter") doSearch();
        });

        container.querySelectorAll("[data-fav]").forEach(function(el){
          el.addEventListener("click", function(){
            container.querySelector("#wCity").value = el.dataset.fav;
            doSearch();
          });
        });

        /* Auto-Search beim Öffnen */
        setTimeout(doSearch, 300);
      }

      if(tab === "favoriten"){
        container.querySelector("#addFav").addEventListener("click", function(){
          var inp = container.querySelector("#newFav");
          var v = inp.value.trim();
          if(!v) return;
          var favs3 = store.get("favorites", []);
          if(favs3.indexOf(v) === -1) favs3.push(v);
          store.set("favorites", favs3);
          build();
        });
        container.querySelectorAll("[data-delfav]").forEach(function(el){
          el.addEventListener("click", function(){
            var favs4 = store.get("favorites", []);
            favs4.splice(parseInt(el.dataset.delfav), 1);
            store.set("favorites", favs4);
            build();
          });
        });
      }

      if(tab === "settings"){
        container.querySelector("#wUnit").addEventListener("change", function(){
          store.set("unit", this.value);
          if(HalDo.Notify) HalDo.Notify.success("Einheit: " + this.value.toUpperCase(), { app: "wetter" });
        });
        container.querySelector("#wDefault").addEventListener("change", function(){
          store.set("defaultCity", this.value);
        });
      }
    }

    function doSearch(){
      var inp = container.querySelector("#wCity");
      if(!inp) return;
      var city = inp.value.trim();
      if(!city) return;
      store.set("city", city);

      var res = container.querySelector("#wResult");
      res.innerHTML = '<div style="font-size:13px;color:var(--text-mute);padding:20px">🔄 Lade Wetter für ' + _esc(city) + '...</div>';

      /* Geocoding */
      fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=de")
        .then(function(r){ return r.json(); })
        .then(function(geo){
          if(!geo.results || !geo.results.length){
            res.innerHTML = '<div style="color:#ff8080;padding:14px">❌ Stadt nicht gefunden</div>';
            return;
          }
          var g = geo.results[0];
          /* Wetter */
          return fetch("https://api.open-meteo.com/v1/forecast?latitude=" + g.latitude + "&longitude=" + g.longitude + "&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7")
            .then(function(r){ return r.json(); })
            .then(function(w){
              showWeather(res, g, w);
            });
        })
        .catch(function(e){
          res.innerHTML = '<div style="color:#ff8080;padding:14px">❌ Fehler: ' + _esc(e.message) + '</div>';
        });
    }

    function showWeather(res, geo, data){
      var unit = store.get("unit", "c");
      var temp = data.current.temperature_2m;
      if(unit === "f") temp = (temp * 9/5) + 32;
      var code = data.current.weather_code;
      var desc = WMO[code] || "🌡️ Unbekannt";
      var descText = desc.split(" ").slice(1).join(" ");

      var html = '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:14px;border:1.5px solid var(--p1)">'
        + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">' + _esc(geo.name) + (geo.country ? " · " + _esc(geo.country) : "") + '</div>'
        + '<div style="font-size:64px;margin:8px 0">' + desc.split(" ")[0] + '</div>'
        + '<div style="font-size:42px;font-weight:900;color:var(--p1)">' + Math.round(temp) + '°' + unit.toUpperCase() + '</div>'
        + '<div style="font-size:13px;color:var(--text-dim);margin-top:4px">' + _esc(descText) + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">'
        + '<div style="padding:8px;background:rgba(0,0,0,.3);border-radius:8px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">💧 LUFTFEUCHTE</div>'
        + '<div style="font-size:15px;font-weight:900">' + (data.current.relative_humidity_2m || "—") + '%</div></div>'
        + '<div style="padding:8px;background:rgba(0,0,0,.3);border-radius:8px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">💨 WIND</div>'
        + '<div style="font-size:15px;font-weight:900">' + Math.round(data.current.wind_speed_10m || 0) + ' km/h</div></div>'
        + '</div></div>';

      /* 7-Tage */
      if(data.daily && data.daily.time){
        html += '<div style="margin-top:14px"><div style="font-size:11px;font-weight:900;color:var(--text-mute);text-transform:uppercase;margin-bottom:8px;text-align:left">📅 7-Tage-Vorschau</div>';
        html += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px">';
        for(var i = 0; i < data.daily.time.length; i++){
          var d = new Date(data.daily.time[i]);
          var dCode = data.daily.weather_code[i];
          var dDesc = WMO[dCode] || "🌡️";
          var tMax = data.daily.temperature_2m_max[i];
          var tMin = data.daily.temperature_2m_min[i];
          if(unit === "f"){ tMax = (tMax * 9/5) + 32; tMin = (tMin * 9/5) + 32; }
          html += '<div style="flex-shrink:0;min-width:70px;padding:10px 6px;background:rgba(0,0,0,.3);border-radius:10px;text-align:center">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">' + d.toLocaleDateString("de-DE", {weekday:"short"}) + '</div>'
            + '<div style="font-size:22px;margin:4px 0">' + dDesc.split(" ")[0] + '</div>'
            + '<div style="font-size:11px;font-weight:900;color:var(--p1)">' + Math.round(tMax) + '°</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">' + Math.round(tMin) + '°</div>'
            + '</div>';
        }
        html += '</div></div>';
      }

      res.innerHTML = html;
    }

    build();
  }

  HalDoApp("wetter", { name: "Wetter", icon: "🌤️", render: render, category: "werkzeuge" });
  console.log("🦚 wetter.js geladen");
})();
