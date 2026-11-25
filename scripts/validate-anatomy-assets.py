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
scene_documents: dict[tuple[str, str], dict] = {}
ADAPTATION_SAMPLE_BONES: tuple[str, ...] = ()
SPECIAL_ADAPTATION_SCALE_RATIOS = {"skull": (1.0, 1.0, 1.34), "mandible": (1.0, 1.0, 1.22)}
adaptation_bin_payloads: dict[tuple[str, str], bytes] = {}
adaptation_parent_scales: dict[tuple[str, str], list[float]] = {}

def fail(message: str) -> None:
    errors.append(message)

def glb_binary_chunk(data: bytes) -> bytes | None:
    """Return the first GLB BIN chunk without attempting to decode mesh compression."""
    offset = 12
    while offset + 8 <= len(data):
        chunk_length = int.from_bytes(data[offset:offset + 4], "little")
        chunk_type = data[offset + 4:offset + 8]
        chunk_start = offset + 8
        chunk_end = chunk_start + chunk_length
        if chunk_end > len(data):
            return None
        if chunk_type == b"BIN\0":
            return data[chunk_start:chunk_end]
        offset = chunk_end
    return None

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

def scene_transform_path_records(document: dict) -> dict[str, dict]:
    """Return every active-scene node with a stable root/child-index path and full transform chain."""
    nodes = document.get("nodes", [])
    scenes = document.get("scenes", [])
    if not nodes or not scenes:
        return {}
    scene_index = document.get("scene", 0)
    if not isinstance(scene_index, int) or scene_index < 0 or scene_index >= len(scenes):
        raise ValueError("GLB enthält keinen gültigen aktiven Szenenindex")
    roots = scenes[scene_index].get("nodes", [])
    identity = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]]
    output: dict[str, dict] = {}
    active: set[int] = set()
    visited: set[int] = set()

    def visit(index: int, parent_world: list[list[float]], path: str, parent_path: str | None) -> None:
        if not isinstance(index, int) or index < 0 or index >= len(nodes):
            raise ValueError(f"ungültiger Node-Index {index!r}")
        if index in active:
            raise ValueError(f"Zyklus in Node-Hierarchie bei Node {index}")
        if index in visited:
            raise ValueError(f"Node {index} wird mehrfach in der aktiven Szene referenziert")
        active.add(index)
        visited.add(index)
        node = nodes[index]
        local = node_local_matrix(node)
        world = multiply_matrix4(parent_world, local)
        output[path] = {
            "node_index": index,
            "name": node.get("name"),
            "parent_path": parent_path,
            "has_mesh": "mesh" in node,
            "child_count": len(node.get("children", [])),
            "local_matrix": local,
            "parent_world_matrix": parent_world,
            "world_matrix": world,
        }
        for child_order, child_index in enumerate(node.get("children", [])):
            visit(child_index, world, f"{path}/c{child_order}", path)
        active.remove(index)

    for root_order, root_index in enumerate(roots):
        visit(root_index, identity, f"r{root_order}", None)
    return output


def max_abs_matrix_delta(left: list[list[float]], right: list[list[float]]) -> float:
    return max(
        abs(left[row][col] - right[row][col])
        for row in range(4)
        for col in range(4)
    )


