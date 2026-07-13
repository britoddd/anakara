"use client";

import Button from "./Button";
import Modal from "./Modal";

/* Konfirmasi main ulang level yang SUDAH pernah diselesaikan. Muncul saat anak
   memilih level yang sudah beres di layar pilih level (Kuis & Isi Piringku),
   mencegah mengulang tak sengaja. Mengulang TIDAK menghapus bintang/poin
   terbaik, jadi aksi "Main Lagi" boleh jadi tombol utama — beda dari
   DialogKeluar yang aksinya destruktif (di sana "batal" yang jadi utama).
   Bagian dialognya diekspor terpisah supaya bisa dipakai galeri /dev/komponen. */

interface DialogUlangLevelProps {
  terbuka: boolean;
  /** nama level yang mau diulang, mis. "Level 3" atau "Level 3 · Piring Warna" */
  namaLevel: string;
  onBatal: () => void;
  onUlang: () => void;
}

export default function DialogUlangLevel({
  terbuka,
  namaLevel,
  onBatal,
  onUlang,
}: DialogUlangLevelProps) {
  return (
    <Modal open={terbuka} onClose={onBatal} title="Main lagi level ini?">
      <p className="font-bold mb-2">
        Kamu sudah menyelesaikan{" "}
        <span className="text-primary">{namaLevel}</span>. Mau memainkannya lagi?
      </p>
      <p className="text-muted font-bold text-sm mb-6">
        Tenang, bintang dan poin terbaikmu tidak akan hilang.
      </p>
      <div className="flex flex-col sm:flex-row-reverse gap-3">
        <Button fullWidth variant="accent" onClick={onUlang}>
          🔁 Ya, Main Lagi
        </Button>
        <Button fullWidth variant="ghost" onClick={onBatal}>
          Batal
        </Button>
      </div>
    </Modal>
  );
}
