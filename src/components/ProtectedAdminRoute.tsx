import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protects admin routes: only admin-authenticated users may access.
 * If the user is logged in as a normal user (not admin), they are redirected
 * to the user dashboard so they cannot access admin side from the frontend.
 */
const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const isUserAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const isAdminAuthenticated = useSelector((state: any) => state.adminAuth.isAuthenticated);

  // Logged in as normal user but not admin — restrict access to admin
  if (isUserAuthenticated && !isAdminAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/atg-admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;

