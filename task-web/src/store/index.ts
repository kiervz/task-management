import { configureStore } from '@reduxjs/toolkit';
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
import userReducer from './slices/userSlice';
import otpReducer from './slices/otpSlice';

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

export const store = configureStore({
  reducer: {
    user: userReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    otp: persistedOtpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
