import { Navigate } from 'react-router-dom';
import { useTenant } from '@connect/ui';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

/**
 * Guard que verifica se o usuário possui uma das roles permitidas.
 * Se não possuir, redireciona para '/' ou renderiza o fallback (se fornecido).
 */
export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { userRole, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-navy-900 flex items-center justify-center">
            <i className="ri-compass-3-line text-amber-400 text-base"></i>
          </div>
          <div className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-navy-400 text-sm font-light">Verificando permissões...</span>
          </div>
        </div>
      </div>
    );
  }

  const hasRole = userRole !== null && allowedRoles.includes(userRole);

  if (!hasRole) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
