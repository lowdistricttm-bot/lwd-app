"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))]">
        <Hero />
        
        {/* Placeholder Section for future content */}
        <section className="py-24 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-6">
              Coming Soon
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest leading-relaxed">
              Stiamo preparando qualcosa di nuovo. <br />
              Resta sintonizzato per i prossimi drop e i nuovi eventi.
            </p>
          </motion.div>
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