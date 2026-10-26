/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — QR GENERATOR (v1.0)
   Text · URL · WLAN · Kontakt · E-Mail · SMS · Standort
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function loadQR(cb){
    if(window.QRCode) return cb();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";
    s.onload = function(){ cb(); };
    s.onerror = function(){ cb(new Error("QR-Lib konnte nicht geladen werden")); };
    document.head.appendChild(s);
  }

  function render(container, ctx){
    var store = ctx.store;
    var view = store.get("view", "menu");
    var qrTypes = [
      { id:"text",    icon:"📝", name:"Text",    color:"#4dd0e1" },
      { id:"url",     icon:"🔗", name:"URL",     color:"#4da8ff" },
      { id:"wifi",    icon:"📶", name:"WLAN",    color:"#66cc66" },
      { id:"contact", icon:"👤", name:"Kontakt", color:"#b478ff" },
      { id:"email",   icon:"✉️", name:"E-Mail",  color:"#ff6b6b" },
      { id:"sms",     icon:"💬", name:"SMS",     color:"#ffd54f" },
      { id:"geo",     icon:"📍", name:"Standort",color:"#ff8844" }
    ];

    function build(){
      if(view === "menu") screenMenu();
      else screenForm(view);
    }

    function screenMenu(){
      var html = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="font-size:44px">📱</div>'
        + '<div style="font-size:18px;font-weight:900;color:#4dd0e1;margin-top:6px">QR-Generator</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Erstelle QR-Codes für alles</div>'
        + '</div>';
      html += '<div class="card"><h3>Was willst du erzeugen?</h3><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">';
      qrTypes.forEach(function(t){
        html += '<button data-type="'+t.id+'" style="padding:14px;background:rgba(0,0,0,.2);border:1px solid '+t.color+'44;border-radius:10px;color:inherit;font-family:inherit;cursor:pointer;text-align:center">'
          + '<div style="font-size:26px">'+t.icon+'</div>'
          + '<div style="font-size:11px;font-weight:900;color:'+t.color+';margin-top:4px">'+t.name+'</div>'
          + '</button>';
      });
      html += '</div></div>';
      container.innerHTML = html;
      container.querySelectorAll("[data-type]").forEach(function(el){
        el.addEventListener("click", function(){ view = el.dataset.type; store.set("view", view); build(); });
      });
    }

    function screenForm(type){
      var t = qrTypes.find(function(x){ return x.id === type; });
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>'+t.icon+' '+t.name+'</h3>';

      if(type === "text" || type === "url"){
        html += '<div class="field"><label>'+(type==="url"?"URL":"Text")+'</label><textarea id="qr-content" rows="3" placeholder="'+(type==="url"?"https://...":"Text eingeben")+'" style="resize:vertical"></textarea></div>';
      } else if(type === "wifi"){
        html += '<div class="field"><label>WLAN-Name (SSID)</label><input id="qr-ssid" placeholder="MeinWLAN"></div>'
          + '<div class="field"><label>Passwort</label><input id="qr-pass" type="text" placeholder="••••••••"></div>'
          + '<div class="field"><label>Verschlüsselung</label><select id="qr-enc"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Offen</option></select></div>'
          + '<div class="field"><label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="qr-hidden" style="width:auto"> Verstecktes Netzwerk</label></div>';
      } else if(type === "contact"){
        html += '<div class="field"><label>Vorname</label><input id="qr-fn" placeholder="Max"></div>'
          + '<div class="field"><label>Nachname</label><input id="qr-ln" placeholder="Mustermann"></div>'
          + '<div class="field"><label>Telefon</label><input id="qr-tel" type="tel" placeholder="+49..."></div>'
          + '<div class="field"><label>E-Mail</label><input id="qr-mail" type="email" placeholder="max@example.com"></div>'
          + '<div class="field"><label>Organisation</label><input id="qr-org" placeholder="Firma"></div>';
      } else if(type === "email"){
        html += '<div class="field"><label>E-Mail</label><input id="qr-mail" type="email" placeholder="empfänger@example.com"></div>'
          + '<div class="field"><label>Betreff</label><input id="qr-subj" placeholder="Betreff"></div>'
          + '<div class="field"><label>Nachricht</label><textarea id="qr-body" rows="3"></textarea></div>';
      } else if(type === "sms"){
        html += '<div class="field"><label>Nummer</label><input id="qr-tel" type="tel" placeholder="+49..."></div>'
          + '<div class="field"><label>Nachricht</label><textarea id="qr-body" rows="3"></textarea></div>';
      } else if(type === "geo"){
        html += '<div class="field"><label>Breitengrad</label><input id="qr-lat" type="number" step="any" placeholder="52.520008"></div>'
          + '<div class="field"><label>Längengrad</label><input id="qr-lng" type="number" step="any" placeholder="13.404954"></div>'
          + '<div class="field"><label>Label (optional)</label><input id="qr-label" placeholder="Berlin"></div>'
          + '<button class="btn sec full" id="qr-gps" style="margin-top:6px">📍 Aktuellen Standort verwenden</button>';
      }

      html += '<button class="btn full" id="qr-gen" style="margin-top:10px">QR-Code erstellen</button>'
        + '</div>'
        + '<div id="qr-output"></div>';

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view="menu"; store.set("view","menu"); build(); });
      var gpsBtn = container.querySelector("#qr-gps");
      if(gpsBtn) gpsBtn.addEventListener("click", function(){
        if(!navigator.geolocation){ alert("GPS nicht verfügbar"); return; }
        navigator.geolocation.getCurrentPosition(function(pos){
          container.querySelector("#qr-lat").value = pos.coords.latitude.toFixed(6);
          container.querySelector("#qr-lng").value = pos.coords.longitude.toFixed(6);
          if(HalDo.Notify) HalDo.Notify.success("Standort übernommen");
        }, function(){ alert("GPS-Zugriff verweigert"); });
      });
      container.querySelector("#qr-gen").addEventListener("click", function(){ generate(type); });
    }

    function getContent(type){
      if(type === "text" || type === "url"){
        var v = container.querySelector("#qr-content").value.trim();
        return v;
      }
      if(type === "wifi"){
        var ssid = container.querySelector("#qr-ssid").value.trim();
        var pass = container.querySelector("#qr-pass").value;
        var enc = container.querySelector("#qr-enc").value;
        var hid = container.querySelector("#qr-hidden").checked;
        if(!ssid) return "";
        return "WIFI:T:" + enc + ";S:" + ssid + ";P:" + pass + ";" + (hid?"H:true;":"") + ";";
      }
      if(type === "contact"){
        var fn = container.querySelector("#qr-fn").value.trim();
        var ln = container.querySelector("#qr-ln").value.trim();
        var tel = container.querySelector("#qr-tel").value.trim();
        var mail = container.querySelector("#qr-mail").value.trim();
        var org = container.querySelector("#qr-org").value.trim();
        if(!fn && !ln && !tel) return "";
        return "BEGIN:VCARD\nVERSION:3.0\nN:" + ln + ";" + fn + ";;;\nFN:" + fn + " " + ln + "\nORG:" + org + "\nTEL:" + tel + "\nEMAIL:" + mail + "\nEND:VCARD";
      }
      if(type === "email"){
        var m = container.querySelector("#qr-mail").value.trim();
        var s = container.querySelector("#qr-subj").value.trim();
        var b = container.querySelector("#qr-body").value.trim();
        if(!m) return "";
        return "mailto:" + m + (s?"?subject="+encodeURIComponent(s):"") + (b?(s?"&":"?")+"body="+encodeURIComponent(b):"");
      }
      if(type === "sms"){
        var t = container.querySelector("#qr-tel").value.trim();
        var bo = container.querySelector("#qr-body").value.trim();
        if(!t) return "";
        return "smsto:" + t + ":" + bo;
      }
      if(type === "geo"){
        var lat = container.querySelector("#qr-lat").value;
        var lng = container.querySelector("#qr-lng").value;
        var lbl = container.querySelector("#qr-label").value.trim();
        if(!lat || !lng) return "";
        return "geo:" + lat + "," + lng + (lbl?"?q="+lat+","+lng+"("+encodeURIComponent(lbl)+")":"");
      }
      return "";
    }

    function generate(type){
      var content = getContent(type);
      if(!content){ alert("Bitte Felder ausfüllen"); return; }
      var out = container.querySelector("#qr-output");
      out.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-mute)">⏳ Erstelle QR...</div>';
      loadQR(function(err){
        if(err || !window.QRCode){
          out.innerHTML = '<div class="card" style="text-align:center;color:#ff8080">⚠️ QR-Bibliothek konnte nicht geladen werden. Prüfe deine Internetverbindung.</div>';
          return;
        }
        var canvas = document.createElement("canvas");
        QRCode.toCanvas(canvas, content, { width: 280, margin: 2, color: { dark:"#050810", light:"#ffffff" } }, function(err){
          if(err){ out.innerHTML = '<div class="card" style="color:#ff8080">Fehler: '+_esc(err.message)+'</div>'; return; }
          var dataUrl = canvas.toDataURL("image/png");
          out.innerHTML = '<div class="card" style="text-align:center">'
            + '<div style="background:#fff;padding:16px;border-radius:12px;display:inline-block;margin-bottom:10px"><img src="'+dataUrl+'" style="display:block;width:280px;height:280px;max-width:100%"></div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin:8px 0;word-break:break-all;font-family:monospace;padding:0 10px">'+_esc(content.substring(0,100))+(content.length>100?"...":"")+'</div>'
            + '<div style="display:flex;gap:6px">'
            + '<button class="btn" id="qr-save" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="qr-copy" style="flex:1">📋 Kopieren</button>'
            + '</div>'
            + '</div>';
          container.querySelector("#qr-save").addEventListener("click", function(){
            var a = document.createElement("a");
            a.href = dataUrl;
            a.download = "qrcode-" + Date.now() + ".png";
            a.click();
          });
          container.querySelector("#qr-copy").addEventListener("click", function(){
            canvas.toBlob(function(blob){
              if(navigator.clipboard && ClipboardItem){
                try {
                  navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                  if(HalDo.Notify) HalDo.Notify.success("QR kopiert");
                  return;
                } catch(e){}
              }
              // Fallback
              var t = document.createElement("textarea");
              t.value = content; document.body.appendChild(t); t.select();
              document.execCommand("copy"); document.body.removeChild(t);
              if(HalDo.Notify) HalDo.Notify.success("Inhalt kopiert");
            });
          });
        });
      });
    }

    build();
  }

  HalDoApp("qr", { name: "QR-Code", icon: "📱", render: render, category: "werkzeuge" });
  console.log("🦚 qr.js v1.0 geladen");
})();
