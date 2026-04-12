"use client";

import React from 'react';
import { CheckCircle2, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const ApprovedParticipants = () => {
  // Questi dati rappresentano le selezioni già approvate sul sito
  const approvedCars = [
    { id: 1, model: "BMW M3 E46", owner: "User_01", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400", tag: "Static" },
    { id: 2, model: "VW Golf MK4", owner: "User_02", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400", tag: "Airride" },
    { id: 3, model: "Audi RS3", owner: "User_03", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=400", tag: "Static" },
    { id: 4, model: "Porsche 911", owner: "User_04", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400", tag: "Airride" },
  ];

  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black tracking-tighter uppercase italic">Selezioni Approvate</h3>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">I veicoli confermati per il prossimo evento</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full">
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Official List</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {approvedCars.map((car, i) => (
          <motion.div 
            key={car.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative aspect-square bg-zinc-900 overflow-hidden border border-white/5"
          >
            <img src={car.image} alt={car.model} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">{car.tag}</p>
              <p className="text-xs font-black uppercase italic">{car.model}</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase">@{car.owner}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ApprovedParticipants;