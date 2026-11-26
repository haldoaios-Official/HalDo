/*
 * HalDo 3D asset catalog — generated from verified repository paths.
 * Counts represent separate GLB bone-part files, not a single assembled body.
 * Source/licence provenance still requires a separate review before clinical/public release.
 */
const ADULT_BONE_IDS = Object.freeze(["c1_atlas","c2","c3","c4","c5","c6","c7","coccyx","l1","l2","l3","l4","l5","left_calcaneus","left_capitate","left_clavicle","left_coxal","left_cuboid","left_digit_1_distal","left_digit_1_proximal","left_digit_2_distal","left_digit_2_middle","left_digit_2_proximal","left_digit_3_distal","left_digit_3_middle","left_digit_3_proximal","left_digit_4_distal","left_digit_4_middle","left_digit_4_proximal","left_digit_5_distal","left_digit_5_middle","left_digit_5_proximal","left_femur","left_fibula","left_hamate","left_humerus","left_intermediate_cuneiform","left_lateral_cuneiform","left_lunate","left_medial_cuneiform","left_metacarpal_1","left_metacarpal_2","left_metacarpal_3","left_metacarpal_4","left_metacarpal_5","left_metatarsal_1","left_metatarsal_2","left_metatarsal_3","left_metatarsal_4","left_metatarsal_5","left_navicular","left_patella","left_pisiform","left_radius","left_rib_1","left_rib_10","left_rib_11","left_rib_12","left_rib_2","left_rib_3","left_rib_4","left_rib_5","left_rib_6","left_rib_7","left_rib_8","left_rib_9","left_scaphoid","left_scapula","left_talus","left_tibia","left_toe_1_distal","left_toe_1_proximal","left_toe_2_distal","left_toe_2_middle","left_toe_2_proximal","left_toe_3_distal","left_toe_3_middle","left_toe_3_proximal","left_toe_4_distal","left_toe_4_middle","left_toe_4_proximal","left_toe_5_distal","left_toe_5_middle","left_toe_5_proximal","left_trapezium","left_trapezoid","left_triquetrum","left_ulna","mandible","right_calcaneus","right_capitate","right_clavicle","right_coxal","right_cuboid","right_digit_1_distal","right_digit_1_proximal","right_digit_2_distal","right_digit_2_middle","right_digit_2_proximal","right_digit_3_distal","right_digit_3_middle","right_digit_3_proximal","right_digit_4_distal","right_digit_4_middle","right_digit_4_proximal","right_digit_5_distal","right_digit_5_middle","right_digit_5_proximal","right_femur","right_fibula","right_hamate","right_humerus","right_intermediate_cuneiform","right_lateral_cuneiform","right_lunate","right_medial_cuneiform","right_metacarpal_1","right_metacarpal_2","right_metacarpal_3","right_metacarpal_4","right_metacarpal_5","right_metatarsal_1","right_metatarsal_2","right_metatarsal_3","right_metatarsal_4","right_metatarsal_5","right_navicular","right_patella","right_pisiform","right_radius","right_rib_1","right_rib_10","right_rib_11","right_rib_12","right_rib_2","right_rib_3","right_rib_4","right_rib_5","right_rib_6","right_rib_7","right_rib_8","right_rib_9","right_scaphoid","right_scapula","right_talus","right_tibia","right_toe_1_distal","right_toe_1_proximal","right_toe_2_distal","right_toe_2_middle","right_toe_2_proximal","right_toe_3_distal","right_toe_3_middle","right_toe_3_proximal","right_toe_4_distal","right_toe_4_middle","right_toe_4_proximal","right_toe_5_distal","right_toe_5_middle","right_toe_5_proximal","right_trapezium","right_trapezoid","right_triquetrum","right_ulna","sacrum","skull","sternum","t1","t10","t11","t12","t2","t3","t4","t5","t6","t7","t8","t9"]);
const INFANT_BONE_IDS = Object.freeze(["c2","c3","c4","c5","c6","c7","coccyx","l1","l2","l3","l4","l5","left_calcaneus","left_capitate","left_clavicle","left_coxal","left_cuboid","left_digit_1_distal","left_digit_1_proximal","left_digit_2_distal","left_digit_2_middle","left_digit_2_proximal","left_digit_3_distal","left_digit_3_middle","left_digit_3_proximal","left_digit_4_distal","left_digit_4_middle","left_digit_4_proximal","left_digit_5_distal","left_digit_5_middle","left_digit_5_proximal","left_femur","left_fibula","left_hamate","left_humerus","left_intermediate_cuneiform","left_lateral_cuneiform","left_lunate","left_medial_cuneiform","left_metacarpal_1","left_metacarpal_2","left_metacarpal_3","left_metacarpal_4","left_metacarpal_5","left_metatarsal_1","left_metatarsal_2","left_metatarsal_3","left_metatarsal_4","left_metatarsal_5","left_navicular","left_patella","left_pisiform","left_radius","left_rib_1","left_rib_10","left_rib_11","left_rib_12","left_rib_2","left_rib_3","left_rib_4","left_rib_5","left_rib_6","left_rib_7","left_rib_8","left_rib_9","left_scaphoid","left_scapula","left_talus","left_tibia","left_toe_1_distal","left_toe_1_proximal","left_toe_2_distal","left_toe_2_middle","left_toe_2_proximal","left_toe_3_distal","left_toe_3_middle","left_toe_3_proximal","left_toe_4_distal","left_toe_4_middle","left_toe_4_proximal","left_toe_5_distal","left_toe_5_middle","left_toe_5_proximal","left_trapezium","left_trapezoid","left_triquetrum","left_ulna","mandible","right_calcaneus","right_capitate","right_clavicle","right_coxal","right_cuboid","right_digit_1_distal","right_digit_1_proximal","right_digit_2_distal","right_digit_2_middle","right_digit_2_proximal","right_digit_3_distal","right_digit_3_middle","right_digit_3_proximal","right_digit_4_distal","right_digit_4_middle","right_digit_4_proximal","right_digit_5_distal","right_digit_5_middle","right_digit_5_proximal","right_femur","right_fibula","right_hamate","right_humerus","right_intermediate_cuneiform","right_lateral_cuneiform","right_lunate","right_medial_cuneiform","right_metacarpal_1","right_metacarpal_2","right_metacarpal_3","right_metacarpal_4","right_metacarpal_5","right_metatarsal_1","right_metatarsal_2","right_metatarsal_3","right_metatarsal_4","right_metatarsal_5","right_navicular","right_patella","right_pisiform","right_radius","right_rib_1","right_rib_10","right_rib_11","right_rib_12","right_rib_2","right_rib_3","right_rib_4","right_rib_5","right_rib_6","right_rib_7","right_rib_8","right_rib_9","right_scaphoid","right_scapula","right_talus","right_tibia","right_toe_1_distal","right_toe_1_proximal","right_toe_2_distal","right_toe_2_middle","right_toe_2_proximal","right_toe_3_distal","right_toe_3_middle","right_toe_3_proximal","right_toe_4_distal","right_toe_4_middle","right_toe_4_proximal","right_toe_5_distal","right_toe_5_middle","right_toe_5_proximal","right_trapezium","right_trapezoid","right_triquetrum","right_ulna","sacrum","skull","sternum","t1","t10","t11","t12","t2","t3","t4","t5","t6","t7","t8","t9"]);

