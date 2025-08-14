import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { signInWithGoogle, signUpWithEmail, signInWithEmail, signOut, onAuthStateChange } from '../firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        set({ error, loading: false });
      } else if (user) {
        set({ user, loading: false, error: null });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { user, error } = await signUpWithEmail(email, password);
      if (error) {
        set({ error, loading: false });
        return { success: false, error };
      } else if (user) {
        set({ user, loading: false, error: null });
        return { success: true, user };
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { user, error } = await signInWithEmail(email, password);
      if (error) {
        set({ error, loading: false });
      } else if (user) {
        set({ user, loading: false, error: null });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await signOut();
      if (error) {
        set({ error, loading: false });
      } else {
        set({ user: null, loading: false, error: null });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));

// Initialize auth state listener
export const initializeAuth = () => {
  onAuthStateChange((user) => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(false);
  });
};
