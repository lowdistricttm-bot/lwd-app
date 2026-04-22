"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const { isAdmin, isStaff, isSupport, canManage, canVote } = useAdmin();
  const [activeTab, setActiveTab] = useState<'faq' | 'academy'>('faq');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  
  const { tutorials, isLoading, deleteTutorial } = useAcademy();

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

  // --- DATA FAQ RIPRISTINATA ---

  const adminFaqs = [
    {
      category: "PANNELLO AMMINISTRAZIONE",
      icon: ShieldCheck,
      items: [
        {
          q: "Come gestisco i ruoli dei membri?",
          a: "Dalla Dashboard Admin, vai su 'Gestione Membri'. Qui puoi cercare qualsiasi utente e cambiare il suo grado. I ruoli Admin sono protetti e gestiti via database."
        },
        {
          q: "Posso eliminare post o commenti inappropriati?",
          a: "Sì, come Admin hai il controllo totale. Puoi eliminare qualsiasi contenuto direttamente dal feed o dalla bacheca cliccando sui tre puntini del post."
        }
      ]
    }
  ];

  const staffFaqs = [
    {
      category: "GESTIONE SELEZIONI",
      icon: ClipboardCheck,
      items: [
        {
          q: "Come approvo una candidatura?",
          a: "Nella sezione 'Selezioni' della Dashboard, espandi una pratica e clicca su 'APPROVA'. L'utente riceverà automaticamente una notifica e una mail ufficiale."
        },
        {
          q: "Cosa succede se rifiuto un progetto?",
          a: "L'utente riceverà una notifica di rifiuto. Potrà candidarsi di nuovo per lo stesso evento solo se elimini la sua candidatura precedente."
        }
      ]
    }
  ];

  const supportFaqs = [
    {
      category: "SUPPORTO TECNICO",
      icon: Wrench,
      items: [
        {
          q: "Come aiuto un utente che non vede i suoi ordini?",
          a: "Assicurati che l'email del suo profilo Supabase corrisponda a quella usata sul sito WordPress. Il sistema sincronizza gli ordini basandosi sull'email e sul WP ID."
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
        },
        {
          q: "Dove vedo lo stato della mia selezione?",
          a: "Nel tuo Profilo, clicca sull'icona della cartella (Le mie selezioni). Lì vedrai se la tua pratica è in attesa, approvata o negata."
        }
      ]
    },
    {
      category: "GARAGE & TOOLS",
      icon: Car,
      items: [
        {
          q: "Cos'è il Low Score?",
          a: "È un punteggio calcolato dalla nostra AI che analizza l'assetto e il fitment della tua auto. Più il progetto è 'Low' e preciso, più alto sarà il punteggio."
        },
        {
          q: "Come funziona il Camber Helper?",
          a: "Appoggia il telefono contro il cerchio. Lo strumento userà il giroscopio per misurare l'inclinazione esatta. Ricorda di tararlo su una superficie piana prima dell'uso."
        }
      ]
    },
    {
      category: "SHOP & ORDINI",
      icon: ShoppingBag,
      items: [
        {
          q: "Come posso pagare i miei ordini?",
          a: "Dopo aver confermato l'ordine nell'app, verrai indirizzato su WhatsApp per completare il pagamento con lo Staff. Accettiamo i principali metodi digitali."
        }
      ]
    }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black border-none text-white w-full h-[100dvh] max-w-none p-0 m-0 rounded-none overflow-y-auto z-[200]">
          {/* Header Fisso */}
          <div className="p-6 pb-4 sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-white/5 pt-[calc(1.5rem+env(safe-area-inset-top))]">
            <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
                  <HelpCircle size={24} />
                </div>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  {language === 'it' ? "Centro Assistenza" : "Help Center"}
                </DialogTitle>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={28} className="text-zinc-500" />
              </button>
            </div>

            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 max-w-3xl mx-auto w-full">
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
          </div>

          {/* Content Area */}
          <div className="p-6 pt-4 space-y-10 max-w-3xl mx-auto w-full pb-32">
            <AnimatePresence mode="wait">
              {activeTab === 'faq' ? (
                <motion.div 
                  key="faq-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* FAQ ADMIN */}
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

                  {/* FAQ STAFF */}
                  {(isAdmin || isStaff) && staffFaqs.map((cat, idx) => (
                    <div key={`staff-${idx}`} className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <cat.icon size={14} className="text-blue-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 italic">{cat.category}</h3>
                      </div>
                      <Accordion type="single" collapsible className="space-y-2">
                        {cat.items.map((item, i) => (
                          <AccordionItem key={i} value={`staff-item-${i}`} className="border border-blue-500/20 bg-blue-500/5 rounded-2xl px-6 overflow-hidden">
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

                  {/* FAQ SUPPORT */}
                  {(isAdmin || isStaff || isSupport) && supportFaqs.map((cat, idx) => (
                    <div key={`support-${idx}`} className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <cat.icon size={14} className="text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 italic">{cat.category}</h3>
                      </div>
                      <Accordion type="single" collapsible className="space-y-2">
                        {cat.items.map((item, i) => (
                          <AccordionItem key={i} value={`support-item-${i}`} className="border border-amber-500/20 bg-amber-500/5 rounded-2xl px-6 overflow-hidden">
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

                  {/* FAQ PUBBLICHE */}
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
        </DialogContent>
      </Dialog>

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