"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import GaragePreview from '@/components/GaragePreview';
import { Plus } from 'lucide-react';

const Garage = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24">
        <div className="px-6 flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Garage</h1>
          <button className="bg-red-600 p-3 rounded-full">
            <Plus size={24} />
          </button>
        </div>
        <GaragePreview />
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Garage;