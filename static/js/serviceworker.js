const CACHE_NAME = "ai-assistant-v1";
const OFFLINE_URL = "/offline/";

// Assets to cache for offline use
const ASSETS = [
    "/",
    "/static/css/style.css",
    "/static/js/main.js",
    "/static/images/icon-192x192.png",
];

// Install: cache core assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: serve from cache, fallback to network, then offline page
self.addEventListener("fetch", (event) => {
    // Skip non-GET requests and API calls
    if (event.request.method !== "GET" || event.request.url.includes("/api/")) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // Network failed: try cache, then offline page
                return caches.match(event.request).then((cached) => {
                    return cached || caches.match(OFFLINE_URL);
                });
            })
    );
});