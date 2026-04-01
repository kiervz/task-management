import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

const PublicLayout = () => {
  const user = useAppSelector((state) => state.user.user);
  const location = useLocation();

  const from = location.state?.from;
  const redirectTo = from
    ? `${from.pathname ?? '/'}${from.search ?? ''}${from.hash ?? ''}`
    : '/';

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicLayout;
