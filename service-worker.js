// 🔥 Automatisk versionshantering – höj version vid varje deploy
const CACHE_NAME = "quiz-cache-v45";

// Filer som ska finnas offline för själva quizet
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./quizzes.js",
  "./manifest.json",
  "./icon-192-v5.png",
  "./icon-512-v5.png"
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
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
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
  const req = event.request;
  const url = new URL(req.url);

  // Hoppa över annat än GET
  if (req.method !== "GET") return;

  // Låt Firestore/Firebase/API-anrop gå direkt mot nätet
  if (
    url.origin.includes("googleapis.com") ||
    url.origin.includes("gstatic.com") ||
    url.origin.includes("firebaseapp.com")
  ) {
    return;
  }

  // HTML/navigation: network first, fallback till cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put("./index.html", copy);
          });
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // App shell-filer: cache first, fallback till nät
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, copy);
        });
        return response;
      });
    })
  );
});