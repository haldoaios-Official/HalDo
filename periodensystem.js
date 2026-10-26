/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PERIODENSYSTEM (v1.0)
   118 Elemente · Suche · Detail · Kategorien
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  // Elements: [Z, Sym, Name, Kategorie, Atommasse, Gruppe, Periode]
  // Categories: ak=Alkalimetall, ee=Erdalkali, ue=Übergangsmetall, hm=Halbmetall,
  //             nm=Nichtmetall, hg=Halogen, eg=Edelgas, ln=Lanthanid, an=Aktinid,
  //             ub=Unbekannt
  var ELEMENTS = [
    [1,"H","Wasserstoff","nm",1.008,1,1],[2,"He","Helium","eg",4.003,18,1],
    [3,"Li","Lithium","ak",6.94,1,2],[4,"Be","Beryllium","ee",9.012,2,2],[5,"B","Bor","hm",10.81,13,2],[6,"C","Kohlenstoff","nm",12.011,14,2],[7,"N","Stickstoff","nm",14.007,15,2],[8,"O","Sauerstoff","nm",15.999,16,2],[9,"F","Fluor","hg",18.998,17,2],[10,"Ne","Neon","eg",20.180,18,2],
    [11,"Na","Natrium","ak",22.990,1,3],[12,"Mg","Magnesium","ee",24.305,2,3],[13,"Al","Aluminium","ue",26.982,13,3],[14,"Si","Silizium","hm",28.085,14,3],[15,"P","Phosphor","nm",30.974,15,3],[16,"S","Schwefel","nm",32.06,16,3],[17,"Cl","Chlor","hg",35.45,17,3],[18,"Ar","Argon","eg",39.948,18,3],
    [19,"K","Kalium","ak",39.098,1,4],[20,"Ca","Calcium","ee",40.078,2,4],[21,"Sc","Scandium","ue",44.956,3,4],[22,"Ti","Titan","ue",47.867,4,4],[23,"V","Vanadium","ue",50.942,5,4],[24,"Cr","Chrom","ue",51.996,6,4],[25,"Mn","Mangan","ue",54.938,7,4],[26,"Fe","Eisen","ue",55.845,8,4],[27,"Co","Cobalt","ue",58.933,9,4],[28,"Ni","Nickel","ue",58.693,10,4],[29,"Cu","Kupfer","ue",63.546,11,4],[30,"Zn","Zink","ue",65.38,12,4],[31,"Ga","Gallium","ue",69.723,13,4],[32,"Ge","Germanium","hm",72.630,14,4],[33,"As","Arsen","hm",74.922,15,4],[34,"Se","Selen","nm",78.971,16,4],[35,"Br","Brom","hg",79.904,17,4],[36,"Kr","Krypton","eg",83.798,18,4],
    [37,"Rb","Rubidium","ak",85.468,1,5],[38,"Sr","Strontium","ee",87.62,2,5],[39,"Y","Yttrium","ue",88.906,3,5],[40,"Zr","Zirkonium","ue",91.224,4,5],[41,"Nb","Niob","ue",92.906,5,5],[42,"Mo","Molybdän","ue",95.95,6,5],[43,"Tc","Technetium","ue",98,7,5],[44,"Ru","Ruthenium","ue",101.07,8,5],[45,"Rh","Rhodium","ue",102.906,9,5],[46,"Pd","Palladium","ue",106.42,10,5],[47,"Ag","Silber","ue",107.868,11,5],[48,"Cd","Cadmium","ue",112.414,12,5],[49,"In","Indium","ue",114.818,13,5],[50,"Sn","Zinn","ue",118.710,14,5],[51,"Sb","Antimon","hm",121.760,15,5],[52,"Te","Tellur","hm",127.60,16,5],[53,"I","Iod","hg",126.904,17,5],[54,"Xe","Xenon","eg",131.293,18,5],
    [55,"Cs","Caesium","ak",132.905,1,6],[56,"Ba","Barium","ee",137.327,2,6],[57,"La","Lanthan","ln",138.905,3,6],[58,"Ce","Cer","ln",140.116,4,6],[59,"Pr","Praseodym","ln",140.908,5,6],[60,"Nd","Neodym","ln",144.242,6,6],[61,"Pm","Promethium","ln",145,7,6],[62,"Sm","Samarium","ln",150.36,8,6],[63,"Eu","Europium","ln",151.964,9,6],[64,"Gd","Gadolinium","ln",157.25,10,6],[65,"Tb","Terbium","ln",158.925,11,6],[66,"Dy","Dysprosium","ln",162.500,12,6],[67,"Ho","Holmium","ln",164.930,13,6],[68,"Er","Erbium","ln",167.259,14,6],[69,"Tm","Thulium","ln",168.934,15,6],[70,"Yb","Ytterbium","ln",173.045,16,6],[71,"Lu","Lutetium","ln",174.967,17,6],[72,"Hf","Hafnium","ue",178.486,4,6],[73,"Ta","Tantal","ue",180.948,5,6],[74,"W","Wolfram","ue",183.84,6,6],[75,"Re","Rhenium","ue",186.207,7,6],[76,"Os","Osmium","ue",190.23,8,6],[77,"Ir","Iridium","ue",192.217,9,6],[78,"Pt","Platin","ue",195.084,10,6],[79,"Au","Gold","ue",196.967,11,6],[80,"Hg","Quecksilber","ue",200.592,12,6],[81,"Tl","Thallium","ue",204.38,13,6],[82,"Pb","Blei","ue",207.2,14,6],[83,"Bi","Bismut","ue",208.980,15,6],[84,"Po","Polonium","hm",209,16,6],[85,"At","Astat","hg",210,17,6],[86,"Rn","Radon","eg",222,18,6],
    [87,"Fr","Francium","ak",223,1,7],[88,"Ra","Radium","ee",226,2,7],[89,"Ac","Actinium","an",227,3,7],[90,"Th","Thorium","an",232.037,4,7],[91,"Pa","Protactinium","an",231.035,5,7],[92,"U","Uran","an",238.028,6,7],[93,"Np","Neptunium","an",237,7,7],[94,"Pu","Plutonium","an",244,8,7],[95,"Am","Americium","an",243,9,7],[96,"Cm","Curium","an",247,10,7],[97,"Bk","Berkelium","an",247,11,7],[98,"Cf","Californium","an",251,12,7],[99,"Es","Einsteinium","an",252,13,7],[100,"Fm","Fermium","an",257,14,7],[101,"Md","Mendelevium","an",258,15,7],[102,"No","Nobelium","an",259,16,7],[103,"Lr","Lawrencium","an",266,17,7],[104,"Rf","Rutherfordium","ue",267,4,7],[105,"Db","Dubnium","ue",268,5,7],[106,"Sg","Seaborgium","ue",269,6,7],[107,"Bh","Bohrium","ue",270,7,7],[108,"Hs","Hassium","ue",269,8,7],[109,"Mt","Meitnerium","ue",278,9,7],[110,"Ds","Darmstadtium","ue",281,10,7],[111,"Rg","Röntgenium","ue",282,11,7],[112,"Cn","Copernicium","ue",285,12,7],[113,"Nh","Nihonium","ue",286,13,7],[114,"Fl","Flerovium","ue",289,14,7],[115,"Mc","Moscovium","ue",290,15,7],[116,"Lv","Livermorium","ue",293,16,7],[117,"Ts","Tenness","hg",294,17,7],[118,"Og","Oganesson","eg",294,18,7]
  ];
  var CATS = {
    ak:{name:"Alkalimetall", color:"#ff5555"},
    ee:{name:"Erdalkali", color:"#ff9800"},
    ue:{name:"Übergangsmetall", color:"#ffd54f"},
    hm:{name:"Halbmetall", color:"#66cc66"},
    nm:{name:"Nichtmetall", color:"#4dd0e1"},
    hg:{name:"Halogen", color:"#4da8ff"},
    eg:{name:"Edelgas", color:"#b478ff"},
    ln:{name:"Lanthanid", color:"#ff6b9d"},
    an:{name:"Aktinid", color:"#a78bfa"}
  };

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", query:"", selected:null };

    function build(){
      if(view.screen === "detail") screenDetail();
      else screenGrid();
    }

    function screenGrid(){
      var q = view.query.toLowerCase();
      var filtered = ELEMENTS.filter(function(e){
        if(!q) return true;
        return String(e[0]).indexOf(q)>=0 || e[1].toLowerCase().indexOf(q)>=0 || e[2].toLowerCase().indexOf(q)>=0;
      });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(77,208,225,.1));border:1px solid rgba(180,120,255,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<div><div style="font-size:16px;font-weight:900;color:#b478ff">🧬 Periodensystem</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">118 Elemente · '+filtered.length+' angezeigt</div></div>'
        + '</div>'
        + '<input id="psSearch" placeholder="🔍 Symbol oder Name..." value="'+_esc(view.query)+'" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + '</div>';

      if(!q){
        // Mini grid first 20 for quick access
        html += '<div class="card"><h3>Schnellzugriff (Häufige)</h3><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">';
        [1,6,7,8,11,12,13,14,15,16,17,19,20,26,29,30,47,79,80,82].forEach(function(z){
          var e = ELEMENTS[z-1];
          var cat = CATS[e[3]] || {color:"#888"};
          html += '<button data-el="'+e[0]+'" style="padding:6px 2px;background:'+cat.color+'22;border:1px solid '+cat.color+'55;border-radius:6px;cursor:pointer;color:'+cat.color+';font-family:inherit;text-align:center"><div style="font-size:14px;font-weight:900">'+e[1]+'</div><div style="font-size:7.5px;color:var(--text-mute);margin-top:1px">'+e[0]+'</div></button>';
        });
        html += '</div></div>';
      }

      html += '<div class="card"><h3>Alle Elemente</h3><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px">';
      filtered.forEach(function(e){
        var cat = CATS[e[3]] || {color:"#888"};
        html += '<button data-el="'+e[0]+'" style="padding:5px 1px;background:'+cat.color+'22;border:1px solid '+cat.color+'55;border-radius:5px;cursor:pointer;color:'+cat.color+';font-family:inherit;text-align:center;min-height:40px"><div style="font-size:12px;font-weight:900">'+e[1]+'</div><div style="font-size:7px;color:var(--text-mute);margin-top:1px">'+e[0]+'</div></button>';
      });
      html += '</div></div>';

      container.innerHTML = html;
      var s = container.querySelector("#psSearch");
      s.addEventListener("input", function(){ view.query = s.value; screenGrid(); setTimeout(function(){ var n = container.querySelector("#psSearch"); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); } }, 0); });
      container.querySelectorAll("[data-el]").forEach(function(el){
        el.addEventListener("click", function(){ view.selected = parseInt(el.dataset.el); view.screen = "detail"; screenDetail(); });
      });
    }

    function screenDetail(){
      var z = view.selected;
      var e = ELEMENTS[z-1];
      if(!e) return screenGrid();
      var cat = CATS[e[3]] || {name:"Unbekannt", color:"#888"};
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card" style="background:linear-gradient(135deg,'+cat.color+'22,'+cat.color+'11);border:1px solid '+cat.color+'66;text-align:center">'
        + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">'+e[0]+'</div>'
        + '<div style="font-size:64px;font-weight:900;color:'+cat.color+';line-height:1;margin:4px 0">'+e[1]+'</div>'
        + '<div style="font-size:16px;font-weight:900;margin-top:6px">'+_esc(e[2])+'</div>'
        + '<div style="font-size:11px;color:'+cat.color+';font-weight:800;margin-top:2px">'+cat.name+'</div>'
        + '</div>';

      html += '<div class="card"><h3>Daten</h3>'
        + row("Atommasse", e[4] + " u")
        + row("Gruppe", e[5])
        + row("Periode", e[6])
        + row("Kategorie", cat.name)
        + '</div>';

      // Navigation
      var prev = z > 1 ? z-1 : 118;
      var next = z < 118 ? z+1 : 1;
      html += '<div class="card" style="display:flex;gap:6px">'
        + '<button data-el="'+prev+'" class="btn sec" style="flex:1;padding:12px">← '+(ELEMENTS[prev-1][1])+'</button>'
        + '<button data-el="'+next+'" class="btn sec" style="flex:1;padding:12px">'+(ELEMENTS[next-1][1])+' →</button>'
        + '</div>';

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "list"; screenGrid(); });
      container.querySelectorAll("[data-el]").forEach(function(el){
        el.addEventListener("click", function(){ view.selected = parseInt(el.dataset.el); screenDetail(); });
      });
    }

    function row(k, v){
      return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px"><span style="color:var(--text-mute)">'+k+'</span><span style="font-weight:800;color:var(--p1)">'+v+'</span></div>';
    }
    function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

    build();
  }

  HalDoApp("periodensystem", { name: "Periodensystem", icon: "🧬", render: render, category: "bildung" });
  console.log("🦚 periodensystem.js v1.0 geladen");
})();
