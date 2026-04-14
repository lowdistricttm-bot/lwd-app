"use client";

import React from 'react';
import { Home, MessageSquare, User, Calendar, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/hooks/use-messages';

const BottomNav = () => {
  const location = useLocation();
  const { data: unreadCount } = useUnreadCount();
  
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'Bacheca', href: '/bacheca' },
    { icon: Mail, label: 'Direct', href: '/messages', badge: unreadCount },
    { icon: Calendar, label: 'Eventi', href: '/events' },
    { icon: User, label: 'Profilo', href: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.href || (item.href === '/messages' && location.pathname.startsWith('/chat'));
          return (
            <Link 
              key={i} 
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all relative",
                isActive ? "text-red-600" : "text-zinc-500 hover:text-white"
              )}
            >
              <div className="relative p-1">
                <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0 -right-1 min-w-[16px] h-[16px] bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-black px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;