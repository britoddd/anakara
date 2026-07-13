import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/* Konfigurasi diambil dari .env.local (lihat .env.example).
   Nilai NEXT_PUBLIC_* memang publik oleh desain Firebase — keamanan data
   diatur lewat Security Rules, bukan kerahasiaan config ini. */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** true kalau .env.local sudah diisi — UI pakai ini untuk menampilkan
    petunjuk setup alih-alih crash saat config masih kosong. */
export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey);

export function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig) {
    throw new Error(
      "Konfigurasi Firebase belum diisi. Salin .env.example → .env.local lalu isi NEXT_PUBLIC_FIREBASE_* dari Firebase Console (Project settings → Your apps)."
    );
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/* Firestore dengan cache persisten (IndexedDB) — fondasi mode offline:
   - baca profil & data tetap jalan tanpa internet (dari cache perangkat);
   - tulis (poin, progres, dsb.) diantre lokal & otomatis sinkron saat online.
   initializeFirestore HANYA boleh dipanggil sekali per app → hasilnya di-cache.
   persistentMultipleTabManager: aman kalau anak buka beberapa tab. Kalau
   IndexedDB tak tersedia (mode privat/HP lama), jatuh ke Firestore in-memory
   biasa supaya app tidak crash. */
let dbCache: Firestore | null = null;
export function getDb(): Firestore {
  if (dbCache) return dbCache;
  try {
    dbCache = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // sudah terinisialisasi di tempat lain, atau IndexedDB gagal → default
    dbCache = initializeFirestore(getFirebaseApp(), {});
  }
  return dbCache;
}

/* getRtdb() (Realtime Database, khusus Battle) ada di lib/firebase-rtdb.ts —
   sengaja dipisah supaya firebase/database (~40 kB) hanya ter-bundle di
   halaman battle, bukan di semua halaman (internet sekolah lambat). */
