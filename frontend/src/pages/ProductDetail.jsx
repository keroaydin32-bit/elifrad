import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, GitCompare, Minus, Plus, Star, Tag, Globe, MapPin, Truck, ShieldCheck, Share2, ArrowLeftRight, ChevronRight, Home, CreditCard, ChevronLeft, Landmark, X, ExternalLink, CheckCircle, MessageSquare, FileText } from 'lucide-react';
import { products } from '../data/mockData';
import { findProductBySlug, productPath } from '../lib/productSlug';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { generateProductJSONLD } from '../lib/seoUtils';
import { getOptimizedImage, IMAGE_SIZES } from '../lib/imageOptimization';
import { trackEvent } from '../lib/analytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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

// Global cache for reviews (memory)
const reviewsCache = {};
// Load cache from localStorage on startup if available
const loadReviewsCache = () => {
  try {
    const saved = localStorage.getItem('product_reviews_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up old cache entries (older than 24h)
      const now = Date.now();
      const cleanCache = {};
      Object.keys(parsed).forEach(id => {
        if (now - (parsed[id].timestamp || 0) < 24 * 60 * 60 * 1000) {
          cleanCache[id] = parsed[id];
        }
      });
      return cleanCache;
    }
  } catch (e) { }
  return {};
};
const persistentReviewsCache = loadReviewsCache();

