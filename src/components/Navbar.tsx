"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, X, Send, Bell, ShieldAlert } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '@/hooks/use-cart';
import { useMessages } from '@/hooks/use-messages';
import { useNotifications } from '@/hooks/use-notifications';
import { useAdmin } from '@/hooks/use-admin';
import CartDrawer from './CartDrawer';
import NotificationDrawer from './NotificationDrawer';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isRestrictedOpen, setIsRestrictedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { items } = useCart();
  const { unreadCount: unreadMessages } = useMessages();
  const { unreadCount: unreadNotifications } = useNotifications();
  const { role } = useAdmin();
  const navigate = useNavigate();

  const isSubscriber = role === 'subscriber';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleDirectClick = () => {
    if (isSubscriber) {
      setIsRestrictedOpen(true);
    } else {
      navigate('/messages');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-[calc(4rem+env(safe-area-inset-top))] px-6 flex items-center justify-between">
        <div className="flex-1 flex items-center gap-2">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 text-zinc-400 hover:text-white transition-colors"><Search size={20} /></button>
          <button onClick={() => setIsCartOpen(true)} className="p-2 text-zinc-400 hover:text-white transition-colors relative">
            <ShoppingBag size={20} />
            {items.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-700 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">{items.length}</span>}
          </button>
        </div>

        <Link to="/" className="hover:opacity-80 transition-opacity"><Logo className="h-6 md:h-8" /></Link>

        <div className="flex-1 flex items-center justify-end gap-2">
          <button onClick={() => setIsNotificationsOpen(true)} className="p-2 text-zinc-400 hover:text-white transition-colors relative">
            <Bell size={20} />
            {unreadNotifications > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-white text-black text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
          </button>

          {/* Icona Direct - Sempre visibile, ma con controllo al click */}
          <button 
            onClick={handleDirectClick}
            className="p-2 text-zinc-400 hover:text-white transition-colors relative"
          >
            <Send size={20} className="-rotate-12" />
            {!isSubscriber && unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-white text-black text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in duration-300">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col p-6">
          <div className="flex justify-end mb-12"><button onClick={() => setIsSearchOpen(false)} className="p-2 text-zinc-400 hover:text-white"><X size={32} /></button></div>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Cerca nel District</h2>
            <Input autoFocus placeholder="COSA STAI CERCANDO?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-4xl md:text-6xl font-black uppercase italic tracking-tighter p-0 h-auto focus-visible:ring-0 placeholder:text-zinc-800" />
          </form>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Pop-up Restrizione Direct per Iscritti */}
      <AlertDialog open={isRestrictedOpen} onOpenChange={setIsRestrictedOpen}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/10 flex items-center justify-center rotate-45">
                <ShieldAlert size={32} className="text-white -rotate-45" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Accesso Limitato</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase leading-relaxed text-center">
              I messaggi privati sono una funzione esclusiva riservata ai membri ufficiali del District. Invia la selezione per diventare membro ufficiale anche tu!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={() => window.open('https://www.lowdistrict.it/selection-lwdstrct/', '_blank')} 
              className="rounded-none bg-white text-black font-black uppercase italic text-[10px] w-full"
            >
              Invia Selezione
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-none border-white/10 text-white font-black uppercase italic text-[10px] w-full mt-0">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;