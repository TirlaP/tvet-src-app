import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If admin access is required, check if user is admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} />;
  }

  // If regular user access is required, check if user is authenticated
  if (!requireAdmin && !currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // If authentication checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
