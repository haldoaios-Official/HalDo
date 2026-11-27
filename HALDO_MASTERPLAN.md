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

1. Immer im bestehenden Repository `haldoaios-Official/HalDo` arbeiten. Produktive Änderungen ausschließlich auf einem ausdrücklich benannten Arbeitsbranch durchführen; `main` bleibt geschützt und wird nicht direkt beschrieben. Aktueller Arbeitsbranch: `work-v167-medical-apps`.
2. Vor jeder Arbeitseinheit Branch, HEAD-Commit, Datei-SHAs, offene Pull Requests, CI-Läufe, App-Registry, Dateibaum und betroffene Module erneut aus GitHub lesen. Nicht ungeprüft in einen veralteten Branch schreiben.
3. Die vorhandene vollständige `index.html` ist die zentrale Hauptdatei. Sie darf nicht durch ein neues Demo-Projekt, eine alte ZIP oder einen Parallelbau ersetzt werden.
4. Bestehende Apps, Funktionen, IDs, Daten, Bilder, Styles und Integrationen erhalten. Vorhandene Funktionen nicht blind duplizieren oder aus Bequemlichkeit entfernen.
5. Für jeden regulären App-Release werden zwei neue, eigenständige und sinnvoll vollständige HalDo-Apps gebaut. Beide müssen im Manifest/Registry, Launcher/AppStore und Start-/Fenstersystem korrekt integriert sein. System-, Wartungs-, Branding- oder Fehlerbehebungs-Releases dürfen zusätzlich erfolgen.
6. Keine App nur als Namen, Attrappe oder leeren Bildschirm veröffentlichen. Funktionen, Zustände, Speicherung, Fehlerfälle, Berechtigungen, Barrierefreiheit und mobile Darstellung prüfen.
7. Änderungen in kleinen, nachvollziehbaren und testbaren Schritten vornehmen. Vor größeren Eingriffen sichere Basis behalten; niemals einen alten Backup-Stand über die aktuelle Hauptdatei schreiben.
8. Nach jedem GitHub-Write die geänderten Dateien erneut von GitHub abrufen und Commit-SHA/Datei-SHA kontrollieren.
9. GitHub Actions, GitHub Pages-Deployment und produktive Erreichbarkeit separat prüfen. Ein erfolgreicher Testlauf bedeutet nicht automatisch, dass die Änderung veröffentlicht ist.
10. In jeder technischen Übergabe Version/Branch, Commit-SHA, geänderte Dateien, Funktionsumfang, durchgeführte Tests, bekannte Einschränkungen und Deploymentstatus nennen.
11. Keine geheimen Schlüssel, Passwörter oder privaten API-Tokens in öffentliche Dateien committen. Externe KI-Dienste nur mit sicherer Backend-/Proxy-Architektur oder vom Nutzer selbst konfigurierten Schlüsseln anbinden.
12. Den A–Z-Plan eigenständig in sinnvoller technischer Reihenfolge abarbeiten und den nächsten klaren Engpass selbst auswählen. Für kleine, reversible Code-, Test- und Dokumentationsänderungen ist keine wiederholte Einzelbestätigung nötig.
13. Riskante Aktionen – insbesondere Merge nach `main`, Veröffentlichung, irreversible Datenänderungen, kostenpflichtige Dienste oder sensible externe Verbindungen – erst nach ausdrücklicher Freigabe durchführen.
14. Keine Hintergrundarbeit oder späteren Ergebnisse versprechen. Den in der aktiven Sitzung möglichen Arbeitsschritt ausführen, Ergebnisse und offene Punkte dokumentieren und bei einer späteren Sitzung am gespeicherten Ist-Stand fortsetzen.
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

## HALDO v167 – Laborwerte Pro und Medikamentenplan Pro (25.11.2026)

Zwei eigenständige Dokumentations-Apps wurden als zusätzliche benannte Apps in den bestehenden A–Z-Plan aufgenommen:

- **L – HalDo Laborwerte Pro** (`laborwerte-pro`): Laborparameter, gemessener Wert, Einheit, Referenzbereich exakt laut Laborbefund, Befunddatum, Labor/Einrichtung und Notiz dokumentieren; Einträge bearbeiten, löschen und durchsuchen.
- **M – HalDo Medikamentenplan Pro** (`medikamentenplan-pro`): Medikament/Handelsname, Wirkstoff laut Packung/Verordnung, verordnete Dosierung als Freitext, Anwendungsform, verordnete Einnahmezeiten, Beginn/Ende, verordnende Praxis und Hinweise dokumentieren; Einträge bearbeiten, löschen und durchsuchen.

**Datenschutz- und Sicherheitskonzept:** Die beiden Module verwenden getrennte lokale Datentresore. Einträge werden vor dem Schreiben mit AES-256-GCM verschlüsselt; der Schlüssel wird aus einer vom Nutzer gesetzten Passphrase via PBKDF2-HMAC-SHA-256 (310.000 Iterationen) abgeleitet. Die Passphrase wird nicht gespeichert. Ein verschlüsseltes JSON-Backup kann heruntergeladen und wieder importiert werden. Beim Import werden Format, KDF-Parameter, Salt/IV, Größenlimits und die entschlüsselte Datenstruktur geprüft; das Backup wird erst nach erfolgreicher Entschlüsselung mit der Passphrase und ausdrücklicher Bestätigung lokal übernommen. Ein ungültiges Backup oder eine falsche Passphrase ersetzt keine vorhandenen Daten. Der Import akzeptiert nur verschlüsselte v1-Backups bis 5 MB. Ohne Passphrase sind die Daten nicht wiederherstellbar. Die Funktion benötigt HTTPS und Web Crypto. Es findet kein Upload der Datensätze statt.

**Medizinische Grenzen:** Beide Apps sind reine Dokumentationshilfen. Sie diagnostizieren keine Erkrankungen, interpretieren keine Laborwerte und empfehlen oder verändern keine Dosierungen. Referenzbereiche und Dosierungen müssen aus Originalbefund bzw. ärztlicher Verordnung übernommen werden. Die Apps ersetzen weder Patientenakte noch ärztliche Beratung oder ein geprüftes Medikationssystem.

**Integration:** Die Module werden in `js/haldo-v167-medical-apps.js` implementiert, über die bestehenden Fenster- und Registry-Schnittstellen gestartet und den A–Z-Buchstaben L und M zugeordnet. Der v166-Block wurde in `index.html` vor das schließende `</body>` verschoben; der Versionskopf wurde auf v167 gesetzt.

**Prüfstatus:** JavaScript-Syntax des neuen v167-Moduls sowie aller 25 ausführbaren Inline-Script-Blöcke der Hauptdatei erfolgreich statisch kompiliert. Der Chromium-End-to-End-Workflow hat den HalDo-Start, beide Apps, Verschlüsselung, CRUD, Passwortschutz, Backup-Rundlauf und Fensterschließen mit 17/17 Prüfungen erfolgreich bestätigt (Commit `ffbb5201d139024f9a1b7fae17d36fe48493e387`). Die anschließende Arztbuch-Kommandozentrale-Integration wird separat getestet. GitHub-Pages-Veröffentlichung und produktiver Browser-Test sind damit noch nicht bestätigt.



## HALDO Arztbuch – Kommandozentrale-Integration (26.11.2026)

Die bestehende App **Arztbuch** wird als zentraler Einstieg für die medizinischen Dokumentationsmodule erweitert, ohne die vorhandenen Gesundheitsfunktionen zu entfernen.

- **Laborwerte Pro:** eigener Schnellzugriff auf den verschlüsselten Laborwerte-Tresor.
- **Medikamentenplan Pro:** eigener Schnellzugriff auf den getrennten verschlüsselten Medikamentenplan-Tresor.
- Die bestehenden Bereiche Symptom-Checker, Medikamente, Notfall, Anatomie, Fitness, Ernährung, Impfungen, Laborwerte und Mental Health bleiben erhalten.
- Die Schnellzugriff-Kacheln sind per Maus und Tastatur bedienbar. Die Kacheln werden nur innerhalb des zugehörigen Arztbuch-Fensters gebunden.
- Beim Öffnen werden die vorhandenen HalDo-Launcher- und Fenster-Schnittstellen verwendet; die medizinischen Apps erhalten keine zweite, separate Speicherimplementierung.

**Medizinische Grenzen:** Das Arztbuch ist eine Informations- und Dokumentationsoberfläche. Die neuen Tresore dokumentieren eingetragene Daten; sie stellen keine Diagnose, interpretieren keine Laborbefunde und ändern keine ärztlichen Dosierungsanweisungen.

**Abnahme:** Der reale Weg `Arztbuch → Laborwerte Pro` und `Arztbuch → Medikamentenplan Pro` wurde im Chromium-End-to-End-Workflow erfolgreich geprüft. **21 von 21 Prüfungen bestanden** auf Commit `15198dd8efe00a25f70a6e07c424b6dde356937b`; Workflow: `https://github.com/haldoaios-Official/HalDo/actions/runs/45734441796`. Der Test hat das bestehende v154-Arztbuch geöffnet und seinen separaten Tresor entsperrt, danach beide v167-Module über die neuen Schnellzugriffe gestartet und deren Verschlüsselungs-/CRUD-/Backup-Abläufe geprüft. Die klinische und datenschutzrechtliche Prüfung bleibt ein eigener Freigabeschritt; GitHub-Pages-Veröffentlichung ist nicht Bestandteil dieses Browserlaufs.

## HALDO Arztbuch – Vitalwerte-Dokumentation (26.11.2026)

Das bestehende Arztbuch Pro (v154) enthält nun einen zusätzlichen Bereich **Vitalwerte** innerhalb derselben verschlüsselten persönlichen Akte.

- Eigene Messgröße, Messwert, Einheit, Messdatum, Quelle der Angabe und optionale Notiz erfassen.
- Vitalwert-Einträge bearbeiten und löschen; Übersicht zeigt Anzahl und den zuletzt gespeicherten Eintrag.
- Speicherung läuft über den bereits vorhandenen v154-Arztbuch-Tresor (AES-GCM-256, PBKDF2-SHA-256 mit 210.000 Iterationen). Es wurde kein paralleler Vitalwerte-Speicher angelegt.
- Rückwärtskompatibilität: Beim Entsperren älterer v154-Datensätze ohne `vitals`-Array wird das Feld im Arbeitsspeicher ergänzt. Die bestehende Akte muss nicht vorab manuell konvertiert werden; die neue Struktur wird beim nächsten Speichervorgang mitverschlüsselt.
- Die vorhandenen Bereiche Arzttermine, Medikamente, Allergien, Laborwerte und Notizen sowie die Schnellzugriffe auf Laborwerte Pro und Medikamentenplan Pro bleiben erhalten.

**Medizinische Grenzen:** Die Vitalwerte sind manuell erfasste bzw. vom Nutzer übertragene Dokumentation. Es gibt keine automatische Geräteverbindung, Grenzwertbewertung, Diagnose, Therapieempfehlung, kontinuierliche Überwachung oder Notfallalarmierung. Einheit und Quelle werden mitgespeichert; medizinische Interpretation erfolgt nicht durch dieses Modul.

**Abnahme:** GitHub Actions Chromium-End-to-End-Lauf **25/25 erfolgreich** auf Code-/Test-Commit `2b426e2407f9ebfb47967bd4c5ca2d31f5a9261f`. Workflow: https://github.com/haldoaios-Official/HalDo/actions/runs/45739739542. Geprüft wurden: echter älterer verschlüsselter v154-Tresor ohne Vitalwerte-Feld entsperren; Kompatibilität des neuen Bereichs; Vitalwert anlegen, bearbeiten, löschen und verschlüsselt speichern; danach weiterhin die vollständigen Kernabläufe, Passwortfehler, Backup-Wiederherstellung und Fensterschließen von Laborwerte Pro und Medikamentenplan Pro. Alle 25 Prüfungen erfolgreich.

