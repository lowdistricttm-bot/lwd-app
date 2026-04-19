"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, Car, Calendar, Shield, User, 
  Camera, MessageSquare, ShieldCheck, Search, ShoppingBag, X, Settings, ClipboardCheck, Bell
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

  const adminFaqs = [
    {
      category: language === 'it' ? "PANNELLO AMMINISTRAZIONE" : "ADMIN PANEL",
      icon: ShieldCheck,
      items: [
        {
          q: language === 'it' ? "Come gestisco i ruoli dei membri?" : "How do I manage member roles?",
          a: language === 'it' 
            ? "Dalla Dashboard Admin, vai su 'Gestione Membri'. Qui puoi cercare qualsiasi utente e cambiare il suo grado (es. da Iscritto a Membro Ufficiale o Staff). I ruoli Admin sono protetti e gestiti via database."
            : "From the Admin Dashboard, go to 'Member Management'. Here you can search for any user and change their rank (e.g., from Subscriber to Official Member or Staff). Admin roles are protected and managed via database."
        },
        {
          q: language === 'it' ? "Configurazione Email Automatiche" : "Automatic Email Configuration",
          a: language === 'it'
            ? "In 'Configurazione Email' puoi personalizzare l'oggetto e il corpo dei messaggi che gli utenti ricevono quando la loro candidatura viene approvata o rifiutata. Usa i segnaposto come {{user_name}} per rendere i messaggi dinamici."
            : "In 'Email Configuration' you can customize the subject and body of messages users receive when their application is approved or rejected. Use placeholders like {{user_name}} to make messages dynamic."
        }
      ]
    }
  ];

  const staffFaqs = [
    {
      category: language === 'it' ? "PANNELLO STAFF" : "STAFF PANEL",
      icon: Shield,
      items: [
        {
          q: language === 'it' ? "Come approvo o rifiuto una candidatura?" : "How do I approve or reject an application?",
          a: language === 'it'
            ? "Nella sezione 'Gestione Selezioni', espandi la scheda di un utente per vedere i dettagli del veicolo e le foto. Usa i tasti 'Approva' o 'Nega' per inviare la decisione definitiva. L'utente riceverà istantaneamente una notifica e una email."
            : "In the 'Manage Applications' section, expand a user's card to see vehicle details and photos. Use the 'Approve' or 'Reject' buttons to send the final decision. The user will instantly receive a notification and an email."
        },
        {
          q: language === 'it' ? "Invio Notifiche Globali" : "Sending Global Notifications",
          a: language === 'it'
            ? "Usa il 'Centro Notifiche' per inviare annunci importanti a tutta la community o avvisi mirati a singoli utenti. Puoi scegliere tra diversi livelli di urgenza (Info, Avviso, Importante)."
            : "Use the 'Notification Center' to send important announcements to the entire community or targeted alerts to individual users. You can choose between different urgency levels (Info, Warning, Important)."
        }
      ]
    }
  ];

  const supportFaqs = [
    {
      category: language === 'it' ? "PANNELLO SUPPORTO" : "SUPPORT PANEL",
      icon: MessageSquare,
      items: [
        {
          q: language === 'it' ? "Come funziona il sistema di voto?" : "How does the voting system work?",
          a: language === 'it'
            ? "Come membro del Supporto, il tuo compito è aiutare lo Staff nella selezione. Nella Dashboard puoi votare 'SI' o 'NO' sui progetti candidati. Il tuo voto non è definitivo ma serve come indicazione per gli Admin/Staff."
            : "As a Support member, your job is to help the Staff in the selection. In the Dashboard, you can vote 'YES' or 'NO' on candidate projects. Your vote is not final but serves as a guide for Admins/Staff."
        }
      ]
    }
  ];

  const publicFaqs = [
    {
      category: language === 'it' ? "EVENTI & SELEZIONI" : "EVENTS & SELECTIONS",
      icon: Calendar,
      items: [
        {
          q: language === 'it' ? "Dove vedo le mie candidature inviate?" : "Where can I see my sent applications?",
          a: language === 'it'
            ? "Puoi monitorare lo stato di tutte le tue candidature direttamente dal tuo Profilo Personale, nella tab 'Le mie selezioni' (icona della cartella). Lì vedrai se la tua richiesta è in attesa, approvata o negata."
            : "You can monitor the status of all your applications directly from your Personal Profile, in the 'My Selections' tab (folder icon). There you will see if your request is pending, approved, or rejected."
        },
        {
          q: language === 'it' ? "Come ricevo l'esito della selezione?" : "How do I get the selection result?",
          a: language === 'it'
            ? "Riceverai una notifica push direttamente nell'app e una email ufficiale. Assicurati di avere le notifiche attive nelle impostazioni del tuo profilo."
            : "You will receive a push notification directly in the app and an official email. Make sure you have notifications enabled in your profile settings."
        }
      ]
    },
    {
      category: language === 'it' ? "IMPOSTAZIONI & ACCOUNT" : "SETTINGS & ACCOUNT",
      icon: Settings,
      items: [
        {
          q: language === 'it' ? "Come cambio la lingua dell'app?" : "How do I change the app language?",
          a: language === 'it' 
            ? "Vai nella tab 'Impostazioni' del tuo profilo e cerca la voce 'Lingua App'. Puoi scegliere tra Italiano e Inglese; l'intera interfaccia e i contenuti si adatteranno istantaneamente."
            : "Go to the 'Settings' tab of your profile and look for 'App Language'. You can choose between Italian and English; the entire interface and content will adapt instantly."
        },
        {
          q: language === 'it' ? "Privacy della Targa" : "License Plate Privacy",
          a: language === 'it'
            ? "Nelle Impostazioni puoi decidere chi può vedere la targa dei tuoi veicoli nel Garage. Se impostata su 'Solo Amministratori', la targa sarà visibile solo allo staff durante le selezioni per gli eventi."
            : "In Settings, you can decide who can see your vehicle's license plate in the Garage. If set to 'Admins Only', the plate will only be visible to staff during event selections."
        },
        {
          q: language === 'it' ? "Gestione Notifiche" : "Notification Management",
          a: language === 'it'
            ? "Puoi verificare lo stato delle notifiche Push ed Email nella sezione Impostazioni. Queste sono fondamentali per ricevere aggiornamenti sui tuoi ordini e sulle selezioni agli eventi."
            : "You can check the status of Push and Email notifications in the Settings section. These are essential for receiving updates on your orders and event selections."
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
            ? "Le Stories durano 24 ore e sono visibili in cima alla Home. Puoi caricare foto o video. Dopo 24 ore spariranno, ma potrai salvarle nei tuoi 'Highlights' sul profilo."
            : "Stories last 24 hours and are visible at the top of the Home. You can upload photos or videos. They disappear after 24h, but you can save them to your 'Highlights' on your profile."
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
    }
  ];

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
          {/* Pannello Admin */}
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

          {/* Pannello Staff */}
          {isStaff && staffFaqs.map((cat, idx) => (
            <div key={`staff-${idx}`} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <cat.icon size={14} className="text-orange-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 italic">{cat.category}</h3>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`staff-item-${i}`} className="border border-orange-500/20 bg-orange-500/5 rounded-2xl px-6 overflow-hidden">
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

          {/* Pannello Support */}
          {isSupport && supportFaqs.map((cat, idx) => (
            <div key={`support-${idx}`} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <cat.icon size={14} className="text-blue-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 italic">{cat.category}</h3>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`support-item-${i}`} className="border border-blue-400/20 bg-blue-400/5 rounded-2xl px-6 overflow-hidden">
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

          {/* FAQ Pubbliche */}
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
      </DialogContent>
    </Dialog>
  );
};

export default FAQModal;