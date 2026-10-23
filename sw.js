// Офлайн-режим: страница — сначала сеть, потом кэш; библиотеки, шрифты и фото — из кэша.
const V = "ohotmin-v4";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const STATIC = /^https:\/\/(www\.gstatic\.com\/firebasejs|fonts\.googleapis\.com|fonts\.gstatic\.com|upload\.wikimedia\.org)\//;
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (r.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html")) {
      e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put("./index.html", cp)); return res; })
        .catch(() => caches.match("./index.html")));
      return;
    }
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
    return;
  }
  if (STATIC.test(r.url)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
  }
});
