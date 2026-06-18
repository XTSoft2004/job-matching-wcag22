import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  companyId?: number | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (fullName: string, email: string, password: string, phone?: string, role?: string) => Promise<any>;
  verifyEmail: (email: string, code: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Fetch current user details if token exists
  const fetchUser = async () => {
    if (token) {
      try {
        // Set authorization header manually for the initial request
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res: any = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user context:', error);
        // Token expired or invalid
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const refreshUser = async () => {
    if (token) {
      try {
        const res: any = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to refresh user context:', error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res: any = await api.post('/auth/login', { email, password });
      const { accessToken, user: loggedUser } = res.data;

      localStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      setUser(loggedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string, phone?: string, role?: string) => {
    try {
      const res: any = await api.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
        role,
      });
      return res;
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res: any = await api.post('/auth/verify-email', {
        email,
        code,
      });
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyEmail, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
