"use client";

import React, { useState, createContext, useContext, useEffect } from 'react';

export type Language = 
  | 'it' | 'en' | 'fr' | 'de' | 'es' | 'pt' | 'nl' | 'pl' | 'ro' | 'sv' 
  | 'da' | 'fi' | 'el' | 'hu' | 'cs' | 'bg' | 'sk' | 'hr' | 'lt' | 'sl' 
  | 'lv' | 'et' | 'mt' | 'ga' | 'no' | 'tr' | 'ru';

const translations: Record<string, any> = {
  it: {
    nav: { 
      home: 'Home', 
      shop: 'Shop', 
      events: 'Eventi', 
      garage: 'Garage', 
      profile: 'Profilo', 
      settings: 'Impostazioni' 
    },
    hero: { 
      subtitle: 'The Stance Culture', 
      title: 'LOW DISTRICT', 
      desc: "Più di una passione, uno stile di vita. Esplora il merchandising ufficiale e partecipa ai raduni più esclusivi della scena stance.", 
      shopBtn: 'Esplora lo Shop', 
      eventsBtn: 'Scopri gli Eventi' 
    },
    shop: { 
      title: 'Merchandising', 
      subtitle: 'Drop Ufficiali', 
      search: 'Cerca prodotti...', 
      sort: 'Ordina per', 
      all: 'Tutti i prodotti',
      newDrop: 'Nuovo Drop',
      limited: 'Edizione Limitata'
    },
    profile: { 
      posts: 'Post', 
      followers: 'Follower', 
      following: 'Seguiti', 
      activeCar: 'Progetto Attivo', 
      myPosts: 'I Miei Post', 
      saved: 'Elementi Salvati',
      editProfile: 'Modifica Profilo'
    },
    settings: { 
      title: 'Impostazioni', 
      language: 'Lingua Applicazione', 
      notifications: 'Notifiche Push', 
      account: 'Account e Sicurezza', 
      logout: 'Disconnetti', 
      selections: 'Le Mie Candidature', 
      payments: 'Metodi di Pagamento',
      privacy: 'Privacy e Permessi',
      support: 'Centro Assistenza'
    },
    garage: { 
      title: 'Il Mio Garage', 
      subtitle: 'I tuoi progetti stance', 
      empty: 'Nessun veicolo nel garage', 
      addBtn: 'Aggiungi Veicolo', 
      active: 'Principale', 
      setMain: 'Imposta come principale',
      brand: 'Marca',
      model: 'Modello',
      year: 'Anno',
      suspension: 'Assetto'
    },
    events: {
      apply: 'Candidati Ora',
      statusOpen: 'Iscrizioni Aperte',
      statusSoon: 'In Arrivo',
      location: 'Luogo',
      date: 'Data Evento',
      selectVehicle: 'Seleziona Veicolo',
      reviewNote: 'La candidatura verrà revisionata dallo staff. Riceverai una notifica in caso di approvazione.'
    }
  },
  en: {
    nav: { home: 'Home', shop: 'Shop', events: 'Events', garage: 'Garage', profile: 'Profile', settings: 'Settings' },
    hero: { subtitle: 'The Stance Culture', title: 'LOW DISTRICT', desc: "It's not just a car, it's a lifestyle. Discover our exclusive collection and upcoming community events.", shopBtn: 'Shop Now', eventsBtn: 'Events' },
    shop: { title: 'Merchandising', subtitle: 'Official Gear', search: 'Search products...', sort: 'Sort by', all: 'All' },
    profile: { posts: 'Posts', followers: 'Followers', following: 'Following', activeCar: 'Active Car', myPosts: 'My Posts', saved: 'Saved' },
    settings: { title: 'Settings', language: 'Language', notifications: 'Notifications', account: 'Account & App', logout: 'Logout', selections: 'My Selections', payments: 'Payments' },
    garage: { title: 'My Garage', subtitle: 'Manage your projects', empty: 'Your garage is empty', addBtn: 'Add Vehicle', active: 'Active', setMain: 'Set as main' }
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