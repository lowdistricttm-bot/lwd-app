"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Stories from '@/components/Stories';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ShoppingBag, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))]">
        <Stories />
        <Hero />
        
        {/* Sezione Community / Bacheca Preview */}
        <section className="py-24 px-6 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
                  Join the District
                </h2>
                <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
                  Community <br /> & Bacheca
                </h3>
              </div>
              <Link to="/bacheca" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                Vedi tutte le attività <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Membri", desc: "Connettiti con migliaia di appassionati stance in tutta Italia." },
                { icon: ShoppingBag, title: "Shop", desc: "Drop esclusivi e merchandising ufficiale di alta qualità." },
                { icon: Calendar, title: "Eventi", desc: "Partecipa ai raduni più esclusivi e seleziona il tuo progetto." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-zinc-900/50 border border-white/5 p-8 hover:border-red-600/30 transition-all group"
                >
                  <item.icon className="text-red-600 mb-6 group-hover:scale-110 transition-transform" size={32} />
                  <h4 className="text-xl font-black italic uppercase mb-4">{item.title}</h4>
                  <p className="text-zinc-500 text-sm font-bold leading-relaxed uppercase tracking-tight">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Banner Promozionale */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
              className="w-full h-full object-cover opacity-20 grayscale"
              alt="Background"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-8">
              Il tuo progetto merita <br /> il palcoscenico migliore.
            </h2>
            <p className="text-zinc-400 text-sm md:text-base font-bold uppercase tracking-widest mb-12">
              Candidati per i prossimi eventi ufficiali direttamente dall'app.
            </p>
            <Link to="/shop" className="inline-block bg-red-600 text-white px-12 py-6 text-xs font-black uppercase tracking-[0.2em] italic hover:bg-white hover:text-black transition-all">
              Scopri gli Eventi
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
      <BottomNav />
      <PWAInstallPrompt />
      <MadeWithDyad />
    </div>
  );
};

export default Index;