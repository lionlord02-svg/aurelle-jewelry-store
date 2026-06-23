import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
