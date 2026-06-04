import { useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext } from '@/providers/AuthProvider';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

/**
 * Hook for accessing the canonical auth state.
 * Reads from AuthProvider context — does NOT create a new Supabase listener.
 * This ensures a single auth listener owned by AuthProvider at the app root.
 */
export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  return useContext(AuthContext);
}
