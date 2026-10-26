/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — RANDOM (v1.0)
   Zahlen · Würfel · Münze · Lotto · Picker · Passwort
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;
    var view = store.get("view", "menu");

    function build(){
      if(view === "menu") screenMenu();
      else if(view === "zahl") screenZahl();
      else if(view === "wuerfel") screenWuerfel();
      else if(view === "muenze") screenMuenze();
      else if(view === "lotto") screenLotto();
      else if(view === "picker") screenPicker();
    }

    function screenMenu(){
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(255,213,79,.15),rgba(180,120,255,.1));border:1px solid rgba(255,213,79,.3)">'
        + '<div style="font-size:44px">🎲</div>'
        + '<div style="font-size:18px;font-weight:900;color:#ffd54f;margin-top:6px">Random</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Zufall · Würfel · Münze · Lotto · Picker</div>'
        + '</div>';
      var tools = [
        { id:"zahl",    icon:"🔢", name:"Zufallszahl",   desc:"Zahl zwischen X und Y", color:"#4dd0e1" },
        { id:"wuerfel", icon:"🎲", name:"Würfel",        desc:"W6 · W20 · mehrere",    color:"#ffd54f" },
        { id:"muenze",  icon:"🪙", name:"Münzwurf",      desc:"Kopf oder Zahl",         color:"#ffaa33" },
        { id:"lotto",   icon:"🎰", name:"Lotto",         desc:"6 aus 49",               color:"#ff6b6b" },
        { id:"picker",  icon:"📋", name:"Picker",        desc:"Aus eigener Liste",      color:"#b478ff" }
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

    function screenZahl(){
      var html = backBar() + '<div class="card"><h3>🔢 Zufallszahl</h3>'
        + '<div class="field"><label>Minimum</label><input id="r-min" type="number" value="1" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label>Maximum</label><input id="r-max" type="number" value="100" style="font-size:18px;text-align:center"></div>'
        + '<div class="field"><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="r-int" checked style="width:auto"> Nur ganze Zahlen</label></div>'
        + '<button class="btn full" id="r-roll">🎲 Zufallszahl</button>'
        + '<div id="r-out"></div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#r-roll").addEventListener("click", function(){
        var min = parseFloat(container.querySelector("#r-min").value);
        var max = parseFloat(container.querySelector("#r-max").value);
        var intOnly = container.querySelector("#r-int").checked;
        if(isNaN(min) || isNaN(max) || min > max) return;
        var r = Math.random() * (max - min) + min;
        if(intOnly) r = Math.floor(r + 1);
        container.querySelector("#r-out").innerHTML = '<div style="margin-top:14px;padding:24px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">ERGEBNIS</div>'
          + '<div style="font-size:56px;font-weight:900;color:#4dd0e1;line-height:1;margin-top:4px">'+r+'</div>'
          + '</div>';
      });
    }

    function screenWuerfel(){
      var html = backBar() + '<div class="card"><h3>🎲 Würfel</h3>'
        + '<div class="field"><label>Anzahl Seiten</label>'
        + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">'
        + [4,6,8,10,12,20,100].map(function(n){
            return '<button data-sides="'+n+'" style="padding:12px;background:rgba(0,0,0,.2);border:1.5px solid var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;cursor:pointer;font-weight:800;font-size:14px">W'+n+'</button>';
          }).join('')
        + '</div></div>'
        + '<div class="field"><label>Anzahl Würfel</label><input id="d-count" type="number" value="1" min="1" max="10" style="font-size:16px;text-align:center"></div>'
        + '<button class="btn full" id="d-roll">🎲 Würfeln</button>'
        + '<div id="d-out"></div></div>';
      container.innerHTML = html;
      var sides = 6;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelectorAll("[data-sides]").forEach(function(el){
        el.addEventListener("click", function(){
          sides = parseInt(el.dataset.sides);
          container.querySelectorAll("[data-sides]").forEach(function(x){
            var active = parseInt(x.dataset.sides) === sides;
            x.style.borderColor = active ? "#ffd54f" : "var(--border-soft)";
            x.style.background = active ? "rgba(255,213,79,.2)" : "rgba(0,0,0,.2)";
            x.style.color = active ? "#ffd54f" : "inherit";
          });
        });
      });
      container.querySelector("#d-roll").addEventListener("click", function(){
        var n = parseInt(container.querySelector("#d-count").value) || 1;
        var results = [];
        for(var i=0;i<n;i++) results.push(Math.floor(Math.random()*sides)+1);
        var total = results.reduce(function(a,b){return a+b;},0);
        var out = container.querySelector("#d-out");
        var diceHtml = results.map(function(r){
          return '<div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#ffd54f,#ff9800);color:#000;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;margin:4px;box-shadow:0 4px 12px rgba(255,152,0,.4)">'+r+'</div>';
        }).join('');
        out.innerHTML = '<div style="margin-top:14px;padding:16px;background:rgba(255,213,79,.1);border:1px solid rgba(255,213,79,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800;margin-bottom:10px">ERGEBNIS'+(n>1?' · Summe: '+total:'')+'</div>'
          + '<div>'+diceHtml+'</div>'
          + '</div>';
      });
    }

    function screenMuenze(){
      var html = backBar() + '<div class="card" style="text-align:center"><h3>🪙 Münzwurf</h3>'
        + '<div style="font-size:80px;margin:30px 0" id="c-result">🪙</div>'
        + '<button class="btn full" id="c-flip">🪙 Werfen</button>'
        + '</div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#c-flip").addEventListener("click", function(){
        var res = container.querySelector("#c-result");
        var flips = 0;
        res.textContent = "🪙";
        var iv = setInterval(function(){
          flips++;
          res.textContent = flips % 2 ? "🌕" : "🌑";
          if(flips > 10){
            clearInterval(iv);
            var r = Math.random() < 0.5;
            res.textContent = r ? "👑" : "🪙";
            res.style.animation = "none";
            if(navigator.vibrate) navigator.vibrate(50);
          }
        }, 80);
      });
    }

    function screenLotto(){
      var html = backBar() + '<div class="card"><h3>🎰 Lotto 6 aus 49</h3>'
        + '<button class="btn full" id="l-draw" style="font-size:16px;padding:16px">🎰 Ziehen</button>'
        + '<div id="l-out" style="margin-top:16px"></div>'
        + '</div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      container.querySelector("#l-draw").addEventListener("click", function(){
        var picks = new Set();
        while(picks.size < 6){
          picks.add(Math.floor(Math.random()*49)+1);
        }
        var arr = Array.from(picks).sort(function(a,b){return a-b;});
        var superzahl = Math.floor(Math.random()*10);
        var out = container.querySelector("#l-out");
        out.innerHTML = '<div style="padding:16px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);border-radius:12px;text-align:center">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:800;margin-bottom:10px">DEINE ZAHLEN</div>'
          + '<div>'+arr.map(function(n){
              return '<div style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#ff5555,#ff8844);color:#fff;font-weight:900;font-size:16px;margin:3px;box-shadow:0 4px 12px rgba(255,85,85,.4)">'+n+'</div>';
            }).join('')+'</div>'
          + '<div style="margin-top:14px;font-size:11px;color:var(--text-mute);font-weight:800">SUPERZAHL</div>'
          + '<div style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#4dd0e1,#4da8ff);color:#fff;font-weight:900;font-size:16px;margin-top:4px;box-shadow:0 4px 12px rgba(77,208,225,.4)">'+superzahl+'</div>'
          + '</div>';
      });
    }

    function screenPicker(){
      var items = store.get("pickerItems", ["Pizza", "Pasta", "Salat", "Sushi"]);
      function renderPicker(result){
        var html = backBar() + '<div class="card"><h3>📋 Picker</h3>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Gib Optionen ein. Eine wird zufällig gewählt.</div>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input id="pk-inp" placeholder="Option hinzufügen" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit">'
          + '<button id="pk-add" style="padding:10px 14px;background:rgba(180,120,255,.2);border:1px solid rgba(180,120,255,.4);color:#b478ff;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit">+</button>'
          + '</div>'
          + (items.length ? items.map(function(it, i){
              return '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px">'+_esc(it)+'</span><button data-delpick="'+i+'" style="background:transparent;border:none;color:#ff8080;font-size:12px;cursor:pointer">✕</button></div>';
            }).join('') : '<div style="text-align:center;color:var(--text-mute);padding:14px;font-size:12px">Keine Optionen</div>')
          + '<button class="btn full" id="pk-pick" style="margin-top:10px;'+(items.length<2?'opacity:.5;pointer-events:none;':'')+'">🎯 Zufällig wählen</button>'
          + (result ? '<div style="margin-top:14px;padding:24px;background:rgba(180,120,255,.1);border:1px solid rgba(180,120,255,.3);border-radius:12px;text-align:center">'
              + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">GEWÄHLT</div>'
              + '<div style="font-size:24px;font-weight:900;color:#b478ff;margin-top:4px">'+_esc(result)+'</div>'
              + '</div>' : '')
          + '</div>';
        container.innerHTML = html;
        container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
        container.querySelector("#pk-add").addEventListener("click", function(){
          var v = container.querySelector("#pk-inp").value.trim();
          if(!v) return;
          items.push(v); store.set("pickerItems", items); renderPicker();
        });
        container.querySelector("#pk-inp").addEventListener("keydown", function(e){
          if(e.key === "Enter"){ container.querySelector("#pk-add").click(); }
        });
        container.querySelectorAll("[data-delpick]").forEach(function(el){
          el.addEventListener("click", function(){ items.splice(parseInt(el.dataset.delpick),1); store.set("pickerItems", items); renderPicker(); });
        });
        var pk = container.querySelector("#pk-pick");
        if(pk) pk.addEventListener("click", function(){
          var r = items[Math.floor(Math.random()*items.length)];
          renderPicker(r);
        });
      }
      renderPicker();
    }

    function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

    build();
  }

  HalDoApp("random", { name: "Zufall", icon: "🎲", render: render, category: "werkzeuge" });
  console.log("🦚 random.js v1.0 geladen");
})();
