"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMeets } from '@/hooks/use-meets';
import { MapPin, Calendar, ArrowRight, Loader2, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTranslation } from '@/hooks/use-translation';

const LatestMeets = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { meets, isLoading } = useMeets();
  
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    dragFree: true 
  });

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-zinc-500" size={32} />
    </div>
  );

  const latestMeets = meets?.slice(0, 6) || [];

  return (
    <section className="py-12 px-6 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t?.home?.districtMeet || 'DISTRICT MEET'}</h2>
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-black italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              {t?.home?.upcomingMeets || 'INCONTRI COMMUNITY'}
            </h3>
          </div>
          <Link to="/meets" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-white transition-all shrink-0 ml-4">
            {t?.home?.viewAll || 'VEDI TUTTO'} <ArrowRight size={14} />
          </Link>
        </div>

        {latestMeets.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-white/5 rounded-[2rem]">
            <MapPin size={40} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Nessun incontro in programma per oggi</p>
          </div>
        ) : (
          <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="embla__container flex gap-4">
              {latestMeets.map((meet, i) => (
                <motion.div 
                  key={`latest-meet-${meet.id}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate('/meets')}
                  className="embla__slide flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] min-w-0 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all group rounded-[2rem] overflow-hidden shadow-2xl"
                >
                  <div className="aspect-video relative overflow-hidden bg-zinc-950">
                    {meet.image_url ? (
                      <img src={meet.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-900"><MapPin size={48} /></div>
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white text-black px-3 py-1 rounded-full text-[8px] font-black italic shadow-xl flex items-center gap-1.5">
                        <Calendar size={10} /> {format(new Date(meet.date), 'dd MMM', { locale: it }).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-lg font-black italic uppercase tracking-tight mb-3 truncate text-white group-hover:text-zinc-300 transition-colors">
                      {meet.title}
                    </h4>
                    
                    <div className="flex flex-col gap-2 mb-6">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <MapPin size={12} className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic truncate">{meet.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock size={12} className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">{format(new Date(meet.date), 'HH:mm')}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                        {meet.profiles?.avatar_url ? <img src={meet.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={10} className="m-auto h-full text-zinc-600" />}
                      </div>
                      <span className="text-[8px] font-black uppercase italic text-zinc-600">@{meet.profiles?.username}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <Link to="/meets" className="flex md:hidden items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/10 py-5 mt-8 italic hover:bg-white/5 transition-all rounded-full">
          {t?.home?.viewAll || 'VEDI TUTTO'} <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default LatestMeets;