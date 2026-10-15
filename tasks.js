/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — TASKS (v151) · Aufgaben
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;

    function build(){
      var tasks = HalDo.Store.get("tasks", []);
      var done = tasks.filter(function(t){ return t.done; }).length;

      var body = '<div class="card"><h3>✅ Aufgaben (' + done + '/' + tasks.length + ')</h3>'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<input type="text" id="taskInp" placeholder="Neue Aufgabe..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<button class="btn" id="taskAdd">+</button>'
        + '</div>';

      if(!tasks.length){
        body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Aufgaben</div>';
      } else {
        /* Priorität: offen zuerst */
        var sorted = tasks.map(function(t, i){ return { t: t, i: i }; }).sort(function(a, b){
          if(a.t.done === b.t.done) return 0;
          return a.t.done ? 1 : -1;
        });
        sorted.forEach(function(item){
          var t = item.t, i = item.i;
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:center;border-left:3px solid ' + (t.done ? "#4ade80" : "var(--p1)") + '">'
            + '<input type="checkbox" data-tcheck="' + i + '" ' + (t.done ? "checked" : "") + ' style="width:20px;height:20px;accent-color:var(--p1);cursor:pointer;flex-shrink:0">'
            + '<div style="flex:1;font-size:13px;font-weight:700;' + (t.done ? "text-decoration:line-through;color:var(--text-mute)" : "") + ';word-break:break-word">' + _esc(t.text) + '</div>'
            + '<button data-tdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:14px">✕</button>'
            + '</div>';
        });
        if(done > 0){
          body += '<button class="btn danger full" id="taskClear" style="margin-top:10px">🗑️ Erledigte löschen (' + done + ')</button>';
        }
      }
      body += '</div>';

      container.innerHTML = body;

      container.querySelector("#taskAdd").addEventListener("click", addTask);
      container.querySelector("#taskInp").addEventListener("keydown", function(e){
        if(e.key === "Enter") addTask();
      });

      function addTask(){
        var inp = container.querySelector("#taskInp");
        var txt = inp.value.trim();
        if(!txt) return;
        tasks.push({ text: txt, done: false, date: new Date().toLocaleString("de-DE") });
        HalDo.Store.set("tasks", tasks);
        inp.value = "";
        build();
      }

      container.querySelectorAll("[data-tcheck]").forEach(function(el){
        el.addEventListener("change", function(){
          tasks[parseInt(el.dataset.tcheck)].done = !tasks[parseInt(el.dataset.tcheck)].done;
          HalDo.Store.set("tasks", tasks);
          build();
        });
      });
      container.querySelectorAll("[data-tdel]").forEach(function(el){
        el.addEventListener("click", function(){
          tasks.splice(parseInt(el.dataset.tdel), 1);
          HalDo.Store.set("tasks", tasks);
          build();
        });
      });
      var clr = container.querySelector("#taskClear");
      if(clr) clr.addEventListener("click", function(){
        if(!confirm("Alle erledigten löschen?")) return;
        HalDo.Store.set("tasks", tasks.filter(function(t){ return !t.done; }));
        build();
      });
    }

    function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

    build();
  }

  HalDoApp("tasks", { name: "Aufgaben", icon: "✅", render: render, category: "app" });
  console.log("🦚 tasks.js geladen");
})();
