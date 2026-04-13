"use client";

import React from 'react';
import { Home, ShoppingBag, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const BottomNav = () => {
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ShoppingBag, label: 'Shop', href: '#' },
    { icon: Calendar, label: 'Eventi', href: '#' },
    { icon: User, label: 'Profilo', href: '#' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item, i) => (
          <Link 
            key={i} 
            to={item.href}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-all"
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;