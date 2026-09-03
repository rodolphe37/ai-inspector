import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import mockUsers from '@/data/mockUsers.json';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        const users = mockUsers as unknown as Array<{ id: string; name: string; email: string; password: string; plan: string }>;
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
        );
        if (!found) {
          return { success: false, error: 'Invalid email or password.' };
        }
        set({
          user: { id: found.id, name: found.name, email: found.email, plan: found.plan as User['plan'] },
        });
        return { success: true };
      },
      signup: (name, email, _password) => {
        const users = mockUsers as unknown as Array<{ email: string }>;
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'An account with this email already exists.' };
        }
        set({
          user: {
            id: `user_${Date.now().toString(36)}`,
            name,
            email,
            plan: 'free',
          },
        });
        return { success: true };
      },
      logout: () => set({ user: null }),
    }),
    { name: 'provenance-auth' },
  ),
);
