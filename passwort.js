/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PASSWORT (v300)
   Kategorien · Generator · Stärke-Anzeige
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  var CATS = ["🔐 Alle", "📱 Social", "🏦 Banking", "🛒 Shopping", "📧 E-Mail", "🎮 Gaming", "📦 Sonstige"];

  function generate(len, upper, numbers, symbols) {
    var chars = "abcdefghijklmnopqrstuvwxyz";
    if(upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if(numbers) chars += "0123456789";
    if(symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    var pw = "";
    for(var i=0;i<len;i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    return pw;
  }

  function strength(pw) {
    var score = 0;
    if(pw.length >= 8) score += 20;
    if(pw.length >= 12) score += 20;
    if(/[a-z]/.test(pw)) score += 15;
    if(/[A-Z]/.test(pw)) score += 15;
    if(/[0-9]/.test(pw)) score += 15;
    if(/[^a-zA-Z0-9]/.test(pw)) score += 15;
    return score;
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "safe");
    var filter = store.get("filter", "🔐 Alle");

    function build(){
      var body = '';
      var items = store.get("items", []);

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "safe" ? " active" : "") + '" data-pwt="safe">🔐 Safe</button>'
        + '<button class="tab' + (tab === "gen" ? " active" : "") + '" data-pwt="gen">🎲 Generator</button>'
        + '</div>';

      if(tab === "safe"){
        body += '<div class="card"><h3>🔐 Passwort-Safe</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<select id="catF" style="flex:1;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;color:#fff">'
          + CATS.map(c => '<option value="'+c+'"'+(filter===c?' selected':'')+'>'+c+'</option>').join("")
          + '</select>'
          + '<button class="btn" id="pwNew" style="font-size:11px;padding:8px 12px">+ Neu</button>'
          + '</div>';

        var filtered = items.filter(i => filter === "🔐 Alle" || i.cat === filter);
        if(!filtered.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Einträge</div>';
        else {
          filtered.slice().reverse().forEach(function(item){
            var ri = items.indexOf(item);
            var st = strength(item.pw);
            var col = st >= 80 ? "#4ade80" : st >= 50 ? "#fbbf24" : "#ff8080";
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid '+col+'">'
              + '<div style="display:flex;justify-content:space-between">'
              + '<div><div style="font-size:12.5px;font-weight:900">' + _esc(item.name) + ' <span style="font-size:10px;color:var(--text-mute)">(' + _esc(item.cat) + ')</span></div>'
              + '<div style="font-size:11px;color:var(--text-dim);font-family:monospace">' + _esc(item.pw) + '</div></div>'
              + '<div style="display:flex;gap:4px">'
              + '<button data-copy="'+ri+'" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px">📋</button>'
              + '<button data-del="'+ri+'" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px">✕</button>'
              + '</div></div></div>';
          });
        }
        body += '</div>';
      }

      if(tab === "gen"){
        body += '<div class="card"><h3>🎲 Passwort-Generator</h3>'
          + '<div id="genRes" style="padding:16px;background:rgba(0,0,0,.4);border-radius:10px;text-align:center;margin-bottom:12px;font-family:monospace;font-size:16px;font-weight:900;color:var(--p1);word-break:break-all">Klick auf Generieren</div>'
          + '<div class="field"><label>Länge: <b id="genLenV">16</b></label><input type="range" id="genLen" min="8" max="64" value="16" style="width:100%"></div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">'
          + '<label style="font-size:11px"><input type="checkbox" id="gUp" checked> Großbuchstaben</label>'
          + '<label style="font-size:11px"><input type="checkbox" id="gNum" checked> Zahlen</label>'
          + '<label style="font-size:11px"><input type="checkbox" id="gSym"> Symbole</label>'
          + '</div>'
          + '<button class="btn full" id="genGo" style="background:var(--p1);color:#000">Generieren</button>'
          + '<button class="btn sec full" id="genCopy" style="margin-top:6px">📋 Kopieren</button>'
          + '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-pwt]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.pwt; store.set("tab", tab); build(); });
      });

      if(tab === "safe"){
        var sel = container.querySelector("#catF");
        if(sel) sel.addEventListener("change", function(){ filter = this.value; store.set("filter", filter); build(); });

        container.querySelector("#pwNew").addEventListener("click", function(){
          var n = prompt("Name (z.B. Gmail):"); if(!n) return;
          var p = prompt("Passwort:"); if(!p) return;
          var c = prompt("Kategorie:", "Sonstige");
          var i = store.get("items", []); i.push({ name: n, pw: p, cat: c || "Sonstige", date: new Date().toLocaleString("de-DE") });
          store.set("items", i); build();
        });
        container.querySelectorAll("[data-copy]").forEach(el => el.addEventListener("click", function(){
          if(navigator.clipboard) navigator.clipboard.writeText(store.get("items",[])[parseInt(el.dataset.copy)].pw);
          if(HalDo.Notify) HalDo.Notify.success("Kopiert!");
        }));
        container.querySelectorAll("[data-del]").forEach(el => el.addEventListener("click", function(){
          if(!confirm("Löschen?")) return;
          var i = store.get("items", []); i.splice(parseInt(el.dataset.del), 1); store.set("items", i); build();
        }));
      }

      if(tab === "gen"){
        var genRes = container.querySelector("#genRes");
        var genLen = container.querySelector("#genLen");
        genLen.addEventListener("input", function(){ container.querySelector("#genLenV").textContent = this.value; });
        
        var doGen = function() {
          genRes.textContent = generate(parseInt(genLen.value), container.querySelector("#gUp").checked, container.querySelector("#gNum").checked, container.querySelector("#gSym").checked);
        };
        container.querySelector("#genGo").addEventListener("click", doGen);
        container.querySelector("#genCopy").addEventListener("click", function(){
          if(navigator.clipboard) navigator.clipboard.writeText(genRes.textContent);
          if(HalDo.Notify) HalDo.Notify.success("Kopiert!");
        });
      }
    }

    build();
  }

  HalDoApp("passwort", { name: "Passwort", icon: "🔐", render: render, category: "produktivitaet" });
  console.log("🦚 passwort.js v300 geladen — KATEGORIEN & GENERATOR");
})();
