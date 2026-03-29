import { GalleryVerticalEnd } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LoginSkeleton = () => {
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
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-52 mx-auto" />
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* GitHub button */}
            <Skeleton className="h-9 w-full" />
            {/* Google button */}
            <Skeleton className="h-9 w-full" />

            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-px flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-9 w-full" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>

            <Skeleton className="h-9 w-full" />

            <Skeleton className="h-4 w-44 mx-auto" />
          </CardContent>
        </Card>

        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
    </div>
  );
};

export default LoginSkeleton;
