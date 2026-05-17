import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  ApiError,
  ApiUser,
  UserProfile,
  registerUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  clearSession,
} from '../lib/api';

interface AuthContextType {
  user: ApiUser | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string, gender: string, age: number) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
  signUp: async () => ({ error: new Error('AuthProvider not initialized') }),
  signIn: async () => ({ error: new Error('AuthProvider not initialized') }),
  signOut: async () => {},
  refreshAuth: async () => {},
});

let authInitializationStarted = false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isAuthenticated = Boolean(user);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      const data = await fetchCurrentUser();
      if (mountedRef.current) {
        setUser(data?.user ?? null);
        setProfile(data?.profile ?? null);
      }
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearSession();
      }
      if (mountedRef.current) {
        setUser(null);
        setProfile(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setInitialized(true);
      }
    }
  };

  useEffect(() => {
    if (authInitializationStarted) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    authInitializationStarted = true;
    loadCurrentUser();
  }, []);

  const refreshAuth = async () => {
    setLoading(true);
    await loadCurrentUser();
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    gender: string,
    age: number
  ) => {
    try {
      const data = await registerUser(email, password, fullName, gender, age);
      setUser(data.user ?? null);
      setProfile(data.profile ?? null);
      await refreshAuth();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      setUser(data.user ?? null);
      setProfile(data.profile ?? null);
      await refreshAuth();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
