import AwanPikiran from "./AwanPikiran";
import BlobMata from "./BlobMata";
import Squiggle from "./Squiggle";

/* Lapisan doodle samar untuk latar halaman (gaya THYNK, restyle D12) —
   bentuk polos tanpa wajah, memakai warna band-* yang memang tipis di atas
   --bg pada dua tema (tanpa trik opacity). fixed + -z-10 → di belakang
   seluruh konten; pointer-events-none + aria-hidden → murni hiasan.
   tetap={false} = absolute, untuk pratinjau dalam kotak (galeri dev). */

export default function LatarDoodle({ tetap = true }: { tetap?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${tetap ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden pointer-events-none`}
    >
      <AwanPikiran className="absolute left-[3%] top-[8%] w-24 text-band-blue" />
      <BlobMata
        bentuk="bunga"
        wajah={false}
        className="absolute right-[5%] top-[14%] w-28 text-band-pink rotate-12"
      />
      <Squiggle className="absolute left-[2%] top-[52%] w-32 text-band-green -rotate-12" />
      <BlobMata
        bentuk="gumpal"
        wajah={false}
        className="hidden sm:block absolute right-[16%] top-[46%] w-20 text-band-green rotate-45"
      />
      <BlobMata
        bentuk="cipratan"
        wajah={false}
        className="absolute right-[4%] bottom-[9%] w-36 text-band-pink -rotate-6"
      />
      <AwanPikiran className="hidden sm:block absolute left-[10%] bottom-[12%] w-20 text-band-blue -scale-x-100" />
    </div>
  );
}
