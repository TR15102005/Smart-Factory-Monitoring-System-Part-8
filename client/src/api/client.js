const TOKEN_KEY = 'sfm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, password, name) => request('/auth/register', { method: 'POST', body: { email, password, name } }),
  me: () => request('/auth/me'),
  zones: () => request('/zones'),
  live: () => request('/zones/live'),

  workers: () => request('/workers'),
  addWorker: (body) => request('/workers', { method: 'POST', body }),
  updateWorker: (id, body) => request(`/workers/${id}`, { method: 'PATCH', body }),

  robots: () => request('/robots'),
  addRobot: (body) => request('/robots', { method: 'POST', body }),
  updateRobot: (id, body) => request(`/robots/${id}`, { method: 'PATCH', body }),

  incidents: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/incidents${q ? `?${q}` : ''}`);
  },
  incidentStats: () => request('/incidents/stats'),
  reportIncident: (body) => request('/incidents', { method: 'POST', body }),
  resolveIncident: (id) => request(`/incidents/${id}/resolve`, { method: 'POST' }),

  maintenance: () => request('/maintenance'),
  addMaintenance: (body) => request('/maintenance', { method: 'POST', body }),
  updateMaintenance: (id, body) => request(`/maintenance/${id}`, { method: 'PATCH', body }),

  analytics: () => request('/analytics'),
  compliance: () => request('/compliance'),

  reports: () => request('/reports'),
  report: (id) => request(`/reports/${id}`),
  generateReport: (body) => request('/reports', { method: 'POST', body }),

  settings: () => request('/settings'),
  updateSettings: (body) => request('/settings', { method: 'PUT', body }),

  users: () => request('/users'),
  createUser: (body) => request('/users', { method: 'POST', body })
};
