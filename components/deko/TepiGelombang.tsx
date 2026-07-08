/* Pembatas gelombang antar band pastel (catatan-restyle-thynk.md §B–C).
   Warna via currentColor — set kelas text-band-* SAMA dengan warna band
   yang "menjulurkan" gelombangnya:

   arah="bawah" (default): band di ATAS komponen ini — gelombang menutup
   turun ke seksi berikutnya. arah="atas": band di BAWAH komponen ini. */

export default function TepiGelombang({
  arah = "bawah",
  className = "",
}: {
  arah?: "bawah" | "atas";
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      className={[
        "block w-full h-4 sm:h-6 pointer-events-none",
        arah === "atas" ? "rotate-180" : "",
        className,
      ].join(" ")}
    >
      {/* isi menutup sisi atas; tepi bawah bergelombang */}
      <path
        d="M0 0 H1440 V12 C1350 20 1260 0 1170 8 C1080 16 990 0 900 8 C810 16 720 0 630 8 C540 16 450 0 360 8 C270 16 180 0 90 8 C45 12 15 8 0 12 Z"
        fill="currentColor"
      />
    </svg>
  );
}
