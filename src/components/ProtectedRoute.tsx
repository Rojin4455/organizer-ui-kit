import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to /onboard if required and the user is nowhere near onboard
  if (user?.onboard_required && location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;