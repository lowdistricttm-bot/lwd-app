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
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ld_auth_token');
    return null;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ld_user_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // PULIZIA AUTOMATICA: Se l'avatar è Gravatar o vuoto, usa il placeholder
        if (!parsed.avatar || parsed.avatar.includes('gravatar.com') || parsed.avatar.includes('secure.gravatar')) {
          parsed.avatar = defaultAvatar;
        }
        return parsed;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    const cleanUsername = username.trim();
    
    try {
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
      
      let userId = wpUser?.ID || wpUser?.id;
      if (!userId && jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          userId = payload.id || payload.user_id || payload.sub;
        } catch (e) {}
      }

      if (!userId) throw new Error("ID utente non trovato");

      let finalAvatar = defaultAvatar;
      
      try {
        const userRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          const wpAvatar = userData.avatar_urls?.['96'] || userData.avatar_urls?.['48'];
          // Se l'avatar di WP non è Gravatar, usalo, altrimenti tieni il default
          if (wpAvatar && !wpAvatar.includes('gravatar.com')) {
            finalAvatar = wpAvatar;
          }
        }
      } catch (e) {}

      const userData: User = {
        id: parseInt(userId),
        username: wpUser?.user_login || cleanUsername,
        email: wpUser?.user_email || '',
        nicename: wpUser?.display_name || cleanUsername,
        display_name: wpUser?.display_name || cleanUsername,
        avatar: finalAvatar
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

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};