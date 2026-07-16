import { Navigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'donor') {
      return <Navigate to="/donor" replace />;
    } else if (user?.role === 'claimer') {
      return <Navigate to="/claimer" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}