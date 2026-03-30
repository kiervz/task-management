import type { ApiResponse } from '@/@types/apiResponse';
import type { User } from '@/@types/user';
import { baseApi } from './baseApi';

type EmailRequest = {
  email: string;
  type?: 'register' | 'forgot_password';
};

type OtpCodeRequest = EmailRequest & {
  otp_code: string;
};

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

export type OAuthProvider = 'github' | 'google';

type ForgotPasswordResetPasswordRequest = OtpCodeRequest & {
  new_password: string;
};

type AuthWithTokenResponse = ApiResponse<{
  user: User;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}>;

type RefreshTokenResponse = ApiResponse<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}>;

export type MeResponse = ApiResponse<{ user: User }>;

type OtpResponse = ApiResponse<null>;

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => {
    const createPostMutation = <Response, Request>(url: string) =>
      build.mutation<Response, Request>({
        query: (body) => ({ url, method: 'POST', body }),
      });

    const createPostMutationWithoutBody = <Response>(url: string) =>
      build.mutation<Response, void>({
        query: () => ({ url, method: 'POST' }),
      });

    return {
      register: build.mutation<ApiResponse<null>, RegisterRequest>({
        query: (body) => ({ url: '/auth/register', method: 'POST', body }),
        invalidatesTags: ['User'],
      }),

      login: build.mutation<AuthWithTokenResponse, LoginRequest>({
        query: (body) => ({ url: '/auth/login', method: 'POST', body }),
        invalidatesTags: ['User'],
      }),

      refreshToken: createPostMutationWithoutBody<RefreshTokenResponse>(
        '/auth/refresh-token',
      ),

      verifyOtp: createPostMutation<AuthWithTokenResponse, OtpCodeRequest>(
        '/auth/register/verify',
      ),

      resendOtp: createPostMutation<OtpResponse, EmailRequest>(
        '/auth/otp/resend',
      ),

      forgotPassword: createPostMutation<OtpResponse, EmailRequest>(
        '/auth/forgot-password',
      ),

      forgotPasswordVerifyOtp: createPostMutation<OtpResponse, OtpCodeRequest>(
        '/auth/forgot-password/verify',
      ),

      forgotPasswordResendOtp: createPostMutation<OtpResponse, EmailRequest>(
        '/auth/forgot-password/resend',
      ),

      forgotPasswordResetPassword: createPostMutation<
        OtpResponse,
        ForgotPasswordResetPasswordRequest
      >('/auth/forgot-password/reset'),

      getMe: build.query<MeResponse, void>({
        query: () => '/auth/me',
        providesTags: ['User'],
      }),

      logout: createPostMutationWithoutBody<ApiResponse<null>>('/auth/logout'),
    };
  },
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useForgotPasswordResendOtpMutation,
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResetPasswordMutation,
  useLogoutMutation,
} = authApi;
