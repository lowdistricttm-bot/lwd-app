"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Stories from '@/components/Stories';
import FeaturedProducts from '@/components/FeaturedProducts';
import LatestActivities from '@/components/LatestActivities';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { ShoppingBag, Users, Calendar, ArrowRight, Star, Music, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))]">
        <Stories />
        <Hero />
        
        <FeaturedProducts />
        
        <LatestActivities />

        {/* Sezione District Radio */}
        <section className="py-24 px-6 bg-zinc-950 border-y border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-8 text-center md:text-left">
                <div>
                  <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">The Sound of District</h2>
                  <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">District <br /> Radio</h3>
                </div>
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-tight leading-relaxed max-w-md italic">
                  Metti in play e goditi il viaggio nel District.
                </p>
                <div className="flex justify-center md:justify-start">
                  <a 
                    href="https://open.spotify.com/playlist/49mK52uCtaHSCLY1VC9GR3" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#1DB954] text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest italic hover:scale-105 transition-transform"
                  >
                    <Play size={16} fill="currentColor" /> Apri su Spotify
                  </a>
                </div>
              </div>
              
              <div className="w-full md:w-[400px] aspect-square bg-zinc-900 border border-white/10 p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <iframe 
                  src="https://open.spotify.com/embed/playlist/49mK52uCtaHSCLY1VC9GR3?utm_source=generator&theme=0" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sezione Valori / Stats */}
        <section className="py-24 px-6 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: Users, title: t.home.values.community, desc: t.home.values.communityDesc },
                { icon: Star, title: t.home.values.quality, desc: t.home.values.qualityDesc },
                { icon: Calendar, title: t.home.values.events, desc: t.home.values.eventsDesc }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6 rotate-45 group hover:rotate-0 transition-transform duration-500">
                    <item.icon className="text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" size={24} />
                  </div>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">{item.title}</h4>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Banner Promozionale Finale */}
        <section className="relative py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
              className="w-full h-full object-cover opacity-30 grayscale scale-110"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                {t.home.banner.title}
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-12 italic">
                {t.home.banner.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/events" className="w-full sm:w-auto bg-white text-black px-12 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-zinc-200 transition-all">
                  {t.home.banner.applyBtn}
                </Link>
                <Link to="/shop" className="w-full sm:w-auto border border-white/20 text-white px-12 py-6 text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-white/10 transition-all">
                  {t.home.banner.shopBtn}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
      <BottomNav />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;