import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

/* Like video tersimpan per-user di users/{uid}.likesVideo (array id video).
   Tanpa penghitung global & tanpa komentar — aman untuk anak. */
export async function setLikeVideo(
  userId: string,
  videoId: string,
  suka: boolean
): Promise<void> {
  await updateDoc(doc(getDb(), "users", userId), {
    likesVideo: suka ? arrayUnion(videoId) : arrayRemove(videoId),
  });
}
