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
    const cleanUsername = username.trim();
    
    try {
      // 1. Autenticazione JWT
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

      // 2. Tentativo A: Endpoint "me"
      try {
        const meResponse = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`);
        if (meResponse.ok) {
          const meData = await meResponse.json();
          userData = {
            id: meData.id,
            username: meData.slug,
            email: meData.email || '',
            nicename: meData.name,
            display_name: meData.name,
            avatar: meData.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${meData.slug}`
          };
        }
      } catch (e) {}

      // 3. Tentativo B: Ricerca per identificativo
      if (!userData) {
        try {
          const searchResponse = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users?search=${encodeURIComponent(cleanUsername)}&JWT=${jwtToken}`);
          if (searchResponse.ok) {
            const users = await searchResponse.json();
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
        } catch (e) {}
      }

      // 4. Tentativo C: Dati diretti dalla risposta login
      if (!userData) {
        const u = resData.data?.user || resData.user;
        if (u) {
          userData = {
            id: u.id || u.ID || Date.now(),
            username: u.user_login || u.username || cleanUsername,
            email: u.user_email || u.email || '',
            nicename: u.display_name || u.user_nicename || cleanUsername,
            display_name: u.display_name || u.user_nicename || cleanUsername,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_login || cleanUsername}`
          };
        }
      }

      // 5. PIANO DI EMERGENZA FINALE (Plan D)
      // Se il login è riuscito (abbiamo il token) ma non troviamo i dati, 
      // creiamo un profilo locale per non bloccare l'utente.
      if (!userData && jwtToken) {
        console.warn("Utilizzo profilo di emergenza locale.");
        userData = {
          id: Date.now(), // ID temporaneo
          username: cleanUsername.split('@')[0],
          email: cleanUsername.includes('@') ? cleanUsername : '',
          nicename: cleanUsername.split('@')[0],
          display_name: cleanUsername.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`
        };
      }

      if (!userData) {
        throw new Error("Errore critico durante la creazione della sessione.");
      }

      saveAuth(jwtToken, userData);
      showSuccess(`Accesso effettuato come ${userData.display_name}`);
      
    } catch (error: any) {
      console.error('Login Error:', error);
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