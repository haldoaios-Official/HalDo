/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — EINSTELLUNGEN (v172)
   Home-Stil · Avatar · Stimme (Eigene!) · API Keys · etc.
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  var VOICE_PRESETS = [
    { id: "mann",     name: "👨 Mann",         desc: "Tief, männlich",     rate: 0.9, pitch: 0.8 },
    { id: "frau",     name: "👩 Frau",         desc: "Klar, weiblich",     rate: 1.0, pitch: 1.2 },
    { id: "kind",     name: "🧒 Kind",         desc: "Jung, hoch",         rate: 1.1, pitch: 1.5 },
    { id: "senior",   name: "👴 Senior",       desc: "Älter, langsam",     rate: 0.8, pitch: 0.7 },
    { id: "ai",       name: "🤖 AI",           desc: "Neutral, digital",   rate: 1.0, pitch: 1.0 },
    { id: "ki",       name: "🧠 KI",           desc: "Klar, intelligent",  rate: 1.05, pitch: 1.1 },
    { id: "roboter",  name: "🦾 Roboter",      desc: "Metallisch, tief",   rate: 0.95, pitch: 0.6 },
    { id: "cyborg",   name: "⚡ Cyborg",       desc: "Sci-Fi Mix",         rate: 1.0, pitch: 1.3 },
    { id: "haldo",    name: "🦚 HalDo Voice",  desc: "Original HalDo",     rate: 1.0, pitch: 1.0 },
    { id: "eigene",   name: "🎙️ Eigene Stimme", desc: "Dein Voice-Klon",    rate: 1.0, pitch: 1.0 }
  ];

  function render(container, ctx){
    var store = ctx.store;

    function build(){
      var allApps = HalDo.Apps.listInstalled();
      var userName = HalDo.Store.get("userName", "Bruder");
      var userEmail = HalDo.Store.get("userEmail", "Halil@haldo.ai");
      var theme = window.HalDoTheme ? HalDoTheme.get() : "peacock";
      var lang = HalDo.Store.get("lang", "de");
      var voiceEnabled = HalDo.Store.get("voiceEnabled", true);
      var voicePreset = HalDo.Store.get("voicePreset", "haldo");
      var voiceRate = HalDo.Store.get("voiceRate", 1);
      var voicePitch = HalDo.Store.get("voicePitch", 1);
      var voiceVolume = HalDo.Store.get("voiceVolume", 1);
      var voiceEngine = HalDo.Store.get("voiceEngine", "browser");
      var elevenVoiceId = HalDo.Store.get("elevenVoiceId", "");
      var voiceSample = HalDo.Store.get("voiceSample", null);
      var notifyEnabled = HalDo.Store.get("notifyEnabled", true);
      var soundEnabled = HalDo.Store.get("soundEnabled", true);
      var vibrateEnabled = HalDo.Store.get("vibrateEnabled", false);
      var brightness = HalDo.Store.get("displayBrightness", 100);
      var autoBright = HalDo.Store.get("autoBrightness", true);
      var wifi = HalDo.Store.get("wifi", true);
      var bluetooth = HalDo.Store.get("bluetooth", false);
      var carMode = HalDo.Store.get("carMode", false);
      var carplayMode = HalDo.Store.get("carplayMode", false);
      var privacyLevel = HalDo.Store.get("privacyLevel", "mittel");

      var homeStyle = HalDo.Store.get("homeStyle", "solar");
      var avatarVisible = HalDo.Store.get("avatarVisible", true);
      var avatarFloating = HalDo.Store.get("avatarFloating", true);
      var avatarMode = HalDo.Store.get("avatarMode", "human");

      /* API KEYS */
      var aiKeys = HalDo.Store.get("aiKeys", {
        groqKey: "", geminiKey: "", hfKey: "", elevenKey: "",
        sunoKey: "", replicateKey: "", model: "openai/gpt-oss-120b",
        systemPrompt: "Du bist HalDo, ein freundlicher KI-Assistent."
      });

      var body = '';

      /* ═══════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
        + '<div style="font-size:22px;font-weight:900;color:var(--p1)">⚙️ Einstellungen</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
        + '<b>' + allApps.length + '</b> Apps installiert · v172'
        + '</div></div>';

      /* ═══════════════════════════════════════════════════════
         🆕 HOMESCREEN-STIL
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🏠 Homescreen-Stil</h3>'
        + '<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;line-height:1.6">'
        + 'Wähle, wie der Startbildschirm aussehen soll.'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
        + homeStyleCard("solar", "🌌", "Sonnensystem", "Planeten kreisen um Sonne", homeStyle)
        + homeStyleCard("dashboard", "📊", "Dashboard", "Klassisches Karten-Layout", homeStyle)
        + homeStyleCard("combined", "🎨", "Kombi", "Sonne oben + Dashboard", homeStyle)
        + homeStyleCard("grid", "📱", "Kacheln", "Einfache App-Kacheln", homeStyle)
        + '</div></div>';

      /* ═══════════════════════════════════════════════════════
         🆕 AVATAR-WIDGET
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🦚 Avatar-Widget</h3>'
        + toggleRow("Avatar anzeigen", "avatarVisibleSet", avatarVisible)
        + toggleRow("Schweben (Animation)", "avatarFloatingSet", avatarFloating)
        + '<div class="field" style="margin-top:10px"><label>Avatar-Modus</label>'
        + '<select id="avatarModeSel" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<option value="human"' + (avatarMode === "human" ? " selected" : "") + '>🧑 Human</option>'
        + '<option value="cyborg"' + (avatarMode === "cyborg" ? " selected" : "") + '>🤖 Cyborg</option>'
        + '<option value="hologram"' + (avatarMode === "hologram" ? " selected" : "") + '>✨ Hologram</option>'
        + '</select></div></div>';

      /* ═══════════════════════════════════════════════════════
         👤 ACCOUNT
         ═══════════════════════════════════════════════════════ */
      body += section("👤 Account", [
        row("Name", userName, "text", "userName"),
        row("E-Mail", userEmail, "email", "userEmail")
      ]);

      /* ═══════════════════════════════════════════════════════
         ⚙️ ALLGEMEIN
         ═══════════════════════════════════════════════════════ */
      body += section("⚙️ Allgemein", [
        selectRow("🌍 Sprache", "lang", lang, [
          { v: "de", n: "🇩🇪 Deutsch" },
          { v: "en", n: "🇬🇧 English" },
          { v: "ku", n: "🦚 Kurdisch (Kurmanci)" },
          { v: "ckb", n: "🦚 Kurdisch (Sorani)" },
          { v: "ar", n: "🇸🇦 العربية" },
          { v: "tr", n: "🇹🇷 Türkçe" }
        ])
      ]);

      /* ═══════════════════════════════════════════════════════
         ☀️ ANZEIGE
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>☀️ Anzeige und Helligkeit</h3>'
        + sliderRow("Helligkeit", "displayBrightness", brightness, 20, 100, "%")
        + toggleRow("Automatische Helligkeit", "autoBrightness", autoBright)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🎨 THEME
         ═══════════════════════════════════════════════════════ */
      var themeList = window.HalDoTheme ? HalDoTheme.list() : [];
      var themeGrid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
      themeList.forEach(function(tid){
        var t = HalDoTheme.themes[tid];
        var isAct = tid === theme;
        themeGrid += '<button type="button" data-set-theme="' + tid + '" style="padding:0;background:transparent;border:none;cursor:pointer;text-align:left">'
          + '<div style="padding:10px;background:linear-gradient(135deg,' + t.colors["--bg"] + ',' + t.colors["--bg-2"] + ');border-radius:12px;border:2px solid ' + (isAct ? t.colors["--p1"] : "rgba(255,255,255,.1)") + ';position:relative">'
          + '<div style="display:flex;gap:4px;margin-bottom:8px">'
          + '<div style="width:14px;height:14px;border-radius:50%;background:' + t.colors["--p1"] + '"></div>'
          + '<div style="width:14px;height:14px;border-radius:50%;background:' + t.colors["--p2"] + '"></div>'
          + '<div style="width:14px;height:14px;border-radius:50%;background:' + t.colors["--p3"] + '"></div>'
          + '</div>'
          + '<div style="font-size:11px;font-weight:900;color:' + t.colors["--text"] + '">' + _esc(t.name) + '</div>'
          + (isAct ? '<div style="position:absolute;top:6px;right:6px;font-size:12px">✅</div>' : '')
          + '</div></button>';
      });
      themeGrid += '</div>';

      body += '<div class="card"><h3>🎨 Theme</h3>'
        + '<div style="font-size:11px;color:var(--text-dim);margin-bottom:10px">Wähle dein Farbschema:</div>'
        + themeGrid
        + '<button class="btn sec full" id="openThemePanel" style="font-size:11px">🎨 Erweiterte Theme-Optionen</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🔊 STIMME — KOMPLETT (Presets + Eigene + Engine)
         ═══════════════════════════════════════════════════════ */
      var voiceGrid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">';
      VOICE_PRESETS.forEach(function(v){
        var isAct = v.id === voicePreset;
        voiceGrid += '<button type="button" data-voice-preset="' + v.id + '" style="padding:10px;background:' + (isAct ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (isAct ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:left">'
          + '<div style="font-size:12px;font-weight:900;color:' + (isAct ? "var(--p1)" : "var(--text)") + '">' + v.name + '</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + v.desc + '</div>'
          + '</button>';
      });
      voiceGrid += '</div>';

      body += '<div class="card"><h3>🔊 Stimme</h3>'
        + toggleRow("Sprachausgabe aktiv", "voiceEnabled", voiceEnabled)

        /* Engine-Auswahl */
        + '<div class="field" style="margin-top:14px"><label>🎛️ Voice-Engine</label>'
        + '<select id="voiceEngineSel" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<option value="browser"' + (voiceEngine === "browser" ? " selected" : "") + '>🌐 Browser (kostenlos, offline)</option>'
        + '<option value="eleven"' + (voiceEngine === "eleven" ? " selected" : "") + '>🎤 ElevenLabs (kostet, HD)</option>'
        + '<option value="kurdisch"' + (voiceEngine === "kurdisch" ? " selected" : "") + '>🦚 Kurdisch/Ezidi</option>'
        + '</select></div>'

        + '<div style="font-size:11px;color:var(--text-dim);margin:14px 0 8px;font-weight:800">STIMMEN-PRESETS</div>'
        + voiceGrid

        /* ═══ 🆕 EIGENE STIMME — KLON ═══ */
        + '<div style="margin-top:18px;padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;border-left:3px solid var(--p1)">'
        + '<div style="font-size:13px;font-weight:900;color:var(--p1);margin-bottom:8px">🎙️ Eigene Stimme (Klon)</div>'
        + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.6;margin-bottom:10px">'
        + 'Um deine eigene Stimme zu nutzen brauchst du:'
        + '<br>1️⃣ ElevenLabs-Konto (kostenlos)'
        + '<br>2️⃣ Voice-ID aus dem Voice Lab'
        + '<br>3️⃣ Trage Voice-ID hier ein ↓'
        + '</div>'
        + '<div class="field" style="margin-bottom:8px"><label>ElevenLabs Voice-ID</label>'
        + '<input type="text" id="elevenVoiceId" value="' + _esc(elevenVoiceId) + '" placeholder="z.B. 21m00Tcm4TlvDq8ikWAM" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:monospace">'
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-bottom:10px">'
        + '<button class="btn" id="testMyVoice" style="flex:1;font-size:11px">🎤 Meine Stimme testen</button>'
        + '<button class="btn sec" id="openElevenLab" style="font-size:11px;padding:10px 12px">🔗</button>'
        + '</div>'
        + '<div style="font-size:10px;color:var(--text-mute);line-height:1.5">'
        + '💡 <b>Voice Lab:</b> elevenlabs.io → Voices → Add Voice → Voice Design oder Cloning (kostet Credits)'
        + '</div>'
        + '</div>'

        /* ═══ 🆕 VOICE-SAMPLE UPLOAD (Offline-Klon) ═══ */
        + '<div style="margin-top:12px;padding:14px;background:rgba(255,255,255,.03);border-radius:12px;border-left:3px solid #4ade80">'
        + '<div style="font-size:13px;font-weight:900;color:#4ade80;margin-bottom:8px">📁 Eigene Stimme hochladen (Beta)</div>'
        + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.6;margin-bottom:10px">'
        + 'Nimm 30 Sekunden deiner Stimme auf und lade die Datei hier hoch. <b>Wird lokal gespeichert</b> — kann als Voice-Note abgespielt werden.'
        + '</div>'
        + '<input type="file" id="voiceSampleInput" accept="audio/*" style="display:none">'
        + '<button class="btn sec full" id="voiceSampleBtn" style="font-size:11px">📤 Audio-Datei auswählen</button>'
        + '<div id="voiceSampleInfo" style="font-size:10.5px;color:var(--text-mute);margin-top:8px;text-align:center">'
        + (voiceSample ? '✅ Geladen (' + Math.round(voiceSample.size/1024) + ' KB)' : 'Kein Sample hochgeladen')
        + '</div>'
        + '</div>'

        + sliderRow("Geschwindigkeit", "voiceRate", voiceRate, 0.5, 2, "x", 0.1)
        + sliderRow("Tonhöhe", "voicePitch", voicePitch, 0.5, 2, "", 0.1)
        + sliderRow("Lautstärke", "voiceVolume", voiceVolume, 0, 1, "", 0.1)
        + '<button class="btn full" id="testVoice" style="margin-top:10px">🔊 Standard-Stimme testen</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🆕 API KEYS — KOMPLETT
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔑 API Keys & KI-Modelle</h3>'
        + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px;margin-bottom:14px;border-left:3px solid #fbbf24">'
        + '<div style="font-size:11px;color:#fbbf24;font-weight:900;margin-bottom:4px">🔒 Sicherheit</div>'
        + '<div style="font-size:10.5px;color:var(--text-dim);line-height:1.5">'
        + 'Alle Keys werden <b>nur lokal</b> in deinem Browser gespeichert (localStorage). Sie verlassen <b>nie</b> dein Gerät außer für API-Calls an den jeweiligen Dienst.'
        + '</div></div>';

      /* Groq */
      body += apiKeyItem("groqKey", "⚡", "Groq (kostenlos, schnell)", aiKeys.groqKey, "gsk_...", "console.groq.com/keys — für Chat & Songtext-Generator");
      /* ElevenLabs */
      body += apiKeyItem("elevenKey", "🎤", "ElevenLabs (Voice)", aiKeys.elevenKey, "sk_...", "elevenlabs.io → Profile → API Key");
      /* HuggingFace */
      body += apiKeyItem("hfKey", "🤗", "HuggingFace (KI-Modelle)", aiKeys.hfKey, "hf_...", "huggingface.co/settings/tokens");
      /* Suno */
      body += apiKeyItem("sunoKey", "🎵", "Suno (Musik)", aiKeys.sunoKey, "suno_...", "sunoapi.org oder eigener Proxy");
      /* Replicate */
      body += apiKeyItem("replicateKey", "☁️", "Replicate (KI)", aiKeys.replicateKey, "r8_...", "replicate.com/account/api-tokens");
      /* Gemini */
      body += apiKeyItem("geminiKey", "💎", "Google Gemini", aiKeys.geminiKey, "AIza...", "aistudio.google.com/apikey");

      /* Model */
      body += '<div class="field" style="margin-top:14px"><label>🤖 Groq Modell</label>'
        + '<select id="groqModelSel" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '<option value="openai/gpt-oss-120b"' + (aiKeys.model === "openai/gpt-oss-120b" ? " selected" : "") + '>GPT-OSS 120B (bestes)</option>'
        + '<option value="openai/gpt-oss-20b"' + (aiKeys.model === "openai/gpt-oss-20b" ? " selected" : "") + '>GPT-OSS 20B (schnell)</option>'
        + '<option value="llama-3.3-70b-versatile"' + (aiKeys.model === "llama-3.3-70b-versatile" ? " selected" : "") + '>Llama 3.3 70B</option>'
        + '<option value="llama-3.1-8b-instant"' + (aiKeys.model === "llama-3.1-8b-instant" ? " selected" : "") + '>Llama 3.1 8B (instant)</option>'
        + '<option value="mixtral-8x7b-32768"' + (aiKeys.model === "mixtral-8x7b-32768" ? " selected" : "") + '>Mixtral 8x7B</option>'
        + '</select></div>';

      /* System Prompt */
      body += '<div class="field"><label>💬 System-Prompt</label>'
        + '<textarea id="sysPrompt" rows="3" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12px;font-family:inherit;resize:vertical">' + _esc(aiKeys.systemPrompt || "") + '</textarea></div>';

      /* Save + Test */
      body += '<div style="display:flex;gap:6px;margin-top:14px">'
        + '<button class="btn" id="saveKeys" style="flex:1">💾 Keys speichern</button>'
        + '<button class="btn sec" id="testGroq" style="flex:1">🧪 Groq testen</button>'
        + '</div>'
        + '<div id="keysStatus" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11px"></div>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🔔 MITTEILUNGEN
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔔 Mitteilungen</h3>'
        + toggleRow("Benachrichtigungen", "notifyEnabled", notifyEnabled)
        + toggleRow("Mit Sound", "soundEnabled", soundEnabled)
        + toggleRow("Vibration (mobil)", "vibrateEnabled", vibrateEnabled)
        + '<button class="btn sec full" id="testNotify" style="margin-top:10px">🧪 Test-Benachrichtigung</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         📶 WLAN
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>📶 WLAN</h3>'
        + toggleRow("WLAN aktiv", "wifi", wifi)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🔵 BLUETOOTH
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔵 Bluetooth</h3>'
        + toggleRow("Bluetooth aktiv", "bluetooth", bluetooth)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🚗 HALDO CAR / CARPLAY
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🚗 HalDo Car</h3>'
        + toggleRow("🚗 HalDo Car Modus", "carMode", carMode)
        + toggleRow("🍎 HalDo CarPlay", "carplayMode", carplayMode)
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         💾 SPEICHER
         ═══════════════════════════════════════════════════════ */
      var totalStorage = 0;
      var keys = Object.keys(localStorage).filter(function(k){
        return k.indexOf("haldo:") === 0;
      });
      keys.forEach(function(k){
        totalStorage += (localStorage.getItem(k) || "").length;
      });
      var sizeStr = totalStorage > 1024*1024
        ? (totalStorage/1024/1024).toFixed(2) + " MB"
        : (totalStorage/1024).toFixed(1) + " KB";

      body += '<div class="card"><h3>💾 Speicher</h3>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
        + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">EINTRÄGE</div>'
        + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + keys.length + '</div>'
        + '</div>'
        + '<div style="padding:12px;background:rgba(180,120,255,.1);border-radius:10px">'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">GRÖSSE</div>'
        + '<div style="font-size:20px;font-weight:900;color:var(--p3)">' + sizeStr + '</div>'
        + '</div></div>'
        + '<button class="btn full" id="exportData" style="margin-bottom:6px">📤 Daten exportieren (JSON)</button>'
        + '<button class="btn sec full" id="clearCache" style="margin-bottom:6px">🧹 Cache leeren</button>'
        + '<button class="btn danger full" id="clearAllData">🗑️ Alle Daten löschen</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         🔒 DATENSCHUTZ
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>🔒 Datenschutz</h3>'
        + selectRow("Datenschutz-Level", "privacyLevel", privacyLevel, [
          { v: "offen", n: "🟢 Offen (viele Features)" },
          { v: "mittel", n: "🟡 Mittel (Standard)" },
          { v: "streng", n: "🔴 Streng (nur nötigste)" }
        ])
        + toggleRow("Analytics aktiv", "analyticsEnabled", HalDo.Store.get("analyticsEnabled", true))
        + toggleRow("Standort teilen", "locationShare", HalDo.Store.get("locationShare", false))
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         📋 BEDINGUNGEN
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>📋 Bedingungen & Lizenzen</h3>'
        + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.7">'
        + '<div style="padding:8px 0"><b>HalDo AI OS</b> — Version 172</div>'
        + '<div style="padding:8px 0">Lizenz: Persönliche Nutzung</div>'
        + '<div style="padding:8px 0">© 2026 HalDo AI</div>'
        + '</div></div>';

      /* ═══════════════════════════════════════════════════════
         ❓ HILFE
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>❓ Hilfe</h3>'
        + '<button class="btn sec full" style="margin-bottom:6px">📖 Benutzerhandbuch</button>'
        + '<button class="btn sec full" style="margin-bottom:6px">🎓 Tutorial starten</button>'
        + '<button class="btn sec full" style="margin-bottom:6px">💬 Feedback senden</button>'
        + '<button class="btn sec full">📧 Kontakt: support@haldo.ai</button>'
        + '</div>';

      /* ═══════════════════════════════════════════════════════
         📱 APP-VERWALTUNG
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card"><h3>📱 App-Verwaltung (' + allApps.length + ')</h3>'
        + '<div style="max-height:300px;overflow-y:auto;padding-right:4px">';
      allApps.forEach(function(a){
        body += '<div style="padding:8px 10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
          + '<div style="font-size:12px;font-weight:800">' + _esc(a.icon) + ' ' + _esc(a.name) + '</div>'
          + '<div style="font-size:10px;color:#4ade80">✅ v172</div>'
          + '</div>';
      });
      body += '</div></div>';

      /* ═══════════════════════════════════════════════════════
         ℹ️ ÜBER
         ═══════════════════════════════════════════════════════ */
      body += '<div class="card">'
        + '<div style="padding:24px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;border:1.5px solid var(--p1)">'
        + '<div style="font-size:64px">🦚</div>'
        + '<div style="font-size:22px;font-weight:900;color:var(--p1);margin-top:8px">HalDo AI OS</div>'
        + '<div style="font-size:14px;font-weight:800;color:var(--p3);margin-top:4px">v172</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px">Voice-Klon · API-Keys · Homescreen</div>'
        + '</div></div>';

      container.innerHTML = body;

      /* ═══════════════════════════════════════════════════════
         EVENT-BINDINGS
         ═══════════════════════════════════════════════════════ */

      /* Homescreen */
      container.querySelectorAll("[data-homestyle]").forEach(function(el){
        el.addEventListener("click", function(){
          HalDo.Store.set("homeStyle", el.getAttribute("data-homestyle"));
          if(HalDo.Notify) HalDo.Notify.success("Homescreen gespeichert", { app: "settings" });
          build();
        });
      });

      /* Avatar */
      var avVis = container.querySelector('[data-toggle="avatarVisibleSet"]');
      if(avVis) avVis.addEventListener("click", function(e){
        e.preventDefault();
        var cur = HalDo.Store.get("avatarVisible", true);
        HalDo.Store.set("avatarVisible", !cur);
        if(window.HalDoAvatar){ if(!cur) HalDoAvatar.show(); else HalDoAvatar.hide(); }
        build();
      });
      var avFloat = container.querySelector('[data-toggle="avatarFloatingSet"]');
      if(avFloat) avFloat.addEventListener("click", function(e){
        e.preventDefault();
        var cur = HalDo.Store.get("avatarFloating", true);
        HalDo.Store.set("avatarFloating", !cur);
        if(window.HalDoAvatar) HalDoAvatar.setFloating(!cur);
        build();
      });
      var avMode = container.querySelector("#avatarModeSel");
      if(avMode) avMode.addEventListener("change", function(){
        if(window.HalDoAvatar) HalDoAvatar.setMode(this.value);
      });

      /* Standard-Toggles */
      container.querySelectorAll("[data-toggle]").forEach(function(el){
        el.addEventListener("click", function(e){
          e.preventDefault();
          var key = el.getAttribute("data-toggle");
          if(key === "avatarVisibleSet" || key === "avatarFloatingSet") return;
          var cur = HalDo.Store.get(key, false);
          HalDo.Store.set(key, !cur);
          build();
        });
      });

      /* Inputs */
      container.querySelectorAll("[data-input]").forEach(function(el){
        el.addEventListener("change", function(){
          HalDo.Store.set(el.getAttribute("data-input"), el.value);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert", { app: "settings" });
        });
      });

      /* Selects */
      container.querySelectorAll("[data-select]").forEach(function(el){
        el.addEventListener("change", function(){
          var key = el.getAttribute("data-select");
          HalDo.Store.set(key, el.value);
          if(key === "lang" && window.HalDo.i18n) HalDo.i18n.setLang(el.value);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert: " + el.value, { app: "settings" });
        });
      });

      /* Slider */
      container.querySelectorAll("[data-slider]").forEach(function(el){
        el.addEventListener("input", function(){
          var key = el.getAttribute("data-slider");
          var val = parseFloat(el.value);
          HalDo.Store.set(key, val);
          var lbl = container.querySelector('[data-slider-label="' + key + '"]');
          if(lbl) lbl.textContent = val + (el.getAttribute("data-unit") || "");
        });
      });

      /* Theme */
      container.querySelectorAll("[data-set-theme]").forEach(function(el){
        el.addEventListener("click", function(){
          if(window.HalDoTheme){
            HalDoTheme.setAuto(false);
            HalDoTheme.apply(el.getAttribute("data-set-theme"));
            build();
          }
        });
      });

      /* Voice-Presets */
      container.querySelectorAll("[data-voice-preset]").forEach(function(el){
        el.addEventListener("click", function(){
          var vid = el.getAttribute("data-voice-preset");
          HalDo.Store.set("voicePreset", vid);
          var preset = VOICE_PRESETS.find(function(v){ return v.id === vid; });
          if(preset){
            HalDo.Store.set("voiceRate", preset.rate);
            HalDo.Store.set("voicePitch", preset.pitch);
          }
          /* Wenn "eigene" → Engine auf eleven schalten */
          if(vid === "eigene"){
            HalDo.Store.set("voiceEngine", "eleven");
          }
          if(HalDo.Notify) HalDo.Notify.success("Stimme: " + (preset ? preset.name : vid), { app: "settings" });
          build();
        });
      });

      /* Voice-Engine */
      var veSel = container.querySelector("#voiceEngineSel");
      if(veSel) veSel.addEventListener("change", function(){
        HalDo.Store.set("voiceEngine", this.value);
        if(HalDo.Notify) HalDo.Notify.success("Engine: " + this.value, { app: "settings" });
      });

      /* 🆕 ElevenLabs Voice-ID */
      var elevenId = container.querySelector("#elevenVoiceId");
      if(elevenId) elevenId.addEventListener("change", function(){
        HalDo.Store.set("elevenVoiceId", this.value.trim());
        if(HalDo.Notify) HalDo.Notify.success("Voice-ID gespeichert", { app: "settings" });
      });

      /* 🆕 Test eigene Stimme */
      var testMy = container.querySelector("#testMyVoice");
      if(testMy) testMy.addEventListener("click", function(){
        var vid = HalDo.Store.get("elevenVoiceId", "");
        var elevenKey = (HalDo.Store.get("aiKeys", {}).elevenKey || "");
        if(!vid){ alert("Voice-ID fehlt! Füge sie oben ein."); return; }
        if(!elevenKey){ alert("ElevenLabs API Key fehlt! Gehe zu 'API Keys' unten."); return; }
        if(HalDo.Notify) HalDo.Notify.info("🎤 Teste deine Stimme...", { app: "settings" });
        /* ElevenLabs TTS-Aufruf */
        fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(vid) + "?output_format=mp3_44100_128", {
          method: "POST",
          headers: { "Content-Type": "application/json", "xi-api-key": elevenKey },
          body: JSON.stringify({
            text: "Hallo Bruder! Das ist meine eigene Stimme.",
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true }
          })
        }).then(function(r){
          if(!r.ok) throw new Error("Status " + r.status);
          return r.blob();
        }).then(function(blob){
          var url = URL.createObjectURL(blob);
          var a = new Audio(url);
          a.play();
          if(HalDo.Notify) HalDo.Notify.success("✅ Deine Stimme funktioniert!", { app: "settings" });
        }).catch(function(e){
          if(HalDo.Notify) HalDo.Notify.error("❌ " + e.message, { app: "settings" });
        });
      });

      /* Link zu ElevenLabs */
      var openLab = container.querySelector("#openElevenLab");
      if(openLab) openLab.addEventListener("click", function(){
        window.open("https://elevenlabs.io/voice-lab", "_blank");
      });

      /* 🆕 Voice-Sample Upload */
      var vsInput = container.querySelector("#voiceSampleInput");
      var vsBtn = container.querySelector("#voiceSampleBtn");
      if(vsBtn && vsInput){
        vsBtn.addEventListener("click", function(){ vsInput.click(); });
        vsInput.addEventListener("change", function(){
          var f = this.files[0];
          if(!f) return;
          if(f.size > 5 * 1024 * 1024){ alert("Datei zu groß (max 5 MB)"); return; }
          var reader = new FileReader();
          reader.onload = function(e){
            var data = { name: f.name, size: f.size, dataUrl: e.target.result, date: new Date().toLocaleString("de-DE") };
            HalDo.Store.set("voiceSample", data);
            if(HalDo.Notify) HalDo.Notify.success("Sample gespeichert", { app: "settings" });
            build();
          };
          reader.readAsDataURL(f);
        });
      }

      /* Test-Standard-Stimme */
      var tv = container.querySelector("#testVoice");
      if(tv) tv.addEventListener("click", function(){
        if(HalDo.Voice){
          var preset = VOICE_PRESETS.find(function(v){ return v.id === HalDo.Store.get("voicePreset", "haldo"); }) || VOICE_PRESETS[0];
          HalDo.Voice.speak("Hallo Bruder! Ich bin " + preset.name + ".");
        }
      });

      /* 🆕 API Keys Speichern */
      var saveKeys = container.querySelector("#saveKeys");
      if(saveKeys) saveKeys.addEventListener("click", function(){
        var newKeys = {
          groqKey: (container.querySelector("#key_groqKey") || {}).value || "",
          geminiKey: (container.querySelector("#key_geminiKey") || {}).value || "",
          hfKey: (container.querySelector("#key_hfKey") || {}).value || "",
          elevenKey: (container.querySelector("#key_elevenKey") || {}).value || "",
          sunoKey: (container.querySelector("#key_sunoKey") || {}).value || "",
          replicateKey: (container.querySelector("#key_replicateKey") || {}).value || "",
          model: (container.querySelector("#groqModelSel") || {}).value || "openai/gpt-oss-120b",
          systemPrompt: (container.querySelector("#sysPrompt") || {}).value || ""
        };
        HalDo.Store.set("aiKeys", newKeys);
        var stat = container.querySelector("#keysStatus");
        stat.style.display = "block";
        stat.style.background = "rgba(74,222,128,.15)";
        stat.textContent = "✅ Alle Keys gespeichert!";
        if(HalDo.Notify) HalDo.Notify.success("API Keys gespeichert", { app: "settings" });
      });

      /* 🆕 Groq Test */
      var testGroq = container.querySelector("#testGroq");
      if(testGroq) testGroq.addEventListener("click", function(){
        var stat = container.querySelector("#keysStatus");
        stat.style.display = "block";
        stat.style.background = "rgba(0,229,255,.1)";
        stat.textContent = "⏳ Teste Groq...";

        var groqKey = (container.querySelector("#key_groqKey") || {}).value || "";
        if(!groqKey){
          stat.style.background = "rgba(255,128,128,.15)";
          stat.textContent = "❌ Kein Groq-Key eingetragen";
          return;
        }

        fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + groqKey },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "user", content: "Sag nur 'OK' zurück." }],
            max_tokens: 10
          })
        }).then(function(r){
          if(!r.ok) throw new Error("Status " + r.status);
          return r.json();
        }).then(function(d){
          stat.style.background = "rgba(74,222,128,.15)";
          stat.innerHTML = "✅ Groq funktioniert! Antwort: <b>" + _esc(d.choices[0].message.content) + "</b>";
        }).catch(function(e){
          stat.style.background = "rgba(255,128,128,.15)";
          stat.textContent = "❌ Groq-Fehler: " + e.message;
        });
      });

      /* API Key Show/Hide */
      container.querySelectorAll("[data-key-toggle]").forEach(function(b){
        b.addEventListener("click", function(){
          var inp = container.querySelector("#" + b.dataset.keyToggle);
          if(!inp) return;
          inp.type = inp.type === "password" ? "text" : "password";
          b.textContent = inp.type === "password" ? "👁️" : "🙈";
        });
      });

      /* Test-Notify */
      var tn = container.querySelector("#testNotify");
      if(tn) tn.addEventListener("click", function(){
        if(HalDo.Notify) HalDo.Notify.info("Test-Benachrichtigung ✅", { app: "settings" });
      });

      /* Export */
      var exp = container.querySelector("#exportData");
      if(exp) exp.addEventListener("click", function(){
        var data = {};
        Object.keys(localStorage).forEach(function(k){
          if(k.indexOf("haldo:") === 0) data[k] = localStorage.getItem(k);
        });
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "haldo-backup-" + new Date().toISOString().split("T")[0] + ".json";
        a.click();
      });

      /* Cache */
      var cc = container.querySelector("#clearCache");
      if(cc) cc.addEventListener("click", function(){
        if(!confirm("Cache leeren?")) return;
        if("caches" in window) caches.keys().then(function(names){ names.forEach(function(n){ caches.delete(n); }); });
        if(HalDo.Notify) HalDo.Notify.success("Cache geleert", { app: "settings" });
      });

      /* Clear All */
      var ca = container.querySelector("#clearAllData");
      if(ca) ca.addEventListener("click", function(){
        if(!confirm("ALLE Daten löschen?!")) return;
        if(!confirm("WIRKLICH ALLES löschen?")) return;
        Object.keys(localStorage).filter(function(k){ return k.indexOf("haldo:") === 0; }).forEach(function(k){ localStorage.removeItem(k); });
        alert("Alle Daten gelöscht. Seite neu laden (F5).");
      });

      /* Theme-Panel */
      var tp = container.querySelector("#openThemePanel");
      if(tp) tp.addEventListener("click", function(){ if(window.HalDoTheme) HalDoTheme.open(); });
    }

    /* ═══════════════════════════════════════════════════════════
       HELPER
       ═══════════════════════════════════════════════════════════ */
    function section(title, rows){
      return '<div class="card"><h3>' + _esc(title) + '</h3>' + rows.join("") + '</div>';
    }
    function row(label, value, type, key){
      return '<div class="field"><label>' + _esc(label) + '</label>'
        + '<input type="' + type + '" value="' + _esc(value) + '" data-input="' + _esc(key) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
        + '</div>';
    }
    function toggleRow(label, key, on){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
        + '<div style="font-size:12.5px;font-weight:800">' + _esc(label) + '</div>'
        + '<button type="button" data-toggle="' + _esc(key) + '" style="padding:6px 14px;border:none;border-radius:8px;font-weight:900;cursor:pointer;font-size:11px;background:' + (on ? "linear-gradient(135deg,#4ade80,#00e5ff)" : "rgba(0,0,0,.4)") + ';color:' + (on ? "#000" : "var(--text-dim)") + '">' + (on ? "AN" : "AUS") + '</button>'
        + '</div>';
    }
    function selectRow(label, key, value, options){
      var opts = options.map(function(o){
        return '<option value="' + _esc(o.v) + '"' + (o.v === value ? " selected" : "") + '>' + _esc(o.n) + '</option>';
      }).join("");
      return '<div class="field"><label>' + _esc(label) + '</label>'
        + '<select data-select="' + _esc(key) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">' + opts + '</select>'
        + '</div>';
    }
    function sliderRow(label, key, value, min, max, unit, step){
      return '<div class="field"><label style="display:flex;justify-content:space-between">'
        + '<span>' + _esc(label) + '</span>'
        + '<span data-slider-label="' + _esc(key) + '" style="color:var(--p1);font-weight:900">' + value + (unit || "") + '</span>'
        + '</label>'
        + '<input type="range" data-slider="' + _esc(key) + '" data-unit="' + (unit || "") + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" value="' + value + '" style="width:100%">'
        + '</div>';
    }
    function homeStyleCard(id, icon, title, desc, current){
      var sel = current === id;
      return '<button type="button" data-homestyle="' + id + '" style="padding:12px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:12px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;position:relative">'
        + '<div style="font-size:26px;margin-bottom:4px">' + icon + '</div>'
        + '<div style="font-size:12px;font-weight:900;color:' + (sel ? "var(--p1)" : "var(--text)") + '">' + title + '</div>'
        + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + desc + '</div>'
        + (sel ? '<div style="position:absolute;top:8px;right:8px;font-size:11px">✅</div>' : '')
        + '</button>';
    }
    function apiKeyItem(key, icon, name, value, placeholder, hint){
      var has = value && value.length > 4;
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px;border-left:3px solid ' + (has ? "#4ade80" : "#6b7390") + '">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<span style="font-size:16px">' + icon + '</span>'
        + '<span style="font-size:12px;font-weight:900;flex:1">' + _esc(name) + '</span>'
        + '<span style="font-size:9px;padding:2px 7px;border-radius:6px;font-weight:900;background:' + (has ? "rgba(74,222,128,.2);color:#4ade80" : "rgba(255,128,128,.15);color:#ff8080") + '">' + (has ? "Gesetzt" : "Leer") + '</span>'
        + '</div>'
        + '<div style="display:flex;gap:5px">'
        + '<input type="password" id="key_' + key + '" value="' + _esc(value || "") + '" placeholder="' + _esc(placeholder) + '" autocomplete="off" style="flex:1;padding:9px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;font-family:monospace">'
        + '<button type="button" data-key-toggle="key_' + key + '" style="padding:8px 10px;background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:8px;cursor:pointer;font-size:13px">👁️</button>'
        + '</div>'
        + (hint ? '<div style="font-size:9.5px;color:var(--text-mute);margin-top:6px">💡 ' + _esc(hint) + '</div>' : '')
        + '</div>';
    }

    build();
  }

  HalDoApp("settings", { name: "Einstellungen", icon: "⚙️", render: render, category: "system" });
  console.log("🦚 settings.js v172 geladen — Voice-Klon + API Keys");
})();
