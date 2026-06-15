import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Agenda } from '@/pages/Agenda';
import { TripDetail } from '@/pages/TripDetail';
import { NotFound } from '@/pages/NotFound';
import { useDriverAuth } from '@/providers/use-driver-auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useDriverAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:bookingId"
        element={
          <ProtectedRoute>
            <TripDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
