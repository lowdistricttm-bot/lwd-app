"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Stories from '@/components/Stories';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import GaragePreview from '@/components/GaragePreview';
import EventsSection from '@/components/EventsSection';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-20 md:pb-0">
      <Navbar />
      
      {/* Mobile Header Spacer - Increased for better visibility */}
      <div className="h-20 md:hidden"></div>
      
      <Stories />
      
      <Hero />
      
      {/* Quick Stats / Brand Bar */}
      <div className="bg-red-600 py-4 overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee gap-12 items-center">
          {[1,2,3,4,5].map((i) => (
            <span key={i} className="text-white font-black text-2xl tracking-tighter italic uppercase">
              Low District • Respect the Fitment • Static vs Air • Low District •
            </span>
          ))}
        </div>
      </div>

      <GaragePreview />
      
      <FeaturedProducts />
      
      <EventsSection />
      
      <Footer />
      
      <BottomNav />
      <MadeWithDyad />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
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