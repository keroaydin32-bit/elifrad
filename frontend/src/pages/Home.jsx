import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, GitCompare, Heart, ChevronDown, Bike, Package, Zap, Settings, Shield, Cpu, Wrench, HelpCircle, Layers, Shirt, Home as HomeIcon, Palette, Activity, ArrowRight } from 'lucide-react';
import { products, sliderImages, services, blogPosts, brands, categories as mockCategories } from '../data/mockData';
import { productPath } from '../lib/productSlug';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useStore } from '../context/StoreContext';
import RightSidebar from '../components/RightSidebar';
import SEO from '../components/SEO';
import { generateOrgJSONLD } from '../lib/seoUtils';
import { getOptimizedImage, IMAGE_SIZES } from '../lib/imageOptimization';

// Category Icon Mapping Utility
const CategoryIcon = ({ category, className = "w-5 h-5" }) => {
  const name = category?.name?.toLowerCase() || '';
  const icon = category?.icon;

  // Use emoji if it's specific and not folder-related
  if (icon && typeof icon === 'string' && icon.length <= 4 && !['📁', '📂', '📄', '🗂️', '🏠'].includes(icon)) {
    return <span className="text-lg leading-none">{icon}</span>;
  }

  // Professional Lucide mapping
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

  // Default professional fallback
  return <Layers className={`${className} opacity-50`} />;
};

const ProductCard = React.memo(({ product, index }) => {
  const { toggleFavorite, isFavorite, addToCart, manufacturers: storeManufacturers, isDealer } = useStore();

  const parseImages = (imgData) => {
    if (!imgData) return [];
    if (Array.isArray(imgData)) return imgData;
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [imgData];
    }
  };

  const productImages = parseImages(product.images);
  const imgSrc = product.image || (productImages.length > 0 ? productImages[0] : (product.image_url || 'https://placehold.co/600x600?text=Gerät'));

  const m = storeManufacturers?.find(m => m.id === product.manufacturer_id);

  return (
    <Link
      to={productPath(product)}
      className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_0_40px_-10px_rgba(220,38,38,0.3)] hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-square flex-shrink-0 bg-white dark:bg-gradient-to-b dark:from-[#111] dark:to-[#0a0a0a] p-6 lg:p-8">
        <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl rounded-full"></div>
        <img
          src={getOptimizedImage(imgSrc, IMAGE_SIZES.CARD)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            if (e.target.src !== imgSrc) {
              e.target.src = imgSrc;
            }
          }}
        />
        {(() => {
          const original = Number(product.price) || 0;
          const discount = Number(product.discount_price) || 0;
          const expiryStr = product.discount_expiry;
          
          const isValidDate = (d) => !isNaN(new Date(d).getTime());
          const isExpired = expiryStr && isValidDate(expiryStr) && new Date(expiryStr).setHours(23, 59, 59, 999) < new Date().getTime();
          
          const hasDiscount = discount > 0 && original > discount && !isExpired;
          
          if (!hasDiscount) return null;
          const percent = Math.round(((original - discount) / original) * 100);
          return (
            <div className="absolute top-4 left-4 z-40 bg-red-600 text-white font-black px-2 py-1 rounded-sm shadow-xl flex flex-row items-center gap-1.5 leading-none transform -rotate-2 hover:rotate-0 transition-all duration-300 pointer-events-none group-hover:scale-105">
              {/* Inset Stitched Border */}
              <div className="absolute inset-0.5 border border-dashed border-white/20 rounded-sm pointer-events-none"></div>
              
              {/* Tag Hole (Left side) */}
              <div className="w-1.5 h-1.5 rounded-full bg-black/30 shadow-inner border border-white/5 flex-shrink-0"></div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[6px] uppercase tracking-wider opacity-90 font-bold">Angebot</span>
                <span className="text-xs">%{percent}</span>
              </div>
            </div>
          );
        })()}
        {product.badge && (
          <Badge
            className={`absolute top-4 left-4 ${product.badgeType === 'sale'
              ? 'bg-red-600'
              : product.badgeType === 'bundle'
                ? 'bg-blue-600'
                : 'bg-black dark:bg-white/10 dark:backdrop-blur-md'
              } text-white font-black uppercase tracking-wider text-[10px] px-3 py-1.5 rounded-full shadow-lg z-20`}
          >
            {product.badge}
          </Badge>
        )}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product);
            }}
            className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border ${isFavorite(product.id)
              ? 'bg-red-600 border-red-500 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : 'bg-white/80 dark:bg-black/50 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-red-600 hover:border-red-500 hover:text-white hover:scale-110'
              }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="cursor-pointer w-8 h-8 bg-white/80 dark:bg-black/50 border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 backdrop-blur-md border"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="cursor-pointer w-8 h-8 bg-white/80 dark:bg-black/50 border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 backdrop-blur-md border"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1 dark:bg-gradient-to-b dark:from-[#0a0a0a] dark:to-[#050505]">
        {m && <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">{m.name}</p>}
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-4 mt-auto">
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter flex items-baseline gap-1">
            {(() => {
              const original = Number(product.price) || 0;
              const discount = Number(product.discount_price) || 0;
              const expiryStr = product.discount_expiry;
              
              const isValidDate = (d) => !isNaN(new Date(d).getTime());
              const isExpired = expiryStr && isValidDate(expiryStr) && new Date(expiryStr).setHours(23, 59, 59, 999) < new Date().getTime();
              
              const hasDiscount = discount > 0 && original > discount && !isExpired;

              const mainPrice = hasDiscount ? discount : original;
              const hasVariants = product.variants && product.variants.length > 0;



              if (hasDiscount) {
                return (
                  <div className="flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[10px] text-gray-400 line-through font-bold opacity-60">
                      {original.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                    <span className="text-red-600 dark:text-red-500">
                      {discount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                );
              }

              if (mainPrice === 0 && hasVariants) {
                const variantPrices = product.variants.map(v => Number(v.price) || 0).filter(p => p > 0);
                const lowestVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
                if (lowestVariantPrice > 0) {
                  return (
                    <>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter align-middle">ab</span>
                      {lowestVariantPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-red-600">€</span>
                    </>
                  );
                }
              }
              return (
                <>
                  {mainPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-red-600">€</span>
                </>
              );
            })()}
          </span>
          <div className="flex text-yellow-500 dark:text-yellow-400 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xs">★</span>
            ))}
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-all duration-300 h-8 rounded-sm font-bold tracking-wider uppercase text-[10px]"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          In den Warenkorb
        </Button>
      </div>
    </Link>
  );
});

