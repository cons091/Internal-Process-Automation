import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/request.service';
import HistoryModal from '../../components/HistoryModal.jsx';
import ConfigModal from '../../components/ConfigModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const limit = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await requestService.getAll(page, limit, searchTerm, statusFilter, typeFilter);
      
      if (response.pagination) {
        setRequests(response.data);
        setTotalPages(response.pagination.totalPages);
      } else {
        setRequests(response.data || []); 
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRequests();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setRequests(current =>
      current.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );

    try {
      await requestService.updateStatus(id, newStatus);
    } catch (error) {
      alert('Error al actualizar el estado');
      fetchRequests();
    }
  };

const handleAutoProcess = async (id) => {
    setProcessingId(id);
    try {
      const result = await requestService.autoProcess(id);
      
      if (result.sentTo) {
        console.log(`📧 CONFIRMACIÓN DEL SERVER: Correo enviado a ${result.sentTo}`);
      } else {
        console.warn("⚠️ El servidor dice que el usuario NO tiene email configurado.");
      }
      if (result.status === 'PENDING') {
         alert(`Resultado Automático: SIN CAMBIOS.\nMotivo: ${result.message}`);
      } else {
         const statusText = result.status === 'APPROVED' ? 'APROBADA' : 'RECHAZADA';
         alert(`Resultado Automático: La solicitud fue ${statusText}.\nMotivo: ${result.message}`);
         
         setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === id ? { ...req, status: result.status } : req
          )
        );
      }
      
      fetchRequests();

    } catch (error) {
      console.error(error);
      alert("Error crítico: No se pudo procesar automáticamente.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {showConfig && (
        <ConfigModal onClose={() => setShowConfig(false)} />
      )}

      {selectedRequestId && (
        <HistoryModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
      
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center border-l-4 border-purple-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Portal de Administración</h1>
            <p className="text-gray-500">Gestión de Solicitudes Corporativas</p>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* BOTÓN CONFIGURACIÓN ⚙️ */}
            <button
              onClick={() => setShowConfig(true)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
              title="Configuración del Sistema"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <span className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {user?.name} (ADMIN)
            </span>
 
            <button onClick={logout} className="text-red-600 hover:text-red-800 font-medium text-sm">
              Salir
            </button>
          </div>
        </div>
        {/* BARRA DE FILTROS ADMIN */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar (Usuario/Email)</label>
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
            />
          </div>
        {/* FILTRO POR TIPO */}
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
            >
              <option value="">Todos</option>
              <option value="VACACIONES">Vacaciones</option>
              <option value="LICENCIA">Licencia</option>
              <option value="GASTOS">Gastos</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="REJECTED">Rechazadas</option>
            </select>
          </div>
        </div>
        {/* TABLA */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Solicitante</th>
                <th className="p-4 border-b">Tipo</th>
                <th className="p-4 border-b">Descripción</th>
                <th className="p-4 border-b">Monto</th>
                <th className="p-4 border-b">Estado</th>
                <th className="p-4 border-b text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
               {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    Cargando...
                  </td>
                </tr>
               ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">#{req.id}</td>

                    <td className="p-4 font-medium text-gray-900">
                       {req.user_name || 'Usuario desconocido'}
                    </td>

                    <td className="p-4 text-gray-600">{req.type}</td>

                    <td className="p-4 text-gray-500 truncate max-w-xs" title={req.description}>
                      {req.description}
                    </td>

                    <td className="p-4 font-mono">
                      {Number(req.amount).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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

                    {/* ACCIONES */}
                    <td className="p-4">
                       <div className="flex justify-center gap-2">
                        {/* HISTORIAL */}
                        <button
                          onClick={() => setSelectedRequestId(req.id)}
                          title="Ver historial"
                          className="inline-flex items-center justify-center gap-1
                                     h-8 min-w-[90px] px-2 rounded-md text-xs
                                     text-gray-600 bg-gray-100
                                     hover:bg-blue-100 hover:text-blue-700
                                     transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Historial
                        </button>

                       {req.status === 'PENDING' ? (
                          <>
                            {/* BOTÓN AUTO */}
                            <button
                              onClick={() => handleAutoProcess(req.id)}
                              disabled={processingId === req.id}
                              className={`inline-flex items-center justify-center gap-1
                                          h-8 min-w-[90px] px-2 rounded-md text-xs
                                          text-white transition
                                          ${processingId === req.id 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-purple-600 hover:bg-purple-700'
                                          }`}
                                          
                            >
                              {processingId === req.id ? (
                                /* ESTADO CARGANDO */
                                <>
                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                  </svg>
                                </>
                              ) : (
                                /* ESTADO NORMAL */
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Auto
                                </>
                              )}
                            </button>

                            {/* APROBAR */}
                            <button
                              onClick={() => handleStatusChange(req.id, 'APPROVED')}
                              className="inline-flex items-center justify-center gap-1
                                         h-8 min-w-[90px] px-2 rounded-md text-xs
                                         bg-green-500 hover:bg-green-600
                                         text-white transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                               </svg>
                              Aprobar
                            </button>

                            {/* RECHAZAR */}
                             <button
                              onClick={() => handleStatusChange(req.id, 'REJECTED')}
                              className="inline-flex items-center justify-center gap-1
                                         h-8 min-w-[90px] px-2 rounded-md text-xs
                                         bg-red-500 hover:bg-red-600
                                         text-white transition"
                             >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rechazar
                             </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Procesada
                          </span>
                        )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
         </div>
         {/* PAGINACIÓN ADMIN */}
          {!loading && requests.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-xs text-gray-500">
                Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
  );
};

export default AdminDashboard;