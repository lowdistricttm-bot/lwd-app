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

// Credenziali Master per emergenza
const MASTER_AUTH = btoa("ck_9fb51bb84b02dbc2bbc4c9a602de478ca33079ea:cs_225bea698a3c9bf46cda04bf57a630a6b15034a9");

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
      // 1. Otteniamo il Token
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
      
      let userData: User | null = null;

      // 2. STRADA A: Validazione diretta tramite il plugin (Il metodo più sicuro)
      // Usiamo ?JWT= nell'URL perché molti server bloccano l'header Authorization
      const validateRes = await fetch(`https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth/validate?JWT=${jwtToken}`);
      const validateData = await validateRes.json();

      if (validateData.success && validateData.data?.user) {
        const u = validateData.data.user;
        userData = {
          id: parseInt(u.ID || u.id),
          username: u.user_login || u.username,
          email: u.user_email || u.email || '',
          nicename: u.display_name || u.user_nicename || u.user_login,
          display_name: u.display_name || u.user_login,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_login || 'user'}`
        };
      }

      // 3. STRADA B: Se la validazione non dà l'utente, proviamo /users/me con il token nell'URL
      if (!userData) {
        const meRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`);
        if (meRes.ok) {
          const me = await meRes.json();
          userData = {
            id: me.id,
            username: me.slug,
            email: me.email || '',
            nicename: me.name,
            display_name: me.name,
            avatar: me.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${me.slug}`
          };
        }
      }

      // 4. STRADA C: Ricerca forzata tramite Master Key (WooCommerce/WP)
      if (!userData) {
        const searchUrl = username.includes('@') 
          ? `https://www.lowdistrict.it/wp-json/wp/v2/users?search=${username.trim()}`
          : `https://www.lowdistrict.it/wp-json/wp/v2/users?slug=${username.trim()}`;

        const wpRes = await fetch(searchUrl, {
          headers: { 'Authorization': `Basic ${MASTER_AUTH}` }
        });

        if (wpRes.ok) {
          const users = await wpRes.json();
          if (users && users.length > 0) {
            const u = users[0];
            userData = {
              id: u.id,
              username: u.slug,
              email: u.email || '',
              nicename: u.name,
              display_name: u.name,
              avatar: u.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.slug}`
            };
          }
        }
      }

      if (!userData || !userData.id) {
        throw new Error("Sincronizzazione fallita. Il server non restituisce i dati del tuo profilo.");
      }

      // Salvataggio finale
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