import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music, Play, Pause, X, Check, Loader2, Disc } from 'lucide-react';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
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
  const [activeTrack, setActiveTrack] = useState<any>(null);
  const [startTime, setStartTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: musicResults, isLoading } = useMusicSearch(search);

  const togglePreview = async (e: React.MouseEvent | null, music: any) => {
    if (e) e.stopPropagation();

    if (playingId === music.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(music.audio_url);
    if (activeTrack?.id === music.id) {
      audio.currentTime = startTime;
    }
    
    audioRef.current = audio;
    
    try {
      setPlayingId(music.id);
      await audio.play();
      
      audio.onended = () => {
        if (playingId === music.id) setPlayingId(null);
      };
    } catch (error) {
      console.warn("Riproduzione audio interrotta:", error);
      setPlayingId(null);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setStartTime(newTime);
    if (audioRef.current && playingId === activeTrack?.id) {
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingId(null);
      setActiveTrack(null);
      setStartTime(0);
    }
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
                  className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-white/20 text-white" 
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
                musicResults?.map((music: any) => {
                  const isSelected = activeTrack?.id === music.id || (!activeTrack && selectedMusicId === music.id);
                  
                  return (
                    <div 
                      key={music.id} 
                      className={cn(
                        "flex flex-col p-3 rounded-2xl border transition-all duration-300 group cursor-pointer gap-3", 
                        isSelected 
                          ? "bg-zinc-900 border-white/20 shadow-lg shadow-black/50" 
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                      onClick={() => {
                        if (activeTrack?.id !== music.id) {
                          setActiveTrack(music);
                          setStartTime(0);
                          togglePreview(null, music);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
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
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black italic uppercase truncate text-white">
                              {music.title}
                            </h4>
                            <p className="text-[9px] font-bold uppercase tracking-widest truncate text-zinc-500">
                              {music.artist}
                            </p>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect({ ...music, startTime });
                            }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shrink-0 ml-2 hover:scale-110 active:scale-95 transition-all shadow-lg"
                          >
                            <Check size={20} strokeWidth={3} />
                          </button>
                        )}
                      </div>

                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-3 border-t border-white/5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-zinc-400 uppercase italic tracking-widest">Punto di inizio</span>
                            <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                              {Math.floor(startTime / 60)}:{(Math.floor(startTime % 60)).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <div className="px-1">
                            <Slider
                              value={[startTime]}
                              max={music.duration}
                              step={1}
                              onValueChange={handleSeek}
                              className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_.relative]:bg-white/10 [&_.absolute]:bg-white"
                            />
                          </div>
                          <p className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest text-center">Trascina per scegliere il momento perfetto</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicSelector;