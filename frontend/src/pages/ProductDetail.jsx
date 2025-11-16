import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, GitCompare, Minus, Plus, Star } from 'lucide-react';
import { products } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ürün bulunamadı</h2>
        <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const images = [product.image, product.hoverImage];

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-red-600">Home</button>
            <span>/</span>
            <span className="text-gray-400">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="bg-white p-4 rounded-lg mb-4">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-[500px] object-cover rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white p-2 rounded-lg border-2 transition-colors ${
                    selectedImage === index ? 'border-red-600' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white p-8 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                {product.badge && (
                  <Badge 
                    className={`mb-3 ${
                      product.badgeType === 'sale' 
                        ? 'bg-red-600' 
                        : product.badgeType === 'bundle'
                        ? 'bg-blue-600'
                        : 'bg-gray-800'
                    } text-white`}
                  >
                    {product.badge}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(24 reviews)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-b py-6 mb-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                {product.badgeType === 'sale' && (
                  <span className="text-2xl text-gray-400 line-through">${(product.price * 1.3).toFixed(2)}</span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category:</label>
              <span className="inline-block bg-gray-100 px-4 py-2 rounded text-sm font-medium text-gray-700">
                {product.category}
              </span>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    onClick={decrementQuantity}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 font-semibold">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" className="px-6 border-gray-300 hover:bg-gray-100">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="px-6 border-gray-300 hover:bg-gray-100">
                <GitCompare className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-600">SKU:</span>
                <span className="text-sm font-medium text-gray-900">PROD-{product.id.toString().padStart(4, '0')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Share:</span>
                <div className="flex gap-2">
                  <button className="text-gray-600 hover:text-red-600 transition-colors">Facebook</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-gray-600 hover:text-red-600 transition-colors">Twitter</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-gray-600 hover:text-red-600 transition-colors">Pinterest</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Tabs */}
        <div className="bg-white p-8 rounded-lg mb-12">
          <div className="border-b mb-6">
            <button className="px-6 py-3 border-b-2 border-red-600 text-red-600 font-semibold">
              Description
            </button>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Features:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>High-quality materials and craftsmanship</li>
              <li>Durable and long-lasting design</li>
              <li>Perfect for everyday use</li>
              <li>Easy to clean and maintain</li>
              <li>Stylish and modern appearance</li>
            </ul>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <div 
                  key={relProduct.id}
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square">
                    <img 
                      src={relProduct.image} 
                      alt={relProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {relProduct.badge && (
                      <Badge className="absolute top-2 left-2 bg-gray-800 text-white text-xs">
                        {relProduct.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                      {relProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">${relProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
