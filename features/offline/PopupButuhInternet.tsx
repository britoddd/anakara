"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { useOnline } from "./OnlineContext";

/* Popup penjaga fitur online. Dibuka lewat mintaOnline() dari OnlineContext
   ketika anak menekan fitur yang butuh internet saat sedang offline
   (mis. Leaderboard, Kelasku, login). Ramah anak: Tayo + pesan menenangkan,
   bukan galat teknis. */

export default function PopupButuhInternet() {
  const { pesanPopup, tutupPopup } = useOnline();

  return (
    <Modal
      open={pesanPopup !== null}
      onClose={tutupPopup}
      title="Butuh Internet Dulu 📶"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <span
          className="w-24 h-24 text-5xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center"
          aria-hidden="true"
        >
          <GambarEmoji
            src="/assets/mascot/tayo-hello.png"
            emoji="🐆"
            className="w-full h-full object-cover"
          />
        </span>
        <p className="font-bold text-lg">{pesanPopup}</p>
        <p className="text-muted font-bold text-sm">
          Tenang, permainan seperti Cerita, Kuis, Isi Piringku, Video, dan 2 vs 2
          lawan Robo tetap bisa dimainkan tanpa internet. 🎮
        </p>
        <Button fullWidth onClick={tutupPopup}>
          Oke, mengerti!
        </Button>
      </div>
    </Modal>
  );
}
