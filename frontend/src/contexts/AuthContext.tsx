import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/components/polls/PollTypes';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiClient.login(credentials);
      apiClient.setToken(response.access_token);
      setUser(response.user);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiClient.register(data);
      apiClient.setToken(response.access_token);
      setUser(response.user);
      toast.success('Successfully registered!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    toast.success('Successfully logged out!');
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData);
    } catch (error) {
      // Token might be invalid, logout
      logout();
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
