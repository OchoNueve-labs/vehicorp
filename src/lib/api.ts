const BASE = "/api/vehicorp";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}/${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error ${res.status}`);
  }
  return res.json();
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint);
}

export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}
