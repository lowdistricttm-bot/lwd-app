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
  {
    id: 1,
    name: "LD 'Static' Hoodie - Jet Black",
    price: "€65.00",
    category: "Hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    description: "La nostra felpa più iconica. Realizzata in cotone pesante da 320gsm, con stampa serigrafica 'Static' sul petto e logo Low District sulla manica. Vestibilità boxy per il massimo stile stance.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 15,
    isNew: true
  },
  {
    id: 2,
    name: "Respect the Fitment Tee",
    price: "€35.00",
    category: "T-Shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    description: "T-shirt 100% cotone organico. Grafica dedicata a chi fa del fitment una ragione di vita. Stampa ad alta densità resistente ai lavaggi.",
    sizes: ["S", "M", "L", "XL"],
    stock: 42,
    isNew: true
  },
  {
    id: 3,
    name: "Low District Logo Sticker Pack",
    price: "€15.00",
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800",
    description: "Pack da 5 adesivi in vinile di alta qualità. Resistenti ai raggi UV e agli agenti atmosferici. Perfetti per vetri, carrozzeria o laptop.",
    stock: 100
  },
  {
    id: 4,
    name: "Forged Carbon Keychain",
    price: "€18.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    description: "Portachiavi in vero carbonio forgiato con logo inciso a laser. Leggero, resistente e dal look racing inconfondibile.",
    stock: 8,
    isLimited: true
  },
  {
    id: 5,
    name: "LD Racing Windbreaker",
    price: "€85.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
    description: "Giacca a vento tecnica impermeabile. Ideale per i raduni notturni o le giornate in pista. Dettagli riflettenti per massima visibilità.",
    sizes: ["M", "L", "XL"],
    stock: 12
  },
  {
    id: 6,
    name: "Stance Culture Snapback",
    price: "€30.00",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800",
    description: "Cappellino snapback con ricamo 3D frontale. Chiusura regolabile e visiera piatta. Il tocco finale per il tuo outfit.",
    stock: 25
  },
  {
    id: 7,
    name: "Classic Logo Hoodie - Heather Grey",
    price: "€65.00",
    category: "Hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    description: "Versione grigio melange della nostra felpa classica. Comfort assoluto e stile senza tempo.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 20
  },
  {
    id: 8,
    name: "Low District Banner Sticker",
    price: "€12.00",
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800",
    description: "Adesivo banner per parabrezza. Lunghezza 55cm, vinile bianco opaco. 'Respect the Fitment' in font ufficiale.",
    stock: 50
  }
];