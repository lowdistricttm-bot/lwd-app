"use client";

import React from 'react';
import { Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useWcEvents } from '@/hooks/use-woocommerce';
import { Link } from 'react-router-dom';

const EventsSection = () => {
  const { data: events, isLoading } = useWcEvents();
  const featuredEvents = events?.slice(0, 2);

  return (
    <section className="py-24 bg-zinc-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-red-600 font-black tracking-widest uppercase mb-2 text-[10px]">Community</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-none italic uppercase">
              JOIN THE <br />NEXT MEET
            </h3>
            <p className="text-gray-400 text-sm mb-10 max-w-md font-bold uppercase tracking-tight opacity-70">
              I nostri eventi sono il cuore pulsante di Low District. Unisciti a centinaia di appassionati per celebrare la cultura stance.
            </p>
            
            <div className="space-y-6">
              {isLoading ? (
                <Loader2 className="animate-spin text-red-600" size={24} />
              ) : featuredEvents?.map((event: any) => (
                <Link 
                  key={event.id} 
                  to="/events"
                  className="flex items-center gap-6 p-4 border border-white/5 hover:border-red-600/50 transition-colors bg-white/5 group cursor-pointer"
                >
                  <div className="w-20 h-20 shrink-0 overflow-hidden bg-zinc-900">
                    <img src={event.images[0]?.src} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-black text-lg mb-1 italic uppercase truncate" dangerouslySetInnerHTML={{ __html: event.name }} />
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-red-600" /> {event.attributes?.find((a: any) => a.name === 'Location')?.options[0] || 'TBA'}</span>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-600 group-hover:text-red-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="relative aspect-square hidden lg:block">
            <img 
              src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
              alt="Event Atmosphere" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute -bottom-8 -left-8 bg-red-600 p-10">
              <p className="text-white font-black text-4xl tracking-tighter italic uppercase">100%<br />STANCE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;