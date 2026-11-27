# HALDO HUMAN 3D PRO MAX — Avatar Asset Register

Stand: 27.11.2026  
Arbeitsbranch: `work-v183-professional-appsuite`

## Zweck

Dieses Register trennt recherchierte Asset-Kandidaten von tatsächlich heruntergeladenen, technisch geprüften und in HalDo integrierten Modellen. Ein Eintrag mit Status **Kandidat** ist noch kein produktives HalDo-Asset.

## Geprüfte Kandidaten

Alle vier Kandidaten stammen aus dem Grab3D-Modellkatalog. Die jeweiligen Modellseiten weisen CC0 1.0 aus und erlauben laut Anbieter kommerzielle Nutzung ohne Namensnennung. Die rigged Varianten werden separat angeboten und enthalten laut Modellbeschreibung Walk-/Run-Animationen.

| HalDo-Rolle | Modell | Rigged-Download | Angaben der Modellseite | Status |
|---|---|---|---|---|
| Human | [Man Base Mesh](https://grab3d.com/models/characters/man-base-character/) | [GLB, rigged](https://grab3d.com/dl/man-base-character-rigged/man-base-character-rigged.glb) | 262.348 Dreiecke (High Detail), 1,80 m, rigged Variante mit Walk/Run, CC0 1.0 | Kandidat – Datei noch nicht im Repository geprüft |
| Cyborg | [Cyborg](https://grab3d.com/models/characters/cyborg/) | [GLB, rigged](https://grab3d.com/dl/cyborg-rigged/cyborg-rigged.glb) | 800.000 Dreiecke / Light 399.999, 4K-PBR, 1,80 m, Walk/Run, CC0 1.0 | Kandidat – Datei noch nicht im Repository geprüft |
| Android | [Porcelain Android](https://grab3d.com/models/characters/android/) | [GLB, rigged](https://grab3d.com/dl/android-rigged/android-rigged.glb) | 800.000 Dreiecke / Light 400.000, 4K-PBR, 1,75 m, Walk/Run, CC0 1.0 | Kandidat – Datei noch nicht im Repository geprüft |
| Robot | [Robot](https://grab3d.com/models/sci-fi/robot/) | [GLB, rigged](https://grab3d.com/dl/robot-rigged/robot-rigged.glb) | 800.000 Dreiecke / Light 399.999, 4K-PBR, rigged Variante mit Walk/Run, CC0 1.0 | Kandidat – Datei noch nicht im Repository geprüft |

## Technische Bewertung vor Integration

Die Modellseiten belegen die angebotenen Rigged-Varianten und Walk-/Run-Animationen. Sie belegen **nicht**, dass die Dateien Gesichts-Bones, Blendshapes/Morph Targets oder Lippensynchronisationsdaten enthalten. Diese Punkte bleiben offen, bis die konkreten GLB-Dateien lokal geprüft wurden.

Vor dem Einbau sind je Modell mindestens folgende Prüfungen verpflichtend:

1. GLB-Header und glTF-2.0-Struktur prüfen.
2. Lizenzdatei, Manifest und eingebettete Copyright-Metadaten sichern.
3. Tatsächliche Skeleton-/Skin-Struktur und Bone-Namen auslesen.
4. Animation-Clips, Dauer, Track-Namen und Loop-Verhalten auslesen.
5. Gesicht, Augen, Mund, Zähne und Hände in einem 3D-Viewer kontrollieren.
6. Morph Targets / visemes für Blinzeln und Sprache explizit nachweisen oder separat entwickeln.
7. Polygonzahl, Texturgrößen, GPU-Speicher und Ladezeit messen; bei 800k-Polygon-Modellen LOD-/Light-Varianten und Mobile-Leistung prüfen.
8. Herkunft und Lizenz direkt neben dem Asset im Repository dokumentieren.

## Integration in HalDo

Vorgesehene lokale Namen, erst nach bestandener Prüfung:

- `assets/avatars/haldo-human.glb`
- `assets/avatars/haldo-cyborg.glb`
- `assets/avatars/haldo-android.glb`
- `assets/avatars/haldo-robot.glb`

Die vorhandene Engine `js/haldo-human-3d-engine.js` erwartet diese Pfade. Derzeit werden keine dieser Dateien durch dieses Register bereitgestellt. Die Engine darf daher noch nicht als vollständig produktiv integriert gelten.

## Wichtige Grenzen

- Walk/Run bedeutet nicht automatisch Idle-/Atem-, Blick-, Blinzel- oder Sprachanimation.
- Ein rigged Körper ist noch kein sprechender KI-Avatar.
- Kein Modell darf ohne Prüfung als fotorealistisch oder lippensynchron bezeichnet werden.
- Anatomie-GLBs bleiben strikt getrennt von Avatar-GLBs.
- Das Register dokumentiert externe Kandidaten; es ersetzt weder den Download noch die technische und rechtliche Prüfung der konkreten Dateien.


## Herkunft, KI-Transparenz und Lizenzprüfung (27.11.2026)

Die Paket-Lizenzdateien der vier oben genannten Kandidaten wurden zusätzlich auf der jeweiligen Modellseite geöffnet und geprüft:

- **Lizenzstatus laut Paketdatei:** CC0 1.0 Universal. Der Anbieter erklärt, die Rechte an Modellen, Texturen und Bildern im gesetzlich möglichen Umfang aufzugeben; keine Namensnennung wird verlangt.
- **Herkunft:** Alle vier geprüften Paketdateien deklarieren ausdrücklich „AI-assisted“. Basismesh und Texturen wurden mit dem KI-gestützten Image-to-3D-Werkzeug Meshy erstellt und anschließend in Blender bereinigt, skaliert, texturiert und geprüft.
- **Transparenzpflichten:** Der Anbieter weist darauf hin, dass Plattformen mit KI-Kennzeichnungspflichten (als Beispiel Steam) diese Assets als KI-unterstützt behandeln. Für HalDo sind Herkunft und Bearbeitungsweg deshalb in dieser Asset-Dokumentation festzuhalten und bei jeder späteren Veröffentlichung die jeweiligen Plattformregeln erneut zu prüfen.
- **Wichtig:** CC0-Lizenzangaben und KI-Herkunft sagen nichts über die technische Eignung, Gesichtsanimation oder Qualität als sprechender Avatar aus.

### Zusätzliche Angaben zum Robot-Kandidaten

Die Robot-Modellseite nennt die rigged GLB-Variante mit Walk/Run, ca. 13 MB, 800.000 Dreiecke in High Detail bzw. 399.999 in Light und 4K-Texturen (Light: 1K). Die Abmessungen der statischen Modellseite betragen 1,08 × 0,38 × 1,50 m. Diese Angaben beschreiben die Anbieter-Auswahl, nicht eine von HalDo geprüfte lokale Datei.

### Grenzen der Rig-Informationen

Die Grab3D-Dokumentation beschreibt bei einer Gruppe anderer Beispiel-Rigs 24 Bones und keine Finger-, Kiefer- oder Gesichtsknochen. Diese Aussage darf **nicht** ohne Inspektion auf Man Base Mesh, Cyborg, Porcelain Android oder Robot übertragen werden. Für alle vier konkreten Rigged-GLBs bleiben Bone-Namen, Anzahl und Hierarchie, Morph Targets, Viseme, Blinzeln und echte Idle-/Talk-Clips offen, bis die Download-Dateien selbst untersucht wurden.

### Download- und Prüfstatus

Zum Stand dieses Commits wurden die Binärdateien nicht in das HalDo-Repository übernommen. Die direkten Download-Links sind dokumentiert, aber die GLB-Dateien konnten in der aktuellen Arbeitsumgebung nicht zuverlässig abgerufen und deshalb weder mit einem glTF-Parser noch in einem Browser-Viewer validiert werden. **Alle vier bleiben Kandidaten und dürfen nicht als integrierte Produktions-Avatare angezeigt werden.**


## Weitere Human-Variante: weiblicher Avatar-Kandidat

| HalDo-Rolle | Modell | Rigged-Download | Angaben der Modellseite | Status |
|---|---|---|---|---|
| Human Female (optional) | [Woman Base Mesh](https://grab3d.com/models/characters/woman-base-character/) | [Rigged GLB, Walk/Run](https://grab3d.com/dl/woman-base-character-rigged/woman-base-character-rigged.glb) | 305.702 Dreiecke (Light 152.851), 4K-PBR (Light 1K), 1,68 m, taupefarbenes Sportoberteil, dunkle Shorts und barfuß, CC0 1.0 | Kandidat – nicht heruntergeladen oder technisch geprüft |

Die Modellseite beschreibt diese Variante als neutralen, bekleideten Ausgangskörper mit zurückgebundenem Haar und vorhandenen Walk-/Run-Clips. Sie ist eine mögliche weibliche Human-Variante, aber noch keine Freigabe zur Produktion. Outfit, Gesicht, Rig-Hierarchie und Performance müssen nach lokalem Download geprüft werden.

## Reproduzierbare lokale Asset-Prüfung

scripts/validate-haldo-avatar-assets.mjs prüft die vier vom Human3D-Engine-Konfigurationssatz erwarteten GLB-Dateien anhand des tatsächlichen Datei-Inhalts:

- GLB-Magic, Version 2.0, Längenfeld, Chunk-Grenzen und JSON-/BIN-Struktur.
- Vorhandene Meshes, Skins/Joints und Animationskanäle mit gültigen Node-Verweisen.
- Anzahl der Animationsclips, Skeleton-Namenshinweise sowie Morph Targets.
- Fehlende Dateien werden als PENDING ausgewiesen. Ungültige Dateien werden abgewiesen. Mit dem Schalter --strict wird zusätzlich eine fehlende Datei zum Fehler.

Die Selbsttests erzeugen nur kleine synthetische GLB-Fixtures und prüfen gültige sowie absichtlich fehlerhafte Container. Sie ersetzen weder einen vollständigen Khronos glTF Validator noch Sichtkontrolle, Gesichtstest, Performance-Messung oder Lizenzprüfung. Die Datei wird nicht aus dem Internet nachgeladen.

## Offizielle Grab3D-Metadaten-Schnittstelle

Die Anbieter-Dokumentation beschreibt den Endpunkt https://grab3d.com/api/v1/models/{slug}.json als öffentliche, schlüssellose JSON-Schnittstelle. Das Schema stellt unter anderem files, rigged, origin, license, created und manifestUrl bereit. origin unterscheidet KI-gestützte Erstellung vom prozeduralen Aufbau. Die Download-URLs folgen laut Dokumentation dem Muster https://grab3d.com/dl/<slug>/<file>. Diese Schnittstelle kann zur späteren automatisierten Metadaten-Erfassung verwendet werden; sie ist kein Beweis, dass eine konkrete GLB-Datei lokal vorhanden oder geprüft wurde.

Quelle: https://grab3d.com/developers/
