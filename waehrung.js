/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WÄHRUNG (v1.0)
   Live Wechselkurse via Frankfurter API
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var CURRENCIES = {
    EUR:"🇪🇺 Euro", USD:"🇺🇸 US-Dollar", GBP:"🇬🇧 Britisches Pfund",
    TRY:"🇹🇷 Türkische Lira", CHF:"🇨🇭 Schweizer Franken",
    JPY:"🇯🇵 Yen", CNY:"🇨🇳 Yuan", RUB:"🇷🇺 Rubel",
    AED:"🇦🇪 Dirham", IQD:"🇮🇶 Irakischer Dinar", IRR:"🇮🇷 Rial",
    CAD:"🇨🇦 Kanadischer Dollar", AUD:"🇦🇺 Australischer Dollar",
    INR:"🇮🇳 Indische Rupie", BRL:"🇧🇷 Real", MXN:"🇲🇽 Peso",
    PLN:"🇵🇱 Złoty", SEK:"🇸🇪 Krone", NOK:"🇳🇴 Krone", DKK:"🇩🇰 Krone"
  };

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = {
      from: store.get("from", "EUR"),
      to: store.get("to", "USD"),
      value: store.get("value", "100"),
      rates: store.get("rates", null),
      lastUpdate: store.get("lastUpdate", 0),
      loading: false,
      error: null
    };

    function save(){
      store.set("from", state.from); store.set("to", state.to); store.set("value", state.value);
      if(state.rates){ store.set("rates", state.rates); store.set("lastUpdate", state.lastUpdate); }
    }

    async function fetchRates(base){
      state.loading = true; state.error = null; build();
      try {
        var res = await fetch("https://api.frankfurter.app/latest?from=" + base);
        if(!res.ok) throw new Error("HTTP " + res.status);
        var data = await res.json();
        state.rates = data.rates;
        state.rates[base] = 1;
        state.lastUpdate = Date.now();
        save();
      } catch(e){
        state.error = "Konnte Kurse nicht laden: " + e.message;
      }
      state.loading = false;
      build();
    }

    function convert(){
      var n = parseFloat(state.value);
      if(isNaN(n)) return "";
      if(!state.rates) return "";
      var r1 = state.rates[state.from] || 1;
      var r2 = state.rates[state.to] || 1;
      var result = (n / r1) * r2;
      return result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function build(){
      var result = convert();
      var fromName = CURRENCIES[state.from] || state.from;
      var toName = CURRENCIES[state.to] || state.to;

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,213,79,.15),rgba(255,152,0,.1));border:1px solid rgba(255,213,79,.3)">'
        + '<div style="font-size:44px">💱</div>'
        + '<div style="font-size:18px;font-weight:900;color:#ffd54f;margin-top:6px">Währungsrechner</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Live-Kurse · Frankfurter API</div>'
        + '</div>';

      html += '<div class="card">'
        + '<div class="field"><label>Betrag</label>'
        + '<input id="curVal" type="number" inputmode="decimal" value="'+_esc(state.value)+'" placeholder="0.00" style="font-size:24px;text-align:center;font-weight:900;color:#ffd54f">'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center">'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800;display:block;margin-bottom:4px">VON</label>'
        + '<select id="curFrom" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + Object.keys(CURRENCIES).map(function(c){return '<option value="'+c+'"'+(state.from===c?" selected":"")+'>'+CURRENCIES[c]+'</option>';}).join('')
        + '</select></div>'
        + '<button id="curSwap" style="background:rgba(255,213,79,.15);border:1px solid rgba(255,213,79,.4);color:#ffd54f;border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:16px;margin-top:20px">⇄</button>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800;display:block;margin-bottom:4px">NACH</label>'
        + '<select id="curTo" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + Object.keys(CURRENCIES).map(function(c){return '<option value="'+c+'"'+(state.to===c?" selected":"")+'>'+CURRENCIES[c]+'</option>';}).join('')
        + '</select></div>'
        + '</div>';

      if(result !== ""){
        html += '<div style="margin-top:16px;padding:16px;background:rgba(255,213,79,.1);border:1px solid rgba(255,213,79,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800;margin-bottom:4px">ERGEBNIS</div>'
          + '<div style="font-size:28px;font-weight:900;color:#ffd54f;font-variant-numeric:tabular-nums">'+result+'</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">'+_esc(state.to)+'</div>'
          + '</div>';
      }

      if(state.loading) html += '<div style="text-align:center;padding:12px;color:var(--text-mute);font-size:11px">⏳ Lade Kurse...</div>';
      else if(state.error) html += '<div style="text-align:center;padding:12px;color:#ff8080;font-size:11px">⚠️ '+_esc(state.error)+'</div>';
      else if(state.lastUpdate) {
        var ago = Math.round((Date.now()-state.lastUpdate)/60000);
        html += '<div style="text-align:center;padding:6px;color:var(--text-mute);font-size:10px">Aktualisiert vor '+(ago<1?"wenigen Sek.":ago+" Min.")+'</div>';
      }

      html += '<button class="btn full" id="curRefresh" style="margin-top:8px" '+(state.loading?"disabled":"")+'>'+(state.loading?"⏳ Lade...":"🔄 Kurse aktualisieren")+'</button>'
        + '</div>';

      // Schnellbeträge
      html += '<div class="card"><h3>Schnell</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'
        + [10,50,100,500].map(function(n){
            return '<button data-quick="'+n+'" class="btn sec" style="padding:10px 4px;font-size:12px">'+n+'</button>';
          }).join('')
        + '</div></div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      var vi = container.querySelector("#curVal");
      vi.addEventListener("input", function(){
        state.value = vi.value; save();
        // Nur Ergebnis-Box neu zeichnen
        var result = convert();
        var box = container.querySelector('div[style*="rgba(255,213,79,.1)"]');
        if(box && result !== ""){
          box.querySelector('div[style*="font-size:28px"]').textContent = result;
        } else {
          build();
        }
      });
      container.querySelector("#curFrom").addEventListener("change", function(e){
        state.from = e.target.value; save();
        if(state.from === "EUR" || !state.rates || !state.rates[state.from]) fetchRates(state.from);
        else build();
      });
      container.querySelector("#curTo").addEventListener("change", function(e){ state.to = e.target.value; save(); build(); });
      container.querySelector("#curSwap").addEventListener("click", function(){
        var t = state.from; state.from = state.to; state.to = t; save();
        if(state.from === "EUR" || !state.rates || !state.rates[state.from]) fetchRates(state.from);
        else build();
      });
      container.querySelector("#curRefresh").addEventListener("click", function(){
        if(!state.loading) fetchRates("EUR");
      });
      container.querySelectorAll("[data-quick]").forEach(function(el){
        el.addEventListener("click", function(){
          state.value = el.dataset.quick; save(); build();
        });
      });
    }

    // Beim ersten Öffnen laden (wenn keine Kurse oder älter als 1 Tag)
    if(!state.rates || Date.now()-state.lastUpdate > 86400000){
      fetchRates("EUR");
    } else {
      build();
    }
  }

  HalDoApp("waehrung", { name: "Währung", icon: "💱", render: render, category: "finanzen" });
  console.log("🦚 waehrung.js v1.0 geladen");
})();
