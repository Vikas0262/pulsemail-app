const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof data === 'string' ? data : data.error || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

export const api = {
  signup: (body: { accountName: string; email: string; password: string }) =>
    apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getContacts: async () => {
    const data = await apiFetch('/api/contacts');
    return data.contacts || [];
  },

  createContact: (body: Record<string, unknown>) =>
    apiFetch('/api/contacts', { method: 'POST', body: JSON.stringify(body) }),

  deleteContact: (id: number) =>
    apiFetch(`/api/contacts/${id}`, { method: 'DELETE' }),

  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch('/api/contacts/import', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  getAudiences: () => apiFetch('/api/audiences'),

  createAudience: (body: Record<string, unknown>) =>
    apiFetch('/api/audiences', { method: 'POST', body: JSON.stringify(body) }),

  getCampaigns: () => apiFetch('/api/campaigns'),

  createCampaign: (body: Record<string, unknown>) =>
    apiFetch('/api/campaigns', { method: 'POST', body: JSON.stringify(body) }),

  getCampaignAnalytics: (id: number) => apiFetch(`/api/campaigns/${id}/analytics`),
};

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}