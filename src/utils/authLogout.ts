/**
 * Centralized logout: clear Redux auth state, all auth-related localStorage,
 * and purge persisted store so the next visit starts clean.
 * Use for both user and admin logout so sessions don't leak between roles.
 */
import type { Dispatch } from '@reduxjs/toolkit';
import type { Persistor } from 'redux-persist';
import { logout } from '../store/authSlice';
import { adminLogout } from '../store/adminAuthSlice';

const AUTH_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'adminAccessToken',
  'adminRefreshToken',
  'taxOrganizerData',
] as const;

export function clearAllAuthStorage(): void {
  if (typeof window === 'undefined') return;
  AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

/**
 * Log out both user and admin, clear all auth-related localStorage, and purge
 * redux-persist so no auth state is restored on next load.
 */
export function clearAllAuthAndPurge(
  dispatch: Dispatch,
  persistor: Persistor
): void {
  dispatch(logout());
  dispatch(adminLogout());
  clearAllAuthStorage();
  void persistor.purge();
}

/** Same as clearAllAuthAndPurge but waits for persist purge (needed before navigation / rehydrate races). */
export async function clearAllAuthAndPurgeAsync(
  dispatch: Dispatch,
  persistor: Persistor
): Promise<void> {
  dispatch(logout());
  dispatch(adminLogout());
  clearAllAuthStorage();
  await persistor.purge();
}
