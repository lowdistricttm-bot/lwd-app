"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const items = [
    { icon: Home, label: t.nav?.home || 'Home', href: '/' },
    { icon: MessageSquare, label: 'Bacheca', href: '/bacheca' },
    { icon: ShoppingBag, label: t.nav?.shop || 'Shop', href: '/shop' },
    { icon: Calendar, label: t.nav?.events || 'Eventi', href: '/events' },
    { icon: User, label: t.nav?.profile || 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.href;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-white scale-110" : "text-zinc-500 hover:text-white"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className={cn(
                "text-[8px] font-black uppercase tracking-tighter transition-opacity",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;