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
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ld_auth_token');
    return null;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ld_user_data');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // 1. Autenticazione JWT
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Credenziali non valide');
      }

      const jwtToken = resData.data?.jwt || resData.jwt;
      
      // 2. Recupero dati dell'utente autenticato (Metodo Diretto "ME")
      // Usiamo il token appena ottenuto per chiedere al server i dati dell'utente corrente
      const meResponse = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`);
      
      if (!meResponse.ok) {
        // Se il metodo "me" fallisce, proviamo a vedere se i dati sono già nel resData del login
        if (resData.data?.user) {
          const u = resData.data.user;
          const userData = {
            id: u.id || u.ID,
            username: u.user_login || u.username,
            email: u.user_email || u.email,
            nicename: u.display_name || u.user_nicename,
            display_name: u.display_name || u.user_nicename,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_login || u.username}`
          };
          saveAuth(jwtToken, userData);
          return;
        }
        throw new Error("Impossibile recuperare i dati del profilo dopo il login.");
      }

      const meData = await meResponse.json();
      
      const userData: User = {
        id: meData.id,
        username: meData.slug,
        email: meData.email || '',
        nicename: meData.name,
        display_name: meData.name,
        avatar: meData.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${meData.slug}`
      };

      saveAuth(jwtToken, userData);
      showSuccess(`Bentornato, ${userData.display_name}`);
      
    } catch (error: any) {
      console.error('Login Error:', error);
      showError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = (jwtToken: string, userData: User) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('ld_auth_token', jwtToken);
    localStorage.setItem('ld_user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ld_auth_token');
    localStorage.removeItem('ld_user_data');
    showSuccess("Sessione chiusa");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register: async () => {}, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};