"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const selections = [
  { 
    id: 1, 
    event: "Low District Season Opener", 
    vehicle: "BMW M3 E46", 
    status: "approved", 
    date: "15 Maggio 2024",
    image: "https://images.unsplash.com/photo-1562141961-b5d185666096?auto=format&fit=crop&q=80&w=400"
  },
  { 
    id: 2, 
    event: "Stance & Coffee Meetup", 
    vehicle: "VW Golf MK4", 
    status: "pending", 
    date: "02 Giugno 2024",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400"
  }
];

const Selections = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Le Mie Selezioni</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Monitora lo stato delle tue candidature</p>

        <div className="space-y-4">
          {selections.map((item) => (
            <div key={item.id} className="bg-zinc-900/50 border border-white/5 p-4 flex items-center gap-4 group cursor-pointer hover:border-white/10 transition-all">
              <div className="w-20 h-20 shrink-0 overflow-hidden bg-zinc-800">
                <img src={item.image} alt={item.event} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm uppercase tracking-tight">{item.event}</h3>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
                <p className="text-xs text-gray-500 mb-3">{item.vehicle} • {item.date}</p>
                
                <div className="flex items-center gap-2">
                  {item.status === 'approved' ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1">
                      <CheckCircle2 size={12} /> Approvato
                    </div>
                  ) : item.status === 'pending' ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1">
                      <Clock size={12} /> In Revisione
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1">
                      <XCircle size={12} /> Non Selezionato
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selections.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/5">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nessuna candidatura attiva</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Selections;