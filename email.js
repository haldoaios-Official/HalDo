/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — E-MAIL (v300)
   Ordner · Anhänge · Compose · KI
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "inbox");
    var currentId = store.get("currentId", null);

    function build(){
      var body = '';
      var mails = store.get("mails", []);
      var draft = store.get("draft", { to: "", subject: "", body: "", attach: [] });
      var myEmail = store.get("myEmail", "Halil@haldo.ai");

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "inbox" ? " active" : "") + '" data-et="inbox">📬 Inbox</button>'
        + '<button class="tab' + (tab === "sent" ? " active" : "") + '" data-et="sent">📤 Gesendet</button>'
        + '<button class="tab' + (tab === "drafts" ? " active" : "") + '" data-et="drafts">📝 Entwürfe</button>'
        + '<button class="tab' + (tab === "compose" ? " active" : "") + '" data-et="compose">✏️ Neu</button>'
        + '</div>';

      if(tab === "inbox" || tab === "sent" || tab === "drafts"){
        var filtered = mails.filter(m => m.folder === tab);
        if(currentId !== null && filtered[currentId]){
          var m = filtered[currentId];
          body += '<div class="card" style="border-left:3px solid var(--p1)">'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
            + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + _esc(m.subject) + '</div>'
            + '<button class="btn sec" id="eClose">✕</button></div>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">'
            + (tab === "sent" ? "An: " : "Von: ") + _esc(tab === "sent" ? m.to : m.from) + ' · ' + _esc(m.date) + '</div>'
            + '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap">' + _esc(m.body) + '</div>'
            + (m.attach && m.attach.length ? '<div style="margin-top:10px;padding:10px;background:rgba(0,0,0,.2);border-radius:8px"><div style="font-size:11px;font-weight:800;color:var(--p3)">📎 Anhänge:</div>' + m.attach.map(a => '<div style="font-size:11px">' + _esc(a) + '</div>').join("") + '</div>' : '')
            + '</div>';
        } else {
          body += '<div class="card"><h3>' + (tab === "inbox" ? "📬 Inbox" : tab === "sent" ? "📤 Gesendet" : "📝 Entwürfe") + ' (' + filtered.length + ')</h3>';
          if(!filtered.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Mails</div>';
          else {
            filtered.slice().reverse().forEach(function(m2, idx){
              var ri = filtered.length - 1 - idx;
              body += '<div data-mopen="'+ri+'" style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;cursor:pointer;border-left:3px solid ' + (m2.read ? "var(--text-mute)" : "var(--p1)") + '">'
                + '<div style="font-size:12.5px;font-weight:800">' + _esc(m2.subject) + '</div>'
                + '<div style="font-size:10.5px;color:var(--text-mute)">' + (tab === "sent" ? "An: " : "Von: ") + _esc(tab === "sent" ? m2.to : m2.from) + '</div>'
                + '</div>';
            });
          }
          body += '</div>';
        }
      }

      if(tab === "compose"){
        body += '<div class="card"><h3>✏️ Neue E-Mail</h3>'
          + '<div class="field"><label>An</label><input type="email" id="eTo" value="' + _esc(draft.to) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Betreff</label><input type="text" id="eSubj" value="' + _esc(draft.subject) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Nachricht</label><textarea id="eBody" rows="5" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit">' + _esc(draft.body) + '</textarea></div>'
          + '<div class="field"><label>Anhänge (Dateinamen, Komma-getrennt)</label><input type="text" id="eAttach" value="' + _esc((draft.attach || []).join(", ")) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px"></div>'
          + '<button class="btn full" id="eSend" style="background:linear-gradient(135deg,#4ade80,#00e5ff);color:#000;margin-top:10px">📤 Senden</button>'
          + '<button class="btn sec full" id="eDraft" style="margin-top:6px">💾 Entwurf</button>'
          + '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-et]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.et; store.set("tab", tab); store.set("currentId", null); currentId = null; build(); });
      });

      if(tab === "inbox" || tab === "sent" || tab === "drafts"){
        var filtered2 = mails.filter(m => m.folder === tab);
        container.querySelectorAll("[data-mopen]").forEach(el => {
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.mopen);
            store.set("currentId", i); currentId = i;
            var m3 = filtered2[i]; if(m3) { m3.read = true; store.set("mails", mails); }
            build();
          });
        });
        var clr = container.querySelector("#eClose");
        if(clr) clr.addEventListener("click", function(){ store.set("currentId", null); currentId = null; build(); });
      }

      if(tab === "compose"){
        ["eTo","eSubj","eBody","eAttach"].forEach(id => {
          container.querySelector("#"+id).addEventListener("input", function(){
            var d = store.get("draft", {});
            d.to = container.querySelector("#eTo").value;
            d.subject = container.querySelector("#eSubj").value;
            d.body = container.querySelector("#eBody").value;
            d.attach = container.querySelector("#eAttach").value.split(",").map(s => s.trim()).filter(Boolean);
            store.set("draft", d);
          });
        });

        container.querySelector("#eSend").addEventListener("click", function(){
          var d = store.get("draft", {});
          if(!d.to) return alert("Empfänger fehlt");
          var m = store.get("mails", []);
          m.push({ to: d.to, from: myEmail, subject: d.subject || "(kein Betreff)", body: d.body, folder: "sent", read: true, attach: d.attach, date: new Date().toLocaleString("de-DE") });
          store.set("mails", m); store.set("draft", { to: "", subject: "", body: "", attach: [] });
          tab = "sent"; store.set("tab", tab); build();
          if(HalDo.Notify) HalDo.Notify.success("E-Mail gesendet (simuliert)");
        });

        container.querySelector("#eDraft").addEventListener("click", function(){
          var d = store.get("draft", {});
          var m = store.get("mails", []);
          m.push({ to: d.to, from: myEmail, subject: d.subject || "(kein Betreff)", body: d.body, folder: "drafts", read: false, attach: d.attach, date: new Date().toLocaleString("de-DE") });
          store.set("mails", m); store.set("draft", { to: "", subject: "", body: "", attach: [] });
          tab = "drafts"; store.set("tab", tab); build();
        });
      }
    }

    build();
  }

  HalDoApp("email", { name: "E-Mail", icon: "📧", render: render, category: "kommunikation" });
  console.log("🦚 email.js v300 geladen — ANHÄNGE & ORDNER");
})();
