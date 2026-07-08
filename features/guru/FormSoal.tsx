"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { SoalGuru, SoalGuruInput } from "./api";

/* Form Buat/Edit Soal (Phase 10) — skema identik soal siswa (§6) supaya
   langsung terpakai di Kuis. Presentasional: penyimpanan lewat onSimpan. */

export const KATEGORI_SOAL = [
  { id: "gizi", label: "Gizi" },
  { id: "makanan-sehat", label: "Makanan Sehat" },
  { id: "kebiasaan-baik", label: "Kebiasaan Baik" },
  { id: "olahraga", label: "Olahraga" },
];

const KELAS_INPUT =
  "w-full bg-surface border-2 border-border rounded-md px-3 py-2.5 font-bold text-fg focus:border-primary outline-none";

interface FormSoalProps {
  /** soal yang diedit; kosongkan untuk buat baru */
  awal?: SoalGuru;
  sibuk: boolean;
  onSimpan: (input: SoalGuruInput) => void;
  onBatal: () => void;
}

export default function FormSoal({ awal, sibuk, onSimpan, onBatal }: FormSoalProps) {
  const [pertanyaan, setPertanyaan] = useState(awal?.pertanyaan ?? "");
  const [opsi, setOpsi] = useState<string[]>(awal?.opsi ?? ["", "", "", ""]);
  const [opsiEmoji, setOpsiEmoji] = useState<string[]>(
    awal?.opsiEmoji ?? ["", "", "", ""]
  );
  const [kunciIndex, setKunciIndex] = useState(awal?.kunciIndex ?? 0);
  const [level, setLevel] = useState(awal?.level ?? 1);
  const [kategori, setKategori] = useState(awal?.kategori ?? "gizi");
  const [durasiDetik, setDurasiDetik] = useState(awal?.durasiDetik ?? 15);
  const [galat, setGalat] = useState<string | null>(null);

  function ubahOpsi(i: number, nilai: string) {
    setOpsi((o) => o.map((x, j) => (j === i ? nilai : x)));
  }
  function ubahEmoji(i: number, nilai: string) {
    setOpsiEmoji((o) => o.map((x, j) => (j === i ? nilai : x)));
  }

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat(null);
    if (pertanyaan.trim().length < 5) {
      setGalat("Pertanyaan masih terlalu pendek.");
      return;
    }
    if (opsi.some((o) => o.trim() === "")) {
      setGalat("Keempat pilihan jawaban harus diisi.");
      return;
    }
    const adaEmoji = opsiEmoji.some((e2) => e2.trim() !== "");
    onSimpan({
      pertanyaan,
      opsi,
      // emoji opsional (form guru boleh tanpa, sesuai kontrak §6)
      ...(adaEmoji ? { opsiEmoji: opsiEmoji.map((e2) => e2.trim() || "▫️") } : {}),
      kunciIndex,
      level,
      kategori,
      durasiDetik,
    });
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-4 text-left">
      <div>
        <label htmlFor="soal-pertanyaan" className="font-bold block mb-1">
          Pertanyaan
        </label>
        <textarea
          id="soal-pertanyaan"
          value={pertanyaan}
          onChange={(e) => setPertanyaan(e.target.value)}
          rows={2}
          maxLength={160}
          placeholder="Contoh: Minuman apa yang paling sehat setelah berolahraga?"
          className={KELAS_INPUT}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-bold mb-1">
          Pilihan jawaban — tandai yang benar
        </legend>
        {opsi.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="kunci"
              id={`kunci-${i}`}
              checked={kunciIndex === i}
              onChange={() => setKunciIndex(i)}
              aria-label={`Jadikan pilihan ${i + 1} jawaban benar`}
              className="w-5 h-5 accent-[var(--success)] shrink-0"
            />
            <input
              value={o}
              onChange={(e) => ubahOpsi(i, e.target.value)}
              maxLength={60}
              placeholder={`Pilihan ${i + 1}`}
              aria-label={`Teks pilihan ${i + 1}`}
              className={KELAS_INPUT}
            />
            <input
              value={opsiEmoji[i]}
              onChange={(e) => ubahEmoji(i, e.target.value)}
              maxLength={4}
              placeholder="🙂"
              aria-label={`Emoji pilihan ${i + 1} (opsional)`}
              className={`${KELAS_INPUT} !w-16 text-center`}
            />
          </div>
        ))}
        <p className="text-xs font-bold text-muted">
          Kolom kecil = emoji (opsional). Jawaban benar: pilihan{" "}
          {kunciIndex + 1} ✓
        </p>
      </fieldset>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="soal-level" className="font-bold block mb-1">
            Level
          </label>
          <select
            id="soal-level"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className={KELAS_INPUT}
          >
            {[1, 2, 3].map((lv) => (
              <option key={lv} value={lv}>
                Level {lv}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="soal-kategori" className="font-bold block mb-1">
            Kategori
          </label>
          <select
            id="soal-kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className={KELAS_INPUT}
          >
            {KATEGORI_SOAL.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="soal-durasi" className="font-bold block mb-1">
            Waktu
          </label>
          <select
            id="soal-durasi"
            value={durasiDetik}
            onChange={(e) => setDurasiDetik(Number(e.target.value))}
            className={KELAS_INPUT}
          >
            {[10, 15, 20].map((d) => (
              <option key={d} value={d}>
                {d} detik
              </option>
            ))}
          </select>
        </div>
      </div>

      {galat && (
        <p role="alert" className="text-danger font-bold">
          ⚠️ {galat}
        </p>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onBatal} disabled={sibuk}>
          Batal
        </Button>
        <Button type="submit" disabled={sibuk}>
          {sibuk ? "Menyimpan…" : awal ? "Simpan Perubahan" : "Tambah Soal"}
        </Button>
      </div>
    </form>
  );
}