**Release-Grenzen:** Der Arbeitsstand liegt weiterhin im Draft-PR #1 und ist nicht gemergt. `main` wurde nicht verändert. GitHub-Pages-Veröffentlichung sowie klinische und datenschutzrechtliche Freigabe sind nicht Bestandteil dieses Tests.

## HALDO Arztbuch Pro – Vitalwerte-Verlauf, Auswertung und Export (26.11.2026)

Der Vitalwerte-Bereich des bestehenden Arztbuchs wurde nach der Grunddokumentation um einen nachvollziehbaren Verlauf erweitert:

- Chronologische Sortierung nach Messdatum; Textsuche über die gespeicherten Vitalwert-Angaben.
- Inklusive Datumsfilter „Von“ und „Bis“.
- Grafische Verlaufskurve nur für numerische Einzelwerte mit gültigem Datum und identischer Messgrößen-Bezeichnung sowie Einheit. Verhältniswerte wie Blutdruck „120/80“ und nichtnumerische Angaben bleiben in der Eintragsliste; sie werden nicht fälschlich als Einzelzahl interpretiert.
- Bei mehreren Messgrößen getrennte Auswahl der Datenreihe. Es werden nie unterschiedliche Einheiten in einer Kurve zusammengeführt.
- Monats-/Jahresübersicht pro ausgewählter Messreihe mit Anzahl, Minimum, Durchschnitt und Maximum. Diese Werte sind rein statistisch und keine medizinische Bewertung.
- Suche, Datumsfilter und Reihen-/Zeitraumauswahl erhalten unfertige Formulareingaben beim erneuten Rendern.
- CSV-Export enthält nur die aktuell gefilterten Vitalwerte und zeigt vor dem Export klar an, dass CSV unverschlüsselte Gesundheitsangaben enthält. Die lokale Tresorablage selbst bleibt AES-GCM-verschlüsselt; der Export ist bewusst eine separate Klartextdatei.

**Abnahme:** GitHub Actions Chromium-Lauf #45, Job „Encrypted vault end-to-end tests“, auf Commit bed28c9ec542dee230ddcdbf0805e0ea908687e4: **32/32 Browserprüfungen erfolgreich**. Geprüft wurden u. a. Rückwärtskompatibilität des älteren Arztbuch-Tresors, Vitalwert anlegen/bearbeiten/löschen, Textsuche, inklusive Von-/Bis-Datumsgrenzen, Erhaltung unfertiger Formularwerte, numerische Verlaufskurve, Monats-/Jahresumschaltung und Sichtbarkeit der CSV-Export-Schaltfläche. Die tatsächliche heruntergeladene CSV-Datei und deren vollständiger Inhalt sind noch nicht durch einen eigenen Download-/Dateiinhalt-End-to-End-Test abgedeckt; dies bleibt ein offener Testpunkt.

**Repository-Status bei dieser Aktualisierung:** Arbeitsbranch work-v167-medical-apps; Draft-PR #1 gegen main; der Branch lag beim letzten Vergleich 49 Commits vor main und 0 Commits dahinter. Kein Merge, keine Pages-Veröffentlichung. Klinische, datenschutzrechtliche und produktive Freigabe sind separate Abnahmeschritte.

## HALDO Core-Architektur-Audit – tatsächlicher Laufzeitpfad (26.11.2026)

Die aktuelle produktive Startseite wurde erneut direkt im Arbeitsbranch untersucht. Diese Befunde sind wichtig, bevor die 375 geplanten Plätze weiter aufgefüllt werden:

- `index.html` ist weiterhin die tatsächlich zentrale Startseite (rund 968 KB Quelltext). Der Hauptteil des Systems – Registry, Fenster-/Startlogik, App-Katalog und zahlreiche Apps – ist in der Datei als Inline-JavaScript enthalten. Die statischen Script-Referenzen der Seite laden Three.js r128 samt Controls/GLTF/DRACO sowie Living-Identity-/Welcome-Dateien und das v167-Medizinmodul.
- Die eingebettete Basis-Registry enthält 71 eindeutige Featured-IDs. Spätere Integrationen ergänzen `chat-pro`, drei v165-Apps und drei v166-Apps. Die Code-Inventur ergibt damit 78 benannte Einträge nach diesen Erweiterungen; eine separate Laufzeit-Zählprüfung soll dies noch festigen.
- Die 26 Buchstabenkategorien summieren sich auf 375 geplante Plätze. Diese Zahl ist die Sollkapazität, nicht die Anzahl fertiger, installierter oder produktiv geprüfter Anwendungen.
- Im Repository liegen zusätzlich ältere Dateien wie `registry.js`, `apps.js`, `app-manager.js`, `router.js`, `runtime.js` und `window-manager.js`. Sie erscheinen nicht in den statischen Script-Referenzen der aktuellen `index.html`. Sie dürfen nicht ungeprüft als aktive Runtime behandelt oder zusätzlich eingebunden werden; ihre verbliebenen Referenzen und ihr Legacy-Status sind separat zu klären.
- Die zentrale Startfunktion wird über mehrere aufeinanderfolgende Integrationsblöcke erweitert. Das macht Startpfade schwer nachvollziehbar und verlangt eine systematische App-ID-zu-Modul-Prüfung.
- Ein früherer Fallback erzeugte für manche nicht speziell implementierten IDs eine generische Listen-App. Diese ist eine provisorische Datensammel-Oberfläche und kein Nachweis einer fachlich vollständigen App. Solche Einträge müssen in der späteren App-Inventur sichtbar als Scaffold/Platzhalter klassifiziert werden.
- Der bestehende CI-Workflow ist derzeit auf die medizinischen Browserabläufe ausgerichtet. Ein vollständiger Plattform-Smoke-Test für Registry-Konsistenz, Launcher-Abdeckung, AppStore, Fensterverwaltung, Mobile-Layout und sämtliche App-Familien fehlt noch.

**Erster Core-Fix:** Der gemeinsame Basis-Launcher prüft jetzt vor dem allgemeinen Begrüßungs-Fallback, ob unter der stabilen App-ID ein Modul mit `open()` registriert ist. So können spätere v165-/v166-Module ihre echte Implementierung über den zentralen Startweg erreichen, ohne die vorhandenen Sonderrouten zu ersetzen. Sechs Chromium-Startprüfungen für Bibliothek, Inventar, Mindmap, Haushaltsmanager, Keyboard Studio und Datei-Konverter wurden ergänzt. Die zugehörigen GitHub-Actions-Läufe #48 und #49 sind zum Zeitpunkt dieser Dokumentation noch nicht abschließend ausgewertet.

**Nächste Core-Prioritäten:**
1. Ergebnis der sechs Launcher-Tests auswerten und ggf. Start-/Schließfehler beheben.
2. Für jede benannte Registry-ID tatsächliches Modul, konkreten Startpfad, Funktionsstatus und Datenpersistenz erfassen; generische Scaffolds ausdrücklich von vollständigen Apps trennen.
3. Registry, Launcher, AppStore und Fenster-Lifecycle schrittweise vereinheitlichen, ohne Legacy-Dateien doppelt zu laden oder vorhandene IDs/Daten zu verändern.
4. Einen eigenständigen Plattform-Smoke-Test aufbauen. Erst danach weitere App-Paare im A–Z-Katalog in planmäßiger Reihenfolge umsetzen.
5. Anschließend die 3D-Anatomie-Ladepfade und Three.js-/GLB-Versionen systematisch vereinheitlichen; danach Living AI/Avatar und die übrigen Großsysteme.

**Sicherheitsgrenze:** Diese Bestandsaufnahme ist eine Code-/Repository-Prüfung, kein vollständiger manueller UX-, Mobile-, Penetrations-, Datenschutz- oder klinischer Freigabetest.

## Core-Launcher-Abnahme und Anatomie-Asset-Inventur (26.11.2026)

### Launcher-Abnahme

GitHub Actions Lauf #49 (`45750570163`) auf Commit `fbcbc5b568b3f25ed3b3f85c96c8e3237b2f2ce3` ist abgeschlossen: **33/33 Chromium-Browserprüfungen erfolgreich**. Zusätzlich zu den bisherigen Arztbuch-, Laborwerte- und Medikamentenplan-Prüfungen öffnen sechs v165/v166-Apps über `HalDo.Launch` tatsächlich ihre eigenen Module: Bibliothek, Inventar, Mindmap, Haushaltsmanager, Keyboard Studio und Datei-Konverter. Der gemeinsame Basis-Launcher prüft nun registrierte `HalDo[app.id].open()`-Module vor dem generischen Begrüßungs-Fallback. Das ist eine Launcher-Integration, keine vollständige Funktionsabnahme dieser sechs Apps.

### Anatomie 3D – verifizierte Dateistruktur

Die rekursive Git-Baum-Inventur auf `work-v167-medical-apps` ergab 539 GLB-Dateien im Repository, davon 537 unter `models/`. Die direkt im jeweiligen Profilordner vorhandenen Knochenmodelle sind:

- `models/adult_male/`: 179 einzelne GLB-Knochenmodelle.
- `models/adult_male/adult_female/`: 179 einzelne GLB-Knochenmodelle mit denselben Dateinamen.
- `models/adult_male/adult_female/baby.glb/`: 178 einzelne GLB-Knochenmodelle; `c1_atlas.glb` fehlt in diesem Profil. `baby.glb` ist im Git-Baum ein Verzeichnis, keine einzelne GLB-Datei.
- Ein Neugeborenen-Profilverzeichnis `models/neonate/` ist nicht vorhanden.

Der In-Shell-Viewer in `index.html` enthält inzwischen zwei getrennte Arbeitsweisen: (1) vorhandene einzelne GLB-Knochenmodelle aus den verifizierten Profilpfaden laden und (2) ein vollständiges schematisches Skelett aus `models/skeleton.js`, `base-bones.js`, `extended-bones.js` und `procedural.js` aufbauen. Die Profilwahl umfasst adult_male, adult_female, infant und neonate; das Skelett bleibt ausdrücklich eine schematische Lernansicht in willkürlichen Einheiten. `anatomie.html` bleibt eine separate Seite mit Three.js 0.160 ES-Modulen und externem `body.glb`; der integrierte Viewer nutzt das globale Three.js r128. Diese Laufzeitpfade dürfen nicht ungeprüft vermischt werden.

Die vorhandenen `models/manifest.json` und `models/sources.json`, auf die `models/loader.js` standardmäßig zugreift, fehlen derzeit. Die separate `js/haldo-human-3d-engine.js` verwendet eigene `assets/avatars/*.glb`-Pfade; Anatomie-Knochenmodelle werden nicht als Avatar-Ersatz verwendet. Vollständigkeit, Skinning/Animation und Lizenzherkunft der großen Root-GLBs sind noch nicht bestätigt.

### Katalogkorrektur

`models/catalog.js` wurde anhand der tatsächlichen Git-Pfade korrigiert: Adult Male und Adult Female zeigen auf die vorhandenen 179-Datei-Ordner; Infant zeigt auf den vorhandenen 178-Datei-Ordner `baby.glb/`; Neonate ist ausdrücklich `placeholder` ohne Root. Die Katalogfunktion gibt für nicht vorhandene Profil-/Knochen-IDs `null` zurück, statt still auf ein anderes Profil auszuweichen. `models/loader.js` nutzt jetzt diese Pfadauflösung und lehnt nicht verfügbare Assets ab, bevor ein 3D-Loader initialisiert wird.

**Aktueller Testpunkt:** Browser-End-to-End-Prüfung lädt `models/catalog.js` und `models/loader.js`, überprüft die drei konkreten Modellpfade per HTTP HEAD (Erwartung: 200) und prüft die Ablehnung von `c1_atlas` im Infant-Profil sowie des nicht vorhandenen Neonate-Profils. GitHub Actions Lauf #53 auf dem aktuellen Test-Commit ist noch nicht abschließend ausgewertet; vor der nächsten Integration ist das Ergebnis abzuwarten.

