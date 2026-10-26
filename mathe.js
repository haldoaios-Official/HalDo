/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MATHE (v1.0)
   Gleichungen lösen · Linear · Quadratisch · System · Prozent
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var view = store.get("view", "menu");

    function build(){
      if(view === "menu") screenMenu();
      else if(view === "linear") screenLinear();
      else if(view === "quad") screenQuad();
      else if(view === "system") screenSystem();
      else if(view === "prozent") screenProzent();
    }

    function screenMenu(){
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(77,208,225,.1));border:1px solid rgba(180,120,255,.3)">'
        + '<div style="font-size:44px">🔢</div>'
        + '<div style="font-size:18px;font-weight:900;color:#b478ff;margin-top:6px">Mathe-Solver</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Gleichungen lösen · Prozent rechnen</div>'
        + '</div>';

      var tools = [
        { id:"linear", icon:"📏", name:"Lineare Gleichung", desc:"ax + b = 0", color:"#4dd0e1" },
        { id:"quad",   icon:"📐", name:"Quadratisch",       desc:"ax² + bx + c = 0", color:"#ffd54f" },
        { id:"system", icon:"🔀", name:"2x2 System",        desc:"Zwei Gleichungen", color:"#66cc66" },
        { id:"prozent",icon:"%",  name:"Prozent",            desc:"Prozent · Rabatt · Änderung", color:"#ff6b6b" }
      ];
      html += '<div class="card"><h3>Was willst du lösen?</h3>';
      tools.forEach(function(t){
        html += '<button data-tool="'+t.id+'" style="width:100%;padding:14px;background:rgba(0,0,0,.2);border:1px solid '+t.color+'44;border-left:3px solid '+t.color+';border-radius:10px;margin-bottom:6px;color:inherit;font-family:inherit;text-align:left;cursor:pointer">'
          + '<div style="display:flex;align-items:center;gap:10px">'
          + '<div style="font-size:24px">'+t.icon+'</div>'
          + '<div><div style="font-size:13px;font-weight:900;color:'+t.color+'">'+t.name+'</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute)">'+t.desc+'</div></div>'
          + '</div>'
          + '</button>';
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

    function screenLinear(){
      var html = backBar() + '<div class="card"><h3>📏 ax + b = 0</h3>'
        + '<div class="field"><label>a</label><input id="lin-a" type="number" inputmode="decimal" placeholder="z.B. 2" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>b</label><input id="lin-b" type="number" inputmode="decimal" placeholder="z.B. 6" style="font-size:18px;text-align:center"></div>'
        + '<button class="btn full" id="lin-calc">= Lösen</button>'
        + '<div id="lin-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#lin-calc").addEventListener("click", function(){
        var a = parseFloat(container.querySelector("#lin-a").value);
        var b = parseFloat(container.querySelector("#lin-b").value);
        var out = container.querySelector("#lin-out");
        if(isNaN(a) || isNaN(b)){ out.innerHTML = '<div style="color:#ff8080;text-align:center;padding:10px">Bitte a und b eingeben</div>'; return; }
        if(a === 0){
          out.innerHTML = b === 0 ? '<div style="color:#ffd54f;text-align:center;padding:14px;font-size:13px">Unendlich viele Lösungen</div>' : '<div style="color:#ff8080;text-align:center;padding:14px;font-size:13px">Keine Lösung</div>';
          return;
        }
        var x = -b/a;
        var xRound = parseFloat(x.toPrecision(10));
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">LÖSUNG</div>'
          + '<div style="font-size:28px;font-weight:900;color:#4dd0e1;margin-top:4px">x = '+xRound+'</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:4px">Rechenweg: x = -('+b+') / ('+a+')</div>'
          + '</div>';
      });
    }

    function screenQuad(){
      var html = backBar() + '<div class="card"><h3>📐 ax² + bx + c = 0</h3>'
        + '<div class="field"><label>a</label><input id="q-a" type="number" inputmode="decimal" placeholder="z.B. 1" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>b</label><input id="q-b" type="number" inputmode="decimal" placeholder="z.B. -5" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>c</label><input id="q-c" type="number" inputmode="decimal" placeholder="z.B. 6" style="font-size:18px;text-align:center"></div>'
        + '<button class="btn full" id="q-calc">= Lösen</button>'
        + '<div id="q-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#q-calc").addEventListener("click", function(){
        var a = parseFloat(container.querySelector("#q-a").value);
        var b = parseFloat(container.querySelector("#q-b").value);
        var c = parseFloat(container.querySelector("#q-c").value);
        var out = container.querySelector("#q-out");
        if(isNaN(a) || isNaN(b) || isNaN(c)){ out.innerHTML = '<div style="color:#ff8080;text-align:center;padding:10px">Bitte a, b und c eingeben</div>'; return; }
        if(a === 0){
          out.innerHTML = '<div style="color:#ffd54f;text-align:center;padding:10px">a darf nicht 0 sein. (Lineare Gleichung!)</div>';
          return;
        }
        var disc = b*b - 4*a*c;
        var d = parseFloat(disc.toPrecision(10));
        var res = '';
        if(disc < 0){
          res = '<div style="padding:16px;background:rgba(255,128,128,.1);border:1px solid rgba(255,128,128,.3);border-radius:12px;text-align:center"><div style="font-size:11px;color:var(--text-mute);font-weight:800">DISKRIMINANTE D = '+d+' < 0</div><div style="font-size:13px;color:#ff8080;margin-top:6px;font-weight:900">Keine reelle Lösung</div><div style="font-size:10px;color:var(--text-mute);margin-top:4px">(Komplexe Lösungen existieren)</div></div>';
        } else if(d === 0){
          var x = -b/(2*a);
          res = '<div style="padding:16px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);border-radius:12px;text-align:center"><div style="font-size:11px;color:var(--text-mute);font-weight:800">D = 0 (eine doppelte Lösung)</div><div style="font-size:24px;font-weight:900;color:#4ade80;margin-top:6px">x = '+parseFloat(x.toPrecision(10))+'</div></div>';
        } else {
          var x1 = (-b + Math.sqrt(disc))/(2*a);
          var x2 = (-b - Math.sqrt(disc))/(2*a);
          res = '<div style="padding:16px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);border-radius:12px;text-align:center"><div style="font-size:11px;color:var(--text-mute);font-weight:800">D = '+d+' > 0 (zwei Lösungen)</div><div style="font-size:22px;font-weight:900;color:#4ade80;margin-top:6px">x₁ = '+parseFloat(x1.toPrecision(10))+'</div><div style="font-size:22px;font-weight:900;color:#4ade80;margin-top:2px">x₂ = '+parseFloat(x2.toPrecision(10))+'</div></div>';
        }
        out.innerHTML = res;
      });
    }

    function screenSystem(){
      var html = backBar() + '<div class="card"><h3>🔀 2x2 Gleichungssystem</h3>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:10px;line-height:1.5">a₁x + b₁y = c₁<br>a₂x + b₂y = c₂</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">a₁</label><input id="s-a1" type="number" placeholder="1" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;text-align:center"></div>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">b₁</label><input id="s-b1" type="number" placeholder="1" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;text-align:center"></div>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">c₁</label><input id="s-c1" type="number" placeholder="5" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;text-align:center"></div>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">a₂</label><input id="s-a2" type="number" placeholder="1" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;text-align:center"></div>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">b₂</label><input id="s-b2" type="number" placeholder="-1" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;text-align:center"></div>'
        + '<div><label style="font-size:10px;color:var(--text-mute);font-weight:800">c₂</label><input id="s-c2" type="number" placeholder="1" style="width:100%;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;text-align:center"></div>'
        + '</div>'
        + '<button class="btn full" id="s-calc" style="margin-top:10px">= Lösen</button>'
        + '<div id="s-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#s-calc").addEventListener("click", function(){
        var a1 = parseFloat(container.querySelector("#s-a1").value);
        var b1 = parseFloat(container.querySelector("#s-b1").value);
        var c1 = parseFloat(container.querySelector("#s-c1").value);
        var a2 = parseFloat(container.querySelector("#s-a2").value);
        var b2 = parseFloat(container.querySelector("#s-b2").value);
        var c2 = parseFloat(container.querySelector("#s-c2").value);
        var out = container.querySelector("#s-out");
        if([a1,b1,c1,a2,b2,c2].some(isNaN)){ out.innerHTML = '<div style="color:#ff8080;text-align:center;padding:10px">Bitte alle Felder ausfüllen</div>'; return; }
        var det = a1*b2 - a2*b1;
        if(Math.abs(det) < 1e-12){
          out.innerHTML = '<div style="color:#ffd54f;text-align:center;padding:14px;font-size:13px">Keine eindeutige Lösung (determinante = 0)</div>';
          return;
        }
        var x = (c1*b2 - c2*b1) / det;
        var y = (a1*c2 - a2*c1) / det;
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(102,204,102,.1);border:1px solid rgba(102,204,102,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">LÖSUNG</div>'
          + '<div style="font-size:22px;font-weight:900;color:#66cc66;margin-top:6px">x = '+parseFloat(x.toPrecision(10))+'</div>'
          + '<div style="font-size:22px;font-weight:900;color:#66cc66;margin-top:2px">y = '+parseFloat(y.toPrecision(10))+'</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:6px">Cramersche Regel · Determinante = '+parseFloat(det.toPrecision(8))+'</div>'
          + '</div>';
      });
    }

    function screenProzent(){
      var html = backBar() + '<div class="card"><h3>% Prozentrechner</h3>'
        + '<div class="field"><label>Was berechnen?</label><select id="p-mode">'
        + '<option value="p1">Wie viel sind X% von Y?</option>'
        + '<option value="p2">X ist wie viel % von Y?</option>'
        + '<option value="p3">Von X auf Y = ?% Änderung</option>'
        + '<option value="p4">X ist um P% gewachsen → Wert?</option>'
        + '<option value="p5">X ist um P% gesunken → Wert?</option>'
        + '</select></div>'
        + '<div class="field"><label>X</label><input id="p-x" type="number" inputmode="decimal" placeholder="X" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Y</label><input id="p-y" type="number" inputmode="decimal" placeholder="Y" style="font-size:18px;text-align:center"></div>'
        + '<button class="btn full" id="p-calc">= Berechnen</button>'
        + '<div id="p-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#p-calc").addEventListener("click", function(){
        var mode = container.querySelector("#p-mode").value;
        var x = parseFloat(container.querySelector("#p-x").value);
        var y = parseFloat(container.querySelector("#p-y").value);
        var out = container.querySelector("#p-out");
        if(isNaN(x) || isNaN(y)){ out.innerHTML = '<div style="color:#ff8080;text-align:center;padding:10px">Bitte X und Y eingeben</div>'; return; }
        var result = "";
        if(mode === "p1"){
          result = "Ergebnis: <b style='color:#ff6b6b'>"+parseFloat((x*y/100).toPrecision(10))+"</b>";
        } else if(mode === "p2"){
          if(y === 0) result = "Division durch 0";
          else result = "<b style='color:#ff6b6b'>"+parseFloat((x/y*100).toPrecision(6))+"%</b>";
        } else if(mode === "p3"){
          if(x === 0) result = "Division durch 0";
          else {
            var change = (y-x)/x*100;
            var sym = change >= 0 ? "+" : "";
            var col = change >= 0 ? "#4ade80" : "#ff8080";
            result = "<b style='color:"+col+"'>"+sym+parseFloat(change.toPrecision(6))+"%</b> "+(change >= 0 ? "Zunahme" : "Abnahme");
          }
        } else if(mode === "p4"){
          result = "Neuer Wert: <b style='color:#4ade80'>"+parseFloat((x*(1+y/100)).toPrecision(10))+"</b>";
        } else if(mode === "p5"){
          result = "Neuer Wert: <b style='color:#ff8080'>"+parseFloat((x*(1-y/100)).toPrecision(10))+"</b>";
        }
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);border-radius:12px;text-align:center;font-size:16px">'+result+'</div>';
      });
    }

    build();
  }

  HalDoApp("mathe", { name: "Mathe", icon: "🔢", render: render, category: "bildung" });
  console.log("🦚 mathe.js v1.0 geladen");
})();
