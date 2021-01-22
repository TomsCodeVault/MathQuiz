var CACHE_NAME = "tables-v3";
var CACHED_URLS = [
  "/index.html",
  "/style.css",
  "/times-tables.js",
	"/manifest.webmanifest",
	"https://cdn.glitch.com/8402eb85-eac1-4cf9-a14f-cfa621f28395%2Ficon-192.png?v=1609534983902",
	"https://cdn.glitch.com/8402eb85-eac1-4cf9-a14f-cfa621f28395%2Ficon-512.png?v=1609534986320",
  "/images/tt-icon-120.png",
  "/images/tt-icon-152.png",
  "/images/tt-icon-180.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHED_URLS);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName && cacheName.startsWith("clock")) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function(event) {
  console.log("Fetch request for:", event.request.url);
  event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request)
		})
  );
});
