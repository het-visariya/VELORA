import { apiRequest } from './client';

export const closetApi = {
  getItems: () => apiRequest('GET', '/closet'),
  addItem: (item) => apiRequest('POST', '/closet', item),
  deleteItem: (id) => apiRequest('DELETE', `/closet/${id}`),
};

export default closetApi;
