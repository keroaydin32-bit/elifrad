import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Sidebar = () => {
  const { categories: storeCategories, loading } = useStore();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState([]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Lade...</div>;

  const categories = storeCategories;

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
              {category.subcategories && category.subcategories.length > 0 ? (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors rounded"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </span>
                  {expandedCategories.includes(category.id)
                    ? <ChevronDown className="w-4 h-4 cursor-pointer" />
                    : <ChevronRight className="w-4 h-4 cursor-pointer" />
                  }
                </button>
              ) : (
                <Link
                  to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors rounded"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </span>
                </Link>
              )}
              {category.subcategories && category.subcategories.length > 0 && expandedCategories.includes(category.id) && (
                <ul className="ml-6 mt-1 space-y-1">
                  <li>
                    <Link
                      to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-3 py-1 text-sm text-gray-600 hover:text-red-600"
                    >
                      Alle Produkte
                    </Link>
                  </li>
                  {category.subcategories.map(sub => (
                    <li key={sub.id}>
                      <Link
                        to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}/${sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-3 py-1 text-sm text-gray-600 hover:text-red-600"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
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
