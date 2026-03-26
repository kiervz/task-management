import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';

const Login = lazy(() => import('./pages/auth/login/Login'));
const Register = lazy(() => import('./pages/auth/register/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<>Loading...</>}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<>404 Page Not Found.</>}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
