/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PASSWORT (v153)
   Passwort-Safe · Generator · Kategorien · Einstellungen
   ⚠️ Hinweis: Lokal gespeichert — nicht für sensible Daten!
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function generatePassword(len, opts){
    var chars = "";
    if(opts.lower !== false) chars += "abcdefghijklmnopqrstuvwxyz";
    if(opts.upper !== false) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if(opts.numbers !== false) chars += "0123456789";
    if(opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if(!chars) chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var pw = "";
    for(var i = 0; i < len; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    return pw;
  }

  function strength(pw){
    var score = 0;
    if(pw.length >= 8) score++;
    if(pw.length >= 12) score++;
    if(pw.length >= 16) score++;
    if(/[a-z]/.test(pw)) score++;
    if(/[A-Z]/.test(pw)) score++;
    if(/[0-9]/.test(pw)) score++;
    if(/[^a-zA-Z0-9]/.test(pw)) score++;
    return Math.min(100, score * 15);
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "safe");

    function build(){
      var body = "";

      if(tab === "safe"){
        var items = store.get("items", []);
        var revealed = store.get("revealed", {});

        body = '<div class="card">'
          + '<div style="padding:12px;background:rgba(255,128,128,.1);border-radius:10px;margin-bottom:12px;border-left:3px solid #ff8080">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.5">'
          + '⚠️ <b>Wichtig:</b> Passwörter werden <b>unverschlüsselt lokal</b> gespeichert! Nicht für echte Geheimnisse nutzen.'
          + '</div></div>'
          + '<button class="btn full" id="pwNew" style="margin-bottom:10px">+ Neuer Eintrag</button>';

        if(store.get("editing", false)){
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="pwName" placeholder="Name (z.B. Gmail)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="pwUser" placeholder="Benutzername" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<div style="display:flex;gap:6px;margin-bottom:6px">'
            + '<input type="text" id="pwPass" placeholder="Passwort" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;font-family:monospace">'
            + '<button class="btn sec" id="pwGen" style="padding:0 14px">🎲</button>'
            + '</div>'
            + '<input type="text" id="pwUrl" placeholder="URL (optional)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="pwNotes" placeholder="Notizen" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:8px">'
            + '<div style="display:flex;gap:6px">'
            + '<button class="btn" id="pwSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="pwCancel">✕</button>'
            + '</div></div>';
        }

        if(!items.length && !store.get("editing", false)){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Noch keine Einträge</div>';
        } else {
          items.forEach(function(it, i){
            var isRevealed = revealed[i];
            var st = strength(it.password);
            var col = st >= 80 ? "#4ade80" : st >= 50 ? "#fbbf24" : "#ff8080";
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid ' + col + '">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p1)">🔐 ' + _esc(it.name) + '</div>'
              + (it.user ? '<div style="font-size:11px;color:var(--text-dim);margin-top:2px">👤 ' + _esc(it.user) + '</div>' : '')
              + '<div style="font-size:12px;color:var(--text-dim);font-family:monospace;margin-top:4px;word-break:break-all">' + (isRevealed ? _esc(it.password) : "••••••••••") + '</div>'
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-reveal="' + i + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px;font-size:11px">' + (isRevealed ? "👁" : "👁️‍🗨️") + '</button>'
              + '<button data-copy="' + i + '" style="background:rgba(74,222,128,.15);border:none;border-radius:6px;color:#4ade80;cursor:pointer;padding:4px 8px;font-size:11px">📋</button>'
              + '<button data-pwdel="' + i + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "generator"){
        var len = store.get("genLen", 16);
        var opts = store.get("genOpts", { upper: true, lower: true, numbers: true, symbols: false });
        var last = store.get("genLast", "");

        body = '<div class="card"><h3>🎲 Passwort-Generator</h3>'
          + '<div style="padding:16px;background:rgba(0,0,0,.3);border-radius:10px;text-align:center;margin-bottom:14px">'
          + '<div id="genOut" style="font-size:16px;font-family:monospace;word-break:break-all;color:var(--p1);font-weight:900">' + _esc(last || "Klick auf Generieren") + '</div>'
          + '</div>'
          + '<div class="field"><label>Länge: <b id="genLenVal">' + len + '</b></label>'
          + '<input type="range" id="genLen" min="6" max="64" value="' + len + '" style="width:100%"></div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">'
          + toggle("genUpper", "🔠 Großbuchstaben", opts.upper !== false)
          + toggle("genLower", "🔡 Kleinbuchstaben", opts.lower !== false)
          + toggle("genNumbers", "🔢 Zahlen", opts.numbers !== false)
          + toggle("genSymbols", "✳️ Symbole", !!opts.symbols)
          + '</div>'
          + '<button class="btn full" id="genBtn">🎲 Generieren</button>'
          + (last ? '<button class="btn sec full" id="genCopy" style="margin-top:8px">📋 Kopieren</button>' : '')
          + '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🔐 EINTRÄGE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + store.get("items", []).length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(255,128,128,.1);border-radius:10px;margin-top:10px;border-left:3px solid #ff8080">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.5">'
          + '⚠️ Für echte Passwörter: <b>Bitwarden, KeePassXC, 1Password</b> nutzen!'
          + '</div></div>'
          + '<button class="btn danger full" id="pwClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="safe"?" active":"") + '" data-pwt="safe">🔐 Safe</button>'
        + '<button class="tab' + (tab==="generator"?" active":"") + '" data-pwt="generator">🎲 Generator</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-pwt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-pwt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.pwt; store.set("tab", tab); build();
        });
      });

      if(tab === "safe"){
        var nb = container.querySelector("#pwNew");
        if(nb) nb.addEventListener("click", function(){
          store.set("editing", true); build();
        });

        if(store.get("editing", false)){
          var gen = container.querySelector("#pwGen");
          if(gen) gen.addEventListener("click", function(){
            container.querySelector("#pwPass").value = generatePassword(16, { upper: true, lower: true, numbers: true, symbols: true });
          });
          var save = container.querySelector("#pwSave");
          if(save) save.addEventListener("click", function(){
            var name = container.querySelector("#pwName").value.trim();
            var pw = container.querySelector("#pwPass").value.trim();
            if(!name || !pw){ alert("Name und Passwort sind Pflicht"); return; }
            var items2 = store.get("items", []);
            items2.push({
              name: name,
              user: container.querySelector("#pwUser").value.trim(),
              password: pw,
              url: container.querySelector("#pwUrl").value.trim(),
              notes: container.querySelector("#pwNotes").value.trim(),
              date: new Date().toLocaleString("de-DE")
            });
            store.set("items", items2);
            store.set("editing", false);
            if(HalDo.Notify) HalDo.Notify.success("Eintrag gespeichert", { app: "passwort" });
            build();
          });
          var cancel = container.querySelector("#pwCancel");
          if(cancel) cancel.addEventListener("click", function(){
            store.set("editing", false); build();
          });
        }

        container.querySelectorAll("[data-reveal]").forEach(function(el){
          el.addEventListener("click", function(){
            var r = store.get("revealed", {});
            r[el.dataset.reveal] = !r[el.dataset.reveal];
            store.set("revealed", r);
            build();
          });
        });
        container.querySelectorAll("[data-copy]").forEach(function(el){
          el.addEventListener("click", function(){
            var it = store.get("items", [])[parseInt(el.dataset.copy)];
            if(it && navigator.clipboard){
              navigator.clipboard.writeText(it.password);
              if(HalDo.Notify) HalDo.Notify.success("Passwort kopiert (30s)", { app: "passwort" });
            }
          });
        });
        container.querySelectorAll("[data-pwdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Eintrag löschen?")) return;
            var items3 = store.get("items", []);
            items3.splice(parseInt(el.dataset.pwdel), 1);
            store.set("items", items3);
            build();
          });
        });
      }

      if(tab === "generator"){
        var lenInp = container.querySelector("#genLen");
        if(lenInp) lenInp.addEventListener("input", function(){
          store.set("genLen", parseInt(this.value));
          container.querySelector("#genLenVal").textContent = this.value;
        });
        ["genUpper","genLower","genNumbers","genSymbols"].forEach(function(k){
          var el = container.querySelector('[data-toggle="' + k + '"]');
          if(el) el.addEventListener("click", function(){
            var o = store.get("genOpts", { upper: true, lower: true, numbers: true, symbols: false });
            var map = { genUpper: "upper", genLower: "lower", genNumbers: "numbers", genSymbols: "symbols" };
            o[map[k]] = !o[map[k]];
            store.set("genOpts", o);
            build();
          });
        });
        var genBtn = container.querySelector("#genBtn");
        if(genBtn) genBtn.addEventListener("click", function(){
          var len2 = store.get("genLen", 16);
          var opts2 = store.get("genOpts", {});
          var pw2 = generatePassword(len2, opts2);
          store.set("genLast", pw2);
          build();
        });
        var copyBtn = container.querySelector("#genCopy");
        if(copyBtn) copyBtn.addEventListener("click", function(){
          if(navigator.clipboard){
            navigator.clipboard.writeText(store.get("genLast", ""));
            if(HalDo.Notify) HalDo.Notify.success("Kopiert!", { app: "passwort" });
          }
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#pwClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Passwörter löschen?")) return;
          store.set("items", []);
          build();
        });
      }
    }

    function toggle(id, label, on){
      return '<button data-toggle="' + id + '" style="padding:10px;background:' + (on ? "rgba(0,229,255,.15)" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (on ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;color:inherit;cursor:pointer;font-family:inherit;font-size:11px;font-weight:800;text-align:left">' + label + '</button>';
    }

    build();
  }

  HalDoApp("passwort", { name: "Passwort", icon: "🔐", render: render, category: "produktivitaet" });
  console.log("🦚 passwort.js geladen");
})();
