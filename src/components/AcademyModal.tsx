"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Plus, Loader2, Wrench } from 'lucide-react';
import { useAcademy, Tutorial } from '@/hooks/use-academy';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import AcademyTutorialCard from './AcademyTutorialCard';
import AcademyDetailModal from './AcademyDetailModal';
import CreateTutorialModal from './CreateTutorialModal';
import { Button } from './ui/button';

interface AcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AcademyModal = ({ isOpen, onClose }: AcademyModalProps) => {
  const { canManage } = useAdmin();
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  
  const { tutorials, isLoading, deleteTutorial } = useAcademy();

  useBodyLock(isOpen);

  const handleDeleteTutorial = (id: string) => {
    if (confirm("Eliminare definitivamente questo tutorial?")) {
      deleteTutorial.mutate(id);
      setSelectedTutorial(null);
    }
  };

  const handleEditTutorial = (t: Tutorial) => {
    setEditingTutorial(t);
    setSelectedTutorial(null);
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={onClose} 
              className="fixed inset-0 bg-black/80 z-[200] touch-none" 
            />

            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[201] bg-black border-t border-white/10 rounded-t-[2.5rem] h-[100dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              style={{ 
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                paddingTop: 'calc(1rem + env(safe-area-inset-top))'
              }}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

              <div className="max-w-3xl mx-auto w-full px-6 pb-32">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter">Low Academy</h2>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Wiki Tecnica Low District</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {canManage && (
                      <button 
                        onClick={() => { setEditingTutorial(null); setIsCreateModalOpen(true); }}
                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-zinc-500" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Caricamento Academy...</p>
                  </div>
                ) : tutorials.length === 0 ? (
                  <div className="bg-white/5 border border-dashed border-white/10 p-16 text-center rounded-[2.5rem]">
                    <Wrench className="mx-auto text-zinc-800 mb-6" size={48} />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">L'Academy è in fase di allestimento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {tutorials.map((tutorial) => (
                      <AcademyTutorialCard 
                        key={tutorial.id} 
                        tutorial={tutorial} 
                        onClick={() => setSelectedTutorial(tutorial)} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTutorial && (
          <AcademyDetailModal 
            isOpen={!!selectedTutorial} 
            onClose={() => setSelectedTutorial(null)} 
            tutorial={selectedTutorial}
            canManage={canManage}
            onEdit={handleEditTutorial}
            onDelete={handleDeleteTutorial}
          />
        )}
      </AnimatePresence>

      <CreateTutorialModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        editTutorial={editingTutorial} 
      />
    </>
  );
};

export default AcademyModal;