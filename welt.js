/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WELT APP (v150)
   Länder · Wetter (Open-Meteo) · Weltzeiten · Suche
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var COUNTRIES = [
    {de:"Deutschland",ku:"Almanya",flag:"🇩🇪",cap:"Berlin",pop:84000000,cont:"Europa",lat:52.52,lng:13.40,tz:"Europe/Berlin"},
    {de:"Türkei",ku:"Tirkiye",flag:"🇹🇷",cap:"Ankara",pop:85000000,cont:"Asien",lat:39.93,lng:32.86,tz:"Europe/Istanbul"},
    {de:"Irak",ku:"Iraq",flag:"🇮🇶",cap:"Bagdad",pop:42000000,cont:"Asien",lat:33.31,lng:44.36,tz:"Asia/Baghdad"},
    {de:"Syrien",ku:"Sûriye",flag:"🇸🇾",cap:"Damaskus",pop:18000000,cont:"Asien",lat:33.51,lng:36.30,tz:"Asia/Damascus"},
    {de:"Iran",ku:"Îran",flag:"🇮🇷",cap:"Teheran",pop:87000000,cont:"Asien",lat:35.69,lng:51.39,tz:"Asia/Tehran"},
    {de:"Frankreich",ku:"Fransa",flag:"🇫🇷",cap:"Paris",pop:68000000,cont:"Europa",lat:48.86,lng:2.35,tz:"Europe/Paris"},
    {de:"Italien",ku:"Îtalya",flag:"🇮🇹",cap:"Rom",pop:59000000,cont:"Europa",lat:41.90,lng:12.50,tz:"Europe/Rome"},
    {de:"Spanien",ku:"Spanya",flag:"🇪🇸",cap:"Madrid",pop:48000000,cont:"Europa",lat:40.42,lng:-3.70,tz:"Europe/Madrid"},
    {de:"Großbritannien",ku:"Brîtanya",flag:"🇬🇧",cap:"London",pop:68000000,cont:"Europa",lat:51.51,lng:-0.13,tz:"Europe/London"},
    {de:"Russland",ku:"Rûsya",flag:"🇷🇺",cap:"Moskau",pop:144000000,cont:"Europa/Asien",lat:55.75,lng:37.62,tz:"Europe/Moscow"},
    {de:"China",ku:"Çîn",flag:"🇨🇳",cap:"Peking",pop:1400000000,cont:"Asien",lat:39.90,lng:116.41,tz:"Asia/Shanghai"},
    {de:"Japan",ku:"Japonya",flag:"🇯🇵",cap:"Tokio",pop:125000000,cont:"Asien",lat:35.68,lng:139.69,tz:"Asia/Tokyo"},
    {de:"Indien",ku:"Hindistan",flag:"🇮🇳",cap:"Neu-Delhi",pop:1400000000,cont:"Asien",lat:28.61,lng:77.21,tz:"Asia/Kolkata"},
    {de:"Armenien",ku:"Ermenistan",flag:"🇦🇲",cap:"Eriwan",pop:3000000,cont:"Asien",lat:40.18,lng:44.51,tz:"Asia/Yerevan"},
    {de:"Aserbaidschan",ku:"Azerbaycan",flag:"🇦🇿",cap:"Baku",pop:10000000,cont:"Asien",lat:40.41,lng:49.87,tz:"Asia/Baku"},
    {de:"Georgien",ku:"Gurcistan",flag:"🇬🇪",cap:"Tiflis",pop:3700000,cont:"Asien",lat:41.72,lng:44.79,tz:"Asia/Tbilisi"},
    {de:"Ägypten",ku:"Misir",flag:"🇪🇬",cap:"Kairo",pop:110000000,cont:"Afrika",lat:30.04,lng:31.24,tz:"Africa/Cairo"},
    {de:"USA",ku:"DYA",flag:"🇺🇸",cap:"Washington D.C.",pop:335000000,cont:"Nordamerika",lat:38.90,lng:-77.04,tz:"America/New_York"},
    {de:"Kanada",ku:"Kanada",flag:"🇨🇦",cap:"Ottawa",pop:40000000,cont:"Nordamerika",lat:45.42,lng:-75.70,tz:"America/Toronto"},
    {de:"Brasilien",ku:"Brezîlya",flag:"🇧🇷",cap:"Brasília",pop:215000000,cont:"Südamerika",lat:-15.78,lng:-47.93,tz:"America/Sao_Paulo"},
    {de:"Australien",ku:"Awistralya",flag:"🇦🇺",cap:"Canberra",pop:26000000,cont:"Ozeanien",lat:-35.28,lng:149.13,tz:"Australia/Sydney"}
  ];

  var CITIES = [
    {de:"Berlin",ku:"Berlîn",flag:"🇩🇪",lat:52.52,lng:13.40,tz:"Europe/Berlin"},
    {de:"Istanbul",ku:"Stenbol",flag:"🇹🇷",lat:41.01,lng:28.98,tz:"Europe/Istanbul"},
    {de:"Diyarbakır",ku:"Amed",flag:"🇹🇷",lat:37.91,lng:40.24,tz:"Europe/Istanbul"},
    {de:"Van",ku:"Wan",flag:"🇹🇷",lat:38.49,lng:43.38,tz:"Europe/Istanbul"},
    {de:"Erbil",ku:"Hewlêr",flag:"🇮🇶",lat:36.19,lng:44.01,tz:"Asia/Baghdad"},
    {de:"Sulaymaniyah",ku:"Silêmanî",flag:"🇮🇶",lat:35.56,lng:45.43,tz:"Asia/Baghdad"},
    {de:"Duhok",ku:"Dihok",flag:"🇮🇶",lat:36.87,lng:42.99,tz:"Asia/Baghdad"},
    {de:"Kirkuk",ku:"Kerkûk",flag:"🇮🇶",lat:35.47,lng:44.39,tz:"Asia/Baghdad"},
    {de:"Laliş",ku:"Laliş",flag:"🦚",lat:36.34,lng:43.72,tz:"Asia/Baghdad"},
    {de:"Sindschar",ku:"Şingal",flag:"🦚",lat:36.32,lng:41.86,tz:"Asia/Baghdad"},
    {de:"Damaskus",ku:"Şam",flag:"🇸🇾",lat:33.51,lng:36.30,tz:"Asia/Damascus"},
    {de:"Qamishli",ku:"Qamişlo",flag:"🇸🇾",lat:37.05,lng:41.22,tz:"Asia/Damascus"},
    {de:"Teheran",ku:"Tehran",flag:"🇮🇷",lat:35.69,lng:51.39,tz:"Asia/Tehran"},
    {de:"Paris",ku:"Parîs",flag:"🇫🇷",lat:48.86,lng:2.35,tz:"Europe/Paris"},
    {de:"London",ku:"London",flag:"🇬🇧",lat:51.51,lng:-0.13,tz:"Europe/London"},
    {de:"Moskau",ku:"Moskova",flag:"🇷🇺",lat:55.75,lng:37.62,tz:"Europe/Moscow"},
    {de:"New York",ku:"Nû York",flag:"🇺🇸",lat:40.71,lng:-74.01,tz:"America/New_York"},
    {de:"Tokio",ku:"Tokyo",flag:"🇯🇵",lat:35.68,lng:139.69,tz:"Asia/Tokyo"}
  ];

  var _timeInterval = null;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "countries");
    var searchQ = "";
    var favs = store.get("favs", ["Berlin","Hewlêr"]);

    function stopTimeInterval(){
      if(_timeInterval){ clearInterval(_timeInterval); _timeInterval = null; }
    }

    function build(){
      stopTimeInterval();
      var body = "";

      /* ═══ LÄNDER ═══ */
      if(tab === "countries"){
        var f = COUNTRIES;
        if(searchQ){
          var q = searchQ.toLowerCase();
          f = COUNTRIES.filter(function(c){
            return c.de.toLowerCase().indexOf(q) >= 0 ||
                   c.ku.toLowerCase().indexOf(q) >= 0 ||
                   c.cap.toLowerCase().indexOf(q) >= 0;
          });
        }
        var byCont = {};
        f.forEach(function(c){ (byCont[c.cont] = byCont[c.cont] || []).push(c); });

        body = '<div class="card"><h3>🔍 Suche</h3>'
          + '<input type="text" id="wSearch" placeholder="Land, Hauptstadt, Kurdisch…" value="' + _esc(searchQ) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px;text-align:center">' + f.length + ' von ' + COUNTRIES.length + ' Ländern</div>'
          + '</div>';

        Object.keys(byCont).sort().forEach(function(cont){
          body += '<div class="card"><h3>📍 ' + _esc(cont) + ' (' + byCont[cont].length + ')</h3>';
          byCont[cont].forEach(function(c){
            body += '<div data-cty="' + _esc(c.de) + '" style="padding:11px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:5px;cursor:pointer;display:flex;gap:10px;align-items:center">'
              + '<div style="font-size:28px">' + c.flag + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:13px;font-weight:800">' + _esc(c.de) + '</div>'
              + '<div style="font-size:11px;color:#c084fc;font-weight:700;margin-top:2px">🟨 ' + _esc(c.ku) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">🏛️ ' + _esc(c.cap) + ' · 👥 ' + (c.pop/1000000).toFixed(1) + 'M</div>'
              + '</div></div>';
          });
          body += '</div>';
        });

      /* ═══ WETTER ═══ */
      } else if(tab === "weather"){
        body = '<div class="card"><h3>🌤️ Wetter (Open-Meteo, kostenlos)</h3>'
          + '<div class="field"><label>Stadt</label><select id="wSel">'
          + CITIES.map(function(c){ return '<option value="' + c.lat + ',' + c.lng + ',' + _esc(c.cap || c.de) + '">' + c.flag + ' ' + _esc(c.de) + '</option>'; }).join("")
          + '</select></div>'
          + '<div id="wRes" style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;min-height:160px;margin-top:10px">'
          + '<div style="color:var(--text-mute);padding:40px">⏳ Lade…</div></div>'
          + '<div id="wFore" style="margin-top:12px"></div></div>';

      /* ═══ ZEITEN ═══ */
      } else if(tab === "time"){
        var favCities = CITIES.filter(function(c){ return favs.indexOf(c.de) >= 0; });
        body = '<div class="card"><h3>🕐 Weltzeiten (' + favCities.length + ' Favoriten)</h3>';
        if(!favCities.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Favoriten in Städte-Tab hinzufügen (⭐)</div>';
        } else {
          favCities.forEach(function(c){
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center">'
              + '<div style="display:flex;gap:10px;align-items:center">'
              + '<span style="font-size:22px">' + c.flag + '</span>'
              + '<div><div style="font-size:12px;font-weight:800">' + _esc(c.de) + '</div>'
              + '<div style="font-size:9px;color:var(--text-mute)">' + _esc(c.ku) + '</div></div></div>'
              + '<div data-wtz="' + _esc(c.tz) + '" style="font-size:18px;font-weight:900;color:var(--p1);font-family:ui-monospace">--:--</div>'
              + '</div>';
          });
        }
        body += '</div>';

      /* ═══ STÄDTE ═══ */
      } else if(tab === "cities"){
        body = '<div class="card"><h3>🏙️ Städte (' + CITIES.length + ')</h3>';
        CITIES.forEach(function(c){
          var isFav = favs.indexOf(c.de) >= 0;
          body += '<div style="padding:11px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:5px;display:flex;gap:10px;align-items:center">'
            + '<div style="font-size:24px">' + c.flag + '</div>'
            + '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800">' + _esc(c.de) + '</div>'
            + '<div style="font-size:11px;color:#c084fc;font-weight:700">🟨 ' + _esc(c.ku) + '</div></div>'
            + '<button data-fav="' + _esc(c.de) + '" style="background:transparent;border:none;font-size:18px;cursor:pointer">' + (isFav ? "⭐" : "☆") + '</button>'
            + '<button data-weather="' + _esc(c.de) + '" style="background:rgba(0,229,255,.1);border:var(--border-soft);border-radius:8px;padding:6px 10px;font-size:10px;font-weight:800;color:var(--p1);cursor:pointer">🌤️</button>'
            + '</div>';
        });
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="countries"?" active":"") + '" data-wt="countries">🌍 Länder</button>'
        + '<button class="tab' + (tab==="weather"?" active":"") + '" data-wt="weather">🌤️ Wetter</button>'
        + '<button class="tab' + (tab==="time"?" active":"") + '" data-wt="time">🕐 Zeiten</button>'
        + '<button class="tab' + (tab==="cities"?" active":"") + '" data-wt="cities">🏙️ Städte</button>'
        + '</div>' + body;

      /* Event-Listener */
      container.querySelectorAll("[data-wt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.wt;
          store.set("tab", tab);
          build();
        });
      });

      container.querySelectorAll("[data-cty]").forEach(function(el){
        el.addEventListener("click", function(){
          var c = COUNTRIES.find(function(x){ return x.de === el.dataset.cty; });
          if(!c) return;
          var info = "🌍 " + c.de + "\n🟨 " + c.ku + "\n🏛️ " + c.cap + "\n👥 " + (c.pop/1000000).toFixed(1) + "M\n🕐 " + c.tz;
          alert(info);
          if(window.HalDo.Voice) HalDo.Voice.speak(c.de + ". Kurdisch: " + c.ku);
        });
      });

      container.querySelectorAll("[data-fav]").forEach(function(b){
        b.addEventListener("click", function(){
          var id = b.dataset.fav;
          var i = favs.indexOf(id);
          if(i >= 0) favs.splice(i, 1); else favs.push(id);
          store.set("favs", favs);
          build();
        });
      });

      container.querySelectorAll("[data-weather]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = "weather";
          store.set("tab", "weather");
          build();
          setTimeout(function(){
            var sel = container.querySelector("#wSel");
            if(sel){
              for(var i = 0; i < sel.options.length; i++){
                if(sel.options[i].text.indexOf(b.dataset.weather) >= 0){
                  sel.selectedIndex = i;
                  sel.dispatchEvent(new Event("change"));
                  break;
                }
              }
            }
          }, 50);
        });
      });

      var s = container.querySelector("#wSearch");
      if(s) s.addEventListener("input", function(){ searchQ = this.value; build(); });

      if(tab === "weather") loadWeather(container);
      if(tab === "time") startTimeInterval(container);
    }

    function loadWeather(c){
      var sel = c.querySelector("#wSel");
      if(!sel) return;
      function fetchWeather(){
        var p = sel.value.split(",");
        var lat = p[0], lng = p[1], nm = p[2];
        var res = c.querySelector("#wRes");
        var fore = c.querySelector("#wFore");
        if(!res) return;
        res.innerHTML = '<div style="color:var(--text-mute);padding:40px">⏳ Lade…</div>';
        fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lng + "&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7")
          .then(function(r){ return r.json(); })
          .then(function(d){
            var cur = d.current;
            var ic = "🌤️", desc = "?";
            var wc = cur.weather_code;
            if(wc === 0){ ic = "☀️"; desc = "Klar"; }
            else if(wc <= 3){ ic = "⛅"; desc = "Wolkig"; }
            else if(wc <= 48){ ic = "🌫️"; desc = "Neblig"; }
            else if(wc <= 67){ ic = "🌧️"; desc = "Regen"; }
            else if(wc <= 77){ ic = "❄️"; desc = "Schnee"; }
            else { ic = "⛈️"; desc = "Gewitter"; }

            res.innerHTML = '<div style="font-size:64px">' + ic + '</div>'
              + '<div style="font-size:44px;font-weight:900;color:var(--p1)">' + Math.round(cur.temperature_2m) + '°C</div>'
              + '<div style="font-size:14px;color:var(--text-dim);margin-top:6px">' + desc + '</div>'
              + '<div style="font-size:11px;color:var(--text-mute);margin-top:10px">💨 ' + Math.round(cur.wind_speed_10m) + ' km/h · 💧 ' + cur.relative_humidity_2m + '%</div>'
              + '<div style="font-size:10px;color:var(--text-mute);margin-top:6px">📍 ' + _esc(nm) + '</div>';

            if(d.daily && d.daily.time){
              var f = '<div class="card"><h3>📅 7-Tage-Vorschau</h3>';
              for(var i = 0; i < d.daily.time.length; i++){
                f += '<div style="padding:9px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;font-size:12px">'
                  + '<span>' + d.daily.time[i] + '</span>'
                  + '<span><span style="color:#ff8080">' + Math.round(d.daily.temperature_2m_min[i]) + '°</span> / <span style="color:#4ade80">' + Math.round(d.daily.temperature_2m_max[i]) + '°</span></span>'
                  + '</div>';
              }
              f += '</div>';
              fore.innerHTML = f;
            }
          })
          .catch(function(e){
            res.innerHTML = '<div style="color:#ff8080;padding:20px">❌ ' + _esc(e.message) + '</div>';
          });
      }
      sel.addEventListener("change", fetchWeather);
      fetchWeather();
    }

    function startTimeInterval(c){
      function tick(){
        var now = new Date();
        c.querySelectorAll("[data-wtz]").forEach(function(el){
          try {
            el.textContent = now.toLocaleTimeString("de-DE", {
              timeZone: el.dataset.wtz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
            });
          } catch(e){}
        });
      }
      tick();
      _timeInterval = setInterval(tick, 1000);
    }

    build();
  }

  function destroy(){ stopTimeInterval(); }

  if(window.HalDoApp) HalDoApp("welt", { render: render, destroy: destroy });
  else console.warn("welt.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 welt.js geladen");
