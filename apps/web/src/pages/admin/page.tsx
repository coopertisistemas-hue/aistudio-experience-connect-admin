import { Navigate } from 'react-router-dom';

// Admin root redirects to dashboard
export default function AdminPage() {
  return <Navigate to="/admin/dashboard" replace />;
}