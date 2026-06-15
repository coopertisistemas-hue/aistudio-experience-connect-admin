import { useContext } from 'react';
import { DriverAuthContext } from './driver-auth-context';
import type { DriverAuthState } from './DriverAuth';

export function useDriverAuth(): DriverAuthState {
  return useContext(DriverAuthContext);
}
