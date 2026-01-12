import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Eye, GitCompare, Heart } from 'lucide-react';
import { products } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const SpecialOffersPage = () => {
  const navigate = useNavigate();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // Filter products with special offers
  const specialOffers = products.filter(product => 
    product.badgeType === 'sale' || product.price < 20
  );

  const ProductCard = ({ product, index }) => (
    <div 
      className="group relative bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer rounded-lg"
      onMouseEnter={() => setHoveredProduct(index)}
      onMouseLeave={() => setHoveredProduct(null)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={hoveredProduct === index ? product.hoverImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.badge && (
            <Badge 
              className={`${
                product.badgeType === 'sale' 
                  ? 'bg-red-600' 
                  : product.badgeType === 'bundle'
                  ? 'bg-blue-600'
                  : 'bg-gray-800'
              } text-white text-xs px-2 py-1`}
            >
              {product.badge}
            </Badge>
          )}
          <Badge className="bg-yellow-500 text-black text-xs px-2 py-1 font-bold">
            ANGEBOT!
          </Badge>
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-md"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-md"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-md"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Discount Badge */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            -{Math.floor(Math.random() * 30 + 10)}%
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-400 line-through">${(product.price * 1.3).toFixed(2)}</span>
          </div>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xs">★</span>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          In den Warenkorb
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-white text-red-600 hover:bg-gray-100 border-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🎁 SPECIAL OFFERS! 🎁</h1>
            <p className="text-xl mb-4">Bis zu 50% Rabatt auf ausgewählte Artikel</p>
            <div className="bg-yellow-400 text-red-700 px-6 py-2 rounded-full inline-block font-bold">
              ⏰ Nur für begrenzte Zeit!
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-red-600">Home</button>
            <span>/</span>
            <span className="text-gray-900">Special Offers</span>
          </div>
        </div>
      </div>

      {/* Special Offer Categories */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-red-100 text-red-700 px-6 py-2 rounded-full font-semibold hover:bg-red-200 transition-colors">
              Alle Angebote
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Bekleidung
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Wohnaccessoires
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Kunst & Design
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {specialOffers.length} Sonderangebote verfügbar
          </h2>
          <p className="text-gray-600">
            Sparen Sie bei diesen hochwertigen Produkten - solange der Vorrat reicht!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {specialOffers.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-red-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Verpassen Sie nicht diese Gelegenheit!</h3>
            <p className="text-lg mb-6">
              Kostenloser Versand bei Bestellungen über $49 • 30 Tage Rückgaberecht
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Mehr Angebote entdecken
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffersPage;