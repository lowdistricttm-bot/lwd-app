"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const location = useLocation();
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Bacheca', href: '/bacheca' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.href;
          const isCenter = i === 2;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-red-600" : "text-zinc-500 hover:text-white",
                isCenter && "scale-110 -translate-y-1"
              )}
            >
              <item.icon size={isCenter ? 24 : 20} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;