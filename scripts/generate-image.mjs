#!/usr/bin/env node
/**
 * Anakara — Gemini Image Generation CLI
 * =====================================
 * Generate asset gambar (maskot Tayo, avatar, ilustrasi makanan, thumbnail, dll)
 * lewat Google Gemini API, dengan dukungan gambar referensi untuk menjaga
 * konsistensi karakter (lihat arsip/prompt-clarifications.md bagian E).
 *
 * Contoh pakai (jalankan dari ROOT project, bukan dari folder scripts/):
 *
 *   # Generate 1 gambar dari teks
 *   node scripts/generate-image.mjs \
 *     --prompt "logo Anakara, macan tutul kecil kuning lucu, gaya kawaii" \
 *     --out public/assets/logo.png
 *
 *   # Generate dengan gambar referensi (jaga konsistensi Tayo)
 *   node scripts/generate-image.mjs \
 *     --prompt "Tayo si macan kecil sedang makan buah apel, background transparan" \
 *     --ref "referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg" \
 *     --out public/assets/mascot/tayo-makan.png
 *
 *   # Generate banyak variasi sekaligus
 *   node scripts/generate-image.mjs -p "avatar anak kartun bulat, gaya ceria" -n 4 \
 *     -o public/assets/avatars/avatar.png
 *
 *   # Batch dari file JSON (lihat contoh format di --help)
 *   node scripts/generate-image.mjs --batch scripts/asset-list.example.json
 *
 * Prasyarat: isi GEMINI_API_KEY di file .env (root project).
 */

import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// --- Lokasi root project (satu tingkat di atas folder scripts/) ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Muat .env dari root, apa pun cwd-nya.
dotenv.config({ path: path.join(ROOT, '.env') });

