import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ adminOnly = false, children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}