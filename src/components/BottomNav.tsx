"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Feed', href: '/bacheca' },
    { icon: Compass, label: 'Esplora', href: '/discover' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/60 backdrop-blur-2xl border-t border-white/5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto px-6">
        {items.map((item, i) => {
          const isActive = location.pathname === item.href;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex flex-col items-center transition-all duration-300 relative p-2",
                isActive ? "text-white scale-110" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
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
  );
};

export default BottomNav;