import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { categories } from '../data/mockData';

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
      <div className="p-4">
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
    </aside>
  );
};

export default Sidebar;
