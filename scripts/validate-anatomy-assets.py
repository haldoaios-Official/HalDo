#!/usr/bin/env python3
"""Validate the HalDo local anatomy inventory and GLB container headers."""
from __future__ import annotations

import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
EXPECTED = {"adult_male": 179, "adult_female": 179, "baby": 178}
errors: list[str] = []
draco_assets: dict[str, int] = {}
geometry_diagnostics: list[str] = []

def fail(message: str) -> None:
    errors.append(message)

def check_module(source: str, label: str) -> None:
    result = subprocess.run(
        ["node", "--input-type=module", "--check"],
        input=source,
        text=True,
        capture_output=True,
        cwd=ROOT,
    )
    if result.returncode:
        fail(f"JavaScript-Syntaxfehler in {label}: {result.stderr.strip()}")

manifest_path = ROOT / "models/manifest.json"
sources_path = ROOT / "models/sources.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
sources = json.loads(sources_path.read_text(encoding="utf-8"))

if manifest.get("schema_version") != 1:
    fail("manifest.json: schema_version muss 1 sein")
if set(manifest.get("profiles", {})) != set(EXPECTED):
    fail("manifest.json: Profile stimmen nicht mit adult_male/adult_female/baby überein")

for profile_id, expected_count in EXPECTED.items():
    profile = manifest.get("profiles", {}).get(profile_id, {})
    ids = profile.get("asset_ids", [])
    records = profile.get("asset_files", [])
    if len(ids) != expected_count or profile.get("asset_count") != expected_count:
        fail(f"{profile_id}: erwartet {expected_count} IDs, gefunden {len(ids)}")
    if len(records) != expected_count:
        fail(f"{profile_id}: erwartet {expected_count} Datei-Einträge, gefunden {len(records)}")
    if len(set(ids)) != len(ids):
        fail(f"{profile_id}: doppelte asset_ids")
    if profile.get("asset_status") != "partial":
        fail(f"{profile_id}: asset_status muss bis zur fachlichen Freigabe partial bleiben")

    root = profile.get("root", "").removeprefix("./")
    draco_assets[profile_id] = 0
    for record in records:
        bone_id = record.get("id", "")
        expected_path = f"{root}/{bone_id}.glb"
        relative_path = record.get("path", "")
        if relative_path != expected_path:
            fail(f"{profile_id}/{bone_id}: Manifestpfad {relative_path!r} != {expected_path!r}")
            continue
        path = ROOT / relative_path
        if not path.is_file():
            fail(f"Datei fehlt: {relative_path}")
            continue
        data = path.read_bytes()
        if len(data) < 20 or data[:4] != b"glTF":
            fail(f"Ungültiger GLB-Header: {relative_path}")
            continue
        version = int.from_bytes(data[4:8], "little")
        total_length = int.from_bytes(data[8:12], "little")
        json_length = int.from_bytes(data[12:16], "little")
        chunk_type = data[16:20]
        if version != 2 or total_length != len(data) or chunk_type != b"JSON":
            fail(f"Ungültiger GLB-2.0/JSON-Chunk: {relative_path}")
            continue
        if 20 + json_length > len(data):
            fail(f"GLB-JSON-Chunk außerhalb der Datei: {relative_path}")
            continue
        try:
            document = json.loads(data[20:20 + json_length].decode("utf-8").rstrip(" \t\r\n\0"))
        except Exception as exc:
            fail(f"GLB-JSON nicht lesbar ({relative_path}): {exc}")
            continue
        if not document.get("nodes") or not document.get("scenes"):
            fail(f"GLB ohne nodes/scenes: {relative_path}")
        if bone_id in {"skull", "mandible", "c1_atlas", "c2", "c7", "t1", "sacrum", "sternum", "left_humerus", "left_radius", "left_metacarpal_1", "left_femur", "right_femur", "left_coxal", "right_coxal", "left_tibia"}:
            node_info = []
            for node in document.get("nodes", []):
                if "mesh" not in node:
                    continue
                mesh_index = node["mesh"]
                mesh = document.get("meshes", [])[mesh_index]
                primitive = mesh.get("primitives", [{}])[0]
                position_index = primitive.get("attributes", {}).get("POSITION")
                accessor = document.get("accessors", [])[position_index] if position_index is not None else {}
                node_info.append({
                    "node": node.get("name"),
                    "translation": node.get("translation"),
                    "rotation": node.get("rotation"),
                    "scale": node.get("scale"),
                    "matrix": node.get("matrix"),
                    "node_extras": node.get("extras"),
                    "mesh_name": mesh.get("name"),
                    "mesh_extras": mesh.get("extras"),
                    "min": accessor.get("min"),
                    "max": accessor.get("max"),
                })
            geometry_diagnostics.append(f"{profile_id}/{bone_id}: {node_info}")
        if "KHR_draco_mesh_compression" in document.get("extensionsRequired", []):
            draco_assets[profile_id] += 1

        # The inventory's Git blob SHA is retained to make accidental asset drift visible.
        if not record.get("sha"):
            fail(f"Manifest ohne Git-SHA: {relative_path}")

