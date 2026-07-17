import { describe, it, expect } from "vitest";
import {
  LEVELS,
  ENDLESS_IP,
  LEVEL_MAKS_IP,
  MAKANAN,
  URUTAN_KELOMPOK,
  KELOMPOK_INFO,
  poolLevel,
  hitungBintang,
  timerRondeEndless,
} from "./config";

describe("struktur level Isi Piringku", () => {
  it("LEVEL_MAKS_IP = level terakhir dari LEVELS", () => {
    expect(LEVEL_MAKS_IP).toBe(LEVELS[LEVELS.length - 1].level);
  });

  it("ENDLESS_IP satu tingkat di atas level biasa terakhir", () => {
    expect(ENDLESS_IP.level).toBe(LEVEL_MAKS_IP + 1);
  });

  it("ambang bintang tiap level urut menaik (3 >= 2 >= 1)", () => {
    for (const cfg of LEVELS) {
      expect(cfg.bintang["3"]).toBeGreaterThanOrEqual(cfg.bintang["2"]);
      expect(cfg.bintang["2"]).toBeGreaterThanOrEqual(cfg.bintang["1"]);
    }
  });
});

describe("invarian data makanan", () => {
  it("tiap makanan punya kelompok yang dikenal", () => {
    for (const m of MAKANAN) {
      expect(URUTAN_KELOMPOK, `kelompok ${m.id}`).toContain(m.kelompok);
    }
  });

  it("setiap dari 4 kelompok punya info tampilan & minimal satu makanan di level termudah tercakup keseluruhan", () => {
    for (const k of URUTAN_KELOMPOK) {
      expect(KELOMPOK_INFO[k]).toBeDefined();
      expect(MAKANAN.some((m) => m.kelompok === k), `makanan ${k}`).toBe(true);
    }
  });

  it("id makanan unik", () => {
    const ids = MAKANAN.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("poolLevel", () => {
  it("mengembalikan semua makanan ber-level <= level", () => {
    const pool = poolLevel(1);
    expect(pool.every((m) => m.level <= 1)).toBe(true);
  });

  it("pool membesar (atau tetap) seiring naik level", () => {
    for (let lv = 1; lv < LEVEL_MAKS_IP; lv++) {
      expect(poolLevel(lv + 1).length).toBeGreaterThanOrEqual(poolLevel(lv).length);
    }
  });

  it("pool level termudah harus mencakup keempat kelompok (agar ronde bisa dibentuk)", () => {
    const kelompokAda = new Set(poolLevel(1).map((m) => m.kelompok));
    for (const k of URUTAN_KELOMPOK) {
      expect(kelompokAda, `kelompok ${k} di level 1`).toContain(k);
    }
  });
});

describe("hitungBintang", () => {
  const cfg = LEVELS[0];
  it("memberi bintang sesuai ambang persen", () => {
    expect(hitungBintang(cfg, cfg.bintang["3"])).toBe(3);
    expect(hitungBintang(cfg, cfg.bintang["2"])).toBe(2);
    expect(hitungBintang(cfg, cfg.bintang["1"])).toBe(1);
    expect(hitungBintang(cfg, cfg.bintang["1"] - 1)).toBe(0);
  });
  it("persen sempurna selalu 3 bintang", () => {
    for (const c of LEVELS) expect(hitungBintang(c, 100)).toBe(3);
  });
});

describe("timerRondeEndless", () => {
  it("mulai dari timerAwalDetik di ronde 1", () => {
    expect(timerRondeEndless(1)).toBe(ENDLESS_IP.timerAwalDetik);
  });
  it("menyusut per ronde tapi tak di bawah timerMinDetik", () => {
    expect(timerRondeEndless(2)).toBe(
      ENDLESS_IP.timerAwalDetik - ENDLESS_IP.timerKurangPerRonde
    );
    expect(timerRondeEndless(999)).toBe(ENDLESS_IP.timerMinDetik);
  });
});
