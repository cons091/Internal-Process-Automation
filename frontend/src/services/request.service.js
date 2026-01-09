import api from '../api/axios';

export const requestService = {
  getAll: async (page = 1, limit = 10, search = '', status = '', type = '') => {
    const params = new URLSearchParams({
      page,
      limit
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (type) params.append('type', type);

    const response = await api.get(`/request?${params.toString()}`);
    return response.data;
  },

  // CREAR SOLICITUD
  create: async (data) => {
    const response = await api.post('/request', data);
    return response.data;
  },

  // ACTUALIZAR ESTADO DE SOLICITUD
  updateStatus: async (id, status) => {
    const response = await api.put(`/request/${id}/status`, { status });
    return response.data;
  },

  // OBTENER HISTORIAL DE UNA SOLICITUD
  getHistory: async (id) => {
    const response = await api.get(`/request/${id}/history`);
    return response.data;
  },
  autoProcess: async (id) => {
    const response = await api.post(`/request/${id}/auto-process`);
    return response.data;
  },

  getSystemConfig: async () => {
    const response = await api.get('/request/system/config');
    return response.data;
  },

  updateSystemConfig: async (key, newValue) => {
    const response = await api.put(`/request/system/config/${key}`, { value: newValue });
    return response.data;
  }
};