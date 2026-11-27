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

## Technischer Fortschritt — Avatar-Pipeline (27.11.2026)

### Abgeschlossene Engineering-Schutzmaßnahmen

- Human3D verwirft nun Antworten älterer GLB-Ladevorgänge, wenn inzwischen ein anderes Modell ausgewählt wurde. Eine langsame Netzwerkantwort kann dadurch nicht mehr das zuletzt gewählte Modell ersetzen.
- Scheitert ein Modellwechsel vor dem Austausch des vorhandenen Modells, bleibt das bisher geladene Modell aktiv.
- Die GLTFLoader-Initialisierung prüft, ob der Loader bereits verfügbar ist und verwaltet den Zustand eines vorhandenen Loader-Scripts. Ein bereits abgeschlossenes Script ohne registrierten Loader wird als Fehler gemeldet, statt auf ein nicht mehr eintreffendes Ladeereignis zu warten.
- Browser-Regressionstests decken parallele Modellanforderungen, fehlgeschlagene Ersatzmodelle und den bereits abgeschlossenen GLTFLoader-Fehlerfall ab.

### GLB-Eingangsprüfung

Das neue Werkzeug scripts/validate-haldo-avatar-assets.mjs kontrolliert lokal vorliegende Dateien hinsichtlich GLB-Header, glTF-2.0-Struktur, JSON-/BIN-Chunks, Meshes, Skins/Joints, Animationskanälen und Morph Targets. Die CI führt Parser-Selbsttests aus und meldet fehlende Produktionsdateien gesondert. Ein vollständiger Khronos-Validator, eine visuelle 3D-Abnahme und ein Performance-Test bleiben zusätzliche Freigabeschritte.

### Tatsächlicher Asset-Status

- Produktions-Avatare im Repository: **0 verifiziert**.
- Erwartete Dateien, die noch fehlen: **Human, Cyborg, Android, Robot**.
- Weibliche Variante: ein zusätzlicher, optionaler Woman-Base-Mesh-Kandidat ist dokumentiert; sie ist nicht Teil der Produktionskonfiguration.
- Die Grab3D-API-Dokumentation stellt Herkunfts-, Lizenz-, Rig- und Download-Metadaten in Aussicht. Die konkreten Binärdateien sind weiterhin nicht Bestandteil des Repositorys und dürfen nicht als geprüft behandelt werden.

### Letzter automatisierter Qualitätslauf

GitHub Actions Run 46058656613: Syntaxprüfung erfolgreich, GLB-Validator-Selbsttests erfolgreich, Chromium-E2E erfolgreich mit **8/8 Prüfungen**. Der Lauf bestätigt die Engineering-Regressionstests, nicht das Laden oder die visuelle Qualität echter Avatar-Dateien.