def summarize_male_female_transform_audit(
    documents: dict[tuple[str, str], dict],
    asset_ids: set[str],
    tolerance: float = 1e-6,
) -> dict:
    """Compare all active-scene local, parent-world and world matrices by hierarchy path."""
    assets: dict[str, dict] = {}
    totals = {
        "shared_node_paths": 0,
        "nodes_with_local_transform_differences": 0,
        "nodes_with_parent_world_transform_differences": 0,
        "nodes_with_world_transform_differences": 0,
    }
    for bone_id in sorted(asset_ids):
        male_doc = documents.get(("adult_male", bone_id))
        female_doc = documents.get(("adult_female", bone_id))
        if male_doc is None or female_doc is None:
            fail(f"{bone_id}: GLB-JSON für den vollständigen Transform-Audit fehlt")
            continue
        try:
            male_nodes = scene_transform_path_records(male_doc)
            female_nodes = scene_transform_path_records(female_doc)
        except Exception as exc:
            fail(f"{bone_id}: Transform-Hierarchie konnte nicht ausgewertet werden: {exc}")
            continue

        male_paths, female_paths = set(male_nodes), set(female_nodes)
        shared_paths = sorted(male_paths & female_paths)
        missing_in_female = sorted(male_paths - female_paths)
        missing_in_male = sorted(female_paths - male_paths)
        name_mismatches = []
        changed_nodes = []
        local_changed = parent_changed = world_changed = 0
        max_local_delta = max_parent_delta = max_world_delta = 0.0
        for node_path in shared_paths:
            male_node = male_nodes[node_path]
            female_node = female_nodes[node_path]
            local_delta = max_abs_matrix_delta(male_node["local_matrix"], female_node["local_matrix"])
            parent_delta = max_abs_matrix_delta(male_node["parent_world_matrix"], female_node["parent_world_matrix"])
            world_delta = max_abs_matrix_delta(male_node["world_matrix"], female_node["world_matrix"])
            max_local_delta = max(max_local_delta, local_delta)
            max_parent_delta = max(max_parent_delta, parent_delta)
            max_world_delta = max(max_world_delta, world_delta)
            if male_node.get("name") != female_node.get("name"):
                name_mismatches.append({
                    "path": node_path,
                    "adult_male": male_node.get("name"),
                    "adult_female": female_node.get("name"),
                })
            local_differs = local_delta > tolerance
            parent_differs = parent_delta > tolerance
            world_differs = world_delta > tolerance
            local_changed += int(local_differs)
            parent_changed += int(parent_differs)
            world_changed += int(world_differs)
            if local_differs or parent_differs or world_differs or male_node.get("name") != female_node.get("name"):
                changed_nodes.append({
                    "path": node_path,
                    "adult_male_name": male_node.get("name"),
                    "adult_female_name": female_node.get("name"),
                    "adult_male_parent_path": male_node.get("parent_path"),
                    "adult_female_parent_path": female_node.get("parent_path"),
                    "max_abs_local_matrix_delta": local_delta,
                    "max_abs_parent_world_matrix_delta": parent_delta,
                    "max_abs_world_matrix_delta": world_delta,
                    "adult_male_local_matrix": male_node["local_matrix"],
                    "adult_female_local_matrix": female_node["local_matrix"],
                    "adult_male_parent_world_matrix": male_node["parent_world_matrix"],
                    "adult_female_parent_world_matrix": female_node["parent_world_matrix"],
                    "adult_male_world_matrix": male_node["world_matrix"],
                    "adult_female_world_matrix": female_node["world_matrix"],
                })

        totals["shared_node_paths"] += len(shared_paths)
        totals["nodes_with_local_transform_differences"] += local_changed
        totals["nodes_with_parent_world_transform_differences"] += parent_changed
        totals["nodes_with_world_transform_differences"] += world_changed
        assets[bone_id] = {
            "hierarchy_paths_match": not missing_in_female and not missing_in_male,
            "adult_male_node_count": len(male_nodes),
            "adult_female_node_count": len(female_nodes),
            "shared_node_path_count": len(shared_paths),
            "missing_in_adult_female_paths": missing_in_female,
            "missing_in_adult_male_paths": missing_in_male,
            "node_name_mismatches": name_mismatches,
            "nodes_with_local_transform_differences": local_changed,
            "nodes_with_parent_world_transform_differences": parent_changed,
            "nodes_with_world_transform_differences": world_changed,
            "max_abs_local_matrix_delta": max_local_delta,
            "max_abs_parent_world_matrix_delta": max_parent_delta,
            "max_abs_world_matrix_delta": max_world_delta,
            "changed_node_details": changed_nodes,
        }

    completed = len(assets)
    summary = {
        "expected_asset_pairs": len(asset_ids),
        "completed_asset_pairs": completed,
        "assets_with_matching_hierarchy_paths": sum(item["hierarchy_paths_match"] for item in assets.values()),
        "assets_with_different_hierarchy_paths": sum(not item["hierarchy_paths_match"] for item in assets.values()),
        "assets_with_node_name_mismatches": sum(bool(item["node_name_mismatches"]) for item in assets.values()),
        "assets_with_local_transform_differences": sum(item["nodes_with_local_transform_differences"] > 0 for item in assets.values()),
        "assets_with_parent_world_transform_differences": sum(item["nodes_with_parent_world_transform_differences"] > 0 for item in assets.values()),
        "assets_with_world_transform_differences": sum(item["nodes_with_world_transform_differences"] > 0 for item in assets.values()),
        **totals,
    }
    return {
        "schema_version": 1,
        "comparison": "adult_male versus adult_female",
        "matrix_component_absolute_tolerance": tolerance,
        "tolerance_note": "Numerische Vergleichsschwelle für Matrix-Komponenten; keine anatomische oder klinische Toleranz.",
        "path_definition": "Stabile Pfade aus Root-Reihenfolge und Child-Reihenfolge der aktiven glTF-Szene (r0/c0/c1...).",
        "method": "Vergleicht für jeden Node die lokale 4x4-Matrix, die kumulierte Parent-Weltmatrix und die kumulierte Node-Weltmatrix. GLB-Matrizen werden aus den gespeicherten TRS-Werten bzw. aus matrix rekonstruiert.",
        "scope_limitations": [
            "Vergleich der Transformstruktur und -matrizen, nicht der klinischen Anatomie.",
            "Vertex-Positionen, Dreiecks-Konnektivität, Normalen, Materialien und Gelenkflächen werden in diesem Audit nicht verglichen.",
            "Node-Pfade beruhen auf Root- und Child-Reihenfolge; umbenannte Nodes werden separat ausgewiesen.",
            "Die aktiven glTF-Szenen werden verglichen; nicht referenzierte, inaktive Nodes sind nicht Teil dieses Berichts."
        ],
        "summary": summary,
        "assets": assets,
    }

