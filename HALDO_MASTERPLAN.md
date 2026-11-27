# HALDO AI OS PRO MAX — MASTERPLAN & PROJEKTGEDÄCHTNIS

**Projektverantwortlicher:** Halil Donma (HalDo)  
**Repository:** https://github.com/haldoaios-Official/HalDo  
**Hauptbranch:** `main`  
**Live:** https://haldoaios-official.github.io/HalDo/  
**Hauptdatei:** `index.html`  
**Dokumentstatus:** Arbeitsplan und Bestandsinventar; kein Versprechen, dass jede aufgeführte Moduldatei bereits eine vollständig fertige App ist.

> Dieses Dokument ist die dauerhafte Arbeitsgrundlage für zukünftige HalDo-Entwicklungssitzungen. Vor jeder Änderung zuerst dieses Dokument, den aktuellen GitHub-Stand und die tatsächliche App-Registry prüfen und danach dieses Dokument aktualisieren.

---

## 1. Verbindliche Arbeitsregeln

1. Immer im bestehenden Repository `haldoaios-Official/HalDo` und grundsätzlich auf `main` weiterarbeiten.
2. Die vorhandene vollständige `index.html` ist die zentrale Hauptdatei. Sie darf nicht durch ein neues Demo-Projekt, eine alte ZIP oder einen Parallelbau ersetzt werden.
3. Vor jeder Änderung den aktuellen Branch, Commit, Datei-SHA, App-Registry, Dateibaum und betroffene Module erneut aus GitHub lesen.
4. Bestehende Apps, Funktionen, IDs, Daten, Bilder, Styles und Integrationen erhalten. Vorhandene Funktionen nicht blind duplizieren.
5. Für jeden regulären App-Release werden zwei neue, eigenständige und sinnvoll vollständige HalDo-Apps gebaut. Beide müssen im Manifest/Registry, Launcher/AppStore und Start-/Fenstersystem korrekt integriert sein.
6. Reine System-, Wartungs-, Branding- oder Fehlerbehebungs-Releases zählen nicht als App-Paar und dürfen zusätzlich erfolgen.
7. Keine App nur als Namen, Attrappe oder leeren Bildschirm veröffentlichen. Funktionen, Zustände, Speicherung, Fehlerfälle und mobile Darstellung prüfen.
8. Nach jedem GitHub-Write die geänderten Dateien erneut von GitHub abrufen und Commit-SHA/Datei-SHA kontrollieren.
9. GitHub Actions und Pages-Deployment separat prüfen. Nur bei erfolgreichem Workflow als veröffentlicht bezeichnen.
10. In der Übergabe immer Version, Commit-Link, vollständigen Raw-Link der `index.html`, geänderte Dateien, Funktionsumfang, Tests und Deploymentstatus nennen.
11. Vor einer Änderung eine sichere Basis behalten; niemals einen alten Backup-Stand über die aktuelle Hauptdatei schreiben.
12. Keine geheimen Schlüssel, Passwörter oder privaten API-Tokens in öffentliche Dateien committen. Externe KI-Dienste nur mit sicherer Backend-/Proxy-Architektur oder vom Nutzer selbst konfigurierten Schlüsseln anbinden.

## 2. Produktidentität und Willkommenserlebnis

### HalDo-Markenidentität
- Vollständiger Produktname: **HalDo AI OS Pro Max**.
- Entwickler-/Markenhinweis: **Präsentiert von Halil Donma · HalDo**.
- Das originale Repository-Bild **`logo.png` ist Eigentum/Markenbild des Projekts und muss erhalten bleiben**.
- `logo.png` bei passenden Stellen als echtes HalDo-Profil-/Markenbild einbinden. Nicht durch ein fremdes Gesicht, ein generisches KI-Porträt oder ein neu generiertes Logo ersetzen.
- Das Engel-/Sonnen-/Milchstraßenmotiv ist eine zusätzliche visuelle Inszenierung. Es ersetzt das Original-Logo nicht.

### Gewünschter lebendiger Empfang
- Kosmischer Hintergrund mit Milchstraße, Sternen, leuchtender goldener Sonne und volumetrischem Licht.
- Ein schöner Engel mit Flügeln; Flügel öffnen sich sichtbar und fließend. Sanfte Schwebe-/Atembewegung, Lichtstrahlen, Sternenstaub und dezente Partikel.
- Goldene, elegante, gut lesbare Willkommensschrift mit ruhiger Einblendung.
- Originales `logo.png` sichtbar als HalDo-Markenbild integrieren.
- Begrüßung nennt immer die richtige Identität, z. B. „Willkommen bei HalDo Fahrschule“ oder „Willkommen bei HalDo Arztbuch“.
- Schaltfläche „Jetzt öffnen“ startet erst danach die jeweilige App. Begrüßung darf nicht das eigentliche App-Fenster blockieren.
- Systemstart und App-Start unterscheiden: ein besonderer OS-Empfang und ein individueller App-Empfang.
- Animationen performant und mobilfreundlich; `prefers-reduced-motion`, Lade-Fallback und Fehlerbehandlung beachten.
- Engelmotiv und Original-Logo nicht verwechseln: das Engelmotiv ist Artwork, `logo.png` bleibt das Original.

