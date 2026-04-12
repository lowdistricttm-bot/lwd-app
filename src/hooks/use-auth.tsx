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
      // 1. Autenticazione - Otteniamo il token e i dati base dell'utente
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: password }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Credenziali non valide');
      }

      // Estraiamo i dati dalla risposta del login (che il server invia sempre)
      const jwtToken = resData.data?.jwt || resData.jwt;
      const wpUser = resData.data?.user || resData.user;
      const userId = wpUser?.ID || wpUser?.id;

      if (!userId) throw new Error("Dati utente non ricevuti dal server");

      // 2. Costruiamo l'utente con i dati che abbiamo già (senza fare altre chiamate bloccabili)
      // Proviamo a generare l'URL dell'avatar di BuddyPress che solitamente è pubblico
      const avatarUrl = `https://www.lowdistrict.it/wp-content/uploads/avatars/${userId}/avatar-full.jpg`;

      const userData: User = {
        id: parseInt(userId),
        username: wpUser.user_login || cleanUsername,
        email: wpUser.user_email || '',
        nicename: wpUser.display_name || cleanUsername,
        display_name: wpUser.display_name || cleanUsername,
        avatar: avatarUrl // Proviamo a caricare questa, se non esiste caricherà il fallback nel componente
      };

      // 3. Tentativo opzionale di recupero dati extra (se fallisce non blocca il login)
      try {
        const meRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/${userId}`);
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.avatar_urls?.['96']) userData.avatar = meData.avatar_urls['96'];
        }
      } catch (e) {
        console.log("Recupero avatar extra bloccato, uso quello di default");
      }

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