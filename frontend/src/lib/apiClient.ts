/**
 * Thin fetch wrapper around the IA Inspector API.
 *
 * Responsibilities:
 *  - attach the bearer access token and the X-Anon-Id header
 *  - transparently refresh an expired access token once, then retry
 *  - surface typed errors (ApiError, QuotaError)
 *  - broadcast auth changes so stores can react
 */
import type { AuthTokens } from '@/types/user';

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api'
).replace(/\/$/, '');

const STORAGE = {
  access: 'ia.accessToken',
  refresh: 'ia.refreshToken',
  anon: 'ia.anonId',
} as const;

// --- token store ---------------------------------------------------------

let accessToken: string | null = safeGet(STORAGE.access);
let refreshToken: string | null = safeGet(STORAGE.refresh);

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setTokens(tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'> | null) {
  accessToken = tokens?.accessToken ?? null;
  refreshToken = tokens?.refreshToken ?? null;
  safeSet(STORAGE.access, accessToken);
  safeSet(STORAGE.refresh, refreshToken);
}

export function getAnonId() {
  return safeGet(STORAGE.anon);
}
export function setAnonId(id: string) {
  safeSet(STORAGE.anon, id);
}

// --- auth event bus -----------------------------------------------------

type AuthEvent = 'logout' | 'refreshed';
const listeners = new Set<(e: AuthEvent) => void>();
export function onAuthEvent(fn: (e: AuthEvent) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit(e: AuthEvent) {
  listeners.forEach((fn) => fn(e));
}

// --- errors -----------------------------------------------------------

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

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' ? (v as Json) : {});

export class QuotaError extends ApiError {
  resetsAt: string | null;
  quota: unknown;
  constructor(status: number, data: unknown) {
    const detail = obj(obj(data).detail ?? data);
    super(status, (detail.message as string) ?? 'Scan quota reached.', data);
    this.name = 'QuotaError';
    this.resetsAt = (detail.resets_at as string) ?? null;
    this.quota = detail.quota ?? null;
  }
}

function messageFrom(data: unknown, fallback: string): string {
  const d = obj(data);
  if (typeof d.detail === 'string') return d.detail;
  if (Array.isArray(d.detail) && obj(d.detail[0]).msg) return String(obj(d.detail[0]).msg);
  if (typeof obj(d.detail).message === 'string') return String(obj(d.detail).message);
  return fallback;
}

// --- core request -----------------------------------------------------

interface Options {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean; // default: attach token if present
  _retried?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = (await res.json()) as AuthTokens;
        setTokens(data);
        emit('refreshed');
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  if (options.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const anon = getAnonId();
  if (anon) headers['X-Anon-Id'] = anon;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (res.status === 204) return undefined as T;

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

  if (res.status === 401 && options.auth !== false && !options._retried && refreshToken) {
    if (await doRefresh()) {
      return request<T>(path, { ...options, _retried: true });
    }
    setTokens(null);
    emit('logout');
  }

  if (res.status === 429) {
    throw new QuotaError(res.status, data);
  }

  throw new ApiError(res.status, messageFrom(data, res.statusText || 'Request failed'), data);
}

export const api = {
  get: <T>(path: string, opts?: Options) => request<T>(path, opts),
  post: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Options) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

/** Ensure we have an anonymous session id (needed before consuming quota). */
export async function ensureAnonId(): Promise<string> {
  const existing = getAnonId();
  const { anonId } = await api.post<{ anonId: string }>(
    '/auth/anon',
    undefined,
    { auth: false },
  );
  if (anonId !== existing) setAnonId(anonId);
  return anonId;
}

export const apiBaseUrl = API_URL;

/** Build a full URL for a browser redirect (OAuth). */
export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}
