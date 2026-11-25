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

def multiply_matrix4(a: list[list[float]], b: list[list[float]]) -> list[list[float]]:
    return [[sum(a[row][k] * b[k][col] for k in range(4)) for col in range(4)] for row in range(4)]

def node_local_matrix(node: dict) -> list[list[float]]:
    if "matrix" in node:
        values = node["matrix"]
        return [
            [values[0], values[4], values[8], values[12]],
            [values[1], values[5], values[9], values[13]],
            [values[2], values[6], values[10], values[14]],
            [values[3], values[7], values[11], values[15]],
        ]
    tx, ty, tz = node.get("translation", [0.0, 0.0, 0.0])
    x, y, z, w = node.get("rotation", [0.0, 0.0, 0.0, 1.0])
    sx, sy, sz = node.get("scale", [1.0, 1.0, 1.0])
    rotation = [
        [1 - 2 * (y*y + z*z), 2 * (x*y - z*w), 2 * (x*z + y*w)],
        [2 * (x*y + z*w), 1 - 2 * (x*x + z*z), 2 * (y*z - x*w)],
        [2 * (x*z - y*w), 2 * (y*z + x*w), 1 - 2 * (x*x + y*y)],
    ]
    return [
        [rotation[0][0] * sx, rotation[0][1] * sy, rotation[0][2] * sz, tx],
        [rotation[1][0] * sx, rotation[1][1] * sy, rotation[1][2] * sz, ty],
        [rotation[2][0] * sx, rotation[2][1] * sy, rotation[2][2] * sz, tz],
        [0.0, 0.0, 0.0, 1.0],
    ]

def transform_point(matrix: list[list[float]], point: list[float]) -> list[float]:
    x, y, z = point
    return [
        matrix[0][0]*x + matrix[0][1]*y + matrix[0][2]*z + matrix[0][3],
        matrix[1][0]*x + matrix[1][1]*y + matrix[1][2]*z + matrix[1][3],
        matrix[2][0]*x + matrix[2][1]*y + matrix[2][2]*z + matrix[2][3],
    ]

def scene_node_world_matrices(document: dict) -> dict[int, tuple[list[list[float]], list[str], list[dict]]]:
    nodes = document.get("nodes", [])
    scenes = document.get("scenes", [])
    if not nodes or not scenes:
        return {}
    scene_index = document.get("scene", 0)
    roots = scenes[scene_index].get("nodes", []) if 0 <= scene_index < len(scenes) else []
    output: dict[int, tuple[list[list[float]], list[str], list[dict]]] = {}
    identity = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]]

    def visit(index: int, parent: list[list[float]], chain: list[str], transform_chain: list[dict]) -> None:
        if index < 0 or index >= len(nodes) or index in output:
            return
        node = nodes[index]
        world = multiply_matrix4(parent, node_local_matrix(node))
        name_chain = chain + [str(node.get("name") or f"node-{index}")]
        transform_record = {
            "node_index": index,
            "name": node.get("name"),
            "translation": node.get("translation"),
            "rotation": node.get("rotation"),
            "scale": node.get("scale"),
            "matrix": node.get("matrix"),
        }
        current_transform_chain = transform_chain + [transform_record]
        output[index] = (world, name_chain, current_transform_chain)
        for child in node.get("children", []):
            visit(child, world, name_chain, current_transform_chain)

    for root in roots:
        visit(root, identity, [], [])
    return output

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
        if bone_id in {"skull", "mandible", "c1_atlas", "c2", "c7", "t1", "sacrum", "sternum", "left_humerus", "left_radius", "left_metacarpal_1", "left_femur", "right_femur", "left_coxal", "right_coxal", "left_tibia", "right_tibia"}:
            node_info = []
            world_by_node = scene_node_world_matrices(document)
            for node_index, node in enumerate(document.get("nodes", [])):
                if "mesh" not in node:
                    continue
                mesh_index = node["mesh"]
                mesh = document.get("meshes", [])[mesh_index]
                primitive = mesh.get("primitives", [{}])[0]
                position_index = primitive.get("attributes", {}).get("POSITION")
                accessor = document.get("accessors", [])[position_index] if position_index is not None else {}
                world_record = world_by_node.get(node_index)
                world_bounds = None
                if world_record and accessor.get("min") and accessor.get("max"):
                    world_matrix, node_chain, hierarchy_transforms = world_record
                    lo, hi = accessor["min"], accessor["max"]
                    corners = [
                        transform_point(world_matrix, [x, y, z])
                        for x in (lo[0], hi[0])
                        for y in (lo[1], hi[1])
                        for z in (lo[2], hi[2])
                    ]
                    world_bounds = {
                        "min": [min(point[axis] for point in corners) for axis in range(3)],
                        "max": [max(point[axis] for point in corners) for axis in range(3)],
                    }
                else:
                    node_chain = []
                node_info.append({
                    "node": node.get("name"),
                    "node_index": node_index,
                    "hierarchy": node_chain,
                    "translation": node.get("translation"),
                    "rotation": node.get("rotation"),
                    "scale": node.get("scale"),
                    "matrix": node.get("matrix"),
                    "world_translation": [world_record[0][0][3], world_record[0][1][3], world_record[0][2][3]] if world_record else None,
                    "world_matrix": world_record[0] if world_record else None,
                    "hierarchy_transforms": world_record[2] if world_record else [],
                    "node_extras": node.get("extras"),
                    "mesh_name": mesh.get("name"),
                    "mesh_extras": mesh.get("extras"),
                    "local_bounds": {"min": accessor.get("min"), "max": accessor.get("max")},
                    "world_bounds": world_bounds,
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
