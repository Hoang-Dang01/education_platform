import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../lib/api';
import type { UserRole } from '../lib/roles';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  role: UserRole;
  status: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updatePasswordChanged: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        setUser(me);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to restore session via /auth/me:', err);
        // Clear invalid token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithCredentials = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login({ username, password });
      const { user: profile, accessToken } = response;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(profile));
      
      setUser(profile);
      setIsAuthenticated(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định khi đăng nhập.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    window.location.hash = '';
  };

  const updatePasswordChanged = () => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        loginWithCredentials,
        logout,
        updatePasswordChanged,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
