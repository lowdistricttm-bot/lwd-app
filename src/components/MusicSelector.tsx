import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music, Play, Pause, X, Check, Loader2, Disc } from 'lucide-react';
import { Input } from './ui/input';
import { useMusicSearch } from '@/hooks/use-music-api';
import { cn } from '@/lib/utils';

interface MusicSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (music: any) => void;
  selectedMusicId?: string;
}

const MusicSelector = ({ isOpen, onClose, onSelect, selectedMusicId }: MusicSelectorProps) => {
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: musicResults, isLoading } = useMusicSearch(search);

  // Funzione corretta per gestire la riproduzione audio asincrona
  const togglePreview = async (e: React.MouseEvent, music: any) => {
    e.stopPropagation();

    // Se clicchiamo sullo stesso brano che sta suonando, mettiamo in pausa
    if (playingId === music.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    // Se c'è un altro brano in riproduzione, fermalo prima di iniziare il nuovo
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Crea una nuova istanza audio
    const audio = new Audio(music.audio_url);
    audioRef.current = audio;
    
    try {
      setPlayingId(music.id);
      
      // Il metodo play() restituisce una Promise che va gestita
      await audio.play();
      
      audio.onended = () => {
        if (playingId === music.id) setPlayingId(null);
      };
    } catch (error) {
      // Gestisce l'errore se il play() viene interrotto o bloccato dal browser
      console.warn("Riproduzione audio interrotta o non consentita:", error);
      setPlayingId(null);
    }
  };

  // Pulizia dell'audio quando il componente viene chiuso o smontato
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/90 z-[2000] backdrop-blur-md" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            className="fixed inset-x-0 bottom-0 z-[2001] bg-zinc-950 border-t border-white/10 rounded-t-[2.5rem] max-h-[85dvh] flex flex-col shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-6" />
            
            <div className="px-6 flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Soundtrack</h3>
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Scegli il mood per il tuo post</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <Input 
                  placeholder="CERCA BRANO O ARTISTA..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-white/20" 
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-white/20" size={32} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Caricamento libreria...</p>
                </div>
              ) : (
                musicResults?.map((music: any) => (
                  <div 
                    key={music.id} 
                    onClick={() => onSelect(music)} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all group cursor-pointer", 
                      selectedMusicId === music.id ? "bg-white border-white" : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                        <img src={music.cover_url} className="w-full h-full object-cover" alt="" />
                        <button 
                          onClick={(e) => togglePreview(e, music)} 
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {playingId === music.id ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>
                        {playingId === music.id && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Disc className="animate-spin text-white" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className={cn(
                          "text-sm font-black italic uppercase truncate", 
                          selectedMusicId === music.id ? "text-black" : "text-white"
                        )}>
                          {music.title}
                        </h4>
                        <p className={cn(
                          "text-[9px] font-bold uppercase tracking-widest", 
                          selectedMusicId === music.id ? "text-black/60" : "text-zinc-500"
                        )}>
                          {music.artist}
                        </p>
                      </div>
                    </div>
                    {selectedMusicId === music.id && (
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicSelector;