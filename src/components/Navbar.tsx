"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/hooks/use-cart';
import Logo from './Logo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.shop, href: '/shop' },
    { name: t.nav.events, href: '/events' },
    { name: t.nav.garage, href: '/garage' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 h-20 flex items-center",
      isScrolled 
        ? "bg-black/80 backdrop-blur-xl border-b border-white/5 h-16" 
        : "bg-black border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo className="h-6 md:h-8" />
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className={cn(
                  "text-[11px] font-black transition-all uppercase tracking-[0.25em] italic relative group",
                  location.pathname === link.href ? "text-red-600" : "text-gray-400 hover:text-white"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full",
                  location.pathname === link.href && "w-full"
                )} />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-6 border-r border-white/10 pr-6 mr-2">
            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <User size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
            </Link>
            <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">
              <Settings size={18} />
            </Link>
          </div>

          <Link to="/cart" className="text-gray-400 hover:text-white transition-colors relative group p-2">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Link>
          
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black z-[-1] transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-8 px-8",
        isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}>
        {navLinks.map((link, i) => (
          <Link 
            key={link.name} 
            to={link.href}
            className="text-4xl font-black text-white uppercase tracking-tighter italic hover:text-red-600 transition-colors"
            style={{ transitionDelay: `${i * 50}ms` }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="mt-12 flex gap-8">
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 font-black uppercase tracking-widest text-xs">Profilo</Link>
          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 font-black uppercase tracking-widest text-xs">Impostazioni</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;