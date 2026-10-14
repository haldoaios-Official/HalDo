/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — STORE (v151)
   Speicher-System · Global · App-Scoped
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  if(!window.HalDo) window.HalDo = {};

  var PREFIX = "haldo:";

  function safeGet(key, def){
    try {
      var v = localStorage.getItem(key);
      if(v === null) return def;
      return JSON.parse(v);
    } catch(e){
      return def;
    }
  }

  function safeSet(key, val){
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch(e){
      console.warn("Store.set Fehler:", e);
      return false;
    }
  }

  function safeRemove(key){
    try { localStorage.removeItem(key); return true; }
    catch(e){ return false; }
  }

  function allKeys(){
    var out = [];
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf(PREFIX) === 0){
        out.push(k.substring(PREFIX.length));
      }
    }
    return out;
  }

  /* ═══ GLOBAL STORE ═══ */
  var GlobalStore = {
    get: function(key, def){ return safeGet(PREFIX + key, def); },
    set: function(key, val){ return safeSet(PREFIX + key, val); },
    remove: function(key){ return safeRemove(PREFIX + key); },
    keys: allKeys,
    clear: function(){
      allKeys().forEach(function(k){ safeRemove(PREFIX + k); });
    },
    /* App-scoped Store */
    scope: function(appId){
      var p = PREFIX + appId + ":";
      return {
        get: function(key, def){ return safeGet(p + key, def); },
        set: function(key, val){ return safeSet(p + key, val); },
        remove: function(key){ return safeRemove(p + key); },
        keys: function(){
          var out = [];
          for(var i = 0; i < localStorage.length; i++){
            var k = localStorage.key(i);
            if(k && k.indexOf(p) === 0){
              out.push(k.substring(p.length));
            }
          }
          return out;
        },
        clear: function(){
          this.keys().forEach(function(k){ safeRemove(p + k); });
        }
      };
    }
  };

  HalDo.Store = GlobalStore;

  console.log("🦚 store.js geladen");
})();
