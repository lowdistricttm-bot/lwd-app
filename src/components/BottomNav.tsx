"use client";

import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Rilevamento semplice iOS
    const checkIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
    setIsIOS(checkIOS);
  }, []);
  
  // Nascondiamo la barra nelle pagine di chat dove c'è l'input dei messaggi
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

  // Altezza ultra-ridotta: 16px su iOS, 40px altrove
  const navHeight = isIOS ? '16px' : '40px';

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black/95 backdrop-blur-3xl border-t border-white/10 select-none"
      style={{ 
        height: navHeight,
        paddingBottom: '0px', // Padding inferiore azzerato
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div className="absolute inset-0 bg-black -z-10" />

      <div 
        className="relative flex items-center justify-around px-2 max-w-lg mx-auto"
        style={{ height: navHeight }}
      >
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
                  className="absolute w-4 h-4 bg-white/5 rounded-full z-0 blur-md"
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
                  size={isIOS ? 12 : 18} 
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