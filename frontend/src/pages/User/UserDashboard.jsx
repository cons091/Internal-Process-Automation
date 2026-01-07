import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/request.service';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await requestService.getAll();
        setRequests(response.data); 
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center border-l-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-600">Hola, <span className="font-semibold">{user?.name}</span> ({user?.role})</p>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/create-request"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm flex items-center"
            >
              + Nueva Solicitud
            </Link>
            <button
              onClick={logout}
              className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Mis Solicitudes</h2>
          </div>

          {/* Estado de Carga */}
          {loading && (
            <div className="p-10 text-center text-gray-500">
              Cargando tus solicitudes...
            </div>
          )}

          {/* Estado de Error */}
          {error && (
            <div className="p-10 text-center text-red-500 bg-red-50">
              {error}
            </div>
          )}

          {/* Tabla de Datos */}
          {!loading && !error && requests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p className="mb-4">No tienes solicitudes registradas.</p>
              <Link to="/create-request" className="text-blue-600 font-medium hover:underline">
                ¡Crea la primera aquí!
              </Link>
            </div>
          ) : (
            !loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b">ID</th>
                      <th className="p-4 font-semibold border-b">Tipo</th>
                      <th className="p-4 font-semibold border-b">Resumen</th>
                      <th className="p-4 font-semibold border-b">Monto</th>
                      <th className="p-4 font-semibold border-b">Estado</th>
                      <th className="p-4 font-semibold border-b">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-500">#{req.id}</td>
                        <td className="p-4 font-medium text-gray-800">{req.type || 'General'}</td>
                        <td className="p-4 text-gray-600 truncate max-w-xs">{req.description}</td>
                        <td className="p-4 font-mono font-medium text-gray-700">
                          ${Number(req.amount).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full
                            ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {req.status === 'PENDING' ? 'Pendiente' : 
                             req.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;