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
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black/90 backdrop-blur-2xl border-t border-white/10"
      style={{ 
        transform: 'translateZ(0)', 
        WebkitTransform: 'translateZ(0)'
      }}
    >
      <div className="relative flex items-center justify-around h-[calc(44px+env(safe-area-inset-bottom))] px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-[44px] relative z-10 transition-all duration-300",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-400"
              )}
              onClick={() => triggerHaptic(15)}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute w-8 h-8 bg-white/10 rounded-full z-0 blur-xl"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}

              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  filter: isActive ? 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' : 'none'
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <item.icon 
                  size={18} 
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