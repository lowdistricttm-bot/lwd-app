"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess } from '@/utils/toast';
import { ChevronLeft, Car } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(isLogin ? "Bentornato in Low District!" : "Account creato con successo!");
    navigate('/profile');
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
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-2xl shadow-red-600/20">
            <Car size={40} className="text-white -rotate-3" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            {isLogin ? "Bentornato" : "Unisciti a noi"}
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
            {isLogin ? "Accedi al tuo garage" : "Crea il tuo profilo stance"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto w-full">
          {!isLogin && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Username</Label>
              <Input 
                placeholder="@tuo_nome" 
                className="bg-zinc-900 border-white/5 rounded-2xl py-6 focus:ring-red-600"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email</Label>
            <Input 
              type="email" 
              placeholder="email@esempio.it" 
              className="bg-zinc-900 border-white/5 rounded-2xl py-6 focus:ring-red-600"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="bg-zinc-900 border-white/5 rounded-2xl py-6 focus:ring-red-600"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-7 rounded-2xl shadow-xl shadow-red-600/20">
            {isLogin ? "Accedi" : "Registrati"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            {isLogin ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;