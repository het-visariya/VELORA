const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiRequest(method = 'GET', endpoint, body = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  const token = localStorage.getItem('velora_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
}

export default apiRequest;
