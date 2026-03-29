import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { toast } from 'sonner';

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResendOtpMutation,
} from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AlertMessage from '@/components/ui/alert-message';
import { getApiError } from '@/lib/getApiError';
import { setOtpEmail } from '@/store/slices/otpSlice';
import {
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from '../schemas/verifyOtpSchema';

const VerifyPasswordOTPForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const email = useAppSelector((state) => state.otp.email);

  const [
    verifyOtp,
    { isLoading, error: verifyError, reset: resetVerifyError },
  ] = useForgotPasswordVerifyOtpMutation();
  const [
    resendOtp,
    { isLoading: isResendLoading, error: resendError, reset: resetResendError },
  ] = useForgotPasswordResendOtpMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp_code: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: VerifyOtpFormValues) => {
    clearErrorMessage();
    const data = await verifyOtp({ email, ...values }).unwrap();

    toast.success(data.message);

    dispatch(setOtpEmail(email));
    navigate('/forgot-password/reset', {
      state: { otp_code: values.otp_code },
    });
  };

  const onResendCode = async () => {
    clearErrorMessage();
    const data = await resendOtp({ email }).unwrap();

    toast.success(data.message);
  };

  const clearErrorMessage = () => {
    resetVerifyError();
    resetResendError();
  };

  const messageError =
    verifyError || resendError ? getApiError(verifyError || resendError) : null;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to {email}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <div className="flex justify-center">
                  <FieldLabel htmlFor="otp_code">Verification Code</FieldLabel>
                </div>
                <Controller
                  name="otp_code"
                  control={control}
                  render={({ field }) => (
                    <div className="flex justify-center">
                      <InputOTP
                        id="otp_code"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="h-9 w-8 text-base sm:h-12 sm:w-11 sm:text-xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  )}
                />
                {errors.otp_code?.message && (
                  <span className="text-sm text-center text-destructive">
                    {errors.otp_code.message}
                  </span>
                )}
              </Field>

              <Field>
                {messageError && <AlertMessage message={messageError} />}

                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting || isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <FieldDescription className="text-center">
                  Didn&apos;t receive a code?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={onResendCode}
                    disabled={isResendLoading}
                  >
                    Resend
                  </Button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPasswordOTPForm;