**Freigabegrenze:** Die Katalogkorrektur dokumentiert nur vorhandene Dateien und Pfade. Sie behauptet weder einen vollständigen Ganzkörper-Viewer noch medizinische Genauigkeit oder geprüfte Nutzungsrechte. Vor einem produktiven Anatomie-Release müssen GLB-Struktur (Meshes/Nodes/Skinning/Animation), Asset-Quelle und Lizenz, Profilabdeckung und tatsächliche Darstellung im Browser gesondert geprüft werden.

## Anatomie 3D – GLB-Struktur und Kandidatenbewertung (26.11.2026)

GitHub Actions Chromium-Lauf #56 (`45751307888`) auf Commit `f2b0f2f79c761dcd8552a1039a87e6fff732c6f5` ist erfolgreich: **35/35 Browserprüfungen**. Neben der verifizierten Profilpfad-Auflösung wurden zwei lokale GLB-2.0-Dateien bytegenau strukturell gelesen:

- `female-base-mesh-base_female.glb`: 4.497.424 Byte, 166 GLTF-Nodes, 2 Meshes, 1 Skin, 0 Animationen. Damit ist es ein skinned Base-Mesh-Kandidat für den Anatomie-Viewer; es wurde noch nicht visuell, morphologisch oder lizenzrechtlich freigegeben und wird nicht automatisch als Avatar verwendet.
- `models/adult_male/adult_female/c1_atlas.glb`: 42.512 Byte, 2 Nodes, 1 Mesh, 0 Skins, 0 Animationen. Es ist ein einzelnes statisches Knochenmodell, kein rigged Ganzkörpermodell.

Der Viewer verwendet die einzelnen GLB-Dateien weiterhin als separate auswählbare Modelle; das zusammengesetzte 179-Knochen-Skelett wird derzeit aus prozedural erzeugter Lehrgeometrie aufgebaut. Die GLB-Kandidaten sind nicht automatisch in das prozedurale Skelett eingesetzt. Diese Trennung schützt vor der falschen Behauptung, dass einzelne Knochen-GLBs bereits ein vollständiges Ganzkörpermodell ergeben.

GitHub Actions Lauf #57 (`45751373420`) auf Commit `688c3803a7cb2f93cd17e681f1103ee83c8b6eea` war erfolgreich: **36/36 Browserprüfungen**. Lauf #60 (`45751602470`) auf Commit `cdd57ca1ef722f2df819d4608157bb8b98716ed5` war ebenfalls erfolgreich: **37/37 Prüfungen**. Darin wurden die 179 eindeutigen Knochen-Definitionen, 556 erzeugte Meshes und alle vier schematischen Profile geprüft.

## Anatomie-Viewer – Bedienintegration und asynchrone Stabilität (26.11.2026)

### Aktueller Funktionsumfang im Hauptsystem

Der aktuelle `index.html`-Viewer enthält bereits die sichtbare Bedienintegration: Anatomie-Tab, Profil-Auswahl für vier schematische Profile, Schaltfläche für das gesamte schematische Skelett, separate Schaltfläche für einzelne GLB-Modelle, lokale GLB/GLTF-Dateiauswahl, Orbit-/Touch-Steuerung und eine Knochen-Informationskarte. Die 3D-Auswahl führt über Raycasting vom Canvas zur Knochen-ID; die Informationskarte zeigt deutsche, englische und lateinische Bezeichnung sowie Körperregion und Seite. Die Darstellung kennzeichnet ihre willkürlichen Einheiten und den fehlenden klinischen Einsatz ausdrücklich.

`models/skeleton.js` stellt den wiederverwendbaren Builder bereit. Er prüft doppelte Knochen-IDs, baut 179 anatomische Definitionen als 179 Knochenobjekte auf, liefert die ID-Suche über `byId` und stellt eine zentrale Ressourcenfreigabe für Geometrien und Materialien bereit.

### Stabilitätskorrektur

Der Viewer hat jetzt Request-Tokens für asynchrone Modellladevorgänge. Ein verspätet eintreffendes GLB-Ergebnis darf kein inzwischen neueres schematisches Modell mehr überschreiben. Beim Wechsel des Tabs oder Schließen des Fensters werden laufende Requests ungültig gemacht, das aktuelle Objekt entfernt und die Ressourcen/der Renderer freigegeben. Temporäre lokale Blob-URLs werden bei Fehlern, veralteten Antworten oder beim Wechsel auf ein anderes Modell freigegeben.

### Browserabnahme

GitHub Actions Lauf #61 (`45751778936`) auf Commit `c2ea7326a4ee8e96cbb048f756b25d05a1a935b6` war erfolgreich: **37/37 Browserprüfungen** für die damaligen Core-, Anatomie-Modul- und Arztbuchtests.

Die ersten UI-End-to-End-Läufe deckten zwei echte Integrationsprobleme auf:
- Lauf #63 scheiterte zuerst an einem mehrdeutigen Playwright-Tab-Selektor; der Test wurde auf den konkreten Tab-Button eingegrenzt.
- Läufe #66 und #67 zeigten anschließend, dass eine spätere v151-Stabilisierungsroutine die frühere Anatomie-Implementierung überschreibt. Der Test hatte deshalb das alte aktive Arztbuch-Fenster geöffnet, das die neuen Skelett-Steuerelemente noch nicht enthielt. Die Profilwahl, der Skelett-Builder, Raycasting-Auswahl und die Ressourcenbereinigung wurden daraufhin in die tatsächlich aktive v151-Runtime integriert – nicht nur in den früher überschriebenen Codeblock.

**Abnahme der aktiven Runtime:** GitHub Actions Lauf #68 (`45752661749`) auf Commit `02e809acd4ac64161075244c82fad9cb5b6ac480`: **41/41 Browserprüfungen erfolgreich**. Im tatsächlichen Arztbuch-Fenster wurden das schematische Erwachsenenskelett gerendert, ein Knochen angeklickt und seine deutschen, englischen und lateinischen Angaben geprüft. Säuglingsprofil, weibliches Profil, Viewer-Neuaufbau und Ressourcenfreigabe beim Tabwechsel/Fensterschließen wurden ebenfalls erfolgreich geprüft.

**Abnahme Einzel-GLB im aktiven Viewer:** Lauf #72 (`45753639149`) auf Commit `7911a9b1b4f636f9bb150c2571cad0b8fd1b3e87` ist erfolgreich: **42/42 Browserprüfungen**. Die Laufzeitdiagnose ergab `stabilization151:false`; aktiv ist die frühere `H.Anatomy3D.open`-Funktion mit dem Statusformat `3D-Modell geladen: ...`. Der Test war zunächst auf den Statusstring der anderen v151-Funktion fixiert. Nach Anpassung auf beide vorhandenen Erfolgsmeldungen wurde der explizite Klick auf „Einzelknochen laden“ erfolgreich geprüft; `models/adult_male/adult_female/c1_atlas.glb` wurde geladen und dargestellt.

**Abnahme lokaler GLB-Import und Blob-Lifecycle:** GitHub Actions Lauf #75 (`45754100205`) auf Commit `45e8e5a86e5bceff556961cc8897b8cdbc03ba38`: **44/44 Browserprüfungen erfolgreich**. Geprüft wurden der explizite Einzel-GLB-Ladevorgang, Import einer lokalen GLB-Datei via `blob:`-URL, Ersetzung des lokalen Modells durch das schematische Skelett und der tatsächliche Aufruf von `URL.revokeObjectURL` für die lokale Blob-URL. Danach liefen Knochen-Auswahl, Profilwechsel und Fenster-/Viewer-Aufräumen weiter erfolgreich.

**Neue Eingabehärtung:** Der lokale Import akzeptiert jetzt nur eigenständige `.glb`-Dateien. `.gltf` mit externen Neben-Dateien wird abgewiesen, da die relativen Ressourcendateien über die temporäre Blob-URL nicht zuverlässig auflösbar sind. Lokale GLB-Dateien über 64 MB werden abgelehnt. Die bereits geladene Modellansicht bleibt bei einer abgewiesenen Eingabe erhalten.

**Abnahme Eingabehärtung:** GitHub Actions Lauf #79 (`45754564860`) auf Commit `fba3bab90d083ca7dc991144f74cf6a6c85f3383` war erfolgreich: **45/45 Browserprüfungen**. Eine externe `.gltf`-Datei wurde abgewiesen, während die bereits geladene GLB-Ansicht erhalten blieb.

**Abnahme deutsche Anatomie-Terminologie:** GitHub Actions Lauf #84 (`45755017353`) auf Commit `8cd2a3e7e491e6b08395139eaf05f4abc9725bc2` war erfolgreich: **46/46 Browserprüfungen**. Für alle 179 Knochen-Definitionen sind deutsche Namen und deutsche Regionsbezeichnungen vorhanden (`missingGerman: []`). Stichproben geprüft: Schädel, 2. Halswirbel, 1. Rippe links, Oberschenkelknochen rechts, Mittelglied des Zeigefingers links und Endglied der kleinen Zehe rechts. Der aktive Viewer zeigt beim Anklicken Deutsch, Latein, Englisch, Körperregion und Seite.

**Nächster Schritt:** durchsuchbarer Knochenkatalog mit deutscher/lateinischer/englischer Suche, Filter nach Körperregion und direkter Auswahl des Knochen-Eintrags. Danach Ladefehler/Retry, Lizenz-/Quellenmetadaten und fehlende Paketmanager-Manifeste klären, bevor Assets als offline-downloadbare Pakete angeboten werden.


## Anatomie 3D – Knochenkatalog und Regionsfilter (26.11.2026)

Der aktive Arztbuch-Viewer enthält jetzt zusätzlich einen interaktiven Knochenkatalog:

- Suche über deutsche, englische und lateinische Bezeichnungen sowie stabile Knochen-IDs.
- Akzentunabhängige Suche: „schadel“ findet beispielsweise „Schädel“.
- Filter nach den neun vorhandenen Körperregionen.
- Der Regionsfilter begrenzt sowohl die Trefferliste als auch die tatsächlich sichtbaren Knochen im 3D-Modell.
- Suchtreffer lassen sich direkt auswählen; der passende Knochen wird hervorgehoben und seine Bezeichnungen/Region/Seite werden in der Informationskarte angezeigt.
- Die Trefferliste ist bei großen Treffermengen begrenzt dargestellt; Trefferzahl und Anzahl sichtbarer Knochen werden ausgewiesen.
- Beim Laden eines Einzel-GLB werden die Skelettsuche und Regionsfilter deaktiviert, damit keine falschen Katalogtreffer zum importierten Einzelmodell angezeigt werden.

**Technische Umsetzung:** `index.html` enthält die Such-/Filterbedienung, die akzentunabhängige Normalisierung und das Sichtbarkeitsmanagement. Die bestehenden `models/skeleton.js`-Definitionen und die zentrale `byId`-Zuordnung bleiben die Datenquelle; es wird kein zweiter Knochenkatalog angelegt.

**Abnahme:** GitHub Actions Lauf #88 (`45756658850`) auf Test-Commit `45145393f11a99615430441357d6aabfc5131ae3`: **47/47 Chromium-Browserprüfungen erfolgreich**. Neu geprüft wurden Umlaute-Suche, Namenssuche nach linkem Oberschenkelknochen, direkte Auswahl/Markierung, Filter auf die Körperregion Schädel (2 sichtbare Knochen) und Zurücksetzen auf 179 sichtbare Knochen. Die bisherigen Viewer-, Profilwechsel-, Ressourcenfreigabe-, Arztbuch-, Laborwerte- und Medikamentenplanprüfungen blieben ebenfalls erfolgreich.

**Nächster Anatomie-Schritt:** Beim Auswählen aus dem Katalog die Kamera gezielt auf den Knochen fokussieren; danach gezielte Ansichten/Layer für Knochen, Muskeln und Organe nur mit tatsächlich vorhandenen oder ausdrücklich als schematisch markierten Assets ergänzen. Vor dem Zusammenführen externer Anatomie-GLBs bleiben Quelle, Lizenz und anatomische Zuordnung zu prüfen.

