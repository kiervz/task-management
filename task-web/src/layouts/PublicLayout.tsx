import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

const PublicLayout = () => {
  const user = useAppSelector((state) => state.user.user);
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicLayout;
