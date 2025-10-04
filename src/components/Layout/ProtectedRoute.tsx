import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireRole?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireRole,
  fallbackPath = '/auth/login',
}) => {
  const { state: { user, isLoading } } = useApp();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" text="Checking access..." />
      </div>
    );
  }

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // Check if user has specific role
  const hasRole = (role: string) => user?.role === role;

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Redirect if admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <Navigate
        to="/"
        state={{ from: location }}
        replace
      />
    );
  }

  // Redirect if specific role is required but user doesn't have it
  if (requireRole && !hasRole(requireRole)) {
    return (
      <Navigate
        to="/"
        state={{ from: location }}
        replace
      />
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

// Higher Order Component for protected routes
export const withProtection = <P extends object>(
  Component: React.ComponentType<P>,
  options: ProtectedRouteProps = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Admin-only route component
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth requireAdmin fallbackPath="/">
      {children}
    </ProtectedRoute>
  );
};

// Auth-only route component (no admin requirement)
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth fallbackPath="/auth/login">
      {children}
    </ProtectedRoute>
  );
};

// Public-only route (redirects if already authenticated)
export const PublicRoute: React.FC<{ children: React.ReactNode; fallbackPath?: string }> = ({
  children,
  fallbackPath = '/',
}) => {
  const { state: { user, isLoading } } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (user) {
    const from = location.state?.from?.pathname || fallbackPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;