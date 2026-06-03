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
  jobApplications: () => request("/api/admin/job-applications"),
  listPages: () => request("/api/admin/pages"),
  getPage: (slug) => request(`/api/admin/pages/${slug}`),
  updatePage: (slug, body) =>
    request(`/api/admin/pages/${slug}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  uploadSignature: () =>
    request("/api/admin/uploads/signature", { method: "POST" }),
};

/**
 * Upload a video file directly to Cloudinary using a signed request.
 * The backend signs the params; the file goes straight to Cloudinary,
 * never through our API server. Returns the secure delivery URL.
 */
export async function uploadVideoToCloudinary(file, onProgress) {
  const { cloudName, apiKey, timestamp, folder, signature } =
    await api.uploadSignature();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  // Use XHR so we can report upload progress.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve(res.secure_url);
        } else {
          reject(new Error(res?.error?.message ?? `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error("Unexpected upload response from Cloudinary"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export { API_URL };
