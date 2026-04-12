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

// Questa lista verrà sovrascritta non appena incollerai il contenuto del CSV di WooCommerce
export const products: Product[] = [
  {
    id: 1,
    name: "Windshield JP Sticker 2025",
    price: "€25.00",
    category: "Stickers",
    image: "https://www.lowdistrict.it/wp-content/uploads/placeholder.jpg",
    description: "Adesivo per parabrezza ufficiale Low District collezione 2025.",
    stock: 10,
    isNew: true
  },
  {
    id: 2,
    name: "Porta Targa Universale Magnetico",
    price: "€39.00",
    category: "Accessories",
    image: "https://www.lowdistrict.it/wp-content/uploads/placeholder.jpg",
    description: "Sistema magnetico per targa, ideale per raduni e shooting fotografici.",
    stock: 5
  },
  {
    id: 3,
    name: "Hoodie Oversize Unisex 2025",
    price: "€70.00",
    category: "Apparel",
    image: "https://www.lowdistrict.it/wp-content/uploads/placeholder.jpg",
    description: "Felpa oversize premium con ricamo ufficiale.",
    sizes: ["S", "M", "L", "XL"],
    stock: 15,
    isNew: true
  }
];