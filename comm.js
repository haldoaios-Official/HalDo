/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — COMM APP (v150)
   Kontakte · Chat · E-Mail · Video-Anruf
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
    var tab = store.get("tab", "contacts");

    function build(){
      var contacts = store.get("contacts", []);
      var messages = store.get("messages", {});
      var body = "";

      /* ═══ KONTAKTE ═══ */
      if(tab === "contacts"){
        body = '<div class="card"><h3>👥 Kontakte (' + contacts.length + ')</h3>';
        if(contacts.length){
          contacts.forEach(function(c, idx){
            var initial = (c.name || "?").charAt(0).toUpperCase();
            body += '<div class="contact-item">'
              + '<div class="avatar">' + initial + '</div>'
              + '<div class="info"><div class="nm">' + _esc(c.name) + '</div>'
              + '<div class="ph">' + _esc(c.phone || c.email || "") + '</div></div>'
              + '<div class="actions">'
              + '<button data-ccall="' + idx + '" title="Anrufen">📞</button>'
              + '<button data-cchat="' + idx + '" title="Chat">💬</button>'
              + '<button data-cdel="' + idx + '" style="background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);color:#ff8080" title="Löschen">✕</button>'
              + '</div></div>';
          });
        } else {
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Kontakte</div>';
        }
        body += '</div>';
        body += '<div class="card"><h3>➕ Neuer Kontakt</h3>'
          + '<div class="field"><label>Name</label><input type="text" id="cN" placeholder="Vorname Nachname"></div>'
          + '<div class="field"><label>Telefon</label><input type="tel" id="cP" placeholder="+49..."></div>'
          + '<div class="field"><label>E-Mail</label><input type="email" id="cE" placeholder="name@example.com"></div>'
          + '<button class="btn full" id="cA">💾 Speichern</button>'
          + '</div>';

      /* ═══ CHAT ═══ */
      } else if(tab === "chat"){
        body = '<div class="card"><h3>💬 Chats</h3>';
        if(contacts.length){
          contacts.forEach(function(c, idx){
            var msgs = messages[c.name] || [];
            body += '<div class="doc-item" data-ci="' + idx + '"><span class="ico">💬</span><div class="info"><div class="nm">' + _esc(c.name) + '</div><div class="dt">' + msgs.length + ' Nachrichten</div></div><div style="color:var(--p1)">›</div></div>';
          });
        } else {
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Erstelle zuerst einen Kontakt</div>';
        }
        body += '</div><div id="chatArea"></div>';

      /* ═══ E-MAIL ═══ */
      } else if(tab === "email"){
        body = '<div class="card"><h3>📧 E-Mail senden</h3>'
          + '<div class="field"><label>An</label><input type="email" id="emT" placeholder="empfänger@example.com"></div>'
          + '<div class="field"><label>Betreff</label><input type="text" id="emS" placeholder="Betreff"></div>'
          + '<div class="field"><label>Nachricht</label><textarea id="emB" placeholder="Deine Nachricht..." style="min-height:140px"></textarea></div>'
          + '<button class="btn full" id="emG">📤 Senden</button>'
          + '<div class="badge-info">Öffnet dein Standard-E-Mail-Programm (mailto:)</div>'
          + '</div>';

      /* ═══ VIDEO ═══ */
      } else if(tab === "video"){
        body = '<div class="card"><h3>📹 Video-Anruf</h3>'
          + '<div id="clS" style="padding:14px;background:rgba(0,0,0,.2);border-radius:10px;text-align:center;font-size:12px;color:var(--text-dim);margin-bottom:10px">Bereit</div>'
          + '<video id="clV" class="camera-video" autoplay muted playsinline style="display:block;margin:0 auto"></video>'
          + '<div style="display:flex;gap:8px;margin-top:10px">'
          + '<button class="btn" id="clSt" style="flex:1">📞 Starten</button>'
          + '<button class="btn sec" id="clE" style="flex:1">📴 Stop</button>'
          + '</div>'
          + '<div class="badge-info">Kamera-Test (Demo). Echte P2P-Anrufe brauchen Signaling-Server.</div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="contacts"?" active":"") + '" data-comt="contacts">👥 Kontakte</button>'
        + '<button class="tab' + (tab==="chat"?" active":"") + '" data-comt="chat">💬 Chat</button>'
        + '<button class="tab' + (tab==="email"?" active":"") + '" data-comt="email">📧 E-Mail</button>'
        + '<button class="tab' + (tab==="video"?" active":"") + '" data-comt="video">📹 Video</button>'
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-comt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.comt;
          store.set("tab", tab);
          build();
        });
      });

      if(tab === "contacts"){
        container.querySelector("#cA").addEventListener("click", function(){
          var n = container.querySelector("#cN").value.trim();
          if(!n){ alert("Name eingeben"); return; }
          contacts.push({
            name: n,
            phone: container.querySelector("#cP").value.trim(),
            email: container.querySelector("#cE").value.trim()
          });
          store.set("contacts", contacts);
          if(window.HalDo.Voice) HalDo.Voice.speak("Kontakt gespeichert");
          build();
        });
        container.querySelectorAll("[data-cdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Kontakt löschen?")) return;
            contacts.splice(parseInt(el.dataset.cdel), 1);
            store.set("contacts", contacts);
            build();
          });
        });
        container.querySelectorAll("[data-ccall]").forEach(function(el){
          el.addEventListener("click", function(){
            tab = "video";
            store.set("tab", tab);
            build();
          });
        });
        container.querySelectorAll("[data-cchat]").forEach(function(el){
          el.addEventListener("click", function(){
            tab = "chat";
            store.set("tab", tab);
            build();
          });
        });
      }

      if(tab === "chat"){
        container.querySelectorAll("[data-ci]").forEach(function(el){
          el.addEventListener("click", function(){
            var c = contacts[parseInt(el.dataset.ci)];
            if(!c) return;
            var m = messages[c.name] || [];
            var area = container.querySelector("#chatArea");
            area.innerHTML = '<div class="card"><h3>💬 ' + _esc(c.name) + '</h3>'
              + '<div id="ccB" style="display:flex;flex-direction:column;gap:8px;min-height:150px;max-height:300px;overflow-y:auto;padding:8px;background:rgba(0,0,0,.15);border-radius:10px">'
              + (m.length ? m.map(function(mm){
                  return '<div class="msg ' + (mm.r === "me" ? "user" : "bot") + '">' + _esc(mm.t) + '</div>';
                }).join("") : '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Noch keine Nachrichten</div>')
              + '</div>'
              + '<div class="chat-input-row">'
              + '<textarea id="ccI" placeholder="Nachricht…" rows="1"></textarea>'
              + '<button class="ibtn send" id="ccS">➤</button>'
              + '</div></div>';
            var cb = area.querySelector("#ccB");
            if(cb) cb.scrollTop = cb.scrollHeight;
            area.querySelector("#ccS").addEventListener("click", function(){
              var t = area.querySelector("#ccI").value.trim();
              if(!t) return;
              if(!messages[c.name]) messages[c.name] = [];
              messages[c.name].push({ r: "me", t: t });
              store.set("messages", messages);
              setTimeout(function(){
                messages[c.name].push({ r: "them", t: "✅ Nachricht empfangen (Simulation)" });
                store.set("messages", messages);
                build();
              }, 600);
              build();
            });
          });
        });
      }

      if(tab === "email"){
        container.querySelector("#emG").addEventListener("click", function(){
          var to = container.querySelector("#emT").value.trim();
          if(!to){ alert("Empfänger eingeben"); return; }
          window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(container.querySelector("#emS").value || "") + "&body=" + encodeURIComponent(container.querySelector("#emB").value || "");
          if(window.HalDo.Voice) HalDo.Voice.speak("E-Mail-Programm geöffnet");
        });
      }

      if(tab === "video"){
        var stream = null;
        container.querySelector("#clSt").addEventListener("click", function(){
          container.querySelector("#clS").textContent = "📞 Kamera aktivieren…";
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(s){
              stream = s;
              container.querySelector("#clV").srcObject = s;
              container.querySelector("#clS").textContent = "🔴 Live (Demo)";
              if(window.HalDo.Voice) HalDo.Voice.speak("Kamera aktiv");
            })
            .catch(function(e){
              container.querySelector("#clS").textContent = "❌ " + e.message;
            });
        });
        container.querySelector("#clE").addEventListener("click", function(){
          if(stream){
            stream.getTracks().forEach(function(t){ t.stop(); });
            stream = null;
          }
          container.querySelector("#clV").srcObject = null;
          container.querySelector("#clS").textContent = "📴 Beendet";
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("comm", { render: render });
  else console.warn("comm.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 comm.js geladen");
