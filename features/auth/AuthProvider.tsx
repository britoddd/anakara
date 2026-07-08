"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { hasFirebaseConfig } from "@/lib/firebase";
import { ambilProfil } from "./api";
import type { UserProfile } from "./types";

interface AuthState {
  /** Firebase user; null = belum login */
  user: User | null;
  /** Dokumen users/{uid}; null = belum login ATAU profil belum dibuat */
  profil: UserProfile | null;
  /** true selama status login awal belum diketahui */
  loading: boolean;
  /** Panggil setelah mengubah profil di Firestore agar context ikut segar */
  refreshProfil: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profil: null,
  loading: true,
  refreshProfil: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setLoading(false);
      return;
    }
    let batal = false;
    let unsubscribe = () => {};
    // import dinamis: SDK auth hanya termuat saat config tersedia
    (async () => {
      const [{ onAuthStateChanged }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase"),
      ]);
      if (batal) return;
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (u) => {
        setUser(u);
        // gagal baca profil (mis. rules belum di-publish) jangan sampai
        // jadi unhandled rejection — halaman yang menangani pesannya
        setProfil(u ? await ambilProfil(u.uid).catch(() => null) : null);
        setLoading(false);
      });
    })();
    return () => {
      batal = true;
      unsubscribe();
    };
  }, []);

  const refreshProfil = useCallback(async () => {
    if (user) setProfil(await ambilProfil(user.uid));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profil, loading, refreshProfil }}>
      {children}
    </AuthContext.Provider>
  );
}
