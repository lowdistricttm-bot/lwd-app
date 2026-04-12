"use client";

import React, { useState, createContext, useContext, useEffect } from 'react';

export type Language = 
  | 'it' | 'en' | 'fr' | 'de' | 'es' | 'pt' | 'nl' | 'pl' | 'ro' | 'sv' 
  | 'da' | 'fi' | 'el' | 'hu' | 'cs' | 'bg' | 'sk' | 'hr' | 'lt' | 'sl' 
  | 'lv' | 'et' | 'mt' | 'ga' | 'no' | 'tr' | 'ru';

const translations: Record<string, any> = {
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
  },
  fr: {
    nav: { home: 'Accueil', shop: 'Boutique', events: 'Événements', garage: 'Garage', profile: 'Profil', settings: 'Paramètres' },
    hero: { subtitle: 'La Culture Stance', title: 'LOW DISTRICT', desc: "Ce n'est pas seulement une voiture, c'est un style de vie. Découvrez notre collection exclusive.", shopBtn: 'Acheter', eventsBtn: 'Événements' },
    shop: { title: 'Merchandising', subtitle: 'Équipement Officiel', search: 'Rechercher...', sort: 'Trier par', all: 'Tout' },
    profile: { posts: 'Posts', followers: 'Abonnés', following: 'Abonnements', activeCar: 'Voiture Active', myPosts: 'Mes Posts', saved: 'Enregistrés' },
    settings: { title: 'Paramètres', language: 'Langue', notifications: 'Notifications', account: 'Compte', logout: 'Déconnexion', selections: 'Mes Sélections', payments: 'Paiements' },
    garage: { title: 'Mon Garage', subtitle: 'Gérez vos projets', empty: 'Votre garage est vide', addBtn: 'Ajouter Véhicule', active: 'Actif', setMain: 'Définir comme principal' }
  },
  de: {
    nav: { home: 'Startseite', shop: 'Shop', events: 'Events', garage: 'Garage', profile: 'Profil', settings: 'Einstellungen' },
    hero: { subtitle: 'Die Stance-Kultur', title: 'LOW DISTRICT', desc: "Es ist nicht nur ein Auto, es ist ein Lebensstil. Entdecken Sie unsere exklusive Kollektion.", shopBtn: 'Jetzt Kaufen', eventsBtn: 'Events' },
    shop: { title: 'Merchandising', subtitle: 'Offizielle Ausrüstung', search: 'Suche...', sort: 'Sortieren nach', all: 'Alle' },
    profile: { posts: 'Beiträge', followers: 'Follower', following: 'Gefolgt', activeCar: 'Aktives Auto', myPosts: 'Meine Beiträge', saved: 'Gespeichert' },
    settings: { title: 'Einstellungen', language: 'Sprache', notifications: 'Benachrichtigungen', account: 'Konto', logout: 'Abmelden', selections: 'Meine Auswahl', payments: 'Zahlungen' },
    garage: { title: 'Meine Garage', subtitle: 'Verwalten Sie Ihre Projekte', empty: 'Ihre Garage ist leer', addBtn: 'Fahrzeug hinzufügen', active: 'Aktiv', setMain: 'Als Hauptfahrzeug festlegen' }
  },
  es: {
    nav: { home: 'Inicio', shop: 'Tienda', events: 'Eventos', garage: 'Garaje', profile: 'Perfil', settings: 'Ajustes' },
    hero: { subtitle: 'La Cultura Stance', title: 'LOW DISTRICT', desc: "No es solo un coche, es un estilo de vida. Descubre nuestra colección exclusiva.", shopBtn: 'Comprar Ahora', eventsBtn: 'Eventos' },
    shop: { title: 'Merchandising', subtitle: 'Ropa Oficial', search: 'Buscar...', sort: 'Ordenar por', all: 'Todo' },
    profile: { posts: 'Posts', followers: 'Seguidores', following: 'Siguiendo', activeCar: 'Coche Activo', myPosts: 'Mis Posts', saved: 'Guardados' },
    settings: { title: 'Ajustes', language: 'Idioma', notifications: 'Notificaciones', account: 'Cuenta', logout: 'Cerrar Sesión', selections: 'Mis Selecciones', payments: 'Pagos' },
    garage: { title: 'Mi Garaje', subtitle: 'Gestiona tus proyectos', empty: 'Tu garaje está vacío', addBtn: 'Añadir Vehículo', active: 'Activo', setMain: 'Establecer como principal' }
  }
};

// Fallback per tutte le altre lingue (usano l'inglese come base)
const otherLangs = ['pt', 'nl', 'pl', 'ro', 'sv', 'da', 'fi', 'el', 'hu', 'cs', 'bg', 'sk', 'hr', 'lt', 'sl', 'lv', 'et', 'mt', 'ga', 'no', 'tr', 'ru'];
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