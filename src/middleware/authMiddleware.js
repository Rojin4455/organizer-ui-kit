import { createListenerMiddleware } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { updateTokens, logout } from '../store/authSlice';

export const authMiddleware = createListenerMiddleware();

// Token refresh middleware
authMiddleware.startListening({
  predicate: (action, currentState) => {
    // Listen for any action that might need authentication
    return currentState.auth.isAuthenticated && currentState.auth.tokens.access;
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
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
            // If refresh fails, logout the user
            listenerApi.dispatch(logout());
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
apiService.request = async function(endpoint, options = {}) {
  const state = window.__REDUX_STORE__?.getState();
  
  if (state?.auth?.tokens?.access) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${state.auth.tokens.access}`,
    };
  }
  
  try {
    return await originalRequest.call(this, endpoint, options);
  } catch (error) {
    // If we get a 401, try to refresh the token
    if (error.message.includes('401') && state?.auth?.tokens?.refresh) {
      try {
        const refreshResponse = await originalRequest.call(this, '/token/refresh/', {
          method: 'POST',
          body: { refresh: state.auth.tokens.refresh },
        });
        
        // Update tokens in store
        window.__REDUX_STORE__?.dispatch(updateTokens(refreshResponse.tokens));
        
        // Retry original request with new token
        options.headers.Authorization = `Bearer ${refreshResponse.tokens.access}`;
        return await originalRequest.call(this, endpoint, options);
      } catch (refreshError) {
        // If refresh fails, logout
        window.__REDUX_STORE__?.dispatch(logout());
        throw refreshError;
      }
    }
    throw error;
  }
};