manifest_path = ROOT / "models/manifest.json"
sources_path = ROOT / "models/sources.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
sources = json.loads(sources_path.read_text(encoding="utf-8"))
ADAPTATION_SAMPLE_BONES = tuple(manifest.get("profiles", {}).get("baby", {}).get("asset_ids", []))
if len(ADAPTATION_SAMPLE_BONES) != EXPECTED["baby"]:
    fail(f"Baby-Adaptionsaudit: erwartet {EXPECTED['baby']} Knochen-IDs, gefunden {len(ADAPTATION_SAMPLE_BONES)}")
male_asset_ids = set(manifest.get("profiles", {}).get("adult_male", {}).get("asset_ids", []))
female_asset_ids = set(manifest.get("profiles", {}).get("adult_female", {}).get("asset_ids", []))
if len(male_asset_ids) != EXPECTED["adult_male"] or len(female_asset_ids) != EXPECTED["adult_female"]:
    fail("Männer/Frauen-Geometrieaudit: Ausgangsprofile müssen jeweils 179 eindeutige IDs enthalten")
if male_asset_ids != female_asset_ids:
    fail("Männer/Frauen-Geometrieaudit: die Asset-ID-Mengen der Profile stimmen nicht überein")
if not set(ADAPTATION_SAMPLE_BONES).issubset(female_asset_ids):
    fail("Baby-Adaptionsaudit: mindestens eine Baby-Knochen-ID fehlt im weiblichen Vergleichsprofil")

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
        if profile_id in {"adult_male", "adult_female"}:
            scene_documents[(profile_id, bone_id)] = document
        if profile_id in {"adult_female", "baby"} and bone_id in ADAPTATION_SAMPLE_BONES:
            binary_payload = glb_binary_chunk(data)
            if binary_payload is None:
                fail(f"{relative_path}: BIN-Chunk für Adaptionsvergleich fehlt oder ist ungültig")
            else:
                adaptation_bin_payloads[(profile_id, bone_id)] = binary_payload
            scenes = document.get("scenes", [])
            scene_index = document.get("scene", 0)
            roots = scenes[scene_index].get("nodes", []) if 0 <= scene_index < len(scenes) else []
            if len(roots) != 1:
                fail(f"{relative_path}: erwartete genau einen Szenen-Root für Parent-Skalierungsprüfung")
            else:
                root_node = document.get("nodes", [])[roots[0]]
                adaptation_parent_scales[(profile_id, bone_id)] = root_node.get("scale", [1.0, 1.0, 1.0])
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

