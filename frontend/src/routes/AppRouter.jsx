import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import UserDashboard from '../pages/User/UserDashboard';
import CreateRequest from '../pages/User/CreateRequest';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import NotFoundPage from '../pages/NotFoundPage'; // <--- Importamos el nuevo archivo

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
      
      {/* Ruta 404 para cualquier URL desconocida */}
      <Route path="*" element={<NotFoundPage />} /> 
    </Routes>
  );
};

export default AppRouter;