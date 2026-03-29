import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForgotPasswordResetPasswordMutation } from '@/store/api/authApi';
import AlertMessage from '@/components/ui/alert-message';
import { getApiError } from '@/lib/getApiError';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/resetPasswordSchema';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearOtp } from '@/store/slices/otpSlice';

const ResetPasswordForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const email = useAppSelector((state) => state.otp.email);
  const otp_code = location.state?.otp_code;

  const [resetPassword, { isLoading, error }] =
    useForgotPasswordResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp_code,
      new_password: '',
      new_password_confirmation: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const data = await resetPassword({ email, ...values }).unwrap();
    toast.success(data.message);
    setIsSuccess(true);
    dispatch(clearOtp());
    navigate('/login');
  };

  const messageError = error ? getApiError(error) : null;

  useEffect(() => {
    if ((!email || !otp_code) && !isSubmitting && !isSuccess) {
      navigate('/forgot-password');
    }
  }, [email, otp_code, navigate, isSubmitting, isSuccess]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl mb-8">Reset your password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="new_password">New Password</FieldLabel>
                <Input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.new_password}
                  {...register('new_password')}
                />
                {errors.new_password?.message && (
                  <span className="text-sm text-destructive">
                    {errors.new_password.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="new_password_confirmation">
                  Confirm New Password
                </FieldLabel>
                <Input
                  id="new_password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.new_password_confirmation}
                  {...register('new_password_confirmation')}
                />
                {errors.new_password_confirmation?.message && (
                  <span className="text-sm text-destructive">
                    {errors.new_password_confirmation.message}
                  </span>
                )}
              </Field>

              <Field>
                {messageError && <AlertMessage message={messageError} />}

                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting || isLoading
                    ? 'Resetting...'
                    : 'Reset Password'}
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

export default ResetPasswordForm;
