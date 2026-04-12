"use client";

import React from 'react';
import { Home, ShoppingBag, Car, Calendar, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const items = [
    { icon: Home, label: 'Home', active: true },
    { icon: ShoppingBag, label: 'Shop', active: false },
    { icon: Car, label: 'Garage', active: false },
    { icon: Calendar, label: 'Events', active: false },
    { icon: User, label: 'Profile', active: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 md:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {items.map((item, i) => (
          <button 
            key={i} 
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              item.active ? "text-red-600 scale-110" : "text-gray-500 hover:text-white"
            )}
          >
            <item.icon size={22} strokeWidth={item.active ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;