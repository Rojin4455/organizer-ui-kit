import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';

interface AdminLoginCredentials {
  username: string;
  password: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AdminAuthTokens {
  access: string;
  refresh: string;
}

interface AdminPermissions {
  is_admin: boolean;
  is_super_admin: boolean;
  can_list_users: boolean;
  can_view_personal_organizer: boolean;
  can_view_business_organizer: boolean;
  can_view_rental_organizer: boolean;
  can_view_engagement_letter: boolean;
}

interface AdminAuthResponse {
  message: string;
  user: AdminUser;
  tokens: AdminAuthTokens;
  permissions?: AdminPermissions;
}

interface AdminAuthState {
  user: AdminUser | null;
  permissions: AdminPermissions | null;
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
  
  if (error.responseData) {
    const data = error.responseData;
    
    if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    
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
  
  return error.message || 'An unexpected error occurred';
};

// Async thunk for admin login
export const adminLogin = createAsyncThunk<AdminAuthResponse, AdminLoginCredentials>(
  'adminAuth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.adminLogin(username, password);
      return response;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Check localStorage for existing admin tokens
const getInitialState = (): AdminAuthState => {
  const adminToken = localStorage.getItem('adminAccessToken');
  const adminRefreshToken = localStorage.getItem('adminRefreshToken');
  
  return {
    user: null, // User will be loaded on app init if token exists
    permissions: null,
    tokens: {
      access: adminToken,
      refresh: adminRefreshToken,
    },
    isAuthenticated: !!adminToken,
    loading: false,
    error: null,
  };
};

const initialState: AdminAuthState = getInitialState();

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.user = null;
      state.permissions = null;
      state.tokens = { access: null, refresh: null };
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('adminAccessToken');
        window.localStorage.removeItem('adminRefreshToken');
      }
    },
    clearAdminError: (state) => {
      state.error = null;
    },
    resetAdminLoading: (state) => {
      state.loading = false;
    },
    updateAdminTokens: (state, action) => {
      state.tokens = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions || null;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('adminAccessToken', action.payload.tokens.access);
          window.localStorage.setItem('adminRefreshToken', action.payload.tokens.refresh);
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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

export const { adminLogout, clearAdminError, resetAdminLoading, updateAdminTokens } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;