### Bereits im Repository gefundene Empfangs-/Identitätsbausteine
- `index.html`: v161 Universal Welcome Experience, App-spezifische Begrüßung, Launch-Wrapper, Sprachbefehl und animierte SVG-Flügel laut Quelltext.
- `js/haldo-living-identity.js`: Living Identity Engine mit Avatar-, Logo-, Emotions- und Animations-Einstellungen; Standard-Logo-Pfad `logo.png`.
- `js/haldo-identity-bridge.js`: verbindet Identitätszustände und Ereignisse.
- `splash.js`: separater Splash-Ansatz mit Pfau, Sonne, Flügelanimation und Begrüßung. Vor einer Aktivierung erst prüfen, ob er geladen wird und wie er sich mit v161 überschneidet. Keine doppelten Splash-Screens erzeugen.
- `theme.js`: Theme-Engine und App-Themes vorhanden; tatsächliche App-Abdeckung prüfen.

## 3. UI-/UX-Standard für alle HalDo-Apps

- Jede App bekommt ihren vollständigen eigenen Namen, Icon, Kurzbeschreibung, Akzentfarbe und passenden Begrüßungstext.
- Moderne, responsive Oberfläche: hochwertige Glass-/Card-Layouts, klare Typografie, konsistente Abstände, gute Kontraste und mobile Touch-Ziele.
- Unterschiedliche Kartenarten passend zur Aufgabe: Dashboard-Karten, Listen, Tabellen, Timeline, Kanban, Chatblasen, Medienkarten, Formulare, Diagramme, Detailansichten und Seitenleisten.
- Chat-Oberflächen nicht überall identisch kopieren: Layout und Werkzeuge sollen zur jeweiligen App passen.
- Einheitliche Grundkomponenten und Fensterbedienung, aber eigene visuelle Persönlichkeit je App.
- Einheitliche HalDo-AI-/Voice-Integration, wenn fachlich sinnvoll: Zuhören, Vorlesen, Sprachbefehle, Hilfe und App-Kontext. KI muss transparent als KI bezeichnet werden.
- Persistenz mit nachvollziehbaren Speicherregeln, Export/Import und Backup-Kompatibilität.
- Barrierefreiheit, Tastaturbedienung, reduzierte Animation, responsive Ansichten und verständliche Fehlermeldungen.
- Medizinische, finanzielle und sicherheitsrelevante Funktionen müssen Grenzen klar darstellen; keine erfundenen Diagnosen, Rechts- oder Finanzgarantien.

## 4. Bestandsaufnahme — bekannte Dateien und App-Familien

Die folgenden Einträge sind aus dem aktuellen Repository-Dateibaum und den zuletzt geprüften Manifest-/Registry-Dateien abgeleitet. **Eine vorhandene JS-Datei ist noch kein Beweis für eine fertige, im Launcher erreichbare App.** Vor jedem Release Registry, Launcher, Runtime und Funktionsumfang kontrollieren.

### System, Plattform und Verwaltung
- `index.html`, `README.md`, `apps.js`, `registry.js`, `app-manager.js`, `appstore.js`, `appstore-erweitert.js`
- `boot.js`, `init.js`, `kernel.js`, `runtime.js`, `shell.js`, `desktop.js`, `window-manager.js`, `router.js`, `menu-system.js`
- `settings.js`, `theme.js`, `display.js`, `diagnostics.js`, `system-center.js`, `update.js`, `backup.js`, `recovery.js`, `security.js`, `storage.js`, `notifications.js`, `analytics.js`

### KI, Chat, Identität und Sprache
- `ai.js`, `ai-core.js`, `ai-engine.js`, `haldo-ai.js`, `haldo-ai-chat.js`, `chat.js`, `prompt.js`, `memory.js`, `avatar.js`, `voice.js`, `language.js`, `i18n.js`, `uebersetzer.js`, `sprachen.js`, `vokabeln.js`, `woerterbuch.js`, `voice-kurdisch.js`
- `js/haldo-living-identity.js`, `js/haldo-identity-bridge.js`, `js/haldo-human-3d-engine.js`

### Kommunikation und persönliche Organisation
- `email.js`, `posteingang.js`, `phone.js`, `videocall.js`, `comm.js`, `kontakte.js`, `aufnahme.js`, `voicememos.js`
- `tasks.js`, `todo.js`, `notes.js`, `sticky-notes.js`, `kalender.js`, `gewohnheiten.js`, `projekte.js`, `produktiv.js`, `pomodoro.js`, `arbeitszeit.js`, `statistik.js`

### Gesundheit, Medizin und Pflege
- `arztbuch.js`, `gesundheit.js`, `labor.js`, `fitness.js`, `bmi.js`, `atem.js`, `schlaf.js`, `wasser.js`, `stimmung.js`, `notfall.js`, `spiegel.js`, `base-bones.js`, `extended-bones.js`, `models/` und `js/haldo-human-3d-engine.js`
- Fachliche Vollständigkeit, Datenschutz, sichere Speicherung und medizinische Grenzen müssen gesondert geprüft werden.

### Alltag, Finanzen, Mobilität und Zuhause
- `fahrschule.js`, `blitzer.js`, `navigation.js* `, `verkehr.js`, `auto.js`, `reisen.js`, `welt.js`, `wetter.js`, `weltuhr.js`
- `finanzen.js`, `kredit.js`, `einkauf.js`, `rezept.js`, `kueche.js`, `zuhause.js`, `geraete-info.js`, `netzwerk-info.js`, `passwort.js`

### Medien, Kreativität, Wissen und Werkzeuge
- `musik.js`, `haldo-audio.js`, `video.js`, `medien.js`, `kamera.js`, `photos.js`, `bild.js`, `kreativ.js`, `spiele.js`, `games.js`
- `wissen.js`, `wissenschaftlich.js`, `periodensystem.js`, `mathe.js`, `lerne.js`, `lernen.js`, `flashcards.js`, `leseliste.js`, `ezidi.js`
- `rechner.js`, `umrechner.js`, `datum-rechner.js`, `waehrung.js`, `qr.js`, `barcode.js`, `lupe.js`, `taschenlampe.js`, `timer.js`, `random.js`, `text-analyse.js`, `filemanager.js`

