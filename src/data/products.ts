export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  collection?: string;
  image: string;
  description: string;
  sizes?: string[];
  stock: number;
  isNew?: boolean;
  isLimited?: boolean;
}

export const products: Product[] = [
  // COLLEZIONE SIGNED 2026
  {
    id: 15941,
    name: "MAN SWIM TRUNKS SIGNED",
    price: "€40.00",
    category: "Summer Kit",
    collection: "Signed 2026",
    image: "https://www.lowdistrict.it/wp-content/uploads/all-over-print-recycled-swim-trunks-white-front-69af21ce1ca6b.jpg",
    description: "Costume da bagno ad asciugatura rapida con protezione solare UPF 50+. Collezione Signed 2026.",
    stock: 15,
    isNew: true
  },
  {
    id: 17001,
    name: "T-SHIRT OVERSIZE SIGNED",
    price: "€40.00",
    category: "Abbigliamento",
    collection: "Signed 2026",
    image: "https://www.lowdistrict.it/wp-content/uploads/tshirt-over-grigio.png",
    description: "T-shirt oversize con grafica esclusiva Signed 2026.",
    sizes: ["S", "M", "L", "XL"],
    stock: 20,
    isLimited: true
  },

  // COLLEZIONE NEW LOGO 2026
  {
    id: 16108,
    name: "COLLANA ACCIAIO NEW LOGO",
    price: "€15.00",
    category: "Accessori",
    collection: "New Logo 2026",
    image: "https://www.lowdistrict.it/wp-content/uploads/img_9901.png",
    description: "Collana in acciaio inossidabile con il nuovo logo Low District.",
    stock: 50
  },
  {
    id: 11171,
    name: "HOODIE NEW LOGO 2026",
    price: "€75.00",
    category: "Abbigliamento",
    collection: "New Logo 2026",
    image: "https://www.lowdistrict.it/wp-content/uploads/unisex-heavy-blend-hoodie-black-front-680d3b04b9913.jpg",
    description: "Felpa premium con il nuovo logo ricamato.",
    sizes: ["S", "M", "L", "XL"],
    stock: 12,
    isNew: true
  },

  // COLLEZIONE LOOSE LOGO
  {
    id: 14001,
    name: "LOOSE LOGO HOLOGRAPHIC",
    price: "€12.00",
    category: "Adesivi",
    collection: "Loose Logo",
    image: "https://www.lowdistrict.it/wp-content/uploads/new4.png",
    description: "Adesivo olografico serie Loose Logo.",
    stock: 100
  },

  // COLLEZIONE OFFICIAL 2025
  {
    id: 10675,
    name: "EXTREME STICKER 2025",
    price: "€30.00",
    category: "Adesivi",
    collection: "Official 2025",
    image: "https://www.lowdistrict.it/wp-content/uploads/new4.png",
    description: "Grafica Anteriore Extreme per esposizione.",
    stock: 10,
    isNew: true
  },
  {
    id: 10758,
    name: "WINDSHIELD STICKER 2025",
    price: "€15.00",
    category: "Adesivi",
    collection: "Official 2025",
    image: "https://www.lowdistrict.it/wp-content/uploads/new6.png",
    description: "Grafica ufficiale parabrezza 2025.",
    stock: 20
  },

  // DETAILING / CAR CARE
  {
    id: 10848,
    name: "NEW QUICK DETAILER",
    price: "€15.00",
    category: "Detailing",
    image: "https://www.lowdistrict.it/wp-content/uploads/quickdetailer.png",
    description: "Quick Detailer idrofobico a base di Sio2.",
    stock: 25
  },
  {
    id: 10853,
    name: "IRON REMOVER",
    price: "€15.00",
    category: "Detailing",
    image: "https://www.lowdistrict.it/wp-content/uploads/iron.png",
    description: "Decontaminante ferroso a pH neutro.",
    stock: 30
  },

  // ACCESSORI STANDARD
  {
    id: 10824,
    name: "PORTA TARGA MAGNETICO",
    price: "€40.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/IMG_6883.png",
    description: "Portatarga Magnetico Universale.",
    stock: 15
  },
  {
    id: 11693,
    name: "PORTACHIAVI LOGO 3D",
    price: "€6.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/IMG_4229-removebg-preview.png",
    description: "Portachiavi in materiale morbido.",
    stock: 100
  }
];