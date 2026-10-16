/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — E-MAIL (v156)
   E-Mail-Client · Inbox · Senden · Ordner · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "inbox");

    function build(openIdx){
      var body = "";

      if(tab === "inbox" || tab === "sent" || tab === "drafts" || tab === "starred"){
        var mails = store.get("mails", []);
        var query = store.get("query", "");

        var filtered = mails.filter(function(m){
          if(tab === "inbox" && m.folder !== "inbox") return false;
          if(tab === "sent" && m.folder !== "sent") return false;
          if(tab === "drafts" && m.folder !== "drafts") return false;
          if(tab === "starred" && !m.starred) return false;
          if(!query) return true;
          var q = query.toLowerCase();
          return (m.subject || "").toLowerCase().indexOf(q) !== -1
            || (m.body || "").toLowerCase().indexOf(q) !== -1
            || (m.to || "").toLowerCase().indexOf(q) !== -1;
        });

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="eSearch" placeholder="🔍 Suchen..." value="' + _esc(query) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="eNew" style="padding:0 16px">✏️</button>'
          + '</div>';

        if(openIdx !== undefined && openIdx >= 0 && mails[openIdx]){
          var m = mails[openIdx];
          body += '<div style="padding:14px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-bottom:6px">' + _esc(m.subject || "(kein Betreff)") + '</div>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">'
            + (m.folder === "inbox" ? "Von: " + _esc(m.from) : "An: " + _esc(m.to)) + ' · ' + _esc(m.date)
            + '</div>'
            + '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word">' + _esc(m.body) + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:12px">'
            + '<button class="btn" id="eReply" style="flex:1;font-size:11px">↩ Antworten</button>'
            + '<button class="btn sec" id="eClose">✕</button>'
            + '</div></div>';
        }

        if(!filtered.length && openIdx === undefined){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine E-Mails</div>';
        } else {
          filtered.slice().reverse().forEach(function(m){
            var ri = mails.indexOf(m);
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:flex-start;border-left:3px solid ' + (m.read ? "var(--text-mute)" : "var(--p1)") + '">'
              + '<div style="font-size:18px;flex-shrink:0">' + (m.read ? "📧" : "📬") + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12.5px;font-weight:' + (m.read ? "700" : "900") + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(m.subject || "(kein Betreff)") + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + (m.folder === "inbox" ? _esc(m.from) : _esc(m.to)) + '</div>'
              + '<div style="font-size:11px;color:var(--text-dim);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc((m.body || "").substring(0, 60)) + '...</div>'
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-estar="' + ri + '" style="background:transparent;border:none;cursor:pointer;font-size:13px">' + (m.starred ? "⭐" : "☆") + '</button>'
              + '<button data-edel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "compose"){
        var draft = store.get("draft", { to: "", subject: "", body: "" });
        body = '<div class="card"><h3>✏️ Neue E-Mail</h3>'
          + '<div class="field"><label>An</label><input type="email" id="eTo" value="' + _esc(draft.to) + '" placeholder="empfaenger@example.com" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Betreff</label><input type="text" id="eSubject" value="' + _esc(draft.subject) + '" placeholder="Betreff" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Nachricht</label><textarea id="eBody" rows="8" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(draft.body) + '</textarea></div>'
          + '<div style="display:flex;gap:6px">'
          + '<button class="btn" id="eSend" style="flex:1">📤 Senden</button>'
          + '<button class="btn sec" id="eSaveDraft">💾 Entwurf</button>'
          + '<button class="btn sec" id="eDiscard">✕</button>'
          + '</div></div>';
      }

      else if(tab === "settings"){
        var mails2 = store.get("mails", []);
        var myEmail = store.get("myEmail", "Halil@haldo.ai");
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Meine E-Mail</label>'
          + '<input type="email" id="eMyEmail" value="' + _esc(myEmail) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-top:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📧 E-MAILS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + mails2.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px;margin-top:8px;border-left:3px solid #fbbf24">'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.5">'
          + '⚠️ <b>Hinweis:</b> E-Mails werden <b>lokal</b> gespeichert. Echtes Senden/Empfangen braucht einen SMTP/IMAP-Server.'
          + '</div></div>'
          + '<button class="btn danger full" id="eClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="inbox"?" active":"") + '" data-et="inbox">📬 Inbox</button>'
        + '<button class="tab' + (tab==="sent"?" active":"") + '" data-et="sent">📤 Gesendet</button>'
        + '<button class="tab' + (tab==="drafts"?" active":"") + '" data-et="drafts">📝 Entwürfe</button>'
        + '<button class="tab' + (tab==="starred"?" active":"") + '" data-et="starred">⭐</button>'
        + '<button class="tab' + (tab==="compose"?" active":"") + '" data-et="compose">✏️ Neu</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-et="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-et]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.et; store.set("tab", tab); build();
        });
      });

      if(tab === "inbox" || tab === "sent" || tab === "drafts" || tab === "starred"){
        var sInp = container.querySelector("#eSearch");
        if(sInp) sInp.addEventListener("input", function(){
          store.set("query", this.value);
          var t = tab; build(openIdx); tab = t;
        });
        var nb = container.querySelector("#eNew");
        if(nb) nb.addEventListener("click", function(){
          tab = "compose"; store.set("tab", tab); build();
        });
        container.querySelectorAll("[data-edel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("E-Mail löschen?")) return;
            var mails3 = store.get("mails", []);
            mails3.splice(parseInt(el.dataset.edel), 1);
            store.set("mails", mails3);
            build();
          });
        });
        container.querySelectorAll("[data-estar]").forEach(function(el){
          el.addEventListener("click", function(){
            var mails4 = store.get("mails", []);
            mails4[parseInt(el.dataset.estar)].starred = !mails4[parseInt(el.dataset.estar)].starred;
            store.set("mails", mails4);
            build();
          });
        });
      }

      if(tab === "compose"){
        var inputs = ["eTo", "eSubject", "eBody"];
        inputs.forEach(function(id){
          var el = container.querySelector("#" + id);
          if(el) el.addEventListener("input", function(){
            var d = store.get("draft", { to: "", subject: "", body: "" });
            if(id === "eTo") d.to = el.value;
            if(id === "eSubject") d.subject = el.value;
            if(id === "eBody") d.body = el.value;
            store.set("draft", d);
          });
        });
        var send = container.querySelector("#eSend");
        if(send) send.addEventListener("click", function(){
          var to = container.querySelector("#eTo").value.trim();
          var subject = container.querySelector("#eSubject").value.trim();
          var body2 = container.querySelector("#eBody").value.trim();
          if(!to){ alert("Empfänger fehlt"); return; }
          var mails5 = store.get("mails", []);
          mails5.push({
            to: to, from: store.get("myEmail", "Halil@haldo.ai"),
            subject: subject || "(kein Betreff)", body: body2,
            folder: "sent", read: true,
            date: new Date().toLocaleString("de-DE")
          });
          store.set("mails", mails5);
          store.set("draft", { to: "", subject: "", body: "" });
          if(HalDo.Notify) HalDo.Notify.success("E-Mail gespeichert (lokal)", { app: "email" });
          tab = "sent"; store.set("tab", tab);
          build();
        });
        var saveDraft = container.querySelector("#eSaveDraft");
        if(saveDraft) saveDraft.addEventListener("click", function(){
          var d = store.get("draft", {});
          if(!d.subject && !d.body){ alert("Entwurf leer"); return; }
          var mails6 = store.get("mails", []);
          mails6.push({
            to: d.to || "", from: store.get("myEmail", "Halil@haldo.ai"),
            subject: d.subject || "(kein Betreff)", body: d.body || "",
            folder: "drafts", read: false,
            date: new Date().toLocaleString("de-DE")
          });
          store.set("mails", mails6);
          store.set("draft", { to: "", subject: "", body: "" });
          if(HalDo.Notify) HalDo.Notify.success("Entwurf gespeichert", { app: "email" });
          tab = "drafts"; store.set("tab", tab);
          build();
        });
        var disc = container.querySelector("#eDiscard");
        if(disc) disc.addEventListener("click", function(){
          if(!confirm("Entwurf verwerfen?")) return;
          store.set("draft", { to: "", subject: "", body: "" });
          tab = "inbox"; store.set("tab", tab);
          build();
        });
      }

      if(tab === "settings"){
        var myE = container.querySelector("#eMyEmail");
        if(myE) myE.addEventListener("change", function(){
          store.set("myEmail", this.value);
          if(HalDo.Notify) HalDo.Notify.success("E-Mail gespeichert", { app: "email" });
        });
        var clr = container.querySelector("#eClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE E-Mails löschen?")) return;
          store.set("mails", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("email", { name: "E-Mail", icon: "📧", render: render, category: "kommunikation" });
  console.log("🦚 email.js v156 geladen");
})();