export const PROFILE_CATALOG = Object.freeze({
  adult_male: Object.freeze({
    label: 'Adulto masculino',
    root: './models/adult_male',
    status: 'partial',
    asset_count: ADULT_BONE_IDS.length,
    asset_ids: ADULT_BONE_IDS
  }),
  adult_female: Object.freeze({
    label: 'Adulto femenino',
    root: './models/adult_male/adult_female',
    status: 'partial',
    asset_count: ADULT_BONE_IDS.length,
    asset_ids: ADULT_BONE_IDS
  }),
  infant: Object.freeze({
    label: 'Infante',
    root: './models/adult_male/adult_female/baby.glb',
    status: 'partial',
    asset_count: INFANT_BONE_IDS.length,
    missing_asset_ids: ['c1_atlas'],
    asset_ids: INFANT_BONE_IDS
  }),
  neonate: Object.freeze({
    label: 'Neonato',
    root: null,
    status: 'placeholder',
    asset_count: 0,
    asset_ids: Object.freeze([])
  })
});

export function profileCatalog(profileId) {
  return PROFILE_CATALOG[profileId] || null;
}

export function modelPath(profileId, boneId) {
  const profile = profileCatalog(profileId);
  const id = String(boneId || '').trim();
  if (!profile || !profile.root || profile.status === 'placeholder') return null;
  if (!/^[a-z0-9_]+$/.test(id) || !profile.asset_ids.includes(id)) return null;
  return `${profile.root}/${id}.glb`;
}
