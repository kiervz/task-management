import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import AppLayout from './layouts/AppLayout';
import Loading from './components/ui/loading';
import NotFound from './components/ui/not-found';

const Login = lazy(() => import('./pages/auth/login/Login'));
const Register = lazy(() => import('./pages/auth/register/Register'));
const Otp = lazy(() => import('./pages/auth/otp/Otp'));
const ForgotPassword = lazy(
  () => import('./pages/forgot-password/ForgotPassword'),
);
const VerifyPasswordOTP = lazy(
  () => import('./pages/forgot-password/verify/VerifyPasswordOTP'),
);
const ResetPassword = lazy(
  () => import('./pages/forgot-password/reset/ResetPassword'),
);
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading message="Checking session..." />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/forgot-password/verify"
              element={<VerifyPasswordOTP />}
            />
            <Route path="/forgot-password/reset" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Route>
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<>Projects</>} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
