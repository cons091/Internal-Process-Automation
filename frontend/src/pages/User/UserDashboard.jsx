import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/request.service';
import HistoryModal from '../../components/HistoryModal.jsx';


const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await requestService.getAll(page, limit);

        if (response.pagination) {
          setRequests(response.data);
          setTotalPages(response.pagination.totalPages);
        } else {
          setRequests(response.data || []);
          const total = response.total || 0;
          setTotalPages(Math.ceil(total / limit));
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las solicitudes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page]);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* MODAL */}
      {selectedRequestId && (
        <HistoryModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center border-l-4 border-blue-600">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-600">
            Hola, <span className="font-semibold">{user?.name}</span> ({user?.role})
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/create-request"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
          >
            + Nueva Solicitud
          </Link>
          <button
            onClick={logout}
            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-md border border-red-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Mis Solicitudes</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No hay registros en esta página.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="p-4 border-b">ID</th>
                    <th className="p-4 border-b">Tipo</th>
                    <th className="p-4 border-b">Resumen</th>
                    <th className="p-4 border-b">Monto</th>
                    <th className="p-4 border-b">Estado</th>
                    <th className="p-4 border-b">Fecha</th>
                    <th className="p-4 border-b text-center">Historial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500">#{req.id}</td>
                      <td className="p-4 font-medium">{req.type}</td>
                      <td className="p-4 text-gray-600 truncate max-w-xs">
                        {req.description}
                      </td>
                      <td className="p-4 font-mono">
                        ${Number(req.amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full
                            ${
                              req.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : req.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedRequestId(req.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          Ver Cambios
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold">{page}</span> de{' '}
                <span className="font-semibold">{totalPages || 1}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className={`px-4 py-2 text-sm rounded-md border ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={handleNext}
                  disabled={page >= totalPages}
                  className={`px-4 py-2 text-sm rounded-md border ${
                    page >= totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
