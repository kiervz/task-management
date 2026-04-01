import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import AlertMessage, {
  type AlertMessageType,
} from '@/components/ui/alert-message';
import { Spinner } from '@/components/ui/spinner';
import { getApiError } from '@/lib/getApiError';
import { cn } from '@/lib/utils';
import { useConfirmProjectInviteMutation } from '@/store/api/projectApi';

type InviteDecisionProps = {
  action: 'accept' | 'reject';
};

export default function InviteDecision({
  action,
}: Readonly<InviteDecisionProps>) {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')?.trim() ?? '';

  const [confirmInvite, { isLoading, isSuccess, data }] =
    useConfirmProjectInviteMutation();
  const [message, setMessage] = useState<AlertMessageType>(null);

  const actionLabel = action === 'accept' ? 'Accept' : 'Reject';
  const heading =
    action === 'accept'
      ? 'Accept project invitation'
      : 'Reject project invitation';

  const invalidQueryMessage = useMemo<AlertMessageType>(() => {
    if (code) return null;

    return {
      type: 'error',
      text: 'Missing invite code. Please use the invitation link from your email.',
    };
  }, [code]);

  const displayedMessage = message ?? invalidQueryMessage;

  const submitInviteDecision = useCallback(async () => {
    if (!code) return;

    try {
      const result = await confirmInvite({ code, action }).unwrap();
      setMessage({
        type: 'success',
        text: result.message,
      });
    } catch (error) {
      setMessage(getApiError(error));
    }
  }, [action, code, confirmInvite]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{heading}</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Processing your invitation...'
              : 'Click below to confirm your invitation response.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <AlertMessage message={displayedMessage} />

          {!displayedMessage && isLoading && (
            <div className="flex items-center justify-center py-3">
              <Spinner className="size-6" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!isSuccess && (
              <Button
                onClick={() => void submitInviteDecision()}
                disabled={!code || isLoading}
              >
                {isLoading ? 'Please wait...' : `${actionLabel} invite`}
              </Button>
            )}

            <Link
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              to={isSuccess ? `/projects/${data?.response.project_code}` : '/'}
            >
              {isSuccess ? 'Go to project' : 'Go to dashboard'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
