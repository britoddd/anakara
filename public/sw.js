/* Service Worker Anakara — fondasi PWA offline.
   Strategi (tanpa dependency, cocok Next.js App Router):
   - build assets /_next/static/* + gambar + font → cache-first (nama ber-hash,
     jadi aman disimpan selamanya);
   - navigasi halaman → network-first, jatuh ke cache, lalu /offline.html;
   - payload RSC & GET same-origin lain → stale-while-revalidate;
   - video (.mp4/.webm) → "cache setelah ditonton": online streaming normal,
     salinan penuh diunduh sekali di latar untuk diputar ulang saat offline.
   Firebase (Auth/Firestore/RTDB) TIDAK di-cache SW — offline-nya ditangani
   Firestore persistence di sisi app.

   Naikkan VERSI saat mengubah strategi → cache lama otomatis dibuang. */

const VERSI = "anakara-v1";
const CACHE_STATIS = `${VERSI}-statis`;
const CACHE_HALAMAN = `${VERSI}-halaman`;
const CACHE_VIDEO = `${VERSI}-video`;
const FALLBACK = "/offline.html";

/* Di-precache saat install supaya fallback offline selalu tersedia. Sengaja
   minimal; sisanya (chunk, gambar) mengisi cache saat pertama dipakai online. */
const PRECACHE = [
  FALLBACK,
  "/assets/logo.png",
  "/assets/mascot/tayo-hello.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIS)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !k.startsWith(VERSI)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* --------- pembantu video: unduh sekali, potong Range dari cache --------- */

const videoSedangDiunduh = new Set();

function simpanVideoLatar(url) {
  if (videoSedangDiunduh.has(url)) return;
  videoSedangDiunduh.add(url);
  fetch(url)
    .then((res) => {
      if (res.ok && res.status === 200) {
        return caches.open(CACHE_VIDEO).then((c) => c.put(url, res.clone()));
      }
    })
    .catch(() => {})
    .finally(() => videoSedangDiunduh.delete(url));
}

async function responRangeDariCache(fullRes, rangeHeader) {
  const buf = await fullRes.clone().arrayBuffer();
  const total = buf.byteLength;
  const cocok = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  let mulai = cocok && cocok[1] ? parseInt(cocok[1], 10) : 0;
  let akhir = cocok && cocok[2] ? parseInt(cocok[2], 10) : total - 1;
  if (isNaN(mulai)) mulai = 0;
  if (isNaN(akhir) || akhir >= total) akhir = total - 1;
  const potongan = buf.slice(mulai, akhir + 1);
  return new Response(potongan, {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Range": `bytes ${mulai}-${akhir}/${total}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(potongan.byteLength),
      "Content-Type": fullRes.headers.get("Content-Type") || "video/mp4",
    },
  });
}

async function tanganiVideo(request) {
  const url = request.url;
  const cache = await caches.open(CACHE_VIDEO);
  const cached = await cache.match(url);
  const range = request.headers.get("range");

  if (cached) {
    return range ? responRangeDariCache(cached, range) : cached.clone();
  }
  // belum di-cache → streaming normal dari jaringan, salin penuh di latar
  simpanVideoLatar(url);
  try {
    return await fetch(request);
  } catch {
    return new Response("", { status: 504, statusText: "Video butuh internet" });
  }
}

/* ------------------------------- fetch ------------------------------- */

function cacheDuluDenganPerbarui(request, namaCache) {
  return caches.match(request).then((cached) => {
    const jaringan = fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const salin = res.clone();
          caches.open(namaCache).then((c) => c.put(request, salin));
        }
        return res;
      })
      .catch(() => cached);
    return cached || jaringan;
  });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_HALAMAN).then((cache) =>
    cache.match(request).then((cached) => {
      const jaringan = fetch(request)
        .then((res) => {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || jaringan;
    })
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.host);

  // biarkan lintas-origin non-font (Firebase, dll.) ke jaringan apa adanya
  if (!sameOrigin && !isFont) return;

  // video → cache setelah ditonton
  if (sameOrigin && /\.(mp4|webm|m4v|ogg)$/i.test(url.pathname)) {
    event.respondWith(tanganiVideo(request));
    return;
  }

  // navigasi halaman → network-first, fallback cache lalu halaman offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const salin = res.clone();
          caches.open(CACHE_HALAMAN).then((c) => c.put(request, salin));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((r) => r || caches.match(FALLBACK))
            .then((r) => r || new Response("Offline", { status: 503 }))
        )
    );
    return;
  }

  // aset build & font → cache-first (immutable, ber-hash)
  const asetStatis =
    isFont ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(png|jpe?g|svg|webp|gif|ico|woff2?)$/i.test(url.pathname);
  if (asetStatis) {
    event.respondWith(cacheDuluDenganPerbarui(request, CACHE_STATIS));
    return;
  }

  // sisanya same-origin (payload RSC, _next/data, dsb.) → SWR
  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