### Kamera-Fokus für Suchtreffer

Die Auswahl eines Knochen-Eintrags aus dem Suchkatalog richtet die Perspektivkamera nun auf den ausgewählten Knochen aus. Dabei wird die vorhandene Blickrichtung beibehalten; die Kameraabstände werden anhand der tatsächlichen Objektbegrenzung berechnet. Die Auswahl per direktem Klick auf das 3D-Modell bleibt unverändert.

**Abnahme:** GitHub Actions Lauf #91 (`45756897378`) auf Commit `403cd7b966e1d2a4822c409173fb86664772dd25`: **47/47 Browserprüfungen erfolgreich**. Die bestehende Such-/Regionstestfolge wählt den linken Oberschenkelknochen aus der Liste aus und bestätigt die Kamera-Fokusmeldung für genau diesen Knochen.

### Kamera- und Filter-Reset

Der Filter-Reset setzt nun zusätzlich die Perspektivkamera auf das gesamte Skelett zurück, entfernt eine aktive Knochenmarkierung und zeigt wieder alle 179 Knochen. Suchtext und Regionsauswahl werden geleert. Damit ist der Wechsel zwischen gezielter Detailansicht und Gesamtübersicht ohne erneutes Schließen/Öffnen möglich.

**Abnahme:** GitHub Actions Lauf #93 (`45756951571`) auf Commit `c1a87d696c9ed992a1be6cf3cf59ff066f1ad238`: **47/47 Browserprüfungen erfolgreich**. Der E2E-Test prüft nach der Regionsfilterung 179 sichtbare Knochen, leere Such-/Regionsfelder und die Bestätigung „Kamera zurückgesetzt“.

## HalDo App-Registry – wahrheitsgemäße Implementierungsstatus (26.11.2026)

Die zentrale App-Registry unterscheidet jetzt drei Zustände pro benannter App:

- **Modul vorhanden:** ein eigenes Startmodul mit `open()` wurde über die geprüfte Modulzuordnung gefunden. Das ist kein Nachweis, dass jede Fachfunktion fertig ist.
- **Grundgerüst:** das automatische generische Factory-Fallback wurde explizit markiert (`isGenericFallback` / `implementationKind: generic-scaffold`). Es bleibt startbar, wird aber nicht als fachlich fertige App ausgegeben.
- **Prüfung offen:** die App-ID wird noch nicht eindeutig einem eigenen Modul oder einem bekannten Factory-Grundgerüst zugeordnet. Eine Sonderroute darf nicht irrtümlich als fehlendes oder fertiges Modul bewertet werden.

Die App-Registry zeigt diese Kennzeichnung auf jedem benannten Karten-Eintrag sowie eine Zusammenfassung oben. Die 375 geplanten Plätze bleiben die Sollkapazität der 26 Buchstabenkategorien. Die tatsächliche Zahl benannter App-IDs und deren Implementierungsstatus wird separat erfasst.

**Abnahme:** GitHub Actions Lauf #97 (`45757482836`) auf Commit `f4d4ed2c64efc4deb6586e2bc33974ca001310b9`: **49/49 Chromium-Browserprüfungen erfolgreich**. Geprüft wurden 26 Kategorien, 375 Sollplätze, eindeutige Registry-IDs, der Status eines generischen Reminders-Grundgerüsts, das vorhandene Chat-Pro-Modul und die tatsächliche Anzeige der Status-Tags in der geöffneten App-Registry.

**Erste Laufzeit-Zählung:** 86 benannte App-IDs, 25 mit eigenem erkannten Startmodul, 4 generische Grundgerüste und 57 noch zu prüfende Zuordnungen. Diese Zahlen beschreiben den Erkennungsstand der Registry, nicht die Anzahl fertig abgenommener Fach-Apps. Die offenen Zuordnungen werden als nächster Schritt anhand der wirklichen Launcher-Routen und Laufzeitmodule einzeln geprüft.

## HALDO v168/v169 – A–Z-Apps und Abnahme (26.11.2026)

### v168 – Weltuhr Pro und Rezept-Skalierung Pro

- **HalDo Weltuhr Pro:** IANA-Zeitzonen hinzufügen/entfernen, mehrere Ortszeiten live darstellen, speichern, nach Suchbegriff filtern und nach erneutem Öffnen wiederherstellen.
- **HalDo Rezept-Skalierung Pro:** Rezepte mit Zutaten und Basismengen speichern, Portionszahl ändern und Mengen neu berechnen; Basisrezept bleibt unverändert, Rezepte lassen sich bearbeiten und löschen.
- Doppelte Begrüßungsweiterleitung im App-Launcher entfernt: v168-Apps geben die Kontrolle an die globale HalDo-Willkommensschicht ab, statt eine zweite Begrüßung selbst zu starten.
- Der Browser-Test wartet auf die tatsächlich gerenderten App-Karten, bevor er Inhalte prüft. So wird verzögertes Mounting nicht mit einem fehlenden Modul verwechselt.

**Abnahme:** GitHub Actions Lauf #120 (`45761953174`) auf Commit `e8fe01a0a16dedb4a7fd41ef0be21c425c16129f`: **51/51 Chromium-Browserprüfungen erfolgreich**. Die Weltuhr wurde mit Hinzufügen, Live-Anzeige, Speichern, Wiederherstellen, Suchen und Entfernen getestet. Die Rezept-Skalierung wurde mit Rezeptanlage, zwei Zutaten, Verdoppelung der Portionen, unveränderten Basiswerten und Löschen getestet.

### v169 – Workout Planner Pro und Werkzeuge Pro

- **HalDo Workout Planner Pro:** Trainingseinheiten mit Datum, Dauer, Notizen und Übungen anlegen; pro Übung Sätze, Wiederholungen und optionales Gewicht erfassen; Einheiten bearbeiten, durchsuchen und entfernen. Die Daten liegen lokal im HalDo Store. Das Modul bietet Trainingsdokumentation, keine medizinische oder therapeutische Empfehlung.
- **HalDo Werkzeuge Pro:** Längen-, Massen-, Volumen-, Flächen-, Geschwindigkeits- und Temperaturumrechnung; Prozentwertberechnung; Kalendertag-Abstand zwischen zwei Daten; letzter Berechnungsverlauf lokal speichern und löschen.
- Beide Module ersetzen die bisherigen generischen Datensammel-Grundgerüste derselben App-IDs. Registry-Status wird dynamisch als eigenes Modul erkannt; `workout` ist im G-Katalog, `utilities` im U-Katalog eingetragen.
- Die Laufzeitzählung bleibt bei 86 benannten App-IDs und 26 Kategorien/375 Sollplätzen. Der Status verschiebt sich auf 72 eigene Module, 3 generische Grundgerüste, 1 zentrale Route und 10 noch zu prüfende Zuordnungen.

**Abnahme:** GitHub Actions Lauf #124 (`45762384692`) auf Commit `c7d6eb5da2253b9e167971a17ed0bf4eebc3735e`: **53/53 Chromium-Browserprüfungen erfolgreich**. Geprüft wurden Modulregistrierung, Workout-CRUD/Bearbeiten/Suche/Löschen, Einheitenumrechnung (2.500 m → 2,5 km), Prozentrechnung (15 % von 200 → 30), Datumsabstand (1.–26. November 2026 → 25 Tage), lokaler Berechnungsverlauf und vollständige Regression der vorhandenen medizinischen und Anatomie-Tests.

**Zusätzliche Registry-Prüfung:** `index.html` wurde danach ergänzt, damit Werkzeuge Pro unter U auch im sichtbaren A–Z-Kategoriefilter erscheint. Der Browser-Test prüft nun die Kategorie-Kacheln G (Workout) und U (Werkzeuge) einschließlich des Status-Tags „Modul vorhanden“. Lauf #125 (`45762656371`) und Lauf #126 (`45762674927`) prüfen diesen Nachtrag noch; deren Endergebnis ist bei dieser Dokumentation offen.

**Release-Grenze:** Alle oben genannten Änderungen liegen im Arbeitsbranch `work-v167-medical-apps` und sind nicht nach `main` gemergt oder veröffentlicht. Die 375 Plätze bleiben Sollkapazität; nicht spezifizierte oder generische Scaffolds sind weiterhin offen.

## HALDO v170 – Rezepte Pro und Text Analyzer Pro (26.11.2026)

### HalDo Rezepte Pro

- Eigenständiges Rezeptbuch, getrennt von der vorhandenen Rezept-Portionsskalierung.
- Rezepte mit Name, Kategorie, Portionen, Zubereitungszeit, Zutaten (Menge/Einheit), Zubereitungsschritten und Notizen/Allergenhinweisen anlegen.
- Favoriten, Bearbeiten, Löschen, Suche über Namen und Zutaten sowie Kategorienfilter.
- Daten werden lokal im HalDo Store gespeichert. Pflichtfelder werden erst beim endgültigen Speichern vollständig validiert; Zutatenzeilen lassen sich während der Bearbeitung hinzufügen/entfernen, ohne dass der ganze Entwurf schon vollständig sein muss.

### HalDo Text Analyzer Pro

- Lokale Analyse von Zeichen, Zeichen ohne Leerzeichen, Wörtern, Sätzen, Absätzen, Zeilen, durchschnittlicher Wortlänge, geschätzter Lesezeit und häufigen Wörtern.
- Sofortige Aktualisierung während der Eingabe; Text bleibt im Browser und wird nicht automatisch übertragen.
- Beim Speichern wird nur eine Zusammenfassung mit Titel und Kennzahlen abgelegt, nicht der Originaltext. Verlauf bleibt nach Schließen/Wiederöffnen verfügbar und lässt sich löschen.
- Umlaute und Unicode-Buchstaben werden in der Wortzählung berücksichtigt. Die Lesezeit ist eine grobe Schätzung (200 Wörter/Minute), keine verbindliche Messung.

Beide Apps sind als eigenständige Module registriert: `recipes` unter G und `analyzer` unter A. Die aktuelle Registry-Inventur zeigt 86 eindeutige App-IDs, 26 Kategorien, 375 geplante Plätze sowie 74 eigene Module, 3 generische Grundgerüste, 1 zentrale Route und 8 noch zu prüfende Zuordnungen. „Modul vorhanden“ ist der technische Integrationsstatus, keine vollständige Fachabnahme jedes Moduls.

**Abnahme:** GitHub Actions Lauf #136 (`45763693310`) auf Commit `25769af20eed87f2fc7c968066d4fb7a7182ac26`: **55/55 Chromium-Browserprüfungen erfolgreich**. Zusätzlich zur bisherigen 53/53-Regression wurden Rezeptanlage mit Pflichtfeldfehler, Kategorien, zwei Zutaten, Zubereitungsschritte, Speichern, Schließen/Wiederöffnen, Favorit, Bearbeiten, Suche/Filter und Löschen geprüft. Der Text Analyzer wurde mit Live-Kennzahlen geprüft; beim Speichern blieben Originaltext und Rohtextfelder aus dem gespeicherten Verlauf heraus. Der Verlauf wurde nach Wiederöffnung wiederhergestellt und anschließend gelöscht. Die sechs v165/v166 Launcher-Tests, v168/v169-Apps, Anatomie-/GLB-/Skelett-Tests sowie Arztbuch-, Vitalwerte-, Laborwerte- und Medikamentenplan-Regressionen bestanden ebenfalls.

**Technische Korrekturen während der Abnahme:** Die Versionsprüfung unterscheidet jetzt korrekt `AppsV169.version` (169.0.0) und `AppsV170.version` (170.0.0). Zutatenzeilen lassen sich vor vollständiger Rezeptvalidierung bearbeiten; die komplette Pflichtfeldprüfung bleibt beim Speichern aktiv.

**Freigabegrenze:** Änderungen bleiben auf `work-v167-medical-apps`, Draft-PR #1; kein Merge nach `main` und keine produktive Veröffentlichung.

## HALDO v171 – Datumsrechner Pro und Geräte-Info Pro (26.11.2026)

