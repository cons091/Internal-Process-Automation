import api from '../api/axios';

export const requestService = {
  // Obtener solicitudes (Soporta tu paginación backend)
  getAll: async (page = 1, limit = 10) => {
    // GET /api/requests?page=1&limit=10
    const response = await api.get(`/requests?page=${page}&limit=${limit}`);
    return response.data; // Retorna { data: [], pagination: {} }
  },

  // Crear solicitud
  create: async (data) => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  // Actualizar estado (Solo Admin)
  updateStatus: async (id, status) => {
    const response = await api.put(`/requests/${id}/status`, { status });
    return response.data;
  },

  // Obtener historial de una solicitud
  getHistory: async (id) => {
    const response = await api.get(`/requests/${id}/history`);
    return response.data;
  },
  autoProcess: async (id) => {
    // Llama a la ruta POST /api/requests/:id/auto-process
    const response = await api.post(`/requests/${id}/auto-process`);
    return response.data;
  },

  getSystemConfig: async () => {
    const response = await api.get('/requests/system/config');
    return response.data;
  },

  updateSystemConfig: async (key, newValue) => {
    const response = await api.put(`/requests/system/config/${key}`, { value: newValue });
    return response.data;
  }
};