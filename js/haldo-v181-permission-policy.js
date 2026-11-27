/* ================================================================
   HALDO AI OS PRO MAX — v181 Permission Manifest Lifecycle Policy
   A reduced app manifest must revoke grants removed from that manifest.
   This is an in-session policy guard, not authentication or sandboxing.
   ================================================================ */
(function (window) {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var VERSION = '181.0.0';
  var core = H.PermissionCore;
  if (!core || core.version !== '179.0.0' || typeof core.registerApp !== 'function') {
    console.error('[HalDo v181] Permission Core v179 is required; lifecycle policy not installed.');
    return;
  }
  if (H.PermissionPolicy && H.PermissionPolicy.version === VERSION) return;

  var originalRegisterApp = core.registerApp;
  var originalGetStatus = H.AICore && H.AICore.getStatus;

  function guardedRegisterApp(appId, permissions) {
    // The v179 validator remains authoritative; invalid manifests throw before
    // the previous registration or its grants can be changed.
    var previous = core.listApps().find(function (item) { return item.id === appId; });
    var result = originalRegisterApp.call(core, appId, permissions);
    var nextSet = new Set(result.permissions);
    var revoked = [];

    if (previous) {
      previous.permissions.forEach(function (entry) {
        if (!nextSet.has(entry.id) && core.revoke(entry.id, appId)) {
          revoked.push(entry.id);
        }
      });
    }

    if (H.AICore && H.AICore.events && typeof H.AICore.events.emit === 'function') {
      try {
        H.AICore.events.emit('permission:manifest-change', {
          appId: appId,
          action: previous ? 'manifest-replace' : 'manifest-register',
          status: revoked.length ? 'grants-revoked' : 'registered',
          resourceType: 'manifest',
          source: 'permission-policy',
          count: revoked.length
        });
      } catch (error) {
        console.warn('[HalDo v181] Manifest-Audit konnte nicht publiziert werden:', error);
      }
    }

    return Object.freeze({
      appId: result.appId,
      permissions: Object.freeze(result.permissions.slice()),
      revokedPermissions: Object.freeze(revoked.slice()),
      revokedCount: revoked.length
    });
  }

  guardedRegisterApp.__haldoV181Wrapped = true;
  core.registerApp = guardedRegisterApp;

  function getStatus() {
    var permissionStatus = core.getStatus();
    return {
      version: VERSION,
      permissionCoreVersion: core.version,
      manifestCount: permissionStatus.manifestCount,
      activeSessionGrants: permissionStatus.sessionGrantCount,
      persistentGrants: permissionStatus.persistentGrants,
      revokeRemovedManifestGrants: true,
      browserPermissionStatusSeparate: permissionStatus.browserPermissionStatusSeparate,
      authenticationAvailable: false,
      serverIdentityAvailable: false,
      roleBasedAccessAvailable: false,
      appSandboxAvailable: false
    };
  }

  H.PermissionPolicy = Object.freeze({
    version: VERSION,
    getStatus: getStatus
  });
  H.Master = H.Master || {};
  H.Master.permissionPolicyVersion = VERSION;

  if (H.AICore && typeof originalGetStatus === 'function' && !originalGetStatus.__v181Wrapped) {
    var wrappedStatus = function () {
      var status = originalGetStatus.call(H.AICore);
      status.permissionPolicyVersion = VERSION;
      return status;
    };
    wrappedStatus.__v181Wrapped = true;
    H.AICore.getStatus = wrappedStatus;
  }

  console.info('[HalDo v181] Permission Manifest Lifecycle Policy bereit.', getStatus());
})(window);
