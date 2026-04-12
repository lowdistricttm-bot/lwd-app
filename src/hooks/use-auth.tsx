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
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestUserData = useCallback(async (userId: number, currentToken: string) => {
    setIsRefreshing(true);
    try {
      // 1. Proviamo BuddyPress (Sorgente primaria per avatar personalizzati)
      const bpResponse = await fetch(`https://www.lowdistrict.it/wp-json/buddypress/v1/members/${userId}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      
      if (bpResponse.ok) {
        const bpData = await bpResponse.json();
        const member = Array.isArray(bpData) ? bpData[0] : bpData;
        const avatarUrl = member?.avatar_urls?.full || member?.avatar_urls?.thumb;
        
        if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.includes('http')) {
          const finalUrl = `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
          updateUserInState({ avatar: finalUrl });
          return;
        }
      }

      // 2. Fallback su WordPress Core (Sorgente secondaria)
      const wpResponse = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      
      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        const wpAvatar = wpData.avatar_urls?.['96'] || wpData.avatar_urls?.['48'];
        if (wpAvatar) {
          updateUserInState({ avatar: wpAvatar });
        }
      }
    } catch (e) {
      console.error("Errore sync:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  const updateUserInState = (newData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      localStorage.setItem('ld_user_data', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (user?.id && token) {
      fetchLatestUserData(user.id, token);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Errore login');

      const jwtToken = resData.data?.jwt || resData.jwt;
      const wpUser = resData.data?.user || resData.user;
      const userId = wpUser?.ID || wpUser?.id;

      const userData: User = {
        id: parseInt(userId),
        username: wpUser?.user_login || username,
        email: wpUser?.user_email || '',
        nicename: wpUser?.display_name || username,
        display_name: wpUser?.display_name || username,
        avatar: defaultAvatar
      };

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ld_auth_token', jwtToken);
      localStorage.setItem('ld_user_data', JSON.stringify(userData));
      
      await fetchLatestUserData(userData.id, jwtToken);
      showSuccess(`Benvenuto ${userData.display_name}`);
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
    if (user?.id && token) await fetchLatestUserData(user.id, token);
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