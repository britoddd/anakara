import { describe, it, expect } from "vitest";
import {
  SEMUA_SOAL,
  ATURAN,
  LEVEL_MAKS,
  LEVEL_ENDLESS,
  JUMLAH_SOAL,
  JUMLAH_SOAL_HARIAN,
  POIN_PER_BENAR,
  ENDLESS_KUIS,
  durasiSoalEndless,
  hitungBintangKuis,
  bonusBeruntun,
  tanggalHariIni,
  tanggalKemarin,
  tanggalRamah,
  levelKesulitanAnak,
  labelKesulitan,
  soalUntukLevel,
  soalUntukEndless,
  soalHarian,
} from "./config";

describe("struktur level", () => {
  it("LEVEL_ENDLESS tepat satu di atas LEVEL_MAKS", () => {
    expect(LEVEL_ENDLESS).toBe(LEVEL_MAKS + 1);
  });

  it("ATURAN punya blok untuk tiap level biasa 1..LEVEL_MAKS", () => {
    for (let lv = 1; lv <= LEVEL_MAKS; lv++) {
      expect(ATURAN[lv], `aturan level ${lv}`).toBeDefined();
      expect(ATURAN[lv].syaratLulus.minBenar).toBeGreaterThan(0);
    }
  });
});

/* Invarian data — "gerbang" yang mencegah konten tak bisa dimainkan:
   tiap level harus punya cukup soal, ambang lulus harus tercapai, kunci valid,
   id unik. Kalau data melanggar salah satunya, game bisa mengunci anak / minta
   skor mustahil. Test ini menjaga data-nya, bukan hanya kode. */
