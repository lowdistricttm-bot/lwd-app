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

      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server response was not JSON:", text);
        throw new Error("Il server ha risposto con un formato non valido. Verifica i Permalink su WordPress.");
      }

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
        throw new Error(data.message || 'Credenziali non valide');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      showError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.lowdistrict.it/wp-json/wp/v2/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username || userData.email.split('@')[0],
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Errore durante la registrazione");
      }

      showSuccess("Account creato! Ora puoi accedere.");
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