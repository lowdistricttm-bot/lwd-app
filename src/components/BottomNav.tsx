"use client";

import React, { useRef } from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handlePan = (event: any, info: any) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const width = rect.width;
    
    const newIndex = Math.max(0, Math.min(items.length - 1, Math.floor((x / width) * items.length)));
    
    if (newIndex !== activeIndex && activeIndex !== -1) {
      triggerHaptic();
      navigate(items[newIndex].href);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <motion.div 
        ref={containerRef}
        onPan={handlePan}
        className="relative flex items-center h-16 px-2"
      >
        {/* Indicatore Liquido */}
        <AnimatePresence>
          {activeIndex !== -1 && (
            <motion.div
              layoutId="active-pill"
              className="absolute h-10 bg-white/10 rounded-xl z-0"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35
              }}
              style={{
                width: `calc(${100 / items.length}% - 12px)`,
                left: `calc(${(activeIndex * 100) / items.length}% + 6px)`,
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
                "flex-1 flex flex-col items-center justify-center h-full relative z-10 transition-colors duration-300",
                isActive ? "text-white" : "text-zinc-500"
              )}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className="transition-transform duration-300"
                style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
              />
              <span className="text-[7px] font-black uppercase tracking-widest mt-1">
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