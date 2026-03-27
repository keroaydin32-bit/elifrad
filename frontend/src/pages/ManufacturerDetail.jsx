import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Grid, List, Heart, Eye, ShoppingCart, Globe, Mail, Phone, Minus, Plus, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useStore } from '../context/StoreContext';
import { productPath } from '../lib/productSlug';

const ManufacturerDetail = () => {
    const { products: storeProducts, manufacturers: storeManufacturers, flatCategories, loading: storeLoading, addToCart, toggleFavorite, isFavorite } = useStore();
    const { id } = useParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

    useEffect(() => {
        setSelectedCategoryIds([]);
    }, [id]);

    // Helper: convert name to URL-friendly slug
    const toSlug = (name) => name
        ?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || '';

    if (storeLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    const statusMap = {
        'pending': 'Wartend',
        'shipped': 'Versandt',
        'completed': 'Abgeschlossen',
        'storniert': 'Storniert'
    };



    // Find manufacturer by slug (name-based) OR fallback to UUID for old links
    const manufacturer = storeManufacturers.find(m =>
        toSlug(m.name) === id || m.id.toString() === id.toString()
    );

    if (!manufacturer) {
        return (
            <div className="bg-white dark:bg-[#050505] min-h-screen text-gray-900 dark:text-white flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter shadow-sm">Hersteller nicht gefunden</h2>
                <Link to="/" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/20">
                    Zurück zur Startseite
                </Link>
            </div>
        );
    }

    // Filter products
    const manufacturerProducts = storeProducts.filter(p =>
        p.manufacturer_id === manufacturer.id ||
        (p.manufacturers && p.manufacturers.id === manufacturer.id)
    );

    // Kategorien mit Produkten (für Sidebar unter Hersteller Info) – ana ve alt kategoriler
    const categoryIdsWithProducts = new Set();
    manufacturerProducts.forEach(p => {
        const pCatIds = Array.isArray(p.category_ids) ? p.category_ids : (p.category_id ? [p.category_id] : []);
        pCatIds.forEach(id => {
            if (id) categoryIdsWithProducts.add(id);
        });
    });
    const categoriesWithProducts = (flatCategories || []).filter(c => categoryIdsWithProducts.has(c.id));

    const handleCategoryToggle = (catId) => {
        setSelectedCategoryIds(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    const resetFilters = () => setSelectedCategoryIds([]);

    // Final filtering based on selected categories
    const filteredProducts = selectedCategoryIds.length > 0
        ? manufacturerProducts.filter(p => {
            const pCatIds = Array.isArray(p.category_ids) ? p.category_ids : (p.category_id ? [p.category_id] : []);
            return pCatIds.some(id => selectedCategoryIds.includes(id));
        })
        : manufacturerProducts;

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return (b.views || 0) - (a.views || 0);
    });

    const ProductCard = ({ product, index }) => (
        <Link
            key={product.id}
            to={productPath(product)}
            className="group relative bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-red-600/10 hover:-translate-y-1 flex flex-col transform-gpu"
        >
            <div className="relative overflow-hidden aspect-square bg-gray-50 dark:bg-[#151515] flex items-center justify-center p-4">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 transform-gpu"
                />
                {product.badge && (
                    <Badge
                        className={`absolute top-2 left-2 ${product.badgeType === 'sale'
                            ? 'bg-red-600'
                            : product.badgeType === 'bundle'
                                ? 'bg-blue-600'
                                : 'bg-[#222]'
                            } text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md border-none`}
                    >
                        {product.badge}
                    </Badge>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product);
                        }}
                        className={`p-2 rounded-full transition-colors shadow-sm ${isFavorite(product.id)
                            ? 'bg-red-600 text-white'
                            : 'bg-white/10 backdrop-blur-md text-white hover:bg-red-600'
                            }`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2 group-hover:text-red-500 transition-colors leading-snug">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-base font-black text-gray-900 dark:text-white tracking-tight">{product.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-red-600">€</span></span>
                    <div className="flex text-yellow-500/80">
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
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white transition-all text-[10px] font-bold uppercase tracking-wide h-8 rounded-sm active:scale-95"
                    size="sm"
                >
                    <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                    In den Warenkorb
                </Button>
            </div>
        </Link>
    );

    const ProductListItem = ({ product, addToCart }) => {
        const [quantity, setQuantity] = useState(1);

        return (
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 mb-3 rounded-sm p-4 flex flex-col md:flex-row gap-4 items-stretch group md:min-h-[180px] hover:border-red-600/30 transition-colors">
                {/* Left: Product Image */}
                <Link to={productPath(product)} className="w-full md:w-52 h-40 md:h-full flex-shrink-0 bg-gray-50 dark:bg-[#151515] rounded-sm p-4 border border-gray-100 dark:border-white/5 group-hover:border-red-600/20 transition-all flex items-center justify-center overflow-hidden">
                    <img
                        src={product.image || (Array.isArray(product.images) ? product.images[0] : (typeof product.images === 'string' && product.images.startsWith('[') ? JSON.parse(product.images)[0] : product.images)) || 'https://placehold.co/600x600?text=Gerät'}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                </Link>

                {/* Middle: Info */}
                <div className="flex-1 flex flex-col justify-start space-y-3">
                    <Link to={productPath(product)} className="block">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors leading-tight">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Availability */}
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 uppercase">
                        <span className="text-[10px] font-bold text-gray-500 font-mono tracking-tighter">Lieferzeit:</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            </span>
                            <span>3-4 Werktage</span>
                        </div>
                    </div>

                    {/* Stars */}
                    <div className="flex text-yellow-500/20 group-hover:text-yellow-500/40 transition-colors">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-lg">★</span>
                        ))}
                    </div>
                </div>

                {/* Right: Price & Action */}
                <div className="w-full md:w-56 md:mr-4 flex flex-col justify-between items-center md:items-end text-right gap-4">
                    <div className="text-right w-full">
                        <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                            {product.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-red-600 text-lg">€</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                            inkl. MwSt. zzgl. <span className="underline cursor-pointer hover:text-red-500 font-black">Versand</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-sm overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#222] transition-colors"
                            >
                                <Minus className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </button>
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-[#222] border-x border-gray-200 dark:border-white/5">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
                            </div>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#222] transition-colors"
                            >
                                <Plus className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart({ ...product, quantity });
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10 text-[10px] font-black uppercase tracking-wider rounded-sm shadow-lg transition-all active:scale-95 px-2"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                            Kaufen
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen text-gray-600 dark:text-gray-300 transition-colors duration-500">
            {/* Breadcrumb - Match header style */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5 sticky top-0 z-10 backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <Link to="/" className="hover:text-red-600 transition-colors">Startseite</Link>
                        <ChevronRight className="w-3 h-3 text-gray-700" />
                        <Link to="/marken" className="hover:text-red-600 transition-colors">Hersteller</Link>
                        <ChevronRight className="w-3 h-3 text-gray-700" />
                        <span className="text-red-600 font-black">{manufacturer.name}</span>
                    </nav>
                </div>
            </div>

            {/* Manufacturer Header */}
            <div className="bg-gray-50 dark:bg-[#050505] mb-8">
                <div className="container mx-auto px-4 pt-8">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-md shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        {/* Banner Area */}
                        {manufacturer.banner_url ? (
                            <div className="w-full h-40 md:h-72 relative">
                                <img
                                    src={manufacturer.banner_url}
                                    alt={`${manufacturer.name} Banner`}
                                    className="w-full h-full object-cover grayscale-[0.3] brightness-[0.7] transition-all duration-700 hover:grayscale-0 hover:brightness-100"
                                    style={{ objectPosition: manufacturer.banner_position || '50% 50%' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/50 to-transparent"></div>
                            </div>
                        ) : (
                            <div className="w-full h-24 bg-gradient-to-r from-red-900/20 to-transparent"></div>
                        )}

                        <div className="px-6 md:px-12 pb-10">
                            {/* Logo and Info Row */}
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                                {/* Logo Overlap */}
                                <div className="relative z-20 -mt-16 md:-mt-24 flex-shrink-0">
                                    <div className="w-36 h-36 md:w-56 md:h-56 bg-white dark:bg-[#111] rounded-lg shadow-2xl flex items-center justify-center p-6 border border-gray-100 dark:border-white/10 shrink-0 transform-gpu hover:scale-[1.02] transition-transform duration-300">
                                        <img
                                            src={manufacturer.logo_url || manufacturer.logo}
                                            alt={manufacturer.name}
                                            className="max-w-full max-h-full object-contain filter brightness-110"
                                        />
                                    </div>
                                </div>

                                {/* Info Section Beside Logo */}
                                <div className="text-center md:text-left pt-2 md:pb-4 flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{manufacturer.name}</h1>
                                            <Badge className="bg-red-600/10 text-red-600 dark:text-red-500 border border-red-500/20 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Official Partner</Badge>
                                        </div>
                                        {manufacturer.description && (
                                            <div
                                                className="prose prose-invert prose-red text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl mt-4 line-clamp-3 md:line-clamp-none"
                                                dangerouslySetInnerHTML={{ __html: manufacturer.description }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        {manufacturer.website && (
                                            <a
                                                href={manufacturer.website.startsWith('http') ? manufacturer.website : `https://${manufacturer.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-widest bg-red-600 px-5 py-2.5 rounded-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 shadow-red-600/20"
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                                <span>Website besuchen</span>
                                            </a>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar / Info */}
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        <div className="bg-white dark:bg-[#0a0a0a] p-8 rounded-md shadow-sm dark:shadow-xl border border-gray-100 dark:border-white/5 sticky top-24">
                            <h3 className="font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/5 pb-3 uppercase text-xs tracking-[0.2em]">Hersteller Info</h3>
                            <div className="space-y-5 text-sm">
                                {manufacturer.email && (
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/10 transition-colors border border-white/5 group-hover:border-red-600/20">
                                            <Mail className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">E-Mail Address</span>
                                            <span className="text-gray-300 font-medium truncate max-w-[180px]">{manufacturer.email}</span>
                                        </div>
                                    </div>
                                )}
                                {manufacturer.phone && (
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/10 transition-colors border border-white/5 group-hover:border-red-600/20">
                                            <Phone className="w-3.5 h-3.5 text-red-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Support Line</span>
                                            <span className="text-gray-300 font-medium">{manufacturer.phone}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-6 border-t border-gray-100 dark:border-white/5 mt-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-100 dark:border-white/5">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-black tracking-widest block mb-1">Portfolio</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium font-bold uppercase tracking-tighter">Originalprodukte</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-gray-900 dark:text-white">{manufacturerProducts.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kategorien mit Produkten */}
                        {categoriesWithProducts.length > 0 && (
                            <div className="bg-white dark:bg-[#0a0a0a] p-8 rounded-md shadow-sm dark:shadow-xl border border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-white/5 pb-3">
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-[0.2em]">Kategorien</h3>
                                    {selectedCategoryIds.length > 0 && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-[10px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors"
                                        >
                                            Zurücksetzen
                                        </button>
                                    )}
                                </div>
                                <ul className="space-y-1">
                                    {categoriesWithProducts.map(cat => (
                                        <li key={cat.id}>
                                            <label className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all cursor-pointer group hover:bg-gray-50 dark:hover:bg-white/5 ${cat.parent_id ? 'pl-6' : ''}`}>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategoryIds.includes(cat.id)}
                                                        onChange={() => handleCategoryToggle(cat.id)}
                                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 dark:border-white/10 checked:bg-red-600 checked:border-red-600 transition-all"
                                                    />
                                                    <CheckCircle className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5" />
                                                </div>
                                                <span className={`${cat.parent_id ? 'text-xs text-gray-500' : 'text-sm text-gray-800 dark:text-gray-300 font-bold'} group-hover:text-red-500 transition-colors uppercase tracking-tight`}>
                                                    {cat.name}
                                                </span>
                                                <span className="ml-auto text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                                                    {manufacturerProducts.filter(p => {
                                                        const pCatIds = Array.isArray(p.category_ids) ? p.category_ids : (p.category_id ? [p.category_id] : []);
                                                        return pCatIds.includes(cat.id);
                                                    }).length}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-md shadow-sm dark:shadow-xl border border-gray-100 dark:border-white/5 mb-8 sticky top-16 md:static z-0">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">

                                    <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xl">
                                        Produkte von <span className="text-red-600">{manufacturer.name}</span>
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-widest rounded-sm focus:ring-red-600 focus:border-red-600 block w-full p-2.5 outline-none hover:bg-gray-200 dark:hover:bg-[#151515] transition-colors cursor-pointer"
                                        >
                                            <option value="relevance">RELEVANZ</option>
                                            <option value="price-asc">PREIS (NIEDRIG)</option>
                                            <option value="price-desc">PREIS (HOCH)</option>
                                            <option value="name-asc">NAME (A-Z)</option>
                                            <option value="name-desc">NAME (Z-A)</option>
                                        </select>
                                    </div>

                                    <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-sm border border-gray-200 dark:border-white/5">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#222] text-red-600 dark:text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-400'}`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#222] text-red-600 dark:text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-400'}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {sortedProducts.length > 0 ? (
                            <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                                {sortedProducts.map((product, index) => (
                                    viewMode === 'grid' ? (
                                        <ProductCard key={product.id} product={product} index={index} />
                                    ) : (
                                        <ProductListItem
                                            key={product.id}
                                            product={product}
                                            addToCart={addToCart}
                                        />
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-white dark:bg-[#0a0a0a]/50 rounded-md border border-dashed border-gray-200 dark:border-white/10">
                                <Eye className="w-12 h-12 text-gray-200 dark:text-white/10 mx-auto mb-4" />
                                <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Momentan keine Produkte verfügbar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManufacturerDetail;
