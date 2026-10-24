// THE PHONE KEEPS ITS PAGE: this page's own files, opened from here at once, every time, and refreshed quietly from its address when
// that answers well. What it keeps is only this page; everything of yours comes from your Mac by key, never here.
const C = "taldo-phone", FILES = ["./", "taldo_phone.js", "taldo_phone_bg.wasm", "touch-icon.png"].map((f) => new URL(f, self.registration.scope).pathname);
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(C).then((c) => c.addAll(FILES))); });
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin) return;
  const key = req.mode === "navigate" ? FILES[0] : u.pathname;
  if (!FILES.includes(key)) return;
  e.respondWith((async () => {
    const cache = await caches.open(C), kept = await cache.match(key);
    const fresh = fetch(req).then((r) => { if (r.ok) cache.put(key, r.clone()); return r; });
    // offline is normal on a phone: the kept page is the page, and a refresh that cannot reach its address waits for the next open
    if (kept) { e.waitUntil(fresh.catch(() => null)); return kept; }
    return fresh;
  })());
});
// SOMETHING WAITS ON YOU: Taldo's push carries nothing — only that something new waits; tapping it opens Taldo on what waits
self.addEventListener("push", (e) => e.waitUntil(self.registration.showNotification("Taldo", { body: "Something new waits on you", tag: "taldo-waits", icon: "touch-icon.png" })));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (open[0]) return open[0].focus();
    return self.clients.openWindow(self.registration.scope);
  })());
});
