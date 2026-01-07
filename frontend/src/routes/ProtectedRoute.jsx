import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Verificando sesión...</div>;

  if (!isAuthenticated) {
    console.log("⛔ No autenticado, redirigiendo a login");
    return <Navigate to="/login" replace />;
  }

  // DEBUG: Ver qué datos tiene el usuario
  console.log("👤 Usuario actual:", user);
  console.log("🔑 Rol del usuario:", user?.role);
  console.log("🛡️ Roles permitidos:", allowedRoles);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`⛔ Acceso denegado. Rol ${user.role} no está en [${allowedRoles}]`);
    
    if (user.role === 'USER' && window.location.pathname === '/user') {
        return <div className="p-10 text-red-500">Error: Tu rol es USER pero el sistema no te deja entrar. Revisa la consola (F12).</div>;
    }

    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/user'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;