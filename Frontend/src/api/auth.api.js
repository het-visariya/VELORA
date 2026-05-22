import { apiRequest } from './client';

export const authApi = {
  login: async (email, password) => {
    const data = await apiRequest('POST', '/auth/login', { email, password });
    if (data.success && data.data?.token) {
      localStorage.setItem('velora_token', data.data.token);
    }
    return data;
  },
  register: async (name, email, password) => {
    const data = await apiRequest('POST', '/auth/register', { name, email, password });
    if (data.success && data.data?.token) {
      localStorage.setItem('velora_token', data.data.token);
    }
    return data;
  },
  logout: () => {
    localStorage.removeItem('velora_token');
    localStorage.removeItem('velora_authenticated');
    localStorage.removeItem('velora_user');
    localStorage.removeItem('velora_view');
  },
};

export default authApi;
