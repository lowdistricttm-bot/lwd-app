"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ld_auth_token');
    return null;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ld_user_data');
      try {
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Credenziali non valide');
      }

      // Estrazione Token
      const jwtToken = resData.data?.jwt || resData.jwt;
      
      // Estrazione Dati Utente (WordPress può restituirli in diversi formati)
      const wpUser = resData.data?.user || resData.user;
      
      // Estrazione ID ultra-robusta: controlliamo ogni possibile campo
      const rawId = wpUser?.ID || 
                    wpUser?.id || 
                    resData.data?.user_id || 
                    resData.user_id || 
                    resData.id || 
                    resData.data?.id;

      const userId = parseInt(rawId);

      if (isNaN(userId)) {
        console.error("[Auth] Struttura risposta non riconosciuta:", resData);
        throw new Error("ID utente non trovato nella risposta del server.");
      }

      const userData: User = {
        id: userId,
        username: wpUser?.user_login || wpUser?.username || username,
        email: wpUser?.user_email || wpUser?.email || '',
        nicename: wpUser?.display_name || wpUser?.nicename || username,
        display_name: wpUser?.display_name || wpUser?.name || username,
        avatar: wpUser?.avatar_urls?.['96'] || defaultAvatar
      };

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ld_auth_token', jwtToken);
      localStorage.setItem('ld_user_data', JSON.stringify(userData));
      
      showSuccess(`Bentornato ${userData.display_name}`);
      
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

  const refreshUser = async () => {
    setIsRefreshing(true);
    // Simulazione refresh (in futuro si può chiamare l'API /me)
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register: async () => {}, logout, refreshUser, isLoading, isRefreshing }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};