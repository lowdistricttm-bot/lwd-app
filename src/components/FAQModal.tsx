"use client";

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, Car, Calendar, Shield, User, 
  Camera, MessageSquare, ShieldCheck, Settings, 
  GraduationCap, Wrench, Plus, Loader2, X, Info,
  ShoppingBag, Zap, AlertTriangle, Heart, ClipboardCheck
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAdmin } from '@/hooks/use-admin';
import { useAcademy, Tutorial } from '@/hooks/use-academy';
import { useBodyLock } from '@/hooks/use-body-lock';
import AcademyTutorialCard from './AcademyTutorialCard';
import AcademyDetailModal from './AcademyDetailModal';
import CreateTutorialModal from './CreateTutorialModal';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
  const { language } = useTranslation();
  const { isAdmin, isStaff, isSupport, canManage } = useAdmin();
  const [activeTab, setActiveTab] = useState<'faq' | 'academy'>('faq');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  
  const { tutorials, isLoading, deleteTutorial } = useAcademy();

  // Blocco dello scroll del body quando il modal è aperto
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

  const handleOpenCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTutorial(null);
    setIsCreateModalOpen(true);
  };

  // FAQ Data
  const adminFaqs = [
    {
      category: "PANNELLO AMMINISTRAZIONE",
      icon: ShieldCheck,
      items: [
        {
          q: "Come gestisco i ruoli dei membri?",
          a: "Dalla Dashboard Admin, vai su 'Gestione Membri'. Qui puoi cercare qualsiasi utente e cambiare il suo grado. I ruoli Admin sono protetti e gestiti via database."
        }
      ]
    }
  ];

  const publicFaqs = [
    {
      category: "EVENTI & SELEZIONI",
      icon: Calendar,
      items: [
        {
          q: "Come invio la mia candidatura per un evento?",
          a: "Vai nella sezione 'Eventi', scegli l'evento attivo e clicca su 'Invia Selezione'. Dovrai selezionare un'auto dal tuo garage e caricare almeno 3 foto degli interni."
        }
      ]
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay / Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={onClose} 
              className="fixed inset-0 bg-black/80 z-[200] touch-none" 
            />

            {/* Modal Content - Slide up full height */}
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
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

              <div className="max-w-3xl mx-auto w-full px-6 pb-32">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
                      <HelpCircle size={24} />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                      {language === 'it' ? "Centro Assistenza" : "Help Center"}
                    </h2>
                  </div>
                  <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 mb-10">
                  <button 
                    onClick={() => setActiveTab('faq')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                      activeTab === 'faq' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <HelpCircle size={14} /> FAQ
                  </button>
                  <button 
                    onClick={() => setActiveTab('academy')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                      activeTab === 'academy' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <GraduationCap size={14} /> Stance Academy
                  </button>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'faq' ? (
                    <motion.div 
                      key="faq-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      {isAdmin && adminFaqs.map((cat, idx) => (
                        <div key={`admin-${idx}`} className="space-y-4">
                          <div className="flex items-center gap-2 px-2">
                            <cat.icon size={14} className="text-red-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 italic">{cat.category}</h3>
                          </div>
                          <Accordion type="single" collapsible className="space-y-2">
                            {cat.items.map((item, i) => (
                              <AccordionItem key={i} value={`admin-item-${i}`} className="border border-red-500/20 bg-red-500/5 rounded-2xl px-6 overflow-hidden">
                                <AccordionTrigger className="hover:no-underline py-4 text-[11px] font-black uppercase italic text-left">
                                  {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-400 text-[10px] font-medium leading-relaxed pb-4">
                                  {item.a}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))}

                      {publicFaqs.map((cat, idx) => (
                        <div key={`pub-${idx}`} className="space-y-4">
                          <div className="flex items-center gap-2 px-2">
                            <cat.icon size={14} className="text-zinc-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">{cat.category}</h3>
                          </div>
                          <Accordion type="single" collapsible className="space-y-2">
                            {cat.items.map((item, i) => (
                              <AccordionItem key={i} value={`pub-${idx}-${i}`} className="border border-white/5 bg-white/5 rounded-2xl px-6 overflow-hidden">
                                <AccordionTrigger className="hover:no-underline py-4 text-[11px] font-black uppercase italic text-left">
                                  {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-400 text-[10px] font-medium leading-relaxed pb-4">
                                  {item.a}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="academy-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-between items-center px-2">
                        <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter">Wiki Tecnica</h3>
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Impara dai migliori del District</p>
                        </div>
                        {canManage && (
                          <button 
                            onClick={handleOpenCreate}
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                          >
                            <Plus size={24} />
                          </button>
                        )}
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
                          {canManage && (
                            <Button onClick={handleOpenCreate} className="mt-6 bg-white text-black rounded-full px-8 h-12 font-black uppercase italic text-[10px]">Crea il primo tutorial</Button>
                          )}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modali di secondo livello con z-index superiore */}
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

export default FAQModal;