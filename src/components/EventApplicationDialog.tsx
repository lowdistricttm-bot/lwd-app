"use client";

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, Car, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  suspension: string;
  image: string;
}

const mockVehicles: Vehicle[] = [
  { id: 1, brand: "BMW", model: "M3 E46", suspension: "static", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400" },
  { id: 2, brand: "VW", model: "Golf MK4", suspension: "air", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400" }
];

const EventApplicationDialog = ({ eventTitle }: { eventTitle: string }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = () => {
    if (!selectedVehicle) return;
    
    setIsSubmitting(true);
    // Simulazione invio candidatura
    setTimeout(() => {
      showSuccess(`Candidatura inviata per ${eventTitle}!`);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full md:w-max bg-white text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
          Candidati Ora
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950 border-white/10 text-white">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black tracking-tighter uppercase text-center">
              Seleziona Veicolo
            </DrawerTitle>
            <p className="text-center text-gray-500 text-xs uppercase tracking-widest font-bold">
              Scegli l'auto per {eventTitle}
            </p>
          </DrawerHeader>

          <div className="p-6 space-y-4">
            {mockVehicles.map((v) => (
              <div 
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                className={cn(
                  "relative flex items-center gap-4 p-4 border transition-all cursor-pointer",
                  selectedVehicle === v.id 
                    ? "border-red-600 bg-red-600/5" 
                    : "border-white/5 bg-white/5 hover:border-white/20"
                )}
              >
                <div className="w-16 h-16 shrink-0 overflow-hidden bg-zinc-800">
                  <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase text-red-600">{v.suspension}</p>
                  <h4 className="font-bold text-lg leading-tight">{v.brand} {v.model}</h4>
                </div>
                {selectedVehicle === v.id && (
                  <div className="bg-red-600 p-1 rounded-full">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-white/5 mt-4">
              <AlertCircle size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold">
                La candidatura verrà revisionata dallo staff. Riceverai una notifica push in caso di approvazione.
              </p>
            </div>
          </div>

          <DrawerFooter className="pb-10">
            <Button 
              onClick={handleApply}
              disabled={!selectedVehicle || isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-8 rounded-none"
            >
              {isSubmitting ? "Invio in corso..." : "Invia Candidatura"}
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="text-gray-500 font-bold uppercase tracking-widest text-xs">Annulla</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventApplicationDialog;