import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, MapPin, Globe, Mail, Phone, ExternalLink, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';

const AllManufacturersPage = () => {
    const { manufacturers, products } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const toSlug = (name) => name
        ?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || '';

    // Get product count for each manufacturer
    const getProductCount = (manufacturerId) => {
        return products.filter(p => p.manufacturer_id === manufacturerId).length;
    };

    const filteredManufacturers = manufacturers.filter(m =>
        (m.is_active !== false) && m.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    // Group by first letter for a directory-style view
    const groupedManufacturers = filteredManufacturers.reduce((acc, m) => {
        const firstLetter = m.name[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(m);
        return acc;
    }, {});

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen transition-colors duration-500">
            {/* Hero Section */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b dark:border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 bg-red-600/5" />
                <div className="container mx-auto px-4 py-16 relative">
                    <div className="max-w-3xl">
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-6">
                            <Link to="/" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Startseite</Link>
                            <span className="opacity-30">/</span>
                            <span className="text-gray-900 dark:text-white">Alle Marken</span>
                        </nav>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6 leading-none">
                            Unsere <span className="text-red-600">Hersteller</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                            Entdecken Sie erstklassige Produkte unserer Partnermarken. Von E-Bikes bis hin zu hochwertigem Zubehör – wir arbeiten nur mit den Besten der Branche zusammen.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 pb-32">
                {/* Search & Navigation */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-xl shadow-gray-200/50 dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Marke suchen..."
                            className="pl-12 h-12 bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/10 rounded-lg focus:ring-red-600 text-gray-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                        {alphabet.map(letter => (
                            <button
                                key={letter}
                                onClick={() => {
                                    const element = document.getElementById(`letter-${letter}`);
                                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className={`w-8 h-10 flex items-center justify-center text-lg font-black transition-all duration-300 ${groupedManufacturers[letter]
                                    ? 'text-red-600 dark:text-red-500 hover:scale-125 hover:text-red-700 dark:hover:text-red-400 cursor-pointer'
                                    : 'text-gray-200 dark:text-gray-800 cursor-not-allowed'
                                    }`}
                                disabled={!groupedManufacturers[letter]}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Manufacturers List */}
                <div className="space-y-24">
                    {Object.keys(groupedManufacturers).length > 0 ? (
                        Object.keys(groupedManufacturers).sort().map(letter => (
                            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="w-16 h-16 bg-red-600 flex items-center justify-center rounded-xl shadow-lg">
                                        <span className="text-3xl font-black text-white uppercase">{letter}</span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-red-600/50 to-transparent flex-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {groupedManufacturers[letter].map((brand) => (
                                        <Link
                                            key={brand.id}
                                            to={`/hersteller/${toSlug(brand.name)}`}
                                            className="group bg-white dark:bg-[#0a0a0a] rounded-lg p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-red-600/5 dark:hover:shadow-red-600/10 hover:border-red-600 dark:hover:border-red-500/50 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
                                        >
                                            {/* Logo Container - White background kept for black logo visibility even in dark mode */}
                                            <div className="w-32 h-32 bg-white flex items-center justify-center p-6 mb-6 rounded-lg border border-gray-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                <img
                                                    src={brand.logo_url}
                                                    alt={brand.name}
                                                    className="max-w-full max-h-full object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                />
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                                                {brand.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full transition-colors group-hover:bg-red-50 dark:group-hover:bg-red-500/10 group-hover:text-red-600 dark:group-hover:text-red-500">
                                                <ArrowRight className="w-3 h-3" />
                                                {getProductCount(brand.id)} Produkte
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 w-full flex items-center justify-center gap-6 text-gray-400 dark:text-gray-600">
                                                {brand.website && <Globe className="w-4 h-4 hover:text-red-600 dark:hover:text-red-500 transition-colors" />}
                                                {brand.email && <Mail className="w-4 h-4 hover:text-red-600 dark:hover:text-red-500 transition-colors" />}
                                                {brand.phone && <Phone className="w-4 h-4 hover:text-red-600 dark:hover:text-red-500 transition-colors" />}
                                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white dark:bg-[#0a0a0a] rounded-lg border border-dashed border-gray-200 dark:border-white/10">
                            <Search className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-sm">Keine Hersteller unter "{searchTerm}" gefunden.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllManufacturersPage;
