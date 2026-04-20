"use client";

import React, { useEffect, useRef } from 'react';
import { Meet } from '@/hooks/use-meets';

interface MeetMapProps {
  meets: Meet[];
  onSelectMeet: (meet: Meet) => void;
}

const MeetMap = ({ meets, onSelectMeet }: MeetMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

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
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const validMeets = meets.filter(m => m.latitude && m.longitude);

    if (validMeets.length > 0) {
      const bounds = L.latLngBounds([]);

      validMeets.forEach((meet) => {
        const latLng: [number, number] = [meet.latitude!, meet.longitude!];
        bounds.extend(latLng);

        const customIcon = L.divIcon({
          className: 'custom-meet-marker',
          html: `
            <div class="marker-container">
              <div class="marker-dot"></div>
              <div class="marker-pulse"></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker(latLng, { icon: customIcon }).addTo(map);
        
        marker.on('click', () => {
          onSelectMeet(meet);
          map.setView(latLng, 14);
        });

        markersRef.current.push(marker);
      });

      if (validMeets.length === 1) {
        map.setView([validMeets[0].latitude!, validMeets[0].longitude!], 10);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [meets, onSelectMeet]);

  return (
    <div className="h-[60vh] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0 bg-zinc-950">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      <style>{`
        .marker-container {
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-dot {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 0 10px rgba(255,255,255,0.8);
        }
        .marker-pulse {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          animation: marker-pulse 2s infinite;
          z-index: 1;
        }
        @keyframes marker-pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-container {
          background: #000 !important;
        }
      `}</style>
    </div>
  );
};

export default MeetMap;