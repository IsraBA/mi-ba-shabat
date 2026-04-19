// Service worker for מי בא שבת — push notifications + PWA install support

// Activate immediately on install
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Claim all clients on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      dir: "rtl",
      lang: "he",
      tag: data.tag || "mi-ba-shabat",
      data: { url: data.url || "/" },
    })
  );
});

// Handle notification click — open/focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});

// Basic fetch handler — network first, no complex caching
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
