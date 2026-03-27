import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Grid, List, Eye, GitCompare, Heart, ShoppingCart, Minus, Plus, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useStore } from '../context/StoreContext';
import { productPath } from '../lib/productSlug';

const ProductCard = ({ product, addToCart, toggleFavorite, isFavorite }) => {
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
            className="group relative bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden aspect-square bg-white dark:bg-[#111] p-4">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
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
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 h-10 leading-snug">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1 h-4">
                    {product.description?.replace(/<[^>]*>?/gm, '')}
                </p>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-black text-gray-900 dark:text-white">{(product.price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
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

const ProductListItem = ({ product, addToCart }) => {
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
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-lg p-4 mb-4 flex flex-col md:flex-row gap-4 items-stretch group md:min-h-[180px] shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all">
            <Link to={`/product/${product.id}`} className="w-full md:w-52 h-40 md:h-full flex-shrink-0 bg-white dark:bg-[#111] rounded-lg p-2 border border-transparent group-hover:border-gray-100 dark:group-hover:border-white/10 transition-all flex items-center justify-center overflow-hidden">
                <img
                    src={product.image || (productImages.length > 0 ? productImages[0] : (product.image_url || 'https://placehold.co/600x600?text=Gerät'))}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
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
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{(product.price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR</span>
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

const SearchPage = () => {
    const { products: storeProducts, loading: storeLoading, addToCart, toggleFavorite, isFavorite } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('relevance');

    const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
    const searchQuery = queryParams.get('q') || '';
    const selectedCategory = queryParams.get('category') || 'all';

    const results = React.useMemo(() => {
        if (!storeProducts || !searchQuery) return [];

        const query = searchQuery.toLowerCase().trim();
        return storeProducts.filter(product => {
            const nameMatch = product.name?.toLowerCase().includes(query);
            const skuMatch = product.sku?.toLowerCase().includes(query);
            const descMatch = product.description?.toLowerCase().includes(query);
            const matchesSearch = nameMatch || skuMatch || descMatch;

            if (selectedCategory === 'all') return matchesSearch;

            const prodCat = product.categories;
            if (!prodCat) return false;

            const categorySlug = prodCat.slug || prodCat.name?.toLowerCase().replace(/\s+/g, '-');
            return matchesSearch && categorySlug === selectedCategory;
        });
    }, [searchQuery, selectedCategory, storeProducts]);

    if (storeLoading && results.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    const sortProducts = (productsToSort) => {
        return [...productsToSort].sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
            return (b.views || 0) - (a.views || 0);
        });
    };

    const sortedResults = sortProducts(results);

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen transition-colors duration-500">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-[#050505] border-b border-gray-200 dark:border-white/10 transition-colors">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Link to="/" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Startseite</Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium font-bold">Suchergebnisse</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4 border-l-4 border-red-600 pl-4">
                        Suche: "{searchQuery}"
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {results.length} Ergebnisse für "{searchQuery}" gefunden.
                    </p>
                </div>

                {results.length > 0 ? (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-lg flex items-center justify-between shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sortieren nach:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border-none bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white rounded-md px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none"
                                >
                                    <option value="relevance">Relevanz</option>
                                    <option value="price-asc">Preis (aufsteigend)</option>
                                    <option value="price-desc">Preis (absteigend)</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                </select>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
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

                        {/* Results Grid */}
                        <div className={`grid gap-3 md:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                            {sortedResults.map((product) => (
                                viewMode === 'grid' ? (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        addToCart={addToCart}
                                        toggleFavorite={toggleFavorite}
                                        isFavorite={isFavorite}
                                    />
                                ) : (
                                    <ProductListItem
                                        key={product.id}
                                        product={product}
                                        addToCart={addToCart}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                        <div className="bg-gray-50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <SearchIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Leider wurden keine Ergebnisse gefunden</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Wir konnten keine Übereinstimmungen für Ihre Suche finden. Bitte versuchen Sie es mit anderen Suchbegriffen oder stöbern Sie in unseren Kategorien.
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 h-auto text-lg font-bold"
                        >
                            Zur Startseite
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
