"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        showSuccess("Controlla la tua email per confermare l'account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showSuccess("Accesso effettuato!");
        navigate('/profile');
      }
    } catch (error: any) {
      showError(error.message || "Errore durante l'autenticazione");
    } finally {
      setLoading(false);
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
              {isSignUp ? 'Crea Account' : 'Bentornato'}
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
              {isSignUp ? 'Unisciti al District' : 'Accedi al tuo account Low District'}
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-8 md:p-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500">Email</Label>
                <Input 
                  type="email" 
                  placeholder="tu@esempio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-zinc-800 rounded-none h-12 font-bold text-xs uppercase tracking-widest focus:border-red-600 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-[0.2em] text-zinc-500">Password</Label>
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
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-none h-14 font-black uppercase italic tracking-widest transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrati Ora' : 'Accedi Ora')}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
            Accedendo accetti i nostri termini di servizio <br /> e la privacy policy del District.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Login;