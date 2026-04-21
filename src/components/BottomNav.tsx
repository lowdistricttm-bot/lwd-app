"use client";

import React from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, MapPin, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  
  if (location.pathname.startsWith('/chat/')) return null;

  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Bacheca', href: '/bacheca' },
    { icon: MapPin, label: 'Meet', href: '/meets' },
    { icon: Compass, label: 'Esplora', href: '/discover' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  const activeIndex = items.findIndex(item => item.href === location.pathname);

  const triggerHaptic = (intensity: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  };

  // Altezza fissa 56px
  const navHeight = "56px";

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black border-t border-white/10 select-none"
      style={{ 
        height: navHeight,
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div 
        className="relative flex items-end justify-around h-full w-full max-w-2xl mx-auto px-1 sm:px-2 pb-2"
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
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.2 : 1.8} 
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