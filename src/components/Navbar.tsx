"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, X, Send, Bell, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '@/hooks/use-cart';
import { useMessages } from '@/hooks/use-messages';
import { useNotifications } from '@/hooks/use-notifications';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { useRoleRequests } from '@/hooks/use-role-requests';
import CartDrawer from './CartDrawer';
import NotificationDrawer from './NotificationDrawer';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRestrictedOpen, setIsRestrictedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stati per la gestione dello scroll
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const { items } = useCart();
  const { unreadCount: unreadMessages } = useMessages();
  const { unreadCount: unreadNotifications } = useNotifications();
  const { role } = useAdmin();
  const { myRequest, sendRequest } = useRoleRequests();
  const navigate = useNavigate();
  const location = useLocation();

  const isSubscriber = role === 'subscriber';

  useBodyLock(isSearchOpen);

  // Mostra sempre la navbar al cambio di pagina
  useEffect(() => {
    setIsVisible(true);
  }, [location.pathname]);

  // Logica di hide/show durante lo scorrimento
  useEffect(() => {
    const container = document.getElementById('scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      
      // Protezione per il rimbalzo iOS (rubber-banding) all'inizio pagina
      if (currentScrollY <= 0) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        // Scroll verso il basso
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scroll verso l'alto
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleUpgradeRequest = async () => {
    if (myRequest) {
      setIsRestrictedOpen(false);
      navigate('/profile?tab=profile');
      return;
    }
    await sendRequest.mutateAsync('subscriber_plus');
    setIsRestrictedOpen(false);
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 pt-[env(safe-area-inset-top)] touch-none select-none transition-transform duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
        data-no-swipe="true"
      >
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-1">
            <button onClick={() => setIsSearchOpen(true)} className="p-2.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Search size={20} />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="p-2.5 text-zinc-400 hover:text-white transition-colors relative rounded-full hover:bg-white/5">
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white text-black text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">
                  {items.length}
                </span>
              )}
            </button>
          </div>

          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo className="h-6 md:h-8" />
          </Link>

          <div className="flex-1 flex items-center justify-end gap-1">
            <button onClick={() => setIsNotificationsOpen(true)} className="p-2.5 text-zinc-400 hover:text-white transition-colors relative rounded-full hover:bg-white/5">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white text-black text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            <button 
              onClick={handleDirectClick}
              className="p-2.5 text-zinc-400 hover:text-white transition-colors relative rounded-full hover:bg-white/5"
            >
              <Send size={20} className="-rotate-12" />
              {!isSubscriber && unreadMessages > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white text-black text-[8px] font-black flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in duration-300">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xl flex flex-col p-6 pt-[calc(2rem+env(safe-area-inset-top))] touch-none">
          <div className="flex justify-end mb-12">
            <button onClick={() => setIsSearchOpen(false)} className="p-3 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all">
              <X size={28} />
            </button>
          </div>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Cerca nel District</h2>
            <Input placeholder="COSA STAI CERCANDO?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-4xl md:text-6xl font-black uppercase italic tracking-tighter p-0 h-auto focus-visible:ring-0 placeholder:text-zinc-900" />
          </form>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      <AlertDialog open={isRestrictedOpen} onOpenChange={setIsRestrictedOpen}>
        <AlertDialogContent className="bg-black/60 backdrop-blur-2xl border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-12">
                <ShieldAlert size={32} className="text-white -rotate-12" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Accesso Limitato</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase leading-relaxed text-center">
              I messaggi privati sono una funzione esclusiva riservata ai membri ufficiali del District e agli Iscritti+.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <button 
              onClick={handleUpgradeRequest}
              disabled={sendRequest.isPending}
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-14 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {sendRequest.isPending ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> {myRequest ? 'Vedi Stato Richiesta' : 'Richiedi Upgrade ISCRITTO+'}</>}
            </button>
            <AlertDialogAction 
              onClick={() => window.open('https://www.lowdistrict.it/selection-lwdstrct/', '_blank')} 
              className="rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black uppercase italic text-[10px] w-full h-14 transition-all"
            >
              Invia Selezione Ufficiale
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-14 mt-0 transition-all">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;