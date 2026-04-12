"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, Grid, Bookmark, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-red-600 p-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=LowDistrict" alt="avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">LOW_DISTRICT_USER</h1>
              <p className="text-gray-500 text-sm">Static Enthusiast | Milano</p>
            </div>
          </div>
          <Link to="/settings" className="p-2 bg-white/5 rounded-full">
            <SettingsIcon size={20} />
          </Link>
        </div>

        <div className="flex justify-around py-6 border-y border-white/5 mb-8">
          <div className="text-center">
            <p className="font-black text-xl">12</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Post</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl">1.2k</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl">450</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Following</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="aspect-square bg-zinc-900 overflow-hidden">
              <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&q=80&w=400`} alt="post" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;