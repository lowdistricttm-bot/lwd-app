"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Stories from '@/components/Stories';
import FeaturedProducts from '@/components/FeaturedProducts';
import LatestActivities from '@/components/LatestActivities';
import LatestMeets from '@/components/LatestMeets';
import LatestMarketplaceItems from '@/components/LatestMarketplaceItems';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import MysteryBoxPopup from '@/components/MysteryBoxPopup';
import { ShoppingBag, Users, Calendar, ArrowRight, Star, Music, Play, ChevronRight, MapPin, Tag, Bell, X, ArrowRightLeft, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const { t } = useTranslation();
  const { permission, requestPermission } = usePushNotifications();
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (user && permission === 'default') {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [user, permission]);

  const navigationTabs = [
    { 
      icon: Users, 
      title: t?.home?.values?.community || 'COMMUNITY', 
      desc: t?.home?.values?.communityDesc || 'Migliaia di utenti uniti dalla stessa passione',
      href: '/bacheca',
      label: 'Entra nel Feed'
    },
    { 
      icon: MapPin, 
      title: 'DISTRICT MEET', 
      desc: 'Incontri spontanei e raduni della community',
      href: '/meets',
      label: 'Vedi Incontri'
    },
    { 
      icon: Tag, 
      title: 'MARKETPLACE', 
      desc: 'Compra e vendi componenti in modo sicuro',
      href: '/marketplace',
      label: 'Vai agli Annunci'
    },
    { 
      icon: Calendar, 
      title: t?.home?.values?.events || 'EVENTI', 
      desc: t?.home?.values?.eventsDesc || 'Gli eventi più esclusivi a portata di app.',
      href: '/events',
      label: 'Vedi Calendario'
    }
  ];

  return (
    <div className="min-h-full text-white flex flex-col bg-black">
      <div className="pt-[calc(4rem+env(safe-area-inset-top))]">
        <Stories />
        <Hero />
        
        <FeaturedProducts />

        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {navigationTabs.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={item.href}
                    className="group block relative bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-8 hover:bg-zinc-800/60 hover:border-white/20 transition-all duration-500 overflow-hidden rounded-[2rem] h-full"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <item.icon size={100} className="text-white" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <item.icon size={20} />
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">
                          {item.title}
                        </h4>
                        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed mt-2">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors pt-4 border-t border-white/5">
                        {item.label} <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <LatestActivities />
        
        <LatestMeets />

        <LatestMarketplaceItems />

        <section className="py-12 px-6 overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">The Sound of District</h2>
                  <h3 className="text-[clamp(18px,6vw,60px)] font-black italic uppercase tracking-tighter leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                    District Radio
                  </h3>
                </div>
                <p className="text-zinc-400 text-[10px] md:text-sm font-bold uppercase tracking-tight italic whitespace-nowrap">
                  Metti in play e goditi il viaggio nel Distretto
                </p>
                <div className="flex justify-center md:justify-start">
                  <a 
                    href="https://open.spotify.com/playlist/49mK52uCtaHSCLY1VC9GR3" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#1DB954] text-black px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-widest italic hover:scale-105 transition-transform shadow-lg shadow-[#1DB954]/20"
                  >
                    <Play size={14} fill="currentColor" /> Apri su Spotify
                  </a>
                </div>
              </div>
              
              <div className="w-full md:w-[450px] h-[152px] shadow-2xl rounded-3xl overflow-hidden">
                <iframe 
                  src="https://open.spotify.com/embed/playlist/49mK52uCtaHSCLY1VC9GR3?utm_source=generator&theme=0" 
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="opacity-90 hover:opacity-100 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 overflow-hidden rounded-[3rem] mx-4 mb-12">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
              className="w-full h-full object-cover opacity-40 grayscale scale-105 blur-[1px]"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <h2 className="text-[clamp(15px,5.5vw,72px)] font-black italic uppercase tracking-tighter mb-1 leading-none drop-shadow-2xl whitespace-nowrap">
                {t?.home?.banner?.title}
              </h2>
              <p className="text-white/80 text-[clamp(7px,2.2vw,14px)] font-black uppercase tracking-tight md:tracking-[0.4em] mb-12 italic leading-none whitespace-nowrap">
                {t?.home?.banner?.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
                <Link to="/events" className="w-full sm:w-auto bg-white text-black px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic hover:scale-105 transition-all shadow-xl">
                  {t?.home?.banner?.applyBtn}
                </Link>
                <Link to="/shop" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-white/20 transition-all">
                  {t?.home?.banner?.shopBtn}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
      
      <PWAInstallPrompt />
      <MysteryBoxPopup />

      {/* Push Notification Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[100] md:left-auto md:right-12 md:w-96"
          >
            <div className="bg-white text-black p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Bell size={80} />
              </div>
              
              <button 
                onClick={() => setShowPrompt(false)}
                className="absolute top-4 right-4 p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Resta Connesso</p>
                  <p className="text-sm font-black uppercase italic">Attiva le Notifiche</p>
                </div>
              </div>

              <p className="text-xs font-medium leading-relaxed mb-6 opacity-70">
                Ricevi avvisi in tempo reale per nuovi messaggi, like e commenti ai tuoi post.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => { requestPermission(); setShowPrompt(false); }}
                  className="flex-1 bg-black text-white h-12 rounded-full font-black uppercase italic text-[10px] tracking-widest hover:scale-105 transition-all"
                >
                  Attiva Ora
                </button>
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="px-6 h-12 rounded-full font-black uppercase italic text-[10px] tracking-widest border border-black/10 hover:bg-black/5 transition-all"
                >
                  Più Tardi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;