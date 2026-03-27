import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, Filter, Grid, List, Eye, GitCompare, Heart, ShoppingCart, Minus, Plus, Bike, Package, Zap, Settings, Shield, Cpu, Wrench, HelpCircle, Layers, Shirt, Home as HomeIcon, Palette, Activity } from 'lucide-react';
import { products, categories as mockCategories } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../components/ui/sheet";
import { useStore } from '../context/StoreContext';
import { productPath } from '../lib/productSlug';
import SEO from '../components/SEO';
import { generateBreadcrumbJSONLD } from '../lib/seoUtils';
import { getOptimizedImage, IMAGE_SIZES } from '../lib/imageOptimization';

// Category Icon Mapping Utility
const CategoryIcon = ({ category, className = "w-5 h-5 text-gray-400" }) => {
  const name = category?.name?.toLowerCase() || '';
  const icon = category?.icon;

  if (icon && typeof icon === 'string' && icon.length <= 4 && !['📁', '📂', '📄', '🗂️', '🏠'].includes(icon)) {
    return <span className="text-xl leading-none">{icon}</span>;
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

  return <Layers className={className} />;
};

const ProductCard = ({ product, addToCart, toggleFavorite, isFavorite, storeManufacturers, isDealer }) => {
  const [isHovered, setIsHovered] = useState(false);

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
  const imgSrc = isHovered && product.hoverImage
    ? product.hoverImage
    : (product.image || (productImages.length > 0 ? productImages[0] : (product.image_url || 'https://placehold.co/600x600?text=Gerät')));

  return (
    <Link
      to={productPath(product)}
      className="group relative bg-white dark:bg-[#0a0a0a] rounded-sm border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] block transform-gpu"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-square bg-white dark:bg-[#111] p-4 flex items-center justify-center">
        <img
          src={getOptimizedImage(imgSrc, IMAGE_SIZES.CARD)}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 transform-gpu"
          style={{ backfaceVisibility: 'hidden', perspective: '1000px' }}
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
            <div className="absolute top-2 left-2 z-30 bg-red-600 text-white font-black px-2 py-1 rounded-sm shadow-xl flex flex-row items-center gap-1.5 leading-none transform -rotate-1 transition-all duration-300 pointer-events-none group-hover:scale-105">
              {/* Inset Stitched Border */}
              <div className="absolute inset-0.5 border border-dashed border-white/20 rounded-sm pointer-events-none"></div>
              {/* Tag Hole */}
              <div className="w-1.5 h-1.5 rounded-full bg-black/30 shadow-inner border border-white/5 flex-shrink-0"></div>
              <span className="text-[6px] uppercase tracking-wider opacity-90 font-bold">Angebot</span>
              <span className="text-xs">%{percent}</span>
            </div>
          );
        })()}
        {product.badge && (
          <Badge
            className={`absolute top-2 left-2 ${product.badgeType === 'sale'
              ? 'bg-red-600'
              : product.badgeType === 'bundle'
                ? 'bg-blue-600'
                : 'bg-gray-800'
              } text-white text-xs px-2 py-1`}
          >
            {product.badge}
          </Badge>
        )}
        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product);
            }}
            className={`p-1.5 rounded-full transition-colors ${isFavorite(product.id)
              ? 'bg-red-600 text-white'
              : 'bg-white/90 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white/70 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white hover:border-transparent'
              }`}
          >
            <Heart className={`w-3 h-3 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white/70 p-1.5 rounded-full hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-colors"
          >
            <GitCompare className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white/70 p-1.5 rounded-full hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-colors"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="p-4">
        {(() => {
          const m = storeManufacturers?.find(m => m.id === product.manufacturer_id);
          return m ? (
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-0.5">{m.name}</p>
          ) : null;
        })()}
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 h-10 leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1 h-4">
          {product.description?.replace(/<[^>]*>?/gm, '')}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-black text-gray-900 dark:text-white flex items-baseline gap-1">
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
                    <span className="text-[9px] text-gray-400 line-through font-bold opacity-60">
                      {original.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                    <span className="text-red-600 dark:text-red-500 text-xl">
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
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter align-middle">ab</span>
                      {lowestVariantPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </>
                  );
                }
              }
              return (
                <>
                  {mainPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </>
              );
            })()}
          </span>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[10px]">★</span>
            ))}
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({ ...product, quantity: 1 });
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white transition-all text-xs font-bold h-9 uppercase tracking-wider active:scale-95"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          In den Warenkorb
        </Button>
      </div>
    </Link>
  );
};

const ProductListItem = ({ product, addToCart, isDealer }) => {
  const [quantity, setQuantity] = useState(1);

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

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-sm p-4 mb-4 flex flex-col md:flex-row gap-4 items-stretch group md:min-h-[180px] shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all">
      <Link to={productPath(product)} className="w-full md:w-52 h-40 md:h-full flex-shrink-0 bg-white dark:bg-[#111] rounded-sm p-2 border border-transparent group-hover:border-gray-100 dark:group-hover:border-white/10 transition-all flex items-center justify-center overflow-hidden relative">
        <img
          src={product.image || (productImages.length > 0 ? productImages[0] : (product.image_url || 'https://placehold.co/600x600?text=Gerät'))}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
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
            <div className="absolute top-2 left-2 z-30 bg-red-600 text-white font-black px-2 py-1 rounded-sm shadow-xl flex flex-row items-center gap-1.5 leading-none transform -rotate-1 transition-all duration-300 pointer-events-none group-hover:scale-105">
              {/* Inset Stitched Border */}
              <div className="absolute inset-0.5 border border-dashed border-white/20 rounded-sm pointer-events-none"></div>
              {/* Tag Hole */}
              <div className="w-1.5 h-1.5 rounded-full bg-black/30 shadow-inner border border-white/5 flex-shrink-0"></div>
              <span className="text-[6px] uppercase tracking-wider opacity-90 font-bold">Angebot</span>
              <span className="text-xs">%{percent}</span>
            </div>
          );
        })()}
      </Link>

      <div className="flex-1 flex flex-col justify-start py-1">
        <Link to={productPath(product)} className="block mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 uppercase">
          <span className="text-[11px] font-bold text-gray-400 font-mono tracking-tighter">Lieferzeit:</span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
            </span>
            <span className="text-gray-600">3-4 Werktage</span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-64 md:mr-8 flex flex-col justify-between items-end text-right gap-4 py-1">
        <div className="flex text-gray-200">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-xl">☆</span>
          ))}
        </div>

        <div>
          <div className="text-sm text-gray-500 font-medium mb-1">
            <span className="text-3xl font-black text-gray-900 dark:text-white flex items-baseline gap-2">
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
                    <div className="flex flex-col items-start leading-none gap-1">
                      <span className="text-sm text-gray-400 line-through font-bold opacity-60">
                        {original.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                      </span>
                      <span className="text-red-600 dark:text-red-500">
                        {discount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
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
                        <span className="text-base font-bold text-gray-400 uppercase tracking-tighter">ab</span>
                        {lowestVariantPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                      </>
                    );
                  }
                }
                return (
                  <>
                    {mainPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </>
                );
              })()}
            </span>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-tight">
            inkl. MwSt. zzgl. <span className="underline cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors">Versand</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/20 rounded overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Minus className="w-3 h-3 text-gray-400 dark:text-gray-500 stroke-[2px]" />
            </button>
            <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-transparent border-x border-gray-200 dark:border-white/20">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          <Button
            onClick={() => addToCart({ ...product, quantity })}
            className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white h-10 text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm transition-all active:scale-95 px-2"
          >
            In den Warenkorb
          </Button>
        </div>
      </div>
    </div>
  );
};

const FilterSidebar = ({
  navigationCategory,
  category,
  subcategoriesToDisplay,
  getCategoryPath,
  hasAnyFilter,
  resetAllFilters,
  availableManufacturers,
  selectedManufacturers,
  setSelectedManufacturers,
  categoryProducts,
  availableAttributeFilters,
  selectedAttributes,
  toggleAttributeValue,
  isMobile = false
}) => {
  // Helper to check if a product matches attribute filters (optionally skipping one label)
  const matchesAttrs = (product, skipLabel = null) => {
    for (const [label, values] of Object.entries(selectedAttributes)) {
      if (label === skipLabel) continue;
      const pAttrs = Array.isArray(product.attributes) ? [...product.attributes] : [];
      if (product.art && product.art.trim()) pAttrs.push({ label: 'Art', value: product.art.trim() });
      const hasValue = pAttrs.some(a => a.label?.trim() === label && values.has(a.value?.trim()));
      if (!hasValue) return false;
    }
    return true;
  };

  // Helper to check if a product matches manufacturer filter
  const matchesBrands = (product) => {
    return selectedManufacturers.length === 0 || selectedManufacturers.includes(product.manufacturer_id);
  };

  return (
  <div className={`w-full bg-white dark:bg-[#0a0a0a] ${isMobile ? 'p-0' : 'rounded-md p-6 shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-transparent dark:border-white/5'} h-fit transition-colors`}>
    {/* Subcategories/Siblings Section */}
    {navigationCategory && navigationCategory.subcategories && navigationCategory.subcategories.length > 0 && (
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
        <Link
          to={getCategoryPath(navigationCategory)}
          className="block font-black text-gray-900 dark:text-white mb-4 hover:text-red-600 dark:hover:text-red-500 transition-colors uppercase tracking-tighter text-lg"
        >
          {navigationCategory.name}
        </Link>
        <ul className="space-y-1">
          {subcategoriesToDisplay.map((subcat) => (
            <li key={subcat.id}>
              <Link
                to={getCategoryPath(subcat)}
                className={`w-full text-left px-3 py-2 text-sm rounded-sm transition-colors flex items-center justify-between group ${category.id === subcat.id
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 font-bold'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-white'
                  }`}
              >
                <span>{subcat.name}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-white ${category.id === subcat.id ? 'text-red-600 dark:text-red-500' : ''}`} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Filtern nach</h3>
      {hasAnyFilter && (
        <button
          onClick={resetAllFilters}
          className="text-[10px] font-black uppercase text-red-600 hover:text-red-700 transition-colors"
        >
          Zurücksetzen
        </button>
      )}
    </div>

    {/* Brand Filter */}
    {availableManufacturers.length > 0 && (
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
        <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Marke</h4>
        <div className="space-y-3">
          {availableManufacturers.map(m => {
            // Count for this manufacturer: Matches ALL ATTRIBUTES
            const count = categoryProducts.filter(p => 
              p.manufacturer_id === m.id && matchesAttrs(p)
            ).length;

            return (
              <label key={m.id} className={`flex items-center group cursor-pointer ${count === 0 && !selectedManufacturers.includes(m.id) ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-4 h-4 border border-gray-300 dark:border-white/20 rounded checked:bg-red-600 checked:border-red-600 transition-all"
                    checked={selectedManufacturers.includes(m.id)}
                    onChange={() => {
                      setSelectedManufacturers(prev =>
                        prev.includes(m.id)
                          ? prev.filter(id => id !== m.id)
                          : [...prev, m.id]
                      );
                    }}
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={`ml-3 text-sm transition-colors ${selectedManufacturers.includes(m.id) ? 'text-red-600 dark:text-red-500 font-bold' : 'text-gray-700 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-500'}`}>
                  {m.name}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-600">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>
    )}

    {/* Attribute Filters — dynamically built from product attributes */}
    {Object.entries(availableAttributeFilters).map(([label, values]) => (
      <div key={label} className="mb-5 pb-5 border-b border-gray-200 dark:border-white/10 last:border-0 last:mb-0 last:pb-0">
        <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          {label}
        </h4>
        <div className="space-y-2.5">
          {values.map(value => {
            const isChecked = selectedAttributes[label]?.has(value) || false;
            
            // Count for this value: Matches SELECTED BRANDS + OTHER ATTRIBUTES
            const count = categoryProducts.filter(p => {
              // 1. Match Brands
              if (!matchesBrands(p)) return false;
              
              // 2. Match OTHER Attributes
              if (!matchesAttrs(p, label)) return false;
              
              // 3. Match THIS Attribute Value
              const pAttrs = Array.isArray(p.attributes) ? [...p.attributes] : [];
              if (p.art && p.art.trim()) pAttrs.push({ label: 'Art', value: p.art.trim() });
              return pAttrs.some(a => a.label?.trim() === label && a.value?.trim() === value);
            }).length;

            return (
              <label key={value} className={`flex items-center group cursor-pointer ${count === 0 && !isChecked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-4 h-4 border border-gray-300 dark:border-white/20 rounded checked:bg-red-600 checked:border-red-600 transition-all"
                    checked={isChecked}
                    onChange={() => toggleAttributeValue(label, value)}
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={`ml-3 text-sm transition-colors ${isChecked
                  ? 'text-red-600 dark:text-red-500 font-bold'
                  : 'text-gray-700 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-500'
                  }`}>
                  {value}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-600">({count})</span>
              </label>
            );
          })}
        </div>
      </div>
    ))}
  </div>
  );
};


const CategoryPage = () => {
  const { products: storeProducts, categories: storeCategories, manufacturers: storeManufacturers, flatCategories, loading: storeLoading, addToCart, toggleFavorite, isFavorite, isDealer } = useStore();
  const { "*": categoryPath } = useParams();
  const navigate = useNavigate();
  // Pagination State - Managed via URL Search Params
  const [searchParams, setSearchParams] = useSearchParams();
  const PRODUCTS_PER_PAGE = 70;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Initialize filters from URL Search Params
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'relevance');
  const [selectedManufacturers, setSelectedManufacturers] = useState(() => {
    const brands = searchParams.get('brands');
    return brands ? brands.split(',').filter(Boolean) : [];
  });
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    const attrs = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('a_')) {
        const label = key.replace('a_', '');
        attrs[label] = new Set(value.split(',').filter(Boolean));
      }
    });
    return attrs;
  });
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  
  const isInitialMount = useRef(true);

  const setCurrentPage = (val) => {
    const nextVal = typeof val === 'function' ? val(currentPage) : val;
    const newParams = new URLSearchParams(searchParams);
    if (nextVal <= 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', nextVal);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Target the specific category or subcategory from URL
  const pathSegments = categoryPath ? categoryPath.split('/').filter(Boolean) : [];
  const targetCategorySlug = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;

  // Sync URL back to State (Handle manual URL changes or navigation between categories)
  useEffect(() => {
    // 1. Manufacturers
    const brands = searchParams.get('brands');
    const brandsArray = brands ? brands.split(',').filter(Boolean) : [];
    if (JSON.stringify(brandsArray) !== JSON.stringify(selectedManufacturers)) {
      setSelectedManufacturers(brandsArray);
    }

    // 2. Attributes (a_ prefix)
    const urlAttrs = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('a_')) {
        const label = key.replace('a_', '');
        urlAttrs[label] = value.split(',').filter(Boolean);
      }
    });

    const currentAttrKeys = Object.keys(selectedAttributes);
    const urlAttrKeys = Object.keys(urlAttrs);
    let attrsChanged = currentAttrKeys.length !== urlAttrKeys.length;
    
    if (!attrsChanged) {
      for (const label of urlAttrKeys) {
        const urlVals = [...urlAttrs[label]].sort().join(',');
        const currentVals = Array.from(selectedAttributes[label] || []).sort().join(',');
        if (urlVals !== currentVals) {
          attrsChanged = true;
          break;
        }
      }
    }

    if (attrsChanged) {
      const nextAttrs = {};
      Object.entries(urlAttrs).forEach(([label, vals]) => {
        nextAttrs[label] = new Set(vals);
      });
      setSelectedAttributes(nextAttrs);
    }

    // 3. Sort
    const sort = searchParams.get('sort') || 'relevance';
    if (sort !== sortBy) {
      setSortBy(sort);
    }
  }, [searchParams]);

  // Use flatCategories for more reliable lookup
  const category = flatCategories.find(c =>
    c.slug === targetCategorySlug ||
    c.name?.toLowerCase().replace(/\s+/g, '-') === targetCategorySlug ||
    c.id.toString() === targetCategorySlug
  );


  // Sync state back to URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Sort
    if (sortBy && sortBy !== 'relevance') newParams.set('sort', sortBy);
    else newParams.delete('sort');

    // Brands
    if (selectedManufacturers.length > 0) newParams.set('brands', selectedManufacturers.join(','));
    else newParams.delete('brands');

    // Attributes (using a_ prefix to keep URL shorter)
    [...newParams.keys()].forEach(key => {
      if (key.startsWith('a_')) newParams.delete(key);
    });
    Object.entries(selectedAttributes).forEach(([label, values]) => {
      if (values && values.size > 0) {
        newParams.set(`a_${label}`, Array.from(values).join(','));
      }
    });

    // Reset page if filters change (except on initial load)
    if (!isInitialMount.current) {
      newParams.delete('page');
    }

    setSearchParams(newParams, { replace: true });
  }, [selectedManufacturers, selectedAttributes, sortBy]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, [category?.id, selectedManufacturers, selectedAttributes, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Kategorie nicht gefunden</h2>
        <p className="text-gray-600 mb-6">Die gesuchte Kategorie existiert nicht oder wurde entfernt.</p>
        <Link to="/" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors">
          Zur Startseite
        </Link>
      </div>
    );
  }

  // Use store data or fallback to mock
  const displayProducts = (storeProducts && storeProducts.length > 0 ? storeProducts : products).filter(p => p.is_active !== false);
  const displayCategories = (storeCategories && storeCategories.length > 0 ? storeCategories : mockCategories).filter(c => c.is_active !== false);

  const getCategoryPath = (cat) => {
    if (!cat) return '/';
    const path = [];
    let current = cat;
    let safetyCounter = 0;
    while (current && safetyCounter < 10) {
      safetyCounter++;
      const slug = current.slug || (current.name ? current.name.toLowerCase().replace(/\s+/g, '-') : 'kategorie');
      path.unshift(slug);
      if (current.parent_id && current.parent_id !== current.id) {
        current = flatCategories.find(c => c.id === current.parent_id);
      } else break;
    }
    return `/category/${path.join('/')}`;
  };

  const parentCategory = (category && category.parent_id)
    ? flatCategories.find(c => c.id === category.parent_id)
    : null;

  const breadcrumbPath = (() => {
    const path = [];
    let current = category;
    let safetyCounter = 0;
    while (current && current.parent_id && safetyCounter < 10) {
      safetyCounter++;
      const parent = flatCategories.find(c => c.id === current.parent_id);
      if (parent && parent.id !== current.id) {
        path.unshift(parent);
        current = parent;
      } else break;
    }
    return path;
  })();

  // Find the tree-version of the navigation category (the one with .subcategories populated)
  const findInTree = (cats, id, depth = 0) => {
    if (!cats || depth > 10) return null;
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.subcategories && cat.subcategories.length > 0) {
        const found = findInTree(cat.subcategories, id, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const categoryInTree = category ? findInTree(displayCategories, category.id) : null;
  const rootCategory = breadcrumbPath.length > 0 ? breadcrumbPath[0] : category;
  const rootInTree = findInTree(displayCategories, rootCategory.id);

  const navigationCategory = (categoryInTree && categoryInTree.subcategories && categoryInTree.subcategories.length > 0)
    ? categoryInTree
    : rootInTree;

  const subcategoriesToDisplay = (() => {
    const currentHasChildren = categoryInTree && categoryInTree.subcategories && categoryInTree.subcategories.length > 0;
    if (!currentHasChildren && navigationCategory && navigationCategory.id !== category.id) {
      const displayList = [];
      let reachedNav = false;
      for (const p of breadcrumbPath) {
        if (reachedNav) displayList.push(p);
        if (p.id === navigationCategory.id) reachedNav = true;
      }
      if (displayList.length === 0 && breadcrumbPath.length > 0) {
        const lastParent = breadcrumbPath[breadcrumbPath.length - 1];
        if (lastParent.id !== navigationCategory.id) displayList.push(lastParent);
      }
      displayList.push(category);
      return displayList;
    }
    return navigationCategory?.subcategories || [];
  })();

  // Filter products by category or ANY of its subcategories (Recursive)
  const getSubcategoryIds = (cat, depth = 0) => {
    if (!cat || depth > 10) return [];
    let ids = [cat.id];
    // Find this category in the tree to get its children
    const treeItem = findInTree(displayCategories, cat.id);
    if (treeItem && treeItem.subcategories) {
      treeItem.subcategories.forEach(sub => {
        ids = [...ids, ...getSubcategoryIds(sub, depth + 1)];
      });
    }
    return ids;
  };

  const categoryIds = category ? getSubcategoryIds(category) : [];

  const categoryProducts = displayProducts.filter(product => {
    const pCatIds = Array.isArray(product.category_ids) && product.category_ids.length > 0 
      ? product.category_ids 
      : (product.category_id ? [product.category_id] : []);
    const isInRecursiveCategory = pCatIds.some(id => categoryIds.includes(id));
    const matchesLegacyName = product.category?.toLowerCase() === category?.name?.toLowerCase();
    return isInRecursiveCategory || matchesLegacyName;
  });

  // Get available manufacturers for this category (for the filter UI)
  const availableManufacturers = Array.from(new Set(categoryProducts.map(p => p.manufacturer_id)))
    .map(id => storeManufacturers?.find(m => m.id === id))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Build attribute filter groups from all products in the category
  // Result: { 'Rahmen': ['Aluminium', 'Carbon', ...], 'Motor': ['Bosch', 'Shimano', ...] }
  const availableAttributeFilters = (() => {
    const groups = {};
    categoryProducts.forEach(product => {
      const attrs = Array.isArray(product.attributes) ? product.attributes : [];
      // Combine manual attributes with the top-level 'art' field if it exists
      const allAttrs = [...attrs];
      if (product.art && product.art.trim()) {
        allAttrs.push({ label: 'Art', value: product.art.trim() });
      }

      allAttrs.forEach(attr => {
        if (!attr.label || !attr.value) return;
        const label = attr.label.trim();
        const value = attr.value.trim();
        if (!label || !value) return;
        if (!groups[label]) groups[label] = new Set();
        groups[label].add(value);
      });
    });
    // Convert Sets to sorted arrays
    return Object.fromEntries(
      Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, [...v].sort()])
    );
  })();

  const hasAnyAttributeFilter = Object.values(selectedAttributes).some(vals => vals && vals.size > 0);
  const hasAnyFilter = selectedManufacturers.length > 0 || hasAnyAttributeFilter;

  const toggleAttributeValue = (label, value) => {
    setSelectedAttributes(prev => {
      const next = { ...prev };
      if (!next[label]) next[label] = new Set();
      else next[label] = new Set(next[label]);
      if (next[label].has(value)) next[label].delete(value);
      else next[label].add(value);
      if (next[label].size === 0) delete next[label];
      return next;
    });
  };

  const resetAllFilters = () => {
    setSelectedManufacturers([]);
    setSelectedAttributes({});
  };

  // Apply filters
  const filteredProducts = categoryProducts.filter(product => {
    const matchesManufacturer = selectedManufacturers.length === 0 || selectedManufacturers.includes(product.manufacturer_id);
    if (!matchesManufacturer) return false;

    // Attribute filter — every selected label must match at least one value in product
    for (const [label, values] of Object.entries(selectedAttributes)) {
      if (!values || values.size === 0) continue;

      const productAttrs = Array.isArray(product.attributes) ? [...product.attributes] : [];
      if (product.art && product.art.trim()) {
        productAttrs.push({ label: 'Art', value: product.art.trim() });
      }

      const match = productAttrs.some(a =>
        a.label?.trim() === label && values.has(a.value?.trim())
      );
      if (!match) return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return (b.views || 0) - (a.views || 0);
  });

  // Calculate Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const isTeileZubehoer = category.name === 'Teile & Zubehör' || targetCategorySlug === 'teile-zubehoer' || targetCategorySlug === 'teile-zubehr';

  return (
    <div className="bg-gray-50 dark:bg-[#050505] min-h-screen transition-colors duration-500">
      <SEO
        title={category?.name}
        description={category?.description?.replace(/<[^>]*>?/gm, '').slice(0, 160)}
        jsonLD={generateBreadcrumbJSONLD([
          { name: 'Startseite', item: window.location.origin },
          ...breadcrumbPath.map(p => ({ name: p.name, item: window.location.origin + getCategoryPath(p) })),
          { name: (category?.name || 'Kategorie'), item: window.location.href }
        ])}
      />
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Startseite</Link>
            <span>/</span>
            {breadcrumbPath.map(p => (
              <React.Fragment key={p.id}>
                <Link
                  to={getCategoryPath(p)}
                  className="hover:text-red-600 dark:hover:text-red-500 transition-colors"
                >
                  {p.name}
                </Link>
                <span>/</span>
              </React.Fragment>
            ))}
            <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
          </div>
        </div>
      </div>


      {/* Category Banner (Contained) */}
      {(category.banner_url || isTeileZubehoer) && (
        <div className="container mx-auto px-4 mt-6">
          <div className="w-full h-32 md:h-48 lg:h-[280px] overflow-hidden relative rounded-md shadow-xl border border-gray-100 dark:border-white/5 group">
            <img
              src={category.banner_url || (isTeileZubehoer ? '/assets/teile_zubehoer_banner.png' : null)}
              alt={`${category.name} Banner`}
              className="w-full h-full object-cover transition-all duration-500"
              style={{ objectPosition: category.banner_position ? (category.banner_position.includes(' ') ? category.banner_position : `center ${category.banner_position}`) : 'center' }}
            />
            {!category.banner_url && isTeileZubehoer && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end pointer-events-none">
                <div className="p-8">
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                    TEILE & ZUBEHÖR
                  </h1>
                </div>
              </div>
            )}
            {category.banner_url && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                <div className="p-8">
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                    {category.name}
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Header Info */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {!category.banner_url && (
              <div className="w-48 h-48 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-md flex items-center justify-center text-6xl overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 relative flex-shrink-0">
                {category.image_url ? (
                  <img src={category.image_url} alt={category.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="opacity-20 flex items-center justify-center">
                    <CategoryIcon category={category} className="w-24 h-24 text-gray-900 dark:text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-red-600/5 transition-opacity" />
              </div>
            )}
            <div className={`flex-1 ${!category.banner_url ? 'pt-4' : ''} text-center md:text-left`}>
              {!category.banner_url && (
                <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4 border-l-4 border-red-600 pl-4">{category.name}</h1>
              )}
              <div
                className="prose prose-red text-gray-600 dark:text-gray-400 max-w-3xl mt-4"
                dangerouslySetInnerHTML={{ __html: category.description || `Entdecken Sie unsere ${category.name} Kollektion mit Qualitätsprodukten zu tollen Preisen.` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 pb-32">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <FilterSidebar
              navigationCategory={navigationCategory}
              category={category}
              subcategoriesToDisplay={subcategoriesToDisplay}
              getCategoryPath={getCategoryPath}
              hasAnyFilter={hasAnyFilter}
              resetAllFilters={resetAllFilters}
              availableManufacturers={availableManufacturers}
              selectedManufacturers={selectedManufacturers}
              setSelectedManufacturers={setSelectedManufacturers}
              categoryProducts={categoryProducts}
              availableAttributeFilters={availableAttributeFilters}
              selectedAttributes={selectedAttributes}
              toggleAttributeValue={toggleAttributeValue}
            />
          </div>

          {/* Mobile Filter Drawer */}
          <Sheet open={isFilterMobileOpen} onOpenChange={setIsFilterMobileOpen}>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 overflow-y-auto bg-white dark:bg-[#0a0a0a] border-r-gray-100 dark:border-r-white/5">
              <SheetHeader className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <SheetTitle className="text-left font-black uppercase tracking-tighter flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter
                </SheetTitle>
              </SheetHeader>
              <div className="p-6">
                <FilterSidebar
                  navigationCategory={navigationCategory}
                  category={category}
                  subcategoriesToDisplay={subcategoriesToDisplay}
                  getCategoryPath={getCategoryPath}
                  hasAnyFilter={hasAnyFilter}
                  resetAllFilters={resetAllFilters}
                  availableManufacturers={availableManufacturers}
                  selectedManufacturers={selectedManufacturers}
                  setSelectedManufacturers={setSelectedManufacturers}
                  categoryProducts={categoryProducts}
                  availableAttributeFilters={availableAttributeFilters}
                  selectedAttributes={selectedAttributes}
                  toggleAttributeValue={toggleAttributeValue}
                  isMobile={true}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex-1">
            {/* Subcategories Grid (Image Style) */}
            {categoryInTree && categoryInTree.subcategories && categoryInTree.subcategories.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6 pb-2 border-b-2 border-red-600 dark:border-red-500 inline-block">
                  {category.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {categoryInTree.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={getCategoryPath(sub)}
                      className="group bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-sm overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-lg dark:hover:shadow-[0_0_50px_rgba(0,0,0,0.7)] hover:border-red-600 dark:hover:border-red-500 transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="h-48 md:h-56 bg-white dark:bg-[#111] flex items-center justify-center p-6 relative overflow-hidden">
                        {sub.image_url ? (
                          <img
                            src={sub.image_url}
                            alt={sub.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 transform-gpu"
                            style={{ backfaceVisibility: 'hidden' }}
                          />
                        ) : (
                          <div className="opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500 transform-gpu flex items-center justify-center">
                            <CategoryIcon category={sub} className="w-16 h-16" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-transparent" />
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 p-4 text-center border-t border-gray-100 dark:border-white/10 transition-all duration-300">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                          {sub.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-transparent dark:border-white/5 p-4 rounded-md shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {filteredProducts.length} Artikel
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFilterMobileOpen(true)}
                      className="lg:hidden flex items-center gap-2 dark:border-white/20 dark:text-white dark:hover:bg-white/10 shadow-sm px-3"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                      {hasAnyFilter && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>}
                    </Button>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg md:hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#111] shadow-sm text-red-600 dark:text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#111] shadow-sm text-red-600 dark:text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <span className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest whitespace-nowrap">Sortieren:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 dark:border-white/20 rounded-md px-2 py-1.5 text-xs sm:text-sm bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 outline-none w-full min-w-[120px]"
                    >
                      <option value="relevance">Relevanz</option>
                      <option value="price-asc">Preis ↑</option>
                      <option value="price-desc">Preis ↓</option>
                      <option value="name-asc">A-Z</option>
                      <option value="name-desc">Z-A</option>
                    </select>
                  </div>

                  <div className="hidden md:flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#111] shadow-sm text-red-600 dark:text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#111] shadow-sm text-red-600 dark:text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Display */}
            <div id="products-grid" className={`grid gap-3 md:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
              {currentProducts.map((product) => (
                viewMode === 'grid' ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    toggleFavorite={toggleFavorite}
                    isFavorite={isFavorite}
                    storeManufacturers={storeManufacturers}
                    isDealer={isDealer}
                  />
                ) : (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    isDealer={isDealer}
                  />
                )
              ))}
            </div>


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4 mt-12 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-6 rounded-md shadow-sm">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                  }}
                  disabled={currentPage === 1}
                  className="w-10 h-10 border-gray-200 dark:border-white/10 dark:hover:bg-white/5 disabled:opacity-50"
                  aria-label="Vorherige Seite"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex gap-1 overflow-x-auto max-w-[60vw] sm:max-w-max pb-2 sm:pb-0 scrollbar-hide px-2 items-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => {
                            setCurrentPage(pageNum);
                          }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 font-bold ${
                            currentPage === pageNum 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                              : 'bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === currentPage - 3 || 
                      pageNum === currentPage + 3
                    ) {
                      return <span key={pageNum} className="px-2 text-gray-400 font-bold">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 border-gray-200 dark:border-white/10 dark:hover:bg-white/5 disabled:opacity-50"
                  aria-label="Nächste Seite"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs uppercase tracking-widest font-black text-gray-400 mt-2">
                Seite <span className="text-red-600">{currentPage}</span> von {totalPages}
              </p>
            </div>
          )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CategoryPage;