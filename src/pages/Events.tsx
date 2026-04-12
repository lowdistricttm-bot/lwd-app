"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import EventApplicationDialog from '@/components/EventApplicationDialog';
import { Calendar, MapPin } from 'lucide-react';

const events = [
  { title: "Low District Season Opener", date: "15 Maggio 2024", location: "Milano, IT", image: "https://images.unsplash.com/photo-1562141961-b5d185666096?auto=format&fit=crop&q=80&w=800", status: "Aperto" },
  { title: "Stance & Coffee Meetup", date: "02 Giugno 2024", location: "Roma, IT", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", status: "Aperto" },
  { title: "Night Run: Underground", date: "20 Luglio 2024", location: "Torino, IT", image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800", status: "Presto" },
];

const Events = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-12">Eventi</h1>
        
        <div className="space-y-8">
          {events.map((event, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 p-6 bg-zinc-900/50 border border-white/5 hover:border-red-600/50 transition-colors">
              <div className="w-full md:w-72 h-48 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-600 text-xs font-black uppercase tracking-widest">{event.status}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-sm"><Calendar size={14} /> {event.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                  <p className="flex items-center gap-1 text-gray-400 mb-6"><MapPin size={16} /> {event.location}</p>
                </div>
                
                {event.status === "Aperto" ? (
                  <EventApplicationDialog eventTitle={event.title} />
                ) : (
                  <button disabled className="w-full md:w-max bg-zinc-800 text-gray-500 px-8 py-3 font-bold uppercase tracking-widest cursor-not-allowed">
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Events;