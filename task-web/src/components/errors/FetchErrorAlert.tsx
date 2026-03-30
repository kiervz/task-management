import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import ErrorAlert from '@/components/ui/error-alert';

interface FetchErrorAlertProps {
  title: string;
  description: string;
  onRetry: () => void;
  error: Error | FetchBaseQueryError | SerializedError | undefined;
}

const FetchErrorAlert = ({
  title,
  description,
  onRetry,
  error,
}: FetchErrorAlertProps) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : `Something went wrong while fetching your ${title.toLowerCase()}. Please try again.`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <ErrorAlert
        title={`Failed to load ${title.toLowerCase()}`}
        description={errorMessage}
        onRetry={onRetry}
      />
    </div>
  );
};

export default FetchErrorAlert;