### HalDo Datumsrechner Pro
- Monatsarithmetik begrenzt auf das gültige Monatsende (z. B. Monatswechsel vom 31. Januar).
- Kalender-Tagesabstände, Arbeitstage und ISO-Kalenderwochen werden getrennt berechnet.
- Der zuletzt verwendete Verlauf wird lokal gespeichert und kann gelöscht werden.

### HalDo Geräte-Info Pro
- Lokale Browser-, Bildschirm-, Sprache-, Zeitzonen- und verfügbare Web-API-Diagnose.
- Aktualisierung der angezeigten Momentaufnahme; keine Berechtigungsabfrage für Kamera, Mikrofon, Standort oder Funkgeräte.
- Keine WLAN-SSID, MAC-Adresse oder gekoppelten Bluetooth-Geräte auslesen. Nicht verfügbare Browserinformationen bleiben als nicht verfügbar gekennzeichnet.

**Abnahme:** GitHub Actions Lauf #145 (`45799265039`) auf Commit `997e37b352944e8f3f570c58f7befd3c01b8cac8`: **58/58 Chromium-Browserprüfungen erfolgreich**. Neben beiden v171-Apps wurden die gesamte bisherige v168–v170-Regression, App-Registry-Inventur, Anatomie-Viewer, Profilwechsel, Knochenkatalog, Arztbuch, Vitalwerte, Laborwerte und Medikamentenplan geprüft.

### Zusätzliche Core-/Anatomie-Korrektur in diesem Abnahmeschritt
- Die spätere v151-Stabilisierungsdatei enthielt fünf ungültig maskierte Template-String-Ausdrücke und wies denselben `H.Anatomy3D`-Namespace erneut zu. Das verursachte einen JavaScript-Syntaxfehler und hätte den vollständigen Pro-Max-Viewer mit Knochenkatalog überschrieben.
- Die spätere Zuweisung ist jetzt nur noch ein Fallback, wenn kein früherer Anatomy3D-Baustein vorhanden ist. Die fehlerhaften Escape-Zeichen sind korrigiert. Der primäre Viewer meldet `pro-max-v2` und seine geprüften Funktionen (Knochenkatalog, Profile, Raycast-Auswahl, Ressourcenfreigabe).
- Der Test überprüft, dass die Stabilisierungsdatei ohne Syntaxfehler geladen ist und der vollständige Viewer aktiv bleibt. Browserlauf #145 enthält diese Prüfung und ist mit 58/58 bestanden.

**Statusgrenze:** Die v171-Module sind im Arbeitsbranch registriert und in der genannten Browser-Suite abgenommen; das ist keine Live-Veröffentlichung. Der Draft-PR bleibt unverändert offen.

## HALDO v172 – Atemtrainer Pro und Wissenschaftsrechner Pro (26.11.2026)

### HalDo Atemtrainer Pro
- Ersetzt das generische Atemübungs-Grundgerüst durch eine eigenständige App.
- Drei auswählbare Rhythmen: ruhige Atmung 5/5, Box-Atmung 4/4/4/4 und 4-7-8.
- 2, 4, 6, 8 oder 12 Runden, gut sichtbare Phasen- und Countdown-Anzeige, Start, Pause, echtes Fortsetzen mit erhaltener Restzeit und Zurücksetzen.
- Die App startet nie automatisch. Sie zeigt einen klaren Wellness-Hinweis und empfiehlt, bei Schwindel, Atemnot oder Unwohlsein sofort aufzuhören.
- Lokal gespeichert werden nur die ausgewählten Voreinstellungen sowie bei abgeschlossenen Sitzungen Rhythmus, Rundenzahl und Dauer; keine Gesundheits- oder Diagnosedaten.

### HalDo Wissenschaftsrechner Pro
- Ersetzt das generische Grundgerüst durch einen eigenen wissenschaftlichen Rechner mit DEG/RAD, trigonometrischen und inversen trigonometrischen Funktionen, Wurzel, ln/log10, abs, exp, Potenzen, Fakultät, Prozent, π, e und Ans.
- Der Ausdruck wird durch Tokenizer und rekursiven Parser ausgewertet. Es werden keine dynamische Codeausführung, `eval` oder `new Function` verwendet.
- Eingaben sind begrenzt; ungültige Zeichen, Klammern, Division durch null, unzulässige Wurzeln/Logarithmen, Fakultät außerhalb 0–170 und nicht endliche/zu große Ergebnisse werden abgefangen.
- Der lokale Verlauf speichert nur den eingegebenen Ausdruck, das Ergebnis und den Zeitpunkt. Verlauf und Winkelmodus lassen sich lokal löschen bzw. ändern.

**Technischer Stand:** `js/haldo-v172-learning-apps.js` ist angelegt und in `index.html` nach v171 eingebunden. Die beiden App-IDs behalten ihre bestehenden Registry-Plätze und werden als eigenständige Module registriert. Der zentrale HalDo-Build wird auf `172.0.0` gesetzt; die Modulversionsnummern v168, v169, v170 und v171 bleiben unabhängig.

**Abnahme noch offen:** Die Chromium-End-to-End-Suite für die v172-Module ist aktuell in GitHub Actions. Sie prüft die echte Registrierung, Atemrhythmus/Runden/Start/Pause/Fortsetzen/Reset sowie DEG/RAD, Funktions- und Potenzberechnung, Ans, Fehlerfälle, Verlaufsspeicherung und das Fehlen dynamischer Codeausführung. Die Testausführung muss abgeschlossen sein, bevor diese beiden Apps als browsergeprüft markiert werden.

**Release-Grenze:** Änderungen bleiben auf `work-v167-medical-apps` und Draft-PR #1. Kein Merge nach `main`, keine GitHub-Pages-Veröffentlichung. Ein vorhandenes Modul ist nicht automatisch fachlich vollständig freigegeben.
## HALDO v174 – Einheiten-Umrechner Pro, Habit Heatmap Pro und Medizinlexika (26.11.2026)

### HalDo Einheiten-Umrechner Pro
- Umrechnung von Länge, Masse/Gewicht, Volumen, Fläche, Geschwindigkeit, Zeit, Temperatur, Druck und Datenmenge.
- Temperaturumrechnung erfolgt über Kelvin; Temperaturen unter dem absoluten Nullpunkt werden abgewiesen.
- Dezimale und binäre Datenmengeneinheiten sind getrennt bezeichnet (KB/MB mit 1000er-Schritten, KiB/MiB mit 1024er-Schritten).
- Lokaler Verlauf mit Speichern und Löschen über den bestehenden HalDo Store. Keine externen Umrechnungsdienste.

### HalDo Habit Heatmap Pro
- Monatsansicht für alle bestehenden Gewohnheiten oder eine einzelne ausgewählte Gewohnheit.
- Check-ins werden direkt über `HalDo.Habits` gelesen und geändert. Es wird kein zweiter Gewohnheitenspeicher angelegt.
- Monatsnavigation, Check-in-Tage, aktive Tage, Erfüllungsübersicht und aktuelle Serie; zukünftige Tage sind gesperrt.
- Bei fehlenden Gewohnheiten kann die erste Gewohnheit erstellt und danach in der bestehenden Habits-App weiterverwaltet werden.

### Krankheitslexikon Pro und Medikamentenlexikon Pro
- Eigenständige Such- und Katalogansichten mit Kategorien und Detailinformationen.
- Medikamenten- und Sicherheitshinweise müssen mit den angezeigten offiziellen Fachquellen geprüft werden; der Katalog ersetzt weder ärztliche Verordnung noch Gebrauchsinformation oder pharmazeutische Beratung.
- Keine individuelle Diagnose, Dosierungsentscheidung oder automatische Therapieempfehlung.

### Technische Integration
- Utility-Module in `js/haldo-v174-utility-apps.js`; Registry-Namespace `HalDo.AppsV174Utility` ist getrennt von den medizinischen Katalogen `HalDo.AppsV174`.
- Beide Utility-Apps sind im vorhandenen App-Launcher registriert; Modulstatus wird in der zentralen A–Z-Registry angezeigt.
- Der Habit-Kalender nutzt die vorhandene Datenstruktur. Der Umrechnungsverlauf ist lokal und separat gekennzeichnet.

## HALDO v175 – QR Studio, QR Sticker, PDF-Center und Dokumenten-Scanner (26.11.2026)

### HalDo QR Studio Pro
- QR-Generierung für Text, HTTP-/HTTPS-URL, WLAN-Zugang, vCard-Kontakt, E-Mail, SMS und Geo-Koordinaten.
- Download des generierten Codes als PNG; URL-Protokollprüfung und Eingabevalidierung.
- WLAN-Passwörter sind naturgemäß im fertigen QR-Payload enthalten. Die App weist ausdrücklich darauf hin, solche Codes nur mit vorgesehenen Personen zu teilen.
- Verwendet die fest versionierte QR-Renderer-Bibliothek `qrcode@1.5.3` aus einem CDN. Der QR-Inhalt selbst wird lokal an die Renderer-Bibliothek im Browser übergeben und nicht an einen QR-Erzeugungsdienst hochgeladen. Für das erstmalige Laden der Bibliothek ist eine Internetverbindung erforderlich.

### HalDo QR Sticker Pro
- Mehrere QR-Aufkleber aus Zeilen im Format `Titel | Inhalt` erstellen.
- Drucklayout mit bis zu 12 Aufklebern pro Seite; übergroße Eingabelisten werden abgewiesen.
- Der Sticker-Inhalt bleibt lokal im geöffneten Browserfenster.

### HalDo PDF- & Druck-Center Pro
- Textdokumente lokal als PDF 1.4 erzeugen und herunterladen.
- Lokale PDF-, PNG- und JPEG-Dateien im aktuellen Browser-Tab ansehen und über die Browser-/Betriebssystem-Druckfunktion ausgeben.
- Dateien werden nicht zu einem HalDo-Server hochgeladen und nicht dauerhaft im HalDo Store abgelegt. Die Objekt-URLs werden beim Wechseln/Schließen freigegeben.

### HalDo Dokumenten-Scanner Pro
- Dokumentaufnahme über eine lokale Bilddatei oder nach ausdrücklicher Browserfreigabe über die Kamera (HTTPS/secure context erforderlich).
- Helligkeit, Kontrast, Graustufen und 90°-Drehung; bis zu 30 Seiten pro PDF mit Umordnen, Entfernen und mehrseitigem PDF-Export.
- Bilder und Seiten bleiben nur im Arbeitsspeicher des aktuellen Browser-Tabs; beim Schließen werden Kamera-Streams gestoppt und Objekt-URLs freigegeben.
- Aktuelle Grenzen sind sichtbar dokumentiert: keine OCR-Texterkennung, keine automatische Kantenerkennung, keine perspektivische Entzerrung und keine dauerhafte Scan-Ablage. Die vorhandene Version ist ein lokaler Mehrseiten-Scanner-Grundumfang und kein vollständiger Ersatz für professionelle Dokumentenmanagement- oder OCR-Software.

### Technische Integration und Konfliktvermeidung
- QR-Module in `js/haldo-v175-qr-apps.js` verwenden `HalDo.AppsV175Qr`.
- PDF-/Scanner-Module in `js/haldo-v175-document-apps.js` verwenden `HalDo.AppsV175Documents`.
- Die zwei getrennten Registry-Namensräume vermeiden, dass das Laden der QR-Datei die PDF-/Scanner-Registry überschreibt oder umgekehrt. Der gemeinsame HalDo-System-Build ist `175.0.0`.
- Beide Skripte werden nach den v174-Modulen in `index.html` geladen und registrieren ihre stabilen App-IDs in der bestehenden A–Z-Registry.

**Abnahme v175 – aktuell in Arbeit:** GitHub Actions Lauf #189 (`45808104525`) läuft auf dem aktuellen PR-Head `1b0d185b64462084e640b76bf09c9bd7ba3d30cc`. Die aktualisierte Chromium-Suite umfasst Runtime-/Registry-Checks, URL- und WLAN-QR-Generierung, PNG-Download, Sticker-Seitenerstellung, echte PDF-Datei aus Text sowie einen lokalen Mehrseiten-Scan mit PDF-Seitenzahl- und Löschprüfung. Bis der Lauf erfolgreich beendet ist, gelten diese Tests als ausstehend; die Module werden nicht vorzeitig als browserabgenommen markiert.

