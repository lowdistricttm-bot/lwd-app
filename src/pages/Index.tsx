"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import EventsSection from '@/components/EventsSection';
import Footer from '@/components/Footer';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />
      <Hero />
      
      {/* Brand Philosophy Section */}
      <section className="py-24 bg-black px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8">
            RESPECT THE <span className="text-red-600 italic">FITMENT</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto font-light leading-relaxed">
            Low District nasce dalla passione per le auto rasoterra, i cerchi a filo e la cura maniacale del dettaglio. 
            Siamo più di un brand, siamo il punto di riferimento per chi vive la strada a pochi centimetri dall'asfalto.
          </p>
        </div>
      </section>

      <FeaturedProducts />
      
      {/* Full Width Image Break */}
      <section className="h-[60vh] w-full relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=2070" 
          alt="Stance Detail" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-white text-5xl md:text-8xl font-black tracking-tighter opacity-20">LOW & SLOW</h3>
          </div>
        </div>
      </section>

      <EventsSection />
      
      <Footer />
      <MadeWithDyad />
    </main>
  );
};

export default Index;