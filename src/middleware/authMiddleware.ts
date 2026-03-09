import { createListenerMiddleware } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { updateTokens, logout } from '../store/authSlice';
import { adminLogout } from '../store/adminAuthSlice';
import { store, persistor } from '../store/store';
import { clearAllAuthAndPurge } from '../utils/authLogout';

interface RootState {
  auth: {
    isAuthenticated: boolean;
    tokens: {
      access: string | null;
      refresh: string | null;
    };
  };
}

export const authMiddleware = createListenerMiddleware();

// When admin logs in (same tab had user session), clear user auth so only admin session remains
authMiddleware.startListening({
  type: 'adminAuth/login/fulfilled',
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(logout());
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('taxOrganizerData');
    }
  },
});

// When user logs in (same tab had admin session), clear admin auth so only user session remains
authMiddleware.startListening({
  predicate: (action) =>
    action.type === 'auth/login/fulfilled' || action.type === 'auth/signup/fulfilled',
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(adminLogout());
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('adminAccessToken');
      window.localStorage.removeItem('adminRefreshToken');
    }
  },
});

// Token refresh middleware
authMiddleware.startListening({
  predicate: (action, currentState: RootState): boolean => {
    // Listen for any action that might need authentication
    return !!(currentState.auth.isAuthenticated && currentState.auth.tokens.access);
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const { tokens } = state.auth;

    // Check if access token is about to expire (decode JWT and check exp)
    if (tokens.access) {
      try {
        const payload = JSON.parse(atob(tokens.access.split('.')[1]));
        const now = Date.now() / 1000;
        
        // Refresh if token expires in the next 5 minutes
        if (payload.exp - now < 300) {
          try {
            const response = await apiService.refreshToken(tokens.refresh);
            listenerApi.dispatch(updateTokens(response.tokens));
          } catch (error) {
            // If refresh fails, clear all auth and purge persisted state
            clearAllAuthAndPurge(listenerApi.dispatch, persistor);
          }
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    }
  },
});

// Add auth header to all API requests
const originalRequest = apiService.request;
apiService.request = async function(endpoint: string, options: any = {}) {
  // Get state from store directly instead of window
  const state = store.getState() as RootState;
  
  if (state?.auth?.tokens?.access) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${state.auth.tokens.access}`,
    };
  }
  
  try {
    return await originalRequest.call(this, endpoint, options);
  } catch (error: any) {
    // If we get a 401, try to refresh the token
    if (error.message.includes('401') && state?.auth?.tokens?.refresh) {
      try {
        const refreshResponse = await originalRequest.call(this, '/token/refresh/', {
          method: 'POST',
          body: { refresh: state.auth.tokens.refresh },
        });
        
        // Update tokens in store
        store.dispatch(updateTokens(refreshResponse.tokens));
        
        // Retry original request with new token
        options.headers.Authorization = `Bearer ${refreshResponse.tokens.access}`;
        return await originalRequest.call(this, endpoint, options);
      } catch (refreshError) {
        // If refresh fails, clear all auth and purge persisted state
        clearAllAuthAndPurge(store.dispatch, persistor);
        throw refreshError;
      }
    }
    throw error;
  }
};