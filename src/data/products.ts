export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
  sizes?: string[];
  stock: number;
  isNew?: boolean;
  isLimited?: boolean;
}

export const products: Product[] = [
  // STICKERS
  {
    id: 1,
    name: "Windshield JP Sticker 2025",
    price: "€25.00",
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800",
    description: "Adesivo per parabrezza in stile giapponese. Vinile di alta qualità resistente alle intemperie e ai lavaggi ad alta pressione.",
    stock: 50,
    isNew: true
  },
  {
    id: 2,
    name: "Official New Logo Sticker",
    price: "€8.00",
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800",
    description: "L'adesivo ufficiale con il nuovo logo Low District. Perfetto per ogni superficie.",
    stock: 200,
    isNew: true
  },
  {
    id: 3,
    name: "Holographic New Logo Sticker",
    price: "€12.00",
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800",
    description: "Versione olografica del nuovo logo. Riflette la luce con un effetto arcobaleno unico.",
    stock: 75,
    isLimited: true
  },

  // CAR CARE
  {
    id: 4,
    name: "Quick Detailer",
    price: "€18.50",
    category: "Car Care",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800",
    description: "Pulitore rapido per carrozzeria. Rimuove polvere e impronte donando una lucentezza istantanea e protezione idrofobica.",
    stock: 30
  },
  {
    id: 5,
    name: "Iron Remover",
    price: "€22.00",
    category: "Car Care",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800",
    description: "Decontaminante ferroso per cerchi e carrozzeria. Reagisce con le particelle di ferro diventando viola.",
    stock: 25
  },
  {
    id: 6,
    name: "Drying Towel XXL",
    price: "€28.00",
    category: "Car Care",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    description: "Panno in microfibra ultra-assorbente di grandi dimensioni. Asciuga l'intera auto senza lasciare aloni.",
    stock: 15
  },

  // APPAREL
  {
    id: 7,
    name: "Hoodie Oversize New Logo 2026",
    price: "€75.00",
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    description: "Felpa oversize della nuova collezione 2026. Cotone 400gsm, ricamo premium e vestibilità moderna.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 20,
    isNew: true
  },
  {
    id: 8,
    name: "T-Shirt Oversize Signed 2026",
    price: "€40.00",
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    description: "T-shirt in edizione limitata con firma serigrafata. Parte della collezione esclusiva Signed.",
    sizes: ["S", "M", "L", "XL"],
    stock: 35,
    isLimited: true
  },

  // ACCESSORIES
  {
    id: 9,
    name: "Portachiavi Static 3D 2025",
    price: "€15.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    description: "Portachiavi in gomma 3D con scritta 'STATIC'. Resistente e flessibile.",
    stock: 100
  },
  {
    id: 10,
    name: "New Logo Tsurikawa Limited",
    price: "€35.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
    description: "Tsurikawa tradizionale giapponese con il nuovo logo Low District. Edizione limitata per interni JDM.",
    stock: 10,
    isLimited: true
  },

  // LIFESTYLE
  {
    id: 11,
    name: "JP Car Freshener",
    price: "€6.00",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
    description: "Profumatore per auto con design giapponese. Fragranza 'New Car' a lunga durata.",
    stock: 150
  },
  {
    id: 12,
    name: "Backpack 2025",
    price: "€55.00",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=800",
    description: "Zaino tecnico con scomparto laptop e dettagli riflettenti. Perfetto per i viaggi e i raduni.",
    stock: 20
  }
];