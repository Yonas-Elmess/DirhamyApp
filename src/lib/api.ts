const BASE_URL = "/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Une erreur est survenue");
  }

  return data;
}

// Auth
export const api = {
  auth: {
    register: (body: { nom: string; email: string; password: string }) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    logout: () => request("/auth/login", { method: "DELETE" }),
    me: () => request<{ user: { id: string; nom: string; email: string } }>("/auth/me"),
  },

  // Revenus
  revenus: {
    list: () => request<{ revenus: any[] }>("/revenus"),
    create: (body: any) =>
      request("/revenus", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      request(`/revenus/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/revenus/${id}`, { method: "DELETE" }),
  },

  // Depenses
  depenses: {
    list: () => request<{ depenses: any[] }>("/depenses"),
    create: (body: any) =>
      request("/depenses", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      request(`/depenses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/depenses/${id}`, { method: "DELETE" }),
  },

  // Categories
  categories: {
    list: () => request<{ categories: any[] }>("/categories"),
    create: (body: any) =>
      request("/categories", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      request(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request(`/categories/${id}`, { method: "DELETE" }),
  },

  // Budgets
  budgets: {
    list: () => request<{ budgets: any[] }>("/budgets"),
    create: (body: any) =>
      request("/budgets", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      request(`/budgets/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/budgets/${id}`, { method: "DELETE" }),
  },

  // Objectifs
  objectifs: {
    list: () => request<{ objectifs: any[] }>("/objectifs"),
    create: (body: any) =>
      request("/objectifs", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      request(`/objectifs/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request(`/objectifs/${id}`, { method: "DELETE" }),
    analyze: (id: string) =>
      request<{ analysis: any; input: any }>(`/objectifs/${id}/analyze`, {
        method: "POST",
      }),
  },

  // Cotisations
  cotisations: {
    list: (objectifId?: string) =>
      request<{ cotisations: any[] }>(
        `/cotisations${objectifId ? `?objectifId=${objectifId}` : ""}`
      ),
    create: (body: any) =>
      request("/cotisations", { method: "POST", body: JSON.stringify(body) }),
    delete: (id: string) =>
      request(`/cotisations/${id}`, { method: "DELETE" }),
  },

  // Stats
  stats: {
    dashboard: () => request<any>("/stats"),
    transactions: (params?: string) =>
      request<{ transactions: any[] }>(
        `/transactions${params ? `?${params}` : ""}`
      ),
  },

  // Profil
  profil: {
    update: (body: any) =>
      request("/auth/me", { method: "PUT", body: JSON.stringify(body) }),
    changePassword: (body: any) =>
      request("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
  },
};
