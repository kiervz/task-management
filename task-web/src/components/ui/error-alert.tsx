import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  title: string;
  description: string;
  onRetry: () => void;
}

const ErrorAlert = ({ title, description, onRetry }: ErrorAlertProps) => {
  return (
    <Alert
      variant="destructive"
      className="rounded-xl flex flex-col gap-4 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="text-lg font-medium tracking-tight">
            {title}
          </AlertTitle>
          <AlertDescription className="mt-1 text-sm leading-relaxed opacity-90">
            {description}
          </AlertDescription>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="w-fit gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/20"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </Alert>
  );
};

export default ErrorAlert;
