import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const useAdmin = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.user) {
      navigate('/login');
      return;
    }

    if (state.user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [state.user, navigate]);

  return { user: state.user, isAdmin: state.user?.role === 'admin' };
};