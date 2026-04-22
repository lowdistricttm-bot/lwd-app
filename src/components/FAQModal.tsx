"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, Calendar, ShieldCheck, X
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
  const { language } = useTranslation();
  const { isAdmin } = useAdmin();

  useBodyLock(isOpen);

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

              <div className="space-y-10">
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FAQModal;