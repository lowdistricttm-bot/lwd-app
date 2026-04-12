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

// Usiamo le chiavi WooCommerce che sono già autorizzate sul server
const WC_AUTH = btoa("ck_9fb51bb84b02dbc2bbc4c9a602de478ca33079ea:cs_225bea698a3c9bf46cda04bf57a630a6b15034a9");

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
      // 1. Verifica credenziali tramite JWT
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
      
      // 2. Recupero dati profilo tramite WooCommerce API (Metodo Infallibile)
      // Cerchiamo l'utente per email o per username usando le chiavi segrete del negozio
      const isEmail = username.includes('@');
      const searchUrl = isEmail 
        ? `https://www.lowdistrict.it/wp-json/wc/v3/customers?email=${encodeURIComponent(username.trim())}`
        : `https://www.lowdistrict.it/wp-json/wc/v3/customers?username=${encodeURIComponent(username.trim())}`;

      const wcRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Basic ${WC_AUTH}` }
      });

      let userData: User | null = null;

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

      // 3. Fallback: se non è un "cliente" WooCommerce, proviamo a cercarlo come utente WP generico
      if (!userData) {
        const wpSearchUrl = `https://www.lowdistrict.it/wp-json/wp/v2/users?slug=${username.trim()}`;
        const wpRes = await fetch(wpSearchUrl, {
          headers: { 'Authorization': `Basic ${WC_AUTH}` } // Le chiavi WC spesso funzionano anche qui
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

      // 4. Ultima spiaggia: se abbiamo il token ma il server nasconde tutto, 
      // creiamo un profilo temporaneo per non bloccare l'utente, ma l'ID 0 indicherà un problema di sync
      if (!userData) {
        throw new Error("Il tuo account esiste ma il server non ci permette di leggere i tuoi dati. Contatta l'amministratore.");
      }

      // Salvataggio persistente
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ld_auth_token', jwtToken);
      localStorage.setItem('ld_user_data', JSON.stringify(userData));
      
      showSuccess(`Accesso eseguito: ${userData.display_name}`);
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