// 🔥 Automatisk versionshantering – ny version vid varje deploy
const CACHE_NAME = "quiz-cache-v2";

// 📩 Ta emot meddelande från appen om att hoppa över vänteläge
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 📦 Installera ny service worker och cacha grundfiler
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./manifest.json"
      ])
    )
  );
});

// ♻️ Aktivera ny version och rensa gamla cache-filer
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// 🌐 Cache-first-strategi (snabb app, fallback till nätet)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

