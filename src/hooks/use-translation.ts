"use client";

import { useState, createContext, useContext, useEffect } from 'react';

type Language = 'it' | 'en';

const translations = {
  it: {
    nav: { home: 'Home', shop: 'Shop', events: 'Eventi', garage: 'Garage', profile: 'Profilo', settings: 'Impostazioni' },
    hero: { subtitle: 'La Cultura Stance', title: 'LOW DISTRICT', desc: "Non è solo un'auto, è uno stile di vita. Scopri la nostra collezione esclusiva e i prossimi eventi.", shopBtn: 'Acquista Ora', eventsBtn: 'Eventi' },
    shop: { title: 'Merchandising', subtitle: 'Abbigliamento Ufficiale', search: 'Cerca prodotti...', sort: 'Ordina per', all: 'Tutti' },
    profile: { posts: 'Post', followers: 'Follower', following: 'Seguiti', activeCar: 'Auto Attiva', myPosts: 'I Miei Post', saved: 'Salvati' },
    settings: { title: 'Impostazioni', language: 'Lingua', notifications: 'Notifiche', account: 'Account & App', logout: 'Esci', selections: 'Le Mie Selezioni', payments: 'Pagamenti' },
    garage: { title: 'Il Mio Garage', subtitle: 'Gestisci i tuoi progetti', empty: 'Il tuo garage è vuoto', addBtn: 'Aggiungi Veicolo', active: 'Attivo', setMain: 'Imposta come principale' }
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

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
} | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-lang');
    return (saved as Language) || 'it';
  });

  useEffect(() => {
    localStorage.setItem('app-lang', language);
  }, [language]);

  const t = translations[language];

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