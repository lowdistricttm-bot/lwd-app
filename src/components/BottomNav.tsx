"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, Calendar, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Bacheca', href: '/community' },
    { icon: ShoppingBag, label: 'Negozio', href: '/shop' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 md:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {items.map((item, i) => (
          <Link 
            key={i} 
            to={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              location.pathname === item.href ? "text-red-600 scale-110" : "text-gray-500 hover:text-white"
            )}
          >
            <item.icon size={22} strokeWidth={location.pathname === item.href ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;