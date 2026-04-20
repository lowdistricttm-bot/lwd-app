"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Meet } from '@/hooks/use-meets';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MapPin, Calendar, Clock, User } from 'lucide-react';

// Fix per le icone di Leaflet che a volte spariscono in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MeetMapProps {
  meets: Meet[];
}

// Componente per centrare la mappa quando cambiano i meet
const RecenterMap = ({ meets }: { meets: Meet[] }) => {
  const map = useMap();
  useEffect(() => {
    if (meets.length > 0) {
      const validMeets = meets.filter(m => (m as any).latitude && (m as any).longitude);
      if (validMeets.length > 0) {
        const bounds = L.latLngBounds(validMeets.map(m => [(m as any).latitude, (m as any).longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [meets, map]);
  return null;
};

const MeetMap = ({ meets }: MeetMapProps) => {
  const validMeets = meets.filter(m => (m as any).latitude && (m as any).longitude);

  return (
    <div className="h-[60vh] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0">
      <MapContainer 
        center={[41.9028, 12.4964]} 
        zoom={6} 
        style={{ height: '100%', width: '100%', background: '#000' }}
        scrollWheelZoom={true}
      >
        {/* Layer Mappa Dark (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {validMeets.map((meet) => (
          <Marker 
            key={meet.id} 
            position={[(meet as any).latitude, (meet as any).longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px] bg-zinc-950 text-white">
                {meet.image_url && (
                  <img src={meet.image_url} className="w-full h-24 object-cover rounded-xl mb-3 border border-white/10" alt="" />
                )}
                <h4 className="text-sm font-black uppercase italic mb-2 text-white">{meet.title}</h4>
                
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-zinc-400">
                    <Calendar size={10} className="text-white" />
                    {format(new Date(meet.date), 'dd MMMM yyyy', { locale: it })}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-zinc-400">
                    <Clock size={10} className="text-white" />
                    {format(new Date(meet.date), 'HH:mm')}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-zinc-400">
                    <MapPin size={10} className="text-white" />
                    {meet.location}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 overflow-hidden">
                    {meet.profiles?.avatar_url ? <img src={meet.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={10} className="m-auto h-full" />}
                  </div>
                  <span className="text-[8px] font-black uppercase italic text-zinc-500">@{meet.profiles?.username}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <RecenterMap meets={meets} />
      </MapContainer>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: #09090b !important;
          color: white !important;
          border-radius: 1.5rem !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #09090b !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default MeetMap;