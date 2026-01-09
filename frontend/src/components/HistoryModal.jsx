import React, { useEffect, useState } from 'react';
import { requestService } from '../services/request.service';

const HistoryModal = ({ requestId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await requestService.getHistory(requestId);
        setHistory(data);
      } catch (error) {
        console.error("Error cargando historial", error);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) fetchHistory();
  }, [requestId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Historial de Cambios</h3>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No hay registros de cambios.</div>
          ) : (
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
              {history.map((item) => (
                <div key={item.id} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center flex-wrap gap-2">
                      {item.previous_status && (
                        <>
                          <span className="text-xs font-semibold text-gray-400 line-through">
                            {item.previous_status}
                          </span>
                          <span className="text-gray-400">➜</span>
                        </>
                      )}
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      {item.changed_at ? new Date(item.changed_at).toLocaleString() : ''}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 border-t pt-2 mt-2 flex justify-between items-center">
                    <div>
                      <span className="text-gray-400 text-xs block">Modificado por:</span>
                      <span className="font-medium text-gray-800">{item.changed_by_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-xs block">Rol:</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                        {item.changed_by_role}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;