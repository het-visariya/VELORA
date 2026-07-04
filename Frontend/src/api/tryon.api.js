import { apiRequest } from './client.js';

export const saveTryOnSession = (sessionData) =>
  apiRequest('POST', '/tryon/session', sessionData);

export const getLatestSession = () =>
  apiRequest('GET', '/tryon/session/latest');

export const getModelUrls = () =>
  apiRequest('GET', '/tryon/models');

export default { saveTryOnSession, getLatestSession, getModelUrls };
