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

## 7. Prioritäten für die nächsten Entwicklungsschritte

1. **v163 — Masterplan und Bestandsinventar:** dieses Dokument im Repository verankern, README verlinken, App-Registry und Modulstatus künftig nachvollziehbar pflegen.
2. **v164 — Living Golden Angel Emblem:** das originale `logo.png` im vorhandenen Welcome als golden leuchtendes, schwebendes Engel-Emblem mit Glanzreflexen, Lichtkranz, Sternpunkten und sanft bewegten SVG-Flügeln darstellen; Originalbild nicht ersetzen.
3. **Welcome/Identity-Audit:** v161-Begrüßung, `splash.js`, `logo.png`, Living Identity und Identity Bridge auf doppelte Startsequenzen, tatsächliche Einbindung und App-Startverhalten prüfen.
4. **App-Designsystem:** gemeinsame hochwertige Komponenten für Karten, Chat, Tabellen, Formulare, Seitenleisten und Fenster; pro App eigener Akzent und Begrüßung.
5. **App-Inventar vervollständigen:** jede App mit ID, Anzeigename, Kategorie, Entry-Datei, Launcher-Ziel, Status (fertig/in Arbeit/geplant), Funktionen, Speicher und Tests dokumentieren.
6. **Nächster regulärer App-Release:** erst nach dem Inventar zwei noch nicht vorhandene Apps auswählen und vollständig integrieren.

## 8. Release-Checkliste

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
