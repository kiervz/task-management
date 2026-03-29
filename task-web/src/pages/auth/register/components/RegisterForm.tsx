import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import AlertMessage from '@/components/ui/alert-message';
import { useRegisterMutation } from '@/store/api/authApi';
import {
  registerSchema,
  type RegisterFormValues,
} from '../schemas/registerSchema';
import { setOtpEmail } from '@/store/slices/otpSlice';
import { Icons } from '@/lib/Icons';
import { Spinner } from '@/components/ui/spinner';
import { getApiError } from '@/lib/getApiError';
import { useAppDispatch } from '@/store/hooks';

export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const [socialProvider, setSocialProvider] = useState<
    'github' | 'google' | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await registerUser(values).unwrap();
    dispatch(setOtpEmail(values.email));
    navigate('/otp');
  };

  const handleSocialLogin = (provider: 'github' | 'google') => {
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
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Sign up with your GitHub/Google account or continue with email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-4">
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={!!socialProvider}
                  onClick={() => handleSocialLogin('github')}
                >
                  {socialProvider === 'github' ? <Spinner /> : <Icons.Github />}
                  Sign up with GitHub
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={!!socialProvider}
                  onClick={() => handleSocialLogin('google')}
                >
                  {socialProvider === 'google' ? <Spinner /> : <Icons.Google />}
                  Sign up with Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name?.message && (
                  <span className="text-sm text-destructive">
                    {errors.name.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
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
                <FieldLabel htmlFor="password_confirmation">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password_confirmation}
                  {...register('password_confirmation')}
                />
                {errors.password_confirmation?.message && (
                  <span className="text-sm text-destructive">
                    {errors.password_confirmation.message}
                  </span>
                )}
              </Field>

              <Field>
                {message && <AlertMessage message={message} />}

                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Sign in</Link>
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
}
