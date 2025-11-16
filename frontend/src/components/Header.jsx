import React, { useState } from 'react';
import { Search, User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(3);

  return (
    <header className="bg-white">
      {/* Top Bar */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-700">
              Get 30% Off On Selected Items
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-700 hover:text-red-600">Deutsch</button>
              <button className="text-gray-700 hover:text-red-600">USD $</button>
              <button className="text-gray-700 hover:text-red-600">Compare</button>
              <button className="text-gray-700 hover:text-red-600">Wishlist</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ELECTRIVE</h1>
              <p className="text-xs text-gray-500">Hitech</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex">
              <select className="px-4 py-3 bg-white border border-r-0 border-gray-300 text-sm text-gray-700 focus:outline-none">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home & Garden</option>
              </select>
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-red-600"
              />
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 rounded-none">
                SEARCH
              </Button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Mein Konto</span>
            </button>
            <button className="flex items-center gap-2 hover:text-red-600 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">0,00 $</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-6 rounded-none flex items-center gap-2">
                <Menu className="w-5 h-5" />
                ALL CATEGORIES
              </Button>
              <nav className="flex items-center ml-8">
                <a href="#" className="px-4 py-6 hover:bg-red-700 transition-colors text-sm font-medium">BESTSELLER</a>
                <a href="#" className="px-4 py-6 hover:bg-red-700 transition-colors text-sm font-medium">LATEST</a>
                <a href="#" className="px-4 py-6 hover:bg-red-700 transition-colors text-sm font-medium">SPECIAL</a>
                <a href="#" className="px-4 py-6 hover:bg-red-700 transition-colors text-sm font-medium">CONTACT US</a>
                <a href="#" className="px-4 py-6 hover:bg-red-700 transition-colors text-sm font-medium">SITEMAP</a>
                <a href="#" className="px-4 py-6 hover:bg-red-700 transition-colors text-sm font-medium">STORES</a>
              </nav>
            </div>
            <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-6 rounded-none text-sm font-medium">
              🎁 SPECIAL OFFERS!
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
