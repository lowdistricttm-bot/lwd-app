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
      let userData: User | null = null;
      let wpUserId = resData.data?.user?.id;

      // Recupero ID se mancante
      if (!wpUserId) {
        const meRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`);
        if (meRes.ok) {
          const meData = await meRes.json();
          wpUserId = meData.id;
        }
      }

      // Sorgente Avatar predefinita
      let finalAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;

      if (wpUserId) {
        // 1. TENTATIVO BUDDYPRESS (Priorità assoluta)
        try {
          const bpRes = await fetch(`https://www.lowdistrict.it/wp-json/buddypress/v1/members/${wpUserId}`);
          if (bpRes.ok) {
            const bpData = await bpRes.ok ? await bpRes.json() : null;
            if (bpData && bpData.avatar_urls) {
              finalAvatar = bpData.avatar_urls.full || bpData.avatar_urls.thumb;
            }
            userData = {
              id: bpData.id,
              username: bpData.user_login || cleanUsername,
              email: '',
              nicename: bpData.name,
              display_name: bpData.name,
              avatar: finalAvatar,
              mention_name: bpData.mention_name
            };
          }
        } catch (e) {}

        // 2. TENTATIVO WORDPRESS (Se BP fallisce o non ha avatar)
        if (!userData || finalAvatar.includes('dicebear')) {
          try {
            const wpRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/${wpUserId}`);
            if (wpRes.ok) {
              const wpData = await wpRes.json();
              if (wpData.avatar_urls) {
                finalAvatar = wpData.avatar_urls['96'] || wpData.avatar_urls['48'] || finalAvatar;
              }
              if (!userData) {
                userData = {
                  id: wpData.id,
                  username: wpData.slug,
                  email: wpData.email || '',
                  nicename: wpData.name,
                  display_name: wpData.name,
                  avatar: finalAvatar
                };
              } else {
                userData.avatar = finalAvatar;
              }
            }
          } catch (e) {}
        }
      }

      // Fallback finale
      if (!userData) {
        userData = {
          id: wpUserId || Date.now(),
          username: cleanUsername,
          email: '',
          nicename: cleanUsername,
          display_name: cleanUsername,
          avatar: finalAvatar
        };
      }

      saveAuth(jwtToken, userData);
      showSuccess(`Bentornato, ${userData.display_name}!`);
      
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