`navigation.js` ist hier als mögliche Modulbezeichnung notiert, nicht als bestätigter Dateifund. Den tatsächlichen Bestand immer über den aktuellen Git-Baum verifizieren.

## 5. Bisherige Releases — bestätigte Historie

| Version | Inhalt |
|---|---|
| v153 | gemeinsame Hauptdatei-/Arbeitsbasis |
| v154 | HalDo Fahrschule Pro + HalDo Arztbuch Pro |
| v155 | HalDo Aufgaben Pro + HalDo Kalender Pro |
| v156 | HalDo Kontakte Pro + HalDo Dokumente Pro |
| v157 | HalDo Update Center + HalDo Backup & Recovery |
| v158 | Sprach-/Stimmenstudio und Mehrsprachigkeit |
| v159 | gemeinsamer HalDo AI Voice Core Pro |
| v160 | System Diagnostics und Versions-/Metadatenabgleich |
| v161 | universeller goldener Galaxie-Willkommensauftritt und App-Branding |
| v162 | Living Identity + Identity Bridge eingebunden |
| v163 | Lebendiger kosmischer Welcome-Auftritt: goldene Sonne, Lichtkranz, Partikel, Flügelbewegung und App-spezifische Identität |
| v164 | Originales `logo.png` als lebendiges goldenes Engel-Emblem mit Lichtkranz, Glanzreflexen, Sternen und subtiler Flügelbewegung |
| v165 | Drei neue A–Z-Apps: HalDo Bibliothek Pro, HalDo Inventar Pro und HalDo Mindmap Pro; lokale Speicherung, Suche, Status-/Bestandsverwaltung und JSON-Export |

### Zuletzt bestätigter GitHub-Stand
- v163 Hauptdatei-Commit: `d678bede14e9990f6ea17d75ffc5ddef2eff8cbe` (Titel/BUILD auf v163, Motion-Modul eingebunden).
- v163 Motion-Modul-Commit: `ddaaa184f88422d21e5c4b64a508021a089c60f3`; anschließende Cleanup-Verbesserung: `7f297f965a0f8bfa9d036db1d3a87bfef089c513`.
- Projektgedächtnis: `HALDO_MASTERPLAN.md`; README-Verweis-Commit: `5ea20ef140be8167afc309a54888d5f86353c60b`.
- Hauptdatei zuletzt geprüft: `index.html` v163; 925.755 Zeichen; 13.158 Zeilen beim Audit am 24.11.2026.
- Der v163 Deployment-Workflow war bei der letzten Abfrage noch in Bearbeitung; erst nach erfolgreichem Abschluss als veröffentlicht bezeichnen.
- Diese Angaben sind ein Audit-Snapshot und müssen vor jeder späteren Änderung erneut live geprüft werden.

## 6. A–Z Zielkatalog — geplante HalDo-App-Landschaft

Dies ist der langfristige Produktkatalog. Er ist absichtlich breiter als der aktuelle Codebestand. Ein Eintrag wird erst dann als **fertig** markiert, wenn Code, Registry, Launcher, Persistenz, Tests und Dokumentation geprüft wurden.

- **A — Alltag & Administration:** HalDo Alltag, Adressbuch/Kontakte, Arztbuch, Aufgaben, Audioaufnahme, Auto, Anatomie 3D Pro.
- **B — Bildung & Beruf:** HalDo Bildung, Bibliothek, Bewerbungen, Beruf & Karriere, Buchhaltung, Budget, Büro.
- **C — Creator & Kommunikation:** HalDo Chat, Community, Creator Studio, Cyborg, Clips/Video, Cloud-Dateien.
- **D — Dokumente & Daten:** HalDo Dokumente, Datenbank-Verwaltung, Datenanalyse, Diktat, Druck-/PDF-Center.
- **E — Energie & Ernährung:** HalDo Energie, Ernährung, Einkauf, Erinnerungen, E-Mail, Eltern-/Familienorganisation.
- **F — Fahrschule & Finanzen:** HalDo Fahrschule, Fahrtenbuch, Finanzen, Fitness, Foto-/Medienstudio.
- **G — Gesundheit & Geräte:** HalDo Gesundheit, Geräte-Center, Gewohnheiten, Gruppen, Gebäude-/Smart-Home-Steuerung.
- **H — Home & Haushalt:** HalDo Home, Haushalt, Hotspot-/Netzwerk-Center, Hilfe-Center, Human 3D.
- **I — Identität & Information:** HalDo Identity, Informations-Center, Inventar, Ideen-/Notizbuch.
- **J — Journal & Jobs:** HalDo Journal, Job-Center, Jahresplanung.
- **K — Kalender & Kommunikation:** HalDo Kalender, Kontakte, KI-Chat, KI-Lerncoach, Küche, Kreativstudio.
- **L — Lernen & Labor:** HalDo Lernen, Laborwerte, Laborbuch, Lebenslauf, Leseassistent, Lagerverwaltung.
- **M — Medizin & Medien:** HalDo Medizin, Medikamente/Medikamentenplan, Musikstudio, Mediencenter, Mindmap.
- **N — Notizen & Navigation:** HalDo Notizen, Navigation, Netzwerk, Nachrichten, Notfall-Center.
- **O — Organisation & Office:** HalDo Organizer, Office, Online-Speicher, OCR/Dokumentenscan.
- **P — Pflege & Projekte:** HalDo Pflege, Pflegedokumentation, Patientenverwaltung, Projekte, Passwortmanager, Präsentationen.
- **Q — Qualität & QR:** HalDo Qualitätsmanagement, QR-/Barcode-Center, Quiz.
- **R — Reisen & Rezepte:** HalDo Reisen, Rezepte, Ressourcenplanung, Recovery, Rechnungen.
- **S — Sicherheit & System:** HalDo Sicherheit, System-Center, Smart Home, Schlaf, Sprache/Stimmenstudio, Statistik.
- **T — Termine & Training:** HalDo Termine, Training, Timer, Textstudio, Übersetzung.
- **U — Umwelt & Universität:** HalDo Umwelt, Universität, Umrechner, Update Center, Unternehmensverwaltung.
- **V — Video & Verkehr:** HalDo Video Studio, Videoanrufe, Verkehr, Vokabeltrainer, Verträge.
- **W — Wissen & Wissenschaft:** HalDo Wissen, Wissenschaft, Welt, Wetter, Wörterbuch, Workflow.
- **X — X-Lab & Experimente:** HalDo X-Lab, experimentelle KI-/XR-/3D-Werkzeuge.
- **Y — Your Life:** HalDo Your Life, persönliche Lebensplanung, Ziele, Gewohnheiten.
- **Z — Zuhause & Zeit:** HalDo Zuhause, Zeit-/Weltuhr, Zeiterfassung, zentrale Geräte-Steuerung.

