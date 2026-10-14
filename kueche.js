/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KÜCHE APP (v150)
   Rezepte · Einkaufsliste · Vorrat · Mahlzeitenplan
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var RECIPES = [
    {
      id: "r1",
      cat: "🦚 Ezidisch",
      title: "Kutilk (Gefüllte Teigbällchen)",
      time: 90,
      portions: 4,
      ing: ["500g Hackfleisch", "2 Zwiebeln", "1 Tasse Reis", "500g Mehl", "Salz, Pfeffer", "Wasser"],
      steps: [
        "Reis 30 Min. einweichen.",
        "Hackfleisch mit Zwiebeln anbraten.",
        "Teig aus Mehl, Wasser und Salz kneten.",
        "Kleine Kugeln formen, mit Fleisch füllen.",
        "In Salzwasser 20 Min. kochen.",
        "Mit Joghurt servieren."
      ]
    },
    {
      id: "r2",
      cat: "🦚 Ezidisch",
      title: "Dolma (Gefüllte Weinblätter)",
      time: 120,
      portions: 6,
      ing: ["300g Weinblätter", "300g Reis", "200g Hackfleisch", "Zwiebeln", "Tomatenmark", "Gewürze"],
      steps: [
        "Reis und Hackfleisch mischen.",
        "Weinblätter kurz brühen.",
        "Füllung auf Blätter, aufrollen.",
        "In Topf schichten, mit Wasser bedecken.",
        "1 Std. köcheln lassen."
      ]
    },
    {
      id: "r3",
      cat: "🍲 Suppen",
      title: "Linsen-Suppe",
      time: 45,
      portions: 4,
      ing: ["250g rote Linsen", "1 Zwiebel", "2 Karotten", "1 Kartoffel", "Kreuzkümmel", "Zitrone"],
      steps: [
        "Zwiebel und Gemüse anbraten.",
        "Linsen und Wasser zugeben.",
        "30 Min. köcheln.",
        "Pürieren, mit Zitrone abschmecken."
      ]
    },
    {
      id: "r4",
      cat: "🍲 Suppen",
      title: "Hühnersuppe",
      time: 60,
      portions: 4,
      ing: ["1 Huhn", "Karotten", "Lauch", "Zwiebel", "Nudeln", "Salz, Pfeffer"],
      steps: [
        "Huhn mit Gemüse in Wasser aufsetzen.",
        "1 Std. köcheln lassen.",
        "Fleisch herausnehmen, klein schneiden.",
        "Brühe abseihen, Nudeln kochen.",
        "Alles zusammen servieren."
      ]
    },
    {
      id: "r5",
      cat: "🍚 Hauptgerichte",
      title: "Reis mit Hähnchen",
      time: 40,
      portions: 4,
      ing: ["2 Tassen Basmatireis", "500g Hähnchenbrust", "Zwiebel", "Kurkuma", "Butter"],
      steps: [
        "Hähnchen in Streifen schneiden.",
        "Mit Zwiebel und Gewürzen anbraten.",
        "Reis waschen, zugeben.",
        "Mit Wasser kochen.",
        "20 Min. quellen lassen."
      ]
    },
    {
      id: "r6",
      cat: "🍚 Hauptgerichte",
      title: "Kebab (Hackfleisch-Spieße)",
      time: 35,
      portions: 4,
      ing: ["500g Hackfleisch", "1 Zwiebel", "Petersilie", "Gewürze", "Fladenbrot"],
      steps: [
        "Hackfleisch mit Zwiebel und Gewürzen kneten.",
        "30 Min. kühlen.",
        "Auf Spieße formen.",
        "Grillen oder braten.",
        "Mit Fladenbrot servieren."
      ]
    },
    {
      id: "r7",
      cat: "🥗 Salate",
      title: "Fattoush",
      time: 15,
      portions: 4,
      ing: ["Tomaten", "Gurken", "Radieschen", "Minze", "Fladenbrot", "Sumach", "Olivenöl"],
      steps: [
        "Gemüse klein schneiden.",
        "Fladenbrot rösten, brechen.",
        "Alles mischen.",
        "Mit Sumach, Olivenöl, Zitrone würzen."
      ]
    },
    {
      id: "r8",
      cat: "🥗 Salate",
      title: "Tabouleh",
      time: 20,
      portions: 4,
      ing: ["1 Bund Petersilie", "1 Bund Minze", "Bulgur", "Tomaten", "Zitrone", "Olivenöl"],
      steps: [
        "Bulgur mit heißem Wasser quellen.",
        "Kräuter fein hacken.",
        "Alles mischen.",
        "Mit Zitrone und Öl abschmecken."
      ]
    },
    {
      id: "r9",
      cat: "🍰 Desserts",
      title: "Baklava",
      time: 60,
      portions: 12,
      ing: ["500g Filoteig", "300g Walnüsse", "250g Butter", "300g Zucker", "200ml Wasser", "Zitrone"],
      steps: [
        "Filoteig schichten mit Butter.",
        "Nüsse dazwischen verteilen.",
        "In Rauten schneiden.",
        "Bei 180°C 45 Min. backen.",
        "Sirup aus Zucker, Wasser, Zitrone kochen.",
        "Heiß über die Baklava gießen."
      ]
    },
    {
      id: "r10",
      cat: "🍰 Desserts",
      title: "Knafeh",
      time: 45,
      portions: 8,
      ing: ["500g Kadayif-Teig", "500g Käse", "200g Butter", "Zuckersirup", "Pistazien"],
      steps: [
        "Teig mit Butter anbraten.",
        "Hälfte in Form, Käse drauf, Rest drüber.",
        "Bei 180°C 30 Min. backen.",
        "Mit Sirup übergießen.",
        "Pistazien darüber."
      ]
    }
  ];

  var CATS = ["🦚 Ezidisch", "🍲 Suppen", "🍚 Hauptgerichte", "🥗 Salate", "🍰 Desserts"];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "rezepte");

    function build(){
      var body = "";

      /* ═══ REZEPTE ═══ */
      if(tab === "rezepte"){
        body = '<div class="card"><h3>🍳 Rezepte (' + RECIPES.length + ')</h3>';
        CATS.forEach(function(cat){
          var list = RECIPES.filter(function(r){ return r.cat === cat; });
          if(!list.length) return;
          body += '<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">' + cat + ' (' + list.length + ')</div>';
          list.forEach(function(r){
            body += '<div data-recipe="' + r.id + '" style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;cursor:pointer;border-left:3px solid var(--p1)">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p1)">' + _esc(r.title) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">⏱️ ' + r.time + ' min · 👥 ' + r.portions + ' Portionen · 🥘 ' + r.ing.length + ' Zutaten</div>'
              + '</div>';
          });
          body += '</div>';
        });
        body += '</div>';
        body += '<div id="recipeView"></div>';

      /* ═══ EINKAUF ═══ */
      } else if(tab === "einkauf"){
        var items = store.get("shopping", []);
        var done = items.filter(function(i){ return i.done; }).length;
        body = '<div class="card"><h3>🛒 Einkaufsliste (' + done + '/' + items.length + ')</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="shAdd" placeholder="Artikel..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="shAddBtn" style="padding:10px 18px">+</button>'
          + '</div>';
        if(items.length){
          items.forEach(function(item, idx){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:center">'
              + '<input type="checkbox" data-shd="' + idx + '" ' + (item.done?"checked":"") + ' style="width:20px;height:20px;accent-color:var(--p1);cursor:pointer">'
              + '<div style="flex:1;font-size:13px;font-weight:700;' + (item.done?"text-decoration:line-through;color:var(--text-mute)":"") + '">' + _esc(item.text) + '</div>'
              + '<button data-shdel="' + idx + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
          if(done > 0){
            body += '<button class="btn danger full" id="shClear" style="margin-top:10px">🗑️ Erledigte löschen</button>';
          }
        } else {
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Liste leer</div>';
        }
        body += '</div>';

      /* ═══ VORRAT ═══ */
      } else if(tab === "vorrat"){
        var stock = store.get("stock", []);
        body = '<div class="card"><h3>📦 Vorrat (' + stock.length + ')</h3>'
          + '<div class="field"><label>Artikel</label><input type="text" id="stItem" placeholder="z.B. Mehl"></div>'
          + '<div class="field"><label>Menge</label><input type="text" id="stQty" placeholder="z.B. 500g"></div>'
          + '<button class="btn full" id="stAdd">💾 Hinzufügen</button>'
          + '</div>';
        if(stock.length){
          body += '<div class="card"><h3>📋 Bestand</h3>';
          stock.forEach(function(s, idx){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:13px;font-weight:800">' + _esc(s.item) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(s.qty) + '</div></div>'
              + '<button data-stdel="' + idx + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
          body += '</div>';
        }

      /* ═══ MAHLZEITEN ═══ */
      } else if(tab === "mahlzeiten"){
        var meals = store.get("meals", {});
        var days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
        body = '<div class="card"><h3>📅 Wochenplan</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Klick auf einen Tag → Rezept auswählen</div>';
        days.forEach(function(day){
          var meal = meals[day] || "—";
          body += '<div data-meal="' + day + '" style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center">'
            + '<div><div style="font-size:12px;font-weight:900;color:var(--p1)">' + day + '</div>'
            + '<div style="font-size:11px;color:var(--text-dim);margin-top:2px">' + _esc(meal) + '</div></div>'
            + '<div style="font-size:14px;color:var(--text-mute)">›</div>'
            + '</div>';
        });
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="rezepte"?" active":"") + '" data-kt="rezepte">🍳 Rezepte</button>'
        + '<button class="tab' + (tab==="einkauf"?" active":"") + '" data-kt="einkauf">🛒 Einkauf</button>'
        + '<button class="tab' + (tab==="vorrat"?" active":"") + '" data-kt="vorrat">📦 Vorrat</button>'
        + '<button class="tab' + (tab==="mahlzeiten"?" active":"") + '" data-kt="mahlzeiten">📅 Plan</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-kt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.kt;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Rezept öffnen ═══ */
      if(tab === "rezepte"){
        container.querySelectorAll("[data-recipe]").forEach(function(el){
          el.addEventListener("click", function(){
            var r = RECIPES.find(function(x){ return x.id === el.dataset.recipe; });
            if(!r) return;
            var view = container.querySelector("#recipeView");
            var h = '<div class="card"><h3>🍳 ' + _esc(r.title) + '</h3>'
              + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:12px">⏱️ ' + r.time + ' min · 👥 ' + r.portions + ' Portionen</div>';
            h += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:12px;border-left:3px solid var(--p1)">'
              + '<div style="font-size:11px;font-weight:900;color:var(--p1);margin-bottom:8px">🛒 ZUTATEN</div>';
            r.ing.forEach(function(ing){
              h += '<div style="font-size:12px;color:var(--text-dim);padding:3px 0">• ' + _esc(ing) + '</div>';
            });
            h += '</div>';
            h += '<div style="padding:12px;background:rgba(180,120,255,.08);border-radius:10px;border-left:3px solid var(--p3)">'
              + '<div style="font-size:11px;font-weight:900;color:var(--p3);margin-bottom:8px">👨‍🍳 ZUBEREITUNG</div>';
            r.steps.forEach(function(step, i){
              h += '<div style="font-size:12px;color:var(--text-dim);padding:4px 0;line-height:1.55"><b style="color:var(--p3)">' + (i+1) + '.</b> ' + _esc(step) + '</div>';
            });
            h += '</div>';
            h += '<div style="display:flex;gap:8px;margin-top:12px">'
              + '<button class="btn" id="rToShopping" style="flex:1">🛒 Zutaten zur Liste</button>'
              + '<button class="btn sec" id="rSpeak" style="flex:1">🔊 Vorlesen</button>'
              + '</div>'
              + '<button class="btn sec full" id="rClose" style="margin-top:8px">✕ Schließen</button>'
              + '</div>';
            view.innerHTML = h;
            view.querySelector("#rToShopping").addEventListener("click", function(){
              var items = store.get("shopping", []);
              r.ing.forEach(function(ing){
                items.push({ text: ing, done: false });
              });
              store.set("shopping", items);
              if(window.HalDo.Notify) HalDo.Notify.info(r.ing.length + " Zutaten zur Einkaufsliste", { app: "kueche" });
              alert("✅ " + r.ing.length + " Zutaten hinzugefügt!");
            });
            view.querySelector("#rSpeak").addEventListener("click", function(){
              if(!window.HalDo.Voice) return;
              var txt = r.title + ". Zutaten: " + r.ing.join(", ") + ". Zubereitung: " + r.steps.join(". ");
              HalDo.Voice.speak(txt);
            });
            view.querySelector("#rClose").addEventListener("click", function(){
              view.innerHTML = "";
            });
            view.scrollIntoView({ behavior: "smooth" });
          });
        });
      }

      /* ═══ Einkauf ═══ */
      if(tab === "einkauf"){
        var items = store.get("shopping", []);
        container.querySelector("#shAddBtn").addEventListener("click", function(){
          var t = container.querySelector("#shAdd").value.trim();
          if(!t) return;
          items.push({ text: t, done: false });
          store.set("shopping", items);
          build();
        });
        container.querySelector("#shAdd").addEventListener("keydown", function(e){
          if(e.key === "Enter") container.querySelector("#shAddBtn").click();
        });
        container.querySelectorAll("[data-shd]").forEach(function(el){
          el.addEventListener("change", function(){
            var i = parseInt(el.dataset.shd);
            items[i].done = !items[i].done;
            store.set("shopping", items);
            build();
          });
        });
        container.querySelectorAll("[data-shdel]").forEach(function(el){
          el.addEventListener("click", function(){
            items.splice(parseInt(el.dataset.shdel), 1);
            store.set("shopping", items);
            build();
          });
        });
        var clr = container.querySelector("#shClear");
        if(clr) clr.addEventListener("click", function(){
          store.set("shopping", items.filter(function(i){ return !i.done; }));
          build();
        });
      }

      /* ═══ Vorrat ═══ */
      if(tab === "vorrat"){
        var stock = store.get("stock", []);
        container.querySelector("#stAdd").addEventListener("click", function(){
          var item = container.querySelector("#stItem").value.trim();
          var qty = container.querySelector("#stQty").value.trim();
          if(!item) return;
          stock.push({ item: item, qty: qty });
          store.set("stock", stock);
          build();
        });
        container.querySelectorAll("[data-stdel]").forEach(function(el){
          el.addEventListener("click", function(){
            stock.splice(parseInt(el.dataset.stdel), 1);
            store.set("stock", stock);
            build();
          });
        });
      }

      /* ═══ Mahlzeiten ═══ */
      if(tab === "mahlzeiten"){
        var meals = store.get("meals", {});
        container.querySelectorAll("[data-meal]").forEach(function(el){
          el.addEventListener("click", function(){
            var day = el.dataset.meal;
            /* Rezept-Auswahl Dialog */
            var recipeList = RECIPES.map(function(r){ return r.title; });
            var choice = prompt("Rezept für " + day + " wählen:\n\n" + recipeList.map(function(t, i){ return (i+1) + ". " + t; }).join("\n"));
            if(!choice) return;
            var idx = parseInt(choice) - 1;
            if(idx >= 0 && idx < RECIPES.length){
              meals[day] = RECIPES[idx].title;
              store.set("meals", meals);
              build();
            }
          });
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("kueche", { render: render });
  else console.warn("kueche.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 kueche.js geladen");
