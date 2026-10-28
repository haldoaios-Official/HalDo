/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO BLITZER v22.0 (AI NAVIGATOR)
   Fahrzeuge (Pfau/Auto/Cyborg) · KI-Assistenten · Modern UI
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var LOGO_URL = "logo.png";
  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:14px;text-shadow:0 0 10px #ffd700,0 0 20px rgba(255,215,0,.8);background:#0a0e2a;padding:4px 8px;border-radius:6px;';
  console.log('%c🦚 HalDo Blitzer v22.0 — AI Navigator', GOLD_STYLE);

  var WELCOME = { /* ... (mehrsprachige Texte wie in v21.0) ... */ };

  var WELCOME_THEMES = { /* ... (Themes wie in v21.0) ... */ };

  var VEHICLES = {
    peacock: { name: "🦚 Pfau", build: buildUltraPeacockSVG },
    car: { name: "🏎️ Sportwagen", build: buildSportsCarSVG },
    cyborg: { name: "🤖 Cyborg", build: buildCyborgSVG }
  };

  var ASSISTANTS = {
    ai: { name: "HalDo AI", pitch: 1, rate: 1, effect: null },
    cyborg: { name: "HalDo Cyborg", pitch: 0.7, rate: 0.9, effect: "cyborg" },
    robot: { name: "HalDo Roboter", pitch: 0.5, rate: 0.85, effect: "robot" }
  };

  // ... (SVG-Builder für Fahrzeuge) ...

  function buildUltraPeacockSVG(size, uid) { /* ... (verbesserte Version mit 3D-Federn) ... */ }

  function buildSportsCarSVG(size, uid) {
    // Ein detaillierterer Sportwagen (inspiriert von modernen Hypercars)
    return `<svg viewBox="0 0 300 200" width="${size}" height="${size*200/300}" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 20px 40px rgba(0,0,0,0.6))">
      <defs>
        <linearGradient id="carBody_${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff3333"/>
          <stop offset="30%" stop-color="#cc0000"/>
          <stop offset="100%" stop-color="#660000"/>
        </linearGradient>
        <linearGradient id="glass_${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4dd0e1" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#0a2a4a"/>
        </linearGradient>
      </defs>
      <path d="M 40 130 Q 40 100 80 90 L 120 50 Q 150 30 180 50 L 220 90 Q 260 100 260 130 L 260 160 Q 260 170 250 170 L 50 170 Q 40 170 40 160 Z" fill="url(#carBody_${uid})" stroke="#ff8888" stroke-width="2"/>
      <path d="M 120 55 L 150 45 L 180 55 L 195 85 L 105 85 Z" fill="url(#glass_${uid})" opacity="0.9"/>
      <!-- Räder -->
      <circle cx="80" cy="165" r="22" fill="#111" stroke="#333" stroke-width="5"/>
      <circle cx="80" cy="165" r="12" fill="#666"/>
      <circle cx="220" cy="165" r="22" fill="#111" stroke="#333" stroke-width="5"/>
      <circle cx="220" cy="165" r="12" fill="#666"/>
      <!-- Details -->
      <rect x="250" y="110" width="15" height="8" rx="3" fill="#ff3333" opacity="0.8"/>
      <rect x="35" y="110" width="15" height="8" rx="3" fill="#ff3333" opacity="0.8"/>
    </svg>`;
  }

  function buildCyborgSVG(size, uid) {
    // Ein Hologramm-Roboter-Kopf mit leuchtenden Augen und Neon-Akzenten
    return `<svg viewBox="0 0 200 250" width="${size}" height="${size*250/200}" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 30px rgba(77,208,225,0.6))">
      <defs>
        <linearGradient id="metal_${uid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8899aa"/>
          <stop offset="50%" stop-color="#ccddee"/>
          <stop offset="100%" stop-color="#556677"/>
        </linearGradient>
        <filter id="glow_cyborg_${uid}"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <!-- Hals -->
      <rect x="85" y="170" width="30" height="40" fill="url(#metal_${uid})"/>
      <!-- Kopf -->
      <path d="M 50 100 Q 50 40 100 40 Q 150 40 150 100 L 150 160 Q 150 180 100 180 Q 50 180 50 160 Z" fill="url(#metal_${uid})" stroke="#4dd0e1" stroke-width="2"/>
      <!-- Visier -->
      <rect x="70" y="80" width="60" height="50" rx="10" fill="#0a0e1a" stroke="#4dd0e1" stroke-width="2"/>
      <!-- Augen -->
      <circle cx="85" cy="105" r="8" fill="#4dd0e1" filter="url(#glow_cyborg_${uid})"/>
      <circle cx="115" cy="105" r="8" fill="#4dd0e1" filter="url(#glow_cyborg_${uid})"/>
      <!-- Lichtstreifen -->
      <line x1="60" y1="150" x2="140" y2="150" stroke="#b478ff" stroke-width="3" opacity="0.8"/>
    </svg>`;
  }

  // ... (Restlicher Code: Audio-Engine, Render-Loop, etc.) ...

  var DEFAULT_SETTINGS = {
    // ... (bestehende Einstellungen) ...
    selectedVehicle: "peacock",
    selectedAssistant: "ai",
    vehicleColor: "#ff3333" // Standardfarbe für das Auto
  };

  function render(container, ctx) {
    // ... (State-Variablen) ...
    var gpsRetries = 0;
    var gpsRetryTimer = null;

    // ...

    function build() {
      var sc = view.screen;
      if(sc==="splash") screenSplash();
      else if(sc==="cockpit") screenCockpit();
      // ... (andere Screens) ...
    }

    function screenSplash() {
      var s = getSettings();
      var vehicle = VEHICLES[s.selectedVehicle] || VEHICLES.peacock;
      var charSVG = vehicle.build(280, "splash_" + s.selectedVehicle);
      
      // ... (Splash-Screen HTML mit charSVG) ...
    }

    function screenCockpit() {
      // ... (Cockpit-HTML) ...
      // Anzeige des gewählten Assistenten
      var assistant = ASSISTANTS[getSettings().selectedAssistant];
      html += `<div style="...">🤖 ${assistant.name}</div>`;
      // ...
    }

    function screenSettingsMenu() {
      // ... (Einstellungsmenü mit neuen Buttons für Fahrzeug & Assistent) ...
    }

    function screenSettingsVehicle() {
      var s = getSettings();
      var html = backBtn('settings') + `<div class="card"><h3>🚗 Fahrzeug wählen</h3>`;
      Object.keys(VEHICLES).forEach(function(k) {
        var v = VEHICLES[k];
        html += `<button data-vehicle="${k}" style="...">${v.name}</button>`;
      });
      // Farbauswahl für das Auto
      if (s.selectedVehicle === 'car') {
        html += `<div class="field"><label>Farbe</label><input type="color" id="carColor" value="${s.vehicleColor}"></div>`;
      }
      html += `</div>`;
      container.innerHTML = html; bindNav();
      // Event-Listener zum Speichern
    }

    function screenSettingsAssistant() {
      var s = getSettings();
      var html = backBtn('settings') + `<div class="card"><h3>🤖 KI-Assistent wählen</h3>`;
      Object.keys(ASSISTANTS).forEach(function(k) {
        var a = ASSISTANTS[k];
        html += `<button data-assistant="${k}" style="...">${a.name}</button>`;
      });
      // Button zum Testen der Stimme
      html += `<button id="testAssistant">🔊 Stimme testen</button></div>`;
      container.innerHTML = html; bindNav();
      // Event-Listener zum Speichern und Testen
    }

    // ...

    function speak(text) {
      if (!window.speechSynthesis) return;
      var s = getSettings();
      var assistant = ASSISTANTS[s.selectedAssistant] || ASSISTANTS.ai;
      
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS[s.lang].code;
      u.pitch = assistant.pitch;
      u.rate = assistant.rate;

      // Einfacher "Roboter"-Effekt durch tiefere Tonlage
      if (assistant.effect === "robot") {
        u.pitch = 0.4;
      } else if (assistant.effect === "cyborg") {
        // Hier könnte man später einen echten Hall-Effekt einbauen
        u.pitch = 0.6;
      }

      window.speechSynthesis.speak(u);
    }

    // ... (GPS-Initialisierung mit Retry-Logik) ...
    function startGeo() {
      if (!navigator.geolocation) return;
      
      function onSuccess(pos) {
        lastPos = pos;
        gpsRetries = 0; // Zurücksetzen bei Erfolg
        if (gpsRetryTimer) { clearInterval(gpsRetryTimer); gpsRetryTimer = null; }
        checkTriggers(pos);
        // ... (UI-Update) ...
      }

      function onError(err) {
        console.warn("GPS Fehler:", err.message);
        gpsRetries++;
        if (gpsRetries < 5) {
          // Neuer Versuch nach 5 Sekunden
          if (!gpsRetryTimer) {
            gpsRetryTimer = setTimeout(function() {
              startGeo();
            }, 5000);
          }
        } else {
          // Alle Versuche fehlgeschlagen -> Button anzeigen
          if (view.screen === "cockpit") {
            var btn = container.querySelector("#gpsRetryBtn");
            if (btn) btn.style.display = "block";
          }
        }
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 10000, // Akzeptiere Positionen bis zu 10s alt
        timeout: 10000     // 10s Timeout
      });
    }

    // ...

    // Initialisierung
    // ...
    startGeo();
    build();
  }

  HalDoApp("blitzer", { name:"HalDo Blitzer", icon:"⚠️", render:render, category:"werkzeuge" });
  console.log('%c🦚 HalDo Blitzer v22.0 — AI Navigator bereit', GOLD_STYLE);
})();
