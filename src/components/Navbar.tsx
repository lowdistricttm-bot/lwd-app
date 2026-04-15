"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, X, Send } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '@/hooks/use-cart';
import { useMessages } from '@/hooks/use-messages';
import CartDrawer from './CartDrawer';
import { Input } from './ui/input';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useCart();
  const { unreadCount } = useMessages();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-[calc(4rem+env(safe-area-inset-top))] px-6 flex items-center justify-between">
        <div className="flex-1 flex items-center gap-2">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Search size={20} />
          </button>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors relative"
          >
            <ShoppingBag size={20} />
            {items.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-700 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">
                {items.length}
              </span>
            )}
          </button>
        </div>

        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo className="h-6 md:h-8" />
        </Link>

        <div className="flex-1 flex items-center justify-end gap-2">
          <Link 
            to="/messages"
            className="p-2 text-zinc-400 hover:text-white transition-colors relative"
          >
            <Send size={20} className="-rotate-12" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-700 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col p-6">
          <div className="flex justify-end mb-12">
            <button onClick={() => setIsSearchOpen(false)} className="p-2 text-zinc-400 hover:text-white">
              <X size={32} />
            </button>
          </div>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Cerca nel District</h2>
            <Input 
              autoFocus
              placeholder="COSA STAI CERCANDO?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-4xl md:text-6xl font-black uppercase italic tracking-tighter p-0 h-auto focus-visible:ring-0 placeholder:text-zinc-800"
            />
          </form>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;