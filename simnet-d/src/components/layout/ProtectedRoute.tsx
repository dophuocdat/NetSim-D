import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!session) {
    // Lưu lại vị trí cũ để redirect lại sau khi login thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
