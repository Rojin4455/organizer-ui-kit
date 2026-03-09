import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import adminAuthSlice from './adminAuthSlice';
import { authMiddleware } from '../middleware/authMiddleware';

// Only persist auth data needed for session restore — never persist loading/error
// so rehydration can't leave the login button stuck in "Signing in..."
function createAuthSubsetTransform(
  keys: ('user' | 'tokens' | 'isAuthenticated' | 'permissions')[]
) {
  return createTransform(
    (inboundState: Record<string, unknown>) => {
      if (!inboundState || typeof inboundState !== 'object') return inboundState;
      const out: Record<string, unknown> = {};
      keys.forEach((k) => {
        if (k in inboundState) out[k] = inboundState[k];
      });
      return out;
    },
    (outboundState) => outboundState,
    { whitelist: ['auth'] }
  );
}
function createAdminAuthSubsetTransform(
  keys: ('user' | 'tokens' | 'isAuthenticated' | 'permissions')[]
) {
  return createTransform(
    (inboundState: Record<string, unknown>) => {
      if (!inboundState || typeof inboundState !== 'object') return inboundState;
      const out: Record<string, unknown> = {};
      keys.forEach((k) => {
        if (k in inboundState) out[k] = inboundState[k];
      });
      return out;
    },
    (outboundState) => outboundState,
    { whitelist: ['adminAuth'] }
  );
}

const authPersistTransform = createAuthSubsetTransform(['user', 'tokens', 'isAuthenticated']);
const adminAuthPersistTransform = createAdminAuthSubsetTransform(['user', 'permissions', 'tokens', 'isAuthenticated']);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'adminAuth'],
  transforms: [authPersistTransform, adminAuthPersistTransform],
};

const rootReducer = combineReducers({
  auth: authSlice,
  adminAuth: adminAuthSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).prepend(authMiddleware.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;