### Medizin-/Pflege-Fachkatalog als eigener Ausbaupfad
- Krankheiten und Symptome A–Z; Notfälle und Warnzeichen.
- Medikamente A–Z, Wirkstoff-/Präparat-Information, Interaktionen nur mit geprüften Datenquellen.
- Laborwerte A–Z mit Einheiten, Referenzbereichen, Alter-/Geschlechts-/Labor-Kontext und verständlicher Erklärung.
- Anatomie 3D Pro: Organe, Knochen, Muskeln, Gefäße, Nerven und Körpersysteme.
- Patientenaufnahme, Anamnese, Patientenverträge und Einwilligungen, Termin- und Behandlungsdokumentation.
- Pflegeplanung, Pflegeberichte, Betreuung, Vitalwerte, Übergabe, Medikamentenplan und Medikationsdokumentation.
- Datenschutz, Rollen/Rechte, Audit-Protokolle, Verschlüsselung, Export und sichere Backups.
- Keine erfundenen medizinischen Daten oder Dosierungen. Fachinhalte benötigen verlässliche Quellen und professionelle Prüfung.

## 7. Release v165 — drei neue A–Z-Apps

- **HalDo Bibliothek Pro (B):** Bücher/Medien erfassen, Autor und Kategorie pflegen, Lesestatus verwalten, suchen und JSON exportieren.
- **HalDo Inventar Pro (I):** Artikel, Kategorie, Standort, Menge und Mindestbestand erfassen; Bestände erhöhen/verringern, Warnstatus erkennen, suchen und JSON exportieren.
- **HalDo Mindmap Pro (M):** Gedanken/Knoten mit Thema, Details und Status erfassen, filtern, Status fortschreiben und JSON exportieren. Diese erste Version ist eine strukturierte Knotenverwaltung; grafische Verbindungslinien und Drag-and-drop sind ausdrücklich noch nicht enthalten.
- Alle drei Apps verwenden das bestehende HalDo-Fenstersystem und `HalDo.Store`; ihre IDs werden als Featured-Apps sowie in den A–Z-Kategorien B, I und M ergänzt.
- Lokale Browser-Speicherung bedeutet keine automatische Cloud-Synchronisierung. Export regelmäßig sichern.

## 8. Prioritäten für die nächsten Entwicklungsschritte

1. **v163 — Masterplan und Bestandsinventar:** dieses Dokument im Repository verankern, README verlinken, App-Registry und Modulstatus künftig nachvollziehbar pflegen.
2. **v164 — Living Golden Angel Emblem:** das originale `logo.png` im vorhandenen Welcome als golden leuchtendes, schwebendes Engel-Emblem mit Glanzreflexen, Lichtkranz, Sternpunkten und sanft bewegten SVG-Flügeln darstellen; Originalbild nicht ersetzen.
3. **Welcome/Identity-Audit:** v161-Begrüßung, `splash.js`, `logo.png`, Living Identity und Identity Bridge auf doppelte Startsequenzen, tatsächliche Einbindung und App-Startverhalten prüfen.
4. **App-Designsystem:** gemeinsame hochwertige Komponenten für Karten, Chat, Tabellen, Formulare, Seitenleisten und Fenster; pro App eigener Akzent und Begrüßung.
5. **App-Inventar vervollständigen:** jede App mit ID, Anzeigename, Kategorie, Entry-Datei, Launcher-Ziel, Status (fertig/in Arbeit/geplant), Funktionen, Speicher und Tests dokumentieren.
6. **Nächster regulärer App-Release:** erst nach dem Inventar zwei noch nicht vorhandene Apps auswählen und vollständig integrieren.

## 9. Release-Checkliste

