// Base URL from environment variable — in Docker, this is set in docker-compose.yml
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Generic fetch helper with error handling
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  // 204 No Content responses have no body
  if (res.status === 204) return null;
  return res.json();
}

// Products
export const productsApi = {
  getAll: () => apiFetch("/products/"),
  getOne: (id) => apiFetch(`/products/${id}`),
  create: (data) => apiFetch("/products/", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/products/${id}`, { method: "DELETE" }),
};

// Customers
export const customersApi = {
  getAll: () => apiFetch("/customers/"),
  getOne: (id) => apiFetch(`/customers/${id}`),
  create: (data) => apiFetch("/customers/", { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/customers/${id}`, { method: "DELETE" }),
};

// Orders
export const ordersApi = {
  getAll: () => apiFetch("/orders/"),
  getOne: (id) => apiFetch(`/orders/${id}`),
  create: (data) => apiFetch("/orders/", { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/orders/${id}`, { method: "DELETE" }),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => apiFetch("/dashboard"),
};
