import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupCredentials {
  username: string;
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

// Async thunk for login
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(username, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for signup
export const signupUser = createAsyncThunk<AuthResponse, SignupCredentials>(
  'auth/signup',
  async ({ username, email, password, password_confirm }, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(username, email, password, password_confirm);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
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
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTokens: (state, action) => {
      state.tokens = action.payload;
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
      });
  },
});

export const { logout, clearError, updateTokens } = authSlice.actions;
export default authSlice.reducer;