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
      // 1. Richiesta del Token
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
      if (!jwtToken) throw new Error("Token non ricevuto dal server");

      let userData: User | null = null;
      const rawUser = resData.data?.user || resData.user;

      // 2. Se i dati utente mancano, li recuperiamo con il token appena ottenuto
      if (!rawUser) {
        const userRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`);
        if (userRes.ok) {
          const me = await userRes.json();
          userData = {
            id: me.id,
            username: me.slug || me.username,
            email: me.email || '',
            nicename: me.name || me.slug,
            display_name: me.name || me.slug,
            avatar: me.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${me.slug}`
          };
        }
      } else {
        userData = {
          id: rawUser.ID || rawUser.id,
          username: rawUser.user_login || rawUser.username,
          email: rawUser.user_email || rawUser.email,
          nicename: rawUser.user_nicename || rawUser.nicename || rawUser.user_login,
          display_name: rawUser.display_name || rawUser.user_login,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.user_login || 'user'}`
        };
      }

      if (!userData) throw new Error("Impossibile recuperare i dati del profilo");

      // 3. Salvataggio finale
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ld_auth_token', jwtToken);
      localStorage.setItem('ld_user_data', JSON.stringify(userData));
      
      showSuccess(`Bentornato, ${userData.display_name}`);
    } catch (error: any) {
      console.error('Login Error:', error);
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