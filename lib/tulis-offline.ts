/* Bantuan tulis Firestore yang sadar-offline (pasangan persistentLocalCache
   di lib/firebase.ts). Masalahnya: saat offline, Promise dari updateDoc/setDoc
   TIDAK resolve sampai koneksi kembali (menunggu ack server). Kalau kita
   `await`, layar hasil game bakal menggantung selamanya di "menyimpan…".

   Solusi: mutasi sudah masuk cache lokal SEKETIKA (persistence) lalu disinkron
   otomatis. Jadi saat offline kita cukup men-trigger tulisannya tanpa menunggu
   ack server — poin/progres tetap tersimpan di perangkat dan naik saat online. */

export function sedangOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Jalankan sebuah tulisan Firestore.
 * - Online  → `await` seperti biasa (galat dilempar ke pemanggil).
 * - Offline → picu tulisannya (diantre + disinkron oleh persistence) lalu
 *   langsung kembali; galat sinkron diabaikan agar tak jadi unhandled rejection.
 */
export async function tulisSinkronNanti(
  tulis: () => Promise<unknown>
): Promise<void> {
  if (sedangOffline()) {
    void tulis().catch(() => {});
    return;
  }
  await tulis();
}
