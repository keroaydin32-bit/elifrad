import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { safeSet, safeGet } from '../lib/storage';

const StoreContext = createContext();

export const useStore = () => {
    return useContext(StoreContext);
};

export const StoreProvider = ({ children }) => {
    // 1. Core State
    const [rawProducts, setProducts] = useState(() => safeGet('cached_products') || []);
    const [categories, setCategories] = useState(() => safeGet('cached_categories') || []);
    const [flatCategories, setFlatCategories] = useState(() => safeGet('cached_flat_categories') || []);
    const [manufacturers, setManufacturers] = useState(() => safeGet('cached_manufacturers') || []);

    const [customer, setCustomer] = useState(() => safeGet('cached_last_profile'));

    const [shippingRates, setShippingRates] = useState(() => safeGet('cached_shipping_rates') || []);

    const [loading, setLoading] = useState(true);
    const [authResolved, setAuthResolved] = useState(() => {
        return !!safeGet('cached_last_profile');
    });
    const [dataLoading, setDataLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const isFetchingInitial = useRef(false);

    const isDealer = customer?.customer_group === 'Händler';

    const products = useMemo(() => {
        if (!isDealer) return rawProducts;
        return rawProducts.map(p => {
            if (p.dealer_price && Number(p.dealer_price) > 0) {
                return {
                    ...p,
                    _retail_price: p.price,
                    price: Number(p.dealer_price)
                };
            }
            return p;
        });
    }, [rawProducts, isDealer]);

    // Cart and favorites are user-scoped: stored as 'cart_<authId>' in localStorage
    // to prevent data leakage between different user accounts.
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const [deliveryTimePresets, setDeliveryTimePresets] = useState(() => {
        return safeGet('deliveryTimePresets') || ['ca. 1-3 Tage', 'ca. 3-4 Tage', 'ca. 1-2 Wochen', '14 KW', 'Auf Anfrage'];
    });

    const [defaultDeliveryTime, setDefaultDeliveryTimeState] = useState(() => {
        return localStorage.getItem('defaultDeliveryTime') || 'ca. 3-4 Tage';
    });

    const [taxRatePresets, setTaxRatePresets] = useState(() => {
        return safeGet('taxRatePresets') || ['19', '7', '0'];
    });

    const [defaultTaxRate, setDefaultTaxRateState] = useState(() => {
        return localStorage.getItem('defaultTaxRate') || '19';
    });

    const [shopSettings, setShopSettings] = useState(() => {
        const saved = localStorage.getItem('shopSettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // fall through to default
            }
        }
        return {
            shopName: 'Electrive GmbH',
            primaryColor: '#dc2626',
            sliderImages: [],
            services: []
        };
    });

    // 0. Online Presence Tracking
    const sessionId = useMemo(() => {
        let sid = localStorage.getItem('visitor_session_id');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            safeSet('visitor_session_id', sid);
        }
        return sid;
    }, []);

    const updatePresence = useCallback(async () => {
        if (!supabase) return;

        try {
            const currentPath = window.location.pathname + window.location.search;
            const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartPreview = cart.map(item => ({
                id: item.id,
                name: item.name,
                qty: item.quantity,
                price: item.price
            }));

            // We use a simple fetch to get IP if possible, or skip it
            let ip = 'Unknown';
            try {
                // Using a small delay to not block initial load
                const ipRes = await fetch('https://api.ipify.org?format=json').then(res => res.json());
                ip = ipRes.ip;
            } catch (e) { /* ignore ip fetch errors */ }

            if (isSyncing || syncInProgressRef.current) return; // Don't run presence if we are saving important settings
            
            await supabase.from('online_presence').upsert({
                session_id: sessionId,
                user_id: customer?.auth_id || null,
                user_name: customer?.name || 'Guest',
                ip_address: ip,
                last_url: currentPath,
                last_activity: new Date().toISOString(),
                cart_items_count: cartCount,
                cart_data: cartPreview,
                user_agent: navigator.userAgent
            }, { onConflict: 'session_id' });
        } catch (err) {
            // Silently fail presence updates
        }
    }, [sessionId, customer, cart, isSyncing]);

    useEffect(() => {
        // Update presence on mount and whenever dependencies change
        updatePresence();

        // Periodic update every 30 seconds
        const interval = setInterval(updatePresence, 30000);
        return () => clearInterval(interval);
    }, [updatePresence]);

    // 1. Initial Data Fetching

    const fetchInitialData = useCallback(async (force = false) => {
        if (!supabase) {
            setDataLoading(false);
            return;
        }

        if (isFetchingInitial.current && !force) return;

        const safetyTimeoutId = setTimeout(() => {
            setDataLoading(false);
            isFetchingInitial.current = false;
        }, 30000);

        try {
            isFetchingInitial.current = true;
            console.log("🚀 [STORE] Background Data Fetch Initializing (Delayed)...");

            // STAGGER: Wait 100ms to let individual page component fetches (like reviews) 
            // register their requests first in the browser queue.
            await new Promise(resolve => setTimeout(resolve, 100));

            const rawSupabaseFetch = async (table, select = '*', order = '', retries = 3) => {
                const baseUrl = "https://hhnrosczgggxelnbrhlk.supabase.co";
                const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s";
                if (!baseUrl) return [];

                let url = `${baseUrl}/rest/v1/${table}?select=${select}`;
                if (order) url += `&order=${order}`;

                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url, {
                            headers: { 
                                'apikey': anonKey, 
                                'Authorization': `Bearer ${anonKey}`, 
                                'Content-Type': 'application/json',
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            },
                            cache: 'no-store' // Extensively Bypasses browser cache
                        });
                        if (!response.ok) throw new Error(`HTTP_${response.status}`);
                        return await response.json();
                    } catch (err) {
                        if (i === retries - 1) throw err;
                        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                    }
                }
                return [];
            };

            const results = await Promise.allSettled([
                rawSupabaseFetch('categories', '*', 'sort_order.asc'),
                rawSupabaseFetch('manufacturers', '*', 'name.asc'),
                rawSupabaseFetch('products'),
                rawSupabaseFetch('shop_settings'),
                rawSupabaseFetch('shipping_rates', '*', 'country_name.asc'),
                rawSupabaseFetch('product_category_relations')
            ]);

            // Process Categories
            if (results[0].status === 'fulfilled') {
                const catData = results[0].value;
                const categoriesMap = {};
                const rootCategories = [];
                catData.forEach(cat => { categoriesMap[cat.id] = { ...cat, subcategories: [] }; });
                catData.forEach(cat => {
                    if (cat.parent_id && categoriesMap[cat.parent_id]) {
                        categoriesMap[cat.parent_id].subcategories.push(categoriesMap[cat.id]);
                    }
                });
                catData.forEach(cat => { if (!cat.parent_id) rootCategories.push(categoriesMap[cat.id]); });
                setCategories(rootCategories);
                setFlatCategories(catData);
                safeSet('cached_categories', rootCategories);
                safeSet('cached_flat_categories', catData);
            }

            // Manufacturers - ALWAYS use network first, cache second
            if (results[1].status === 'fulfilled') {
                // Ensure array shape and validate data exists
                const newManus = Array.isArray(results[1].value) ? results[1].value : [];
                setManufacturers(newManus);
                safeSet('cached_manufacturers', newManus);
            }

            // Products
            if (results[2].status === 'fulfilled') {
                let prods = results[2].value;
                if (results[5] && results[5].status === 'fulfilled') {
                    const relations = results[5].value;
                    prods = prods.map(p => ({
                        ...p,
                        category_ids: relations
                            .filter(r => r.product_id === p.id)
                            .map(r => r.category_id)
                    }));
                } else {
                    // Fallback to single category_id if relations fail
                    prods = prods.map(p => ({
                        ...p,
                        category_ids: p.category_id ? [p.category_id] : []
                    }));
                }
                setProducts(prods);
                // Cache a LITE version (without heavy description/html) to avoid localStorage quota issues
                const liteProds = prods.map(({ description, ...rest }) => rest);
                safeSet('cached_products', liteProds);
            }

            // Shop Settings
            if (results[3].status === 'fulfilled') {
                const s = results[3].value?.[0]?.settings;
                if (s) {
                    setShopSettings(s);
                    safeSet('shopSettings', s);
                }
            }

            // Shipping Rates
            if (results[4].status === 'fulfilled') {
                setShippingRates(results[4].value);
                safeSet('cached_shipping_rates', results[4].value);
            }
        } catch (error) {
            console.error('❌ [STORE] Fetch Error:', error);
        } finally {
            clearTimeout(safetyTimeoutId);
            setDataLoading(false);
            isFetchingInitial.current = false;
        }
    }, []);

    const addDeliveryTimePreset = useCallback((preset) => {
        setDeliveryTimePresets(prev => {
            const updated = [...prev, preset];
            safeSet('deliveryTimePresets', updated);
            return updated;
        });
    }, [safeSet]);

    const removeDeliveryTimePreset = useCallback((preset) => {
        setDeliveryTimePresets(prev => {
            const updated = prev.filter(p => p !== preset);
            safeSet('deliveryTimePresets', updated);
            return updated;
        });
    }, [safeSet]);

    const setDefaultDeliveryTime = useCallback((time) => {
        setDefaultDeliveryTimeState(time);
        safeSet('defaultDeliveryTime', time);
    }, [safeSet]);

    const addTaxRatePreset = useCallback((rate) => {
        setTaxRatePresets(prev => {
            if (prev.includes(rate)) return prev;
            const updated = [...prev, rate];
            safeSet('taxRatePresets', updated);
            return updated;
        });
    }, [safeSet]);

    const removeTaxRatePreset = useCallback((rate) => {
        setTaxRatePresets(prev => {
            const updated = prev.filter(p => p !== rate);
            safeSet('taxRatePresets', updated);
            return updated;
        });
    }, [safeSet]);

    const setDefaultTaxRate = useCallback((rate) => {
        setDefaultTaxRateState(rate);
        safeSet('defaultTaxRate', rate);
    }, [safeSet]);

    // 2. Auth Syncing
    const syncCustomer = useCallback(async (authId, user) => {
        if (!supabase || !authId) {
            setCustomer(null);
            localStorage.removeItem('cached_last_profile');
            return;
        }

        setIsSyncing(true);
        try {
            console.log(`👤 Syncing customer for ${authId} (${user?.email})`);

            // Fetch by auth_id (the ideal way)
            let { data } = await supabase
                .from('customers')
                .select('*')
                .eq('auth_id', authId)
                .maybeSingle();

            // If not found, try by email
            if (!data && user?.email) {
                const { data: byEmail } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('email', user.email)
                    .maybeSingle();
                data = byEmail;
            }

            // Create if still not found
            if (!data && user) {
                const fullName = user.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
                    : user.email.split('@')[0];

                const { data: upserted } = await supabase.from('customers').upsert({
                    email: user.email,
                    auth_id: authId,
                    name: fullName,
                    first_name: user.user_metadata?.first_name || '',
                    last_name: user.user_metadata?.last_name || ''
                }, { onConflict: 'email' }).select().maybeSingle();
                data = upserted;
            }

            if (data) {
                setCustomer(data);
                // Cache it for immediate load on next visit
                safeSet('cached_last_profile', data);
            } else if (user) {
                setCustomer({ id: authId, auth_id: authId, email: user.email, name: user.email.split('@')[0] });
            }
        } catch (err) {
            console.error('❌ Customer Sync Error:', err);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const authListenerRef = useRef(null);
    useEffect(() => {
        if (!supabase) {
            setAuthResolved(true);
            return;
        }

        // Initial fetch
        fetchInitialData();

        // Listen for auth changes
        if (!authListenerRef.current) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                try {
                    console.log("🔐 Auth Event:", event);

                    // IMPORTANT: If we already have a cached customer, DO NOT block the UI 
                    // by setting authResolved to false. Just sync in the background.
                    const hasCache = !!localStorage.getItem('cached_last_profile');

                    if (session?.user) {
                        if (!hasCache) setAuthResolved(false); // Only block UI if no cache
                        await syncCustomer(session.user.id, session.user);
                    } else {
                        setCustomer(null);
                        localStorage.removeItem('cached_last_profile');
                    }
                    setAuthResolved(true);
                } catch (authErr) {
                    // Silently handle "Lock broken" / "steal" errors from IndexedDB/WebLocks
                    if (authErr.message?.includes('steal') || authErr.message?.includes('Lock')) {
                        console.warn("🔐 Auth sync suppressed due to concurrent lock (normal behavior in multi-tab):", authErr.message);
                        setAuthResolved(true);
                    } else {
                        console.error("🔐 [STORE] Auth Listener Error:", authErr);
                        setAuthResolved(true);
                    }
                }
            });
            authListenerRef.current = subscription;
        }

        return () => {
            if (authListenerRef.current) {
                authListenerRef.current.unsubscribe();
                authListenerRef.current = null;
            }
        };
    }, [fetchInitialData, syncCustomer]);

    // SMART LOADING: loading = false as soon as possible
    useEffect(() => {
        const hasCategories = categories && categories.length > 0;
        const hasProducts = rawProducts && rawProducts.length > 0;
        const hasProfileLoaded = authResolved && !isSyncing;

        // If we have cached categories, products AND auth is at least checked,
        // we can let the user into the app - they'll see 'immediate' results.
        if (hasCategories && hasProducts && authResolved) {
            setLoading(false);
            console.log("🚀 [STORE] Immediate Load Triggered (from cache/partial data)");
        }

        // Final "True" loaded state (all syncs finished)
        if (!dataLoading && authResolved && !isSyncing) {
            setLoading(false);
            console.log("✨ [STORE] Background Syncs Finished");
        }
    }, [dataLoading, authResolved, isSyncing, categories, rawProducts]);

    // 3. Per-user cart & favorites: load when customer changes, save when data changes
    useEffect(() => {
        // When customer changes (login/logout/switch), load their specific data
        const uid = customer?.auth_id || 'guest';
        try {
            const savedCart = localStorage.getItem(`cart_${uid}`);
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            setCart(Array.isArray(parsed) ? parsed : []);
        } catch { setCart([]); }
        try {
            const savedFavs = localStorage.getItem(`favorites_${uid}`);
            const parsed = savedFavs ? JSON.parse(savedFavs) : [];
            setFavorites(Array.isArray(parsed) ? parsed : []);
        } catch { setFavorites([]); }
    }, [customer?.auth_id]); // Only run when the logged-in user changes

    useEffect(() => {
        const uid = customer?.auth_id || 'guest';
        safeSet(`cart_${uid}`, cart);
    }, [cart, customer?.auth_id, safeSet]);

    useEffect(() => {
        const uid = customer?.auth_id || 'guest';
        safeSet(`favorites_${uid}`, favorites);
    }, [favorites, customer?.auth_id, safeSet]);

    useEffect(() => {
        safeSet('defaultDeliveryTime', defaultDeliveryTime);
    }, [defaultDeliveryTime, safeSet]);

    // Helper to compare variants robustly
    const isSameVariant = (v1, v2) => {
        if (!v1 && !v2) return true;
        if (!v1 || !v2) return false;
        return v1.name === v2.name && v1.price === v2.price;
    };

    const addToCart = (product, quantity = 1, selectedVariant = null) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) =>
                item.id === product.id && isSameVariant(item.selectedVariant, selectedVariant)
            );
            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} (x${quantity}) wurde im Warenkorb aktualisiert`);
                return newCart;
            }
            toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} wurde zum Warenkorb hinzugefügt`);
            return [...prevCart, { ...product, quantity, selectedVariant }];
        });
    };

    const removeFromCart = (productId, selectedVariant = null) => {
        setCart((prevCart) => prevCart.filter((item) =>
            !(item.id === productId && isSameVariant(item.selectedVariant, selectedVariant))
        ));
        toast.info('Artikel aus dem Warenkorb entfernt');
    };

    const updateQuantity = (productId, newQuantity, selectedVariant = null) => {
        if (newQuantity < 1) return;
        setCart((prevCart) => prevCart.map((item) =>
            (item.id === productId && isSameVariant(item.selectedVariant, selectedVariant))
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleFavorite = (product) => {
        setFavorites((prevFavorites) => {
            const isFav = prevFavorites.some((item) => item.id === product.id);
            if (isFav) {
                toast.info(`${product.name} aus Favoriten entfernt`);
                return prevFavorites.filter((item) => item.id !== product.id);
            }
            toast.success(`${product.name} zu Favoriten hinzugefügt`);
            return [...prevFavorites, product];
        });
    };

    const isFavorite = (productId) => favorites.some((item) => item.id === productId);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        // Note: setCustomer(null) is handled automatically by the onAuthStateChange SIGNED_OUT event
    }, []);

    const updateShopSettings = async (newSettings) => {
        try {
            setIsSyncing(true);
            console.log(`💾 [STORE] Starting High-Reliability Shop Settings Sync...`);

            // Use direct FETCH instead of supabase.upsert to prevent "Lock was stolen" errors
            const baseUrl = 'https://hhnrosczgggxelnbrhlk.supabase.co';
            const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s';

            const response = await fetch(`${baseUrl}/rest/v1/shop_settings?id=eq.1`, {
                method: 'PATCH',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    settings: newSettings,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody.message || `HTTP ${response.status}`);
            }

            // Sync successful: Update local state
            setShopSettings(newSettings);
            safeSet('shopSettings', newSettings);

            console.log(`✅ [STORE] Shop settings successfully synced via Direct REST.`);
            return true;
        } catch (error) {
            console.error('❌ [STORE] Shop settings sync failed:', error);
            throw new Error(`Sync fehlgeschlagen: ${error.message || String(error)}`);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (shopSettings?.primaryColor) {
            const color = shopSettings.primaryColor;
            let styleTag = document.getElementById('brand-styles');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'brand-styles';
                document.head.appendChild(styleTag);
            }
            if (styleTag.getAttribute('data-color') !== color) {
                styleTag.innerHTML = `
                    :root { --brand-primary: ${color}; }
                    .text-red-600 { color: ${color} !important; }
                    .bg-red-600 { background-color: ${color} !important; }
                    .border-red-600 { border-color: ${color} !important; }
                    .hover\\:bg-red-700:hover { background-color: ${color} !important; filter: brightness(0.9); }
                    .hover\\:text-red-600:hover { color: ${color} !important; }
                    .group-hover\\:text-red-600:hover { color: ${color} !important; }
                    .focus-within\\:text-red-600:focus-within { color: ${color} !important; }
                    .focus\\:ring-red-600:focus { --tw-ring-color: ${color}55 !important; }
                    .bg-red-50 { background-color: ${color}10 !important; }
                    .focus\\:border-red-600:focus { border-color: ${color} !important; }
                    .accent-red-600 { accent-color: ${color} !important; }
                    .from-red-600 { --tw-gradient-from: ${color} !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, ${color}00) !important; }
                    .to-red-800 { --tw-gradient-to: ${color} !important; }
                    ::selection { background-color: ${color}33; }
                `;
                styleTag.setAttribute('data-color', color);
            }
        }
    }, [shopSettings?.primaryColor]);

    const value = useMemo(() => ({
        products, rawProducts, categories, flatCategories, manufacturers, customer, setCustomer, isDealer, loading, cart, favorites, shopSettings,
        deliveryTimePresets, defaultDeliveryTime,
        taxRatePresets, defaultTaxRate,
        shippingRates, setShippingRates,
        setProducts, setCategories, setFlatCategories, setManufacturers,
        addToCart, removeFromCart, updateQuantity, clearCart, toggleFavorite, isFavorite, logout, updateShopSettings,
        addDeliveryTimePreset, removeDeliveryTimePreset, setDefaultDeliveryTime,
        addTaxRatePreset, removeTaxRatePreset, setDefaultTaxRate,
        refreshData: fetchInitialData
    }), [products, rawProducts, categories, flatCategories, manufacturers, customer, isDealer, setCustomer, loading, cart, favorites, shopSettings, defaultDeliveryTime, deliveryTimePresets, defaultTaxRate, taxRatePresets, shippingRates, logout, fetchInitialData, addDeliveryTimePreset, removeDeliveryTimePreset, setDefaultDeliveryTime, addTaxRatePreset, removeTaxRatePreset, setDefaultTaxRate, setManufacturers]);


    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