male_female_transform_audit = summarize_male_female_transform_audit(
    scene_documents,
    male_asset_ids,
    tolerance=1e-6,
)
if male_female_transform_audit["summary"]["completed_asset_pairs"] != EXPECTED["adult_male"]:
    fail("Männer/Frauen-Transformaudit hat nicht alle 179 Asset-Paare ausgewertet")
transform_report_path = ROOT / "artifacts/anatomy/transform-audit.json"
transform_report_path.parent.mkdir(parents=True, exist_ok=True)
transform_report_path.write_text(
    json.dumps(male_female_transform_audit, ensure_ascii=False, indent=2) + \n,
    encoding="utf-8",
)
print("MALE-FEMALE-TRANSFORM-AUDIT-SUMMARY", json.dumps(male_female_transform_audit["summary"], ensure_ascii=False, separators=(",", ":")))
print("MALE-FEMALE-TRANSFORM-AUDIT-FILE: artifacts/anatomy/transform-audit.json")
verified_geometry_pairs = 0
verified_uniform_scale_pairs = 0
verified_special_scale_pairs = 0
for bone_id in ADAPTATION_SAMPLE_BONES:
    female_payload = adaptation_bin_payloads.get(("adult_female", bone_id))
    baby_payload = adaptation_bin_payloads.get(("baby", bone_id))
    if female_payload is None or baby_payload is None:
        fail(f"{bone_id}: weiblicher/Baby-BIN-Payload für Vergleich fehlt")
    elif female_payload != baby_payload:
        fail(f"{bone_id}: weibliche und Baby-Geometrie-Payloads sind nicht mehr byteidentisch; sources.json/App-Hinweis neu bewerten")
    else:
        verified_geometry_pairs += 1
    female_scale = adaptation_parent_scales.get(("adult_female", bone_id))
    baby_scale = adaptation_parent_scales.get(("baby", bone_id))
    if female_scale is None or baby_scale is None or len(female_scale) != 3 or len(baby_scale) != 3:
        fail(f"{bone_id}: Parent-Skalierung für weibliches/Baby-Profil fehlt")
    else:
        expected_ratio = SPECIAL_ADAPTATION_SCALE_RATIOS.get(bone_id, (0.62, 0.62, 0.62))
        actual_ratio = tuple(float(baby_scale[i]) / float(female_scale[i]) for i in range(3))
        if any(abs(actual_ratio[i] - expected_ratio[i]) > 1e-5 for i in range(3)):
            fail(f"{bone_id}: Baby-Parent-Skalierung {actual_ratio} weicht von erwartetem Verhältnis {expected_ratio} ab")
        elif bone_id in SPECIAL_ADAPTATION_SCALE_RATIOS:
            verified_special_scale_pairs += 1
        else:
            verified_uniform_scale_pairs += 1

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
if "mandibleRoot.scale.multiplyScalar(0.62)" not in loader:
    fail("loader.js enthält nicht die dokumentierte 0,62-Laufzeitkorrektur des Baby-Unterkiefers")
if "skullRoot.position.y += offsetY" not in loader:
    fail("loader.js enthält nicht die getrennte Schädel-Ausrichtung an der Halswirbel-Referenz")

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
    fail("anatomie.html kennzeichnet die weibliche Adaption samt offener Gelenkvalidierung nicht ausreichend")
if "vollständigen Chromium-Browser-Audit" not in anatomy or "179/179 lokale Vertex-Punktwolken" not in anatomy or "0,000001 m" not in anatomy or "Dreiecks-Konnektivität/Topologie" not in anatomy:
    fail("anatomie.html kennzeichnet den vollständigen weiblich/männlichen 179-Paar-Audit samt Grenzen nicht ausreichend")
