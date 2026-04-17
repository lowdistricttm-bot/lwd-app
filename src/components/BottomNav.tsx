"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const items = [
    { icon: Home, label: t.nav?.home || 'Home', href: '/' },
    { icon: MessageSquare, label: 'Feed', href: '/bacheca' },
    { icon: Compass, label: 'Esplora', href: '/discover' },
    { icon: ShoppingBag, label: t.nav?.shop || 'Shop', href: '/shop' },
    { icon: Calendar, label: t.nav?.events || 'Eventi', href: '/events' },
    { icon: User, label: t.nav?.profile || 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
      <div className="bg-zinc-900/70 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-3 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {items.map((item, i) => {
            const isActive = location.pathname === item.href;
            return (
              <Link 
                key={i} 
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 relative",
                  isActive ? "text-white scale-110" : "text-zinc-500 hover:text-white"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn(
                  "text-[7px] font-black uppercase tracking-tighter transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;