import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, GitCompare, Heart, ChevronDown } from 'lucide-react';
import { products, sliderImages, services, blogPosts, brands, categories } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import RightSidebar from '../components/RightSidebar';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('featured');
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

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
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
          {product.name}
        </h3>
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
    <div className="bg-gray-50">
      {/* Hero Section with Sidebar and Slider */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <div className="w-64 bg-white rounded-lg shadow-md">
            <div className="p-4">
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors rounded">
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                      {category.hasSubmenu && <ChevronDown className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Center - Hero Slider */}
          <div className="flex-1 relative h-[400px] bg-black overflow-hidden rounded-lg shadow-md">
            <div className="relative h-full">
              {sliderImages.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                    <div className="px-12">
                      <div className="max-w-lg">
                        <p className="text-red-500 text-sm uppercase mb-2">{slide.subtitle}</p>
                        <h2 className="text-white text-4xl font-bold mb-3">{slide.title}</h2>
                        <p className="text-white text-base mb-5">{slide.description}</p>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 text-base uppercase">
                          {slide.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 p-2 rounded-full transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 p-2 rounded-full transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-red-600 w-8' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const IconComponent = require('lucide-react')[service.icon];
              return (
                <div key={service.id} className="flex items-center gap-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <IconComponent className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 uppercase text-sm">{service.title}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-6">Spitzenprodukt</h2>
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === 'featured'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              vorgestellt
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === 'latest'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              neueste
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.slice(0, 10).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      {/* Top Rated Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">top rated</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index + 10} />
            ))}
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                <p className="text-xs text-gray-500">By: {post.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div className="bg-white py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-center">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="h-16 object-contain opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
