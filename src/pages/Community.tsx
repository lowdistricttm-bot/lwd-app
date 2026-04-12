"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import GaragePreview from '@/components/GaragePreview';

const Community = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24">
        <div className="px-6 mb-8 max-w-xl mx-auto">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Community</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Activity Stream & Updates</p>
        </div>
        <GaragePreview />
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Community;