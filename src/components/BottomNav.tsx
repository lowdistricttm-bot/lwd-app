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

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black border-t border-white/10 select-none touch-none md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-fit md:rounded-full md:border md:bg-black/80 md:backdrop-blur-xl md:px-6 md:shadow-2xl md:py-2 transition-all duration-300"
      data-no-swipe="true"
      style={{ 
        minHeight: '38px',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div 
        className="relative flex items-center justify-around h-full w-full md:w-auto md:gap-8 max-w-2xl mx-auto px-1 sm:px-2 py-2 md:py-0"
      >
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full relative z-10 transition-colors duration-300",
                isActive ? "text-white" : "text-zinc-600 hover:text-zinc-400"
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
                  size={20} 
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