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
      showError(error.message || "Credenziali non valide");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[380px]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-3">{t.auth.title}</h1>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] leading-relaxed">{t.auth.subtitle}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[9px] tracking-[0.2em] text-zinc-500 ml-4">{t.auth.username}</Label>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-zinc-900/50 border-zinc-800 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-[9px] tracking-[0.2em] text-zinc-500 ml-4">{t.auth.password}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-zinc-900/50 border-zinc-800 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus:border-primary transition-all" />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-white hover:scale-105 rounded-full h-16 font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-primary/20">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center justify-center gap-2">{t.auth.login} <ArrowRight size={18} /></span>}
            </Button>
          </form>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Login;