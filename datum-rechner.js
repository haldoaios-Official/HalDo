/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DATUM-RECHNER (v1.0)
   Differenz · Addieren · Alter · Wochentag
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var view = store.get("view", "menu");

    function build(){
      if(view === "menu") screenMenu();
      else if(view === "diff") screenDiff();
      else if(view === "add") screenAdd();
      else if(view === "age") screenAge();
      else if(view === "weekday") screenWeekday();
    }

    function screenMenu(){
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">📅</div>'
        + '<div style="font-size:18px;font-weight:900;color:#4dd0e1;margin-top:6px">Datum-Rechner</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Differenz · Addieren · Alter · Wochentag</div>'
        + '</div>';
      var tools = [
        { id:"diff",    icon:"↔️", name:"Tage zwischen Daten", desc:"Wie viele Tage liegen dazwischen?", color:"#4dd0e1" },
        { id:"add",     icon:"➕", name:"Datum addieren",       desc:"Datum + X Tage/Wochen/Monate", color:"#ffd54f" },
        { id:"age",     icon:"🎂", name:"Alter berechnen",     desc:"Wie alt bin ich?", color:"#ff6b6b" },
        { id:"weekday", icon:"📆", name:"Welcher Tag?",        desc:"Wochentag für ein Datum", color:"#66cc66" }
      ];
      html += '<div class="card">';
      tools.forEach(function(t){
        html += '<button data-tool="'+t.id+'" style="width:100%;padding:14px;background:rgba(0,0,0,.2);border:1px solid '+t.color+'44;border-left:3px solid '+t.color+';border-radius:10px;margin-bottom:6px;color:inherit;font-family:inherit;cursor:pointer;text-align:left">'
          + '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:24px">'+t.icon+'</div>'
          + '<div><div style="font-size:13px;font-weight:900;color:'+t.color+'">'+t.name+'</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute)">'+t.desc+'</div></div></div></button>';
      });
      html += '</div>';
      container.innerHTML = html;
      container.querySelectorAll("[data-tool]").forEach(function(el){
        el.addEventListener("click", function(){ view = el.dataset.tool; store.set("view", view); build(); });
      });
    }

    function backBar(){
      return '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>';
    }

    function screenDiff(){
      var today = new Date().toISOString().split("T")[0];
      var html = backBar() + '<div class="card"><h3>↔️ Tage zwischen Daten</h3>'
        + '<div class="field"><label>Von</label><input type="date" id="d-from" value="'+today+'" style="font-size:16px"></div>'
        + '<div class="field"><label>Bis</label><input type="date" id="d-to" value="'+today+'"></div>'
        + '<button class="btn full" id="d-calc">= Berechnen</button>'
        + '<div id="d-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#d-calc").addEventListener("click", function(){
        var from = container.querySelector("#d-from").value;
        var to = container.querySelector("#d-to").value;
        if(!from || !to) return;
        var f = new Date(from + "T00:00:00");
        var t = new Date(to + "T00:00:00");
        var days = Math.round((t-f)/86400000);
        var ad = Math.abs(days);
        var weeks = Math.floor(ad/7);
        var remDays = ad%7;
        var out = container.querySelector("#d-out");
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">DIFFERENZ</div>'
          + '<div style="font-size:32px;font-weight:900;color:#4dd0e1;margin-top:4px">'+ad+' Tage</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">= '+weeks+' Wochen' + (remDays ? ' + '+remDays+' Tage' : '')+'</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">= '+Math.floor(ad/30.44)+' Monate (ca.)</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">= '+(ad/365.25).toFixed(2)+' Jahre</div>'
          + (days < 0 ? '<div style="color:#ffd54f;font-size:11px;margin-top:6px">⚠️ "Bis" liegt vor "Von"</div>' : '')
          + '</div>';
      });
    }

    function screenAdd(){
      var today = new Date().toISOString().split("T")[0];
      var html = backBar() + '<div class="card"><h3>➕ Datum addieren</h3>'
        + '<div class="field"><label>Startdatum</label><input type="date" id="a-date" value="'+today+'"></div>'
        + '<div class="field"><label>Anzahl</label><input type="number" id="a-num" value="30" style="font-size:16px;text-align:center"></div>'
        + '<div class="field"><label>Einheit</label><select id="a-unit">'
        + '<option value="d">Tage</option><option value="w">Wochen</option><option value="m">Monate</option><option value="y">Jahre</option>'
        + '</select></div>'
        + '<button class="btn full" id="a-calc">= Berechnen</button>'
        + '<div id="a-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#a-calc").addEventListener("click", function(){
        var d = container.querySelector("#a-date").value;
        var n = parseInt(container.querySelector("#a-num").value);
        var u = container.querySelector("#a-unit").value;
        if(!d || isNaN(n)) return;
        var dt = new Date(d + "T00:00:00");
        if(u === "d") dt.setDate(dt.getDate() + n);
        else if(u === "w") dt.setDate(dt.getDate() + n*7);
        else if(u === "m") dt.setMonth(dt.getMonth() + n);
        else if(u === "y") dt.setFullYear(dt.getFullYear() + n);
        var out = container.querySelector("#a-out");
        var ds = dt.toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(255,213,79,.1);border:1px solid rgba(255,213,79,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">ERGEBNIS</div>'
          + '<div style="font-size:20px;font-weight:900;color:#ffd54f;margin-top:6px">'+ds+'</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">'+dt.toISOString().split("T")[0]+'</div>'
          + '</div>';
      });
    }

    function screenAge(){
      var today = new Date().toISOString().split("T")[0];
      var html = backBar() + '<div class="card"><h3>🎂 Alter berechnen</h3>'
        + '<div class="field"><label>Geburtsdatum</label><input type="date" id="ag-date" value="'+(store.get("birthday", today))+'" style="font-size:16px"></div>'
        + '<button class="btn full" id="ag-calc">= Berechnen</button>'
        + '<div id="ag-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#ag-calc").addEventListener("click", function(){
        var b = container.querySelector("#ag-date").value;
        if(!b) return;
        store.set("birthday", b);
        var birth = new Date(b + "T00:00:00");
        var now = new Date();
        var years = now.getFullYear() - birth.getFullYear();
        var m = now.getMonth() - birth.getMonth();
        if(m < 0 || (m === 0 && now.getDate() < birth.getDate())){ years--; }
        var totalDays = Math.floor((now - birth) / 86400000);
        var nextBD = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
        if(nextBD < now) nextBD.setFullYear(now.getFullYear()+1);
        var daysToBD = Math.floor((nextBD - now) / 86400000);
        var out = container.querySelector("#ag-out");
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">DU BIST</div>'
          + '<div style="font-size:36px;font-weight:900;color:#ff6b6b;margin-top:4px">'+years+' Jahre</div>'
          + '<div style="font-size:12px;color:var(--text-dim);margin-top:6px">'+totalDays.toLocaleString("de-DE")+' Tage alt</div>'
          + '<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,.2);border-radius:8px;font-size:11px;color:#4dd0e1;font-weight:800">🎉 Nächster Geburtstag in '+daysToBD+' Tagen</div>'
          + '</div>';
      });
    }

    function screenWeekday(){
      var today = new Date().toISOString().split("T")[0];
      var html = backBar() + '<div class="card"><h3>📆 Welcher Wochentag?</h3>'
        + '<div class="field"><label>Datum</label><input type="date" id="w-date" value="'+today+'"></div>'
        + '<button class="btn full" id="w-calc">= Zeigen</button>'
        + '<div id="w-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#w-calc").addEventListener("click", function(){
        var d = container.querySelector("#w-date").value;
        if(!d) return;
        var dt = new Date(d + "T12:00:00");
        var days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
        var out = container.querySelector("#w-out");
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(102,204,102,.1);border:1px solid rgba(102,204,102,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">WOCHENTAG</div>'
          + '<div style="font-size:28px;font-weight:900;color:#66cc66;margin-top:6px">'+days[dt.getDay()]+'</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">'+dt.toLocaleDateString("de-DE",{day:"numeric",month:"long",year:"numeric"})+'</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">Kalenderwoche '+getKW(dt)+'</div>'
          + '</div>';
      });
    }

    function getKW(d){
      var date = new Date(d.getTime());
      date.setHours(0,0,0,0);
      date.setDate(date.getDate() + 3 - ((date.getDay()+6)%7));
      var week1 = new Date(date.getFullYear(),0,4);
      return 1 + Math.round(((date - week1)/86400000 - 3 + ((week1.getDay()+6)%7))/7);
    }

    build();
  }

  HalDoApp("datum-rechner", { name: "Datum", icon: "📅", render: render, category: "werkzeuge" });
  console.log("🦚 datum-rechner.js v1.0 geladen");
})();
