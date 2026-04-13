"use client";

import React, { useState, createContext, useContext, useEffect } from 'react';

export type Language = 
  | 'it' | 'en' | 'fr' | 'de' | 'es' | 'pt' | 'nl' | 'pl' | 'ro' | 'sv' 
  | 'da' | 'fi' | 'el' | 'hu' | 'cs' | 'bg' | 'sk' | 'hr' | 'lt' | 'sl' 
  | 'lv' | 'et' | 'mt' | 'ga' | 'no' | 'tr' | 'ru';

const translations: Record<string, any> = {
  it: {
    nav: { 
      home: 'HOME', 
      shop: 'SHOP', 
      events: 'EVENTI', 
      garage: 'GARAGE', 
      profile: 'PROFILO', 
      settings: 'IMPOSTAZIONI' 
    },
    hero: { 
      subtitle: 'THE STANCE CULTURE', 
      title: 'LOW DISTRICT', 
      desc: "PIÙ DI UNA PASSIONE, UNO STILE DI VITA. ESPLORA IL MERCHANDISING UFFICIALE E PARTECIPA AI RADUNI PIÙ ESCLUSIVI DELLA SCENA STANCE.", 
      shopBtn: 'ESPLORA LO SHOP', 
      eventsBtn: 'SCOPRI GLI EVENTI' 
    },
    shop: { 
      title: 'MERCHANDISING', 
      subtitle: 'DROP UFFICIALI', 
      search: 'CERCA PRODOTTI...', 
      sort: 'ORDINA PER', 
      all: 'TUTTI I PRODOTTI',
      newDrop: 'NUOVO DROP',
      limited: 'EDIZIONE LIMITATA'
    },
    profile: { 
      posts: 'POST', 
      followers: 'FOLLOWER', 
      following: 'SEGUITI', 
      activeCar: 'PROGETTO ATTIVO', 
      myPosts: 'I MIEI POST', 
      saved: 'ELEMENTI SALVATI',
      editProfile: 'MODIFICA PROFILO'
    },
    settings: { 
      title: 'IMPOSTAZIONI', 
      language: 'LINGUA APPLICAZIONE', 
      notifications: 'NOTIFICHE PUSH', 
      account: 'ACCOUNT E SICUREZZA', 
      logout: 'DISCONNETTI SESSIONE', 
      selections: 'LE MIE CANDIDATURE', 
      payments: 'METODI DI PAGAMENTO',
      privacy: 'PRIVACY E PERMESSI',
      support: 'CENTRO ASSISTENZA'
    },
    garage: { 
      title: 'IL MIO GARAGE', 
      subtitle: 'I TUOI PROGETTI STANCE', 
      empty: 'NESSUN VEICOLO NEL GARAGE', 
      addBtn: 'AGGIUNGI VEICOLO', 
      active: 'PRINCIPALE', 
      setMain: 'IMPOSTA COME PRINCIPALE',
      brand: 'MARCA',
      model: 'MODELLO',
      year: 'ANNO',
      suspension: 'ASSETTO'
    },
    events: {
      apply: 'CANDIDATI ORA',
      statusOpen: 'ISCRIZIONI APERTE',
      statusSoon: 'IN ARRIVO',
      location: 'LUOGO',
      date: 'DATA EVENTO',
      selectVehicle: 'SELEZIONA VEICOLO',
      reviewNote: 'LA CANDIDATURA VERRÀ REVISIONATA DALLO STAFF. RICEVERAI UNA NOTIFICA IN CASO DI APPROVAZIONE.'
    },
    errors: {
      connection: 'ERRORE DI CONNESSIONE AL SERVER',
      retry: 'RIPROVA ORA',
      noData: 'NESSUN DATO TROVATO',
      authRequired: 'ACCESSO RISERVATO AI MEMBRI'
    }
  },
  en: {
    nav: { home: 'HOME', shop: 'SHOP', events: 'EVENTS', garage: 'GARAGE', profile: 'PROFILE', settings: 'SETTINGS' },
    hero: { subtitle: 'THE STANCE CULTURE', title: 'LOW DISTRICT', desc: "IT'S NOT JUST A CAR, IT'S A LIFESTYLE. DISCOVER OUR EXCLUSIVE COLLECTION AND UPCOMING COMMUNITY EVENTS.", shopBtn: 'SHOP NOW', eventsBtn: 'EVENTS' },
    shop: { title: 'MERCHANDISING', subtitle: 'OFFICIAL GEAR', search: 'SEARCH PRODUCTS...', sort: 'SORT BY', all: 'ALL' },
    profile: { posts: 'POSTS', followers: 'FOLLOWERS', following: 'FOLLOWING', activeCar: 'ACTIVE CAR', myPosts: 'MY POSTS', saved: 'think
The user is pointing out that my previous response was cut off. I need to continue the code block for `src/hooks/use-translation.tsx` exactly where it stopped and then provide the rest of the requested changes (fixing the connection error and system messages).

Looking at the previous output:
`profile: { posts: 'POSTS', followers: 'FOLLOWERS', following: 'FOLLOWING', activeCar: 'ACTIVE CAR', myPosts: 'MY POSTS', saved: '`

I need to complete the `en` object and the rest of the file.
Then I need to update `src/hooks/use-buddypress.ts` to be more resilient.
Then I need to update `src/components/GaragePreview.tsx` and `src/pages/Members.tsx` to use the new translation keys and handle errors better.

Wait, the user also asked to "correggi anche tutti i messaggi nel system messagges". This likely refers to the error messages shown in the UI (toasts, error states in components).

Let's finish `src/hooks/use-translation.tsx` first.

Then I will update `src/hooks/use-buddypress.ts` to handle potential CORS or endpoint issues better.

Then I will update the components to use the new translation keys.

Actually, I should probably check if I can simplify the BuddyPress fetch to avoid the "black screen" (which usually happens when a component crashes or an error isn't caught properly).

Let's proceed.SAVED' },
    settings: { title: 'SETTINGS', language: 'LANGUAGE', notifications: 'NOTIFICATIONS', account: 'ACCOUNT & APP', logout: 'LOGOUT', selections: 'MY SELECTIONS', payments: 'PAYMENTS' },
    garage: { title: 'MY GARAGE', subtitle: 'MANAGE YOUR PROJECTS', empty: 'YOUR GARAGE IS EMPTY', addBtn: 'ADD VEHICLE', active: 'ACTIVE', setMain: 'SET AS MAIN' },
    errors: {
      connection: 'SERVER CONNECTION ERROR',
      retry: 'RETRY NOW',
      noData: 'NO DATA FOUND',
      authRequired: 'MEMBERS ONLY ACCESS'
    }
  }
};

// Fallback per tutte le altre lingue (usano l'inglese come base)
const otherLangs = ['fr', 'de', 'es', 'pt', 'nl', 'pl', 'ro', 'sv', 'da', 'fi', 'el', 'hu', 'cs', 'bg', 'sk', 'hr', 'lt', 'sl', 'lv', 'et', 'mt', 'ga', 'no', 'tr', 'ru'];
otherLangs.forEach(lang => {
  if (!translations[lang]) translations[lang] = translations.en;
});

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
} | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('app-lang') : 'it';
    return (saved as Language) || 'it';
  });

  useEffect(() => {
    localStorage.setItem('app-lang', language);
  }, [language]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};