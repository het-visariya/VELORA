import { apiRequest } from './client';

export const outfitsApi = {
  getSaved: () => apiRequest('GET', '/outfits'),
  saveOutfit: (outfit) => apiRequest('POST', '/outfits', outfit),
  deleteOutfit: (id) => apiRequest('DELETE', `/outfits/${id}`),
};

export default outfitsApi;
