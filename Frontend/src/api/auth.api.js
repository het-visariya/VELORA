import { apiRequest } from './client';
import { clearAuthStorage, storeToken } from '../lib/token';

export const authApi = {
  login: async (email, password) => {
    const data = await apiRequest('POST', '/auth/login', { email, password });
    if (data.success && data.data?.token) {
      storeToken(data.data.token);
    }
    return data;
  },
  register: async (name, email, password) => {
    const data = await apiRequest('POST', '/auth/register', { name, email, password });
    if (data.success && data.data?.token) {
      storeToken(data.data.token);
    }
    return data;
  },
  sendGoogleCode: async (email) => {
    return apiRequest('POST', '/auth/google', { email });
  },
  sendAppleCode: async (email) => {
    return apiRequest('POST', '/auth/apple', { email });
  },
  verifySocialCode: async (provider, email, code) => {
    const data = await apiRequest('POST', '/auth/verify', { provider, email, code });
    if (data.success && data.data?.token) {
      storeToken(data.data.token);
    }
    return data;
  },
  logout: () => {
    clearAuthStorage();
  },
};

export default authApi;
