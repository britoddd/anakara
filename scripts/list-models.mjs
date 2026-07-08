#!/usr/bin/env node
/**
 * Anakara — Diagnostik: daftar model Gemini yang bisa diakses API key di .env.
 * Pakai: node scripts/list-models.mjs [filter]
 * Contoh: node scripts/list-models.mjs image
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') });

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY belum diisi di .env');
  process.exit(1);
}

const filter = (process.argv[2] || '').toLowerCase();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const pager = await ai.models.list();
let n = 0;
for await (const m of pager) {
  const name = (m.name || '').replace('models/', '');
  const actions = (m.supportedActions || []).join(',');
  const line = `${name}  [${actions}]`;
  if (!filter || line.toLowerCase().includes(filter)) {
    console.log(line);
    n++;
  }
}
console.log(`\n${n} model${filter ? ` cocok filter "${filter}"` : ''}.`);
