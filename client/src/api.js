const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data, auth: true }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),

  // Auth
  setupStatus: () => request('/auth/setup-status'),
  setupAdmin: (data) => request('/auth/setup', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  me: () => request('/auth/me', { auth: true }),

  // Checkout
  createCheckoutSession: (items) =>
    request('/checkout/create-session', { method: 'POST', body: { items } }),
  getOrder: (orderId) => request(`/checkout/order/${orderId}`),

  // Orders (admin)
  getOrders: () => request('/orders', { auth: true }),
};

export { getToken };