- [ ] Aktuellen `main`-Commit und Datei-SHAs frisch abgerufen.
- [ ] Bestehende App-IDs und Module geprüft; keine Duplikate.
- [ ] Neue App(s) vollständig implementiert und im Manifest/Registry.
- [ ] Launcher, AppStore, Router und Fenster-Manager getestet.
- [ ] App-spezifischer Welcome-Text und Markenbild korrekt.
- [ ] `logo.png` unverändert erhalten und korrekt eingebunden.
- [ ] Responsive Desktop-/Tablet-/Mobilansicht geprüft.
- [ ] Speicherung, Export/Import und Fehlerfälle geprüft.
- [ ] JavaScript-/HTML-Syntaxprüfung durchgeführt.
- [ ] GitHub-Dateien nach Commit erneut abgerufen und Inhalt verifiziert.
- [ ] GitHub Actions und Pages-Deployment erfolgreich.
- [ ] Dieses Dokument und README aktualisiert.
- [ ] Übergabe mit Commit, Raw-Link, Änderungen und ehrlichem Teststatus erstellt.

---

**Arbeitsregel:** Bei jeder neuen Sitzung zuerst dieses Dokument und den aktuellen GitHub-Stand lesen. Keine alten Versionsstände als aktuelle Basis behandeln. Keine Veröffentlichung als erfolgreich bezeichnen, bevor GitHub Actions dies bestätigt.


# Verbindliche korrigierte Master-Spezifikation (Nutzerstand 24.11.2026)

Dieser Abschnitt ergänzt die bisherige Release-Historie und ist ab diesem Stand die maßgebliche Produkt- und Architekturplanung. Er ersetzt keine Prüfung des tatsächlich implementierten Codes. **Planung, Codebestand, technische Abhängigkeiten und getesteter Live-Status sind getrennt auszuweisen.**

## 1. Projektziel und Wahrheitsregeln

HalDo AI OS Pro Max ist eine responsive Browser-/PWA-Plattform für iPhone, iPad, Laptop und weitere Geräte. Die Zielshell bleibt `index.html`; eigenständige App-Logik gehört bevorzugt in eigenständige Module. Vor Änderungen sind IDs, Assets, Pfade, Abhängigkeiten, Script-Versionen und bestehende Funktionen zu inventarisieren. Nichts blind löschen oder überschreiben. Eine Funktion gilt erst nach tatsächlichem Code- und Geräte-/Browser-Test als fertig. Browser-/OS-Grenzen und fehlende Backend-Dienste müssen sichtbar ausgewiesen werden.

Die Oberfläche folgt dem holografischen HalDo-Design (Cyan `#00e5ff`, Blau `#4da8ff`, Purple `#b478ff`; Cyborg Pink/Violett; Glassmorphism, goldener Außen- und blauer Innenrahmen, Touch-/Safe-Area-Unterstützung). Vorhandenes `logo.png` bleibt erhalten. Top-Bar, Sidebar, Desktop-Fenster, Bottom-Bar [Chat]/[AI]/[CYBORG], App-Begrüßung und konfigurierbare Themes sind Teil des Zielbilds. Z-Index-Zielordnung: Fenster 200/250, Floating Panels 900, Toasts 1000, Modals 1100, Alerts 1200, Fenster-Aktionsbuttons 999999. Alte Störer-Selektoren nur nach Abhängigkeitsprüfung ändern.

## 2. Core-Architektur

Einheitliche Dienste: Boot/Version, App-Registry und Router, App-Lifecycle, Window Manager, Event Bus, Storage mit Namespaces/Migration/Export/Import/Backup, Settings, Localization/RTL, Permissions/Capabilities, Fehlerdiagnose, Offline/PWA und Update/Rollback. App-IDs müssen stabil und dedupliziert sein. Jede App braucht UI, Logik, State, Validierung, Fehler-/Leerzustände, Speicherverhalten, Touch-/Tastaturbedienung und Hilfe. API-Schlüssel und Provider-Geheimnisse gehören niemals in öffentliches Frontend-JavaScript oder `localStorage`.

Ziel-Globals und Funktionsverträge aus der Nutzerspezifikation (u. a. Memory, Journal, Goals, Habits, Tasks, Reminders, Calendar, Weather, Contacts, Notes, Finance, Music, Calculator, Recipes, Shopping, Timer, Translator, Workout, Utilities, QR, Random, Password, Analyzer, Date, Clipboard, Sleep, Mood, Bookmarks, Reading, Vocabulary, Flashcards, Periodic Table, Math, Statistics, Geo, Êzîdî und UI118) sind bei der Bestandsaufnahme gegen vorhandene APIs abzugleichen. Keine parallelen doppelten Services erzeugen.

## 3. 26 Kategorien – Sollumfang 375

| Code | Kategorie | Soll |
|---|---|---:|
| A | HalDo AI & Assistant Pro | 17 |
| B | HalDo Bildung Pro | 39 |
| C | HalDo Fahrschule Pro | 22 |
| D | HalDo Gesundheit Pro | 24 |
| E | HalDo Arbeit Pro | 18 |
| F | HalDo Finanzen Pro | 13 |
| G | HalDo Zuhause & Familie Pro | 13 |
| H | HalDo World Pro | 14 |
| I | HalDo Wissen Pro | 17 |
| J | HalDo Kultur & Religion Pro | 9 |
| K | HalDo Keyboard Pro | 11 |
| L | HalDo Lernen Pro | 11 |
| M | HalDo Medien Pro | 12 |
| N | HalDo Notizen Pro | 11 |
| O | HalDo Online Pro | 9 |
| P | HalDo Kreativität Pro | 11 |
| Q | HalDo Wissenschaft Pro | 11 |
| R | HalDo Sicherheit Pro | 10 |
| S | HalDo System Pro | 20 |
| T | HalDo Travel Pro | 14 |
| U | HalDo Universität Pro | 18 |
| V | HalDo Voice Pro | 9 |
| W | HalDo Windows Pro | 8 |
| X | HalDo Explorer Pro | 7 |
| Y | HalDo Your Life Pro | 12 |
| Z | HalDo Entwickler Pro | 15 |
| | **Gesamt** | **375** |

