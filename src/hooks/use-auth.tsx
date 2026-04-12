"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';

interface User {
  id: number;
  username: string;
  email: string;
  nicename: string;
  display_name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Inizializzazione immediata dallo storage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ld_auth_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ld_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data.jwt) {
        const jwtToken = data.data.jwt;
        const userData = {
          id: data.data.user.ID,
          username: data.data.user.user_login,
          email: data.data.user.user_email,
          nicename: data.data.user.user_nicename,
          display_name: data.data.user.display_name || data.data.user.user_login,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.data.user.user_login}`
        };

        setToken(jwtToken);
        setUser(userData);
        
        localStorage.setItem('ld_auth_token', jwtToken);
        localStorage.setItem('ld_user_data', JSON.stringify(userData));
        
        showSuccess(`Bentornato, ${userData.display_name}`);
      } else {
        throw new Error(data.message || 'Credenziali non valide');
      }
    } catch (error: any) {
      showError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.lowdistrict.it/wp-json/wp/v2/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error("Errore registrazione");
      showSuccess("Account creato! Accedi ora.");
    } catch (error: any) {
      showError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ld_auth_token');
    localStorage.removeItem('ld_user_data');
    showSuccess("Sessione chiusa");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};