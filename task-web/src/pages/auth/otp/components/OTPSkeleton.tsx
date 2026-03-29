import { GalleryVerticalEnd } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const OtpSkeleton = () => {
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
            <Skeleton className="h-6 w-36 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-4 w-32" />

              {/* OTP slots */}
              <div className="flex gap-2">
                {[...new Array(6)].map((_, i) => (
                  <Skeleton
                    key={`otp-input-${i}`}
                    className="h-9 w-8 sm:h-12 sm:w-11 rounded-md"
                  />
                ))}
              </div>
            </div>

            <Skeleton className="h-9 w-full" />

            <Skeleton className="h-4 w-48 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OtpSkeleton;
