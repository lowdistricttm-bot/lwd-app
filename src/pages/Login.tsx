"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useWpAuth } from '@/hooks/use-wp-auth';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/hooks/use-translation';

const Login = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { loginWithWp, isLoading } = useWpAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginWithWp(username, password);
      const { data: { session } } = await supabase.auth.getSession();
      showSuccess(language === 'it' ? "Accesso effettuato" : "Login successful");
      if (session) navigate('/profile');
      else setTimeout(() => navigate('/profile'), 500);
    } catch (error: any) {
      showError(error.message || (language === 'it' ? "Credenziali non valide" : "Invalid credentials"));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[380px]"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-3">
              {t.auth.title}
            </h1>
            <div className="h-[1px] w-12 bg-white/20 mx-auto mb-4" />
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] leading-relaxed">
              {t.auth.subtitle}
            </p>
          </div>

          <div className="space-y-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[9px] tracking-[0.2em] text-zinc-500 ml-1">
                  {t.auth.username}
                </Label>
                <Input 
                  type="text" 
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-zinc-900/30 border-zinc-800 rounded-none h-14 font-bold text-xs tracking-widest focus:border-white focus:bg-zinc-900/50 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="font-black uppercase text-[9px] tracking-[0.2em] text-zinc-500">
                    {t.auth.password}
                  </Label>
                  <a 
                    href="https://www.lowdistrict.it/account/lost-password/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[8px] font-black uppercase text-zinc-600 hover:text-white transition-colors tracking-widest"
                  >
                    {t.auth.forgot}
                  </a>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-900/30 border-zinc-800 rounded-none h-14 font-bold text-xs tracking-widest focus:border-white focus:bg-zinc-900/50 transition-all duration-300"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white/70 backdrop-blur-2xl text-black hover:bg-white hover:scale-[1.05] active:scale-[0.98] rounded-none h-16 font-black uppercase italic tracking-[0.2em] transition-all duration-500 group shadow-2xl border-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {t.auth.login} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-4">
                {t.auth.notMember}
              </p>
              <a 
                href="https://www.lowdistrict.it/my-account/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-zinc-400 transition-all group"
              >
                {t.auth.register}
                <div className="h-[1px] w-0 group-hover:w-4 bg-zinc-400 transition-all" />
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Login;