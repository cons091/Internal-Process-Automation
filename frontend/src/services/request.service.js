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
  }
};