"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import WordPressPortal from '@/components/WordPressPortal';
import { ExternalLink } from 'lucide-react';

const Profile = () => {
  const profileUrl = "https://www.lowdistrict.it/account/";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      {/* Container principale */}
      <div className="flex-1 mt-[calc(4.2rem+env(safe-area-inset-top))] mb-[calc(4rem+env(safe-area-inset-bottom))] relative bg-zinc-950">
        <WordPressPortal 
          url={profileUrl} 
          topOffset={0} // Impostato a 0 per vedere se il contenuto appare
          bottomOffset={0} 
        />
        
        {/* Pulsante di emergenza se l'iframe non carica (es. blocchi di sicurezza WP) */}
        <div className="absolute bottom-4 right-4 z-30">
          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            <ExternalLink size={12} /> Apri nel Browser
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;