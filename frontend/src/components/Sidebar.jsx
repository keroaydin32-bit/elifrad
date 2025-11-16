import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { categories, products } from '../data/mockData';
import { Card, CardContent } from './ui/card';

const Sidebar = () => {
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      {/* Categories Menu */}
      <div className="p-4 border-b">
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => category.hasSubmenu && toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors rounded"
              >
                <span className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
                {category.hasSubmenu && (
                  expandedCategories.includes(category.id) 
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {category.hasSubmenu && expandedCategories.includes(category.id) && (
                <ul className="ml-6 mt-1 space-y-1">
                  <li>
                    <a href="#" className="block px-3 py-1 text-sm text-gray-600 hover:text-red-600">All Products</a>
                  </li>
                  <li>
                    <a href="#" className="block px-3 py-1 text-sm text-gray-600 hover:text-red-600">New Arrivals</a>
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Featured Product */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Featured Product</h3>
        <Card className="overflow-hidden">
          <img 
            src={products[2].image} 
            alt={products[2].name}
            className="w-full h-40 object-cover"
          />
          <CardContent className="p-3">
            <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
              {products[2].name}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-2">
              ${products[2].price.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default Sidebar;
