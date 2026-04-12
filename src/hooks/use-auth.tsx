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
      // 1. Ottieni il Token
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

      // 2. Recupero dati utente REALI dal server (Endpoint ME è il più affidabile)
      const meRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?context=edit&JWT=${jwtToken}`);
      if (!meRes.ok) throw new Error("Impossibile recuperare i dati del profilo");
      
      const meData = await meRes.json();
      
      // Cerchiamo l'avatar in tutte le posizioni possibili restituite da WP
      let finalAvatar = meData.avatar_urls?.['96'] || meData.avatar_urls?.['48'] || meData.avatar_urls?.['24'];
      
      // Se l'avatar di WP sembra quello di default, proviamo a chiedere a BuddyPress
      if (!finalAvatar || finalAvatar.includes('gravatar.com/avatar/0000')) {
        try {
          const bpRes = await fetch(`https://www.lowdistrict.it/wp-json/buddypress/v1/members/${meData.id}?JWT=${jwtToken}`);
          if (bpRes.ok) {
            const bpData = await bpRes.json();
            if (bpData.avatar_urls?.full) finalAvatar = bpData.avatar_urls.full;
          }
        } catch (e) {
          console.error("BP Avatar fetch failed", e);
        }
      }

      const userData: User = {
        id: meData.id,
        username: meData.slug || cleanUsername,
        email: meData.email || '',
        nicename: meData.name,
        display_name: meData.name,
        avatar: finalAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`
      };

      saveAuth(jwtToken, userData);
      showSuccess(`Profilo sincronizzato: ${userData.display_name}`);
      
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