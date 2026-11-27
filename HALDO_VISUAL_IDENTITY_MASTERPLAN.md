# HALDO AI OS PRO MAX — Visual Identity & Living Experience Masterplan

Stand: 27.11.2026  
Arbeitsbranch: `work-v183-professional-appsuite`

## Verbindliche Gestaltungsrichtung

HalDo soll als zusammenhängendes KI-Betriebssystem erkennbar sein. Jede App trägt den Namen **HalDo**, erhält eine eigene fachliche Bildwelt und verwendet eine gemeinsame hochwertige Design-DNA: klare Typografie, starke Bildkomposition, dezente Glas-/Lichteffekte, nachvollziehbare Navigation, responsive Layouts und konsistente Interaktionen.

Die Oberfläche soll nicht wie eine Ansammlung einfacher Kacheln oder generischer Formulare wirken. Bilder, 3D-Szenen und Avatare müssen einen Zweck erfüllen und die jeweilige Aufgabe unterstützen.

## Bild- und Avatarstandard

- Bevorzugt werden hochwertige, realistisch wirkende menschliche Darstellungen und professionelle 3D-Charaktere statt einfacher Comic- oder Emoji-Figuren.
- HalDo AI, HalDo KI und HalDo Cyborg bilden eine zusammenhängende Markenidentität. Menschliche, Android-, Cyborg- und Hologramm-Auftritte dürfen unterschiedliche Rollen haben, müssen aber visuell zusammenpassen.
- Für einen echten lebensechten 3D-Menschen ist ein rechtmäßig nutzbares, rigged GLB/GLTF-Modell mit Humanoid-Skelett, PBR-Materialien und passenden Animationen erforderlich. Ein statisches SVG-Gesicht ist kein Ersatz dafür.
- Benötigte Animationen: Idle/Atmen, Blickbewegung/Blinzeln, Zuhören, Sprechen/Lippensynchronisation, Denken und Begrüßung. Emotionen müssen zurückhaltend und verständlich sein.
- Jede Bilddatei und jedes 3D-Modell benötigt eine dokumentierte Herkunft und Lizenz. Keine ungeprüften Fremd-URLs oder zufälligen Demo-Modelle als Produktiv-Assets.
- Anatomie-Modelle dürfen nicht als Avatar verwendet werden. Avatar-Modelle dürfen nicht als anatomische Lehrmodelle verwendet werden.
- Das vorhandene Original-Logo `logo.png` wird niemals durch Entwürfe oder generierte Varianten überschrieben.

## Welcome Experience

Der Systemstart und der Einstieg in ausgewählte Apps erhalten einen besonderen HalDo-Willkommensmoment: warm, hochwertig und persönlich, mit der gewünschten Sonnen- und Engel-Flügel-Bildsprache dort, wo sie gestalterisch sinnvoll ist. Der Effekt darf den Arbeitsbeginn nicht blockieren; Nutzer müssen ihn überspringen oder reduzieren können.

## Fachliche Bildwelten

| Bereich | Visuelle Richtung |
|---|---|
| HalDo AI OS / AppStore | Futuristische Kommandozentrale, KI-Identität, klare App-Vorschauen |
| HalDo Arztbuch | Professionelle medizinische Umgebung, menschlicher KI-Assistent, präzise Anatomie-Visualisierungen |
| HalDo Anwälte | Hochwertige Kanzlei-/Dokumentenwelt, seriöse menschliche Assistenz, klare Aktennavigation |
| HalDo Gesetze | Wissensbibliothek, Paragraphen- und Quellenansicht, sachliche Informationsvisualisierung |
| HalDo Logo & Patent | Kreativstudio, Marken- und Produktvisualisierung, Schutzrechts-Zeitachse |
| HalDo Fahrschule | Realistische Verkehrsszenen, Fahrzeuge und interaktive Fahrsituationen |
| HalDo Musik / Studio | Professionelle Audio-Workstation, echte Instrument-/Studio-Bildwelten |
| HalDo Lernen | Lebendige Lernräume, menschliche Tutoren und verständliche Visualisierungen |

## Technischer Bestand — geprüfte Einschränkungen

- `js/haldo-living-identity.js` stellt bereits `HalDo.LivingIdentity` mit Modi wie Human, Android, Cyborg und Hologramm bereit. Diese vorhandene API soll weiterverwendet und nicht durch eine zweite parallele Identitätsverwaltung ersetzt werden.
- `js/haldo-human-3d-engine.js` enthält eine Three.js-r128-Engine für rigged GLB/GLTF-Avatare und eine API unter `HalDo.Human3D`.
- Die Engine ist in der geprüften `index.html` derzeit nicht als Script eingebunden.
- Die Engine verweist auf `assets/avatars/haldo-human.glb`, `haldo-cyborg.glb`, `haldo-android.glb` und `haldo-robot.glb`. Der Avatar-Asset-Ordner wurde auf dem geprüften Arbeitsbranch nicht gefunden. Deshalb darf aktuell kein echter, vollständig integrierter 3D-Mensch behauptet werden.
- Die vorhandene Avatar-SVG-/Hologramm-Darstellung ist ein animierter Platzhalter, aber kein fotorealistischer Mensch und keine vollständige 3D-Avatar-Lösung.

## Umsetzung in sicheren, testbaren Stufen

1. **Designsystem:** gemeinsame HalDo-Farb-, Typografie-, Karten-, Navigations-, Motion- und Responsive-Regeln; keine globale CSS-Kollision mit älteren Apps.
2. **Welcome Experience:** eigener, überspringbarer Startmoment; Original-Logo schützen; Reduced-Motion-Einstellung berücksichtigen.
3. **Avatar-Asset-Pipeline:** rechtmäßig nutzbare, rigged Human-/Cyborg-GLB-Dateien beschaffen oder eigens erstellen; Lizenz, Dateigröße, Skelett, Materialien und Animationen prüfen.
4. **Human3D-Integration:** Engine erst nach Abhängigkeits- und Asset-Prüfung laden; lazy loading, Fehler-Fallback, Renderer-Aufräumen und mobile Leistungsgrenzen testen.
5. **App-Visuals:** Apps einzeln mit passenden Bildwelten ausstatten; keine identischen generischen Hero-Bilder überall wiederverwenden.
6. **Qualitätsabnahme:** Browser-E2E, Mobile-/Desktop-Layouts, Tastaturbedienung, Kontrast, Reduced Motion, Ladefehler und Regression der bestehenden Apps prüfen.

## Abnahmekriterien

- Kein kaputter Bild-/Modellpfad und keine ungeprüfte externe Asset-Abhängigkeit.
- Der 3D-Avatar lädt ein tatsächlich vorhandenes rigged Modell und zeigt einen verständlichen Fallback, wenn WebGL oder Asset-Laden scheitert.
- Animationen, Emotionen und Sprechzustände sind an die vorhandene HalDo-LivingIdentity-API gekoppelt.
- Das Schließen einer App beendet Animationen/Renderer und gibt Ressourcen frei.
- Jede App behält ihre fachlichen Funktionen; visuelle Erweiterungen dürfen Formulare, Navigation und gespeicherte Daten nicht beeinträchtigen.
- Keine Aussage „fotorealistisch“, „lebensecht integriert“ oder „vollständig“ ohne nachgewiesenes Modell und bestandene Browserprüfung.

**Aktueller Status:** Gestaltungsrichtung und technische Lücken dokumentiert. Noch keine neuen Avatar-GLB-Dateien, keine Human3D-Laufzeitintegration und keine neue Bildwelt als produktiv abgenommen.