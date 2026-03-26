import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PublicLayout = () => {
  const user = null;
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicLayout;
