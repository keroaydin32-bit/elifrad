import React, { useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';

const AllCategoriesPage = () => {
    const { flatCategories, products, rawProducts } = useStore();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categoriesData = useMemo(() => {
        if (!flatCategories || flatCategories.length === 0) return [];

        const allProducts = rawProducts || products || [];

        // Return a list of all descendant category ids inclusive
        const getAllCategoryIdsRecursive = (catId) => {
            let ids = [catId];
            flatCategories.filter(c => c.parent_id === catId).forEach(sub => {
                ids = [...ids, ...getAllCategoryIdsRecursive(sub.id)];
            });
            return ids;
        };

        const getCount = (catId) => {
            const ids = getAllCategoryIdsRecursive(catId);
            return allProducts.filter(p => p.is_active && ids.includes(p.category_id)).length;
        };

        const roots = flatCategories
            .filter(c => !c.parent_id)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        return roots.map(root => {
            const subCategories = flatCategories
                .filter(c => c.parent_id === root.id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map(sub => ({
                    ...sub,
                    count: getCount(sub.id)
                }));

            return {
                ...root,
                count: getCount(root.id),
                subCategories
            };
        });
    }, [flatCategories, products, rawProducts]);

    return (
        <div className="min-h-screen bg-[#fafafb] dark:bg-[#050505] py-12 sm:py-20 transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-[1400px]">
                {/* Header section */}
                <div className="mb-12 sm:mb-16">
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-4 justify-center">
                        <Link to="/" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Startseite</Link>
                        <span className="opacity-30">/</span>
                        <span className="text-gray-900 dark:text-white">Alle Kategorien</span>
                    </nav>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 text-center uppercase">
                        Unsere <span className="text-red-600">Kategorien</span>
                    </h1>
                    <div className="w-12 h-1 bg-red-600 mx-auto"></div>
                </div>

                {/* Masonry-like CSS columns layout */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                    {categoriesData.map(root => (
                        <div
                            key={root.id}
                            className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100/60 dark:border-white/5 p-8 lg:p-10 mb-8 break-inside-avoid group/card hover:border-red-600/30 dark:hover:border-red-500/30 transition-all duration-500"
                        >
                            <Link
                                to={`/category/${root.slug || root.id}`}
                                className="flex items-center justify-between mb-8 group cursor-pointer"
                            >
                                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors uppercase">
                                    {root.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-gray-400 dark:text-gray-600">
                                        [{root.count}]
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-red-600 dark:group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>

                            {root.subCategories.length > 0 && (
                                <ul className="space-y-4">
                                    {root.subCategories.map(sub => (
                                        <li key={sub.id}>
                                            <Link
                                                to={`/category/${root.slug || root.id}/${sub.slug || sub.id}`}
                                                className="flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0 group-hover:bg-red-500 transition-all group-hover:scale-150"></div>
                                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-500 transition-all pr-4">
                                                        {sub.name}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-black text-gray-300 dark:text-gray-800 group-hover:text-red-400 dark:group-hover:text-red-400/50 transition-colors shrink-0">
                                                    {sub.count}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllCategoriesPage;