375 ist das Registry-/Planungsziel, kein Beleg für 375 fertige Apps. Unbenannte Plätze bleiben „Name/Funktion zu spezifizieren“. Die Kernliste hat eine Zählungsinkonsistenz (71 angekündigt, Einträge bis 75); Namen/IDs müssen dedupliziert werden. Tasks/ToDo, Statistics/Statistics 2, Utilities/QR sowie Avatar/Living Avatar sind fachlich abzugrenzen oder zusammenzuführen. Navigation und Connectivity sind als App/Systemdienst/Systemfähigkeit einzuordnen.

## 4. Explizite Kern-Apps

Die 75 Einträge der Nutzerspezifikation sind die Ausgangsliste für die Registry-Inventur: App-Registry, AI Memory, Journal, Goals, Habits, Tasks, Reminders, Dashboard, Avatar, Calendar, Fahrschule, Traffic/Fahrzeug-Modus, Weather LIVE, Contacts, Notes, Finance, Music Player, Calculator, Recipes, Shopping List, Timer, Translator, Workout, Utilities, QR Generator, Random, Password, Text Analyzer, Date Calculator, Clipboard, ToDo, Pomodoro, Water Tracker, Breathing, Statistics, Scientific Calc, Unit Converter, Currency Live, Health Calculator, Emergency Info, World Clock, Voice Memos, Camera, File Manager, Habit Heatmap, Sticky Notes, QR Sticker, Network Info, Device Info, Loan Calculator, Science Lab, Sleep Tracker, Mood Tracker, Bookmarks, Reading List, Vocabulary, Flashcards, Periodic Table, Math Solver, Statistics 2, Geo Quiz, Êzîdî Wissen, Recipe Scaler, UI-Revolution, UI-Reset, Holo UI, Musik Studio, Video Studio, API Key, Einstellungen, Arztbuch sowie E-Mail, Chat, Video Calls und Phone. Diese Liste ist nicht gleichbedeutend mit abgeschlossener Implementierung. Navigation Pro, WLAN/Bluetooth/Hotspot Center, Living AI Avatar und Cosmic World sind zusätzlich gewünschte Systemmodule/-fähigkeiten.

## 5. Einstellungen Pro – 26 Bereiche

Account & Profil; Benachrichtigungen; CYBORG & KI-Design; Display & Anzeige; Energie & Akku; Farbsystem & Themes; Geräte & Hardware; Hintergrund & Kosmos; Info & Über; Journal & persönliche Daten; KI & Assistant; Lautstärke & Töne; Mitteilungen & Datenschutz; Netzwerk & Internet; Online & Cloud; Passwörter & Sicherheit; Qualität & Leistung; Region & Sprache; Speicher & Daten; Tastatur & Eingabe; Updates & Software; Verbindung & Schnittstellen; Weltraum & Kosmos-Details; X-Faktor/Erweiterte Einstellungen; Your Life; Zeit & Datum. Jede Option erhält einen ehrlichen Funktionsstatus: aktiv, Browser-/Hardware-eingeschränkt, Backend/Native-App erforderlich oder nicht implementiert. Eine Website darf keine systemweiten Fähigkeiten vortäuschen.

## 6. Großsysteme und besondere Anforderungen

- **Fahrschule Pro Max:** Klassen AM, A1, A2, A, B, B96, BE, C1, C1E, C, CE, D1, D1E, D, DE, L, T; Sitzungsgrößen 15/20/30/45/50/60/90/120; Lern-, Themen-, Fehler-, Wiederholungs- und Prüfungsmodus, Feedback/Erklärungen, Statistik, Sprache/Voice. Amtliche/lizenzierte Fragen und Medien nur mit geklärten Rechten.
- **Arztbuch Pro:** medizinisches Dashboard, Krankheiten, Medikamente, Labor, Patientendokumentation/-verträge, Pflege, Notfall, IoT und 3D-Anatomie. Keine Diagnose-/Therapieentscheidung vortäuschen; klinische Daten nur mit geeigneter Zugriffskontrolle, Einwilligung und sicherem Backend. 3D-Viewer muss im Arztbuchfenster mounten, vorhandene GLB-Assets katalogisieren, Three.js-Versionen vereinheitlichen, Resize/Timeout/Fehler/Dispose korrekt behandeln. Details siehe `docs/ARZTBUCH_MASTERKATALOG_A-Z.md` und `database/arztbuch-schema-v1.sql`.
- **Êzîdî Wissen Pro:** eigenständige, quellengeprüfte Plattform für Êzîdî-Kultur, Religion, Geschichte, Orte, Traditionen und Sprachmaterial. Keine fremden Glaubensinhalte als Bestandteil der Glaubensdarstellung; Unsicherheiten/Quellen sichtbar.
- **Living HalDo AI/Jarvis/Cyborg:** eine gemeinsame Avatar-/Assistentenplattform mit Zuständen idle/listening/thinking/speaking/answering/error, kontrollierbarer Mimik/Gesten, TTS/STT soweit unterstützt, echter audio-gebundener Lip-Sync, Einwilligungs-Gedächtnis und bestätigungspflichtigen sensiblen Systemaktionen.
- **Cosmic World:** Sonne, die zwölf vom Nutzer benannten Himmelskörper (Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun, Pluto, Xena, Sedna, Eris), Erde/Mond, Sterne/Nebel/Sternschnuppen und konfigurierbare Performance.
- **Navigation Pro:** Karten-/Routenprovider, Orts-/Namenssuche, Standort nur nach Zustimmung, verifizierte Daten.
- **WLAN/Bluetooth/Hotspot Center:** Diagnose und unterstützte Browser-APIs; systemweite Funksteuerung benötigt native Companion-App/OS-Integration.

