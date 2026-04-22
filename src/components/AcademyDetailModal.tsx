"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, User, Calendar, Play, Trash2, Edit3, ChevronLeft } from 'lucide-react';
import { Tutorial, ACADEMY_CATEGORIES } from '@/hooks/use-academy';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AcademyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: Tutorial;
  canManage: boolean;
  onEdit: (t: Tutorial) => void;
  onDelete: (id: string) => void;
}

const AcademyDetailModal = ({ isOpen, onClose, tutorial, canManage, onEdit, onDelete }: AcademyDetailModalProps) => {
  useBodyLock(isOpen);

  if (!tutorial) return null;

  const categoryLabel = ACADEMY_CATEGORIES.find(c => c.id === tutorial.category)?.label || tutorial.category;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} className="absolute inset-0 bg-black/90 pointer-events-auto touch-none" 
          />
          <motion.div 
            initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-h-[100dvh] md:max-h-[90vh] md:max-w-3xl bg-black border-t md:border border-white/10 p-6 rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-y-auto shadow-2xl pointer-events-auto"
            style={{ 
              touchAction: 'pan-y', 
              overscrollBehavior: 'contain',
              paddingTop: 'calc(2rem + env(safe-area-inset-top))'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0 md:hidden" />
            
            <div className="space-y-8 pb-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                    LOW ACADEMY • {categoryLabel.toUpperCase()}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">
                    {tutorial.title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {canManage && (
                    <>
                      <button onClick={() => onEdit(tutorial)} className="p-2 bg-white/5 text-zinc-400 rounded-full hover:bg-white hover:text-black transition-all"><Edit3 size={20} /></button>
                      <button onClick={() => onDelete(tutorial.id)} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                    </>
                  )}
                  <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0"><X size={24} /></button>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-full overflow-hidden border-2 border-white/10">
                    {tutorial.profiles?.avatar_url ? (
                      <img src={tutorial.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={20} /></div>
                    )}
                  </div>
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Autore Tutorial</p>
                    <p className="text-sm font-black uppercase italic tracking-tight text-white">@{tutorial.profiles?.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Pubblicato il</p>
                  <p className="text-[10px] font-bold uppercase text-white">{new Date(tutorial.created_at).toLocaleDateString('it-IT')}</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] text-zinc-200 leading-relaxed italic font-medium whitespace-pre-wrap text-base">
                  {tutorial.content}
                </div>
              </div>

              {tutorial.video_url && (
                <div className="pt-6">
                  <Button 
                    onClick={() => window.open(tutorial.video_url, '_blank')}
                    className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 border-none"
                  >
                    <Play size={18} fill="currentColor" />
                    Guarda Video Tutorial
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AcademyDetailModal;