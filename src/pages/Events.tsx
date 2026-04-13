"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import WordPressPortal from '@/components/WordPressPortal';

const Events = () => {
  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 mt-[calc(4.2rem+env(safe-area-inset-top))] mb-[calc(4rem+env(safe-area-inset-bottom))] relative">
        <WordPressPortal 
          url="https://www.lowdistrict.it/eventi/" 
          topOffset={160} 
          bottomOffset={150} 
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Events;