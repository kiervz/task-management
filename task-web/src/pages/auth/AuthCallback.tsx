import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetMeQuery } from '@/store/api/authApi';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { data, isSuccess } = useGetMeQuery();

  useEffect(() => {
    if (isSuccess && data?.response?.user) {
      navigate('/');
    }
  }, [isSuccess, data, navigate]);

  return null;
}
