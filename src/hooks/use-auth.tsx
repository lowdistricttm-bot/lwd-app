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

// Chiavi Master per il recupero dati sicuro
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
    const inputIdentifier = username.trim().toLowerCase();
    
    try {
      // 1. Autenticazione JWT (Verifica password)
      const response = await fetch('https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputIdentifier, password: password }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Credenziali non valide');
      }

      const jwtToken = resData.data?.jwt || resData.jwt;
      
      // 2. Ricerca Mirata dell'utente (Per evitare di caricare l'ultimo registrato)
      let userData: User | null = null;

      // Proviamo prima tramite WooCommerce Customers (più completo)
      const wcSearchUrl = inputIdentifier.includes('@') 
        ? `https://www.lowdistrict.it/wp-json/wc/v3/customers?email=${encodeURIComponent(inputIdentifier)}`
        : `https://www.lowdistrict.it/wp-json/wc/v3/customers?search=${encodeURIComponent(inputIdentifier)}`;

      const wcRes = await fetch(wcSearchUrl, {
        headers: { 'Authorization': `Basic ${WC_AUTH}` }
      });

      if (wcRes.ok) {
        const customers = await wcRes.json();
        // Filtriamo i risultati per trovare il match esatto
        const match = customers.find((c: any) => 
          c.email.toLowerCase() === inputIdentifier || 
          c.username.toLowerCase() === inputIdentifier
        );

        if (match) {
          userData = {
            id: match.id,
            username: match.username,
            email: match.email,
            nicename: `${match.first_name} ${match.last_name}`.trim() || match.username,
            display_name: `${match.first_name} ${match.last_name}`.trim() || match.username,
            avatar: match.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.username}`
          };
        }
      }

      // 3. Fallback: Ricerca tramite WordPress Users (se non è un cliente WC)
      if (!userData) {
        const wpSearchUrl = inputIdentifier.includes('@')
          ? `https://www.lowdistrict.it/wp-json/wp/v2/users?search=${encodeURIComponent(inputIdentifier)}`
          : `https://www.lowdistrict.it/wp-json/wp/v2/users?slug=${encodeURIComponent(inputIdentifier)}`;

        const wpRes = await fetch(wpSearchUrl, {
          headers: { 'Authorization': `Basic ${WC_AUTH}` }
        });
        
        if (wpRes.ok) {
          const users = await wpRes.json();
          const match = users.find((u: any) => 
            u.email?.toLowerCase() === inputIdentifier || 
            u.slug?.toLowerCase() === inputIdentifier ||
            u.name?.toLowerCase() === inputIdentifier
          );

          if (match) {
            userData = {
              id: match.id,
              username: match.slug,
              email: match.email || '',
              nicename: match.name,
              display_name: match.name,
              avatar: match.avatar_urls?.['96'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.slug}`
            };
          }
        }
      }

      if (!userData) {
        throw new Error("Sincronizzazione fallita: non riesco a trovare i dati del tuo profilo specifico.");
      }

      // 4. Salvataggio dati corretti
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