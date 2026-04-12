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
      let wpUserId: number | null = null;

      // 2. Recupero ID Utente
      const meResponse = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/me?JWT=${jwtToken}`);
      if (meResponse.ok) {
        const meData = await meResponse.json();
        wpUserId = meData.id;
      }

      if (!wpUserId && resData.data?.user?.id) {
        wpUserId = resData.data.user.id;
      }

      // 3. RECUPERO AVATAR MULTI-SORGENTE
      let finalAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;

      if (wpUserId) {
        // Prova BuddyPress
        try {
          const bpResponse = await fetch(`https://www.lowdistrict.it/wp-json/buddypress/v1/members/${wpUserId}?JWT=${jwtToken}`);
          if (bpResponse.ok) {
            const bpData = await bpResponse.json();
            const bpAvatar = bpData.avatar_urls?.full || bpData.avatar_urls?.thumb;
            if (bpAvatar && !bpAvatar.includes('mystery-man')) {
              finalAvatar = bpAvatar;
            }
            
            userData = {
              id: bpData.id,
              username: bpData.user_login || bpData.mention_name,
              email: '',
              nicename: bpData.name,
              display_name: bpData.name,
              avatar: finalAvatar,
              mention_name: bpData.mention_name
            };
          }
        } catch (e) {}

        // Prova WordPress (Gravatar) se BuddyPress non ha dato risultati certi
        if (!userData || finalAvatar.includes('dicebear')) {
          try {
            const wpResponse = await fetch(`https://www.lowdistrict.it/wp-json/wp/v2/users/${wpUserId}?JWT=${jwtToken}`);
            if (wpResponse.ok) {
              const wpData = await wpResponse.json();
              const wpAvatar = wpData.avatar_urls?.['96'] || wpData.avatar_urls?.['48'];
              if (wpAvatar && !wpAvatar.includes('gravatar.com/avatar/0000')) {
                finalAvatar = wpAvatar;
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

      // 4. Fallback finale
      if (!userData) {
        userData = {
          id: wpUserId || Date.now(),
          username: cleanUsername.split('@')[0],
          email: cleanUsername.includes('@') ? cleanUsername : '',
          nicename: cleanUsername.split('@')[0],
          display_name: cleanUsername.split('@')[0],
          avatar: finalAvatar
        };
      }

      // Forza aggiornamento pulendo la vecchia sessione
      localStorage.removeItem('ld_user_data');
      saveAuth(jwtToken, userData);
      showSuccess(`Profilo sincronizzato!`);
      
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