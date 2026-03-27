import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, ChevronDown, ChevronRight, Bike, Package, Zap, Settings, Cpu, Wrench, HelpCircle, Layers, Shirt, Home as HomeIcon, Palette, Activity, ArrowRight, X, Moon, Sun, LogOut, Loader2, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeProvider';
import { productPath, findProductBySlug } from '../lib/productSlug';

// Category Icon Mapping Utility
const CategoryIcon = ({ category, className = "w-5 h-5" }) => {
  const name = category?.name?.toLowerCase() || '';
  const icon = category?.icon;

  if (icon && typeof icon === 'string' && icon.length <= 4 && !['📁', '📂', '📄', '🗂️', '🏠'].includes(icon)) {
    return <span className="text-lg leading-none">{icon}</span>;
  }

  if (name.includes('bike') || name.includes('rad')) return <Bike className={className} />;
  if (name.includes('bekleidung') || name.includes('kleidung') || name.includes('shirt')) return <Shirt className={className} />;
  if (name.includes('zubehör') || name.includes('accessoires')) return <Package className={className} />;
  if (name.includes('ersatzteile') || name.includes('teile') || name.includes('parts')) return <Settings className={className} />;
  if (name.includes('elektronik') || name.includes('digital') || name.includes('technik')) return <Cpu className={className} />;
  if (name.includes('service') || name.includes('werkstatt')) return <Wrench className={className} />;
  if (name.includes('kontakt') || name.includes('hilfe')) return <HelpCircle className={className} />;
  if (name.includes('home') || name.includes('wohn') || name.includes('startseite')) return <HomeIcon className={className} />;
  if (name.includes('kunst') || name.includes('art')) return <Palette className={className} />;
  if (name.includes('sport') || name.includes('fitness')) return <Activity className={className} />;
  if (name.includes('sonder') || name.includes('angebot') || name.includes('sale')) return <Zap className={className} />;

  return <Layers className={`${className} opacity-50`} />;
};

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [expandedMobileCategories, setExpandedMobileCategories] = useState(new Set());

  const toggleMobileCategory = (id, e) => {
    if (e) e.preventDefault();
    setExpandedMobileCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const { cart, categories, products: storeProducts, shopSettings, customer, loading, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const suggestionsRef = React.useRef(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredNavId, setHoveredNavId] = useState(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();

  // Reset active category when menu opens
  React.useEffect(() => {
    if (isCategoriesOpen && categories && categories.length > 0) {
      setActiveCategory(categories[0].id);
    } else {
      setActiveCategory(null);
    }
  }, [isCategoriesOpen, categories]);

  const handleCategoryHover = (catId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (!catId) {
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveCategory(null);
      }, 100);
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(catId);
    }, 50);
  };

  const handleNavHover = (catId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (!catId) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredNavId(null);
      }, 150);
    } else {
      setHoveredNavId(catId);
      setIsCategoriesOpen(false); // Close mega menu specifically when hovering small nav
    }
  };

  // Close categories menu on route change
  useEffect(() => {
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
    setHoveredNavId(null);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length >= 2 && storeProducts) {
      const filtered = storeProducts.filter(p =>
        p.name?.toLowerCase().includes(value.toLowerCase()) ||
        p.sku?.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(productPath(product));
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      let url = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      if (searchCategory !== 'all') {
        url += `&category=${searchCategory}`;
      }
      navigate(url);
      setShowSuggestions(false);
      setIsSearchOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const editLink = React.useMemo(() => {
    if (customer?.email !== 'kerem_aydin@aol.com') return null;

    if (location.pathname.startsWith('/product/')) {
      const pathSlug = decodeURIComponent(location.pathname.split('/product/')[1] || '');
      if (storeProducts && pathSlug) {
        const product = findProductBySlug(pathSlug, storeProducts);
        if (product) {
          return {
            url: `/admin/Kategorien-Artikel/edit-artikel?id=${product.id}&return_url=${encodeURIComponent(location.pathname)}`,
            label: 'Artikel Bearbeiten',
            icon: <Edit3 className="w-3.5 h-3.5" />
          };
        }
      }
    } else if (location.pathname.startsWith('/category/')) {
      const pathParts = location.pathname.split('/category/')[1]?.split('/') || [];
      const pathSlug = decodeURIComponent(pathParts[pathParts.length - 1] || '');
      if (categories && pathSlug && pathSlug !== 'all') {
        const flatten = (cats) => {
          let res = [];
          if (!cats) return res;
          for (let c of cats) {
            res.push(c);
            if (c.subcategories) res = [...res, ...flatten(c.subcategories)];
          }
          return res;
        }
        const flatCats = flatten(categories);
        const category = flatCats.find(c => {
          const cSlug = c.slug || c.name?.toLowerCase().replace(/\s+/g, '-');
          return cSlug === pathSlug;
        });
        if (category) {
          return {
            url: `/admin/Kategorien-Artikel/edit-kategorie?id=${category.id}&return_url=${encodeURIComponent(location.pathname)}`,
            label: 'Kategorie Bearbeiten',
            icon: <Edit3 className="w-3.5 h-3.5" />
          };
        }
      }
    }
    return null;
  }, [location.pathname, storeProducts, categories, customer]);

  return (
    <header className="bg-white dark:bg-[#050505] transition-colors">
      {/* Top Bar */}
      {/* Top Bar - Hidden on mobile */}
      <div className="bg-gray-900 border-b border-gray-800 text-gray-300 hidden md:block">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-xs font-medium tracking-wide">
            <div className="flex items-center gap-4">
              <span className="text-red-500 font-bold">ANGEBOT</span>
              <span>Sparen Sie 30% auf ausgewählte Artikel</span>
            </div>
            <div className="flex items-center gap-6">
              {customer?.email === 'kerem_aydin@aol.com' && (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm transition-colors font-bold flex items-center gap-1"
                  >
                    Admin Panel
                  </button>
                  {editLink && (
                    <button
                      onClick={() => navigate(editLink.url)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-sm transition-colors font-bold flex items-center gap-1.5"
                    >
                      {editLink.icon}
                      {editLink.label}
                    </button>
                  )}
                </>
              )}
              <button className="hover:text-white transition-colors flex items-center gap-1">Deutsch <ChevronDown className="w-3 h-3" /></button>
              <button className="hover:text-white transition-colors flex items-center gap-1">EUR € <ChevronDown className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 z-50 relative bg-white dark:bg-[#050505] transition-colors border-b lg:border-none border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 lg:gap-4 group"
          >
            {/* Logo Image */}
            {shopSettings?.logoUrl && (
              <div className="flex-shrink-0">
                <img
                  src={shopSettings.logoUrl}
                  alt={shopSettings.shopName}
                  className="h-8 lg:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            )}

            {/* Default Icon (only if no logo URL) */}
            {!shopSettings?.logoUrl && (
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 lg:w-6 lg:h-6 border-4 border-white rounded-full"></div>
              </div>
            )}

            {/* Shop Name Text */}
            <div className="flex flex-col">
              <h1 className="text-xl lg:text-3xl font-display font-black tracking-tighter text-red-600 leading-none transition-transform group-hover:scale-[1.02]">
                {shopSettings?.shopName?.toUpperCase() || 'ELECTRIVE'}
              </h1>
              <p className="text-[8px] lg:text-[10px] uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 font-bold ml-1 mt-0.5">
                {shopSettings?.shopTagline || 'GROSS- UND EINZELHANDEL'}
              </p>
            </div>

          </Link>

          {/* Mobile Actions Right */}
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-1">
              <Search className="w-6 h-6 text-gray-700" />
            </button>
            <button onClick={() => navigate('/cart')} className="relative p-1">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-2xl mx-12 relative"
            ref={suggestionsRef}
          >
            <div className="flex w-full shadow-lg rounded-full overflow-hidden border border-gray-200 hover:border-red-500 hover:shadow-red-100 transition-all duration-300 bg-white">
              <div className="relative group min-w-[160px]">
                <select
                  className="h-full w-full pl-6 pr-10 bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-700 border-r border-gray-200 focus:outline-none cursor-pointer hover:bg-gray-100 appearance-none transition-colors"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="all">Alle Kategorien</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}>
                      {cat.name?.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-red-600 transition-colors" />
              </div>
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Wonach suchen Sie heute?"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-6 py-3 text-sm font-medium text-gray-700 focus:outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 transition-all flex items-center justify-center group/btn"
              >
                <Search className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white shadow-2xl rounded-lg border border-gray-100 z-[10000] py-4 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-6 py-2 mb-2 border-b border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vorschläge:</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSuggestionClick(p)}
                      className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-12 h-12 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-red-200 transition-colors">
                        <img
                          src={p.image || (() => {
                            try {
                              const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                              return Array.isArray(parsed) ? parsed[0] : parsed;
                            } catch (e) { return null; }
                          })() || 'https://placehold.co/100x100?text=📦'}
                          alt={p.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                          {p.name}
                        </div>
                        {p.sku && (
                          <div className="text-[10px] font-mono font-medium text-gray-400 mt-0.5">
                            {p.sku}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-sm font-black text-gray-900">
                          {(p.price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </div>
                        <ArrowRight className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 inline-block ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-6 py-3 mt-2 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={handleSearch}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-2"
                  >
                    Alle ansehen "{searchQuery}" <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {showSuggestions && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
              <div className="absolute top-[calc(100%+10px)] left-0 right-0 bg-white shadow-2xl rounded-lg border border-gray-100 z-[10000] p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm font-medium text-gray-500">Keine Ergebnisse für "{searchQuery}" gefunden.</p>
              </div>
            )}
          </form>

          {/* User Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300 pointer-events-auto"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">Lädt...</span>
                </div>
              ) : customer ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase leading-none">Mein Konto</span>
                      <span className="text-sm font-bold truncate max-w-[120px]">{customer.first_name || 'Profil'}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                    title="Abmelden"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300 group"
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Anmelden</span>
                </Link>
              )}
            </div>

            <Link
              to="/cart"
              className="flex items-center gap-2 hover:text-red-600 transition-colors relative text-gray-700 dark:text-gray-300"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">{cartTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Expandable */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="lg:hidden mt-4 animate-accordion-down">
            <div className="flex shadow-md rounded-lg overflow-hidden border border-gray-200">
              <input
                type="text"
                placeholder="Suche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 text-gray-700 focus:outline-none"
              />
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-none">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      {/* Navigation - Desktop */}
      <div className="bg-red-600 text-white hidden lg:block relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-6 rounded-none flex items-center gap-2"
              >
                <Menu className="w-5 h-5" />
                ALLE KATEGORIEN
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </Button>
              <nav
                className="flex items-center ml-8 h-full"
                onMouseLeave={() => handleNavHover(null)}
              >
                {categories?.map((category) => (
                  <div
                    key={category.id}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => handleNavHover(category.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const slug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                        navigate(`/category/${slug}`);
                      }}
                      className="relative px-5 py-6 text-[13px] font-black tracking-widest hover:text-yellow-400 transition-colors h-full flex items-center uppercase gap-1"
                    >
                      {category.name}
                      {category.subcategories?.length > 0 && (
                        <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180 opacity-50" />
                      )}
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </button>

                    {category.subcategories?.length > 0 && hoveredNavId === category.id && (
                      <div className="absolute top-full left-0 w-72 bg-white shadow-2xl border border-gray-100 py-3 z-[10000] animate-in fade-in slide-in-from-top-2 duration-300 transform rounded-b-lg">
                        <div className="px-5 py-2 border-b border-gray-50 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                            {category.name}
                          </span>
                        </div>
                        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar px-2">
                          {category.subcategories.map((sub) => (
                            <div key={sub.id} className="mb-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  const parentSlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                                  const subSlug = sub.slug || sub.name?.toLowerCase().replace(/\s+/g, '-');
                                  navigate(`/category/${parentSlug}/${subSlug}`);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all text-left group/sub"
                              >
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                <span className="font-bold uppercase text-[11px] tracking-wider truncate">{sub.name}</span>
                              </button>

                              {/* Sub-subcategories (3. Level) */}
                              {sub.subcategories?.length > 0 && (
                                <div className="ml-8 mt-1 flex flex-col gap-1 border-l border-gray-100 pl-4 py-1">
                                  {sub.subcategories.map((subSub) => (
                                    <button
                                      key={subSub.id}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const parentSlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                                        const subSlug = sub.slug || sub.name?.toLowerCase().replace(/\s+/g, '-');
                                        const subSubSlug = subSub.slug || subSub.name?.toLowerCase().replace(/\s+/g, '-');
                                        navigate(`/category/${parentSlug}/${subSlug}/${subSubSlug}`);
                                      }}
                                      className="text-[10px] font-medium text-gray-500 hover:text-red-600 transition-colors text-left py-0.5 uppercase tracking-wide"
                                    >
                                      {subSub.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 px-5 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => {
                              const slug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                              navigate(`/category/${slug}`);
                              setIsCategoriesOpen(false);
                              setHoveredNavId(null);
                            }}
                            className="text-[9px] font-black uppercase tracking-widest text-gray-900 hover:text-red-600 transition-colors flex items-center gap-2 group/all"
                          >
                            ALLES ANZEIGEN <ArrowRight className="w-3 h-3 transition-transform group-hover/all:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <Button
              onClick={() => navigate('/special-offers')}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-6 rounded-none text-sm font-medium"
            >
              SONDERANGEBOTE!
            </Button>
          </div>
        </div>

        {/* Categories Dropdown Panel */}
        {isCategoriesOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-[9998]"
              onClick={() => setIsCategoriesOpen(false)}
            ></div>

            {/* Dropdown Panel - Redesigned to Sidebar Flyout */}
            <div
              className="absolute top-full left-0 right-0 bg-white shadow-2xl z-[9999] animate-in slide-in-from-top-4 duration-300 border-t border-gray-100"
              onMouseLeave={() => {
                // Keep the first one active by default or leave it as is
              }}
            >
              <div className="container mx-auto px-0 flex h-[500px]">
                {/* Left Sidebar: Main Categories */}
                <div className="w-80 bg-gray-50/50 border-r border-gray-100 py-4 overflow-y-auto">
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        onMouseEnter={() => handleCategoryHover(category.id)}
                        onClick={(e) => {
                          e.preventDefault();
                          const slug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/category/${slug}`);
                          setIsCategoriesOpen(false);
                        }}
                        className={`group cursor-pointer transition-all border-l-4 ${activeCategory === category.id
                          ? 'bg-white text-red-600 shadow-md border-red-600 scale-[1.02]'
                          : 'text-gray-700 hover:bg-gray-50 border-transparent hover:text-red-600'
                          }`}
                      >
                        <div className="flex items-center justify-between px-8 py-4 text-sm font-bold uppercase tracking-wider h-full w-full">
                          <span className="flex items-center gap-3">
                            <CategoryIcon category={category} className="w-5 h-5" />
                            {category.name}
                          </span>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === category.id ? 'translate-x-1' : ''}`} />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-8 py-4 text-gray-400 text-sm italic">Keine Kategorien</div>
                  )}

                  <div className="mt-4 px-8 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => { navigate('/categories'); setIsCategoriesOpen(false); }}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline"
                    >
                      Alle Kategorien ansehen
                    </button>
                  </div>
                </div>

                {/* Right Panel: Subcategories Content */}
                <div className="flex-1 bg-white p-10 overflow-y-auto">
                  {activeCategory ? (
                    (() => {
                      const selectedCat = categories.find(c => c.id === activeCategory);
                      if (!selectedCat) return null;

                      return (
                        <div className="animate-in fade-in duration-200">
                          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                            <div>
                              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">
                                {selectedCat.name}
                              </h2>
                              <p className="text-sm text-gray-500 font-medium">
                                {selectedCat.subcategories?.length || 0} Unterkategorien gefunden
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                navigate(`/category/${selectedCat.slug || selectedCat.name?.toLowerCase().replace(/\s+/g, '-')}`);
                                setIsCategoriesOpen(false);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs px-6"
                            >
                              Alle ansehen
                            </Button>
                          </div>

                          {selectedCat.subcategories && selectedCat.subcategories.length > 0 ? (
                            <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                              {selectedCat.subcategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={`/category/${selectedCat.slug || selectedCat.name?.toLowerCase().replace(/\s+/g, '-')}/${sub.slug || sub.name?.toLowerCase().replace(/\s+/g, '-')}`}
                                  onClick={() => setIsCategoriesOpen(false)}
                                  className="group flex flex-col gap-1 border-l-2 border-transparent hover:border-red-600 pl-4 py-1 transition-all min-h-[48px]"
                                >
                                  <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                                    {sub.name}
                                  </span>
                                  {sub.subcategories && sub.subcategories.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-2">
                                      {sub.subcategories.slice(0, 5).map(thirdLevel => (
                                        <Link
                                          key={thirdLevel.id}
                                          to={`/category/${selectedCat.slug || selectedCat.name?.toLowerCase().replace(/\s+/g, '-')}/${sub.slug || sub.name?.toLowerCase().replace(/\s+/g, '-')}/${thirdLevel.slug || thirdLevel.name?.toLowerCase().replace(/\s+/g, '-')}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsCategoriesOpen(false);
                                          }}
                                          className="text-[11px] text-gray-400 hover:text-red-600 font-bold uppercase transition-colors"
                                        >
                                          {thirdLevel.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                              <span className="text-4xl mb-2 opacity-20">📦</span>
                              <p className="text-sm font-bold uppercase tracking-widest">In dieser Kategorie befinden sich keine Unterkategorien</p>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <Menu className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-bold uppercase tracking-widest opacity-50">Bitte wählen Sie eine Kategorie aus</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden font-sans">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
              <div className="p-4 bg-red-600 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">Menü</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-red-700 rounded-full transition-colors">
                  <Menu className="w-6 h-6 rotate-90" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-6">
                  <button
                    onClick={() => {
                      navigate('/special-offers');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg shadow-sm hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 mb-4"
                  >
                    SONDERANGEBOTE!
                  </button>
                </div>

                <div className="px-4 mb-6">
                  <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-wider flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-gray-300"></span> Kategorien <span className="flex-1 h-[1px] bg-gray-300"></span>
                  </h3>
                  <div className="space-y-1">
                    {categories?.map(category => {
                      const hasSub = category.subcategories && category.subcategories.length > 0;
                      const isExpanded = expandedMobileCategories.has(category.id);
                      const slug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');

                      return (
                        <div key={category.id} className="border-b border-gray-50 last:border-0">
                          <div className="flex items-center">
                            <Link
                              to={`/category/${slug}`}
                              className="flex-1 p-3 font-bold text-gray-800 uppercase tracking-tight text-sm"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <CategoryIcon category={category} className="w-4 h-4 text-red-600" />
                                {category.name}
                              </div>
                            </Link>
                            {hasSub && (
                              <button
                                onClick={(e) => toggleMobileCategory(category.id, e)}
                                className="p-3 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>

                          {hasSub && isExpanded && (
                            <div className="bg-gray-50/50 pl-8 pb-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                              {category.subcategories.map(sub => {
                                const subSlug = sub.slug || sub.name?.toLowerCase().replace(/\s+/g, '-');
                                const hasSubSub = sub.subcategories && sub.subcategories.length > 0;
                                const isSubExpanded = expandedMobileCategories.has(sub.id);

                                return (
                                  <div key={sub.id}>
                                    <div className="flex items-center">
                                      <Link
                                        to={`/category/${slug}/${subSlug}`}
                                        className="flex-1 py-2 text-sm text-gray-600 font-medium hover:text-red-600 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        {sub.name}
                                      </Link>
                                      {hasSubSub && (
                                        <button
                                          onClick={(e) => toggleMobileCategory(sub.id, e)}
                                          className="p-2 text-gray-400"
                                        >
                                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                      )}
                                    </div>

                                    {hasSubSub && isSubExpanded && (
                                      <div className="pl-4 pb-2 space-y-1">
                                        {sub.subcategories.map(thirdLevel => (
                                          <Link
                                            key={thirdLevel.id}
                                            to={`/category/${slug}/${subSlug}/${thirdLevel.slug || thirdLevel.name?.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="block py-1 text-xs text-gray-500 font-medium hover:text-red-600 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                          >
                                            • {thirdLevel.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                  <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-wider">Mein Konto</h3>
                  <button className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all" onClick={() => { navigate('/account'); setIsMobileMenuOpen(false); }}>
                    <User className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-700">Profil & Einstellungen</span>
                  </button>
                  <button className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all" onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}>
                    <ShoppingCart className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-700">Warenkorb ({cartCount})</span>
                  </button>
                  {customer && (
                    <button
                      className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-red-600"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-bold">Abmelden</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center gap-4 text-xs text-gray-500">
                <span>© {new Date().getFullYear()} {shopSettings?.shopName || 'Electrive'}</span>
                <span>•</span>
                <span>Datenschutz</span>
              </div>
            </div>
          </div>
        )
      }
    </header >
  );
};

export default Header;
