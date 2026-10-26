/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KREDIT (v1.0)
   Annuitätendarlehen · Tilgungsplan · Sondertilgung · Vergleich
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmt(n){ return Number(n).toLocaleString("de-DE",{ minimumFractionDigits:2, maximumFractionDigits:2 }); }

  function calcAnnuität(P, zinsJahr, jahre){
    var r = zinsJahr / 100 / 12;
    var n = jahre * 12;
    if(r === 0) return P / n;
    return P * r / (1 - Math.pow(1 + r, -n));
  }

  function tilgungsplan(P, zinsJahr, rate){
    var r = zinsJahr / 100 / 12;
    var rest = P;
    var monate = 0;
    var totalZins = 0;
    var plan = [];
    while(rest > 0.01 && monate < 600){
      monate++;
      var zins = rest * r;
      var tilgung = rate - zins;
      if(tilgung <= 0) { plan.push({ m:monate, rest:rest, zins:zins, tilgung:0, warn:true }); break; }
      if(tilgung > rest) tilgung = rest;
      rest = rest - tilgung;
      totalZins += zins;
      plan.push({ m:monate, rest:Math.max(0,rest), zins:zins, tilgung:tilgung });
    }
    return { plan, totalZins, monate };
  }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"calc" };
    var data = store.get("data", { P:200000, zins:4.5, jahre:20, rate:0, sonder:0 });

    function build(){
      if(view.screen === "plan") screenPlan();
      else if(view.screen === "list") screenList();
      else screenCalc();
    }

    function screenCalc(){
      var rate = data.rate || calcAnnuität(data.P, data.zins, data.jahre);
      var plan = tilgungsplan(data.P, data.zins, rate);
      var total = data.P + plan.totalZins;

      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,213,79,.15),rgba(180,120,255,.1));border:1px solid rgba(255,213,79,.3)">'
        + '<div style="font-size:44px">🏦</div>'
        + '<div style="font-size:16px;font-weight:900;color:#ffd54f;margin-top:6px">Kreditrechner</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">Annuitätendarlehen · Tilgungsplan</div>'
        + '</div>';

      html += '<div class="card"><h3>Eingaben</h3>'
        + '<div class="field"><label>Kreditbetrag (€)</label><input id="k-P" type="number" value="'+data.P+'" min="1000" step="1000" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Zinssatz (% p.a.)</label><input id="k-zins" type="number" value="'+data.zins+'" min="0" max="30" step="0.1" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Laufzeit (Jahre)</label><input id="k-jahre" type="number" value="'+data.jahre+'" min="1" max="40" style="font-size:16px;text-align:center"></div>'
        + '<div class="field"><label>Monatliche Rate (€) — leer = automatisch</label><input id="k-rate" type="number" value="'+(data.rate || Math.round(rate)) +'" min="0" step="10" style="font-size:16px;text-align:center"></div>'
        + '</div>';

      // Result
      html += '<div class="card" style="background:linear-gradient(135deg,rgba(74,222,128,.1),rgba(77,208,225,.1));border:1px solid rgba(74,222,128,.3)">'
        + '<h3>💰 Monatliche Rate</h3>'
        + '<div style="text-align:center;padding:14px 0">'
        + '<div style="font-size:38px;font-weight:900;color:#4ade80;line-height:1">'+fmt(rate)+' €</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">'+plan.monate+' Monate · '+(plan.monate/12).toFixed(1)+' Jahre</div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'
        + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;text-align:center"><div style="font-size:10px;color:var(--text-mute)">Zinsen gesamt</div><div style="font-size:16px;font-weight:900;color:#ff6b6b;margin-top:2px">'+fmt(plan.totalZins)+' €</div></div>'
        + '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;text-align:center"><div style="font-size:10px;color:var(--text-mute)">Gesamtkosten</div><div style="font-size:16px;font-weight:900;color:#ffd54f;margin-top:2px">'+fmt(total)+' €</div></div>'
        + '</div>'
        + '</div>';

      html += '<div class="card" style="display:flex;gap:6px">'
        + '<button class="btn" id="k-save" style="flex:1;font-size:11px">💾 Speichern</button>'
        + '<button class="btn sec" id="k-plan" style="flex:1;font-size:11px">📋 Tilgungsplan</button>'
        + '<button class="btn sec" id="k-list" style="flex:1;font-size:11px">📊 Vergleiche</button>'
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      ["#k-P", "#k-zins", "#k-jahre", "#k-rate"].forEach(function(sel){
        var el = container.querySelector(sel);
        if(el) el.addEventListener("change", function(){
          data.P = parseFloat(container.querySelector("#k-P").value) || 1000;
          data.zins = parseFloat(container.querySelector("#k-zins").value) || 0;
          data.jahre = parseInt(container.querySelector("#k-jahre").value) || 10;
          data.rate = parseFloat(container.querySelector("#k-rate").value) || 0;
          store.set("data", data);
          screenCalc();
        });
      });
      container.querySelector("#k-save").addEventListener("click", function(){
        var rate = data.rate || calcAnnuität(data.P, data.zins, data.jahre);
        var plan = tilgungsplan(data.P, data.zins, rate);
        var history = store.get("history", []);
        history.unshift({
          id: "k" + Date.now(),
          P: data.P, zins: data.zins, jahre: data.jahre, rate: rate,
          monate: plan.monate, totalZins: plan.totalZins,
          total: data.P + plan.totalZins,
          date: new Date().toISOString()
        });
        if(history.length > 20) history = history.slice(0,20);
        store.set("history", history);
        if(HalDo.Notify) HalDo.Notify.success("Berechnung gespeichert");
      });
      container.querySelector("#k-plan").addEventListener("click", function(){ view.screen = "plan"; build(); });
      container.querySelector("#k-list").addEventListener("click", function(){ view.screen = "list"; build(); });
    }

    function screenPlan(){
      var rate = data.rate || calcAnnuität(data.P, data.zins, data.jahre);
      var plan = tilgungsplan(data.P, data.zins, rate);
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>📋 Tilgungsplan</h3>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">'+plan.monate+' Monate · Rate '+fmt(rate)+' €</div>'
        + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:10.5px;font-variant-numeric:tabular-nums">'
        + '<thead><tr style="color:var(--text-mute);text-align:right;border-bottom:1px solid rgba(255,255,255,.1)">'
        + '<th style="padding:6px 4px;text-align:left">Monat</th>'
        + '<th style="padding:6px 4px">Zins</th>'
        + '<th style="padding:6px 4px">Tilgung</th>'
        + '<th style="padding:6px 4px">Rest</th>'
        + '</tr></thead><tbody>';
      var step = Math.max(1, Math.floor(plan.plan.length / 30));
      plan.plan.forEach(function(p, i){
        if(i % step !== 0 && i !== plan.plan.length - 1) return;
        if(p.warn){
          html += '<tr style="border-bottom:1px solid rgba(255,255,255,.05);background:rgba(255,128,128,.1)"><td style="padding:6px 4px">'+p.m+'</td><td colspan="3" style="padding:6px 4px;color:#ff8080;text-align:center">⚠️ Rate zu niedrig — Zins größer als Rate</td></tr>';
          return;
        }
        html += '<tr style="border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<td style="padding:6px 4px">'+p.m+'</td>'
          + '<td style="padding:6px 4px;color:#ff6b6b;text-align:right">'+fmt(p.zins)+'</td>'
          + '<td style="padding:6px 4px;color:#4ade80;text-align:right">'+fmt(p.tilgung)+'</td>'
          + '<td style="padding:6px 4px;color:var(--p1);text-align:right;font-weight:900">'+fmt(p.rest)+'</td>'
          + '</tr>';
      });
      html += '</tbody></table></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "calc"; build(); });
    }

    function screenList(){
      var history = store.get("history", []);
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>📊 Gespeicherte Vergleiche ('+history.length+')</h3>';
      if(!history.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:20px;font-size:12px">Noch keine Vergleiche. Speichere deine erste Berechnung.</div>';
      } else {
        history.forEach(function(h){
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid #ffd54f">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12px;font-weight:900">'+fmt(h.P)+' € · '+h.zins+'% · '+h.jahre+'J</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">Rate: '+fmt(h.rate)+' € · Zinsen: '+fmt(h.totalZins)+' €</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">'+new Date(h.date).toLocaleString("de-DE")+'</div>'
            + '</div>'
            + '<button data-del="'+h.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✕</button>'
            + '</div></div>';
        });
      }
      html += '</div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "calc"; build(); });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Löschen?")) return;
          store.set("history", getHistory().filter(function(h){ return h.id !== el.dataset.del; }));
          screenList();
        });
      });
    }
    function getHistory(){ return store.get("history", []); }

    build();
  }

  HalDoApp("kredit", { name: "Kredit", icon: "🏦", render: render, category: "finanzen" });
  console.log("🦚 kredit.js v1.0 geladen");
})();
