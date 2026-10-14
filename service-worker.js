/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SERVICE WORKER (v150)
   Hintergrund-Benachrichtigungen
   ═══════════════════════════════════════════════════════════ */

var CACHE = "haldo-v150";

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(self.clients.claim());
});

/* Push-Nachrichten empfangen */
self.addEventListener("push", function(e){
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err){ data = { title:"HalDo", body:"Nachricht" }; }
  var title = data.title || "🦚 HalDo AI OS";
  var options = {
    body: data.body || "",
    icon: "logo.png",
    badge: "logo.png",
    vibrate: data.vibrate || [200,100,200],
    tag: data.tag || "haldo",
    requireInteraction: true,
    data: data
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

/* Klick auf Benachrichtigung → App öffnen */
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then(function(list){
      var url = "/HalDo/#/" + (e.notification.data && e.notification.data.app || "chat");
      for(var i = 0; i < list.length; i++){
        if(list[i].url.indexOf("/HalDo/") >= 0 && "focus" in list[i]){
          list[i].navigate(url);
          return list[i].focus();
        }
      }
      if(self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

/* Nachricht vom Haupt-Thread → Notification zeigen */
self.addEventListener("message", function(e){
  var d = e.data || {};
  if(d.type === "notify"){
    var title = d.title || "🦚 HalDo";
    var options = {
      body: d.body || "",
      icon: "logo.png",
      badge: "logo.png",
      vibrate: d.vibrate || [200,100,200],
      tag: d.tag || "haldo-" + Date.now(),
      requireInteraction: true,
      data: { app: d.app || "chat" }
    };
    self.registration.showNotification(title, options);
  }
  if(d.type === "vibrate" && self.navigator.vibrate){
    self.navigator.vibrate(d.pattern || [200,100,200]);
  }
});
