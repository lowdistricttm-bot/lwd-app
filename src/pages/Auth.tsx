"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      try {
        await login(username, password);
        navigate('/profile');
      } catch (err) {
        // Errore gestito dal toast nel hook
      }
    } else {
      // Per la registrazione, rimandiamo al sito web per sicurezza
      window.open('https://www.lowdistrict.it/mio-account/', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 pb-20">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-8">
            <Logo className="h-16" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 italic">
            {isLogin ? "Bentornato" : "Unisciti a noi"}
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            {isLogin ? "Accedi con il tuo account Low District" : "Crea il tuo profilo sul sito ufficiale"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto w-full">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Username o Email</Label>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Il tuo username" 
              className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</Label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-7 rounded-none shadow-xl shadow-red-600/20 italic"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Accedi" : "Vai alla Registrazione")}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            {isLogin ? "Non hai un account? Registrati sul sito" : "Hai già un account? Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;