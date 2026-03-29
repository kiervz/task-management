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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import AlertMessage from '@/components/ui/alert-message';
import { getApiError } from '@/lib/getApiError';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgotPasswordSchema';
import { useAppDispatch } from '@/store/hooks';
import { setOtpEmail } from '@/store/slices/otpSlice';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await forgotPassword(values).unwrap();

    dispatch(setOtpEmail(values.email));
    navigate('/forgot-password/verify');
  };

  const message = error ? getApiError(error) : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a verification code
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
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
                {message && <AlertMessage message={message} />}

                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting || isLoading ? 'Sending...' : 'Send Code'}
                </Button>

                <FieldDescription className="text-center">
                  Remember your password? <Link to="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
