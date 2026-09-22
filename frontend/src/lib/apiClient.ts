/**
 * Thin fetch wrapper around the AI Inspector API.
 *
 * The API is public and read-only (fingerprint catalogue): no auth, no user
 * data. Everything user-related stays in the browser (see `localDb.ts`).
 */

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api'
).replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function messageFrom(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && typeof (data as { detail?: unknown }).detail === 'string') {
    return (data as { detail: string }).detail;
  }
  return fallback;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (res.ok) return data as T;
  throw new ApiError(res.status, messageFrom(data, res.statusText || 'Request failed'), data);
}

export const api = {
  get: <T>(path: string, opts?: { signal?: AbortSignal }) => request<T>(path, opts?.signal),
};

export const apiBaseUrl = API_URL;