## 7. Kommunikation – vier eigenständige Apps

Die am 24.11.2026 ergänzte Communication Suite besteht aus **HalDo E-Mail Pro**, **HalDo Chat Pro**, **HalDo Video Calls Pro** und **HalDo Phone Pro**. Sie teilen Identität, Kontakte, Benachrichtigungen, Berechtigungen und Upload-Dienste, bleiben aber eigenständige Registry-Apps. HalDo-AI-Unterhaltungen bleiben ein separater Datenraum. Zuordnung: O (E-Mail/Chat), V (Video Calls/Phone); keine Erhöhung der 375 Sollplätze ohne deduplizierte Registry-Prüfung.

### E-Mail Pro
Mehrkontenclient, gemeinsamer Posteingang, Gmail/Outlook/Yahoo/iCloud und weitere Provider nur über tatsächlich unterstützte OAuth-/IMAP-/SMTP-Verbindungen; Ordner/Labels, Suche/Filter, Compose/Reply/Forward, CC/BCC, Anhänge, Signaturen, Vorlagen, Entwürfe, geplantes Senden, Offline-Entwürfe und Benachrichtigungen. `Halil@haldo.ai` ist Wunschadresse, nicht aktiv bis Domain, MX, SPF, DKIM, DMARC, Mailserver und Postfachzustellung eingerichtet/getestet sind. Keine Zugangsdaten/Tokens im Frontend oder localStorage.

### Chat Pro
Einzel-/Gruppen-/Team-Chats und Kanäle, Nachrichtenstatus, Antworten/Reaktionen/Bearbeiten/Löschen, Dateien/Bilder/Sprachnachrichten, Suche/Archiv, Blockieren/Melden, Push und Gerätesynchronisierung. E2EE erst nach geprüftem Protokoll und Schlüsselmanagement behaupten. Keine automatische AI-Einsicht in private Kommunikation.

### Video Calls Pro
1:1/Gruppen-Meetings, Räume/Links, Geräteprüfung, Kamera/Mikrofon, Galerie/Sprecher, Bildschirmfreigabe, Chat, Reaktionen/Handheben, Warteraum/Hostrechte, Untertitel/Übersetzung mit Einwilligung. Erfordert HTTPS, WebRTC, Signalisierungsserver und STUN/TURN. Aufzeichnung standardmäßig aus und nur mit ausdrücklicher Zustimmung aller Beteiligten.

### Phone Pro
Wählfeld, Kontakte/Favoriten/Anrufliste, HalDo-zu-HalDo-VoIP und externe PSTN-Telefonie nur über Provider/SIP-Gateway, Backend-Tokens und regulatorische Prüfung. Providerfunktionen wie Mailbox/Weiterleitung nur ausweisen, wenn unterstützt. `tel:` ist kein integriertes VoIP. Notruffähigkeit niemals ohne zugelassenen und getesteten Prozess behaupten; mobile Hintergrundtelefonie kann native Companion-App erfordern.

### Gemeinsame Kommunikationsdienste
Ziel-APIs: `HalDo.Email.accounts/connectAccount/createMailbox/send/draft/search/sync`; `HalDo.Chat.conversations/sendMessage/editMessage/deleteMessage/search/openConversation`; `HalDo.VideoCalls.createRoom/join/leave/mute/toggleCamera/shareScreen`; `HalDo.Phone.dial/answer/decline/hangup/hold/mute/history`. Jede Funktion zeigt ehrlichen Status (bereit, Provider verbinden, Backend fehlt, Browser nicht unterstützt, Berechtigung erforderlich, Fehler). AI-Zugriff nur nach expliziter kontextbezogener Freigabe.

## 8. Sprachen, Warnungen und Qualität

Lokalisierung zentral über Übersetzungsschlüssel, Fallback, RTL, Zahlen-/Datum-/Währungs-/Einheitenformat. Gewünschte Sprachen u. a. Deutsch, Englisch, Kurmanji, Sorani, Gorani, Türkisch, Arabisch, Persisch, Hebräisch, Russisch, Französisch, Spanisch, Italienisch, Chinesisch, Japanisch, Usbekisch und Latein; Êzîdî ist keine pauschale Sprachcode-Bezeichnung. Übersetzungsqualität kennzeichnen. Warnungen müssen Quelle, Aktualität und Unsicherheit zeigen.

## 9. Abnahmekriterien je App

1. Stabile deduplizierte Registry-ID, Name, Icon, Kategorie, Version, Beschreibung.
2. HalDo-Willkommen und responsives Layout.
3. Echte UI und Kernlogik; keine Scheinbuttons.
4. State/Speicherung über Schließen und Wiederöffnen.
5. Validierung, Bearbeiten, Löschen, Suche/Filter soweit passend.
6. Lade-, Leer-, Erfolgs- und Fehlerzustände.
7. Window Manager, Fokus/Z-Index, Touch/Tastatur.
8. Localization, Berechtigungen, Datenschutz.
9. AI/Voice nur bei echter Anbindung.
10. Desktop-/Mobile-/Medien-/3D-Tests und Regressionstests.
11. Nach Commit Raw-Datei erneut prüfen und GitHub Actions/Pages abwarten.

## 10. Umsetzungsphasen

