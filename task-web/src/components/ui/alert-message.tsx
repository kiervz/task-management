import { AlertCircle, CircleCheck } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

export type AlertMessageType = {
  code?: number;
  type: 'success' | 'error';
  text: string;
} | null;

type AlertMessageProps = {
  message: AlertMessageType;
  className?: string;
};

const AlertMessage = ({ message, className }: AlertMessageProps) => {
  if (!message) return null;

  return (
    <Alert
      variant={message.type === 'error' ? 'destructive' : 'default'}
      className={className}
    >
      {message.type === 'error' ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <CircleCheck className="h-4 w-4" />
      )}
      <AlertDescription>{message.text}</AlertDescription>
    </Alert>
  );
};

export default AlertMessage;
