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
      // 1. Richiesta del Token
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
      
      // Proviamo a vedere se l'utente è già nella risposta del login
      const rawUser = resData.data?.user || resData.user;
      
      if (rawUser && (rawUser.ID || rawUser.id)) {
        userData = {
          id: rawUser.ID || rawUser.id,
          username: rawUser.user_login || rawUser.username,
          email: rawUser.user_email || rawUser.email,
          nicename: rawUser.user_nicename || rawUser.nicename || rawUser.user_login,
          display_name: rawUser.display_name || rawUser.user_login,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rawUser.user_login || 'user'}`
        };
      } else {
        // 2. Fallback 1: Chiediamo i dati a /users/me
        const userRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        if (userRes.ok) {
          const me = await userRes.json();
          userData = {
            id: me.id,
            username: me.slug || me.username,
            email: me.email || '',
            nicename: me.name || me.slug,
            display_name: me.name || me.slug,
            avatar: me.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${me.slug}`
          };
        } else {
          // 3. Fallback 2: Cerchiamo l'utente tramite lo slug (username) se /me è bloccato
          const slugRes = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users?slug=${username.trim()}`);
          if (slugRes.ok) {
            const users = await slugRes.json();
            if (users && users.length > 0) {
              const u = users[0];
              userData = {
                id: u.id,
                username: u.slug,
                email: '',
                nicename: u.name,
                display_name: u.name,
                avatar: u.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.slug}`
              };
            }
          }
        }
      }

      // Se dopo tutti i tentativi non abbiamo un ID reale, fermiamo tutto
      if (!userData || !userData.id) {
        throw new Error("Sincronizzazione profilo fallita. Verifica i permessi del sito.");
      }

      // Salvataggio dati reali
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ld_auth_token', jwtToken);
      localStorage.setItem('ld_user_data', JSON.stringify(userData));
      
      showSuccess(`Accesso eseguito come ${userData.display_name}`);
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