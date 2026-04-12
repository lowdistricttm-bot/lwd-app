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

// Credenziali Master per bypassare i blocchi
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
      // 1. Autenticazione JWT
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
      if (!jwtToken) throw new Error("Token non ricevuto");

      let userData: User | null = null;

      // 2. STRADA A: Dati già presenti nella risposta (Il modo più veloce)
      const rawUser = resData.data?.user || resData.user;
      if (rawUser && (rawUser.ID || rawUser.id)) {
        userData = {
          id: parseInt(rawUser.ID || rawUser.id),
          username: rawUser.user_login || rawUser.username,
          email: rawUser.user_email || rawUser.email || '',
          nicename: rawUser.user_nicename || rawUser.display_name || rawUser.user_login,
          display_name: rawUser.display_name || rawUser.user_login,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.user_login || 'user'}`
        };
      }

      // 3. STRADA B: Ricerca tramite API WordPress Standard con Master Key
      if (!userData) {
        const isEmail = username.includes('@');
        const searchUrl = isEmail 
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

      // 4. STRADA C: Ricerca tramite WooCommerce Customers
      if (!userData) {
        const wcRes = await fetch(`https://www.lowdistrict.it/wp-json/wc/v3/customers?search=${username.trim()}`, {
          headers: { 'Authorization': `Basic ${MASTER_AUTH}` }
        });
        
        if (wcRes.ok) {
          const customers = await wcRes.json();
          if (customers && customers.length > 0) {
            const c = customers[0];
            userData = {
              id: c.id,
              username: c.username,
              email: c.email,
              nicename: `${c.first_name} ${c.last_name}`.trim() || c.username,
              display_name: `${c.first_name} ${c.last_name}`.trim() || c.username,
              avatar: c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`
            };
          }
        }
      }

      if (!userData || !userData.id) {
        throw new Error("Sincronizzazione fallita: utente autenticato ma non trovato nel database. Contatta l'assistenza.");
      }

      // Salvataggio
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