"use client";

import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const events = [
  {
    title: "Low District Season Opener",
    date: "15 Maggio 2024",
    location: "Milano, IT",
    image: "https://images.unsplash.com/photo-1562141961-b5d185666096?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Stance & Coffee Meetup",
    date: "02 Giugno 2024",
    location: "Roma, IT",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"
  }
];

const EventsSection = () => {
  return (
    <section className="py-24 bg-zinc-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-red-600 font-bold tracking-widest uppercase mb-2">Community</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-none">
              JOIN THE <br />NEXT MEET
            </h3>
            <p className="text-gray-400 text-lg mb-10 max-w-md">
              I nostri eventi sono il cuore pulsante di Low District. Unisciti a centinaia di appassionati per celebrare la cultura stance.
            </p>
            
            <div className="space-y-6">
              {events.map((event, i) => (
                <div key={i} className="flex items-center gap-6 p-4 border border-white/5 hover:border-red-600/50 transition-colors bg-white/5 group cursor-pointer">
                  <div className="w-24 h-24 shrink-0 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-xl mb-1">{event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-600 group-hover:text-red-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1000" 
              alt="Event Atmosphere" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute -bottom-8 -left-8 bg-red-600 p-10 hidden md:block">
              <p className="text-white font-black text-4xl tracking-tighter">100%<br />STANCE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;