female_geometry = sources.get("profiles", {}).get("adult_female", {}).get("geometry_comparison", {})
if female_geometry.get("automated_asset_pair_count") != EXPECTED["adult_female"]:
    fail("sources.json dokumentiert nicht alle 179 weiblich/männlichen Modellpaare")
if female_geometry.get("identical_vertex_point_clouds") != EXPECTED["adult_female"] or female_geometry.get("different_vertex_point_clouds") != 0:
    fail("sources.json enthält nicht das verifizierte Ergebnis 179 identische und 0 unterschiedliche Vertex-Punktwolken")
if female_geometry.get("coordinate_quantization_m") != 0.000001 or female_geometry.get("mismatch_asset_ids") != []:
    fail("sources.json dokumentiert Quantisierung oder Abweichungsliste des vollständigen Geometrieaudits falsch")
if not all(item in female_geometry.get("not_compared", []) for item in ["Node-Transforms und Hierarchie", "Vertex-Normalen", "Materialien und Texturen", "Dreiecks-Konnektivität und Topologie"]):
    fail("sources.json dokumentiert die Grenzen des weiblich/männlichen Punktwolkenvergleichs nicht vollständig")
if "0,62-fach skalierte visuelle Ableitung" not in anatomy or "178 Geometrie-Payloads byteidentisch" not in anatomy or "keine eigenständig modellierte oder altersgerechte Neugeborenen-Anatomie" not in anatomy or "176 von 178" not in anatomy:
    fail("anatomie.html kennzeichnet den vollständigen Baby-/Neugeborenen-Geometrie- und Skalierungsbefund nicht ausreichend")
baby_geometry = sources.get("profiles", {}).get("baby", {}).get("geometry_comparison", {})
if baby_geometry.get("automated_asset_pair_count") != EXPECTED["baby"] or baby_geometry.get("female_baby_bin_payloads_byte_identical") is not True or baby_geometry.get("uniform_baby_parent_scale_factor_vs_adult_female") != 0.62:
    fail("sources.json dokumentiert den vollständigen 178-Dateien-Geometrievergleich des Baby-Profils nicht korrekt")
if baby_geometry.get("special_parent_scale_ratios") != {"skull": [1.0, 1.0, 1.34], "mandible": [1.0, 1.0, 1.22]} or baby_geometry.get("runtime_baby_mandible_scale_factor") != 0.62:
    fail("sources.json dokumentiert die Schädel-/Unterkiefer-Sondertransforms nicht korrekt")
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
print(f"Weiblich/Baby-Geometrievergleich: {verified_geometry_pairs}/{len(ADAPTATION_SAMPLE_BONES)} BIN-Paare byteidentisch")
print(f"Weiblich/Männlich-Vollvergleich: {female_geometry.get('identical_vertex_point_clouds', 0)}/{female_geometry.get('automated_asset_pair_count', 0)} lokale Vertex-Punktwolken identisch; {female_geometry.get('different_vertex_point_clouds', 0)} Unterschiede; Quantisierung {female_geometry.get('coordinate_quantization_m', 'unbekannt')} m")
print("Weiblich/Männlich-Transformaudit:", male_female_transform_audit["summary"])
print(f"Weiblich/Baby-Skalierungsvergleich: {verified_uniform_scale_pairs}/{len(ADAPTATION_SAMPLE_BONES)} Standard-Paare mit Faktor 0,62; {verified_special_scale_pairs}/{len(SPECIAL_ADAPTATION_SCALE_RATIOS)} dokumentierte Sondertransforms")
print("Räumliche Stichprobe (GLB-Rohkoordinaten und Node-Transforms):")
for item in geometry_diagnostics:
    print(item)
print("Manifestpfade, GLB-Header, JSON-Chunks, Katalog und JS-Syntax geprüft.")
if errors:
    print("\n".join(f"FEHLER: {message}" for message in errors), file=sys.stderr)
    sys.exit(1)
print("ANATOMY VALIDATION: PASS")
