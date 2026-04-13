"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import WordPressPortal from '@/components/WordPressPortal';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useLocation } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Se non è loggato nell'app, rimanda alla landing
  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 mt-[calc(4.2rem+env(safe-area-inset-top))] mb-[calc(4rem+env(safe-area-inset-bottom))] relative">
        <WordPressPortal 
          url="https://www.lowdistrict.it/account/" 
          topOffset={160} 
          bottomOffset={150} 
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;