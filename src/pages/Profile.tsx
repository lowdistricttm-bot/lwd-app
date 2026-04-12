"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, Grid, ShoppingBag, Package, MapPin, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'orders'>('posts');

  const stats = [
    { label: 'Post', value: '24' },
    { label: 'Ordini', value: '2' },
    { label: 'Following', value: '450' },
  ];

  const mockOrders = [
    { id: '#LD-8921', date: '12 Feb 2024', total: '€85.00', status: 'In Consegna' },
    { id: '#LD-7742', date: '05 Gen 2024', total: '€40.00', status: 'Consegnato' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
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
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1 italic">Marco LD</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-4">@marco_stance_it</p>
          
          <div className="flex flex-wrap gap-4 text-gray-500 text-xs font-bold uppercase tracking-tight mb-6">
            <span className="flex items-center gap-1"><MapPin size={14} /> Milano, IT</span>
            <span className="flex items-center gap-1"><LinkIcon size={14} /> lowdistrict.it</span>
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

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('posts')}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'posts' ? "border-b-2 border-red-600 text-white" : "text-gray-600"
            )}
          >
            I Miei Post
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'orders' ? "border-b-2 border-red-600 text-white" : "text-gray-600"
            )}
          >
            Ordini
          </button>
        </div>

        {activeTab === 'posts' ? (
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden group cursor-pointer">
                <img 
                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 1234567}?auto=format&fit=crop&q=80&w=400`} 
                  alt="post" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 flex items-center justify-between group hover:border-red-600/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black rounded-xl">
                    <Package size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight italic">{order.id}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.date} • {order.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-1",
                    order.status === 'Consegnato' ? "bg-green-500/10 text-green-500" : "bg-red-600/10 text-red-600"
                  )}>
                    {order.status}
                  </span>
                  <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;