**Release-Grenze:** Alle Änderungen befinden sich auf `work-v167-medical-apps` und Draft-PR #1. Der Arbeitsbranch lag beim letzten Vergleich 197 Commits vor `main` und 0 dahinter. Kein Merge nach `main`, keine Veröffentlichung/Pages-Deployment. Die 375 Registry-Plätze sind weiterhin die geplante Katalogkapazität, nicht die Zahl der vollständig umgesetzten und freigegebenen Anwendungen.


## HALDO v176 – Wissenschaftslabor, WLAN/Bluetooth-Manager und aktuelle Browserabnahme (26.11.2026)

### HalDo Wissenschaftslabor Pro
- Eigenständiges lokales Formel- und Einheitenlabor mit 24 geprüften Formeln, Suche, Berechnung und lokalem Verlauf.
- Nenner-/Eingabevalidierung verhindert ungültige Berechnungen; die App ersetzt keine fachliche oder medizinische Beratung.

### HalDo WLAN- & Bluetooth-Manager Pro
- Zeigt nur Netzwerk- und Geräteinformationen an, die der Browser tatsächlich bereitstellt.
- Bluetooth-Verbindung erfolgt ausschließlich nach ausdrücklicher Auswahl im Browser-Gerätewähler. GATT-Merkmale können – sofern das Gerät und der Browser sie freigeben – gelesen und nach expliziter Nutzeraktion beschrieben werden.
- Browser-Sicherheitsgrenzen bleiben bestehen: keine stille WLAN-Passwort-/SSID-Auslesung, kein Zugriff auf beliebige gekoppelte Geräte und keine Umgehung von Berechtigungen.

### Aktuelle Abnahme – GitHub Actions Lauf #211
- Lauf #211 (ID `45826798332`) auf Commit `97d83060987d8c24a9c7b86d9b1c3e4ec31b6c4d`: **86/86 Chromium-Browserprüfungen erfolgreich**.
- v176: Wissenschaftslabor (24 Formeln, Suche, Berechnung, Verlauf, Nennerprüfung) sowie WLAN/Bluetooth-Manager (Browsergrenzen, expliziter Gerätewähler, GATT-Lesen, bestätigtes Schreiben und Trennen).
- Anatomie 3D: Modellpfade, GLB-Metadaten, vier schematische Profile mit je 179 Knochen, deutsche Namen/Regionen, Knochenkatalog, Auswahl, Profilwechsel, lokaler GLB-Import und Ressourcenfreigabe. Das schematische Skelett ist ausdrücklich als nicht klinisch und in willkürlichen Einheiten gekennzeichnet.
- Arztbuch: verschlüsselter Tresor, Vitalwerte, Suche/Datumsfilter, Verlauf, Bearbeiten/Löschen, Monats-/Jahresübersicht und tatsächlicher CSV-Dateidownload. CSV-Datei geprüft auf UTF-8-BOM, Spalten, beide Messdatensätze, korrektes Quoting und Entschärfung von Tabellenformeln.
- Laborwerte und Medikamentenplan: verschlüsselte Speicherung, Bearbeiten/Löschen, Backup-Wiederherstellung und falsche Passphrase/Backup-Ablehnung.
- Weitere geprüfte Module: Pflegeprotokoll, Arzttermine/Überweisungen, Krankheits- und Medikamentenlexikon, Einheiten-Umrechner, Habit Heatmap, QR Studio/Sticker, PDF-Center, Dokumenten-Scanner.
- Der ältere Abschnitt zur v175-Abnahme weiter oben ist historisch; Lauf #211 enthält die vollständige aktualisierte Suite einschließlich v175/v176 und Arztbuch-CSV-Download.

### Verbleibende Arbeit und Release-Grenze
- Die Registry-Zahl von 375 bleibt ein Planungsziel, kein Nachweis von 375 fertigen Apps. Generische Grundgerüste und ungeprüfte Zuordnungen müssen weiterhin einzeln inventarisiert und entweder fachlich implementiert oder ehrlich als geplant/Grundgerüst markiert werden.
- Ein erfolgreicher Chromium-Lauf bestätigt die geprüften Browserabläufe, aber weder medizinische Validierung noch Produktions-/Live-Betrieb auf GitHub Pages.
- Alle Änderungen bleiben auf `work-v167-medical-apps` und Draft-PR #1. Kein Merge nach `main`, keine produktive Veröffentlichung.


### Korrigierte Registry-Inventur aus Lauf #211
- Die Laufzeitprüfung meldet aktuell **92 eindeutige App-IDs in 26 Kategorien** bei 375 geplanten Katalogplätzen.
- Statusverteilung: **90 eigenes Startmodul**, **1 generisches Grundgerüst**, **1 zentrale Route**, **0 ungeklärte Zuordnungen**.
- Diese Zählung ersetzt die ältere Inventur mit 86 App-IDs / 25 Modulen / 4 Grundgerüsten / 57 ungeprüften Zuordnungen aus dem früheren Abschnitt. Die alten Zahlen bleiben als historischer Zwischenstand lesbar.
- „Eigenes Startmodul“ bedeutet ausschließlich, dass die Registry eine eigene `open()`-Implementierung erkennt. Es ist keine vollständige fachliche Abnahme aller Funktionen, Datenquellen, Berechtigungen, Barrierefreiheit oder Sicherheitsanforderungen.

## AKTUELLER IST-STAND – v176 / Registry-Audit vom 27.11.2026

Dieser Abschnitt korrigiert die älteren Zwischenzahlen im Abschnitt „Korrigierte Registry-Inventur aus Lauf #211“. Maßgeblich ist jetzt der erneute Laufzeit-Audit im aktuellen Arbeitsbranch `work-v167-medical-apps` sowie die Registry-Abnahme im Browser-Test.

- **92 eindeutige App-IDs** in der Registry.
- **26 Kategorien** mit zusammen **375 geplanten Plätzen**.
- **92 Einträge mit eigenem erreichbarem Startmodul** laut `HalDo.AppBrowser.getStatus()`.
- **0 generische Grundgerüste**, **0 reine Start-Routen** und **0 ungeklärte Registry-Zuordnungen** in diesem Audit.
- Das bedeutet: Alle 92 aktuell benannten Registry-Apps besitzen einen erkannten Startpfad. Es bedeutet ausdrücklich **nicht**, dass alle 92 Apps bereits fachlich vollständig, sicherheitsgeprüft, barrierefrei oder auf allen Geräten abgenommen sind.
- 375 bleibt der geplante Gesamtausbau. Gegenüber 92 benannten IDs sind **283 Plätze noch nicht als eigenständige App-IDs benannt bzw. implementiert**. Die Namen und Funktionen dieser Plätze müssen anhand der Nutzerwünsche konkretisiert werden; sie dürfen nicht als fertige Apps ausgegeben werden.

### Aktuelle CI-Prüfung

- GitHub Actions Lauf **#231** (`45928317252`) auf Branch-Commit `206d602d1cfc801a204aeedd6e3049837ee0f4f7`: **25/25 Testgruppen erfolgreich**.
- Der Lauf prüft unter anderem OS-Start, Registry-/Launcher-Zuordnung, A–Z-Kategorien, medizinische Tresore, Vitalwerte, v168–v176-Module und die dokumentierten Browserabläufe.
- Der frühere umfassende Lauf **#211** (`45826798332`) mit **86/86 Einzelprüfungen** bleibt als historischer Abnahmestand dokumentiert; er ist nicht mit dem neueren Lauf #231 gleichzusetzen.

### Nachprüfung vom 27.11.2026 – Lauf #232

- Der aktuelle PR-Head `65bb0008a3e2ec43de0c74bbf788da39a5dcb6c7` wurde in GitHub Actions Lauf **#232** (`45929786397`) erneut mit Chromium geprüft.
- Ergebnis: **87/87 Einzelprüfungen erfolgreich**. Der Job „Encrypted vault end-to-end tests“ endete mit `success`.
- Die Suite umfasst u. a. Pflegeprotokoll, Arzttermine/Überweisungen, Krankheits- und Medikamentenlexikon, Einheiten-Umrechner, Habit Heatmap, QR Studio, QR Sticker, PDF-/Druck-Center, Dokumenten-Scanner, Wissenschaftslabor, WLAN/Bluetooth-Manager, Musikstudio, Anatomie 3D sowie Arztbuch/Vitalwerte/Laborwerte/Medikamentenplan.
- Diese 87 Prüfungen sind gezielte automatisierte Browserprüfungen der aufgeführten Abläufe. Sie sind **keine** vollständige Funktionsabnahme aller 92 Registry-Apps und ersetzen weder klinische noch Datenschutz-/Sicherheitsprüfung.
- Der Dokumenttitel in `index.html` wurde auf „Master Build v176“ vereinheitlicht; die vollständige 14.051-zeilige Hauptdatei mit den vorhandenen v167–v176-Integrationen ist erhalten.

### Branch- und Veröffentlichungsgrenze

