import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/* Vitest untuk lapisan logika murni (skoring, level, beruntun, determinisme
   tantangan harian, validasi nama, peluang gacha, invarian data). Alias "@"
   disamakan dengan tsconfig paths supaya impor `@/data/*.json` & `@/features/*`
   resolve sama seperti di aplikasi. Environment node (logika murni; test yang
   butuh localStorage menyuntik mock sendiri). */
const root = resolve(fileURLToPath(new URL(".", import.meta.url)));

export default defineConfig({
  resolve: {
    alias: { "@": root },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "scripts", ".next"],
  },
});
