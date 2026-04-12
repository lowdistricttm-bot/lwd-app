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
  // Inizializzazione immediata per evitare il logout al refresh
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
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password }),
      });

      const resData = await response.json();
      console.log('Login Response:', resData); // Utile per debug

      if (response.ok && resData.success) {
        // Estrazione flessibile del token e dell'utente
        const jwtToken = resData.data?.jwt || resData.jwt;
        const rawUser = resData.data?.user || resData.user;

        if (!jwtToken || !rawUser) {
          throw new Error("Risposta del server incompleta");
        }

        const userData: User = {
          id: rawUser.ID || rawUser.id,
          username: rawUser.user_login || rawUser.username,
          email: rawUser.user_email || rawUser.email,
          nicename: rawUser.user_nicename || rawUser.nicename || rawUser.user_login,
          display_name: rawUser.display_name || rawUser.user_login,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.user_login || 'user'}`
        };

        setToken(jwtToken);
        setUser(userData);
        
        localStorage.setItem('ld_auth_token', jwtToken);
        localStorage.setItem('ld_user_data', JSON.stringify(userData));
        
        showSuccess(`Bentornato, ${userData.display_name}`);
      } else {
        throw new Error(resData.message || 'Credenziali non valide');
      }
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