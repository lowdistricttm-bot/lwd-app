"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturedProjects from '@/components/FeaturedProjects';
import EventsSection from '@/components/EventsSection';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-20 md:pb-0">
      <Navbar />
      
      <div className="pt-[calc(4.2rem+env(safe-area-inset-top))] md:pt-20">
        {/* Sezione Stories rimossa per reset */}
      </div>
      
      <Hero />
      
      <div className="bg-red-600 py-4 md:py-6 overflow-hidden whitespace-nowrap border-y border-white/10">
        <div className="flex animate-marquee gap-12 items-center">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <span key={i} className="text-white font-black text-2xl md:text-4xl tracking-tighter italic uppercase opacity-90">
              Low District • Respect the Fitment • Static vs Air • Low District •
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <FeaturedProducts />
        <FeaturedProjects />
        <EventsSection />
      </div>
      
      <Footer />
      
      <BottomNav />
      <PWAInstallPrompt />
      <MadeWithDyad />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
};

export default Index;