const Home = () => {
  const { products: storeProducts, categories: storeCategories, manufacturers: storeManufacturers, loading, addToCart, toggleFavorite, isFavorite, shopSettings, isDealer } = useStore();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('featured');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const hoverTimeoutRef = React.useRef(null);

  const handleCategoryHover = (catId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (catId === hoveredCategory) return;

    if (!catId) {
      // Small delay to catch diagonal movement
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredCategory(null);
      }, 200);
    } else {
      // Immediate switch for snappiness
      setHoveredCategory(catId);
    }
  };

  // Auto-advance slider every 5 seconds
  React.useEffect(() => {
    if (loading || isPaused) return; // Don't advance if loading or paused

    const interval = setInterval(() => {
      const slides = shopSettings?.sliderImages || sliderImages;
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [loading, isPaused]);

  const [showRetry, setShowRetry] = useState(false);

  React.useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowRetry(true), 12000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Use store data or fallback to mock for safety (during dev)
  // Ensure we only use real store data, no mock fallback for products
  const displayProducts = React.useMemo(() => (storeProducts || []).filter(p => p.is_active !== false), [storeProducts]);
  const displayCategories = React.useMemo(() => (storeCategories || []).filter(c => c.is_active !== false), [storeCategories]);

  const topProducts = React.useMemo(() => {
    return [...displayProducts]
      .sort((a, b) => {
        if (activeTab === 'latest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        // Default: sort by views (Featured)
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, 12);
  }, [displayProducts, activeTab]);

  const categoryProductSections = React.useMemo(() => {
    return displayCategories
      .filter(c => !c.parent_id)
      .map(category => {
        const getAllCategoryIds = (cat) => {
          let ids = [cat.id];
          if (cat.subcategories && cat.subcategories.length > 0) {
            cat.subcategories.forEach(sub => {
              ids = [...ids, ...getAllCategoryIds(sub)];
            });
          }
          return ids;
        };
        const catIds = getAllCategoryIds(category);
        const allCatProducts = displayProducts.filter(p => catIds.includes(p.category_id));
        const catProducts = [...allCatProducts]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 12);

        return { category, products: catProducts, totalCount: allCatProducts.length };
      })
      .filter(section => section.products.length > 0);
  }, [displayCategories, displayProducts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-500 animate-pulse font-medium">Daten werden geladen...</p>

        {showRetry && (
          <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <p className="text-sm text-gray-400 text-center max-w-xs">
              Das Laden dauert länger als gewöhnlich.
              Bitte prüfen Sie Ihre Internetverbindung oder laden Sie die Seite neu.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Seite neu laden
            </Button>
          </div>
        )}
      </div>
    );
  }

  const nextSlide = () => {
    const slides = shopSettings?.sliderImages || sliderImages;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    const slides = shopSettings?.sliderImages || sliderImages;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="bg-gray-50 dark:bg-[#050505] transition-colors duration-500 selection:bg-red-600 selection:text-white min-h-screen overflow-x-hidden w-full max-w-full">
      <SEO
        title="Premium E-Bikes & Zubehör"
        description="Entdecken Sie die Welt der hochwertigen E-Bikes, Komponenten und Zubehör bei Elifrad. Ihr zuverlässiger Partner für Elektromobilität."
        jsonLD={generateOrgJSONLD(window.location.origin)}
      />
      {/* Hero Section with Sidebar and Slider */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 relative">
          {/* Left Sidebar - Categories - Hidden on Mobile, Visible on Desktop */}
          <div className="hidden lg:block w-72 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm dark:shadow-2xl border border-gray-100 dark:border-white/5 h-fit sticky top-4 z-[50] overflow-hidden">
            <div className="py-4 overflow-visible">
              <ul className="space-y-1 text-sm">
                {displayCategories.filter(c => !c.parent_id).map((category) => (
                  <li
                    key={category.id}
                    onMouseEnter={() => { }} // Remove hover
                    onMouseLeave={() => { }} // Remove hover
                    className="relative px-3 py-0.5"
                  >
                    <div
                      role="button"
                      onClick={(e) => {
                        if (category.subcategories && category.subcategories.length > 0) {
                          e.preventDefault();
                          handleCategoryHover(hoveredCategory === category.id ? null : category.id);
                        } else {
                          navigate(`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors rounded-lg cursor-pointer ${hoveredCategory === category.id
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500'
                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                    >
                      <span className="flex items-center gap-3 pointer-events-none">
                        <CategoryIcon category={category} className="w-5 h-5 opacity-70" />
                        <span className="font-bold uppercase tracking-widest text-[11px]">{category.name}</span>
                      </span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${hoveredCategory === category.id ? 'rotate-90 text-red-600 dark:text-red-500' : 'text-gray-300 dark:text-white/20'}`} />
                      )}
                    </div>

                    {/* Safety Bridge - Always present when hovered to catch diagonal moves */}
                    {hoveredCategory === category.id && (
                      <div className="absolute top-0 -right-4 w-4 h-full bg-transparent z-[99]" />
                    )}

                    {/* Subcategory Flyout Panel */}
                    {hoveredCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                      <div className="absolute left-[calc(100%-10px)] top-0 w-80 bg-white dark:bg-[#0f0f0f] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 rounded-lg z-[100] min-h-[300px] p-6 pl-12 animate-in fade-in slide-in-from-left-2 duration-200">
                        {/* Invisible Bridge */}
                        <div className="absolute top-0 bottom-0 -left-12 w-12 bg-transparent z-10" />

                        <div className="flex items-center justify-between mb-6 border-b border-gray-50 dark:border-white/5 pb-4">
                          <h4 className="font-black text-gray-900 dark:text-white uppercase text-lg tracking-tighter shadow-sm">
                            {category.name}
                          </h4>
                          <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">
                            {category.subcategories.length}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {category.subcategories.map(sub => (
                            <Link
                              key={sub.id}
                              to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}/${sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-')}`}
                              className="group flex flex-col py-2 px-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors border-l-2 border-transparent hover:border-red-600"
                            >
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors uppercase tracking-tight">
                                {sub.name}
                              </span>
                              {sub.subcategories && sub.subcategories.length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                  {sub.subcategories.slice(0, 5).map(thirdLevel => (
                                    <Link
                                      key={thirdLevel.id}
                                      to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}/${sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-')}/${thirdLevel.slug || thirdLevel.name.toLowerCase().replace(/\s+/g, '-')}`}
                                      className="text-[9px] text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 font-bold uppercase tracking-tighter transition-colors"
                                    >
                                      {thirdLevel.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mobile Categories - Horizontal Scroll */}
          <div className="lg:hidden w-auto overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2">
              {displayCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-white/5 px-5 py-2.5 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 text-sm font-bold text-gray-800 dark:text-gray-300 whitespace-nowrap uppercase tracking-widest text-[10px]"
                >
                  <CategoryIcon category={category} className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Center - Hero Slider */}
          <div
            className="flex-1 relative h-[400px] sm:h-[500px] lg:h-[550px] bg-gradient-to-br from-gray-300 to-gray-400 dark:from-[#111] dark:to-[#050505] overflow-hidden rounded shadow-xl isolate z-0 transform-gpu"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative h-full">
              {(shopSettings?.sliderImages || sliderImages).map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                    }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                    <div className="px-6 md:px-16 w-full">
                      <div className="max-w-xl" key={`slide-content-${currentSlide}`}>
                        <p className="text-white/90 text-xs md:text-sm uppercase tracking-[0.2em] mb-2 md:mb-4 font-bold animate-[fadeInUp_0.6s_ease-out]">{slide.subtitle}</p>
                        <h2 className="text-white text-3xl md:text-5xl lg:text-7xl font-display font-extrabold mb-3 md:mb-6 leading-tight drop-shadow-lg animate-[fadeInUp_0.8s_ease-out_0.1s_both]">{slide.title}</h2>
                        <p className="hidden md:block text-white/90 text-sm md:text-lg mb-4 md:mb-8 leading-relaxed max-w-lg font-light animate-[fadeInUp_1s_ease-out_0.2s_both]">{slide.description}</p>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 md:px-10 md:py-6 text-sm md:text-base uppercase tracking-wider rounded-full shadow-xl transition-all hover:shadow-red-600/30 hover:scale-105 active:scale-95 animate-[fadeInUp_1.2s_ease-out_0.3s_both]"
                          onClick={() => {
                            if (slide.buttonLink) {
                              if (slide.buttonLink.startsWith('http')) {
                                window.open(slide.buttonLink, '_blank');
                              } else {
                                navigate(slide.buttonLink);
                              }
                            } else {
                              // Varsayılan: sayfayı ürünler bölümüne kaydır
                              const el = document.querySelector('.container');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              else navigate('/');
                            }
                          }}
                        >
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
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/30 p-2 rounded-full transition-all z-10 shadow-lg border border-white/20 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/30 p-2 rounded-full transition-all z-10 shadow-lg border border-white/20 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {(shopSettings?.sliderImages || sliderImages).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 shadow-sm ${index === currentSlide ? 'bg-red-600 w-6 md:w-8' : 'bg-white/60 w-1.5 md:w-2'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block w-72">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 dark:bg-[#050505] py-8 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(shopSettings?.services || services).map((service) => {
              const IconLib = require('lucide-react');
              const IconComponent = IconLib[service.icon] || IconLib.HelpCircle;
              return (
                <div key={service.id} className="bg-white dark:bg-[#0a0a0a] p-6 shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 border border-gray-100 dark:border-white/5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black flex items-center justify-center group-hover:border-red-600 dark:group-hover:border-red-500 transition-all duration-300 flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-gray-900 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm mb-1 uppercase tracking-wider leading-tight">{service.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-tight line-clamp-1">{service.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="container mx-auto px-4 pt-4 pb-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-4">
          <h2 className="text-3xl font-display font-black text-left text-gray-900 dark:text-white uppercase tracking-tighter">Spitzenprodukte</h2>
          <div className="flex gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest ${activeTab === 'featured'
                ? 'bg-red-600 dark:bg-red-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Vorgestellt
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest ${activeTab === 'latest'
                ? 'bg-red-600 dark:bg-red-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Neueste
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {topProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      {/* Category-Specific Product Sections */}
      {categoryProductSections.map(({ category, products: catProducts, totalCount }) => {
        const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');

        return (
          <div key={category.id} className="container mx-auto px-4 py-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-white/5 p-2.5 rounded-lg">
                  <CategoryIcon category={category} className="w-7 h-7 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-left text-gray-900 dark:text-white uppercase tracking-tighter">
                    {category.name}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    {totalCount} Produkte in dieser Kategorie
                  </p>
                </div>
              </div>
              <Link
                to={`/category/${categorySlug}`}
                className="group flex items-center gap-2 text-gray-900 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 font-black text-xs uppercase tracking-widest transition-all"
              >
                Alle ansehen
                <div className="bg-gray-900 dark:bg-white/10 group-hover:bg-red-600 dark:group-hover:bg-red-500 text-white p-1 rounded-full group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {catProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index + 20} />
              ))}
            </div>

          </div>
        );
      })}

      {/* Blog Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-4">
          <h2 className="text-2xl font-display font-bold text-left text-gray-900 dark:text-white uppercase tracking-tighter">Neuigkeiten</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(shopSettings?.blogPosts || blogPosts).map((post) => (
            <Card key={post.id} className="overflow-hidden group cursor-pointer hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-shadow bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-lg">
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">{post.date}</p>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-gray-500 font-medium">Von: {post.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Brands Section (Infinite Marquee - Aligned Container) */}
      <div className="bg-white dark:bg-[#050505] py-16 border-t border-gray-100 dark:border-white/5 overflow-hidden transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Unsere Marken</h2>
              <div className="w-20 h-1 bg-red-600 rounded-full mx-auto md:mx-0"></div>
            </div>
            <Link to="/marken" className="group flex items-center gap-2 text-gray-900 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 font-black text-xs uppercase tracking-widest transition-all">
              Alle Hersteller ansehen
              <div className="bg-gray-900 dark:bg-white/10 group-hover:bg-red-600 dark:group-hover:bg-red-500 text-white p-1 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>

          <div className="relative overflow-hidden">
            {/* Gradient Overlays for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10 pointer-events-none transition-colors"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10 pointer-events-none transition-colors"></div>

            <div className="flex animate-marquee gap-24 items-center">
              {(() => {
                const activeManufacturers = (storeManufacturers && storeManufacturers.length > 0)
                  ? storeManufacturers.filter(m => m.is_active !== false)
                  : brands;
                return Array(5).fill([...activeManufacturers]).flat().map((brand, idx) => (
                  <Link
                    key={`${brand.id}-${idx}`}
                    to={`/hersteller/${(brand.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`}
                    className="flex-shrink-0 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-105 cursor-pointer w-36"
                  >
                    <img
                      src={brand.logo_url || brand.logo}
                      alt={brand.name}
                      className="max-h-10 w-auto object-contain dark:filter dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.8)]"
                    />
                  </Link>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
