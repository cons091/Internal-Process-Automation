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

  // Cargar solicitudes
  const fetchRequests = async () => {
    try {
      const response = await requestService.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Aprobar / Rechazar
  const handleStatusChange = async (id, newStatus) => {
    // UI optimista
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
    try {
      const result = await requestService.autoProcess(id);
      
      // Lógica de visualización del resultado
      if (result.status === 'PENDING') {
         // El sistema analizó pero no tomó acción
         alert(`Resultado Automático: SIN CAMBIOS.\nMotivo: ${result.message}`);
      } else {
         // El sistema tomó una decisión (Aprobó o Rechazó)
         const statusText = result.status === 'APPROVED' ? 'APROBADA' : 'RECHAZADA';
         alert(`Resultado Automático: La solicitud fue ${statusText} por el sistema.\nMotivo: ${result.message}`);
         
         // Actualizar estado localmente
         setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === id ? { ...req, status: result.status } : req
          )
        );
      }
      
      // Siempre refrescar la tabla para traer datos frescos de la DB
      fetchRequests();

    } catch (error) {
      console.error(error);
      alert("Error crítico: No se pudo procesar automáticamente.");
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
                              title="Validar reglas automáticas"
                              className="inline-flex items-center justify-center gap-1
                                         h-8 min-w-[90px] px-2 rounded-md text-xs
                                         bg-purple-600 hover:bg-purple-700
                                         text-white transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Auto
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
      </div>
    </div>
  );
};

export default AdminDashboard;