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

// NOTA: Sostituirò questi URL con quelli del tuo sito non appena me li fornirai
export const products: Product[] = [
  {
    id: 1,
    name: "LD 'Static' Hoodie - Jet Black",
    price: "€65.00",
    category: "Hoodies",
    image: "https://www.lowdistrict.it/wp-content/uploads/placeholder-hoodie.jpg", // Qui andrà il tuo link
    description: "La nostra felpa più iconica. Realizzata in cotone pesante da 320gsm, con stampa serigrafica 'Static' sul petto e logo Low District sulla manica.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 15,
    isNew: true
  },
  {
    id: 2,
    name: "Respect the Fitment Tee",
    price: "€35.00",
    category: "T-Shirts",
    image: "https://www.lowdistrict.it/wp-content/uploads/placeholder-tee.jpg", // Qui andrà il tuo link
    description: "T-shirt 100% cotone organico. Grafica dedicata a chi fa del fitment una ragione di vita.",
    sizes: ["S", "M", "L", "XL"],
    stock: 42,
    isNew: true
  },
  {
    id: 3,
    name: "Low District Logo Sticker Pack",
    price: "€15.00",
    category: "Stickers",
    image: "https://www.lowdistrict.it/wp-content/uploads/placeholder-stickers.jpg", // Qui andrà il tuo link
    description: "Pack da 5 adesivi in vinile di alta qualità. Resistenti ai raggi UV e agli agenti atmosferici.",
    stock: 100
  }
];