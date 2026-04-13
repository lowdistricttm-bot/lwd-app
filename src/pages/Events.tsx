"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useEvents, Event } from '@/hooks/use-events';
import { useVehicleSelection } from '@/hooks/use-vehicle-selection';
import { Button } from '@/components/ui/button';
import { Car, Loader2 } from 'lucide-react';

const Events = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const { events, isLoading: eventsLoading } = useEvents();
  const { vehicles, isLoading: vehiclesLoading } = useVehicleSelection(localStorage.getItem('userId') || '');

  const handleApply = async () => {
    if (!selectedEvent || !selectedVehicle) return;
    setIsApplying(true);
    try {
      await useEvents().applyToEvent.mutate(selectedEvent.id, selectedVehicle);
      setIsApplying(false);
      setSelectedEvent(null);
      setSelectedVehicle(null);
      showSuccess("Applicazione inviata!");
    } catch (error) {
      setIsApplying(false);
      showError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-6 md:px-12 max-w-2xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
            Eventi Disponibili
          </h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Partecipa agli Eventi
          </h1>
        </header>

        {eventsLoading || vehiclesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Caricamento degli eventi e veicoli...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event) => (
              <div key={event.id} className="bg-zinc-900/50 border border-white/5 p-6 hover:border-red-600/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">{event.title}</h4>
                    <p className="text-red-600 text-[9px] font-black uppercase tracking-widest italic">{event.date}</p>
                  </div>
                  <p className="text-sm font-black tracking-tighter">{event.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setSelectedEvent(event)}
                    className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none font-black uppercase italic text-[10px] tracking-widest"
                  >
                    <Car size={16} className="mr-2" />
                    Applica
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedEvent && (
          <div className="mt-16">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">{selectedEvent.title}</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{selectedEvent.description}</p>
            <p className="text-[10px] font-black uppercase tracking-widest">Luogo: {selectedEvent.location}</p>
            <p className="text-[10px] font-black uppercase tracking-widest">Data: {selectedEvent.date}</p>

            {vehiclesLoading ? (
              <div className="text-center py-4">
                <Loader2 className="animate-spin text-red-600" size={24} />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Caricamento veicoli...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-zinc-900/50 border border-white/5 p-4 hover:border-red-600/30 transition-colors group">
                    <div className="flex items-center gap-2">
                      <div>
                        <h5 className="text-sm font-black uppercase tracking-tighter">{vehicle.brand} {vehicle.model}</h5>
                        <p className="text-red-600 text-[9px] font-black uppercase tracking-widest italic">{vehicle.year}</p>
                      </div>
                      <p className="text-sm font-black tracking-widest">{vehicle.license_plate}</p>
                    </div>
                    <Button 
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none font-black uppercase italic text-[10px] tracking-widest"
                    >
                      <Car size={14} className="mr-2" />
                      Seleziona
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedEvent && selectedVehicle && isApplying ? (
          <div className="mt-12 text-center">
            <Loader2 className="animate-spin text-red-600" size={32} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Invio applicazione...</p>
          </div>
        ) : (
          {selectedEvent && selectedVehicle && (
            <Button 
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-red-600 hover:bg-white hover:text-black text-white rounded-none font-black uppercase italic tracking-widest"
            >
              <Car size={20} className="mr-2" /> Invia Applicazione
            </Button>
          )}
        )}
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Events;