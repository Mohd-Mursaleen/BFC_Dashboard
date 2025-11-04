'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getAuthToken, setAuthToken, removeAuthToken } from './api';
import type { AuthResponse } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getAuthToken();
    if (existingToken) {
      setToken(existingToken);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login(username, password);
      setAuthToken(response.access_token);
      setToken(response.access_token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
  };

  const value = {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}