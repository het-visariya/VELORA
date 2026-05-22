import { apiRequest } from './client';

export const aiApi = {
  getSuggestions: () => apiRequest('GET', '/ai/suggestions'),
  analyzeStyle: (email) => apiRequest('POST', '/ai/analyze', { email }),
};

export default aiApi;
