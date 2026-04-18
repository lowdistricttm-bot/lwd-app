"use client";

import React, { useRef, useEffect } from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Feed', href: '/bacheca' },
    { icon: Compass, label: 'Esplora', href: '/discover' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  const activeIndex = items.findIndex(item => item.href === location.pathname);

  // Gestione della vibrazione per feedback "liquido"
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Funzione per gestire lo scorrimento (Pan) sulla barra
  const handlePan = (event: any, info: any) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const width = rect.width;
    
    // Calcola l'indice in base alla posizione del dito
    const newIndex = Math.max(0, Math.min(items.length - 1, Math.floor((x / width) * items.length)));
    
    if (newIndex !== activeIndex) {
      triggerHaptic();
      navigate(items[newIndex].href);
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
      <motion.div 
        ref={containerRef}
        onPan={handlePan}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
        className="pointer-events-auto relative flex items-center bg-zinc-900/60 backdrop-blur-3xl border border-white/10 p-1.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-md w-full"
      >
        {/* Indicatore Liquido (Sfondo Mobile) */}
        <AnimatePresence>
          {activeIndex !== -1 && (
            <motion.div
              layoutId="liquid-pill"
              className="absolute h-[calc(100%-12px)] bg-white rounded-full z-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 1
              }}
              style={{
                width: `${100 / items.length}%`,
                left: `${(activeIndex * 100) / items.length}%`,
                margin: '6px 0'
              }}
            />
          )}
        </AnimatePresence>

        {/* Icone */}
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 relative z-10 transition-all duration-500",
                isActive ? "text-black" : "text-zinc-500"
              )}
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className="transition-colors duration-300"
                />
              </motion.div>
              
              {/* Label opzionale per accessibilità o stile (nascosta su mobile piccolo) */}
              <span className={cn(
                "text-[7px] font-black uppercase tracking-widest mt-1 transition-all duration-500 overflow-hidden",
                isActive ? "h-auto opacity-100" : "h-0 opacity-0"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;