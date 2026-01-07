import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import UserDashboard from '../pages/User/UserDashboard';

// --- PLACEHOLDERS (Componentes temporales para evitar que la app se rompa) ---
// Una vez crees los archivos reales en /pages, borra esto y haz los imports arriba.
const AdminDashboard = () => <div className="p-10"><h1>Panel de Administrador (Pendiente)</h1></div>;
const CreateRequest = () => <div className="p-10"><h1>Nueva Solicitud (Pendiente)</h1></div>;
const NotFound = () => <div className="p-10"><h1>404 - Página no encontrada</h1></div>;
// --------------------------------------------------------------------------

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Protegidas - ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Rutas Protegidas - USER */}
      <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;