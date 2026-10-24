import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  systemInitialized: boolean | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
  checkSystemStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hcm_token'));
  const [loading, setLoading] = useState(true);
  const [systemInitialized, setSystemInitialized] = useState<boolean | null>(null);

  const checkSystemStatus = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api.getSystemStatus();
      setSystemInitialized(res.initialized);
      return res.initialized;
    } catch (err) {
      console.error('Failed to get system status', err);
      setSystemInitialized(false);
      return false;
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const savedToken = localStorage.getItem('hcm_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('hcm_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Session expired or invalid', err);
      localStorage.removeItem('hcm_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkSystemStatus();
      await refreshMe();
    };
    init();
  }, [checkSystemStatus, refreshMe]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('hcm_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setSystemInitialized(true);
  };

  const logout = () => {
    localStorage.removeItem('hcm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        systemInitialized,
        login,
        logout,
        refreshMe,
        checkSystemStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
