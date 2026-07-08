// Cek rasio kontras WCAG untuk kandidat palet restyle THYNK
// (lihat catatan-restyle-thynk.md §A). Jalankan: node scripts/cek-kontras.mjs
// Teks normal wajib >= 4.5:1; elemen non-teks (focus ring, ikon) >= 3:1.
function lum(hex) {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function rasio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const uji = [
  // [label, warnaDepan, warnaLatar, target]
  ["LIGHT fg/bg", "#163A2C", "#F5F8E7", 4.5],
  ["LIGHT fg/surface", "#163A2C", "#FFFFFF", 4.5],
  ["LIGHT muted/bg", "#52685B", "#F5F8E7", 4.5],
  ["LIGHT muted/surface", "#52685B", "#FFFFFF", 4.5],
  ["LIGHT on-primary/primary(pink)", "#FFFFFF", "#D6336C", 4.5],
  ["LIGHT on-primary/primary-hover", "#FFFFFF", "#C22B60", 4.5],
  ["LIGHT on-accent/accent(kuning)", "#163A2C", "#FFC93C", 4.5],
  ["LIGHT on-success/success(hijau)", "#FFFFFF", "#2F7D33", 4.5],
  ["LIGHT link/bg", "#B02861", "#F5F8E7", 4.5],
  ["LIGHT danger/surface", "#C0392B", "#FFFFFF", 4.5],
  ["LIGHT fg/band-pink", "#163A2C", "#FBDCE8", 4.5],
  ["LIGHT fg/band-green", "#163A2C", "#DDF1C6", 4.5],
  ["LIGHT fg/band-blue", "#163A2C", "#CDE9F6", 4.5],
  ["LIGHT focus/bg (non-teks 3:1)", "#B02861", "#F5F8E7", 3],
  // Satu-satunya GAGAL yang disengaja didokumentasikan: primary pink sebagai
  // teks di atas bg = 4.28 — karena itu ada aturan "teks pink pakai --link".
  ["LIGHT primary sbg teks/bg (aturan: pakai --link!)", "#D6336C", "#F5F8E7", 4.5],
  ["DARK fg/bg", "#EAF6E8", "#12271B", 4.5],
  ["DARK fg/surface", "#EAF6E8", "#1A3526", 4.5],
  ["DARK muted/bg", "#A7BFAC", "#12271B", 4.5],
  ["DARK on-primary/primary(pink terang)", "#12271B", "#F06A9B", 4.5],
  ["DARK on-accent/accent", "#12271B", "#FBD24E", 4.5],
  ["DARK on-success/success", "#12271B", "#7DD35B", 4.5],
  ["DARK link/bg", "#F48FB1", "#12271B", 4.5],
  ["DARK danger/bg", "#FF8A80", "#12271B", 4.5],
  ["DARK fg/band-pink", "#EAF6E8", "#43222E", 4.5],
  ["DARK fg/band-green", "#EAF6E8", "#22421A", 4.5],
  ["DARK fg/band-blue", "#EAF6E8", "#173648", 4.5],
  ["DARK focus/bg (non-teks 3:1)", "#F06A9B", "#12271B", 3],
];
let gagal = 0;
for (const [label, f, b, target] of uji) {
  const r = rasio(f, b);
  if (r < target) gagal++;
  console.log(`${r >= target ? "PASS " : "GAGAL"} ${r.toFixed(2)} (target ${target}) ${label}`);
}
console.log(gagal ? `\n${gagal} pasangan di bawah target.` : "\nSemua pasangan lolos.");
