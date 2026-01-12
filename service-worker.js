self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("quiz-cache").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./manifest.json"
      ])
    )
  );
});

/* ✅ LÄGG TILL DETTA BLOCK – EXAKT HÄR */
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