const ProductDetail = () => {
  const { products: storeProducts, categories: storeCategories, manufacturers: storeManufacturers, flatCategories, loading, addToCart, toggleFavorite, isFavorite, isDealer, shopSettings, customer } = useStore();
  const { slug } = useParams();
  const navigate = useNavigate();

  // 1. Core Logic (Calculated before hooks if they depend on them)
  const displayProducts = useMemo(() => {
    return storeProducts && storeProducts.length > 0 ? storeProducts : products;
  }, [storeProducts]);

  const product = useMemo(() => {
    return findProductBySlug(slug, displayProducts) ||
      displayProducts.find(p => p.id?.toString() === slug && p.is_active !== false);
  }, [slug, displayProducts]);

  const id = product?.id;
  const manufacturer = useMemo(() => {
    return product ? (product.manufacturers || storeManufacturers.find(m => m.id === product.manufacturer_id)) : null;
  }, [product, storeManufacturers]);

  // 2. States
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [manualImageOverride, setManualImageOverride] = useState(null);
  const [reviews, setReviews] = useState(() => {
    if (reviewsCache[id]) return reviewsCache[id];
    if (persistentReviewsCache[id]) return persistentReviewsCache[id].data;
    return [];
  });
  const [reviewsLoading, setReviewsLoading] = useState(!reviewsCache[id] && !persistentReviewsCache[id]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFetchCount, setReviewFetchCount] = useState(0);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // 3. Effects & Derived Data
  useEffect(() => {
    setManualImageOverride(null);
  }, [selectedVariant?.id, selectedVariant?.name]);

  useEffect(() => {
    if (product) {
      trackEvent('view_item', {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        currency: 'EUR'
      });
    }
  }, [product?.id]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 5.0;
    const totalReviewScore = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return parseFloat((totalReviewScore / reviews.length).toFixed(1));
  }, [reviews]);

  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    return [...displayProducts]
      .filter(p => p.category_id === product?.category_id && p.id !== product?.id && p.is_active !== false)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [displayProducts, product, product?.id, product?.category_id]);


  // Optimized PayPal Script Loading
  React.useEffect(() => {
    if (!shopSettings?.paypalClientId) return;

    // Check if script already exists to avoid duplication
    const scriptId = 'paypal-sdk-script';
    const existingScript = document.getElementById(scriptId);

    const initializeScript = () => {
      if (window.paypal) {
        setScriptLoaded(true);
      } else {
        // Wait for it if it's currently loading
        const checker = setInterval(() => {
          if (window.paypal) {
            setScriptLoaded(true);
            clearInterval(checker);
          }
        }, 100);
        setTimeout(() => clearInterval(checker), 5000); // Fail safe
      }
    };

    if (existingScript) {
      // If script exists, we check if it matches the current client-id
      if (existingScript.getAttribute('data-client-id') !== shopSettings.paypalClientId) {
        existingScript.remove();
        setScriptLoaded(false);
      } else {
        initializeScript();
        return;
      }
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.setAttribute('data-client-id', shopSettings.paypalClientId);
    script.src = `https://www.paypal.com/sdk/js?client-id=${shopSettings.paypalClientId}&currency=EUR&components=buttons,messages&enable-funding=paylater`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = initializeScript;
    script.onerror = () => {
      console.error("❌ Failed to load PayPal SDK");
      if (isMountedRef.current) setScriptLoaded(false);
    };
    document.body.appendChild(script);
  }, [shopSettings?.paypalClientId]);

  // Initialize PayPal Buttons (Express) - Debounced to prevent 'Script error' on rapid clicks
  useEffect(() => {
    let activeRendering = true;
    let buttonsInstance = null;
    let debounceTimer = null;

    const performRender = () => {
      if (!activeRendering || !window.paypal || !shopSettings?.paypalClientId || !product) return;

      const container = document.getElementById('product-paypal-button');
      if (container) {
        container.innerHTML = ''; // Clear
        try {
          buttonsInstance = window.paypal.Buttons({
            style: {
              layout: 'horizontal',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 48
            },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: (product.price * quantity).toFixed(2),
                    currency_code: 'EUR'
                  },
                  description: `${product.name} (x${quantity}) - ${shopSettings?.shopName || 'Electrive'}`
                }]
              });
            },
            onApprove: async (data, actions) => {
              addToCart(product, quantity);
              navigate('/cart');
            },
            onError: (err) => {
              console.error('PayPal Product Error:', err);
            }
          });

          if (buttonsInstance.isEligible()) {
            buttonsInstance.render('#product-paypal-button').catch(err => {
              if (activeRendering) console.warn('PayPal render suppressed or failed:', err);
            });
          }

          // Explicitly render Pay Later messages if container exists
          if (window.paypal.Messages) {
            window.paypal.Messages({
              amount: (product.price * quantity).toFixed(2),
              style: {
                layout: 'text',
                logo: { type: 'primary' },
                text: { color: 'black' }
              }
            }).render('[data-pp-message]').catch(() => { });
          }
        } catch (e) {
          console.error("PayPal render error:", e);
        }
      }
    };

    if (scriptLoaded && window.paypal && shopSettings?.paypalClientId && product) {
      // Small debounce to avoid hammering PayPal SDK
      debounceTimer = setTimeout(performRender, 300);
    }

    return () => {
      activeRendering = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (buttonsInstance && buttonsInstance.close) {
        buttonsInstance.close().catch(() => { });
      }
    };
  }, [scriptLoaded, product?.id, quantity, shopSettings?.paypalClientId]);

  // Reviews: fetch logic with persistent cache
  useEffect(() => {
    let isMounted = true;
    let loadingTimeout = null;
    
    // 1. Determine initial state from caches
    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const validId = isUUID(id);
    const cachedData = reviewsCache[id] || (persistentReviewsCache[id]?.data);
    
    if (cachedData) {
      setReviews(cachedData);
      setReviewsLoading(false);
    } else if (validId) {
      setReviewsLoading(true);
      // Wait up to 12s (Reduced from 30s) before giving up
      loadingTimeout = setTimeout(() => {
        if (isMounted) {
          setReviewsLoading(false);
          console.log("🕒 [REVIEWS] Loading indicator hidden due to threshold delay (bg load continues)");
        }
      }, 12000);
    } else {
      setReviewsLoading(false);
    }

    const controller = new AbortController();

    const fetchReviews = async () => {
      // ONLY fetch if we have a valid UUID to avoid redundant mock data calls
      if (!validId || !supabase) {
        if (isMounted) setReviewsLoading(false);
        return;
      }

      console.time(`🔍 [REVIEWS_FETCH] ${id}`);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, rating, comment, created_at, product_id,
            customers ( first_name, last_name )
          `)
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;
        if (error) {
          console.error("❌ [REVIEWS] Supabase error:", error.message, error.details);
          throw error;
        }

        const processedReviews = (data || []).map(rev => ({
          ...rev,
          customerData: Array.isArray(rev.customers) ? rev.customers[0] : rev.customers,
        }));

        // Memory Cache
        reviewsCache[id] = processedReviews;

        // Persistent Cache
        setTimeout(() => {
          try {
            persistentReviewsCache[id] = { timestamp: Date.now(), data: processedReviews };
            localStorage.setItem('product_reviews_cache', JSON.stringify(persistentReviewsCache));
          } catch (e) { }
        }, 0);

        setReviews(processedReviews);
        console.timeEnd(`🔍 [REVIEWS_FETCH] ${id}`);
        console.log(`✅ [REVIEWS] Successfully loaded ${processedReviews.length} reviews`);
      } catch (err) {
        console.error(`⚠️ [REVIEWS] Fetch failed for ${id}:`, err);
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
          if (loadingTimeout) clearTimeout(loadingTimeout);
        }
      }
    };

    if (validId) {
      fetchReviews();
    }
    
    return () => { 
      isMounted = false; 
      controller.abort();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [id]);

  // Track Views - Recording product impressions
  React.useEffect(() => {
    if (!product?.id) return;

    const trackView = async () => {
      try {
        await supabase
          .from('products')
          .update({ views: (product.views || 0) + 1 })
          .eq('id', product.id);
      } catch (err) {
        console.error("Error tracking view:", err);
      }
    };

    const timer = setTimeout(trackView, 1500);
    return () => clearTimeout(timer);
  }, [product?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!customer) {
      toast.error("Bitte melden Sie sich an, um eine Bewertung abzugeben.");
      return;
    }
    if (userRating === 0) {
      toast.error("Bitte vergeben Sie eine Sternewertung.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const targetCustomerId = isUUID(customer.auth_id) ? customer.auth_id : (isUUID(customer.id) ? customer.id : null);

      if (!targetCustomerId) {
        throw new Error("Ihre Identität konnte nicht verifiziert werden.");
      }

      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        customer_id: targetCustomerId,
        rating: userRating,
        comment: userComment
      });

      if (error) throw error;

      toast.success("Bewertung erfolgreich gesendet!");
      setUserComment('');
      setUserRating(0);

      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      setReviews(data || []);

    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(`Fehler: ${error.message || 'Die Bewertung konnte nicht gespeichert werden.'}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error("Bitte wählen Sie eine Variante aus.");
      return;
    }

    // Track Add to Cart
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      price: selectedVariant?.price || product.price,
      currency: 'EUR',
      quantity: quantity,
      variant: selectedVariant?.name || 'standard'
    });

    addToCart(product, quantity, selectedVariant);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };

  const isFav = product ? isFavorite(product.id) : false;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-7xl">
        <h2 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h2>
        <Link to="/" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors">
          Zur Startseite
        </Link>
      </div>
    );
  }

  // Determine the set of images to use for the gallery
  const productImages = parseImages(product?.images);
  const mainImage = product.image || (productImages.length > 0 ? productImages[0] : (product.image_url || 'https://placehold.co/600x600?text=Gerät'));
  const baseImages = productImages.length > 0 ? productImages : [mainImage];

  // If a variant is selected and it has images, use ONLY the variant's images.
  // Otherwise, use the base product images.
  let images = baseImages;
  if (selectedVariant?.images && selectedVariant.images.length > 0) {
    images = selectedVariant.images;
  } else if (selectedVariant?.image) {
    images = [selectedVariant.image];
  }

  // Ensure selectedImage index is valid when switching between image sets
  const safeSelectedIndex = selectedImage < images.length ? selectedImage : 0;

  // Logic to determine which image to show as the main display
  // If manual override is set (thumbnail clicked), use it. 
  // Otherwise use the current index from the active image set.
  const currentDisplayImage = manualImageOverride || images[safeSelectedIndex];





  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#050505] transition-colors duration-500 min-h-screen overflow-x-hidden">
      <SEO
        title={product?.name}
        description={product?.description?.replace(/<[^>]*>?/gm, '').slice(0, 160)}
        image={product?.image}
        type="product"
        jsonLD={generateProductJSONLD(product, window.location.origin, manufacturer)}
      />
      {/* Dynamic Breadcrumb */}
      <div className="hidden sm:block border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <nav className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-1">
              <Home className="w-2.5 h-2.5" />
              Startseite
            </Link>
            {(() => {
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

              const fullCategoryPath = [];
              let currentCat = flatCategories.find(c => c.id === product.category_id);
              let safetyCounter2 = 0;
              while (currentCat && safetyCounter2 < 10) {
                safetyCounter2++;
                fullCategoryPath.unshift(currentCat);
                if (currentCat.parent_id && currentCat.parent_id !== currentCat.id) {
                  currentCat = flatCategories.find(c => c.id === currentCat.parent_id);
                } else break;
              }

              return (
                <>
                  {fullCategoryPath.map((p, idx) => (
                    <React.Fragment key={p.id}>
                      <ChevronRight className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600" />
                      <Link
                        to={getCategoryPath(p)}
                        className="hover:text-red-600 dark:hover:text-red-500 transition-colors"
                      >
                        {p.name}
                      </Link>
                    </React.Fragment>
                  ))}
                </>
              );
            })()}
            <ChevronRight className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600" />
            <span className="text-gray-700 dark:text-gray-300 font-bold">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl">
        {/* Product Details Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 space-y-4 relative">
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
                <div className="absolute top-4 left-4 z-30 bg-red-600 text-white font-black px-3 py-1.5 rounded-sm shadow-xl flex flex-row items-center gap-2 leading-none transform -rotate-2 hover:rotate-0 transition-all duration-500 pointer-events-none group-hover:scale-105">
                  {/* Inset Stitched Border */}
                  <div className="absolute inset-0.5 border border-dashed border-white/30 rounded-sm pointer-events-none"></div>
                  
                  {/* Tag Hole (Left side) */}
                  <div className="w-2 h-2 rounded-full bg-black/40 shadow-inner border border-white/5 flex-shrink-0"></div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] uppercase tracking-[0.1em] opacity-90 font-bold">Angebot</span>
                    <span className="text-sm">%{percent}</span>
                  </div>
                </div>
              );
            })()}
            <div className="relative group">
              <div
                className="bg-white dark:bg-[#0a0a0a] rounded-lg overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 h-[300px] sm:h-[400px] lg:h-[450px] flex items-center justify-center cursor-pointer hover:opacity-95 transition-all p-4 sm:p-6"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={getOptimizedImage(currentDisplayImage, IMAGE_SIZES.PREVIEW)}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain select-none"
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIdx = selectedImage > 0 ? selectedImage - 1 : images.length - 1;
                      setSelectedImage(nextIdx);
                      setManualImageOverride(images[nextIdx]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white flex items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 border border-gray-200 dark:border-white/10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIdx = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
                      setSelectedImage(nextIdx);
                      setManualImageOverride(images[nextIdx]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white flex items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 border border-gray-200 dark:border-white/10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {product.badge && (
                <div className="absolute top-6 left-6 animate-fade-in">
                  <Badge
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${product.badgeType === 'sale' ? 'bg-red-600' :
                      product.badgeType === 'bundle' ? 'bg-blue-600' : 'bg-black'
                      } text-white border-none`}
                  >
                    {product.badge}
                  </Badge>
                </div>
              )}

              <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={handleToggleFavorite}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-lg backdrop-blur-md transition-all hover:scale-110 ${isFav ? 'bg-red-600 text-white border-red-500' : 'bg-white/90 dark:bg-black/50 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white/70 hover:text-red-600 dark:hover:text-red-500'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>
                <button className="w-9 h-9 rounded-full border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/50 text-gray-900 dark:text-white/70 flex items-center justify-center shadow-lg backdrop-blur-md hover:text-red-600 dark:hover:text-red-500 hover:scale-110 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setManualImageOverride(img);
                    }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all p-1 sm:p-2 bg-white dark:bg-[#111] snap-start ${currentDisplayImage === img ? 'border-red-600 ring-2 sm:ring-4 ring-red-50 dark:ring-red-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-white/30 shadow-sm'
                      }`}
                  >
                    <img src={getOptimizedImage(img, IMAGE_SIZES.THUMBNAIL)} className="w-full h-full object-contain" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Config & Purchase (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg px-4 py-6 sm:px-8 sm:py-10 shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-[#111] rounded-bl-[5rem] -z-0 opacity-50 transition-colors"></div>

              <div className="relative z-10 space-y-6">
                <div
                  className="-mx-4 sm:-mx-8 -mt-6 sm:-mt-10 mb-6 overflow-hidden border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] relative h-[60px] sm:h-[80px] group shadow-inner cursor-pointer"
                  onClick={() => {
                    const name = manufacturer?.name;
                    if (!name) return;
                    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    navigate(`/hersteller/${slug}`);
                  }}
                >
                  {manufacturer && (manufacturer.banner_url || manufacturer.logo_url) ? (
                    <>
                      <img
                        src={manufacturer.banner_url || manufacturer.logo_url}
                        alt={manufacturer.name || ''}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{ objectPosition: manufacturer.banner_position || '50% 50%' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity group-hover:from-black/70">
                        <span className="absolute bottom-3 left-6 text-white text-base font-black uppercase tracking-[0.1em] drop-shadow-lg opacity-90 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                          {manufacturer.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#111]">
                      <span className="text-xs font-bold uppercase tracking-widest text-red-600">
                        {manufacturer?.name || product.categories?.name || product.category || ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tighter">
                    {product.name}
                  </h1>
                  <div className="h-[1px] bg-gray-100 dark:bg-white/10 w-full my-4"></div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white/80 w-24">Art.Nr.:</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                        {(selectedVariant && selectedVariant.sku) ? selectedVariant.sku : (product.sku || '2123974')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white/80 w-24">Lieferzeit:</span>
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4ab866] shadow-[0_0_10px_#4ab866]"></span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">{product.delivery_time || 'ca. 3-4 Tage'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {reviewsLoading ? (
                            <div className="flex gap-1 opacity-20">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-gray-200" />
                              ))}
                            </div>
                          ) : (
                            (() => {
                              const rounded = Math.round(averageRating || 0);
                              return [...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < rounded ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                />
                              ));
                            })()
                          )}
                        </div>
                        {!reviewsLoading && (
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-xs font-bold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 uppercase tracking-wider"
                      >
                        {reviewsLoading && reviews.length === 0
                          ? 'Wird geladen...'
                          : `${reviews?.length || 0} Bewertungen`}
                      </button>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-100 dark:bg-white/10 w-full my-4"></div>
                </div>
              </div>

              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 pt-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {(() => {
                        if (product.variant_title) {
                          return `${product.variant_title} wählen:`;
                        }
                        // Extract all unique labels from all variants' attributes
                        const labels = new Set();
                        product.variants.forEach(v => {
                          if (v.attributes && Array.isArray(v.attributes)) {
                            v.attributes.forEach(attr => {
                              if (attr.label) labels.add(attr.label);
                            });
                          }
                        });

                        if (labels.size > 0) {
                          return `${Array.from(labels).join(', ')} wählen:`;
                        }
                        return "Variante wählen:";
                      })()}
                    </span>
                  </div>
                  <Select
                    value={selectedVariant?.name || "none"}
                    onValueChange={(val) => {
                      if (val === "none") {
                        setSelectedVariant(null);
                      } else {
                        const v = product.variants.find(v => v.name === val);
                        setSelectedVariant(v);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-12 bg-white dark:bg-black/40 border-gray-100 dark:border-white/10 rounded-none text-sm font-bold shadow-sm transition-all focus:ring-0 focus:outline-none">
                      <SelectValue placeholder="Bitte wählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111] border-gray-100 dark:border-white/10 rounded-none">
                      <SelectItem value="none" className="py-3 text-gray-400 italic cursor-pointer">
                        Bitte wählen...
                      </SelectItem>
                      {product.variants.map((v, i) => (
                        <SelectItem
                          key={i}
                          value={v.name}
                          className="py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                        >
                          <div className="flex justify-between items-center w-full gap-4">
                            <span className="font-bold text-gray-900 dark:text-gray-200">{v.name}</span>
                            {(() => {
                              const dealerPrice = (v.dealer_price && Number(v.dealer_price) > 0) ? Number(v.dealer_price) : null;
                              const retailPrice = Number(v.price);

                              if (isDealer && dealerPrice) {
                                return (
                                  <div className="flex flex-col items-end">
                                    <span className="text-red-600 dark:text-red-500 font-black text-xs">
                                      {dealerPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold">
                                      {retailPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </span>
                                  </div>
                                );
                              }

                              const displayPrice = dealerPrice || retailPrice;
                              if (displayPrice > 0) {
                                return (
                                  <span className="text-red-600 dark:text-red-500 font-black text-xs">
                                    {displayPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-4">
                  {/* Horizontal Layout: Quantity + Price */}
                  <div className="flex items-center justify-between w-full gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-0 border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden h-12 w-fit bg-gray-50 dark:bg-black/50 shrink-0">
                      <button
                        onClick={decrementQuantity}
                        className="w-12 h-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 border-r border-gray-200 dark:border-white/20 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-900 dark:text-white stroke-[2px]" />
                      </button>
                      <div className="w-12 h-full flex items-center justify-center text-base font-bold text-gray-900 dark:text-white">
                        {quantity}
                      </div>
                      <button
                        onClick={incrementQuantity}
                        className="w-12 h-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 border-l border-gray-200 dark:border-white/20 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-900 dark:text-white stroke-[2px]" />
                      </button>
                    </div>

                    <div className="flex flex-col items-end text-right space-y-1">
                      <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-baseline justify-end gap-2 text-right">
                        {(() => {
                          const original = Number(product.price) || 0;
                          const discount = Number(product.discount_price) || 0;
                          const expiryStr = product.discount_expiry;
                          
                          const isValidDate = (d) => !isNaN(new Date(d).getTime());
                          const isExpired = expiryStr && isValidDate(expiryStr) && new Date(expiryStr).setHours(23, 59, 59, 999) < new Date().getTime();
                          
                          const hasDiscount = discount > 0 && original > discount && !isExpired;
                          
                          const mainPrice = hasDiscount ? discount : original;
                          const hasVariants = product.variants && product.variants.length > 0;

                          if (hasDiscount && !selectedVariant) {
                            if (isDealer) {
                              const dPrice = (product.dealer_price && Number(product.dealer_price) > 0) ? Number(product.dealer_price) : null;
                              if (dPrice) {
                                return (
                                  <div className="flex flex-col items-end">
                                    <div className="flex items-baseline justify-end gap-2">
                                      <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Händler</span>
                                      <span>{dPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                    </div>
                                    <div className="flex flex-col items-end opacity-60">
                                      <span className="text-sm text-gray-400 font-bold line-through">UVP: {original.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                      <span className="text-xs text-red-500 font-black italic">Angebot: {discount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                    </div>
                                  </div>
                                );
                              }
                            }
                            return (
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-400 line-through font-bold opacity-60">
                                  {original.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                                </span>
                                <span className="text-red-600 dark:text-red-500 text-3xl sm:text-4xl animate-pulse-subtle">
                                  {discount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                                </span>
                              </div>
                            );
                          }

                          if (selectedVariant) {
                            const dPrice = (selectedVariant.dealer_price && Number(selectedVariant.dealer_price) > 0) ? Number(selectedVariant.dealer_price) : null;
                            const rPrice = Number(selectedVariant.price) || mainPrice;

                            if (isDealer && dPrice) {
                              return (
                                <div className="flex flex-col items-end">
                                  <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Händler</span>
                                    <span>{dPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                  </div>
                                  <span className="text-sm text-gray-400 font-bold">UVP: {rPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                </div>
                              );
                            }

                            const displayPrice = dPrice || rPrice;
                            return (
                              <span>
                                {displayPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                              </span>
                            );
                          }

                          if (mainPrice === 0 && hasVariants) {
                            const variantData = product.variants.map(v => {
                              const d = (isDealer && v.dealer_price && Number(v.dealer_price) > 0) ? Number(v.dealer_price) : null;
                              const r = Number(v.price) || 0;
                              return { dealer: d, retail: r, effective: d || r };
                            }).filter(v => v.effective > 0);

                            const lowestEffective = variantData.length > 0 ? Math.min(...variantData.map(v => v.effective)) : 0;
                            const relatedRetail = variantData.find(v => v.effective === lowestEffective)?.retail || 0;

                            if (lowestEffective > 0) {
                              return (
                                <div className="flex flex-col items-end text-right">
                                  <div className="flex items-baseline justify-end gap-2">
                                    {isDealer && relatedRetail > lowestEffective && (
                                      <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Händler</span>
                                    )}
                                    <span className="text-xl sm:text-2xl text-gray-400 font-bold uppercase tracking-tighter">ab</span>
                                    <span>{lowestEffective.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                  </div>
                                  {isDealer && relatedRetail > lowestEffective && (
                                    <span className="text-sm text-gray-400 font-bold">UVP ab: {relatedRetail.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                  )}
                                </div>
                              );
                            }
                          }

                          if (isDealer && product._retail_price && Number(product._retail_price) > mainPrice) {
                            return (
                              <div className="flex flex-col items-end">
                                <div className="flex items-baseline justify-end gap-2">
                                  <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Händler</span>
                                  <span>{mainPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                                </div>
                                <span className="text-sm text-gray-400 font-bold">UVP: {Number(product._retail_price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
                              </div>
                            );
                          }

                          return (
                            <span>
                              {mainPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                        inkl. 19% MwSt. zzgl. <button onClick={() => setIsShippingModalOpen(true)} className="underline hover:text-red-600 dark:hover:text-red-500">Versand</button>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="h-11 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white text-sm font-black tracking-widest rounded-sm uppercase flex items-center justify-center transition-all"
                  >
                    IN DEN WARENKORB
                  </Button>

                  <div className="pt-4 flex flex-col items-center gap-4">

                    <div className="w-full relative z-0">
                      <div id="product-paypal-button" className="min-h-[48px] overflow-hidden rounded-sm"></div>
                      {!scriptLoaded && (
                        <div
                          onClick={() => {
                            addToCart(product, quantity);
                            navigate('/cart');
                          }}
                          className="w-full h-12 bg-[#ffc439] rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#f2ba34] transition-colors shadow-sm overflow-hidden active:scale-[0.98]"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                        </div>
                      )}
                    </div>
                    <div className="w-full px-2 py-1">
                      {scriptLoaded ? (
                        <div
                          data-pp-message
                          data-pp-style-layout="text"
                          data-pp-style-logo-type="primary"
                          data-pp-style-text-color="black"
                          data-pp-amount={(product.price * quantity).toFixed(2)}
                        ></div>
                      ) : (
                        <div className="flex items-start gap-3 w-full">
                          <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal Icon" className="w-8 mt-1" />
                          <p className="text-[13px] text-gray-800 dark:text-gray-300 leading-snug">
                            <span className="font-bold text-[#003087] dark:text-[#3b7bbf]">PayPal</span> Bezahlen Sie in monatlichen Raten.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="w-full pt-2">
                      {product.price >= 200 && product.price <= 10000 && (
                        <div className="rounded-lg overflow-hidden border border-orange-50 bg-orange-50/10">
                          <easycredit-widget
                            key={`${shopSettings?.easyCreditWebshopId}-${shopSettings?.easyCreditToken}`}
                            webshop-id={shopSettings?.easyCreditWebshopId || '1.DE.11728.1'}
                            access-token={shopSettings?.easyCreditToken || ''}
                            amount={product.price}
                          ></easycredit-widget>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Section */}
        <div className="mt-12 sm:mt-20 space-y-12 overflow-x-hidden w-full">
          {/* 1. Full Width Description */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-8 sm:p-12 shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight">
              Beschreibung
            </h3>
            {(() => {
              const vd = selectedVariant?.description?.trim();
              const isVDEmpty = !vd || vd === '<p><br></p>' || vd === '<p></p>' || vd === '<p>&nbsp;</p>';
              return (
                <div
                  className="prose prose-red dark:prose-invert max-w-none text-gray-500 dark:text-gray-300 leading-[1.8] text-sm font-medium product-description-area overflow-x-hidden"
                  dangerouslySetInnerHTML={{ __html: !isVDEmpty ? vd : product.description }}
                />
              );
            })()}
          </div>

          {/* 2. Attributes / Merkmale Section */}
          {((product.attributes && Array.isArray(product.attributes) && product.attributes.filter(a => a.label && a.label.trim()).length > 0)) && (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-8 sm:p-12 shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight">
                Technische Daten
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">

                {(product.attributes || []).filter(a => a.label && a.label.trim()).map((attr, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5 last:border-0 md:last:border-b">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{attr.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10 sm:mt-16">
          {/* Left Column: Manufacturer Details (Span 4) */}
          <div className="lg:col-span-4">
            {manufacturer && (
              <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-8 shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 h-full">
                {manufacturer.logo_url && (
                  <div className="mb-10 pb-10 flex justify-center border-b border-gray-100 dark:border-white/10">
                    <img src={manufacturer.logo_url} alt={manufacturer.name} className="h-32 w-auto object-contain dark:brightness-200" />
                  </div>
                )}

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                      {manufacturer?.name || 'Hersteller'}
                    </p>
                    <p className="text-gray-900 dark:text-white font-bold text-sm leading-relaxed">
                      {manufacturer?.address || ''}<br />
                      {manufacturer?.zip_code || ''} {manufacturer?.city || ''}<br />
                      {manufacturer?.country || ''}
                    </p>
                  </div>

                  {manufacturer.description && (
                    <div
                      className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10 text-xs italic text-gray-500 dark:text-gray-400 font-medium relative prose prose-sm dark:prose-invert max-w-none product-description-area"
                      dangerouslySetInnerHTML={{ __html: manufacturer.description }}
                    >
                    </div>
                  )}

                  {manufacturer.website && (
                    <button
                      onClick={() => window.open(manufacturer.website.startsWith('http') ? manufacturer.website : `https://${manufacturer.website}`, '_blank')}
                      className="w-full bg-gray-900 dark:bg-white/10 text-white dark:text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-600 dark:hover:bg-red-500 flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Hersteller Website
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const name = manufacturer?.name;
                      if (!name) return;
                      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                      navigate(`/hersteller/${slug}`);
                    }}
                    className="w-full bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/50 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    Alle Produkte anzeigen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reviews (Span 8) */}
          <div className="lg:col-span-8" id="reviews-section">
            <div className="space-y-8 mb-12">
              {reviewsLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Lade Bewertungen...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50/50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-gray-400 font-medium italic">Noch keine Bewertungen vorhanden. Seien Sie der Erste!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-white/5 pb-8 last:border-0 last:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center font-bold text-gray-400 uppercase">
                          {review.customerData?.first_name ? review.customerData.first_name.slice(0, 2) : 'Gast'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {review.customerData?.first_name
                              ? `${review.customerData.first_name}${review.customerData.last_name ? ` ${review.customerData.last_name.slice(0, 1)}.` : ''}`
                              : 'Gast'}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            Verifizierter Käufer
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString('de-DE') : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic text-base">
                      "{review.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Write Review Section - Now inside the right column under reviews */}
            <div className="mt-16 pt-12 border-t border-gray-100 dark:border-white/5" id="write-review-form">
              <h4 className="font-black tracking-tighter text-gray-900 dark:text-white mb-8 uppercase text-2xl">
                Bewertung schreiben
              </h4>

              {!customer ? (
                <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-8 text-center border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Bitte melden Sie sich an, um eine Bewertung abzugeben.</p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg shadow-lg shadow-red-600/20 font-bold uppercase tracking-widest text-xs h-12 px-10"
                  >
                    Anmelden / Registrieren
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="max-w-4xl">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Ihre Bewertung:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none transition-all hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-white/10 hover:text-yellow-400 dark:hover:text-yellow-400'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-8">
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Teilen Sie Ihre Erfahrungen mit diesem Produkt..."
                      className="w-full p-6 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 focus:border-red-600 dark:focus:border-red-500 focus:ring-1 focus:ring-red-600 dark:focus:ring-red-500/50 transition-all text-base font-medium min-h-[180px] placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-start">
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-10 h-14 rounded-lg transition-all hover:-translate-y-1 active:translate-y-0"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Senden...
                        </>
                      ) : 'Bewertung senden'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 mb-16 sm:mb-24 container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter text-center">
              Das könnte Ihnen auch gefallen
            </h2>
            <div className="w-12 h-1 bg-red-600 mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct.id}
                to={productPath(relProduct)}
                className="group bg-white dark:bg-[#0a0a0a] rounded-sm overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all duration-300 block p-5 shadow-sm"
              >
                <div className="relative aspect-square rounded-sm overflow-hidden mb-5 bg-white dark:bg-[#111] p-5">
                  <img
                    src={(() => {
                      const relImages = parseImages(relProduct.images);
                      return relProduct.image || (relImages.length > 0 ? relImages[0] : (relProduct.image_url || 'https://placehold.co/600x600?text=Gerät'));
                    })()}
                    alt={relProduct.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                  {relProduct.badge && (
                    <Badge className="absolute top-4 left-4 bg-red-600 text-white text-[11px] uppercase font-black px-3 py-1 border-none rounded-none">
                      {relProduct.badge}
                    </Badge>
                  )}
                </div>
                <div className="px-1 pb-2 flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                      {relProduct.manufacturers?.name || storeManufacturers?.find(m => m.id === relProduct.manufacturer_id)?.name || 'Hersteller'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white line-clamp-2 h-10 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors uppercase tracking-tight leading-tight">
                      {relProduct.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                      {(relProduct.price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </p>
                    <div className="flex items-center gap-[2px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(relProduct, 1);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-all text-[11px] font-black h-11 uppercase tracking-widest rounded-none"
                    size="sm"
                  >
                    IN DEN WARENKORB
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setIsLightboxOpen(false)}>
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-[10001] text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextIdx = selectedImage > 0 ? selectedImage - 1 : images.length - 1;
              setSelectedImage(nextIdx);
              setManualImageOverride(images[nextIdx]);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden sm:flex"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedImage < images.length ? selectedImage : 0]}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain select-none shadow-2xl"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextIdx = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
              setSelectedImage(nextIdx);
              setManualImageOverride(images[nextIdx]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden sm:flex"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Mobile Bottom Navigation */}
          <div className="absolute bottom-10 left-0 right-0 z-[10001] flex justify-center gap-12 sm:hidden px-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = selectedImage > 0 ? selectedImage - 1 : images.length - 1;
                setSelectedImage(nextIdx);
                setManualImageOverride(images[nextIdx]);
              }}
              className="p-4 rounded-full bg-white/10 text-white active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <p className="text-white font-bold self-center text-sm">{selectedImage + 1} / {images.length}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
                setSelectedImage(nextIdx);
                setManualImageOverride(images[nextIdx]);
              }}
              className="p-4 rounded-full bg-white/10 text-white active:scale-90 transition-transform"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Shipping Costs Modal */}
      <Dialog open={isShippingModalOpen} onOpenChange={setIsShippingModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg bg-white dark:bg-[#0a0a0a] dark:text-white border-gray-200 dark:border-white/10 border p-6 z-[99999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600" />
              Versandkosten
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Hier finden Sie eine Übersicht unserer Versandkosten nach Ländern. Ab einem Bestellwert von 49 € ist der Versand innerhalb Deutschlands kostenlos.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-4 bg-blue-800 rounded-sm"></span>
                  Deutschland
                </span>
                <span className="font-mono font-bold text-red-600">5,99 €</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                  Österreich
                </span>
                <span className="font-mono font-bold">12,90 €</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-4 bg-red-600 rounded-sm"></span>
                  Schweiz
                </span>
                <span className="font-mono font-bold">19,90 €</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-4 bg-blue-600 rounded-sm"></span>
                  Frankreich
                </span>
                <span className="font-mono font-bold">14,90 €</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-4 bg-yellow-400 rounded-sm"></span>
                  Benelux
                </span>
                <span className="font-mono font-bold">12,90 €</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  Restliches Europa
                </span>
                <span className="font-mono font-bold">24,90 €</span>
              </div>
            </div>
            <p className="mt-6 text-[10px] text-gray-400 italic">
              * Lieferungen in Nicht-EU-Länder können zusätzliche Zölle, Steuern ve Gebühren verursachen.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ProductDetail;