// ---------------------------------------------------------------------------
// Parsing argumen CLI
// ---------------------------------------------------------------------------
const { values: args } = parseArgs({
  allowPositionals: false,
  options: {
    prompt: { type: 'string', short: 'p' },
    'prompt-file': { type: 'string' },
    out: { type: 'string', short: 'o' },
    ref: { type: 'string', short: 'r', multiple: true }, // boleh dipakai berkali-kali
    count: { type: 'string', short: 'n', default: '1' },
    model: { type: 'string', short: 'm' },
    aspect: { type: 'string', default: '1:1' }, // hanya untuk model Imagen
    batch: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (args.help) {
  printHelp();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Validasi API key
// ---------------------------------------------------------------------------
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error(
    '\n❌ GEMINI_API_KEY belum diisi.\n' +
      '   Buka file .env di root project dan isi GEMINI_API_KEY=...\n' +
      '   Ambil API key gratis di: https://aistudio.google.com/app/apikey\n'
  );
  process.exit(1);
}

const DEFAULT_MODEL =
  args.model || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
try {
  if (args.batch) {
    await runBatch(args.batch);
  } else {
    await runSingle();
  }
} catch (err) {
  console.error('\n❌ Gagal generate:', err?.message || err);
  if (err?.stack && process.env.DEBUG) console.error(err.stack);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Mode: satu perintah
// ---------------------------------------------------------------------------
async function runSingle() {
  let prompt = args.prompt;
  if (!prompt && args['prompt-file']) {
    prompt = (await readFile(resolve(args['prompt-file']), 'utf8')).trim();
  }
  if (!prompt) {
    console.error('❌ Wajib beri --prompt "..." atau --prompt-file <path>. Lihat --help.');
    process.exit(1);
  }
  if (!args.out) {
    console.error('❌ Wajib beri --out <path file gambar>, mis. public/assets/logo.png');
    process.exit(1);
  }

  const count = Math.max(1, parseInt(args.count, 10) || 1);
  await generate({
    prompt,
    out: args.out,
    refs: args.ref || [],
    count,
    model: DEFAULT_MODEL,
    aspect: args.aspect,
  });
}

// ---------------------------------------------------------------------------
// Mode: batch dari file JSON
//   Format: [{ "prompt": "...", "out": "public/...", "refs": ["..."], "count": 1, "model": "..." }, ...]
// ---------------------------------------------------------------------------
async function runBatch(batchPath) {
  const raw = await readFile(resolve(batchPath), 'utf8');
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error('File batch harus berupa array JSON.');

  console.log(`📦 Batch: ${items.length} item\n`);
  for (const [i, item] of items.entries()) {
    if (!item.prompt || !item.out) {
      console.warn(`⚠️  Item #${i + 1} dilewati (butuh "prompt" & "out").`);
      continue;
    }
    console.log(`— [${i + 1}/${items.length}] ${item.out}`);
    await generate({
      prompt: item.prompt,
      out: item.out,
      refs: item.refs || [],
      count: Math.max(1, item.count || 1),
      model: item.model || DEFAULT_MODEL,
      aspect: item.aspect || '1:1',
    });
  }
  console.log('\n✅ Batch selesai.');
}

// ---------------------------------------------------------------------------
// Inti generate — memilih jalur API sesuai model
// ---------------------------------------------------------------------------
async function generate({ prompt, out, refs, count, model, aspect }) {
  console.log(`   model=${model}  count=${count}${refs.length ? `  ref=${refs.length}` : ''}`);

  // Imagen memakai endpoint generateImages; Gemini(-image) memakai generateContent.
  const isImagen = model.toLowerCase().includes('imagen');

  const images = isImagen
    ? await generateWithImagen({ prompt, count, model, aspect })
    : await generateWithGemini({ prompt, refs, count, model });

  if (images.length === 0) {
    throw new Error(
      'Model tidak mengembalikan gambar. Coba perjelas prompt, atau cek apakah model mendukung image output.'
    );
  }

  // Simpan tiap gambar. Kalau >1, sisipkan indeks sebelum ekstensi.
  const saved = [];
  for (const [i, img] of images.entries()) {
    const target = images.length > 1 ? withIndex(out, i + 1) : out;
    const finalPath = ensureExt(target, img.mimeType);
    await mkdir(path.dirname(resolve(finalPath)), { recursive: true });
    await writeFile(resolve(finalPath), Buffer.from(img.data, 'base64'));
    saved.push(finalPath);
    console.log(`   ✔ ${finalPath}`);
  }
  return saved;
}

/**
 * Gemini 2.5 Flash Image ("Nano Banana"): dukung teks + gambar referensi.
 * Balasannya berupa candidates -> content.parts, gambar ada di part.inlineData.
 */
async function generateWithGemini({ prompt, refs, count, model }) {
  const parts = [{ text: prompt }];

  // Lampirkan gambar referensi (kalau ada) sebagai inlineData base64.
  for (const ref of refs) {
    const buf = await readFile(resolve(ref));
    parts.push({
      inlineData: { mimeType: mimeFromExt(ref), data: buf.toString('base64') },
    });
  }

  const out = [];
  // Gemini image umumnya balas 1 gambar per panggilan; ulangi untuk count>1.
  for (let i = 0; i < count; i++) {
    const res = await ai.models.generateContent({ model, contents: parts });
    const resParts = res?.candidates?.[0]?.content?.parts || [];
    for (const p of resParts) {
      if (p.inlineData?.data) {
        out.push({ data: p.inlineData.data, mimeType: p.inlineData.mimeType || 'image/png' });
      }
    }
  }
  return out;
}

/**
 * Imagen: text-to-image murni (tanpa referensi), bisa langsung minta banyak gambar.
 */
async function generateWithImagen({ prompt, count, model, aspect }) {
  const res = await ai.models.generateImages({
    model,
    prompt,
    config: { numberOfImages: count, aspectRatio: aspect },
  });
  return (res?.generatedImages || []).map((g) => ({
    data: g.image.imageBytes,
    mimeType: 'image/png',
  }));
}

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------
function resolve(p) {
  return path.isAbsolute(p) ? p : path.join(ROOT, p);
}

function mimeFromExt(p) {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/png';
}

function extFromMime(mime) {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  return '.png';
}

// Pastikan ekstensi file cocok dengan mime hasil (kalau user tak tulis ekstensi).
function ensureExt(p, mime) {
  const ext = path.extname(p);
  if (ext) return p;
  return p + extFromMime(mime);
}

// Sisipkan "-1", "-2", dst. sebelum ekstensi untuk output banyak gambar.
function withIndex(p, i) {
  const ext = path.extname(p);
  const base = ext ? p.slice(0, -ext.length) : p;
  return `${base}-${i}${ext}`;
}

function printHelp() {
  console.log(`
Anakara — Gemini Image Generation CLI

Jalankan dari ROOT project.

Opsi:
  -p, --prompt <teks>      Prompt gambar (Bahasa apa saja).
      --prompt-file <path> Baca prompt dari file teks.
  -o, --out <path>         Path output, mis. public/assets/mascot/tayo.png
  -r, --ref <path>         Gambar referensi (boleh diulang: -r a.png -r b.png).
                           Hanya untuk model gemini-*-image (bukan Imagen).
  -n, --count <angka>      Jumlah gambar (default 1).
  -m, --model <nama>       Override model (default dari .env / gemini-2.5-flash-image).
      --aspect <rasio>     Rasio untuk Imagen: 1:1, 3:4, 4:3, 9:16, 16:9 (default 1:1).
      --batch <file.json>  Generate banyak asset dari daftar JSON.
  -h, --help               Tampilkan bantuan ini.

Format file batch JSON:
  [
    { "prompt": "logo Anakara ...", "out": "public/assets/logo.png" },
    { "prompt": "Tayo makan apel", "out": "public/assets/mascot/tayo-apel.png",
      "refs": ["referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg"], "count": 2 }
  ]
`);
}
