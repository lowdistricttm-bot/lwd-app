"use client";

import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, MapPin, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    const checkIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
    setIsIOS(checkIOS);
  }, []);
  
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

  // Altezza uniformata: 50px base + safe area su iOS, 60px su altri dispositivi
  const navHeight = isIOS ? 'calc(50px + env(safe-area-inset-bottom))' : '60px';

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black border-t border-white/10 select-none"
      style={{ 
        height: navHeight,
        paddingBottom: 'env(safe-area-inset-bottom)',
        marginBottom: '0px',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div 
        className="relative flex items-center justify-around h-full w-full max-w-2xl mx-auto px-1 sm:px-2"
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