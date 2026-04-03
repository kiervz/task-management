import { configureStore, type Middleware } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { baseApi } from './api/baseApi';
import userReducer, { clearUser, setUser } from './slices/userSlice';
import otpReducer from './slices/otpSlice';
import projectReducer from './slices/projectSlice';

const storageSession = {
  getItem: (key: string) => {
    return Promise.resolve(sessionStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    sessionStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
    return Promise.resolve();
  },
};

const otpPersistConfig = {
  key: 'otp',
  storage: storageSession,
  whitelist: ['email'],
};

const persistedOtpReducer = persistReducer(otpPersistConfig, otpReducer);

const resetApiCacheOnLogout: Middleware = (storeApi) => (next) => (action) => {
  const prevUserId = (storeApi.getState() as RootState).user.user?.id;
  const result = next(action);
  const nextUserId = (storeApi.getState() as RootState).user.user?.id;

  if (clearUser.match(action)) {
    storeApi.dispatch(baseApi.util.resetApiState());
  }

  if (setUser.match(action) && prevUserId && prevUserId !== nextUserId) {
    storeApi.dispatch(baseApi.util.resetApiState());
  }

  return result;
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    otp: persistedOtpReducer,
    project: projectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware, resetApiCacheOnLogout),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
