const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8000/api';
const AUTH_TOKEN_KEY = 'unveil_api_token';
const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRY_COUNT = 2;

export interface ApiUser {
  id: number;
  email: string;
  full_name?: string | null;
}

export interface UserProfile {
  id?: number;
  user_id?: number;
  full_name: string;
  gender?: string | null;
  age?: number | null;
  plan_type?: string | null;
  subscription_status?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AnalysisHistory {
  id: number;
  user_id: number;
  media_type: string;
  content: string;
  result_status: string;
  confidence_score: number;
  explanation: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, unknown>;
}

export class ApiError extends Error {
  public status: number;
  public payload?: unknown;

  constructor(message: string, status = 0, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.name = 'ApiError';
  }
}

const isBrowser = typeof window !== 'undefined';

const getAuthToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const log = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.debug('[API]', ...args);
  }
};

const parseJson = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getErrorMessage = (payload: any, defaultMessage: string): string => {
  if (!payload) return defaultMessage;
  if (typeof payload === 'string') return payload;
  if (payload.message) return String(payload.message);
  if (payload.error) return String(payload.error);
  if (payload.errors && typeof payload.errors === 'object') {
    const firstKey = Object.keys(payload.errors)[0];
    const firstError = payload.errors[firstKey];
    if (Array.isArray(firstError)) {
      return String(firstError[0]);
    }
    return String(firstError);
  }
  return defaultMessage;
};

const shouldRetry = (status: number, attempt: number, maxRetries: number): boolean => {
  const retryStatus = [408, 429, 500, 502, 503, 504];
  return attempt < maxRetries && retryStatus.includes(status);
};

const clearSessionInternal = (): void => {
  if (!isBrowser) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  { timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRY_COUNT, skipAuth = false } = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    const headers: HeadersInit = {
      Accept: 'application/json',
      ...((options.headers as HeadersInit) || {}),
    };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }

    try {
      log('Request', url, { ...options, headers, timeout });
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      const rawBody = await response.text();
      const payload = parseJson(rawBody);

      if (!response.ok) {
        const message = getErrorMessage(payload, `HTTP ${response.status} ${response.statusText}`);
        const error = new ApiError(message, response.status, payload);

        if ([401, 403].includes(response.status)) {
          clearSessionInternal();
        }

        if (shouldRetry(response.status, attempt, retries)) {
          attempt += 1;
          const backoff = 200 * Math.pow(2, attempt);
          log(`Retrying ${url} after failure`, response.status, 'attempt', attempt, 'delay', backoff);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        throw error;
      }

      if (payload && typeof payload === 'object' && 'success' in payload && payload.success === false) {
        const message = getErrorMessage(payload, 'Server rejected the request');
        const error = new ApiError(message, response.status, payload);
        if ([401, 403].includes(response.status)) {
          clearSessionInternal();
        }
        throw error;
      }

      if (payload && typeof payload === 'object' && 'success' in payload) {
        return (payload as ApiResponse<T>).data ?? (payload as unknown as T);
      }

      return payload as T;
    } catch (error: unknown) {
      if ((error as DOMException)?.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your network and try again.', 408);
      }

      if (error instanceof ApiError) {
        log('API error', error.status, error.message, error.payload);
        throw error;
      }

      if (attempt < retries) {
        attempt += 1;
        const backoff = 200 * Math.pow(2, attempt);
        log('Network error, retrying', url, 'attempt', attempt, error);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      const message = (error as Error)?.message || 'Network error occurred. Please check your connection.';
      throw new ApiError(message, 0, { originalError: error });
    } finally {
      clearTimeout(timer);
    }
  }
};

export const registerUser = async (email: string, password: string, fullName: string, gender: string, age: number) => {
  const response = await request<{ user: ApiUser; profile: UserProfile; token: string }>('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName, gender, age }),
  });

  if (response?.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  }

  return response;
};

export const loginUser = async (email: string, password: string) => {
  const response = await request<{ user: ApiUser; profile: UserProfile; token: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response?.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  }

  return response;
};

export const logoutUser = async () => {
  try {
    await request<ApiResponse<null>>('/logout', { method: 'POST' });
  } finally {
    clearSessionInternal();
  }
};

export const fetchCurrentUser = async () => {
  return request<{ user: ApiUser | null; profile: UserProfile | null }>('/user');
};

export const fetchUserProfile = async () => {
  return request<UserProfile>('/profile');
};

export const fetchAnalysisHistory = async () => {
  const response = await request<AnalysisHistory[]>('/history');
  return response ?? [];
};

export const updateUserProfile = async (data: { full_name: string; gender?: string | null; age?: number | null }) => {
  return request<UserProfile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const activateSubscription = async () => {
  return request<UserProfile>('/subscription/activate', { method: 'POST' });
};

export const cancelSubscription = async () => {
  return request<UserProfile>('/subscription/cancel', { method: 'POST' });
};

export const saveAnalysisHistory = async (history: any) => {
  return request<ApiResponse<any>>('/history', {
    method: 'POST',
    body: JSON.stringify(history),
  });
};

export const clearSession = (): void => {
  clearSessionInternal();
};
