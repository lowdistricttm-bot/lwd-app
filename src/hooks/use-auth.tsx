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
  mention_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const fetchLatestUserData = useCallback(async (userId: number, currentToken: string) => {
    try {
      // Proviamo a recuperare i dati da BuddyPress che contiene l'avatar personalizzato corretto
      const bpRes = await fetch(`https://www.lowdistrict.it/wp-json/buddypress/v1/members/${userId}?JWT=${currentToken}`);
      
      if (bpRes.ok) {
        const bpData = await bpRes.json();
        const bpAvatar = bpData[0]?.avatar_urls?.full || bpData[0]?.avatar_urls?.thumb;
        
        if (bpAvatar) {
          setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, avatar: bpAvatar };
            localStorage.setItem('ld_user_data', JSON.stringify(updated));
            return updated;
          });
          return;
        }
      }

      // Fallback su WordPress standard se BuddyPress fallisce
      const userRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/${userId}?JWT=${currentToken}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        const wpAvatar = userData.avatar_urls?.['96'] || userData.avatar_urls?.['48'];
        
        setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, avatar: wpAvatar || defaultAvatar };
          localStorage.setItem('ld_user_data', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      console.error("Errore sincronizzazione utente:", e);
    }
  }, [defaultAvatar]);

  useEffect(() => {
    if (user?.id && token) {
      fetchLatestUserData(user.id, token);
    }
  }, []);

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

      // Recuperiamo subito l'avatar da BuddyPress dopo il login
      let finalAvatar = defaultAvatar;
      try {
        const bpRes = await fetch(`https://www.lowdistrict.it/wp-json/buddypress/v1/members/${userId}`);
        if (bpRes.ok) {
          const bpData = await bpRes.json();
          finalAvatar = bpData[0]?.avatar_urls?.full || bpData[0]?.avatar_urls?.thumb || defaultAvatar;
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

  const refreshUser = async () => {
    if (user?.id && token) {
      await fetchLatestUserData(user.id, token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register: async () => {}, logout, refreshUser, isLoading }}>
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