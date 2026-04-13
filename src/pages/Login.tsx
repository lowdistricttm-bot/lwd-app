"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useWpAuth } from '@/hooks/use-wp-auth';

const Login = () => {
  const navigate = useNavigate();
  const { loginWithWp, isLoading } = useWpAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Tenta il login tramite l'API di WordPress
      await loginWithWp(username, password);
      
      showSuccess("Bentornato nel District!");
      navigate('/profile');
    } catch (error: any) {
      showError(error.message || "Credenziali non valide o errore di connessione");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12">
            <Logo className="h-12 mx-auto mb-8" variant="white" />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
              Area Riservata
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Accedi con le tue credenziali Low District
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-8 md:p-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500">Username</Label>
                <Input 
                  type="text" 
                  placeholder="IL TUO USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-transparent border-zinc-800 rounded-none h-12 font-bold text-xs uppercase tracking-widest focus:border-red-600 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500">Password</Label>
                  <a 
                    href="https://www.lowdistrict.it/my-account/lost-password/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-black uppercase text-zinc-600 hover:text-white transition-colors"
                  >
                    Smarrita?
                  </a>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-zinc-800 rounded-none h-12 font-bold text-xs uppercase tracking-widest focus:border-red-600 transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-none h-14 font-black uppercase italic tracking-widest transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Accedi Ora'}
              </Button>
            </form>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-4">
              Non sei ancora un membro?
            </p>
            <a 
              href="https://www.lowdistrict.it/my-account/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:text-red-600 hover:border-red-600 transition-all"
            >
              Registrati sul sito ufficiale
            </a>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Login;