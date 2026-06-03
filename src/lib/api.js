const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8087";

export function getToken() {
  return localStorage.getItem("hallpark_token");
}

export function setToken(token) {
  localStorage.setItem("hallpark_token", token);
}

export function clearToken() {
  localStorage.removeItem("hallpark_token");
}

export function getUser() {
  const raw = localStorage.getItem("hallpark_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem("hallpark_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("hallpark_user");
}

export function logout() {
  clearToken();
  clearUser();
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }

  return data;
}

export const api = {
  signup: (body) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  stats: () => request("/api/admin/stats"),
  quotes: () => request("/api/admin/quotes"),
  listPages: () => request("/api/admin/pages"),
  getPage: (slug) => request(`/api/admin/pages/${slug}`),
  updatePage: (slug, body) =>
    request(`/api/admin/pages/${slug}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export { API_URL };
