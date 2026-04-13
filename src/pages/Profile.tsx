"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import WordPressPortal from '@/components/WordPressPortal';

const Profile = () => {
  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 mt-[calc(4.2rem+env(safe-area-inset-top))] mb-[calc(4rem+env(safe-area-inset-bottom))] relative bg-black">
        <WordPressPortal 
          url="https://www.lowdistrict.it/account" 
          topOffset={0} 
          bottomOffset={0} 
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;