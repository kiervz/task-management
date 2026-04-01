import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { useLoginMutation, type OAuthProvider } from '@/store/api/authApi';
import { Icons } from '@/lib/Icons';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch } from '@/store/hooks';
import { setAccessToken, setUser } from '@/store/slices/userSlice';
import { getApiError } from '@/lib/getApiError';
import { setOtpEmail } from '@/store/slices/otpSlice';
import AlertMessage from '@/components/ui/alert-message';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const [socialProvider, setSocialProvider] = useState<OAuthProvider | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const from = location.state?.from;
  const fromUrl = from
    ? `${from.pathname ?? '/'}${from.search ?? ''}${from.hash ?? ''}`
    : '/';

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await login(values).unwrap();
      dispatch(setAccessToken(data.response.access_token));
      dispatch(setUser(data.response.user));
      navigate(fromUrl, { replace: true });
    } catch (err) {
      const fetchError = err as {
        status?: number;
        data?: { message?: string };
      };

      if (fetchError?.status === 403) {
        dispatch(setOtpEmail(values.email));
        toast.error(fetchError.data?.message ?? 'Email is not verified.');
        navigate('/otp');
        return;
      }

      const error = getApiError(err);
      toast.error(error?.text);
    }
  };

  const handleSocialLogin = (provider: OAuthProvider) => {
    setSocialProvider(provider);
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string).replace(
      /\/+$/,
      '',
    );

    globalThis.window.location.assign(
      `${apiBaseUrl}/auth/${provider}/redirect`,
    );
  };

  const message = error ? getApiError(error) : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={!!socialProvider}
                  onClick={() => handleSocialLogin('github')}
                >
                  {socialProvider === 'github' ? <Spinner /> : <Icons.Github />}
                  Login with GitHub
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={!!socialProvider}
                  onClick={() => handleSocialLogin('google')}
                >
                  {socialProvider === 'google' ? <Spinner /> : <Icons.Google />}
                  Login with Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="text"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email?.message && (
                  <span className="text-sm text-destructive">
                    {errors.email.message}
                  </span>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password?.message && (
                  <span className="text-sm text-destructive">
                    {errors.password.message}
                  </span>
                )}
              </Field>

              <Field>
                {message && <AlertMessage message={message} />}

                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Link to="/register">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <Link to="#">Terms of Service</Link> and{' '}
        <Link to="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
};

export default LoginForm;
