/**
 * SGBD 後端 API 服務
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('sgbd_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('sgbd_token');
    localStorage.removeItem('sgbd_admin_user');
    window.location.href = '/admin/login';
    throw new Error('登入已過期，請重新登入');
  }

  return { ok: res.ok, status: res.status, data };
}

export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, login_type: 'temple_admin' }),
    }),
};

export default { auth: authApi };
