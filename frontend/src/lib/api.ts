const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const AUTH_TOKEN_KEY = 'unveil_api_token';

export type ApiUser = {
  id: number;
  email: string;
  name: string;
};

export type UserProfile = {
  full_name: string;
  gender: string | null;
  age: number | null;
  created_at: string;
  updated_at: string;
  plan_type?: 'free' | 'plus';
  subscription_status?: string;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
};

export type AnalysisHistory = {
  id: number;
  user_id: number;
  media_type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  result_status: string;
  confidence_score: number;
  explanation: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const setAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const request = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // If response is not valid JSON (e.g. HTML error page), include raw text for debugging
      const snippet = text.length > 1000 ? text.slice(0, 1000) + '... (truncated)' : text;
      const msg = `Invalid JSON response from ${API_BASE_URL}${path} - status ${response.status}: ${snippet}`;
      throw new Error(msg);
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const registerUser = async (email: string, password: string, fullName: string, gender: string, age: number) => {
  const data = await request('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName, gender, age }),
  });

  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
};

export const loginUser = async (email: string, password: string) => {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
};

export const logoutUser = async () => {
  try {
    await request('/logout', { method: 'POST' });
  } finally {
    clearAuthToken();
  }
};

export const fetchCurrentUser = async () => {
  return request('/user');
};

export const fetchUserProfile = async () => {
  return request('/profile');
};

export const updateUserProfile = async (profile: { full_name: string; gender: string; age: number }) => {
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
};

export const fetchAnalysisHistory = async () => {
  return request('/history');
};

export const saveAnalysisHistory = async (history: {
  media_type: string;
  content: string;
  result_status: string;
  confidence_score: number;
  explanation: string;
  metadata?: Record<string, unknown>;
}) => {
  return request('/history', {
    method: 'POST',
    body: JSON.stringify(history),
  });
};

export const activateSubscription = async () => {
  return request('/subscription/activate', { method: 'POST' });
};

export const cancelSubscription = async () => {
  return request('/subscription/cancel', { method: 'POST' });
};

export const clearSession = () => {
  clearAuthToken();
};
