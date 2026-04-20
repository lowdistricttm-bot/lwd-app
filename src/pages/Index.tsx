"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Stories from '@/components/Stories';
import FeaturedProducts from '@/components/FeaturedProducts';
import LatestActivities from '@/components/LatestActivities';
import LatestMeets from '@/components/LatestMeets';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { ShoppingBag, Users, Calendar, ArrowRight, Star, Music, Play, ChevronRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';

const Index = () => {
  const { t } = useTranslation();

  const navigationTabs = [
    { 
      icon: Users, 
      title: t.home.values.community, 
      desc: t.home.values.communityDesc,
      href: '/bacheca',
      label: 'Entra nel Feed'
    },
    { 
      icon: Star, 
      title: t.home.values.quality, 
      desc: t.home.values.qualityDesc,
      href: '/shop',
      label: 'Vai allo Shop'
    },
    { 
      icon: Tag, 
      title: 'MARKETPLACE', 
      desc: 'Vendi e acquista componenti usati tra i membri del District.',
      href: '/marketplace',
      label: 'Vedi Annunci'
    },
    { 
      icon: Calendar, 
      title: t.home.values.events, 
      desc: t.home.values.eventsDesc,
      href: '/events',
      label: 'Vedi Calendario'
    }
  ];

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))]">
        <Stories />
        <Hero />
        
        <FeaturedProducts />

        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
                    className="group block relative bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-8 md:p-12 hover:bg-zinc-800/60 hover:border-white/20 transition-all duration-500 overflow-hidden rounded-[2rem] h-full"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <item.icon size={120} className="text-white" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <item.icon size={20} />
                      </div>
                      
                      <div>
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                          {item.title}
                        </h4>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-2">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors pt-4 border-t border-white/5">
                        {item.label} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
                  Metti in play e goditi il viaggio nel District.
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
                  className="grayscale opacity-90 hover:grayscale-0 transition-all duration-700"
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
                {t.home.banner.title}
              </h2>
              <p className="text-white/80 text-[clamp(7px,2.2vw,14px)] font-black uppercase tracking-tight md:tracking-[0.4em] mb-12 italic leading-none whitespace-nowrap">
                {t.home.banner.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
                <Link to="/events" className="w-full sm:w-auto bg-white text-black px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic hover:scale-105 transition-all shadow-xl">
                  {t.home.banner.applyBtn}
                </Link>
                <Link to="/shop" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-white/20 transition-all">
                  {t.home.banner.shopBtn}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;