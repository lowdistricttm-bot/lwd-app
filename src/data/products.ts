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
    id: 10675,
    name: "EXTREME STICKER 2025",
    price: "€30.00",
    category: "Adesivi",
    image: "https://www.lowdistrict.it/wp-content/uploads/new4.png",
    description: "Grafica Anteriore Extreme per esposizione. Adesivi in PVC con pellicola Wrapping. Disponibile in varie misure e colorazioni.",
    stock: 10,
    isNew: true
  },
  {
    id: 10758,
    name: "WINDSHIELD STICKER 2025",
    price: "€15.00",
    category: "Adesivi",
    image: "https://www.lowdistrict.it/wp-content/uploads/new6.png",
    description: "Grafica Anteriore + Posteriore ufficiale Low District. Adesivi in PVC di alta qualità.",
    stock: 20,
    isNew: true
  },
  {
    id: 10824,
    name: "PORTA TARGA MAGNETICO",
    price: "€40.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/IMG_6883.png",
    description: "Portatarga Magnetico Universale con magneti al Neodimio. Rimozione facile e sicura per raduni e shooting.",
    stock: 15
  },
  {
    id: 10848,
    name: "NEW QUICK DETAILER 2025",
    price: "€15.00",
    category: "Detailing",
    image: "https://www.lowdistrict.it/wp-content/uploads/quickdetailer.png",
    description: "Quick Detailer idrofobico a base di Sio2. Dona un boost istantaneo di lucentezza e protezione candy-caramellata.",
    stock: 25
  },
  {
    id: 10853,
    name: "IRON REMOVER",
    price: "€15.00",
    category: "Detailing",
    image: "https://www.lowdistrict.it/wp-content/uploads/iron.png",
    description: "Decontaminante ferroso a pH neutro. Rimuove efficacemente il ferodo dai cerchi reagendo con un colore rosso intenso.",
    stock: 30
  },
  {
    id: 11133,
    name: "T-SHIRT OVERSIZE 2025",
    price: "€25.00",
    category: "Abbigliamento",
    image: "https://www.lowdistrict.it/wp-content/uploads/tshirt-over-grigio.png",
    description: "T-shirt 100% cotone con ricamo anteriore e stampa DTG posteriore. Vestibilità streetwear oversize.",
    sizes: ["S", "M", "L", "XL"],
    stock: 40,
    isNew: true
  },
  {
    id: 11171,
    name: "HOODIE OVERSIZE 2025",
    price: "€50.00",
    category: "Abbigliamento",
    image: "https://www.lowdistrict.it/wp-content/uploads/unisex-heavy-blend-hoodie-black-front-680d3b04b9913.jpg",
    description: "Felpa calda e resistente con ricamo anteriore e stampa DTG posteriore. Cappuccio doppio strato.",
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    isNew: true
  },
  {
    id: 11693,
    name: "PORTACHIAVI LOGO 3D",
    price: "€6.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/IMG_4229-removebg-preview.png",
    description: "Nuovo design in materiale morbido e pieghevole. Resistente al calore e di alta qualità.",
    stock: 100
  },
  {
    id: 13182,
    name: "BACKPACK 2025",
    price: "€48.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/all-over-print-backpack-white-right-688a69ed26879.jpg",
    description: "Zaino capiente con scomparto laptop e materiale resistente all'acqua. Design ufficiale Low District.",
    stock: 12
  },
  {
    id: 13221,
    name: "SNEAKERS UNISEX 2025",
    price: "€55.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/mens-high-top-canvas-shoes-black-left-688a75d57ef8e.jpg",
    description: "Sneakers in tela realizzate a mano con suola in gomma EVA e fodera traspirante.",
    stock: 8,
    isLimited: true
  },
  {
    id: 15941,
    name: "MAN SWIM TRUNKS SIGNED",
    price: "€40.00",
    category: "Summer Kit",
    image: "https://www.lowdistrict.it/wp-content/uploads/all-over-print-recycled-swim-trunks-white-front-69af21ce1ca6b.jpg",
    description: "Costume da bagno ad asciugatura rapida con protezione solare UPF 50+. Collezione Signed 2026.",
    stock: 15,
    isNew: true
  },
  {
    id: 16108,
    name: "COLLANA ACCIAIO NEW LOGO",
    price: "€15.00",
    category: "Accessori",
    image: "https://www.lowdistrict.it/wp-content/uploads/img_9901.png",
    description: "Collana in acciaio inossidabile con il nuovo logo Low District. Finitura che non sbiadisce.",
    stock: 50
  }
];