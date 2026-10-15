/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — POSTEINGANG (v152)
   Nachrichten lokal · Ordner · Favoriten · Einstellungen
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

      /* ═══ INBOX / SENT / DRAFTS ═══ */
      if(tab === "inbox" || tab === "sent" || tab === "drafts" || tab === "starred"){
        var msgs = store.get("messages", []);
        var query = store.get("query", "");

        var filtered = msgs.filter(function(m){
          if(tab === "inbox" && m.folder !== "inbox") return false;
          if(tab === "sent" && m.folder !== "sent") return false;
          if(tab === "drafts" && m.folder !== "drafts") return false;
          if(tab === "starred" && !m.starred) return false;
          if(!query) return true;
          var q = query.toLowerCase();
          return (m.subject || "").toLowerCase().indexOf(q) !== -1
            || (m.body || "").toLowerCase().indexOf(q) !== -1
            || (m.to || "").toLowerCase().indexOf(q) !== -1
            || (m.from || "").toLowerCase().indexOf(q) !== -1;
        });

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="pSearch" placeholder="🔍 Suchen..." value="' + _esc(query) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="pNew" style="padding:0 16px">✏️ Neu</button>'
          + '</div>';

        if(openIdx !== undefined && openIdx >= 0 && msgs[openIdx]){
          var m = msgs[openIdx];
          body += '<div style="padding:14px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-bottom:6px">' + _esc(m.subject || "(kein Betreff)") + '</div>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">'
            + '📤 An: ' + _esc(m.to || "?") + ' · ' + _esc(m.date)
            + '</div>'
            + '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word">' + _esc(m.body) + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:12px">'
            + '<button class="btn" id="pReply" style="flex:1;font-size:11px">↩ Antworten</button>'
            + '<button class="btn sec" id="pForward" style="flex:1;font-size:11px">↪ Weiterleiten</button>'
            + '<button class="btn sec" id="pClose">✕</button>'
            + '</div></div>';
        }

        if(!filtered.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Nachrichten</div>';
        } else {
          filtered.slice().reverse().forEach(function(m){
            var ri = msgs.indexOf(m);
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:flex-start;border-left:3px solid ' + (m.read ? "var(--text-mute)" : "var(--p1)") + '">'
              + '<div style="font-size:18px;flex-shrink:0">' + (m.read ? "📩" : "📬") + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12.5px;font-weight:' + (m.read ? "700" : "900") + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(m.subject || "(kein Betreff)") + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + (m.folder === "inbox" ? "Von: " + _esc(m.from) : "An: " + _esc(m.to)) + '</div>'
              + '<div style="font-size:11px;color:var(--text-dim);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc((m.body || "").substring(0, 60)) + '...</div>'
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-pstar="' + ri + '" style="background:transparent;border:none;cursor:pointer;font-size:13px">' + (m.starred ? "⭐" : "☆") + '</button>'
              + '<button data-pdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      /* ═══ COMPOSE ═══ */
      else if(tab === "compose"){
        var draft = store.get("draft", { to: "", subject: "", body: "" });
        body = '<div class="card"><h3>✏️ Neue Nachricht</h3>'
          + '<div class="field"><label>An</label><input type="email" id="pTo" value="' + _esc(draft.to) + '" placeholder="empfaenger@example.com" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Betreff</label><input type="text" id="pSubject" value="' + _esc(draft.subject) + '" placeholder="Betreff" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Nachricht</label><textarea id="pBody" rows="8" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(draft.body) + '</textarea></div>'
          + '<div style="display:flex;gap:6px">'
          + '<button class="btn" id="pSend" style="flex:1">📤 Senden</button>'
          + '<button class="btn sec" id="pSaveDraft">💾 Entwurf</button>'
          + '<button class="btn sec" id="pDiscard">✕</button>'
          + '</div></div>';
      }

      /* ═══ SETTINGS ═══ */
      else if(tab === "settings"){
        var msgs2 = store.get("messages", []);
        var myEmail = store.get("myEmail", "Halil@haldo.ai");
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Meine E-Mail</label>'
          + '<input type="email" id="pMyEmail" value="' + _esc(myEmail) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-top:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📬 NACHRICHTEN</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + msgs2.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px;margin-top:8px;border-left:3px solid #fbbf24">'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.5">'
          + '⚠️ <b>Hinweis:</b> Nachrichten werden <b>lokal</b> gespeichert. Echtes E-Mail senden/empfangen braucht einen Server (SMTP/IMAP).'
          + '</div></div>'
          + '<button class="btn danger full" id="pClear" style="margin-top:10px">🗑️ Alle Nachrichten löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="inbox"?" active":"") + '" data-pt="inbox">📬 Inbox</button>'
        + '<button class="tab' + (tab==="sent"?" active":"") + '" data-pt="sent">📤 Gesendet</button>'
        + '<button class="tab' + (tab==="drafts"?" active":"") + '" data-pt="drafts">📝 Entwürfe</button>'
        + '<button class="tab' + (tab==="starred"?" active":"") + '" data-pt="starred">⭐</button>'
        + '<button class="tab' + (tab==="compose"?" active":"") + '" data-pt="compose">✏️ Neu</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-pt="settings">⚙️</button>'
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-pt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.pt; store.set("tab", tab); build();
        });
      });

      if(tab === "inbox" || tab === "sent" || tab === "drafts" || tab === "starred"){
        var sInp = container.querySelector("#pSearch");
        if(sInp) sInp.addEventListener("input", function(){
          store.set("query", this.value);
          var t = tab; build(openIdx); tab = t;
        });
        var nb = container.querySelector("#pNew");
        if(nb) nb.addEventListener("click", function(){
          tab = "compose"; store.set("tab", tab); build();
        });

        container.querySelectorAll("[data-pdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Nachricht löschen?")) return;
            var msgs3 = store.get("messages", []);
            msgs3.splice(parseInt(el.dataset.pdel), 1);
            store.set("messages", msgs3);
            build();
          });
        });
        container.querySelectorAll("[data-pstar]").forEach(function(el){
          el.addEventListener("click", function(){
            var msgs4 = store.get("messages", []);
            var m2 = msgs4[parseInt(el.dataset.pstar)];
            m2.starred = !m2.starred;
            store.set("messages", msgs4);
            build();
          });
        });
      }

      if(tab === "compose"){
        var inputs = ["pTo", "pSubject", "pBody"];
        inputs.forEach(function(id){
          var el = container.querySelector("#" + id);
          if(el) el.addEventListener("input", function(){
            var d = store.get("draft", { to: "", subject: "", body: "" });
            if(id === "pTo") d.to = el.value;
            if(id === "pSubject") d.subject = el.value;
            if(id === "pBody") d.body = el.value;
            store.set("draft", d);
          });
        });

        var send = container.querySelector("#pSend");
        if(send) send.addEventListener("click", function(){
          var to = container.querySelector("#pTo").value.trim();
          var subject = container.querySelector("#pSubject").value.trim();
          var body2 = container.querySelector("#pBody").value.trim();
          if(!to){ alert("Empfänger fehlt"); return; }
          var msgs5 = store.get("messages", []);
          msgs5.push({
            to: to, from: store.get("myEmail", "Halil@haldo.ai"),
            subject: subject, body: body2,
            folder: "sent", read: true,
            date: new Date().toLocaleString("de-DE")
          });
          store.set("messages", msgs5);
          store.set("draft", { to: "", subject: "", body: "" });
          if(HalDo.Notify) HalDo.Notify.success("Nachricht gespeichert (lokal)", { app: "posteingang" });
          tab = "sent"; store.set("tab", tab);
          build();
        });
        var saveDraft = container.querySelector("#pSaveDraft");
        if(saveDraft) saveDraft.addEventListener("click", function(){
          var d = store.get("draft", {});
          if(!d.subject && !d.body){ alert("Entwurf leer"); return; }
          var msgs6 = store.get("messages", []);
          msgs6.push({
            to: d.to || "", from: store.get("myEmail", "Halil@haldo.ai"),
            subject: d.subject || "(kein Betreff)", body: d.body || "",
            folder: "drafts", read: false,
            date: new Date().toLocaleString("de-DE")
          });
          store.set("messages", msgs6);
          store.set("draft", { to: "", subject: "", body: "" });
          if(HalDo.Notify) HalDo.Notify.success("Entwurf gespeichert", { app: "posteingang" });
          tab = "drafts"; store.set("tab", tab);
          build();
        });
        var disc = container.querySelector("#pDiscard");
        if(disc) disc.addEventListener("click", function(){
          if(!confirm("Entwurf verwerfen?")) return;
          store.set("draft", { to: "", subject: "", body: "" });
          tab = "inbox"; store.set("tab", tab);
          build();
        });
      }

      if(tab === "settings"){
        var myE = container.querySelector("#pMyEmail");
        if(myE) myE.addEventListener("change", function(){
          store.set("myEmail", this.value);
          if(HalDo.Notify) HalDo.Notify.success("E-Mail gespeichert", { app: "posteingang" });
        });
        var clr = container.querySelector("#pClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Nachrichten löschen?")) return;
          store.set("messages", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("posteingang", { name: "Posteingang", icon: "📬", render: render, category: "kommunikation" });
  console.log("🦚 posteingang.js geladen");
})();
