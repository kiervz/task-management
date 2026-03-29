import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '../store/hooks';
import { Spinner } from '@/components/ui/spinner';

const PrivateLayout = () => {
  const { user, status } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (status === 'idle' || status === 'checking') {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Spinner className="size-8" />
        <p className="p-4 text-sm text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PrivateLayout;
