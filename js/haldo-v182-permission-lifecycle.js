/* ================================================================
   HALDO AI OS PRO MAX — v182 Permission Request Lifecycle
   Manifest shrinkage cancels open/in-flight HalDo consent requests.
   Browser-origin permissions remain separately managed by the browser.
   ================================================================ */
(function (window) {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var VERSION = '182.0.0';
  var core = H.PermissionCore;
  var policy = H.PermissionPolicy;

  if (!core || core.version !== '179.0.0' ||
      typeof core.registerApp !== 'function' ||
      typeof core.cancelPending !== 'function' ||
      !policy || policy.version !== '181.0.0') {
    console.error('[HalDo v182] v179 Permission Core and v181 Permission Policy are required.');
    return;
  }
  if (H.PermissionLifecyclePolicy && H.PermissionLifecyclePolicy.version === VERSION) return;

  var originalRegisterApp = core.registerApp;

  function guardedRegisterApp(appId, permissions) {
    // Keep the v179 validator/v181 active-grant revocation authoritative.
    // Invalid input must throw before pending dialogs are cancelled.
    var previous = core.listApps().find(function (item) { return item.id === appId; });
    var result = originalRegisterApp.call(core, appId, permissions);
    var nextSet = new Set(result.permissions);
    var cancelled = [];

    if (previous) {
      previous.permissions.forEach(function (entry) {
        if (!nextSet.has(entry.id) && core.cancelPending(entry.id, appId)) {
          cancelled.push(entry.id);
        }
      });
    }

    return Object.freeze({
      appId: result.appId,
      permissions: result.permissions,
      revokedPermissions: result.revokedPermissions || Object.freeze([]),
      revokedCount: result.revokedCount || 0,
      cancelledPendingPermissions: Object.freeze(cancelled.slice()),
      cancelledPendingCount: cancelled.length
    });
  }

  guardedRegisterApp.__haldoV182Wrapped = true;
  core.registerApp = guardedRegisterApp;

  function getStatus() {
    var current = policy.getStatus();
    return {
      version: VERSION,
      permissionPolicyVersion: current.version,
      pendingRequestCancellation: true,
      pendingRequestCount: core.getStatus().pendingRequestCount,
      browserOriginPermissionRevocationAvailable: false
    };
  }

  H.PermissionLifecyclePolicy = Object.freeze({
    version: VERSION,
    getStatus: getStatus
  });

  H.Master = H.Master || {};
  H.Master.permissionLifecycleVersion = VERSION;

  if (H.AICore && typeof H.AICore.getStatus === 'function' &&
      !H.AICore.getStatus.__v182Wrapped) {
    var originalGetStatus = H.AICore.getStatus;
    var wrappedStatus = function () {
      var status = originalGetStatus.call(H.AICore);
      status.permissionLifecycleVersion = VERSION;
      status.pendingPermissionRequests = core.getStatus().pendingRequestCount;
      return status;
    };
    wrappedStatus.__v182Wrapped = true;
    H.AICore.getStatus = wrappedStatus;
  }

  console.info('[HalDo v182] Permission Request Lifecycle bereit.', getStatus());
})(window);
