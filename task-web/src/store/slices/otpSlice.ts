import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface OtpState {
  email: string;
}

const initialState: OtpState = {
  email: '',
};

const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    setOtpEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    clearOtp() {
      return initialState;
    },
  },
});

export const { setOtpEmail, clearOtp } = otpSlice.actions;

export default otpSlice.reducer;
