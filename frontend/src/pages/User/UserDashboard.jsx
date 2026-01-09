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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await requestService.getAll(page, limit, searchTerm, statusFilter, typeFilter);

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

    const delayDebounce = setTimeout(() => {
      fetchRequests();
    }, 500);

    return () => clearTimeout(delayDebounce);
    
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* MODAL */}
      {selectedRequestId && (
        <HistoryModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center border-l-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-500">
              Bienvenido, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/create-request"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition"
            >
              + Nueva Solicitud
            </Link>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-medium text-sm border border-transparent hover:border-red-200 px-3 py-2 rounded transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Ej: ID, Descripción..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobada</option>
              <option value="REJECTED">Rechazada</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">Todos</option>
              <option value="VACATION">Vacaciones</option>
              <option value="SICK_LEAVE">Licencia Médica</option>
              <option value="EXPENSES">Gastos</option>
              <option value="TI">Equipamiento TI</option>
            </select>
          </div>
        </div>
        {/* TABLA */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header Tabla */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">Mis Solicitudes</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* THEAD */}
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4 border-b">ID</th>
                  <th className="p-4 border-b">Tipo</th>
                  <th className="p-4 border-b">Resumen</th>
                  <th className="p-4 border-b">Monto</th>
                  <th className="p-4 border-b">Estado</th>
                  <th className="p-4 border-b">Fecha</th>
                  <th className="p-4 border-b text-center">Historial</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">Cargando...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-red-500">{error}</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">No hay registros.</td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="p-4 text-gray-500">#{req.id}</td>
                      <td className="p-4 font-medium text-gray-900">{req.type}</td>
                      <td className="p-4 text-gray-600 truncate max-w-xs" title={req.description}>
                        {req.description}
                      </td>
                      <td className="p-4 font-mono text-gray-700">
                        {Number(req.amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                            req.status === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : req.status === 'APPROVED'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedRequestId(req.id)}
                          className="inline-flex items-center justify-center gap-1
                                   h-8 px-3 rounded-md text-xs font-medium
                                   text-gray-600 bg-gray-100 border border-gray-200
                                   hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200
                                   transition shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Ver Cambios
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {!loading && requests.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-xs text-gray-500">
                Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className={`px-3 py-1 text-xs font-medium rounded border ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={handleNext}
                  disabled={page >= totalPages}
                  className={`px-3 py-1 text-xs font-medium rounded border ${
                    page >= totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;