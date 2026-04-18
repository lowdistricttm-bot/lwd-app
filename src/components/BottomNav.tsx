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
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black/80 backdrop-blur-2xl border-t border-white/5"
      style={{ 
        height: '30px',
        transform: 'translateZ(0)', 
        WebkitTransform: 'translateZ(0)'
      }}
    >
      <div className="relative flex items-center justify-around h-full px-2">
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
              onClick={() => triggerHaptic(12)}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute w-6 h-6 bg-white/5 rounded-full z-0 blur-lg"
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
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none'
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <item.icon 
                  size={16} 
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