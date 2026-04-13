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
import { Loader2, Info } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Per ora continuiamo a usare Supabase come fallback
      // In futuro qui chiameremo loginWithWp(username, password)
      const { error } = await supabase.auth.signInWithPassword({
        email: username.includes('@') ? username : `${username}@lowdistrict.it`,
        password,
      });

      if (error) throw error;
      
      showSuccess("Accesso effettuato!");
      navigate('/profile');
    } catch (error: any) {
      showError("Credenziali non riconosciute nel District");
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
              Area Riservata
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Accedi con il tuo account Low District
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
                {loading ? <Loader2 className="animate-spin" /> : 'Accedi Ora'}
              </Button>
            </form>
          </div>

          <div className="mt-8 p-4 bg-zinc-900/30 border border-white/5 flex gap-4 items-start">
            <Info className="text-red-600 shrink-0" size={18} />
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
              Nota: L'integrazione diretta con il database di lowdistrict.it è in fase di attivazione. Per ora, crea un nuovo account se è la tua prima volta nell'app.
            </p>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Login;