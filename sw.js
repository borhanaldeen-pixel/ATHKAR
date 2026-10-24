/* خدمة العمل دون إنترنت - غيّر رقم VERSION عند أي تعديل على الملفات ليصل التحديث للمستخدمين */
const VERSION = 'adhkar-pwa-v1';
const CACHE = VERSION;
const PRECACHE = [
  "./assets/fontawesome/css/all.min.css",
  "./assets/fontawesome/webfonts/fa-regular-400.woff2",
  "./assets/fontawesome/webfonts/fa-solid-900.woff2",
  "./assets/fonts/almarai-arabic-400-normal.woff2",
  "./assets/fonts/almarai-arabic-700-normal.woff2",
  "./assets/fonts/almarai-arabic-800-normal.woff2",
  "./assets/fonts/almarai-latin-400-normal.woff2",
  "./assets/fonts/almarai-latin-700-normal.woff2",
  "./assets/fonts/almarai-latin-800-normal.woff2",
  "./assets/fonts/amiri-arabic-400-normal.woff2",
  "./assets/fonts/amiri-arabic-700-normal.woff2",
  "./assets/fonts/amiri-latin-400-normal.woff2",
  "./assets/fonts/amiri-latin-700-normal.woff2",
  "./assets/fonts/cairo-arabic-wght-normal.woff2",
  "./assets/fonts/cairo-latin-wght-normal.woff2",
  "./assets/fonts/fonts.css",
  "./assets/fonts/noto-naskh-arabic-arabic-wght-normal.woff2",
  "./assets/fonts/noto-naskh-arabic-latin-wght-normal.woff2",
  "./assets/fonts/readex-pro-arabic-wght-normal.woff2",
  "./assets/fonts/readex-pro-latin-wght-normal.woff2",
  "./assets/fonts/tajawal-arabic-400-normal.woff2",
  "./assets/fonts/tajawal-arabic-500-normal.woff2",
  "./assets/fonts/tajawal-arabic-700-normal.woff2",
  "./assets/fonts/tajawal-arabic-800-normal.woff2",
  "./assets/fonts/tajawal-arabic-900-normal.woff2",
  "./assets/fonts/tajawal-latin-400-normal.woff2",
  "./assets/fonts/tajawal-latin-500-normal.woff2",
  "./assets/fonts/tajawal-latin-700-normal.woff2",
  "./assets/fonts/tajawal-latin-800-normal.woff2",
  "./assets/fonts/tajawal-latin-900-normal.woff2",
  "./assets/tailwind.css",
  "./favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // الصوت (everyayah) وغيره يمر مباشرة عبر الشبكة

  // فتح التطبيق: من الذاكرة فوراً مع تحديث الصفحة بالخلفية
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('./index.html', { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        const p = new URL(res.url).pathname;
        if (res.ok && (p.endsWith('/') || p.endsWith('/index.html'))) cache.put('./index.html', res.clone());
        return res;
      }).catch(() => null);
      return cached || (await network) || Response.error();
    })());
    return;
  }

  // باقي الملفات: الذاكرة أولاً ثم الشبكة
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
