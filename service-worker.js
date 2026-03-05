// 🔥 Automatisk versionshantering – ny version vid varje deploy
const CACHE_NAME = "quiz-cache-v26";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",

  // Bilder / ikoner
  "./icon-192-v2.png",
  "./icon-512-v2.png",

  // Eventuella CSS-filer (du lägger till dessa senare i steg 4)
  // "./styles.css",

  // JavaScript (kommer också senare, efter utrensning)
  // "./main.js"
];
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
caches.open(CACHE_NAME).then(cache => {
  return cache.addAll(FILES_TO_CACHE);
});
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

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // HTML-förfrågningar (index.html)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Övriga filer (css, js, bilder)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

