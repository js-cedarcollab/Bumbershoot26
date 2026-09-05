/**
 * Offline support that doesn't hide fresh code.
 *
 * The first version of this was cache-first, which meant every refresh served
 * yesterday's files while quietly downloading today's — you always saw a change
 * one refresh late. Now the network gets first refusal, with a short timeout so
 * a dead signal on the festival grounds falls back to the cache quickly rather
 * than hanging. Bump CACHE when the asset list changes.
 */
const CACHE = "bumbershoot2026-v10";

/** How long to wait for the network before serving what we already have. */
const NETWORK_TIMEOUT = 2500;

const ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/data.js",
  "./js/schedule.js",
  "./js/share.js",
  "./js/recs.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromNetwork(request) {
  // "no-cache" still lets the server answer 304, but stops the browser's own
  // HTTP cache from handing back a stale copy without asking — GitHub Pages
  // serves assets with a ten-minute max-age, which would otherwise mean a code
  // change you just pushed stays invisible for ten minutes.
  let attempt;
  try {
    attempt = fetch(request, { cache: "no-cache" });
  } catch (err) {
    attempt = fetch(request);
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("network timeout")), NETWORK_TIMEOUT);
    attempt.then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function fromCache(request) {
  return caches.match(request).then((hit) => hit || caches.match("./index.html"));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Fonts and anything else off-origin barely change: cache is fine, and first.
  if (new URL(request.url).origin !== location.origin) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
    return;
  }

  event.respondWith(
    fromNetwork(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => fromCache(request))
  );
});
