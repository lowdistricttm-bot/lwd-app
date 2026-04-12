"use client";

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperiamo la pagina di provenienza dallo stato, altrimenti andiamo al profilo
  const from = location.state?.from || '/profile';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        // Reindirizziamo alla pagina corretta
        navigate(from, { replace: true });
      } else {
        await register({
          ...formData,
          email: formData.email
        });
        setIsLogin(true);
      }
    } catch (err) {
      // Errori gestiti dai toast
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
            {isLogin ? "Bentornato" : "Nuovo Profilo"}
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            {isLogin ? "Accedi con Email o Username" : "Entra a far parte della community"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-sm mx-auto w-full">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nome</Label>
                <Input 
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Es. Marco" 
                  className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Cognome</Label>
                <Input 
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Es. Rossi" 
                  className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={isLogin ? "username" : "email"} className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
              {isLogin ? "Email o Username" : "Email"}
            </Label>
            <Input 
              id={isLogin ? "username" : "email"}
              type={isLogin ? "text" : "email"}
              value={isLogin ? formData.username : formData.email}
              onChange={handleInputChange}
              placeholder={isLogin ? "Nickname o email" : "tua@email.com"} 
              className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</Label>
            <Input 
              id="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••" 
              className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-7 rounded-none shadow-xl shadow-red-600/20 italic mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Accedi" : "Crea Account")}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            {isLogin ? "Non hai un account? Registrati ora" : "Hai già un account? Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;