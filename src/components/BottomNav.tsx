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
    const checkIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
    setIsIOS(checkIOS);
  }, []);
  
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

  // Altezza che include la safe area ma posiziona le icone in basso
  // 50px è l'altezza standard, env(...) aggiunge lo spazio della barra iOS
  const navHeight = isIOS ? 'calc(50px + env(safe-area-inset-bottom))' : '60px';

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[999] bg-black/90 backdrop-blur-xl border-t border-white/5 select-none"
      style={{ 
        height: navHeight,
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div 
        className={cn(
          "relative flex justify-around w-full max-w-2xl mx-auto px-2 h-full",
          isIOS ? "items-end pb-[env(safe-area-inset-bottom)]" : "items-center"
        )}
      >
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center relative z-10 transition-colors duration-300",
                isIOS ? "h-[50px]" : "h-full",
                isActive ? "text-white" : "text-zinc-600"
              )}
              onClick={() => triggerHaptic(10)}
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </motion.div>
              {/* Puntino indicatore opzionale per feedback visivo vicino alla barra */}
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-1 w-1 h-1 bg-white rounded-full"
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