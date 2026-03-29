import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '../../@types/user';

type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated';

type UserState = {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
};

const initialState: UserState = {
  user: null,
  accessToken: null,
  status: 'idle' as AuthStatus,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setChecking(state) {
      state.status = 'checking';
    },

    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },

    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },

    clearUser(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { setChecking, setUser, setAccessToken, clearUser } =
  userSlice.actions;
export default userSlice.reducer;
