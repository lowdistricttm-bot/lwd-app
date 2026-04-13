"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import GaragePreview from '@/components/GaragePreview';
import MembersList from '@/components/MembersList';
import { useAuth } from '@/hooks/use-auth';
import { Lock, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Community = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const openWebBacheca = () => {
    navigate('/wp-portal', { 
      state: { 
        title: "Bacheca Social", 
        url: "https://www.lowdistrict.it/bacheca" 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24">
        <div className="px-6 mb-8 max-w-xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Bacheca</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Activity Stream & Updates</p>
          </div>
          {user && (
            <button 
              onClick={openWebBacheca}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-600 border border-red-600/20 px-3 py-2 hover:bg-red-600 hover:text-white transition-all italic"
            >
              <ExternalLink size={12} /> Versione Web
            </button>
          )}
        </div>

        {user ? (
          <div className="max-w-xl mx-auto">
            <MembersList />
            <GaragePreview />
          </div>
        ) : (
          <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
              <Lock size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">Contenuto Riservato</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
              La bacheca di Low District è accessibile solo ai membri della community. Accedi al tuo account per vedere i post e interagire.
            </p>
            
            <div className="space-y-4">
              <Link to="/auth" state={{ from: location.pathname }}>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-8 rounded-none italic shadow-xl shadow-red-600/10">
                  Accedi / Registrati
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Community;