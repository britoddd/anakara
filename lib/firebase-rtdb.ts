import { getDatabase, type Database } from "firebase/database";
import { getFirebaseApp } from "./firebase";

/* Realtime Database — khusus Battle 2v2 (Phase 6). Dipisah dari lib/firebase.ts
   supaya firebase/database hanya ter-bundle di halaman battle (hemat ~40 kB
   First Load JS di semua halaman lain — internet sekolah lambat).
   URL wajib diisi karena region database (mis. asia-southeast1) tidak bisa
   ditebak dari projectId. */
export function getRtdb(): Database {
  const url = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_DATABASE_URL belum diisi di .env.local. Buka Firebase Console → Realtime Database → salin URL database (https://…firebasedatabase.app)."
    );
  }
  return getDatabase(getFirebaseApp(), url);
}
