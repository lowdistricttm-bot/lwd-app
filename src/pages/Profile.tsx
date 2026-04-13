"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { User, Settings, LogOut, Car, Grid, Heart, MessageSquare, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Membro';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-24">
        {/* Header / Cover Area */}
        <div className="relative h-48 md:h-64 bg-zinc-900 overflow-hidden">
          <img 
            src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <button className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
            <Camera size={18} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 -mt-12 relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <div className="w-32 h-32 bg-zinc-900 border-4 border-black rounded-none flex items-center justify-center overflow-hidden shadow-2xl">
              <User size={60} className="text-zinc-700" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-1">
                {username}
              </h1>
              <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
                Low District Official Member
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/10 bg-zinc-900/50 hover:bg-white hover:text-black rounded-none font-black uppercase text-[10px] tracking-widest italic h-12 px-6">
                <Settings className="mr-2" size={14} /> Edit
              </Button>
              <Button onClick={handleLogout} variant="outline" className="border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest italic h-12 px-4">
                <LogOut size={14} />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-y border-white/5 py-6 mb-8">
            {[
              { label: 'Post', value: '0' },
              { label: 'Follower', value: '12' },
              { label: 'Garage', value: '1' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-black italic">{stat.value}</p>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'posts', label: 'Attività', icon: Grid },
              { id: 'garage', label: 'Il mio Garage', icon: Car },
              { id: 'likes', label: 'Preferiti', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                  activeTab === tab.id ? "border-red-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'posts' && (
              <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5">
                <MessageSquare className="mx-auto text-zinc-800 mb-4" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nessuna attività recente</p>
                <Button className="mt-6 bg-white text-black hover:bg-red-600 hover:text-white rounded-none text-[10px] font-black uppercase italic tracking-widest">
                  Crea il tuo primo post
                </Button>
              </div>
            )}

            {activeTab === 'garage' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-zinc-900/50 border border-white/5 p-6 flex items-center gap-6 group hover:border-red-600/30 transition-all">
                  <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center">
                    <Car size={30} className="text-zinc-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase italic">Aggiungi il tuo Progetto</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mostra al District la tua build</p>
                  </div>
                  <Button className="ml-auto bg-red-600 hover:bg-white hover:text-black rounded-none w-10 h-10 p-0">
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;