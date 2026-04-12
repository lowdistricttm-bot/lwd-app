"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';
import { useCart } from '@/hooks/use-cart';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-6",
      isScrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white italic">
              LOW<span className="text-red-600">DISTRICT</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className={cn(
                  "text-[11px] font-black transition-all uppercase tracking-[0.2em] italic",
                  location.pathname === link.href ? "text-red-600" : "text-gray-400 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
            <User size={20} />
          </Link>
          <Link to="/cart" className="text-gray-400 hover:text-white transition-colors relative group">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full group-hover:scale-110 transition-transform">
                {itemCount}
              </span>
            )}
          </Link>
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-500">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              className="text-2xl font-black text-white uppercase tracking-tighter italic"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;