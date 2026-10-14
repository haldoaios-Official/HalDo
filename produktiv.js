/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PRODUKTIVITÄT APP (v150)
   Notizen · Todo · Projekte · Pomodoro
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "notizen");

    function build(){
      var body = "";

      /* ═══ NOTIZEN ═══ */
      if(tab === "notizen"){
        var notes = store.get("notes", []);
        body = '<div class="card"><h3>📝 Neue Notiz</h3>'
          + '<div class="field"><label>Titel</label><input type="text" id="pnT" placeholder="Titel"></div>'
          + '<div class="field"><label>Inhalt</label><textarea id="pnB" placeholder="Inhalt..." style="min-height:100px"></textarea></div>'
          + '<button class="btn full" id="pnAdd">💾 Speichern</button>'
          + '</div>';
        if(notes.length){
          body += '<div class="card"><h3>📋 Alle Notizen (' + notes.length + ')</h3>';
          notes.slice().reverse().forEach(function(n, idx){
            var ri = notes.length - 1 - idx;
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px">'
              + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
              + '<div style="font-size:13px;font-weight:800;color:var(--p1)">' + _esc(n.title) + '</div>'
              + '<button data-pndel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:14px">✕</button>'
              + '</div>'
              + '<div style="font-size:12px;color:var(--text-dim);line-height:1.5;white-space:pre-wrap">' + _esc(n.body).substring(0, 300) + '</div>'
              + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:6px">' + _esc(n.date) + '</div>'
              + '</div>';
          });
          body += '</div>';
        }

      /* ═══ TODO ═══ */
      } else if(tab === "todo"){
        var todos = store.get("todos", []);
        var done = todos.filter(function(t){ return t.done; }).length;
        body = '<div class="card"><h3>✅ Todo (' + done + '/' + todos.length + ')</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="tdN" placeholder="Neue Aufgabe..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="tdAdd" style="padding:10px 18px">+</button>'
          + '</div>';
        if(todos.length){
          todos.forEach(function(t, idx){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:5px;display:flex;gap:10px;align-items:center">'
              + '<input type="checkbox" data-tdt="' + idx + '" ' + (t.done ? "checked" : "") + ' style="width:20px;height:20px;accent-color:var(--p1);cursor:pointer">'
              + '<div style="flex:1;font-size:13px;font-weight:700;' + (t.done ? "text-decoration:line-through;color:var(--text-mute)" : "") + '">' + _esc(t.text) + '</div>'
              + '<button data-tdd="' + idx + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:14px">✕</button>'
              + '</div>';
          });
        } else {
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Aufgaben</div>';
        }
        if(done > 0){
          body += '<button class="btn danger full" id="tdClearDone" style="margin-top:10px">🗑️ Erledigte löschen</button>';
        }
        body += '</div>';

      /* ═══ PROJEKTE ═══ */
      } else if(tab === "projekte"){
        var projects = store.get("projects", []);
        body = '<div class="card"><h3>📊 Neues Projekt</h3>'
          + '<div class="field"><label>Name</label><input type="text" id="prName"></div>'
          + '<div class="field"><label>Beschreibung</label><textarea id="prDesc"></textarea></div>'
          + '<div class="field"><label>Fortschritt (%)</label><input type="number" id="prProg" min="0" max="100" value="0"></div>'
          + '<button class="btn full" id="prAdd">💾 Speichern</button>'
          + '</div>';
        if(projects.length){
          body += '<div class="card"><h3>📋 Alle Projekte (' + projects.length + ')</h3>';
          projects.forEach(function(p, idx){
            var col = p.prog >= 100 ? "#4ade80" : p.prog >= 50 ? "#fbbf24" : "#ff8080";
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px">'
              + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
              + '<div style="font-size:13px;font-weight:800;color:var(--p1)">' + _esc(p.name) + '</div>'
              + '<button data-prdel="' + idx + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>'
              + '<div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">' + _esc(p.desc || "") + '</div>'
              + '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden"><div style="background:' + col + ';height:100%;width:' + p.prog + '%;transition:.3s"></div></div>'
              + '<div style="display:flex;justify-content:space-between;margin-top:6px">'
              + '<input type="range" data-prprog="' + idx + '" min="0" max="100" value="' + p.prog + '" style="flex:1;accent-color:var(--p1)">'
              + '<div style="font-size:10px;color:var(--text-mute);margin-left:8px;min-width:35px;text-align:right">' + p.prog + '%</div>'
              + '</div></div>';
          });
          body += '</div>';
        }

      /* ═══ POMODORO ═══ */
      } else if(tab === "pomodoro"){
        var today = new Date().toISOString().split("T")[0];
        var pom = store.get("pomodoro", {date: today, count: 0});
        if(pom.date !== today){ pom = {date: today, count: 0}; store.set("pomodoro", pom); }
        body = '<div class="card"><h3>🍅 Pomodoro-Timer</h3>'
          + '<div id="pmD" style="font-size:72px;font-weight:900;color:var(--p1);text-align:center;font-family:ui-monospace;padding:20px 0;text-shadow:0 0 30px var(--p1)">25:00</div>'
          + '<div style="display:flex;gap:8px;margin-bottom:10px">'
          + '<button class="btn sec" id="pmWork" style="flex:1">💼 25 min Arbeit</button>'
          + '<button class="btn sec" id="pmBreak" style="flex:1">☕ 5 min Pause</button>'
          + '<button class="btn sec" id="pmLong" style="flex:1">🌴 15 min</button>'
          + '</div>'
          + '<div style="display:flex;gap:8px">'
          + '<button class="btn" id="pmStart" style="flex:1;padding:14px;font-size:14px">▶ Start</button>'
          + '<button class="btn sec" id="pmReset" style="flex:1;padding:14px;font-size:14px">🔄 Reset</button>'
          + '</div>'
          + '<div style="margin-top:16px;padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;font-weight:800">Heute geschafft</div>'
          + '<div style="font-size:36px;font-weight:900;color:var(--p3);margin-top:6px">' + pom.count + ' 🍅</div>'
          + '</div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="notizen"?" active":"") + '" data-prt="notizen">📝 Notizen</button>'
        + '<button class="tab' + (tab==="todo"?" active":"") + '" data-prt="todo">✅ Todo</button>'
        + '<button class="tab' + (tab==="projekte"?" active":"") + '" data-prt="projekte">📊 Projekte</button>'
        + '<button class="tab' + (tab==="pomodoro"?" active":"") + '" data-prt="pomodoro">🍅 Pomodoro</button>'
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-prt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.prt;
          store.set("tab", tab);
          build();
        });
      });

      /* Notizen */
      if(tab === "notizen"){
        var notes = store.get("notes", []);
        container.querySelector("#pnAdd").addEventListener("click", function(){
          var t = container.querySelector("#pnT").value.trim();
          if(!t){ alert("Titel eingeben"); return; }
          notes.push({ title: t, body: container.querySelector("#pnB").value, date: new Date().toLocaleString("de-DE") });
          store.set("notes", notes);
          build();
        });
        container.querySelectorAll("[data-pndel]").forEach(function(el){
          el.addEventListener("click", function(){
            notes.splice(parseInt(el.dataset.pndel), 1);
            store.set("notes", notes);
            build();
          });
        });
      }

      /* Todo */
      if(tab === "todo"){
        var todos = store.get("todos", []);
        container.querySelector("#tdAdd").addEventListener("click", function(){
          var t = container.querySelector("#tdN").value.trim();
          if(!t) return;
          todos.push({ text: t, done: false });
          store.set("todos", todos);
          build();
        });
        container.querySelector("#tdN").addEventListener("keydown", function(e){
          if(e.key === "Enter") container.querySelector("#tdAdd").click();
        });
        container.querySelectorAll("[data-tdt]").forEach(function(el){
          el.addEventListener("change", function(){
            var i = parseInt(el.dataset.tdt);
            todos[i].done = !todos[i].done;
            store.set("todos", todos);
            build();
          });
        });
        container.querySelectorAll("[data-tdd]").forEach(function(el){
          el.addEventListener("click", function(){
            todos.splice(parseInt(el.dataset.tdd), 1);
            store.set("todos", todos);
            build();
          });
        });
        var cd = container.querySelector("#tdClearDone");
        if(cd) cd.addEventListener("click", function(){
          store.set("todos", todos.filter(function(t){ return !t.done; }));
          build();
        });
      }

      /* Projekte */
      if(tab === "projekte"){
        var projects = store.get("projects", []);
        container.querySelector("#prAdd").addEventListener("click", function(){
          var n = container.querySelector("#prName").value.trim();
          if(!n) return;
          projects.push({
            name: n,
            desc: container.querySelector("#prDesc").value,
            prog: parseInt(container.querySelector("#prProg").value) || 0
          });
          store.set("projects", projects);
          build();
        });
        container.querySelectorAll("[data-prdel]").forEach(function(el){
          el.addEventListener("click", function(){
            projects.splice(parseInt(el.dataset.prdel), 1);
            store.set("projects", projects);
            build();
          });
        });
        container.querySelectorAll("[data-prprog]").forEach(function(el){
          el.addEventListener("input", function(){
            var i = parseInt(el.dataset.prprog);
            projects[i].prog = parseInt(this.value);
            store.set("projects", projects);
            /* Nur Progress-Balken aktualisieren ohne Rebuild */
            var parent = el.closest("div").parentNode;
            var bar = parent.querySelector("div[style*='background:'] > div");
            if(bar){
              bar.style.width = this.value + "%";
              bar.style.background = this.value >= 100 ? "#4ade80" : this.value >= 50 ? "#fbbf24" : "#ff8080";
            }
            var lbl = parent.querySelector("div[style*='text-align:right']");
            if(lbl) lbl.textContent = this.value + "%";
          });
        });
      }

      /* Pomodoro */
      if(tab === "pomodoro"){
        var t0 = 25*60, rem = 25*60, iv = null, running = false;
        var disp = container.querySelector("#pmD");
        var startBtn = container.querySelector("#pmStart");

        function upd(){
          var m = Math.floor(rem / 60), s = rem % 60;
          if(disp) disp.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        }
        function stopIv(){ if(iv){ clearInterval(iv); iv = null; } running = false; if(startBtn) startBtn.textContent = "▶ Start"; }

        container.querySelector("#pmWork").addEventListener("click", function(){
          if(running) return;
          t0 = 25*60; rem = t0; upd();
        });
        container.querySelector("#pmBreak").addEventListener("click", function(){
          if(running) return;
          t0 = 5*60; rem = t0; upd();
        });
        container.querySelector("#pmLong").addEventListener("click", function(){
          if(running) return;
          t0 = 15*60; rem = t0; upd();
        });
        startBtn.addEventListener("click", function(){
          if(running){ stopIv(); return; }
          running = true;
          startBtn.textContent = "⏸ Stop";
          iv = setInterval(function(){
            rem--;
            if(rem <= 0){
              stopIv();
              rem = t0;
              upd();
              var today2 = new Date().toISOString().split("T")[0];
              var p2 = store.get("pomodoro", {date: today2, count: 0});
              if(p2.date !== today2) p2 = {date: today2, count: 0};
              p2.count++;
              store.set("pomodoro", p2);
              if(window.HalDo.Voice) HalDo.Voice.speak("Zeit ist um, Bruder!");
              if(typeof Beep !== "undefined") Beep.warnung();
              build();
              return;
            }
            upd();
          }, 1000);
        });
        container.querySelector("#pmReset").addEventListener("click", function(){
          stopIv();
          rem = t0;
          upd();
        });
        upd();
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("produktiv", { render: render });
  else console.warn("produktiv.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 produktiv.js geladen");
