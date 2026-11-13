const CACHE_NAME = "gpa-hymns-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const pageResponse = await fetch("/", { cache: "reload" });
      if (!pageResponse.ok) {
        throw new Error(`Could not cache the hymn library (${pageResponse.status}).`);
      }

      const pageHtml = await pageResponse.clone().text();
      await cache.put("/", pageResponse);
      await cache.addAll([
        "/images/GPALogo.png",
        "/android-chrome-192x192.png",
        "/android-chrome-512x512.png",
        "/manifest.webmanifest",
      ]);

      const staticAssets = [
        ...pageHtml.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g),
      ].map((match) => new URL(match[1].replace(/&amp;/g, "&"), self.location.origin));

      await Promise.all(
        [...new Set(staticAssets.map((asset) => asset.href))].map(async (assetUrl) => {
          const assetResponse = await fetch(assetUrl, { cache: "reload" });
          if (!assetResponse.ok) {
            throw new Error(`Could not cache app asset ${assetUrl} (${assetResponse.status}).`);
          }
          await cache.put(assetUrl, assetResponse);
        }),
      );
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("gpa-hymns-") && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (
    request.method !== "GET" ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname === "/sw.js" ||
    requestUrl.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1"
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
            if (requestUrl.pathname === "/") {
              await cache.put("/", response.clone());
            }
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(request)) || (await cache.match("/"));
        }),
    );
    return;
  }

  const isAppAsset =
    requestUrl.pathname.startsWith("/_next/static/") ||
    requestUrl.pathname === "/images/GPALogo.png";

  if (isAppAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      }),
    );
  }
});