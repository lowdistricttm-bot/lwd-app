"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const location = useLocation();
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Bacheca', href: '/bacheca' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.href || (item.href === '/profile' && location.pathname === '/login');
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-red-600" : "text-zinc-500 hover:text-white"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;