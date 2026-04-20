"use client";

import React, { useState } from 'react';
import { useVehicleLogs } from '@/hooks/use-vehicle-logs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Plus, Trash2, Calendar, DollarSign, Gauge, Bell, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const VehicleLogbook = ({ vehicleId, onClose }: { vehicleId: string, onClose: () => void }) => {
  const { logs, isLoading, addLog, deleteLog } = useVehicleLogs(vehicleId);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'maintenance',
    mileage: '',
    cost: '',
    event_date: new Date().toISOString().slice(0, 16),
    reminder_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLog.mutateAsync({
      ...formData,
      vehicle_id: vehicleId,
      mileage: formData.mileage ? parseInt(formData.mileage) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      reminder_date: formData.reminder_date || null
    });
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Diario di Bordo</h3>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Timeline privata del progetto</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
      </div>

      {!isAdding ? (
        <Button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-white text-black rounded-full h-14 font-black uppercase italic mb-8 shadow-xl"
        >
          <Plus size={18} className="mr-2" /> Aggiungi Voce
        </Button>
      ) : (
        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 mb-8 space-y-4"
        >
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-full border border-white/5">
            {['maintenance', 'modification'].map((t) => (
              <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={cn("py-2 rounded-full text-[8px] font-black uppercase italic transition-all", formData.type === t ? "bg-white text-black" : "text-zinc-500")}>
                {t === 'maintenance' ? 'Manutenzione' : 'Modifica'}
              </button>
            ))}
          </div>
          <Input required placeholder="TITOLO (ES: CAMBIO OLIO)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" placeholder="KM" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
            <Input type="number" placeholder="COSTO €" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Data Evento</Label>
            <Input type="datetime-local" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4 flex items-center gap-2"><Bell size={10} /> Promemoria Notifica</Label>
            <Input type="datetime-local" value={formData.reminder_date} onChange={e => setFormData({...formData, reminder_date: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-white text-black rounded-full h-12 font-black uppercase italic">Salva</Button>
            <Button type="button" onClick={() => setIsAdding(false)} variant="outline" className="flex-1 border-white/10 rounded-full h-12 font-black uppercase italic">Annulla</Button>
          </div>
        </motion.form>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {logs?.map((log) => (
          <div key={log.id} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[1.5rem] relative group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", log.type === 'maintenance' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")}>
                  {log.type === 'maintenance' ? <Wrench size={14} /> : <Gauge size={14} />}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase italic text-white">{log.title}</h4>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase">{new Date(log.event_date).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
              <button onClick={() => deleteLog.mutate(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
            </div>
            <div className="flex gap-4">
              {log.mileage && <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase"><Clock size={10} /> {log.mileage} KM</div>}
              {log.cost && <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase"><DollarSign size={10} /> {log.cost} €</div>}
              {log.reminder_date && <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase"><Bell size={10} /> Alert Attivo</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleLogbook;