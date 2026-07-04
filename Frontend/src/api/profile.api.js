import { apiRequest } from './client';

export const profileApi = {
  getProfile: () => apiRequest('GET', '/profile'),
  updateProfile: (data) => apiRequest('PUT', '/profile', data),
};

export default profileApi;
