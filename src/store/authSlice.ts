import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  onboard_required?: boolean;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

interface AuthState {
  user: User | null;
  tokens: {
    access: string | null;
    refresh: string | null;
  };
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }

  // If error has responseData (from our API service)
  if (error.responseData) {
    const data = error.responseData;

    // Check for non_field_errors
    if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }

    // Check for field-specific errors
    const errorKeys = Object.keys(data);
    if (errorKeys.length > 0) {
      const allErrors: string[] = [];
      errorKeys.forEach(key => {
        const fieldErrors = data[key];
        if (Array.isArray(fieldErrors)) {
          allErrors.push(...fieldErrors);
        } else if (typeof fieldErrors === 'string') {
          allErrors.push(fieldErrors);
        }
      });

      if (allErrors.length > 0) {
        return allErrors.join(' ');
      }
    }
  }

  // Fallback
  return error.message || 'An unexpected error occurred';
};

// Async thunk for login
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(email, password);
      return response;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for signup
export const signupUser = createAsyncThunk<AuthResponse, SignupCredentials>(
  'auth/signup',
  async ({ first_name, last_name, email, password, password_confirm }, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(first_name, last_name, email, password, password_confirm);
      return response;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for token refresh
export const refreshToken = createAsyncThunk<{ tokens: AuthTokens }, void, { state: { auth: AuthState } }>(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiService.refreshToken(auth.tokens.refresh);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: AuthState = {
  user: null,
  tokens: {
    access: null,
    refresh: null,
  },
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('refreshToken');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLoading: (state) => {
      state.loading = false;
    },
    updateTokens: (state, action) => {
      state.tokens = action.payload;
    },
    completeOnboarding: (state) => {
      if (state.user) {
        state.user.onboard_required = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        // Sync tokens to localStorage so API service and refresh flow work
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('accessToken', action.payload.tokens.access);
          window.localStorage.setItem('refreshToken', action.payload.tokens.refresh);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('accessToken', action.payload.tokens.access);
          window.localStorage.setItem('refreshToken', action.payload.tokens.refresh);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.isAuthenticated = false;
      })
      // Reset transient state when rehydrating (prevents stuck "Signing in..." from persisted state)
      .addMatcher(
        (action): action is { type: string; key: string } =>
          action.type === 'persist/REHYDRATE' && (action as any).key === 'root',
        (state) => {
          state.loading = false;
          state.error = null;
        }
      );
  },
});

export const { logout, clearError, resetLoading, updateTokens, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;