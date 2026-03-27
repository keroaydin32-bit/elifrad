// Mock data for Electrive e-commerce store

export const categories = [
  { id: 1, name: 'Startseite', icon: '🏠', path: '/' },
  { id: 2, name: 'Kleidung', icon: '👕', path: '/kleidung', hasSubmenu: true },
  { id: 3, name: 'Herren', icon: '👔', path: '/herren', hasSubmenu: true },
  { id: 4, name: 'Wohnaccessoires', icon: '🏠', path: '/wohnaccessoires', hasSubmenu: true },
  { id: 5, name: 'Damen', icon: '👗', path: '/damen' }, // Changed from Integer Sit Amet to Damen as it was missing in list but used in logic? Or just replace "Integer Sit Amet" with something useful.
  { id: 6, name: 'Schreibwaren', icon: '✏️', path: '/schreibwaren' },
  { id: 7, name: 'Kontakt', icon: '📞', path: '/contact' },
  { id: 8, name: 'Kunst', icon: '🎨', path: '/kunst' }, // Nunc Commodo -> Kunst
  { id: 9, name: 'Sport & Fitness', icon: '🏋️', path: '/sport-fitness' },
];

export const products = [
  {
    id: 1,
    name: 'T-Shirt mit Kolibri-Aufdruck',
    price: 23.90,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Bequemes Baumwoll-T-Shirt mit einzigartigem Kolibri-Aufdruck',
    category: 'Herren'
  },
  {
    id: 2,
    name: 'Pullover mit Kolibri-Aufdruck',
    price: 35.90,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Gemütlicher Pullover, perfekt für jede Jahreszeit',
    category: 'Damen'
  },
  {
    id: 3,
    name: "Gerahmtes Poster 'Das Beste kommt noch'",
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1582561833896-f85bd36e1ced?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Inspirierendes gerahmtes Poster für Ihr Zuhause',
    category: 'Kunst'
  },
  {
    id: 4,
    name: "Gerahmtes Poster 'Das Abenteuer beginnt'",
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1557672199-6ba87c7e3f9d?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Wanddekoration mit Abenteuer-Thema',
    category: 'Kunst'
  },
  {
    id: 5,
    name: "Gerahmtes Poster 'Heute ist ein guter Tag'",
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Positive Vibes für Ihren Wohnbereich',
    category: 'Kunst'
  },
  {
    id: 6,
    name: "Tasse 'Das Beste kommt noch'",
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Keramiktasse mit inspirierendem Zitat',
    category: 'Wohnaccessoires'
  },
  {
    id: 7,
    name: "Tasse 'Das Abenteuer beginnt'",
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    badge: 'Sonderpreis!',
    badgeType: 'sale',
    description: 'Perfektes Geschenk für Abenteurer',
    category: 'Wohnaccessoires'
  },
  {
    id: 8,
    name: "Tasse 'Heute ist ein guter Tag'",
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1572359165969-2f17c97a265c?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1565878423415-e09b0c6d0f67?w=400&h=400&fit=crop',
    badge: 'Sonderpreis!',
    badgeType: 'sale',
    description: 'Starten Sie Ihren Tag mit Positivität',
    category: 'Wohnaccessoires'
  },
  {
    id: 9,
    name: 'Kissen mit Waldfuchs',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    badge: 'Sonderpreis!',
    badgeType: 'sale',
    description: 'Dekoratives Kissen mit Fuchs-Design',
    category: 'Wohnaccessoires'
  },
  {
    id: 10,
    name: 'Kissen mit Braunbär',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1566855849935-c98a60d5f144?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1610444714369-f90d6cca3ade?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Weiches Kissen mit Bärenaufdruck',
    category: 'Accessoires'
  },
  {
    id: 11,
    name: 'Kissen mit Kolibri',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1578898886225-ac9b91165255?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1616627547584-bf28cebf8b6e?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Elegantes Kissen mit Kolibri-Design',
    category: 'Wohnaccessoires'
  },
  {
    id: 12,
    name: 'Waldfuchs - Vektorgrafik',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Digitaler Vektorkunst-Download',
    category: 'Kunst'
  },
  {
    id: 13,
    name: 'Braunbär - Vektorgrafik',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1618005198920-f0cb6201c115?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Druckbare Bären-Vektorgrafiken',
    category: 'Kunst'
  },
  {
    id: 14,
    name: 'Kolibri - Vektorgrafik',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Hochwertige Vogel-Vektorkunst',
    category: 'Kunst'
  },
  {
    id: 15,
    name: 'Paket Tasse + Gerahmtes Poster',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=400&h=400&fit=crop',
    badge: 'Artikelbündel',
    badgeType: 'bundle',
    description: 'Komplettes Heimdekorations-Paket',
    category: 'Wohnaccessoires'
  }
];

