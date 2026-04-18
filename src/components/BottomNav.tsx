"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
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

  const activeIndex = items.findIndex(item => item.href === location.pathname);

  const triggerHaptic = (intensity: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex items-center h-14 md:h-16 px-2">
        {/* Icone */}
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full relative z-10 transition-all duration-300",
                isActive ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
              onClick={() => triggerHaptic(15)}
            >
              {/* Indicatore Glow Reattivo */}
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute w-12 h-12 bg-white/10 rounded-full z-0 blur-xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}

              <motion.div
                animate={{ 
                  scale: isActive ? 1.2 : 1,
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none'
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;