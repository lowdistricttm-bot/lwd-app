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
  mention_name?: string;
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
    const cleanUsername = username.trim();
    
    try {
      // 1. Autenticazione
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: password }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Credenziali non valide');
      }

      const jwtToken = resData.data?.jwt || resData.jwt;
      let wpUser = resData.data?.user || resData.user;
      
      // 2. Se i dati utente mancano, interroghiamo l'endpoint di validazione
      if (!wpUser) {
        try {
          const valRes = await fetch(`https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth/validate?JWT=${jwtToken}`);
          const valData = await valRes.json();
          if (valData.success && valData.data?.user) {
            wpUser = valData.data.user;
          }
        } catch (e) {
          console.error("Validazione fallita");
        }
      }

      // 3. Se mancano ancora, proviamo a decodificare il JWT (metodo d'emergenza)
      let userId = wpUser?.ID || wpUser?.id;
      if (!userId && jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          userId = payload.id || payload.user_id || payload.sub;
        } catch (e) {}
      }

      if (!userId) throw new Error("Il server non ha fornito l'ID utente. Contatta l'amministratore.");

      // 4. Costruzione profilo
      const avatarUrl = `https://www.lowdistrict.it/wp-content/uploads/avatars/${userId}/avatar-full.jpg`;

      const userData: User = {
        id: parseInt(userId),
        username: wpUser?.user_login || cleanUsername,
        email: wpUser?.user_email || '',
        nicename: wpUser?.display_name || cleanUsername,
        display_name: wpUser?.display_name || cleanUsername,
        avatar: avatarUrl
      };

      saveAuth(jwtToken, userData);
      showSuccess(`Bentornato ${userData.display_name}`);
      
    } catch (error: any) {
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