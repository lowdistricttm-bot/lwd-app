"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  
  // Nascondi la nav nelle chat per lasciare spazio alla tastiera
  if (location.pathname.startsWith('/chat/')) return null;

  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Feed', href: '/bacheca' },
    { icon: Compass, label: 'Esplora', href: '/discover' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  const activeIndex = items.findIndex(item => item.href === location.pathname);

  const triggerHaptic = (intensity: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black border-t border-white/10 select-none"
      style={{ 
        // Altezza dinamica: 60px di barra + lo spazio della "home bar" di iOS
        height: 'calc(60px + env(safe-area-inset-bottom))',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div 
        className="flex items-center justify-around w-full h-[60px] max-w-2xl mx-auto px-2"
      >
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full relative z-10 transition-colors duration-300",
                isActive ? "text-white" : "text-zinc-600"
              )}
              onClick={() => triggerHaptic(10)}
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
      {/* Spazio di riempimento per la safe area inferiore */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
};

export default BottomNav;