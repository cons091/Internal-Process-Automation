import { useEffect, useState } from 'react';
import { requestService } from '../services/request.service';

const ConfigModal = ({ onClose }) => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null); // Para mostrar carga en el botón específico

  // Cargar reglas al abrir
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await requestService.getSystemConfig();
        setConfigs(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar configuraciones");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Manejar cambio en los inputs (Estado local)
  const handleChange = (key, newValue) => {
    setConfigs(prev => prev.map(item => 
      item.key === key ? { ...item, value: newValue } : item
    ));
  };

  // Guardar cambio en el Backend
  const handleSave = async (key, value) => {
    setSavingKey(key);
    try {
      await requestService.updateSystemConfig(key, value);
      alert("Regla actualizada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert("Error al guardar la regla ❌");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            ⚙️ Configuración del Sistema
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-10">Cargando reglas...</div>
          ) : (
            <div className="space-y-6">
              {configs.map((config) => (
                <div key={config.key} className="flex flex-col sm:flex-row sm:items-end gap-4 border-b border-gray-100 pb-4 last:border-0">
                  
                  {/* Descripción y Clave */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {config.description || config.key}
                    </label>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {config.key}
                    </span>
                  </div>

                  {/* Input y Botón */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={config.value}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      className="w-32 border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSave(config.key, config.value)}
                      disabled={savingKey === config.key}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                    >
                      {savingKey === config.key ? '...' : 'Guardar'}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-right">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-medium text-sm px-4"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfigModal;