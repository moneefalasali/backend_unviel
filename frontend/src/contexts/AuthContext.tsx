import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
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
  signUp: (email: string, password: string, fullName: string, gender: string, age: number) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  profile: null,
  loading: true,
  signUp: async () => ({ error: new Error('AuthProvider not initialized') }),
  signIn: async () => ({ error: new Error('AuthProvider not initialized') }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const data = await fetchCurrentUser();
        setUser(data.user);
        setProfile(data.profile);
      } catch (error) {
        clearSession();
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    gender: string,
    age: number
  ) => {
    try {
      const data = await registerUser(email, password, fullName, gender, age);
      setUser(data.user);
      setProfile(data.profile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      setUser(data.user);
      setProfile(data.profile);
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
    signUp,
    signIn,
    signOut,
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