export const sliderImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&h=600&fit=crop',
    title: 'Neuheiten',
    subtitle: 'Frühling - Sommer 2024',
    description: 'Entdecken Sie unsere Fahrrad-Kollektion und limitierte Angebote im großen Saison-Sale.',
    buttonText: 'Jetzt Kaufen'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1200&h=600&fit=crop',
    title: 'Neuheiten',
    subtitle: 'Frühling - Sommer 2024',
    description: 'Entdecken Sie unsere Fahrrad-Kollektion und limitierte Angebote im großen Saison-Sale.',
    buttonText: 'Jetzt Kaufen'
  },
  {
    id: 3,
    image: 'https://www.elifrad.de/images/bosch-ebike-expert-sauer.jpeg',
    title: 'Bosch eBike Expert',
    subtitle: 'Qualität & Vertrauen',
    description: 'Als zertifizierter Bosch eBike Expert bieten wir Ihnen erstklassigen Service und Originalteile.',
    buttonText: 'Mehr Erfahren'
  }
];

export const services = [
  {
    id: 1,
    icon: 'Headphones',
    title: '24/7 Support',
    description: 'Rund um die Uhr Hilfe'
  },
  {
    id: 2,
    icon: 'Shield',
    title: 'Geld-Zurück-Garantie',
    description: '100% Sicher Bezahlen'
  },
  {
    id: 3,
    icon: 'Gift',
    title: 'Geschenkgutscheine',
    description: 'Das perfekte Geschenk'
  },
  {
    id: 4,
    icon: 'Truck',
    title: 'Kostenloser Versand',
    description: 'Ab ... € Bestellwert'
  }

];

export const blogPosts = [
  {
    id: 1,
    title: 'E-Bike Wartungstipps für den Frühling',
    date: '11. Dez 2024',
    author: 'Electrive Team',
    excerpt: 'Bereiten Sie Ihr eBike für die Saison vor. Von der Akkupflege bis zur Kettenschmierung – hier sind unsere Experten-Tipps...',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Die besten Radwege in deiner Region',
    date: '08. Dez 2024',
    author: 'Maria Müller',
    excerpt: 'Entdecken Sie die schönsten Routen für Ihre nächste Fahrradtour. Wir haben die Highlights der Saison für Sie zusammengestellt...',
    image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Warum ein Bosch eBike System wählen?',
    date: '05. Dez 2024',
    author: 'Lukas Schmidt',
    excerpt: 'Erfahren Sie alles über die Vorteile der Bosch Antriebssysteme. Zuverlässigkeit, Leistung und innovative Technologie im Fokus...',
    image: 'https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Sicherheit im Straßenverkehr',
    date: '01. Dez 2024',
    author: 'Sophie Weber',
    excerpt: 'Der ultimative Guide für sicheres Radfahren in der Stadt. Vom richtigen Helm bis zur optimalen Beleuchtung...',
    image: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=400&h=300&fit=crop'
  }
];

export const brands = [
  { id: 1, name: 'Brand 1', logo: 'https://via.placeholder.com/150x80?text=Brand+1' },
  { id: 2, name: 'Brand 2', logo: 'https://via.placeholder.com/150x80?text=Brand+2' },
  { id: 3, name: 'Brand 3', logo: 'https://via.placeholder.com/150x80?text=Brand+3' },
  { id: 4, name: 'Brand 4', logo: 'https://via.placeholder.com/150x80?text=Brand+4' },
  { id: 5, name: 'Brand 5', logo: 'https://via.placeholder.com/150x80?text=Brand+5' },
  { id: 6, name: 'Brand 6', logo: 'https://via.placeholder.com/150x80?text=Brand+6' }
];