0. Bestand/Backup/IDs/Assets/Abhängigkeiten inventarisieren.
1. Core und UI stabilisieren.
2. Arztbuch-3D-Viewer und Three.js-/GLB-Ladepfad reparieren.
3. Living AI/Jarvis/Cyborg.
4. Êzîdî Wissen Pro.
5. Apps A–Z in deduplizierten, testbaren Paketen.
6. Cosmic World, Fahrschule und Navigation.
7. Integration, Regression, Performance, Barrierefreiheit, Mobile/PWA, Backup/Migration und Release.

## 11. Inventarlücken

- 375 Sollplätze, aber nicht alle Namen/Funktionen eindeutig spezifiziert.
- Kernliste als 71 Apps bezeichnet, nummeriert bis 75.
- Tasks/ToDo, Statistics/Statistics 2, Utilities/QR, Avatar/Living Avatar abgrenzen.
- Systemmodule gegenüber Apps klassifizieren.
- Browser-/OS-Funktionen mit Status und echter Capability versehen.
- Kommunikations-IDs und bestehende Module vor Integration deduplizieren.
- `Halil@haldo.ai` bleibt Zieladresse bis erfolgreicher Mailserver-/DNS-/Zustellkonfiguration.

**Verbindlicher Grundsatz:** Diese Spezifikation beschreibt das Soll. Der jeweilige Ist-Stand wird separat anhand der aktuellen Repository-Dateien und realer Tests ausgewiesen.


## HALDO v166 – zusätzliche A–Z-Apps (25.11.2026)

Die folgenden drei Apps wurden als benannte Implementierungen innerhalb der bereits geplanten 375 App-Plätze ergänzt. Die Kategorien-Sollzahlen bleiben unverändert.

- **G – HalDo Haushaltsmanager Pro** (haushalt): lokale Haushaltsaufgaben mit Bereich, Zuständigkeit, Fälligkeitsdatum, Statuswechsel, Löschen und JSON-Export. Familien-/Cloud-Synchronisierung ist noch nicht vorhanden.
- **K – HalDo Keyboard Studio Pro** (keyboard-pro): virtuelles Eingabefeld mit Deutsch, Englisch, Kurmancî und Soranî, Einfügen, Löschen und Kopieren. Es ersetzt ausdrücklich nicht die systemweite iOS-/Android-/Windows-Tastatur.
- **X – HalDo Datei-Konverter Pro** (datei-konverter): lokale Textverarbeitung und Konvertierung TXT/CSV/JSON, Datei-Vorschau und Download. Unterstützt einfache CSV-Tabellen sowie JSON-Arrays von Objekten; PDF-/Office-/Bildkonvertierung ist nicht enthalten.

**Integration:** Die drei Apps werden in der bestehenden HalDo-App-Registry registriert und über H.Master.getCategoryApps() in G, K und X einsortiert. Die bestehende Fensterverwaltung und der lokale HalDo-Store werden weiterverwendet. Keine zusätzliche Kategorie und keine Erhöhung der 375 geplanten Plätze.

**Status:** JavaScript-Syntax des v166-Blocks geprüft. GitHub-Pages-Workflow nach dem korrigierten Commit noch in Ausführung; Veröffentlichung erst nach erfolgreichem Workflow bestätigen.

## HALDO MUSIC STUDIO PRO MAX — Integrationsstand (27.11.2026)

**Status: Implementierung auf Feature-Branch; noch nicht gemergt und nicht als veröffentlicht bestätigt.**

- Feature-Branch: feature/native-music-studio-pro-20261127.
- Neues Modul: music-studio.js. Es registriert HalDo.MusicStudio direkt und verwendet die vorhandenen Verträge HalDo.Win.open() und HalDo.Store.get()/set(). Die inkompatible Legacy-Schnittstelle HalDo.Runtime/HalDoApp() wird nicht benötigt.
- index.html: Der Medien-Kachel-Aufruf „Musik Studio“ öffnet jetzt HalDo.MusicStudio.open(). Das Modul wird nach dem vorhandenen v166-Script eingebunden. Die bestehende Registry-ID music-studio und Route MusicStudio bleiben erhalten.
- Funktionsumfang des aktuellen Integrationsstands: 7-Spur-Step-Sequencer (Kick, Snare, Hi-Hat, Bass, Chords, Lead, Vocal Synth), 16 Steps pro Takt, 40–240 BPM, 1–8 Takte, Instrumentenauswahl, Mute/Solo, Lautstärke/Panorama, Master-Lautstärke, Reverb/Delay, Visualizer, lokale Projektspeicherung, JSON-Import/-Export und Offline-WAV-Rendering.
- Audio-Lifecycle: AudioContext wird nach Nutzeraktion gestartet und beim Schließen des Fensters beendet. Der Export verwendet einen separaten OfflineAudioContext.
- Bewusste Abgrenzung: Dies ist die native, funktionale Studio-Grundlage – noch keine vollständige FL-Studio-/Ableton-Klasse-DAW. Mehrspur-Timeline mit frei verschiebbaren Audio-Clips, MIDI-Dateiimport/-export, Mikrofonaufnahme, Sample-Browser, Automation, Undo/Redo und umfangreiche Plug-in-/Effektketten bleiben eigene Ausbaustufen.
- Qualitätsstatus: GitHub-Dateien auf dem Feature-Branch erneut abgerufen und die erwarteten Registrierungs-/Launcher-Zeichenfolgen geprüft. Noch kein echter Browser-Audiotest, kein geräteübergreifender Test und kein erfolgreicher Pages-Deployment-Nachweis. Diese Punkte bleiben vor Merge/Release offen.