describe("invarian data soal per level", () => {
  it("tiap level biasa punya >= JUMLAH_SOAL soal", () => {
    for (let lv = 1; lv <= LEVEL_MAKS; lv++) {
      const jml = SEMUA_SOAL.filter((s) => s.level === lv).length;
      expect(jml, `soal level ${lv}`).toBeGreaterThanOrEqual(JUMLAH_SOAL);
    }
  });

  it("ambang lulus tiap level bisa dicapai dalam JUMLAH_SOAL soal", () => {
    for (let lv = 1; lv <= LEVEL_MAKS; lv++) {
      expect(ATURAN[lv].syaratLulus.minBenar).toBeLessThanOrEqual(JUMLAH_SOAL);
    }
  });

  it("tiap soal punya kunciIndex valid & minimal 2 opsi", () => {
    for (const s of SEMUA_SOAL) {
      expect(s.opsi.length, `opsi ${s.id}`).toBeGreaterThanOrEqual(2);
      expect(s.kunciIndex, `kunci ${s.id}`).toBeGreaterThanOrEqual(0);
      expect(s.kunciIndex).toBeLessThan(s.opsi.length);
    }
  });

  it("id soal unik", () => {
    const ids = SEMUA_SOAL.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("hitungBintangKuis", () => {
  it("3 bintang saat >= 9 benar", () => {
    expect(hitungBintangKuis(1, 9)).toBe(3);
    expect(hitungBintangKuis(1, 10)).toBe(3);
  });
  it("2 bintang saat 8 benar", () => {
    expect(hitungBintangKuis(1, 8)).toBe(2);
  });
  it("1 bintang saat memenuhi syarat lulus tapi < 8", () => {
    const min = ATURAN[1].syaratLulus.minBenar;
    expect(hitungBintangKuis(1, min)).toBe(1);
  });
  it("0 bintang saat di bawah syarat lulus", () => {
    const min = ATURAN[1].syaratLulus.minBenar;
    expect(hitungBintangKuis(1, min - 1)).toBe(0);
    expect(hitungBintangKuis(1, 0)).toBe(0);
  });
});

describe("bonusBeruntun", () => {
  it("0 saat tanpa beruntun", () => {
    expect(bonusBeruntun(0)).toBe(0);
    expect(bonusBeruntun(-3)).toBe(0);
  });
  it("naik 5 per hari sampai batas maks 25", () => {
    expect(bonusBeruntun(1)).toBe(5);
    expect(bonusBeruntun(5)).toBe(25);
    expect(bonusBeruntun(6)).toBe(25);
    expect(bonusBeruntun(100)).toBe(25);
  });
});

describe("durasiSoalEndless", () => {
  it("mengembalikan durasi asli saat belum ada percepatan", () => {
    expect(durasiSoalEndless(15, 0)).toBe(15);
    expect(durasiSoalEndless(15, ENDLESS_KUIS.benarPerPercepatan - 1)).toBe(15);
  });
  it("menyusut 1 detik tiap benarPerPercepatan jawaban benar", () => {
    expect(durasiSoalEndless(15, ENDLESS_KUIS.benarPerPercepatan)).toBe(14);
    expect(durasiSoalEndless(15, ENDLESS_KUIS.benarPerPercepatan * 3)).toBe(12);
  });
  it("tak pernah lebih cepat dari timerMinDetik", () => {
    expect(durasiSoalEndless(15, 1000)).toBe(ENDLESS_KUIS.timerMinDetik);
  });
});

describe("tanggal harian", () => {
  it("tanggalHariIni memformat YYYY-MM-DD dengan padding", () => {
    expect(tanggalHariIni(new Date(2026, 6, 17))).toBe("2026-07-17");
    expect(tanggalHariIni(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("tanggalKemarin mundur satu hari, termasuk lintas bulan & tahun", () => {
    expect(tanggalKemarin("2026-07-17")).toBe("2026-07-16");
    expect(tanggalKemarin("2026-07-01")).toBe("2026-06-30");
    expect(tanggalKemarin("2026-01-01")).toBe("2025-12-31");
  });

  it("tanggalRamah memakai nama hari & bulan Indonesia yang benar", () => {
    // Date dipakai sebagai acuan kebenaran hari-dalam-minggu (bukan sirkular:
    // tanggalRamah adalah yang diuji, Date yang jadi rujukan).
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const d = new Date(2026, 6, 17);
    expect(tanggalRamah("2026-07-17")).toBe(`${hari[d.getDay()]}, 17 Juli`);
  });
});

describe("levelKesulitanAnak & labelKesulitan", () => {
  it("membatasi level ke rentang 1..LEVEL_MAKS", () => {
    expect(levelKesulitanAnak(0)).toBe(1);
    expect(levelKesulitanAnak(-5)).toBe(1);
    expect(levelKesulitanAnak(5)).toBe(5);
    expect(levelKesulitanAnak(LEVEL_MAKS)).toBe(LEVEL_MAKS);
    expect(levelKesulitanAnak(999)).toBe(LEVEL_MAKS);
  });
  it("melabeli tingkat kesulitan ramah anak", () => {
    expect(labelKesulitan(1)).toBe("Mudah");
    expect(labelKesulitan(3)).toBe("Mudah");
    expect(labelKesulitan(4)).toBe("Sedang");
    expect(labelKesulitan(6)).toBe("Sedang");
    expect(labelKesulitan(7)).toBe("Seru");
  });
});

describe("soalUntukLevel", () => {
  it("mengembalikan tepat JUMLAH_SOAL soal, semuanya dari level itu", () => {
    for (let lv = 1; lv <= LEVEL_MAKS; lv++) {
      const soal = soalUntukLevel(lv);
      expect(soal.length).toBe(JUMLAH_SOAL);
      expect(soal.every((s) => s.level === lv)).toBe(true);
      // tak ada soal dobel dalam satu sesi
      expect(new Set(soal.map((s) => s.id)).size).toBe(soal.length);
    }
  });
});

describe("soalUntukEndless", () => {
  it("mencakup semua soal, terurut level menaik (mudah → sulit)", () => {
    const soal = soalUntukEndless();
    expect(soal.length).toBe(SEMUA_SOAL.length);
    for (let i = 1; i < soal.length; i++) {
      expect(soal[i].level).toBeGreaterThanOrEqual(soal[i - 1].level);
    }
  });
});

describe("soalHarian (deterministik & adaptif)", () => {
  it("mengembalikan tepat JUMLAH_SOAL_HARIAN soal unik", () => {
    const soal = soalHarian(3, "2026-07-17", "user-1");
    expect(soal.length).toBe(JUMLAH_SOAL_HARIAN);
    expect(new Set(soal.map((s) => s.id)).size).toBe(soal.length);
  });

  it("deterministik untuk (tanggal, anak, level) yang sama", () => {
    const a = soalHarian(3, "2026-07-17", "user-1").map((s) => s.id);
    const b = soalHarian(3, "2026-07-17", "user-1").map((s) => s.id);
    expect(a).toEqual(b);
  });

  it("berbeda antar anak (kemungkinan sangat besar) & antar tanggal", () => {
    const u1 = soalHarian(3, "2026-07-17", "user-1").map((s) => s.id).join();
    const u2 = soalHarian(3, "2026-07-17", "user-2").map((s) => s.id).join();
    const hariLain = soalHarian(3, "2026-07-18", "user-1").map((s) => s.id).join();
    expect(u1).not.toBe(u2);
    expect(u1).not.toBe(hariLain);
  });

  it("soal berada di sekitar level anak (bawah-1 .. atas+1) & selalu terisi penuh", () => {
    for (const lv of [1, 3, LEVEL_MAKS]) {
      const soal = soalHarian(lv, "2026-07-17", "user-1");
      expect(soal.length).toBe(JUMLAH_SOAL_HARIAN);
      const bawah = Math.max(1, lv - 1);
      const atas = Math.min(LEVEL_MAKS, lv + 1);
      for (const s of soal) {
        expect(s.level).toBeGreaterThanOrEqual(bawah);
        expect(s.level).toBeLessThanOrEqual(atas);
      }
    }
  });
});

describe("konstanta poin", () => {
  it("konsisten dengan Isi Piringku (benar = 10 poin)", () => {
    expect(POIN_PER_BENAR).toBe(10);
  });
});
