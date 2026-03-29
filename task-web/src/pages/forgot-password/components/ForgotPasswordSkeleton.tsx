import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GalleryVerticalEnd } from 'lucide-react';

export default function ForgotPasswordSkeleton() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>

        <Card>
          <CardHeader className="text-center gap-2">
            <Skeleton className="h-6 w-44 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-9 w-full rounded-md" />

            {/* Sign in link */}
            <Skeleton className="h-4 w-48 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
