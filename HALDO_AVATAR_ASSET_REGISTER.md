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
