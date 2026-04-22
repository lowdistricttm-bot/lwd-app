"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, Calendar, ShieldCheck, X, Home, MessageSquare, 
  MapPin, Compass, ShoppingBag, Car, Tag, Settings, Sparkles,
  ShieldAlert, Zap, Info, Truck, Gauge, Mail
} from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
  const { language } = useTranslation();
  const { isAdmin, isStaff, isSupport, role } = useAdmin();

  useBodyLock(isOpen);

  const isAuthorized = isAdmin || isStaff || isSupport;

  const faqCategories = [
    {
      category: "GENERALE & NAVIGAZIONE",
      icon: Home,
      items: [
        {
          q: "Cos'è Low District App?",
          a: "È l'hub ufficiale della cultura Stance in Italia. Unisce social network, gestione del proprio garage, calendario eventi ufficiali e strumenti tecnici per appassionati."
        },
        {
          q: "Come funziona la navigazione?",
          a: "Usa la barra inferiore per muoverti tra le sezioni principali. Puoi scorrere (swipe) verso destra o sinistra per tornare indietro o avanti tra le pagine, proprio come un'app nativa."
        }
      ]
    },
    {
      category: "COMMUNITY & SOCIAL",
      icon: MessageSquare,
      items: [
        {
          q: "Bacheca (Feed): come funziona?",
          a: "È il social del District. Qui puoi pubblicare foto e video dei tuoi progressi, mettere like e commentare i post degli altri membri. I post sono visibili solo agli utenti registrati."
        },
        {
          q: "Storie: quanto durano?",
          a: "Le storie durano 24 ore. Puoi menzionare altri utenti: riceveranno un messaggio privato e potranno ricondividere la tua storia sul loro profilo."
        },
        {
          q: "Messaggi Privati (Direct)",
          a: "Puoi inviare messaggi, foto e post agli altri membri. Nota: questa funzione è riservata ai Membri Ufficiali e agli Iscritti+ per garantire la sicurezza della community."
        }
      ]
    },
    {
      category: "GARAGE & TOOLS",
      icon: Car,
      items: [
        {
          q: "Cos'è il Low Score Analyzer?",
          a: "È un'intelligenza artificiale che analizza la foto del tuo veicolo per calcolare un punteggio basato su fitment, camber e altezza da terra. Il punteggio viene salvato nel tuo garage e ti permette di scalare le classifiche."
        },
        {
          q: "Diario di Bordo: a cosa serve?",
          a: "È una timeline privata del tuo progetto. Puoi registrare ogni modifica, manutenzione o costo sostenuto. Puoi anche impostare promemoria per scadenze future."
        },
        {
          q: "Fitment Calc & Camber Helper",
          a: "Strumenti tecnici per aiutarti nella build. Il Fitment Calc simula lo spostamento del cerchio cambiando canale ed ET. Il Camber Helper usa i sensori del telefono per misurare l'inclinazione reale della ruota."
        },
        {
          q: "Rain-Check: Meteo Detailing",
          a: "Analizza le previsioni meteo della tua città per consigliarti se è il momento giusto per lavare l'auto o se è prevista pioggia nelle prossime 48 ore."
        }
      ]
    },
    {
      category: "EVENTI & SELEZIONI",
      icon: Calendar,
      items: [
        {
          q: "Come partecipo a un evento ufficiale?",
          a: "Nella sezione 'Eventi', seleziona un evento con stato 'ISCRIZIONI APERTE'. Clicca su 'Invia Selezione', scegli l'auto dal tuo garage e carica le foto richieste. Lo staff valuterà la tua candidatura."
        },
        {
          q: "Cosa sono le Carovane (Run to the Show)?",
          a: "Sono gruppi di viaggio organizzati dagli utenti per raggiungere insieme un evento. Puoi crearne una pubblica o una privata (accessibile solo tramite link segreto)."
        },
        {
          q: "District Meet: raduni spontanei",
          a: "A differenza degli eventi ufficiali, i Meet sono organizzati dai membri. Puoi vederli sulla mappa e unirti per incontrare altri appassionati nella tua zona."
        }
      ]
    },
    {
      category: "SHOP & MARKETPLACE",
      icon: ShoppingBag,
      items: [
        {
          q: "Come acquisto il merchandising ufficiale?",
          a: "Nello Shop trovi i drop esclusivi Low District. Aggiungi i prodotti al carrello e completa il checkout. Il pagamento viene finalizzato in modo sicuro tramite assistenza diretta su WhatsApp."
        },
        {
          q: "Cos'è la Mystery Box?",
          a: "Un drop mensile a stock limitato che contiene prodotti a sorpresa e la possibilità di trovare un 'Golden Ticket' per ingressi omaggio agli eventi."
        },
        {
          q: "Marketplace: compravendita tra privati",
          a: "Puoi pubblicare annunci per vendere i tuoi componenti (cerchi, interni, ecc.). Gli utenti ti contatteranno direttamente via chat. Ricorda di lasciare una valutazione al venditore dopo l'acquisto!"
        }
      ]
    }
  ];

  const adminFaqs = [
    {
      category: "PANNELLO STAFF & ADMIN",
      icon: ShieldCheck,
      items: [
        {
          q: "Gestione Selezioni Eventi",
          a: "Dalla Dashboard Admin puoi vedere tutte le candidature. Lo staff può votare (SI/NO) internamente, mentre gli Admin/Staff possono approvare o rifiutare definitivamente. Il sistema invierà automaticamente un'email e una notifica all'utente."
        },
        {
          q: "Come cambio il ruolo di un utente?",
          a: "Vai in 'Gestione Membri', cerca l'utente e usa il menu a tendina per assegnare un nuovo grado (es. da Iscritto a Membro Ufficiale)."
        },
        {
          q: "Invio Notifiche Globali",
          a: "Usa il 'Centro Notifiche' per inviare avvisi importanti a tutti gli utenti o messaggi mirati a un singolo membro. Appariranno nel loro centro notifiche con un'icona ufficiale."
        },
        {
          q: "Assegnazione Trofei Digitali",
          a: "Puoi premiare i vincitori degli eventi fisici creando un trofeo digitale che apparirà permanentemente sul loro profilo e nella Hall of Fame."
        }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} className="fixed inset-0 bg-black/80 z-[200] touch-none" 
          />

          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
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
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                      {language === 'it' ? "Centro Assistenza" : "Help Center"}
                    </h2>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Guida ufficiale Low District</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Sezione Admin (visibile solo a Staff/Admin) */}
                {isAuthorized && adminFaqs.map((cat, idx) => (
                  <div key={`admin-${idx}`} className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <ShieldAlert size={14} className="text-red-500" />
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

                {/* Sezioni Pubbliche */}
                {faqCategories.map((cat, idx) => (
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

              <div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-center">
                <Mail size={32} className="mx-auto text-zinc-700 mb-4" />
                <h4 className="text-sm font-black uppercase italic mb-2">Ancora dubbi?</h4>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-6">Contatta il nostro team di supporto diretto</p>
                <Button 
                  onClick={() => window.location.href = 'mailto:info@lowdistrict.it'}
                  className="bg-white text-black rounded-full px-8 h-12 font-black uppercase italic text-[10px] shadow-xl"
                >
                  Invia Email
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FAQModal;