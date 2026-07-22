const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  signup: (body: { accountName: string; email: string; password: string }) =>
    apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getContacts: () => apiFetch('/api/contacts'),

  createContact: (body: any) =>
    apiFetch('/api/contacts', { method: 'POST', body: JSON.stringify(body) }),

  getAudiences: () => apiFetch('/api/audiences'),

  createAudience: (body: any) =>
    apiFetch('/api/audiences', { method: 'POST', body: JSON.stringify(body) }),

  getCampaigns: () => apiFetch('/api/campaigns'),

  createCampaign: (body: any) =>
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