import { apiRequest } from './client';

export const plannerApi = {
  getEvents: () => apiRequest('GET', '/planner/events'),
  addEvent: (event) => apiRequest('POST', '/planner/events', event),
  deleteEvent: (id) => apiRequest('DELETE', `/planner/events/${id}`),
};

export default plannerApi;
