import { describe, it, expect } from "vitest";
import {
  POIN_PER_LEVEL,
  NAMA_MIN,
  NAMA_MAKS,
  hitungLevel,
  poinMenujuLevelBerikut,
  rapikanNama,
  galatNama,
  buatProfilBaru,
} from "./types";

/* Logika level & profil (D10: 150 ⭐/level). Ini menentukan berapa poin & level
   yang tampil ke anak — regresi di sini = angka salah di layar sekolah. */

describe("hitungLevel", () => {
  it("mulai dari level 1 pada 0 poin", () => {
    expect(hitungLevel(0)).toBe(1);
  });

  it("naik tepat di kelipatan POIN_PER_LEVEL, bukan sebelum", () => {
    expect(hitungLevel(POIN_PER_LEVEL - 1)).toBe(1);
    expect(hitungLevel(POIN_PER_LEVEL)).toBe(2);
    expect(hitungLevel(POIN_PER_LEVEL * 2 - 1)).toBe(2);
    expect(hitungLevel(POIN_PER_LEVEL * 2)).toBe(3);
  });

  it("poin negatif diperlakukan sebagai 0 (level 1), tak pernah < 1", () => {
    expect(hitungLevel(-5)).toBe(1);
    expect(hitungLevel(-9999)).toBe(1);
  });
});

describe("poinMenujuLevelBerikut", () => {
  it("butuh satu level penuh saat baru mulai / tepat naik level", () => {
    expect(poinMenujuLevelBerikut(0)).toBe(POIN_PER_LEVEL);
    expect(poinMenujuLevelBerikut(POIN_PER_LEVEL)).toBe(POIN_PER_LEVEL);
  });

  it("berkurang seiring poin dalam satu level", () => {
    expect(poinMenujuLevelBerikut(1)).toBe(POIN_PER_LEVEL - 1);
    expect(poinMenujuLevelBerikut(POIN_PER_LEVEL - 1)).toBe(1);
  });

  it("selalu di rentang 1..POIN_PER_LEVEL (tak pernah 0)", () => {
    for (let p = 0; p <= POIN_PER_LEVEL * 3; p++) {
      const sisa = poinMenujuLevelBerikut(p);
      expect(sisa).toBeGreaterThanOrEqual(1);
      expect(sisa).toBeLessThanOrEqual(POIN_PER_LEVEL);
    }
  });

  it("konsisten dengan hitungLevel: poin + sisa selalu mendarat di awal level berikutnya", () => {
    for (const p of [0, 1, 75, 149, 150, 151, 449]) {
      expect(hitungLevel(p + poinMenujuLevelBerikut(p))).toBe(hitungLevel(p) + 1);
    }
  });
});

describe("rapikanNama", () => {
  it("menyatukan spasi rangkap & memangkas tepi", () => {
    expect(rapikanNama("  Budi   Kecil  ")).toBe("Budi Kecil");
    expect(rapikanNama("Ani")).toBe("Ani");
  });
});

describe("galatNama", () => {
  it("menerima nama huruf/angka/spasi yang wajar", () => {
    expect(galatNama("Budi")).toBeNull();
    expect(galatNama("Ani 2")).toBeNull();
    expect(galatNama("Zoë")).toBeNull(); // huruf unicode diterima
  });

  it("menolak terlalu pendek (setelah dirapikan)", () => {
    expect(galatNama("")).toContain(`${NAMA_MIN}`);
    expect(galatNama("a")).toContain(`${NAMA_MIN}`);
    expect(galatNama("   x   ")).toContain(`${NAMA_MIN}`);
  });

  it("menolak terlalu panjang", () => {
    expect(galatNama("a".repeat(NAMA_MAKS + 1))).toContain(`${NAMA_MAKS}`);
  });

  it("menolak simbol", () => {
    expect(galatNama("Budi@")).not.toBeNull();
    expect(galatNama("<script>")).not.toBeNull();
    expect(galatNama("emoji 🐆")).not.toBeNull();
  });
});

describe("buatProfilBaru", () => {
  it("menghasilkan profil awal yang bersih & konsisten kontrak §6", () => {
    const p = buatProfilBaru("uid-1", "siswa", "Budi");
    expect(p).toMatchObject({
      userId: "uid-1",
      role: "siswa",
      nama: "Budi",
      avatar: null,
      level: 1,
      poin: 0,
      kelasId: null,
      koleksi: [],
    });
    expect(p.progress.kuis.levelTerbuka).toBe(1);
    expect(p.progress.cerita.babTerbuka).toBe(1);
    expect(p.progress.isiPiringku.levelTerbuka).toBe(1);
    // level awal harus konsisten dengan hitungLevel(poin)
    expect(p.level).toBe(hitungLevel(p.poin));
  });
});
