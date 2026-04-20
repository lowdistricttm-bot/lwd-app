"use client";

import React, { useEffect, useRef } from 'react';
import { Meet } from '@/hooks/use-meets';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MapPin, Calendar, Clock, User } from 'lucide-react';

interface MeetMapProps {
  meets: Meet[];
}

const MeetMap = ({ meets }: MeetMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // @ts-ignore - L è caricato globalmente da index.html
    const L = window.L;
    if (!L || !mapContainerRef.current) return;

    // Inizializza la mappa se non esiste
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [41.9028, 12.4964],
        zoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Pulisce i marker esistenti
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const validMeets = meets.filter(m => m.latitude && m.longitude);

    if (validMeets.length > 0) {
      const bounds = L.latLngBounds([]);

      validMeets.forEach((meet) => {
        const latLng: [number, number] = [meet.latitude!, meet.longitude!];
        bounds.extend(latLng);

        const popupContent = `
          <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
            ${meet.image_url ? `<img src="${meet.image_url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />` : ''}
            <h4 style="margin: 0 0 8px 0; font-weight: 900; text-transform: uppercase; font-style: italic; color: white;">${meet.title}</h4>
            <div style="font-size: 10px; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">
              📅 ${format(new Date(meet.date), 'dd MMMM yyyy', { locale: it })}
            </div>
            <div style="font-size: 10px; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">
              📍 ${meet.location}
            </div>
            <div style="border-top: 1px solid #333; padding-top: 8px; font-size: 9px; color: #555; font-weight: 900; text-transform: uppercase; font-style: italic;">
              @${meet.profiles?.username || 'Membro'}
            </div>
          </div>
        `;

        const marker = L.marker(latLng).addTo(map).bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    // Fix per il resize della mappa
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [meets]);

  return (
    <div className="h-[60vh] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0 bg-zinc-950">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #09090b !important;
          color: white !important;
          border-radius: 1.5rem !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          padding: 0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #09090b !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-container {
          background: #000 !important;
        }
      `}</style>
    </div>
  );
};

export default MeetMap;