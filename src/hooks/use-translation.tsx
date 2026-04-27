"use client";

import React, { useState, createContext, useContext, useEffect } from 'react';

export type Language = 'it' | 'en';

const translations: Record<Language, any> = {
  it: {
    nav: { 
      home: 'HOME', 
      shop: 'SHOP', 
      events: 'EVENTI', 
      garage: 'GARAGE', 
      profile: 'PROFILO', 
      settings: 'IMPOSTAZIONI',
      feed: 'BACHECA',
      messages: 'MESSAGGI'
    },
    hero: { 
      subtitle: 'CARS - CULTURE - LIFESTYLE', 
      title: 'LOW DISTRICT', 
      desc: "PIÙ di una passione, uno stile di vita.", 
      shopBtn: 'ESPLORA LO SHOP', 
      eventsBtn: 'SCOPRI GLI EVENTI',
      scroll: 'SCORRI'
    },
    home: {
      newDrops: 'NUOVI DROP',
      officialGear: 'OFFICIAL MERCH',
      viewAll: 'VEDI TUTTO',
      communityActivity: 'COMMUNITY ACTIVITY',
      districtLive: 'DISTRICT FEED',
      districtMeet: 'DISTRICT MEET',
      upcomingMeets: 'INCONTRI COMMUNITY',
      enterFeed: 'ENTRA NELLA BACHECA',
      values: {
        community: 'COMMUNITY',
        communityDesc: 'Migliaia di utenti uniti dalla stessa passione',
        quality: 'QUALITÀ',
        qualityDesc: 'Merchandising e drop in edizione limitata',
        events: 'EVENTI',
        eventsDesc: 'Gli eventi più esclusivi a portata di app'
      },
      banner: {
        title: 'THE LOW CULTURE IS HERE.',
        subtitle: 'NON RESTARE A GUARDARE. ENTRA NEL DISTRETTO.',
        applyBtn: 'INVIA SELEZIONE',
        shopBtn: 'ESPLORA LO SHOP'
      }
    },
    shop: { 
      title: 'SHOP ONLINE', 
      subtitle: 'OFFICIAL MERCH', 
      search: 'CERCA NEL DISTRETTO', 
      searchPlaceholder: 'COSA STAI CERCANDO?',
      results: 'RISULTATI RICERCA',
      all: 'TUTTI',
      categories: 'CATEGORIE',
      subcategories: 'SOTTOCATEGORIE',
      filter: 'FILTRA CATEGORIE',
      noProducts: 'NESSUN PRODOTTO TROVATO.',
      noProductsDesc: 'PROVA CON TERMINI DIVERSI O ESPLORA LE CATEGORIE.',
      showAll: 'MOSTRA TUTTI I PRODOTTI',
      backToShop: 'TORNA ALLO SHOP',
      sale: 'SALE',
      addToCart: 'AGGIUNGI AL CARRELLO',
      outOfStock: 'ESAURITO',
      selectSize: 'SELEZIONA TAGLIA',
      quantity: 'QUANTITÀ',
      cart: {
        title: 'IL TUO CARRELLO',
        empty: 'IL CARRELLO È VUOTO',
        subtotal: 'TOTALE PARZIALE',
        checkout: 'VAI AL CHECKOUT'
      }
    },
    checkout: {
      title: 'CHECKOUT',
      backToCart: 'TORNA AL CARRELLO',
      shippingData: 'DATI DI SPEDIZIONE',
      orderSummary: 'RIEPILOGO ORDINE',
      firstName: 'NOME',
      lastName: 'COGNOME',
      email: 'EMAIL',
      phone: 'TELEFONO',
      address: 'INDIRIZZO',
      city: 'CITTÀ',
      postcode: 'CAP',
      total: 'TOTALE',
      confirm: 'CONFERMA ORDINE',
      syncing: 'SINCRONIZZAZIONE TARIFFE...',
      success: {
        title: 'ORDINE RICEVUTO',
        desc: 'IL TUO ORDINE È STATO REGISTRATO NEL DISTRICT. RICEVERAI UNA MAIL DI CONFERMA A BREVE.',
        payWhatsApp: 'PAGA SU WHATSAPP',
        backHome: 'TORNA ALLA HOME'
      }
    },
    feed: {
      title: 'BACHECA',
      subtitle: 'DISTRICT FEED',
      noPosts: 'NESSUN POST PRESENTE',
      noPostsDesc: 'INAUGURA LA BACHECA CON IL TUO PRIMO POST!',
      private: 'COMMUNITY PRIVATA',
      privateDesc: 'ACCEDI PER PARTECIPARE ALLE DISCUSSIONI DEL DISTRETTO.',
      syncing: 'SINCRONIZZAZIONE...',
      newPost: 'NUOVO POST',
      placeholder: 'COSA SUCCEDE NEL DISTRETTO?',
      publish: 'PUBBLICA',
      edit: 'MODIFICA POST',
      save: 'SALVA MODIFICHE',
      delete: 'ELIMINA',
      like: 'LIKE',
      comment: 'COMMENTA',
      share: 'CONDIVIDI',
      reply: 'RISPONDI',
      cancel: 'ANNULLA'
    },
    events: {
      title: 'EVENTI',
      subtitle: 'DISTRICT CALENDAR',
      apply: 'INVIA SELEZIONE',
      statusOpen: 'ISCRIZIONI APERTE',
      statusClosed: 'ISCRIZIONI CHIUSE',
      statusSoon: 'IN ARRIVO',
      location: 'LUOGO',
      date: 'DATA',
      viewEvent: 'VISUALIZZA EVENTO',
      manage: 'GESTISCI',
      details: 'DETTAGLI EVENTO',
      program: 'PROGRAMMA',
      description: 'DESCRIZIONE',
      applyNow: 'INVIA SELEZIONE ORA',
      form: {
        name: 'NOME E COGNOME',
        email: 'EMAIL',
        phone: 'TELEFONO',
        city: 'CITTÀ',
        instagram: 'INSTAGRAM',
        selectVehicle: 'SELEZIONA VEICOLO DAL GARAGE',
        interiorPhotos: 'FOTO INTERNI (MINIMO 3)',
        uploadPhotos: 'CARICA FOTO INTERNI',
        submit: 'INVIA CANDIDATURA'
      },
      manageApp: {
        status: 'STATO',
        pending: 'IN ATTESA',
        approved: 'APPROVATA',
        rejected: 'NEGATA',
        vehicle: 'VEICOLO CANDIDATO',
        notes: 'NOTE CANDIDATURA',
        pendingNote: 'LA TUA CANDIDATURA È IN FASE DI REVISIONE DALLO STAFF.',
        approvedNote: 'CONGRATULAZIONI! IL TUO PROGETTO È STATO SELEZIONATO.',
        rejectedNote: 'PURTROPPO IL TUO PROGETTO NON È STATO SELEZIONATO.',
        cancel: 'ANNULLA CANDIDATURA',
        remove: 'RIMUOVI E RIPROVA'
      }
    },
    profile: { 
      posts: 'POST', 
      followers: 'FOLLOWER', 
      following: 'SEGUITI', 
      activeCar: 'PROGETTO ATTIVO', 
      myPosts: 'POST', 
      noPosts: 'NON HAI ANCORA PUBBLICATO NULLA.',
      orders: 'ORDINI',
      noOrders: 'NESSUN ORDINE TROVATO.',
      selections: 'SELEZIONI',
      noSelections: 'NON HAI ANCORA INVIATO SELEZIONI.',
      info: 'INFO',
      settings: 'IMPOSTAZIONI',
      editProfile: 'MODIFICA PROFILO',
      shareProfile: 'CONDIVIDI QUESTO PROFILO',
      changeCover: 'CAMBIA COPERTINA',
      changeAvatar: 'CAMBIA AVATAR',
      bio: 'BIOGRAFIA',
      socials: 'SOCIAL & LINK',
      visit: 'VISITA',
      usernameNoticeTitle: 'CAMBIO USERNAME',
      usernameNoticeDesc: 'PER GARANTIRE L\'INTEGRITÀ DEL DISTRETTO, IL CAMBIO USERNAME DEVE ESSERE APPROVATO MANUALMENTE. CONTATTA L\'AMMINISTRAZIONE INDICANDO IL NUOVO USERNAME DESIDERATO.',
      contactAdmin: 'CONTATTA STAFF',
      roles: {
        admin: 'ADMIN',
        staff: 'MEMBRO DELLO STAFF',
        support: 'SUPPORTO STAFF',
        member: 'MEMBRO UFFICIALE',
        subscriber: 'ISCRITTO',
        subscriber_plus: 'ISCRITTO+'
      }
    },
    messages: {
      title: 'MESSAGGI',
      subtitle: 'DIRECT',
      noConvs: 'NESSUNA CONVERSAZIONE ATTIVA.',
      newMessage: 'NUOVO MESSAGGIO',
      search: 'CERCA USERNAME...',
      found: 'MEMBRI TROVATI',
      startChat: 'INIZIA LA CONVERSAZIONE',
      online: 'ONLINE',
      deleteConv: 'ELIMINA CONVERSAZIONE?',
      deleteConvDesc: 'QUESTA AZIONE ELIMINERÀ TUTTI I MESSAGGI.',
      deleteMsg: 'ELIMINA MESSAGGIO?'
    },
    settings: { 
      title: 'IMPOSTAZIONI', 
      language: 'LINGUA APPLICAZIONE', 
      notifications: 'NOTIFICHE PUSH', 
      emailNotifications: 'NOTIFICHE EMAIL',
      account: 'ACCOUNT E SICUREZZA', 
      logout: 'ESCI', 
      privacy: 'PRIVACY PROFILO',
      support: 'CENTRO ASSISTENZA',
      deleteAccount: 'ELIMINA ACCOUNT'
    },
    garage: { 
      title: 'GARAGE', 
      publicTitle: 'GARAGE',
      subtitle: 'I TUOI PROGETTI STANCE', 
      empty: 'NESSUN VEICOLO NEL GARAGE', 
      addBtn: 'AGGIUNGI', 
      active: 'PRINCIPALE', 
      brand: 'MARCA',
      model: 'MODELLO',
      year: 'ANNO',
      suspension: 'ASSETTO',
      licensePlate: 'TARGA',
      description: 'DESCRIZIONE PROGETTO',
      photos: 'VEHICLE PHOTOS',
      save: 'SALVA VEICOLO',
      update: 'AGGIORNA VEICOLO'
    },
    auth: {
      title: 'AREA RISERVATA',
      subtitle: 'ACCEDI CON LE TUE CREDENZIALI LOW DISTRETTO',
      username: 'USERNAME',
      password: 'PASSWORD',
      forgot: 'SMARRITA?',
      login: 'ACCEDI ORA',
      notMember: 'NON SEI ANCORA UN MEMBRO?',
      register: 'REGISTRATI SUL SITO UFFICIALE'
    },
    errors: {
      connection: 'ERRORE DI CONNESSIONE AL SERVER',
      retry: 'RIPROVA ORA',
      noData: 'NESSUN DATO TROVATO',
      authRequired: 'ACCESSO RISERVATO AI MEMBRI'
    }
  },
  en: {
    nav: { 
      home: 'HOME', 
      shop: 'SHOP', 
      events: 'EVENTS', 
      garage: 'GARAGE', 
      profile: 'PROFILE', 
      settings: 'SETTINGS',
      feed: 'FEED',
      messages: 'MESSAGES'
    },
    hero: { 
      subtitle: 'CARS - CULTURE - LIFESTYLE', 
      title: 'LOW DISTRICT', 
      desc: "MORE THAN A PASSION, A LIFESTYLE.", 
      shopBtn: 'SHOP NOW', 
      eventsBtn: 'DISCOVER EVENTS',
      scroll: 'SCROLL'
    },
    home: {
      newDrops: 'NEW DROPS',
      officialGear: 'OFFICIAL MERCH',
      viewAll: 'VIEW ALL',
      communityActivity: 'COMMUNITY ACTIVITY',
      districtLive: 'DISTRICT FEED',
      districtMeet: 'DISTRICT MEET',
      upcomingMeets: 'COMMUNITY GATHERINGS',
      enterFeed: 'ENTER FEED',
      values: {
        community: 'COMMUNITY',
        communityDesc: 'Thousands of enthusiasts united by the same passion.',
        quality: 'QUALITY',
        qualityDesc: 'Merchandise and limited edition drops.',
        events: 'EVENTS',
        eventsDesc: 'The most exclusive events at your fingertips.'
      },
      banner: {
        title: 'THE LOW CULTURE IS HERE.',
        subtitle: 'DON\'T JUST WATCH. JOIN THE DISTRICT.',
        applyBtn: 'SUBMIT SELECTION',
        shopBtn: 'EXPLORE SHOP'
      }
    },
    shop: { 
      title: 'SHOP ONLINE', 
      subtitle: 'OFFICIAL MERCH', 
      search: 'SEARCH DISTRICT', 
      searchPlaceholder: 'WHAT ARE YOU LOOKING FOR?',
      results: 'SEARCH RESULTS',
      all: 'ALL',
      categories: 'CATEGORIES',
      subcategories: 'SUBCATEGORIES',
      filter: 'FILTER CATEGORIES',
      noProducts: 'NO PRODUCTS FOUND.',
      noProductsDesc: 'TRY DIFFERENT TERMS OR EXPLORE CATEGORIES.',
      showAll: 'SHOW ALL PRODUCTS',
      backToShop: 'BACK TO SHOP',
      sale: 'OFFERTA',
      addToCart: 'ADD TO CART',
      outOfStock: 'OUT OF STOCK',
      selectSize: 'SELECT SIZE',
      quantity: 'QUANTITY',
      cart: {
        title: 'YOUR CART',
        empty: 'YOUR CART IS EMPTY',
        subtotal: 'SUBTOTAL',
        checkout: 'CHECKOUT'
      }
    },
    checkout: {
      title: 'CHECKOUT',
      backToCart: 'BACK TO CART',
      shippingData: 'SHIPPING DATA',
      orderSummary: 'ORDER SUMMARY',
      firstName: 'FIRST NAME',
      lastName: 'LAST NAME',
      email: 'EMAIL',
      phone: 'PHONE',
      address: 'ADDRESS',
      city: 'CITY',
      postcode: 'POSTCODE',
      total: 'TOTAL',
      confirm: 'CONFIRM ORDER',
      syncing: 'SYNCING RATES...',
      success: {
        title: 'ORDER RECEIVED',
        desc: 'YOUR ORDER HAS BEEN REGISTERED. YOU WILL RECEIVE A CONFIRMATION EMAIL SHORTLY.',
        payWhatsApp: 'PAY ON WHATSAPP',
        backHome: 'BACK TO HOME'
      }
    },
    feed: {
      title: 'FEED',
      subtitle: 'DISTRICT FEED',
      noPosts: 'NO POSTS YET',
      noPostsDesc: 'BE THE FIRST TO POST IN THE DISTRICT!',
      private: 'PRIVATE COMMUNITY',
      privateDesc: 'LOGIN TO JOIN DISTRICT DISCUSSIONS.',
      syncing: 'SYNCING DISTRICT...',
      newPost: 'NEW POST',
      placeholder: 'WHAT\'S HAPPENING IN THE DISTRICT?',
      publish: 'PUBLISH',
      edit: 'EDIT POST',
      save: 'SAVE CHANGES',
      delete: 'DELETE',
      like: 'LIKE',
      comment: 'COMMENT',
      share: 'SHARE',
      reply: 'REPLY',
      cancel: 'CANCEL'
    },
    events: {
      title: 'EVENTS',
      subtitle: 'DISTRICT CALENDAR',
      apply: 'SUBMIT SELECTION',
      statusOpen: 'REGISTRATION OPEN',
      statusClosed: 'REGISTRATION CLOSED',
      statusSoon: 'COMING SOON',
      location: 'LOCATION',
      date: 'EVENT DATE',
      viewEvent: 'VIEW EVENT',
      manage: 'MANAGE',
      details: 'EVENT DETAILS',
      program: 'PROGRAM',
      description: 'DESCRIPTION',
      applyNow: 'SUBMIT SELECTION NOW',
      form: {
        name: 'FULL NAME',
        email: 'EMAIL',
        phone: 'PHONE',
        city: 'CITY',
        instagram: 'INSTAGRAM',
        selectVehicle: 'SELECT VEHICLE FROM GARAGE',
        interiorPhotos: 'INTERIOR PHOTOS (MIN 3)',
        uploadPhotos: 'UPLOAD INTERIOR PHOTOS',
        submit: 'SUBMIT APPLICATION'
      },
      manageApp: {
        status: 'STATUS',
        pending: 'PENDING',
        approved: 'APPROVED',
        rejected: 'REJECTED',
        vehicle: 'APPLIED VEHICLE',
        notes: 'APPLICATION NOTES',
        pendingNote: 'YOUR APPLICATION IS BEING REVIEWED BY THE STAFF.',
        approvedNote: 'CONGRATULATIONS! YOUR PROJECT HAS BEEN SELECTED.',
        rejectedNote: 'UNFORTUNATELY, YOUR PROJECT WAS NOT SELECTED.',
        cancel: 'CANCEL APPLICATION',
        remove: 'REMOVE AND RETRY'
      }
    },
    profile: { 
      posts: 'POSTS', 
      followers: 'FOLLOWERS', 
      following: 'FOLLOWING', 
      activeCar: 'ACTIVE PROJECT', 
      myPosts: 'MY POSTS', 
      noPosts: 'YOU HAVEN\'T POSTED ANYTHING YET.',
      orders: 'MY ORDERS',
      noOrders: 'NO ORDERS FOUND.',
      selections: 'MY SELECTIONS',
      noSelections: 'NO APPLICATIONS SENT YET.',
      info: 'INFORMATION',
      settings: 'SET',
      editProfile: 'EDIT PROFILE',
      shareProfile: 'SHARE THIS PROFILE',
      changeCover: 'CHANGE COVER',
      changeAvatar: 'CHANGE AVATAR',
      bio: 'BIO',
      socials: 'SOCIAL & LINKS',
      visit: 'VISITA',
      usernameNoticeTitle: 'USERNAME CHANGE',
      usernameNoticeDesc: 'TO ENSURE DISTRICT INTEGRITY, USERNAME CHANGES MUST BE MANUALLY APPROVED. CONTACT ADMINISTRATION WITH YOUR DESIRED NEW NAME.',
      contactAdmin: 'CONTACT STAFF',
      roles: {
        admin: 'ADMIN',
        staff: 'STAFF MEMBER',
        support: 'STAFF SUPPORT',
        member: 'OFFICIAL MEMBER',
        subscriber: 'SUBSCRIBER',
        subscriber_plus: 'SUBSCRIBER+'
      }
    },
    messages: {
      title: 'MESSAGES',
      subtitle: 'DIRECT',
      noConvs: 'NO ACTIVE CONVERSATIONS.',
      newMessage: 'NEW MESSAGE',
      search: 'SEARCH USERNAME...',
      found: 'MEMBERS FOUND',
      startChat: 'START CONVERSATION',
      online: 'ONLINE',
      deleteConv: 'DELETE CONVERSATION?',
      deleteConvDesc: 'THIS ACTION WILL DELETE ALL MESSAGES.',
      deleteMsg: 'DELETE MESSAGE?'
    },
    settings: { 
      title: 'SETTINGS', 
      language: 'APP LANGUAGE', 
      notifications: 'PUSH NOTIFICATIONS', 
      emailNotifications: 'EMAIL NOTIFICATIONS',
      account: 'ACCOUNT & SECURITY', 
      logout: 'LOGOUT', 
      privacy: 'PROFILE PRIVACY',
      support: 'HELP CENTER',
      deleteAccount: 'DELETE ACCOUNT'
    },
    garage: { 
      title: 'MY GARAGE', 
      publicTitle: 'GARAGE',
      subtitle: 'YOUR STANCE PROJECTS', 
      empty: 'YOUR GARAGE IS EMPTY', 
      addBtn: 'ADD', 
      active: 'MAIN', 
      brand: 'BRAND',
      model: 'MODEL',
      year: 'YEAR',
      suspension: 'SUSPENSION',
      licensePlate: 'PLATE',
      description: 'PROJECT DESCRIPTION',
      photos: 'VEHICLE PHOTOS',
      save: 'SAVE VEHICLE',
      update: 'UPDATE VEHICLE'
    },
    auth: {
      title: 'PRIVATE AREA',
      subtitle: 'LOGIN WITH YOUR LOW DISTRICT CREDENTIALS',
      username: 'USERNAME',
      password: 'PASSWORD',
      forgot: 'FORGOT?',
      login: 'LOGIN NOW',
      notMember: 'NOT A MEMBER YET?',
      register: 'REGISTER ON OFFICIAL SITE'
    },
    errors: {
      connection: 'SERVER CONNECTION ERROR',
      retry: 'RETRY NOW',
      noData: 'NO DATA FOUND',
      authRequired: 'MEMBERS ONLY ACCESS'
    }
  }
};

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
} | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('app-lang') : 'it';
    return (saved === 'en' || saved === 'it' ? saved : 'it') as Language;
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