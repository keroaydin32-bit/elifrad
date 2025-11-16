// Mock data for Electrive e-commerce store

export const categories = [
  { id: 1, name: 'Startseite', icon: '🏠', path: '/' },
  { id: 2, name: 'Clothes', icon: '👕', path: '/clothes', hasSubmenu: true },
  { id: 3, name: 'Men', icon: '👔', path: '/men', hasSubmenu: true },
  { id: 4, name: 'Home Accessories', icon: '🏠', path: '/home-accessories', hasSubmenu: true },
  { id: 5, name: 'Integer Sit Amet', icon: '📱', path: '/integer-sit-amet' },
  { id: 6, name: 'Stationery', icon: '✏️', path: '/stationery' },
  { id: 7, name: 'Kontakt', icon: '📞', path: '/contact' },
  { id: 8, name: 'Nunc Commodo', icon: '🎨', path: '/nunc-commodo' },
  { id: 9, name: 'Exercise Fitness', icon: '🏋️', path: '/exercise-fitness' },
];

export const products = [
  {
    id: 1,
    name: 'Hummingbird printed t-shirt',
    price: 23.90,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Comfortable cotton t-shirt with unique hummingbird print',
    category: 'Men'
  },
  {
    id: 2,
    name: 'Hummingbird printed sweater',
    price: 35.90,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Cozy sweater perfect for any season',
    category: 'Women'
  },
  {
    id: 3,
    name: "The best is yet to come' Framed poster",
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1582561833896-f85bd36e1ced?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Inspirational framed poster for your home',
    category: 'Art'
  },
  {
    id: 4,
    name: 'The adventure begins Framed poster',
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1557672199-6ba87c7e3f9d?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Adventure themed wall decoration',
    category: 'Art'
  },
  {
    id: 5,
    name: 'Today is a good day Framed poster',
    price: 29.00,
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Positive vibes for your living space',
    category: 'Art'
  },
  {
    id: 6,
    name: 'Mug The best is yet to come',
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Ceramic mug with inspiring quote',
    category: 'Home Accessories'
  },
  {
    id: 7,
    name: 'Mug The adventure begins',
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    badge: 'Sonderpreis!',
    badgeType: 'sale',
    description: 'Perfect gift for adventure lovers',
    category: 'Home Accessories'
  },
  {
    id: 8,
    name: 'Mug Today is a good day',
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1572359165969-2f17c97a265c?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1565878423415-e09b0c6d0f67?w=400&h=400&fit=crop',
    badge: 'Sonderpreis!',
    badgeType: 'sale',
    description: 'Start your day with positivity',
    category: 'Home Accessories'
  },
  {
    id: 9,
    name: 'Mountain fox cushion',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    badge: 'Sonderpreis!',
    badgeType: 'sale',
    description: 'Decorative cushion with fox design',
    category: 'Home Accessories'
  },
  {
    id: 10,
    name: 'Brown bear cushion',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1566855849935-c98a60d5f144?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1610444714369-f90d6cca3ade?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Soft cushion with bear print',
    category: 'Accessories'
  },
  {
    id: 11,
    name: 'Hummingbird cushion',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1578898886225-ac9b91165255?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1616627547584-bf28cebf8b6e?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Elegant hummingbird design cushion',
    category: 'Home Accessories'
  },
  {
    id: 12,
    name: 'Mountain fox - Vector graphics',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Digital vector art download',
    category: 'Art'
  },
  {
    id: 13,
    name: 'Brown bear - Vector graphics',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1618005198920-f0cb6201c115?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'Printable bear vector graphics',
    category: 'Art'
  },
  {
    id: 14,
    name: 'Hummingbird - Vector graphics',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop',
    badge: 'Neu',
    description: 'High quality vector bird art',
    category: 'Art'
  },
  {
    id: 15,
    name: 'Pack Mug + Framed poster',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=400&h=400&fit=crop',
    badge: 'Artikelbündel',
    badgeType: 'bundle',
    description: 'Complete home decoration bundle',
    category: 'Home Accessories'
  }
];

export const sliderImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&h=600&fit=crop',
    title: 'New Arrivals',
    subtitle: 'spring - summer 2020',
    description: 'Stock up on sportswear and limited edition collections on our awesome mid-season sale.',
    buttonText: 'shop now'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=600&fit=crop',
    title: 'New Arrivals',
    subtitle: 'spring - summer 2020',
    description: 'Stock up on sportswear and limited edition collections on our awesome mid-season sale.',
    buttonText: 'shop now'
  }
];

export const services = [
  {
    id: 1,
    icon: 'Headphones',
    title: '24/7 free support',
    description: 'online support 24/7'
  },
  {
    id: 2,
    icon: 'Shield',
    title: 'money back guarantee',
    description: '100% secure payment'
  },
  {
    id: 3,
    icon: 'Gift',
    title: 'special gift cards',
    description: 'give the perfect gift'
  },
  {
    id: 4,
    icon: 'Truck',
    title: 'worldwide shipping',
    description: 'on order over $49'
  }
];

export const blogPosts = [
  {
    id: 1,
    title: 'This is Second Post For Blog',
    date: '11 Dec, 2020',
    author: 'Webibazaar Template',
    excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text...',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'This is Third Post For Blog',
    date: '11 Dec, 2020',
    author: 'Webibazaar Template',
    excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text...',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'This is Fourth Post For Blog',
    date: '11 Dec, 2020',
    author: 'Webibazaar Template',
    excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text...',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'How to Dress Like a Fashionista',
    date: '11 Dec, 2020',
    author: 'Webibazaar Template',
    excerpt: 'The click of my Louboutins against the New York City pavement is lost on the ears of passersby as the horn of the taxi...',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop'
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
