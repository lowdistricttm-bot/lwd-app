"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, MapPin, Link as LinkIcon, User as UserIcon, Users, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useWcCustomerCount } from '@/hooks/use-woocommerce';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'orders'>('activity');
  const [imgError, setImgError] = useState(false);
  const { user, logout, refreshUser, isLoading } = useAuth();
  const { data: customerCount } = useWcCustomerCount();
  const location = useLocation();

  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  // Sincronizza i dati quando si entra nel profilo
  useEffect(() => {
    if (user) refreshUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Verifica sessione...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <Navbar />
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <UserIcon size={40} className="text-gray-700" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Area Riservata</h1>
        <p className="text-gray-500 mb-8 uppercase text-[10px] font-black tracking-widest">Accedi per gestire il tuo garage e i tuoi ordini</p>
        <Link to="/auth" state={{ from: location.pathname }}>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-12 py-6 rounded-none italic">
            Accedi / Registrati
          </Button>
        </Link>
        <BottomNav />
      </div>
    );
  }

  const stats = [
    { label: 'Attività', value: '0' },
    { label: 'Amici', value: '0' },
    { label: 'Gruppi', value: '0' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-2 border-red-600 p-1 rotate-3 flex items-center justify-center overflow-hidden">
              <img 
                src={imgError || !user.avatar ? defaultAvatar : user.avatar} 
                alt="avatar" 
                className="w-full h-full rounded-[1.8rem] object-cover -rotate-3" 
                onError={() => setImgError(true)}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
              MEMBER
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => refreshUser()} className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all">
              <RefreshCw size={20} className="text-gray-400" />
            </button>
            <Link to="/settings" className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all">
              <SettingsIcon size={20} />
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1 italic">{user.display_name}</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-4">@{user.username}</p>
          
          <div className="flex flex-wrap gap-4 text-gray-500 text-[10px] font-black uppercase tracking-tight mb-6">
            <span className="flex items-center gap-1"><MapPin size={14} /> Community Member</span>
            <span className="flex items-center gap-1"><LinkIcon size={14} /> lowdistrict.it</span>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/10 rounded-xl">
                <Users className="text-red-600" size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Membri Community</span>
            </div>
            <span className="text-xl font-black italic">{customerCount || "..."}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-black text-2xl tracking-tighter italic">{stat.value}</p>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-8 mb-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('activity')}
            className={cn(
              "pb-4 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'activity' ? "border-b-2 border-red-600 text-white" : "text-gray-600"
            )}
          >
            Attività
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "pb-4 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'orders' ? "border-b-2 border-red-600 text-white" : "text-gray-600"
            )}
          >
            Ordini
          </button>
        </div>

        {activeTab === 'activity' ? (
          <div className="py-20 text-center border border-dashed border-white/5">
            <MessageSquare className="mx-auto text-gray-800 mb-4" size={40} />
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessuna attività recente</p>
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/5">
            <Package className="mx-auto text-gray-800 mb-4" size={40} />
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessun ordine trovato</p>
          </div>
        )}

        <div className="mt-12">
          <Button 
            onClick={logout}
            variant="outline" 
            className="w-full border-white/10 text-gray-500 hover:text-red-600 hover:border-red-600/50 font-black uppercase tracking-widest py-6 rounded-none italic"
          >
            Disconnetti Account
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;