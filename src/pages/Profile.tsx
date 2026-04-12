"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, Grid, Bookmark, Heart, MapPin, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Profile = () => {
  const stats = [
    { label: 'Post', value: '24' },
    { label: 'Followers', value: '1.8k' },
    { label: 'Following', value: '450' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      {/* Header Profilo */}
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-zinc-800 border-2 border-red-600 p-1 rotate-3">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=LowDistrict" 
                alt="avatar" 
                className="w-full h-full rounded-[1.8rem] object-cover -rotate-3" 
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
              PRO
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to="/settings" className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all">
              <SettingsIcon size={20} />
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Marco LD</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-4">@marco_stance_it</p>
          
          <div className="flex flex-wrap gap-4 text-gray-500 text-xs font-bold uppercase tracking-tight mb-6">
            <span className="flex items-center gap-1"><MapPin size={14} /> Milano, IT</span>
            <span className="flex items-center gap-1"><LinkIcon size={14} /> lowdistrict.it</span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            Static enthusiast since 2015. <br />
            Building the lowest E46 in Italy. 🛠️
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-black text-2xl tracking-tighter">{stat.value}</p>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Active Car Badge */}
        <Link to="/garage" className="block mb-10 group">
          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-3xl flex items-center gap-4 group-hover:border-red-600/30 transition-all">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800">
              <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200" alt="Active Car" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Auto Attiva</p>
              <h3 className="font-black text-lg tracking-tight uppercase">BMW M3 E46 <span className="text-gray-600 text-sm font-bold ml-2">STATIC</span></h3>
            </div>
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-red-600 transition-colors">
              <Grid size={18} />
            </div>
          </div>
        </Link>

        {/* Tabs Post */}
        <div className="flex gap-8 mb-6 border-b border-white/5">
          <button className="pb-4 border-b-2 border-red-600 text-xs font-black uppercase tracking-widest">I Miei Post</button>
          <button className="pb-4 text-gray-600 text-xs font-black uppercase tracking-widest">Salvati</button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6,7,8,9].map((i) => (
            <div key={i} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden group cursor-pointer">
              <img 
                src={`https://images.unsplash.com/photo-${1500000000000 + i * 1234567}?auto=format&fit=crop&q=80&w=400`} 
                alt="post" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;