import { describe, it, expect, vi, afterEach } from "vitest";
import {
  SEMUA_KARTU,
  RARITY_INFO,
  getKartu,
  gachaKartu,
  soalUntukBattle,
  JUMLAH_SOAL_BATTLE,
  buatBot,
  adalahBot,
} from "./config";
import type { Rarity } from "./config";

afterEach(() => vi.restoreAllMocks());

/** Suntik urutan nilai Math.random deterministik (gacha memakainya dua kali:
    pertama untuk rarity, lalu untuk memilih kartu di rarity itu). */
function stubRandom(...nilai: number[]) {
  let i = 0;
  vi.spyOn(Math, "random").mockImplementation(() => nilai[Math.min(i++, nilai.length - 1)]);
}

describe("kartu koleksi & rarity", () => {
  it("setiap rarity punya minimal satu kartu", () => {
    for (const r of ["biasa", "langka", "legenda"] as Rarity[]) {
      expect(SEMUA_KARTU.some((k) => k.rarity === r), `kartu ${r}`).toBe(true);
    }
  });

  it("peluang rarity berjumlah ~1", () => {
    const total =
      RARITY_INFO.biasa.peluang + RARITY_INFO.langka.peluang + RARITY_INFO.legenda.peluang;
    expect(total).toBeCloseTo(1, 5);
  });

  it("id kartu unik", () => {
    const ids = SEMUA_KARTU.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getKartu menemukan yang ada & undefined untuk yang tidak ada", () => {
    expect(getKartu(SEMUA_KARTU[0].id)).toBeDefined();
    expect(getKartu("tidak-ada-xyz")).toBeUndefined();
  });
});

describe("gachaKartu (peluang D2: legenda 5% / langka 25% / biasa 70%)", () => {
  it("roll di bawah peluang legenda → kartu legenda", () => {
    stubRandom(RARITY_INFO.legenda.peluang / 2, 0);
    expect(gachaKartu().rarity).toBe("legenda");
  });

  it("roll di pita langka → kartu langka", () => {
    stubRandom(RARITY_INFO.legenda.peluang + RARITY_INFO.langka.peluang / 2, 0);
    expect(gachaKartu().rarity).toBe("langka");
  });

  it("roll tinggi → kartu biasa", () => {
    stubRandom(0.99, 0);
    expect(gachaKartu().rarity).toBe("biasa");
  });

  it("selalu mengembalikan kartu yang valid (ada di SEMUA_KARTU)", () => {
    for (const roll of [0, 0.04, 0.2, 0.5, 0.95]) {
      stubRandom(roll, 0.5);
      const k = gachaKartu();
      expect(SEMUA_KARTU).toContainEqual(k);
    }
  });
});

describe("soalUntukBattle", () => {
  it("mengembalikan JUMLAH_SOAL_BATTLE soal, semuanya level <= 2", () => {
    const soal = soalUntukBattle();
    expect(soal.length).toBe(JUMLAH_SOAL_BATTLE);
    expect(soal.every((s) => s.level <= 2)).toBe(true);
    expect(new Set(soal.map((s) => s.id)).size).toBe(soal.length);
  });
});

describe("bot", () => {
  it("buatBot memberi uid ber-prefix bot- & nama berputar", () => {
    expect(buatBot(0).nama).toBe("Robo Milo");
    expect(buatBot(4).nama).toBe("Robo Milo"); // 4 % 4 = 0
    expect(buatBot(0).uid.startsWith("bot-")).toBe(true);
  });

  it("adalahBot membedakan uid bot dari uid siswa", () => {
    expect(adalahBot(buatBot(1).uid)).toBe(true);
    expect(adalahBot("bot-2-abcd")).toBe(true);
    expect(adalahBot("user-123")).toBe(false);
    expect(adalahBot("robot-123")).toBe(false); // bukan prefix "bot-"
  });
});
