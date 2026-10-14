/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — STORAGE LAYER (v150)
   Namespaces · App-Storage · Cache
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Storage = (function(){
  "use strict";

  var PREFIX = "haldo_v150_";
  var _namespaces = {};

  /* ─────────── Low-Level ─────────── */
  function rawKey(ns, key){ return PREFIX + ns + "::" + key; }

  function _get(ns, key, fallback){
    try {
      var raw = localStorage.getItem(rawKey(ns, key));
      if(raw === null) return fallback;
      return JSON.parse(raw);
    } catch(e){ return fallback; }
  }
  function _set(ns, key, value){
    try {
      localStorage.setItem(rawKey(ns, key), JSON.stringify(value));
      return true;
    } catch(e){
      if(window.HalDo && HalDo.Kernel) HalDo.Kernel.log("Storage voll: " + ns + "/" + key, "warn");
      return false;
    }
  }
  function _remove(ns, key){
    try { localStorage.removeItem(rawKey(ns, key)); return true; }
    catch(e){ return false; }
  }
  function _keys(ns){
    var out = [];
    var pre = PREFIX + ns + "::";
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf(pre) === 0){
        out.push(k.substring(pre.length));
      }
    }
    return out;
  }
  function _clearNs(ns){
    var keys = _keys(ns);
    keys.forEach(function(k){ _remove(ns, k); });
    return keys.length;
  }

  /* ─────────── Namespace-Factory ─────────── */
  function namespace(ns){
    if(_namespaces[ns]) return _namespaces[ns];
    var api = {
      name: ns,
      get: function(key, fallback){ return _get(ns, key, fallback); },
      set: function(key, value){ return _set(ns, key, value); },
      remove: function(key){ return _remove(ns, key); },
      keys: function(){ return _keys(ns); },
      clear: function(){ return _clearNs(ns); },
      has: function(key){ return _get(ns, key, undefined) !== undefined; },
      size: function(){
        var s = 0;
        _keys(ns).forEach(function(k){
          try { s += (localStorage.getItem(rawKey(ns, k)) || "").length; } catch(e){}
        });
        return s;
      },
      /* JSON-Helfer */
      update: function(key, patch){
        var cur = _get(ns, key, {});
        var merged = Object.assign({}, cur, patch);
        _set(ns, key, merged);
        return merged;
      },
      push: function(key, item){
        var arr = _get(ns, key, []);
        arr.push(item);
        _set(ns, key, arr);
        return arr;
      }
    };
    _namespaces[ns] = api;
    return api;
  }

  /* ─────────── Globale Helfer ─────────── */
  function clearAll(){
    var count = 0;
    for(var i = localStorage.length - 1; i >= 0; i--){
      var k = localStorage.key(i);
      if(k && k.indexOf(PREFIX) === 0){
        localStorage.removeItem(k);
        count++;
      }
    }
    _namespaces = {};
    return count;
  }

  function getAllNamespaces(){
    var nsSet = {};
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf(PREFIX) === 0){
        var rest = k.substring(PREFIX.length);
        var idx = rest.indexOf("::");
        if(idx > 0) nsSet[rest.substring(0, idx)] = true;
      }
    }
    return Object.keys(nsSet);
  }

  function getTotalSize(){
    var total = 0;
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf(PREFIX) === 0){
        try { total += (localStorage.getItem(k) || "").length; } catch(e){}
      }
    }
    return total;
  }

  function exportNamespace(ns){
    var out = {};
    _keys(ns).forEach(function(k){ out[k] = _get(ns, k, null); });
    return out;
  }

  function importNamespace(ns, data){
    if(!data || typeof data !== "object") return false;
    Object.keys(data).forEach(function(k){ _set(ns, k, data[k]); });
    return true;
  }

  /* ─────────── Öffentliche API ─────────── */
  return {
    ns: namespace,
    clearAll: clearAll,
    namespaces: getAllNamespaces,
    totalSize: getTotalSize,
    exportNamespace: exportNamespace,
    importNamespace: importNamespace,
    PREFIX: PREFIX
  };
})();

/* Bequeme Aliase für Apps */
window.HalDo.Store = function(ns){ return window.HalDo.Storage.ns(ns); };

console.log("🦚 storage.js geladen");
