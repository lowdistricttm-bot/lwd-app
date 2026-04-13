"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import WordPressPortal from '@/components/WordPressPortal';
import { useAuth } from '@/hooks/use-auth';
import { Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Members = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 mt-[calc(4.2rem+env(safe-area-inset-top))] mb-[calc(4rem+env(safe-area-inset-bottom))] relative">
        {user ? (
          <WordPressPortal 
            url="https://www.lowdistrict.it/membri" 
            topOffset={160} 
            bottomOffset={150} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5">
              <Lock size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">Membri Ufficiali</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10 max-w-xs">
              La lista dei membri è visibile solo agli utenti registrati.
            </p>
            <Link to="/auth" state={{ from: location.pathname }} className="w-full max-w-xs">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-8 rounded-none italic shadow-xl shadow-red-600/10">
                Accedi per Vedere i Membri
              </Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Members;