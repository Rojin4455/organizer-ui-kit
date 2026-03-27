import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { CROSS_APP_LOGOUT_PARAM } from '../constants/crossAppAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const sp = new URLSearchParams(location.search);
    const x = sp.get(CROSS_APP_LOGOUT_PARAM);
    const loginSearch =
      x !== null ? `?${CROSS_APP_LOGOUT_PARAM}=${encodeURIComponent(x || '1')}` : '';
    return <Navigate to={`/login${loginSearch}`} replace />;
  }

  // Redirect to /onboard if required and the user is nowhere near onboard
  if (user?.onboard_required && location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;