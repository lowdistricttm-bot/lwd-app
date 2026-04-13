"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { User, Settings, LogOut, Package, Car, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-6 max-w-4xl mx-auto w-full">
        <header className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
            <User size={40} className="text-zinc-700" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
              {user?.email?.split('@')[0] || 'Membro'}
            </h1>
            <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">
              Low District Member
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { icon: Package, label: 'I miei Ordini', desc: 'Gestisci i tuoi acquisti' },
            { icon: Car, label: 'Il mio Garage', desc: 'I tuoi progetti stance' },
            { icon: Bell, label: 'Notifiche', desc: 'Avvisi e aggiornamenti' },
            { icon: Settings, label: 'Impostazioni', desc: 'Gestisci il tuo account' },
          ].map((item, i) => (
            <button key={i} className="bg-zinc-900/50 border border-white/5 p-6 flex items-center gap-6 hover:border-red-600/30 transition-all group text-left">
              <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase italic">{item.label}</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full border-white/10 text-zinc-500 hover:text-red-600 hover:border-red-600/50 rounded-none py-8 font-black uppercase tracking-widest italic"
        >
          <LogOut className="mr-2" size={18} /> Disconnetti Sessione
        </Button>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;