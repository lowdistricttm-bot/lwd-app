"use client";

import React from 'react';
import { useVehicleLogs } from '@/hooks/use-vehicle-logs';
import { motion } from 'framer-motion';
import { DollarSign, Gauge, PieChart, Activity, TrendingUp } from 'lucide-react';

const VehicleStats = ({ vehicleId }: { vehicleId: string }) => {
  const { logs, isLoading } = useVehicleLogs(vehicleId);

  if (isLoading) return <div className="h-40 flex items-center justify-center"><Activity className="animate-spin text-zinc-500" /></div>;
  if (!logs || logs.length === 0) return null;

  const totalCost = logs.reduce((acc, log) => acc + (log.cost || 0), 0);
  const maintenanceCost = logs.filter(l => l.type === 'maintenance').reduce((acc, log) => acc + (log.cost || 0), 0);
  const modificationCost = logs.filter(l => l.type === 'modification').reduce((acc, log) => acc + (log.cost || 0), 0);
  
  const maxMileage = Math.max(...logs.map(l => l.mileage || 0));

  const maintenancePerc = totalCost > 0 ? (maintenanceCost / totalCost) * 100 : 0;
  const modificationPerc = totalCost > 0 ? (modificationCost / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-zinc-500" />
        <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic">Analisi Progetto</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={48} />
          </div>
          <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 italic">Investimento Totale</p>
          <p className="text-3xl font-black italic uppercase tracking-tighter text-white">
            € {totalCost.toLocaleString('it-IT')}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Gauge size={48} />
          </div>
          <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 italic">Km Registrati</p>
          <p className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {maxMileage > 0 ? maxMileage.toLocaleString('it-IT') : '---'} <span className="text-xs">KM</span>
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <div className="flex justify-between items-end mb-4">
          <p className="text-[8px] font-black uppercase text-zinc-500 italic flex items-center gap-2">
            <PieChart size={12} /> Ripartizione Budget
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[7px] font-black uppercase text-zinc-400">Manutenzione</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-[7px] font-black uppercase text-zinc-400">Modifiche</span>
            </div>
          </div>
        </div>

        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${maintenancePerc}%` }}
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${modificationPerc}%` }}
            className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleStats;