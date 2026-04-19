"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, Car, Calendar, Shield, User, 
  Camera, MessageSquare, ShieldCheck, Search, ShoppingBag, X
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAdmin } from '@/hooks/use-admin';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
  const { language } = useTranslation();
  const { isAdmin, isStaff, isSupport } = useAdmin();

  const publicFaqs = [
    {
      category: language === 'it' ? "ESPLORA & DISCOVER" : "EXPLORE & DISCOVER",
      icon: Search,
      items: [
        {
          q: language === 'it' ? "A cosa serve la sezione Esplora?" : "What is the Explore section for?",
          a: language === 'it' 
            ? "È il motore di ricerca del District. Qui puoi trovare nuovi membri, vedere chi è online e scoprire i progetti stance più interessanti della community. Usa la barra di ricerca per trovare amici o profili specifici."
            : "It's the District's search engine. Here you can find new members, see who's online, and discover the community's most interesting stance projects. Use the search bar to find friends or specific profiles."
        }
      ]
    },
    {
      category: language === 'it' ? "EVENTI & SELEZIONI" : "EVENTS & SELECTIONS",
      icon: Calendar,
      items: [
        {
          q: language === 'it' ? "Come ricevo l'esito della selezione?" : "How do I get the selection result?",
          a: language === 'it'
            ? "Riceverai una notifica push direttamente nell'app e, contemporaneamente, una email ufficiale di conferma o rifiuto. Potrai sempre monitorare lo stato in tempo reale nella tab 'Le mie selezioni' del tuo profilo."
            : "You will receive a push notification directly in the app and, at the same time, an official confirmation or rejection email. You can always monitor the status in real-time in the 'My Selections' tab of your profile."
        },
        {
          q: language === 'it' ? "Candidatura rapida tramite Garage" : "Quick application via Garage",
          a: language === 'it'
            ? "Per candidarti velocemente, assicurati di avere l'auto nel tuo Garage. Durante l'iscrizione all'evento, potrai richiamare tutti i dati del veicolo con un click, rendendo il processo immediato."
            : "To apply quickly, make sure you have your car in your Garage. During event registration, you can pull up all vehicle data with one click, making the process immediate."
        }
      ]
    },
    {
      category: language === 'it' ? "SOCIAL & STORIES" : "SOCIAL & STORIES",
      icon: Camera,
      items: [
        {
          q: language === 'it' ? "Come funzionano le Stories?" : "How do Stories work?",
          a: language === 'it' 
            ? "Le Stories durano 24 ore e sono visibili in cima alla Home. Puoi caricare foto o video dei tuoi momenti nel District. Dopo 24 ore spariranno, ma potrai salvarle nei tuoi 'Highlights' sul profilo."
            : "Stories last 24 hours and are visible at the top of the Home. You can upload photos or videos of your moments in the District. They disappear after 24h, but you can save them to your 'Highlights' on your profile."
        },
        {
          q: language === 'it' ? "Chi può vedere i miei post?" : "Who can see my posts?",
          a: language === 'it'
            ? "Tutti i membri registrati del District possono vedere, commentare e mettere like ai tuoi post nella Bacheca."
            : "All registered District members can see, comment, and like your posts in the Feed."
        }
      ]
    },
    {
      category: language === 'it' ? "IL GARAGE" : "THE GARAGE",
      icon: Car,
      items: [
        {
          q: language === 'it' ? "Perché aggiungere l'auto al Garage?" : "Why add my car to the Garage?",
          a: language === 'it'
            ? "Il Garage è il tuo biglietto da visita. È fondamentale per partecipare agli eventi: lo staff valuterà il tuo progetto basandosi sulle foto e le info inserite qui."
            : "The Garage is your business card. It's essential for joining events: staff will evaluate your project based on the photos and info entered here."
        }
      ]
    },
    {
      category: language === 'it' ? "SHOP & ORDINI" : "SHOP & ORDERS",
      icon: ShoppingBag,
      items: [
        {
          q: language === 'it' ? "Dove trovo i miei acquisti?" : "Where can I find my purchases?",
          a: language === 'it'
            ? "Nella sezione 'I miei ordini' del tuo profilo puoi vedere lo storico degli acquisti, lo stato del pagamento e il tracking della spedizione."
            : "In the 'My Orders' section of your profile, you can see your purchase history, payment status, and shipping tracking."
        }
      ]
    }
  ];

  const staffFaqs = [];
  if (isAdmin || isStaff || isSupport) {
    const staffItems = [];
    staffItems.push({
      q: language === 'it' ? "Come gestisco le Selezioni?" : "How do I manage Applications?",
      a: language === 'it'
        ? "Nella Dashboard, vai su 'Gestione Selezioni'. Se sei Admin o Staff puoi approvare/rifiutare (l'utente riceverà App + Email), se sei Support puoi votare per aiutare nella scelta."
        : "In the Dashboard, go to 'Manage Applications'. If you are Admin or Staff you can approve/reject (user gets App + Email), if you are Support you can vote to help the selection."
    });

    if (isAdmin || isStaff) {
      staffItems.push({
        q: language === 'it' ? "Come invio una Notifica Globale?" : "How do I send a Global Notification?",
        a: language === 'it'
          ? "Usa il 'Centro Notifiche' nella Dashboard per inviare annunci che appariranno a tutta la community o a utenti singoli."
          : "Use the 'Notification Center' in the Dashboard to send announcements to the entire community or individual users."
      });
    }

    if (isAdmin) {
      staffItems.push({
        q: language === 'it' ? "Come cambio il ruolo di un utente?" : "How do I change a user's role?",
        a: language === 'it'
          ? "In 'Gestione Membri' puoi assegnare ruoli come Staff o Support. I ruoli Admin sono gestiti solo via database per sicurezza."
          : "In 'Member Management' you can assign roles like Staff or Support. Admin roles are managed via database only for security."
      });
    }

    staffFaqs.push({
      category: language === 'it' ? "PANNELLO STAFF" : "STAFF PANEL",
      icon: ShieldCheck,
      items: staffItems
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-0 shadow-2xl">
        <div className="p-8 pb-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
              <HelpCircle size={24} />
            </div>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              {language === 'it' ? "Centro Assistenza" : "Help Center"}
            </DialogTitle>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-10">
          {staffFaqs.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <cat.icon size={14} className="text-red-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 italic">{cat.category}</h3>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`staff-${i}`} className="border border-red-500/20 bg-red-500/5 rounded-2xl px-6 overflow-hidden">
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
            <div key={idx} className="space-y-4">
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
      </DialogContent>
    </Dialog>
  );
};

export default FAQModal;