[Qualitätslauf 46058656613](https://github.com/haldoaios-Official/HalDo/actions/runs/46058656613)

**Status bleibt:** Human3D ist noch nicht produktiv in index.html eingebunden. Die Engine wird erst nach Bereitstellung und technischer Freigabe echter Avatar-GLBs integriert.


## Ergänzung: Mimik-Schnittstelle und neue Asset-Strategie (27.11.2026)

Die Human3D-Engine stellt jetzt drei allgemeine Methoden für GLTF-Morph-Targets bereit: setFaceExpression(name, weight), setFaceExpressions(map) und resetFaceExpressions(). Die Engine sucht Targets in den tatsächlich geladenen Meshes, begrenzt Gewichte auf 0 bis 1 und lässt nicht vorhandene Targets wirkungslos. Das ist eine steuerbare Mimik-Schnittstelle, noch keine automatische Audio-/Visem-Analyse.

Die Chromium-Regression prüft das Setzen und Zurücksetzen von jawOpen, eyeBlinkLeft und mouthSmile an einem Test-GLTF-Mesh. GitHub Actions Run 46061538577 meldet 8/8 erfolgreiche Browserprüfungen einschließlich GLB-Validator-Selbsttests. Der Testlauf simuliert die Morph-Target-Datenstruktur; er beweist noch nicht, dass ein Produktions-Avatar in HalDo geladen wurde.

Als bevorzugte Erzeugungspipeline wird HumanForge untersucht: MakeHuman-/MPFB2-basierte CC0-Kern-Assets, Mixamo-Rig und ARKit-benannte Gesichtsausdrücke. Da HumanForge aktuell Three.js ab r160 erwartet und HalDo r128 verwendet, wird es zunächst ausschließlich separat zur GLB-Erzeugung betrachtet. Exportdateien müssen auf r128-Kompatibilität getestet werden; es gibt keine ungeprüfte globale Three.js-Aktualisierung.

**Produktionsfreigabe unverändert:** Es ist noch kein HumanForge-GLB in HalDo aufgenommen oder visuell abgenommen. Die vier erwarteten Avatar-Dateien fehlen weiterhin. Kein Avatar darf als vollständig, lebensecht oder lippensynchron integriert bezeichnet werden, bevor die jeweilige GLB-Datei, Mimik, Animationen und Browserdarstellung mit echten Daten geprüft sind.


## Emotionsprofile an echte Gesichtsmorphs gekoppelt (27.11.2026)

Die `HalDo.Human3D.setEmotion()`-Funktion setzt nicht mehr nur den UI-Status. Sie wendet jetzt zurückhaltende Profile auf vorhandene Morph Targets an:

| HalDo-Emotion | Erwartete Morph Targets (sofern im GLB vorhanden) |
|---|---|
| Friendly | mouthSmile |
| Happy | mouthSmile, eyeSquintLeft, eyeSquintRight |
| Thinking | browInnerUp, mouthPucker |
| Surprised | jawOpen, eyeWideLeft, eyeWideRight, browInnerUp |
| Serious | browDownLeft, browDownRight, mouthPress |
| Listening | browInnerUp |
| Speaking | keine künstliche Mundbewegung; später zeitgesteuerte Viseme |
| Calm | leichte mouthSmile-Ausprägung |

Die Profile werden bei einem Emotionswechsel zurückgesetzt, bevor das nächste Profil gesetzt wird. `getFaceExpressions()` liefert die tatsächlich im geladenen Modell vorhandenen Gesichtskanäle samt aktuellem Einflusswert; `getStatus()` meldet nun außerdem Anzahl und Namen unterstützter Face-Morphs. Nicht vorhandene Zielkanäle werden ignoriert. Eine Emotion wird daher nicht fälschlich als sichtbare Animation gemeldet, wenn das gewählte GLB das Morph Target nicht besitzt.

Chromium-Testlauf [46066932372](https://github.com/haldoaios-Official/HalDo/actions/runs/46066932372): **8/8 Prüfungen erfolgreich**. Die synthetische GLB-Testszene prüft Profilwechsel, Neutralisierung, gezielte Einzel-/Batch-Werte und die Regel, dass Speaking ohne Viseme-Daten den Kiefer nicht künstlich bewegt.

**Nächste Stufe:** zeitgesteuerte Viseme aus einer TTS-/Speech-Pipeline anbinden. Browser-`SpeechSynthesis` liefert in HalDo derzeit keine geprüften phonem-/visemgenauen Daten; Wortgrenzen oder pauschale Kieferbewegungen dürfen nicht als echte Lippensynchronisation ausgegeben werden.


## Zeitsynchronisierte Viseme-Schnittstelle vorbereitet (27.11.2026)

Die Human3D-Engine stellt jetzt eine provider-neutrale Zeitachsen-Schnittstelle bereit:

- `setVisemeTimeline(frames)` nimmt mindestens zwei streng aufsteigend sortierte Zeitpunkte entgegen. Jeder Frame enthält `timeMs` und ein `expressions`-Objekt mit Mund-/Kieferkanälen (`jaw*`, `mouth*` oder `viseme_*`) und normierten Gewichten von 0 bis 1.
- `updateVisemes(audioTimeMs)` interpoliert die Werte anhand der vom Audioplayer gelieferten Zeit in Millisekunden. Der Aufrufer muss dieselbe Zeitbasis wie die Audiospur verwenden; ein eigener Timer der Engine wird absichtlich nicht als Ersatz verwendet.
- `clearVisemeTimeline()` entfernt die Visem-Ebene und stellt die aktuelle Basis-/Emotionsmimik wieder her.
- `getVisemeStatus()` meldet, ob eine Zeitachse aktiv ist, ihre Dauer, den letzten Audiotimestamp und die gesteuerten Kanäle.

Die Visem-Ebene überschreibt während ihrer Laufzeit nur die betroffenen Mund-/Kieferkanäle und wird bei einem Modellwechsel auf das neu geladene Gesicht übertragen. Ungültige Zeitpunkte, nicht aufsteigende Frames, nicht-mundbezogene Kanäle und Gewichte außerhalb 0 bis 1 werden abgewiesen.

**Wichtige Grenze:** Diese Schnittstelle analysiert keine Stimme, erzeugt keine Phoneme/Viseme und spielt selbst kein Audio ab. Die bestehende Browser-`SpeechSynthesis`-Ausgabe liefert HalDo hier noch keine geprüfte phonemgenaue Zeitachse. Ein TTS-/Audioanbieter muss echte Visemwerte liefern und `updateVisemes()` mit seiner tatsächlichen Playback-Zeit aufrufen. Bis diese Verbindung und ein echtes Avatar-GLB getestet sind, ist Lip-Sync weiterhin **nicht produktiv fertig**.

Die Browser-Regression erweitert den synthetischen Test um Interpolation bei 150 ms, Validierung der Kanäle/Gewichte, Statusmeldung und sauberes Zurücksetzen der Visem-Ebene. Der Test belegt die Engine-Logik, nicht die Qualität oder Verfügbarkeit eines realen Avatar-Modells.


## HalDo Voice Core ↔ Audio-Visem-Brücke integriert (27.11.2026)

Die tatsächlich im `index.html` eingebettete **HalDo AI Voice Core Pro v159** wurde erweitert. Der Provider-Zweig kann jetzt neben `audioUrl` oder `audioBase64` optional ein JSON-Feld `visemeTimeline` entgegennehmen. Die separate Datei `voice.js` ist dafür nicht der zentrale Ladepfad; die Erweiterung sitzt bewusst im tatsächlich eingebetteten Voice Core.

### Provider-Antwortvertrag

Beispiel für die JSON-Antwort eines eigenen, serverseitig geschützten TTS-Proxys:

```json
{
  "audioUrl": "https://voice.example/haldo-audio.mp3",
  "visemeTimeline": [
    { "timeMs": 0, "expressions": { "jawOpen": 0, "mouthPucker": 0 } },
    { "timeMs": 100, "expressions": { "jawOpen": 1, "mouthPucker": 0.2 } },
    { "timeMs": 200, "expressions": { "jawOpen": 0, "mouthPucker": 1 } }
  ]
}
```

- `timeMs` ist die Position innerhalb derselben Audiodatei, nicht die Serverzeit.
- `expressions` enthält nur erlaubte Mund-/Kieferkanäle; die Human3D-Engine prüft Frames, sortierte Zeitwerte und Gewichte.
- Während der Wiedergabe liest die Brücke `HTMLAudioElement.currentTime` und aktualisiert Human3D über `requestAnimationFrame`; das vermeidet die grobe Taktung eines reinen `timeupdate`-Events.
- Pause setzt die Visem-Ebene zurück; Fortsetzen legt sie anhand der aktuellen Wiedergabezeit erneut an. Seek, Ende, Fehler und Stop werden behandelt.
- Fehlt die Human3D-Engine oder weist sie die Timeline ab, wird die Audio-Wiedergabe nicht blockiert. Der Voice Core meldet den Grund über Voice-Events.
- `HalDo.VoiceCore.bindVisemeAudio(audio, frames)` ist zusätzlich als Provider-/App-Adapter verfügbar; `clearVisemeAudio()` löst die aktuelle Bindung.

**Unveränderte Grenze:** Browser-`SpeechSynthesis` bleibt ohne Visem-Zeitachse. Der TTS-Server muss die optionalen Daten tatsächlich liefern und sie korrekt zur erzeugten Audiodatei ausrichten. Derzeit ist kein TTS-Provider konfiguriert und die Human3D-Engine wird in der aktuellen `index.html` weiterhin nicht produktiv eingebunden; deshalb ist noch keine echte Avatar-Lippensynchronisation im laufenden HalDo-System freigegeben.

Die Chromium-E2E ergänzt eine simulierte Provider-Antwort. Sie kontrolliert Audio-Zeit 50 ms/150 ms, Interpolation, aktive Bindung und Reset bei Pause. Der Test beweist die Verbindung zwischen Voice-Core und Human3D-API im simulierten Lauf, nicht eine reale Provider-Audioausgabe.


### Ergänzende Randfallprüfung: Rücksprung nach Timeline-Ende

Die Audio-Brücke erkennt jetzt auch, wenn die Visem-Zeitachse vor dem Ende der Audiodatei ausläuft. In diesem Fall wird die Animation beendet, aber die Audio-Bindung bleibt für einen möglichen Rücksprung erhalten. Bei einem Seek zurück in den gültigen Zeitbereich wird die Timeline erneut aktiviert und anhand der neuen Audio-Position ausgewertet. Der Chromium-Test prüft das Beenden nach 200 ms und den Rücksprung auf 100 ms mit Wiederherstellung von `jawOpen = 1`.
