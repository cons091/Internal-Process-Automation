import api from '../api/axios';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Retorna { token, user }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export default authService;