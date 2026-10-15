/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — CHAT (v152.1) · Bugfix
   Lokaler Chat · Null-Safe · Mehrere Kontakte
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
    /* Safety: eigener Store-Fallback */
    var store = ctx && ctx.store ? ctx.store : (HalDo.Store ? HalDo.Store.scope("chat") : null);
    if(!store){
      container.innerHTML = '<div class="card"><h3>❌ Fehler</h3>'
        + '<div style="font-size:12px;color:#ff8080">Store nicht verfügbar</div>'
        + '</div>';
      return;
    }

    var tab = store.get("tab", "chat");

    function build(){
      var body = "";

      /* ═══ CHAT ═══ */
      if(tab === "chat"){
        var messages = store.get("messages", [
          { from: "system", text: "Willkommen im Chat! 🦚 Schreibe eine Nachricht.", time: now() }
        ]);
        var contact = store.get("contact", "Mein Chat");

        body = '<div class="card" style="padding:0;overflow:hidden">'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-bottom:1px solid var(--border-soft)">'
          + '<div style="font-size:13px;font-weight:900;color:var(--p1)">💬 ' + _esc(contact) + '</div>'
          + '<div style="font-size:10px;color:var(--text-mute)">' + messages.length + ' Nachrichten · lokal gespeichert</div>'
          + '</div>'
          + '<div id="chatBox" style="padding:14px;max-height:calc(100vh - 350px);overflow-y:auto">';

        messages.forEach(function(m){
          var isMe = m.from === "me";
          var isSys = m.from === "system";
          if(isSys){
            body += '<div style="text-align:center;margin:10px 0">'
              + '<div style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,.05);border-radius:20px;font-size:10.5px;color:var(--text-mute);font-style:italic">'
              + _esc(m.text)
              + '</div></div>';
          } else {
            body += '<div style="margin-bottom:10px;display:flex;justify-content:' + (isMe ? "flex-end" : "flex-start") + '">'
              + '<div style="max-width:80%;padding:10px 14px;background:' + (isMe ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.3)") + ';color:' + (isMe ? "#000" : "var(--text)") + ';border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word">'
              + _esc(m.text)
              + '<div style="font-size:9px;opacity:.6;margin-top:4px;text-align:right">' + _esc(m.time || "") + '</div>'
              + '</div></div>';
          }
        });

        body += '</div>'
          + '<div style="padding:10px;border-top:1px solid var(--border-soft)">'
          + '<div style="display:flex;gap:6px">'
          + '<input type="text" id="chatInp" placeholder="Nachricht..." autocomplete="off" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="chatSend" style="padding:0 14px">➤</button>'
          + '</div></div>'
          + '</div>';

        /* Auto-Reply Hinweis */
        body += '<div class="card" style="background:rgba(251,191,36,.08);border-left:3px solid #fbbf24">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.5">'
          + '💡 <b>Hinweis:</b> Chat ist <b>lokal</b>. Für echten Chat mit anderen: Server nötig.'
          + '</div></div>';
      }

      /* ═══ KONTAKTE ═══ */
      else if(tab === "kontakte"){
        var contacts = store.get("contacts", ["Mein Chat", "Gruppe 1", "Gruppe 2"]);
        body = '<div class="card"><h3>👥 Chats (' + contacts.length + ')</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="newContact" placeholder="Neuer Chat..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="addContact">+</button>'
          + '</div>';
        contacts.forEach(function(c, i){
          var isActive = c === store.get("contact", "");
          body += '<div style="padding:10px;background:' + (isActive ? "rgba(0,229,255,.1)" : "rgba(0,0,0,.2)") + ';border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ' + (isActive ? "var(--p1)" : "var(--text-mute)") + '">'
            + '<button data-chatselect="' + _esc(c) + '" style="background:transparent;border:none;color:inherit;cursor:pointer;font-family:inherit;font-size:13px;font-weight:800;text-align:left;flex:1">💬 ' + _esc(c) + (isActive ? " ✓" : "") + '</button>'
            + '<button data-chatdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>';
        });
        body += '</div>';
      }

      /* ═══ EINSTELLUNGEN ═══ */
      else if(tab === "settings"){
        var voiceOn = HalDo.Store.get("voiceEnabled", true);
        var autoScroll = store.get("autoScroll", true);
        var messages2 = store.get("messages", []);

        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + toggleRow("voiceEnabledGlobal", "🔊 Sprachausgabe global", voiceOn)
          + toggleRow("autoScroll", "⬇️ Auto-Scroll", autoScroll)
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-top:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">💬 NACHRICHTEN</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + messages2.length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="chatClear" style="margin-top:10px">🗑️ Chat leeren</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="chat"?" active":"") + '" data-cht="chat">💬 Chat</button>'
        + '<button class="tab' + (tab==="kontakte"?" active":"") + '" data-cht="kontakte">👥 Chats</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-cht="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-cht]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.cht;
          store.set("tab", tab);
          build();
        });
      });

      /* Chat-Events */
      if(tab === "chat"){
        var box = container.querySelector("#chatBox");
        if(box && store.get("autoScroll", true)) box.scrollTop = box.scrollHeight;

        var send = function(){
          var inp = container.querySelector("#chatInp");
          var txt = inp.value.trim();
          if(!txt) return;
          messages.push({ from: "me", text: txt, time: now() });
          store.set("messages", messages);
          inp.value = "";
          build();
        };

        var sendBtn = container.querySelector("#chatSend");
        if(sendBtn) sendBtn.addEventListener("click", send);

        var inp = container.querySelector("#chatInp");
        if(inp){
          inp.addEventListener("keydown", function(e){
            if(e.key === "Enter" && !e.shiftKey){
              e.preventDefault();
              send();
            }
          });
          inp.focus();
        }
      }

      /* Kontakte-Events */
      if(tab === "kontakte"){
        var addC = container.querySelector("#addContact");
        if(addC) addC.addEventListener("click", function(){
          var inp = container.querySelector("#newContact");
          var v = inp.value.trim();
          if(!v) return;
          var c = store.get("contacts", []);
          if(c.indexOf(v) === -1) c.push(v);
          store.set("contacts", c);
          build();
        });
        container.querySelectorAll("[data-chatselect]").forEach(function(el){
          el.addEventListener("click", function(){
            store.set("contact", el.dataset.chatselect);
            tab = "chat"; store.set("tab", tab);
            build();
          });
        });
        container.querySelectorAll("[data-chatdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var c = store.get("contacts", []);
            c.splice(parseInt(el.dataset.chatdel), 1);
            store.set("contacts", c);
            build();
          });
        });
      }

      /* Settings-Events */
      if(tab === "settings"){
        var voiceToggle = container.querySelector('[data-toggle="voiceEnabledGlobal"]');
        if(voiceToggle) voiceToggle.addEventListener("click", function(){
          HalDo.Store.set("voiceEnabled", !HalDo.Store.get("voiceEnabled", true));
          build();
        });

        var asToggle = container.querySelector('[data-toggle="autoScroll"]');
        if(asToggle) asToggle.addEventListener("click", function(){
          store.set("autoScroll", !store.get("autoScroll", true));
          build();
        });

        var clr = container.querySelector("#chatClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Chat leeren?")) return;
          store.set("messages", [{ from: "system", text: "Chat geleert 🦚", time: now() }]);
          build();
        });
      }
    }

    function toggleRow(key, label, on){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:12.5px;font-weight:800">' + _esc(label) + '</div>'
        + '<button data-toggle="' + key + '" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (on ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (on ? "#000" : "var(--text-dim)") + '">' + (on ? "AN" : "AUS") + '</button>'
        + '</div>';
    }

    function now(){
      return new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    build();
  }

  HalDoApp("chat", { name: "Chat", icon: "💬", render: render, category: "kommunikation" });
  console.log("🦚 chat.js v152.1 geladen (bugfix)");
})();
