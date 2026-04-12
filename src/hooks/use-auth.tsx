"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { wcPost } from '@/lib/woocommerce';

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ld_auth_token');
    const savedUser = localStorage.getItem('ld_user_data');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Endpoint standard per il plugin JWT Authentication
      const response = await fetch('https://www.lowdistrict.it/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const userData = {
          id: data.user_id || 0,
          username: data.user_nicename || username,
          email: data.user_email || '',
          nicename: data.user_nicename || '',
          display_name: data.user_display_name || username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user_nicename || username}`
        };

        setToken(data.token);
        setUser(userData);
        localStorage.setItem('ld_auth_token', data.token);
        localStorage.setItem('ld_user_data', JSON.stringify(userData));
        showSuccess(`Bentornato, ${userData.display_name}!`);
      } else {
        // Se il server risponde con un errore specifico (es. password errata)
        const errorMsg = data.message || 'Credenziali non valide o errore server';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      // Se l'errore è il 404 rest_no_route, diamo un consiglio all'utente
      if (error.message.includes('Nessun percorso') || error.message.includes('rest_no_route')) {
        showError("Errore API: Verifica che il plugin JWT sia attivo sul sito.");
      } else {
        showError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const customerData = {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.email.split('@')[0],
        password: userData.password,
      };

      await wcPost('/customers', customerData);
      showSuccess("Account creato con successo! Ora puoi accedere.");
    } catch (error: any) {
      showError(error.message || "Errore durante la registrazione");
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
    showSuccess("Sessione chiusa correttamente");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};