import { useEffect } from 'react';

import {
  setUser,
  clearUser,
  setChecking,
  setAccessToken,
} from '@/store/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetMeQuery, useRefreshTokenMutation } from '@/store/api/authApi';
import Loading from '@/components/ui/loading';

export default function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.user.status);
  const accessToken = useAppSelector((s) => s.user.accessToken);
  const [triggerRefresh] = useRefreshTokenMutation();

  const { data, isError, isSuccess } = useGetMeQuery(undefined, {
    skip: status === 'authenticated' || !accessToken,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (status === 'idle') dispatch(setChecking());
  }, [status, dispatch]);

  useEffect(() => {
    if (!accessToken && status === 'checking') {
      triggerRefresh()
        .unwrap()
        .then((data) => dispatch(setAccessToken(data.response.access_token)))
        .catch(() => dispatch(clearUser()));
    }
  }, [accessToken, dispatch, status, triggerRefresh]);

  useEffect(() => {
    if (isSuccess && data) dispatch(setUser(data.response.user));
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    if (isError && accessToken) dispatch(clearUser());
  }, [isError, accessToken, dispatch]);

  if (status === 'idle' || status === 'checking') {
    return <Loading message="Checking session..." />;
  }

  return <>{children}</>;
}
