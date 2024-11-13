import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ClipLoader } from 'react-spinners';

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader size={50} color="#123abc" loading={loading} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/dashboard/home" replace />;
  }

  return children;
}

