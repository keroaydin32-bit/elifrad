import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Grid, List, Eye, GitCompare, Heart, ShoppingCart } from 'lucide-react';
import { products, categories } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // Find category
  const category = categories.find(cat => 
    cat.name.toLowerCase().replace(/\s+/g, '-') === categoryName
  );
  
  // Filter products by category
  const categoryProducts = products.filter(product => 
    product.category.toLowerCase() === category?.name.toLowerCase() ||
    (category?.name === 'Men' && (product.category === 'Men' || product.category === 'Clothes')) ||
    (category?.name === 'Clothes' && (product.category === 'Men' || product.category === 'Women' || product.category === 'Clothes'))
  );

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Kategorie bulunamadı</h2>
        <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const ProductCard = ({ product, index }) => (
    <div 
      className="group relative bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
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
        {product.badge && (
          <Badge 
            className={`absolute top-2 left-2 ${
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
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
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
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
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
          Add to cart
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-red-600">Home</button>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-4xl">
              {category.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              <p className="text-gray-600">
                {category.name === 'Women' && 'T-shirts, sweaters, hoodies and women\'s accessories. From basics to original creations, for every style.'}
                {category.name === 'Men' && 'Men\'s collection featuring comfortable and stylish clothing for every occasion.'}
                {category.name === 'Clothes' && 'Complete clothing collection for men and women. Quality fabrics and modern designs.'}
                {category.name === 'Home Accessories' && 'Beautiful home accessories to make your living space more comfortable and stylish.'}
                {category.name === 'Stationery' && 'High-quality stationery items for work, school and creative projects.'}
                {!['Women', 'Men', 'Clothes', 'Home Accessories', 'Stationery'].includes(category.name) && 
                  `Explore our ${category.name} collection with quality products and great prices.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 bg-white rounded-lg p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Filtern nach</h3>
            
            {/* Size Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Größe</h4>
              <div className="space-y-2">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <label key={size} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{size} (1)</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Farbe</h4>
              <div className="space-y-2">
                {['Weiß', 'Schwarz'].map(color => (
                  <label key={color} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{color} (1)</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Preis</h4>
              <div className="text-sm text-gray-600">
                $9.00 - $36.00
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">{categoryProducts.length} Artikel gefunden</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    Filter
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Sortiert nach:</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      <option value="relevance">Relevanz</option>
                      <option value="price-asc">Preis (aufsteigend)</option>
                      <option value="price-desc">Preis (absteigend)</option>
                      <option value="name-asc">Name (A bis Z)</option>
                      <option value="name-desc">Name (Z bis A)</option>
                    </select>
                  </div>
                  
                  <div className="flex border rounded">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">1 - {categoryProducts.length} von {categoryProducts.length} Artikel(n)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;