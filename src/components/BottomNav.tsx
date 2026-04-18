"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Home, ShoppingBag, MessageSquare, User, Calendar, Compass } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Feed', href: '/bacheca' },
    { icon: Compass, label: 'Esplora', href: '/discover' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  const activeIndex = items.findIndex(item => item.href === location.pathname);
  
  // Valori di movimento per lo scorrimento continuo dell'indicatore
  const indicatorX = useMotionValue(0);
  const springX = useSpring(indicatorX, { stiffness: 300, damping: 35 });

  const triggerHaptic = (intensity: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  };

  // Posiziona l'indicatore inizialmente e quando cambia la pagina normalmente
  useEffect(() => {
    if (activeIndex !== -1 && !isScrubbing && containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const itemWidth = width / items.length;
      const targetX = (activeIndex * itemWidth) + (itemWidth / 2);
      indicatorX.set(targetX);
    }
  }, [activeIndex, isScrubbing, items.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Avvia il timer per la pressione prolungata
    longPressTimer.current = setTimeout(() => {
      setIsScrubbing(true);
      triggerHaptic(25); // Feedback più forte per l'attivazione dello scroll
    }, 300);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setIsScrubbing(false);
  };

  const handlePan = (event: any, info: any) => {
    if (!containerRef.current || !isScrubbing) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, info.point.x - rect.left));
    const width = rect.width;
    
    // Movimento visuale continuo dell'indicatore
    indicatorX.set(x);
    
    // Calcolo dell'indice basato sulla posizione del dito
    const newIndex = Math.max(0, Math.min(items.length - 1, Math.floor((x / width) * items.length)));
    
    if (newIndex !== activeIndex && activeIndex !== -1) {
      triggerHaptic(5);
      // Navigazione fluida durante lo scorrimento
      navigate(items[newIndex].href, { replace: true });
    }
  };

  const handlePanEnd = () => {
    setIsScrubbing(false);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <motion.div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="relative flex items-center h-14 md:h-16 px-2 touch-none"
      >
        {/* Indicatore Liquido Continuo (Glow) */}
        <motion.div
          className="absolute w-10 h-10 bg-white/10 rounded-full z-0 blur-xl"
          style={{
            x: springX,
            translateX: '-50%',
            left: 0
          }}
        />

        {/* Icone */}
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full relative z-10 transition-all duration-500",
                isActive ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
              onClick={(e) => {
                // Impedisce il click normale se stiamo facendo scrubbing
                if (isScrubbing) e.preventDefault();
              }}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className="transition-all duration-500"
                style={{ 
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none'
                }}
              />
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;