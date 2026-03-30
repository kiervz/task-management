import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Page not found
        </h1>

        <p className="text-base text-muted-foreground mb-4">
          We couldn&apos;t find the page you&apos;re looking for
        </p>

        <div className="flex justify-center mt-6">
          <Button
            onClick={() => {
              if (globalThis.history.state?.idx > 0) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Need help?{' '}
          <Link
            to="#"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
