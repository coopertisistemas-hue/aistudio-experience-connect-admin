import { createContext } from 'react';
import type { DriverAuthState } from './DriverAuth';

export const DriverAuthContext = createContext<DriverAuthState>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});
