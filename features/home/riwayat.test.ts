import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { bacaRiwayat, catatMain } from "./riwayat";

/* riwayat.ts memakai window + localStorage (per perangkat). Env vitest = node,
   jadi kita suntik localStorage in-memory + window minimal supaya jalur nyata
   (cap 10, dedup, urutan terbaru-dulu, tahan data rusak) benar-benar teruji. */

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, String(v));
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
  clear(): void {
    this.store.clear();
  }
}

const g = globalThis as unknown as { window?: unknown; localStorage?: LocalStorageMock };

beforeEach(() => {
  g.window = globalThis;
  g.localStorage = new LocalStorageMock();
});
afterEach(() => {
  delete g.window;
  delete g.localStorage;
});

describe("riwayat main", () => {
  it("kosong saat belum ada apa-apa", () => {
    expect(bacaRiwayat()).toEqual([]);
  });

  it("mencatat game terakhir di urutan terdepan", () => {
    catatMain("kuis");
    catatMain("cerita");
    expect(bacaRiwayat()).toEqual(["cerita", "kuis"]);
  });

  it("main ulang memindahkan game ke depan tanpa duplikat", () => {
    catatMain("kuis");
    catatMain("cerita");
    catatMain("kuis");
    expect(bacaRiwayat()).toEqual(["kuis", "cerita"]);
  });

  it("membatasi riwayat ke 10 entri terakhir", () => {
    for (let i = 0; i < 15; i++) catatMain(`game-${i}`);
    const riwayat = bacaRiwayat();
    expect(riwayat.length).toBe(10);
    expect(riwayat[0]).toBe("game-14"); // paling baru di depan
    expect(riwayat).not.toContain("game-4"); // yang tertua terbuang
  });

  it("kembali ke [] saat data localStorage rusak", () => {
    g.localStorage!.setItem("anakara-riwayat-main", "{bukan json");
    expect(bacaRiwayat()).toEqual([]);
  });

  it("menyaring entri non-string yang tak sengaja tersimpan", () => {
    g.localStorage!.setItem(
      "anakara-riwayat-main",
      JSON.stringify(["kuis", 42, null, "cerita"])
    );
    expect(bacaRiwayat()).toEqual(["kuis", "cerita"]);
  });
});