for profile_id in EXPECTED:
    if sources.get("profiles", {}).get(profile_id, {}).get("source_status") not in {"pending", "published"}:
        fail(f"sources.json: ungültiger source_status für {profile_id}")

catalog = (ROOT / "models/catalog.js").read_text(encoding="utf-8")
for profile_id, path in {
    "adult_male": "./models/adult_male",
    "adult_female": "./models/adult_male/adult_female",
    "baby": "./models/adult_male/adult_female/baby.glb",
}.items():
    if path not in catalog:
        fail(f"catalog.js fehlt der korrekte Pfad für {profile_id}: {path}")

loader = (ROOT / "models/loader.js").read_text(encoding="utf-8")
if "loader.setDRACOLoader(draco)" not in loader:
    fail("loader.js aktiviert keinen Draco-Decoder")
if "loadProfileModels" not in loader:
    fail("loader.js exportiert keine Profil-Ladefunktion")

launcher = (ROOT / "index.html").read_text(encoding="utf-8")
if launcher.count("id:'anatomie-3d'") != 1:
    fail("index.html muss Anatomie 3D Pro Max genau einmal im App-Registry anbieten")
if "if (app.id === 'anatomie-3d' && HalDo.Anatomy3DProMax)" not in launcher:
    fail("Der frühe HalDo-Launcher enthält keinen kompatiblen Anatomie-3D-Aufruf")
if "'anatomie-3d':'Anatomy3DProMax'" not in launcher or "H.Anatomy3DProMax = {" not in launcher:
    fail("Der zentrale finale HalDo-App-Dispatcher kennt Anatomie 3D Pro Max nicht")
if 'src="./anatomie.html"' not in launcher:
    fail("Der HalDo-Launcher öffnet die lokale anatomie.html nicht im App-Fenster")
if 'haldo-anatomy3d-final-launch' not in launcher or "H.WelcomeExperience.openApp(app, enterAnatomy)" not in launcher or "H.Anatomy3DProMax.open()" not in launcher:
    fail("Die finale Anatomie-Route muss die individuelle HalDo-App-Begrüßung starten")
if "querySelector('.win-body-pro, .win-body')" not in launcher:
    fail("Die Anatomie-Fensterintegration unterstützt den finalen Win-Pro-Fensterkörper nicht")

anatomy = (ROOT / "anatomie.html").read_text(encoding="utf-8")
if "loadModelManifest, loadProfileModels" not in anatomy:
    fail("anatomie.html ist nicht mit dem lokalen Modell-Loader verbunden")
if "hpfrei/body-anatomy-3d-viewer" in anatomy:
    fail("anatomie.html verwendet noch das externe Ganzkörpermodell")
if "visuelle Adaption" not in anatomy or "Gelenkpassungen" not in anatomy or "nicht fachlich oder klinisch validiert" not in anatomy:
    fail("anatomie.html kennzeichnet die weibliche und Baby-Adaption samt offener Gelenkvalidierung nicht ausreichend")
from html.parser import HTMLParser

class ModuleScriptParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_module = False
        self.parts: list[str] = []
        self.modules: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "script" and dict(attrs).get("type") == "module":
            self.in_module = True
            self.parts = []

    def handle_data(self, data: str) -> None:
        if self.in_module:
            self.parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self.in_module:
            self.modules.append("".join(self.parts))
            self.in_module = False

parser = ModuleScriptParser()
parser.feed(anatomy)
module_scripts = parser.modules
if not module_scripts:
    fail("anatomie.html enthält kein auswertbares type=module-Script")

for file in ["models/catalog.js", "models/loader.js", "models/package.js", "scripts/test-anatomy-browser.mjs"]:
    check_module((ROOT / file).read_text(encoding="utf-8"), file)
for index, source in enumerate(module_scripts, start=1):
    check_module(source, f"anatomie.html Modul {index}")

print("Profilbestände:", EXPECTED)
print("Draco-komprimierte GLBs:", draco_assets)
print("Räumliche Stichprobe (GLB-Rohkoordinaten und Node-Transforms):")
for item in geometry_diagnostics:
    print(item)
print("Manifestpfade, GLB-Header, JSON-Chunks, Katalog und JS-Syntax geprüft.")
if errors:
    print("\n".join(f"FEHLER: {message}" for message in errors), file=sys.stderr)
    sys.exit(1)
print("ANATOMY VALIDATION: PASS")
