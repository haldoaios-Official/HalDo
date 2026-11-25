// Zentrale Pfadverwaltung für die tatsächlich vorhandenen lokalen GLB-Bestände.
export const PROFILE_CATALOG = Object.freeze({
  adult_male: Object.freeze({ id: 'adult_male', label: 'Erwachsener Mann', root: './models/adult_male', status: 'partial' }),
  adult_female: Object.freeze({ id: 'adult_female', label: 'Erwachsene Frau', root: './models/adult_male/adult_female', status: 'partial' }),
  baby: Object.freeze({ id: 'baby', label: 'Baby / Neugeborenen-Profil', root: './models/adult_male/adult_female/baby.glb', status: 'partial' })
});

// Rückwärtskompatibilität: ältere Module verwenden infant/neonate.
const PROFILE_ALIASES = Object.freeze({ infant: 'baby', neonate: 'baby' });

export function profileCatalog(profileId = 'adult_male') {
  const canonicalId = PROFILE_ALIASES[profileId] || profileId;
  return PROFILE_CATALOG[canonicalId] || PROFILE_CATALOG.adult_male;
}

export function modelPath(profileId, boneId) {
  if (typeof boneId !== 'string' || !/^[a-z0-9_-]+$/i.test(boneId)) {
    throw new TypeError('Ungültige Knochen-ID.');
  }
  return `${profileCatalog(profileId).root}/${boneId}.glb`;
}
