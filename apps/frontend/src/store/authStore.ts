import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: string;
  walletAddress?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  walletAddress: string | null;
  setAuth: (user: User, token: string) => void;
  setWallet: (address: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      walletAddress: null,
      setAuth: (user, token) => set({ user, token }),
      setWallet: (address) => set({ walletAddress: address }),
      logout: () => set({ user: null, token: null, walletAddress: null }),
    }),
    { name: "testf-auth" }
  )
);