- Produktiver Hauptbranch `main` steht weiterhin auf `4ab7b6c164d7bc28359e500a47322e378f0ca44d` (v166-Basis).
- Die weiterentwickelte v176-Fassung liegt auf `work-v167-medical-apps`, Commit `206d602d1cfc801a204aeedd6e3049837ee0f4f7`.
- Pull Request [#1](https://github.com/haldoaios-Official/HalDo/pull/1) bleibt offen und als Draft markiert. Es wurde kein Merge und keine GitHub-Pages-Veröffentlichung vorgenommen.
- Nächster Ausbau: die noch nicht benannten A–Z-Plätze anhand der bestätigten Nutzeranforderungen konkretisieren, anschließend pro regulärem App-Release zwei neue eigenständige Apps implementieren, integrieren und mit Browserprüfungen abnehmen.

**Wahrheitsregel:** Registry-Startbarkeit, fachliche Funktionsvollständigkeit, Datenschutz-/Sicherheitsprüfung und Live-Veröffentlichung sind vier getrennte Abnahmestufen.


### Wiederherstellung der Hauptdatei – 27.11.2026

- Eine fehlerhafte partielle Dateiaktualisierung hatte `index.html` vorübergehend auf einen 337-Byte-Kopf gekürzt. Der unmittelbar folgende Chromium-Lauf #233 schlug deshalb bereits beim OS-Start fehl (0 erreichte Prüfungen; Timeout in `scripts/test-medical-apps-browser.mjs`).
- Die vollständige Hauptdatei wurde aus dem unveränderten Parent-Commit `6a5d306500abf05c730fb4f77be85be0389e4346` wiederhergestellt und nur der Dokumenttitel auf v176 angepasst.
- Wiederherstellungsprüfung: 1.002.901 Zeichen, 14.051 Zeilen, v173- und v176-Script-Einbindungen vorhanden. Der neue Branch-Commit ist `46c9cb60125705eb6ed8d2ece71ee31c21f02856`.
- Der fehlgeschlagene Lauf #233 bleibt als fehlgeschlagener Lauf dokumentiert und darf nicht als erfolgreicher Test gezählt werden. Der wiederhergestellte Stand benötigt einen neuen vollständigen Browserlauf vor weiterer Freigabe.


## HALDO v177 – Produktidentität, AI-Core-Architektur und A–Z-Lückenschluss (27.11.2026)

### Verbindliche Produkt- und Namensregel
- Jede eigenständige Anwendung erhält einen sichtbaren Produktnamen mit dem Präfix **„HalDo“** (z. B. „HalDo Arztbuch AI Pro“, „HalDo Musikstudio Pro Max“, „HalDo Cyborg Control AI“).
- App-ID, Anzeigename, Fenstertitel, A–Z-Katalog, Suchindex, Sprachbefehl und Hilfetexte müssen dieselbe Produktidentität verwenden. Historische IDs dürfen aus Kompatibilitätsgründen bestehen bleiben; sie werden nicht unüberlegt umbenannt.
- „AI“, „KI“, „Cyborg“, „Pro“ und „Pro Max“ sind keine Dekoration: Die Bezeichnung darf nur Funktionen versprechen, die tatsächlich implementiert und getestet sind. Bei reinen Verwaltungswerkzeugen ist „HalDo … Pro“ besser als ein irreführendes „AI“.
- Einheitliche Designqualität: responsives Layout, Tastaturbedienung, klare Zustände (Laden/Leer/Fehler/Erfolg), verständliche Hilfen, konsistente Icons, keine toten Schaltflächen, sichere Formulare und saubere Fenster-/Ressourcenfreigabe.

### Plattformarchitektur – HalDo AI Core (geplant, noch nicht als fertig implementiert markieren)
Der gemeinsame Plattformkern soll schrittweise folgende Dienste bereitstellen:
1. **HalDo AI Orchestrator:** Aufgaben über mehrere Apps planen und ausführen; vor externen, finanziellen, medizinischen oder irreversiblen Aktionen Bestätigung verlangen.
2. **HalDo Identity & Access Pro:** Anmeldung, Sitzungen, Rollen, App-Berechtigungen und nachvollziehbare Freigaben.
3. **HalDo DataVault Pro:** Verschlüsselung, Schlüsselverwaltung, Backup/Wiederherstellung, Export und Datenlöschung mit klaren Grenzen.
4. **HalDo Knowledge Graph AI:** Freigegebene Informationen zwischen Apps verknüpfen, Quellen und Herkunft speichern; keine stillschweigende Vermischung privater Daten.
5. **HalDo Agent Hub:** Agenten, Werkzeuge und Integrationen registrieren, Berechtigungen begrenzen, Ausführungen protokollieren und jederzeit abbrechbar machen.
6. **HalDo Observability & Quality Center:** Fehlerberichte, Laufzeitstatus, Testabdeckung, Performance und Sicherheitsereignisse ohne unnötige personenbezogene Inhalte.
7. **HalDo Accessibility AI:** Vorlesen, Spracheingabe, Untertitel, einfache Sprache, Tastatursteuerung und anpassbare Darstellung.
8. **HalDo Offline & Sync Manager:** Offline-Fähigkeit, Konfliktauflösung und nachvollziehbare Synchronisierung; keine Synchronisierung ohne echte, sichere Backend-Verbindung.

### Zusätzliche A–Z-Kandidaten zur fachlichen Prüfung
Diese Vorschläge erweitern die bisherige Wunschliste. Sie sind **Planungskandidaten**, keine implementierten Apps und keine Behauptung weltweiter Neuheit:
- **HalDo AI Command Center:** zentrale Aufgabenübersicht und kontrollierte appübergreifende Workflows.
- **HalDo CyberShield AI Pro:** Sicherheitscheck, Berechtigungsübersicht, Sitzungsverwaltung, Phishing-Aufklärung und lokale Sicherheitsprotokolle.
- **HalDo Accessibility AI Pro:** barrierearme Bedienung und persönliche Assistenzprofile.
- **HalDo Life & Home AI:** Haushaltsabläufe, Wartungsfristen, Energieübersicht und freigegebene Smart-Home-Geräte.
- **HalDo Research Lab AI:** Quellenvergleich, Belegstellen, Aktualitätsprüfung und Kennzeichnung widersprüchlicher Aussagen.
- **HalDo Knowledge Vault AI:** persönliches Wissensarchiv mit Tags, Volltextsuche, Quellenherkunft und Export.
- **HalDo Emergency & Recovery Pro:** Notfallkontakte, wichtige Dokumente, Wiederherstellungsanleitungen und ausgewählte Offline-Informationen.
- **HalDo Privacy & Consent Center:** Datenübersicht, Einwilligungen, Berechtigungen, Export- und Löschabläufe.
- **HalDo Developer Studio AI:** API-Explorer, lokale Testumgebung, Protokollanalyse und sichere Projektvorlagen.
- **HalDo Digital Legacy Pro:** freiwillig verwaltete Nachlass- und Notfallhinweise mit streng kontrollierten Freigaberegeln.

Vor Aufnahme in die 375 Plätze ist jeder Kandidat auf Überschneidung mit vorhandenen Apps, tatsächlichen Nutzerbedarf, technische Machbarkeit, Datenschutz, Kosten und rechtliche Anforderungen zu prüfen.

### Qualitäts- und Freigabegate für jede App
Jede App durchläuft getrennte Stufen:
- **P0 – Inventar:** Zweck, Zielgruppe, Abgrenzung, vorhandene Module und Datenflüsse dokumentiert.
- **P1 – UX:** eigener HalDo-Name, responsive Oberfläche, barrierearme Bedienung und alle UI-Zustände.
- **P2 – Funktion:** Kernabläufe funktionieren tatsächlich; Erstellen/Lesen/Bearbeiten/Löschen, Suche, Import/Export nur soweit fachlich sinnvoll.
- **P3 – Sicherheit:** Eingabevalidierung, XSS-Schutz, Berechtigungen, Datenschutz, sichere Speicherung und Fehlerbehandlung geprüft.
- **P4 – Integration:** Launcher, Registry, A–Z-Katalog, Suche, Sprachsteuerung und gemeinsame Plattformdienste konsistent.
- **P5 – Test:** automatisierte Browser- und Regressionstests; kritische Abläufe zusätzlich manuell prüfen.
- **P6 – Release:** Dokumentation, bekannte Grenzen, Versionshinweise und Rollback-Plan.
Ein App-Startpfad oder ein grüner CI-Lauf allein bedeutet nicht, dass eine App fachlich vollständig oder produktionsreif ist.

### CI-Nachprüfung nach Wiederherstellung der Hauptdatei
- GitHub Actions Lauf **#234** (ID `45935998740`) auf dem wiederhergestellten Hauptdatei-Commit `46c9cb60125705eb6ed8d2ece71ee31c21f02856`: **87/87 Chromium-Browserprüfungen erfolgreich**, Job „Encrypted vault end-to-end tests“ = `success`.
- Die Prüfung umfasst die dokumentierten 87 Browserabläufe einschließlich v175/v176, Anatomie-3D, Arztbuch, Vitalwerte, Laborwerte und Medikamentenplan. Sie ist keine Vollabnahme aller 92 Apps.
- Der Branch enthält danach zusätzlich die Masterplan-Dokumentation; CI #234 bezieht sich ausdrücklich auf den getesteten Commit `46c9cb60125705eb6ed8d2ece71ee31c21f02856`, nicht auf spätere Commits.
- Branch `work-v167-medical-apps`, Draft-PR #1; kein Merge nach `main`, keine Live-Veröffentlichung.

### Nächste technische Reihenfolge
1. Vollständiges App-Inventar aus Registry, allen v167–v176-Modulen und Tests erstellen; Anzeigenamen mit der HalDo-Namensregel abgleichen, ohne IDs oder bestehende Funktionen zu beschädigen.
2. 26 A–Z-Kategorien und 375 Sollplätze neu abgleichen; Doppelungen, fehlende Nutzerwünsche und unbenannte Plätze als konkrete App-Spezifikationen erfassen.
3. HalDo AI Core als gemeinsame, modular testbare Dienste aufbauen; zuerst Identität/Berechtigungen, Ereignisprotokoll, sichere Speicheradapter und App-Registry-Vertrag.
4. Danach Apps in kleinen Releases implementieren; jede Änderung mit vollständiger Regression und dokumentierter Abnahme.
5. Medizinische, finanzielle, Kommunikations- und IoT-Integrationen nur mit passenden Sicherheits-, Datenschutz-, Rechts- und Backend-Voraussetzungen freigeben.

## HALDO v178 – HalDo AI Core Foundation (27.11.2026)

**Implementiert im Arbeitsbranch:** `js/haldo-v178-ai-core.js`, eingebunden am Ende von `index.html` nach dem v177-Markenmodul. Das Modul ist eine Integrationsgrundlage und ausdrücklich noch kein vollständiger KI-Orchestrator.

### Tatsächlich bereitgestellte Schnittstellen
- **Event-Transport:** nutzt ausschließlich den vorhandenen `HalDo.VoiceHub.on/emit`; es wird kein zweiter Event-Bus aufgebaut. Ereignisse verwenden den Namensraum `haldo:core:` und akzeptieren nur App-/Aktions-/Status-Bezeichner sowie nicht-negative Zähler. Freitext, Patientendaten, Zugangsdaten, freie Ressourcen-IDs und beliebige Payload-Felder werden technisch abgewiesen.
- **App-Registry:** stellt eine schreibgeschützte Projektion der vorhandenen `HalDo.Registry.featured` bereit; bestehende App-IDs und Registry-Einträge werden nicht verändert.
- **Lokale Präferenzen:** verwendet `HalDo.Store` nur für kleine Konfigurationen aus booleschen Werten, endlichen Zahlen und kurzen Bezeichnern (keine Freitextwerte). Schlüssel und verschachtelte Eigenschaftsnamen mit Begriffen wie Passwort, Token, Patient, Medizin, Medikamente, Diagnose, Labor oder Vitalwert werden abgewiesen. Dieser Adapter ist nicht verschlüsselt und darf keine Gesundheits-, Identitäts- oder Zugangsdaten speichern.
- **Identitätsdarstellung:** liest ausschließlich freigegebene Avatar-/Logo-/Darstellungseinstellungen über die vorhandene `HalDo.IdentityBridge`. Das ist keine Benutzeranmeldung und keine Kontenverwaltung.
- **Sitzungs-Audit:** hält maximal 100 reduzierte Ereignis-Metadaten im Arbeitsspeicher. Es ist kein dauerhaftes Sicherheitsprotokoll und speichert keine Event-Payloads.

### Bewusst nicht als vorhanden ausgewiesene Dienste
Der Capability-Status meldet zentrale Berechtigungen, Authentifizierung, gemeinsamen verschlüsselten Datentresor, KI-Inferenz, Agent-Runtime und Backend-Verbindung als nicht verfügbar, solange keine echte Implementierung in der aktiven Plattform geladen und geprüft ist. Ein Aufruf der Berechtigungs-API wird abgelehnt, wenn kein zentraler Berechtigungsdienst vorhanden ist. Die vorhandenen medizinischen Einzel-Tresore bleiben eigenständig; v178 ersetzt oder öffnet sie nicht.

### Geplante nächste Schritte
1. Browser-Regression von v178 auf dem exakten Commit durchführen und alle Status-/Grenztests prüfen.
2. Berechtigungsmodell mit App-Manifest, Consent-Dialog, Widerruf und tatsächlicher Laufzeitkontrolle konzipieren; erst nach Prüfung in aktiver Hauptdatei integrieren.
3. Danach Identität/Auth-Backend und sichere zentrale Datenschnittstellen getrennt entwerfen. Keine Konten, Synchronisierung oder KI-Agenten ohne echte Backend-Komponenten versprechen.
4. Den AI-Orchestrator erst nach nachgewiesenen Berechtigungen, Abbruchmechanismus, Protokollierung und Bestätigung kritischer Aktionen aufbauen.

**Release-Grenze:** Arbeitsbranch `work-v167-medical-apps`, Draft-PR #1. Kein Merge nach `main`, keine GitHub-Pages-Veröffentlichung, keine Freigabe zur Speicherung echter Patientendaten.

## HALDO v179 – HalDo Permission & Consent Core (27.11.2026)

**Implementiert im Arbeitsbranch:** `js/haldo-v179-permission-core.js`, eingebunden nach v178 in `index.html`. Zusätzlich erscheint `HalDo Privacy & Consent Center Pro` als eigener Launcher-Eintrag.

### Tatsächlich bereitgestellte Funktionen
- **Explizite App-Manifeste:** Eine App muss die von ihr benötigten Rechte über `HalDo.PermissionCore.registerApp(appId, permissions)` deklarieren. Unbekannte Rechte, unbekannte App-IDs und nicht deklarierte Zugriffe werden abgewiesen.
- **Zustimmungsdialog:** Vor einer Anfrage an Browser-APIs öffnet HalDo einen sichtbaren Dialog mit App-Name, Zweck und Ablehnen-/Zustimmen-Aktion. Erst die Zustimmung löst die Browseranfrage aus.
- **Getrennte Zuständigkeiten:** Kamera, Mikrofon, Standort und Benachrichtigungen besitzen getrennte Verfügbarkeits- und Browserstatusanzeigen. Ein HalDo-Sitzungsgrant ist nicht dasselbe wie eine vom Browser gespeicherte Websiteberechtigung.
- **Sitzungsgrants:** HalDo-Freigaben liegen ausschließlich im Arbeitsspeicher. Sie werden nicht in `localStorage` oder `sessionStorage` gespeichert und verfallen beim Neuladen/Schließen der Seite.
- **Widerruf:** HalDo-Sitzungsgrants können einzeln, pro App oder im Consent Center widerrufen werden. Bereits vom Browser erteilte Websiteberechtigungen kann JavaScript nicht zuverlässig zurücknehmen; diese müssen in den Browser-Einstellungen verwaltet werden.
- **Medienhygiene:** Der Freigabecheck stoppt temporär geöffnete Kamera-/Mikrofonstreams direkt nach erfolgreicher Browserfreigabe. Die App muss danach für ihre eigentliche Funktion einen eigenen Stream anfordern.
- **Abbruchverhalten:** Wird der HalDo-Zustimmungsdialog geschlossen, wird die wartende Anfrage als abgelehnt aufgelöst. Es bleibt kein unendlicher Pending-Aufruf zurück.
- **Audit-Anbindung:** Entscheidungen werden als begrenzte, nicht-freitextliche Metadaten über den bestehenden v178-Core/VoiceHub publiziert.

### Wichtige Freigabegrenzen
v179 ist ein Berechtigungsfundament, noch keine vollständige Rollen-/Kontenverwaltung. Grants sind sitzungsbezogen und nicht geräteübergreifend. Browserstatus kann je nach Browser als `unknown` erscheinen. Die Website kann keine vom Browser gespeicherten Kamer-, Mikrofon-, Standort- oder Benachrichtigungsrechte zuverlässig widerrufen. Noch müssen die einzelnen Apps ihre realen Berechtigungsmanifeste deklarieren; das Modul erfindet keine Rechte aus App-Namen oder Beschreibungen.

### Browserabnahme
Für die v179-Abnahme sind folgende Abläufe in `scripts/test-medical-apps-browser.mjs` vorgesehen:
1. Manifest-Validierung und Ablehnung nicht deklarierter Rechte.
2. Explizite Ablehnung ohne Sitzungserlaubnis.
3. Zustimmung mit simuliertem Browser-Medienadapter und unmittelbarem Stoppen des temporären Streams.
4. Einzelwiderruf und Schließen des Dialogs während einer offenen Anfrage.
5. Launcher-Aufruf des Privacy & Consent Center sowie getrennte Anzeige der App- und Browserstatuswerte.

**Release-Grenze:** Arbeitsbranch `work-v167-medical-apps`, Draft-PR #1. v179 wird erst nach erfolgreicher CI-Abnahme als geprüft markiert; kein Merge nach `main` und keine Live-Veröffentlichung.


## HALDO v180 – HalDo DataVault Pro (27.11.2026)

**Implementiert im Arbeitsbranch:** js/haldo-v180-datavault-core.js, geladen nach v179 in index.html. Der neue Dienst ist vom vorhandenen Arztbuch-Tresor v154 sowie von HalDo Backup & Recovery getrennt. Es gibt keine automatische Migration oder gemeinsame Klartextablage.

### Tatsächlich implementierte Funktionen
- **Eigene IndexedDB-Datenbank:** haldo_datavault_v180, getrennte Stores für Tresor-Metadaten und verschlüsselte Datensätze. In Datensatz-Records liegen nur opake IDs, Zeitstempel, IVs und Chiffretext.
- **Verschlüsselung:** AES-GCM mit 256-Bit-Schlüssel, zufällige 96-Bit-IV je Datensatz, zufälliger 128-Bit-Salt, PBKDF2-SHA-256 mit 310.000 Iterationen. Der Datensatz-Kontext wird zusätzlich als AES-GCM Additional Authenticated Data gebunden.
- **Passphrase und Schlüssel:** mindestens 12 Zeichen; Passphrase wird nicht persistiert. Der abgeleitete, nicht exportierbare CryptoKey bleibt ausschließlich im Arbeitsspeicher und wird bei Sperren, Schließen des App-Fensters sowie pagehide entfernt.
- **Schlüsselprüfung:** beim Anlegen wird ein verschlüsselter Prüfsatz gespeichert; ein falsches Passwort entsperrt den Tresor nicht.
- **Datensatz-API:** create, unlock, lock, lockAll, isUnlocked, put, get, list, deleteRecord, deleteVault und getStatus. list gibt nur opake IDs und Zeitstempel aus; Inhalte werden erst nach Entsperren entschlüsselt.
- **Verschlüsseltes Backup:** Export enthält verschlüsselte Datensätze und Schlüsselprüf-Metadaten. Import prüft Dateiformat, Größen-/Anzahlgrenzen, Passphrase und Authentizität jedes Datensatzes. Import ist nur in einen Browser ohne bereits vorhandenen DataVault möglich.
- **Grenzen:** maximal 5.000 Datensätze, 2 MB je Datensatz und 25 MB je Backup. Browser-Speicher kann vom Nutzer oder Browser gelöscht werden; lokale Verschlüsselung ersetzt kein externes Backup.
- **Integration:** Launcher-Modul HalDo DataVault Pro, Registry-ID data-vault, A–Z-Kategorie D sowie Statusprojektion im v178 AI Core. HalDo Privacy & Consent Center Pro wird parallel in A–Z-Kategorie P registriert.
- **Audit:** nur reduzierte Operationsmetadaten über den vorhandenen v178-Core; keine Passphrase, Datensatzinhalte oder medizinischen Werte im Audit.

### Explizit nicht vorhanden
Keine Cloud-Synchronisierung, keine Serverkonten, keine Passwort-Wiederherstellung, keine Geräteübertragung ohne exportiertes Backup, keine automatische Datenmigration, keine Zertifizierung als Medizinprodukt und keine Zusicherung klinischer oder regulatorischer Freigabe. Bei Verlust der Passphrase sind verschlüsselte Inhalte nicht wiederherstellbar.

### Browserabnahme für v180
scripts/test-medical-apps-browser.mjs erweitert die End-to-End-Prüfung um:
1. Erstellen, Entsperren und Speichern eines Datensatzes im separaten IndexedDB-Tresor.
2. Prüfung, dass Test-Klartext weder in IndexedDB-Records noch im Backup oder in localStorage/sessionStorage erscheint.
3. Sperren, Ablehnung eines Lesezugriffs im gesperrten Zustand und Zurückweisung einer falschen Passphrase.
4. Korrektes erneutes Entsperren, verschlüsselten Backup-Export, Löschen und authentifizierten Import mit Daten-Roundtrip.
5. Launcher-, A–Z-Kategorie-, Route- und AppBrowser-Registrierung.

**Release-Grenze:** Arbeitsbranch work-v167-medical-apps, Draft-PR #1. Der v179-Stand wurde auf Commit 73fc998f0999ab46775558d50068ba8ce98f7b6b mit GitHub Actions #265 erfolgreich geprüft. Die v180-Änderungen benötigen einen neuen vollständigen Browserlauf. Kein Merge nach main, keine GitHub-Pages-Veröffentlichung und keine Freigabe zur Speicherung echter Patientendaten.


## HALDO v181 – Permission Manifest Lifecycle Policy (27.11.2026)

**Implementiert im Arbeitsbranch:** js/haldo-v181-permission-policy.js, geladen nach v180. Diese Ergänzung härtet den Lebenszyklus der v179-App-Manifeste; sie ersetzt den Browser-Permission-Dialog nicht.

### Tatsächliche Änderung
- Bei erneuter Registrierung einer App wird das bisherige Manifest vor dem Update gelesen.
- Rechte, die im neuen Manifest fehlen, werden sofort aus den aktiven HalDo-Sitzungsgrants dieser App widerrufen.
- Die Rückgabe von registerApp enthält revokedPermissions und revokedCount; die v179-Validierung bleibt maßgeblich und ungültige Manifeste verändern den vorherigen Zustand nicht.
- Eine reduzierte Metadaten-Auditmeldung wird über den v178-Core publiziert.
- Status meldet ausdrücklich, dass Anmeldung, Serveridentität, rollenbasierter Zugriff und eine echte App-Sandbox weiterhin nicht vorhanden sind.

### Browserabnahme
Die Chromium-Regression erteilt in einem kontrollierten Test erneut eine Mikrofon-Sitzungsfreigabe, reduziert dann das Manifest auf eine leere Liste und bestätigt, dass der zuvor aktive Grant sofort widerrufen wird. Der Test bestätigt zugleich, dass keine Authentifizierung oder Rollenverwaltung vorgetäuscht wird.

**Grenze:** Dies ist ein clientseitiger Richtlinien-Guard innerhalb derselben JavaScript-Origin, keine Sicherheitsgrenze gegen bösartige oder kompromittierte Skripte. Echte Benutzer-/Rollenverwaltung benötigt eine verifizierte serverseitige Identität und serverseitige Autorisierung.

## HALDO v182 – Permission Request Lifecycle (27.11.2026)

**Implementiert im Arbeitsbranch:** `js/haldo-v182-permission-lifecycle.js`; ergänzt den v179 Permission Core und wird nach v181 geladen.

### Tatsächliche Änderung
- Bei einer Manifest-Reduktion werden offene HalDo-Zustimmungsanfragen für entfernte Berechtigungen aktiv beendet.
- Die Anfrage-Promise wird mit `false` aufgelöst, der HalDo-Dialog geschlossen und die ausstehende Anfrage aus dem Sitzungsstatus entfernt.
- Auch wenn der Browser seine bereits gestartete Berechtigungsanfrage später beantwortet, wird kein verspäteter HalDo-Sitzungsgrant mehr angelegt.
- Das manuelle Widerrufen bzw. Abmelden einer App beendet ebenfalls ausstehende HalDo-Anfragen.
- Der Status weist ausdrücklich darauf hin, dass Browser-Websiteberechtigungen nicht durch HalDo widerrufen werden können.

### Browserabnahme
Die Chromium-Regression startet eine ausstehende Mikrofonanfrage, löst die Browserantwort absichtlich verzögert aus, verkleinert in der Zwischenzeit das App-Manifest und prüft anschließend: Dialog geschlossen, HalDo-Promise mit `false` aufgelöst, keine aktive Sitzungserlaubnis und temporärer Medienstream gestoppt.

**Grenze:** HalDo kann eine Anfrage innerhalb der eigenen App abbrechen und einen späteren Sitzungsgrant verhindern. Bereits an den Browser übergebene Websiteberechtigungsdialoge lassen sich nicht zuverlässig abbrechen; eine dort erteilte Origin-Berechtigung muss in den Browser-Einstellungen verwaltet werden. Dies ist weiterhin kein Ersatz für serverseitige Authentifizierung, Rollenautorisierung oder eine echte App-Sandbox.

### v182 Korrektur im Browser-Testlauf
Der erste CI-Durchlauf zeigte eine Zählungsabweichung: v181 hatte die ausstehende Anfrage bereits über den Widerruf im v179-Kern beendet, bevor v182 die Anzahl ermittelte. Die Korrektur erfasst deshalb ausstehende Anfragen vor dem Aufruf der vorhandenen v181-Policy und bestätigt anschließend, dass diese Anfragen tatsächlich nicht mehr offen sind. Der Funktionswiderruf wird dadurch nicht doppelt ausgeführt.
