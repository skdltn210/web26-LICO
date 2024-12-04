import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/useAuthStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AuthRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(-1);
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return children;
}
